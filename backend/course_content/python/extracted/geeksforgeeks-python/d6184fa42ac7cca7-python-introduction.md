# Python Introduction

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/introduction-to-python/
Original Path: https://www.geeksforgeeks.org/python/introduction-to-python/
Course: Python Programming

Python Introduction

Last Updated : 9 Mar, 2026

Python is a high-level programming language known for its simple and readable syntax. It has the following features.

- Allows writing programs with fewer lines of code, improving readability.

- Automatically detects variable types at runtime, eliminating the need for explicit declarations.

- Used in web development, data analysis, automation, and many other fields.

- Supports object-oriented, functional, and procedural programming styles.

- Dynamically typed and has automatic garbage collection.

Understanding Hello World Program in Python

Python

# This is a comment. It will not be executed.
print ( "Hello, World!" )

Output
Hello, World!

How does this work:

- print() is a built-in Python function that instructs the computer to display text on the screen.

- "Hello, World!" is a string, which is a sequence of text. In Python, strings are enclosed in quotes (either single ' or double ").

Indentation in Python

In Python, Indentation is used to define blocks of code. It indicates to the Python interpreter that a group of statements belongs to the same block. All statements with the same level of indentation are treated as part of the same code block. Indentation is created using whitespace at the beginning of each line, and the commonly accepted convention is to use four spaces per indentation level .

Python

print ( "I have no Indentation " )
print ( "I have tab Indentation " )

Output:

ERROR!
Traceback (most recent call last):
File "<main.py>", line 2
print("I have tab Indentation ")
IndentationError: unexpected indent

Explanation:

- The first print statement has no indentation, so it is correctly executed.

- The second print statement has tab indentation, but it doesn't belong to a new block of code. Python expects the indentation level to be consistent within the same block. This inconsistency causes an IndentationError.

Related Articles:

- Comments in Python

- Applications, Advantages and Disadvantages of Python

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
