# 🚀 AWS Deployment Guide - School Management API

This guide provides comprehensive instructions for deploying the School Management API to AWS using multiple deployment strategies.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js 18+ installed locally
- Docker installed (for containerized deployments)
- Git repository with your code

## 🔧 Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-management?retryWrites=true&w=majority

# Server Configuration
NODE_ENV=production
PORT=3000

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: MongoDB Atlas (recommended for production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-management
```

## 🎯 Deployment Options

### 1. AWS Elastic Beanstalk (Recommended for Beginners)

**Pros:** Easy setup, automatic scaling, managed infrastructure
**Cons:** Less control over infrastructure

#### Steps:

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk:**
   ```bash
   eb init --platform node.js --region us-east-1
   ```

3. **Create Environment:**
   ```bash
   eb create production
   ```

4. **Set Environment Variables:**
   ```bash
   eb setenv MONGODB_URI="your-mongodb-connection-string"
   eb setenv NODE_ENV="production"
   eb setenv ALLOWED_ORIGINS="https://yourdomain.com"
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

6. **Open Application:**
   ```bash
   eb open
   ```

### 2. AWS ECS with Fargate (Containerized)

**Pros:** Fully managed containers, auto-scaling, cost-effective
**Cons:** More complex setup

#### Steps:

1. **Create ECR Repository:**
   ```bash
   aws ecr create-repository --repository-name school-management-api
   ```

2. **Build and Push Docker Image:**
   ```bash
   # Build image
   docker build -t school-management-api .
   
   # Tag for ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   
   docker tag school-management-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/school-management-api:latest
   
   # Push to ECR
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/school-management-api:latest
   ```

3. **Create ECS Cluster:**
   ```bash
   aws ecs create-cluster --cluster-name school-management-cluster
   ```

4. **Create Task Definition:**
   ```json
   {
     "family": "school-management-api",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "school-management-api",
         "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/school-management-api:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           },
           {
             "name": "PORT",
             "value": "3000"
           }
         ],
         "secrets": [
           {
             "name": "MONGODB_URI",
             "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:school-management/mongodb-uri"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/school-management-api",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

5. **Create Service:**
   ```bash
   aws ecs create-service \
     --cluster school-management-cluster \
     --service-name school-management-service \
     --task-definition school-management-api:1 \
     --desired-count 1 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
   ```

### 3. AWS EC2 (Traditional Server)

**Pros:** Full control, cost-effective for small applications
**Cons:** Manual setup and maintenance required

#### Steps:

1. **Launch EC2 Instance:**
   - Choose Amazon Linux 2 or Ubuntu
   - Instance type: t3.micro (free tier) or t3.small
   - Security groups: SSH (22), HTTP (80), HTTPS (443), Custom (3000)

2. **Connect and Setup:**
   ```bash
   # Connect to instance
   ssh -i your-key.pem ec2-user@your-instance-ip
   
   # Update system
   sudo yum update -y
   
   # Install Node.js 18
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install MongoDB (or use MongoDB Atlas)
   # For local MongoDB:
   sudo yum install -y mongodb-server
   sudo service mongod start
   ```

3. **Deploy Application:**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/school-management-api.git
   cd school-management-api
   
   # Install dependencies
   npm install
   
   # Set environment variables
   export NODE_ENV=production
   export MONGODB_URI="your-mongodb-connection-string"
   export PORT=3000
   
   # Start with PM2
   pm2 start server.js --name school-api
   pm2 startup
   pm2 save
   ```

4. **Setup Nginx Reverse Proxy:**
   ```bash
   # Install nginx
   sudo yum install -y nginx
   
   # Configure nginx
   sudo nano /etc/nginx/conf.d/school-api.conf
   ```

   Nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Start nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

## 🗄️ Database Options

### Option 1: MongoDB Atlas (Recommended)
- Fully managed MongoDB service
- Automatic backups and scaling
- Global clusters
- Free tier available

### Option 2: Self-managed MongoDB on EC2
- More control but requires maintenance
- Need to handle backups and scaling manually

### Option 3: AWS DocumentDB
- MongoDB-compatible database service
- Fully managed by AWS
- More expensive but highly available

## 🔒 Security Considerations

1. **Environment Variables:**
   - Use AWS Secrets Manager for sensitive data
   - Never commit `.env` files to version control

2. **Network Security:**
   - Configure security groups properly
   - Use VPC for network isolation
   - Enable SSL/TLS certificates

3. **Application Security:**
   - Helmet.js for security headers
   - Rate limiting implemented
   - Input validation and sanitization

4. **Database Security:**
   - Use strong passwords
   - Enable authentication
   - Configure network access rules

## 📊 Monitoring and Logging

### CloudWatch Integration:
```javascript
// Add to server.js for CloudWatch logging
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// Custom metrics
const sendMetric = (metricName, value, unit = 'Count') => {
  const params = {
    Namespace: 'SchoolManagementAPI',
    MetricData: [{
      MetricName: metricName,
      Value: value,
      Unit: unit,
      Timestamp: new Date()
    }]
  };
  cloudwatch.putMetricData(params).promise();
};
```

### Health Checks:
- `/api/health` endpoint for load balancer health checks
- Custom health check script included in Dockerfile

## 🚀 Quick Deployment Script

Use the provided `aws-deploy.sh` script for automated deployment:

```bash
./aws-deploy.sh
```

## 📈 Scaling Considerations

1. **Horizontal Scaling:**
   - Use Application Load Balancer
   - Multiple instances behind load balancer
   - Auto Scaling Groups for EC2

2. **Database Scaling:**
   - MongoDB Atlas auto-scaling
   - Read replicas for read-heavy workloads
   - Sharding for very large datasets

3. **Caching:**
   - Redis for session storage
   - CloudFront for static content
   - Application-level caching

## 🔧 Troubleshooting

### Common Issues:

1. **Port 3000 not accessible:**
   - Check security group settings
   - Verify application is listening on 0.0.0.0:3000

2. **Database connection issues:**
   - Verify MongoDB URI format
   - Check network access rules
   - Ensure database is running

3. **Environment variables not loading:**
   - Check `.env` file format
   - Verify variable names match exactly
   - Restart application after changes

### Logs and Debugging:

```bash
# Elastic Beanstalk
eb logs

# ECS
aws logs get-log-events --log-group-name /ecs/school-management-api

# EC2 with PM2
pm2 logs school-api
```

## 📞 Support

For issues and questions:
- Check AWS documentation
- Review application logs
- Test locally first
- Use AWS support if needed

---

**Happy Deploying! 🎉**
