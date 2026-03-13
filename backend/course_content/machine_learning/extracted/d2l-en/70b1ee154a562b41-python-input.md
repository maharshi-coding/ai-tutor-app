# ```{.python .input}

Source: Dive into Deep Learning
Original URL: https://github.com/d2l-ai/d2l-en/blob/HEAD/chapter_hyperparameter-optimization/rs-async.md
Original Path: chapter_hyperparameter-optimization/rs-async.md
Course: Machine Learning

```{.python .input}
from d2l import torch as d2l
import logging
logging.basicConfig(level=logging.INFO)
from syne_tune.config_space import loguniform, randint
from syne_tune.backend.python_backend import PythonBackend
from syne_tune.optimizer.baselines import RandomSearch
from syne_tune import Tuner, StoppingCriterion
from syne_tune.experiments import load_experiment
```

## Objective Function

First, we have to define a new objective function such that it now returns the
performance back to Syne Tune via the `report` callback.

```{.python .input n=34}
def hpo_objective_lenet_synetune(learning_rate, batch_size, max_epochs):
from d2l import torch as d2l
from syne_tune import Reporter

model = d2l.LeNet(lr=learning_rate, num_classes=10)
trainer = d2l.HPOTrainer(max_epochs=1, num_gpus=1)
data = d2l.FashionMNIST(batch_size=batch_size)
model.apply_init([next(iter(data.get_dataloader(True)))[0]], d2l.init_cnn)
report = Reporter()
for epoch in range(1, max_epochs + 1):
if epoch == 1:
# Initialize the state of Trainer
trainer.fit(model=model, data=data)
else:
trainer.fit_epoch()
validation_error = d2l.numpy(trainer.validation_error().cpu())
report(epoch=epoch, validation_error=float(validation_error))
```

Note that the `PythonBackend` of Syne Tune requires dependencies to be imported
inside the function definition.

## Asynchronous Scheduler

First, we define the number of workers that evaluate trials concurrently. We
also need to specify how long we want to run random search, by defining an
upper limit on the total wall-clock time.

```{.python .input n=37}
n_workers = 2 # Needs to be <= the number of available GPUs

max_wallclock_time = 12 * 60 # 12 minutes
```

Next, we state which metric we want to optimize and whether we want to minimize or
maximize this metric. Namely, `metric` needs to correspond to the argument name
passed to the `report` callback.

```{.python .input n=38}
mode = "min"
metric = "validation_error"
```

We use the configuration space from our previous example. In Syne Tune, this
dictionary can also be used to pass constant attributes to the training script.
We make use of this feature in order to pass `max_epochs`. Moreover, we specify
the first configuration to be evaluated in `initial_config`.

```{.python .input n=39}
config_space = {
"learning_rate": loguniform(1e-2, 1),
"batch_size": randint(32, 256),
"max_epochs": 10,
}
initial_config = {
"learning_rate": 0.1,
"batch_size": 128,
}
```

Next, we need to specify the back-end for job executions. Here we just consider
the distribution on a local machine where parallel jobs are executed as
sub-processes. However, for large scale HPO, we could run this also on a cluster
or cloud environment, where each trial consumes a full instance.

```{.python .input n=40}
trial_backend = PythonBackend(
tune_function=hpo_objective_lenet_synetune,
config_space=config_space,
)
```

We can now create the scheduler for asynchronous random search, which is similar
in behaviour to our `BasicScheduler` from :numref:`sec_api_hpo`.

```{.python .input n=41}
scheduler = RandomSearch(
config_space,
metric=metric,
mode=mode,
points_to_evaluate=[initial_config],
)
```

Syne Tune also features a `Tuner`, where the main experiment loop and
bookkeeping is centralized, and interactions between scheduler and back-end are
mediated.

```{.python .input n=42}
stop_criterion = StoppingCriterion(max_wallclock_time=max_wallclock_time)

tuner = Tuner(
trial_backend=trial_backend,
scheduler=scheduler,
stop_criterion=stop_criterion,
n_workers=n_workers,
print_update_interval=int(max_wallclock_time * 0.6),
)
```

Let us run our distributed HPO experiment. According to our stopping criterion,
it will run for about 12 minutes.

```{.python .input n=43}
tuner.run()
```

The logs of all evaluated hyperparameter configurations are stored for further
analysis. At any time during the tuning job, we can easily get the results
obtained so far and plot the incumbent trajectory.

```{.python .input n=46}
d2l.set_figsize()
tuning_experiment = load_experiment(tuner.name)
tuning_experiment.plot()
```

## Visualize the Asynchronous Optimization Process

Below we visualize how the learning curves of every trial (each color in the plot represents a trial) evolve during the
asynchronous optimization process. At any point in time, there are as many trials
running concurrently as we have workers. Once a trial finishes, we immediately
start the next trial, without waiting for the other trials to finish. Idle time
of workers is reduced to a minimum with asynchronous scheduling.

```{.python .input n=45}
d2l.set_figsize([6, 2.5])
results = tuning_experiment.results

for trial_id in results.trial_id.unique():
df = results[results["trial_id"] == trial_id]
d2l.plt.plot(
df["st_tuner_time"],
df["validation_error"],
marker="o"
)

d2l.plt.xlabel("wall-clock time")
d2l.plt.ylabel("objective function")
```

## Summary

We can reduce the waiting time for random search substantially by distribution
trials across parallel resources. In general, we distinguish between synchronous
scheduling and asynchronous scheduling. Synchronous scheduling means that we
sample a new batch of hyperparameter configurations once the previous batch
finished. If we have a stragglers - trials that takes more time to finish than
other trials - our workers need to wait at synchronization points. Asynchronous
scheduling evaluates a new hyperparameter configurations as soon as resources
become available, and, hence, ensures that all workers are busy at any point in
time. While random search is easy to distribute asynchronously and does not
require any change of the actual algorithm, other methods require some additional
modifications.

## Exercises

1. Consider the `DropoutMLP` model implemented in :numref:`sec_dropout`, and used in Exercise 1 of :numref:`sec_api_hpo`.
1. Implement an objective function `hpo_objective_dropoutmlp_synetune` to be used with Syne Tune. Make sure that your function reports the validation error after every epoch.
2. Using the setup of Exercise 1 in :numref:`sec_api_hpo`, compare random search to Bayesian optimization. If you use SageMaker, feel free to use Syne Tune's benchmarking facilities in order to run experiments in parallel. Hint: Bayesian optimization is provided as `syne_tune.optimizer.baselines.BayesianOptimization`.
3. For this exercise, you need to run on an instance with at least 4 CPU cores. For one of the methods used above (random search, Bayesian optimization), run experiments with `n_workers=1`, `n_workers=2`, `n_workers=4`, and compare results (incumbent trajectories). At least for random search, you should observe linear scaling with respect to the number of workers. Hint: For robust results, you may have to average over several repetitions each.
2. *Advanced*. The goal of this exercise is to implement a new scheduler in Syne Tune.
1. Create a virtual environment containing both the [d2lbook](https://github.com/d2l-ai/d2l-en/blob/master/INFO.md#installation-for-developers) and [syne-tune](https://syne-tune.readthedocs.io/en/latest/getting_started.html) sources.
2. Implement the `LocalSearcher` from Exercise 2 in :numref:`sec_api_hpo` as a new searcher in Syne Tune. Hint: Read [this tutorial](https://syne-tune.readthedocs.io/en/latest/tutorials/developer/README.html). Alternatively, you may follow this [example](https://syne-tune.readthedocs.io/en/latest/examples.html#launch-hpo-experiment-with-home-made-scheduler).
3. Compare your new `LocalSearcher` with `RandomSearch` on the `DropoutMLP` benchmark.

:begin_tab:`pytorch`
[Discussions](https://discuss.d2l.ai/t/12093)
:end_tab:
