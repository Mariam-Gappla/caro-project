const { exist } = require("joi");
const { rentalOffice, contactus } = require("./en");

module.exports = {
  register: {
    emailExists: {
      rentalOffice: "هذا المكتب موجود من قبل",
      serviceProvider: "موفر الخدمة موجود من قبل",
      user: "هذا المستخدم موجود من قبل"
    },
    createdSuccessfully: "تم إنشاء الحساب بنجاح",
  },
  login: {
    emailExists: {
      rentalOffice: "هذا المكتب لم يكن موجود يرجى انشاء حساب",
      serviceProvider: "موفر الخدمه لم يكن موجود من قبل يرجى انشاء حساب",
      user: "هذا المستخدم لم يكن موجود من قبل يرجى انشاء حساب"
    },
    incorrectData: "البيانات المدخلة غير صحيحة، الرجاء التأكد من البريد الإلكتروني وكلمة المرور",
    success: "تم تسجيل الدخول بنجاح",
  },
  rentalOffice: {
    haveCars: "هذا المكتب ليس لديه اى سيارات",
    existRentalOffice: "لم يتم العثور على هذا المكتب",
    addLike: "تم الاعجاب بمكتب التأجير",
    removeLike: "تم الغاء الاعجاب بمكتب التأجير",
    rentalOfficeId: "معرف المكتب مطلوب",
    ratingNotFound: "هذا المكتب ليس لديه تقييمات",
    ratingUser: "لا يوجد تقييمات"
  },
  rentalCar: {
    existCar: "لم توجد هذه السياره",
    rentalType: "نوع الايجار غير صحيح يجب ان يكون weekly/daily او rent to own",
    video:"مطلوب فيديو للسياره",
    onlyVideo:"يُسمح برفع ملف فيديو واحد فقط",
    invalidFormat:"يجب ان يكون فيديو"
  },
  follower: {
    success: "يتم متابعتك لهذا المكتب",
    exist: "انت تتابع هذا المكتب بالفعل",
    noFollowers: "هذا المكتب ليس لديه متابعين",
  },
  required: {
    userIdAndRentalId: 'معرف المستخدم ومعرف المكتب مطلوبين'
  },
  invalid:{
   commentIdAndTweetId:"معرّف التعليق أو التويت غير صالح"
  },
  order: {
    addOrder: "تمت إضافة الطلب بنجاح",
    existOrders: "هذا المكتب لا يحتوي على أي طلبات",
    alreadyBooked: "لقد قمت بحجز هذه السيارة بالفعل",
    notExist: "هذا الطلب غير موجود",
    orderId:"معرف الطلب مطلوب",
    acceptedSuccess: "تم قبول الطلب ورفع فيديو السيارة بنجاح",
    licenseImage:"مسموح برفع صور فقط",
    licenseImageRequired:"صوره الرخصه مطلوبه"
  },
  replyOnComment:{
    addreplay:"تمت إضافة الرد بنجاح",
    getreplies:"تم جلب الردود بنجاح"
  },
  tweet:{
    addtweet:"تم اضافه التويت بنجاح",
    existtweet:"لم يتم العثور على التويتة",
    addLike:"تم الإعجاب بالتويت",
    removeLike:"تم إلغاء الإعجاب بالتويت"
  },
  sendCode:{
    success:"تم ارسال الكود على هذا الرقم وسوف يكون صالح لمده خمس دقائق"
  },
  verify:{
    success:"تم التحقق بنجاح",
    error:"الكود غير صحيح",
    notExist:"هذا الكود غير صالح يرجى ادخال رقم التليفون لأرسال الكود فى رساله مره اخرى"
  },
  contactus:{
    success: "تم إرسال الرسالة بنجاح",
    error: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى لاحقًا",
  },
  invoice:{
    success: "تم إنشاء الفاتورة بنجاح",
    userId: "هذا المستخدم غير موجود",
    rentalOfficeId: "هذا المكتب غير موجود",
    orderId: "هذا الطلب غير موجود",
    existInvoice: "الفاتورة موجودة بالفعل لهذا المستخدم ومكتب التأجير والطلب",
     invalidOrderForUserOrOffice: "هذا الطلب غير مرتبط بالمستخدم أو المكتب المحدد",
  },
  rating:{
    success: "تم إضافة التقييم بنجاح",
    invalidOrder:"يمكنك تقييم الطلب بعد الاستلام",
    alreadyRated: "لقد قمت بتقييم هذا الطلب بالفعل",
  }
  

};
