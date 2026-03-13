# Linear Regression in Machine learning

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/ml-linear-regression/
Original Path: https://www.geeksforgeeks.org/machine-learning/ml-linear-regression/
Course: Machine Learning

Linear Regression in Machine learning

Last Updated : 23 Feb, 2026

Linear regression is a type of supervised machine-learning algorithm that learns from the labelled datasets and maps the data points with most optimized linear functions which can be used for prediction on new datasets. It assumes that there is a linear relationship between the input and output, meaning the output changes at a constant rate as the input changes. This relationship is represented by a straight line.

For example we want to predict a student's exam score based on how many hours they studied. We observe that as students study more hours, their scores go up. In the example of predicting exam scores based on hours studied. Here

- Independent variable (input): Hours studied because it's the factor we control or observe.

- Dependent variable (output): Exam score because it depends on hobw many hours were studied.

We use the independent variable to predict the dependent variable.

Best Fit Line in Linear Regression

In linear regression, the best-fit line is the straight line that most accurately represents the relationship between the independent variable (input) and the dependent variable (output). It is the line that minimizes the difference between the actual data points and the predicted values from the model.

1. Goal of the Best-Fit Line

The goal of linear regression is to find a straight line that minimizes the error (the difference) between the observed data points and the predicted values. This line helps us predict the dependent variable for new, unseen data.
Linear Regression
Here Y is called a dependent or target variable and X is called an independent variable also known as the predictor of Y.

- \theta_1 represents the intercept, which is the value of Y when X = 0

- \theta_2 represents the slope, which shows how much Y changes for a unit change in X

There are many types of functions or modules that can be used for regression. A linear function is the simplest type of function. Here, X may be a single feature or multiple features representing the problem.

2. Equation of the Best-Fit Line

For simple linear regression (with one independent variable), the best-fit line is represented by the equation

y = mx + b Sum of squared errors (SSE) = y = mx + b

Where:

- y is the predicted value (dependent variable)

- x is the input (independent variable)

- m is the slope of the line (how much y changes when x changes)

- b is the intercept (the value of y when x = 0)

The best-fit line will be the one that optimizes the values of m (slope) and b (intercept) so that the predicted y values are as close as possible to the actual data points.

3. Minimizing the Error: The Least Squares Method

To find the best-fit line, we use a method called Least Squares . The idea behind this method is to minimize the sum of squared differences between the actual values (data points) and the predicted values from the line. These differences are called residuals.

The formula for residuals is:

Residual = yᵢ - ŷᵢ

Where:

- yᵢ is the actual observed value

- ŷᵢ is the predicted value from the line for that xᵢ

The least squares method minimizes the sum of the squared residuals:

Σ(yᵢ - ŷᵢ)²

This method ensures that the line best represents the data where the sum of the squared differences between the predicted values and actual values is as small as possible.

4. Interpretation of the Best-Fit Line

- Slope (m): The slope of the best-fit line indicates how much the dependent variable (y) changes with each unit change in the independent variable (x). For example if the slope is 5, it means that for every 1-unit increase in x, the value of y increases by 5 units.

- Intercept (b): The intercept represents the predicted value of y when x = 0. It’s the point where the line crosses the y-axis.

In linear regression some hypothesis are made to ensure reliability of the model's results.

Limitations:

- Assumes Linearity: The method assumes the relationship between the variables is linear. If the relationship is non-linear, linear regression might not work well.

- Sensitivity to Outliers: Outliers can significantly affect the slope and intercept, skewing the best-fit line.

Hypothesis function in Linear Regression

In linear regression, the hypothesis function is the equation used to make predictions about the dependent variable based on the independent variables. It represents the relationship between the input features and the target output.

For a simple case with one independent variable, the hypothesis function is:

h(x) = β₀ + β₁x

Where:

- h(x) or ( ŷ) is the predicted value of the dependent variable (y).

- x is the independent variable.

- β₀ is the intercept, representing the value of y when x is 0.

- β₁ is the slope, indicating how much y changes for each unit change in x.

For multiple linear regression (with more than one independent variable), the hypothesis function expands to:

h(x₁, x₂, ..., xₖ) = β₀ + β₁x₁ + β₂x₂ + ... + βₖxₖ

Where:

- x₁, x₂, ..., xₖ are the independent variables.

- β₀ is the intercept.

- β₁, β₂, ..., βₖ are the coefficients, representing the influence of each respective independent variable on the predicted output.

Assumptions of the Linear Regression

1. Linearity : The relationship between inputs (X) and the output (Y) is a straight line.
Linearity
2. Independence of Errors : The errors in predictions should not affect each other.

3. Constant Variance (Homoscedasticity): The errors should have equal spread across all values of the input. If the spread changes (like fans out or shrinks), it's called heteroscedasticity and it's a problem for the model.
Homoscedasticity
4. Normality of Errors : The errors should follow a normal (bell-shaped) distribution.

5. No Multicollinearity (for multiple regression) : Input variables shouldn’t be too closely related to each other.

6. No Autocorrelation : Errors shouldn't show repeating patterns, especially in time-based data.

7. Additivity : The total effect on Y is just the sum of effects from each X, no mixing or interaction between them.'

To understand Multicollinearity detail refer to article: Multicollinearity .

Types of Linear Regression

When there is only one independent feature it is known as Simple Linear Regression or Univariate Linear Regression and when there are more than one feature it is known as Multiple Linear Regression or Multivariate Regression .

1. Simple Linear Regression

Simple linear regression is used when we want to predict a target value (dependent variable) using only one input feature (independent variable). It assumes a straight-line relationship between the two.

Formula

\hat{y} = \theta_0 + \theta_1 x

Where:

- \hat{y} ​ is the predicted value

- x is the input (independent variable)

- \theta_0 is the intercept (value of \hat{y}​ when x=0)

- \theta_1 ​ is the slope or coefficient (how much \hat{y} ​ changes with one unit of x)

Example:

Predicting a person’s salary (y) based on their years of experience (x).

2. Multiple Linear Regression

Multiple linear regression involves more than one independent variable and one dependent variable. The equation for multiple linear regression is:

\hat{y} = \theta_0 + \theta_1 x_1 + \theta_2 x_2 + \cdots + \theta_n x_n

where:

- \hat{y} ​ is the predicted value

- x_1, x_2, \dots, x_n \quad are the independent variables

- \theta_1, \theta_2, \dots, \theta_n \quad are the coefficients (weights) corresponding to each predictor.

- \theta_0 \quad is the intercept.

The goal is to find the best-fit line that predicts Y accurately for given inputs X.

Use Cases

- Real Estate: Predict property prices using location, size and other factors.

- Finance: Forecast stock prices using interest rates and inflation data.

- Agriculture: Estimate crop yield from rainfall, temperature and soil quality.

- E-commerce: Analyze how price, promotions and seasons affect sales.

Once you understand linear regression and its types, the next step is building the model in practice.

Cost function for Linear Regression

In Linear Regression, the cost function measures how far the predicted values ( \hat{Y} ) are from the actual values (Y). It helps identify and reduce errors to find the best-fit line. The most common cost function used is Mean Squared Error (MSE), which calculates the average of squared differences between actual and predicted values:

\text{Cost function}(J) = \frac{1}{n}\sum_{n}^{i}(\hat{y_i}-y_i)^2

Here,

- \hat{y_i} = \theta_1 + \theta_2x_i

To minimize this cost, we use Gradient Descent, which iteratively updates θ 1 and θ 2 ​ until the MSE reaches its lowest value. This ensures the line fits the data as accurately as possible.

Gradient Descent for Linear Regression

Gradient descent is an optimization technique used to train a linear regression model by minimizing the prediction error. It works by starting with random model parameters and repeatedly adjusting them to reduce the difference between predicted and actual values.
Gradient Descent
How it works:

- Start with random values for slope and intercept.

- Calculate the error between predicted and actual values.

- Find how much each parameter contributes to the error (gradient).

- Update the parameters in the direction that reduces the error.

- Repeat until the error is as small as possible.

This helps the model find the best-fit line for the data.

For more details you can refer to: Gradient Descent in Linear Regression

Evaluation Metrics for Linear Regression

A variety of evaluation measures can be used to determine the strength of any linear regression model. These assessment metrics often give an indication of how well the model is producing the observed outputs.

The most common measurements are:

1. Mean Square Error (MSE)

Mean Squared Error (MSE) is an evaluation metric that calculates the average of the squared differences between the actual and predicted values for all the data points. The difference is squared to ensure that negative and positive differences don't cancel each other out.

MSE = \frac{1}{n}\sum_{i=1}^{n}\left ( y_i - \widehat{y_{i}} \right )^2

Here,

- n is the number of data points.

- y_i is the actual or observed value for the i^{th} data point.

- \widehat{y_{i}} is the predicted value for the i^{th} data point.

MSE is a way to quantify the accuracy of a model's predictions. MSE is sensitive to outliers as large errors contribute significantly to the overall score.

2. Mean Absolute Error (MAE)

Mean Absolute Error is an evaluation metric used to calculate the accuracy of a regression model. MAE measures the average absolute difference between the predicted values and actual values.

Mathematically MAE is expressed as:

MAE =\frac{1}{n} \sum_{i=1}^{n}|Y_i - \widehat{Y_i}|

Here,

- n is the number of observations

- Y i represents the actual values.

- \widehat{Y_i}

represents the predicted values

Lower MAE value indicates better model performance. It is not sensitive to the outliers as we consider absolute differences.

3. Root Mean Squared Error (RMSE)

The square root of the residuals' variance is the Root Mean Squared Error . It describes how well the observed data points match the expected values or the model's absolute fit to the data. In mathematical notation, it can be expressed as:

RMSE=\sqrt{\frac{RSS}{n}}=\sqrt\frac{{{\sum_{i=2}^{n}(y^{actual}_{i}}- y_{i}^{predicted})^2}}{n}

Where:

- n : Number of observations

- y_i : Actual value

- \hat{y_i} ​ : Predicted value

RMSE is in the same unit as the target variable and highlights larger errors more clearly.

4. Coefficient of Determination (R-squared)

R-Squared is a statistic that indicates how much variation the developed model can explain or capture. It is always in the range of 0 to 1. In general, the better the model matches the data, the greater the R-squared number.
In mathematical notation, it can be expressed as:

R^{2}=1-(^{\frac{RSS}{TSS}})

- Residual sum of Squares (RSS): The sum of squares of the residual for each data point in the plot or data is known as the residual sum of squares or RSS. It is a measurement of the difference between the output that was observed and what was anticipated.

RSS=\sum_{i=1}^{n}(y_{i}-b_{0}-b_{1}x_{i})^{2}

- Total Sum of Squares (TSS): The sum of the data points' errors from the answer variable's mean is known as the total sum of squares or TSS.

TSS=\sum_{i=1}^{n}(y-\overline{y_{i}})^2 .

R squared metric is a measure of the proportion of variance in the dependent variable that is explained the independent variables in the model.

5. Adjusted R-Squared Error

Adjusted R^2 measures the proportion of variance in the dependent variable that is explained by independent variables in a regression model. Adjusted R-square accounts the number of predictors in the model and penalizes the model for including irrelevant predictors that don't contribute significantly to explain the variance in the dependent variables.

Mathematically, adjusted R^2 is expressed as:

Adjusted \, R^2 = 1 - (\frac{(1-R^2).(n-1)}{n-k-1})

Here,

- n is the number of observations

- k is the number of predictors in the model

- R 2 is coeeficient of determination

It penalizes the inclusion of unnecessary predictors, helping to prevent overfitting.

Regularization Techniques for Linear Models

1. Lasso Regression (L1 Regularization)

Lasso Regression is a technique used for regularizing a linear regression model, it adds a penalty term to the linear regression objective function to prevent overfitting .

The objective function after applying lasso regression is:

J(\theta) = \frac{1}{2m} \sum_{i=1}^{m}(\widehat{y_i} - y_i) ^2+ \lambda \sum_{j=1}^{n}|\theta_j|

- the first term is the least squares loss, representing the squared difference between predicted and actual values.

- the second term is the L1 regularization term, it penalizes the sum of absolute values of the regression coefficient θ j .

2. Ridge Regression (L2 Regularization)

Ridge regression is a linear regression technique that adds a regularization term to the standard linear objective. Again, the goal is to prevent overfitting by penalizing large coefficient in linear regression equation. It useful when the dataset has multicollinearity where predictor variables are highly correlated.

The objective function after applying ridge regression is:

J(\theta) = \frac{1}{2m} \sum_{i=1}^{m}(\widehat{y_i} - y_i)^2 + \lambda \sum_{j=1}^{n}\theta_{j}^{2}

- the first term is the least squares loss, representing the squared difference between predicted and actual values.

- the second term is the L1 regularization term, it penalizes the sum of square of values of the regression coefficient θ j .

3. Elastic Net Regression

Elastic Net Regression is a hybrid regularization technique that combines the power of both L1 and L2 regularization in linear regression objective.

J(\theta) = \frac{1}{2m} \sum_{i=1}^{m}(\widehat{y_i} - y_i)^2 + \alpha \lambda \sum_{j=1}^{n}{|\theta_j|} + \frac{1}{2}(1- \alpha) \lambda \sum_{j=1}{n} \theta_{j}^{2}

- the first term is least square loss.

- the second term is L1 regularization and third is ridge regression.

- \lambda is the overall regularization strength.

- \alpha controls the mix between L1 and L2 regularization.

Now that we have learned how to make a linear regression model, now we will implement it.

Python Implementation of Linear Regression

1. Import the necessary libraries

Python

import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

2. Generating Random Dataset

Python

np . random . seed ( 42 )

X = np . random . rand ( 50 , 1 ) * 100

Y = 3.5 * X + np . random . randn ( 50 , 1 ) * 20

3. Creating and Training Linear Regression Model

Python

model = LinearRegression ()
model . fit ( X , Y )

4. Predicting Y Values

Python

Y_pred = model . predict ( X )

5. Visualizing the Regression Line

Python

plt . figure ( figsize = ( 8 , 6 ))
plt . scatter ( X , Y , color = 'blue' , label = 'Data Points' )
plt . plot ( X , Y_pred , color = 'red' , linewidth = 2 , label = 'Regression Line' )
plt . title ( 'Linear Regression on Random Dataset' )
plt . xlabel ( 'X' )
plt . ylabel ( 'Y' )
plt . legend ()
plt . grid ( True )
plt . show ()

Output :
Regression Line
6. Slope and Intercept

Python

print ( "Slope (Coefficient):" , model . coef_ [ 0 ][ 0 ])
print ( "Intercept:" , model . intercept_ [ 0 ])

Output :

Slope (Coefficient): 3.4553132007706204
Intercept: 1.9337854893777546

Why Linear Regression is Important

Here’s why linear regression is important:

- Simplicity and Interpretability: It’s easy to understand and interpret, making it a starting point for learning about machine learning.

- Predictive Ability : Helps predict future outcomes based on past data, making it useful in various fields like finance, healthcare and marketing.

- Basis for Other Models: Many advanced algorithms, like logistic regression or neural networks, build on the concepts of linear regression.

- Efficiency: It’s computationally efficient and works well for problems with a linear relationship.

- Widely Used: It’s one of the most widely used techniques in both statistics and machine learning for regression tasks.

- Analysis: It provides insights into relationships between variables (e.g., how much one variable influences another).

Advantages

- Linear regression is a relatively simple algorithm, making it easy to understand and implement. The coefficients of the linear regression model can be interpreted as the change in the dependent variable for a one-unit change in the independent variable, providing insights into the relationships between variables.

- Linear regression is computationally efficient and can handle large datasets effectively. It can be trained quickly on large datasets, making it suitable for real-time applications.

- Linear regression is relatively robust to outliers compared to other machine learning algorithms. Outliers may have a smaller impact on the overall model performance.

- Linear regression often serves as a good baseline model for comparison with more complex machine learning algorithms.

- Linear regression is a well-established algorithm with a rich history and is widely available in various machine learning libraries and software packages.

Limitations

- Linear regression assumes a linear relationship between the dependent and independent variables. If the relationship is not linear, the model may not perform well.

- Linear regression is sensitive to multicollinearity, which occurs when there is a high correlation between independent variables. Multicollinearity can inflate the variance of the coefficients and lead to unstable model predictions.

- Linear regression assumes that the features are already in a suitable form for the model. Feature engineering may be required to transform features into a format that can be effectively used by the model.

- Linear regression is susceptible to both overfitting and underfitting. Overfitting occurs when the model learns the training data too well and fails to generalize to unseen data. Underfitting occurs when the model is too simple to capture the underlying relationships in the data.

- Linear regression provides limited explanatory power for complex relationships between variables. More advanced machine learning techniques may be necessary for deeper insights.

Machine Learning

AI-ML-DS

ML-Regression

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
