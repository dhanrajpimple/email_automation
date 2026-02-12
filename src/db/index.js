const mongoose = require("mongoose");

let initialized = false;

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

async function initDb() {
  if (initialized) return;
  const uri = requiredEnv("MONGODB_URI");

  await mongoose.connect(uri, {
    autoIndex: true,
  });

  initialized = true;
}

module.exports = {
  initDb,
};
