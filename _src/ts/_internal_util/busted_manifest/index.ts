/* NodeJS modules */
import crypto = require("crypto");
import fs = require("fs");
import path = require("path");
import util = require("util");

const fsreaddir = util.promisify(fs.readdir);
const fsstat = util.promisify(fs.stat);

/* project files */
import {
  BustedManifestFilterByExtensionMismatch,
  BustedManifestFileSystemError,
  BustedManifestHashError,
} from "../errors";

function determineNewFilename(
  file: string,
  fileHash: string,
  hashLength: number
): Promise<string> {
  return new Promise((resolve, _reject) => {
    const filePath = path.dirname(file);
    const fileExt = path.extname(file);
    const fileBasename = path.basename(file, fileExt);

    const newFilename = path.join(
      filePath,
      fileBasename + "." + fileHash.substring(0, hashLength) + fileExt
    );

    return resolve(newFilename);
  });
}

function filterByExtension(
  file: string,
  extensions: string[]
): Promise<string> {
  /* Matches a given file against a list of extensions.
   *
   * @param file: string : Reference to a file, given as string
   * @param extensions: string[] : A list of file extensions, provided as
   *                               strings
   * @return Promise
   *   - success: The file reference, given as string
   *   - fail: a specific error object
   */

  return new Promise((resolve, reject) => {
    /* get the file extension */
    const fileExt = path.extname(file).substring(1);

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

function hashFileContent(file: string): Promise<string> {
  /* Calculate the hash of a file's content.
   *
   * @param file: string : Reference to a file, given as string
   *
   * @return Promise
   *   - success: The hash of the file's content
   *   - fail: a specific error object
   */

  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("md5");
    const stream = fs.createReadStream(file);

    stream.on("error", () =>
      reject(new BustedManifestHashError("Error during hash calculation"))
    );
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("data", (chunk) => hash.update(chunk));
  });
}

function hashWalker(
  dir: string,
  extensions: string[],
  hashLength: number
): Promise<string[]> {
  /* Recursively iterates a given directory and hashes files matching the
   * extensions list.
   *
   * @param dir: string : A path given as string.
   * @param extensions: string[] : A list of file extensions, provided as
   *                               strings
   * @return Promise
   *   - success: a list with tupels of filenames and generated filenames that
   *              include a hash of the file's content
   *   - fail: the respective error object
   */

  let results: any[] = [];

  return new Promise((resolve, reject) => {
    fsreaddir(dir)
      .then((list) => {
        /* Check if there are still things to do. If nothing is pending, resolve
         * with the overall results.
         */
        let pending = list.length;
        if (!pending) return resolve(results);

        /* at this point, there are still items to be iterated in list */
        list.forEach((file) => {
          /* Make the file path absolute */
          file = path.resolve(dir, file);

          fsstat(file)
            .then((stat) => {
              if (stat.isDirectory()) {
                /* handle sub-directories with recursive call */
                hashWalker(file, extensions, hashLength).then(
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
                  .then(hashFileContent)
                  .then((hash) => {
                    return determineNewFilename(file, hash, hashLength);
                  })
                  .then((newFilename) => {
                    console.log(file, ":", newFilename);
                    results.push({ file, newFilename });
                  })
                  .catch((err) => {
                    if (
                      !(err instanceof BustedManifestFilterByExtensionMismatch)
                    )
                      return reject(err);
                  })
                  .finally(() => {
                    if (!--pending) return resolve(results);
                  });
              }
            })
            .catch(() =>
              reject(
                new BustedManifestFileSystemError(
                  "Error while accessing file stat"
                )
              )
            );
        });
      })
      .catch(() =>
        reject(
          new BustedManifestFileSystemError("Error while reading directory")
        )
      );
  });
}

function main(args: string[]): number {
  console.log("arguments ", args);

  hashWalker("build", ["css", "js"], 10).then(
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
