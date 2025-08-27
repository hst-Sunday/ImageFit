/**
 * 路由处理器
 */

import { handleCors } from './middleware/index.ts';
import {
  handleRoot,
  handleHealth,
  handleResize,
  handleCompress,
  handleProcess,
} from './handlers/index.ts';

export const router = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }
  
  // Route handling
  switch (url.pathname) {
    case "/":
      return handleRoot();
      
    case "/api/health":
      return handleHealth();
      
    case "/api/resize":
      if (req.method === "POST") {
        return await handleResize(req);
      }
      break;
      
    case "/api/compress":
      if (req.method === "POST") {
        return await handleCompress(req);
      }
      break;
      
    case "/api/process":
      if (req.method === "POST") {
        return await handleProcess(req);
      }
      break;
  }
  
  return new Response("Not Found", { status: 404 });
};
