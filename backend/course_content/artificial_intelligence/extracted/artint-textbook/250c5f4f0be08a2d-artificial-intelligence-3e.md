# Artificial Intelligence 3E

Source: Artificial Intelligence: Foundations of Computational Agents
Original URL: https://artint.info/3e/html/ArtInt3e.Ch4.html
Original Path: https://artint.info/3e/html/ArtInt3e.Ch4.html
Course: Artificial Intelligence

David L. Poole & Alan K. Mackworth

Artificial
Intelligence 3E

foundations of computational agents

- Home

- Index

- Contents

Chapter 4 Reasoning with Constraints

Every task involves constraint,
Solve the thing without complaint;
There are magic links and chains
Forged to loose our rigid brains.
Structures, strictures, though they bind,
Strangely liberate the mind.

– James Falen

Instead of reasoning explicitly in terms of states, it is typically better
to describe states in terms of features and to reason in terms of
these features, where a feature is a function on states. Features are
described using variables . Often features are not
independent and there
are hard constraints that specify legal combinations of assignments of
values to variables. As Falen’s elegant poem emphasizes, the mind
discovers and exploits constraints to solve tasks. Preferences
over assignments are specified in terms of soft constraints . This
chapter shows how to generate assignments that satisfy hard
constraints and optimize soft constraints.

Artificial Intelligence: Foundations of Computational Agents, Poole
& Mackworth

Copyright &copy; 2023, David L. Poole and Alan K. Mackworth .
This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License .
