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