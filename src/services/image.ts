/**
 * 图像处理核心服务
 */

import sharp from "sharp";
import { Buffer } from "node:buffer";
import { 
  SupportedFormat, 
  ResizeOptions, 
  CompressOptions, 
  ImageMetadata 
} from '../types/index.ts';
import { DEFAULT_QUALITY } from '../config/index.ts';

export async function getImageMetadata(
  buffer: ArrayBuffer, 
  filename: string, 
  outputFormat?: string
): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();
  
  // If outputFormat is provided, update the filename extension
  let finalFilename = filename;
  if (outputFormat) {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    finalFilename = `${nameWithoutExt}.${extension}`;
  }
  
  return {
    filename: finalFilename,
    size: buffer.byteLength,
    format: metadata.format || 'unknown',
    width: metadata.width,
    height: metadata.height,
  };
}

async function applyFormat(
  sharpInstance: ReturnType<typeof sharp>, 
  format: SupportedFormat, 
  options: CompressOptions
): Promise<Buffer> {
  const { 
    quality = DEFAULT_QUALITY, 
    compressionLevel = 6, 
    lossless = false 
  } = options;
  
  switch (format) {
    case 'jpeg':
      return await sharpInstance.jpeg({ 
        quality: Math.max(1, Math.min(100, quality)) 
      }).toBuffer();
    
    case 'png':
      return await sharpInstance.png({ 
        compressionLevel: Math.max(0, Math.min(9, compressionLevel)) 
      }).toBuffer();
    
    case 'webp':
      return await sharpInstance.webp({ 
        quality: lossless ? undefined : Math.max(1, Math.min(100, quality)),
        lossless 
      }).toBuffer();
    
    case 'avif':
      return await sharpInstance.avif({ 
        quality: Math.max(1, Math.min(100, quality)) 
      }).toBuffer();
    
    case 'tiff':
      return await sharpInstance.tiff().toBuffer();
    
    case 'gif':
      return await sharpInstance.gif().toBuffer();
    
    default:
      return await sharpInstance.toBuffer();
  }
}

export async function resizeImage(
  buffer: ArrayBuffer, 
  options: ResizeOptions, 
  originalFormat?: string
): Promise<Buffer> {
  const { width, height, format } = options;
  
  const resizeOptions = { withoutEnlargement: true };
  let sharpInstance = sharp(buffer);
  
  // Apply resize if dimensions provided
  if (width && height) {
    // 如果两边都有值，使用inside模式保持比例
    sharpInstance = sharpInstance.resize(width, height, { ...resizeOptions, fit: 'inside' });
  } else if (width && !height) {
    // 只有宽度，高度自动适应
    sharpInstance = sharpInstance.resize(width, null, resizeOptions);
  } else if (!width && height) {
    // 只有高度，宽度自动适应
    sharpInstance = sharpInstance.resize(null, height, resizeOptions);
  }
  
  // Apply format conversion
  const outputFormat = format || (originalFormat as SupportedFormat) || 'jpeg';
  return await applyFormat(sharpInstance, outputFormat, { quality: 90 });
}

export async function compressImage(
  buffer: ArrayBuffer, 
  options: CompressOptions, 
  originalFormat?: string
): Promise<Buffer> {
  const { format } = options;
  const outputFormat = format || (originalFormat as SupportedFormat) || 'jpeg';
  
  return await applyFormat(sharp(buffer), outputFormat, options);
}

export async function resizeAndCompressImage(
  buffer: ArrayBuffer, 
  resizeOptions: ResizeOptions, 
  compressOptions: CompressOptions,
  originalFormat?: string
): Promise<Buffer> {
  const { width, height, format: resizeFormat } = resizeOptions;
  const { format: compressFormat } = compressOptions;
  
  let sharpInstance = sharp(buffer);
  const resizeOpts = { withoutEnlargement: true, fit: 'inside' as const };
  
  // Apply resize if dimensions provided
  if (width && height) {
    // 如果两边都有值，使用inside模式保持比例
    sharpInstance = sharpInstance.resize(width, height, resizeOpts);
  } else if (width && !height) {
    // 只有宽度，高度自动适应
    sharpInstance = sharpInstance.resize(width, null, resizeOpts);
  } else if (!width && height) {
    // 只有高度，宽度自动适应
    sharpInstance = sharpInstance.resize(null, height, resizeOpts);
  }
  
  // Use format from compress options, then resize options, then original format
  const outputFormat = compressFormat || resizeFormat || (originalFormat as SupportedFormat) || 'jpeg';
  return await applyFormat(sharpInstance, outputFormat, compressOptions);
}
