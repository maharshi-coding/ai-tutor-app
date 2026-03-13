# Build Classification Models

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/4-Classification/2-Classifiers-1/solution/notebook.ipynb
Original Path: 4-Classification/2-Classifiers-1/solution/notebook.ipynb
Course: Machine Learning

# Build Classification Models

```python
import pandas as pd
cuisines_df = pd.read_csv("../../data/cleaned_cuisines.csv")
cuisines_df.head()
```

Output:
```text
Unnamed: 0 cuisine almond angelica anise anise_seed apple \
0 0 indian 0 0 0 0 0
1 1 indian 1 0 0 0 0
2 2 indian 0 0 0 0 0
3 3 indian 0 0 0 0 0
4 4 indian 0 0 0 0 0

apple_brandy apricot armagnac ... whiskey white_bread white_wine \
0 0 0 0 ... 0 0 0
1 0 0 0 ... 0 0 0
2 0 0 0 ... 0 0 0
3 0 0 0 ... 0 0 0
4 0 0 0 ... 0 0 0

whole_grain_wheat_flour wine wood yam yeast yogurt zucchini
0 0 0 0 0 0 0 0
1 0 0 0 0 0 0 0
2 0 0 0 0 0 0 0
3 0 0 0 0 0 0 0
4 0 0 0 0 0 1 0

[5 rows x 382 columns]
```

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score,precision_score,confusion_matrix,classification_report, precision_recall_curve
from sklearn.svm import SVC
import numpy as np
```

```python
cuisines_label_df = cuisines_df['cuisine']
cuisines_label_df.head()
```

Output:
```text
0 indian
1 indian
2 indian
3 indian
4 indian
Name: cuisine, dtype: object
```

```python
cuisines_feature_df = cuisines_df.drop(['Unnamed: 0', 'cuisine'], axis=1)
cuisines_feature_df.head()
```

Output:
```text
almond angelica anise anise_seed apple apple_brandy apricot \
0 0 0 0 0 0 0 0
1 1 0 0 0 0 0 0
2 0 0 0 0 0 0 0
3 0 0 0 0 0 0 0
4 0 0 0 0 0 0 0

armagnac artemisia artichoke ... whiskey white_bread white_wine \
0 0 0 0 ... 0 0 0
1 0 0 0 ... 0 0 0
2 0 0 0 ... 0 0 0
3 0 0 0 ... 0 0 0
4 0 0 0 ... 0 0 0

whole_grain_wheat_flour wine wood yam yeast yogurt zucchini
0 0 0 0 0 0 0 0
1 0 0 0 0 0 0 0
2 0 0 0 0 0 0 0
3 0 0 0 0 0 0 0
4 0 0 0 0 0 1 0

[5 rows x 380 columns]
```

```python
X_train, X_test, y_train, y_test = train_test_split(cuisines_feature_df, cuisines_label_df, test_size=0.3)
```

```python
lr = LogisticRegression(multi_class='ovr',solver='liblinear')
model = lr.fit(X_train, np.ravel(y_train))

accuracy = model.score(X_test, y_test)
print ("Accuracy is {}".format(accuracy))
```

Output:
```text
Accuracy is 0.8181818181818182
```

```python
# test an item
print(f'ingredients: {X_test.iloc[50][X_test.iloc[50]!=0].keys()}')
print(f'cuisine: {y_test.iloc[50]}')
```

Output:
```text
ingredients: Index(['artemisia', 'black_pepper', 'mushroom', 'shiitake', 'soy_sauce',
'vegetable_oil'],
dtype='object')
cuisine: korean
```

```python
#rehsape to 2d array and transpose
test= X_test.iloc[50].values.reshape(-1, 1).T
# predict with score
proba = model.predict_proba(test)
classes = model.classes_
# create df with classes and scores
resultdf = pd.DataFrame(data=proba, columns=classes)

# create df to show results
topPrediction = resultdf.T.sort_values(by=[0], ascending = [False])
topPrediction.head()
```

Output:
```text
0
korean 0.392231
chinese 0.372872
japanese 0.218825
thai 0.013427
indian 0.002645
```

```python
y_pred = model.predict(X_test)
print(classification_report(y_test,y_pred))
```

Output:
```text
precision recall f1-score support

chinese 0.75 0.73 0.74 223
indian 0.93 0.88 0.90 255
japanese 0.78 0.78 0.78 253
korean 0.87 0.86 0.86 236
thai 0.76 0.84 0.80 232

accuracy 0.82 1199
macro avg 0.82 0.82 0.82 1199
weighted avg 0.82 0.82 0.82 1199
```
