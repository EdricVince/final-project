# Quiz App Implementation Guideline

## Table of Contents
1. [Technical Stack](#technical-stack)
2. [Project Architecture](#project-architecture)
3. [Database Schema](#database-schema)
4. [Implementation Steps](#implementation-steps)
5. [Feature Implementation Guide](#feature-implementation-guide)
6. [Deployment](#deployment)

---

## Technical Stack

### Backend
- **Framework**: FastAPI (Modern, async, auto-documentation)
- **Language**: Python 3.11+
- **Dependency Management**: Poetry
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+ with Alembic for migrations
- **Authentication**: JWT (python-jose) + passlib for password hashing
- **Validation**: Pydantic V2
- **Testing**: Pytest + pytest-asyncio

### Storage & Cache
- **File Storage**: MinIO (S3-compatible) for images/audio files
- **Cache**: Redis for sessions, rate limiting, and caching
- **Task Queue**: Celery + Redis for background tasks

### AI & Services
- **AI Assistant**: OpenAI API (GPT-4) or Google Gemini
- **Text-to-Speech**: Google Cloud TTS or ElevenLabs API
- **File Processing**: pandas (Excel/CSV), openpyxl, python-multipart

### DevOps
- **Containerization**: Docker & Docker Compose
- **Environment**: python-dotenv
- **API Documentation**: Auto-generated via FastAPI (Swagger UI)
- **CORS**: FastAPI middleware

---

## Project Architecture

### Directory Structure
```
quiz-app-be/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── database.py                # Database connection and session
│   ├── dependencies.py            # Dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py          # Main API router
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── auth.py        # Sign in, Sign up
│   │           ├── users.py       # User profile, preferences
│   │           ├── topics.py      # CRUD topics
│   │           ├── flashcards.py  # CRUD flashcards
│   │           ├── learning.py    # Learning session, spaced repetition
│   │           ├── quiz.py        # Quiz sessions
│   │           ├── achievements.py # Badges, achievements
│   │           ├── streaks.py     # Streak tracking, goals
│   │           ├── import_export.py # Excel/CSV import
│   │           └── ai.py          # AI learning support
│   │
│   ├── models/                    # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── topic.py
│   │   ├── flashcard.py
│   │   ├── learning_session.py
│   │   ├── quiz_session.py
│   │   ├── achievement.py
│   │   ├── user_achievement.py
│   │   ├── streak.py
│   │   └── user_settings.py
│   │
│   ├── schemas/                   # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── topic.py
│   │   ├── flashcard.py
│   │   ├── quiz.py
│   │   ├── achievement.py
│   │   └── common.py
│   │
│   ├── services/                  # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── topic_service.py
│   │   ├── flashcard_service.py
│   │   ├── spaced_repetition.py   # SM-2 or FSRS algorithm
│   │   ├── quiz_service.py
│   │   ├── achievement_service.py
│   │   ├── streak_service.py
│   │   ├── ai_service.py          # OpenAI/Gemini integration
│   │   ├── tts_service.py         # Text-to-Speech
│   │   ├── file_service.py        # MinIO file upload
│   │   └── import_service.py      # Excel/CSV import
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Settings from environment
│   │   ├── security.py            # JWT, password hashing
│   │   └── exceptions.py          # Custom exceptions
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   └── helpers.py
│   │
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_topics.py
│       └── ...
│
├── alembic/                       # Database migrations
│   ├── versions/
│   └── env.py
│
├── uploads/                       # Local file storage (development)
├── .env.example
├── .gitignore
├── pyproject.toml                 # Poetry dependencies
├── Dockerfile
├── docker-compose.yml
├── README.md
└── GUIDELINE.md (this file)
```

### Design Patterns
- **Repository Pattern**: Services layer handles business logic
- **Dependency Injection**: FastAPI's Depends() for database sessions, auth
- **DTO Pattern**: Pydantic schemas for data validation
- **Factory Pattern**: For creating quiz sessions, achievements
- **Strategy Pattern**: For different spaced repetition algorithms

---

## Database Schema

### Core Tables

#### users
```sql
id                UUID PRIMARY KEY
email             VARCHAR(255) UNIQUE NOT NULL
username          VARCHAR(100) UNIQUE NOT NULL
hashed_password   VARCHAR(255) NOT NULL
full_name         VARCHAR(255)
is_active         BOOLEAN DEFAULT TRUE
is_verified       BOOLEAN DEFAULT FALSE
theme_mode        VARCHAR(10) DEFAULT 'light'  -- 'light' or 'dark'
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### topics
```sql
id                UUID PRIMARY KEY
user_id           UUID FOREIGN KEY -> users(id)
name              VARCHAR(255) NOT NULL
description       TEXT
image_url         VARCHAR(500)
is_public         BOOLEAN DEFAULT FALSE
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### flashcards
```sql
id                UUID PRIMARY KEY
topic_id          UUID FOREIGN KEY -> topics(id)
front_text        TEXT NOT NULL              -- Word/Question
back_text         TEXT NOT NULL              -- Definition/Answer
front_image_url   VARCHAR(500)
back_image_url    VARCHAR(500)
audio_url         VARCHAR(500)               -- TTS generated or uploaded
example_sentence  TEXT
pronunciation     VARCHAR(255)
difficulty_level  INTEGER DEFAULT 1
order_index       INTEGER
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### learning_sessions
```sql
id                UUID PRIMARY KEY
user_id           UUID FOREIGN KEY -> users(id)
flashcard_id      UUID FOREIGN KEY -> flashcards(id)
ease_factor       FLOAT DEFAULT 2.5          -- For SM-2 algorithm
interval_days     INTEGER DEFAULT 0          -- Days until next review
repetitions       INTEGER DEFAULT 0          -- Number of successful reviews
next_review_date  DATE                       -- When to show next
last_reviewed_at  TIMESTAMP
quality_rating    INTEGER                    -- 0-5 (user's response quality)
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### quiz_sessions
```sql
id                UUID PRIMARY KEY
user_id           UUID FOREIGN KEY -> users(id)
topic_id          UUID FOREIGN KEY -> topics(id)
total_questions   INTEGER
correct_answers   INTEGER
score_percentage  FLOAT
duration_seconds  INTEGER
completed_at      TIMESTAMP
created_at        TIMESTAMP
```

#### quiz_answers
```sql
id                UUID PRIMARY KEY
quiz_session_id   UUID FOREIGN KEY -> quiz_sessions(id)
flashcard_id      UUID FOREIGN KEY -> flashcards(id)
user_answer       TEXT
is_correct        BOOLEAN
time_taken_seconds INTEGER
answered_at       TIMESTAMP
```

#### streaks
```sql
id                UUID PRIMARY KEY
user_id           UUID FOREIGN KEY -> users(id)
current_streak    INTEGER DEFAULT 0
longest_streak    INTEGER DEFAULT 0
last_activity_date DATE
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### user_goals
```sql
id                UUID PRIMARY KEY
user_id           UUID FOREIGN KEY -> users(id)
goal_type         VARCHAR(50)                -- 'daily_cards', 'daily_minutes', etc.
target_value      INTEGER
current_value     INTEGER DEFAULT 0
period            VARCHAR(20)                -- 'daily', 'weekly', 'monthly'
start_date        DATE
end_date          DATE
is_active         BOOLEAN DEFAULT TRUE
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### achievements
```sql
id                UUID PRIMARY KEY
name              VARCHAR(255) NOT NULL
description       TEXT
badge_icon_url    VARCHAR(500)
criteria_type     VARCHAR(50)                -- 'streak', 'cards_learned', 'quiz_score'
criteria_value    INTEGER
tier              VARCHAR(20)                -- 'bronze', 'silver', 'gold', 'platinum'
created_at        TIMESTAMP
```

#### user_achievements
```sql
id                UUID PRIMARY KEY
user_id           UUID FOREIGN KEY -> users(id)
achievement_id    UUID FOREIGN KEY -> achievements(id)
earned_at         TIMESTAMP
progress          INTEGER DEFAULT 0          -- For tracking progress toward achievement
```

#### user_settings
```sql
id                UUID PRIMARY KEY
user_id           UUID FOREIGN KEY -> users(id) UNIQUE
theme_mode        VARCHAR(10) DEFAULT 'light'
daily_goal        INTEGER DEFAULT 10
notifications_enabled BOOLEAN DEFAULT TRUE
auto_play_audio   BOOLEAN DEFAULT TRUE
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

---

## Implementation Steps

### Phase 1: Project Setup (Week 1)

#### Step 1.1: Initialize Project
```bash
# Create project directory (already exists)
cd quiz-app-be

# Initialize Poetry
poetry init

# Install core dependencies
poetry add fastapi uvicorn[standard] sqlalchemy alembic psycopg2-binary
poetry add pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt]
poetry add python-multipart aiofiles redis celery
poetry add pandas openpyxl python-dotenv

# Install dev dependencies
poetry add --group dev pytest pytest-asyncio httpx black isort mypy
```

#### Step 1.2: Create Docker Setup
Create `docker-compose.yml` with services:
- PostgreSQL
- Redis
- MinIO (S3-compatible storage)
- FastAPI app

#### Step 1.3: Setup Environment Variables
Create `.env` file with:
- Database credentials
- JWT secret key
- API keys (OpenAI, TTS)
- MinIO credentials
- Redis URL

### Phase 2: Core Infrastructure (Week 1-2)

#### Step 2.1: Database Setup
1. Create `app/database.py` with SQLAlchemy engine and session
2. Initialize Alembic for migrations
3. Create base models in `app/models/`

#### Step 2.2: Authentication System
1. Implement JWT token generation in `app/core/security.py`
2. Create password hashing utilities
3. Build auth endpoints in `app/api/v1/endpoints/auth.py`:
   - `POST /api/v1/auth/register`
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/refresh`
   - `POST /api/v1/auth/logout`

#### Step 2.3: User Management
1. Create User model and schemas
2. Implement user CRUD operations
3. Add user profile endpoints:
   - `GET /api/v1/users/me`
   - `PUT /api/v1/users/me`
   - `PUT /api/v1/users/me/settings`

### Phase 3: Core Features (Week 2-3)

#### Step 3.1: Topic Management
1. Create Topic model and schemas
2. Implement CRUD endpoints:
   - `POST /api/v1/topics` - Create topic
   - `GET /api/v1/topics` - List topics (with pagination)
   - `GET /api/v1/topics/{id}` - Get topic details
   - `PUT /api/v1/topics/{id}` - Update topic
   - `DELETE /api/v1/topics/{id}` - Delete topic

#### Step 3.2: Flashcard Management
1. Create Flashcard model and schemas
2. Implement CRUD endpoints:
   - `POST /api/v1/topics/{topic_id}/flashcards` - Create flashcard
   - `GET /api/v1/topics/{topic_id}/flashcards` - List flashcards
   - `GET /api/v1/flashcards/{id}` - Get flashcard
   - `PUT /api/v1/flashcards/{id}` - Update flashcard
   - `DELETE /api/v1/flashcards/{id}` - Delete flashcard

#### Step 3.3: File Upload (Images & Audio)
1. Setup MinIO client in `app/services/file_service.py`
2. Create upload endpoints:
   - `POST /api/v1/upload/image` - Upload flashcard image
   - `POST /api/v1/upload/audio` - Upload audio file
3. Generate signed URLs for file access
4. Implement file validation (size, type)

### Phase 4: Learning Features (Week 3-4)

#### Step 4.1: Text-to-Speech Integration
1. Implement TTS service in `app/services/tts_service.py`
2. Create endpoint:
   - `POST /api/v1/flashcards/{id}/generate-audio` - Generate audio from text
3. Store audio files in MinIO
4. Return audio URL in flashcard response

#### Step 4.2: Spaced Repetition Algorithm
1. Implement SM-2 algorithm in `app/services/spaced_repetition.py`
2. Create LearningSession model
3. Build learning endpoints:
   - `GET /api/v1/learning/due` - Get due flashcards
   - `POST /api/v1/learning/{flashcard_id}/review` - Submit review
   - `GET /api/v1/learning/stats` - Get learning statistics

**SM-2 Algorithm Basics:**
```python
# After user rates difficulty (0-5):
# - 0-1: Again (restart)
# - 2: Hard (reduce ease)
# - 3: Good (normal)
# - 4-5: Easy (increase ease)

if quality < 3:
    repetitions = 0
    interval = 0
else:
    if repetitions == 0:
        interval = 1
    elif repetitions == 1:
        interval = 6
    else:
        interval = previous_interval * ease_factor

    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease_factor = max(1.3, ease_factor)
    repetitions += 1

next_review = today + interval_days
```

#### Step 4.3: Quiz System
1. Create QuizSession and QuizAnswer models
2. Implement quiz logic in `app/services/quiz_service.py`
3. Build quiz endpoints:
   - `POST /api/v1/quiz/start` - Start quiz session
   - `POST /api/v1/quiz/{session_id}/answer` - Submit answer
   - `GET /api/v1/quiz/{session_id}/results` - Get results
   - `GET /api/v1/quiz/history` - Quiz history

### Phase 5: Gamification (Week 4-5)

#### Step 5.1: Streak System
1. Create Streak model
2. Implement streak calculation in `app/services/streak_service.py`
3. Update streak on daily activity
4. Build endpoints:
   - `GET /api/v1/streaks/current` - Get current streak
   - `GET /api/v1/streaks/history` - Streak history

#### Step 5.2: Goals System
1. Create UserGoal model
2. Implement goal tracking
3. Build endpoints:
   - `POST /api/v1/goals` - Create goal
   - `GET /api/v1/goals` - List goals
   - `GET /api/v1/goals/{id}/progress` - Goal progress
   - `PUT /api/v1/goals/{id}` - Update goal

#### Step 5.3: Achievement & Badge System
1. Create Achievement and UserAchievement models
2. Define achievement criteria
3. Implement achievement checker (Celery task)
4. Build endpoints:
   - `GET /api/v1/achievements` - List all achievements
   - `GET /api/v1/achievements/earned` - User's earned achievements
   - `GET /api/v1/achievements/{id}/progress` - Achievement progress

**Achievement Examples:**
- First Steps: Complete first flashcard
- Dedicated Learner: 7-day streak
- Speed Demon: Complete 50 cards in one day
- Perfectionist: Score 100% on a quiz
- Polyglot: Learn 1000 words

### Phase 6: Import/Export (Week 5)

#### Step 6.1: Excel/CSV Import
1. Implement import service in `app/services/import_service.py`
2. Parse Excel/CSV files with pandas
3. Validate data format
4. Bulk insert flashcards
5. Build endpoint:
   - `POST /api/v1/import/flashcards` - Upload Excel/CSV

**Expected Format:**
```csv
front,back,example,pronunciation,image_url,audio_url
hello,xin chào,"Hello, how are you?",/həˈloʊ/,https://...,https://...
```

#### Step 6.2: Export Functionality
1. Generate Excel/CSV from flashcards
2. Build endpoint:
   - `GET /api/v1/topics/{id}/export` - Export as Excel/CSV

### Phase 7: AI Integration (Week 6)

#### Step 7.1: AI Learning Assistant
1. Implement OpenAI/Gemini integration in `app/services/ai_service.py`
2. Features:
   - Generate example sentences
   - Explain word meanings
   - Quiz question generation
   - Pronunciation tips
   - Mnemonic suggestions
3. Build endpoints:
   - `POST /api/v1/ai/explain` - Explain a word/concept
   - `POST /api/v1/ai/examples` - Generate example sentences
   - `POST /api/v1/ai/quiz-questions` - Generate quiz questions
   - `POST /api/v1/ai/mnemonics` - Get memory techniques

**Example AI Prompts:**
```python
# Explain word
f"Explain the word '{word}' in simple terms with examples."

# Generate examples
f"Generate 3 example sentences using the word '{word}' in different contexts."

# Mnemonics
f"Create a memorable mnemonic or story to remember '{word}' means '{definition}'."
```

### Phase 8: Theme & Settings (Week 6)

#### Step 8.1: User Settings
1. Update UserSettings model
2. Implement theme toggle (light/dark)
3. Store preferences in database
4. Build endpoints:
   - `GET /api/v1/settings` - Get user settings
   - `PUT /api/v1/settings` - Update settings
   - `PUT /api/v1/settings/theme` - Toggle theme

### Phase 9: Testing & Optimization (Week 7)

#### Step 9.1: Unit Tests
1. Test authentication flows
2. Test CRUD operations
3. Test spaced repetition algorithm
4. Test import/export functionality

#### Step 9.2: Integration Tests
1. Test complete learning flow
2. Test quiz session flow
3. Test achievement unlocking

#### Step 9.3: Performance Optimization
1. Add database indexes
2. Implement Redis caching for frequently accessed data
3. Optimize query performance
4. Add pagination to all list endpoints

### Phase 10: Deployment (Week 8)

#### Step 10.1: Production Setup
1. Configure production environment variables
2. Setup PostgreSQL with persistent volume
3. Setup Redis cluster
4. Configure MinIO/S3 for production
5. Setup reverse proxy (Nginx)

#### Step 10.2: Docker Production Build
1. Multi-stage Dockerfile for optimization
2. Docker Compose for orchestration
3. Health checks for all services

---

## Feature Implementation Guide

### 1. Manual Sign In / Sign Up

**Files:**
- `app/api/v1/endpoints/auth.py`
- `app/services/auth_service.py`
- `app/core/security.py`

**Implementation:**
```python
# app/core/security.py
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

**Endpoints:**
- `POST /api/v1/auth/register` - Create new user
- `POST /api/v1/auth/login` - Login with email/password, return JWT token
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Invalidate token (using Redis blacklist)

### 2. Flash Card for Learning Vocabulary

**Files:**
- `app/api/v1/endpoints/learning.py`
- `app/services/spaced_repetition.py`

**Features:**
- Display flashcard with front/back
- Show image if available
- Play audio automatically (if enabled in settings)
- Swipe or button to flip card
- Rate difficulty (Again, Hard, Good, Easy)
- Track progress with spaced repetition

**Endpoints:**
- `GET /api/v1/learning/due` - Get flashcards due for review
- `POST /api/v1/learning/sessions` - Start learning session
- `POST /api/v1/learning/{flashcard_id}/review` - Submit review rating
- `GET /api/v1/learning/stats` - Get learning statistics

### 3. Flash Card for Quiz Vocabulary

**Files:**
- `app/api/v1/endpoints/quiz.py`
- `app/services/quiz_service.py`

**Quiz Types:**
- Multiple choice (4 options)
- Type the answer
- Match pairs
- Audio recognition (hear word, type answer)

**Endpoints:**
- `POST /api/v1/quiz/start` - Start quiz (specify topic, question count)
- `GET /api/v1/quiz/{session_id}/next` - Get next question
- `POST /api/v1/quiz/{session_id}/answer` - Submit answer
- `POST /api/v1/quiz/{session_id}/complete` - Complete quiz
- `GET /api/v1/quiz/{session_id}/results` - Get quiz results

### 4. Audio Playback on Flashcard

**Files:**
- `app/services/tts_service.py`
- `app/services/file_service.py`

**Implementation:**
```python
# app/services/tts_service.py
from google.cloud import texttospeech
import os

class TTSService:
    def __init__(self):
        self.client = texttospeech.TextToSpeechClient()

    async def generate_audio(self, text: str, language_code: str = "en-US"):
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        return response.audio_content
```

**Endpoints:**
- `POST /api/v1/flashcards/{id}/generate-audio` - Generate TTS audio
- `GET /api/v1/flashcards/{id}/audio` - Get audio URL

### 5. CRUD Topic

**Files:**
- `app/api/v1/endpoints/topics.py`
- `app/services/topic_service.py`

**Features:**
- Create topic with name, description, image
- List topics (user's own + public topics)
- Update topic
- Delete topic (cascade delete flashcards)
- Search topics
- Filter by public/private

**Endpoints:**
- `POST /api/v1/topics`
- `GET /api/v1/topics` (with pagination, search, filters)
- `GET /api/v1/topics/{id}`
- `PUT /api/v1/topics/{id}`
- `DELETE /api/v1/topics/{id}`
- `GET /api/v1/topics/public` - Browse public topics

### 6. CRUD Flashcard in Topic

**Files:**
- `app/api/v1/endpoints/flashcards.py`
- `app/services/flashcard_service.py`

**Features:**
- Create flashcard with front, back, images, audio
- Bulk create flashcards
- Update flashcard
- Delete flashcard
- Reorder flashcards
- Add tags/categories

**Endpoints:**
- `POST /api/v1/topics/{topic_id}/flashcards`
- `POST /api/v1/topics/{topic_id}/flashcards/bulk` - Bulk create
- `GET /api/v1/topics/{topic_id}/flashcards`
- `GET /api/v1/flashcards/{id}`
- `PUT /api/v1/flashcards/{id}`
- `DELETE /api/v1/flashcards/{id}`
- `PUT /api/v1/flashcards/{id}/order` - Reorder

### 7. Import Excel, CSV

**Files:**
- `app/api/v1/endpoints/import_export.py`
- `app/services/import_service.py`

**Implementation:**
```python
# app/services/import_service.py
import pandas as pd
from typing import List

class ImportService:
    async def import_from_excel(self, file_path: str, topic_id: str):
        df = pd.read_excel(file_path)
        # Expected columns: front, back, example, pronunciation, etc.
        flashcards = []

        for _, row in df.iterrows():
            flashcard = {
                "topic_id": topic_id,
                "front_text": row.get("front"),
                "back_text": row.get("back"),
                "example_sentence": row.get("example"),
                "pronunciation": row.get("pronunciation"),
                # ... more fields
            }
            flashcards.append(flashcard)

        # Bulk insert
        await self.flashcard_service.bulk_create(flashcards)
        return len(flashcards)
```

**Supported Formats:**
- Excel (.xlsx, .xls)
- CSV (.csv)

**Required Columns:**
- front (required)
- back (required)
- example (optional)
- pronunciation (optional)
- image_url (optional)
- audio_url (optional)

**Endpoints:**
- `POST /api/v1/import/flashcards` - Upload file and topic_id
- `GET /api/v1/import/template` - Download template file
- `POST /api/v1/topics/{id}/export` - Export topic to Excel/CSV

### 8. Upload Image on Flashcard

**Files:**
- `app/services/file_service.py`
- `app/api/v1/endpoints/upload.py`

**Implementation:**
```python
# app/services/file_service.py
from minio import Minio
from fastapi import UploadFile

class FileService:
    def __init__(self):
        self.client = Minio(
            MINIO_URL,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=False
        )

    async def upload_image(self, file: UploadFile, user_id: str):
        # Validate file type
        if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
            raise ValueError("Invalid file type")

        # Generate unique filename
        filename = f"{user_id}/{uuid.uuid4()}.{file.filename.split('.')[-1]}"

        # Upload to MinIO
        self.client.put_object(
            bucket_name="flashcards",
            object_name=filename,
            data=file.file,
            length=file.size,
            content_type=file.content_type
        )

        # Return public URL
        return f"{MINIO_PUBLIC_URL}/flashcards/{filename}"
```

**Features:**
- Image validation (type, size)
- Resize/optimize images
- Generate thumbnails
- Store in MinIO/S3
- Return CDN URL

**Endpoints:**
- `POST /api/v1/upload/image` - Upload image, return URL
- `DELETE /api/v1/upload/image` - Delete image

### 9. Streak and Goal

**Files:**
- `app/api/v1/endpoints/streaks.py`
- `app/services/streak_service.py`

**Streak Logic:**
```python
async def update_streak(user_id: str):
    streak = await get_user_streak(user_id)
    today = date.today()
    last_activity = streak.last_activity_date

    if last_activity == today:
        return  # Already updated today

    if last_activity == today - timedelta(days=1):
        # Continue streak
        streak.current_streak += 1
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
    elif last_activity < today - timedelta(days=1):
        # Streak broken
        streak.current_streak = 1

    streak.last_activity_date = today
    await save_streak(streak)
```

**Goal Types:**
- Daily cards reviewed
- Daily quiz attempts
- Weekly study time
- Monthly mastery rate

**Endpoints:**
- `GET /api/v1/streaks/current`
- `GET /api/v1/streaks/history`
- `POST /api/v1/goals` - Create goal
- `GET /api/v1/goals` - List goals
- `GET /api/v1/goals/{id}/progress`
- `PUT /api/v1/goals/{id}` - Update goal
- `DELETE /api/v1/goals/{id}`

### 10. Achievement & Badge

**Files:**
- `app/api/v1/endpoints/achievements.py`
- `app/services/achievement_service.py`

**Achievement Examples:**
```python
achievements = [
    {
        "name": "First Steps",
        "description": "Complete your first flashcard review",
        "criteria_type": "cards_reviewed",
        "criteria_value": 1,
        "tier": "bronze"
    },
    {
        "name": "Week Warrior",
        "description": "Maintain a 7-day streak",
        "criteria_type": "streak_days",
        "criteria_value": 7,
        "tier": "silver"
    },
    {
        "name": "Centurion",
        "description": "Review 100 flashcards",
        "criteria_type": "cards_reviewed",
        "criteria_value": 100,
        "tier": "gold"
    },
    {
        "name": "Perfect Score",
        "description": "Score 100% on a quiz with 10+ questions",
        "criteria_type": "quiz_perfect",
        "criteria_value": 10,
        "tier": "platinum"
    }
]
```

**Achievement Checker (Celery Task):**
```python
# Run after each learning session
@celery.task
async def check_achievements(user_id: str):
    user_stats = await get_user_stats(user_id)
    pending_achievements = await get_pending_achievements(user_id)

    for achievement in pending_achievements:
        if meets_criteria(user_stats, achievement):
            await award_achievement(user_id, achievement.id)
            # Send notification to user
```

**Endpoints:**
- `GET /api/v1/achievements` - All available achievements
- `GET /api/v1/achievements/earned` - User's earned achievements
- `GET /api/v1/achievements/{id}/progress` - Progress toward achievement

### 11. Spaced Repetition

**Algorithm: SM-2 (SuperMemo 2)**

**Files:**
- `app/services/spaced_repetition.py`

**Implementation:**
```python
class SpacedRepetitionService:
    async def calculate_next_review(
        self,
        flashcard_id: str,
        user_id: str,
        quality: int  # 0-5 rating
    ):
        session = await get_learning_session(flashcard_id, user_id)

        if quality < 3:
            # Failed - reset
            session.repetitions = 0
            session.interval_days = 0
        else:
            # Calculate new interval
            if session.repetitions == 0:
                session.interval_days = 1
            elif session.repetitions == 1:
                session.interval_days = 6
            else:
                session.interval_days = int(
                    session.interval_days * session.ease_factor
                )

            # Update ease factor
            session.ease_factor = session.ease_factor + (
                0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
            )
            session.ease_factor = max(1.3, session.ease_factor)
            session.repetitions += 1

        # Set next review date
        session.next_review_date = date.today() + timedelta(
            days=session.interval_days
        )
        session.last_reviewed_at = datetime.utcnow()
        session.quality_rating = quality

        await save_session(session)
        return session
```

**Quality Ratings:**
- 0: Complete blackout
- 1: Incorrect response, but remembered upon seeing answer
- 2: Incorrect response, but seemed familiar
- 3: Correct response, but difficult to recall
- 4: Correct response, with some hesitation
- 5: Perfect response, immediate recall

### 12. Light/Dark Mode

**Files:**
- `app/models/user_settings.py`
- `app/api/v1/endpoints/settings.py`

**Implementation:**
```python
# Store preference in database
class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID, ForeignKey("users.id"), unique=True)
    theme_mode = Column(String(10), default="light")  # 'light' or 'dark'
```

**Endpoints:**
- `GET /api/v1/settings` - Get user settings
- `PUT /api/v1/settings/theme` - Update theme mode

**Frontend Integration:**
- Store theme preference in localStorage
- Apply CSS classes based on theme
- Sync with backend on login

### 13. AI Support for Learning

**Files:**
- `app/services/ai_service.py`
- `app/api/v1/endpoints/ai.py`

**Implementation:**
```python
# app/services/ai_service.py
from openai import AsyncOpenAI

class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=OPENAI_API_KEY)

    async def explain_word(self, word: str, context: str = None):
        prompt = f"Explain the word '{word}' in simple terms with examples."
        if context:
            prompt += f" Context: {context}"

        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful language tutor."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200
        )
        return response.choices[0].message.content

    async def generate_examples(self, word: str, count: int = 3):
        prompt = f"Generate {count} example sentences using '{word}'."
        # ... similar implementation

    async def create_mnemonic(self, word: str, definition: str):
        prompt = f"Create a memorable mnemonic to remember: '{word}' means '{definition}'"
        # ... similar implementation

    async def generate_quiz_questions(self, flashcards: List[dict], count: int):
        # Generate diverse quiz questions
        pass
```

**AI Features:**
1. **Word Explanation**: Simple definitions with examples
2. **Example Sentences**: Context-based usage
3. **Mnemonics**: Memory aids and stories
4. **Quiz Generation**: Auto-generate quiz questions
5. **Pronunciation Help**: IPA and pronunciation tips
6. **Related Words**: Synonyms, antonyms, related terms
7. **Cultural Context**: Usage in different contexts
8. **Study Tips**: Personalized learning suggestions

**Endpoints:**
- `POST /api/v1/ai/explain` - Explain word/concept
- `POST /api/v1/ai/examples` - Generate example sentences
- `POST /api/v1/ai/mnemonics` - Get memory techniques
- `POST /api/v1/ai/quiz-questions` - Generate quiz questions
- `POST /api/v1/ai/suggestions` - Get personalized study suggestions
- `POST /api/v1/ai/chat` - General AI tutor chat

---

## API Documentation

FastAPI auto-generates OpenAPI documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

---

## Testing Strategy

### Unit Tests
```python
# tests/test_spaced_repetition.py
import pytest
from app.services.spaced_repetition import SpacedRepetitionService

@pytest.mark.asyncio
async def test_first_review():
    service = SpacedRepetitionService()
    session = await service.calculate_next_review(
        flashcard_id="test",
        user_id="test",
        quality=4
    )
    assert session.interval_days == 1
    assert session.repetitions == 1
```

### Integration Tests
```python
# tests/test_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_topic():
    response = client.post(
        "/api/v1/topics",
        json={"name": "Test Topic", "description": "Test"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
```

---

## Deployment

### Docker Production Build

**Dockerfile:**
```dockerfile
FROM python:3.11-slim as builder

WORKDIR /app
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

FROM python:3.11-slim

WORKDIR /app
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: quiz_app
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    restart: always

  app:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
      - minio
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/quiz_app
      REDIS_URL: redis://redis:6379
      MINIO_URL: minio:9000
    restart: always

  celery:
    build: .
    command: celery -A app.celery_app worker --loglevel=info
    depends_on:
      - redis
      - postgres
    restart: always

volumes:
  postgres_data:
  minio_data:
```

### Environment Variables (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_app

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://localhost:6379

# MinIO
MINIO_URL=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_PUBLIC_URL=http://localhost:9000

# OpenAI
OPENAI_API_KEY=sk-...

# Google Cloud TTS
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# App Settings
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=https://yourfrontend.com
```

---

## Performance Optimization

### 1. Database Indexing
```sql
CREATE INDEX idx_flashcards_topic_id ON flashcards(topic_id);
CREATE INDEX idx_learning_sessions_user_flashcard ON learning_sessions(user_id, flashcard_id);
CREATE INDEX idx_learning_sessions_next_review ON learning_sessions(next_review_date);
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
```

### 2. Redis Caching
```python
# Cache frequently accessed data
@cache(expire=3600)  # 1 hour
async def get_user_stats(user_id: str):
    # ... expensive query
    pass

# Cache due flashcards
@cache(expire=300)  # 5 minutes
async def get_due_flashcards(user_id: str):
    pass
```

### 3. Query Optimization
- Use `select_related()` and `prefetch_related()` to reduce queries
- Implement pagination for all list endpoints
- Use database connection pooling
- Add database read replicas for scaling

### 4. Background Tasks
- Use Celery for:
  - Achievement checking
  - Email notifications
  - Audio generation
  - Batch imports
  - Analytics calculation

---

## Security Best Practices

1. **Authentication**
   - Use strong JWT secrets
   - Implement token refresh mechanism
   - Add rate limiting on auth endpoints
   - Hash passwords with bcrypt

2. **API Security**
   - Input validation with Pydantic
   - SQL injection prevention (use ORM)
   - CORS configuration
   - Rate limiting (Redis)
   - API key for AI services

3. **File Upload**
   - Validate file types and sizes
   - Scan for malware
   - Use signed URLs for access
   - Separate storage buckets

4. **Data Privacy**
   - Encrypt sensitive data
   - GDPR compliance (data export, deletion)
   - Audit logs for sensitive operations

---

## Monitoring & Logging

### Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

### Metrics
- Track API response times
- Monitor database query performance
- Track error rates
- Monitor resource usage (CPU, memory)

### Tools
- **Logging**: structlog or loguru
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **APM**: New Relic or DataDog

---

## Future Enhancements

1. **Social Features**
   - Share flashcards with friends
   - Leaderboards
   - Study groups

2. **Advanced Learning**
   - Video support
   - Handwriting recognition
   - Voice recognition quiz

3. **Mobile Apps**
   - React Native or Flutter
   - Offline mode
   - Push notifications

4. **Analytics**
   - Learning analytics dashboard
   - Progress visualization
   - Weak areas identification

5. **Integrations**
   - Anki import/export
   - Google Classroom
   - Canvas LMS

---

## Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com/
- SQLAlchemy: https://docs.sqlalchemy.org/
- Alembic: https://alembic.sqlalchemy.org/
- Pydantic: https://docs.pydantic.dev/
- Redis: https://redis.io/docs/
- MinIO: https://min.io/docs/

### Spaced Repetition
- SM-2 Algorithm: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- FSRS Algorithm: https://github.com/open-spaced-repetition/fsrs4anki

### AI APIs
- OpenAI: https://platform.openai.com/docs/
- Google Cloud TTS: https://cloud.google.com/text-to-speech

---

## Conclusion

This guideline provides a comprehensive roadmap for building a full-featured quiz/flashcard application with modern technologies. Follow the implementation phases sequentially, and don't hesitate to adapt based on your specific needs.

**Estimated Timeline:**
- Phase 1-2 (Setup + Core Infrastructure): 2 weeks
- Phase 3-4 (Core Features + Learning): 2 weeks
- Phase 5-6 (Gamification + Import/Export): 2 weeks
- Phase 7-8 (AI + Settings): 1 week
- Phase 9-10 (Testing + Deployment): 1 week

**Total: ~8 weeks for MVP**

Good luck with your quiz app development!
