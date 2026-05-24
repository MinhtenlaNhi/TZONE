const nodemailer = require("nodemailer");

const EMAIL_TIMEOUT_MS = 12_000;

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

function getSenderEmail() {
  return (
    process.env.BREVO_FROM ||
    process.env.SENDGRID_FROM ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    ""
  ).trim();
}

function getSenderName() {
  return process.env.BREVO_FROM_NAME || process.env.SENDGRID_FROM_NAME || "TZONE";
}

function buildResetEmailHtml(resetUrl) {
  return `
    <h2>Đặt lại mật khẩu</h2>
    <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới (có hiệu lực trong 1 giờ):</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
  `;
}

function buildResetEmailText(resetUrl) {
  return `Đặt lại mật khẩu TZONE\n\nLink (hiệu lực 1 giờ): ${resetUrl}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} quá thời gian chờ (${ms}ms)`)), ms);
    })
  ]);
}

/** Brevo (HTTPS) — free 300 email/ngày, gửi mọi địa chỉ sau khi verify sender 1 lần. */
async function sendViaBrevo(to, subject, html, text) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  const fromEmail = getSenderEmail();
  if (!fromEmail) {
    throw new Error("Thiếu BREVO_FROM hoặc EMAIL_USER (email đã verify trên Brevo).");
  }

  const res = await withTimeout(
    fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        sender: { name: getSenderName(), email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text
      })
    }),
    EMAIL_TIMEOUT_MS,
    "Brevo API"
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo ${res.status}: ${body || res.statusText}`);
  }

  console.log(`[mailer] Brevo: đã gửi email tới ${to}`);
  return true;
}

async function sendViaSendGrid(to, subject, html, text) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return false;

  const fromEmail = getSenderEmail();
  if (!fromEmail) {
    throw new Error("Thiếu SENDGRID_FROM hoặc EMAIL_USER (email đã verify trên SendGrid).");
  }

  const res = await withTimeout(
    fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: fromEmail, name: getSenderName() },
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html }
        ]
      })
    }),
    EMAIL_TIMEOUT_MS,
    "SendGrid API"
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`SendGrid ${res.status}: ${body || res.statusText}`);
  }

  console.log(`[mailer] SendGrid: đã gửi email tới ${to}`);
  return true;
}

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

async function sendViaSmtp(to, subject, html, text) {
  const smtp = getSmtpConfig();
  if (!smtp) return false;

  const transporter = nodemailer.createTransport({
    ...smtp.transport,
    connectionTimeout: EMAIL_TIMEOUT_MS,
    greetingTimeout: EMAIL_TIMEOUT_MS,
    socketTimeout: EMAIL_TIMEOUT_MS
  });

  await withTimeout(
    transporter.sendMail({ from: smtp.from, to, subject, text, html }),
    EMAIL_TIMEOUT_MS,
    "SMTP"
  );

  console.log(`[mailer] SMTP: đã gửi email tới ${to}`);
  return true;
}

function getActiveProviders() {
  const list = [];
  if (process.env.BREVO_API_KEY) list.push("Brevo");
  if (process.env.SENDGRID_API_KEY) list.push("SendGrid");
  if (process.env.RESEND_API_KEY) list.push("Resend");
  if (getSmtpConfig() && !process.env.RENDER) list.push("SMTP");
  return list;
}

async function sendResetPasswordEmail(to, resetUrl) {
  const subject = "TZONE Toeic — Đặt lại mật khẩu";
  const html = buildResetEmailHtml(resetUrl);
  const text = buildResetEmailText(resetUrl);

  console.log(`[mailer] Gửi reset password → ${to} | providers: ${getActiveProviders().join(", ") || "none"}`);

  try {
    if (process.env.BREVO_API_KEY) {
      const sent = await sendViaBrevo(to, subject, html, text);
      if (sent) return true;
    }

    if (process.env.SENDGRID_API_KEY) {
      const sent = await sendViaSendGrid(to, subject, html, text);
      if (sent) return true;
    }

    if (process.env.RESEND_API_KEY) {
      const sent = await sendViaResend(to, subject, html);
      if (sent) return true;
    }

    if (process.env.RENDER) {
      console.warn(
        "[mailer] Render chặn SMTP. Cần BREVO_API_KEY hoặc SENDGRID_API_KEY trên Environment. Reset URL:",
        resetUrl
      );
      return false;
    }

    const sent = await sendViaSmtp(to, subject, html, text);
    if (!sent) {
      console.warn("[mailer] Không có provider email nào được cấu hình.");
    }
    return sent;
  } catch (err) {
    console.error("[mailer] Gửi email thất bại:", err.message);
    console.error("[mailer] Reset URL (fallback):", resetUrl);
    return false;
  }
}

module.exports = { sendResetPasswordEmail, getSmtpConfig, getActiveProviders };
