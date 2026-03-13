# Pre-trained models and transfer learning

Source: AI for Beginners
Original URL: https://github.com/microsoft/AI-For-Beginners/blob/HEAD/lessons/4-ComputerVision/08-TransferLearning/TransferLearningTF.ipynb
Original Path: lessons/4-ComputerVision/08-TransferLearning/TransferLearningTF.ipynb
Course: Artificial Intelligence

# Pre-trained models and transfer learning

Training CNNs can take a lot of time, and a lot of data is required for that task. However, much of the time is spent to learn the best low-level filters that a network is using to extract patterns from images. A natural question arises - can we use a neural network trained on one dataset and adapt it to classifying different images without full training process?

This approach is called **transfer learning**, because we transfer some knowledge from one neural network model to another. In transfer learning, we typically start with a pre-trained model, which has been trained on some large image dataset, such as **ImageNet**. Those models can already do a good job extracting different features from generic images, and in many cases just building a classifier on top of those extracted features can yield a good result.

```python
import tensorflow as tf
from tensorflow import keras
import matplotlib.pyplot as plt
import numpy as np
import os
from tfcv import *
```

## Cats vs. Dogs Dataset

In this unit, we will solve a real-life problem of classifying images of cats and dogs. For this reason, we will use [Kaggle Cats vs. Dogs Dataset](https://www.kaggle.com/c/dogs-vs-cats), which can also be downloaded [from Microsoft](https://www.microsoft.com/en-us/download/details.aspx?id=54765&WT.mc_id=academic-77998-cacaste).

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
Corrupt image or wrong format: data/PetImages/Cat/12235.jpg
Corrupt image or wrong format: data/PetImages/Cat/2663.jpg
Corrupt image or wrong format: data/PetImages/Cat/4929.jpg
Corrupt image or wrong format: data/PetImages/Cat/8183.jpg
Corrupt image or wrong format: data/PetImages/Cat/11083.jpg
Corrupt image or wrong format: data/PetImages/Cat/6435.jpg
Corrupt image or wrong format: data/PetImages/Cat/6491.jpg
Corrupt image or wrong format: data/PetImages/Cat/7968.jpg
Corrupt image or wrong format: data/PetImages/Cat/6768.jpg
Corrupt image or wrong format: data/PetImages/Cat/11397.jpg
Corrupt image or wrong format: data/PetImages/Cat/8295.jpg
Corrupt image or wrong format: data/PetImages/Cat/4874.jpg
Corrupt image or wrong format: data/PetImages/Cat/23.jpg
Corrupt image or wrong format: data/PetImages/Cat/11864.jpg
Corrupt image or wrong format: data/PetImages/Cat/3491.jpg
Corrupt image or wrong format: data/PetImages/Cat/11729.jpg
Corrupt image or wrong format: data/PetImages/Cat/3197.jpg
Corrupt image or wrong format: data/PetImages/Cat/10874.jpg
Corrupt image or wrong format: data/PetImages/Cat/6376.jpg
Corrupt image or wrong format: data/PetImages/Cat/9361.jpg
Corrupt image or wrong format: data/PetImages/Cat/9328.jpg
Corrupt image or wrong format: data/PetImages/Cat/910.jpg
Corrupt image or wrong format: data/PetImages/Cat/2021.jpg
Corrupt image or wrong format: data/PetImages/Cat/666.jpg
Corrupt image or wrong format: data/PetImages/Cat/3710.jpg
Corrupt image or wrong format: data/PetImages/Cat/9171.jpg
Corrupt image or wrong format: data/PetImages/Cat/6906.jpg
Corru

/anaconda/envs/py38_tensorflow/lib/python3.8/site-packages/PIL/TiffImagePlugin.py:793: UserWarning: Truncated File Read
warnings.warn(str(msg))

Corrupt image or wrong format: data/PetImages/Dog/543.jpg
Corrupt image or wrong format: data/PetImages/Dog/8730.jpg
Corrupt image or wrong format: data/PetImages/Dog/12114.jpg
Corrupt image or wrong format: data/PetImages/Dog/522.jpg
Corrupt image or wrong format: data/PetImages/Dog/10863.jpg
Corrupt image or wrong format: data/PetImages/Dog/10401.jpg
Corrupt image or wrong format: data/PetImages/Dog/7739.jpg
Corrupt image or wrong format: data/PetImages/Dog/561.jpg
Corrupt image or wrong format: data/PetImages/Dog/1308.jpg
Corrupt image or wrong format: data/PetImages/Dog/9643.jpg
Corrupt image or wrong format: data/PetImages/Dog/3155.jpg
Corrupt image or wrong format: data/PetImages/Dog/5736.jpg
Corrupt image or wrong format: data/PetImages/Dog/4257.jpg
Corrupt image or wrong format: data/PetImages/Dog/11853.jpg
Corrupt image or wrong format: data/PetImages/Dog/6855.jpg
Corrupt image or wrong format: data/PetImages/Dog/1259.jpg
Corrupt image or wrong format: data/PetImages/Dog/7652.jpg
Corrupt image or wrong format: data/PetImages/Dog/573.jpg
Corrupt image or wrong format: data/PetImages/Dog/11702.jpg
Corrupt image or wrong format: data/PetImages/Dog/414.jpg
Corrupt image or wrong format: data/PetImages/Dog/4301.jpg
Corrupt image or wrong format: data/PetImages/Dog/9500.jpg
Corrupt image or wrong format: data/PetImages/Dog/10726.jpg
Corrupt image or wrong format: data/PetImages/Dog/9367.jpg
Corrupt image or wrong format: data/PetImages/Dog/2877.jpg
Corrupt image or wrong format: data/PetImages/Dog/10907.jpg
Corrupt image or wrong format: data/PetImages/Dog/10972.jpg
Corr
```

## Loading the Dataset

In previous examples, we were loading datasets that are built into Keras. Now we are about to deal with our own dataset, which we need to load from a directory of images.

In real life, the size of image datasets can be pretty large, and one cannot rely on all data being able to fit into memory. Thus, datasets are often represented as **generators** that can return data in minibatches suitable for training.

To deal with image classification, Keras includes special function `image_dataset_from_directory`, which can load images from subdirectories corresponding to different classes. This function also takes care of scaling images, and it can also split dataset into train and test subsets:

```python
data_dir = 'data/PetImages'
batch_size = 64
ds_train = keras.preprocessing.image_dataset_from_directory(
data_dir,
validation_split = 0.2,
subset = 'training',
seed = 13,
image_size = (224,224),
batch_size = batch_size
)
ds_test = keras.preprocessing.image_dataset_from_directory(
data_dir,
validation_split = 0.2,
subset = 'validation',
seed = 13,
image_size = (224,224),
batch_size = batch_size
)
```

Output:
```text
Found 24769 files belonging to 2 classes.
Using 19816 files for training.
Found 24769 files belonging to 2 classes.
Using 4953 files for validation.
```

It is important to set the same `seed` value for both calls, because it affects the split of images between train and test dataset.

Dataset automatically picks up class names from directories, and you can access them if needed by calling:

```python
ds_train.class_names
```

Output:
```text
['Cat', 'Dog']
```

Datasets that we have obtained can be directly passed to `fit` function to train the model. They contain both corresponding images and labels, which can be looped over using the following construction:

```python
for x,y in ds_train:
print(f"Training batch shape: features={x.shape}, labels={y.shape}")
x_sample, y_sample = x,y
break

display_dataset(x_sample.numpy().astype(np.int),np.expand_dims(y_sample,1),classes=ds_train.class_names)
```

Output:
```text
Training batch shape: features=(64, 224, 224, 3), labels=(64,)

<Figure size 1080x216 with 10 Axes>
```

> **Note**: All images in the dataset are represented as floatint point tensors with range 0-255. Before passing them to the neural network, we need to scale those values into 0-1 range. When plotting images, we either need to do the same, or convert values to the `int` type (which we do in the code above), in order to show `matplotlib` that we want to plot the original unscaled image.

## Pre-trained models

For many image classification tasks one can find pre-trained neural network models. Many of those models are available inside `keras.applications` namespace, and even more models can be found on the Internet. Let's see how simplest VGG-16 model can be loaded and used:

```python
vgg = keras.applications.VGG16()
inp = keras.applications.vgg16.preprocess_input(x_sample[:1])

res = vgg(inp)
print(f"Most probable class = {tf.argmax(res,1)}")

keras.applications.vgg16.decode_predictions(res.numpy())
```

Output:
```text
Downloading data from https://storage.googleapis.com/tensorflow/keras-applications/vgg16/vgg16_weights_tf_dim_ordering_tf_kernels.h5
553467904/553467096 [==============================] - 6s 0us/step
Most probable class = [208]
Downloading data from https://storage.googleapis.com/download.tensorflow.org/data/imagenet_class_index.json
40960/35363 [==================================] - 0s 0us/step

[[('n02099712', 'Labrador_retriever', 0.5340957),
('n02100236', 'German_short-haired_pointer', 0.0939442),
('n02092339', 'Weimaraner', 0.08160535),
('n02099849', 'Chesapeake_Bay_retriever', 0.057179328),
('n02109047', 'Great_Dane', 0.03733857)]]
```

There are a couple of important things here:
* Before passing an input to any pre-trained network it has to be pre-processed in a certain way. This is done by calling corresponding `preprocess_input` function, which receives a batch of images, and returns their processed form. In the case of VGG-16, images are normalized, and some pre-defined avarage value for each channels is subtracted. That is because VGG-16 was originally trained with this pre-processing.
* Neural network is applied to the input batch, and we receive as the result a batch of 1000-element tensors that show probability of each class. We can find the most probable class number by calling `argmax` on this tensor.
* Obtained result is a [number of an `ImageNet` class](https://gist.github.com/yrevar/942d3a0ac09ec9e5eb3a). To make sense of this result, we can also use `decode_predictions` function, that returns top n classes together with their names.

Let's also see the architecture of the VGG-16 network:

```python
vgg.summary()
```

Output:
```text
Model: "vgg16"
_________________________________________________________________
Layer (type) Output Shape Param #
=================================================================
input_1 (InputLayer) [(None, 224, 224, 3)] 0
_________________________________________________________________
block1_conv1 (Conv2D) (None, 224, 224, 64) 1792
_________________________________________________________________
block1_conv2 (Conv2D) (None, 224, 224, 64) 36928
_________________________________________________________________
block1_pool (MaxPooling2D) (None, 112, 112, 64) 0
_________________________________________________________________
block2_conv1 (Conv2D) (None, 112, 112, 128) 73856
_________________________________________________________________
block2_conv2 (Conv2D) (None, 112, 112, 128) 147584
_________________________________________________________________
block2_pool (MaxPooling2D) (None, 56, 56, 128) 0
_________________________________________________________________
block3_conv1 (Conv2D) (None, 56, 56, 256) 295168
_________________________________________________________________
block3_conv2 (Conv2D) (None, 56, 56, 256) 590080
_________________________________________________________________
block3_conv3 (Conv2D) (None, 56, 56, 256) 590080
_________________________________________________________________
block3_pool (MaxPooling2D) (None, 28, 28, 256) 0
_
```

## GPU computations

Deep neural networks, such as VGG-16 and other more modern architectures require quite a lot of computational power to run. It makes sense to use GPU acceleration, if it is available. Luckily, Keras automatically speeds up the computatons on the GPU if it is available. We can check if Tensorflow is able to use GPU using the following code:

```python
tf.config.list_physical_devices('GPU')
```

Output:
```text
[PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
```

## Extracting VGG features

If we want to use VGG-16 to extract features from our images, we need the model without final classification layers. We can instantiate VGG-16 model without top layers using this code:

```python
vgg = keras.applications.VGG16(include_top=False)

inp = keras.applications.vgg16.preprocess_input(x_sample[:1])
res = vgg(inp)
print(f"Shape after applying VGG-16: {res[0].shape}")
plt.figure(figsize=(15,3))
plt.imshow(res[0].numpy().reshape(-1,512))
```

Output:
```text
Shape after applying VGG-16: (7, 7, 512)

<matplotlib.image.AxesImage at 0x7fafcc685ac0>

<Figure size 1080x216 with 1 Axes>
```

The dimension of feature tensor is 7x7x512, but in order to visualize it we had to reshape it to 2D form.

Now let's try to see if those features can be used to classify images. Let's manually take some portion of images (50 minibatches, in our case), and pre-compute their feature vectors. We can use Tensorflow **dataset** API to do that. `map` function takes a dataset and applies a given lambda-function to transform it. We use this mechanism to construct new datasets, `ds_features_train` and `ds_features_test`, that contain VGG-extracted features instead of original images.

```python
num = batch_size*50
ds_features_train = ds_train.take(50).map(lambda x,y : (vgg(x),y))
ds_features_test = ds_test.take(10).map(lambda x,y : (vgg(x),y))

for x,y in ds_features_train:
print(x.shape,y.shape)
break
```

Output:
```text
(64, 7, 7, 512) (64,)
```

We used construction `.take(50)` to limit the dataset size, to speed up our demonstration. You can of course perform this experiment on the full dataset.

Now that we have a dataset with extracted features, we can train a simple dense classifier to distinguish between cats and dogs. This network will take feature vector of shape (7,7,512), and produce one output that corresponds either to a dog or to a cat. Because it is a binary classification, we use `sigmoid` activation function and `binary_crossentropy` loss.

```python
model = keras.models.Sequential([
keras.layers.Flatten(input_shape=(7,7,512)),
keras.layers.Dense(1,activation='sigmoid')
])
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['acc'])
hist = model.fit(ds_features_train, validation_data=ds_features_test)
```

Output:
```text
50/50 [==============================] - 1896s 38s/step - loss: 1.4845 - acc: 0.9144 - val_loss: 0.7220 - val_acc: 0.9516
```

The result is great, we can distinguish between a cat and a dog with almost 95% probability! However, we have only tested this approach on a subset of all images, because manual feature extraction seems to take a lot of time.

## Transfer learning using one VGG network

We can also avoid manually pre-computing the features by using the original VGG-16 network as a whole during training, by adding feature extractor to our network as a first layer.

The beauty of Keras architecture is that VGG-16 model that we have defined above can also be used as a layer in another neural network! We just need to construct a network with dense classifier on top of it, and then train the whole network using back propagation.

```python
model = keras.models.Sequential()
model.add(keras.applications.VGG16(include_top=False,input_shape=(224,224,3)))
model.add(keras.layers.Flatten())
model.add(keras.layers.Dense(1,activation='sigmoid'))

model.layers[0].trainable = False

model.summary()
```

Output:
```text
Model: "sequential"
_________________________________________________________________
Layer (type) Output Shape Param #
=================================================================
vgg16 (Functional) (None, 7, 7, 512) 14714688
_________________________________________________________________
flatten (Flatten) (None, 25088) 0
_________________________________________________________________
dense (Dense) (None, 1) 25089
=================================================================
Total params: 14,739,777
Trainable params: 25,089
Non-trainable params: 14,714,688
_________________________________________________________________
```

This model looks like and end-to-end classification network, which takes an image and returns the class. However, the tricky thing is that we want VGG16 to act as a feature extractor, and not to be re-trained. Thus, we need to **freeze weights of convolutional feature extractor**. We can access first layer of the network by calling `model.layers[0]`, and we just need to set `trainable` property to `False`.

> **Note**: Freezing of feature extractor weights is needed, because otherwise untrained classifier layer can destroy the original pre-trained weights of convolutional extractor.

You can notice that while the total number of parameters in our network is around 15 million, we are only training 25k parameters. All other parameters of top-level convolutional filters are pre-trained. That is good, because we are able to fine-tune smaller number of parameters with smaller number of examples.

We will now train our network and see how good we can get. Expect rather long running time, and do not worry if the execution seems frozen for some time.

```python
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['acc'])
hist = model.fit(ds_train, validation_data=ds_test)
```

Output:
```text
310/310 [==============================] - 265s 716ms/step - loss: 0.9917 - acc: 0.9512 - val_loss: 0.8156 - val_acc: 0.9671
```

It looks like we have obtained reasonably accurate cats vs. dogs classifier!

## Saving and Loading the Model

Once we have trained the model, we can save model architecture and trained weights to a file for future use:

```python
model.save('data/cats_dogs.tf')
```

Output:
```text
INFO:tensorflow:Assets written to: data/cats_dogs.tf/assets
```

We can then load the model from file at any time. You may find it useful in case the next experiment destroys the model - you would not have to re-start from scratch.

```python
model = keras.models.load_model('data/cats_dogs.tf')
```

## Fine-tuning transfer learning

In the previous section, we have trained the final classifier layer to classify images in our own dataset. However, we did not re-train the feature extractor, and our model relied on the features that the model has learned on ImageNet data. If your objects visually differ from ordinary ImageNet images, this combination of features might not work best. Thus it makes sense to start training convolutional layers as well.

To do that, we can unfreeze the convolutional filter parameters that we have previously frozen.

> **Note:** It is important that you freeze parameters first and perform several epochs of training in order to stabilize weights in the classification layer. If you immediately start training end-to-end network with unfrozen parameters, large errors are likely to destroy the pre-trained weights in the convolutional layers.

Our convolutional VGG-16 model is located inside the first layer, and it consists of many layers itself. We can have a look at its structure:

```python
model.layers[0].summary()
```

Output:
```text
Model: "vgg16"
_________________________________________________________________
Layer (type) Output Shape Param #
=================================================================
input_1 (InputLayer) [(None, 224, 224, 3)] 0
_________________________________________________________________
block1_conv1 (Conv2D) (None, 224, 224, 64) 1792
_________________________________________________________________
block1_conv2 (Conv2D) (None, 224, 224, 64) 36928
_________________________________________________________________
block1_pool (MaxPooling2D) (None, 112, 112, 64) 0
_________________________________________________________________
block2_conv1 (Conv2D) (None, 112, 112, 128) 73856
_________________________________________________________________
block2_conv2 (Conv2D) (None, 112, 112, 128) 147584
_________________________________________________________________
block2_pool (MaxPooling2D) (None, 56, 56, 128) 0
_________________________________________________________________
block3_conv1 (Conv2D) (None, 56, 56, 256) 295168
_________________________________________________________________
block3_conv2 (Conv2D) (None, 56, 56, 256) 590080
_________________________________________________________________
block3_conv3 (Conv2D) (None, 56, 56, 256) 590080
_________________________________________________________________
block3_pool (MaxPooling2D) (None, 28, 28, 256) 0
_
```

We can unfreeze all layers of convolutional base:

```python
model.layers[0].trainable = True
```

However, unfeezing all of them at once is not the best idea. We can first unfreeze just a few final layers of convolutions, because they contain higher level patterns that are relevant for our images. For example, to begin with, we can freeze all layers except the last 4:

```python
for i in range(len(model.layers[0].layers)-4):
model.layers[0].layers[i].trainable = False
model.summary()
```

Output:
```text
Model: "sequential"
_________________________________________________________________
Layer (type) Output Shape Param #
=================================================================
vgg16 (Functional) (None, 7, 7, 512) 14714688
_________________________________________________________________
flatten (Flatten) (None, 25088) 0
_________________________________________________________________
dense (Dense) (None, 1) 25089
=================================================================
Total params: 14,739,777
Trainable params: 7,104,513
Non-trainable params: 7,635,264
_________________________________________________________________
```

Observe that the number of trainable parameters increased significantly, but it is still around 50% of all parameters.

After unfreezing, we can do a few more epochs of training (in our example, we will do just one). You can also select lower learning rate, in order to minimize the impact on the pre-trained weights. However, even with low learning rate, you can expect the accuracy to drop in the beginning of the training, until finally reaching slightly higher level than in the case of fixed weights.

> **Note:** This training happens much slower, because we need to propagate gradients back through many layers of the network!

```python
hist = model.fit(ds_train, validation_data=ds_test)
```

Output:
```text
310/310 [==============================] - 201s 645ms/step - loss: 0.5270 - acc: 0.9776 - val_loss: 1.4132 - val_acc: 0.9653
```

We are likely to achieve higher training accuracy, because we are using more poweful network with more parameters, but validation accuracy would increase not as much.

Feel free to unfreeze a few more layers of the network and train more, to see if you are able to achieve higher accuracy!

## Other computer vision models

VGG-16 is one of the simplest computer vision architectures. Keras provides many more pre-trained networks. The most frequently used ones among those are **ResNet** architectures, developed by Microsoft, and **Inception** by Google. For example, let's explore the architecture of the simplest ResNet-50 model (ResNet is a family of models with different depth, you can try experimenting with ResNet-152 if you want to see what a really deep model looks like):

```python
resnet = keras.applications.ResNet50()
resnet.summary()
```

Output:
```text
Model: "resnet50"
__________________________________________________________________________________________________
Layer (type) Output Shape Param # Connected to
==================================================================================================
input_3 (InputLayer) [(None, 224, 224, 3) 0
__________________________________________________________________________________________________
conv1_pad (ZeroPadding2D) (None, 230, 230, 3) 0 input_3[0][0]
__________________________________________________________________________________________________
conv1_conv (Conv2D) (None, 112, 112, 64) 9472 conv1_pad[0][0]
__________________________________________________________________________________________________
conv1_bn (BatchNormalization) (None, 112, 112, 64) 256 conv1_conv[0][0]
__________________________________________________________________________________________________
conv1_relu (Activation) (None, 112, 112, 64) 0 conv1_bn[0][0]
__________________________________________________________________________________________________
pool1_pad (ZeroPadding2D) (None, 114, 114, 64) 0 conv1_relu[0][0]
__________________________________________________________________________________________________
pool1_pool (MaxPooling2D) (None, 56, 56, 64) 0 pool1_pad[0][0]
```

As you can see, the model contains the same familiar building blocks: convolutional layers, pooling layers and final dense classifier. We can use this model in exactly the same manner as we have been using VGG-16 for transfer learning. You can try experimenting with the code above, using different ResNet models as the base model, and see how accuracy changes.

## Batch Normalization

This network contains yet another type of layer: **Batch Normalization**. The idea of batch normalization is to bring values that flow through the neural network to right interval. Usually neural networks work best when all values are in the range of [-1,1] or [0,1], and that is the reason that we scale/normalize our input data accordingly. However, during training of a deep network, it can happen that values get significantly out of this range, which makes training problematic. Batch normalization layer computes average and standard deviation for all values of the current minibatch, and uses them to normalize the signal before passing it through a neural network layer. This significantly improves the stability of deep networks.

## Takeaway

Using transfer learning, we were able to quickly put together a classifier for our custom object classification task, and achieve high accuracy. However, this example was not completely fair, because original VGG-16 network was pre-trained to recognize cats and dogs, and thus we were just reusing most of the patterns that were already present in the network. You can expect lower accuracy on more exotic domain-specific objects, such as details on production line in a plant, or different tree leaves.

You can see that more complex tasks that we are solving now require higher computational power, and cannot be easily solved on the CPU. In the next unit, we will try to use more lightweight implementation to train the same model using lower compute resources, which results in just slightly lower accuracy.
