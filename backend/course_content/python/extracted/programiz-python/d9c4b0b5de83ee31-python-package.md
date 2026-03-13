# Python Package

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/package
Original Path: https://www.programiz.com/python-programming/package
Course: Python Programming

- Python Package

- Python Main function

Python Files

- Python Directory and Files Management

- Python CSV: Read and Write CSV files

- Reading CSV files in Python

- Writing CSV files in Python

Python Exception Handling

- Python Exceptions

- Python Exception Handling

- Python Custom Exceptions

Python Object & Class

- Python Objects and Classes

- Python Inheritance

- Python Multiple Inheritance

- Polymorphism in Python

- Python Operator Overloading

Python Advanced Topics

- List comprehension

- Python Lambda/Anonymous Function

- Python Iterators

- Python Generators

- Python Namespace and Scope

- Python Closures

- Python Decorators

- Python @property decorator

- Python RegEx

Python Date and Time

- Python datetime

- Python strftime()

- Python strptime()

- How to get current date
and time in Python?

- Python Get Current Time

- Python timestamp to
datetime and vice-versa

- Python time Module

- Python sleep()

Additional Topic

- Precedence and Associativity of Operators in Python

- Python Keywords and Identifiers

- Python Asserts

- Python Json

- Python pip

- Python *args and **kwargs

Python Tutorials

Python Modules

Python pip

Python Main function

Python Directory and Files Management

Python __import__()

Python Docstrings

Python Package

A package is a container that contains various functions to perform specific tasks. For example, the math package includes the
sqrt()
function to perform the square root of a number .

While working on big projects, we have to deal with a large amount of code, and writing everything together in the same file will make our code look messy. Instead, we can separate our code into multiple files by keeping the related code together in packages.

Now, we can use the package whenever we need it in our projects. This way we can also reuse our code.

Package Model Structure in Python Programming

Suppose we are developing a game. One possible organization of packages and modules could be as shown in the figure below.

Game Package Model Structure

Note : A directory must contain a file named
__init__.py
in order for Python to consider it as a package. This file can be left empty but we generally place the initialization code for that package in this file.

Importing module from a package

In Python, we can import modules from packages using the dot (.) operator.

For example, if we want to import the
start
module in the above example, it can be done as follows:

import Game.Level.start

Now, if this module contains a function named
select_difficulty()
, we must use the full name to reference it.

Game.Level.start.select_difficulty(2)

Import Without Package Prefix

If this construct seems lengthy, we can import the module without the package prefix as follows:

from Game.Level import start

We can now call the function simply as follows:

start.select_difficulty(2)

Import Required Functionality Only

Another way of importing just the required function (or class or variable ) from a module within a package would be as follows:

from Game.Level.start import select_difficulty

Now we can directly call this function.

select_difficulty(2)

Although easier, this method is not recommended. Using the full namespace avoids confusion and prevents two same identifier names from colliding.

While importing packages, Python looks in the list of directories defined in
sys.path
, similar as for module search path .

- Introduction

- Package Model Structure in Python Programming

- Importing module from a package

Video: Python Packages: Organize Your Code

Previous Tutorial:

Python Modules

Next Tutorial:

Python Main function

Share on:

Did you find this article helpful?

Sorry about that.

How can we improve it?

Feedback *

Leave this field blank

Your builder path starts here. Builders don't just know how to code, they create solutions that matter.

Escape tutorial hell and ship real projects.

Try Programiz PRO

Real-World Projects

On-Demand Learning

- AI Mentor

Builder Community

Related Tutorials

Python Tutorial

Python Modules

Python Tutorial

Python pip

Python Library

Python __import__()

Python Tutorial

Python Directory and Files Management
