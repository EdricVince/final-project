from fastapi import FastAPI
from app.core.config import settings
import uvicorn

app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/")
def read_root():
    return {"message": "Welcome to Quiz App API"}

def start():
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
