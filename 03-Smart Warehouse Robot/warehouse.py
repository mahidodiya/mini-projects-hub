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
        self.create_grid()
        
    def create_grid(self):
        """Create an empty warehouse grid."""
        
        self.grid = [
            [EMPTY for _ in range(GRID_ROWS)]
            for _ in range(GRID_COLS)
        ]
        
        