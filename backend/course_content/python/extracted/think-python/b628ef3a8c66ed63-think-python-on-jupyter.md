# Think Python* on Jupyter

Source: Think Python
Original URL: https://github.com/AllenDowney/ThinkPython/blob/HEAD/chapters/jupyter_intro.ipynb
Original Path: chapters/jupyter_intro.ipynb
Course: Python Programming

# *Think Python* on Jupyter

This is an introduction to Jupyter notebooks for people reading the third edition of [*Think Python*](https://greenteapress.com/wp/think-python-3rd-edition) by Allen B. Downey.

A Jupyter notebook is a document that contains text, code, and results from running the code.
You can read a notebook like a book, but you can also run the code, modify it, and develop new programs.

Jupyter notebooks run in a web browser, so you can run them without installing any new software.
But they have to connect to a Jupyter server.

You can install and run a server yourself, but to get started it is easier to use a service like [Colab](https://colab.research.google.com/), which is operated by Google.

[On the starting page for the book](https://allendowney.github.io/ThinkPython) you will find a link for each chapter.
If you click on one of these links, it opens a notebook on Colab.

If you are reading this notebook on Colab, you should see an orange logo in the upper left that looks like the letters `CO`.

If you are not running this notebook on Colab, [you can click here to open it on Colab](https://colab.research.google.com/github/AllenDowney/ThinkPython/blob/v3/chapters/jupyter_intro.ipynb).

## What is a notebook?

A Jupyter notebook is made up of cells, where each cell contains either text or code.
This cell contains text.

The following cell contains code.

```python
print('Hello')
```

Output:
```text
Hello
```

Click on the previous cell to select it.
You should see a button on the left with a triangle inside a circle, which is the icon for "Play".
If you press this button, Jupyter runs the code in the cell and displays the result.

When you run code in a notebook for the first time, it might take a few seconds to start.
And if it's a notebook you didn't write, you might get a warning message.
If you are running a notebook from a source you trust, which I hope includes me, you can press "Run Anyway".

Instead of clicking the "Play" button, you can also run the code in a cell by holding down `Shift` and pressing `Enter`.

If you are running this notebook on Colab, you should see buttons in the top left that say "+ Code" and "+ Text". The first one adds a code cell and the second adds a text cell.
If you want to try them out, select this cell by clicking on it, then press the "+ Text" button.
A new cell should appear below this one.

Add some text to the cell.
You can use the buttons to format it, or you can mark up the text using [Markdown](https://www.markdownguide.org/basic-syntax/).
When you are done, hold down `Shift` and press `Enter`, which will format the text you just typed and then move to the next cell.

At any time Jupyter is in one of two modes:

* In **command mode**, you can perform operations that affect cells, like adding and removing entire cells.

* In **edit mode**, you can edit the contents of a cell.

With text cells, it is obvious which mode you are in.
In edit mode, the cell is split vertically, with the text you are editing on the left and the formatted text on the right.
And you'll see text editing tools across the top.
In command mode, you see only the formatted text.

With code cells, the difference is more subtle, but if there's a cursor in the cell, you are in edit mode.

To go from edit mode to command mode, press `ESC`.
To go from command mode to edit mode, press `Enter`.

When you are done working on a notebook, you can close the window, but any changes you made will disappear.
If you make any changes you want to keep, open the File menu in the upper left.
You'll see several ways you can save the notebook.

* If you have a Google account, you can save the notebook in your Drive.

* If you have a GitHub account, you can save it on GitHub.

* Or if you want to save the notebook on your computer, select "Download" and then "Download .ipynb" The suffix ".ipynb" indicates that it is a notebook file, as opposed to ".py", which indicates a file that contains Python code only.

## Code for *Think Python*

At the beginning of each notebook, you'll see a cell with code like this:

```python
from os.path import basename, exists

def download(url):
filename = basename(url)
if not exists(filename):
from urllib.request import urlretrieve

local, _ = urlretrieve(url, filename)
print("Downloaded " + str(local))
return filename

download('https://raw.githubusercontent.com/AllenDowney/ThinkPython/v3/thinkpython.py')

import thinkpython
```

You don't need to know how this code works, but when you get to the end of the book, most of it will make sense.
As you might guess, it downloads a file -- specifically, it downloads `thinkpython.py`, which contains Python code provided specifically for this book.
The last line "imports" this code, which means we can use the code in the notebook.

In other chapters, you will see code that downloads `diagram.py`, which is used to generated the diagrams in the book, and `jupyturtle.py`, which is used in several chapters to create turtle graphics.

In some places you will see a cell like this that begins with `%%expect`.

```python
%%expect SyntaxError

abs 42
```

`%%expect` is not part of Python -- it is a Jupyter "magic command" that indicates that we expect the cell to product an error.
When you see this command, it means that the error is deliberate, usually intended to warn you about a common pitfall.

For more about running Jupyter notebooks on Colab, [click here](https://colab.research.google.com/notebooks/basic_features_overview.ipynb).

Or, if you are ready to get started, [click here to read Chapter 1](https://colab.research.google.com/github/AllenDowney/ThinkPython/blob/v3/chapters/chap01.ipynb).

*Think Python*, 3rd edition.

Copyright 2023 [Allen B. Downey](https://allendowney.com)

License: [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)
