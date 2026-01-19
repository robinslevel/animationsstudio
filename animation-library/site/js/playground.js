import { applyAnimVars, restartAnimation, setupReducedMotionToggle, canPlayMotion, toast } from './ui.js';
import { decodeStateFromLocation, buildShareUrl } from './share.js';
import { buildAnimationCss, copyToClipboard, downloadTextFile } from './export.js';

const JSON_PATH = '../library/animations.json';

let animations = [];
let current = null;
let allowObj = null;
let canPlay = () => true;

const els = {
  animSelect: () => document.getElementById('animSelect'),
  demoSelect: () => document.getElementById('demoSelect'),
  preview: () => document.getElementById('playgroundPreview'),
  pDuration: () => document.getElementById('pDuration'),
  pDelay: () => document.getElementById('pDelay'),
  pEasing: () => document.getElementById('pEasing'),
  pEasingCustomWrap: () => document.getElementById('pEasingCustomWrap'),
  pEasingCustom: () => document.getElementById('pEasingCustom'),
  pIterations: () => document.getElementById('pIterations'),
  pDirection: () => document.getElementById('pDirection'),
  pFill: () => document.getElementById('pFill'),
  playgroundReplay: () => document.getElementById('playgroundReplay'),
  playgroundCopyCss: () => document.getElementById('playgroundCopyCss'),
  playgroundDownloadCss: () => document.getElementById('playgroundDownloadCss'),
  playgroundCopyShare: () => document.getElementById('playgroundCopyShare')
};

document.addEventListener('DOMContentLoaded', async () => {
  allowObj = setupReducedMotionToggle();
  canPlay = canPlayMotion(allowObj);

  try {
    const res = await fetch(JSON_PATH);
    if (!res.ok) throw new Error('Failed to load animations.json');
    animations = await res.json();
  } catch (err) {
    console.error(err);
    toast('Failed to load animations', 3000);
    return;
  }

  populateAnimSelect(animations);
  wireControls();
  restoreFromUrl();
});

function populateAnimSelect(list) {
  const sel = els.animSelect();
  sel.innerHTML = '';
  list.forEach(a => {
    const o = document.createElement('option');
    o.value = a.id;
    o.textContent = `${a.name} — ${a.category}`;
    sel.appendChild(o);
  });
  sel.addEventListener('change', onAnimChange);
}

function findAnimationById(id) {
  return animations.find(a => a.id === id) || null;
}

function onAnimChange() {
  const sel = els.animSelect();
  const id = sel.value;
  const found = findAnimationById(id);
  if (!found) return;
  current = found;
  applyAnimationDefaultsToControls(found);
  ensurePreviewHasBase();
  removeAnimlibClasses(els.preview());
  // apply class but do not auto-play here
  els.preview().classList.add(found.className);
  applyCurrentVarsToPreview();
}

function ensurePreviewHasBase() {
  const p = els.preview();
  if (!p) return;
  if (!p.classList.contains('animlib-demo')) p.classList.add('animlib-demo');
}

function applyAnimationDefaultsToControls(anim) {
  const dur = anim.defaults.durationMs ?? 700;
  const delay = anim.defaults.delayMs ?? 0;
  const easing = anim.defaults.easing ?? 'ease-out';
  const iterations = anim.defaults.iterations ?? 1;
  const direction = anim.defaults.direction ?? 'normal';
  const fill = anim.defaults.fillMode ?? 'both';

  els.pDuration().value = dur;
  els.pDelay().value = delay;
  // easing handled below: if standard show select else custom
  const known = ['ease','ease-in','ease-out','ease-in-out','linear'];
  if (known.includes(easing)) {
    els.pEasing().value = easing;
    els.pEasingCustomWrap().classList.add('hidden');
    els.pEasingCustom().value = '';
  } else {
    els.pEasing().value = 'custom';
    els.pEasingCustomWrap().classList.remove('hidden');
    els.pEasingCustom().value = easing;
  }
  els.pIterations().value = iterations;
  els.pDirection().value = direction;
  els.pFill().value = fill;
}

function wireControls() {
  // demo type switch
  const demoSel = els.demoSelect();
  demoSel.addEventListener('change', applyDemoType);

  // easing custom toggle
  els.pEasing().addEventListener('change', () => {
    if (els.pEasing().value === 'custom') els.pEasingCustomWrap().classList.remove('hidden');
    else els.pEasingCustomWrap().classList.add('hidden');
    applyCurrentVarsToPreview();
  });
  els.pEasingCustom().addEventListener('input', applyCurrentVarsToPreview);

  // inputs that update vars
  ['pDuration','pDelay','pIterations','pDirection','pFill'].forEach(id => {
    const el = els[id]();
    if (!el) return;
    el.addEventListener('input', applyCurrentVarsToPreview);
    el.addEventListener('change', applyCurrentVarsToPreview);
  });

  // replay
  els.playgroundReplay().addEventListener('click', (ev) => {
    ev.preventDefault();
    if (!current) return;
    if (!canPlay()) {
      toast('Motion blocked by system preference. Toggle "Allow motion previews" to enable.', 3000);
      return;
    }
    const preview = els.preview();
    removeAnimlibClasses(preview);
    preview.classList.add(current.className);
    restartAnimation(preview, current.className);
  });

  // export copy css
  els.playgroundCopyCss().addEventListener('click', async (ev) => {
    ev.preventDefault();
    if (!current) return;
    try {
      const css = await buildAnimationCss(current);
      await copyToClipboard(css);
    } catch (e) {
      console.error(e);
      toast('Failed to get CSS', 2000);
    }
  });

  // download css
  els.playgroundDownloadCss().addEventListener('click', async (ev) => {
    ev.preventDefault();
    if (!current) return;
    try {
      const css = await buildAnimationCss(current);
      downloadTextFile(`${current.id}.css`, css);
    } catch (e) {
      console.error(e);
      toast('Failed to download CSS', 2000);
    }
  });

  // share link
  els.playgroundCopyShare().addEventListener('click', async (ev) => {
    ev.preventDefault();
    if (!current) return;
    const state = collectStateForShare();
    const url = buildShareUrl('site/playground.html', state);
    try {
      await copyToClipboard(url);
    } catch (e) {
      console.error(e);
      toast('Failed to copy share link', 2000);
    }
  });

  // animSelect change wired in populateAnimSelect
}

function applyDemoType() {
  const type = els.demoSelect().value;
  const p = els.preview();
  if (!p) return;
  // reset inline styles
  p.style.padding = '';
  p.style.borderRadius = '';
  p.style.display = '';
  p.style.fontSize = '';
  p.textContent = '';
  if (type === 'text') {
    p.textContent = 'Hello';
    p.style.padding = '0.6rem 0.9rem';
    p.style.borderRadius = '6px';
  } else if (type === 'button') {
    p.textContent = 'Click me';
    p.style.padding = '0.6rem 1rem';
    p.style.borderRadius = '999px';
  } else if (type === 'card') {
    p.textContent = 'Card preview';
    p.style.padding = '1rem 1.25rem';
    p.style.borderRadius = '8px';
    p.style.fontSize = '0.95rem';
  }
}

function applyCurrentVarsToPreview() {
  if (!current) return;
  const preview = els.preview();
  const dur = Number(els.pDuration().value) || current.defaults.durationMs;
  const delay = Number(els.pDelay().value) || current.defaults.delayMs;
  const ease = (els.pEasing().value === 'custom') ? (els.pEasingCustom().value || current.defaults.easing) : els.pEasing().value;
  const iter = Number(els.pIterations().value) || current.defaults.iterations;
  const dir = els.pDirection().value || current.defaults.direction;
  const fill = els.pFill().value || current.defaults.fillMode;

  applyAnimVars(preview, {
    dur, delay, ease, iter, dir, fill
  });
}

function removeAnimlibClasses(el) {
  if (!el || !el.classList) return;
  const toRemove = Array.from(el.classList).filter(c => c.startsWith('animlib-') && c !== 'animlib-demo');
  toRemove.forEach(c => el.classList.remove(c));
}

function collectStateForShare() {
  return {
    anim: current.id,
    dur: Number(els.pDuration().value) || current.defaults.durationMs,
    delay: Number(els.pDelay().value) || current.defaults.delayMs,
    ease: (els.pEasing().value === 'custom') ? (els.pEasingCustom().value || current.defaults.easing) : els.pEasing().value,
    iter: Number(els.pIterations().value) || current.defaults.iterations,
    dir: els.pDirection().value || current.defaults.direction,
    fill: els.pFill().value || current.defaults.fillMode,
    demo: els.demoSelect().value
  };
}

function restoreFromUrl() {
  const state = decodeStateFromLocation();
  // select animation
  const sel = els.animSelect();
  let selectedAnim = null;
  if (state.anim) {
    selectedAnim = findAnimationById(state.anim);
  }
  if (!selectedAnim && animations.length) selectedAnim = animations[0];
  if (selectedAnim) {
    sel.value = selectedAnim.id;
    current = selectedAnim;
  }

  // demo type
  if (state.demo) {
    const demoSel = els.demoSelect();
    if (['text','button','card'].includes(state.demo)) demoSel.value = state.demo;
  }

  // Apply control values: if state has values use them, else use animation defaults
  if (current) {
    // duration & delay
    if (state.dur != null) els.pDuration().value = state.dur;
    if (state.delay != null) els.pDelay().value = state.delay;

    // easing
    const known = ['ease','ease-in','ease-out','ease-in-out','linear'];
    if (state.ease) {
      if (known.includes(state.ease)) {
        els.pEasing().value = state.ease;
        els.pEasingCustomWrap().classList.add('hidden');
        els.pEasingCustom().value = '';
      } else {
        els.pEasing().value = 'custom';
        els.pEasingCustomWrap().classList.remove('hidden');
        els.pEasingCustom().value = state.ease;
      }
    } else {
      // use defaults from animation
      applyAnimationDefaultsToControls(current);
    }

    if (state.iter != null) els.pIterations().value = state.iter;
    if (state.dir) els.pDirection().value = state.dir;
    if (state.fill) els.pFill().value = state.fill;

    // set demo appearance
    applyDemoType();

    // ensure preview base class and set animation class
    ensurePreviewHasBase();
    removeAnimlibClasses(els.preview());
    els.preview().classList.add(current.className);
    // apply variables
    applyCurrentVarsToPreview();

    // autoplay only if allowed
    if (canPlay()) {
      restartAnimation(els.preview(), current.className);
    } else {
      // do not autoplay if reduced-motion blocks
      els.preview().style.animation = '';
    }
  }
}