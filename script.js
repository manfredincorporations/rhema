let cart = [];
// Initialize Stripe with a test publishable key
let stripe = Stripe('pk_test_51O9XYZLkozRXMgXYZabcdefghijklmnopqrstuvwxyz123456789');

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Form validation
    const contactForm = document.querySelector('.contact-form form');
    const donationForm = document.querySelector('.giving-form form');

    function validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach(input => {
             const errorDiv = input.parentElement.querySelector('.error-message');
            const value = input.value.trim();
            errorDiv.textContent = '';
            input.classList.remove('error');

            if (!value) {
                isValid = false;
                errorDiv.textContent = `${input.name || 'This field'} is required`;
                input.classList.add('error');
            } else {
                switch(input.type) {
                    case 'email':
                        if (!validateEmail(value)) {
                            isValid = false;
                            errorDiv.textContent = 'Please enter a valid email address';
                            input.classList.add('error');
                        }
                        break;
                    case 'tel':
                        if (!/^\+?[\d\s-]{10,}$/.test(value)) {
                            isValid = false;
                            errorDiv.textContent = 'Please enter a valid phone number';
                            input.classList.add('error');
                        }
                        break;
                    case 'number':
                        if (isNaN(value) || (input.min && parseFloat(value) < parseFloat(input.min)) ||
                            (input.max && parseFloat(value) > parseFloat(input.max))) {
                            isValid = false;
                            errorDiv.textContent = `Please enter a valid number ${input.min ? 'from ' + input.min : ''} ${input.max ? 'to ' + input.max : ''}`;
                            input.classList.add('error');
                        }
                        break;
                }
            }
        });

        return isValid;
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm(this)) {
                alert('Thank you for your message. We will get back to you soon!');
                this.reset();
            }
        });
    }

    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm(this)) {
                alert('Thank you for your generous donation!');
                this.reset();
            }
        });
    }

    const slideshow = document.querySelector('.gallery-slideshow');
    const slides = document.querySelectorAll('.gallery-slide');
    const dotsContainer = document.querySelector('.gallery-dots');
    let currentSlide = 0;
    let slideInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    // Create dot indicators
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('gallery-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.gallery-dot');

    // Navigation buttons
    document.querySelector('.gallery-nav.prev').addEventListener('click', prevSlide);
    document.querySelector('.gallery-nav.next').addEventListener('click', nextSlide);

    // Auto-advance slides
    startSlideshow();

    // Pause slideshow on hover
    slideshow.addEventListener('mouseenter', () => clearInterval(slideInterval));
    slideshow.addEventListener('mouseleave', startSlideshow);

    // Touch events for mobile
    slideshow.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        clearInterval(slideInterval);
    });

    slideshow.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
        startSlideshow();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // Accessibility - make slides focusable and handle keyboard events
    slides.forEach((slide, index) => {
        slide.setAttribute('tabindex', '0');
        slide.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') goToSlide(index);
        });
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Add visual feedback for swipe
                slides[currentSlide].style.transform = `translateX(${swipeDistance/5}px)`;
                setTimeout(() => {
                    slides[currentSlide].style.transform = '';
                    prevSlide();
                }, 50);
            } else {
                // Add visual feedback for swipe
                slides[currentSlide].style.transform = `translateX(${swipeDistance/5}px)`;
                setTimeout(() => {
                    slides[currentSlide].style.transform = '';
                    nextSlide();
                }, 50);
            }
        } else {
            // Snap back if swipe wasn't strong enough
            slides[currentSlide].style.transform = '';
        }
    }

    function updateSlides() {
        // Preload next image
        const nextIndex = (currentSlide + 1) % slides.length;
        const nextImage = slides[nextIndex].querySelector('img');
        if (nextImage) {
            const preloadImg = new Image();
            preloadImg.src = nextImage.src;
        }

        // Apply smooth transition with enhanced effects
        slides.forEach((slide, index) => {
            if (index === currentSlide) {
                // Make current slide visible first
                slide.style.visibility = 'visible';
                
                // Small delay for smoother transition
                setTimeout(() => {
                    slide.classList.add('active');
                }, 50);
                
                // Announce for screen readers
                slide.setAttribute('aria-hidden', 'false');
                
                // Focus for keyboard users
                if (document.activeElement === document.body) {
                    slide.focus({ preventScroll: true });
                }
            } else {
                slide.classList.remove('active');
                
                // Hide after transition completes
                setTimeout(() => {
                    if (!slide.classList.contains('active')) {
                        slide.style.visibility = 'hidden';
                    }
                }, 800);
                
                slide.setAttribute('aria-hidden', 'true');
            }
        });

        // Update dots
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('aria-current');
            }
        });
        
        // Announce slide change for screen readers
        const liveRegion = document.getElementById('slideshow-live-region') || createLiveRegion();
        const currentSlideAlt = slides[currentSlide].querySelector('img').alt;
        liveRegion.textContent = `Showing slide ${currentSlide + 1} of ${slides.length}: ${currentSlideAlt}`;
    }
    
    function createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'slideshow-live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        document.body.appendChild(liveRegion);
        return liveRegion;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlides();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlides();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlides();
    }

    function startSlideshow() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 6000); // Slightly longer interval for better viewing
    }

    // Store functionality
    const searchInput = document.getElementById('searchBooks');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortBooks');
    const cartModal = document.getElementById('cart-modal');

    if (searchInput) {
        searchInput.addEventListener('input', filterBooks);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterBooks);
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', sortBooks);
    }

    function filterBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const books = document.querySelectorAll('.book-card');

        books.forEach(book => {
            const title = book.querySelector('h3').textContent.toLowerCase();
            const bookCategory = book.dataset.category;
            const shouldShow =
                (searchTerm === '' || title.includes(searchTerm)) &&
                (category === 'all' || bookCategory === category);
            book.style.display = shouldShow ? 'block' : 'none';
        });
    }

    function sortBooks() {
        const sortBy = sortSelect.value;
        const bookGrid = document.querySelector('.book-grid');
        const books = Array.from(document.querySelectorAll('.book-card'));

        books.sort((a, b) => {
            const priceA = parseFloat(a.querySelector('.book-price').textContent.replace('$', ''));
            const priceB = parseFloat(b.querySelector('.book-price').textContent.replace('$', ''));
            const titleA = a.querySelector('h3').textContent;
            const titleB = b.querySelector('h3').textContent;

            switch(sortBy) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'name-asc':
                    return titleA.localeCompare(titleB);
                default:
                    return 0;
            }
        });

        books.forEach(book => bookGrid.appendChild(book));
    }

    function addToCart(id, title, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, title, price, quantity: 1 });
        }
        updateCartCount();
        showCart();
    }

    function buyNow(id, title, price) {
        cart = [{ id, title, price, quantity: 1 }];
        checkout();
    }

    function updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    function showCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total-amount');
        cartModal.style.display = 'block';

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span>${item.title}</span>
                <span>GHS ${item.price.toFixed(2)} x ${item.quantity}</span>
                <button onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `GHS ${total.toFixed(2)}`;
    }

    function closeCart() {
        cartModal.style.display = 'none';
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartCount();
        showCart();
    }

    async function checkout() {
        try {
            // In a real environment, this would call the server
            // For demo purposes, we'll simulate a successful checkout
            alert('This is a demo. In a production environment, this would redirect to Stripe checkout.');

            // Display order confirmation
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderNumber = Math.floor(Math.random() * 1000000);

            alert(`Order #${orderNumber} confirmed!\nTotal: GHS ${total.toFixed(2)}\nThank you for your purchase!`);

            // Clear cart
            cart = [];
            updateCartCount();
            closeCart();

            /*
            // This is the code that would be used in production with a real backend
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ items: cart })
            });

            const session = await response.json();
            const result = await stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                alert(result.error.message);
            }
            */
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error processing your payment. Please try again.');
        }
    }

    // Close cart when clicking outside
    window.onclick = function(event) {
        if (event.target === cartModal) {
            closeCart();
        }
    };

    // Social interaction buttons
    const likeButtons = document.querySelectorAll('.like-btn');
    const shareButtons = document.querySelectorAll('.share-btn');
    const downloadButtons = document.querySelectorAll('.download-btn');

    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const likeCount = this.querySelector('span');
            let count = parseInt(likeCount.textContent.split(' ')[0]) || 0;
            count++;
            likeCount.textContent = `${count} likes`;
            this.classList.add('liked');
        });
    });

    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: 'Rhema Calvary Center',
                    text: 'Check out this event at Rhema Calvary Center!',
                    url: window.location.href,
                })
                .catch(error => console.log('Error sharing:', error));
            } else {
                alert('Share this link: ' + window.location.href);
            }
        });
    });

    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventTitle = this.closest('.event-info').querySelector('h3').textContent;
            const eventDate = this.closest('.event-info').querySelector('p').textContent;

            const eventDetails = `Event: ${eventTitle}\nDate: ${eventDate}\nLocation: Rhema Calvary Center\n\nWe look forward to seeing you there!`;

            const blob = new Blob([eventDetails], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${eventTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    // Comments functionality
    const commentSections = document.querySelectorAll('.comments-section');

    commentSections.forEach(section => {
        const textarea = section.querySelector('textarea');
        const postButton = section.querySelector('button');

        postButton.addEventListener('click', function() {
            const commentText = textarea.value.trim();
            if (commentText) {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';

                const commentAuthor = document.createElement('span');
                commentAuthor.className = 'comment-author';
                commentAuthor.textContent = 'Guest';

                const commentTime = document.createElement('span');
                commentTime.className = 'comment-time';
                commentTime.textContent = new Date().toLocaleString();

                const commentContent = document.createElement('p');
                commentContent.className = 'comment-content';
                commentContent.textContent = commentText;

                commentElement.appendChild(commentAuthor);
                commentElement.appendChild(commentTime);
                commentElement.appendChild(commentContent);

                // Insert before the textarea
                section.insertBefore(commentElement, textarea);

                // Clear the textarea
                textarea.value = '';
            }
        });
    });
});