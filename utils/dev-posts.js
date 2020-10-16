const fs = require("fs");
const rootDir = require('./path');

exports.readDevDataFile = () => {
  return JSON.parse(
    fs.readFileSync(`${rootDir}/data/dev-data/posts.json`, "utf-8")
  );
};

exports.writeDevDataFile = (data, cb) => {
  fs.writeFile(
     `${rootDir}/data/dev-data/posts.json`,
    JSON.stringify(data),
    cb
  );
};

exports.updateAPostFromDevData = (id, posts, newpost, cb) => {
  let post = posts.find((el) => el.id == id);
  //overwrite the original property
  for (const key in newpost) {
    post[key] = newpost[key];
  }
  //replace
  const index = posts.findIndex((el) => el.id == id);
  posts.splice(index, 1, post);
  this.writeDevDataFile(posts, cb(post));
};

exports.deleteAPostFromDevData = (id, posts, cb) => {
  const index = posts.findIndex((post) => post.id == id);
  posts.splice(index, 1);
  this.writeDevDataFile(posts, cb);
};