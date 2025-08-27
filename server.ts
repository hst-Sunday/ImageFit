/**
 * 主服务器文件 - 向后兼容的入口点
 * 
 * 这个文件保持原有的启动方式，但现在使用模块化的架构
 */

import { startServer } from './src/app.ts';

// 启动服务器
startServer();