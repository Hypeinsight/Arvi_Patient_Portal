import os
import requests

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY  = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_MODEL    = os.getenv("AZURE_OPENAI_MODEL", "gpt-4o")
API_VERSION           = "2024-02-01"


def call_chat_model(messages: list) -> str:
    """Sends full message array to Azure OpenAI and returns the response text."""
    url = f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_MODEL}/chat/completions?api-version={API_VERSION}"

    response = requests.post(
        url,
        headers={
            "Content-Type": "application/json",
            "api-key": AZURE_OPENAI_API_KEY,
        },
        json={
            "messages": messages,
            "max_tokens": 500,
            "temperature": 0.7,
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]