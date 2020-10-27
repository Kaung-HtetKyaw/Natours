const Review = require("../model/Reviews");
const Tour = require("../model/Tours");
const AppError = require("../utils//api/AppError");
const handlerFactory = require("../factory/handler");

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
  let filter = {};
  // check if there's tourId in params
  if (req.params.tourId) {
    const isValidTour = await Tour.exists({ _id: req.params.tourId });
    // check id is valid
    if (!isValidTour) {
      return next(new AppError("Invalid tour id.", 404));
    }
    filter = { tour: req.params.tourId };
  }
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: "success",
    resutls: reviews.length,
    data: { reviews },
  });
});

exports.deleteReview = handlerFactory.deleteOne(Review);
