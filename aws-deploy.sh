#!/bin/bash

# AWS Deployment Script for School Management API
# This script provides multiple deployment options

set -e

echo "🚀 School Management API - AWS Deployment Script"
echo "================================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "   Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if user is logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

# Function to deploy to Elastic Beanstalk
deploy_elastic_beanstalk() {
    echo "📦 Deploying to AWS Elastic Beanstalk..."
    
    # Check if EB CLI is installed
    if ! command -v eb &> /dev/null; then
        echo "❌ EB CLI is not installed. Installing..."
        pip install awsebcli
    fi
    
    # Initialize EB if not already done
    if [ ! -f ".elasticbeanstalk/config.yml" ]; then
        echo "🔧 Initializing Elastic Beanstalk..."
        eb init --platform node.js --region us-east-1
    fi
    
    # Create environment if it doesn't exist
    echo "🌱 Creating/updating environment..."
    eb deploy
    
    echo "✅ Deployment to Elastic Beanstalk completed!"
    echo "🌐 Your API is available at: $(eb status | grep 'CNAME' | awk '{print $2}')"
}

# Function to deploy to ECS
deploy_ecs() {
    echo "🐳 Deploying to AWS ECS with Fargate..."
    
    # Build and push Docker image
    echo "🔨 Building Docker image..."
    docker build -t school-management-api .
    
    # Tag for ECR
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION="us-east-1"
    ECR_REPOSITORY="school-management-api"
    
    echo "📤 Pushing to ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    docker tag school-management-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    
    echo "✅ Docker image pushed to ECR!"
    echo "📝 Next steps:"
    echo "   1. Create ECS cluster: aws ecs create-cluster --cluster-name school-management-cluster"
    echo "   2. Create task definition using the ECR image"
    echo "   3. Create service to run the task"
}

# Function to deploy to EC2
deploy_ec2() {
    echo "🖥️  Deploying to AWS EC2..."
    
    echo "📝 EC2 Deployment Steps:"
    echo "   1. Launch EC2 instance (t3.micro or larger)"
    echo "   2. Install Node.js 18, PM2, and MongoDB"
    echo "   3. Clone your repository"
    echo "   4. Install dependencies: npm install"
    echo "   5. Set environment variables"
    echo "   6. Start with PM2: pm2 start server.js --name school-api"
    echo "   7. Configure security groups (ports 22, 80, 443, 3000)"
    echo "   8. Set up nginx reverse proxy"
}

# Main menu
echo ""
echo "Select deployment method:"
echo "1) AWS Elastic Beanstalk (Recommended for beginners)"
echo "2) AWS ECS with Fargate (Containerized)"
echo "3) AWS EC2 (Traditional server)"
echo "4) Show deployment instructions"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_elastic_beanstalk
        ;;
    2)
        deploy_ecs
        ;;
    3)
        deploy_ec2
        ;;
    4)
        echo "📖 Detailed deployment instructions:"
        echo "   See DEPLOYMENT.md for complete guide"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "📚 Check the logs and monitor your application in the AWS Console."
