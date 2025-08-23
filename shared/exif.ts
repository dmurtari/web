import type { ExpandedTags } from 'exifreader';
import type { ExifData } from '~/types/image';

export class ExifExtractionError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ExifExtractionError';
    this.cause = cause;
  }
}

/**
 * Normalizes different buffer types to ArrayBuffer for consistent processing
 */
function normalizeBuffer(imageBuffer: Buffer | ArrayBuffer | Uint8Array): ArrayBuffer {
  if (imageBuffer instanceof ArrayBuffer) {
    return imageBuffer;
  }

  if (imageBuffer instanceof Uint8Array) {
    return imageBuffer.buffer.slice(
      imageBuffer.byteOffset,
      imageBuffer.byteOffset + imageBuffer.byteLength,
    ) as ArrayBuffer;
  }

  const uint8Array = new Uint8Array(imageBuffer);
  return uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength,
  ) as ArrayBuffer;
}

/**
 * Extracts structured EXIF data from raw EXIF tags
 */
function extractExifDataFromTags(tags: ExpandedTags): ExifData {
  return {
    cameraMake: tags.exif?.Make?.description,
    cameraModel: tags.exif?.Model?.description,
    exposureTime: tags.exif?.ExposureTime?.description,
    aperture: tags.exif?.ApertureValue?.description,
    focalLength: tags.exif?.FocalLengthIn35mmFilm?.description,
    iso:
      tags.exif?.ISOSpeedRatings?.description ||
      (tags.exif?.ISOSpeedRatings?.value ? String(tags.exif.ISOSpeedRatings.value) : undefined),
    takenAt: (() => {
      if (!tags.exif?.DateTimeOriginal?.description) {
        return undefined;
      }

      const dateStr = tags.exif.DateTimeOriginal.description;
      const isoDateStr = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
      const date = new Date(isoDateStr);
      const timestamp = date.valueOf();

      return Number.isNaN(timestamp) ? undefined : timestamp;
    })(),
    latitude: tags.gps?.Latitude ? String(tags.gps.Latitude) : undefined,
    longitude: tags.gps?.Longitude ? String(tags.gps.Longitude) : undefined,
  };
}

/**
 * Extracts EXIF data from an image buffer
 * Works in both browser and Node.js environments
 *
 * @param imageBuffer - The image data to extract EXIF from
 * @returns Promise resolving to extracted EXIF data
 * @throws ExifExtractionError if EXIF extraction fails
 */
export async function extractExif(
  imageBuffer: Buffer | ArrayBuffer | Uint8Array,
): Promise<ExifData> {
  try {
    const ExifReader = (await import('exifreader')).default;
    const arrayBuffer = normalizeBuffer(imageBuffer);
    const tags = ExifReader.load(arrayBuffer, { expanded: true });

    delete tags['makerNotes'];

    return extractExifDataFromTags(tags);
  } catch (error) {
    throw new ExifExtractionError('Failed to extract EXIF data from image', error);
  }
}
