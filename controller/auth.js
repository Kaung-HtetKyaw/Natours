const { catchAsyncError } = require("../utils/error");
const User = require("../model/Users");

exports.signUp = catchAsyncError(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(200).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
