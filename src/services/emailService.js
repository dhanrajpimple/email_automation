const { getTransportForType } = require("./mailer");
const {
  hasAnyExisting,
  createPendingLog,
  markEmailLogSent,
  deleteEmailLog,
} = require("../db/emailLogRepo");

async function sendEmailWithType({
  type,
  to,
  subject,
  text,
}) {
  const start = Date.now();
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] Starting sendEmailWithType: type='${type}' to='${to}'`);

  try {
    // 1. Check existing (Possible DB hang point)
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] Checking DB for duplicates...`);
    const already = await hasAnyExisting({ toEmail: to, type });
    if (already) {
      // eslint-disable-next-line no-console
      console.log(`[${new Date().toISOString()}] Duplicate blocked for '${to}'`);
      const err = new Error(`Email already sent before for type='${type}' to '${to}'`);
      err.statusCode = 409;
      throw err;
    }

    // 2. Create pending log
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] Creating pending log...`);
    const logId = await createPendingLog({
      toEmail: to,
      type,
      subject,
    });

    // 3. Send email (The actual transport hanging point)
    try {
      const { transporter, fromEmail } = getTransportForType(type);

      const mailOptions = {
        from: fromEmail,
        to,
        subject,
        text,
      };

      // eslint-disable-next-line no-console
      console.log(`[${new Date().toISOString()}] Sending email via SMTP...`);
      const info = await transporter.sendMail(mailOptions);

      // eslint-disable-next-line no-console
      console.log(`[${new Date().toISOString()}] Email sent! ID: ${info.messageId} (Took ${Date.now() - start}ms)`);

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
      console.error(`[${new Date().toISOString()}] SMTP Error:`, e.code || e.message);
      await deleteEmailLog({ id: logId });
      throw e;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[${new Date().toISOString()}] API Error:`, err.message);
    throw err;
  }
}

module.exports = {
  sendEmailWithType,
};
