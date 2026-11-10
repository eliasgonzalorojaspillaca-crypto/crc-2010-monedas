# L CRC — Registro centralizado

Este proyecto está preparado para Netlify.

## Qué hace

- Guarda los registros en Netlify Blobs, no en el navegador.
- Los datos son compartidos por todos los dispositivos que abran el sitio.
- Permite registrar, consultar y eliminar registros.
- Permite exportar e importar CSV.
- Incluye sugerencias centralizadas.

## Publicación

1. Descomprime este proyecto.
2. En Netlify crea un nuevo sitio desde archivos / deploy manual.
3. Sube la carpeta completa (debe contener `index.html`, `netlify.toml`, `package.json` y `netlify/functions/registros.mjs`).
4. Netlify instalará `@netlify/blobs` y desplegará la Function.
5. Abre la URL del sitio y prueba desde dos dispositivos.

Importante: esta versión utiliza un almacenamiento central de Netlify Blobs. Netlify documenta que los site-wide stores persisten entre deploys y pueden ser utilizados desde Functions. Las actualizaciones pueden tener propagación eventual; para las lecturas de esta aplicación se solicita consistencia fuerte.
