# Backend
## 起動（Poetry）
poetry install
poetry run uvicorn app.main:app --reload --port 8000

## 起動（uv）
uv init --package halloween-backend
uv add fastapi "uvicorn[standard]" python-multipart pydantic
uv run uvicorn app.main:app --reload --port 8000

## 運用メモ
- ログ: JSON 形式で標準出力に構造化ログが出力されます。
- メトリクス: `GET /metrics` で Prometheus 形式のメトリクスが取得できます。
