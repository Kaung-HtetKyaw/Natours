const AppError = require("../utils/api/AppError");

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV == "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV == "production") {
    let normalizedError = { ...error, message: error.message };
    if (error.name == "CastError") {
      normalizedError = handleCastErrorDB(error);
    }
    if (error.code == 11000) {
      normalizedError = handleDuplicationErrorDB(error);
    }
    if (error.name == "ValidationError") {
      normalizedError = handleValidationErrorDB(error);
    }
    if (error.name == "JsonWebTokenError") {
      normalizedError = handleJWTError();
    }
    if (error.name == "TokenExpiredError") {
      normalizedError = handleJWTExpiredError();
    }
    sendErrorProd(normalizedError, res);
  }
};

function sendErrorDev(error, res) {
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

function handleCastErrorDB(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

function handleDuplicationErrorDB(error) {
  const keys = Object.keys(error.keyValue);
  const values = Object.values(error.keyValue);
  const errors = keys.map((key, i) => `${key}:${values[i]}`).join(", ");
  const message = `${errors} is already in use.`;
  return new AppError(message, 400);
}

function handleValidationErrorDB(error) {
  const errors = Object.values(error.errors)
    .map((el) => el.message)
    .join(". ");
  const message = `Invalid input data. ${errors}`;
  return new AppError(message, 400);
}

function handleJWTError() {
  return new AppError("Invalid token.Please log in again", 401);
}

function handleJWTExpiredError() {
  return new AppError("Token expired.Please log in again", 401);
}
