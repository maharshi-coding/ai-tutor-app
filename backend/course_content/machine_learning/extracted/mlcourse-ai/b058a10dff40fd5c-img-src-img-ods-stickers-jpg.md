# <img src="../img/ods_stickers.jpg" />

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_chinese/topic01-使用-Pandas-进行数据探索.ipynb
Original Path: jupyter_chinese/topic01-使用-Pandas-进行数据探索.ipynb
Course: Machine Learning

<img src="../img/ods_stickers.jpg" />

## 使用 Pandas 进行数据探索

#### 介绍

本次实验通过分析电信运营商的客户离网率数据集来熟悉 Pandas 数据探索的常用方法，并构建一个预测客户离网率的简单模型。

#### 知识点

- 排列
- 索引
- 交叉表
- 透视表
- 数据探索

<div style="background-color: #FFEAC9; margin-bottom: 10px; padding: 2%; border-radius: 6px;"><p style="line-height: 1.5; font-weight: bold;"> 中文版本说明</p><p style="line-height: 1.5;">本课程中文版本是经由原作者授权 <a href="https://www.shiyanlou.com"><i class="fa fa-external-link-square" aria-hidden="true"> 实验楼</i></a> 编译制作，你可以到 <a href="https://www.shiyanlou.com/courses/1283"><i class="fa fa-external-link-square" aria-hidden="true"> 实验楼课程页面</i></a> 一键启动 Jupyter Notebook 环境学习，若有疑问欢迎到课程页面提出，我们会及时修订。中文版本分发需在遵循原开源协议基础上保留实验楼作为译者署名及链接。</p></div>

### Pandas 的主要方法

Pandas 是基于 NumPy 的一种工具，提供了大量数据探索的方法。Pandas 可以使用类似 SQL 的方式对 .csv、.tsv、.xlsx 等格式的数据进行处理分析。

Pandas 主要使用的数据结构是 Series 和 DataFrame 类。下面简要介绍下这两类：

- Series 是一种类似于一维数组的对象，它由一组数据（各种 NumPy 数据类型）及一组与之相关的数据标签（即索引）组成。
- DataFrame 是一个二维数据结构，即一张表格，其中每列数据的类型相同。你可以把它看成由 Series 实例构成的字典。

下面开始此次实验，我们将通过分析电信运营商的客户离网率数据集来展示 Pandas 的主要方法。

首先载入必要的库，即 NumPy 和 Pandas。

<i class="fa fa-arrow-circle-down" aria-hidden="true"> 教学代码：</i>

```python
import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
```

通过 `read_csv()` 方法读取数据，然后使用 `head()` 方法查看前 5 行数据。

```python
df = pd.read_csv("../../data/telecom_churn.csv")
df.head()
```

Output:
```text
State Account length ... Customer service calls Churn
0 KS 128 ... 1 False
1 OH 107 ... 1 False
2 NJ 137 ... 0 False
3 OH 84 ... 2 False
4 OK 75 ... 3 False

[5 rows x 20 columns]
```

上图中的每行对应一位客户，每列对应客户的一个特征。

让我们查看一下该数据库的维度、特征名称和特征类型。

```python
df.shape
```

Output:
```text
(3333, 20)
```

上述结果表明，我们的列表包含 3333 行和 20 列。下面我们尝试打印列名。

```python
df.columns
```

Output:
```text
Index(['State', 'Account length', 'Area code', 'International plan',
'Voice mail plan', 'Number vmail messages', 'Total day minutes',
'Total day calls', 'Total day charge', 'Total eve minutes',
'Total eve calls', 'Total eve charge', 'Total night minutes',
'Total night calls', 'Total night charge', 'Total intl minutes',
'Total intl calls', 'Total intl charge', 'Customer service calls',
'Churn'],
dtype='object')
```

我们还可以使用 `info()` 方法输出 DataFrame 的一些总体信息。

```python
df.info()
```

Output:
```text
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 3333 entries, 0 to 3332
Data columns (total 20 columns):
State 3333 non-null object
Account length 3333 non-null int64
Area code 3333 non-null int64
International plan 3333 non-null object
Voice mail plan 3333 non-null object
Number vmail messages 3333 non-null int64
Total day minutes 3333 non-null float64
Total day calls 3333 non-null int64
Total day charge 3333 non-null float64
Total eve minutes 3333 non-null float64
Total eve calls 3333 non-null int64
Total eve charge 3333 non-null float64
Total night minutes 3333 non-null float64
Total night calls 3333 non-null int64
Total night charge 3333 non-null float64
Total intl minutes 3333 non-null float64
Total intl calls 3333 non-null int64
Total intl charge 3333 non-null float64
Customer service calls 3333 non-null int64
Churn 3333 non-null bool
dtypes: bool(1), float64(8), int64(8), object(3)
memory usage: 498.1+ KB
```

`bool`、`int64`、`float64` 和 `object` 是该数据库特征的数据类型。这一方法同时也会显示是否有缺失值，上述结果表明在该数据集中不存在缺失值，因为每列都包含 3333 个观测，和我们之前使用 `shape` 方法得到的数字是一致的。

`astype()` 方法可以更改列的类型，下列公式将 Churn 离网率 特征修改为 `int64` 类型。

```python
df["Churn"] = df["Churn"].astype("int64")
```

`describe()` 方法可以显示数值特征（`int64` 和 `float64`）的基本统计学特性，如未缺失值的数值、均值、标准差、范围、四分位数等。

```python
df.describe()
```

Output:
```text
Account length ... Churn
count 3333.000000 ... 3333.000000
mean 101.064806 ... 0.144914
std 39.822106 ... 0.352067
min 1.000000 ... 0.000000
25% 74.000000 ... 0.000000
50% 101.000000 ... 0.000000
75% 127.000000 ... 0.000000
max 243.000000 ... 1.000000

[8 rows x 17 columns]
```

通过 include 参数显式指定包含的数据类型，可以查看非数值特征的统计数据。

```python
df.describe(include=["object", "bool"])
```

Output:
```text
State International plan Voice mail plan
count 3333 3333 3333
unique 51 2 2
top WV No No
freq 106 3010 2411
```

`value_counts()` 方法可以查看类别（类型为 object ）和布尔值（类型为 bool ）特征。让我们看下 Churn 离网率 的分布。

```python
df["Churn"].value_counts()
```

Output:
```text
0 2850
1 483
Name: Churn, dtype: int64
```

上述结果表明，在 3333 位客户中， 2850 位是忠实客户，他们的 `Churn` 值为 0。调用 `value_counts()` 函数时，加上 `normalize=True` 参数可以显示比例。

```python
df["Churn"].value_counts(normalize=True)
```

Output:
```text
0 0.855086
1 0.144914
Name: Churn, dtype: float64
```

### 排序

DataFrame 可以根据某个变量的值（也就是列）排序。比如，根据每日消费额排序（设置 ascending=False 倒序排列）。

```python
df.sort_values(by="Total day charge", ascending=False).head()
```

Output:
```text
State Account length ... Customer service calls Churn
365 CO 154 ... 1 1
985 NY 64 ... 1 1
2594 OH 115 ... 1 1
156 OH 83 ... 0 1
605 MO 112 ... 2 1

[5 rows x 20 columns]
```

此外，还可以根据多个列的数值排序。下面函数实现的功能为：先按 Churn 离网率 升序排列，再按 Total day charge 每日总话费 降序排列，优先级 Churn > Tatal day charge。

```python
df.sort_values(by=["Churn", "Total day charge"], ascending=[True, False]).head()
```

Output:
```text
State Account length ... Customer service calls Churn
688 MN 13 ... 3 0
2259 NC 210 ... 3 0
534 LA 67 ... 4 0
575 SD 114 ... 1 0
2858 AL 141 ... 1 0

[5 rows x 20 columns]
```

### 索引和获取数据

DataFrame 可以以不同的方式进行索引。

使用 `DataFrame['Name']` 可以得到一个单独的列。比如，离网率有多高？

```python
df["Churn"].mean()
```

Output:
```text
0.14491449144914492
```

对一家公司而言，14.5% 的离网率是一个很糟糕的数据，这么高的离网率可能导致公司破产。

布尔值索引同样很方便，语法是 `df[P(df['Name'])]`，P 是在检查 Name 列每个元素时所使用的逻辑条件。这一索引的输出是 DataFrame 的 Name 列中满足 P 条件的行。

让我们使用布尔值索引来回答这样以下问题：离网用户的数值变量的均值是多少？

```python
df[df["Churn"] == 1].mean()
```

Output:
```text
Account length 102.664596
Area code 437.817805
Number vmail messages 5.115942
Total day minutes 206.914079
Total day calls 101.335404
Total day charge 35.175921
Total eve minutes 212.410145
Total eve calls 100.561077
Total eve charge 18.054969
Total night minutes 205.231677
Total night calls 100.399586
Total night charge 9.235528
Total intl minutes 10.700000
Total intl calls 4.163561
Total intl charge 2.889545
Customer service calls 2.229814
Churn 1.000000
dtype: float64
```

离网用户在白天打电话的总时长的均值是多少？

```python
df[df["Churn"] == 1]["Total day minutes"].mean()
```

Output:
```text
206.91407867494814
```

未使用国际套餐（`International plan == NO`）的忠实用户（`Churn == 0`）所打的最长的国际长途是多久？

```python
df[(df["Churn"] == 0) & (df["International plan"] == "No")]["Total intl minutes"].max()
```

Output:
```text
18.9
```

DataFrame 可以通过列名、行名、行号进行索引。`loc` 方法为通过名称索引，`iloc` 方法为通过数字索引。

通过 `loc` 方法输出 0 至 5 行、State 州 至 Area code 区号 的数据。

```python
df.loc[0:5, "State":"Area code"]
```

Output:
```text
State Account length Area code
0 KS 128 415
1 OH 107 415
2 NJ 137 415
3 OH 84 408
4 OK 75 415
5 AL 118 510
```

通过 `ilo` 方法输出前 5 行的前 3 列数据（和典型的 Python 切片一样，不含最大值）。

```python
df.iloc[0:5, 0:3]
```

Output:
```text
State Account length Area code
0 KS 128 415
1 OH 107 415
2 NJ 137 415
3 OH 84 408
4 OK 75 415
```

`df[:1]` 和 `df[-1:]` 可以得到 DataFrame 的首行和末行。

```python
df[-1:]
```

Output:
```text
State Account length ... Customer service calls Churn
3332 TN 74 ... 0 0

[1 rows x 20 columns]
```

### 应用函数到单元格、列、行

下面通过 `apply()` 方法应用函数 `max` 至每一列，即输出每列的最大值。

```python
df.apply(np.max)
```

Output:
```text
State WY
Account length 243
Area code 510
International plan Yes
Voice mail plan Yes
Number vmail messages 51
Total day minutes 350.8
Total day calls 165
Total day charge 59.64
Total eve minutes 363.7
Total eve calls 170
Total eve charge 30.91
Total night minutes 395
Total night calls 175
Total night charge 17.77
Total intl minutes 20
Total intl calls 20
Total intl charge 5.4
Customer service calls 9
Churn 1
dtype: object
```

`apply()` 方法也可以应用函数至每一行，指定 axis=1 即可。在这种情况下，使用 `lambda` 函数十分方便。比如，下面函数选中了所有以 W 开头的州。

```python
df[df["State"].apply(lambda state: state[0] == "W")].head()
```

Output:
```text
State Account length ... Customer service calls Churn
9 WV 141 ... 0 0
26 WY 57 ... 0 0
44 WI 64 ... 1 0
49 WY 97 ... 1 0
54 WY 87 ... 5 1

[5 rows x 20 columns]
```

`map()` 方法可以通过一个 {old_value:new_value} 形式的字典替换某一列中的值。

```python
d = {"No": False, "Yes": True}
df["International plan"] = df["International plan"].map(d)
df.head()
```

Output:
```text
State Account length ... Customer service calls Churn
0 KS 128 ... 1 0
1 OH 107 ... 1 0
2 NJ 137 ... 0 0
3 OH 84 ... 2 0
4 OK 75 ... 3 0

[5 rows x 20 columns]
```

当然，使用 `repalce()` 方法一样可以达到替换的目的。

```python
df = df.replace({"Voice mail plan": d})
df.head()
```

Output:
```text
State Account length ... Customer service calls Churn
0 KS 128 ... 1 0
1 OH 107 ... 1 0
2 NJ 137 ... 0 0
3 OH 84 ... 2 0
4 OK 75 ... 3 0

[5 rows x 20 columns]
```

### 分组（Groupby）

Pandas 下分组数据的一般形式为：

```python
df.groupby(by=grouping_columns)[columns_to_show].function()
```

对上述函数的解释：

- `groupby()` 方法根据 grouping_columns 的值进行分组。
- 接着，选中感兴趣的列（columns_to_show）。若不包括这一项，那么就会选中所有非 groupby 列（即除 grouping_colums 外的所有列）。
- 最后，应用一个或多个函数（function）。

在下面的例子中，我们根据 Churn 离网率 变量的值对数据进行分组，显示每组的统计数据。

```python
columns_to_show = ["Total day minutes", "Total eve minutes", "Total night minutes"]

df.groupby(["Churn"])[columns_to_show].describe(percentiles=[])
```

Output:
```text
Total day minutes ... Total night minutes
count mean std ... min 50% max
Churn ...
0 2850.0 175.175754 50.181655 ... 23.2 200.25 395.0
1 483.0 206.914079 68.997792 ... 47.4 204.80 354.9

[2 rows x 18 columns]
```

和上面的例子类似，只不过这次将一些函数传给 `agg()`，通过 `agg()` 方法对分组后的数据进行聚合。

```python
columns_to_show = ["Total day minutes", "Total eve minutes", "Total night minutes"]

df.groupby(["Churn"])[columns_to_show].agg([np.mean, np.std, np.min, np.max])
```

Output:
```text
Total day minutes ... Total night minutes
mean std amin ... std amin amax
Churn ...
0 175.175754 50.181655 0.0 ... 51.105032 23.2 395.0
1 206.914079 68.997792 0.0 ... 47.132825 47.4 354.9

[2 rows x 12 columns]
```

### 汇总表

Pandas 中的透视表定义如下：

> 透视表(Pivot Table)是电子表格程序和其他数据探索软件中一种常见的数据汇总工具。它根据一个或多个键对数据进行聚合，并根据行和列上的分组将数据分配到各个矩形区域中。

通过 `pivot_table()` 方法可以建立透视表，其参数如下：

- values 表示需要计算的统计数据的变量列表
- index 表示分组数据的变量列表
- aggfunc 表示需要计算哪些统计数据，例如，总和、均值、最大值、最小值等。

现在，通过 `pivot_table()` 方法查看不同区号下白天、夜晚、深夜的电话量的均值。

```python
df.pivot_table(
["Total day calls", "Total eve calls", "Total night calls"],
["Area code"],
aggfunc="mean",
)
```

Output:
```text
Total day calls ... Total night calls
Area code ...
408 100.496420 ... 99.039379
415 100.576435 ... 100.398187
510 100.097619 ... 100.601190

[3 rows x 3 columns]
```

`pivot_table()` 其他的使用方法见 [<i class="fa fa-external-link-square" aria-hidden="true"> Pandas 百题大冲关</i>](https://www.shiyanlou.com/courses/1091/labs/6138/document) 的透视表部分。

交叉表（Cross Tabulation）是一种用于计算分组频率的特殊透视表，在 Pandas 中一般使用 `crosstab()` 方法构建交叉表。

构建一个交叉表查看样本的 Churn 离网率 和 International plan 国际套餐 的分布情况。

```python
pd.crosstab(df["Churn"], df["International plan"])
```

Output:
```text
International plan False True
Churn
0 2664 186
1 346 137
```

构建一个交叉表查看 Churn 离网率 和 Voice mail plan 语音邮件套餐 的分布情况。

```python
pd.crosstab(df["Churn"], df["Voice mail plan"], normalize=True)
```

Output:
```text
Voice mail plan False True
Churn
0 0.602460 0.252625
1 0.120912 0.024002
```

上述结果表明，大部分用户是忠实用户，同时他们并不使用额外的服务（国际套餐、语音邮件）。

### 增减 DataFrame 的行列

在 DataFrame 中新增列有很多方法，比如，使用 `insert()`方法添加列，为所有用户计算总的 Total calls 电话量。

```python
total_calls = (
df["Total day calls"]
+ df["Total eve calls"]
+ df["Total night calls"]
+ df["Total intl calls"]
)
# loc 参数是插入 Series 对象后选择的列数
# 设置为 len(df.columns)以便将计算后的 Total calls 粘贴到最后一列
df.insert(loc=len(df.columns), column="Total calls", value=total_calls)

df.head()
```

Output:
```text
State Account length ... Churn Total calls
0 KS 128 ... 0 303
1 OH 107 ... 0 332
2 NJ 137 ... 0 333
3 OH 84 ... 0 255
4 OK 75 ... 0 359

[5 rows x 21 columns]
```

上面的代码创建了一个中间 Series 实例，即 tatal_calls，其实可以在不创造这个实例的情况下直接添加列。

```python
df["Total charge"] = (
df["Total day charge"]
+ df["Total eve charge"]
+ df["Total night charge"]
+ df["Total intl charge"]
)
df.head()
```

Output:
```text
State Account length ... Total calls Total charge
0 KS 128 ... 303 75.56
1 OH 107 ... 332 59.24
2 NJ 137 ... 333 62.29
3 OH 84 ... 255 66.80
4 OK 75 ... 359 52.09

[5 rows x 22 columns]
```

使用 `drop()` 方法删除列和行。

```python
# 移除先前创捷的列
df.drop(["Total charge", "Total calls"], axis=1, inplace=True)
# 删除行
df.drop([1, 2]).head()
```

Output:
```text
State Account length ... Customer service calls Churn
0 KS 128 ... 1 0
3 OH 84 ... 2 0
4 OK 75 ... 3 0
5 AL 118 ... 0 0
6 MA 121 ... 3 0

[5 rows x 20 columns]
```

对上述代码的部分解释：

- 将相应的索引 `['Total charge', 'Total calls']` 和 `axis` 参数（1 表示删除列，0 表示删除行，默认值为 0）传给 `drop`。
- `inplace` 参数表示是否修改原始 DataFrame （False 表示不修改现有 DataFrame，返回一个新 DataFrame，True 表示修改当前 DataFrame）。

## 预测离网率

首先，通过上面介绍的 `crosstab()` 方法构建一个交叉表来查看 International plan 国际套餐 变量和 Churn 离网率 的相关性，同时使用 `countplot()` 方法构建计数直方图来可视化结果。

```python
# 加载模块，配置绘图
import matplotlib.pyplot as plt
import seaborn as sns
```

```python
sns.countplot(x="International plan", hue="Churn", data=df)
```

Output:
```text
<matplotlib.axes._subplots.AxesSubplot at 0x7f673133a8d0>

<Figure size 432x288 with 1 Axes>
```

上图表明，开通了国际套餐的用户的离网率要高很多，这是一个很有趣的观测结果。也许，国际电话高昂的话费让客户很不满意。

同理，查看 Customer service calls 客服呼叫 变量与 Chunrn 离网率 的相关性，并可视化结果。

```python
pd.crosstab(df["Churn"], df["Customer service calls"], margins=True)
```

Output:
```text
Customer service calls 0 1 2 3 4 5 6 7 8 9 All
Churn
0 605 1059 672 385 90 26 8 4 1 0 2850
1 92 122 87 44 76 40 14 5 1 2 483
All 697 1181 759 429 166 66 22 9 2 2 3333
```

```python
sns.countplot(x="Customer service calls", hue="Churn", data=df)
```

Output:
```text
<matplotlib.axes._subplots.AxesSubplot at 0x7f672e7bfda0>

<Figure size 432x288 with 1 Axes>
```

上图表明，在客服呼叫 4 次之后，客户的离网率显著提升。

为了更好的突出 Customer service call 客服呼叫 和 Churn 离网率 的关系，可以给 DataFrame 添加一个二元属性 Many_service_calls，即客户呼叫超过 3 次（Customer service calls > 3）。看下它与离网率的相关性，并可视化结果。

```python
df["Many_service_calls"] = (df["Customer service calls"] > 3).astype("int")

pd.crosstab(df["Many_service_calls"], df["Churn"], margins=True)
```

Output:
```text
Churn 0 1 All
Many_service_calls
0 2721 345 3066
1 129 138 267
All 2850 483 3333
```

```python
sns.countplot(x="Many_service_calls", hue="Churn", data=df)
```

Output:
```text
<matplotlib.axes._subplots.AxesSubplot at 0x7f672e745ef0>

<Figure size 432x288 with 1 Axes>
```

现在我们可以创建另一张交叉表，将 Churn 离网率 与 International plan 国际套餐 及新创建的 Many_service_calls 多次客服呼叫 关联起来。

```python
pd.crosstab(df["Many_service_calls"] & df["International plan"], df["Churn"])
```

Output:
```text
Churn 0 1
row_0
False 2841 464
True 9 19
```

上表表明，在客服呼叫次数超过 3 次并且已办理 International Plan 国际套餐 的情况下，预测一名客户不忠诚的准确率（Accuracy）可以达到 85.8％，计算公式如下：

$$准确率（Accuracy）=\frac{TP+TN}{TP+TN+FP+FN}=\frac{2841+19}{2841+9+19+464}\times100\%$$

其中，TP 表示将 True 预测为 True 的数量，TN 表示将 Flase 预测为 Flase 的数量，FP 表示将 Flase 预测为 True 的数量，FN 表示将 True 预测为 Flase 的数量。

复习一下本次实验的内容：

- 样本中忠实客户的份额为 85.5%。这意味着最简单的预测「忠实客户」的模型有 85.5% 的概率猜对。也就是说，后续模型的准确率（Accuracy）不应该比这个数字少，并且很有希望显著高于这个数字。
- 基于一个简单的「（客服呼叫次数 > 3） & （国际套餐 = True） => Churn = 1, else Churn = 0」规则的预测模型，可以得到 85.8% 的准确率。以后我们将讨论决策树，看看如何仅仅基于输入数据自动找出类似的规则，而不需要我们手工设定。我们没有应用机器学习方法就得到了两个准确率（85.5% 和 85.8%），它们可作为后续其他模型的基线。如果经过大量的努力，我们仅将准确率提高了 0.5%，那么我们努力的方向可能出现了偏差，因为仅仅使用一个包含两个限制规则的简单模型就已提升了 0.3% 的准确率。
- 在训练复杂模型之前，建议预处理一下数据，绘制一些图表，做一些简单的假设。此外，在实际任务上应用机器学习时，通常从简单的方案开始，接着尝试更复杂的方案。

### 实验总结

本次实验使用 Pandas 对数据进行了一定程度的分析和探索，交叉表、透视表等方法的运用将使你在数据探索过程中事半功倍。

<i class="fa fa-link" aria-hidden="true"> 相关链接</i>

- [<i class="fa fa-external-link-square" aria-hidden="true"> Pandas 官方文档</i>](http://pandas.pydata.org/pandas-docs/stable/index.html)
- [<i class="fa fa-external-link-square" aria-hidden="true"> 10 minutes to pandas</i>](http://pandas.pydata.org/pandas-docs/stable/10min.html)
- [<i class="fa fa-external-link-square" aria-hidden="true"> Pandas cheatsheet PDF</i>](https://github.com/pandas-dev/pandas/blob/master/doc/cheatsheet/Pandas_Cheat_Sheet.pdf)
- [<i class="fa fa-external-link-square" aria-hidden="true"> scipy-lectures.org 教程</i>](http://www.scipy-lectures.org/index.html)
- [<i class="fa fa-external-link-square" aria-hidden="true"> 了解实验楼《楼+ 机器学习和数据挖掘课程》</i>](https://www.shiyanlou.com/louplus/)
