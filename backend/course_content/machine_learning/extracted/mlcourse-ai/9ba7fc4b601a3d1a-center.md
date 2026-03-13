# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/assignments_demo/assignment08_implement_sgd_regressor.ipynb
Original Path: jupyter_english/assignments_demo/assignment08_implement_sgd_regressor.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg" />

## [mlcourse.ai](https://mlcourse.ai) – Open Machine Learning Course

Author: [Yury Kashnitskiy](https://yorko.github.io). Translated by [Sergey Oreshkov](https://www.linkedin.com/in/sergeoreshkov/). This material is subject to the terms and conditions of the [Creative Commons CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. Free use is permitted for any non-commercial purpose.

# <center> Assignment #8 (demo)

## <center> Implementation of online regressor

**Same assignment as a [Kaggle Kernel](https://www.kaggle.com/kashnitsky/a8-demo-implementing-online-regressor) + [solution](https://www.kaggle.com/kashnitsky/a8-demo-implementing-online-regressor-solution).**

Here we'll implement a regressor trained with stochastic gradient descent (SGD). Fill in the missing code. If you do evething right, you'll pass a simple embedded test.

## <center>Linear regression and Stochastic Gradient Descent

```python
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator
from sklearn.metrics import log_loss, mean_squared_error, roc_auc_score
from sklearn.model_selection import train_test_split
from tqdm import tqdm

%matplotlib inline
import seaborn as sns
from matplotlib import pyplot as plt
from sklearn.preprocessing import StandardScaler
```

Implement class `SGDRegressor`. Specification:
- class is inherited from `sklearn.base.BaseEstimator`
- constructor takes parameters `eta` – gradient step ($10^{-3}$ by default) and `n_epochs` – dataset pass count (3 by default)
- constructor also creates `mse_` and `weights_` lists in order to track mean squared error and weight vector during gradient descent iterations
- Class has `fit` and `predict` methods
- The `fit` method takes matrix `X` and vector `y` (`numpy.array` objects) as parameters, appends column of ones to `X` on the left side, initializes weight vector `w` with **zeros** and then makes `n_epochs` iterations of weight updates (you may refer to this [article](https://medium.com/open-machine-learning-course/open-machine-learning-course-topic-8-vowpal-wabbit-fast-learning-with-gigabytes-of-data-60f750086237) for details), and for every iteration logs mean squared error and weight vector `w` in corresponding lists we created in the constructor.
- Additionally the `fit` method will create `w_` variable to store weights which produce minimal mean squared error
- The `fit` method returns current instance of the `SGDRegressor` class, i.e. `self`
- The `predict` method takes `X` matrix, adds column of ones to the left side and returns prediction vector, using weight vector `w_`, created by the `fit` method.

```python
class SGDRegressor(BaseEstimator):
# you code here
def __init__(self):
pass

def fit(self, X, y):
pass

def predict(self, X):
pass
```

Let's test out the algorithm on height/weight data. We will predict heights (in inches) based on weights (in lbs).

```python
data_demo = pd.read_csv("../../data/weights_heights.csv")
```

```python
plt.scatter(data_demo["Weight"], data_demo["Height"])
plt.xlabel("Weight (lbs)")
plt.ylabel("Height (Inch)")
plt.grid();
```

```python
X, y = data_demo["Weight"].values, data_demo["Height"].values
```

Perform train/test split and scale data.

```python
X_train, X_valid, y_train, y_valid = train_test_split(
X, y, test_size=0.3, random_state=17
)
```

```python
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train.reshape([-1, 1]))
X_valid_scaled = scaler.transform(X_valid.reshape([-1, 1]))
```

Train created `SGDRegressor` with `(X_train_scaled, y_train)` data. Leave default parameter values for now.

```python
# you code here
```

Draw a chart with training process – dependency of mean squared error from the i-th SGD iteration number.

```python
# you code here
```

Print the minimal value of mean squared error and the best weights vector.

```python
# you code here
```

Draw chart of model weights ($w_0$ and $w_1$) behavior during training.

```python
# you code here
```

Make a prediction for hold-out set `(X_valid_scaled, y_valid)` and check MSE value.

```python
# you code here
sgd_holdout_mse = 10
```

Do the same thing for `LinearRegression` class from `sklearn.linear_model`. Evaluate MSE for hold-out set.

```python
# you code here
linreg_holdout_mse = 9
```

```python
try:
assert (sgd_holdout_mse - linreg_holdout_mse) < 1e-4
print("Correct!")
except AssertionError:
print(
"Something's not good.\n Linreg's holdout MSE: {}"
"\n SGD's holdout MSE: {}".format(linreg_holdout_mse, sgd_holdout_mse)
)
```
