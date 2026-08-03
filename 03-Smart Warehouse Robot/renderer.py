"""
renderer.py

Handles all console rendering for the Smart Warehouse Robot project.
"""

from config import *
from utils import clear_screen

CELL_WIDTH = 10

def get_horizontal_border():
    """
    Create a horizontal border for the grid.
    """
    return "+" + ("-" * CELL_WIDTH + "+") * GRID_COLS

def render_title(title):
    """
    Display a formatted section title.
    """
    width = 60
    print("\n" + "=" * width)
    print(title.center(width))
    print("=" * width)
    
def render_training_summary(
    total_episodes,
    successful_episodes,
    average_reward,
    average_steps
):
    """
    Display training statistics.
    """

    render_title("TRAINING SUMMARY")

    print(f"Total Episodes      : {total_episodes}")
    print(f"Successful Episodes : {successful_episodes}")
    print(f"Success Rate        : {(successful_episodes / total_episodes) * 100:.2f}%")
    print(f"Average Reward      : {average_reward:.2f}")
    print(f"Average Steps       : {average_steps:.2f}")
    
def render_evaluation_summary(
    steps,
    reward,
    success
):
    """
    Display evaluation statistics.
    """
    render_title("EVALUATION SUMMARY")
    print(f"Steps        : {steps}")
    print(f"Total Reward : {reward}")
    print(f"Success      : {success}")
    
def render_warehouse(
    warehouse,
    visited_positions=None,
    show_title=True,
):
    """
    Display the warehouse in a formatted ASCII grid.
    """

    if visited_positions is None:
        visited_positions = set()

    clear_screen()

    if show_title:
        render_title("SMART WAREHOUSE ROBOT")

    border = get_horizontal_border()

    for row in range(GRID_ROWS):

        print(border)

        row_string = "|"

        for col in range(GRID_COLS):

            position = (row, col)

            # Robot
            if position == warehouse.robot_position:
                text = "Robot"

            # Visited path
            elif position in visited_positions:
                text = "o"

            # Start
            elif position == START_POSITION:
                text = "Start"

            # Package
            elif (
                position == PACKAGE_POSITION
                and not warehouse.has_package
            ):
                text = "Package"

            # Delivery
            elif position == DELIVERY_POSITION:
                text = "Delivery"

            # Obstacle
            elif position in OBSTACLES:
                text = "#####"

            # Empty
            else:
                text = "."

            row_string += f"{text:^{CELL_WIDTH}}|"

        print(row_string)

    print(border)
    
def render_status_panel(
    step,
    action,
    reward,
    warehouse,
):
    """
    Display the robot's current status.
    """

    print()

    print(f"Step            : {step}")
    print(f"Action          : {action}")
    print(f"Robot Position  : {warehouse.robot_position}")

    package_status = (
        "YES" if warehouse.has_package else "NO"
    )

    print(f"Package Picked  : {package_status}")

    target = (
        DELIVERY_POSITION
        if warehouse.has_package
        else PACKAGE_POSITION
    )

    print(f"Current Target  : {target}")

    print(f"Total Reward    : {reward}")

    print("-" * 60)
    
def render_value_grid(agent, warehouse, has_package=False):
    """
    Display the learned state-value function as a grid.

    Args:
        agent: The trained TD(0) agent.
        warehouse: Current warehouse environment.
        has_package: Whether to display values for states
                     after the package has been collected.
    """

    title = (
        "STATE VALUES (PACKAGE PICKED)"
        if has_package
        else "STATE VALUES (PACKAGE NOT PICKED)"
    )

    render_title(title)

    border = get_horizontal_border()

    for row in range(GRID_ROWS):

        print(border)

        row_string = "|"

        for col in range(GRID_COLS):

            position = (row, col)

            # Obstacle
            if position in OBSTACLES:
                text = "#####"

            else:
                state = (position, has_package)
                value = agent.value_table[state]

                # Highlight the robot's current state
                if position == warehouse.robot_position:
                    text = f"[{value:.2f}]"
                else:
                    text = f"{value:.2f}"

            row_string += f"{text:^{CELL_WIDTH}}|"

        print(row_string)

    print(border)