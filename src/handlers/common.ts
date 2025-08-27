/**
 * 通用处理器函数
 */

import { 
  SupportedFormat, 
  ProcessingResult, 
  ErrorResponse,
  ImageMetadata
} from '../types/index.ts';
import { 
  validateFileSize, 
  formatFileSize, 
  detectFormat 
} from '../utils/index.ts';
import { getCorsHeaders } from '../middleware/index.ts';
import { getImageMetadata } from '../services/index.ts';

export function createErrorResponse(
  error: string, 
  status: number = 500
): Response {
  const response: ErrorResponse = {
    success: false,
    error
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { 
      "content-type": "application/json",
      ...getCorsHeaders()
    },
  });
}

export function createSuccessResponse(
  result: ProcessingResult
): Response {
  return new Response(JSON.stringify(result), {
    headers: { 
      "content-type": "application/json",
      ...getCorsHeaders()
    },
  });
}

export async function validateAndProcessFile(
  formData: FormData
): Promise<{
  file: File;
  buffer: ArrayBuffer;
  detectedFormat: SupportedFormat | null;
  originalMetadata: ImageMetadata;
}> {
  const file = formData.get("image") as File;
  
  if (!file) {
    throw new Error("No image file provided");
  }

  if (!validateFileSize(file)) {
    throw new Error(
      `File size too large. Maximum allowed size is 6MB, received ${formatFileSize(file.size)}`
    );
  }

  const buffer = await file.arrayBuffer();
  const originalMetadata = await getImageMetadata(buffer, file.name);
  const detectedFormat = detectFormat(file.name);

  return {
    file,
    buffer,
    detectedFormat,
    originalMetadata
  };
}
