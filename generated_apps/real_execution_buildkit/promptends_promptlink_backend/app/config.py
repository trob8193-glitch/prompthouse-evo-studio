from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openai_api_key: str = ""
    github_token: str = ""
    default_model: str = "gpt-4o-mini"
    prompthouse_db_path: str = "./prompthouse.db"


settings = Settings()
