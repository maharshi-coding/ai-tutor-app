# Python Collections Counter

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/counters-in-python-set-1/
Original Path: https://www.geeksforgeeks.org/python/counters-in-python-set-1/
Course: Python Programming

Python Collections Counter

Last Updated : 11 Mar, 2026

Counter is a subclass of Python’s dict from the collections module. It is mainly used to count the frequency of elements in an iterable (like lists, strings or tuples) or from a mapping (dictionary). It provides a clean and efficient way to tally items without writing extra loops and comes with helpful built-in methods.

Python

from collections import Counter
# Create a list of items
a = [ 1 , 1 , 1 , 2 , 3 , 3 , 4 ]

# Use Counter to count occurrences
cnt = Counter ( a )
print ( cnt )

Output
Counter({1: 3, 3: 2, 2: 1, 4: 1})

Explanation: Counter object shows that 1 appears 3 times, 3 appears 2 times, 2 appears once and 4 appears once.

Syntax

collections.Counter([iterable-or-mapping])

Parameters (all optional):

- iterable: Sequence like list, tuple, or string.

- mapping: Dictionary with elements as keys and counts as values.

- keyword arguments: String keys mapped to counts.

Return Type: Returns a collections.Counter object (dictionary-like).

Why use Counter() instead of a normal dictionary?

- Quickly counts elements in a list, string or any iterable without writing extra loops.

- Great for data summaries like counting words, votes or item frequencies.

- Includes helpful built-in methods like most_common() and elements() for easier processing.

- Cleaner and more efficient than using regular dictionaries for counting.

- Supports flexible input types, works with lists, dictionaries or even keyword arguments.

Creating a Counter

We can create Counters from different data sources.

Python

from collections import Counter
ctr1 = Counter ([ 1 , 2 , 2 , 3 , 3 , 3 ]) # From a list
ctr2 = Counter ({ 1 : 2 , 2 : 3 , 3 : 1 }) # From a dictionary
ctr3 = Counter ( 'hello' ) # From a string

print ( ctr1 )
print ( ctr2 )
print ( ctr3 )

Output
Counter({3: 3, 2: 2, 1: 1})
Counter({2: 3, 1: 2, 3: 1})
Counter({'l': 2, 'h': 1, 'e': 1, 'o': 1})

Explanation:

- ctr1 counts numbers from a list.

- ctr2 directly takes a dictionary of counts.

- ctr3 counts characters in the string "hello".

Refer to collection module to learn in detail.

Accessing Counter Elements

We can access the count of each element using the element as the key. If an element is not in the Counter, it returns 0.

Python

from collections import Counter
ctr = Counter ([ 1 , 2 , 2 , 3 , 3 , 3 ])

# Accessing count of an element
print ( ctr [ 1 ])
print ( ctr [ 2 ])
print ( ctr [ 3 ])
print ( ctr [ 4 ]) # (element not present)

Output
1
2
3
0

Explanation: Counter returns the count of each element. If an element does not exist (4 in this case), it returns 0.

Counter Methods

1. update(): Adds counts from another iterable or mapping. Existing counts increase, and new elements are added.

Python

from collections import Counter
ctr = Counter ([ 1 , 1 , 2 ])
ctr . update ([ 2 , 2 , 3 , 3 ])
print ( ctr )

Output
Counter({2: 3, 1: 2, 3: 2})

Explanation:

- ctr = Counter([1, 1, 2]) -> counts are {1:2, 2:1}

- ctr.update([2, 2, 3, 3]), 2 appears twice-> 2:1 becomes 2:3 and 3 appears twice -> added as 3:2

- Final Counter merges both sequences.

2. elements(): Returns an iterator over elements repeating each as many times as its count. Elements are returned in arbitrary order.

Python

from collections import Counter
ctr = Counter ([ 1 , 1 , 2 , 2 , 2 , 3 ])
items = list ( ctr . elements ())
print ( items )

Output
[1, 1, 2, 2, 2, 3]

Explanation:

- ctr stores {1:2, 2:3, 3:1}

- ctr.elements() -> expands this into: 1 twice, 2 thrice and 3 once

- list() converts the iterator into a list.

3. most_common(): Returns a list of the n most common elements and their counts from the most common to the least. If n is not specified, it returns all elements in the Counter.

Python

from collections import Counter
ctr = Counter ([ 1 , 2 , 2 , 2 , 3 , 3 , 3 , 3 ])
common = ctr . most_common ( 2 )
print ( common )

Output
[(3, 4), (2, 3)]

Explanation:

- ctr counts are {3:4, 2:3, 1:1}

- ctr.most_common(2) picks: 3 with count 4 and 2 with count 3

- Returned as a list of (element, count) pairs.

4. Increasing Count Manually: Increases the count of a single element by 1.

Python

from collections import Counter
ctr = Counter ([ 1 , 1 , 2 , 3 ])

ctr [ 2 ] += 2
ctr [ 4 ] += 1
print ( ctr )

Output
Counter({2: 3, 1: 2, 3: 1, 4: 1})

Explanation:

- ctr[2] += 2 -> 2 was 1, now becomes 3

- ctr[4] += 1 -> 4 was not present, so becomes 1

5. subtract() : Subtracts element counts from another iterable or mapping. Counts can go negative.

Python

from collections import Counter
ctr = Counter ([ 1 , 1 , 2 , 2 , 2 , 3 ])
ctr . subtract ([ 2 , 2 , 3 ])
print ( ctr )

Output
Counter({1: 2, 2: 1, 3: 0})

Explanation:

- Original: {2:3, 1:2, 3:1}

- ctr.subtract([2, 2, 3]): 2 appears twice-> 2:3 becomes 2:1 and 3 appears once-> 3:1 becomes 3:0

- 1 is untouched because it does not appear in the subtract list.

Note: Counts can even go negative if subtraction exceeds the original count.

Arithmetic Operations on Counters

Counters support addition, subtraction, intersection and union operations, allowing for various arithmetic operations.

Python

from collections import Counter
ctr1 = Counter ([ 1 , 2 , 2 , 3 ])
ctr2 = Counter ([ 2 , 3 , 3 , 4 ])

print ( ctr1 + ctr2 ) # Addition
print ( ctr1 - ctr2 ) # Subtraction
print ( ctr1 & ctr2 ) # Intersection
print ( ctr1 | ctr2 ) # Union

Output
Counter({2: 3, 3: 3, 1: 1, 4: 1})
Counter({1: 1, 2: 1})
Counter({2: 1, 3: 1})
Counter({2: 2, 3: 2, 1: 1, 4: 1})

Python

Python collections-module

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
