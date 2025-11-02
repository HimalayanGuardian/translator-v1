# Translation API Backend

FastAPI backend for the translation application providing REST API endpoints.

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```env
HF_TOKEN=your_huggingface_token_here
TRANSLATION_PROVIDER=huggingface
```

### 3. Run the Server

```bash
# Development mode (with auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: http://localhost:8000

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 API Endpoints

### Health Check
```http
GET /
```

### Detect Language
```http
POST /detect
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "provider": "huggingface"  // optional
}
```

Response:
```json
{
  "detected_language": "en",
  "text": "Hello, how are you?"
}
```

### Translate Text
```http
POST /translate
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "target": "es",
  "source": "en",  // optional, will auto-detect
  "provider": "huggingface"  // optional
}
```

Response:
```json
{
  "translated_text": "Hola, ¿cómo estás?",
  "original_text": "Hello, how are you?",
  "source_language": "en",
  "target_language": "es",
  "provider": "huggingface"
}
```

### Get Supported Languages
```http
GET /languages
```

Response:
```json
{
  "languages": [
    {"code": "en", "name": "English"},
    {"code": "es", "name": "Spanish"},
    {"code": "ne", "name": "Nepali"},
    ...
  ]
}
```

## 🧪 Testing with cURL

### Detect Language
```bash
curl -X POST "http://localhost:8000/detect" \
  -H "Content-Type: application/json" \
  -d '{"text": "नमस्ते, तपाईलाई कस्तो छ?"}'
```

### Translate Text
```bash
curl -X POST "http://localhost:8000/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "target": "ne"
  }'
```

## 🔧 Configuration

### Environment Variables

- `HF_TOKEN`: Hugging Face API token (optional, for higher rate limits)
- `GOOGLE_API_KEY`: Google Cloud Translation API key (optional)
- `TRANSLATION_PROVIDER`: Default provider (`huggingface` or `google`)
- `HOST`: Server host (default: `0.0.0.0`)
- `PORT`: Server port (default: `8000`)
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)

## 📦 Project Structure

```
backend/
├── main.py                 # FastAPI application and routes
├── services/
│   └── translation.py      # Translation service logic
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🌐 CORS Configuration

The API is configured to accept requests from:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000
- http://127.0.0.1:5173

To add more origins, update `CORS_ORIGINS` in `.env`:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

## 🔒 Security Notes

- Never commit `.env` file with real API keys
- Use environment variables for production
- Consider adding API rate limiting for production
- Add authentication for production use

## 🐛 Troubleshooting

### Import Errors
Make sure virtual environment is activated and dependencies are installed:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### CORS Errors
Check that your frontend URL is in `CORS_ORIGINS` environment variable.

### Translation Errors
- Check that `HF_TOKEN` is valid (get from https://huggingface.co/settings/tokens)
- Verify internet connection
- Check API logs for detailed error messages
