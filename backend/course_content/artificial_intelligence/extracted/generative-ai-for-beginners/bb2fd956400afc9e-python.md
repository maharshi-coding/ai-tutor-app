# ```python

Source: Generative AI for Beginners
Original URL: https://github.com/microsoft/generative-ai-for-beginners/blob/HEAD/07-building-chat-applications/python/aoai-assigment-simple.ipynb
Original Path: 07-building-chat-applications/python/aoai-assigment-simple.ipynb
Course: Artificial Intelligence

```python
# Create your first prompt
text_prompt = " My foot hurts, what can be wrong?"

response = openai.ChatCompletion.create(
engine=deployment,
messages = [
{"role":"system", "content":"I'm a doctor, specialist on surgery"},
{"role":"user","content":text_prompt},])

response['choices'][0]['message']['content']
```
