# Python String

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/python-string/
Original Path: https://www.geeksforgeeks.org/python/python-string/
Course: Python Programming

Python String

Last Updated : 12 Mar, 2026

In Python, a string is a sequence of characters written inside quotes. It can include letters, numbers, symbols and spaces.

- Python does not have a separate character type.

- A single character is treated as a string of length one.

- Strings are commonly used for text handling and manipulation.

Creating a String

Strings can be created using either single ('...') or double ("...") quotes. Both behave the same.

Example : Creating two equivalent strings one with single and other with double quotes.

Python

s1 = 'GfG'
s2 = "GfG"
print ( s1 )
print ( s2 )

Output
GfG

Multi-line Strings

Use triple quotes ('''...''' ) or ( """...""") for strings that span multiple lines. Newlines are preserved.

Example: Define and print multi-line strings using both styles.

Python

s = """I am Learning
Python String on GeeksforGeeks"""
print ( s )

s = '''I'm a
Geek'''
print ( s )

Output
I am Learning
Python String on GeeksforGeeks
I'm a
Geek

Accessing characters in String

Strings are indexed sequences. Positive indices start at 0 from the left, negative indices start at -1 from the right as represented in below image:
Indices of string in reverse
Example 1: Access specific characters through positive indexing.

Python

s = "GeeksforGeeks"
print ( s [ 0 ])
print ( s [ 4 ])

Output
G
s

Note: Accessing an index out of range will cause an IndexError. Only integers are allowed as indices and using a float or other types will result in a TypeError.

Example 2: Read characters from the end using negative indices .

Python

s = "GeeksforGeeks"
print ( s [ - 10 ])
print ( s [ - 5 ])

Output
k
G

String Slicing

Slicing is a way to extract a portion of a string by specifying the start and end indexes. The syntax for slicing is string[start:end], where start starting index and end is stopping index (excluded).

Example : In this example we are slicing through range and reversing a string.

Python

s = "GeeksforGeeks"
print ( s [ 1 : 4 ])
print ( s [: 3 ])
print ( s [ 3 :])
print ( s [:: - 1 ])

Output
eek
Gee
ksforGeeks
skeeGrofskeeG

String Iteration

Strings are iterable, you can loop through characters one by one.

Example: Here, it prints each character on its own line.

Python

s = "Python"
for char in s :
print ( char )

Output
P
y
t
h
o
n

Explanation: for loop pulls characters in order and each iteration prints the next character.

String Immutability

Strings are immutable, which means that they cannot be changed after they are created. If we need to manipulate strings then we can use methods like concatenation, slicing or formatting to create new strings based on original.

Example: In this example we are changing first character by building a new string.

Python

s = "geeksforGeeks"
s = "G" + s [ 1 :]
print ( s )

Output
GeeksforGeeks

Deleting a String

In Python, it is not possible to delete individual characters from a string since strings are immutable. However, we can delete an entire string variable using the del keyword.

Example: Here, we are using del keyword to delete a string.

Python

s = "GfG"
del s

Note: After deleting the string if we try to access s then it will result in a NameError because variable no longer exists.

Updating a String

As strings are immutable, “updates” create new strings using slicing or methods such as replace() .

Example: This code fixes the first letter and replace a word.

Python

s = "hello geeks"
s1 = "H" + s [ 1 :]
s2 = s . replace ( "geeks" , "GeeksforGeeks" )
print ( s1 )
print ( s2 )

Output
Hello geeks
hello GeeksforGeeks

Explanation:

- s1: slice from index 1 onward and prepend "H".

- s2: replace("geeks", "GeeksforGeeks") returns a new string.

Common String Methods

Python provides various built-in methods to manipulate strings. Below are some of the most useful methods:

1. len(): The len() function returns the total number of characters in a string (including spaces and punctuation).

Python

s = "GeeksforGeeks"
print ( len ( s ))

Output
13

2. upper() and lower(): upper() method converts all characters to uppercase whereas, lower() method converts all characters to lowercase.

Python

s = "Hello World"
print ( s . upper ())
print ( s . lower ())

Output
HELLO WORLD
hello world

3. strip() and replace(): strip() removes leading and trailing whitespace from the string and replace() replaces all occurrences of a specified substring with another.

Python

s = " Gfg "
print ( s . strip ())

s = "Python is fun"
print ( s . replace ( "fun" , "awesome" ))

Output
Gfg
Python is awesome

To learn more about string methods, please refer to Python String Methods .

Concatenating and Repeating Strings

We can concatenate strings using + operator and repeat them using * operator.

1. Strings can be combined by using + operator.

Example: Join two words with a space.

Python

s1 = "Hello"
s2 = "World"
print ( s1 + " " + s2 )

Output
Hello World

2. We can repeat a string multiple times using * operator.

Example: Repeat a greeting three times.

Python

s = "Hello "
print ( s * 3 )

Output
Hello Hello Hello

Formatting Strings

Python provides several ways to include variables inside strings.

1. Using f-strings

The simplest and most preferred way to format strings is by using f-strings .

Example: Embed variables directly using {} placeholders.

Python

name = "Alice"
age = 22
print ( f "Name: { name } , Age: { age } " )

Output
Name: Alice, Age: 22

2. Using format()

Another way to format strings is by using format() method.

Example: Use placeholders {} and pass values positionally.

Python

s = "My name is {} and I am {} years old." . format ( "Alice" , 22 )
print ( s )

Output
My name is Alice and I am 22 years old.

String Membership Testing

in keyword checks if a particular substring is present in a string.

Example: Here, we are testing for the presence of substrings.

Python

s = "GeeksforGeeks"
print ( "Geeks" in s )
print ( "GfG" in s )

Output
True
False

Related Links:

- Python String Quiz

- String Comparison

- Convert integer to String

- Convert string to integer

- Convert a string to list

- String Exercise

- Escape characters

Recommended Problems:

- Repeat the Strings

- String Functions

- Convert String to LowerCase

- String Duplicates Removal

- Reverse String

- Check Palindrome

Misc

Python

python-string

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
