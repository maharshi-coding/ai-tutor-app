# Linear Neural Networks for Classification

Source: Dive into Deep Learning
Original URL: https://github.com/d2l-ai/d2l-en/blob/HEAD/chapter_linear-classification/index.md
Original Path: chapter_linear-classification/index.md
Course: Machine Learning

# Linear Neural Networks for Classification
:label:`chap_classification`

Now that you have worked through all of the mechanics
you are ready to apply the skills you have learned to broader kinds of tasks.
Even as we pivot towards classification,
most of the plumbing remains the same:
loading the data, passing it through the model,
generating output, calculating the loss,
taking gradients with respect to weights,
and updating the model.
However, the precise form of the targets,
the parametrization of the output layer,
and the choice of loss function will adapt
to suit the *classification* setting.

```toc
:maxdepth: 2

softmax-regression
image-classification-dataset
classification
softmax-regression-scratch
softmax-regression-concise
generalization-classification
environment-and-distribution-shift
```
