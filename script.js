/* ============================================================
   The Story of Code — navigation engine
   ============================================================ */

document.body.classList.add('js-ready');

const pages = Array.from(document.querySelectorAll('.book-page'));
const progressFill = document.querySelector('.reading-progress-fill');
const pageIndicator = document.querySelector('.page-indicator');
const pageHint = document.querySelector('.page-hint');
let currentPage = 0;

function showPage(index, { animate = true } = {}) {
  if (index < 0 || index >= pages.length) return;
  currentPage = index;

  pages.forEach((p, i) => {
    const isActive = i === index;
    p.classList.toggle('active', isActive);
    if (isActive) {
      p.classList.remove('page-enter');
      if (animate) {
        // Force reflow so the animation replays
        void p.offsetWidth;
        p.classList.add('page-enter');
      }
    }
  });

  // Progress bar
  const pct = ((index + 1) / pages.length) * 100;
  if (progressFill) progressFill.style.width = pct + '%';

  // Page indicator
  if (pageIndicator) {
    pageIndicator.textContent = `Page ${index + 1} of ${pages.length}`;
  }

  // Hide hint once the reader has moved past the cover
  if (pageHint) {
    pageHint.classList.toggle('hidden', index === 0);
  }

  // Update URL hash (without jumping)
  const id = pages[index].id;
  if (id) {
    history.replaceState(null, '', '#' + id);
  }

  // Scroll to top so a fresh page starts at its beginning
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Wire up the nav buttons */
document.querySelectorAll('[data-nav]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const dir = btn.dataset.nav;
    if (dir === 'prev') showPage(currentPage - 1);
    else if (dir === 'next') showPage(currentPage + 1);
    else if (dir === 'first') showPage(0);
  });
});

/* Keyboard navigation */
document.addEventListener('keydown', (e) => {
  // Ignore when typing in a field (not present in this book, but future-proof)
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    showPage(currentPage + 1);
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    showPage(currentPage - 1);
    e.preventDefault();
  } else if (e.key === 'Home') {
    showPage(0);
    e.preventDefault();
  } else if (e.key === 'End') {
    showPage(pages.length - 1);
    e.preventDefault();
  }
});

/* Handle clicks on the Table of Contents links */
document.querySelectorAll('.toc-page a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    const idx = pages.findIndex(p => p.id === targetId);
    if (idx >= 0) showPage(idx);
  });
});

/* Handle the browser's back / forward buttons */
window.addEventListener('hashchange', () => {
  const id = window.location.hash.slice(1);
  if (!id) return;
  const idx = pages.findIndex(p => p.id === id);
  if (idx >= 0 && idx !== currentPage) showPage(idx);
});

/* Initial page: respect the hash, otherwise start at the cover */
(function init() {
  const id = window.location.hash.slice(1);
  const idx = id ? pages.findIndex(p => p.id === id) : 0;
  showPage(idx >= 0 ? idx : 0, { animate: false });
})();