# FastyFood

Primera versión del menú digital, preparada para Cloudflare Pages y Sanity Studio.

## Estado actual

- Menú funcional en la PC: 42 productos, 7 categorías, 3 promociones y 5 videos.
- Precios transcritos del material entregado y confirmados como actuales por el dueño.
- Búsqueda, categorías, detalle de productos, promociones, reproducción de video y enlaces de WhatsApp.
- Panel Sanity preparado y compilado; todavía no está conectado a una cuenta o base de datos real.
- Web preparada para publicar; todavía no existe una publicación verificada en fastyfood.pages.dev.
- El nombre fastyfood está sujeto a disponibilidad en Cloudflare.
- Teléfono tomado de la publicidad: 11 2333-7893. No se inventaron dirección ni horarios.
- Hay una ambigüedad en el original: “Smash Doble Cebolla” dice “medallón” en singular en la descripción. Se conservó sin inventar cantidad o ingredientes. Conviene revisar esa descripción antes de publicar.

## Vista previa

Requiere Node.js 22.12 o superior. Desde esta carpeta:

```text
npm run dev
```

Abrir http://127.0.0.1:4173. La vista previa solo se puede abrir desde esta PC. No es un enlace para clientes.

## Activación de Sanity (una sola vez)

1. Iniciar sesión o crear una cuenta en https://www.sanity.io/manage. La aceptación de condiciones y cualquier credencial la maneja el dueño.
2. Crear un proyecto en el plan gratuito, con dataset público `production`. Solo almacenaremos datos destinados al menú público.
3. Elegir un nombre libre para el panel, por ejemplo `fastyfood-menu.sanity.studio`. El nombre del panel y el dominio del menú son independientes.
4. Desde la carpeta principal, ejecutar `npm run configure`. Pide el ID público de proyecto y la dirección del panel; no pide contraseñas ni claves.
5. Desde `studio`, ejecutar `npm ci` si no están las dependencias, y `npm run login`. El dueño completa el inicio de sesión en su navegador.
6. Desde `studio`, ejecutar `npx sanity exec import-content.mjs --with-user-token` para subir los datos y archivos iniciales a TU proyecto. El importador conserva documentos existentes y no sobrescribe cambios del panel.
7. Desde `studio`, ejecutar `npm run deploy` y confirmar el nombre del panel.
8. Agregar en Sanity los orígenes permitidos: `http://127.0.0.1:4173` y la dirección HTTPS definitiva de la web. La lectura del menú público no necesita credenciales de visitante.
9. Revisar en el panel los productos, promociones, videos y datos del local. Probar editar y publicar un producto y comprobar el resultado en la web.

Nunca colocar tokens de escritura en `public/`, en el navegador del cliente ni en `config.json`. La configuración pública solo contiene identificadores de proyecto/dataset y la dirección del panel. El inicio de sesión del panel queda a cargo de Sanity.

## Publicación en Cloudflare Pages

1. Ejecutar `npm run build` en la carpeta principal.
2. Iniciar sesión en https://dash.cloudflare.com y abrir Workers & Pages, crear un proyecto Pages y elegir carga directa de archivos. El dueño acepta cualquier condición de cuenta.
3. Solicitar el nombre `fastyfood`, sujeto a disponibilidad, y subir el contenido de `dist/` o el ZIP `fastyfood-pages.zip`.
4. Revisar el enlace que devuelve Cloudflare: es la fuente de verdad de la dirección publicada.
5. Comprobar precios, WhatsApp, videos y una edición real desde Sanity.
6. Generar el QR usando el enlace definitivo verificado. No imprimir un QR mientras el nombre no esté confirmado.
7. Usar ese enlace en WhatsApp Business y en el campo de menú del Perfil de Empresa de Google. Los datos cargados aparte en catálogos de terceros no se sincronizan con esta web automáticamente.

Después de conectar Sanity, los cambios de contenido se publican desde el panel y la web los consulta online. No es necesario volver a cargar todos los archivos en Cloudflare para cambiar un precio. El diseño o el código sí requieren una nueva publicación. La caché del servicio puede demorar brevemente la aparición de un cambio.

La web no muestra el menú inicial como respaldo si falla Sanity: informa que no pudo actualizarlo, para evitar presentar precios viejos como actuales.

## Uso diario desde la PC

- **Cambiar un precio:** Productos y precios → elegir producto → editar Precio → Publicar.
- **Agregar un producto:** Productos y precios → crear producto → completar nombre, categoría y precio → Publicar.
- **Producto agotado:** desactivar Disponible para pedir. Sigue visible con AGOTADO.
- **Ocultar un producto:** desactivar Mostrar en la web. Se conserva para reactivarlo luego.
- **Foto o video de producto:** pestaña Foto y video. Se muestra al abrir su detalle.
- **Cambiar una promoción:** Promociones → editar el precio TOTAL, cantidad, sabores y condiciones. Si la imagen tiene otro precio escrito, reemplazar también el archivo.
- **Subir una publicidad:** Publicidades en video → crear → elegir MP4 y una portada → Publicar.
- **Ordenar:** el número de Orden determina la posición; el menor va primero.
- **Cambiar teléfono, dirección, horarios o portada:** Datos del local.

Los precios dentro de una foto o un video son parte del archivo: no cambian automáticamente al editar el precio del producto. Conviene crear nuevas publicidades sin precio incrustado y mostrarlo como texto del sitio.

## Archivos y límites

- `public/`: web y copias del contenido inicial.
- `studio/`: panel Sanity, esquema e importador.
- `scripts/prepare_content.py`: preparación reproducible de los archivos originales. No modifica el material de Downloads. Si se ejecuta de nuevo, regenera el menú inicial local; no cambia los documentos de Sanity.
- `scripts/check.mjs`: comprueba referencias, precios de control, unicidad y tamaño de archivos.
- `dist/`: salida lista para Pages. Subir solo esta carpeta, no todo el proyecto.

Se optimizaron 5 videos conocidos para celular: de aproximadamente 33 MB a 12 MB en total. Se conservaron audio y contenido; no se reproducen automáticamente. Otros MP4 con nombres genéricos quedaron fuera de la primera versión hasta identificar su contenido. Los originales siguen intactos.

Cloudflare Pages y Sanity tienen planes gratuitos con cuotas. Los videos consumen transferencia; se configuró carga a pedido y no reproducción automática. Revisar consumo antes de contratar funciones o planes pagos. La disponibilidad o los límites de los servicios pueden cambiar.

El dominio propio puede conectarse después. Para conservar QRs impresos con pages.dev, mantener esa dirección funcionando o redirigirla al dominio nuevo.

## Comprobaciones

```text
npm run check
npm run build
```

La compilación del panel se verificó con un ID de proyecto de prueba únicamente como configuración de compilación. Eso no crea un proyecto Sanity y no demuestra conexión a una base real. La prueba de edición/publicación real queda pendiente hasta conectar la cuenta.

## Referencias oficiales

- Cloudflare carga directa: https://developers.cloudflare.com/pages/get-started/direct-upload/
- Cloudflare límites: https://developers.cloudflare.com/pages/platform/limits/
- Sanity planes: https://www.sanity.io/pricing
- Sanity archivos: https://www.sanity.io/docs/content-lake/assets
- Google enlace de menú: https://support.google.com/business/answer/9455840?hl=es
