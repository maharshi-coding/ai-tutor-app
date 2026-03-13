# Inheritance in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/inheritance-in-python/
Original Path: https://www.geeksforgeeks.org/python/inheritance-in-python/
Course: Python Programming

Inheritance in Python

Last Updated : 9 Oct, 2025

Inheritance is a fundamental concept in object-oriented programming (OOP) that allows a class (called a child or derived class) to inherit attributes and methods from another class (called a parent or base class). In this article, we'll explore inheritance in Python.

Example: Here, we create a parent class Animal that has a method info(). Then we create a child classes Dog that inherit from Animal and add their own behavior.

Python

class Animal :
def __init__ ( self , name ):
self . name = name

def info ( self ):
print ( "Animal name:" , self . name )

class Dog ( Animal ):
def sound ( self ):
print ( self . name , "barks" )

d = Dog ( "Buddy" )
d . info () # Inherited method
d . sound ()

Output
Animal name: Buddy
Buddy barks

Explanation:

- class Animal: Defines the parent class.

- info(): Prints the name of the animal.

- class Dog(Animal): Defines Dog as a child of Animal class.

- d.info(): Calls parent method info() and d.sound(): Calls child method.
Inheritance in Python
Why do we need Inheritance

- Promotes code reusability by sharing attributes and methods across classes.

- Models real-world hierarchies like Animal -> Dog or Person -> Employee.

- Simplifies maintenance through centralized updates in parent classes.

- Enables method overriding for customized subclass behavior.

- Supports scalable, extensible design using polymorphism.

super() Function

super() function is used to call the parent class’s methods. In particular, it is commonly used in the child class’s __init__() method to initialize inherited attributes. This way, the child class can leverage the functionality of the parent class.

Example: Here, Dog uses super() to call Animal’s constructor

Python

# Parent Class: Animal
class Animal :
def __init__ ( self , name ):
self . name = name

def info ( self ):
print ( "Animal name:" , self . name )

# Child Class: Dog
class Dog ( Animal ):
def __init__ ( self , name , breed ):
super () . __init__ ( name ) # Call parent constructor
self . breed = breed

def details ( self ):
print ( self . name , "is a" , self . breed )

d = Dog ( "Buddy" , "Golden Retriever" )
d . info () # Parent method
d . details () # Child method

Output
Animal name: Buddy
Buddy is a Golden Retriever

Explanation:

- The super() function is used inside __init__() method of Dog to call the constructor of Animal and initialize inherited attribute (name).

- This ensures that parent class functionality is reused without needing to rewrite the code in the child class.

Types of Python Inheritance

Inheritance be used in different ways depending on how many parent and child classes are involved. They help model real-world relationships more effectively and allow flexibility in code reuse.

Python supports several types of inheritance, let's explore it one by one:

1. Single Inheritance

In single inheritance, a child class inherits from just one parent class.

Example: This example shows a child class Employee inheriting a property from the parent class Person.

Python

class Person :
def __init__ ( self , name ):
self . name = name

class Employee ( Person ): # Employee inherits from Person
def show_role ( self ):
print ( self . name , "is an employee" )

emp = Employee ( "Sarah" )
print ( "Name:" , emp . name )
emp . show_role ()

Output
Name: Sarah
Sarah is an employee

Explanation: Here Employee inherits name from Person, it also defines its own method show_role().

2. Multiple Inheritance

In multiple inheritance, a child class can inherit from more than one parent class.

Example: This example demonstrates Employee inheriting properties from two parent classes: Person and Job.

Python

class Person :
def __init__ ( self , name ):
self . name = name

class Job :
def __init__ ( self , salary ):
self . salary = salary

class Employee ( Person , Job ): # Inherits from both Person and Job
def __init__ ( self , name , salary ):
Person . __init__ ( self , name )
Job . __init__ ( self , salary )

def details ( self ):
print ( self . name , "earns" , self . salary )

emp = Employee ( "Jennifer" , 50000 )
emp . details ()

Output
Jennifer earns 50000

Explanation: Here Employee gets attributes from both Person and Job and It can access both name and salary.

3. Multilevel Inheritance

In multilevel inheritance, a class is derived from another derived class (like a chain).

Example: This example shows Manager inheriting from Employee, which in turn inherits from Person.

Python

class Person :
def __init__ ( self , name ):
self . name = name

class Employee ( Person ):
def show_role ( self ):
print ( self . name , "is an employee" )

class Manager ( Employee ): # Manager inherits from Employee
def department ( self , dept ):
print ( self . name , "manages" , dept , "department" )

mgr = Manager ( "Joy" )
mgr . show_role ()
mgr . department ( "HR" )

Output
Joy is an employee
Joy manages HR department

Explanation: Here Manager inherits from Employee and Employee inherits from Person. So Manager can use methods from both parent and grandparent.

4. Hierarchical Inheritance

In hierarchical inheritance, multiple child classes inherit from the same parent class.

Example: This example demonstrates two child classes (Employee and Intern) inheriting from a single parent class Person.

Python

class Person :
def __init__ ( self , name ):
self . name = name

class Employee ( Person ):
def role ( self ):
print ( self . name , "works as an employee" )

class Intern ( Person ):
def role ( self ):
print ( self . name , "is an intern" )

emp = Employee ( "David" )
emp . role ()

intern = Intern ( "Eva" )
intern . role ()

Output
David works as an employee
Eva is an intern

Explanation: Both Employee and Intern inherit from Person. They share the parent’s property (name) but implement their own methods.

5. Hybrid Inheritance

Hybrid inheritance is a combination of more than one type of inheritance.

Example: This example demonstrates TeamLead inheriting from both Employee (which inherits Person) and Project, combining multiple inheritance types.

Python

class Person :
def __init__ ( self , name ):
self . name = name

class Employee ( Person ):
def role ( self ):
print ( self . name , "is an employee" )

class Project :
def __init__ ( self , project_name ):
self . project_name = project_name

class TeamLead ( Employee , Project ): # Hybrid Inheritance
def __init__ ( self , name , project_name ):
Employee . __init__ ( self , name )
Project . __init__ ( self , project_name )

def details ( self ):
print ( self . name , "leads project:" , self . project_name )

lead = TeamLead ( "Sophia" , "AI Development" )
lead . role ()
lead . details ()

Output
Sophia is an employee
Sophia leads project: AI Development

Explanation: Here TeamLead inherits from Employee (which already inherits Person) and also from Project. This combines single, multilevel and multiple inheritance -> hybrid.

For more details, read this article: Types of inheritance in Python

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
