const messages = {
    ar: {
        username: {
            base: 'الاسم يجب أن يكون نصًا',
            empty: 'الاسم مطلوب',
            min: 'الاسم يجب أن يحتوي على حرفين على الأقل',
            required: 'الاسم مطلوب'
        },
        tradeRegisterNumber: {
            base: 'السجل التجاري يجب أن يكون نصًا',
            pattern: 'السجل التجاري يجب أن يحتوي على أرقام أو حروف فقط (3 إلى 20 حرفًا)',
            empty: 'السجل التجاري مطلوب',
            required: 'السجل التجاري مطلوب'
        },
        website: {
            uri: 'رابط الموقع غير صالح (مثال: https://example.com)',
            required: 'رابط الموقع مطلوب'
        },
        image: {
            uri: 'رابط الصورة غير صالح',
            required: 'رابط الصورة مطلوب',
            mimetype: 'يُسمح فقط بصور من نوع JPG أو PNG أو WEBP أو GIF',
            size: 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت'
        },
        location: {
            type: 'نوع الموقع يجب أن يكون "Point"',
            coordinateNumber: 'كل إحداثي يجب أن يكون رقمًا صحيحًا',
            coordinatesLength: 'يجب أن تحتوي الإحداثيات على خط الطول والعرض فقط',
            coordinatesRequired: 'الإحداثيات مطلوبة',
            required: 'الموقع مطلوب'
        },
        city: {
            base: 'المدينة يجب أن تكون نصًا',
            empty: 'المدينة مطلوبة',
            required: 'المدينة مطلوبة'
        },
        details: {
            base: 'التفاصيل يجب أن تكون نصًا',
            min: 'التفاصيل يجب ألا تقل عن 10 أحرف',
            max: 'التفاصيل يجب ألا تتجاوز 1000 حرف',
            required: 'التفاصيل مطلوبة'
        },
        administrationNumber: {
            base: 'رقم الإدارة يجب أن يكون نصًا',
            empty: 'رقم الإدارة مطلوب',
            required: 'رقم الإدارة مطلوب'
        },
        employeeNumber: {
            base: 'رقم الموظف يجب أن يكون نصًا',
            empty: 'رقم الموظف مطلوب',
            required: 'رقم الموظف مطلوب'
        },
        password: {
            required: "كلمة المرور مطلوبة",
            min: "يجب أن تكون كلمة المرور على الأقل 6 أحرف"
        },
        phone: {
            required: "رقم الهاتف مطلوب",
            invalid: "صيغة رقم الهاتف غير صحيحة"
        },
        email: {
            invalid: "صيغة البريد الإلكتروني غير صحيحة"
        },

    },

    en: {
        username: {
            base: 'Name must be a string',
            empty: 'Name is required',
            min: 'Name must contain at least 2 characters',
            required: 'Name is required'
        },
        email: {
            invalid: "Invalid email format"
        },
        tradeRegisterNumber: {
            base: 'Trade register number must be a string',
            pattern: 'Trade register number must contain only letters or numbers (3–20 characters)',
            empty: 'Trade register number is required',
            required: 'Trade register number is required'
        },
        website: {
            uri: 'Invalid website URL (e.g. https://example.com)',
            required: 'Website URL is required'
        },
        image: {
            uri: 'Invalid image URL',
            required: 'Image URL is required',
            mimetype: 'Only JPG, PNG, WEBP, or GIF formats are allowed',
            size: 'Image size must not exceed 5MB'
        },
        location: {
            type: 'Location type must be "Point"',
            coordinateNumber: 'Each coordinate must be a valid number',
            coordinatesLength: 'Coordinates must contain [longitude, latitude]',
            coordinatesRequired: 'Coordinates are required',
            required: 'Location is required'
        },
        city: {
            base: 'City must be a string',
            empty: 'City is required',
            required: 'City is required'
        },
        details: {
            base: 'Details must be a string',
            min: 'Details must be at least 10 characters long',
            max: 'Details must not exceed 1000 characters',
            required: 'Details are required'
        },
        administrationNumber: {
            base: 'Administration number must be a string',
            empty: 'Administration number is required',
            required: 'Administration number is required'
        },
        employeeNumber: {
            base: 'Employee number must be a string',
            empty: 'Employee number is required',
            required: 'Employee number is required'
        },
        password: {
            required: "Password is required",
            min: "Password must be at least 6 characters"
        },
        phone: {
            required: "phone is required",
            invalid: "Invalid  phone format"
        },
    }
};

const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};

module.exports = getMessages;
