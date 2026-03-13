# Defaultdict in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/defaultdict-in-python/
Original Path: https://www.geeksforgeeks.org/python/defaultdict-in-python/
Course: Python Programming

Defaultdict in Python

Last Updated : 4 Oct, 2025

In Python, defaultdict is a subclass of the built-in dict class from the collections module. It automatically assigns a default value to keys that do not exist, which means you don’t have to manually check for missing keys and avoid KeyError.

This example shows how a defaultdict automatically creates missing keys with a default empty list.

Python

from collections import defaultdict
d = defaultdict ( list )

d [ 'fruits' ] . append ( 'apple' )
d [ 'vegetables' ] . append ( 'carrot' )
print ( d )
print ( d [ 'juices' ])

Output
defaultdict(<class 'list'>, {'fruits': ['apple'], 'vegetables': ['carrot']})
[]

Explanation: This code creates a defaultdict with a default value of an empty list. It adds elements to the 'fruits' and 'vegetables' keys. When trying to access the 'juices' key, no KeyError is raised, and an empty list is returned since it doesn't exist in the dictionary.

Syntax of DefaultDict

defaultdict(default_factory)

Parameters:

- default_factory: A callable (like int, list, set, str or a custom function) that provides the default value for missing keys.

- If this argument is None, accessing a missing key raises a KeyError.

Return Value: It returns a dictionary-like object that automatically supplies a default value for missing keys instead of raising KeyError.

Why do we need defaultdict()

In a normal dictionary, accessing a missing key raises a KeyError. defaultdict solves this by:

- Automatically creating missing keys with a default value.

- Reducing repetitive if key not in dict checks.

- Making tasks like counting, grouping, or collecting items easier.

- Being especially useful for histograms, graph building, text grouping, and caching.

How Does defaultdict Work?

When you create a defaultdict, you specify a default_factory (a callable).

- If the key exists: its value is returned.

- If the key does not exist: default_factory is called to generate a default value.

For example:

- int: returns 0

- list: returns []

- str: returns ""

This mechanism avoids errors and makes code simpler when handling missing keys.

Use Cases of defaultdict

1. Using List as Default Factory

When the list class is passed as the default_factory argument, then a defaultdict is created with the values that are list.

Example: This example shows how we can use list as the default factory, so every missing key will automatically start with an empty list.

Python

from collections import defaultdict
d = defaultdict ( list )
for i in range ( 5 ):
d [ i ] . append ( i )

print ( "Dictionary with values as list:" )
print ( d )

Output
Dictionary with values as list:
defaultdict(<class 'list'>, {0: [0], 1: [1], 2: [2], 3: [3], 4: [4]})

Explanation: This example demonstrates the use of list as the default factory. A defaultdict is created with list, which means any missing key will automatically have an empty list as its value. The loop appends the value of i to the list of the corresponding key.

2. Using int Default Factory

When the int class is passed as the default_factory argument, then a defaultdict is created with default value as zero.

Example: This example demonstrates using int as the default factory, making missing keys default to 0.

Python

from collections import defaultdict
d = defaultdict ( int )
a = [ 1 , 2 , 3 , 4 , 2 , 4 , 1 , 2 ]
for i in a :
d [ i ] += 1

print ( d )

Output
defaultdict(<class 'int'>, {1: 2, 2: 3, 3: 1, 4: 2})

Explanation: This example uses int as the default factory. int() returns 0 , so missing keys will have a default value of 0 . The loop counts the occurrences of each number in the list a and updates the dictionary accordingly.

3. Using str Default Factory

With defaultdict(str), any new key automatically maps to '', so you can concatenate text without key checks.

Example: This example shows how str as a factory creates empty strings ("") for missing keys.

Python

from collections import defaultdict

# Using str as the factory function
sd = defaultdict ( str )
sd [ 'greeting' ] = 'Hello'
print ( sd )

Output
defaultdict(<class 'str'>, {'greeting': 'Hello'})

Explanation: This example uses str as the default factory. str() returns an empty string, so missing keys will have an empty string as their default value. A value (' Hello ') is explicitly set for the key ' greeting '.

4. Grouping Words by First Letter

defaultdict is very handy in text processing, for example grouping words by their starting letter.

Example: This example demonstrates how defaultdict(list) can be used to group words by their first letter, very useful in text processing.

Python

from collections import defaultdict
words = [ "apple" , "ant" , "banana" , "bat" , "carrot" , "cat" ]
grouped = defaultdict ( list )
for word in words :
grouped [ word [ 0 ]] . append ( word )

print ( grouped )

Output
defaultdict(<class 'list'>, {'a': ['apple', 'ant'], 'b': ['banana', 'bat'], 'c': ['carrot', 'cat']})

Explanation: Here, defaultdict(list) automatically creates an empty list for each new first letter, so we can group words without checking if the key exists.

Python defaultdict Type for Handling Missing Keys

Behind the scenes, defaultdict uses the special __missing__() method:

- It is automatically called when a key is not found.

- If a default_factory is provided: its return value is used.

- If default_factory is None: a KeyError is raised.

Example: This example shows how the __missing__() method works behind the scenes in defaultdict. It is automatically called when a key is not found, returning the default value instead of raising a KeyError.

Python

from collections import defaultdict
d = defaultdict ( lambda : "Not Present" )
d [ "a" ] = 1
d [ "b" ] = 2

print ( d . __missing__ ( 'x' ))
print ( d . __missing__ ( 'd' ))
print ( d [ 'a' ]) # Normal access to existing key

Output
Not Present
1

Explanation:

- Missing keys 'x' and 'd' trigger __missing__() and return "Not Present".

- Calling __missing__('a') directly does not return the stored value but instead triggers the default_factory.

- Normal access with d['a'] returns the correct stored value (1).

Note: __missing__() is intended for internal use in defaultdict. To safely access values, use d[key] or d.get(key, default) instead of calling __missing__ directly.

Python

Python Programs

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
