from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    OPENAI_API_KEY: str | None = None
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    class Config:
        env_file = "../.env"

settings = Settings()
