# Utilidades de Python

Source: Google's Python Class
Original URL: https://developers.google.com/edu/python/utilities
Original Path: https://developers.google.com/edu/python/utilities
Course: Python Programming

Utilidades de Python

Organiza tus páginas con colecciones

Guarda y categoriza el contenido según tus preferencias.

En esta sección, analizaremos algunos de los numerosos módulos de utilidades estándar de Python para resolver problemas comunes.

Sistema de archivos: os, os.path, shutil

Los módulos *os* y *os.path* incluyen muchas funciones para interactuar con el sistema de archivos. El módulo *shutil* puede copiar archivos.

- documentos del módulo OS

- filenames = os.listdir(dir) -- lista de nombres de archivos en esa ruta de acceso al directorio (sin incluir . y ..). Los nombres de archivo son solo los nombres que aparecen en el directorio, no sus rutas de acceso absolutas.

- os.path.join(dir, nombre de archivo): dado un nombre de archivo de la lista anterior, usa esto para unir el dir y el nombre de archivo a fin de crear una ruta de acceso

- os.path.abspath(path): dada una ruta de acceso, muestra una forma absoluta, p.ej., /home/nick/foo/bar.html

- os.path.dirname(path), os.path.basename(path) -- dado dir/foo/bar.html, muestra el dirname "dir/foo" y basename "bar.html"

- os.path.exists(path): true si existe

- os.mkdir(dir_path): hace un dir, os.makedirs(dir_path) realiza todos los dirs necesarios en esta ruta de acceso.

- openil.copy(ruta-de-origen, ruta de acceso dest): copia un archivo (deberían existir directorios de ruta de acceso de destino).

## Example pulls filenames from a dir, prints their relative and absolute paths
def printdir ( dir ):
filenames = os . listdir ( dir )
for filename in filenames :
print ( filename ) ## foo.txt
print ( os . path . join ( dir , filename )) ## dir/foo.txt (relative to current dir)
print ( os . path . abspath ( os . path . join ( dir , filename ))) ## /home/nick/dir/foo.txt

La exploración de un módulo funciona bien con las funciones integradas help() y dir() de Python. En el intérprete, ejecuta el comando “import os” y, luego, usa estos comandos para ver lo que está disponible en el módulo: dir(os), help(os.listdir), dir(os.path), help(os.path.dirname).

Ejecución de procesos externos: subproceso

El módulo *subprocess* es una forma sencilla de ejecutar un comando externo y capturar su resultado.

- documentos del módulo de subproceso

- output = subprocess.check_output(cmd, stderr=subprocess.STDOUT) -- ejecuta el comando, espera a que salga y muestra su texto de salida. El comando se ejecuta con su salida estándar y su error estándar combinados en un texto de salida único. Si falla, se genera un CalledProcessError.

- Si deseas tener más control sobre la ejecución del subproceso, consulta la clase subprocess.popen .

- También hay un subprocess.call(cmd) simple que ejecuta el comando, vuelca su resultado en tu resultado y muestra su código de error. Esto funciona si deseas ejecutar el comando, pero no necesitas capturar su resultado en tus estructuras de datos de Python.

import subprocess

## Given a dir path, run an external 'ls -l' on it --
## shows how to call an external program
def listdir ( dir ):
cmd = 'ls -l ' + dir
print ( "Command to run:" , cmd ) ## good to debug cmd before actually running it
( status , output ) = subprocess . getstatusoutput ( cmd )
if status : ## Error case, print the command's output to stderr and exit
sys . stderr . write ( output )
sys . exit ( status )
print ( output ) ## Otherwise do something with the command's output

Excepciones

Una excepción representa un error de tiempo de ejecución que detiene la ejecución normal en una línea en particular y transfiere el control al código de manejo de errores. En esta sección, solo se presentan los usos más básicos de las excepciones. Por ejemplo, un error de tiempo de ejecución podría ser que una variable que se usó en el programa no tiene un valor (ValueError .. probablemente lo hayas visto unas cuantas veces) o un error de operación de apertura de archivo porque un archivo no existe (IOError). Obtén más información en el instructivo de excepciones y consulta la lista completa de excepciones .

Si no hay código de manejo de errores (como lo hicimos hasta ahora), una excepción de tiempo de ejecución simplemente detiene el programa con un mensaje de error. Ese es un buen comportamiento predeterminado, y lo has visto muchas veces. Puedes agregar la etiqueta "Probar/excepto" estructura a tu código para manejar excepciones, como la que se muestra a continuación:

try :
## Either of these two lines could throw an IOError, say
## if the file does not exist or the read() encounters a low level error.
f = open ( filename , 'rb' )
data = f . read ()
f . close ()
except IOError :
## Control jumps directly to here if any of the above lines throws IOError.
sys . stderr . write ( 'problem reading:' + filename )
## In any case, the code then continues with the line after the try/except

La sección try: incluye el código que podría arrojar una excepción. La sección Save: contiene el código que se ejecutará si hay una excepción. Si no hay ninguna excepción, se omitirá la sección Excepto (es decir, ese código es solo para el manejo de errores, no el caso "normal" del código). Puedes obtener un puntero para el objeto de excepción con la sintaxis "excepto IOError as e: .." (e apunta al objeto de excepción).

HTTP: urllib y urlparse

El módulo *urllib.request* proporciona la recuperación de URL, lo que hace que una URL parezca un archivo desde el que puedes leer. El módulo *urlparse* puede desarmar y reunir las URL.

- Documentos del módulo urllib.request

- ufile = urllib.request.urlopen(url) -- devuelve un archivo similar a un objeto para esa URL

- text = ufile.read() -- puede leer de él, como un archivo (readlines() etc. también funciona)

- info = ufile.info() -- la metainformación para esa solicitud. info.gettype() es el tipo de MIME, p.ej., "texto/html"

- baseurl = ufile.geturl() -- obtiene la "base" URL de la solicitud, que puede ser diferente de la original debido a los redireccionamientos

- urllib.request.urlretrieve(url, nombre del archivo): descarga los datos de la URL a la ruta del archivo especificada

- urllib.parse.urljoin(baseurl, url): dada una URL que puede estar completa o no, y la baseurl de la página de la que proviene, muestra una URL completa. Utiliza geturl() para proporcionar la URL base.

Todas las excepciones se encuentran en urllib.error.

from urllib.request import urlopen

## Given a url, try to retrieve it. If it's text/html,
## print its base url and its text.
def wget ( url ):
ufile = urlopen ( url ) ## get file-like object for url
info = ufile . info () ## meta-info about the url content
if info . get_content_type () == 'text/html' :
print ( 'base url:' + ufile . geturl ())
text = ufile . read () ## read all its text
print ( text )

El código anterior funciona bien, pero no incluye el manejo de errores si una URL no funciona por algún motivo. Esta es una versión de la función que agrega lógica de prueba/excepto para imprimir un mensaje de error si falla la operación de URL.

Si
urlopen()
parece estar bloqueado, es posible que tu sistema no permita el acceso directo a algunos
direcciones HTTP. Para verificarlo, intenta recuperar la misma URL con
wget
.

curl
Si estos programas también fallan, necesitarás obtener contenido http a través de un proxy
servicio. La configuración del acceso mediante proxies no se aborda en este instructivo.

## Version that uses try/except to print an error message if the
## urlopen() fails.
def wget2 ( url ):
try :
ufile = urlopen ( url )
if ufile . info () . get_content_type () == 'text/html' :
print ( ufile . read ())
except IOError :
print ( 'problem reading url:' , url )

Ejercicio

Para practicar el sistema de archivos y el material de comandos externos, consulta el Ejercicio especial de copia . Para practicar el material de urllib, consulta el ejercicio de registro de acertijos .

Salvo que se indique lo contrario, el contenido de esta página está sujeto a la licencia Atribución 4.0 de Creative Commons , y los ejemplos de código están sujetos a la licencia Apache 2.0 . Para obtener más información, consulta las políticas del sitio de Google Developers . Java es una marca registrada de Oracle o sus afiliados.

Última actualización: 2025-07-24 (UTC)

[[["Fácil de comprender","easyToUnderstand","thumb-up"],["Resolvió mi problema","solvedMyProblem","thumb-up"],["Otro","otherUp","thumb-up"]],[["Falta la información que necesito","missingTheInformationINeed","thumb-down"],["Muy complicado o demasiados pasos","tooComplicatedTooManySteps","thumb-down"],["Desactualizado","outOfDate","thumb-down"],["Problema de traducción","translationIssue","thumb-down"],["Problema con las muestras o los códigos","samplesCodeIssue","thumb-down"],["Otro","otherDown","thumb-down"]],["Última actualización: 2025-07-24 (UTC)"],[],[]]
