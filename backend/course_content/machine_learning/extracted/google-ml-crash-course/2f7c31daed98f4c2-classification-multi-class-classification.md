# Classification: Multi-class classification

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/classification/multiclass
Original Path: https://developers.google.com/machine-learning/crash-course/classification/multiclass
Course: Machine Learning

Classification: Multi-class classification

Stay organized with collections

Save and categorize content based on your preferences.

Multi-class classification can be treated as an extension of
binary classification
to more than two classes. If each example can only be
assigned to one class, then the classification problem can be handled as a
binary classification problem, where one class contains one of the multiple
classes, and the other class contains all the other classes put together.
The process can then be repeated for each of the original classes.

For example, in a three-class multi-class classification problem,
where you're classifying examples with the labels A , B , and
C , you could turn the problem into two separate binary classification
problems. First, you might create a binary classifier that categorizes examples
using the label A+B and the label C . Then, you could create a second
binary classifier that reclassifies the examples that are labeled A+B
using the label A and the label B .

An example of a multi-class problem is a handwriting classifier that takes
an image of a handwritten digit and decides which digit, 0-9, is represented.

If class membership isn't exclusive, which is to say, an example can be
assigned to multiple classes, this is known as a multi-label classification
problem.

Help Center

arrow_back

Prediction bias (3 min)

Programming exercise (15 min)

arrow_forward

Send feedback

Except as otherwise noted, the content of this page is licensed under the Creative Commons Attribution 4.0 License , and code samples are licensed under the Apache 2.0 License . For details, see the Google Developers Site Policies . Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-08-25 UTC.

Need to tell us more?

[[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-25 UTC."],[],[]]
