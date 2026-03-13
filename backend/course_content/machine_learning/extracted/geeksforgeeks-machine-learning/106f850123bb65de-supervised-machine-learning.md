# Supervised Machine Learning

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/supervised-machine-learning/
Original Path: https://www.geeksforgeeks.org/machine-learning/supervised-machine-learning/
Course: Machine Learning

Supervised Machine Learning

Last Updated : 12 Sep, 2025

Supervised learning is a type of machine learning where a model learns from labelled data—meaning every input has a corresponding correct output. The model makes predictions and compares them with the true outputs, adjusting itself to reduce errors and improve accuracy over time. The goal is to make accurate predictions on new, unseen data. For example, a model trained on images of handwritten digits can recognise new digits it has never seen before.
Supervised Machine Learning
Types of Supervised Learning in Machine Learning

Now, Supervised learning can be applied to two main types of problems:

- Classification : Where the output is a categorical variable (e.g., spam vs. non-spam emails, yes vs. no).

- Regression : Where the output is a continuous variable (e.g., predicting house prices, stock prices).
Types of Supervised Learning
While training the model, data is usually split in the ratio of 80:20 i.e. 80% as training data and the rest as testing data. In training data, we feed input as well as output for 80% of data. The model learns from training data only. We use different supervised learning algorithms (which we will discuss in detail in the next section) to build our model. Let's first understand the classification and regression data through the table below:
Sample
Both the above figures have labelled data set as follows:

Figure A : It is a dataset of a shopping store that is useful in predicting whether a customer will purchase a particular product under consideration or not based on his/her gender, age and salary.

- Input : Gender, Age, Salary

- Output : Purchased i.e. 0 or 1; 1 means yes the customer will purchase and 0 means that the customer won't purchase it.

Figure B: It is a Meteorological dataset that serves the purpose of predicting wind speed based on different parameters.

- Input : Dew Point, Temperature, Pressure, Relative Humidity, Wind Direction

- Output : Wind Speed

Working of Supervised Machine Learning

The working of supervised machine learning follows these key steps:

1. Collect Labeled Data

- Gather a dataset where each input has a known correct output (label).

- Example : Images of handwritten digits with their actual numbers as labels.

2. Split the Dataset

- Divide the data into training data (about 80%) and testing data (about 20%).

- The model will learn from the training data and be evaluated on the testing data.

3. Train the Model

- Feed the training data (inputs and their labels) to a suitable supervised learning algorithm (like Decision Trees, SVM or Linear Regression).

- The model tries to find patterns that map inputs to correct outputs.

4. Validate and Test the Model

- Evaluate the model using testing data it has never seen before.

- The model predicts outputs and these predictions are compared with the actual labels to calculate accuracy or error.

5. Deploy and Predict on New Data

- Once the model performs well, it can be used to predict outputs for completely new, unseen data.

Supervised Machine Learning Algorithms

Supervised learning can be further divided into several different types, each with its own unique characteristics and applications. Here are some of the most common types of supervised learning algorithms:

- Linear Regression : Linear regression is a type of supervised learning regression algorithm that is used to predict a continuous output value. It is one of the simplest and most widely used algorithms in supervised learning.

- Logistic Regression : Logistic regression is a type of supervised learning classification algorithm that is used to predict a binary output variable.

- Decision Trees : Decision tree is a tree-like structure that is used to model decisions and their possible consequences. Each internal node in the tree represents a decision, while each leaf node represents a possible outcome.

- Random Forests : Random forests again are made up of multiple decision trees that work together to make predictions. Each tree in the forest is trained on a different subset of the input features and data. The final prediction is made by aggregating the predictions of all the trees in the forest.

- Support Vector Machine(SVM) : The SVM algorithm creates a hyperplane to segregate n-dimensional space into classes and identify the correct category of new data points. The extreme cases that help create the hyperplane are called support vectors, hence the name Support Vector Machine.

- K-Nearest Neighbors : KNN works by finding k training examples closest to a given input and then predicts the class or value based on the majority class or average value of these neighbors. The performance of KNN can be influenced by the choice of k and the distance metric used to measure proximity.

- Gradient Boosting : Gradient Boosting combines weak learners, like decision trees, to create a strong model. It iteratively builds new models that correct errors made by previous ones.

- Naive Bayes Algorithm : The Naive Bayes algorithm is a supervised machine learning algorithm based on applying Bayes' Theorem with the “naive” assumption that features are independent of each other given the class label.

Let's summarize the supervised machine learning algorithms in table:

Algorithm Regression,
Classification Purpose Method Use Cases

Linear Regression Regression Predict continuous output values Linear equation minimizing sum of squares of residuals Predicting continuous values

Logistic Regression Classification Predict binary output variable Logistic function transforming linear relationship Binary classification tasks

Decision Trees Both Model decisions and outcomes Tree-like structure with decisions and outcomes Classification and Regression tasks

Random Forests Both Improve classification and regression accuracy Combining multiple decision trees Reducing overfitting, improving prediction accuracy

SVM Both Create hyperplane for classification or predict continuous values Maximizing margin between classes or predicting continuous values Classification and Regression tasks

KNN Both Predict class or value based on k closest neighbors Finding k closest neighbors and predicting based on majority or average Classification and Regression tasks, sensitive to noisy data

Gradient Boosting Both Combine weak learners to create strong model Iteratively correcting errors with new models Classification and Regression tasks to improve prediction accuracy

Naive Bayes Classification Predict class based on feature independence assumption Bayes' theorem with feature independence assumption Text classification, spam filtering, sentiment analysis, medical

These types of supervised learning in machine learning vary based on the problem we're trying to solve and the dataset we're working with. In classification problems, the task is to assign inputs to predefined classes, while regression problems involve predicting numerical outcomes.

Practical Examples of Supervised learning

Few practical examples of supervised machine learning across various industries:

- Fraud Detection in Banking : Utilizes supervised learning algorithms on historical transaction data, training models with labeled datasets of legitimate and fraudulent transactions to accurately predict fraud patterns.

- Parkinson Disease Prediction: Parkinson’s disease is a progressive disorder that affects the nervous system and the parts of the body controlled by the nerves.

- Customer Churn Prediction: Uses supervised learning techniques to analyze historical customer data, identifying features associated with churn rates to predict customer retention effectively.

- Cancer cell classification: Implements supervised learning for cancer cells based on their features and identifying them if they are ‘malignant’ or ‘benign.

- Stock Price Prediction : Applies supervised learning to predict a signal that indicates whether buying a particular stock will be helpful or not.

Advantages

Here are some advantages of supervised learning listed below:

- Simplicity & clarity: Easy to understand and implement since it learns from labeled examples.

- High accuracy : When sufficient labeled data is available, models achieve strong predictive performance.

- Versatility : Works for both classification like spam detection, disease prediction and regression like price forecasting.

- Generalization : With enough diverse data and proper training, models can generalize well to unseen inputs.

- Wide application : Used in speech recognition, medical diagnosis, sentiment analysis, fraud detection and more.

Disadvantages

- Requires labeled data : Large amounts of labeled datasets are expensive and time-consuming to prepare.

- Bias from data : If training data is biased or unbalanced, the model may learn and amplify those biases.

- Overfitting risk : Model may memorize training data instead of learning general patterns, especially with small datasets.

- Limited adaptability : Performance drops significantly when applied to data distributions very different from training data.

- Not scalable for some problems : In tasks with millions of possible labels like natural language, supervised labeling becomes impractical.

Machine Learning

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
