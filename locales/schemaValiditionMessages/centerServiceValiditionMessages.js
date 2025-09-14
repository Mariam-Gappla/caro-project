const messages = {
    en: {
      centerId: {
        required: "Center ID is required",
        string: "Center ID must be a string",
      },
      details: {
        required: "Details are required",
        string: "Details must be a string",
      },
      services: {
        base: "Services must be an array of IDs",
        required: "At least one service is required",
      },
      products: {
        base: "Products must be an array of strings",
        required: "At least one product is required",
      },
      location:{
        lat:{
          base:"lat must be number",
          required:"lat required"
        },
        long:{
          base:"long must be number",
          required:"long required"
        }
      }
      
    },
    ar: {
      centerId: {
        required: "مطلوب إدخال رقم المركز",
        string: "يجب أن يكون رقم المركز نصًا",
      },
      details: {
        required: "التفاصيل مطلوبة",
        string: "يجب أن تكون التفاصيل نصًا",
      },
      services: {
        base: "الخدمات يجب أن تكون قائمة من المعرفات",
        required: "مطلوب اختيار خدمة واحدة على الأقل",
      },
      products: {
        base: "المنتجات يجب أن تكون قائمة من النصوص",
        required: "مطلوب إدخال منتج واحد على الأقل",
      },
      location:{
        lat:{
          base:"خط العرض يجب ان يكون رقم",
          required:"خط العرض مطلوب"
        },
        long:{
          base:"خط الطول يجب ان يكون رقم",
          required:"خط الطول مطلوب"
        }
      }
    }
  };

const getMessages = (lang = 'en') => {
  return messages[lang] || messages.en;
};
module.exports = getMessages;
