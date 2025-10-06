const messages = {
  en: {
    plateNumberRequired: "Plate number is required",
    plateLettersRequired: "Plate letters are required (both Arabic and English)",

    cityRequired: "City is required",
    priceRequired: "Price is required",
    plateTypeRequired: "Plate type is required",
    plateTypeInvalid: "Plate type must be either private or commercial",
    digitesRequired: "Digits count is required",
    digitesInvalid: "Digits count must be one of [1, 2, 3, 4]",
    auctionStartRequired: "Auction start date is required when price is not fixed",
    auctionEndRequired: "Auction end date is required when price is not fixed",
    auctionEndGreater: "Auction end date must be greater than auction start date",
    auctionStartEqualCreatedAt: "Auction start date must be equal to createdAt date",
    phoneNumberRequired: "Phone number is required",
  },

  ar: {
    plateNumberRequired: "رقم اللوحة مطلوب",
    plateLettersRequired: "حروف اللوحة مطلوبة (عربي وإنجليزي)",

    cityRequired: "المدينة مطلوبة",
    priceRequired: "السعر مطلوب",
    plateTypeRequired: "نوع اللوحة مطلوب",
    plateTypeInvalid: "نوع اللوحة يجب أن يكون private أو commercial",
    auctionStartRequired: "تاريخ بداية المزاد مطلوب إذا لم يكن السعر ثابت",
    auctionEndRequired: "تاريخ نهاية المزاد مطلوب إذا لم يكن السعر ثابت",
    auctionEndGreater: "تاريخ نهاية المزاد يجب أن يكون بعد تاريخ البداية",
    auctionStartEqualCreatedAt: "تاريخ بداية المزاد يجب أن يساوي وقت الإنشاء",
    digitesRequired: "عدد الخانات مطلوب",
    digitesInvalid: "عدد الخانات يجب أن يكون أحد القيم [1, 2, 3, 4]",
    phoneNumberRequired: "رقم الهاتف مطلوب"
  }
};
const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};
module.exports = getMessages;
