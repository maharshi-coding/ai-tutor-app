# SVM Hyperparameter Tuning using GridSearchCV - ML

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/svm-hyperparameter-tuning-using-gridsearchcv-ml/
Original Path: https://www.geeksforgeeks.org/machine-learning/svm-hyperparameter-tuning-using-gridsearchcv-ml/
Course: Machine Learning

SVM Hyperparameter Tuning using GridSearchCV - ML

Last Updated : 2 Sep, 2025

Support Vector Machines (SVM) are used for classification tasks but their performance depends on the right choice of hyperparameters like C and gamma. Finding the optimal combination of these hyperparameters can be a issue. GridSearchCV automates this process by systematically testing various combinations of hyperparameters and selecting the best one based on cross-validation results.

Let see its implementation:

Step 1: Importing Necessary Libraries

We will be using Pandas , NumPy and Scikit-learn for building and evaluating the model.

Python

import pandas as pd
import numpy as np
from sklearn.metrics import classification_report , confusion_matrix
from sklearn.datasets import load_breast_cancer
from sklearn.svm import SVC

Step 2: Loading and Printing the Dataset

In this example we will use Breast Cancer dataset from Scikit-learn. This dataset contains data about cell features and their corresponding cancer diagnosis i.e malignant or benign.

Python

cancer = load_breast_cancer ()

df_feat = pd . DataFrame ( cancer [ 'data' ], columns = cancer [ 'feature_names' ])
df_target = pd . DataFrame ( cancer [ 'target' ], columns = [ 'Cancer' ])

print ( "Feature Variables: " )
print ( df_feat . info ())
print ( "Dataframe looks like : " )
print ( df_feat . head ())

Output:

Step 3: Splitting the Data into Training and Testing Sets

We will split the dataset into training (70%) and testing (30%) sets using train_test_split.

Python

from sklearn.model_selection import train_test_split

X_train , X_test , y_train , y_test = train_test_split (
df_feat , np . ravel ( df_target ),
test_size = 0.30 , random_state = 101 )

Step 4: Training an SVM Model without Hyperparameter Tuning

Before tuning the model let’s train a simple SVM classifier without any hyperparameter tuning.

Python

model = SVC ()
model . fit ( X_train , y_train )

predictions = model . predict ( X_test )
print ( classification_report ( y_test , predictions ))

Output:
Training without Hyperparameter Tuning
While the accuracy is around 92%, we can improve the model’s performance by tuning the hyperparameters.

Step 5: Hyperparameter Tuning with GridSearchCV

Now let’s use GridSearchCV to find the best combination of C, gamma and kernel hyperparameters for the SVM model. But before that leys understand these parameters:

- C: Controls the trade-off between a wider margin (low C) and correctly classifying all points (high C).

- gamma: Determines how far the influence of each data point reaches with high gamma fitting tightly to the data.

- kernel: Defines the function used to transform data for separating classes. For example linear or rbf.

Python

from sklearn.model_selection import GridSearchCV

param_grid = { 'C' : [ 0.1 , 1 , 10 , 100 , 1000 ],
'gamma' : [ 1 , 0.1 , 0.01 , 0.001 , 0.0001 ],
'kernel' : [ 'rbf' ]}

grid = GridSearchCV ( SVC (), param_grid , refit = True , verbose = 3 )

grid . fit ( X_train , y_train )

Output:
Hyperparameter Tuning with GridSearchCV
Step 6: Get the Best Hyperparameters and Model

After grid search finishes we can check best hyperparameters and the optimized model.

Python

print ( grid . best_params_ )

print ( grid . best_estimator_ )

Output:
Hyperparameters and Model
Step 7: Evaluating the Optimized Model

We can evaluate the optimized model on the test dataset.

Python

grid_predictions = grid . predict ( X_test )

print ( classification_report ( y_test , grid_predictions ))

Output:
Model evaluation
After hyperparameter tuning, the accuracy of the model increased to 94% showing that the tuning process improved the model’s performance. By using this approach, we can improve the model which helps in making it more accurate and reliable.

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
