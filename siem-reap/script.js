document.addEventListener('DOMContentLoaded', () => {

    // --- Section 1: Fade-in animations and navigation highlighting ---
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

    // --- Section 3: Popup/Modal management ---

    // Generic Modal Element Definitions (by ID)
    const roomPopup = document.getElementById('roomPopup');
    const tourPopup = document.getElementById('tourPopup');
    const foodPopup = document.getElementById('foodPopup');
    const dormInfoModal = document.getElementById('dormInfoModal');
    const amenitiesModal = document.getElementById('amenitiesModal'); // Keeping this if used elsewhere
    const contactModal = document.getElementById('contactModal');
    const locationModal = document.getElementById('locationModal');
    const activityPopup = document.getElementById('activityPopup');

    // Select ALL elements that should trigger specific popups/modals or sections
    const roomTriggers = document.querySelectorAll('.discover-our-room');
    const tourTriggers = document.querySelectorAll('.discover-our-tour');
    const foodTriggers = document.querySelectorAll('.discover-our-food');
    const dormReadMoreTriggers = document.querySelectorAll('.dorm-read-more-trigger');
    const amenitiesLink = document.getElementById('amenities-link'); // Your "Property Details" link (now an <a> tag)
    const contactTrigger = document.getElementById('contactTrigger');
    const locationTriggers = document.querySelectorAll('.open-location-modal');
    const activityTriggers = document.querySelectorAll('.discover-our-activity');
    const galleryText = document.getElementById('gallery-text');

    // Select all generic close buttons (inside any modal)
    const allCloseButtons = document.querySelectorAll('.modal-close-button, .amenities-modal-close-button');


    // --- Helper function to find and reset scrollable content ---
    function resetScrollOfContent(modalElement) {
        if (!modalElement) return;
        const contentElement = modalElement.querySelector('.modal-content') || modalElement;
        if (contentElement) {
            contentElement.scrollTop = 0;
        }
        modalElement.scrollTop = 0;
    }

    // --- Generic Modal Handling Functions ---
    // Variable to store the scroll position when the modal opens
    let scrollY = 0;

    function showModal(modalElement) {
        if (!modalElement) {
            console.error("Modal element not provided to showModal function.");
            return;
        }

        scrollY = window.scrollY; // Capture current scroll position
        // Set a CSS custom property on the root HTML element
        document.documentElement.style.setProperty('--scroll-y', `${-scrollY}px`);

        // Add classes for scroll prevention
        document.body.classList.add('modal-open-fixed'); // For position: fixed method
        document.documentElement.classList.add('no-scroll'); // For general overflow: hidden

        modalElement.classList.remove('hidden');
        modalElement.classList.add('visible');
        resetScrollOfContent(modalElement);
    }

    function hideModal(modalElement) {
        if (!modalElement) {
            console.error("Modal element not provided to hideModal function.");
            return;
        }
        
        // Remove classes for scroll restoration
        document.body.classList.remove('modal-open-fixed');
        document.documentElement.classList.remove('no-scroll');
        
        // Restore the scroll position AFTER removing 'position: fixed'
        window.scrollTo(0, scrollY);

        modalElement.classList.remove('visible');
        modalElement.classList.add('hidden');
        resetScrollOfContent(modalElement);
    }

    // --- Initialize all modals as hidden on page load ---
    const allModals = document.querySelectorAll('.modal-overlay');
    allModals.forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('visible');
    });

    // --- Attach Event Listeners to ALL Triggers ---

    // For Room Popups
    roomTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            showModal(roomPopup);
            closeMenu();
        });
    });

    // For Tour Popups
    tourTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            showModal(tourPopup);
            closeMenu();
        });
    });

    // For Food Popups
    foodTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            showModal(foodPopup);
            closeMenu();
        });
    });

    // For Dorm Info Modal (multiple triggers using class)
    dormReadMoreTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            showModal(dormInfoModal);
            closeMenu();
        });
    });

    // For Amenities Link: Scrolls to #facility section and closes menu
    if (amenitiesLink) {
        amenitiesLink.addEventListener('click', (event) => {
            console.log("Amenities link clicked. Attempting to close menu.");
            closeMenu(); // ONLY close the mobile menu
        });
    }

    // For Location Modal
    locationTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior if it's an <a> tag
            showModal(locationModal);
            closeMenu();
        });
    });

    // For Gallery Text
    if (galleryText) {
        galleryText.addEventListener('click', () => {
            console.log("Gallery text clicked! Implement gallery modal or scroll here.");
            closeMenu();
        });
    }

    // For Contact Modal
    if (contactTrigger) {
        contactTrigger.addEventListener('click', () => {
            showModal(contactModal);
            closeMenu();
        });
    }

    // For Activity Popup
    activityTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            showModal(activityPopup);
            closeMenu();
        });
    });


    // --- Universal Close Button Event Listeners ---
    allCloseButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalToClose = event.target.closest('.modal-overlay');
            hideModal(modalToClose);
        });
    });

    // --- Universal Overlay Click Listener (closes modal if clicked outside content) ---
    allModals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                hideModal(modal);
            }
        });
    });

    // --- Universal Escape Key Listener (closes visible modal) ---
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const visibleModal = document.querySelector('.modal-overlay.visible');
            if (visibleModal) {
                hideModal(visibleModal);
            }
        }
    });

    // --- Section 4: Universal Slider Initialization ---
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

        // Create dots
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
            e.stopPropagation();
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

        updateSlider(); // Initial update
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

    // --- Section 5: Mobile Menu and Accordion functionality ---
    const menuToggle = document.getElementById('menu');
    const mobileMenu = document.getElementById('mobileMenu');
    // Ensure mobileMenuItems are correctly selected from inside mobileMenu
    const mobileMenuItems = mobileMenu ? mobileMenu.querySelectorAll('.header-discover') : [];
    const overlay = document.getElementById('overlay');
    const body = document.body; // Reference to the body element

    // Function to open the menu
    function openMenu() {
        if (!mobileMenu || !overlay || !body) return;
        
        // Capture scroll position before opening menu if it fixes body
        scrollY = window.scrollY;
        document.documentElement.style.setProperty('--scroll-y', `${-scrollY}px`);

        mobileMenu.classList.add('open');
        overlay.classList.add('active');
        
        // Apply classes for scroll prevention
        body.classList.add('modal-open-fixed'); // Using the more robust method
        document.documentElement.classList.add('no-scroll'); // As a fallback/consistency

        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    }

    // Function to close the menu
    function closeMenu() {
        if (!mobileMenu || !overlay || !body) return;
        mobileMenu.classList.remove('open');
        overlay.classList.remove('active');
        
        // Remove classes for scroll restoration
        body.classList.remove('modal-open-fixed');
        document.documentElement.classList.remove('no-scroll');
        
        // Restore scroll position
        window.scrollTo(0, scrollY);

        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }

    // Toggle menu open/close on hamburger icon click
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // Close menu and scroll when a mobile menu item (p tag) is clicked
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            closeMenu();
            // Assuming the `id` of the mobile menu item corresponds to a section ID
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
        if (!mobileMenu || !menuToggle || !overlay) return;

        const isClickInsideMenu = mobileMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        const isClickOnOverlay = overlay.contains(event.target);

        if (mobileMenu.classList.contains('open')) {
            if (isClickOnOverlay || (!isClickInsideMenu && !isClickOnToggle)) {
                closeMenu();
            }
        }
    });

    // Accordion-like toggleSection function (exposed globally for inline onclick)
    window.toggleSection = function(headerElement) {
        if (!headerElement) return;
        const content = headerElement.nextElementSibling;
        const arrow = headerElement.querySelector('.arrow');

        if (content && content.style.display === "block") {
            content.style.display = "none";
            headerElement.classList.remove('active');
            if (arrow) arrow.classList.remove('active');
        } else if (content) {
            content.style.display = "block";
            headerElement.classList.add('active');
            if (arrow) arrow.classList.add('active');
        }
    };
});


(function() {
  const carouselsData = {
    carousel1: [
      { src: "highlights/nightmarket.webp", name: "Night Market" },
      { src: "highlights/pubstreet.webp", name: "Pub Street" },
      { src: "highlights/Angkor-National-Museum.webp", name: "Angkor National Museum" },
      { src: "highlights/royal-palace.webp", name: "Royal Garden" },
      { src: "highlights/Preah-Prom-Rath-temple-pagoda-siem-reap-cambodia.webp", name: "Wat Preah Prom Rath" }
    ],
    carousel2: [
      { src: "experince/experience.webp", name: "Amazing Temples" },
      { src: "experince/floatingvillage.webp", name: "Floating Village" },
      { src: "experince/cooking class.webp", name: "Cooking Class" },
      { src: "experince/phare.webp", name: "Phare, The Cambodian Circus" },
      { src: "experince/pottery class.webp", name: "Pottery Class" }
    ],
    carousel3: [
      { src: "highlights/fish-amok.webp", name: "Fish Amok" },
      { src: "highlights/beef-lok-lak.webp", name: "Lok Lak (Stir-fried Beef)" },
      { src: "highlights/Num-Banh-Chok-Khmer.webp", name: "Nom Banh Chok" },
      { src: "highlights/bay-sach-jrok.webp", name: "Bai Sach Chrouk" },
      { src: "highlights/nom-ah-kao.webp", name: "Khmer Dessert, Num Ah Kao" },
      { src: "highlights/prahok_ktiss.webp", name: "Prahok Ktiss" },
      { src: "highlights/khmer-curry.webp", name: "Khmer Red Curry" },
      { src: "highlights/samlor-mju.webp", name: "Samlar Machu (Sour Soup)" },
      { src: "highlights/lort-char.webp", name: "Lort Cha" },
      { src: "highlights/bbq-degustation.webp", name: "Phnom Pleung (Cambodian BBQ)" },
      { src: "highlights/insect.webp", name: "Chili Fried Insects" },
      { src: "highlights/bamboo-rice.webp", name: "Bamboo Sticky Rice" }
    ]
  };

  function initCarousel(id, images) {
    const wrapper = document.getElementById(id);
    if (!wrapper) {
      console.warn(`Carousel container ${id} not found.`);
      return;
    }
    const track = wrapper.querySelector('.carousel-track');

    // Clear any existing items
    track.innerHTML = '';

    // Create items twice for infinite loop effect
    images.concat(images).forEach(({ src, name }) => {
      const item = document.createElement('div');
      item.className = 'carousel-item';

      const img = document.createElement('img');
      img.src = src;
      img.alt = name;
      img.draggable = false; // Prevent default browser image dragging for smoother mouse swipe

      const caption = document.createElement('span');
      caption.className = 'image-name';
      caption.textContent = name;

      item.appendChild(img);
      item.appendChild(caption);
      track.appendChild(item);
    });

    let isDragging = false;
    let startX = 0;
    let startY = 0; // Store initial Y position for touch events
    let scrollLeftStart = 0;
    let autoScrollID;
    let isCarouselSwipe = false; // Flag to indicate if the current touch is a carousel swipe

    // Define a threshold for movement to determine direction
    const movementThreshold = 10; // Pixels

    function autoScroll() {
      wrapper.scrollLeft += 1;
      if (wrapper.scrollLeft >= track.scrollWidth / 2) {
        wrapper.scrollLeft = 0;
      }
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollID = setInterval(autoScroll, 16);
    }

    function stopAutoScroll() {
      clearInterval(autoScrollID);
    }

    function onDragStart(e) {
      stopAutoScroll();
      isDragging = true;
      isCarouselSwipe = false; // Reset flag
      startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
      scrollLeftStart = wrapper.scrollLeft;
      wrapper.style.cursor = 'grabbing';

      // For touch events, we don't preventDefault here initially.
      // We will only prevent default in onDragMove if it's determined to be a horizontal swipe.
      if (e.type.includes('mouse')) {
        e.preventDefault(); // Prevent default browser drag-and-drop for mouse
      }
    }

    function onDragMove(e) {
      if (!isDragging) return;

      const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const currentY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;

      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);

      // --- Core Logic for Touch Direction ---
      if (e.type.includes('touch') && !isCarouselSwipe) {
        if (deltaX > movementThreshold && deltaX > deltaY) {
          // It's a horizontal swipe, engage carousel logic
          isCarouselSwipe = true;
        } else if (deltaY > movementThreshold && deltaY > deltaX) {
          // It's a vertical scroll, disengage carousel logic and let page scroll
          isDragging = false; // Stop dragging the carousel
          wrapper.style.cursor = 'grab';
          startAutoScroll(); // Resume auto-scroll
          return; // Allow default vertical scroll
        }
        // If neither direction has exceeded the threshold, or if deltaX <= deltaY,
        // we continue to not prevent default until a clear horizontal intention is seen.
      }

      // Only prevent default if it's a mouse event (which always implies horizontal drag for this carousel)
      // or if we've specifically determined it's a horizontal touch swipe.
      if (e.type.includes('mouse') || isCarouselSwipe) {
        e.preventDefault();
        const walk = startX - currentX;
        wrapper.scrollLeft = scrollLeftStart + walk;

        // Correctly update startX and scrollLeftStart after looping
        if (wrapper.scrollLeft >= track.scrollWidth / 2) {
          wrapper.scrollLeft -= track.scrollWidth / 2;
          startX = currentX - (track.scrollWidth / 2 - (scrollLeftStart + walk));
          scrollLeftStart = wrapper.scrollLeft;
        } else if (wrapper.scrollLeft <= 0) {
          wrapper.scrollLeft += track.scrollWidth / 2;
          startX = currentX + (track.scrollWidth / 2 + (scrollLeftStart + walk));
          scrollLeftStart = wrapper.scrollLeft;
        }
      }
    }

    function onDragEnd() {
      if (!isDragging) return; // Only process if dragging was active
      isDragging = false;
      wrapper.style.cursor = 'grab';
      startAutoScroll();
      isCarouselSwipe = false; // Reset flag for next interaction
    }

    wrapper.style.cursor = 'grab';

    // Mouse events
    wrapper.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove); // Listen on document to capture drags outside wrapper
    document.addEventListener('mouseup', onDragEnd);     // Listen on document
    wrapper.addEventListener('mouseleave', onDragEnd);   // Ensure mouseleave also stops dragging and resets cursor

    // Touch events
    // Mark as non-passive to allow preventDefault later
    wrapper.addEventListener('touchstart', onDragStart, { passive: false });
    wrapper.addEventListener('touchmove', onDragMove, { passive: false });
    wrapper.addEventListener('touchend', onDragEnd);

    // Start auto scroll initially
    startAutoScroll();
  }

  // Initialize all carousels on page load
  window.addEventListener('load', () => {
    initCarousel('carousel1', carouselsData.carousel1);
    initCarousel('carousel2', carouselsData.carousel2);
    initCarousel('carousel3', carouselsData.carousel3);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
            // Array of all original image sources for the gallery
            const originalImageSources = [
                "gallery/received_1582858339335926.webp",
                "gallery/received_534966325788121.webp",
                "gallery/received_566007475852197.webp",
                "gallery/received_8766750926690907.webp",
                "gallery/received_444754068070835.webp",
                "gallery/received_934478895256502.webp",
                "gallery/received_497042126654101.webp",
                "gallery/received_499675879577316.webp",
                "gallery/received_1067235718122204.webp",
                "gallery/received_955016673333179.webp",
                "gallery/received_1000949585119726.webp",
                "gallery/received_888751229987705.webp",
                "gallery/received_1614537922474663.webp",
                "gallery/received_2251783428537380.webp",
                "gallery/received_3340627699402943.webp",
                "gallery/received_1345036756476678.webp",
                "gallery/received_525229870112388.webp",
                "gallery/received_1045540420640483.webp",
                "gallery/received_881561807414748.webp",
                "gallery/received_1209513726981479.webp",
                "gallery/received_1249027662951614.webp",
                "gallery/received_530563756392152.webp",
                "gallery/received_1303105920856225.webp",
                "gallery/received_1593637174924075.webp",
                "gallery/received_898517221722314.webp",
                "gallery/received_501342529557164.webp",
                "gallery/received_566007475852197.webp",
                "gallery/612625504.webp",
                "gallery/received_4590479965328202.webp",
                "gallery/received_530849406194868.webp",
                "gallery/received_531913776110510.webp",
                "gallery/received_565693359131108.webp",
                "gallery/received_848102257456561.webp",
                "gallery/received_885010916582691.webp",
                "gallery/received_1076394100551423.webp",
                "gallery/received_1233078591269580.webp",
                "gallery/received_1539284006712269.webp",
                "gallery/received_3864105780515349.webp",
                "gallery/complimentary.webp",
                "gallery/standard-double.webp",
                "gallery/standard-double2.webp",
                "gallery/standard-twin.webp",
                "gallery/standard-twin2.webp",
                "gallery/received_8343806779060596.webp",
                "gallery/received_1247752259759609.webp",
                "gallery/received_1279562433222280.webp",
                "gallery/superior-6bed2.webp",
                "gallery/6-bed-dorm2.webp",
                "gallery/6-bed-dorm.webp",
                "gallery/4-bed-dorm2.webp",
                "gallery/4-bed-dorm3.webp",
                "gallery/bathroom-f.webp",
                "gallery/standard-shower.webp",
                "gallery/standard-toilet.webp",
                "gallery/superior-double-toilet.webp",
                "gallery/superior-room-shower.webp"
            ];

            // Create an extended array for seamless looping: [last_original, ...all_originals..., first_original]
            const imageSources = [
                originalImageSources[originalImageSources.length - 1], // Sentinel: Last image
                ...originalImageSources,                               // All original images
                originalImageSources[0]                                // Sentinel: First image
            ];

            // DOM Elements
            const initialGallery = document.getElementById('initial-gallery');
            const lightbox = document.getElementById('lightbox');
            const closeLightboxBtn = document.getElementById('close-lightbox');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const thumbnailContainer = document.getElementById('thumbnail-container');
            const mainImageDisplayContainer = document.querySelector('.main-image-display-container');
            const imageCarouselWrapper = document.getElementById('image-carousel-wrapper');
            const imageCounter = document.getElementById('image-counter'); // Get reference to the new counter element
            const galleryParagraph = document.getElementById('gallery-text'); // Get the new gallery paragraph element


            // currentImageIndex now refers to the index in the *extended* array.
            // We start at index 1 to show the first *original* image.
            let currentImageIndex = 1;
            let startX = 0; // Starting X coordinate of mouse/touch
            let currentTranslateX = 0; // Current translateX of the wrapper at the start of a drag
            let isDragging = false; // Flag to indicate if dragging is active
            let dragOffset = 0; // The real-time offset during drag
            let carouselWidth = 0; // Width of the main image display area (viewport width)

            // Function to open the lightbox
            function openLightbox(index) {
                // When opening, map the original index to the extended array index (+1 because of the prepended last image)
                currentImageIndex = index + 1;
                loadCarouselImages(); // Dynamically create and load all images into the wrapper
                carouselWidth = mainImageDisplayContainer.offsetWidth; // Get the width of the viewport
                updateCarouselPosition(false); // Position carousel without transition initially
                updateThumbnails();
                updateImageCounter(); // Initial update for the counter

                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';

                // Recalculate carousel width on resize, and update position
                // This is important for correct snapping
                window.addEventListener('resize', handleResize);
            }

            // Function to close the lightbox
            function closeLightbox() {
                lightbox.classList.remove('open');
                document.body.style.overflow = '';
                imageCarouselWrapper.innerHTML = ''; // Clear images from wrapper on close
                window.removeEventListener('resize', handleResize); // Clean up resize listener
            }

            // Dynamically load all images into the carousel wrapper
            function loadCarouselImages() {
                imageCarouselWrapper.innerHTML = ''; // Clear existing images
                imageSources.forEach((src, index) => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `Hotel Image ${index + 1}`;
                    // Store original index for thumbnails mapping
                    img.dataset.originalIndex = (index === 0) ? originalImageSources.length - 1 : // Sentinel at start points to last original
                                                (index === imageSources.length - 1) ? 0 : // Sentinel at end points to first original
                                                index - 1; // Original images are shifted by 1
                    // Set initial width for each image (will be adjusted by JS)
                    img.style.width = `${mainImageDisplayContainer.offsetWidth}px`; // Set initial width based on container
                    imageCarouselWrapper.appendChild(img);
                });
                // Set the total width of the carousel wrapper
                imageCarouselWrapper.style.width = `${imageSources.length * mainImageDisplayContainer.offsetWidth}px`;
            }

            // Update the carousel's position based on currentImageIndex
            function updateCarouselPosition(animate = true) {
                const targetX = -currentImageIndex * carouselWidth;
                if (animate) {
                    imageCarouselWrapper.style.transition = 'transform 0.3s ease-out';
                } else {
                    imageCarouselWrapper.style.transition = 'none';
                }
                imageCarouselWrapper.style.transform = `translateX(${targetX}px)`;

                // Handle the "jump" for seamless looping
                if (currentImageIndex === 0 && animate) { // If we've landed on the first sentinel (last original)
                    setTimeout(() => {
                        imageCarouselWrapper.style.transition = 'none'; // Disable transition for instant jump
                        currentImageIndex = originalImageSources.length; // Jump to the actual last image
                        imageCarouselWrapper.style.transform = `translateX(${-currentImageIndex * carouselWidth}px)`;
                        updateThumbnails(); // Update thumbnails after the jump
                        updateImageCounter(); // Update image counter after the jump
                    }, 300); // Match transition duration (should be same as CSS transition duration)
                } else if (currentImageIndex === imageSources.length - 1 && animate) { // If we've landed on the last sentinel (first original)
                    setTimeout(() => {
                        imageCarouselWrapper.style.transition = 'none'; // Disable transition for instant jump
                        currentImageIndex = 1; // Jump to the actual first image
                        imageCarouselWrapper.style.transform = `translateX(${-currentImageIndex * carouselWidth}px)`;
                        updateThumbnails(); // Update thumbnails after the jump
                        updateImageCounter(); // Update image counter after the jump
                    }, 300); // Match transition duration
                } else {
                    updateThumbnails(); // Only update thumbnails if no jump is pending
                    updateImageCounter(); // Update image counter
                }
            }

            // Update the active thumbnail in the lightbox
            function updateThumbnails() {
                // The thumbnail index corresponds to the originalImageSources array
                const activeThumbnailIndex = (currentImageIndex === 0) ? originalImageSources.length - 1 : // If on first sentinel, highlight last original
                                             (currentImageIndex === imageSources.length - 1) ? 0 : // If on last sentinel, highlight first original
                                             currentImageIndex - 1; // Otherwise, shift by 1 for actual original index

                const thumbnails = thumbnailContainer.querySelectorAll('img');
                thumbnails.forEach((thumb, index) => {
                    if (index === activeThumbnailIndex) {
                        thumb.classList.add('thumbnail-active');
                        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } else {
                        thumb.classList.remove('thumbnail-active');
                    }
                });
            }

            // Function to update the image counter (e.g., "1/40")
            function updateImageCounter() {
                // Calculate the 1-based index for display
                const displayIndex = (currentImageIndex === 0) ? originalImageSources.length : // If on first sentinel, show last original's number
                                     (currentImageIndex === imageSources.length - 1) ? 1 : // If on last sentinel, show first original's number
                                     currentImageIndex; // Otherwise, it's current extended index
                imageCounter.textContent = `${displayIndex} / ${originalImageSources.length}`;
            }

            // Function to navigate to the previous image
            function showPreviousImage() {
                currentImageIndex--; // Just decrement, the jump logic is in updateCarouselPosition
                updateCarouselPosition(true);
            }

            // Function to navigate to the next image
            function showNextImage() {
                currentImageIndex++; // Just increment, the jump logic is in updateCarouselPosition
                updateCarouselPosition(true);
            }

            // Event Listeners for initial gallery images
            initialGallery.querySelectorAll('.initial-gallery-item').forEach(imageWrapper => {
                imageWrapper.addEventListener('click', () => {
                    const index = parseInt(imageWrapper.dataset.index);
                    openLightbox(index);
                });
            });

            // Event Listener for the new Gallery paragraph
            if (galleryParagraph) { // Check if the element exists
                galleryParagraph.addEventListener('click', () => {
                    openLightbox(0); // Open the lightbox at the first image (index 0)
                });
            }

            // Event Listeners for lightbox controls
            closeLightboxBtn.addEventListener('click', closeLightbox);
            prevBtn.addEventListener('click', showPreviousImage);
            nextBtn.addEventListener('click', showNextImage);

            // --- Dragging Logic (Mouse & Touch) ---

            // Helper to get clientX from event (handles both mouse and touch)
            function getClientX(e) {
                return e.touches ? e.touches[0].clientX : e.clientX;
            }

            // Start Dragging
            mainImageDisplayContainer.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = getClientX(e);
                imageCarouselWrapper.style.transition = 'none'; // Disable transition during drag
                const transformMatrix = window.getComputedStyle(imageCarouselWrapper).getPropertyValue('transform');
                currentTranslateX = transformMatrix === 'none' ? 0 : parseFloat(transformMatrix.split(',')[4]);

                mainImageDisplayContainer.classList.add('grabbing');
                e.preventDefault(); // Prevent default browser drag behavior (e.g., image saving)
            });

            mainImageDisplayContainer.addEventListener('touchstart', (e) => {
                isDragging = true;
                startX = getClientX(e);
                imageCarouselWrapper.style.transition = 'none';
                const transformMatrix = window.getComputedStyle(imageCarouselWrapper).getPropertyValue('transform');
                currentTranslateX = transformMatrix === 'none' ? 0 : parseFloat(transformMatrix.split(',')[4]);

                e.preventDefault(); // Prevent scrolling on touch devices
            }, { passive: false });

            // During Dragging
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const currentX = getClientX(e);
                dragOffset = currentX - startX;
                imageCarouselWrapper.style.transform = `translateX(${currentTranslateX + dragOffset}px)`;
            });

            document.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const currentX = getClientX(e);
                dragOffset = currentX - startX;
                imageCarouselWrapper.style.transform = `translateX(${currentTranslateX + dragOffset}px)`;
            }, { passive: false });

            // Stop Dragging
            document.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                mainImageDisplayContainer.classList.remove('grabbing');

                const swipeThreshold = carouselWidth * 0.2; // 20% of carousel width for swipe threshold

                if (dragOffset < -swipeThreshold) {
                    // Swiped left (go to next image)
                    showNextImage();
                } else if (dragOffset > swipeThreshold) {
                    // Swiped right (go to previous image)
                    showPreviousImage();
                } else {
                    // Not enough drag, snap back to current image
                    updateCarouselPosition(true); // Snap back with animation
                }
                dragOffset = 0; // Reset drag offset
            });

            document.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                isDragging = false;

                const swipeThreshold = carouselWidth * 0.2; // 20% of carousel width for swipe threshold

                if (dragOffset < -swipeThreshold) {
                    // Swiped left (go to next image)
                    showNextImage();
                } else if (dragOffset > swipeThreshold) {
                    // Swiped right (go to previous image)
                    showPreviousImage();
                } else {
                    // Not enough drag, snap back to current image
                    updateCarouselPosition(true); // Snap back with animation
                }
                dragOffset = 0; // Reset drag offset
            });

            // Handle window resize to adjust carousel width and position
            function handleResize() {
                if (lightbox.classList.contains('open')) {
                    carouselWidth = mainImageDisplayContainer.offsetWidth;
                    // Update width of individual images within the wrapper
                    const imagesInWrapper = imageCarouselWrapper.querySelectorAll('img');
                    imagesInWrapper.forEach(img => {
                        img.style.width = `${carouselWidth}px`;
                    });
                    imageCarouselWrapper.style.width = `${imageSources.length * carouselWidth}px`; // Set total wrapper width
                    updateCarouselPosition(false); // Update position without animation on resize
                }
            }

            // Close lightbox when clicking outside the content (on the overlay)
            lightbox.addEventListener('click', (e) => {
                // Only close if it's a direct click on the overlay and not part of a drag
                if (e.target === lightbox && !isDragging && Math.abs(dragOffset) < 5) { // Small tolerance for accidental slight movement
                    closeLightbox();
                }
            });

            // Keyboard navigation (Escape to close, Arrow keys for navigation)
            document.addEventListener('keydown', (e) => {
                if (lightbox.classList.contains('open') && !isDragging) {
                    if (e.key === 'Escape') {
                        closeLightbox();
                    } else if (e.key === 'ArrowLeft') {
                        showPreviousImage();
                    } else if (e.key === 'ArrowRight') {
                        showNextImage();
                    }
                }
            });

            // Dynamically create thumbnails
            function createThumbnails() {
                originalImageSources.forEach((src, index) => { // Use originalImageSources for thumbnails
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `Thumbnail ${index + 1}`;
                    img.classList.add('thumbnail-item');
                    img.dataset.index = index;
                    img.addEventListener('click', () => {
                        currentImageIndex = index + 1; // Map to extended array index (original index + 1)
                        updateCarouselPosition(true); // Animate to the selected thumbnail's image
                    });
                    thumbnailContainer.appendChild(img);
                });
            }

            // Call createThumbnails when the page loads
            createThumbnails();
        });


