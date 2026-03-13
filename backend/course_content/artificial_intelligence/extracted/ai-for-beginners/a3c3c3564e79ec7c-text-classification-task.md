# Text classification task

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/5-NLP/13-TextRep/TextRepresentationTF.ipynb
Original Path: lessons/5-NLP/13-TextRep/TextRepresentationTF.ipynb
Course: Artificial Intelligence

# Text classification task

In this module, we will start with a simple text classification task based on the **[AG_NEWS](http://www.di.unipi.it/~gulli/AG_corpus_of_news_articles.html)** dataset: we'll classify news headlines into one of 4 categories: World, Sports, Business and Sci/Tech.

## The Dataset

To load the dataset, we will use the **[TensorFlow Datasets](https://www.tensorflow.org/datasets)** API.

```python
import tensorflow as tf
from tensorflow import keras
import tensorflow_datasets as tfds

# In this tutorial, we will be training a lot of models. In order to use GPU memory cautiously,
# we will set tensorflow option to grow GPU memory allocation when required.
physical_devices = tf.config.list_physical_devices('GPU')
if len(physical_devices)>0:
tf.config.experimental.set_memory_growth(physical_devices[0], True)

dataset = tfds.load('ag_news_subset')
```

We can now access the training and test portions of the dataset by using `dataset['train']` and `dataset['test']` respectively:

```python
ds_train = dataset['train']
ds_test = dataset['test']

print(f"Length of train dataset = {len(ds_train)}")
print(f"Length of test dataset = {len(ds_test)}")
```

Output:
```text
Length of train dataset = 120000
Length of test dataset = 7600
```

Let's print out the first 10 new headlines from our dataset:

```python
classes = ['World', 'Sports', 'Business', 'Sci/Tech']

for i,x in zip(range(5),ds_train):
print(f"{x['label']} ({classes[x['label']]}) -> {x['title']} {x['description']}")
```

Output:
```text
3 (Sci/Tech) -> b'AMD Debuts Dual-Core Opteron Processor' b'AMD #39;s new dual-core Opteron chip is designed mainly for corporate computing applications, including databases, Web services, and financial transactions.'
1 (Sports) -> b"Wood's Suspension Upheld (Reuters)" b'Reuters - Major League Baseball\\Monday announced a decision on the appeal filed by Chicago Cubs\\pitcher Kerry Wood regarding a suspension stemming from an\\incident earlier this season.'
2 (Business) -> b'Bush reform may have blue states seeing red' b'President Bush #39;s quot;revenue-neutral quot; tax reform needs losers to balance its winners, and people claiming the federal deduction for state and local taxes may be in administration planners #39; sights, news reports say.'
3 (Sci/Tech) -> b"'Halt science decline in schools'" b'Britain will run out of leading scientists unless science education is improved, says Professor Colin Pillinger.'
1 (Sports) -> b'Gerrard leaves practice' b'London, England (Sports Network) - England midfielder Steven Gerrard injured his groin late in Thursday #39;s training session, but is hopeful he will be ready for Saturday #39;s World Cup qualifier against Austria.'
```

## Text vectorization

Now we need to convert text into **numbers** that can be represented as tensors. If we want word-level representation, we need to do two things:

* Use a **tokenizer** to split text into **tokens**.
* Build a **vocabulary** of those tokens.

### Limiting vocabulary size

In the AG News dataset example, the vocabulary size is rather big, more than 100k words. Generally speaking, we don't need words that are rarely present in the text &mdash; only a few sentences will have them, and the model will not learn from them. Thus, it makes sense to limit the vocabulary size to a smaller number by passing an argument to the vectorizer constructor:

Both of those steps can be handled using the **TextVectorization** layer. Let's instantiate the vectorizer object, and then call the `adapt` method to go through all text and build a vocabulary:

```python
vocab_size = 50000
vectorizer = keras.layers.experimental.preprocessing.TextVectorization(max_tokens=vocab_size)
vectorizer.adapt(ds_train.take(500).map(lambda x: x['title']+' '+x['description']))
```

> **Note** that we are using only subset of the whole dataset to build a vocabulary. We do it to speed up the execution time and not keep you waiting. However, we are taking the risk that some of the words from the whole dateset would not be included into the vocabulary, and will be ignored during training. Thus, using the whole vocabulary size and running through all dataset during `adapt` should increase the final accuracy, but not significantly.

Now we can access the actual vocabulary:

```python
vocab = vectorizer.get_vocabulary()
vocab_size = len(vocab)
print(vocab[:10])
print(f"Length of vocabulary: {vocab_size}")
```

Output:
```text
['', '[UNK]', 'the', 'to', 'a', 'in', 'of', 'and', 'on', 'for']
Length of vocabulary: 5335
```

Using the vectorizer, we can easily encode any text into a set of numbers:

```python
vectorizer('I love to play with my words')
```

Output:
```text
<tf.Tensor: shape=(7,), dtype=int64, numpy=array([ 112, 3695, 3, 304, 11, 1041, 1], dtype=int64)>
```

## Bag-of-words text representation

Because words represent meaning, sometimes we can figure out the meaning of a piece of text by just looking at the individual words, regardless of their order in the sentence. For example, when classifying news, words like *weather* and *snow* are likely to indicate *weather forecast*, while words like *stocks* and *dollar* would count towards *financial news*.

**Bag-of-words** (BoW) vector representation is the most simple to understand traditional vector representation. Each word is linked to a vector index, and a vector element contains the number of occurrences of each word in a given document.

![Image showing how a bag of words vector representation is represented in memory.](images/bag-of-words-example.png)

> **Note**: You can also think of BoW as a sum of all one-hot-encoded vectors for individual words in the text.

Below is an example of how to generate a bag-of-words representation using the Scikit Learn python library:

```python
from sklearn.feature_extraction.text import CountVectorizer
sc_vectorizer = CountVectorizer()
corpus = [
'I like hot dogs.',
'The dog ran fast.',
'Its hot outside.',
]
sc_vectorizer.fit_transform(corpus)
sc_vectorizer.transform(['My dog likes hot dogs on a hot day.']).toarray()
```

Output:
```text
array([[1, 1, 0, 2, 0, 0, 0, 0, 0]], dtype=int64)
```

We can also use the Keras vectorizer that we defined above, converting each word number into a one-hot encoding and adding all those vectors up:

```python
def to_bow(text):
return tf.reduce_sum(tf.one_hot(vectorizer(text),vocab_size),axis=0)

to_bow('My dog likes hot dogs on a hot day.').numpy()
```

Output:
```text
array([0., 5., 0., ..., 0., 0., 0.], dtype=float32)
```

> **Note**: You may be surprised that the result differs from the previous example. The reason is that in the Keras example the length of the vector corresponds to the vocabulary size, which was built from the whole AG News dataset, while in the Scikit Learn example we built the vocabulary from the sample text on the fly.

## Training the BoW classifier

Now that we have learned how to build the bag-of-words representation of our text, let's train a classifier that uses it. First, we need to convert our dataset to a bag-of-words representation. This can be achieved by using `map` function in the following way:

```python
batch_size = 128

ds_train_bow = ds_train.map(lambda x: (to_bow(x['title']+x['description']),x['label'])).batch(batch_size)
ds_test_bow = ds_test.map(lambda x: (to_bow(x['title']+x['description']),x['label'])).batch(batch_size)
```

Now let's define a simple classifier neural network that contains one linear layer. The input size is `vocab_size`, and the output size corresponds to the number of classes (4). Because we're solving a classification task, the final activation function is **softmax**:

```python
model = keras.models.Sequential([
keras.layers.Dense(4,activation='softmax',input_shape=(vocab_size,))
])
model.compile(loss='sparse_categorical_crossentropy',optimizer='adam',metrics=['acc'])
model.fit(ds_train_bow,validation_data=ds_test_bow)
```

Output:
```text
938/938 [==============================] - 66s 70ms/step - loss: 0.6144 - acc: 0.8427 - val_loss: 0.4416 - val_acc: 0.8697

<keras.callbacks.History at 0x20c70a947f0>
```

Since we have 4 classes, an accuracy of above 80% is a good result.

## Training a classifier as one network

Because the vectorizer is also a Keras layer, we can define a network that includes it, and train it end-to-end. This way we don't need to vectorize the dataset using `map`, we can just pass the original dataset to the input of the network.

> **Note**: We would still have to apply maps to our dataset to convert fields from dictionaries (such as `title`, `description` and `label`) to tuples. However, when loading data from disk, we can build a dataset with the required structure in the first place.

```python
def extract_text(x):
return x['title']+' '+x['description']

def tupelize(x):
return (extract_text(x),x['label'])

inp = keras.Input(shape=(1,),dtype=tf.string)
x = vectorizer(inp)
x = tf.reduce_sum(tf.one_hot(x,vocab_size),axis=1)
out = keras.layers.Dense(4,activation='softmax')(x)
model = keras.models.Model(inp,out)
model.summary()

model.compile(loss='sparse_categorical_crossentropy',optimizer='adam',metrics=['acc'])
model.fit(ds_train.map(tupelize).batch(batch_size),validation_data=ds_test.map(tupelize).batch(batch_size))
```

Output:
```text
Model: "model"
_________________________________________________________________
Layer (type) Output Shape Param #
=================================================================
input_1 (InputLayer) [(None, 1)] 0

text_vectorization (TextVec (None, None) 0
torization)

tf.one_hot (TFOpLambda) (None, None, 5335) 0

tf.math.reduce_sum (TFOpLam (None, 5335) 0
bda)

dense_2 (Dense) (None, 4) 21344

=================================================================
Total params: 21,344
Trainable params: 21,344
Non-trainable params: 0
_________________________________________________________________
938/938 [==============================] - 73s 77ms/step - loss: 0.6057 - acc: 0.8414 - val_loss: 0.4202 - val_acc: 0.8736

<keras.callbacks.History at 0x20c721521f0>
```

## Bigrams, trigrams and n-grams

One limitation of the bag-of-words approach is that some words are part of multi-word expressions, for example, the word 'hot dog' has a completely different meaning from the words 'hot' and 'dog' in other contexts. If we represent the words 'hot' and 'dog' always using the same vectors, it can confuse our model.

To address this, **n-gram representations** are often used in methods of document classification, where the frequency of each word, bi-word or tri-word is a useful feature for training classifiers. In bigram representations, for example, we will add all word pairs to the vocabulary, in addition to original words.

Below is an example of how to generate a bigram bag of word representation using Scikit Learn:

```python
bigram_vectorizer = CountVectorizer(ngram_range=(1, 2), token_pattern=r'\b\w+\b', min_df=1)
corpus = [
'I like hot dogs.',
'The dog ran fast.',
'Its hot outside.',
]
bigram_vectorizer.fit_transform(corpus)
print("Vocabulary:\n",bigram_vectorizer.vocabulary_)
bigram_vectorizer.transform(['My dog likes hot dogs on a hot day.']).toarray()
```

Output:
```text
Vocabulary:
{'i': 7, 'like': 11, 'hot': 4, 'dogs': 2, 'i like': 8, 'like hot': 12, 'hot dogs': 5, 'the': 16, 'dog': 0, 'ran': 14, 'fast': 3, 'the dog': 17, 'dog ran': 1, 'ran fast': 15, 'its': 9, 'outside': 13, 'its hot': 10, 'hot outside': 6}

array([[1, 0, 1, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
dtype=int64)
```

The main drawback of the n-gram approach is that the vocabulary size starts to grow extremely fast. In practice, we need to combine the n-gram representation with a dimensionality reduction technique, such as *embeddings*, which we will discuss in the next unit.

To use an n-gram representation in our **AG News** dataset, we need to pass the `ngrams` parameter to our `TextVectorization` constructor. The length of a bigram vocaculary is **significantly larger**, in our case it is more than 1.3 million tokens! Thus it makes sense to limit bigram tokens as well by some reasonable number.

We could use the same code as above to train the classifier, however, it would be very memory-inefficient. In the next unit, we will train the bigram classifier using embeddings. In the meantime, you can experiment with bigram classifier training in this notebook and see if you can get higher accuracy.

## Automatically calculating BoW Vectors

In the example above we calculated BoW vectors by hand by summing the one-hot encodings of individual words. However, the latest version of TensorFlow allows us to calculate BoW vectors automatically by passing the `output_mode='count` parameter to the vectorizer constructor. This makes defining and training our model significanly easier:

```python
model = keras.models.Sequential([
keras.layers.experimental.preprocessing.TextVectorization(max_tokens=vocab_size,output_mode='count'),
keras.layers.Dense(4,input_shape=(vocab_size,), activation='softmax')
])
print("Training vectorizer")
model.layers[0].adapt(ds_train.take(500).map(extract_text))
model.compile(loss='sparse_categorical_crossentropy',optimizer='adam',metrics=['acc'])
model.fit(ds_train.map(tupelize).batch(batch_size),validation_data=ds_test.map(tupelize).batch(batch_size))
```

Output:
```text
Training vectorizer
938/938 [==============================] - 7s 7ms/step - loss: 0.5929 - acc: 0.8486 - val_loss: 0.4168 - val_acc: 0.8772

<keras.callbacks.History at 0x20c725217c0>
```

## Term frequency - inverse document frequency (TF-IDF)

In BoW representation, word occurrences are weighted using the same technique regardless of the word itself. However, it's clear that frequent words such as *a* and *in* are much less important for classification than specialized terms. In most NLP tasks some words are more relevant than others.

**TF-IDF** stands for **term frequency - inverse document frequency**. It's a variation of bag-of-words, where instead of a binary 0/1 value indicating the appearance of a word in a document, a floating-point value is used, which is related to the frequency of the word occurrence in the corpus.

More formally, the weight $w_{ij}$ of a word $i$ in the document $j$ is defined as:
$$
w_{ij} = tf_{ij}\times\log({N\over df_i})
$$
where
* $tf_{ij}$ is the number of occurrences of $i$ in $j$, i.e. the BoW value we have seen before
* $N$ is the number of documents in the collection
* $df_i$ is the number of documents containing the word $i$ in the whole collection

The TF-IDF value $w_{ij}$ increases proportionally to the number of times a word appears in a document and is offset by the number of documents in the corpus that contains the word, which helps to adjust for the fact that some words appear more frequently than others. For example, if the word appears in *every* document in the collection, $df_i=N$, and $w_{ij}=0$, and those terms would be completely disregarded.

You can easily create TF-IDF vectorization of text using Scikit Learn:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
vectorizer = TfidfVectorizer(ngram_range=(1,2))
vectorizer.fit_transform(corpus)
vectorizer.transform(['My dog likes hot dogs on a hot day.']).toarray()
```

Output:
```text
array([[0.43381609, 0. , 0.43381609, 0. , 0.65985664,
0.43381609, 0. , 0. , 0. , 0. ,
0. , 0. , 0. , 0. , 0. ,
0. ]])
```

In Keras, the `TextVectorization` layer can automatically compute TF-IDF frequencies by passing the `output_mode='tf-idf'` parameter. Let's repeat the code we used above to see if using TF-IDF increases accuracy:

```python
model = keras.models.Sequential([
keras.layers.experimental.preprocessing.TextVectorization(max_tokens=vocab_size,output_mode='tf-idf'),
keras.layers.Dense(4,input_shape=(vocab_size,), activation='softmax')
])
print("Training vectorizer")
model.layers[0].adapt(ds_train.take(500).map(extract_text))
model.compile(loss='sparse_categorical_crossentropy',optimizer='adam',metrics=['acc'])
model.fit(ds_train.map(tupelize).batch(batch_size),validation_data=ds_test.map(tupelize).batch(batch_size))
```

Output:
```text
Training vectorizer
938/938 [==============================] - 12s 12ms/step - loss: 0.4197 - acc: 0.8662 - val_loss: 0.3432 - val_acc: 0.8849

<keras.callbacks.History at 0x20c729dfd30>
```

## Conclusion

Even though TF-IDF representations provide frequency weights to different words, they are unable to represent meaning or order. As the famous linguist J. R. Firth said in 1935, "The complete meaning of a word is always contextual, and no study of meaning apart from context can be taken seriously." We will learn how to capture contextual information from text using language modeling later in the course.
