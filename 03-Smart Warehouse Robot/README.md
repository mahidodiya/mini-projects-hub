# Smart Warehouse Robot using TD(0) Reinforcement Learning

A Python-based Reinforcement Learning project where an autonomous warehouse robot learns to pick up a package and deliver it to the destination using the **Temporal Difference (TD(0))** learning algorithm.

The project demonstrates how an intelligent agent improves its decisions through interaction with the environment instead of following a predefined path.

---

## Project Overview

Modern warehouses rely on autonomous robots to transport goods efficiently. This project simulates a warehouse environment where a robot must:

* Navigate a 5 × 5 warehouse grid
* Avoid obstacles
* Locate and collect a package
* Deliver the package to the delivery zone
* Learn better state values using the TD(0) algorithm

Instead of hardcoding the robot's route, the robot learns by repeatedly interacting with the environment and updating its value estimates.

---

# Features

* 5 × 5 warehouse simulation
* Obstacle avoidance
* Package pickup system
* Delivery system
* TD(0) Reinforcement Learning
* Epsilon-Greedy action selection
* State-value learning
* Console-based warehouse visualization
* Robot movement animation
* Training statistics
* Evaluation mode
* State-value grid visualization

---

# Project Structure

```text
Smart Warehouse Robot/
│
├── main.py              # Entry point
├── config.py            # Project configuration
├── warehouse.py         # Warehouse environment
├── td_agent.py          # TD(0) learning agent
├── train.py             # Training loop
├── evaluation.py        # Agent evaluation
├── renderer.py          # Console rendering
├── utils.py             # Helper functions
└── README.md
```

---

# How TD(0) Works

The robot estimates the value of each state using the TD(0) update equation:

```text
V(s) ← V(s) + α [R + γV(s') − V(s)]
```

Where:

* **V(s)** = Current value of the state
* **α** = Learning rate
* **γ** = Discount factor
* **R** = Immediate reward
* **V(s')** = Value of the next state

During training, the robot continuously updates these values after every move, allowing it to improve its navigation policy over time.

---

# Reward System

| Event           | Reward |
| --------------- | -----: |
| Normal Move     |     -1 |
| Invalid Move    |    -10 |
| Pick Up Package |    +50 |
| Deliver Package |   +100 |

---

# Technologies Used

* Python 3
* Reinforcement Learning
* TD(0) Algorithm
* Object-Oriented Programming (OOP)

---

# How to Run

Clone the repository:

```bash
git clone https://github.com/your-username/smart-warehouse-robot.git
```

Move into the project folder:

```bash
cd smart-warehouse-robot
```

Run the project:

```bash
python main.py
```

---

# Sample Output

During evaluation, the program displays:

* Warehouse layout
* Robot movement animation
* Current robot status
* State-value grid
* Evaluation summary

Example:

```text
Step            : 10
Action          : RIGHT
Robot Position  : (4, 4)
Package Picked  : YES
Current Target  : (4, 4)
Total Reward    : 142

Evaluation Summary
------------------
Steps        : 10
Reward       : 142
Success      : True
```

---

# Future Improvements

* Q-Learning implementation
* SARSA implementation
* Larger warehouse environments
* Multiple packages
* Dynamic obstacles
* Graphical user interface (GUI)
* Real-time visualization
* Path optimization

---

# Learning Outcomes

This project helped reinforce concepts such as:

* Reinforcement Learning fundamentals
* Temporal Difference Learning (TD(0))
* State-value estimation
* Exploration vs. exploitation
* Environment modelling
* Object-Oriented Programming in Python
* Console-based visualization

---

# Author

**Mahi Dodiya**

Government Engineering College, Bhavnagar

Information Technology Department

---

# License

This project is created for educational and learning purposes.
