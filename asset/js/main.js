/**
 * Main JavaScript - GoodHello Invitation
 * (Legacy entry point)
 *
 * Logic has been split into smaller files for better maintainability:
 *  - lenis-core.js
 *  - hero-envelope.js
 *  - stamps-section.js
 *  - invitation-section.js
 *  - wishes-section.js
 *
 * This file is kept as a lightweight compatibility stub.
 */

// You can safely add any future global helpers here if needed.
console.debug('goodhello main.js loaded (stub).');

/**
 * Main JavaScript - GoodHello Invitation
 * (Legacy entry point)
 *
 * Logic has been split into smaller files for better maintainability:
 *  - lenis-core.js
 *  - hero-envelope.js
 *  - stamps-section.js
 *  - invitation-section.js
 *  - wishes-section.js
 *
 * This file is kept as a lightweight compatibility stub.
 */

// You can safely add any future global helpers here if needed.
console.debug('goodhello main.js loaded (stub).');
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
    const invitationLink = nav ? nav.querySelector('.right p') : null;
    const logo = nav ? nav.querySelector('img') : null;
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

    // Start with nav hidden (will slide down after hero animation)
    if (nav) {
        nav.classList.add('nav-hidden');
    }

    // Scroll to invitation section when clicking "your invitation card"
    if (invitationLink) {
        invitationLink.addEventListener('click', (e) => {
            e.preventDefault();
            const invitationSection = document.getElementById('invitation-section');
            if (!invitationSection) return;

            if (window.lenis) {
                window.lenis.scrollTo(invitationSection, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            } else {
                invitationSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Scroll to top when clicking logo
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.lenis) {
                window.lenis.scrollTo(0, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
});

// =============================================
// INVITATION SECTION
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for user data to be loaded
    if (!window.userLoader || !window.userLoader.userData) {
        console.log('Waiting for user data...');
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const invitationSection = document.querySelector('.invitation-section');
    const invitationCard = document.querySelector('.invitation-card');
    const invitationStamp = document.getElementById('invitation-stamp');
    const calendarBtn = document.getElementById('calendar-btn');
    const locationBtn = document.getElementById('location-btn');
    const messageBtn = document.getElementById('message-btn');
    const downloadBtn = document.getElementById('download-btn');

    if (!invitationSection) return;

    // Set guest name from localStorage (in case overlay already ran or returning visitor)
    const guestNameEl = document.getElementById('guest-name');
    if (guestNameEl && window.userLoader && window.userLoader.currentUser) {
        const stored = localStorage.getItem('guest_name_' + window.userLoader.currentUser);
        if (stored) guestNameEl.textContent = stored;
    }

    // =============================================
    // 1. DISPLAY FAVORITE STAMP
    // =============================================
    function displayFavoriteStamp() {
        if (!window.userLoader) {
            console.error('User loader not initialized');
            return;
        }

        const favoriteIndex = window.userLoader.getFavoriteStamp();
        const userData = window.userLoader.userData;

        if (!userData || !userData.stamps) {
            console.error('No user stamp data available');
            return;
        }

        // Use favorite stamp or default to first stamp
        const stampIndex = favoriteIndex !== null ? parseInt(favoriteIndex) : 0;
        const stamp = userData.stamps[stampIndex];

        if (stamp && invitationStamp) {
            invitationStamp.innerHTML = `
                <img src="${stamp.src}" alt="${stamp.alt}" />
            `;
        }
    }

    // Display stamp immediately
    displayFavoriteStamp();

    // Listen for favorite stamp changes (when user selects new favorite)
    window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('favorite_stamp_')) {
            displayFavoriteStamp();
        }
    });

    // Custom event listener for same-window updates
    window.addEventListener('favoriteStampChanged', () => {
        displayFavoriteStamp();
    });

    // =============================================
    // 2. CALENDAR BUTTON - GOOGLE CALENDAR (PER USER)
    // =============================================
    if (calendarBtn) {
        calendarBtn.addEventListener('click', () => {
            const userData = window.userLoader && window.userLoader.userData ? window.userLoader.userData : {};
            const eventData = userData.event || {};

            // Event details (fallback to defaults if missing)
            const eventTitle = eventData.title || 'Graduation Ceremony';
            const eventLocation = eventData.location || '59c Nguyen Dinh Chieu Street, District 3, Ho Chi Minh City';
            const eventDescription = eventData.description || 'Join me for my graduation ceremony!';
            
            // Date: April 4, 2026, 14:00 (2:00 PM)
            // Format: YYYYMMDDTHHmmSS
            const startDate = eventData.start || '20260404T140000';
            const endDate = eventData.end || '20260404T170000'; // 3 hours duration
            
            // Build Google Calendar URL
            const calendarUrl = new URL('https://calendar.google.com/calendar/render');
            calendarUrl.searchParams.append('action', 'TEMPLATE');
            calendarUrl.searchParams.append('text', eventTitle);
            calendarUrl.searchParams.append('dates', `${startDate}/${endDate}`);
            calendarUrl.searchParams.append('details', eventDescription);
            calendarUrl.searchParams.append('location', eventLocation);
            
            // Open in new tab
            window.open(calendarUrl.toString(), '_blank');
        });
    }

    // =============================================
    // 3. LOCATION BUTTON - GOOGLE MAPS
    // =============================================
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            const mapsUrl = 'https://maps.app.goo.gl/RGrHNW3o5mDidn2d8';
            
            // Open in new tab
            window.open(mapsUrl, '_blank');
        });
    }

    // =============================================
    // 4. MESSAGE BUTTON - Popup nhập lời chúc
    // =============================================
    function sendWishFromForm(message) {
        var host = window.userLoader && window.userLoader.currentUser ? window.userLoader.currentUser : 'phatla';
        var guestName = '';
        try {
            guestName = localStorage.getItem('guest_name_' + host) || '';
        } catch (e) {}
        if (!guestName) guestName = 'Guest';
        if (!message || String(message).trim() === '') {
            return Promise.resolve({ success: false, error: 'Empty message' });
        }
        return window.googleSheetsAPI.addWish(host, guestName, String(message).trim());
    }

    if (messageBtn) {
        messageBtn.addEventListener('click', () => {
            var overlay = document.createElement('div');
            overlay.className = 'wish-modal-overlay';
            overlay.id = 'wish-modal-overlay';
            overlay.innerHTML =
                '<div class="wish-modal">' +
                '<div class="wish-modal-content">' +
                '<div class="wish-modal-field">' +
                '<textarea id="wish-message-input" class="wish-textarea" placeholder="Good luck! or xin chao, chuc ban thanh cong :3" rows="4" maxlength="500"></textarea>' +
                '<div class="wish-modal-error" id="wish-modal-error"></div>' +
                '</div>' +
                '<div class="wish-modal-actions">' +
                '<button type="button" class="wish-btn wish-btn-cancel body-md" id="wish-cancel-btn">Cancel</button>' +
                '<button type="button" class="wish-btn wish-btn-submit body-md" id="wish-submit-btn">' +
                '<span class="wish-btn-send-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M16.8957 0.0400623C17.1046 -0.0433812 17.3431 0.00600926 17.5022 0.165062C17.6612 0.324149 17.7107 0.562664 17.6272 0.771508L11.0803 17.1367C10.8249 17.7751 9.95431 17.8565 9.58518 17.2764L6.00998 11.6572L0.390844 8.08205C-0.189224 7.71292 -0.107895 6.84229 0.530492 6.58694L16.8957 0.0400623ZM7.13401 11.3291L10.2395 16.21L15.5647 2.89846L7.13401 11.3291ZM1.45725 7.42678L6.33811 10.5332L14.7688 2.10256L1.45725 7.42678Z" fill="currentColor"/></svg></span> Send</button>' +
                '</div>' +
                '</div>' +
                '</div>';
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            if (window.lenis) window.lenis.stop();

            var textarea = document.getElementById('wish-message-input');
            var errorEl = document.getElementById('wish-modal-error');
            var submitBtn = document.getElementById('wish-submit-btn');
            var cancelBtn = document.getElementById('wish-cancel-btn');

            function closeModal() {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                if (window.lenis) window.lenis.start();
                setTimeout(function () {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 250);
            }

            cancelBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) closeModal();
            });

            submitBtn.addEventListener('click', function () {
                var msg = (textarea.value || '').trim();
                if (!msg) {
                    errorEl.textContent = 'Please enter your wish.';
                    errorEl.style.display = 'block';
                    return;
                }
                errorEl.style.display = 'none';
                // Optimistic: đóng modal ngay, gửi ở background
                closeModal();
                var toast = document.createElement('div');
                toast.className = 'notification-toast';
                toast.textContent = 'Sending...';
                document.body.appendChild(toast);
                requestAnimationFrame(function () { toast.classList.add('show'); });
                function hideToast() {
                    toast.classList.remove('show');
                    setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
                }
                sendWishFromForm(msg).then(function (res) {
                    toast.textContent = res.success ? 'Wish sent! Thank you.' : (res.message || res.error || 'Failed to send. Try again later.');
                    if (!res.success) toast.classList.add('notification-toast-error');
                    setTimeout(hideToast, 2500);
                    if (res.success && window.wishesSectionRefresh) window.wishesSectionRefresh();
                }).catch(function () {
                    toast.textContent = 'Failed to send. Try again later.';
                    toast.classList.add('notification-toast-error');
                    setTimeout(hideToast, 2500);
                });
            });
            textarea.addEventListener('input', function () {
                errorEl.style.display = 'none';
                var stripped = stripVietnameseDiacritics(textarea.value);
                if (stripped !== textarea.value) textarea.value = stripped;
            });
            requestAnimationFrame(function () {
                overlay.classList.add('active');
                textarea.focus();
            });
        });
    }

    // =============================================
    // 5. DOWNLOAD BUTTON - Export invitation as PDF
    // =============================================
    async function downloadInvitationPdf() {
        if (!invitationCard || !window.html2canvas || !window.jspdf) {
            window.print();
            return;
        }

        // Smooth scroll card into view before capture
        if (window.lenis) {
            window.lenis.scrollTo(invitationSection, { duration: 0.6 });
            await new Promise(resolve => setTimeout(resolve, 700));
        } else {
            invitationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(resolve => setTimeout(resolve, 700));
        }

        // Temporarily reset transforms/shadows for clean capture
        const previousTransform = invitationCard.style.transform;
        const previousBoxShadow = invitationCard.style.boxShadow;
        invitationCard.style.transform = 'none';
        invitationCard.style.boxShadow = 'none';

        try {
            const canvas = await window.html2canvas(invitationCard, {
                scale: 2,
                useCORS: true,
                backgroundColor: null
            });

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 10;
            const maxWidth = pageWidth - margin * 2;
            const imgWidth = maxWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const y = (pageHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', margin, Math.max(y, margin), imgWidth, imgHeight, undefined, 'FAST');

            const guestNameEl = document.getElementById('guest-name');
            const guestName = guestNameEl ? guestNameEl.textContent.trim() : '';
            const safeName = guestName ? guestName.replace(/[^a-z0-9\-]+/gi, '_') : 'guest';

            pdf.save(`goodhello-invitation-${safeName}.pdf`);
        } catch (err) {
            console.error('Error generating invitation PDF:', err);
            window.print();
        } finally {
            invitationCard.style.transform = previousTransform;
            invitationCard.style.boxShadow = previousBoxShadow;
        }
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadInvitationPdf();
        });
    }

    // Hàm gọi từ Console (vẫn dùng được): submitWish("Lời chúc")
    window.submitWish = function (message) {
        return sendWishFromForm(message).then(function (res) {
            if (res.success) console.log('Đã gửi lời chúc.');
            else console.error('Gửi thất bại:', res.error);
            return res;
        });
    };

    // =============================================
    // 5. SCROLL ENTRANCE ANIMATION
    // =============================================
    let hasAnimated = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                
                // Add visible class to card
                if (invitationCard) {
                    invitationCard.classList.add('visible');
                }
            }
        });
    }, { threshold: 0.2 });

    if (invitationSection) {
        observer.observe(invitationSection);
    }
});

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
        const paperWidth = window.innerWidth <= 768 ? 240 : window.innerWidth <= 1024 ? 280 : 330;
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
    // ANIMATE WISHES BOUNCE
    // =============================================
    function animateWishesBounce() {
        const papers = wishesContainer.querySelectorAll('.wish-paper');
        
        papers.forEach((paper, index) => {
            // Stagger the animation
            setTimeout(() => {
                paper.classList.add('falling');
                
                // After animation completes, add visible class and remove falling
                setTimeout(() => {
                    paper.classList.add('visible');
                    paper.classList.remove('falling');
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

// Footer title → scroll to invitation section
const footerScrollBtn = document.getElementById('footer-scroll-top');
if (footerScrollBtn) {
    footerScrollBtn.addEventListener('click', () => {
        const target = document.getElementById('invitation-section');
        if (!target) return;
        if (window.lenis) {
            window.lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
        } else {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}
