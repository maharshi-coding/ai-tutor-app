# Listas de Python

Source: Google's Python Class
Original URL: https://developers.google.com/edu/python/lists
Original Path: https://developers.google.com/edu/python/lists
Course: Python Programming

Listas de Python

Organiza tus páginas con colecciones

Guarda y categoriza el contenido según tus preferencias.

Python tiene un excelente tipo de lista integrado llamado “list”. Los literales de lista se escriben entre corchetes [ ]. Las listas funcionan de manera similar a las cadenas: usa la función len() y corchetes [ ] para acceder a los datos, con el primer elemento en el índice 0. (Consulta los documentos de la lista de python.org oficiales).

colors = [ 'red' , 'blue' , 'green' ]
print ( colors [ 0 ]) ## red
print ( colors [ 2 ]) ## green
print ( len ( colors )) ## 3

No se realizará una copia de las tareas con = en listas. En cambio, la asignación hace que las dos variables apunten a la única lista en la memoria.

b = colors ## Does not copy the list

La "lista vacía" es solo un par vacío de corchetes [ ]. el símbolo "+" funciona para agregar dos listas, por lo que [1, 2] + [3, 4] da como resultado [1, 2, 3, 4] (esto es como + con cadenas).

IN y FOR

Las construcciones *for* y *in* de Python son extremadamente útiles, y la primera vez que las usaremos es con listas. La construcción *para* (
for var in list
) es una manera fácil de ver cada elemento en una lista (o en otra colección). No agregues ni quites de la lista durante la iteración.

squares = [ 1 , 4 , 9 , 16 ]
sum = 0
for num in squares :
sum += num
print ( sum ) ## 30

Si sabes qué tipo de información hay en la lista, usa un nombre de variable en el bucle que capture esa información, como "num", "name" o "url". Dado que el código de Python no tiene otra sintaxis para recordarte los tipos, los nombres de las variables son una forma clave de tener claro lo que sucede.
(Esto es un poco engañoso. A medida que ganes más exposición a Python, verás referencias a
sugerencias de tipo que te permiten agregar texto
información a las definiciones de tus funciones. Python no usa estas sugerencias de tipos cuando se ejecuta
tus programas. Los usan otros programas, como los IDE (entornos de desarrollo integrados) y
herramientas de análisis estático, como linters/verificadores de tipo, para validar si tus funciones se llaman
con argumentos compatibles).

La construcción *in* por sí sola es una manera fácil de probar si un elemento aparece en una lista (o en otra colección),
value in collection
, prueba si el valor está en la colección y muestra True/False.

list = [ 'larry' , 'curly' , 'moe' ]
if 'curly' in list :
print ( 'yay' ) ## yay

Las construcciones for/in se usan con mucha frecuencia en el código de Python y funcionan en tipos de datos que no son de lista, por lo que solo debes memorizar su sintaxis. Es posible que tengas hábitos de otros lenguajes en los que comiences a iterar manualmente sobre una colección, y en Python solo debes usar for/in.

También puedes usar for/in para trabajar en una cadena. La cadena actúa como una lista de sus caracteres, por lo que
for ch in s: print(ch)
imprime todos los caracteres de una cadena.

Rango

La función rango(n) arroja los números 0, 1, ... n-1 y rango(a, b) devuelve a, a+1, ... b-1 -- hasta el último número, pero sin incluirlo. La combinación del bucle for y la función range() te permite compilar un bucle for numérico tradicional:

## print the numbers from 0 through 99
for i in range ( 100 ):
print ( i )

Hay una variante xrange() que evita el costo de compilar la lista completa para casos sensibles de rendimiento (en Python 3, range() tendrá un buen comportamiento de rendimiento y podrás olvidarte de xrange()).

Bucle while

Python también tiene el bucle while estándar, y las instrucciones *break* y *continue* funcionan como en C++ y Java, lo que altera el curso del bucle más interno. Los bucles for/in anteriores resuelven el caso común de iterar cada elemento de una lista, pero el bucle while te brinda un control total sobre los números de índice. Este es un bucle while que accede al tercer elemento de una lista:

## Access every 3rd element in a list
i = 0
while i len ( a ):
print ( a [ i ])
i = i + 3

Enumerar métodos

Estos son otros métodos comunes de enumeración.

- list.append(elem): agrega un solo elemento al final de la lista. Error común: No muestra la lista nueva, solo modifica la original.

- list.insert(index, elem): inserta el elemento en el índice dado y desplaza los elementos hacia la derecha.

- list.extend(list2) agrega los elementos de list2 al final de la lista. Usar + o += en una lista es similar a usar extend().

- list.index(elem): Busca el elemento dado desde el comienzo de la lista y muestra su índice. Muestra un ValueError si el elemento no aparece (usa “in” para verificar sin un ValueError).

- list.remove(elem): busca la primera instancia del elemento determinado y la quita (arroja ValueError si no está presente).

- list.sort(): ordena la lista en el lugar (no la muestra). (Se prefiere la función order() que se muestra más adelante).

- list.reverse(): Invierte la lista en el lugar (no la muestra).

- list.pop(index): Quita y muestra el elemento en el índice dado. Muestra el elemento que se encuentra más a la derecha si se omite el índice (más o menos lo opuesto a anexar()).

Ten en cuenta que estos son *métodos* en un objeto de lista, mientras que len() es una función que toma la lista (o la cadena o lo que sea) como argumento.

list = [ 'larry' , 'curly' , 'moe' ]
list . append ( 'shemp' ) ## append elem at end
list . insert ( 0 , 'xxx' ) ## insert elem at index 0
list . extend ([ 'yyy' , 'zzz' ]) ## add list of elems at end
print ( list ) ## ['xxx', 'larry', 'curly', 'moe', 'shemp', 'yyy', 'zzz']
print ( list . index ( 'curly' )) ## 2

list . remove ( 'curly' ) ## search and remove that element
list . pop ( 1 ) ## removes and returns 'larry'
print ( list ) ## ['xxx', 'moe', 'shemp', 'yyy', 'zzz']

Error común: Ten en cuenta que los métodos anteriores no *devuelven* la lista modificada, solo modifican la lista original.

list = [ 1 , 2 , 3 ]
print ( list . append ( 4 )) ## NO, does not work, append() returns None
## Correct pattern:
list . append ( 4 )
print ( list ) ## [1, 2, 3, 4]

Creación de listas

Un patrón común es iniciar una lista como la lista vacía [] y, luego, usar add() o extend() para agregarle elementos:

list = [] ## Start as the empty list
list . append ( 'a' ) ## Use append() to add elements
list . append ( 'b' )

Enumerar Slices

Las Slices funcionan en listas al igual que con las cadenas y también se pueden usar para cambiar subpartes de la lista.

list = [ 'a' , 'b' , 'c' , 'd' ]
print ( list [ 1 : - 1 ]) ## ['b', 'c']
list [ 0 : 2 ] = 'z' ## replace ['a', 'b'] with ['z']
print ( list ) ## ['z', 'c', 'd']

Ejercicio: list1.py

Para practicar el material de esta sección, prueba los problemas en list1.py que no usan ordenación (en los Ejercicios básicos ).

Salvo que se indique lo contrario, el contenido de esta página está sujeto a la licencia Atribución 4.0 de Creative Commons , y los ejemplos de código están sujetos a la licencia Apache 2.0 . Para obtener más información, consulta las políticas del sitio de Google Developers . Java es una marca registrada de Oracle o sus afiliados.

Última actualización: 2026-01-23 (UTC)

[[["Fácil de comprender","easyToUnderstand","thumb-up"],["Resolvió mi problema","solvedMyProblem","thumb-up"],["Otro","otherUp","thumb-up"]],[["Falta la información que necesito","missingTheInformationINeed","thumb-down"],["Muy complicado o demasiados pasos","tooComplicatedTooManySteps","thumb-down"],["Desactualizado","outOfDate","thumb-down"],["Problema de traducción","translationIssue","thumb-down"],["Problema con las muestras o los códigos","samplesCodeIssue","thumb-down"],["Otro","otherDown","thumb-down"]],["Última actualización: 2026-01-23 (UTC)"],[],[]]
