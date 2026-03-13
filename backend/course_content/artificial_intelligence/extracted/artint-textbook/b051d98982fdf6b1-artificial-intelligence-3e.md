# Artificial Intelligence 3E

Source: Artificial Intelligence: Foundations of Computational Agents
Original URL: https://artint.info/3e/html/ArtInt3e.Ch1.S1.html
Original Path: https://artint.info/3e/html/ArtInt3e.Ch1.S1.html
Course: Artificial Intelligence

David L. Poole & Alan K. Mackworth

Artificial
Intelligence 3E

foundations of computational agents

- Home

- Index

- Contents

1.1 What is Artificial Intelligence?

Artificial intelligence , or
AI , is the field that studies the synthesis and analysis of computational
agents that act intelligently . Consider each part of this
definition.

An agent is something that acts in an
environment; it does something. Agents include worms, dogs,
thermostats, airplanes, robots, humans, companies, and countries.

An agent is judged solely by how it
acts . Agents that have
the same effect in the world are
equally good.

Intelligence is a matter of degree.
The aspects that go into an agent
acting intelligently include

•

what it does is appropriate for
its circumstances, its goals, and its perceptual and
computational limitations

•

it takes into account the short-term
and long-term consequences of its actions, including the effects on
society and the environment

•

it learns from experience

•

it is flexible to changing
environments and changing goals.

A computational agent is an agent whose decisions about its
actions can be explained in terms of computation. That is, the
decision can be broken down into primitive operations that can be
implemented in a physical device. This computation can take many
forms. In humans, this computation is carried out in “wetware”; in
computers it is carried out in “hardware.” Although there are some
agents that are arguably not computational, such as the wind and rain eroding a
landscape, it is an open question whether all intelligent agents
are computational.

All agents are limited. No agent is omniscient (all knowing) or
omnipotent (can do anything). Agents can only observe everything in very
specialized and constrained domains. Agents have finite memory. Agents in the real
world do not have unlimited time to act.

The central scientific goal of AI is to
understand the principles that make intelligent behavior possible in
natural or artificial systems. This is done by

•

the analysis of natural and artificial agents

•

formulating and testing hypotheses about what it takes to
construct intelligent agents

•

designing, building, and experimenting with computational
systems that perform tasks commonly viewed as requiring intelligence.

As part of science, researchers build empirical systems to test
hypotheses or to explore the space of possible designs. These are
distinct from applications that are built to be useful for an
application domain.

The definition is not for intelligent thought . The
role of thought is to affect action and
lead to more intelligent behavior .

The central engineering goal of AI is
the design and synthesis of agents that act
intelligently, which leads to useful
artifacts.

Building general intelligence isn’t the only goal of AI researchers.
The aim of intelligence augmentation
is to augment human
intelligence and creativity. A diagnostic agent helps medical practitioners
make better decisions, a search engine augments human memory, and
natural language translation systems help
people communicate. AI systems are often in
human-in-the-loop mode, where humans and agents work together to
solve problems. Sometimes the actions of artificial agents are to give advice
to a human. Sometimes humans give advice or feedback to artificial agents, particularly
for cases where decisions are made quickly or repeatedly.

1.1.1 Artificial and Natural Intelligence

Artificial intelligence (AI) is the
established name for the field, but the term “artificial intelligence” is a
source of much confusion because artificial intelligence may be
interpreted as the
opposite of real
intelligence.

For any phenomenon, you can distinguish real versus fake, where the
fake is non-real. You can also distinguish natural
versus artificial. Natural means occurring in nature and artificial
means made by people.

Example 1.1 .

A tsunami is a large wave in an ocean. Natural tsunamis occur from time to
time and are caused by
earthquakes or landslides. You could imagine an artificial tsunami that was made by people, for example, by exploding a
bomb in the ocean, yet which is still a real tsunami. One could also imagine fake tsunamis: either
artificial, using computer graphics, or natural, such as a mirage that
looks like a tsunami but is not one.

It is arguable that intelligence is different: you cannot have fake
intelligence. If an agent behaves intelligently, it is intelligent. It
is only the external behavior that defines intelligence; acting
intelligently is being intelligent. Thus, artificial intelligence, if
and when it is achieved, will
be real intelligence created artificially.

This idea of intelligence being defined by external behavior was the
motivation for a test for intelligence designed by
Turing [ 1950 ] , which has become known as the
Turing test . The Turing test consists of an imitation game
where an interrogator can ask a witness,
via a text interface, any question. If the
interrogator cannot distinguish the witness from a human, the
witness must be intelligent. Figure 1.1 shows a
possible dialog that Turing suggested.
An agent that is not really intelligent could not fake intelligence for
arbitrary topics.

Interrogator:

In the first line of your sonnet which reads “Shall I compare thee to a summer’s day,” would not ”a spring day” do as well or better?

Witness:

It wouldn’t scan.

Interrogator:

How about “a winter’s day,” That would scan all right.

Witness:

Yes, but nobody wants to be compared to a winter’s day.

Interrogator:

Would you say Mr. Pickwick reminded you of Christmas?

Witness:

In a way.

Interrogator:

Yet Christmas is a winter’s day, and I do not think Mr. Pickwick would mind the comparison.

Witness:

I don’t think you’re serious. By a winter’s day one means a
typical winter’s day, rather than a special one like Christmas.

Figure 1.1: Part of Turing’s possible dialog for the Turing test

There has been much debate about the usefulness of the Turing test. Unfortunately, although it may provide a test for how to recognize intelligence,
it does not provide a way to realize intelligence.

Levesque [ 2014 ] suggested a new form of question,
a Winograd schema after the following
example of Winograd [ 1972 ] :

•

The city councilmen refused the demonstrators a permit because they
feared violence. Who feared violence?

•

The city councilmen refused the demonstrators a permit because they
advocated violence. Who advocated violence?

These two sentences only differ in one word – feared/advocated – but have
the opposite answer.

Winograd schemas have the
property that (a) humans can easily disambiguate them and (b) there is
no simple grammatical or statistical test that could disambiguate
them. For example, the sentences above would not qualify if the phrase
“demonstrators feared violence”
was much less or more likely than the phrase “councilmen feared
violence” independently of the context, and
similarly with advocating.

Example 1.2 .

The following examples are due to Davis [ 2015 ] :

•

Steve follows Fred’s example in everything. He [admires/influences] him hugely. Who [admires/influences] whom?

•

The table won’t fit through the doorway because it is too [wide/narrow]. What is too [wide/narrow]?

•

Grace was happy to trade me her sweater for my jacket. She thinks it looks [great/dowdy] on her. What looks [great/dowdy] on Grace?

•

Bill thinks that calling attention to himself was rude [to/of] Bert. Who called attention to himself?

Each of these have their own reasons why one answer is preferred to
the other. A computer that can reliably answer these questions
needs
to know about all of these reasons, and arguably requires
the ability to do commonsense reasoning .
Common sense should also allow it to reject sentences such as
“The doorway won’t fit through the chair because it is too
narrow. What is too narrow?”.

Figure 1.2 shows some answers provided by
ChatGPT [OpenAI, 2022 ] , based on GPT-3 [Brown et al., 2020 ] , one of the most capable large language models in
2022. ChatGPT gives a
different answer each time it is called. You can decide whether it solves this Winograd schema. The technology behind GPT-3
and related models is
described in Section 8.5 .

Human : The table won’t fit through the doorway because it is too narrow. What is too narrow?

ChatGPT : If a table won’t fit through a doorway because it is too narrow, it
means that the width of the table is greater than the width of the
doorway. In other words, the doorway is not wide enough to allow the
table to pass through it. This can be a problem if you are trying to
move the table from one room to another and the only way to do so is
through the doorway. In order to solve this problem, you may need to
remove the door or trim the table so that it fits through the
doorway. Alternatively, you may need to find a different route to move
the table, such as through a window or by taking it apart and
reassembling it in the other room.

Human : The table won’t fit through the doorway because it is too
wide. What is too wide?

ChatGPT : If a table won’t fit through a doorway because it is too wide, it
means that the width of the doorway is smaller than the width of the
table. In other words, the table is too big to fit through the
doorway. This can be a problem if you are trying to move the table
from one room to another and the only way to do so is through the
doorway. In order to solve this problem, you may need to remove the
door or trim the table so that it fits through the
doorway. Alternatively, you may need to find a different route to move
the table, such as through a window or by taking it apart and
reassembling it in the other room.

Human : The doorway won’t fit through the chair because it is too
narrow. What is too narrow?

ChatGPT : ”Too narrow” means that the doorway is not wide enough to fit through
the chair. In this context, the doorway is the object that is being
compared to the chair, and it is not wide enough to pass through the
chair without encountering some difficulty or obstruction. This could
be because the doorway is physically smaller in width than the chair,
or because there is some other physical feature of the chair that is
preventing the doorway from fitting through it. For example, the chair
might have armrests or other protuberances that make it difficult for
the doorway to pass through. In general, the phrase ”too narrow” is
used to describe something that is not wide enough to fit through or
pass a particular opening or gap.

Human : The doorway won’t fit through the chair because it is too
narrow. What is too narrow?

ChatGPT : If a doorway is too narrow to fit through a chair, it means that the
width of the doorway is smaller than the width of the chair. This can
happen if the chair is too wide to fit through the doorway, or if the
doorway is not wide enough to accommodate the chair. In either case,
the chair will not be able to pass through the doorway because there
is not enough space for it to fit.

Figure 1.2: ChatGPT answers to some Winograd schemas

Grosz [ 2012 ] , arguing that language is inherently social and connected
to human cooperation, suggested that a more appropriate test should
involve purposeful natural language, not language just for the purpose
of tricking a human. She suggested the question:

Is it imaginable that a computer (agent) team member could behave,
over the long term and in uncertain, dynamic environments, in such a
way that people on the team will not notice it is not human?

– Barbara Grosz [ 2012 ]

An equal member of the team needs to be trusted enough to act in the world
appropriately, know when to ask questions, and when to not act. This challenge also allows for incremental improvement;
starting with simple group interactions before moving to complex ones.

Interacting in natural language is not the only aspect of
intelligence.
An agent acting in an environment needs
common sense ,
“the ability to make effective use of ordinary,
everyday, experiential knowledge in achieving ordinary, practical
goals” [Brachman and Levesque, 2022b ] .
Here, knowledge is used in a general way to mean any non-transient
information in an agent.
Such knowledge is typically not stated
in natural language; people do not state what everyone
knows. Some knowledge, such as how to ride a bike or recognize a face,
cannot be effectively conveyed by natural language. Formalizing common sense has a long history
[McCarthy, 1958 ; Davis, 1990 ] , including the development of
representations and actual commonsense knowledge.

1.1.2 Natural Intelligence

The obvious naturally intelligent agent is the human being. Some people
might say that worms, insects, or bacteria are intelligent, but more
people would say that dogs, whales, or monkeys are intelligent
(see Exercise 1.1 ). One class of intelligent agents that may
be more intelligent than humans is the class of
organizations . Ant colonies are a
prototypical example of organizations. Each individual ant may not be
very intelligent, but an ant colony can act more intelligently than
any individual ant. The colony can discover food and exploit it very
effectively, as well as adapt to changing circumstances. Corporations
can be more intelligent than individual people.
Companies develop, manufacture, and distribute products where the
sum of the skills required is much more than any individual could
master. Modern computers, from low-level hardware to
high-level software, are more complicated than any single human can
understand, yet they are manufactured daily by organizations of
humans. Human society viewed as an agent is
arguably the most intelligent agent known.

It is instructive to consider where human intelligence comes
from. There are three main sources:

Biology

Humans have evolved into adaptable animals that can
survive in various habitats.

Culture

Culture provides not only language, but also useful tools,
useful concepts, and the wisdom that is passed from parents and
teachers to children.

Lifelong learning

Humans learn throughout their life and
accumulate knowledge and skills.

These sources interact in complex ways. Biological evolution has provided stages
of growth that allow for different learning at different stages of
life. Biology and culture have evolved together; humans can be
helpless at birth, presumably because
of our culture of looking after infants. Culture interacts strongly
with learning. A major part of lifelong
learning is what people are taught by parents and teachers.
Language, which is part of culture, provides distinctions in the world
that are useful for learning.

When building an intelligent system, the designers have to decide which of these
sources of intelligence need to be programmed in, and which can be
learned. It is very unlikely that anyone will be able to build an agent that
starts with a clean slate and learns everything, particularly for
non-repetitive
tasks. Similarly,
most interesting and useful intelligent agents learn to improve their
behavior.

Artificial Intelligence: Foundations of Computational Agents, Poole
& Mackworth

Copyright &copy; 2023, David L. Poole and Alan K. Mackworth .
This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License .
