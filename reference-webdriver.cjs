// Small client for this task's already-started, local-only WebDriver session.
const fs = require('node:fs');
const [action, argument] = process.argv.slice(2);
const base = 'http://127.0.0.1:4477/session/0cf9dd75-d555-4a7a-82d2-7eb904b8c396';
(async () => {
  if (action === 'screenshot') {
    if (!/^[a-z-]+$/.test(argument)) throw new Error('Expected a simple screenshot name');
    const data = await (await fetch(`${base}/screenshot`)).json();
    if (typeof data.value !== 'string') throw new Error('Screenshot failed');
    fs.mkdirSync('recon', { recursive: true });
    fs.writeFileSync(`recon/${argument}.png`, Buffer.from(data.value, 'base64'));
    console.log(`Saved recon/${argument}.png`);
  } else if (action === 'text') {
    const data = await (await fetch(`${base}/execute/sync`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ script: 'return document.body.innerText.slice(0,4000)', args: [] }) })).json();
    console.log(data.value);
  } else if (action === 'type-demo') {
    const actions = [];
    for (const key of 'ffffjjjjffffjjjjffjjffjjfjfjjfjf') actions.push({ type: 'keyDown', value: key }, { type: 'keyUp', value: key }, { type: 'pause', duration: 200 });
    const result = await fetch(`${base}/actions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ actions: [{ type: 'key', id: 'demo-keys', actions }] }) });
    console.log(await result.text());
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
