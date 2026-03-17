const nodemailer = require("nodemailer");

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

function createGmailTransporter(user, pass) {
  // Trying Port 465 with secure: true
  // Many cloud providers (like Render) block port 587 but occasionally allow 465 (SSL)
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL for port 465
    auth: {
      user: user,
      pass: pass,
    },
    // Keep internal pooling off for debugging
    pool: false,
    // Slightly longer timeouts for cloud cold-starts
    connectionTimeout: 20000, // 20s
    greetingTimeout: 20000, 
    socketTimeout: 30000, 
    debug: true,
    logger: true,
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
