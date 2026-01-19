// This file manages the user interface components, including modal behavior and form controls.
// UI helpers for AnimLib site (ES module)

export function toast(message, duration = 2200) {
  try {
    const root = document.getElementById('toastWrap');
    if (!root) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.setAttribute('role', 'status');
    node.textContent = String(message);
    root.appendChild(node);
    // auto-remove
    setTimeout(() => {
      if (!node.parentNode) return;
      // optional fade class
      node.classList.add('toast--hide');
      setTimeout(() => {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 180);
    }, duration);
  } catch (e) {
    // do nothing
    // console.error(e);
  }
}

export function restartAnimation(el, className) {
  try {
    if (!el || !className) return;
    if (el.classList && el.classList.contains(className)) el.classList.remove(className);
    // force reflow
    void el.offsetWidth;
    if (el.classList) el.classList.add(className);
  } catch (e) {
    // silent
  }
}

export function applyAnimVars(el, state = {}) {
  if (!el || !el.style) return;
  const dur = Number(state.dur ?? state.durationMs ?? 700) || 700;
  const delay = Number(state.delay ?? state.delayMs ?? 0) || 0;
  const ease = String(state.ease ?? state.easing ?? 'ease-out');
  const iter = Number(state.iter ?? state.iterations ?? 1) || 1;
  const dir = String(state.dir ?? state.direction ?? 'normal');
  const fill = String(state.fill ?? state.fillMode ?? 'both');

  try { el.style.setProperty('--animlib-duration', `${dur}ms`); } catch (e) {}
  try { el.style.setProperty('--animlib-delay', `${delay}ms`); } catch (e) {}
  try { el.style.setProperty('--animlib-easing', ease); } catch (e) {}
  try { el.style.setProperty('--animlib-iterations', String(iter)); } catch (e) {}
  try { el.style.setProperty('--animlib-direction', dir); } catch (e) {}
  try { el.style.setProperty('--animlib-fill', fill); } catch (e) {}
}

export function prefersReducedMotion() {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {
    return false;
  }
}

/*
  canPlayMotion(allowMotion)
  - allowMotion may be:
    - boolean
    - object with getter property `allowMotion`
    - function returning boolean
  - Returns a function () => boolean for callers that expect a callable checker.
*/
export function canPlayMotion(allowMotion) {
  const prefers = prefersReducedMotion();
  if (!prefers) {
    return () => true;
  }
  return () => {
    try {
      if (typeof allowMotion === 'function') return Boolean(allowMotion());
      if (allowMotion && typeof allowMotion === 'object' && 'allowMotion' in allowMotion) {
        return Boolean(allowMotion.allowMotion);
      }
      return Boolean(allowMotion);
    } catch (e) {
      return false;
    }
  };
}

/*
  setupReducedMotionToggle()
  - Manages #reducedMotionBanner and #allowMotionToggle.
  - Returns an object exposing a getter: { get allowMotion() { ... } }
  - If elements missing, returns allowMotion=true by default.
*/
export function setupReducedMotionToggle() {
  const banner = (typeof document !== 'undefined') ? document.getElementById('reducedMotionBanner') : null;
  const toggle = (typeof document !== 'undefined') ? document.getElementById('allowMotionToggle') : null;
  const prefers = prefersReducedMotion();

  if (!banner || !toggle) {
    return {
      get allowMotion() { return true; }
    };
  }

  let allow = true;

  if (prefers) {
    banner.hidden = false;
    try { toggle.checked = false; } catch (e) {}
    allow = false;
  } else {
    banner.hidden = true;
    try { toggle.checked = true; } catch (e) {}
    allow = true;
  }

  const onChange = () => {
    try { allow = !!toggle.checked; } catch (e) { allow = Boolean(allow); }
  };

  try { toggle.addEventListener('change', onChange); } catch (e) {}

  return {
    get allowMotion() {
      return Boolean(allow);
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    const allowMotionToggle = document.getElementById('allowMotionToggle');
    const reducedMotionBanner = document.getElementById('reducedMotionBanner');

    // Function to open the modal
    function openModal() {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
    }

    // Function to close the modal
    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
    }

    // Event listener for closing the modal
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target.dataset.close) {
            closeModal();
        }
    });

    // Event listener for the allow motion toggle
    allowMotionToggle.addEventListener('change', () => {
        if (allowMotionToggle.checked) {
            reducedMotionBanner.hidden = true;
        } else {
            reducedMotionBanner.hidden = false;
        }
    });

    // Function to initialize UI components
    function initUI() {
        // Additional UI initialization logic can go here
    }

    initUI();
});