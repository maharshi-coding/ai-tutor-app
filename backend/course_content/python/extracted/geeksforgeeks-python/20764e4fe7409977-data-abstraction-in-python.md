# Data Abstraction in Python

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/data-abstraction-in-python/
Original Path: https://www.geeksforgeeks.org/python/data-abstraction-in-python/
Course: Python Programming

Data Abstraction in Python

Last Updated : 22 Jan, 2026

Data abstraction means showing only the essential features and hiding the complex internal details. Technically, in Python abstraction is used to hide the implementation details from the user and expose only necessary parts, making the code simpler and easier to interact with.

Real Life Example: In a graphics software, multiple shapes are available such as Circle, Rectangle and Triangle. All shapes share common data and support the same set of actions, but the internal details are hidden:

- Common data: name, color, border thickness, fill style.

- Common actions: draw(), resize(), getArea().

Each shape implements these actions differently Circle uses radius, Rectangle uses length and width and Triangle uses base and height.

The software only knows that a shape can be drawn and its area can be calculated. How the shape is drawn or how the area is calculated is hidden.

Abstract Base Class

In Python, an Abstract Base Class (ABC) is used to achieve data abstraction by defining a common interface for its subclasses. It cannot be instantiated directly and serves as a blueprint for other classes.

Abstract classes are created using abc module and @abstractmethod decorator, allowing developers to enforce method implementation in subclasses while hiding complex internal logic.

Python

from abc import ABC , abstractmethod

class Greet ( ABC ):
@abstractmethod
def say_hello ( self ):
pass # Abstract method

class English ( Greet ):
def say_hello ( self ):
return "Hello!"

g = English ()
print ( g . say_hello ())

Output
Hello!

Explanation:

- Greet is an abstract class with a method say_hello() that has no implementation.

- English implements this method and returns a greeting.

- This keeps structure fixed while letting subclasses define their own behavior.

Components of Abstraction

Abstraction in Python is made up of key components like abstract methods , concrete methods , abstract properties and class instantiation rules. These elements work together to define a clear and enforced structure for subclasses while hiding unnecessary implementation details. Let's discuss them one by one.

Abstract Method

Abstract methods are method declarations without a body defined inside an abstract class. They act as placeholders that force subclasses to provide their own specific implementation, ensuring consistent structure across derived classes.

Python

from abc import ABC , abstractmethod
class Animal ( ABC ):
@abstractmethod
def make_sound ( self ):
pass # Abstract method, no implementation here

Explanation: make_sound() is an abstract method in Animal class, so it doesn't have any code inside it.

Concrete Method

Concrete methods are fully implemented methods within an abstract class. Subclasses can inherit and use them directly, promoting code reuse without needing to redefine common functionality.

Python

from abc import ABC , abstractmethod
class Animal ( ABC ):
@abstractmethod
def make_sound ( self ):
pass # Abstract method, to be implemented by subclasses

def move ( self ):
return "Moving" # Concrete method with implementation

Explanation: move() method is a concrete method in Animal class. It is implemented and does not need to be overridden by Dog class.

Abstract Properties

Abstract properties work like abstract methods but are used for properties. These properties are declared with @property decorator and marked as abstract using @abstractmethod . Subclasses must implement these properties.

Python

from abc import ABC , abstractmethod

class Animal ( ABC ):
@property
@abstractmethod
def species ( self ):
pass # Abstract property, must be implemented by subclasses

class Dog ( Animal ):
@property
def species ( self ):
return "Canine"

# Instantiate the concrete subclass
dog = Dog ()
print ( dog . species )

Output
Canine

Explanation:

- species is an abstract property in Animal class and it is marked as @abstractmethod .

- Dog class implements species property, making it a concrete subclass that can be instantiated.

- Abstract properties enforce that a subclass provides property’s implementation.

Abstract Class Instantiation

Abstract classes cannot be instantiated directly. This is because they contain one or more abstract methods or properties that lack implementations. Attempting to instantiate an abstract class results in a TypeError.

Python

from abc import ABC , abstractmethod

class Animal ( ABC ):
@abstractmethod
def make_sound ( self ):
pass

animal = Animal ()

Explanation:

- Animal class is abstract because it has make_sound() method as an abstract method.

- Instantiating Animal() raises a TypeError because abstract classes with unimplemented methods can't be instantiated, only fully implemented subclasses can.

Python

python-oop-concepts

Python-OOP

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
