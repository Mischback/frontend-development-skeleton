
const dirTree = require("directory-tree");
const _path = require("path");

const tree = dirTree(
  "build",
  {},
  (item, _path, stats ) => {
    console.log(item);
  }
);
