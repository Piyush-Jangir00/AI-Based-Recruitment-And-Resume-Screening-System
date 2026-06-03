import os
import openai
from ..core.config import settings

openai.api_key = settings.OPENAI_API_KEY or os.getenv("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")

def screen_resume(text: str) -> dict:
    # Simple prompt-based screening example
    prompt = f"You are an assistant that scores a resume. Resume text:\n{text}\n\nProvide a JSON with keys: score (0-100), strengths, weaknesses, recommendations."
    resp = openai.Completion.create(model="text-davinci-003", prompt=prompt, max_tokens=300)
    return {"raw": resp.choices[0].text}

def analyze_transcript(transcript: str) -> dict:
    prompt = f"Analyze this interview transcript and provide: summary, key_topics, action_items, sentiment. Transcript:\n{transcript}\n\nRespond in JSON."
    resp = openai.Completion.create(model="text-davinci-003", prompt=prompt, max_tokens=400)
    return {"raw": resp.choices[0].text}
