const Tour = require("../model/Tours");
const { catchAsyncError } = require("../utils/error");

exports.getOverview = catchAsyncError(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", { tours, title: "All Tours" });
});

exports.getTour = (req, res) => {
  res.status(200).render("tour", { title: "The Park Camper" });
};
