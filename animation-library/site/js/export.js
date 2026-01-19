import { toast } from './ui.js';

// This file handles exporting animation settings and CSS for user convenience.

function exportAnimationSettings() {
    const duration = document.getElementById('cDuration').value;
    const delay = document.getElementById('cDelay').value;
    const easing = document.getElementById('cEasing').value;
    const iterations = document.getElementById('cIterations').value;
    const direction = document.getElementById('cDirection').value;
    const fill = document.getElementById('cFill').value;

    const settings = {
        duration,
        delay,
        easing,
        iterations,
        direction,
        fill
    };

    const settingsString = JSON.stringify(settings, null, 2);
    downloadFile('animation-settings.json', settingsString);
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('modalDownloadCss').addEventListener('click', exportAnimationSettings);

function escapeForRegex(s) {
  return s.replace(/[-\\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function extractBlock(text, startRegex) {
  // Use exec to obtain index reliably
  const rx = startRegex;
  rx.lastIndex = 0;
  const m = rx.exec(text);
  if (!m || typeof m.index !== 'number') return null;
  const headIndex = m.index;
  const braceStart = text.indexOf('{', headIndex);
  if (braceStart === -1) return null;

  let depth = 0;
  let idx = braceStart;
  const len = text.length;
  while (idx < len) {
    const ch = text[idx];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        // return from match start to this closing brace
        return text.slice(headIndex, idx + 1).trim();
      }
    }
    idx += 1;
  }
  return null;
}

export async function buildAnimationCss(animation) {
  if (!animation || !animation.keyframesName || !animation.className) {
    throw new Error('Invalid animation metadata');
  }

  let cssText = '';
  try {
    const resp = await fetch('../library/animations.css');
    if (!resp.ok) throw new Error('Could not fetch animations.css');
    cssText = await resp.text();
  } catch (err) {
    // fallback: return minimal class rule using variables
    const fallback = [
      `.${animation.className} {`,
      `  animation-name: ${animation.keyframesName};`,
      `  animation-duration: var(--animlib-duration, 700ms);`,
      `  animation-delay: var(--animlib-delay, 0ms);`,
      `  animation-timing-function: var(--animlib-easing, ease-out);`,
      `  animation-iteration-count: var(--animlib-iterations, 1);`,
      `  animation-direction: var(--animlib-direction, normal);`,
      `  animation-fill-mode: var(--animlib-fill, both);`,
      `}`
    ].join('\n');
    return fallback;
  }

  const kfName = animation.keyframesName;
  const clsName = animation.className;

  const kfRegex = new RegExp(`@keyframes\\s+${escapeForRegex(kfName)}\\s*\\{`, 'm');
  let keyframesBlock = extractBlock(cssText, kfRegex);

  if (!keyframesBlock) {
    const webkitKfRegex = new RegExp(`@-webkit-keyframes\\s+${escapeForRegex(kfName)}\\s*\\{`, 'm');
    keyframesBlock = extractBlock(cssText, webkitKfRegex);
  }

  const clsRegex = new RegExp(`\\.${escapeForRegex(clsName)}\\s*\\{`, 'm');
  let classBlock = extractBlock(cssText, clsRegex);

  // If neither found, fallback to minimal class rule
  if (!keyframesBlock && !classBlock) {
    const fallback = [
      `.${clsName} {`,
      `  /* fallback: keyframes ${kfName} not found in animations.css */`,
      `  animation-name: ${kfName};`,
      `  animation-duration: var(--animlib-duration, 700ms);`,
      `  animation-delay: var(--animlib-delay, 0ms);`,
      `  animation-timing-function: var(--animlib-easing, ease-out);`,
      `  animation-iteration-count: var(--animlib-iterations, 1);`,
      `  animation-direction: var(--animlib-direction, normal);`,
      `  animation-fill-mode: var(--animlib-fill, both);`,
      `}`
    ].join('\n');
    return fallback;
  }

  const parts = [];
  if (keyframesBlock) parts.push(keyframesBlock);
  if (classBlock) parts.push(classBlock);
  if (!classBlock) {
    parts.push([
      `.${clsName} {`,
      `  animation-name: ${kfName};`,
      `  animation-duration: var(--animlib-duration, 700ms);`,
      `  animation-delay: var(--animlib-delay, 0ms);`,
      `  animation-timing-function: var(--animlib-easing, ease-out);`,
      `  animation-iteration-count: var(--animlib-iterations, 1);`,
      `  animation-direction: var(--animlib-direction, normal);`,
      `  animation-fill-mode: var(--animlib-fill, both);`,
      `}`
    ].join('\n'));
  }

  return parts.join('\n\n');
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(String(text));
      toast('Copied to clipboard');
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = String(text);
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (ok) {
      toast('Copied to clipboard');
      return true;
    } else {
      toast('Copy failed');
      return false;
    }
  } catch (e) {
    toast('Copy failed');
    return false;
  }
}

export function downloadTextFile(filename, text) {
  try {
    const blob = new Blob([String(text)], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'animation.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Downloaded ${filename}`);
  } catch (e) {
    toast('Download failed');
  }
}