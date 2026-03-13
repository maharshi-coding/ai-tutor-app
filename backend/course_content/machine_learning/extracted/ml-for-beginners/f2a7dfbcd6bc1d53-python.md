# ```python

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/6-NLP/5-Hotel-Reviews-2/solution/3-notebook.ipynb
Original Path: 6-NLP/5-Hotel-Reviews-2/solution/3-notebook.ipynb
Course: Machine Learning

```python
vader_sentiment = SentimentIntensityAnalyzer()
```

```python
# There are 3 possibilities of input for a review:
# It could be "No Negative", in which case, return 0
# It could be "No Positive", in which case, return 0
# It could be a review, in which case calculate the sentiment
def calc_sentiment(review):
if review == "No Negative" or review == "No Positive":
return 0
return vader_sentiment.polarity_scores(review)["compound"]
```

```python
# Load the hotel reviews from CSV
df = pd.read_csv("../../data/Hotel_Reviews_Filtered.csv")
```

```python
# Remove stop words - can be slow for a lot of text!
# Ryan Han (ryanxjhan on Kaggle) has a great post measuring performance of different stop words removal approaches
# https://www.kaggle.com/ryanxjhan/fast-stop-words-removal # using the approach that Ryan recommends
start = time.time()
cache = set(stopwords.words("english"))
def remove_stopwords(review):
text = " ".join([word for word in review.split() if word not in cache])
return text
```

```python
# Remove the stop words from both columns
df.Negative_Review = df.Negative_Review.apply(remove_stopwords)
df.Positive_Review = df.Positive_Review.apply(remove_stopwords)
```

```python
end = time.time()
print("Removing stop words took " + str(round(end - start, 2)) + " seconds")
```

Output:
```text
Removing stop words took 5.77 seconds
```

```python
# Add a negative sentiment and positive sentiment column
print("Calculating sentiment columns for both positive and negative reviews")
start = time.time()
df["Negative_Sentiment"] = df.Negative_Review.apply(calc_sentiment)
df["Positive_Sentiment"] = df.Positive_Review.apply(calc_sentiment)
end = time.time()
print("Calculating sentiment took " + str(round(end - start, 2)) + " seconds")
```

Output:
```text
Calculating sentiment columns for both positive and negative reviews
Calculating sentiment took 201.07 seconds
```

```python
df = df.sort_values(by=["Negative_Sentiment"], ascending=True)
print(df[["Negative_Review", "Negative_Sentiment"]])
df = df.sort_values(by=["Positive_Sentiment"], ascending=True)
print(df[["Positive_Review", "Positive_Sentiment"]])
```

Output:
```text
Negative_Review Negative_Sentiment
186584 So bad experience memories I hotel The first n... -0.9920
129503 First charged twice room booked booking second... -0.9896
307286 The staff Had bad experience even booking Janu... -0.9889
452092 No WLAN room Incredibly rude restaurant staff ... -0.9884
201293 We usually traveling Paris 2 3 times year busi... -0.9873
... ... ...
26899 I would say however one night expensive even d... 0.9933
138365 Wifi terribly slow I speed test network upload... 0.9938
79215 I find anything hotel first I walked past hote... 0.9938
278506 The property great location There bakery next ... 0.9945
339189 Guys I like hotel I wish return next year Howe... 0.9948

[515738 rows x 2 columns]
Positive_Review Positive_Sentiment
137893 Bathroom Shower We going stay twice hotel 2 ni... -0.9820
5839 I completely disappointed mad since reception ... -0.9780
64158 get everything extra internet parking breakfas... -0.9751
124178 I didnt like anythig Room small Asked upgrade ... -0.9721
489137 Very rude manager abusive staff reception Dirt... -0.9703
... ... ...
331570 Everything This recently renovated hotel class... 0.9984
322920 From moment stepped doors Guesthouse Hotel sta.
```

```python
# Reorder the columns (This is cosmetic, but to make it easier to explore the data later)
df = df.reindex(["Hotel_Name", "Hotel_Address", "Total_Number_of_Reviews", "Average_Score", "Reviewer_Score", "Negative_Sentiment", "Positive_Sentiment", "Reviewer_Nationality", "Leisure_trip", "Couple", "Solo_traveler", "Business_trip", "Group", "Family_with_young_children", "Family_with_older_children", "With_a_pet", "Negative_Review", "Positive_Review"], axis=1)
```

```python
print("Saving results to Hotel_Reviews_NLP.csv")
df.to_csv(r"../../data/Hotel_Reviews_NLP.csv", index = False)
```

Output:
```text
Saving results to Hotel_Reviews_NLP.csv
```
