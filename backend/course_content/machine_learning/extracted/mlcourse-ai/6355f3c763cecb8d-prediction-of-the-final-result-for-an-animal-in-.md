# Prediction of the final result for an animal in a shelter

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/shelter_by_Julia_Mochalova.ipynb
Original Path: jupyter_english/projects_indiv/shelter_by_Julia_Mochalova.ipynb
Course: Machine Learning

## Prediction of the final result for an animal in a shelter

### Research plan
- Dataset and features description
- Exploratory data analysis
- Visual analysis of the features
- Patterns, insights, pecularities of data
- Data preprocessing
- Cross-validation, hyperparameter tuning
- Validation and learning curves
- Prediction for hold-out and test samples
- Model evaluation with metrics description
- Conclusions

### Part 1. Dataset and features description

Dataset from [Kaggle page](https://www.kaggle.com/aaronschlegel/austin-animal-center-shelter-outcomes-and/home). The dataset has the following features:

#### Dataset from Austin Animal Center Shelter contains information about animals in the shelter and their outcome. It is necessary to build a model that predicts the outcome of the animal's stay in the shelter.

You can see the features below:

- __age_upon_outcome__ - Age of the animal at the time at which it left the shelter.
- __animal_id__
- __animal_type__ - Cat, dog, or other (including at least one bat!).
- __breed__ - Animal breed. Many animals are generic mixed-breeds, e.g. "Long-haired mix".
- __color__ - Color of the animal's fur, if it has fur.
- __date_of_birth__
- __datetime__
- __monthyear__
- __name__
- __outcome_subtype__
- __outcome_type__ - Ultimate outcome for this animal. Possible entries include transferred, [mercy] euthanized, adopted.
- __sex_upon_outcome__

```python
import pandas as pd
import seaborn as sns
import string
import numpy as np
from sklearn.preprocessing import LabelEncoder
from matplotlib import pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import cross_val_score
```

```python
path = 'shelter.csv'
```

```python
df = pd.read_csv(path, parse_dates=['date_of_birth','datetime','monthyear'])
df.head()
```

### Part 2. Exploratory data analysis

We see a mix of categorical, numeric features and a date.
In the task of predicting the outcome of an animal in an orphanage, the target variable is outcome_subtype. outcome_subtype is of several types, so the task is reduced to a multi-class classification

```python
df.info()
```

1. Many features contain null values, in the future we will correct this.
2. To predict the outcome, we will not use an outcome subtype, so it should be removed.

```python
df.drop('outcome_subtype', axis=1, inplace=True)
```

Some null values can be filled, for example, with an average or median, but not in the case of the sex_upon_outcome and outcome_type features, because these variables are significant and consist of categorical values, so we also get rid of null values.

```python
df = df[(~df.sex_upon_outcome.isnull()) & (~df.outcome_type.isnull())]
# Empty names fill in "Unknown"
df.name = df.name.fillna('Unknown')
```

Let's see on age feature

```python
df.age_upon_outcome.unique()
```

Values have a different format: in weeks, days and years. Let's recalculate the age, based on the date of birth and the day of recording information in the file and bring everything to one format - the day. Then we look at the description of the values obtained.

```python
df['age_in_days'] = (df['datetime'] - df['date_of_birth']).dt.days
df['age_in_days'].describe()
```

```python
#Replace negative values with zero.
df[df['age_in_days']<0]=0
```

```python
df.drop('age_upon_outcome', axis=1, inplace=True)
df.drop(['date_of_birth','datetime', 'monthyear'], axis=1, inplace=True)
df.drop('animal_id', axis=1, inplace=True)
```

```python
df.info()
```

Now all features do not have empty values and we can proceed to further actions.

```python
df.nunique()
```

Let's try to perform the conversion on string features, maybe it will reduce the number of unique values

```python
def punctuation_free(text):
text = text.replace('/', ' ')
return ''.join([char for char in text if char not in string.punctuation])
```

```python
df = df[df.animal_type!=0]
```

```python
strings = ['animal_type','breed','color','name']
for i in strings:
df[i] = df[i].apply(lambda x: punctuation_free(x.lower()))
df.nunique()
```

Indeed, this transformation has helped us reduce the number of unique values. You can try to apply any other transformations, but we will stop there and go ahead.

```python
df['outcome_type'].value_counts()
```

### Part 3. Visual analysis of the features

```python
plt.figure(figsize=(12,4))
sns.countplot(y=df['outcome_type'],
palette='mako_r',
order=df['outcome_type'].value_counts().index)
plt.show()
```

We see that in most animals a good result, since adoption takes the largest share, and negative results are very rare. In this case, we see that the classes are not really balanced, and the fact that they have not so many opportunities to work, it seems that it is correct to predict death or any of these unlikely results will be a problem.

```python
plt.figure(figsize=(12,6))
sns.countplot(data=df,
x='animal_type',
hue='outcome_type')
plt.legend(loc='upper right')
plt.show()
```

It seems that the distribution of results also differs from animal types; we can clearly see that dogs are more likely to be returned to the owner and are attached than cats. And animals from another category are more likely to be euthanized than any other result.

```python
g = sns.FacetGrid(df, hue="animal_type", size=12)
g.map(sns.kdeplot, "age_in_days")
g.add_legend()
g.set(xlim=(0,5000), xticks=range(0,5000,365))
plt.show(g)
```

We can see the trend here, if we look more closely, we will see that these peaks occur in what would be when the animal has completed another year. It makes sense if we think that animal shelters will make cutoffs for age when deciding what to do with an animal. For example, when an animal completes 4 years, and they suffer it. Or maybe they don’t know the exact age of the animal, so the “Date of Birth” column, from which we calculated our dates, is only an approximation.

It seems that most cats are adopted during the first months, we also see that there is an annual trend, and that there are many deliverables in the first year.

### Part 3. Patterns, insights, pecularities of data

Since we have categorical data, it is necessary to encode them, including the target variable
For the target, we will use the Label Encoder, for the other categorical features we compare two ways:
- get dummies + LabelEncoder
- LabelEncoder only

### Part 4. Data preprocessing

```python
df.head()
```

```python
df.sex_upon_outcome.unique()
```

sex_upon_outcomeLet's add new features for sex instead of sex_upon_outcome

```python
df['Intact'] = df.sex_upon_outcome.apply(lambda x: 1 if 'Intact' in x else 0)
df['Spayed'] = df.sex_upon_outcome.apply(lambda x: 1 if 'Spayed' in x else 0)
df['Neutered'] = df.sex_upon_outcome.apply(lambda x: 1 if 'Neutered' in x else 0)
df['Male'] = df.sex_upon_outcome.apply(lambda x: 1 if 'Male' in x else 0)
df['Female'] = df.sex_upon_outcome.apply(lambda x: 1 if 'Female' in x else 0)
df['Unknown_sex'] = df.sex_upon_outcome.apply(lambda x: 1 if 'Unknown' in x else 0)
```

```python
df = df.drop('sex_upon_outcome', axis = 1)
df.head()
```

```python
X_df = df.drop('outcome_type', axis=1)[:20000]
y_df = df['outcome_type'][:20000]
```

Let's try to apply LaberEncoder to features.
For faster calculations, reduce the sample size (no need to do that if you have enough power)

```python
le = LabelEncoder()

X_df.name = le.fit_transform(X_df['name'])
X_df.animal_type = le.fit_transform(X_df['animal_type'])
X_df.color = le.fit_transform(X_df['color'])
X_df.breed = le.fit_transform(X_df['breed'])
```

```python
y_df = le.fit_transform(y_df)
```

```python
X_df.head()
```

### Model selection

#### There are many different models for solving classification problems. For this task, it is proposed to evaluate the performance of models:
- KNeighborsClassifier
- RandomForestClassifier
- GradientBoostingClassifier

We will configure the hyperparameters for the model that gives the best results

```python
knc = KNeighborsClassifier()
rfc = RandomForestClassifier(random_state=17)
gbc = GradientBoostingClassifier(random_state=17)

X_train, X_test, y_train, y_test = train_test_split(X_df, y_df, test_size=0.3)
```

```python
algos = []
predictions = []
data = []
algos.append(knc)
algos.append(rfc)
algos.append(gbc)
for i in algos:
i.fit(X_train, y_train)
data.append({'accuracy_score': accuracy_score(i.predict(X_test), y_test)})
results = pd.DataFrame(data=data, columns=['accuracy_score'],
index=['KNeighborsClassifier', 'RandomForestClassifier',
'GradientBoostingClassifier'])

results
```

Let's try to encode the data using pd.get_dummies, let's see how the quality of the models will change

```python
X_df = df.drop('outcome_type', axis=1)[:10000]
X_df = pd.get_dummies(X_df, columns=['animal_type','color','breed'])
X_df.name = le.fit_transform(X_df['name'])
X_train, X_test, y_train, y_test = train_test_split(X_df, y_df, test_size=0.3)
```

```python
algos = []
predictions = []
data = []
algos.append(knc)
algos.append(rfc)
algos.append(gbc)
for i in algos:
i.fit(X_train, y_train)
data.append({'accuracy_score': accuracy_score(i.predict(X_test), y_test)})
results = pd.DataFrame(data=data, columns=['accuracy_score'],
index=['KNeighborsClassifier', 'RandomForestClassifier',
'GradientBoostingClassifier'])

results
```

Even with a small amount of data, the model has been trained much longer than the first way.
You may notice that the KN classifier has become more accurate to make a forecast, but nevertheless, Gradient Boosting Classifier copes with this task better in both cases than other models. Also, the result using the LabelEncoder is higher than using get_dummies.
So, let's take the entire amount of test data with Gradient Boosting Classifier and LabelEncoder and set up hypermarameters on Cross-validation

### Part 6. Cross-validation, hyperparameter tuning

```python
#we take more data
X_df = df.drop('outcome_type', axis=1)[:10000]
y_df = df['outcome_type'][:10000]
X_df.name = le.fit_transform(X_df['name'])
X_df.animal_type = le.fit_transform(X_df['animal_type'])
X_df.color = le.fit_transform(X_df['color'])
X_df.breed = le.fit_transform(X_df['breed'])
y_df = le.fit_transform(y_df)
```

```python
X_df.shape
```

```python
params_grid = {'max_features': [100, 200,348]}
model_grid = GridSearchCV(gbc,params_grid, cv=5)
model_grid.fit(X_train, y_train)
model_grid.best_params_
```

### Part 7. Validation and learning curves

```python
from sklearn.metrics import make_scorer

# Create scorer with our accuracy-function
scorer = make_scorer(accuracy_score, greater_is_better=True)
```

```python
X_df = df.drop('outcome_type', axis=1)[:1000]
y_df = df['outcome_type'][:1000]
X_df = pd.get_dummies(X_df, columns=['animal_type','color','breed'])
X_df.name = le.fit_transform(X_df['name'])
y_df = le.fit_transform(y_df)
X_train, X_test, y_train, y_test = train_test_split(X_df, y_df, test_size=0.3)

max_depth_list = [25, 35,45]
cv_errors_list = []
train_errors_list = []
valid_errors_list = []

for max_depth in max_depth_list:
gbc = GradientBoostingClassifier(max_depth=max_depth,random_state=17, max_features = 200)

cv_errors = cross_val_score(estimator=gbc,
X=X_train,
y=y_train,
scoring=scorer,
cv=3)
cv_errors_list.append(cv_errors.mean())

gbc.fit(X=X_train, y=y_train)
train_error = accuracy_score(y_train, gbc.predict(X_train))
train_errors_list.append(train_error)
valid_error = accuracy_score(y_test, gbc.predict(X_test))
valid_errors_list.append(valid_error)

print(max_depth)
```

```python
plt.figure(figsize=(10, 7))

plt.plot(max_depth_list,cv_errors_list)
plt.plot(max_depth_list,valid_errors_list)
plt.vlines(x=max_depth_list[np.array(cv_errors_list).argmin()],
ymin=0.62, ymax=0.68,
linestyles='dashed', colors='r')

plt.legend(['Cross validation accuracy on train',
'accuracy on validation set',
'Best Max_depth value on CV'])
plt.title("Accuracy test sets.")
plt.xlabel('Max_depth value')
plt.ylabel('accuracy value')
plt.grid()
```

```python
gbc = GradientBoostingClassifier(random_state=17, max_features = 200)
gbc.fit(X_train, y_train)
```

```python
accuracy_score(gbc.predict(X_test), y_test)
```

### Part 7. Conclusions

We got a good result, but we should carry out a more detailed setting of the hyperparameters and use the full amount of data in the learning process. The solution may be useful for shelters that collect such data and try to predict the approximate result of the animal detection in the shelter. This is important because it allows them to understand which signs more affect the positive outcome for animals and which ones promise more negative.
