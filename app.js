const express = require("express");
const morgam = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const AppError = require("./utils/api/AppError");
const { minutes } = require("./utils/time");
const globalErrorHandler = require("./controller/error");

const tourRouter = require("./routes/tours");
const userRouter = require("./routes/users");

const app = express();

// GLOBAL MIDDLEWARES
// set HTTP header
app.use(helmet());
// dev logger
if (process.env.NODE_ENV === "development") {
  app.use(morgam("dev"));
}

// body parser
app.use(express.json());
// rate limiting
const limiter = rateLimit({
  max: 2,
  windowMs: minutes(15),
  message: "Too many requests from this IP. Please try again in an hour.",
});
app.use("/api", limiter);
// serving static files
app.use(express.static(`${__dirname}/public`));

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
