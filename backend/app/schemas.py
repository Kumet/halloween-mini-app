from typing import Literal, Optional

from pydantic import BaseModel, Field


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
