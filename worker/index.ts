const CONTACT_PATH = '/api/contacto'
const MAX_BODY_BYTES = 64 * 1024
const MAX_RETRIES = 3
const SUBJECT = 'Nueva consulta de mentoría 1 a 1 — Euge Buteler'
const DEFAULT_ENDPOINT = 'https://formsubmit.co/ajax/eugebutelercoach@gmail.com'
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const PREVIEW_QUEUE = 'euge-contact-preview'
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

type Contact = { name: string; email: string; message: string }
type Submission = Contact & { id: string; formUrl: string }
type DeliveryMessage = {
  body: Submission
  attempts: number
  ack(): void
  retry(): void
}
type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> }
  CONTACT_QUEUE: { send(submission: Submission): Promise<unknown> }
  CONTACT_DELIVERY_MODE?: string
  CONTACT_FORM_ENDPOINT?: string
  CONTACT_WEB3FORMS_KEY?: string
  PUBLIC_FORM_ENDPOINT?: string
  PUBLIC_WEB3FORMS_KEY?: string
}

function acceptsJson(request: Request) {
  return request.headers.get('Accept')?.split(',').some((entry) => {
    const [mediaType, ...parameters] = entry.split(';')
    return mediaType.trim().toLowerCase() === 'application/json' &&
      !parameters.some((parameter) => /^\s*q\s*=\s*0(?:\.0*)?\s*$/i.test(parameter))
  }) ?? false
}

function reply(request: Request, status: number, message?: string) {
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Accept' })
  if (status === 405) headers.set('Allow', 'POST')
  if (acceptsJson(request)) {
    return Response.json(message ? { success: false, error: message } : { success: true }, { status, headers })
  }
  if (!message) {
    headers.set('Location', '/gracias/')
    return new Response(null, { status: 303, headers })
  }
  headers.set('Content-Type', 'text/html; charset=utf-8')
  return new Response(`<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>No se pudo enviar la consulta | Euge Buteler</title>
</head>
<body>
<main>
<h1>No se pudo enviar la consulta</h1>
<p>${message}</p>
<p><a href="/#contacto">Volver al formulario</a></p>
</main>
</body>
</html>`, { status, headers })
}

async function readForm(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) return new URLSearchParams()

  const decoder = new TextDecoder()
  let bytes = 0
  let body = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      bytes += value.byteLength
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {})
        return null
      }
      body += decoder.decode(value, { stream: true })
    }
    return new URLSearchParams(body + decoder.decode())
  } finally {
    reader.releaseLock()
  }
}

function parseContact(form: URLSearchParams): Contact | null {
  const [name] = form.getAll('name')
  const [email] = form.getAll('email')
  const [message] = form.getAll('message')
  if (['name', 'email', 'message'].some((field) => form.getAll(field).length !== 1)) return null

  const contact = { name: name.trim(), email: email.trim(), message: message.trim() }
  if (
    !contact.name || contact.name.length > 120 ||
    contact.email.length > 254 || !EMAIL_PATTERN.test(contact.email) ||
    !contact.message || contact.message.length > 5000
  ) return null

  return contact
}

async function receiveContact(request: Request, env: Env) {
  if (request.method !== 'POST') return reply(request, 405, 'Usá el formulario de contacto para enviar tu consulta.')

  const origin = request.headers.get('Origin')
  if (origin && origin !== new URL(request.url).origin) {
    return reply(request, 403, 'Abrí el formulario de contacto desde esta página.')
  }

  const contentType = request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()
  if (contentType !== 'application/x-www-form-urlencoded') {
    return reply(request, 415, 'El formato de la consulta es inválido.')
  }

  let form: URLSearchParams | null
  try {
    form = await readForm(request)
  } catch {
    return reply(request, 400, 'No pudimos leer tu consulta. Volvé al formulario y probá de nuevo.')
  }
  if (!form) return reply(request, 413, 'La consulta es demasiado larga. Acortá el mensaje y volvé a intentar.')
  if (['_honey', 'bot-field'].some((field) => form.getAll(field).some(Boolean))) {
    return reply(request, 202)
  }

  const contact = parseContact(form)
  if (!contact) return reply(request, 400, 'Revisá el nombre, el correo y el mensaje.')

  const submission = { ...contact, id: crypto.randomUUID(), formUrl: new URL('/', request.url).href }
  try {
    await env.CONTACT_QUEUE.send(submission)
  } catch {
    console.error({ event: 'contact_enqueue_failed', submissionId: submission.id })
    return reply(request, 503, 'Por ahora no pudimos recibir tu consulta. Volvé al formulario y probá de nuevo en unos minutos.')
  }
  return reply(request, 202)
}

async function deliverContact(submission: Submission, env: Env, queue: string) {
  if (queue === PREVIEW_QUEUE || env.CONTACT_DELIVERY_MODE === 'simulate') {
    await new Promise((resolve) => setTimeout(resolve, 30_000))
    console.info({ event: 'contact_delivery_simulated', submissionId: submission.id })
    return
  }

  const configuredEndpoint = env.CONTACT_FORM_ENDPOINT || env.PUBLIC_FORM_ENDPOINT
  const accessKey = env.CONTACT_WEB3FORMS_KEY || env.PUBLIC_WEB3FORMS_KEY
  const endpoint = new URL(configuredEndpoint || (accessKey ? WEB3FORMS_ENDPOINT : DEFAULT_ENDPOINT))
  if (endpoint.protocol !== 'https:') throw new Error('invalid_provider_config')

  const { name, email, message, formUrl } = submission
  const web3Forms = endpoint.origin === 'https://api.web3forms.com'
  const formSubmit = endpoint.origin === 'https://formsubmit.co'
  const useJson = web3Forms || formSubmit
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': useJson ? 'application/json' : 'application/x-www-form-urlencoded',
  })
  if (useJson) headers.set('Referer', formUrl)

  const fields: Record<string, string> = { name, email, message }
  if (web3Forms) {
    if (!accessKey && !endpoint.pathname.startsWith('/submit/')) throw new Error('missing_web3forms_key')
    fields.subject = SUBJECT
    if (accessKey) fields.access_key = accessKey
  } else {
    fields._subject = SUBJECT
    fields._template = 'table'
    fields._captcha = 'false'
    if (formSubmit) fields._url = formUrl
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: useJson ? JSON.stringify(fields) : new URLSearchParams(fields),
    redirect: 'error',
    signal: AbortSignal.timeout(130_000),
  })

  if (!response.ok) {
    await response.body?.cancel()
    throw new Error('provider_http_error')
  }
  const result: unknown = await response.json()
  if (
    !result || typeof result !== 'object' || !('success' in result) ||
    (result.success !== true && result.success !== 'true')
  ) throw new Error('provider_rejected')
}

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url)
    if (pathname === CONTACT_PATH || pathname === CONTACT_PATH + '/') return receiveContact(request, env)
    return env.ASSETS.fetch(request)
  },
  async queue(batch: { queue: string; messages: readonly DeliveryMessage[] }, env: Env) {
    await Promise.all(batch.messages.map(async (message) => {
      try {
        await deliverContact(message.body, env, batch.queue)
        message.ack()
      } catch {
        console.error({
          event: message.attempts > MAX_RETRIES ? 'contact_delivery_exhausted' : 'contact_delivery_retry',
          queue: batch.queue,
          submissionId: message.body.id,
          attempt: message.attempts,
        })
        message.retry()
      }
    }))
  },
}
