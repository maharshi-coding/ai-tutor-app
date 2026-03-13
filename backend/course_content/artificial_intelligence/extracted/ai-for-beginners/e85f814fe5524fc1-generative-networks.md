# Generative networks

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/5-NLP/17-GenerativeNetworks/GenerativePyTorch.ipynb
Original Path: lessons/5-NLP/17-GenerativeNetworks/GenerativePyTorch.ipynb
Course: Artificial Intelligence

# Generative networks

Recurrent Neural Networks (RNNs) and their gated cell variants such as Long Short Term Memory Cells (LSTMs) and Gated Recurrent Units (GRUs) provided a mechanism for language modeling, i.e. they can learn word ordering and provide predictions for next word in a sequence. This allows us to use RNNs for **generative tasks**, such as ordinary text generation, machine translation, and even image captioning.

In RNN architecture we discussed in the previous unit, each RNN unit produced next hidden state as an output. However, we can also add another output to each recurrent unit, which would allow us to output a **sequence** (which is equal in length to the original sequence). Moreover, we can use RNN units that do not accept an input at each step, and just take some initial state vector, and then produce a sequence of outputs.

In this notebook, we will focus on simple generative models that help us generate text. For simplicity, let's build **character-level network**, which generates text letter by letter. During training, we need to take some text corpus, and split it into letter sequences.

```python
import torch
import torchtext
import numpy as np
from torchnlp import *
train_dataset,test_dataset,classes,vocab = load_dataset()
```

Output:
```text
Loading dataset...
Building vocab...
```

## Building character vocabulary

To build character-level generative network, we need to split text into individual characters instead of words. This can be done by defining a different tokenizer:

```python
def char_tokenizer(words):
return list(words) #[word for word in words]

counter = collections.Counter()
for (label, line) in train_dataset:
counter.update(char_tokenizer(line))
vocab = torchtext.vocab.vocab(counter)

vocab_size = len(vocab)
print(f"Vocabulary size = {vocab_size}")
print(f"Encoding of 'a' is {vocab.get_stoi()['a']}")
print(f"Character with code 13 is {vocab.get_itos()[13]}")
```

Output:
```text
Vocabulary size = 82
Encoding of 'a' is 1
Character with code 13 is c
```

Let's see the example of how we can encode the text from our dataset:

```python
def enc(x):
return torch.LongTensor(encode(x,voc=vocab,tokenizer=char_tokenizer))

enc(train_dataset[0][1])
```

Output:
```text
tensor([ 0, 1, 2, 2, 3, 4, 5, 6, 3, 7, 8, 1, 9, 10, 3, 11, 2, 1,
12, 3, 7, 1, 13, 14, 3, 15, 16, 5, 17, 3, 5, 18, 8, 3, 7, 2,
1, 13, 14, 3, 19, 20, 8, 21, 5, 8, 9, 10, 22, 3, 20, 8, 21, 5,
8, 9, 10, 3, 23, 3, 4, 18, 17, 9, 5, 23, 10, 8, 2, 2, 8, 9,
10, 24, 3, 0, 1, 2, 2, 3, 4, 5, 9, 8, 8, 5, 25, 10, 3, 26,
12, 27, 16, 26, 2, 27, 16, 28, 29, 30, 1, 16, 26, 3, 17, 31, 3, 21,
2, 5, 9, 1, 23, 13, 32, 16, 27, 13, 10, 24, 3, 1, 9, 8, 3, 10,
8, 8, 27, 16, 28, 3, 28, 9, 8, 8, 16, 3, 1, 28, 1, 27, 16, 6])
```

## Training a generative RNN

The way we will train RNN to generate text is the following. On each step, we will take a sequence of characters of length `nchars`, and ask the network to generate next output character for each input character:

![Image showing an example RNN generation of the word 'HELLO'.](images/rnn-generate.png)

Depending on the actual scenario, we may also want to include some special characters, such as *end-of-sequence* `<eos>`. In our case, we just want to train the network for endless text generation, thus we will fix the size of each sequence to be equal to `nchars` tokens. Consequently, each training example will consist of `nchars` inputs and `nchars` outputs (which are input sequence shifted one symbol to the left). Minibatch will consist of several such sequences.

The way we will generate minibatches is to take each news text of length `l`, and generate all possible input-output combinations from it (there will be `l-nchars` such combinations). They will form one minibatch, and size of minibatches would be different at each training step.

```python
nchars = 100

def get_batch(s,nchars=nchars):
ins = torch.zeros(len(s)-nchars,nchars,dtype=torch.long,device=device)
outs = torch.zeros(len(s)-nchars,nchars,dtype=torch.long,device=device)
for i in range(len(s)-nchars):
ins[i] = enc(s[i:i+nchars])
outs[i] = enc(s[i+1:i+nchars+1])
return ins,outs

get_batch(train_dataset[0][1])
```

Output:
```text
(tensor([[ 0, 1, 2, ..., 28, 29, 30],
[ 1, 2, 2, ..., 29, 30, 1],
[ 2, 2, 3, ..., 30, 1, 16],
...,
[20, 8, 21, ..., 1, 28, 1],
[ 8, 21, 5, ..., 28, 1, 27],
[21, 5, 8, ..., 1, 27, 16]]),
tensor([[ 1, 2, 2, ..., 29, 30, 1],
[ 2, 2, 3, ..., 30, 1, 16],
[ 2, 3, 4, ..., 1, 16, 26],
...,
[ 8, 21, 5, ..., 28, 1, 27],
[21, 5, 8, ..., 1, 27, 16],
[ 5, 8, 9, ..., 27, 16, 6]]))
```

Now let's define generator network. It can be based on any recurrent cell which we discussed in the previous unit (simple, LSTM or GRU). In our example we will use LSTM.

Because the network takes characters as input, and vocabulary size is pretty small, we do not need embedding layer, one-hot-encoded input can directly go to LSTM cell. However, because we pass character numbers as input, we need to one-hot-encode them before passing to LSTM. This is done by calling `one_hot` function during `forward` pass. Output encoder would be a linear layer that will convert hidden state into one-hot-encoded output.

```python
class LSTMGenerator(torch.nn.Module):
def __init__(self, vocab_size, hidden_dim):
super().__init__()
self.rnn = torch.nn.LSTM(vocab_size,hidden_dim,batch_first=True)
self.fc = torch.nn.Linear(hidden_dim, vocab_size)

def forward(self, x, s=None):
x = torch.nn.functional.one_hot(x,vocab_size).to(torch.float32)
x,s = self.rnn(x,s)
return self.fc(x),s
```

During training, we want to be able to sample generated text. To do that, we will define `generate` function that will produce output string of length `size`, starting from the initial string `start`.

The way it works is the following. First, we will pass the whole start string through the network, and take output state `s` and next predicted character `out`. Since `out` is one-hot encoded, we take `argmax` to get the index of the character `nc` in the vocabulary, and use `itos` to figure out the actual character and append it to the resulting list of characters `chars`. This process of generating one character is repeated `size` times to generate required number of characters.

```python
def generate(net,size=100,start='today '):
chars = list(start)
out, s = net(enc(chars).view(1,-1).to(device))
for i in range(size):
nc = torch.argmax(out[0][-1])
chars.append(vocab.get_itos()[nc])
out, s = net(nc.view(1,-1),s)
return ''.join(chars)
```

Now let's do the training! Training loop is almost the same as in all our previous examples, but instead of accuracy we print sampled generated text every 1000 epochs.

Special attention needs to be paid to the way we compute loss. We need to compute loss given one-hot-encoded output `out`, and expected text `text_out`, which is the list of character indices. Luckily, the `cross_entropy` function expects unnormalized network output as first argument, and class number as the second, which is exactly what we have. It also performs automatic averaging over minibatch size.

We also limit the training by `samples_to_train` samples, in order not to wait for too long. We encourage you to experiment and try longer training, possibly for several epochs (in which case you would need to create another loop around this code).

```python
net = LSTMGenerator(vocab_size,64).to(device)

samples_to_train = 10000
optimizer = torch.optim.Adam(net.parameters(),0.01)
loss_fn = torch.nn.CrossEntropyLoss()
net.train()
for i,x in enumerate(train_dataset):
# x[0] is class label, x[1] is text
if len(x[1])-nchars<10:
continue
samples_to_train-=1
if not samples_to_train: break
text_in, text_out = get_batch(x[1])
optimizer.zero_grad()
out,s = net(text_in)
loss = torch.nn.functional.cross_entropy(out.view(-1,vocab_size),text_out.flatten()) #cross_entropy(out,labels)
loss.backward()
optimizer.step()
if i%1000==0:
print(f"Current loss = {loss.item()}")
print(generate(net))
```

Output:
```text
Current loss = 4.398899078369141
today sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr sr s
Current loss = 2.161320447921753
today and to the tor to to the tor to to the tor to to the tor to to the tor to to the tor to to the tor t
Current loss = 1.6722588539123535
today and the court to the could to the could to the could to the could to the could to the could to the c
Current loss = 2.423795223236084
today and a second to the conternation of the conternation of the conternation of the conternation of the
Current loss = 1.702607274055481
today and the company to the company to the company to the company to the company to the company to the co
Current loss = 1.692358136177063
today and the company to the company to the company to the company to the company to the company to the co
Current loss = 1.9722288846969604
today and the control the control the control the control the control the control the control the control
Current loss = 1.8705692291259766
today and the second to the second to the second to the second to the second to the second to the second t
Current loss = 1.7626899480819702
today and a security and a security and a security and a security and a security and a security and a secu
Current loss = 1.5574463605880737
today and the company and the company and the company and the company and the company and the company and
Current loss = 1.5620026588439941
today and the be that the be the be that the be the be that the be the be that the be the be that the be t
```

This example already generates some pretty good text, but it can be further improved in several ways:
* **Better minibatch generation**. The way we prepared data for training was to generate one minibatch from one sample. This is not ideal, because minibatches are all of different sizes, and some of them even cannot be generated, because the text is smaller than `nchars`. Also, small minibatches do not load GPU sufficiently enough. It would be wiser to get one large chunk of text from all samples, then generate all input-output pairs, shuffle them, and generate minibatches of equal size.
* **Multilayer LSTM**. It makes sense to try 2 or 3 layers of LSTM cells. As we mentioned in the previous unit, each layer of LSTM extracts certain patterns from text, and in case of character-level generator we can expect lower LSTM level to be responsible for extracting syllables, and higher levels - for words and word combinations. This can be simply implemented by passing number-of-layers parameter to LSTM constructor.
* You may also want to experiment with **GRU units** and see which ones perform better, and with **different hidden layer sizes**. Too large hidden layer may result in overfitting (e.g. network will learn exact text), and smaller size might not produce good result.

## Soft text generation and temperature

In the previous definition of `generate`, we were always taking the character with highest probability as the next character in generated text. This resulted in the fact that the text often "cycled" between the same character sequences again and again, like in this example:
```
today of the second the company and a second the company ...
```

However, if we look at the probability distribution for the next character, it could be that the difference between a few highest probabilities is not huge, e.g. one character can have probability 0.2, another - 0.19, etc. For example, when looking for the next character in the sequence '*play*', next character can equally well be either space, or **e** (as in the word *player*).

This leads us to the conclusion that it is not always "fair" to select the character with higher probability, because choosing the second highest might still lead us to meaningful text. It is more wise to **sample** characters from the probability distribution given by the network output.

This sampling can be done using `multinomial` function that implements so-called **multinomial distribution**. A function that implements this **soft** text generation is defined below:

```python
def generate_soft(net,size=100,start='today ',temperature=1.0):
chars = list(start)
out, s = net(enc(chars).view(1,-1).to(device))
for i in range(size):
#nc = torch.argmax(out[0][-1])
out_dist = out[0][-1].div(temperature).exp()
nc = torch.multinomial(out_dist,1)[0]
chars.append(vocab.get_itos()[nc])
out, s = net(nc.view(1,-1),s)
return ''.join(chars)

for i in [0.3,0.8,1.0,1.3,1.8]:
print(f"--- Temperature = {i}\n{generate_soft(net,size=300,start='Today ',temperature=i)}\n")
```

Output:
```text
--- Temperature = 0.3
Today and a company and complete an all the land the restrational the as a security and has provers the pay to and a report and the computer in the stand has filities and working the law the stations for a company and with the company and the final the first company and refight of the state and and workin

--- Temperature = 0.8
Today he oniis its first to Aus bomblaties the marmation a to manan boogot that pirate assaid a relaid their that goverfin the the Cappets Ecrotional Assonia Cition targets it annight the w scyments Blamity #39;s TVeer Diercheg Reserals fran envyuil that of ster said access what succers of Dour-provelith

--- Temperature = 1.0
Today holy they a 11 will meda a toket subsuaties, engins for Chanos, they's has stainger past to opening orital his thempting new Nattona was al innerforder advan-than #36;s night year his religuled talitatian what the but with Wednesday to Justment will wemen of Mark CCC Camp as Timed Nae wome a leaders

--- Temperature = 1.3
Today gpone 2.5 fech atcusion poor cocles toparsdorM.cht Line Pamage put 43 his calt lowed to the book, that has authh-the silia rruch ailing to'ory andhes beutirsimi- Aefffive heading offil an auf eacklets is charged evis, Gunymy oy) Mony has it after-sloythyor loveId out filme, the Natabl -Najuntaxiggs

--- Temperature = 1.8
Today plary, P.slan chly\401 mardregationly #39;t 8.1Mide) closes ,filtcon alfly playin roven!\grea.-QFBEP: Iss onfarchQ/itilia CCf Zivesigntwasta orce.-Peul-aw.uicrin of fuglinfsut aftaningwo, MIEX awayew Aice Woiduar Corvagiugge oppo esig ThusBratourid can
```

We have introduced one more parameter called **temperature**, which is used to indicate how hard we should stick to the highest probability. If temperature is 1.0, we do fair multinomial sampling, and when temperature goes to infinity - all probabilities become equal, and we randomly select next character. In the example below we can observe that the text becomes meaningless when we increase the temperature too much, and it resembles "cycled" hard-generated text when it becomes closer to 0.
