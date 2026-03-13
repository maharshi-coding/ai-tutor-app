# filter() in python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/filter-in-python/
Original Path: https://www.geeksforgeeks.org/python/filter-in-python/
Course: Python Programming

filter() in python

Last Updated : 1 Sep, 2025

filter() function is used to extract elements from an iterable (like a list, tuple or set) that satisfy a given condition. It works by applying a function to each element and keeping only those for which function returns True.

Basic Example

This simple example shows how to keep only the words starting with the letter 'a' from a list of fruits.

Python

def starts_a ( w ):
return w . startswith ( "a" )

li = [ "apple" , "banana" , "avocado" , "cherry" , "apricot" ]
res = filter ( starts_a , li )
print ( list ( res ))

Output
['apple', 'avocado', 'apricot']

Explanation: function starts_a checks if a word begins with ' a ' and filter() applies this function to each fruit and returns only matching ones.

Syntax

filter(function, iterable)

Parameters:

- function: tests each element and if return, True - Keep the element, if False - Discard the element

- iterable: Any iterable (list, tuple, set, etc.).

Return Value: A filter object (an iterator), which can be converted into a list, tuple, set, etc.

Examples of filter function

Let's explore some examples of filter() function and see how it is used.

Example 1: Using filter() with a Named Function

This code defines a regular function to check if a number is even and then uses filter() to extract all even numbers from a list.

Python

def even ( n ):
return n % 2 == 0

a = [ 1 , 2 , 3 , 4 , 5 , 6 ]
b = filter ( even , a )
print ( list ( b )) # Convert filter object to a list

Output
[2, 4, 6]

Explanation:

- even function checks if a number is divisible by 2.

- filter() applies this function to each item in a.

- Only even numbers are included in output.

Example 2: Using filter() with a Lambda Function

Instead of creating a separate named function, use a lambda function for concise code. Below code uses a lambda function with filter() to select even numbers from a list.

Python

a = [ 1 , 2 , 3 , 4 , 5 , 6 ]
b = filter ( lambda x : x % 2 == 0 , a )
print ( list ( b ))

Output
[2, 4, 6]

Explanation: filter(lambda x: x % 2 == 0, a) keeps only numbers divisible by 2 (even numbers).

Example 3: Filtering and Transforming Data

In this Example lambda functions is used with filter() and map() to first get even numbers from a list and then double them.

Python

a = [ 1 , 2 , 3 , 4 , 5 , 6 ]
b = filter ( lambda x : x % 2 == 0 , a )
c = map ( lambda x : x * 2 , b )
print ( list ( c ))

Output
[4, 8, 12]

Explanation:

- filter(lambda x: x % 2 == 0, a): Selects only even numbers from the list ([2, 4, 6]).

- map(lambda x: x * 2, b): Doubles each of the filtered even numbers ([4, 8, 12]).

Example 4: Filtering Strings

Here, lambda function is used with filter() to keep only words that have more than 5 letters from a list of fruits.

Python

a = [ "apple" , "banana" , "cherry" , "kiwi" , "grape" ]
b = filter ( lambda w : len ( w ) > 5 , a )
print ( list ( b ))

Output
['banana', 'cherry']

Example 5: Filtering with None (Truthiness Check)

This code uses filter() with None as the function to remove all falsy values (like empty strings, None and 0) from a list.

Python

L = [ "apple" , "" , None , "banana" , 0 , "cherry" ]
A = filter ( None , L )
print ( list ( A ))

Output
['apple', 'banana', 'cherry']

Explanation: filter(None, L) removes all falsy values (empty string, None and 0) and keeps only truthy ones.

Misc

Python

Python-Built-in-functions

python

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
