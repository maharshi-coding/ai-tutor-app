# Data Setup

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/7-TimeSeries/1-Introduction/solution/notebook.ipynb
Original Path: 7-TimeSeries/1-Introduction/solution/notebook.ipynb
Course: Machine Learning

# Data Setup

In this notebook, we demonstrate how to:
- setup time series data for this module
- visualize the data

The data in this example is taken from the GEFCom2014 forecasting competition<sup>1</sup>. It consists of 3 years of hourly electricity load and temperature values between 2012 and 2014.

<sup>1</sup>Tao Hong, Pierre Pinson, Shu Fan, Hamidreza Zareipour, Alberto Troccoli and Rob J. Hyndman, "Probabilistic energy forecasting: Global Energy Forecasting Competition 2014 and beyond", International Journal of Forecasting, vol.32, no.3, pp 896-913, July-September, 2016.

```python
import os
import matplotlib.pyplot as plt
from common.utils import load_data
%matplotlib inline
```

Load the data from csv into a Pandas dataframe

```python
data_dir = './data'
energy = load_data(data_dir)[['load']]
energy.head()
```

Output:
```text
load
2012-01-01 00:00:00 2698.0
2012-01-01 01:00:00 2558.0
2012-01-01 02:00:00 2444.0
2012-01-01 03:00:00 2402.0
2012-01-01 04:00:00 2403.0
```

Plot all available load data (January 2012 to Dec 2014)

```python
energy.plot(y='load', subplots=True, figsize=(15, 8), fontsize=12)
plt.xlabel('timestamp', fontsize=12)
plt.ylabel('load', fontsize=12)
plt.show()
```

Output:
```text
<Figure size 1080x576 with 1 Axes>
```

Plot first week of July 2014

```python
energy['2014-07-01':'2014-07-07'].plot(y='load', subplots=True, figsize=(15, 8), fontsize=12)
plt.xlabel('timestamp', fontsize=12)
plt.ylabel('load', fontsize=12)
plt.show()
```

Output:
```text
<Figure size 1080x576 with 1 Axes>
```
