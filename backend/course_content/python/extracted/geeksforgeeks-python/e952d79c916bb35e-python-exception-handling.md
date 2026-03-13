# Python Exception Handling

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/python-exception-handling/
Original Path: https://www.geeksforgeeks.org/python/python-exception-handling/
Course: Python Programming

Python Exception Handling

Last Updated : 11 Oct, 2025

Python Exception Handling allows a program to gracefully handle unexpected events (like invalid input or missing files) without crashing. Instead of terminating abruptly, Python lets you detect the problem, respond to it, and continue execution when possible.

Let's see an example to understand it better:

Basic Example: Handling Simple Exception

Here’s a basic example demonstrating how to catch an exception and handle it gracefully:

Python

n = 10
try :
res = n / 0
except ZeroDivisionError :
print ( "Can't be divided by zero!" )

Output
Can't be divided by zero!

Explanation: Dividing a number by 0 raises a ZeroDivisionError . The try block contains code that may fail and except block catches the error, printing a safe message instead of stopping the program.

Difference Between Errors and Exceptions

Errors and exceptions are both issues in a program, but they differ in severity and handling. Let's see how:

- Error: Serious problems in the program logic that cannot be handled. Examples include syntax errors or memory errors.

- Exception: Less severe problems that occur at runtime and can be managed using exception handling (e.g., invalid input, missing files).

Example: This example shows the difference between a syntax error and a runtime exception.

Python

# Syntax Error (Error)
print ( "Hello world" # Missing closing parenthesis

# ZeroDivisionError (Exception)
n = 10
res = n / 0

Explanation: A syntax error stops the code from running at all, while an exception like ZeroDivisionError occurs during execution and can be caught with exception handling.

Syntax and Usage

Python provides four main keywords for handling exceptions: try, except, else and finally each plays a unique role. Let's see syntax:

try:
# Code
except SomeException:
# Code
else:
# Code
finally:
# Code

- try: Runs the risky code that might cause an error.

- except: Catches and handles the error if one occurs.

- else: Executes only if no exception occurs in try.

- finally: Runs regardless of what happens useful for cleanup tasks like closing files.

Example: This code attempts division and handles errors gracefully using try-except-else-finally.

Python

try :
n = 0
res = 100 / n

except ZeroDivisionError :
print ( "You can't divide by zero!" )

except ValueError :
print ( "Enter a valid number!" )

else :
print ( "Result is" , res )

finally :
print ( "Execution complete." )

Output
You can't divide by zero!
Execution complete.

Explanation: try block attempts division, except blocks catch specific errors, else block executes only if no errors occur, while finally block always runs, signaling end of execution.

Please refer Python Built-in Exceptions for some common exceptions.

Python Catching Exceptions

When working with exceptions in Python, we can handle errors more efficiently by specifying the types of exceptions we expect. This can make code both safer and easier to debug.

1. Catching Specific Exceptions

Catching specific exceptions makes code to respond to different exception types differently. It precisely makes your code safer and easier to debug. It avoids masking bugs by only reacting to the exact problems you expect.

Example: This code handles ValueError and ZeroDivisionError with different messages.

Python

try :
x = int ( "str" ) # This will cause ValueError
inv = 1 / x # Inverse calculation

except ValueError :
print ( "Not Valid!" )

except ZeroDivisionError :
print ( "Zero has no inverse!" )

Output
Not Valid!

Explanation: A ValueError occurs because "str" cannot be converted to an integer. If conversion had succeeded but x were 0, a ZeroDivisionError would have been caught instead.

2. Catching Multiple Exceptions

We can catch multiple exceptions in a single block if we need to handle them in the same way or we can separate them if different types of exceptions require different handling.

Example: This code attempts to convert list elements and handles ValueError, TypeError and IndexError.

Python

a = [ "10" , "twenty" , 30 ] # Mixed list of integers and strings
try :
total = int ( a [ 0 ]) + int ( a [ 1 ]) # 'twenty' cannot be converted to int

except ( ValueError , TypeError ) as e :
print ( "Error" , e )

except IndexError :
print ( "Index out of range." )

Output
Error invalid literal for int() with base 10: 'twenty'

Explanation: The ValueError is raised when trying to convert "twenty" to an integer. A TypeError could occur if incompatible types were used, while IndexError would trigger if the list index was out of range.

3. Catch-All Handlers and Their Risks

Sometimes we may use a catch-all handler to catch any exception, but it can hide useful debugging info.

Example: This code tries dividing a string by a number, which causes a TypeError.

Python

try :
res = "100" / 20 # Risky operation: dividing string by number

except ArithmeticError :
print ( "Arithmetic problem." )

except :
print ( "Something went wrong!" )

Output
Something went wrong!

Explanation: A TypeError occurs because you can’t divide a string by a number. The bare except catches it, but this can make debugging harder since the actual error type is hidden. Use bare except only as a last-resort safety net.

Raise an Exception

We raise an exception in Python using the raise keyword followed by an instance of the exception class that we want to trigger. We can choose from built-in exceptions or define our own custom exceptions by inheriting from Python's built-in Exception class.

Basic Syntax:

raise ExceptionType("Error message")

Example: This code raises a ValueError if an invalid age is given.

Python

def set ( age ):
if age < 0 :
raise ValueError ( "Age cannot be negative." )
print ( f "Age set to { age } " )

try :
set ( - 5 )
except ValueError as e :
print ( e )

Output
Age cannot be negative.

Explanation: The function checks if age is invalid. If it is, it raises a ValueError. This prevents invalid states from entering the program.

Custom Exceptions

You can also create custom exceptions by defining a new class that inherits from Python’s built-in Exception class. This is useful for application-specific errors. Let's see an example to understand how.

Example: This code defines a custom AgeError and uses it for validation.

Python

class AgeError ( Exception ):
pass

def set ( age ):
if age < 0 :
raise AgeError ( "Age cannot be negative." )
print ( f "Age set to { age } " )

try :
set ( - 5 )
except AgeError as e :
print ( e )

Output
Age cannot be negative.

Explanation: Here, AgeError is a custom exception type. This makes error messages more meaningful in larger applications.

Advantages

Below are some benefits of using exception handling:

- Improved reliability: Programs don’t crash on unexpected input.

- Separation of concerns: Error-handling code stays separate from business logic.

- Cleaner code: Fewer conditional checks scattered in code.

- Helpful debugging: Tracebacks show exactly where the problem occurred.

Disadvantages

Exception handling have some cons as well which are listed below:

- Performance overhead: Handling exceptions is slower than simple condition checks.

- Added complexity: Multiple exception types may complicate code.

- Security risks: Poorly handled exceptions might leak sensitive details.

Python

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
