import json
import os
from typing import Any

import httpx

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "openai/gpt-oss-120b"

STRUCTURED_RESPONSE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "assistant_message": {"type": "string"},
        "board_update": {
            "anyOf": [
                {
                    "type": "object",
                    "properties": {
                        "columns": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "title": {"type": "string"},
                                    "cardIds": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                    },
                                },
                                "required": ["id", "title", "cardIds"],
                                "additionalProperties": False,
                            },
                        },
                        "cards": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "title": {"type": "string"},
                                    "details": {"type": "string"},
                                },
                                "required": ["id", "title", "details"],
                                "additionalProperties": False,
                            },
                        },
                    },
                    "required": ["columns", "cards"],
                    "additionalProperties": False,
                },
                {"type": "null"},
            ]
        },
    },
    "required": ["assistant_message", "board_update"],
    "additionalProperties": False,
}


def _api_key() -> str:
    key = os.getenv("OPENROUTER_API_KEY")
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")
    return key


def ping_openrouter() -> str:
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": "What is 2+2? Reply with only the number."}],
        "temperature": 0,
    }
    with httpx.Client(timeout=30) as client:
        response = client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {_api_key()}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
    return str(data["choices"][0]["message"]["content"])


def structured_chat(
    board: dict[str, Any],
    history: list[dict[str, str]],
    user_message: str,
) -> tuple[str, dict[str, Any] | None]:
    system_prompt = (
        "You are an assistant for a kanban board. Return valid JSON only. "
        "Use board_update null when no board changes are needed."
    )

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append(
        {
            "role": "user",
            "content": (
                "Current board JSON:\n"
                + json.dumps(board)
                + "\n\nUser request:\n"
                + user_message
            ),
        }
    )

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.2,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "kanban_response",
                "strict": True,
                "schema": STRUCTURED_RESPONSE_SCHEMA,
            },
        },
    }

    with httpx.Client(timeout=60) as client:
        response = client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {_api_key()}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    parsed = json.loads(content)
    assistant_message = str(parsed["assistant_message"])
    board_update = parsed.get("board_update")
    return assistant_message, board_update
