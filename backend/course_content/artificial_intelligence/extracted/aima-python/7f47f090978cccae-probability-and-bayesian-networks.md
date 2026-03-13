# Probability and Bayesian Networks

Source: AIMA Python
Original URL: https://github.com/aimacode/aima-python/blob/HEAD/probability4e.ipynb
Original Path: probability4e.ipynb
Course: Artificial Intelligence

# Probability and Bayesian Networks

Probability theory allows us to compute the likelihood of certain events, given assumptioons about the components of the event. A Bayesian network, or Bayes net for short, is a data structure to represent a joint probability distribution over several random variables, and do inference on it.

As an example, here is a network with five random variables, each with its conditional probability table, and with arrows from parent to child variables. The story, from Judea Pearl, is that there is a house burglar alarm, which can be triggered by either a burglary or an earthquake. If the alarm sounds, one or both of the neighbors, John and Mary, might call the owwner to say the alarm is sounding.

<p><img src="http://norvig.com/ipython/burglary2.jpg">

We implement this with the help of seven Python classes:

## `BayesNet()`

A `BayesNet` is a graph (as in the diagram above) where each node represents a random variable, and the edges are parent&rarr;child links. You can construct an empty graph with `BayesNet()`, then add variables one at a time with the method call `.add(`*variable_name, parent_names, cpt*`)`, where the names are strings, and each of the `parent_names` must already have been `.add`ed.

## `Variable(`*name, cpt, parents*`)`

A random variable; the ovals in the diagram above. The value of a variable depends on the value of the parents, in a probabilistic way specified by the variable's conditional probability table (CPT). Given the parents, the variable is independent of all the other variables. For example, if I know whether *Alarm* is true or false, then I know the probability of *JohnCalls*, and evidence about the other variables won't give me any more information about *JohnCalls*. Each row of the CPT uses the same order of variables as the list of parents.
We will only allow variables with a finite discrete domain; not continuous values.

## `ProbDist(`*mapping*`)`<br>`Factor(`*mapping*`)`

A probability distribution is a mapping of `{outcome: probability}` for every outcome of a random variable.
You can give `ProbDist` the same arguments that you would give to the `dict` initializer, for example
`ProbDist(sun=0.6, rain=0.1, cloudy=0.3)`.
As a shortcut for Boolean Variables, you can say `ProbDist(0.95)` instead of `ProbDist({T: 0.95, F: 0.05})`.
In a probability distribution, every value is between 0 and 1, and the values sum to 1.
A `Factor` is similar to a probability distribution, except that the values need not sum to 1. Factors
are used in the variable elimination inference method.

## `Evidence(`*mapping*`)`

A mapping of `{Variable: value, ...}` pairs, describing the exact values for a set of variables&mdash;the things we know for sure.

## `CPTable(`*rows, parents*`)`

A conditional probability table (or *CPT*) describes the probability of each possible outcome value of a random variable, given the values of the parent variables. A `CPTable` is a a mapping, `{tuple: probdist, ...}`, where each tuple lists the values of each of the parent variables, in order, and each probability distribution says what the possible outcomes are, given those values of the parents. The `CPTable` for *Alarm* in the diagram above would be represented as follows:

CPTable({(T, T): .95,
(T, F): .94,
(F, T): .29,
(F, F): .001},
[Burglary, Earthquake])

How do you read this? Take the second row, "`(T, F): .94`". This means that when the first parent (`Burglary`) is true, and the second parent (`Earthquake`) is fale, then the probability of `Alarm` being true is .94. Note that the .94 is an abbreviation for `ProbDist({T: .94, F: .06})`.

## `T = Bool(True); F = Bool(False)`

When I used `bool` values (`True` and `False`), it became hard to read rows in CPTables, because the columns didn't line up:

(True, True, False, False, False)
(False, False, False, False, True)
(True, False, False, True, True)

Therefore, I created the `Bool` class, with constants `T` and `F` such that `T == True` and `F == False`, and now rows are easier to read:

(T, T, F, F, F)
(F, F, F, F, T)
(T, F, F, T, T)

Here is the code for these classes:

```python
from collections import defaultdict, Counter
import itertools
import math
import random

class BayesNet(object):
"Bayesian network: a graph of variables connected by parent links."

def __init__(self):
self.variables = [] # List of variables, in parent-first topological sort order
self.lookup = {} # Mapping of {variable_name: variable} pairs

def add(self, name, parentnames, cpt):
"Add a new Variable to the BayesNet. Parentnames must have been added previously."
parents = [self.lookup[name] for name in parentnames]
var = Variable(name, cpt, parents)
self.variables.append(var)
self.lookup[name] = var
return self

class Variable(object):
"A discrete random variable; conditional on zero or more parent Variables."

def __init__(self, name, cpt, parents=()):
"A variable has a name, list of parent variables, and a Conditional Probability Table."
self.__name__ = name
self.parents = parents
self.cpt = CPTable(cpt, parents)
self.domain = set(itertools.chain(*self.cpt.values())) # All the outcomes in the CPT

def __repr__(self): return self.__name__

class Factor(dict): "An {outcome: frequency} mapping."

class ProbDist(Factor):
"""A Probability Distribution is an {outcome: probability} mapping.
The values are normalized to sum to 1.
ProbDist(0.75) is an abbreviation for ProbDist({T: 0.75, F: 0.25})."""
def __init__(self, mapping=(), **kwargs):
if isinstance(mapping, float):
mapping = {T: mapping, F: 1 - mapping}
self.update(mapping, **kwargs)
normalize(self)

class Evidence(dict):
"A {variable: value} mapping, describing what we know for sure."

class CPTable(dict):
"A mapping of {row: ProbDist, ...} where each row is a tuple of values of the parent variables."

def __init__(self, mapping, parents=()):
"""Provides two shortcuts for writing a Conditional Probability Table.
With no parents, CPTable(dist) means CPTable({(): dist}).
With one parent, CPTable({val: dist,...}) means CPTable({(val,): dist,...})."""
if len(parents) == 0 and not (isinstance(mapping, dict) and set(mapping.keys()) == {()}):
mapping = {(): mapping}
for (row, dist) in mapping.items():
if len(parents) == 1 and not isinstance(row, tuple):
row = (row,)
self[row] = ProbDist(dist)

class Bool(int):
"Just like `bool`, except values display as 'T' and 'F' instead of 'True' and 'False'"
__str__ = __repr__ = lambda self: 'T' if self else 'F'

T = Bool(True)
F = Bool(False)
```

And here are some associated functions:

```python
def P(var, evidence={}):
"The probability distribution for P(variable | evidence), when all parent variables are known (in evidence)."
row = tuple(evidence[parent] for parent in var.parents)
return var.cpt[row]

def normalize(dist):
"Normalize a {key: value} distribution so values sum to 1.0. Mutates dist and returns it."
total = sum(dist.values())
for key in dist:
dist[key] = dist[key] / total
assert 0 <= dist[key] <= 1, "Probabilities must be between 0 and 1."
return dist

def sample(probdist):
"Randomly sample an outcome from a probability distribution."
r = random.random() # r is a random point in the probability distribution
c = 0.0 # c is the cumulative probability of outcomes seen so far
for outcome in probdist:
c += probdist[outcome]
if r <= c:
return outcome

def globalize(mapping):
"Given a {name: value} mapping, export all the names to the `globals()` namespace."
globals().update(mapping)
```

# Sample Usage

Here are some examples of using the classes:

```python
# Example random variable: Earthquake:
# An earthquake occurs on 0.002 of days, independent of any other variables.
Earthquake = Variable('Earthquake', 0.002)
```

```python
# The probability distribution for Earthquake
P(Earthquake)
```

Output:
```text
{F: 0.998, T: 0.002}
```

```python
# Get the probability of a specific outcome by subscripting the probability distribution
P(Earthquake)[T]
```

Output:
```text
0.002
```

```python
# Randomly sample from the distribution:
sample(P(Earthquake))
```

Output:
```text
F
```

```python
# Randomly sample 100,000 times, and count up the results:
Counter(sample(P(Earthquake)) for i in range(100000))
```

Output:
```text
Counter({F: 99793, T: 207})
```

```python
# Two equivalent ways of specifying the same Boolean probability distribution:
assert ProbDist(0.75) == ProbDist({T: 0.75, F: 0.25})
```

```python
# Two equivalent ways of specifying the same non-Boolean probability distribution:
assert ProbDist(win=15, lose=3, tie=2) == ProbDist({'win': 15, 'lose': 3, 'tie': 2})
ProbDist(win=15, lose=3, tie=2)
```

Output:
```text
{'lose': 0.15, 'tie': 0.1, 'win': 0.75}
```

```python
# The difference between a Factor and a ProbDist--the ProbDist is normalized:
Factor(a=1, b=2, c=3, d=4)
```

Output:
```text
{'a': 1, 'b': 2, 'c': 3, 'd': 4}
```

```python
ProbDist(a=1, b=2, c=3, d=4)
```

Output:
```text
{'a': 0.1, 'b': 0.2, 'c': 0.3, 'd': 0.4}
```

# Example: Alarm Bayes Net

Here is how we define the Bayes net from the diagram above:

```python
alarm_net = (BayesNet()
.add('Burglary', [], 0.001)
.add('Earthquake', [], 0.002)
.add('Alarm', ['Burglary', 'Earthquake'], {(T, T): 0.95, (T, F): 0.94, (F, T): 0.29, (F, F): 0.001})
.add('JohnCalls', ['Alarm'], {T: 0.90, F: 0.05})
.add('MaryCalls', ['Alarm'], {T: 0.70, F: 0.01}))
```

```python
# Make Burglary, Earthquake, etc. be global variables
globalize(alarm_net.lookup)
alarm_net.variables
```

Output:
```text
[Burglary, Earthquake, Alarm, JohnCalls, MaryCalls]
```

```python
# Probability distribution of a Burglary
P(Burglary)
```

Output:
```text
{F: 0.999, T: 0.001}
```

```python
# Probability of Alarm going off, given a Burglary and not an Earthquake:
P(Alarm, {Burglary: T, Earthquake: F})
```

Output:
```text
{F: 0.06000000000000005, T: 0.94}
```

```python
# Where that came from: the (T, F) row of Alarm's CPT:
Alarm.cpt
```

Output:
```text
{(F, F): {F: 0.999, T: 0.001},
(F, T): {F: 0.71, T: 0.29},
(T, F): {F: 0.06000000000000005, T: 0.94},
(T, T): {F: 0.050000000000000044, T: 0.95}}
```

# Bayes Nets as Joint Probability Distributions

A Bayes net is a compact way of specifying a full joint distribution over all the variables in the network. Given a set of variables {*X*<sub>1</sub>, ..., *X*<sub>*n*</sub>}, the full joint distribution is:

P(*X*<sub>1</sub>=*x*<sub>1</sub>, ..., *X*<sub>*n*</sub>=*x*<sub>*n*</sub>) = <font size=large>&Pi;</font><sub>*i*</sub> P(*X*<sub>*i*</sub> = *x*<sub>*i*</sub> | parents(*X*<sub>*i*</sub>))

For a network with *n* variables, each of which has *b* values, there are *b<sup>n</sup>* rows in the joint distribution (for example, a billion rows for 30 Boolean variables), making it impractical to explicitly create the joint distribution for large networks. But for small networks, the function `joint_distribution` creates the distribution, which can be instructive to look at, and can be used to do inference.

```python
def joint_distribution(net):
"Given a Bayes net, create the joint distribution over all variables."
return ProbDist({row: prod(P_xi_given_parents(var, row, net)
for var in net.variables)
for row in all_rows(net)})

def all_rows(net): return itertools.product(*[var.domain for var in net.variables])

def P_xi_given_parents(var, row, net):
"The probability that var = xi, given the values in this row."
dist = P(var, Evidence(zip(net.variables, row)))
xi = row[net.variables.index(var)]
return dist[xi]

def prod(numbers):
"The product of numbers: prod([2, 3, 5]) == 30. Analogous to `sum([2, 3, 5]) == 10`."
result = 1
for x in numbers:
result *= x
return result
```

```python
# All rows in the joint distribution (2**5 == 32 rows)
set(all_rows(alarm_net))
```

Output:
```text
{(F, F, F, F, F),
(F, F, F, F, T),
(F, F, F, T, F),
(F, F, F, T, T),
(F, F, T, F, F),
(F, F, T, F, T),
(F, F, T, T, F),
(F, F, T, T, T),
(F, T, F, F, F),
(F, T, F, F, T),
(F, T, F, T, F),
(F, T, F, T, T),
(F, T, T, F, F),
(F, T, T, F, T),
(F, T, T, T, F),
(F, T, T, T, T),
(T, F, F, F, F),
(T, F, F, F, T),
(T, F, F, T, F),
(T, F, F, T, T),
(T, F, T, F, F),
(T, F, T, F, T),
(T, F, T, T, F),
(T, F, T, T, T),
(T, T, F, F, F),
(T, T, F, F, T),
(T, T, F, T, F),
(T, T, F, T, T),
(T, T, T, F, F),
(T, T, T, F, T),
(T, T, T, T, F),
(T, T, T, T, T)}
```

```python
# Let's work through just one row of the table:
row = (F, F, F, F, F)
```

```python
# This is the probability distribution for Alarm
P(Alarm, {Burglary: F, Earthquake: F})
```

Output:
```text
{F: 0.999, T: 0.001}
```

```python
# Here's the probability that Alarm is false, given the parent values in this row:
P_xi_given_parents(Alarm, row, alarm_net)
```

Output:
```text
0.999
```

```python
# The full joint distribution:
joint_distribution(alarm_net)
```

Output:
```text
{(F, F, F, F, F): 0.9367427006190001,
(F, F, F, F, T): 0.009462047481000001,
(F, F, F, T, F): 0.04930224740100002,
(F, F, F, T, T): 0.0004980024990000002,
(F, F, T, F, F): 2.9910060000000004e-05,
(F, F, T, F, T): 6.979013999999999e-05,
(F, F, T, T, F): 0.00026919054000000005,
(F, F, T, T, T): 0.00062811126,
(F, T, F, F, F): 0.0013341744900000002,
(F, T, F, F, T): 1.3476510000000005e-05,
(F, T, F, T, F): 7.021971000000001e-05,
(F, T, F, T, T): 7.092900000000001e-07,
(F, T, T, F, F): 1.7382600000000002e-05,
(F, T, T, F, T): 4.0559399999999997e-05,
(F, T, T, T, F): 0.00015644340000000006,
(F, T, T, T, T): 0.00036503460000000007,
(T, F, F, F, F): 5.631714000000006e-05,
(T, F, F, F, T): 5.688600000000006e-07,
(T, F, F, T, F): 2.9640600000000033e-06,
(T, F, F, T, T): 2.9940000000000035e-08,
(T, F, T, F, F): 2.8143600000000003e-05,
(T, F, T, F, T): 6.56684e-05,
(T, F, T, T, F): 0.0002532924000000001,
(T, F, T, T, T): 0.0005910156000000001,
(T, T, F, F, F): 9.40500000000001e-08,
(T, T, F, F, T): 9.50000000000001e-10,
(T, T, F, T, F): 4.9500000000000054e-09,
(T, T, F, T, T): 5.0000000000000066e-11,
(T, T, T, F, F): 5.7e-08,
(T, T, T, F, T): 1.3299999999999996e-07,
(T, T, T, T, F): 5.130000000000002e-07,
(T, T, T, T, T): 1.1970000000000001e-06}
```

```python
# Probability that "the alarm has sounded, but neither a burglary nor an earthquake has occurred,
# and both John and Mary call" (page 514 says it should be 0.000628)

print(alarm_net.variables)
joint_distribution(alarm_net)[F, F, T, T, T]
```

Output:
```text
[Burglary, Earthquake, Alarm, JohnCalls, MaryCalls]

0.00062811126
```

# Inference by Querying the Joint Distribution

We can use `P(variable, evidence)` to get the probability of aa variable, if we know the vaues of all the parent variables. But what if we don't know? Bayes nets allow us to calculate the probability, but the calculation is not just a lookup in the CPT; it is a global calculation across the whole net. One inefficient but straightforward way of doing the calculation is to create the joint probability distribution, then pick out just the rows that
match the evidence variables, and for each row check what the value of the query variable is, and increment the probability for that value accordningly:

```python
def enumeration_ask(X, evidence, net):
"The probability distribution for query variable X in a belief net, given evidence."
i = net.variables.index(X) # The index of the query variable X in the row
dist = defaultdict(float) # The resulting probability distribution over X
for (row, p) in joint_distribution(net).items():
if matches_evidence(row, evidence, net):
dist[row[i]] += p
return ProbDist(dist)

def matches_evidence(row, evidence, net):
"Does the tuple of values for this row agree with the evidence?"
return all(evidence[v] == row[net.variables.index(v)]
for v in evidence)
```

```python
# The probability of a Burgalry, given that John calls but Mary does not:
enumeration_ask(Burglary, {JohnCalls: F, MaryCalls: T}, alarm_net)
```

Output:
```text
{F: 0.9931237539265789, T: 0.006876246073421024}
```

```python
# The probability of an Alarm, given that there is an Earthquake and Mary calls:
enumeration_ask(Alarm, {MaryCalls: T, Earthquake: T}, alarm_net)
```

Output:
```text
{F: 0.03368899586522123, T: 0.9663110041347788}
```

# Variable Elimination

The `enumeration_ask` algorithm takes time and space that is exponential in the number of variables. That is, first it creates the joint distribution, of size *b<sup>n</sup>*, and then it sums out the values for the rows that match the evidence. We can do better than that if we interleave the joining of variables with the summing out of values.
This approach is called *variable elimination*. The key insight is that
when we compute

P(*X*<sub>1</sub>=*x*<sub>1</sub>, ..., *X*<sub>*n*</sub>=*x*<sub>*n*</sub>) = <font size=large>&Pi;</font><sub>*i*</sub> P(*X*<sub>*i*</sub> = *x*<sub>*i*</sub> | parents(*X*<sub>*i*</sub>))

we are repeating the calculation of, say, P(*X*<sub>*3*</sub> = *x*<sub>*4*</sub> | parents(*X*<sub>*3*</sub>))
multiple times, across multiple rows of the joint distribution.

```python
# TODO: Copy over and update Variable Elimination algorithm. Also, sampling algorithms.
```

# Example: Flu Net

In this net, whether a patient gets the flu is dependent on whether they were vaccinated, and having the flu influences whether they get a fever or headache. Here `Fever` is a non-Boolean variable, with three values, `no`, `mild`, and `high`.

```python
flu_net = (BayesNet()
.add('Vaccinated', [], 0.60)
.add('Flu', ['Vaccinated'], {T: 0.002, F: 0.02})
.add('Fever', ['Flu'], {T: ProbDist(no=25, mild=25, high=50),
F: ProbDist(no=97, mild=2, high=1)})
.add('Headache', ['Flu'], {T: 0.5, F: 0.03}))

globalize(flu_net.lookup)
```

```python
# If you just have a headache, you probably don't have the Flu.
enumeration_ask(Flu, {Headache: T, Fever: 'no'}, flu_net)
```

Output:
```text
{F: 0.9616440110625343, T: 0.03835598893746573}
```

```python
# Even more so if you were vaccinated.
enumeration_ask(Flu, {Headache: T, Fever: 'no', Vaccinated: T}, flu_net)
```

Output:
```text
{F: 0.9914651882096696, T: 0.008534811790330398}
```

```python
# But if you were not vaccinated, there is a higher chance you have the flu.
enumeration_ask(Flu, {Headache: T, Fever: 'no', Vaccinated: F}, flu_net)
```

Output:
```text
{F: 0.9194016377587207, T: 0.08059836224127925}
```

```python
# And if you have both headache and fever, and were not vaccinated,
# then the flu is very likely, especially if it is a high fever.
enumeration_ask(Flu, {Headache: T, Fever: 'mild', Vaccinated: F}, flu_net)
```

Output:
```text
{F: 0.1904145077720207, T: 0.8095854922279793}
```

```python
enumeration_ask(Flu, {Headache: T, Fever: 'high', Vaccinated: F}, flu_net)
```

Output:
```text
{F: 0.055534567434831886, T: 0.9444654325651682}
```

# Entropy

We can compute the entropy of a probability distribution:

```python
def entropy(probdist):
"The entropy of a probability distribution."
return - sum(p * math.log(p, 2)
for p in probdist.values())
```

```python
entropy(ProbDist(heads=0.5, tails=0.5))
```

Output:
```text
1.0
```

```python
entropy(ProbDist(yes=1000, no=1))
```

Output:
```text
0.011397802630112312
```

```python
entropy(P(Alarm, {Earthquake: T, Burglary: F}))
```

Output:
```text
0.8687212463394045
```

```python
entropy(P(Alarm, {Earthquake: F, Burglary: F}))
```

Output:
```text
0.011407757737461138
```

For non-Boolean variables, the entropy can be greater than 1 bit:

```python
entropy(P(Fever, {Flu: T}))
```

Output:
```text
1.5
```

# Unknown Outcomes: Smoothing

So far we have dealt with discrete distributions where we know all the possible outcomes in advance. For Boolean variables, the only outcomes are `T` and `F`. For `Fever`, we modeled exactly three outcomes. However, in some applications we will encounter new, previously unknown outcomes over time. For example, we could train a model on the distribution of words in English, and then somebody could coin a brand new word. To deal with this, we introduce
the `DefaultProbDist` distribution, which uses the key `None` to stand as a placeholder for any unknown outcome(s).

```python
class DefaultProbDist(ProbDist):
"""A Probability Distribution that supports smoothing for unknown outcomes (keys).
The default_value represents the probability of an unknown (previously unseen) key.
The key `None` stands for unknown outcomes."""
def __init__(self, default_value, mapping=(), **kwargs):
self[None] = default_value
self.update(mapping, **kwargs)
normalize(self)

def __missing__(self, key): return self[None]
```

```python
import re

def words(text): return re.findall(r'\w+', text.lower())

english = words('''This is a sample corpus of English prose. To get a better model, we would train on much
more text. But this should give you an idea of the process. So far we have dealt with discrete
distributions where we know all the possible outcomes in advance. For Boolean variables, the only
outcomes are T and F. For Fever, we modeled exactly three outcomes. However, in some applications we
will encounter new, previously unknown outcomes over time. For example, when we could train a model on the
words in this text, we get a distribution, but somebody could coin a brand new word. To deal with this,
we introduce the DefaultProbDist distribution, which uses the key `None` to stand as a placeholder for any
unknown outcomes. Probability theory allows us to compute the likelihood of certain events, given
assumptions about the components of the event. A Bayesian network, or Bayes net for short, is a data
structure to represent a joint probability distribution over several random variables, and do inference on it.''')

E = DefaultProbDist(0.1, Counter(english))
```

```python
# 'the' is a common word:
E['the']
```

Output:
```text
0.052295177222545036
```

```python
# 'possible' is a less-common word:
E['possible']
```

Output:
```text
0.005810575246949448
```

```python
# 'impossible' was not seen in the training data, but still gets a non-zero probability ...
E['impossible']
```

Output:
```text
0.0005810575246949449
```

```python
# ... as do other rare, previously unseen words:
E['llanfairpwllgwyngyll']
```

Output:
```text
0.0005810575246949449
```

Note that this does not mean that 'impossible' and 'llanfairpwllgwyngyll' and all the other unknown words
*each* have probability 0.004.
Rather, it means that together, all the unknown words total probability 0.004. With that
interpretation, the sum of all the probabilities is still 1, as it should be. In the `DefaultProbDist`, the
unknown words are all represented by the key `None`:

```python
E[None]
```

Output:
```text
0.0005810575246949449
```
