# Pumpkin Pricing

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/2-Regression/3-Linear/notebook.ipynb
Original Path: 2-Regression/3-Linear/notebook.ipynb
Course: Machine Learning

## Pumpkin Pricing

Load up required libraries and dataset. Convert the data to a dataframe containing a subset of the data:

- Only get pumpkins priced by the bushel
- Convert the date to a month
- Calculate the price to be an average of high and low prices
- Convert the price to reflect the pricing by bushel quantity

```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime

pumpkins = pd.read_csv('../data/US-pumpkins.csv')

pumpkins.head()
```

```python
pumpkins = pumpkins[pumpkins['Package'].str.contains('bushel', case=True, regex=True)]

columns_to_select = ['Package', 'Variety', 'City Name', 'Low Price', 'High Price', 'Date']
pumpkins = pumpkins.loc[:, columns_to_select]

price = (pumpkins['Low Price'] + pumpkins['High Price']) / 2

month = pd.DatetimeIndex(pumpkins['Date']).month
day_of_year = pd.to_datetime(pumpkins['Date']).apply(lambda dt: (dt-datetime(dt.year,1,1)).days)

new_pumpkins = pd.DataFrame(
{'Month': month,
'DayOfYear' : day_of_year,
'Variety': pumpkins['Variety'],
'City': pumpkins['City Name'],
'Package': pumpkins['Package'],
'Low Price': pumpkins['Low Price'],
'High Price': pumpkins['High Price'],
'Price': price})

new_pumpkins.loc[new_pumpkins['Package'].str.contains('1 1/9'), 'Price'] = price/1.1
new_pumpkins.loc[new_pumpkins['Package'].str.contains('1/2'), 'Price'] = price*2

new_pumpkins.head()
```

A basic scatterplot reminds us that we only have month data from August through December. We probably need more data to be able to draw conclusions in a linear fashion.

```python
import matplotlib.pyplot as plt
plt.scatter('Month','Price',data=new_pumpkins)
```

```python
plt.scatter('DayOfYear','Price',data=new_pumpkins)
```
