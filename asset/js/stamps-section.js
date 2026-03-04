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

        // Mobile: wrapper tall + position sticky + lenis scroll → translateX ngang
        // Không dùng GSAP pin, section ở đúng vị trí tự nhiên trong viewport
        function initMobileLayout() {
            if (window.innerWidth > 768) return;

            // Đo scrollWidth khi overflow-x còn là auto (trước khi st-mode đổi thành visible)
            const scrollDistance = stampsGrid.scrollWidth - window.innerWidth;
            if (scrollDistance <= 0) return;

            // Kích hoạt layout st-mode (overflow: hidden, gap, v.v.)
            stampsSection.classList.add('st-mode');

            requestAnimationFrame(() => {
                const sectionHeight = stampsSection.offsetHeight;
                const viewportHeight = window.innerHeight;

                // Khoảng cách để section nằm chính giữa viewport theo chiều dọc
                const topOffset = Math.max(0, Math.round((viewportHeight - sectionHeight) / 2));

                // Wrapper: padding-top = topOffset để section BẮT ĐẦU đúng ở giữa khi vào viewport
                // Height = scrollDistance + sectionHeight + topOffset*2 để sticky hoạt động suốt
                const wrapper = document.createElement('div');
                wrapper.style.cssText = [
                    `height: ${scrollDistance + sectionHeight + topOffset * 2}px`,
                    `position: relative`,
                    `padding-top: ${topOffset}px`
                ].join('; ') + ';';
                stampsSection.parentNode.insertBefore(wrapper, stampsSection);
                wrapper.appendChild(stampsSection);

                // Section sticky ở đúng topOffset — trùng với vị trí ban đầu → giữ nguyên suốt
                stampsSection.style.position = 'sticky';
                stampsSection.style.top = `${topOffset}px`;

                // Vị trí tuyệt đối của wrapper trong document tại thời điểm init
                const wrapperTop = wrapper.getBoundingClientRect().top
                    + (window.lenis ? window.lenis.scroll : window.scrollY);

                // Init title với stamp đầu tiên
                if (stampItems[0]) {
                    stampsTitle.innerHTML = formatTitle(stampItems[0].dataset.title || defaultTitle);
                }

                // Drive translateX theo scroll progress trong wrapper
                let currentTitleIdx = 0;
                if (window.lenis) {
                    window.lenis.on('scroll', (l) => {
                        const progress = Math.max(0, Math.min(1,
                            (l.scroll - wrapperTop) / scrollDistance
                        ));
                        stampsGrid.style.transform = `translateX(${-progress * scrollDistance}px)`;

                        const idx = Math.min(
                            Math.round(progress * (stampItems.length - 1)),
                            stampItems.length - 1
                        );
                        if (idx !== currentTitleIdx && stampItems[idx]) {
                            currentTitleIdx = idx;
                            stampsTitle.innerHTML = formatTitle(stampItems[idx].dataset.title || defaultTitle);
                        }
                    });
                }
            });
        }
        
        stampItems.forEach(stamp => {
            const hoverHandler = () => {
                if (!isHoverEnabled) return;
                const rawTitle = stamp.dataset.title || defaultTitle;
                stampsTitle.innerHTML = formatTitle(rawTitle);
            };

            const resetHandler = () => {
                if (!isHoverEnabled) return;
                stampsTitle.innerHTML = defaultTitle;
            };

            stamp.addEventListener('mouseenter', hoverHandler);
            stamp.addEventListener('mouseleave', resetHandler);

            // Mobile: tap is handled by scroll-snap, không cần thay title thủ công
            stamp.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
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
                        initMobileLayout(); // khởi tạo scroll-title sync cho mobile
                    }, totalAnimationTime);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(stampsSection);
        
    } catch (error) {
        console.error('Failed to initialize stamps section:', error);
    }
});

