# Assignment: Diophantine Equations

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/6-Other/21-GeneticAlgorithms/Diophantine.ipynb
Original Path: lessons/6-Other/21-GeneticAlgorithms/Diophantine.ipynb
Course: Artificial Intelligence

## Assignment: Diophantine Equations

> This assignment is part of [AI for Beginners Curriculum](http://github.com/microsoft/ai-for-beginners) and is inspired by [this post](https://habr.com/post/128704/).

Your goal is to solve so-called **Diophantine equation** - an equation with integer roots and integer coefficients. For example, consider the following equation:

$$a+2b+3c+4d=30$$

You need to find integer roots $a$,$b$,$c$,$d\in\mathbb{N}$ that satisfy this equation.

Hints:
1. You can consider roots to be in the interval [0;30]
1. As a gene, consider using the list of root values
