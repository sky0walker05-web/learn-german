/* Tippwald: local UI, no network, libraries, tracking or server. */
(function () {
  'use strict';
  const { chapters, lessons } = TippLessons;
  const { Session, readProgress, bestResult } = TippEngine;
  const $ = id => document.getElementById(id);
  let storage;
  try { storage = window.localStorage; } catch (_) { storage = null; }
  let progress = readProgress(storage);
  let lesson = null;
  let session = null;
  let timer = null;
  let composing = false;
  let chars = [];
  let renderedPosition = 0;
  let pressedTimer = null;
  let storageWorks = true;
  let freePractice = false;
  let onboardingDismissed = false;
  const knownIds = new Set(lessons.map(item => item.id));
  for (const id of Object.keys(progress)) if (!knownIds.has(id)) delete progress[id];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function save() {
    try {
      storage.setItem('tippwald.progress.v1', JSON.stringify(progress));
      storageWorks = true;
    } catch (_) { storageWorks = false; }
    $('storage-note').textContent = storageWorks
      ? 'Dein Fortschritt bleibt in diesem Browser. Kein Konto, keine Werbung.'
      : 'Speichern ist in diesem Browser nicht möglich. Dein Fortschritt bleibt nur bis zum Schließen dieser Seite.';
  }
  function totals() {
    const records = Object.values(progress);
    return { completed: records.length, stars: records.reduce((sum, item) => sum + item.stars, 0), best: Math.max(0, ...records.map(item => item.wpm)) };
  }
  function nextLesson() { return lessons.find(item => !progress[item.id]) || lessons[0]; }
  function starNodes(count) {
    const fragment = document.createDocumentFragment();
    for (let n = 1; n <= 3; n++) fragment.append(element('span', n <= count ? 'earned' : '', '★'));
    return fragment;
  }
  function renderMap() {
    const sum = totals();
    $('overall-percent').textContent = `${Math.round(sum.completed / lessons.length * 100)}%`;
    $('overall-stars').textContent = sum.stars;
    $('overall-points').textContent = sum.stars * 100;
    $('continue-button').textContent = 'Weiter →';
    $('welcome-note').textContent = sum.completed === lessons.length
      ? 'Alle Lektionen geschafft! Wiederhole deine Favoriten und sammle die restlichen Sterne.'
      : freePractice ? 'Alle Lektionen sind frei verfügbar.' : 'Lektionen werden nacheinander freigeschaltet. Freies Üben öffnet alle Lektionen.';
    $('onboarding').hidden = sum.completed > 0 || onboardingDismissed || freePractice;
    const recommended = nextLesson().id;
    const content = document.createDocumentFragment();
    const glyphs = [
      ['fj', 'asdf', 'das', 'ei', 'ru', 'das'],
      ['tn', 'gh', 'bm', 'ow', 'cvp', 'xyz'],
      ['ä', 'ö', 'ü', 'ß', 'ÄÖÜ', 'äöü'],
      ['Guten', 'Haus', 'Brot', 'Zug', 'Tee', 'Zeit'],
      ['Wie?', '123', 'Hallo', 'Büro', '@', 'Plan'],
      ['Aa', 'Aa', 'Aa', 'Aa', 'Aa', 'Aa']
    ];
    chapters.forEach((chapter, ci) => {
      const section = element('section', `chapter ${chapter.color}`);
      const heading = element('div', 'chapter-heading');
      heading.append(element('span', 'chapter-number', String(ci + 1).padStart(2, '0')));
      const title = element('div');
      title.append(element('h2', '', chapter.title), element('p', '', chapter.subtitle));
      heading.append(title);
      const completed = chapter.lessons.filter(item => progress[item.id]).length;
      heading.append(element('span', 'chapter-score', `${completed} / ${chapter.lessons.length} geschafft`));
      section.append(heading);
      const grid = element('div', 'lesson-grid');
      chapter.lessons.forEach((item, li) => {
        const record = progress[item.id];
        const locked = !freePractice && item.number > 1 && !progress[lessons[item.number - 2].id] && !record;
        const button = element('button', `lesson-card${record ? ' done' : ''}${item.id === recommended ? ' current' : ''}`);
        button.disabled = locked;
        button.dataset.lesson = item.id;
        button.setAttribute('aria-label', `Lektion ${item.number}: ${item.title}${locked ? ', noch gesperrt' : record ? `, ${record.stars} von 3 Sternen` : ''}`);
        button.title = item.title;
        button.append(element('span', 'card-number', item.number));
        if (locked) { const lock = element('span', 'card-lock'); lock.setAttribute('aria-hidden', 'true'); button.append(lock); }
        else if (record) button.append(element('span', 'card-status', '✓'));
        else if (item.id === recommended) button.append(element('span', 'card-status', '→'));
        const kind = ci === 5 ? 'story' : ci >= 3 ? 'sentence' : li % 3 === 1 ? 'review' : 'keys';
        const art = element('span', `card-art ${kind}`);
        art.setAttribute('aria-hidden', 'true');
        art.append(element('span', 'card-glyph', glyphs[ci][li]));
        if (kind === 'keys') art.append(element('span', 'key-box'));
        const stars = element('span', 'card-stars');
        stars.append(starNodes(record?.stars || 0));
        art.append(stars);
        button.append(art, element('span', 'card-title', item.title));
        grid.append(button);
      });
      section.append(grid);
      content.append(section);
    });
    $('chapters').replaceChildren(content);
  }

  const rows = [
    [['^'], ['1'], ['2'], ['3'], ['4'], ['5'], ['6'], ['7'], ['8'], ['9'], ['0'], ['ß'], ['´'], ['Backspace', '⌫', 'wide']],
    [['Tab', 'Tab', 'wide'], ...Array.from('qwertzuiopü+').map(key => [key])],
    [['CapsLock', 'Fest', 'wider'], ...Array.from('asdfghjklöä#').map(key => [key]), ['Enter', '↵', 'wide']],
    [['Shift', '⇧', 'wide'], ...Array.from('<yxcvbnm,.-').map(key => [key]), ['ShiftRight', '⇧', 'wider']],
    [['Control', 'Strg', 'wide'], ['Meta', '◆'], ['Alt'], [' ', 'Leertaste', 'space'], ['AltGraph', 'Alt Gr', 'wide'], ['ControlRight', 'Strg', 'wide']]
  ];
  const keys = new Map();
  function renderKeyboard() {
    for (const row of rows) {
      const line = element('div', 'key-row');
      for (const [value, label, width] of row) {
        const key = element('span', `key ${width || ''}${'fj'.includes(value) ? ' home' : ''}`, label || value.toUpperCase());
        keys.set(value, key);
        line.append(key);
      }
      $('keyboard').append(line);
    }
  }
  const symbols = { '!': '1', '"': '2', '§': '3', '$': '4', '%': '5', '&': '6', '/': '7', '(': '8', ')': '9', '=': '0', '?': 'ß', '*': '+', "'": '#', ';': ',', ':': '.', '_': '-', '>': '<' };
  function highlightKeyboard() {
    for (const node of keys.values()) node.classList.remove('target', 'modifier');
    const expected = session?.text[session.position];
    if (!expected) return;
    let key = expected.toLowerCase();
    let modifier = null;
    if (symbols[expected]) { key = symbols[expected]; modifier = 'Shift'; }
    else if (expected === '@') { key = 'q'; modifier = 'AltGraph'; }
    else if (expected !== expected.toLowerCase()) modifier = 'Shift';
    keys.get(key)?.classList.add('target');
    if (modifier) {
      keys.get(modifier)?.classList.add('modifier');
      if (modifier === 'Shift') keys.get('ShiftRight')?.classList.add('modifier');
    }
    const fingerGroups = [['qay<1^', 'linker kleiner Finger'], ['wsx2', 'linker Ringfinger'], ['edc3', 'linker Mittelfinger'], ['rtfgvb45', 'linker Zeigefinger'], ['zuhnjm67', 'rechter Zeigefinger'], ['ik,8', 'rechter Mittelfinger'], ['ol.9', 'rechter Ringfinger'], ['püöäß+#-0´', 'rechter kleiner Finger']];
    const finger = expected === ' ' ? 'Daumen' : fingerGroups.find(([group]) => group.includes(key))?.[1];
    $('next-key-hint').textContent = `${expected === ' ' ? 'Leertaste' : `${modifier === 'Shift' ? 'Umschalt + ' : modifier === 'AltGraph' ? 'Alt Gr + ' : ''}${key.toUpperCase()}`}${finger ? ` · ${finger}` : ''}`;
  }
  function flashKey(key) {
    clearTimeout(pressedTimer);
    for (const node of keys.values()) node.classList.remove('pressed');
    const node = keys.get(key.toLowerCase()) || keys.get(key);
    if (node) { node.classList.add('pressed'); pressedTimer = setTimeout(() => node.classList.remove('pressed'), 100); }
  }
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function renderStats() {
    if (!session) return;
    const stats = session.stats();
    $('live-wpm').textContent = stats.wpm;
    $('live-accuracy').textContent = `${stats.accuracy}%`;
    $('live-time').textContent = formatTime(stats.milliseconds);
    $('lesson-progress').value = stats.progress;
    $('letter-count').textContent = `${session.position} / ${session.text.length}`;
  }
  function renderTyping() {
    for (let i = Math.max(0, Math.min(renderedPosition, session.position) - 1); i <= Math.min(chars.length - 1, Math.max(renderedPosition, session.position)); i++) {
      chars[i].className = `char${i < session.position ? ' correct' : i === session.position ? (session.mistake ? ' current wrong' : ' current') : ''}`;
    }
    const current = chars[session.position];
    if (current) {
      const box = $('typing-text').getBoundingClientRect();
      const rect = current.getBoundingClientRect();
      if (rect.bottom > box.bottom - 10 || rect.top < box.top) $('typing-text').scrollTop += rect.top - box.top - 8;
      if ($('typing-text').classList.contains('letter-drill') && (rect.right > box.right - 5 || rect.left < box.left)) $('typing-text').scrollLeft += rect.left - box.left - 4;
    }
    renderedPosition = session.position;
    highlightKeyboard();
    renderStats();
  }
  function startLesson(item) {
    onboardingDismissed = true;
    document.body.classList.add('in-lesson');
    $('typing-text').classList.toggle('letter-drill', item.number <= 2);
    if (timer) clearInterval(timer);
    if ($('result-dialog').open) $('result-dialog').close();
    lesson = item;
    session = new Session(item.text);
    renderedPosition = 0;
    composing = false;
    $('typing-input').value = '';
    $('typing-input').disabled = false;
    $('map-view').hidden = true;
    $('lesson-view').hidden = false;
    $('pause-overlay').hidden = true;
    $('pause-button').textContent = 'Ⅱ Pause';
    $('lesson-title').textContent = `${item.number}. ${item.title}`;
    $('lesson-chapter').textContent = item.chapter;
    $('lesson-hint').textContent = item.hint;
    $('sr-prompt').textContent = `Tippe diesen Text genau ab: ${item.text}`;
    $('typing-instruction').textContent = 'Die Zeit beginnt mit deinem ersten Zeichen.';
    feedback('Genauigkeit zuerst. Das Tempo kommt mit der Übung.');
    const fragment = document.createDocumentFragment();
    chars = [];
    item.text.split(/( )/).forEach(word => {
      const group = element('span', word === ' ' ? '' : 'typing-word');
      for (const char of word) {
        const span = element('span', 'char', char === ' ' ? (item.number <= 2 ? '␣' : '\u00a0') : char);
        chars.push(span); group.append(span);
      }
      fragment.append(group);
    });
    $('typing-text').replaceChildren(fragment);
    $('typing-text').scrollTop = 0;
    $('typing-text').scrollLeft = 0;
    renderTyping();
    timer = setInterval(() => { if (session?.started && !session.paused && !session.complete) renderStats(); }, 1000);
    window.scrollTo(0, 0);
    $('typing-input').focus({ preventScroll: true });
  }
  function feedback(message, error = false) {
    $('typing-feedback').textContent = message;
    $('typing-feedback').classList.toggle('error', error);
  }
  function pause() {
    if (!session || session.complete || $('lesson-view').hidden) return;
    session.pause();
    $('pause-overlay').hidden = false;
    $('pause-button').textContent = '▷ Weiter';
    $('typing-input').disabled = true;
    renderStats();
  }
  function resume() {
    if (!session || session.complete) return;
    session.resume();
    $('pause-overlay').hidden = true;
    $('pause-button').textContent = 'Ⅱ Pause';
    $('typing-input').disabled = false;
    $('typing-input').focus({ preventScroll: true });
  }
  function goHome() {
    document.body.classList.remove('in-lesson');
    if (session) session.pause();
    clearInterval(timer); timer = null;
    if ($('result-dialog').open) $('result-dialog').close();
    $('lesson-view').hidden = true;
    $('map-view').hidden = false;
    renderMap();
    const target = lesson && document.querySelector(`[data-lesson="${lesson.id}"]`);
    (target || $('continue-button')).focus({ preventScroll: true });
  }
  function finish() {
    clearInterval(timer); timer = null;
    const stats = session.stats();
    progress[lesson.id] = bestResult(progress[lesson.id], stats);
    save();
    $('typing-input').disabled = true;
    $('result-title').textContent = stats.stars === 3 ? 'Ausgezeichnet!' : 'Gut gemacht!';
    $('result-message').textContent = storageWorks ? `${lesson.title} – ein weiterer Schritt auf deinem Weg.` : 'Geschafft! Speichern ist hier nicht verfügbar; lasse diese Seite für deinen Fortschritt geöffnet.';
    $('result-stars').replaceChildren(starNodes(stats.stars));
    $('result-stars').setAttribute('aria-label', `${stats.stars} von 3 Sternen`);
    $('result-wpm').textContent = stats.wpm;
    $('result-accuracy').textContent = `${stats.accuracy}%`;
    $('result-time').textContent = formatTime(stats.milliseconds);
    $('result-next').textContent = lesson.number === lessons.length ? 'Zur Übersicht →' : 'Nächste Lektion →';
    $('result-dialog').showModal();
    $('result-next').focus();
  }
  function acceptInput() {
    if (composing || !session || session.paused || session.complete) return;
    const value = $('typing-input').value.normalize('NFC');
    $('typing-input').value = '';
    if (!value) return;
    for (const character of value) {
      if (character === '\n' || character === '\r') continue;
      session.type(character);
      flashKey(character);
      if (session.complete) break;
    }
    $('typing-instruction').textContent = 'Ruhig und gleichmäßig. Du machst das gut.';
    if (session.mistake) {
      const expected = session.text[session.position];
      feedback(`Fast! Tippe ${expected === ' ' ? 'ein Leerzeichen' : `„${expected}“`}, um weiterzumachen.`, true);
    } else feedback('Sehr gut. Bleib in deinem Rhythmus.');
    renderTyping();
    if (session.complete) finish();
  }
  function showInfo(kind) {
    pause();
    const content = $('info-content');
    content.replaceChildren();
    const sum = totals();
    if (kind === 'stats') {
      $('info-title').textContent = 'Dein Fortschritt';
      content.append(element('p', '', 'Jede kleine Übung zählt. Hier siehst du deine persönlichen Bestwerte.'));
      const grid = element('div', 'stat-grid');
      for (const [value, label] of [[`${sum.completed} / ${lessons.length}`, 'Lektionen geschafft'], [`${sum.stars} / ${lessons.length * 3}`, 'Sterne gesammelt'], [sum.best, 'Bestwert · Wörter / Min.'], [sum.stars * 100, 'Punkte · 100 pro Stern']]) {
        const box = element('div', 'stat-box'); box.append(element('b', '', value), element('span', '', label)); grid.append(box);
      }
      content.append(grid, element('p', 'subtle', 'Sterne, Tempo und Genauigkeit werden als getrennte Bestwerte gespeichert. Keine Cloud, kein Konto.'));
    } else if (kind === 'badges') {
      $('info-title').textContent = 'Deine Abzeichen';
      content.append(element('p', '', 'Kleine Meilensteine für deinen Weg durch den Tippwald.'));
      const list = element('div', 'badge-list');
      const badges = [
        ['✦', 'Der erste Schritt', 'Schließe deine erste Lektion ab.', sum.completed >= 1],
        ['♧', 'Wurzeln schlagen', 'Schließe sechs Lektionen ab.', sum.completed >= 6],
        ['Ä', 'Umlaut-Profi', 'Schließe alle sechs Umlaut-Lektionen ab.', chapters[2].lessons.every(item => progress[item.id])],
        ['★', 'Sternensammler', 'Sammle mindestens 30 Sterne.', sum.stars >= 30],
        ['✓', 'Durch den ganzen Wald', 'Schließe alle 36 Lektionen ab.', sum.completed === lessons.length]
      ];
      for (const [icon, name, detail, earned] of badges) {
        const row = element('div', `badge${earned ? ' earned' : ''}`);
        row.append(element('span', 'badge-icon', icon));
        const text = element('div'); text.append(element('strong', '', `${name}${earned ? ' · geschafft' : ''}`), element('span', '', detail)); row.append(text); list.append(row);
      }
      content.append(list);
    } else {
      $('info-title').textContent = 'Willkommen im Tippwald';
      content.append(element('p', '', 'Lerne auf einer deutschen QWERTZ-Tastatur – mit echten Wörtern, Umlauten und kurzen Geschichten. Im geführten Kurs öffnet jede abgeschlossene Lektion die nächste. Aktiviere „Freies Üben“, um direkt Wörter oder Sätze auszuwählen.'));
      const list = element('ol', 'info-list');
      for (const text of [
        'Wähle eine Lektion und tippe den angezeigten Text genau ab. Die blaue Markierung zeigt dir das nächste Zeichen.',
        'Die Zeit beginnt mit dem ersten Zeichen. Bei einem Fehler bleibt die Markierung stehen. Tippe das richtige Zeichen oder nutze die Rücktaste.',
        'Für Großbuchstaben brauchst du Umschalt. Prüfe bei falschen Umlauten das deutsche Tastaturlayout deines Systems.',
        'Escape pausiert die Übung. Auch beim Wechsel zu einem anderen Fenster oder Tab wird die Zeit angehalten.',
        'Deine Sterne und Bestwerte bleiben in diesem Browser. Im Privatmodus oder beim Löschen der Browserdaten können sie verloren gehen. Behalte die Datei an ihrem Ort.',
        'Nimm dir Zeit und mache kurze Pausen. Für drei Sterne zählen mindestens 98 Prozent Genauigkeit, nicht ein bestimmtes Tempo.'
      ]) list.append(element('li', '', text));
      content.append(list, element('p', 'subtle', 'Eigenständige Offline-Neuimplementierung, visuell an der öffentlich sichtbaren TypingClub-Lektionsübersicht orientiert. Nicht mit edclub verbunden.'));
    }
    $('info-dialog').showModal();
  }

  $('chapters').addEventListener('click', event => {
    const button = event.target.closest('[data-lesson]');
    if (button) startLesson(lessons.find(item => item.id === button.dataset.lesson));
  });
  $('continue-button').addEventListener('click', () => startLesson(nextLesson()));
  $('free-practice').addEventListener('change', event => { freePractice = event.target.checked; renderMap(); });
  $('dismiss-onboarding').addEventListener('click', () => { onboardingDismissed = true; $('onboarding').hidden = true; });
  $('brand').addEventListener('click', goHome);
  $('home-nav').addEventListener('click', goHome);
  $('back-button').addEventListener('click', goHome);
  $('restart-button').addEventListener('click', () => startLesson(lesson));
  $('pause-button').addEventListener('click', () => session.paused ? resume() : pause());
  $('resume-button').addEventListener('click', resume);
  $('stats-nav').addEventListener('click', () => showInfo('stats'));
  $('badges-nav').addEventListener('click', () => showInfo('badges'));
  $('help-button').addEventListener('click', () => showInfo('help'));
  $('info-close').addEventListener('click', () => $('info-dialog').close());
  $('result-map').addEventListener('click', goHome);
  $('result-retry').addEventListener('click', () => startLesson(lesson));
  $('result-next').addEventListener('click', () => lesson.number < lessons.length ? startLesson(lessons[lesson.number]) : goHome());
  $('result-dialog').addEventListener('cancel', event => { event.preventDefault(); goHome(); });
  $('reset-button').addEventListener('click', () => $('reset-dialog').showModal());
  $('reset-cancel').addEventListener('click', () => $('reset-dialog').close());
  $('reset-confirm').addEventListener('click', () => {
    progress = {}; save(); renderMap(); $('reset-dialog').close(); $('continue-button').focus();
  });
  $('typing-input').addEventListener('input', event => { if (!event.isComposing) acceptInput(); });
  $('typing-input').addEventListener('compositionstart', () => { composing = true; });
  $('typing-input').addEventListener('compositionend', () => { composing = false; acceptInput(); });
  $('typing-input').addEventListener('paste', event => { event.preventDefault(); feedback('Zum Üben bitte selbst tippen – Einfügen ist hier ausgeschaltet.'); });
  $('typing-input').addEventListener('drop', event => event.preventDefault());
  $('typing-input').addEventListener('beforeinput', event => {
    if (event.inputType === 'deleteContentBackward' && session && !composing) {
      event.preventDefault(); session.backspace(); renderTyping(); feedback('Tippe das markierte Zeichen.');
    } else if (event.inputType === 'insertFromPaste' || event.inputType === 'insertFromDrop') event.preventDefault();
  });
  $('typing-input').addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Backspace') {
      event.preventDefault(); session.backspace(); renderTyping(); feedback('Tippe das markierte Zeichen.');
    } else if (event.key === 'Enter') event.preventDefault();
    if (event.getModifierState('CapsLock')) feedback('Feststelltaste ist aktiv. Achte auf die Groß- und Kleinschreibung.', true);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !session || session.complete || $('lesson-view').hidden || document.querySelector('dialog[open]')) return;
    event.preventDefault();
    if (session.paused) resume(); else { pause(); $('resume-button').focus(); }
  });
  window.addEventListener('blur', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  renderKeyboard();
  renderMap();
  // Probe storage without modifying existing progress, even before the first lesson.
  try { storage.setItem('tippwald.storage-check', '1'); storage.removeItem('tippwald.storage-check'); }
  catch (_) { storageWorks = false; $('storage-note').textContent = 'Speichern ist hier nicht verfügbar. Fortschritt bleibt nur in dieser geöffneten Seite.'; }
})();
