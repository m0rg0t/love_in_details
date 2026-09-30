import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import puppeteer from 'puppeteer';

// External fixtures only: production code has no Bridge mock switch.
const base = process.env.APP_BASE_URL ?? 'http://localhost:10888';
const umamiScript = await readFile(process.env.UMAMI_SCRIPT_PATH ?? '/tmp/love-details-umami.js', 'utf8');
const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_PATH });
const summaries = [];
const scenarios = [
  ['standalone', '', false, false],
  ['OK preview', '&vk_client=ok&vk_platform=android', false, false],
  ['OK desktop', '&vk_client=ok&vk_platform=desktop_web_ok', true, false],
  ['OK mobile web', '&vk_client=ok&vk_platform=mobile_web_ok', true, false],
  ['OK Android', '&vk_client=ok&vk_platform=android', true, true],
  ['OK iOS', '&vk_client=ok&vk_platform=iphone', true, true],
  ['VK', '&vk_app_id=54445864&vk_platform=android', true, true],
  ['OK no stories/no fill', '&vk_client=ok&vk_platform=android', true, false, 'unsupported'],
  ['OK stuck init', '&vk_client=ok&vk_platform=android', true, false, 'stuck'],
];
try {
  for (const [name, query, nativeMock, stories, mode = 'normal'] of scenarios) {
    for (const width of [390, 1280]) {
      console.log(`Checking ${name}, ${width}px`);
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900 });
      const analytics = [];
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.url() === 'https://umami.pixel-and-byte.ru/script.js') {
          void request.respond({ contentType: 'application/javascript', body: umamiScript });
        } else if (request.url().startsWith('https://umami.pixel-and-byte.ru/api/send')) {
          if (request.method() === 'POST') analytics.push(JSON.parse(request.postData()));
          void request.respond({ contentType: 'application/json', body: '{}', headers: {
            'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-umami-cache',
          } });
        } else if (!request.url().startsWith(base) && !request.url().startsWith('data:')) {
          void request.abort();
        } else void request.continue();
      });
      await page.evaluateOnNewDocument((nativeMock, mode, ios) => {
        Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
        Object.defineProperty(document, 'referrer', { get: () => 'https://ok.ru/app/512004459603?token=FAKE_REFERRER_SECRET#secret' });
        window.__bridgeCalls = [];
        window.__shareBehavior = 'cancel';
        if (!nativeMock) return;
        if (ios) window.webkit = { messageHandlers: { VKWebAppClose: { postMessage() {} } } };
        else window.AndroidBridge = {};
        const methods = ['VKWebAppInit', 'VKWebAppGetConfig', 'VKWebAppShowBannerAd', 'VKWebAppHideBannerAd', 'VKWebAppCheckNativeAds', 'VKWebAppShowNativeAds', 'VKWebAppShare', 'VKWebAppShowStoryBox', 'VKWebAppAddToFavorites', 'VKWebAppOpenApp'];
        for (const method of methods) {
          if (mode === 'unsupported' && method === 'VKWebAppShowStoryBox') continue;
          const handle = (raw) => {
            const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
            window.__bridgeCalls.push({ method, payload });
            if (mode === 'stuck' && method === 'VKWebAppInit') return;
            let data = { result: true };
            let type = `${method}Result`;
            if (method === 'VKWebAppGetConfig') data = { appearance: 'light', insets: { top: 0, bottom: 0, left: 0, right: 0 } };
            if (method === 'VKWebAppCheckNativeAds' || method === 'VKWebAppShowBannerAd') data = { result: false };
            if (method === 'VKWebAppShare' || method === 'VKWebAppShowStoryBox') {
              if (window.__shareBehavior === 'cancel') { type = `${method}Failed`; data = { error_type: 'client_error', error_data: { error_code: 4, error_reason: 'User denied' } }; }
              else if (window.__shareBehavior === 'failed') { type = `${method}Failed`; data = { error_type: 'client_error', error_data: { error_code: 9, error_reason: 'Failure' } }; }
              else data = method === 'VKWebAppShare' ? { type: 'link' } : { result: true };
            }
            setTimeout(() => window.dispatchEvent(new CustomEvent('VKWebAppEvent', { detail: { type, data: { ...data, request_id: payload.request_id } } })), 0);
          };
          if (ios) window.webkit.messageHandlers[method] = { postMessage: handle };
          else window.AndroidBridge[method] = handle;
        }
      }, nativeMock, mode, name === 'OK iOS');
      await page.goto(`${base}/?debug=true&panel=results&sign=FAKE_LAUNCH_SECRET${query}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.share-section');
      if (mode === 'stuck') await page.waitForFunction(() => document.body.innerText.includes('Отправить ссылку'), { timeout: 5000 });
      if (stories) await page.waitForSelector('.share-section__story-button');
      const ok = query.includes('vk_client=ok');
      assert.equal(await page.$('.share-section__story-button') !== null, stories, `${name} story CTA`);
      if (ok) {
        assert.equal(await page.$('.prompt-ideas'), null, `${name} VK promotion`);
        assert.equal(await page.$('.favorite-return'), null, `${name} VK favorites`);
      }
      await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Отправить ссылку')).click());
      if (nativeMock && mode !== 'stuck') {
        await page.waitForFunction(() => window.__bridgeCalls.some((c) => c.method === 'VKWebAppShare'));
        await page.waitForFunction(() => !document.querySelector('.share-section button[disabled]'));
        assert.equal(await page.$('.share-section__status'), null, `${name} quiet cancel`);
        assert.equal(await page.$('.share-section__manual'), null, `${name} no competing fallback`);
        await page.evaluate(() => { window.__shareBehavior = 'failed'; });
        await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Отправить ссылку')).click());
      }
      await page.waitForSelector('.share-section__manual textarea');
      const invitation = await page.$eval('.share-section__manual textarea', (el) => el.value);
      assert.ok(invitation.includes(ok ? 'https://ok.ru/app/512004459603' : 'https://vk.com/app54445864'));
      assert.ok(!invitation.includes('FAKE_'));
      if (stories) {
        await page.evaluate(() => { window.__shareBehavior = 'cancel'; document.querySelector('.share-section__story-button').click(); });
        await page.waitForFunction(() => window.__bridgeCalls.some((c) => c.method === 'VKWebAppShowStoryBox'));
        const payload = await page.evaluate(() => window.__bridgeCalls.find((c) => c.method === 'VKWebAppShowStoryBox').payload);
        assert.ok(payload.blob.startsWith('data:image/'));
        assert.equal('attachment' in payload, !ok);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name} overflow ${width}`);
      const calls = await page.evaluate(() => window.__bridgeCalls.map((c) => c.method));
      assert.equal(calls.filter((m) => m === 'VKWebAppInit').length, nativeMock ? 1 : 0);
      assert.ok(!calls.includes('VKWebAppCheckBannerAd'));
      assert.ok(analytics.length > 0, 'actual Umami request intercepted');
      assert.ok(!JSON.stringify(analytics).match(/FAKE_LAUNCH_SECRET|FAKE_REFERRER_SECRET|#secret/));
      assert.ok(analytics.every((event) => event.payload.url === '/'));
      assert.deepEqual(errors, []);
      if (name === 'OK preview' && width === 390) {
        await (await page.$('.share-section')).scrollIntoView();
        await page.waitForFunction(() => { const image = document.querySelector('.share-card-preview img'); return image.complete && image.naturalWidth > 0; });
        await (await page.$('.share-section')).screenshot({ path: '/tmp/love-details-ok-preview.png' });
      }
      await page.goto(`${base}/?vk_client=${ok ? 'ok' : 'vk'}${query}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.welcome');
      if (ok) assert.equal(await page.$('.welcome__prompt-link'), null, `${name} initial VK promotion`);
      summaries.push({ scenario: name, width, mock: nativeMock, stories, analyticsRequests: analytics.length, result: 'passed' });
      await page.close();
    }
  }
  console.log(JSON.stringify(summaries, null, 2));
} finally { await browser.close(); }
