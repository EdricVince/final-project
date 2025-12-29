"""
Custom Exception Classes
"""


class QuizAppException(Exception):
    """Base exception for Quiz App"""
    def __init__(self, message: str = "An error occurred"):
        self.message = message
        super().__init__(self.message)


class AuthenticationError(QuizAppException):
    """Authentication related errors"""
    pass


class AuthorizationError(QuizAppException):
    """Authorization related errors"""
    pass


class ValidationError(QuizAppException):
    """Validation related errors"""
    pass


class NotFoundError(QuizAppException):
    """Resource not found errors"""
    pass


class DuplicateError(QuizAppException):
    """Duplicate resource errors"""
    pass


class FileUploadError(QuizAppException):
    """File upload related errors"""
    pass


class ImportError(QuizAppException):
    """Import/Export related errors"""
    pass


class ExternalServiceError(QuizAppException):
    """External service (AI, TTS) related errors"""
    pass


class DatabaseError(QuizAppException):
    """Database related errors"""
    pass
