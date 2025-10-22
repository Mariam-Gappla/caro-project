const messages = {
    en: {
        register: {
            username: {
                required: "Username is required",
                string: "Username must be a string",
                min: "Username must be at least 3 characters",
                max: "Username must be at most 30 characters"
            },
            email: {
                invalid: "Invalid email format"
            },
            password: {
                required: "Password is required",
                min: "Password must be at least 6 characters"
            },
            phone: {
                required: "phone is required",
                invalid: "Invalid  phone format"
            },
            confirmPassword: {
                required: "Confirm password is required",
                match: "Passwords must match"
            },
            role: {
                required: "Role is required",
                valid: "Role must be one of: rentalOffice, serviceProvider, or user"
            }
        },
        login: {
            phone: {
                required: "phone is required",
                invalid: "Invalid  phone format"
            },
            password: {
                required: "Password is required"
            },
            role: {
                required: "Role is required",
                valid: "Role must be one of: rentalOffice, serviceProvider, or user"
            },
            fcmToken: {
                required: "FCM Token is required",
            }
        }
    },

    ar: {
        register: {
             phone: {
                required: "رقم الهاتف مطلوب",
                invalid: "صيغة رقم الهاتف غير صحيحة"
            },
            username: {
                required: "اسم المستخدم مطلوب",
                string: "يجب أن يكون اسم المستخدم نصًا",
                min: "يجب أن يكون اسم المستخدم على الأقل 3 أحرف",
                max: "يجب ألا يزيد اسم المستخدم عن 50 حرفًا"
            },
            email: {
                invalid: "صيغة البريد الإلكتروني غير صحيحة"
            },
            password: {
                required: "كلمة المرور مطلوبة",
                min: "يجب أن تكون كلمة المرور على الأقل 6 أحرف"
            },
            confirmPassword: {
                required: "تأكيد كلمة المرور مطلوب",
                match: "كلمة المرور وتأكيدها غير متطابقين"
            },
            role: {
                required: "الدور مطلوب",
                valid: "يجب أن يكون الدور أحد: rentalOffice أو serviceProvider أو user"
            }
        },
        login: {
            phone: {
                required: "رقم الهاتف مطلوب",
                invalid: "صيغة رقم الهاتف غير صحيحة"
            },
            password: {
                required: "كلمة المرور مطلوبة"
            },
            role: {
                required: "الدور مطلوب",
                valid: "يجب أن يكون الدور أحد: rentalOffice أو serviceProvider أو user"
            },
            fcmToken: {
                required: "رمز FCM مطلوب",
            }
        }
    }
};
const getMessages = (lang = 'en') => {
    return messages[lang] || messages.en;
};
module.exports = getMessages;
