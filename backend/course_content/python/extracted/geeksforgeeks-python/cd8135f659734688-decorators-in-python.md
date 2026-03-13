# Decorators in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/decorators-in-python/
Original Path: https://www.geeksforgeeks.org/python/decorators-in-python/
Course: Python Programming

Decorators in Python

Last Updated : 6 Mar, 2026

In Python, decorators are flexible way to modify or extend behavior of functions or methods, without changing their actual code.

- A decorator is essentially a function that takes another function as an argument and returns a new function with enhanced functionality.

- Decorators are often used in scenarios such as logging, authentication and memorization, allowing us to add additional functionality to existing functions or methods in a clean, reusable way.
Python Decorators
Example: Let's see an example in which a simple Python decorator adds behavior before and after a function call.

Python

def decorator ( func ):
def wrapper ():
print ( "Before calling the function." )
func ()
print ( "After calling the function." )
return wrapper

@decorator # Applying the decorator to a function
def greet ():
print ( "Hello, World!" )
greet ()

Output
Before calling the function.
Hello, World!
After calling the function.

Explanation:

- decorator takes the greet function as an argument.

- It returns a new function (wrapper) that first prints a message, calls greet() and then prints another message.

- @decorator syntax is a shorthand for greet = decorator(greet) .

Decorator with Parameters

Decorators often need to work with functions that have arguments. We use *args and **kwargs so our wrapper can accept any number of arguments.

Example: Let's see an example of a decorator that adds functionality before and after a function call.

Python

def decorator_name ( func ):
def wrapper ( * args , ** kwargs ):
print ( "Before execution" )
result = func ( * args , ** kwargs )
print ( "After execution" )
return result
return wrapper

@decorator_name
def add ( a , b ):
return a + b

print ( add ( 5 , 3 ))

Output
Before execution
After execution
8

Explanation of Parameters

- decorator_name(func): This is the decorator function. It takes another function (func) as input.

- **wrapper(*args, kwargs) : A nested function that wraps func. *args collects positional arguments, **kwargs collects keyword arguments, so wrapper works with any function.

- @decorator_name: Syntax sugar for add = decorator_name(add) .

Functions as First-Class Objects

In Python, functions are first-class objects , meaning they can be treated like any other object (such as integers, strings or lists). This allows functions to be assigned to variables , passed as arguments , returned from other functions and stored in data structures enabling flexible programming patterns, including decorators.

Example: This code demonstrates all four properties of functions as first-class objects in Python.

Python

# Assigning a function to a variable
def greet ( n ):
return f "Hello, { n } !"
say_hi = greet # Assign the greet function to say_hi
print ( say_hi ( "Alex" ))

# Passing a function as an argument
def apply ( f , v ):
return f ( v )
res = apply ( say_hi , "Elon" )
print ( res )

# Returning a function from another function
def make_mult ( f ):
def mult ( x ):
return x * f
return mult
dbl = make_mult ( 2 )
print ( dbl ( 5 ))

Output
Hello, Alex!
Hello, Elon!
10

Explanation:

- greet() is assigned to say_hi variable, which is used to print a greeting for "Alice".

- apply() takes a function and a value as arguments, applies function to value and returns the result.

- apply is demonstrated by passing say_hi and "Bob", printing a greeting for "Bob".

- make_mult() creates a multiplier function based on a given factor.

Role of First-Class Functions in Decorators

- Decorators take a function as input to modify or enhance its behavior.

- They return a new function that wraps the original, adding behavior before or after execution.

- The original function is replaced by decorated function when assigned to same name.

Higher-Order Functions

Higher-order functions are functions that take one or more functions as arguments, return a function as a result or do both. Essentially, a higher-order function is a function that operates on other functions. This is a powerful concept in functional programming and is a key component in understanding how decorators work.

Key Properties of Higher-Order Functions

- Taking functions as arguments : A higher-order function can accept other functions as parameters.

- Returning functions : A higher-order function can return a new function that can be called later.

Example: This code shows a higher-order function that takes another function as an argument and applies it to a given value.

Python

# A higher-order function that takes another function as an argument
def fun ( f , x ):
return f ( x )

# A simple function to pass
def square ( x ):
return x * x
res = fun ( square , 5 ) # Using apply_function to apply the square function
print ( res )

Output
25

Explanation: fun is a higher-order function because it takes another function f as an argument and applies it to the value x .

Role of Higher-Order Functions in Decorators

Decorators are higher-order functions that take a function, modify it and return a new one with extended or altered behavior.

Types of Decorators

1. Function Decorators

The most common decorators in Python, used to wrap and enhance functions by adding extra behavior before or after the original function runs.

Example: In this Example, a decorator prints a message before and after executing wrapped function.

Python

def simple_decorator ( func ):
def wrapper ():
print ( ">>> Starting function" )
func ()
print ( ">>> Function finished" )
return wrapper

@simple_decorator
def greet ():
print ( "Hello, World!" )
greet ()

Output
>>> Starting function
Hello, World!
>>> Function finished

Explanation:

- simple_decorator(func): This decorator takes the function greet as an argument (func) and returns a new function (wrapper) that adds some functionality before and after calling original function.

- @simple_decorator: This is the decorator syntax. It applies simple_decorator to greet function.

- Calling greet(): When greet() is called, it doesn't just execute original function but first runs added behavior from wrapper function.

2. Method Decorators

Special decorators used for methods inside a class. They work like function decorators but handle the self parameter for instance methods.

Example: Here, a decorator prints a message before and after a method is executed, while correctly handling self argument.

Python

def method_decorator ( func ):
def wrapper ( self , * args , ** kwargs ):
print ( "Before method execution" )
res = func ( self , * args , ** kwargs )
print ( "After method execution" )
return res
return wrapper

class MyClass :
@method_decorator
def say_hello ( self ):
print ( "Hello!" )
obj = MyClass ()
obj . say_hello ()

Output
Before method execution
Hello!
After method execution

Explanation:

- method_decorator(func): The decorator takes method (say_hello) as an argument (func). It returns a wrapper function that adds behavior before and after calling original method.

- wrapper(self, *args, **kwargs): wrapper must accept self because it is a method of an instance. self is instance of class and *args and **kwargs allow for other arguments to be passed if needed.

- @method_decorator: This applies method_decorator to say_hello method of MyClass.

- Calling obj.say_hello(): say_hello method is now wrapped with additional behavior.

3. Class Decorators

Class decorators are used to modify or enhance behavior of a class. Like function decorators, class decorators are applied to class definition. They work by taking class as an argument and returning a modified version of class.

Example: This code demonstrates a class decorator that adds a class_name attribute to a class, storing class’s name.

Python

def fun ( cls ):
cls . class_name = cls . __name__
return cls

@fun
class Person :
pass
print ( Person . class_name )

Output
Person

Explanation:

- fun(cls): This decorator adds a new attribute, class_name, to class cls. The value of class_name is set to the name of class (cls.__name__).

- @add_class_name: This applies the add_class_name decorator to the Person class.

Built-in Decorators

Python provides several built-in decorators that are used in class definitions. These decorators modify behavior of methods and attributes in a class, making it easier to manage and use them effectively. The most frequently used built-in decorators are @staticmethod , @classmethod and @property .

@staticmethod

It is used to define a method that doesn't operate on an instance of class (i.e., it doesn't use self). Static methods are called on class itself, not on an instance of class.

Example: This example shows how to define and use a @staticmethod inside a class.

Python

class MathOperations :
@staticmethod
def add ( x , y ):
return x + y

# Using the static method
res = MathOperations . add ( 5 , 3 )
print ( res )

Output
8

Explanation:

- add is a static method defined with @staticmethod decorator.

- It can be called directly on class MathOperations without creating an instance.

@classmethod

It is used to define a method that operates on class itself (i.e., it uses cls). Class methods can access and modify class state that applies across all instances of class.

Example: This code defines a class Employee with a class variable raise_amount and a class method set_raise_amount that updates this variable for entire class.

Python

class Employee :
raise_amount = 1.05
def __init__ ( self , name , salary ):
self . name = name
self . salary = salary

@classmethod
def set_raise_amount ( cls , amount ):
cls . raise_amount = amount

# Using the class method
Employee . set_raise_amount ( 1.10 )
print ( Employee . raise_amount )

Output
1.1

Explanation:

- set_raise_amount is a class method defined with @classmethod decorator.

- It can modify class variable raise_amount for class Employee and all its instances.

@property

It is used to define a method as a property, which allows you to access it like an attribute. This is useful for encapsulating implementation of a method while still providing a simple interface.

Example: This code defines a circle class demonstrating @property for controlled attribute access, allowing safe updates to radius.

Python

class Circle :
def __init__ ( self , radius ):
self . _radius = radius

@property
def radius ( self ):
return self . _radius

@radius . setter
def radius ( self , value ):
if value >= 0 :
self . _radius = value
else :
raise ValueError ( "Radius cannot be negative" )

@property
def area ( self ):
return 3.14159 * ( self . _radius ** 2 )

# Using the property
c = Circle ( 5 )
print ( c . radius )
print ( c . area )
c . radius = 10
print ( c . area )

Output
5
78.53975
314.159

Explanation:

- radius and area are properties defined with @property decorator.

- radius property also has a setter method to allow modification with validation.

- These properties provide a way to access and modify private attributes while maintaining encapsulation.

Chaining Multiple Decorators

Chaining decorators means applying multiple decorators to same function. Each decorator wraps function in sequence, adding layered behavior.

Example:  This example shows how chaining decorators works by applying two decorators in different orders to see how output changes.

Python

def decor1 ( func ):
def inner ():
x = func ()
return x * x
return inner

def decor ( func ):
def inner ():
x = func ()
return 2 * x
return inner

@decor1
@decor
def num ():
return 10

@decor
@decor1
def num2 ():
return 10

print ( num ())
print ( num2 ())

Output
400
200

Explanation:

- In num() , decor runs first -> 10 becomes 20, then decor1 squares it -> 400.

- In num2() , decor1 runs first -> 10 becomes 100, then decor doubles it -> 200.

Real-World Uses of Decorators

- Logging: Track function calls (e.g., @logger).

- Authentication: Restrict access in web apps (e.g., Flask/Django).

- Rate Limiting: Control API usage per user.

- Caching: Store results using functools.lru_cache.

- Retry Logic: Automatically retry failed network calls.

Related Articles:

- Closures

- Inner Function

Technical Scripter

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
