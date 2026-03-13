# Cuestionario: Evaluación de Agentes de IA

Source: Hugging Face Agents Course
Original URL: https://github.com/huggingface/agents-course/blob/HEAD/units/es/bonus-unit2/quiz.mdx
Original Path: units/es/bonus-unit2/quiz.mdx
Course: Artificial Intelligence

# Cuestionario: Evaluación de Agentes de IA

Vamos a evaluar tu comprensión de los conceptos de rastreo y evaluación de agentes cubiertos en esta unidad extra.

Este cuestionario es opcional y no está calificado.

### Q1: ¿A qué se refiere principalmente la observabilidad en los agentes de IA?
¿Qué afirmación describe con precisión el propósito de la observabilidad para los agentes de IA?

<Question
choices={[
{
text: "Implica rastrear operaciones internas a través de registros, métricas y spans para entender el comportamiento del agente.",
explain: "¡Correcto! La observabilidad significa usar registros, métricas y spans para arrojar luz sobre el funcionamiento interno del agente.",
correct: true
},
{
text: "Está únicamente enfocada en reducir el costo financiero de ejecutar el agente.",
explain: "La observabilidad cubre el costo pero no se limita a ello."
},
{
text: "Se refiere solo a la apariencia externa y la interfaz de usuario del agente.",
explain: "La observabilidad trata sobre los procesos internos, no la interfaz de usuario."
},
{
text: "Se ocupa únicamente del estilo de codificación y la estética del código.",
explain: "El estilo de código no está relacionado con la observabilidad en este contexto."
}
]}
/>

### Q2: ¿Cuál de las siguientes NO es una métrica común monitoreada en la observabilidad de agentes?
Selecciona la métrica que normalmente no cae bajo el paraguas de la observabilidad.

<Question
choices={[
{
text: "Latencia",
explain: "La latencia se rastrea comúnmente para evaluar la capacidad de respuesta del agente."
},
{
text: "Costo por Ejecución del Agente",
explain: "Monitorear el costo es un aspecto clave de la observabilidad."
},
{
text: "Retroalimentación y Calificaciones de Usuarios",
explain: "La retroalimentación del usuario es crucial para evaluar el rendimiento del agente."
},
{
text: "Líneas de Código del Agente",
explain: "El número de líneas de código no es una métrica típica de observabilidad.",
correct: true
}
]}
/>

### Q3: ¿Qué describe mejor la evaluación fuera de línea de un agente de IA?
Determina la afirmación que captura correctamente la esencia de la evaluación fuera de línea.

<Question
choices={[
{
text: "Evaluar el agente utilizando interacciones reales de usuarios en un entorno en vivo.",
explain: "Esto describe la evaluación en línea en lugar de fuera de línea."
},
{
text: "Evaluar el rendimiento del agente utilizando conjuntos de datos curados con verdad fundamental conocida.",
explain: "¡Correcto! La evaluación fuera de línea utiliza conjuntos de datos de prueba para medir el rendimiento contra respuestas conocidas.",
correct: true
},
{
text: "Monitorear los registros internos del agente en tiempo real.",
explain: "Esto está más relacionado con la observabilidad que con la evaluación."
},
{
text: "Ejecutar el agente sin ninguna métrica de evaluación.",
explain: "Este enfoque no proporciona información significativa."
}
]}
/>

### Q4: ¿Qué ventaja ofrece la evaluación en línea de agentes?
Elige la afirmación que mejor refleja el beneficio de la evaluación en línea.

<Question
choices={[
{
text: "Proporciona escenarios de prueba controlados utilizando conjuntos de datos predefinidos.",
explain: "Las pruebas controladas son un beneficio de la evaluación fuera de línea, no en línea."
},
{
text: "Captura interacciones de usuarios en vivo y datos de rendimiento del mundo real.",
explain: "¡Correcto! La evaluación en línea ofrece información al monitorear el agente en un entorno en vivo.",
correct: true
},
{
text: "Elimina la necesidad de cualquier prueba fuera de línea y puntos de referencia.",
explain: "Tanto las evaluaciones fuera de línea como en línea son importantes y complementarias."
},
{
text: "Se enfoca únicamente en reducir el costo computacional del agente.",
explain: "El monitoreo de costos es parte de la observabilidad, no la ventaja principal de la evaluación en línea."
}
]}
/>

### Q5: ¿Qué papel juega OpenTelemetry en la observabilidad y evaluación de agentes de IA?
¿Qué afirmación describe mejor el papel de OpenTelemetry en el monitoreo de agentes de IA?

<Question
choices={[
{
text: "Proporciona un marco estandarizado para instrumentar código, permitiendo la recopilación de rastros, métricas y registros para la observabilidad.",
explain: "¡Correcto! OpenTelemetry estandariza la instrumentación para datos de telemetría, lo cual es crucial para monitorear y diagnosticar el comportamiento del agente.",
correct: true
},
{
text: "Actúa como un reemplazo para la depuración manual al corregir automáticamente problemas de código.",
explain: "Incorrecto. OpenTelemetry se utiliza para recopilar datos de telemetría, no para depurar problemas de código."
},
{
text: "Sirve principalmente como una base de datos para almacenar registros históricos sin capacidades en tiempo real.",
explain: "Incorrecto. OpenTelemetry se enfoca en la recopilación de datos de telemetría en tiempo real y la exportación de datos a herramientas de análisis."
},
{
text: "Se utiliza para optimizar el rendimiento computacional del agente de IA mediante el ajuste automático de parámetros del modelo.",
explain: "Incorrecto. OpenTelemetry se centra en la observabilidad más que en el ajuste de rendimiento."
}
]}
/>

¡Felicidades por completar este cuestionario! 🎉 Si te equivocaste en alguna pregunta, considera revisar el contenido de esta unidad extra para una comprensión más profunda. Si te fue bien, ¡estás listo para explorar temas más avanzados en observabilidad y evaluación de agentes!
