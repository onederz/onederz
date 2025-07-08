document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in-section, .fade-in-item');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // For fade-in-sections, we might want to unobserve once visible
                // For nav highlighting, we need to keep observing, so only unobserve fade-in-item
                if (entry.target.classList.contains('fade-in-item')) {
                    observer.unobserve(entry.target);
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });


    // --- New code for active navigation link ---

    const navLinks = document.querySelectorAll('.header-bar .nav-link');
    const sections = document.querySelectorAll('section[id]'); // Select all sections that have an ID

    const highlightNavObserverOptions = {
        root: null, // relative to the viewport
        rootMargin: '-50% 0px -50% 0px', // When the middle of the section is in the middle of the viewport
        threshold: 0 // We don't care about the amount, just whether it's intersecting
    };

    const highlightNavObserverCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;

                // Remove active class from all links first
                navLinks.forEach(link => {
                    link.classList.remove('active-nav-link');
                });

                // Add active class to the link corresponding to the current section
                const activeLink = document.querySelector(`.nav-link[data-target="${currentSectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active-nav-link');
                }
            }
        });
    };

    const highlightNavObserver = new IntersectionObserver(highlightNavObserverCallback, highlightNavObserverOptions);

    sections.forEach(section => {
        highlightNavObserver.observe(section);
    });

    // Optional: Handle initial load to set active link for the first section if already in view
    // This is good practice to ensure the correct link is highlighted on page load
    const initialActiveSection = document.querySelector('.section.is-visible'); // Check if a section is already visible
    if (initialActiveSection) {
        const initialActiveLinkId = initialActiveSection.id;
        const initialActiveLink = document.querySelector(`.nav-link[data-target="${initialActiveLinkId}"]`);
        if (initialActiveLink) {
            initialActiveLink.classList.add('active-nav-link');
        }
    } else {
        // Fallback for when no section is initially visible (e.g., page loads scrolled down)
        // You might want to default to the "About" link
        const aboutLink = document.querySelector('.nav-link[data-target="facility"]');
        if (aboutLink) {
            aboutLink.classList.add('active-nav-link');
        }
    }
});

// Inside handleTouchEnd: (This seems to be from a different, incomplete script, possibly for a different slider/gallery)
// If this function is intended for the gallerySlide, it needs to be part of the gallery-specific script.
// Assuming it's part of a separate gallery component not shown in full, I will not modify it here,
// but the principle for mouse would be the same as the 'initializeSlider' function below.
function handleTouchEnd(e) {
    // This part of the code seems to be external to the main 'initializeSlider' function.
    // It's likely for a different slider component named 'gallerySlide'.
    // If you want mouse swipe for that, you'd apply similar logic as in initializeSlider.
    console.log("handleTouchEnd function called."); // Placeholder
}

// Inside updateSlide: (This also seems to be from a different, incomplete script, likely for a different slider/gallery)
function updateSlide() {
    // This part of the code seems to be external to the main 'initializeSlider' function.
    // It's likely for a different slider component named 'gallerySlide'.
    console.log("updateSlide function called."); // Placeholder
}


// Slide image

document.addEventListener('DOMContentLoaded', () => {

    // --- Universal Slider Initialization Function ---
    function initializeSlider(containerElement, sliderSelector, dotSelector) {
        const slider = containerElement.querySelector(sliderSelector);
        const images = slider.querySelectorAll('img');
        const dotsContainer = containerElement.querySelector(dotSelector);
        let dots = []; // Will be populated dynamically

        if (!slider || images.length <= 1) {
            if (dotsContainer) dotsContainer.style.display = 'none';
            return;
        }

        let currentIndex = 0;
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        let initialTranslateX = 0;
        let isHorizontalSwipe = false;

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < images.length; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateSlider();
                });
                dotsContainer.appendChild(dot);
            }
            dots = dotsContainer.querySelectorAll('.dot');
        }

        function updateSlider() {
            slider.style.transform = `translateX(${-currentIndex * 100}%)`;
            if (dots.length > 0) {
                dots.forEach((dot, index) => {
                    if (index === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        }

        // --- Touch Events ---
        containerElement.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            initialTranslateX = -currentIndex * 100;
            slider.style.transition = 'none';
            isHorizontalSwipe = false;
        }, { passive: false });

        containerElement.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;

            if (!isHorizontalSwipe) {
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
                    isHorizontalSwipe = true;
                } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
                    isDragging = false;
                    return;
                }
            }

            if (isHorizontalSwipe) {
                e.preventDefault();
                const dragPercentage = (diffX / containerElement.offsetWidth) * 100;
                let newTranslateX = initialTranslateX + dragPercentage;

                const resistance = 0.3;
                if (currentIndex === 0 && diffX > 0) {
                    newTranslateX = initialTranslateX + dragPercentage * resistance;
                } else if (currentIndex === images.length - 1 && diffX < 0) {
                    newTranslateX = initialTranslateX + dragPercentage * resistance;
                }
                slider.style.transform = `translateX(${newTranslateX}%)`;
            }
        }, { passive: false });

        containerElement.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            isHorizontalSwipe = false;
            slider.style.transition = 'transform 0.5s ease-in-out';

            const endX = e.changedTouches[0].clientX;
            const diffX = endX - startX;

            const swipeThreshold = containerElement.offsetWidth / 8;

            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0 && currentIndex > 0) {
                    currentIndex--;
                } else if (diffX < 0 && currentIndex < images.length - 1) {
                    currentIndex++;
                }
            }
            updateSlider();
        });


        // --- Mouse Events ---
        containerElement.addEventListener('mousedown', (e) => {
            // Only start dragging if left mouse button is pressed
            if (e.button !== 0) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY; // Capture Y for determining horizontal vs vertical
            initialTranslateX = -currentIndex * 100;
            slider.style.transition = 'none'; // Disable transition during drag
            isHorizontalSwipe = false; // Reset for new drag
            e.preventDefault(); // Prevent default browser drag behavior (e.g., image drag)
        });

        containerElement.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const currentX = e.clientX;
            const currentY = e.clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;

            if (!isHorizontalSwipe) {
                // Determine if it's a horizontal swipe or a vertical scroll attempt
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) { // Threshold of 5px to confirm movement
                    isHorizontalSwipe = true;
                    e.preventDefault(); // Prevent text selection
                } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
                    // If vertical movement is dominant, stop dragging for horizontal swipe
                    isDragging = false;
                    return;
                }
            }

            if (isHorizontalSwipe) {
                e.preventDefault(); // Prevent default browser behavior like text selection
                const dragPercentage = (diffX / containerElement.offsetWidth) * 100;
                let newTranslateX = initialTranslateX + dragPercentage;

                // Add resistance at the ends
                const resistance = 0.3;
                if (currentIndex === 0 && diffX > 0) {
                    newTranslateX = initialTranslateX + dragPercentage * resistance;
                } else if (currentIndex === images.length - 1 && diffX < 0) {
                    newTranslateX = initialTranslateX + dragPercentage * resistance;
                }
                slider.style.transform = `translateX(${newTranslateX}%)`;
            }
        });

        containerElement.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            isHorizontalSwipe = false;
            slider.style.transition = 'transform 0.5s ease-in-out'; // Re-enable transition

            const endX = e.clientX;
            const diffX = endX - startX;

            const swipeThreshold = containerElement.offsetWidth / 8; // Define swipe threshold

            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0 && currentIndex > 0) { // Swiped right
                    currentIndex--;
                } else if (diffX < 0 && currentIndex < images.length - 1) { // Swiped left
                    currentIndex++;
                }
            }
            updateSlider(); // Update slider to final position
        });

        // Add a mouseleave event listener to stop dragging if the mouse leaves the container
        containerElement.addEventListener('mouseleave', (e) => {
            if (isDragging && isHorizontalSwipe) { // Only snap back if a horizontal drag was in progress
                isDragging = false;
                isHorizontalSwipe = false;
                slider.style.transition = 'transform 0.5s ease-in-out';
                updateSlider(); // Snap to the current slide
            }
        });

        updateSlider();
    }

    // --- Initialize All Sliders on the Page ---
    const mainHeroContainer = document.querySelector('.hero-content .slider-container');
    if (mainHeroContainer) {
        initializeSlider(mainHeroContainer, '.slider', '.dots-container');
    }

    const roomImageContainers = document.querySelectorAll('.room-box .room-image-slider-container');
    roomImageContainers.forEach(container => {
        initializeSlider(container, '.room-image-slider', '.dots-container');
    });

});

document.addEventListener('DOMContentLoaded', () => {
    // Select ALL elements that should trigger the Room popup
    // This includes the header item AND the standalone 'Discover more' button
    const roomTriggers = document.querySelectorAll('.discover-our-room'); // Selects both header and standalone
    const roomPopup = document.querySelector('.room-popup');
    const closeRoomBtn = document.querySelector('.close-rooms');

    // Select ALL elements that should trigger the Tour popup
    const tourTriggers = document.querySelectorAll('.discover-our-tour'); // Selects both header and standalone
    const tourPopup = document.querySelector('.tour-popup');
    const closeTourBtn = document.querySelector('.close-tours');

    // Select ALL elements that should trigger the Food popup
    const foodTriggers = document.querySelectorAll('.discover-our-food'); // Selects both header and standalone
    const foodPopup = document.querySelector('.food-popup');
    const closeFoodBtn = document.querySelector('.close-foods');

    const body = document.body;

    // Initialize popups as hidden (add checks for existence)
    if (roomPopup) roomPopup.style.display = 'none';
    if (tourPopup) tourPopup.style.display = 'none';
    if (foodPopup) foodPopup.style.display = 'none';

    // --- Room Popup Functions ---
    function showRoomPopup() {
        if (!roomPopup) return; // Ensure popup element exists
        body.style.overflow = 'hidden'; // Disable body scroll
        roomPopup.style.display = 'block';
        roomPopup.scrollTop = 0; // Reset scroll position

        setTimeout(() => {
            roomPopup.classList.add('active');
            roomPopup.classList.remove('slide-out');
        }, 10);
    }

    function hideRoomPopup() {
        if (!roomPopup) return; // Ensure popup element exists
        roomPopup.classList.remove('active');
        roomPopup.classList.add('slide-out');

        roomPopup.addEventListener('transitionend', function handler() {
            if (roomPopup.classList.contains('slide-out')) {
                roomPopup.style.display = 'none';
                body.style.overflow = ''; // Re-enable body scroll
                roomPopup.removeEventListener('transitionend', handler);
            }
        }, { once: true });
    }

    // --- Tour Popup Functions ---
    function showTourPopup() {
        if (!tourPopup) return; // Ensure popup element exists
        body.style.overflow = 'hidden'; // Disable body scroll
        tourPopup.style.display = 'block';
        tourPopup.scrollTop = 0; // Reset scroll position

        setTimeout(() => {
            tourPopup.classList.add('active');
            tourPopup.classList.remove('slide-out');
        }, 10);
    }

    function hideTourPopup() {
        if (!tourPopup) return; // Ensure popup element exists
        tourPopup.classList.remove('active');
        tourPopup.classList.add('slide-out');

        tourPopup.addEventListener('transitionend', function handler() {
            if (tourPopup.classList.contains('slide-out')) {
                tourPopup.style.display = 'none';
                body.style.overflow = ''; // Re-enable body scroll
                tourPopup.removeEventListener('transitionend', handler);
            }
        }, { once: true });
    }

    // --- Food Popup Functions ---
    function showFoodPopup() {
        if (!foodPopup) return; // Ensure popup element exists
        body.style.overflow = 'hidden'; // Disable body scroll
        foodPopup.style.display = 'block';
        foodPopup.scrollTop = 0; // Reset scroll position

        setTimeout(() => {
            foodPopup.classList.add('active');
            foodPopup.classList.remove('slide-out');
        }, 10);
    }

    function hideFoodPopup() {
        if (!foodPopup) return; // Ensure popup element exists
        foodPopup.classList.remove('active');
        foodPopup.classList.add('slide-out');

        foodPopup.addEventListener('transitionend', function handler() {
            if (foodPopup.classList.contains('slide-out')) {
                foodPopup.style.display = 'none';
                body.style.overflow = ''; // Re-enable body scroll
                foodPopup.removeEventListener('transitionend', handler);
            }
        }, { once: true });
    }

    // --- Attach Event Listeners to ALL Triggers ---

    // For Room Popups
    roomTriggers.forEach(btn => {
        btn.addEventListener('click', showRoomPopup);
    });
    if (closeRoomBtn) {
        closeRoomBtn.addEventListener('click', hideRoomPopup);
    }
    if (roomPopup) { // Close when clicking outside the popup content
        roomPopup.addEventListener('click', (e) => {
            if (e.target === roomPopup) {
                hideRoomPopup();
            }
        });
    }

    // For Tour Popups
    tourTriggers.forEach(btn => {
        btn.addEventListener('click', showTourPopup);
    });
    if (closeTourBtn) {
        closeTourBtn.addEventListener('click', hideTourPopup);
    }
    if (tourPopup) { // Close when clicking outside the popup content
        tourPopup.addEventListener('click', (e) => {
            if (e.target === tourPopup) {
                hideTourPopup();
            }
        });
    }

    // For Food Popups
    foodTriggers.forEach(btn => {
        btn.addEventListener('click', showFoodPopup);
    });
    if (closeFoodBtn) {
        closeFoodBtn.addEventListener('click', hideFoodPopup);
    }
    if (foodPopup) { // Close when clicking outside the popup content
        foodPopup.addEventListener('click', (e) => {
            if (e.target === foodPopup) {
                hideFoodPopup();
            }
            // Optional: If the popup content itself has a scrollable area,
            // ensure clicking *inside* it doesn't close the popup.
            // You might need more specific targeting for background click close.
        });
    }


    // Optional: Fade-in animation for sections on scroll
    const fadeSections = document.querySelectorAll('.fade-in-section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeSections.forEach(section => {
        sectionObserver.observe(section);
    });

    
});

document.addEventListener('DOMContentLoaded', () => {

    // --- Modal Element Definitions ---
    const dormReadMoreBtn = document.getElementById('dormReadMoreBtn');
    const dormInfoModal = document.getElementById('dormInfoModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn'); // 'X' button for dorm modal
    const modalInternalCloseBtn = document.getElementById('modalInternalCloseBtn'); // 'Close' text button for dorm modal

    const amenitiesModal = document.getElementById('amenitiesModal');
    const amenitiesLink = document.getElementById('amenities-link'); // Assuming you have a trigger with this ID
    const closeAmenitiesButton = document.querySelector('#amenitiesModal .amenities-modal-close-button '); // Your 'X' button inside amenitiesModal

    const contactModal = document.getElementById('contactModal');
    const contactTrigger = document.getElementById('contactTrigger'); // The div you want to click to open it
    const closeContactButton = document.querySelector('#contactModal .contact-modal-close-button'); // The 'X' button inside contactModal

    // NEW: Location Modal elements
    const locationModal = document.getElementById('locationModal');
    const locationLink = document.getElementById('location-link'); // Assuming a trigger with this ID for the location modal
    const closeLocationButton = document.querySelector('#locationModal .location-modal-close-button'); // The 'X' button inside locationModal

    const goodToKnowModal = document.getElementById('goodToKnowModal');
    const goodToKnowLink = document.getElementById('good-to-know-link');
    const closeGoodToKnowButton = document.querySelector('#goodToKnowModal .goodtoknow-modal-close-button');

    // --- Generic Modal Handling Functions ---
    // Function to show a generic modal
    function showModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.add('visible');
        document.body.style.overflow = 'hidden'; // ALWAYS disable scrolling on document.body
        modalElement.scrollTop = 0; // Reset scroll position for the modal content
    }

    // Function to hide a generic modal
    function hideModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.remove('visible');
        document.body.style.overflow = ''; // ALWAYS re-enable scrolling on document.body
    }

    // --- Ensure modals are initially hidden (not visible) ---
    if (dormInfoModal) dormInfoModal.classList.remove('visible');
    if (amenitiesModal) amenitiesModal.classList.remove('visible');
    if (contactModal) contactModal.classList.remove('visible');
    if (locationModal) locationModal.classList.remove('visible'); // NEW: Ensure location modal is hidden initially
    if (goodToKnowModal) goodToKnowModal.classList.remove('visible');


    // --- Dorm Info Modal Event Listeners ---
    if (dormReadMoreBtn) {
        dormReadMoreBtn.addEventListener('click', () => showModal(dormInfoModal));
    }
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => hideModal(dormInfoModal));
    }
    if (modalInternalCloseBtn) {
        modalInternalCloseBtn.addEventListener('click', () => hideModal(dormInfoModal));
    }
    if (dormInfoModal) {
        dormInfoModal.addEventListener('click', (event) => {
            if (event.target === dormInfoModal) {
                hideModal(dormInfoModal);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && dormInfoModal.classList.contains('visible')) {
                hideModal(dormInfoModal);
            }
        });
    }

    // --- Amenities Modal Event Listeners ---
    if (amenitiesLink) {
        amenitiesLink.addEventListener('click', (event) => {
            event.preventDefault();
            showModal(amenitiesModal);
        });
    }
    if (closeAmenitiesButton) {
        closeAmenitiesButton.addEventListener('click', () => hideModal(amenitiesModal));
    }
    if (amenitiesModal) {
        amenitiesModal.addEventListener('click', (event) => {
            if (event.target === amenitiesModal) {
                hideModal(amenitiesModal);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && amenitiesModal.classList.contains('visible')) {
                hideModal(amenitiesModal);
            }
        });
    }

    // --- Contact Modal Event Listeners ---
    if (contactTrigger) {
        contactTrigger.addEventListener('click', () => showModal(contactModal));
    }
    if (closeContactButton) {
        closeContactButton.addEventListener('click', () => hideModal(contactModal));
    }
    if (contactModal) {
        contactModal.addEventListener('click', (event) => {
            if (event.target === contactModal) {
                hideModal(contactModal);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && contactModal.classList.contains('visible')) {
                hideModal(contactModal);
            }
        });
    }

    // --- NEW: Location Modal Event Listeners ---
    if (locationLink) {
        locationLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior if it's an anchor
            showModal(locationModal);
        });
    }
    if (closeLocationButton) {
        closeLocationButton.addEventListener('click', () => hideModal(locationModal));
    }
    if (locationModal) {
        locationModal.addEventListener('click', (event) => {
            if (event.target === locationModal) {
                hideModal(locationModal);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && locationModal.classList.contains('visible')) {
                hideModal(locationModal);
            }
        });
    }

    if (goodToKnowLink) {
        goodToKnowLink.addEventListener('click', (event) => {
            event.preventDefault();
            showModal(goodToKnowModal);
        });
    }
    if (closeGoodToKnowButton) {
        closeGoodToKnowButton.addEventListener('click', () => hideModal(goodToKnowModal));
    }
    if (goodToKnowModal) {
        goodToKnowModal.addEventListener('click', (event) => {
            if (event.target === goodToKnowModal) {
                hideModal(goodToKnowModal);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && goodToKnowModal.classList.contains('visible')) {
                hideModal(goodToKnowModal);
            }
        });
    }
    // --- Other Popups (Room, Tour, Food, etc.) - if you want them to stop body scroll, ensure they also use showModal/hideModal ---

    // Room Popup (Assuming this is a separate modal, not related to the main body scroll `roomPopup` variable)
    const roomTriggers = document.querySelectorAll('.discover-our-room');
    const roomPopupModal = document.querySelector('.room-popup'); // This should likely be a different ID or class if it's a modal, not the main scroll container
    const closeRoomBtn = document.querySelector('.close-rooms');

    // IMPORTANT: If .room-popup is ONLY used as a modal, then the `roomPopup` variable (the one that manages overflow) should be removed or renamed.
    // If it is both a main content container AND a modal, that structure is unusual and might cause conflicts.
    // Assuming 'roomPopupModal' is the actual modal element here:
    if (roomPopupModal) roomPopupModal.classList.remove('visible');

    roomTriggers.forEach(btn => {
        btn.addEventListener('click', () => showModal(roomPopupModal));
    });
    if (closeRoomBtn) {
        closeRoomBtn.addEventListener('click', () => hideModal(roomPopupModal));
    }
    if (roomPopupModal) {
        roomPopupModal.addEventListener('click', (e) => {
            if (e.target === roomPopupModal) {
                hideModal(roomPopupModal);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && roomPopupModal.classList.contains('visible')) {
                hideModal(roomPopupModal);
            }
        });
    }


    // Tour Popup
    const tourTriggers = document.querySelectorAll('.discover-our-tour');
    const tourPopup = document.querySelector('.tour-popup');
    const closeTourBtn = document.querySelector('.close-tours');

    if (tourPopup) tourPopup.classList.remove('visible');

    tourTriggers.forEach(btn => {
        btn.addEventListener('click', () => showModal(tourPopup));
    });
    if (closeTourBtn) {
        closeTourBtn.addEventListener('click', () => hideModal(tourPopup));
    }
    if (tourPopup) {
        tourPopup.addEventListener('click', (e) => {
            if (e.target === tourPopup) {
                hideModal(tourPopup);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && tourPopup.classList.contains('visible')) {
                hideModal(tourPopup);
            }
        });
    }

    // Food Popup
    const foodTriggers = document.querySelectorAll('.discover-our-food');
    const foodPopup = document.querySelector('.food-popup');
    const closeFoodBtn = document.querySelector('.close-foods');

    if (foodPopup) foodPopup.classList.remove('visible');

    foodTriggers.forEach(btn => {
        btn.addEventListener('click', () => showModal(foodPopup));
    });
    if (closeFoodBtn) {
        closeFoodBtn.addEventListener('click', () => hideModal(foodPopup));
    }
    if (foodPopup) {
        foodPopup.addEventListener('click', (e) => {
            if (e.target === foodPopup) {
                hideModal(foodPopup);
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && foodPopup.classList.contains('visible')) {
                hideModal(foodPopup);
            }
        });
    }


    // --- Universal Fade-in Elements on Scroll ---
    const fadeElements = document.querySelectorAll('.fade-in-section, .fade-in-item');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                if (entry.target.classList.contains('fade-in-item')) {
                    observer.unobserve(entry.target);
                }
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // --- Active Navigation Link Highlighting ---
    const navLinks = document.querySelectorAll('.header-bar .nav-link');
    const sections = document.querySelectorAll('section[id]');

    const highlightNavObserverOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const highlightNavObserverCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active-nav-link');
                });
                const activeLink = document.querySelector(`.nav-link[data-target="${currentSectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active-nav-link');
                }
            }
        });
    };

    const highlightNavObserver = new IntersectionObserver(highlightNavObserverCallback, highlightNavObserverOptions);
    sections.forEach(section => {
        highlightNavObserver.observe(section);
    });

    const initialActiveSection = document.querySelector('.section.is-visible');
    if (initialActiveSection) {
        const initialActiveLinkId = initialActiveSection.id;
        const initialActiveLink = document.querySelector(`.nav-link[data-target="${initialActiveLinkId}"]`);
        if (initialActiveLink) {
            initialActiveLink.classList.add('active-nav-link');
        }
    } else {
        const firstLink = navLinks[0];
        if (firstLink) {
            firstLink.classList.add('active-nav-link');
        }
    }

    // --- Universal Slider Initialization Function ---
    function initializeSlider(containerElement, sliderSelector, dotSelector) {
        const slider = containerElement.querySelector(sliderSelector);
        const images = slider ? slider.querySelectorAll('img') : [];
        const dotsContainer = containerElement.querySelector(dotSelector);
        let dots = [];

        if (!slider || images.length <= 1) {
            if (dotsContainer) dotsContainer.style.display = 'none';
            return;
        }

        let currentIndex = 0;
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        let initialTranslateX = 0;
        let isHorizontalSwipe = false;

        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < images.length; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) {
                    dot.classList.add('active');
                }
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateSlider();
                });
                dotsContainer.appendChild(dot);
            }
            dots = dotsContainer.querySelectorAll('.dot');
        }

        function updateSlider() {
            slider.style.transform = `translateX(${-currentIndex * 100}%)`;
            if (dots.length > 0) {
                dots.forEach((dot, index) => {
                    if (index === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        }

        containerElement.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            initialTranslateX = -currentIndex * 100;
            slider.style.transition = 'none';
            isHorizontalSwipe = false;
        }, { passive: false });

        containerElement.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;

            if (!isHorizontalSwipe) {
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
                    isHorizontalSwipe = true;
                } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
                    isDragging = false;
                    return;
                }
            }

            if (isHorizontalSwipe) {
                e.preventDefault();
                const dragPercentage = (diffX / containerElement.offsetWidth) * 100;
                let newTranslateX = initialTranslateX + dragPercentage;

                const resistance = 0.3;
                if (currentIndex === 0 && diffX > 0) {
                    newTranslateX = initialTranslateX + dragPercentage * resistance;
                } else if (currentIndex === images.length - 1 && diffX < 0) {
                    newTranslateX = initialTranslateX + dragPercentage * resistance;
                }
                slider.style.transform = `translateX(${newTranslateX}%)`;
            }
        }, { passive: false });

        containerElement.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            isHorizontalSwipe = false;
            slider.style.transition = 'transform 0.5s ease-in-out';

            const endX = e.changedTouches[0].clientX;
            const diffX = endX - startX;
            const swipeThreshold = containerElement.offsetWidth / 8;

            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0 && currentIndex > 0) {
                    currentIndex--;
                } else if (diffX < 0 && currentIndex < images.length - 1) {
                    currentIndex++;
                }
            }
            updateSlider();
        });


        containerElement.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialTranslateX = -currentIndex * 100;
            slider.style.transition = 'none';
            isHorizontalSwipe = false;
            e.preventDefault();
        });

        containerElement.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const currentX = e.clientX;
            const currentY = e.clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;

            if (!isHorizontalSwipe) {
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 5) {
                    isHorizontalSwipe = true;
                    e.preventDefault();
                } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
                    isDragging = false;
                    return;
                }
            }

            if (isHorizontalSwipe) {
                e.preventDefault();
                const dragPercentage = (diffX / containerElement.offsetWidth) * 100;
                let newTranslateX = initialTranslateX + dragPercentage;

                const resistance = 0.3;
                if (currentIndex === 0 && diffX > 0) {
                    newTranslateX = initialTranslateX + dragPercentage * resistance;
                } else if (currentIndex === images.length - 1 && diffX < 0) {
                    newTranslateX = initialTranslateX + dragPercentage * resistance;
                }
                slider.style.transform = `translateX(${newTranslateX}%)`;
            }
        });

        containerElement.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            isHorizontalSwipe = false;
            slider.style.transition = 'transform 0.5s ease-in-out';

            const endX = e.clientX;
            const diffX = endX - startX;

            const swipeThreshold = containerElement.offsetWidth / 8;

            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0 && currentIndex > 0) {
                    currentIndex--;
                } else if (diffX < 0 && currentIndex < images.length - 1) {
                    currentIndex++;
                }
            }
            updateSlider();
        });

        containerElement.addEventListener('mouseleave', (e) => {
            if (isDragging && isHorizontalSwipe) {
                isDragging = false;
                isHorizontalSwipe = false;
                slider.style.transition = 'transform 0.5s ease-in-out';
                updateSlider();
            }
        });

        updateSlider();
    }

    // --- Initialize All Sliders on the Page ---
    const mainHeroContainer = document.querySelector('.hero-content .slider-container');
    if (mainHeroContainer) {
        initializeSlider(mainHeroContainer, '.slider', '.dots-container');
    }

    const roomImageContainers = document.querySelectorAll('.room-box .room-image-slider-container');
    roomImageContainers.forEach(container => {
        initializeSlider(container, '.room-image-slider', '.dots-container');
    });

}); // End of DOMContentLoaded


document.addEventListener('DOMContentLoaded', function() {
            const menuToggle = document.getElementById('menu');
            const mobileMenu = document.getElementById('mobileMenu');
            const mobileMenuItems = mobileMenu.querySelectorAll('.header-discover');
            const overlay = document.getElementById('overlay'); // Get the new overlay element
            const body = document.body; // Get the body element

            // Function to open the menu
            function openMenu() {
                mobileMenu.classList.add('open');
                overlay.classList.add('active'); // Show overlay
                body.classList.add('no-scroll'); // Disable scrolling
                menuToggle.setAttribute('aria-expanded', 'true');
            }

            // Function to close the menu
            function closeMenu() {
                mobileMenu.classList.remove('open');
                overlay.classList.remove('active'); // Hide overlay
                body.classList.remove('no-scroll'); // Enable scrolling
                menuToggle.setAttribute('aria-expanded', 'false');
            }

            // Toggle menu open/close
            menuToggle.addEventListener('click', function() {
                if (mobileMenu.classList.contains('open')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            // Close menu and scroll when a menu item (p tag) is clicked
            mobileMenuItems.forEach(item => {
                item.addEventListener('click', function() {
                    closeMenu(); // Close menu
                    // Get the ID from the clicked paragraph
                    const targetId = this.id;
                    if (targetId) {
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                });
            });

            // Close menu when clicking on the overlay or outside of the menu/toggle button
            document.addEventListener('click', function(event) {
                const isClickInsideMenu = mobileMenu.contains(event.target);
                const isClickOnToggle = menuToggle.contains(event.target);
                const isClickOnOverlay = overlay.contains(event.target); // Check if click is on overlay

                if (mobileMenu.classList.contains('open')) {
                    // If menu is open and click is on overlay, or outside both menu/toggle
                    if (isClickOnOverlay || (!isClickInsideMenu && !isClickOnToggle)) {
                        closeMenu();
                    }
                }
            });
        });

        function toggleSection(headerElement) {
            const content = headerElement.nextElementSibling;
            const arrow = headerElement.querySelector('.arrow');

            if (content.style.display === "block") {
                content.style.display = "none";
                headerElement.classList.remove('active');
            } else {
                
                content.style.display = "block";
                headerElement.classList.add('active');
            }
        }