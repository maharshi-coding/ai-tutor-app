# Classificação

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/classification
Original Path: https://developers.google.com/machine-learning/crash-course/classification
Course: Machine Learning

Classificação

Mantenha tudo organizado com as coleções

Salve e categorize o conteúdo com base nas suas preferências.

No Módulo de regressão logística ,
você aprendeu a usar a função sigmoide
para converter a saída do modelo bruto em um valor entre 0 e 1 e fazer previsões
probabilísticas, por exemplo, prever que um determinado e-mail tem 75% de chance de
ser spam. Mas e se sua meta não for produzir probabilidade, mas uma
categoria, por exemplo, prevendo se um e-mail é "spam" ou "não é spam"?

A classificação é
a tarefa de prever a qual de um conjunto de classes
(categorias) um exemplo pertence. Neste módulo, você vai aprender a converter
um modelo de regressão logística que prevê uma probabilidade
classificação binária
que prevê uma de duas classes. Você também vai aprender a
escolher e calcular as métricas apropriadas para avaliar a qualidade
as previsões do modelo de classificação. Por fim, você vai receber uma breve introdução aos
problemas de classificação multiclasse ,
que serão discutidos com mais detalhes mais adiante no curso.

Central de Ajuda

Anterior

arrow_back

Teste seus conhecimentos (10 minutos)

Avançar

Limites e a matriz de confusão (12 min)

arrow_forward

Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons , e as amostras de código são licenciadas de acordo com a Licença Apache 2.0 . Para mais detalhes, consulte as políticas do site do Google Developers . Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-07-27 UTC.

Quer enviar seu feedback?

[[["Fácil de entender","easyToUnderstand","thumb-up"],["Meu problema foi resolvido","solvedMyProblem","thumb-up"],["Outro","otherUp","thumb-up"]],[["Não contém as informações de que eu preciso","missingTheInformationINeed","thumb-down"],["Muito complicado / etapas demais","tooComplicatedTooManySteps","thumb-down"],["Desatualizado","outOfDate","thumb-down"],["Problema na tradução","translationIssue","thumb-down"],["Problema com as amostras / o código","samplesCodeIssue","thumb-down"],["Outro","otherDown","thumb-down"]],["Última atualização 2025-07-27 UTC."],[],[]]
