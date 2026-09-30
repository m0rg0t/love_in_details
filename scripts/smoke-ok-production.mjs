import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const base = process.env.APP_BASE_URL ?? 'http://127.0.0.1:10889';
const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH });
try {
  for (const query of ['', '?vk_client=ok&sign=FAKE_LAUNCH_SECRET']) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewport({ width: 390, height: 844 });
    await page.setRequestInterception(true);
    page.on('request', (req) => { void (req.url().startsWith(base) || req.url().startsWith('data:') ? req.continue() : req.abort()); });
    // No Bridge injection and no dev panels; exercise the shipped bundle.
    await page.goto(`${base}/${query}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.welcome');
    if (query) assert.equal(await page.$('.welcome__prompt-link'), null);
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Полный квиз')).click());
    for (let participant = 0; participant < 2; participant++) {
      for (let question = 0; question < 12; question++) {
        await page.waitForSelector('.quiz__content', { visible: true });
        const title = await page.$eval('.quiz__question-text', (el) => el.textContent);
        const input = await page.$('.quiz__content textarea');
        if (input) await page.locator('.quiz__content textarea').fill('Тестовый ответ для локальной проверки');
        else {
          await page.waitForSelector('.quiz__content [role="radio"]', { visible: true });
          await page.locator('.quiz__content [role="radio"]').click();
        }
        await page.waitForFunction(() => ![...document.querySelectorAll('.quiz__footer button')].find((b) => b.textContent.match(/Далее|Завершить/)).disabled);
        await page.evaluate(() => [...document.querySelectorAll('.quiz__footer button')].find((b) => b.textContent.match(/Далее|Завершить/)).click());
        if (question < 11) await page.waitForFunction((previous) => Boolean(document.querySelector('.quiz__question-text')?.textContent && document.querySelector('.quiz__question-text').textContent !== previous), {}, title);
      }
      if (participant === 0) {
        await page.waitForSelector('.handoff', { visible: true });
        await page.locator('.handoff__button').click();
      }
    }
    await page.waitForSelector('.results');
    assert.equal(await page.$('.share-section__story-button'), null);
    if (query) assert.equal(await page.$('.prompt-ideas'), null);
    await page.locator('.results-details__toggle').click();
    await page.waitForSelector('#results-details-list');
    assert.equal((await page.$$('.result-card')).length, 12);
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Пройти ещё раз')).click());
    await page.waitForSelector('.welcome');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log(`${query ? 'OK preview' : 'Standalone'}: production full quiz A → handoff → B → results → details → restart passed`);
    await page.close();
  }
} finally { await browser.close(); }
