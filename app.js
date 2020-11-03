const express = require("express");
const morgam = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cookie_parser = require("cookie-parser");

const AppError = require("./utils/api/AppError");
const { minutes } = require("./utils/time");
const globalErrorHandler = require("./controller/error");
const { whiteListedQueryParams } = require("./utils/query");

const tourRouter = require("./routes/tours");
const userRouter = require("./routes/users");
const reviewRouter = require("./routes/reviews");
const viewRouter = require("./routes/views");

const app = express();

// GLOBAL MIDDLEWARES
// set HTTP header (should be used at the top)
app.use(helmet());

// dev logger
if (process.env.NODE_ENV === "development") {
  app.use(morgam("dev"));
}

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
// body parser
app.use(express.json({ limit: "10kb" }));
app.use(cookie_parser());

// data sanitization (should be after body parser to clean after the body is parsed)
// against NOSQL query injections
app.use(mongoSanitize());
// against XSS
app.use(xss());

// rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: minutes(15),
  message: "Too many requests from this IP. Please try again in an hour.",
});
app.use("/api", limiter);
// prevent parameter pollution
app.use(
  hpp({
    whitelist: whiteListedQueryParams,
  })
);
app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});
app.use("/", viewRouter);
//route middlewares🌎
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

//catch 404 error ⚠
app.all("*", (req, res, next) => {
  next(new AppError(`Cannont find ${req.originalUrl} on this server`, 404));
});
//global error handling middleware
app.use(globalErrorHandler);

//export the app intance for starting server
module.exports = app;
