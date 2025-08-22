// Dashboard Main Functionality

// Check if user is logged in


// Load user data
// Dashboard Main Functionality

// Load user data (no login check anymore)
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (currentUser) {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) userNameEl.textContent = currentUser.firstName + ' ' + currentUser.lastName;
    if (userEmailEl) userEmailEl.textContent = currentUser.email;
    if (userAvatarEl) userAvatarEl.textContent = currentUser.firstName.charAt(0).toUpperCase();
}

// Logout function – clears local data and reloads dashboard
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'Smart_Connect.html'; // Stay on dashboard flow
}


// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    let typingTimer;
    const searchInput = document.getElementById('userInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                if (this.value.length > 0) {
                    showTypingIndicator();
                }
            }, 500);
        });
    }
});

// Promotional Images Slider Functionality
let currentSlide = 0;
let autoSlideInterval;
const totalSlides = 3;

function initSlider() {
    // Set initial state
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        if (index === 0) {
            slide.classList.add('active');
            slide.style.display = 'flex';
        } else {
            slide.classList.remove('active');
            slide.style.display = 'none';
        }
    });
    
    updateSlider();
    startAutoSlide();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
    resetAutoSlide();
}

function previousSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
    resetAutoSlide();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSlider();
    resetAutoSlide();
}

function updateSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');
    
    // No transform needed for single image display
    if (sliderTrack) {
        sliderTrack.style.transform = 'translateX(0)';
    }
    
    // Update active slide and dots
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.classList.add('active');
            slide.style.display = 'flex';
        } else {
            slide.classList.remove('active');
            slide.style.display = 'none';
        }
    });
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 3 seconds
}

function resetAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

// Pause auto-slide on hover
document.addEventListener('DOMContentLoaded', function() {
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Initialize slider
    initSlider();
});

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
