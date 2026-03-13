# Training RL to do Cartpole Balancing

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/6-Other/22-DeepRL/CartPole-RL-TF.ipynb
Original Path: lessons/6-Other/22-DeepRL/CartPole-RL-TF.ipynb
Course: Artificial Intelligence

# Training RL to do Cartpole Balancing

This notebooks is part of [AI for Beginners Curriculum](http://aka.ms/ai-beginners). It has been inspired by [this blog post](https://medium.com/swlh/policy-gradient-reinforcement-learning-with-keras-57ca6ed32555), [official TensorFlow documentation](https://www.tensorflow.org/tutorials/reinforcement_learning/actor_critic) and [this Keras RL example](https://keras.io/examples/rl/actor_critic_cartpole/).

In this example, we will use RL to train a model to balance a pole on a cart that can move left and right on horizontal scale. We will use [OpenAI Gym](https://www.gymlibrary.ml/) environment to simulate the pole.

> **Note**: You can run this lesson's code locally (eg. from Visual Studio Code), in which case the simulation will open in a new window. When running the code online, you may need to make some tweaks to the code, as described [here](https://towardsdatascience.com/rendering-openai-gym-envs-on-binder-and-google-colab-536f99391cc7).

We will start by making sure Gym is installed:

```python
import sys
!{sys.executable} -m pip install gym pygame
```

Output:
```text
Defaulting to user installation because normal site-packages is not writeable
Requirement already satisfied: gym in /home/leo/.local/lib/python3.10/site-packages (0.25.0)
Requirement already satisfied: pygame in /home/leo/.local/lib/python3.10/site-packages (2.1.2)
Requirement already satisfied: gym-notices>=0.0.4 in /home/leo/.local/lib/python3.10/site-packages (from gym) (0.0.7)
Requirement already satisfied: cloudpickle>=1.2.0 in /home/leo/.local/lib/python3.10/site-packages (from gym) (2.1.0)
Requirement already satisfied: numpy>=1.18.0 in /usr/lib/python3/dist-packages (from gym) (1.21.5)
```

Now let's create the CartPole environment and see how to operate on it. An environment has the following properties:

* **Action space** is the set of possible actions that we can perform at each step of the simulation
* **Observation space** is the space of observations that we can make

```python
import gym
import pygame
import tqdm

env = gym.make("CartPole-v1")

print(f"Action space: {env.action_space}")
print(f"Observation space: {env.observation_space}")
```

Output:
```text
Action space: Discrete(2)
Observation space: Box([-4.8000002e+00 -3.4028235e+38 -4.1887903e-01 -3.4028235e+38], [4.8000002e+00 3.4028235e+38 4.1887903e-01 3.4028235e+38], (4,), float32)

/home/leo/.local/lib/python3.10/site-packages/gym/core.py:329: DeprecationWarning: [33mWARN: Initializing wrapper in old step API which returns one bool instead of two. It is recommended to set `new_step_api=True` to use new step API. This will be the default behaviour in future.[0m
deprecation(
/home/leo/.local/lib/python3.10/site-packages/gym/wrappers/step_api_compatibility.py:39: DeprecationWarning: [33mWARN: Initializing environment in old step API which returns one bool instead of two. It is recommended to set `new_step_api=True` to use new step API. This will be the default behaviour in future.[0m
deprecation(
```

Let's see how the simulation works. The following loop runs the simulation, until `env.step` does not return the termination flag `done`. We will randomly chose actions using `env.action_space.sample()`, which means the experiment will probably fail very fast (CartPole environment terminates when the speed of CartPole, its position or angle are outside certain limits).

> Simulation will open in the new window. You can run the code several times and see how it behaves.

```python
env.reset()

done = False
total_reward = 0
while not done:
env.render()
obs, rew, done, info = env.step(env.action_space.sample())
total_reward += rew
print(f"{obs} -> {rew}")
print(f"Total reward: {total_reward}")

env.close()
```

Output:
```text
/home/leo/.local/lib/python3.10/site-packages/gym/core.py:57: DeprecationWarning: [33mWARN: You are calling render method, but you didn't specified the argument render_mode at environment initialization. To maintain backward compatibility, the environment will render in human mode.
If you want to render in human mode, initialize the environment in this way: gym.make('EnvName', render_mode='human') and don't call the render method.
See here for more information: https://www.gymlibrary.ml/content/api/[0m
deprecation(

[ 0.00425272 -0.19994313 0.00917169 0.34113726] -> 1.0
[ 0.00025386 -0.00495286 0.01599443 0.05136059] -> 1.0
[ 1.5480528e-04 1.8993615e-01 1.7021643e-02 -2.3623335e-01] -> 1.0
[ 0.00395353 0.38481084 0.01229698 -0.5234989 ] -> 1.0
[ 0.01164974 0.18951797 0.001827 -0.22696657] -> 1.0
[ 0.0154401 0.38461378 -0.00271233 -0.51907265] -> 1.0
[ 0.02313238 0.5797738 -0.01309379 -0.812609 ] -> 1.0
[ 0.03472786 0.38483363 -0.02934597 -0.5240733 ] -> 1.0
[ 0.04242453 0.580356 -0.03982743 -0.8258571 ] -> 1.0
[ 0.05403165 0.38580072 -0.05634458 -0.54596174] -> 1.0
[ 0.06174766 0.19151384 -0.06726381 -0.27155042] -> 1.0
[ 0.06557794 -0.00258703 -0.07269482 -0.00081817] -> 1.0
[ 0.0655262 -0.19659522 -0.07271118 0.26807207] -> 1.0
[ 0.0615943 -0.00051497 -0.06734974 -0.04662942] -> 1.0
[ 0.061584 0.19550486 -0.06828233 -0.3597784 ] -> 1.0
[ 0.06549409 0.00141663 -0.0754779 -0.08938391] -> 1.0
[ 0.06552242 -0.19254686 -0.07726558 0.17856352] -> 1.0
[ 0.06167149 0.00359088 -0.0736943 -0.1374588 ] -> 1.0
[ 0.0617433 0.19968675 -0.07644348 -0.45245075] -> 1.0
[ 0.06573704 0.3958018 -0.0854925 -0.7682167 ] -> 1.0
[ 0.07365308 0.20195423 -0.10085683 -0.50361156] -> 1.0
[ 0.07769216 0.0083876 -0.11092906 -0.24433874] -> 1.0
[ 0.07785992 -0.18498953 -0.11581583 0.01139782] -> 1.0
[ 0.07416012 0.01158649 -0.11558788 -0.31546465] -> 1.0
[ 0.07439185 0.20814891 -0.12189718 -0.64224803] -> 1.0
[ 0.07855483 0.01491799 -0.13474214 -0.3903015 ] -> 1.0
[ 0.07885319 -0.17806001 -0.14254816 -0.14295265] -> 1.0
[ 0.07529199 0.01878517 -0.14540721 -0.47699296]
```

Youn can notice that observations contain 4 numbers. They are:
- Position of cart
- Velocity of cart
- Angle of pole
- Rotation rate of pole

`rew` is the reward we receive at each step. You can see that in CartPole environment you are rewarded 1 point for each simulation step, and the goal is to maximize total reward, i.e. the time CartPole is able to balance without falling.

During reinforcement learning, our goal is to train a **policy** $\pi$, that for each state $s$ will tell us which action $a$ to take, so essentially $a = \pi(s)$.

If you want probabilistic solution, you can think of policy as returning a set of probabilities for each action, i.e. $\pi(a|s)$ would mean a probability that we should take action $a$ at state $s$.

## Policy Gradient Method

In simplest RL algorithm, called **Policy Gradient**, we will train a neural network to predict the next action.

```python
import numpy as np
import tensorflow as tf
from tensorflow import keras
import matplotlib.pyplot as plt

num_inputs = 4
num_actions = 2

model = keras.Sequential([
keras.layers.Dense(128, activation="relu",input_shape=(num_inputs,)),
keras.layers.Dense(num_actions, activation="softmax")
])

model.compile(loss='categorical_crossentropy', optimizer=keras.optimizers.Adam(learning_rate=0.01))
```

Output:
```text
/usr/local/lib/python3.10/dist-packages/tensorflow/__init__.py:29: DeprecationWarning: The distutils package is deprecated and slated for removal in Python 3.12. Use setuptools or check PEP 632 for potential alternatives
import distutils as _distutils
2022-07-24 16:50:47.597258: W tensorflow/stream_executor/platform/default/dso_loader.cc:64] Could not load dynamic library 'libcudart.so.11.0'; dlerror: libcudart.so.11.0: cannot open shared object file: No such file or directory
2022-07-24 16:50:47.597280: I tensorflow/stream_executor/cuda/cudart_stub.cc:29] Ignore above cudart dlerror if you do not have a GPU set up on your machine.
/usr/local/lib/python3.10/dist-packages/flatbuffers/compat.py:19: DeprecationWarning: the imp module is deprecated in favour of importlib and slated for removal in Python 3.12; see the module's documentation for alternative uses
import imp
2022-07-24 16:50:49.838826: I tensorflow/stream_executor/cuda/cuda_gpu_executor.cc:975] successful NUMA node read from SysFS had negative value (-1), but there must be at least one NUMA node, so returning NUMA node zero
2022-07-24 16:50:49.839078: W tensorflow/stream_executor/platform/default/dso_loader.cc:64] Could not load dynamic library 'libcudart.so.11.0'; dlerror: libcudart.so.11.0: cannot open shared object file: No such file or directory
2022-07-24 16:50:49.839143: W tensorflow/stream_executor/platform/default/dso_loader.cc:64] Could not load dynamic library 'libcublas.so.11'; dlerror: libcublas.so.11: cannot open shared object file: No such file or directory
2022-07-24 16:50:49.839194: W tensorflow
```

We will train the network by running many experiments, and updating our network after each run. Let's define a function that will run the experiment and return the results (so-called **trace**) - all states, actions (and their recommended probabilities), and rewards:

```python
def run_episode(max_steps_per_episode = 10000,render=False):
states, actions, probs, rewards = [],[],[],[]
state = env.reset()
for _ in range(max_steps_per_episode):
if render:
env.render()
action_probs = model(np.expand_dims(state,0))[0]
action = np.random.choice(num_actions, p=np.squeeze(action_probs))
nstate, reward, done, info = env.step(action)
if done:
break
states.append(state)
actions.append(action)
probs.append(action_probs)
rewards.append(reward)
state = nstate
return np.vstack(states), np.vstack(actions), np.vstack(probs), np.vstack(rewards)
```

You can run one episode with untrained network and observe that total reward (AKA length of episode) is very low:

```python
s,a,p,r = run_episode()
print(f"Total reward: {np.sum(r)}")
```

Output:
```text
Total reward: 27.0
```

One of the tricky aspects of policy gradient algorithm is to use **discounted rewards**. The idea is that we compute the vector of total rewards at each step of the game, and during this process we discount the early rewards using some coefficient $gamma$. We also normalize the resulting vector, because we will use it as weight to affect our training:

```python
eps = 0.0001

def discounted_rewards(rewards,gamma=0.99,normalize=True):
ret = []
s = 0
for r in rewards[::-1]:
s = r + gamma * s
ret.insert(0, s)
if normalize:
ret = (ret-np.mean(ret))/(np.std(ret)+eps)
return ret
```

Now let's do the actual training! We will run 300 episodes, and at each episode we will do the following:

1. Run the experiment and collect the trace
1. Calculate the difference (`gradients`) between the actions taken, and by predicted probabilities. The less the difference is, the more we are sure that we have taken the right action.
1. Calculate discounted rewards and multiply gradients by discounted rewards - that will make sure that steps with higher rewards will make more effect on the final result than lower-rewarded ones
1. Expected target actions for our neural network would be partly taken from the predicted probabilities during the run, and partly from calculated gradients. We will use `alpha` parameter to determine to which extent gradients and rewards are taken into account - this is called *learning rate* of reinforcement algorithm.
1. Finally, we train our network on states and expected actions, and repeat the process

```python
alpha = 1e-4

history = []
for epoch in range(300):
states, actions, probs, rewards = run_episode()
one_hot_actions = np.eye(2)[actions.T][0]
gradients = one_hot_actions-probs
dr = discounted_rewards(rewards)
gradients *= dr
target = alpha*np.vstack([gradients])+probs
model.train_on_batch(states,target)
history.append(np.sum(rewards))
if epoch%100==0:
print(f"{epoch} -> {np.sum(rewards)}")

plt.plot(history)
```

Output:
```text
0 -> 29.0

2022-07-24 16:50:51.475024: W tensorflow/core/data/root_dataset.cc:247] Optimization loop failed: CANCELLED: Operation was cancelled

100 -> 135.0
200 -> 484.0
```

Now let's run the episode with rendering to see the result:

```python
_ = run_episode(render=True)
```

Hopefully, you can see that pole can now balance pretty well!

## Actor-Critic Model

Actor-Critic model is the further development of policy gradients, in which we build a neural network to learn both the policy and estimated rewards. The network will have two outputs (or you can view it as two separate networks):
* **Actor** will recommend the action to take by giving us the state probability distribution, as in policy gradient model
* **Critic** would estimate what the reward would be from those actions. It returns total estimated rewards in the future at the given state.

Let's define such a model:

```python
num_inputs = 4
num_actions = 2
num_hidden = 128

inputs = keras.layers.Input(shape=(num_inputs,))
common = keras.layers.Dense(num_hidden, activation="relu")(inputs)
action = keras.layers.Dense(num_actions, activation="softmax")(common)
critic = keras.layers.Dense(1)(common)

model = keras.Model(inputs=inputs, outputs=[action, critic])
```

We would need to slightly modify our `run_episode` function to return also critic results:

```python
def run_episode(max_steps_per_episode = 10000,render=False):
states, actions, probs, rewards, critic = [],[],[],[],[]
state = env.reset()
for _ in range(max_steps_per_episode):
if render:
env.render()
action_probs, est_rew = model(np.expand_dims(state,0))
action = np.random.choice(num_actions, p=np.squeeze(action_probs[0]))
nstate, reward, done, info = env.step(action)
if done:
break
states.append(state)
actions.append(action)
probs.append(tf.math.log(action_probs[0,action]))
rewards.append(reward)
critic.append(est_rew[0,0])
state = nstate
return states, actions, probs, rewards, critic
```

Now we will run the main training loop. We will use manual network training process by computing proper loss functions and updating network parameters:

```python
optimizer = keras.optimizers.Adam(learning_rate=0.01)
huber_loss = keras.losses.Huber()
episode_count = 0
running_reward = 0

while True: # Run until solved
state = env.reset()
episode_reward = 0
with tf.GradientTape() as tape:
_,_,action_probs, rewards, critic_values = run_episode()
episode_reward = np.sum(rewards)

# Update running reward to check condition for solving
running_reward = 0.05 * episode_reward + (1 - 0.05) * running_reward

# Calculate discounted rewards that will be labels for our critic
dr = discounted_rewards(rewards)

# Calculating loss values to update our network
actor_losses = []
critic_losses = []
for log_prob, value, rew in zip(action_probs, critic_values, dr):
# When we took the action with probability `log_prob`, we received discounted reward of `rew`,
# while critic predicted it to be `value`
# First we calculate actor loss, to make actor predict actions that lead to higher rewards
diff = rew - value
actor_losses.append(-log_prob * diff)

# The critic loss is to minimize the difference between predicted reward `value` and actual
# discounted reward `rew`
critic_losses.append(
huber_loss(tf.expand_dims(value, 0), tf.expand_dims(rew, 0))
)

# Backpropagation
loss_value = sum(actor_losses) + sum(critic_losses)
grads = tape.gradient(loss_value, model.trainable_variables)
optimizer.apply_gradients(zip(grads, model.trainable_variables))

# Log details
episode_count += 1
if episode_count % 10 == 0:
template = "running reward: {:.2f} at episode {}"
print(template.format(running_reward, episode_count))

if running_reward > 195: # Condition to consider the task solved
print("Solved at episode {}!".format(episode_count))
break
```

Output:
```text
running reward: 5.82 at episode 10
running reward: 9.43 at episode 20
running reward: 10.30 at episode 30
running reward: 10.28 at episode 40
running reward: 11.00 at episode 50
running reward: 13.01 at episode 60
running reward: 21.78 at episode 70
running reward: 40.54 at episode 80
running reward: 73.70 at episode 90
running reward: 100.19 at episode 100
running reward: 159.20 at episode 110
Solved at episode 114!
```

Let's run the episode and see how good our model is:

```python
_ = run_episode(render=True)
```

Finally, let's close the environment.

```python
env.close()
```

## Takeaway

We have seen two RL algorithms in this demo: simple policy gradient, and more sophisticated actor-critic. You can see that those algorithms operate with abstract notions of state, action and reward - thus they can be applied to very different environments.

Reinforcement learning allows us to learn the best strategy to solve the problem just by looking at the final reward. The fact that we do not need labelled datasets allows us to repeat simulations many times to optimize our models. However, there are still many challenges in RL, which you may learn if you decide to focus more on this interesting area of AI.
