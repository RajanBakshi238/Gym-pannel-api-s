const statusCode = require("http-status-codes");
const User = require("../models/auth");

const { BadRequestError, UnauthenticatedError } = require("../errors");
const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(statusCode.CREATED).json({
    status: "success",
    data: {
      user,
      token,
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
  login
};
