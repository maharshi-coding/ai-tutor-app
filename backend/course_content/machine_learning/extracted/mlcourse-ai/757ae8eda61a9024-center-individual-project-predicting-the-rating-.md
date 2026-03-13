# <center> Individual Project. Predicting the rating of the drug based on the review</center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/Dmitry_Girdyuk_indiv_proj.ipynb
Original Path: jupyter_english/projects_indiv/Dmitry_Girdyuk_indiv_proj.ipynb
Course: Machine Learning

# <center> Individual Project. Predicting the rating of the drug based on the review</center>

Greetings,

Machine learning has permeated nearly all fields and disciplines of study. One hot topic is using natural language processing and sentiment analysis to identify, extract, and make use of subjective information. The UCI ML Drug Review dataset provides patient reviews on specific drugs along with related conditions and a 10-star patient rating system reflecting overall patient satisfaction. The data was obtained by crawling online pharmaceutical review sites.

This data was published in a study on sentiment analysis of drug experience over multiple facets, ex. sentiments learned on specific aspects such as effectiveness and side effects (see the acknowledgments section to learn more).

The dataset was originally published on the UCI Machine Learning repository: https://archive.ics.uci.edu/ml/datasets/Drug+Review+Dataset+%28Drugs.com%29

Citation:

Felix Gräßer, Surya Kallumadi, Hagen Malberg, and Sebastian Zaunseder. 2018. Aspect-Based Sentiment Analysis of Drug Reviews Applying Cross-Domain and Cross-Data Learning. In Proceedings of the 2018 International Conference on Digital Health (DH '18). ACM, New York, NY, USA, 121-125.

You can also download it easily from kagle dataset:
https://www.kaggle.com/jessicali9530/kuc-hackathon-winter-2018

To simplify the project evaluation I'll follow the proposed plan:

# Project outline
1. Feature and data explanation
2. EDA, VDA, Insights and found dependencies
3. Metrics selection
4. Data preprocessing and model selection
5. Cross-validation and adjustment of model hyperparameters
6. Creation of new features and description of this process
7. Plotting training and validation curves
8. Prediction for test or hold-out samples
9. Conclusions

# 1. Feature and data explanation

First, load the dataset

```python
import pandas as pd
import os
import warnings
warnings.filterwarnings('ignore')

random_state = 42

PATH_TO_DATA = 'C:/Projects/Python/ODS_ml_course/indiv_proj/'
df_train = pd.read_csv(os.path.join(PATH_TO_DATA,
'drugsComTrain_raw.csv'), parse_dates=["date"])
df_test = pd.read_csv(os.path.join(PATH_TO_DATA,
'drugsComTest_raw.csv'), parse_dates=["date"])
df_train.drop('uniqueID', axis=1, inplace=True)
df_test.drop('uniqueID', axis=1, inplace=True)
```

Let's take a look at our data

```python
df_train.head()
```

```python
df_train.shape
```

```python
df_train.info()
```

```python
df_test.head()
```

```python
df_test.shape
```

```python
df_test.info()
```

The columns included in this dataset are:

1. drugName (categorical): name of drug
2. condition (categorical): name of condition
3. review (text): patient review
4. rating (numerical): 10 star patient rating
5. date (date): date of review entry
6. usefulCount (numerical): number of users who found review useful

The structure of the data is that a patient purchases a drug that meets his condition and writes a review and rating for the drug he/she purchased. Afterwards, if the others read that review and find it helpful, they will click usefulCount, which will add 1 for the variable.

The data is split into a train (75%) and test (25%) partition.

The initial tasks were

1. Classification: Can you predict the patient's condition based on the review?
2. Regression: Can you predict the rating of the drug based on the review?
3. Sentiment analysis: What elements of a review make it more helpful to others? Which patients tend to have more negative reviews? Can you determine if a review is positive, neutral, or negative?
4. Data visualizations: What kind of drugs are there? What sorts of conditions do these patients have?

The rating variable is ordinal. To be sure, it would be a lot of paininthea$$. Let it be sentiment classification of the reviews.

```python
df_train['target'] = df_train['rating'].apply(lambda x: 0 if x < 5 else 1 if 4 < x < 8 else 2)
df_test['target'] = df_test['rating'].apply(lambda x: 0 if x < 5 else 1 if 4 < x < 8 else 2)

df_train.drop('rating', axis=1, inplace=True)
df_test.drop('rating', axis=1, inplace=True)
```

# 2. EDA, VDA, Insights and found dependencies

It's time to load several libraries necessary for data analysis:

```python
import re
import numpy as np
import matplotlib.pyplot as plt
%matplotlib inline
import seaborn as sns
```

First of all, as you may have noticed, there are several NaNs in the 'condition' column in both datasets.

```python
df_train[pd.isnull(df_train['condition'])].head()
```

```python
df_train[pd.isnull(df_train['condition'])].shape, df_test[pd.isnull(df_test['condition'])].shape
```

Well, the amount is low. And it looks like these NaNs are missing values. We'll delete them later.

Fine. Take a look at our features.

```python
df_train.describe(include=['object','bool'])
```

```python
df_test.describe(include=['object','bool'])
```

As for condition column

```python
vc_condition_train = df_train['condition'].value_counts()
vc_condition_test = df_test['condition'].value_counts()

print(vc_condition_train[0:25])
print(vc_condition_test[0:25])
```

```python
vc_condition_train[vc_condition_train < 10].shape, vc_condition_test[vc_condition_test < 10].shape
```

```python
vc_condition_test[0:25].index.isin(vc_condition_train[0:25].index).all()
```

Top conditions are almost the same for both datasets. More than half of the conditions occur less than 10 times.

Since condition is related to drug name

```python
conditions_drugs_train = df_train.groupby(['condition'])['drugName'].nunique().sort_values(ascending=False)
conditions_drugs_test = df_test.groupby(['condition'])['drugName'].nunique().sort_values(ascending=False)

print(conditions_drugs_train[0:25])
print(conditions_drugs_test[0:25])
```

Top15 conditions per drugs in both datasets are the same. It is worth noting the Not Listed / Othe option, so the NaNs truly was missing. It is also should be noted the crawler errors such as '3</span> users found this comment helpful.'. We'll fix it later at preprocessing stage.

As for drugName column

```python
vc_drug_train = df_train['drugName'].value_counts()
vc_drug_test = df_test['drugName'].value_counts()

print(vc_drug_train[0:25])
print(vc_drug_test[0:25])
```

```python
vc_drug_test[0:15].index.isin(vc_drug_train[0:15].index).all()
```

```python
vc_drug_train[vc_drug_train < 10].shape, vc_drug_test[vc_drug_test < 10].shape
```

Well, almost identically for conditions. Top15 drugs are the same. More than half of the drugs occur less than 10 times.

```python
print(df_train['condition'].\
iloc[df_train['condition'].astype(str).\
apply(lambda str: len(str.split())).sort_values(ascending = False).index[0:10]])
print(df_train['condition'][24040:24041].apply(lambda str: len(str.split())))
```

The next part is reviews. let's look at a few

```python
df_train['review'][17]
```

```python
df_test['review'][42]
```

```python
df_train['review'][100000] # what a guy
```

```python
df_test['review'][53766 - 1]
```

```python
df_train['review'][161297 - 1]
```

The first thing that catches the eye is '&#039' for apostrophe. Next, some formating commands such as '\r', '\n'. We'll also delete these.

The next one is usefulcount feature

```python
df_train['usefulCount'].describe()
```

```python
df_test['usefulCount'].describe()
```

```python
_, axes = plt.subplots(nrows=1, ncols=2, figsize=(15, 6))
sns.distplot(df_train['usefulCount'], ax=axes[0], norm_hist=True);
axes[0].set(xlabel='usefulCount_train', ylabel='count');
sns.distplot(df_test['usefulCount'], ax=axes[1], norm_hist=True);
axes[1].set(xlabel='usefulCount_test', ylabel='count');
```

```python
plt.figure(figsize=(12,9))

sns.distplot(df_train['usefulCount'], color='blue', kde=False, norm_hist=True)
sns.distplot(df_test['usefulCount'], color='green', kde=False, norm_hist=True)

plt.xlabel('usefulCount')
plt.ylabel('Counts')

plt.show()
```

The destributions looks like very similar for train and test datasets.

As for the distribution itself, the problem in 'usefulCount' is that the distribution is skewed with long tails. The std is 36 when the mean is 27-28. The 'usefulCounts' is related to condition and drug. For common condition there are much more people that read the reviews and obviously much higher the 'usefulCounts'. We'll try to handle it later.

Date:

```python
print(np.min(df_train['date']),np.max(df_train['date']))
print(np.min(df_test['date']),np.max(df_test['date']))
```

Ok. Time for target.

```python
print(df_train['target'].value_counts())
print(df_train['target'].value_counts(normalize=True))
```

```python
print(df_test['target'].value_counts())
print(df_test['target'].value_counts(normalize=True))
```

Classes are imbalanced.

Now it's safe to say that the test and train samples were derived from a single distribution. Let's concatenate them and continue to analyse.

```python
df_all = pd.concat([df_train,df_test]).reset_index(drop=True)
mask = df_all.index < df_train.shape[0]
df_all['istrain'] = False
df_all['istrain'][mask] = True
```

Sorting by the time

```python
df_all.sort_values(by='date',
ascending=True).head(10)
```

Let's create the main time features

```python
df_all['year'] = df_all['date'].dt.year
df_all['month'] = df_all['date'].dt.month
df_all['dom'] = df_all['date'].dt.day
df_all['dow'] = df_all['date'].dt.weekday
df_all.drop('date', axis=1, inplace=True)
```

```python
# Graphics in SVG format are more sharp and legible
%config InlineBackend.figure_format = 'svg'
```

```python
_, axes = plt.subplots(nrows=1, ncols=2, figsize=(11, 4))
sns.countplot(x='year', hue='target', ax=axes[0], data=df_all[df_all['istrain']]);
axes[0].set(xlabel='year_train', ylabel='count');
sns.countplot(x='year', hue='target', ax=axes[1], data=df_all[df_all['istrain'] == False]);
axes[1].set(xlabel='year_test', ylabel='count');
```

```python
sns.countplot(x='year', hue='target', data=df_all);
```

Intresting. There can be seen 3 groups of years:
1. 2008
2. 2009-2014
3. 2015-2017

Of particular importance is the fact that the amount of negative reviews has increased significantly from 2015. The amount of negative and neutral reviews before 2015 was almost identical.

```python
plt.figure(figsize=(7,4))
sns.countplot(x='month', hue='target', data=df_all);
```

The month would be useless

```python
plt.figure(figsize=(9,4))
sns.countplot(x='dom', hue='target', data=df_all);
```

Nothing intresting (there are only 7 month in the year with 31 day).

```python
plt.figure(figsize=(7,4))
sns.countplot(x='dow', hue='target', data=df_all);
```

The same. Time features on their own (excluding year) won't help. But we'll check this out.

Back to usefulCounts

```python
df_all.groupby(['target'])['usefulCount'].describe()
```

Expected. Positive reviews often get more 'usefulCount's than negative reviews.

```python
del vc_drug_test, vc_drug_train, \
vc_condition_train, vc_condition_test, conditions_drugs_test, conditions_drugs_train
```

To sum up,
1. There are ~1300 missed values in the condition column in both datasets. We've also found crawler error in this column.
2. Datasets were derived from a single distribution, which was proved by time features, usefulCounts and the target.
3. We should bear in the mind that target classes are unbalanced when when we choose the metric and customize the model.
4. Almost all time features are useless (excluding the year). We examined 3 groups of years: 1. 2008, 2. 2009-2014, 3. 2015-2017. Of particular importance is the fact that the amount of negative reviews has increased significantly from 2015. The amount of negative and neutral reviews before 2015 was almost identical.
5. There are several things we have to correct in the reviews such as the apostrophe problem and formatting commands.
6. The usefulCount feature looks useful. But there is the problem with amount of people, which need some 'drugname' in one condition or another.

# 3. Data preprocessing, metric and model selection

Let's start with condition since this column has missing values.

```python
df_all[pd.isnull(df_all['condition'])].head(10)
```

```python
print(pd.isnull(df_all['condition']).sum())
```

As you remember, there is an 'Not Listed / Othe' condition.

```python
print(df_all[df_all['condition'] == 'Not Listed / Othe'].shape)
df_all[df_all['condition'] == 'Not Listed / Othe'].head(10)
```

There are also some crawler errors in condition column:

```python
df_all['condition'].value_counts().tail(20)
```

'users found this comment helpful.' -- let's count the amount of such errors with regular expressions.

```python
import re

df_all['condition'].str.contains(re.compile('users found this comment helpful')).sum()
```

Well, the amount of errors\missing values in the condition column is quiet small. And, according to the reviews, it can be seen that these people have different conditions. It's better to delete them all.

```python
mask = (pd.isnull(df_all['condition'])) | (df_all['condition'] == 'Not Listed / Othe') |\
(df_all['condition'].str.contains(re.compile('users found this comment helpful')))
```

```python
mask.sum()
```

```python
df_all.shape
```

```python
df_all = df_all.drop(df_all[mask].index).reset_index(drop=True)
```

```python
df_all.shape
```

For condition feature we'll apply CountVectorizer, which can by default do all the nessesary staff such as lowercased strings, excluding punctuation marks and ')(/', etc. All we have to know the number of words in the longest 'condition' for choosing the ngram range.

```python
print('The number of words in the longest condition:', df_all['condition'].astype(str).\
apply(lambda str: len(str.split())).sort_values(ascending = False).iloc[0])
print(df_all['condition'].iloc[df_all['condition'].astype(str).\
apply(lambda str: len(str.split())).sort_values(ascending = False).index[0]])
```

drugName. Let's one more time take a look at the values.

```python
df_all['drugName'].head(15)
```

```python
df_all['drugName'].tail(15)
```

As for condition, let's find the longest drug name.

```python
print(df_all['drugName'].iloc[df_all['drugName'].astype(str).\
apply(lambda str: len(str.split())).sort_values(ascending = False).index[1]])
print(df_all['drugName'].iloc[df_all['drugName'].astype(str).\
apply(lambda str: len(str.split())).sort_values(ascending = False).index[4]])
```

Ok, max ngram range would be 10.

Time for reviews.

Let's create WordClouds.

```python
# !pip isntall WordCloud
# !conda install -c conda-forge wordcloud
from wordcloud import WordCloud, STOPWORDS

def plot_wordcloud(data, title):
wordcloud = WordCloud(background_color='black', stopwords = STOPWORDS, max_words = 100, max_font_size = 100,
random_state = 42, width=1280, height=720)
wordcloud.generate(str(data))

plt.figure(figsize=(9, 6))

plt.imshow(wordcloud, interpolation="bilinear");

plt.title(title, fontdict={'size': 20, 'color': 'black',
'verticalalignment': 'bottom'})

plt.axis('off')
plt.tight_layout()
```

In computing, stop words are words which are filtered out before or after processing of natural language data (text). Though "stop words" usually refers to the most common words in a language, there is no single universal list of stop words used by all natural language processing tools, and indeed not all tools even use such a list. Some tools specifically avoid removing these stop words to support phrase search.
Citation: https://en.wikipedia.org/wiki/Stop_words

```python
plot_wordcloud(df_all['review'], 'Wordcloud for both datasets')
```

Let's group_by reviews by the target

```python
plot_wordcloud(df_all['review'][df_all['target'] == 0], 'Wordcloud for negative reviews')
plot_wordcloud(df_all['review'][df_all['target'] == 1], 'Wordcloud for neutral reviews')
plot_wordcloud(df_all['review'][df_all['target'] == 2], 'Wordcloud for positive reviews')
```

Well, it looks like single words won't help us much. Just several words such as horrible, terrible.

Can you see the difference?

As we remember, there are problem with apostrophes. We'll replace them with space symbol

```python
df_all['review'] = df_all['review'].str.replace('&#039;', " ", regex=False);
```

```python
df_all['review'][17]
```

Fine. We'll use TfidfVectorizer for reviews with stopwords. We'll try 3 ngram_ranges: (1,1), (1,3), (2,3).

As for time feature, we'll first include all of them with propper transformation (ohe for years; sin_cos trasnform for days_of_week, days_of_month, month)

```python
def add_time_features(df):
df['dow_sin'] = df['dow'].apply(lambda ts: np.sin(2*np.pi*ts/7.))
df['dow_cos'] = df['dow'].apply(lambda ts: np.cos(2*np.pi*ts/7.))

df['dom_sin'] = df['dom'].apply(lambda ts: np.sin(2*np.pi*ts/31.))
df['dom_cos'] = df['dom'].apply(lambda ts: np.cos(2*np.pi*ts/31.))

df['month_sin'] = df['month'].apply(lambda ts: np.sin(2*np.pi*ts/12.))
df['month_cos'] = df['month'].apply(lambda ts: np.cos(2*np.pi*ts/12.))

df.drop(['month', 'dom', 'dow'], axis=1, inplace=True)

return df
```

```python
df_all = add_time_features(df_all)
df_all.head()
```

Initially, we'll just scale 'usefulCount' with StandardScaler

Model selection.

Taking into account
1. the size of the task (the amount of features after preprocessing -- a waste of time using RandomForestClassifier, GBM, etc)
2. the size of the corpus of the reviews (~160k reviews in the train dataset)
3. the presense of numerical features (can't simply use something like NaiveBayesClassifier)
4. possibilities of the laptop (sad)
5. instructions not to dive deep (NN, specific methods for specific tasks, which sentimental analysis is)

I decided to work with multinomial logistic regression. We worked with it several times. I think there's no need to describe the pros and cons one more time.

Metric selection.

Well, since there is multinomial classification + imbalanced classes:

0. negative -- 0.251032
1. neutral -- 0.147305
2. positive -- 0.601663

So, simple accuracy isn't good idea. In this case better choose precision\recall or even 'weighted' F1-score. Here's the description from sklearn documentation https://scikit-learn.org/stable/modules/generated/sklearn.metrics.accuracy_score.html#sklearn.metrics.accuracy_score
'weighted':
Calculate metrics for each label, and find their average weighted by support (the number of true instances for each label).

Ok. Let's continue

```python
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import confusion_matrix, f1_score, accuracy_score, precision_score, recall_score

from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import SGDClassifier

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split, GridSearchCV

class LemmaTokenizer(object):
def __init__(self):
self.wnl = WordNetLemmatizer()
def __call__(self, doc):
return [self.wnl.lemmatize(t) for t in word_tokenize(doc)]
```

```python
X_train = df_all[df_all['istrain']]
X_test = df_all[df_all['istrain'] == False]
y_train = df_all['target'][df_all['istrain']]
y_test = df_all['target'][df_all['istrain'] == False]

X_train.drop(['istrain','target'], axis=1, inplace=True)
X_test.drop(['istrain','target'], axis=1, inplace=True)
```

Pipeline. Time is running out, deadline is close, so this is the best working variant I can do for now :)

```python
class TextSelector(BaseEstimator, TransformerMixin):
def __init__(self, key):
self.key = key

def fit(self, X, y=None):
return self

def transform(self, X):
return X[self.key]

class NumberSelector(BaseEstimator, TransformerMixin):
def __init__(self, key):
self.key = key

def fit(self, X, y=None):
return self

def transform(self, X):
return X[[self.key]]

uc_transformer = Pipeline(steps = [
('selector_uc', NumberSelector(key = 'usefulCount')),
('scaler_uc', StandardScaler())
])

dow_sin_transformer = Pipeline(steps = [
('selector_dow_sin', NumberSelector(key = 'dow_sin')),
('scaler_dow_sin', StandardScaler())
])
dow_cos_transformer = Pipeline(steps = [
('selector_dow_cos', NumberSelector(key = 'dow_cos')),
('scaler_dow_cos', StandardScaler())
])

dom_sin_transformer = Pipeline(steps = [
('selector_dom_sin', NumberSelector(key = 'dom_sin')),
('scaler_dom_csin', StandardScaler())
])
dom_cos_transformer = Pipeline(steps = [
('selector_dom_cos', NumberSelector(key = 'dom_cos')),
('scaler_dom_cos', StandardScaler())
])

month_sin_transformer = Pipeline(steps = [
('selector_month_sin', NumberSelector(key = 'month_sin')),
('scaler_month_sin', StandardScaler())
])
month_cos_transformer = Pipeline(steps = [
('selector_month_cos', NumberSelector(key = 'month_cos')),
('scaler_month_cos', StandardScaler())
])

cond_tranformer = Pipeline(steps = [
('selector_cond', TextSelector(key='condition')),
('cv_cond', CountVectorizer(stop_words='english', ngram_range=(1,8)))
])

drug_tranformer = Pipeline(steps = [
('selector_drug', TextSelector(key='drugName')),
('cv_cond', CountVectorizer(stop_words='english', ngram_range=(1,10)))
])

y_transformer = Pipeline(steps = [
('selector_y', NumberSelector(key='year')),
('ohe_y', OneHotEncoder(handle_unknown='ignore'))
])

rev_tranformer = Pipeline(steps = [
('selector_rev', TextSelector(key='review')),
('tfidf_rev',TfidfVectorizer(stop_words='english',
ngram_range=(1,3),
max_features = 100000
)
])

preprocessor = FeatureUnion([
('usefulCount', uc_transformer),
('dow_sin', dow_sin_transformer),
('dow_cos', dow_cos_transformer),
('dom_sin', dom_sin_transformer),
('dom_cos', dom_sin_transformer),
('month_sin', month_sin_transformer),
('month_cos', month_cos_transformer),
('condition', cond_tranformer),
('drugName', drug_tranformer),
('year', y_transformer),
('review', rev_tranformer)
])

mlog = Pipeline(steps = [('preprocessor', preprocessor),
('logreg', LogisticRegression(random_state=42, solver = 'lbfgs', multi_class='multinomial'))])
```

Let's try to predict

```python
%%time

warnings.filterwarnings('ignore')

mlog.fit(X_train, y_train)
```

Weighted f1 score for test dataset

```python
y_pred = mlog.predict(X_test)
print('Weighted f1 score for test dataset',f1_score(y_test, y_pred, average='weighted'))
```

Let's also compute accuracy

```python
print('Accuracy score', accuracy_score(y_test, y_pred))
```

And confusion_matrix: https://scikit-learn.org/stable/auto_examples/model_selection/plot_confusion_matrix.html#sphx-glr-auto-examples-model-selection-plot-confusion-matrix-py

```python
import itertools

def plot_confusion_matrix(cm, classes,
normalize=False,
title='Confusion matrix',
cmap=plt.cm.Blues):
"""
This function prints and plots the confusion matrix.
Normalization can be applied by setting `normalize=True`.
"""
if normalize:
cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
print("Normalized confusion matrix")
else:
print('Confusion matrix, without normalization')

print(cm)

plt.imshow(cm, interpolation='nearest', cmap=cmap)
plt.title(title)
plt.colorbar()
tick_marks = np.arange(len(classes))
plt.xticks(tick_marks, classes, rotation=45)
plt.yticks(tick_marks, classes)

fmt = '.2f' if normalize else 'd'
thresh = cm.max() / 2.
for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
plt.text(j, i, format(cm[i, j], fmt),
horizontalalignment="center",
color="white" if cm[i, j] > thresh else "black")

plt.ylabel('True label')
plt.xlabel('Predicted label')
plt.tight_layout()
```

```python
plot_confusion_matrix(confusion_matrix(y_test, y_pred),classes = [0, 1, 2])
```

Well, i suppose for default model it's ok. Time for CV

# 4. Creation of new features and description of this process

Ok, now we'll try to drop features that might have no impact. As was stated, all time features except year should be removed. Moreover, instead of the year column we will create 3 bool features for 3 groups described above.

We also need to handle the problem with usefulCounts. The simple idea is to devide by the amount of conditions

```python
def add_new_features(df):
df['year1'] = df['year'] == 2008
df['year2'] = (df['year'] < 2015) & (df['year'] > 2008)
df['year3'] = (2014 < df['year']) & (df['year'] < 2018)

df.drop('year', axis=1, inplace=True)

return df

df_all.drop(['dow_sin', 'dow_cos', 'dom_sin', 'dom_cos', 'month_sin', 'month_cos'], axis = 1, inplace = True)
df_all = add_new_features(df_all)
```

```python
X_train = df_all[df_all['istrain']]
X_test = df_all[df_all['istrain'] == False]
y_train = df_all['target'][df_all['istrain']]
y_test = df_all['target'][df_all['istrain'] == False]

X_train.drop(['istrain','target'], axis=1, inplace=True)
X_test.drop(['istrain','target'], axis=1, inplace=True)
```

```python
y1_transformer = Pipeline(steps = [
('selector_y1', NumberSelector(key='year1'))
])

y2_transformer = Pipeline(steps = [
('selector_y2', NumberSelector(key='year2'))
])

y3_transformer = Pipeline(steps = [
('selector_y3', NumberSelector(key='year3'))
])

preprocessor2 = FeatureUnion([
('usefulCount', uc_transformer),
('condition', cond_tranformer),
('drugName', drug_tranformer),
('year1', y1_transformer),
('year2', y2_transformer),
('year3', y3_transformer),
('review', rev_tranformer)
])

mlog2 = Pipeline(steps = [('preprocessor', preprocessor2),
('logreg', LogisticRegression(random_state=42, solver = 'lbfgs', multi_class='multinomial', ))])
```

Let's check this out

```python
%%time
mlog2.fit(X_train, y_train)
```

```python
y_pred2 = mlog2.predict(X_test)
print('Weighted f1 score for test dataset',f1_score(y_test, y_pred2, average='weighted'))
```

```python
print('Accuracy score', accuracy_score(y_test, y_pred2))
```

Well, despite the imbalanced classes, accuracy looks fine.

```python
plot_confusion_matrix(confusion_matrix(y_test, y_pred2),classes = [0, 1, 2])
```

Well, looks better!

# 5. Cross-validation and adjustment of model hyperparameters

Since our classes imbalancedand the train\test came from the same distribution, we'll perform StratifiedKFold with 3 splits

```python
from sklearn.model_selection import StratifiedKFold
```

```python
cv = StratifiedKFold(n_splits = 3)
```

Time for tuning hyperparameters.

Logreg, if you remember, has two methods for regularization: l1, l2 regularization. But there are only 3 solvers which support multiclass problems and all of them works only with l2. I think, there's no need to describe what is l2 regularization.

As for Tfidf, as was stated above, we'll try several ngram_ranges. Let the max amount of features stay constant (100k)

```python
param_grid = {
'preprocessor__review__tfidf_rev__ngram_range': [(1,1), (1,3), (2,3)],
'logreg__C': [0.1, 0.5, 1.0, 2],
}

grid_search = GridSearchCV(mlog2, param_grid, cv=cv, scoring = 'f1_weighted',verbose = 20, n_jobs = -1)
```

```python
grid_search.fit(X_train,y_train)
```

```python
print('grid search params:', grid_search.best_params_)
print('grid search score:', grid_search.best_score_)
```

# 6. Plotting training and validation curves

No time for this biblethumpbiblethumpbiblethump

# 7. Prediction for test or hold-out samples

Deadline is over but I stack here: mlog2.set_params(grid_search.best_params_) isn't working...

```python
mlog2.set_params(logreg__C = 2, preprocessor__review__tfidf_rev__ngram_range = (1, 3))
mlog2.fit(X_train, y_train)
y_pred_final = mlog2.predict(X_test)
```

```python
print('Weighted f1 score for test dataset', f1_score(y_test, y_pred_final, average='weighted'))
```

```python
print('Accuracy score', accuracy_score(y_test, y_pred_final))
```

Score decreased. Well, nothing left to do. Better CV (more splits, more params values) should improve the results, because the are derived from the same distribution.

# 8. Conclusions

In this project we consider the sentimental classification problem based on the UCI ML Drug Review dataset. We tryed to apply as much as possible of what we have learned for last 3 month. Nevertheless, the results are shown. Not so good, but... c'mon, it's just a begining. Simple pipeline with a lil bit feauture engineering gave us the above result. As stated in the evaluation criteria I've to describe the value of the project. Well, for me it's huge. Filling out the forms is no match for your own project. I hope you share my opinion.

Possible cases of application? No one. But as a baseline for me to learn something about sentimental analysis is fine.

And, of course, there are a lot of ways to improving: NLP tecniques, deep learning, etc. But first of all I have to finnish the task.

Thanks for reading!
