
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function dirWalk(dir) {
  var results = [];

  return new Promise(function(resolve, reject) {
    fs.readdir(dir, function(err, list) {
      if (err) reject(err);

      var pending = list.length;
      if (!pending) resolve(results);

      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            dirWalk(file).then(
              (res) => {
                results = results.concat(res);
                if (!--pending) resolve(results);
              },
              (err) => {
                reject(err);
              }
            );
          } else {
            fileHash(file).then(
              function(hash) {
                console.log("[dirWalk] hash created for " + file + "!");
                results.push({
                  "path": file,
                  "hash": hash
                });
                if (!--pending) resolve(results);
              },
              function(err) {
                reject(err);
              }
            )
          }
        });
      });
    });
  });
}


function fileHash(file) {
  return new Promise(function(resolve, reject) {
    // reject("foo");
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(file);
    stream.on("error", err => reject(err));
    stream.on("data", chunk => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}


function main() {
  dirWalk("build").then(
    (result) => {
      console.log("dirWalk finished");
      console.log(result);
    },
    (err) => {
      console.error("something went wrong!");
    })
};


main();
