# Iterators in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/iterators-in-python/
Original Path: https://www.geeksforgeeks.org/python/iterators-in-python/
Course: Python Programming

Iterators in Python

Last Updated : 3 Sep, 2025

An iterator in Python is an object used to traverse through all the elements of a collection (like lists, tuples or dictionaries) one element at a time. It follows the iterator protocol, which involves two key methods:

- __iter__(): Returns the iterator object itself.

- __next__(): Returns the next value from the sequence. Raises StopIteration when the sequence ends.

Why do we need iterators?

Here are some key benefits:

- Lazy Evaluation: Processes items only when needed, saving memory.

- Generator Integration: Pairs well with generators and functional tools.

- Stateful Traversal: Keeps track of where it left off.

- Uniform Looping: Same for loop works for lists, strings and more.

- Composable Logic: Easily build complex pipelines using tools like itertools.

Built-in Iterator Example

Let’s start with a simple example using a string. We will convert it into an iterator and fetch characters one by one:

Python

s = "GFG"
it = iter ( s )

print ( next ( it ))

Output
G
F
G

Explanation:

- s is an iterable (string).

- iter(s) creates an iterator.

- next(it) retrieves characters one by one.

Creating a Custom Iterator

Creating a custom iterator in Python involves defining a class that implements the __iter__() and __next__() methods according to the Python iterator protocol.

Steps to follow:

- Define the Class: Start by defining a class that will act as the iterator.

- Initialize Attributes: In the __init__() method of the class, initialize any required attributes that will be used throughout the iteration process.

- Implement __iter__(): This method should return the iterator object itself. This is usually as simple as returning self.

- Implement __next__(): This method should provide the next item in the sequence each time it's called.

Below is an example of a custom class called EvenNumbers, which iterates through even numbers starting from 2:

Python

class EvenNumbers :
def __iter__ ( self ):
self . n = 2 # Start from the first even number
return self

def __next__ ( self ):
x = self . n
self . n += 2 # Increment by 2 to get the next even number
return x

# Create an instance of EvenNumbers
even = EvenNumbers ()
it = iter ( even )

# Print the first five even numbers
print ( next ( it ))

Output
2
4
6
8
10

Explanation:

- Initialization: The __iter__() method initializes the iterator at 2, the first even number.

- Iteration: The __next__() method retrieves the current number and then increases it by 2, ensuring the next call returns the subsequent even number.

- Usage: We create an instance of EvenNumbers, turn it into an iterator and then use the next() function to fetch even numbers one at a time.

StopIteration Exception

StopIteration exception is integrated with Python’s iterator protocol. It signals that the iterator has no more items to return. Once this exception is raised, further calls to next() on the same iterator will continue raising StopIteration.

Example:

Python

li = [ 100 , 200 , 300 ]
it = iter ( li )

# Iterate until StopIteration is raised
while True :
try :
print ( next ( it ))
except StopIteration :
print ( "End of iteration" )
break

Output
100
200
300
End of iteration

In this example, the StopIteration exception is manually handled in the while loop, allowing for custom handling when the iterator is exhausted.

Difference between Iterator and Iterable

Although the terms iterator and iterable sound similar, they are not the same. An iterable is any object that can return an iterator, while an iterator is the actual object that performs iteration one element at a time.

Example: Let’s take a list (iterable) and create an iterator from it

Python

# Iterable: list
numbers = [ 1 , 2 , 3 ]

# Iterator: created using iter()
it = iter ( numbers )
print ( next ( it ))

Output
1
2
3

Explanation:

- numbers is an iterable because it can return an iterator.

- iter(numbers) creates an iterator object it.

- next(it) function fetches elements one by one until no more items are left.

To make the difference even clearer, let’s summarize it in a simple table:

Feature Iterable Iterator

Definition Any object that can return an iterator Object with a state for iteration

Key Method Implements __iter__() Implements both __iter__() and __next__()

Examples List, Tuple, String, Dictionary, Set Objects returned by iter()

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
