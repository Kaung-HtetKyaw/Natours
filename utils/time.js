exports.seconds = (sec = 1) => {
  return sec * 1000;
};
exports.minutes = (min = 1) => {
  return min * this.seconds() * 60;
};
exports.hours = (hr = 1) => {
  return hr * this.minutes() * 60;
};
exports.days = (day = 1) => {
  return day * this.hours() * 24;
};
