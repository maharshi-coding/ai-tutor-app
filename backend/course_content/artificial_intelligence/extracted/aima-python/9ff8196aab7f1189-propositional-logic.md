# Propositional Logic

Source: AIMA Python
Original URL: https://github.com/aimacode/aima-python/blob/HEAD/improving_sat_algorithms.ipynb
Original Path: improving_sat_algorithms.ipynb
Course: Artificial Intelligence

# Propositional Logic
# Improving Boolean Satisfiability Algorithms

## Introduction
A propositional formula $\Phi$ in *Conjunctive Normal Form* (CNF) is a conjunction of clauses $\omega_j$, with $j \in \{1,...,m\}$. Each clause being a disjunction of literals and each literal being either a positive ($x_i$) or a negative ($\lnot{x_i}$) propositional variable, with $i \in \{1,...,n\}$. By denoting with $[\lnot]$ the possible presence of $\lnot$, we can formally define $\Phi$ as:

$$\bigwedge_{j = 1,...,m}\bigg(\bigvee_{i \in \omega_j} [\lnot] x_i\bigg)$$

The ***Boolean Satisfiability Problem*** (SAT) consists in determining whether there exists a truth assignment in $\{0, 1\}$ (or equivalently in $\{True,False\}$) for the variables in $\Phi$.

```python
from logic import *
```

## DPLL with Branching Heuristics
The ***Davis-Putnam-Logemann-Loveland*** (DPLL) algorithm is a *complete* (will answer SAT if a solution exists) and *sound* (it will not answer SAT for an unsatisfiable formula) procedue that combines *backtracking search* and *deduction* to decide satisfiability of propositional logic formula in CNF. At each search step a variable and a propositional value are selected for branching purposes. With each branching step, two values can be assigned to a variable, either 0 or 1. Branching corresponds to assigning the chosen value to the chosen variable. Afterwards, the logical consequences of each branching step are evaluated. Each time an unsatisfied clause (ie a *conflict*) is identified, backtracking is executed. Backtracking corresponds to undoing branching steps until an unflipped branch is reached. When both values have been assigned to the selected variable at a branching step, backtracking will undo this branching step. If for the first branching step both values have been considered, and backtracking undoes this first branching step, then the CNF formula can be declared unsatisfiable. This kind of backtracking is called *chronological backtracking*.

Essentially, `DPLL` is a backtracking depth-first search through partial truth assignments which uses a *splitting rule* to replaces the original problem with two smaller subproblems, whereas the original Davis-Putnam procedure uses a variable elimination rule which replaces the original problem with one larger subproblem. Over the years, many heuristics have been proposed in choosing the splitting variable (which variable should be assigned a truth value next).

Search algorithms that are based on a predetermined order of search are called static algorithms, whereas the ones that select them at the runtime are called dynamic. The first SAT search algorithm, the Davis-Putnam procedure is a static algorithm. Static search algorithms are usually very slow in practice and for this reason perform worse than dynamic search algorithms. However, dynamic search algorithms are much harder to design, since they require a heuristic for predetermining the order of search. The fundamental element of a heuristic is a branching strategy for selecting the next branching literal. This must not require a lot of time to compute and yet it must provide a powerful insight into the problem instance.

Two basic heuristics are applied to this algorithm with the potential of cutting the search space in half. These are the *pure literal rule* and the *unit clause rule*.
- the *pure literal* rule is applied whenever a variable appears with a single polarity in all the unsatisfied clauses. In this case, assigning a truth value to the variable so that all the involved clauses are satisfied is highly effective in the search;
- if some variable occurs in the current formula in a clause of length 1 then the *unit clause* rule is applied. Here, the literal is selected and a truth value so the respective clause is satisfied is assigned. The iterative application of the unit rule is commonly reffered to as *Boolean Constraint Propagation* (BCP).

```python
%psource dpll_satisfiable
```

Output:
```text
[0;32mdef[0m [0mdpll_satisfiable[0m[0;34m([0m[0ms[0m[0;34m,[0m [0mbranching_heuristic[0m[0;34m=[0m[0mno_branching_heuristic[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""Check satisfiability of a propositional sentence.[0m
[0;34m This differs from the book code in two ways: (1) it returns a model[0m
[0;34m rather than True when it succeeds; this is more useful. (2) The[0m
[0;34m function find_pure_symbol is passed a list of unknown clauses, rather[0m
[0;34m than a list of all clauses and the model; this is more efficient.[0m
[0;34m >>> dpll_satisfiable(A |'<=>'| B) == {A: True, B: True}[0m
[0;34m True[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mdpll[0m[0;34m([0m[0mconjuncts[0m[0;34m([0m[0mto_cnf[0m[0;34m([0m[0ms[0m[0;34m)[0m[0;34m)[0m[0;34m,[0m [0mprop_symbols[0m[0;34m([0m[0ms[0m[0;34m)[0m[0;34m,[0m [0;34m{[0m[0;34m}[0m[0;34m,[0m [0mbranching_heuristic[0m[0;34m)[0m[0;34m[0m[0;34m[0m[0m
```

```python
%psource dpll
```

Output:
```text
[0;32mdef[0m [0mdpll[0m[0;34m([0m[0mclauses[0m[0;34m,[0m [0msymbols[0m[0;34m,[0m [0mmodel[0m[0;34m,[0m [0mbranching_heuristic[0m[0;34m=[0m[0mno_branching_heuristic[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""See if the clauses are true in a partial model."""[0m[0;34m[0m
[0;34m[0m [0munknown_clauses[0m [0;34m=[0m [0;34m[[0m[0;34m][0m [0;31m# clauses with an unknown truth value[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mclauses[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mval[0m [0;34m=[0m [0mpl_true[0m[0;34m([0m[0mc[0m[0;34m,[0m [0mmodel[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0mval[0m [0;32mis[0m [0;32mFalse[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0;32mFalse[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0mval[0m [0;32mis[0m [0;32mNone[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0munknown_clauses[0m[0;34m.[0m[0mappend[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0;32mnot[0m [0munknown_clauses[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mmodel[0m[0;34m[0m
[0;34m[0m [0mP[0m[0;34m,[0m [0mvalue[0m [0;34m=[0m [0mfind_pure_symbol[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0munknown_clauses[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0mP[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mdpll[0m[0;34m([0m[0mclauses[0m[0;34m,[0m [0mremove_all[0m[0;34m([0m[0mP[0m[0;34m,[0m [0msymb
```

Each of these branching heuristics was applied only after the *pure literal* and the *unit clause* heuristic failed in selecting a splitting variable.

### MOMs

MOMs heuristics are simple, efficient and easy to implement. The goal of these heuristics is to prefer the literal having ***Maximum number of Occurences in the Minimum length clauses***. Intuitively, the literals belonging to the minimum length clauses are the most constrained literals in the formula. Branching on them will maximize the effect of BCP and the likelihood of hitting a dead end early in the search tree (for unsatisfiable problems). Conversely, in the case of satisfiable formulas, branching on a highly constrained variable early in the tree will also increase the likelihood of a correct assignment of the remained open literals.
The MOMs heuristics main disadvatage is that their effectiveness highly depends on the problem instance. It is easy to see that the ideal setting for these heuristics is considering the unsatisfied binary clauses.

```python
%psource min_clauses
```

Output:
```text
[0;32mdef[0m [0mmin_clauses[0m[0;34m([0m[0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mmin_len[0m [0;34m=[0m [0mmin[0m[0;34m([0m[0mmap[0m[0;34m([0m[0;32mlambda[0m [0mc[0m[0;34m:[0m [0mlen[0m[0;34m([0m[0mc[0m[0;34m.[0m[0margs[0m[0;34m)[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m,[0m [0mdefault[0m[0;34m=[0m[0;36m2[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mfilter[0m[0;34m([0m[0;32mlambda[0m [0mc[0m[0;34m:[0m [0mlen[0m[0;34m([0m[0mc[0m[0;34m.[0m[0margs[0m[0;34m)[0m [0;34m==[0m [0;34m([0m[0mmin_len[0m [0;32mif[0m [0mmin_len[0m [0;34m>[0m [0;36m1[0m [0;32melse[0m [0;36m2[0m[0;34m)[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m[0m[0;34m[0m[0m
```

```python
%psource moms
```

Output:
```text
[0;32mdef[0m [0mmoms[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m MOMS (Maximum Occurrence in clauses of Minimum Size) heuristic[0m
[0;34m Returns the literal with the most occurrences in all clauses of minimum size[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0ml[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mmin_clauses[0m[0;34m([0m[0mclauses[0m[0;34m)[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mprop_symbols[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m,[0m [0;32mTrue[0m[0;34m[0m[0;34m[0m[0m
```

Over the years, many types of MOMs heuristics have been proposed.

***MOMSf*** choose the variable $x$ with a maximize the function:

$$[f(x) + f(\lnot{x})] * 2^k + f(x) * f(\lnot{x})$$

where $f(x)$ is the number of occurrences of $x$ in the smallest unknown clauses, k is a parameter.

```python
%psource momsf
```

Output:
```text
[0;32mdef[0m [0mmomsf[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mclauses[0m[0;34m,[0m [0mk[0m[0;34m=[0m[0;36m0[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m MOMS alternative heuristic[0m
[0;34m If f(x) the number of occurrences of the variable x in clauses with minimum size,[0m
[0;34m we choose the variable maximizing [f(x) + f(-x)] * 2^k + f(x) * f(-x)[0m
[0;34m Returns x if f(x) >= f(-x) otherwise -x[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0ml[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mmin_clauses[0m[0;34m([0m[0mclauses[0m[0;34m)[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mdisjuncts[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mP[0m [0;34m=[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m[0;34m[0m
[0;34m[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0;34m([0m[0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m [0;34m+[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0msymbol[0m[0;34m][0m[0;34m)[0m [0;34m*[0m [0mpow[0m[0;34m([0m[0;36m2[0m[0;34m,[0m [0mk[0m[0;34m)[0m [0;34m+[0m [0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m [0;34m*[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mP[0m[0;34m,[0m [0;32mTrue[0m [0;32mif[0m [0mscores[0m[0;34m[[0m[0mP[0m[0;34m][0m [0;34m>=[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0mP[0m[0;34m][0m [
```

***Freeman’s POSIT*** <a name="ref-1"/>[[1]](#cite-freeman1995improvements) version counts both the number of positive $x$ and negative $\lnot{x}$ occurrences of a given variable $x$.

```python
%psource posit
```

Output:
```text
[0;32mdef[0m [0mposit[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m Freeman's POSIT version of MOMs[0m
[0;34m Counts the positive x and negative x for each variable x in clauses with minimum size[0m
[0;34m Returns x if f(x) >= f(-x) otherwise -x[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0ml[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mmin_clauses[0m[0;34m([0m[0mclauses[0m[0;34m)[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mdisjuncts[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mP[0m [0;34m=[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m [0;34m+[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mP[0m[0;34m,[0m [0;32mTrue[0m [0;32mif[0m [0mscores[0m[0;34m[[0m[0mP[0m[0;34m][0m [0;34m>=[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0mP[0m[0;34m][0m [0;32melse[0m [0;32mFalse[0m[0;34m[0m[0;34m[0m[0m
```

***Zabih and McAllester’s*** <a name="ref-2"/>[[2]](#cite-zabih1988rearrangement) version of the heuristic counts the negative occurrences $\lnot{x}$ of each given variable $x$.

```python
%psource zm
```

Output:
```text
[0;32mdef[0m [0mzm[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m Zabih and McAllester's version of MOMs[0m
[0;34m Counts the negative occurrences only of each variable x in clauses with minimum size[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0ml[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mmin_clauses[0m[0;34m([0m[0mclauses[0m[0;34m)[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mdisjuncts[0m[0;34m([0m[0mc[0m[0;34m)[0m [0;32mif[0m [0ml[0m[0;34m.[0m[0mop[0m [0;34m==[0m [0;34m'~'[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m,[0m [0;32mTrue[0m[0;34m[0m[0;34m[0m[0m
```

### DLIS & DLCS

Literal count heuristics count the number of unresolved clauses in which a given variable $x$ appears as a positive literal, $C_P$ , and as negative literal, $C_N$. These two numbers an either be onsidered individually or ombined.

***Dynamic Largest Individual Sum*** heuristic considers the values $C_P$ and $C_N$ separately: select the variable with the largest individual value and assign to it value true if $C_P \geq C_N$, value false otherwise.

```python
%psource dlis
```

Output:
```text
[0;32mdef[0m [0mdlis[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m DLIS (Dynamic Largest Individual Sum) heuristic[0m
[0;34m Choose the variable and value that satisfies the maximum number of unsatisfied clauses[0m
[0;34m Like DLCS but we only consider the literal (thus Cp and Cn are individual)[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0ml[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mclauses[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mdisjuncts[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mP[0m [0;34m=[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mP[0m[0;34m,[0m [0;32mTrue[0m [0;32mif[0m [0mscores[0m[0;34m[[0m[0mP[0m[0;34m][0m [0;34m>=[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0mP[0m[0;34m][0m [0;32melse[0m [0;32mFalse[0m[0;34m[0m[0;34m[0m[0m
```

***Dynamic Largest Combined Sum*** considers the values $C_P$ and $C_N$ combined: select the variable with the largest sum $C_P + C_N$ and assign to it value true if $C_P \geq C_N$, value false otherwise.

```python
%psource dlcs
```

Output:
```text
[0;32mdef[0m [0mdlcs[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m DLCS (Dynamic Largest Combined Sum) heuristic[0m
[0;34m Cp the number of clauses containing literal x[0m
[0;34m Cn the number of clauses containing literal -x[0m
[0;34m Here we select the variable maximizing Cp + Cn[0m
[0;34m Returns x if Cp >= Cn otherwise -x[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0ml[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mclauses[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mdisjuncts[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mP[0m [0;34m=[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m [0;34m+[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mP[0m[0;34m,[0m [0;32mTrue[0m [0;32mif[0m [0mscores[0m[0;34m[[0m[0mP[0m[0;34m][0m [0;34m>=[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0mP[0m[0;34m][0m [0;32melse[0m [0;32mFalse[0m[0;34m[0m[0;34m[0m[0m
```

### JW & JW2

Two branching heuristics were proposed by ***Jeroslow and Wang*** in <a name="ref-3"/>[[3]](#cite-jeroslow1990solving).

The *one-sided Jeroslow and Wang*’s heuristic compute:

$$J(l) = \sum_{l \in \omega \land \omega \in \phi} 2^{-|\omega|}$$

and selects the assignment that satisfies the literal with the largest value $J(l)$.

```python
%psource jw
```

Output:
```text
[0;32mdef[0m [0mjw[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m Jeroslow-Wang heuristic[0m
[0;34m For each literal compute J(l) = \sum{l in clause c} 2^{-|c|}[0m
[0;34m Return the literal maximizing J[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mclauses[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mprop_symbols[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mscores[0m[0;34m[[0m[0ml[0m[0;34m][0m [0;34m+=[0m [0mpow[0m[0;34m([0m[0;36m2[0m[0;34m,[0m [0;34m-[0m[0mlen[0m[0;34m([0m[0mc[0m[0;34m.[0m[0margs[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m,[0m [0;32mTrue[0m[0;34m[0m[0;34m[0m[0m
```

The *two-sided Jeroslow and Wang*’s heuristic identifies the variable $x$ with the largest sum $J(x) + J(\lnot{x})$, and assigns to $x$ value true, if $J(x) \geq J(\lnot{x})$, and value false otherwise.

```python
%psource jw2
```

Output:
```text
[0;32mdef[0m [0mjw2[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m Two Sided Jeroslow-Wang heuristic[0m
[0;34m Compute J(l) also counts the negation of l = J(x) + J(-x)[0m
[0;34m Returns x if J(x) >= J(-x) otherwise -x[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mclauses[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mdisjuncts[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mscores[0m[0;34m[[0m[0ml[0m[0;34m][0m [0;34m+=[0m [0mpow[0m[0;34m([0m[0;36m2[0m[0;34m,[0m [0;34m-[0m[0mlen[0m[0;34m([0m[0mc[0m[0;34m.[0m[0margs[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mP[0m [0;34m=[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m [0;34m+[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mP[0m[0;34m,[0m [0;32mTrue[0m [0;32mif[0m [0mscores[0m[0;34m[[0m[0mP[0m[0;34m][0m [0;34m>=[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0mP[0m[0;34m][0m [0;32melse[0m [0;32mFalse[0m[0;34m[0m[0;34m[0m[0m
```

## CDCL with 1UIP Learning Scheme, 2WL Lazy Data Structure, VSIDS Branching Heuristic & Restarts

The ***Conflict-Driven Clause Learning*** (CDCL) solver is an evolution of the *DPLL* algorithm that involves a number of additional key techniques:

- non-chronological backtracking or *backjumping*;
- *learning* new *clauses* from conflicts during search by exploiting its structure;
- using *lazy data structures* for storing clauses;
- *branching heuristics* with low computational overhead and which receive feedback from search;
- periodically *restarting* search.

The first difference between a DPLL solver and a CDCL solver is the introduction of the *non-chronological backtracking* or *backjumping* when a conflict is identified. This requires an iterative implementation of the algorithm because only if the backtrack stack is managed explicitly it is possible to backtrack more than one level.

```python
%psource cdcl_satisfiable
```

Output:
```text
[0;32mdef[0m [0mcdcl_satisfiable[0m[0;34m([0m[0ms[0m[0;34m,[0m [0mvsids_decay[0m[0;34m=[0m[0;36m0.95[0m[0;34m,[0m [0mrestart_strategy[0m[0;34m=[0m[0mno_restart[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;34m"""[0m
[0;34m >>> cdcl_satisfiable(A |'<=>'| B) == {A: True, B: True}[0m
[0;34m True[0m
[0;34m """[0m[0;34m[0m
[0;34m[0m [0mclauses[0m [0;34m=[0m [0mTwoWLClauseDatabase[0m[0;34m([0m[0mconjuncts[0m[0;34m([0m[0mto_cnf[0m[0;34m([0m[0ms[0m[0;34m)[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0msymbols[0m [0;34m=[0m [0mprop_symbols[0m[0;34m([0m[0ms[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mscores[0m [0;34m=[0m [0mCounter[0m[0;34m([0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mG[0m [0;34m=[0m [0mnx[0m[0;34m.[0m[0mDiGraph[0m[0;34m([0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mmodel[0m [0;34m=[0m [0;34m{[0m[0;34m}[0m[0;34m[0m
[0;34m[0m [0mdl[0m [0;34m=[0m [0;36m0[0m[0;34m[0m
[0;34m[0m [0mconflicts[0m [0;34m=[0m [0;36m0[0m[0;34m[0m
[0;34m[0m [0mrestarts[0m [0;34m=[0m [0;36m1[0m[0;34m[0m
[0;34m[0m [0msum_lbd[0m [0;34m=[0m [0;36m0[0m[0;34m[0m
[0;34m[0m [0mqueue_lbd[0m [0;34m=[0m [0;34m[[0m[0;34m][0m[0;34m[0m
[0;34m[0m [0;32mwhile[0m [0;32mTrue[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mconflict[0m [0;34m=[0m [0munit_propagation[0m[0;34m([0m[0mclauses[0m[0;34m,[0m [0msymbols[0m[0;34m,[0m [0mmodel[0m[0;34m,[0m [0mG[0m[0;34m,[0m [0mdl[0m[0;34m)[0m[0;34
```

### Clause Learning with 1UIP Scheme

The second important difference between a DPLL solver and a CDCL solver is that the information about a conflict is reused by learning: if a conflicting clause is found, the solver derive a new clause from the conflict and add it to the clauses database.

Whenever a conflict is identified due to unit propagation, a conflict analysis procedure is invoked. As a result, one or more new clauses are learnt, and a backtracking decision level is computed. The conflict analysis procedure analyzes the structure of unit propagation and decides which literals to include in the learnt clause. The decision levels associated with assigned variables define a partial order of the variables. Starting from a given unsatisfied clause (represented in the implication graph with vertex $\kappa$), the conflict analysis procedure visits variables implied at the most recent decision level (ie the current largest decision level), identifies the antecedents of visited variables, and keeps from the antecedents the literals assigned at decision levels less than the most recent decision level. The clause learning procedure used in the CDCL can be defined by a sequence of selective resolution operations, that at each step yields a new temporary clause. This process is repeated until the most recent decision variable is visited.

The structure of implied assignments induced by unit propagation is a key aspect of the clause learning procedure. Moreover, the idea of exploiting the structure induced by unit propagation was further exploited with ***Unit Implication Points*** (UIPs). A UIP is a *dominator* in the implication graph and represents an alternative decision assignment at the current decision level that results in the same conflict. The main motivation for identifying UIPs is to reduce the size of learnt clauses. Clause learning could potentially stop at any UIP, being quite straightforward to conclude that the set of literals of a clause learnt at the first UIP has clear advantages. Considering the largest decision level of the literals of the clause learnt at each UIP, the clause learnt at the first UIP is guaranteed to contain the smallest one. This guarantees the highest backtrack jump in the search tree.

```python
%psource conflict_analysis
```

Output:
```text
[0;32mdef[0m [0mconflict_analysis[0m[0;34m([0m[0mG[0m[0;34m,[0m [0mdl[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mconflict_clause[0m [0;34m=[0m [0mnext[0m[0;34m([0m[0mG[0m[0;34m[[0m[0mp[0m[0;34m][0m[0;34m[[0m[0;34m'K'[0m[0;34m][0m[0;34m[[0m[0;34m'antecedent'[0m[0;34m][0m [0;32mfor[0m [0mp[0m [0;32min[0m [0mG[0m[0;34m.[0m[0mpred[0m[0;34m[[0m[0;34m'K'[0m[0;34m][0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mP[0m [0;34m=[0m [0mnext[0m[0;34m([0m[0mnode[0m [0;32mfor[0m [0mnode[0m [0;32min[0m [0mG[0m[0;34m.[0m[0mnodes[0m[0;34m([0m[0;34m)[0m [0;34m-[0m [0;34m'K'[0m [0;32mif[0m [0mG[0m[0;34m.[0m[0mnodes[0m[0;34m[[0m[0mnode[0m[0;34m][0m[0;34m[[0m[0;34m'dl'[0m[0;34m][0m [0;34m==[0m [0mdl[0m [0;32mand[0m [0mG[0m[0;34m.[0m[0min_degree[0m[0;34m([0m[0mnode[0m[0;34m)[0m [0;34m==[0m [0;36m0[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mfirst_uip[0m [0;34m=[0m [0mnx[0m[0;34m.[0m[0mimmediate_dominators[0m[0;34m([0m[0mG[0m[0;34m,[0m [0mP[0m[0;34m)[0m[0;34m[[0m[0;34m'K'[0m[0;34m][0m[0;34m[0m
[0;34m[0m [0mG[0m[0;34m.[0m[0mremove_node[0m[0;34m([0m[0;34m'K'[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mconflict_side[0m [0;34m=[0m [0mnx[0m[0;34m.[0m[0mdescendants[0m[0;34m([0m[0mG[0m[0;34m,[0m [0mfirst_uip[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mwhile[0m [0;32mTrue[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0ml[0m [0;32min[0m [0mprop_symbols[0m[0;34m([0m[0mconflict_cla
```

```python
%psource pl_binary_resolution
```

Output:
```text
[0;32mdef[0m [0mpl_binary_resolution[0m[0;34m([0m[0mci[0m[0;34m,[0m [0mcj[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0mdi[0m [0;32min[0m [0mdisjuncts[0m[0;34m([0m[0mci[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0mdj[0m [0;32min[0m [0mdisjuncts[0m[0;34m([0m[0mcj[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0mdi[0m [0;34m==[0m [0;34m~[0m[0mdj[0m [0;32mor[0m [0;34m~[0m[0mdi[0m [0;34m==[0m [0mdj[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mpl_binary_resolution[0m[0;34m([0m[0massociate[0m[0;34m([0m[0;34m'|'[0m[0;34m,[0m [0mremove_all[0m[0;34m([0m[0mdi[0m[0;34m,[0m [0mdisjuncts[0m[0;34m([0m[0mci[0m[0;34m)[0m[0;34m)[0m[0;34m)[0m[0;34m,[0m[0;34m[0m
[0;34m[0m [0massociate[0m[0;34m([0m[0;34m'|'[0m[0;34m,[0m [0mremove_all[0m[0;34m([0m[0mdj[0m[0;34m,[0m [0mdisjuncts[0m[0;34m([0m[0mcj[0m[0;34m)[0m[0;34m)[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0massociate[0m[0;34m([0m[0;34m'|'[0m[0;34m,[0m [0munique[0m[0;34m([0m[0mdisjuncts[0m[0;34m([0m[0mci[0m[0;34m)[0m [0;34m+[0m [0mdisjuncts[0m[0;34m([0m[0mcj[0m[0;34m)[0m[0;34m)[0m[0;34m)[0m[0;34m[0m[0;34m[0m[0m
```

```python
%psource backjump
```

Output:
```text
[0;32mdef[0m [0mbackjump[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mmodel[0m[0;34m,[0m [0mG[0m[0;34m,[0m [0mdl[0m[0;34m=[0m[0;36m0[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mdelete[0m [0;34m=[0m [0;34m{[0m[0mnode[0m [0;32mfor[0m [0mnode[0m [0;32min[0m [0mG[0m[0;34m.[0m[0mnodes[0m[0;34m([0m[0;34m)[0m [0;32mif[0m [0mG[0m[0;34m.[0m[0mnodes[0m[0;34m[[0m[0mnode[0m[0;34m][0m[0;34m[[0m[0;34m'dl'[0m[0;34m][0m [0;34m>[0m [0mdl[0m[0;34m}[0m[0;34m[0m
[0;34m[0m [0mG[0m[0;34m.[0m[0mremove_nodes_from[0m[0;34m([0m[0mdelete[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0mnode[0m [0;32min[0m [0mdelete[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mdel[0m [0mmodel[0m[0;34m[[0m[0mnode[0m[0;34m][0m[0;34m[0m
[0;34m[0m [0msymbols[0m [0;34m|=[0m [0mdelete[0m[0;34m[0m[0;34m[0m[0m
```

### 2WL Lazy Data Structure

Implementation issues for SAT solvers include the design of suitable data structures for storing clauses. The implemented data structures dictate the way BCP are implemented and have a significant impact on the run time performance of the SAT solver. Recent state-of-the-art SAT solvers are characterized by using very efficient data structures, intended to reduce the CPU time required per each node in the search tree. Conversely, traditional SAT data structures are accurate, meaning that is possible to know exactly the value of each literal in the clause. Examples of the most recent SAT data structures, which are not accurate and therefore are called lazy, include the watched literals used in Chaff .

The more recent Chaff SAT solver <a name="ref-4"/>[[4]](#cite-moskewicz2001chaff) proposed a new data structure, the ***2 Watched Literals*** (2WL), in which two references are associated with each clause. There is no order relation between the two references, allowing the references to move in any direction. The lack of order between the two references has the key advantage that no literal references need to be updated when backtracking takes place. In contrast, unit or unsatisfied clauses are identified only after traversing all the clauses’ literals; a clear drawback. The two watched literal pointers are undifferentiated as there is no order relation. Again, each time one literal pointed by one of these pointers is assigned, the pointer has to move inwards. These pointers may move in both directions. This causes the whole clause to be traversed when the clause becomes unit. In addition, no references have to be kept to the just assigned literals, since pointers do not move when backtracking.

```python
%psource unit_propagation
```

Output:
```text
[0;32mdef[0m [0munit_propagation[0m[0;34m([0m[0mclauses[0m[0;34m,[0m [0msymbols[0m[0;34m,[0m [0mmodel[0m[0;34m,[0m [0mG[0m[0;34m,[0m [0mdl[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mdef[0m [0mcheck[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0;32mnot[0m [0mmodel[0m [0;32mor[0m [0mclauses[0m[0;34m.[0m[0mget_first_watched[0m[0;34m([0m[0mc[0m[0;34m)[0m [0;34m==[0m [0mclauses[0m[0;34m.[0m[0mget_second_watched[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0;32mTrue[0m[0;34m[0m
[0;34m[0m [0mw1[0m[0;34m,[0m [0m_[0m [0;34m=[0m [0minspect_literal[0m[0;34m([0m[0mclauses[0m[0;34m.[0m[0mget_first_watched[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0mw1[0m [0;32min[0m [0mmodel[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mc[0m [0;32min[0m [0;34m([0m[0mclauses[0m[0;34m.[0m[0mget_neg_watched[0m[0;34m([0m[0mw1[0m[0;34m)[0m [0;32mif[0m [0mmodel[0m[0;34m[[0m[0mw1[0m[0;34m][0m [0;32melse[0m [0mclauses[0m[0;34m.[0m[0mget_pos_watched[0m[0;34m([0m[0mw1[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mw2[0m[0;34m,[0m [0m_[0m [0;34m=[0m [0minspect_literal[0m[0;34m([0m[0mclauses[0m[0;34m.[0m[0mget_second_watched[0m[0;34m([0m[0mc[0m[0;34m)[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0mw2[0m [0;32min[0m [0mmodel[0m[0;34m:[0m
```

```python
%psource TwoWLClauseDatabase
```

Output:
```text
[0;32mclass[0m [0mTwoWLClauseDatabase[0m[0;34m:[0m[0;34m[0m
[0;34m[0m[0;34m[0m
[0;34m[0m [0;32mdef[0m [0m__init__[0m[0;34m([0m[0mself[0m[0;34m,[0m [0mclauses[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mself[0m[0;34m.[0m[0m__twl[0m [0;34m=[0m [0;34m{[0m[0;34m}[0m[0;34m[0m
[0;34m[0m [0mself[0m[0;34m.[0m[0m__watch_list[0m [0;34m=[0m [0mdefaultdict[0m[0;34m([0m[0;32mlambda[0m[0;34m:[0m [0;34m[[0m[0mset[0m[0;34m([0m[0;34m)[0m[0;34m,[0m [0mset[0m[0;34m([0m[0;34m)[0m[0;34m][0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32mfor[0m [0mc[0m [0;32min[0m [0mclauses[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mself[0m[0;34m.[0m[0madd[0m[0;34m([0m[0mc[0m[0;34m,[0m [0;32mNone[0m[0;34m)[0m[0;34m[0m
[0;34m[0m[0;34m[0m
[0;34m[0m [0;32mdef[0m [0mget_clauses[0m[0;34m([0m[0mself[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mself[0m[0;34m.[0m[0m__twl[0m[0;34m.[0m[0mkeys[0m[0;34m([0m[0;34m)[0m[0;34m[0m
[0;34m[0m[0;34m[0m
[0;34m[0m [0;32mdef[0m [0mset_first_watched[0m[0;34m([0m[0mself[0m[0;34m,[0m [0mclause[0m[0;34m,[0m [0mnew_watching[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0mlen[0m[0;34m([0m[0mclause[0m[0;34m.[0m[0margs[0m[0;34m)[0m [0;34m>[0m [0;36m2[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mself[0m[0;34m.[0m[0m__twl[0m[0;34m[[0m[0mclause[0m[0;34m][0m[0;34m[[0m[0;36m0[0m[0;34m][0m [0;34m=[0m [0m
```

### VSIDS Branching Heuristic

The early branching heuristics made use of all the information available from the data structures, namely the number of satisfied, unsatisfied and unassigned literals. These heuristics are updated during the search and also take into account the clauses that are learnt.

More recently, a different kind of variable selection heuristic, referred to as ***Variable State Independent Decaying Sum*** (VSIDS), has been proposed by Chaff authors in <a name="ref-4"/>[[4]](#cite-moskewicz2001chaff). One of the reasons for proposing this new heuristic was the introduction of lazy data structures, where the knowledge of the dynamic size of a clause is not accurate. Hence, the heuristics described above cannot be used. VSIDS selects the literal that appears most frequently over all the clauses, which means that one counter is required for each one of the literals. Initially, all counters are set to zero. During the search, the metrics only have to be updated when a new recorded clause is created. More than to develop an accurate heuristic, the motivation has been to design a fast (but dynamically adapting) heuristic. In fact, one of the key properties of this strategy is the very low overhead, due to being independent of the variable state.

```python
%psource assign_decision_literal
```

Output:
```text
[0;32mdef[0m [0massign_decision_literal[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mmodel[0m[0;34m,[0m [0mscores[0m[0;34m,[0m [0mG[0m[0;34m,[0m [0mdl[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mP[0m [0;34m=[0m [0mmax[0m[0;34m([0m[0msymbols[0m[0;34m,[0m [0mkey[0m[0;34m=[0m[0;32mlambda[0m [0msymbol[0m[0;34m:[0m [0mscores[0m[0;34m[[0m[0msymbol[0m[0;34m][0m [0;34m+[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0msymbol[0m[0;34m][0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mvalue[0m [0;34m=[0m [0;32mTrue[0m [0;32mif[0m [0mscores[0m[0;34m[[0m[0mP[0m[0;34m][0m [0;34m>=[0m [0mscores[0m[0;34m[[0m[0;34m~[0m[0mP[0m[0;34m][0m [0;32melse[0m [0;32mFalse[0m[0;34m[0m
[0;34m[0m [0msymbols[0m[0;34m.[0m[0mremove[0m[0;34m([0m[0mP[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mmodel[0m[0;34m[[0m[0mP[0m[0;34m][0m [0;34m=[0m [0mvalue[0m[0;34m[0m
[0;34m[0m [0mG[0m[0;34m.[0m[0madd_node[0m[0;34m([0m[0mP[0m[0;34m,[0m [0mval[0m[0;34m=[0m[0mvalue[0m[0;34m,[0m [0mdl[0m[0;34m=[0m[0mdl[0m[0;34m)[0m[0;34m[0m[0;34m[0m[0m
```

### Restarts

Solving NP-complete problems, such as SAT, naturally leads to heavy-tailed run times. To deal with this, SAT solvers frequently restart their search to avoid the runs that take disproportionately longer. What restarting here means is that the solver unsets all variables and starts the search using different variable assignment order.

While at first glance it might seem that restarts should be rare and become rarer as the solving has been going on for longer, so that the SAT solver can actually finish solving the problem, the trend has been towards more aggressive (frequent) restarts.

The reason why frequent restarts help solve problems faster is that while the solver does forget all current variable assignments, it does keep some information, specifically it keeps learnt clauses, effectively sampling the search space, and it keeps the last assigned truth value of each variable, assigning them the same value the next time they are picked to be assigned.

#### Luby

In this strategy, the number of conflicts between 2 restarts is based on the *Luby* sequence. The *Luby* restart sequence is interesting in that it was proven to be optimal restart strategy for randomized search algorithms where the runs do not share information. While this is not true for SAT solving, as shown in <a name="ref-5"/>[[5]](cite-haim2014towards) and <a name="ref-6"/>[[6]](cite-huang2007effect), *Luby* restarts have been quite successful anyway.

The exact description of *Luby* restarts is that the $ith$ restart happens after $u \cdot Luby(i)$ conflicts, where $u$ is a constant and $Luby(i)$ is defined as:

$$Luby(i) = \begin{cases}
2^{k-1} & i = 2^k - 1 \\
Luby(i - 2^{k-1} + 1) & 2^{k-1} \leq i < 2^k - 1
\end{cases}
$$

A less exact but more intuitive description of the *Luby* sequence is that all numbers in it are powers of two, and after a number is seen for the second time, the next number is twice as big. The following are the first 16 numbers in the sequence:

$$ (1,1,2,1,1,2,4,1,1,2,1,1,2,4,8,1,...) $$

From the above, we can see that this restart strategy tends towards frequent restarts, but some runs are kept running for much longer, and there is no upper limit on the longest possible time between two restarts.

```python
%psource luby
```

Output:
```text
[0;32mdef[0m [0mluby[0m[0;34m([0m[0mconflicts[0m[0;34m,[0m [0mrestarts[0m[0;34m,[0m [0mqueue_lbd[0m[0;34m,[0m [0msum_lbd[0m[0;34m,[0m [0munit[0m[0;34m=[0m[0;36m512[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;31m# in the state-of-art tested with unit value 1, 2, 4, 6, 8, 12, 16, 32, 64, 128, 256 and 512[0m[0;34m[0m
[0;34m[0m [0;32mdef[0m [0m_luby[0m[0;34m([0m[0mi[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0mk[0m [0;34m=[0m [0;36m1[0m[0;34m[0m
[0;34m[0m [0;32mwhile[0m [0;32mTrue[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mif[0m [0mi[0m [0;34m==[0m [0;34m([0m[0;36m1[0m [0;34m<<[0m [0mk[0m[0;34m)[0m [0;34m-[0m [0;36m1[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0;36m1[0m [0;34m<<[0m [0;34m([0m[0mk[0m [0;34m-[0m [0;36m1[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0;32melif[0m [0;34m([0m[0;36m1[0m [0;34m<<[0m [0;34m([0m[0mk[0m [0;34m-[0m [0;36m1[0m[0;34m)[0m[0;34m)[0m [0;34m<=[0m [0mi[0m [0;34m<[0m [0;34m([0m[0;36m1[0m [0;34m<<[0m [0mk[0m[0;34m)[0m [0;34m-[0m [0;36m1[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0m_luby[0m[0;34m([0m[0mi[0m [0;34m-[0m [0;34m([0m[0;36m1[0m [0;34m<<[0m [0;34m([0m[0mk[0m [0;34m-[0m [0;36m1[0m[0;34m)[0m[0;34m)[0m [0;34m+[0m [0;36m1[0m[0;34m)[0m[0;34m[0m
[0;34m[0m [0mk[0m [0;34m+=[0m [0;36m1[0m[0;34m[0m
[0;34m[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0munit
```

#### Glucose

Glucose restarts were popularized by the *Glucose* solver, and it is an extremely aggressive, dynamic restart strategy. The idea behind it and described in <a name="ref-7"/>[[7]](cite-audemard2012refining) is that instead of waiting for a fixed amount of conflicts, we restart when the last couple of learnt clauses are, on average, bad.

A bit more precisely, if there were at least $X$ conflicts (and thus $X$ learnt clauses) since the last restart, and the average *Literal Block Distance* (LBD) (a criterion to evaluate the quality of learnt clauses as shown in <a name="ref-8"/>[[8]](#cite-audemard2009predicting) of the last $X$ learnt clauses was at least $K$ times higher than the average LBD of all learnt clauses, it is time for another restart. Parameters $X$ and $K$ can be tweaked to achieve different restart frequency, and they are usually kept quite small.

```python
%psource glucose
```

Output:
```text
[0;32mdef[0m [0mglucose[0m[0;34m([0m[0mconflicts[0m[0;34m,[0m [0mrestarts[0m[0;34m,[0m [0mqueue_lbd[0m[0;34m,[0m [0msum_lbd[0m[0;34m,[0m [0mx[0m[0;34m=[0m[0;36m100[0m[0;34m,[0m [0mk[0m[0;34m=[0m[0;36m0.7[0m[0;34m)[0m[0;34m:[0m[0;34m[0m
[0;34m[0m [0;31m# in the state-of-art tested with (x, k) as (50, 0.8) and (100, 0.7)[0m[0;34m[0m
[0;34m[0m [0;31m# if there were at least x conflicts since the last restart, and then the average LBD of the last[0m[0;34m[0m
[0;34m[0m [0;31m# x learnt clauses was at least k times higher than the average LBD of all learnt clauses[0m[0;34m[0m
[0;34m[0m [0;32mreturn[0m [0mlen[0m[0;34m([0m[0mqueue_lbd[0m[0;34m)[0m [0;34m>=[0m [0mx[0m [0;32mand[0m [0msum[0m[0;34m([0m[0mqueue_lbd[0m[0;34m)[0m [0;34m/[0m [0mlen[0m[0;34m([0m[0mqueue_lbd[0m[0;34m)[0m [0;34m*[0m [0mk[0m [0;34m>[0m [0msum_lbd[0m [0;34m/[0m [0mconflicts[0m[0;34m[0m[0;34m[0m[0m
```

## Experimental Results

```python
from csp import *
```

### Australia

#### CSP

```python
australia_csp = MapColoringCSP(list('RGB'), """SA: WA NT Q NSW V; NT: WA Q; NSW: Q V; T: """)
```

```python
%time _, checks = AC3b(australia_csp, arc_heuristic=dom_j_up)
f'AC3b with DOM J UP needs {checks} consistency-checks'
```

Output:
```text
CPU times: user 154 µs, sys: 37 µs, total: 191 µs
Wall time: 194 µs

'AC3b with DOM J UP needs 72 consistency-checks'
```

```python
%time backtracking_search(australia_csp, select_unassigned_variable=mrv, inference=forward_checking)
```

Output:
```text
CPU times: user 263 µs, sys: 0 ns, total: 263 µs
Wall time: 268 µs

{'Q': 'R', 'SA': 'G', 'NSW': 'B', 'NT': 'B', 'V': 'R', 'WA': 'R'}
```

#### SAT

```python
australia_sat = MapColoringSAT(list('RGB'), """SA: WA NT Q NSW V; NT: WA Q; NSW: Q V; T: """)
```

##### DPLL

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=no_branching_heuristic)
```

Output:
```text
CPU times: user 43.3 ms, sys: 0 ns, total: 43.3 ms
Wall time: 41.5 ms
```

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=moms)
```

Output:
```text
CPU times: user 36.4 ms, sys: 0 ns, total: 36.4 ms
Wall time: 35.3 ms
```

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=momsf)
```

Output:
```text
CPU times: user 36.1 ms, sys: 3.9 ms, total: 40 ms
Wall time: 39.2 ms
```

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=posit)
```

Output:
```text
CPU times: user 45.2 ms, sys: 0 ns, total: 45.2 ms
Wall time: 44.2 ms
```

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=zm)
```

Output:
```text
CPU times: user 31.2 ms, sys: 0 ns, total: 31.2 ms
Wall time: 30.5 ms
```

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=dlis)
```

Output:
```text
CPU times: user 57 ms, sys: 0 ns, total: 57 ms
Wall time: 55.9 ms
```

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=dlcs)
```

Output:
```text
CPU times: user 51.8 ms, sys: 0 ns, total: 51.8 ms
Wall time: 50.7 ms
```

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=jw)
```

Output:
```text
CPU times: user 40.6 ms, sys: 0 ns, total: 40.6 ms
Wall time: 39.3 ms
```

```python
%time model = dpll_satisfiable(australia_sat, branching_heuristic=jw2)
```

Output:
```text
CPU times: user 43.2 ms, sys: 1.81 ms, total: 45.1 ms
Wall time: 43.9 ms
```

##### CDCL

```python
%time model = cdcl_satisfiable(australia_sat)
```

Output:
```text
CPU times: user 32.9 ms, sys: 16 µs, total: 33 ms
Wall time: 31.6 ms
```

```python
{var for var, val in model.items() if val}
```

Output:
```text
{NSW_B, NT_B, Q_G, SA_R, V_G, WA_G}
```

### France

#### CSP

```python
france_csp = MapColoringCSP(list('RGBY'),
"""AL: LO FC; AQ: MP LI PC; AU: LI CE BO RA LR MP; BO: CE IF CA FC RA
AU; BR: NB PL; CA: IF PI LO FC BO; CE: PL NB NH IF BO AU LI PC; FC: BO
CA LO AL RA; IF: NH PI CA BO CE; LI: PC CE AU MP AQ; LO: CA AL FC; LR:
MP AU RA PA; MP: AQ LI AU LR; NB: NH CE PL BR; NH: PI IF CE NB; NO:
PI; PA: LR RA; PC: PL CE LI AQ; PI: NH NO CA IF; PL: BR NB CE PC; RA:
AU BO FC PA LR""")
```

```python
%time _, checks = AC3b(france_csp, arc_heuristic=dom_j_up)
f'AC3b with DOM J UP needs {checks} consistency-checks'
```

Output:
```text
CPU times: user 599 µs, sys: 112 µs, total: 711 µs
Wall time: 716 µs

'AC3b with DOM J UP needs 516 consistency-checks'
```

```python
%time backtracking_search(france_csp, select_unassigned_variable=mrv, inference=forward_checking)
```

Output:
```text
CPU times: user 560 µs, sys: 0 ns, total: 560 µs
Wall time: 563 µs

{'NH': 'R',
'NB': 'G',
'CE': 'B',
'PL': 'R',
'BR': 'B',
'IF': 'G',
'PI': 'B',
'BO': 'R',
'CA': 'Y',
'FC': 'G',
'LO': 'R',
'PC': 'G',
'AU': 'G',
'AL': 'B',
'RA': 'B',
'LR': 'R',
'LI': 'R',
'AQ': 'B',
'MP': 'Y',
'PA': 'G',
'NO': 'R'}
```

#### SAT

```python
france_sat = MapColoringSAT(list('RGBY'),
"""AL: LO FC; AQ: MP LI PC; AU: LI CE BO RA LR MP; BO: CE IF CA FC RA
AU; BR: NB PL; CA: IF PI LO FC BO; CE: PL NB NH IF BO AU LI PC; FC: BO
CA LO AL RA; IF: NH PI CA BO CE; LI: PC CE AU MP AQ; LO: CA AL FC; LR:
MP AU RA PA; MP: AQ LI AU LR; NB: NH CE PL BR; NH: PI IF CE NB; NO:
PI; PA: LR RA; PC: PL CE LI AQ; PI: NH NO CA IF; PL: BR NB CE PC; RA:
AU BO FC PA LR""")
```

##### DPLL

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=no_branching_heuristic)
```

Output:
```text
CPU times: user 3.32 s, sys: 0 ns, total: 3.32 s
Wall time: 3.32 s
```

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=moms)
```

Output:
```text
CPU times: user 3.17 s, sys: 390 µs, total: 3.17 s
Wall time: 3.17 s
```

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=momsf)
```

Output:
```text
CPU times: user 3.49 s, sys: 0 ns, total: 3.49 s
Wall time: 3.49 s
```

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=posit)
```

Output:
```text
CPU times: user 3.5 s, sys: 0 ns, total: 3.5 s
Wall time: 3.5 s
```

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=zm)
```

Output:
```text
CPU times: user 3 s, sys: 2.6 ms, total: 3.01 s
Wall time: 3.01 s
```

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=dlis)
```

Output:
```text
CPU times: user 12.5 s, sys: 11.4 ms, total: 12.5 s
Wall time: 12.5 s
```

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=dlcs)
```

Output:
```text
CPU times: user 3.41 s, sys: 0 ns, total: 3.41 s
Wall time: 3.41 s
```

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=jw)
```

Output:
```text
CPU times: user 2.92 s, sys: 3.89 ms, total: 2.92 s
Wall time: 2.92 s
```

```python
%time model = dpll_satisfiable(france_sat, branching_heuristic=jw2)
```

Output:
```text
CPU times: user 3.71 s, sys: 0 ns, total: 3.71 s
Wall time: 3.73 s
```

##### CDCL

```python
%time model = cdcl_satisfiable(france_sat)
```

Output:
```text
CPU times: user 159 ms, sys: 3.94 ms, total: 163 ms
Wall time: 162 ms
```

```python
{var for var, val in model.items() if val}
```

Output:
```text
{AL_G,
AQ_G,
AU_R,
BO_G,
BR_Y,
CA_R,
CE_B,
FC_B,
IF_Y,
LI_Y,
LO_Y,
LR_G,
MP_B,
NB_R,
NH_G,
NO_Y,
PA_B,
PC_R,
PI_B,
PL_G,
RA_Y}
```

### USA

#### CSP

```python
usa_csp = MapColoringCSP(list('RGBY'),
"""WA: OR ID; OR: ID NV CA; CA: NV AZ; NV: ID UT AZ; ID: MT WY UT;
UT: WY CO AZ; MT: ND SD WY; WY: SD NE CO; CO: NE KA OK NM; NM: OK TX AZ;
ND: MN SD; SD: MN IA NE; NE: IA MO KA; KA: MO OK; OK: MO AR TX;
TX: AR LA; MN: WI IA; IA: WI IL MO; MO: IL KY TN AR; AR: MS TN LA;
LA: MS; WI: MI IL; IL: IN KY; IN: OH KY; MS: TN AL; AL: TN GA FL;
MI: OH IN; OH: PA WV KY; KY: WV VA TN; TN: VA NC GA; GA: NC SC FL;
PA: NY NJ DE MD WV; WV: MD VA; VA: MD DC NC; NC: SC; NY: VT MA CT NJ;
NJ: DE; DE: MD; MD: DC; VT: NH MA; MA: NH RI CT; CT: RI; ME: NH;
HI: ; AK: """)
```

```python
%time _, checks = AC3b(usa_csp, arc_heuristic=dom_j_up)
f'AC3b with DOM J UP needs {checks} consistency-checks'
```

Output:
```text
CPU times: user 1.58 ms, sys: 17 µs, total: 1.6 ms
Wall time: 1.6 ms

'AC3b with DOM J UP needs 1284 consistency-checks'
```

```python
%time backtracking_search(usa_csp, select_unassigned_variable=mrv, inference=forward_checking)
```

Output:
```text
CPU times: user 2.15 ms, sys: 0 ns, total: 2.15 ms
Wall time: 2.15 ms

{'NM': 'R',
'TX': 'G',
'OK': 'B',
'AR': 'R',
'MO': 'G',
'KA': 'R',
'LA': 'B',
'NE': 'B',
'TN': 'B',
'MS': 'G',
'IA': 'R',
'SD': 'G',
'IL': 'B',
'CO': 'G',
'MN': 'B',
'KY': 'R',
'AL': 'R',
'GA': 'G',
'FL': 'B',
'VA': 'G',
'WI': 'G',
'IN': 'G',
'NC': 'R',
'WV': 'B',
'OH': 'Y',
'PA': 'R',
'MD': 'Y',
'SC': 'B',
'MI': 'R',
'DC': 'R',
'DE': 'G',
'WY': 'R',
'ND': 'R',
'NJ': 'B',
'NY': 'G',
'UT': 'B',
'AZ': 'G',
'ID': 'G',
'MT': 'B',
'NV': 'R',
'CA': 'B',
'OR': 'Y',
'WA': 'R',
'VT': 'R',
'MA': 'B',
'NH': 'G',
'CT': 'R',
'RI': 'G',
'ME': 'R'}
```

#### SAT

```python
usa_sat = MapColoringSAT(list('RGBY'),
"""WA: OR ID; OR: ID NV CA; CA: NV AZ; NV: ID UT AZ; ID: MT WY UT;
UT: WY CO AZ; MT: ND SD WY; WY: SD NE CO; CO: NE KA OK NM; NM: OK TX AZ;
ND: MN SD; SD: MN IA NE; NE: IA MO KA; KA: MO OK; OK: MO AR TX;
TX: AR LA; MN: WI IA; IA: WI IL MO; MO: IL KY TN AR; AR: MS TN LA;
LA: MS; WI: MI IL; IL: IN KY; IN: OH KY; MS: TN AL; AL: TN GA FL;
MI: OH IN; OH: PA WV KY; KY: WV VA TN; TN: VA NC GA; GA: NC SC FL;
PA: NY NJ DE MD WV; WV: MD VA; VA: MD DC NC; NC: SC; NY: VT MA CT NJ;
NJ: DE; DE: MD; MD: DC; VT: NH MA; MA: NH RI CT; CT: RI; ME: NH;
HI: ; AK: """)
```

##### DPLL

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=no_branching_heuristic)
```

Output:
```text
CPU times: user 46.2 s, sys: 0 ns, total: 46.2 s
Wall time: 46.2 s
```

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=moms)
```

Output:
```text
CPU times: user 54.6 s, sys: 0 ns, total: 54.6 s
Wall time: 54.6 s
```

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=momsf)
```

Output:
```text
CPU times: user 44 s, sys: 0 ns, total: 44 s
Wall time: 44 s
```

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=posit)
```

Output:
```text
CPU times: user 43.8 s, sys: 0 ns, total: 43.8 s
Wall time: 43.8 s
```

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=zm)
```

Output:
```text
CPU times: user 52.6 s, sys: 0 ns, total: 52.6 s
Wall time: 52.6 s
```

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=dlis)
```

Output:
```text
CPU times: user 57 s, sys: 0 ns, total: 57 s
Wall time: 57 s
```

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=dlcs)
```

Output:
```text
CPU times: user 43.8 s, sys: 0 ns, total: 43.8 s
Wall time: 43.8 s
```

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=jw)
```

Output:
```text
CPU times: user 53.3 s, sys: 3.82 ms, total: 53.3 s
Wall time: 53.3 s
```

```python
%time model = dpll_satisfiable(usa_sat, branching_heuristic=jw2)
```

Output:
```text
CPU times: user 44 s, sys: 3.99 ms, total: 44 s
Wall time: 44 s
```

##### CDCL

```python
%time model = cdcl_satisfiable(usa_sat)
```

Output:
```text
CPU times: user 559 ms, sys: 0 ns, total: 559 ms
Wall time: 558 ms
```

```python
{var for var, val in model.items() if val}
```

Output:
```text
{AL_B,
AR_B,
AZ_R,
CA_B,
CO_R,
CT_Y,
DC_G,
DE_Y,
FL_Y,
GA_R,
IA_B,
ID_Y,
IL_G,
IN_R,
KA_G,
KY_B,
LA_G,
MA_G,
MD_R,
ME_G,
MI_G,
MN_Y,
MO_R,
MS_Y,
MT_B,
NC_B,
ND_G,
NE_Y,
NH_Y,
NJ_G,
NM_G,
NV_G,
NY_R,
OH_Y,
OK_Y,
OR_R,
PA_B,
RI_B,
SC_Y,
SD_R,
TN_G,
TX_R,
UT_B,
VA_Y,
VT_B,
WA_B,
WI_R,
WV_G,
WY_G}
```

### Zebra Puzzle

#### CSP

```python
zebra_csp = Zebra()
```

```python
zebra_csp.display(zebra_csp.infer_assignment())
```

Output:
```text
{'Milk': 3, 'Norwegian': 1}
```

```python
%time _, checks = AC3b(zebra_csp, arc_heuristic=dom_j_up)
f'AC3b with DOM J UP needs {checks} consistency-checks'
```

Output:
```text
CPU times: user 2.04 ms, sys: 4 µs, total: 2.05 ms
Wall time: 2.05 ms

'AC3b with DOM J UP needs 737 consistency-checks'
```

```python
zebra_csp.display(zebra_csp.infer_assignment())
```

Output:
```text
{'Blue': 2, 'Milk': 3, 'Norwegian': 1}
```

```python
%time backtracking_search(zebra_csp, select_unassigned_variable=mrv, inference=forward_checking)
```

Output:
```text
CPU times: user 2.13 ms, sys: 0 ns, total: 2.13 ms
Wall time: 2.14 ms

{'Milk': 3,
'Blue': 2,
'Norwegian': 1,
'Coffee': 5,
'Green': 5,
'Ivory': 4,
'Red': 3,
'Yellow': 1,
'Kools': 1,
'Englishman': 3,
'Horse': 2,
'Tea': 2,
'Ukranian': 2,
'Spaniard': 4,
'Dog': 4,
'Japanese': 5,
'Parliaments': 5,
'LuckyStrike': 4,
'OJ': 4,
'Water': 1,
'Chesterfields': 2,
'Winston': 3,
'Snails': 3,
'Fox': 1,
'Zebra': 5}
```

#### SAT

```python
zebra_sat = associate('&', map(to_cnf, map(expr, filter(lambda line: line[0] not in ('c', 'p'), open('aima-data/zebra.cnf').read().splitlines()))))
```

##### DPLL

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=no_branching_heuristic)
```

Output:
```text
CPU times: user 13min 6s, sys: 2.44 ms, total: 13min 6s
Wall time: 13min 6s
```

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=moms)
```

Output:
```text
CPU times: user 15min 4s, sys: 22.4 ms, total: 15min 4s
Wall time: 15min 4s
```

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=momsf)
```

Output:
```text
CPU times: user 22min 28s, sys: 40 ms, total: 22min 28s
Wall time: 22min 28s
```

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=posit)
```

Output:
```text
CPU times: user 22min 25s, sys: 36 ms, total: 22min 25s
Wall time: 22min 25s
```

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=zm)
```

Output:
```text
CPU times: user 14min 52s, sys: 32 ms, total: 14min 52s
Wall time: 14min 52s
```

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=dlis)
```

Output:
```text
CPU times: user 2min 31s, sys: 9.87 ms, total: 2min 31s
Wall time: 2min 32s
```

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=dlcs)
```

Output:
```text
CPU times: user 4min 27s, sys: 12 ms, total: 4min 27s
Wall time: 4min 27s
```

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=jw)
```

Output:
```text
CPU times: user 6min 55s, sys: 39.2 ms, total: 6min 55s
Wall time: 6min 56s
```

```python
%time model = dpll_satisfiable(zebra_sat, branching_heuristic=jw2)
```

Output:
```text
CPU times: user 8min 57s, sys: 7.94 ms, total: 8min 57s
Wall time: 8min 57s
```

##### CDCL

```python
%time model = cdcl_satisfiable(zebra_sat)
```

Output:
```text
CPU times: user 1.64 s, sys: 0 ns, total: 1.64 s
Wall time: 1.64 s
```

```python
{var for var, val in model.items() if val and var.op.startswith(('Englishman', 'Japanese', 'Norwegian', 'Spaniard', 'Ukrainian'))}
```

Output:
```text
{Englishman_house2,
Englishman_milk,
Englishman_oldGold,
Englishman_redHouse,
Englishman_snails,
Japanese_coffee,
Japanese_greenHouse,
Japanese_house4,
Japanese_parliament,
Japanese_zebra,
Norwegian_fox,
Norwegian_house0,
Norwegian_kool,
Norwegian_water,
Norwegian_yellowHouse,
Spaniard_dog,
Spaniard_house3,
Spaniard_ivoryHouse,
Spaniard_luckyStrike,
Spaniard_orangeJuice,
Ukrainian_blueHouse,
Ukrainian_chesterfield,
Ukrainian_horse,
Ukrainian_house1,
Ukrainian_tea}
```

## References

<a name="cite-freeman1995improvements"/><sup>[[1]](#ref-1) </sup>Freeman, Jon William. 1995. _Improvements to propositional satisfiability search algorithms_.

<a name="cite-zabih1988rearrangement"/><sup>[[2]](#ref-2) </sup>Zabih, Ramin and McAllester, David A. 1988. _A Rearrangement Search Strategy for Determining Propositional Satisfiability_.

<a name="cite-jeroslow1990solving"/><sup>[[3]](#ref-3) </sup>Jeroslow, Robert G and Wang, Jinchang. 1990. _Solving propositional satisfiability problems_.

<a name="cite-moskewicz2001chaff"/><sup>[[4]](#ref-4) </sup>Moskewicz, Matthew W and Madigan, Conor F and Zhao, Ying and Zhang, Lintao and Malik, Sharad. 2001. _Chaff: Engineering an efficient SAT solver_.

<a name="cite-haim2014towards"/><sup>[[5]](#ref-5) </sup>Haim, Shai and Heule, Marijn. 2014. _Towards ultra rapid restarts_.

<a name="cite-huang2007effect"/><sup>[[6]](#ref-6) </sup>Huang, Jinbo and others. 2007. _The Effect of Restarts on the Efficiency of Clause Learning_.

<a name="cite-audemard2012refining"/><sup>[[7]](#ref-7) </sup>Audemard, Gilles and Simon, Laurent. 2012. _Refining restarts strategies for SAT and UNSAT_.

<a name="cite-audemard2009predicting"/><sup>[[8]](#ref-8) </sup>Audemard, Gilles and Simon, Laurent. 2009. _Predicting learnt clauses quality in modern SAT solvers_.
