const Tour = require("../model/Tours");
const { catchAsyncError } = require("../utils/error");

exports.getOverview = catchAsyncError(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", { tours, title: "All Tours" });
});

exports.getTour = catchAsyncError(async (req, res) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    select: "review rating user",
  });
  res.status(200).render("tour", { tour });
});
