# Technical Stack Summary

## Backend Framework
- **FastAPI 0.109+**: Modern, fast, async web framework with automatic API documentation
- **Python 3.11+**: Latest Python with performance improvements
- **Uvicorn**: ASGI server for running FastAPI

## Database & ORM
- **PostgreSQL 15+**: Robust relational database
- **SQLAlchemy 2.0+**: Modern Python SQL toolkit and ORM
- **Alembic**: Database migration tool

## Authentication & Security
- **JWT (python-jose)**: JSON Web Tokens for authentication
- **Passlib with bcrypt**: Secure password hashing
- **Pydantic V2**: Data validation and settings management

## Caching & Task Queue
- **Redis 7+**: In-memory cache and message broker
- **Celery**: Distributed task queue for background jobs

## File Storage
- **MinIO**: S3-compatible object storage for images and audio files
- **aiofiles**: Async file operations

## AI & Machine Learning
- **OpenAI API (GPT-4)**: AI-powered learning assistance
  - Word explanations
  - Example generation
  - Mnemonic creation
  - Quiz question generation

## Text-to-Speech
- **Google Cloud TTS**: High-quality text-to-speech for pronunciation

## Data Processing
- **pandas**: Data manipulation for Excel/CSV import/export
- **openpyxl**: Excel file processing
- **xlsxwriter**: Excel file creation

## Image Processing
- **Pillow**: Image manipulation and optimization
- **python-magic**: File type detection

## Development Tools
- **Poetry**: Dependency management and packaging
- **Black**: Code formatting
- **isort**: Import sorting
- **mypy**: Static type checking
- **flake8**: Code linting
- **pytest**: Testing framework
- **pytest-asyncio**: Async testing support
- **pytest-cov**: Code coverage reports

## DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **python-dotenv**: Environment variable management

## API Features
- **Auto-generated OpenAPI documentation** (Swagger UI & ReDoc)
- **CORS middleware** for frontend integration
- **Input validation** with Pydantic
- **Rate limiting** with Redis

## Key Algorithms
- **SM-2 (SuperMemo 2)**: Spaced repetition algorithm for optimal learning
  - Calculates optimal review intervals
  - Adjusts based on user performance
  - Maximizes long-term retention

## Architecture Patterns
- **Repository Pattern**: Business logic separation
- **Dependency Injection**: FastAPI's Depends() system
- **DTO Pattern**: Pydantic schemas for data transfer
- **Factory Pattern**: Creating quiz sessions, achievements
- **Strategy Pattern**: Different spaced repetition algorithms

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention (ORM)
- File upload validation
- Rate limiting
- CORS configuration

## Scalability Features
- Connection pooling for database
- Redis caching for frequently accessed data
- Background task processing with Celery
- Async/await for I/O operations
- Container orchestration with Docker Compose

## Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- Async test support
- Code coverage tracking
- Mocking external services (AI, TTS)

## Monitoring & Logging
- Structured logging
- Error tracking capabilities
- Health check endpoints
- Database query logging in debug mode

## Why This Stack?

### FastAPI
- Automatic API documentation
- High performance (comparable to Node.js)
- Built-in data validation
- Async support out of the box
- Type hints for better IDE support

### PostgreSQL
- ACID compliance for data integrity
- Complex query support
- JSON field support for flexibility
- Robust and battle-tested
- Excellent Python integration

### Redis
- Fast in-memory operations
- Perfect for caching and sessions
- Built-in pub/sub for real-time features
- Celery integration

### MinIO
- S3-compatible (easy migration to AWS)
- Self-hosted option
- Cost-effective for development
- Scalable for production

### Poetry
- Modern dependency management
- Lock file for reproducible builds
- Virtual environment management
- Easy packaging and publishing

### Docker
- Consistent development environment
- Easy deployment
- Service isolation
- Scalability

## Development Workflow

1. **Local Development**
   - Use Docker Compose for services
   - Hot reload with uvicorn --reload
   - Auto-generated API docs at /docs

2. **Database Changes**
   - Create models in app/models/
   - Generate migration: `alembic revision --autogenerate`
   - Apply migration: `alembic upgrade head`

3. **Testing**
   - Write tests in app/tests/
   - Run with pytest
   - Check coverage

4. **Code Quality**
   - Format with Black
   - Sort imports with isort
   - Type check with mypy
   - Lint with flake8

5. **Deployment**
   - Build Docker image
   - Push to container registry
   - Deploy with docker-compose or Kubernetes

## Performance Characteristics

- **API Response Time**: < 100ms for most endpoints
- **Database Queries**: Optimized with indexes and connection pooling
- **File Upload**: Async handling for large files
- **Background Tasks**: Celery for non-blocking operations
- **Caching**: Redis for sub-millisecond lookups

## Cost Considerations

### Development (Free/Low Cost)
- PostgreSQL: Docker container
- Redis: Docker container
- MinIO: Self-hosted
- OpenAI: Pay per token (estimate $5-20/month)
- Google TTS: Free tier available

### Production
- Database: Managed PostgreSQL ($20-100/month)
- Redis: Managed Redis ($10-50/month)
- Storage: S3 or MinIO ($0.02/GB)
- Compute: Container hosting ($10-100/month)
- AI Services: Usage-based pricing

## Future Enhancements

- **GraphQL API**: Alternative to REST
- **WebSocket Support**: Real-time features
- **Elasticsearch**: Full-text search
- **Prometheus + Grafana**: Monitoring
- **Kubernetes**: Production orchestration
- **CDN**: Static file delivery
- **Multi-region**: Global deployment
