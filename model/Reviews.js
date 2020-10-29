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

// indices
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", function () {
  // Review is not yet defined at this point, so use this.constructor
  this.constructor.calculateStats(this.tour);
});

// recalculate the review stats for updating and deleting
// first, getting current document by executing current query and pass it to the query obj
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // this points to current query
  this.currentReview = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // this.findOne wont work at this point, cuz query've alreay executed
  await this.currentReview.constructor.calculateStats(this.currentReview.tour);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
