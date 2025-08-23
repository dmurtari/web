export interface ExifData {
  cameraMake?: string;
  cameraModel?: string;
  exposureTime?: string;
  aperture?: string;
  iso?: string;
  focalLength?: string;
  takenAt?: number;
  latitude?: string;
  longitude?: string;
}

export class ExifExtractionError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ExifExtractionError';
    this.cause = cause;
  }
}
