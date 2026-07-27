from warehouse import Warehouse
from td_agent import TDAgent

def train():
    """
    Train the TD(0) agent.
    """
    warehouse = Warehouse()
    agent = TDAgent()
    
    for episode in range(10):
        warehouse.reset()
        state = warehouse.get_state()
        done = False
        max_steps = 100
        steps = 0
        
        while not done and steps < max_steps:

            # 1. Observe the current state
            action = agent.choose_action(state, warehouse)

            # 2. Execute the action
            next_state, reward, done = warehouse.move_robot(action)

            # 3. Learn from the experience
            agent.update(state, reward, next_state)

            # 4. Continue from the new state
            state = next_state
            steps += 1