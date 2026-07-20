from llm import LLMClient


def main():
    llm = LLMClient()

    response = llm.generate("Say hello in one sentence.")

    print(response)


if __name__ == "__main__":
    main()