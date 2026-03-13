# Nigerian Music scraped from Spotify - an analysis

Source: ML for Beginners
Original URL: https://github.com/microsoft/ML-For-Beginners/blob/HEAD/5-Clustering/2-K-Means/notebook.ipynb
Original Path: 5-Clustering/2-K-Means/notebook.ipynb
Course: Machine Learning

# Nigerian Music scraped from Spotify - an analysis

```python
pip install seaborn
```

Output:
```text
Requirement already satisfied: seaborn in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (0.11.1)
Requirement already satisfied: numpy>=1.15 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from seaborn) (1.19.2)
Requirement already satisfied: pandas>=0.23 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from seaborn) (1.1.2)
Requirement already satisfied: scipy>=1.0 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from seaborn) (1.4.1)
Requirement already satisfied: matplotlib>=2.2 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from seaborn) (3.1.0)
Requirement already satisfied: python-dateutil>=2.7.3 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from pandas>=0.23->seaborn) (2.8.0)
Requirement already satisfied: pytz>=2017.2 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from pandas>=0.23->seaborn) (2019.1)
Requirement already satisfied: cycler>=0.10 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from matplotlib>=2.2->seaborn) (0.10.0)
Requirement already satisfied: kiwisolver>=1.0.1 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from matplotlib>=2.2->seaborn) (1.1.0)
Requirement already satisfied: pyparsing!=2.0.4,!=2.1.2,!=2.1.6,>=2.0.1 in /Library/Frameworks/Python.framework/Versions/3.7/lib/python3.7/site-packages (from matplotlib>=2.2->seaborn) (2.4.0)
Requirement al
```

Start where we finished in the last lesson, with data imported and filtered.

```python
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

df = pd.read_csv("../data/nigerian-songs.csv")
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

We will focus only on 3 genres. Maybe we can get 3 clusters built!

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

```python
df.head()
```

Output:
```text
name album \
1 shuga rush EVERYTHING YOU HEARD IS TRUE
3 Confident / Feeling Cool Enjoy Your Life
4 wanted you rare.
5 Kasala Pioneers
6 Pull Up Everything Pretty

artist artist_top_genre release_date length popularity \
1 Odunsi (The Engine) afropop 2020 89488 30
3 Lady Donli nigerian pop 2019 175135 14
4 Odunsi (The Engine) afropop 2018 152049 25
5 DRB Lasgidi nigerian pop 2020 184800 26
6 prettyboydo nigerian pop 2018 202648 29

danceability acousticness energy instrumentalness liveness loudness \
1 0.710 0.0822 0.683 0.000169 0.1010 -5.640
3 0.894 0.7980 0.611 0.000187 0.0964 -4.961
4 0.702 0.1160 0.833 0.910000 0.3480 -6.044
5 0.803 0.1270 0.525 0.000007 0.1290 -10.034
6 0.818 0.4520 0.587 0.004490 0.5900 -9.840

speechiness tempo time_signature
1 0.3600 129.993 3
3 0.1130 111.087 4
4 0.0447 105.115 4
5 0.1970 100.103 4
6 0.1990 95.842 4
```
