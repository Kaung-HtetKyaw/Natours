const express = require("express");
const morgam = require("morgan");

const AppError = require("./utils/api/AppError");
const globalErrorHandler = require("./controller/error");

const tourRouter = require("./routes/tours");
const userRouter = require("./routes/users");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgam("dev"));
}

app.use(express.json());

//route middlewares🌎
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

//catch 404 error ⚠
app.all("*", (req, res, next) => {
  next(new AppError(`Cannont find ${req.originalUrl} on this server`, 404));
});
//global error handling middleware
app.use(globalErrorHandler);

//export the app intance for starting server
module.exports = app;
