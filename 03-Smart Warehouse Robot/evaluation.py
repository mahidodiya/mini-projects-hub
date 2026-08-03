"""
evaluation.py

Evaluate the trained TD(0) agent.
"""

from warehouse import Warehouse
from renderer import (
    render_warehouse,
    render_status_panel,
    render_evaluation_summary,
    render_value_grid,
)
from utils import pause
from config import *


def evaluate(agent):
    """
    Evaluate the trained TD(0) agent.
    """

    warehouse = Warehouse()
    warehouse.reset()

    state = warehouse.get_state()
    done = False

    steps = 0
    total_reward = 0

    path = [state]
    visited_states = {state}
    visited_positions = {
    warehouse.robot_position
}

    while not done and steps < MAX_STEPS:

        # Choose the best action
        action = choose_evaluation_action(
            agent,
            warehouse,
            state,
            visited_states,
        )

        # Execute action
        next_state, reward, done = warehouse.move_robot(action)

        # Update statistics
        total_reward += reward
        steps += 1

        # Store path
        path.append(next_state)
        visited_states.add(next_state)
        visited_positions.add(
        warehouse.robot_position
)
        # Animate
        render_warehouse(
        warehouse,
        visited_positions=visited_positions,
)

        render_status_panel(
            step=steps,
            action=action,
            reward=total_reward,
            warehouse=warehouse,
        )
        render_value_grid(
            agent,
            warehouse,
            has_package=warehouse.has_package,
        )
        pause(ANIMATION_DELAY)

        # Continue
        state = next_state

    # Final Summary
    render_evaluation_summary(
        steps=steps,
        reward=total_reward,
        success=done,
    )
    

def choose_evaluation_action(agent, warehouse, state, visited_states):
    """
    Choose the best action during evaluation.

    Preference:
    1. Highest-value unvisited state.
    2. If all next states were visited,
       choose the highest-value state.
    """

    valid_actions = warehouse.get_valid_actions(state)

    unvisited = []
    visited = []
    

    for action in valid_actions:

        next_state = warehouse.get_next_state(state, action)

        if next_state in visited_states:
            visited.append((action, next_state))
        else:
            unvisited.append((action, next_state))

    candidates = unvisited if unvisited else visited

    best_action = None
    best_value = float("-inf")

    for action, next_state in candidates:

        value = agent.value_table[next_state]

        if value > best_value:
            best_value = value
            best_action = action

    return best_action