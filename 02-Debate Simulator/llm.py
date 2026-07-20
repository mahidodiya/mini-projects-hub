from groq import Groq

from config import GROQ_API_KEY


class LLMClient:
    """Handles communication with the Groq API."""

    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)

    def generate(self, prompt: str) -> str:
        """Send a prompt to the LLM and return the response."""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        )

        return response.choices[0].message.content