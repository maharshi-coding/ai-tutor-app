# Thought: Internal Reasoning and the ReAct Approach

Source: Hugging Face Agents Course
Original URL: https://github.com/huggingface/agents-course/blob/HEAD/units/en/unit1/thoughts.mdx
Original Path: units/en/unit1/thoughts.mdx
Course: Artificial Intelligence

# Thought: Internal Reasoning and the ReAct Approach

> [!TIP]
> In this section, we dive into the inner workings of an AI agent—its ability to reason and plan. We’ll explore how the agent leverages its internal dialogue to analyze information, break down complex problems into manageable steps, and decide what action to take next.
>
> Additionally, we introduce the ReAct approach, a prompting technique that encourages the model to think “step by step” before acting.

Thoughts represent the **Agent's internal reasoning and planning processes** to solve the task.

This utilises the agent's Large Language Model (LLM) capacity **to analyze information when presented in its prompt** — essentially, its inner monologue as it works through a problem.

The Agent's thoughts help it assess current observations and decide what the next action(s) should be. Through this process, the agent can **break down complex problems into smaller, more manageable steps**, reflect on past experiences, and continuously adjust its plans based on new information.

## 🧠 Examples of Common Thought Types

| Type of Thought | Example |
| Planning | "I need to break this task into three steps: 1) gather data, 2) analyze trends, 3) generate report" |
| Analysis | "Based on the error message, the issue appears to be with the database connection parameters" |
| Decision Making | "Given the user's budget constraints, I should recommend the mid-tier option" |
| Problem Solving | "To optimize this code, I should first profile it to identify bottlenecks" |
| Memory Integration | "The user mentioned their preference for Python earlier, so I'll provide examples in Python" |
| Self-Reflection | "My last approach didn't work well, I should try a different strategy" |
| Goal Setting | "To complete this task, I need to first establish the acceptance criteria" |
| Prioritization | "The security vulnerability should be addressed before adding new features" |

> **Note:** In the case of LLMs fine-tuned for function-calling, the thought process is optional. More details will be covered in the Actions section.

## 🔗 Chain-of-Thought (CoT)

**Chain-of-Thought (CoT)** is a prompting technique that guides a model to **think through a problem step-by-step before producing a final answer.**

It typically starts with:
> *"Let's think step by step."*

This approach helps the model **reason internally**, especially for logical or mathematical tasks, **without interacting with external tools**.

### ✅ Example (CoT)
```
Question: What is 15% of 200?
Thought: Let's think step by step. 10% of 200 is 20, and 5% of 200 is 10, so 15% is 30.
Answer: 30
```

## ⚙️ ReAct: Reasoning + Acting

A key method is the **ReAct approach**, which combines "Reasoning" (Think) with "Acting" (Act).

ReAct is a prompting technique that encourages the model to think step-by-step and interleave actions (like using tools) between reasoning steps.

This enables the agent to solve complex multi-step tasks by alternating between:
- Thought: internal reasoning
- Action: tool usage
- Observation: receiving tool output

### 🔄 Example (ReAct)
```
Thought: I need to find the latest weather in Paris.
Action: Search["weather in Paris"]
Observation: It's 18°C and cloudy.
Thought: Now that I know the weather...
Action: Finish["It's 18°C and cloudy in Paris."]
```

<figure>
<img src="https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/ReAct.png" alt="ReAct"/>
<figcaption>
(d) is an example of the ReAct approach, where we prompt "Let's think step by step", and the model acts between thoughts.
</figcaption>
</figure>

## 🔁 Comparison: ReAct vs. CoT

| Feature | Chain-of-Thought (CoT) | ReAct |
| Step-by-step logic | ✅ Yes | ✅ Yes |
| External tools | ❌ No | ✅ Yes (Actions + Observations) |
| Best suited for | Logic, math, internal tasks | Info-seeking, dynamic multi-step tasks |

> [!TIP]
> Recent models like **Deepseek R1** or **OpenAI’s o1** were fine-tuned to *think before answering*. They use structured tokens like `<think>` and `</think>` to explicitly separate the reasoning phase from the final answer.
>
> Unlike ReAct or CoT — which are prompting strategies — this is a **training-level technique**, where the model learns to think via examples.
