import type { ExifData } from './types';
import { ExifExtractionError } from './types';

// Type definitions for EXIF tags structure
interface ExifTag {
  description?: string;
  value?: string | number;
}

interface ExifTags {
  exif?: {
    Make?: ExifTag;
    Model?: ExifTag;
    ExposureTime?: ExifTag;
    ApertureValue?: ExifTag;
    FocalLength?: ExifTag;
    ISOSpeedRatings?: ExifTag;
    DateTimeOriginal?: ExifTag;
  };
  gps?: {
    Latitude?: string | number;
    Longitude?: string | number;
  };
  [key: string]: unknown;
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

  // Handle Buffer (Node.js) by converting to ArrayBuffer
  const uint8Array = new Uint8Array(imageBuffer as Buffer);
  return uint8Array.buffer.slice(
    uint8Array.byteOffset,
    uint8Array.byteOffset + uint8Array.byteLength,
  ) as ArrayBuffer;
}

/**
 * Extracts structured EXIF data from raw EXIF tags
 */
function extractExifDataFromTags(tags: ExifTags): ExifData {
  return {
    cameraMake: tags.exif?.Make?.description,
    cameraModel: tags.exif?.Model?.description,
    exposureTime: tags.exif?.ExposureTime?.description,
    aperture: tags.exif?.ApertureValue?.description,
    focalLength: (() => {
      const focalLengthDesc = tags.exif?.FocalLength?.description;
      if (!focalLengthDesc) return undefined;

      // Extract just the numeric value, removing units like "mm"
      const numericValue = focalLengthDesc.replace(/[^\d.]/g, '');
      if (!numericValue) return undefined;

      // Parse as float and round to 1 decimal place
      const parsed = parseFloat(numericValue);
      if (isNaN(parsed)) return undefined;

      return parsed.toFixed(1);
    })(),
    iso:
      tags.exif?.ISOSpeedRatings?.description ||
      (tags.exif?.ISOSpeedRatings?.value ? String(tags.exif.ISOSpeedRatings.value) : undefined),
    takenAt: (() => {
      if (!tags.exif?.DateTimeOriginal?.description) return undefined;

      const dateStr = tags.exif.DateTimeOriginal.description;

      // EXIF dates are often in format "YYYY:MM:DD HH:mm:ss"
      // Convert to ISO format for better parsing
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
    // Dynamic import to avoid bundling issues
    const ExifReader = (await import('exifreader')).default;

    // Normalize buffer type for consistent processing
    const arrayBuffer = normalizeBuffer(imageBuffer);

    // Extract EXIF tags
    const tags = ExifReader.load(arrayBuffer, { expanded: true });

    // Remove makerNotes to avoid potential issues
    delete tags['makerNotes'];

    // Transform raw tags into structured data
    return extractExifDataFromTags(tags as ExifTags);
  } catch (error) {
    throw new ExifExtractionError('Failed to extract EXIF data from image', error);
  }
}
