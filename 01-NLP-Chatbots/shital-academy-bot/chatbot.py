import re
import difflib
import smtplib
from email.mime.text import MIMEText
from datetime import datetime

import spacy as sa

from knowledge_base import shital_academy_knowledge
from llm_helper import ask_llm
# ==========================================================
# NLP
# ==========================================================

nlp = sa.load("en_core_web_sm")


# ==========================================================
# CONFIGURATION
# ==========================================================

MIN_SCORE_THRESHOLD = 5
FUZZY_CUTOFF = 0.8
MIN_WORD_LEN_FOR_FUZZY = 4

# Ask lead details after this many REAL questions
LEAD_CAPTURE_AFTER = 3

# ------------------------------
# Academy Email Configuration
# ------------------------------
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

ACADEMY_EMAIL = os.getenv("ACADEMY_EMAIL")

# ==========================================================
# SESSION DATA
# ==========================================================

conversation_history = []

lead = {
    "captured": False,
    "question_count": 0,
    "name": "",
    "email": "",
    "mobile": ""
}

def save_message(sender, message):
    """
    Store every message in conversation history.
    """

    timestamp = datetime.now().strftime("%H:%M:%S")

    conversation_history.append(
        f"[{timestamp}] {sender}: {message}"
    )


def validate_email(email):

    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'

    return re.match(pattern, email)


def validate_mobile(number):

    number = number.replace(" ", "")

    if number.startswith("+91"):
        number = number[3:]

    return number.isdigit() and len(number) == 10

def capture_lead():

    print("\nBot: Before we continue, I'd like to know a few details.")

    while True:

        name = input("Your Name : ").strip()

        if name:
            break

        print("Bot: Name cannot be empty.")

    while True:

        email = input("Your Email : ").strip()

        if validate_email(email):
            break

        print("Bot: Please enter a valid email address.")

    while True:

        mobile = input("Your Mobile : ").strip()

        if validate_mobile(mobile):
            break

        print("Bot: Please enter a valid mobile number.")

    lead["name"] = name
    lead["email"] = email
    lead["mobile"] = mobile
    lead["captured"] = True

    print(f"\nBot: Thank you, {name}. Let's continue.\n")
    
def send_transcript_to_academy():

    if not lead["captured"]:
        return

    body = f"""
NEW WEBSITE LEAD

--------------------------------------

Name   : {lead['name']}
Email  : {lead['email']}
Mobile : {lead['mobile']}

--------------------------------------

Conversation

{chr(10).join(conversation_history)}
"""
    msg = MIMEText(body)
    msg["Subject"] = f"New Chatbot Lead - {lead['name']}"
    msg["From"] = SMTP_EMAIL
    msg["To"] = ACADEMY_EMAIL

    try:

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()

    except Exception as e:

        print("Email Error:", e)
        
def _build_kb_vocab():

    vocab = set()

    topics = shital_academy_knowledge.get("topics", {})

    for topic_data in topics.values():

        if isinstance(topic_data, dict):

            for phrase in topic_data.get("keywords", []):

                for word in phrase.lower().split():

                    vocab.add(word)

    return vocab


KB_VOCAB = _build_kb_vocab()

# ==========================================================
# NLP HELPER FUNCTIONS
# ==========================================================

def _contains_phrase(message, phrase):
    return re.search(r'\b' + re.escape(phrase) + r'\b', message) is not None

def _correct_typo(word):

    if word in KB_VOCAB or len(word) < MIN_WORD_LEN_FOR_FUZZY:
        return word

    matches = difflib.get_close_matches(
        word,
        KB_VOCAB,
        n=1,
        cutoff=FUZZY_CUTOFF
    )

    return matches[0] if matches else word


def _fuzzy_contains(message, phrase_list, cutoff=FUZZY_CUTOFF):

    if any(_contains_phrase(message, phrase) for phrase in phrase_list):
        return True

    single_word_phrases = [
        p for p in phrase_list
        if " " not in p
    ]

    for word in message.split():

        if len(word) < MIN_WORD_LEN_FOR_FUZZY:
            continue

        if difflib.get_close_matches(
                word,
                single_word_phrases,
                n=1,
                cutoff=cutoff):

            return True

    return False

def greetings(message):

    greet_list = ["hello","hi","hey","howdy","greetings","good morning","good afternoon","good evening",
        "good day","what's up","whats up","how are you","how's it going",
        "how do you do","nice to meet you","welcome",
        "hy","hiya","yo","sup"]

    return _fuzzy_contains(
        message.strip().lower(),
        greet_list
    )
    
def goodbye(message):

    bye_list = ["goodbye","by","bye","bye bye","see you","see you later","see you soon",
        "take care","farewell","good night","later","cheers"]

    return _fuzzy_contains(
        message.strip().lower(),
        bye_list
    )
    
def preprocess(doc):

    best_answer = None
    best_score = 0

    topics_dict = shital_academy_knowledge.get("topics",{})

    candidate_tokens = []

    for token in doc:

        if (
            token.is_punct
            or token.is_digit
            or token.like_num
            or token.is_space
        ):
            continue

        token_text = token.text.lower()
        token_lemma = token.lemma_.lower()

        if (
            token.is_stop
            and token_text not in KB_VOCAB
            and token_lemma not in KB_VOCAB
        ):
            continue

        candidate_tokens.append(

            (
                _correct_typo(token_text),
                _correct_typo(token_lemma)
            )
        )

    for topic_data in topics_dict.values():

        if not isinstance(topic_data, dict):
            continue

        keywords = [
            k.lower()
            for k in topic_data.get(
                "keywords",
                []
            )
        ]

        current_score = 0

        for token_text, token_lemma in candidate_tokens:

            if (
                token_text in keywords
                or token_lemma in keywords
            ):

                current_score += 5

            else:

                for kw in keywords:

                    if (
                        token_text in kw
                        or token_lemma in kw
                        or kw in token_text
                        or kw in token_lemma
                    ):

                        current_score += 3
                        break

        if current_score > best_score:

            best_score = current_score
            best_answer = topic_data["answer"]

    if (
        best_answer
        and best_score >= MIN_SCORE_THRESHOLD
    ):

        return best_answer

    return (
        "Sorry, I didn't understand that. "
        "Can you please rephrase?"
    )
    
# ==========================================================
# MAIN CHAT LOOP
# ==========================================================

def run():

    print("=" * 60)
    print("Bot: Namaste! Welcome to Shital Academy.")
    print("Bot: I'm here to answer your questions.")
    print("Bot: Type 'bye' anytime to exit.")
    print("=" * 60)

    while True:

        question = input("\nYou : ").strip()

        if not question:
            continue

        # Save user message
        save_message("User", question)

        message = question.lower()

        # Goodbye
        if goodbye(message):
            reply = "Goodbye! Thank you for contacting Shital Academy."
            print(f"\nBot: {reply}")
            save_message("Bot", reply)
            send_transcript_to_academy()
            break

        # Greeting
        if greetings(message):
            reply = "Hello! How can I help you today?"
            print(f"\nBot: {reply}")
            save_message("Bot", reply)
            continue

        # Count only real questions
        lead["question_count"] += 1

        # Ask lead details only once
        if (
            lead["question_count"] >= LEAD_CAPTURE_AFTER
            and not lead["captured"]
        ):

            capture_lead()

        
        # NLP Processing
        doc = nlp(question)

        reply = preprocess(doc)

        # If no KB answer, ask Gemini
        if reply == (
            "Sorry, I didn't understand that. "
            "Can you please rephrase?"
        ):
                reply = ask_llm(question)

        print(f"\nBot: {reply}")
        save_message("Bot", reply)
# ==========================================================
# PROGRAM START
# ==========================================================

if __name__ == "__main__":

    try:

        run()

    except KeyboardInterrupt:

        print("\n\nBot: Chat ended.")
        send_transcript_to_academy()

    except Exception as e:

        print("\nUnexpected Error:", e)
        send_transcript_to_academy()
        
