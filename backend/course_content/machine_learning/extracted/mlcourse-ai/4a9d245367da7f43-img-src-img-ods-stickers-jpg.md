# <img src="../../img/ods_stickers.jpg" />

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_chinese/assignments_demo/assignment04-逻辑回归用于讽刺文本检测.ipynb
Original Path: jupyter_chinese/assignments_demo/assignment04-逻辑回归用于讽刺文本检测.ipynb
Course: Machine Learning

<img src="../../img/ods_stickers.jpg" />

## 逻辑回归用于讽刺文本检测

本次挑战使用论文 [<i class="fa fa-external-link-square" aria-hidden="true"> A Large Self-Annotated Corpus for Sarcasm</i>](https://arxiv.org/abs/1704.05579) 提供的语料数据。该语料数据来源于 Reddit 论坛，挑战通过下面的链接下载并解压数据：

```python
!wget -nc "http://labfile.oss.aliyuncs.com/courses/1283/train-balanced-sarcasm.csv.zip"
!unzip -o "train-balanced-sarcasm.csv.zip"
```

首先，导入挑战所需的必要模块。

```python
import os
import warnings

import numpy as np
import pandas as pd
import seaborn as sns
from matplotlib import pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

warnings.filterwarnings("ignore")
```

然后，加载语料并预览。

```python
train_df = pd.read_csv("train-balanced-sarcasm.csv")
train_df.head()
```

查看数据集变量类别信息。

```python
train_df.info()
```

`comment` 的数量小于其他特征数量，说明存在缺失值。这里直接将这些缺失数据样本删除。

```python
train_df.dropna(subset=["comment"], inplace=True)
```

输出数据标签，看一看类别是否平衡。

```python
train_df["label"].value_counts()
```

最后，将数据切分为训练和测试集。

```python
train_texts, valid_texts, y_train, y_valid = train_test_split(
train_df["comment"], train_df["label"], random_state=17
)
```

### 数据可视化探索

首先，使用条形图可视化讽刺和正常文本长度，这里利用 `np.log1p` 对数据进行平滑处理，压缩到一定区间范围内。

```python
train_df.loc[train_df["label"] == 1, "comment"].str.len().apply(np.log1p).hist(
label="sarcastic", alpha=0.5
)
train_df.loc[train_df["label"] == 0, "comment"].str.len().apply(np.log1p).hist(
label="normal", alpha=0.5
)
plt.legend()
```

可以看的，二者在不同长度区间范围（横坐标）的计数分布比较均匀。接下来，挑战需要利用 WordCloud 绘制讽刺文本和正常文本关键词词云图。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>参考 [<i class="fa fa-external-link-square" aria-hidden="true"> WordCloud 官方文档</i>](https://github.com/amueller/word_cloud) 绘制两类评论文本词云图，可自定义样式效果。

```python
!pip install wordcloud # 安装必要模块
```

词云非常好看，但往往看不出太多有效信息。

`subreddit` 表示评论归属于 Reddit 论坛子板块信息。下面，我们使用 `groupby` 来确定各子板块讽刺评论数量排序。

```python
sub_df = train_df.groupby("subreddit")["label"].agg([np.size, np.mean, np.sum])
sub_df.sort_values(by="sum", ascending=False).head(10)
```

上面的代码中，`np.size` 可以计算出不同子板块评论的总数。由于讽刺评论的标签为 1，正常评论为 0，所以通过 `sum` 求和操作就可以直接求出讽刺评论的计数。同理，`mean` 即代表讽刺评论所占比例。这是一个分析处理小技巧。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>沿用以上数据，输出子板块评论数大于 1000 且讽刺评论比例排名前 10 的信息。

同理，可以从用户的维度去分析讽刺评论的比例分布。下面就需要分析得出不同用户 `author` 发表评论的数量、讽刺评论的数量及比例。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>输出发表评论总数大于 300，且讽刺评论比例最高的 10 位用户信息。

### 训练分类模型

接下来，我们训练讽刺评论分类预测模型。这里，我们使用 tf-idf 提取文本特征，并建立逻辑回归模型。

```python
# 使用 tf-idf 提取文本特征
tf_idf = TfidfVectorizer(ngram_range=(1, 2), max_features=50000, min_df=2)
# 建立逻辑回归模型
logit = LogisticRegression(C=1, n_jobs=4, solver="lbfgs", random_state=17, verbose=1)
# 使用 sklearn pipeline 封装 2 个步骤
tfidf_logit_pipeline = Pipeline([("tf_idf", tf_idf), ("logit", logit)])
```

下面就可以开始训练模型了。由于数据量较大，代码执行时间较长，请耐心等待。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>训练讽刺文本分类预测模型，并得到测试集上的准确度评估结果。

### 模型解释

接下来，挑战构建一个混淆矩阵的函数 `plot_confusion_matrix`。

```python
def plot_confusion_matrix(
actual,
predicted,
classes,
normalize=False,
title="Confusion matrix",
figsize=(7, 7),
cmap=plt.cm.Blues,
path_to_save_fig=None,
):
"""
This function prints and plots the confusion matrix.
Normalization can be applied by setting `normalize=True`.
"""
import itertools

from sklearn.metrics import confusion_matrix

cm = confusion_matrix(actual, predicted).T
if normalize:
cm = cm.astype("float") / cm.sum(axis=1)[:, np.newaxis]

plt.figure(figsize=figsize)
plt.imshow(cm, interpolation="nearest", cmap=cmap)
plt.title(title)
plt.colorbar()
tick_marks = np.arange(len(classes))
plt.xticks(tick_marks, classes, rotation=90)
plt.yticks(tick_marks, classes)

fmt = ".2f" if normalize else "d"
thresh = cm.max() / 2.0
for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
plt.text(
j,
i,
format(cm[i, j], fmt),
horizontalalignment="center",
color="white" if cm[i, j] > thresh else "black",
)

plt.tight_layout()
plt.ylabel("Predicted label")
plt.xlabel("True label")

if path_to_save_fig:
plt.savefig(path_to_save_fig, dpi=300, bbox_inches="tight")
```

应用 `plot_confusion_matrix` 绘制出测试数据原始标签和预测标签类别的混淆矩阵。

```python
plot_confusion_matrix(
y_valid,
valid_pred,
tfidf_logit_pipeline.named_steps["logit"].classes_,
figsize=(8, 8),
)
```

实际上，这里利用 `eli5` 可以输出分类器在预测判定是文本特征的权重。

```python
!pip install eli5 # 安装必要模块
```

```python
import eli5

eli5.show_weights(
estimator=tfidf_logit_pipeline.named_steps["logit"],
vec=tfidf_logit_pipeline.named_steps["tf_idf"],
)
```

我们可以发现，讽刺评论通常都喜欢使用 yes, clearly 等带有肯定意味的词句。

<img src="https://doc.shiyanlou.com/courses/uid214893-20190505-1557034785375">

### 模型改进

接下来，我们期望模型能得到进一步改进，所以再补充一个 `subreddit` 特征，同样完成切分。注意，这里切分时一定要选择同一个 `random_state`，保证能和上面的评论数据对齐。

```python
subreddits = train_df["subreddit"]
train_subreddits, valid_subreddits = train_test_split(subreddits, random_state=17)
```

接下来，同样使用 tf-idf 算法分别构建 2 个 `TfidfVectorizer` 用于 `comment` 和 `subreddits` 的特征提取。

```python
tf_idf_texts = TfidfVectorizer(ngram_range=(1, 2), max_features=50000, min_df=2)
tf_idf_subreddits = TfidfVectorizer(ngram_range=(1, 1))
```

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>使用构建好的 `TfidfVectorizer` 完成特征提取。

然后，将提取出来的特征拼接在一起。

```python
from scipy.sparse import hstack

X_train = hstack([X_train_texts, X_train_subreddits])
X_valid = hstack([X_valid_texts, X_valid_subreddits])
```

```python
X_train.shape, X_valid.shape
```

最后，同样使用逻辑回归进行建模和预测。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>使用新特征训练逻辑回归分类模型并得到测试集上的分类准确度。

不出意外的话，准确度会更高一些。

<i class="fa fa-link" aria-hidden="true"> 相关链接</i>
- [<i class="fa fa-external-link-square" aria-hidden="true"> Machine learning library Scikit-learn</i>](https://scikit-learn.org/stable/index.html)
- [<i class="fa fa-external-link-square" aria-hidden="true"> Kernels on logistic regression</i>](https://www.kaggle.com/kashnitsky/topic-4-linear-models-part-2-classification)
- [<i class="fa fa-external-link-square" aria-hidden="true"> ELI5 to explain model predictions</i>](https://github.com/TeamHG-Memex/eli5)

<div style="background-color: #e6e6e6; margin-bottom: 10px; padding: 1%; border: 1px solid #ccc; border-radius: 6px;text-align: center;"><a href="https://nbviewer.jupyter.org/github/shiyanlou/mlcourse-answers/tree/master/" title="挑战参考答案"><i class="fa fa-file-code-o" aria-hidden="true"> 查看挑战参考答案</i></a></div>
