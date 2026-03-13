# Deque in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/deque-in-python/
Original Path: https://www.geeksforgeeks.org/python/deque-in-python/
Course: Python Programming

Deque in Python

Last Updated : 11 Dec, 2025

A deque stands for Double-Ended Queue. It is a special type of data structure that allows you to add and remove elements from both ends efficiently. This makes it useful in applications like task scheduling, sliding window problems and real-time data processing.

Python

from collections import deque

# Declaring deque
de = deque ([ 'name' , 'age' , 'DOB' ])

print ( de )

Output
deque(['name', 'age', 'DOB'])

Why Do We Need deque?

- It supports O(1) time for adding/removing elements from both ends.

- It is more efficient than lists for front-end operations.

- It can function as both a queue (FIFO) and a stack (LIFO).

- Ideal for scheduling, sliding window problems and real-time data processing.

- It offers powerful built-in methods like appendleft() , popleft() and rotate().

Types of Restricted Deque Input

- Input Restricted Deque : Input is limited at one end while deletion is permitted at both ends.

- Output Restricted Deque : output is limited at one end but insertion is permitted at both ends.

Appending and Deleting Dequeue Items

- append(x): Adds x to the right end of the deque.

- appendleft(x): Adds x to the left end of the deque.

- extend(iterable): Adds all elements from the iterable to the right end.

- extendleft(iterable): Adds all elements from the iterable to the left end (in reverse order).

- remove(value): Removes the first occurrence of the specified value from the deque. If value is not found, it raises a ValueError.

- pop(): Removes and returns an element from the right end.

- popleft(): Removes and returns an element from the left end.

- clear(): Removes all elements from the deque.

Python

from collections import deque

dq = deque ([ 10 , 20 , 30 ])

# Add elements to the right
dq . append ( 40 )

# Add elements to the left
dq . appendleft ( 5 )

# extend(iterable)
dq . extend ([ 50 , 60 , 70 ])
print ( "After extend([50, 60, 70]):" , dq )

# extendleft(iterable)
dq . extendleft ([ 0 , 5 ])
print ( "After extendleft([0, 5]):" , dq )

# remove method
dq . remove ( 20 )
print ( "After remove(20):" , dq )

# Remove elements from the right
dq . pop ()

# Remove elements from the left
dq . popleft ()

print ( "After pop and popleft:" , dq )

# clear() - Removes all elements from the deque
dq . clear () # deque: []
print ( "After clear():" , dq )

Output:

After extend([50, 60, 70]): deque([5, 10, 20, 30, 40, 50, 60, 70])
After extendleft([0, 5]): deque([5, 0, 5, 10, 20, 30, 40, 50, 60, 70])
After remove(20): deque([5, 0, 5, 10, 30, 40, 50, 60, 70])
After pop and popleft: deque([0, 5, 10, 30, 40, 50, 60])
After clear(): deque([])

Accessing Item and length of deque

- Indexing: Access elements by position using positive or negative indices.

- len(): Returns the number of elements in the deque.

Python

import collections

dq = collections . deque ([ 1 , 2 , 3 , 3 , 4 , 2 , 4 ])

# Accessing elements by index
print ( dq [ 0 ])
print ( dq [ - 1 ])

# Finding the length of the deque
print ( len ( dq ))

Output
1
4
7

Count, Rotation and Reversal of a deque

- count(value): This method counts the number of occurrences of a specific element in the deque.

- rotate(n): This method rotates the deque by n steps. Positive n rotates to the right and negative n rotates to the left.

- reverse(): This method reverses the order of elements in the deque.

Python

from collections import deque

# Create a deque
dq = deque ([ 10 , 20 , 30 , 40 , 50 , 20 , 30 , 20 ])

# 1. Counting occurrences of a value
print ( dq . count ( 20 )) # Occurrences of 20
print ( dq . count ( 30 )) # Occurrences of 30

# 2. Rotating the deque
dq . rotate ( 2 ) # Rotate the deque 2 steps to the right
print ( dq )

dq . rotate ( - 3 ) # Rotate the deque 3 steps to the left
print ( dq )

# 3. Reversing the deque
dq . reverse () # Reverse the deque
print ( dq )

Output
3
2
deque([30, 20, 10, 20, 30, 40, 50, 20])
deque([20, 30, 40, 50, 20, 30, 20, 10])
deque([10, 20, 30, 20, 50, 40, 30, 20])

Operations on deque

Here’s a table listing built-in operations of a deque in Python with descriptions and their corresponding time complexities:

Operation Description Time Complexity

append(x) Adds
x
to the right end of the deque. O(1)

appendleft(x) Adds
x
to the left end of the deque. O(1)

pop() Removes and returns an element from the right end of the deque. O(1)

popleft() Removes and returns an element from the left end of the deque. O(1)

extend(iterable) Adds all elements from
iterable
to the right end of the deque. O(k)

extendleft(iterable) Adds all elements from
iterable
to the left end of the deque (reversed order). O(k)

remove(value) Removes the first occurrence of
value
from the deque. Raises
ValueError
if not found. O(n)

rotate(n) Rotates the deque
n
steps to the right. If
n
is negative, rotates to the left. O(k)

clear() Removes all elements from the deque. O(n)

count(value) Counts the number of occurrences of
value
in the deque. O(n)

index(value) Returns the index of the first occurrence of
value
in the deque. Raises
ValueError
if not found. O(n)

reverse() Reverses the elements of the deque in place. O(n)

Python

deque

Python collections-module

Python-DSA

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
