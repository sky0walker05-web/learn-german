// Normal public browsing only. No stealth, login, challenge-solving, or downloads.
const { chromium } = require('./.recon/node_modules/playwright');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync('recon', { recursive: true });
  const browser = await chromium.launch({ headless: false, chromiumSandbox: true,
    executablePath: '/home/skywalker101/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto('https://www.edclub.com/sportal/program-3.game', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    console.log('TITLE:', await page.title());
    console.log((await page.locator('body').innerText()).slice(0, 5000));
    await page.screenshot({ path: 'recon/reference-map.png' });
    const body = await page.locator('body').innerText();
    if (/verify you are human|just a moment|checking your browser/i.test(body)) {
      console.log('CHALLENGE: stopped without bypass.'); return;
    }
    const reject = page.getByRole('button', { name: 'Disagree and close', exact: true });
    if (await reject.count()) await reject.click();
    await page.screenshot({ path: 'recon/reference-map.png' });
    console.log('VISIBLE LINKS:', await page.locator('a').evaluateAll(items => items.filter(x => x.offsetWidth).slice(0, 40).map(x => ({ text: x.innerText, href: x.getAttribute('href') }))));
    const keys = page.getByText('Keys f & j', { exact: true });
    if (await keys.count()) {
      await keys.first().click();
      await page.waitForTimeout(2000);
      console.log('LESSON:', (await page.locator('body').innerText()).slice(0, 5000));
      await page.screenshot({ path: 'recon/reference-lesson.png' });
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
