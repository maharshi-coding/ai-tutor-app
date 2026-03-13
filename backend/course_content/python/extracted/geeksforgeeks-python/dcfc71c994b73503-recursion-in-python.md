# Recursion in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/recursion-in-python/
Original Path: https://www.geeksforgeeks.org/python/recursion-in-python/
Course: Python Programming

Recursion in Python

Last Updated : 12 Mar, 2026

Recursion is a programming technique where a function calls itself either directly or indirectly to solve a problem by breaking it into smaller, simpler subproblems.

In Python, recursion is especially useful for problems that can be divided into identical smaller tasks, such as mathematical calculations, tree traversals or divide-and-conquer algorithms.

Working of Recursion

A recursive function is just like any other Python function except that it calls itself in its body. Let's see basic structure of recursive function:

def recursive_function(parameters):
if base_case_condition:
return base_result
else:
return recursive_function(modified_parameters)

Recursive function contains two key parts:

- Base Case: The stopping condition that prevents infinite recursion.

- Recursive Case: The part of the function where it calls itself with modified parameters.

Examples of Recursion

Let's understand recursion better with the help of some examples.

Example 1: Factorial Calculation

This code defines a recursive function to calculate factorial of a number, where function repeatedly calls itself with smaller values until it reaches the base case.

Python

def factorial ( n ):
if n == 0 : # Base case
return 1
else : # Recursive case
return n * factorial ( n - 1 )

print ( factorial ( 5 ))

Output
120

Explanation:

- Base Case: When n == 0 , recursion stops and returns 1 .

- Recursive Case: Multiplies n with the factorial of n-1 until it reaches the base case.

Example 2: Fibonacci Sequence

This code defines a recursive function to calculate n th Fibonacci number, where each number is the sum of the two preceding ones, starting from 0 and 1.

Python

def fibonacci ( n ):
if n == 0 :
return 0
elif n == 1 :
return 1
else :
return fibonacci ( n - 1 ) + fibonacci ( n - 2 )

print ( fibonacci ( 10 ))

Output
55

Explanation:

- Base Cases: If n == 0, the function returns 0. If n == 1, the function returns 1. These two cases are necessary to stop the recursion.

- Recursive Case: function calls itself twice with decrements of n (i.e., fibonacci(n-1) and fibonacci(n-2)), summing results of these calls.

Types of Recursion in Python

Recursion can be broadly classified into two types: tail recursion and non-tail recursion. The main difference between them is related to what happens after recursive call.

- Tail Recursion: The recursive call is the last thing the function does, so nothing happens after it returns. Some languages can optimize this to work like a loop, saving memory.

- Non-Tail Recursion: The function does more work after the recursive call returns, so it can’t be optimized into a loop.

This code compares tail recursion and non-tail recursion using two versions of factorial function one with an accumulator (tail-recursive) and one with multiplication after recursive call (non-tail-recursive).

Python

def tail_fact ( n , acc = 1 ):
# Base case
if n == 0 :
return acc
# Tail recursive call with an accumulator
else :
return tail_fact ( n - 1 , acc * n )

def nontail_fact ( n ):
# Base case
if n == 1 :
return 1
# Non-tail recursive call because the multiplication happens after the call
else :
return n * nontail_fact ( n - 1 )

# Example usage
print ( tail_fact ( 5 ))
print ( nontail_fact ( 5 ))

Output
120

Explanation:

- def tail_fact(n, acc=1): - Defines a tail-recursive factorial function with an accumulator acc to store intermediate results.

- if n == 0: return acc - Base case: when n reaches 0, return the accumulated result.

- return tail_fact(n-1, acc * n) - Tail-recursive call: multiplies acc by n before the call, so no extra work is left after recursion.

- def nontail_fact(n): - Defines a non-tail-recursive factorial function.

- if n == 1: return 1 - Base case: factorial of 1 is 1.

- return n * nontail_fact(n-1) - Non-tail call: multiplication happens after the recursive call returns, so more work remains after recursion.

When to Avoid Recursion

- When the problem can be solved easily with loops.

- When recursion depth is large enough to risk a stack overflow.

- When performance is critical and function call overhead matters.

Recursion vs Iteration

Recursion and iteration are two common techniques used to repeat tasks in programming below table highlights the key differences between them:

Feature Recursion Iteration

Method A function calls itself to repeat the task Uses loops (for, while) to repeat steps

Memory Use Uses more memory due to function calls Uses less memory

Performance Usually slower because of function call overhead Generally faster as it avoids repeated function calls

Best Used For Problems like tree traversal or divide-and-conquer Repeating steps in a sequence

Risk May cause stack overflow if recursion is too deep No stack overflow risk

Python

python-basics

tail-recursion

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
