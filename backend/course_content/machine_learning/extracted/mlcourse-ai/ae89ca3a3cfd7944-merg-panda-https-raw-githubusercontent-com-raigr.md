# ![merg_panda](https://raw.githubusercontent.com/Raigred/mlcourse.ai/master/img/merg_panda.jpg "merg_panda")

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/tutorials/merging_dataframes_tutorial_max_palko.ipynb
Original Path: jupyter_english/tutorials/merging_dataframes_tutorial_max_palko.ipynb
Course: Machine Learning

![merg_panda](https://raw.githubusercontent.com/Raigred/mlcourse.ai/master/img/merg_panda.jpg "merg_panda")

# Merging DataFrames with pandas

Here, you'll learn all about merging pandas DataFrames. You'll explore different techniques for merging, and learn about left joins, right joins, inner joins, and outer joins, as well as when to use which. You'll also learn about ordered merging, which is useful when you want to merge DataFrames whose columns have natural orderings, like date-time columns.

```python
import pandas as pd
```

***[DataSets tutorial](https://www.dropbox.com/sh/a0f9yschd7wu2ls/AAAQGizvP5JpV0hYMYg2fdKYa?dl=0)***

### Merging company DataFrames

Suppose your company has operations in several different cities under several different managers. The DataFrames `revenue` and `managers` contain partial information related to the company. That is, the rows of the `city` columns don't quite match in `revenue` and `managers` (the Mendocino branch has no revenue yet since it just opened and the manager of Springfield branch recently left the company).

```python
revenue = pd.read_csv("revenue.csv")
managers = pd.read_csv("managers.csv")
print(revenue)
print(managers)
```

The DataFrames have been printed in the IPython Shell. If you were to run the command `combined = pd.merge(revenue, managers, on='city')`, how many rows would combined have?

```python
combined = pd.merge(revenue, managers, on="city")
print(combined)
```

Correct! Since the default strategy for `pd.merge()` is an *inner join*, `combined` will have 2 rows.

The merge command is the key learning objective of this tutorial. The merging operation at its simplest takes a left dataframe (the first argument), a right dataframe (the second argument), and then a merge column name, or a column to merge “on”. In the output/result, rows from the left and right dataframes are matched up where there are common values of the merge column specified by “on”.

An *inner merge, (or inner join)* keeps only the common values in both the left and right dataframes for the result.

### Merging on a specific column

You expect your company to grow and, eventually, to operate in cities with the same name on different states. As such, you decide that every branch should have a numerical branch identifier. Thus, you add a `branch_id` column to both DataFrames. Moreover, new cities have been added to both the `revenue` and `managers` DataFrames as well.

```python
revenue = pd.read_csv("revenue_branch_id.csv")
managers = pd.read_csv("managers_branch_id.csv")
print(revenue)
print(managers)
```

Using `pd.merge()`, merge the DataFrames `revenue` and `managers` on the `'city'` column of each

```python
merge_by_city = pd.merge(revenue, managers, on="city")
print(merge_by_city)
```

Merge the DataFrames `revenue` and `managers` on the `'branch_id'` column of each.

```python
merge_by_id = pd.merge(revenue, managers, on="branch_id")
print(merge_by_id)
```

Well done! Notice that when you merge on `'city'`, the resulting DataFrame has a peculiar result: In row 2, the city Springfield has two different branch IDs. This is because there are actually two different cities named Springfield - one in the State of Illinois, and the other in Missouri. The `revenue` DataFrame has the one from Illinois, and the `managers` DataFrame has the one from Missouri. Consequently, when you merge on `'branch_id'`, both of these get dropped from the merged DataFrame.

### Merging on columns with non-matching labels
We continue working with the `revenue` & `managers` DataFrames from before. This time, someone has changed the field name `'city'` to `'branch'` in the `managers` table. Now, when you attempt to merge DataFrames, an exception is thrown:

```python
revenue = pd.read_csv("revenue_branch_id_2.csv")
managers = pd.read_csv("managers_branch_id_2.csv")
print(revenue)
print(managers)
```

> `pd.merge(revenue, managers, on='city')
Traceback (most recent call last):
... <text deleted> ...
pd.merge(revenue, managers, on='city')
... <text deleted> ...
KeyError: 'city' `

Given this, it will take a bit more work for you to join or merge on the city/branch name. You have to specify the `left_on` and `right_on` parameters in the call to `pd.merge()`.

```python
combined = pd.merge(revenue, managers, left_on="city", right_on="branch")
print(combined)
```

Great work! It is **important** to pay attention to **how columns are named** in different DataFrames.

### Merging on multiple columns

Another strategy to disambiguate cities with identical names is to add information on the states in which the cities are located. To this end, you add a column called `state` to both DataFrames from the preceding exercises.

Our goal in this exercise is to use `pd.merge()` to merge DataFrames using multiple columns (using `'branch_id'`, `'city'`, and `'state'` in this case).

```python
revenue = pd.read_csv("revenue_branch_id.csv")
managers = pd.read_csv("managers_branch_id.csv")

# Add 'state' column to revenue
revenue["state"] = ["TX", "CO", "IL", "CA"]
# Add 'state' column to managers
managers["state"] = ["TX", "CO", "CA", "MO"]

print(revenue)
print(managers)
```

```python
# Merge revenue & managers on 'branch_id', 'city', & 'state'
combined = pd.merge(revenue, managers, on=["branch_id", "city", "state"])
print(combined)
```

Excellent work!

## Other Merge Types

There are three different types of merges available in Pandas. These merge types are common across most database and data-orientated languages (SQL, R, SAS) and are typically referred to as “joins”. If you don’t know them, learn them now.

* **Inner Merge / Inner join** – The default Pandas behaviour, only keep rows where the merge “on” value exists in both the left and right dataframes.

* **Left Merge / Left outer join** – (aka left merge or left join) Keep every row in the left dataframe. Where there are missing values of the “on” variable in the right dataframe, add empty / NaN values in the result.

* **Right Merge / Right outer join** – (aka right merge or right join) Keep every row in the right dataframe. Where there are missing values of the “on” variable in the left column, add empty / NaN values in the result.

* **Outer Merge / Full outer join** – A full outer join returns all the rows from the left dataframe, all the rows from the right dataframe, and matches up rows where possible, with NaNs elsewhere.

The `merge` type to use is specified using the `how` parameter in the merge command, taking values `left`, `right`, `inner` (default), or `outer`.

Venn diagrams are commonly used to exemplify the different merge and join types.

![Venn diagrams](https://raw.githubusercontent.com/Raigred/mlcourse.ai/master/img/join-types-merge-names.jpg "Venn diagrams")

### Left & right merging on multiple columns

We now have, in addition to the `revenue` and `managers`, a DataFrame `sales` that summarizes units sold from specific branches (identified by `city` and `state` but not `branch_id`).

By merging `revenue` and `sales` with a *right* merge, we can identify the missing `revenue` values. Here, we don't need to specify `left_on` or `right_on` because the columns to merge on have matching labels.

```python
managers = pd.read_csv("managers_branch_id_2.csv")
managers["state"] = ["TX", "CO", "CA", "MO"]
sales = pd.read_csv("sales.csv")
print(sales)
```

```python
revenue_and_sales = pd.merge(revenue, sales, how="right", on=["city", "state"])
print(revenue_and_sales)
```

By merging `sales` and `managers` with a *left* merge, we can identify the missing manager. Here, the columns to merge on have conflicting labels, so we must specify `left_on` and `right_on`. In both cases, we're looking to figure out how to connect the fields in rows containing `Springfield`.

```python
sales_and_managers = pd.merge(
sales, managers, how="left", left_on=["city", "state"], right_on=["branch", "state"]
)
print(sales_and_managers)
```

Well done! This is a good way to retain both entries of `Springfield`.

### Merging DataFrames with outer join

The merged DataFrames contain enough information to construct a DataFrame with 5 rows with all known information correctly aligned and each branch listed only once. We will try to merge the merged DataFrames on all matching keys (which computes an inner join by default). We can compare the result to an outer join and also to an outer join with restricted subset of columns as keys.

Merge `sales_and_managers` with `revenue_and_sales`

```python
merge_default = pd.merge(sales_and_managers, revenue_and_sales)
print(merge_default)
```

Merge `sales_and_managers` with `revenue_and_sales` using `how='outer'`

```python
merge_outer = pd.merge(sales_and_managers, revenue_and_sales, how="outer")
print(merge_outer)
```

Merge `sales_and_managers` with `revenue_and_sales` only on `['city','state']` using an *outer* join.

```python
merge_outer_on = pd.merge(
sales_and_managers, revenue_and_sales, how="outer", on=["city", "state"]
)
print(merge_outer_on)
```

Fantastic work! **Notice** how the default merge drops the `Springfield` rows, while the default outer merge includes them twice.

## Ordered merges

### Using merge_ordered()

This exercise uses DataFrames `austin` and `houston` that contain weather data from the cities Austin and Houston respectively.

Weather conditions were recorded on separate days and we need to merge these two DataFrames together such that the dates are ordered. To do this, we'll use `pd.merge_ordered()`. Note the order of the rows before and after merging.

```python
austin = pd.read_csv("austin.csv")
houston = pd.read_csv("houston.csv")
print(austin)
print(houston)
```

Perform an ordered merge on `austin` and `houston` using `pd.merge_ordered()`

```python
tx_weather = pd.merge_ordered(austin, houston)
print(tx_weather)
```

Perform another ordered merge on `austin` and `houston`.
This time, specify the keyword arguments `on='date'` and `suffixes=['_aus','_hus']` so that the rows can be distinguished.

```python
tx_weather_suff = pd.merge_ordered(
austin, houston, on="date", suffixes=["_aus", "_hus"]
)
print(tx_weather_suff)
```

Perform a third ordered merge on `austin` and `houston`.
This time, in addition to the `on` and `suffixes` parameters, specify the keyword argument `fill_method='ffill'` to use forward-filling to replace `NaN` entries with the most recent non-null entry

```python
tx_weather_ffill = pd.merge_ordered(
austin, houston, on="date", suffixes=["_aus", "_hus"], fill_method="ffill"
)
print(tx_weather_ffill)
```

Well done! Notice how after using a fill method, there are no more `NaN` entries.

## Conclusion

Hurray! You have come to the end of the tutorial. In this tutorial, you learned to merge DataFrames using the `merge()` function of pandas library. Towards the end, you also practiced the special function `merge_ordered()`.

This tutorial used the following sources to help write it:

* [Data Camp](https://www.datacamp.com/home)
* [Official reference documentation from Pandas](http://pandas.pydata.org/pandas-docs/stable/merging.html)
* [Tutorial from Shane Lynn](https://www.shanelynn.ie/merge-join-dataframes-python-pandas-index-1/)
* [Tutorial from Manish Pathak](https://www.datacamp.com/community/tutorials/joining-dataframes-pandas)
* [Cheat SheetPandas](https://datacamp-community-prod.s3.amazonaws.com/9f0f2ae1-8bd8-4302-a67b-e17f3059d9e8)
