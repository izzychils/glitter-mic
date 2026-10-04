#!/bin/bash
# Simple migration runner - just set DATABASE_URL and run

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is required"
  echo "Usage: DATABASE_URL='your-connection-string' npm run migrate"
  exit 1
fi

echo "🔄 Running database migrations..."
npm run migrate
