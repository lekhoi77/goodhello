/**
 * Main JavaScript - GoodHello Invitation
 * All interactive functionality for the invitation page
 */

// =============================================
// LENIS SMOOTH SCROLL INITIALIZATION
// =============================================
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 2
});

// Make lenis globally accessible
window.lenis = lenis;

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// =============================================
// ENVELOPE ANIMATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    const letterGroup = document.querySelector('#letter');
    const flap = document.querySelector('#flap');

    gsap.set(letterGroup, { y: 350 });

    const mainTimeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        delay: 0.3
    });

    mainTimeline.to(envelopeWrapper, {
        y: '-40%',
        duration: 1.5,
        ease: 'power3.out'
    });

    mainTimeline.to(flap, {
        rotateX: -160,
        duration: 0.6,
        ease: 'power2.inOut'
    }, '+=0.1');

    mainTimeline.to(letterGroup, {
        y: -20,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.3');

    // Add infinite floating animation after the main animation completes
    mainTimeline.call(() => {
        // Floating animation for the entire envelope (up and down)
        gsap.to(envelopeWrapper, {
            y: '-42%',
            duration: 2.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });

        // Subtle rotation for more natural floating effect
        gsap.to(envelopeWrapper, {
            rotation: 1.5,
            duration: 3.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });
    });

    // Add click handler for stamp placeholder to scroll to stamps section
    const stampPlaceholderGroup = document.querySelector('.stamp-placeholder-group');
    
    if (stampPlaceholderGroup) {
        stampPlaceholderGroup.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const stampsSection = document.querySelector('.stamps-section');
            if (stampsSection && window.lenis) {
                window.lenis.scrollTo(stampsSection, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    }
});

// =============================================
// STAMPS SECTION LOGIC - DYNAMIC VERSION
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    const stampsSection = document.querySelector('.stamps-section');
    const stampsTitle = document.getElementById('stamps-section-title');
    const stampsGrid = document.getElementById('stamps-grid');

    // Initialize user loader and get data
    try {
        await window.userLoader.init();
        
        // Update main title
        window.userLoader.updateMainTitle(stampsTitle);
        
        // Render stamps dynamically
        const stampItems = window.userLoader.renderStamps(stampsGrid);
        
        if (!stampItems || stampItems.length === 0) {
            console.error('No stamps rendered');
            return;
        }

        const defaultTitle = stampsTitle.innerHTML; // Use innerHTML to preserve <br>

        // Predefined rotations for each stamp (fixed)
        const fixedRotations = [-5, 3, -7, 4, -3, 6];

        // 1. Position stamps in circular layout (desktop only)
        function positionStampsCircular() {
            if (window.innerWidth > 768) {
                const radius = 450;
                const centerX = stampsGrid.offsetWidth / 2;
                const centerY = stampsGrid.offsetHeight / 2;

                stampItems.forEach((stamp, index) => {
                    const angle = (index / stampItems.length) * 2 * Math.PI - Math.PI / 2;
                    let x = centerX + radius * Math.cos(angle) - stamp.offsetWidth / 2;
                    let y = centerY + radius * Math.sin(angle) - stamp.offsetHeight / 2;
                    
                    // Custom offsets for specific stamps
                    if (index === 0) {
                        y += 100;
                    }
                    if (index === 3) {
                        y -= 100;
                    }
                    
                    // Use fixed rotation
                    const rotation = fixedRotations[index] || 0;
                    
                    stamp.style.left = `${x}px`;
                    stamp.style.top = `${y}px`;
                    stamp.style.transform = `rotate(${rotation}deg)`;
                    stamp.dataset.baseRotation = rotation;
                });
            }
        }

        // Wait for all stamp images to load before positioning
        const imageLoadPromises = stampItems.map(stamp => {
            return new Promise((resolve) => {
                if (stamp.complete) {
                    resolve();
                } else {
                    stamp.addEventListener('load', resolve);
                    stamp.addEventListener('error', resolve); // Resolve even on error
                }
            });
        });

        Promise.all(imageLoadPromises).then(() => {
            positionStampsCircular();
        });
        
        window.addEventListener('resize', positionStampsCircular);

        // 2. Hover interaction: change title simply
        // Helper function: Format title with 2 words first, rest on new line
        function formatTitle(text) {
            const words = text.split(' ');
            if (words.length <= 2) return text;
            const firstLine = words.slice(0, 2).join(' ');
            const secondLine = words.slice(2).join(' ');
            return `${firstLine}<br>${secondLine}`;
        }
        
        // Track if hover is enabled (only after animation completes)
        let isHoverEnabled = false;
        
        stampItems.forEach(stamp => {
            const hoverHandler = () => {
                if (!isHoverEnabled) return; // Disable hover during animation
                const rawTitle = stamp.dataset.title || defaultTitle;
                const newTitle = formatTitle(rawTitle);
                stampsTitle.innerHTML = newTitle;
            };

            const resetHandler = () => {
                if (!isHoverEnabled) return; // Disable hover during animation
                stampsTitle.innerHTML = defaultTitle;
            };

            stamp.addEventListener('mouseenter', hoverHandler);
            stamp.addEventListener('mouseleave', resetHandler);

            // Mobile: tap to change title
            stamp.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && isHoverEnabled) {
                    e.preventDefault();
                    hoverHandler();
                    setTimeout(resetHandler, 2000);
                }
            });
        });

        // Initialize stamp details controller
        const detailsContainer = document.getElementById('stamp-details-container');
        window.stampDetailsController.init(detailsContainer, stampsSection);

        // Add click handlers to stamps to show details
        stampItems.forEach((stamp, index) => {
            stamp.addEventListener('click', () => {
                if (window.innerWidth > 768 && isHoverEnabled) {
                    window.stampDetailsController.showDetail(index);
                }
            });

            // Add cursor pointer for desktop
            if (window.innerWidth > 768) {
                stamp.style.cursor = 'pointer';
            }
        });

        // 3. Entrance animation with Intersection Observer
        let hasAnimated = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    
                    // Title slides up
                    stampsTitle.classList.add('visible');
                    
                    // Stamps appear one by one in circular order with stagger
                    stampItems.forEach((stamp, index) => {
                        setTimeout(() => {
                            stamp.classList.add('visible');
                        }, 300 + index * 150);
                    });
                    
                    // Enable hover after all animations complete
                    // Last stamp appears at: 300 + (6-1) * 150 = 1050ms
                    // Add buffer for opacity transition (600ms)
                    const totalAnimationTime = 300 + (stampItems.length - 1) * 150 + 600;
                    setTimeout(() => {
                        isHoverEnabled = true;
                    }, totalAnimationTime);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(stampsSection);
        
    } catch (error) {
        console.error('Failed to initialize stamps section:', error);
    }
});

// =============================================
// NAV HIDE/SHOW ON SCROLL
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavVisibility() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down & past 100px -> hide nav
            nav.classList.add('nav-hidden');
        } else if (currentScrollY < lastScrollY) {
            // Scrolling up -> show nav
            nav.classList.remove('nav-hidden');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavVisibility);
            ticking = true;
        }
    });
});
