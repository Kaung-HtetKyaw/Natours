module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV == "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV == "production") {
    sendErrorProd(error, res);
  }
};

function sendErrorDev(error, res) {
  res.status(error.statucCode).json({
    status: status.error,
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
