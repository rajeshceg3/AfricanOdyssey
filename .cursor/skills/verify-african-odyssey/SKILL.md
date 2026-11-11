# Verify AfricanOdyssey
Africa: A Tapestry of Wonder - immersive static experience with guided tour.
## Launch
Static; serve repo root over HTTP (`python3 -m http.server`).
## Doctor
`python3 .cursor/skills/verify-african-odyssey/verify.py`
## Drive
Runs `npm test` (jest unit suites) then the playwright e2e specs on the chromium project (guided tour, details panel, security/accessibility). The config's dev server port is overridable via PW_PORT/PW_BASE_URL; the skill uses 8180 to avoid collisions.
## Evidence
`.cursor/skills/verify-african-odyssey/evidence.json`
## Cleanup
Playwright manages its webServer; nothing left running.
## Known boundaries
Only the chromium project is exercised; firefox/webkit projects need their browsers installed.
