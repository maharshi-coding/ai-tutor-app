# Predicting Stock Prices

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/stock_prices_abhiklha.ipynb
Original Path: jupyter_english/projects_indiv/stock_prices_abhiklha.ipynb
Course: Machine Learning

# Predicting Stock Prices

This project is taken up to demonstrate Machine Learning's ability to predict one of the most challenging problems in financial world - "to predict the unpredictable" - predict the stock price.

In this project, I have used only those techniques which we have studied in Topic 9 of the course with regards to Time Series analysis.

For a use case to show the predictive power of very simple algorithms such as Lasso AND Ridge regressions, I have downloaded the data for a very famous stock in India - **"TATA MOTORS"**.

The link to this data is mentioned here -

https://in.finance.yahoo.com/quote/TATAMOTORS.NS/history?period1=662754600&period2=1544985000&interval=1d&filter=history&frequency=1d

There are few important characteristics which I would like to outline here:

1. We have around 17 years of information (from 02 Jan 1991 till 14 Dec 2018)

2. There are two types of prices given in the data:

a. Closing Prices which do not take into account of any corporate actions in the prices such as declaration of dividends or split of shares effect.

b. Adjusted Closing Prices which do take care of effect of Dividend payments and stock split. [**This will be our target variable**]

3. There are other information available as well in the data which may not be useful for our analysis point of view.

So, let's dive in.

First we will download all basic libraries into Pythnon

## Loading Libraries and Data

```python
import pandas as pd
import numpy as np
from fbprophet import Prophet
import matplotlib.pyplot as plt
%matplotlib inline

#setting figure size
from matplotlib.pyplot import rcParams
rcParams['figure.figsize'] = 20,10

#for normalizing data
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler(feature_range=(0, 1))

import warnings
warnings.filterwarnings('ignore')
```

```python
# loading basic ML algoriths
from sklearn.linear_model import LinearRegression, RidgeCV, LassoCV
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import TimeSeriesSplit, cross_val_score

# few powerful algorithms as well which we will see later dont perform well compared to basic algorithms
import xgboost
import lightgbm
```

```python
# load the downloaded data
import os
os.chdir('C:\\Users\\Abhik\\mlcourse.ai\\mlcourse.ai-master\\data')
```

```python
# load the data into pandas dataframe
df = pd.read_csv('TATAMOTORS.NS.csv')
df.head()
```

```python
# since there are few NaN values, we should remove these first
df.dropna(axis=0, inplace=True)
```

```python
# Lets check the data once again
df.head(6)
```

```python
# We now need to convert the Dates into Pandas Date format
df['Date'] = pd.to_datetime(df.Date,format='%Y-%m-%d')
df.index = df['Date']
```

```python
# Better to check the data once again
df.head()
```

## EDA and Feature Engineering

```python
# Plot the Graph for Adjusted Closing Price

from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
import plotly
import plotly.graph_objs as go

init_notebook_mode(connected=True)
```

```python
trace1 = go.Scatter(
x=df.Date,
y=df['Adj Close'],
name='Closing Price'
)
data = [trace1]
layout = {'title': 'Adjusted Closing Price'}
fig = go.Figure(data=data, layout=layout)
iplot(fig, show_link=False)
```

```python
# Shape of the Data
df.shape
```

```python
# Lets create a new dataset in which we will only store the required inputs.

#setting index as date values
df['Date'] = pd.to_datetime(df.Date,format='%Y-%m-%d')
df.index = df['Date']

#sorting
data = df.sort_index(ascending=True, axis=0)

#creating a separate dataset
new_data = pd.DataFrame(index=range(0,len(df)),columns=['Date', 'Close'])

for i in range(0,len(data)):
new_data['Date'][i] = data['Date'][i]
new_data['Close'][i] = data['Adj Close'][i]
```

```python
# Lets check the Data once again
new_data.head()
```

```python
# We will create a number of features on the Dates

new_data['year'] = new_data['Date'].map(lambda x : x.year)
new_data['month'] = new_data['Date'].map(lambda x : x.month)
new_data['day_week'] = new_data['Date'].map(lambda x : x.dayofweek)
new_data['quarter'] = new_data['Date'].map(lambda x : x.quarter)
new_data['week'] = new_data['Date'].map(lambda x : x.week)
new_data['quarter_start'] = new_data['Date'].map(lambda x : x.is_quarter_start)
new_data['quarter_end'] = new_data['Date'].map(lambda x : x.is_quarter_end)
new_data['month_start'] = new_data['Date'].map(lambda x : x.is_month_start)
new_data['month_end'] = new_data['Date'].map(lambda x : x.is_month_end)
new_data['year_start'] = new_data['Date'].map(lambda x : x.is_year_start)
new_data['year_end'] = new_data['Date'].map(lambda x : x.is_year_end)
new_data['week_year'] = new_data['Date'].map(lambda x : x.weekofyear)
new_data['quarter_start'] = new_data['quarter_start'].map(lambda x: 0 if x is False else 1)
new_data['quarter_end'] = new_data['quarter_end'].map(lambda x: 0 if x is False else 1)
new_data['month_start'] = new_data['month_start'].map(lambda x: 0 if x is False else 1)
new_data['month_end'] = new_data['month_end'].map(lambda x: 0 if x is False else 1)
new_data['year_start'] = new_data['year_start'].map(lambda x: 0 if x is False else 1)
new_data['year_end'] = new_data['year_end'].map(lambda x: 0 if x is False else 1)
new_data['day_month'] = new_data['Date'].map(lambda x: x.daysinmonth)

# Create a feature which could be important - Markets are only open between Monday and Friday.
mon_fri_list = [0,4]
new_data['mon_fri'] = new_data['day_week'].map(lambda x: 1 if x in mon_fri_list else 0)
```

```python
# Re-indexing the data
new_data.index = new_data['Date']
new_data.drop('Date', inplace=True, axis=1)
new_data.head(2)
```

Lags are very important features which need to be created for any time-series prediction as it will define the auto-correlation effect between past observations.

Here we have taken the lag period of 1 to 22 days (since the market opens for around 22 days in a month)

```python
for i in range(1, 22):
new_data["lag_{}".format(i)] = new_data.Close.shift(i)
```

```python
new_data.head(3)
```

```python
# Lets create dummies for categorical features

cols = ['year', 'month', 'day_week', 'quarter', 'week',
'quarter_start', 'quarter_end', 'week_year', 'mon_fri', 'year_start', 'year_end',
'month_start', 'month_end', 'day_month']

for i in cols:
new_data = pd.concat([new_data.drop([i], axis=1),
pd.get_dummies(new_data[i], prefix=i)
], axis=1)
```

```python
# Droping NAs if any and re-indexing again

new_data = new_data.dropna()
new_data = new_data.reset_index(drop=True)
```

```python
new_data.head()
```

```python
new_data.info()
```

```python
# Target Variable
y = new_data.Close.values
y
```

## Splitting the Data into Train-Test

```python
# Creating splitting index

test_index = int(len(new_data) * (1 - 0.30))
test_index
```

Since we dont want to look into immediate future, we are creating a window of 2 days. This means, training data will stop at day x-1 and test data will start at x+1.

```python
# splitting whole dataset on train and test

X_train = new_data.loc[:test_index-1].drop(['Close'], axis=1)
y_train = new_data.loc[:test_index-1]["Close"]
X_test = new_data.loc[test_index+1:].drop(["Close"], axis=1)
y_test = new_data.loc[test_index+1:]["Close"]
```

```python
# Lets visualize the train and test data together
plt.figure(figsize=(16,8))
plt.plot(y_train)
plt.plot(y_test)
```

```python
# Scaling the Data

from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

## Machine Learning implementations

```python
# First we will use the simplest of them all - Linear Regression

from sklearn.linear_model import LinearRegression, LassoCV, RidgeCV, Lasso, Ridge
lr = LinearRegression()
lr.fit(X_train_scaled, y_train)
```

For Cross Validation (CV) on Time Series data, we will use **TimeSeries Split** for CV.

Let's see Mean Absolute Error for our simplest model

```python
from sklearn.model_selection import TimeSeriesSplit
from sklearn.model_selection import cross_val_score
tscv = TimeSeriesSplit(n_splits=5)
cv = cross_val_score(lr, X_train_scaled, y_train, scoring = 'neg_mean_absolute_error', cv=tscv)
mae = cv.mean()*(-1)
mae
```

Oh Gosh!! Linear Regression failed miserably to predict the pattern. Lets try regularized linear models.

But before that, we will use the plotting module written in Topic 9 of the course to plot some nice graphs

```python
def plotModelResults(model, df_train, df_test, y_train, y_test, plot_intervals=False, plot_anomalies=False, scale=1.96, cv=tscv):
"""
Plots modelled vs fact values

model: fitted model

df_train, df_test: splitted featuresets

y_train, y_test: targets

plot_intervals: bool, if True, plot prediction intervals

scale: float, sets the width of the intervals

cv: cross validation method, needed for intervals

"""
# making predictions for test
prediction = model.predict(df_test)

plt.figure(figsize=(20, 7))
plt.plot(prediction, "g", label="prediction", linewidth=2.0)
plt.plot(y_test.values, label="actual", linewidth=2.0)

if plot_intervals:
# calculate cv scores
cv = cross_val_score(
model,
df_train,
y_train,
cv=cv,
scoring="neg_mean_squared_error"
)

# calculate cv error deviation
deviation = np.sqrt(cv.std())

# calculate lower and upper intervals
lower = prediction - (scale * deviation)
upper = prediction + (scale * deviation)

plt.plot(lower, "r--", label="upper bond / lower bond", alpha=0.5)
plt.plot(upper, "r--", alpha=0.5)

if plot_anomalies:
anomalies = np.array([np.NaN]*len(y_test))
anomalies[y_test<lower] = y_test[y_test<lower]
anomalies[y_test>upper] = y_test[y_test>upper]
plt.plot(anomalies, "o", markersize=10, label = "Anomalies")

# calculate overall quality on test set
mae = mean_absolute_error(prediction, y_test)
mape = mean_absolute_percentage_error(prediction, y_test)
plt.title("MAE {}, MAPE {}%".format(round(mae), round(mape, 2)))
plt.legend(loc="best")
plt.grid(True);
```

Another plotting module for Coefficients

```python
def getCoefficients(model):
"""Returns sorted coefficient values of the model"""
coefs = pd.DataFrame(model.coef_, X_train.columns)
coefs.columns = ["coef"]
coefs["abs"] = coefs.coef.apply(np.abs)
return coefs.sort_values(by="abs", ascending=False).drop(["abs"], axis=1)

def plotCoefficients(model):
"""Plots sorted coefficient values of the model"""
coefs = getCoefficients(model)

plt.figure(figsize=(20, 7))
coefs.coef.plot(kind='bar')
plt.grid(True, axis='y')
plt.hlines(y=0, xmin=0, xmax=len(coefs), linestyles='dashed')
plt.show()
```

We will define a loss metric - namely - *Mean Absolute Percentage Error* which calculated Mean Absolute Error in percentage

```python
def mean_absolute_percentage_error(y_true, y_pred):
return np.mean(np.abs((y_true - y_pred) / y_true)) * 100
```

Let's see the plot for Linear Regression

```python
plotModelResults(lr, X_train_scaled, X_test_scaled, y_train, y_test, plot_intervals=True, plot_anomalies=True)
```

This plot does not tell us much apart from the fact that our model has faired poorly in predicting the pattern.

Lets see the plot for coefficients

```python
plotCoefficients(lr)
```

Lets see the correlation matrix and Heat Map for the features

```python
import seaborn as sns
plt.figure(figsize=(15,10))
sns.heatmap(X_train.corr())
```

Not much information can be derived from this Heat Map - only crucial information is prices in few years are completely uncorrelated.

Lets create our next model - Lasso Regression

```python
lasso = LassoCV(cv =tscv, max_iter=10000)
lasso.fit(X_train_scaled, y_train)
```

```python
plotModelResults(lasso,
X_train_scaled,
X_test_scaled,
y_train,
y_test,
plot_intervals=True, plot_anomalies=True)
plotCoefficients(lasso)
```

```python
coef = getCoefficients(lasso)
np.count_nonzero(np.where(coef['coef']==0.000000))
```

Oh wow!

Around 181 features were of no value which are elimiated by the Lasso Regression

Let's see important features (Top10)

```python
coef.sort_values(by='coef', ascending=False).head(10)
```

It turns out that **Lag 1** is the most important feature

Lets see how close our predicted values are compared to actual values

```python
from sklearn.linear_model import Lasso
lasso = Lasso(max_iter=10000, random_state=17)

lasso.fit(X_train_scaled, y_train)
y_pred = lasso.predict(X_test_scaled)

columns = ['Close_actual', 'Close_pred']
df_pred_lasso = pd.DataFrame(columns = columns)

df_pred_lasso.Close_actual = y_test
df_pred_lasso.Close_pred = y_pred
```

```python
plt.figure(figsize=(15,8))
plt.plot(df_pred_lasso)
plt.plot(df_pred_lasso.Close_pred, "b--", label="prediction", linewidth=1.0)
plt.plot(df_pred_lasso.Close_actual, "r--", label="actual", linewidth=1)
plt.legend(loc="best")
```

```python
df_pred_lasso['diff'] = df_pred_lasso.Close_actual - df_pred_lasso.Close_pred
df_pred_lasso['perc_diff'] = ((df_pred_lasso['diff']) / (df_pred_lasso['Close_pred']))

df_pred_lasso.head(20)
```

Amazing!!

Lasso Regression has done a very nice job in predicting the adjusted closing price of this stock

We can also run PCA to eliminate more features and noises from the data

```python
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline

def plotPCA(pca):
"""
Plots accumulated percentage of explained variance by component

pca: fitted PCA object
"""
components = range(1, pca.n_components_ + 1)
variance = np.cumsum(np.round(pca.explained_variance_ratio_, decimals=4)*100)
plt.figure(figsize=(20, 10))
plt.bar(components, variance)

# additionally mark the level of 95% of explained variance
plt.hlines(y = 95, xmin=0, xmax=len(components), linestyles='dashed', colors='red')

plt.xlabel('PCA components')
plt.ylabel('variance')
plt.xticks(components)
plt.show()
```

```python
# Create PCA object: pca
pca = PCA()

# Train PCA on scaled data
pca = pca.fit(X_train_scaled)

# plot explained variance
plotPCA(pca)
```

```python
pca_comp = PCA(0.95).fit(X_train_scaled)
print('We need %d components to explain 95%% of variance'
% pca_comp.n_components_)
```

PCA needs only 73 components to explain the variance.

Lets fit and transform train and test data with these components

```python
pca = PCA(n_components=pca_comp.n_components).fit(X_train_scaled)

pca_features_train = pca.transform(X_train_scaled)
pca_features_test = pca.transform(X_test_scaled)
```

Lets run the Linear Regression model once again to see if there are any improvements since last time

```python
lr.fit(pca_features_train, y_train)
```

```python
plotModelResults(lr, pca_features_train, pca_features_test, y_train, y_test, plot_intervals=True, plot_anomalies=True)
```

Super!

PCA has resulted into an improvement in the linear regression model

Lets run another model - Ridge Regression and see how does it fare

```python
from sklearn.linear_model import Ridge
ridge = Ridge(max_iter=10000, random_state=17)

ridge.fit(X_train_scaled, y_train)
y_pred = ridge.predict(X_test_scaled)

columns = ['Close_actual', 'Close_pred']
df_pred_ridge = pd.DataFrame(columns = columns)

df_pred_ridge.Close_actual = y_test
df_pred_ridge.Close_pred = y_pred
```

```python
plt.figure(figsize=(15,8))
plt.plot(df_pred_ridge)
plt.plot(df_pred_ridge.Close_pred, "b--", label="prediction", linewidth=1.0)
plt.plot(df_pred_ridge.Close_actual, "r--", label="actual", linewidth=1.0)
plt.legend(loc="best")
```

```python
df_pred_ridge['diff'] = df_pred_ridge.Close_actual - df_pred_ridge.Close_pred
df_pred_ridge['perc_diff'] = ((df_pred_ridge['diff']) / (df_pred_ridge['Close_pred']))*100
df_pred_ridge.head(20)
```

Not Bad at all!

Lasso and Ridge turned out to quite close and already are superstars

Lets see the plots for Ridge

```python
from sklearn.linear_model import RidgeCV
ridge = RidgeCV(cv=tscv)
ridge.fit(X_train_scaled, y_train)

plotModelResults(ridge, X_train_scaled, X_test_scaled, y_train, y_test, plot_intervals=True, plot_anomalies=True)
plotCoefficients(ridge)
```

Now Lets see how Lasso and Ridge are performing on PCA transformed data

```python
from sklearn.linear_model import Lasso
Lasso = Lasso(max_iter=10000)
Lasso.fit(pca_features_train, y_train)

from sklearn.linear_model import Ridge
ridge = Ridge(max_iter=10000, random_state=17)
ridge.fit(pca_features_train, y_train)
```

```python
plotModelResults(Lasso, pca_features_train, pca_features_test, y_train, y_test, plot_intervals=True, plot_anomalies=True)
```

```python
plotModelResults(ridge, pca_features_train, pca_features_test, y_train, y_test, plot_intervals=True, plot_anomalies=True)
```

### FB Prophet

Now lets use FB-Prophet to predict the pattern

```python
from fbprophet import Prophet
import logging
logging.getLogger().setLevel(logging.ERROR)
```

```python
df_new = df['Close']
```

```python
df_new
```

```python
# Lets see the monthly pattern over the years
monthly_df = df_new.resample('M').apply(sum)
plt.figure(figsize=(15,10))
plt.plot(monthly_df)
```

Creating Dataset for FB-Prophet

```python
df_n = df_new.reset_index()
df_n.columns = ['ds', 'y']
df_n = df_n.reset_index(drop=True)
```

```python
prediction_size = 30 # prediction for one-month
train_df = df_n[:-prediction_size]
train_df.tail(n=3)
```

Fitting the model and Creating Future Dataframes including the history

```python
m = Prophet()
m.fit(train_df);
```

```python
future = m.make_future_dataframe(periods=prediction_size)
future.tail(n=3)
```

```python
forecast = m.predict(future)
forecast.tail(n=3)
```

Creating Plots to see the patterns predicted by FB-Prophet

```python
m.plot(forecast)
```

```python
m.plot_components(forecast)
```

Above plots are self explanatory but few are important observations:

1. On Wednesdays price of this stock on an average goes up
2. August / September, prices are on an average goes down
3. After financial crisis of 2008, stock has picked up well and reached to its peak in around 2013

Lets combine Historic and Forecast data together

```python
def make_comparison_dataframe(historical, forecast):
"""Join the history with the forecast.

The resulting dataset will contain columns 'yhat', 'yhat_lower', 'yhat_upper' and 'y'.
"""
return forecast.set_index('ds')[['yhat', 'yhat_lower', 'yhat_upper']].join(historical.set_index('ds'))
```

```python
cmp_df = make_comparison_dataframe(df_n, forecast)
cmp_df.tail(n=3)
```

```python
prediction_size=10 # 10 days prediction
cmp_df_pred = cmp_df[-prediction_size:]
cmp_df_pred['MAE'] = cmp_df_pred['y'] - cmp_df_pred['yhat']
cmp_df_pred['MAPE'] = 100* cmp_df_pred['MAE'] / cmp_df_pred['y']

print('average MAE:', np.mean(np.abs(cmp_df_pred['MAE'])))
print('average MAPE:', np.mean(np.abs(cmp_df_pred['MAPE'])))
```

FB-Prophet has not done well so far in comparison with Lasso and Ridge.

Lets normalize the data using Box-Cox transformation and see if these results have improved

```python
def inverse_boxcox(y, lambda_):
return np.exp(y) if lambda_ == 0 else np.exp(np.log(lambda_ * y + 1) / lambda_)
```

```python
train_df2 = train_df.copy().set_index('ds')
```

```python
from scipy import stats
import statsmodels.api as sm
train_df2['y'], lambda_prophet = stats.boxcox(train_df2['y'])
train_df2.reset_index(inplace=True)
train_df2.head(3)
```

```python
m2 = Prophet()
m2.fit(train_df2)
future2 = m2.make_future_dataframe(periods=prediction_size)
forecast2 = m2.predict(future2)
```

```python
for column in ['yhat', 'yhat_lower', 'yhat_upper']:
forecast2[column] = inverse_boxcox(forecast2[column], lambda_prophet)
```

Plotting the new components

```python
m2.plot_components(forecast2)
```

Lets create a module for forecast errors

```python
def calculate_forecast_errors(df, prediction_size):
"""Calculate MAPE and MAE of the forecast.

Args:
df: joined dataset with 'y' and 'yhat' columns.
prediction_size: number of days at the end to predict.
"""

# Make a copy
df = df.copy()

# Now we calculate the values of e_i and p_i according to the formulas given in the article above.
df['e'] = df['y'] - df['yhat']
df['p'] = 100 * df['e'] / df['y']

# Recall that we held out the values of the last `prediction_size` days
# in order to predict them and measure the quality of the model.

# Now cut out the part of the data which we made our prediction for.
predicted_part = df[-prediction_size:]

# Define the function that averages absolute error values over the predicted part.
error_mean = lambda error_name: np.mean(np.abs(predicted_part[error_name]))

# Now we can calculate MAPE and MAE and return the resulting dictionary of errors.
return {'MAPE': error_mean('p'), 'MAE': error_mean('e')}
```

```python
cmp_df2 = make_comparison_dataframe(df_n, forecast2)
for err_name, err_value in calculate_forecast_errors(cmp_df2, prediction_size).items():
print(err_name, err_value)
```

Box Cox has improved the results but still not up to the levels of Lasso and Ridge

```python
m2.plot(forecast2)
```

```python
cmp_df2.tail(20)
```

FB Prophet has not fared well in comparison with Lasso and Ridge (see predicted results are very far from actual values).

Now lets run 2 very powerful algorithms and see if they can beat Lasso and Ridge

```python
import sys
#sys.path.append('/Users/dmitrys/xgboost/python-package/')
from xgboost import XGBRegressor

xgb = XGBRegressor()
xgb.fit(X_train_scaled, y_train)
```

```python
plotModelResults(xgb, X_train_scaled, X_test_scaled, y_train, y_test, plot_intervals=True, plot_anomalies=True)
```

```python
lgb = lightgbm.LGBMRegressor()
lgb.fit(X_train_scaled, y_train)
```

```python
plotModelResults(lgb, X_train_scaled, X_test_scaled, y_train, y_test, plot_intervals=True, plot_anomalies=True)
```

Not at all!!

Tree based algorithms are known to fail miserably on time series predictions which is evident from the above results.

Now we will do some stacking and see if results on Lasso and Ridge can be improved further.

Here we will use three classifiers:

1. Elastic Net (base)
2. Ridge (base)
3. Lasso (Meta)

```python
from mlxtend.classifier import StackingClassifier
from mlxtend.regressor import StackingRegressor
from sklearn.linear_model import ElasticNet

clf1 = ElasticNet(max_iter=10000)
clf2 = ridge

sclf = StackingRegressor(regressors=[clf1, clf2],
meta_regressor=lasso)

sclf.fit(X_train_scaled, y_train)
```

```python
plotModelResults(sclf, X_train_scaled, X_test_scaled, y_train, y_test, plot_intervals=True, plot_anomalies=True)
```

```python
y_pred = sclf.predict(X_test_scaled)

columns = ['Close_actual', 'Close_pred']
df_pred_sclf = pd.DataFrame(columns = columns)

df_pred_sclf.Close_actual = y_test
df_pred_sclf.Close_pred = y_pred
```

```python
plt.figure(figsize=(15,8))
plt.plot(df_pred_sclf)
plt.plot(df_pred_sclf.Close_pred, "b--", label="prediction", linewidth=0.5)
plt.plot(df_pred_sclf.Close_actual, "r--", label="actual", linewidth=0.5)
plt.legend(loc="best")
```

```python
df_pred_sclf['diff'] = df_pred_sclf.Close_actual - df_pred_sclf.Close_pred
df_pred_sclf['perc_diff'] = ((df_pred_sclf['diff']) / (df_pred_sclf['Close_pred']))*100
df_pred_sclf.head(20)
```

## Conclusion

Results have slightly improved. It turns out that regularized Lasso and Ridge regressions gave the best results. MAPE is around 1.76% and MAE is around INR 6. This is remarkable and it can be further improved through the ways of Hyperparameter tuning or through some advanced techniques such as LSTM.
