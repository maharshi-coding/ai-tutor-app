# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/tutorials/anomaly_detection_isolation_forest_alexander_nichiporenko.ipynb
Original Path: jupyter_english/tutorials/anomaly_detection_isolation_forest_alexander_nichiporenko.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg" />

## [mlcourse.ai](https://mlcourse.ai) – Open Machine Learning Course
### <center> Author: Alexander Nichiporenko, AlexNich

## <center> Tutorial
### <center> "Anomaly Detection: Isolation Forest"

<center>
<img src="../../img/out_liar.jpg" />

# Introduction.

In our course we quite a bit touched unsupervised learning tasks (reduction of dimenstion and clustering), and one more important class remained unnoticed - the detection of anomalies.

In data science anomaly detection (outlier or novelty detection) is the identification of rare items, events or observations which raise suspicions by differing significantly from the majority of the data. Typically the anomalous items will translate to some kind of problem such as bank fraud, a structural defect, medical problems or errors in a text. Anomalies are also referred to as outliers, novelties, noise, deviations and exceptions. Outliers often reduce the quality of ML algorithms because models tune to them.

# A bit of theory and the main idea of algorithm.

One of the proven anomaly detection algorithms is the Isolation Forest. As the name implies - this is an ensemble of trees, which are built independently of each other. But in this case, the principle of building a tree is different from what is used in regression or classification problems - minimizing the splitting criterion at each step.
The trees are also binary, but at each node the feature is chosen randomly, the feature values for splitting are also chosen randomly from the range (min, max) that the feature accepts. The tree is built to the maximum possible depth - when there is only one object in each leaf.
With this approach, it appears that the anomalies will get to the final leaf much earlier than normal objects. This is the principle of detecting anomalies which Isolation Forest uses, this algorithm "isolates" anomalies by normal objects at early steps.

Perhaps it seems not quite obvious, but we can consider the following one-dimensional toy example - such a set of numbers [1,20,21,25]. Obviously, the outlier in this case is the number 1. If we choose the threshold for the first splitting (1,25), then in the overwhelming majority of cases, the number 1 will immediately “isolate” in the first leaf of the tree. Let's simulate this situation for 1000 random threshold choices.

```python
# Importing libaries

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
```

```python
# Toy example

hits = 0
K = 1000
for k in range(K):
np.random.seed(k + 101)
split = np.random.uniform(1, 25)
if split < 20:
hits += 1

print('The portion of cases when the "1" goes to the first leaf:', hits / K)
```

In this way, we can measure the anomaly score using the path length of the object, i.e. the number of edges an observation must pass in the tree going from the root to the terminal node. But we have a problem, for sample data $X$= {$x_1,...,x_n$} the maximum possible height of isolation tree grows in the order of $n$, the average path length grows in the order of $log({n})$. Therefore, we cannot compare the anomaly of objects in samples of different sizes, normalization by any of the above values will not help either. So we will use this formula for normalization:

## $$c{(n)} = 2H(n-1) - {2 (n-1)\over n}$$

where $H(n-1)$ is $n$-$Harmonic$ number:

## $$H(n-1) = \sum_{k=1}^{n-1} {1\over k} \approx \gamma\ {(Euler's\ constant)} + \ln{(n-1)} \approx 0.5772156649 + \ln{(n-1)}$$

$c({n})$ gives the average path length of unsuccessful search in Binary Search Tree (BST). We can use it because isolation tree has a equivalent structure to BST and $c({n})$ equals to estimation of average $h({x})$ for external nodes.

So final anomaly score is calculated by this formula:

## $$S(x,n) = {2 ^ {E(x)\over c(n)}}$$
where $E(x)$ - average path length in trees of our forest where example $x$ was isolated:

## $$E(x) = {1\over N}\sum_{i=1}^{N} {h(x)_i}$$
and $N$ - number of trees in the forest.

$S(x,n)$ changes from $0$ to $1$. When $S(x,n)$ of example is very close to $1$ it means that it is definitely anomaly, when it much smaller then $0.5$ then this example safe to be regarded as normal instance, and if all examples have $S(x,n) \approx 0.5$, then the entire data doesn't have any distinct anomaly.

When we decide which example is anomaly we can choose portion of examples with high score or make a threshold in $S(x,n)$.

# Let's grow our IsolationForest!

In this part of the tutorial, we will implement our own Isolation Forest and see how it works with outliers and normal objects.

```python
from math import log as ln

import matplotlib.pyplot as plt
# Importing libaries ----
import numpy as np
import pandas as pd
import seaborn as sns
```

```python
# External Node - leaf with 1 example

class ExNode:
def __init__(self, size):
self.size = size
```

```python
# Internal Node

class InNode:
def __init__(self, left, right, split_feature, split_threshold):
self.left = left
self.right = right
self.split_feature = split_feature
self.split_threshold = split_threshold
```

```python
# Build one Isolation tree

def IsolationTree(X):
if len(X) <= 1:
return ExNode(len(X))
else:
f = np.random.choice(X.columns)
t = np.random.uniform(X[f].min(), X[f].max())
X_l = X[X[f] < t]
X_r = X[X[f] >= t]
return InNode(IsolationTree(X_l), IsolationTree(X_r), f, t)
```

```python
# Build forest

def MyIsolationForest(X, n_trees):
forest = []
for i in range(n_trees):
forest.append(IsolationTree(X))
return forest
```

```python
# Depth of external node where object was isolated

def path_length(x, tree, curr_depth):
if isinstance(tree, ExNode):
return curr_depth
t = tree.split_feature
if x[t] < tree.split_threshold:
return path_length(x, tree.left, curr_depth + 1)
else:
return path_length(x, tree.right, curr_depth + 1)
```

Functions which is needed to calculate degree of anomaly: $E(d), H(x), c(n), S(x,n)$.

```python
def E(d):
return np.mean(d)

def H(x):
return ln(x) + 0.5772156649

def c(n):
return 2 * H(n - 1) - 2 * (n - 1) / n if n > 2 else 1 if n == 1 else 0

def S(x, n):
return 2 ** (-E(x) / c(n))
```

## Let's find outliers using our forest!

Firstly we will generate 1-d data - normal distribution and find average path length and $S(x,n)$ of normal and anomaly objects depends on number of trees.

```python
# Generating normal distributed 1d-data
random_generator = np.random.RandomState(42)

true_mean = 100
true_sigma = 10

X_all = random_generator.normal(true_mean, true_sigma, size=500)

print("Normal interval:", true_mean - 2 * true_sigma, "-", true_mean + 2 * true_sigma)

X_outliers = pd.DataFrame(
np.hstack(
[
X_all[X_all < true_mean - 2 * true_sigma],
X_all[X_all > true_mean + 2 * true_sigma],
]
),
columns=["x"],
)
X_normal = pd.DataFrame(list(set(X_all).difference(set(X_outliers))), columns=["x"])
X_all = pd.DataFrame(X_all, columns=["x"])

print("Partition of outliers:", len(X_outliers) / len(X_all))
```

```python
plt.figure(figsize=(10, 5))
plt.hist(X_all["x"], bins=10)
plt.hist(X_outliers["x"], bins=10)
plt.legend(["X_all", "X_outliers"])
plt.ylabel("Count")
plt.xlabel("X value")
plt.title("Distribution of X");
```

```python
# Outlier for test

X_outliers.iloc[2, :]
```

```python
# Normal example for test

X_normal.iloc[0, :]
```

```python
%%time

anomaly_x = []
normal_x = []

anomaly_mean_depth = []
normal_mean_depth = []

anomaly_S = []
normal_S = []

for n in range(1, 51, 1):
MyIF = MyIsolationForest(X_all, n)
for iTree in MyIF:
anomaly_x.append(path_length(X_outliers.iloc[2, :], iTree, 0))
normal_x.append(path_length(X_normal.iloc[0, :], iTree, 0))
anomaly_mean_depth.append(E(anomaly_x))
normal_mean_depth.append(E(normal_x))
anomaly_S.append(S(anomaly_x, len(X_all)))
normal_S.append(S(normal_x, len(X_all)))
```

```python
plt.figure(figsize=(10, 5))
plt.plot(range(1, 51, 1), anomaly_mean_depth, c="r")
plt.plot(range(1, 51, 1), normal_mean_depth, c="g")
plt.title("Average path length (n_trees)")
plt.legend(["anomaly", "normal"])
plt.xlabel("Number of trees")
plt.ylabel("Average path length");
```

```python
plt.figure(figsize=(10, 5))
plt.plot(range(1, 51, 1), anomaly_S, c="r")
plt.plot(range(1, 51, 1), normal_S, c="g")
plt.title("S (n_trees)")
plt.legend(["anomaly", "normal"])
plt.xlabel("Number of trees")
plt.ylabel("S(x,n)");
```

As we can see anomaly object has obviously less path depth and bigger $S(x,n)$. Also we don't need many trees to detect anomalies, approximately at 15 trees we reach the asymptote.

Ok, let's find outliers in 2-d data. We will use IsolationForest with 30 trees to find our otliers and check the quality of detection.

```python
# Generating 2d-data
random_generator = np.random.RandomState(42)

# Generating normal data
X_normal = random_generator.randn(2000, 2) * 0.5
X_normal = pd.DataFrame(X_normal, columns=["x1", "x2"])
X_normal["type"] = "normal"

# Generating outliers
X_outliers_1 = random_generator.uniform(low=-6, high=6, size=(78, 2))
X_outliers_2 = random_generator.uniform(low=-6, high=-3, size=(35, 2))

X_outliers = np.vstack([X_outliers_1, X_outliers_2])

X_outliers = pd.DataFrame(X_outliers, columns=["x1", "x2"])
X_outliers["R"] = X_outliers["R"] = np.sqrt(
X_outliers["x1"] ** 2 + X_outliers["x2"] ** 2
)
X_outliers = X_outliers[X_outliers["R"] > 3].drop(columns=["R"])
X_outliers["type"] = "anomaly"

# Full data

X_full = pd.concat([X_normal, X_outliers])
```

```python
plt.figure(figsize=(8, 8))
plt.scatter(X_outliers["x1"], X_outliers["x2"], c="r")
plt.scatter(X_normal["x1"], X_normal["x2"], c="g")
plt.xlabel("x1")
plt.ylabel("x2")
plt.legend(["outliers", "normal"])
plt.title("2d distribution");
```

```python
X_normal.shape, X_outliers.shape, X_full.shape
```

```python
%%time
MyIF = MyIsolationForest(X_full[["x1", "x2"]], 30)
```

```python
X_outliers.iloc[0, :]
```

```python
X_normal.iloc[0, :]
```

```python
%%time

aScore = []

for i in range(X_full.shape[0]):
depth = []
for iTree in MyIF:
depth.append(path_length(X_full.iloc[i, :], iTree, 0))

aScore.append(S(depth, X_full.shape[0]))
```

```python
X_full["aScore"] = aScore
```

```python
t = X_full["aScore"].quantile(0.95)
X_full["Outlier"] = X_full["aScore"].apply(
lambda x: -1 if x >= t else 1
) # -1 for outliers and 1 for normal object
```

```python
plt.hist(X_full["aScore"])
plt.xlabel("Anomaly Score");
```

```python
plt.figure(figsize=(10, 7))
plt.scatter(X_full["x1"], X_full["x2"], c=X_full["Outlier"])
plt.title("Detection outliers using MyIF")
plt.xlabel("x1")
plt.ylabel("x2");
```

Reader may notice that our forest works long enough. What will happen to the larger dataset? But fortunately, during the experiments, the authors of this algorithm found that not all data should be used to build a single tree from a forest, which leads not only to an increase in the speed of work, but also improves the quality of anomalies detection. This is because subsamples have fewer normal points ‘interfering’ with anomalies, thus, making anomalies easier to isolate. It is shown on the image below.

```python
X_sample = X_full.sample(256)
plt.figure(figsize=(8, 8))
plt.scatter(
X_sample["x1"], X_sample["x2"], c=X_sample["type"].map({"normal": 1, "anomaly": -1})
)
plt.xlabel("x1")
plt.ylabel("x2")
plt.title("2d distribution of Sample (size=256)");
```

We won't develop our IsolationForest and will use sklearn's version with these improvements further.

# Sklearn is our everything!

```python
# Import IsolationForest

from sklearn.ensemble import IsolationForest
```

#### IsolationForest important params:

n_estimators - The number of base estimators in the ensemble, default=100.
max_sample - The number of samples from data to train each tree in the forest, default "auto" = min(256, n_samples)
max_features - The number of features from data to train each tree in the forest, default = 1.0 (all features)
bootstrap - bootstrap, default=False
contamination - The proportion of outliers in the data set, threshold, default = 0.1

We will test this implementation of IF on our 2-d dataset.

```python
isof = IsolationForest(random_state=77, n_jobs=4, contamination=0.05)
```

```python
%%time
isof.fit(X_full[["x1", "x2"]])
```

Very fast! How about the quality?

```python
# predictions
y_pred_full = isof.predict(X_full[["x1", "x2"]])
```

```python
X_full["Outlier_sk"] = y_pred_full
```

```python
plt.figure(figsize=(10, 7))
plt.scatter(X_full["x1"], X_full["x2"], c=X_full["Outlier_sk"])
plt.title("Detection outliers using sklearn.IF")
plt.xlabel("x1")
plt.ylabel("x2");
```

Image looks grate! Purple points are outliers which IsolationForest found.

```python
# count of detected outliers "-1"
X_full.iloc[2000:, 4].value_counts()
```

As we can see our IsolationForest found almost of outliers.

# Time to challenge!

It this part of tutorial we will compare IsolationForest with another algorithms. We will use this data set from Kaggle: https://www.kaggle.com/mlg-ulb/creditcardfraud

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from xgboost import XGBClassifier

pd.options.display.max_columns = 500
```

```python
data = pd.read_csv("creditcard.csv")
```

Let's look at the data. All features are numeric, so we will not do any data processing and will train models on what we downloaded. To prevent overfitting of supervised models we will devide initial dataset by train and test parts.

```python
data.head()
```

```python
data.describe()
```

```python
X = data.drop(columns=["Class"])
y = data["Class"]
```

```python
X_train, X_test, y_train, y_test = train_test_split(
X, y, test_size=0.3, random_state=17
)
```

```python
# Look at portion of fraud transactions
y.mean(), y_train.mean(), y_test.mean(), len(y[y == 1]), len(y), len(y_test), len(
y_test[y_test == 1]
)
```

Whoah! Fraud transactions is about 0.2% of all transactions!
We will use all algorithms "from the box" without tuning parameters. We need to find fraud transcations quickly and as much as possible.

```python
# supervised
rf = RandomForestClassifier(random_state=42, n_jobs=4)
lr = LogisticRegression(random_state=42)
xg = XGBClassifier(random_state=42, n_jobs=4)
# unsupervised
IF = IsolationForest(random_state=42, n_jobs=4, contamination=0.01, n_estimators=300)
LOF = LocalOutlierFactor(contamination=0.01, n_jobs=4)
```

```python
%%time
rf.fit(X_train, y_train)
```

```python
%%time
lr.fit(X_train, y_train)
```

```python
%%time
xg.fit(X_train, y_train)
```

```python
%%time
IF.fit(X_train, y_train)
```

```python
%%time
LOF.fit(X_train, y_train)
```

```python
rf_pred = rf.predict_proba(X_test)[:, 1]
lr_pred = lr.predict_proba(X_test)[:, 1]
xg_pred = xg.predict_proba(X_test)[:, 1]
IF_pred = IF.predict(X_test)
LOF_pred = LOF.fit_predict(X_test)
```

```python
X_test["true"] = y_test
X_test["IF_pred"] = IF_pred
X_test["LOF_pred"] = LOF_pred
X_test["xg_pred"] = xg_pred
X_test["rf_pred"] = rf_pred
X_test["lr_pred"] = lr_pred
```

Let's check how many fraud transactions found each algorithm:

```python
X_test[X_test["IF_pred"] == -1]["true"].value_counts()
```

```python
X_test[X_test["LOF_pred"] == -1]["true"].value_counts()
```

```python
X_test.sort_values(by="rf_pred", ascending=False)["true"].head(855).value_counts()
```

```python
X_test.sort_values(by="lr_pred", ascending=False)["true"].head(855).value_counts()
```

```python
X_test.sort_values(by="xg_pred", ascending=False)["true"].head(855).value_counts()
```

As we can see Isolation Forest solved this problem worse than supervised algorithms, but on the whole it is very good for the random. And compared to the LOF, the result is much better. And in this case we don't need to know what transactions are fraud - make a train dataset with target variable.

# Conclusion

In the conclusion ot the tutorial I want to summarise everything about Isolation Forest. This algorithm has very simple idea of anomaly detection: it isolates anomalies rather than normal observations. Also Isolation Forest converges quickly with a small ensemble size, which enables it to detect anomalies with high efficiency.

If you want to learn more about Isolation Forest, I recommend reading the article from the authors of the algorithm:

http://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf

https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/tkdd11.pdf
