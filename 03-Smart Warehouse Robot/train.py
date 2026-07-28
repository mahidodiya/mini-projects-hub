from warehouse import Warehouse
from td_agent import TDAgent
from config import *

def train():
    """
    Train the TD(0) agent.
    """
    warehouse = Warehouse()
    agent = TDAgent()
    episode_rewards = []
    episode_steps = []
    episode_success = []
    
    for episode in range(TRAIN_EPISODES):
        warehouse.reset()
        state = warehouse.get_state()
        done = False
        
        max_steps = MAX_STEPS
        steps = 0
        episode_reward = 0
        
        while not done and steps < max_steps:

            # 1. Observe the current state
            action = agent.choose_action(state, warehouse)

            # 2. Execute the action
            next_state, reward, done = warehouse.move_robot(action)

            # 3. Learn from the experience
            agent.update(state, reward, next_state)
            # update reward
            episode_reward += reward
            
            # 4.Continue from the new state
            state = next_state
            steps += 1
            
        episode_rewards.append(episode_reward)
        episode_steps.append(steps)
        episode_success.append(done)
        
        if (episode + 1) % 100 == 0:
            print(
        f"Episode {episode + 1:4d} | "
        f"Reward: {episode_reward:6d} | "
        f"Steps: {steps:3d} | "
        f"Success: {done}"
        )
    
    return agent, episode_rewards, episode_steps, episode_success