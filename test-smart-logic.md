# 智能缩放逻辑测试验证

## 🧪 测试用例

### 1. 单维度测试 (应该使用 inside)

```bash
# 测试：只提供宽度
curl -X POST http://localhost:8000/api/resize \
  -F "image=@your-image.jpg" \
  -F "width=800"
# 预期：使用 inside 模式，保持比例

# 测试：只提供高度  
curl -X POST http://localhost:8000/api/resize \
  -F "image=@your-image.jpg" \
  -F "height=600"
# 预期：使用 inside 模式，保持比例
```

### 2. 双维度测试 (应该使用 cover)

```bash
# 测试：同时提供宽度和高度
curl -X POST http://localhost:8000/api/resize \
  -F "image=@your-image.jpg" \
  -F "width=800" \
  -F "height=600"
# 预期：使用 cover 模式，填充目标区域
```

### 3. 显式覆盖测试

```bash
# 测试：双维度 + 显式指定 fill
curl -X POST http://localhost:8000/api/resize \
  -F "image=@your-image.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "fit=fill"
# 预期：使用 fill 模式，忽略智能选择

# 测试：单维度 + 显式指定 cover
curl -X POST http://localhost:8000/api/resize \
  -F "image=@your-image.jpg" \
  -F "width=800" \
  -F "fit=cover"
# 预期：使用 cover 模式，忽略智能选择
```

## 📊 预期结果对照表

| 输入条件 | 智能选择 | 实际行为 | 验证状态 |
|----------|----------|----------|----------|
| `width=800` | `inside` | 宽度800px，高度按比例 | ✅ |
| `height=600` | `inside` | 高度600px，宽度按比例 | ✅ |
| `width=800, height=600` | `cover` | 800x600区域，保持比例，可能裁剪 | ✅ |
| `width=800, height=600, fit=fill` | `fill` | 精确800x600，可能变形 | ✅ |

## 🔍 验证方法

1. **通过响应参数验证**：检查返回JSON中的 `processing.parameters.fit` 值
2. **通过图像尺寸验证**：检查输出图像的实际尺寸
3. **通过视觉效果验证**：观察图像是否被裁剪、变形或保持完整

## 💻 快速测试页面

访问以下页面进行可视化测试：
- `http://localhost:8000/smart-fit-demo.html` - 智能模式专门演示
- `http://localhost:8000/test.html` - 主测试页面（已更新）
