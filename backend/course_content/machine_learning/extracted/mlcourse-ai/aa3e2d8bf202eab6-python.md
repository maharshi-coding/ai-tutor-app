# ```python

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/project_Georgy_Surin_quora_insincere_questions.ipynb
Original Path: jupyter_english/projects_indiv/project_Georgy_Surin_quora_insincere_questions.ipynb
Course: Machine Learning

```python
# load train and test datasets
train_df = pd.read_csv("../input/train.csv")
test_df = pd.read_csv("../input/test.csv")
print("Train datasets shape:", train_df.shape)
print("Test datasets shape:", test_df.shape)
train_df.head()
```

```python
train_df.info()
test_df.info()
```

We can see there are no missing values

First let us look at the distribution of the target variable to understand more about the imbalance and so on.

```python
sns.countplot(train_df['target'])
```

So we see that data unbalanced.

Since we only have text data, let's take a look at some of the mean values ​​of words / sentences.

```python
print('Average word length of questions in train is {0:.0f}.'.format(np.mean(train_df['question_text'].apply(lambda x: len(x.split())))))
print('Average word length of questions in test is {0:.0f}.'.format(np.mean(test_df['question_text'].apply(lambda x: len(x.split())))))
```

```python
print('Max word length of questions in train is {0:.0f}.'.format(np.max(train_df['question_text'].apply(lambda x: len(x.split())))))
print('Max word length of questions in test is {0:.0f}.'.format(np.max(test_df['question_text'].apply(lambda x: len(x.split())))))
```

```python
print('Average character length of questions in train is {0:.0f}.'.format(np.mean(train_df['question_text'].apply(lambda x: len(x)))))
print('Average character length of questions in test is {0:.0f}.'.format(np.mean(test_df['question_text'].apply(lambda x: len(x)))))
```

As we can see on average questions in train and test datasets are similar, but there are quite long questions in train dataset.

Let's look at the most frequent words in each of the classes separately and immediately visualize it

```python
from collections import defaultdict
from wordcloud import WordCloud, STOPWORDS
train1_df = train_df[train_df["target"]==1]
train0_df = train_df[train_df["target"]==0]

## custom function for ngram generation ##
def generate_ngrams(text, n_gram=1):
token = [token for token in text.lower().split(" ") if token != "" if token not in STOPWORDS]
ngrams = zip(*[token[i:] for i in range(n_gram)])
return [" ".join(ngram) for ngram in ngrams]

## custom function for horizontal bar chart ##
def horizontal_bar_chart(df, color):
trace = go.Bar(
y=df["word"].values[::-1],
x=df["wordcount"].values[::-1],
showlegend=False,
orientation = 'h',
marker=dict(
color=color,
),
)
return trace

## Get the bar chart from sincere questions ##
freq_dict = defaultdict(int)
for sent in train0_df["question_text"]:
for word in generate_ngrams(sent):
freq_dict[word] += 1
fd_sorted = pd.DataFrame(sorted(freq_dict.items(), key=lambda x: x[1])[::-1])
fd_sorted.columns = ["word", "wordcount"]
trace0 = horizontal_bar_chart(fd_sorted.head(50), 'blue')

## Get the bar chart from insincere questions ##
freq_dict = defaultdict(int)
for sent in train1_df["question_text"]:
for word in generate_ngrams(sent):
freq_dict[word] += 1
fd_sorted = pd.DataFrame(sorted(freq_dict.items(), key=lambda x: x[1])[::-1])
fd_sorted.columns = ["word", "wordcount"]
trace1 = horizontal_bar_chart(fd_sorted.head(50), 'blue')

# Creating two subplots
fig = tools.make_subplots(rows=1, cols=2, vertical_spacing=0.04,
subplot_titles=["Frequent words of sincere questions",
"Frequent words of insincere questions"])
fig.append_trace(trace0, 1, 1)
fig.append_trace(trace1, 1, 2)
fig['layout'].update(height=1200, width=900, paper_bgcolor='rgb(233,233,233)', title="Word Count Plots")
py.iplot(fig, filename='word-plots')
```

It can be seen that in insincere questions words as 'black', 'white', 'muslims', 'trump', 'woman' is predominate, which hints at us on racial discrimination, sexual content. But for example, the word 'people' is often found in both classes. Let's look at bi-gramm and tri-gramm to understand the context in which they most often used.

```python
freq_dict = defaultdict(int)
for sent in train0_df["question_text"]:
for word in generate_ngrams(sent,2):
freq_dict[word] += 1
fd_sorted = pd.DataFrame(sorted(freq_dict.items(), key=lambda x: x[1])[::-1])
fd_sorted.columns = ["word", "wordcount"]
trace0 = horizontal_bar_chart(fd_sorted.head(50), 'orange')

freq_dict = defaultdict(int)
for sent in train1_df["question_text"]:
for word in generate_ngrams(sent,2):
freq_dict[word] += 1
fd_sorted = pd.DataFrame(sorted(freq_dict.items(), key=lambda x: x[1])[::-1])
fd_sorted.columns = ["word", "wordcount"]
trace1 = horizontal_bar_chart(fd_sorted.head(50), 'orange')

# Creating two subplots
fig = tools.make_subplots(rows=1, cols=2, vertical_spacing=0.04,horizontal_spacing=0.15,
subplot_titles=["Frequent bigrams of sincere questions",
"Frequent bigrams of insincere questions"])
fig.append_trace(trace0, 1, 1)
fig.append_trace(trace1, 1, 2)
fig['layout'].update(height=1200, width=900, paper_bgcolor='rgb(233,233,233)', title="Bigram Count Plots")
py.iplot(fig, filename='word-plots')
```

```python
freq_dict = defaultdict(int)
for sent in train0_df["question_text"]:
for word in generate_ngrams(sent,3):
freq_dict[word] += 1
fd_sorted = pd.DataFrame(sorted(freq_dict.items(), key=lambda x: x[1])[::-1])
fd_sorted.columns = ["word", "wordcount"]
trace0 = horizontal_bar_chart(fd_sorted.head(50), 'green')

freq_dict = defaultdict(int)
for sent in train1_df["question_text"]:
for word in generate_ngrams(sent,3):
freq_dict[word] += 1
fd_sorted = pd.DataFrame(sorted(freq_dict.items(), key=lambda x: x[1])[::-1])
fd_sorted.columns = ["word", "wordcount"]
trace1 = horizontal_bar_chart(fd_sorted.head(50), 'green')

# Creating two subplots
fig = tools.make_subplots(rows=1, cols=2, vertical_spacing=0.04, horizontal_spacing=0.15,
subplot_titles=["Frequent trigrams of sincere questions",
"Frequent trigrams of insincere questions"])
fig.append_trace(trace0, 1, 1)
fig.append_trace(trace1, 1, 2)
fig['layout'].update(height=1200, width=1000, paper_bgcolor='rgb(233,233,233)', title="Trigram Count Plots")
py.iplot(fig, filename='word-plots')
```

On these two graphs, you can see phrases that determine the insincere question or not. They clearly indicate unfriendly content.
No wonder that the word 'donald trump' is so common. These words apparently refer to the political context, and there, as is well known, there are always heated discussions between his supporters and those who do not like him.

**3. Primary visual data analysis**

```python
train_df['question_text'].apply(lambda x: len(x.split())).plot(kind='hist');
plt.yscale('log');
plt.title('Distribution of question text length in characters in train')
```

```python
test_df['question_text'].apply(lambda x: len(x.split())).plot(kind='hist');
plt.yscale('log');
plt.title('Distribution of question text length in characters in test')
```

We can see that most of the questions in train and test are 40 words long or shorter.

Now let us see how some features are distributed between both sincere and insincere questions.

```python
## Number of words in the text ##
train_df["num_words"] = train_df["question_text"].apply(lambda x: len(str(x).split()))
test_df["num_words"] = test_df["question_text"].apply(lambda x: len(str(x).split()))

## Number of characters in the text ##
train_df["num_chars"] = train_df["question_text"].apply(lambda x: len(str(x)))
test_df["num_chars"] = test_df["question_text"].apply(lambda x: len(str(x)))

f, axes = plt.subplots(2, 1, figsize=(10,20))
sns.boxplot(x='target', y='num_words', data=train_df, ax=axes[0])
axes[0].set_xlabel('Target', fontsize=12)
axes[0].set_title("Number of words in each class", fontsize=15)

sns.boxplot(x='target', y='num_chars', data=train_df, ax=axes[1])
axes[1].set_xlabel('Target', fontsize=12)
axes[1].set_title("Number of characters in each class", fontsize=15)
```

We can see that the insincere questions have more number of words as well as characters compared to sincere questions

**4. Insights and found dependencies **
The problem is closely related to sentiment analysis as well. Usually, neural networks, for example RNN / LSTM, which can reveal hidden patterns are most often used in such tasks.
But we noticed that some word combinations, which determine the class of the question, stand out very well, let's make text preprocessing plus TFIDFTransform and try to make simple LogisticRegression baseline.

**5. Metrics selection**

Metrics -** F1 score ** is given in competition. F1 is a function of Precision and Recall.
F1 formula:
**F1 = 2*(Precision * Recall)/(Precision + Recall)**

F1 Score might be a better measure to use if we need to seek a balance between Precision and Recall.
Since dataset is very unbalanced, it’s no wonder why this metric is chosen.

**6. Model selection**
We will predict the class of the question using a simple logistic regression.

**7. Data preprocessing**

Lets make some text preprocessing:
* Removing numbers and special characters
* Lowering letters
* Removing Stopwords
* Lemmatization

```python
from nltk import WordNetLemmatizer
import re
from nltk.corpus import stopwords
stop_words = set(stopwords.words('english'))
wnl = WordNetLemmatizer()
def preprocess_text(text):
# Keeping letters + lowerring
text = re.sub("[^a-zA-Z]"," ", text)
text = re.findall(r"[a-zA-Z]+", text.lower())

# Removing stopwords
text = [word for word in text if (word not in stop_words and len(word)>2)]

# Lemming
text = [wnl.lemmatize(word) for word in text]

# Removing repetitions
text = re.sub(r'(.)\1+', r'\1\1', ' '.join(text))

return text

print('Cleaning data ... ')
train_df['clean_text'] = train_df['question_text'].transform(preprocess_text)
test_df['clean_text'] = train_df['question_text'].transform(preprocess_text)
print(train_df['clean_text'])
```

```python
from sklearn.feature_extraction.text import TfidfVectorizer

tfidf = TfidfVectorizer(ngram_range=(1, 3))
x_train = tfidf.fit_transform(train_df['clean_text'])
y_train = train_df['target']

print(x_train.shape)
```

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score
from sklearn.metrics import classification_report
from sklearn.model_selection import StratifiedKFold, KFold
from sklearn.model_selection import cross_val_score
skf = StratifiedKFold(n_splits=5, random_state=7, shuffle=True)
#C = 12.5 best param using gridsearch
logit = LogisticRegression(C=12.5, random_state = 7)

# cv_scores = cross_val_score(logit, x_train, train_df['target'], cv=skf,
# scoring='f1', n_jobs=-1)
# print(cv_scores.mean(), cv_scores)
```

Now try to add a little bit meta feature.

```python
import string
train_df["num_words"] = train_df['question_text'].apply(lambda x: len(str(x).split()))
test_df["num_words"] = test_df['question_text'].apply(lambda x: len(str(x).split()))

train_df["num_unique_words"] = train_df['question_text'].apply(lambda x: len(set(str(x).split())))
test_df["num_unique_words"] = test_df['question_text'].apply(lambda x: len(set(str(x).split())))

train_df["num_chars"] = train_df['question_text'].apply(lambda x: len(str(x)))
test_df["num_chars"] = test_df['question_text'].apply(lambda x: len(str(x)))

train_df["mean_word_len"] = train_df['question_text'].apply(lambda x: np.mean([len(w) for w in str(x).split()]))
test_df["mean_word_len"] = test_df['question_text'].apply(lambda x: np.mean([len(w) for w in str(x).split()]))

train_df["num_stopwords"] = train_df["question_text"].apply(lambda x: len([w for w in str(x).lower().split() if w in stop_words]))
test_df["num_stopwords"] = test_df["question_text"].apply(lambda x: len([w for w in str(x).lower().split() if w in stop_words]))

## Number of punctuations in the text ##
train_df["num_punctuations"] =train_df['question_text'].apply(lambda x: len([c for c in str(x) if c in string.punctuation]) )
test_df["num_punctuations"] =test_df['question_text'].apply(lambda x: len([c for c in str(x) if c in string.punctuation]) )

## Number of title case words in the text ##
train_df["num_words_upper"] = train_df["question_text"].apply(lambda x: len([w for w in str(x).split() if w.isupper()]))
test_df["num_words_upper"] = test_df["question_text"].apply(lambda x: len([w for w in str(x).split() if w.isupper()]))

## Number of title case words in the text ##
train_df["num_words_title"] = train_df["question_text"].apply(lambda x: len([w for w in str(x).split() if w.istitle()]))
test_df["num_words_title"] = test_df["question_text"].apply(lambda x: len([w for w in str(x).split() if w.istitle()]))

## Average length of the words in the text ##
train_df["mean_word_len"] = train_df["question_text"].apply(lambda x: np.mean([len(w) for w in str(x).split()]))
test_df["mean_word_len"] =test_df["question_text"].apply(lambda x: np.mean([len(w) for w in str(x).split()]))
print(train_df.head(5))
```

```python
from scipy.sparse import hstack
feats = ["num_words", "num_unique_words", "num_chars", "mean_word_len", "num_stopwords", "num_punctuations", "num_words_upper", "num_words_title"]
X_train_full = hstack([x_train, train_df[feats].values])

# cv_scores = cross_val_score(logit, X_train_full, train_df['target'], cv=skf,
# scoring='f1', n_jobs=-1)
# print(cv_scores.mean(), cv_scores)
```

Now, let's find optimal parametr C for logregression using GridSearch

```python
from sklearn.model_selection import GridSearchCV
#GridSearch for C
c_values = np.linspace(10, 15, 5)

logit_grid_searcher = GridSearchCV(estimator=logit, param_grid={'C': c_values},
scoring='f1', n_jobs=-1, cv=skf, verbose=1)

logit_grid_searcher.fit(X_train_full, train_df['target'])
print(logit_grid_searcher.best_score_, logit_grid_searcher.best_params_)
```

**10. Plotting training and validation curves **

```python
from sklearn.model_selection import learning_curve

def plot_learning_curve(estimator, title, X, y, ylim=None, cv=None,
n_jobs=None, train_sizes=np.linspace(.1, 1.0, 5)):
plt.figure()
plt.title(title)
if ylim is not None:
plt.ylim(*ylim)
plt.xlabel("Training examples")
plt.ylabel("Score")
train_sizes, train_scores, test_scores = learning_curve(
estimator, X, y, cv=cv, n_jobs=n_jobs, train_sizes=train_sizes)
train_scores_mean = np.mean(train_scores, axis=1)
train_scores_std = np.std(train_scores, axis=1)
test_scores_mean = np.mean(test_scores, axis=1)
test_scores_std = np.std(test_scores, axis=1)
plt.grid()

plt.fill_between(train_sizes, train_scores_mean - train_scores_std,
train_scores_mean + train_scores_std, alpha=0.1,
color="r")
plt.fill_between(train_sizes, test_scores_mean - test_scores_std,
test_scores_mean + test_scores_std, alpha=0.1, color="g")
plt.plot(train_sizes, train_scores_mean, 'o-', color="r",
label="Training score")
plt.plot(train_sizes, test_scores_mean, 'o-', color="g",
label="Cross-validation score")

plt.legend(loc="best")
plt.show

title = "Learning Curves (Logistic Regression)"
plot_learning_curve(logit, title, X_train_full, train_df['target'], ylim=(0.3, 1.01), cv=skf, n_jobs=-1)
```

```python
scores = logit_grid_searcher.cv_results_['mean_test_score']
scores_std = logit_grid_searcher.cv_results_['std_test_score']
plt.figure().set_size_inches(8, 6)
plt.semilogx(c_values, scores)

# plot error lines showing +/- std. errors of the scores
std_error = scores_std / np.sqrt(5)

plt.semilogx(c_values, scores + std_error, 'b--')
plt.semilogx(c_values, scores - std_error, 'b--')

plt.fill_between(c_values, scores + std_error, scores - std_error, alpha=0.2)

plt.ylabel('CV score +/- std error')
plt.xlabel('c_values')
plt.axhline(np.max(scores), linestyle='--', color='.5')
plt.xlim([c_values[0], c_values[-1]])
plt.show()
```

It's time to make predict for test set!

```python
x_test = tfidf.transform(test_df['clean_text'])
X_test_full = hstack([x_test, test_df[feats].values])
logit.fit(X_train_full, train_df['target'])
```

```python
pred = logit.predict(X_test_full)
example = pd.read_csv('../input/sample_submission.csv')
example['prediction'] = pred
example.to_csv('submission.csv', index=False)
```
