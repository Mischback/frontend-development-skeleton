
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* Recursive asynchronous directory walker
 *
 * Works with Promises
 *  - resolves to a list of files
 *  - rejects with an error message
 */
function dirWalk(dir) {
  var results = [];

  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, list) => {
      if (err) reject(err);

      var pending = list.length;
      if (!pending) resolve(results);

      list.forEach(file => {
        file = path.resolve(dir, file);
        fs.stat(file, (err, stat) => {
          // sub-directories are handled with a recursive call
          if (stat && stat.isDirectory()) {
            dirWalk(file).then(
              // resolve handling (fuse results)
              res => {
                results = results.concat(res);
                if (!--pending) resolve(results);
              },
              // reject handling (reject upwards)
              err => reject(err)
            );
          } else {
            // handling of files! Here be magic!
            fileFilter(file, "css")
              .then(
                fileHash,
                err => reject(err)
              )
              .then(
                hash => renameFile(file, hash),
                err => reject(err)
              )
              .then(
                newFileName => {
                  console.log(file + " -> " + newFileName);
                  results.push({
                    "file": file,
                    "hashed": newFileName
                  });
                  if (!--pending) resolve(results);
                },
                err => reject(err)
              )
          }
        });
      });
    });
  });
}

function renameFile(file, hash) {
  // console.log("[renameFile]: " + file + ": " + hash);
  return new Promise((resolve, reject) => {
    var filePath = path.dirname(file);
    var fileExt = path.extname(file);
    var fileBaseName = path.basename(file, fileExt);

    // TODO: possible limit the length of the hash here!
    var newFileName = path.join(filePath, fileBaseName + "." + hash + fileExt);
    // console.log("[renameFile] new name: " + newFileName);

    // actually rename the file on disk!
    fs.rename(file, newFileName, err => reject("Could not rename file!"));
    resolve(newFileName);
  });
}


function fileHash(file) {
  return new Promise((resolve, reject) => {
    // reject("foo");
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(file);
    stream.on("error", err => reject(err));
    stream.on("data", chunk => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function fileFilter(file, extensions) {
  return new Promise((resolve, reject) => {
    var fileExt = file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2);
    // console.log("[fileFilter] found: " + fileExt);

    // TODO: Here the file extension filter must be implemented!
    if (fileExt === extensions) resolve(file);

    reject("Does not match extension!");
  });
}


function main() {
  dirWalk("build").then(
    (result) => {
      console.log("dirWalk finished");
      console.log(result);
      return 0;
    },
    (err) => {
      console.error("something went wrong!");
      return -1;
    })
};


main();
