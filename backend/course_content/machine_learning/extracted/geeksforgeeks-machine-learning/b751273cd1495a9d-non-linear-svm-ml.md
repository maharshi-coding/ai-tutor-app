# Non-Linear SVM - ML

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/ml-non-linear-svm/
Original Path: https://www.geeksforgeeks.org/machine-learning/ml-non-linear-svm/
Course: Machine Learning

Non-Linear SVM - ML

Last Updated : 13 Nov, 2025

Support Vector Machines (SVM) are algorithms for classification and regression tasks. However, the standard (linear) SVM can only classify data that is linearly separable, meaning a straight line can separate the classes (in 2D) or a hyperplane (in higher dimensions). Non-linear SVM extends SVM to handle complex, non-linearly separable data using kernels.
Linear vs Non-Linear SVM
For example, imagine classifying fruits like apples and oranges based on features like colour and texture. The apple data points might form a circular cluster surrounded by oranges. A simple SVM can’t separate them, but a non-linear SVM handles this by using kernel functions to create curved boundaries, allowing it to classify such complex, non-linear patterns accurately.

What is Kernel?

Instead of explicitly transforming data, the kernel computes dot products in a higher-dimensional space, helping the model find patterns and separate complex data more easily. For example, suppose we have data points shaped like two concentric circles:

- One circle represents one class.

- The other circle represents another class.

If we try to separate these classes with a straight line it can't be done because the data is not linearly separable in its current form.

When we use a kernel function it transforms the original 2D data like the concentric circles into a higher-dimensional space where the data becomes linearly separable. In that higher-dimensional space the SVM finds a simple straight-line decision boundary to separate the classes.

When we bring this straight-line decision boundary back to the original 2D space it no longer looks like a straight line. Instead, it appears as a circular boundary that perfectly separates the two classes. This happens because the kernel trick allows the SVM to "see" the data in a new way enabling it to draw a boundary that fits the original shape of the data.

Popular kernel functions in SVM

- Radial Basis Function (RBF) : Captures patterns in data by measuring the distance between points and is ideal for circular or spherical relationships. It is widely used as it creates flexible decision boundary.

- Linear Kernel : Works for data that is linearly separable problem without complex transformations.

- Polynomial Kernel : Models more complex relationships using polynomial equations.

- Sigmoid Kernel : Mimics neural network behavior using sigmoid function and is suitable for specific non-linear problems.

Below are some examples of Non-Linear SVM Classification.

Example 1: Non linear SVM in Circular Decision Boundary

Below is the Python implementation for Non linear SVM in circular decision boundary.

1. Importing Libraries

We begin by importing the necessary libraries for data generation, model training, evaluation and visualization.

Python

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_circles
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

2. Creating and Splitting the Dataset

We generate a synthetic dataset of concentric circles and split it into training and testing sets.

Python

X , y = make_circles ( n_samples = 500 , factor = 0.5 , noise = 0.05 , random_state = 42 )
X_train , X_test , y_train , y_test = train_test_split ( X , y , test_size = 0.3 , random_state = 42 )

3. Creating and Training the Non-Linear SVM Model

We create an SVM classifier using the RBF kernel to handle non-linear patterns and train it on the data.

Python

svm = SVC ( kernel = 'rbf' , C = 1 , gamma = 0.5 ) # RBF kernel allows learning circular boundaries
svm . fit ( X_train , y_train )

4. Making Predictions and Evaluating the Model

We predict the labels for the test set and compute the accuracy of the model.

Python

y_pred = svm . predict ( X_test )
accuracy = accuracy_score ( y_test , y_pred )
print ( f "Accuracy: { accuracy : .2f } " )

5. Visualizing the Decision Boundary

We define a function to visualize the decision boundary of the trained non-linear SVM on the dataset.

Python

def plot_decision_boundary ( X , y , model ):
x_min , x_max = X [:, 0 ] . min () - 1 , X [:, 0 ] . max () + 1
y_min , y_max = X [:, 1 ] . min () - 1 , X [:, 1 ] . max () + 1
xx , yy = np . meshgrid ( np . arange ( x_min , x_max , 0.01 ),
np . arange ( y_min , y_max , 0.01 ))

Z = model . predict ( np . c_ [ xx . ravel (), yy . ravel ()])
Z = Z . reshape ( xx . shape )

plt . contourf ( xx , yy , Z , alpha = 0.8 , cmap = plt . cm . Paired )
plt . scatter ( X [:, 0 ], X [:, 1 ], c = y , edgecolor = 'k' , cmap = plt . cm . Paired )
plt . title ( "Non-linear SVM with RBF Kernel" )
plt . show ()

# Plot the decision boundary
plot_decision_boundary ( X , y , svm )

Output :
Non Linear SVM with RBF kernel
Non linear SVM provided a decision boundary where the SVM successfully separates the two circular classes (inner and outer circles) using a curved boundary with help of RBF kernel.

Example 2: Non linear SVM for R adial Curve Pattern

Now we will see how different kernel works. We will be using polynomial kernel function for dataset with radial curve pattern.

1. Importing Libraries

We import essential libraries for dataset creation, SVM modeling, evaluation and visualization.

Python

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

2. Creating and Splitting the Dataset

We generate a synthetic "two moons" dataset which is non-linearly separable and split it into training and test sets.

Python

X , y = make_moons ( n_samples = 500 , noise = 0.1 , random_state = 42 )
X_train , X_test , y_train , y_test = train_test_split ( X , y , test_size = 0.3 , random_state = 42 )

3. Creating and Training the SVM with Polynomial Kernel

We build an SVM classifier with a polynomial kernel and train it on the training data.

Python

svm_poly = SVC ( kernel = 'poly' , degree = 3 , C = 1 , coef0 = 1 ) # degree and coef0 control the curve of the boundary
svm_poly . fit ( X_train , y_train )

4. Making Predictions and Evaluating the Model

We use the trained model to predict test labels and evaluate its accuracy.

Python

y_pred = svm_poly . predict ( X_test )
accuracy = accuracy_score ( y_test , y_pred )
print ( f "Accuracy: { accuracy : .2f } " )

5. Visualizing the Decision Boundary

We define a function to plot the decision boundary learned by the SVM with a polynomial kernel.

Python

def plot_decision_boundary ( X , y , model ):
x_min , x_max = X [:, 0 ] . min () - 1 , X [:, 0 ] . max () + 1
y_min , y_max = X [:, 1 ] . min () - 1 , X [:, 1 ] . max () + 1
xx , yy = np . meshgrid ( np . arange ( x_min , x_max , 0.01 ),
np . arange ( y_min , y_max , 0.01 ))

Z = model . predict ( np . c_ [ xx . ravel (), yy . ravel ()])
Z = Z . reshape ( xx . shape )

plt . contourf ( xx , yy , Z , alpha = 0.8 , cmap = plt . cm . Paired )
plt . scatter ( X [:, 0 ], X [:, 1 ], c = y , edgecolor = 'k' , cmap = plt . cm . Paired )
plt . title ( "Non-linear SVM with Polynomial Kernel" )
plt . show ()

plot_decision_boundary ( X , y , svm_poly )

Output:
Non linear SVM with Polynomial Kernel
Polynomial kernel creates a smooth, non-linear decision boundary that effectively separates the two curved regions.

Linear SVM vs Non-Linear SVM

Feature

Linear SVM

Non-Linear SVM

Decision Boundary

Straight line or hyperplane

Curved or complex boundaries

Data Separation

Works well when data is linearly separable

Suitable for non-linearly separable data

Kernel Usage

No kernel or uses a linear kernel

Uses non-linear kernels (e.g., RBF, polynomial)

Computational Cost

Generally faster and less complex

More computationally intensive

Example Use Case

Spam detection with simple features

Image classification or handwriting recognition

Applications

- Image Classification : They are widely used for image recognition tasks such as handwritten digit recognition like MNIST dataset where the data classes are not linearly separable.

- Bioinformatics : Used in gene expression analysis and protein classification where the relationships between variables are complex and non-linear.

- Natural Language Processing (NLP) : Used for text classification tasks like spam filtering or sentiment analysis where non-linear relationships exist between words and sentiments.

- Medical Diagnosis : Effective for classifying diseases based on patient data such as tumor classification where data have non-linear patterns.

- Fraud Detection : They can identify fraudulent activities by detecting unusual patterns in transactional data.

- Voice and Speech Recognition : Useful for separating different voice signals or identifying speech patterns where non-linear decision boundaries are needed.

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
