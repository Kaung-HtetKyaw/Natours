const AppError = require("../utils/api/AppError");

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV == "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV == "production") {
    let normalizedError = Object.assign({}, error);
    if (error.stack.split(":")[0] == "CastError") {
      normalizedError = handleCastError(error);
    }
    sendErrorProd(normalizedError, res);
  }
};

function sendErrorDev(error, res) {
  console.log(error);
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error: error,
    stack: error.stack,
  });
}
function sendErrorProd(error, res) {
  // catch the operational errors
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
  // catch Programming,unexpected errors
  else {
    console.error("Error ❎", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

function handleCastError(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}
