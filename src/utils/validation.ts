/**
 * 验证相关的工具函数
 */

import { MAX_FILE_SIZE } from '../config/index.ts';

export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}
