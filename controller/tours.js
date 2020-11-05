const rootDir = require("../utils/path");
const { catchAsyncError } = require("../utils/error");
const { radiusToRadian } = require("../utils/utils");
const sharp = require("sharp");
const multer = require("multer");

const APIFeatures = require("../utils/api/APIFeatures");
const AppError = require("../utils/api/AppError");
const handlerFactory = require("../factory/handler");
//Model
const Tour = require(`${rootDir}/model/Tours`);

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

// image uploading and processing
exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
exports.resizeTourImages = catchAsyncError(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  // resize cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // resize footage images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

//Posts route handlers
exports.getAllTours = handlerFactory.getAll(Tour);
exports.getTour = handlerFactory.getOne(Tour, { path: "reviews" });
exports.createNewTour = handlerFactory.createOne(Tour);
exports.updateTour = handlerFactory.updateOne(Tour);
exports.deleteTour = handlerFactory.deleteOne(Tour);

// get tours within a certain radius
// tours-within/400/centre/33.982591,-118.463966/mi
exports.getToursWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longtitude with the format lat,lng.",
        400
      )
    );
  }
  const radian = radiusToRadian(distance, unit);
  console.log(radian);
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radian] },
    },
  });
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

// get tour distances from a certain point
// tours-distances/33.982591,-118.463966/mi
exports.getToursDistances = catchAsyncError(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longtitude with the format lat,lng.",
        400
      )
    );
  }
  const multiplier = unit == "mi" ? 0.000621371 : 0.0001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});

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
