# Backend
## 起動（Poetry）
poetry install
poetry run uvicorn app.main:app --reload --port 8000

## 起動（uv）
uv init --package halloween-backend
uv add fastapi "uvicorn[standard]" python-multipart pydantic
uv run uvicorn app.main:app --reload --port 8000
