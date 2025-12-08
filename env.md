# Environment Variables Configuration

This document explains all environment variables used in the Notes App project across different environments (local development, CI/CD, and production).

## 📋 Table of Contents

- [Application Variables](#application-variables)
- [Database Variables](#database-variables)
- [CI/CD Pipeline Variables](#cicd-pipeline-variables)
- [Security Variables](#security-variables)
- [Monitoring Variables](#monitoring-variables)
- [Environment Setup](#environment-setup)

## 🚀 Application Variables

### Core Application Settings

| Variable | Description | Default | Required | Example |
|----------|-------------|---------|----------|---------|
| `NODE_ENV` | Application environment | `development` | No | `production` |
| `PORT` | Server port number | `3000` | No | `8080` |
| `LOG_LEVEL` | Logging verbosity | `info` | No | `debug` |

### Usage:
```bash
# Local development
export NODE_ENV=development
export PORT=3000
export LOG_LEVEL=debug

# Production
export NODE_ENV=production
export PORT=8080
export LOG_LEVEL=warn
```

## 🗄️ Database Variables

### MySQL Configuration

| Variable | Description | Default | Required | Example |
|----------|-------------|---------|----------|---------|
| `DB_HOST` | Database host | `localhost` | Yes | `mysql-server.local` |
| `DB_USER` | Database username | `root` | Yes | `notes_user` |
| `DB_PASSWORD` | Database password | `password` | Yes | `secure_password_123` |
| `DB_NAME` | Database name | `notes_app` | Yes | `notes_production` |
| `DB_PORT` | Database port | `3306` | No | `3306` |

### Test Database Variables

| Variable | Description | Default | Required | Example |
|----------|-------------|---------|----------|---------|
| `TEST_DB_HOST` | Test database host | `localhost` | Yes (CI) | `localhost` |
| `TEST_DB_USER` | Test database user | `root` | Yes (CI) | `root` |
| `TEST_DB_PASSWORD` | Test database password | `password` | Yes (CI) | `password` |
| `TEST_DB_NAME` | Test database name | `notes_app_test` | Yes (CI) | `notes_app_test` |

### Usage:
```bash
# Local development
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=your_local_password
export DB_NAME=notes_app

# Production
export DB_HOST=prod-mysql.company.com
export DB_USER=notes_prod_user
export DB_PASSWORD=super_secure_prod_password
export DB_NAME=notes_production
```

## 🔄 CI/CD Pipeline Variables

### GitHub Actions Secrets

These must be configured in GitHub Repository Settings → Secrets and variables → Actions:

| Secret Name | Description | Required | Where to Get |
|-------------|-------------|----------|--------------|
| `SNYK_TOKEN` | Snyk security scanning token | Yes | [Snyk Dashboard](https://app.snyk.io/) |
| `SLACK_WEBHOOK_URL` | Slack notifications webhook | Optional | Slack App Settings |
| `CODECOV_TOKEN` | Code coverage reporting | Optional | [Codecov Dashboard](https://codecov.io/) |
| `DOCKER_USERNAME` | Docker registry username | Optional | Docker Hub |
| `DOCKER_PASSWORD` | Docker registry password | Optional | Docker Hub |

### Pipeline Environment Variables

| Variable | Description | Value | Usage |
|----------|-------------|-------|-------|
| `NODE_VERSION` | Node.js version for CI | `18` | GitHub Actions |
| `MYSQL_VERSION` | MySQL version for CI | `8.0` | GitHub Actions |
| `MYSQL_ROOT_PASSWORD` | CI MySQL root password | `password` | GitHub Actions services |
| `MYSQL_DATABASE` | CI MySQL database name | `notes_app_test` | GitHub Actions services |

## 🔐 Security Variables

### Authentication & Security (Future Implementation)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `JWT_SECRET` | JWT token signing secret | Future | `your-super-secret-jwt-key` |
| `ENCRYPTION_KEY` | Data encryption key | Future | `32-character-encryption-key` |
| `CORS_ORIGIN` | Allowed CORS origins | Future | `https://yourapp.com` |
| `RATE_LIMIT_MAX` | Rate limiting max requests | Future | `100` |

## 📊 Monitoring Variables

### Health Check & Monitoring (Future Implementation)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `HEALTH_CHECK_INTERVAL` | Health check frequency | Future | `30` (seconds) |
| `METRICS_PORT` | Prometheus metrics port | Future | `9090` |
| `ALERT_EMAIL` | Alert notification email | Future | `alerts@yourcompany.com` |

## ⚙️ Environment Setup

### 1. Local Development Setup

Create a `.env` file in your project root:

```bash
# Create .env file
cat > .env << 'EOF'
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=notes_app

# Optional: Override defaults
# DB_PORT=3306
EOF

# Load environment variables
source .env
```

### 2. Docker Development Setup

Update `docker-compose.yml` environment section:

```yaml
environment:
  - NODE_ENV=development
  - DB_HOST=mysql
  - DB_USER=root
  - DB_PASSWORD=password
  - DB_NAME=notes_app
```

### 3. GitHub Actions Setup

#### Step 1: Configure Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions:

1. **Add Snyk Token** (Required for security scanning):
   ```
   Name: SNYK_TOKEN
   Value: your-snyk-api-token
   ```

2. **Add Slack Webhook** (Optional for notifications):
   ```
   Name: SLACK_WEBHOOK_URL
   Value: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
   ```

3. **Add Codecov Token** (Optional for coverage):
   ```
   Name: CODECOV_TOKEN
   Value: your-codecov-token
   ```

#### Step 2: Verify Pipeline Variables

The CI pipeline uses these predefined environment variables:

```yaml
env:
  NODE_VERSION: '18'
  MYSQL_VERSION: '8.0'
```

### 4. Production Deployment Setup

#### Server Environment Variables:
```bash
# Application
export NODE_ENV=production
export PORT=8080
export LOG_LEVEL=warn

# Database (Use secure values)
export DB_HOST=your-prod-db-host
export DB_USER=your-prod-db-user
export DB_PASSWORD=your-secure-prod-password
export DB_NAME=notes_production

# Security (Future)
export JWT_SECRET=your-super-secure-jwt-secret
export CORS_ORIGIN=https://your-production-domain.com
```

#### Docker Production:
```bash
docker run -d \
  --name notes-app-prod \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DB_HOST=prod-mysql-host \
  -e DB_USER=prod_user \
  -e DB_PASSWORD=secure_password \
  -e DB_NAME=notes_production \
  notes-app:latest
```

## 🔧 Configuration Examples

### Development Configuration

```bash
#!/bin/bash
# dev-setup.sh

# Set development environment
export NODE_ENV=development
export PORT=3000
export LOG_LEVEL=debug

# Local MySQL setup
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=dev_password
export DB_NAME=notes_app_dev

echo "Development environment configured!"
echo "Run: npm run dev"
```

### Production Configuration

```bash
#!/bin/bash
# prod-setup.sh

# Set production environment
export NODE_ENV=production
export PORT=8080
export LOG_LEVEL=error

# Production database (replace with actual values)
export DB_HOST=prod-mysql.internal
export DB_USER=notes_prod
export DB_PASSWORD=$(cat /etc/secrets/db_password)
export DB_NAME=notes_production

echo "Production environment configured!"
echo "Run: npm start"
```

### Testing Configuration

```bash
#!/bin/bash
# test-setup.sh

# Set test environment
export NODE_ENV=test
export PORT=3001

# Test database
export TEST_DB_HOST=localhost
export TEST_DB_USER=root
export TEST_DB_PASSWORD=password
export TEST_DB_NAME=notes_app_test

echo "Test environment configured!"
echo "Run: npm test"
```

## 🚨 Security Best Practices

### 1. Never Commit Secrets
- Add `.env` files to `.gitignore`
- Use environment variables for all sensitive data
- Rotate secrets regularly

### 2. Use Strong Values
```bash
# Good
DB_PASSWORD=Kj9#mL2$pR8qN5wX

# Bad
DB_PASSWORD=password123
```

### 3. Separate Environments
- Different passwords for dev/staging/prod
- Separate databases per environment
- Isolated access credentials

### 4. Monitor Access
- Log environment variable access
- Audit secret usage
- Alert on unauthorized access

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   ```bash
   # Check variables
   echo $DB_HOST $DB_USER $DB_NAME
   
   # Test connection
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SHOW DATABASES;"
   ```

2. **CI Pipeline Failing**
   ```bash
   # Verify GitHub secrets are set
   # Check Actions logs for missing variables
   ```

3. **Docker Container Issues**
   ```bash
   # Check environment variables in container
   docker exec container-name env | grep DB_
   ```

### Environment Validation Script:

```javascript
// validate-env.js
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

console.log('🔍 Validating environment variables...');

const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing);
  process.exit(1);
}

console.log('✅ All required environment variables are set!');
```

---

**Last Updated:** January 2024  
**Next Review:** February 2024

For questions about environment configuration, check the main [README.md](./README.md) or create a GitHub issue.
