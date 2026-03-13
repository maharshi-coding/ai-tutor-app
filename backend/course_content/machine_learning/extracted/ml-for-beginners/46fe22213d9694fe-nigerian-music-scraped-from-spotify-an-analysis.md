# Nigerian Music scraped from Spotify - an analysis

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/5-Clustering/1-Visualize/solution/notebook.ipynb
Original Path: 5-Clustering/1-Visualize/solution/notebook.ipynb
Course: Machine Learning

# Nigerian Music scraped from Spotify - an analysis

```python
!pip install seaborn
```

Output:
```text
Defaulting to user installation because normal site-packages is not writeable
Requirement already satisfied: seaborn in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (0.11.2)
Requirement already satisfied: matplotlib>=2.2 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from seaborn) (3.5.0)
Requirement already satisfied: numpy>=1.15 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from seaborn) (1.21.4)
Requirement already satisfied: pandas>=0.23 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from seaborn) (1.3.4)
Requirement already satisfied: scipy>=1.0 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from seaborn) (1.7.2)
Requirement already satisfied: fonttools>=4.22.0 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from matplotlib>=2.2->seaborn) (4.28.1)
Requirement already satisfied: pyparsing>=2.2.1 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from matplotlib>=2.2->seaborn) (2.4.7)
Requirement already satisfied: kiwisolver>=1.0.1 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from matplotlib>=2.2->seaborn) (1.3.2)
Requirement already satisfied: pillow>=6.2.0 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from matplotlib>=2.2->seaborn) (8.4.0)
Requirement already satisfied: cycler>=0.10 in /Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages (from matplotlib>=2.2->seaborn) (0.11.0)
Requirement already satisfied: packaging>=20.0 in /Users/jenniferlooper/Librar
```

```python
import matplotlib.pyplot as plt
import pandas as pd
```

```python
df = pd.read_csv("../../data/nigerian-songs.csv")
df.head()
```

Output:
```text
name album \
0 Sparky Mandy & The Jungle
1 shuga rush EVERYTHING YOU HEARD IS TRUE
2 LITT! LITT!
3 Confident / Feeling Cool Enjoy Your Life
4 wanted you rare.

artist artist_top_genre release_date length popularity \
0 Cruel Santino alternative r&b 2019 144000 48
1 Odunsi (The Engine) afropop 2020 89488 30
2 AYLØ indie r&b 2018 207758 40
3 Lady Donli nigerian pop 2019 175135 14
4 Odunsi (The Engine) afropop 2018 152049 25

danceability acousticness energy instrumentalness liveness loudness \
0 0.666 0.8510 0.420 0.534000 0.1100 -6.699
1 0.710 0.0822 0.683 0.000169 0.1010 -5.640
2 0.836 0.2720 0.564 0.000537 0.1100 -7.127
3 0.894 0.7980 0.611 0.000187 0.0964 -4.961
4 0.702 0.1160 0.833 0.910000 0.3480 -6.044

speechiness tempo time_signature
0 0.0829 133.015 5
1 0.3600 129.993 3
2 0.0424 130.005 4
3 0.1130 111.087 4
4 0.0447 105.115 4
```

Get information about the dataframe

```python
df.info()
```

Output:
```text
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 530 entries, 0 to 529
Data columns (total 16 columns):
# Column Non-Null Count Dtype
--- ------ -------------- -----
0 name 530 non-null object
1 album 530 non-null object
2 artist 530 non-null object
3 artist_top_genre 530 non-null object
4 release_date 530 non-null int64
5 length 530 non-null int64
6 popularity 530 non-null int64
7 danceability 530 non-null float64
8 acousticness 530 non-null float64
9 energy 530 non-null float64
10 instrumentalness 530 non-null float64
11 liveness 530 non-null float64
12 loudness 530 non-null float64
13 speechiness 530 non-null float64
14 tempo 530 non-null float64
15 time_signature 530 non-null int64
dtypes: float64(8), int64(4), object(4)
memory usage: 66.4+ KB
```

Double-check for null values.

```python
df.isnull().sum()
```

Output:
```text
name 0
album 0
artist 0
artist_top_genre 0
release_date 0
length 0
popularity 0
danceability 0
acousticness 0
energy 0
instrumentalness 0
liveness 0
loudness 0
speechiness 0
tempo 0
time_signature 0
dtype: int64
```

Look at the general values of the data. Note that popularity can be '0' - and there are many rows with that value

```python
df.describe()
```

Output:
```text
release_date length popularity danceability acousticness \
count 530.000000 530.000000 530.000000 530.000000 530.000000
mean 2015.390566 222298.169811 17.507547 0.741619 0.265412
std 3.131688 39696.822259 18.992212 0.117522 0.208342
min 1998.000000 89488.000000 0.000000 0.255000 0.000665
25% 2014.000000 199305.000000 0.000000 0.681000 0.089525
50% 2016.000000 218509.000000 13.000000 0.761000 0.220500
75% 2017.000000 242098.500000 31.000000 0.829500 0.403000
max 2020.000000 511738.000000 73.000000 0.966000 0.954000

energy instrumentalness liveness loudness speechiness \
count 530.000000 530.000000 530.000000 530.000000 530.000000
mean 0.760623 0.016305 0.147308 -4.953011 0.130748
std 0.148533 0.090321 0.123588 2.464186 0.092939
min 0.111000 0.000000 0.028300 -19.362000 0.027800
25% 0.669000 0.000000 0.075650 -6.298750 0.059100
50% 0.784500 0.000004 0.103500 -4.558500 0.097950
75% 0.875750 0.000234 0.164000 -3.331000 0.177000
max 0.995000 0.910000 0.811000 0.582000 0.514000

tempo time_signature
count 530.000000 530.000000
mean 116.487864 3.986792
std 23.518601 0.333701
min 61.695000 3.000000
25% 102.961250 4.000000
50%
```

Let's examine the genres. Quite a few are listed as 'Missing' which means they aren't categorized in the dataset with a genre

```python
import seaborn as sns

top = df['artist_top_genre'].value_counts()
plt.figure(figsize=(10,7))
sns.barplot(x=top[:5].index,y=top[:5].values)
plt.xticks(rotation=45)
plt.title('Top genres',color = 'blue')
```

Output:
```text
Text(0.5, 1.0, 'Top genres')

<Figure size 720x504 with 1 Axes>
```

Remove 'Missing' genres, as it's not classified in Spotify

```python
df = df[df['artist_top_genre'] != 'Missing']
top = df['artist_top_genre'].value_counts()
plt.figure(figsize=(10,7))
sns.barplot(x=top.index,y=top.values)
plt.xticks(rotation=45)
plt.title('Top genres',color = 'blue')
```

Output:
```text
Text(0.5, 1.0, 'Top genres')

<Figure size 720x504 with 1 Axes>
```

The top three genres comprise the greatest part of the dataset, so let's focus on those

```python
df = df[(df['artist_top_genre'] == 'afro dancehall') | (df['artist_top_genre'] == 'afropop') | (df['artist_top_genre'] == 'nigerian pop')]
df = df[(df['popularity'] > 0)]
top = df['artist_top_genre'].value_counts()
plt.figure(figsize=(10,7))
sns.barplot(x=top.index,y=top.values)
plt.xticks(rotation=45)
plt.title('Top genres',color = 'blue')
```

Output:
```text
Text(0.5, 1.0, 'Top genres')

<Figure size 720x504 with 1 Axes>
```

The data is not strongly correlated except between energy and loudness, which makes sense. Popularity has a correspondence to release data, which also makes sense, as more recent songs are probably more popular. Length and energy seem to have a correlation - perhaps shorter songs are more energetic?

```python
corrmat = df.corr()
f, ax = plt.subplots(figsize=(12, 9))
sns.heatmap(corrmat, vmax=.8, square=True);
```

Output:
```text
<Figure size 864x648 with 2 Axes>
```

Are the genres significantly different in the perception of their danceability, based on their popularity? Examine our top three genres data distribution for popularity and danceability along a given x and y axis

```python
sns.set_theme(style="ticks")

# Show the joint distribution using kernel density estimation
g = sns.jointplot(
data=df,
x="popularity", y="danceability", hue="artist_top_genre",
kind="kde",
)
```

Output:
```text
<Figure size 432x432 with 3 Axes>
```

In general, the three genres align in terms of their popularity and danceability. A scatterplot of the same axes shows a similar pattern of convergence. Try a scatterplot to check the distribution of data per genre

```python
sns.FacetGrid(df, hue="artist_top_genre", size=5) \
.map(plt.scatter, "popularity", "danceability") \
.add_legend()
```

Output:
```text
/Users/jenniferlooper/Library/Python/3.8/lib/python/site-packages/seaborn/axisgrid.py:337: UserWarning: The `size` parameter has been renamed to `height`; please update your code.
warnings.warn(msg, UserWarning)

<seaborn.axisgrid.FacetGrid at 0x1350b1a90>

<Figure size 468.975x360 with 1 Axes>
```
