# Clasificación: Sesgo de predicción

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/classification/prediction-bias
Original Path: https://developers.google.com/machine-learning/crash-course/classification/prediction-bias
Course: Machine Learning

Clasificación: Sesgo de predicción

Organiza tus páginas con colecciones

Guarda y categoriza el contenido según tus preferencias.

El cálculo del sesgo de predicción es una verificación rápida que puede marcar problemas con el modelo o los datos de entrenamiento en una etapa temprana.

El sesgo de predicción es la diferencia entre la media de las predicciones de un modelo y la media de las etiquetas de verdad fundamental en los datos. Un modelo entrenado con un conjunto de datos en el que el 5% de los correos electrónicos son spam debería predecir, en promedio, que el 5% de los correos electrónicos que clasifica son spam. En otras palabras, la media de las etiquetas en el conjunto de datos de verdad fundamental es 0.05, y la media de las predicciones del modelo también debería ser 0.05. Si este es el caso, el modelo tiene un sesgo de predicción cero. Por supuesto, el modelo podría tener otros problemas.

Si, en cambio, el modelo predice el 50% de las veces que un correo electrónico es spam, algo anda mal con el conjunto de datos de entrenamiento, el nuevo conjunto de datos al que se aplica el modelo o el modelo en sí. Cualquier diferencia significativa entre las dos medias sugiere que el modelo tiene algún sesgo de predicción.

El sesgo de predicción puede deberse a lo siguiente:

- Sesgos o ruido en los datos, incluido el muestreo sesgado para el conjunto de entrenamiento

- Regularización demasiado fuerte, lo que significa que el modelo se simplificó demasiado y perdió parte de la complejidad necesaria

- Errores en la canalización de entrenamiento del modelo

- El conjunto de atributos proporcionado al modelo no es suficiente para la tarea.

Centro de ayuda

Anterior

arrow_back

ROC y AUC (10 min)

Siguiente

Clasificación multiclase (2 min)

arrow_forward

Enviar comentarios

Salvo que se indique lo contrario, el contenido de esta página está sujeto a la licencia Atribución 4.0 de Creative Commons , y los ejemplos de código están sujetos a la licencia Apache 2.0 . Para obtener más información, consulta las políticas del sitio de Google Developers . Java es una marca registrada de Oracle o sus afiliados.

Última actualización: 2025-10-17 (UTC)

¿Quieres brindar más información?

[[["Fácil de comprender","easyToUnderstand","thumb-up"],["Resolvió mi problema","solvedMyProblem","thumb-up"],["Otro","otherUp","thumb-up"]],[["Falta la información que necesito","missingTheInformationINeed","thumb-down"],["Muy complicado o demasiados pasos","tooComplicatedTooManySteps","thumb-down"],["Desactualizado","outOfDate","thumb-down"],["Problema de traducción","translationIssue","thumb-down"],["Problema con las muestras o los códigos","samplesCodeIssue","thumb-down"],["Otro","otherDown","thumb-down"]],["Última actualización: 2025-10-17 (UTC)"],[],[]]
