exports.catchAsyncError = (cb) => {
  return (req, res, next) => {
    cb(req, res, next).catch((error) => {
      next(error);
    });
  };
};
