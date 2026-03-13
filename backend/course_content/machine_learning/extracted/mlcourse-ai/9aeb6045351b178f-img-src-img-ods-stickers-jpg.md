# <img src="../../img/ods_stickers.jpg" />

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_chinese/assignments_demo/assignment01-人口收入普查数据探索.ipynb
Original Path: jupyter_chinese/assignments_demo/assignment01-人口收入普查数据探索.ipynb
Course: Machine Learning

<img src="../../img/ods_stickers.jpg" />

## 人口收入普查数据探索

本次挑战中，你需要运用 Pandas 探索数据，并回答有关 [<i class="fa fa-external-link-square" aria-hidden="true"> Adult 数据集</i>](https://archive.ics.uci.edu/ml/datasets/Adult) 的几个问题。Adult 数据集是一个关于人口收入普查的数据集，其包含多个特征，目标值为类别类型。

首先，我们加载并预览该数据集。

```python
import warnings

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

%matplotlib inline
warnings.filterwarnings("ignore")
```

```python
data = pd.read_csv("../../data/adult.data.csv")
data.head()
```

DataFrame 前面的列均为特征，最后的 `salary` 为目标值。接下来，你需要自行补充必要的代码来回答相应的挑战问题。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>数据集中有多少男性和女性？

```python
# 通过补充代码得到问题的答案，挑战最终需自行对照末尾的参考答案来评判，系统无法自动评分
```

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>数据集中女性的平均年龄是多少？

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>数据集中德国公民的比例是多少？

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>年收入超过 50K 和低于 50K 人群年龄的平均值和标准差是多少？

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>年收入超过 50K 的人群是否都接受过高中以上教育？

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>使用 `groupby` 和 `describe` 统计不同种族和性别人群的年龄分布数据。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>统计男性高收入人群中已婚和未婚（包含离婚和分居）人群各自所占数量。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>统计数据集中最长周工作小时数及对应的人数，并计算该群体中收入超过 50K 的比例。

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>计算各国超过和低于 50K 人群各自的平均周工作时长。

<div style="background-color: #e6e6e6; margin-bottom: 10px; padding: 1%; border: 1px solid #ccc; border-radius: 6px;text-align: center;"><a href="https://nbviewer.jupyter.org/github/shiyanlou/mlcourse-answers/tree/master/" title="挑战参考答案"><i class="fa fa-file-code-o" aria-hidden="true"> 查看挑战参考答案</i></a></div>
