const express = require('express');
const router = express.Router();
const {addReply,getReplies}=require("../controllers/centerReplies");
router.post('/',addReply);
router.get('/:id',getReplies);





module.exports = router;
