# Python Sets

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/python-sets/
Original Path: https://www.geeksforgeeks.org/python/python-sets/
Course: Python Programming

Python Sets

Last Updated : 28 Feb, 2026

Python set is an unordered collection of multiple items having different datatypes. In Python, sets are mutable, unindexed and do not contain duplicates. The order of elements in a set is not preserved and can change.

- Can store None values.

- Implemented using hash tables internally.

- Do not implement interfaces like Serializable or Cloneable.

- Python sets are not inherently thread-safe; synchronization is needed if used across threads.

Creating a Set in Python

In Python, the most basic and efficient method for creating a set is using curly braces.

Python

s = { 1 , 2 , 3 , 4 }
print ( s )

Output
{1, 2, 3, 4}

Using the set() function

Python Sets can be created by using the built-in set() function with an iterable object or a sequence by placing the sequence inside curly braces, separated by a 'comma'.

Note: A Python set cannot contain mutable types such as lists or dictionaries, because they are unhashable.

Python

s = set ()
print ( s )

s = set ( "GeeksForGeeks" )
print ( s )

# Creating a Set with the use of a List
s = set ([ "GFG" , "For" , "Geeks" ])
print ( s )

# Creating a Set with the use of a tuple
t = ( "GFG" , "for" , "Geeks" )
print ( set ( t ))

# Creating a Set with the use of a dictionary
d = { "GFG" : 1 , "for" : 2 , "Geeks" : 3 }
print ( set ( d ))

Output
set()
{'e', 'o', 'r', 'F', 'G', 'k', 's'}
{'Geeks', 'GFG', 'For'}
{'for', 'GFG', 'Geeks'}

Unordered, Unindexed and Mutability

In set, the order of elements is not guaranteed to be the same as the order in which they were added. The output could vary each time we run the program. Also the duplicate items entered are removed by itself.

Sets do not support indexing. Trying to access an element by index (set[0]) raises a TypeError .

We can add elements to the set using add() . We can remove elements from the set using remove() . The set changes after these operations, demonstrating its mutability. However, we cannot changes its items directly.

Python

s = { 3 , 1 , 4 , 1 , 5 , 9 , 2 }

print ( s ) # Output may vary: {1, 2, 3, 4, 5, 9}

# Unindexed: Accessing elements by index is not possible
# This will raise a TypeError
try :
print ( s [ 0 ])
except TypeError as e :
print ( e )

Output
{1, 2, 3, 4, 5, 9}
'set' object is not subscriptable

Adding Elements to a Set in Python

We can add items to a set using add() method and update() method . add() method can be used to add only a single item. To add multiple items we use update() method.

Python

s = { 1 , 2 , 3 }

# Add one item
s . add ( 4 )

# Add multiple items
s . update ([ 5 , 6 ])

print ( s )

Output
{1, 2, 3, 4, 5, 6}

Accessing a Set in Python

Because sets are unordered and unindexed, you cannot access elements using a specific index like set[0]. Instead, you must use a loop to iterate through the items or the in keyword to check for an item's existence.

Python

s = { "Geeks" , "For" , "Geeks" }

# 1. Accessing elements using a for loop
for i in s :
print ( i , end = " " )

# 2. Checking if an element exists using the 'in' keyword
print ( " \n " , "Geeks" in s )

Output
For Geeks
True

Explanation:

- for loop accesses each item in the set. Note that because sets are unordered, the items may appear in a different sequence every time the code is executed.

- Notice that although "Geeks" was added twice in the code, it only appears once in the output because sets automatically remove duplicates.

- "in" keyword efficiently checks if the string "Geeks" is present in s, returning True if found and False otherwise.

Removing Elements from the Set in Python

We can remove an element from a set in Python using several methods: remove(), discard() and pop(). Each method works slightly differently :

- Using remove() Method or discard() Method

- Using pop() Method

- Using clear() Method

Using remove() Method or discard() Method

remove() method removes a specified element from the set. If the element is not present in the set, it raises a KeyError. discard() method also removes a specified element from the set. Unlike remove(), if the element is not found, it does not raise an error.

Python

# Using Remove Method
s = { 1 , 2 , 3 , 4 , 5 }
s . remove ( 3 )
print ( s )

# Attempting to remove an element that does not exist
try :
s . remove ( 10 )
except KeyError as e :
print ( "Error:" , e )

# Using discard() Method
s . discard ( 4 )
print ( s )

# Attempting to discard an element that does not exist
s . discard ( 10 ) # No error raised
print ( s )

Output
{1, 2, 4, 5}
Error: 10
{1, 2, 5}

Using pop() Method

pop() method removes and returns an arbitrary element from the set. This means we don't know which element will be removed. If the set is empty, it raises a KeyError.

Note: If the set is unordered then there's no such way to determine which element is popped by using the pop() function.

Python

s = { 1 , 2 , 3 , 4 , 5 }
val = s . pop ()
print ( val )
print ( s )

# Using pop on an empty set
s . clear () # Clear the set to make it empty
try :
s . pop ()
except KeyError as e :
print ( "Error:" , e )

Output
1
{2, 3, 4, 5}
Error: 'pop from an empty set'

Using clear() Method

clear() method removes all elements from the set, leaving it empty.

Python

s = { 1 , 2 , 3 , 4 , 5 }
s . clear ()
print ( s )

Output
set()

Frozen Sets in Python

A frozenset in Python is a built-in data type that is similar to a set but with one key difference that is immutability. This means that once a frozenset is created, we cannot modify its elements that is we cannot add, remove or change any items in it. Like regular sets, a frozenset cannot contain duplicate elements.

If no parameters are passed, it returns an empty frozenset.

Python

# Creating a frozenset from a list
fs = frozenset ([ 1 , 2 , 3 , 4 , 5 ])
print ( fs )

# Creating a frozenset from a set
s = { 3 , 1 , 4 , 1 , 5 }
fs = frozenset ( s )
print ( fs )

Output
frozenset({1, 2, 3, 4, 5})
frozenset({1, 3, 4, 5})

Typecasting Objects into Sets

Typecasting objects into sets in Python refers to converting various data types into a set. Python provides the set() constructor to perform this typecasting, allowing us to convert lists, tuples and strings into sets.

Python

# Typecasting list into set
li = [ 1 , 2 , 3 , 3 , 4 , 5 , 5 , 6 , 2 ]
s = set ( li )
print ( s )

# Typecasting string into set
s = "GeeksforGeeks"
s = set ( s )
print ( s )

# Typecasting dictionary into set
d = { 1 : "One" , 2 : "Two" , 3 : "Three" }
s = set ( d )
print ( s )

Output
{1, 2, 3, 4, 5, 6}
{'G', 'k', 'e', 's', 'o', 'f', 'r'}
{1, 2, 3}

Related Links

- Python Set Quiz

- Python Set Methods

- Maximum and Minimum in a Set

- Python set operations (union, intersection, difference and symmetric difference)

- Output of Python programs – Sets

Recommended Problems

- Set Operations

- Set in Python - II

- Implement Set in Python

- Python Set Coding Practice Problems

Misc

Python

python-set

Python-Built-in-functions

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
