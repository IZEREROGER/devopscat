# Notes App - DevOps Pipeline Project

A simple CRUD notes application built with Node.js, Express, MySQL, and Bootstrap, implementing a complete DevOps pipeline for learning and demonstration purposes.

## 🚀 Features

- **CRUD Operations**: Create, Read, Update, Delete notes
- **Responsive UI**: Bootstrap-based frontend with modern design
- **REST API**: RESTful endpoints for note management
- **Database Integration**: MySQL for persistent data storage
- **Health Monitoring**: Built-in health check endpoints
- **Containerization**: Docker support with multi-stage builds
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [DevOps Implementation](#devops-implementation)
- [Database Schema](#database-schema)
- [Docker Setup](#docker-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Error Budget Policy](#error-budget-policy)
- [Contributing](#contributing)

## 🏁 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd notes
npm install
```

2. **Set up MySQL database:**
```sql
CREATE DATABASE notes_app;
```

3. **Configure environment variables:**
```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=notes_app
```

4. **Start the application:**
```bash
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

5. **Access the application:**
   - Web UI: http://localhost:3000
   - Health Check: http://localhost:3000/health

### Docker Development

```bash
docker-compose up -d
```

## 📁 Project Structure

```
notes/
├── index.js                 # Main application server
├── package.json             # Node.js dependencies and scripts
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Development environment setup
├── healthcheck.js          # Docker health check script
├── README.md               # This documentation
├── public/
│   └── index.html          # Bootstrap frontend
├── .github/workflows/
│   └── ci.yml              # GitHub Actions CI/CD pipeline
├── tests/                  # Test files (to be created)
└── docs/                   # Additional documentation
```

## 🔗 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/` | Serve frontend application | - |
| GET | `/api/notes` | Get all notes | - |
| POST | `/api/notes` | Create new note | `{title, content}` |
| PUT | `/api/notes/:id` | Update existing note | `{title, content}` |
| DELETE | `/api/notes/:id` | Delete note | - |
| GET | `/health` | Health check endpoint | - |

### Example API Usage

**Create a note:**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Note", "content": "This is the content"}'
```

**Get all notes:**
```bash
curl http://localhost:3000/api/notes
```

## 🛠 DevOps Implementation

### Phase 1: Plan ✅
- **Scope**: Node.js CRUD application with MySQL backend
- **DevOps Roadmap**: Code → Build → Test → Deploy → Monitor
- **Error Budget**: 99.9% uptime (8.76 hours downtime/year)

### Phase 2: Code ✅
- **Git Strategy**: GitFlow (feature → develop → main branches)
- **Code Quality**: ESLint for code standards
- **Version Control**: Semantic versioning (1.0.0)

### Phase 3: Build ✅
- **CI Pipeline**: GitHub Actions
- **Containerization**: Multi-stage Dockerfile
- **Image Optimization**: Alpine Linux base, minimal dependencies
- **Health Checks**: Built-in monitoring endpoints

## 🗄 Database Schema

**Notes Table:**
```sql
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🐳 Docker Setup

### Multi-stage Dockerfile Benefits:
- **Security**: Non-root user execution
- **Size Optimization**: Production dependencies only
- **Health Monitoring**: Built-in health checks
- **Scalability**: Ready for container orchestration

### Commands:
```bash
# Build image
docker build -t notes-app .

# Run container
docker run -p 3000:3000 notes-app

# Development with database
docker-compose up -d
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow:

1. **Test Stage**:
   - Lint code with ESLint
   - Run unit tests with Jest
   - Test with MySQL service

2. **Build Stage**:
   - Build Docker image
   - Test container health
   - Security scanning (future)

3. **Deploy Stage**:
   - Deploy to staging (main branch)
   - Production deployment (tags)

### Pipeline Triggers:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

## 📊 Monitoring & Health Checks

### Health Check Endpoint: `/health`
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Docker Health Check:
- Interval: 30s
- Timeout: 3s
- Retries: 3
- Start period: 5s

### Monitoring Metrics (Planned):
- API response times
- Database connection status
- Memory and CPU usage
- Error rates and logging

## 📋 Error Budget Policy

### Service Level Objectives (SLOs):
- **Availability**: 99.9% uptime
- **Response Time**: < 200ms for 95% of requests
- **Error Rate**: < 0.1% of requests

### Error Budget:
- **Monthly Allowance**: 43.8 minutes downtime
- **Incident Response**: < 5 minutes detection
- **Recovery Time**: < 15 minutes for critical issues

### Alerting Thresholds:
- 50% error budget consumed: Warning
- 80% error budget consumed: Critical alert
- 100% error budget consumed: Emergency response

## 🧪 Testing Strategy

### Test Types:
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Health Checks**: Container and service monitoring
- **Load Testing**: Performance under stress (planned)

### Running Tests:
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run lint          # Code quality checks
```

## 🚀 Deployment Environments

### Development:
- Local machine with Docker Compose
- Hot reloading with nodemon
- Debug logging enabled

### Staging:
- Container deployment
- Production-like environment
- Integration testing

### Production:
- High availability setup
- Monitoring and alerting
- Automated backups

## 📈 Performance Optimization

### Backend Optimizations:
- Connection pooling for MySQL
- Async/await for non-blocking operations
- Input validation and sanitization
- Prepared statements for security

### Frontend Optimizations:
- CDN for Bootstrap and Font Awesome
- Minimal JavaScript bundle
- Responsive design for mobile

### Container Optimizations:
- Multi-stage builds
- Alpine Linux base image
- Non-root user execution
- Health check integration

## 🤝 Contributing

### Git Workflow:
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Commit with conventional messages: `feat: add new feature`
4. Push and create pull request
5. Code review and merge to develop
6. Deploy to staging for testing
7. Merge to main for production

### Code Standards:
- ESLint configuration enforced
- Conventional commit messages
- 100% test coverage goal
- Documentation updates required

## 📝 Next Steps

### Planned Enhancements:
- [ ] Add user authentication
- [ ] Implement note categories/tags
- [ ] Add search functionality
- [ ] Performance monitoring with Prometheus
- [ ] Log aggregation with ELK stack
- [ ] Kubernetes deployment manifests
- [ ] Infrastructure as Code with Terraform

### Security Improvements:
- [ ] HTTPS/TLS configuration
- [ ] Rate limiting
- [ ] Input validation enhancement
- [ ] Security headers implementation
- [ ] Vulnerability scanning in CI

## 📞 Support

For issues and questions:
- Create GitHub issue
- Check existing documentation
- Review CI/CD pipeline logs

---

**Built with ❤️ for DevOps learning and demonstration**

Last updated: January 2024

# 📝 Notes Application

A simple, modern notes management application built with Express.js and MySQL. Features a clean REST API and comprehensive test suite with CI/CD pipeline.

[![CI/CD Pipeline](https://github.com/your-username/notes-app/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/your-username/notes-app/actions)
[![Coverage Status](https://codecov.io/gh/your-username/notes-app/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/notes-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 📝 Create, read, update, and delete notes
- 🗄️ MySQL database storage
- 🚀 RESTful API design
- 🧪 Comprehensive test suite (Unit, Integration, Performance)
- 🔒 Security scanning with Snyk
- 🐳 Docker containerization
- 🔄 CI/CD pipeline with GitHub Actions
- 📊 Code coverage reporting
- 🔍 Code quality analysis with ESLint

## 🏗️ Architecture

```
notes-app/
├── index.js              # Main application server
├── healthcheck.js         # Docker health check
├── package.json           # Dependencies and scripts
├── jest.config.js         # Test configuration
├── .eslintrc.js          # Code linting rules
├── Dockerfile            # Container configuration
├── docker-compose.yml    # Multi-service setup
├── .github/workflows/    # CI/CD pipeline
├── tests/               # Test suites
│   ├── setup.js         # Test configuration
│   ├── app.test.js      # API integration tests
│   ├── unit.test.js     # Unit tests
│   ├── performance.test.js # Performance tests
│   └── integration.test.js # End-to-end tests
└── docs/                # Documentation
    └── env.md           # Environment setup guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/notes-app.git
   cd notes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start MySQL and create database**
   ```sql
   CREATE DATABASE notes_app;
   CREATE DATABASE notes_app_test; -- For testing
   ```

5. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

6. **Verify installation**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

### Using Docker

1. **Quick start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Build custom image**
   ```bash
   docker build -t notes-app .
   docker run -p 3000:3000 notes-app
   ```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Categories

| Command | Description | Coverage |
|---------|-------------|----------|
| `npm run test:unit` | Unit tests only | Fast, isolated |
| `npm run test:integration` | Integration tests | Database included |
| `npm run test:performance` | Performance benchmarks | Response time limits |
| `npm run test:watch` | Watch mode for development | Auto-rerun on changes |
| `npm run test:coverage` | Generate coverage report | HTML + LCOV formats |

### Test Structure

```bash
tests/
├── setup.js              # Global test configuration
├── app.test.js            # API endpoint tests
├── unit.test.js           # Isolated unit tests  
├── integration.test.js    # End-to-end scenarios
└── performance.test.js    # Load and timing tests
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/health` | Health check | - | `{"status":"OK","timestamp":"..."}` |
| `GET` | `/api/notes` | Get all notes | - | `[{id,title,content,created_at,updated_at}]` |
| `POST` | `/api/notes` | Create note | `{title,content}` | `{id,title,content,message}` |
| `PUT` | `/api/notes/:id` | Update note | `{title,content}` | `{message}` |
| `DELETE` | `/api/notes/:id` | Delete note | - | `{message}` |

### Example Usage

```bash
# Create a new note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Note content here"}'

# Get all notes
curl http://localhost:3000/api/notes

# Update a note
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","content":"Updated content"}'

# Delete a note
curl -X DELETE http://localhost:3000/api/notes/1
```

## 🔧 Configuration

### Environment Variables

See [Environment Configuration Guide](docs/env.md) for detailed setup.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment | `development` | No |
| `PORT` | Server port | `3000` | No |
| `DB_HOST` | Database host | `localhost` | Yes |
| `DB_USER` | Database user | `root` | Yes |
| `DB_PASSWORD` | Database password | `password` | Yes |
| `DB_NAME` | Database name | `notes_app` | Yes |

### Database Schema

```sql
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# Triggers: Push, Pull Request, Manual dispatch
# Runs on: ubuntu-latest with Node 18, MySQL 8.0

Pipeline Stages:
1. 🔍 Code Quality  (ESLint, format check)
2. 🧪 Testing       (Unit, Integration, Performance)  
3. 🔒 Security      (Snyk vulnerability scan)
4. 📊 Coverage      (Codecov reporting)
5. 🐳 Docker Build  (Multi-stage optimized)
6. 📢 Notifications (Slack alerts)
```

### Pipeline Status

- ✅ **Code Quality**: ESLint with zero warnings
- ✅ **Test Coverage**: 80%+ required on all metrics  
- ✅ **Security**: No high/critical vulnerabilities
- ✅ **Performance**: All endpoints < 500ms response time

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build optimized production image
docker build -t notes-app:latest .

# Run with environment variables
docker run -d \
  --name notes-app-prod \
  -p 8080:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_NAME=notes_production \
  notes-app:latest
```

### Docker Compose Production

```yaml
version: '3.8'
services:
  app:
    image: notes-app:latest
    ports:
      - "8080:3000"
    environment:
      NODE_ENV: production
      DB_HOST: mysql
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secure_password
      MYSQL_DATABASE: notes_app
    volumes:
      - mysql_data:/var/lib/mysql
```

## 🚦 Development Workflow

### Local Development Setup

```bash
# 1. Install and setup
git clone <repo> && cd notes-app
npm install
cp .env.example .env

# 2. Start services  
docker-compose up -d mysql  # Database only
npm run dev                 # App with hot reload

# 3. Run tests
npm run test:watch         # Watch mode
npm run lint              # Code quality
```

### Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)  
5. **Open** Pull Request

### Code Standards

- **ESLint**: Enforced code style and quality
- **Testing**: 80%+ coverage required
- **Security**: Snyk scanning for vulnerabilities
- **Documentation**: Update README for new features

## 📊 Monitoring & Observability

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Database connectivity (via health endpoint)
# Container health (Docker)
docker ps --filter "health=healthy"
```

### Logging

```javascript
// Structured logging levels
console.log('INFO: Application started');
console.warn('WARN: Database connection slow');
console.error('ERROR: Failed to create note');
```

### Metrics (Future Implementation)

- Request/response times
- Database connection pool status  
- Error rates and types
- Resource utilization

## 🔒 Security

### Security Measures

- **Dependency Scanning**: Snyk integration in CI/CD
- **Input Validation**: SQL injection prevention
- **Docker Security**: Non-root user, minimal base image
- **Environment Isolation**: Separate dev/staging/prod configs

### Security Checklist

- [ ] Regular dependency updates
- [ ] Database credentials rotation
- [ ] HTTPS in production (future)
- [ ] Rate limiting (future)
- [ ] Authentication/authorization (future)

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MySQL service
docker-compose logs mysql

# Verify credentials  
mysql -h localhost -u root -p

# Check environment variables
echo $DB_HOST $DB_USER $DB_NAME
```

**Tests Failing**
```bash
# Clear test database
npm run test:integration -- --clearCache

# Rebuild containers
docker-compose down -v && docker-compose up -d
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process or change PORT in .env
export PORT=3001
```

### Getting Help

- 📖 Check [Environment Setup Guide](docs/env.md)
- 🐛 [Create an Issue](https://github.com/your-username/notes-app/issues)
- 💬 [Discussion Forum](https://github.com/your-username/notes-app/discussions)

## 📈 Roadmap

### Version 2.0.0 (Planned)
- [ ] User authentication (JWT)
- [ ] Note categories and tags  
- [ ] Full-text search
- [ ] File attachments
- [ ] Real-time collaboration

### Version 1.1.0 (Next)
- [ ] Rate limiting  
- [ ] Request logging
- [ ] Prometheus metrics
- [ ] HTTPS support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments

- Express.js team for the excellent framework
- MySQL team for reliable database
- Jest team for comprehensive testing tools
- GitHub Actions for seamless CI/CD
- Docker for containerization platform

---

**Built with ❤️ by [Your Name]**

*Last updated: January 2024**