const mongoose = require("mongoose");
const Tour = require("./Tours");

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

// static methods
reviewSchema.statics.calculateStats = async function (tourId) {
  // this points to the current model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};
// pre and post middleware
reviewSchema.post("save", function () {
  // Review is not yet defined at this point, so use this.constructor
  this.constructor.calculateStats(this.tour);
});

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
