const Tour = require("../model/Tours");
const AppError = require("../utils/api/AppError");
const { catchAsyncError } = require("../utils/error");

exports.getOverview = catchAsyncError(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", { tours, title: "All Tours" });
});

exports.getTour = catchAsyncError(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    select: "review rating user",
  });
  if (!tour) {
    return next(new AppError("There is no tour with the slug provided", 404));
  }
  res.status(200).render("tour", { tour });
});

exports.getLogin = async (req, res) => {
  res.status(200).render("login");
};

exports.getSignUp = async (req, res) => {
  res.status(200).render("signup");
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};
