const AppError = require("../utils//api/AppError");
const handlerFactory = require("../factory/handler");
const { catchAsyncError } = require("../utils/error");
const Tour = require("../model/Tours");
const Booking = require("../model/Bookings");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.getCheckoutSession = catchAsyncError(async (req, res, next) => {
  // get tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(
      new AppError("The tour you tried to book is no longer available", 404)
    );
  }
  // create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?tour=${tour.id}&user=${
      req.user.id
    }&price=${tour.price}`, //! temporary
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name}`,
        description: `${tour.summary}`,
        images: ["https://www.natours.dev/img/tours/tour-2-cover.jpg"],
        amount: tour.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
  });
  // return response
  res.status(200).json({
    status: "success",
    session,
  });
});

// !this is temporary solution, unsecure, anyone can book a tour without paying
exports.createBookingCheckout = catchAsyncError(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();
  const newBooking = await Booking.create({ tour, user, price });
  res.redirect(`${req.originalUrl.split("?")[0]}`);
});

exports.getAllBookings = handlerFactory.getAll(Booking);
exports.getBooking = handlerFactory.getOne(Booking);
exports.createBooking = handlerFactory.createOne(Booking);
exports.updateBooking = handlerFactory.updateOne(Booking);
exports.deleteBooking = handlerFactory.deleteOne(Booking);
