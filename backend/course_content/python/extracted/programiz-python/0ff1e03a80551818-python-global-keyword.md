# Python Global Keyword

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/global-keyword
Original Path: https://www.programiz.com/python-programming/global-keyword
Course: Python Programming

- Python Global Keyword

- Python Recursion

- Python Modules

- Python Package

- Python Main function

Python Files

- Python Directory and Files Management

- Python CSV: Read and Write CSV files

- Reading CSV files in Python

- Writing CSV files in Python

Python Exception Handling

- Python Exceptions

- Python Exception Handling

- Python Custom Exceptions

Python Object & Class

- Python Objects and Classes

- Python Inheritance

- Python Multiple Inheritance

- Polymorphism in Python

- Python Operator Overloading

Python Advanced Topics

- List comprehension

- Python Lambda/Anonymous Function

- Python Iterators

- Python Generators

- Python Namespace and Scope

- Python Closures

- Python Decorators

- Python @property decorator

- Python RegEx

Python Date and Time

- Python datetime

- Python strftime()

- Python strptime()

- How to get current date
and time in Python?

- Python Get Current Time

- Python timestamp to
datetime and vice-versa

- Python time Module

- Python sleep()

Additional Topic

- Precedence and Associativity of Operators in Python

- Python Keywords and Identifiers

- Python Asserts

- Python Json

- Python pip

- Python *args and **kwargs

Python Tutorials

Python Variable Scope

Python Namespace and Scope

Python globals()

Python Closures

Python locals()

Python Keywords and Identifiers

Python Global Keyword

In Python, the
global
keyword allows us to modify the variable outside of the current scope.

It is used to create a global variable and make changes to the variable in a local context.

Before we learn about the
global
keyword, make sure you have got some basics of Python Variable Scope .

Access and Modify Python Global Variable

First let's try to access a global variable from the inside of a function ,

c = 1 # global variable

def add():
print(c)

add()

# Output: 1

Here, we can see that we have accessed a global variable from the inside of a function.

However, if we try to modify the global variable from inside a function as:

# global variable
c = 1

def add():

# increment c by 2
c = c + 2

print(c)

add()

Output

UnboundLocalError: local variable 'c' referenced before assignment

This is because we can only access the global variable but cannot modify it from inside the function.

The solution for this is to use the
global
keyword.

Example: Changing Global Variable From Inside a Function using global

# global variable
c = 1

def add():

# use of global keyword
global c

# increment c by 2
c = c + 2

print(c)

add()

# Output: 3

In the above example, we have defined c as the
global
keyword inside
add()
.

Then, we have incremented the variable c by 2 , i.e
c = c + 2
.

As we can see while calling
add()
, the value of global variable c is modified from 1 to 3 .

Rules of global Keyword

The basic rules for
global
keyword in Python are:

- When we create a variable inside a function, it is local by default.

- When we define a variable outside of a function, it is global by default. You don't have to use the
global
keyword.

- We use the
global
keyword to modify (write to) a global variable inside a function.

- Use of the
global
keyword outside a function has no effect.

Also Read:

- Python Variables, Constants and Literals

- Python globals()

- Introduction

- Access and Modify Python Global Variable

- Global in Nested Functions

- Rules of global Keyword

Previous Tutorial:

Python Variable Scope

Next Tutorial:

Python Recursion

Share on:

Did you find this article helpful?

Sorry about that.

How can we improve it?

Feedback *

Leave this field blank

Your builder path starts here. Builders don't just know how to code, they create solutions that matter.

Escape tutorial hell and ship real projects.

Try Programiz PRO

Real-World Projects

On-Demand Learning

- AI Mentor

Builder Community

Related Tutorials

Python Tutorial

Python Variable Scope

Python Tutorial

Python Namespace and Scope

Python Library

Python globals()

Python Tutorial

Python Closures
