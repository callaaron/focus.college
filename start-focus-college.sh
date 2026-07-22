#!/bin/bash
# Focus College - Full stack startup script
# Starts MySQL (if not running) and the Node.js production server
# Designed to be called by launchd or manually

MYSQL_BASE="/Users/panda/mysql/mysql-9.1.0-macos14-arm64"
MYSQL_DATA="/Users/panda/mysql/data"
MYSQL_SOCK="/Users/panda/mysql/mysql.sock"
MYSQL_PIDFILE="/Users/panda/mysql/mysql.pid"
MYSQL_USER="panda"
PROJECT_DIR="/Users/panda/focus.college"
NODE_BIN="/Users/panda/.workbuddy/binaries/node/versions/22.22.2/bin/node"
LOG_DIR="/Users/panda/focus.college"

# ---------- 1. Start MySQL if not already running ----------
if [ -S "$MYSQL_SOCK" ] && "$MYSQL_BASE/bin/mysqladmin" -S "$MYSQL_SOCK" -u root ping >/dev/null 2>&1; then
  echo "$(date) MySQL already running" >> "$LOG_DIR/mysql-startup.log"
else
  echo "$(date) Starting MySQL..." >> "$LOG_DIR/mysql-startup.log"
  "$MYSQL_BASE/bin/mysqld" \
    --defaults-file=/Users/panda/mysql/my.cnf \
    --user="$MYSQL_USER" \
    --daemonize 2>&1 | tee -a "$LOG_DIR/mysql-startup.log"
  # wait for socket
  for i in $(seq 1 30); do
    if [ -S "$MYSQL_SOCK" ]; then break; fi
    sleep 1
  done
fi

# ---------- 2. Start Node server (managed by launchd KeepAlive) ----------
cd "$PROJECT_DIR"
export $(grep -v '^#' .env | xargs)
exec "$NODE_BIN" dist/index.js
