document.addEventListener('DOMContentLoaded', function() {
    const triggerBox = document.getElementById('trigger-box');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('close-popup');
    const gallerySlide = document.getElementById('gallery-slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // Store the scroll position
    let scrollPosition = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Gallery images
    const galleryImages = [
        { src: "mobile-image/food.webp", alt: "Lake and mountains" },
        { src: "mobile-image/cycling.webp", alt: "Forest fog" },
        { src: "mobile-image/boat-tour.webp", alt: "Waterfall in forest" },
        { src: "mobile-image/bracelet.webp", alt: "Rocky beach" },
        { src: "mobile-image/cooking-class.webp", alt: "Flower field" },
        { src: "mobile-image/cooking-class.webp", alt: "Misty forest" },
        { src: "mobile-image/cooking-class.webp", alt: "Sunset landscape" },
        { src: "mobile-image/cooking-class.webp", alt: "Mountain valley" },
        { src: "mobile-image/cooking-class.webp", alt: "Green hills" },
        { src: "mobile-image/cooking-class.webp", alt: "Waterfall" }
    ];
    
    // Determine number of visible items
    function getVisibleItems() {
        return window.innerWidth <= 767 ? 1 : 3;
    }
    
    let visibleItems = getVisibleItems();
    let currentIndex = 0;
    const itemCount = galleryImages.length;
    
    // Render gallery items
    function renderGallery() {
        gallerySlide.innerHTML = '';
        galleryImages.forEach((image, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
            item.style.opacity = '0';
            item.innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
            gallerySlide.appendChild(item);
        });
        updateSlide();
    }
    
    // Update slide position
    function updateSlide() {
        const itemWidth = 100 / visibleItems;
        gallerySlide.style.transform = `translateX(-${currentIndex * itemWidth}%)`;
        gallerySlide.style.transition = 'transform 0.3s ease';
        
        // Update button states
        prevBtn.style.opacity = currentIndex === 0 ? '0' : '0.7';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        
        const atEnd = currentIndex >= itemCount - visibleItems;
        nextBtn.style.opacity = atEnd ? '0' : '0.7';
        nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
    }
    
    // Handle window resize
    function handleResize() {
        const newVisibleItems = getVisibleItems();
        if (newVisibleItems !== visibleItems) {
            visibleItems = newVisibleItems;
            currentIndex = Math.min(currentIndex, Math.max(0, itemCount - visibleItems));
            updateSlide();
        }
    }
    
// Touch event handlers
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    gallerySlide.style.transition = 'none';
}

function handleTouchMove(e) {
    if (!touchStartX) return;
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    const itemWidth = 100 / visibleItems;
    const baseOffset = -currentIndex * itemWidth;
    const dragOffset = (diff / window.innerWidth) * 100;
    
    // Move in the same direction as finger
    gallerySlide.style.transform = `translateX(${baseOffset + dragOffset}%)`;
}

function handleTouchEnd(e) {
    if (!touchStartX) return;
    
    const touchX = e.changedTouches[0].clientX;
    const diff = touchX - touchStartX;
    const threshold = window.innerWidth * 0.1; // 10% of screen width
    
    if (diff > threshold && currentIndex > 0) {
        // Swiped right - move to previous (slides move right)
        currentIndex--;
    } else if (diff < -threshold && currentIndex < itemCount - visibleItems) {
        // Swiped left - move to next (slides move left)
        currentIndex++;
    }
    
    updateSlide();
    touchStartX = 0;
}
    
    // Scroll management
    function disableScroll() {
        scrollPosition = window.pageYOffset;
        document.body.classList.add('popup-active');
        document.body.style.top = `-${scrollPosition}px`;
    }
    
    function enableScroll() {
        document.body.classList.remove('popup-active');
        document.body.style.top = '';
        window.scrollTo(0, scrollPosition);
    }
    
    // Event listeners
    triggerBox.addEventListener('click', function() {
        disableScroll();
        popup.classList.add('active');
        currentIndex = 0;
        updateSlide();
    });
    
    function closePopupWithAnimation() {
        popup.classList.remove('active');
        setTimeout(enableScroll, 400);
    }
    
    closePopup.addEventListener('click', closePopupWithAnimation);
    
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlide();
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentIndex < itemCount - visibleItems) {
            currentIndex++;
            updateSlide();
        }
    });
    
    popup.addEventListener('click', function(e) {
        if (e.target === popup) closePopupWithAnimation();
    });
    
    document.addEventListener('keydown', function(e) {
        if (!popup.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closePopupWithAnimation();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            currentIndex--;
            updateSlide();
        } else if (e.key === 'ArrowRight' && currentIndex < itemCount - visibleItems) {
            currentIndex++;
            updateSlide();
        }
    });
    
    // Add touch events
    gallerySlide.addEventListener('touchstart', handleTouchStart, { passive: true });
    gallerySlide.addEventListener('touchmove', handleTouchMove, { passive: true });
    gallerySlide.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Initialize
    window.addEventListener('resize', handleResize);
    renderGallery();
});