# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/California_housing_value_prediction_Ilya_Larchenko.ipynb
Original Path: jupyter_english/projects_indiv/California_housing_value_prediction_Ilya_Larchenko.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg" />

## [mlcourse.ai](mlcourse.ai) – Open Machine Learning Course
### <center> Author: Ilya Larchenko, ODS Slack ilya_l

## <center> Individual data analysis project

## 1. Data description

__I will analyse California Housing Data (1990). It can be downloaded from Kaggle [https://www.kaggle.com/harrywang/housing]__

We will predict the median price of household in block.
To start you need to download file housing.csv.zip . Let's load the data and look at it.

```python
import pandas as pd
import numpy as np
import os
%matplotlib inline

import warnings # `do not disturbe` mode
warnings.filterwarnings('ignore')
```

```python
# change this if needed
PATH_TO_DATA = 'data'
```

```python
full_df = pd.read_csv(os.path.join(PATH_TO_DATA, 'housing.csv.zip'), compression ='zip')
print(full_df.shape)
full_df.head()
```

Data consists of 20640 rows and 10 features:

1. longitude: A measure of how far west a house is; a higher value is farther west
2. latitude: A measure of how far north a house is; a higher value is farther north
3. housingMedianAge: Median age of a house within a block; a lower number is a newer building
4. totalRooms: Total number of rooms within a block
5. totalBedrooms: Total number of bedrooms within a block
6. population: Total number of people residing within a block
7. households: Total number of households, a group of people residing within a home unit, for a block
8. medianIncome: Median income for households within a block of houses (measured in tens of thousands of US Dollars)
9. medianHouseValue: Median house value for households within a block (measured in US Dollars)
10. oceanProximity: Location of the house w.r.t ocean/sea

*median_house_value* is our target feature, we will use other features to predict it.

The task is to predict how much the houses in particular block cost (the median) based on information of blocks location and basic sociodemographic data

Let's divide dataset into train (75%) and test (25%).

```python
%%time
from sklearn.model_selection import train_test_split
train_df, test_df = train_test_split(full_df,shuffle = True, test_size = 0.25, random_state=17)
train_df=train_df.copy()
test_df=test_df.copy()
print(train_df.shape)
print(test_df.shape)
```

All futher analysis we will do with the test set. But feature generation and processing will be simmultaneously done on both sets.

## 2-3. Primary data analysis / Primary visual data analysis

```python
train_df.describe()
```

```python
train_df.info()
```

We can see that most columns has no nan values (except total_bedrooms), most features has float format, only 1 feature is categorical - ocean_proximity.

```python
train_df[pd.isnull(train_df).any(axis=1)].head(10)
```

There is no obvious reasons for some total_bedrooms to be NaN. The number of NaNs is about 1% of total dataset. Maybe we could just drop this rows or fill it with mean/median values, but let's wait for a while, and deal with blanks after initial data analysis in a smarter manner.

Let's create the list of numeric features names (it will be useful later).

```python
numerical_features=list(train_df.columns)
numerical_features.remove('ocean_proximity')
numerical_features.remove('median_house_value')
print(numerical_features)
```

Let's look at target feature distribition

```python
train_df['median_house_value'].hist()
```

We can visually see that distribution is skewed and not normal. Also it seems that the values are clipped somewhere near 500 000. We can check it numerically.

```python
max_target=train_df['median_house_value'].max()
print("The largest median value:",max_target)
print("The # of values, equal to the largest:", sum(train_df['median_house_value']==max_target))
print("The % of values, equal to the largest:", sum(train_df['median_house_value']==max_target)/train_df.shape[0])
```

Almost 5% of all values = exactly 500 001. It proves our clipping theory. Let's check the clipping of small values:

```python
min_target=train_df['median_house_value'].min()
print("The smallest median value:",min_target)
print("The # of values, equal to the smallest:", sum(train_df['median_house_value']==min_target))
print("The % of values, equal to the smallest:", sum(train_df['median_house_value']==min_target)/train_df.shape[0])
```

This time it looks much better, a little bit artificial value 14 999 - is common for prices. And there are only 4 such values. So probably the small values are not clipped.

Let's conduct some normality tests:

```python
from statsmodels.graphics.gofplots import qqplot
from matplotlib import pyplot

qqplot(train_df['median_house_value'], line='s')
pyplot.show()
```

```python
from scipy.stats import normaltest

stat, p = normaltest(train_df['median_house_value'])
print('Statistics=%.3f, p=%.3f' % (stat, p))

alpha = 0.05
if p < alpha: # null hypothesis: x comes from a normal distribution
print("The null hypothesis can be rejected")
else:
print("The null hypothesis cannot be rejected")
```

QQ-plot and D’Agostino and Pearson’s normality test show that the distribution is far from normal. We can try to use log(1+n) to make it more normal:

```python
target_log=np.log1p(train_df['median_house_value'])
qqplot(target_log, line='s')
pyplot.show()
```

```python
stat, p = normaltest(target_log)
print('Statistics=%.3f, p=%.3f' % (stat, p))

alpha = 0.05
if p < alpha: # null hypothesis: x comes from a normal distribution
print("The null hypothesis can be rejected")
else:
print("The null hypothesis cannot be rejected")
```

This graph looks much better, the only non-normal parts are clipped high prices and very low prices. Unfortunately we can not reconstruct clipped data and statistically the distribution it is still not normal - p-value = 0, the null hypothesis of distribution normality can be rejected.

Anyway, predicting of target_log instead of target can be a good choice for us, but we still should check it during model validation phase.

```python
train_df['median_house_value_log']=np.log1p(train_df['median_house_value'])
test_df['median_house_value_log']=np.log1p(test_df['median_house_value'])
```

Now let's analyze numerical features. First of all we need to look at their distributions.

```python
train_df[numerical_features].hist(bins=50, figsize=(10, 10))
```

Some features are signifacantly skewed, and our "log trick" should be heplfull

```python
skewed_features=['households','median_income','population', 'total_bedrooms', 'total_rooms']
log_numerical_features=[]
for f in skewed_features:
train_df[f + '_log']=np.log1p(train_df[f])
test_df[f + '_log']=np.log1p(test_df[f])
log_numerical_features.append(f + '_log')
```

```python
train_df[log_numerical_features].hist(bins=50, figsize=(10, 10))
```

Our new features looks much better (during the modeling phase we can use either original, new ones or both of them)

housing_median_age looks clipped as well. Let's look at it's highest value precisely.

```python
max_house_age=train_df['housing_median_age'].max()
print("The largest value:",max_house_age)
print("The # of values, equal to the largest:", sum(train_df['housing_median_age']==max_house_age))
print("The % of values, equal to the largest:", sum(train_df['housing_median_age']==max_house_age)/train_df.shape[0])
```

It is very likely the data is clipped (there are also a small chance that in 1938 there was a great reconstruction project in California but it seems less likely). We can't recreate original values, but it can be useful to create new binary value indicating the clipping of the house age.

```python
train_df['age_clipped']=train_df['housing_median_age']==max_house_age
test_df['age_clipped']=test_df['housing_median_age']==max_house_age
```

Now we will analyse correleation between features and target variable

```python
import matplotlib.pyplot as plt
import seaborn as sns

corr_y = pd.DataFrame(train_df).corr()
plt.rcParams['figure.figsize'] = (20, 16) # Размер картинок
sns.heatmap(corr_y,
xticklabels=corr_y.columns.values,
yticklabels=corr_y.columns.values, annot=True)
```

We can see some (maybe obvious) patterns here:
- House values are significantly correlated with median income
- Number of households is not 100% correlated with population, we can try to add average_size_of_household as a feature
- Longitude and Latitude should be analyzed separately (just a correlation with target variable is not very useful)
- There is a set of highly correlated features: number of rooms, bedrooms, population and households. It can be useful to reduce dimensionality of this subset, especially if we use linear models
- total_bedrooms is one of these highly correlated features, it means we can fill NaN values with high precision using simplest linear regression

Let's try to fill NaNs with simple linear regression:

```python
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

lin = LinearRegression()

# we will train our model based on all numerical non-target features with not NaN total_bedrooms
appropriate_columns = train_df.drop(['median_house_value','median_house_value_log',
'ocean_proximity', 'total_bedrooms_log'],axis=1)
train_data=appropriate_columns[~pd.isnull(train_df).any(axis=1)]

# model will be validated on 25% of train dataset
# theoretically we can use even our test_df dataset (as we don't use target) for this task, but we will not
temp_train, temp_valid = train_test_split(train_data,shuffle = True, test_size = 0.25, random_state=17)

lin.fit(temp_train.drop(['total_bedrooms'],axis=1), temp_train['total_bedrooms'])
np.sqrt(mean_squared_error(lin.predict(temp_valid.drop(['total_bedrooms'],axis=1)),
temp_valid['total_bedrooms']))
```

RMSE on a validation set is 64.5. Let's compare this with the best constant prediction - what if we fill NaNs with mean value:

```python
np.sqrt(mean_squared_error(np.ones(len(temp_valid['total_bedrooms']))*temp_train['total_bedrooms'].mean(),
temp_valid['total_bedrooms']))
```

Obviously our linear regression approach is much better. Let's train our model on whole train dataset and apply it to the rows with blanks. But preliminary we will "remember" the rows with NaNs, because there is a chance, that it can contain useful information.

```python
lin.fit(train_data.drop(['total_bedrooms'],axis=1), train_data['total_bedrooms'])

train_df['total_bedrooms_is_nan']=pd.isnull(train_df).any(axis=1).astype(int)
test_df['total_bedrooms_is_nan']=pd.isnull(test_df).any(axis=1).astype(int)

train_df['total_bedrooms'].loc[pd.isnull(train_df).any(axis=1)]=\
lin.predict(train_df.drop(['median_house_value','median_house_value_log','total_bedrooms','total_bedrooms_log',
'ocean_proximity','total_bedrooms_is_nan'],axis=1)[pd.isnull(train_df).any(axis=1)])

test_df['total_bedrooms'].loc[pd.isnull(test_df).any(axis=1)]=\
lin.predict(test_df.drop(['median_house_value','median_house_value_log','total_bedrooms','total_bedrooms_log',
'ocean_proximity','total_bedrooms_is_nan'],axis=1)[pd.isnull(test_df).any(axis=1)])

#linear regression can lead to negative predictions, let's change it
test_df['total_bedrooms']=test_df['total_bedrooms'].apply(lambda x: max(x,0))
train_df['total_bedrooms']=train_df['total_bedrooms'].apply(lambda x: max(x,0))
```

Let's update 'total_bedrooms_log' and check if there are no NaNs left

```python
train_df['total_bedrooms_log']=np.log1p(train_df['total_bedrooms'])
test_df['total_bedrooms_log']=np.log1p(test_df['total_bedrooms'])
```

```python
print(train_df.info())
print(test_df.info())
```

After filling of blanks let's have a closer look on dependences between some numerical features

```python
sns.set()
sns.pairplot(train_df[log_numerical_features+['median_house_value_log']])
```

It seems there are no new insights about numerical features (only confirmation of the old ones).

Let's try to do the same thing but for the local (geographically) subset of our data.

```python
sns.set()
local_coord=[-122, 41] # the point near which we want to look at our variables
euc_dist_th = 2 # distance treshhold

euclid_distance=train_df[['latitude','longitude']].apply(lambda x:
np.sqrt((x['longitude']-local_coord[0])**2+
(x['latitude']-local_coord[1])**2), axis=1)

# indicate wethere the point is within treshhold or not
indicator=pd.Series(euclid_distance<=euc_dist_th, name='indicator')

print("Data points within treshhold:", sum(indicator))

# a small map to visualize th eregion for analysis
sns.lmplot('longitude', 'latitude', data=pd.concat([train_df,indicator], axis=1), hue='indicator', markers ='.', fit_reg=False, height=5)

# pairplot
sns.pairplot(train_df[log_numerical_features+['median_house_value_log']][indicator])
```

We can see that on any local territory (you can play with local_coord and euc_dist_th) the linear dependences between variables became stronger, especially median_income_log / median_house_value_log. So the coordinates is very important factor for our task (we will analyze it later)

Now let's move on to the categorical feature "ocean_proximity". It is not 100% clear what does it values means. So let's first of all plot in on the map.

```python
sns.lmplot('longitude', 'latitude', data=train_df,markers ='.', hue='ocean_proximity', fit_reg=False, height=5)
plt.show()
```

Now we better undersand the meaning of different classes. Let's look at the data.

```python
value_count=train_df['ocean_proximity'].value_counts()
value_count
```

```python
plt.figure(figsize=(12,5))

sns.barplot(value_count.index, value_count.values)
plt.title('Ocean Proximity')
plt.ylabel('Number of Occurrences')
plt.xlabel('Ocean Proximity')

plt.figure(figsize=(12,5))
plt.title('House Value depending on Ocean Proximity')
sns.boxplot(x="ocean_proximity", y="median_house_value_log", data=train_df)
```

We can see that INLAND houses has significantly lower prices. Distribution in other differ but not so much. There is no clear trend in house price / poximity, so we will not try to invent complex encoding approach. Let's just do OHE for this feature.

```python
ocean_proximity_dummies = pd.get_dummies(pd.concat([train_df['ocean_proximity'],test_df['ocean_proximity']]),
drop_first=True)
```

```python
dummies_names=list(ocean_proximity_dummies.columns)
```

```python
train_df=pd.concat([train_df,ocean_proximity_dummies[:train_df.shape[0]]], axis=1 )
test_df=pd.concat([test_df,ocean_proximity_dummies[train_df.shape[0]:]], axis=1 )

train_df=train_df.drop(['ocean_proximity'], axis=1)
test_df=test_df.drop(['ocean_proximity'], axis=1)
```

```python
train_df.head()
```

And finally we will explore coordinates features.

```python
train_df[['longitude','latitude']].describe()
```

Let's plot the house_values (target) on map:

```python
from matplotlib.colors import LinearSegmentedColormap

plt.figure(figsize=(10,10))

cmap = LinearSegmentedColormap.from_list(name='name', colors=['green','yellow','red'])

f, ax = plt.subplots()
points = ax.scatter(train_df['longitude'], train_df['latitude'], c=train_df['median_house_value_log'],
s=10, cmap=cmap)
f.colorbar(points)
```

It seems that the average value of geographically nearest houses can be very good feature.

We can also see, that the most expensive houses are located near San Francisco (37.7749° N, 122.4194° W) and Los Angeles (34.0522° N, 118.2437°). Based on this we can use the distance to this cities as additional features.

We also see that the most expensive houses are on approximately on the straight line, and become cheaper when we moving to North-East. This means that the linear combination of coordinates themselves can be useful feature as well.

```python
sf_coord=[-122.4194, 37.7749]
la_coord=[-118.2437, 34.0522]

train_df['distance_to_SF']=np.sqrt((train_df['longitude']-sf_coord[0])**2+(train_df['latitude']-sf_coord[1])**2)
test_df['distance_to_SF']=np.sqrt((test_df['longitude']-sf_coord[0])**2+(test_df['latitude']-sf_coord[1])**2)

train_df['distance_to_LA']=np.sqrt((train_df['longitude']-la_coord[0])**2+(train_df['latitude']-la_coord[1])**2)
test_df['distance_to_LA']=np.sqrt((test_df['longitude']-la_coord[0])**2+(test_df['latitude']-la_coord[1])**2)
```

## 4. Insights and found dependencies

Let's quickly sum up what useful we have found so far:
- We have analyzed the features and found some ~lognorm distributed among them. We have created corresponding log features
- We have analyzed the distribution of the target feature, and concluded that it may be useful to predict log of it (to be checked)
- We have dealt with clipped and missing data
- We have created features corresponding to simple Eucledian distances to LA ans SF
- We also has found several highly correlated variables and maybe will work with them later
- We have already generated several new variables and will create more of them later after the initial modeling phase

All explanation about this steps were already given above.

## 5. Metrics selection

This is regression problem. Our target metric will be RMSE - it is one of the most popular regression metrics, and it has same unit of measurement as target value thus is easy to explain to other people.

\begin{align}
RMSE = \sqrt{\frac{1}{n}\Sigma_{i=1}^{n}{\Big(\frac{d_i -f_i}{\sigma_i}\Big)^2}}
\end{align}

As far as there is a monotonic dependence between RMSE and MSE we can optimize MSE in our model and compute RMSE only in the end. MSE is easy to optimize it is a default loss function for the most of regression models.

The main drawback of MSE and RMSE - high penalty for big errors in predictions - it can overfit to outliers, but in our case outlaying target values have already been clipped so it is not a big problem.

## 6. Model selection

We will try to solve our problem with 3 different regression models:
- Linear regression
- Random forest
- Gradient boosting

Linear regression is fast, simple and can provide quite a good baseline result for our task.
Tree based models can provide better results in case of nonlinear complex dependences of variables and in case of small number of variables, they are also more stable to multicollinearity (and we have highly correlated variables). Moreover in our problem target values are clipped and targets can't be outside the clipping interval, it is good for the tree-based models.

The results of using these models will be compared in the 11-12 parts of the project. Tree-based models are expected to work better in this particular problem, but we will start with more simple model.

We will start with standard linear regression, go through all of the modeling steps, and then do some simplified computations for 2 other models (without in-depth explanation of every step).

The final model selection will be done based on the results.

## 7. Data preprocessing

We have already done most of the preprocessing steps:
- OHE for the categorical features
- Filled NaNs
- Computed logs of skewed data
- Divided data into train and hold-out sets

Now let's scale all numerical features (it is useful for the linear models), prepare cross validation splits and we are ready to proceed to modeling

```python
from sklearn.preprocessing import StandardScaler

features_to_scale=numerical_features+log_numerical_features+['distance_to_SF','distance_to_LA']

scaler = StandardScaler()

X_train_scaled=pd.DataFrame(scaler.fit_transform(train_df[features_to_scale]),
columns=features_to_scale, index=train_df.index)
X_test_scaled=pd.DataFrame(scaler.transform(test_df[features_to_scale]),
columns=features_to_scale, index=test_df.index)
```

## 8 Cross-validation and adjustment of model hyperparameters

Let's prepare cross validation samples.
As far as there are not a lot of data we can easily divide it on 10 folds, that are taken from shuffled train data.
Within every split we will train our model on 90% of train data and compute CV metric on the other 10%.

We fix the random state for the reproducibility.

```python
from sklearn.model_selection import KFold, cross_val_score

kf = KFold(n_splits=10, random_state=17, shuffle=True)
```

### Linear regression

For the first initial baseline we will take Rigge model with only initial numerical and OHE features

```python
from sklearn.linear_model import Ridge

model=Ridge(alpha=1)
X=train_df[numerical_features+dummies_names]
y=train_df['median_house_value']
cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
print(np.sqrt(-cv_scores.mean()))
```

We are doing cross validation with 10 folds, computing 'neg_mean_squared_error' (neg - because sklearn needs scoring functions to be minimized). Our final metrics: RMSE=np.sqrt(-neg_MSE)

So our baseline is RMSE = $68 702 we will try to improve this results using everything we have discovered during the data analysis phase.

We will do the following steps:
- Use scaled features
- Add log features
- Add NaN and age clip indicating features
- Add city-distance features
- Generate several new features
- Try to predict log(target) instead of target
- Tune some hyperparameters of the model

One again the most part of the hyperparameters adjustment will be done later after we add some new features. Actually the cross-validation and parameters tuning process is done through the parts 8-11.

```python
# using scaled data
X=pd.concat([train_df[dummies_names], X_train_scaled[numerical_features]], axis=1, ignore_index = True)
cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
print(np.sqrt(-cv_scores.mean()))
```

```python
# adding NaN indicating feature
X=pd.concat([train_df[dummies_names+['total_bedrooms_is_nan']],
X_train_scaled[numerical_features]], axis=1, ignore_index = True)
cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
print(np.sqrt(-cv_scores.mean()))
```

```python
# adding house age cliiping indicating feature
X=pd.concat([train_df[dummies_names+['age_clipped']],
X_train_scaled[numerical_features]], axis=1, ignore_index = True)
cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
print(np.sqrt(-cv_scores.mean()))
```

```python
# adding log features
X=pd.concat([train_df[dummies_names+['age_clipped']], X_train_scaled[numerical_features+log_numerical_features]],
axis=1, ignore_index = True)
cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
print(np.sqrt(-cv_scores.mean()))
```

```python
# adding city distance features
X=pd.concat([train_df[dummies_names+['age_clipped']], X_train_scaled],
axis=1, ignore_index = True)
cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
print(np.sqrt(-cv_scores.mean()))
```

Up to this moment we have got best result using numerical features + their logs + age_clipped+ dummy variables + distances to the largest cities.
Let's try to generate new features

## 9. Creation of new features and description of this process

Previously we have already created and explained the rational of new features creation. Now Let's generate additional ones

City distances features work, but maybe there are also some non-linear dependencies between them and the target variables.

```python
sns.set()
sns.pairplot(train_df[['distance_to_SF','distance_to_LA','median_house_value_log']])
```

Visually is not obvious so let's try to create a couple of new variables and check:

```python
new_features_train_df=pd.DataFrame(index=train_df.index)
new_features_test_df=pd.DataFrame(index=test_df.index)

new_features_train_df['1/distance_to_SF']=1/(train_df['distance_to_SF']+0.001)
new_features_train_df['1/distance_to_LA']=1/(train_df['distance_to_LA']+0.001)
new_features_train_df['log_distance_to_SF']=np.log1p(train_df['distance_to_SF'])
new_features_train_df['log_distance_to_LA']=np.log1p(train_df['distance_to_LA'])

new_features_test_df['1/distance_to_SF']=1/(test_df['distance_to_SF']+0.001)
new_features_test_df['1/distance_to_LA']=1/(test_df['distance_to_LA']+0.001)
new_features_test_df['log_distance_to_SF']=np.log1p(test_df['distance_to_SF'])
new_features_test_df['log_distance_to_LA']=np.log1p(test_df['distance_to_LA'])
```

We can also generate some features correlated to the prosperity:
- rooms/person - how many rooms are there per person. The higher - the richer people are living there - the more expensive houses they buy
- rooms/household - how many rooms are there per family. The similar one but corresponds to the number of rooms per family (assuming household~family), not per person.
- two similar features but counting only bedrooms

```python
new_features_train_df['rooms/person']=train_df['total_rooms']/train_df['population']
new_features_train_df['rooms/household']=train_df['total_rooms']/train_df['households']

new_features_test_df['rooms/person']=test_df['total_rooms']/test_df['population']
new_features_test_df['rooms/household']=test_df['total_rooms']/test_df['households']

new_features_train_df['bedrooms/person']=train_df['total_bedrooms']/train_df['population']
new_features_train_df['bedrooms/household']=train_df['total_bedrooms']/train_df['households']

new_features_test_df['bedrooms/person']=test_df['total_bedrooms']/test_df['population']
new_features_test_df['bedrooms/household']=test_df['total_bedrooms']/test_df['households']
```

- the luxurity of house can be characterized buy number of bedrooms per rooms

```python
new_features_train_df['bedroom/rooms']=train_df['total_bedrooms']/train_df['total_rooms']
new_features_test_df['bedroom/rooms']=test_df['total_bedrooms']/test_df['total_rooms']
```

- the average number of persons in one household can be the signal of prosperity or the same time the signal of richness but in any case it can be a useful feature

```python
new_features_train_df['average_size_of_household']=train_df['population']/train_df['households']
new_features_test_df['average_size_of_household']=test_df['population']/test_df['households']
```

And finally let's scale all this features

```python
new_features_train_df=pd.DataFrame(scaler.fit_transform(new_features_train_df),
columns=new_features_train_df.columns, index=new_features_train_df.index)

new_features_test_df=pd.DataFrame(scaler.transform(new_features_test_df),
columns=new_features_test_df.columns, index=new_features_test_df.index)
```

```python
new_features_train_df.head()
```

```python
new_features_test_df.head()
```

We will add new features one by one and keeps only those that improve our best score

```python
# computing current best score

X=pd.concat([train_df[dummies_names+['age_clipped']], X_train_scaled],
axis=1, ignore_index = True)

cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
best_score = np.sqrt(-cv_scores.mean())
print("Best score: ", best_score)

# list of the new good features
new_features_list=[]

for feature in new_features_train_df.columns:
new_features_list.append(feature)
X=pd.concat([train_df[dummies_names+['age_clipped']], X_train_scaled,
new_features_train_df[new_features_list]
],
axis=1, ignore_index = True)
cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
score = np.sqrt(-cv_scores.mean())
if score >= best_score:
new_features_list.remove(feature)
print(feature, ' is not a good feature')
else:
print(feature, ' is a good feature')
print('New best score: ', score)
best_score=score
```

We have got 5 new good features. Let's update our X variable

```python
X=pd.concat([train_df[dummies_names+['age_clipped']], X_train_scaled,
new_features_train_df[new_features_list]
],
axis=1).reset_index(drop=True)
y=train_df['median_house_value'].reset_index(drop=True)
```

To deal with log of target we need to create our own cross validation or our own predicting model. We will try the first option

```python
from sklearn.metrics import mean_squared_error

def cross_val_score_with_log(model=model, X=X,y=y,kf=kf, use_log=False):

X_temp=np.array(X)

# if use_log parameter is true we will predict log(y+1)
if use_log:
y_temp=np.log1p(y)
else:
y_temp=np.array(y)

cv_scores=[]
for train_index, test_index in kf.split(X_temp,y_temp):

prediction = model.fit(X_temp[train_index], y_temp[train_index]).predict(X_temp[test_index])

# if use_log parameter is true we should come back to the initial targer
if use_log:
prediction=np.expm1(prediction)
cv_scores.append(-mean_squared_error(y[test_index],prediction))

return np.sqrt(-np.mean(cv_scores))
```

```python
cross_val_score_with_log(X=X,y=y,kf=kf, use_log=False)
```

We have got exactly the same result as with cross_val_score function. That means everything work ok. Now let's try to set use_log to true

```python
cross_val_score_with_log(X=X,y=y,kf=kf, use_log=True)
```

Unfortunately, it has not helped. So we will stick to the previous version.

And now we will tune the only meaningful hyperparameter of the Ridge regression - alpha.

## 10. Plotting training and validation curves

Let's plot Validation Curve

```python
from sklearn.model_selection import validation_curve

Cs=np.logspace(-5, 4, 10)
train_scores, valid_scores = validation_curve(model, X, y, "alpha",
Cs, cv=kf, scoring='neg_mean_squared_error')

plt.plot(Cs, np.sqrt(-train_scores.mean(axis=1)), 'ro-')

plt.fill_between(x=Cs, y1=np.sqrt(-train_scores.max(axis=1)),
y2=np.sqrt(-train_scores.min(axis=1)), alpha=0.1, color = "red")

plt.plot(Cs, np.sqrt(-valid_scores.mean(axis=1)), 'bo-')

plt.fill_between(x=Cs, y1=np.sqrt(-valid_scores.max(axis=1)),
y2=np.sqrt(-valid_scores.min(axis=1)), alpha=0.1, color = "blue")

plt.xscale('log')
plt.xlabel('alpha')
plt.ylabel('RMSE')
plt.title('Regularization Parameter Tuning')

plt.show()
```

```python
Cs[np.sqrt(-valid_scores.mean(axis=1)).argmin()]
```

We can see that curves for train and CV are very close to each other, it is a sign of underfiting. The difference between the curves does not change along with change in alpha this mean that we should try more complex models comparing to linear regression or add more new features (f.e. polynomial ones)

Using this curve we can find the optimal value of alpha. It is alpha=1. But actually our prediction does not change when alpha goes below 1.

Let's use alpha=1 and plot the learning curve

```python
from sklearn.model_selection import learning_curve

model=Ridge(alpha=1.0)

train_sizes, train_scores, valid_scores = learning_curve(model, X, y, train_sizes=list(range(50,10001,100)),
scoring='neg_mean_squared_error', cv=5)

plt.plot(train_sizes, np.sqrt(-train_scores.mean(axis=1)), 'ro-')

plt.fill_between(x=train_sizes, y1=np.sqrt(-train_scores.max(axis=1)),
y2=np.sqrt(-train_scores.min(axis=1)), alpha=0.1, color = "red")

plt.plot(train_sizes, np.sqrt(-valid_scores.mean(axis=1)), 'bo-')

plt.fill_between(x=train_sizes, y1=np.sqrt(-valid_scores.max(axis=1)),
y2=np.sqrt(-valid_scores.min(axis=1)), alpha=0.1, color = "blue")

plt.xlabel('Train size')
plt.ylabel('RMSE')
plt.title('Regularization Parameter Tuning')

plt.show()
```

Learning curves indicate high bias of the model - this means we will not improve our model by adding more data, but we can try to use more complex models or add more features to improve the results.

This result is inline with the validation curve results. So let's move on to the more complex models.

### Random forest

Actually we can just put all our features into the model but we can easily improve computational performance of the tree-based models, by deleting all monotonous derivatives of features because they does not help at all.

For example, adding log(feature) don't help tree-based model, it will just make it more computationally intensive.

So let's train random forest classifier based on shorten set of the features

```python
X.columns
```

```python
features_for_trees=['INLAND', 'ISLAND', 'NEAR BAY', 'NEAR OCEAN', 'age_clipped',
'longitude', 'latitude', 'housing_median_age', 'total_rooms',
'total_bedrooms', 'population', 'households', 'median_income',
'distance_to_SF', 'distance_to_LA','bedroom/rooms']
```

```python
%%time
from sklearn.ensemble import RandomForestRegressor

X_trees=X[features_for_trees]

model_rf=RandomForestRegressor(n_estimators=100, random_state=17)
cv_scores = cross_val_score(model_rf, X_trees, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)

print(np.sqrt(-cv_scores.mean()))
```

We can see significant improvement, comparing to the linear model and higher n_estimator probably will help. But first, let's try to tune other hyperparametres:

```python
from sklearn.model_selection import GridSearchCV

param_grid={'n_estimators': [100],
'max_depth': [22, 23, 24, 25],
'max_features': [5,6,7,8]}

gs=GridSearchCV(model_rf, param_grid, scoring='neg_mean_squared_error', fit_params=None, n_jobs=-1, cv=kf, verbose=1)

gs.fit(X_trees,y)
```

```python
print(np.sqrt(-gs.best_score_))
```

```python
gs.best_params_
```

```python
best_depth=gs.best_params_['max_depth']
best_features=gs.best_params_['max_features']
```

```python
%%time
model_rf=RandomForestRegressor(n_estimators=100, max_depth=best_depth, max_features=best_features, random_state=17)
cv_scores = cross_val_score(model_rf, X_trees, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)

print(np.sqrt(-cv_scores.mean()))
```

With the relatively small effort we have got a significant improvement of results. Random Forest results can be further improved by higher n_estimators, let's find the n_estimators at witch the results stabilize.

```python
model_rf=RandomForestRegressor(n_estimators=200, max_depth=best_depth, max_features=best_features, random_state=17)
Cs=list(range(20,201,20))
train_scores, valid_scores = validation_curve(model_rf, X_trees, y, "n_estimators",
Cs, cv=kf, scoring='neg_mean_squared_error')

plt.plot(Cs, np.sqrt(-train_scores.mean(axis=1)), 'ro-')

plt.fill_between(x=Cs, y1=np.sqrt(-train_scores.max(axis=1)),
y2=np.sqrt(-train_scores.min(axis=1)), alpha=0.1, color = "red")

plt.plot(Cs, np.sqrt(-valid_scores.mean(axis=1)), 'bo-')

plt.fill_between(x=Cs, y1=np.sqrt(-valid_scores.max(axis=1)),
y2=np.sqrt(-valid_scores.min(axis=1)), alpha=0.1, color = "blue")

plt.xlabel('n_estimators')
plt.ylabel('RMSE')
plt.title('Regularization Parameter Tuning')

plt.show()
```

This time we can see that the results of train is much better than CV, but it is totally ok for the Random Forest.

Higher value of n_estimators (>100) does not help much. Let's stick to the n_estimators=200 - it is high enough but not very computationally intensive.

### Gradient boosting

And finally we will try to use LightGBM to solve our problem.
We will try the model out of the box, and then tune some of its parameters using random search

```python
# uncomment to install if you have not yet
#!pip install lightgbm
```

```python
%%time
from lightgbm.sklearn import LGBMRegressor

model_gb=LGBMRegressor()
cv_scores = cross_val_score(model_gb, X_trees, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=1)

print(np.sqrt(-cv_scores.mean()))
```

LGBMRegressor has much more hyperparameters than previous models. As far as this is educational problem we will not spend a lot of time to tuning all of them. In this case RandomizedSearchCV can give us very good result quite fast, much faster than GridSearch. We will do optimization in 2 steps: model complexity optimization and convergence optimization. Let's do it.

```python
gs
```

```python
# model complexity optimization
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

param_grid={'max_depth': randint(6,11),
'num_leaves': randint(7,127),
'reg_lambda': np.logspace(-3,0,100),
'random_state': [17]}

gs=RandomizedSearchCV(model_gb, param_grid, n_iter = 50, scoring='neg_mean_squared_error', fit_params=None,
n_jobs=-1, cv=kf, verbose=1, random_state=17)

gs.fit(X_trees,y)
```

```python
np.sqrt(-gs.best_score_)
```

```python
gs.best_params_
```

Let's fix n_estimators=500, it is big enough but is not to computationally intensive yet, and find the best value of the learning_rate

```python
# model convergency optimization

param_grid={'n_estimators': [500],
'learning_rate': np.logspace(-4, 0, 100),
'max_depth': [10],
'num_leaves': [72],
'reg_lambda': [0.0010722672220103231],
'random_state': [17]}

gs=RandomizedSearchCV(model_gb, param_grid, n_iter = 20, scoring='neg_mean_squared_error', fit_params=None,
n_jobs=-1, cv=kf, verbose=1, random_state=17)

gs.fit(X_trees,y)
```

```python
np.sqrt(-gs.best_score_)
```

```python
gs.best_params_
```

We have got the best params for the gradient boosting and will use them for the final prediction.

## 11. Prediction for test or hold-out samples

Lets sum up the results of our project. We will compute RMSE on cross validation and holdout set and compare them.

```python
results_df=pd.DataFrame(columns=['model','CV_results', 'holdout_results'])
```

```python
# hold-out features and target
X_ho=pd.concat([test_df[dummies_names+['age_clipped']], X_test_scaled,
new_features_test_df[new_features_list]],axis=1).reset_index(drop=True)
y_ho=test_df['median_house_value'].reset_index(drop=True)

X_trees_ho=X_ho[features_for_trees]
```

```python
%%time

#linear model
model=Ridge(alpha=1.0)

cv_scores = cross_val_score(model, X, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
score_cv=np.sqrt(-np.mean(cv_scores.mean()))

prediction_ho = model.fit(X, y).predict(X_ho)
score_ho=np.sqrt(mean_squared_error(y_ho,prediction_ho))

results_df.loc[results_df.shape[0]]=['Linear Regression', score_cv, score_ho]
```

```python
%%time

#Random Forest
model_rf=RandomForestRegressor(n_estimators=200, max_depth=23, max_features=5, random_state=17)

cv_scores = cross_val_score(model_rf, X_trees, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
score_cv=np.sqrt(-np.mean(cv_scores.mean()))

prediction_ho = model_rf.fit(X_trees, y).predict(X_trees_ho)
score_ho=np.sqrt(mean_squared_error(y_ho,prediction_ho))

results_df.loc[results_df.shape[0]]=['Random Forest', score_cv, score_ho]
```

```python
%%time

#Gradient boosting
model_gb=LGBMRegressor(reg_lambda=0.0010722672220103231, max_depth=10,
n_estimators=500, num_leaves=72, random_state=17, learning_rate=0.06734150657750829)
cv_scores = cross_val_score(model_gb, X_trees, y, cv=kf, scoring='neg_mean_squared_error', n_jobs=-1)
score_cv=np.sqrt(-np.mean(cv_scores.mean()))

prediction_ho = model_gb.fit(X_trees, y).predict(X_trees_ho)
score_ho=np.sqrt(mean_squared_error(y_ho,prediction_ho))

results_df.loc[results_df.shape[0]]=['Gradient boosting', score_cv, score_ho]
```

```python
results_df
```

It seems we have done quite a good job. Cross validation results are inline with holdout ones. Our best CV model - gradient boosting, turned out to be the best on hold-out dataset as well (and it is also faster than random forest).

## 12. Conclusions

To sum up, we have got the solution that can predict the mean house value in the block with RMSE \$46k using our best model - LGB. It is not an extremely precise prediction: \$46k is about 20% of the average mean house price, but it seems that it is near the possible solution for these classes of model based on this data (it is popular dataset but I have not find any solution with significantly better results).

We have used old Californian data from 1990 so it is not useful right now. But the same approach can be used to predict modern house prices (if applied to the resent market data).

We have done a lot but the results surely can be improved, at least one could try:

- feature engineering: polynomial features, better distances to cities (not Euclidean ones, ellipse representation of cities), average values of target for the geographically closest neighbours (requires custom estimator function for correct cross validation)
- PCA for dimensionality reduction (I have mentioned it but didn't used)
- other models (at least KNN and SVM can be tried based on data)
- more time and effort can be spent on RF and LGB parameters tuning
