# ```python

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/6-NLP/3-Translation-Sentiment/solution/notebook.ipynb
Original Path: 6-NLP/3-Translation-Sentiment/solution/notebook.ipynb
Course: Machine Learning

```python
book_pride = TextBlob(file_contents)
positive_sentiment_sentences = []
negative_sentiment_sentences = []
```

```python
for sentence in book_pride.sentences:
if sentence.sentiment.polarity == 1:
positive_sentiment_sentences.append(sentence)
if sentence.sentiment.polarity == -1:
negative_sentiment_sentences.append(sentence)
```

```python
print("The " + str(len(positive_sentiment_sentences)) + " most positive sentences:")
for sentence in positive_sentiment_sentences:
print("+ " + str(sentence.replace("\n", "").replace(" ", " ")))
```

```python
print("The " + str(len(negative_sentiment_sentences)) + " most negative sentences:")
for sentence in negative_sentiment_sentences:
print("- " + str(sentence.replace("\n", "").replace(" ", " ")))
```
