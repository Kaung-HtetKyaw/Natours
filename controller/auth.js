const { catchAsyncError } = require("../utils/error");
const User = require("../model/Users");
const jwt = require("jsonwebtoken");

exports.signUp = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
  });
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});
