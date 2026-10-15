TIPPWALD — Deutsch tippen lernen
===============================

START
Double-click index.html in this folder. Choose Firefox or Chromium if asked.
The app is in German. No terminal, installation, server or internet needed.
You launch it yourself; no browser or service is started automatically.

36 lessons cover home-row keys, the alphabet, ä/ö/ü/ß, everyday words,
sentences and short stories. Guided lessons unlock in order. Select
"Freies Üben" to open all lessons and jump straight to words or sentences.
Choose a lesson, then type the displayed text in the input field.
The timer starts on your first typed character. An incorrect character does
not advance the cursor: type the right character to continue. Backspace
clears the error or steps back one character. Paste is disabled for practice.
Use a German QWERTZ input layout on your own keyboard/system for umlauts.

Escape pauses/resumes. Leaving the browser tab/window pauses automatically.
The visual keyboard is a guide, not a clickable input keyboard.
Three stars: at least 98% accuracy. Two: at least 90%. One: completion.
WPM means five correct characters per word, divided by active typing time.
Attempts after using Backspace still count toward overall accuracy.

PROGRESS AND PRIVACY
Progress is saved only in this browser, using localStorage. Keep this folder
at its current location and use the same browser. Private windows, browser
data deletion, and moving the file may lose/reset your stored progress.
If the browser blocks file-based storage, the app still works and tells you
that progress only lasts until the page closes. Reset asks for confirmation.
There are no accounts, advertisements, analytics, remote fonts or network calls.
Only best stars, speed and accuracy per lesson are saved, not everything typed.

FILES
Keep these six files together to run or copy the app:
  index.html, styles.css, app.js, engine.js, lessons.js, icon.svg
Other files are development checks/reference inspection helpers, not runtime
dependencies. .recon is an isolated 19 MB Playwright research package, not
used by the app. No browser binary was downloaded for this project.

CHECKS (optional, Node.js already on this machine)
  node --check app.js
  node --test --test-concurrency=1 test-engine.cjs test-static.cjs

DESIGN AND LIMITS
Independent implementation based on the publicly visible lesson-map layout
at https://www.edclub.com/sportal/program-3.game (TypingClub / edclub).
Original code, lesson text, icons and styling. No copied source, branding,
fonts, media or paid lessons. No affiliation with edclub.
This is a focused German typing trainer, not the full edclub platform:
no videos, online accounts, school dashboard or advanced game modes.

The lesson map, keyboard exercise and completion screens were inspected
publicly in Firefox on this Dell. Source/model checks are
run locally; final interactive/visual testing waits for the user's launch.
No system settings, administrator permissions, or remote machine are needed.
