/**
 * 图像处理相关的类型定义
 */

export type SupportedFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'gif';

export interface ResizeOptions {
  width?: number;
  height?: number;
  format?: SupportedFormat;
}

export interface CompressOptions {
  quality?: number;
  format?: SupportedFormat;
  // PNG specific
  compressionLevel?: number;
  // WebP specific
  lossless?: boolean;
}

export interface ImageMetadata {
  filename: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
}
