const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { reset } = require("nodemon");
const { minutes } = require("../utils/time");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  role: {
    type: String,
    default: "user",
    enum: {
      values: ["user", "guide", "lead", "admin"],
      message: "Invalid Role.",
    },
  },
  email: {
    type: String,
    required: [true, "Please provide a email!"],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email address",
    },
    lowercase: true,
  },
  photo: {
    type: String,
    default:
      "https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
  },
  confirmedPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Password don't match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// plain text password to encrypted password only when user create new or update
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmedPassword = undefined; // removing because dont need it anymore
  next();
});

// only run for updating password
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 2000; // substracting 2s cuz issuing a jwt token will finish before the doc is saved so that'll be error otherwise
  next();
});
// query middleware to exclude inactive users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// create instance methods
userSchema.methods.isCorrectPassword = async function (
  plainPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
//check if password is changed after the token was issued
userSchema.methods.passwordChangedAfterIssued = function (JWT_iat) {
  if (this.passwordChangedAt) {
    const pwdChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return pwdChangedTime > JWT_iat;
  }
  return false;
};
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); // normal token which will be sent to client
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); // encrypted whick will be stored in the db
  console.log({ resetToken, passwordResetToken: this.passwordResetToken });
  this.passwordResetExpiresAt = Date.now() + minutes(10); // will expires after 10 mins
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
