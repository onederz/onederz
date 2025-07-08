// js/floatup.js

document.addEventListener('DOMContentLoaded', () => {
    // Select all elements you want to animate.
    // *** MODIFIED THIS LINE ***
    const elementsToAnimate = document.querySelectorAll(
        '.top-page-title h1, ' +
        '.onederz-social, ' +
        '.onederz-social h2, ' +
        '.onederz-social h3, ' +
        '.character-container, ' + // Now targeting the character-container
        '.destination, ' +
        '.box, ' +          // This will select all individual destination boxes
        '#section4 .section4, ' + // The text content block in section 4
        '#section4 .we-have-cover'    // The image container in section 4
    );

    // Set up the Intersection Observer
    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px', // no margin
        threshold: 0.5 // Trigger when 50% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When element enters view (or is already in view and detected)
                // Apply its final visible state
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Stop observing this element once it's animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 1. Initialize all target elements to their hidden state
    //    and start observing them.
    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)'; // Starts 50px below its final position
        // Set the transition property directly on the element
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        element.style.willChange = 'opacity, transform'; // Performance hint for browsers

        observer.observe(element); // Start observing each element
    });

    // 2. IMPORTANT: Manually trigger the animation for elements that are already
    //    in the viewport when the page initially loads.
    elementsToAnimate.forEach(element => {
        const rect = element.getBoundingClientRect();
        // Check if the element is currently within the visible viewport AND it's still hidden
        if (rect.top < window.innerHeight && rect.bottom > 0 && element.style.opacity === '0') {
            // Add a small delay to ensure the initial 'opacity:0' has time to render
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                observer.unobserve(element); // Stop observing here too
            }, 100); // 100ms delay
        }
    });
});