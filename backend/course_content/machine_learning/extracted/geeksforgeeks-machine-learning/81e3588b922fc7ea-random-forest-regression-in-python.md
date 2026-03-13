# Random Forest Regression in Python

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/random-forest-regression-in-python/
Original Path: https://www.geeksforgeeks.org/machine-learning/random-forest-regression-in-python/
Course: Machine Learning

Random Forest Regression in Python

Last Updated : 23 Feb, 2026

A random forest is an ensemble learning method that combines the predictions from multiple decision trees to produce a more accurate and stable prediction. It can be used for both classification and regression tasks. In a regression task, we can use the Random Forest Regression technique for predicting numerical values. It predicts continuous values by averaging the results of multiple decision trees.

Working of Random Forest Regression

Random Forest Regression works by creating multiple of decision trees each trained on a random subset of the data. The process begins with Bootstrap sampling where random rows of data are selected with replacement to form different training datasets for each tree. After this we do feature sampling where only a random subset of features is used to build each tree ensuring diversity in the models.

After the trees are trained each tree make a prediction and the final prediction for regression tasks is the average of all the individual tree predictions and this process is called as Aggregation.
Random Forest Regression Model Working
This approach is beneficial because individual decision trees may have high variance and are prone to overfitting especially with complex data. However by averaging the predictions from multiple decision trees Random Forest minimizes this variance leading to more accurate and stable predictions and hence improving generalization of model.

Implementing Random Forest Regression in Python

We will be implementing random forest regression on salaries data.

1. Importing Libraries

Here we are importing numpy , pandas , matplotlib and scikit learn .

- RandomForestRegressor: This is the regression model that is based upon the Random Forest model.

- LabelEncoder: This class is used to encode categorical data into numerical values.

- train_test_split: This function is used to split a dataset into training and testing sets.

- mean_squared_error, r2_score : Used to evaluate regression performance.

Python

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import warnings

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error , r2_score
from sklearn.preprocessing import LabelEncoder

warnings . filterwarnings ( 'ignore' )

2. Importing Dataset

Now let's load the dataset in the panda's data frame. For better data handling and leveraging the handy functions to perform complex tasks in one go.

You can download dataset from here .

Python

df = pd . read_csv ( '/content/Position_Salaries.csv' )
print ( df )

Output:

Dataset
Python

df . info ()

Output:

Info of the dataset
3. Data Preparation

Here the code will extracts two subsets of data from the Dataset and stores them in separate variables.

- Extracting Features: It extracts the features from the DataFrame and stores them in a variable named X.

- Extracting Target Variable: It extracts the target variable from the DataFrame and stores it in a variable named y.

Python

X = df . iloc [:, 1 : 2 ] . values
y = df . iloc [:, 2 ] . values

Encoding categorical columns

If the dataset contains object-type columns, they are converted into numeric form using Label Encoding so that the machine learning model can process them.

Python

label_encoder = LabelEncoder ()

for col in df . select_dtypes ( include = [ 'object' ]) . columns :
df [ col ] = label_encoder . fit_transform ( df [ col ])

4. Splitting Dataset

The dataset is divided into training and testing sets so that the model is trained on one portion and evaluated on unseen data. This prevents overly optimistic performance results.

Python

X_train , X_test , y_train , y_test = train_test_split (
X , y ,
test_size = 0.2 ,
random_state = 42
)

5. Random Forest Regressor Model

The model is trained using the training dataset.

- n_estimators=100 : Number of decision trees in the forest.

- random_state=42 : Ensures reproducible results.

- oob_score=True : Uses out-of-bag samples to estimate model performance.

Python

regressor = RandomForestRegressor (
n_estimators = 100 ,
random_state = 42 ,
oob_score = True
)

regressor . fit ( X_train , y_train )

6. Making predictions and Evaluating

The code evaluates the trained Random Forest Regression model:

- oob_score_: Retrive out-of-bag (OOB) score which estimates the model's generalization performance.

- Predictions are made on the test set.

- Evaluates the model's performance using the Mean Squared Error (MSE) and R-squared (R2) metrics.

Python

print ( "Out-of-Bag Score:" , regressor . oob_score_ )

y_pred = regressor . predict ( X_test )

mse = mean_squared_error ( y_test , y_pred )
print ( "Mean Squared Error:" , mse )

r2 = r2_score ( y_test , y_pred )
print ( "R-squared:" , r2 )

Output:

Out-of-Bag Score: 0.2280694384742593
Mean Squared Error: 616145000.0
R-squared: 0.9878292345679013

- Out-of-Bag Score (0.228): Indicates how well the model generalizes using samples not seen during tree training. Low value suggests limited generalization performance.

- Mean Squared Error (616145000.0): Represents the average squared difference between actual and predicted salaries. Lower values mean predictions are closer to true values.

- R-squared (0.9878): Shows how much variance in salary is explained by the model and a value close to 1 means the model fits the data very well.

7. Visualizing

Now let's visualize the results obtained by using the RandomForest Regression model on our salaries dataset.

- Creates a grid of prediction points covering the range of the feature values.

- Plots the real data points as blue scatter points.

- Plots the predicted values for the prediction grid as a green line.

- Adds labels and a title to the plot for better understanding.

Python

import numpy as np

X_grid = np . arange ( min ( X [:, 0 ]), max ( X [:, 0 ]), 0.01 ) # Only the first feature
X_grid = X_grid . reshape ( - 1 , 1 )
X_grid = np . hstack (( X_grid , np . zeros (( X_grid . shape [ 0 ], 2 )))) # Pad with zeros

plt . scatter ( X [:, 0 ], y , color = 'blue' , label = "Actual Data" )
plt . plot ( X_grid [:, 0 ], regressor . predict ( X_grid ), color = 'green' , label = "Random Forest Prediction" )
plt . title ( "Random Forest Regression Results" )
plt . xlabel ( 'Position Level' )
plt . ylabel ( 'Salary' )
plt . legend ()
plt . show ()

Output:

8. Visualizing a Single Decision Tree from the Random Forest Model

The code visualizes one of the decision trees from the trained Random Forest model. Plots the selected decision tree, displaying the decision-making process of a single tree within the ensemble.

Python

from sklearn.tree import plot_tree
import matplotlib.pyplot as plt

tree_to_plot = regressor . estimators_ [ 0 ]

plt . figure ( figsize = ( 20 , 10 ))
plot_tree ( tree_to_plot , feature_names = df . columns . tolist (), filled = True , rounded = True , fontsize = 10 )
plt . title ( "Decision Tree from Random Forest" )
plt . show ()

Output:
Single Decision Tree from the Random Forest Model
Applications of Random Forest Regression

The Random forest regression has a wide range of real-world problems including:

- Predicting continuous numerical values: Predicting house prices, stock prices or customer lifetime value.

- Identifying risk factors: Detecting risk factors for diseases, financial crises or other negative events.

- Handling high-dimensional data: Analyzing datasets with a large number of input features.

- Capturing complex relationships: Modeling complex relationships between input features and the target variable.

Advantages of Random Forest Regression

- Handles Non-Linearity : It can capture complex, non-linear relationships in the data that other models might miss.

- Reduces Overfitting : By combining multiple decision trees and averaging predictions it reduces the risk of overfitting compared to a single decision tree.

- Robust to Outliers : Random Forest is less sensitive to outliers as it aggregates the predictions from multiple trees.

- Works Well with Large Datasets : It can efficiently handle large datasets and high-dimensional data without a significant loss in performance.

- Handles Missing Data : Random Forest can handle missing values by using surrogate splits and maintaining high accuracy even with incomplete data.

- No Need for Feature Scaling : Unlike many other algorithms Random Forest does not require normalization or scaling of the data.

Disadvantages of Random Forest Regression

- Complexity : It can be computationally expensive and slow to train especially with a large number of trees and high-dimensional data. Due to this it may not be suitable for real-time predictions especially with a large number of trees.

- Less Interpretability : Since it uses many trees it can be harder to interpret compared to simpler models like linear regression or decision trees.

- Memory Intensive : Storing multiple decision trees for large datasets require significant memory resources.

- Overfitting on Noisy Data : While Random Forest reduces overfitting, it can still overfit if the data is highly noisy especially with a large number of trees.

- Sensitive to Imbalanced Data : It may perform poorly if the dataset is highly imbalanced like one class is significantly more frequent than another.

Random Forest Regression has become a important tool for continuous prediction tasks with advantages over traditional decision trees. Its capability to handle high-dimensional data, capture complex relationships and reduce overfitting has made it useful.

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
