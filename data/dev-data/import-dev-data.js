const mongoose = require("mongoose");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Tour = require("../../model/Tours");
const Reviews = require("../../model/Reviews");
const Users = require("../../model/Users");

//connect to mongodb
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connection successful!🔥");
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));

const importData = async () => {
  try {
    await Tour.create(tours);
    await Reviews.create(reviews);
    await Users.create(users, { validateBeforeSave: false });
    console.log("Data sucessfully imported 😆");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Reviews.deleteMany();
    await Users.deleteMany();
    console.log("Data successfully deleted ❎");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] == "--import") {
  importData();
} else if (process.argv[2] == "--delete") {
  deleteData();
}
