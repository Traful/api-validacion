# Api - Validación de Identidad

**Back** del proyecto **Validación de Identidad**.
___

### Indice

* [Alcance funcional](#afun)
* [Consideraciones](#con)
* [Variables de Entorno](#env)
* [Desarrollo (ambiente local)](#desa)
* [Deploy](#depl)
* [Documentación](#docu)
* [Recursos](#recu)

___

<div id="afun" />

## Alcance funcional:

* Llevar un registro de las solicitudes de validación de identidad de una persona utilizando el servicio de [Renaper](https://www.argentina.gob.ar/interior/renaper) (por medio de la capa de seguridad denominada API Manager).
* Llevar un registro del resultado de dichas validaciones.

***Recordar que en el flujo representado todo lo referente al font pude ser reemplazado o incluso inexistente.***

![Flujo Api](docs/flujo.svg?raw=true "Flujo Api")

La Api cuenta con la funcionalidad necesaria para *cargar* nuevas solicitudes y presentar reportes sobre el estado de las mismas.

___

<div id="con" />

## Consideraciones:

Al día de la fecha (14/11/2023) está pendiente definir la seguridad en cuanto al acceso a este Api.

Mientras no se defina, se gestó un modelo de acceso a la misma a través de la obtención de un token de seguridad (JWT), esto podría ser definitivo o podría ser reemplazado por otro tipo de solución.
___

<div id="env" />

## Variables de entorno:

|DE   |VARIABLE           |EJ                                  |OBSERVACIONES                                                                                    |
|-----|-------------------|------------------------------------|-------------------------------------------------------------------------------------------------|
|APP  |API_JWT_KEY        |example_key                         |Se utiliza para encriptar las contraseñas de los usuarios                                        |
|APP  |FRONT_HOST         |https://validacion.com.ar           |URL en la cual se expone el front que acompaña esta API                                          |
|DB   |DB_USER            |userx_db                            |Usuario de la base de datos                                                                      |
|DB   |DB_PWD             |passx_db                            |Contraseña de la base de datos                                                                   |
|DB   |DB_NAME            |namex_db                            |Nombre de la base de datos                                                                       |
|DB   |DB_SERVER          |dbx.amazonaws.com                   |Servidor de la base de datos                                                                     |
|DB   |DB_PORT            |1433                                |Puerto de escucha del servidor de la base de datos                                               |
|APIM |APIM_URL_L         |https://sm.com.ar/api-mgr/login     |End point del servicio de Api Manager para autenticarse y obtener credenciales                   |
|APIM |APIM_URL_R         |https://sm.com.ar/api-mgr/refresh   |End point del servicio de Api Manager para refrescar credenciales (Antes de los 30 mins WTF?)    |
|APIM |APIM_KEY           |12345678                            |Key del servicio de Api Manager                                                                  |
|APIM |APIM_NAME          |usernameapim                        |Usuario del servicio de Api Manager                                                              |
|APIM |APIM_PASS          |pass-123457_ljtnup                  |Contraseña del servicio de Api Manager                                                           |
|TERIN|APIM_TERIN_URL     |https://sm.com.ar/api/terin/emails/ |End point de la regla Api Manager para el uso del servicio de Terin (envío de mails)             |
|TERIN|APIM_TERIN_TEMPLATE|Validacion.html                     |Tipo de template a utilizar en los envíos de mail                                                |

___

<div id="desa" />

## Desarrollo (ambiente local):

Requiere tener instalado previamente [NodeJS](https://nodejs.org/en).

```
C:\> mkdir poyectos
C:\> cd poyectos
C:\proyectos> git clone https://gitlab.com/smg-code/smg-life/validacion-de-identidad-visual-life-back.git
C:\proyectos> cd validacion-de-identidad-visual-life-back
C:\proyectos\validacion-de-identidad-visual-life-back> npm install
C:\proyectos\validacion-de-identidad-visual-life-back> npm run dev
```

Otra opción es armar un ambiente de desarrollo dockerizado:

Requiere tener instalado previamente [Docker](https://www.docker.com/).

```
C:\> mkdir poyectos
C:\> cd poyectos
C:\proyectos> git clone https://gitlab.com/smg-code/smg-life/validacion-de-identidad-visual-life-back.git
C:\proyectos> cd validacion-de-identidad-visual-life-back
C:\proyectos\validacion-de-identidad-visual-life-back> docker build -t back-img .
C:\proyectos\validacion-de-identidad-visual-life-back> docker container run -d --name api-validacion --env-file .env -p 3001:3001 --network=mi-red back-img
```
(Opcional [--network=mi-red] si se desea utilizar con el font dockerizado)
(logicamente se recomienda utilizar docker-composer y agregar los volúmes convenientes para un entorno de desarrollo local)

___

<div id="depl" />

## Deploy:

* Contruir la imagen Docker, generar un contenedor y expornerlo a través de los servicios de aws por ej.

___

<div id="docu" />

## Documentación:

La Api se encuentra debidamente documentada ([Swagger](https://swagger.io/)), una vez desployado el proyecto (local/servicio) se puede acceder a la misma ingresando a:

[url/ip en donde se disponibiliza la api]/api/docs

![Documentación Api](docs/swagger.png?raw=true "Documentación Api")

___

<div id="recu" />

## Recursos

* Maximiliano Clerici (Desarrollo)
* Nicolas Spella (Desarrollo)
* Juan Arancibia (Desarrollo)
* Hans Araujo (Desarrollo)
* Hector Gugliermo (Externo BDT - Api Manager - Renaper)
* Matias Arguello (Interfaces - Api Manager - Terin)
* Diana Pitocco Guillen (Gestión de la Demanda)
* Danny Roman (Infraestructura)
* Marcos Orellana (Infraestructura)
* Matias Mendoza Gallardo (Infraestructura)
* Rodrigo Novoa (Seguridad Informática)
* Federico Manini (Seguridad Informática)
* Juan Etcheverry (Operaciones)
* Elias Teruel Schenfeld (Operaciones)