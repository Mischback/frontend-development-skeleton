class InternalUtilError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class BustedManifestError extends InternalUtilError {
  constructor(message: string) {
    super(message);
  }
}

export class BustedManifestFilterByExtensionMismatch extends BustedManifestError {
  constructor(message: string) {
    super(message);
  }
}
