const statusCode = require("http-status-codes");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/auth");
const { generateRandomOtp } = require("./../services/otp-service");
const sendEmail = require("./../services/email");
const { BadRequestError, UnauthenticatedError } = require("../errors");
4;
const register = async (req, res) => {
  // const isExisting = await User.findOne({
  //   email: req.body.email
  // })
  let otp = generateRandomOtp();
  let otpExpiration = Date.now() + 10 * 60000;

  const filteredObj = {
    ...req.body,
    otp,
    otpExpiration,
    ...(req.file ? { profilePic: req.file.filename } : {}),
  };

  const user = await User.create(filteredObj);

  const _doc = user.toObject();
  delete _doc.otp;
  delete _doc.otpExpiration;

  //send email
  const response = await sendEmail({
    email: req.body.email,
    subject: "OTP for verifying account (Valid for 10 min)",
    message: `Your OTP for account verification is ${otp}. Valid for 10 minutes only`,
  });

  // console.log(response, "response of sended email");

  // const token = user.createJWT();
  res.status(statusCode.CREATED).json({
    status: "success",
    data: {
      ..._doc,
    },
    message: "OTP succesfully sent. Please verify your account. ",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password.");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  if (!user.isVerified) {
    throw new BadRequestError("Yet not verified , Please verify first.");
  }

  const token = user.createJWT();
  res.status(statusCode.OK).json({
    user: {
      ...user._doc,
      token,
    },
    status: "success",
  });
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new BadRequestError("Email and OTP required.");
  }

  const exist = await User.findOne({ email }).select("+otp +otpExpiration");
  // console.log(exist, "??????")

  if (!exist) {
    throw new BadRequestError("User Doesn't exist.");
  }

  if (exist.isVerified) {
    throw new BadRequestError("Account already verified.");
  }

  if (otp != exist.otp || Date.now() > exist.otpExpiration) {
    throw new BadRequestError("Invalid Or Expired OTP");
  }

  const updatedUser = await User.findByIdAndUpdate(exist._id, {
    $set: { isVerified: true },
  });

  const token = exist.createJWT();
  res.status(statusCode.OK).json({
    user: {
      ...updatedUser._doc,
      token,
    },
    message: "User verified successfully",
    status: "success",
  });
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError("Email Required");
  }

  const user = await User.findOne({ email }).select("+otp +otpExpiration");

  if (!user) {
    throw new BadRequestError("User Doesn't exist with the specified email id");
  }

  if (user.isVerified) {
    throw new BadRequestError("Account already verified.");
  }

  let otp = generateRandomOtp();
  let otpExpiration = Date.now() + 10 * 60000;

  user.otp = otp;
  user.otpExpiration = otpExpiration;

  await user.save();
  // await user.save({ validateBeforeSave: false });

  const response = await sendEmail({
    email: req.body.email,
    subject: "OTP for verifying account (Valid for 10 min)",
    message: `Your OTP for account verification is ${otp}. Valid for 10 minutes only`,
  });

  res.status(statusCode.OK).json({
    status: "success",
    message: "OTP sent successfully.",
  });
};

const googleAuthVerification = async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) {
    throw new BadRequestError("please provide Id Token");
  }
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: id_token,
    audience: GOOGLE_CLIENT_ID,
  });

  const profile = ticket.getPayload();

  let existInDB = await User.findOne({ email: profile?.email });

  if (!existInDB) {
    existInDB = await User.create(
      [
        {
          name: profile?.name,
          email: profile?.email,
          isVerified: true,
        },
      ],
      { validateBeforeSave: false }
    );
  }
  res.status(statusCode.OK).json({
    user: {
      ...existInDB[0]._doc,
      token: existInDB[0].createJWT(),
    },

    status: "success",
  });
};

module.exports = {
  register,
  login,
  googleAuthVerification,
  verifyOtp,
  resendOtp,
};
