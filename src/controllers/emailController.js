const { z } = require("zod");
const { sendEmailWithType } = require("../services/emailService");

function normalizeAttachments(value) {
  if (value === undefined || value === null || value === "") return undefined;

  let v = value;

  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return v;
    }
  }

  if (Array.isArray(v)) return v;
  if (typeof v === "object") return [v];
  return v;
}

const attachmentSchema = z.object({
  filename: z.string().min(1),
  contentBase64: z.string().min(1),
  contentType: z.string().min(1).optional(),
});

const bodySchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).optional(),
  heading: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  textTemplate: z.string().min(1).optional(),
  html: z.string().min(1).optional(),
  htmlTemplate: z.string().min(1).optional(),
  resume: z.boolean().optional(),
  attachment: z.preprocess(normalizeAttachments, z.array(attachmentSchema).optional()),
  attachments: z.preprocess(normalizeAttachments, z.array(attachmentSchema).optional()),
});

function validateBody(req) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    const err = new Error("Invalid request body");
    err.statusCode = 400;
    err.details = parsed.error.flatten();
    throw err;
  }

  const subject = parsed.data.subject || parsed.data.heading;
  const text = parsed.data.text || parsed.data.textTemplate;
  const html = parsed.data.html || parsed.data.htmlTemplate;

  if (!subject) {
    const err = new Error("Provide subject (or heading)");
    err.statusCode = 400;
    throw err;
  }

  if (!text && !html) {
    const err = new Error("Provide at least one of: text/textTemplate, html/htmlTemplate");
    err.statusCode = 400;
    throw err;
  }

  return {
    to: parsed.data.to,
    subject,
    text,
    html,
    attachments: parsed.data.attachments || parsed.data.attachment,
    resume: Boolean(parsed.data.resume),
  };
}

async function sendNormalEmail(req, res, next) {
  try {
    const { to, subject, text, html, attachments, resume } = validateBody(req);
    const result = await sendEmailWithType({
      type: "normal",
      to,
      subject,
      text,
      html,
      attachments,
      resume,
    });
    res.status(200).json({ ok: true, result });
  } catch (err) {
    next(err);
  }
}

async function sendFreelancingEmail(req, res, next) {
  try {
    const { to, subject, text, html, attachments, resume } = validateBody(req);
    const result = await sendEmailWithType({
      type: "freelancing",
      to,
      subject,
      text,
      html,
      attachments,
      resume,
    });
    res.status(200).json({ ok: true, result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendNormalEmail,
  sendFreelancingEmail,
};
