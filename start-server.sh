#!/bin/bash
# Start focus.college production server
# Usage: bash start-server.sh

PROJECT_DIR="/Users/panda/focus.college"
LOG_FILE="$PROJECT_DIR/server.log"
PID_FILE="$PROJECT_DIR/server.pid"

# Check if server is already running
if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
  echo "Server is already running (PID: $(cat "$PID_FILE"))"
  exit 0
fi

# Load environment variables
cd "$PROJECT_DIR"
export $(grep -v '^#' .env | xargs)

# Start the server (use nohup + disown to detach from the shell session)
echo "Starting focus.college server..."
NODE_ENV=production nohup node dist/index.js > "$LOG_FILE" 2>&1 < /dev/null &
NODE_PID=$!
disown $NODE_PID 2>/dev/null
echo $NODE_PID > "$PID_FILE"

# Wait for server to start
echo "Waiting for server to start..."
for i in $(seq 1 15); do
  if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo ""
    echo "=========================================="
    echo "  Server is running!"
    echo "=========================================="
    echo "  Local:    http://localhost:3000"
    echo "  Network:  http://$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null):3000"
    echo "  PID:      $(cat "$PID_FILE")"
    echo "  Log:      $LOG_FILE"
    echo "=========================================="
    exit 0
  fi
  sleep 1
done

echo "ERROR: Server failed to start. Check log: $LOG_FILE"
cat "$LOG_FILE" 2>/dev/null | tail -20
exit 1
