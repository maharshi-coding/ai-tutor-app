# Python Exception Handling

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/exception-handling
Original Path: https://www.programiz.com/python-programming/exception-handling
Course: Python Programming

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

Python Custom Exceptions

Python Exceptions

List of Keywords in Python

Python match…case Statement

Python if...else Statement

Python String index()

Python Exception Handling

In the last tutorial, we learned about Python exceptions . We know that exceptions abnormally terminate the execution of a program.

Since exceptions abnormally terminate the execution of a program, it is important to handle exceptions. In Python, we use the
try...except
block to handle exceptions.

Python try...except Block

The
try...except
block is used to handle exceptions in Python. Here's the syntax of
try...except
block:

try:
# code that may cause exception
except:
# code to run when exception occurs

Here, we have placed the code that might generate an exception inside the
try
block. Every
try
block is followed by an
except
block.

When an exception occurs, it is caught by the
except
block. The
except
block cannot be used without the try block.

Example: Exception Handling Using try...except

try:
numerator = 10
denominator = 0

result = numerator/denominator

print(result)
except:
print("Error: Denominator cannot be 0.")

# Output: Error: Denominator cannot be 0.

In the example, we are trying to divide a number by 0 . Here, this code generates an exception.

To handle the exception, we have put the code,
result = numerator/denominator
inside the
try
block. Now when an exception occurs, the rest of the code inside the
try
block is skipped.

The
except
block catches the exception and statements inside the
except
block are executed.

If none of the statements in the
try
block generates an exception, the
except
block is skipped.

Catching Specific Exceptions in Python

For each
try
block, there can be zero or more
except
blocks. Multiple
except
blocks allow us to handle each exception differently.

The argument type of each
except
block indicates the type of exception that can be handled by it. For example,

try:

even_numbers = [2,4,6,8]
print(even_numbers[5])

except ZeroDivisionError:
print("Denominator cannot be 0.")

except IndexError:
print("Index Out of Bound.")

# Output: Index Out of Bound

In this example, we have created a list named even_numbers .

Since the list index starts from 0 , the last element of the list is at index 3 . Notice the statement,

print(even_numbers[5])

Here, we are trying to access a value to the index 5 . Hence,
IndexError
exception occurs.

When the
IndexError
exception occurs in the
try
block,

- The
ZeroDivisionError
exception is skipped.

- The set of code inside the
IndexError
exception is executed.

Python try with else clause

In some situations, we might want to run a certain block of code if the code block inside
try
runs without any errors.

For these cases, you can use the optional
else
keyword with the
try
statement.

Let's look at an example:

# program to print the reciprocal of even numbers

try:
num = int(input("Enter a number: "))
assert num % 2 == 0
except:
print("Not an even number!")
else:
reciprocal = 1/num
print(reciprocal)

Output

If we pass an odd number:

Enter a number: 1
Not an even number!

If we pass an even number, the reciprocal is computed and displayed.

Enter a number: 4
0.25

However, if we pass 0 , we get
ZeroDivisionError
as the code block inside
else
is not handled by preceding
except
.

Enter a number: 0
Traceback (most recent call last):
File "<string>", line 7, in <module>
reciprocal = 1/num
ZeroDivisionError: division by zero

Here, the assert statement in the code checks that
num
is an even number; if num is odd, it raises an
AssertionError
, triggering the except block.

Note : Exceptions in the
else
clause are not handled by the preceding except clauses.

Python try...finally

In Python, the
finally
block is always executed no matter whether there is an exception or not.

The
finally
block is optional. And, for each
try
block, there can be only one
finally
block.

Let's see an example,

try:
numerator = 10
denominator = 0

result = numerator/denominator

print(result)
except:
print("Error: Denominator cannot be 0.")

finally:
print("This is finally block.")

Output

Error: Denominator cannot be 0.
This is finally block.

In the above example, we are dividing a number by 0 inside the
try
block. Here, this code generates an exception.

The exception is caught by the
except
block. And, then the
finally
block is executed.

Also Read:

- Python built-in Exception

- Python user-defined Exception

- Introduction

- Python try...except Block

- Catching Specific Exceptions in Python

- Python try with else clause

- Python try...finally

Video: Python Exception Handling (try..except..finally)

Previous Tutorial:

Python Exceptions

Next Tutorial:

Python Custom Exceptions

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

Python Custom Exceptions

Python Tutorial

Python Exceptions

Python Tutorial

List of Keywords in Python

Python Tutorial

Python match…case Statement
