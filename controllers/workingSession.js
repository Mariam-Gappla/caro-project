const WorkingSession = require('../models/workingSession');

const startSession = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const lang= req.headers['accept-language'] || 'en';
    // تأكد إنه مفيش جلسة شغالة دلوقتي
    const existing = await WorkingSession.findOne({ providerId, endTime: null });
    if (existing) {
      return res.status(400).send({
        code:400,
        status: false,
        message:lang=="en"? "You already have an active session": "لديك جلسة نشطة بالفعل"
      });
    }

    const session = await WorkingSession.create({
      providerId,
      isWorking: true,
      startTime: new Date()
    });

    return res.status(200).send({
      code:200,
      status: true,
      message: lang=="en"?"Session started": "تم بدء الجلسة بنجاح",
    });
  } catch (err) {
    next(err);
  }
};
const stopSession = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const lang= req.headers['accept-language'] || 'en';
    const session = await WorkingSession.findOne({ providerId, endTime: null });

    if (!session) {
      return res.status(400).send({
        status: false,
        code:400,
        message: lang=="en"?"No active session found": "لا توجد جلسة نشطة"
      });
    }

    session.endTime = new Date();
    session.isWorking = false;
    await session.save();

    return res.status(200).send({
      status: true,
      code:200,
      message: lang=="en"?"Session ended":"تم إنهاء الجلسة بنجاح"
    });
  } catch (err) {
    next(err);
  }
};

module.exports={
   startSession,
   stopSession
}
