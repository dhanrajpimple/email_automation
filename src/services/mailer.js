const nodemailer = require("nodemailer");

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

function getTransportForType(type) {
  if (type === "normal") {
    const user = requiredEnv("NORMAL_GMAIL_USER");
    const pass = requiredEnv("NORMAL_GMAIL_APP_PASSWORD");
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      }),
      fromEmail: user,
    };
  }

  if (type === "freelancing") {
    const user = requiredEnv("FREELANCE_GMAIL_USER");
    const pass = requiredEnv("FREELANCE_GMAIL_APP_PASSWORD");
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      }),
      fromEmail: user,
    };
  }

  if (type === "agent") {
    const user = requiredEnv("AGENT_EMAIL");
    const pass = requiredEnv("AGENT_KEY");
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      }),
      fromEmail: user,
    };
  }

  throw new Error(`Unsupported email type: ${type}`);
}

module.exports = {
  getTransportForType,
};
