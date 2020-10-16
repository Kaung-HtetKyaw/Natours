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
app.use((req, res) => {
  res.status(404).send(`<h1>Page Not Found.</h1>`);
});

//export the app intance for starting server
module.exports = app;
