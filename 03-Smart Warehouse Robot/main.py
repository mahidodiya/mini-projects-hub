from warehouse import Warehouse
from config import *


def main():
    warehouse = Warehouse()
    
    print("Initial Warehouse")
    warehouse.display()

    reward = warehouse.move_robot(RIGHT)

    print("\nReward:", reward)
    warehouse.display()

    reward = warehouse.move_robot(DOWN)

    print("\nReward:", reward)
    warehouse.display()
    
if __name__ == "__main__":
    main()