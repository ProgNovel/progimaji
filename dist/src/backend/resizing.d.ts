import sharp from "sharp";
interface ImageResizeParams {
    type: imageType;
    quality: number;
    size: ImageSize;
}
export declare function imageResize({ type, quality, size }: ImageResizeParams): sharp.Sharp;
export declare const supportedImageType: readonly ["png", "avif", "jxl", "webp", "jpeg", "jpg", "auto"];
export declare type imageType = typeof supportedImageType[number];
export {};
