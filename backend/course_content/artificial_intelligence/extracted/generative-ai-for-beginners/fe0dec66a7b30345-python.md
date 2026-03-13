# ```python

Source: Generative AI for Beginners
Original URL: https://github.com/microsoft/generative-ai-for-beginners/blob/HEAD/08-building-search-applications/python/oai-assignment.ipynb
Original Path: 08-building-search-applications/python/oai-assignment.ipynb
Course: Artificial Intelligence

```python
# Dependencies for embeddings_utils
%pip install matplotlib plotly scikit-learn pandas
```

```python
def cosine_similarity(a, b):
return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

```python
text = 'the quick brown fox jumped over the lazy dog'
model = 'text-embedding-ada-002'

client.embeddings.create(input = [text], model=model).data[0].embedding
```

```python
# compare several words
automobile_embedding = client.embeddings.create(input = 'automobile', model=model).data[0].embedding
vehicle_embedding = client.embeddings.create(input = 'vehicle', model=model).data[0].embedding
dinosaur_embedding = client.embeddings.create(input = 'dinosaur', model=model).data[0].embedding
stick_embedding = client.embeddings.create(input = 'stick', model=model).data[0].embedding

# comparing cosine similarity, automobiles vs automobiles should be 1.0, i.e exactly the same, while automobiles vs dinosaurs should be between 0 and 1, i.e. not the same
print(cosine_similarity(automobile_embedding, automobile_embedding))
print(cosine_similarity(automobile_embedding, vehicle_embedding))
print(cosine_similarity(automobile_embedding, dinosaur_embedding))
print(cosine_similarity(automobile_embedding, stick_embedding))
```
