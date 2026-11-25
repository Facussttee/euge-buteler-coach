import { expect, test, type Page } from '@playwright/test'

async function fillContactForm(page: Page) {
  await page.getByLabel('Nombre', { exact: true }).fill('María')
  await page.getByLabel('Correo electrónico').fill('maria@example.com')
  await page.getByLabel('¿Qué te gustaría consultar?').fill('¿Cómo es el primer encuentro?')
}

test('muestra la oferta y la navegación sin JavaScript', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('seguís reaccionando igual')
  for (const [name, id] of [
    ['Mentoría', 'mentoria'],
    ['Sobre mí', 'sobre-euge'],
    ['Videos', 'videos'],
    ['Contacto', 'contacto'],
  ]) {
    await page.getByRole('navigation').getByRole('link', { name, exact: true }).click()
    await expect(page).toHaveURL(new RegExp('#' + id + '$'))
    await expect(page.locator('#' + id)).toBeVisible()
  }
  for (const section of [page.locator('.hero'), page.locator('#contacto')]) {
    await expect(section.getByRole('link', { name: 'Escribime por Instagram' }))
      .toHaveAttribute('href', 'https://www.instagram.com/eugebuteler.coach/')
  }
  await expect(page.locator('.hero').getByRole('link', { name: /Mi YouTube.*@EugeniaButeler/ }))
    .toHaveAttribute('href', 'https://www.youtube.com/@EugeniaButeler')
  await expect(page.locator('#contacto').getByRole('link', { name: /Mi Instagram.*@eugebuteler.coach/ }))
    .toHaveAttribute('href', 'https://www.instagram.com/eugebuteler.coach/')
  await expect(page.getByRole('link', { name: 'Ver en YouTube' })).toBeVisible()
  await expect(page.getByRole('link', { name: '¿Y si no necesitás organizarte mejor?' }))
    .toHaveAttribute('href', 'https://www.youtube.com/watch?v=morOs8tyx9c')
  await expect(page.getByRole('link', { name: '¿Sentís que si vos no empujás, nada funciona?' }))
    .toHaveAttribute('href', 'https://www.youtube.com/watch?v=hPi-R-CJp3Q')
  await expect(page.locator('form')).toHaveAttribute('action', '/api/contacto')
  await expect(page.locator('.site-footer')).toContainText('v1.0.1')
  await page.close()
})

test('activa el video con teclado y mantiene el enlace externo', async ({ page }) => {
  await page.route('https://www.youtube-nocookie.com/**', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('iframe')).toHaveCount(0)
  const button = page.getByRole('button', { name: 'Reproducir video' })
  await button.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('iframe')).toHaveAttribute('src', /\/embed\/MXerPbI7n6E/)
  await expect(page.locator('iframe')).toBeFocused()
  await expect(page.getByRole('link', { name: 'Ver en YouTube' }))
    .toHaveAttribute('href', 'https://www.youtube.com/watch?v=MXerPbI7n6E')
})

test('las flechas cambian de video sin dejar el reproductor anterior abierto', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.route('https://www.youtube-nocookie.com/**', (route) => route.abort())
  await page.goto('/#videos')
  const next = page.getByRole('button', { name: 'Video siguiente' })
  const previous = page.getByRole('button', { name: 'Video anterior' })
  const frame = page.locator('.video-frame')
  await expect(frame.getByText('1 de 3')).toBeVisible()
  await page.getByRole('button', { name: 'Reproducir video' }).click()
  await expect(frame.locator('iframe')).toBeVisible()
  await next.click()
  await expect(next).toBeFocused()
  await expect(frame.locator('iframe')).toHaveCount(0)
  await expect(frame.getByText('¿Y si no necesitás organizarte mejor?')).toBeVisible()
  await expect(frame.getByText('2 de 3')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver en YouTube' }))
    .toHaveAttribute('href', 'https://www.youtube.com/watch?v=morOs8tyx9c')
  await page.getByRole('button', { name: 'Reproducir video' }).click()
  await expect(frame.locator('iframe')).toHaveAttribute('src', /\/embed\/morOs8tyx9c/)
  await previous.click()
  await previous.click()
  await expect(frame.getByText('3 de 3')).toBeVisible()
  await expect(frame.getByText('¿Sentís que si vos no empujás, nada funciona?')).toBeVisible()
  await next.click()
  await expect(frame.getByText('1 de 3')).toBeVisible()
  expect((await next.boundingBox())?.height).toBeGreaterThanOrEqual(44)
})

test('muestra una foto, la trayectoria y tres testimonios en texto', async ({ page }) => {
  await page.goto('/')
  const portrait = page.getByRole('img', { name: /Retrato de Euge Buteler/ })
  await expect(portrait).toBeVisible()
  await expect.poll(() => portrait.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
  await expect(page.locator('#sobre-euge')).toContainText('más de 20 años de experiencia')
  await expect(page.locator('#mentoria')).toContainText('fortalecer tu liderazgo')
  await expect(page.locator('#testimonios blockquote')).toHaveCount(3)
})

test('valida el correo y conserva los campos si el envío falla', async ({ page }) => {
  let submissions = 0
  await page.route('**/api/contacto', (route) => {
    submissions++
    return route.abort()
  })
  await page.goto('/')
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  const submit = page.getByRole('button', { name: 'Enviar consulta' })
  await submit.click()
  await expect(page.getByLabel('Nombre', { exact: true })).toBeFocused()
  await fillContactForm(page)
  await page.getByLabel('Nombre', { exact: true }).fill('   ')
  await submit.click()
  await expect(page.getByLabel('Nombre', { exact: true })).toBeFocused()
  expect(submissions).toBe(0)
  await fillContactForm(page)
  await page.getByLabel('Correo electrónico').fill('correo-invalido')
  await submit.click()
  await expect(page.getByLabel('Correo electrónico')).toBeFocused()
  expect(submissions).toBe(0)
  await fillContactForm(page)
  await submit.click()
  const alert = page.locator('form').getByRole('alert')
  await expect(alert).toContainText('No pudimos confirmar')
  await expect(alert.getByRole('link', { name: /escribime por Instagram/ }))
    .toHaveAttribute('href', 'https://www.instagram.com/eugebuteler.coach/')
  await expect(page.getByLabel('¿Qué te gustaría consultar?')).toHaveValue('¿Cómo es el primer encuentro?')
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
})

test('envía una sola consulta al sitio y confirma con la aceptación del registro', async ({ page }) => {
  const requests: string[] = []
  const posts: string[] = []
  let acceptHeader = ''
  let contentType = ''
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url())
  })
  await page.route(/^https:\/\//, (route) => route.abort())
  await page.route('**/api/contacto', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    acceptHeader = route.request().headers()['accept'] ?? ''
    contentType = route.request().headers()['content-type'] ?? ''
    requests.push(route.request().postData() ?? '')
    await route.fulfill({
      status: 202,
      json: { success: true },
    })
  })
  await page.goto('/')
  await fillContactForm(page)
  await page.getByRole('button', { name: 'Enviar consulta' }).evaluate((button: HTMLButtonElement) => {
    button.click()
    button.click()
  })
  await expect(page).toHaveURL(/\/gracias\/$/)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gracias por escribirme')
  await expect(page.getByRole('link', { name: /videos en YouTube/ }))
    .toHaveAttribute('href', 'https://www.youtube.com/@EugeniaButeler')
  expect(acceptHeader).toContain('application/json')
  expect(requests).toHaveLength(1)
  expect(posts).toEqual([new URL('/api/contacto', page.url()).href])
  const values = new URLSearchParams(requests[0])
  expect(contentType).toContain('application/x-www-form-urlencoded')
  expect(Object.fromEntries(values)).toEqual({
    name: 'María',
    email: 'maria@example.com',
    message: '¿Cómo es el primer encuentro?',
    _honey: '',
    'bot-field': '',
  })
})

test('mantiene el envío HTML cuando JavaScript está desactivado', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  await page.route('**/api/contacto', (route) =>
    route.fulfill({ status: 303, headers: { location: '/gracias/' } }),
  )
  await page.goto('/')
  await fillContactForm(page)
  const posted = page.waitForRequest((request) => request.method() === 'POST')
  await page.getByRole('button', { name: 'Enviar consulta' }).click()
  const request = await posted
  expect(new URL(request.url()).pathname).toBe('/api/contacto')
  expect(request.headers()['accept']).toContain('text/html')
  expect(Object.fromEntries(new URLSearchParams(request.postData() ?? ''))).toEqual({
    name: 'María',
    email: 'maria@example.com',
    message: '¿Cómo es el primer encuentro?',
    _honey: '',
    'bot-field': '',
  })
  await expect(page).toHaveURL(/\/gracias\/$/)
  await page.close()
})

test('restablece el formulario al volver tras una confirmación normal', async ({ page }) => {
  await page.route('**/api/contacto', (route) => route.fulfill({ status: 202, json: { success: true } }))
  await page.goto('/')
  await fillContactForm(page)
  await page.getByRole('button', { name: 'Enviar consulta' }).click()
  await expect(page).toHaveURL(/\/gracias\/$/)
  await page.goBack()
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })))
  await expect(page.getByRole('button', { name: 'Enviar consulta' })).toBeEnabled()
  await expect(page.locator('form[name="consulta-mentoria"]')).not.toHaveAttribute('aria-busy')
})

for (const width of [320, 360, 390, 768, 1440]) {
  test(`el contenido entra en un ancho de ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 900 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    if (width <= 390) {
      const hero = page.locator('.hero')
      const message = hero.getByRole('link', { name: 'Escribime por Instagram' })
      const youtube = hero.getByRole('link', { name: /Mi YouTube.*@EugeniaButeler/ })
      await expect(message).toBeInViewport({ ratio: 1 })
      await expect(youtube).toBeInViewport({ ratio: 1 })
      expect((await message.boundingBox())?.height).toBeGreaterThanOrEqual(44)
      expect((await youtube.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    }
  })
}

test('el texto al 200% conserva el ancho y el acceso a Instagram en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  await page.addStyleTag({ content: ':root { font-size: 200%; }' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  const message = page.locator('.hero').getByRole('link', { name: 'Escribime por Instagram' })
  await message.scrollIntoViewIfNeeded()
  await expect(message).toBeInViewport({ ratio: 1 })
})

test('muestra estado en curso e impide envíos duplicados mientras espera la respuesta del sitio', async ({ page }) => {
  await page.clock.install()
  const requests: string[] = []
  let releasePost!: () => void
  const postGate = new Promise<void>((resolve) => {
    releasePost = resolve
  })

  await page.route('**/api/contacto', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    requests.push(route.request().postData() ?? '')
    await postGate
    await route.fulfill({
      status: 202,
      json: { success: true },
    })
  })

  await page.goto('/')
  await fillContactForm(page)
  const form = page.locator('form[name="consulta-mentoria"]')
  const submitButton = form.locator('button[type="submit"]')
  await submitButton.click()

  await expect.poll(() => requests.length).toBe(1)
  await expect(submitButton).toBeDisabled()
  await expect(submitButton).toHaveText('Enviando…')
  await expect(form).toHaveAttribute('aria-busy', 'true')
  await page.clock.fastForward(10_000)
  const alert = form.getByRole('alert')
  await expect(alert).toHaveCount(1)
  await expect(alert).toHaveText('')
  await expect(submitButton).toHaveText('Enviando…')
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })))
  await expect(submitButton).toBeDisabled()

  await form.evaluate((el: HTMLFormElement) => {
    el.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
  expect(requests).toHaveLength(1)

  releasePost()
  await expect(page).toHaveURL(/\/gracias\/$/)
  expect(requests).toHaveLength(1)
})

test('el honeypot no envía ni confirma una consulta', async ({ page }) => {
  let requests = 0
  await page.route('**/api/contacto', async (route) => { requests++; await route.abort() })
  await page.goto('/')
  await fillContactForm(page)
  await page.locator('[name="_honey"]').evaluate((input: HTMLInputElement) => { input.value = 'bot' })
  await page.getByRole('button', { name: 'Enviar consulta' }).click()
  await expect(page).toHaveURL('/')
  expect(requests).toBe(0)
})

for (const scenario of [
  { name: 'rechazo confirmado', fulfill: { status: 503, json: { success: false } }, expected: 'No se pudo enviar' },
  { name: 'corte de red', fulfill: null, expected: 'No pudimos confirmar' },
  { name: '504 de un intermediario', fulfill: { status: 504, body: 'Gateway timeout' }, expected: 'No pudimos confirmar' },
  { name: '202 con JSON inválido', fulfill: { status: 202, body: '{' }, expected: 'No pudimos confirmar' },
  { name: '200 con success true', fulfill: { status: 200, json: { success: true } }, expected: 'No pudimos confirmar' },
  { name: '202 con success como texto', fulfill: { status: 202, json: { success: 'true' } }, expected: 'No pudimos confirmar' },
]) {
  test(`entra en error ante ${scenario.name} y permite reintentar con éxito`, async ({ page }) => {
    let attempt = 0
    await page.route('**/api/contacto', async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      attempt++
      if (attempt === 1) {
        if (scenario.fulfill) await route.fulfill(scenario.fulfill)
        else await route.abort()
        return
      }
      await route.fulfill({
        status: 202,
        json: { success: true },
      })
    })

    await page.goto('/')
    await fillContactForm(page)
    const form = page.locator('form[name="consulta-mentoria"]')
    await form.getByRole('button', { name: 'Enviar consulta' }).click()

    const alert = form.getByRole('alert')
    await expect(alert).toContainText(scenario.expected)
    await expect(alert).toHaveCount(1)
    await expect(alert.getByRole('link', { name: /escribime por Instagram/ }))
      .toHaveAttribute('href', 'https://www.instagram.com/eugebuteler.coach/')
    await expect(form).not.toHaveAttribute('aria-busy', 'true')
    await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue('María')
    await expect(page.getByLabel('Correo electrónico')).toHaveValue('maria@example.com')
    await expect(page.getByLabel('¿Qué te gustaría consultar?')).toHaveValue('¿Cómo es el primer encuentro?')

    const retry = form.getByRole('button', { name: 'Reintentar' })
    await expect(retry).toBeEnabled()
    await retry.click()

    await expect(page).toHaveURL(/\/gracias\/$/)
    expect(attempt).toBe(2)
  })
}

test('falla rápido sin conexión y permite reintentar al volver en línea', async ({ page, context }) => {
  let attempt = 0
  await page.route('**/api/contacto', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    attempt++
    await route.fulfill({
      status: 202,
      json: { success: true },
    })
  })

  await page.goto('/')
  await fillContactForm(page)
  await context.setOffline(true)

  const form = page.locator('form[name="consulta-mentoria"]')
  await form.getByRole('button', { name: 'Enviar consulta' }).click()

  await expect(form.getByRole('alert')).toContainText('No se pudo enviar')
  await expect(form).not.toHaveAttribute('aria-busy', 'true')
  await expect(page.getByLabel('¿Qué te gustaría consultar?')).toHaveValue('¿Cómo es el primer encuentro?')
  expect(attempt).toBe(0)

  const retry = form.getByRole('button', { name: 'Reintentar' })
  await expect(retry).toBeEnabled()

  await context.setOffline(false)
  await retry.click()

  await expect(page).toHaveURL(/\/gracias\/$/)
  expect(attempt).toBe(1)
})
