const rootDir = require("../utils/path");
const { catchAsyncError } = require("../utils/error");
const APIFeatures = require("../utils/api/APIFeatures");
const AppError = require("../utils/api/AppError");
const handlerFactory = require("../factory/handler");
//Model
const Tour = require(`${rootDir}/model/Tours`);

//Posts route handlers
exports.getAllTours = catchAsyncError(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  //execute the query
  const tours = await features.query;
  //return response
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});
exports.getTour = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({ path: "reviews" });
  if (!tour) {
    next(new AppError(`Cannot find tour with id ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({
    status: "success",
    data: { tour },
  });
});
exports.createNewTour = catchAsyncError(async (req, res, next) => {
  const newTour = await Tour.create({ ...req.body });
  res.status(201).json({
    status: "success",
    data: newTour,
  });
});
exports.updateTour = catchAsyncError(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    next(new AppError(`Cannot find tour with id ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({
    status: "success",
    data: tour,
  });
});
exports.deleteTour = handlerFactory.deleteOne(Tour);
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};
exports.getTourStats = catchAsyncError(async (req, res) => {
  const tours = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        avgRating: { $avg: "$ratingsAverage" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});
exports.getMonthlyPlans = catchAsyncError(async (req, res, next) => {
  const year = req.params.year;
  const plans = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTours: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: "success",
    results: plans.length,
    data: {
      plans,
    },
  });
});
