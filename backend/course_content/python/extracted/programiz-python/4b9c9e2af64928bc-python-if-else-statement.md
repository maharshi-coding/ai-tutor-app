# Python if...else Statement

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/if-elif-else
Original Path: https://www.programiz.com/python-programming/if-elif-else
Course: Python Programming

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

Python match…case Statement

Python pass Statement

Python Assert Statement

Python while Loop

Python for Loop

Python break and continue

Python if...else Statement

In computer programming, the
if
statement is a conditional statement. It is used to execute a block of code only when a specific condition is met. For example,

Suppose we need to assign different grades to students based on their scores.

- If a student scores above 90 , assign grade A

- If a student scores above 75 , assign grade B

- If a student scores above 65 , assign grade C

These conditional tasks can be achieved using the
if
statement.

Python if Statement

An
if
statement executes a block of code only when the specified condition is met.

Syntax

if condition:
# body of if statement

Here, condition is a boolean expression, such as
number > 5
, that evaluates to either
True
or
False
.

- If
condition
evaluates to
True
, the body of the
if
statement is executed.

- If
condition
evaluates to
False
, the body of the
if
statement will be skipped from execution.

Let's look at an example.

Working of if Statement

Example: Python if Statement

number = int(input('Enter a number: '))

# check if number is greater than 0
if number > 0:
print(f'{number} is a positive number.')

print('A statement outside the if statement.')

Sample Output 1

Enter a number: 10
10 is a positive number.
A statement outside the if statement.

If user enters 10 , the condition
number > 0
evaluates to
True
. Therefore, the body of
if
is executed.

Sample Output 2

Enter a number: -2
A statement outside the if statement.

If user enters -2 , the condition
number > 0
evaluates to
False
. Therefore, the body of
if
is skipped from execution.

Indentation in Python

Python uses indentation to define a block of code, such as the body of an
if
statement. For example,

x = 1
total = 0

# start of the if statement
if x != 0:
total += x
print(total)
# end of the if statement

print("This is always executed.")

Here, the body of
if
has two statements. We know this because two statements (immediately after
if
) start with indentation.

We usually use four spaces for indentation in Python, although any number of spaces works as long as we are consistent.

You will get an error if you write the above code like this:

# Error code
x = 1
total = 0

if x != 0:
total += x
print(total)

Here, we haven't used indentation after the
if
statement. In this case, Python thinks our
if
statement is empty, which results in an error.

Python if...else Statement

An
if
statement can have an optional
else
clause. The
else
statement executes if the condition in the
if
statement evaluates to
False
.

Syntax

if condition:
# body of if statement
else:
# body of else statement

Here, if the
condition
inside the
if
statement evaluates to

- True - the body of
if
executes, and the body of
else
is skipped.

- False - the body of
else
executes, and the body of
if
is skipped

Let's look at an example.

Working of if…else Statement

Example: Python if…else Statement

number = int(input('Enter a number: '))

if number > 0:
print('Positive number')
else:
print('Not a positive number')

print('This statement always executes')

Sample Output 1

Enter a number: 10
Positive number
This statement always executes

If user enters 10 , the condition
number > 0
evalutes to
True
. Therefore, the body of
if
is executed and the body of
else
is skipped.

Sample Output 2

Enter a number: 0
Not a positive number
This statement always executes

If user enters 0 , the condition
number > 0
evalutes to
False
. Therefore, the body of
if
is skipped and the body of
else
is executed.

Python if…elif…else Statement

The
if...else
statement is used to execute a block of code among two alternatives.

However, if we need to make a choice between more than two alternatives, we use the
if...elif...else
statement.

Syntax

if condition1:
# code block 1

elif condition2:
# code block 2

else:
# code block 3

Let's look at an example.

Working of if…elif…else Statement

Example: Python if…elif…else Statement

number = -5

if number > 0:
print('Positive number')

elif number < 0:
print('Negative number')

else:
print('Zero')

print('This statement is always executed')

Output

Negative number
This statement is always executed

Here, the first condition,
number > 0
, evaluates to
False
. In this scenario, the second condition is checked.

The second condition,
number < 0
, evaluates to
True
. Therefore, the statements inside the
elif
block is executed.

In the above program, it is important to note that regardless the value of
number
variable, only one block of code will be executed.

Python Nested if Statements

It is possible to include an
if
statement inside another
if
statement. For example,

number = 5

# outer if statement
if number >= 0:
# inner if statement
if number == 0:
print('Number is 0')

# inner else statement
else:
print('Number is positive')

# outer else statement
else:
print('Number is negative')

Output

Number is positive

Here's how this program works.

Working of Nested if Statement

More on Python if…else Statement

Compact
if
Statement

In certain situations, the
if
statement can be simplified into a single line. For example,

number = 10

if number > 0:
print('Positive')

This code can be compactly written as

number = 10

if number > 0: print('Positive')

This one-liner approach retains the same functionality but in a more concise format.

Ternary Operator in Python
if...else

Python doesn't have a ternary operator. However, we can use
if...else
to work like a ternary operator in other languages. For example,

grade = 40

if grade >= 50:
result = 'pass'
else:
result = 'fail'

print(result)

can be written as

grade = 40

result = 'pass' if number >= 50 else 'fail'

print(result)

Logical Operators to Add Multiple Conditions

If needed, we can use logical operators such as
and
or
to create complex conditions to work with an
if
statement.

age = 35
salary = 6000

# add two conditions using and operator
if age >= 30 and salary >= 5000:

print('Eligible for the premium membership.')
else:
print('Not eligible for the premium membership')

Output

Eligible for the premium membership.

Here, we used the logical operator
and
to add two conditions in the
if
statement.

We also used
>=
(comparison operator) to compare two values.

Logical and comparison operators are often used with
if...else
statements. Visit Python Operators to learn more.

Also Read

- Python pass Statement

- Python break and continue

- Introduction

- Python if Statement

- Example: Python if Statement

- Python if...else Statement

- Example: Python if…else Statement

- Python if…elif…else Statement

- Example: Python if…elif…else Statement

- Python Nested if Statements

Before we wrap up, let’s put your knowledge of Python if else to the test! Can you solve the following challenge?

Challenge:

Write a function to check whether a student passed or failed his/her examination.

- Assume the pass marks to be 50 .

- Return
Passed
if the student scored more than 50. Otherwise, return
Failed
.

Check Code

Video: Python if...else Statement

Previous Tutorial:

Python Operators

Next Tutorial:

Python for Loop

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

Python match…case Statement

Python Tutorial

Python pass Statement

Python Tutorial

Python while Loop

Python Tutorial

Python Assert Statement
