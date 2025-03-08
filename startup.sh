#!/bin/bash

echo "changing dir to backend"
cd backend
echo "installing packages..."
npm install
echo "stoping docker containers..."
docker-compose down
echo "removing docker volumes..."
docker volume rm backend_pgdata
echo "starting docker containers..."
docker-compose up --build

echo "waiting for backend to start..."
while ! curl -s -o /dev/null -w "%{http_code}" localhost:3000 | grep -qE "200|302"; do
    sleep 0.1
done

echo "backend started"

# echo "changing dir to frontend"
# cd ../e-hotel
# echo "installing packages..."
# npm install
# echo "Starting frontend..."
# npm run dev
# echo "frontend started"