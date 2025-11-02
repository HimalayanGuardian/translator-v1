#!/bin/bash

echo "🚀 Setting up Translation App with FastAPI Backend"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found"

# Setup Backend
echo ""
echo "📦 Setting up FastAPI backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Copy .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and add your HF_TOKEN"
fi

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Vue frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js found"

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Copy .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env and add your Hugging Face token"
echo "2. Start the backend: cd backend && source venv/bin/activate && python main.py"
echo "3. Start the frontend: npm run dev"
echo ""
echo "🌐 Frontend will be at: http://localhost:5173"
echo "🔌 Backend API will be at: http://localhost:8000"
echo "📚 API docs will be at: http://localhost:8000/docs"
