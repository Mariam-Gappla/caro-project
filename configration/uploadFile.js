const multer = require('multer');
const storage = multer.memoryStorage(); // مؤقت في الرام
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('صيغة الملف غير مدعومة'), false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports=upload;