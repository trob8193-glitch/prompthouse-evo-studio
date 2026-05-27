from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str = ""
    github_token: str = ""
    default_model: str = "gpt-4o-mini"
    prompthouse_db_path: str = "./prompthouse.db"

    class Config:
        env_file = ".env"


settings = Settings()
