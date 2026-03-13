# TOTAL ORDER PLANNER

Source: AIMA Python
Original URL: https://github.com/aimacode/aima-python/blob/HEAD/planning_total_order_planner.ipynb
Original Path: planning_total_order_planner.ipynb
Course: Artificial Intelligence

### TOTAL ORDER PLANNER

In mathematical terminology, **total order**, **linear order** or **simple order** refers to a set *X* which is said to be totally ordered under &le; if the following statements hold for all *a*, *b* and *c* in *X*:
<br>
If *a* &le; *b* and *b* &le; *a*, then *a* = *b* (antisymmetry).
<br>
If *a* &le; *b* and *b* &le; *c*, then *a* &le; *c* (transitivity).
<br>
*a* &le; *b* or *b* &le; *a* (connex relation).

<br>
In simpler terms, a total order plan is a linear ordering of actions to be taken to reach the goal state.
There may be several different total-order plans for a particular goal depending on the problem.
<br>
In the module, the `Linearize` class solves problems using this paradigm.
At its core, the `Linearize` uses a solved planning graph from `GraphPlan` and finds a valid total-order solution for it.
Let's have a look at the class.

```python
from planning import *
from notebook import psource
```

```python
psource(Linearize)
```

Output:
```text
<IPython.core.display.HTML object>
```

The `filter` method removes the persistence actions (if any) from the planning graph representation.
<br>
The `orderlevel` method finds a valid total-ordering of a specified level of the planning-graph, given the state of the graph after the previous level.
<br>
The `execute` method sequentially calls `orderlevel` for all the levels in the planning-graph and returns the final total-order solution.
<br>
Let's look at some examples.

```python
# total-order solution for air_cargo problem
Linearize(air_cargo()).execute()
```

Output:
```text
[Load(C1, P1, SFO),
Fly(P1, SFO, JFK),
Load(C2, P2, JFK),
Fly(P2, JFK, SFO),
Unload(C2, P2, SFO),
Unload(C1, P1, JFK)]
```

```python
# total-order solution for spare_tire problem
Linearize(spare_tire()).execute()
```

Output:
```text
[Remove(Spare, Trunk), Remove(Flat, Axle), PutOn(Spare, Axle)]
```

```python
# total-order solution for three_block_tower problem
Linearize(three_block_tower()).execute()
```

Output:
```text
[MoveToTable(C, A), Move(B, Table, C), Move(A, Table, B)]
```

```python
# total-order solution for simple_blocks_world problem
Linearize(simple_blocks_world()).execute()
```

Output:
```text
[ToTable(A, B), FromTable(B, A), FromTable(C, B)]
```

```python
# total-order solution for socks_and_shoes problem
Linearize(socks_and_shoes()).execute()
```

Output:
```text
[RightSock, LeftSock, RightShoe, LeftShoe]
```
