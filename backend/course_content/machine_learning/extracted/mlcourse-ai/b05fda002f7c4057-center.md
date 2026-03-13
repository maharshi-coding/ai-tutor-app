# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/topic02_visual_data_analysis/topic2_practice_visual_titanic.ipynb
Original Path: jupyter_english/topic02_visual_data_analysis/topic2_practice_visual_titanic.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg" />

## [mlcourse.ai](https://mlcourse.ai) – Open Machine Learning Course

Author: [Yury Kashnitsky](https://yorko.github.io). This material is subject to the terms and conditions of the [Creative Commons CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. Free use is permitted for any non-commercial purpose.

# <center> Topic 2. Visual data analysis
## <center>Practice. Analyzing "Titanic" passengers

**Fill in the missing code ("You code here"). No need to select answers in a webform.**

**<a href="https://www.kaggle.com/c/titanic">Competition</a> Kaggle "Titanic: Machine Learning from Disaster".**

```python
import numpy as np
import pandas as pd
import seaborn as sns

sns.set()
import matplotlib.pyplot as plt
```

**Read data**

```python
train_df = pd.read_csv("../../data/titanic_train.csv", index_col="PassengerId")
```

```python
train_df.head(2)
```

```python
train_df.describe(include="all")
```

```python
train_df.info()
```

**Let's drop`Cabin`, and then – all rows with missing values.**

```python
train_df = train_df.drop("Cabin", axis=1).dropna()
```

```python
train_df.shape
```

**1. Build a picture to visualize all scatter plots for each pair of features `Age`, `Fare`, `SibSp`, `Parch` and `Survived`. ( `scatter_matrix ` from Pandas or `pairplot` from Seaborn)**

```python
# You code here
```

**2. How does ticket price (`Fare`) depend on `Pclass`? Build a boxplot.**

```python
# You code here
```

**3. Let's build the same plot but restricting values of `Fare` to be less than 95% quantile of the initial vector (to drop outliers that make the plot less clear).**

```python
# You code here
```

**4. How is the percentage of surviving passengers dependent on passengers' gender? Depict it with `Seaborn.countplot` using the `hue` argument.**

```python
# You code here
```

**5. How does the distribution of ticket prices differ for those who survived and those who didn't. Depict it with `Seaborn.boxplot`**

```python
# You code here
```

**6. How does survival depend on passengers' age? Verify (graphically) an assumption that youngsters (< 30 y.o.) survived more frequently than old people (> 55 y.o.).**

```python
# You code here
```

## Useful resources
* The same notebook as an interactive web-based [Kaggle Kernel](https://www.kaggle.com/kashnitsky/topic-2-practice-visualization) with a [solution](https://www.kaggle.com/kashnitsky/topic-2-practice-solution)
* Topic 2 "Visual data analysis in Python" as a [Kaggle Kernel](https://www.kaggle.com/kashnitsky/topic-2-visual-data-analysis-in-python)
* Main course [site](https://mlcourse.ai), [course repo](https://github.com/Yorko/mlcourse.ai), and YouTube [channel](https://www.youtube.com/watch?v=QKTuw4PNOsU&list=PLVlY_7IJCMJeRfZ68eVfEcu-UcN9BbwiX)
