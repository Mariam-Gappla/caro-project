const reviewMessages = {
    en: {
        userId: {
            required: "User ID is required",
            string: "User ID must be a string"
        },
        targetId: {
            required: "Target ID is required",
            string: "Target ID must be a string"
        },
        targetType: {
            required: "Target type is required",
            valid: "Target type must be 'rentalOffice' or 'serviceProvider'",
            string: "Target type must be a string"
        },
        rating: {
            required: "Rating is required",
            number: "Rating must be a number",
            min: "Rating must be at least 1",
            max: "Rating must not exceed 5"
        },
        orderId: {
            required: "Order ID is required",
            string: "Order ID must be a string"
        },
        comment: {
            string: "Comment must be a string"
        }
    },

    ar: {
        userId: {
            required: "مُعرّف المستخدم مطلوب",
            string: "مُعرّف المستخدم يجب أن يكون نصًا"
        },
        targetId: {
            required: "مُعرّف الكيان المستهدف مطلوب",
            string: "مُعرّف الكيان يجب أن يكون نصًا"
        },
        targetType: {
            required: "نوع الكيان المستهدف مطلوب",
            valid: "نوع الكيان يجب أن يكون 'rentalOffice' أو 'serviceProvider'",
            string: "نوع الكيان يجب أن يكون نصًا"
        },
        rating: {
            required: "التقييم مطلوب",
            number: "التقييم يجب أن يكون رقمًا",
            min: "الحد الأدنى للتقييم هو 1",
            max: "الحد الأقصى للتقييم هو 5"
        },
        orderId: {
            required: "رقم الطلب مطلوب",
            string: "رقم الطلب يجب أن يكون نصًا"
        },
        comment: {
            string: "التعليق يجب أن يكون نصًا"
        }
    }
};

const getMessages = (lang = 'en') => {
    return reviewMessages[lang] || reviewMessages.en;
};

module.exports = getMessages;
