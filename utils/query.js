const Tour = require("../model/Tours");
const { makeMap } = require("./utils");

exports.whiteListedQueryParams = [
  "duration",
  "ratingsQuantity",
  "ratingsAverage",
  "maxGroupSize",
  "difficulty",
  "price",
];

exports.normalizeQueryObject = (queryObject, reservedQueryParams) => {
  //normalize query obj
  let normalizeQueryObj = Object.assign({}, queryObject);
  for (const key in queryObject) {
    if (reservedQueryParams(key)) {
      delete normalizeQueryObj[key];
    }
  }
  return normalizeQueryObj;
};
exports.normalizeOperators = (queryObject) => {
  let queryString = JSON.stringify(queryObject);
  queryString = queryString.replace(
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`
  );
  return JSON.parse(queryString);
};
exports.filterQuery = (queryObject) => {
  //reserved query strings
  const reservedQueryParams = makeMap("limit,page,sort,fields");
  const normalizedQueryObject = this.normalizeQueryObject(
    queryObject,
    reservedQueryParams
  );
  return this.normalizeOperators(normalizedQueryObject);
};
//populate the query for sorting
exports.sortQuery = (mongooseQuery, sortingOptions) => {
  if (sortingOptions) {
    const sortBy = sortingOptions.split(",").join(" ");
    return mongooseQuery.sort(sortBy);
  } else {
    return mongooseQuery.sort("-createdAt");
  }
};
//populate the query for limiting the fields
exports.limitFields = (mongooseQuery, wantedFields) => {
  if (wantedFields) {
    const normalizedFields = wantedFields.split(",").join(" ");
    return mongooseQuery.select(normalizedFields);
  } else {
    return mongooseQuery.select("-__v");
  }
};
//pagination
exports.paginateTours = async (mongooseQuery, pageQuery, limitQuery) => {
  const page = Number(pageQuery) || 1;
  const limit = Number(limitQuery) || 100;
  const skip = (page - 1) * limit;
  if (pageQuery) {
    const toursCount = await Tour.countDocuments();
    if (skip >= toursCount) {
      return null;
    }
    return mongooseQuery.skip(skip).limit(limit);
  }
};
