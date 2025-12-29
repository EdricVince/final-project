"""
API v1 Router - Main router for all API endpoints
"""
from fastapi import APIRouter

# from app.api.v1.endpoints import (
#     auth,
#     users,
#     topics,
#     flashcards,
#     learning,
#     quiz,
#     achievements,
#     streaks,
#     import_export,
#     ai,
# )

api_router = APIRouter()

# Include all endpoint routers
# api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(topics.router, prefix="/topics", tags=["Topics"])
# api_router.include_router(flashcards.router, prefix="/flashcards", tags=["Flashcards"])
# api_router.include_router(learning.router, prefix="/learning", tags=["Learning"])
# api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
# api_router.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])
# api_router.include_router(streaks.router, prefix="/streaks", tags=["Streaks"])
# api_router.include_router(import_export.router, prefix="/import", tags=["Import/Export"])
# api_router.include_router(ai.router, prefix="/ai", tags=["AI Assistant"])


@api_router.get("/", tags=["Root"])
async def root():
    """API root endpoint"""
    return {
        "message": "Quiz App API",
        "version": "v1",
        "docs": "/docs",
    }
