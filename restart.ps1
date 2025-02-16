# Stop and remove all containers
docker-compose down

# Remove the PostgreSQL volume
docker volume rm dockerproject_pgdata

# Start containers with a fresh volume
docker-compose up --build
