const jwt = require("jsonwebtoken");

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

exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
