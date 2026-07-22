from td_agent import TDAgent


def main():
    agent = TDAgent()

    print(agent.value_table)


if __name__ == "__main__":
    main()