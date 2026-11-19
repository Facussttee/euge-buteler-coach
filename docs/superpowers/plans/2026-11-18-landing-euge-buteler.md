# Plan de implementación · Sitio de Euge Buteler

**Objetivo.** Que una persona que llega desde Instagram entienda qué puede trabajar en la mentoría 1 a 1, conozca a Euge y pueda iniciar una consulta por DM o desde la web.

**Arquitectura.** Una landing estática con cuatro secciones enlazables y una página de confirmación. El contenido se publica como HTML. YouTube aloja y reproduce los videos. Netlify recibe las consultas y avisa por correo.

**Tecnologías elegidas.** Astro, TypeScript, CSS, Netlify Free, Netlify Forms, reproductor oficial de YouTube y Playwright. Las decisiones del sitio, la oferta, los canales y la dirección visual ya están acordadas. Los textos de muestra son borradores.

**Para quien implemente o revise.** Leer las tres fuentes y este plan antes de empezar. Seguir los pasos en orden y marcar las casillas solo cuando se cumpla la comprobación. Un agente con Superpowers puede usar `superpowers:executing-plans`. Los nombres de archivos técnicos indican entregables futuros. El proyecto parte de la documentación en `context/`.

## 1. Qué información usar

| Fuente del proyecto | Qué aporta | Decisión para el sitio |
|---|---|---|
| [Perfil de marketing](../../../context/perfil-marketing-euge-buteler.md) | Oferta individual, DM de Instagram, escenas de autoexigencia, bio y referencias a LinkedIn. | Fuente principal para oferta, contacto y borradores. Vincular la formación en Relaciones Públicas e Institucionales con su experiencia en comunicación y capacitación. Validar con Euge la redacción pública. |
| [Investigación de Gemini sobre sitios de coaching](../../../context/An%C3%A1lisis%20de%20Sitios%20de%20Coaching.pdf) | Las págs. 3–5 describen una secuencia de público, propuesta, funcionamiento, señales de confianza, contacto y preguntas. Las págs. 7–12 exploran video y formularios. Las págs. 13–17 analizan captación y medición. | Usar una escena concreta, una explicación breve del servicio, un video optativo y un formulario corto. El informe analiza principalmente ventas de alto valor y cita proveedores comerciales. Sus porcentajes no establecen la frecuencia de uso en todo el sector ni anticipan resultados para Euge. |
| [Perfil estratégico, catálogo y transcripciones del canal](../../../context/mar_a_eugenia_buteler_perfil_estrat_gico_metodolog_a_y_transcripciones_del_canal.html) | Reúne 38 piezas del canal y 2 registros externos según el informe. Permite ubicar temas, títulos, enlaces y ejemplos de su voz. | Priorizar piezas sobre hacerse cargo de todo, delegar y poner límites. Antes de atribuirle una cita, cotejar el video original. La ilustración editorial incluida en el HTML no es un retrato de Euge. |

**Criterio editorial.** El canal muestra qué cuenta Euge. La oferta pública se redacta a partir del perfil y de lo que ella confirme sobre su práctica actual. Por ejemplo, el HTML describe «Blueprint», meditación, Diseño Humano y explicaciones bioquímicas. Esos temas pueden orientar una selección editorial. Presentarlos como servicios, módulos o resultados de la mentoría requeriría confirmación específica. Para la primera bio alcanza con su formación y trayectoria aprobadas. El perfil y el informe usan cifras distintas de antigüedad, así que la primera versión prescinde del número.

**Alcance de la primera versión.** Una mentoría, dos vías para iniciar la misma conversación y una playlist pública. Reservas, pagos, CRM, chatbot, cuestionario de admisión y captación de correos para campañas quedan fuera del encargo. El formulario sirve para responder la consulta. La formación profesional y la voz de Euge aportan las primeras señales de confianza. Incorporar testimonios únicamente si hay material real y autorización para ese uso.

## 2. Vistas, contenido e imágenes

| Orden y destino | Qué tiene que poder entender o hacer la persona | Contenido, diseño y material |
|---|---|---|
| 1. Portada · `/` | Identificar la mentoría y consultar desde el primer bloque. | H1 borrador: «Cuando ya sabés qué querés cambiar, pero seguís reaccionando igual». Bajada: «Mentoría 1 a 1 con Euge Buteler para personas que hacen mucho, consiguen resultados y quieren disfrutar más de lo que construyen». Botón **Consultá por la mentoría** con aclaración **Por Instagram**. Enlace secundario **Conocé cómo trabajo** hacia la mentoría. Retrato vertical de Euge a la derecha en escritorio. En celular, título, bajada, acciones y foto. |
| 2. Mentoría · `/#mentoria` | Reconocer una situación, entender qué se puede trabajar y cómo empezar. | Abrir con «Delegás una tarea y volvés a intervenir apenas alguien la resuelve de otra manera». Sumar el descanso pendiente y la dificultad para disfrutar un logro. Conectar cada escena con una acción posible, como hacer una pausa antes de retomar la tarea. Explicar que el primer paso es escribirle. Composición tipográfica, sin imagen. |
| 3. Sobre Euge · `/#sobre-euge` | Saber quién acompaña y reconocer su estilo. | Bio en primera persona, de 60 a 90 palabras como orientación. Partir del borrador de «Sobre Euge» en el perfil. Describir su forma cercana y directa con un ejemplo aprobado. Acompañar con una foto horizontal de ella en su espacio de trabajo. Si hay un único retrato, usarlo en portada. |
| 4. Videos · `/#videos` | Escuchar a Euge, reproducir un video y pasar al siguiente dentro del sitio. | Portada horizontal local, título **Videos de Euge**, botón **Ver videos de Euge** y enlace **Ver en YouTube**. El reproductor ocupa el lugar de la portada cuando la persona lo activa. Usar una placa tipográfica o un fotograma autorizado que represente al conjunto. |
| 5. Contacto · `/#contacto` | Elegir cómo escribirle. | Repetir el botón de Instagram. Debajo, mostrar **También podés escribirme desde acá**, los tres campos y **Enviar consulta**. Usar una sola columna en celular y fondo liso. En el pie, mostrar el nombre de Euge y el enlace identificable a su perfil. |
| 6. Confirmación · `/gracias/` | Entender que se recibió la consulta y cómo llegará la respuesta. | Mensaje propuesto: «Recibimos tu consulta. Euge puede responderte al correo que dejaste». Enlace **Volver al inicio**. Sin imagen. Excluir de indexación. |

**Navegación.** Encabezado con el nombre «Euge Buteler» enlazado al inicio y enlaces Mentoría, Sobre Euge, Videos y Contacto. En pantallas angostas, permitir que los enlaces se acomoden en una segunda fila. Dar a cada sección un título visible y conservar las anclas al compartir o recargar la URL. Agregar preguntas frecuentes al cierre de Mentoría cuando existan respuestas aprobadas sobre modalidad, duración y primer encuentro. Omitir el bloque completo mientras esté vacío.

**Identidad visual.** Fondo marfil `#FAF6EF`, texto carbón `#292522` y terracota oscuro `#873F31` para acciones. Source Serif 4 en títulos y DM Sans en el cuerpo, alojadas localmente con sus licencias. Texto base de 16 px como mínimo. Revisar contraste, foco, subrayado de enlaces dentro de párrafos y espaciado táctil sobre los colores finales.

**Pedido de imágenes a Euge.** Solicitar un retrato vertical con luz natural y aire alrededor del rostro, una foto horizontal en su espacio y, si quiere, un fotograma de portada. Registrar para qué uso autoriza cada imagen, incluida la vista previa al compartir la página. Crear derivados responsivos y definir sus dimensiones antes de la carga. Dar prioridad al retrato inicial y diferir la segunda foto. Verificar el recorte en celular. Si faltan fotos, usar portada tipográfica, bio con texto y placa de video. Esta variante también debe quedar lista para publicar.

## 3. Contratos de contacto y video

### Consulta por Instagram y formulario

- Resolver los botones de Instagram desde un único destino de DM, inicialmente `https://ig.me/m/eugebuteler.coach`. Verificar en celular y escritorio que abre el destinatario correcto. Mantener el identificador visible y un [acceso al perfil](https://www.instagram.com/eugebuteler.coach/) si Instagram solicita iniciar sesión.
- Registrar en Netlify un formulario HTML estático llamado `consulta-mentoria`. Usar método POST, destino nativo `/gracias/` y campo trampa antispam. Habilitar la detección de formularios antes del despliegue de prueba.
- Solicitar **Nombre**, **Correo electrónico** y **¿Qué te gustaría consultar?**, todos obligatorios. Usar nombres de campo estables `name`, `email`, `message`, etiquetas visibles, autocompletado para nombre y correo y validación de formato del correo. Agregar una nota breve sobre el uso de los datos para responder. La casilla receptora se configura en Netlify.
- Con JavaScript, validar, indicar **Enviando…** y bloquear el doble clic durante esa solicitud. Enviar el formulario con su identificador y campos al procesador de Netlify. Navegar a `/gracias/` tras una respuesta satisfactoria. Ante error de red o rechazo, conservar los valores, anunciar el error y habilitar **Reintentar**. Sin JavaScript, mantener el envío nativo. [Configuración de formularios](https://docs.netlify.com/manage/forms/setup/)
- Euge debe poder responder al correo ingresado por la persona. Configurar las notificaciones en una casilla confirmada que controle. La prueba funcional requiere comprobar la entrada en el panel y la llegada al correo con un envío de prueba acordado. [Notificaciones de Netlify](https://docs.netlify.com/manage/forms/notifications/)

### Reproducción de YouTube dentro de la web

1. Pedir a Euge una playlist pública que ella controle. Proponer este orden inicial: [Entenderte no es cambiar](https://www.youtube.com/watch?v=MXerPbI7n6E) presenta el enfoque, [¿Y si no necesitás organizarte mejor?](https://www.youtube.com/watch?v=morOs8tyx9c) aborda la agenda y [Sentís que si vos no empujás, nada funciona?](https://www.youtube.com/watch?v=hPi-R-CJp3Q) amplía el tema de la delegación. Los títulos y enlaces provienen del catálogo local. Verificar disponibilidad, subtítulos e inserción antes de publicar.
2. Guardar el identificador público de la playlist en la configuración del sitio. Tras activar la portada, montar el reproductor oficial con el identificador de lista, controles y permiso de pantalla completa. Reservar espacio en proporción 16:9 y una altura mínima de 200 px en celular. Dar al reproductor un título accesible y trasladarle el foco al reemplazar el botón.
3. Si todavía falta el identificador, cargar el video de respaldo `MXerPbI7n6E`. El enlace externo siempre apunta al contenido activo, playlist o video individual. Si el navegador bloquea el reproductor, conservar a la vista ese enlace y el acceso a Contacto. Con JavaScript desactivado, ofrecer el enlace desde el primer render. [Reproductor oficial de YouTube](https://developers.google.com/youtube/player_parameters)
4. Euge administrará títulos, orden y selección en YouTube. Agregar o reordenar videos dentro de la misma lista debe reflejarse al recargar el reproductor sin editar el sitio. Cambiar de playlist completa requiere actualizar su identificador. Se usa el reproductor oficial de listas, que funciona sin clave de YouTube Data API.

## 4. Implementación paso a paso

Las siguientes etapas describen trabajo futuro. En cada etapa funcional, definir primero la comprobación, implementarla y repetirla. Si se inicializa Git para el desarrollo, cerrar cada entrega verificada con un commit enfocado.

### Paso 1 · Preparar textos y materiales

- [ ] Armar el borrador siguiendo las seis filas de la sección 2. Usar voseo, una oferta y la misma invitación a consultar en portada y cierre.
- [ ] Pedir a Euge una revisión conjunta de bio, formación, oferta actual, primer contacto, respuestas frecuentes y permisos de imagen. Pedir casilla receptora y playlist. Conservar lo pendiente fuera del contenido público.
- [ ] **Comprobación:** cada afirmación sobre el servicio se puede rastrear al perfil o a una respuesta de Euge. La maqueta puede arrancar con los borradores, el video de respaldo y la variante tipográfica.

### Paso 2 · Construir la estructura navegable

- [ ] Crear la base Astro estática. Usar `src/pages/index.astro` para la landing y `src/pages/gracias.astro` para la confirmación. Compartir idioma `es-AR`, tipografías y metadatos mediante un layout.
- [ ] Centralizar contenido, enlaces, referencias de fotos, ID opcional de playlist y video de respaldo en `src/data/site.ts`. El HTML solo debe publicar el contenido seleccionado para el sitio. Mantener las investigaciones fuera del directorio público.
- [ ] **Comprobación:** `npm run build` genera ambas rutas en `dist/`. Abrir directamente cada ancla y volver al inicio desde la confirmación. Verificar que los enlaces y el contenido principal se usan con JavaScript desactivado.

### Paso 3 · Aplicar diseño y fotos

- [ ] Implementar la paleta, tipografía y composición de la sección 2 en CSS compartido. Agregar enlace para saltar al contenido, foco visible y textos alternativos que describan las fotos relevantes.
- [ ] Optimizar fotos con las herramientas de imagen de Astro. Preparar la tarjeta para compartir con nombre, mentoría y foto autorizada o composición tipográfica.
- [ ] **Comprobación:** revisar a 360, 768 y 1440 px y con zoom al 200 %. En celular, la acción principal precede a la foto. No se corta el rostro, ningún campo produce desplazamiento horizontal y todos los enlaces pueden activarse con teclado. Revisar también la variante sin imágenes. [Criterios de interfaz](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)

### Paso 4 · Conectar los canales de consulta

- [ ] Implementar `src/components/ContactForm.astro` según el contrato de la sección 3. Reutilizar la misma configuración de DM para ambas invitaciones.
- [ ] En Playwright, comprobar campos obligatorios, rechazo de correo inválido, un solo envío ante doble clic, confirmación ante aceptación y conservación del mensaje ante error. Interceptar el envío en pruebas automatizadas para evitar consultas ficticias en la bandeja.
- [ ] **Comprobación:** probar el DM en el navegador interno de Instagram y en escritorio. Hacer la prueba real de recepción en Netlify de la sección 3, incluido el envío HTML con JavaScript desactivado. Un éxito simulado en local solo verifica la interfaz.

### Paso 5 · Integrar la playlist

- [ ] Implementar `src/components/YouTubePlaylist.astro` con tres entradas: ID opcional de playlist, ID del video de respaldo y portada local. Mostrar exactamente un reproductor en el espacio del video.
- [ ] Probar con y sin playlist. Verificar que el navegador no solicita recursos de YouTube antes de la interacción, que el teclado permite activar la portada y que el enlace alternativo funciona al bloquear el iframe.
- [ ] **Comprobación:** en una playlist de prueba con dos videos que permitan inserción, reproducir ambos dentro de la página. Reordenarlos en YouTube y verificar el nuevo orden tras recargar. Hacer además una prueba manual en celular. Para producción, usar la lista que Euge confirme o el respaldo previsto.

### Paso 6 · Revisar, publicar y entregar

- [ ] Configurar un proyecto Netlify Free con comando `npm run build` y directorio de publicación `dist/`. Probar primero `eugebutelercoach.netlify.app` y luego `euge-buteler-coach.netlify.app` si el primero está ocupado. Si ambos están tomados, presentar opciones antes de difundir la URL. El presupuesto de lanzamiento es cero. Revisar la cuota vigente al configurar la cuenta. [Plan de hosting](https://www.netlify.com/pricing/) · [Dirección de producción](https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/)
- [ ] Configurar HTTPS, idioma, título «Euge Buteler | Mentoría 1 a 1», descripción aprobada, URL canónica de producción y vista previa al compartir. Marcar `/gracias/` y las vistas de prueba con `noindex`.
- [ ] Ejecutar `npm run check` (validación de Astro y TypeScript), `npm run build` y `npx playwright test`. En la URL de prueba recorrer la experiencia completa desde Instagram, reproducir un video, enviar la consulta y confirmar que se puede responder. Registrar por separado qué se verificó en navegador y qué se verificó en el proveedor.
- [ ] **Salida pública:** comprobar textos aprobados, canal de DM correcto y recepción real de consultas. Resolver las fotos y la playlist con el material autorizado o los respaldos acordados. Comprobar el enlace al inicio y la tarjeta de la URL final.
- [ ] **Entrega a Euge y Facu:** indicar quién controla el hosting y la casilla, dónde ver una consulta que no llegó por correo, cómo reordenar la playlist, cómo reemplazar fotos o textos y cómo restaurar el último despliegue funcional. Para evaluar los primeros resultados, contar consultas reales por formulario y las que Euge identifique como provenientes de la web en Instagram. Registrar como desconocido el origen que no se pueda atribuir.

## 5. Criterios para la revisión final

| Si ocurre esto | El resultado esperado es |
|---|---|
| Una persona llega desde Instagram con poco tiempo. | Puede identificar a Euge, la oferta y la vía de contacto en el primer bloque. |
| Euge todavía no entregó fotos ni playlist. | La portada tipográfica funciona, la bio conserva su lugar y el video de respaldo se puede ver. |
| YouTube bloquea la inserción o la persona usa teclado. | Hay un enlace al contenido en YouTube, foco visible y acceso a la sección siguiente. |
| La conexión se corta durante el envío o la persona toca el botón dos veces. | El texto sigue disponible ante el fallo, el reintento es explícito y el doble clic genera una sola solicitud en curso. |
| El formulario en pantalla parece funcionar. | El responsable puede rastrear una prueba real desde el sitio desplegado hasta el panel de Netlify y el correo receptor. |

El nombre gratuito del sitio está sujeto a disponibilidad. La aprobación de las frases atribuidas a Euge, las imágenes, la playlist y la casilla receptora quedan a cargo de ella. Facu puede avanzar con la maqueta y revisar cada etapa usando este documento.

## 6. Primera versión local

- [x] Landing estática y página de confirmación implementadas. Textos, destinos y video en `src/data/site.ts`.
- [x] Portada tipográfica, diseño adaptable y tarjeta para compartir. La revisión en Chromium cubrió 360, 768 y 1440 px.
- [x] Contacto por Instagram, formulario HTML y mejoras de envío probados con respuestas simuladas. El envío queda deshabilitado en la vista local porque el servidor estático puede devolver un 200 sin procesar el formulario. Se habilita en el build de Netlify.
- [x] Activación del reproductor con teclado, enlace de respaldo y reproducción del video individual verificados en Chromium. La configuración contempla una playlist pública.
- [x] `npm run check`, `npm run build` y ocho pruebas de Playwright completadas. Verificación adicional del HTML bajo variables de producción.
- [ ] Revisar textos y materiales con Euge. Configurar Netlify, confirmar casilla, verificar DM y probar recepción real y playback en el sitio desplegado.

El proyecto empezó en la carpeta compartida, sin repositorio Git. El plan y el [README](../../../README.md) conservan las decisiones y los pasos para retomar el trabajo.
