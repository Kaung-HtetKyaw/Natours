const Review = require("../model/Reviews");
const Tour = require("../model/Tours");
const AppError = require("../utils//api/AppError");

const { catchAsyncError } = require("../utils/error");

exports.createNewReview = catchAsyncError(async (req, res, next) => {
  const { review, rating, tour } = req.body;
  const newReview = await Review.create({
    review,
    rating,
    tour: tour || req.params.tourId,
    user: req.user._id,
  });
  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: "success",
    resutls: reviews.length,
    data: { reviews },
  });
});
exports.getTourReviews = catchAsyncError(async (req, res, next) => {
  const isValidTour = await Tour.exists({ _id: req.params.tourId });
  if (!isValidTour) {
    return next(new AppError("Invalid tour id.", 404));
  }
  const reviews = await Review.findOne({ tour: req.params.tourId });
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
