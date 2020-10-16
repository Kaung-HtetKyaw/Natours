const { normalizeOperators, normalizeQueryObject } = require("../query");
const { makeMap } = require("../utils");
class API_Features {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const reservedQueryParams = makeMap("limit,page,sort,fields");
    //exclude the reserved fields
    let normalizedQueryObject = normalizeQueryObject(
      this.queryString,
      reservedQueryParams
    );
    //cahnge lte,gte,gt,lt => $lte,$gre,$lt,$gt
    normalizedQueryObject = normalizeOperators(normalizedQueryObject);
    this.query = this.query.find(normalizedQueryObject);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const normalizedFields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(normalizedFields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = API_Features;
