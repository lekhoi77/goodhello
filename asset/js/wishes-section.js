// =============================================
// WISHES SECTION
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    const wishesSection = document.querySelector('.wishes-section');
    const wishesContainer = document.getElementById('wishes-container');
    
    if (!wishesSection || !wishesContainer) return;

    // Fetch wishes from Google Sheet for current host
    let wishesData = [];
    const host = window.userLoader && window.userLoader.currentUser ? window.userLoader.currentUser : 'phatla';
    if (window.googleSheetsAPI && window.googleSheetsAPI.getWishes) {
        try {
            const result = await window.googleSheetsAPI.getWishes(host);
            if (result.success && Array.isArray(result.wishes)) {
                wishesData = result.wishes.map(function (w) {
                    return { message: w.message || '', guestName: w.guestName };
                });
            }
        } catch (e) {
            console.warn('Could not load wishes from sheet:', e);
        }
    }

    // Color palette for bookmarks - matching design
    const bookmarkColors = [
        '#0038BC', // Primary Blue
        '#D32F2F', // Red
        '#F57C00', // Orange
        '#388E3C', // Green
        '#7CB342'  // Lime Green
    ];


    // =============================================
    // DRAG AND DROP VARIABLES
    // =============================================
    let isDragging = false;
    let currentDraggedPaper = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let paperStartX = 0;
    let paperStartY = 0;

    // =============================================
    // RENDER WISHES
    // =============================================
    function renderWishes() {
        const containerWidth = wishesContainer.offsetWidth;
        const paperWidth = window.innerWidth <= 768 ? 240 : window.innerWidth <= 1024 ? 280 : 450;
        const paperHeight = 116; // Min height
        
        wishesData.forEach((wish, index) => {
            // Create paper element
            const paper = document.createElement('div');
            paper.className = 'wish-paper';
            
            // Different rotation for each card (-15 to 15 degrees)
            const rotations = [-12, 8, -5, 15, -8, 10];
            const rotation = rotations[index % rotations.length];
            paper.style.setProperty('--rotation', `${rotation}deg`);
            
            // Position cards at bottom, scattered horizontally with overlap
            const spacing = wishesData.length <= 1 ? 0 : (containerWidth - paperWidth) / (wishesData.length - 1);
            const baseLeft = index * spacing * 0.8; // 0.8 to create more overlap
            const randomOffset = (Math.random() - 0.5) * 60; // Add some randomness
            const left = Math.max(0, Math.min(containerWidth - paperWidth, baseLeft + randomOffset));
            
            // Position at bottom with slight variation
            const bottomVariation = Math.random() * 40 - 20; // -20 to 20px variation
            const bottom = -30 + bottomVariation; // Negative to allow cards to be cut off by overflow
            
            // Set position
            paper.style.left = `${left}px`;
            paper.style.bottom = `${bottom}px`;
            paper.style.top = 'auto'; // Override any top positioning
            
            // Bookmark color
            const bookmarkColor = bookmarkColors[index % bookmarkColors.length];
            
            // Create bookmark
            const bookmark = document.createElement('div');
            bookmark.className = 'wish-bookmark';
            bookmark.style.background = bookmarkColor;
            
            // Create content
            const content = document.createElement('div');
            content.className = 'wish-content';
            content.textContent = wish.message;
            
            // Append elements
            paper.appendChild(bookmark);
            paper.appendChild(content);
            
            // Add drag functionality
            enableDrag(paper);
            
            // Append to container
            wishesContainer.appendChild(paper);
        });
    }

    // =============================================
    // ENABLE DRAG FUNCTIONALITY
    // =============================================
    function enableDrag(paper) {
        paper.addEventListener('mousedown', startDrag);
        paper.addEventListener('touchstart', startDrag, { passive: false });
    }

    function startDrag(e) {
        if (!this.classList.contains('visible')) return; // Only allow drag after card has landed
        
        isDragging = true;
        currentDraggedPaper = this;
        
        // Get initial positions
        const rect = this.getBoundingClientRect();
        const containerRect = wishesContainer.getBoundingClientRect();
        
        if (e.type === 'mousedown') {
            dragStartX = e.clientX;
            dragStartY = e.clientY;
        } else {
            dragStartX = e.touches[0].clientX;
            dragStartY = e.touches[0].clientY;
        }
        
        // Calculate paper's current position relative to container
        paperStartX = rect.left - containerRect.left;
        paperStartY = rect.top - containerRect.top;
        
        // Bring to front
        this.style.zIndex = 1000;
        
        // Disable all transitions for smooth dragging, but keep rotation instant
        this.style.transition = 'none';
        
        // Rotate straight and scale up immediately
        this.style.transform = 'rotate(0deg) scale(1.1)';
        
        // Remove wiggle hint if still playing
        this.classList.remove('hint-wiggle');

        // Dismiss drag hint text on first drag
        hideDragHint();
        
        // Add dragging class
        this.classList.add('dragging');
        
        // Prevent text selection
        e.preventDefault();
    }

    // Global mouse/touch move handler
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });

    function drag(e) {
        if (!isDragging || !currentDraggedPaper) return;
        
        let clientX, clientY;
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        
        const deltaX = clientX - dragStartX;
        const deltaY = clientY - dragStartY;
        
        const newX = paperStartX + deltaX;
        const newY = paperStartY + deltaY;
        
        // Update position
        currentDraggedPaper.style.left = `${newX}px`;
        currentDraggedPaper.style.top = `${newY}px`;
        currentDraggedPaper.style.bottom = 'auto'; // Remove bottom positioning
        
        e.preventDefault();
    }

    // Global mouse/touch up handler
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function endDrag() {
        if (!isDragging) return;
        
        if (currentDraggedPaper) {
            // Get current position
            const currentLeft = parseInt(currentDraggedPaper.style.left) || 0;
            const currentTop = parseInt(currentDraggedPaper.style.top) || 0;
            
            // Calculate bottom position (rơi xuống đáy section)
            const containerHeight = wishesContainer.offsetHeight;
            const paperHeight = currentDraggedPaper.offsetHeight;
            
            // Random bottom variation
            const bottomVariation = Math.random() * 40 - 20;
            const targetBottom = -30 + bottomVariation;
            
            // Convert to top position
            const targetTop = containerHeight - paperHeight + targetBottom;
            
            // Get original rotation
            const rotation = currentDraggedPaper.style.getPropertyValue('--rotation');
            
            // Re-enable transitions for drop animation
            currentDraggedPaper.style.transition = 'top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s ease';
            
            // Add drop animation class
            currentDraggedPaper.classList.add('dropping');
            currentDraggedPaper.classList.remove('dragging');
            
            // Animate to bottom, rotate back, and scale back to normal
            currentDraggedPaper.style.top = `${targetTop}px`;
            currentDraggedPaper.style.bottom = 'auto';
            currentDraggedPaper.style.transform = `rotate(${rotation}) scale(1)`;
            
            // Remove dropping class after animation
            setTimeout(() => {
                if (currentDraggedPaper) {
                    currentDraggedPaper.classList.remove('dropping');
                    currentDraggedPaper.style.zIndex = '';
                    currentDraggedPaper.style.transition = '';
                }
            }, 600);
        }
        
        isDragging = false;
        currentDraggedPaper = null;
    }


    // =============================================
    // DRAG HINT TEXT
    // =============================================
    const dragHintEl = document.getElementById('drag-hint');
    let dragHintDismissed = false;

    function showDragHint() {
        if (!dragHintEl || dragHintDismissed) return;
        dragHintEl.classList.add('visible');
    }

    function hideDragHint() {
        if (!dragHintEl) return;
        dragHintEl.classList.add('hide');
        setTimeout(() => {
            dragHintEl.classList.remove('visible', 'hide');
            dragHintDismissed = true;
        }, 400);
    }

    // =============================================
    // ANIMATE WISHES BOUNCE
    // =============================================
    function animateWishesBounce() {
        const papers = wishesContainer.querySelectorAll('.wish-paper');
        const lastIndex = papers.length - 1;
        
        papers.forEach((paper, index) => {
            // Stagger the animation
            setTimeout(() => {
                paper.classList.add('falling');
                
                // Play wish drop sound effect
                if (window.playSFX && index < 3) { // Only play for first few papers to avoid spam
                    window.playSFX('wish-drop', 0.4 + Math.random() * 0.3); // Vary volume slightly
                }
                
                // After animation completes, add visible class and remove falling
                setTimeout(() => {
                    paper.classList.add('visible');
                    paper.classList.remove('falling');

                    // Wiggle hint — stagger each card slightly so they don't all wiggle at once
                    setTimeout(() => {
                        paper.classList.add('hint-wiggle');
                        paper.addEventListener('animationend', () => {
                            paper.classList.remove('hint-wiggle');
                        }, { once: true });
                    }, index * 120);

                    // Show drag hint text after the last card has landed
                    if (index === lastIndex) {
                        setTimeout(() => showDragHint(), index * 120 + 800);
                    }
                }, 1800); // Match the animation duration
            }, index * 150); // Slightly longer stagger for better visual
        });
    }


    // =============================================
    // INTERSECTION OBSERVER FOR ENTRANCE
    // =============================================
    let hasAnimated = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateWishesBounce();
            }
        });
    }, { threshold: 0.2 });

    // =============================================
    // REFRESH (sau khi gửi lời chúc từ popup)
    // =============================================
    window.wishesSectionRefresh = function () {
        if (!window.googleSheetsAPI || !window.googleSheetsAPI.getWishes) return Promise.resolve();
        return window.googleSheetsAPI.getWishes(host, false).then(function (result) {
            if (result.success && Array.isArray(result.wishes)) {
                wishesData = result.wishes.map(function (w) {
                    return { message: w.message || '', guestName: w.guestName };
                });
            }
            wishesContainer.innerHTML = '';
            renderWishes();
            var papers = wishesContainer.querySelectorAll('.wish-paper');
            papers.forEach(function (paper) { paper.classList.add('visible'); });
        });
    };

    // =============================================
    // BACKGROUND TRANSITION ON SCROLL
    // =============================================
    const bgOverlay = document.createElement('div');
    bgOverlay.id = 'wishes-bg-overlay';
    bgOverlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'pointer-events:none',
        'z-index:-1',
        'opacity:0',
        'background:radial-gradient(71.35% 71.35% at 50% 28.65%, #FFCD88 0%, #FFF 100%)',
        'background-attachment:fixed',
        'background-repeat:no-repeat',
        'will-change:opacity'
    ].join(';');
    document.body.appendChild(bgOverlay);

    function initWishesBgScrollTrigger() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        // Fade in as wishes section enters viewport, scrub automatically reverses on scroll up
        gsap.to(bgOverlay, {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: wishesSection,
                start: 'top 80%',
                end: 'top 20%',
                scrub: true,
            }
        });
    }

    if (document.readyState === 'complete') {
        initWishesBgScrollTrigger();
    } else {
        window.addEventListener('load', initWishesBgScrollTrigger);
    }

    // =============================================
    // INITIALIZE
    // =============================================
    renderWishes();
    observer.observe(wishesSection);
    
    // Re-render on window resize to adjust positions
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            wishesContainer.innerHTML = '';
            renderWishes();
            if (hasAnimated) {
                const papers = wishesContainer.querySelectorAll('.wish-paper');
                papers.forEach(paper => paper.classList.add('visible'));
            }
        }, 250);
    });
});

