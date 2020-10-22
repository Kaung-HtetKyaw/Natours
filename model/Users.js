const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
});

// plain text password to encrypted password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmedPassword = undefined; // removing because dont need it anymore
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

const User = mongoose.model("User", userSchema);
module.exports = User;
