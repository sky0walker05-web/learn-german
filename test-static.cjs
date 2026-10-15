const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');

test('all UI element references exist exactly once', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, id] of js.matchAll(/\$\('([^']+)'\)/g)) assert.ok(ids.includes(id), `Missing #${id}`);
  for (const [, value] of html.matchAll(/\b(?:aria-labelledby|aria-describedby|for)="([^"]+)"/g)) {
    for (const id of value.split(' ')) assert.ok(ids.includes(id), `Missing accessibility target #${id}`);
  }
});
test('app is buildless and has no external assets or network calls', () => {
  for (const [, target] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (target.startsWith('#')) continue;
    assert.doesNotMatch(target, /^(https?:|\/\/)/);
    assert.ok(fs.existsSync(path.join(__dirname, target)), `Missing asset ${target}`);
  }
  assert.doesNotMatch(js, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|Worker|eval)\s*\(/);
  assert.doesNotMatch(css, /@import|https?:\/\//);
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /type="module"/);
});
test('language, responsive viewport, reduced motion and input protections exist', () => {
  assert.match(html, /<html lang="de">/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /spellcheck="false"/);
  assert.match(html, /autocapitalize="off"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/);
  assert.match(js, /compositionend/);
  assert.match(js, /visibilitychange/);
  assert.doesNotMatch(js, /innerHTML|outerHTML|insertAdjacentHTML/);
});
test('runtime payload remains below 100 KB', () => {
  const files = ['index.html', 'styles.css', 'app.js', 'engine.js', 'lessons.js', 'icon.svg'];
  const bytes = files.reduce((sum, filename) => sum + fs.statSync(path.join(__dirname, filename)).size, 0);
  assert.ok(bytes < 100000, `Runtime size ${bytes} exceeds 100 KB`);
});
