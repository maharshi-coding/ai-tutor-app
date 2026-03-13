# Cost function in Logistic Regression in Machine Learning

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/ml-cost-function-in-logistic-regression/
Original Path: https://www.geeksforgeeks.org/machine-learning/ml-cost-function-in-logistic-regression/
Course: Machine Learning

Cost function in Logistic Regression in Machine Learning

Last Updated : 19 Jan, 2026

Logistic Regression is a supervised learning algorithm used for classification problems. To measure how well the model is performing, we use a cost function, which tells us how far the predicted values are from the actual ones. In Logistic Regression, the cost function is based on log loss (cross-entropy loss) instead of mean squared error.

- It measures the error between the predicted probability and the actual class label (0 or 1).

- Instead of a straight line (like Linear Regression), Logistic Regression works with probabilities between 0 and 1 using the sigmoid function .

- The cost function penalizes wrong predictions more heavily when the model is confident but wrong.

The cost function is defined as:

Cost(h_\theta(x), y) = -y \cdot \log(h_\theta(x)) - (1-y) \cdot \log(1-h_\theta(x))

Where:

- h_\theta(x) : Predicted probability using sigmoid

- y : Actual value (0 or 1)

For all training examples, the cost function (log loss) becomes:

J(\theta) = -\frac{1}{m} \sum_{i=1}^{m} \Big[y^{(i)} \log(h_\theta(x^{(i)})) + (1-y^{(i)}) \log(1-h_\theta(x^{(i)}))\Big]

Why Not Use Mean Squared Error (MSE)

- MSE works well for regression, but in Logistic Regression it creates a non-convex curve (multiple local minima).

- Log loss ensures a convex cost function , making optimization with Gradient Descent easier and guaranteeing a global minimum.

Implementing Logistic Regression Cost Function in Python

Here in this code demonstrates how Logistic Regression computes predicted probabilities using the sigmoid function and evaluates model performance using the log loss (binary cross-entropy) cost function. It shows how prediction confidence affects the overall error in a simple, numerically stable way.

Python

import numpy as np

def sigmoid ( z ):
return 1 / ( 1 + np . exp ( - z ))

def log_loss ( y_true , y_pred , eps = 1e-15 ):
y_pred = np . clip ( y_pred , eps , 1 - eps )
m = y_true . shape [ 0 ]
return - np . mean (
y_true * np . log ( y_pred ) +
( 1 - y_true ) * np . log ( 1 - y_pred )
)

X = np . array ([ 0.2 , 0.4 , 0.6 ])
y = np . array ([ 0 , 1 , 1 ])

theta = 0.5

z = X * theta

y_pred = sigmoid ( z )

print ( "Predicted Probabilities:" , y_pred )
print ( "Log Loss Value:" , log_loss ( y , y_pred ))

Output:

Predicted Probabilities: [0.52497919 0.549834 0.57444252]
Cost Function Value: 0.6322969246412298

- Predicted Probabilities: These are the model’s estimated chances of the positive class, all close to 0.5, indicating low confidence.

- Cost Function Value: The log loss of 0.63 shows moderate error, meaning the model’s predictions need improvement.

Related Articles

- Logistic Regression

- Mean Squared Error (MSE)

Machine Learning

python

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
