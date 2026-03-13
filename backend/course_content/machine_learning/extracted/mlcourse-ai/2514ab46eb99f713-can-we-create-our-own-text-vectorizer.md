# Can we create our own text vectorizer?

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/tutorials/custom_vectorizer_tutorial.ipynb
Original Path: jupyter_english/tutorials/custom_vectorizer_tutorial.ipynb
Course: Machine Learning

# Can we create our own text vectorizer?

While I was working with Medium project, I faced the problem of memory lack when I tried to create 1-4 ngramms. It was interesting to see how larger ngramms would work. But my PC (32GB RAM) can't perfom the task of creating 1-4 ngramms with CounterVectorizer.

So I was wondering how I can create ngramms of (almost) any length and any size or can we customize by ourselves what part of the sentence, text, article we can choose to create bag of words and etc.

I`ve decided to use dictionaries as intermediate buffers between our any-sized ngramms and sparse matrix. Let see how it works. First of all we create toy list of two sentence to check if our script works properly.

```python
import itertools
import os
import pickle
import random
import re
from collections import Counter, defaultdict

import numpy as np
import pandas as pd
from scipy import sparse

PATH = "/any_path_to_data_folder/"
```

```python
texts = [
"joe lives in the center of london since his birth",
"dann loves his job because his office is right in the center of new york",
]
```

Lets create dictionaries with unique words for each text in texts. We will need the 'ngramm' variable which will define the amount of words in phrase. For example, "ngramm = 2" will give us such phrases from first sentence: 'joe', 'joe lives', 'lives', 'lives in', 'in', 'in the', etc. And using "ngramm = 3" we`l recieve such combinations: 'joe', 'joe lives', 'joe lives in', 'lives', 'lives in', 'lives in the', etc. Also we will add "ntop" variable which we will use later.

```python
ngramm = 2
ntop = 100
word_stats = defaultdict(int)
for i in range(len(texts)):
word_stats[i] = defaultdict(int) # create sub-dictionary for current text
text = texts[i]
words = text.split() # split the text by every word.
for n in range(ngramm):
phrases = [
" ".join(word for word in words[i : i + (n + 1)])
for i in range(len(words) - n)
]
print(
phrases
) # as we see we`re getting the desired result: the list of n-words phrases
for phrase in phrases:
word_stats[i][
phrase
] += 1 # count all phrases in current text and add them to appropriate dictionary
print("************ dictionary with counted phrases ************")
print(word_stats)
```

To use our words and phrases as bag of words in regression models we have to convert our dictionary to sparse matrix. For those who are not familiar with this type of matrix I would recommend to read this article: . But in any case we will remind ourselves why we are using sparse instead dense matrix especially with big data. Let's create dataframe where rows are the texts and columns - phrases as features. Values in cells - number of appearance of each phrase in particular text. But at first we have to convert all per text sub-dictionaries to one dictionary with unique phrases and sum of their accurancies in all texts. Current approach (using lists) isn`t optimal but we can compare execution times later.

```python
unique_ngrams = defaultdict(int)
for i in range(len(texts)):
cur_dic = word_stats[i]
for phrase in cur_dic.keys():
unique_ngrams[phrase] += cur_dic[phrase]
print(unique_ngrams) # check all records in unique dictionary

df_feat_col = list(unique_ngrams.keys())
df_feat_values = []
for i in range(len(texts)):
cur_text_values = []
for col in df_feat_col:
cur_text_values.append(word_stats[i][col])
df_feat_values.append(cur_text_values)

df_feat = pd.DataFrame(df_feat_values, columns=unique_ngrams.keys())
print(df_feat[["his", "center", "job", "york", "in"]])
```

For now our script works perfect and now we can create feature table. But what about memory usage? To check our script we`l load database with film reviews and create function for more convenience.

```python
# Your can find data by this link https://drive.google.com/file/d/1zvCa27XOuLyGAzYOeLGHfaccmK2llkca/view?usp=sharing
with open(PATH + "reviews", "rb") as fb:
new_texts = pickle.load(fb)
print(len(new_texts))
# we`l use 1/10 of all reviews or 1250 records.
new_texts = [re.sub(r"[^\w\s]", "", str(x).lower()) for x in new_texts[:1250]]
```

```python
def create_text_dicts(texts, ngram=2):
word_stats = defaultdict(int)
for i in range(len(texts)):
word_stats[i] = defaultdict(int)
text = texts[i]
words = text.split()
for n in range(ngram):
phrases = [
" ".join(word for word in words[i : i + (n + 1)])
for i in range(len(words) - n)
]
for phrase in phrases:
word_stats[i][phrase] += 1
return word_stats

def create_unique_dict(word_stats, texts):
unique_ngrams = defaultdict(int)
for i in range(len(texts)):
cur_dic = word_stats[i]
for phrase in cur_dic.keys():
unique_ngrams[phrase] += cur_dic[phrase]

return unique_ngrams

def create_feat_values(word_stats, unique_ngrams, texts):
df_feat_col = list(unique_ngrams.keys())
df_feat_values = []
for i in range(len(texts)):
cur_text_values = [word_stats[i][col] for col in df_feat_col]
df_feat_values.append(cur_text_values)

return df_feat_col, df_feat_values
```

```python
%%time
word_stats = create_text_dicts(new_texts, ngram=2)
unique_ngrams = create_unique_dict(word_stats, new_texts)
features, feat_values = create_feat_values(word_stats, unique_ngrams, new_texts)
print(len(features), np.asarray(feat_values).shape)
```

Here is screenshot of memory usage at my PC.
<img src="https://ucbfb5d1a3c83c53caaf05b9e6aa.previews.dropboxusercontent.com/p/thumb/AARl5GA1YgfPAj_1aG1s5kRxUIPfV5GDXbie70lCMJfzQjeYffswQ4dqCS-9BWowOM8FDjjvti8hDlQBUw9lBRloDmfmQpjpIS2zNBAoE1o2KuMwfFmWZy13UfDuOWd8t2AKdLCUlbZdrhodTEhTCBoRroMld2Zr7X4Osm4lMmCygdeZ31xrxB3SEaHUOJBWC1Rs7HtyiG9YoXPwWoqDzp6Ths3BmCNU1Z61TZoX8WGUjbmB-okAbCkcd3UUyi-BBAI/p.png?size=2048x1536&size_mode=3">

As we can see current approach of getting feature matrix causes the memory lack when there is a big database. 1/10 of database consumed about 1/4 of available memory. Let`s look at our matrix as dataframe and count its sparsity or in other words the percentage of cells which are either not filled with data or are zeros.

```python
feat_table = pd.DataFrame(feat_values, columns=features)
print(feat_table.iloc[:5, :10]) # a part of matrix to avoid crash

count_zeros = feat_table.isin([0.0]).sum(
axis=0
) # count how many times zeros are present in each feature
print("**********")
print(count_zeros.head())

sparsity = np.sum(count_zeros) / (len(features) * len(feat_values)) * 100
print("**********")
print("Sparsity: " + str(np.round(sparsity, 2)))
```

As we can see our feature table consists of almost 100% of zeros and all this useless information occupy a lot of memory. We can fix this by converting dense matrix to sparse and compare the used memory after that.

```python
sparse_feat_matrix = sparse.csr_matrix(feat_table.values)
print("Dense matrix memory: " + str(feat_table.values.nbytes))
print("Sparse matrix memory: " + str(sparse_feat_matrix.data.nbytes))
```

We retrenched 99% of memory which was used by dense matrix. But still our script is not effective, because we create the full feauture dense matrix initially and only after that convert it to sparse matrix. So we can change the code in the way that sparse matrix is created for each text (iteration), and then small sparse matrix is concatenated into full sparse feature matrix.

```python
def create_feat_values(word_stats, unique_ngrams, texts):
feat_col = list(unique_ngrams.keys())

for i in range(len(texts)):
cur_text_values = [word_stats[i][col] for col in df_feat_col]
cur_text_values = np.asarray(cur_text_values)
if i == 0:
# convert current text dense matrix to sparse
texts_values = sparse.csr_matrix(cur_text_values)
else:
cur_text_values = sparse.csr_matrix(cur_text_values)
# concatenate cur sparse matrix into whole sparse feature matrix
texts_values = sparse.vstack([texts_values, cur_text_values])

return feat_col, texts_values
```

Let`s check if our sparse matrix contains right values using our toy example.

```python
%%time
word_stats = create_text_dicts(texts, ngram=2)
unique_ngrams = create_unique_dict(word_stats, texts)
features, feat_values = create_feat_values(word_stats, unique_ngrams, texts)
print(features)
print(len(features))
print(feat_values)
```

Lets check the word 'his': it occuries 1 time in the first text (0 index of texts), and 2 times in the second (1 index). In features list this word stands at 8 index (9 in a row). And if we look through the sparse matrix, we find that the number for the 0 index text and 8 index words (0,8) equals 1, and for the 1 index text and 8 index word (1,8) there is number 2. Also we see that the length of list with features equals 39 and the last word index in the sparse matrix is 38 which are equal.

What benefits do we get using such way of creating sparse matrix? First of all we can make sparse matrix with almost any length of n-grams. Using sklearn vectorizers with long ngrams (more than 4) could lead to 'overloading' the memory of your system. Of course, this way of vectorization could be much slower then sklearn ones, but when it is needed to get 5 or 6 length ngrams - time does not matter. And the second not less useful benefit is the possibility to customize the vectorizer for specific needs. We can define certain lengths of phrases (ngram) we want to get: 1,2,3,5,10. Or for example, we need to get 2-grams phrases not with words standing one by one, but with every second words (skipping the word between 1 and 3, 2 and 4, etc.): 'joe in', 'lives the', 'in center' etc. Another situation: we have the database with movie reviews and 5 tags for classification: comedy, detective, horror, cartoon, action movie. Our interest is to get 1-5 n-gram phrases using nor 100 000 most common words of all reviews, but 20 000 most common words for each tag. Or moreover: the number of top words for each tag will depend on review's distribution per tag. If there are 50 000 reviews and 30 000 of it are about comedies, we'l want to get 60% (30 000/50 000) of all top words from comedy's reviews. Let`s combine our separate functions in one and add a little bit customization in getting the bag of words.

```python
def create_sparse_features(texts, target, ngram, ntop=np.inf, ntop_by_class=False):
"""
target: list of classes according to texts. List

ngram: the list of lengths for desired phrases. List

ntop: how many most popular words we want to use. Integer. Default value
means infiniry, that`s why the dictionary isn`t cut off by ntop value./.

ntop_by_class: choose top words from every class according
to their distribution. True or False
"""

word_stats = defaultdict(int)
for i in range(len(texts)):
word_stats[i] = defaultdict(int)
text = texts[i]
words = text.split()
for n in ngram:
# because of we changed the list of ngram from range(3) to
# hand-input values [1,2,3] we have to change the code in this part
phrases = [
" ".join(word for word in words[i : i + n])
for i in range(len(words) - n + 1)
]
for phrase in phrases:
word_stats[i][phrase] += 1

unique_ngrams = defaultdict(int)
if ntop_by_class:
# count how many time each target occuries
target_count = Counter(target)
for key in target_count.keys():
# count each target part in whole data
cur_target_dist = target_count[key] / len(new_texts)
# count how many top words we`l take from each tag texts.
cur_target_top_words = int(cur_target_dist * ntop)
# create empty dictionary for current target
cur_target_ngrams = defaultdict(int)
# create list of indexes for current target
cur_target_ind = np.where(np.asarray(target) == key)[0]
# using loop and list of indexes fill current target dictionary
# from corresponding text dictionaries and count unique phrases
for n in cur_target_ind:
cur_dic = word_stats[n]
for phrase in cur_dic.keys():
cur_target_ngrams[phrase] += cur_dic[phrase]
# if length of current target dictionary is more than
# cur_target_top_words value - sort dictionary by values and cut off it
# content by that value.
if len(cur_target_ngrams) > cur_target_top_words:
cur_target_ngrams = dict(
sorted(cur_target_ngrams.items(), key=lambda kv: kv[1])
)
cur_target_ngrams = dict(
itertools.islice(
cur_target_ngrams.items(),
len(cur_target_ngrams) - cur_target_top_words,
len(cur_target_ngrams),
)
# connect current target dictionary with whole unique_ngrams dictionary
unique_ngrams = {**unique_ngrams, **cur_target_ngrams}

else:
for i in range(len(texts)):
cur_dic = word_stats[i]
for phrase in cur_dic.keys():
unique_ngrams[phrase] += cur_dic[phrase]
if len(unique_ngrams) > ntop:
unique_ngrams = dict(sorted(unique_ngrams.items(), key=lambda kv: kv[1]))
unique_ngrams = dict(
itertools.islice(
unique_ngrams.items(), len(unique_ngrams) - ntop, len(unique_ngrams)
)

feat_col = list(unique_ngrams.keys())
for i in range(len(texts)):
cur_text_phares = [word_stats[i][col] for col in feat_col]
cur_text_phares = np.asarray(cur_text_phares)
if i == 0:
feat_values = sparse.csr_matrix(cur_text_phares)
else:
cur_feat_values = sparse.csr_matrix(cur_text_phares)
feat_values = sparse.vstack([feat_values, cur_feat_values])

return feat_col, feat_values
```

Let`s run our code with and without using target distribution for ntop words.

```python
%%time
# To run the vectorizer we need tags for our review database.
tags = ["comedy", "detective", "horror", "cartoon", "action"]
target = [tags[random.randrange(len(tags))] for item in range(len(new_texts))]
ngram = [1, 2, 3, 5, 10]
features, feat_values = create_sparse_features(
new_texts, target, ngram, ntop=5000, ntop_by_class=False
)
print(feat_values.shape)
```

```python
%%time
# To run the vectorizer we need tags for our review database.
tags = ["comedy", "detective", "horror", "cartoon", "action"]
target = [tags[random.randrange(len(tags))] for item in range(len(new_texts))]
ngram = [1, 2, 3, 5, 10]
features, feat_values = create_sparse_features(
new_texts, target, ngram, ntop=5000, ntop_by_class=True
)
print(feat_values.shape)
```

The shape of sparse matrix after the second run of script is less then set ntop value. That`s why 2/3 of most popular words in texts are intersected within the tags. But let`s check memory usage - run script without setting ntop value and with ngram values as in dense matrix above.

```python
%%time
# To run the vectorizer we need tags for our review database.
tags = ["comedy", "detective", "horror", "cartoon", "action"]
target = [tags[random.randrange(len(tags))] for item in range(len(new_texts))]
ngram = [1, 2]
features, feat_values = create_sparse_features(new_texts, target, ngram)
print(feat_values.shape)
```

Here is the second screenshot of memory usage at my PC.
<img src="https://uc7884f3bd1bdfa5933582e32041.previews.dropboxusercontent.com/p/thumb/AARuCLe0b0OXZadJswOxAcp962TXDR-fj_nb5EPgM0mcAQAcify91kwydPaOTnaPOo1Sw8kpjjU0dTMyq9msq_fxGGr6u-Ehk63FQFmqlaf8UhZOJPUJ6ahsSm65TntvTW9X8KCCezsxnllkNXuwkZwbjKj15B5Qa1NLxndbWWoEFVF6V5GFiW_UBJ30Avo0e9a4YtmCq9CsKzA7UneCUoFCCrjTmdKiY6pdEPNWPvjRuTCDYHvwKw9wB4TYtDW4EqE/p.png?size=2048x1536&size_mode=3">

Unfortunately our idea that creating sparse matrix while looping and combining them in big one is not working properly. As we see the memory usage is the same as with dense matrix while looping and only after it the memory is cut off to the size of final sparse matrix. What can we do with this? Let's try to optimize our script. At first, we will not use every text`s dictionaries while creating sparse matrix. Instead of this we will create phrases once more, check if they are in unique dictionary, count their accurancies and after that create sparse matrix using numpy zeroes matrix. At the second we will save each sparse matrix to the hard drive and then read them and concatenate in one matrix.

```python
def create_sparse_features(texts, target, ngram, ntop=np.inf, ntop_by_class=False):
"""
target: list of classes according to texts. List

ngram: the list of lengths for desired phrases. List

ntop: how many most popular words we want to use. Integer. Default value
means infiniry, that`s why the dictionary isn`t cut off by ntop value./.

ntop_by_class: choose top words from every class according
to their distribution. True or False
"""

word_stats = defaultdict(int)
for i in range(len(texts)):
word_stats[i] = defaultdict(int)
text = texts[i]
words = text.split()
for n in ngram:
phrases = [
" ".join(word for word in words[i : i + n])
for i in range(len(words) - n + 1)
]
for phrase in phrases:
word_stats[i][phrase] += 1

unique_ngrams = defaultdict(int)
if ntop_by_class:

target_count = Counter(target)
for key in target_count.keys():
cur_target_dist = target_count[key] / len(new_texts)
cur_target_top_words = int(cur_target_dist * ntop)
cur_target_ngrams = defaultdict(int)
cur_target_ind = np.where(np.asarray(target) == key)[0]

for n in cur_target_ind:
cur_dic = word_stats[n]
for phrase in cur_dic.keys():
cur_target_ngrams[phrase] += cur_dic[phrase]

if len(cur_target_ngrams) > cur_target_top_words:
cur_target_ngrams = dict(
sorted(cur_target_ngrams.items(), key=lambda kv: kv[1])
)
cur_target_ngrams = dict(
itertools.islice(
cur_target_ngrams.items(),
len(cur_target_ngrams) - cur_target_top_words,
len(cur_target_ngrams),
)
unique_ngrams = {**unique_ngrams, **cur_target_ngrams}

else:
for i in range(len(texts)):
cur_dic = word_stats[i]
for phrase in cur_dic.keys():
unique_ngrams[phrase] += cur_dic[phrase]
if len(unique_ngrams) > ntop:
unique_ngrams = dict(sorted(unique_ngrams.items(), key=lambda kv: kv[1]))
unique_ngrams = dict(
itertools.islice(
unique_ngrams.items(), len(unique_ngrams) - ntop, len(unique_ngrams)
)
# create dictionary with features indexes
all_phrases = unique_ngrams.keys()
all_phrases_dic_ind = defaultdict(int)
for key in unique_ngrams.keys():
all_phrases_dic_ind[key] = len(all_phrases_dic_ind)

# create sparse matrix to each text
for i in range(len(texts)):
# create proper name for right sorting files according to features index
name = "0" * (len(str(len(texts))) - len(str(i))) + str(i)
text = texts[i]
# create from current text list of words
words = text.split()
# create list of ngram phrases dropping those that are not in unique
# dictionary
cur_phrases = []
for ii in range(len(words)):
for n in ngram:
phrase = " ".join(word for word in words[ii : ii + n])
if phrase in all_phrases:
cur_phrases.append(phrase)
# count accurancies of chosen phrases in the current text
cur_phrases_count = Counter(cur_phrases)
# create 1 row dense matrix using numpy zeroes matrix, where the number
# of columns equals the length of unique phrases dictionary
dense_matrix = np.zeros([1, len(all_phrases)])
for key in cur_phrases_count.keys():
# get the index of current feature of current text from unique index
# dictionary
all_phrases_ind = all_phrases_dic_ind[key]
# put the number of accurance of phrase to the dense matrix at certain index
# according to the index of phrase in the unique index dictionary
dense_matrix[:, all_phrases_ind] = cur_phrases_count[key]
# create and save sparse matrix
csr_matrix = sparse.csr_matrix(dense_matrix)
sparse.save_npz(PATH + "/sparses/" + str(name), csr_matrix)

# laod sparse matrix and create the big one
sparse_files = os.listdir(PATH + "/sparses/")
for i in range(len(sparse_files)):
if i == 0:
feat_values = sparse.load_npz(PATH + "/sparses/" + sparse_files[i])
else:
cur_sparse = sparse.load_npz(PATH + "/sparses/" + sparse_files[i])
feat_values = sparse.vstack([feat_values, cur_sparse])

return unique_ngrams.keys(), feat_values
```

```python
%%time
# To run the vectorizer we need tags for our review database.
tags = ["comedy", "detective", "horror", "cartoon", "action"]
target = [tags[random.randrange(len(tags))] for item in range(len(new_texts))]
ngram = [1, 2]
features, feat_values = create_sparse_features(new_texts, target, ngram)
print(feat_values.shape)
```

Here is screenshot of memory usage at my PC with this script
<img src="https://uc8aad429cfe96b4ba6605878e72.previews.dropboxusercontent.com/p/thumb/AASymsQ4ed_7_D2wgWBErHxRL63_zOM6NiUveM_dI1F4T3iFFv9IG3jx67GExOp3wlFmczHofmoO9SncvooEgQuMAl548SBcfCJDlEYQqV7cLthnhnYnwQ1zlCOorFwheSigE-HGM9ALRoFlPdNwbHt1d340kxg7Dk18WEf88qhgKWknA7eEiQ-zOwGnLHPB62sPvoEzB30GEqDTkRFeZ8qTp6HPUdWKaNfq69cUwBvjCNGv5kiFBzDTHffGcnwdV30/p.png?size=2048x1536&size_mode=3">

As we see we get the same shape of feature matrix as the dense has, but 5 times faster and without usage almost of any memory. I tried this approach with different settings and could get matrix with shapes up to 70000 rows and 20mln features as columns without serious usage of memory. Apart this, such script could be modified for any needs to create any architecture of certain bag of words.
