
/**
 * Shows the selected screen and updates sidebar nav state.
 * Also lazily initializes the History chart on first visit.
 * @param {string} name       - screen key: 'dashboard' | 'sensors' | 'history' | 'arch' | 'settings'
 * @param {HTMLElement} [el]  - the nav-item element that was clicked
 */
function showScreen(name, el) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  // Show the target screen
  document.getElementById('screen-' + name).classList.add('active');
  // Update topbar title
  document.getElementById('pageTitle').textContent = PAGE_TITLES[name];
  // Update sidebar nav active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');

  // Lazy-initialize history chart the first time the screen is opened
  if (name === 'history' && !histChart) {
    setTimeout(initHistChart, 50);
  }
}

function updateClock() {
  const el = document.getElementById('clock');
  if (el) el.textContent = new Date().toLocaleTimeString();
}

// ── Settings Helpers ───────────────────────────────────────

/**
 * Provides visual feedback when a settings save button is clicked.
 * Temporarily changes the button text to "✓ Saved!" then restores it.
 * @param {HTMLElement} btn   - the button element
 * @param {string} originalText - text to restore after 1.5s
 */
function savedFeedback(btn, originalText) {
  btn.textContent = '✓ Saved!';
  setTimeout(() => { btn.textContent = originalText; }, 1500);
}

function initApp() {
  // Start clock and tick immediately
  updateClock();
  setInterval(updateClock, 1000);

  initMainChart();
}

document.addEventListener('DOMContentLoaded', initApp);
