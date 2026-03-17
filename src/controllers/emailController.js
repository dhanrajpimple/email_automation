const { z } = require("zod");
const { sendEmailWithType } = require("../services/emailService");

const bodySchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  text: z.string().min(1),
});

function validateBody(req) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    const err = new Error("Invalid request body. Expected: to, subject, text");
    err.statusCode = 400;
    err.details = parsed.error.flatten();
    throw err;
  }

  return parsed.data;
}

async function sendNormalEmail(req, res, next) {
  try {
    const { to, subject, text } = validateBody(req);
    const result = await sendEmailWithType({
      type: "normal",
      to,
      subject,
      text,
    });
    res.status(200).json({ ok: true, result });
  } catch (err) {
    next(err);
  }
}

async function sendFreelancingEmail(req, res, next) {
  try {
    const { to, subject, text } = validateBody(req);
    const result = await sendEmailWithType({
      type: "freelancing",
      to,
      subject,
      text,
    });
    res.status(200).json({ ok: true, result });
  } catch (err) {
    next(err);
  }
}

async function sendAgentEmail(req, res, next) {
  try {
    const { to, subject, text } = validateBody(req);
    const result = await sendEmailWithType({
      type: "agent",
      to,
      subject,
      text,
    });
    res.status(200).json({ ok: true, result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendNormalEmail,
  sendFreelancingEmail,
  sendAgentEmail,
};
