const nodemailer = require("nodemailer");

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
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000
    },
    from: process.env.SMTP_FROM || user
  };
}

async function sendResetPasswordEmail(to, resetUrl) {
  const smtp = getSmtpConfig();
  if (!smtp) {
    console.warn("[mailer] EMAIL_USER / EMAIL_PASS chưa cấu hình — không gửi được email.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    ...smtp.transport,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });

  await transporter.sendMail({
    from: smtp.from,
    to,
    subject: "TZONE Toeic — Đặt lại mật khẩu",
    html: `
      <h2>Đặt lại mật khẩu</h2>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới (có hiệu lực trong 1 giờ):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    `
  });

  console.log(`[mailer] Đã gửi email đặt lại mật khẩu tới ${to}`);
  return true;
}

module.exports = { sendResetPasswordEmail, getSmtpConfig };
