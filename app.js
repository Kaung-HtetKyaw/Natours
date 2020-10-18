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
app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    message: `Cannont find ${req.originalUrl} on this server`,
  });
});

//export the app intance for starting server
module.exports = app;
