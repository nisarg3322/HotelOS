#!/bin/bash

echo "Updating system..."
sudo yum update -y

echo "Installing AWS CLI..."
sudo yum install aws-cli -y

echo "Fetching database credentials from AWS Secrets Manager..."
secret=$(aws secretsmanager get-secret-value --secret-id study-sync-db-credentials --query SecretString --output text --region us-east-1)

DB_USER=$(echo $secret | jq -r '.DB_USER')
DB_PASSWORD=$(echo $secret | jq -r '.DB_PASSWORD')

echo "Installing Git..."
sudo yum install git -y

echo "Cloning repository..."
git clone https://github.com/nisarg3322/e-hotel.git /home/ec2-user/e-hotel

echo "Installing Node.js..."
curl -sL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install nodejs -y
npm install pm2@latest -g

echo "Installing PostgreSQL client..."
sudo yum install postgresql15 -y

echo "Changing directory to backend..."
cd /home/ec2-user/e-hotel/backend

echo "Creating .env file..."
echo ${db_host}
cat <<EOT | sudo tee /home/ec2-user/e-hotel/backend/.env
DB_HOST=${db_host}
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=mydatabase
DB_PORT=5432
PORT=3000
EOT

echo "Setting permissions for .env..."
sudo chmod 600 /home/ec2-user/e-hotel/backend/.env

echo "Installing dependencies..."
sudo npm install

echo "Running database initialization..."
export PGPASSWORD="StrongPassword123!"
psql -h ${db_host} -U nisarg -d mydatabase -p 5432 -f /home/ec2-user/e-hotel/backend/db-init/init.sql

echo "Starting server..."
pm2 start server.js --name e-hotel

# Save the PM2 process list
pm2 save

# Configure PM2 to restart on system reboot
pm2 startup systemd
