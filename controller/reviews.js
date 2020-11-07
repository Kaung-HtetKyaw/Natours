const Review = require("../model/Reviews");
const handlerFactory = require("../factory/handler");

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
