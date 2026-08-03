"""
utils.py

Provides utility functions for console control,
formatting, and reproducibility.
"""

import os
import random

def clear_screen():
    """
    Clear the terminal screen.
    """
    os.system("cls" if os.name == "nt" else "clear")


def print_separator(width=60, character="="):
    """
    Print a horizontal separator.
    """
    print(character * width)


def set_random_seed(seed):
    """
    Set the random seed for reproducible experiments.
    """
    random.seed(seed)
    
import time


def pause(seconds):
    """
    Pause program execution.
    """
    time.sleep(seconds)