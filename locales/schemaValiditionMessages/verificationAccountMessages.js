const messages = {
  en: {
    providerIdRequired: "Provider ID is required",
    providerIdString: "Provider ID must be a string",

    serviceTypeRequired: "Service type is required",
    serviceTypeString: "Service type must be a string",

    fullNameRequired: "Full name is required",
    fullNameString: "Full name must be a string",

    nationalityRequired: "Nationality is required",
    nationalityString: "Nationality must be a string",

    nationalIdRequired: "National ID is required",
    nationalIdString: "National ID must be a string",

    birthDateRequired: "Birth date is required",
    birthDateDate: "Birth date must be a valid date",

    emailRequired: "Email is required",
    emailString: "Email must be a string",
    emailInvalid: "Email must be a valid email",

    ibanRequired: "IBAN is required",
    ibanString: "IBAN must be a string",

    bankAccountNameRequired: "Bank account name is required",
    bankAccountNameString: "Bank account name must be a string",

    winchTypeRequired: "Winch type is required",
    winchTypeString: "Winch type must be a string",

    carPlateNumberRequired: "Car plate number is required",
    carPlateNumberString: "Car plate number must be a string",

    profileImageRequired: "Profile image is required",
    profileImageString: "Profile image must be a string",

    nationalIdImageRequired: "National ID image is required",
    nationalIdImageString: "National ID image must be a string",

    licenseImageRequired: "License image is required",
    licenseImageString: "License image must be a string",

    carRegistrationImageRequired: "Car registration image is required",
    carRegistrationImageString: "Car registration image must be a string",

    carImageRequired: "Car image is required",
    carImageString: "Car image must be a string",

    notesRequired: "Notes are required",
    notesString: "Notes must be a string",
    notesEmpty: "Notes cannot be empty",
    notesMin: "Notes must be at least 5 characters",
    notesMax: "Notes must be at most 100 characters"
  },

  ar: {
    providerIdRequired: "معرّف مقدم الخدمة مطلوب",
    providerIdString: "معرّف مقدم الخدمة يجب أن يكون نصًا",

    serviceTypeRequired: "نوع الخدمة مطلوب",
    serviceTypeString: "نوع الخدمة يجب أن يكون نصًا",

    fullNameRequired: "الاسم الكامل مطلوب",
    fullNameString: "الاسم الكامل يجب أن يكون نصًا",

    nationalityRequired: "الجنسية مطلوبة",
    nationalityString: "الجنسية يجب أن تكون نصًا",

    nationalIdRequired: "رقم الهوية الوطنية مطلوب",
    nationalIdString: "رقم الهوية الوطنية يجب أن يكون نصًا",

    birthDateRequired: "تاريخ الميلاد مطلوب",
    birthDateDate: "تاريخ الميلاد يجب أن يكون تاريخًا صالحًا",

    emailRequired: "البريد الإلكتروني مطلوب",
    emailString: "البريد الإلكتروني يجب أن يكون نصًا",
    emailInvalid: "البريد الإلكتروني يجب أن يكون بصيغة صحيحة",

    ibanRequired: "رقم الآيبان مطلوب",
    ibanString: "رقم الآيبان يجب أن يكون نصًا",

    bankAccountNameRequired: "اسم صاحب الحساب البنكي مطلوب",
    bankAccountNameString: "اسم صاحب الحساب البنكي يجب أن يكون نصًا",

    winchTypeRequired: "نوع الونش مطلوب",
    winchTypeString: "نوع الونش يجب أن يكون نصًا",

    carPlateNumberRequired: "رقم لوحة السيارة مطلوب",
    carPlateNumberString: "رقم لوحة السيارة يجب أن يكون نصًا",

    profileImageRequired: "الصورة الشخصية مطلوبة",
    profileImageString: "مسار الصورة الشخصية يجب أن يكون نصًا",

    nationalIdImageRequired: "صورة الهوية مطلوبة",
    nationalIdImageString: "مسار صورة الهوية يجب أن يكون نصًا",

    licenseImageRequired: "صورة الرخصة مطلوبة",
    licenseImageString: "مسار صورة الرخصة يجب أن يكون نصًا",

    carRegistrationImageRequired: "صورة الاستمارة مطلوبة",
    carRegistrationImageString: "مسار صورة الاستمارة يجب أن يكون نصًا",

    carImageRequired: "صورة السيارة مطلوبة",
    carImageString: "مسار صورة السيارة يجب أن يكون نصًا",

    notesRequired: "الملاحظات مطلوبة",
    notesString: "الملاحظات يجب أن تكون نصًا",
    notesEmpty: "الملاحظات لا يمكن أن تكون فارغة",
    notesMin: "الملاحظات يجب ألا تقل عن 5 أحرف",
    notesMax: "الملاحظات يجب ألا تزيد عن 100 حرف"
  }
};

const getMessages = (lang = 'en') => messages[lang] || messages.en;

module.exports = getMessages;

