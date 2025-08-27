/**
 * 健康检查处理器
 */

import { getCorsHeaders } from '../middleware/index.ts';
import { HealthResponse } from '../types/index.ts';

export function handleHealth(): Response {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    headers: { 
      "content-type": "application/json",
      ...getCorsHeaders()
    },
  });
}

export function handleRoot(): Response {
  return new Response(
    "Deno Image Processing Server\n\nEndpoints:\n- POST /api/resize - Resize images\n- POST /api/compress - Compress images\n- POST /api/process - Resize and compress images\n- GET /api/health - Health check", 
    {
      headers: { 
        "content-type": "text/plain",
        ...getCorsHeaders()
      },
    }
  );
}
