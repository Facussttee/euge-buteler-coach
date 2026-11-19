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
  await expect(page.locator('form')).toHaveAttribute('action', 'https://formsubmit.co/eugebutelercoach@gmail.com')
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
  await page.route('https://formsubmit.co/**', (route) => {
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
  await expect(alert).toContainText('No se pudo enviar')
  await expect(alert.getByRole('link', { name: /escribime por Instagram/ }))
    .toHaveAttribute('href', 'https://www.instagram.com/eugebuteler.coach/')
  await expect(page.getByLabel('¿Qué te gustaría consultar?')).toHaveValue('¿Cómo es el primer encuentro?')
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
})

test('envía una sola consulta y confirma cuando el proveedor responde', async ({ page }) => {
  const requests: string[] = []
  let acceptHeader = ''
  await page.route('https://formsubmit.co/ajax/eugebutelercoach@gmail.com', async (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    acceptHeader = route.request().headers()['accept'] ?? ''
    requests.push(route.request().postData() ?? '')
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: 'true' }),
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
  const values = new URLSearchParams(requests[0])
  expect(values.get('form-name')).toBe('consulta-mentoria')
  expect(values.get('email')).toBe('maria@example.com')
  expect(values.get('_subject')).toContain('Euge Buteler')
})

test('mantiene el envío HTML cuando JavaScript está desactivado', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  await page.route('https://formsubmit.co/eugebutelercoach@gmail.com', (route) =>
    route.fulfill({ status: 200, body: 'Consulta recibida' }),
  )
  await page.goto('/')
  await fillContactForm(page)
  const posted = page.waitForRequest((request) => request.method() === 'POST')
  await page.getByRole('button', { name: 'Enviar consulta' }).click()
  const request = await posted
  expect(request.url()).toBe('https://formsubmit.co/eugebutelercoach@gmail.com')
  expect(new URLSearchParams(request.postData() ?? '').get('form-name')).toBe('consulta-mentoria')
  await expect(page.getByText('Consulta recibida')).toBeVisible()
  await page.close()
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
