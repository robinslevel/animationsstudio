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