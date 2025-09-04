const reviewMessages = {
    en: {
        centerId:{
            required: "Center ID is required",
            string: "Center ID must be a string"
        },
        rating: {
            required: "Rating is required",
            number: "Rating must be a number",
            min: "Rating must be at least 1",
            max: "Rating must not exceed 5"
        },
        comment: {
            string: "Comment must be a string"
        }
    },

    ar: {
        centerId:{
            required: "مُعرّف المركز مطلوب",
            string: "مُعرّف المركز يجب أن يكون نصًا"
        },
        rating: {
            required: "التقييم مطلوب",
            number: "التقييم يجب أن يكون رقمًا",
            min: "الحد الأدنى للتقييم هو 1",
            max: "الحد الأقصى للتقييم هو 5"
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
