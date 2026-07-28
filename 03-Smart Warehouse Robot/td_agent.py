from config import *
import random 

class TDAgent:
    """
    Temporal Difference (TD(0)) Learning Agent.
    """
    
    def __init__(self):
         """Initialize the TD agent."""
         
         self.value_table = {}
         self.initialize_value_table()
         
    def initialize_value_table(self):
        """
        Initialize the value table for all valid states.
        """
        
        for row in range(GRID_ROWS):
            for col in range(GRID_COLS):
                
                if (row,col) in OBSTACLES:
                    continue
                state_without_package = ((row,col),False)
                state_with_package = ((row,col),True)
                
                self.value_table[state_without_package] = 0.0
                self.value_table[state_with_package] = 0.0
                
    def choose_action(self , state , warehouse):
        """
        Choose an action using the epsilon(e)-greedy policy.
        """
        
        # Exploration
        explore = random.random() < EPSILON

        if explore:
            return random.choice(ACTIONS)
        
        # Exploitation
        best_action = None
        best_value = float("-inf")
        
        for action in ACTIONS:
            
            next_state = warehouse.get_next_state(state, action)
            value = self.value_table[next_state]
            
            if value > best_value:
                best_value = value
                best_action = action
            
        return best_action
    
    def update(self, state, reward, next_state):
        """
        Update the state value using TD(0).
        """
        current_value = self.value_table[state]
        next_value = self.value_table[next_state]
        
        td_target = reward + DISCOUNT_FACTOR * next_value
        
        td_error = td_target - current_value 
        
        self.value_table[state] = (
            current_value + LEARNING_RATE * td_error
        )
        
        
        
                                   