# Artificial Intelligence 3E

Source: Artificial Intelligence: Foundations of Computational Agents
Original URL: https://artint.info/3e/html/ArtInt3e.Ch9.html
Original Path: https://artint.info/3e/html/ArtInt3e.Ch9.html
Course: Artificial Intelligence

David L. Poole & Alan K. Mackworth

Artificial
Intelligence 3E

foundations of computational agents

- Home

- Index

- Contents

Chapter 9 Reasoning with Uncertainty

It is remarkable that a science which began with the consideration of games of chance should become the most important object
of human knowledge …The most important questions of life are, for the
most part, really only problems of probability …

The theory of
probabilities is at bottom nothing but common sense reduced to calculus.

– Pierre
Simon de Laplace [ 1812 ]

Agents in real environments are inevitably forced to make decisions based on
incomplete information. Even when an agent senses the world to find
out more information, it rarely finds out the exact state of the
world. For example, a doctor does
not know exactly what is going on inside a patient, a teacher does not know
exactly what a student understands, and a robot does not know what is
in a room it left a few minutes ago. When an intelligent agent must
act, it has to use whatever information it has.
The previous chapters considered learning probabilities, which is
useful by itself when many similar cases have been observed, however novel
situations require reasoning , not just learning.
This chapter considers
reasoning with uncertainty that is required whenever
an intelligent agent is not omniscient, and cannot just rely on having seen
similar situations many times.

Artificial Intelligence: Foundations of Computational Agents, Poole
& Mackworth

Copyright &copy; 2023, David L. Poole and Alan K. Mackworth .
This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License .
