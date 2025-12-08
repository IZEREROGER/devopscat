# Notes App 📝

A production-ready notes application with MySQL backend, complete CI/CD pipeline, and Docker support.

## 🚀 Quick Start

### Docker (Recommended)

```bash
# Pull the latest image
docker pull yourusername/notes-app:latest

# Run with Docker Compose
docker-compose up -d

# Or run standalone
docker run -d \
  -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_NAME=notes_app \
  yourusername/notes-app:latest
```

### Local Development

```bash
# Install dependencies
npm install

# Start MySQL
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=notes_app \
  mysql:8.0

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## 📦 Available Versions

| Version | Release Date | Docker Tag | Notes |
|---------|--------------|------------|-------|
| 1.0.0 | 2024-01-15 | `v1.0.0`, `latest` | Initial release |

See [Releases](https://github.com/yourusername/notes-app/releases) for full changelog.

## 🔄 Release Process

### Creating a New Release

```bash
# For bug fixes (1.0.0 → 1.0.1)
npm run release:patch

# For new features (1.0.0 → 1.1.0)
npm run release:minor

# For breaking changes (1.0.0 → 2.0.0)
npm run release:major
```

### Manual Release

```bash
# 1. Bump version
npm version patch  # or minor, major

# 2. Build Docker image
docker build -t yourusername/notes-app:$(node -p "require('./package.json').version") .

# 3. Tag as latest
docker tag yourusername/notes-app:$(node -p "require('./package.json').version") yourusername/notes-app:latest

# 4. Push to Docker Hub
docker push yourusername/notes-app:$(node -p "require('./package.json').version")
docker push yourusername/notes-app:latest

# 5. Push git tags
git push origin main --tags
```

## 🏗️ Architecture

![Architecture Diagram](./docs/architecture.png)

- **Frontend**: Bootstrap-based UI served by Express
- **Backend**: Node.js/Express API for note management
- **Database**: MySQL for persistent storage
- **Containerization**: Docker for consistent environments
- **CI/CD**: GitHub Actions for automated workflows

## 📝 Environment Variables

See [env.md](./env.md) for complete environment variable documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:performance

# Generate coverage report
npm run test:coverage
```

## 🔐 Security

- Security scanning with Snyk
- Automated dependency updates
- Regular security audits
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting

## 📚 Documentation

- [Environment Variables](./env.md)
- [API Documentation](./API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Release Notes](https://github.com/yourusername/notes-app/releases)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Express.js framework
- MySQL database
- GitHub Actions for CI/CD
- Docker for containerization

---

**Maintained by:** Your Name  
**Last Updated:** 2024-01-15