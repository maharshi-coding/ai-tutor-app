# Global and Local Variables in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/global-local-variables-python/
Original Path: https://www.geeksforgeeks.org/python/global-local-variables-python/
Course: Python Programming

Global and Local Variables in Python

Last Updated : 20 Sep, 2025

In Python, variables play a key role in storing and managing data. Their behavior and accessibility depend on where they are defined in the program. In this article, we’ll explore global and local variables, how they work and common scenarios with examples.

Local Variables

Local variables are created inside a function and exist only during its execution. They cannot be accessed from outside the function.

Example 1: In this code, we are creating and accessing a local variable inside a function.

Python

def greet ():
msg = "Hello from inside the function!"
print ( msg )

greet ()

Output
Hello from inside the function!

Explanation: We define greet() with a local variable msg and print it. Since msg exists only during the function's execution, it's accessed within the function. Calling greet() displays the message.

Example 2 : In this example, we are creating a local variable inside a function and then trying to access it outside the function, which causes an error.

Python

def greet ():
msg = "Hello!"
print ( "Inside function:" , msg )

greet ()
print ( "Outside function:" , msg )

Output

Traceback (most recent call last):
File "/home/guest/sandbox/Solution.py", line 6, in <module>
print("Outside function:", msg)
NameError: name 'msg' is not defined

Explanation: msg is a local variable inside greet() and can only be accessed there. Printing it outside causes an error because it doesn't exist globally.

Global Variables

Global variables are declared outside all functions and can be accessed anywhere in the program, including inside functions.

In this example, we are creating a global variable and then accessing it both inside and outside a function.

Python

msg = "Python is awesome!"

def display ():
print ( "Inside function:" , msg )

display ()
print ( "Outside function:" , msg )

Output
Inside function: Python is awesome!
Outside function: Python is awesome!

Explanation: msg is a global variable accessible both inside and outside the display() function. Calling display() prints the global msg and printing msg outside the function works as expected.

Note: If a variable is not found inside a function (local scope), Python automatically looks for it in global scope. However, if a local variable has same name as a global one, it will shadow global variable inside that function.

Use of Local and Global variables

If a variable is defined both globally and locally with the same name, the local variable shadows the global variable inside the function. Changes to the local variable do not affect the global variable unless you explicitly declare the variable as global.

Python

def fun ():
s = "Me too."
print ( s )

s = "I love Geeksforgeeks"
fun ()
print ( s )

Output
Me too.
I love Geeksforgeeks

Explanation: Inside fun() , s is a local variable set to "Me too." and prints that value. Outside, the global s remains "I love Geeksforgeeks", so printing s afterward shows the global value.

Modifying Global Variables Inside a Function

By default, one cannot modify a global variable inside a function without declaring it as global. If you try, Python will raise an error because it treats variable as local. To modify a global variable use the global keyword .

Without global (causes error)

Python

def fun ():
s += ' GFG' # Error: Python thinks s is local
print ( s )

s = "I love GeeksforGeeks"
fun ()

Output

UnboundLocalError: local variable 's' referenced before assignment

Explanation: Inside fun(), Python assumes s is local since we try to modify it. But no local s exists before that line, so an error occurs.

With global (works correctly)

Python

s = "Python is great!"

def fun ():
global s
s += " GFG" # Modify global variable
print ( s )
s = "Look for GeeksforGeeks Python Section" # Reassign global
print ( s )

fun ()
print ( s )

Output
Python is great! GFG
Look for GeeksforGeeks Python Section

Explanation:

- Declaring s as global tells Python to use the variable from the global scope.

- The function first appends " GFG", then reassigns s.

- Changes persist outside the function.

Global vs Local with Same Name

Python

a = 1 # Global variable

def f ():
print ( "f():" , a ) # Uses global a

def g ():
a = 2 # Local shadows global
print ( "g():" , a )

def h ():
global a
a = 3 # Modifies global a
print ( "h():" , a )

print ( "global:" , a )
f ()
print ( "global:" , a )
g ()
print ( "global:" , a )
h ()
print ( "global:" , a )

Output
global: 1
f(): 1
global: 1
g(): 2
global: 1
h(): 3
global: 3

Explanation:

- f() prints global a without changing it.

- g() creates a local a, leaving global one untouched.

- h() declares a as global and modifies it.

Local Variable vs Global Variable

Comparison basis Global Variable Local Variable

Definition Declared outside the functions Declared inside a functions

Lifetime Created when the program starts and destroyed when it ends Created when the function is called and destroyed when it returns

Data Sharing Shared across all functions Not shared; exists only within its function

Scope Can be accessed anywhere in the program Accessible only inside the function

Parameters needed No parameter passing needed May be created through parameters or assignments inside the function

Storage Managed in the global namespace (not fixed memory location) Stored in the function’s local namespace (stack frame)

Value Changes affect the entire program Changes are local and don’t affect other functions

Misc

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
