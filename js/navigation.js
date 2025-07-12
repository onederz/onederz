document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mobileMenu = document.getElementById('menu');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    // Scroll Lock Management
    let scrollY = 0;
    const lockScroll = () => {
        scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
    };
    
    const unlockScroll = () => {
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('position');
        document.body.style.removeProperty('top');
        document.body.style.removeProperty('width');
        window.scrollTo(0, scrollY);
    };

    // Dropdown Management
    const setupDropdowns = () => {
        document.querySelectorAll('.nav-item').forEach(item => {
            const link = item.querySelector('.nav-links');
            const dropdown = item.querySelector('.dropdown-menu');
            
            if (dropdown) {
                // Pre-calculate height for animation
                dropdown.style.display = 'block';
                dropdown.style.setProperty('--dropdown-height', `${dropdown.scrollHeight}px`);
                dropdown.style.display = '';
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleDropdown(item, dropdown, link);
                });
            } else {
                link.addEventListener('click', () => {
                    closeAllDropdowns();
                    closeMenu();
                });
            }
        });
    };

    const toggleDropdown = (item, dropdown, link) => {
        const isOpening = !dropdown.classList.contains('show');
        
        // Close all other dropdowns first
        if (isOpening) {
            closeAllDropdowns();
        }
        
        // Toggle current dropdown
        dropdown.classList.toggle('show');
        link.classList.toggle('active-dropdown', isOpening);
        item.classList.toggle('active', isOpening);
        
        // Animate height
        dropdown.style.height = isOpening 
            ? `${dropdown.scrollHeight}px` 
            : '0';
    };

    const closeAllDropdowns = () => {
        document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
            dropdown.style.height = '0';
            dropdown.classList.remove('show');
            const parentItem = dropdown.closest('.nav-item');
            if (parentItem) {
                parentItem.classList.remove('active');
                const link = parentItem.querySelector('.nav-links');
                if (link) link.classList.remove('active-dropdown');
            }
        });
    };

    const closeMenu = () => {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            overlay.style.display = 'none';
            unlockScroll();
        }, 300);
    };

    const closeAll = () => {
        closeAllDropdowns();
        closeMenu();
    };

    // Menu Toggle
    mobileMenu.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            closeAll();
        } else {
            lockScroll();
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.opacity = '1', 10);
            mobileMenu.classList.add('active');
            navMenu.classList.add('active');
            closeAllDropdowns(); // Start fresh
        }
    });

    // Event Delegation
    overlay.addEventListener('click', closeAll);
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.menu-toggle')) {
            closeAllDropdowns();
        }
    });

    // Initialize
    setupDropdowns();
    
    // Handle resize - recalculate dropdown heights
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                if (dropdown.classList.contains('show')) {
                    dropdown.style.height = 'auto';
                    const height = dropdown.scrollHeight;
                    dropdown.style.height = `${height}px`;
                }
            });
        }, 250);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Select all main navigation list items. We'll filter for those with dropdowns.
    const dropdownParents = document.querySelectorAll('.main-nav ul li');

    dropdownParents.forEach(item => {
        const navLink = item.querySelector('.nav-link');
        const dropdownMenu = item.querySelector('.dropdown-menu');

        // Only add event listener if this list item actually contains a dropdown menu
        if (dropdownMenu) {
            navLink.addEventListener('click', (e) => {
                // Prevent the default link behavior (e.g., navigating to '#')
                e.preventDefault();

                // Close any other currently active (open) dropdowns
                dropdownParents.forEach(otherItem => {
                    // If it's a different item AND it's currently active, close it
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle the 'active' class on the clicked item's parent LI.
                // This will open or close the current dropdown.
                item.classList.toggle('active');
            });
        }
    });

    // Close any open dropdowns when clicking anywhere else on the document
    document.addEventListener('click', (e) => {
        dropdownParents.forEach(item => {
            // If the clicked target is NOT inside this dropdown item AND this item is currently active, close it
            if (!item.contains(e.target) && item.classList.contains('active')) {
                item.classList.remove('active');
            }
        });
    });

    // --- NEW: Close dropdowns when scrolling ---
    window.addEventListener('scroll', () => {
        dropdownParents.forEach(item => {
            // If this item (which could be a dropdown parent) has the 'active' class, remove it
            if (item.classList.contains('active')) {
                item.classList.remove('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Popup (Rate Guarantee) Logic ---
    const popup = document.getElementById('rate-guarantee-cover'); 

    const hidePopup = () => {
        if (popup) {
            popup.style.opacity = '0';
            popup.style.pointerEvents = 'none'; // Make it non-clickable after disappearing
            // Remove listener here, as the popup's job is done once hidden
            window.removeEventListener('scroll', handlePopupScroll);
        }
    };

    const handlePopupScroll = () => {
        // Hide the popup as soon as any scroll happens
        if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0) {
            hidePopup();
        }
    };

    // --- Navigation Bar Background Logic ---
    const mainNavElement = document.getElementById('mainNavigation'); // Your PC nav
    const navScrollThreshold = 50; // Number of pixels to scroll before background appears

    // --- Navigation Bar Background Logic (Mobile) ---
    const mobileNavBgElement = document.querySelector('.bg-bar'); // Get your mobile nav background
    // You can use the same navScrollThreshold or a different one for mobile
    // const mobileNavScrollThreshold = 50; // Example if you want a different threshold

    const updateMainNavBackground = () => {
        // PC Navigation Background
        if (mainNavElement) {
            if (window.scrollY > navScrollThreshold) {
                mainNavElement.classList.add('scrolled');
            } else {
                mainNavElement.classList.remove('scrolled');
            }
        }

        // Mobile Navigation Background (bg-bar)
        if (mobileNavBgElement) {
            // Use the same threshold as PC, or mobileNavScrollThreshold if defined
            if (window.scrollY > navScrollThreshold) {
                mobileNavBgElement.classList.add('scrolled'); // Add 'scrolled' class to mobile nav
            } else {
                mobileNavBgElement.classList.remove('scrolled');
            }
        }
    };

    // --- Initial Setup on Page Load ---

    // 1. For the Rate Guarantee Popup:
    if (popup) {
        // Check if the page is already scrolled down on load
        if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0) {
            // If scrolled, hide the popup immediately (it shouldn't appear)
            hidePopup();
        } else {
            // If at the top, show the popup and add the scroll listener to hide it later
            popup.style.opacity = '1'; // Ensure it's visible initially if at top
            popup.style.pointerEvents = 'auto'; // Ensure it's clickable
            window.addEventListener('scroll', handlePopupScroll);
        }
    }

    // 2. For the Main Navigation Bar Background:
    // Update the navigation background state immediately on page load
    updateMainNavBackground();
    // Add scroll listener to keep updating the background as user scrolls
    window.addEventListener('scroll', updateMainNavBackground);

    // ... (Your existing JavaScript code for floatup, highlight nav, smooth scroll, read more should go here) ...
});

document.addEventListener('DOMContentLoaded', function() {
    // --- Existing code for popup and navigation background ---
    // ... (Keep all your existing popup and navigation background logic here) ...
    // --- END Existing code ---


    // --- NEW / MODIFIED CODE FOR CONTACT FORM ---

    // Select ALL elements with the class 'contact-toggle-link'
    const contactToggleLinks = document.querySelectorAll('.contact-toggle-link');
    const contactForm = document.getElementById('contact-form'); // This ID should remain unique for the form itself
    const closeFormButton = document.getElementById('close-form');

    // Add event listener to EACH link found
    contactToggleLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            if (contactForm) { // Ensure the form exists before trying to toggle
                contactForm.classList.toggle('visible');
            }
        });
    });

    // Hide form when close button is clicked (this part remains the same)
    if (closeFormButton) { // Ensure button exists
        closeFormButton.addEventListener('click', function() {
            if (contactForm) { // Ensure form exists
                contactForm.classList.remove('visible');
            }
        });
    }
});

