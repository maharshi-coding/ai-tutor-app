# Partially Observable Markov Decision Process (POMDP) in AI

Source: GeeksforGeeks Artificial Intelligence Tutorial
Original URL: https://www.geeksforgeeks.org/artificial-intelligence/partially-observable-markov-decision-process-pomdp-in-ai/
Original Path: https://www.geeksforgeeks.org/artificial-intelligence/partially-observable-markov-decision-process-pomdp-in-ai/
Course: Artificial Intelligence

Partially Observable Markov Decision Process (POMDP) in AI

Last Updated : 23 Jul, 2025

Partially Observable Markov Decision Process (POMDP) is a mathematical framework employed for decision-making in situations of uncertainty, where the decision-maker lacks complete information or noisy information regarding the current state of the environment. POMDPs have broad applicability in diverse domains such as robotics, healthcare, finance, and others.

This article provides an in-depth overview of Partially Observable Markov Decision Processes (POMDPs), their components, mathematical framework, solving strategies, and practical application in maze navigation using Python.

Table of Content

- What is Partially Observable Markov Decision Process (POMDP)?

- Mathematical Framework of Partially Observable Markov Decision Process

- Markov Decision Process vs POMDP

- Strategies for Solving Partially Observable Markov Decision Processes

- Exploring Maze Navigation with Partially Observable Markov Decision Processes in Python

- Conclusion

Pre-Requisites

- Probability theory : Probability theory is applied to POMDPs to model the uncertainty surrounding the observations made by the agent and the changes in state within the environment.

- Markov processes : A Markov process, sometimes referred to as a Markov chain, is a stochastic model that depicts how a system changes over time. It assumes that the system's future state is solely dependent on its current state and not on the preceding set of events.

- Decision theory : Taking into account the trade-offs between various actions and their possible outcomes, decision theory offers a framework for making decisions under uncertainty.

What is Partially Observable Markov Decision Process (POMDP)?

A POMDP models decision-making tasks where an agent must make decisions based on incomplete or uncertain state information. It is particularly useful in scenarios where the agent cannot directly observe the underlying state of the system but rather receives observations that provide partial information about the state.

Components of a POMDP

A POMDP is formally defined by the following elements:

- States (S) : A finite set of states representing all possible conditions the system can be in.

- Actions (A) : A finite set of actions available to the agent.

- Transition Model (T) : A function T(s,a,s′)=P(s′∣s,a) that defines the probability of transitioning from state s to state s ′ under action ? a .

- Observations (O) : A finite set of observations that the agent can perceive.

- Observation Model (Z) : A function Z(s′,a,o)=P(o∣s′,a) that defines the probability of observing ? o after taking action a and ending up in state s ′.

- Rewards (R) : A function R(s,a) that assigns a numerical reward to taking action a in state s .

- Discount Factor ( γ ) : A factor between 0 and 1 that discounts future rewards, reflecting the preference for immediate rewards over future gains.

Mathematical Framework of Partially Observable Markov Decision Process

The decision process in a POMDP is a cycle of states, actions, and observations. At each time step, the agent:

- Observes a signal that partially reveals the state of the environment.

- Chooses an action based on the accumulated observations.

- Receives a reward dependent on the action and the underlying state.

- Moves to a new state based on the transition model.

The key challenge in a POMDP is that the agent does not know its exact state but has a belief or probability distribution over the possible states. This belief is updated using the Bayes' rule as new observations are made, forming a belief update rule:

Bel(s') =\frac{ P(o|s',a) \sum_s P(s'|s,a) Bel(s)}{P(o|a, Bel)}

Where:

- Bel( s ) is the prior belief of being in state s .

- Bel( s ′) is the updated belief after observing o and taking action a .

Strategies for Solving Partially Observable Markov Decision Processes

Partially Observable Markov Decision Processes (POMDPs) pose significant challenges in environments where agents have incomplete information. Solving POMDPs involves optimizing decision-making strategies under uncertainty, crucial in many real-world applications. This overview highlights key strategies and methods for addressing these challenges.

Belief State Representation :

In POMDPs, agents maintain a belief state—a probability distribution over all possible states—to manage uncertainty. This belief updates dynamically with actions and observations via Bayes' rule.

Solving Techniques :

- Value Iteration : Extends traditional value iteration to belief states, using a piecewise linear and convex value function to calculate the expected rewards and update beliefs accordingly.

- Point-Based Methods : These methods, such as Perseus and Point-Based Value Iteration (PBVI), focus on a select set of belief points to simplify computations and efficiently approximate the value function.

- Policy Search Methods : Methods like QMDP and Finite-state controllers (FIB) search for optimal policies, sometimes simplifying the problem by assuming full observability post-action or using a finite set of controller states.

- Monte Carlo Methods : Techniques like Partially Observable Monte Carlo Planning (POMCP) and Despot leverage Monte Carlo simulations within a tree search framework to estimate policy values under uncertainty, focusing on key scenarios to reduce complexity.

These methods illustrate the ongoing advancements in computational techniques to manage and solve the complexities of POMDPs, enhancing decision-making in uncertain environments.

Exploring Maze Navigation with Partially Observable Markov Decision Processes in Python

The provided code defines and simulates a Partially Observable Markov Decision Process (POMDP) within a simple maze environment.

Here's a step-by-step explanation of each component of the code:

Step 1: Define the MazePOMDP Class

This class initializes the maze environment, including states, actions, observations, and observation noise.

class MazePOMDP:
def __init__(self, maze_size, observation_noise):
self.maze_size = maze_size
self.states = [(x, y) for x in range(maze_size) for y in range(maze_size)]
self.actions = ["up", "down", "left", "right"]
self.observations = [(x, y) for x in range(maze_size) for y in range(maze_size)]
self.observation_noise = observation_noise

Step 2: Implement Transition Logic

Defines how the agent moves in the maze based on its action, adjusting for maze boundaries.

def transition(self, state, action):
x, y = state
if action == "up":
return (max(x - 1, 0), y)
elif action == "down":
return (min(x + 1, self.maze_size - 1), y)
elif action == "left":
return (x, max(y - 1, 0))
elif action == "right":
return (x, min(y + 1, self.maze_size - 1))

Step 3: Observation Function

Simulates receiving an observation which may or may not be noisy.

def observation(self, state, action, next_state):
if random.random() < self.observation.A noisy correct position observation is more likely, otherwise a random position is observed.

Step 4: Reward Function

Calculates rewards based on the agent's state post-action.

def reward(self, state, action):
if state == (self.maze_size - 1, self.maze_size - 1):
return 10
elif state in [(1, 1), (2, 2), (3, 3)]:
return -5
else:
return -1

Step 5: Print Maze Function

Visualizes the maze with the agent, goal, obstacles, and empty spaces.

def print_maze(agent_position, maze_size):
for i in range(maze_size):
for j in range(maze_size):
if (i, j) == agent_position:
print("A", end=" ")
elif (i, j) == (maze_size - 1, maze_size - 1):
print("G", end=" ")
elif (i, j) in [(1, 1), (2, 2), (3, 3)]:
print("X", end=" ")
else:
print(".", end=" ")
print()

Step 6: Main Function

Executes the simulation, choosing actions randomly and updating beliefs based on observations.

def main():
maze_size = 5
observation_noise = 0.2
pomdp = MazePOMDP(maze_size, observation_noise)
num_simulations = 10
belief = (0, 0)

for i in range(num_simulations):
action = random.choice(pomdp.actions)
next_state = pomdp.transition(belief, action)
observation = pomdp.observation(belief, action, next_state)
reward = pomdp.reward(next_state, action)
print_maze(next_state, maze_size)
belief = observation

Step 7: Run the Program

Ensures the program runs only if executed as the main module.

if __name__ == "__main__":
main()

Python

import random

class MazePOMDP :
def __init__ ( self , maze_size , observation_noise ):
self . maze_size = maze_size
self . states = [( x , y ) for x in range ( maze_size ) for y in range ( maze_size )]
self . actions = [ "up" , "down" , "left" , "right" ]
self . observations = [( x , y ) for x in range ( maze_size ) for y in range ( maze_size )] # All possible positions
self . observation_noise = observation_noise

def transition ( self , state , action ):
x , y = state
if action == "up" :
return ( max ( x - 1 , 0 ), y )
elif action == "down" :
return ( min ( x + 1 , self . maze_size - 1 ), y )
elif action == "left" :
return ( x , max ( y - 1 , 0 ))
elif action == "right" :
return ( x , min ( y + 1 , self . maze_size - 1 ))

def observation ( self , state , action , next_state ):
if random . random () < self . observation_noise :
return next_state # Noisy observation is the true position
else :
return random . choice ( self . observations ) # Random position as noisy observation

def reward ( self , state , action ):
if state == ( self . maze_size - 1 , self . maze_size - 1 ): # Goal state
return 10
elif state in [( 1 , 1 ), ( 2 , 2 ), ( 3 , 3 )]: # Obstacles
return - 5
else :
return - 1

def print_maze ( agent_position , maze_size ):
for i in range ( maze_size ):
for j in range ( maze_size ):
if ( i , j ) == agent_position :
print ( "A" , end = " " ) # Agent
elif ( i , j ) == ( maze_size - 1 , maze_size - 1 ):
print ( "G" , end = " " ) # Goal
elif ( i , j ) in [( 1 , 1 ), ( 2 , 2 ), ( 3 , 3 )]:
print ( "X" , end = " " ) # Obstacle
else :
print ( "." , end = " " ) # Empty space
print ()

def main ():
maze_size = 5
observation_noise = 0.2 # Noise level for observations
pomdp = MazePOMDP ( maze_size , observation_noise )
num_simulations = 10
belief = ( 0 , 0 ) # Initial belief (assume starting from (0, 0))

for i in range ( num_simulations ):
action = random . choice ( pomdp . actions ) # Random action selection
next_state = pomdp . transition ( belief , action )
observation = pomdp . observation ( belief , action , next_state )
reward = pomdp . reward ( next_state , action )

print ( "Step:" , i + 1 )
print ( "Action:" , action )
print ( "Next State:" , next_state )
print ( "Observation:" , observation )
print ( "Reward:" , reward )

print_maze ( next_state , maze_size )
print ()

belief = observation # Update belief to the observed position

if __name__ == "__main__" :
main ()

Output:

Output
The provided sequence demonstrates a simulation of navigating a maze using a Partially Observable Markov Decision Process (POMDP) in Python. Throughout ten steps, an agent attempts to reach a goal ('G') from various positions in a 5x5 grid, making decisions based on limited and sometimes inaccurate observations of its environment. The actions, resulting state changes, rewards, and visual representations of the maze highlight the challenges and dynamics of decision-making under uncertainty in this POMDP framework.

Markov Decision Process vs POMDP

Aspect

Fully observable MDP

Partially Observable MDP (POMDP)

Agent's Knowledge of state

Complete knowledge of the current state of the environment.

Incomplete information about the current state of the environment.

Information of state

The agent knows exactly where it is and what the environment looks like at any given time.

The agent receives observations that are noisy or incomplete indications of the true state.

Uncertainty

No uncertainty about state transitions or outcomes of actions.

Observations influenced by the underlying state, but may not fully reveal it.

Example

A game of chess in which both players possess complete information about the positions of all pieces on the board.

Robot navigating in a foggy environment where it can only see objects within a limited range due to reduced visibility. The robot obtains sensor readings that offer limited information about its surroundings, without possessing direct awareness of the complete environment.

Conclusion

In conclusion, the Partially Observable Markov Decision Process (POMDP) serves as a robust framework for decision-making in environments characterized by uncertainty and incomplete information. Through simulations like the maze navigation example, we can see how POMDPs effectively model real-world challenges by incorporating uncertainty into the decision process. This enhances our ability to develop intelligent systems capable of operating effectively in complex, dynamic settings. As such, POMDPs are invaluable in advancing the fields of robotics, autonomous systems, and other areas requiring sophisticated decision-making capabilities under uncertainty.

Blogathon

Artificial Intelligence

AI-ML-DS

AI-ML-DS With Python

Data Science Blogathon 2024

+ 1 More

Introduction to AI

- What is Artificial Intelligence (AI) 10 min read

- Types of Artificial Intelligence (AI) 6 min read

- Types of AI Based on Functionalities 4 min read

- Agents in AI 7 min read

- Artificial intelligence vs Machine Learning vs Deep Learning 3 min read

- Problem Solving in Artificial Intelligence 6 min read

- Top 20 Applications of Artificial Intelligence (AI) in 2025 13 min read

AI Concepts

- Search Algorithms in AI 6 min read

- Local Search Algorithm in Artificial Intelligence 7 min read

- Adversarial Search Algorithms in Artificial Intelligence (AI) 15+ min read

- Constraint Satisfaction Problems (CSP) in Artificial Intelligence 10 min read

- Knowledge Representation in AI 9 min read

- First-Order Logic in Artificial Intelligence 4 min read

- Reasoning Mechanisms in AI 9 min read

Machine Learning in AI

- Machine Learning Tutorial 5 min read

- Deep Learning Tutorial 2 min read

- Natural Language Processing (NLP) Tutorial 2 min read

- Computer Vision Tutorial 3 min read

Robotics and AI

- Artificial Intelligence in Robotics 5 min read

- What is Robotics Process Automation 8 min read

- Automated Planning in AI 8 min read

- AI in Transportation 8 min read

- AI in Manufacturing : Revolutionizing the Industry 6 min read

Generative AI

- What is Generative AI? 7 min read

- Generative Adversarial Network (GAN) 11 min read

- Cycle Generative Adversarial Network (CycleGAN) 7 min read

- StyleGAN - Style Generative Adversarial Networks 5 min read

- Introduction to Generative Pre-trained Transformer (GPT) 4 min read

- BERT Model - NLP 12 min read

- Generative AI Applications 7 min read

AI Practice

- Top Artificial Intelligence(AI) Interview Questions and Answers 15+ min read

- Top Generative AI and LLM Interview Question with Answer 15+ min read

- 30+ Best Artificial Intelligence Project Ideas with Source Code [2026 Updated] 15+ min read
