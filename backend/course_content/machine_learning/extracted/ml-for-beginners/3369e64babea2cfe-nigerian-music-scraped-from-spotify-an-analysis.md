# Nigerian Music scraped from Spotify - an analysis

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/5-Clustering/2-K-Means/solution/notebook.ipynb
Original Path: 5-Clustering/2-K-Means/solution/notebook.ipynb
Course: Machine Learning

# Nigerian Music scraped from Spotify - an analysis

```python
pip install seaborn
```

Output:
```text
Requirement already satisfied: seaborn in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (0.11.1)
Requirement already satisfied: pandas>=0.23 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from seaborn) (1.1.2)
Requirement already satisfied: matplotlib>=2.2 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from seaborn) (3.1.0)
Requirement already satisfied: scipy>=1.0 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from seaborn) (1.4.1)
Requirement already satisfied: numpy>=1.15 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from seaborn) (1.19.2)
Requirement already satisfied: python-dateutil>=2.7.3 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from pandas>=0.23->seaborn) (2.8.0)
Requirement already satisfied: pytz>=2017.2 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from pandas>=0.23->seaborn) (2019.1)
Requirement already satisfied: kiwisolver>=1.0.1 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from matplotlib>=2.2->seaborn) (1.1.0)
Requirement already satisfied: cycler>=0.10 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from matplotlib>=2.2->seaborn) (0.10.0)
Requirement already satisfied: pyparsing!=2.0.4,!=2.1.2,!=2.1.6,>=2.0.1 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from matplotlib>=2.2->seaborn) (2.4.0)
Requirement al
```

Start where we finished in the last lesson, with data imported and filtered.

```python
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

df = pd.read_csv("../../data/nigerian-songs.csv")
df.head()
```

Output:
```text
name album \
0 Sparky Mandy & The Jungle
1 shuga rush EVERYTHING YOU HEARD IS TRUE
2 LITT! LITT!
3 Confident / Feeling Cool Enjoy Your Life
4 wanted you rare.

artist artist_top_genre release_date length popularity \
0 Cruel Santino alternative r&b 2019 144000 48
1 Odunsi (The Engine) afropop 2020 89488 30
2 AYLØ indie r&b 2018 207758 40
3 Lady Donli nigerian pop 2019 175135 14
4 Odunsi (The Engine) afropop 2018 152049 25

danceability acousticness energy instrumentalness liveness loudness \
0 0.666 0.8510 0.420 0.534000 0.1100 -6.699
1 0.710 0.0822 0.683 0.000169 0.1010 -5.640
2 0.836 0.2720 0.564 0.000537 0.1100 -7.127
3 0.894 0.7980 0.611 0.000187 0.0964 -4.961
4 0.702 0.1160 0.833 0.910000 0.3480 -6.044

speechiness tempo time_signature
0 0.0829 133.015 5
1 0.3600 129.993 3
2 0.0424 130.005 4
3 0.1130 111.087 4
4 0.0447 105.115 4
```

We will focus only on 3 genres. Maybe we can get 3 clusters built!

```python
df = df[(df['artist_top_genre'] == 'afro dancehall') | (df['artist_top_genre'] == 'afropop') | (df['artist_top_genre'] == 'nigerian pop')]
df = df[(df['popularity'] > 0)]
top = df['artist_top_genre'].value_counts()
plt.figure(figsize=(10,7))
sns.barplot(x=top.index,y=top.values)
plt.xticks(rotation=45)
plt.title('Top genres',color = 'blue')
```

Output:
```text
Text(0.5, 1.0, 'Top genres')

<Figure size 720x504 with 1 Axes>
```

```python
df.head()
```

Output:
```text
name album \
1 shuga rush EVERYTHING YOU HEARD IS TRUE
3 Confident / Feeling Cool Enjoy Your Life
4 wanted you rare.
5 Kasala Pioneers
6 Pull Up Everything Pretty

artist artist_top_genre release_date length popularity \
1 Odunsi (The Engine) afropop 2020 89488 30
3 Lady Donli nigerian pop 2019 175135 14
4 Odunsi (The Engine) afropop 2018 152049 25
5 DRB Lasgidi nigerian pop 2020 184800 26
6 prettyboydo nigerian pop 2018 202648 29

danceability acousticness energy instrumentalness liveness loudness \
1 0.710 0.0822 0.683 0.000169 0.1010 -5.640
3 0.894 0.7980 0.611 0.000187 0.0964 -4.961
4 0.702 0.1160 0.833 0.910000 0.3480 -6.044
5 0.803 0.1270 0.525 0.000007 0.1290 -10.034
6 0.818 0.4520 0.587 0.004490 0.5900 -9.840

speechiness tempo time_signature
1 0.3600 129.993 3
3 0.1130 111.087 4
4 0.0447 105.115 4
5 0.1970 100.103 4
6 0.1990 95.842 4
```

How clean is this data? Check for outliers using box plots. We will concentrate on columns with fewer outliers (although you could clean out the outliers). Boxplots can show the range of the data and will help choose which columns to use. Note, Boxplots do not show variance, an important element of good clusterable data (https://stats.stackexchange.com/questions/91536/deduce-variance-from-boxplot)

```python
plt.figure(figsize=(20,20), dpi=200)

plt.subplot(4,3,1)
sns.boxplot(x = 'popularity', data = df)

plt.subplot(4,3,2)
sns.boxplot(x = 'acousticness', data = df)

plt.subplot(4,3,3)
sns.boxplot(x = 'energy', data = df)

plt.subplot(4,3,4)
sns.boxplot(x = 'instrumentalness', data = df)

plt.subplot(4,3,5)
sns.boxplot(x = 'liveness', data = df)

plt.subplot(4,3,6)
sns.boxplot(x = 'loudness', data = df)

plt.subplot(4,3,7)
sns.boxplot(x = 'speechiness', data = df)

plt.subplot(4,3,8)
sns.boxplot(x = 'tempo', data = df)

plt.subplot(4,3,9)
sns.boxplot(x = 'time_signature', data = df)

plt.subplot(4,3,10)
sns.boxplot(x = 'danceability', data = df)

plt.subplot(4,3,11)
sns.boxplot(x = 'length', data = df)

plt.subplot(4,3,12)
sns.boxplot(x = 'release_date', data = df)
```

Output:
```text
<matplotlib.axes._subplots.AxesSubplot at 0x7fbc18790a20>

<Figure size 4000x4000 with 12 Axes>
```

Choose several columns with similar ranges. Make sure to include the artist_top_genre column to keep our genres straight.

```python
from sklearn.preprocessing import LabelEncoder, StandardScaler
le = LabelEncoder()

# scaler = StandardScaler()

X = df.loc[:, ('artist_top_genre','popularity','danceability','acousticness','loudness','energy')]

y = df['artist_top_genre']

X['artist_top_genre'] = le.fit_transform(X['artist_top_genre'])

# X = scaler.fit_transform(X)

y = le.transform(y)
```

K-Means Clustering has the drawback of needing to tell it how many clusters to build. We know there are three song types, so let's focus on 3.

```python
from sklearn.cluster import KMeans

nclusters = 3
seed = 0

km = KMeans(n_clusters=nclusters, random_state=seed)
km.fit(X)

# Predict the cluster for each data point

y_cluster_kmeans = km.predict(X)
y_cluster_kmeans
```

Output:
```text
array([2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 0, 2, 1, 1, 0, 1, 0, 0,
0, 1, 0, 2, 0, 0, 2, 2, 1, 1, 0, 2, 2, 2, 2, 1, 1, 0, 2, 0, 2, 0,
2, 0, 0, 1, 1, 2, 1, 0, 0, 2, 2, 2, 2, 1, 1, 0, 1, 2, 2, 1, 2, 2,
1, 2, 1, 2, 2, 1, 1, 1, 1, 1, 2, 1, 2, 2, 0, 2, 1, 1, 1, 2, 2, 2,
2, 1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 0,
1, 1, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 1, 1, 1, 1, 0, 1, 2, 1, 2,
1, 2, 2, 2, 0, 2, 1, 1, 1, 2, 1, 0, 1, 2, 2, 1, 1, 1, 0, 1, 2, 2,
2, 1, 1, 0, 1, 2, 1, 1, 1, 1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2,
0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 1, 1, 2, 0, 2, 2, 0, 2, 2, 1, 1, 0,
1, 1, 0, 0, 1, 0, 2, 0, 1, 0, 2, 0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 0,
2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0, 1, 1, 1, 0, 2, 2, 2,
1, 1, 0, 0, 1, 1, 2, 0, 0, 0, 0, 0, 2, 0, 0, 2, 1, 1, 1, 2, 2, 2,
1, 2, 1, 2, 1, 1, 1, 0, 2, 2, 2, 1, 2, 1, 0, 1, 2, 1, 1, 1, 2, 1],
dtype=int32)
```

Those numbers don't mean much to us, so let's get a 'silhouette score' to see the accuracy. Our score is in the middle.

```python
from sklearn import metrics
score = metrics.silhouette_score(X, y_cluster_kmeans)
score
```

Output:
```text
0.5466747351275563
```

Import KMeans and build a model

```python
from sklearn.cluster import KMeans
wcss = []

for i in range(1, 11):
kmeans = KMeans(n_clusters = i, init = 'k-means++', random_state = 42)
kmeans.fit(X)
wcss.append(kmeans.inertia_)
```

Use that model to decide, using the Elbow Method, the best number of clusters to build

```python
plt.figure(figsize=(10,5))
sns.lineplot(range(1, 11), wcss,marker='o',color='red')
plt.title('Elbow')
plt.xlabel('Number of clusters')
plt.ylabel('WCSS')
plt.show()
```

Output:
```text
/Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages/seaborn/_decorators.py:43: FutureWarning: Pass the following variables as keyword args: x, y. From version 0.12, the only valid positional argument will be `data`, and passing other arguments without an explicit keyword will result in an error or misinterpretation.
FutureWarning

<Figure size 720x360 with 1 Axes>
```

```python
Looks like 3 is a good number after all. Fit the model again and create a scatterplot of your clusters. They do group in bunches, but they are pretty close together.
```

```python
from sklearn.cluster import KMeans
kmeans = KMeans(n_clusters = 3)
kmeans.fit(X)
labels = kmeans.predict(X)
plt.scatter(df['popularity'],df['danceability'],c = labels)
plt.xlabel('popularity')
plt.ylabel('danceability')
plt.show()
```

Output:
```text
<Figure size 432x288 with 1 Axes>
```

This model's accuracy is not bad, but not great. It may be that the data may not lend itself well to K-Means Clustering. You might try a different method.

```python
labels = kmeans.labels_

correct_labels = sum(y == labels)

print("Result: %d out of %d samples were correctly labeled." % (correct_labels, y.size))

print('Accuracy score: {0:0.2f}'. format(correct_labels/float(y.size)))
```

Output:
```text
Result: 109 out of 286 samples were correctly labeled.
Accuracy score: 0.38
```
