# <center>

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/tutorials/Insights_of_Monty_Hall_paradox_with_Plotly_dmironov.ipynb
Original Path: jupyter_english/tutorials/Insights_of_Monty_Hall_paradox_with_Plotly_dmironov.ipynb
Course: Machine Learning

<center>
<img src="../../img/ods_stickers.jpg" />

## [mlcourse.ai](https://mlcourse.ai) – Open Machine Learning Course

<center >Author: Denis Mironov (@dmironov)

# <center> Insights of Monty Hall paradox with Plotly </center>

Plotly is a technical computing company headquartered in Montreal, Quebec, that develops online data analytics and visualization tools https://plot.ly. Plotly provides online graphing, analytics, and statistics tools as well as graphing libraries for several programming languages including Python. With the latter, we present here a Plotly tutorial as a visual analysis of well-known Monty Hall paradox https://en.wikipedia.org/wiki/Monty_Hall_problem which is related to the following game:

>Suppose you are on a game show, and you are given the choice of three doors: Behind one door is a car; behind the others, goats. You pick a door, say №1, and the host, who knows what is behind the doors, opens another door, say №3, which has a goat. The host then says to you, "Do you want to pick door №2?" Is it to your advantage to switch your choice?

<img src="../../img/Monty_open_door.png" width="700"/>

It is analytically proven that if initial door choice is changed, the percentage to win is about 66.6%, hence the percentage to win if initial door choice remains the same is 33.3%. It is also obvious that if our final choice is solely based on the outcome of unbiased coin toss, then we win in 1/2 cases. Here we are going to demonstrate the results of these strategies graphically by using Plotly.

The Jupiter Notebook is organized as follows:

1. Simulation of Monty Hall Paradox
2. Importing and discussing libraries used for illustrations
3. Graphical analysis
- Line, Box, Violin and Distribution plots
- Contour and 3D Clustering plots
4. Conclusion

### 1. Simulation of Monty Hall Paradox

In the problem, we need to generate the dataset first in accordance with the game rules outlined above. Here the dataset represents the results of win percentage by using one of three possible options upon opening of the other door by the host:

1. Initial door choice is changed
2. Initial door choice remains unchanged
3. Random choice (initial door choice is either changed or not based on the outcome of an unbiased coin)

To model the game with these three strategies, we present a slightly modified solution obtained by us while working on Workshop Case Study №037 of https://www.superdatascience.com.

We create 6 functions:

** 1. newGame() **
- Creates a new game with all possible combinations of {car, goat, goat}. Final mapping of {car, goat, goat} to {door1, door2, door3} is done with the use of a random number

** 2. guestChoice() **
- Initial door choice made by a player

** 3. openOneDoor(game, chosen_door) **
- The host opens one door which is not the one choosen by a player and does not have a car behind. Such a modelling is based on the items positions behind the doors (game) and initial choice of a player (chosen_door)

** 4. guestChange(game, chosen_door, change) **
- Whether a player changes initial choice (chosen_door, change). A modelling based on the items positions behind the doors (game)

** 5. checkResult(game, chosen_door, change) **
- Whether a player wins or losses by using one of the three strategies mentioned above

** 6. result(n=400, step=1) **
- Modelling range(1, n+1, step) games in a row. Collecting the outcomes of each of three strategies applied to range(1, n+1, step) games. The latter means the we model 1 round, record the result, then model 2 consecutive rounds, record the result, and so on and so forth up to n consecutive rounds. Note that in these notations a game number represents the number of rounds, for instance, if a game number is 50, then there are 50 consecutive rounds in this game

```python
# random number generator
from numpy import random

# Generate a new game incorporating 3 doors: there is a car behind one of them,
# there is a goat behind the other as well as a goat behind the last one.
def newGame():
position = random.randint(1, 4)
if position == 1:
game_dict = {"door1": "car", "door2": "goat", "door3": "goat"}
return game_dict
elif position == 2:
game_dict = {"door1": "goat", "door2": "car", "door3": "goat"}
return game_dict
else:
game_dict = {"door1": "goat", "door2": "goat", "door3": "car"}
return game_dict

# Function guestChoice is designed to randomly model door choice of a player
def guestChoice():
door_choice = random.randint(1, 4)
if door_choice == 1:
return "door1"
elif door_choice == 2:
return "door2"
else:
return "door3"

# Function openOneDoor simulates door opening in the round.
def openOneDoor(game, chosen_door):
all_doors = ["door1", "door2", "door3"]
element_open = []
options = game.copy()

if game[chosen_door] != "car":
for element in all_doors:
if element != chosen_door and game[element] != "car":
element_open.append(element)
options[element_open[0]] = "open"
return options

elif game[chosen_door] == "car":
for element in all_doors:
if element != chosen_door:
element_open.append(element)
number = random.randint(1, 3)
if number == 1:
options[element_open[0]] = "open"
return options
else:
options[element_open[1]] = "open"
return options

# Function guesChange changes the game conditions depending on either
# a player changes his/her initial decision or not
def guestChange(game, chosen_door, change):
game_with_open = openOneDoor(game, chosen_door)

if change == "Y":
for element in game_with_open:
if game_with_open[element] != "open" and element != chosen_door:
return element

else:
return chosen_door

# Function checkResult checks result of one round of a game.
def checkResult(game, chosen_door, change):
final_choice = guestChange(game, chosen_door, change)
result = game[final_choice]

if result == "car":
return "WIN"
else:
return "LOSE"

# Function Result calculates win% if our strategy either
# to change our initial door choice or not to change. We also simulate the
# random process: decision whether to change the door or not solely based on
# the outcome of unbiased coin.
def result(n=400, step=1):
list_N = []
win_change = []
win_nochange = []
win_rand = []

for N in range(1, n + 1, step):
count_y = 0
count_n = 0
count_rand = 0

for i in range(N):
game = newGame()
chosen_door = guestChoice()
if checkResult(game, chosen_door, change="Y") == "WIN":
count_y += 1
if checkResult(game, chosen_door, change="N") == "WIN":
count_n += 1
if (
checkResult(
game, chosen_door, change="Y" if random.randint(2) == 0 else "N"
)
== "WIN"
):
count_rand += 1

list_N.append(N)
win_change.append(count_y / N * 100)
win_nochange.append(count_n / N * 100)
win_rand.append(count_rand / N * 100)

return list_N, win_change, win_nochange, win_rand
```

```python
list_N, win_change, win_nochange, win_rand = result(
n=2000, step=1
) # modelling of 2000 games. i-th game has i rounds
```

- ** list_N: ** is a list with № of game
- ** win_change: ** is a list with win% if initial door choice has been changed.
- ** win_nochange: ** win% if initial door choice has been unchanged.
- ** win_rand: ** win% if a decision whether to change initial door choice has been made upon unbiased coin outcome.

Each position in ** win_change ** , ** win_nochange **, ** win_rand ** corresponds to that in ** list_N **.

```python
print("Total number of games: %s " % list_N[-1])
print("Max number of rounds with changing initial door choice: %s" % len(win_change))
print(
"Max number of rounds without changing initial door choice: %s " % len(win_nochange)
)
print(
"Max number of rounds with random choice after one door is open: %s" % len(win_rand)
)
```

Recall that in our modelling i-th game has i rounds. The latter means that, for instance, in game №5 we play the game 5 consecutive times, and calculate win% based on the outcomes in these 5 rounds.

### 2. Importing and discussing libraries used for illustrations

The only library we have been needed so far is a random number generator. Now, when we have simulated the game and collected the results, we are ready to start performing graphical analysis, but before that, evidently, we need to import some libraries.

In this tutorial, we are interested in learning Plotly, so let's check its version first.

```python
import plotly

print(
"Below figures are generated with {} {}".format(
plotly.__version__, "plotly version"
)
# author's output: Below figures are generated with 3.3.0 plotly version
```

As we will see below, there is a JSON object under every plotly visualization. It is possible to operate with such an object similar to dictionary data structure by changing the values of keywords within the object. So, we load library to generate plotting objects in future:

```python
# generates a plotting object
import plotly.graph_objs as go
```

We are interested in getting illustrations in this Jupiter Notebook. For this purpose, we need to import `download_plotlyjs`, `init_notebook_mode` and `iplot`. The first one is used for plotly javascript initiallization, the second one is governed by argument `connected = True` or `connected = False` determining whether illustrations should be plotted inside Jupiter Notebook, `True`, or outside, `False` (new browser tab will be initiallized containing your figure), and the last one is used for illustrating a figure.

```python
from plotly.offline import download_plotlyjs, init_notebook_mode, iplot

init_notebook_mode(connected=True)
```

There are several chart types that are not included in plotly.js, for instance, a distribution plot. So, we have to import them separately.

```python
import plotly.figure_factory as ff
```

We also import some packages that are well-known for you.

```python
import warnings

import pandas as pd

warnings.simplefilter("ignore")
```

### 3. Graphical analysis

#### 3.1 Line, Box, Violin and Distribution plots

Here we present ** plotResult** function which will be responsible for plotting scatter, box, violin and distribution illustrations.

```python
def plotResult(
change,
nochange,
rand,
game=None,
output="fig",
plot="line",
title="",
jitter=0,
pointpos=0,
width=700,
height=300,
bin_size=0.2,
show_rug=False,
):

"""
Creates line, box, violin or distribution plot by using Plotly library

games: list
- number of games

change: list
- percentage of wins if initial door choice is changed

nochange: list
- percentage of wins if initial door choice is unchanged

rand: list
- percentage of wins if upon opening, in accordance with game rules,
a door by a host final choice is made pure randomly

output: string
- 'fig' means to give an output in form of illustration
- 'json' means to give an output in form of json format

plot: string
- 'line' means to plot a line
- 'dist' means to plot a distribution
- 'violin' means to plot a violin
- 'box' means to plot a box

title: string
- title of a graph

jitter: number
- a number between -1 and 1 (scatter of points while generating box plot)

pointpot: number
- a number between -2 and 2 (position of jitter in relation to box plot)

width: number
- width of a figure (not available when plot = 'dist' or plot = 'violin')

height: number
- height of a figure (not available when plot = 'dist' or plot = 'violin')

bin_size: number
- size of bins while creating a distribution plot

show_rug: bool
- whether a distribution graph should show a rug or not

"""

if type(game) == list:
# Slicing list up to game[-1]
change = change[: games[-1]]
nochange = nochange[: games[-1]]
rand = rand[: games[-1]]
else:
change = change
nochange = nochange
rand = rand

# Two main conditions: whether plot != 'violin' and plot != 'dist'
# this is due to different ways of creating plots
if (plot != "violin") & (plot != "dist"):

# In this block we choose whether to plot line or box illustrations
# Here is line option
if plot == "line":
trace_change = go.Scatter(
x=games, y=change, name="Change", line=dict(color="#33CFA5")
)
trace_no_change = go.Scatter(
x=games, y=nochange, name="No Change", line=dict(color="#F06A6A")
)
trace_guessing = go.Scatter(
x=games, y=rand, name="Random", line=dict(color="gray")
)
xx = dict(title="№ Game", ticklen=5, zeroline=False, gridwidth=2)

# Here is box option
elif plot == "box":
trace_change = go.Box(
y=change,
jitter=jitter,
boxpoints="all",
pointpos=pointpos,
name="Change",
line=dict(color="#33CFA5"),
)
trace_no_change = go.Box(
y=nochange,
jitter=jitter,
boxpoints="all",
pointpos=pointpos,
name="No Change",
line=dict(color="#F06A6A"),
)
trace_guessing = go.Box(
y=rand,
jitter=jitter,
boxpoints="all",
pointpos=pointpos,
name="Random",
line=dict(color="gray"),
)
xx = None

# Collecting data in a list form.
# trace_change - data related to percentage of wins when initial door choice is changed
# trace_no_change - data ..... initial door choice is unchanged
# trace_guessing - data .... final door choice is based on unbiased coin outcome
data = [trace_change, trace_guessing, trace_no_change]

# So-called ornament of our figure
layout = go.Layout(
title=title,
autosize=False,
width=width,
height=height,
xaxis=xx,
yaxis=dict(title="% Win", ticklen=5, gridwidth=2),
)

# Saving figure as fig variable which will be return by the function as iplot(fig) if output = 'fig'
fig = go.Figure(data=data, layout=layout)

# Block of code related to plotting violin type of chart
elif plot == "violin":
win_dist = pd.DataFrame(
data={"Change": win_change, "Random": win_rand, "No Change": win_nochange}
)
color = ["#33CFA5", "gray", "#F06A6A"]
data = []
for i in range(3):
trace = {
"type": "violin",
"y": win_dist.iloc[:, i],
"name": win_dist.columns[i],
"box": {"visible": True},
"points": "all",
"jitter": jitter,
"pointpos": pointpos,
"meanline": {"visible": True},
"line": {"color": color[i]},
}
data.append(trace)

fig = {
"data": data,
"layout": {"title": "", "yaxis": {"title": "% Win", "zeroline": False}},
}

# Block of code related to plotting a distribution
elif plot == "dist":
data = [change, nochange, rand]
group_labels = ["Change", "No Change", "Random"]
colors = [
"#33CFA5",
"#F06A6A",
"gray",
]
xx = None

fig = ff.create_distplot(
data, group_labels, colors=colors, bin_size=bin_size, show_rug=show_rug
)

# if output == 'fig' return graph by using iplot from plotly library
if output == "fig":
return iplot(fig)

# if output == 'json' return information about plotly object
elif output == "json":
return fig
```

**go.Scatter **

Let's discuss a part of ** plotResult** which is implemented under `if plot == 'line` condition:

if plot == 'line':
trace_change = go.Scatter(x=games,
y=change,
name='change',
line=dict(color='#33CFA5'))
trace_no_change = go.Scatter(x=games,
y=nochange,
name='no change',
line=dict(color='#F06A6A'))
trace_guessing = go.Scatter(x=games,
y=rand,
name='random',
line=dict(color='gray'))
xx = dict(title= '№ Game',
ticklen= 5,
zeroline= False,
gridwidth= 2)

data = [trace_change, trace_guessing, trace_no_change]

layout = go.Layout(title=title,
autosize=False,
width=width,
height=height,
xaxis = xx,
yaxis = dict(title= '% Win',
ticklen= 5,
gridwidth= 2))

fig = go.Figure(data=data, layout=layout)

The comments within the function have been purposely deleted.

In this code snippet, we create three objects which are quite similar and started as `go.Scatter`. However, they have different arguments:

- **y**: responsible for values taken on vertical axis
- **name**: saves the name which should be shown in the output figure
- **line**: a color of the curve

All `go.Scatter` objects are saved in appropriate variables which names usually start with phrase `trace`. Later, such variables are stored in a list which is usually named as data since this is a collection of all our data. If we are not interested in putting any ornament of our figure, for instance, a title, width and/or height specifications, then we are ready to produce a figure by injecting data list to `go.Figure` plotly object.

As one can see above, we have decided to design our figure in a more nicely way. For doing this we use `go.Layout` object incorporating arguments:

- **title**: a title of our illustration
- **width **: width of our figure*
- **height **: height of our figure*
- **xaxis **: responsible for notations on horizontal axis (uses `xx` variable defined within `if` condition)
- **yaxis **: responsible for notations on vertical axis

($*$) **width** and **height** control figure size with `autosize=False`

** go.Box **

A `Box` is a graph object which takes arguments similar to those taken by `Scatter`, but with several new:

- ** jitter **: to make points more visible (from 0 to 1)
- ** boxpoints **: show data points
- ** pointpos **: position of points in relation to violin graph

** Violin**

elif plot == 'violin':
win_dist = pd.DataFrame(data={
'Change': win_change,
'Rand': win_rand,
'No change': win_nochange
})
color = ['#33CFA5', 'gray', '#F06A6A']
data = []
for i in range(3):
trace = {
"type": 'violin',
"y": win_dist.iloc[:,i],
"name": win_dist.columns[i],
"box": {"visible": True},
"points": 'all',
"jitter": jitter,
"pointpos" : pointpos,
"meanline": {"visible": True},
"line": {"color": color[i]}
}
data.append(trace)

fig = {
"data": data,
"layout" : {
"title": "",
"yaxis": {"zeroline": False}
}

Here you see a code block responsible for violin plotting. The procedure is similar to that we have already covered, though slighly different:

1. Creating a dataframe with columns representing our data (with initial door change, without initial changing, and a random choice upon opening one of doors)
2. Creating a list of colors which will be later mapped to the `line` keyword within `trace`.
3. We initialize a loop over each of columns of our dataframe, and save trace as an element of a data list. Variable `trace` contains the following parameters of future figure:

- **type **: a type of our figure ('violin' in our case)
- **y**: data on vertical axis
- **name**: a name shown in the figure
- **box**: make a box
- **points**: show data points
- **jitter**: make points more visible (from 0 to 1)
- **pointpos** : position of points in relation to violin graph
- **meanline**: line showing mean value
- **line**: here it is responsible for violin color
4. Previously, we used `go.Figure`, which is a json object, and assigned it to `fig` variable, while this time we create such an object by hands.

** Distribution **

elif plot == 'dist':
data = [change, nochange, rand]
group_labels = ['change', 'no change', 'random']
colors = ['#F06A6A', '#33CFA5', 'gray']
xx=None

fig = ff.create_distplot(data,
group_labels,
colors=colors,
bin_size=bin_size,
show_rug=show_rug)

This code block is responsible for creating of a distribution plot. The procedure shown here is differ from that related to scatter, box or violin plots.

1. We create a list of elements which are lists. In our case, the lists contain an information about our percentage of wins obtained under different conditions
2. Next we define `group_labels` that will be shown in the figure. The order of labels corresponding to that in `data` list
3. After, we set up a color to each list of our data in the same order as the that defined in `data`
4. Parameter `bin_size` defines the size of histogram bins, while `show_rug` adds rug to a distribution plot
5. Having created `data`, `group_labels`, `colors`, `bin_size` and `show_rug`, we use them as input parameters to `ff.create_distplot` imported from `plotly.figure_factory`

Let's now see our **plotResult** function in action

```python
games = list_N.copy()
```

```python
plotResult(win_change, win_nochange, win_rand, games, plot="line", output="fig")
```

```python
plotResult(win_change, win_nochange, win_rand, games, plot="box", output="fig")
```

```python
plotResult(
win_change,
win_nochange,
win_rand,
games,
plot="box",
output="fig",
pointpos=-1.5,
jitter=0.3,
)
```

```python
plotResult(
win_change,
win_nochange,
win_rand,
games,
plot="violin",
output="fig",
pointpos=-1.5,
jitter=0.3,
)
```

```python
# our implementation does not allow to control the size of distribution plot
plotResult(win_change, win_nochange, win_rand, games, plot="dist", output="fig")
```

Note that if you put a mouse cursor over a figure generated by Plotly, values of data are displayed so we can retrieve accurate result of, say, outliers instanteneously without doing additional manipulations with data. Legend located in the top right position of a Plotly figure is also clickable. You may choose which data you would like to see. By clicking once on the label, the data it is connected with will vanish and will be displayed again only when you click that label one more time.

From the figures above one can see that the most profitable strategy in our game is to change the initial door choice. Such a strategy gives 66.6% to win when we play sufficient number of consecutive rounds while, if we do not change our initial choice, winning percentage is tending to 33.3. We have also demonstrated that if our final choice between two doors is made based on the outcome of an unbiased coin, then there is 50% chance to win. The latter result is trivial but it is nice to see it in our figures as well.

Let's demonstrate an example of JSON object under a Plotly visualization to get a flavor of how it works.

```python
plotResult(win_change, win_nochange, win_rand, games, plot="line", output="json")
```

As one can see, there is a JSON object under the visualization. It is possible to operate with such an object similar to dictionary data structure by changing the values of keywords within the object. For instance, note that layout has a height equal to 300. Let's change it to 700. This can be done as follows.

```python
json_demonstration = plotResult(
win_change, win_nochange, win_rand, games, plot="line", output="json"
)
json_demonstration["layout"]["height"] = 700
iplot(json_demonstration)
```

Such a way to modify Plotly plot is convenient and time-consuming, especially, when plot incorporates much more parameters than presented here in our tutorial.

Next we consider Contour plot which allows us to see the distribution of our variables in form of histogram and how they depend on each other. After, 3D Clustering figure is illustrated showing a cluster of all three strategies results.

#### 3.2 Contour and 3D Clustering plots

** Contour plot**

We start by building **contour_plot** function for our purposes.

```python
def contour_plot(
x,
y,
game=None,
colorscale="Jet",
name_x="X",
name_y="Y",
height=600,
width=600,
bargap=0,
):

"""

Creates a contour plot by using Plotly library

x: list
- related to a strategy when a random choice is made when two choices left

y: list
- related to a strategy when initial door choice remains unchanged

game: list
- contains number of rounds per game. The same number corresponds to № of game.
For instance, number 5 in the list means that this is game number 5 with length of 5 consecutive rounds.
If not used, then x and y control the game rounds of interest

colorscale: str
- colorbar on the right of a figure

name_x: str
- name of a strategy on horizontal axis. It is 'X' by default

name_y: str
- name of a strategy on vertical axis. It is 'Y' by default

height: number
- controls the height of figure

width: number
- controls the width of figure

bargap: int or float
- gaps between bars. Parameter takes values from 0 to 1

"""

if type(game) == list:
x = x[: game[-1]]
y = y[: game[-1]]
else:
x = x
y = y

data = [
go.Histogram2dContour(
x=x, y=y, colorscale=colorscale, reversescale=True, xaxis="x", yaxis="y"
),
go.Scatter(
x=x,
y=y,
name="(" + name_x + "," + name_y + ")",
xaxis="x",
yaxis="y",
mode="markers",
marker=dict(color="rgba(0,0,0,0.3)", size=3),
),
go.Histogram(y=y, name=name_y, xaxis="x2", marker=dict(color="rgba(0,0,0,1)")),
go.Histogram(x=x, name=name_x, yaxis="y2", marker=dict(color="rgba(0,0,0,1)")),
]

layout = go.Layout(
autosize=False,
xaxis=dict(zeroline=False, domain=[0, 0.85], showgrid=False),
yaxis=dict(zeroline=False, domain=[0, 0.85], showgrid=False),
xaxis2=dict(zeroline=False, domain=[0.85, 1], showgrid=False),
yaxis2=dict(zeroline=False, domain=[0.85, 1], showgrid=False),
height=height,
width=width,
bargap=bargap,
hovermode="closest",
showlegend=False,
)

fig = go.Figure(data=data, layout=layout)
return iplot(fig)
```

As we did previously while creating ** plotResult**, within **contour_plot ** we combine `go.Histogram2dContour`, `go.Scatter` and two `go.Histogram` to the list and assign the latter to `data` variable. Later this `data` list is injected to `go.Figure`. The latter is used as an argument for `iplot` to show the figure.

We also use `go.Layout` here to specify parameters of our plot. In particular, we need to specify domains of our graph objects such as `go.Histogram2dContour`, `go.Scatter` and `go.Histogram` in order to obtain a nice figure without overlapping of different parts. Besides, in `go.Layout` we use `zeroline=False` not to show zero level on vertical and horizontal axises. This information would be redundant but you may set it as `True` to see how it works. The same with `showgrid` which is responsible for showing a grid.

In the very end of `go.Layout`, we specify several more parameters such as **height**, **width**, **bargap**, **hovermode** and **showlegend**:

- **height**: controls height of our figure (input parameter of **contour_plot**)
- **width** controls width of our figure (input parameter)
- **bargap**: responsible for gaps in distribution bars, if `bargap=0`, then it plots histogram, increasing **bargap** makes it look like a barplot. Note **bargap** can take values in-between 0 and 1 (input parameter)
- **hovermode** determines the mode of hover interactions
- **showlegend**: determines whether to show a legend

Now, when we understand better how **contour_plot** works, let's use it to demonstrate several illustrations related to our Monty Hall problem.

```python
# Create a copy of a list
games = list_N.copy()
```

```python
contour_plot(win_change, win_nochange, games[:200], name_x="Change", name_y="No change")
```

```python
contour_plot(win_change, win_rand, games[:200], name_x="Change", name_y="Random")
```

```python
contour_plot(win_nochange, win_rand, games[:200], name_x="No change", name_y="Random")
```

Do not forget that Plotly plots interactive figures. You may zoom in or out, use autoscale, use box select option to focus on the region of your interest as well as several other options which are available for figure investigation. It is possible to retrive coordinates of points by using Plotly interactive illustrations which is very convenient to collect an information about a particular point and get to know how it fits into the whole picture.

Such contour plots let us see where datapoints of two strategies, used as ** contour_plot** arguments, are concentrated. A datapoint of one strategy represents a coordinate of one axis, say, vertical one, while a datapoint of the other strategy a coordinate of the horizontal axis. Both of datapoints correspond to the same № game in order to be correctly mapped on the plane. We may see a correlation of strategies as well as the center of their clustering marked as dark blue when `colorscale = 'Jet'` is used.

The clustering may also be depicted in one 3D figure. This is what we do by the next and last function of our tutorial.

** 3D point clustering **

To conclude our visual investigation, let's plot 3D point clustering figure. This is done with **clustering ** function preseted below which uses similar methods described above and, therefore, we are not going to cover it in details. This function shows how win percentage make a 3D cluster with the center at about

<gap>
<center> $(random, nochange, change) = (50, 33, 66) $ </center>
<gap>

while modelling quite a large number of games, say, 2000. Recall one more time that a game number also represents the number of rounds within the game. So, if game number is 50, this means that there are 50 consecutive rounds in the game, then we calculate % of wins in this 50 rounds and assign the value to game №50.

```python
def clustering(game, x, y, z):

"""

Creates a 3D clustering figure by using Plotly library

game: list
- contains number of rounds per game. The same number corresponds to № of game.
For instance, number 5 in the list means that this is game number 5 with length of 5 consecutive rounds
x: list
- related to a strategy when a random choice is made when two choices left
y: list
- related to a strategy when initial door choice remains unchanged
z: list
- related to a strategy when initial door choice is changed

"""

x = x[: game[-1]]
y = y[: game[-1]]
z = z[: game[-1]]

df = pd.DataFrame(data={"Random": x, "No change": y, "Change": z})

scatter = dict(
mode="markers",
name="A",
type="scatter3d",
x=df["Random"],
y=df["No change"],
z=df["Change"],
marker=dict(size=2, color="rgb(23, 190, 207)"),
)

clusters = dict(
alphahull=7,
opacity=0.1,
type="mesh3d",
x=df["Random"],
y=df["No change"],
z=df["Change"],
)

layout = dict(
title="3D clustering",
scene=dict(
xaxis=dict(title="Random (x)"),
yaxis=dict(title="No change (y)"),
zaxis=dict(title="Change (z)"),
),
)

fig = dict(data=[scatter, clusters], layout=layout)
return iplot(fig)
```

```python
game = list_N.copy()
```

```python
clustering(game, win_rand, win_nochange, win_change)
```

This 3D clustering figure shows us the relation of all three strategies used to win in the game.

### Conclusion

In this tutorial we have learned about Plotly library by visualizing probability concepts of Monty Hall paradox. The charts we have covered are

- Line
- Box
- Violin
- Distribution
- Contour
- 3D Clustering

There are many more illustrations possible to make with Plotly which is a very powerful library. You can find more examples here: https://plot.ly/python/.

I hope that this tutorial was both interesting and useful for you. Thank you for your time and consideration.
