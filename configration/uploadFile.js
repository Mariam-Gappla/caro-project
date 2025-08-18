const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true); // مقبول
  } else {
    cb(new Error('مسموح فقط بالصور والفيديوهات'), false);
  }
};
const limits = {
  fileSize: 100 * 1024 * 1024 // 100MB
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload;
