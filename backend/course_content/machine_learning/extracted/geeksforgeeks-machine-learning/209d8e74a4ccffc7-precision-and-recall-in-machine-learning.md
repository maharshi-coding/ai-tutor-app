# Precision and Recall in Machine Learning

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/precision-and-recall-in-machine-learning/
Original Path: https://www.geeksforgeeks.org/machine-learning/precision-and-recall-in-machine-learning/
Course: Machine Learning

Precision and Recall in Machine Learning

Last Updated : 2 Aug, 2025

Precision and recall are two evaluation metric used to check the performance of Machine Learning Model. Precision is the ratio of a model’s classification of all positive classifications as positive. Recall tells us how many of the actual positive items the model was able to find. Precision and recall helps in classification problems. In this article we will explain Precision and Recall with formula and example.

1. Precision

Precision is the ratio between the True Positives and all the Positives. It shows how many of the “yes” predictions made by the model were actually correct. It helps us reduce wrong “yes” guesses which are called false positives (FP) . Precision is calculated as:
Precision
Imagine you build a model to find birds in photos . It marks some photos as "bird."

- If those marked photos really have birds that’s good (true positives).

- But if some don’t have birds the model made a mistake (false positives).
Precision
Uses of Precision

- Precision helps us understand how accurate a model's “yes” predictions are. It is especially useful when the data has more of one kind of result than the other.

- For example if most emails are not spam and only a few are then precision helps us see how well the model is finding the spam without making too many mistakes. In such uneven data precision helps measure how correctly the model is picking out the less common group like spam or fraud.

Advantages of High Precision

A model with high precision is very good at avoiding mistakes when it says “yes.” This is important in situations where false alarms are a big problem. For example:

- In spam email detection it's better if real emails don't get wrongly marked as spam.

- We care more about getting the important emails right than stopping every single spam message.

So in these cases a model that gives fewer wrong "yes" answers is more useful.

Limitations of Precision

- If we only care about precision then model may miss some real cases. It becomes too careful and may say “no” even when something is actually “yes.”

- If the model is too focused on being precise it might let lots of spam emails into your inbox because it's afraid of wrongly marking a real email as spam.

2. Recall

Recall tells us how well a model finds all the correct “yes” cases in the data. It checks how many real positive cases the model was able to correctly identify. The formula to calculate recall is:
Recall
- True Positives (TP) : The model correctly said “yes.”

- False Negatives (FN) : The model missed a real “yes” and said “no” instead.

Imagine a computer model that looks for birds in pictures.

- Recall tells us how many real birds the model found correctly.

- A perfect model would find all birds with no misses that means no false negatives.
Recall
Uses of Recall

You use recall when it’s very important to find all possible positive cases even if some of them turn out to be wrong. For example:

- In medical tests you want to catch every possible patient who may be sick even if that means a few healthy people are wrongly flagged.

- In fraud detection it’s better to check a few extra normal transactions than to miss a real fraud.

Advantages of High Recall

A model with high recall is very good at not missing anything important. It finds almost all the actual “yes” cases in the data. This is helpful when:

- Missing a real case is dangerous or costly.

- For example in cybersecurity missing an attack is worse than accidentally flagging something safe.

Limitations of Recall

Focusing only on recall means the model is optimized to identify as many actual positives as possible even at the cost of incorrectly labeling negatives as positives. This often leads to a high number of false positives.

Computer Subject

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
