# Introducción

Source: Hugging Face Agents Course
Original URL: https://github.com/huggingface/agents-course/blob/HEAD/units/es/bonus-unit1/introduction.mdx
Original Path: units/es/bonus-unit1/introduction.mdx
Course: Artificial Intelligence

# Introducción

![Bonus Unit 1 Thumbnail](https://huggingface.co/datasets/agents-course/course-images/resolve/main/en/bonus-unit1/thumbnail.jpg)

Bienvenido a esta primera **Unidad Bonus**, donde aprenderás a **hacer fine-tuning de un Modelo de Lenguaje Grande (LLM) para llamadas a funciones**.

En términos de LLMs, la llamada a funciones se está convirtiendo rápidamente en una técnica *imprescindible*.

La idea es que, en lugar de depender solo de enfoques basados en prompts como hicimos en la Unidad 1, la llamada a funciones entrena a tu modelo para **realizar acciones e interpretar observaciones durante la fase de entrenamiento**, haciendo tu IA más robusta.

> **¿Cuándo debería hacer esta Unidad Bonus?**
>
> Esta sección es **opcional** y es más avanzada que la Unidad 1, así que no dudes en hacer esta unidad ahora o revisitarla cuando tu conocimiento haya mejorado gracias a este curso.
>
> Pero no te preocupes, esta Unidad Bonus está diseñada para tener toda la información que necesitas, así que te guiaremos a través de cada concepto fundamental del fine-tuning de un modelo para llamadas a funciones, incluso si aún no has aprendido el funcionamiento interno del fine-tuning.

La mejor manera para que puedas seguir esta Unidad Bonus es:

1. Saber cómo hacer Fine-Tuning de un LLM con Transformers, si no es el caso [revisa esto](https://huggingface.co/learn/nlp-course/chapter3/1?fw=pt).

2. Saber cómo usar `SFTTrainer` para hacer fine-tuning de nuestro modelo, para aprender más sobre esto [revisa esta documentación](https://huggingface.co/learn/nlp-course/en/chapter11/1).

## Lo que Aprenderás

1. **Llamadas a Funciones**
Cómo los LLMs modernos estructuran sus conversaciones de manera efectiva permitiéndoles activar **Herramientas**.

2. **LoRA (Adaptación de Bajo Rango)**
Un método de fine-tuning **ligero y eficiente** que reduce la sobrecarga computacional y de almacenamiento. LoRA hace que el entrenamiento de modelos grandes sea *más rápido, económico y fácil* de implementar.

3. **El Ciclo Pensamiento → Acción → Observación** en modelos de Llamadas a Funciones
Un enfoque simple pero poderoso para estructurar cómo tu modelo decide cuándo (y cómo) llamar funciones, rastrear pasos intermedios e interpretar los resultados de Herramientas o APIs externas.

4. **Nuevos Tokens Especiales**
Introduciremos **marcadores especiales** que ayudan al modelo a distinguir entre:
- Razonamiento interno de "cadena de pensamiento"
- Llamadas a funciones salientes
- Respuestas que regresan de herramientas externas

Al final de esta unidad bonus, serás capaz de:

- **Entender** el funcionamiento interno de las APIs cuando se trata de Herramientas.
- **Hacer fine-tuning** de un modelo usando la técnica LoRA.
- **Implementar** y **modificar** el ciclo Pensamiento → Acción → Observación para crear flujos de trabajo de Llamadas a funciones robustos y mantenibles.
- **Diseñar y utilizar** tokens especiales para separar sin problemas el razonamiento interno del modelo de sus acciones externas.

Y **habrás hecho fine-tuning de tu propio modelo para realizar llamadas a funciones.** 🔥

¡Sumerjámonos en las **llamadas a funciones**!
