#!/bin/bash
# This script is used to start the backend and frontend servers

echo "Changing dir to backend"
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found!"
    exit 1
fi
cd backend

echo "Installing packages..."
npm install

echo "Stopping docker containers..."
docker compose down

echo "Removing docker volumes..."
docker volume rm backend_pgdata || echo "Volume not found or in use"

echo "Starting docker containers..."
docker compose up --build -d  # Run in detached mode

echo "Waiting for backend to start..."
while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" localhost:3001)
    if [[ "$STATUS" == "200" || "$STATUS" == "302" ]]; then
        break
    fi
    sleep 0.1
done

echo "Backend started"

echo "Changing dir to frontend"
cd ../e-hotel
echo "Installing packages..."
npm install

echo "Stopping existing frontend server if running..."
FRONTEND_PID=$(netstat -ano | grep ":3000" | awk '{print $5}')  # Find PID of process using port 3000
echo "FRONTEND_PID: $FRONTEND_PID"
if [ -n "$FRONTEND_PID" ]; then
    
    for pid in $FRONTEND_PID
    do
        echo "Found process running on port 3000 with PID: $pid"
        taskkill //PID $pid //F
        echo "Stopped frontend server with PID $pid"
    done
    
else
    echo "No process found running on port 3000"
fi

echo "Starting frontend..."
LOGFILE="./frontend.log"
echo "Logging frontend output to $LOGFILE"
npm run dev >> "$LOGFILE" 2>&1 &  # Run in background
echo "Frontend started"