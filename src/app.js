const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const emailRoutes = require("./routes/emailRoutes");

const app = express();

app.use(express.json({ limit: "15mb" }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    // eslint-disable-next-line no-console
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
  });
  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/email", emailRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.message || "Internal Server Error",
    details: err.details,
  });
});

module.exports = app;
