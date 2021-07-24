/* NodeJS modules */
import fs = require("fs");
import path = require("path");

/* project files */
import {
  BustedManifestFilterByExtensionMismatch,
  BustedManifestFileSystemError,
} from "../errors";

function filterByExtension(
  file: string,
  extensions: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    /* get the file extension */
    const fileExt = path.extname(file);

    // console.log("filterByExtension", file);

    /* if the file matches the extensions, resolve with the "file" for further
     * processing.
     */
    if (extensions.includes(fileExt)) return resolve(file);

    /* if the file does not match the extension list, reject with an error */
    return reject(
      new BustedManifestFilterByExtensionMismatch("Extension does not match!")
    );
  });
}

function hashWalker(dir: string, extensions: string[]): Promise<string[]> {
  let results: string[] = [];

  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, list) => {
      if (err)
        return reject(
          new BustedManifestFileSystemError("Error while reading directory")
        );

      /* Check if there are still things to do. If nothing is pending, resolve
       * with the overall results.
       */
      let pending = list.length;
      if (!pending) return resolve(results);

      /* at this point, there are still items to be iterated in list */
      list.forEach((file) => {
        /* Make the file path absolute */
        file = path.resolve(dir, file);

        fs.stat(file, (err, stat) => {
          if (err)
            return reject(
              new BustedManifestFileSystemError(
                "Error while accessing file stat"
              )
            );

          if (stat && stat.isDirectory()) {
            /* handle sub-directories with recursive call */
            hashWalker(file, extensions).then(
              /* recursive call succeeded, merge the results */
              (result) => {
                results = results.concat(result);
                if (!--pending) return resolve(results);
              },
              /* the recursive call failed, just pass the original error upwards */
              (err) => reject(err)
            );
          } else {
            /* handle files:
             *   - match against the provided list of extensions
             *   - actually hash the file's content
             *   - rename / copy the file
             *   - create record for the manifest file
             */
            filterByExtension(file, extensions)
              .then((file) => {
                results.push(file);
              })
              .catch((err) => {
                if (!(err instanceof BustedManifestFilterByExtensionMismatch))
                  return reject(err);
              })
              .finally(() => {
                if (!--pending) return resolve(results);
              });
          }
        });
      });
    });
  });
}

function main(args: string[]): number {
  console.log("arguments ", args);

  hashWalker("build", [".css", ".js"]).then(
    (result) => {
      console.log("hashWalker finished! ", result);
    },
    (err) => {
      console.log("hashWalker returned with an error:");
      console.log(err);
    }
  );

  return 0;
}

main(process.argv.slice(2));
