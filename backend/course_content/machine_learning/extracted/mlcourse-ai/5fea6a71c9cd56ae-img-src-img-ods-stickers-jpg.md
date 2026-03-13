# <img src="../../img/ods_stickers.jpg" />

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_chinese/assignments_demo/assignment09-时间序列分析应用练习.ipynb
Original Path: jupyter_chinese/assignments_demo/assignment09-时间序列分析应用练习.ipynb
Course: Machine Learning

<img src="../../img/ods_stickers.jpg" />

## 时间序列分析应用练习

本次挑战将关注于时间序列分析及应用，首先导入挑战所需的部分模块。

```python
import os
import warnings

import numpy as np
import pandas as pd
import requests
from plotly import graph_objs as go
from plotly.offline import download_plotlyjs, init_notebook_mode, iplot, plot

init_notebook_mode(connected=True)
warnings.filterwarnings("ignore")
```

首先读取并加载示例数据集，这里选择了维基百科 Machine Learning 页面每日浏览量统计数据。

```python
df = pd.read_csv("../../data/wiki_machine_learning.csv", sep=" ")
df = df[df["count"] != 0]
df.head()
```

```python
df.shape
```

### Prophet 建模预测

首先，挑战需要将原数据中的时间字符串处理成日期格式。

```python
df.date = pd.to_datetime(df.date)
df.head()
```

```python
df.tail()
```

接下来，使用 plotly 提供的方法定义一个 `plotly_df` 函数，以方便绘制出可交互式图像。

```python
def plotly_df(df, title=""):
data = []
for column in df.columns:
trace = go.Scatter(x=df.index, y=df[column], mode="lines", name=column)
data.append(trace)

layout = dict(title=title)
fig = dict(data=data, layout=layout)
iplot(fig, show_link=False)
```

然后，利用定义好的绘图函数，绘制数据集浏览量随时间的变化情况。

```python
plotly_df(df.set_index("date")[["count"]])
```

下面，我们尝试使用 Prophet 预测时间序列数据。首先将 DataFrame 处理成 Prophet 支持的格式。

```python
df = df[["date", "count"]]
df.columns = ["ds", "y"]
df.tail()
```

然后，将原始数据后 30 条切分用于预测，只使用 30 条之前的历史数据进行建模。

```python
predictions = 30
train_df = df[:-predictions].copy()
train_df.tail()
```

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>请使用 Prophet 对 `train_df` 数据建模，预测后 30 天的结果。并回答 1 月 20 日当天的预测结果是多少？

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>Prophet 预测值和真实值之间的 MAPE 和 MSE 值为多少？

### ARIMA 建模预测

接下来，使用 statsmodels 提供的相关方法进行时间序列建模。同样先导入一些需要的模块：

```python
import matplotlib.pyplot as plt
import statsmodels.api as sm
from scipy import stats

%matplotlib inline
plt.rcParams["figure.figsize"] = (15, 10)
```

<i class="fa fa-question-circle" aria-hidden="true"> 问题：</i>下面使用 Dickey-Fuller 测试来验证序列的平稳性。`train_df` 是平稳序列吗？最终的 p 值是多少？

<div style="background-color: #e6e6e6; margin-bottom: 10px; padding: 1%; border: 1px solid #ccc; border-radius: 6px;text-align: center;"><a href="https://nbviewer.jupyter.org/github/shiyanlou/mlcourse-answers/tree/master/" title="挑战参考答案"><i class="fa fa-file-code-o" aria-hidden="true"> 查看挑战参考答案</i></a></div>
