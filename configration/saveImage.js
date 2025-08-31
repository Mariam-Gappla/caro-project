const path=require("path");
const fs=require("fs");
const saveImage = (file, folder = '/var/www/images') => {
  const fileName = `${Date.now()}-${file.originalname}`;
  const saveDir = folder; // المسار المطلق
  const filePath = path.join(saveDir, fileName);

  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  fs.writeFileSync(filePath, file.buffer);

  console.log("Saved file at:", filePath);

  // الرابط اللي هيتخزن في الداتابيز
  return `/images/${fileName}`;
};
module.exports = saveImage;