from dotenv import load_dotenv
import os

# Load variables from .env into the environment
load_dotenv()

# Read the Groq API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")