# Search for AIMA 4th edition

Source: AIMA Python
Original URL: https://github.com/aimacode/aima-python/blob/HEAD/search4e.ipynb
Original Path: search4e.ipynb
Course: Artificial Intelligence

# Search for AIMA 4th edition

Implementation of search algorithms and search problems for AIMA.

# Problems and Nodes

We start by defining the abstract class for a `Problem`; specific problem domains will subclass this. To make it easier for algorithms that use a heuristic evaluation function, `Problem` has a default `h` function (uniformly zero), and subclasses can define their own default `h` function.

We also define a `Node` in a search tree, and some functions on nodes: `expand` to generate successors; `path_actions` and `path_states` to recover aspects of the path from the node.

```python
%matplotlib inline
import matplotlib.pyplot as plt
import random
import heapq
import math
import sys
from collections import defaultdict, deque, Counter
from itertools import combinations

class Problem(object):
"""The abstract class for a formal problem. A new domain subclasses this,
overriding `actions` and `results`, and perhaps other methods.
The default heuristic is 0 and the default action cost is 1 for all states.
When yiou create an instance of a subclass, specify `initial`, and `goal` states
(or give an `is_goal` method) and perhaps other keyword args for the subclass."""

def __init__(self, initial=None, goal=None, **kwds):
self.__dict__.update(initial=initial, goal=goal, **kwds)

def actions(self, state): raise NotImplementedError
def result(self, state, action): raise NotImplementedError
def is_goal(self, state): return state == self.goal
def action_cost(self, s, a, s1): return 1
def h(self, node): return 0

def __str__(self):
return '{}({!r}, {!r})'.format(
type(self).__name__, self.initial, self.goal)

class Node:
"A Node in a search tree."
def __init__(self, state, parent=None, action=None, path_cost=0):
self.__dict__.update(state=state, parent=parent, action=action, path_cost=path_cost)

def __repr__(self): return '<{}>'.format(self.state)
def __len__(self): return 0 if self.parent is None else (1 + len(self.parent))
def __lt__(self, other): return self.path_cost < other.path_cost

failure = Node('failure', path_cost=math.inf) # Indicates an algorithm couldn't find a solution.
cutoff = Node('cutoff', path_cost=math.inf) # Indicates iterative deepening search was cut off.

def expand(problem, node):
"Expand a node, generating the children nodes."
s = node.state
for action in problem.actions(s):
s1 = problem.result(s, action)
cost = node.path_cost + problem.action_cost(s, action, s1)
yield Node(s1, node, action, cost)

def path_actions(node):
"The sequence of actions to get to this node."
if node.parent is None:
return []
return path_actions(node.parent) + [node.action]

def path_states(node):
"The sequence of states to get to this node."
if node in (cutoff, failure, None):
return []
return path_states(node.parent) + [node.state]
```

# Queues

First-in-first-out and Last-in-first-out queues, and a `PriorityQueue`, which allows you to keep a collection of items, and continually remove from it the item with minimum `f(item)` score.

```python
FIFOQueue = deque

LIFOQueue = list

class PriorityQueue:
"""A queue in which the item with minimum f(item) is always popped first."""

def __init__(self, items=(), key=lambda x: x):
self.key = key
self.items = [] # a heap of (score, item) pairs
for item in items:
self.add(item)

def add(self, item):
"""Add item to the queuez."""
pair = (self.key(item), item)
heapq.heappush(self.items, pair)

def pop(self):
"""Pop and return the item with min f(item) value."""
return heapq.heappop(self.items)[1]

def top(self): return self.items[0][1]

def __len__(self): return len(self.items)
```

# Search Algorithms: Best-First

Best-first search with various *f(n)* functions gives us different search algorithms. Note that A\*, weighted A\* and greedy search can be given a heuristic function, `h`, but if `h` is not supplied they use the problem's default `h` function (if the problem does not define one, it is taken as *h(n)* = 0).

```python
def best_first_search(problem, f):
"Search nodes with minimum f(node) value first."
node = Node(problem.initial)
frontier = PriorityQueue([node], key=f)
reached = {problem.initial: node}
while frontier:
node = frontier.pop()
if problem.is_goal(node.state):
return node
for child in expand(problem, node):
s = child.state
if s not in reached or child.path_cost < reached[s].path_cost:
reached[s] = child
frontier.add(child)
return failure

def best_first_tree_search(problem, f):
"A version of best_first_search without the `reached` table."
frontier = PriorityQueue([Node(problem.initial)], key=f)
while frontier:
node = frontier.pop()
if problem.is_goal(node.state):
return node
for child in expand(problem, node):
if not is_cycle(child):
frontier.add(child)
return failure

def g(n): return n.path_cost

def astar_search(problem, h=None):
"""Search nodes with minimum f(n) = g(n) + h(n)."""
h = h or problem.h
return best_first_search(problem, f=lambda n: g(n) + h(n))

def astar_tree_search(problem, h=None):
"""Search nodes with minimum f(n) = g(n) + h(n), with no `reached` table."""
h = h or problem.h
return best_first_tree_search(problem, f=lambda n: g(n) + h(n))

def weighted_astar_search(problem, h=None, weight=1.4):
"""Search nodes with minimum f(n) = g(n) + weight * h(n)."""
h = h or problem.h
return best_first_search(problem, f=lambda n: g(n) + weight * h(n))

def greedy_bfs(problem, h=None):
"""Search nodes with minimum h(n)."""
h = h or problem.h
return best_first_search(problem, f=h)

def uniform_cost_search(problem):
"Search nodes with minimum path cost first."
return best_first_search(problem, f=g)

def breadth_first_bfs(problem):
"Search shallowest nodes in the search tree first; using best-first."
return best_first_search(problem, f=len)

def depth_first_bfs(problem):
"Search deepest nodes in the search tree first; using best-first."
return best_first_search(problem, f=lambda n: -len(n))

def is_cycle(node, k=30):
"Does this node form a cycle of length k or less?"
def find_cycle(ancestor, k):
return (ancestor is not None and k > 0 and
(ancestor.state == node.state or find_cycle(ancestor.parent, k - 1)))
return find_cycle(node.parent, k)
```

# Other Search Algorithms

Here are the other search algorithms:

```python
def breadth_first_search(problem):
"Search shallowest nodes in the search tree first."
node = Node(problem.initial)
if problem.is_goal(problem.initial):
return node
frontier = FIFOQueue([node])
reached = {problem.initial}
while frontier:
node = frontier.pop()
for child in expand(problem, node):
s = child.state
if problem.is_goal(s):
return child
if s not in reached:
reached.add(s)
frontier.appendleft(child)
return failure

def iterative_deepening_search(problem):
"Do depth-limited search with increasing depth limits."
for limit in range(1, sys.maxsize):
result = depth_limited_search(problem, limit)
if result != cutoff:
return result

def depth_limited_search(problem, limit=10):
"Search deepest nodes in the search tree first."
frontier = LIFOQueue([Node(problem.initial)])
result = failure
while frontier:
node = frontier.pop()
if problem.is_goal(node.state):
return node
elif len(node) >= limit:
result = cutoff
elif not is_cycle(node):
for child in expand(problem, node):
frontier.append(child)
return result

def depth_first_recursive_search(problem, node=None):
if node is None:
node = Node(problem.initial)
if problem.is_goal(node.state):
return node
elif is_cycle(node):
return failure
else:
for child in expand(problem, node):
result = depth_first_recursive_search(problem, child)
if result:
return result
return failure
```

```python
path_states(depth_first_recursive_search(r2))
```

Output:
```text
['N', 'I', 'V', 'U', 'B', 'F', 'S', 'O', 'Z', 'A', 'T', 'L']
```

# Bidirectional Best-First Search

```python
def bidirectional_best_first_search(problem_f, f_f, problem_b, f_b, terminated):
node_f = Node(problem_f.initial)
node_b = Node(problem_f.goal)
frontier_f, reached_f = PriorityQueue([node_f], key=f_f), {node_f.state: node_f}
frontier_b, reached_b = PriorityQueue([node_b], key=f_b), {node_b.state: node_b}
solution = failure
while frontier_f and frontier_b and not terminated(solution, frontier_f, frontier_b):
def S1(node, f):
return str(int(f(node))) + ' ' + str(path_states(node))
print('Bi:', S1(frontier_f.top(), f_f), S1(frontier_b.top(), f_b))
if f_f(frontier_f.top()) < f_b(frontier_b.top()):
solution = proceed('f', problem_f, frontier_f, reached_f, reached_b, solution)
else:
solution = proceed('b', problem_b, frontier_b, reached_b, reached_f, solution)
return solution

def inverse_problem(problem):
if isinstance(problem, CountCalls):
return CountCalls(inverse_problem(problem._object))
else:
inv = copy.copy(problem)
inv.initial, inv.goal = inv.goal, inv.initial
return inv
```

```python
def bidirectional_uniform_cost_search(problem_f):
def terminated(solution, frontier_f, frontier_b):
n_f, n_b = frontier_f.top(), frontier_b.top()
return g(n_f) + g(n_b) > g(solution)
return bidirectional_best_first_search(problem_f, g, inverse_problem(problem_f), g, terminated)

def bidirectional_astar_search(problem_f):
def terminated(solution, frontier_f, frontier_b):
nf, nb = frontier_f.top(), frontier_b.top()
return g(nf) + g(nb) > g(solution)
problem_f = inverse_problem(problem_f)
return bidirectional_best_first_search(problem_f, lambda n: g(n) + problem_f.h(n),
problem_b, lambda n: g(n) + problem_b.h(n),
terminated)

def proceed(direction, problem, frontier, reached, reached2, solution):
node = frontier.pop()
for child in expand(problem, node):
s = child.state
print('proceed', direction, S(child))
if s not in reached or child.path_cost < reached[s].path_cost:
frontier.add(child)
reached[s] = child
if s in reached2: # Frontiers collide; solution found
solution2 = (join_nodes(child, reached2[s]) if direction == 'f' else
join_nodes(reached2[s], child))
#print('solution', path_states(solution2), solution2.path_cost,
# path_states(child), path_states(reached2[s]))
if solution2.path_cost < solution.path_cost:
solution = solution2
return solution

S = path_states

#A-S-R + B-P-R => A-S-R-P + B-P
def join_nodes(nf, nb):
"""Join the reverse of the backward node nb to the forward node nf."""
#print('join', S(nf), S(nb))
join = nf
while nb.parent is not None:
cost = join.path_cost + nb.path_cost - nb.parent.path_cost
join = Node(nb.parent.state, join, nb.action, cost)
nb = nb.parent
#print(' now join', S(join), 'with nb', S(nb), 'parent', S(nb.parent))
return join
```

```python
#A , B = uniform_cost_search(r1), uniform_cost_search(r2)
#path_states(A), path_states(B)
```

```python
#path_states(append_nodes(A, B))
```

# TODO: RBFS

# Problem Domains

Now we turn our attention to defining some problem domains as subclasses of `Problem`.

# Route Finding Problems

![](romania.png)

In a `RouteProblem`, the states are names of "cities" (or other locations), like `'A'` for Arad. The actions are also city names; `'Z'` is the action to move to city `'Z'`. The layout of cities is given by a separate data structure, a `Map`, which is a graph where there are vertexes (cities), links between vertexes, distances (costs) of those links (if not specified, the default is 1 for every link), and optionally the 2D (x, y) location of each city can be specified. A `RouteProblem` takes this `Map` as input and allows actions to move between linked cities. The default heuristic is straight-line distance to the goal, or is uniformly zero if locations were not given.

```python
class RouteProblem(Problem):
"""A problem to find a route between locations on a `Map`.
Create a problem with RouteProblem(start, goal, map=Map(...)}).
States are the vertexes in the Map graph; actions are destination states."""

def actions(self, state):
"""The places neighboring `state`."""
return self.map.neighbors[state]

def result(self, state, action):
"""Go to the `action` place, if the map says that is possible."""
return action if action in self.map.neighbors[state] else state

def action_cost(self, s, action, s1):
"""The distance (cost) to go from s to s1."""
return self.map.distances[s, s1]

def h(self, node):
"Straight-line distance between state and the goal."
locs = self.map.locations
return straight_line_distance(locs[node.state], locs[self.goal])

def straight_line_distance(A, B):
"Straight-line distance between two points."
return sum(abs(a - b)**2 for (a, b) in zip(A, B)) ** 0.5
```

```python
class Map:
"""A map of places in a 2D world: a graph with vertexes and links between them.
In `Map(links, locations)`, `links` can be either [(v1, v2)...] pairs,
or a {(v1, v2): distance...} dict. Optional `locations` can be {v1: (x, y)}
If `directed=False` then for every (v1, v2) link, we add a (v2, v1) link."""

def __init__(self, links, locations=None, directed=False):
if not hasattr(links, 'items'): # Distances are 1 by default
links = {link: 1 for link in links}
if not directed:
for (v1, v2) in list(links):
links[v2, v1] = links[v1, v2]
self.distances = links
self.neighbors = multimap(links)
self.locations = locations or defaultdict(lambda: (0, 0))

def multimap(pairs) -> dict:
"Given (key, val) pairs, make a dict of {key: [val,...]}."
result = defaultdict(list)
for key, val in pairs:
result[key].append(val)
return result
```

```python
# Some specific RouteProblems

romania = Map(
{('O', 'Z'): 71, ('O', 'S'): 151, ('A', 'Z'): 75, ('A', 'S'): 140, ('A', 'T'): 118,
('L', 'T'): 111, ('L', 'M'): 70, ('D', 'M'): 75, ('C', 'D'): 120, ('C', 'R'): 146,
('C', 'P'): 138, ('R', 'S'): 80, ('F', 'S'): 99, ('B', 'F'): 211, ('B', 'P'): 101,
('B', 'G'): 90, ('B', 'U'): 85, ('H', 'U'): 98, ('E', 'H'): 86, ('U', 'V'): 142,
('I', 'V'): 92, ('I', 'N'): 87, ('P', 'R'): 97},
{'A': ( 76, 497), 'B': (400, 327), 'C': (246, 285), 'D': (160, 296), 'E': (558, 294),
'F': (285, 460), 'G': (368, 257), 'H': (548, 355), 'I': (488, 535), 'L': (162, 379),
'M': (160, 343), 'N': (407, 561), 'O': (117, 580), 'P': (311, 372), 'R': (227, 412),
'S': (187, 463), 'T': ( 83, 414), 'U': (471, 363), 'V': (535, 473), 'Z': (92, 539)})

r0 = RouteProblem('A', 'A', map=romania)
r1 = RouteProblem('A', 'B', map=romania)
r2 = RouteProblem('N', 'L', map=romania)
r3 = RouteProblem('E', 'T', map=romania)
r4 = RouteProblem('O', 'M', map=romania)
```

```python
path_states(uniform_cost_search(r1)) # Lowest-cost path from Arab to Bucharest
```

Output:
```text
['A', 'S', 'R', 'P', 'B']
```

```python
path_states(breadth_first_search(r1)) # Breadth-first: fewer steps, higher path cost
```

Output:
```text
['A', 'S', 'F', 'B']
```

# Grid Problems

A `GridProblem` involves navigating on a 2D grid, with some cells being impassible obstacles. By default you can move to any of the eight neighboring cells that are not obstacles (but in a problem instance you can supply a `directions=` keyword to change that). Again, the default heuristic is straight-line distance to the goal. States are `(x, y)` cell locations, such as `(4, 2)`, and actions are `(dx, dy)` cell movements, such as `(0, -1)`, which means leave the `x` coordinate alone, and decrement the `y` coordinate by 1.

```python
class GridProblem(Problem):
"""Finding a path on a 2D grid with obstacles. Obstacles are (x, y) cells."""

def __init__(self, initial=(15, 30), goal=(130, 30), obstacles=(), **kwds):
Problem.__init__(self, initial=initial, goal=goal,
obstacles=set(obstacles) - {initial, goal}, **kwds)

directions = [(-1, -1), (0, -1), (1, -1),
(-1, 0), (1, 0),
(-1, +1), (0, +1), (1, +1)]

def action_cost(self, s, action, s1): return straight_line_distance(s, s1)

def h(self, node): return straight_line_distance(node.state, self.goal)

def result(self, state, action):
"Both states and actions are represented by (x, y) pairs."
return action if action not in self.obstacles else state

def actions(self, state):
"""You can move one cell in any of `directions` to a non-obstacle cell."""
x, y = state
return {(x + dx, y + dy) for (dx, dy) in self.directions} - self.obstacles

class ErraticVacuum(Problem):
def actions(self, state):
return ['suck', 'forward', 'backward']

def results(self, state, action): return self.table[action][state]

table = dict(suck= {1:{5,7}, 2:{4,8}, 3:{7}, 4:{2,4}, 5:{1,5}, 6:{8}, 7:{3,7}, 8:{6,8}},
forward= {1:{2}, 2:{2}, 3:{4}, 4:{4}, 5:{6}, 6:{6}, 7:{8}, 8:{8}},
backward={1:{1}, 2:{1}, 3:{3}, 4:{3}, 5:{5}, 6:{5}, 7:{7}, 8:{7}})
```

```python
# Some grid routing problems

# The following can be used to create obstacles:

def random_lines(X=range(15, 130), Y=range(60), N=150, lengths=range(6, 12)):
"""The set of cells in N random lines of the given lengths."""
result = set()
for _ in range(N):
x, y = random.choice(X), random.choice(Y)
dx, dy = random.choice(((0, 1), (1, 0)))
result |= line(x, y, dx, dy, random.choice(lengths))
return result

def line(x, y, dx, dy, length):
"""A line of `length` cells starting at (x, y) and going in (dx, dy) direction."""
return {(x + i * dx, y + i * dy) for i in range(length)}

random.seed(42) # To make this reproducible

frame = line(-10, 20, 0, 1, 20) | line(150, 20, 0, 1, 20)
cup = line(102, 44, -1, 0, 15) | line(102, 20, -1, 0, 20) | line(102, 44, 0, -1, 24)

d1 = GridProblem(obstacles=random_lines(N=100) | frame)
d2 = GridProblem(obstacles=random_lines(N=150) | frame)
d3 = GridProblem(obstacles=random_lines(N=200) | frame)
d4 = GridProblem(obstacles=random_lines(N=250) | frame)
d5 = GridProblem(obstacles=random_lines(N=300) | frame)
d6 = GridProblem(obstacles=cup | frame)
d7 = GridProblem(obstacles=cup | frame | line(50, 35, 0, -1, 10) | line(60, 37, 0, -1, 17) | line(70, 31, 0, -1, 19))
```

# 8 Puzzle Problems

![](https://ece.uwaterloo.ca/~dwharder/aads/Algorithms/N_puzzles/images/puz3.png)

A sliding tile puzzle where you can swap the blank with an adjacent piece, trying to reach a goal configuration. The cells are numbered 0 to 8, starting at the top left and going row by row left to right. The pieces are numebred 1 to 8, with 0 representing the blank. An action is the cell index number that is to be swapped with the blank (*not* the actual number to be swapped but the index into the state). So the diagram above left is the state `(5, 2, 7, 8, 4, 0, 1, 3, 6)`, and the action is `8`, because the cell number 8 (the 9th or last cell, the `6` in the bottom right) is swapped with the blank.

There are two disjoint sets of states that cannot be reached from each other. One set has an even number of "inversions"; the other has an odd number. An inversion is when a piece in the state is larger than a piece that follows it.

```python
class EightPuzzle(Problem):
""" The problem of sliding tiles numbered from 1 to 8 on a 3x3 board,
where one of the squares is a blank, trying to reach a goal configuration.
A board state is represented as a tuple of length 9, where the element at index i
represents the tile number at index i, or 0 if for the empty square, e.g. the goal:
1 2 3
4 5 6 ==> (1, 2, 3, 4, 5, 6, 7, 8, 0)
7 8 _
"""

def __init__(self, initial, goal=(0, 1, 2, 3, 4, 5, 6, 7, 8)):
assert inversions(initial) % 2 == inversions(goal) % 2 # Parity check
self.initial, self.goal = initial, goal

def actions(self, state):
"""The indexes of the squares that the blank can move to."""
moves = ((1, 3), (0, 2, 4), (1, 5),
(0, 4, 6), (1, 3, 5, 7), (2, 4, 8),
(3, 7), (4, 6, 8), (7, 5))
blank = state.index(0)
return moves[blank]

def result(self, state, action):
"""Swap the blank with the square numbered `action`."""
s = list(state)
blank = state.index(0)
s[action], s[blank] = s[blank], s[action]
return tuple(s)

def h1(self, node):
"""The misplaced tiles heuristic."""
return hamming_distance(node.state, self.goal)

def h2(self, node):
"""The Manhattan heuristic."""
X = (0, 1, 2, 0, 1, 2, 0, 1, 2)
Y = (0, 0, 0, 1, 1, 1, 2, 2, 2)
return sum(abs(X[s] - X[g]) + abs(Y[s] - Y[g])
for (s, g) in zip(node.state, self.goal) if s != 0)

def h(self, node): return h2(self, node)

def hamming_distance(A, B):
"Number of positions where vectors A and B are different."
return sum(a != b for a, b in zip(A, B))

def inversions(board):
"The number of times a piece is a smaller number than a following piece."
return sum((a > b and a != 0 and b != 0) for (a, b) in combinations(board, 2))

def board8(board, fmt=(3 * '{} {} {}\n')):
"A string representing an 8-puzzle board"
return fmt.format(*board).replace('0', '_')

class Board(defaultdict):
empty = '.'
off = '#'
def __init__(self, board=None, width=8, height=8, to_move=None, **kwds):
if board is not None:
self.update(board)
self.width, self.height = (board.width, board.height)
else:
self.width, self.height = (width, height)
self.to_move = to_move

def __missing__(self, key):
x, y = key
if x < 0 or x >= self.width or y < 0 or y >= self.height:
return self.off
else:
return self.empty

def __repr__(self):
def row(y): return ' '.join(self[x, y] for x in range(self.width))
return '\n'.join(row(y) for y in range(self.height))

def __hash__(self):
return hash(tuple(sorted(self.items()))) + hash(self.to_move)
```

```python
# Some specific EightPuzzle problems

e1 = EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8))
e2 = EightPuzzle((1, 2, 3, 4, 5, 6, 7, 8, 0))
e3 = EightPuzzle((4, 0, 2, 5, 1, 3, 7, 8, 6))
e4 = EightPuzzle((7, 2, 4, 5, 0, 6, 8, 3, 1))
e5 = EightPuzzle((8, 6, 7, 2, 5, 4, 3, 0, 1))
```

```python
# Solve an 8 puzzle problem and print out each state

for s in path_states(astar_search(e1)):
print(board8(s))
```

Output:
```text
1 4 2
_ 7 5
3 6 8

1 4 2
3 7 5
_ 6 8

1 4 2
3 7 5
6 _ 8

1 4 2
3 _ 5
6 7 8

1 _ 2
3 4 5
6 7 8

_ 1 2
3 4 5
6 7 8
```

# Water Pouring Problems

![](http://puzzles.nigelcoldwell.co.uk/images/water22.png)

In a [water pouring problem](https://en.wikipedia.org/wiki/Water_pouring_puzzle) you are given a collection of jugs, each of which has a size (capacity) in, say, litres, and a current level of water (in litres). The goal is to measure out a certain level of water; it can appear in any of the jugs. For example, in the movie *Die Hard 3*, the heroes were faced with the task of making exactly 4 gallons from jugs of size 5 gallons and 3 gallons.) A state is represented by a tuple of current water levels, and the available actions are:
- `(Fill, i)`: fill the `i`th jug all the way to the top (from a tap with unlimited water).
- `(Dump, i)`: dump all the water out of the `i`th jug.
- `(Pour, i, j)`: pour water from the `i`th jug into the `j`th jug until either the jug `i` is empty, or jug `j` is full, whichever comes first.

```python
class PourProblem(Problem):
"""Problem about pouring water between jugs to achieve some water level.
Each state is a tuples of water levels. In the initialization, also provide a tuple of
jug sizes, e.g. PourProblem(initial=(0, 0), goal=4, sizes=(5, 3)),
which means two jugs of sizes 5 and 3, initially both empty, with the goal
of getting a level of 4 in either jug."""

def actions(self, state):
"""The actions executable in this state."""
jugs = range(len(state))
return ([('Fill', i) for i in jugs if state[i] < self.sizes[i]] +
[('Dump', i) for i in jugs if state[i]] +
[('Pour', i, j) for i in jugs if state[i] for j in jugs if i != j])

def result(self, state, action):
"""The state that results from executing this action in this state."""
result = list(state)
act, i, *_ = action
if act == 'Fill': # Fill i to capacity
result[i] = self.sizes[i]
elif act == 'Dump': # Empty i
result[i] = 0
elif act == 'Pour': # Pour from i into j
j = action[2]
amount = min(state[i], self.sizes[j] - state[j])
result[i] -= amount
result[j] += amount
return tuple(result)

def is_goal(self, state):
"""True if the goal level is in any one of the jugs."""
return self.goal in state
```

In a `GreenPourProblem`, the states and actions are the same, but instead of all actions costing 1, in these problems the cost of an action is the amount of water that flows from the tap. (There is an issue that non-*Fill* actions have 0 cost, which in general can lead to indefinitely long solutions, but in this problem there is a finite number of states, so we're ok.)

```python
class GreenPourProblem(PourProblem):
"""A PourProblem in which the cost is the amount of water used."""
def action_cost(self, s, action, s1):
"The cost is the amount of water used."
act, i, *_ = action
return self.sizes[i] - s[i] if act == 'Fill' else 0
```

```python
# Some specific PourProblems

p1 = PourProblem((1, 1, 1), 13, sizes=(2, 16, 32))
p2 = PourProblem((0, 0, 0), 21, sizes=(8, 11, 31))
p3 = PourProblem((0, 0), 8, sizes=(7,9))
p4 = PourProblem((0, 0, 0), 21, sizes=(8, 11, 31))
p5 = PourProblem((0, 0), 4, sizes=(3, 5))

g1 = GreenPourProblem((1, 1, 1), 13, sizes=(2, 16, 32))
g2 = GreenPourProblem((0, 0, 0), 21, sizes=(8, 11, 31))
g3 = GreenPourProblem((0, 0), 8, sizes=(7,9))
g4 = GreenPourProblem((0, 0, 0), 21, sizes=(8, 11, 31))
g5 = GreenPourProblem((0, 0), 4, sizes=(3, 5))
```

```python
# Solve the PourProblem of getting 13 in some jug, and show the actions and states
soln = breadth_first_search(p1)
path_actions(soln), path_states(soln)
```

Output:
```text
([('Fill', 1), ('Pour', 1, 0), ('Dump', 0), ('Pour', 1, 0)],
[(1, 1, 1), (1, 16, 1), (2, 15, 1), (0, 15, 1), (2, 13, 1)])
```

# Pancake Sorting Problems

Given a stack of pancakes of various sizes, can you sort them into a stack of decreasing sizes, largest on bottom to smallest on top? You have a spatula with which you can flip the top `i` pancakes. This is shown below for `i = 3`; on the top the spatula grabs the first three pancakes; on the bottom we see them flipped:

![](https://upload.wikimedia.org/wikipedia/commons/0/0f/Pancake_sort_operation.png)

How many flips will it take to get the whole stack sorted? This is an interesting [problem](https://en.wikipedia.org/wiki/Pancake_sorting) that Bill Gates has [written about](https://people.eecs.berkeley.edu/~christos/papers/Bounds%20For%20Sorting%20By%20Prefix%20Reversal.pdf). A reasonable heuristic for this problem is the *gap heuristic*: if we look at neighboring pancakes, if, say, the 2nd smallest is next to the 3rd smallest, that's good; they should stay next to each other. But if the 2nd smallest is next to the 4th smallest, that's bad: we will require at least one move to separate them and insert the 3rd smallest between them. The gap heuristic counts the number of neighbors that have a gap like this. In our specification of the problem, pancakes are ranked by size: the smallest is `1`, the 2nd smallest `2`, and so on, and the representation of a state is a tuple of these rankings, from the top to the bottom pancake. Thus the goal state is always `(1, 2, ..., `*n*`)` and the initial (top) state in the diagram above is `(2, 1, 4, 6, 3, 5)`.

```python
class PancakeProblem(Problem):
"""A PancakeProblem the goal is always `tuple(range(1, n+1))`, where the
initial state is a permutation of `range(1, n+1)`. An act is the index `i`
of the top `i` pancakes that will be flipped."""

def __init__(self, initial):
self.initial, self.goal = tuple(initial), tuple(sorted(initial))

def actions(self, state): return range(2, len(state) + 1)

def result(self, state, i): return state[:i][::-1] + state[i:]

def h(self, node):
"The gap heuristic."
s = node.state
return sum(abs(s[i] - s[i - 1]) > 1 for i in range(1, len(s)))
```

```python
c0 = PancakeProblem((2, 1, 4, 6, 3, 5))
c1 = PancakeProblem((4, 6, 2, 5, 1, 3))
c2 = PancakeProblem((1, 3, 7, 5, 2, 6, 4))
c3 = PancakeProblem((1, 7, 2, 6, 3, 5, 4))
c4 = PancakeProblem((1, 3, 5, 7, 9, 2, 4, 6, 8))
```

```python
# Solve a pancake problem
path_states(astar_search(c0))
```

Output:
```text
[(2, 1, 4, 6, 3, 5),
(6, 4, 1, 2, 3, 5),
(5, 3, 2, 1, 4, 6),
(4, 1, 2, 3, 5, 6),
(3, 2, 1, 4, 5, 6),
(1, 2, 3, 4, 5, 6)]
```

# Jumping Frogs Puzzle

In this puzzle (which also can be played as a two-player game), the initial state is a line of squares, with N pieces of one kind on the left, then one empty square, then N pieces of another kind on the right. The diagram below uses 2 blue toads and 2 red frogs; we will represent this as the string `'LL.RR'`. The goal is to swap the pieces, arriving at `'RR.LL'`. An `'L'` piece moves left-to-right, either sliding one space ahead to an empty space, or two spaces ahead if that space is empty and if there is an `'R'` in between to hop over. The `'R'` pieces move right-to-left analogously. An action will be an `(i, j)` pair meaning to swap the pieces at those indexes. The set of actions for the N = 2 position below is `{(1, 2), (3, 2)}`, meaning either the blue toad in position 1 or the red frog in position 3 can swap places with the blank in position 2.

![](https://upload.wikimedia.org/wikipedia/commons/2/2f/ToadsAndFrogs.png)

```python
class JumpingPuzzle(Problem):
"""Try to exchange L and R by moving one ahead or hopping two ahead."""
def __init__(self, N=2):
self.initial = N*'L' + '.' + N*'R'
self.goal = self.initial[::-1]

def actions(self, state):
"""Find all possible move or hop moves."""
idxs = range(len(state))
return ({(i, i + 1) for i in idxs if state[i:i+2] == 'L.'} # Slide
|{(i, i + 2) for i in idxs if state[i:i+3] == 'LR.'} # Hop
|{(i + 1, i) for i in idxs if state[i:i+2] == '.R'} # Slide
|{(i + 2, i) for i in idxs if state[i:i+3] == '.LR'}) # Hop

def result(self, state, action):
"""An action (i, j) means swap the pieces at positions i and j."""
i, j = action
result = list(state)
result[i], result[j] = state[j], state[i]
return ''.join(result)

def h(self, node): return hamming_distance(node.state, self.goal)
```

```python
JumpingPuzzle(N=2).actions('LL.RR')
```

Output:
```text
{(1, 2), (3, 2)}
```

```python
j3 = JumpingPuzzle(N=3)
j9 = JumpingPuzzle(N=9)
path_states(astar_search(j3))
```

Output:
```text
['LLL.RRR',
'LLLR.RR',
'LL.RLRR',
'L.LRLRR',
'LRL.LRR',
'LRLRL.R',
'LRLRLR.',
'LRLR.RL',
'LR.RLRL',
'.RLRLRL',
'R.LRLRL',
'RRL.LRL',
'RRLRL.L',
'RRLR.LL',
'RR.RLLL',
'RRR.LLL']
```

# Reporting Summary Statistics on Search Algorithms

Now let's gather some metrics on how well each algorithm does. We'll use `CountCalls` to wrap a `Problem` object in such a way that calls to its methods are delegated to the original problem, but each call increments a counter. Once we've solved the problem, we print out summary statistics.

```python
class CountCalls:
"""Delegate all attribute gets to the object, and count them in ._counts"""
def __init__(self, obj):
self._object = obj
self._counts = Counter()

def __getattr__(self, attr):
"Delegate to the original object, after incrementing a counter."
self._counts[attr] += 1
return getattr(self._object, attr)

def report(searchers, problems, verbose=True):
"""Show summary statistics for each searcher (and on each problem unless verbose is false)."""
for searcher in searchers:
print(searcher.__name__ + ':')
total_counts = Counter()
for p in problems:
prob = CountCalls(p)
soln = searcher(prob)
counts = prob._counts;
counts.update(actions=len(soln), cost=soln.path_cost)
total_counts += counts
if verbose: report_counts(counts, str(p)[:40])
report_counts(total_counts, 'TOTAL\n')

def report_counts(counts, name):
"""Print one line of the counts report."""
print('{:9,d} nodes |{:9,d} goal |{:5.0f} cost |{:8,d} actions | {}'.format(
counts['result'], counts['is_goal'], counts['cost'], counts['actions'], name))
```

Here's a tiny report for uniform-cost search on the jug pouring problems:

```python
report([uniform_cost_search], [p1, p2, p3, p4, p5])
```

Output:
```text
uniform_cost_search:
948 nodes | 109 goal | 4 cost | 112 actions | PourProblem((1, 1, 1), 13)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
124 nodes | 30 goal | 14 cost | 43 actions | PourProblem((0, 0), 8)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
52 nodes | 14 goal | 6 cost | 19 actions | PourProblem((0, 0), 4)
8,122 nodes | 931 goal | 42 cost | 968 actions | TOTAL
```

```python
report((uniform_cost_search, breadth_first_search),
(p1, g1, p2, g2, p3, g3, p4, g4, p4, g4, c1, c2, c3))
```

Output:
```text
uniform_cost_search:
948 nodes | 109 goal | 4 cost | 112 actions | PourProblem((1, 1, 1), 13)
1,696 nodes | 190 goal | 10 cost | 204 actions | GreenPourProblem((1, 1, 1), 13)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
4,072 nodes | 454 goal | 21 cost | 463 actions | GreenPourProblem((0, 0, 0), 21)
124 nodes | 30 goal | 14 cost | 43 actions | PourProblem((0, 0), 8)
124 nodes | 30 goal | 35 cost | 45 actions | GreenPourProblem((0, 0), 8)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
4,072 nodes | 454 goal | 21 cost | 463 actions | GreenPourProblem((0, 0, 0), 21)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
4,072 nodes | 454 goal | 21 cost | 463 actions | GreenPourProblem((0, 0, 0), 21)
3,590 nodes | 719 goal | 7 cost | 725 actions | PancakeProblem((4, 6, 2, 5, 1, 3), (1, 2
30,204 nodes | 5,035 goal | 8 cost | 5,042 actions | PancakeProblem((1, 3, 7, 5, 2, 6, 4), (1
22,068 nodes | 3,679 goal | 6 cost | 3,684 actions | PancakeProblem((1, 7, 2, 6, 3, 5, 4), (1
81,467 nodes | 12,321 goal | 174 cost | 12,435 actions | TOTAL

breadth_first_search:
596 nodes | 597 goal | 4 cost | 73 actions | PourProblem((1, 1, 1), 13)
596 nodes | 597 goal | 15 cost | 73 actions | GreenPourProblem((1, 1, 1), 13)
2,618 nodes | 2,619 goal | 9 cost | 302 act
```

# Comparing heuristics

First, let's look at the eight puzzle problems, and compare three different heuristics the Manhattan heuristic, the less informative misplaced tiles heuristic, and the uninformed (i.e. *h* = 0) breadth-first search:

```python
def astar_misplaced_tiles(problem): return astar_search(problem, h=problem.h1)

report([breadth_first_search, astar_misplaced_tiles, astar_search],
[e1, e2, e3, e4, e5])
```

Output:
```text
breadth_first_search:
81 nodes | 82 goal | 5 cost | 35 actions | EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8),
160,948 nodes | 160,949 goal | 22 cost | 59,960 actions | EightPuzzle((1, 2, 3, 4, 5, 6, 7, 8, 0),
218,263 nodes | 218,264 goal | 23 cost | 81,829 actions | EightPuzzle((4, 0, 2, 5, 1, 3, 7, 8, 6),
418,771 nodes | 418,772 goal | 26 cost | 156,533 actions | EightPuzzle((7, 2, 4, 5, 0, 6, 8, 3, 1),
448,667 nodes | 448,668 goal | 27 cost | 167,799 actions | EightPuzzle((8, 6, 7, 2, 5, 4, 3, 0, 1),
1,246,730 nodes |1,246,735 goal | 103 cost | 466,156 actions | TOTAL

astar_misplaced_tiles:
17 nodes | 7 goal | 5 cost | 11 actions | EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8),
23,407 nodes | 8,726 goal | 22 cost | 8,747 actions | EightPuzzle((1, 2, 3, 4, 5, 6, 7, 8, 0),
38,632 nodes | 14,433 goal | 23 cost | 14,455 actions | EightPuzzle((4, 0, 2, 5, 1, 3, 7, 8, 6),
124,324 nodes | 46,553 goal | 26 cost | 46,578 actions | EightPuzzle((7, 2, 4, 5, 0, 6, 8, 3, 1),
156,111 nodes | 58,475 goal | 27 cost | 58,501 actions | EightPuzzle((8, 6, 7, 2, 5, 4, 3, 0, 1),
342,491 nodes | 128,194 goal | 103 cost | 128,292 actions | TOTAL

astar_search:
15 nodes | 6 goal | 5 cost | 10 actions | EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8),
3,614 nodes | 1,349 goal | 22 cost | 1,370 actions | EightPuzzle((1, 2, 3, 4, 5, 6, 7, 8, 0),
5,373 nodes | 2,010 goal | 23 cost | 2,032 actions | EightPuzzle((4, 0, 2, 5, 1, 3, 7, 8, 6),
10,832 nodes | 4,086 goal |
```

We see that all three algorithms get cost-optimal solutions, but the better the heuristic, the fewer nodes explored.
Compared to the uninformed search, the misplaced tiles heuristic explores about 1/4 the number of nodes, and the Manhattan heuristic needs just 2%.

Next, we can show the value of the gap heuristic for pancake sorting problems:

```python
report([astar_search, uniform_cost_search], [c1, c2, c3, c4])
```

Output:
```text
astar_search:
1,285 nodes | 258 goal | 7 cost | 264 actions | PancakeProblem((4, 6, 2, 5, 1, 3), (1, 2
3,804 nodes | 635 goal | 8 cost | 642 actions | PancakeProblem((1, 3, 7, 5, 2, 6, 4), (1
294 nodes | 50 goal | 6 cost | 55 actions | PancakeProblem((1, 7, 2, 6, 3, 5, 4), (1
2,256 nodes | 283 goal | 9 cost | 291 actions | PancakeProblem((1, 3, 5, 7, 9, 2, 4, 6,
7,639 nodes | 1,226 goal | 30 cost | 1,252 actions | TOTAL

uniform_cost_search:
3,590 nodes | 719 goal | 7 cost | 725 actions | PancakeProblem((4, 6, 2, 5, 1, 3), (1, 2
30,204 nodes | 5,035 goal | 8 cost | 5,042 actions | PancakeProblem((1, 3, 7, 5, 2, 6, 4), (1
22,068 nodes | 3,679 goal | 6 cost | 3,684 actions | PancakeProblem((1, 7, 2, 6, 3, 5, 4), (1
2,271,792 nodes | 283,975 goal | 9 cost | 283,983 actions | PancakeProblem((1, 3, 5, 7, 9, 2, 4, 6,
2,327,654 nodes | 293,408 goal | 30 cost | 293,434 actions | TOTAL
```

We need to explore 300 times more nodes without the heuristic.

# Comparing graph search and tree search

Keeping the *reached* table in `best_first_search` allows us to do a graph search, where we notice when we reach a state by two different paths, rather than a tree search, where we have duplicated effort. The *reached* table consumes space and also saves time. How much time? In part it depends on how good the heuristics are at focusing the search. Below we show that on some pancake and eight puzzle problems, the tree search expands roughly twice as many nodes (and thus takes roughly twice as much time):

```python
report([astar_search, astar_tree_search], [e1, e2, e3, e4, r1, r2, r3, r4])
```

Output:
```text
astar_search:
15 nodes | 6 goal | 5 cost | 10 actions | EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8),
3,614 nodes | 1,349 goal | 22 cost | 1,370 actions | EightPuzzle((1, 2, 3, 4, 5, 6, 7, 8, 0),
5,373 nodes | 2,010 goal | 23 cost | 2,032 actions | EightPuzzle((4, 0, 2, 5, 1, 3, 7, 8, 6),
10,832 nodes | 4,086 goal | 26 cost | 4,111 actions | EightPuzzle((7, 2, 4, 5, 0, 6, 8, 3, 1),
15 nodes | 6 goal | 418 cost | 9 actions | RouteProblem('A', 'B')
34 nodes | 15 goal | 910 cost | 23 actions | RouteProblem('N', 'L')
33 nodes | 14 goal | 805 cost | 21 actions | RouteProblem('E', 'T')
20 nodes | 9 goal | 445 cost | 13 actions | RouteProblem('O', 'M')
19,936 nodes | 7,495 goal | 2654 cost | 7,589 actions | TOTAL

astar_tree_search:
15 nodes | 6 goal | 5 cost | 10 actions | EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8),
5,384 nodes | 2,000 goal | 22 cost | 2,021 actions | EightPuzzle((1, 2, 3, 4, 5, 6, 7, 8, 0),
9,116 nodes | 3,404 goal | 23 cost | 3,426 actions | EightPuzzle((4, 0, 2, 5, 1, 3, 7, 8, 6),
19,084 nodes | 7,185 goal | 26 cost | 7,210 actions | EightPuzzle((7, 2, 4, 5, 0, 6, 8, 3, 1),
15 nodes | 6 goal | 418 cost | 9 actions | RouteProblem('A', 'B')
47 nodes | 19 goal | 910 cost | 27 actions | RouteProblem('N', 'L')
46 nodes | 18 goal | 805 cost | 25 actions | RouteProblem('E', 'T')
24 nodes | 10 goal | 445 cost |
```

# Comparing different weighted search values

Below we report on problems using these four algorithms:

|Algorithm|*f*|Optimality|
|:---------|---:|:----------:|
|Greedy best-first search | *f = h*|nonoptimal|
|Extra weighted A* search | *f = g + 2 &times; h*|nonoptimal|
|Weighted A* search | *f = g + 1.4 &times; h*|nonoptimal|
|A* search | *f = g + h*|optimal|
|Uniform-cost search | *f = g*|optimal|

We will see that greedy best-first search (which ranks nodes solely by the heuristic) explores the fewest number of nodes, but has the highest path costs. Weighted A* search explores twice as many nodes (on this problem set) but gets 10% better path costs. A* is optimal, but explores more nodes, and uniform-cost is also optimal, but explores an order of magnitude more nodes.

```python
def extra_weighted_astar_search(problem): return weighted_astar_search(problem, weight=2)

report((greedy_bfs, extra_weighted_astar_search, weighted_astar_search, astar_search, uniform_cost_search),
(r0, r1, r2, r3, r4, e1, d1, d2, j9, e2, d3, d4, d6, d7, e3, e4))
```

Output:
```text
greedy_bfs:
0 nodes | 1 goal | 0 cost | 0 actions | RouteProblem('A', 'A')
9 nodes | 4 goal | 450 cost | 6 actions | RouteProblem('A', 'B')
29 nodes | 12 goal | 910 cost | 20 actions | RouteProblem('N', 'L')
19 nodes | 8 goal | 837 cost | 14 actions | RouteProblem('E', 'T')
14 nodes | 6 goal | 572 cost | 10 actions | RouteProblem('O', 'M')
15 nodes | 6 goal | 5 cost | 10 actions | EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8),
909 nodes | 138 goal | 136 cost | 258 actions | GridProblem((15, 30), (130, 30))
974 nodes | 147 goal | 152 cost | 277 actions | GridProblem((15, 30), (130, 30))
5,146 nodes | 4,984 goal | 99 cost | 5,082 actions | JumpingPuzzle('LLLLLLLLL.RRRRRRRRR', 'RR
1,569 nodes | 568 goal | 58 cost | 625 actions | EightPuzzle((1, 2, 3, 4, 5, 6, 7, 8, 0),
1,424 nodes | 257 goal | 164 cost | 406 actions | GridProblem((15, 30), (130, 30))
1,899 nodes | 342 goal | 153 cost | 470 actions | GridProblem((15, 30), (130, 30))
18,239 nodes | 2,439 goal | 134 cost | 2,564 actions | GridProblem((15, 30), (130, 30))
18,329 nodes | 2,460 goal | 152 cost | 2,594 actions | GridProblem((15, 30), (130, 30))
287 nodes | 109 goal | 33 cost | 141 actions | EightPuzzle((4, 0, 2, 5, 1, 3, 7, 8, 6),
1,128 nodes | 408 goal | 46 cost | 453 actions | EightPuzzle((7, 2, 4, 5, 0, 6, 8, 3, 1),
49,990 nodes | 11,889 goal | 3901 cost |
```

We see that greedy search expands the fewest nodes, but has the highest path costs. In contrast, A\* gets optimal path costs, but expands 4 or 5 times more nodes. Weighted A* is a good compromise, using half the compute time as A\*, and achieving path costs within 1% or 2% of optimal. Uniform-cost is optimal, but is an order of magnitude slower than A\*.

# Comparing many search algorithms

Finally, we compare a host of algorihms (even the slow ones) on some of the easier problems:

```python
report((astar_search, uniform_cost_search, breadth_first_search, breadth_first_bfs,
iterative_deepening_search, depth_limited_search, greedy_bfs,
weighted_astar_search, extra_weighted_astar_search),
(p1, g1, p2, g2, p3, g3, p4, g4, r0, r1, r2, r3, r4, e1))
```

Output:
```text
astar_search:
948 nodes | 109 goal | 4 cost | 112 actions | PourProblem((1, 1, 1), 13)
1,696 nodes | 190 goal | 10 cost | 204 actions | GreenPourProblem((1, 1, 1), 13)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
4,072 nodes | 454 goal | 21 cost | 463 actions | GreenPourProblem((0, 0, 0), 21)
124 nodes | 30 goal | 14 cost | 43 actions | PourProblem((0, 0), 8)
124 nodes | 30 goal | 35 cost | 45 actions | GreenPourProblem((0, 0), 8)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
4,072 nodes | 454 goal | 21 cost | 463 actions | GreenPourProblem((0, 0, 0), 21)
0 nodes | 1 goal | 0 cost | 0 actions | RouteProblem('A', 'A')
15 nodes | 6 goal | 418 cost | 9 actions | RouteProblem('A', 'B')
34 nodes | 15 goal | 910 cost | 23 actions | RouteProblem('N', 'L')
33 nodes | 14 goal | 805 cost | 21 actions | RouteProblem('E', 'T')
20 nodes | 9 goal | 445 cost | 13 actions | RouteProblem('O', 'M')
15 nodes | 6 goal | 5 cost | 10 actions | EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8),
18,151 nodes | 2,096 goal | 2706 cost | 2,200 actions | TOTAL

uniform_cost_search:
948 nodes | 109 goal | 4 cost | 112 actions | PourProblem((1, 1, 1), 13)
1,696 nodes | 190 goal | 10 cost | 204 actions | GreenPourProblem((1, 1, 1), 13)
3,499 nodes | 389

3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
4,072 nodes | 454 goal | 21 cost | 463 actions | GreenPourProblem((0, 0, 0), 21)
0 nodes | 1 goal | 0 cost | 0 actions | RouteProblem('A', 'A')
9 nodes | 4 goal | 450 cost | 6 actions | RouteProblem('A', 'B')
29 nodes | 12 goal | 910 cost | 20 actions | RouteProblem('N', 'L')
19 nodes | 8 goal | 837 cost | 14 actions | RouteProblem('E', 'T')
14 nodes | 6 goal | 572 cost | 10 actions | RouteProblem('O', 'M')
15 nodes | 6 goal | 5 cost | 10 actions | EightPuzzle((1, 4, 2, 0, 7, 5, 3, 6, 8),
18,120 nodes | 2,082 goal | 2897 cost | 2,184 actions | TOTAL

weighted_astar_search:
948 nodes | 109 goal | 4 cost | 112 actions | PourProblem((1, 1, 1), 13)
1,696 nodes | 190 goal | 10 cost | 204 actions | GreenPourProblem((1, 1, 1), 13)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
4,072 nodes | 454 goal | 21 cost | 463 actions | GreenPourProblem((0, 0, 0), 21)
124 nodes | 30 goal | 14 cost | 43 actions | PourProblem((0, 0), 8)
124 nodes | 30 goal | 35 cost | 45 actions | GreenPourProblem((0, 0), 8)
3,499 nodes | 389 goal | 9 cost | 397 actions | PourProblem((0, 0, 0), 21)
4,072 nodes | 454 goal | 21 cost | 463 actions | GreenPourProblem((0, 0, 0), 21)
0 nodes | 1 goal | 0 cost
```

This confirms some of the things we already knew: A* and uniform-cost search are optimal, but the others are not. A* explores fewer nodes than uniform-cost.

# Visualizing Reached States

I would like to draw a picture of the state space, marking the states that have been reached by the search.
Unfortunately, the *reached* variable is inaccessible inside `best_first_search`, so I will define a new version of `best_first_search` that is identical except that it declares *reached* to be `global`. I can then define `plot_grid_problem` to plot the obstacles of a `GridProblem`, along with the initial and goal states, the solution path, and the states reached during a search.

```python
def best_first_search(problem, f):
"Search nodes with minimum f(node) value first."
global reached # <<<<<<<<<<< Only change here
node = Node(problem.initial)
frontier = PriorityQueue([node], key=f)
reached = {problem.initial: node}
while frontier:
node = frontier.pop()
if problem.is_goal(node.state):
return node
for child in expand(problem, node):
s = child.state
if s not in reached or child.path_cost < reached[s].path_cost:
reached[s] = child
frontier.add(child)
return failure

def plot_grid_problem(grid, solution, reached=(), title='Search', show=True):
"Use matplotlib to plot the grid, obstacles, solution, and reached."
reached = list(reached)
plt.figure(figsize=(16, 10))
plt.axis('off'); plt.axis('equal')
plt.scatter(*transpose(grid.obstacles), marker='s', color='darkgrey')
plt.scatter(*transpose(reached), 1**2, marker='.', c='blue')
plt.scatter(*transpose(path_states(solution)), marker='s', c='blue')
plt.scatter(*transpose([grid.initial]), 9**2, marker='D', c='green')
plt.scatter(*transpose([grid.goal]), 9**2, marker='8', c='red')
if show: plt.show()
print('{} {} search: {:.1f} path cost, {:,d} states reached'
.format(' ' * 10, title, solution.path_cost, len(reached)))

def plots(grid, weights=(1.4, 2)):
"""Plot the results of 4 heuristic search algorithms for this grid."""
solution = astar_search(grid)
plot_grid_problem(grid, solution, reached, 'A* search')
for weight in weights:
solution = weighted_astar_search(grid, weight=weight)
plot_grid_problem(grid, solution, reached, '(b) Weighted ({}) A* search'.format(weight))
solution = greedy_bfs(grid)
plot_grid_problem(grid, solution, reached, 'Greedy best-first search')

def transpose(matrix): return list(zip(*matrix))
```

```python
plots(d3)
```

Output:
```text
<Figure size 1152x720 with 1 Axes>

A* search search: 154.2 path cost, 7,418 states reached

<Figure size 1152x720 with 1 Axes>
```

```python
plots(d4)
```

Output:
```text
<Figure size 1152x720 with 1 Axes>

A* search search: 133.0 path cost, 2,196 states reached

<Figure size 1152x720 with 1 Axes>
```

# The cost of weighted A* search

Now I want to try a much simpler grid problem, `d6`, with only a few obstacles. We see that A* finds the optimal path, skirting below the obstacles. Weighterd A* with a weight of 1.4 finds the same optimal path while exploring only 1/3 the number of states. But weighted A* with weight 2 takes the slightly longer path above the obstacles, because that path allowed it to stay closer to the goal in straight-line distance, which it over-weights. And greedy best-first search has a bad showing, not deviating from its path towards the goal until it is almost inside the cup made by the obstacles.

```python
plots(d6)
```

Output:
```text
<Figure size 1152x720 with 1 Axes>

A* search search: 124.1 path cost, 3,305 states reached

<Figure size 1152x720 with 1 Axes>
```

In the next problem, `d7`, we see a similar story. the optimal path found by A*, and we see that again weighted A* with weight 1.4 does great and with weight 2 ends up erroneously going below the first two barriers, and then makes another mistake by reversing direction back towards the goal and passing above the third barrier. Again, greedy best-first makes bad decisions all around.

```python
plots(d7)
```

Output:
```text
<Figure size 1152x720 with 1 Axes>

A* search search: 127.4 path cost, 4,058 states reached

<Figure size 1152x720 with 1 Axes>
```

# Nondeterministic Actions

To handle problems with nondeterministic problems, we'll replace the `result` method with `results`, which returns a collection of possible result states. We'll represent the solution to a problem not with a `Node`, but with a plan that consist of two types of component: sequences of actions, like `['forward', 'suck']`, and condition actions, like
`{5: ['forward', 'suck'], 7: []}`, which says that if we end up in state 5, then do `['forward', 'suck']`, but if we end up in state 7, then do the empty sequence of actions.

```python
def and_or_search(problem):
"Find a plan for a problem that has nondterministic actions."
return or_search(problem, problem.initial, [])

def or_search(problem, state, path):
"Find a sequence of actions to reach goal from state, without repeating states on path."
if problem.is_goal(state): return []
if state in path: return failure # check for loops
for action in problem.actions(state):
plan = and_search(problem, problem.results(state, action), [state] + path)
if plan != failure:
return [action] + plan
return failure

def and_search(problem, states, path):
"Plan for each of the possible states we might end up in."
if len(states) == 1:
return or_search(problem, next(iter(states)), path)
plan = {}
for s in states:
plan[s] = or_search(problem, s, path)
if plan[s] == failure: return failure
return [plan]
```

```python
class MultiGoalProblem(Problem):
"""A version of `Problem` with a colllection of `goals` instead of one `goal`."""

def __init__(self, initial=None, goals=(), **kwds):
self.__dict__.update(initial=initial, goals=goals, **kwds)

def is_goal(self, state): return state in self.goals

class ErraticVacuum(MultiGoalProblem):
"""In this 2-location vacuum problem, the suck action in a dirty square will either clean up that square,
or clean up both squares. A suck action in a clean square will either do nothing, or
will deposit dirt in that square. Forward and backward actions are deterministic."""

def actions(self, state):
return ['suck', 'forward', 'backward']

def results(self, state, action): return self.table[action][state]

table = {'suck':{1:{5,7}, 2:{4,8}, 3:{7}, 4:{2,4}, 5:{1,5}, 6:{8}, 7:{3,7}, 8:{6,8}},
'forward': {1:{2}, 2:{2}, 3:{4}, 4:{4}, 5:{6}, 6:{6}, 7:{8}, 8:{8}},
'backward': {1:{1}, 2:{1}, 3:{3}, 4:{3}, 5:{5}, 6:{5}, 7:{7}, 8:{7}}}
```

Let's find a plan to get from state 1 to the goal of no dirt (states 7 or 8):

```python
and_or_search(ErraticVacuum(1, {7, 8}))
```

Output:
```text
['suck', {5: ['forward', 'suck'], 7: []}]
```

This plan says "First suck, and if we end up in state 5, go forward and suck again; if we end up in state 7, do nothing because that is a goal."

Here are the plans to get to a goal state starting from any one of the 8 states:

```python
{s: and_or_search(ErraticVacuum(s, {7,8}))
for s in range(1, 9)}
```

Output:
```text
{1: ['suck', {5: ['forward', 'suck'], 7: []}],
2: ['suck', {8: [], 4: ['backward', 'suck']}],
3: ['suck'],
4: ['backward', 'suck'],
5: ['forward', 'suck'],
6: ['suck'],
7: [],
8: []}
```

# Comparing Algorithms on EightPuzzle Problems of Different Lengths

```python
from functools import lru_cache

def build_table(table, depth, state, problem):
if depth > 0 and state not in table:
problem.initial = state
table[state] = len(astar_search(problem))
for a in problem.actions(state):
build_table(table, depth - 1, problem.result(state, a), problem)
return table

def invert_table(table):
result = defaultdict(list)
for key, val in table.items():
result[val].append(key)
return result

goal = (0, 1, 2, 3, 4, 5, 6, 7, 8)
table8 = invert_table(build_table({}, 25, goal, EightPuzzle(goal)))
```

```python
def report8(table8, M, Ds=range(2, 25, 2), searchers=(breadth_first_search, astar_misplaced_tiles, astar_search)):
"Make a table of average nodes generated and effective branching factor"
for d in Ds:
line = [d]
N = min(M, len(table8[d]))
states = random.sample(table8[d], N)
for searcher in searchers:
nodes = 0
for s in states:
problem = CountCalls(EightPuzzle(s))
searcher(problem)
nodes += problem._counts['result']
nodes = int(round(nodes/N))
line.append(nodes)
line.extend([ebf(d, n) for n in line[1:]])
print('{:2} & {:6} & {:5} & {:5} && {:.2f} & {:.2f} & {:.2f}'
.format(*line))

def ebf(d, N, possible_bs=[b/100 for b in range(100, 300)]):
"Effective Branching Factor"
return min(possible_bs, key=lambda b: abs(N - sum(b**i for i in range(1, d+1))))

def edepth_reduction(d, N, b=2.67):

from statistics import mean

def random_state():
x = list(range(9))
random.shuffle(x)
return tuple(x)

meanbf = mean(len(e3.actions(random_state())) for _ in range(10000))
meanbf
```

Output:
```text
2.6724
```

```python
{n: len(v) for (n, v) in table30.items()}
```

Output:
```text
{0: 1,
1: 2,
2: 4,
3: 8,
4: 16,
5: 20,
6: 36,
7: 60,
8: 87,
9: 123,
10: 175,
11: 280,
12: 397,
13: 656,
14: 898,
15: 1452,
16: 1670,
17: 2677,
18: 2699,
19: 4015,
20: 3472,
21: 4672,
22: 3311,
23: 3898,
24: 1945,
25: 1796,
26: 621,
27: 368,
28: 63,
29: 19,
30: 0}
```

```python
%time table30 = invert_table(build_table({}, 30, goal, EightPuzzle(goal)))
```

Output:
```text
CPU times: user 24min 7s, sys: 11.6 s, total: 24min 19s
Wall time: 24min 44s
```

```python
%time report8(table30, 20, range(26, 31, 2))
```

Output:
```text
2 & 5 & 6 & 6 && 1.79 & 2.00 & 2.00
4 & 33 & 12 & 12 && 2.06 & 1.49 & 1.49
6 & 128 & 24 & 19 && 2.01 & 1.42 & 1.34
8 & 368 & 48 & 31 && 1.91 & 1.40 & 1.30
10 & 1033 & 116 & 48 && 1.85 & 1.43 & 1.27
12 & 2672 & 279 & 84 && 1.80 & 1.45 & 1.28
14 & 6783 & 678 & 174 && 1.77 & 1.47 & 1.31
16 & 17270 & 1683 & 364 && 1.74 & 1.48 & 1.32
18 & 41558 & 4102 & 751 && 1.72 & 1.49 & 1.34
20 & 91493 & 9905 & 1318 && 1.69 & 1.50 & 1.34
22 & 175921 & 22955 & 2548 && 1.66 & 1.50 & 1.34
24 & 290082 & 53039 & 5733 && 1.62 & 1.50 & 1.36
CPU times: user 6min, sys: 3.63 s, total: 6min 4s
Wall time: 6min 13s
```

```python
%time report8(table30, 20, range(26, 31, 2))
```

Output:
```text
26 & 395355 & 110372 & 10080 && 1.58 & 1.50 & 1.35
28 & 463234 & 202565 & 22055 && 1.53 & 1.49 & 1.36
```

```python
from itertools import combinations
from statistics import median, mean

# Detour index for Romania

L = romania.locations
def ratio(a, b): return astar_search(RouteProblem(a, b, map=romania)).path_cost / sld(L[a], L[b])
nums = [ratio(a, b) for a,b in combinations(L, 2) if b in r1.actions(a)]
mean(nums), median(nums) # 1.7, 1.6 # 1.26, 1.2 for adjacent cities
```

Output:
```text
0 116 116 ['A']
140 0 140 ['A', 'S']
0 83 83 ['A']
118 0 118 ['A', 'T']
0 45 45 ['A']
75 0 75 ['A', 'Z']
0 176 176 ['B']
101 92 193 ['B', 'P']
211 0 211 ['B', 'F']
0 77 77 ['B']
90 0 90 ['B', 'G']
0 100 100 ['B']
101 0 101 ['B', 'P']
0 80 80 ['B']
85 0 85 ['B', 'U']
0 87 87 ['C']
120 0 120 ['C', 'D']
0 109 109 ['C']
138 0 138 ['C', 'P']
0 128 128 ['C']
146 0 146 ['C', 'R']
0 47 47 ['D']
75 0 75 ['D', 'M']
0 62 62 ['E']
86 0 86 ['E', 'H']
0 98 98 ['F']
99 0 99 ['F', 'S']
0 77 77 ['H']
98 0 98 ['H', 'U']
0 85 85 ['I']
87 0 87 ['I', 'N']
0 78 78 ['I']
92 0 92 ['I', 'V']
0 36 36 ['L']
70 0 70 ['L', 'M']
0 86 86 ['L']
111 0 111 ['L', 'T']
0 136 136 ['O']
151 0 151 ['O', 'S']
0 48 48 ['O']
71 0 71 ['O', 'Z']
0 93 93 ['P']
97 0 97 ['P', 'R']
0 65 65 ['R']
80 0 80 ['R', 'S']
0 127 127 ['U']
142 0 142 ['U', 'V']

(1.2698088530709188, 1.2059558858330393)
```

```python
sld
```

Output:
```text
<function __main__.straight_line_distance(A, B)>
```
