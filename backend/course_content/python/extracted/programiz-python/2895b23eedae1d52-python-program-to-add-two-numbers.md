# Python Program to Add Two Numbers

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/examples/add-number
Original Path: https://www.programiz.com/python-programming/examples/add-number
Course: Python Programming

Python Program to Add Two Numbers

To understand this example, you should have the knowledge of the following Python programming topics:

- Python Basic Input and Output

- Python Data Types

- Python Operators

In the program below, we've used the
+
operator to add two numbers.

Example 1: Add Two Numbers

# This program adds two numbers

num1 = 1.5
num2 = 6.3

# Add two numbers
sum = num1 + num2

# Display the sum
print('The sum of {0} and {1} is {2}'.format(num1, num2, sum))

Output

The sum of 1.5 and 6.3 is 7.8

The program below calculates the sum of two numbers entered by the user.

Example 2: Add Two Numbers With User Input

# Store input numbers
num1 = input('Enter first number: ')
num2 = input('Enter second number: ')

# Add two numbers
sum = float(num1) + float(num2)

# Display the sum
print('The sum of {0} and {1} is {2}'.format(num1, num2, sum))

Output

Enter first number: 1.5
Enter second number: 6.3
The sum of 1.5 and 6.3 is 7.8

In this program, we asked the user to enter two numbers and this program displays the sum of two numbers entered by user.

We use the built-in function input() to take the input. Since,
input()
returns a string , we convert the string into number using the float() function. Then, the numbers are added.

Alternative to this, we can perform this addition in a single statement without using any variables as follows.

print('The sum is %.1f' %(float(input('Enter first number: ')) + float(input('Enter second number: '))))

Output

Enter first number: 1.5
Enter second number: 6.3
The sum of 1.5 and 6.3 is 7.8

Although this program uses no variable (memory efficient), it is harder to read.

Before we wrap up, let's put your understanding of this example to the test! Can you solve the following challenge?

Challenge:

Write a function to add 10 to a given number.

- For example, for input 5 , the output should be 15 .

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

Find the Largest Among Three Numbers

Python Example

Make a Simple Calculator

Python Tutorial

Python Basic Input and Output

Python Tutorial

Python Numbers, Type Conversion and Mathematics
