# 🏫 School Management API

A comprehensive REST API for managing schools and students, built with Node.js, Express, and MongoDB. This API provides full CRUD operations for educational institutions and their student populations.

## 🚀 Features

- **Complete CRUD Operations** for Schools and Students
- **Student Enrollment System** with school assignment
- **MongoDB Integration** with Mongoose ODM
- **Production-Ready Security** with Helmet, Rate Limiting, and CORS
- **Docker Support** for containerized deployment
- **AWS Deployment Ready** (Elastic Beanstalk, ECS, EC2)
- **Comprehensive Testing** with automated test suite
- **Postman Collection** for easy API testing
- **Health Monitoring** with health check endpoints

## 📋 API Endpoints

### Schools
- `GET /api/schools` - Get all schools
- `GET /api/schools/:id` - Get specific school
- `POST /api/schools` - Create new school
- `PUT /api/schools/:id` - Update school
- `DELETE /api/schools/:id` - Delete school
- `GET /api/schools/:id/students` - Get students in a school

### Students
- `GET /api/students` - Get all students (with filtering)
- `GET /api/students/:id` - Get specific student
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `PATCH /api/students/:id/enroll` - Enroll student in school
- `PATCH /api/students/:id/unenroll` - Unenroll student from school

### System
- `GET /api/health` - Health check endpoint
- `GET /` - API information

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Security:** Helmet, Express Rate Limit, CORS
- **Containerization:** Docker, Docker Compose
- **Deployment:** AWS (EB, ECS, EC2)
- **Testing:** Custom test suite, Postman collection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd school-management-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.production .env
   # Edit .env with your MongoDB connection string
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

5. **Test the API:**
   ```bash
   curl http://localhost:3000/api/health
   ```

## 🐳 Docker Deployment

### Local Development
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run individually
docker build -t school-management-api .
docker run -p 3000:3000 school-management-api
```

## ☁️ AWS Deployment

### Option 1: Elastic Beanstalk (Recommended)
```bash
# Install EB CLI
pip install awsebcli

# Deploy
eb init
eb create production
eb deploy
```

### Option 2: ECS with Fargate
```bash
# Use the deployment script
./aws-deploy.sh
# Select option 2
```

### Option 3: EC2
```bash
# Follow the detailed guide in DEPLOYMENT.md
```

## 🧪 Testing

### Automated Test Suite
```bash
# Test locally
node test-deployment.js

# Test deployed API
API_URL=https://your-api-url.com node test-deployment.js
```

### Postman Collection
1. Import `School-Management-API.postman_collection.json`
2. Set up environment variables
3. Start testing endpoints

## 📊 API Examples

### Create a School
```bash
curl -X POST http://localhost:3000/api/schools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lincoln High School",
    "address": "123 Education St, Learning City, LC 12345",
    "phone": "555-0123",
    "email": "info@lincolnhigh.edu",
    "establishedYear": 1950,
    "principal": "Dr. Jane Smith"
  }'
```

### Create a Student
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "phone": "555-0456",
    "dateOfBirth": "2005-03-15",
    "grade": "10th",
    "address": {
      "street": "456 Student Ave",
      "city": "Learning City",
      "state": "LC",
      "zipCode": "12345"
    }
  }'
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configurable origin restrictions
- **Input Validation** - Mongoose schema validation
- **Error Handling** - Secure error responses

## 📁 Project Structure

```
school-management-api/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── School.js           # School data model
│   └── Student.js          # Student data model
├── routes/
│   ├── schools.js          # School routes
│   └── students.js         # Student routes
├── .ebextensions/          # AWS Elastic Beanstalk config
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Multi-container setup
├── nginx.conf              # Nginx reverse proxy
├── server.js               # Main application file
├── healthcheck.js          # Health check script
├── test-deployment.js      # Automated testing
├── aws-deploy.sh           # AWS deployment script
└── DEPLOYMENT.md           # Detailed deployment guide
```

## 🌐 Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/school-management

# Server
NODE_ENV=development
PORT=3000

# Security
ALLOWED_ORIGINS=https://yourdomain.com
```

## 📈 Monitoring & Health Checks

- **Health Endpoint:** `/api/health`
- **Container Health Checks** included in Dockerfile
- **CloudWatch Integration** ready for AWS
- **Structured Logging** for production monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the [Deployment Guide](DEPLOYMENT.md)
- Review the [Postman Collection](School-Management-API.postman_collection.json)
- Run the test suite: `node test-deployment.js`

## 🎯 Roadmap

- [ ] Authentication & Authorization
- [ ] Role-based Access Control
- [ ] File Upload for Student Photos
- [ ] Email Notifications
- [ ] Advanced Reporting
- [ ] API Documentation with Swagger
- [ ] GraphQL Support

---

**Built with ❤️ for educational management**