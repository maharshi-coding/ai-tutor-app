# Input and Output in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/input-and-output-in-python/
Original Path: https://www.geeksforgeeks.org/python/input-and-output-in-python/
Course: Python Programming

Input and Output in Python

Last Updated : 4 Mar, 2026

The print() function is used for output in various formats and the input() function enables interaction with users.

Taking Input using input()

Python's input() function is used to take user input. By default, it returns the user input in form of a string.

Python

name = input ( "Enter your name: " )
print ( "Hello," , name , "! Welcome!" )

Output

Enter your name: GeeksforGeeks
Hello, GeeksforGeeks ! Welcome!

The code prompts the user to input their name, stores it in the variable "name" and then prints a greeting message addressing the user by their entered name.

To learn more about taking input, please refer: Taking Input in Python

Printing Output using print()

At its core, printing output in Python is straightforward, thanks to the print() function. This function allows us to display text, variables and expressions on the console. Let's begin with the basic usage of the print() function:

In this example, "Hello, World!" is a string literal enclosed within double quotes. When executed, this statement will output the text to the console.

Python

print ( "Hello, World!" )

Output
Hello, World!

Printing Variables

We can use the print() function to print single and multiple variables. We can print multiple variables by separating them with commas. Example:

Python

s = "Brad"
print ( s )

s = "Anjelina"
age = 25
city = "New York"
print ( s , age , city )

Output
Brad
Anjelina 25 New York

Take Multiple Input in Python

We are taking multiple input from the user in a single line, splitting the values entered by the user into separate variables for each value using the split() method . Then, it prints the values with corresponding labels, either two or three, based on the number of inputs provided by the user.

Python

x , y = input ( "Enter two values: " ) . split ()
print ( "Number of boys: " , x )
print ( "Number of girls: " , y )

x , y , z = input ( "Enter three values: " ) . split ()
print ( "Total number of students: " , x )
print ( "Number of boys is : " , y )
print ( "Number of girls is : " , z )

Output

Enter two values: 5 10
Number of boys: 5
Number of girls: 10
Enter three values: 5 10 15
Total number of students: 5
Number of boys is : 10
Number of girls is : 15

Note: The split() method always returns input values as strings. If you need them as numbers (int or float), you must convert them using typecasting.

Change the Type of Input in Python

By default input() function helps in taking user input as string. If any user wants to take input as int or float, we just need to typecast it.

Print Names in Python

The code prompts the user to input a string (the color of a rose), assigns it to the variable color and then prints the inputted color.

Python

color = input ( "What color is rose?: " )
print ( color )

Output

What color is rose?: Red
Red

Print Numbers in Python

The code prompts the user to input an integer representing the number of roses, converts the input to an integer using typecasting and then prints the integer value.

Python

n = int ( input ( "How many roses?: " ))
print ( n )

Output

How many roses?: 88
88

Print Float or Decimal Number in Python

The code prompts the user to input the price of each rose as a floating-point number, converts the input to a float using typecasting and then prints the price.

Python

price = float ( input ( "Price of each rose?: " ))
print ( price )

Output

Price of each rose?: 50.305
50.305

Find DataType of Input in Python

In the given example, we are printing the type of variable x. We will determine the type of an object in Python.

Python

a = "Hello World"
b = 10
c = 11.22
d = ( "Geeks" , "for" , "Geeks" )
e = [ "Geeks" , "for" , "Geeks" ]
f = { "Geeks" : 1 , "for" : 2 , "Geeks" : 3 }

print ( type ( a ))
print ( type ( b ))
print ( type ( c ))
print ( type ( d ))
print ( type ( e ))
print ( type ( f ))

Output
<class 'str'>
<class 'int'>
<class 'float'>
<class 'tuple'>
<class 'list'>
<class 'dict'>

Recommended Problems:

- Start Coding - Python

- Print In Python

- Multi Printing

- Int Str

- Input In Python

Related Links:

- Quiz on Python Input Output

- Taking Conditional User Input

- Output Formatting

- Take input from stdin

- input() vs raw_input()

- Input Methods for Competitive Programming

Python

python-input-output

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
