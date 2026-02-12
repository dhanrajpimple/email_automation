const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");

function tryExtractGoogleDriveFileId(url) {
  try {
    const u = new URL(url);

    if (u.hostname === "drive.google.com") {
      // /file/d/<id>/view
      const parts = u.pathname.split("/").filter(Boolean);
      const fileIndex = parts.indexOf("d");
      if (fileIndex >= 0 && parts[fileIndex + 1]) {
        return parts[fileIndex + 1];
      }

      // open?id=<id>
      const id = u.searchParams.get("id");
      if (id) return id;
    }
  } catch {
    return null;
  }

  return null;
}

function toDirectDownloadUrl(url) {
  const id = tryExtractGoogleDriveFileId(url);
  if (!id) return url;
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
}

function filenameFromUrl(url) {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname);
    if (base && base !== "/") return base;
  } catch {
    return null;
  }
  return null;
}

async function downloadUrlToTempFile({ url, filenameHint }) {
  const directUrl = toDirectDownloadUrl(url);

  const res = await fetch(directUrl, {
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Failed to download attachmentUrl. Status ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || undefined;

  const filename =
    filenameHint ||
    res.headers
      .get("content-disposition")
      ?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)?.[1] ||
    filenameFromUrl(directUrl) ||
    "attachment";

  const safeFilename = String(filename).replace(/[\\/:*?"<>|]/g, "_");
  const tempName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}-${safeFilename}`;
  const filePath = path.join(os.tmpdir(), tempName);

  const bodyStream = res.body ? Readable.fromWeb(res.body) : null;
  if (!bodyStream) {
    throw new Error("Failed to download attachmentUrl: empty response body");
  }

  await pipeline(bodyStream, fs.createWriteStream(filePath));

  return {
    filePath,
    filename: safeFilename,
    contentType,
  };
}

module.exports = {
  downloadUrlToTempFile,
};
