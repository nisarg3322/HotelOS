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
docker-compose up --build -d

echo "changing dir to frontend"
cd ../e-hotel
echo "installing packages..."
npm install
echo "Starting frontend..."
npm run dev
echo "frontend started"