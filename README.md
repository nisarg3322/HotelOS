# E-Hotel

A hotel management system with automated cloud deployment. I built this project to demonstrate modern web development practices and cloud infrastructure automation.

## What I Built

I created a full-stack hotel management system with automated deployment to AWS. The system includes a modern web interface for hotel management, real-time room tracking, and booking management. The entire infrastructure is managed through code using Terraform, and deployments are automated using GitHub Actions.

## Key Accomplishments

- Implemented Infrastructure as Code using Terraform to manage AWS resources
- Set up automated CI/CD pipelines with GitHub Actions for zero-downtime deployments
- Created a secure AWS infrastructure with proper IAM roles and security groups
- Built a responsive frontend with Next.js and a robust backend with Node.js
- Implemented PM2 for process management and application monitoring

## Infrastructure & Deployment

### Terraform Infrastructure

- EC2 instance for hosting the application
- Security groups for network access control
- IAM roles with least privilege access
- VPC and networking components
- Infrastructure changes are managed through GitHub Actions workflow

### CI/CD Pipeline

- **Infrastructure Deployment**: Manual trigger through GitHub Actions

  - Terraform init, plan, and apply
  - AWS resource provisioning
  - Security group configuration

- **Application Deployment**: Automatic on push to master
  - Code checkout and validation
  - Secure SSH deployment to EC2
  - PM2 process management
  - Zero-downtime updates

## Technologies Used

### Infrastructure & DevOps

- AWS (EC2, VPC, Security Groups)
- Terraform
- GitHub Actions
- PM2

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- PostgreSQL

## Quick Start

1. Clone the repository
2. Set up AWS credentials
3. Run Terraform to provision infrastructure
4. Push to master for automatic deployment

## License

MIT License
