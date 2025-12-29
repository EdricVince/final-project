# Quick Start Guide

Get your Quiz App backend running in 5 minutes!

## Prerequisites Checklist

- [ ] Docker Desktop installed and running
- [ ] Python 3.11+ installed
- [ ] Poetry installed (`curl -sSL https://install.python-poetry.org | python3 -`)
- [ ] Git installed

## Step 1: Clone and Setup (2 minutes)

```bash
# Navigate to project directory
cd quiz-app-be

# Copy environment file
cp .env.example .env

# Install dependencies
poetry install
```

## Step 2: Start Services with Docker (2 minutes)

```bash
# Start PostgreSQL, Redis, and MinIO
docker-compose up -d

# Verify all services are running
docker-compose ps
```

You should see:
- ✅ quiz-app-postgres (healthy)
- ✅ quiz-app-redis (healthy)
- ✅ quiz-app-minio (healthy)
- ✅ quiz-app-backend (running)
- ✅ quiz-app-celery (running)
- ✅ quiz-app-celery-beat (running)

## Step 3: Access Your Application (1 minute)

Open your browser and visit:

- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **MinIO Console**: http://localhost:9001 (admin/minioadmin)

## Alternative: Local Development

If you prefer to run the app locally without Docker for the backend:

```bash
# Start only the services (not the app)
docker-compose up -d postgres redis minio

# Activate Poetry environment
poetry shell

# Run database migrations (when you have models)
alembic upgrade head

# Start the application with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Next Steps

### 1. Update Environment Variables

Edit `.env` file with your API keys:

```bash
# Required for AI features
OPENAI_API_KEY=sk-your-key-here

# Required for Text-to-Speech
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Update if needed
SECRET_KEY=your-super-secret-production-key
```

### 2. Create Your First Migration

When you're ready to create database tables:

```bash
# Generate migration from models
alembic revision --autogenerate -m "Initial tables"

# Apply migration
alembic upgrade head
```

### 3. Test the API

```bash
# Run tests
poetry run pytest

# With coverage
poetry run pytest --cov=app
```

### 4. Code Quality

```bash
# Format code
poetry run black app/

# Sort imports
poetry run isort app/

# Type check
poetry run mypy app/

# Lint
poetry run flake8 app/
```

## Common Commands

### Docker Management

```bash
# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Reset everything (WARNING: deletes data)
docker-compose down -v
```

### Database Management

```bash
# Create new migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

### Development

```bash
# Add new dependency
poetry add package-name

# Add dev dependency
poetry add --group dev package-name

# Update dependencies
poetry update

# Run app locally
poetry run uvicorn app.main:app --reload
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=8001
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Redis Connection Error

```bash
# Test Redis connection
docker-compose exec redis redis-cli ping
# Should return: PONG

# Restart Redis
docker-compose restart redis
```

### MinIO Issues

```bash
# Access MinIO console
http://localhost:9001
# Login: minioadmin / minioadmin

# Check MinIO logs
docker-compose logs minio
```

### Poetry Issues

```bash
# Clear cache
poetry cache clear . --all

# Reinstall dependencies
rm poetry.lock
poetry install
```

## Development Workflow

### Adding a New Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Write code**
   - Add model in `app/models/`
   - Add schema in `app/schemas/`
   - Add service in `app/services/`
   - Add endpoint in `app/api/v1/endpoints/`

3. **Create migration**
   ```bash
   alembic revision --autogenerate -m "Add my feature"
   alembic upgrade head
   ```

4. **Write tests**
   ```bash
   # In app/tests/
   poetry run pytest app/tests/test_my_feature.py
   ```

5. **Code quality**
   ```bash
   poetry run black app/
   poetry run isort app/
   poetry run pytest --cov=app
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "Add my feature"
   git push origin feature/my-feature
   ```

## API Testing with cURL

### Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "full_name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Access Protected Endpoint

```bash
# Replace <TOKEN> with actual token from login
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <TOKEN>"
```

## Production Deployment

### Build Production Image

```bash
docker build -t quiz-app-backend:latest .
```

### Run in Production

```bash
# Set environment to production
export ENVIRONMENT=production
export DEBUG=False

# Start services
docker-compose -f docker-compose.yml up -d
```

### Health Checks

```bash
# Application health
curl http://localhost:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "app": "Quiz App",
#   "version": "0.1.0",
#   "environment": "production"
# }
```

## Getting Help

- **Documentation**: See [GUIDELINE.md](GUIDELINE.md) for detailed implementation guide
- **Technical Stack**: See [TECHNICAL_STACK.md](TECHNICAL_STACK.md) for stack details
- **API Docs**: Visit http://localhost:8000/docs after starting the app
- **Issues**: Report bugs and issues on GitHub

## What's Next?

Now that your backend is running, you can:

1. ✅ Explore the API documentation at `/docs`
2. ✅ Read the [GUIDELINE.md](GUIDELINE.md) for feature implementation
3. ✅ Check [TECHNICAL_STACK.md](TECHNICAL_STACK.md) to understand the architecture
4. ✅ Start implementing features following the guideline
5. ✅ Build your frontend to consume this API

Happy coding! 🚀
