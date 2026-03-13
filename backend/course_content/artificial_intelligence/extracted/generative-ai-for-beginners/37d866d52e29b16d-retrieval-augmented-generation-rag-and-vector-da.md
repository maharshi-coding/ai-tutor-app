# Retrieval Augmented Generation (RAG) and Vector Databases

Source: Generative AI for Beginners
Original URL: https://github.com/microsoft/generative-ai-for-beginners/blob/HEAD/15-rag-and-vector-databases/notebook-rag-vector-databases.ipynb
Original Path: 15-rag-and-vector-databases/notebook-rag-vector-databases.ipynb
Course: Artificial Intelligence

# Retrieval Augmented Generation (RAG) and Vector Databases

```python
!pip install getenv openai==1.12.0
```

Output:
```text
Requirement already satisfied: getenv in /usr/local/python/3.10.13/lib/python3.10/site-packages (0.2.0)
Requirement already satisfied: openai==1.12.0 in /usr/local/python/3.10.13/lib/python3.10/site-packages (1.12.0)
Requirement already satisfied: anyio<5,>=3.5.0 in /home/codespace/.local/lib/python3.10/site-packages (from openai==1.12.0) (4.2.0)
Requirement already satisfied: distro<2,>=1.7.0 in /usr/local/python/3.10.13/lib/python3.10/site-packages (from openai==1.12.0) (1.9.0)
Requirement already satisfied: httpx<1,>=0.23.0 in /home/codespace/.local/lib/python3.10/site-packages (from openai==1.12.0) (0.26.0)
Requirement already satisfied: pydantic<3,>=1.9.0 in /usr/local/python/3.10.13/lib/python3.10/site-packages (from openai==1.12.0) (2.6.1)
Requirement already satisfied: sniffio in /home/codespace/.local/lib/python3.10/site-packages (from openai==1.12.0) (1.3.0)
Requirement already satisfied: tqdm>4 in /usr/local/python/3.10.13/lib/python3.10/site-packages (from openai==1.12.0) (4.64.0)
Requirement already satisfied: typing-extensions<5,>=4.7 in /home/codespace/.local/lib/python3.10/site-packages (from openai==1.12.0) (4.9.0)
Requirement already satisfied: idna>=2.8 in /home/codespace/.local/lib/python3.10/site-packages (from anyio<5,>=3.5.0->openai==1.12.0) (3.6)
Requirement already satisfied: exceptiongroup>=1.0.2 in /home/codespace/.local/lib/python3.10/site-packages (from anyio<5,>=3.5.0->openai==1.12.0) (1.2.0)
Requirement already satisfied: certifi in /home/codespace/.local/lib/python3.10/site-packages (from httpx<1,>=0.23.0->openai==1.12.0) (2024.2.2)
Requireme
```

```python
import os
import pandas as pd
import numpy as np
import openai
```

## Creating our Knowledge base

Creating a Azure Cosmos DB database

```python
pip install azure-cosmos
```

Output:
```text
Requirement already satisfied: azure-cosmos in /usr/local/python/3.10.13/lib/python3.10/site-packages (4.5.1)
Requirement already satisfied: azure-core<2.0.0,>=1.23.0 in /usr/local/python/3.10.13/lib/python3.10/site-packages (from azure-cosmos) (1.30.0)
Requirement already satisfied: requests>=2.21.0 in /home/codespace/.local/lib/python3.10/site-packages (from azure-core<2.0.0,>=1.23.0->azure-cosmos) (2.31.0)
Requirement already satisfied: six>=1.11.0 in /home/codespace/.local/lib/python3.10/site-packages (from azure-core<2.0.0,>=1.23.0->azure-cosmos) (1.16.0)
Requirement already satisfied: typing-extensions>=4.6.0 in /home/codespace/.local/lib/python3.10/site-packages (from azure-core<2.0.0,>=1.23.0->azure-cosmos) (4.9.0)
Requirement already satisfied: charset-normalizer<4,>=2 in /home/codespace/.local/lib/python3.10/site-packages (from requests>=2.21.0->azure-core<2.0.0,>=1.23.0->azure-cosmos) (3.3.2)
Requirement already satisfied: idna<4,>=2.5 in /home/codespace/.local/lib/python3.10/site-packages (from requests>=2.21.0->azure-core<2.0.0,>=1.23.0->azure-cosmos) (3.6)
Requirement already satisfied: urllib3<3,>=1.21.1 in /usr/local/python/3.10.13/lib/python3.10/site-packages (from requests>=2.21.0->azure-core<2.0.0,>=1.23.0->azure-cosmos) (2.0.7)
Requirement already satisfied: certifi>=2017.4.17 in /home/codespace/.local/lib/python3.10/site-packages (from requests>=2.21.0->azure-core<2.0.0,>=1.23.0->azure-cosmos) (2024.2.2)
Note: you may need to restart the kernel to use updated packages.
```

```python
## create your cosmoss db on Azure CLI using the following commands
## az login
## az group create -n <resource-group-name> -l <location>
## az cosmosdb create -n <cosmos-db-name> -r <resource-group-name>
## az cosmosdb list-keys -n <cosmos-db-name> -g <resource-group-name>

## Once done navigate to data explorer and create a new database and a new container
```

```python
from azure.cosmos import CosmosClient

# Initialize Cosmos Client
url = os.getenv('COSMOS_DB_ENDPOINT')
key = os.getenv('COSMOS_DB_KEY')
client = CosmosClient(url, credential=key)

# Select database
database_name = 'rag-cosmos-db'
database = client.get_database_client(database_name)

# Select container
container_name = 'data'
container = database.get_container_client(container_name)
```

```python
import pandas as pd

# Initialize an empty DataFrame
df = pd.DataFrame(columns=['path', 'text'])

# splitting our data into chunks
data_paths= ["data/frameworks.md?WT.mc_id=academic-105485-koreyst", "data/own_framework.md?WT.mc_id=academic-105485-koreyst", "data/perceptron.md?WT.mc_id=academic-105485-koreyst"]

for path in data_paths:
with open(path, 'r', encoding='utf-8') as file:
file_content = file.read()

# Append the file path and text to the DataFrame
df = df.append({'path': path, 'text': file_content}, ignore_index=True)

df.head()
```

Output:
```text
/tmp/ipykernel_25612/20051717.py:15: FutureWarning: The frame.append method is deprecated and will be removed from pandas in a future version. Use pandas.concat instead.
df = df.append({'path': path, 'text': file_content}, ignore_index=True)
/tmp/ipykernel_25612/20051717.py:15: FutureWarning: The frame.append method is deprecated and will be removed from pandas in a future version. Use pandas.concat instead.
df = df.append({'path': path, 'text': file_content}, ignore_index=True)
/tmp/ipykernel_25612/20051717.py:15: FutureWarning: The frame.append method is deprecated and will be removed from pandas in a future version. Use pandas.concat instead.
df = df.append({'path': path, 'text': file_content}, ignore_index=True)

path text
0 data/frameworks.md # Neural Network Frameworks\n\nAs we have lear...
1 data/own_framework.md # Introduction to Neural Networks. Multi-Layer...
2 data/perceptron.md # Introduction to Neural Networks: Perceptron\...
```

```python
def split_text(text, max_length, min_length):
words = text.split()
chunks = []
current_chunk = []

for word in words:
current_chunk.append(word)
if len(' '.join(current_chunk)) < max_length and len(' '.join(current_chunk)) > min_length:
chunks.append(' '.join(current_chunk))
current_chunk = []

# If the last chunk didn't reach the minimum length, add it anyway
if current_chunk:
chunks.append(' '.join(current_chunk))

return chunks

# Assuming analyzed_df is a pandas DataFrame and 'output_content' is a column in that DataFrame
splitted_df = df.copy()
splitted_df['chunks'] = splitted_df['text'].apply(lambda x: split_text(x, 400, 300))

splitted_df
```

Output:
```text
path text \
0 data/frameworks.md # Neural Network Frameworks\n\nAs we have lear...
1 data/own_framework.md # Introduction to Neural Networks. Multi-Layer...
2 data/perceptron.md # Introduction to Neural Networks: Perceptron\...

chunks
0 [# Neural Network Frameworks As we have learne...
1 [# Introduction to Neural Networks. Multi-Laye...
2 [# Introduction to Neural Networks: Perceptron...
```

```python
# Assuming 'chunks' is a column of lists in the DataFrame splitted_df, we will split the chunks into different rows
flattened_df = splitted_df.explode('chunks')

flattened_df.head()
```

Output:
```text
path text \
0 data/frameworks.md # Neural Network Frameworks\n\nAs we have lear...

chunks
0 # Neural Network Frameworks As we have learned...
0 descent optimization While the `numpy` library...
0 should give us the opportunity to compute grad...
0 those computations on GPUs is very important. ...
0 API, there is also higher-level API, called Ke...
```

## Converting our text to embeddings

Converting out text to embeddings, and storing them in our database in chunks

```python
openai.api_type = "azure"
openai.api_key = os.getenv("AZURE_OPENAI_API_KEY")
openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")
openai.api_version = "2023-07-01-preview"
```

```python
from openai import OpenAI
client = OpenAI(api_key=os.getenv("AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT"))
```

```python
def create_embeddings(text, model="text-embedding-ada-002-2"):
# Create embeddings for each document chunk
embeddings = openai.embeddings.create(input = text, model=model).data[0].embedding
return embeddings

#embeddings for the first chunk
create_embeddings(flattened_df['chunks'][0])
```

Output:
```text
[-0.016977494582533836,
0.0028917337767779827,
0.025520483031868935,
-0.03886381536722183,
0.006847951095551252,
0.003939266782253981,
-0.006163155660033226,
-0.0032409115228801966,
-0.002920549362897873,
-0.029344486072659492,
0.034931328147649765,
0.020408250391483307,
0.0015382464043796062,
0.003086663084104657,
-0.014618001878261566,
-0.010983842425048351,
0.02225244976580143,
0.009017598815262318,
-0.02931736595928669,
-0.02063877508044243,
-0.03550086170434952,
-0.003715521888807416,
0.01288906391710043,
-0.034226194024086,
-0.030429311096668243,
-0.0014907853910699487,
0.015296016819775105,
-0.04358280077576637,
-0.007553086616098881,
-0.014156951569020748,
0.01970311440527439,
0.01257039699703455,
-0.012665319256484509,
-0.015553662553429604,
-0.004668132867664099,
0.011058423668146133,
0.0012356822844594717,
0.00818364042788744,
-0.0005224952474236488,
-0.00196624337695539,
0.04032832756638527,
0.011255048215389252,
-0.009871897287666798,
-0.00762766832485795,
-0.0052071548998355865,
0.010685515590012074,
-0.02524927631020546,
-0.03335833549499512,
-0.006258077919483185,
0.004135891329497099,
0.013024667277932167,
0.02397460862994194,
-0.044043850153684616,
-0.03303288668394089,
-0.02108626440167427,
0.012129687704145908,
-0.026347661390900612,
0.012760241515934467,
0.0245983824133873,
-0.025845929980278015,
0.0023594920057803392,
0.019825156778097153,
-0.021316789090633392,
0.003123953938484192,
-0.0074107032269239426,
-0.019499709829688072,
-0.0014772251015529037,
0.025764567777514458,
0.00335108
```

```python
cat = create_embeddings("cat")
cat
```

Output:
```text
[-0.0070945825427770615,
-0.017328109592199326,
-0.009644086472690105,
-0.03070768155157566,
-0.012548675760626793,
0.003105211304500699,
-0.005113212391734123,
-0.04121817275881767,
-0.014629469253122807,
-0.021376069635152817,
0.019231360405683517,
0.05087646469473839,
-0.0012907310156151652,
0.0024855893570929766,
-0.03840590640902519,
-0.006089693866670132,
0.0355084203183651,
-0.004697763826698065,
0.0023630852811038494,
-0.01342928409576416,
-0.01891888678073883,
0.009019138291478157,
0.015893569216132164,
-0.008713766001164913,
-0.014672079123556614,
0.007233065087348223,
0.013031589798629284,
-0.013365369290113449,
0.002858427818864584,
0.004861102905124426,
0.0040266546420753,
-0.01677417755126953,
-0.015850959345698357,
-0.04306461289525032,
-0.027242060750722885,
-0.004278764594346285,
0.0080533092841506,
-0.009984967298805714,
0.022015219554305077,
-0.009040444158017635,
0.004900162108242512,
0.00031890999525785446,
-0.012221998535096645,
0.013038692064583302,
-0.0038775193970650434,
0.0070661758072674274,
-0.022185660898685455,
-0.004410145804286003,
0.0013573094038292766,
0.013912199065089226,
0.002606318099424243,
0.008266360498964787,
-0.01138399913907051,
0.0103471539914608,
-0.005084805656224489,
0.0029045888222754,
0.007960988208651543,
-0.012697811238467693,
0.013265945948660374,
0.0023417803458869457,
0.015865162014961243,
0.004239705391228199,
-0.0018144802888855338,
0.022753795608878136,
0.011163847520947456,
-0.003371524391695857,
-0.007265022955834866,
0.00042521333671174943,
-0.004
```

```python
# create embeddings for the whole data chunks and store them in a list

embeddings = []
for chunk in flattened_df['chunks']:
embeddings.append(create_embeddings(chunk))

# store the embeddings in the dataframe
flattened_df['embeddings'] = embeddings

flattened_df.head()
```

Output:
```text
path text \
0 data/frameworks.md # Neural Network Frameworks\n\nAs we have lear...

chunks \
0 # Neural Network Frameworks As we have learned...
0 descent optimization While the `numpy` library...
0 should give us the opportunity to compute grad...
0 those computations on GPUs is very important. ...
0 API, there is also higher-level API, called Ke...

embeddings
0 [-0.016977494582533836, 0.0028917337767779827,...
0 [-0.014787919819355011, 0.0016925617819651961,...
0 [-0.03673850744962692, -0.02062208764255047, 0...
0 [-0.03166744112968445, -0.011117876507341862, ...
0 [-0.007904806174337864, -0.03335562348365784, ...
```

# Retrieval

Vector search and similarity between our prompt and the database

### Creating an search index and reranking

```python
from sklearn.neighbors import NearestNeighbors

embeddings = flattened_df['embeddings'].to_list()

# Create the search index
nbrs = NearestNeighbors(n_neighbors=5, algorithm='ball_tree').fit(embeddings)

# To query the index, you can use the kneighbors method
distances, indices = nbrs.kneighbors(embeddings)

# Store the indices and distances in the DataFrame
flattened_df['indices'] = indices.tolist()
flattened_df['distances'] = distances.tolist()

flattened_df.head()
```

Output:
```text
path text \
0 data/frameworks.md # Neural Network Frameworks\n\nAs we have lear...

chunks \
0 # Neural Network Frameworks As we have learned...
0 descent optimization While the `numpy` library...
0 should give us the opportunity to compute grad...
0 those computations on GPUs is very important. ...
0 API, there is also higher-level API, called Ke...

embeddings indices \
0 [-0.016977494582533836, 0.0028917337767779827,... [0, 2, 11, 3, 1]
0 [-0.014787919819355011, 0.0016925617819651961,... [1, 0, 32, 2, 50]
0 [-0.03673850744962692, -0.02062208764255047, 0... [2, 3, 0, 5, 1]
0 [-0.03166744112968445, -0.011117876507341862, ... [3, 2, 0, 10, 11]
0 [-0.007904806174337864, -0.03335562348365784, ... [4, 12, 10, 9, 8]

distances
0 [0.0, 0.5220072028343841, 0.5281003720111753, ...
0 [0.0, 0.5689486562368801, 0.5917805129945245, ...
0 [0.0, 0.5052294707599493, 0.5220072028343841, ...
0 [0.0, 0.5052294707599493, 0.5456879720601056, ...
0 [0.0, 0.5192304344185765, 0.5523440479637329, ...
```

```python
# Your text question
question = "what is a perceptron?"

# Convert the question to a query vector
query_vector = create_embeddings(question) # You need to define this function

# Find the most similar documents
distances, indices = nbrs.kneighbors([query_vector])

index = []
# Print the most similar documents
for i in range(3):
index = indices[0][i]
for index in indices[0]:
print(flattened_df['chunks'].iloc[index])
print(flattened_df['path'].iloc[index])
print(flattened_df['distances'].iloc[index])
else:
print(f"Index {index} not found in DataFrame")
```

Output:
```text
in our model, in which case the input vector would be a vector of size N. A perceptron is a **binary classification** model, i.e. it can distinguish between two classes of input data. We will assume that for each input vector x the output of our perceptron would be either +1 or -1, depending on the class.
data/perceptron.md
[0.0, 0.5349479188905069, 0.5355415711920977, 0.5439405604626569, 0.5535213920359319]
# Introduction to Neural Networks: Perceptron One of the first attempts to implement something similar to a modern neural network was done by Frank Rosenblatt from Cornell Aeronautical Laboratory in 1957. It was a hardware implementation called "Mark-1", designed to recognize primitive geometric figures,
data/perceptron.md
[0.0, 0.4573465617700431, 0.5237117623258072, 0.5634745620918584, 0.5671484849463262]
user to adjust the resistance of a circuit. > The New York Times wrote about perceptron at that time: *the embryo of an electronic computer that [the Navy] expects will be able to walk, talk, see, write, reproduce itself and be conscious of its existence.* ## Perceptron Model Suppose we have N features
data/perceptron.md
[0.0, 0.5237117623258072, 0.5439405604626569, 0.5640031504355143, 0.5743401185082532]
and to continue learning - go to Perceptron notebook. Here's an interesting article about perceptrons as well. ## Assignment In this lesson, we have implemented a perceptron for binary classification task, and we have used it to classify between two handwritten digits. In this lab, you are asked to solve
data/perceptron.md
[0.0, 0.5106881050096326, 0.514214767886202
```

## Putting it all together to answer a question

```python
import os
import openai

openai.api_type = "azure"
openai.api_base = os.getenv("AZURE_OPENAI_ENDPOINT")
openai.api_version = "2023-07-01-preview"
openai.api_key = os.getenv("AZURE_OPENAI_API_KEY")
```

```python
user_input = "what is a perceptron?"

def chatbot(user_input):
# Convert the question to a query vector
query_vector = create_embeddings(user_input)

# Find the most similar documents
distances, indices = nbrs.kneighbors([query_vector])

# add documents to query to provide context
history = []
for index in indices[0]:
history.append(flattened_df['chunks'].iloc[index])

# combine the history and the user input
history.append(user_input)

# create a message object
messages=[
{"role": "system", "content": "You are an AI assiatant that helps with AI questions."},
{"role": "user", "content": history[-1]}
]

# use chat completion to generate a response
response = openai.chat.completions.create(
model="gpt-35-turbo-1106",
temperature=0.7,
max_tokens=800,
messages=messages
)

return response.choices[0].message

chatbot(user_input)
```

Output:
```text
ChatCompletionMessage(content='A perceptron is a type of artificial neural network model, which is a fundamental unit of a neural network. It is a simple algorithm used for binary classification tasks. The perceptron takes multiple input values, applies weights to these inputs, and produces a single output value. The output is determined by applying a step function to the weighted sum of the inputs. Perceptrons are often used as building blocks for more complex neural network architectures.', role='assistant', function_call=None, tool_calls=None)
```

## Testing and evaluation

A basic example of how you can use Mean Average Precision (MAP) to evaluate the responses of your model based on their relevance.

```python
from sklearn.metrics import average_precision_score

# Define your test cases
test_cases = [
{
"query": "What is a perceptron?",
"relevant_responses": ["A perceptron is a type of artificial neuron.", "It's a binary classifier used in machine learning."],
"irrelevant_responses": ["A perceptron is a type of fruit.", "It's a type of car."]
},
{
"query": "What is machine learning?",
"relevant_responses": ["Machine learning is a method of data analysis that automates analytical model building.", "It's a branch of artificial intelligence based on the idea that systems can learn from data, identify patterns and make decisions with minimal human intervention."],
"irrelevant_responses": ["Machine learning is a type of fruit.", "It's a type of car."]
},
{
"query": "What is deep learning?",
"relevant_responses": ["Deep learning is a subset of machine learning in artificial intelligence (AI) that has networks capable of learning unsupervised from data that is unstructured or unlabeled.", "It's a type of machine learning."],
"irrelevant_responses": ["Deep learning is a type of fruit.", "It's a type of car."]
},
{
"query": "What is a neural network?",
"relevant_responses": ["A neural network is a series of algorithms that endeavors to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates.", "It's a type of machine learning."],
"irrelevant_responses": ["A neural network is a type of fruit.", "It's a type of car."]
}
]

# Initialize the total average precision
total_average_precision = 0

# Test the RAG application
for test_case in test_cases:
query = test_case["query"]
relevant_responses = test_case["relevant_responses"]
irrelevant_responses = test_case["irrelevant_responses"]

# Generate a response using your RAG application
response = chatbot(query)

# Create a list of all responses and a list of true binary labels
all_responses = relevant_responses + irrelevant_responses
true_labels = [1] * len(relevant_responses) + [0] * len(irrelevant_responses)

# Create a list of predicted scores based on whether the response is the generated response
predicted_scores = [1 if resp == response else 0 for resp in all_responses]

# Calculate the average precision for this query
average_precision = average_precision_score(true_labels, predicted_scores)

# Add the average precision to the total average precision
total_average_precision += average_precision

# Calculate the mean average precision
mean_average_precision = total_average_precision / len(test_cases)
```

```python
mean_average_precision
```

Output:
```text
0.5
```
