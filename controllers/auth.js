const statusCode = require("http-status-codes");
const User = require("../models/auth");

const { generateRandomOtp } = require("./../services/otp-service");
const sendEmail = require("./../services/email");

const { BadRequestError, UnauthenticatedError } = require("../errors");
const register = async (req, res) => {
  // const isExisting = await User.findOne({
  //   email: req.body.email
  // })
  let otp = generateRandomOtp();
  let otpExpiration = Date.now() + 10 * 60000;

  const user = await User.create({ ...req.body, otp, otpExpiration });

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
      user,
      
    },
    message: "User created succesfully",
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

  const token = user.createJWT();
  res.status(statusCode.OK).json({
    user: {
      ...user._doc,
      token,
    },
    status: "success",
  });
};

module.exports = {
  register,
  login,
};
