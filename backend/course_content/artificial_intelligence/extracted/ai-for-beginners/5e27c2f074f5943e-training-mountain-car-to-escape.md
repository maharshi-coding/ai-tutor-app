# Training Mountain Car to Escape

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/6-Other/22-DeepRL/lab/README.md
Original Path: lessons/6-Other/22-DeepRL/lab/README.md
Course: Artificial Intelligence

# Training Mountain Car to Escape

Lab Assignment from [AI for Beginners Curriculum](https://github.com/microsoft/ai-for-beginners).

## Task

Your goal is to train the RL agent to control [Mountain Car](https://www.gymlibrary.ml/environments/classic_control/mountain_car/) in OpenAI Environment.

<img alt="Mountain Car" src="images/mountaincar.png" width="300"/>

## The Environment

Mountain Car environment consists of the car trapped inside a valley. Your goal is to jump out of the valley and reach the flag. The actions you can perform are to accelerate to the left, to the right, or do nothing. You can observe position of the car along x-axis, and velocity.

## Stating Notebook

Start the lab by opening [MountainCar.ipynb](MountainCar.ipynb)

## Takeaway

You should learn throughout this lab that adopting RL algorithms to a new environment is often quite straightforward, because the OpenAI Gym has the same interface for all environments, and algorithms as such do not largely depend on the nature of the environment. You can even restructure the Python code in such a way as to pass any environment to RL algorithm as a parameter.
