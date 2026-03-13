# Hyperparameter Tuning

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/hyperparameter-tuning/
Original Path: https://www.geeksforgeeks.org/machine-learning/hyperparameter-tuning/
Course: Machine Learning

Hyperparameter Tuning

Last Updated : 23 Dec, 2025

Hyperparameter tuning is the process of selecting the optimal values for a machine learning model's hyperparameters. These are typically set before the actual training process begins and control aspects of the learning process itself.

Effective tuning helps the model learn better patterns, avoid overfitting or underfitting and achieve higher accuracy on unseen data.

Techniques for Hyperparameter Tuning

Models can have many hyperparameters and finding the best combination of parameters can be treated as a search problem. The two best strategies for Hyperparameter tuning are:

1. GridSearchCV

GridSearchCV is a brute-force technique for hyperparameter tuning. It trains the model using all possible combinations of specified hyperparameter values to find the best-performing setup. It is slow and uses a lot of computer power which makes it hard to use with big datasets or many settings. It works using below steps:

- Create a grid of potential values for each hyperparameter.

- Train the model for every combination in the grid.

- Evaluate each model using cross-validation.

- Select the combination that gives the highest score.

For example if we want to tune two hyperparameters C and Alpha for a Logistic Regression Classifier model with the following sets of values:
C = [0.1, 0.2, 0.3, 0.4, 0.5]
Alpha = [0.01, 0.1, 0.5, 1.0]

The grid search technique will construct multiple versions of the model with all possible combinations of C and Alpha, resulting in a total of 5 * 4 = 20 different models. The best-performing combination is then chosen.

Example: Tuning Logistic Regression with GridSearchCV

The following code illustrates how to use GridSearchCV . In this below code:

- We generate sample data using make_classification.

- We define a range of
C
values using logarithmic scale.

- GridSearchCV tries all combinations from param_grid and uses 5-fold cross-validation.

- It returns the best hyperparameter (
C
) and its corresponding validation score

Python

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV
import numpy as np
from sklearn.datasets import make_classification

X , y = make_classification (
n_samples = 1000 , n_features = 20 , n_informative = 10 , n_classes = 2 , random_state = 42 )

c_space = np . logspace ( - 5 , 8 , 15 )
param_grid = { 'C' : c_space }

logreg = LogisticRegression ()

logreg_cv = GridSearchCV ( logreg , param_grid , cv = 5 )

logreg_cv . fit ( X , y )

print ( "Tuned Logistic Regression Parameters: {} " . format ( logreg_cv . best_params_ ))
print ( "Best score is {} " . format ( logreg_cv . best_score_ ))

Output:

Tuned Logistic Regression Parameters: {'C': 0.006105402296585327}
Best score is 0.853

This represents the highest accuracy achieved by the model using the hyperparameter combination C = 0.0061. The best score of 0.853 means the model achieved 85.3% accuracy on the validation data during the grid search process.

2. RandomizedSearchCV

As the name suggests RandomizedSearchCV picks random combinations of hyperparameters from the given ranges instead of checking every single combination like GridSearchCV.

- In each iteration it tries a new random combination of hyperparameter values.

- It records the model’s performance for each combination.

- After several attempts it selects the best-performing set.

Example: Tuning Decision Tree with RandomizedSearchCV

The following code illustrates how to use RandomizedSearchCV. In this example:

- We define a range of values for each hyperparameter e.g, max_depth, min_samples_leaf etc.

- Random combinations are picked and evaluated using 5-fold cross-validation.

- The best combination and score are printed.

Python

import numpy as np
from sklearn.datasets import make_classification

X , y = make_classification ( n_samples = 1000 , n_features = 20 , n_informative = 10 , n_classes = 2 , random_state = 42 )

from scipy.stats import randint
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import RandomizedSearchCV

param_dist = {
"max_depth" : [ 3 , None ],
"max_features" : randint ( 1 , 9 ),
"min_samples_leaf" : randint ( 1 , 9 ),
"criterion" : [ "gini" , "entropy" ]
}

tree = DecisionTreeClassifier ()
tree_cv = RandomizedSearchCV ( tree , param_dist , cv = 5 )
tree_cv . fit ( X , y )

print ( "Tuned Decision Tree Parameters: {} " . format ( tree_cv . best_params_ ))
print ( "Best score is {} " . format ( tree_cv . best_score_ ))

Output:

Tuned Decision Tree Parameters: {'criterion': 'entropy', 'max_depth': None, 'max_features': 6, 'min_samples_leaf': 6}
Best score is 0.8

A score of 0.842 means the model performed with an accuracy of 84.2% on the validation set with following hyperparameters.

3. Bayesian Optimization

Grid Search and Random Search can be inefficient because they blindly try many hyperparameter combinations, even if some are clearly not useful. Bayesian Optimization takes a smarter approach. It treats hyperparameter tuning like a mathematical optimization problem and learns from past results to decide what to try next.

- Build a probabilistic model (surrogate function) that predicts performance based on hyperparameters.

- Update this model after each evaluation.

- Use the model to choose the next best set to try.

- Repeat until the optimal combination is found. The surrogate function models:

P(\text{score}(y) \mid \text{hyperparameters}(x))

Here the surrogate function models the relationship between hyperparameters x and the score y . By updating this model iteratively with each new evaluation Bayesian optimization makes more informed decisions. Common surrogate models used in Bayesian optimization include:

- Gaussian Processes

- Random Forest Regression

- Tree-structured Parzen Estimators (TPE)

Advantages of Hyperparameter tuning

- Improved Model Performance : Finding the optimal combination of hyperparameters can significantly boost model accuracy and robustness.

- Reduced Overfitting and Underfitting : Tuning helps to prevent both overfitting and underfitting resulting in a well-balanced model.

- Enhanced Model Generalizability : By selecting hyperparameters that optimize performance on validation data the model is more likely to generalize well to unseen data.

- Optimized Resource Utilization : With careful tuning resources such as computation time and memory can be used more efficiently avoiding unnecessary work.

- Improved Model Interpretability : Properly tuned hyperparameters can make the model simpler and easier to interpret.

Challenges

- Dealing with High-Dimensional Hyperparameter Spaces: The larger the hyperparameter space the more combinations need to be explored. This makes the search process computationally expensive and time-consuming especially for complex models with many hyperparameters.

- Incorporating Domain Knowledge: It can help guide the hyperparameter search, narrowing down the search space and making the process more efficient. Using insights from the problem context can improve both the efficiency and effectiveness of tuning.

- Developing Adaptive Hyperparameter Tuning Methods: Dynamic adjustment of hyperparameters during training such as learning rate schedules or early stopping can lead to better model performance.

Machine Learning

AI-ML-DS

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
