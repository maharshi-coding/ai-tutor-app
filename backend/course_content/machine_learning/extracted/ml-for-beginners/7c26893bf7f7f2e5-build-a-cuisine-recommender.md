# Build a cuisine recommender

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/4-Classification/4-Applied/solution/notebook.ipynb
Original Path: 4-Classification/4-Applied/solution/notebook.ipynb
Course: Machine Learning

# Build a cuisine recommender

```python
!pip install skl2onnx
```

Output:
```text
Requirement already satisfied: skl2onnx in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (1.8.0)
Requirement already satisfied: protobuf in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from skl2onnx) (3.8.0)
Requirement already satisfied: numpy>=1.15 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from skl2onnx) (1.19.2)
Requirement already satisfied: onnx>=1.2.1 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from skl2onnx) (1.9.0)
Requirement already satisfied: six in /Users/jenlooper/Library/Python/3.7/lib/python/site-packages (from skl2onnx) (1.12.0)
Requirement already satisfied: onnxconverter-common<1.9,>=1.6.1 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from skl2onnx) (1.8.1)
Requirement already satisfied: scikit-learn>=0.19 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from skl2onnx) (0.24.2)
Requirement already satisfied: scipy>=1.0 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from skl2onnx) (1.4.1)
Requirement already satisfied: setuptools in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from protobuf->skl2onnx) (45.1.0)
Requirement already satisfied: typing-extensions>=3.6.2.1 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from onnx>=1.2.1->skl2onnx) (3.10.0.0)
Requirement already satisfied: threadpoolctl>=2.0.0 in /Library/Frameworks/Python.framework/Vers
```

```python
import pandas as pd
```

```python
data = pd.read_csv('../../data/cleaned_cuisines.csv')
data.head()
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
X = data.iloc[:,2:]
X.head()
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
y = data[['cuisine']]
y.head()
```

Output:
```text
cuisine
0 indian
1 indian
2 indian
3 indian
4 indian
```

```python
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score,precision_score,confusion_matrix,classification_report
```

```python
X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.3)
```

```python
model = SVC(kernel='linear', C=10, probability=True,random_state=0)
model.fit(X_train,y_train.values.ravel())
```

Output:
```text
SVC(C=10, kernel='linear', probability=True, random_state=0)
```

```python
y_pred = model.predict(X_test)
```

```python
print(classification_report(y_test,y_pred))
```

Output:
```text
precision recall f1-score support

chinese 0.72 0.70 0.71 236
indian 0.91 0.88 0.89 243
japanese 0.80 0.75 0.77 240
korean 0.80 0.81 0.81 230
thai 0.76 0.85 0.80 250

accuracy 0.80 1199
macro avg 0.80 0.80 0.80 1199
weighted avg 0.80 0.80 0.80 1199
```

```python
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

initial_type = [('float_input', FloatTensorType([None, 380]))]
options = {id(model): {'nocl': True, 'zipmap': False}}
onx = convert_sklearn(model, initial_types=initial_type, options=options)
with open("./model.onnx", "wb") as f:
f.write(onx.SerializeToString())
```
