# Python Program to Print the Fibonacci sequence

Source: Programiz Python Tutorial
Original URL: https://www.programiz.com/python-programming/examples/fibonacci-sequence
Original Path: https://www.programiz.com/python-programming/examples/fibonacci-sequence
Course: Python Programming

Python Program to Print the Fibonacci sequence

To understand this example, you should have the knowledge of the following Python programming topics:

- Python if...else Statement

- Python while Loop

A Fibonacci sequence is the integer sequence of 0, 1, 1, 2, 3, 5, 8....

The first two terms are 0 and 1. All other terms are obtained by adding the preceding two terms. This means to say the nth term is the sum of (n-1)th and (n-2)th term.

Source Code

Code Visualization : Want to see how the fibonacci sequence builds itself?
Try our line-by-line code visualizer.

# Program to display the Fibonacci sequence up to n-th term

nterms = int(input("How many terms? "))

# first two terms
n1, n2 = 0, 1
count = 0

# check if the number of terms is valid
if nterms <= 0:
print("Please enter a positive integer")
# if there is only one term, return n1
elif nterms == 1:
print("Fibonacci sequence upto",nterms,":")
print(n1)
# generate fibonacci sequence
else:
print("Fibonacci sequence:")
while count < nterms:
print(n1)
nth = n1 + n2
# update values
n1 = n2
n2 = nth
count += 1

Output

How many terms? 7
Fibonacci sequence:
0
1
2
3
5
8

Here, we store the number of terms in nterms . We initialize the first term to 0 and the second term to 1.

If the number of terms is more than 2, we use a
while
loop to find the next term in the sequence by adding the preceding two terms. We then interchange the variables (update it) and continue on with the process.

You can also print the Fibonacci sequence using recursion .

Before we wrap up, let's put your understanding of this example to the test! Can you solve the following challenge?

Challenge:

Write a function to get the Fibonacci sequence less than a given number.

- The Fibonacci sequence starts with 0 and 1 . Each subsequent number is the sum of the previous two.

- For example, for input
22
, the output should be
[0, 1, 1, 2, 3, 5, 8, 13, 21]
.

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

Display Fibonacci Sequence Using Recursion

Python Tutorial

Python Recursion

Python Example

Display Powers of 2 Using Anonymous Function

Python Tutorial

Python Generators
