# Python Tuples

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/python-tuples/
Original Path: https://www.geeksforgeeks.org/python/python-tuples/
Course: Python Programming

Python Tuples

Last Updated : 2 Mar, 2026

A tuple in Python is an immutable ordered collection of elements.

- Tuples are similar to lists, but unlike lists, they cannot be changed after their creation (i.e., they are immutable).

- Tuples can hold elements of different data types.

- The main characteristics of tuples are being ordered, heterogeneous and immutable.

Creating a Tuple

A tuple is created by placing all the items inside parentheses (), separated by commas. A tuple can have any number of items and they can be of different data types .

Python

tup = ()
print ( tup )

# Using String
tup = ( 'Geeks' , 'For' )
print ( tup )

# Using List
li = [ 1 , 2 , 4 , 5 , 6 ]
print ( tuple ( li ))

# Using Built-in Function
tup = tuple ( 'Geeks' )
print ( tup )

Output
()
('Geeks', 'For')
(1, 2, 4, 5, 6)
('G', 'e', 'e', 'k', 's')

Let's understand tuple in detail:

Creating a Tuple with Mixed Datatypes.

Tuples can contain elements of various data types, including other tuples, lists , dictionaries and even functions .

Python

tup = ( 5 , 'Welcome' , 7 , 'Geeks' )
print ( tup )

# Creating a Tuple with nested tuples
tup1 = ( 0 , 1 , 2 , 3 )
tup2 = ( 'python' , 'geek' )
tup3 = ( tup1 , tup2 )
print ( tup3 )

# Creating a Tuple with repetition
tup1 = ( 'Geeks' ,) * 3
print ( tup1 )

Output
(5, 'Welcome', 7, 'Geeks')
((0, 1, 2, 3), ('python', 'geek'))
('Geeks', 'Geeks', 'Geeks')

Python Tuple Basic Operations

Below are the Python tuple operations.

- Accessing of Python Tuples

- Concatenation of Tuples

- Slicing of Tuple

- Deleting a Tuple

Accessing of Tuples

We can access the elements of a tuple by using indexing and slicing , similar to how we access elements in a list. Indexing starts at 0 for the first element and goes up to n-1, where n is the number of elements in the tuple. Negative indexing starts from -1 for the last element and goes backward.

Python

# Accessing Tuple with Indexing
tup = tuple ( "Geeks" )
print ( tup [ 0 ])

# Accessing a range of elements using slicing
print ( tup [ 1 : 4 ])
print ( tup [: 3 ])

# Tuple unpacking
tup = ( "Geeks" , "For" , "Geeks" )

# This line unpack values of Tuple1
a , b , c = tup
print ( a )
print ( b )
print ( c )

Output
G
('e', 'e', 'k')
('G', 'e', 'e')
Geeks
For
Geeks

Concatenation of Tuples

Tuples can be concatenated using the + operator. This operation combines two or more tuples to create a new tuple.

Note: Only the same datatypes can be combined with concatenation, an error arises if a list and a tuple are combined.

Python

tup1 = ( 0 , 1 , 2 , 3 )
tup2 = ( 'Geeks' , 'For' , 'Geeks' )

tup3 = tup1 + tup2
print ( tup3 )

Output
(0, 1, 2, 3, 'Geeks', 'For', 'Geeks')

Slicing of Tuple

Slicing a tuple means creating a new tuple from a subset of elements of the original tuple. The slicing syntax is tuple[start:stop:step].

Note: Negative Increment values can also be used to reverse the sequence of Tuples.

Python

tup = tuple ( 'GEEKSFORGEEKS' )

# Removing First element
print ( tup [ 1 :])

# Reversing the Tuple
print ( tup [:: - 1 ])

# Printing elements of a Range
print ( tup [ 4 : 9 ])

Output
('E', 'E', 'K', 'S', 'F', 'O', 'R', 'G', 'E', 'E', 'K', 'S')
('S', 'K', 'E', 'E', 'G', 'R', 'O', 'F', 'S', 'K', 'E', 'E', 'G')
('S', 'F', 'O', 'R', 'G')

Note: [:] returns a shallow copy of the tuple, while [::step] allows stepping through elements. Using [::-1] reverses the sequence.

Deleting a Tuple

Since tuples are immutable, we cannot delete individual elements of a tuple. However, we can delete an entire tuple using del statement .

Note: Printing of Tuple after deletion results in an Error.

Python

tup = ( 0 , 1 , 2 , 3 , 4 )
del tup

print ( tup )

Output

ERROR!
Traceback (most recent call last):
File "<main.py>", line 6, in <module>
NameError: name 'tup' is not defined

Tuple Unpacking with Asterisk (*)

In Python, the " * " operator can be used in tuple unpacking to grab multiple items into a list. This is useful when you want to extract just a few specific elements and collect the rest together.

Python

tup = ( 1 , 2 , 3 , 4 , 5 )

a , * b , c = tup

print ( a )
print ( b )
print ( c )

Output
1
[2, 3, 4]
5

Explanation:

- a gets the first item.

- c gets the last item.

- *b collects everything in between into a list.

Related Links:

- Python Tuples Quiz

- Remove empty tuples from a list

- Reversing a Tuple

- Convert a list of Tuples into Dictionary

- Count occurrences of an element in a Tuple

- Count the elements in a list until an element is a Tuple

- Sort Tuples in Increasing Order by any key

- Namedtuple in Python

- Test if tuple is distinct

Misc

Python

python-tuple

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
