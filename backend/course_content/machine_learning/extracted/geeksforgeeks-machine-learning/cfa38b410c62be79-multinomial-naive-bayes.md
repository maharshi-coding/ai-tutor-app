# Multinomial Naive Bayes

Source: GeeksforGeeks Machine Learning Tutorial
Original URL: https://www.geeksforgeeks.org/machine-learning/multinomial-naive-bayes/
Original Path: https://www.geeksforgeeks.org/machine-learning/multinomial-naive-bayes/
Course: Machine Learning

Multinomial Naive Bayes

Last Updated : 28 Aug, 2025

Multinomial Naive Bayes is one of the variation of Naive Bayes algorithm which is ideal for discrete data and is typically used in text classification problems. It models the frequency of words as counts and assumes each feature or word is multinomially distributed. MNB is widely used for tasks like classifying documents based on word frequencies like in spam email detection.

How Does Multinomial Naive Bayes Work?

In Multinomial Naive bayes the word "Naive" means that the method assumes all features like words in a sentence are independent from each other and "Multinomial" refers to how many times a word appears or how often a category occurs. It works by using word counts to classify text. The main idea is that it assumes each word in a message or feature is independent of each others. This means the presence of one word doesn't affect the presence of another word which makes the model easy to use.

The model looks at how many times each word appears in messages from different categories (like "spam" or "not spam"). For example if the word "free" appears often in spam messages that will be used to help predict whether a new message is spam or not.

To calculate the probability of a message belonging to a certain category Multinomial Naive Bayes uses the multinomial distribution :

P(X) = \frac{n!}{n_1! n_2! \ldots n_m!} p_1^{n_1} p_2^{n_2} \ldots p_m^{n_m}

Where:

- n is the total number of trials.

- n_i is the count of occurrences for outcome i.

- p_i is the probability of outcome i.

To estimate how likely each word is in a particular class like "spam" or "not spam" we use a method called Maximum Likelihood Estimation (MLE) . This helps finding probabilities based on actual counts from our data. The formula is:

\quad \theta_{c,i} = \frac{\text{count}(w_i, c) + 1}{N + v}

Where:

- count(wi,c) is the number of times word w_i appears in documents of class c.

- \Nu is the total number of words in documents of class c c .

- v is the vocabulary size.

Example

To understand how Multinomial Naive Bayes works, here's a simple example to classify whether a message is "spam" or "not spam" based on the presence of certain words.

Message ID

Message Text

Class

M1

"buy cheap now"

Spam

M2

"limited offer buy"

Spam

M3

"meet me now"

Not Spam

M4

"let's catch up"

Not Spam

1. Vocabulary

Extract all unique words from the training data:

\text{Vocabulary} = \{\text{buy, cheap, now, limited, offer, meet, me, let's, catch, up}\}

Vocabulary size V = 10

2. Word Frequencies by Class

Spam Class (M1, M2):

- buy: 2

- cheap: 1

- now: 1

- limited: 1

- offer: 1

Total words: 6

Not Spam Class (M3, M4):

- meet: 1

- me: 1

- now: 1

- let's: 1

- catch: 1

- up: 1

Total words: 6

3. Test Message

Test Message: " \text{buy now} "

4. Applying Multinomial Naive Bayes Formula

P(C|d) \propto P(C) \cdot \prod_i P(w_i|C)^{f_i}

Prior Probabilities:

P(\text{Spam}) = 0.5, \quad P(\text{Not Spam}) = 0.5

Apply Laplace Smoothing:

P(w \mid C) = \frac{\text{count}(w, C) + 1}{\text{total words in } C + V}

Spam Class:

- P(\text{buy} \mid \text{Spam}) = \frac{2 + 1}{6 + 10} = \frac{3}{16}

- P(\text{now} \mid \text{Spam}) = \frac{1 + 1}{6 + 10} = \frac{2}{16}

P(\text{Spam} \mid d) \propto 0.5 \cdot \frac{3}{16} \cdot \frac{2}{16} = \frac{3}{256}

Not Spam Class:

- P(\text{buy} \mid \text{Not Spam}) = \frac{0 + 1}{6 + 10} = \frac{1}{16}

- P(\text{now} \mid \text{Not Spam}) = \frac{1 + 1}{6 + 10} = \frac{2}{16}

P(\text{Not Spam} \mid d) \propto 0.5 \cdot \frac{1}{16} \cdot \frac{2}{16} = \frac{1}{256}

5. Final Classification

Since, P(\text{Spam}|d) = \frac{3}{256} > \frac{1}{256} = P(\text{Not Spam}|d)

\boxed{\text{The message is classified as Spam}}

Python Implementation of Multinomial Naive Bayes

Let's understand it with a example of spam email detection. We'll classify emails into two categories: spam and not spam .

1. Importing Libraries :

We will import pandas and scikit learn where:

- pandas : Used for handling data in DataFrame format.

- CountVectorizer : Converts a collection of text documents into a matrix of token counts.

- train_test_split : Splits the data into training and test sets for model evaluation.

- MultinomialNB : A Naive Bayes classifier suited for classification tasks with discrete features (such as word counts).

- accuracy_score : Computes the accuracy of the model's predictions.

Python

import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score

2. Creating the Dataset

A simple dataset is created with text messages labeled as either spam or not spam. This data is then converted into a DataFrame for easy handling.

Python

data = {
'text' : [
'Free money now' ,
'Call now to claim your prize' ,
'Meet me at the park' ,
'Let’s catch up later' ,
'Win a new car today!' ,
'Lunch plans?' ,
'Congratulations! You won a lottery' ,
'Can you send me the report?' ,
'Exclusive offer for you' ,
'Are you coming to the meeting?'
],
'label' : [ 'spam' , 'spam' , 'not spam' , 'not spam' , 'spam' , 'not spam' , 'spam' , 'not spam' , 'spam' , 'not spam' ]
}

df = pd . DataFrame ( data )

3. Mapping Labels to Numerical Values

The labels (spam and not spam) are mapped to numerical values where spam becomes 1 and not spam becomes 0. This is necessary for the classifier, as it works with numerical data.

Python

df [ 'label' ] = df [ 'label' ] . map ({ 'spam' : 1 , 'not spam' : 0 })

4. Splitting the Data

- X contains the text messages (features), and y contains the labels (target).

- The dataset is split into training (70%) and testing (30%) sets using train_test_split .

Python

X = df [ 'text' ]
y = df [ 'label' ]
X_train , X_test , y_train , y_test = train_test_split ( X , y , test_size = 0.3 , random_state = 42 )

5. Vectorizing the Text Data

- CountVectorizer is used to convert text data into numerical vectors. It counts the occurrences of each word in the corpus.

- fit_transform() is applied to the training data to learn the vocabulary and transform it into a feature matrix.

- transform() is applied to the test data to convert it into the same feature space.

Python

vectorizer = CountVectorizer ()
X_train_vectors = vectorizer . fit_transform ( X_train )
X_test_vectors = vectorizer . transform ( X_test )

6. Training the Naive Bayes Model

A Multinomial Naive Bayes classifier is created and trained using the vectorized training data ( X_train_vectors ) and corresponding labels ( y_train ).

Python

model = MultinomialNB ()
model . fit ( X_train_vectors , y_train )

7. Making Predictions and Evaluating Accuracy

- We are using model.predict(X_test_vectors) to generate predictions from the trained model on test data.

- accuracy_score(y_test, y_pred) compares predicted labels y_pred with true labels y_test to calculate accuracy.

Python

y_pred = model . predict ( X_test_vectors )
accuracy = accuracy_score ( y_test , y_pred )
print ( f "Accuracy: { accuracy * 100 : .2f } % \n " )

Output:

Accuracy: 66.67%

8. Predicting for a Custom Message

- We create a custom message and transform it into a vector using vectorizer.transform().

- The vectorized message is passed to model.predict() to get the prediction.

- We print the result, interpreting 1 as “Spam” and 0 as “Not Spam”.

Python

custom_message = [ "Congratulations, you've won a free vacation" ]
print ( custom_message )
custom_vector = vectorizer . transform ( custom_message )
prediction = model . predict ( custom_vector )
print ( "Prediction for custom message:" , "Spam" if prediction [ 0 ] == 1 else "Not Spam" )

Output:

Congratulations, you've won a free vacation
Prediction for custom message: Spam

In the above code we did spam detection for given set of messages and evaluated model accuracy for the output it gave.

How Multinomial Naive Bayes differs from Gaussian Naive Bayes?

The Multinomial naive bayes and Gaussian naive bayes both are the variants of same algorithm. However they have several number of differences which are discussed below:

Multinomial Naive Bayes

Gaussian Naive Bayes

It specially designed for discrete data particularly text data.

It is suitable for continuous data where features follow a Gaussian distribution.

It assumes features and represent its counts like word counts.

It assumes a Gaussian distribution for the likelihood.

It is commonly used in NLP for document classification tasks.

It is commonly used in tasks involving continuous data such as medical diagnosis, fraud detection and weather prediction.

The likelihood of each feature is calculated using the multinomial distribution.

The likelihood of each feature is modeled using the Gaussian distribution.

It is more efficient when the number of features is very high like in text datasets with thousands of words.

It can handle continuous data but if the data is sparse or contains many outliers it struggle with accuracy

Multinomial Naive Bayes efficiency combined with its ability to handle large datasets makes it useful for applications like document categorization and email filtering.

Related Articles:

- Gaussian naive bayes

- Bernoulli Naive Bayes

Machine Learning

Geeks Premier League

AI-ML-DS

Python scikit-module

ML-Classification

Geeks Premier League 2023

AI-ML-DS With Python

+ 3 More

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
