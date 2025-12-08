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

## 🔄 Release Process

### Prerequisites

1. **Docker Hub Account**: Sign up at https://hub.docker.com
2. **GitHub Secrets Configured**: 
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password/token
3. **Git configured** with push access to main branch

### Quick Release

```bash
# Ensure you're on main branch with all changes committed
git checkout main
git pull origin main

# Create and push a release tag
npm run release:patch   # For bug fixes (1.0.0 → 1.0.1)
npm run release:minor   # For new features (1.0.0 → 1.1.0)
npm run release:major   # For breaking changes (1.0.0 → 2.0.0)
```

### Manual Release Process

```bash
# 1. Update version
npm version patch  # or minor, or major

# 2. Push changes and tags
git push origin main --tags

# 3. GitHub Actions will automatically:
#    - Run all tests
#    - Build Docker images
#    - Push to Docker Hub with version and latest tags
#    - Create GitHub Release with changelog
#    - Notify team via Slack (if configured)
```

### What Happens During Release?

1. **Tag Detection**: GitHub Actions detects the version tag (e.g., `v1.0.0`)
2. **Testing**: Runs all unit tests to ensure quality
3. **Docker Build**: Builds multi-architecture Docker images
4. **Docker Push**: Pushes images to Docker Hub:
   - Version tag: `yourusername/notes-app:1.0.0`
   - Latest tag: `yourusername/notes-app:latest`
5. **GitHub Release**: Creates release with:
   - Auto-generated changelog
   - Docker pull commands
   - Deployment instructions
6. **Notifications**: Sends Slack notification (if configured)

### Release Artifacts

Each release creates:
- Docker images on Docker Hub
- GitHub Release with changelog
- Git tag in repository
- Release notes document

### Verifying a Release

```bash
# Check Docker Hub
docker pull yourusername/notes-app:1.0.0
docker pull yourusername/notes-app:latest

# Run the release
docker run -d -p 3000:3000 \
  -e DB_HOST=localhost \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=notes_app \
  yourusername/notes-app:1.0.0

# Test the application
curl http://localhost:3000/health
```

### Troubleshooting Releases

**Release workflow not triggering?**
```bash
# Ensure tag starts with 'v'
git tag v1.0.0
git push origin v1.0.0

# Check GitHub Actions tab for workflow runs
```

**Docker push failing?**
```bash
# Verify secrets in GitHub Settings
# Settings → Secrets and variables → Actions
# Required: DOCKER_USERNAME, DOCKER_PASSWORD
```

**Need to redo a release?**
```bash
# Delete remote tag
git push --delete origin v1.0.0

# Delete local tag
git tag -d v1.0.0

# Create new tag
git tag v1.0.0
git push origin v1.0.0
```

### Version History

| Version | Date | Docker Tags | Notes |
|---------|------|-------------|-------|
| 1.0.0 | TBD | `1.0.0`, `latest` | Initial release |

View all releases: [GitHub Releases](https://github.com/yourusername/notes-app/releases)

## 📦 Available Versions

```bash
# Pull specific version
docker pull your-dockerhub-username/notes-app:1.0.0

# Pull latest version
docker pull your-dockerhub-username/notes-app:latest
```

See [Releases](https://github.com/your-username/notes-app/releases) for full changelog.

## 🔐 Security

- Security scanning with Snyk
- Automated dependency updates
- Regular security audits
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting

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