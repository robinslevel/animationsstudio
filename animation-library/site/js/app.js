// This file contains the main JavaScript logic for the animation library application.

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categorySelect');
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalPreview = document.getElementById('modalPreview');
    const controlsForm = document.getElementById('controlsForm');

    let animations = [];

    // Fetch animations from the JSON file
    fetch('../library/animations.json')
        .then(response => response.json())
        .then(data => {
            animations = data;
            populateGallery(animations);
            populateCategories(animations);
        });

    function populateGallery(animations) {
        gallery.innerHTML = '';
        animations.forEach(animation => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${animation.name}</h3>
                <button class="btn" data-animation="${animation.cssClass}">View</button>
            `;
            gallery.appendChild(card);
        });
        addGalleryEventListeners();
    }

    function populateCategories(animations) {
        const categories = [...new Set(animations.map(animation => animation.category))];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    function addGalleryEventListeners() {
        const buttons = document.querySelectorAll('.card .btn');
        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                const animationClass = event.target.getAttribute('data-animation');
                openModal(animationClass);
            });
        });
    }

    function openModal(animationClass) {
        modalTitle.textContent = animationClass;
        modalPreview.className = `preview-box ${animationClass}`;
        modal.setAttribute('aria-hidden', 'false');
    }

    modalClose.addEventListener('click', () => {
        modal.setAttribute('aria-hidden', 'true');
    });

    controlsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Handle form submission for animation controls
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredAnimations = animations.filter(animation => animation.name.toLowerCase().includes(query));
        populateGallery(filteredAnimations);
    });

    categorySelect.addEventListener('change', () => {
        const selectedCategory = categorySelect.value;
        const filteredAnimations = selectedCategory === 'all' ? animations : animations.filter(animation => animation.category === selectedCategory);
        populateGallery(filteredAnimations);
    });
});