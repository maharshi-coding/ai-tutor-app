# Python Recursion

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/recursion
Original Path: https://www.programiz.com/python-programming/recursion
Course: Python Programming

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

Python 3 Tutorial

Python Mathematical Functions

Python Function Arguments

Python User-defined Functions

Python Functions

Python Main function

Python Recursion

Recursion is the process of defining something in terms of itself.

A physical world example would be to place two parallel mirrors facing each other. Any object in between them would be reflected recursively.

Do you want to learn Recursion the right way? Enroll in our Interactive Recursion Course .

Python Recursive Function

In Python, we know that a function can call other functions. It is even possible for the function to call itself. These types of construct are termed as recursive functions.

The following image shows the working of a recursive function called
recurse
.

Following is an example of a recursive function to find the factorial of an integer .

Factorial of a number is the product of all the integers from 1 to that number. For example, the factorial of 6 (denoted as 6!) is 1*2*3*4*5*6 = 720 .

Example of a recursive function

def factorial(x):
"""This is a recursive function
to find the factorial of an integer"""

if x == 1:
return 1
else:
return (x * factorial(x-1))

num = 3
print("The factorial of", num, "is", factorial(num))

Output

The factorial of 3 is 6

In the above example,
factorial()
is a recursive function as it calls itself.

When we call this function with a positive integer, it will recursively call itself by decreasing the number.

Each function multiplies the number with the factorial of the number below it until it is equal to one. This recursive call can be explained in the following steps.

factorial(3) # 1st call with 3
3 * factorial(2) # 2nd call with 2
3 * 2 * factorial(1) # 3rd call with 1
3 * 2 * 1 # return from 3rd call as number=1
3 * 2 # return from 2nd call
6 # return from 1st call

Let's look at an image that shows a step-by-step process of what is going on:

Code Visualization : Want to see how each recursive call executes?
Try our line-by-line code visualizer.

Our recursion ends when the number reduces to 1. This is called the base condition.

Every recursive function must have a base condition that stops the recursion or else the function calls itself infinitely.

The Python interpreter limits the depths of recursion to help avoid infinite recursions, resulting in stack overflows.

By default, the maximum depth of recursion is 1000 . If the limit is crossed, it results in
RecursionError
. Let's look at one such condition.

def recursor():
recursor()

Output

Traceback (most recent call last):
File "<string>", line 3, in <module>
File "<string>", line 2, in a
[Previous line repeated 996 more times]
RecursionError: maximum recursion depth exceeded

Advantages of Recursion

- Recursive functions make the code look clean and elegant.

- A complex task can be broken down into simpler sub-problems using recursion.

- Sequence generation is easier with recursion than using some nested iteration.

Disadvantages of Recursion

- Sometimes the logic behind recursion is hard to follow through.

- Recursive calls are expensive (inefficient) as they take up a lot of memory and time.

- Recursive functions are hard to debug.

Also Read:

- Python Program to Find Sum of Natural Numbers Using Recursion

- Python Program to Display Fibonacci Sequence Using Recursion

- Python if...else Statement

Do you want to learn Recursion the right way? Enroll in our Interactive Recursion Course .

- What is recursion?

- Python Recursive Function

- Advantages of Recursion

- Disadvantages of Recursion

Before we wrap up, let’s put your knowledge of Python recursion to the test! Can you solve the following challenge?

Challenge:

Write a program to calculate the factorial of a number using recursion.

- The factorial of a non-negative integer
n
is the product of all positive integers less than or equal to
n
.

- For example, for input 5 , the return value should be 120 because
1*2*3*4*5
is 120 .

Check Code

Previous Tutorial:

Python Global Keyword

Next Tutorial:

Python Modules

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

Python 3 Tutorial

Python Tutorial

Python Mathematical Functions

Python Tutorial

Python User-defined Functions

Python Tutorial

Python Functions
