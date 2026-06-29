# 🤖 Shital Academy Virtual Assistant

A lightweight, rule-based conversational assistant engineered to parse incoming student queries and map them to Shital Academy's institutional knowledge base. This project operates entirely offline, avoiding heavy external API wrappers.

---

## ⚙️ Core NLP Pipeline Architecture

The assistant processes text inputs sequentially using **spaCy** to extract maximum structural data from unstructured sentences before running the ranking engine:

```text
User Input ──► Lowercasing ──► Stop-Word & Punctuation Filter ──► Lemmatization ──► Scoring Engine ──► Best Answer Output
