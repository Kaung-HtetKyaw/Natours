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
exports.getReview = handlerFactory.getOne(Review);
exports.updateReview = handlerFactory.updateOne(Review);

exports.getAllReviews = handlerFactory.getAll(Review);

exports.deleteReview = handlerFactory.deleteOne(Review);
