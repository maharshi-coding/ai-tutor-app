# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/topic07_unsupervised/lesson7_part2_kmeans.ipynb
Original Path: jupyter_english/topic07_unsupervised/lesson7_part2_kmeans.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg" />

## [mlcourse.ai](https://mlcourse.ai) – Open Machine Learning Course

Author: [Yury Kashnitskiy](https://yorko.github.io). This material is subject to the terms and conditions of the [Creative Commons CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. Free use is permitted for any non-commercial purpose.

# <center>Topic 7. Unsupervised learning
## <center>Part 2. Clustering. k-Means

**This is mostly to demonstrate some applications of k-Means, for theory, study [topic 7](https://mlcourse.ai/notebooks/blob/master/jupyter_english/topic07_unsupervised/topic7_pca_clustering.ipynb?flush_cache=true) in our course**

## Clustering NBA players

Some <a href="http://www.databasebasketball.com/about/aboutstats.htm">info</a> on players' features.

```python
import numpy as np
import pandas as pd

%matplotlib inline
import matplotlib.pyplot as plt

nba = pd.read_csv("../../data/nba_2013.csv")
nba.head()
```

```python
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

kmeans = KMeans(n_clusters=5, random_state=1)
numeric_cols = nba._get_numeric_data().dropna(axis=1)
kmeans.fit(numeric_cols)

# Visualizing using PCA
pca = PCA(n_components=2)
res = pca.fit_transform(numeric_cols)
plt.figure(figsize=(12,8))
plt.scatter(res[:,0], res[:,1], c=kmeans.labels_, s=50, cmap='viridis')
plt.title('PCA')

# Visualizing using 2 features: Total points vs. Total assists
plt.figure(figsize=(12,8))
plt.scatter(nba['pts'], nba['ast'],
c=kmeans.labels_, s=50, cmap='viridis')
plt.xlabel('Total points')
plt.ylabel('Total assitances')
plt.title('Some interpretation');
```

## Compressing images with k-Means
*not a popular technique*

```python
import matplotlib.image as mpimg

img = mpimg.imread('../../img/woman.jpg')[..., 1]
plt.figure(figsize = (20, 12))
plt.axis('off')
plt.imshow(img, cmap='gray');
```

```python
from scipy.stats import randint
from sklearn.cluster import MiniBatchKMeans

X = img.reshape((-1, 1))
k_means = MiniBatchKMeans(n_clusters=3)
k_means.fit(X)
values = k_means.cluster_centers_
labels = k_means.labels_
img_compressed = values[labels].reshape(img.shape)
plt.figure(figsize = (20, 12))
plt.axis('off')
plt.imshow(img_compressed, cmap = 'gray');
```

# Finding latent topics in texts

**We'll apply k-Means to cluster texts from 4 categories.**

```python
from time import time

from sklearn import metrics
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfTransformer, TfidfVectorizer
from sklearn.preprocessing import Normalizer

categories = [
'alt.atheism',
'talk.religion.misc',
'comp.graphics',
'sci.space']

print("Loading 20 newsgroups dataset for categories:")
print(categories)

dataset = fetch_20newsgroups(subset='all', categories=categories,
shuffle=True, random_state=42)

print("%d documents" % len(dataset.data))
print("%d categories" % len(dataset.target_names))

labels = dataset.target
true_k = np.unique(labels).shape[0]
```

**Build Tf-Idf features for texts**

```python
print("Extracting features from the training dataset using a sparse vectorizer")
vectorizer = TfidfVectorizer(max_df=0.5, max_features=1000,
min_df=2, stop_words='english')

X = vectorizer.fit_transform(dataset.data)
print("n_samples: %d, n_features: %d" % X.shape)
```

**Apply k-Means to the vectors that we've got. Also, calculate clustering metrics.**

```python
km = KMeans(n_clusters=true_k, init='k-means++',
max_iter=100, n_init=1)

print("Clustering sparse data with %s" % km)
t0 = time()
km.fit(X)

print("Homogeneity: %0.3f" % metrics.homogeneity_score(labels, km.labels_))
print("Completeness: %0.3f" % metrics.completeness_score(labels, km.labels_))
print("V-measure: %0.3f" % metrics.v_measure_score(labels, km.labels_))
print("Adjusted Rand-Index: %.3f"
% metrics.adjusted_rand_score(labels, km.labels_))
print("Silhouette Coefficient: %0.3f"
% metrics.silhouette_score(X, km.labels_, sample_size=1000))

order_centroids = km.cluster_centers_.argsort()[:, ::-1]
```

**Output words that are close to cluster centers**

```python
terms = vectorizer.get_feature_names()
for i in range(true_k):
print("Cluster %d:" % (i + 1), end='')
for ind in order_centroids[i, :10]:
print(' %s' % terms[ind], end='')
print()
```

## Clustering handwritten digits

```python
from sklearn.datasets import load_digits

digits = load_digits()

X, y = digits.data, digits.target
```

```python
kmeans = KMeans(n_clusters=10)
kmeans.fit(X)
```

```python
from sklearn.metrics import adjusted_rand_score

adjusted_rand_score(y, kmeans.predict(X))
```

```python
_, axes = plt.subplots(2, 5)
for ax, center in zip(axes.ravel(), kmeans.cluster_centers_):
ax.matshow(center.reshape(8, 8), cmap=plt.cm.gray)
ax.set_xticks(())
ax.set_yticks(())
```
