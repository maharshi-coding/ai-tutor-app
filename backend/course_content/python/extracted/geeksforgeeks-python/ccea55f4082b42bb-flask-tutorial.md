# Flask Tutorial

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/flask-tutorial/
Original Path: https://www.geeksforgeeks.org/python/flask-tutorial/
Course: Python Programming

Flask Tutorial

Last Updated : 7 Mar, 2026

Flask is a lightweight web framework for Python used to build web applications and APIs. It follows a minimal design and provides core features like routing, request handling, and template rendering while allowing developers to add extensions as needed. It is widely used for building small to medium web applications due to its simplicity and flexibility.

- Microframework : It is a lightweight web framework with minimal dependencies, giving developers flexibility to design the application structure as needed.

- Werkzeug and Jinja2 : Flask uses Werkzeug for handling HTTP requests and responses and Jinja2 for creating dynamic HTML templates.

- Routing : It provides an easy routing system where URLs are mapped to Python functions using decorators.

- Flexible Database Choice: It does not include a built-in ORM, allowing developers to use tools like SQLAlchemy or raw SQL based on project requirements.

- API Development: It is widely used for building RESTful APIs and backend services due to its simplicity and modular design.

- Development Server : It includes a lightweight development server for running and testing applications locally during development.

Introduction

This section introduces Flask for web development, explains why it is called a micro web framework, compares it with Django and shows how to install Flask on Windows to start building web applications.

- Introduction to Web Development

- Differences Between Django and Flask

- Installation of Flask on Windows

Quick Start

Quick introduction to Flask development, covering how to create and run a simple Flask application, understand routes and HTTP methods, work with variable rules, handle redirects and errors and configure the application’s port and host settings.

- Creating the first simple application

- Run a Flask Application

- Routes

- Models

- HTTP Method

- Variable Rules

- Redirects and URL

- Redirect and Errors

- Change Port

- Changing Host IP Address

Templates and Static Files

Flask uses templates to create dynamic web pages with the Jinja2 templating engine. It also covers how static files such as CSS, JavaScript and images are organized and used to style and enhance Flask applications.

- Templates

- Template Inheritance

- Static Files

Form Handling

This section explains how Flask handles forms, including capturing user input using the request object and managing validation and security with Flask-WTF. It also covers file uploads and CSRF protection.

- Flask-WTF

- Handling File Uploads

- CSFR Protection

Configuration

Flask provides configuration support to control application behavior using settings like debug mode, secret keys and environment variables, and allows organizing configurations for development and production environments.

- App Configuration

- Environment-Specific Configuration

Database

Flask provides support for multiple databases for storing and managing application data. It can work with relational databases like SQLite, PostgreSQL and MySQL using Flask-SQLAlchemy, connect to MongoDB and execute raw SQL queries.

- SQLAlchemy

- SQLite

- Sending Data from an app to MongoDB Database

- Making an app using a PostgreSQL Database

- Build a Web App using Flask and SQLite in Python

- Login and Registration Project Using Flask and MySQL

- Execute raw SQL in the Flask-SQLAlchemy

Middlewares

Middlewares in Flask process requests and responses before they reach the application or the client. They are commonly used for tasks such as logging, authentication and modifying requests or responses.

- Middlewares

- WSGI Middleware

Authentication

Authentication in Flask is used to verify user identity and manage secure access to applications. It includes login systems, password hashing, session management and permission control.

- How To Add Authentication to Your App with Flask-Login

- Display Current Username

- Password Hashing with Bcrypt

- Store username and password

- Role-Based Access Control

- Sessions to server Logout

- JWT

- Cookies

- JSON Response

Rest APIs

Flask makes building REST APIs easy by handling requests like GET, POST, PUT and DELETE. With Flask-RESTful or simple routes, one can send and receive JSON data, manage authentication and secure the API.

- Creating Rest APIs

- RESTful Extension

- Serialization and Deserialization

Advanced Topics

Flask also supports advanced features for building scalable applications, including asynchronous programming, modular application structure and real-time communication.

- Asynchronous Programming with async.io

- Web Sockets

- Blueprints

Deployment and Error Handling

After development, Flask applications must be deployed and properly handle errors. This section covers deployment methods and techniques for managing application errors.

- Subdomain

- Handling 404 Error

- Dockerization

- Deploy Python Flask App on Heroku

- Deploy Machine Learning Model

Projects

This section includes practical Flask projects that demonstrate real-world applications such as portfolio websites, APIs, data visualization and sentiment analysis tools.

- Todo list app using Flask Python

- Single Page Portfolio

- Profile Application using Python Flask and MySQL

- Wikipedia search app

- Twitter Sentiment Analysis WebApp

- Create Cricket Score API using Web Scraping

- Adding Graphs to Flask Apps

- Projects Archives

Important Links

- Comparison of Flask with other frameworks

- Career Opportunities with Flask

- Top 40 Flask Interview Questions and Answers

Python

Python Flask

Tutorials

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
