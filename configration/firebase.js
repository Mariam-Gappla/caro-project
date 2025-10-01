const admin = require("firebase-admin");
const serviceAccount = require("../firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://carno-ba33e-default-rtdb.firebaseio.com"
});

// اعملي instance للـ DB
const db = admin.database();

// صدّريه علشان أي فايل يقدر يستخده
module.exports = db;
