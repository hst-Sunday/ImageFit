/**
 * 图像压缩处理器
 */

import { Buffer } from "node:buffer";
import { SupportedFormat, ProcessingResult } from '../types/index.ts';
import { compressImage, getImageMetadata } from '../services/index.ts';
import { 
  validateAndProcessFile, 
  createErrorResponse, 
  createSuccessResponse 
} from './common.ts';

export async function handleCompress(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const quality = parseInt(formData.get("quality") as string) || undefined;
    const format = (formData.get("format") as string)?.toLowerCase() as SupportedFormat || undefined;
    const compressionLevel = parseInt(formData.get("compressionLevel") as string) || undefined;
    const lossless = formData.get("lossless") === "true";
    
    const { 
      file, 
      buffer, 
      detectedFormat, 
      originalMetadata 
    } = await validateAndProcessFile(formData);
    
    const outputFormat = format || detectedFormat || (originalMetadata.format as SupportedFormat);
    const compressedBuffer = await compressImage(
      buffer, 
      { 
        quality, 
        format, 
        compressionLevel, 
        lossless 
      }, 
      detectedFormat || originalMetadata.format
    );
    const processedMetadata = await getImageMetadata(
      compressedBuffer.buffer.slice(0) as ArrayBuffer, 
      `compressed_${file.name}`, 
      outputFormat
    );
    
    const result: ProcessingResult = {
      success: true,
      originalImage: originalMetadata,
      processedImage: {
        ...processedMetadata,
        base64: `data:image/${processedMetadata.format};base64,${Buffer.from(compressedBuffer).toString('base64')}`
      },
      processing: {
        operations: ['compress'],
        parameters: { quality, format, compressionLevel, lossless }
      }
    };

    return createSuccessResponse(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const status = errorMessage.includes("File size too large") ? 413 : 
                   errorMessage.includes("No image file provided") ? 400 : 500;
    return createErrorResponse(errorMessage, status);
  }
}
