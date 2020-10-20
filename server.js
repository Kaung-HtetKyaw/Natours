const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");

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

//start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} 🔥 `);
});

process.on("unhandledRejection", (error) => {
  console.error(error.name, error.message);
  console.log("UNHANDLED REJECTIONS! Shutting down.....🔐");
  // finished all pending req and close the server gracefully first
  // and terminate the process
  server.close(() => {
    process.exit(1);
  });
});
