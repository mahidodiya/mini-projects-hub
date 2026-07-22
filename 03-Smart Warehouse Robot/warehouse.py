"""
warehouse.py
Defines the warehouse environment where the robot learns to navigate.
"""

from config import *

class Warehouse:
    """Represents the warehouse grid environment."""
    
    def __init__(self):
        """Initialize the warehouse."""
        self.grid = []
        # Current robot position
        self.robot_position = START_POSITION
        # Whether the robot has picked up the package
        self.has_package = False
        self.reset()
        
    def create_grid(self):
        """Create an empty warehouse grid."""
        
        self.grid = [
            [EMPTY for _ in range(GRID_ROWS)]
            for _ in range(GRID_COLS)
        ]
        
    def place_object(self, position, symbol):
        """Place an object on the grid."""
        
        row , col = position
        self.grid[row][col] = symbol
        
    def initialize_environment(self):
        """Place all objects in the warehouse.""" 
        
        self.place_object(PACKAGE_POSITION, PACKAGE)
        self.place_object(DELIVERY_POSITION, DELIVERY)
        
        for obstacle in  OBSTACLES:
            self.place_object(obstacle, OBSTACLE)
            
    
    def display(self):
        """Display the warehouse."""

        for row in range(GRID_ROWS):

            display_row = []

            for col in range(GRID_COLS):

                if (row, col) == self.robot_position:
                    display_row.append(ROBOT)
                else:
                    display_row.append(self.grid[row][col])

            print(" ".join(display_row))
            
    def reset(self):
        """Reset the warehouse to its initial state."""

        self.robot_position = START_POSITION
        self.has_package = False

        self.create_grid()
        self.initialize_environment()
        
    def is_valid_position(self, row , col):
        #Check whether a position is valid.
    
        # Check grid boundaries
        if row < 0 or row >= GRID_ROWS:
            return False
        if col < 0 or col >= GRID_COLS:
            return False
        
        # Check Obstacle
        if (row , col) in OBSTACLES:
            return False
        
        return True
    
    def move_robot(self , action):
        #Move the robot in the given direction.

            row , col = self.robot_position
            dr , dc = ACTION_DELTAS[action]
            
            new_row = row + dr
            new_col = col + dc
            
            if not self.is_valid_position(new_row, new_col):
                return self.get_state(), INVALID_MOVE_REWARD, self.is_terminal()
            
            #Update robot position
            self.robot_position = (new_row , new_col)
        
            reward = self.get_reward()
            done = self.is_terminal()
            next_state = self.get_state()

            return next_state, reward, done
            
    def get_reward(self):
            """
            Calculate the reward based on the robot's current state.
            """
            # Robot reaches the package
            if self.robot_position == PACKAGE_POSITION and not self.has_package:
                self.has_package = True
                return PACKAGE_REWARD
        
            #Robot delivers the package
            if(
                self.robot_position == DELIVERY_POSITION and
                self.has_package
            
            ):
                return DELIVERY_REWARD
    
            # Normal movement
            return MOVE_REWARD
    
    def is_terminal(self):
        """
        Check whether the current episode has finished.
        """

        return (
            self.has_package
            and self.robot_position == DELIVERY_POSITION
            )
        
    def get_state(self):
        """
        Return the current state of the environment.
        """

        return (
            self.robot_position,
            self.has_package
        )
    