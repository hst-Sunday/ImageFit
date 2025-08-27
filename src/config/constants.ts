/**
 * 应用程序常量配置
 */

import { SupportedFormat } from '../types/index.ts';

export const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB

export const SUPPORTED_FORMATS: SupportedFormat[] = [
  'jpeg', 
  'png', 
  'webp', 
  'avif', 
  'tiff', 
  'gif'
];

export const DEFAULT_PORT = 8000;

export const DEFAULT_QUALITY = 80;

export const DEFAULT_COMPRESSION_LEVEL = 6;
