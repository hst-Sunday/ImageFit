# Deno Image Processing Server

A high-performance image processing server built with Deno and Sharp, supporting multiple image formats with comprehensive CORS support for web applications.

## ✨ Features

- **Multi-format Support**: JPEG, PNG, WebP, AVIF, TIFF, GIF
- **Image Operations**: Resize, compress, and combined processing
- **Smart Resizing**: Aspect ratio preservation with single-dimension support
- **Format Conversion**: Convert between any supported formats
- **CORS Enabled**: Full cross-domain support for web applications
- **JSON Responses**: Rich metadata and Base64 encoded results
- **File Size Limits**: 6MB maximum file size with validation
- **Interactive Testing**: Built-in HTML interface for testing

## 🚀 Quick Start

### Prerequisites

- [Deno](https://deno.land/) 1.37+ installed
- Sharp library dependencies will be auto-installed

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd deno-images-action
```

2. Install dependencies:
```bash
deno install --allow-scripts=npm:sharp@0.34.3
```

3. Start the server:
```bash
deno task start
```

The server will be available at `http://localhost:8000`

## 📖 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-14T16:05:58.235Z"
}
```

#### `POST /api/resize`
Resize images with optional format conversion.

**Parameters:**
- `image` (file, required): Image file to process
- `width` (number, optional): Target width in pixels
- `height` (number, optional): Target height in pixels  
- `format` (string, optional): Output format (`jpeg`, `png`, `webp`, `avif`, `tiff`, `gif`)
- `fit` (string, optional): Resize fit mode (`cover`, `contain`, `inside`, `fill`, `outside`). Default: intelligent selection (`inside` for single dimension, `cover` for both dimensions)

**Example:**
```bash
curl -X POST http://localhost:8000/api/resize \
  -F "image=@photo.jpg" \
  -F "width=800" \
  -F "format=webp"
```

#### `POST /api/compress`
Compress images with format-specific options.

**Parameters:**
- `image` (file, required): Image file to process
- `quality` (number, 1-100): Quality level for JPEG/WebP/AVIF
- `compressionLevel` (number, 0-9): PNG compression level
- `lossless` (boolean): WebP lossless mode
- `format` (string, optional): Output format

**Example:**
```bash
curl -X POST http://localhost:8000/api/compress \
  -F "image=@photo.jpg" \
  -F "quality=80" \
  -F "format=webp"
```

#### `POST /api/process`
Combined resize and compress operations.

**Parameters:**
Combines all parameters from resize and compress endpoints, including the new `fit` parameter.

**Example:**
```bash
curl -X POST http://localhost:8000/api/process \
  -F "image=@photo.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "quality=85" \
  -F "format=avif"
```

### Response Format

All endpoints return JSON responses:

```json
{
  "success": true,
  "originalImage": {
    "filename": "photo.jpg",
    "size": 1234567,
    "format": "jpeg",
    "width": 1920,
    "height": 1080
  },
  "processedImage": {
    "filename": "processed_photo.jpg",
    "size": 456789,
    "format": "webp",
    "width": 800,
    "height": 450,
    "base64": "data:image/webp;base64,UklGRiQAAABXRUJQ..."
  },
  "processing": {
    "operations": ["resize", "compress"],
    "parameters": {
      "width": 800,
      "quality": 85,
      "format": "webp"
    }
  }
}
```

## 🎨 Supported Formats

| Format | Input | Output | Quality Control | Special Features |
|--------|-------|--------|-----------------|------------------|
| JPEG   | ✅     | ✅      | 1-100           | Standard web format |
| PNG    | ✅     | ✅      | 0-9 (compression) | Transparency support |
| WebP   | ✅     | ✅      | 1-100 + lossless | Modern, efficient |
| AVIF   | ✅     | ✅      | 1-100           | Next-gen format |
| TIFF   | ✅     | ✅      | -               | High quality |
| GIF    | ✅     | ✅      | -               | Animation support |

## 🛠️ Development

### Project Structure
```
deno-images-action/
├── server.ts          # Main server implementation
├── test.html          # Interactive testing interface
├── deno.json          # Deno configuration
├── CLAUDE.md          # Development guidance
└── README.md          # This file
```

### Available Scripts

```bash
# Start development server
deno task start

# Start with custom permissions
deno run --allow-net --allow-ffi --allow-env --allow-read server.ts

# Add new dependencies
deno add <package-name>
```

### Architecture

- **Single-file server**: All functionality in `server.ts`
- **Sharp integration**: Uses npm:sharp@^0.34.3 for image processing
- **Memory efficient**: Streaming processing without file storage
- **Error handling**: Comprehensive validation and error responses

## 🧪 Testing

### Interactive Testing
Open `http://localhost:8000/test.html` in your browser for an interactive testing interface.

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test CORS preflight
curl -X OPTIONS http://localhost:8000/api/resize \
  -H "Origin: http://example.com"

# Test image processing
curl -X POST http://localhost:8000/api/resize \
  -F "image=@test.png" \
  -F "width=400" \
  -F "format=webp"
```

## 🚀 Deployment

### Production Considerations

1. **File Size Limits**: Currently set to 6MB, adjust `MAX_FILE_SIZE` as needed
2. **CORS Policy**: Currently allows all origins (`*`), customize for production
3. **Error Logging**: Add proper logging for production monitoring
4. **Rate Limiting**: Consider adding rate limiting for public APIs

### Environment Variables

The server uses port 8000 by default. You can modify this in `server.ts`.

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM denoland/deno:1.37.0

WORKDIR /app
COPY . .

RUN deno install --allow-scripts=npm:sharp@0.34.3

EXPOSE 8000
CMD ["deno", "task", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source. Please add your preferred license.

## 🔧 Technical Details

- **Runtime**: Deno 1.37+
- **Image Processing**: Sharp 0.34.3
- **HTTP**: Deno standard library
- **Memory**: Efficient streaming processing
- **File Size**: 6MB maximum per request
- **CORS**: Full cross-origin support

Built with ❤️ using Deno and Sharp