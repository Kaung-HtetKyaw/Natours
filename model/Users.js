const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email!"],
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email address",
    },
  },
  photo: {
    type: String,
    default:
      "https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
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
});

const User = mongoose.model("User", userSchema);
module.exports = User;
