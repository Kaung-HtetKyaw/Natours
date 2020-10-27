const Review = require("../model/Reviews");
const Tour = require("../model/Tours");
const AppError = require("../utils//api/AppError");
const handlerFactory = require("../factory/handler");

const { catchAsyncError } = require("../utils/error");

exports.setTourAndUserID = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
exports.createNewReview = handlerFactory.createOne(Review);

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
