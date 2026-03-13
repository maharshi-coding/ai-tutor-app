# Attention mechanisms and transformers

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/5-NLP/18-Transformers/TransformersTF.ipynb
Original Path: lessons/5-NLP/18-Transformers/TransformersTF.ipynb
Course: Artificial Intelligence

# Attention mechanisms and transformers

One major drawback of recurrent networks is that all words in a sequence have the same impact on the result. This causes sub-optimal performance with standard LSTM encoder-decoder models for sequence to sequence tasks, such as Named Entity Recognition and Machine Translation. In reality specific words in the input sequence often have more impact on sequential outputs than others.

Consider sequence-to-sequence model, such as machine translation. It is implemented by two recurrent networks, where one network (**encoder**) would collapse input sequence into hidden state, and another one, **decoder**, would unroll this hidden state into translated result. The problem with this approach is that final state of the network would have hard time remembering the beginning of a sentence, thus causing poor quality of the model on long sentences.

**Attention Mechanisms** provide a means of weighting the contextual impact of each input vector on each output prediction of the RNN. The way it is implemented is by creating shortcuts between intermediate states of the input RNN, and output RNN. In this manner, when generating output symbol $y_t$, we will take into account all input hidden states $h_i$, with different weight coefficients $\alpha_{t,i}$.

![Image showing an encoder/decoder model with an additive attention layer](images/encoder-decoder-attention.png)
*The encoder-decoder model with additive attention mechanism in [Bahdanau et al., 2015](https://arxiv.org/pdf/1409.0473.pdf), cited from [this blog post](https://lilianweng.github.io/lil-log/2018/06/24/attention-attention.html)*

Attention matrix $\{\alpha_{i,j}\}$ would represent the degree which certain input words play in generation of a given word in the output sequence. Below is the example of such a matrix:

![Image showing a sample alignment found by RNNsearch-50, taken from Bahdanau - arviz.org](images/bahdanau-fig3.png)

*Figure taken from [Bahdanau et al., 2015](https://arxiv.org/pdf/1409.0473.pdf) (Fig.3)*

Attention mechanisms are responsible for much of the current or near current state of the art in Natural language processing. Adding attention however greatly increases the number of model parameters which led to scaling issues with RNNs. A key constraint of scaling RNNs is that the recurrent nature of the models makes it challenging to batch and parallelize training. In an RNN each element of a sequence needs to be processed in sequential order which means it cannot be easily parallelized.

Adoption of attention mechanisms combined with this constraint led to the creation of the now State of the Art Transformer Models that we know and use today from BERT to OpenGPT3.

## Transformer models

Instead of forwarding the context of each previous prediction into the next evaluation step, **transformer models** use **positional encodings** and **attention** to capture the context of a given input with in a provided window of text. The image below shows how positional encodings with attention can capture context within a given window.

![Animated GIF showing how the evaluations are performed in transformer models.](images/transformer-animated-explanation.gif)

Since each input position is mapped independently to each output position, transformers can parallelize better than RNNs, which enables much larger and more expressive language models. Each attention head can be used to learn different relationships between words that improves downstream Natural Language Processing tasks.

## Building Simple Transformer Model

Keras does not contain built-in Transformer layer, but we can build our own. As before, we will focus on text classification of AG News dataset, but it is worth mentioning that Transformer models show best result at more difficult NLP tasks.

```python
import tensorflow as tf
from tensorflow import keras
import tensorflow_datasets as tfds
import numpy as np

ds_train, ds_test = tfds.load('ag_news_subset').values()

def extract_text(x):
return x['title']+' '+x['description']

def tupelize(x):
return (extract_text(x),x['label'])
```

New layers in Keras should subclass `Layer` class, and implement `call` method. Let's start with **Positional Embedding** layer. We will use [some code from official Keras documentation](https://keras.io/examples/nlp/text_classification_with_transformer/). We will assume that we pad all input sequences to length `maxlen`.

```python
class TokenAndPositionEmbedding(keras.layers.Layer):
def __init__(self, maxlen, vocab_size, embed_dim):
super(TokenAndPositionEmbedding, self).__init__()
self.token_emb = keras.layers.Embedding(input_dim=vocab_size, output_dim=embed_dim)
self.pos_emb = keras.layers.Embedding(input_dim=maxlen, output_dim=embed_dim)
self.maxlen = maxlen

def call(self, x):
maxlen = self.maxlen
positions = tf.range(start=0, limit=maxlen, delta=1)
positions = self.pos_emb(positions)
x = self.token_emb(x)
return x+positions
```

This layer consists of two `Embedding` layers: for embedding tokens (in a way we have discussed before) and token positions. Token positions are created as a sequence of natural numbers from 0 to `maxlen` using `tf.range`, and then passed through embedding layer. Two resulting embedding vectors are then added, producing positionally-embedded reporesentation of input of shape `maxlen`$\times$`embed_dim`.

<img src="images/pos-embedding.png" width="40%"/>

Now, let's implement the transformer block. It will take the output of previously defined embedding layer:

```python
class TransformerBlock(keras.layers.Layer):
def __init__(self, embed_dim, num_heads, ff_dim, rate=0.1):
super(TransformerBlock, self).__init__()
self.att = keras.layers.MultiHeadAttention(num_heads=num_heads, key_dim=embed_dim, name='attn')
self.ffn = keras.Sequential(
[keras.layers.Dense(ff_dim, activation="relu"), keras.layers.Dense(embed_dim),]
)
self.layernorm1 = keras.layers.LayerNormalization(epsilon=1e-6)
self.layernorm2 = keras.layers.LayerNormalization(epsilon=1e-6)
self.dropout1 = keras.layers.Dropout(rate)
self.dropout2 = keras.layers.Dropout(rate)

def call(self, inputs, training):
attn_output = self.att(inputs, inputs)
attn_output = self.dropout1(attn_output, training=training)
out1 = self.layernorm1(inputs + attn_output)
ffn_output = self.ffn(out1)
ffn_output = self.dropout2(ffn_output, training=training)
return self.layernorm2(out1 + ffn_output)
```

Transformer applies `MultiHeadAttention` to the positionally-encoded input to produce the attention vector of the dimension `maxlen`$\times$`embed_dim`, which is them mixed with input and normalized using `LayerNormalizaton`.

> **Note**: `LayerNormalization` is similar to `BatchNormalization` discussed in the *Computer Vision* part of this learning path, but it normalizes outputs of the previous layer for each training sample independently, to bring them to the range [-1..1].

Output of this layer is then passed through `Dense` network (in our case - two-layer perceptron), and the result is added to the final output (which undergoes normalization again).

<img src="images/transformer-layer.png" width="30%" />

Now, we are ready to define complete transformer model:

```python
embed_dim = 32 # Embedding size for each token
num_heads = 2 # Number of attention heads
ff_dim = 32 # Hidden layer size in feed forward network inside transformer
maxlen = 256
vocab_size = 20000

model = keras.models.Sequential([
keras.layers.experimental.preprocessing.TextVectorization(max_tokens=vocab_size,output_sequence_length=maxlen, input_shape=(1,)),
TokenAndPositionEmbedding(maxlen, vocab_size, embed_dim),
TransformerBlock(embed_dim, num_heads, ff_dim),
keras.layers.GlobalAveragePooling1D(),
keras.layers.Dropout(0.1),
keras.layers.Dense(20, activation="relu"),
keras.layers.Dropout(0.1),
keras.layers.Dense(4, activation="softmax")
])

model.summary()
```

Output:
```text
Model: "sequential_1"
_________________________________________________________________
Layer (type) Output Shape Param #
=================================================================
text_vectorization (TextVect (None, 256) 0
_________________________________________________________________
token_and_position_embedding (None, 256, 32) 648192
_________________________________________________________________
transformer_block (Transform (None, 256, 32) 10656
_________________________________________________________________
global_average_pooling1d (Gl (None, 32) 0
_________________________________________________________________
dropout_2 (Dropout) (None, 32) 0
_________________________________________________________________
dense_2 (Dense) (None, 20) 660
_________________________________________________________________
dropout_3 (Dropout) (None, 20) 0
_________________________________________________________________
dense_3 (Dense) (None, 4) 84
=================================================================
Total params: 659,592
Trainable params: 659,592
Non-trainable params: 0
_________________________________________________________________
```

```python
print('Training tokenizer')
model.layers[0].adapt(ds_train.map(extract_text))
model.compile(loss='sparse_categorical_crossentropy',metrics=['acc'], optimizer='adam')
model.fit(ds_train.map(tupelize).batch(128),validation_data=ds_test.map(tupelize).batch(128))
```

Output:
```text
Training tokenizer
938/938 [==============================] - 45s 39ms/step - loss: 0.4978 - acc: 0.8068 - val_loss: 0.2808 - val_acc: 0.9124

<tensorflow.python.keras.callbacks.History at 0x7f9c2427a0d0>
```

## BERT Transformer Models

**BERT** (Bidirectional Encoder Representations from Transformers) is a very large multi layer transformer network with 12 layers for *BERT-base*, and 24 for *BERT-large*. The model is first pre-trained on large corpus of text data (WikiPedia + books) using unsupervised training (predicting masked words in a sentence). During pre-training the model absorbs significant level of language understanding which can then be leveraged with other datasets using fine tuning. This process is called **transfer learning**.

![picture from http://jalammar.github.io/illustrated-bert/](./images/jalammarBERT-language-modeling-masked-lm.png)

There are many variations of Transformer architectures including BERT, DistilBERT. BigBird, OpenGPT3 and more that can be fine tuned.

Let's see how we can use pre-trained BERT model for solving our traditional sequence classification problem. We will borrow the idea and some code from [official documentation](https://www.tensorflow.org/text/tutorials/classify_text_with_bert).

To load pre-trained models, we will use **Tensorflow hub**. First, let's load the BERT-specific vectorizer:

```python
import tensorflow_text
import tensorflow_hub as hub
vectorizer = hub.KerasLayer('https://tfhub.dev/tensorflow/bert_en_uncased_preprocess/3')
```

```python
vectorizer(['I love transformers'])
```

Output:
```text
{'input_type_ids': <tf.Tensor: shape=(1, 128), dtype=int32, numpy=
array([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
dtype=int32)>,
'input_word_ids': <tf.Tensor: shape=(1, 128), dtype=int32, numpy=
array([[ 101, 1045, 2293, 19081, 102, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0,
```

It is important that you use the same vectorizer as the one that the original network was trained on. Also, BERT vectorizer returns three components:
* `input_word_ids`, which is a sequence of token numbers for input sentence
* `input_mask`, showing which part of the sequence contains actual input, and which one is padding. It is similar to the mask produced by `Masking` layer
* `input_type_ids` is used for language modeling tasks, and allows to specify two input sentences in one sequence.

Then, we can instantiate BERT feature extractor:

```python
bert = hub.KerasLayer('https://tfhub.dev/tensorflow/small_bert/bert_en_uncased_L-4_H-128_A-2/1')
```

```python
z = bert(vectorizer(['I love transformers']))
for i,x in z.items():
print(f"{i} -> { len(x) if isinstance(x, list) else x.shape }")
```

Output:
```text
pooled_output -> (1, 128)
encoder_outputs -> 4
sequence_output -> (1, 128, 128)
default -> (1, 128)
```

So, BERT layer returns a number of useful results:
* `pooled_output` is a result of averaging out all tokens in the sequence. You can view it as an intelligent semantic embedding of the whole network. It is equivalent to the output of `GlobalAveragePooling1D` layer in our previous model.
* `sequence_output` is the output of the last transformer layer (corresponds to the output of `TransformerBlock` in our model above)
* `encoder_outputs` are the outputs of all transformer layers. Since we have loaded 4-layer BERT model (as you can probably guess from the name, which contains `4_H`), it has 4 tensors. The last one is the same as `sequence_output`.

Now we will define the end-to-end classification model. We will use *functional model definition*, when we define model input, and then provide a series of expressions to calculate its output. We will also make BERT model weights not-trainable, and train just the final classifier:

```python
inp = keras.Input(shape=(),dtype=tf.string)
x = vectorizer(inp)
x = bert(x)
x = keras.layers.Dropout(0.1)(x['pooled_output'])
out = keras.layers.Dense(4,activation='softmax')(x)
model = keras.models.Model(inp,out)
bert.trainable = False
model.summary()
```

Output:
```text
Model: "model"
__________________________________________________________________________________________________
Layer (type) Output Shape Param # Connected to
==================================================================================================
input_1 (InputLayer) [(None,)] 0
__________________________________________________________________________________________________
keras_layer (KerasLayer) {'input_type_ids': ( 0 input_1[0][0]
__________________________________________________________________________________________________
keras_layer_1 (KerasLayer) {'pooled_output': (N 4782465 keras_layer[0][0]
keras_layer[0][1]
keras_layer[0][2]
__________________________________________________________________________________________________
dropout_4 (Dropout) (None, 128) 0 keras_layer_1[0][5]
__________________________________________________________________________________________________
dense_4 (Dense) (None, 4) 516 dropout_4[0][0]
==================================================================================================
Total params: 4,782,981
Trainable params: 516
Non-trainable params: 4,782,465
______________________
```

```python
model.compile(loss='sparse_categorical_crossentropy',metrics=['acc'], optimizer='adam')
model.fit(ds_train.map(tupelize).batch(128),validation_data=ds_test.map(tupelize).batch(128))
```

Output:
```text
938/938 [==============================] - 528s 559ms/step - loss: 0.8056 - acc: 0.6983 - val_loss: 0.5953 - val_acc: 0.7888

<tensorflow.python.keras.callbacks.History at 0x7f9bb1e36d00>
```

Despite the fact that there are few trainable parameters, the process is pretty slow, because BERT feature extractor is computationally heavy. It looks like we were unable to achieve reasonable accuracy, either due to lack of training, or lack of model parameters.

Let's try to unfreeze BERT weights and train it as well. This requires very small learning rate, and also more careful training strategy with **warmup**, using **AdamW** optimizer. We will use `tf-models-official` package to create the optimizer:

```python
from official.nlp import optimization
bert.trainable=True
model.summary()
epochs = 3
opt = optimization.create_optimizer(
init_lr=3e-5,
num_train_steps=epochs*len(ds_train),
num_warmup_steps=0.1*epochs*len(ds_train),
optimizer_type='adamw')

model.compile(loss='sparse_categorical_crossentropy',metrics=['acc'], optimizer=opt)
model.fit(ds_train.map(tupelize).batch(128),validation_data=ds_test.map(tupelize).batch(128))
```

Output:
```text
Model: "model"
__________________________________________________________________________________________________
Layer (type) Output Shape Param # Connected to
==================================================================================================
input_1 (InputLayer) [(None,)] 0
__________________________________________________________________________________________________
keras_layer (KerasLayer) {'input_type_ids': ( 0 input_1[0][0]
__________________________________________________________________________________________________
keras_layer_1 (KerasLayer) {'pooled_output': (N 4782465 keras_layer[0][0]
keras_layer[0][1]
keras_layer[0][2]
__________________________________________________________________________________________________
dropout_4 (Dropout) (None, 128) 0 keras_layer_1[0][5]
__________________________________________________________________________________________________
dense_4 (Dense) (None, 4) 516 dropout_4[0][0]
==================================================================================================
Total params: 4,782,981
Trainable params: 4,782,980
Non-trainable params: 1
________________________

<tensorflow.python.keras.callbacks.History at 0x7f9bb0bd0070>
```

As you can see, the training goes quite slowly - but you may want to experiment and train the model for a few epochs (5-10) and see if you can get the best result comparing to the approaches we have used before.

## Huggingface Transformers Library

Another very common (and a bit simpler) way to use Transformer models is [HuggingFace package](https://github.com/huggingface/), which provides simple building blocks for different NLP tasks. It is available both for Tensorflow and PyTorch, another very popular neural network framework.

> **Note**: If you are not interested in seeing how Transformers library works - you may skip to the end of this notebook, because you will not see anything substantially different from what we have done above. We will be repeating the same steps of training BERT model using different library and substantially larger model. Thus, the process involves some rather long training, so you may want just to look through the code.

Let's see how our problem can be solved using [Huggingface Transformers](http://huggingface.co).

First thing we need to do is to chose the model that we will be using. In addition to some built-in models, Huggingface contains an [online model repository](https://huggingface.co/models), where you can find a lot more pre-trained models by the community. All of those models can be loaded and used just by providing a model name. All required binary files for the model would automatically be downloaded.

At certain times you would need to load your own models, in which case you can specify the directory that contains all relevant files, including parameters for tokenizer, `config.json` file with model parameters, binary weights, etc.

From model name, we can instantiate both the model and the tokenizer. Let's start with a tokenizer:

```python
import transformers

# To load the model from Internet repository using model name.
# Use this if you are running from your own copy of the notebooks
bert_model = 'bert-base-uncased'

# To load the model from the directory on disk. Use this for Microsoft Learn module, because we have
# prepared all required files for you.
#bert_model = './bert'

tokenizer = transformers.BertTokenizer.from_pretrained(bert_model)

MAX_SEQ_LEN = 128
PAD_INDEX = tokenizer.convert_tokens_to_ids(tokenizer.pad_token)
UNK_INDEX = tokenizer.convert_tokens_to_ids(tokenizer.unk_token)
```

The `tokenizer` object contains the `encode` function that can be directly used to encode text:

```python
tokenizer.encode('Tensorflow is a great framework for NLP')
```

Output:
```text
[101, 23435, 12314, 2003, 1037, 2307, 7705, 2005, 17953, 2361, 102]
```

We can also use tokenizer to encode a sequence is a way suitable for passing to the model, i.e. including `token_ids`, `input_mask` fields, etc. We can also specify that we want Tensorflow tensors by providing `return_tensors='tf'` argument:

```python
tokenizer(['Hello, there'],return_tensors='tf')
```

Output:
```text
{'input_ids': <tf.Tensor: shape=(1, 5), dtype=int32, numpy=array([[ 101, 7592, 1010, 2045, 102]], dtype=int32)>, 'token_type_ids': <tf.Tensor: shape=(1, 5), dtype=int32, numpy=array([[0, 0, 0, 0, 0]], dtype=int32)>, 'attention_mask': <tf.Tensor: shape=(1, 5), dtype=int32, numpy=array([[1, 1, 1, 1, 1]], dtype=int32)>}
```

In our case, we will be using pre-trained BERT model called `bert-base-uncased`. *Uncased* indicates that the model in case-insensitive.

When training the model, we need to provide tokenized sequence as input, and thus we will design data processing pipeline. Since `tokenizer.encode` is a Python function, we will use the same approach as in the last unit with calling it using `py_function`:

```python
def process(x):
return tokenizer.encode(x.numpy().decode('utf-8'),return_tensors='tf',padding='max_length',max_length=MAX_SEQ_LEN,truncation=True)[0]

def process_fn(x):
s = x['title']+' '+x['description']
e = tf.py_function(process,inp=[s],Tout=(tf.int32))
e.set_shape(MAX_SEQ_LEN)
return e,x['label']
```

Now we can load the actual model using `BertForSequenceClassfication` package. This ensures that our model already has a required architecture for classification, including final classifier. You will see warning message stating that weights of the final classifier are not initialized, and model would require pre-training - that is perfectly okay, because it is exactly what we are about to do!

```python
model = transformers.TFBertForSequenceClassification.from_pretrained(bert_model,num_labels=4,output_attentions=False)
```

```python
model.summary()
```

Output:
```text
Model: "tf_bert_for_sequence_classification_1"
_________________________________________________________________
Layer (type) Output Shape Param #
=================================================================
bert (TFBertMainLayer) multiple 109482240
_________________________________________________________________
dropout_75 (Dropout) multiple 0
_________________________________________________________________
classifier (Dense) multiple 3076
=================================================================
Total params: 109,485,316
Trainable params: 109,485,316
Non-trainable params: 0
_________________________________________________________________
```

As you can see from `summary()`, the model contains almost 110 million parameters! Presumably, if we want simple classification task on relatively small dataset, we do not want to train the BERT base layer:

```python
model.layers[0].trainable = False
model.summary()
```

Output:
```text
Model: "tf_bert_for_sequence_classification_1"
_________________________________________________________________
Layer (type) Output Shape Param #
=================================================================
bert (TFBertMainLayer) multiple 109482240
_________________________________________________________________
dropout_75 (Dropout) multiple 0
_________________________________________________________________
classifier (Dense) multiple 3076
=================================================================
Total params: 109,485,316
Trainable params: 3,076
Non-trainable params: 109,482,240
_________________________________________________________________
```

Now we are ready to begin training!

> **Note**: Training full-scale BERT model can be very time consuming! Thus we will only train it for the first 32 batches. This is just to show how model training is set up. If you are interested to try full-scale training - just remove `steps_per_epoch` and `validation_steps` parameters, and prepare to wait!

```python
model.compile('adam','sparse_categorical_crossentropy',['acc'])
tf.get_logger().setLevel('ERROR')
model.fit(ds_train.map(process_fn).batch(32),validation_data=ds_test.map(process_fn).batch(32),steps_per_epoch=32,validation_steps=2)
```

Output:
```text
32/32 [==============================] - 142s 4s/step - loss: 1.3896 - acc: 0.2500 - val_loss: 1.3863 - val_acc: 0.2480

<tensorflow.python.keras.callbacks.History at 0x7f1d40a4b6a0>
```

If you increase the number of iterations and wait long enough, and train for several epochs, you can expect that BERT classification gives us the best accuracy! That is because BERT already understands quite well the structure of the language, and we only need to fine-tune final classifier. However, because BERT is a large model, the whole training process takes a long time, and requires serious computational power! (GPU, and preferably more than one).

> **Note:** In our example, we have been using one of the smallest pre-trained BERT models. There are larger models that are likely to yield better results.

## Takeaway

In this unit, we have seen very recent model architectures based on **transformers**. We have applied them for our text classification task, but similarly, BERT models can be used for entity extraction, question answering, and other NLP tasks.

Transformer models represent current state-of-the-art in NLP, and in most of the cases it should be the first solution you start experimenting with when implementing custom NLP solutions. However, understanding basic underlying principles of recurrent neural networks discussed in this module is extremely important if you want to build advanced neural models.
