const nodemailer = require("nodemailer");

const EMAIL_TIMEOUT_MS = 8_000;

function getSmtpConfig() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = String(process.env.SMTP_PASS || process.env.EMAIL_PASS || "").replace(/\s/g, "");
  if (!user || !pass) return null;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host.includes("gmail.com") && !process.env.SMTP_HOST) {
    return {
      transport: { service: "gmail", auth: { user, pass } },
      from: process.env.SMTP_FROM || user
    };
  }

  return {
    transport: {
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: EMAIL_TIMEOUT_MS,
      greetingTimeout: EMAIL_TIMEOUT_MS,
      socketTimeout: EMAIL_TIMEOUT_MS
    },
    from: process.env.SMTP_FROM || user
  };
}

function buildResetEmailHtml(resetUrl) {
  return `
    <h2>Đặt lại mật khẩu</h2>
    <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới (có hiệu lực trong 1 giờ):</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  `;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} quá thời gian chờ (${ms}ms)`)), ms);
    })
  ]);
}

/** Resend dùng HTTPS — hoạt động trên Render (SMTP Gmail thường bị chặn). */
async function sendViaResend(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.RESEND_FROM || "TZONE <onboarding@resend.dev>";
  const res = await withTimeout(
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to, subject, html })
    }),
    EMAIL_TIMEOUT_MS,
    "Resend API"
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body || res.statusText}`);
  }

  console.log(`[mailer] Resend: đã gửi email tới ${to}`);
  return true;
}

async function sendViaSmtp(to, subject, html) {
  const smtp = getSmtpConfig();
  if (!smtp) return false;

  const transporter = nodemailer.createTransport({
    ...smtp.transport,
    connectionTimeout: EMAIL_TIMEOUT_MS,
    greetingTimeout: EMAIL_TIMEOUT_MS,
    socketTimeout: EMAIL_TIMEOUT_MS
  });

  await withTimeout(
    transporter.sendMail({ from: smtp.from, to, subject, html }),
    EMAIL_TIMEOUT_MS,
    "SMTP"
  );

  console.log(`[mailer] SMTP: đã gửi email tới ${to}`);
  return true;
}

async function sendResetPasswordEmail(to, resetUrl) {
  const subject = "TZONE Toeic — Đặt lại mật khẩu";
  const html = buildResetEmailHtml(resetUrl);

  try {
    if (process.env.RESEND_API_KEY) {
      const sent = await sendViaResend(to, subject, html);
      if (sent) return true;
    }

    // Render chặn cổng SMTP 587/465 — không dùng Gmail SMTP trên production Render
    if (process.env.RENDER) {
      console.warn(
        "[mailer] Render chặn SMTP. Đặt RESEND_API_KEY trên Render Environment để gửi email. Reset URL:",
        resetUrl
      );
      return false;
    }

    const sent = await sendViaSmtp(to, subject, html);
    if (!sent) {
      console.warn("[mailer] EMAIL_USER / EMAIL_PASS chưa cấu hình — không gửi được email.");
    }
    return sent;
  } catch (err) {
    console.error("[mailer] Gửi email thất bại:", err.message);
    console.error("[mailer] Reset URL (fallback):", resetUrl);
    return false;
  }
}

module.exports = { sendResetPasswordEmail, getSmtpConfig };
