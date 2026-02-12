const EmailLog = require("./models/EmailLog");

async function hasAnyExisting({ toEmail, type }) {
  const row = await EmailLog.findOne({ toEmail, type }).select({ _id: 1 }).lean();
  return Boolean(row);
}

async function createPendingLog({ toEmail, type, subject }) {
  try {
    const doc = await EmailLog.create({
      toEmail,
      type,
      subject: subject || undefined,
      status: "pending",
    });
    return String(doc._id);
  } catch (e) {
    if (e && e.code === 11000) {
      const err = new Error(`Email already sent before for type='${type}' to '${toEmail}'`);
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}

async function markEmailLogSent({ id, messageId }) {
  await EmailLog.updateOne(
    { _id: id },
    {
      $set: {
        status: "sent",
        messageId: messageId || undefined,
        sentAt: new Date(),
      },
    }
  );
}

async function markEmailLogFailed({ id, errorMessage }) {
  await EmailLog.updateOne(
    { _id: id },
    {
      $set: {
        status: "failed",
        errorMessage: errorMessage || undefined,
      },
    }
  );
}

module.exports = {
  hasAnyExisting,
  createPendingLog,
  markEmailLogSent,
  markEmailLogFailed,
};
