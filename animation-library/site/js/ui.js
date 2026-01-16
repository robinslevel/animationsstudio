// This file manages the user interface components, including modal behavior and form controls.

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