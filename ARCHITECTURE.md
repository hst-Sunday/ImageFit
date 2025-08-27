# 项目架构文档

## 概述

这个 Deno 图像处理服务器项目已经被重构为模块化架构，采用了职责分离和清晰的模块边界设计。

## 📁 目录结构

```
deno-images-action/
├── src/                    # 源代码目录
│   ├── types/              # 类型定义
│   │   ├── image.ts        # 图像相关类型
│   │   ├── api.ts          # API响应类型
│   │   └── index.ts        # 类型统一导出
│   ├── config/             # 配置模块
│   │   ├── constants.ts    # 常量配置
│   │   └── index.ts        # 配置统一导出
│   ├── utils/              # 工具函数
│   │   ├── validation.ts   # 验证相关工具
│   │   ├── format.ts       # 格式化工具
│   │   ├── file.ts         # 文件处理工具
│   │   └── index.ts        # 工具函数统一导出
│   ├── middleware/         # 中间件
│   │   ├── cors.ts         # CORS处理
│   │   └── index.ts        # 中间件统一导出
│   ├── services/           # 核心业务逻辑
│   │   ├── image.ts        # 图像处理核心服务
│   │   └── index.ts        # 服务统一导出
│   ├── handlers/           # HTTP请求处理器
│   │   ├── health.ts       # 健康检查处理器
│   │   ├── resize.ts       # 图像缩放处理器
│   │   ├── compress.ts     # 图像压缩处理器
│   │   ├── process.ts      # 综合处理处理器
│   │   ├── common.ts       # 通用处理器函数
│   │   └── index.ts        # 处理器统一导出
│   ├── router.ts           # 路由处理器
│   └── app.ts              # 应用程序主入口
├── server.ts               # 主服务器文件（向后兼容）
├── deno.json               # Deno配置文件
├── test.html               # 测试页面
├── README.md               # 项目说明
└── ARCHITECTURE.md         # 架构文档（本文件）
```

## 🏗️ 架构设计原则

### 1. 职责分离
- **类型定义 (types/)**: 所有 TypeScript 接口和类型定义
- **配置 (config/)**: 常量和配置选项管理
- **工具函数 (utils/)**: 纯函数工具，无副作用
- **中间件 (middleware/)**: 请求/响应处理中间件
- **服务 (services/)**: 核心业务逻辑
- **处理器 (handlers/)**: HTTP 请求处理逻辑
- **路由 (router.ts)**: 路由分发逻辑

### 2. 依赖流向
```
server.ts → app.ts → router.ts → handlers/ → services/
                                     ↓
                              middleware/, utils/, config/
```

### 3. 模块化设计
- 每个模块都有自己的 `index.ts` 统一导出
- 清晰的模块边界和接口定义
- 易于测试和维护

## 📋 核心模块说明

### Types 模块
定义了所有的类型接口：
- `SupportedFormat`: 支持的图像格式
- `ResizeOptions`: 缩放选项
- `CompressOptions`: 压缩选项
- `ImageMetadata`: 图像元数据
- `ProcessingResult`: 处理结果
- `ErrorResponse`: 错误响应

### Config 模块
管理应用配置：
- `MAX_FILE_SIZE`: 最大文件大小限制
- `SUPPORTED_FORMATS`: 支持的格式列表
- `DEFAULT_PORT`: 默认端口
- 其他默认值配置

### Utils 模块
提供工具函数：
- `validateFileSize()`: 文件大小验证
- `formatFileSize()`: 文件大小格式化
- `detectFormat()`: 文件格式检测

### Middleware 模块
处理横切关注点：
- `getCorsHeaders()`: 获取CORS头部
- `handleCors()`: 处理CORS预检请求

### Services 模块
核心业务逻辑：
- `getImageMetadata()`: 获取图像元数据
- `resizeImage()`: 图像缩放
- `compressImage()`: 图像压缩
- `resizeAndCompressImage()`: 综合处理

### Handlers 模块
HTTP请求处理：
- `handleHealth()`: 健康检查
- `handleResize()`: 缩放请求处理
- `handleCompress()`: 压缩请求处理
- `handleProcess()`: 综合处理请求
- 通用错误处理和响应生成

## 🚀 启动方式

### 开发模式
```bash
# 使用原有方式（向后兼容）
deno task start

# 使用新的开发模式（带热重载）
deno task dev

# 直接运行模块化入口
deno run --allow-net --allow-ffi --allow-env --allow-read src/app.ts
```

### 代码检查
```bash
# TypeScript 类型检查
deno task check

# 代码风格检查
deno task lint
```

## 🔧 扩展指南

### 添加新的图像处理功能
1. 在 `services/image.ts` 中添加核心逻辑
2. 在 `handlers/` 中添加对应的HTTP处理器
3. 在 `router.ts` 中添加路由
4. 更新类型定义（如需要）

### 添加新的工具函数
1. 在 `utils/` 目录下创建新文件
2. 在 `utils/index.ts` 中导出
3. 在需要的地方导入使用

### 添加新的中间件
1. 在 `middleware/` 目录下创建新文件
2. 在 `middleware/index.ts` 中导出
3. 在 `router.ts` 中应用

## 🧪 测试策略

建议的测试结构：
```
tests/
├── unit/               # 单元测试
│   ├── utils/         # 工具函数测试
│   ├── services/      # 服务层测试
│   └── handlers/      # 处理器测试
├── integration/       # 集成测试
└── e2e/              # 端到端测试
```

## 📝 开发最佳实践

1. **遵循单一职责原则**: 每个模块只负责一个明确的功能
2. **使用 TypeScript**: 充分利用类型系统提高代码质量
3. **统一错误处理**: 使用 `handlers/common.ts` 中的统一错误处理
4. **保持接口稳定**: 对外API接口保持向后兼容
5. **定期运行检查**: 使用 `deno task check` 和 `deno task lint`

## 🔄 迁移指南

### 从单文件架构迁移
原有的 `server.ts` 文件已经被重构，但保持向后兼容：
- 原有的启动命令 `deno task start` 仍然有效
- 所有API端点和功能保持不变
- 新的模块化结构提供更好的可维护性

### 自定义修改
如果你之前修改过 `server.ts`，请参考以下迁移步骤：
1. 将自定义类型添加到 `src/types/`
2. 将自定义配置添加到 `src/config/`
3. 将自定义逻辑添加到相应的 `src/services/` 或 `src/handlers/`
4. 更新路由（如有新端点）

## 🎯 性能优化

新架构的性能优势：
- **更好的代码分割**: 按需加载模块
- **TypeScript 优化**: 更好的编译时优化
- **清晰的依赖关系**: 减少不必要的模块加载
- **可缓存的模块**: 模块化设计便于缓存策略

---

这个架构为项目提供了良好的可扩展性、可维护性和可测试性基础。
