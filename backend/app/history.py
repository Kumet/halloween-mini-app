from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, List

DB_PATH = Path(
    os.environ.get(
        "HISTORY_DB_PATH",
        Path(__file__).resolve().parent.parent / "data" / "history.db",
    )
)
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def _get_connection() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def init_db() -> None:
    with _get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                summary TEXT NOT NULL,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def add_entry(entry_type: str, summary: str, payload: dict[str, Any]) -> None:
    created_at = datetime.now(timezone.utc).isoformat()
    record = (entry_type, summary, json.dumps(payload, ensure_ascii=False), created_at)
    with _get_connection() as conn:
        conn.execute(
            "INSERT INTO history (type, summary, payload, created_at) VALUES (?, ?, ?, ?)",
            record,
        )
        conn.commit()


def fetch_history(limit: int = 20) -> List[dict[str, Any]]:
    with _get_connection() as conn:
        rows = conn.execute(
            "SELECT id, type, summary, payload, created_at FROM history ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()

    history_items: List[dict[str, Any]] = []
    for row in rows:
        payload = json.loads(row[3])
        history_items.append(
            {
                "id": row[0],
                "type": row[1],
                "summary": row[2],
                "payload": payload,
                "created_at": row[4],
            }
        )
    return history_items


def clear_history() -> None:
    with _get_connection() as conn:
        conn.execute("DELETE FROM history")
        conn.commit()


init_db()
