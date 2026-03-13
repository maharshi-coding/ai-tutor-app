# MNIST Digit Classification with our own Framework

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/3-NeuralNetworks/04-OwnFramework/lab/MyFW_MNIST.ipynb
Original Path: lessons/3-NeuralNetworks/04-OwnFramework/lab/MyFW_MNIST.ipynb
Course: Artificial Intelligence

# MNIST Digit Classification with our own Framework

Lab Assignment from [AI for Beginners Curriculum](https://github.com/microsoft/ai-for-beginners).

### Reading the Dataset

This code download the dataset from the repository on the internet. You can also manually copy the dataset from `/data` directory of AI Curriculum repo.

```python
!rm *.pkl
!wget https://raw.githubusercontent.com/microsoft/AI-For-Beginners/main/data/mnist.pkl.gz
!gzip -d mnist.pkl.gz
```

Output:
```text
% Total % Received % Xferd Average Speed Time Time Time Current
Dload Upload Total Spent Left Speed

0 0 0 0 0 0 0 0 --:--:-- --:--:-- --:--:-- 0
100 9.9M 100 9.9M 0 0 9.9M 0 0:00:01 --:--:-- 0:00:01 15.8M
```

```python
import pickle
with open('mnist.pkl','rb') as f:
MNIST = pickle.load(f)
```

```python
labels = MNIST['Train']['Labels']
data = MNIST['Train']['Features']
```

Let's see what is the shape of data that we have:

```python
data.shape
```

Output:
```text
(42000, 784)
```

### Splitting the Data

We will use Scikit Learn to split the data between training and test dataset:

```python
from sklearn.model_selection import train_test_split

features_train, features_test, labels_train, labels_test = train_test_split(data,labels,test_size=0.2)

print(f"Train samples: {len(features_train)}, test samples: {len(features_test)}")
```

Output:
```text
Train samples: 33600, test samples: 8400
```

### Instructions

1. Take the framework code from the lesson and paste it into this notebook, or (even better) into a separate Python module
1. Define and train one-layered perceptron, observing training and validation accuracy during training
1. Try to understand if overfitting took place, and adjust layer parameters to improve accuracy
1. Repeat previous steps for 2- and 3-layered perceptrons. Try to experiment with different activation functions between layers.
1. Try to answer the following questions:
- Does the inter-layer activation function affect network performance?
- Do we need 2- or 3-layered network for this task?
- Did you experience any problems training the network? Especially as the number of layers increased.
- How do weights of the network behave during training? You may plot max abs value of weights vs. epoch to understand the relation.
