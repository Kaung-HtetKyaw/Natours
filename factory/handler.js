const { catchAsyncError } = require("../utils/error");
const AppError = require("../utils/api/AppError");
exports.deleteOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      next(
        new AppError(`Cannot find a document with id ${req.params.id}`, 404)
      );
      return;
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};

exports.createOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    const doc = await Model.create({ ...req.body });
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      next(new AppError(`Cannot find tour with id ${req.params.id}`, 404));
      return;
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
};
