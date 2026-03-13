# Hagamos Fine-Tuning de Tu Modelo para Llamadas a Funciones

Source: Hugging Face Agents Course
Original URL: https://github.com/huggingface/agents-course/blob/HEAD/units/es/bonus-unit1/fine-tuning.mdx
Original Path: units/es/bonus-unit1/fine-tuning.mdx
Course: Artificial Intelligence

# Hagamos Fine-Tuning de Tu Modelo para Llamadas a Funciones

Ahora estamos listos para hacer fine-tuning de nuestro primer modelo para llamadas a funciones 🔥.

## ¿Cómo entrenamos nuestro modelo para llamadas a funciones?

> Respuesta: Necesitamos **datos**

Un proceso de entrenamiento de modelo se puede dividir en 3 pasos:

1. **El modelo es pre-entrenado con una gran cantidad de datos**. El resultado de ese paso es un **modelo pre-entrenado**. Por ejemplo, [google/gemma-2-2b](https://huggingface.co/google/gemma-2-2b). Es un modelo base y solo sabe cómo **predecir el siguiente token sin fuertes capacidades de seguimiento de instrucciones**.

2. Para ser útil en un contexto de chat, el modelo luego necesita ser **ajustado (fine-tuned)** para seguir instrucciones. En este paso, puede ser entrenado por los creadores del modelo, la comunidad de código abierto, tú o cualquier persona. Por ejemplo, [google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it) es un modelo ajustado para instrucciones por el equipo de Google detrás del proyecto Gemma.

3. El modelo puede luego **alinearse** con las preferencias del creador. Por ejemplo, un modelo de chat de servicio al cliente que nunca debe ser grosero con los clientes.

Usualmente un producto completo como Gemini o Mistral **pasará por los 3 pasos**, mientras que los modelos que puedes encontrar en Hugging Face han completado uno o más pasos de este entrenamiento.

En este tutorial, construiremos un modelo de llamadas a funciones basado en [google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it). Elegimos el modelo ajustado [google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it) en lugar del modelo base [google/gemma-2-2b](https://huggingface.co/google/gemma-2-2b) porque el modelo ajustado ha sido mejorado para nuestro caso de uso.

Comenzar desde el modelo pre-entrenado **requeriría más entrenamiento para aprender a seguir instrucciones, chatear Y hacer llamadas a funciones**.

Al comenzar desde el modelo ajustado para instrucciones, **minimizamos la cantidad de información que nuestro modelo necesita aprender**.

## LoRA (Adaptación de Bajo Rango de Modelos de Lenguaje Grandes)

LoRA es una técnica de entrenamiento popular y ligera que **reduce significativamente el número de parámetros a entrenar**.

Funciona **insertando un número menor de nuevos pesos(weights) como un adaptador en el modelo para entrenar**. Esto hace que el entrenamiento con LoRA sea mucho más rápido, eficiente en memoria y produzca pesos(weights) de modelo más pequeños (unos cientos de MB), que son más fáciles de almacenar y compartir.

<img src="https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/unit1/blog_multi-lora-serving_LoRA.gif" alt="Inferencia LoRA" width="50%"/>

LoRA funciona añadiendo pares de matrices de descomposición de rango a las capas del Transformer, típicamente centrándose en las capas lineales. Durante el entrenamiento, "congelaremos" el resto del modelo y solo actualizaremos los pesos de esos adaptadores recién añadidos.

Al hacerlo, el número de **parámetros** que necesitamos entrenar disminuye considerablemente ya que solo necesitamos actualizar los pesos del adaptador.

Durante la inferencia, la entrada se pasa al adaptador y al modelo base, o estos pesos del adaptador pueden fusionarse con el modelo base, lo que resulta en ninguna sobrecarga adicional de latencia.

LoRA es particularmente útil para adaptar modelos de lenguaje **grandes** a tareas o dominios específicos mientras se mantienen manejables los requisitos de recursos. Esto ayuda a reducir la memoria **requerida** para entrenar un modelo.

Si quieres aprender más sobre cómo funciona LoRA, deberías consultar este [tutorial](https://huggingface.co/learn/nlp-course/chapter11/4?fw=pt).

## Fine-Tuning de un Modelo para Llamadas a Funciones

Puedes acceder al notebook del tutorial 👉 [aquí](https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb).

Luego, haz clic en [![Abrir En Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/#fileId=https://huggingface.co/agents-course/notebooks/blob/main/bonus-unit1/bonus-unit1.ipynb) para poder ejecutarlo en un Notebook de Colab.
