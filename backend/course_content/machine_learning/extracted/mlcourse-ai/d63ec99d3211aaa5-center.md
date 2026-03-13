# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/will_you_have_a_success_in_speed_dating_tatyana_kudasova.ipynb
Original Path: jupyter_english/projects_indiv/will_you_have_a_success_in_speed_dating_tatyana_kudasova.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg" />

## [mlcourse.ai](mlcourse.ai) – Open Machine Learning Course
### <center> Author: Tatyana Kudasova, ODS Slack @kudasova

## <center> Will you have a success in speed dating?

### Part 1. Dataset and features description

In today’s busy world, finding and dating a romantic partner seems more time consuming than ever. As a result, many people have turned to speed dating as a solution that allows one to meet and interact with a large number of potential partners in a short amount of time. As it turns out, some people actually find a partner during these events, and others don't ever see any of the people they met there. In this project we are exploring what distinguishes those who date after the speed dating ('good, or successful speed daters') from those who don't ('bad speed daters'), and try to predict if a person will be a good or a bad speed dater. So you could try out yourself will the speed dating be helpful for you or not.

The data was gathered from 552 participants in experimental speed dating events from 2002-2004 (total 21 events). Participants were students in graduate and professional schools at Columbia University. They were recruited through a combination of mass e-mail and fliers posted throughout the campus and handed out by research assistants. In order to sign up for a speed dating event, interested students had to register at an online web site on which they reported their names and e-mail addresses and completed a pre-event survey. During the events, the attendees would have a four minute "first date" with every other participant of the opposite sex. At the end of their four minutes, participants were asked if they would like to see their date again. They were also asked to rate their date on six attributes: attractiveness, sincerity, intelligence, fun, ambition, shared interests. The morning after the speed dating event, participants were sent an e-mail requesting that they complete the follow-up online questionnaire. Most of the speed dating participants completed this follow-up questionnaire in order to obtain their matches. Upon receipt of their follow-up questionnaire responses, participants were sent an e-mail informing them of their match results.
Also 3-4 weeks after the speed dating event, participants were asked to fill a survey again. And one answer from this survey we take as a target here - `date_3` - whether a person went to a date with at least one of his/her speed dating matches. All our features will be from pre-event surveys, as our goal is prediction for persons who have never been to such events. For more details, see the speed-dating-data-key.doc for data dictionary and question key. The question key and the data you can find on [Kaggle]: (https://www.kaggle.com/annavictoria/speed-dating-experiment).

### Part 2. Primary data analysis

```python
# importing packages
%matplotlib inline
import pandas as pd
pd.set_option('display.max_columns', 200)
pd.set_option('display.max_rows', 200)
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from scipy.stats import chi2_contingency
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.metrics import recall_score
```

```python
# importing data
df = pd.read_csv('data/Speed Dating Data.csv', encoding="ISO-8859-1")
df.head()
```

```python
# our data has 8378 rows and 195 columns
df.shape
```

First, in this project we are predicting the success of the speed dating, and we use only the information gathered before speed dating happened, cause the information gathered after the speed dating will leak our prediction. So we delete columns with information gathered after speed dating, except our target variable.

```python
columns_after = df.ix[:, 'satis_2':].columns.values
target = df['date_3']
df = df.drop(columns_after, axis=1)
df['target'] = target
df.shape
```

Well, we got far less columns. Second, this dataset contains several rows for each participant (as many, as many partners he/she met during the speed dating). One part of the variables are all the same in those rows for one participant - they are participant-specific, and we are interested in them. Other part is about how the participant rates his/her current speed dating partner, and those we are not of interest for us. Let's look at this:

```python
df[df['iid'] == 1] # participant with her unique iid = 1
```

Let's filter all the variables that are not only about the participant, i.e. that have more than one unique value for each participant:

```python
uniques_dict = df[df['iid'] == 1].nunique()
non_uniques = [k for k, v in uniques_dict.items() if v > 1]
df_person = df.drop(non_uniques, axis=1)
df_person.drop_duplicates(subset='iid', keep='first', inplace=True)
df_person.shape
```

Now we got far less rows. Also, we need only data were our target variable is not missing, so let's filter that out.

```python
df_person = df_person[pd.notna(df_person['target'])]
df_person.shape
```

It is sad, but we have only half of the data. Let's look at what are we left with.

```python
df_person.head()
```

```python
df_person.describe().T
```

Here we have one particular row with lot of NA's in it (the particicpant did not care about the questionnaires), so we just delete it.

```python
df_person[df_person['iid']==136]
```

```python
df_person = df_person[df_person['iid']!=136]
df_person.shape
```

Also, we will drop features having more than 20% NAs, those don't seem reliable to me.

```python
na_count = df_person.isna().sum()
too_many_nans = [k for k, v in na_count.items() if v > df_person.shape[0]*0.20]
too_many_nans
```

```python
df_person = df_person.drop(too_many_nans, axis=1)
df_person.shape
```

Now let's look at the features that have not so many NA's and try to fill the NA's there.

```python
na_count = df_person.isna().sum()
na_count[na_count > 0]
```

As for `zipcode` (zip code of the area where the participant grew up), I think this information is excessive, cause we already have `from` variable (answer to quefeature that might be useful: `foreign` = 1 if student is originally not from USA.

```python
df_person['foreign'] = (df_person['zipcode'].isna()) | (df_person['zipcode'] == '0')
df_person['foreign'] = df_person['foreign'].astype(int)
```

Let's check if everything is right and the data is clean.

```python
df_person[['iid', 'from', 'zipcode', 'foreign']].tail()
```

No, it is not clean. I will clean it up by hands. It took not that much time, because the dataset is small.

```python
to_foreign = [16, 43, 44, 45, 46, 48, 74, 80, 83, 84, 89, 90, 100, 116, 133, 139, 153, 171, 183, 189, 198, 221, 224, 242, 247, 253, 280, 317, 360, 398, 401, 404, 469, 486, 530, 546, 548, 549, 552]
from_foreign = [187, 220, 244, 278, 322, 328, 331, 333, 336, 462, 526]
foreign_list = []
for index, row in df_person.iterrows():
if row['iid'] in to_foreign:
foreign = 1
elif row['iid'] in from_foreign:
foreign = 0
else:
foreign = row['foreign']
foreign_list.append(foreign)
df_person['foreign'] = foreign_list
```

Now we can delete the `zipcode` column.

```python
df_person = df_person.drop('zipcode', axis=1)
```

Now let's look at the rows with missing `career_c` and try to imply it from `career`.

```python
df_person[['iid', 'career', 'career_c']][df_person['career_c'].isna()]
```

```python
df_person.loc[:10, 'career_c'] = 1 # 1 stands for 'Law'
```

As for the rest of columns with NAs, those are numeric, and we will fill NAs there with medians.

```python
num_na = df_person.columns[df_person.isna().any()].tolist()
df_person = df_person.fillna(df_person.median())
na_count = df_person.isna().sum()
na_count[na_count > 0]
```

Congratulations! We have no more missing values!
Still have one more thing to do. In the surveys the questions about people's attributes were asked differently in different waves of experiment. Waves 6-9: Please rate the importance of the following attributes in a potential date on a scale of 1-10 (1=not at all important, 10=extremely important):
Waves 1-5, 10-21: You have 100 points to distribute among the following attributes -- give more points to those attributes that are more important in a potential date, and fewer points to those attributes that are less important in a potential date. Total points must equal 100.
So we need to scale the data to avoid this difference.

```python
what_looks_for =['attr1_1', 'sinc1_1', 'intel1_1', 'fun1_1', 'amb1_1', 'shar1_1']
for index, row in df_person.iterrows():
if any(row[what_looks_for] > 10):
best = max(row[what_looks_for])
df_person.loc[index, what_looks_for] = row[what_looks_for]*10/best
df_person[what_looks_for].head()
```

```python
what_opposite_sex_looks_for =['attr2_1', 'sinc2_1', 'intel2_1', 'fun2_1', 'amb2_1', 'shar2_1']
for index, row in df_person.iterrows():
if any(row[what_opposite_sex_looks_for] > 10):
best = max(row[what_opposite_sex_looks_for])
df_person.loc[index, what_opposite_sex_looks_for] = row[what_opposite_sex_looks_for]*10/best
df_person[what_opposite_sex_looks_for].head()
```

Finally, we will drop identification number columns and columns related to the speed dating event.

```python
df_person = df_person.drop(['iid', 'id', 'idg', 'wave', 'condtn', 'round', 'position', 'match_es'], axis=1)
```

Now let's look at our data types.

```python
df_person.info()
```

Let's make out binary variables binary type.

```python
binary = ['gender', 'foreign', 'target']
df_person[binary] = df_person[binary].astype(bool)
```

Let's see how many particiants had at least one date a month after their speed dating.

```python
df_person['target'].value_counts()
```

```python
df_person['target'].value_counts(normalize=True)
```

So 168 out of 262 people (that's about 64%) did not have any dates after speed dating. Let's see if our binary variables: gender and foreign status have a value here.

```python
df_person.groupby(['target'])['gender', 'foreign'].agg([np.mean, np.std, np.min, np.max])
```

We see that gender does not affect target variable, but foreign status might. Let's check if this is statistically significant difference using chi-square test of independence of variables in a contingency table.

```python
g, p, dof, expctd = chi2_contingency(pd.crosstab(df_person['foreign'], df_person['target']).values)
p
```

P-value is 0.63 which is more than 0.05 so we cannot reject our null hypothesis. On such small set of data it is hard to prove statistically feature importance.

Now lets make our categorical data have categorical type.

```python
categories={1: "Black / African American",
2: "European/Caucasian-American",
3: 'Latino/Hispanic American',
4: 'Asian/Pacific Islander/Asian-American',
5: 'Native American',
6: 'Other'}
df_person.race = df_person.race.apply(lambda x: categories[x])
```

```python
categories={1: 'Law',
2: 'Math',
3: 'Social Science, Psychologist',
4: 'Medical Science, Pharmaceuticals, and Bio Tech',
5: 'Engineering',
6: 'English/Creative Writing/ Journalism ',
7: 'History/Religion/Philosophy',
8: 'Business/Econ/Finance',
9: 'Education, Academia',
10: 'Biological Sciences/Chemistry/Physics',
11: 'Social Work',
12: 'Undergrad/undecided',
13: 'Political Science/International Affairs',
14: 'Film',
15: 'Fine Arts/Arts Administration',
16: 'Languages',
17: 'Architecture',
18: 'Other'}
df_person.field_cd = df_person.field_cd.apply(lambda x: categories[x])
```

```python
categories={1: 'Seemed like a fun night out',
2: 'To meet new people',
3: 'To get a date',
4: 'Looking for a serious relationship',
5: 'To say I did it',
6: 'Other'}
df_person.goal = df_person.goal.apply(lambda x: categories[x])
```

```python
categories={1: 'Several times a week',
2: 'Twice a week',
3: 'Once a week',
4: 'Twice a month',
5: 'Once a month',
6: 'Several times a year',
7: 'Almost never'}
df_person.date = df_person.date.apply(lambda x: categories[x])
```

```python
categories={1: 'Several times a week',
2: 'Twice a week',
3: 'Once a week',
4: 'Twice a month',
5: 'Once a month',
6: 'Several times a year',
7: 'Almost never'}
df_person.go_out = df_person.go_out.apply(lambda x: categories[x])
```

```python
categories={1: 'Lawyer',
2: 'Academic/Research',
3: 'Psychologist',
4: 'Doctor/Medicine',
5: 'Engineer',
6: 'Creative Arts/Entertainment',
7: 'Banking/Consulting/Finance/Marketing/Business/CEO/Entrepreneur/Admin',
8: 'Real Estate',
9: 'International/Humanitarian Affairs',
10: 'Undecided',
11: 'Social Work',
12: 'Speech Pathology',
13: 'Politics',
14: 'Pro sports/Athletics',
15: 'Other',
16: 'Journalism',
17: 'Architecture'}
df_person.career_c = df_person.career_c.apply(lambda x: categories[x])
```

Relationship between other variables and the target we will visualize and explane the relation in next paragraph!

### Part 3. Primary visual data analysis

First, let's look if age plays role here.

```python
sns.boxplot(x="target", y="age", data=df_person)
```

Although age of succesful daters is higher on average, the difference is small.
Now let's see if race is important.

```python
sns.countplot(y='race', hue='target', data=df_person)
```

Well, compared to all other races, latinos tend to be more successful speed daters. But the latinos subset is too small to use it as a separate feature. Let's look at coded field of study.

```python
sns.countplot(y='field_cd', hue='target', data=df_person)
```

In the graph above we se that there are more successful speed daters among those who study history, religion, philosophy, english, creative writing or journalism. But the same as with races, the subset of good speed daters here is very small.

```python
sns.countplot(y='goal', hue='target', data=df_person)
```

It is not surprising that those who are looking for serious relationship tend to have dates after speed dating. But, sadly, this category is very small so it can't be used as a separate feature.

```python
sns.countplot(y='date', hue='target', data=df_person)
```

On the graph above and on the graph below I don't see any differense between the distribution of good and bad speed daters.

```python
sns.countplot(y='go_out', hue='target', data=df_person)
```

Does carrier influence speed dater's success?

```python
sns.countplot(y='career_c', hue='target', data=df_person)
```

Surprisingly or not, social workers tend to be the best speed daters. But again, this group of participants is too small.
Do people's hobby affect their speed dating behavior?

```python
interests = ['target',
'sports', 'tvsports', 'exercise', 'dining', 'museums', 'art', 'hiking', 'gaming', 'clubbing', 'reading', 'tv', 'theater', 'movies', 'concerts', 'music', 'shopping', 'yoga']
df_long = pd.melt(df_person[interests], "target", var_name="interests", value_name="points")
sns.catplot(y="interests", hue="target", x="points", data=df_long, kind="box")
```

For most hobbies, it does not. But if you enjoy watching tv, you tend to be worse speed dater, and if you enjoy exercise - you possibly become a better speed dater.
Now let's examine `exphappy` feature - answer to the question: "Overall, on a scale of 1-10, how happy do you expect to be with the people you meet during the speed-dating event?"

```python
sns.boxplot(x="target", y="exphappy", data=df_person)
```

It is interesting that good speed daters expect to be less happy than bad speed daters. So the less optimistic you are about speed dating, the better!
What about race importance variable?

```python
sns.boxplot(x="target", y="imprace", data=df_person)
```

For good speed daters race tends to be less important than for bad speed daters. As for religion importance (see below), it does not seem to make any difference.

```python
sns.boxplot(x="target", y="imprelig", data=df_person)
```

As for the attributes that participant is looking for, there is some difference there. Bad speed daters tend to look for more attractiveness, sincerety, intelligence, ambitiousness, shared interests. For good speed daters, fun is more important.

```python
what_looks_for = ['target',
'attr1_1', 'sinc1_1', 'intel1_1', 'fun1_1', 'amb1_1', 'shar1_1']
df_long = pd.melt(df_person[what_looks_for], "target", var_name="what_looks_for", value_name="points")
sns.catplot(y="what_looks_for", hue="target", x="points", data=df_long, kind="box")
```

There is also difference in the attributes that the participant thinks the opposite sex looks for in a date. Bad speed daters tend to expect that attractiveness, sincerety, intelligence, fun and shared interests to be more important to opposite sex. Good speed daters bet on ambitiousness.

```python
what_opposite_sex_looks_for = ['target',
'attr2_1', 'sinc2_1', 'intel2_1', 'fun2_1', 'amb2_1', 'shar2_1']
df_long = pd.melt(df_person[what_opposite_sex_looks_for], "target", var_name="what_opposite_sex_looks_for", value_name="points")
sns.catplot(y="what_opposite_sex_looks_for", hue="target", x="points", data=df_long, kind="box")
```

It is interesting that the participants' self-esteem for the same attributes is not important at all!

```python
how_you_measure_up = ['target',
'attr3_1', 'sinc3_1', 'intel3_1', 'fun3_1', 'amb3_1']
df_long = pd.melt(df_person[how_you_measure_up], "target", var_name="how_you_measure_up", value_name="points")
sns.catplot(y="how_you_measure_up", hue="target", x="points", data=df_long, kind="box")
```

Let's construct a new dataframe wiith the features that we've found might influence target and then see if those are correlated.

```python
binary_cols = ['foreign']
numeric_cols = ['age', 'imprace', 'exercise', 'tv', 'exphappy',
'attr1_1', 'sinc1_1', 'intel1_1', 'fun1_1', 'amb1_1', 'shar1_1',
'attr2_1', 'sinc2_1', 'intel2_1', 'fun2_1', 'amb2_1', 'shar2_1']
df_full = pd.concat([df_person[binary_cols], df_person[numeric_cols]], axis=1)
target = df_person['target']
sns.heatmap(df_full.corr())
```

Well, we see that most of person's attributes correlate with each other, but not much enough to delete them.

### Part 4. Patterns, insights, pecularities of data

The dataset is really small, that's why it was very important that we cleaned our data and examined it very carefully. We need to reduce the number of features in order not to overfit our model. As shown in this [paper](https://bmcmedinformdecismak.biomedcentral.com/articles/10.1186/1472-6947-12-8#CR31_460), for correlated features it is better to have $\sqrt N$ features were $N$ is sample size. We've found features that might affect the target variable: foreign status, age, race importance, tv loving, exercise loving, happiness expectation, attributes the participant looks for in his dates (6 total), attributes the participant thinks opposite sex looks for in his dates (6 total) - 18 features.

### Part 5. Metrics Selection

In this project we are dealing with a classification problem with two not that much imbalanced classes. If we predict for a person that he is a bad speed dater in the case where he is actually a good speed dater - that's false negative - it is more hurtful to us. So to minimize false negatives is more important for us, that's why we choose the recall metrics.

### Part 6. Model Selection

In the case of small dataset there is a huge chance of both underfitting and overfitting. To avoid overfitting, it is recommended to use a simple model with low number of hyperparameters and to reduce number of features. To avoid underfitting, the model should be not too simple. That's why we are choosing the SVM classifier.

### Part 7. Data preprocessing

Here we scale our numeric features with StandardScaler in order for SVC to work properly.

```python
scaler = StandardScaler()
df_full[numeric_cols] = scaler.fit_transform(df_full[numeric_cols])
df_full.head()
```

### Part 8. Cross-validation and adjustment of model hyperparameters
Before doing cross-validation, we will make a test sample to test our final model. We assume that our data is time-independent, and do a stratified random split with 10% of the data.

```python
df_full.shape, target.shape
```

```python
X_train, X_test, y_train, y_test = train_test_split(df_full,
target, test_size=0.1, random_state=17, stratify=target.values)
X_train.shape, X_test.shape
```

For cross-validation, as our dataset is small and classes are imbalanced, we are using stratified 10-fold split.

```python
cv = StratifiedKFold(n_splits=10, random_state=17)
```

We choose SVM classifier with balanced weights. Our scoring metrics is recall. We are tuning the regularization parameter `C` and the `kernel` type.

```python
clf = SVC(class_weight='balanced', gamma='scale', random_state=17)
params = {
'C': [0.01, 0.1, 1, 10],
'kernel': ('linear', 'poly', 'rbf', 'sigmoid')
}
gscv = GridSearchCV(clf, params, scoring='recall', cv=cv)
gscv.fit(X_train, y_train)
gscv.best_params_
```

Our best parameters are: linear kernel with C = 0.01. Now let's make one more cross-validation with closer range of the parameter `C`.

```python
clf = SVC(kernel='linear', class_weight='balanced', gamma='scale', random_state=17)
params = {
'C': [0.005, 0.01, 0.02]
}
gscv = GridSearchCV(clf, params, scoring='recall', cv=cv)
gscv.fit(X_train, y_train)
gscv.best_params_
```

Still C = 0.01 is the best, so we use it to train the whole train dataset.

```python
clf = SVC(C=0.01, kernel='linear', class_weight='balanced', gamma='scale', random_state=17)
clf.fit(X_train, y_train)
```

### Part 9. Creation of new features and description of this process

In part 7 we created a new feature - foreign status. Let's see if it is important for our model.

```python
clf.coef_, X_train.columns.values
```

As we can see from the weights of our features, it is not the least important variable, so it is useful. The most valuable features though are race importance, tv loving, expectation of shared interests importance for opposite sex, and importance of shared interests for the participant.

### Part 10. Plotting training and validation curves

```python
from sklearn.model_selection import learning_curve

plt.figure()
train_sizes, train_scores, test_scores = learning_curve(
clf, X_train, y_train, cv=cv, scoring='recall', random_state=17)

train_scores_mean = np.mean(train_scores, axis=1)
train_scores_std = np.std(train_scores, axis=1)
test_scores_mean = np.mean(test_scores, axis=1)
test_scores_std = np.std(test_scores, axis=1)
plt.grid()

plt.xlabel("Number of samples")
plt.ylabel("Metrics")
plt.fill_between(train_sizes, train_scores_mean - train_scores_std,
train_scores_mean + train_scores_std, alpha=0.1,
color="r")
plt.fill_between(train_sizes, test_scores_mean - test_scores_std,
test_scores_mean + test_scores_std, alpha=0.1, color="g")
plt.plot(train_sizes, train_scores_mean, 'o-', color="r",
label="Training curve")
plt.plot(train_sizes, test_scores_mean, 'o-', color="g",
label="Validation curve")

plt.legend(loc="best")
plt.show()
```

Our validation curve could converge toward the training curve if more training instances were added. So adding more data is very likely to help here. We have rather high errors for both training and validation curves, which means that our model has high bias (i.e. underfitted). Also we have a high variance around validation curve.

### Part 11. Prediction for test or hold-out samples

We constructed the train and test dataset in part 8. Here we train our model on the train dataset and get our recall score.

```python
y_pred = clf.predict(X_test)
recall_score(y_test, y_pred)
```

It is a bit lower than the cross-validation score, which is about 0.65 as shown in the picture from the previous part. But this is understandable, as we show to the model new data.

### Part 12. Conclusions

We designed a model with recall score = 0.6 which means that it is able to find roughly 60% of good speed daters in the data. Although it is better than nothing, there is plenty room for improvement here. First, it would be much better if we had more data. Second, we might do a better job on feature engineering, find some feature correlations and take a more complicated model. The task was difficult as there were no features that correlate much with the target, and it is hard to separate those classes. For that we might try some dimensionality reduction algorithms.

As for now, we have a simple model for you to predict will you be a successful speed dater or not. It's advantage is that it has nice interpretation. It says that the less you care about your partner's race, the less you love watchin TV, the less you care about interests sharing and the less you expect your partner to care about it the more success you might get in speed dating. Be tolerant and watch less TV!
