const { getTransportForType } = require("./mailer");
const {
  hasAnyExisting,
  createPendingLog,
  markEmailLogSent,
  deleteEmailLog,
} = require("../db/emailLogRepo");
const fs = require("fs");
const path = require("path");

function mapAttachments(attachments) {
  if (!attachments || !Array.isArray(attachments)) return undefined;

  return attachments.map((a) => {
    const att = {
      filename: a.filename,
    };

    if (a.contentBase64) {
      att.content = Buffer.from(a.contentBase64, "base64");
    }

    if (a.contentType) {
      att.contentType = a.contentType;
    }

    return att;
  });
}

async function sendEmailWithType({
  type,
  to,
  subject,
  text,
  html,
  attachments,
  resume,
  attachmentUrl,
  attachmentFilename,
}) {
  // eslint-disable-next-line no-console
  console.log(`sendEmailWithType start: type='${type}' to='${to}' subject='${subject}' attachments=${Array.isArray(attachments) ? attachments.length : 0}`);

  const already = await hasAnyExisting({ toEmail: to, type });
  if (already) {
    // eslint-disable-next-line no-console
    console.log(`sendEmailWithType duplicate blocked: type='${type}' to='${to}'`);
    const err = new Error(`Email already sent before for type='${type}' to '${to}'`);
    err.statusCode = 409;
    throw err;
  }

  const logId = await createPendingLog({
    toEmail: to,
    type,
    subject,
  });

  try {
    const allAttachments = [];
    const mapped = mapAttachments(attachments);
    if (mapped && mapped.length) allAttachments.push(...mapped);

    if (resume) {
      const resumePath = path.resolve(process.cwd(), "public", "Dhanraj_Pimple_Resume.pdf");
      if (!fs.existsSync(resumePath)) {
        const err = new Error("Dhanraj_Pimple_Resume.pdf not found in public folder");
        err.statusCode = 400;
        throw err;
      }

      allAttachments.push({
        filename: "Dhanraj_Pimple_Resume.pdf",
        path: resumePath,
        contentType: "application/pdf",
      });
    }

    const transporter = getTransportForType(type);
    const info = await transporter.sendMail({
      to,
      subject,
      text,
      html,
      attachments: allAttachments.length ? allAttachments : undefined,
    });

    // eslint-disable-next-line no-console
    console.log(`sendEmailWithType sent: type='${type}' to='${to}' messageId='${info.messageId || ""}'`);

    await markEmailLogSent({
      id: logId,
      messageId: info.messageId || null,
    });

    return {
      messageId: info.messageId,
      logId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`sendEmailWithType failed: type='${type}' to='${to}' error='${e && e.message ? e.message : String(e)}'`);
    await deleteEmailLog({ id: logId });
    throw e;
  }
}

module.exports = {
  sendEmailWithType,
};
