# Project Structure

## Directory Overview

```
quiz-app-be/
│
├── 📄 Configuration Files
│   ├── .env.example              Environment variables template
│   ├── .gitignore                Git ignore rules
│   ├── pyproject.toml            Poetry dependencies and project config
│   ├── alembic.ini               Alembic configuration for migrations
│   ├── Dockerfile                Docker image definition
│   └── docker-compose.yml        Multi-container Docker setup
│
├── 📚 Documentation
│   ├── README.md                 Project overview and setup
│   ├── GUIDELINE.md              Detailed implementation guide (MAIN GUIDE)
│   ├── TECHNICAL_STACK.md        Technical stack explanation
│   ├── QUICK_START.md            5-minute quick start guide
│   └── PROJECT_STRUCTURE.md      This file
│
├── 📁 app/                       Main application directory
│   ├── __init__.py
│   ├── main.py                   FastAPI application entry point ✅
│   ├── database.py               Database configuration & session ✅
│   ├── dependencies.py           Dependency injection (auth, etc.) ✅
│   │
│   ├── 🔌 api/                   API endpoints
│   │   └── v1/
│   │       ├── router.py         Main API router ✅
│   │       └── endpoints/        Individual endpoint modules
│   │           ├── auth.py       (To be created) Authentication
│   │           ├── users.py      (To be created) User management
│   │           ├── topics.py     (To be created) Topic CRUD
│   │           ├── flashcards.py (To be created) Flashcard CRUD
│   │           ├── learning.py   (To be created) Learning sessions
│   │           ├── quiz.py       (To be created) Quiz functionality
│   │           ├── achievements.py (To be created) Achievements
│   │           ├── streaks.py    (To be created) Streak tracking
│   │           ├── import_export.py (To be created) Import/Export
│   │           └── ai.py         (To be created) AI assistant
│   │
│   ├── 🗄️  models/                SQLAlchemy ORM models
│   │   ├── __init__.py           ✅
│   │   ├── user.py               (To be created)
│   │   ├── topic.py              (To be created)
│   │   ├── flashcard.py          (To be created)
│   │   ├── learning_session.py   (To be created)
│   │   ├── quiz_session.py       (To be created)
│   │   ├── quiz_answer.py        (To be created)
│   │   ├── achievement.py        (To be created)
│   │   ├── user_achievement.py   (To be created)
│   │   ├── streak.py             (To be created)
│   │   ├── user_goal.py          (To be created)
│   │   └── user_settings.py      (To be created)
│   │
│   ├── 📋 schemas/                Pydantic schemas (request/response)
│   │   ├── __init__.py           ✅
│   │   ├── user.py               (To be created)
│   │   ├── auth.py               (To be created)
│   │   ├── topic.py              (To be created)
│   │   ├── flashcard.py          (To be created)
│   │   ├── quiz.py               (To be created)
│   │   ├── achievement.py        (To be created)
│   │   └── common.py             (To be created)
│   │
│   ├── ⚙️  services/              Business logic layer
│   │   ├── __init__.py           ✅
│   │   ├── auth_service.py       (To be created) Authentication logic
│   │   ├── user_service.py       (To be created) User operations
│   │   ├── topic_service.py      (To be created) Topic operations
│   │   ├── flashcard_service.py  (To be created) Flashcard operations
│   │   ├── spaced_repetition.py  (To be created) SM-2 algorithm
│   │   ├── quiz_service.py       (To be created) Quiz logic
│   │   ├── achievement_service.py (To be created) Achievement tracking
│   │   ├── streak_service.py     (To be created) Streak calculation
│   │   ├── ai_service.py         (To be created) OpenAI integration
│   │   ├── tts_service.py        (To be created) Text-to-Speech
│   │   ├── file_service.py       (To be created) MinIO file upload
│   │   └── import_service.py     (To be created) Excel/CSV import
│   │
│   ├── 🔐 core/                   Core functionality
│   │   ├── __init__.py           ✅
│   │   ├── config.py             Settings from environment ✅
│   │   ├── security.py           JWT & password hashing ✅
│   │   └── exceptions.py         Custom exceptions ✅
│   │
│   ├── 🛠️  utils/                 Utility functions
│   │   ├── __init__.py           ✅
│   │   ├── validators.py         (To be created) Input validators
│   │   └── helpers.py            (To be created) Helper functions
│   │
│   └── 🧪 tests/                  Test suite
│       ├── __init__.py           ✅
│       ├── conftest.py           (To be created) Pytest configuration
│       ├── test_auth.py          (To be created)
│       ├── test_topics.py        (To be created)
│       ├── test_flashcards.py    (To be created)
│       ├── test_learning.py      (To be created)
│       └── test_*.py             (More test files)
│
├── 🔄 alembic/                    Database migrations
│   ├── env.py                    Alembic environment config ✅
│   ├── script.py.mako            Migration template ✅
│   └── versions/                 Migration files (generated)
│
└── 📦 uploads/                    Local file uploads (development)
    └── .gitkeep                  Keep directory in git ✅
```

## Current Status

### ✅ Completed (Phase 1)
- Project structure created
- Poetry configuration
- Docker setup (Postgres, Redis, MinIO, App)
- Core configuration files
- Database configuration
- Authentication utilities (JWT, password hashing)
- Custom exceptions
- API router structure
- Alembic migration setup
- Comprehensive documentation

### 📝 To Be Implemented

#### Phase 2: Core Infrastructure
- User model and authentication endpoints
- Database migrations
- JWT authentication middleware

#### Phase 3: Core Features
- Topic CRUD operations
- Flashcard CRUD operations
- File upload service

#### Phase 4: Learning Features
- Spaced repetition algorithm (SM-2)
- Learning session management
- Quiz system
- Text-to-Speech integration

#### Phase 5: Gamification
- Streak tracking
- Goal management
- Achievement system
- Badge awards

#### Phase 6: Import/Export
- Excel/CSV import service
- Data export functionality

#### Phase 7: AI Integration
- OpenAI API integration
- AI-powered learning assistance
- Example generation
- Mnemonic creation

#### Phase 8: Settings & Theme
- User settings management
- Light/dark mode support

#### Phase 9: Testing
- Unit tests
- Integration tests
- Code coverage

#### Phase 10: Deployment
- Production Docker setup
- Environment configuration
- Monitoring and logging

## Quick Reference

### Key Documentation Files

| File | Purpose |
|------|---------|
| `GUIDELINE.md` | Complete implementation guide with code examples |
| `QUICK_START.md` | Get started in 5 minutes |
| `TECHNICAL_STACK.md` | Technology stack explanation |
| `README.md` | Project overview |
| `PROJECT_STRUCTURE.md` | This file |

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache & task queue |
| MinIO | 9000 | S3-compatible storage |
| MinIO Console | 9001 | Web UI (minioadmin/minioadmin) |
| FastAPI | 8000 | Backend API |
| Swagger Docs | 8000/docs | API documentation |

### Implementation Order

Follow the phases in `GUIDELINE.md`:

1. **Phase 1** ✅ - Project Setup (COMPLETE)
2. **Phase 2** ⏭️ - Core Infrastructure (Next)
   - Create User model
   - Implement authentication endpoints
   - Generate first migration
3. **Phase 3** - Core Features
4. **Phase 4** - Learning Features
5. **Phase 5** - Gamification
6. **Phase 6** - Import/Export
7. **Phase 7** - AI Integration
8. **Phase 8** - Theme & Settings
9. **Phase 9** - Testing
10. **Phase 10** - Deployment

## Next Steps

### 1. Start Services
```bash
docker-compose up -d
```

### 2. Verify Services
```bash
docker-compose ps
```

### 3. Access API Documentation
Visit: http://localhost:8000/docs

### 4. Begin Implementation
Follow the steps in `GUIDELINE.md` starting with Phase 2.

### 5. Create First Model
Start with `app/models/user.py`:
- Define User table
- Add relationships
- Create migration

### 6. Implement Authentication
Create endpoints in `app/api/v1/endpoints/auth.py`:
- POST /register
- POST /login
- POST /refresh

## Common Commands

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Development
```bash
# Install dependencies
poetry install

# Run app locally
poetry run uvicorn app.main:app --reload

# Run tests
poetry run pytest

# Format code
poetry run black app/
poetry run isort app/
```

## Architecture Layers

### 1. API Layer (`app/api/`)
- FastAPI endpoints
- Request/response handling
- Input validation
- Route definitions

### 2. Schema Layer (`app/schemas/`)
- Pydantic models
- Request DTOs
- Response DTOs
- Data validation

### 3. Service Layer (`app/services/`)
- Business logic
- Algorithm implementation
- External API integration
- Complex operations

### 4. Model Layer (`app/models/`)
- SQLAlchemy ORM models
- Database table definitions
- Relationships
- Database constraints

### 5. Core Layer (`app/core/`)
- Configuration
- Security utilities
- Common exceptions
- Middleware

## File Naming Conventions

- **Models**: `snake_case.py` (e.g., `user_settings.py`)
- **Schemas**: Match model name (e.g., `user.py`)
- **Services**: `*_service.py` (e.g., `auth_service.py`)
- **Endpoints**: Plural nouns (e.g., `users.py`, `topics.py`)
- **Tests**: `test_*.py` (e.g., `test_auth.py`)

## Code Style

- **Formatter**: Black (line length: 100)
- **Import Sorter**: isort
- **Type Checker**: mypy
- **Linter**: flake8

## Environment Variables

Copy `.env.example` to `.env` and update:

### Required
- `DATABASE_URL` - PostgreSQL connection
- `SECRET_KEY` - JWT secret (change in production!)
- `REDIS_URL` - Redis connection

### Optional (for full features)
- `OPENAI_API_KEY` - AI assistance
- `GOOGLE_APPLICATION_CREDENTIALS` - Text-to-Speech
- `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` - File storage

## Support

- **Detailed Guide**: See `GUIDELINE.md`
- **Quick Start**: See `QUICK_START.md`
- **Tech Stack**: See `TECHNICAL_STACK.md`
- **Issues**: Create a GitHub issue

Good luck with your implementation! 🚀
