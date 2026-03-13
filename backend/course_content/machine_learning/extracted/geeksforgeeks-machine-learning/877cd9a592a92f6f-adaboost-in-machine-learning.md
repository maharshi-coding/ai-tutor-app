# AdaBoost in Machine Learning

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/adaboost-in-machine-learning/
Original Path: https://www.geeksforgeeks.org/machine-learning/adaboost-in-machine-learning/
Course: Machine Learning

AdaBoost in Machine Learning

Last Updated : 14 Nov, 2025

AdaBoost is a boosting technique that combines several weak classifiers in sequence to build a strong one. Each new model focuses on correcting the mistakes of the previous one until all data is correctly classified or a set number of iterations is reached.

Think of it like in a class, a teacher focuses more on weak learners to improve its academic performance, similarly boosting work.

Adaboost Working

AdaBoost (Adaptive Boosting) assigns equal weights to all training samples initially and iteratively adjusts these weights by focusing more on misclassified data points for the next model. It effectively reduces bias and variance making it useful for classification tasks but it can be sensitive to noisy data and outliers.
Training a boosting model
The above diagram explains the AdaBoost algorithm in a very simple way. Let’s try to understand it in a stepwise process:

Step 1: Initial Model (B1)

- The dataset consists of multiple data points (red, blue and green circles).

- Equal weight is assigned to each data point.

- The first weak classifier attempts to create a decision boundary.

- 8 data points are wrongly classified.

Step 2: Adjusting Weights (B2)

- The misclassified points from B1 are assigned higher weights (shown as darker points in the next step).

- A new classifier is trained with a refined decision boundary focusing more on the previously misclassified points.

- Some previously misclassified points are now correctly classified.

- 6 data points are wrongly classified.

Step 3: Further Adjustment (B3)

- The newly misclassified points from B2 receive higher weights to ensure better classification.

- The classifier adjusts again using an improved decision boundary and 4 data points remain misclassified.

Step 4: Final Strong Model (B4 - Ensemble Model)

- The final ensemble classifier combines B1, B2 and B3 to get strengths of all weak classifiers.

- By aggregating multiple models the ensemble model achieves higher accuracy than any individual weak model.

Now that we have learned how boosting works using Adaboost now we will learn more about different types of boosting algorithms.

Types Of Boosting Algorithms

There are several types of boosting algorithms some of the most famous and useful models are as :

- Gradient Boosting: Gradient Boosting constructs models in a sequential manner where each weak learner minimizes the residual error of the previous one using gradient descent. Instead of adjusting sample weights like AdaBoost Gradient Boosting reduces error directly by optimizing a loss function.

- XGBoost: XGBoost is an optimized version of Gradient Boosting that uses regularization to prevent overfitting. It is faster, efficient and supports handling both numerical and categorical variables.

- CatBoost: CatBoost is particularly effective for datasets with categorical features. It employs symmetric decision trees and a unique encoding method that considers target values, making it superior in handling categorical data without preprocessing.

Advantages of Boosting

- Improved Accuracy : By combining multiple weak learners it enhances predictive accuracy for both classification and regression tasks.

- Robustness to Overfitting : Unlike traditional models it dynamically adjusts weights to prevent overfitting.

- Handles Imbalanced Data Well : It prioritizes misclassified points making it effective for imbalanced datasets.

- Better Interpretability : The sequential nature of helps break down decision-making making the model more interpretable.

By understanding Boosting and its applications we can use its capabilities to solve complex real-world problems effectively.

Related Article

- Implementing the AdaBoost Algorithm From Scratch

Machine Learning

AI-ML-DS

data-science

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
