const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("./../models/auth");
const { UnauthenticatedError } = require("../errors");

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // console.log(token, "......token");

  if (!token)
    throw new UnauthenticatedError(
      "You are not logged in! Please log in to get access."
    );

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decoded, ">>>>>decoded");

  const freshUser = await User.findById(decoded.id);

  if (!freshUser)
    throw new UnauthenticatedError(
      "The user belonging to this token no longer exist."
    );

  req.user = freshUser;
  next();
};
