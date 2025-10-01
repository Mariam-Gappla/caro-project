const db = require("../configration/firebase");
const User = require("../models/user");
const addMessage = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const { senderId, receiverId, text } = req.body;

        if (!senderId || !receiverId || !text) {
            return res.status(400).send({
                status: false,
                code: 400,
                message: "Missing fields"
            });
        }

        const conversationId =
            senderId < receiverId
                ? `${senderId}_${receiverId}`
                : `${receiverId}_${senderId}`;

        const newMessage = {
            senderId,
            receiverId,
            text,
            createdAt: Date.now(),
            isRead: false,
        };

        const ref = db.ref(`messages/${conversationId}`).push();
        await ref.set(newMessage);

        const updates = {};
        updates[`conversations/${senderId}/${receiverId}`] = {
            lastMessage: text,
            lastMessageTime: newMessage.createdAt,
        };
        updates[`conversations/${receiverId}/${senderId}`] = {
            lastMessage: text,
            lastMessageTime: newMessage.createdAt,
        };

        await db.ref().update(updates);

        res.status(200).send({
            code: 200,
            status: true,
            message: lang == "en" ? "your message send successfully" : "تم ارسال الرساله بنجاح",
            data: { ...newMessage }

        });
    } catch (err) {
        next(err)
    }

}
const getConversations = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const userId = req.user.id;
        const snapshot = await db.ref(`conversations/${userId}`).once("value");
        if (!snapshot.exists()) {
            return res.send({
                code: 200,
                status: true,
                message: lang == "en" ? "there is no messages" : "لا توجد رسائل",
                data: []
            });
        }

        const convs = snapshot.val();

        let conversations = Object.keys(convs).map((otherUserId) => ({
            otherUserId,
            ...convs[otherUserId],
        }));

        conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

        const otherUserIds = conversations.map((c) => c.otherUserId);
        const users = await User.find(
            { _id: { $in: otherUserIds } },
            "username image"
        ).lean();

        const usersMap = {};
        users.forEach((u) => {
            usersMap[u._id.toString()] = u;
        });

        const result = await Promise.all(
            conversations.map(async (c) => {
                const convId =
                    userId < c.otherUserId
                        ? `${userId}_${c.otherUserId}`
                        : `${c.otherUserId}_${userId}`;

                const messagesSnap = await db
                    .ref(`messages/${convId}`)
                    .orderByChild("receiverId")
                    .equalTo(userId)
                    .once("value");

                let unreadCount = 0;
                if (messagesSnap.exists()) {
                    const msgs = messagesSnap.val();
                    unreadCount = Object.values(msgs).filter((m) => !m.isRead).length;
                }

                return {
                    otherUserId: c.otherUserId,
                    name: usersMap[c.otherUserId]?.username || "Unknown",
                    image: usersMap[c.otherUserId]?.image || null,
                    lastMessage: c.lastMessage,
                    lastMessageTime: c.lastMessageTime,
                    unreadCount, // 👈 الجديد
                };
            })
        );

        res.send({
            code: 200,
            status: true,
            message: lang == "en" ? "your request retrieved successfully" : "تم معالجه الطلب بنجاح",
            data: result
        });
    } catch (err) {
        next(err);
    }
};
const getMessagesBetweenTwoUsers = async (req, res, next) => {
    try {
        const lang = req.headers['accept-language'] || 'en';
        const user1 = req.user.id;
        const user2 = req.params.id;
        const conversationId =
            user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;

        const snapshot = await db.ref(`messages/${conversationId}`).once("value");
        if (!snapshot.exists()) {
            return res.send({
                code: 200,
                status: true,
                message: lang == "en" ? "there is no messages" : "لا توجد رسائل",
                data: []
            });
        }

        const messagesObj = snapshot.val();
        const messages = Object.keys(messagesObj).map((id) => ({
            id,
            ...messagesObj[id],
        }));

        messages.sort((a, b) => a.createdAt - b.createdAt);

        res.send({
            code: 200,
            status: true,
            message: lang == "en" ? "your request retrieved successfully" : "تم معالجه الطلب بنجاح",
            data: messages
        });
    } catch (err) {
        next(err)
    }
}
const markConversationAsRead = async (req, res, next) => {
  try {
    const { userId, otherUserId } = req.body; 
    // userId = اللي بيفتح المحادثة
    // otherUserId = الطرف التاني

    // نفس طريقة بناء conversationId
    const conversationId =
      userId < otherUserId
        ? `${userId}_${otherUserId}`
        : `${otherUserId}_${userId}`;

    const messagesRef = db.ref(`messages/${conversationId}`);

    // نجيب كل الرسائل اللي مستقبلها userId
    const snapshot = await messagesRef
      .orderByChild("receiverId")
      .equalTo(userId)
      .once("value");

    if (!snapshot.exists()) {
      return res.send({ 
        code:400,
        status:false,
        message: "No messages to mark as read" 
    });
    }

    const updates = {};
    snapshot.forEach((msgSnap) => {
      const msg = msgSnap.val();
      if (!msg.isRead) {
        updates[`${msgSnap.key}/isRead`] = true;
      }
    });

    // لو فيه رسائل لازم نحدثها
    if (Object.keys(updates).length > 0) {
      await messagesRef.update(updates);
    }

    res.send({ 
        code:200,
        status:true,
        message: "Messages marked as read" 
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
    addMessage,
    getMessagesBetweenTwoUsers,
    getConversations,
    markConversationAsRead
}