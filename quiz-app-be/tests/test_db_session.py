from sqlalchemy.orm import Session
from app.db.session import SessionLocal

def test_session_local():
    db = SessionLocal()
    assert isinstance(db, Session)
    db.close()
