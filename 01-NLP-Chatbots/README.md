# 🧠 NLP Chatbots Portfolio

A collection of lightweight, local conversational engines focusing on custom intent matching, rule-based pipelines, and text preprocessing.

## 🚀 Featured Project: Shital Academy Assistant

An intelligent FAQ retrieval system that parses incoming student queries and maps them to institutional knowledge without relying on external cloud APIs.

### 🛠️ Key Technical Features
*   **Noise Reduction Pipeline:** Automatically strips out grammatical stop-words (`is`, `the`, `at`), punctuation, and random numerical noise.
*   **Morphological Normalization (Lemmatization):** Uses **spaCy** to extract word roots (e.g., converting "classes" to "class" or "teaching" to "teach") to improve match rates.
*   **Multi-Tiered Scoring Engine:** A custom mathematical ranker that combines exact string logic (+5 points) and substring boundary partial matches (+3 points) to locate the best context block.

### 💻 Quick Local Run

Ensure you have your environment set up and the small English language model downloaded before launching:
