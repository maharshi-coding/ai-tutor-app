# <center> Open Machine Learning Course mlcourse.ai. English session #2

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/wines_sudarkova.ipynb
Original Path: jupyter_english/projects_indiv/wines_sudarkova.ipynb
Course: Machine Learning

## <center> Open Machine Learning Course mlcourse.ai. English session #2

### <center> Autor: Sudarkova Sveta (@swets)

## <center> Individual data analysis project </center>
### <center> Predict quality of wine </center>

**Research plan**
- Feature and data explanation
- Primary data analysis
- Primary visual data analysis
- Insights and found dependencies
- Metrics selection
- Model selection
- Data preprocessing
- Cross-validation and adjustment of model hyperparameters
- Creation of new features and description of this process
- Plotting training and validation curves
- Prediction for test or hold-out samples
- Conclusions

Read more <a href="https://mlcourse.ai/roadmap">here</a>.

### <center> 1. Feature and data explanation

This datasets is related to red variants of the Portuguese "Vinho Verde" wine. Due to privacy and logistic issues, only physicochemical (inputs) and sensory (the output) variables are available (e.g. there is no data about grape types, wine brand, wine selling price, etc.).

The datasets can be viewed as classification or regression tasks. The classes are ordered and not balanced (e.g. there are much more normal wines than excellent or poor ones).

This dataset is also available from the UCI machine learning repository, https://archive.ics.uci.edu/ml/datasets/wine+quality , I just shared it to kaggle for convenience. (If I am mistaken and the public license type disallowed me from doing so, I will take this down if requested.)

### Source & Acknowledgements<br>
Original dataset was obtained from https://www.kaggle.com/uciml/red-wine-quality-cortez-et-al-2009 <br>
This dataset is also available from the UCI machine learning repository, https://archive.ics.uci.edu/ml/datasets/wine+quality

P. Cortez, A. Cerdeira, F. Almeida, T. Matos and J. Reis. **Modeling wine preferences by data mining from physicochemical properties.** *Decision Support Systems*, 47(4):547-553, 2009.

### Feature descriptions in dataset

**fixed acidity**<br> Most acids involved with wine or fixed or nonvolatile (do not evaporate readily).<br>Type: Numeric<br><br>
**volatile acidity**<br> The amount of acetic acid in wine, which at too high of levels can lead to an unpleasant, vinegar taste.<br>Type: Numeric<br><br>
**citric acid**<br> Found in small quantities, citric acid can add 'freshness' and flavor to wines.<br>Type: Numeric<br><br>
**residual sugar**<br> The amount of sugar remaining after fermentation stops, it's rare to find wines with less than 1 gram/liter and wines with greater than 45 grams/liter are considered sweet.<br>Type: Numeric<br><br>
**chlorides**<br> The amount of salt in the wine.<br>Type: Numeric<br><br>
**free sulfur dioxide**<br> the free form of SO2 exists in equilibrium between molecular SO2 (as a dissolved gas) and bisulfite ion; it prevents microbial growth and the oxidation of wine.<br>Type: Numeric<br><br>
**total sulfur dioxide**<br> Amount of free and bound forms of S02; in low concentrations, SO2 is mostly undetectable in wine, but at free SO2 concentrations over 50 ppm, SO2 becomes evident in the nose and taste of wine.<br>Type: Numeric<br><br>
**density**<br> The density of water is close to that of water depending on the percent alcohol and sugar content.<br>Type: Numeric<br><br>
**pH**<br> describes how acidic or basic a wine is on a scale from 0 (very acidic) to 14 (very basic); most wines are between 3-4 on the pH scale.<br>Type: Numeric<br><br>
**sulphates**<br> a wine additive which can contribute to sulfur dioxide gas (S02) levels, wich acts as an antimicrobial and antioxidant.<br>Type: Numeric<br><br>
**alcohol**<br> The percent alcohol content of the wine.<br>Type: Numeric<br><br>
**quality**<br> output variable (based on sensory data, score between 0 and 10).<br>Type: Numeric<br><br>

### <center> 2-3. Primary data and visual data analysis

Import libraries

```python
from sklearn.cross_validation import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.ensemble import RandomForestRegressor
import seaborn as sns

import warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
import statsmodels.stats.api as sm

%pylab inline
```

```python
wine = pd.read_csv('winequality-red.csv', sep=',', header=0)
wine.head()
```

Do some plotting to know how the data columns are distributed in the dataset.

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'fixed acidity', data = wine)
```

Here we see that fixed acidity does not give any specification to classify the quality.

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'volatile acidity', data = wine)
```

Here we see that its quite a downing trend in the volatile acidity as we go higher the quality.

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'citric acid', data = wine)
```

Composition of citric acid go higher as we go higher in the quality of the wine.

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'residual sugar', data = wine)
```

We can see, that hasn't got trend on sugar and quality.

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'chlorides', data = wine)
```

Composition of chloride also go down as we go higher in the quality of the wine

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'free sulfur dioxide', data = wine)
```

We can see, that hasn't got trend on free sulfur dioxide and quality.

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'total sulfur dioxide', data = wine)
```

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'sulphates', data = wine)
```

Sulphates level goes higher with the quality of wine

```python
fig = plt.figure(figsize = (10,6))
sns.barplot(x = 'quality', y = 'alcohol', data = wine)
```

Alcohol level also goes higher as te quality of wine increases

Here is the distribution of expert assessments of wines in the sample:

```python
plt.figure(figsize(8,6))
stat = wine.groupby('quality')['quality'].agg(lambda x : float(len(x)) / wine.shape[0])
stat.plot(kind='bar', fontsize=14, width=0.9, color="red")
plt.xticks(rotation=0)
plt.ylabel('Proportion', fontsize=14)
plt.xlabel('Quality', fontsize=14)
```

We can see, that data is normally distributed.

Let's see heatmap correlation between features.

```python
plt.figure(figsize=(12,6))
sns.heatmap(wine.corr(),annot=True)
```

Interesting, we can now see that acidity and pH level of wine are in inverse proportion. <br>
This result illustrates a fact from a chemisty: as we know, pH = -lg[H+], whehe [H+] in fact represents acidity. So, bigger acidity - lower pH level.

```python
plt.figure(figsize=(10,8))
plt.scatter(wine['fixed acidity'],wine['pH'])
plt.xlabel('Acidity').set_size(20)
plt.ylabel('pH').set_size(20)
```

However, there is no direct connection between total acidity and pH (it is possible to find wines with a high pH for wine and high acidity).In wine tasting, the term “acidity” refers to the fresh, tart and sour attributes of the wine which are evaluated in relation to how well the acidity balances out the sweetness and bitter components of the wine such as tannins.

Acidity in wine is important.

As much as modern health has demonized acidic foods, acidity is an essential trait in wine that’s necessary for quality. Great wines are in balance with their 4 fundamental traits (Acidity, tannin, alcohol and sweetness) and as wines age, the acidity acts as a buffer to preserve the wine longer. For example, Sauternes, a wine with both high acidity and sweetness, is known to age several decades.

### <center> 4. Insights and found dependencies

Summarise previous results, we can see that:
- data is normally disturbuted;
- we can find dependency between volatile acidity/citric acid/chlorides/sulphates/alcohol and quality of wine, we can use that in our model (very good for logistic regression);

### <center> 5. Metrics selection

We can see that the classes are normally balanced. We making a classification task, and we can see, that we got some trends by features, and it's mean, that they can have weights. And it's offers to use MSE — measure of the quality of an estimator — it is always non-negative, and values closer to zero are better.

### <center> 6. Model selection

For our task we will consider the following models:
- **LogisticRegression**. A simple linear model is a good baseline in almost any classification problem. Its linear coefficients will also allow to assess the importance of a particular feature in the dataset, with the help of L1-regularization it will be possible to get rid of linearly dependent features.
- **RandomForest**. A other model, used tree model, good baseline and not easy to interpretation, but in this cases can gives better results, as logistic regression.<br>
Also, we can use xgboost model (or catboost, or other busting gradient method) but I just want to give you baseline classification model. <br>
In the end I'll show some models without tuning parameters (to the future).

### <center> 7. Data preprocessing

Check, how much NaN values in dataset:

```python
wine.info()
```

We can see, that we don't have NaN values (its very good). So, most of preprocessing is over.

### <center> 8. Cross-validation and adjustment of model hyperparameters

```python
# Start Modeling
# Split Training and Testing data (within training data file only)
# Hold out method validation

from sklearn.model_selection import train_test_split

X_train = wine.iloc[:,1:len(wine.columns)-2] # this represents the input Features
Y_train = wine.loc[:,'quality']

# Scaling features (only feature NOT observation)
from sklearn.preprocessing import MinMaxScaler, StandardScaler
# Scaling - brings to range (0 to 1)
ScaleFn = MinMaxScaler()
X_Scale = ScaleFn.fit_transform(X_train)
# Standardise - brings to Zero mean, Unit variance
ScaleFn = StandardScaler()
X_Strd = ScaleFn.fit_transform(X_train)
```

#### Proceed to perform PCA:

```python
from sklearn.decomposition import PCA
pca = PCA()
x_pca = pca.fit_transform(X_Strd)
```

Plot the graph to find the principal components

```python
plt.figure(figsize=(10,10))
plt.plot(np.cumsum(pca.explained_variance_ratio_), 'ro-')
plt.grid()
```

AS per the graph, we can see that 7 principal components attribute for 90% of variation in the data. <br>
We shall pick the first 7 components for our prediction.

```python
pca_new = PCA(n_components=8)
x_new = pca_new.fit_transform(X_Strd)
print(x_new)
```

```python
test_size = .30
seedNo = 11

X_train,X_test,Y_train,Y_test = train_test_split(x_new,Y_train,test_size = test_size, random_state = seedNo)

print("train X", X_train.shape)
print("train Y", Y_train.shape)
print("test X", X_test.shape)
print("test Y", Y_test.shape)

# Choose algorithm and train
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier

from sklearn.model_selection import KFold
from sklearn.model_selection import cross_val_score

mymodel = []
mymodel.append(('LogReg', LogisticRegression()))
mymodel.append(('KNN', KNeighborsClassifier()))
mymodel.append(('DeciTree', DecisionTreeClassifier()))
mymodel.append(('RandForest', RandomForestClassifier()))
mymodel.append(('SVM', SVC()))
mymodel.append(('XGBoost', XGBClassifier()))

All_model_result = []
All_model_name = []
for algoname, algorithm in mymodel:
kfoldFn = KFold(n_splits = 11, random_state = seedNo)
Eval_result = cross_val_score(algorithm, X_train, Y_train, cv = kfoldFn, scoring = 'accuracy')

All_model_result.append(Eval_result)
All_model_name.append(algoname)
print("Modelname and Model accuracy:", algoname, 100*Eval_result.mean(),"%")
```

## Random Forest

Build rf model:

```python
rf = RandomForestRegressor(n_estimators=100, min_samples_leaf=3)
```

```python
rf.fit(X_train, Y_train)
```

Качество выросло ещё сильнее, хотя модель и переобучилась:

```python
sqrt(mean_squared_error(rf.predict(X_train), Y_train))
```

```python
sqrt(mean_squared_error(rf.predict(X_test), Y_test))
```

A true evaluation of wines and their predictions of a random forest:

```python
plt.figure(figsize(16,7))
plt.subplot(121)
pyplot.scatter(Y_train, rf.predict(X_train), color="red", alpha=0.1)
pyplot.xlim(2.5,9.5)
pyplot.ylim(2.5,9.5)
plot(range(11), color='black')
grid()
pyplot.title('Train set', fontsize=20)
pyplot.xlabel('Quality', fontsize=14)
pyplot.ylabel('Estimated quality', fontsize=14)

plt.subplot(122)
pyplot.scatter(Y_test, rf.predict(X_test), color="red", alpha=0.1)
pyplot.xlim(2.5,9.5)
pyplot.ylim(2.5,9.5)
plot(range(11), color='black')
grid()
pyplot.title('Test set', fontsize=20)
pyplot.xlabel('Quality', fontsize=14)
pyplot.ylabel('Estimated quality', fontsize=14)
```

The coefficient of determination for the random forest:

```python
rf.score(X_test, Y_test)
```

### <center> 9. Conclusion

In conclusion, I want to say, that we can:
- use stacking model;
- generate new features;
- find more insights;
- use other metrics and models.<br>

Thank you for listening!
