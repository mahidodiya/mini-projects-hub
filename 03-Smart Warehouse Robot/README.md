# 🤖 Smart Warehouse Robot using Temporal Difference (TD(0)) Learning

A Reinforcement Learning project where an autonomous warehouse robot learns to navigate a warehouse, collect packages, avoid obstacles, and deliver items efficiently using **Temporal Difference (TD(0)) Learning**.

---

# 📖 Overview

Modern warehouses rely on autonomous robots to transport goods efficiently while minimizing travel time and avoiding collisions. Traditional path-planning algorithms require complete knowledge of the environment, but reinforcement learning enables a robot to **learn optimal navigation through experience**.

In this project, a robot explores a warehouse represented as a grid world. Through repeated interactions with the environment, it gradually learns which locations are more valuable, allowing it to make better navigation decisions over time.

The learning process is based on the **Temporal Difference (TD(0)) algorithm**, one of the fundamental methods in Reinforcement Learning.

---

# 🎯 Project Objectives

* Build a custom warehouse simulation environment.
* Implement Temporal Difference (TD(0)) Learning from scratch.
* Train an autonomous robot through trial and error.
* Learn an optimal navigation strategy using state-value estimation.
* Visualize the robot's learning progress.
* Create a clean, modular, and extensible Reinforcement Learning project.

---

# 🏭 Problem Statement

The warehouse consists of:

* **Start Position** – Robot's initial location.
* **Package Location** – The item that must be collected.
* **Delivery Location** – Destination where the package is delivered.
* **Obstacles** – Areas the robot cannot pass through.
* **Empty Cells** – Free movement spaces.

The robot has no prior knowledge of the warehouse layout. It initially explores randomly and gradually improves its navigation strategy by learning from rewards received after each action.

---

# 🧠 Reinforcement Learning Concepts

This project demonstrates several core Reinforcement Learning concepts:

* Agent
* Environment
* State
* Action
* Reward
* Policy
* State Value Function
* Temporal Difference Learning
* Bellman Equation
* Discount Factor
* Learning Rate
* Exploration vs. Exploitation

---

# 🗺️ Warehouse Environment

Example warehouse layout:

```text
+---+---+---+---+---+
| R |   |   | X |   |
+---+---+---+---+---+
|   | X |   | X |   |
+---+---+---+---+---+
|   |   | P |   |   |
+---+---+---+---+---+
| X |   | X |   |   |
+---+---+---+---+---+
|   |   |   |   | D |
+---+---+---+---+---+
```

Legend:

* **R** → Robot
* **P** → Package
* **D** → Delivery Point
* **X** → Obstacle

---

# 🎮 State Space

Each grid cell represents a state.

Example states:

```text
(0,0)
(0,1)
(2,3)
(4,4)
```

Total number of states:

```text
Rows × Columns
```

---

# 🎯 Action Space

The robot can perform four actions:

* ⬆️ Up
* ⬇️ Down
* ⬅️ Left
* ➡️ Right

---

# 🏆 Reward System

| Event           | Reward |
| --------------- | ------ |
| Normal movement | -1     |
| Invalid move    | -10    |
| Hit obstacle    | -20    |
| Reach package   | +50    |
| Deliver package | +100   |

This reward structure encourages the robot to:

* Reach the package quickly.
* Avoid unnecessary movement.
* Avoid obstacles.
* Deliver the package efficiently.

---

# 📚 Temporal Difference (TD(0))

The value of a state is updated after every interaction with the environment using:

[
V(s) \leftarrow V(s) + \alpha \left[r + \gamma V(s') - V(s)\right]
]

where:

* **V(s)** = Current state value
* **α** = Learning rate
* **γ** = Discount factor
* **r** = Immediate reward
* **V(s')** = Estimated value of the next state

The quantity:

[
r + \gamma V(s') - V(s)
]

is called the **Temporal Difference (TD) Error**.

---

# 🔄 Training Process

The robot repeatedly interacts with the warehouse environment.

1. Start a new episode.
2. Place the robot at the starting position.
3. Select an action.
4. Move to the next state.
5. Receive a reward.
6. Update the state-value estimate using TD(0).
7. Repeat until the package is delivered or the episode ends.

After many episodes, the learned value function guides the robot toward more efficient routes.

---

# 📈 Expected Results

After training, the robot should:

* Learn shorter paths.
* Reduce unnecessary exploration.
* Avoid obstacles.
* Maximize cumulative reward.
* Navigate efficiently from start to package and then to the delivery location.

Training metrics may include:

* Episode reward
* Steps per episode
* Learning curve
* State-value heatmap

---

# 📁 Project Structure

```text
Smart-Warehouse-Robot/
│
├── assets/                 # Images and icons
├── models/                 # Saved value tables
├── outputs/                # Graphs and results
│
├── config.py               # Configuration values
├── warehouse.py            # Environment
├── robot.py                # Robot behavior
├── td_agent.py             # TD(0) learning agent
├── train.py                # Training loop
├── main.py                 # Application entry point
├── utils.py                # Helper functions
│
├── requirements.txt
├── README.md
└── LICENSE
```

---

# 🛠️ Technologies Used

* Python 3
* NumPy
* Matplotlib
* Pygame

---

# 🚀 Future Improvements

* Multiple packages.
* Dynamic obstacles.
* Battery management.
* Charging stations.
* Multiple robots.
* Priority-based task scheduling.
* Upgrade to SARSA.
* Upgrade to Q-Learning.
* Upgrade to Deep Q-Networks (DQN).
* Interactive warehouse editor.
* 3D warehouse visualization.

---

# 🎓 Learning Outcomes

By completing this project, you will gain practical experience with:

* Reinforcement Learning fundamentals
* Temporal Difference Learning
* Markov Decision Processes
* Environment design
* Reward engineering
* Simulation development
* Object-Oriented Programming in Python
* Data visualization
* Algorithm evaluation

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**MAHI DODIYA**

AI / Machine Learning Developer

Building practical AI solutions through hands-on projects and continuous learning.
