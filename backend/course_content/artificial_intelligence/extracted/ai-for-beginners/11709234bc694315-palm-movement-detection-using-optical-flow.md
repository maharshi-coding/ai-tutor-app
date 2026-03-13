# Palm Movement Detection using Optical Flow

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/4-ComputerVision/06-IntroCV/lab/MovementDetection.ipynb
Original Path: lessons/4-ComputerVision/06-IntroCV/lab/MovementDetection.ipynb
Course: Artificial Intelligence

## Palm Movement Detection using Optical Flow

This lab is part of [AI for Beginners Curriculum](http://aka.ms/ai-beginners).

Consider [this video](palm-movement.mp4), in which a person's palm moves left/right/up/down on the stable background.

<img src="../images/palm-movement.png" width="30%" alt="Palm Movement Frame"/>

**Your goal** would be to use Optical Flow to determine, which parts of video contain up/down/left/right movements.

Start by getting video frames as described in the lecture:

```python
# Code here
```

Now, calculate dense optical flow frames as described in the lecture, and convert dense optical flow to polar coordinates:

```python
# Code here
```

Build histogram of directions for each of the optical flow frame. A histogram shows how many vectors fall under certain bin, and it should separate out different directions of movement on the frame.

> You may also want to zero out all vectors whose magnitude is below certain threshold. This will get rid of small extra movements in the video, such as eyes and head.

Plot the histograms for some of the frames.

```python
# Code here
```

Looking at histograms, it should be pretty straightforward how to determine direction of movement. You need so select those bins the correspond to up/down/left/right directions, and that are above certain threshold.

```python
# Code here
```

Congratulations! If you have done all steps above, you have completed the lab!
