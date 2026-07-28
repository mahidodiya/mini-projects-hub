"""
evaluation.py
Evaluate the trained TD(0) agent.
"""
from warehouse import Warehouse
from config import *

def evaluate(agent):
    #Evaluate the trained agent.
    warehouse = Warehouse()
    warehouse.reset()
    
    state = warehouse.get_state()
    done = False
    steps = 0
    total_reward = 0
    path = [state]
    
    while not done and steps < MAX_STEPS:
        # Choose the best learned action
        action = agent.choose_best_action(state, warehouse)

        # Execute the action
        next_state, reward, done = warehouse.move_robot(action)

        # Update statistics
        total_reward += reward
        steps += 1

        # Save the visited state
        path.append(next_state)

        # Continue from the new state
        state = next_state
        
    print("\nEvaluation Complete")
    print("-" * 40)

    print(f"Steps        : {steps}")
    print(f"Total Reward : {total_reward}")
    print(f"Success      : {done}")
    
    print("\nRobot Path:")

    for state in path:
        print(state)