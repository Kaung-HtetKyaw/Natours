const { catchAsyncError } = require("../utils/error");
const APIFeatures = require("../utils/api/APIFeatures");
const AppError = require("../utils/api/AppError");

exports.getOne = (Model, populateOptions) => {
  return catchAsyncError(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      next(new AppError(`Cannot find document with id ${req.params.id}`, 404));
      return;
    }
    res.status(200).json({
      status: "success",
      data: { data: doc },
    });
  });
};

exports.getAll = (Model) => {
  return catchAsyncError(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //execute the query
    const docs = await features.query.explain();
    //return response
    res.status(200).json({
      status: "success",
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
};

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
      next(new AppError(`Cannot find document with id ${req.params.id}`, 404));
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
