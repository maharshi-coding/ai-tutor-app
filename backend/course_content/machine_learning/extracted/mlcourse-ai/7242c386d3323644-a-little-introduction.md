# A little introduction.

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/Classification_on_zakupkigovru_contracts_Mikhail_Korshchikov.ipynb
Original Path: jupyter_english/projects_indiv/Classification_on_zakupkigovru_contracts_Mikhail_Korshchikov.ipynb
Course: Machine Learning

## A little introduction.

One of my tasks at a previous job was to supply medical equipment to the hospitals in Russia. <br/>
At this moment there is a goverment regulation of the possible options for the purchase of medical equipment in hospitals. <br/>
The procedure calls "Tender" and Tenders placed on the public site. Everyone can apply for participation and win Tender. The one who offers the lowest price will be a winner.
In an ideal world, technical specifications for the necessary equipment should not imply a specific brand of manufacturer. (as an example - analogy: costumer can’t write - we want to buy "The lastest model of iMac." It will be correct to write: we need a PC with 8 cores, with a frequency of 2.2 megahertz, 8 GB RAM. A hard disk of at least 250 GB, etc.)<br/>
But in fact, many manufacturers have their own set of unique technical characteristics that uniquely define the company. And the technical task of the tender is designed so that only one company-brand corresponds to the description.<br/>
That was in my case - medical equipment.<br/>
I'am, as a supplier, very interested in quickly identifying a specific manufacturer in order to be the first to negotiate and get the minimum price. This is a guarantee of victory in the tender.<br/>
I have compiled a parser that pulls data from the site (zakupki.gov.ru), where the results of public tenders are published. Here, by the way, several options are possible. Parse from the page, or from ftp, or take a json from the guys who share the already marked up information (Проект КГИ “Госзатраты” (https://clearspending.ru)<br/>
I took the data for 2017 year. And in the Sverdlovsk region (geographical entity in Russia).
Results are a contract with a large number of details. Since, initially, it was not planned to use ML. I've scrapepd data just for only a one-time analytics. The following indicators were unloaded:
- customer.inn - unique identifier of the customer (hospital)
- regNum - contract unique identifier
- signDate - date of contract signing
- Name - the actual specification of the proposed to the delivery of equipment.
- product_price - price of equipment
- Quantity - the amount of equipment
- inn - the unique identifier of the winner
- Manufacturer - target. The names of Manufacturers

link to the data - https://drive.google.com/open?id=1S9X_B9Vayev_mu9co8mVR0acdeU5uBTw <br/>
This task is similar to Medium competition. <br/>
Instead of the content of articles - those task. <br/>
And various features for a possible improvement in the speed. <br/>

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from scipy.sparse import csr_matrix
from scipy.sparse import hstack
from sklearn.metrics import confusion_matrix
```

```python
data = pd.read_csv('Urology_department.csv', delimiter=';', converters={'customer.inn':str,\
'signDate':pd.to_datetime})
data.head()
```

```python
data.info()
```

```python
data.isnull().any()
```

```python
data = data.dropna()
```

Ok. There are no NAN values. all types are correct

```python
data.shape
```

Let's take a look on our target variable

```python
data.Manufacturer.value_counts()
```

There are many "0" values. It's mean that we don't know manufacturer. We'll drop this rows. And one manufacturer duplicated ("Coloplast" and "COLOPLAST"). We'll lowecase all target manufacturers names. And we don't interesting in counts less then 10. (They are so rare that they can be neglected.)

By the way - the most time i spent to prepare data. Because published contracts don't have information about manufacturers. Either it is, but it very unstructured. I've create target variable myself.

```python
data.Manufacturer = data.Manufacturer.str.lower()
cnt = data.Manufacturer.value_counts()
data = data.loc[(data.Manufacturer != '0') & (data.Manufacturer.isin(cnt.index[cnt >= 10]).values)]
```

```python
plt.figure(figsize=(20,10))
sns.countplot(y="Manufacturer", data=data, order = data.Manufacturer.value_counts().index)
```

My task is to create a classifier for 14 classes

Let's take a look on other categorial variables. Costumer.inn and inn of winner

```python
plt.figure(figsize=(20,10))
sns.countplot(y="customer.inn", data=data, order = data["customer.inn"].value_counts().index)
```

And the winner.inn

```python
plt.figure(figsize=(20,10))
sns.countplot(y="inn", data=data, order = data["inn"].value_counts().index)
```

We have leaders in terms of purchases and supplies. <br/>
Let's take a look what brands of Manufacturers are they sell into hospitals

```python
cnt_l_c = data["customer.inn"].value_counts()
df_leaders_costumers = data.loc[data["customer.inn"].isin(cnt_l_c.index[cnt_l_c >= 100]).values]
plt.figure(figsize=(20,10))
sns.countplot(y="Manufacturer", data=df_leaders_costumers, order = df_leaders_costumers.Manufacturer.value_counts().index)
```

I don't think this feature will be useful..

```python
cnt_l_s = data["inn"].value_counts()
df_leaders_suppliers = data.loc[data["inn"].isin(cnt_l_s.index[cnt_l_s >= 100]).values]
plt.figure(figsize=(20,10))
sns.countplot(y="Manufacturer", data=df_leaders_suppliers, order = df_leaders_suppliers.Manufacturer.value_counts().index)
```

We can see that some target manufacturers are not presented. But distribution is look alike to our start.

And let's look to the date of contract

```python
data['day'] = data['signDate'].apply(pd.datetime.weekday)
data['month'] = data['signDate'].apply(lambda x: x.month)
```

```python
plt.figure(figsize=(20,10))
sns.countplot(y="Manufacturer", data=data, hue='month')
```

```python
plt.figure(figsize=(20,10))
sns.countplot(y="Manufacturer", data=data, hue='day')
```

At the first time let's build a model with only Description of Manufacturer as feature

```python
train_part, test_part = train_test_split(data[['name','Manufacturer']], test_size=0.2, random_state=21, stratify=data["Manufacturer"])
```

```python
pipeline_tfidf_lr = Pipeline([('tfidf', TfidfVectorizer()),
('lr', LogisticRegression())])

pipeline_tfidf_lr.fit(train_part['name'], train_part["Manufacturer"])

predicted = pipeline_tfidf_lr.predict(test_part["name"])
```

Confusion matrix

```python
test_classes_counts = test_part["Manufacturer"].value_counts()
test_classes_names = np.array(test_classes_counts.index)
total_classes = len(test_classes_counts)

cm = confusion_matrix(y_true=test_part["Manufacturer"], y_pred=predicted, labels=test_classes_names)
for true_class_id in range(total_classes):
true_class_name = test_classes_names[true_class_id]
true_class_count = test_classes_counts[true_class_name]

print('For Manufacturer "{0}" ({1} test examples) were predicted:'.format(true_class_name, true_class_count))
for pred_class_id in range(total_classes):
percent = int(cm[true_class_id, pred_class_id].item()) / int(true_class_count.item()) * 100
if percent >= 5:
pred_class_name = test_classes_names[pred_class_id]
print('\t"{0}" в {1:.2f} % ({2} раз)'.format(pred_class_name, percent, cm[true_class_id, pred_class_id]))
```

```python
time_split = TimeSeriesSplit(n_splits=5)
```

```python
from sklearn.model_selection import GridSearchCV

parameters_lr = {'tfidf__ngram_range': [(1, 1), (1, 2)],
'tfidf__use_idf': (True, False),
'tfidf__max_features': [50000, 100000],
'lr__C': np.logspace(-2, 2, 10),
}

gs_lr = GridSearchCV(pipeline_tfidf_lr, parameters_lr, scoring="accuracy", n_jobs=4, cv=time_split, verbose=10,
return_train_score=True)
gs_lr = gs_lr.fit(data["name"], data["Manufacturer"])
```

```python
gs_lr.best_params_
```

Let's try to prepare text data with removing special characters. <br/>
And stemm it

```python
import nltk
from nltk.stem import SnowballStemmer
import re
stemmer = SnowballStemmer('russian')
```

```python
def remove_spec_char(string):
return re.sub('[?|#|$|.|!|0-9|²|)|(|,|–|+|”|—|’|/]', '', string)

def steming(string):
singles = [stemmer.stem(word) for word in string.split()]
return " ".join(singles)
```

```python
data.name = data.name.apply(remove_spec_char)
data.name = data.name.apply(steming)
```

Train our model on prepared data

```python
pipeline_tfidf_lr_prep = Pipeline(
[('tfidf', TfidfVectorizer(ngram_range=(1, 2), use_idf=True, max_features=50000)),
('lr', LogisticRegression(C=12.915496650148826)),
])
```

```python
train_part, test_part = train_test_split(data[['name','Manufacturer']], test_size=0.2, random_state=21, stratify=data["Manufacturer"])
pipeline_tfidf_lr_prep.fit(train_part["name"], train_part["Manufacturer"])
predicted = pipeline_tfidf_lr_prep.predict(test_part["name"])
```

```python
test_classes_counts = test_part["Manufacturer"].value_counts()
test_classes_names = np.array(test_classes_counts.index)
total_classes = len(test_classes_counts)

cm = confusion_matrix(y_true=test_part["Manufacturer"], y_pred=predicted, labels=test_classes_names)
for true_class_id in range(total_classes):
true_class_name = test_classes_names[true_class_id]
true_class_count = test_classes_counts[true_class_name]

print('For Manufacturer "{0}" ({1} test examples) were predicted:'.format(true_class_name, true_class_count))
for pred_class_id in range(total_classes):
percent = int(cm[true_class_id, pred_class_id].item()) / int(true_class_count.item()) * 100
if percent >= 5:
pred_class_name = test_classes_names[pred_class_id]
print('\t"{0}" в {1:.2f} % ({2} раз)'.format(pred_class_name, percent, cm[true_class_id, pred_class_id]))
```

Now let's add other features, and take a look on results

```python
scaler = StandardScaler()
tfidf = TfidfVectorizer(ngram_range=(1, 2), use_idf=True, max_features=50000)
lr = LogisticRegression(C=12.915496650148826)
```

```python
data = pd.get_dummies(data, columns=['customer.inn', 'inn', 'day', 'month'])
data.drop(columns=['regNum','signDate'], inplace=True)
```

```python
tmp = StandardScaler().fit_transform(data[['product_price','quantity']])
text = tfidf.fit_transform(data.name)
features = data.iloc[:,4:].values
```

```python
X = csr_matrix(hstack([text, tmp, features]))
y = data.Manufacturer
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=21, stratify=y)
```

```python
lr.fit(X_train, y_train)
predicted = lr.predict(X_test)
```

```python
test_classes_counts = test_part["Manufacturer"].value_counts()
test_classes_names = np.array(test_classes_counts.index)
total_classes = len(test_classes_counts)
```

```python
cm = confusion_matrix(y_true=test_part["Manufacturer"], y_pred=predicted, labels=test_classes_names)
```

```python
for true_class_id in range(total_classes):
true_class_name = test_classes_names[true_class_id]
true_class_count = test_classes_counts[true_class_name]

print('For Manufacturer "{0}" ({1} test examples) were predicted:'.format(true_class_name, true_class_count))
for pred_class_id in range(total_classes):
percent = int(cm[true_class_id, pred_class_id].item()) / int(true_class_count.item()) * 100
if percent >= 5:
pred_class_name = test_classes_names[pred_class_id]
print('\t"{0}" в {1:.2f} % ({2} раз)'.format(pred_class_name, percent, cm[true_class_id, pred_class_id]))
```

So, we increase our score with new features

### The main reason for completing this task is:
- Reduced time to process incoming tenders <br/>
- Receiving profitable conditions from manufacturers (remember, who is the first to request - the one has the maximum discount)<br/>
- And this is the key to winning the tender.<br/>
- Reduction or switching to other tasks of a qualified staff of the organization.<br/>
- Cost reduction and profit growth organization.

### What can be done next:
- The main direction I would choose - enrichment with new data. Grabing new contracts, marking on unknown manufacturers.
- The use of other models (random forest, svm and others ...)
