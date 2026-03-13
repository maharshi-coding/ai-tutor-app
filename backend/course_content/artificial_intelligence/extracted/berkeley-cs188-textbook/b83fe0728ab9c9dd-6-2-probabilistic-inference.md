# 6.2 Probabilistic Inference

Source: Berkeley CS188 Textbook
Original URL: https://inst.eecs.berkeley.edu/~cs188/textbook/bayes-nets/inference.html
Original Path: https://inst.eecs.berkeley.edu/~cs188/textbook/bayes-nets/inference.html
Course: Artificial Intelligence

6.2 Probabilistic Inference

In artificial intelligence, we often want to model the relationships between various nondeterministic events. If the weather predicts a 40% chance of rain, should I carry my umbrella? How many scoops of ice cream should I get if the more scoops I get, the more likely I am to drop it all? If there was an accident 15 minutes ago on the freeway on my route to Oracle Arena to watch the Warriors’ game, should I leave now or in 30 minutes? All of these questions (and many more) can be answered with probabilistic inference .

In previous sections of this class, we modeled the world as existing in a specific state that is always known. For the next several weeks, we will instead use a new model where each possible state for the world has its own probability. For example, we might build a weather model, where the state consists of the season, temperature, and weather. Our model might say that \(P(winter, 35°, cloudy) = 0.023\). This number represents the probability of the specific outcome that it is winter, 35°, and cloudy.

More precisely, our model is a joint distribution , i.e., a table of probabilities that captures the likelihood of each possible outcome , also known as an assignment of variables. As an example, consider the table below:

Season Temperature Weather Probability

summer hot sun 0.30

summer hot rain 0.05

summer cold sun 0.10

summer cold rain 0.05

winter hot sun 0.10

winter hot rain 0.05

winter cold sun 0.15

winter cold rain 0.20

This model allows us to answer questions that might be of interest to us, for example:

1.What is the probability that it is sunny? \(P(W = sun)\)

2.What is the probability distribution for the weather, given that we know it is winter? \(P(W | S = winter)\)

3.What is the probability that it is winter, given that we know it is rainy and cold? \(P(S = winter | T = cold, W = rain)\)

4.What is the probability distribution for the weather and season given that we know that it is cold? \(P(S, W | T = cold)\)

Inference By Enumeration

Given a joint PDF, we can trivially compute any desired probability distribution \(P(Q_1...Q_m| e_1...e_n)\) using a simple and intuitive procedure known as inference by enumeration , for which we define three types of variables we will be dealing with:

1. Query variables \(Q_i\), which are unknown and appear on the left side of the conditional (\(|\)) in the desired probability distribution.

2. Evidence variables \(e_i\), which are observed variables whose values are known and appear on the right side of the conditional (\(|\)) in the desired probability distribution.

3. Hidden variables , which are values present in the overall joint distribution but not in the desired distribution.

In Inference By Enumeration, we follow the following algorithm:

- Collect all the rows consistent with the observed evidence variables.

- Sum out (marginalize) all the hidden variables.

- Normalize the table so that it is a probability distribution (i.e., values sum to 1).

For example, if we wanted to compute \(P(W | S = winter)\) using the above joint distribution, we’d select the four rows where \(S\) is winter, then sum out over \(T\) and normalize. This yields the following probability table:

W S Unnormalized Sum Probability

sun winter \(0.10 + 0.15 = 0.25\) \(0.25 / (0.25 + 0.25) = 0.5\)

rain winter \(0.05 + 0.20 = 0.25\) \(0.25 / (0.25 + 0.25) = 0.5\)

Hence \(P(W = sun | S = winter) = 0.5\) and \(P(W = rain | S = winter) = 0.5\), and we learn that in winter there’s a 50% chance of sun and a 50% chance of rain.

As long as we have the joint PDF table, inference by enumeration (IBE) can be used to compute any desired probability distribution, even for multiple query variables \(Q_1...Q_m\).
