# State Space Search in AI

Source: GeeksforGeeks Artificial Intelligence Tutorial
Original URL: https://www.geeksforgeeks.org/artificial-intelligence/state-space-search-in-ai/
Original Path: https://www.geeksforgeeks.org/artificial-intelligence/state-space-search-in-ai/
Course: Artificial Intelligence

State Space Search in AI

Last Updated : 22 Jan, 2026

State Space Search is used to solve problems by finding different possible states and their transitions. In simple terms it’s like finding the best route to goal by trying different paths. In this article, we will understand it and implement Breadth-First Search (BFS) to solve the 8-puzzle problem.

- It works by systematically checking each state and moving to new states until the goal is reached. It consider the problem as a series of steps and it moves from one state to another until the goal is reached.

- This method can be applied to various AI tasks such as pathfinding, puzzle solving, game playing and more.

The core idea behind state space search is to think of the problem as a graph where:

- Nodes represent different states of the problem.

- Edges represent transitions or actions that change one state into another.

Terminologies consist of:

- State: A specific configuration of the problem.

- Initial State: Starting point of the search.

- Goal State: Desired end configuration.

- Transition: An action that changes one state to another.

- Path: A sequence of states connected by transitions.

- Search Strategy: Method used to explore the state space.

Principles and Features of State Space Search

The efficiency of state space search depends on several key factors. Understanding these helps in choosing right strategy and optimizing the search process.

- Expansiveness : Number of new states a given state can generate. More broader problems require finding more possibilities which increases search complexity.

- Branching Factor : Average number of successors per state. A higher branching factor makes search tree wider which increases time and resources required.

- Depth : Number of steps from the initial state to the goal state. Deeper trees increase the search time as more states must be explored.

- Completeness : A search is complete if it guarantees finding a solution if one exists. It ensures the algorithm will eventually reach the goal.

- Optimality : A search is optimal if it guarantees finding the best solution, according to a specific criterion liked least cost or shortest path.

- Time Complexity : The time required for the search which get affected by branching factor and depth. More expansive or deeper trees increase the time needed.

- Space Complexity : Memory required for the search. It depends on how many states need to be stored at once. Larger branching factors or deeper searches use more memory.

Steps in State Space Search

Following steps are involved in the state space search process:

Step 1: Define the State Space

Identify all possible states and their transitions. To do this model the problem in a way that includes all relevant configurations and actions.

Step 2: Pick a Search Strategy

Choose a method for exploring the state space. Common strategies include:

- Breadth-First Search (BFS) : Explores all nodes at one depth level before moving to the next, ideal for unweighted graphs.

- Depth-First Search (DFS) : Explores a branch as deeply as possible before backtracking. It uses less memory but may not guarantee completeness or optimality.

- Uniform Cost Search (UCS) : Expands the least costly node first which ensures the lowest-cost solution.

- Greedy Best-First Search : Expands nodes that appear closest to the goal based on a heuristic.

- A* Search Algorithm : Combines path cost and heuristic to guarantee completeness and optimality.

Step 3: Start the Search

Add initial state and begin the search from there.

Step 4: Extend the Nodes

Using the selected search technique it expands node from start state and helps in generating successor states and adding them to the frontier. If a state matches the goal it retrace path to the solution and stop the search.

Step 5: Address State Repetition

Prevent revisiting same state by tracking visited states helps in avoiding cycles and unnecessary exploration.

Step 6: End the Search

The search ends when goal state is found or when all states have been explored without finding a solution.

Heuristics in State Space Search

Heuristics play an important role in helping the search process towards the goal state more efficiently. A heuristic is a technique designed to solve a problem faster than traditional methods or to find an approximate solution when traditional methods fail to find any exact solution. In the context of state space search:

- Admissible Heuristic : Never overestimates cost of reaching the goal which ensures optimality of the A* search.

- Informed vs. Uninformed Search : Informed search strategies use heuristics to guide the search while uninformed search strategies search the space blindly.

Breadth-First Search (BFS) algorithm on 8-Puzzle Problem

Problem Overview : The 8-puzzle problem is a sliding puzzle that consists of a 3x3 grid with 8 tiles numbered from 1 to 8 and one blank space. The goal is to arrange the tiles in numerical order from 1 to 8 with the blank space in the lower-right corner. The puzzle begins with a shuffled arrangement of tiles and the objective is to reach the goal state using the least number of moves.

Here's a explanation of how the BFS algorithm works to explore state space and find the solution.

Scenario:

- States : Each arrangement of the 3x3 grid consisting of tiles numbered 1 through 8 and a blank space.

- Initial State : A specific tile layout at the start.

- Goal State : Arrangements with blank space in the lower-right corner and the tiles arranged in numerical order.

- Actions : Up, down, left or right movement of the empty space.

- Transition Model : Describes the state generated after performing an action.

- Path Cost : Cost of each move is uniform and equals one.

Step 1: Load Dependencies

We are using Numpy , Matplotlib libraries to implement this.

Python

import numpy as np
import matplotlib.pyplot as plt
from queue import Queue

Step 2: Visualization Function

Using
matplotlib
to create a grid for each state in the path and places numbers accordingly with empty spaces represented by zeros. This function is important for understanding how the puzzle is solved step by step.

- fig, axes = plt.subplots(nrows=len(path), ncols=1, figsize=(3, 3 * len(path))): Creates a subplot grid for visualizing each state in the puzzle solution path.

- if len(path) == 1: axes = [axes]: Ensures that when there is only one state in the path it is still treated as a list for iteration.

- ax.imshow(state, cmap='tab20', vmin=0, vmax=9): Displays current state as an image with a color map and sets the value range for the tiles.

- ax.text(j, i, state[i, j] if state[i, j] != 0 else '', ha='center', va='center', color='white', fontsize=20): Displays tile number in each grid cell leaving the space blank if the cell contains 0 (empty space).

Python

def visualize_puzzle ( path ):
fig , axes = plt . subplots ( nrows = len ( path ), ncols = 1 , figsize = ( 3 , 3 * len ( path )))
if len ( path ) == 1 :
axes = [ axes ]
for ax , state in zip ( axes , path ):
ax . imshow ( state , cmap = 'tab20' , vmin = 0 , vmax = 9 )
ax . set_xticks ( np . arange ( 3 ))
ax . set_yticks ( np . arange ( 3 ))
ax . set_xticklabels ([])
ax . set_yticklabels ([])
for i in range ( 3 ):
for j in range ( 3 ):
ax . text ( j , i , state [ i , j ] if state [ i , j ] != 0 else '' ,
ha = 'center' , va = 'center' , color = 'white' , fontsize = 20 )
ax . grid ( color = 'black' )
plt . tight_layout ()
plt . show ()

Step 3: BFS Algorithm

BFS algorithm starts with the initial state and explores all possible moves level by level. A queue is used to store states that need to be processed.

- queue.put((initial_state, [initial_state])): Adds initial state to the queue along with the path that led to this state.

- visited.add(tuple(initial_state.reshape(-1))): Adds initial state to the visited set. The reshape(-1) flattens 2D state array into a 1D tuple so it can be stored in the set for efficient lookups.

- current_state, path = queue.get(): Retrieves the current state and the path that led to it from the queue. The path is a list of states that shows the sequence of moves from the initial state.

- zero_pos = tuple(np.argwhere(current_state == 0)[0]): Finds position of the empty space (denoted by 0) in the current state. np.argwhere returns the coordinates and [0] selects first (and only) result helps in converting it to a tuple.

- moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]: Defines possible moves for the empty space: up ((-1, 0)), down ((1, 0)), left ((0, -1)) and right ((0, 1)).

Python

def bfs_solve ( initial_state , goal_state ):

queue = Queue ()
queue . put (( initial_state , [ initial_state ]))
visited = set ()
visited . add ( tuple ( initial_state . reshape ( - 1 )))

while not queue . empty ():
current_state , path = queue . get ()
if np . array_equal ( current_state , goal_state ):
return path

zero_pos = tuple ( np . argwhere ( current_state == 0 )[ 0 ])
moves = [( - 1 , 0 ), ( 1 , 0 ), ( 0 , - 1 ), ( 0 , 1 )]

Step 4: Movement Logic

This calculates new positions based on the moves and generates the next state by swapping empty space (zero) with the adjacent tile.

- new_pos = (zero_pos[0] + move[0], zero_pos[1] + move[1]): Calculates new position of the empty space (zero) after applying the current move. The zero_pos is the current position of empty space and move is the current direction (up, down, left or right).

- new_state[zero_pos], new_state[new_pos] = new_state[new_pos], new_state[zero_pos]: Swaps empty space (zero_pos) with adjacent tile at new_pos. This creates a new state by moving the empty space.

- queue.put((new_state, path + [new_state])): Adds new state to the queue along with the updated path. The queue will now process this state in the next iterations.

Python

for move in moves :
new_pos = ( zero_pos [ 0 ] + move [ 0 ], zero_pos [ 1 ] + move [ 1 ])
if 0 <= new_pos [ 0 ] < 3 and 0 <= new_pos [ 1 ] < 3 :
new_state = np . copy ( current_state )
new_state [ zero_pos ], new_state [ new_pos ] = new_state [ new_pos ], new_state [ zero_pos ]
new_state_tuple = tuple ( new_state . reshape ( - 1 ))
if new_state_tuple not in visited :
visited . add ( new_state_tuple )
queue . put (( new_state , path + [ new_state ]))

Step 5: Main Execution

Here we set the initial and goal states and then run the BFS search.

- initial_state = np.array([[1, 2, 3], [4, 5, 6], [0, 7, 8]]): This line defines the initial state of the 8-puzzle problem represented as a 3x3 matrix.

- goal_state = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 0]]): This line defines the goal state of the 8-puzzle problem where the tiles are in the correct order and empty space is in the bottom-right corner.

Python

initial_state = np . array ([[ 1 , 2 , 3 ], [ 4 , 5 , 6 ], [ 0 , 7 , 8 ]])
goal_state = np . array ([[ 1 , 2 , 3 ], [ 4 , 5 , 6 ], [ 7 , 8 , 0 ]])
solution_path = bfs_solve ( initial_state , goal_state )
if solution_path :
visualize_puzzle ( solution_path )
else :
print ( "No solution found." )

Output:
Resulant
Applications of State Space Search

State space search is used in many different fields such as:

- Pathfinding: Finding the best pathways using algorithms such as A* in robotics and GPS.

- Puzzle solving: Resolving puzzles like Rubik's Cube, Sudoku and the 8-puzzle.

- AI for gaming: To identify good moves in board games like chess, checkers and others.

- Planning: Automated scheduling of tasks in logistics and robotics to achieve a specific objective.

- Natural language processing: It involves computer translation and sentence parsing by examining many interpretations.

Challenges in State Space Search

- Complexity : High branching factors can cause an exponential growth in the number of states to be explored.

- Resource Limitations : Memory and processing power limit size of the state space that can be practically searched.

- Quality of Heuristics : The effectiveness of the search is limited by the quality of the heuristic function.

State space search remains a fundamental technique in AI which helps systems to solve complex problems by systematically exploring various possibilities to reach optimal solutions.

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

- 30+ Best Artificial Intelligence Project Ideas with Source Code [2025 Updated] 15+ min read
