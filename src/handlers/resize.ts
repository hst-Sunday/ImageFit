/**
 * 图像缩放处理器
 */

import { Buffer } from "node:buffer";
import { SupportedFormat, ProcessingResult } from '../types/index.ts';
import { resizeImage, getImageMetadata } from '../services/index.ts';
import { 
  validateAndProcessFile, 
  createErrorResponse, 
  createSuccessResponse 
} from './common.ts';

export async function handleResize(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const width = parseInt(formData.get("width") as string) || undefined;
    const height = parseInt(formData.get("height") as string) || undefined;
    const format = (formData.get("format") as string)?.toLowerCase() as SupportedFormat || undefined;
    const fit = (formData.get("fit") as string) as 'cover' | 'contain' | 'fill' | 'inside' | 'outside' || undefined;
    
    const { 
      file, 
      buffer, 
      detectedFormat, 
      originalMetadata 
    } = await validateAndProcessFile(formData);
    
    const outputFormat = format || detectedFormat || (originalMetadata.format as SupportedFormat);
    const resizedBuffer = await resizeImage(
      buffer, 
      { width, height, format, fit }, 
      detectedFormat || originalMetadata.format
    );
    const processedMetadata = await getImageMetadata(
      resizedBuffer.buffer.slice(0) as ArrayBuffer, 
      `resized_${file.name}`, 
      outputFormat
    );
    
    const result: ProcessingResult = {
      success: true,
      originalImage: originalMetadata,
      processedImage: {
        ...processedMetadata,
        base64: `data:image/${processedMetadata.format};base64,${Buffer.from(resizedBuffer).toString('base64')}`
      },
      processing: {
        operations: ['resize'],
        parameters: { width, height, format, fit }
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
