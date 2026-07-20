const ImageKit = require("@imagekit/nodejs/index.js");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATEKEY
});

// ==========================
// Upload Image
// ==========================

async function uploadFile(file) {
  const result = await imagekit.files.upload({
    file: file.buffer.toString("base64"),
    fileName: file.originalname,
  });

  return result;
}

// ==========================
// Delete Image
// ==========================

async function deleteFile(fileId) {
  return await imagekit.files.delete(fileId);
}

module.exports = {
  uploadFile,
  deleteFile,
};