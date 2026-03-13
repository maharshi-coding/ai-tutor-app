# Diabetes readmission

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/Diabetes_readmission_Samokhvalov_Mikhail.ipynb
Original Path: jupyter_english/projects_indiv/Diabetes_readmission_Samokhvalov_Mikhail.ipynb
Course: Machine Learning

# Diabetes readmission
by Samokhvalov Mikhail, Moscow 2018

## Research plan
- [Part 1. Dataset and features description](#part1)
- [Part 2. Exploratory data analysis](#part2)
- [Part 3. Visual analysis of the features](#part3)
- 3.1. Univariate analisys
- 3.2. Bi-variate Analysis
- 3.2.1. Continuous & Continuous
- 3.2.2. Categorical & Categorical
- 3.2.3. 3.2.3 Numeric & Categorical
- [Part 4. Patterns, insights, peculiarities of data](#part4)
- [Part 5. Data preprocessing](#part5)
- [Part 6. Feature engineering and description](#part6)
- [Part 7. Cross-validation, hyperparameter tuning](#part7)
- [Part 8. Validation and learning curves](#part8)
- [Part 9. Prediction for test samples](#part9)
- [Part 10. Model evaluation with metrics description](#part10)
- [Part 11. Conclusions](#part11)

## Part 1. Dataset and features description <a class="anchor" id="part1"></a>

### 1.1. Dataset description from Kaggle

https://www.kaggle.com/brandao/diabetes/home
#### Basic Explanaition
It is important to know if a patient will be readmitted in some hospital. The reason is that you can change the treatment, in order to avoid a readmission.

In this database, you have 3 different outputs:

* No readmission;
* A readmission in less than 30 days (this situation is not good, because maybe your treatment was not appropriate);
* A readmission in more than 30 days (this one is not so good as well the last one, however, the reason can be the state of the patient.

In this context, you can see different objective functions for the problem. You can try to figure out situations where the patient will not be readmitted, or if their are going to be readmitted in less than 30 days (because the problem can the the treatment), etc.

#### Content

"The data set represents 10 years (1999-2008) of clinical care at 130 US hospitals and integrated delivery networks. It includes over 50 features representing patient and hospital outcomes. Information was extracted from the database for encounters that satisfied the following criteria.

It is an inpatient encounter (a hospital admission).
It is a diabetic encounter, that is, one during which any kind of diabetes was entered to the system as a diagnosis.
The length of stay was at least 1 day and at most 14 days.
Laboratory tests were performed during the encounter.
Medications were administered during the encounter.
The data contains such attributes as patient number, race, gender, age, admission type, time in hospital, medical specialty of admitting physician, number of lab test performed, HbA1c test result, diagnosis, number of medication, diabetic medications, number of outpatient, inpatient, and emergency visits in the year before the hospitalization, etc."

* https://archive.ics.uci.edu/ml/datasets/Diabetes+130-US+hospitals+for+years+1999-2008

#### Source

The data are submitted on behalf of the Center for Clinical and Translational Research, Virginia Commonwealth University, a recipient of NIH CTSA grant UL1 TR00058 and a recipient of the CERNER data. John Clore (jclore '@' vcu.edu), Krzysztof J. Cios (kcios '@' vcu.edu), Jon DeShazo (jpdeshazo '@' vcu.edu), and Beata Strack (strackb '@' vcu.edu). This data is a de-identified abstract of the Health Facts database (Cerner Corporation, Kansas City, MO).

### 1.2. Feature description

First of all lets get features description from the article and convert in to **markdown** for better readable. Also lets map them to dataframe names.

| Feature name | Name in dataframe | Type | Description and values | % missing |
| Encounter ID | encounter_id | Numeric | Unique identifier of an encounter | 0 |
| Patient number | patient_nbr | Numeric | Unique identifier of a patient | 0 |
| Race | race | Nominal | Values: Caucasian, Asian, African American, Hispanic, and other | 2 |
| Gender | gender | Nominal | Values: male, female, and unknown/invalid | 0 |
| Age | age | Nominal | Grouped in 10-year intervals: [0, 10), [10, 20), . . ., [90, 100) | 0 |
| Weight | weight | Numeric | Weight in pounds. | 97 |
| Admission type | admission_type_id | Nominal | Integer identifier corresponding to 9 distinct values, for example, emergency, urgent, elective, newborn, and not available | 0 |
| Discharge disposition | discharge_disposition_id | Nominal | Integer identifier corresponding to 29 distinct values, for example, discharged to home, expired, and not available | 0 |
| Admission source | admission_source_id | Nominal | Integer identifier corresponding to 21 distinct values, for example, physician referral, emergency room, and transfer from a hospital | 0 |
| Time in hospital | time_in_hospital | Numeric | Integer number of days between admission and discharge | 0 |
| Payer code | payer_code | Nominal | Integer identifier corresponding to 23 distinct values, for example, Blue Cross\Blue Shield, Medicare, and self-pay | 52 |
| Medical specialty | medical_specialty | Nominal | Integer identifier of a specialty of the admitting physician, corresponding to 84 distinct values, for example, cardiology, internal medicine, family\general practice, and surgeon | 53 |
| Number of lab procedures | num_lab_procedures | Numeric | Number of lab tests performed during the encounter | 0 |
| Number of procedures | num_procedures | Numeric | Number of procedures (other than lab tests) performed during the encounter | 0 |
| Number of medications | num_medications | Numeric | Number of distinct generic names administered during the encounter | 0 |
| Number of outpatient visits | number_outpatient | Numeric | Number of outpatient visits of the patient in the year preceding the encounter | 0 |
| Number of emergency visits | number_emergency | Numeric | Number of emergency visits of the patient in the year preceding the encounter | 0 |
| Number of inpatient visits | number_inpatient | Numeric | Number of inpatient visits of the patient in the year preceding the encounter | 0 |
| Diagnosis 1 | diag_1 | Nominal | The primary diagnosis (coded as first three digits of ICD9); 848 distinct values | 0 |
| Diagnosis 2 | diag_2 | Nominal | Secondary diagnosis (coded as first three digits of ICD9); 923 distinct values | 0 |
| Diagnosis 3 | diag_3 | Nominal | Additional secondary diagnosis (coded as first three digits of ICD9); 954 distinct values | 1 |
| Number of diagnoses | number_diagnoses | Numeric | Number of diagnoses entered to the system | 0 |
| Glucose serum test result | max_glu_serum | Nominal | Indicates the range of the result or if the test was not taken. Values: “>200,” “>300,” “normal,” and “none” if not measured | 0 |
| A1c test result | A1Cresult | Nominal | Indicates the range of the result or if the test was not taken. Values: “>8” if the result was greater than 8%, “>7” if the result was greater than 7% but less than 8%, “normal” if the result was less than 7%, and “none” if not measured. | 0 |
| Change of medications | change | Nominal | Indicates if there was a change in diabetic medications (either dosage or generic name). Values: “change” and “no change” | 0 |
| Diabetes medications | diabetesMed | Nominal | Indicates if there was any diabetic medication prescribed. Values: “yes” and “no” | 0 |
| 24 features for medications | metformin repaglinide nateglinide chlorpropamide glimepiride acetohexamide glipizide glyburide tolbutamide pioglitazone rosiglitazone acarbose miglitol troglitazone tolazamide examide citoglipton insulin glyburide-metformin glipizide-metformin glimepiride-pioglitazone metformin-rosiglitazone metformin-pioglitazone | Nominal | For the generic names: metformin, repaglinide, nateglinide, chlorpropamide, glimepiride, acetohexamide, glipizide, glyburide, tolbutamide, pioglitazone, rosiglitazone, acarbose, miglitol, troglitazone, tolazamide, examide, sitagliptin, insulin, glyburide-metformin, glipizide-metformin, glimepiride-pioglitazone, metformin-rosiglitazone, and metformin-pioglitazone, the feature indicates whether the drug was prescribed or there was a change in the dosage. Values: “up” if the dosage was increased during the encounter, “down” if the dosage was decreased, “steady” if the dosage did not change, and “no” if the drug was not prescribed | 0 |
| Readmitted | readmitted | Nominal | Days to inpatient readmission. Values: “<30” if the patient was readmitted in less than 30 days, “>30” if the patient was readmitted in more than 30 days, and “No” for no record of readmission. | 0 |

#### Output variable
**Last one feature - readmitted feature - is a target.**

## **Part 2. Exploratory data analysis** <a class="anchor" id="part2"></a>
### 2.1. Loading data

```python
# Loading all necessary libraries:
import zipfile
import missingno as msno
from tqdm import tqdm_notebook
import itertools

import seaborn as sns
import matplotlib.pyplot as plt
%matplotlib inline

import numpy as np
import pandas as pd
from scipy.stats import chi2_contingency

from sklearn.impute import SimpleImputer #sklearn 0.20.1 is necessary
from sklearn.model_selection import train_test_split, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score
```

```python
# We can read files without unzipping!
with zipfile.ZipFile("diabetes.zip") as z:
with z.open("diabetic_data.csv") as f:
data_df = pd.read_csv(f, encoding='utf-8')
```

```python
data_df.head()
```

```python
data_df.dtypes.head()
```

```python
# Lets take a look at the data:
display(data_df.describe())
data_size = len(data_df)
print(f'Whole dataset size: {data_size}')
```

### 2.2. Train test split
As we got entire dataset here we need to split it to two parts: train and test and never spy to the test target array. We will use test target for checking our final solution.

Data could be collected in chronological order. Therefore, to make the experiment more realistic, we divide the sample in half.

```python
total_len = len(data_df)
print('Total length: ', total_len)
split_coef = 0.5
split_number = int(total_len*split_coef)
print('Split number: ', split_number)

X_train = data_df.iloc[0:split_number]
X_test = data_df.iloc[split_number:]

y_train = X_train['readmitted']
y_test = X_test['readmitted']

X_train = X_train.drop(columns='readmitted')
X_test = X_test.drop(columns='readmitted')

print(X_train.shape, y_train.shape)
print(X_test.shape, y_test.shape)

# Also for the baseline lets convert y_target to numeric in this way:
y_target = y_train.map({'<30':0, '>30':1, 'NO':2})
y_test = y_test.map({'<30':0, '>30':1, 'NO':2})
```

### 2.3. Filling missings

```python
# Lets check missings:
for col in data_df:
uniq_values = data_df[col].unique()
if '?' in uniq_values:
num_of_nan = len(data_df[data_df[col]=='?'])
print(f'Feature {col}, missed: {num_of_nan} or {num_of_nan/data_size*100:.2f} %')
# adding here uniq_values we can see all of them. Ans see missings as '?' always
```

Here we found missing values in dataset marked as **'?'**. Also there are '?' not only in features as shown in the article, but also in `diag_1` and `diag_2` features too!

There are several methods to fill in the missings:
1. drop nans
2. fill with constant (0, -1, ...)
3. fill with mean/median/moda
4. groupby and fill with mean/median of the group
5. built model to predict missings
6. some methods can handle missings!

Good example of using different methods:
https://towardsdatascience.com/working-with-missing-data-in-machine-learning-9c0a430df4ce

**Important moment - we can't just drop missings in data - model should be able to work with missing values because we can't ignore any new patient just because he/she didn't indicate weight or race in the questionary.**

```python
# interesting method to visualize missings:

columns_nans = ['race', 'weight', 'payer_code', 'medical_specialty', 'diag_1', 'diag_2', 'diag_3']

imp = SimpleImputer(missing_values='?', strategy='constant', fill_value=np.nan)

data_df_nans = pd.DataFrame(imp.fit_transform(data_df[columns_nans]), columns=columns_nans)
msno.matrix(data_df_nans);
msno.heatmap(data_df_nans);
```

There is no correlation in missings (they doesn't appear simultaneously).
Three theatures have too many missings: weight, payer_code, medical_specialty - from 40 to 97%.
So it can be unsafe to fill them with any values.
**Let's ignore them for baseline** and try different filling methods at tuning stage.

Let's try different methods - start from the simplest one for baseline model and come back here and try another methods for more complex model. We will change data always in new columns and drop excess data before using each model.

- Baseline model: fill with most frequent value

```python
%%time
columns_nans = ['race', 'diag_1', 'diag_2', 'diag_3']
imp_most_frequent = SimpleImputer(missing_values='?', strategy='most_frequent', verbose=1)
X_train_nan_most_frequent = pd.DataFrame(imp_most_frequent.fit_transform(X_train[columns_nans]),
columns=[el+'_mf' for el in columns_nans] )
X_test_nan_most_frequent = pd.DataFrame(imp_most_frequent.transform(X_test[columns_nans]),
columns=[el+'_mf' for el in columns_nans] )

X_train = pd.concat([X_train, X_train_nan_most_frequent], axis=1)
X_test = pd.concat([X_test.reset_index(drop=True), X_test_nan_most_frequent], axis=1).set_index(X_test.index)
```

## Part 3. Visual analysis of the features <a class="anchor" id="part3"></a>

### 3.1. Univariate analisys
Lets do some data analisys. First of all we check numeric data, then categorical and finish with cat vs num data comparison.
Very good example about general methods for data analisys: # https://www.analyticsvidhya.com/blog/2016/01/guide-data-exploration/

```python
features_numeric = X_train.select_dtypes(include='int64').columns
features_categorical = X_train.select_dtypes(include='object').columns

print(features_numeric)
print(len(features_numeric))
print(features_categorical)
print(len(features_categorical))
```

**Lets take a look at numeric first ...**

```python
X_train[features_numeric].drop(columns=['encounter_id', 'patient_nbr']).describe()
```

```python
for col in features_numeric[2:]:
print(col)
print(X_train[col].value_counts())
print(X_test[col].value_counts())
```

```python
%%time
sns.set(style="whitegrid")
sns.set(rc={'figure.figsize':(10,10)})
#sns.boxplot(data=X_train[features_numeric].drop(columns=['encounter_id', 'patient_nbr']).iloc[:,[1,2,3,4,6,10]]);
#sns.swarmplot(data=X_train[features_numeric].drop(columns=['encounter_id', 'patient_nbr']).iloc[::100,[1,2,3,4,6,10]], color=".25")
sns.violinplot(data=X_train[features_numeric].drop(columns=['encounter_id', 'patient_nbr']).iloc[:,0:5]);
#sns.boxplot(data=X_train[features_numeric].drop(columns=['encounter_id', 'patient_nbr']).iloc[:,[0,5,7,8,9]]);
#sns.swarmplot(data=X_train[features_numeric].drop(columns=['encounter_id', 'patient_nbr']).iloc[::100,[0,5,7,8,9]], color=".25")
plt.figure()
sns.violinplot(data=X_train[features_numeric].drop(columns=['encounter_id', 'patient_nbr']).iloc[:,5:10]);
```

```python
sns.set(rc={'figure.figsize':(15,5)})
for axis in range(0,len(X_train[features_numeric[2:]].columns),3):
cols = X_train[features_numeric[2:]].columns[axis:axis+3]
f, axes = plt.subplots(1, 3, sharex=True)
palette = "crimson"
sns.distplot( X_train[cols[0]].values , color=palette, ax=axes[0]);
try:
sns.distplot( X_train[cols[1]].values , color=palette, ax=axes[1], label=cols[1]);
except:
pass
try:
sns.distplot( X_train[cols[2]].values , color=palette, ax=axes[2], label=cols[2]);
except:
pass
```

**... and categorical.**

```python
features_ignored = ['weight', 'payer_code', 'medical_specialty', 'diag_1', 'diag_2', 'diag_3', 'race']
X_train_categorical = X_train[features_categorical].drop(columns=features_ignored)
features_categorical = [el for el in features_categorical if el not in features_ignored]
```

```python
for axis in range(0,len(X_train_categorical.columns[:-3]),3):
cols = X_train_categorical.columns[axis:axis+3]
f, axes = plt.subplots(1, 3)
palette = "crimson"
sns.countplot(X_train_categorical[cols[0]] , color=palette, ax=axes[0]);
try:
sns.countplot(X_train_categorical[cols[1]] , color=palette, ax=axes[1]);
except:
pass
try:
sns.countplot(X_train_categorical[cols[2]] , color=palette, ax=axes[2]);
except:
pass
```

```python
X_train_categorical[['diag_1_mf', 'diag_2_mf', 'diag_3_mf']] \
.apply(pd.Series.value_counts) \
.sort_values('diag_3_mf', ascending=False)
```

```python
for col in X_train_categorical.columns[:-3]:
print(col, X_train_categorical[col].unique())
print('---'*10)
print(X_train_categorical[col].value_counts())
```

```python
constant_features = ['examide', 'citoglipton', 'glimepiride-pioglitazone', 'metformin-rosiglitazone', 'metformin-pioglitazone',
'acetohexamide',
'tolbutamide', 'miglitol', 'troglitazone', 'tolazamide', 'glipizide-metformin']
for col in constant_features:
print(col)
print(X_train[col].value_counts())
print(X_test[col].value_counts())
print('---'*10)
```

**First of all - we can drop this columns: all columns has the same value (`No`). There are only 1-2 values == `Steady`**

```python
X_train.drop(columns=constant_features, inplace=True)
X_train_categorical.drop(columns=constant_features, inplace=True)
X_test.drop(columns=constant_features, inplace=True)

features_categorical = [el for el in features_categorical if el not in constant_features]
```

### 3.2. Bi-variate Analysis

#### 3.2.1. Continuous & Continuous

```python
%%time
# this action can take about minute
sns.pairplot( X_train[features_numeric].assign(target=y_target.values) );
```

```python
sns.heatmap(X_train[features_numeric].assign(target=y_target.values).corr(), annot=True);
```

#### 3.2.2. Categorical & Categorical

```python
df = X_train_categorical[features_categorical].assign(target=y_train.values)
df.head()
#df.set_index('target').T.plot(kind='bar', stacked=True)
#df.plot(x='target',kind='bar', stacked=True)
```

```python
%%time
chi_table_prob = pd.DataFrame(np.zeros((len(df.columns), len(df.columns))),index=df.columns, columns=df.columns)
chi_table_val =pd.DataFrame(np.zeros((len(df.columns), len(df.columns))),index=df.columns, columns=df.columns)
for col_ind, col in tqdm_notebook(enumerate(df.columns)):
for row_ind, row in enumerate(df.columns):
chi = chi2_contingency(pd.crosstab(df[row], df[col], margins = True))
chi_table_prob.iloc[row_ind, col_ind] = chi[1]
chi_table_val.iloc[row_ind, col_ind] = chi[0]
pd.crosstab(df[row], df[col], margins = True)
```

```python
sns.set(rc={'figure.figsize':(15,15)})
sns.heatmap(chi_table_prob.round(2), annot=True);
```

This information shows dependencies between categorical features. There are also much stronger methods as Cramer V. It can be researched in further works.

#### 3.2.3. Numeric & Categorical

There are some test for exploring dependencies between numeric and categorical data, such Z-test or ANOVA test. But all of them has important assumptions that must be satisfied. One of them - Each data sample is from a normally distributed population. As a lot of our data are not from normally distribution, so we can't use it in this way.
Maybe we can implement it if make some data modification transforming it to normal, but it is the plan for further research.

## Part 4. Patterns, insights, pecularities of data <a class="anchor" id="part4"></a>

Let's sum up conclusions about data, based on previous parts.

Fields `encounter_id`, `patient_nbr` must be dropped, because it is just patient number, algorithms can overfit on them
There are a lot of missings in the fields `weight`, `payer_code`, `medical_specialty`. So we need to force it - use boosting (they can work with nans and '?'), drop them or fill them.

A lot of features disturbed non-normally. So 'classic' methods fill loose accuracy here. Good idea for further reserch - try to transform them to normal (maybe using log).

There are no any significant correlation between target and any of numeric features, but there are for some categorical. We need to choose categoricals carefully!

There are high correlations between some numeric/categorical features, so we can drop a lot of them with no loosing accuracy.

Need to pay special attention to `diag_` categories - they have a lot values, so using one-hot-encoding increase number of features greatly.

**This is a multiclass problem, so we need to choose suitable methods.
Good one can be KNN and trees.**

## Part 5. Dataset and features description <a class="anchor" id="part5"></a>

### 5.1. Prepare data for KNN method

#### Drop seatures we would not use for baseline

```python
X_train_knn = X_train.drop(['encounter_id', 'patient_nbr', 'race', 'weight', 'payer_code', 'medical_specialty',
'diag_1', 'diag_2', 'diag_3'], axis=1)
X_test_knn = X_test.drop(['encounter_id', 'patient_nbr', 'race', 'weight', 'payer_code', 'medical_specialty',
'diag_1', 'diag_2', 'diag_3'], axis=1)
```

#### Convert string types to numeric: age, gender

```python
X_train_knn['age_num'] = X_train_knn['age'].apply(lambda x: int(x[1]) )
X_train_knn.drop('age', axis=1, inplace=True)

X_test_knn['age_num'] = X_test_knn['age'].apply(lambda x: int(x[1]) )
X_test_knn.drop('age', axis=1, inplace=True)
```

```python
# gender outlier:
# we have 1 outlier here gender==Unknown/Invalid. 1 value is not important,
# but for not to create additional dimension lets change it to Male, as his features a bit closer to Male mean than Female
X_train_knn.iloc[X_train_knn[X_train_knn['gender']=='Unknown/Invalid'].index, 0] = 'Male'
X_train_knn['gender_num'] = X_train_knn['gender'].apply(lambda x: 0 if x=='Male' else 1)
X_train_knn.drop('gender', axis=1, inplace=True)
```

```python
X_test_knn.loc[X_test_knn.gender == 'Unknown/Invalid', 'gender'] = 'Male'
X_test_knn['gender_num'] = X_test_knn['gender'].apply(lambda x: 0 if x=='Male' else 1)
X_test_knn.drop('gender', axis=1, inplace=True)
```

```python
X_train_knn_tmp = X_train_knn.iloc[:,0:11].assign(age_num=X_train_knn['age_num'],
gender_num=X_train_knn['gender_num'])

X_test_knn = X_test_knn.iloc[:,0:11].assign(age_num=X_test_knn['age_num'],
gender_num=X_test_knn['gender_num'])
```

#### Select medical supplieses (medications) that affect accuracy

```python
# list of features for adding them to X_train
medicals = X_train_knn.columns[11:25]
print(medicals)
medicals_list = []
for ind, med in enumerate(medicals):
medicals_list.append( pd.get_dummies(X_train_knn[med], prefix=med) )

medicals_list_test = []
for ind, med in enumerate(medicals):
medicals_list_test.append( pd.get_dummies(X_test[med], prefix=med) )
```

First of all lets start from using numerical features + age and gender only.
Result accuracy for KNN - 0.48.

Finding optimal neibhoor value = 70 give us baseline - **accuracy 0.57**

Also lets test what if delete some of the numerical features - tried one by one, all them increasing accuracy **except gender!** So maybe we will drop this feature.
Also checked do we need to scale binary features - it doesn't affect results, as expected.
After than lets add features one by one, checking accuracy - does it incease or decrease it.

Using KNN on all features give worse result, so lets repeat adding categorial feature one by one.

**Not all result shown here because of rewriting code for every experiment and so as not to take a lot of space.**

Shown final results.

```python
%%time
# this cell takes 35 mins to find optimal set of medical supplies features

# medicals_optimal = [0,3,5,6,11,13]
# subsets = []
# for el in range(2, len(medicals_optimal)+1):
# for subset in itertools.combinations(medicals_optimal, el):
# subsets.append(subset)

# for subset in subsets:
# print(subset)
# X_train_knn_tmp_cat = X_train_knn_tmp
# for el in subset:
# X_train_knn_tmp_cat = pd.concat( [X_train_knn_tmp_cat, medicals_list[el]], axis=1)
# print(X_train_knn_tmp_cat.columns)

# scaler = StandardScaler()
# X_train_knn_scaled = scaler.fit_transform(X_train_knn_tmp_cat.drop('gender_num', axis=1))

# print(X_train_knn_scaled.shape)

# X_tr, X_holdout, y_tr, y_holdout = train_test_split(X_train_knn_scaled, y_target, test_size=0.3,
# random_state=17)

# n_neib = 70
# neigh = KNeighborsClassifier(n_neighbors=n_neib)
# neigh.fit(X_tr, y_tr)
# knn_pred = neigh.predict(X_holdout)
# res = accuracy_score(y_holdout, knn_pred)
# print(res)
```

```python
# The optimal set of medical supplies:
medicals_optimal = [3,11,13]
for el in medicals_optimal:
X_train_knn_tmp = pd.concat( [X_train_knn_tmp, medicals_list[el]], axis=1)
X_train_knn_tmp.columns
```

#### Check other features

Trying to use all of the diagnoses as dummy variables - bad idea. It took a lot of time for computation and give no effect - accuracy is lower than without diagnoses.
So the idea - use only top N most frequent diagnoses and set "Other" category for all the others.

```python
# For now we need to check all other categorical features:
non_medicals = ['race_mf', 'diag_1_mf', 'diag_2_mf', 'diag_3_mf', 'change', 'diabetesMed']
non_medicals_list = []
for ind, el in enumerate(non_medicals):
non_medicals_list.append( pd.get_dummies(X_train_knn[el], prefix=el) )
```

```python
top_diag1 = X_train_knn['diag_1_mf'].value_counts()[0:20]
top_diag1.index
```

```python
# %%time

# This cell takes a lot of time again - it's just example how to test features with a lot of categories

# for num_feat in [125, 225]:
# top_diag1 = X_train_knn['diag_1_mf'].value_counts()[0:num_feat]
# dum = X_train_knn['diag_1_mf'].apply(lambda x: x if x in top_diag1.index else 'other')
# dum = pd.get_dummies(dum, prefix='diag_1')
# X_train_knn_tmp_cat = pd.concat( [X_train_knn_tmp, dum], axis=1)
# print(X_train_knn_tmp_cat.columns)

# scaler = StandardScaler()
# X_train_knn_scaled = scaler.fit_transform(X_train_knn_tmp_cat.drop('gender_num', axis=1))

# print(X_train_knn_scaled.shape)

# X_tr, X_holdout, y_tr, y_holdout = train_test_split(X_train_knn_scaled, y_target, test_size=0.3,
# random_state=17)

# n_neib = 70
# neigh = KNeighborsClassifier(n_neighbors=n_neib)
# neigh.fit(X_tr, y_tr)
# knn_pred = neigh.predict(X_holdout)
# res = accuracy_score(y_holdout, knn_pred)
# print(res)
```

#### Conlusion

Looks like KNN is not really good for this task. We have a lot of categorical features, some of the with really big number of categories. This creates data of big dimentionality. As we think that some features still can be helpful KNN loose accuracy on them.

The best achived result for KNN: **accuracy = 0.575**

Lets try another algorithm whichis good with categorical features and good with big dimention data.
I suppose to use some boosting and start from **CatBoost**.

Optimal solution:

```python
%%time
medicals_optimal = [3,11,13]
for el in medicals_optimal:
X_train_knn_tmp = pd.concat( [X_train_knn_tmp, medicals_list[el]], axis=1)

print(X_train_knn_tmp.columns)
print(X_train_knn_tmp.shape)

scaler = StandardScaler()
X_train_knn_scaled = scaler.fit_transform(X_train_knn_tmp.drop('gender_num', axis=1))

X_tr_knn, X_holdout_knn, y_tr, y_holdout = train_test_split(X_train_knn_scaled, y_target, test_size=0.3,
random_state=17)

n_neib = 70
neigh = KNeighborsClassifier(n_neighbors=n_neib)
neigh.fit(X_tr_knn, y_tr)
knn_pred = neigh.predict(X_holdout_knn)
res_knn = accuracy_score(y_holdout, knn_pred)
print(res_knn)
```

```python
# Prepare test data for final check
medicals_optimal = [3,11,13]
for el in medicals_optimal:
X_test_knn = pd.concat( [X_test_knn, medicals_list_test[el]], axis=1)
X_test_knn = scaler.transform(X_test_knn.drop('gender_num', axis=1))
```

```python
# # Use for CV
# res_knn_cv = []

# kf = KFold(n_splits = 5, random_state = 17, shuffle = True)
# for i, (train_index, test_index) in enumerate(kf.split(X_train_knn_scaled)):

# # Create data for this fold
# y_train_knn_cv, y_valid_knn_cv = y_target.iloc[train_index], y_target.iloc[test_index]
# X_train_knn_cv, X_valid_knn_cv = X_train_knn_scaled[train_index,:], X_train_knn_scaled[test_index,:]
# print( "\nFold ", i)

# # Run model for this fold
# neigh.fit(X_train_knn_cv, y_train_knn_cv)
# pred = neigh.predict(X_valid_knn_cv)
# res_knn_cv.append(accuracy_score(pred,y_valid_knn_cv))
```

```python
# np.mean(res_knn_cv)
```

### 5.2. Prepare data for CatBoost method

```python
from catboost import CatBoostClassifier, Pool, cv
```

Feature importance show features that can be dropped without loss of accuracy.

```python
# initialize data
X_train_catboost = X_train.drop(['race', 'diag_1', 'diag_2', 'diag_3', 'encounter_id', 'patient_nbr', 'change',
'glyburide-metformin', 'acarbose', 'chlorpropamide',
'pioglitazone', 'rosiglitazone', 'nateglinide', 'glyburide',
'metformin', 'diag_3_mf', 'A1Cresult', 'gender',
'admission_type_id', 'num_medications', 'insulin',
'admission_source_id', 'num_procedures', 'weight'], axis=1)
X_test_catboost = X_test.drop(['race', 'diag_1', 'diag_2', 'diag_3','encounter_id', 'patient_nbr', 'change',
'glyburide-metformin', 'acarbose', 'chlorpropamide',
'pioglitazone', 'rosiglitazone', 'nateglinide', 'glyburide',
'metformin', 'diag_3_mf', 'A1Cresult', 'gender',
'admission_type_id', 'num_medications', 'insulin',
'admission_source_id', 'num_procedures', 'weight'], axis=1)

X_tr_catboost, X_holdout_catboost, y_tr, y_holdout = train_test_split(X_train_catboost, y_target, test_size=0.3,
random_state=17)

# save indeces of categorical data
cat_features_catboost = []
for ind, el in enumerate(X_tr_catboost.columns):
if el in X_tr_catboost.select_dtypes(include='object').columns:
cat_features_catboost.append(ind)
```

```python
model = CatBoostClassifier(iterations=50, depth=6, learning_rate=0.9, loss_function='MultiClass',
verbose=10, random_seed=17, custom_loss='Accuracy')

#train the model
train_pool = Pool(X_tr_catboost, y_tr, cat_features=cat_features_catboost)
model.fit(train_pool)

# make the prediction using the resulting model
catboost_pred = model.predict(X_holdout_catboost)
# preds_proba = model.predict_proba(X_holdout)
res = accuracy_score(y_holdout, catboost_pred)
print(res)
```

```python
# # Use for CV
# params = {'iterations':50,
# 'depth':6,
# 'learning_rate':0.9,
# 'loss_function':'MultiClass',
# 'random_seed':17}

# res_catboost_cv = []

# kf = KFold(n_splits = 5, random_state = 17, shuffle = True)
# for i, (train_index, test_index) in enumerate(kf.split(X_train_catboost)):

# # Create data for this fold
# y_train_cb_cv, y_valid_cb_cv = y_target.iloc[train_index], y_target.iloc[test_index]
# X_train_cb_cv, X_valid_cb_cv = X_train_catboost.iloc[train_index,:], X_train_catboost.iloc[test_index,:]
# print( "\nFold ", i)

# # Run model for this fold
# fit_model = model.fit( X_train_cb_cv, y_train_cb_cv,
# cat_features=cat_features_catboost
# )

# # Generate validation predictions for this fold
# pred_cb_cv = fit_model.predict(X_valid_cb_cv)
# res_catboost_cv.append(accuracy_score(pred_cb_cv,y_valid_cb_cv))
```

```python
#np.mean(res_catboost_cv)
```

```python
# Feature importance for CatBoost

def plot_feature_importances_catboost(data : pd.DataFrame, model, train_pool):
feature_scores = pd.DataFrame(list(zip(data.dtypes.index, model.get_feature_importance(train_pool))),
columns=['Feature','Score'])
feature_scores = feature_scores.sort_values(by='Score', ascending=False)

plt.rcParams["figure.figsize"] = (15,7)
ax = feature_scores.plot('Feature', 'Score', kind='bar', color='c')
ax.set_title("Catboost Feature Importance Ranking", fontsize = 14)
ax.set_xlabel('')

rects = ax.patches

# get feature score as labels round to 2 decimal
labels = feature_scores['Score'].round(2)

for rect, label in zip(rects, labels):
height = rect.get_height()
ax.text(rect.get_x() + rect.get_width()/2, height + 0.35, label, ha='center', va='bottom')

plt.show()

plot_feature_importances_catboost(X_tr_catboost, model, train_pool)
```

```python
conf_matrix = pd.DataFrame({'true':y_holdout.values, 'pred':catboost_pred.flatten()})

pd.crosstab(conf_matrix['true'], conf_matrix['pred'])
```

### 5.3. Prepare data for LightGBM method

```python
import lightgbm as lgb
from sklearn.preprocessing import LabelEncoder

X_train_lgb = pd.DataFrame.copy(X_train)
X_train_lgb.select_dtypes(include='object').columns

X_train_lgb = X_train_lgb.drop(['race', 'diag_1', 'diag_2', 'diag_3', 'encounter_id', 'patient_nbr', 'change',
'glyburide-metformin', 'acarbose', 'chlorpropamide',
'pioglitazone', 'rosiglitazone', 'nateglinide', 'glyburide',
'metformin', 'diag_3_mf', 'A1Cresult', 'gender',
'admission_type_id', 'num_medications', 'insulin'], axis=1)
X_test_lgb = X_test.drop(['race', 'diag_1', 'diag_2', 'diag_3', 'encounter_id', 'patient_nbr', 'change',
'glyburide-metformin', 'acarbose', 'chlorpropamide',
'pioglitazone', 'rosiglitazone', 'nateglinide', 'glyburide',
'metformin', 'diag_3_mf', 'A1Cresult', 'gender',
'admission_type_id', 'num_medications', 'insulin'], axis=1)
```

```python
encoder = LabelEncoder()
cat_features_lgb = []
for ind, el in enumerate(X_train_lgb.columns):
if el in X_train_lgb.select_dtypes(include='object').columns:
cat_features_lgb.append(el)

for el in cat_features_lgb:
encoder = encoder.fit(X_train_lgb[el])
X_train_lgb[el] = encoder.transform(X_train_lgb[el])

X_tr_lgb, X_holdout_lgb, y_tr, y_holdout = train_test_split(X_train_lgb, y_target, test_size=0.3,
random_state=17)

for ind, el in enumerate(X_tr_lgb.columns):
if el in X_tr_lgb.select_dtypes(include='object').columns:
X_tr_lgb[el] = X_tr_lgb[el].astype('category')
X_holdout_lgb[el] = X_holdout_lgb[el].astype('category')
```

```python
param = {'objective': 'multiclass',
'num_class': 3,
'num_leaves':20,
'num_trees':200,
'metric': ['multi_error']}

lgb_train = lgb.Dataset(X_tr_lgb, label=y_tr)
lgb_val = lgb.Dataset(X_holdout_lgb, label=y_holdout, reference=lgb_train)

# model = lgb.train(params, lgb_train,
# valid_sets=[lgb_val],
# verbose_eval=True)
lgb_model = lgb.train(param, lgb_train, 10000, valid_sets=[lgb_train], verbose_eval=20)
```

```python
lgb_pred = lgb_model.predict(X_holdout)
lgb_pred = np.argmax(lgb_pred,axis=1)
accuracy_score(y_holdout, lgb_pred)
```

```python
# # Used for CV
# for ind, el in enumerate(X_train_lgb.columns):
# if el in X_train_lgb.select_dtypes(include='object').columns:
# X_train_lgb[el] = X_train_lgb[el].astype('category')

# lgb_cv = lgb.Dataset(X_train_lgb, label=y_tr)
# # Use for CV

# res_lgb_cv = []

# kf = KFold(n_splits = 5, random_state = 17, shuffle = True)
# for i, (train_index, test_index) in enumerate(kf.split(X_train_lgb)):

# # Create data for this fold
# y_train_lgb_cv, y_valid_lgb_cv = y_target.iloc[train_index], y_target.iloc[test_index]
# X_train_lgb_cv, X_valid_lgb_cv = X_train_lgb.iloc[train_index,:], X_train_lgb.iloc[test_index,:]
# print( "\nFold ", i)
# lgb_cv = lgb.Dataset(X_train_lgb_cv, label=y_train_lgb_cv)
# lgb_cv_val = lgb.Dataset(X_valid_lgb_cv, label=y_valid_lgb_cv)
# # Run model for this fold
# fit_model = None
# fit_model = lgb.train(param, lgb_cv, valid_sets=[lgb_cv_val], verbose_eval=20)

# # Generate validation predictions for this fold
# pred_lgb_cv = fit_model.predict(X_valid_lgb_cv)
# pred_lgb_cv = np.argmax(pred,axis=1)
# res_lgb_cv.append(accuracy_score(pred,y_valid_lgb_cv))
```

```python
# np.mean(res_lgb_cv)
```

```python
# Prepare test data for final check

for el in cat_features_lgb:
encoder = encoder.fit(X_test_lgb[el])
X_test_lgb[el] = encoder.transform(X_test_lgb[el])

for ind, el in enumerate(X_test_lgb.columns):
if el in X_test_lgb.select_dtypes(include='object').columns:
X_test_lgb[el] = X_test_lgb[el].astype('category')
```

## Part 6. Feature engineering and description <a class="anchor" id="part6"></a>

It looks like we find some optimization minimum - all three algorithms gave same result (0.57-0.60).
So as adding/deleting features and tuning hyperparameters give no positive effect, let's try to create new features.

Some simple way for it - create some useful combinations of the existing features.

P.S. There are no code for every usage of new generated features - just results (as to make project more readable).

First idea - as we drop a lot of medications features, lets create sum of them - how many of them patient used.
Also we can try create binary features - did he used this mediacation (just 0 or 1) - Perhaps some drugs are prescribed at various stages of diabetes.

```python
# Summary od medicals
medicals = ['metformin', 'repaglinide', 'nateglinide', 'chlorpropamide',
'glimepiride', 'glipizide', 'glyburide', 'pioglitazone',
'rosiglitazone', 'acarbose', 'insulin', 'glyburide-metformin']
X_med = pd.DataFrame()
for el in medicals:
X_med[el+'_usage'] = X_train[el].map({'No':0, 'Steady':1, 'Up':1, 'Down':1})

X_med['med_sum'] = X_med.sum(axis=1)
```

Second idea is more brut force. lets create different polynomial features from ours. We didn't find linear dependencies but it can be non-linear. Polynomial features can help us chech this hypothesis.

```python
# Creating polynomial features
from sklearn.preprocessing import PolynomialFeatures
poly = PolynomialFeatures(2)
features_numeric[2:]
X_poly = pd.DataFrame(poly.fit_transform(X_train[features_numeric[2:]]))
```

```python
X_poly_best = X_poly[[23, 48]]
```

Third idea - let's try change feature distribution. Using log can reduce it skewness.

```python
X_log = X_train[features_numeric].drop(['encounter_id', 'patient_nbr'], axis=1).applymap(lambda x: np.log(x+1))
```

#### Checking CatBoost

```python
# initialize data

X_train_catboost = X_train.drop(['race', 'diag_1', 'diag_2', 'diag_3', 'encounter_id', 'patient_nbr', 'change',
'glyburide-metformin', 'acarbose', 'chlorpropamide',
'pioglitazone', 'rosiglitazone', 'nateglinide', 'glyburide',
'metformin', 'diag_3_mf', 'A1Cresult', 'gender',
'admission_type_id', 'num_medications', 'insulin'], axis=1)
X_train_catboost = pd.concat([X_train_catboost, X_log], axis=1)

X_test_catboost = X_test.drop(['race', 'diag_1', 'diag_2', 'diag_3','encounter_id', 'patient_nbr'], axis=1)
# TODO: add the same action for test

X_tr, X_holdout, y_tr, y_holdout = train_test_split(X_train_catboost, y_target, test_size=0.3,
random_state=17)

# save indeces of categorical data
X_tr.select_dtypes(include='object').columns
cat_features_catboost = []
for ind, el in enumerate(X_tr.columns):
if el in X_tr.select_dtypes(include='object').columns:
cat_features_catboost.append(ind)
X_train_catboost.columns
```

```python
model_catboost = CatBoostClassifier(iterations=50, depth=6, learning_rate=0.9, loss_function='MultiClass',
verbose=10, random_seed=17, custom_loss='Accuracy')

#train the model
train_pool = Pool(X_tr, y_tr, cat_features=cat_features_catboost)
model_catboost.fit(train_pool)

# make the prediction using the resulting model
catboost_pred = model_catboost.predict(X_holdout)
# preds_proba = model.predict_proba(X_holdout)
res = accuracy_score(y_holdout, catboost_pred)
print(res)
#print("proba = ", preds_proba)
```

```python
plot_feature_importances_catboost(X_tr, model_catboost, train_pool)
```

#### Checking LightGBM

```python
X_train_lgb = pd.DataFrame.copy(X_train)
X_train_lgb.select_dtypes(include='object').columns

X_train_lgb = X_train_lgb.drop(['race', 'diag_1', 'diag_2', 'diag_3', 'encounter_id', 'patient_nbr', 'change',
'glyburide-metformin', 'acarbose', 'chlorpropamide',
'pioglitazone', 'rosiglitazone', 'nateglinide', 'glyburide',
'metformin', 'diag_3_mf', 'A1Cresult', 'gender',
'admission_type_id', 'num_medications', 'insulin'], axis=1)
X_test_lgb = X_test.drop(['race', 'diag_1', 'diag_2', 'diag_3', 'encounter_id', 'patient_nbr', 'change',
'glyburide-metformin', 'acarbose', 'chlorpropamide',
'pioglitazone', 'rosiglitazone', 'nateglinide', 'glyburide',
'metformin', 'diag_3_mf', 'A1Cresult', 'gender',
'admission_type_id', 'num_medications', 'insulin'], axis=1)

X_train_lgb = pd.concat([X_train_lgb, X_log], axis=1)
```

```python
encoder = LabelEncoder()
cat_features_lgb = []
for ind, el in enumerate(X_train_lgb.columns):
if el in X_train_lgb.select_dtypes(include='object').columns:
cat_features_lgb.append(el)

for el in cat_features_lgb:
encoder = encoder.fit(X_train_lgb[el])
X_train_lgb[el] = encoder.transform(X_train_lgb[el])

X_tr, X_holdout, y_tr, y_holdout = train_test_split(X_train_lgb, y_target, test_size=0.3,
random_state=17)

# save indeces of categorical data
X_tr.select_dtypes(include='object').columns

for ind, el in enumerate(X_tr.columns):
if el in X_tr.select_dtypes(include='object').columns:
X_tr[el] = X_tr[el].astype('category')
X_holdout[el] = X_holdout[el].astype('category')
```

```python
param = {'objective': 'multiclass',
'num_class': 3,
'num_leaves':20,
'num_trees':200,
'metric': ['multi_error']}
lgb_train = lgb.Dataset(X_tr, label=y_tr)
lgb_val = lgb.Dataset(X_holdout, label=y_holdout, reference=lgb_train)

lgb_model = lgb.train(param, lgb_train, 1000, valid_sets=[lgb_train], verbose_eval=20)
```

```python
lgb_pred = lgb_model.predict(X_holdout)
lgb_pred = np.argmax(lgb_pred,axis=1)
accuracy_score(y_holdout, lgb_pred)
```

### Conclusion
So all attempts to find useful features not really succeed. This may be for two reasons:
1. Need to try more approaches, For example, groupby categorical features and encode with some numeric characteristic for this group. This let to drop categorical and use numeric instead.
2. Data is too poor, and it's really difficult to increase accuracy without using additional data.

## Part 7. Cross-validation, hyperparameter tuning <a class="anchor" id="part7"></a>

As we already did hyperparameter tuning at previuos stages (cv also), let's try blending now. We will use probabilities of CatBoost and LightGBM. The idea of this action - if one of the algorithms predicts wrong on some data sample another maybe not! So if we take mean (or anothe proportion) of answers we increase probability of right answer.

```python
%%time
preds_proba_catboost = model.predict_proba(X_holdout_catboost)
lgb_pred = lgb_model.predict(X_holdout_lgb)
pred_knn = neigh.predict(X_holdout_knn)
pred_knn_dummy = pd.get_dummies(pred_knn).values
```

```python
best_a = 0
best_b = 0
best_c = 0
best_acc = 0
for c in tqdm_notebook(range(0,100,5)):
for a in range(0,101):
for b in range(0,101):
blended_proba = (a/100*preds_proba_catboost + b/100*lgb_pred + c/100*pred_knn_dummy) / 3

blend_pred = np.argmax(blended_proba,axis=1)
acc = accuracy_score(y_holdout, blend_pred)
if acc > best_acc:
best_a = a
best_b = b
best_acc = acc
best_c = c
print(best_a, best_b, best_c, best_acc)
```

This means using knn doesn't improve results. So lets check one more time using only CatBoost and LGBM

```python
best_a = 0
best_acc = 0
for a in range(0,101):
blended_proba = (a/100*preds_proba_catboost + (100-a)/100*lgb_pred) / 2
blend_pred = np.argmax(blended_proba,axis=1)
acc = accuracy_score(y_holdout, blend_pred)
if acc > best_acc:
best_a = a
best_b = b
best_acc = acc
best_c = c
print(best_a, best_acc)
```

So the best parameters are:

**prediction = (0.47\*CatBoost + 0.82\*LGB + c\*KNN) / 3**

But it's a bit strange, because we can get probability more than 1.0 (the algorithm is absolutely confident in its decision :) )

So let's use it without such hack.

**prediction = (0.31\*CatBoost + 0.69\*LGB) / 2**

```python
# # Use for CV
# res_blend_cv = []

# kf = KFold(n_splits = 5, random_state = 17, shuffle = True)
# for i, (train_index, test_index) in enumerate(kf.split(X_train)):

# # Create data for this fold
# y_train_bl, y_valid_bl = y_target.iloc[train_index], y_target.iloc[test_index]
# X_train_cb, X_valid_cb = X_train_catboost.iloc[train_index,:], X_train_catboost.iloc[test_index,:]
# X_train_bl_cv, X_valid_bl_cv = X_train_lgb.iloc[train_index,:], X_train_lgb.iloc[test_index,:]

# lgb_cv = lgb.Dataset(X_train_bl_cv, label=y_train_bl)
# lgb_cv_val = lgb.Dataset(X_valid_bl_cv, label=y_valid_bl)
# print( "\nFold ", i)

# fit_model_cb = model.fit( X_train_cb, y_train_bl,
# cat_features=cat_features_catboost
# )
# fit_model_lgb = lgb.train(param, lgb_cv, valid_sets=[lgb_cv_val], verbose_eval=20)

# # Generate validation predictions for this fold
# pred_cb = fit_model_cb.predict_proba(X_valid_cb)
# pred_lgb = fit_model_lgb.predict(X_valid_bl_cv)

# res_blend_cv.append(accuracy_score(np.argmax(0.31*pred_cb + 0.69*pred_lgb ,axis=1),y_valid_bl))
```

```python
# np.mean(res_blend_cv)
```

## Part 8. Validation and learning curves <a class="anchor" id="part8"></a>

### Curves for KNN

```python
from sklearn.model_selection import learning_curve
```

```python
train_sizes, train_scores, valid_scores = learning_curve(neigh, X_tr_knn, y_tr, cv=5)
```

```python
plt.figure()

plt.xlabel("Training examples")
plt.ylabel("Score")
train_scores_mean = np.mean(train_scores, axis=1)
train_scores_std = np.std(train_scores, axis=1)
valid_scores_mean = np.mean(valid_scores, axis=1)
valid_scores_std = np.std(valid_scores, axis=1)
plt.grid()

plt.fill_between(train_sizes, train_scores_mean - train_scores_std,
train_scores_mean + train_scores_std, alpha=0.1,
color="r")
plt.fill_between(train_sizes, valid_scores_mean - valid_scores_std,
valid_scores_mean + valid_scores_std, alpha=0.1, color="g")
plt.plot(train_sizes, train_scores_mean, 'o-', color="r",
label="Training score")
plt.plot(train_sizes, valid_scores_mean, 'o-', color="g",
label="Cross-validation score")

plt.legend(loc="best")
```

### Curves for CatBoost

```python
test_pool = Pool(X_holdout_catboost, y_holdout, cat_features=cat_features_catboost)
```

```python
model.fit(train_pool, eval_set=test_pool, plot=True)
```

### Curves for LightGBM

```python
eval_result = {}
param['metric'] = {'multi_error'}
lgb_model = lgb.train(param, lgb_train, 10000, valid_sets=[lgb_train, lgb_val], verbose_eval=20, evals_result=eval_result)
```

```python
# Print curves
print('Plot metrics during training...')
ax = lgb.plot_metric(eval_result, metric='multi_error')
plt.show()
```

## Part 9. Prediction for test samples <a class="anchor" id="part9"></a>

```python
res_knn = accuracy_score(y_test, neigh.predict(X_test_knn))
```

```python
res_catboost = model.score(X_test_catboost, y_test)
```

```python
lgb_proba = lgb_model.predict(X_test_lgb)
lgb_pred = np.argmax(lgb_proba,axis=1)
res_lgb = accuracy_score(y_test, lgb_pred)
```

```python
# prediction = (0.31*CatBoost + 0.69*LGB) / 2
catboost_proba = model.predict_proba(X_test_catboost)
blender_proba = 0.31*catboost_proba + 0.69*lgb_proba
blender_pred = np.argmax(blender_proba,axis=1)
res_blender = accuracy_score(y_test, blender_pred)
```

```python
result = pd.DataFrame({'model':['KNN', 'CatBoost', 'LGB', 'Blender'],
'Test Accuracy':[res_knn, res_catboost, res_lgb, res_blender],
'CV Accuracy':[np.mean(res_knn_cv), np.mean(res_catboost_cv),
np.mean(res_lgb_cv), np.mean(res_blend_cv)]})
result.set_index('model')
```

## Part 10. Model evaluation with metrics description <a class="anchor" id="part10"></a>

So we can see accuracy for all our models and compare it for CV and for test data. All accuracies are smaller for test dataset. It usually talks about overfitting, but in this case it is more likely about difference between train and test dataset - for example, `payer_code` has more missings in train data.

Also it can show, that we still have no enough data - if we got more data for training set (not 50/50 but 70/30) maybe model show better result.

Metrics we used - accuracy. We choose this one because it's classical for solution

From the all models **blender model** show best result on CV and test datasets. But the difference between blender and LGB not so much to use it for production model: **LGB is simplier and faster**.

## Part 11. Conclusions <a class="anchor" id="part11"></a>

Really we got not perfect solution. Accuracy for multi-label classification = 0.55 will not allow to use it in real conditions. It is worth paying more attention to the feature enineering. It may be necessary to increase the sample data, adding new featuress.

Pluses of the solution:
- we made fast and light model, that use small number of features
- we go for multi-class solution instead of binary classification as it described in all solutions at Kaggle about this dataset
- stack models
- We conducted a broad study that allows us to outline ways for the further development of the project.

Minuses:
- Accuracy is not enough
- Feature engineering gave no affect

Further research:
- more attention to features: we can transform them to normally distributed, encode categorical feature as mean/median/ets of numeric groups, generate nore new features (for example split feature for to as it distribution has 2 peaks)
- still a lot of statistics that we didn't implement (as Cramer V) that can show new dependencies in data
- always new methods can be applied (NN?) but looks like features are first here

For me:
I study a lot from this progect. Starting from markdown and to blending models. Learned a lot of new statistic tests, data approaches and etc. Work on a large project in a short time does not allow to relax. And although it was possible to do not all that I wanted, the result was obtained. I express my gratitude to the creators of the course!
