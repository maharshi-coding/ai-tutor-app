# Artificial Intelligence 3E

Source: Artificial Intelligence: Foundations of Computational Agents
Original URL: https://artint.info/3e/html/ArtInt3e.Ch8.html
Original Path: https://artint.info/3e/html/ArtInt3e.Ch8.html
Course: Artificial Intelligence

David L. Poole & Alan K. Mackworth

Artificial
Intelligence 3E

foundations of computational agents

- Home

- Index

- Contents

Chapter 8 Neural Networks and Deep Learning

Deep learning allows computational models that are composed of
multiple processing layers to learn representations of data with
multiple levels of abstraction. These methods have dramatically
improved the state-of-the-art in speech recognition, visual object
recognition, object detection and many other domains such as drug
discovery and genomics. Deep learning discovers intricate structure in
large data sets by using the backpropagation algorithm to indicate how
a machine should change its internal parameters that are used to
compute the representation in each layer from the representation in
the previous layer. Deep convolutional nets have brought about
breakthroughs in processing images, video, speech and audio, whereas
recurrent nets have shone light on sequential data such as text and
speech.

– Y. LeCun, Y. Bengio, and G. Hinton [ 2015 ]

The previous chapter assumed that the input were features; you
might wonder where the features come from. The inputs to real-world
agents are diverse, including
pixels from cameras, sound waves from microphones, or character
sequences from web requests. Using these directly as inputs to the methods from the previous
chapter often does not work well; useful features need to be created from the
raw inputs. This could be done by designing features from the raw
inputs using feature engineering . Learned features, however, are now
state-of-the-art for many applications, and can beat engineered features for cases
that have abundant data.

This chapter is about how to learn
features. The methods here learn features that are
useful for the tasks trained on, even though they may not have an interpretation that can be
easily explained. Often features learned for some tasks are useful for
other tasks.

Learning the features that are useful for prediction is called
representation learning . The most common form of
representation reasoning is in terms of multilayer neural networks .
These networks are inspired by the neurons in the brain but do not
actually simulate neurons.
Artificial neurons are called units . Each unit has many real-valued parameters. Large artificial neural networks (in 2022)
contain on the order of one hundred billion ( 10 11 ) trained parameters, which is approximately
the number of neurons in the human brain.
Neurons are much more complicated than the units in artificial neural
networks. For example, the roundworm Caenorhabditis elegans , which is about
1 mm long, has
302 neurons and exhibits complex behavior, which simple models of neurons
cannot account for.

As pointed out by LeCun et al., above,
artificial neural networks (ANNs) have had considerable success in
unstructured and perception tasks
for which there is abundant training data, such as
for image interpretation, speech recognition, machine translation, and
game playing. The models used in state-of-the-art applications are
trained on
huge datasets, including more cats than any one person has ever seen,
more sentences than any one person has ever read, and more games than
any one person has played.
They can take advantage of the data because they are very flexible,
with the capability of inventing low-level features that are useful
for the higher-level task.

Artificial neural networks are interesting to study for a number of reasons:

•

As part of neuroscience, to understand real neural
systems, researchers are simulating the neural systems of simple
animals such as worms, which promises to lead to an understanding of
which aspects of neural systems are necessary to explain the behavior
of these animals.

•

Some researchers seek to automate not only the functionality of
intelligence (which is what the field of artificial intelligence
is about) but also the mechanism of the brain, suitably abstracted.
One hypothesis is that the best way to build the
functionality of the brain is to use the mechanism of the
brain. This hypothesis can be tested by attempting to build intelligence
using the mechanism of the brain, as well as attempting it without using the
mechanism of the brain.

•

The brain inspires a new way to think about computation that
contrasts with traditional computers. Unlike conventional computers,
which have a few processors and a large but essentially inert
memory, the brain consists of a huge number of asynchronous
distributed processes, all running concurrently with no master
controller. Conventional computers are not the
only architecture available for computation. Current neural
network systems are often implemented on parallel architectures,
including GPUs and specialized tensor processing units.

•

As far as learning is concerned, neural networks provide a
different measure of simplicity as a learning bias than, for example,
boosted decision trees. Multilayer neural networks, like decision trees, can
represent any function of a set of discrete features. However, the
bias is different;
functions that correspond to simple
neural networks do not necessarily correspond to simple ensembles of decision
trees. In neural networks, low-level features
that are useful for multiple higher-level features are learned.

Artificial Intelligence: Foundations of Computational Agents, Poole
& Mackworth

Copyright &copy; 2023, David L. Poole and Alan K. Mackworth .
This work is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License .
