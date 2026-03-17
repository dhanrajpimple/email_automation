const nodemailer = require("nodemailer");

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

function createGmailTransporter(user, pass) {
  // Switching to Port 587 (STARTTLS) which is often more reliable in cloud environments than 465
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Must be false for port 587; STARTTLS will upgrade it
    auth: {
      user: user,
      pass: pass, // This MUST be a Gmail App Password
    },
    // Cloud environments (Render/Docker) can have ephemeral networks. 
    // Disabling pool to ensure a fresh connection for each send while debugging.
    pool: false,
    // Short timeouts are CRITICAL to prevent the "2-minute hang"
    connectionTimeout: 10000, // 10s
    greetingTimeout: 10000, 
    socketTimeout: 20000, // 20s
    debug: true, // Enable to see actual handshake in logs
    logger: true, // Log to console
  });
}

function getTransportForType(type) {
  if (type === "normal") {
    const user = requiredEnv("NORMAL_GMAIL_USER");
    const pass = requiredEnv("NORMAL_GMAIL_APP_PASSWORD");
    return {
      transporter: createGmailTransporter(user, pass),
      fromEmail: user,
    };
  }

  if (type === "freelancing") {
    const user = requiredEnv("FREELANCE_GMAIL_USER");
    const pass = requiredEnv("FREELANCE_GMAIL_APP_PASSWORD");
    return {
      transporter: createGmailTransporter(user, pass),
      fromEmail: user,
    };
  }

  if (type === "agent") {
    const user = requiredEnv("AGENT_EMAIL");
    const pass = requiredEnv("AGENT_KEY");
    return {
      transporter: createGmailTransporter(user, pass),
      fromEmail: user,
    };
  }

  throw new Error(`Unsupported email type: ${type}`);
}

module.exports = {
  getTransportForType,
};
