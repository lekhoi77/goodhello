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

/** Strip Vietnamese diacritics so font displays correctly (shared for name + wish inputs) */
function stripVietnameseDiacritics(str) {
    if (!str) return str;
    var map = { 'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a','â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a','À':'A','Á':'A','Ả':'A','Ã':'A','Ạ':'A','Ă':'A','Ằ':'A','Ắ':'A','Ẳ':'A','Ẵ':'A','Ặ':'A','Â':'A','Ầ':'A','Ấ':'A','Ẩ':'A','Ẫ':'A','Ậ':'A','è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e','È':'E','É':'E','Ẻ':'E','Ẽ':'E','Ẹ':'E','Ê':'E','Ề':'E','Ế':'E','Ể':'E','Ễ':'E','Ệ':'E','ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i','Ì':'I','Í':'I','Ỉ':'I','Ĩ':'I','Ị':'I','ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o','ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o','Ò':'O','Ó':'O','Ỏ':'O','Õ':'O','Ọ':'O','Ô':'O','Ồ':'O','Ố':'O','Ổ':'O','Ỗ':'O','Ộ':'O','Ơ':'O','Ờ':'O','Ớ':'O','Ở':'O','Ỡ':'O','Ợ':'O','ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u','Ù':'U','Ú':'U','Ủ':'U','Ũ':'U','Ụ':'U','Ư':'U','Ừ':'U','Ứ':'U','Ử':'U','Ữ':'U','Ự':'U','ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y','Ỳ':'Y','Ý':'Y','Ỷ':'Y','Ỹ':'Y','Ỵ':'Y','đ':'d','Đ':'D' };
    return String(str).replace(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/g, function (c) { return map[c] || c; });
}
window.stripVietnameseDiacritics = stripVietnameseDiacritics;

// =============================================
// ENVELOPE ANIMATION (starts after guest name is entered)
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    const letterGroup = document.querySelector('#letter');
    const flap = document.querySelector('#flap');
    const nav = document.querySelector('nav');

    gsap.set(letterGroup, { y: 350 });

    function startHeroAnimation() {
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

            // Show nav only after hero animation is done (slide down)
            if (nav) {
                nav.classList.remove('nav-hidden');
            }
        });
    }

    // Start hero only after guest has entered their name (event from guest-input.js)
    window.addEventListener('guestNameReady', startHeroAnimation);

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

            var textarea = document.getElementById('wish-message-input');
            var errorEl = document.getElementById('wish-modal-error');
            var submitBtn = document.getElementById('wish-submit-btn');
            var cancelBtn = document.getElementById('wish-cancel-btn');

            function closeModal() {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
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
                }, 1200); // Match the animation duration
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
