import spacy as sa 
# Make sure your knowledge base file is named exactly 'knowledge_base.py'
from knowledge_base import shital_academy_knowledge

nlp = sa.load('en_core_web_sm')

def greetings(message):
    greet_list = ['hello', 'hi', 'hey', 'howdy', 'greetings', 'good morning', 'good afternoon', 'good evening', 'good day', "what's up", 'whats up', 'how are you', "how's it going", 'how do you do', 'nice to meet you', 'welcome', 'hy', 'hiya', 'yo', 'sup']
    if message.strip().lower() in greet_list:
        return True

def goodbye(message):
    bye_list = ['goodbye', 'bye', 'bye bye', 'see you', 'see you later', 'see you soon', 'take care', 'farewell', 'good night', 'later', 'cheers']
    if message.strip().lower() in bye_list:
        return True

def preprocess(doc):
    best_answer = None
    best_score = 0

    # Pull out the inner topics dictionary directly to avoid nesting loop bugs
    topics_dict = shital_academy_knowledge.get('topics', {})

    for key, topic_data in topics_dict.items():
        if isinstance(topic_data, dict) and 'keywords' in topic_data:
            # Clean and lowercase the keywords list once per topic
            keywords = [k.lower() for k in topic_data['keywords']]
            current_topic_score = 0

            # Scan the user's tokens
            for token in doc:
                if token.is_stop or token.is_punct or token.is_digit or token.like_num:
                    continue
                
                token_lemma = token.lemma_.lower()
                token_text = token.text.lower()
                
                # 1. Check for Direct Exact Matches (+5 points)
                if token_lemma in keywords or token_text in keywords:
                    current_topic_score += 5
                
                # 2. Check for Partial Matches (+3 points)
                for kw in keywords:
                    if token_lemma in kw or token_text in kw or kw in token_lemma:
                        current_topic_score += 3
            
            # Check if this topic beat the previous best score
            if current_topic_score > best_score:
                best_score = current_topic_score
                best_answer = topic_data['answer']

    if best_answer and best_score > 0:
        print(f"Bot: {best_answer}")
    else:
        print("Bot: Sorry, I didn't understand that. Can you please rephrase?")

# ===================== MAIN LOOP =====================
print("Bot: Namaste! Shital Academy Assistant is ready. Type 'bye' to exit.")
while True:
    question = input("You : ")
    if not question.strip():
        continue
        
    doc = nlp(question)  
    message = doc.text.strip().lower()
    
    if greetings(message):
        print("Bot: Hello! How can I help you?")
    elif goodbye(message):
        print("Bot: Goodbye, take care!")
        break
    else:
        preprocess(doc)