# Decision Tree in Machine Learning

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/decision-tree-introduction-example/
Original Path: https://www.geeksforgeeks.org/machine-learning/decision-tree-introduction-example/
Course: Machine Learning

Decision Tree in Machine Learning

Last Updated : 23 Feb, 2026

A decision tree is a supervised learning algorithm used for both classification and regression tasks. It has a hierarchical tree structure which consists of a root node, branches, internal nodes and leaf nodes. It works like a flowchart that helps in making step by step decision, where:

- Internal nodes represent attribute tests

- Branches represent attribute values

- Leaf nodes represent final decisions or predictions.

Decision trees are widely used due to their interpretability, flexibility and low preprocessing needs.

How Does a Decision Tree Work

A decision tree splits the dataset based on feature values to create pure subsets ideally all items in a group belong to the same class. Each leaf node of the tree corresponds to a class label and the internal nodes are feature-based decision points. Let’s understand this with an example.
Decision Tree
Let’s consider a decision tree for predicting whether a customer will buy a product based on age, income and previous purchases: Here's how the decision tree works:

1. Root Node (Income)

First Question : "Is the person’s income greater than $50,000?"

- If Yes, proceed to the next question.

- If No, predict "No Purchase" (leaf node).

2. Internal Node (Age) :

If the person’s income is greater than $50,000 , ask: "Is the person’s age above 30?"

- If Yes, proceed to the next question.

- If No, predict "No Purchase" (leaf node).

3. Internal Node (Previous Purchases) :

- If the person is above 30 and has made previous purchases, predict "Purchase" (leaf node).

- If the person is above 30 and has not made previous purchases, predict "No Purchase" (leaf node).
Decision making with 2 Decision Tree
Example: Predicting Whether a Customer Will Buy a Product Using Two Decision Trees

Tree 1: Customer Demographics

First tree asks two questions:

1. "Income > $50,000?"

- If Yes, Proceed to the next question.

- If No, "No Purchase"

2. "Age > 30?"

- Yes: "Purchase"

- No: "No Purchase"

Tree 2: Previous Purchases

"Previous Purchases > 0?"

- Yes: "Purchase"

- No: "No Purchase"

Once we have predictions from both trees, we can combine the results to make a final prediction. If Tree 1 predicts "Purchase" and Tree 2 predicts "No Purchase", the final prediction might be "Purchase" or "No Purchase" depending on the weight or confidence assigned to each tree. This can be decided based on the problem context.

Information Gain and Gini Index in Decision Tree

Till now we have discovered the basic intuition and approach of how decision tree works, so lets just move to the attribute selection measure of decision tree. We have two popular attribute selection measures used:

1. Information Gain

Information Gain tells us how useful a question (or feature) is for splitting data into groups. It measures how much the uncertainty decreases after the split. A good question will create clearer groups and the feature with the highest Information Gain is chosen to make the decision.

For example if we split a dataset of people into "Young" and "Old" based on age and all young people bought the product while all old people did not, the Information Gain would be high because the split perfectly separates the two groups with no uncertainty left

- Suppose S is a set of instances A is an attribute, Sv is the subset of S , v represents an individual value that the attribute A can take and Values ( A ) is the set of all possible values of A then

Gain(S, A) = Entropy(S) - \sum_{v}^{A}\frac{\left | S_{v} \right |}{\left | S \right |}. Entropy(S_{v})

- Entropy: It is the measure of uncertainty of a random variable, it characterizes the impurity of an arbitrary collection of examples. The higher the entropy more the information content.

For example if a dataset has an equal number of "Yes" and "No" outcomes (like 3 people who bought a product and 3 who didn’t), the entropy is high because it’s uncertain which outcome to predict. But if all the outcomes are the same (all "Yes" or all "No") the entropy is 0 meaning there is no uncertainty left in predicting the outcome

Suppose S is a set of instances, A is an attribute, Sv is the subset of S with A = v and Values ( A ) is the set of all possible values of A , then

Gain(S, A) = Entropy(S) - \sum_{v \epsilon Values(A)}\frac{\left | S_{v} \right |}{\left | S \right |}. Entropy(S_{v})

Example:

For the set X = {a,a,a,b,b,b,b,b}
Total instances: 8
Instances of b: 5
Instances of a: 3

\begin{aligned}\text{Entropy } H(X) & =\left [ \left ( \frac{3}{8} \right )\log_{2}\frac{3}{8} + \left ( \frac{5}{8} \right )\log_{2}\frac{5}{8} \right ]\\& = -[0.375 (-1.415) + 0.625 (-0.678)] \\& = -(-0.53-0.424) \\& = 0.954\end{aligned}

Building Decision Tree using Information Gain the essentials

- Start with all training instances associated with the root node

- Use info gain to choose which attribute to label each node with

- Recursively construct each subtree on the subset of training instances that would be classified down that path in the tree.

- If all positive or all negative training instances remain, the label that node “yes" or “no" accordingly

- If no attributes remain label with a majority vote of training instances left at that node

- If no instances remain label with a majority vote of the parent's training instances.

Example: Now let us draw a Decision Tree for the following data using Information gain. Training set: 3 features and 2 classes

X Y Z C

1 1 1 I

1 1 0 I

0 0 1 II

1 0 0 II

Here, we have 3 features and 2 output classes. To build a decision tree using Information gain. We will take each of the features and calculate the information for each feature.
Split on attribute X Split on attribute Y Split on attribute Z
From the above images we can see that the information gain is maximum when we make a split on feature Y. So, for the root node best-suited feature is feature Y. Now we can see that while splitting the dataset by feature Y, the child contains a pure subset of the target variable. So we don't need to further split the dataset. The final tree for the above dataset would look like this:
information gain on attribute Y
2. Gini Index

Gini Index is a metric to measure how often a randomly chosen element would be incorrectly identified. It means an attribute with a lower Gini index should be preferred. Sklearn supports “Gini” criteria for Gini Index and by default it takes “gini” value.

For example if we have a group of people where all bought the product (100% "Yes") the Gini Index is 0 indicate perfect purity. But if the group has an equal mix of "Yes" and "No" the Gini Index would be 0.5 show high impurity or uncertainty. Formula for Gini Index is given by :

Gini = 1 - \sum_{i=1}^{n} p_i^2

Some additional features of the Gini Index are:

- It is calculated by summing the squared probabilities of each outcome in a distribution and subtracting the result from 1.

- A lower Gini Index indicates a more homogeneous or pure distribution while a higher Gini Index indicates a more heterogeneous or impure distribution.

- In decision trees the Gini Index is used to evaluate the quality of a split by measuring the difference between the impurity of the parent node and the weighted impurity of the child nodes.

- Compared to other impurity measures like entropy, the Gini Index is faster to compute and more sensitive to changes in class probabilities.

- One disadvantage of the Gini Index is that it tends to favour splits that create equally sized child nodes, even if they are not optimal for classification accuracy.

- In practice the choice between using the Gini Index or other impurity measures depends on the specific problem and dataset and requires experimentation and tuning.

Understanding Decision Tree with Real life use case:

Till now we have understand about the attributes and components of decision tree. Now lets jump to a real life use case in which how decision tree works step by step.

Step 1. Start with the Whole Dataset

We begin with all the data which is treated as the root node of the decision tree.

Step 2. Choose the Best Question (Attribute)

Pick the best question to divide the dataset. For example ask: "What is the outlook?"

Possible answers: Sunny, Cloudy or Rainy.

Step 3. Split the Data into Subsets

Divide the dataset into groups based on the question:

- If Sunny go to one subset.

- If Cloudy go to another subset.

- If Rainy go to the last subset.

Step 4. Split Further if Needed (Recursive Splitting)

For each subset ask another question to refine the groups. For example If the Sunny subset is mixed ask: "Is the humidity high or normal?"

- High humidity → "Swimming".

- Normal humidity → "Hiking".

Step 5. Assign Final Decisions (Leaf Nodes)

When a subset contains only one activity, stop splitting and assign it a label:

- Cloudy → "Hiking".

- Rainy → "Stay Inside".

- Sunny + High Humidity → "Swimming".

- Sunny + Normal Humidity → "Hiking".

Step 6. Use the Tree for Predictions

To predict an activity follow the branches of the tree. Example: If the outlook is Sunny and the humidity is High follow the tree:

- Start at Outlook .

- Take the branch for Sunny.

- Then go to Humidity and take the branch for High Humidity.

- Result: "Swimming".

A decision tree works by breaking down data step by step asking the best possible questions at each point and stopping once it reaches a clear decision. It's an easy and understandable way to make choices. Because of their simple and clear structure decision trees are very helpful in machine learning for tasks like sorting data into categories or making predictions.

Machine Learning

AI-ML-DS With Python

Machine Learning Basics

- Introduction to Machine Learning 8 min read

- Types of Machine Learning 7 min read

- What is Machine Learning Pipeline? 6 min read

- Applications of Machine Learning 3 min read

Python for Machine Learning

- Machine Learning with Python Tutorial 3 min read

- NumPy Tutorial 3 min read

- Pandas Tutorial 4 min read

- Data Preprocessing in Python 4 min read

- EDA - Exploratory Data Analysis in Python 6 min read

Feature Engineering

- What is Feature Engineering? 5 min read

- Introduction to Dimensionality Reduction 4 min read

- Feature Selection Techniques in Machine Learning 4 min read

Supervised Learning

- Supervised Machine Learning 7 min read

- Linear Regression in Machine learning 14 min read

- Logistic Regression in Machine Learning 10 min read

- Decision Tree in Machine Learning 8 min read

- Random Forest Algorithm in Machine Learning 5 min read

- K-Nearest Neighbor(KNN) Algorithm 8 min read

- Support Vector Machine (SVM) Algorithm 9 min read

- Naive Bayes Classifiers 6 min read

Unsupervised Learning

- What is Unsupervised Learning 5 min read

- K means Clustering – Introduction 6 min read

- Hierarchical Clustering in Machine Learning 6 min read

- DBSCAN Clustering in ML - Density based clustering 6 min read

- Apriori Algorithm 6 min read

- Frequent Pattern Growth Algorithm 4 min read

- ECLAT Algorithm - ML 5 min read

- Principal Component Analysis (PCA) 7 min read

Model Evaluation and Tuning

- Evaluation Metrics in Machine Learning 9 min read

- Regularization in Machine Learning 5 min read

- Cross Validation in Machine Learning 5 min read

- Hyperparameter Tuning 5 min read

- Underfitting and Overfitting in ML 3 min read

- Bias and Variance in Machine Learning 6 min read

Advanced Techniques

- Reinforcement Learning 9 min read

- Semi-Supervised Learning in ML 5 min read

- Self-Supervised Learning (SSL) 6 min read

- Ensemble Learning 7 min read

Machine Learning Practice

- Machine Learning Interview Questions and Answers 15+ min read

- 100+ Machine Learning Projects with Source Code 5 min read
