# Python pass Statement

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/pass-statement
Original Path: https://www.programiz.com/python-programming/pass-statement
Course: Python Programming

- Python pass Statement

Python Data types

- Python Numbers and Mathematics

- Python List

- Python Tuple

- Python String

- Python Set

- Python Dictionary

Python Functions

- Python Functions

- Python Function Arguments

- Python Variable Scope

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

Python if...else Statement

Python break and continue

Python Assert Statement

Python Exception Handling

Python *args and **kwargs

Python Functions

Python pass Statement

In Python programming, the
pass
statement is a null statement which can be used as a placeholder for future code.

Suppose we have a loop or a function that is not implemented yet, but we want to implement it in the future. In such cases, we can use the
pass
statement.

The syntax of the
pass
statement is:

pass

Using pass With Conditional Statement

n = 10

# use pass inside if statement
if n > 10:
pass

print('Hello')

Here, notice that we have used the
pass
statement inside the if statement .

However, nothing happens when the pass is executed. It results in no operation (NOP).

Suppose we didn't use pass or just put a comment as:

n = 10

if n > 10:
# write code later

print('Hello')

Here, we will get an error message:
IndentationError: expected an indented block

Note : The difference between a comment and a
pass
statement in Python is that while the interpreter ignores a comment entirely,
pass
is not ignored.

Use of pass Statement inside Function or Class

We can do the same thing in an empty function or class as well. For example,

def function(args):
pass

class Example:
pass

Also Read:

- Python break and continue

- Introduction

- Using pass With Conditional Statement

- Use of pass Statement inside Function or Class

Video: Python pass Statement

Previous Tutorial:

Python break and continue

Next Tutorial:

Python Numbers, Type Conversion and Mathematics

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

Python break and continue

Python Tutorial

Python if...else Statement

Python Tutorial

Python Assert Statement

Python Tutorial

Python Exception Handling
