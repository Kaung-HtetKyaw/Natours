const mongoose = require("mongoose");

const options = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
      message: "Please write a review for this tour.",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please rate this tour"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Please provide a tour which this review belongs to"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Please provide an author"],
    },
  },
  options
);

//query middlewares
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
