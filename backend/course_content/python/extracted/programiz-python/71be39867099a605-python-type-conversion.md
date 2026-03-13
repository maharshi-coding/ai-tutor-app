# Python Type Conversion

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/type-conversion-and-casting
Original Path: https://www.programiz.com/python-programming/type-conversion-and-casting
Course: Python Programming

- Python Type Conversion

- Python Basic Input and Output

- Python Operators

Python Flow Control

- Python if...else Statement

- Python for Loop

- Python while Loop

- Python break and continue

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

Python Numbers, Type Conversion and Mathematics

Python float()

Python type()

Python Data Types

Python input()

Python complex()

Python Type Conversion

In programming, type conversion is the process of converting data of one type to another. For example: converting
int
data to
str
.

There are two types of type conversion in Python.

- Implicit Conversion - automatic type conversion

- Explicit Conversion - manual type conversion

Python Implicit Type Conversion

In certain situations, Python automatically converts one data type to another. This is known as implicit type conversion.

Example 1: Converting integer to float

Let's see an example where Python promotes the conversion of the lower data type (integer) to the higher data type (float) to avoid data loss.

integer_number = 123
float_number = 1.23

new_number = integer_number + float_number

# display new value and resulting data type
print("Value:",new_number)
print("Data Type:",type(new_number))

Output

Value: 124.23
Data Type: <class 'float'>

In the above example, we have created two variables: integer_number and float_number of
int
and
float
type respectively.

Then we added these two variables and stored the result in new_number .

As we can see new_number has value 124.23 and is of the
float
data type.

It is because Python always converts smaller data types to larger data types to avoid the loss of data.

Note:

- We get
TypeError
, if we try to add
str
and
int
. For example,
'12' + 23
. Python is not able to use Implicit Conversion in such conditions.

- Python has a solution for these types of situations which is known as Explicit Conversion.

Explicit Type Conversion

In Explicit Type Conversion, users convert the data type of an object to required data type.

We use the built-in functions like int() , float() , str() , etc to perform explicit type conversion.

This type of conversion is also called typecasting because the user casts (changes) the data type of the objects.

Example 2: Addition of string and integer Using Explicit Conversion

num_string = '12'
num_integer = 23

print("Data type of num_string before Type Casting:",type(num_string))

# explicit type conversion
num_string = int(num_string)

print("Data type of num_string after Type Casting:",type(num_string))

num_sum = num_integer + num_string

print("Sum:",num_sum)
print("Data type of num_sum:",type(num_sum))

Output

Data type of num_string before Type Casting: <class 'str'>
Data type of num_string after Type Casting: <class 'int'>
Sum: 35
Data type of num_sum: <class 'int'>

In the above example, we have created two variables: num_string and num_integer with
str
and
int
type values respectively. Notice the code,

num_string = int(num_string)

Here, we have used
int()
to perform explicit type conversion of num_string to integer type.

After converting num_string to an integer value, Python is able to add these two variables.

Finally, we got the num_sum value i.e 35 and data type to be
int
.

Key Points to Remember

- Type Conversion is the conversion of an object from one data type to another data type.

- Implicit Type Conversion is automatically performed by the Python interpreter.

- Python avoids the loss of data in Implicit Type Conversion.

- Explicit Type Conversion is also called Type Casting, the data types of objects are converted using predefined functions by the user.

- In Type Casting, loss of data may occur as we enforce the object to a specific data type.

Also Read:

- Python Numbers, Type Conversion and Mathematics

- Introduction

- Python Implicit Type Conversion

- Example 1: Converting integer to float

- Explicit Type Conversion

- Example 2: Addition of string and integer Using Explicit Conversion

- Key Points to Remember

Previous Tutorial:

Python Variables and Literals

Next Tutorial:

Python Basic Input and Output

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

Python Numbers, Type Conversion and Mathematics

Python Library

Python float()

Python Library

Python input()

Python Library

Python complex()
