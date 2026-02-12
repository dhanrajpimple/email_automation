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
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  if (type === "freelancing") {
    const user = requiredEnv("FREELANCE_GMAIL_USER");
    const pass = requiredEnv("FREELANCE_GMAIL_APP_PASSWORD");
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  throw new Error(`Unsupported email type: ${type}`);
}

module.exports = {
  getTransportForType,
};
