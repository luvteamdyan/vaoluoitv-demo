#!/bin/bash

# Script để start multiple backend instances cho testing Redis Pub/Sub

echo "🚀 Starting multiple backend instances for Redis Pub/Sub testing..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start Redis first:"
    echo "   redis-server"
    exit 1
fi

echo "✅ Redis is running"

# Start Redis in background if not already running
# redis-server --daemonize yes

# Start multiple backend instances
echo "📦 Starting Backend Instance 1 (port 3000)..."
PORT=3000 npm run start:dev &
INSTANCE1_PID=$!

echo "📦 Starting Backend Instance 2 (port 3010)..."
PORT=3010 npm run start:dev &
INSTANCE2_PID=$!

echo "✅ Both instances started!"
echo "   Instance 1: http://localhost:3000 (PID: $INSTANCE1_PID)"
echo "   Instance 2: http://localhost:3010 (PID: $INSTANCE2_PID)"
echo ""
echo "🧪 To test Redis Pub/Sub, run:"
echo "   node test-redis-pubsub.js"
echo ""
echo "🛑 To stop all instances, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all instances..."
    kill $INSTANCE1_PID 2>/dev/null
    kill $INSTANCE2_PID 2>/dev/null
    echo "✅ All instances stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait
