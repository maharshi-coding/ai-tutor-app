# First Class functions in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/first-class-functions-python/
Original Path: https://www.geeksforgeeks.org/python/first-class-functions-python/
Course: Python Programming

First Class functions in Python

Last Updated : 12 Mar, 2026

In Python, functions are treated as first-class objects. This means they can be used just like numbers, strings, or any other variable. You can:

- Assign functions to variables.

- Pass them as arguments to other functions.

- Return them from functions.

- Store them in data structures such as lists or dictionaries.

This ability allows you to write reusable, modular and powerful code.

Characteristics of First-Class Functions

Functions in Python have the following important characteristics. Let’s see them one by one with examples:

1. Assigning Functions to Variables

We can assign a function to a variable and use the variable to call the function. Example:

Python

def msg ( name ):
return f "Hello, { name } !"

# Assigning the function to a variable
f = msg

# Calling the function using the variable
print ( f ( "Emma" ))

Output
Hello, Emma!

Explanation:

- The function msg is assigned to the variable f.

- Now f can be used to call msg, showing that functions behave like variables.

2. Passing Functions as Arguments

Functions can be passed as arguments to other functions, enabling higher-order functions .

Python

def msg ( name ):
return f "Hello, { name } !"

def fun1 ( fun2 , name ):
return fun2 ( name )

# Passing the msg function as an argument
print ( fun1 ( msg , "Alex" ))

Output
Hello, Alex!

Explanation:

- The function fun1 takes another function (fun2) as input.

- msg is passed to fun1, which then calls it with "Alex".

3. Returning Functions from Other Functions

A function can return another function , allowing for the creation of function factories.

Python

def fun1 ( msg ):
def fun2 ():
return f "Message: { msg } "
return fun2

# Getting the inner function
func = fun1 ( "Hello, World!" )
print ( func ())

Output
Message: Hello, World!

Explanation:

- The function fun1 defines another function fun2 and returns it.

- func stores the returned function fun2, which can be executed later.

4. Storing Functions in Data Structures

Functions can be stored in data structures like lists or dictionaries .

Python

def add ( x , y ):
return x + y

def subtract ( x , y ):
return x - y

# Storing functions in a dictionary
d = {
"add" : add ,
"subtract" : subtract
}

# Calling functions from the dictionary
print ( d [ "add" ]( 5 , 3 ))
print ( d [ "subtract" ]( 5 , 3 ))

Output
8
2

Explanation:

- Functions add and subtract are stored in a dictionary.

- They are accessed using their keys and executed directly.

Python

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
