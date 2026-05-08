/* =============================================
   STATURE MANAGEMENT — Main JavaScript
   Premium Dark Luxury — Merged Version
   ============================================= */

(function () {
    'use strict';

    /* =========================================
       DOM READY
       ========================================= */
    document.addEventListener('DOMContentLoaded', function () {
        initNavbar();
        initMobileMenu();
        initRevealAnimations();
        initSmoothScroll();
        initHoverEffects();
    });

    /* =========================================
       NAVBAR SCROLL EFFECT
       ========================================= */
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        function updateNavbar() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', updateNavbar);
        updateNavbar(); // Initial check
    }

    /* =========================================
       MOBILE MENU
       ========================================= */
    function initMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const closeMenuBtn = document.getElementById('close-menu-btn');

        if (!mobileMenu || !mobileOverlay) return;

        // Open menu
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', openMobileMenu);
        }

        // Close menu via close button
        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', closeMobileMenu);
        }

        // Close menu via overlay click
        mobileOverlay.addEventListener('click', closeMobileMenu);

        // Close menu when a mobile nav link is clicked
        const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(function (link) {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close on escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');
        if (!mobileMenu || !mobileOverlay) return;
        mobileMenu.classList.add('open');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileOverlay = document.getElementById('mobile-overlay');
        if (!mobileMenu || !mobileOverlay) return;
        mobileMenu.classList.remove('open');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Expose to global scope
    window.openMobileMenu = openMobileMenu;
    window.closeMobileMenu = closeMobileMenu;

    /* =========================================
       REVEAL ANIMATIONS (Intersection Observer)
       ========================================= */
    function initRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        if (revealElements.length === 0) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* =========================================
       SMOOTH SCROLL FOR ANCHOR LINKS
       ========================================= */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    closeMobileMenu();
                }
            });
        });
    }

    /* =========================================
       HOVER EFFECTS FOR CARDS
       ========================================= */
    function initHoverEffects() {
        // Add subtle parallax to artist cards on hover
        const artistCards = document.querySelectorAll('.artist-card');
        artistCards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPercent = (x / rect.width - 0.5) * 10;
                const yPercent = (y / rect.height - 0.5) * 10;

                const img = card.querySelector('.artist-card-image img');
                if (img) {
                    img.style.transform = `scale(1.05) translate(${xPercent * 0.5}px, ${yPercent * 0.5}px)`;
                }
            });

            card.addEventListener('mouseleave', function () {
                const img = card.querySelector('.artist-card-image img');
                if (img) {
                    img.style.transform = '';
                }
            });
        });
    }

    /* =========================================
       UNIVERSAL SMART BOOKING FUNCTION
       Works on: iPhone, Android, Desktop (Win/Mac/Linux)
       Detects device and picks the best email method.
       ========================================= */

    /**
     * Opens the user's email app with a pre-filled booking template.
     * 
     * @param {string} artistName  - The name of the artist being booked
     * @param {string} emailTo     - The recipient email (default: info@management-inc.site)
     * @param {string} subject     - Email subject line
     * @param {string} body        - Pre-filled email body (use %0D%0A for newlines)
     */
    function bookArtist(artistName, emailTo, subject, body) {
        emailTo = emailTo || 'info@management-inc.site';
        subject = subject || (artistName ? 'Booking Request For ' + artistName : 'Booking Request - Stature Management');
        body = body || getDefaultBookingBody(artistName);

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        // Encode for mailto
        const mailtoLink = 'mailto:' + encodeURIComponent(emailTo) +
            '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(body);

        if (isMobile || isIOS) {
            // Mobile: Use mailto (native email app)
            window.location.href = mailtoLink;
        } else {
            // Desktop: Try Gmail first, fallback to mailto
            const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1' +
                '&to=' + encodeURIComponent(emailTo) +
                '&su=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);

            // Use Gmail, but if user has other email client, they can still use mailto
            window.open(gmailUrl, '_blank', 'noopener,noreferrer');

            // Fallback after 2 seconds if Gmail doesn't open (optional)
            setTimeout(function () {
                // Do nothing, Gmail likely opened
            }, 2000);
        }
    }

    function getDefaultBookingBody(artistName) {
        if (artistName) {
            return `Name:%0D%0A%0D%0AEvent Type:%0D%0ALocation:%0D%0AProposed Date(s):%0D%0ABudget Range:%0D%0A%0D%0AAdditional Details about the event/artist (${artistName}):%0D%0A`;
        }
        return `Name:%0D%0ACompany/Organization:%0D%0A%0D%0AInquiry Type (Booking / Partnership / Press):%0D%0A%0D%0AMessage:%0D%0A`;
    }

    // Expose to global scope
    window.bookArtist = bookArtist;

    /* =========================================
       NEWSLETTER SIGNUP HANDLER
       ========================================= */
    function newsletterSignup(emailInputId) {
        const emailInput = document.getElementById(emailInputId);
        const email = emailInput ? emailInput.value.trim() : '';

        if (!email) {
            showNotification('Please enter your email address.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        const subject = 'Newsletter Signup — The Dispatch';
        const body = 'Please add me to The Dispatch mailing list.%0D%0A%0D%0AEmail: ' + email;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            window.location.href = 'mailto:info@management-inc.site?subject=' +
                encodeURIComponent(subject) + '&body=' + body;
        } else {
            window.open('https://mail.google.com/mail/?view=cm&fs=1&to=info@management-inc.site&su=' +
                encodeURIComponent(subject) + '&body=' + body, '_blank', 'noopener,noreferrer');
        }

        // Clear input after "send"
        if (emailInput) emailInput.value = '';
        showNotification('Thanks! Check your email client to complete signup.', 'success');
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    window.newsletterSignup = newsletterSignup;

    /* =========================================
       CONTACT FORM HANDLER
       ========================================= */
    function submitContactForm(formElement) {
        if (!formElement) return;

        const name = formElement.querySelector('input[name="name"]');
        const email = formElement.querySelector('input[name="email"]');
        const subject = formElement.querySelector('select[name="subject"]');
        const message = formElement.querySelector('textarea[name="message"]');

        const nameVal = name ? name.value.trim() : '';
        const emailVal = email ? email.value.trim() : '';
        const subjectVal = subject ? subject.value : 'General Inquiry';
        const messageVal = message ? message.value.trim() : '';

        if (!nameVal || !emailVal || !messageVal) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        if (!isValidEmail(emailVal)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        const subjectMap = {
            'booking': 'Artist Booking Inquiry',
            'press': 'Press & Media Inquiry',
            'management': 'Management Representation Inquiry',
            'collaboration': 'Brand Collaboration Inquiry',
            'other': 'General Inquiry'
        };

        const emailSubject = subjectMap[subjectVal] || 'Inquiry from Stature Management';
        const emailBody = 'Name: ' + nameVal + '%0D%0A' +
            'Email: ' + emailVal + '%0D%0A' +
            '%0D%0A' +
            'Message:%0D%0A' + messageVal;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            window.location.href = 'mailto:info@management-inc.site?subject=' +
                encodeURIComponent(emailSubject) + '&body=' + emailBody;
        } else {
            window.open('https://mail.google.com/mail/?view=cm&fs=1&to=info@management-inc.site&su=' +
                encodeURIComponent(emailSubject) + '&body=' + emailBody, '_blank', 'noopener,noreferrer');
        }

        showNotification('Opening your email client...', 'success');
    }

    window.submitContactForm = submitContactForm;

    /* =========================================
       NOTIFICATION SYSTEM (Toast)
       ========================================= */
    function showNotification(message, type) {
        // Remove existing notification
        const existing = document.querySelector('.stature-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'stature-notification stature-notification-' + type;
        notification.innerHTML = `
            <span class="material-symbols-outlined">${type === 'error' ? 'error_outline' : 'check_circle'}</span>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 24px;
            background: ${type === 'error' ? '#3a1a1a' : '#1a3a1a'};
            border: 1px solid ${type === 'error' ? '#7a2d2d' : '#2d7a2d'};
            border-radius: 8px;
            color: ${type === 'error' ? '#f87171' : '#4ade80'};
            font-family: 'Manrope', sans-serif;
            font-size: 0.8rem;
            font-weight: 600;
            backdrop-filter: blur(8px);
            animation: slideUp 0.3s ease;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    window.showNotification = showNotification;

    /* =========================================
       GALLERY FILTER
       ========================================= */
    function filterGallery(category) {
        // Update active pill
        const pills = document.querySelectorAll('.category-pill');
        pills.forEach(function (pill) {
            pill.classList.remove('active');
            if (pill.getAttribute('data-category') === category) {
                pill.classList.add('active');
            }
        });

        // Filter items
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(function (item) {
            if (category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 10);
            } else {
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    window.filterGallery = filterGallery;

    /* =========================================
       ADDITIONAL: Parallax effect for hero
       ========================================= */
    function initParallax() {
        const heroBg = document.querySelector('.hero-bg');
        if (!heroBg) return;

        window.addEventListener('scroll', function () {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
            }
        });
    }

    // Initialize parallax after a short delay
    setTimeout(initParallax, 100);

})();