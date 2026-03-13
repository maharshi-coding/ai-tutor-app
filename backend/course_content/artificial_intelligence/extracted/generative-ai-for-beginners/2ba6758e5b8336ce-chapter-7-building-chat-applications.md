# Chapter 7: Building Chat Applications

Source: Generative AI for Beginners
Original URL: https://github.com/microsoft/generative-ai-for-beginners/blob/HEAD/07-building-chat-applications/python/oai-assignment.ipynb
Original Path: 07-building-chat-applications/python/oai-assignment.ipynb
Course: Artificial Intelligence

# Chapter 7: Building Chat Applications
## OpenAI API Quickstart

This notebook is adapted from the [Azure OpenAI Samples Repository](https://github.com/Azure/azure-openai-samples?WT.mc_id=academic-105485-koreyst) that includes notebooks that access [Azure OpenAI](notebook-azure-openai.ipynb) services.

The Python OpenAI API works with Azure OpenAI Models as well, with a few modifications. Learn more about the differences here: [How to switch between OpenAI and Azure OpenAI endpoints with Python](https://learn.microsoft.com/azure/ai-services/openai/how-to/switching-endpoints?WT.mc_id=academic-109527-jasmineg)

# Overview
"Large language models are functions that map text to text. Given an input string of text, a large language model tries to predict the text that will come next"(1). This "quickstart" notebook will introduce users to high-level LLM concepts, core package requirements for getting started with AML, a soft introduction to prompt design, and several short examples of different use cases.

## Table of Contents

[Overview](#overview)
[How to use OpenAI Service](#how-to-use-openai-service)
[1. Creating your OpenAI Service](#1.-creating-your-openai-service)
[2. Installation](#2.-installation)
[3. Credentials](#3.-credentials)

[Use Cases](#use-cases)
[1. Summarize Text](#1.-summarize-text)
[2. Classify Text](#2.-classify-text)
[3. Generate New Product Names](#3.-generate-new-product-names)
[4. Fine Tune a Classifier](#4.fine-tune-a-classifier)

[References](#references)

### Build your first prompt
This short exercise will provide a basic introduction for submitting prompts to an OpenAI model for a simple task "summarization".

**Steps**:
1. Install OpenAI library in your python environment
2. Load standard helper libraries and set your typical OpenAI security credentials for the OpenAI Service that you've created
3. Choose a model for your task
4. Create a simple prompt for the model
5. Submit your request to the model API!

### 1. Install OpenAI

```python
%pip install openai python-dotenv
```

### 2. Import helper libraries and instantiate credentials

```python
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY","")
assert API_KEY, "ERROR: OpenAI Key is missing"

client = OpenAI(
api_key=API_KEY
)
```

### 3. Finding the right model
The GPT-3.5-turbo or GPT-4 models can understand and generate natural language.

```python
# Select the General Purpose curie model for text
model = "gpt-3.5-turbo"
```

## 4. Prompt Design

"The magic of large language models is that by being trained to minimize this prediction error over vast quantities of text, the models end up learning concepts useful for these predictions. For example, they learn concepts like"(1):

* how to spell
* how grammar works
* how to paraphrase
* how to answer questions
* how to hold a conversation
* how to write in many languages
* how to code
* etc.

#### How to control a large language model
"Of all the inputs to a large language model, by far the most influential is the text prompt(1).

Large language models can be prompted to produce output in a few ways:

Instruction: Tell the model what you want
Completion: Induce the model to complete the beginning of what you want
Demonstration: Show the model what you want, with either:
A few examples in the prompt
Many hundreds or thousands of examples in a fine-tuning training dataset"

#### There are three basic guidelines to creating prompts:

**Show and tell**. Make it clear what you want either through instructions, examples, or a combination of the two. If you want the model to rank a list of items in alphabetical order or to classify a paragraph by sentiment, show it that's what you want.

**Provide quality data**. If you're trying to build a classifier or get the model to follow a pattern, make sure that there are enough examples. Be sure to proofread your examples — the model is usually smart enough to see through basic spelling mistakes and give you a response, but it also might assume this is intentional and it can affect the response.

**Check your settings.** The temperature and top_p settings control how deterministic the model is in generating a response. If you're asking it for a response where there's only one right answer, then you'd want to set these lower. If you're looking for more diverse responses, then you might want to set them higher. The number one mistake people make with these settings is assuming that they're "cleverness" or "creativity" controls.

Source: https://learn.microsoft.com/azure/ai-services/openai/overview

### 5. Submit!

```python
# Create your first prompt
text_prompt = "Should oxford commas always be used?"

response = client.chat.completions.create(
model=model,
messages = [{"role":"system", "content":"You are a helpful assistant."},
{"role":"user","content":text_prompt},])

response.choices[0].message.content
```

### Repeat the same call, how do the results compare?

```python
response = client.chat.completions.create(
model=model,
messages = [{"role":"system", "content":"You are a helpful assistant."},
{"role":"user","content":text_prompt},])

response.choices[0].message.content
```

## Summarize Text
#### Challenge
Summarize text by adding a 'tl;dr:' to the end of a text passage. Notice how the model understands how to perform a number of tasks with no additional instructions. You can experiment with more descriptive prompts than tl;dr to modify the model’s behavior and customize the summarization you receive(3).

Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. By contrast, humans can generally perform a new language task from only a few examples or from simple instructions - something that current NLP systems still largely struggle to do. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches.

Tl;dr

# Exercises for several use cases
1. Summarize Text
2. Classify Text
3. Generate New Product Names

```python
prompt = "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. By contrast, humans can generally perform a new language task from only a few examples or from simple instructions - something that current NLP systems still largely struggle to do. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches.\n\nTl;dr"
```

```python
#Setting a few additional, typical parameters during API Call

response = client.chat.completions.create(
model=model,
messages = [{"role":"system", "content":"You are a helpful assistant."},
{"role":"user","content":prompt},])

response.choices[0].message.content
```

## Classify Text
#### Challenge
Classify items into categories provided at inference time. In the following example, we provide both the categories and the text to classify in the prompt(*playground_reference).

Customer Inquiry: Hello, one of the keys on my laptop keyboard broke recently and I'll need a replacement:

Classified category:

```python
prompt = "Classify the following inquiry into one of the following: categories: [Pricing, Hardware Support, Software Support]\n\ninquiry: Hello, one of the keys on my laptop keyboard broke recently and I'll need a replacement:\n\nClassified category:"
print(prompt)
```

```python
#Setting a few additional, typical parameters during API Call

response = client.chat.completions.create(
model=model,
messages = [{"role":"system", "content":"You are a helpful assistant."},
{"role":"user","content":prompt},])

response.choices[0].message.content
```

## Generate New Product Names
#### Challenge
Create product names from examples words. Here we include in the prompt information about the product we are going to generate names for. We also provide a similar example to show the pattern we wish to receive. We have also set the temperature value high to increase randomness and more innovative responses.

Product description: A home milkshake maker
Seed words: fast, healthy, compact.
Product names: HomeShaker, Fit Shaker, QuickShake, Shake Maker

Product description: A pair of shoes that can fit any foot size.
Seed words: adaptable, fit, omni-fit.

```python
prompt = "Product description: A home milkshake maker\nSeed words: fast, healthy, compact.\nProduct names: HomeShaker, Fit Shaker, QuickShake, Shake Maker\n\nProduct description: A pair of shoes that can fit any foot size.\nSeed words: adaptable, fit, omni-fit."

print(prompt)
```

```python
#Setting a few additional, typical parameters during API Call

response = client.chat.completions.create(
model=model,
messages = [{"role":"system", "content":"You are a helpful assistant."},
{"role":"user","content":prompt}])

response.choices[0].message.content
```

# References
- [Openai Cookbook](https://github.com/openai/openai-cookbook?WT.mc_id=academic-105485-koreyst)
- [OpenAI Studio Examples](https://oai.azure.com/portal?WT.mc_id=academic-105485-koreyst)
- [Best practices for fine-tuning GPT-3 to classify text](https://docs.google.com/document/d/1rqj7dkuvl7Byd5KQPUJRxc19BJt8wo0yHNwK84KfU3Q/edit#?WT.mc_id=academic-105485-koreyst)

# For More Help
[OpenAI Commercialization Team](AzureOpenAITeam@microsoft.com)

# Contributors
* Louis Li
