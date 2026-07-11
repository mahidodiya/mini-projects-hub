# Debate Simulator – Development Roadmap

## Goal

Build a fun, interactive multi-agent Debate Simulator using **CrewAI** and a free LLM (Google Gemini). The project will demonstrate how multiple AI agents collaborate, respond to one another, and produce a complete debate with a final judgment.

---

# Phase 1 — Environment Setup

## Objectives

* Create the project structure.
* Set up a Python virtual environment.
* Install dependencies.
* Configure the Gemini API key.
* Prepare the project for development.

## Project Structure

```text
debate-simulator/
│
├── app.py
├── config.py
├── agents.py
├── tasks.py
├── crew.py
├── .env
├── requirements.txt
├── README.md
│
└── outputs/
```

## Tasks

* Create the project directory.
* Create and activate a virtual environment.
* Install:

  * `crewai`
  * `python-dotenv`
* Save dependencies to `requirements.txt`.
* Create a `.env` file containing the Gemini API key.

---

# Phase 2 — LLM Configuration

## Objectives

Create a centralized configuration file responsible for connecting the application to Gemini.

## Responsibilities

* Load environment variables.
* Configure the Gemini model.
* Expose the configured model to the rest of the application.

The rest of the project should never communicate with Gemini directly. Every agent will use the model defined in `config.py`.

---

# Phase 3 — Agent Creation

Create three specialized AI agents.

## Moderator Agent

### Role

Elite Oxford Debate Moderator

### Personality

* Calm
* Neutral
* Professional
* Strict
* Keeps debates organized

### Responsibilities

* Introduce the debate.
* Explain the rules.
* Keep both sides on topic.
* Deliver the final summary.

---

## Pro-Side Agent

### Role

Expert Advocate

### Personality

A dramatic Shakespearean actor.

### Characteristics

* Passionate
* Poetic
* Uses metaphors
* Speaks dramatically
* Never admits defeat
* Always defends the assigned position

---

## Con-Side Agent

### Role

Critical Challenger

### Personality

Corporate executive.

### Characteristics

* Logical
* Analytical
* Data-driven
* Slightly sarcastic
* Focuses on evidence
* Challenges every claim

---

# Phase 4 — Task Design

Each task belongs to a single agent.

## Task 1

Moderator introduces the debate.

Output:

* Topic
* Rules
* Opening statement

---

## Task 2

Pro agent delivers the opening argument.

Output:

* Initial defense of the topic

---

## Task 3

Con agent responds to the Pro agent.

Output:

* Counterarguments
* Rebuttals

---

## Task 4

Pro agent responds to the Con agent.

Output:

* Defense
* Counter-rebuttal

---

## Task 5

Con agent gives the final response.

Output:

* Final rebuttal

---

## Task 6

Moderator evaluates the debate.

Output:

* Winner
* Scores
* Explanation
* Final summary

---

# Phase 5 — Crew Assembly

Create a CrewAI workflow that executes tasks sequentially.

Workflow:

```
Moderator
        ↓
Pro Opening
        ↓
Con Rebuttal
        ↓
Pro Final
        ↓
Con Final
        ↓
Moderator Verdict
```

Each task receives the previous task's output as context, allowing the debate to evolve naturally.

---

# Phase 6 — Running the Application

The application should:

1. Ask the user for a debate topic.
2. Execute the CrewAI workflow.
3. Display the debate in the terminal.
4. Save the complete transcript to `outputs/debate.txt`.

Example topics:

* Should AI replace teachers?
* Cats vs Dogs
* Coffee vs Tea
* Marvel vs DC
* Is pineapple good on pizza?

---

# Future Enhancements

After completing the MVP, additional features may include:

* Random AI personalities (Pirate, Lawyer, Professor, Comedian, Philosopher)
* Debate scorecards
* Multiple debate rounds
* Streamlit web interface
* Text-to-speech voices for each agent
* Support for multiple LLM providers
* Debate history
* Export debates as PDF or Markdown

---

# Development Philosophy

* Build one feature at a time.
* Understand every line of code before moving forward.
* Keep modules focused on a single responsibility.
* Prefer clean architecture over quick hacks.
* Make the project easy to extend and maintain.

---

# Final Architecture

```
             app.py
                │
                ▼
            crew.py
                │
       ┌────────┴────────┐
       ▼                 ▼
  agents.py         tasks.py
       │                 │
       └────────┬────────┘
                ▼
           config.py
                │
                ▼
          Google Gemini
```

## Responsibilities

* **config.py** – Loads environment variables and configures the Gemini model.
* **agents.py** – Defines the Moderator, Pro, and Con agents.
* **tasks.py** – Defines each debate task.
* **crew.py** – Assembles the agents and tasks into a sequential CrewAI workflow.
* **app.py** – Collects the debate topic, starts the crew, displays the results, and saves the transcript.
