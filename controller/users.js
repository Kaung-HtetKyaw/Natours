const User = require("../model/Users");
const APIFeatures = require("../utils/api/APIFeatures");
const AppError = require("../utils/api/AppError");
const handlerFactory = require("../factory/handler");
const { catchAsyncError } = require("../utils/error");
const { makeMap } = require("../utils/utils");
const sharp = require("sharp");

const multer = require("multer");
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid File type.", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

//Users routes handlers
exports.getAllUsers = handlerFactory.getAll(User);
exports.getUser = handlerFactory.getOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.uploadUserPhoto = upload.single("photo");
exports.resizeUserPhoto = catchAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; // req.file.filename will be used when user photo name is saved to db
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
// update my info
exports.updateMe = catchAsyncError(async (req, res, next) => {
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
  let filteredBody = filterRequestBody(req.body, "name,email");
  if (req.file) filteredBody.photo = req.file.filename;
  // update user info
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // return response
  res.status(200).json({
    status: "success",
    data: { user },
  });
});
exports.updateUser = handlerFactory.updateOne(User);

exports.deleteMe = catchAsyncError(async (req, res, next) => {
  console.log(req.user);
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.deleteUser = handlerFactory.deleteOne(User);

function filterRequestBody(body, fields) {
  const allowedFields = makeMap(fields);
  let filteredBody = {};
  for (const key in body) {
    if (allowedFields(key)) filteredBody[key] = body[key];
  }
  return filteredBody;
}
