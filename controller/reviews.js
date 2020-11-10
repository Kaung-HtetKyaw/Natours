const Review = require("../model/Reviews");
const Booking = require("../model/Bookings");
const handlerFactory = require("../factory/handler");
const { catchAsyncError } = require("../utils/error");
const AppError = require("../utils/api/AppError");

exports.setTourAndUserID = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
exports.createNewReview = handlerFactory.createOne(Review);
exports.getReview = handlerFactory.getOne(Review);
exports.getAllReviews = handlerFactory.getAll(Review);
//! still have to add feature to allow only author delete or update his own review
exports.updateReview = handlerFactory.updateOne(Review);
exports.deleteReview = handlerFactory.deleteOne(Review);

exports.bookedTourBefore = catchAsyncError(async (req, res, next) => {
  // check if booking with the current user and tour exists
  const isBookedBefore = await Booking.exists({
    user: req.user.id,
    tour: req.params.tourId,
  });
  if (!isBookedBefore) {
    return next(
      new AppError("You had to book the tour in order to write a review.", 400)
    );
  }
  next();
});
