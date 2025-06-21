const messages = {
  en: {
    invoice: {
      invoiceNumber: {
        required: "invoiceNumber is required",
        unique: "invoiceNumber must be unique"
      },
      userId: {
        required: "userId is required"
      },
      rentalOfficeId: {
        required: "rentalOfficeId is required"
      },
      orderId: {
        required: "orderId is required"
      },
      amount: {
        required: "amount is required",
        number: "amount must be a valid number"
      }
    }
  },

  ar: {
    invoice: {
      invoiceNumber: {
        required: "رقم الفاتورة مطلوب",
        unique: "رقم الفاتورة يجب أن يكون فريدًا"
      },
      userId: {
        required: "رقم تعريف المستخدم مطلوب"
      },
      rentalOfficeId: {
        required: "رقم تعريف مكتب التأجير مطلوب"
      },
      orderId: {
        required: "رقم الطلب مطلوب"
      },
      amount: {
        required: "المبلغ مطلوب",
        number: "يجب أن يكون المبلغ رقمًا صحيحًا أو عشريًا"
      }
    }
  }
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports=getMessages;