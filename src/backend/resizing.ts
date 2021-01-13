import sharp from "sharp";
import { ImageSize } from "../../typings";

interface ImageResizeParams {
  type: imageType;
  quality: number;
  size: ImageSize;
}

export function imageResize({ type, quality, size }: ImageResizeParams): sharp.Sharp {
  switch (type) {
    case "png":
      return sharp().resize(size).png({ quality });
    case "webp":
      return sharp().resize(size).webp({ quality });
    case "avif":
      return sharp().resize(size).avif({ quality });
    case "jxl":
      throw "JXL image transformation is still on the way. Come back soon!";
    default:
      return sharp().resize(size).jpeg({ quality });
  }
}

export const supportedImageType = ["png", "avif", "jxl", "webp", "jpeg", "jpg", "auto"] as const;
export type imageType = typeof supportedImageType[number];
