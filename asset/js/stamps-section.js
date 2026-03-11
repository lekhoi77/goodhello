// =============================================
// STAMPS SECTION LOGIC - DYNAMIC VERSION
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
    const stampsSection = document.querySelector('.stamps-section');
    const stampsTitle = document.getElementById('stamps-section-title');
    const stampsGrid = document.getElementById('stamps-grid');

    try {
        await window.userLoader.init();
        
        window.userLoader.updateMainTitle(stampsTitle);
        
        const stampItems = window.userLoader.renderStamps(stampsGrid);
        
        if (!stampItems || stampItems.length === 0) {
            console.error('No stamps rendered');
            return;
        }

        let firstStampWrapper = null;
        const isVinhNghi = window.userLoader.currentUser === 'vinhnghi';
        if (stampItems[0] && !isVinhNghi) {
            firstStampWrapper = document.createElement('div');
            firstStampWrapper.className = 'stamp-first-hint-wrapper';
            stampsGrid.insertBefore(firstStampWrapper, stampItems[0]);
            firstStampWrapper.appendChild(stampItems[0]);
        }

        const defaultTitle = stampsTitle.innerHTML;

        // Predefined rotations for each stamp (fixed)
        const fixedRotations = [-5, 3, -7, 4, -3, 6];

        // 1. Position stamps in circular layout (desktop only)
        function positionStampsCircular() {
            if (window.innerWidth > 768) {
                const radius = 450;
                const centerX = stampsGrid.offsetWidth / 2;
                const centerY = stampsGrid.offsetHeight / 2;

                stampItems.forEach((stamp, index) => {
                    const el = index === 0 && firstStampWrapper ? firstStampWrapper : stamp;
                    const w = index === 0 && firstStampWrapper ? firstStampWrapper.offsetWidth : stamp.offsetWidth;
                    const h = index === 0 && firstStampWrapper ? firstStampWrapper.offsetHeight : stamp.offsetHeight;
                    const angle = (index / stampItems.length) * 2 * Math.PI - Math.PI / 2;
                    let x = centerX + radius * Math.cos(angle) - w / 2;
                    let y = centerY + radius * Math.sin(angle) - h / 2;
                    
                    if (index === 0) y += 100;
                    if (index === 1) {
                        x += 20; // Di chuyển stamp số 2 sang phải 20px
                        y += 10; // Di chuyển stamp số 2 xuống dưới 10px
                    }
                    if (index === 3) y -= 100;
                    
                    const rotation = fixedRotations[index] || 0;
                    el.style.left = `${x}px`;
                    el.style.top = `${y}px`;
                    stamp.style.setProperty('--base-rotation', `${rotation}deg`);
                    stamp.style.setProperty('--float-delay', `-${index * 0.45}s`);
                    stamp.dataset.baseRotation = rotation;
                    if (index === 0 && firstStampWrapper) {
                        firstStampWrapper.style.setProperty('--base-rotation', `${rotation}deg`);
                        firstStampWrapper.style.setProperty('--float-delay', `-${index * 0.45}s`);
                    }
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
                    stamp.addEventListener('error', resolve);
                }
            });
        });

        Promise.all(imageLoadPromises).then(() => {
            positionStampsCircular();
            initMobileCarousel();
        });
        
        window.addEventListener('resize', positionStampsCircular);

        // Helper function: Format title with 2 words first, rest on new line
        function formatTitle(text) {
            // If title already contains <br> tags (pre-formatted), return as-is
            if (text.includes('<br>')) {
                return text;
            }
            
            const words = text.split(' ');
            if (words.length <= 2) return text;
            const firstLine = words.slice(0, 2).join(' ');
            const secondLine = words.slice(2).join(' ');
            return `${firstLine}<br>${secondLine}`;
        }
        
        // Track if hover is enabled (only after animation completes)
        let isHoverEnabled = false;

        // Swipe indicator reference (created in initMobileCarousel)
        let swipeIndicator = null;

        // 2. Mobile: native swipe carousel + title sync + swipe indicator
        function initMobileCarousel() {
            if (window.innerWidth > 768) return;

            // Init title với stamp đầu tiên
            if (stampItems[0]) {
                stampsTitle.innerHTML = formatTitle(stampItems[0].dataset.title || defaultTitle);
            }

            // Tạo swipe indicator (góc phải trên của section)
            swipeIndicator = document.createElement('div');
            swipeIndicator.className = 'stamps-swipe-indicator';
            swipeIndicator.innerHTML = `
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            stampsSection.appendChild(swipeIndicator);

            // Title sync: tính stamp nào đang ở giữa viewport khi user swipe
            let titleSyncTimeout;
            stampsGrid.addEventListener('scroll', () => {
                // Ẩn indicator ngay khi user bắt đầu swipe
                if (swipeIndicator) swipeIndicator.classList.add('hidden');

                clearTimeout(titleSyncTimeout);
                titleSyncTimeout = setTimeout(() => {
                    const gridCenter = stampsGrid.scrollLeft + stampsGrid.offsetWidth / 2;
                    let closestIdx = 0;
                    let closestDist = Infinity;

                    stampItems.forEach((stamp, i) => {
                        const stampCenter = stamp.offsetLeft + stamp.offsetWidth / 2;
                        const dist = Math.abs(gridCenter - stampCenter);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestIdx = i;
                        }
                    });

                    stampsTitle.innerHTML = formatTitle(stampItems[closestIdx].dataset.title || defaultTitle);
                }, 50);
            }, { passive: true });
        }

        // 3. Hover interaction (desktop only)
        stampItems.forEach(stamp => {
            const hoverHandler = () => {
                if (!isHoverEnabled) return;
                stampsTitle.innerHTML = formatTitle(stamp.dataset.title || defaultTitle);
                
                // Play hover sound effect
                if (window.playSFX) {
                    window.playSFX('stamp-hover', 0.3);
                }
            };

            const resetHandler = () => {
                if (!isHoverEnabled) return;
                stampsTitle.innerHTML = defaultTitle;
            };

            stamp.addEventListener('mouseenter', hoverHandler);
            stamp.addEventListener('mouseleave', resetHandler);
        });

        // Initialize stamp details controller
        const detailsContainer = document.getElementById('stamp-details-container');
        window.stampDetailsController.init(detailsContainer, stampsSection);

        // Add click handlers to stamps to show details
        stampItems.forEach((stamp, index) => {
            stamp.addEventListener('click', () => {
                // Dismiss breathing hint on any stamp click
                if (firstStampWrapper) {
                    stampItems[0].classList.remove('stamp-breathing');
                    firstStampWrapper.classList.add('hint-dismissed');
                }
                // Play click sound effect
                if (window.playSFX) {
                    window.playSFX('stamp-click', 0.7);
                }
                
                window.stampDetailsController.showDetail(index);
            });

            stamp.style.cursor = 'pointer';
        });

        // 4. Entrance animation with Intersection Observer
        let hasAnimated = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    
                    stampsTitle.classList.add('visible');
                    
                    stampItems.forEach((stamp, index) => {
                        setTimeout(() => {
                            stamp.classList.add('visible');
                            if (index === 0 && firstStampWrapper) firstStampWrapper.classList.add('visible');
                        }, 300 + index * 150);
                    });
                    
                    // Enable hover + show swipe indicator + start breathing after animation completes
                    const totalAnimationTime = 300 + (stampItems.length - 1) * 150 + 600;
                    setTimeout(() => {
                        isHoverEnabled = true;
                        if (swipeIndicator) swipeIndicator.classList.add('visible');
                        if (firstStampWrapper && !firstStampWrapper.classList.contains('hint-dismissed')) {
                            stampItems[0].classList.add('stamp-breathing');
                        }
                    }, totalAnimationTime);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(stampsSection);
        
    } catch (error) {
        console.error('Failed to initialize stamps section:', error);
    }
});
