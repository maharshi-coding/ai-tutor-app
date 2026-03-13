# Python Program to Find the Factorial of a Number

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/examples/factorial
Original Path: https://www.programiz.com/python-programming/examples/factorial
Course: Python Programming

Python Program to Find the Factorial of a Number

To understand this example, you should have the knowledge of the following Python programming topics:

- Python if...else Statement

- Python for Loop

- Python Recursion

The factorial of a number is the product of all the integers from 1 to that number.

For example, the factorial of 6 is
1*2*3*4*5*6 = 720
. Factorial is not defined for negative numbers, and the factorial of zero is one,
0! = 1
.

Factorial of a Number using Loop

# Python program to find the factorial of a number provided by the user.

# change the value for a different result
num = 7

# To take input from the user
#num = int(input("Enter a number: "))

factorial = 1

# check if the number is negative, positive or zero
if num < 0:
print("Sorry, factorial does not exist for negative numbers")
elif num == 0:
print("The factorial of 0 is 1")
else:
for i in range(1,num + 1):
factorial = factorial*i
print("The factorial of",num,"is",factorial)

Output

The factorial of 7 is 5040

Note: To test the program for a different number, change the value of
num
.

Here, the number whose factorial is to be found is stored in
num
, and we check if the number is negative, zero or positive using
if...elif...else
statement. If the number is positive, we use
for
loop and range() function to calculate the factorial.

iteration
factorial*i (returned value)

i = 1
1 * 1 = 1

i = 2
1 * 2 = 2

i = 3
2 * 3 = 6

i = 4
6 * 4 = 24

i = 5
24 * 5 = 120

i = 6
120 * 6 = 720

i = 7
720 * 7 = 5040

Factorial of a Number using Recursion

# Python program to find the factorial of a number provided by the user
# using recursion

def factorial(x):
"""This is a recursive function
to find the factorial of an integer"""

if x == 1 or x == 0:
return 1
else:
# recursive call to the function
return (x * factorial(x-1))

# change the value for a different result
num = 7

# to take input from the user
# num = int(input("Enter a number: "))

# call the factorial function
result = factorial(num)
print("The factorial of", num, "is", result)

In the above example,
factorial()
is a recursive function that calls itself. Here, the function will recursively call itself by decreasing the value of the x .

Also Read:

- Python Program to Find Factorial of Number Using Recursion

Before we wrap up, let's put your understanding of this example to the test! Can you solve the following challenge?

Challenge:

Write a function to calculate the factorial of a number.

- The factorial of a non-negative integer n is the product of all positive integers less than or equal to n.

- For example, for input
5
, the output should be
120

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

Find Factorial of Number Using Recursion

Python Tutorial

Python Recursion

Python Example

Check if a Number is Positive, Negative or 0

Python Example

Check if a Number is Odd or Even
