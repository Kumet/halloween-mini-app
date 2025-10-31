# 🎃 Halloween Mini Apps

[![CI](https://github.com/Kumet/halloween-mini-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Kumet/halloween-mini-app/actions/workflows/ci.yml)

ハロウィンをテーマにした React + FastAPI のミニアプリです。フロントエンドから “Trick or Treat” とストーリー生成 API を呼び出し、アニメーション付きの UI で結果を表示します。バックエンドはシード指定による再現性、レスポンス履歴の永続化、Prometheus 互換のメトリクス出力に対応しており、学習用・ポートフォリオ用に扱いやすい構成です。

## 主な機能

- **Trick or Treat API**: ランダム（シード指定可）で `treat` / `trick` を返却し、結果を履歴に保存。
- **ストーリー生成 API**: モード（`horror` / `gag` / `kids`）と長さを指定してオフライン生成。シード指定で再現可能。
- **履歴タイムライン**: SQLite に保存した最新 50 件をフロントに表示。メトリクスやログからも追跡可能。
- **UI 演出と i18n**: Framer Motion による背景演出とカードアニメーション、`react-i18next` による日本語/英語切り替えをサポート。
- **Observability**: Loguru の JSON 構造化ログ、`/metrics` エンドポイント（Prometheus 互換）を提供。

## 技術スタック

- **Backend**: FastAPI, Pydantic v2, Uvicorn, Loguru, Prometheus FastAPI Instrumentator, SQLite
- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS, Framer Motion, react-i18next, Playwright
- **ツール**: uv / Poetry（任意）, npm, Docker, GitHub Actions, pytest

## セットアップ

### 前提条件

- Node.js 20.19 以上（`nvm install 20.19.0` などで準備）
- Python 3.12 以上
- （任意）Docker / Docker Compose

### 1. リポジトリを取得

```bash
git clone https://github.com/Kumet/halloween-mini-app.git
cd halloween-mini-app
```

### 2. バックエンドを起動

`uv` を利用する例：

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

Poetry や通常の venv/pip を用いる場合は `requirements-dev.txt` を参照してください。

### 3. フロントエンドを起動

```bash
cd frontend
npm install
printf "VITE_API_BASE=http://localhost:8000\n" > .env.local
npm run dev
```

ブラウザで <http://localhost:5173> を開き、右上の *Language* セレクタで日本語 / English を切り替えられます。

### 4. Docker Compose で一括起動（任意）

```bash
cd halloween-mini-app
docker compose up -d --build
# API:    http://localhost:8000
# Front:  http://localhost:8080
```

## テスト

```bash
# バックエンド
cd backend
../.venv/bin/python -m pytest  # もしくは python -m pytest

# フロントエンド（Playwright）
cd frontend
PATH="/usr/local/opt/node@20/bin:$PATH" VITE_API_BASE=http://127.0.0.1:8000 npm run test:e2e
```

CI（GitHub Actions）では、pytest と Playwright を実行し、Pull Request ごとに自動検証を行っています。

## API リファレンス

| メソッド | パス | 説明 |
|----------|------|------|
| `GET`    | `/api/health`          | ヘルスチェック |
| `POST`   | `/api/trick-or-treat`  | Trick / Treat 判定（シード指定で再現） |
| `POST`   | `/api/story`           | ハロウィンストーリー生成 |
| `GET`    | `/api/history`         | 最新履歴（最大 50 件）を取得 |
| `GET`    | `/metrics`             | Prometheus 形式のメトリクス |

### `/api/trick-or-treat`

- **Request**

```json
{ "name": "Masa", "seed": 42 }
```

- **Response**

```json
{
  "result": "treat",
  "message": "Masa は チョコバー をもらった！",
  "payload": { "result": "treat", "item": "チョコバー", "name": "Masa", "seed": 42 }
}
```

### `/api/story`

- **Request**

```json
{ "mode": "gag", "hero_name": "Masa", "length": "medium", "seed": 7 }
```

- **Response**

```json
{
  "title": "お化けの残業",
  "story": "ドラキュラは禁コーヒー中。なのに今日に限って無料試飲。\n魔女のホウキがBluetooth接続を要求してきた。\nドラキュラのマント、実は福袋の外装だった。\n最後はみんなで記念撮影。もちろんピースサインで。",
  "mode": "gag"
}
```

### `/api/history`

- **Query Parameters**: `limit`（任意 / デフォルト 20 / 最大 50）
- **Response**

```json
[
  {
    "id": 12,
    "type": "trick",
    "summary": "Tester は チョコバー をもらった！",
    "payload": {"result": "treat", "item": "チョコバー", "name": "Tester", "seed": 42},
    "created_at": "2025-10-31T09:10:25.123456+00:00"
  },
  {
    "id": 11,
    "type": "story",
    "summary": "転びそうなドラキュラ",
    "payload": {"mode": "gag", "length": "medium", "hero": "Tester", "seed": 7},
    "created_at": "2025-10-31T09:09:58.987654+00:00"
  }
]
```

## 観測・運用メモ

- **ログ**: Loguru による JSON 構造化ログを標準出力に出力。
- **メトリクス**: `/metrics` を Prometheus に scrape するだけで HTTP リクエスト数などを取得可能。
- **履歴の拡張**: `backend/app/history.py` 内で `payload` にカスタムフィールドを追加すれば、フロントのタイムラインに反映されます。

## アーキテクチャ

```mermaid
flowchart LR
  FE[React (Vite Dev Server / Nginx)] -- REST --> API[FastAPI]
  API --> DB[(SQLite 履歴ストア)]
  API --> TEMPLATES[story_templates.py]
  API --> METRICS[/metrics]
  FE -- VITE_API_BASE --> API
```

## 今後のアイデア

- API キーや OAuth を用いた本格的な認証
- 履歴画面のフィルタや検索、ページング対応
- Story 生成のテンプレート追加や文体カスタマイズ UI
- GitHub Pages / Fly.io などへのデプロイ自動化

## ライセンス

MIT

