# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/assignments_demo/assignment06_regression_wine_solution.ipynb
Original Path: jupyter_english/assignments_demo/assignment06_regression_wine_solution.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg">

## [mlcourse.ai](https://mlcourse.ai) - Open Machine Learning Course

Author: [Yury Kashnitsky](https://www.linkedin.com/in/festline/). All content is distributed under the [Creative Commons CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license.

# <center> Assignment #6 (demo). Solution
## <center> Exploring OLS, Lasso and Random Forest in a regression task

**Same assignment as a [Kaggle Kernel](https://www.kaggle.com/kashnitsky/a6-demo-linear-models-and-rf-for-regression) + [solution](https://www.kaggle.com/kashnitsky/a6-demo-regression-solution).**

<img src='../../img/wine_quality.jpg' width=30%>

**Fill in the missing code and choose answers in [this](https://docs.google.com/forms/d/1aHyK58W6oQmNaqEfvpLTpo6Cb0-ntnvJ18rZcvclkvw/edit) web form.**

```python
import warnings

warnings.filterwarnings("ignore")
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Lasso, LassoCV, LinearRegression
from sklearn.metrics.regression import mean_squared_error
from sklearn.model_selection import (GridSearchCV, cross_val_score,
train_test_split)
from sklearn.preprocessing import StandardScaler
```

**We are working with UCI Wine quality dataset (no need to download it – it's already there, in course repo and in Kaggle Dataset).**

```python
data = pd.read_csv("../../data/winequality-white.csv", sep=";")
```

```python
data.head()
```

```python
data.info()
```

**Separate the target feature, split data in 7:3 proportion (30% form a holdout set, use random_state=17), and preprocess data with `StandardScaler`.**

```python
y = data["quality"]
X = data.drop("quality", axis=1)

X_train, X_holdout, y_train, y_holdout = train_test_split(
X, y, test_size=0.3, random_state=17
)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_holdout_scaled = scaler.transform(X_holdout)
```

## Linear regression

**Train a simple linear regression model (Ordinary Least Squares).**

```python
linreg = LinearRegression()
linreg.fit(X_train_scaled, y_train);
```

**<font color='red'>Question 1:</font> What are mean squared errors of model predictions on train and holdout sets?**

```python
print(
"Mean squared error (train): %.3f"
% mean_squared_error(y_train, linreg.predict(X_train_scaled))
)
print(
"Mean squared error (test): %.3f"
% mean_squared_error(y_holdout, linreg.predict(X_holdout_scaled))
)
```

**Sort features by their influence on the target feature (wine quality). Beware that both large positive and large negative coefficients mean large influence on target. It's handy to use `pandas.DataFrame` here.**

**<font color='red'>Question 2:</font> Which feature this linear regression model treats as the most influential on wine quality?**

```python
linreg_coef = pd.DataFrame(
{"coef": linreg.coef_, "coef_abs": np.abs(linreg.coef_)},
index=data.columns.drop("quality"),
)
linreg_coef.sort_values(by="coef_abs", ascending=False)
```

## Lasso regression

**Train a LASSO model with $\alpha = 0.01$ (weak regularization) and scaled data. Again, set random_state=17.**

```python
lasso1 = Lasso(alpha=0.01, random_state=17)
lasso1.fit(X_train_scaled, y_train)
```

**Which feature is the least informative in predicting wine quality, according to this LASSO model?**

```python
lasso1_coef = pd.DataFrame(
{"coef": lasso1.coef_, "coef_abs": np.abs(lasso1.coef_)},
index=data.columns.drop("quality"),
)
lasso1_coef.sort_values(by="coef_abs", ascending=False)
```

**Train LassoCV with random_state=17 to choose the best value of $\alpha$ in 5-fold cross-validation.**

```python
alphas = np.logspace(-6, 2, 200)
lasso_cv = LassoCV(random_state=17, cv=5, alphas=alphas)
lasso_cv.fit(X_train_scaled, y_train)
```

```python
lasso_cv.alpha_
```

**<font color='red'>Question 3:</font> Which feature is the least informative in predicting wine quality, according to the tuned LASSO model?**

```python
lasso_cv_coef = pd.DataFrame(
{"coef": lasso_cv.coef_, "coef_abs": np.abs(lasso_cv.coef_)},
index=data.columns.drop("quality"),
)
lasso_cv_coef.sort_values(by="coef_abs", ascending=False)
```

**<font color='red'>Question 4:</font> What are mean squared errors of tuned LASSO predictions on train and holdout sets?**

```python
print(
"Mean squared error (train): %.3f"
% mean_squared_error(y_train, lasso_cv.predict(X_train_scaled))
)
print(
"Mean squared error (test): %.3f"
% mean_squared_error(y_holdout, lasso_cv.predict(X_holdout_scaled))
)
```

## Random Forest

**Train a Random Forest with out-of-the-box parameters, setting only random_state to be 17.**

```python
forest = RandomForestRegressor(random_state=17)
forest.fit(X_train_scaled, y_train)
```

**<font color='red'>Question 5:</font> What are mean squared errors of RF model on the training set, in cross-validation (cross_val_score with scoring='neg_mean_squared_error' and other arguments left with default values) and on holdout set?**

```python
print(
"Mean squared error (train): %.3f"
% mean_squared_error(y_train, forest.predict(X_train_scaled))
)
print(
"Mean squared error (cv): %.3f"
% np.mean(
np.abs(
cross_val_score(
forest, X_train_scaled, y_train, scoring="neg_mean_squared_error"
)
print(
"Mean squared error (test): %.3f"
% mean_squared_error(y_holdout, forest.predict(X_holdout_scaled))
)
```

**Tune the `max_features` and `max_depth` hyperparameters with GridSearchCV and again check mean cross-validation MSE and MSE on holdout set.**

```python
forest_params = {"max_depth": list(range(10, 25)), "max_features": list(range(6, 12))}

locally_best_forest = GridSearchCV(
RandomForestRegressor(n_jobs=-1, random_state=17),
forest_params,
scoring="neg_mean_squared_error",
n_jobs=-1,
cv=5,
verbose=True,
)
locally_best_forest.fit(X_train_scaled, y_train)
```

```python
locally_best_forest.best_params_, locally_best_forest.best_score_
```

**<font color='red'>Question 6:</font> What are mean squared errors of tuned RF model in cross-validation (cross_val_score with scoring='neg_mean_squared_error' and other arguments left with default values) and on holdout set?**

```python
print(
"Mean squared error (cv): %.3f"
% np.mean(
np.abs(
cross_val_score(
locally_best_forest.best_estimator_,
X_train_scaled,
y_train,
scoring="neg_mean_squared_error",
)
print(
"Mean squared error (test): %.3f"
% mean_squared_error(y_holdout, locally_best_forest.predict(X_holdout_scaled))
)
```

**Output RF's feature importance. Again, it's nice to present it as a DataFrame.**<br>
**<font color='red'>Question 7:</font> What is the most important feature, according to the Random Forest model?**

```python
rf_importance = pd.DataFrame(
locally_best_forest.best_estimator_.feature_importances_,
columns=["coef"],
index=data.columns[:-1],
)
rf_importance.sort_values(by="coef", ascending=False)
```

**Make conclusions about the performance of the explored 3 models in this particular prediction task.**

The depency of wine quality on other features in hand is, presumable, non-linear. So Random Forest works better in this task.
