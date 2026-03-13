# Pre-trained models and transfer learning

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/4-ComputerVision/08-TransferLearning/TransferLearningPyTorch.ipynb
Original Path: lessons/4-ComputerVision/08-TransferLearning/TransferLearningPyTorch.ipynb
Course: Artificial Intelligence

# Pre-trained models and transfer learning

Training CNNs can take a lot of time, and a lot of data is required for that task. However, much of the time is spent to learn the best low-level filters that a network is using to extract patterns from images. A natural question arises - can we use a neural network trained on one dataset and adapt it to classifying different images without full training process?

This approach is called **transfer learning**, because we transfer some knowledge from one neural network model to another. In transfer learning, we typically start with a pre-trained model, which has been trained on some large image dataset, such as **ImageNet**. Those models can already do a good job extracting different features from generic images, and in many cases just building a classifier on top of those extracted features can yield a good result.

```python
import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
import matplotlib.pyplot as plt
from torchinfo import summary
import numpy as np
import os

from pytorchcv import train, plot_results, display_dataset, train_long, check_image_dir
```

## Cats vs. Dogs Dataset

In this unit, we will solve a real-life problem of classifying images of cats and dogs. For this reason, we will use [Kaggle Cats vs. Dogs Dataset](https://www.kaggle.com/c/dogs-vs-cats), which can also be downloaded [from Microsoft](https://www.microsoft.com/en-us/download/details.aspx?id=54765).

Let's download this dataset and extract it into `data` directory (this process may take some time!):

```python
if not os.path.exists('data/kagglecatsanddogs_5340.zip'):
!wget -P data https://download.microsoft.com/download/3/E/1/3E1C3F21-ECDB-4869-8368-6DEBA77B919F/kagglecatsanddogs_5340.zip
```

```python
import zipfile
if not os.path.exists('data/PetImages'):
with zipfile.ZipFile('data/kagglecatsanddogs_5340.zip', 'r') as zip_ref:
zip_ref.extractall('data')
```

Unfortunately, there are some corrupt image files in the dataset. We need to do quick cleaning to check for corrupted files. In order not to clobber this tutorial, we moved the code to verify dataset into a module.

```python
check_image_dir('data/PetImages/Cat/*.jpg')
check_image_dir('data/PetImages/Dog/*.jpg')
```

Output:
```text
Corrupt image: data/PetImages/Cat/666.jpg

/anaconda/envs/py38_pytorch/lib/python3.8/site-packages/PIL/TiffImagePlugin.py:793: UserWarning: Truncated File Read
warnings.warn(str(msg))

Corrupt image: data/PetImages/Dog/11702.jpg
```

Next, let's load the images into PyTorch dataset, converting them to tensors and doing some normalization. We will apply `std_normalize` transform to bring images to the range expected by pre-trained VGG network:

```python
std_normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406],
std=[0.229, 0.224, 0.225])
trans = transforms.Compose([
transforms.Resize(256),
transforms.CenterCrop(224),
transforms.ToTensor(),
std_normalize])
dataset = torchvision.datasets.ImageFolder('data/PetImages',transform=trans)
trainset, testset = torch.utils.data.random_split(dataset,[20000,len(dataset)-20000])

display_dataset(dataset)
```

Output:
```text
<Figure size 1080x216 with 10 Axes>
```

## Pre-trained models

There are many different pre-trained models available inside `torchvision` module, and even more models can be found on the Internet. Let's see how simplest VGG-16 model can be loaded and used:

```python
vgg = torchvision.models.vgg16(pretrained=True)
sample_image = dataset[0][0].unsqueeze(0)
res = vgg(sample_image)
print(res[0].argmax())
```

Output:
```text
Downloading: "https://download.pytorch.org/models/vgg16-397923af.pth" to /home/cathy/.cache/torch/hub/checkpoints/vgg16-397923af.pth

0%| | 0.00/528M [00:00<?, ?B/s]

tensor(282)
```

The result that we have received is a number of an `ImageNet` class, which can be looked up [here](https://gist.github.com/yrevar/942d3a0ac09ec9e5eb3a). We can use the following code to automatically load this class table and return the result:

```python
import json, requests
class_map = json.loads(requests.get("https://s3.amazonaws.com/deep-learning-models/image-models/imagenet_class_index.json").text)
class_map = { int(k) : v for k,v in class_map.items() }

class_map[res[0].argmax().item()]
```

Output:
```text
['n02123159', 'tiger_cat']
```

Let's also see the architecture of the VGG-16 network:

```python
summary(vgg,input_size=(1,3,224,224))
```

Output:
```text
==========================================================================================
Layer (type:depth-idx) Output Shape Param #
==========================================================================================
VGG -- --
├─Sequential: 1-1 [1, 512, 7, 7] --
│ └─Conv2d: 2-1 [1, 64, 224, 224] 1,792
│ └─ReLU: 2-2 [1, 64, 224, 224] --
│ └─Conv2d: 2-3 [1, 64, 224, 224] 36,928
│ └─ReLU: 2-4 [1, 64, 224, 224] --
│ └─MaxPool2d: 2-5 [1, 64, 112, 112] --
│ └─Conv2d: 2-6 [1, 128, 112, 112] 73,856
│ └─ReLU: 2-7 [1, 128, 112, 112] --
│ └─Conv2d: 2-8 [1, 128, 112, 112] 147,584
│ └─ReLU: 2-9 [1, 128, 112, 112] --
│ └─MaxPool2d: 2-10 [1, 128, 56, 56] --
│ └─Conv2d: 2-11 [1, 256, 56, 56] 295,168
│ └─ReLU: 2-12 [1, 256, 56, 56] --
│ └─Conv2d: 2-13 [1, 256, 56, 56] 590,080
│ └─ReLU: 2-14 [1, 256, 56, 56] --
│ └─Conv2d: 2-15 [1, 256, 56, 56] 590,080
│ └─ReLU: 2-16 [1, 256, 56, 56] --
│ └─MaxPool2d: 2-17 [1, 256, 28
```

In addition to the layer we already know, there is also another layer type called **Dropout**. These layers act as **regularization** technique. Regularization makes slight modifications to the learning algorithm so the model generalizes better. During training, dropout layers discard some proportion (around 30%) of the neurons in the previous layer, and training happens without them. This helps to get the optimization process out of local minima, and to distribute decisive power between different neural paths, which improves overall stability of the network.

## GPU computations

Deep neural networks, such as VGG-16 and other more modern architectures require quite a lot of computational power to run. It makes sense to use GPU acceleration, if it is available. In order to do so, we need to explicitly move all tensors involved in the computation to GPU.

The way it is normally done is to check the availability of GPU in the code, and define `device` variable that points to the computational device - either GPU or CPU.

```python
device = 'cuda' if torch.cuda.is_available() else 'cpu'

print('Doing computations on device = {}'.format(device))

vgg.to(device)
sample_image = sample_image.to(device)

vgg(sample_image).argmax()
```

Output:
```text
Doing computations on device = cuda

tensor(282, device='cuda:0')
```

## Extracting VGG features

If we want to use VGG-16 to extract features from our images, we need the model without final classification layers. In fact, this "feature extractor" can be obtained using `vgg.features` method:

```python
res = vgg.features(sample_image).cpu()
plt.figure(figsize=(15,3))
plt.imshow(res.detach().view(512,-1).T)
print(res.size())
```

Output:
```text
torch.Size([1, 512, 7, 7])

<Figure size 1080x216 with 1 Axes>
```

The dimension of feature tensor is 512x7x7, but in order to visualize it we had to reshape it to 2D form.

Now let's try to see if those features can be used to classify images. Let's manually take some portion of images (800 in our case), and pre-compute their feature vectors. We will store the result in one big tensor called `feature_tensor`, and also labels into `label_tensor`:

```python
bs = 8
dl = torch.utils.data.DataLoader(dataset,batch_size=bs,shuffle=True)
num = bs*100
feature_tensor = torch.zeros(num,512*7*7).to(device)
label_tensor = torch.zeros(num).to(device)
i = 0
for x,l in dl:
with torch.no_grad():
f = vgg.features(x.to(device))
feature_tensor[i:i+bs] = f.view(bs,-1)
label_tensor[i:i+bs] = l
i+=bs
print('.',end='')
if i>=num:
break
```

Output:
```text
....................................................................................................
```

Now we can define `vgg_dataset` that takes data from this tensor, split it into training and test sets using `random_split` function, and train a small one-layer dense classifier network on top of extracted features:

```python
vgg_dataset = torch.utils.data.TensorDataset(feature_tensor,label_tensor.to(torch.long))
train_ds, test_ds = torch.utils.data.random_split(vgg_dataset,[700,100])

train_loader = torch.utils.data.DataLoader(train_ds,batch_size=32)
test_loader = torch.utils.data.DataLoader(test_ds,batch_size=32)

net = torch.nn.Sequential(torch.nn.Linear(512*7*7,2),torch.nn.LogSoftmax()).to(device)

history = train(net,train_loader,test_loader)
```

Output:
```text
/anaconda/envs/py38_pytorch/lib/python3.8/site-packages/torch/nn/modules/container.py:119: UserWarning: Implicit dimension choice for log_softmax has been deprecated. Change the call to include dim=X as an argument.
input = module(input)

Epoch 0, Train acc=0.879, Val acc=0.990, Train loss=0.110, Val loss=0.007
Epoch 1, Train acc=0.981, Val acc=0.980, Train loss=0.015, Val loss=0.021
Epoch 2, Train acc=0.999, Val acc=0.990, Train loss=0.001, Val loss=0.002
Epoch 3, Train acc=1.000, Val acc=0.980, Train loss=0.000, Val loss=0.002
Epoch 4, Train acc=1.000, Val acc=0.980, Train loss=0.000, Val loss=0.002
Epoch 5, Train acc=1.000, Val acc=0.980, Train loss=0.000, Val loss=0.002
Epoch 6, Train acc=1.000, Val acc=0.980, Train loss=0.000, Val loss=0.002
Epoch 7, Train acc=1.000, Val acc=0.980, Train loss=0.000, Val loss=0.002
Epoch 8, Train acc=1.000, Val acc=0.980, Train loss=0.000, Val loss=0.002
Epoch 9, Train acc=1.000, Val acc=0.980, Train loss=0.000, Val loss=0.002
```

The result is great, we can distinguish between a cat and a dog with almost 98% probability! However, we have only tested this approach on a small subset of all images, because manual feature extraction seems to take a lot of time.

## Transfer learning using one VGG network

We can also avoid manually pre-computing the features by using the original VGG-16 network as a whole during training. Let's look at the VGG-16 object structure:

```python
print(vgg)
```

Output:
```text
VGG(
(features): Sequential(
(0): Conv2d(3, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(1): ReLU(inplace=True)
(2): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(3): ReLU(inplace=True)
(4): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
(5): Conv2d(64, 128, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(6): ReLU(inplace=True)
(7): Conv2d(128, 128, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(8): ReLU(inplace=True)
(9): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
(10): Conv2d(128, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(11): ReLU(inplace=True)
(12): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(13): ReLU(inplace=True)
(14): Conv2d(256, 256, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(15): ReLU(inplace=True)
(16): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
(17): Conv2d(256, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(18): ReLU(inplace=True)
(19): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(20): ReLU(inplace=True)
(21): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(22): ReLU(inplace=True)
(23): MaxPool2d(kernel_size=2, stride=2, padding=0, dilation=1, ceil_mode=False)
(24): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1))
(25): ReLU(inplace=True)
(26): Conv2d(512, 512, kernel_size=(3, 3), stride=(1, 1), paddin
```

You can see that the network contains:
* feature extractor (`features`), comprised of a number of convolutional and pooling layers
* average pooling layer (`avgpool`)
* final `classifier`, consisting of several dense layers, which turns 25088 input features into 1000 classes (which is the number of classes in ImageNet)

To train the end-to-end model that will classify our dataset, we need to:
* **replace the final classifier** with the one that will produce required number of classes. In our case, we can use one `Linear` layer with 25088 inputs and 2 output neurons.
* **freeze weights of convolutional feature extractor**, so that they are not trained. It is recommended to initially do this freezing, because otherwise untrained classifier layer can destroy the original pre-trained weights of convolutional extractor. Freezing weights can be accomplished by setting `requires_grad` property of all parameters to `False`

```python
vgg.classifier = torch.nn.Linear(25088,2).to(device)

for x in vgg.features.parameters():
x.requires_grad = False

summary(vgg,(1, 3,244,244))
```

Output:
```text
==========================================================================================
Layer (type:depth-idx) Output Shape Param #
==========================================================================================
VGG -- --
├─Sequential: 1-1 [1, 512, 7, 7] --
│ └─Conv2d: 2-1 [1, 64, 244, 244] (1,792)
│ └─ReLU: 2-2 [1, 64, 244, 244] --
│ └─Conv2d: 2-3 [1, 64, 244, 244] (36,928)
│ └─ReLU: 2-4 [1, 64, 244, 244] --
│ └─MaxPool2d: 2-5 [1, 64, 122, 122] --
│ └─Conv2d: 2-6 [1, 128, 122, 122] (73,856)
│ └─ReLU: 2-7 [1, 128, 122, 122] --
│ └─Conv2d: 2-8 [1, 128, 122, 122] (147,584)
│ └─ReLU: 2-9 [1, 128, 122, 122] --
│ └─MaxPool2d: 2-10 [1, 128, 61, 61] --
│ └─Conv2d: 2-11 [1, 256, 61, 61] (295,168)
│ └─ReLU: 2-12 [1, 256, 61, 61] --
│ └─Conv2d: 2-13 [1, 256, 61, 61] (590,080)
│ └─ReLU: 2-14 [1, 256, 61, 61] --
│ └─Conv2d: 2-15 [1, 256, 61, 61] (590,080)
│ └─ReLU: 2-16 [1, 256, 61, 61] --
│ └─MaxPool2d: 2-17
```

As you can see from the summary, this model contain around 15 million total parameters, but only 50k of them are trainable - those are the weights of classification layer. That is good, because we are able to fine-tune smaller number of parameters with smaller number of examples.

Now let's train the model using our original dataset. This process will take a long time, so we will use `train_long` function that will print some intermediate results without waiting for the end of epoch. It is highly recommended to run this training on GPU-enabled compute!

```python
trainset, testset = torch.utils.data.random_split(dataset,[20000,len(dataset)-20000])
train_loader = torch.utils.data.DataLoader(trainset,batch_size=16)
test_loader = torch.utils.data.DataLoader(testset,batch_size=16)

train_long(vgg,train_loader,test_loader,loss_fn=torch.nn.CrossEntropyLoss(),epochs=1,print_freq=90)
```

Output:
```text
Epoch 0, minibatch 0: train acc = 0.5, train loss = 0.0431101992726326
Epoch 0, minibatch 90: train acc = 0.9539835164835165, train loss = 0.0960497070144821

/anaconda/envs/py38_pytorch/lib/python3.8/site-packages/PIL/TiffImagePlugin.py:793: UserWarning: Truncated File Read
warnings.warn(str(msg))

Epoch 0, minibatch 180: train acc = 0.9582182320441989, train loss = 0.12481052967724879
Epoch 0, minibatch 270: train acc = 0.9587177121771218, train loss = 0.14185787918822793
Epoch 0, minibatch 360: train acc = 0.9634695290858726, train loss = 0.14566257719848294
Epoch 0, minibatch 450: train acc = 0.966879157427938, train loss = 0.13402751914149114
Epoch 0, minibatch 540: train acc = 0.9686922365988909, train loss = 0.13931148902766144
Epoch 0, minibatch 630: train acc = 0.9694928684627575, train loss = 0.1386710044510202
Epoch 0, minibatch 720: train acc = 0.970613730929265, train loss = 0.13363790313678375
Epoch 0, minibatch 810: train acc = 0.9709463625154131, train loss = 0.1342217084364885
Epoch 0, minibatch 900: train acc = 0.9721143174250833, train loss = 0.13233261023721474
Epoch 0, minibatch 990: train acc = 0.9726286579212916, train loss = 0.1334670727957871
Epoch 0, minibatch 1080: train acc = 0.9733464384828863, train loss = 0.13777193110039893
Epoch 0, minibatch 1170: train acc = 0.9734735269000854, train loss = 0.14239378162778207
Epoch 0 done, validation acc = 0.9671868747499, validation loss = 0.25287964306816474
```

It looks like we have obtained reasonably accurate cats vs. dogs classifier! Let's save it for future use!

```python
torch.save(vgg,'data/cats_dogs.pth')
```

We can then load the model from file at any time. You may find it useful in case the next experiment destroys the model - you would not have to re-start from scratch.

```python
vgg = torch.load('data/cats_dogs.pth')
```

## Fine-tuning transfer learning

In the previous section, we have trained the final classifier layer to classify images in our own dataset. However, we did not re-train the feature extractor, and our model relied on the features that the model has learned on ImageNet data. If your objects visually differ from ordinary ImageNet images, this combination of features might not work best. Thus it makes sense to start training convolutional layers as well.

To do that, we can unfreeze the convolutional filter parameters that we have previously frozen.

> **Note:** It is important that you freeze parameters first and perform several epochs of training in order to stabilize weights in the classification layer. If you immediately start training end-to-end network with unfrozen parameters, large errors are likely to destroy the pre-trained weights in the convolutional layers.

```python
for x in vgg.features.parameters():
x.requires_grad = True
```

After unfreezing, we can do a few more epochs of training. You can also select lower learning rate, in order to minimize the impact on the pre-trained weights. However, even with low learning rate, you can expect the accuracy to drop in the beginning of the training, until finally reaching slightly higher level than in the case of fixed weights.

> **Note:** This training happens much slower, because we need to propagate gradients back through many layers of the network! You may want to watch the first few minibatches to see the tendency, and then stop the computation.

```python
train_long(vgg,train_loader,test_loader,loss_fn=torch.nn.CrossEntropyLoss(),epochs=1,print_freq=90,lr=0.0001)
```

Output:
```text
Epoch 0, minibatch 0: train acc = 1.0, train loss = 0.0
Epoch 0, minibatch 90: train acc = 0.8990384615384616, train loss = 0.2978392171335744
Epoch 0, minibatch 180: train acc = 0.9060773480662984, train loss = 0.1658294214069514
Epoch 0, minibatch 270: train acc = 0.9102859778597786, train loss = 0.11819224340009514
Epoch 0, minibatch 360: train acc = 0.9191481994459834, train loss = 0.09244130522920814
Epoch 0, minibatch 450: train acc = 0.9261363636363636, train loss = 0.07583886292451236
Epoch 0, minibatch 540: train acc = 0.928373382624769, train loss = 0.06537413817456822
Epoch 0, minibatch 630: train acc = 0.9318541996830428, train loss = 0.057419379426257924
Epoch 0, minibatch 720: train acc = 0.9361130374479889, train loss = 0.05114534460059813
Epoch 0, minibatch 810: train acc = 0.938347718865598, train loss = 0.04657612246737968
Epoch 0, minibatch 900: train acc = 0.9407602663706992, train loss = 0.04258851655712403
Epoch 0, minibatch 990: train acc = 0.9431130171543896, train loss = 0.03927870595491257
Epoch 0, minibatch 1080: train acc = 0.945536540240518, train loss = 0.03652716609309053
Epoch 0, minibatch 1170: train acc = 0.9463065755764304, train loss = 0.03445258006186286
Epoch 0 done, validation acc = 0.974389755902361, validation loss = 0.005457923144233279
```

## Other computer vision models

VGG-16 is one of the simplest computer vision architectures. `torchvision` package provides many more pre-trained networks. The most frequently used ones among those are **ResNet** architectures, developed by Microsoft, and **Inception** by Google. For example, let's explore the architecture of the simplest ResNet-18 model (ResNet is a family of models with different depth, you can try experimenting with ResNet-151 if you want to see what a really deep model looks like):

```python
resnet = torchvision.models.resnet18()
print(resnet)
```

Output:
```text
ResNet(
(conv1): Conv2d(3, 64, kernel_size=(7, 7), stride=(2, 2), padding=(3, 3), bias=False)
(bn1): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
(relu): ReLU(inplace=True)
(maxpool): MaxPool2d(kernel_size=3, stride=2, padding=1, dilation=1, ceil_mode=False)
(layer1): Sequential(
(0): BasicBlock(
(conv1): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
(bn1): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
(relu): ReLU(inplace=True)
(conv2): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
(bn2): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
)
(1): BasicBlock(
(conv1): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
(bn1): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
(relu): ReLU(inplace=True)
(conv2): Conv2d(64, 64, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
(bn2): BatchNorm2d(64, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
)
(layer2): Sequential(
(0): BasicBlock(
(conv1): Conv2d(64, 128, kernel_size=(3, 3), stride=(2, 2), padding=(1, 1), bias=False)
(bn1): BatchNorm2d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
(relu): ReLU(inplace=True)
(conv2): Conv2d(128, 128, kernel_size=(3, 3), stride=(1, 1), padding=(1, 1), bias=False)
(bn2): BatchNorm2d(128, eps=1e-05, mome
```

As you can see, the model contains the same building blocks: feature extractor and final classifier (`fc`). This allows us to use this model in exactly the same manner as we have been using VGG-16 for transfer learning. You can try experimenting with the code above, using different ResNet models as the base model, and see how accuracy changes.

## Batch Normalization

This network contains yet another type of layer: **Batch Normalization**. The idea of batch normalization is to bring values that flow through the neural network to right interval. Usually neural networks work best when all values are in the range of [-1,1] or [0,1], and that is the reason that we scale/normalize our input data accordingly. However, during training of a deep network, it can happen that values get significantly out of this range, which makes training problematic. Batch normalization layer computes average and standard deviation for all values of the current minibatch, and uses them to normalize the signal before passing it through a neural network layer. This significantly improves the stability of deep networks.

## Takeaway

Using transfer learning, we were able to quickly put together a classifier for our custom object classification task, and achieve high accuracy. However, this example was not completely fair, because original VGG-16 network was pre-trained to recognize cats and dogs, and thus we were just reusing most of the patterns that were already present in the network. You can expect lower accuracy on more exotic domain-specific objects, such as details on production line in a plant, or different tree leaves.

You can see that more complex tasks that we are solving now require higher computational power, and cannot be easily solved on the CPU. In the next unit, we will try to use more lightweight implementation to train the same model using lower compute resources, which results in just slightly lower accuracy.
