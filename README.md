# Web de Euge Buteler

Landing estática de mentoría 1 a 1. Astro genera HTML y sirve el CSS y las tipografías locales. Los videos se reproducen con el reproductor oficial de YouTube.

## Vista local

Usá Node.js 24 y npm. Desde la raíz del proyecto, ejecutá `npm ci` y `npm run dev`. Astro indica la URL local en la terminal.

`npm run check` valida los tipos y `npm run build` genera el sitio en `dist/`. Para probarlo con Chromium, instalá el navegador una vez con `npx playwright install chromium --only-shell` y ejecutá `npm test`. Las pruebas simulan la respuesta del proveedor del formulario.

## Editar el sitio

- Los borradores, enlaces de contacto y configuración del video están en `src/data/site.ts`.
- El recuadro de videos recorre los títulos de `site.video.videos` en orden. Para sumar la playlist pública como una opción más, guardá su identificador en `site.video.playlistId` y volvé a compilar. Euge puede actualizar el contenido de esa lista desde YouTube.
- La portada usa `src/assets/euge-buteler.png`, el retrato en blanco y negro con blazer. Astro genera versiones responsivas en el build. La tarjeta para compartir está en `public/compartir.png`.

Para la portada, usar el original del retrato de perfil con blazer blanco en formato 4:5. Para **Sobre mí**, usar la foto al aire libre del carrusel fijado, idealmente el original limpio del retrato frente al lago. La foto junto a la mesa de madera es una alternativa más cálida para esa sección. [Retrato de perfil](https://www.instagram.com/eugebuteler.coach/) · [Foto del lago](https://www.instagram.com/eugebuteler.coach/p/DdHSSD9FsmK/) · [Foto de la mesa](https://www.instagram.com/eugebuteler.coach/p/Dc0p8lAHFLB/)

## Antes de publicar

1. Revisar los textos y el contenido audiovisual con Euge. Confirmar qué casilla va a recibir las consultas.
2. Conectar el repositorio a Cloudflare Pages / Workers con comando de compilación `npm run build` y directorio de salida `dist`.
3. El formulario envía las consultas directamente a `eugebutelercoach@gmail.com` mediante FormSubmit. En el primer envío real, FormSubmit mandará un correo de verificación a esa casilla para activar el formulario con un clic (`Activate Form`). Opcionalmente, podés sobreescribir el destino con `PUBLIC_WEB3FORMS_KEY` o `PUBLIC_FORM_ENDPOINT` en las variables de entorno de Cloudflare.
4. Enviar una consulta de prueba acordada y comprobar que llega a la casilla configurada.
5. Desde un celular, probar el DM, la reproducción y el enlace a YouTube. Abrir también la tarjeta al compartir la URL pública.

## Formulario de contacto (FormSubmit)

- **Causa raíz del retardo y falsos errores (R1):** FormSubmit (`https://formsubmit.co/ajax/...`) ejecuta las validaciones antispam y el envío SMTP de forma síncrona dentro de la petición HTTP detrás de Cloudflare antes de devolver cabeceras (demoras medidas de 18–55 s y >100 s bajo carga). Como el cuerpo del `POST` llega en <0.3 s, `submissions@formsubmit.co` sí despacha el correo, pero si Cloudflare corta la espera con `504`/`524` (cuyas páginas de error no incluyen cabeceras CORS) o el WebView móvil cierra el socket inactivo, `fetch()` rechazaba hacia el bloque `catch` mostrando `"No se pudo enviar…"` y `"Reintentar"`.
- **Corrección implementada (`src/components/ContactForm.astro`):**
  - Verificación temprana de `navigator.onLine === false` antes de iniciar el envío.
  - Cuerpo `URLSearchParams` con `Accept: application/json` (petición CORS simple sin preflight `OPTIONS`), omitiendo `_next` en el envío AJAX mientras se conserva `<input type="hidden" name="_next" ...>` en HTML para el fallback sin JavaScript.
  - `keepalive: byteLength <= 60_000` para que el navegador complete el `POST` en segundo plano si la página navega antes de recibir respuesta.
  - Ventana de gracia acotada (`SUBMIT_HANDOFF_MS = 8000` ms) controlada con `settled`: si la respuesta llega dentro de los 8 s se valida `!response.ok` y un objeto JSON no nulo sin `success: false | 'false'`; si supera los 8 s sin fallar, se redirige a `/gracias/` sin abortar la petición `keepalive` y se ignoran rechazos tardíos posteriores a la transición.

[Plan de implementación](docs/superpowers/plans/2026-11-18-landing-euge-buteler.md) · [Cloudflare Pages](https://developers.cloudflare.com/pages/)
