// This file contains the main JavaScript logic for the animation library application.

// ES module powering site/index.html gallery

import { restartAnimation, setVarsOnElement, toast } from './ui.js';
import { buildShareUrl } from './share.js';
import { buildAnimationCss, copyToClipboard, downloadTextFile } from './export.js';

const JSON_PATH = '../library/animations.json';

// alias to match requested name
const applyAnimVars = (el, state) => setVarsOnElement(el, state);

// Reduced motion helpers implemented locally (uses DOM elements from page)
function setupReducedMotionToggle() {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const banner = document.getElementById('reducedMotionBanner');
  const toggle = document.getElementById('allowMotionToggle');
  let allowMotion = !prefersReduced; // if not pref, allow by default

  if (!banner || !toggle) {
    // no UI present; return a checker
    return () => allowMotion;
  }

  if (prefersReduced) {
    banner.hidden = false;
    toggle.checked = false;
    allowMotion = false;
    toggle.addEventListener('change', () => {
      allowMotion = !!toggle.checked;
      toast(allowMotion ? 'Motion previews enabled' : 'Motion previews disabled');
    });
  } else {
    banner.hidden = true;
    allowMotion = true;
  }

  return () => allowMotion;
}

function canPlayMotion(allowMotionGetter) {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return () => {
    if (!prefersReduced) return true;
    return !!allowMotionGetter();
  };
}

let animations = [];
let allowMotionGetter = () => true;
let canPlay = () => true;
let lastFocusedCard = null;
let currentAnimation = null;

document.addEventListener('DOMContentLoaded', () => {
  allowMotionGetter = setupReducedMotionToggle();
  canPlay = canPlayMotion(allowMotionGetter);
  init();
});

async function init() {
  try {
    const res = await fetch(JSON_PATH);
    if (!res.ok) throw new Error('Failed to fetch animations.json');
    animations = await res.json();
    populateCategorySelect(animations);
    renderGallery(animations);
    wireModalControls();
  } catch (err) {
    console.error(err);
    document.getElementById('gallery').innerHTML = '<div class="error">Failed to load animations.</div>';
    toast('Failed to load animations', 'error');
  }
}

/* ---------- Gallery rendering & filtering ---------- */

function populateCategorySelect(list) {
  const sel = document.getElementById('categorySelect');
  const cats = Array.from(new Set(list.map(a => a.category))).sort();
  // clear existing except "all"
  sel.innerHTML = '';
  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'All';
  sel.appendChild(allOpt);
  cats.forEach(cat => {
    const o = document.createElement('option');
    o.value = cat;
    o.textContent = cat;
    sel.appendChild(o);
  });
  sel.addEventListener('change', applyFilters);
  const search = document.getElementById('searchInput');
  if (search) search.addEventListener('input', applyFilters);
}

function applyFilters() {
  const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('categorySelect')?.value || 'all';
  const filtered = animations.filter(a => {
    if (cat !== 'all' && a.category !== cat) return false;
    if (!q) return true;
    if (a.name.toLowerCase().includes(q)) return true;
    if ((a.tags || []).join(' ').toLowerCase().includes(q)) return true;
    if (a.category.toLowerCase().includes(q)) return true;
    return false;
  });
  renderGallery(filtered);
}

function renderGallery(list) {
  const root = document.getElementById('gallery');
  root.innerHTML = '';
  list.forEach(anim => {
    const card = createCard(anim);
    root.appendChild(card);
  });
}

function createCard(anim) {
  const card = document.createElement('article');
  card.className = 'card';
  card.tabIndex = 0;
  card.dataset.id = anim.id;

  const head = document.createElement('div');
  head.className = 'card-head';
  const h3 = document.createElement('h3');
  h3.textContent = anim.name;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = anim.category;
  head.appendChild(h3);
  head.appendChild(meta);

  const tagWrap = document.createElement('div');
  tagWrap.className = 'tag-list';
  (anim.tags || []).forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t;
    tagWrap.appendChild(span);
  });

  const demoWrap = document.createElement('div');
  demoWrap.className = 'card-demo';
  const demoEl = document.createElement('div');
  demoEl.className = 'animlib-demo';
  demoEl.dataset.demo = 'true';
  demoEl.textContent = 'Preview';
  // apply defaults as CSS vars
  applyAnimVars(demoEl, {
    durationMs: anim.defaults.durationMs,
    delayMs: anim.defaults.delayMs,
    easing: anim.defaults.easing,
    iterations: anim.defaults.iterations,
    direction: anim.defaults.direction,
    fillMode: anim.defaults.fillMode
  });

  demoWrap.appendChild(demoEl);

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const playBtn = document.createElement('button');
  playBtn.className = 'btn';
  playBtn.dataset.play = 'true';
  playBtn.textContent = 'Play';

  const detailsBtn = document.createElement('button');
  detailsBtn.className = 'btn';
  detailsBtn.dataset.open = 'true';
  detailsBtn.textContent = 'Details';

  actions.appendChild(playBtn);
  actions.appendChild(detailsBtn);

  card.appendChild(head);
  card.appendChild(tagWrap);
  card.appendChild(demoWrap);
  card.appendChild(actions);

  // event handlers
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!canPlay()) {
      toast('Motion blocked by system preference. Toggle "Allow motion previews" to enable.', 'info', 3000);
      return;
    }
    // ensure animation class on demoEl
    // remove any animlib-* classes first
    removeAnimlibClasses(demoEl);
    demoEl.classList.add(anim.className);
    restartAnimation(demoEl, anim.className);
  });

  detailsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    lastFocusedCard = detailsBtn;
    openModal(anim, demoEl);
  });

  card.addEventListener('click', () => {
    lastFocusedCard = card;
    openModal(anim, demoEl);
  });

  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      lastFocusedCard = card;
      openModal(anim, demoEl);
    }
  });

  return card;
}

function removeAnimlibClasses(el) {
  if (!el || !el.classList) return;
  const toRemove = Array.from(el.classList).filter(c => c.startsWith('animlib-') && c !== 'animlib-demo');
  toRemove.forEach(c => el.classList.remove(c));
}

/* ---------- Modal logic & controls ---------- */

function wireModalControls() {
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  const backdrop = modal.querySelector('.modal-backdrop');
  const modalReplay = document.getElementById('modalReplay');
  const modalCopyCss = document.getElementById('modalCopyCss');
  const modalDownloadCss = document.getElementById('modalDownloadCss');
  const modalCopyShare = document.getElementById('modalCopyShare');

  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (ev) => {
    if (ev.target.dataset.close !== undefined || ev.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  modalReplay.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (!currentAnimation) return;
    if (!canPlay()) {
      toast('Motion blocked by system preference. Toggle "Allow motion previews" to enable.', 'info', 3000);
      return;
    }
    const preview = document.getElementById('modalPreview');
    restartAnimation(preview, currentAnimation.className);
  });

  modalCopyCss.addEventListener('click', async (ev) => {
    ev.preventDefault();
    if (!currentAnimation) return;
    try {
      const css = await buildAnimationCss(currentAnimation);
      await copyToClipboard(css);
      toast('CSS copied to clipboard', 'info', 1800);
    } catch (e) {
      console.error(e);
      toast('Failed to build CSS', 'error', 2500);
    }
  });

  modalDownloadCss.addEventListener('click', async (ev) => {
    ev.preventDefault();
    if (!currentAnimation) return;
    try {
      const css = await buildAnimationCss(currentAnimation);
      downloadTextFile(`${currentAnimation.id}.css`, css);
      toast('Download started', 'info', 1200);
    } catch (e) {
      console.error(e);
      toast('Failed to build CSS', 'error', 2500);
    }
  });

  modalCopyShare.addEventListener('click', async (ev) => {
    ev.preventDefault();
    if (!currentAnimation) return;
    const state = collectModalState();
    state.anim = currentAnimation.id;
    const url = buildShareUrl(state);
    try {
      await copyToClipboard(url);
      toast('Share URL copied', 'info', 1800);
    } catch (e) {
      console.error(e);
      toast('Failed to copy URL', 'error', 2000);
    }
  });

  // live control changes
  const controls = [
    'cDuration', 'cDelay', 'cEasing', 'cEasingCustom', 'cIterations', 'cDirection', 'cFill'
  ];
  controls.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => applyModalControlsToPreview());
    el.addEventListener('change', () => applyModalControlsToPreview());
  });

  // easing select custom show/hide
  const cEasing = document.getElementById('cEasing');
  const cEasingCustomWrap = document.getElementById('cEasingCustomWrap');
  cEasing.addEventListener('change', () => {
    if (cEasing.value === 'custom') cEasingCustomWrap.classList.remove('hidden');
    else cEasingCustomWrap.classList.add('hidden');
  });
}

function openModal(anim, demoEl) {
  currentAnimation = anim;
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const preview = document.getElementById('modalPreview');

  modalTitle.textContent = `${anim.name} — ${anim.category}`;

  // ensure base demo class present
  preview.className = 'animlib-demo';
  // remove any animlib-* classes then add new class
  removeAnimlibClasses(preview);
  preview.classList.add(anim.className);
  preview.textContent = anim.name;

  // populate controls
  const cDuration = document.getElementById('cDuration');
  const cDelay = document.getElementById('cDelay');
  const cEasing = document.getElementById('cEasing');
  const cEasingCustomWrap = document.getElementById('cEasingCustomWrap');
  const cEasingCustom = document.getElementById('cEasingCustom');
  const cIterations = document.getElementById('cIterations');
  const cDirection = document.getElementById('cDirection');
  const cFill = document.getElementById('cFill');

  cDuration.value = anim.defaults.durationMs ?? 700;
  cDelay.value = anim.defaults.delayMs ?? 0;

  // easing logic
  const known = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'];
  if (known.includes(anim.defaults.easing)) {
    cEasing.value = anim.defaults.easing;
    cEasingCustomWrap.classList.add('hidden');
    cEasingCustom.value = '';
  } else {
    cEasing.value = 'custom';
    cEasingCustomWrap.classList.remove('hidden');
    cEasingCustom.value = anim.defaults.easing;
  }

  cIterations.value = anim.defaults.iterations ?? 1;
  cDirection.value = anim.defaults.direction ?? 'normal';
  cFill.value = anim.defaults.fillMode ?? 'both';

  // apply variables immediately
  applyModalControlsToPreview();

  // autoplay unless reduced-motion blocks
  if (canPlay()) {
    // ensure animation restarts fully
    restartAnimation(preview, anim.className);
  } else {
    toast('Motion blocked by system preference. Toggle "Allow motion previews" to enable.', 'info', 3000);
  }

  modal.setAttribute('aria-hidden', 'false');
  // focus close for keyboard
  setTimeout(() => document.getElementById('modalClose')?.focus(), 20);
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.setAttribute('aria-hidden', 'true');
  currentAnimation = null;
  // return focus
  if (lastFocusedCard && lastFocusedCard.focus) lastFocusedCard.focus();
}

function applyModalControlsToPreview() {
  if (!currentAnimation) return;
  const preview = document.getElementById('modalPreview');

  const durationMs = Number(document.getElementById('cDuration').value) || currentAnimation.defaults.durationMs;
  const delayMs = Number(document.getElementById('cDelay').value) || currentAnimation.defaults.delayMs;
  const easing = (document.getElementById('cEasing').value === 'custom')
    ? (document.getElementById('cEasingCustom').value || currentAnimation.defaults.easing)
    : document.getElementById('cEasing').value;
  const iterations = Number(document.getElementById('cIterations').value) || currentAnimation.defaults.iterations;
  const direction = document.getElementById('cDirection').value || currentAnimation.defaults.direction;
  const fillMode = document.getElementById('cFill').value || currentAnimation.defaults.fillMode;

  applyAnimVars(preview, {
    durationMs,
    delayMs,
    easing,
    iterations,
    direction,
    fillMode
  });
}

function collectModalState() {
  if (!currentAnimation) return {};
  return {
    anim: currentAnimation.id,
    dur: Number(document.getElementById('cDuration').value) || currentAnimation.defaults.durationMs,
    delay: Number(document.getElementById('cDelay').value) || currentAnimation.defaults.delayMs,
    ease: (document.getElementById('cEasing').value === 'custom')
      ? (document.getElementById('cEasingCustom').value || currentAnimation.defaults.easing)
      : document.getElementById('cEasing').value,
    iter: Number(document.getElementById('cIterations').value) || currentAnimation.defaults.iterations,
    dir: document.getElementById('cDirection').value || currentAnimation.defaults.direction,
    fill: document.getElementById('cFill').value || currentAnimation.defaults.fillMode
  };
}