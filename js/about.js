document.addEventListener('DOMContentLoaded', function() {
    function handleScroll() {
        const elements = document.querySelectorAll('.page-contents');
        const viewportHeight = window.innerHeight;

        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top;
            const elementBottom = rect.bottom;

            console.log(`Element top: ${elementTop}, bottom: ${elementBottom}, viewportHeight: ${viewportHeight}`);

            if (elementTop < viewportHeight * 0.75 && elementBottom > 0) {
                // Ensure the element is visible
                element.style.opacity = 1;
                element.style.transition = 'opacity 0.5s ease-out'; // Optional: Smooth transition

                const img = element.querySelector('.about-img');
                const description = element.querySelector('.about-description');

                if (img) {
                    img.style.transition = 'transform 0.5s ease-out'; // Optional: Smooth transition
                    img.style.transform = 'translateX(0)';
                }

                if (description) {
                    description.style.transition = 'transform 0.5s ease-out'; // Optional: Smooth transition
                    description.style.transform = 'translateX(0)';
                }
            } else {
                // Optionally reset the element styles if you want them to reanimate when re-entering the viewport
                element.style.opacity = 0;

                const img = element.querySelector('.about-img');
                const description = element.querySelector('.about-description');

                if (img) {
                    img.style.transform = 'translateX(-100px)'; // Initial position
                }

                if (description) {
                    description.style.transform = 'translateX(100px)'; // Initial position
                }
            }
        });
    }

    // Attach the scroll event listener
    window.addEventListener('scroll', () => {
        requestAnimationFrame(handleScroll);
    });

    // Run the function initially in case elements are already in view on page load
    handleScroll();
});


