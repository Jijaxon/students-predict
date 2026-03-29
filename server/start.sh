#!/bin/bash
# Run from the server/ directory
cd "$(dirname "$0")"

echo "🎓 Starting EduCluster Backend..."
echo "📍 API: http://localhost:8000"
echo "📖 Docs: http://localhost:8000/docs"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
