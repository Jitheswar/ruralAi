"""
OpenAI Service — handles symptom analysis and prescription OCR via OpenAI (GPT-4o).
"""

import os
import json
from openai import AsyncOpenAI
from services.ai_models import get_model_for_task

# Support both standard and the user's existing key name
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("OPEN_AI_KEY")

_client = None


def _get_client():
    global _client
    if _client is None and OPENAI_API_KEY:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client


def _parse_json_response(text: str) -> dict:
    """Extract JSON from OpenAI response (handles markdown code blocks)."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        # Remove first line (```json) and last line (```)
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"error": "Failed to parse AI response", "raw": text}


async def analyze_symptoms_openai(
    symptoms: list[str],
    modifiers: list[str],
    duration_days: int,
    age: int | None = None,
    gender: str | None = None,
    medical_history: list[str] | None = None,
    current_medications: list[str] | None = None,
    medicines_context: str = "",
) -> dict:
    """Analyze symptoms using OpenAI and return structured medical assessment."""
    client = _get_client()
    if not client:
        return {"error": "OpenAI API key not configured"}

    symptom_labels = ", ".join(s.replace("_", " ") for s in symptoms)
    modifier_labels = ", ".join(m.replace("_", " ") for m in modifiers) if modifiers else "none"
    history = ", ".join(medical_history) if medical_history else "none reported"
    meds = ", ".join(current_medications) if current_medications else "none"

    prompt = f"""You are a rural health assistant AI for India. You help villagers and ASHA workers understand symptoms and provide first-aid guidance. You are NOT a doctor — always recommend visiting PHC/hospital for serious conditions.

PATIENT INFORMATION:
- Age: {age or 'not specified'}
- Gender: {gender or 'not specified'}
- Symptoms: {symptom_labels}
- Duration: {duration_days} day(s)
- Onset: {modifier_labels}
- Medical history: {history}
- Current medications: {meds}

AVAILABLE MEDICINES IN OUR DATABASE (for recommendations):
{medicines_context or 'No medicine database available'}

INSTRUCTIONS:
1. Analyze the symptom combination carefully
2. Consider age, gender, and medical history
3. List possible conditions ranked by likelihood
4. ONLY recommend medicines from the AVAILABLE MEDICINES list above
5. Provide practical home care advice suitable for rural India
6. Clearly state when emergency care is needed

Respond ONLY with valid JSON in this exact format:
{{
  "possible_conditions": [
    {{
      "name": "condition name",
      "likelihood": "high" | "medium" | "low",
      "description": "brief explanation in simple language"
    }}
  ],
  "severity": "critical" | "warning" | "info",
  "summary": "one-line summary in simple language",
  "recommended_medicines": [
    {{
      "generic_name": "medicine name from our database",
      "dosage": "e.g. 1 tablet",
      "frequency": "e.g. twice daily",
      "duration": "e.g. 3 days",
      "reason": "why this medicine"
    }}
  ],
  "home_care": ["practical advice point 1", "advice point 2"],
  "warning_signs": ["sign that needs immediate hospital visit"],
  "see_doctor_urgency": "immediately" | "within_24h" | "within_week" | "monitor",
  "follow_up_questions": ["question to better understand condition"]
}}"""

    try:
        model_name = get_model_for_task("symptom_analysis")
        # Fallback to gpt-4o if a gemini model is somehow selected but we are successfully in openai service
        if "gemini" in model_name: 
             model_name = "gpt-4o"

        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are a helpful medical assistant for rural India. You output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content
        return _parse_json_response(content)
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "insufficient_quota" in error_msg or "rate_limit" in error_msg:
            return {"error": f"OpenAI quota exceeded: {error_msg}"}
        return {"error": f"OpenAI API error: {error_msg}"}


async def extract_prescription_openai(image_url: str = None, image_b64: str = None) -> dict:
    """Extract medicines from a prescription image using OpenAI Vision."""
    client = _get_client()
    if not client:
        return {"error": "OpenAI API key not configured"}
        
    if not image_url and not image_b64:
        return {"error": "No image provided"}

    image_content = {}
    if image_url:
        image_content = {"type": "image_url", "image_url": {"url": image_url}}
    else:
        image_content = {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}}

    prompt = """Extract all medicines from this prescription image. For each medicine, identify:
- Medicine name (brand name as written)
- Generic/salt name (if identifiable)
- Dosage (e.g., 500mg)
- Frequency (e.g., twice daily, BD, TDS)
- Duration (e.g., 5 days)

Also extract:
- Doctor name (if visible)
- Date (if visible)

Respond ONLY with valid JSON in this exact format:
{
  "medicines": [
    {
      "brand_name": "as written on prescription",
      "generic_name": "generic/salt name or null",
      "dosage": "strength",
      "frequency": "how often",
      "duration": "for how long"
    }
  ],
  "doctor_name": "name or null",
  "date": "date or null",
  "notes": "any other relevant info from prescription"
}

If you cannot read the prescription clearly, still try your best and add a "confidence" field (low/medium/high)."""

    try:
        model_name = get_model_for_task("prescription_ocr")
         # Fallback to gpt-4o if a gemini model is somehow selected
        if "gemini" in model_name: 
             model_name = "gpt-4o"

        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        image_content,
                    ],
                }
            ],
            max_tokens=1000,
        )
        content = response.choices[0].message.content
        return _parse_json_response(content)
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "insufficient_quota" in error_msg or "rate_limit" in error_msg:
            return {"error": f"OpenAI quota exceeded: {error_msg}"}
        return {"error": f"OpenAI Vision error: {error_msg}"}
