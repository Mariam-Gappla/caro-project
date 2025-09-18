const messages = {
  en: {
    plateNumberRequired: "Plate number is required",
    plateLettersRequired: "Plate letters are required",
    cityRequired: "City is required",
    phoneNumberRequired: "Phone number is required",
    auctionStartRequired: "Auction start date is required when fixed price is false",
    auctionEndRequired: "Auction end date is required when fixed price is false",
    auctionEndGreater: "Auction end date must be greater than auction start date",
    priceRequired: "Price is required",
    auctionStartEqualCreatedAt: "Auction start date must be equal to the ad creation time"
  },
  ar: {
    plateNumberRequired: "رقم اللوحة مطلوب",
    plateLettersRequired: "حروف اللوحة مطلوبة",
    cityRequired: "المدينة مطلوبة",
    phoneNumberRequired: "رقم الهاتف مطلوب",
    auctionStartRequired: "تاريخ بداية المزايدة مطلوب إذا لم يكن السعر ثابت",
    auctionEndRequired: "تاريخ نهاية المزايدة مطلوب إذا لم يكن السعر ثابت",
    auctionEndGreater: "تاريخ نهاية المزايدة يجب أن يكون بعد تاريخ البداية",
    priceRequired: "السعر مطلوب",
    auctionStartEqualCreatedAt: "تاريخ بداية المزايدة يجب أن يساوي وقت إنشاء الإعلان"
  }
};
const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};
module.exports = getMessages;
