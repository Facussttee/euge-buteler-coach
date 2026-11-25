import assert from 'node:assert/strict'
import test from 'node:test'
import worker from './index.ts'

const fields = {
  name: ' Lucía ',
  email: ' lucia@example.test ',
  message: ' Quiero consultar por la mentoría. ',
}

function contactRequest(body = new URLSearchParams(fields), headers = { Accept: 'application/json' }) {
  return new Request('https://example.test/api/contacto', { method: 'POST', body, headers })
}

test('only confirms after the queue accepts the validated submission', async () => {
  const { promise, resolve } = Promise.withResolvers()
  const accepted = []
  const env = { CONTACT_QUEUE: { send: (submission) => {
    accepted.push(submission)
    return promise
  } } }
  const responsePromise = worker.fetch(contactRequest(), env)
  let responded = false
  responsePromise.then(() => { responded = true })
  await new Promise((advance) => setImmediate(advance))
  assert.equal(responded, false)
  assert.equal(accepted.length, 1)
  assert.match(accepted[0].id, /^[a-f0-9-]{36}$/)
  assert.deepEqual(
    { name: accepted[0].name, email: accepted[0].email, message: accepted[0].message },
    { name: 'Lucía', email: 'lucia@example.test', message: 'Quiero consultar por la mentoría.' },
  )
  resolve()
  const response = await responsePromise
  assert.equal(response.status, 202)
  assert.deepEqual(await response.json(), { success: true })
})

test('native success redirects with 303', async () => {
  const response = await worker.fetch(contactRequest(undefined, { Accept: 'text/html' }), {
    CONTACT_QUEUE: { send: async () => {} },
  })
  assert.equal(response.status, 303)
  assert.equal(response.headers.get('Location'), '/gracias/')
})

test('native validation failure renders an accessible link back', async () => {
  const response = await worker.fetch(contactRequest(new URLSearchParams(), { Accept: 'text/html' }), {})
  assert.equal(response.status, 400)
  assert.match(response.headers.get('Content-Type'), /^text\/html/)
  assert.match(await response.text(), /<h1>No se pudo enviar la consulta<\/h1>[\s\S]*href="\/#contacto"/)
})

test('rejects invalid, oversized, or cross-origin requests', async () => {
  const duplicate = new URLSearchParams(fields)
  duplicate.append('name', 'Otro')
  const requests = [
    [contactRequest(duplicate), 400],
    [contactRequest(new URLSearchParams({ ...fields, email: 'invalid' })), 400],
    [contactRequest(new URLSearchParams({ ...fields, message: 'x'.repeat(5001) })), 400],
    [contactRequest(new URLSearchParams({ ...fields, message: 'x'.repeat(65536) })), 413],
    [contactRequest('plain body'), 415],
    [contactRequest(undefined, { Accept: 'application/json', Origin: 'https://other.test' }), 403],
  ]

  for (const [request, status] of requests) {
    const response = await worker.fetch(request, {})
    assert.equal(response.status, status)
    assert.equal((await response.json()).success, false)
  }
})

test('the endpoint advertises POST as its only supported method', async () => {
  const response = await worker.fetch(new Request('https://example.test/api/contacto', {
    headers: { Accept: 'application/json' },
  }), {})
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('Allow'), 'POST')
  assert.equal((await response.json()).success, false)
})

test('silently discards each honeypot before trying to enqueue', async () => {
  for (const field of ['_honey', 'bot-field']) {
    const response = await worker.fetch(contactRequest(new URLSearchParams({ [field]: 'bot' })), {})
    assert.equal(response.status, 202)
    assert.deepEqual(await response.json(), { success: true })
  }
})

test('queue outage returns a retryable error and logs no submission fields', async (t) => {
  const log = t.mock.method(console, 'error', () => {})
  const response = await worker.fetch(contactRequest(), {
    CONTACT_QUEUE: { send: async () => { throw new Error('lucia@example.test') } },
  })
  assert.equal(response.status, 503)
  assert.equal((await response.json()).success, false)
  assert.equal(log.mock.calls[0].arguments[0].event, 'contact_enqueue_failed')
  assert.doesNotMatch(JSON.stringify(log.mock.calls[0].arguments), /lucia|mentor/)
})

test('serves other URL paths through the asset binding', async () => {
  const request = new Request('https://example.test/gracias/')
  const response = await worker.fetch(request, {
    ASSETS: { fetch: async (asset) => {
      assert.equal(asset, request)
      return new Response('Gracias')
    } },
  })
  assert.equal(await response.text(), 'Gracias')
})

function delivery(attempts = 1) {
  const outcomes = []
  return { outcomes, message: {
    body: { ...fields, id: 'synthetic-id', formUrl: 'https://example.test/' },
    attempts,
    ack: () => outcomes.push('ack'),
    retry: () => outcomes.push('retry'),
  } }
}

test('acks provider-confirmed submissions and retries ambiguous results without logging PII', async (t) => {
  const delivered = delivery()
  const failed = delivery(4)
  const log = t.mock.method(console, 'error', () => {})
  let calls = 0
  const provider = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ success: ++calls === 1 ? 'true' : false }))

  await worker.queue({ queue: 'euge-contact', messages: [delivered.message, failed.message] }, {})
  assert.deepEqual(delivered.outcomes, ['ack'])
  assert.deepEqual(failed.outcomes, ['retry'])
  assert.match(provider.mock.calls[0].arguments[0].href, /^https:\/\/formsubmit\.co\/ajax\//)
  const options = provider.mock.calls[0].arguments[1]
  assert.equal(options.headers.get('Referer'), 'https://example.test/')
  assert.equal(JSON.parse(options.body)._url, 'https://example.test/')
  assert.deepEqual(log.mock.calls[0].arguments[0], {
    event: 'contact_delivery_exhausted',
    queue: 'euge-contact',
    submissionId: 'synthetic-id',
    attempt: 4,
  })
})

test('supports the legacy Web3Forms key at runtime using the JSON API', async (t) => {
  const queued = delivery()
  const provider = t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true }))
  await worker.queue({ queue: 'euge-contact', messages: [queued.message] }, {
    PUBLIC_WEB3FORMS_KEY: 'mock-key',
  })
  assert.deepEqual(queued.outcomes, ['ack'])
  const [endpoint, options] = provider.mock.calls[0].arguments
  assert.equal(endpoint.href, 'https://api.web3forms.com/submit')
  assert.equal(JSON.parse(options.body).access_key, 'mock-key')
})

test('a configured endpoint takes precedence and receives only its supported form fields', async (t) => {
  const queued = delivery()
  const provider = t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true }))
  await worker.queue({ queue: 'euge-contact', messages: [queued.message] }, {
    PUBLIC_FORM_ENDPOINT: 'https://provider.example.test/contact',
    PUBLIC_WEB3FORMS_KEY: 'mock-key',
  })
  assert.deepEqual(queued.outcomes, ['ack'])
  const [endpoint, options] = provider.mock.calls[0].arguments
  assert.equal(endpoint.href, 'https://provider.example.test/contact')
  assert.equal(options.body.get('message'), fields.message)
  assert.equal(options.body.has('access_key'), false)
})

test('preview waits thirty seconds without reaching a mail provider', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const log = t.mock.method(console, 'info', () => {})
  const provider = t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true }))
  const queued = delivery()
  const consumer = worker.queue({ queue: 'euge-contact-preview', messages: [queued.message] }, {
    CONTACT_DELIVERY_MODE: 'simulate',
  })
  t.mock.timers.tick(29_999)
  assert.deepEqual(queued.outcomes, [])
  t.mock.timers.tick(1)
  await consumer
  assert.deepEqual(queued.outcomes, ['ack'])
  assert.equal(provider.mock.callCount(), 0)
  assert.equal(log.mock.calls[0].arguments[0].event, 'contact_delivery_simulated')
})
