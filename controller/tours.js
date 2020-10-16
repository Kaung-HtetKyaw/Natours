const rootDir = require("../utils/path");
const API_Features = require("../utils/api/API_Features");
//Model
const Tour = require(`${rootDir}/model/Tours`);

//Posts route handlers
exports.getAllTours = async (req, res) => {
  try {
    const features = new API_Features(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //execute the query
    const tours = await features.query;
    //return response
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "error",
      message: error,
    });
  }
};
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: { tour },
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error,
    });
  }
};
exports.createNewTour = async (req, res) => {
  try {
    const newTour = await Tour.create({ ...req.body });
    res.status(201).json({
      status: "success",
      data: newTour,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: tour,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id, {}, () => {
      console.log("Deleted a Post 😓 ");
      res.status(204).json({
        status: "success",
        data: null,
      });
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error,
    });
  }
};
