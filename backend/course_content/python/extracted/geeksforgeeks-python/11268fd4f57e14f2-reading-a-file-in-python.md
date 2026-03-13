# Reading a File in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/how-to-read-from-a-file-in-python/
Original Path: https://www.geeksforgeeks.org/python/how-to-read-from-a-file-in-python/
Course: Python Programming

Reading a File in Python

Last Updated : 5 Sep, 2025

Reading from a file in Python means accessing and retrieving contents of a file, whether it be text, binary data or formats like CSV and JSON. It is widely used in real-world applications such as reading configuration files, processing logs or handling datasets in data science.

Example File: geeks.txt

Hello World
Hello GeeksforGeeks

Basic File Reading

Basic file reading involves opening a file, reading its contents, and closing it properly to free up system resources.

Steps:

- Open the file: open("filename", "mode") opens the file in a specified mode (e.g., read mode "r").

- Read content: Using read(), readline() or readlines() methods.

- Close the file: close() ensures system resources are released.

Example: This code opens a file, reads all its contents at once, prints them and then closes the file.

Python

# Open the file in read mode
file = open ( "geeks.txt" , "r" )

# Read the entire content of the file
content = file . read ()
print ( content )

# Close the file
file . close ()

Output:

Hello World
Hello GeeksforGeeks

Explanation: This code opens geeks.txt in read mode, reads all its content into a string, prints it and then closes the file to free resources.

Best Practice: Using with statement

Instead of manually closing files, we can use the with statement. It ensures the file is automatically closed when the block ends.

Example: This code opens the file, reads its contents and automatically closes it after use.

Python

with open ( "geeks.txt" , "r" ) as file :
content = file . read ()
print ( content )

Output:

Hello World
Hello GeeksforGeeks

Explanation: With with open(...), the file is closed automatically, preventing resource leaks.

Reading a File Line by Line

We may want to read a file line by line , especially for large files where reading the entire content at once is not practical. It is done with following two methods:

- for line in file: Iterates over each line in the file.

- line.strip(): Removes any leading or trailing whitespace, including newline characters.

Example 1: Using a Loop to Read Line by Line

This code reads each line one by one and removes extra newline characters.

Python

file = open ( "geeks.txt" , "r" )
for line in file :
print ( line . strip ()) # .strip() to remove newline characters
file . close ()

Output:

Hello World
Hello GeeksforGeeks

Explanation: This method reads each line of the file one at a time and prints it after removing leading/trailing whitespace.

Example 2: Using readline()

The readline() method reads one line at a time. We can keep calling it inside a loop until no lines are left.

Python

file = open ( "geeks.txt" , "r" )
line = file . readline ()
while line :
print ( line . strip ())
line = file . readline ()
file . close ()

Output:

Hello World
Hello GeeksforGeeks

Explanation: This method reads one line at a time, making it useful for processing very large files where loading entire content into memory at once is not efficient.

Reading Binary Files

Binary files store data in a format not meant to be read as text. These can include images, executables or any non-text data. We are using following methods to read binary files :

open("example.bin", "rb"): Opens the file example.bin in read binary mode.

Example: Reading a Binary File

This code reads an entire binary file and prints its raw byte content.

Python

file = open ( "example.bin" , "rb" )
content = file . read ()
print ( content )
file . close ()

Output:

b'Hello World\r\nHello GeeksforGeeks'

Explanation: This code reads a file in binary mode ("rb") and prints its content as bytes, which is necessary for handling non-text files.

Reading Specific Parts of a File

Sometimes, we may only need to read a specific part of a file, such as the first few bytes, a specific line, or a range of lines.

Example: This code reads only the first 10 characters of the file.

Python

file = open ( "geeks.txt" , "r" )
content = file . read ( 10 )
print ( content )
file . close ()

Output:

Hello Worl

Explanation: Reading a limited number of characters is useful for quickly previewing content without loading the whole file.

Reading CSV Files

CSV (Comma-Separated Values) is widely used for storing tabular data. Python’s csv module helps parse CSV easily. Here, instead of needing an external file, we’ll simulate one using io.StringIO.

Example : This code creates an in-memory CSV string, then reads it row by row.

Python

import csv
import io

# Create a CSV sample in memory
csv_data = """Year,Industry,Value
2014,Manufacturing,769400
2014,Manufacturing,48000
2014,Manufacturing,12
"""
csvfile = io . StringIO ( csv_data )
csvreader = csv . reader ( csvfile )
for row in csvreader :
print ( row )

Output:

['Year', 'Industry', 'Value']
['2014', 'Manufacturing', '769400']
['2014', 'Manufacturing', '48000']
['2014', 'Manufacturing', '12']

Explanation: Instead of a physical file, we used StringIO to create a file-like object. The CSV reader parses each line into a list of values.

Reading JSON Files

Reading JSON (JavaScript Object Notation) files are widely used in APIs and web applications for data transfer. Python's
json
module allows us to easily load JSON into dictionaries for further processing.

Example: This code opens a JSON file, loads its data, and prints it as a Python dictionary.

Python

import json
with open ( "sample1.json" , "r" ) as jsonfile :
data = json . load ( jsonfile )
print ( data )

Output:

{'fruit': 'Apple', 'size': 'Large', 'color': 'Red'}

Explanation: The JSON file content is converted into a Python dictionary, which can be used directly in programs.

Python

python-file-handling

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
