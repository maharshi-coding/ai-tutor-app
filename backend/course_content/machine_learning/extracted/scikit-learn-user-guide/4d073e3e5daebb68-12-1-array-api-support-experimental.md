# 12.1. Array API support (experimental)

Source: scikit-learn User Guide
Original URL: https://scikit-learn.org/stable/modules/array_api.html
Original Path: https://scikit-learn.org/stable/modules/array_api.html
Course: Machine Learning

12.1. Array API support (experimental) #

The Array API specification defines
a standard API for all array manipulation libraries with a NumPy-like API.
Scikit-learn vendors pinned copies of
array-api-compat
and array-api-extra .

Scikit-learn’s support for the array API standard requires the environment variable

SCIPY_ARRAY_API
to be set to
1
before importing
scipy
and
scikit-learn
:

export SCIPY_ARRAY_API = 1

Please note that this environment variable is intended for temporary use.
For more details, refer to SciPy’s Array API documentation .

Some scikit-learn estimators that primarily rely on NumPy (as opposed to using
Cython) to implement the algorithmic logic of their
fit
,
predict
or

transform
methods can be configured to accept any Array API compatible input
data structures and automatically dispatch operations to the underlying namespace
instead of relying on NumPy.

At this stage, this support is considered experimental and must be enabled
explicitly by the
array_api_dispatch
configuration. See below for details.

Note

Currently, only
array-api-strict
,
cupy
, and
PyTorch
are known to work
with scikit-learn’s estimators.

The following video provides an overview of the standard’s design principles
and how it facilitates interoperability between array libraries:

Scikit-learn on GPUs with Array API
by Thomas Fan at PyData NYC 2023.

12.1.1. Enabling array API support #

The configuration
array_api_dispatch=True
needs to be set to
True
to enable array
API support. We recommend setting this configuration globally to ensure consistent
behaviour and prevent accidental mixing of array namespaces.
Note that in the examples below, we use a context manager (
config_context
)
to avoid having to reset it to
False
at the end of every code snippet, so as to
not affect the rest of the documentation.

Scikit-learn accepts array-like inputs for all
metrics

and some estimators. When
array_api_dispatch=False
, these inputs are converted
into NumPy arrays using
numpy.asarray
(or
numpy.array
).
While this will successfully convert some array API inputs (e.g., JAX array),
we generally recommend setting
array_api_dispatch=True
when using array API inputs.
This is because NumPy conversion can often fail, e.g., torch tensor allocated on GPU.

12.1.2. Example usage #

The example code snippet below demonstrates how to use CuPy to run

LinearDiscriminantAnalysis
on a GPU:

>>> from sklearn.datasets import make_classification
>>> from sklearn import config_context
>>> from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
>>> import cupy

>>> X_np , y_np = make_classification ( random_state = 0 )
>>> X_cu = cupy . asarray ( X_np )
>>> y_cu = cupy . asarray ( y_np )
>>> X_cu . device
<CUDA Device 0>

>>> with config_context ( array_api_dispatch = True ):
... lda = LinearDiscriminantAnalysis ()
... X_trans = lda . fit_transform ( X_cu , y_cu )
>>> X_trans . device
<CUDA Device 0>

After the model is trained, fitted attributes that are arrays will also be
from the same Array API namespace as the training data. For example, if CuPy’s
Array API namespace was used for training, then fitted attributes will be on the
GPU. We provide an experimental
_estimator_with_converted_arrays
utility that
transfers an estimator attributes from Array API to an ndarray:

>>> from sklearn.utils._array_api import _estimator_with_converted_arrays
>>> cupy_to_ndarray = lambda array : array . get ()
>>> lda_np = _estimator_with_converted_arrays ( lda , cupy_to_ndarray )
>>> X_trans = lda_np . transform ( X_np )
>>> type ( X_trans )
<class 'numpy.ndarray'>

12.1.2.1. PyTorch Support #

PyTorch Tensors can also be passed directly:

>>> import torch
>>> X_torch = torch . asarray ( X_np , device = "cuda" , dtype = torch . float32 )
>>> y_torch = torch . asarray ( y_np , device = "cuda" , dtype = torch . float32 )

>>> with config_context ( array_api_dispatch = True ):
... lda = LinearDiscriminantAnalysis ()
... X_trans = lda . fit_transform ( X_torch , y_torch )
>>> type ( X_trans )
<class 'torch.Tensor'>
>>> X_trans . device . type
'cuda'

12.1.3. Support for
Array API
-compatible inputs #

Estimators and other tools in scikit-learn that support Array API compatible inputs.

12.1.3.1. Estimators #

decomposition.PCA
(with
svd_solver="full"
,
svd_solver="covariance_eigh"
, or

svd_solver="randomized"
(
svd_solver="randomized"
only if
power_iteration_normalizer="QR"
))

linear_model.Ridge
(with
solver="svd"
)

linear_model.RidgeCV
(with
solver="svd"
, see Note on device support for float64 )

linear_model.RidgeClassifier
(with
solver="svd"
)

linear_model.RidgeClassifierCV
(with
solver="svd"
, see Note on device support for float64 )

discriminant_analysis.LinearDiscriminantAnalysis
(with
solver="svd"
)

naive_bayes.GaussianNB

preprocessing.Binarizer

preprocessing.KernelCenterer

preprocessing.LabelBinarizer
(with
sparse_output=False
)

preprocessing.LabelEncoder

preprocessing.MaxAbsScaler

preprocessing.MinMaxScaler

preprocessing.Normalizer

preprocessing.PolynomialFeatures

preprocessing.StandardScaler
(see Note on device support for float64 )

mixture.GaussianMixture
(with
init_params="random"
or

init_params="random_from_data"
and
warm_start=False
)

12.1.3.2. Meta-estimators #

Meta-estimators that accept Array API inputs conditioned on the fact that the
base estimator also does:

calibration.CalibratedClassifierCV
(with
method="temperature"
)

model_selection.GridSearchCV

model_selection.RandomizedSearchCV

model_selection.HalvingGridSearchCV

model_selection.HalvingRandomSearchCV

12.1.3.3. Metrics #

sklearn.metrics.accuracy_score

sklearn.metrics.balanced_accuracy_score

sklearn.metrics.brier_score_loss

sklearn.metrics.cluster.calinski_harabasz_score

sklearn.metrics.cohen_kappa_score

sklearn.metrics.confusion_matrix

sklearn.metrics.d2_brier_score

sklearn.metrics.d2_log_loss_score

sklearn.metrics.d2_tweedie_score

sklearn.metrics.det_curve

sklearn.metrics.explained_variance_score

sklearn.metrics.f1_score

sklearn.metrics.fbeta_score

sklearn.metrics.hamming_loss

sklearn.metrics.jaccard_score

sklearn.metrics.log_loss

sklearn.metrics.max_error

sklearn.metrics.mean_absolute_error

sklearn.metrics.mean_absolute_percentage_error

sklearn.metrics.mean_gamma_deviance

sklearn.metrics.mean_pinball_loss

sklearn.metrics.mean_poisson_deviance
(requires enabling array API support for SciPy )

sklearn.metrics.mean_squared_error

sklearn.metrics.mean_squared_log_error

sklearn.metrics.mean_tweedie_deviance

sklearn.metrics.median_absolute_error

sklearn.metrics.multilabel_confusion_matrix

sklearn.metrics.pairwise.additive_chi2_kernel

sklearn.metrics.pairwise.chi2_kernel

sklearn.metrics.pairwise.cosine_similarity

sklearn.metrics.pairwise.cosine_distances

sklearn.metrics.pairwise.pairwise_distances
(only supports “cosine”, “euclidean”, “manhattan” and “l2” metrics)

sklearn.metrics.pairwise.euclidean_distances
(see Note on device support for float64 )

sklearn.metrics.pairwise.laplacian_kernel

sklearn.metrics.pairwise.linear_kernel

sklearn.metrics.pairwise.manhattan_distances

sklearn.metrics.pairwise.paired_cosine_distances

sklearn.metrics.pairwise.paired_euclidean_distances

sklearn.metrics.pairwise.pairwise_kernels

sklearn.metrics.pairwise.polynomial_kernel

sklearn.metrics.pairwise.rbf_kernel
(see Note on device support for float64 )

sklearn.metrics.pairwise.sigmoid_kernel

sklearn.metrics.precision_score

sklearn.metrics.precision_recall_curve

sklearn.metrics.precision_recall_fscore_support

sklearn.metrics.r2_score

sklearn.metrics.recall_score

sklearn.metrics.roc_curve

sklearn.metrics.root_mean_squared_error

sklearn.metrics.root_mean_squared_log_error

sklearn.metrics.zero_one_loss

12.1.3.4. Tools #

preprocessing.label_binarize
(with
sparse_output=False
)

model_selection.cross_val_predict

model_selection.train_test_split

utils.check_consistent_length

Coverage is expected to grow over time. Please follow the dedicated meta-issue on GitHub to track progress.

12.1.4. Input and output array type handling #

Estimators and scoring functions are able to accept input arrays
from different array libraries and/or devices. When a mixed set of input arrays is
passed, scikit-learn converts arrays as needed to make them all consistent.

For estimators, the rule is “everything follows
X
“ - mixed array inputs are
converted so that they all match the array library and device of
X
.
For scoring functions the rule is “everything follows
y_pred
“ - mixed array
inputs are converted so that they all match the array library and device of
y_pred
.

When a function or method has been called with array API compatible inputs, the
convention is to return arrays from the same array library and on the same
device as the input data.

12.1.4.1. Estimators #

When an estimator is fitted with an array API compatible
X
, all other
array inputs, including constructor arguments, (e.g.,
y
,
sample_weight
)
will be converted to match the array library and device of
X
, if they do not already.
This behaviour enables switching from processing on the CPU to processing
on the GPU at any point within a pipeline.

This allows estimators to accept mixed input types, enabling
X
to be moved
to a different device within a pipeline, without explicitly moving
y
.
Note that scikit-learn pipelines do not allow transformation of
y
(to avoid
leakage ).

Take for example a pipeline where
X
and
y
both start on CPU, and go through
the following three steps:

TargetEncoder
, which will transform categorial

X
but also requires
y
, meaning both
X
and
y
need to be on CPU.

FunctionTransformer(func=partial(torch.asarray, device="cuda"))
,
which moves
X
to GPU, to improve performance in the next step.

Ridge
, whose performance can be improved when
passed arrays on a GPU, as they can handle large matrix operations very efficiently.

X
initially contains categorical string data (thus needs to be on CPU), which is
target encoded to numerical values in
TargetEncoder
.

X
is then explicitly moved to GPU to improve the performance of

Ridge
.
y
cannot be transformed by the pipeline
(recall scikit-learn pipelines do not allow transformation of
y
) but as

Ridge
is able to accept mixed input types,
this is not a problem and the pipeline is able to be run.

The fitted attributes of an estimator fitted with an array API compatible
X
, will
be arrays from the same library as the input and stored on the same device.
The
predict
and
transform
method subsequently expect
inputs from the same array library and device as the data passed to the
fit

method.

12.1.4.2. Scoring functions #

When an array API compatible
y_pred
is passed to a scoring function,
all other array inputs (e.g.,
y_true
,
sample_weight
) will be converted
to match the array library and device of
y_pred
, if they do not already.
This allows scoring functions to accept mixed input types, enabling them to be
used within a meta-estimator (or function that accepts estimators), with a
pipeline that moves input arrays between devices (e.g., CPU to GPU).

For example, to be able to use the pipeline described above within e.g.,

cross_validate
or

GridSearchCV
, the scoring function internally
called needs to be able to accept mixed input types.

The output type of scoring functions depends on the number of output values.
When a scoring function returns a scalar value, it will return a Python
scalar (typically a
float
instance) instead of an array scalar value.
For scoring functions that support multiclass or multioutput ,
an array from the same array library and device as
y_pred
will be returned when
multiple values need to be output.

12.1.5. Common estimator checks #

Add the
array_api_support
tag to an estimator’s set of tags to indicate that
it supports the array API. This will enable dedicated checks as part of the
common tests to verify that the estimators’ results are the same when using
vanilla NumPy and array API inputs.

To run these checks you need to install
array-api-strict in your
test environment. This allows you to run checks without having a
GPU. To run the full set of checks you also need to install
PyTorch , CuPy and have
a GPU. Checks that can not be executed or have missing dependencies will be
automatically skipped. Therefore it’s important to run the tests with the

-v
flag to see which checks are skipped:

pip install array-api-strict # and other libraries as needed
pytest -k "array_api" -v

Running the scikit-learn tests against
array-api-strict
should help reveal
most code problems related to handling multiple device inputs via the use of
simulated non-CPU devices. This allows for fast iterative development and debugging of
array API related code.

However, to ensure full handling of PyTorch or CuPy inputs allocated on actual GPU
devices, it is necessary to run the tests against those libraries and hardware.
This can either be achieved by using
Google Colab
or leveraging our CI infrastructure on pull requests (manually triggered by maintainers
for cost reasons).

12.1.5.1. Note on MPS device support #

On macOS, PyTorch can use the Metal Performance Shaders (MPS) to access
hardware accelerators (e.g. the internal GPU component of the M1 or M2 chips).
However, the MPS device support for PyTorch is incomplete at the time of
writing. See the following github issue for more details:

pytorch/pytorch#77764

To enable the MPS support in PyTorch, set the environment variable

PYTORCH_ENABLE_MPS_FALLBACK=1
before running the tests:

PYTORCH_ENABLE_MPS_FALLBACK = 1 pytest -k "array_api" -v

At the time of writing all scikit-learn tests should pass, however, the
computational speed is not necessarily better than with the CPU device.

12.1.5.2. Note on device support for
float64
#

Certain operations within scikit-learn will automatically perform operations
on floating-point values with
float64
precision to prevent overflows and ensure
correctness (e.g.,
metrics.pairwise.euclidean_distances
,

preprocessing.StandardScaler
). However,
certain combinations of array namespaces and devices, such as
PyTorch on MPS

(see Note on MPS device support ) do not support the
float64
data type. In these cases,
scikit-learn will revert to using the
float32
data type instead. This can result in
different behavior (typically numerically unstable results) compared to not using array
API dispatching or using a device with
float64
support.

On this page

This Page

- Show Source
