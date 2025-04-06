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





resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.latest_amazon_linux.id
  instance_type          = "t3.micro"
  key_name               = "e-hotels"
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_instance_profile.id  # Attach the IAM role


  user_data = templatefile("${path.module}/setup_ec2.sh", {
    db_host = aws_db_instance.postgres.address
  })


  tags = {
    Name = "study-sync-app-server"
  }

    associate_public_ip_address = false

}

data "aws_eip" "existing_eip" {
  filter {
    name   = "tag:name"
    values = ["e-hotels-ip"]  # Match the tag of your manually created EIP
  }
}

resource "aws_eip_association" "app_eip_assoc" {
  instance_id   = aws_instance.app_server.id
  allocation_id = data.aws_eip.existing_eip.id
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
