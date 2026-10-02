import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { preview } from 'vite';
import puppeteer from 'puppeteer';

// Exercise the actual production bundle with no external requests or host mocks.
const server = await preview({ preview: { host: '127.0.0.1', port: 4179, strictPort: true } });
const base = 'http://127.0.0.1:4179';
let browser;
try {
  browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  for (const width of [360, 1280]) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (request.url().startsWith(`${base}/`) || request.url().startsWith('data:')) void request.continue();
      else void request.abort();
    });
    try {
      await page.goto(`${base}/?debug=true&panel=results`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.welcome__full-button');
      assert.equal(await page.$('.results'), null, 'production must ignore debug shortcuts');
      await page.click('.welcome__full-button');
      for (let player = 0; player < 2; player += 1) {
        for (let index = 0; index < 12; index += 1) {
          await page.waitForSelector('.quiz__question-text');
          const question = await page.$eval('.quiz__question-text', element => element.textContent);
          if (await page.$('.quiz textarea')) await page.type('.quiz textarea', 'Тестовый ответ');
          else await page.click('.quiz [role="radio"]');
          await page.waitForFunction(() => !document.querySelector('.quiz__footer .gradient-button')?.disabled);
          await page.click('.quiz__footer .gradient-button');
          await page.waitForFunction(previous => {
            const current = document.querySelector('.quiz__question-text');
            return !current || current.textContent !== previous;
          }, {}, question);
          if (player === 0 && index === 2) {
            await page.reload({ waitUntil: 'networkidle0' });
            await page.waitForSelector('#welcome-resume-title');
            await page.click('.welcome-resume button');
            await page.waitForSelector('.quiz__question-text');
          }
        }
        if (player === 0) {
          await page.waitForSelector('.handoff__button');
          assert.equal(await page.$('.quiz'), null, 'handoff must hide first-player answers');
          await page.click('.handoff__button');
        }
      }
      await page.waitForSelector('.results-details__toggle');
      assert.equal(await page.evaluate(() => localStorage.getItem('love-in-details:quiz-progress:v1')), null);
      const history = await page.evaluate(() => JSON.parse(localStorage.getItem('love-in-details:session-history:v1')));
      assert.equal(history.entries.length, 1);
      assert.equal(history.entries[0].totalQuestions, 12);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `overflow at ${width}px`);
      await page.click('.results-details__toggle');
      await page.waitForSelector('.results-cards');
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForSelector('.welcome-return');
      assert.equal(await page.$('#welcome-resume-title'), null);
      assert.deepEqual(errors, [], 'production runtime errors');
      console.log(`Production quiz, resume, handoff, result and history passed at ${width}px`);
    } catch (error) {
      await mkdir('test-results', { recursive: true });
      await page.screenshot({ path: `test-results/production-${width}.png`, fullPage: true }).catch(() => {});
      throw error;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}
