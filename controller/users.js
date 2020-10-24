const User = require("../model/Users");
const APIFeatures = require("../utils/api/APIFeatures");
const AppError = require("../utils/api/AppError");
const { catchAsyncError } = require("../utils/error");
const { makeMap } = require("../utils/utils");
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
// update my info
exports.updateInfo = catchAsyncError(async (req, res, next) => {
  // don't allow password
  if (!!req.body.password) {
    return next(
      new AppError(
        "Password cannot be updated on this route.Use /updatePassword instead",
        400
      )
    );
  }
  // filter the request body
  const filteredBody = filterRequestBody(req.body, "name,email");
  // update user info
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  console.log(user);
  // return response
  res.status(200).json({
    status: "success",
    data: { user },
  });
});
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

function filterRequestBody(body, fields) {
  const allowedFields = makeMap(fields);
  let filteredBody = {};
  for (const key in body) {
    if (allowedFields(key)) filteredBody[key] = body[key];
  }
  return filteredBody;
}
