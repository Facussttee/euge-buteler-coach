# Web de Euge Buteler

Landing estática de mentoría 1 a 1. Astro genera HTML y sirve el CSS y las tipografías locales. Los videos se reproducen con el reproductor oficial de YouTube.

## Vista local

Usá Node.js 24 y npm. Desde la raíz del proyecto, ejecutá `npm ci` y `npm run dev`. Astro indica la URL local en la terminal.

`npm run check` valida los tipos y `npm run build` genera el sitio en `dist/`. Para probarlo con Chromium, instalá el navegador una vez con `npx playwright install chromium --only-shell` y ejecutá `npm test`. Las pruebas de navegador simulan la recepción de la consulta. Las pruebas del Worker verifican el guardado y la entrega por separado.

## Editar el sitio

- Los borradores, enlaces de contacto y configuración del video están en `src/data/site.ts`.
- El recuadro de videos recorre los títulos de `site.video.videos` en orden. Para sumar la playlist pública como una opción más, guardá su identificador en `site.video.playlistId` y volvé a compilar. Euge puede actualizar el contenido de esa lista desde YouTube.
- La portada usa `src/assets/euge-buteler.png`, el retrato en blanco y negro con blazer. Astro genera versiones responsivas en el build. La tarjeta para compartir está en `public/compartir.png`.

Para la portada, usar el original del retrato de perfil con blazer blanco en formato 4:5. Para **Sobre mí**, usar la foto al aire libre del carrusel fijado, idealmente el original limpio del retrato frente al lago. La foto junto a la mesa de madera es una alternativa más cálida para esa sección. [Retrato de perfil](https://www.instagram.com/eugebuteler.coach/) · [Foto del lago](https://www.instagram.com/eugebuteler.coach/p/DdHSSD9FsmK/) · [Foto de la mesa](https://www.instagram.com/eugebuteler.coach/p/Dc0p8lAHFLB/)

## Probar el formulario completo

1. Ejecutá `npm run build` y `npx wrangler dev --env preview`. Abrí la URL que indique Wrangler. Este entorno usa colas locales y simula un correo que tarda 30 segundos. El botón debe llevarte a «Gracias» apenas la cola reciba la consulta.
2. Ejecutá `npm run check` y `npm test` para verificar el proyecto. `npm run dev` sirve para editar la landing. Para probar el endpoint real en tu máquina, usá la URL de Wrangler.

## Publicar en Cloudflare Workers

1. Compilá con `npm run build`. Configurá el despliegue como Worker con recursos estáticos usando `wrangler.jsonc`. El formulario necesita que el Worker atienda `POST /api/contacto`.
2. Prepará las colas definidas en la configuración con `npx wrangler queues create NOMBRE` para cada cola faltante. Producción usa `euge-contact` y `euge-contact-dlq`. Las pruebas remotas usan `euge-contact-preview` y `euge-contact-preview-dlq`. Para probar toda la cadena en el entorno aislado, desplegá con `npx wrangler deploy --env preview`.
3. El consumidor de producción usa FormSubmit para enviar a `eugebutelercoach@gmail.com`. Confirmá la casilla y la activación de FormSubmit antes de habilitar tráfico. Para cambiar de proveedor, configurá `CONTACT_FORM_ENDPOINT` o la clave `CONTACT_WEB3FORMS_KEY` en el entorno **de ejecución** del Worker. También se admiten sus nombres anteriores `PUBLIC_FORM_ENDPOINT` y `PUBLIC_WEB3FORMS_KEY`. El endpoint tiene prioridad y debe confirmar con HTTP 2xx y JSON con `success: true` o `success: "true"`.
4. Al publicar, verificá con una consulta acordada que el sitio confirme la recepción y que el correo llegue a la casilla elegida.

## Recuperar una consulta pendiente

El sitio confirma una vez que Cloudflare guarda la consulta en la cola. El consumidor reintenta el aviso por correo si el proveedor falla. Después de tres reintentos, Cloudflare deriva la consulta a la cola de fallos. Revisá el evento `contact_delivery_exhausted` en Workers Logs y los mensajes pendientes en `euge-contact-dlq`. Recuperá el mensaje antes de que venza la retención configurada y verificá en la casilla si ya llegó antes de reenviarlo. Un proveedor que recibió el correo pero perdió la respuesta puede generar un aviso duplicado.
