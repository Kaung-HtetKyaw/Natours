const User = require("../model/Users");
const AppError = require("../utils/api/AppError");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");

const { catchAsyncError } = require("../utils/error");
const Email = require("../utils/email");
const { days, seconds } = require("../utils/time");

exports.signUp = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
  }); //! dont save the whole req body

  try {
    // sending mail to the user
    await sendVerificationMail(req, newUser);
    res.status(200).json({
      status: "success",
      message: `Verification email has been sent to your email address. Please verify your account`,
    });
  } catch (error) {
    newUser.verficationToken = undefined;
    newUser.verficationExpiresAt = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(
      new AppError(
        `There was an error sending verification email. Please try again`,
        500
      )
    );
  }
});

exports.verifyAccount = catchAsyncError(async (req, res, next) => {
  // find the user with given reset token which is still valid
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    verificationToken: hashedToken,
    verficationExpiresAt: { $gt: Date.now() },
  }).select("+pending");
  // if token still valid and user exists , set the new password
  if (!user) {
    return next(
      new AppError("Invalid token or Token has already expired", 400)
    );
  }
  if (user.pending !== true) {
    return next(new AppError("Your account has already been verified", 401));
  }
  user.pending = false;
  user.verificationToken = undefined;
  user.verficationExpiresAt = undefined;
  await user.save({ validateBeforeSave: false });
  // sending mail to the user
  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(user, url).sendWelcome();
  createTokenAndSend(user, res, 201, true);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  //check if both email and password are provided
  if (!email || !password) {
    return next(new AppError("Please provide both email and password", 400));
  }
  // check if user exits and password is correct
  const user = await User.findOne({ email }).select("+password +pending");
  const isCorrectPassword = !!user
    ? await user.isCorrectPassword(password, user.password)
    : false;
  if (!user || !isCorrectPassword) {
    return next(new AppError("Invalid email or password", 401));
  }
  // if account is not verified
  if (user.pending === true) {
    try {
      await sendVerificationMail(req, user);
      return res.status(200).json({
        status: "success",
        message: `Your account is not verified yet. Verification email has been sent to your email address`,
      });
    } catch (error) {
      user.verficationToken = undefined;
      user.verficationExpiresAt = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          `There was an error sending verification email. Please try again`,
          500
        )
      );
    }
  }
  // send response back to client
  createTokenAndSend(user, res, 200, true);
});

// logging out the user by replacing the existing cookie with invalid cookie
exports.logout = (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + seconds(10)),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  // check if token exists in http headers
  let token = retrieveTokenFromCookieOrHeader(req);
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
  res.locals.user = user;
  console.log(res.locals);
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

exports.isLoggedIn = async (req, res, next) => {
  try {
    // check if token exists in http headers/cookies
    let token = retrieveTokenFromCookieOrHeader(req);
    if (token) {
      // verify the token, if not valid, will thorw error automatically
      const decodedToken = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      //check user still exists
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return next();
      }
      // check password is changed after token was issued
      if (user.passwordChangedAfterIssued(decodedToken.iat)) {
        return next();
      }
      // provide user information for next middlewares and handlers
      res.locals.user = user;
      console.log(req.locals);
      return next();
    }
    return next();
  } catch (error) {
    return next();
  }
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
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
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

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function retrieveTokenFromCookieOrHeader(request) {
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    token = request.headers.authorization.split(" ")[1];
  } else if (request.cookies.jwt) {
    token = request.cookies.jwt;
  }
  return token;
}

function createTokenAndSend(user, res, statusCode, data = false) {
  const token = generateToken({ id: user._id });
  let response = {
    status: "success",
    token,
  };
  if (data) {
    user.password = undefined;
    response.data = user;
  }
  // create and attached it to response
  const cookieOptions = {
    expires: new Date(Date.now() + days(process.env.JWT_COOKIE_EXPIRES_IN)),
    httpOnly: true,
  };
  if (process.env.NODE_ENV == "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  // send the response
  res.status(statusCode).json(response);
}

async function sendVerificationMail(req, user) {
  // generate the verfication token
  const verficationToken = user.generateVerifyToken();
  await user.save({ validateBeforeSave: false });
  // sending mail to the user
  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/verify/${verficationToken}`;
  await new Email(user, url).sendVerfication();
}
