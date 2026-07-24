from td_agent import TDAgent

agent = TDAgent()

state = ((0, 0), False)
next_state = ((0, 1), False)

print("Before:", agent.value_table[state])

agent.update(
    state,
    reward=-1,
    next_state=next_state,
)

print("After :", agent.value_table[state])