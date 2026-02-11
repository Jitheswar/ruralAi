import os
import asyncio
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    exit(1)

async def list_models():
    print(f"Checking models for API Key: {GEMINI_API_KEY[:4]}...{GEMINI_API_KEY[-4:]}")
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # List models
        print("\n--- Available Models ---")
        async for model in client.models.list_async():
            print(f"- {model.name}")
            print(f"  Display Name: {model.display_name}")
            print(f"  Capabilities: {model.supported_generation_methods}")
            print()

        print("\n--- Recommendation ---")
        print("Based on free tier limits, 'gemini-1.5-flash' or 'gemini-1.5-flash-8b' are usually the most cost-effective.")
        print("'gemini-2.0-flash' is newer but may have stricter rate limits currently.")
        
    except Exception as e:
        print(f"Error fetching models: {e}")

if __name__ == "__main__":
    asyncio.run(list_models())
