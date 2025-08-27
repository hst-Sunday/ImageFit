/**
 * 文件相关的工具函数
 */

import { SupportedFormat } from '../types/index.ts';

export function detectFormat(filename: string): SupportedFormat | null {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'avif':
      return 'avif';
    case 'tiff':
    case 'tif':
      return 'tiff';
    case 'gif':
      return 'gif';
    default:
      return null;
  }
}
