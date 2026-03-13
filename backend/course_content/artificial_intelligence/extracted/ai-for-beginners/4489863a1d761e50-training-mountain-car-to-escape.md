# Training Mountain Car to Escape

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/6-Other/22-DeepRL/lab/MountainCar.ipynb
Original Path: lessons/6-Other/22-DeepRL/lab/MountainCar.ipynb
Course: Artificial Intelligence

# # Training Mountain Car to Escape

Lab Assignment from [AI for Beginners Curriculum](https://github.com/microsoft/ai-for-beginners).

Your goal is to train the RL agent to control [Mountain Car](https://www.gymlibrary.ml/environments/classic_control/mountain_car/) in OpenAI Environment.

Let's start by creating the environment:

```python
import gym
env = gym.make('MountainCar-v0')
```

Let's see how the random experiment looks like:

```python
state = env.reset()
while True:
env.render()
action = env.action_space.sample()
state, reward, done, info = env.step(action)
if done:
break
```

Now the notebook is all yours - fell free to adopt Policy Gradients and Actor-Critic algorithms from the lesson to this problem!

```python
## Lost of code here
```

```python
env.close()
```
