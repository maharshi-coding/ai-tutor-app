# NATURAL LANGUAGE PROCESSING

Source: AIMA Python
Original URL: https://github.com/aimacode/aima-python/blob/HEAD/notebooks/chapter22/Introduction.ipynb
Original Path: notebooks/chapter22/Introduction.ipynb
Course: Artificial Intelligence

# NATURAL LANGUAGE PROCESSING

The notebooks in this folder cover chapters 23 of the book *Artificial Intelligence: A Modern Approach*, 4th Edition. The implementations of the algorithms can be found in [nlp.py](https://github.com/aimacode/aima-python/blob/master/nlp4e.py).

Run the below cell to import the code from the module and get started!

```python
import os, sys
sys.path = [os.path.abspath("../../")] + sys.path
from nlp4e import *
from notebook4e import psource
```

## OVERVIEW

**Natural Language Processing (NLP)** is a field of AI concerned with understanding, analyzing and using natural languages. This field is considered a difficult yet intriguing field of study since it is connected to how humans and their languages work.

Applications of the field include translation, speech recognition, topic segmentation, information extraction and retrieval, and a lot more.

Below we take a look at some algorithms in the field. Before we get right into it though, we will take a look at a very useful form of language, **context-free** languages. Even though they are a bit restrictive, they have been used a lot in research in natural language processing.

Below is a summary of the demonstration files in this chapter.

## CONTENTS

- Introduction: Introduction to the field of nlp and the table of contents.
- Grammars: Introduction to grammar rules and lexicon of words of a language.
- Context-free Grammar
- Probabilistic Context-Free Grammar
- Chomsky Normal Form
- Lexicon
- Grammar Rules
- Implementation of Different Grammars
- Parsing: The algorithms parsing sentences according to a certain kind of grammar.
- Chart Parsing
- CYK Parsing
- A-star Parsing
- Beam Search Parsing
