# Download and Install Python 3 Latest Version

Source: GeeksforGeeks Python Tutorial
Original URL: https://www.geeksforgeeks.org/python/download-and-install-python-3-latest-version/
Original Path: https://www.geeksforgeeks.org/python/download-and-install-python-3-latest-version/
Course: Python Programming

Download and Install Python 3 Latest Version

Last Updated : 3 Mar, 2026

The first step towards learning Python is to install it on your system. Whether you're using Windows, macOS, or Linux, this guide walks you through the process of downloading and installing the latest Python 3 version.

- Every release of Python is open-source. Python releases have also been compatible with General Public License (GPL).

- Any version of Python can be downloaded from the Python Software Foundation website at python.org.

- Most Operating Systems, notably Linux, provide a package manager through which you can directly install Python.

Install on Windows

Note: The below process of downloading and installing Python in Windows works for both of the Windows 10 as well as Windows 11.

Step 1: Download Python for Windows

- Open your browser and visit the Python download page: python.org/downloads .

- Select the latest Python 3 version, such as Python 3.13.1 (or whichever is the latest stable version available).

- Click on the version to download the installer (a .exe file for Windows).
Download and Install Python
Step 3: Run the Python Installer

- Once the download is complete, run the installer program. On Windows , it will typically be a .exe file.
Install Python
- Make sure to mark Add Python to PATH otherwise you will have to do it explicitly. It will start installing Python on Windows.

- After installation is complete click on Close.

Running Python Shell on Windows

After installing Python, we can launch the Python Shell by searching for " IDLE" in the " Start " menu and clicking on it.
Python Shell

Install on MacOS

Installing Python on macOS can be done via Homebrew, a popular package manager for macOS.

Step 1: Install Python Using Homebrew

- Open the Terminal application (located in Applications > Utilities).

- Run the following command to install Python via Homebrew:

brew install python3

install Python Brew
Step 2: Verify the Installation

Once the installation is complete, we can check the version of Python installed by using the following command:

python3 --version

Python3 version
- The terminal will display the installed version, confirming that Python is ready to use.

Running Python Shell on MacOs

To run Python Shell on MacOs type "python3" terminal (you can search it using Spotlight) and press enter.

For a more detailed guide on how to install Python on MacOs, visit: Stepwise guide to Install Python on Mac

Install on Linux

Most Linux distributions come with Python pre-installed. If you're running Linux and want to check if Python is installed:

Step 1: Check for Python Installation

- Open a terminal using Ctrl+Alt+T and type:

$ python --version

If Python 3 is installed, you'll see something like:

Python 3.x.x

If by any chance, Python is not pre-installed, we can install it by using the following steps:

Step 2: Install or Upgrade Python on Linux

To install the latest version of Python (e.g., Python 3.13), follow these steps:

- Open the terminal and run the following commands:

sudo apt install software-properties-common -y
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.13

- This will install Python 3.13 on your Linux machine.
Install Python in Linux
Step 3: Verify Python Installation

To verify the installation, run the following command:

python3.13 --version

Check Python Version
Running Python Shell on Linux

To launch Python Shell on linux, open the terminal using " Ctrl + Alt + T " and then type " python3 " and press enter.

Python

python-basics

python

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
