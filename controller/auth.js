const User = require("../model/Users");
const AppError = require("../utils/api/AppError");

const { catchAsyncError } = require("../utils/error");
const { generateToken } = require("../utils/utils");

exports.signUp = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
  });
  const token = generateToken(newUser._id);
  res.status(200).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  //check if both email and password are provided
  if (!email || !password) {
    return next(new AppError("Please provide both email and password", 400));
  }
  // check if user exits and password is correct
  const user = await User.findOne({ email }).select("+password");
  const isCorrectPassword = !!user
    ? await user.isCorrectPassword(password, user.password)
    : false;
  if (!user || !isCorrectPassword) {
    return next(new AppError("Invalid email or password", 401));
  }
  // send response back to client
  const token = generateToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.isAuthorized = catchAsyncError(async (req, res, next) => {
  // check if token exists in http headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in.Please log in to get access", 401)
    );
  }
  // verify the token

  //check user exists
  next();
});
