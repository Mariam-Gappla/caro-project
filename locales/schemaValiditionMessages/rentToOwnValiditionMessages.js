const rentToOwnMessages = {
  en: {
    rentalType: {
      required: "Please select rental type",
      only: "Rental type must be 'weekly/daily' or 'rent to own'",
      string: "Rental type must be a valid string"
    },
    ownershipPeriod: {
      required: "Ownership period is required",
      base: "Ownership period must be a string"
    },
    totalKilometers: {
      number: "Total kilometers must be a number",
      required: "Please enter the total kilometers"
    },

    images: {
      base: "Images must be an array of URLs",
      uri: "Each image must be a valid URL"
    },
    carName: {
      string: "Car name must be a string",
      required: "Please enter the car name"
    },
    carType: {
      string: "Car type must be a string",
      required: "Please select the car type"
    },
    carModel: {
      number: "Car model must be a number (e.g., 2023)",
      required: "Please enter the car model"
    },
    licensePlateNumber: {
      string: "License plate number must be a string",
      required: "License plate number is required"
    },
    carPrice: {
      number: "Car price must be a number",
      required: "Please enter the car price"
    },
    monthlyPayment: {
      number: "Monthly payment must be a number",
      required: "Please enter the monthly payment"
    },
    finalPayment: {
      number: "Final payment must be a number",
      required: "Please enter the final payment amount"
    },
    city: {
      string: "City must be a string",
      required: "Please select a city"
    },
    area: {
      string: "Area must be a string",
      required: "Please select an area"
    },
    carDescription: {
      string: "Car description must be a string",
      required: "Please enter a car description"
    },
    deliveryOption: {
      boolean: "Delivery option must be true or false"
    },
    title: {
      base: 'Title must be a string',
      empty: 'Title cannot be empty',
      required: 'Title is required'
    },
    odoMeter: {
      number: "odoMeter must be a number",
      required: "odoMeter is required"
    },
    nameId: {
      required: "Name ID is required",
      string: "Name ID must be a string"
    },
    modelId: {
      required: "Model ID is required",
      string: "Model ID must be a string"
    }

  },

  ar: {
    rentalType: {
      required: "من فضلك اختر نوع التأجير",
      only: "نوع التأجير يجب ان يكون weekly/daily أو rent to own",
      string: "نوع التأجير يجب أن يكون نصًا صحيحًا"
    },
    images: {
      base: "يجب إرسال الصور كمصفوفة من الروابط",
      uri: "يجب أن يكون كل رابط صورة صحيحًا (بصيغة URL)"
    },
    carName: {
      string: "اسم السيارة يجب أن يكون نصًا",
      required: "من فضلك أدخل اسم السيارة"
    },
    carType: {
      string: "نوع السيارة يجب أن يكون نصًا",
      required: "من فضلك حدد نوع السيارة"
    },
    carModel: {
      number: "موديل السيارة يجب أن يكون رقمًا (مثلاً: 2023)",
      required: "يرجى إدخال موديل السيارة"
    },
    licensePlateNumber: {
      string: "رقم اللوحة يجب أن يكون نصًا",
      required: "رقم لوحة السيارة مطلوب"
    },
    totalKilometers: {
      number: "عدد الكيلومترات يجب أن يكون رقمًا",
      required: "يرجى تحديد عدد الكيلومترات المجانية"
    },
    carPrice: {
      number: "سعر السيارة يجب أن يكون رقمًا",
      required: "يرجى إدخال سعر السيارة"
    },
    monthlyPayment: {
      number: "القسط الشهري يجب أن يكون رقمًا",
      required: "يرجى تحديد قيمة القسط الشهري"
    },
    finalPayment: {
      number: "الدفعة الأخيرة يجب أن تكون رقمًا",
      required: "يرجى إدخال قيمة الدفعة الأخيرة"
    },
    city: {
      string: "اسم المدينة يجب أن يكون نصًا",
      required: "يرجى تحديد المدينة"
    },
    area: {
      string: "اسم المنطقة يجب أن يكون نصًا",
      required: "يرجى تحديد المنطقة"
    },
    carDescription: {
      string: "وصف السيارة يجب أن يكون نصًا",
      required: "يرجى كتابة وصف للسيارة"
    },
    deliveryOption: {
      boolean: "خيار التوصيل يجب أن يكون true أو false"
    },
    title: {
      base: 'العنوان يجب أن يكون نصًا',
      empty: 'العنوان لا يمكن أن يكون فارغًا',
      required: 'العنوان مطلوب'
    },
    ownershipPeriod: {
      required: "مدة التملك مطلوبة",
      base: "مدة التملك يجب أن تكون نصًا"
    },
    odoMeter: {
      number: "عداد السياره مطلوب",
      required: "عداد السياره مطلوب"
    },
    nameId: {
      required: "معرّف الاسم مطلوب",
      string: "معرّف الاسم يجب أن يكون نصًا"
    },
    modelId: {
      required: "معرّف الموديل مطلوب",
      string: "معرّف الموديل يجب أن يكون نصًا"
    }
  }
};

const getRentToOwnMessages = (lang = "en") => {
  return rentToOwnMessages[lang] || rentToOwnMessages.en;
};

module.exports = getRentToOwnMessages;
