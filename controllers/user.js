const statusCode = require("http-status-codes");
const User = require("../models/auth");

const getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(statusCode.OK).json({
    status: "success",
    data: {
      users,
    },
  });
};

module.exports = {
  getAllUsers,
};
