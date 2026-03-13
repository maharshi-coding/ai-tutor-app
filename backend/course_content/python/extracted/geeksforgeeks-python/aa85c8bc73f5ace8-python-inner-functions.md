# Python Inner Functions

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/python-inner-functions/
Original Path: https://www.geeksforgeeks.org/python/python-inner-functions/
Course: Python Programming

Python Inner Functions

Last Updated : 1 Sep, 2025

In Python, an inner function (also called a nested function) is a function defined inside another function. They are mainly used for:

- Encapsulation: Hiding helper logic from external access.

- Code Organization: Grouping related functionality for cleaner code.

- Access to Outer Variables: Inner functions can use variables of the enclosing (outer) function.

- Closures and Decorators: Supporting advanced features like closures (functions that remember values) and function decorators.

This makes inner functions powerful for structuring programs, maintaining readability and reusing logic effectively.

Example: This example shows a simple inner function where the inner function prints a message from the outer function.

Python

def fun1 ( msg ): # outer function
def fun2 (): # inner function
print ( msg ) # access variable from outer scope
fun2 ()
fun1 ( "Hello" )

Output
Hello

Explanation: Here, fun2() is defined inside fun1() and it accesses the variable msg from the enclosing scope.

Scope of variables in inner functions

Inner functions follow Python’s LEGB rule (Local --> Enclosing --> Global --> Built-in). They can access outer function variables, but modifying them requires special keywords like nonlocal .

Example 1 : Local Variable Access

This example demonstrates how an inner function can access a variable from its enclosing (outer) function.

Python

def fun1 ():
msg = "Geeks for geeks"
def fun2 ():
print ( msg )
fun2 ()
fun1 ()

Output
Geeks for geeks

Explanation: fun1() creates a local variable msg and define s fun2(), which prints msg . Because of lexical scoping, fun2() can access msg from fun1() and calling fun1() runs fun2() and prints the message.

Example 2: Modifying variables using nonlocal

This example shows how the nonlocal keyword allows the inner function to modify a variable from the outer function instead of creating a new local copy.

Python

def fun1 ():
a = 45
def fun2 ():
nonlocal a
a = 54
print ( a )
fun2 ()
print ( a )
fun1 ()

Output
54

Explanation: nonlocal tells Python to use the variable a from the outer scope instead of creating a new local one. Thus, both prints show 54 .

Example 3: Closure in inner function

This example shows a closure , where the inner function remembers the value from the outer function even after it has finished executing.

Python

def fun1 ( a ):
def fun2 ():
print ( a )
return fun2

closure_func = fun1 ( "Hello, Closure!" )
closure_func ()

Output
Hello, Closure!

Explanation: Even after fun1() finishes, fun2() still remembers the value of a . This behavior is called a closure .

Real World Applications of Inner functions

Inner functions are useful in real-world scenarios for better code organization, encapsulation and reusability. Below are some practical applications:

Example1: Encapsulation of helper functions

This example uses an inner function to encapsulate a helper task of cleaning whitespace from a list of strings.

Python

def process_data ( data ):
def clean_data ():
return [ item . strip () for item in data ]
return clean_data ()
print ( process_data ([ " Python " , " Inner Function " ]))

Output
['Python', 'Inner Function']

Explanation: process_data() defines an inner clean_data() that trims spaces using .strip() . It returns the cleaned list: ['Python', 'Inner Function'] .

Example 2: Function wrapper and logging

This example uses an inner function as a wrapper to log details before calling the actual function. It’s a common use case in decorators .

Python

import logging
logging . basicConfig ( level = logging . INFO )

def logger ( func ):
def wrapper ( * args , ** kwargs ):
logging . info ( f "Executing { func . __name__ } with { args } , { kwargs } " )
return func ( * args , ** kwargs )
return wrapper

@logger
def add ( a , b ):
return a + b
print ( add ( 3 , 4 ))

Output

INFO:root:Executing add with arguments (3, 4), {}
7

Explanation: logger function defines wrapper() , which logs the function name and arguments before calling it. *args collects positional arguments, **kwargs collects keyword arguments, so wrapper works for any function.

Python

Python-Functions

Python Fundamentals

- Python Introduction 2 min read

- Input and Output in Python 4 min read

- Python Variables 4 min read

- Python Operators 4 min read

- Python Keywords 2 min read

- Python Data Types 8 min read

- Conditional Statements in Python 3 min read

- Loops in Python 5 min read

- Python Functions 5 min read

Python Data Structures

- Python String 5 min read

- Python Lists 4 min read

- Python Tuples 4 min read

- Python Dictionary 4 min read

- Python Sets 6 min read

- Python Arrays 7 min read

Advanced Python

- Python OOP Concepts 4 min read

- Python Exception Handling 5 min read

- File Handling in Python 4 min read

- Python Database Tutorial 4 min read

- Python MongoDB Tutorial 3 min read

- Python MySQL 9 min read

- Python Packages 10 min read

- Python Modules 3 min read

- Python DSA Libraries 5 min read

- List of Python GUI Library and Packages 3 min read

Data Science with Python

- NumPy Tutorial 3 min read

- Pandas Tutorial 4 min read

- Matplotlib Tutorial 3 min read

- Python Seaborn Tutorial 3 min read

- StatsModel Library - Tutorial 2 min read

- Learning Model Building in Scikit-learn 6 min read

- TensorFlow Tutorial 2 min read

- PyTorch Tutorial 5 min read

Web Development with Python

- Flask Tutorial 4 min read

- Django Tutorial | Learn Django Framework 6 min read

- Django ORM - Inserting, Updating & Deleting Data 4 min read

- Templating With Jinja2 in Flask 6 min read

- Django Templates 5 min read

- Build a REST API using Flask - Python 3 min read

- Building a Simple API with Django REST Framework 3 min read

Python Practice

- Python Quiz 1 min read

- Python Coding Practice 1 min read

- Python Interview Questions and Answers 15+ min read
