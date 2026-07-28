"""
main.py

Entry point for the Smart Warehouse Robot project.
"""

from train import train
from evaluation import evaluate

def main():
    """
    Train the TD(0) agent and display training statistics.
    """

    # Train the agent
    agent, rewards, steps, success = train()

    # Calculate statistics
    successful_episodes = sum(success)
    total_episodes = len(success)

    average_reward = sum(rewards) / total_episodes
    average_steps = sum(steps) / total_episodes

    # Display training summary
    print("\n" + "=" * 50)
    print("Training Complete")
    print("=" * 50)
    print(f"Total Episodes      : {total_episodes}")
    print(f"Successful Episodes : {successful_episodes}")
    print(f"Success Rate        : {(successful_episodes / total_episodes) * 100:.2f}%")
    print(f"Average Reward      : {average_reward:.2f}")
    print(f"Average Steps       : {average_steps:.2f}")
    print("=" * 50)

    print("\nStarting Evaluation...")
    evaluate(agent)

if __name__ == "__main__":
    main()