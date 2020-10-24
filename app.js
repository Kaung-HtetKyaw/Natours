const express = require("express");
const morgam = require("morgan");
const rateLimit = require("express-rate-limit");

const AppError = require("./utils/api/AppError");
const { minutes } = require("./utils/time");
const globalErrorHandler = require("./controller/error");

const tourRouter = require("./routes/tours");
const userRouter = require("./routes/users");

const app = express();

// global middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgam("dev"));
}

app.use(express.json());
const limiter = rateLimit({
  max: 2,
  windowMs: minutes(15),
  message: "Too many requests from this IP. Please try again in an hour.",
});
app.use("/api", limiter);

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
