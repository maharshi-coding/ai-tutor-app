# Angelic Search

Source: AIMA Python
Original URL: https://github.com/aimacode/aima-python/blob/HEAD/planning_angelic_search.ipynb
Original Path: planning_angelic_search.ipynb
Course: Artificial Intelligence

# Angelic Search

Search using angelic semantics (is a hierarchical search), where the agent chooses the implementation of the HLA's. <br>
The algorithms input is: problem, hierarchy and initialPlan
- problem is of type Problem
- hierarchy is a dictionary consisting of all the actions.
- initialPlan is an approximate description(optimistic and pessimistic) of the agents choices for the implementation. <br>
initialPlan contains a sequence of HLA's with angelic semantics

```python
from planning import *
from notebook import psource
```

The Angelic search algorithm consists of three parts.
- Search using angelic semantics
- Decompose
- a search in the space of refinements, in a similar way with hierarchical search

### Searching using angelic semantics
- Find the reachable set (optimistic and pessimistic) of the sequence of angelic HLA in initialPlan
- If the optimistic reachable set doesn't intersect the goal, then there is no solution
- If the pessimistic reachable set intersects the goal, then we call decompose, in order to find the sequence of actions that lead us to the goal.
- If the optimistic reachable set intersects the goal, but the pessimistic doesn't we do some further refinements, in order to see if there is a sequence of actions that achieves the goal.

### Search in space of refinements
- Create a search tree, that has root the action and children it's refinements
- Extend frontier by adding each refinement, so that we keep looping till we find all primitive actions
- If we achieve that we return the path of the solution (search tree), else there is no solution and we return None.

```python
psource(Problem.angelic_search)
```

Output:
```text
<IPython.core.display.HTML object>
```

### Decompose
- Finds recursively the sequence of states and actions that lead us from initial state to goal.
- For each of the above actions we find their refinements,if they are not primitive, by calling the angelic_search function.
If there are not refinements return None

```python
psource(Problem.decompose)
```

Output:
```text
<IPython.core.display.HTML object>
```

## Example

Suppose that somebody wants to get to the airport.
The possible ways to do so is either get a taxi, or drive to the airport. <br>
Those two actions have some preconditions and some effects.
If you get the taxi, you need to have cash, whereas if you drive you need to have a car. <br>
Thus we define the following hierarchy of possible actions.

##### hierarchy

```python
library = {
'HLA': ['Go(Home,SFO)', 'Go(Home,SFO)', 'Drive(Home, SFOLongTermParking)', 'Shuttle(SFOLongTermParking, SFO)', 'Taxi(Home, SFO)'],
'steps': [['Drive(Home, SFOLongTermParking)', 'Shuttle(SFOLongTermParking, SFO)'], ['Taxi(Home, SFO)'], [], [], []],
'precond': [['At(Home) & Have(Car)'], ['At(Home)'], ['At(Home) & Have(Car)'], ['At(SFOLongTermParking)'], ['At(Home)']],
'effect': [['At(SFO) & ~At(Home)'], ['At(SFO) & ~At(Home) & ~Have(Cash)'], ['At(SFOLongTermParking) & ~At(Home)'], ['At(SFO) & ~At(LongTermParking)'], ['At(SFO) & ~At(Home) & ~Have(Cash)']] }
```

the possible actions are the following:

```python
go_SFO = HLA('Go(Home,SFO)', precond='At(Home)', effect='At(SFO) & ~At(Home)')
taxi_SFO = HLA('Taxi(Home,SFO)', precond='At(Home)', effect='At(SFO) & ~At(Home) & ~Have(Cash)')
drive_SFOLongTermParking = HLA('Drive(Home, SFOLongTermParking)', 'At(Home) & Have(Car)','At(SFOLongTermParking) & ~At(Home)' )
shuttle_SFO = HLA('Shuttle(SFOLongTermParking, SFO)', 'At(SFOLongTermParking)', 'At(SFO) & ~At(LongTermParking)')
```

Suppose that (our preconditionds are that) we are Home and we have cash and car and our goal is to get to SFO and maintain our cash, and our possible actions are the above. <br>
##### Then our problem is:

```python
prob = Problem('At(Home) & Have(Cash) & Have(Car)', 'At(SFO) & Have(Cash)', [go_SFO, taxi_SFO, drive_SFOLongTermParking,shuttle_SFO])
```

An agent gives us some approximate information about the plan we will follow: <br>
(initialPlan is an Angelic Node, where:
- state is the initial state of the problem,
- parent is None
- action: is a list of actions (Angelic HLA's) with the optimistic estimators of effects and
- action_pes: is a list of actions (Angelic HLA's) with the pessimistic approximations of the effects
##### InitialPlan

```python
angelic_opt_description = Angelic_HLA('Go(Home, SFO)', precond = 'At(Home)', effect ='$+At(SFO) & $-At(Home)' )
angelic_pes_description = Angelic_HLA('Go(Home, SFO)', precond = 'At(Home)', effect ='$+At(SFO) & ~At(Home)' )

initialPlan = [Angelic_Node(prob.init, None, [angelic_opt_description], [angelic_pes_description])]
```

We want to find the optimistic and pessimistic reachable set of initialPlan when applied to the problem:
##### Optimistic/Pessimistic reachable set

```python
opt_reachable_set = Problem.reach_opt(prob.init, initialPlan[0])
pes_reachable_set = Problem.reach_pes(prob.init, initialPlan[0])
print([x for y in opt_reachable_set.keys() for x in opt_reachable_set[y]], '\n')
print([x for y in pes_reachable_set.keys() for x in pes_reachable_set[y]])
```

Output:
```text
[[At(Home), Have(Cash), Have(Car)], [Have(Cash), Have(Car), At(SFO), NotAt(Home)], [Have(Cash), Have(Car), NotAt(Home)], [At(Home), Have(Cash), Have(Car), At(SFO)], [At(Home), Have(Cash), Have(Car)]]

[[At(Home), Have(Cash), Have(Car)], [Have(Cash), Have(Car), At(SFO), NotAt(Home)], [Have(Cash), Have(Car), NotAt(Home)]]
```

##### Refinements

```python
for sequence in Problem.refinements(go_SFO, prob, library):
print (sequence)
print([x.__dict__ for x in sequence ], '\n')
```

Output:
```text
[HLA(Drive(Home, SFOLongTermParking)), HLA(Shuttle(SFOLongTermParking, SFO))]
[{'duration': 0, 'effect': [At(SFOLongTermParking), NotAt(Home)], 'args': (Home, SFOLongTermParking), 'uses': {}, 'consumes': {}, 'name': 'Drive', 'completed': False, 'precond': [At(Home), Have(Car)]}, {'duration': 0, 'effect': [At(SFO), NotAt(LongTermParking)], 'args': (SFOLongTermParking, SFO), 'uses': {}, 'consumes': {}, 'name': 'Shuttle', 'completed': False, 'precond': [At(SFOLongTermParking)]}]

[HLA(Taxi(Home, SFO))]
[{'duration': 0, 'effect': [At(SFO), NotAt(Home), NotHave(Cash)], 'args': (Home, SFO), 'uses': {}, 'consumes': {}, 'name': 'Taxi', 'completed': False, 'precond': [At(Home)]}]
```

Run the angelic search
##### Top level call

```python
plan= Problem.angelic_search(prob, library, initialPlan)
print (plan, '\n')
print ([x.__dict__ for x in plan])
```

Output:
```text
[HLA(Drive(Home, SFOLongTermParking)), HLA(Shuttle(SFOLongTermParking, SFO))]

[{'duration': 0, 'effect': [At(SFOLongTermParking), NotAt(Home)], 'args': (Home, SFOLongTermParking), 'uses': {}, 'consumes': {}, 'name': 'Drive', 'completed': False, 'precond': [At(Home), Have(Car)]}, {'duration': 0, 'effect': [At(SFO), NotAt(LongTermParking)], 'args': (SFOLongTermParking, SFO), 'uses': {}, 'consumes': {}, 'name': 'Shuttle', 'completed': False, 'precond': [At(SFOLongTermParking)]}]
```

## Example 2

```python
library_2 = {
'HLA': ['Go(Home,SFO)', 'Go(Home,SFO)', 'Bus(Home, MetroStop)', 'Metro(MetroStop, SFO)' , 'Metro(MetroStop, SFO)', 'Metro1(MetroStop, SFO)', 'Metro2(MetroStop, SFO)' ,'Taxi(Home, SFO)'],
'steps': [['Bus(Home, MetroStop)', 'Metro(MetroStop, SFO)'], ['Taxi(Home, SFO)'], [], ['Metro1(MetroStop, SFO)'], ['Metro2(MetroStop, SFO)'],[],[],[]],
'precond': [['At(Home)'], ['At(Home)'], ['At(Home)'], ['At(MetroStop)'], ['At(MetroStop)'],['At(MetroStop)'], ['At(MetroStop)'] ,['At(Home) & Have(Cash)']],
'effect': [['At(SFO) & ~At(Home)'], ['At(SFO) & ~At(Home) & ~Have(Cash)'], ['At(MetroStop) & ~At(Home)'], ['At(SFO) & ~At(MetroStop)'], ['At(SFO) & ~At(MetroStop)'], ['At(SFO) & ~At(MetroStop)'] , ['At(SFO) & ~At(MetroStop)'] ,['At(SFO) & ~At(Home) & ~Have(Cash)']]
}
```

```python
plan_2 = Problem.angelic_search(prob, library_2, initialPlan)
print(plan_2, '\n')
print([x.__dict__ for x in plan_2])
```

Output:
```text
[HLA(Bus(Home, MetroStop)), HLA(Metro1(MetroStop, SFO))]

[{'duration': 0, 'effect': [At(MetroStop), NotAt(Home)], 'args': (Home, MetroStop), 'uses': {}, 'consumes': {}, 'name': 'Bus', 'completed': False, 'precond': [At(Home)]}, {'duration': 0, 'effect': [At(SFO), NotAt(MetroStop)], 'args': (MetroStop, SFO), 'uses': {}, 'consumes': {}, 'name': 'Metro1', 'completed': False, 'precond': [At(MetroStop)]}]
```

## Example 3

Sometimes there is no plan that achieves the goal!

```python
library_3 = {
'HLA': ['Shuttle(SFOLongTermParking, SFO)', 'Go(Home, SFOLongTermParking)', 'Taxi(Home, SFOLongTermParking)', 'Drive(Home, SFOLongTermParking)', 'Drive(SFOLongTermParking, Home)', 'Get(Cash)', 'Go(Home, ATM)'],
'steps': [['Get(Cash)', 'Go(Home, SFOLongTermParking)'], ['Taxi(Home, SFOLongTermParking)'], [], [], [], ['Drive(SFOLongTermParking, Home)', 'Go(Home, ATM)'], []],
'precond': [['At(SFOLongTermParking)'], ['At(Home)'], ['At(Home) & Have(Cash)'], ['At(Home)'], ['At(SFOLongTermParking)'], ['At(SFOLongTermParking)'], ['At(Home)']],
'effect': [['At(SFO)'], ['At(SFO)'], ['At(SFOLongTermParking) & ~Have(Cash)'], ['At(SFOLongTermParking)'] ,['At(Home) & ~At(SFOLongTermParking)'], ['At(Home) & Have(Cash)'], ['Have(Cash)'] ]
}
```

```python
shuttle_SFO = HLA('Shuttle(SFOLongTermParking, SFO)', 'Have(Cash) & At(SFOLongTermParking)', 'At(SFO)')
prob_3 = Problem('At(SFOLongTermParking) & Have(Cash)', 'At(SFO) & Have(Cash)', [shuttle_SFO])
# optimistic/pessimistic descriptions
angelic_opt_description = Angelic_HLA('Shuttle(SFOLongTermParking, SFO)', precond = 'At(SFOLongTermParking)', effect ='$+At(SFO) & $-At(SFOLongTermParking)' )
angelic_pes_description = Angelic_HLA('Shuttle(SFOLongTermParking, SFO)', precond = 'At(SFOLongTermParking)', effect ='$+At(SFO) & ~At(SFOLongTermParking)' )
# initial Plan
initialPlan_3 = [Angelic_Node(prob.init, None, [angelic_opt_description], [angelic_pes_description])]
```

```python
plan_3 = prob_3.angelic_search(library_3, initialPlan_3)
print(plan_3)
```

Output:
```text
None
```
