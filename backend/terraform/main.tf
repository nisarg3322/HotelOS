terraform {
  backend "s3" {
    bucket         = "study-sync-terraform"
    key            = "study-sync"
    region         = "us-east-1"
    dynamodb_table = "study-sync-terraform-lock"  # Add this line for state locking
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.88"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}


# Fetch latest Amazon Linux 2023 AMI
data "aws_ami" "latest_amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.6.20250317.2-kernel-6.1-x86_64"]
  }

  
}


# Security Group for EC2
resource "aws_security_group" "app_sg" {
  name        = "study-sync-app-sg"
  description = "Allow SSH and Express server traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}



# Security Group for RDS
resource "aws_security_group" "rds_sg" {
  name        = "study-sync-rds-sg"
  description = "Allow PostgreSQL traffic from EC2"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.app_sg.id]  # Allow inbound traffic from EC2's security group
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Generate SSH Key Pair
resource "tls_private_key" "app_private_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "app_key_pair" {
  key_name   = "study-sync-key"
  public_key = tls_private_key.app_private_key.public_key_openssh
}

resource "local_sensitive_file" "app_private_key_file" {
  content         = tls_private_key.app_private_key.private_key_pem
  filename        = "${path.module}/${aws_key_pair.app_key_pair.key_name}.pem"
  file_permission = "400"
}

# IAM Role for EC2 with SecretsManager permissions
resource "aws_iam_role" "ec2_secrets_role" {
  name               = "ec2_secrets_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach SecretsManager access policy to the IAM Role
resource "aws_iam_role_policy" "secrets_manager_access" {
  name   = "secrets_manager_access"
  role   = aws_iam_role.ec2_secrets_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action   = "secretsmanager:GetSecretValue"
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# resource "aws_instance" "app_server" {
#   ami                    = data.aws_ami.latest_amazon_linux.id
#   instance_type          = "t3.micro"
#   key_name               = aws_key_pair.app_key_pair.key_name
#   vpc_security_group_ids = [aws_security_group.app_sg.id]  # EC2 SG

#   # user_data = <<-EOF
#   #             #!/bin/bash
              
#   #             echo "Updating system..."
#   #             sudo yum update -y

#   #             echo "Installing Git..."
#   #             sudo yum install git -y

#   #             echo "Cloning the repository..."
#   #             git clone https://github.com/nisarg3322/e-hotel.git /home/ec2-user/e-hotel

#   #             echo "Installing Node.js..."
#   #             curl -sL https://rpm.nodesource.com/setup_lts.x | sudo bash -
#   #             sudo yum install -y nodejs

#   #             echo "Installing PostgreSQL client..."
#   #             sudo yum install postgresql15 -y

#   #             echo "Changing directory to backend..."
#   #             cd /home/ec2-user/e-hotel/backend

#   #             echo "Installing dependencies..."
#   #             npm install

#   #             echo "Running database initialization..."
#   #             export PGPASSWORD="StrongPassword123!"
#   #             psql -h ${aws_db_instance.postgres.address} -U nisarg -d mydatabase -p 5432 -f /home/ec2-user/e-hotel/backend/db-init/init.sql

#   #             echo "Starting Node.js server..."
#   #             node server.js
#   #             EOF
#   user_data = <<-EOF
#             #!/bin/bash
#             echo "Updating system..."
#             sudo yum update -y

#             echo "Installing AWS CLI..."
#             sudo yum install -y aws-cli

#             echo "Fetching database credentials from AWS Secrets Manager..."
#             DB_CREDENTIALS=$(aws secretsmanager get-secret-value --secret-id study-sync-db-credentials --query SecretString --output text --region us-east-1)
#             DB_USER=$(echo $DB_CREDENTIALS | jq -r '.DB_USER')
#             DB_PASSWORD=$(echo $DB_CREDENTIALS | jq -r '.DB_PASSWORD')

#             echo "Installing Git..."
#             sudo yum install git -y

#             echo "Cloning repository..."
#             git clone https://github.com/nisarg3322/e-hotel.git /home/ec2-user/e-hotel

#             echo "Installing Node.js..."
#             curl -sL https://rpm.nodesource.com/setup_lts.x | sudo bash -
#             sudo yum install -y nodejs

#             echo "Installing PostgreSQL client..."
#             sudo yum install postgresql15 -y

#             echo "Changing directory to backend..."
#             cd /home/ec2-user/e-hotel/backend

#             echo "Creating .env file..."
#             cat <<EOT | sudo tee /home/ec2-user/e-hotel/backend/.env
#             DB_HOST=${aws_db_instance.postgres.address}
#             DB_USER=$DB_USER
#             DB_PASSWORD=$DB_PASSWORD
#             DB_NAME=mydatabase
#             DB_PORT=5432
#             PORT=3000
#             EOT

#             echo "Setting permissions for .env..."
#             sudo chmod 600 /home/ec2-user/e-hotel/backend/.env

#             echo "Installing dependencies..."
#             npm install

#             echo "Starting server..."
#             node server.js
#             EOF
#   tags = {
#     Name = "study-sync-app-server"
#   }
# }

resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.latest_amazon_linux.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.app_key_pair.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_instance_profile.id  # Attach the IAM role

  # user_data = <<-EOF
  #             #!/bin/bash
  #           echo "Updating system..."
  #           sudo yum update -y

  #           echo "Installing AWS CLI..."
  #           sudo yum install aws-cli -y

  #           echo "Fetching database credentials from AWS Secrets Manager..."
  #           secret=$(aws secretsmanager get-secret-value --secret-id study-sync-db-credentials --query SecretString --output text --region us-east-1)

  #           DB_USER=$(echo $secret | jq -r '.DB_USER')
  #           DB_PASSWORD=$(echo $secret | jq -r '.DB_PASSWORD')

  #           echo "Installing Git..."
  #           sudo yum install git -y

  #           echo "Cloning repository..."
  #           git clone https://github.com/nisarg3322/e-hotel.git /home/ec2-user/e-hotel

  #           echo "Installing Node.js..."
  #           curl -sL https://rpm.nodesource.com/setup_lts.x | sudo bash -
  #           sudo yum install nodejs -y

  #           echo "Installing PostgreSQL client..."
  #           sudo yum install postgresql15 -y

  #           echo "Changing directory to backend..."
  #           cd /home/ec2-user/e-hotel/backend

  #           echo "Creating .env file..."
  #           cat <<EOT | sudo tee /home/ec2-user/e-hotel/backend/.env
  #           DB_HOST=${aws_db_instance.postgres.address}
  #           DB_USER=$DB_USER
  #           DB_PASSWORD=$DB_PASSWORD
  #           DB_NAME=mydatabase
  #           DB_PORT=5432
  #           PORT=3000
  #           EOT

  #           echo "Setting permissions for .env..."
  #           sudo chmod 600 /home/ec2-user/e-hotel/backend/.env

  #           echo "Installing dependencies..."
  #           npm install

  #           echo "Running database initialization..."
  #           export PGPASSWORD="StrongPassword123!"
  #           psql -h ${aws_db_instance.postgres.address} -U nisarg -d mydatabase -p 5432 -f /home/ec2-user/e-hotel/backend/db-init/init.sql

  #           echo "Starting server..."
  #           node server.js
  #           EOF

  user_data = <<EOF
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

echo "Installing PostgreSQL client..."
sudo yum install postgresql15 -y

echo "Changing directory to backend..."
cd /home/ec2-user/e-hotel/backend

echo "Creating .env file..."
cat <<EOT | sudo tee /home/ec2-user/e-hotel/backend/.env
DB_HOST=${aws_db_instance.postgres.address}
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
psql -h ${aws_db_instance.postgres.address} -U nisarg -d mydatabase -p 5432 -f /home/ec2-user/e-hotel/backend/db-init/init.sql

echo "Starting server..."
node server.js > /home/ec2-user/e-hotel/backend/server.log 2>&1 &
EOF


  tags = {
    Name = "study-sync-app-server"
  }
}

# Instance Profile for EC2 to attach the IAM Role
resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "ec2_instance_profile"
  role = aws_iam_role.ec2_secrets_role.name
}




# RDS Database
resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  engine              = "postgres"
  engine_version      = "16"
  instance_class      = "db.t3.micro"
  db_name             = "mydatabase"
  username           = "nisarg"
  password           = "StrongPassword123!"
  publicly_accessible = false
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot  = true
}

# Outputs
output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
