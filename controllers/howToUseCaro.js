const HowToUseCaro = require('../models/howToUseCaro');
const getMessages = require("../configration/getmessages");
const getHowToUseCaroSchema = require('../validation/howToUseCaro');
// utils/saveFile.js
const fs = require('fs');
const path = require('path');
const { format } = require('path');

const saveFile = (file, folder = 'images') => {
  const originalName = file.originalname.replace(/\s+/g, ''); // ← حذف المسافات
  const fileName = `${Date.now()}-${originalName}`;
  const saveDir = path.join(__dirname, '..', folder);
  const filePath = path.join(saveDir, fileName);

  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  fs.writeFileSync(filePath, file.buffer);
  return `${folder}/${fileName}`; // ← يرجع المسار النسبي
};
const addHowToUseCaro = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';
    const messages = getMessages(lang);

    const files = req.files;
    if (!files || files.length !== 3) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: messages.length
      });
    }

    // التأكد من أن كل ملف هو فيديو
    const isAllVideos = files.every(file => file.mimetype.startsWith('video/'));
    if (!isAllVideos) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: lang === 'ar'
          ? 'يجب أن تكون جميع الملفات فيديوهات'
          : 'All files must be videos'
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const videos = files.map(file => {
      const relativePath = saveFile(file, 'images');
      return { url: `${baseUrl}${relativePath}` };
    });

    const record = await HowToUseCaro.create({ videos });

    return res.status(200).send({
      status: true,
      code: 200,
      message: lang === 'ar'
        ? 'تم رفع الفيديوهات بنجاح'
        : 'Videos uploaded successfully',
    });

  } catch (err) {
    if (err.message === 'Unsupported video format') {
      return res.status(400).send({
        status: false,
        code: 400,
        message: lang === 'ar'
          ? 'صيغة الفيديو غير مدعومة'
          : 'Unsupported video format'
      });
    }
    next(err);
  }
};

const getVideos = async (req, res, next) => {
  try {
    const lang = req.headers['accept-language'] || 'en';

    const videos = await HowToUseCaro.find().sort({ createdAt: -1 });

    // استخراج كل الفيديوهات من كل الوثائق
    const formattedData = videos.flatMap(doc => doc.videos.map(video => video.url));

    return res.status(200).json({
      status: true,
      code: 200,
      message: lang === 'ar' ? 'تم جلب الفيديوهات بنجاح' : 'Videos fetched successfully',
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addHowToUseCaro,
  getVideos
};
