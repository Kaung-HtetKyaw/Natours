const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { minutes } = require("./time");

exports.uniqueID = () => {
  return `${Math.random().toString(36).substr(2, 9)}-${Math.random()
    .toString(36)
    .substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
};

exports.makeMap = (lists) => {
  const reservedKeys = lists.split(",");
  let map = {};
  reservedKeys.forEach((key) => {
    map[key.trim()] = true;
  });
  return (key) => {
    return map[key] ? map[key] : false;
  };
};

exports.radiusToRadian = (distance, unit) => {
  return unit === "mi" ? distance / 3963.2 : distance / 6378.1;
};

exports.generateHashedToken = () => {
  const unhashedToken = crypto.randomBytes(32).toString("hex"); // normal token which will be sent to client
  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex"); // encrypted whick will be stored in the db
  const expiresAt = (duration = minutes(10)) => {
    return Date.now() + duration;
  }; // will expires after 10 mins
  return { unhashedToken, hashedToken, expiresAt };
};

exports.generateAccessToken = () => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.genereatRefreshToken = () => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};
