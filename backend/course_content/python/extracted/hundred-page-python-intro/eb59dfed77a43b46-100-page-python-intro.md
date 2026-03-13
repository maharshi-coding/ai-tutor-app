# 100 Page Python Intro

Source: 100 Page Python Intro
Original URL: https://learnbyexample.github.io/100_page_python_intro/introduction.html
Original Path: https://learnbyexample.github.io/100_page_python_intro/introduction.html
Course: Python Programming

Introduction

Wikipedia does a great job of describing about Python in a few words. So, I'll just copy-paste the relevant information here:

Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation.
Python is dynamically type-checked and garbage-collected. It supports multiple programming paradigms, including structured (particularly procedural), object-oriented and functional programming. It is often described as a "batteries included" language due to its comprehensive standard library.
Python consistently ranks as one of the most popular programming languages, and has gained widespread use in the machine learning community.

See also docs.python: General Python FAQ for answers to questions like "What is Python?", "What is Python good for?", "Why is it called Python?" and so on.
Installation

On modern Linux distributions, you are likely to find Python already installed. It may be a few versions behind, but should work just fine for most of the topics covered in this book. To get the exact version used here, visit the Python downloads page and install using the appropriate source for your operating system.
Using the installer from the downloads page is the easiest option to get started on Windows and macOS. See docs.python: Python Setup and Usage for more information.
For Linux, check your distribution repository first. You can also build it from source as shown below for Debian-like distributions:

$ wget https://www.python.org/ftp/python/3.13.0/Python-3.13.0.tar.xz
$ tar -Jxf Python-3.13.0.tar.xz
$ cd Python-3.13.0
$ ./configure --enable-optimizations
$ make
$ sudo make altinstall

You may have to install dependencies first, see this stackoverflow thread for details.

See docs.python: What's New to track changes across versions.

Online tools

In case you are facing installation issues, or do not want to (or cannot) install Python on your computer for some reason, there are options to execute Python programs using online tools. Some of them are listed below:
- Repl.it — Code, collaborate, compile, run, share, and deploy Python and more online from your browser
- Pythontutor — Visualize code execution, also has example codes and ability to share sessions
- PythonAnywhere — Host, run, and code Python in the cloud
The official Python website also has a Launch Interactive Shell option ( https://www.python.org/shell/ ), which gives access to a REPL session.
First program

It is customary to start learning a new programming language by printing a simple phrase. Create a new directory, say
python_programs
for this book. Then, create a plain text file named
hello.py
with your favorite text editor and type the following piece of code.

# hello.py
print('*************')
print('Hello there!')
print('*************')

If you are familiar with using the command line on a Unix-like system, run the script as shown below (use
py hello.py
if you are using Windows CMD). Other options to execute a Python program will be discussed in the next section.

$ python3.13 hello.py
*************
Hello there!
*************

A few things to note here. The first line is a comment, used here to show the name of the Python program.
print()
is a built-in function, which can be used without having to load some library. A single string argument has been used for each of the three invocations.
print()
automatically appends a newline character by default. The program ran without a compilation step. As quoted earlier, Python is an interpreted language. More details will be discussed in later chapters.

See Python behind the scenes and this list of resources if you are interested to learn inner details about Python program execution.

All the Python programs discussed in this book, along with related text files, can be accessed from my GitHub repo learnbyexample: 100_page_python_intro . However, I'd highly recommend typing the programs manually by yourself.

IDE and text editors

An integrated development environment (IDE) might suit you better if you are not comfortable with the command line. IDE provides features likes debugging, syntax highlighting, autocompletion, code refactoring and so on. They also help in setting up a virtual environment to manage different versions of Python and modules (more on that later). See wikipedia: IDE for more details.
If you install Python on Windows, it will automatically include IDLE , an IDE built using Python's
tkinter
module. On Linux, you might already have the
idle3.13
program if you installed Python manually. Otherwise you may have to install it separately.

When you open IDLE, you'll get a Python shell (discussed in the next section). For now, click the New File option under File menu to open a text editor. Type the short program
hello.py
discussed in the previous section. After saving the code, press F5 to run it. You'll see the results in the shell window as shown below.

Popular alternatives to IDLE are listed below:
- Thonny — Python IDE for beginners, lots of handy features like viewing variables, debugger, step through, highlight syntax errors, name completion, etc
- Pycharm — smart code completion, code inspections, on-the-fly error highlighting and quick-fixes, automated code refactorings, rich navigation capabilities, support for frameworks, etc
- Spyder — typically used for scientific computing
- Jupyter — web application that allows you to create and share documents that contain live code, equations, visualizations and narrative text
- VSCodium — community-driven, freely-licensed binary distribution of VSCode
- Vim , Emacs , Geany , GNOME Text Editor — text editors with support for syntax highlighting and more
REPL

One of the best features of Python is the interactive shell. Such shells are also referred to as REPL, an abbreviation for R ead E valuate P rint L oop. The Python REPL makes it easy for beginners to try out code snippets for learning purposes. Beyond learning, it is also useful for developing a program in small steps, debugging a large program by trying out few lines of code at a time and so on. REPL will be used frequently in this book to show code snippets.
When you launch Python from the command line, or open IDLE, you get a shell that is ready for user input after the
>>>
prompt.

$ python3.13
Python 3.13.0 (main, Oct 25 2024, 10:00:04) [GCC 9.4.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>

Try the below instructions. The first one displays a greeting using the
print()
function. Then, a user defined variable is used to store a string value. To display the value, you can either use
print()
again or just type the variable name. Expression results are immediately displayed in the shell. Name of a variable by itself is a valid expression. This behavior is unique to the REPL and an expression by itself won't display anything when used inside a script.

>>> print('have a nice day')
have a nice day

>>> username = 'learnbyexample'
>>> print(username)
learnbyexample

# use # to start a single line comment
# note that string representation is shown instead of actual value
# details will be discussed later
>>> username
'learnbyexample'

# use exit() to close the shell, can also use Ctrl+D shortcut
>>> exit()

I'll stress again the importance of following along the code snippets by manually typing them on your computer. Programming requires hands-on experience too, reading alone isn't enough. As an analogy, can you learn to drive a car by just reading about it? Since one of the prerequisite is that you should already be familiar with programming basics, I'll extend the analogy to learning to drive a different car model. Or, perhaps a different vehicle such as a truck or a bus might be more appropriate here.

Unlike previous versions, the Python REPL now implements editing and navigation features on its own instead of relying on an external
readline
library. See REPL-acing the default REPL (PEP 762) for more information.

You can use
python3.13 -q
to avoid the version and copyright messages when you start an interactive shell. Use
python3.13 -h
or visit docs.python: Command line and environment for documentation on CLI options.

Documentation and getting help

The official Python website has an extensive documentation located at https://docs.python.org/3/ . This includes a tutorial (which is much more comprehensive than the contents presented in this book), several guides for specific modules like
re
and
argparse
and various other information.
Python also provides a
help()
function, which is quite handy to use from the REPL. If you type
help(print)
and press the Enter key, you'll get a screen as shown below. If you are using IDLE, the output would be displayed on the same screen. Otherwise, the content might be shown on a different screen depending on your
pager
settings. Typically, pressing the
q
key will quit the
pager
and get you back to the shell.

Quotes are necessary, for example
help('import')
and
help('del')
, if the topic you are looking for isn't an object.

If you get stuck with a problem, there are several ways to get it resolved. For example:
- research the topic via documentation/books/tutorials/etc
- reduce the code as much as possible so that you are left with minimal code necessary to reproduce the issue
- talk about the problem with a friend/colleague/inanimate-objects/etc (see Rubber duck debugging )
- search about the problem online
You can also ask for help on forums. Make sure to read the instructions provided by the respective forums before asking a question. Here are some forums you can use:
- /r/learnpython and /r/learnprogramming/ — beginner friendly
- python-forum — dedicated Python forum, encourages back and forth discussions based on the topic of the thread
- /r/Python/ — general Python discussion
- stackoverflow: python tag

The Debugging chapter will discuss more on this topic.
