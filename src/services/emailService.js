const { getTransportForType } = require("./mailer");
const {
  hasAnyExisting,
  createPendingLog,
  markEmailLogSent,
  markEmailLogFailed,
} = require("../db/emailLogRepo");
const { downloadUrlToTempFile } = require("./fileDownload");
const fs = require("fs");

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

  let downloaded;

  try {
    if (attachmentUrl) {
      downloaded = await downloadUrlToTempFile({
        url: attachmentUrl,
        filenameHint: attachmentFilename,
      });
    }

    const allAttachments = [];
    const mapped = mapAttachments(attachments);
    if (mapped && mapped.length) allAttachments.push(...mapped);
    if (downloaded) {
      allAttachments.push({
        filename: downloaded.filename,
        path: downloaded.filePath,
        contentType: downloaded.contentType,
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
    await markEmailLogFailed({
      id: logId,
      errorMessage: e && e.message ? e.message : String(e),
    });
    throw e;
  } finally {
    if (downloaded && downloaded.filePath) {
      try {
        fs.unlinkSync(downloaded.filePath);
      } catch {
        // ignore
      }
    }
  }
}

module.exports = {
  sendEmailWithType,
};
