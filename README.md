# Translator App

A full-stack translation application with **Vue 3 frontend** and **FastAPI backend**, supporting both **Google Cloud Translation** (paid) and **Hugging Face** (free) translation services.

## 🌟 Features

- **FastAPI REST API**: Backend API for translation and language detection
- **Dual Translation Providers**: Switch between Google Cloud Translation and Hugging Face
- **Language Detection**: Automatically detect the source language
- **Multiple Languages**: Support for English, Spanish, French, German, Hindi, Nepali, Japanese, Chinese, Arabic, and more
- **Modern UI**: Built with Vue 3, TypeScript, and TailwindCSS
- **Flexible Architecture**: Use client-side translation or API backend
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Monitoring**: Built-in performance monitoring and error tracking

## 📁 Project Structure

```
translate/
├── backend/              # FastAPI backend
│   ├── main.py          # API server and routes
│   ├── services/        # Translation services
│   ├── requirements.txt # Python dependencies
│   └── README.md        # Backend documentation
├── src/                 # Vue 3 frontend
│   ├── components/      # Vue components
│   ├── services/        # Translation services (client & API)
│   ├── stores/          # State management
│   └── pages/           # Page components
├── setup.sh             # Setup script (Linux/macOS)
├── setup.bat            # Setup script (Windows)
└── README.md            # This file
```

## 🚀 Translation Providers

### Hugging Face (Free) ✅ Recommended for Testing
- **Cost**: Free tier available
- **Setup**: Get a free token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- **Models**: Uses NLLB-200 and OPUS-MT models
- **Limitations**: Rate-limited, slower than paid services

### Google Cloud Translation (Paid)
- **Cost**: Pay-per-use
- **Setup**: Get API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Benefits**: Faster, higher quality, no rate limits
- **Best for**: Production use

## 🚀 Quick Start

### Automatic Setup (Recommended)

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### Manual Setup

#### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your HF_TOKEN
```

#### 2. Frontend Setup (Vue)

```bash
# From project root
npm install

# Configure environment
cp .env.example .env
# Edit .env if needed
```

#### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

🌐 **Access the app:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## ⚙️ Configuration

### Backend (.env in `backend/` folder)

```env
# Hugging Face Token (get from https://huggingface.co/settings/tokens)
HF_TOKEN=your_token_here

# Translation provider
TRANSLATION_PROVIDER=huggingface

# Server settings
PORT=8000
```

### Frontend (.env in project root)

```env
# API mode - uses FastAPI backend
VITE_TRANSLATION_MODE=api
VITE_API_BASE_URL=http://localhost:8000

# OR Client mode - translation runs in browser
# VITE_TRANSLATION_MODE=client
# VITE_HF_TOKEN=your_token_here
# VITE_TRANSLATION_PROVIDER=huggingface
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
