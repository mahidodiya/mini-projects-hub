"""
main.py

Entry point for the Smart Warehouse Robot project.
"""

from train import train
from evaluation import evaluate
from renderer import (
    render_title,
    render_training_summary,
)

def main():
    """
    Train the TD(0) agent and display training statistics.
    """
    render_title("SMART WAREHOUSE ROBOT USING TD(0)")
    # Train the agent
    agent, rewards, steps, success = train()

    # Calculate statistics
    successful_episodes = sum(success)
    total_episodes = len(success)

    average_reward = sum(rewards) / total_episodes
    average_steps = sum(steps) / total_episodes

    # Display training summary
    render_training_summary(
    total_episodes,
    successful_episodes,
    average_reward,
    average_steps,
)

    print("\nStarting Evaluation...")
    evaluate(agent)
    

if __name__ == "__main__":
    main()