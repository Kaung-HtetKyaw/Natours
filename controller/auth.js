const User = require("../model/Users");
const AppError = require("../utils/api/AppError");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");

const { catchAsyncError } = require("../utils/error");
const { sendEmail } = require("../utils/email");
const { days } = require("../utils/time");

exports.signUp = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
  }); // dont save the whole req body
  createTokenAndSend(newUser, res, 201, true);
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
  createTokenAndSend(user, res, 200);
});

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
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
  // verify the token, if not valid, will thorw error automatically
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  //check user still exists
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }
  // check password is changed after token was issued
  if (user.passwordChangedAfterIssued(decodedToken.iat)) {
    return next(
      new AppError("Password was changed recently. Please log in again.", 401)
    );
  }
  // provide user information for next middlewares and handlers
  req.user = user;
  next();
});

exports.isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  // check if user with email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError("There is no user with email address you provided", 404)
    );
  }
  // generate the reset token and store it
  const resetToken = user.generateResetPasswordToken();
  user.save({ validateBeforeSave: false }); // to avoid validating again for certain fields

  // send it to user email and handling potential error from sendEmail(nodemailer)
  try {
    await sendEmail(generateMailOptions(req, resetToken, user));
    res.status(200).json({
      status: "success",
      message: "Reset URL have already been sent to your email address",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending email. Please try again", 500)
    );
  }
});
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  // find the user with given reset token which is still valid
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });
  // if token still valid and user exists , set the new password
  if (!user) {
    return next(
      new AppError("Invalid token or Token has already expired", 400)
    );
  }
  user.password = req.body.password;
  user.confirmedPassword = req.body.confirmedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  // return the response with new jwt token
  createTokenAndSend(user, res, 200);
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  // get the user
  const user = await User.findById(req.user._id).select("+password"); // user obj coming from isAuthenticated middleware
  if (!user) {
    return next(
      new AppError("There is no user with email address you provided", 404)
    );
  }
  // verify the password
  const isCorrectPassword = user.isCorrectPassword(
    req.body.currentPassword,
    user.password
  );
  if (!isCorrectPassword) {
    return next(new AppError("Your old password is incorrect", 401));
  }
  // update the password
  user.password = req.body.password;
  user.confirmedPassword = req.body.confirmedPassword;
  await user.save();
  // return response
  createTokenAndSend(user, res, 200);
});

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function generateMailOptions(req, resetToken, user) {
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetPassword/${resetToken}`;
  const message = `Forget Password? Please send a PATCH request to ${resetURL} along with your email address and new password`;
  return {
    email: user.email,
    subject: "Your password reset token (valid for 10 mins)",
    message,
  };
}

function createTokenAndSend(user, res, statusCode, data = false) {
  const token = generateToken(user._id);
  let response = {
    status: "success",
    token,
  };
  if (data) response.data = { user };
  // create and attached it to response
  const cookieOptions = {
    expires: new Date(Date.now() + days(process.env.JWT_COOKIE_EXPIRES_IN)),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  if (process.env.NODE_ENV == "production") cookieOptions.secure = true;
  // send the response
  res.status(statusCode).json(response);
}
