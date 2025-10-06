const messages = {
  en: {
    // 🟢 عام
    nameIdRequired: "Car name is required",
    modelIdRequired: "Car model is required",
    carTypeIdRequired: "Car type is required",
    cityRequired: "City is required",
    carPriceRequired: "Car price is required",
    carPriceInvalid: "Car price must be a valid number",
    priceAfterAuctionInvalid: "Price after auction must be a valid number",
    odeoMeterRequired: "Odometer is required",
    isNewRequired: "Car condition (new/used) is required",
    phoneNumberRequired: "Phone number is required",

    // 🟢 مزاد
    auctionStartRequired: "Auction start date is required",
    auctionEndRequired: "Auction end date is required",
    auctionEndGreater: "Auction end date must be after auction start date",
    auctionStartEqualCreatedAt:"Auction start date must equal post creation date",
    titleRequired: "Title is required",
    titleMustBeString: "Title must be a string"
  },

  ar: {
    // 🟢 عام
    nameIdRequired: "اسم السيارة مطلوب",
    modelIdRequired: "الموديل مطلوب",
    carTypeIdRequired: "نوع السيارة مطلوب",
    cityRequired: "المدينة مطلوبة",
    carPriceRequired: "سعر السيارة مطلوب",
    carPriceInvalid: "يجب أن يكون سعر السيارة رقمًا صحيحًا",
    priceAfterAuctionInvalid: "السعر بعد المزاد يجب أن يكون رقمًا صحيحًا",
    odeoMeterRequired: "عداد الكيلومترات مطلوب",
    isNewRequired: "حالة السيارة (جديدة/مستعملة) مطلوبة",
    phoneNumberRequired: "رقم الهاتف مطلوب",

    // 🟢 مزاد
    auctionStartRequired: "تاريخ بداية المزاد مطلوب",
    auctionEndRequired: "تاريخ نهاية المزاد مطلوب",
    auctionEndGreater: "تاريخ نهاية المزاد يجب أن يكون بعد تاريخ البداية",
    auctionStartEqualCreatedAt: "تاريخ بداية المزاد يجب أن يساوي تاريخ إنشاء البوست",
     titleRequired: "العنوان مطلوب",
    titleMustBeString: "العنوان يجب أن يكون نصًا"
  },
};

module.exports = (lang = "en") => messages[lang] || messages.en;
