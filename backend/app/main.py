import random
import sys
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from prometheus_fastapi_instrumentator import Instrumentator

from .schemas import StoryRequest, StoryResponse, TrickRequest, TrickResponse
from .story_templates import generate_story

app = FastAPI(title="Halloween Mini API", version="0.1.0")

# Loguru を JSON 形式で出力するよう設定
logger.remove()
logger.add(sys.stdout, serialize=True, level="INFO")

# CORS（開発用：必要に応じて調整）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_logging(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.bind(
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=round(duration_ms, 2),
        client=request.client.host if request.client else None,
    ).info("request.completed")
    return response


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
        item = rng.choice(candies) if payload.seed is not None else random.choice(candies)
        message = f"{payload.name or 'You'} は {item} をもらった！"
        return TrickResponse(result=result, message=message, payload={"item": item})
    pranks = ["ドアノック音が止まらない…", "マントが裏返しになった", "足音だけが先に進む"]
    item = rng.choice(pranks) if payload.seed is not None else random.choice(pranks)
    message = f"{payload.name or 'You'} にいたずら：{item}"
    return TrickResponse(result=result, message=message, payload={"prank": item})


@app.post("/api/story", response_model=StoryResponse)
def story(req: StoryRequest):
    """モード（horror/gag/kids）と長さで短編を生成する。
    外部APIなしで即時応答。seed指定で再現可能。
    """
    title, content = generate_story(req.mode, req.hero_name, req.length, req.seed)
    return StoryResponse(title=title, story=content, mode=req.mode)


Instrumentator().instrument(app).expose(app, include_in_schema=False)
