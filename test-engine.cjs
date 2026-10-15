const test = require('node:test');
const assert = require('node:assert/strict');
const { Session, readProgress, bestResult } = require('./engine.js');
const { chapters, lessons } = require('./lessons.js');

test('all German lessons are unique, normalized and complete', () => {
  assert.equal(chapters.length, 6);
  assert.equal(lessons.length, 36);
  assert.equal(new Set(lessons.map(l => l.id)).size, 36);
  for (const lesson of lessons) {
    assert.ok(lesson.title && lesson.hint && lesson.chapter);
    assert.equal(lesson.text, lesson.text.normalize('NFC'));
    assert.equal(lesson.text, lesson.text.trim());
    const s = new Session(lesson.text, () => 1000);
    for (const char of lesson.text) assert.equal(s.type(char), true);
    assert.equal(s.complete, true);
    assert.equal(s.stats().accuracy, 100);
    assert.equal(s.stats().stars, 3);
  }
});
test('German umlauts, capital letters and sharp S match exactly', () => {
  const s = new Session('Ä ö ü ß');
  assert.equal(s.type('ä'), false);
  assert.equal(s.position, 0);
  for (const c of 'Ä ö ü ß') s.type(c);
  assert.equal(s.complete, true);
  assert.equal(s.stats().accuracy, 88);
});
test('introductory lessons only use letters already introduced', () => {
  const introduced = ['fj', 'asdfjklö', '', 'ei', 'ru', '', 'tn', 'gh', 'bm', 'ow', 'cvp', 'qxyz', 'ä', '', 'ü', 'ß'];
  const known = new Set([' ']);
  introduced.forEach((newLetters, index) => {
    for (const letter of newLetters) known.add(letter);
    for (const letter of lessons[index].text) assert.ok(known.has(letter), `${lessons[index].id} uses untaught ${letter}`);
  });
});
test('wrong keys do not advance; correct character clears the error', () => {
  const s = new Session('ab');
  s.type('x');
  assert.equal(s.mistake, 'x');
  assert.equal(s.position, 0);
  s.type('a');
  assert.equal(s.mistake, '');
  assert.equal(s.position, 1);
  s.type('b');
  assert.equal(s.stats().accuracy, 67);
  assert.equal(s.stats().stars, 1);
});
test('backspace clears an error first, then reverses a correct character', () => {
  const s = new Session('abc');
  s.type('a'); s.type('x'); s.backspace();
  assert.equal(s.position, 1);
  assert.equal(s.mistake, '');
  s.backspace(); s.backspace();
  assert.equal(s.position, 0);
  assert.equal(s.attempts, 2);
});
test('clock starts on first key, excludes pauses and freezes at completion', () => {
  let time = 20000;
  const s = new Session('abcde', () => time);
  assert.equal(s.stats().milliseconds, 0);
  s.type('a'); time += 3000; s.pause(); time += 90000;
  s.type('b'); assert.equal(s.position, 1);
  assert.equal(s.stats().milliseconds, 3000);
  s.resume(); s.type('b'); time += 3000;
  for (const c of 'cde') s.type(c);
  assert.equal(s.stats().milliseconds, 6000);
  assert.equal(s.stats().wpm, 10);
  time += 50000; s.type('x'); s.backspace();
  assert.equal(s.stats().milliseconds, 6000);
  assert.equal(s.position, 5);
});
test('pause before start does not start the timer', () => {
  const s = new Session('a'); s.pause(); s.resume();
  assert.equal(s.started, false);
  assert.equal(s.stats().milliseconds, 0);
});
test('combining accent input is normalized; multi-character events rejected by model', () => {
  const s = new Session('ä');
  assert.equal(s.type('ab'), false);
  assert.equal(s.type('a\u0308'), true);
  assert.equal(s.complete, true);
});
test('accuracy thresholds award one, two or three stars', () => {
  for (const [misses, stars] of [[0, 3], [1, 2], [3, 1]]) {
    const s = new Session('abcdefghij');
    for (let i = 0; i < misses; i++) s.type('x');
    for (const c of 'abcdefghij') s.type(c);
    assert.equal(s.stats().stars, stars);
  }
});
test('storage unavailable, malformed and adversarial data fail safely', () => {
  assert.deepEqual(readProgress({ getItem() { throw new Error('denied'); } }), {});
  for (const value of ['bad', 'null', '[]', '42', '{"lesson-1":{"stars":99,"wpm":20,"accuracy":100}}', '{"__proto__":{"stars":3,"wpm":20,"accuracy":100}}']) {
    assert.deepEqual(readProgress({ getItem: () => value }), {});
  }
});
test('validated progress and personal bests preserve best individual statistics', () => {
  const record = { stars: 2, wpm: 23, accuracy: 96 };
  assert.deepEqual(readProgress({ getItem: () => JSON.stringify({ 'lesson-1': record }) }), { 'lesson-1': record });
  assert.deepEqual(bestResult(record, { stars: 3, wpm: 20, accuracy: 100 }), { stars: 3, wpm: 23, accuracy: 100 });
});
