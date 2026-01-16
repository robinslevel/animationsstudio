// This file contains the JavaScript logic specific to the playground page, allowing users to manipulate and preview animations.

document.addEventListener('DOMContentLoaded', () => {
    const previewBox = document.getElementById('playgroundPreview');
    const durationInput = document.getElementById('durationInput');
    const delayInput = document.getElementById('delayInput');
    const easingSelect = document.getElementById('easingSelect');
    const iterationsInput = document.getElementById('iterationsInput');
    const directionSelect = document.getElementById('directionSelect');
    const fillSelect = document.getElementById('fillSelect');
    const playButton = document.getElementById('playButton');

    playButton.addEventListener('click', () => {
        const duration = durationInput.value || 1000;
        const delay = delayInput.value || 0;
        const easing = easingSelect.value;
        const iterations = iterationsInput.value || 1;
        const direction = directionSelect.value;
        const fill = fillSelect.value;

        previewBox.style.animation = `exampleAnimation ${duration}ms ${delay}ms ${easing} ${iterations} ${direction} ${fill}`;
    });

    // Additional logic for handling animation selection and updates can be added here
});