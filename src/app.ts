/**
 * 应用程序主入口
 */

// Deno 全局声明
declare const Deno: {
  serve: (options: { port: number }, handler: (req: Request) => Promise<Response>) => void;
};

import { router } from './router.ts';
import { DEFAULT_PORT } from './config/index.ts';

export function startServer(port: number = DEFAULT_PORT) {
  console.log(`Server running on http://localhost:${port}`);
  return Deno.serve({ port }, router);
}
