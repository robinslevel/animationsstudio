// This file manages sharing functionality, allowing users to copy links or share animations.

document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('modalCopyShare');
    const shareLinkInput = document.createElement('input');
    shareLinkInput.type = 'text';
    shareLinkInput.style.position = 'absolute';
    shareLinkInput.style.left = '-9999px'; // Hide the input off-screen

    document.body.appendChild(shareLinkInput);

    copyButton.addEventListener('click', () => {
        const animationId = getSelectedAnimationId(); // Function to get the currently selected animation ID
        const shareLink = `${window.location.origin}/playground.html?animation=${animationId}`;
        
        shareLinkInput.value = shareLink;
        shareLinkInput.select();
        document.execCommand('copy');

        alert('Share link copied to clipboard!');
    });
});

function getSelectedAnimationId() {
    // Placeholder function to get the currently selected animation ID
    // This should be implemented based on the actual logic of your application
    return 'example-animation-id'; // Replace with actual logic
}

export function encodeStateToParams(state = {}) {
  const params = new URLSearchParams();
  const setIf = (key, value) => {
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && value.trim() === '') return;
    params.set(key, String(value));
  };

  setIf('anim', state.anim);
  if (state.dur != null) setIf('dur', Number(state.dur));
  if (state.delay != null) setIf('delay', Number(state.delay));
  setIf('ease', state.ease);
  if (state.iter != null) setIf('iter', Number(state.iter));
  setIf('dir', state.dir);
  setIf('fill', state.fill);
  setIf('demo', state.demo);

  return params;
}

export function decodeStateFromLocation(locationLike = (typeof window !== 'undefined' ? window.location : {})) {
  let search = '';

  if (!locationLike) {
    return {
      anim: null, dur: null, delay: null, ease: null, iter: null, dir: null, fill: null, demo: null
    };
  }

  if (typeof locationLike.search === 'string' && locationLike.search.length > 0) {
    search = locationLike.search;
  } else if (typeof locationLike.href === 'string') {
    const href = locationLike.href;
    const qidx = href.indexOf('?');
    if (qidx >= 0) {
      const hashIdx = href.indexOf('#', qidx);
      search = (hashIdx >= 0) ? href.slice(qidx, hashIdx) : href.slice(qidx);
    } else {
      search = '';
    }
  } else {
    search = '';
  }

  const params = new URLSearchParams(search);
  const readStr = (k) => params.has(k) ? params.get(k) : null;
  const readNum = (k) => {
    if (!params.has(k)) return null;
    const v = params.get(k);
    if (v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  return {
    anim: readStr('anim'),
    dur: readNum('dur'),
    delay: readNum('delay'),
    ease: readStr('ease'),
    iter: readNum('iter'),
    dir: readStr('dir'),
    fill: readStr('fill'),
    demo: readStr('demo')
  };
}

export function buildShareUrl(pathname, state = {}) {
  const params = encodeStateToParams(state);
  // Determine base for URL resolution
  let base = '';
  const loc = (typeof window !== 'undefined') ? window.location : null;

  if (loc && typeof loc.origin === 'string' && loc.origin !== 'null' && loc !== null && loc.origin !== '') {
    // Use origin and current path directory as base so relative paths resolve correctly
    const dir = (typeof loc.pathname === 'string') ? loc.pathname.replace(/\/[^/]*$/, '/') : '/';
    base = loc.origin + dir;
  } else if (loc && typeof loc.href === 'string') {
    // local file or origin "null": strip query/hash and filename, use remaining as base
    let href = loc.href;
    const hashIdx = href.indexOf('#');
    if (hashIdx >= 0) href = href.slice(0, hashIdx);
    const qIdx = href.indexOf('?');
    if (qIdx >= 0) href = href.slice(0, qIdx);
    href = href.replace(/\/[^\/]*$/, '/');
    base = href;
  } else {
    base = '';
  }

  const url = new URL(pathname, base || undefined);
  url.search = params.toString();
  return url.toString();
}