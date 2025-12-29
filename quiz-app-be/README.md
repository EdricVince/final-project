# Quiz App Backend

A comprehensive quiz and flashcard learning application built with FastAPI, featuring spaced repetition, AI-powered learning assistance, gamification, and more.

## Features

- **Authentication**: Manual sign in/sign up with JWT
- **Flash Cards**: Learning mode with spaced repetition algorithm (SM-2)
- **Quiz System**: Interactive quizzes with multiple question types
- **Audio Support**: Text-to-speech for vocabulary pronunciation
- **CRUD Operations**: Full management of topics and flashcards
- **Import/Export**: Excel and CSV file support
- **Image Upload**: Visual aids for better memorization
- **Gamification**: Streaks, goals, achievements, and badges
- **Spaced Repetition**: Smart learning algorithm for optimal retention
- **Theme Support**: Light/dark mode
- **AI Assistant**: OpenAI-powered learning support

## Tech Stack

- **Framework**: FastAPI 0.109+
- **Language**: Python 3.11+
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+
- **Cache**: Redis 7+
- **Storage**: MinIO (S3-compatible)
- **Task Queue**: Celery
- **AI**: OpenAI GPT-4
- **TTS**: Google Cloud Text-to-Speech
- **Dependency Management**: Poetry
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Python 3.11+
- Poetry
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd quiz-app-be
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configurations
nano .env
```

### 3. Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

The API will be available at `http://localhost:8000`

### 4. Local Development (Without Docker)

```bash
# Install dependencies
poetry install

# Activate virtual environment
poetry shell

# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis minio

# Run database migrations
alembic upgrade head

# Start the application
uvicorn app.main:app --reload
```

## API Documentation

Once the application is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Project Structure

```
quiz-app-be/
├── app/
│   ├── api/                    # API endpoints
│   │   └── v1/
│   │       ├── endpoints/      # Route handlers
│   │       └── router.py
│   ├── core/                   # Core functionality
│   │   ├── config.py
│   │   ├── security.py
│   │   └── exceptions.py
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business logic
│   ├── utils/                  # Utilities
│   ├── database.py             # Database configuration
│   ├── dependencies.py         # Dependency injection
│   └── main.py                 # Application entry point
├── alembic/                    # Database migrations
├── uploads/                    # File uploads
├── .env.example                # Environment template
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Docker image
├── pyproject.toml              # Poetry dependencies
├── GUIDELINE.md                # Implementation guide
└── README.md                   # This file
```

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_auth.py

# Run with verbose output
pytest -v
```

## Code Quality

```bash
# Format code with Black
black app/

# Sort imports with isort
isort app/

# Type checking with mypy
mypy app/

# Linting with flake8
flake8 app/
```

## Development Workflow

1. Create a new branch for your feature
2. Make changes and write tests
3. Run tests and code quality checks
4. Create a pull request

## Key Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Topics
- `POST /api/v1/topics` - Create topic
- `GET /api/v1/topics` - List topics
- `GET /api/v1/topics/{id}` - Get topic
- `PUT /api/v1/topics/{id}` - Update topic
- `DELETE /api/v1/topics/{id}` - Delete topic

### Flashcards
- `POST /api/v1/topics/{topic_id}/flashcards` - Create flashcard
- `GET /api/v1/topics/{topic_id}/flashcards` - List flashcards
- `PUT /api/v1/flashcards/{id}` - Update flashcard
- `DELETE /api/v1/flashcards/{id}` - Delete flashcard

### Learning
- `GET /api/v1/learning/due` - Get due flashcards
- `POST /api/v1/learning/{flashcard_id}/review` - Submit review

### Quiz
- `POST /api/v1/quiz/start` - Start quiz
- `POST /api/v1/quiz/{session_id}/answer` - Submit answer
- `GET /api/v1/quiz/{session_id}/results` - Get results

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key
- `MINIO_ACCESS_KEY` - MinIO access key

## Deployment

### Production Build

```bash
# Build production image
docker build -t quiz-app-backend:latest .

# Run with production compose
docker-compose -f docker-compose.yml up -d
```

### Health Checks

- Application health: `GET /health`
- Database health: `GET /health/db`

## Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres
```

### Redis connection issues
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### MinIO access issues
```bash
# Access MinIO console
http://localhost:9001

# Default credentials (change in .env)
# Username: minioadmin
# Password: minioadmin
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For detailed implementation guide, see [GUIDELINE.md](GUIDELINE.md)

For issues and questions, please open a GitHub issue.

## Roadmap

- [ ] Mobile app (React Native/Flutter)
- [ ] Social features (leaderboards, study groups)
- [ ] Video support for flashcards
- [ ] Voice recognition for pronunciation
- [ ] Offline mode
- [ ] Progressive Web App (PWA)
- [ ] Multi-language support
- [ ] Analytics dashboard

## Acknowledgments

- FastAPI framework
- SQLAlchemy ORM
- OpenAI API
- Google Cloud TTS
- SuperMemo SM-2 algorithm
