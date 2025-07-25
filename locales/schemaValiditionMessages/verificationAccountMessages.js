const messages = {
  en: {
    providerIdRequired: "Provider ID is required.",
    fullNameRequired: "Full name is required.",
    fullNameString: "Full name must be a string.",
    nationalityRequired: "Nationality is required.",
    nationalityString: "Nationality must be a string.",
    nationalIdRequired: "National ID is required.",
    nationalIdString: "National ID must be a string.",
    birthDateRequired: "Birth date is required.",
    birthDateDate: "Birth date must be a valid date.",
    emailRequired: "Email is required.",
    emailString: "Email must be a string.",
    emailInvalid: "Email format is invalid.",
    ibanRequired: "IBAN is required.",
    ibanString: "IBAN must be a string.",
    bankAccountNameRequired: "Bank account name is required.",
    bankAccountNameString: "Bank account name must be a string.",
    winchTypeRequired: "Winch type is required.",
    winchTypeString: "Winch type must be a string.",
    carPlateNumberRequired: "Car plate number is required.",
    carPlateNumberString: "Car plate number must be a string.",
    profileImageRequired: "Profile image is required.",
    profileImageString: "Profile image must be a valid string.",
    nationalIdImageRequired: "National ID image is required.",
    nationalIdImageString: "National ID image must be a valid string.",
    licenseImageRequired: "Driver’s license image is required.",
    licenseImageString: "Driver’s license image must be a valid string.",
    carRegistrationImageRequired: "Car registration image is required.",
    carRegistrationImageString: "Car registration image must be a valid string.",
    carImageRequired: "Car image is required.",
    carImageString: "Car image must be a valid string.",
    notesRequired: "Notes field is required",
    notesString: "Notes must be a string",
    notesEmpty: "Notes cannot be empty",
    notesMin: "Notes must be at least 5 characters",
    notesMax: "Notes cannot be more than 100 characters",
    serviceTypeRequired: 'Service type is required.',
    serviceTypeString: 'Service type must be a string.',
    serviceTypeInvalid:
      'Invalid service type. Valid values are: winch, tire Filling, battery Jumpstart, or tire Filling and battery Jumpstart.'
  },

  ar: {
    providerIdRequired: "معرّف المزود مطلوب.",
    fullNameRequired: "الاسم الكامل مطلوب.",
    fullNameString: "يجب أن يكون الاسم الكامل نصًا.",
    nationalityRequired: "الجنسية مطلوبة.",
    nationalityString: "يجب أن تكون الجنسية نصًا.",
    nationalIdRequired: "رقم الهوية مطلوب.",
    nationalIdString: "يجب أن يكون رقم الهوية نصًا.",
    birthDateRequired: "تاريخ الميلاد مطلوب.",
    birthDateDate: "يجب أن يكون تاريخ الميلاد تاريخًا صالحًا.",
    emailRequired: "البريد الإلكتروني مطلوب.",
    emailString: "يجب أن يكون البريد الإلكتروني نصًا.",
    emailInvalid: "صيغة البريد الإلكتروني غير صالحة.",
    ibanRequired: "رقم الآيبان مطلوب.",
    ibanString: "يجب أن يكون الآيبان نصًا.",
    bankAccountNameRequired: "اسم الحساب البنكي مطلوب.",
    bankAccountNameString: "يجب أن يكون اسم الحساب البنكي نصًا.",
    winchTypeRequired: "نوع الونش مطلوب.",
    winchTypeString: "يجب أن يكون نوع الونش نصًا.",
    carPlateNumberRequired: "رقم لوحة السيارة مطلوب.",
    carPlateNumberString: "يجب أن يكون رقم لوحة السيارة نصًا.",
    profileImageRequired: "الصورة الشخصية مطلوبة.",
    profileImageString: "يجب أن تكون الصورة الشخصية رابطًا صالحًا.",
    nationalIdImageRequired: "صورة الهوية مطلوبة.",
    nationalIdImageString: "يجب أن تكون صورة الهوية رابطًا صالحًا.",
    licenseImageRequired: "صورة الرخصة مطلوبة.",
    licenseImageString: "يجب أن تكون صورة الرخصة رابطًا صالحًا.",
    carRegistrationImageRequired: "صورة الاستمارة مطلوبة.",
    carRegistrationImageString: "يجب أن تكون صورة الاستمارة رابطًا صالحًا.",
    carImageRequired: "صورة السيارة مطلوبة.",
    carImageString: "يجب أن تكون صورة السيارة رابطًا صالحًا.",
    notesRequired: "حقل الملاحظات مطلوب",
    notesString: "يجب أن تكون الملاحظات نصًا",
    notesEmpty: "لا يمكن ترك الملاحظات فارغة",
    notesMin: "يجب ألا تقل الملاحظات عن 5 أحرف",
    notesMax: "يجب ألا تزيد الملاحظات عن 100 حرف",
    serviceTypeRequired: 'نوع الخدمة مطلوب.',
    serviceTypeString: 'نوع الخدمة يجب أن يكون نصًا.',
    serviceTypeInvalid:
      'نوع الخدمة غير صالح. القيم المسموحة هي: winch, tire Filling, battery Jumpstart أو tire Filling and battery Jumpstart.',
  }
};
const getMessages = (lang = 'en') => messages[lang] || messages.en;

module.exports = getMessages;

