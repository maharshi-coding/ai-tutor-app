# Artificial Intelligence 3E

Source: Artificial Intelligence: Foundations of Computational Agents
Original URL: https://artint.info/3e/html/ArtInt3e.Ch13.html
Original Path: https://artint.info/3e/html/ArtInt3e.Ch13.html
Course: Artificial Intelligence

David L. Poole & Alan K. Mackworth

Artificial
Intelligence 3E

foundations of computational agents

- Home

- Index

- Contents

Chapter 13 Reinforcement Learning

[W]e hypothesise that intelligence, and its associated abilities, can be
understood as subserving the maximisation of reward. Accordingly,
reward is enough to drive behaviour that exhibits abilities studied in
natural and artificial intelligence, including knowledge, learning,
perception, social intelligence, language, generalisation and
imitation.

– Silver et al. [ 2021 ]

A reinforcement learning ( RL ) agent acts in an environment,
observing its state and receiving rewards. From its experience of a
stream of acting then observing the resulting state and
reward, it must determine what to do given its goal of
maximizing accumulated reward.
This chapter considers
fully observable , single-agent reinforcement learning.
Section 14.7.2 describes multiagent
reinforcement learning. This is an extension of decision-theoretic
planning to the case where the transition and reward models are not specified.

We have already seen results showing the universality
of utility . Silver et al. [ 2021 ] argue that
decomposing utility into rewards can be a basis of intelligent action.

Artificial Intelligence: Foundations of Computational Agents, Poole
& Mackworth

Copyright &copy; 2023, David L. Poole and Alan K. Mackworth .
This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License .
