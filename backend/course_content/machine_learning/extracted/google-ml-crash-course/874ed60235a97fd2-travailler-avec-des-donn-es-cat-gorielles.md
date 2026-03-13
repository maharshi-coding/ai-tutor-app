# Travailler avec des données catégorielles

Source: Google Machine Learning Crash Course
Original URL: https://developers.google.com/machine-learning/crash-course/categorical-data
Original Path: https://developers.google.com/machine-learning/crash-course/categorical-data
Course: Machine Learning

Travailler avec des données catégorielles

Restez organisé à l'aide des collections

Enregistrez et classez les contenus selon vos préférences.

Les données catégorielles ont un ensemble spécifique de valeurs possibles. Exemple :

- Différentes espèces animales dans un parc national

- Noms de rues d'une ville spécifique

- Indique si l'e-mail est un spam ou non

- Couleurs des façades

- Nombres regroupés, décrits dans le module Utiliser des données numériques

Les nombres peuvent également être des données catégorielles

Les données numériques véritables peuvent être multipliées de manière significative. Prenons l'exemple
qui prédit la valeur d'un logement en fonction de sa superficie.
Notez qu'un modèle utile pour évaluer le prix des maisons repose généralement sur
des centaines de fonctionnalités. Cela dit, toutes choses égales par ailleurs, une maison de 200 m² devrait être environ deux fois plus chère qu'une maison identique de 100 m².

Souvent, vous devez représenter les caractéristiques contenant des valeurs entières sous la forme
des données catégorielles
au lieu de données numériques. Prenons l'exemple d'un code postal
caractéristique de code dont les valeurs sont des entiers. Si vous représentez
des caractéristiques numériques plutôt que catégorielles, vous demandez au modèle
pour trouver une relation numérique
entre différents codes postaux. Autrement dit, vous indiquez au modèle de traiter le code postal 20004 comme un signal deux fois (ou moitié) plus important que le code postal 10002. Représenter les codes postaux en tant que données catégorielles permet au modèle
pondérer chaque code postal séparément.

Encodage

L' encodage consiste à convertir des données catégorielles ou d'autres données en vecteurs numériques sur lesquels un modèle peut s'entraîner. Cette conversion est nécessaire, car les modèles
l'entraînement sur des valeurs à virgule flottante uniquement. ne peuvent pas être entraînés sur des chaînes

"dog"
ou
"maple"
. Ce module explique les différentes méthodes d'encodage pour les données catégorielles.

Centre d'aide

Précédent

arrow_back

Conclusion (2 min)

Suivant

Vocabulaire et encodage one-hot (10 min)

arrow_forward

Envoyer des commentaires

Sauf indication contraire, le contenu de cette page est régi par une licence Creative Commons Attribution 4.0 , et les échantillons de code sont régis par une licence Apache 2.0 . Pour en savoir plus, consultez les Règles du site Google Developers . Java est une marque déposée d'Oracle et/ou de ses sociétés affiliées.

Dernière mise à jour le 2025/07/27 (UTC).

Voulez-vous nous donner plus d'informations ?

[[["Facile à comprendre","easyToUnderstand","thumb-up"],["J'ai pu résoudre mon problème","solvedMyProblem","thumb-up"],["Autre","otherUp","thumb-up"]],[["Il n'y a pas l'information dont j'ai besoin","missingTheInformationINeed","thumb-down"],["Trop compliqué/Trop d'étapes","tooComplicatedTooManySteps","thumb-down"],["Obsolète","outOfDate","thumb-down"],["Problème de traduction","translationIssue","thumb-down"],["Mauvais exemple/Erreur de code","samplesCodeIssue","thumb-down"],["Autre","otherDown","thumb-down"]],["Dernière mise à jour le 2025/07/27 (UTC)."],[],[]]
