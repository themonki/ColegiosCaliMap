## Mapa de Colegios de Cali

Mapa implementado en Javascript para mostrar los establecimientos educativos de Santiago de Cali empleando las siguientes herramientas:

 - leaflet - para la creación del mapa y los mapas base del IDESC y otras fuentes.
 - Leaflet.GoogleMutant - plugin de leaflet para mostrar el mapa de Google Maps empleando el API de Javascript.
 - leaflet-fusesearch - plugin de leaflet para realizar búsquedas de los marcadores, que emplea a su vez Fuse.js.
 - omnivore - plugin de leaflet empleado para cargar archivos KML al mapa y utilizarlo como capas.
 - jquery - para la lógica del código.
 - tabletop.js - para leer los datos para los marcadores desde Spreadsheets de Google Drive.
 - handlebars.js - para crear los popup de manera mas dinámica.

Como fuente de información se emplea el listado de Establecimientos Educativos generado por el [Directorio Único de Establecimientos - DUE](https://sineb.mineducacion.gov.co/bcol/app). Dicha información fue ajustada y procesada, se crea una Spreadsheets de Google Drive y se [publica la hoja](https://docs.google.com/spreadsheets/d/e/2PACX-1vQji_HvDfujE0V8hI0EbW4tJkrR5wSpnVOIPvKPfjOS7zOkf-yPS63UQnQ23S5dBWDjYEERKGB6d4b5/pubhtml?gid=1011332558&single=true) para que pueda ser accedida por la aplicación.

Se emplean también el servicio WMS del IDESC de la Alcaldía de Santiago de Cali para mejorar los mapas base.

> 2019 - Implementado para la Secretaría de Educación Municipal de Santiago de Cali

