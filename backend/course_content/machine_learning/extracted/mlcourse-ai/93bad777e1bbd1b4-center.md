# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/tutorials/Keras_easy_way_to_construct_the_Neural_Networks_fixed.ipynb
Original Path: jupyter_english/tutorials/Keras_easy_way_to_construct_the_Neural_Networks_fixed.ipynb
Course: Machine Learning

<center>
![alt text](http://i64.tinypic.com/as8k4.jpg “Title”)
## [mlcourse.ai](https://mlcourse.ai/) Open Machine learning course

<center> **Author:Natalia Domozhirova, slack: @ndomozhirova** <center>

# <center>Tutorial</center>
# <center>KERAS : easy way to construct the Neural Networks</center>

<center>
![alt text](http://i63.tinypic.com/35mpimt.jpg)

## Introduction

Keras is a high-level neural networks API, written in Python.

Major Keras features:
- its capable of running on top of TensorFlow, CNTK, or Theano.
- Keras allows for easy and fast prototyping and supports both Perceptrons, Convolutional networks and Recurrent networks (including LSTM), as well as their combinations.
- Keras is compatible with: Python 2.7-3.6.

To make the process more interesting let's consider the classification example from the real life.

## Example description

Let's take the task from one Hakaton, organized by some polypropylene producer this year. So, let’s consider the production of the polypropylene granules by the extruder. Extruder is a kind of “meat grinder” which has the knives at the end of the process which are cutting the output product onto the granules.
The problem is that sometimes the production mass has an irregular consistency and sticks to the knives. When there is a lot of stuck mass - knives can no longer function. In this case it is necessary to stop production process, which is very expensive. If we would catch the very beginning of such sticking process - there is a method to very quickly and painless clean the knives and continue production without stopping.
So, the task is to send the stop signal to operator a bit in advance (let’s say not later then 15 minutes before such event) – so that he would have a time for necessary manipulations.

<center>
<img src="http://i68.tinypic.com/2rr2glg.jpg" style="height:250px">

Now we have already preprocessed normalized dataset with the vectors of the system sensors' values (5,160 features) and 0/1 targets. It is already devided into the [train](https://drive.google.com/open?id=1TMlClLguxcXTOAJt8VKe-iLrndJuFShl) and [test](https://drive.google.com/open?id=1JonMu0wmMbUqcbSd17Qr2A3AhVF3nutZ).
Let's download and prepare to work our datasets. In the datasets there are targets in zero column and the timestamps -in the 1st column.So, let's extract our train and test matrix as well as our targets. Also we'll transform the targets to categorical -so to have as a result our targets as 2-dimentional vectors, i.e. the vectors of probabilities of 0 and 1.

```python
import numpy as np
import pandas as pd
from keras.utils import np_utils

df_train = pd.read_csv("train2.tsv", sep="\t", header=None)
df_test = pd.read_csv("test2.tsv", sep="\t", header=None)

Y_train = np.array(df_train[0].values.astype(int))
Y_test = np.array(df_test[0].values.astype(int))
X_train = np.array(df_train.iloc[:, 2:].values.astype(float))
X_test = np.array(df_test.iloc[:, 2:].values.astype(float))

Y_train = Y_train.astype(np.int)
Y_test = Y_test.astype(np.int)

Y_train = np_utils.to_categorical(Y_train, 2)
Y_test = np_utils.to_categorical(Y_test, 2)

print(X_train.shape)
print(Y_train.shape)
print(X_test.shape)
print(Y_test.shape)
```

## The Neural Network construction

Let's consider how the simple Newral Network(NN), Multilayer Perceptron (MLP), with 3 hidden layers (as a baseline), constructed by Keras, could help us to solve this problem.

As we have hidden layers - this would be a Deep Neural Network.
Also, we can see, that we need to have 5160 neurons in the input layer, as this is the size of our vector X and 2 neurons in the last layer - as this is the size of our target (vs. the picture below, where there are 4 neurons on the output layer).
You can read, for example, [here](https://en.wikipedia.org/wiki/Multilayer_perceptron) or [here](https://towardsdatascience.com/meet-artificial-neural-networks-ae5939b1dd3a) some more information about MLP structure.

<center>
<img src="http://i66.tinypic.com/2d6tsm.jpg" style="height:250px">

The core data structure of Keras is a **_model_** - a way to organize layers. The simplest type of model is the **_Sequential_** model, a linear stack of layers, which is appropriate for MLP construction (for more complex architectures, you should use the Keras functional API, which allows to build arbitrary graphs of layers).

```python
import keras
from keras import Sequential

model1 = Sequential()
```

After the type of model is defined, we need to consistently add layers as **_Dense_**. Stacking layers is as easy as **_.add()_**.

While adding the layer we need to define the **number of neurons** and ***Activation*** **functions** which we can tune afterwards. For the fist layer we also need to add the dimention of X vectors (***input_dim***). In our case this is 5,160. The last layer consists on 2 neurons exactly as our target vestors Y_train and Y_test do.

The **number of layers** can also be tuned.

```python
from keras.layers import Activation, Dense

model1.add(Dense(64, input_dim=5160))
model1.add(Activation("relu"))

model1.add(Dense(64))
model1.add(Activation("sigmoid"))

model1.add(Dense(128))
model1.add(Activation("tanh"))

model1.add(Dense(2))
model1.add(Activation("softmax"))
```

Once our model looks good, we need to configure its learning process with **_.compile()_**.

Here we should also describe the **_loss_** **function** and **_metrics_** we want to use as well as **_optimizer_** (the type of the Gradient descent to be used) which seem appropriate in each particular case.

```python
model1.compile(loss="categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
```

Now we can iterate on our training data in batches with the ***batch_size*** we want, where X_train and y_train are Numpy arrays just like in the Scikit-Learn API.
Also we can define the number of ***epochs*** (i.e. the max number of the full cycles of model's training).
***Verbose=1*** just lets us see the summary of the current stage of calcualtions.

We can also printing our model parameters using ***model.summary()***.
It is also can be useful to see the **shapes** of X_train, y_train,X_test,y_test

Also, we can save **the best model version** during the trainig process via the ***callback_save*** option.

And there is a ***callback_early stop*** option to stop the training process when we don't have significant improvement(defined by the ***min_delta***) during the certain number of epochs (***patience***).

Now our first model is ready:

```python
from keras.callbacks import EarlyStopping, ModelCheckpoint

model1.summary()

print(X_train.shape)
print(Y_train.shape)
print(X_test.shape)
print(Y_test.shape)

callback_save = ModelCheckpoint(
"best_model1.model1", monitor="val_acc", verbose=1, save_best_only=True, mode="auto"
)
callback_earlystop = EarlyStopping(
monitor="val_loss", min_delta=0, patience=10, verbose=1, mode="auto"
)

model1.fit(
X_train,
Y_train,
batch_size=20,
epochs=10000,
verbose=1,
validation_data=(X_test, Y_test),
callbacks=[callback_save, callback_earlystop],
)
```

**So, we got a baseline with Accuracy= 0.79**. It looks cool, as we even didn't tune anything yet!

Let's try to improve this result. For example, we can introduce **Dropout** - this is a kind of regularization for the Neral Networks.
The **level of drop out** (in the brackets, along with a ***seed***) is a probability of the exclusion from the certain layer the random choice neuron during the current calculations. So, drop outs help to prevent the NN overfitting.
Let's create the new model:

```python
from keras.layers import Dropout

model2 = Sequential()

model2.add(Dense(64, input_dim=5160))
model2.add(Activation("relu"))
model2.add(Dropout(0.3, seed=123))

model2.add(Dense(64))
model2.add(Activation("sigmoid"))
model2.add(Dropout(0.4, seed=123))

model2.add(Dense(128))
model2.add(Activation("tanh"))
model2.add(Dropout(0.5, seed=123))

model2.add(Dense(2))
model2.add(Activation("softmax"))

model2.compile(loss="categorical_crossentropy", optimizer="adam", metrics=["accuracy"])

model2.summary()

print(X_train.shape)
print(Y_train.shape)
print(X_test.shape)
print(Y_test.shape)

callback_save = ModelCheckpoint(
"best_model2.model2", monitor="val_acc", verbose=1, save_best_only=True, mode="auto"
)
callback_earlystop = EarlyStopping(
monitor="val_loss", min_delta=0, patience=10, verbose=1, mode="auto"
)

model2.fit(
X_train,
Y_train,
batch_size=20,
epochs=10000,
verbose=1,
validation_data=(X_test, Y_test),
callbacks=[callback_save, callback_earlystop],
)
```

Thus, adding the drop-outs we've **increased Accuracy on the test up to 0.86830**

We can also **tune all gyper-parameters** like the **number of layers**, the **levels of drop-outs**, **activation functions**, **optimizer**, **the number of neurons** etc.
For this purposes we can use, for example, another very friendly and easy-to-apply - Hyperas library. The description with examples you can find [here](https://github.com/maxpumperla/hyperas).
As a result of such tuning we've got the following model configuration:

```python
model3 = Sequential()

model3.add(Dense(64, input_dim=5160))
model3.add(Activation("relu"))
model3.add(Dropout(0.11729755246044238, seed=123))

model3.add(Dense(256))
model3.add(Activation("relu"))
model3.add(Dropout(0.8444244099007299, seed=123))

model3.add(Dense(1024))
model3.add(Activation("linear"))
model3.add(Dropout(0.41266207281071243, seed=123))

model3.add(Dense(256))
model3.add(Activation("relu"))
model3.add(Dropout(0.4844455237320119, seed=123))

model3.add(Dense(2))
model3.add(Activation("softmax"))

model3.compile(
loss="categorical_crossentropy", optimizer="rmsprop", metrics=["accuracy"]
)

model3.summary()

print(X_train.shape)
print(Y_train.shape)
print(X_test.shape)
print(Y_test.shape)

callback_save = ModelCheckpoint(
"best_model3.model3", monitor="val_acc", verbose=1, save_best_only=True, mode="auto"
)
callback_earlystop = EarlyStopping(
monitor="val_loss", min_delta=0, patience=10, verbose=1, mode="auto"
)

model3.fit(
X_train,
Y_train,
batch_size=60,
epochs=10000,
verbose=1,
validation_data=(X_test, Y_test),
callbacks=[callback_save, callback_earlystop],
)
```

**Now, with tunned parameters, we've managed to imporove Accuracy up to 0.88073**

With Keras it is also possible to use **L1/L2 weight regularizations** which allow to apply penalties on layer parameters or layer activity during optimization. These penalties are incorporated in the loss function that the network optimizers.Let's add some regularization on to the 1st layer.

```python
from keras import regularizers

model4 = Sequential()
model4.add(
Dense(
64,
input_dim=5160,
kernel_regularizer=regularizers.l2(0.0015),
activity_regularizer=regularizers.l1(0.0015),
)
model3.add(Activation("relu"))
model4.add(Dropout(0.11729755246044238, seed=123))

model4.add(Dense(256))
model4.add(Activation("relu"))
model4.add(Dropout(0.8444244099007299, seed=123))

model4.add(Dense(1024))
model4.add(Activation("linear"))
model4.add(Dropout(0.41266207281071243, seed=123))

model4.add(Dense(256))
model4.add(Activation("relu"))
model4.add(Dropout(0.4844455237320119, seed=123))

model4.add(Dense(2))
model4.add(Activation("softmax"))

model4.compile(
loss="categorical_crossentropy", optimizer="rmsprop", metrics=["accuracy"]
)

model4.summary()

print(X_train.shape)
print(Y_train.shape)
print(X_test.shape)
print(Y_test.shape)

callback_save = ModelCheckpoint(
"best_model4.model4", monitor="val_acc", verbose=1, save_best_only=True, mode="auto"
)
callback_earlystop = EarlyStopping(
monitor="val_loss", min_delta=0, patience=10, verbose=1, mode="auto"
)

model4.fit(
X_train,
Y_train,
batch_size=60,
epochs=10000,
verbose=1,
validation_data=(X_test, Y_test),
callbacks=[callback_save, callback_earlystop],
)
```

So, we can see, that adding regualrization with the current coeffitients to the firs layer we've got just **Accuracy of 0.84421** which didn't improve the result. This means, that, as usual, they should be carefully tuned :)

When we **want to use the best trained model** we got, we can just download previously (automatically) saved the best one (via ***load_model***) and apply to the data needed.
Let's see what we'll get on the test set:

```python
from keras.models import load_model

model = load_model("best_model3.model3")
result = model.predict_on_batch(X_test)
result[:5]
```

You may also be interested to get a **list of all weight tensors** of the model, as Numpy arrays via ***get_weights***:

```python
weights = model.get_weights()
weights[:1]
```

Besides, you would propbably like to get the **model config** to re-use it in the future. This can be done via ***get_config***:

```python
config = model.get_config()
config
```

So, the model can be **reinstantiated** from its config via ***from_config***:

```python
model3 = Sequential.from_config(config)
```

For more model tuning options proposed by Keras pls see [here](https://keras.io/)

## What about the other types of the Neural Networks?

Yes, you can use the similar approach re the layers' construction principles for LSTM, CNN and some other types of the Deep Neural Networks. For more details pls see [here](https://keras.io/).

## References:
1. https://keras.io/
2. https://towardsdatascience.com/meet-artificial-neural-networks-ae5939b1dd3a
3. https://www.quantinsti.com/blog/installing-keras-python-r
4. https://livebook.manning.com/#!/book/deep-learning-with-python/chapter-7
5. https://github.com/hyperopt/hyperopt
