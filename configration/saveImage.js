const path = require("path");
const fs = require("fs");

const saveImage = (file, folder = '/var/www/images') => {
  // نشيل المسافات ونحوّلها لشرطة سفلية أو نشيلها خالص
  const safeName = file.originalname.replace(/\s+/g, "_"); // أو "" لو عايزة تشيليها تماما
  const fileName = `${Date.now()}-${safeName}`;
  const saveDir = folder; // المسار المطلق
  const filePath = path.join(saveDir, fileName);

  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  fs.writeFileSync(filePath, file.buffer);

  console.log("Saved file at:", filePath);

  // الرابط اللي هيتخزن في الداتابيز
  return `images/${fileName}`;
};
const deleteImage = (imgPath) => {
  try {
    if (!imgPath) return;
    // نجيب اسم الملف فقط من المسار (لو imgPath = "images/test.jpg")
    const fileName = path.basename(imgPath);
    const fullPath = path.join("/var/www/images", fileName);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("🗑️ Deleted:", fullPath);
    }
  } catch (err) {
    console.warn("⚠️ Failed to delete image:", imgPath, err.message);
  }
};

module.exports = {saveImage,deleteImage};
