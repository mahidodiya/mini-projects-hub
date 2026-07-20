"""
config.py

Central configuration file for the Smart Warehouse Robot project.
All configurable values are defined here.
"""

# ==========================================================
# Warehouse Configuration
# ==========================================================

GRID_ROWS = 5
GRID_COLS = 5

START_POSITION = (0,0)
PACKAGE_POSITION = (2,2)
DELIVERY_POSITION = (4,4)

OBSTACLES = [
    (0, 3),
    (1, 1),
    (1, 3),
    (3, 0),
    (3, 2),
]

# ==========================================================
# Rewards
# ==========================================================

MOVE_REWARD = -1
INVALID_MOVE_REWARD = -10
OBSTACLE_REWARD = -20
PACKAGE_REWARD = 50
DELIVERY_REWARD = 100

# ==========================================================
# TD(0) Learning Parameters
# ==========================================================

LEARNING_RATE = 0.1      # α
DISCOUNT_FACTOR = 0.9    # γ

# ==========================================================
# Training Configuration
# ==========================================================

EPISODES = 1000
MAX_STEPS_PER_EPISODE = 100

# ==========================================================
# Display Symbols
# ==========================================================

EMPTY = "."
ROBOT = "R"
PACKAGE = "P"
DELIVERY = "D"
OBSTACLE = "X"

# ==========================================================
# Action Space
# ==========================================================

UP = "UP"
DOWN = "DOWN"
LEFT = "LEFT"
RIGHT = "RIGHT"

ACTIONS = [
    UP,
    DOWN,
    LEFT,
    RIGHT,
]

# Change in row and column for each action
ACTION_DELTAS = {
    UP: (-1, 0),
    DOWN: (1, 0),
    LEFT: (0, -1),
    RIGHT: (0, 1),
}