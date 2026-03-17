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
  // eslint-disable-next-line no-console
  console.log(`sendEmailWithType start: type='${type}' to='${to}'`);

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
    const { transporter, fromEmail } = getTransportForType(type);

    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      text,
    };

    // eslint-disable-next-line no-console
    console.log(`sendEmailWithType sending email`);

    const info = await transporter.sendMail(mailOptions);

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
