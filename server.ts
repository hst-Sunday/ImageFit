import sharp from "sharp";

declare const Deno: any;

type SupportedFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff' | 'gif';

interface ResizeOptions {
  width?: number;
  height?: number;
  format?: SupportedFormat;
}

interface CompressOptions {
  quality?: number;
  format?: SupportedFormat;
  // PNG specific
  compressionLevel?: number;
  // WebP specific
  lossless?: boolean;
}

interface ImageMetadata {
  filename: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
}

interface ProcessingResult {
  success: boolean;
  originalImage: ImageMetadata;
  processedImage: ImageMetadata & { base64: string };
  processing: {
    operations: string[];
    parameters: any;
  };
}

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
const SUPPORTED_FORMATS: SupportedFormat[] = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];

function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function detectFormat(filename: string): SupportedFormat | null {
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

async function getImageMetadata(buffer: ArrayBuffer, filename: string, outputFormat?: string): Promise<ImageMetadata> {
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

function getCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

async function applyFormat(sharpInstance: any, format: SupportedFormat, options: CompressOptions): Promise<Buffer> {
  const { quality = 80, compressionLevel = 6, lossless = false } = options;
  
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

async function resizeImage(buffer: ArrayBuffer, options: ResizeOptions, originalFormat?: string): Promise<Buffer> {
  const { width, height, format } = options;
  
  let resizeOptions: any = { withoutEnlargement: true };
  let sharpInstance = sharp(buffer);
  
  // Apply resize if dimensions provided
  if (width && height) {
    // 如果两边都有值，使用inside模式保持比例
    resizeOptions.fit = 'inside';
    sharpInstance = sharpInstance.resize(width, height, resizeOptions);
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

async function compressImage(buffer: ArrayBuffer, options: CompressOptions, originalFormat?: string): Promise<Buffer> {
  const { format } = options;
  const outputFormat = format || (originalFormat as SupportedFormat) || 'jpeg';
  
  return await applyFormat(sharp(buffer), outputFormat, options);
}

async function resizeAndCompressImage(
  buffer: ArrayBuffer, 
  resizeOptions: ResizeOptions, 
  compressOptions: CompressOptions,
  originalFormat?: string
): Promise<Buffer> {
  const { width, height, format: resizeFormat } = resizeOptions;
  const { format: compressFormat } = compressOptions;
  
  let sharpInstance = sharp(buffer);
  let resizeOpts: any = { withoutEnlargement: true };
  
  // Apply resize if dimensions provided
  if (width && height) {
    // 如果两边都有值，使用inside模式保持比例
    resizeOpts.fit = 'inside';
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

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(),
    });
  }
  
  if (url.pathname === "/") {
    return new Response("Deno Image Processing Server\n\nEndpoints:\n- POST /api/resize - Resize images\n- POST /api/compress - Compress images\n- POST /api/process - Resize and compress images\n- GET /api/health - Health check", {
      headers: { 
        "content-type": "text/plain",
        ...getCorsHeaders()
      },
    });
  }
  
  if (url.pathname === "/api/health") {
    return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
      headers: { 
        "content-type": "application/json",
        ...getCorsHeaders()
      },
    });
  }

  if (url.pathname === "/api/resize" && req.method === "POST") {
    try {
      const formData = await req.formData();
      const file = formData.get("image") as File;
      const width = parseInt(formData.get("width") as string) || undefined;
      const height = parseInt(formData.get("height") as string) || undefined;
      const format = (formData.get("format") as string)?.toLowerCase() as SupportedFormat || undefined;
      
      if (!file) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "No image file provided" 
        }), {
          status: 400,
          headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
        });
      }

      if (!validateFileSize(file)) {
        return new Response(JSON.stringify({ 
          success: false,
          error: `File size too large. Maximum allowed size is 6MB, received ${formatFileSize(file.size)}` 
        }), {
          status: 413,
          headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
        });
      }

      const buffer = await file.arrayBuffer();
      const originalMetadata = await getImageMetadata(buffer, file.name);
      const detectedFormat = detectFormat(file.name);
      
      const outputFormat = format || detectedFormat || (originalMetadata.format as SupportedFormat);
      const resizedBuffer = await resizeImage(buffer, { width, height, format }, detectedFormat || originalMetadata.format);
      const processedMetadata = await getImageMetadata(resizedBuffer, `resized_${file.name}`, outputFormat);
      
      const result: ProcessingResult = {
        success: true,
        originalImage: originalMetadata,
        processedImage: {
          ...processedMetadata,
          base64: `data:image/${processedMetadata.format};base64,${Buffer.from(resizedBuffer).toString('base64')}`
        },
        processing: {
          operations: ['resize'],
          parameters: { width, height, format }
        }
      };

      return new Response(JSON.stringify(result), {
        headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false,
        error: error.message 
      }), {
        status: 500,
        headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
      });
    }
  }

  if (url.pathname === "/api/compress" && req.method === "POST") {
    try {
      const formData = await req.formData();
      const file = formData.get("image") as File;
      const quality = parseInt(formData.get("quality") as string) || undefined;
      const format = (formData.get("format") as string)?.toLowerCase() as SupportedFormat || undefined;
      const compressionLevel = parseInt(formData.get("compressionLevel") as string) || undefined;
      const lossless = formData.get("lossless") === "true";
      
      if (!file) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "No image file provided" 
        }), {
          status: 400,
          headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
        });
      }

      if (!validateFileSize(file)) {
        return new Response(JSON.stringify({ 
          success: false,
          error: `File size too large. Maximum allowed size is 6MB, received ${formatFileSize(file.size)}` 
        }), {
          status: 413,
          headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
        });
      }

      const buffer = await file.arrayBuffer();
      const originalMetadata = await getImageMetadata(buffer, file.name);
      const detectedFormat = detectFormat(file.name);
      
      const outputFormat = format || detectedFormat || (originalMetadata.format as SupportedFormat);
      const compressedBuffer = await compressImage(buffer, { 
        quality, 
        format, 
        compressionLevel, 
        lossless 
      }, detectedFormat || originalMetadata.format);
      const processedMetadata = await getImageMetadata(compressedBuffer, `compressed_${file.name}`, outputFormat);
      
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

      return new Response(JSON.stringify(result), {
        headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false,
        error: error.message 
      }), {
        status: 500,
        headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
      });
    }
  }

  if (url.pathname === "/api/process" && req.method === "POST") {
    try {
      const formData = await req.formData();
      const file = formData.get("image") as File;
      const width = parseInt(formData.get("width") as string) || undefined;
      const height = parseInt(formData.get("height") as string) || undefined;
      const quality = parseInt(formData.get("quality") as string) || undefined;
      const format = (formData.get("format") as string)?.toLowerCase() as SupportedFormat || undefined;
      const compressionLevel = parseInt(formData.get("compressionLevel") as string) || undefined;
      const lossless = formData.get("lossless") === "true";
      
      if (!file) {
        return new Response(JSON.stringify({ 
          success: false,
          error: "No image file provided" 
        }), {
          status: 400,
          headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
        });
      }

      if (!validateFileSize(file)) {
        return new Response(JSON.stringify({ 
          success: false,
          error: `File size too large. Maximum allowed size is 6MB, received ${formatFileSize(file.size)}` 
        }), {
          status: 413,
          headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
        });
      }

      const buffer = await file.arrayBuffer();
      const originalMetadata = await getImageMetadata(buffer, file.name);
      const detectedFormat = detectFormat(file.name);
      
      const outputFormat = format || detectedFormat || (originalMetadata.format as SupportedFormat);
      const processedBuffer = await resizeAndCompressImage(
        buffer, 
        { width, height, format }, 
        { quality, format, compressionLevel, lossless },
        detectedFormat || originalMetadata.format
      );
      const processedMetadata = await getImageMetadata(processedBuffer, `processed_${file.name}`, outputFormat);
      
      const result: ProcessingResult = {
        success: true,
        originalImage: originalMetadata,
        processedImage: {
          ...processedMetadata,
          base64: `data:image/${processedMetadata.format};base64,${Buffer.from(processedBuffer).toString('base64')}`
        },
        processing: {
          operations: ['resize', 'compress'],
          parameters: { width, height, quality, format, compressionLevel, lossless }
        }
      };

      return new Response(JSON.stringify(result), {
        headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false,
        error: error.message 
      }), {
        status: 500,
        headers: { 
          "content-type": "application/json",
          ...getCorsHeaders()
        },
      });
    }
  }
  
  return new Response("Not Found", { status: 404 });
};

const port = 8000;
console.log(`Server running on http://localhost:${port}`);
Deno.serve({ port }, handler);