# Artificial Intelligence 3E

Source: Artificial Intelligence: Foundations of Computational Agents
Original URL: https://artint.info/3e/html/ArtInt3e.Ch11.html
Original Path: https://artint.info/3e/html/ArtInt3e.Ch11.html
Course: Artificial Intelligence

David L. Poole & Alan K. Mackworth

Artificial
Intelligence 3E

foundations of computational agents

- Home

- Index

- Contents

Chapter 11 Causality

The word cause is not in the vocabulary of standard probability
theory. It is an embarrassing yet inescapable fact that probability
theory, the official mathematical language of many empirical sciences,
does not permit us to express sentences such as “Mud does not cause
rain”; all we can say are that the two events are mutually
correlated, or dependent – meaning that if we find one, we can expect
to encounter the other. Scientists seeking causal explanations for
complex phenomenon or rationales for policy decisions must therefore
supplement the language of probability with a vocabulary for
causality, one in which the symbolic representation for “Mud does not
cause rain” is distinct from the symbolic representation for “Mud is
independent of rain”. Oddly, such distinctions have yet to be
incorporated into standard scientific analysis.

– Judea Pearl [ 2009 ]

In the example from Pearl (above), mud and rain are correlated, but
the relationship between mud and rain is not symmetric. Creating
mud (e.g., by pouring water on dirt) does not make rain. However,
if you were to cause rain (e.g., by seeding clouds), mud will result.
There is a causal relationship between mud and rain: rain causes
mud, and mud does not cause rain. This causal relationship holds even
when you ignore the other necessary conditions, such as the existence
of dirt, and the absence of a cover on the dirt to prevent it getting
wet. It also depends on the level of abstraction: arguably, rain
causes dirt to get wet, which in turn makes mud.

It is known that ice-cream consumption and drowning deaths are positively correlated. But that doesn’t mean that if one wanted to reduce drowning deaths one should ban ice-cream.

As another example, taking marijuana and taking hard drugs are
positively correlated. This has led to the theory that marijuana is a
gateway drug; taking marijuana leads to harder drugs. But the correlation doesn’t tell us what happens when you
intervene to force taking marijuana false or true. It is indeed possible that
the use of hard drugs will decrease if you give people marijuana. You can
get indirect evidence from places where marijuana has been legalized,
but you can’t determine the causal relationship just from passive
observation, without making assumptions that go beyond the data.

A causal model is a
model that predicts the effects of interventions, where an intervention
on a variable is the action of setting the
variable to a particular value,
in some way other than manipulating other variables in the model.
For example, when a light is connected to a switch, as in
Example 5.34 , intervening to
make the light off might involve unscrewing the bulb or breaking it,
if these are not modeled,
but would not include flipping the switch, if the switch position is
part of the model.

A causal model is obtained from observational data, interventional
data, and modeling assumptions. Observational data alone is not
sufficient to determine causality;
knowing a probability distribution is not enough information to
determine the consequences of actions.
Drug manufacturers, for example, spend billions of dollars on
controlled randomized trials in order to determine causality; namely,
the effects of giving someone a drug.

This is not referring to “the (unique) cause” of an effect, but all
of the factors that together lead to the effect.
An effect typically has multiple causes. For example, to cause mud, you
need water, dirt, and for them to actually mix. None by itself
is the cause. The variables in a causal model need not be
observable; most of the challenges arise because some variables cannot
be observed.

Artificial Intelligence: Foundations of Computational Agents, Poole
& Mackworth

Copyright &copy; 2023, David L. Poole and Alan K. Mackworth .
This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License .
