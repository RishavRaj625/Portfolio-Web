// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Navigation Elements
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    
    // EMAILJS CONFIGURATION
    // Replace these with your actual EmailJS credentials
    const EMAILJS_CONFIG = {
        PUBLIC_KEY: 'yQ6YMwFRYDFE1276x',    // Get from EmailJS Dashboard
        SERVICE_ID: 'service_4ccpbn5',           // Gmail, Outlook, etc.
        TEMPLATE_ID: 'template_l13fgw5',         // Template you created
        ADMIN_EMAIL: 'rishav2raj78@gmail.com'   // Your email to receive notifications
    };
    
    // Initialize EmailJS
    function initEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            console.log('✅ EmailJS initialized successfully');
        } else {
            console.error('❌ EmailJS library not loaded');
        }
    }
    
    // Smooth Scrolling for Navigation Links
    function initSmoothScrolling() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                if (navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        });
    }
    
    // Mobile Menu Toggle
    function toggleMobileMenu() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
    
    navToggle.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
    
    // Navbar Scroll Effect
    function handleNavbarScroll() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (window.scrollY > 50) {
            navbar.style.background = isDark ? 'rgba(26, 32, 44, 0.98)' : 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = isDark ? 'rgba(26, 32, 44, 0.95)' : 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
    
    // Active Navigation Link Highlighting
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Optimized scroll handler with debouncing
    const debouncedScrollHandler = debounce(() => {
        handleNavbarScroll();
        updateActiveNavLink();
    }, 10);
    
    window.addEventListener('scroll', debouncedScrollHandler);
    
    // Theme Toggle Functionality
    function initThemeToggle() {
        const currentTheme = localStorage.getItem('theme');
        const themeIcon = themeToggle.querySelector('i');
        
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
            
            // Update navbar background immediately
            handleNavbarScroll();
        });
    }
    
    // Animated Counter for Stats
    function animateCounters() {
        const counters = document.querySelectorAll('.stat h4');
        const speed = 100;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const originalText = counter.textContent;
                    const target = parseInt(originalText.replace(/\D/g, ''));
                    const increment = Math.max(1, target / speed);
                    let current = 0;
                    
                    const updateCounter = () => {
                        if (current < target) {
                            current += increment;
                            const displayValue = Math.ceil(current);
                            counter.textContent = displayValue + 
                                (originalText.includes('+') ? '+' : '') + 
                                (originalText.includes('%') ? '%' : '');
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = originalText;
                        }
                    };
                    
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    // Enhanced Scroll Animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        const animatedElements = document.querySelectorAll('.skill-category, .project-card, .about-text, .contact-info, .contact-form');
        
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    }
    
    // ENHANCED CONTACT FORM WITH EMAILJS INTEGRATION
    function initContactForm() {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const contactData = {
                name: formData.get('name').trim(),
                email: formData.get('email').trim(),
                subject: formData.get('subject').trim(),
                message: formData.get('message').trim(),
                timestamp: new Date().toLocaleString('en-US', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                userAgent: navigator.userAgent,
                referrer: document.referrer || 'Direct Access',
                pageURL: window.location.href
            };
            
            // Enhanced validation
            const validationResult = validateForm(contactData);
            if (!validationResult.isValid) {
                showMessage(validationResult.message, 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            setFormLoadingState(submitBtn, true);
            
            try {
                await sendEmailNotification(contactData);
                handleFormSuccess(submitBtn, originalText, contactData);
            } catch (error) {
                console.error('Contact form error:', error);
                handleFormError(submitBtn, originalText, error.message);
            }
        });
    }
    
    // MAIN EMAIL SENDING FUNCTION WITH EMAILJS
    async function sendEmailNotification(contactData) {
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS library not loaded. Please refresh the page and try again.');
        }
        
        // Prepare template parameters for EmailJS
        const templateParams = {
            // User details
            from_name: contactData.name,
            from_email: contactData.email,
            reply_to: contactData.email,
            
            // Message content
            subject: contactData.subject,
            message: contactData.message,
            
            // Your email (where notifications will be sent)
            to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
            to_name: "Rishav Raj",
            
            // Additional metadata
            timestamp: contactData.timestamp,
            user_agent: contactData.userAgent,
            referrer: contactData.referrer,
            page_url: contactData.pageURL,
            
            // Email subject line
            email_subject: `New Portfolio Contact: ${contactData.subject}`,
            
            // Formatted message for better readability
            formatted_message: `
New contact form submission from your portfolio:

Name: ${contactData.name}
Email: ${contactData.email}
Subject: ${contactData.subject}

Message:
${contactData.message}

---
Submission Details:
Time: ${contactData.timestamp}
Page: ${contactData.pageURL}
Referrer: ${contactData.referrer}
            `.trim()
        };
        
        try {
            // Send email using EmailJS
            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                templateParams
            );
            
            console.log('✅ Email sent successfully:', response);
            return response;
            
        } catch (error) {
            console.error('❌ EmailJS Error:', error);
            
            // Provide user-friendly error messages
            let errorMessage = 'Failed to send message. ';
            
            if (error.text) {
                if (error.text.includes('Invalid service ID')) {
                    errorMessage += 'Email service configuration error.';
                } else if (error.text.includes('Invalid template ID')) {
                    errorMessage += 'Email template configuration error.';
                } else if (error.text.includes('Invalid public key')) {
                    errorMessage += 'Email service authentication error.';
                } else {
                    errorMessage += error.text;
                }
            } else {
                errorMessage += 'Please check your internet connection and try again.';
            }
            
            throw new Error(errorMessage);
        }
    }
    
    // Enhanced form validation
    function validateForm(data) {
        const { name, email, subject, message } = data;
        
        if (!name || name.length < 2) {
            return { isValid: false, message: 'Please enter a valid name (at least 2 characters).' };
        }
        
        if (name.length > 50) {
            return { isValid: false, message: 'Name is too long (maximum 50 characters).' };
        }
        
        if (!email || !isValidEmail(email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }
        
        if (!subject || subject.length < 3) {
            return { isValid: false, message: 'Please enter a subject (at least 3 characters).' };
        }
        
        if (subject.length > 100) {
            return { isValid: false, message: 'Subject is too long (maximum 100 characters).' };
        }
        
        if (!message || message.length < 10) {
            return { isValid: false, message: 'Please enter a message (at least 10 characters).' };
        }
        
        if (message.length > 1000) {
            return { isValid: false, message: 'Message is too long (maximum 1000 characters).' };
        }
        
        // Enhanced spam detection
        const spamPatterns = [
            /viagra|cialis|pharmacy|casino|lottery/i,
            /buy now|act now|urgent|limited time/i,
            /\$\$\$|\€\€\€|₹₹₹/,
            /(https?:\/\/[^\s]+){3,}/i, // Multiple URLs
            /(.)\1{10,}/, // Repeated characters
            /\b(sex|adult|porn)\b/i
        ];
        
        const fullText = `${name} ${email} ${subject} ${message}`.toLowerCase();
        const spamMatch = spamPatterns.find(pattern => pattern.test(fullText));
        
        if (spamMatch) {
            console.warn('Spam detected:', spamMatch);
            return { isValid: false, message: 'Message contains inappropriate content or appears to be spam.' };
        }
        
        return { isValid: true };
    }
    
    // Form state management
    function setFormLoadingState(submitBtn, isLoading) {
        if (isLoading) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Message...';
            submitBtn.disabled = true;
            contactForm.classList.add('loading');
            
            // Disable all form inputs
            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.disabled = false;
            contactForm.classList.remove('loading');
            
            // Re-enable all form inputs
            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => input.disabled = false);
        }
    }
    
    function handleFormSuccess(submitBtn, originalText, contactData) {
        setFormLoadingState(submitBtn, false);
        
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent Successfully!';
        submitBtn.style.background = '#10b981';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 4000);
        
        contactForm.reset();
        
        showMessage(
            `Thank you, ${contactData.name}! Your message has been sent successfully. I'll get back to you at ${contactData.email} within 24 hours.`,
            'success'
        );
        
        // Analytics tracking (if you have Google Analytics)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Contact',
                event_label: 'Portfolio Contact Form',
                value: 1
            });
        }
        
        // Console log for debugging
        console.log('✅ Form submitted successfully:', {
            name: contactData.name,
            email: contactData.email,
            timestamp: contactData.timestamp
        });
    }
    
    function handleFormError(submitBtn, originalText, errorMessage) {
        setFormLoadingState(submitBtn, false);
        
        submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed - Try Again';
        submitBtn.style.background = '#ef4444';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 4000);
        
        showMessage(
            `Sorry, there was an error sending your message: ${errorMessage} Please try again or contact me directly at rishav2raj78@gmail.com`,
            'error'
        );
        
        // Log error for debugging
        console.error('❌ Form submission error:', errorMessage);
    }
    
    // Enhanced email validation
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email) && email.length <= 254 && email.length >= 5;
    }
    
    // Enhanced message display with better styling
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessages = contactForm.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        const bgColor = type === 'success' ? '#10b981' : '#ef4444';
        
        messageDiv.innerHTML = `
            <div style="
                display: flex; 
                align-items: flex-start; 
                gap: 0.75rem; 
                padding: 1rem 1.25rem; 
                background: ${bgColor}; 
                color: white; 
                border-radius: 8px; 
                margin-top: 1.5rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                animation: slideInUp 0.3s ease-out;
            ">
                <i class="fas fa-${icon}" style="margin-top: 2px; font-size: 1.1em;"></i>
                <span style="flex: 1; line-height: 1.5;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none; 
                    border: none; 
                    color: rgba(255, 255, 255, 0.8); 
                    cursor: pointer;
                    padding: 0;
                    margin-left: 0.5rem;
                    font-size: 1.2em;
                    hover: color: white;
                " title="Dismiss">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        contactForm.appendChild(messageDiv);
        
        // Auto-remove after 10 seconds for success, 15 seconds for error
        const autoRemoveTime = type === 'success' ? 10000 : 15000;
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.style.animation = 'slideOutDown 0.3s ease-in';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, autoRemoveTime);
        
        // Scroll message into view
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Typing Animation for Hero Title
    function initTypingAnimation() {
        const heroTitle = document.querySelector('.hero-title');
        const gradientText = heroTitle.querySelector('.gradient-text');
        
        if (gradientText) {
            gradientText.style.opacity = '0';
            
            setTimeout(() => {
                gradientText.style.opacity = '1';
                gradientText.style.animation = 'fadeInUp 0.8s ease forwards';
            }, 500);
        }
    }
    
    // Optimized Parallax Effect
    function initParallaxEffect() {
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        let ticking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            
            if (heroContent && scrolled < hero.offsetHeight) {
                heroContent.style.transform = `translate3d(0, ${rate}px, 0)`;
            }
            ticking = false;
        }
        
        function requestParallaxUpdate() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestParallaxUpdate);
    }
    
    // Enhanced Skills Animation
    function initSkillsAnimation() {
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach((item, index) => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.05)';
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
            
            // Stagger animation on scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
    }
    
    // Enhanced Project Cards with 3D Effect
    function initProjectTiltEffect() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 8;
                const rotateY = (centerX - x) / 8;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }
    
    // Performance monitoring
    function initPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log(`Page loaded in ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
            }
        });
        
        // Monitor EmailJS loading
        const checkEmailJS = setInterval(() => {
            if (typeof emailjs !== 'undefined') {
                console.log('✅ EmailJS library loaded successfully');
                clearInterval(checkEmailJS);
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkEmailJS);
            if (typeof emailjs === 'undefined') {
                console.error('❌ EmailJS library failed to load within 10 seconds');
            }
        }, 10000);
    }
    
    // Initialize all functions
    function init() {
        initEmailJS();
        initSmoothScrolling();
        initThemeToggle();
        initContactForm();
        initScrollAnimations();
        initTypingAnimation();
        initParallaxEffect();
        initSkillsAnimation();
        initProjectTiltEffect();
        initPerformanceMonitoring();
        animateCounters();
        
        // Initial states
        handleNavbarScroll();
        
        console.log('✅ Portfolio website initialized successfully!');
        console.log('📧 EmailJS Configuration:', {
            publicKey: EMAILJS_CONFIG.PUBLIC_KEY ? '✓ Set' : '❌ Missing',
            serviceId: EMAILJS_CONFIG.SERVICE_ID ? '✓ Set' : '❌ Missing',
            templateId: EMAILJS_CONFIG.TEMPLATE_ID ? '✓ Set' : '❌ Missing',
            adminEmail: EMAILJS_CONFIG.ADMIN_EMAIL
        });
    }
    
    // Initialize everything
    init();
    
    // Add enhanced CSS for animations and states
    const style = document.createElement('style');
    style.textContent = `
        .nav-link.active {
            color: var(--primary-color) !important;
        }
        
        .nav-link.active::after {
            width: 100% !important;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideOutDown {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(20px);
            }
        }
        
        .loading {
            pointer-events: none;
            opacity: 0.7;
        }
        
        .loading input,
        .loading textarea {
            background-color: #f5f5f5 !important;
            cursor: not-allowed;
        }
        
        .success-message,
        .error-message {
            animation: slideInUp 0.3s ease-out;
            border-radius: 8px;
            margin-top: 1rem;
        }
        
        .skill-item,
        .project-card {
            will-change: transform;
        }
        
        .project-card {
            transition: transform 0.2s ease-out;
        }
        
        /* Form validation styles */
        .form-group input:invalid,
        .form-group textarea:invalid {
            border-color: #ef4444;
        }
        
        .form-group input:valid,
        .form-group textarea:valid {
            border-color: #10b981;
        }
        
        /* Loading spinner animation */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .fa-spinner {
            animation: spin 1s linear infinite;
        }
        
        /* Responsive improvements */
        @media (max-width: 768px) {
            .success-message,
            .error-message {
                margin: 1rem -1rem 0;
                border-radius: 0;
            }
        }
        
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}