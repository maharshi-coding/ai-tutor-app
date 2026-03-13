# Logistic Regression - Lesson 4

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/2-Regression/4-Logistic/solution/notebook.ipynb
Original Path: 2-Regression/4-Logistic/solution/notebook.ipynb
Course: Machine Learning

## Logistic Regression - Lesson 4

Load up required libraries and dataset. Convert the data to a dataframe containing a subset of the data:

```python
import pandas as pd
import numpy as np

full_pumpkins = pd.read_csv('../../data/US-pumpkins.csv')

full_pumpkins.head()
```

Output:
```text
City Name Type Package Variety Sub Variety Grade Date
0 BALTIMORE NaN 24 inch bins NaN NaN NaN 4/29/17 \
1 BALTIMORE NaN 24 inch bins NaN NaN NaN 5/6/17
2 BALTIMORE NaN 24 inch bins HOWDEN TYPE NaN NaN 9/24/16
3 BALTIMORE NaN 24 inch bins HOWDEN TYPE NaN NaN 9/24/16
4 BALTIMORE NaN 24 inch bins HOWDEN TYPE NaN NaN 11/5/16

Low Price High Price Mostly Low ... Unit of Sale Quality Condition
0 270.0 280.0 270.0 ... NaN NaN NaN \
1 270.0 280.0 270.0 ... NaN NaN NaN
2 160.0 160.0 160.0 ... NaN NaN NaN
3 160.0 160.0 160.0 ... NaN NaN NaN
4 90.0 100.0 90.0 ... NaN NaN NaN

Appearance Storage Crop Repack Trans Mode Unnamed: 24 Unnamed: 25
0 NaN NaN NaN E NaN NaN NaN
1 NaN NaN NaN E NaN NaN NaN
2 NaN NaN NaN N NaN NaN NaN
3 NaN NaN NaN N NaN NaN NaN
4 NaN NaN NaN N NaN NaN NaN

[5 rows x 26 columns]
```

```python
# Select the columns we want to use
columns_to_select = ['City Name','Package','Variety', 'Origin','Item Size', 'Color']
pumpkins = full_pumpkins.loc[:, columns_to_select]

# Drop rows with missing values
pumpkins.dropna(inplace=True)

pumpkins.head()
```

Output:
```text
City Name Package Variety Origin Item Size Color
2 BALTIMORE 24 inch bins HOWDEN TYPE DELAWARE med ORANGE
3 BALTIMORE 24 inch bins HOWDEN TYPE VIRGINIA med ORANGE
4 BALTIMORE 24 inch bins HOWDEN TYPE MARYLAND lge ORANGE
5 BALTIMORE 24 inch bins HOWDEN TYPE MARYLAND lge ORANGE
6 BALTIMORE 36 inch bins HOWDEN TYPE MARYLAND med ORANGE
```

# Let's have a look to our data!

By visualising it with Seaborn

```python
import seaborn as sns
# Specify colors for each values of the hue variable
palette = {
'ORANGE': 'orange',
'WHITE': 'wheat',
}
# Plot a bar plot to visualize how many pumpkins of each variety are orange or white
sns.catplot(
data=pumpkins, y="Variety", hue="Color", kind="count",
palette=palette,
)
```

Output:
```text
<seaborn.axisgrid.FacetGrid at 0x7f8c56d0c650>

<Figure size 609.375x500 with 1 Axes>
```

# Data pre-processing

Let's encode features and labels to better plot the data and train the model

```python
# Let's look at the different values of the 'Item Size' column
pumpkins['Item Size'].unique()
```

Output:
```text
array(['med', 'lge', 'sml', 'xlge', 'med-lge', 'jbo', 'exjbo'],
dtype=object)
```

```python
from sklearn.preprocessing import OrdinalEncoder
# Encode the 'Item Size' column using ordinal encoding
item_size_categories = [['sml', 'med', 'med-lge', 'lge', 'xlge', 'jbo', 'exjbo']]
ordinal_features = ['Item Size']
ordinal_encoder = OrdinalEncoder(categories=item_size_categories)
```

```python
from sklearn.preprocessing import OneHotEncoder
# Encode all the other features using one-hot encoding
categorical_features = ['City Name', 'Package', 'Variety', 'Origin']
categorical_encoder = OneHotEncoder(sparse_output=False)
```

```python
from sklearn.compose import ColumnTransformer
ct = ColumnTransformer(transformers=[
('ord', ordinal_encoder, ordinal_features),
('cat', categorical_encoder, categorical_features)
])
# Get the encoded features as a pandas DataFrame
ct.set_output(transform='pandas')
encoded_features = ct.fit_transform(pumpkins)
encoded_features.head()
```

Output:
```text
ord__Item Size cat__City Name_ATLANTA cat__City Name_BALTIMORE
2 1.0 0.0 1.0 \
3 1.0 0.0 1.0
4 3.0 0.0 1.0
5 3.0 0.0 1.0
6 1.0 0.0 1.0

cat__City Name_BOSTON cat__City Name_CHICAGO cat__City Name_COLUMBIA
2 0.0 0.0 0.0 \
3 0.0 0.0 0.0
4 0.0 0.0 0.0
5 0.0 0.0 0.0
6 0.0 0.0 0.0

cat__City Name_DALLAS cat__City Name_DETROIT cat__City Name_LOS ANGELES
2 0.0 0.0 0.0 \
3 0.0 0.0 0.0
4 0.0 0.0 0.0
5 0.0 0.0 0.0
6 0.0 0.0 0.0

cat__City Name_MIAMI ... cat__Origin_MICHIGAN cat__Origin_NEW JERSEY
2 0.0 ... 0.0 0.0 \
3 0.0 ... 0.0 0.0
```

```python
from sklearn.preprocessing import LabelEncoder
# Encode the 'Color' column using label encoding
label_encoder = LabelEncoder()
encoded_label = label_encoder.fit_transform(pumpkins['Color'])
encoded_pumpkins = encoded_features.assign(Color=encoded_label)
encoded_pumpkins.head()
```

Output:
```text
ord__Item Size cat__City Name_ATLANTA cat__City Name_BALTIMORE
2 1.0 0.0 1.0 \
3 1.0 0.0 1.0
4 3.0 0.0 1.0
5 3.0 0.0 1.0
6 1.0 0.0 1.0

cat__City Name_BOSTON cat__City Name_CHICAGO cat__City Name_COLUMBIA
2 0.0 0.0 0.0 \
3 0.0 0.0 0.0
4 0.0 0.0 0.0
5 0.0 0.0 0.0
6 0.0 0.0 0.0

cat__City Name_DALLAS cat__City Name_DETROIT cat__City Name_LOS ANGELES
2 0.0 0.0 0.0 \
3 0.0 0.0 0.0
4 0.0 0.0 0.0
5 0.0 0.0 0.0
6 0.0 0.0 0.0

cat__City Name_MIAMI ... cat__Origin_NEW JERSEY cat__Origin_NEW YORK
2 0.0 ... 0.0 0.0 \
3 0.0 ... 0.0 0.0
```

```python
# Let's look at the mapping between the encoded values and the original values
list(label_encoder.inverse_transform([0, 1]))
```

Output:
```text
['ORANGE', 'WHITE']
```

# Analysing relationships between features and label

```python
palette = {
'ORANGE': 'orange',
'WHITE': 'wheat',
}
# We need the encoded Item Size column to use it as the x-axis values in the plot
pumpkins['Item Size'] = encoded_pumpkins['ord__Item Size']

g = sns.catplot(
data=pumpkins,
x="Item Size", y="Color", row='Variety',
kind="box", orient="h",
sharex=False, margin_titles=True,
height=1.8, aspect=4, palette=palette,
)
# Defining axis labels
g.set(xlabel="Item Size", ylabel="").set(xlim=(0,6))
g.set_titles(row_template="{row_name}")
```

Output:
```text
<seaborn.axisgrid.FacetGrid at 0x7f8c56322210>

<Figure size 720x1620 with 9 Axes>
```

Let's now focus on a specific relationship: Item Size and Color!

```python
import warnings
warnings.filterwarnings(action='ignore', category=UserWarning, module='seaborn')
```

```python
# Suppressing warning message claiming that a portion of points cannot be placed into the plot due to the high number of data points
import warnings
warnings.filterwarnings(action='ignore', category=UserWarning, module='seaborn')

palette = {
0: 'orange',
1: 'wheat'
}
sns.swarmplot(x="Color", y="ord__Item Size", hue="Color", data=encoded_pumpkins, palette=palette)
```

Output:
```text
<Axes: xlabel='Color', ylabel='ord__Item Size'>

<Figure size 640x480 with 1 Axes>
```

**Watch out**: Ignoring warnings is NOT a best practice and should be avoid, whenever possible. Warnings often contain useful messages that let us improve our code and solve an issue.
The reason why we are ignoring this specific warning is to guarantee the readability of the plot. Plotting all the data points with a reduced marker size, while keeping consistency with the palette color, generates an unclear visualization.

# Build your model

```python
from sklearn.model_selection import train_test_split
# X is the encoded features
X = encoded_pumpkins[encoded_pumpkins.columns.difference(['Color'])]
# y is the encoded label
y = encoded_pumpkins['Color']

# Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
```

```python
from sklearn.metrics import f1_score, classification_report
from sklearn.linear_model import LogisticRegression

# Train a logistic regression model on the pumpkin dataset
model = LogisticRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)

# Evaluate the model and print the results
print(classification_report(y_test, predictions))
print('Predicted labels: ', predictions)
print('F1-score: ', f1_score(y_test, predictions))
```

Output:
```text
precision recall f1-score support

0 0.94 0.98 0.96 166
1 0.85 0.67 0.75 33

accuracy 0.92 199
macro avg 0.89 0.82 0.85 199
weighted avg 0.92 0.92 0.92 199

Predicted labels: [0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 0
0 0 0 0 0 1 0 1 0 0 1 0 0 0 0 0 1 0 1 0 1 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0
1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 1 0 0 0 0 0 0 0 1 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0 0 0 1 1 0
0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1
0 0 0 1 0 0 0 0 0 0 0 0 1 1]
F1-score: 0.7457627118644068
```

```python
from sklearn.metrics import confusion_matrix
confusion_matrix(y_test, predictions)
```

Output:
```text
array([[162, 4],
[ 11, 22]])
```

```python
from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib
import matplotlib.pyplot as plt
%matplotlib inline

y_scores = model.predict_proba(X_test)
# calculate ROC curve
fpr, tpr, thresholds = roc_curve(y_test, y_scores[:,1])

# plot ROC curve
fig = plt.figure(figsize=(6, 6))
# Plot the diagonal 50% line
plt.plot([0, 1], [0, 1], 'k--')
# Plot the FPR and TPR achieved by our model
plt.plot(fpr, tpr)
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.show()
```

Output:
```text
<Figure size 600x600 with 1 Axes>
```

```python
# Calculate AUC score
auc = roc_auc_score(y_test,y_scores[:,1])
print(auc)
```

Output:
```text
0.9749908725812341
```
