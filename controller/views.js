const Tour = require("../model/Tours");
const Booking = require("../model/Bookings");
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
  res.status(200).render("login", { title: "Login" });
};

exports.getSignUp = async (req, res) => {
  res.status(200).render("signup", { title: "Sign Up" });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};

exports.getPasswordReset = (req, res) => {
  res.status(200).render("passwordReset", {
    title: "Reset Your Password",
  });
};

// get the tours the user has booked before
exports.getMyTours = catchAsyncError(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIds = bookings.map((booking) => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render("overview", {
    title: "My Bookings",
    tours,
  });
});
