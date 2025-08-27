/**
 * API 响应和请求相关的类型定义
 */

import { ImageMetadata } from './image.ts';

export interface ProcessingResult {
  success: boolean;
  originalImage: ImageMetadata;
  processedImage: ImageMetadata & { base64: string };
  processing: {
    operations: string[];
    parameters: Record<string, unknown>;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}
