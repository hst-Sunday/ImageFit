/**
 * 图像处理相关的类型定义
 */

export type SupportedFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'gif';

export type ResizeFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

export interface ResizeOptions {
  width?: number;
  height?: number;
  format?: SupportedFormat;
  fit?: ResizeFit;
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
