/* Original, dependency-free typing model. Also usable from Node for tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TippEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  class Session {
    constructor(text, now = () => performance.now()) {
      this.text = Array.from(text.normalize('NFC'));
      this.now = now;
      this.position = 0;
      this.attempts = 0;
      this.hits = 0;
      this.mistake = '';
      this.activeSince = null;
      this.elapsed = 0;
      this.started = false;
      this.paused = false;
      this.complete = this.text.length === 0;
    }
    resume() {
      if (this.complete) return;
      this.paused = false;
      if (this.started && this.activeSince === null) this.activeSince = this.now();
    }
    pause() {
      if (this.activeSince !== null) this.elapsed += Math.max(0, this.now() - this.activeSince);
      this.activeSince = null;
      this.paused = true;
    }
    type(character) {
      if (this.complete || this.paused) return false;
      const normalized = character.normalize('NFC');
      if (Array.from(normalized).length !== 1) return false;
      if (!this.started) {
        this.started = true;
        this.activeSince = this.now();
      }
      this.attempts += 1;
      if (normalized !== this.text[this.position]) {
        this.mistake = normalized;
        return false;
      }
      this.hits += 1;
      this.position += 1;
      this.mistake = '';
      if (this.position === this.text.length) {
        this.pause();
        this.complete = true;
        this.paused = false;
      }
      return true;
    }
    backspace() {
      if (this.complete || this.paused) return;
      if (this.mistake) this.mistake = '';
      else this.position = Math.max(0, this.position - 1);
    }
    stats() {
      const milliseconds = this.elapsed + (this.activeSince === null ? 0 : Math.max(0, this.now() - this.activeSince));
      const accuracy = this.attempts ? Math.round(this.hits / this.attempts * 100) : 100;
      const wpm = this.started ? Math.round((this.position / 5) / (Math.max(1000, milliseconds) / 60000)) : 0;
      const stars = this.complete ? (accuracy >= 98 ? 3 : accuracy >= 90 ? 2 : 1) : 0;
      return { milliseconds, accuracy, wpm, stars, progress: this.text.length ? this.position / this.text.length : 1 };
    }
  }
  function readProgress(storage) {
    try {
      const data = JSON.parse(storage.getItem('tippwald.progress.v1') || '{}');
      if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
      const clean = {};
      for (const [id, item] of Object.entries(data)) {
        if (!/^lesson-\d+$/.test(id) || !item || typeof item !== 'object') continue;
        if (![item.stars, item.wpm, item.accuracy].every(Number.isFinite)) continue;
        if (item.stars < 1 || item.stars > 3 || !Number.isInteger(item.stars) || item.wpm < 0 || item.accuracy < 0 || item.accuracy > 100) continue;
        clean[id] = { stars: item.stars, wpm: Math.min(999, item.wpm), accuracy: item.accuracy };
      }
      return clean;
    } catch (_) { return {}; }
  }
  function bestResult(old, result) {
    return {
      stars: Math.max(old?.stars || 0, result.stars),
      wpm: Math.max(old?.wpm || 0, Math.min(999, result.wpm)),
      accuracy: Math.max(old?.accuracy || 0, result.accuracy)
    };
  }
  return { Session, readProgress, bestResult };
});
