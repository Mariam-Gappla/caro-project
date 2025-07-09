const express=require("express");
const router=express.Router();
const {submitWinchVerification,uploadWinchImages,uploadTireImages,submitTireVerification}=require("../controllers/serviceProviderVerification");
const upload=require("../configration/uploadFile");
router.post("/submitWinchVerification",submitWinchVerification);
router.post(
  "/uploadWinchImages",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "nationalIdImage", maxCount: 1 },
    { name: "licenseImage", maxCount: 1 },
    { name: "carRegistrationImage", maxCount: 1 },
    { name: "carImage", maxCount: 1 },
  ]),
  uploadWinchImages
);
router.post(
  "/uploadTireImages",
  upload.fields([
    { name: "profileImage", maxCount: 1 }
  ]),
  uploadTireImages
);
router.post("/submitTireVerification",submitTireVerification);
















module.exports=router;