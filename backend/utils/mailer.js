function getMailerConfig() {
  return {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "no-reply@example.com"
  };
}

async function sendMail({ to, subject, html, text }) {
  const config = getMailerConfig();

  if (!config.host || !config.user || !config.pass) {
    return {
      success: false,
      queued: false,
      message: "Mailer not configured. Set SMTP_* variables to enable email sending."
    };
  }

  // Stub for Phase 2 wiring. Real SMTP transport will be added in Fees module.
  console.log("Email stub invoked", {
    to,
    subject,
    hasHtml: Boolean(html),
    hasText: Boolean(text)
  });

  return {
    success: true,
    queued: true,
    message: "Email accepted by stub mailer."
  };
}

module.exports = { getMailerConfig, sendMail };
