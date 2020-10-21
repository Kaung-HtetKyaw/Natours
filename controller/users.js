const User = require("../model/Users");
const APIFeatures = require("../utils/api/APIFeatures");
const { catchAsyncError } = require("../utils/error");
//Users routes handlers
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query).limitFields();
  const users = await features.query;
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined yet...",
  });
};
exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined yet...",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined yet...",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined yet...",
  });
};
