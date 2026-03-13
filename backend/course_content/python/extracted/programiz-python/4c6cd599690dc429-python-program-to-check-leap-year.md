# Python Program to Check Leap Year

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/examples/leap-year
Original Path: https://www.programiz.com/python-programming/examples/leap-year
Course: Python Programming

Python Program to Check Leap Year

To understand this example, you should have the knowledge of the following Python programming topics:

- Python Operators

- Python if...else Statement

A leap year is exactly divisible by 4 except for century years (years ending with 00). The century year is a leap year only if it is perfectly divisible by 400. For example,

2017 is not a leap year
1900 is a not leap year
2012 is a leap year
2000 is a leap year

Source Code

# Python program to check if year is a leap year or not

year = 2000

# To get year (integer input) from the user
# year = int(input("Enter a year: "))

# divided by 100 means century year (ending with 00)
# century year divided by 400 is leap year
if (year % 400 == 0) and (year % 100 == 0):
print("{0} is a leap year".format(year))

# not divided by 100 means not a century year
# year divided by 4 is a leap year
elif (year % 4 ==0) and (year % 100 != 0):
print("{0} is a leap year".format(year))

# if not divided by both 400 (century year) and 4 (not century year)
# year is not leap year
else:
print("{0} is not a leap year".format(year))

Output

2000 is a leap year

You can change the value of year in the source code and run it again to test this program.

Also Read:

- Python Program to Display Calendar

Before we wrap up, let's put your understanding of this example to the test! Can you solve the following challenge?

Challenge:

Write a function to calculate the number of leap years between two given years.

- Hint: A year is considered a leap year if it is divisible by 4, but not by 100, unless it is also divisible by 400.

- For example, for inputs 2000 and 2020 , the output should be 6 .

Check Code

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

Related Examples

Python Example

Display Calendar

Python Tutorial

Python strftime()

Python Tutorial

Python strptime()

Python Tutorial

Python datetime
