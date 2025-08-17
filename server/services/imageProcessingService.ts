import { Jimp } from 'jimp';
import ExifReader from 'exifreader';

interface ExifResult {
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

export class ImageProcessingService {
  async resizeImage(imageBuffer: Buffer, maxDimension: number = 3840): Promise<Buffer> {
    try {
      const image = await Jimp.fromBuffer(imageBuffer);

      if (
        !image.width ||
        !image.height ||
        (image.width <= maxDimension && image.height <= maxDimension)
      ) {
        return imageBuffer;
      }

      const resizeOptions = image.width > image.height ? { w: maxDimension } : { h: maxDimension };

      return await image.resize(resizeOptions).getBuffer('image/jpeg');
    } catch {
      throw new Error('Failed to resize image');
    }
  }

  async extractExif(imageBuffer: Buffer): Promise<ExifResult> {
    try {
      const tags = ExifReader.load(imageBuffer, {
        expanded: true,
      });
      delete tags['makerNotes'];

      const result: ExifResult = {
        cameraMake: tags.exif?.Make?.description,
        cameraModel: tags.exif?.Model?.description,
        exposureTime: tags.exif?.ExposureTime?.description,
        aperture: tags.exif?.ApertureValue?.description,
        focalLength: tags.exif?.FocalLength?.description,
        iso: tags.exif?.ISOSpeedRatings?.description,
        takenAt: tags.exif?.DateTimeOriginal?.description
          ? new Date(tags.exif?.DateTimeOriginal?.description).valueOf()
          : undefined,
        latitude: tags.gps?.Latitude ? String(tags.gps.Latitude) : undefined,
        longitude: tags.gps?.Longitude ? String(tags.gps.Longitude) : undefined,
      };

      return result;
    } catch {
      throw new Error('Failed extract EXIF info from image');
    }
  }
}
