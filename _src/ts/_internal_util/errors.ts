class InternalUtilError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class BustedManifestError extends InternalUtilError {
  constructor(message: string) {
    super(message);
  }
}
