# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/topic01_pandas_data_analysis/topic1_practice_pandas_titanic.ipynb
Original Path: jupyter_english/topic01_pandas_data_analysis/topic1_practice_pandas_titanic.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg" />

## [mlcourse.ai](https://mlcourse.ai) – Open Machine Learning Course

Author: [Yury Kashnitsky](https://yorko.github.io). This material is subject to the terms and conditions of the [Creative Commons CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) license. Free use is permitted for any non-commercial purpose.

# <center> Topic 1. Exploratory data analysis with Pandas
## <center>Practice. Analyzing "Titanic" passengers

**Fill in the missing code ("You code here") and choose answers in a [web-form](https://docs.google.com/forms/d/16EfhpDGPrREry0gfDQdRPjoiQX9IumaL2mPR0rcj19k/edit).**

```python
import numpy as np
import pandas as pd
from matplotlib import pyplot as plt

# Graphics in SVG format are more sharp and legible
%config InlineBackend.figure_format = 'svg'
pd.set_option("display.precision", 2)
```

**Read data into a Pandas DataFrame**

```python
data = pd.read_csv("../../data/titanic_train.csv", index_col="PassengerId")
```

**First 5 rows**

```python
data.head(5)
```

```python
data.describe()
```

**Let's select those passengers who embarked in Cherbourg (Embarked=C) and paid > 200 pounds for their ticker (fare > 200).**

Make sure you understand how actually this construction works.

```python
data[(data["Embarked"] == "C") & (data.Fare > 200)].head()
```

**We can sort these people by Fare in descending order.**

```python
data[(data["Embarked"] == "C") & (data["Fare"] > 200)].sort_values(
by="Fare", ascending=False
).head()
```

**Let's create a new feature.**

```python
def age_category(age):
"""
< 30 -> 1
>= 30, <55 -> 2
>= 55 -> 3
"""
if age < 30:
return 1
elif age < 55:
return 2
elif age >= 55:
return 3
```

```python
age_categories = [age_category(age) for age in data.Age]
data["Age_category"] = age_categories
```

**Another way is to do it with `apply`.**

```python
data["Age_category"] = data["Age"].apply(age_category)
```

**1. How many men/women were there onboard?**
- 412 men and 479 women
- 314 men and 577 women
- 479 men and 412 women
- 577 men and 314 women

```python
# You code here
```

**2. Print the distribution of the `Pclass` feature. Then the same, but for men and women separately. How many men from second class were there onboard?**
- 104
- 108
- 112
- 125

```python
# You code here
```

**3. What are median and standard deviation of `Fare`?. Round to two decimals.**
- median is 14.45, standard deviation is 49.69
- median is 15.1, standard deviation is 12.15
- median is 13.15, standard deviation is 35.3
- median is 17.43, standard deviation is 39.1

```python
# You code here
```

**4. Is that true that the mean age of survived people is higher than that of passengers who eventually died?**
- Yes
- No

```python
# You code here
```

**5. Is that true that passengers younger than 30 y.o. survived more frequently than those older than 60 y.o.? What are shares of survived people among young and old people?**
- 22.7% among young and 40.6% among old
- 40.6% among young and 22.7% among old
- 35.3% among young and 27.4% among old
- 27.4% among young and 35.3% among old

```python
# You code here
```

**6. Is that true that women survived more frequently than men? What are shares of survived people among men and women?**
- 30.2% among men and 46.2% among women
- 35.7% among men and 74.2% among women
- 21.1% among men and 46.2% among women
- 18.9% among men and 74.2% among women

```python
# You code here
```

**7. What's the most popular first name among male passengers?**
- Charles
- Thomas
- William
- John

```python
# You code here
```

**8. How is average age for men/women dependent on `Pclass`? Choose all correct statements:**
- On average, men of 1 class are older than 40
- On average, women of 1 class are older than 40
- Men of all classes are on average older than women of the same class
- On average, passengers ofthe first class are older than those of the 2nd class who are older than passengers of the 3rd class

```python
# You code here
```

## Useful resources
* The same notebook as an interactive web-based [Kaggle Kernel](https://www.kaggle.com/kashnitsky/topic-1-practice-analyzing-titanic-passengers) with a [solution](https://www.kaggle.com/kashnitsky/topic-1-practice-solution)
* Topic 1 "Exploratory Data Analysis with Pandas" as a [Kaggle Kernel](https://www.kaggle.com/kashnitsky/topic-1-exploratory-data-analysis-with-pandas)
* Main course [site](https://mlcourse.ai), [course repo](https://github.com/Yorko/mlcourse.ai), and YouTube [channel](https://www.youtube.com/watch?v=QKTuw4PNOsU&list=PLVlY_7IJCMJeRfZ68eVfEcu-UcN9BbwiX)
