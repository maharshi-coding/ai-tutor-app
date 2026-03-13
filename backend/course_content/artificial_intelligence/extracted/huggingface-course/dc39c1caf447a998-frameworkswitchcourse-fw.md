# <FrameworkSwitchCourse {fw} />

Source: Hugging Face Course
Original URL: https://github.com/huggingface/course/blob/HEAD/chapters/de/chapter3/3.mdx
Original Path: chapters/de/chapter3/3.mdx
Course: Artificial Intelligence

<FrameworkSwitchCourse {fw} />

# Fine-tuning eine Modells mit der Trainer API

<CourseFloatingBanner chapter={3}
classNames="absolute z-10 right-0 top-0"
notebooks={[
{label: "Google Colab", value: "https://colab.research.google.com/github/huggingface/notebooks/blob/master/course/de/chapter3/section3.ipynb"},
{label: "Aws Studio", value: "https://studiolab.sagemaker.aws/import/github/huggingface/notebooks/blob/master/course/de/chapter3/section3.ipynb"},
]} />

<Youtube id="nvBXf7s7vTI"/>

🤗 Transformers stellt eine `Trainer`-Klasse bereit, mit der du Modelle auf deinen Datensätzen fein-tunen kannst. Nachdem die Datenverarbeitung im letzten Abschnitt abgeschlossen ist, bleiben nur noch wenige Schritte, um den `Trainer` zu definieren. Der schwierigste Teil ist die Vorbereitung der Umgebung um `Trainer.train()` auszuführen, da dies auf einer CPU sehr langsam läuft. Wenn keine GPU verfügbar ist, kannst du bei [Google Colab] (https://colab.research.google.com/) auf kostenlose GPUs oder TPUs zugreifen.

In den folgenden Code-Beispielen wird davon ausgegangen, dass du die Beispiele aus dem vorherigen Abschnitt bereits ausgeführt hast. Hier ist eine kurze Zusammenfassung, die dir zeigt, was erwartet wird:

```py
from datasets import load_dataset
from transformers import AutoTokenizer, DataCollatorWithPadding

raw_datasets = load_dataset("glue", "mrpc")
checkpoint = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(checkpoint)

def tokenize_function(example):
return tokenizer(example["sentence1"], example["sentence2"], truncation=True)

tokenized_datasets = raw_datasets.map(tokenize_function, batched=True)
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
```

### Training

Als erstes müssen wir eine Klasse `TrainingArguments` definieren, die alle Hyperparameter enthält, die der `Trainer` für das Training und die Evaluation verwendet. Das einzige Argument das hier angegeben werden muss, ist ein Verzeichnis in dem das trainierte Modell sowie die Checkpoints gespeichert werden. Für alles andere können die Standardeinstellungen verwendet werden. Diese sollten für ein grundlegendes Fein-tunen ausreichen.

```py
from transformers import TrainingArguments

training_args = TrainingArguments("test-trainer")
```

> [!TIP]
> 💡 Wenn du dein Modell während des Trainings automatisch in das Hub hochladen möchtest, kann in `TrainingArguments` das Argument `push_to_hub=True` angegeben werden. Darüber erfahren wir in [Kapitel 4](/course/chapter4/3) mehr.

Der zweite Schritt ist die Definition unseres Modells. Wie im [vorherigen Kapitel](/course/chapter2) verwenden wir die Klasse `AutoModelForSequenceClassification` mit zwei Labels:

```py
from transformers import AutoModelForSequenceClassification

model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)
```

Du wirst feststellen, dass du im Gegensatz zu [Kapitel 2](/course/chapter2) eine Warnung erhältst, nachdem du dieses vortrainierte Modell instanziiert hast. Der Grund dafür ist, dass BERT nicht auf die Klassifizierung von Satzpaaren vortrainiert wurde. Deshalb wurde der Kopf des vortrainierten Modells verworfen und stattdessen ein neuer Kopf hinzugefügt, der für die Klassifizierung von Sequenzen geeignet ist. Diese Warnungen weisen darauf hin, dass Teile der Gewichtung nicht verwendet wurden (die Gewichte für den verworfenen Kopf) und dass einige andere zufällig initialisiert wurden (die Gewichte für den neuen Kopf). Abschließend werden wir aufgefordert, das Modell zu trainieren, und genau das werden wir jetzt tun.

Sobald wir unser Modell haben, können wir einen `Trainer` definieren, indem wir alle bisher erstellten Objekte übergeben - das `Modell`, die `training_args`, die Trainings- und Validierungsdaten, unseren `data_collator` und unseren `tokenizer`:

```py
from transformers import Trainer

trainer = Trainer(
model,
training_args,
train_dataset=tokenized_datasets["train"],
eval_dataset=tokenized_datasets["validation"],
data_collator=data_collator,
tokenizer=tokenizer,
)
```

Merke: Wenn der `tokenizer` übergeben wird, wie wir es hier getan haben, wird der vom `Trainer` verwendete `data_collator` standardmäßig ein `DataCollatorWithPadding` sein, wie er zuvor definiert wurde. Deshalb kannst du die Zeile `data_collator=data_collator` in diesem Aufruf weglassen. Unabhängig davon war es trotzdem wichtig, diesen Teil der Verarbeitung in Abschnitt 2 zu zeigen!

Um das Modell auf unserem Datensatz fein-tunen zu können, müssen wir nur die Methode `train()` unseres `Trainers` aufrufen:

```py
trainer.train()
```

Dadurch wird das Fein-tunen gestartet (was auf einer GPU ein paar Minuten dauern sollte) und der Trainingsverlust wird alle 500 Schritte gemeldet. Es wird jedoch nicht zurückgegeben, wie gut (oder schlecht) das Modell funktioniert. Dies liegt an folgenden Punkten:

1. Wir haben dem `Trainer` nicht mitgeteilt die Performance in der Trainingsschleife auszuwerten, indem wir `evaluation_strategy` entweder auf `"steps"` (alle `eval_steps` auswerten) oder `"epoch"` (am Ende jeder Epoche evaluieren) gesetzt haben.
2. Wir haben dem `Trainer` keine Funktion `compute_metrics()` zur Verfügung gestellt, um während der Evaluation eine Metrik zu berechnen (sonst hätte die Evaluation nur den Verlust ausgegeben, was keine sehr intuitive Zahl ist).

### Evaluation

Im Folgenden wird gezeigt, wie wir eine `compute_metrics()`-Funktion erstellen und sie beim nächsten Training verwenden können. Die Funktion muss ein `EvalPrediction`-Objekt (ein bennantes Tupel mit einem `predictions`-Feld und einem `label_ids`-Feld) annehmen und ein Dictionary zurückgeben, das Strings auf Floats abbildet (die Strings sind die Namen der zurückgegebenen Metriken und die Floats ihre zugehörigen Werte). Um Vorhersagen von unserem Modell zu erhalten, können wir den Befehl "Trainer.predict()" verwenden:

```py
predictions = trainer.predict(tokenized_datasets["validation"])
print(predictions.predictions.shape, predictions.label_ids.shape)
```

```python out
(408, 2) (408,)
```

Die Ausgabe der `predict()`-Methode ist ein weiteres benanntes Tupel mit drei Feldern: `predictions`, `label_ids` und `metrics`. Das Feld `metrics` enthält den Verlust des übergebenen Datensatzes sowie Zeitangaben dazu, wie lange die Vorhersage insgesamt und im Durchschnitt gedauert hat. Sobald wir unsere Funktion `compute_metrics()` fertiggestellt haben und sie an den `Trainer` übergeben, enthält dieses Feld auch die von der `compute_metrics()`-Funktion zurückgegebenen Metriken.

Die Vorhersagen in `predictions` sind ein zweidimensionales Array mit der Form 408 x 2 (408 ist die Anzahl der Elemente unseres Datensatzes). Das sind die Logits für jedes Element des Datensatzes, das wir an `predict()` übergeben haben (siehe [vorheriges Kapitel](/course/chapter2) dass alle Transformer Modelle Logits zurückgeben). Um diese in Vorhersagen umzuwandeln, die wir mit den Labels vergleichen können, müssen wir den Index mit dem höchsten Wert auf der zweiten Achse nehmen:

```py
import numpy as np

preds = np.argmax(predictions.predictions, axis=-1)
```

Jetzt können wir diese Vorhersagen in `preds` mit den Labels vergleichen. Wir greifen auf die Metriken aus der 🤗 Bibliothek [Evaluate](https://github.com/huggingface/evaluate/) zurück, um unsere Funktion `compute_metric()` zu erstellen. Die mit dem MRPC-Datensatz verbundenen Metriken können genauso einfach geladen werden, wie wir den Datensatz geladen haben, diesmal mit der Funktion `evaluate.load()`. Das zurückgegebene Objekt verfügt über eine Berechnungsmethode, mit der wir die Metrik auswerten können:

```py
import evaluate

metric = evaluate.load("glue", "mrpc")
metric.compute(predictions=preds, references=predictions.label_ids)
```

```python out
{'accuracy': 0.8578431372549019, 'f1': 0.8996539792387542}
```

Die genauen Ergebnisse können variieren, da die zufällige Initialisierung des Modellkopfes den Optimierungsverlauf und damit die Metriken verändern kann. Hier hat das Modell eine Genauigkeit von 85,78 % über die Validierungsdaten und eine F1-Maß von 89,97 erreicht hat. Dies sind die beiden Kennzahlen, die zur Bewertung der Ergebnisse des MRPC-Datensatzes für den GLUE-Benchmark verwendet werden. In der Tabelle im [BERT-Paper] (https://arxiv.org/pdf/1810.04805.pdf) wird für das Basismodell ein F1-Maß von 88,9 angegeben. Das Paper hat das `uncased` Modell verwendet, während wir derzeit das `cased` Modell verwenden, was das bessere Ergebnis erklärt.

Zusammenfassend ergibt das unsere Funktion `compute_metrics()`:

```py
def compute_metrics(eval_preds):
metric = evaluate.load("glue", "mrpc")
logits, labels = eval_preds
predictions = np.argmax(logits, axis=-1)
return metric.compute(predictions=predictions, references=labels)
```

Um diese Funktion in Aktion zu sehen, definieren wir einen neuen `Trainer` mit der Funktion "compute_metrics()", um am Ende jeder Epoche Metriken zu melden:

```py
training_args = TrainingArguments("test-trainer", evaluation_strategy="epoch")
model = AutoModelForSequenceClassification.from_pretrained(checkpoint, num_labels=2)

trainer = Trainer(
model,
training_args,
train_dataset=tokenized_datasets["train"],
eval_dataset=tokenized_datasets["validation"],
data_collator=data_collator,
tokenizer=tokenizer,
compute_metrics=compute_metrics,
)
```

Hier ein Hinweis, dass wir ein neues `TrainingArguments` errstellen, dessen `evaluation_strategy` auf `"epoch"` gesetzt ist, und ein neues Modell definieren - andernfalls würden wir nur das Training des momentanen Modells fortführen, das wir bereits trainiert haben. Um einen neuen Trainingslauf zu starten, führen wir folgendes aus:

```
trainer.train()
```

Nun werden am Ende jeder Epoche zusätzlich zu den Trainingsverlusten auch die Validierungsverluste und -metriken gemeldet. Auch hier kann die Genauigkeit/F1-Maß aufgrund der zufälligen Initialisierung des Modells zu unserem Beispiel variieren, aber sie sollte in etwa gleich sein.

Der `Trainer` funktioniert sofort auf mehreren GPUs oder TPUs und bietet zahlreiche Optionen, wie z. B. Training mit gemischter Genauigkeit (verwende `fp16 = True` in deinen Trainingsargumenten). In Kapitel 10 gehen wir auf alle Funktionen ein, die die `Trainer`-Klasse bereitstellt.

Damit ist die Einführung in das Fein-tunen mit der `Trainer` API abgeschlossen. Beispiele für die gängigsten CL-Aufgaben werden in Kapitel 7 gegeben, aber jetzt schauen wir uns erst einmal an, wie man das Gleiche in PyTorch bewerkstelligen kann.

> [!TIP]
> ✏️ **Probier es aus!** Fein-tune ein Modell mit dem GLUE SST-2 Datensatz, indem du die Datenverarbeitung aus Abschnitt 2 verwendest.
