# Python OOP Concepts

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/python-oops-concepts/
Original Path: https://www.geeksforgeeks.org/python/python-oops-concepts/
Course: Python Programming

Python OOP Concepts

Last Updated : 14 Feb, 2026

Object Oriented Programming empowers developers to build modular, maintainable and scalable applications. OOP is a way of organizing code that uses objects and classes to represent real-world entities and their behavior. In OOP, object has attributes thing that has specific data and can perform certain actions using methods.

- Organizes code into classes and objects.

- Supports encapsulation to group data and methods together.

- Enables inheritance for reusability and hierarchy.

- Allows polymorphism for flexible method implementation.

- Improves modularity, scalability and maintainability.
Python OOPs Concepts
Class

A class is a collection of objects. Classes are blueprints for creating objects. A class defines a set of attributes and methods that the created objects (instances) can have. Some points on Python class:

- Classes are created by keyword class.

- Attributes are the variables that belong to a class.

- Attributes are always public and can be accessed using the dot (.) operator. Example: Myclass.Myattribute

Creating a Class

Here, class keyword indicates that we are creating a class followed by name of the class (Dog in this case).

Python

class Dog :
species = "Canine" # Class attribute

def __init__ ( self , name , age ):
self . name = name # Instance attribute
self . age = age # Instance attribute

Explanation:

- class Dog: creates a class named Dog, which acts as a blueprint for dog objects.

- species is a class attribute, meaning it is shared by all instances of the class.

- __init__() is a constructor method that runs automatically when a new object is created. It is used to initialize object data.

- self refers to the current object, allowing each object to store and access its own data.

- self.name and self.age are instance attributes, unique to each Dog object created from the class.

Objects

An Object is an instance of a Class. It represents a specific implementation of the class and holds its own data. An object consists of:

- State: It is represented by the attributes and reflects the properties of an object.

- Behavior: It is represented by the methods of an object and reflects the response of an object to other objects.

- Identity: It gives a unique name to an object and enables one object to interact with other objects.

Creating Object

Creating an object in Python involves instantiating a class to create a new instance of that class. This process is also referred to as object instantiation.

Python

class Dog :
species = "Canine" # Class attribute

def __init__ ( self , name , age ):
self . name = name # Instance attribute
self . age = age # Instance attribute

# Creating an object of the Dog class
dog1 = Dog ( "Buddy" , 3 )

print ( dog1 . name )
print ( dog1 . species )

Output
Buddy
Canine

Explanation:

- dog1 = Dog("Buddy", 3): Creates an object of the Dog class with name as "Buddy" and age as 3.

- dog1.name: Accesses the instance attribute name of the dog1 object.

- dog1.species: Accesses the class attribute species of the dog1 object.

Four Pillars of OOP in Python

The Four Pillars of Object-Oriented Programming (OOP) form the foundation for designing structured, reusable, and maintainable software.

1. Inheritance

Inheritance allows a class (child class) to acquire properties and methods of another class (parent class). It supports hierarchical classification and promotes code reuse.
Inheritance in Python
2. Polymorphism

Polymorphism in Python means "same operation, different behavior." It allows functions or methods with the same name to work differently depending on the type of object they are acting upon.

The flowchart below represents the different types of polymorphism in Python, showing how a single interface can exhibit multiple behaviors at compile-time and run-time.
Types of Polymorphism
3. Encapsulation

Encapsulation is the bundling of data (attributes) and methods (functions) within a class, restricting access to some components to control interactions. A class is an example of encapsulation as it encapsulates all the data that is member functions, variables, etc.
Encapsulation in Python
4. Data Abstraction

Abstraction hides the internal implementation details while exposing only the necessary functionality. It helps focus on "what to do" rather than "how to do it."

Related Links:

- Python OOP Quiz

- Constructors

- Static Method

- Operator Overloading

Recommended Problems:

- Design a class

Python

python-oop-concepts

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
