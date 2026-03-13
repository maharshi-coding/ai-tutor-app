# <center> Credit scoring for the microloan organization

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/project_IgoSorokin.ipynb
Original Path: jupyter_english/projects_indiv/project_IgoSorokin.ipynb
Course: Machine Learning

# <center> Credit scoring for the microloan organization

## 1. Feature and data explanation

We have data from a micro loan organization. Data includes: applications, status (if application was granted or not) and portfoli snapshorts. Current risk level (ration of default clients) is too much, we need to implement at least basic scorecard to extract the best clients.

Data can be found here https://cloud.mail.ru/public/MTPz/zvoEGUjz9

**applications.csv** - contains information about applications

**status.csv** - contains information if loan was granted or not, and short information about previous applications of client

**portfolio.csv** - snapshot for every day if client was in delinquency or not

**applications.csv:**

Term - term of loan

expired_date - till that date client can accept the loan

loans_amount - amount of loans (rur) that client took

loans_cnt - count of loans that client took

paid_amount - amount of loans (rur) that client paid

paid_cnt - count of loans that client paid

pretention - client has pretention about previous loans (for example, didn't pay the penalties)

location_country - country location of client (from IP address)

location_city - city location of client (from IP address)

app_dt - date of application

verif_data - client verified his data

verif_doc - client verified his document

verif_appl - client verified his photo

verif_addres - client verified his address

doc_date - issue date of passport

client_date - date of registration in the community of microloan organization

credit_status - status of client (2: has active loan, 1: has closed loans, 0: never had loans in the system)

rating, rating2 - ratings in the community of microloan organization

amount_issued - amount of current loan

amount_return - amount of current loan plus interest rate

friends - friends in the community of microloan organization

app_id - id of applications

client_id - id of client

**status.csv**:

comments - comments of staff (usually it means something bad)

decision - if loan was granted or not (1 - granted)

**portfolio.csv**:

report_dt - date of snapshot

delq - if client was in delinquency or not (1 - was)

## 2. Primary data analysis

```python
import warnings
warnings.filterwarnings('ignore')
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_predict, GridSearchCV
from sklearn.linear_model import LogisticRegression, Ridge, LinearRegression
from xgboost import XGBClassifier
from sklearn.metrics import roc_auc_score
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import csr_matrix, hstack
from datetime import timedelta, date
import datetime
import math
import matplotlib.pyplot as plt
%matplotlib inline
```

Loading data

```python
status = pd.read_csv('status.csv')
applications = pd.read_csv('applications.csv')
portfolio = pd.read_csv('portfolio.csv')
```

```python
status.head()
```

```python
applications.head()
```

```python
applications.columns
```

```python
portfolio.head()
```

First, we need to select target variable. Of cource, it should be that loan are not paid, but if client delayed payment for a day we shouldn't consider him as a defaulted client. Therefore, we need to examine how much days of delay we'll consider as a default (target = 1)

```python
portfolio['report_dt'] = pd.to_datetime(portfolio['report_dt'], format = '%Y-%m-%d')
portfolio['key'] = portfolio['client_id'].apply(lambda x: str(x)) + portfolio['report_dt'].apply(lambda x: str(x))
portfolio['key_last'] = portfolio['client_id'].apply(lambda x: str(x)) + portfolio['report_dt'].apply(lambda x: str(x + timedelta(-1)))
```

```python
res = []
d = {}
d[0] = portfolio[(portfolio['delq'] == 0) & (portfolio['report_dt'] < '2018-11-15')]
for i in range(1,30):
d[i] = portfolio[(portfolio['key_last'].isin(d[i-1]['key'])) & (portfolio['delq'] == 1)]
res.append(d[i].shape[0])
res = np.array(res)
```

Recovery rate (how many percent of clients, who was in delinquency one day, are still in delinquency depending of delinquency day):

```python
plt.plot(res[1:]/res[1], 'bo')
plt.ylim(0,1)
res
```

We'll choose default definition - to be in delinquency for **more than five days**, since after five days recovery rate is decreasing slowly.

**Calculating target variable**

We exclude all applications with term more than 60 days, since company are not going to credit them in future. And we need to exclude all loans granted for last 60 days + 6 days, otherwise we can't calculate target variable

```python
applications = applications[applications['Term'] <= 60]
applications['app_dt'] = pd.to_datetime(applications['app_dt'], format = '%Y-%m-%d')
applications = applications[applications['app_dt'] <= '2018-10-10']
```

Add flag that loan was granted:

```python
applications['granted'] = 0
applications.loc[applications['app_id'].isin(status[status['decision'] == 1]['app_id']),'granted'] = 1
applications['granted'].mean()
```

Check stability of granted rate:

```python
applications['month_gr'] = applications['app_dt'].apply(lambda x: str(x.year*100+x.month))
res = applications[['month_gr', 'granted']].groupby('month_gr').mean().sort_values(by = ['month_gr'])
plt.plot(res)
plt.xticks(rotation='vertical');
plt.ylim((0,1));
```

There is a fall in June-2018, but in general it's stable and there is no trends

Leave only granted applications:

```python
applications = applications[applications['granted'] == 1]
```

There is no data for app_id = 12558 in portfolio, delete this one application (otherwise the next script has an error):

```python
applications = applications[applications['app_id'] != 12558]
```

```python
%%time
for i in applications['app_id']:
dt = pd.to_datetime(applications[applications['app_id'] == i]['app_dt'].values[0])
client_id = applications[applications['app_id'] == i]['client_id'].values[0]
term = int(applications[applications['app_id'] == i]['Term'].values[0])
a = portfolio.loc[(portfolio['report_dt'] >= dt + timedelta(term+2)) & (portfolio['report_dt'] <= dt + timedelta(term+6)) & (portfolio['client_id'] == client_id), ['client_id', 'delq']].groupby('client_id').min()
applications.loc[applications['app_id'] == i, 'target'] = a['delq'].values[0]
```

```python
applications['target'].mean()
```

```python
res = applications[['month_gr', 'target']].groupby('month_gr').mean().sort_values(by = ['month_gr'])
plt.plot(res)
plt.xticks(rotation='vertical');
plt.ylim((0, 0.3));
```

Default rate is less stable because one client can take more than one loan. And bad rate strongly depends on such clients (if they are good or bad):

```python
applications[['client_id', 'app_id']].groupby('client_id').count().reset_index().sort_values(by = 'app_id', ascending = False).head(5)
```

To avoid it we'll leave only one active loan per one client per one time moment, e.g. if client took a loan on 1st of January for 30 days, we'll exclude all granted loans of this client before 31th of January.

```python
%%time
client_id = 0
applications = applications.sort_values(by = ['client_id' , 'app_dt', 'app_id'])
applications['sample'] = 0

for i in applications['app_id']:
if client_id != applications[applications['app_id'] == i]['client_id'].values[0]:
client_id = applications[applications['app_id'] == i]['client_id'].values[0]
final_dt = pd.to_datetime(applications[applications['app_id'] == i]['app_dt'].values[0], format = '%Y-%m-%d') + timedelta(int(applications[applications['app_id'] == i]['Term'].values[0]))
applications.loc[applications['app_id'] == i, 'sample'] = 1
else:
if pd.to_datetime(applications[applications['app_id'] == i]['app_dt'].values[0], format = '%Y-%m-%d') >= final_dt:
final_dt = pd.to_datetime(applications[applications['app_id'] == i]['app_dt'].values[0], format = '%Y-%m-%d') + timedelta(int(applications[applications['app_id'] == i]['Term'].values[0]))
applications.loc[applications['app_id'] == i, 'sample'] = 1
```

```python
res = applications[applications['sample'] == 1][['month_gr', 'target']].groupby('month_gr').mean().sort_values(by = ['month_gr'])
plt.plot(res)
plt.xticks(rotation='vertical');
plt.ylim((0, 0.3));
```

Now it's better. But we can see growth in summer 2018. At the same time we saw decsrease of approval rate at the same period, it means that clients flow was worst at that time.

Now we have not too much data:

```python
res = applications[applications['sample'] == 1][['month_gr', 'target']].groupby('month_gr').count().sort_values(by = ['month_gr'])
plt.plot(res)
plt.xticks(rotation='vertical');
```

## 7. Data preprocessing

Check NaN:

```python
applications.columns
```

```python
applications[['Term', 'expired_date', 'loans_amount', 'loans_cnt',
'paid_amount', 'paid_cnt', 'pretention', 'location_country',
'location_city', 'app_dt', 'verif_data', 'verif_doc', 'verif_appl',
'verif_addres', 'doc_date', 'client_date', 'credit_status', 'rating',
'rating2', 'amount_issued', 'amount_return', 'friends']].describe()
```

**pretention:**

```python
applications[['pretention', 'month_gr']].groupby('month_gr').count()
```

Since one third of varible has missing values, we'll not use it

Check **verif_doc**:

```python
applications[['verif_doc', 'app_id']].groupby('verif_doc').count()
```

```python
applications['verif_doc'] = applications['verif_doc'].fillna(0)
```

Check **verif_appl**:

```python
applications[['verif_appl', 'app_id']].groupby('verif_appl').count()
```

```python
applications['verif_appl'] = applications['verif_appl'].fillna(0)
```

Check **location_country** and **location_city**:

```python
applications['location_country'] = applications['location_country'].fillna('n\a')
applications['location_city'] = applications['location_city'].fillna('n\a')
```

## 9. Creation of new features

Add new features: time from client registration and from issued of document (for both than more then better)

```python
applications['doc_date_i'] = ((pd.to_datetime(applications['app_dt'], format = '%Y-%m-%d')-pd.to_datetime(applications['doc_date'], format = '%Y-%m-%d')).dt.days/365.25).fillna(0)
applications['client_date_i'] = (pd.to_datetime(applications['app_dt'], format = '%Y-%m-%d')-pd.to_datetime(applications['client_date'], format = '%Y-%m-%d')).dt.days/365.25
```

Add new feature: average interest rate (monthly). According to current loan process, client accepts maximum rate that he agrees. Process won't be changed, therefore we can use such variable

```python
applications['ir'] = (applications['amount_return'] - applications['amount_issued'])/(applications['Term']/30)/applications['amount_issued']
```

```python
applications['pti'] = (applications['loans_amount'] - applications['paid_amount'] + applications['amount_return'])/applications['paid_amount']
```

## 3. Primary visual data analysis

```python
appl_short = applications[applications['sample'] == 1]
```

```python
appl_short.columns
```

```python
var = 'Term'
ratio = 15
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'loans_amount'
ratio = 200000
limit = 5
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'loans_cnt'
ratio = 100
limit = 3
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'rating'
ratio = 100
limit = 3
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'rating2'
ratio = 10
limit = 1
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'amount_issued'
ratio = 5000
limit = 3
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'friends'
ratio = 15
limit = 5
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'client_date_i'
ratio = 3
limit = 5
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'doc_date_i'
ratio = 3
limit = 5
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

```python
var = 'ir'
ratio = 0.02
limit = 15
plt.figure(1,figsize=(15,5))
plt.subplot(1,2,1)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (cnt)']).groupby('x').count().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
plt.subplot(1,2,2)
pd.DataFrame(data = np.concatenate((np.asarray([appl_short[var].apply(lambda x: limit if int(x/ratio) > limit else int(x/ratio))]).T,
appl_short[['target']]), axis = 1),
columns = ['x',
var + ' (avg target)']).groupby('x').mean().reset_index().sort_values(by = ['x']).plot(x = 'x',
kind = 'bar',
ax=plt.gca());
```

Very high interest rate means very high risk. Decreasing of risk in the last bucket is due to clients with very short term (usualy, they have much higher interest rate)

## 5. Metrics selection

We need to split clients for "good" and "bad". But we don't need to split "bad" clients from "very bad" clients. Therefore, firstly, we decline very bad clients - with very high interest rate.
After we'll use standard metric for bank scoring - roc-auc.

```python
df = appl_short[['target', 'ir', 'Term']]
df['Term_gr'] = df['Term'].apply(lambda x: 7 if x <= 7 else 29 if x <= 29 else 30 if x == 30 else 60)
df['ir_gr'] = df['ir'].apply(lambda x: 15 if int(x/0.02) > 15 else int(x/0.02))
df['cnt'] = 1
df2 = df.groupby(['Term_gr', 'ir_gr']).sum().reset_index()
df2['avg_target'] = df2['target']/df2['cnt']
```

```python
df2[['Term_gr', 'ir_gr', 'avg_target', 'cnt']]
```

```python
df = appl_short[['target', 'ir', 'Term']]
df['Term_gr'] = df['Term'].apply(lambda x: 7 if x <= 7 else 29 if x <= 29 else 30 if x == 30 else 60)
df['ir_gr'] = df['ir'].apply(lambda x: 11 if int(x/0.02) > 11 else 7 if int(x/0.02) >= 7 else 6)
df['cnt'] = 1
df2 = df.groupby(['Term_gr', 'ir_gr']).sum().reset_index()
df2['avg_target'] = df2['target']/df2['cnt']
df2[['Term_gr', 'ir_gr', 'avg_target', 'cnt']]
```

Finally, we'll decline clients with
- interest rate >= 0.13 if term >= 30
- interest rate >= 0.21 if term > 7

```python
applications['auto_decl'] = 0
applications.loc[(applications['ir'] >= 0.13) & (applications['Term'] >= 30),'auto_decl'] = 1
applications.loc[(applications['ir'] >= 0.21) & (applications['Term'] > 7),'auto_decl'] = 1
appl_short = applications[(applications['sample'] == 1) & (applications['auto_decl'] == 0)]
```

```python
applications[(applications['sample'] == 1) & (applications['auto_decl'] == 0)]['target'].mean(), \
applications[(applications['sample'] == 1) & (applications['auto_decl'] == 1)]['target'].mean(), \
applications[(applications['sample'] == 1) & (applications['auto_decl'] == 0)]['target'].count(), \
applications[(applications['sample'] == 1) & (applications['auto_decl'] == 1)]['target'].count()
```

We decline 124 observations with risk rate more than 30%

## 6. Model selection

We'll choose catboost model since it works very good with categorial variables.

```python
appl_short = appl_short.sort_values(by = ['app_dt', 'app_id'])
X_train = appl_short[['location_country','location_city', 'verif_data', 'verif_doc', 'verif_appl',
'verif_addres', 'credit_status', 'Term', 'rating', 'pti',
'rating2', 'amount_issued', 'amount_return', 'friends', 'doc_date_i','client_date_i', 'ir']].values
y_train = appl_short['target'].values
```

```python
X_train_part, X_valid, y_train_part, y_valid = \
train_test_split(X_train, y_train,
test_size=0.3, random_state=17)
```

```python
from catboost import CatBoostClassifier

model = CatBoostClassifier(random_seed = 17, thread_count = 4, verbose = False)
model.fit(X_train_part, y_train_part, cat_features = [0,1,2,3,4,5,6])
```

```python
cb_train_pred = model.predict_proba(X_valid)[:, 1]
roc_auc_score(y_valid, cb_train_pred)
```

## 8. Cross-validation and adjustment of model hyperparameters

```python
X_train = appl_short[['location_country','location_city', 'verif_data', 'verif_doc', 'verif_appl',
'verif_addres', 'credit_status', 'Term', 'rating', 'pti',
'rating2', 'amount_issued', 'amount_return', 'friends', 'doc_date_i','client_date_i', 'ir']].values
y_train = appl_short['target'].values
```

We'll find the best values of max_depth and n_estimators, we'll assume parameter cv = 3

```python
%%time
res = []
cv = 3

step = int(X_train.shape[0]/(cv + 1))

for max_depth in range(2,7,2):
for n_estimators in range(500, 2000, 500):
for i in range(1,cv+1):
X_train_part = X_train[:step*i-1,:]
y_train_part = y_train[:step*i-1]
if i < cv:
X_valid = X_train[step*i:step*(i+1),:]
y_valid = y_train[step*i:step*(i+1)]
else:
X_valid = X_train[step*i:,:]
y_valid = y_train[step*i:]

model = CatBoostClassifier(random_seed = 17, thread_count = 4, verbose = False,
max_depth = max_depth, n_estimators = n_estimators)
model.fit(X_train_part, y_train_part, cat_features = [0,1,2,3,4,5,6])

cb_train_pred = model.predict_proba(X_train_part)[:, 1]
train_res = roc_auc_score(y_train_part, cb_train_pred)

cb_valid_pred = model.predict_proba(X_valid)[:, 1]
cv_res = roc_auc_score(y_valid, cb_valid_pred)
res.append([max_depth, n_estimators, i, train_res, cv_res])
print(max_depth, n_estimators, i, train_res, cv_res)
```

```python
res = pd.DataFrame(data = res, columns = ['max_depth', 'n_estimators', 'cv_iter', 'train_res', 'cv_res'])
res[['max_depth', 'n_estimators', 'train_res', 'cv_res']].groupby(['max_depth', 'n_estimators']).\
mean().reset_index().sort_values(by = ['cv_res'], ascending = False)
```

## 10. Plotting training and validation curves

Max_depth:

```python
%%time
res = []
cv = 3

step = int(X_train.shape[0]/(cv + 1))

n_estimators = 100

for max_depth in range(2,11):
for i in range(1,cv+1):
X_train_part = X_train[:step*i-1,:]
y_train_part = y_train[:step*i-1]
if i < cv:
X_valid = X_train[step*i:step*(i+1),:]
y_valid = y_train[step*i:step*(i+1)]
else:
X_valid = X_train[step*i:,:]
y_valid = y_train[step*i:]

model = CatBoostClassifier(random_seed = 17, thread_count = 4, verbose = False,
max_depth = max_depth, n_estimators = n_estimators)
model.fit(X_train_part, y_train_part, cat_features = [0,1,2,3,4,5,6])

cb_train_pred = model.predict_proba(X_train_part)[:, 1]
train_res = roc_auc_score(y_train_part, cb_train_pred)

cb_valid_pred = model.predict_proba(X_valid)[:, 1]
cv_res = roc_auc_score(y_valid, cb_valid_pred)
res.append([max_depth, n_estimators, i, train_res, cv_res])

df_res = pd.DataFrame(data = res, columns = ['max_depth', 'n_estimators', 'cv_iter', 'train_res', 'cv_res'])
x = np.linspace(2,10,9)
y1 = df_res[['max_depth', 'n_estimators', 'train_res']].groupby(['max_depth', 'n_estimators']).\
mean()['train_res'].values
y2 = df_res[['max_depth', 'n_estimators', 'cv_res']].groupby(['max_depth', 'n_estimators']).\
mean().reset_index()['cv_res'].values
plt.plot(x, y1, '-b', label = 'train')
plt.plot(x, y2, '-r', label = 'valid')
plt.legend(loc='upper left')
```

n_estimators:

```python
%%time
res = []
cv = 3

step = int(X_train.shape[0]/(cv + 1))

max_depth = 2

for n_estimators in range(100,1500,100):
for i in range(1,cv+1):
X_train_part = X_train[:step*i-1,:]
y_train_part = y_train[:step*i-1]
if i < cv:
X_valid = X_train[step*i:step*(i+1),:]
y_valid = y_train[step*i:step*(i+1)]
else:
X_valid = X_train[step*i:,:]
y_valid = y_train[step*i:]

model = CatBoostClassifier(random_seed = 17, thread_count = 4, verbose = False,
max_depth = max_depth, n_estimators = n_estimators)
model.fit(X_train_part, y_train_part, cat_features = [0,1,2,3,4,5,6])

cb_train_pred = model.predict_proba(X_train_part)[:, 1]
train_res = roc_auc_score(y_train_part, cb_train_pred)

cb_valid_pred = model.predict_proba(X_valid)[:, 1]
cv_res = roc_auc_score(y_valid, cb_valid_pred)
res.append([max_depth, n_estimators, i, train_res, cv_res])

df_res = pd.DataFrame(data = res, columns = ['max_depth', 'n_estimators', 'cv_iter', 'train_res', 'cv_res'])
x = np.linspace(100,1400,14)
y1 = df_res[['max_depth', 'n_estimators', 'train_res']].groupby(['max_depth', 'n_estimators']).\
mean()['train_res'].values
y2 = df_res[['max_depth', 'n_estimators', 'cv_res']].groupby(['max_depth', 'n_estimators']).\
mean().reset_index()['cv_res'].values
plt.plot(x, y1, '-b', label = 'train')
plt.plot(x, y2, '-r', label = 'valid')
plt.legend(loc='upper left')
```

## 11. Prediction for test or hold-out samples

**Final model:**

```python
X_train = appl_short[['location_country','location_city', 'verif_data', 'verif_doc', 'verif_appl',
'verif_addres', 'credit_status', 'Term', 'rating', 'pti',
'rating2', 'amount_issued', 'amount_return', 'friends', 'doc_date_i','client_date_i', 'ir']].values
y_train = appl_short['target'].values

X_train_part, X_valid, y_train_part, y_valid = \
train_test_split(X_train, y_train,
test_size=0.3, random_state=17)
model = CatBoostClassifier(random_seed = 17, thread_count = 4, verbose = False,
max_depth = 2, n_estimators = 1000)
model.fit(X_train_part, y_train_part, cat_features = [0,1,2,3,4,5,6])
cb_train_pred = model.predict_proba(X_valid)[:, 1]
roc_auc_score(y_valid, cb_train_pred)
```

This result is less than we have at first iteration of model, but it seems to be more stable.

## 12. Conclusions

First, we need to set up cut-off, since the main goal of this project is to estimate potential volume of loans. To set up cut-off, we need to choose value of score according of risk level. Acceptable risk level is 2% (calculated from margin)

```python
res = []
res = np.concatenate((np.asarray([cb_train_pred]).T, np.asarray([y_valid]).T), axis = 1)
df_res = pd.DataFrame(data = res, columns = ['score', 'bad'])
df_res = df_res.sort_values(by = ['score'])
df_res['score_gr'] = df_res['score'].apply(lambda x: 'good' if x <= 0.027 else 'bad')
print(df_res[['score_gr', 'bad']].groupby('score_gr').mean(), df_res[['score_gr', 'bad']].groupby('score_gr').count())
```

Share of good clients is too small

**Conclusion:**

1. To build model only on application data is not possible, additional data should be used
2. To include in the model variable of credit history (now it's not available in credit process)
