# Embeddings

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/embeddings
Original Path: https://developers.google.com/machine-learning/crash-course/embeddings
Course: Machine Learning

Embeddings

Mantenha tudo organizado com as coleções

Salve e categorize o conteúdo com base nas suas preferências.

Imagine que você está desenvolvendo um aplicativo de recomendação de alimentos,
que sugere opções parecidas com os
pratos favoritos dos usuários. Para recomendações de alta qualidade (por exemplo,
"já que você gosta de panquecas, recomendamos crepes"), você precisa
desenvolver um modelo de machine learning (ML) que consiga prever a semelhança entre os alimentos.

Para treinar esse modelo, você seleciona um conjunto de dados com 5.000 pratos
conhecidos, incluindo borscht ,
cachorro-quente ,
salada ,
pizza
e shawarma .

Figura 1. Amostragem dos alimentos incluídos no conjunto de dados de pratos.

Você cria um recurso
meal
que tem uma representação com
codificação one-hot
para cada um dos alimentos no conjunto de dados.
Codificação se refere ao processo
de escolher uma representação numérica inicial dos dados para treinar o modelo.

Figura 2. Codificações one-hot de borscht, cachorro-quente e shawarma.
Cada vetor de codificação one-hot tem 5.000 entradas (uma para cada
item no conjunto de dados). As reticências no diagrama representam
as 4.995 entradas não exibidas.

Armadilhas das representações de dados esparsos

Ao analisar as codificações one-hot, é possível notar diversos problemas com essa
representação de dados.

- Número de pesos. Vetores de entrada grandes resultam em muitos
pesos
para uma rede neural .
Com M entradas na sua codificação one-hot e N
nós na primeira camada da rede após a entrada, o modelo precisa treinar
MxN pesos para essa camada.

- Número de pontos de dados. Quanto mais pesos seu modelo tiver, mais dados você
precisará treinar com eficácia.

- Quantidade de computação. Quanto mais pesos, mais computação será necessária
para treinar e usar o modelo. É fácil ultrapassar a capacidade do seu
hardware.

- Quantidade de memória. Quanto mais pesos no seu modelo, mais memória
será necessária nos aceleradores que o treinam e disponibilizam. É muito difícil
escalonar isso de maneira eficiente.

- Dificuldade da compatibilidade com o
machine learning no dispositivo (ODML, na sigla em inglês) .
Caso pretenda executar seu modelo de ML em dispositivos locais, e não o
disponibilizar, você precisará se concentrar em diminuir o tamanho do modelo e
o número de pesos.

Neste módulo, você vai aprender a criar embeddings , representações
de baixa dimensão de dados esparsos, que resolvem esses problemas.

Central de Ajuda

Anterior

arrow_back

Teste seus conhecimentos (10 minutos)

Avançar

Espaço de embedding e embeddings estáticos (10 min)

arrow_forward

Envie comentários

Exceto em caso de indicação contrária, o conteúdo desta página é licenciado de acordo com a Licença de atribuição 4.0 do Creative Commons , e as amostras de código são licenciadas de acordo com a Licença Apache 2.0 . Para mais detalhes, consulte as políticas do site do Google Developers . Java é uma marca registrada da Oracle e/ou afiliadas.

Última atualização 2025-05-20 UTC.

Quer enviar seu feedback?

[[["Fácil de entender","easyToUnderstand","thumb-up"],["Meu problema foi resolvido","solvedMyProblem","thumb-up"],["Outro","otherUp","thumb-up"]],[["Não contém as informações de que eu preciso","missingTheInformationINeed","thumb-down"],["Muito complicado / etapas demais","tooComplicatedTooManySteps","thumb-down"],["Desatualizado","outOfDate","thumb-down"],["Problema na tradução","translationIssue","thumb-down"],["Problema com as amostras / o código","samplesCodeIssue","thumb-down"],["Outro","otherDown","thumb-down"]],["Última atualização 2025-05-20 UTC."],[],[]]
