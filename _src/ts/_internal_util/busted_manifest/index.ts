/* NodeJS modules */
import path = require("path");

/* project files */
import { BustedManifestFilterByExtensionMismatch } from "../errors";

function filterByExtension(
  file: string,
  extensions: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    /* get the file extension */
    const fileExt = path.extname(file);

    /* if the file matches the extensions, resolve with the "file" for further
     * processing.
     */
    if (extensions.includes(fileExt)) resolve(file);

    reject(
      new BustedManifestFilterByExtensionMismatch("Extension does not match!")
    );
  });
}

function main(args: string[]): number {
  console.log("arguments ", args);

  return 0;
}

main(process.argv.slice(2));
