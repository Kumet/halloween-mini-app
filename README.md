# 🎃 Halloween Mini Apps — React + FastAPI 完全指示書（Codex用 / 省略なし）

[![CI](https://github.com/Kumet/halloween-mini-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Kumet/halloween-mini-app/actions/workflows/ci.yml)

> **目的**  
> 半日（~4〜6h）で **React + FastAPI** のハロウィン風ミニアプリを構築・実行・（任意で）Docker化まで完了するための **完全な実行手順** と **コード一式**。  
> このファイルは **そのままコピペ** で Codex（VS Code / Cursor / ChatGPT Code Interpreter 等）に渡して自動化できるよう最適化済みです。

---

## 0. 成果物一覧（完成イメージ）

- **バックエンド（FastAPI）**
  - `POST /api/trick-or-treat`：ランダム（または seed 指定）で `treat` / `trick` を返す
  - `POST /api/story`：モード（`horror` / `gag` / `kids`）と長さ（`short` / `medium`）で短編ストーリーを合成生成
  - `GET  /api/history`：結果ログを SQLite に保存し最新 50 件まで取得
  - `GET  /api/health`：疎通確認
- **フロントエンド（React + Vite + TS + Tailwind + Framer Motion）**
  - 上記 API を叩く UI。演出付きでレスポンス表示（バッジ・フェード表示）
  - 日英切り替え（react-i18next）と履歴タイムライン表示
- **オプション**
  - Dockerfile（frontend / backend）
  - docker-compose.yml（両者を同時起動）

---

## 1. 前提条件（ローカル開発）

- **必須**
  - Node.js 18 以上（推奨: v20）
  - npm（または pnpm/yarn でも可：以下は npm 前提で説明）
  - Python 3.10 以上（3.12 推奨）
- **任意**
  - Poetry または uv（どちらでも可。両方の手順を記載）
  - Docker / Docker Desktop（Docker化する場合）

> **注意**: 既存で 8000（API）・5173（Vite dev server）・8080（nginx）のポートを占有しているプロセスがある場合は停止してください。

---

## 2. ディレクトリ構成（最終形）

```text
halloween-mini/
  backend/
    app/
      __init__.py
      main.py
      models.py           # 今回は未使用（拡張用に空で用意可）
      schemas.py
      story_templates.py
    pyproject.toml        # Poetry 用（uv でも可）
    README.md
  frontend/
    index.html
    package.json
    tsconfig.json
    vite.config.ts
    postcss.config.js
    tailwind.config.ts
    src/
      main.tsx
      App.tsx
      lib/api.ts
      components/
        Card.tsx
        Button.tsx
        ResultBadge.tsx
      styles/index.css
    README.md
  docker-compose.yml      # 任意（Docker化）
```

---

## 3. Codex への最初の指示（自動スキャフォールド）

Codex へ以下を一括ペーストしてください。環境に合わせて `poetry` or `uv` のどちらかコマンドを選びます。

> **PROMPT A（プロジェクト作成〜依存導入まで）**

```bash
# ========= 基本スキャフォールド =========
mkdir -p halloween-mini/backend/app halloween-mini/frontend/src/{components,lib,styles}
cd halloween-mini

# ========= Backend（FastAPI） =========
cat > backend/app/__init__.py << 'PY'
# 空ファイル（パッケージ化）
PY

cat > backend/app/schemas.py << 'PY'
from pydantic import BaseModel, Field
from typing import Optional, Literal

class TrickRequest(BaseModel):
    """Trick or Treat API の入力スキーマ"""
    name: Optional[str] = Field(None, description="ユーザー名（任意）")
    seed: Optional[int] = Field(None, description="乱数seed（任意、同じ結果を再現したい時）")

class TrickResponse(BaseModel):
    """Trick or Treat API の出力スキーマ"""
    result: Literal["treat", "trick"]
    message: str
    payload: dict

class StoryRequest(BaseModel):
    """ストーリー生成 API の入力スキーマ"""
    mode: Literal["horror", "gag", "kids"] = "horror"
    hero_name: str = "あなた"
    length: Literal["short", "medium"] = "short"
    seed: Optional[int] = None

class StoryResponse(BaseModel):
    """ストーリー生成 API の出力スキーマ"""
    title: str
    story: str
    mode: str
PY

cat > backend/app/story_templates.py << 'PY'
from __future__ import annotations
import random

# シンプルなテンプレ + パーツ合成（外部API不要）
TITLES = {
    "horror": [
        "闇夜のカボチャ村", "囁くランタン", "墓地の向こう側", "月下に揺れる影"
    ],
    "gag": [
        "転びそうなドラキュラ", "お化けの残業", "カボチャの出世物語"
    ],
    "kids": [
        "やさしいゴーストのピポ", "キャンディと小さな勇者", "おやすみハロウィン"
    ],
}

OPENERS = {
    "horror": [
        "風が止むと、古い家のドアがきしんだ。",
        "時計が零時を告げるころ、村はしんと静まり返った。",
    ],
    "gag": [
        "カボチャが転んだ拍子に、種が名刺みたいに飛んでいった。",
        "ドラキュラは禁コーヒー中。なのに今日に限って無料試飲。",
    ],
    "kids": [
        "ピポはやさしいおばけ。いたずらは苦手なんだ。",
        "きょうはハロウィン。みんなで“トリック・オア・トリート”。",
    ],
}

EVENTS = {
    "horror": [
        "遠くでランタンが一つ、また一つと灯り、誰もいないはずの道を導く。",
        "足元の影が遅れてついてくる。やがて、それは笑った。",
        "家の地下から、湿った息遣いが聞こえた。",
    ],
    "gag": [
        "ゾンビたちはダンス練習中。リズム感は壊滅的。",
        "魔女のホウキがBluetooth接続を要求してきた。",
        "ドラキュラのマント、実は福袋の外装だった。",
    ],
    "kids": [
        "ピポは小さなランタンで道を照らした。",
        "カボチャの馬車が、ふわりと空に浮かんだよ。",
        "困っている黒猫を、みんなで助けたんだ。",
    ],
}

ENDINGS = {
    "horror": [
        "背後を振り返ると、ランタンだけが残っていた。",
        "朝日が昇るころ、影はやっと足元に戻った。",
    ],
    "gag": [
        "最後はみんなで記念撮影。もちろんピースサインで。",
        "会計はポイントで。ゾンビもキャッシュレス。",
    ],
    "kids": [
        "みんなで“ハッピーハロウィン！”と笑った。",
        "おやすみなさい、また来年も会おうね。",
    ],
}

def generate_story(mode: str, hero: str, length: str, seed: int | None = None):
    rng = random.Random(seed)
    title = rng.choice(TITLES[mode])

    opener = rng.choice(OPENERS[mode]).replace("{hero}", hero)

    n_events = 2 if length == "short" else 3
    events = rng.sample(EVENTS[mode], k=n_events)

    ending = rng.choice(ENDINGS[mode])

    story = "\\n".join([opener] + events + [ending])
    story = story.replace("{hero}", hero)
    return title, story
PY

cat > backend/app/main.py << 'PY'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .schemas import TrickRequest, TrickResponse, StoryRequest, StoryResponse
from .story_templates import generate_story
import random

app = FastAPI(title="Halloween Mini API", version="0.1.0")

# CORS（開発用：必要に応じて調整）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    """稼働確認用エンドポイント"""
    return {"status": "ok"}

@app.post("/api/trick-or-treat", response_model=TrickResponse)
def trick_or_treat(payload: TrickRequest):
    """Trick or Treat の結果を返す。
    seedがあれば再現可能な乱数にし、メッセージとペイロードを返却。
    """
    rng = random.Random(payload.seed)
    result = rng.choice(["treat", "trick"]) if payload.seed is not None else random.choice(["treat", "trick"])

    if result == "treat":
        candies = ["チョコバー", "キャラメル", "グミ", "キャンディ"]
        item = (rng.choice(candies) if payload.seed is not None else random.choice(candies))
        message = f"{payload.name or 'You'} は {item} をもらった！"
        return TrickResponse(result=result, message=message, payload={"item": item})
    else:
        pranks = ["ドアノック音が止まらない…", "マントが裏返しになった", "足音だけが先に進む"]
        item = (rng.choice(pranks) if payload.seed is not None else random.choice(pranks))
        message = f"{payload.name or 'You'} にいたずら：{item}"
        return TrickResponse(result=result, message=message, payload={"prank": item})

@app.post("/api/story", response_model=StoryResponse)
def story(req: StoryRequest):
    """モード（horror/gag/kids）と長さで短編を生成する。
    外部APIなしで即時応答。seed指定で再現可能。
    """
    title, content = generate_story(req.mode, req.hero_name, req.length, req.seed)
    return StoryResponse(title=title, story=content, mode=req.mode)
PY

cat > backend/pyproject.toml << 'TOML'
[tool.poetry]
name = "halloween-backend"
version = "0.1.0"
description = "FastAPI backend for Halloween mini apps"
authors = ["you <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.10"
fastapi = "^0.115.0"
uvicorn = {extras = ["standard"], version = "^0.30.0"}
python-multipart = "^0.0.9"
pydantic = "^2.9.0"

[tool.poetry.group.dev.dependencies]
black = "^24.0"
ruff = "^0.6.0"

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
TOML

cat > backend/README.md << 'MD'
# Backend
## 起動（Poetry）
poetry install
poetry run uvicorn app.main:app --reload --port 8000

## 起動（uv）
uv init --package halloween-backend
uv add fastapi "uvicorn[standard]" python-multipart pydantic
uv run uvicorn app.main:app --reload --port 8000
MD

# ========= Frontend（React + Vite + TS + Tailwind + Framer Motion） =========
cd ../frontend

# Vite 初期化（TypeScript）
npm create vite@latest . -- --template react-ts

# 依存追加
npm i
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm i framer-motion

# Tailwind 設定
cat > tailwind.config.ts << 'TS'
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
TS

# ベースCSS
mkdir -p src/styles
cat > src/styles/index.css << 'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { background: #0b0b12; color: #f3f4f6; }
CSS

# API ヘルパ
mkdir -p src/lib
cat > src/lib/api.ts << 'TS'
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

export async function postJSON<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export type TrickResponse = { result: 'treat'|'trick'; message: string; payload: Record<string, unknown> };
export function callTrick(name?: string, seed?: number) {
  return postJSON<TrickResponse>('/api/trick-or-treat', { name, seed });
}

export type StoryResponse = { title: string; story: string; mode: string };
export function callStory(params: { mode: 'horror'|'gag'|'kids'; hero_name: string; length: 'short'|'medium'; seed?: number }) {
  return postJSON<StoryResponse>('/api/story', params);
}
TS

# UI コンポーネント
mkdir -p src/components
cat > src/components/Card.tsx << 'TSX'
import { ReactNode } from 'react';

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 shadow-xl">
      {children}
    </div>
  );
}
TSX

cat > src/components/Button.tsx << 'TSX'
import { ButtonHTMLAttributes } from 'react';

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 active:scale-95 transition ${props.className ?? ''}`}
    />
  );
}
TSX

cat > src/components/ResultBadge.tsx << 'TSX'
export default function ResultBadge({ kind }: { kind: 'treat' | 'trick' }) {
  const text = kind === 'treat' ? 'TREAT! 🍬' : 'TRICK! 👻';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm border ${kind==='treat' ? 'border-green-400' : 'border-orange-400'}`}>
      {text}
    </span>
  );
}
TSX

# エントリ
cat > src/main.tsx << 'TSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
TSX

cat > src/App.tsx << 'TSX'
import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './components/Card';
import Button from './components/Button';
import ResultBadge from './components/ResultBadge';
import { callTrick, callStory, TrickResponse, StoryResponse } from './lib/api';

export default function App() {
  const [name, setName] = useState('');
  const [seed, setSeed] = useState<number | ''>('');
  const [trick, setTrick] = useState<TrickResponse | null>(null);

  const [mode, setMode] = useState<'horror'|'gag'|'kids'>('horror');
  const [hero, setHero] = useState('あなた');
  const [length, setLength] = useState<'short'|'medium'>('short');
  const [story, setStory] = useState<StoryResponse | null>(null);

  const doTrick = async () => {
    const s = seed === '' ? undefined : Number(seed);
    const res = await callTrick(name || undefined, s);
    setTrick(res);
  };

  const doStory = async () => {
    const s = seed === '' ? undefined : Number(seed);
    const res = await callStory({ mode, hero_name: hero || 'あなた', length, seed: s });
    setStory(res);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="text-center space-y-2">
        <motion.h1 initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="text-3xl font-bold">
          🎃 Halloween Mini Apps
        </motion.h1>
        <p className="text-zinc-400">React + FastAPI（ローカル環境で即動作）</p>
      </header>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Trick or Treat API</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input className="rounded-lg bg-zinc-800 px-3 py-2" placeholder="名前（任意）" value={name} onChange={e=>setName(e.target.value)} />
          <input className="rounded-lg bg-zinc-800 px-3 py-2" placeholder="seed（任意、整数）" value={seed} onChange={e=>setSeed(e.target.value === '' ? '' : Number(e.target.value))} />
          <Button onClick={doTrick}>Trick or Treat!</Button>
        </div>
        {trick && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-4 space-y-2">
            <ResultBadge kind={trick.result} />
            <div className="text-zinc-300">{trick.message}</div>
            <pre className="text-xs text-zinc-500 bg-zinc-950/50 rounded-xl p-3 overflow-auto">{JSON.stringify(trick.payload, null, 2)}</pre>
          </motion.div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Halloween Story API</h2>
        <div className="grid md:grid-cols-5 gap-3 items-center">
          <select className="rounded-lg bg-zinc-800 px-3 py-2" value={mode} onChange={e=>setMode(e.target.value as any)}>
            <option value="horror">horror</option>
            <option value="gag">gag</option>
            <option value="kids">kids</option>
          </select>
          <select className="rounded-lg bg-zinc-800 px-3 py-2" value={length} onChange={e=>setLength(e.target.value as any)}>
            <option value="short">short</option>
            <option value="medium">medium</option>
          </select>
          <input className="rounded-lg bg-zinc-800 px-3 py-2" placeholder="主人公名" value={hero} onChange={e=>setHero(e.target.value)} />
          <input className="rounded-lg bg-zinc-800 px-3 py-2" placeholder="seed（任意）" value={seed} onChange={e=>setSeed(e.target.value === '' ? '' : Number(e.target.value))} />
          <Button onClick={doStory}>生成する</Button>
        </div>
        {story && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-4 space-y-2">
            <div className="text-lg font-semibold">{story.title}</div>
            <p className="whitespace-pre-wrap text-zinc-300">{story.story}</p>
          </motion.div>
        )}
      </Card>

      <footer className="text-center text-xs text-zinc-500 pt-4">Happy Halloween 👻</footer>
    </div>
  );
}
TSX

cat > vite.config.ts << 'TS'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
TS

cat > README.md << 'MD'
# Frontend
## 開発
npm run dev

## API ベースURL
.env.local に以下を設定できます：

VITE_API_BASE=http://localhost:8000
MD

# ルートへ戻る
cd ..

# ========= Docker（任意） =========
cat > docker-compose.yml << 'YAML'
services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    restart: unless-stopped
  web:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - api
    restart: unless-stopped
YAML

# Backend Dockerfile
cat > backend/Dockerfile << 'DOCKER'
FROM python:3.12-slim
WORKDIR /app
COPY app /app/app
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" pydantic python-multipart
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
DOCKER

# Frontend Dockerfile
cat > frontend/Dockerfile << 'DOCKER'
FROM node:20-alpine as build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
DOCKER

echo "SCAFFOLD_DONE"
```

> **実行結果に `SCAFFOLD_DONE` が出たら成功** です。

---

## 4. 起動手順（ローカル）

### 4.1 Backend 起動

**Poetry を使う場合**

```bash
cd halloween-mini/backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

**uv を使う場合（Poetry の代替）**

```bash
cd halloween-mini/backend
uv init --package halloween-backend
uv add fastapi "uvicorn[standard]" python-multipart pydantic
uv run uvicorn app.main:app --reload --port 8000
```

**ヘルスチェック**

```bash
curl -s http://localhost:8000/api/health
# => {"status":"ok"}
```

### 4.2 Frontend 起動

```bash
cd halloween-mini/frontend
echo "VITE_API_BASE=http://localhost:8000" > .env.local
npm run dev
# ブラウザで http://localhost:5173 を開く
# 画面右上の Language セレクタで日本語 / 英語を切り替えられます
```

---

## 5. API 仕様（完全版）

### 5.1 `GET /api/health`

- **目的**: バックエンド疎通確認
- **レスポンス例**

```json
{ "status": "ok" }
```

### 5.2 `POST /api/trick-or-treat`

- **Body**

```json
{
  "name": "Masa",
  "seed": 42
}
```

- **レスポンス例（treat）**

```json
{
  "result": "treat",
  "message": "Masa は チョコバー をもらった！",
  "payload": { "item": "チョコバー" }
}
```

- **レスポンス例（trick）**

```json
{
  "result": "trick",
  "message": "Masa にいたずら：足音だけが先に進む",
  "payload": { "prank": "足音だけが先に進む" }
}
```

- **備考**
  - `seed` を指定すると再現可能な結果になります（テスト容易）。

### 5.3 `POST /api/story`

- **Body**

```json
{
  "mode": "gag",
  "hero_name": "Masa",
  "length": "medium",
  "seed": 7
}
```

- **レスポンス例**

```json
{
  "title": "お化けの残業",
  "story": "ドラキュラは禁コーヒー中。なのに今日に限って無料試飲。\\n魔女のホウキがBluetooth接続を要求してきた。\\nドラキュラのマント、実は福袋の外装だった。\\n最後はみんなで記念撮影。もちろんピースサインで。",
  "mode": "gag"
}
```

### 5.4 `GET /api/history`

- **クエリパラメータ**

```
limit: 取得件数（任意 / デフォルト 20 / 最大 50）
```

- **レスポンス例**

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

---

## 6. curl 検証コマンド

```bash
# health
curl -X GET http://localhost:8000/api/health

# trick-or-treat
curl -X POST http://localhost:8000/api/trick-or-treat \
  -H 'Content-Type: application/json' \
  -d '{"name":"Masa","seed":42}'

# story
curl -X POST http://localhost:8000/api/story \
  -H 'Content-Type: application/json' \
  -d '{"mode":"gag","hero_name":"Masa","length":"medium","seed":7}'

# history
curl -X GET "http://localhost:8000/api/history?limit=5"
```

---

## 7. よくあるハマりポイント & 対策

1. **CORS でブロックされる**  
   - `backend/app/main.py` の `allow_origins=["*"]` をフロントの実オリジンに合わせる（例: `"http://localhost:5173"`）。
2. **ポート競合**  
   - API（8000）/ Frontend（5173）/ Nginx（8080）を別ポートに変更。
3. **Node バージョンが古い**  
   - Vite 開発サーバが起動しない場合は Node v18+ を使う。
4. **Seed の取り扱い**  
   - `seed` は整数。未指定時は完全ランダム。E2E テストでは seed 指定を推奨。

---

## 8. 追加機能（任意・短時間で拡張）

- **SEED 共有 URL**：`?seed=42&mode=horror` でクエリから初期値を復元（`useEffect` + `URLSearchParams`）。
- **BGM**：著作権フリーループ音源をモード別に再生（`<audio loop>`）。
- **API キー化**：Auth0 や Clerk を用いた SPA + API 認証の導入。

**サンプル（履歴にフィールドを追加する場合）**

```python
# backend/app/history.py を編集して payload に新しいキーを保持できます。
def add_entry(entry_type: str, summary: str, payload: dict[str, Any]) -> None:
    payload["request_id"] = uuid.uuid4().hex  # 例: トレースIDを付与
    ...
```

---

## 9. Docker での起動

### 9.1 ビルド & 起動

```bash
cd halloween-mini
docker compose up -d --build

# バックエンド: http://localhost:8000
# フロント   : http://localhost:8080
```

### 9.2 停止・ログ・削除

```bash
docker compose logs -f
docker compose down
```

---

## 10. アーキテクチャ（Mermaid）

```mermaid
flowchart LR
  A[React (Vite Dev Server :5173)] -- POST/GET --> B[FastAPI :8000]
  A -- .env(VITE_API_BASE) --> B
  subgraph Backend
    B --> C[story_templates.py]
    B --> D[schemas.py]
  end
  subgraph Optional Docker
    E[Nginx :8080] -. serves build .-> A
  end
```

---

## 11. 仕上げチェックリスト（半日内で完了するために）

- [ ] `GET /api/health` が OK を返す
- [ ] `POST /api/trick-or-treat` が `treat` or `trick` を返す（seed 指定で再現）
- [ ] `POST /api/story` が短編生成（モードと長さ切替）
- [ ] フロントからフォーム → API 呼び出し → 結果表示まで確認
- [ ] （任意）Docker 起動で `http://localhost:8080` に表示

---

## 12. Codex への後続プロンプト例（自動化）

> **PROMPT B（Poetry でバックエンド起動 & curl 検証）**

```bash
cd halloween-mini/backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000 &
sleep 2
curl -s http://localhost:8000/api/health
curl -s -X POST http://localhost:8000/api/trick-or-treat -H 'Content-Type: application/json' -d '{"name":"Masa","seed":42}'
curl -s -X POST http://localhost:8000/api/story -H 'Content-Type: application/json' -d '{"mode":"gag","hero_name":"Masa","length":"medium","seed":7}'
```

> **PROMPT C（フロント起動）**

```bash
cd halloween-mini/frontend
echo "VITE_API_BASE=http://localhost:8000" > .env.local
npm run dev
```

> **PROMPT D（Docker で一発起動）**

```bash
cd halloween-mini
docker compose up -d --build
```

---

## 13. ライセンス/注意

- このサンプルは教育目的・個人利用を想定しています。
- 音源・画像素材を追加する場合はライセンスをご確認ください。

---

**Happy Halloween & Have fun shipping! 👻**
