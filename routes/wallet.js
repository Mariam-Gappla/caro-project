const express=require("express");
const router=express.Router();
const {deposit,getBalance,getTransactions,withdraw}=require("../controllers/wallet");
//router.post("/wallet/create-order", createOrder);   // يبدأ عملية الدفع
router.post("/deposit", deposit);
router.get("/balance", getBalance);  // يجيب الرصيد
router.get("/transactions", getTransactions); // يجيب العمليات
router.post("/withdraw", withdraw);





module.exports=router;