import json
import os
from openai import AzureOpenAI
from pydantic import BaseModel, Field

AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY  = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
API_VERSION = "2024-12-01-preview"

client = AzureOpenAI(
    api_version=API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_API_KEY,
)

class ChatResponse(BaseModel):
    question: str = Field(description="The next message to the patient, or a warm closing message")
    sufficient_info: bool = Field(description="True if enough clinically useful info has been gathered")
    flag_urgent: bool = Field(description="True if the patient described something urgent/concerning")

def call_chat_model(messages: list) -> ChatResponse:
    """Sends full message array to Azure OpenAI and returns a validated ChatResponse."""
    completion = client.beta.chat.completions.parse(
        model=AZURE_OPENAI_DEPLOYMENT,
        messages=messages,
        max_tokens=500,
        temperature=0.7,
        response_format=ChatResponse,
    )
    return completion.choices[0].message.parsed

def call_chat_model_plain(messages: list) -> str:
    """Same as call_chat_model but without the structured ChatResponse schema —
    used for one-off tasks like summarisation, not conversational turns."""
    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT,
        messages=messages,
        max_tokens=500,
        temperature=0.7,
    )
    return response.choices[0].message.content