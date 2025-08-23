import { Jimp } from 'jimp';

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
}
