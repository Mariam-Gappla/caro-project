const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png','image/jpg', 'image/webp', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('صيغة الملف غير مدعومة'), false);
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
