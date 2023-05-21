const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyOtp,
  resendOtp,
} = require("../controllers/auth");

const {uploadUserPhoto, resizeUserPhoto} = require('../middleware/multer')


router.post("/register", uploadUserPhoto, resizeUserPhoto, register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resendOtp", resendOtp);

module.exports = router;
