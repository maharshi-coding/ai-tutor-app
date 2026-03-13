# author: Kirill Panin

Source: mlcourse.ai
Original URL: https://github.com/Yorko/mlcourse.ai/blob/HEAD/jupyter_english/projects_indiv/diabetic_retinopathy_detection_Kirill_Panin.ipynb
Original Path: jupyter_english/projects_indiv/diabetic_retinopathy_detection_Kirill_Panin.ipynb
Course: Machine Learning

author: Kirill Panin

# Diabetic Retinopathy Detection

TOC:
[1. Feature and data explanation (2 points)](#1)
[2-3. Primary data analysis (4 points)](#2)[3. Primary visual data analysis (4 points)](#3)
[4-6. Insights and found dependencies (4 points)](#4) [5. Metrics selection (3 points)](#5)[6. Model selection (3 points)](#6):
[7-11. Data preprocessing (4 points)](#7)[8. Cross-validation and adjustment of model hyperparameters (4 points)](#8)[9. Creation of new features and description of this process (4 points)](#9)[10. Plotting training and validation curves (4 points)](#10)[11. Prediction for test or hold-out samples (2 points)](#11):

* [Augmentation](#aug)
* [VGG-16 Model](#vgg)
* [Inception Model](#inception)

[12. Conclusions (2 points)](#12)

## 1. Feature and data explanation (2 points)<a id='1'></a>
(+) The process of collecting data is described, a detailed explanation of the task is provided, its value is explained, target features are given;

### Foreword
Hi friends. I've been starting this project without practical knowledge in CV. I want help my friends in that sphere. They doing ml models associated with detection diabetic retinopathy disease on early stage.
I united some evaluation topic plans to one categories. Because approaches to image processing distinguished than processing with tabular data.

__*Diabetic retinopathy*__ is the leading cause of blindness in the working-age population of the developed world. It is estimated to affect over 93 million people.
__Major aim__ of this task develop robust algorithms that can detection diabetic retinopathy disease on early stage and cope with presence of noise and variation.

**Dataset**
Provided a extremely large dataset(82 GB) [link data](https://www.kaggle.com/c/diabetic-retinopathy-detection/data). Train set with labels(but some labels don't true)(35 GB). High-resolution retina images taken under a variety of imaging conditions. The images in the dataset come from different models and types of cameras, which can affect the visual appearance of left vs. right. A left and right eyes is provided for every patient. Like any real-world data set have encounter noise in both the images and labels. Images may contain artifacts, be out of focus, underexposed, or overexposed.

Clinicians, doctors has __marked up the data__ using a web special tool.

A clinician has rated the presence of diabetic retinopathy in each image on a scale of 0 to 4, according to the following scale(__multiclass classification, target__):

0 - No DR
1 - Mild
2 - Moderate
3 - Severe
4 - Proliferative DR

The methods __how to solve this task__:

The goal is to make a retinopathy model by using a pretrained models inception v3(base and retraining some modified final layers with attention), VGG-16 and just Keras from scratch.

This can be massively improved with

* high-resolution images
* better data sampling
* ensuring there is no leaking between training and validation sets, sample(replace = True) is real dangerous
* better target variable (age) normalization
* pretrained models
* attention/related techniques to focus on areas, segmentation

```python
import numpy as np
import pandas as pd
import seaborn as sns
import os
import tensorflow as tf
from PIL import Image
from tensorflow.python.client import device_lib
import matplotlib.pyplot as plt
```

```python
#cd /media/gismart/sda/kirill_data/deepdee/
#cd ../../../workdir/Work/deepDee/
#ls
```

```python
# Example of image.
im1 = Image.open('train/10210_right.jpeg')
im1
```

## 2. Primary data analysis (4 points) & <a id='2'></a>

## 3. Primary visual data analysis (4 points)<a id='3'></a>

```python
Image.open('train/1233_left.jpeg')
```

Plotting Histograms

```python
import cv2
import numpy as np
from matplotlib import pyplot as plt

img = cv2.imread('train/1052_left.jpeg',0)
plt.hist(img.ravel(),256,[0,256]); plt.show()
```

Train test has 35126 marked images

```python
# Example trainLabels
trainLabels = pd.read_csv('trainLabels.csv')
trainLabels.head()
```

```python
# Number of Images
print("Train data with levels size:",len(trainLabels))
```

```python
# Distribution of target feature
trainLabels.level.value_counts()
```

#### The dataset is highly imbalanced with maximum 0 target, i.e., no Diabetic Retinopathy

```python
# Distribution of target feature
sns.countplot("level",data= trainLabels);
```

Balancing trainset

```python
min_val = trainLabels.level.value_counts().min()
labels = trainLabels.level.unique()
new_trainLabels = pd.DataFrame()
for i in labels:
new_trainLabels = pd.concat([new_trainLabels, trainLabels[trainLabels.level==i][:min_val]], axis=0)

# New distribution of target feature
new_trainLabels.level.value_counts()
```

Ok, looks great, we reduce dataset. And now dataset weighted 3.5 GB, but not 35 GB!!!

```python
# Replace all marked set on our balanced dataset
trainLabels = new_trainLabels
```

## 4. Insights and found dependencies (4 points)<a id='4'></a>
## 5. Metrics selection (3 points)<a id='5'></a>
## 6. Model selection (3 points))<a id='6'></a>

* (4) The assumptions about various correlations/omissions/regularities from the previous paragraphs are found and put forward. There is an explanation why they are important for the task being solved;
* (5) There is a reasonable justification for the selection of the model quality metrics. The issues that affect the choice of quality metrics (solving problem, decision goal, number of classes, class
* (6) A model selection is made. The process of selection and connection with the task being solved is described;

## Insights and found dependencies
Finding ideas and dependencies is very difficult. Retenopathy appears due to blockage of the capillaries by the blood supply to the retina. Over time, the lack of oxygen develops. Does not receive nutrients. In this regard, the tissue creates new vessels, which further burst (hemorrhages). The presence of such vessels will be detected by the algorithm.

## Metric Selection
The dataset is highly imbalanced with no Diabetic Retinopathy images. Usually used Confusion Matrix, Roc AUC, F1 score for imbalances classes. If classes can be balanced we can use accuracy. The __quadratic weighted kappa__ should be best score for that task. But i don't know that metric so good and I will be using Confusion Matrix, AUC, F1 score.

## Model selection
I will be using 2 pre-trained models __VGG-16__ and __Inception__ and __just keras__ from scratch. __VGG-16__ model pretrained on imagenet weights. __Inception/Attention Model__ The basic idea is that a Global Average Pooling is too simplistic since some of the regions are more relevant than others. So we build an attention mechanism to turn pixels in the GAP on an off before the pooling and then rescale (Lambda layer) the results based on the number of pixels. The model could be seen as a sort of 'global weighted average' pooling.

## 7. Data preprocessing (4 points)<a id='7'></a>

* (7) Data for a particular model is preprocessed. If necessary, there is a description of scaling characteristics, filling in blanks, replacing strings with numbers, One-Hot Encoding, handling of outliers, selection of features with an explanation of the methods used for this. In general, the data is divided into training and hold-out sets;

## 8. Cross-validation and adjustment of model hyperparameters (4 points)<a id='8'></a>

## 9. Creation of new features and description of this process (4 points)<a id='9'></a>

* (7) Data for a particular model is preprocessed. If necessary, there is a description of scaling characteristics, filling in blanks, replacing strings with numbers, One-Hot Encoding, handling of outliers, selection of features with an explanation of the methods used for this. In general, the data is divided into training and hold-out sets;

* (8+) Cross-validation is performed technically correct, without data leaks. The number of folds is reasonably selected and the split (Random/Stratified or otherwise) is fixed by a seed. An explanation is given. Hyperparameters of the model and the method of their selection are explained. The choice is based on some study of the model’s hyperparameters for the task being solved;
* (8+/-) There are small errors (for example, there is no fixed seed) or there is no explanation for cross-validation. But the hyperparameters of the model and the way they are selected are explained;

* (9) New features are created. Justification is given: logical (for example, birds have body temperature a few degrees higher than human, which means that virus XXX will not survive in environment like this), physical (for example, a rainbow means that the light source is located behind; calculation of the value according to physical law using these features) or another one (for example a feature is built after data visualization). Justification is reasonably described. The usefulness of new features is confirmed statistically or with the help of the corresponding model;

## 10. Plotting training and validation curves (4 points)<a id='10'></a>

* (+) Training and validation curves are built. The correct interpretation is provided;
* (+/-) Noticeable mistakes were made while building curves or the curves are not informative;
* (-/+) An incorrect interpretation is given or another serious mistakes can be found;
* (-) Training and validation curves are omitted.

## 11. Prediction for test or hold-out samples (2 points)<a id='11'></a>

* (+) The results on the test sample or LB score are provided. The results on the test sample are comparable to the results on cross-validation. If the test sample was created by the author of the project, the creation mechanism should be unbiased and explained (a reasonable sampling mechanism was applied, in the simplest case - randomization);
* (+/-) The values of the metrics on the test sample do not differ enough from the values of the metrics on cross-validation and/or the test sample is biased, but there is a reasonable justification for this (example: the customer took a test sample from another distribution);
* (-/+) The values of the metrics on the test sample differ a lot from the values of the metrics on cross-validation and/or the test sample was biased;
* (-) No prediction for test or hold-out samples is provided.

### AUGMENATION <a id='aug'></a>
In CV for increasing and transformation dataset used some techniques are called Augmentation techniques:
* Scaling
* Rotation
* Translation
* Flipping
* Lighting condition
* Adding Salt and Pepper noise
* Perspective transform
* GANs
* Constant
* Edge
* Reflect and etc..

I've been using: rgb to greyscale, edge.
Gaussian blur, mask The Canny Edge Detector, Masks

```python
base_image_dir = os.path.join('train/')
base_image_dir
```

```python
base_image_dir = os.path.join('train/')
retina_df = pd.read_csv('trainLabels.csv')
retina_df['PatientId'] = retina_df['image'].map(lambda x: x.split('_')[0])
retina_df['path'] = retina_df['image'].map(lambda x: os.path.join(base_image_dir,
'{}.jpeg'.format(x)))
retina_df['exists'] = retina_df['path'].map(os.path.exists)
print(retina_df['exists'].sum(), 'images found of', retina_df.shape[0], 'total')
retina_df['eye'] = retina_df['image'].map(lambda x: 1 if x.split('_')[-1]=='left' else 0)
from keras.utils.np_utils import to_categorical
retina_df['level_cat'] = retina_df['level'].map(lambda x: to_categorical(x, 1+retina_df['level'].max()))

retina_df.dropna(inplace = True)
retina_df = retina_df[retina_df['exists']]
retina_df.sample(3)
```

```python
retina_df = retina_df[retina_df.level.isin([0,4])]
```

```python
retina_df = pd.concat([retina_df[retina_df.level==0].sample(1000),retina_df[retina_df.level==4]],axis=0)
```

```python
from sklearn.model_selection import train_test_split
rr_df = retina_df[['PatientId', 'level']].drop_duplicates()
train_ids, valid_ids = train_test_split(rr_df['PatientId'],
test_size = 0.2,
random_state = 2018,
stratify = rr_df['level'])
raw_train_df = retina_df[retina_df['PatientId'].isin(train_ids)]
valid_df = retina_df[retina_df['PatientId'].isin(valid_ids)]
print('train', raw_train_df.shape[0], 'validation', valid_df.shape[0])
```

```python
#balance the train set:
train_df = raw_train_df.groupby(['level', 'eye']).apply(lambda x: x.sample(75, replace = True)
).reset_index(drop = True)
print('New Data Size:', train_df.shape[0], 'Old Size:', raw_train_df.shape[0])
train_df[['level', 'eye']].hist(figsize = (10, 5))
```

```python
import tensorflow as tf
from keras import backend as K
from keras.applications.inception_v3 import preprocess_input
import numpy as np
IMG_SIZE = (512, 512) # slightly smaller than vgg16 normally expects
def tf_image_loader(out_size,
horizontal_flip = True,
vertical_flip = False,
random_brightness = True,
random_contrast = True,
random_saturation = True,
random_hue = True,
color_mode = 'rgb',
preproc_func = preprocess_input,
on_batch = False):
def _func(X):
with tf.name_scope('image_augmentation'):
with tf.name_scope('input'):
X = tf.image.decode_png(tf.read_file(X), channels = 3 if color_mode == 'rgb' else 0)
X = tf.image.resize_images(X, out_size)
with tf.name_scope('augmentation'):
if horizontal_flip:
X = tf.image.random_flip_left_right(X)
if vertical_flip:
X = tf.image.random_flip_up_down(X)
if random_brightness:
X = tf.image.random_brightness(X, max_delta = 0.1)
if random_saturation:
X = tf.image.random_saturation(X, lower = 0.75, upper = 1.5)
if random_hue:
X = tf.image.random_hue(X, max_delta = 0.15)
if random_contrast:
X = tf.image.random_contrast(X, lower = 0.75, upper = 1.5)
return preproc_func(X)
if on_batch:
# we are meant to use it on a batch
def _batch_func(X, y):
return tf.map_fn(_func, X), y
return _batch_func
else:
# we apply it to everything
def _all_func(X, y):
return _func(X), y
return _all_func

def tf_augmentor(out_size,
intermediate_size = (640, 640),
intermediate_trans = 'crop',
batch_size = 16,
horizontal_flip = True,
vertical_flip = False,
random_brightness = True,
random_contrast = True,
random_saturation = True,
random_hue = True,
color_mode = 'rgb',
preproc_func = preprocess_input,
min_crop_percent = 0.001,
max_crop_percent = 0.005,
crop_probability = 0.5,
rotation_range = 10):

load_ops = tf_image_loader(out_size = intermediate_size,
horizontal_flip=horizontal_flip,
vertical_flip=vertical_flip,
random_brightness = random_brightness,
random_contrast = random_contrast,
random_saturation = random_saturation,
random_hue = random_hue,
color_mode = color_mode,
preproc_func = preproc_func,
on_batch=False)
def batch_ops(X, y):
batch_size = tf.shape(X)[0]
with tf.name_scope('transformation'):
# code borrowed from https://becominghuman.ai/data-augmentation-on-gpu-in-tensorflow-13d14ecf2b19
# The list of affine transformations that our image will go under.
# Every element is Nx8 tensor, where N is a batch size.
transforms = []
identity = tf.constant([1, 0, 0, 0, 1, 0, 0, 0], dtype=tf.float32)
if rotation_range > 0:
angle_rad = rotation_range / 180 * np.pi
angles = tf.random_uniform([batch_size], -angle_rad, angle_rad)
transforms += [tf.contrib.image.angles_to_projective_transforms(angles, intermediate_size[0], intermediate_size[1])]

if crop_probability > 0:
crop_pct = tf.random_uniform([batch_size], min_crop_percent, max_crop_percent)
left = tf.random_uniform([batch_size], 0, intermediate_size[0] * (1.0 - crop_pct))
top = tf.random_uniform([batch_size], 0, intermediate_size[1] * (1.0 - crop_pct))
crop_transform = tf.stack([
crop_pct,
tf.zeros([batch_size]), top,
tf.zeros([batch_size]), crop_pct, left,
tf.zeros([batch_size]),
tf.zeros([batch_size])
], 1)
coin = tf.less(tf.random_uniform([batch_size], 0, 1.0), crop_probability)
transforms += [tf.where(coin, crop_transform, tf.tile(tf.expand_dims(identity, 0), [batch_size, 1]))]
if len(transforms)>0:
X = tf.contrib.image.transform(X,
tf.contrib.image.compose_transforms(*transforms),
interpolation='BILINEAR') # or 'NEAREST'
if intermediate_trans=='scale':
X = tf.image.resize_images(X, out_size)
elif intermediate_trans=='crop':
X = tf.image.resize_image_with_crop_or_pad(X, out_size[0], out_size[1])
else:
raise ValueError('Invalid Operation {}'.format(intermediate_trans))
return X, y
def _create_pipeline(in_ds):
batch_ds = in_ds.map(load_ops, num_parallel_calls=4).batch(batch_size)
return batch_ds.map(batch_ops)
return _create_pipeline

def flow_from_dataframe(idg,
in_df,
path_col,
y_col,
shuffle = True,
color_mode = 'rgb'):
files_ds = tf.data.Dataset.from_tensor_slices((in_df[path_col].values,
np.stack(in_df[y_col].values,0)))
in_len = in_df[path_col].values.shape[0]
while True:
if shuffle:
files_ds = files_ds.shuffle(in_len) # shuffle the whole dataset

next_batch = idg(files_ds).repeat().make_one_shot_iterator().get_next()
for i in range(max(in_len//32,1)):
# NOTE: if we loop here it is 'thread-safe-ish' if we loop on the outside it is completely unsafe
yield K.get_session().run(next_batch)
```

```python
batch_size = 48
core_idg = tf_augmentor(out_size = IMG_SIZE,
color_mode = 'rgb',
vertical_flip = True,
crop_probability=0.0, # crop doesn't work yet
batch_size = batch_size)
valid_idg = tf_augmentor(out_size = IMG_SIZE, color_mode = 'rgb',
crop_probability=0.0,
horizontal_flip = False,
vertical_flip = False,
random_brightness = False,
random_contrast = False,
random_saturation = False,
random_hue = False,
rotation_range = 0,
batch_size = batch_size)

train_gen = flow_from_dataframe(core_idg, train_df,
path_col = 'path',
y_col = 'level_cat')

valid_gen = flow_from_dataframe(valid_idg, valid_df,
path_col = 'path',
y_col = 'level_cat') # we can use much larger batches for evaluation
```

```python
#display images from validation set
t_x, t_y = next(valid_gen)
fig, m_axs = plt.subplots(2, 4, figsize = (16, 8))
for (c_x, c_y, c_ax) in zip(t_x, t_y, m_axs.flatten()):
c_ax.imshow(np.clip(c_x*127+127, 0, 255).astype(np.uint8))
c_ax.set_title('Severity {}'.format(np.argmax(c_y, -1)))
c_ax.axis('off')
```

```python
#we focus on a healthy eye and display it alone
print('t_x shape: ', t_x.shape)
fig, m_axs = plt.subplots(2, 1, figsize = (16, 8))
for (c_x, c_y, c_ax) in zip(t_x, t_y, m_axs.flatten()):
c_ax.imshow(np.clip(c_x*127+127, 0, 255).astype(np.uint8))
c_ax.set_title('Severity {}'.format(np.argmax(c_y, -1)))
c_ax.axis('off')
```

```python
edges = cv2.Canny(np.clip(c_x*127+127, 0, 255).astype(np.uint8),70,130)
plt.subplot(121),plt.imshow(np.clip(c_x*127+127, 0, 255).astype(np.uint8),cmap = 'gray')
plt.title('Original Image'), plt.xticks([]), plt.yticks([])
plt.subplot(122),plt.imshow(edges,cmap = 'gray')
plt.title('Edge Image'), plt.xticks([]), plt.yticks([])
plt.show()
```

```python
#https://www.pyimagesearch.com/2015/04/06/zero-parameter-automatic-canny-edge-detection-with-python-and-opencv/
img = cv2.imread(os.path.join(base_image_dir, '15_right.jpeg'), cv2.IMREAD_COLOR)
print('img type ', type(img), img.shape)
print('img min max ', img.min(), img.max())
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (3, 3), 0)
v = np.median(img)
sigma = 0.33 #0.93
# apply automatic Canny edge detection using the computed median
lower = int(max(0, (1.0 - sigma) * v))
upper = int(min(255, (1.0 + sigma) * v))
#imgProd = img*127+127
imgProd = gray*127 #+127
imgClip = np.clip(imgProd, 0, 255).astype(np.uint8)
print('imgProd min max ', imgProd.min(), imgProd.max())

# apply Canny edge detection using a wide threshold, tight
# threshold, and automatically determined threshold

wide = cv2.Canny(blurred, 10, 200)
tight = cv2.Canny(imgProd, 200, 250)
auto = cv2.Canny(imgProd, lower, upper)

#edges = cv2.Canny(np.clip(imgClip, 0, 255).astype(np.uint8), lower, upper)
#edges = cv.Canny(img,lower,upper)
fig, m_axs = plt.subplots(1, 1, figsize = (16, 8))
#plt.imshow(img) #,cmap = 'gray')
#plt.title('Original Image'), plt.xticks([]), plt.yticks([])

plt.imshow(tight,cmap = 'gray')
#plt.title('Edge Image'), plt.xticks([]), plt.yticks([])
plt.show()
```

```python
#another path to segmentation
def stretch_8bit(bands, lower_percent=2, higher_percent=98):
out = np.zeros_like(bands)
for i in range(3):
a = 0 #np.min(band)
b = 255 #np.max(band)
c = np.percentile(bands[:,:,i], lower_percent)
d = np.percentile(bands[:,:,i], higher_percent)
t = a + (bands[:,:,i] - c) * (b - a) / (d - c)
t[t<a] = a
t[t>b] = b
out[:,:,i] =t
return out.astype(np.uint8)

def RGB(image_id):
filename = os.path.join(base_image_dir, '{}.jpeg'.format(image_id))
#img = tiff.imread(filename)
img = cv2.imread(filename, cv2.IMREAD_COLOR)
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#img = np.rollaxis(img, 0, 3)
return img

def GRAY(image_id):
filename = os.path.join(base_image_dir, '{}.jpeg'.format(image_id))
img = cv2.imread(filename, cv2.IMREAD_COLOR)
img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(img, (3, 3), 0)
# invert the image
img = cv2.bitwise_not(blurred)
return img

def M(image_id):
filename = os.path.join('..', 'input', 'sixteen_band', '{}_M.tif'.format(image_id))
img = tiff.imread(filename)
img = np.rollaxis(img, 0, 3)
return img
```

```python
image_id = '15_right'
rgb = GRAY(image_id)
print('shape rgb: ', rgb.shape, rgb.min(), rgb.max())
#rgb1 = stretch_8bit(rgb)
```

```python
y1,y2,x1,x2 = 1900, 2364, 3000, 4000
region = rgb[y1:y2, x1:x2]
plt.figure()
plt.imshow(region)
```

```python
#blue_mask = cv2.inRange(region, np.array([175,70,20]), np.array([189,140,150])) #img minthresh maxthre (BGR)
blue_mask = cv2.inRange(region, 19, 113) #img minthresh maxthre (BGR)
print('blue_mask shape: ', blue_mask.shape, ' region shape: ', region.shape, 'min max bmask', blue_mask.min(), blue_mask.max())
mask = cv2.bitwise_and(region, region, mask=blue_mask)
#mask = cv2.cvtColor(mask, cv2.COLOR_RGB2GRAY)
#print('mask shape ', mask.shape, mask.max(), region[:,:,2].max())
plt.figure()
plt.imshow(blue_mask, cmap='gray');
```

```python
y1,y2,x1,x2 = 100, 3364, 500, 4000
region = rgb[y1:y2, x1:x2]
plt.figure()
plt.imshow(region);
```

```python
#https://docs.opencv.org/3.4/d3/db4/tutorial_py_watershed.html
ret, thresh = cv2.threshold(region,125, 255,cv2.THRESH_TOZERO_INV) #_INV+cv2.THRESH_OTSU)
'''
ret,thresh1 = cv.threshold(img,127,255,cv.THRESH_BINARY)
ret,thresh2 = cv.threshold(img,127,255,cv.THRESH_BINARY_INV)
ret,thresh3 = cv.threshold(img,127,255,cv.THRESH_TRUNC)
ret,thresh4 = cv.threshold(img,127,255,cv.THRESH_TOZERO)
ret,thresh5 = cv.threshold(img,127,255,cv.THRESH_TOZERO_INV)
'''
print('threshold ret shapes ', thresh.min(), thresh.max())
plt.figure()
plt.imshow(thresh);
```

```python
th = cv2.adaptiveThreshold(region, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 115, 1)
plt.figure()
plt.imshow(th);
```

## VGG-16<a id='vgg'></a>

```python
import numpy as np
import os
import time
from keras.applications.vgg16 import VGG16
from keras.preprocessing import image
from keras.applications.vgg16 import preprocess_input
from keras.layers import Dense, Activation, Flatten
from keras.layers import merge, Input
from keras.models import Model
from keras.utils import np_utils
from sklearn.utils import shuffle
from sklearn.model_selection import train_test_split
```

Load the base model, which is a VGG-16 model pretrained on imagenet weights. We then move on to freeze all the layers except the last three.

```python
#loading base model
base_model = VGG16(weights='imagenet', include_top=True, input_shape=(224, 224, 3))
#freeze_layers(base_model)
base_model.summary()
#model = Model(input=base_model.input, output=base_model.get_layer('fc1').output)
```

```python
# Freeze the layers except the last 4 layers
for layer in base_model.layers[:-3]:
layer.trainable = False
# Check the trainable status of the individual layers
for layer in base_model.layers:
print(layer, layer.trainable)
base_model.summary()
```

```python
from keras.utils.vis_utils import plot_model
from IPython.display import SVG
from keras.utils.vis_utils import model_to_dot
```

Before we go about pre processing data and training our loaded model, we fix the following:

* __Batch Size__ of the data required for training
* __nb_classes__ -> indicates the number of output classes
* __nb_epoch__ -> induicates the number of iterations during training

```python
#batch_size to train
batch_size = 32
# number of output classes
nb_classes = 5
# number of epochs to train
nb_epoch = 10
```

Fine Tune : VGG-16

We move on to add customised layers on top of our pre-loaded model for purpose of fine-tuning. The following layers were added :

Dense Relu
Dropout
Dense Softmax

```python
from keras import models
from keras import layers
from keras import optimizers

# Create the model
model = models.Sequential()

# Add the vgg convolutional base model
model.add(base_model)

# Add new layers
model.add(layers.Dense(1024, activation='relu'))
model.add(layers.Dropout(0.5))
model.add(layers.Dense(nb_classes, activation='softmax', name ='output'))

# Show a summary of the model. Check the number of trainable parameters
model.summary()
```

### Preparing Data

Trying to predict 0 and 4 label

```python
new_trainL = trainLabels[trainLabels.level.isin([0,4])]
listing = os.listdir("train/")
print("Number of images in train:",np.size(listing))
listing = [i for i in listing if os.path.splitext(i)[0] in new_trainL.image.values]
print("len new listing with our data should be 1416;answer or 3540:",len(listing))
```

```python
# Image to Numpy Array
from PIL import Image
from sklearn.utils import shuffle

# input image dimensions
img_rows, img_cols = 224, 224

immatrix = []
imlabel = []

for file in listing:
base = os.path.basename("train/" + file)
fileName = os.path.splitext(base)[0]
imlabel.append(trainLabels.loc[trainLabels.image==fileName, 'level'].values[0])
im = Image.open("train/" + file)
img = im.resize((img_rows,img_cols))
rgb = img.convert('RGB')
immatrix.append(np.array(rgb).flatten())
```

```python
#converting images & labels to numpy arrays
immatrix = np.asarray(immatrix)
imlabel = np.asarray(imlabel)

data,Label = shuffle(immatrix,imlabel, random_state=2)
train_data = [data,Label]
```

### Splitting Dataset to training and test samples

```python
from sklearn.cross_validation import train_test_split
(X, y) = (train_data[0],train_data[1])
# STEP 1: split X and y into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=4)

X_train = X_train.reshape(X_train.shape[0], img_cols, img_rows, 3)
X_test = X_test.reshape(X_test.shape[0], img_cols, img_rows, 3)
print(X_train.shape),print(y_train.shape),print(X_test.shape),print(y_test.shape)

# Test set target variable distribution
unique, counts = np.unique(y_test, return_counts=True)
dict(zip(unique, counts))
```

```python
X_train = X_train.astype('float32')
X_test = X_test.astype('float32')

# Scaling
X_train /= 255
X_test /= 255

print('X_train shape:', X_train.shape)
print(X_train.shape[0], 'train samples')
print(X_test.shape[0], 'test samples')
```

```python
from keras.utils import np_utils

# convert class vectors to binary class matrices
Y_train = np_utils.to_categorical(y_train, nb_classes)
Y_test = np_utils.to_categorical(y_test, nb_classes)
```

### Performing Image augmentation

```python
from keras.preprocessing.image import ImageDataGenerator
# create generators - training data will be augmented imagees
validationdatagenerator = ImageDataGenerator()
traindatagenerator = ImageDataGenerator(width_shift_range=0.1,height_shift_range=0.1,rotation_range=15,zoom_range=0.1 )
batchsize=8
train_generator=traindatagenerator.flow(X_train, Y_train, batch_size=batchsize)
validation_generator=validationdatagenerator.flow(X_test, Y_test,batch_size=batchsize)
```

```python
model.compile(loss='categorical_crossentropy',
optimizer='adam',
metrics=['acc'])
```

```python
# summarize history for accuracy
plt.plot(history.history['acc'])
plt.plot(history.history['val_acc'])
plt.title('model accuracy')
plt.ylabel('accuracy')
plt.xlabel('epoch')
plt.legend(['train', 'test'], loc='upper left')
plt.show()
#plt.savefig('model_accuracy.png')
# summarize history for loss
plt.plot(history.history['loss'])
plt.plot(history.history['val_loss'])
plt.title('model loss')
plt.ylabel('loss')
plt.xlabel('epoch')
plt.legend(['train', 'test'], loc='upper left')
plt.show()
#plt.savefig('model_loss.png')
```

```python
score = model.evaluate(X_test, Y_test, verbose=0)
print(score)
```

Get a bad model

## INCEPTION <a id='inception'></a>

```python
from sklearn.model_selection import train_test_split
rr_df = retina_df[['PatientId', 'level']].drop_duplicates()
train_ids, valid_ids = train_test_split(rr_df['PatientId'],
test_size = 0.25,
random_state = 2018,
stratify = rr_df['level'])
raw_train_df = retina_df[retina_df['PatientId'].isin(train_ids)]
valid_df = retina_df[retina_df['PatientId'].isin(valid_ids)]
print('train', raw_train_df.shape[0], 'validation', valid_df.shape[0])
```

```python
retina_df[['level', 'eye']].hist(figsize = (10, 5))
```

```python
import tensorflow as tf
from keras import backend as K
from keras.applications.inception_v3 import preprocess_input
import numpy as np
IMG_SIZE = (512, 512) # slightly smaller than vgg16 normally expects
def tf_image_loader(out_size,
horizontal_flip = True,
vertical_flip = False,
random_brightness = True,
random_contrast = True,
random_saturation = True,
random_hue = True,
color_mode = 'rgb',
preproc_func = preprocess_input,
on_batch = False):
def _func(X):
with tf.name_scope('image_augmentation'):
with tf.name_scope('input'):
X = tf.image.decode_png(tf.read_file(X), channels = 3 if color_mode == 'rgb' else 0)
X = tf.image.resize_images(X, out_size)
with tf.name_scope('augmentation'):
if horizontal_flip:
X = tf.image.random_flip_left_right(X)
if vertical_flip:
X = tf.image.random_flip_up_down(X)
if random_brightness:
X = tf.image.random_brightness(X, max_delta = 0.1)
if random_saturation:
X = tf.image.random_saturation(X, lower = 0.75, upper = 1.5)
if random_hue:
X = tf.image.random_hue(X, max_delta = 0.15)
if random_contrast:
X = tf.image.random_contrast(X, lower = 0.75, upper = 1.5)
return preproc_func(X)
if on_batch:
# we are meant to use it on a batch
def _batch_func(X, y):
return tf.map_fn(_func, X), y
return _batch_func
else:
# we apply it to everything
def _all_func(X, y):
return _func(X), y
return _all_func

def tf_augmentor(out_size,
intermediate_size = (640, 640),
intermediate_trans = 'crop',
batch_size = 16,
horizontal_flip = True,
vertical_flip = False,
random_brightness = True,
random_contrast = True,
random_saturation = True,
random_hue = True,
color_mode = 'rgb',
preproc_func = preprocess_input,
min_crop_percent = 0.001,
max_crop_percent = 0.005,
crop_probability = 0.5,
rotation_range = 10):

load_ops = tf_image_loader(out_size = intermediate_size,
horizontal_flip=horizontal_flip,
vertical_flip=vertical_flip,
random_brightness = random_brightness,
random_contrast = random_contrast,
random_saturation = random_saturation,
random_hue = random_hue,
color_mode = color_mode,
preproc_func = preproc_func,
on_batch=False)
def batch_ops(X, y):
batch_size = tf.shape(X)[0]
with tf.name_scope('transformation'):
# code borrowed from https://becominghuman.ai/data-augmentation-on-gpu-in-tensorflow-13d14ecf2b19
# The list of affine transformations that our image will go under.
# Every element is Nx8 tensor, where N is a batch size.
transforms = []
identity = tf.constant([1, 0, 0, 0, 1, 0, 0, 0], dtype=tf.float32)
if rotation_range > 0:
angle_rad = rotation_range / 180 * np.pi
angles = tf.random_uniform([batch_size], -angle_rad, angle_rad)
transforms += [tf.contrib.image.angles_to_projective_transforms(angles, intermediate_size[0], intermediate_size[1])]

if crop_probability > 0:
crop_pct = tf.random_uniform([batch_size], min_crop_percent, max_crop_percent)
left = tf.random_uniform([batch_size], 0, intermediate_size[0] * (1.0 - crop_pct))
top = tf.random_uniform([batch_size], 0, intermediate_size[1] * (1.0 - crop_pct))
crop_transform = tf.stack([
crop_pct,
tf.zeros([batch_size]), top,
tf.zeros([batch_size]), crop_pct, left,
tf.zeros([batch_size]),
tf.zeros([batch_size])
], 1)
coin = tf.less(tf.random_uniform([batch_size], 0, 1.0), crop_probability)
transforms += [tf.where(coin, crop_transform, tf.tile(tf.expand_dims(identity, 0), [batch_size, 1]))]
if len(transforms)>0:
X = tf.contrib.image.transform(X,
tf.contrib.image.compose_transforms(*transforms),
interpolation='BILINEAR') # or 'NEAREST'
if intermediate_trans=='scale':
X = tf.image.resize_images(X, out_size)
elif intermediate_trans=='crop':
X = tf.image.resize_image_with_crop_or_pad(X, out_size[0], out_size[1])
else:
raise ValueError('Invalid Operation {}'.format(intermediate_trans))
return X, y
def _create_pipeline(in_ds):
batch_ds = in_ds.map(load_ops, num_parallel_calls=4).batch(batch_size)
return batch_ds.map(batch_ops)
return _create_pipeline
```

```python
def flow_from_dataframe(idg,
in_df,
path_col,
y_col,
shuffle = True,
color_mode = 'rgb'):
files_ds = tf.data.Dataset.from_tensor_slices((in_df[path_col].values,
np.stack(in_df[y_col].values,0)))
in_len = in_df[path_col].values.shape[0]
while True:
if shuffle:
files_ds = files_ds.shuffle(in_len) # shuffle the whole dataset

next_batch = idg(files_ds).repeat().make_one_shot_iterator().get_next()
for i in range(max(in_len//32,1)):
# NOTE: if we loop here it is 'thread-safe-ish' if we loop on the outside it is completely unsafe
yield K.get_session().run(next_batch)
```

```python
batch_size = 48
core_idg = tf_augmentor(out_size = IMG_SIZE,
color_mode = 'rgb',
vertical_flip = True,
crop_probability=0.0, # crop doesn't work yet
batch_size = batch_size)
valid_idg = tf_augmentor(out_size = IMG_SIZE, color_mode = 'rgb',
crop_probability=0.0,
horizontal_flip = False,
vertical_flip = False,
random_brightness = False,
random_contrast = False,
random_saturation = False,
random_hue = False,
rotation_range = 0,
batch_size = batch_size)

train_gen = flow_from_dataframe(core_idg, train_df,
path_col = 'path',
y_col = 'level_cat')

valid_gen = flow_from_dataframe(valid_idg, valid_df,
path_col = 'path',
y_col = 'level_cat') # we can use much larger batches for evaluation
```

## Validation Set
We do not perform augmentation at all on these images

```python
t_x, t_y = next(valid_gen)
fig, m_axs = plt.subplots(2, 4, figsize = (16, 8))
for (c_x, c_y, c_ax) in zip(t_x, t_y, m_axs.flatten()):
c_ax.imshow(np.clip(c_x*127+127, 0, 255).astype(np.uint8))
c_ax.set_title('Severity {}'.format(np.argmax(c_y, -1)))
c_ax.axis('off')
```

## Training Set
These are augmented and a real mess

```python
t_x, t_y = next(train_gen)
fig, m_axs = plt.subplots(2, 4, figsize = (16, 8))
for (c_x, c_y, c_ax) in zip(t_x, t_y, m_axs.flatten()):
c_ax.imshow(np.clip(c_x*127+127, 0, 255).astype(np.uint8))
c_ax.set_title('Severity {}'.format(np.argmax(c_y, -1)))
c_ax.axis('off')
```

## Attention Model
The basic idea is that a Global Average Pooling is too simplistic since some of the regions are more relevant than others. So we build an attention mechanism to turn pixels in the GAP on an off before the pooling and then rescale (Lambda layer) the results based on the number of pixels. The model could be seen as a sort of 'global weighted average' pooling. There is probably something published about it and it is very similar to the kind of attention models used in NLP.

```python
from keras.applications.vgg16 import VGG16 as PTModel
from keras.applications.inception_resnet_v2 import InceptionResNetV2 as PTModel
from keras.applications.inception_v3 import InceptionV3 as PTModel
from keras.layers import GlobalAveragePooling2D, Dense, Dropout, Flatten, Input, Conv2D, multiply, LocallyConnected2D, Lambda
from keras.models import Model
in_lay = Input(t_x.shape[1:])
base_pretrained_model = PTModel(input_shape = t_x.shape[1:], include_top = False, weights = 'imagenet')
base_pretrained_model.trainable = False
pt_depth = base_pretrained_model.get_output_shape_at(0)[-1]
pt_features = base_pretrained_model(in_lay)
from keras.layers import BatchNormalization
bn_features = BatchNormalization()(pt_features)

# here we do an attention mechanism to turn pixels in the GAP on an off

attn_layer = Conv2D(64, kernel_size = (1,1), padding = 'same', activation = 'relu')(Dropout(0.5)(bn_features))
attn_layer = Conv2D(16, kernel_size = (1,1), padding = 'same', activation = 'relu')(attn_layer)
attn_layer = Conv2D(8, kernel_size = (1,1), padding = 'same', activation = 'relu')(attn_layer)
attn_layer = Conv2D(1,
kernel_size = (1,1),
padding = 'valid',
activation = 'sigmoid')(attn_layer)
# fan it out to all of the channels
up_c2_w = np.ones((1, 1, 1, pt_depth))
up_c2 = Conv2D(pt_depth, kernel_size = (1,1), padding = 'same',
activation = 'linear', use_bias = False, weights = [up_c2_w])
up_c2.trainable = False
attn_layer = up_c2(attn_layer)

mask_features = multiply([attn_layer, bn_features])
gap_features = GlobalAveragePooling2D()(mask_features)
gap_mask = GlobalAveragePooling2D()(attn_layer)
# to account for missing values from the attention model
gap = Lambda(lambda x: x[0]/x[1], name = 'RescaleGAP')([gap_features, gap_mask])
gap_dr = Dropout(0.25)(gap)
dr_steps = Dropout(0.25)(Dense(128, activation = 'relu')(gap_dr))
out_layer = Dense(t_y.shape[-1], activation = 'softmax')(dr_steps)
retina_model = Model(inputs = [in_lay], outputs = [out_layer])
from keras.metrics import top_k_categorical_accuracy
def top_2_accuracy(in_gt, in_pred):
return top_k_categorical_accuracy(in_gt, in_pred, k=2)

retina_model.compile(optimizer = 'adam', loss = 'categorical_crossentropy',
metrics = ['categorical_accuracy', top_2_accuracy])
retina_model.summary()
```

```python
from keras.callbacks import ModelCheckpoint, LearningRateScheduler, EarlyStopping, ReduceLROnPlateau
weight_path="{}_weights.best.hdf5".format('retina')

checkpoint = ModelCheckpoint(weight_path, monitor='val_loss', verbose=1,
save_best_only=True, mode='min', save_weights_only = True)

reduceLROnPlat = ReduceLROnPlateau(monitor='val_loss', factor=0.8, patience=3, verbose=1, mode='auto', epsilon=0.0001, cooldown=5, min_lr=0.0001)
early = EarlyStopping(monitor="val_loss",
mode="min",
patience=6) # probably needs to be more patient, but kaggle time is limited
callbacks_list = [checkpoint, early, reduceLROnPlat]
```

```python
#!rm -rf ~/.keras # clean up before starting training
```

```python
##### create one fixed dataset for evaluating
from tqdm import tqdm_notebook
# fresh valid gen
valid_gen = flow_from_dataframe(valid_idg, valid_df,
path_col = 'path',
y_col = 'level_cat')
vbatch_count = (valid_df.shape[0]//batch_size-1)
out_size = vbatch_count*batch_size
test_X = np.zeros((out_size,)+t_x.shape[1:], dtype = np.float32)
test_Y = np.zeros((out_size,)+t_y.shape[1:], dtype = np.float32)
for i, (c_x, c_y) in zip(tqdm_notebook(range(vbatch_count)),
valid_gen):
j = i*batch_size
test_X[j:(j+c_x.shape[0])] = c_x
test_Y[j:(j+c_x.shape[0])] = c_y
```

## Show Attention
Did our attention model learn anything useful?

```python
# get the attention layer since it is the only one with a single output dim
for attn_layer in retina_model.layers:
c_shape = attn_layer.get_output_shape_at(0)
if len(c_shape)==4:
if c_shape[-1]==1:
print(attn_layer)
break
```

```python
import keras.backend as K
rand_idx = np.random.choice(range(len(test_X)), size = 6)
attn_func = K.function(inputs = [retina_model.get_input_at(0), K.learning_phase()],
outputs = [attn_layer.get_output_at(0)]
)
fig, m_axs = plt.subplots(len(rand_idx), 2, figsize = (8, 4*len(rand_idx)))
[c_ax.axis('off') for c_ax in m_axs.flatten()]
for c_idx, (img_ax, attn_ax) in zip(rand_idx, m_axs):
cur_img = test_X[c_idx:(c_idx+1)]
attn_img = attn_func([cur_img, 0])[0]
img_ax.imshow(np.clip(cur_img[0,:,:,:]*127+127, 0, 255).astype(np.uint8))
attn_ax.imshow(attn_img[0, :, :, 0]/attn_img[0, :, :, 0].max(), cmap = 'viridis',
vmin = 0, vmax = 1,
interpolation = 'lanczos')
real_cat = np.argmax(test_Y[c_idx, :])
img_ax.set_title('Eye Image\nCat:%2d' % (real_cat))
pred_cat = retina_model.predict(cur_img)
attn_ax.set_title('Attention Map\nPred:%2.2f%%' % (100*pred_cat[0,real_cat]))
#fig.savefig('attention_map.png', dpi = 300)
```

## Evaluate the results
Here we evaluate the results the best version of the model and seeing how the predictions look on the results. We then visualize spec

```python
from sklearn.metrics import accuracy_score, classification_report
pred_Y = retina_model.predict(test_X, batch_size = 32, verbose = True)
pred_Y_cat = np.argmax(pred_Y, -1)
test_Y_cat = np.argmax(test_Y, -1)
print('Accuracy on Test Data: %2.2f%%' % (accuracy_score(test_Y_cat, pred_Y_cat)))
print(classification_report(test_Y_cat, pred_Y_cat))
```

```python
import seaborn as sns
from sklearn.metrics import confusion_matrix
sns.heatmap(confusion_matrix(test_Y_cat, pred_Y_cat),
annot=True, fmt="d", cbar = False, cmap = plt.cm.Blues, vmax = test_X.shape[0]//16)
```

## ROC Curve for healthy vs sick
Here we make an ROC curve for healthy (severity = 0) and heavy sick (severity=4) to see how well the model works at just identifying the disease

```python
from sklearn.metrics import roc_curve, roc_auc_score
sick_vec = test_Y_cat>0
sick_score = np.sum(pred_Y[:,1:],1)
fpr, tpr, _ = roc_curve(sick_vec, sick_score)
fig, ax1 = plt.subplots(1,1, figsize = (6, 6), dpi = 150)
ax1.plot(fpr, tpr, 'b.-', label = 'Model Prediction (AUC: %2.2f)' % roc_auc_score(sick_vec, sick_score))
ax1.plot(fpr, fpr, 'g-', label = 'Random Guessing')
ax1.legend()
ax1.set_xlabel('False Positive Rate')
ax1.set_ylabel('True Positive Rate');
```

AUC metric say that the model works well. But it only for binary classification. Healthy or heavy sick

```python
fig, m_axs = plt.subplots(2, 4, figsize = (32, 20))
for (idx, c_ax) in enumerate(m_axs.flatten()):
c_ax.imshow(np.clip(test_X[idx]*127+127,0 , 255).astype(np.uint8), cmap = 'bone')
c_ax.set_title('Actual Severity: {}\n{}'.format(test_Y_cat[idx],
'\n'.join(['Predicted %02d (%04.1f%%): %s' % (k, 100*v, '*'*int(10*v)) for k, v in sorted(enumerate(pred_Y[idx]), key = lambda x: -1*x[1])])), loc='left')
c_ax.axis('off')
#fig.savefig('trained_img_predictions.png', dpi = 300)
```

## Keras <a id='keras'></a>

```python
# Image to Numpy Array
from PIL import Image

# input image dimensions
img_rows, img_cols = 224, 224
### TRPLACE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
#img_rows, img_cols = 200, 200

immatrix = []
imlabel = []

for file in listing:
base = os.path.basename("train/" + file)
fileName = os.path.splitext(base)[0]
imlabel.append(trainLabels.loc[trainLabels.image==fileName, 'level'].values[0])
im = Image.open("train/" + file)
img = im.resize((img_rows,img_cols))
#rgb = img.convert('RGB')
gray = img.convert('L')
immatrix.append(np.array(gray).flatten())
```

```python
immatrix = np.asarray(immatrix)
imlabel = np.asarray(imlabel)
from sklearn.utils import shuffle

data,Label = shuffle(immatrix,imlabel, random_state=2)
train_data = [data,Label]
type(train_data)
```

```python
import matplotlib.pyplot as plt
import matplotlib

img=immatrix[167].reshape(img_rows,img_cols)
plt.imshow(img)
plt.imshow(img,cmap='gray')
```

```python
#batch_size to train
batch_size = 32
# number of output classes
nb_classes = 5
# number of epochs to train
nb_epoch = 5
# number of convolutional filters to use
nb_filters = 32
# size of pooling area for max pooling
nb_pool = 2
# convolution kernel size
nb_conv = 3
```

```python
(X, y) = (train_data[0],train_data[1])
from sklearn.cross_validation import train_test_split

# STEP 1: split X and y into training and testing sets

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=4)

print(X_train.shape)
print(X_test.shape)

X_train = X_train.reshape(X_train.shape[0], img_cols, img_rows, 1)
X_test = X_test.reshape(X_test.shape[0], img_cols, img_rows, 1)

X_train = X_train.astype('float32')
X_test = X_test.astype('float32')

X_train /= 255
X_test /= 255

print('X_train shape:', X_train.shape)
print(X_train.shape[0], 'train samples')
print(X_test.shape[0], 'test samples')

from keras.utils import np_utils
# convert class vectors to binary class matrices
Y_train = np_utils.to_categorical(y_train, nb_classes)
Y_test = np_utils.to_categorical(y_test, nb_classes)
```

```python
from keras.models import Sequential
from keras.layers.core import Dense, Dropout, Activation, Flatten
from keras.layers.convolutional import Convolution2D, MaxPooling2D
from keras.optimizers import SGD,RMSprop,adam

model = Sequential()

model.add(Convolution2D(nb_filters, nb_conv, nb_conv,
border_mode='valid',
input_shape=(img_cols, img_rows, 1)))
convout1 = Activation('relu')
model.add(convout1)
model.add(Convolution2D(nb_filters, nb_conv, nb_conv))
convout2 = Activation('relu')
model.add(convout2)
model.add(MaxPooling2D(pool_size=(nb_pool, nb_pool)))
model.add(Dropout(0.5))

model.add(Flatten())
model.add(Dense(128))
model.add(Activation('relu'))
model.add(Dropout(0.5))
model.add(Dense(nb_classes))
model.add(Activation('softmax'))
model.compile(loss='categorical_crossentropy', optimizer='adadelta')
```

```python
from keras.preprocessing.image import ImageDataGenerator

# create generators - training data will be augmented images
validationdatagenerator = ImageDataGenerator()
traindatagenerator = ImageDataGenerator(width_shift_range=0.1,height_shift_range=0.1,rotation_range=15,zoom_range=0.1 )

batchsize=8
train_generator=traindatagenerator.flow(X_train, Y_train, batch_size=batchsize)
validation_generator=validationdatagenerator.flow(X_test, Y_test,batch_size=batchsize)

#hist = model.fit(X_train, Y_train, batch_size=batch_size, nb_epoch=nb_epoch, verbose=1, validation_data=(X_test, Y_test))

model.fit_generator(train_generator, steps_per_epoch=int(len(X_train)/batchsize), epochs=3, validation_data=validation_generator, validation_steps=int(len(X_test)/batchsize))

#hist = model.fit(X_train, Y_train, batch_size=batch_size, nb_epoch=nb_epoch,
# show_accuracy=True, verbose=1, validation_split=0.2)

score = model.evaluate(X_test, Y_test, verbose=0)
print(score)
```

### OTHER

```python
import numpy as np
import pandas as pd
import cv2
from matplotlib import pyplot as plt
import os
from subprocess import check_output
import cv2
from PIL import Image
import glob

img_data = []
img_label = []
img_r = 224
img_c = 224
for file in listing:
file = os.path.join("train/" + file)
tmp = cv2.imread(file)
tmp = cv2.resize(tmp,(img_r, img_c), interpolation = cv2.INTER_CUBIC)
tmp = cv2.cvtColor(tmp, cv2.COLOR_BGR2GRAY)
tmp = cv2.normalize(tmp, None, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
img_data.append(np.array(tmp).flatten())
tmpfn = file
tmpfn = tmpfn.replace("train/","")
tmpfn = tmpfn.replace(".jpeg","")
img_label.append(trainLabels.loc[trainLabels.image==tmpfn, 'level'].values[0])

fileName = []
eye = []
for file in listing:
tmpfn = file
tmpfn = tmpfn.replace("train/","")
tmpfn = tmpfn.replace(".jpeg","")
fileName.append(tmpfn)
if "left" in tmpfn:
eye.append(1)
else:
eye.append(0)

#data = pd.DataFrame({'fileName':fileName,'eye':eye,'img_data':img_data,'label':img_label}) # keyerror 10
data = pd.DataFrame({'eye':eye,'img_data':img_data,'label':img_label})
data.sample(3)

from sklearn.model_selection import train_test_split
X = data['img_data']
y = data['label']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```

```python
from keras.models import Sequential
from keras.layers.core import Dense, Dropout, Activation, Flatten
from keras.layers.convolutional import Convolution2D, MaxPooling2D
from keras.optimizers import SGD,RMSprop,adam
from keras.layers import Conv2D, MaxPooling2D
from keras.optimizers import SGD
from keras.layers import Dense, Dropout, Flatten
# Create CNN model
model = Sequential()
model.add(Conv2D(64, (3, 3), activation='relu', input_shape = (img_r,img_c,1)))
model.add(Conv2D(128, (3, 3), activation='relu'))
model.add(Dropout(0.5))
model.add(Conv2D(128, (3, 3), activation='relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Conv2D(256, (3, 3), activation='relu'))
model.add(Dropout(0.75))
model.add(Conv2D(128, (3, 3), activation='relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Conv2D(128, (3, 3), activation='relu'))
model.add(Dropout(0.5))
model.add(Conv2D(64, (3, 3), activation='relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Dropout(0.25))

model.add(Flatten())
model.add(Dense(256, activation='relu'))
model.add(Dense(5, activation='softmax'))

# Calculate the class weights for unbalanced data
from sklearn.utils.class_weight import compute_class_weight
classes = np.unique(y_train)
class_weight = compute_class_weight("balanced", classes, y_train)

sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
# Compile model
model.compile(loss='categorical_crossentropy', optimizer='sgd', metrics=['accuracy'])
# convert class vectors to binary class matrices
nb_classes = 5
Y_train = np_utils.to_categorical(y_train, nb_classes)
Y_test = np_utils.to_categorical(y_test, nb_classes)
# Fit the model
model.fit(X_train_resh, Y_train, batch_size = 16, epochs=30, verbose=1,class_weight=class_weight)
score = model.evaluate(X_test_resh, Y_test, verbose=0)
print("%s: %.2f%%" % (model.metrics_names[1], score[1]*100))
```

## 12. Conclusions (2 points)<a id='12'></a>

* (+) The value of the solution, possible cases for its application and further ways of developing and improving the solution are described;

Sorry for this mess, unstructured data etc and little description

Inception v3 as a base and retraining some modified final layers with attention seems good for simple binary classification(healthy=0 or heavy sick=4). But really important task that find a disease on early stage, target==1(Mild).
Further:
* increase size of images
* multiclassification
* improve attention/related techniques to focus on areas, segmentation
* learn
