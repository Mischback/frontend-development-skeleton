
const dirTree = require("directory-tree");
const _path = require("path");
const crypto = require("crypto");
const fs = require("fs");

function fileHash(file) {
  console.log("[fileHash] " + "foo");
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(file);
    stream.on("error", err => reject(err));
    stream.on("data", chunk => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function typeFileCallback(item, _path, stats) {
  console.log("[typeFileCallback] " + item.path);
  fileHash(item.path).then((hash) => {
    console.log("[typeFileCallback] hash computation completed!")
    return hash;
  });
}


const main = function() {
  console.log("[start]");

  var result_tree = dirTree(
    "build",
    {},
    typeFileCallback
  );

  console.log(result_tree);

  console.log("[finished]");
};

main();
