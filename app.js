const express = require("express");
const morgam = require("morgan");

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
  const error = new Error(`Cannont find ${req.originalUrl} on this server`);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  next(error);
});
//global error handling middleware
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

//export the app intance for starting server
module.exports = app;
