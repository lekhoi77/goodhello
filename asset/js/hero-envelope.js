// =============================================
// ENVELOPE ANIMATION (starts after guest name is entered)
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    const letterGroup = document.querySelector('#letter');
    const flap = document.querySelector('#flap');
    const nav = document.querySelector('nav');

    // Gradient blobs
    const blob1 = document.querySelector('.gradient-blob--1');
    const blob2 = document.querySelector('.gradient-blob--2');
    const blob3 = document.querySelector('.gradient-blob--3');

    gsap.set(letterGroup, { y: 350 });

    // ---- Blob drift logic ----
    // Drift đến 1 điểm ngẫu nhiên trong viewport (±25% ngoài cạnh cho tự nhiên)
    function randomPos() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = 0.25;
        return {
            x: (Math.random() * (1 + margin * 2) - margin) * vw,
            y: (Math.random() * (1 + margin * 2) - margin) * vh,
        };
    }

    function driftBlob(el, minDur, maxDur) {
        if (!el) return;
        const { x, y } = randomPos();
        const dur = minDur + Math.random() * (maxDur - minDur);
        gsap.to(el, {
            x, y,
            rotation: (Math.random() - 0.5) * 25,
            duration: dur,
            ease: 'sine.inOut',
            onComplete: () => driftBlob(el, minDur, maxDur)
        });
    }

    // KHÔNG dùng gsap.set() — CSS đã đặt blob off-screen từ lần paint đầu.
    // GSAP sẽ đọc giá trị CSS transform làm điểm xuất phát tự động.

    // Landing zones cố định (không random) để slide-in luôn mượt,
    // không phụ thuộc vào offsetWidth/Height khi ảnh chưa load xong.
    function getLandingZones() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        return [
            { x: vw * 0.03,  y: vh * 0.04  },   // blob1: góc trên-trái
            { x: vw * 0.50,  y: vh * -0.08 },   // blob2: trên-giữa phải
            { x: vw * -0.10, y: vh * 0.48  },   // blob3: giữa-trái
        ];
    }

    function startHeroAnimation() {
        const mainTimeline = gsap.timeline({
            defaults: { ease: 'power2.out' },
            delay: 0.3
        });

        // Slide blobs vào từ vị trí off-screen CSS → landing zone cố định
        const blobEase  = 'power3.out';
        const zones     = getLandingZones();
        const configs   = [
            { el: blob1, opacity: 0.85, duration: 2.0, delay: 0.2,  drift: [8,  14] },
            { el: blob2, opacity: 0.75, duration: 2.4, delay: 0.55, drift: [10, 16] },
            { el: blob3, opacity: 0.70, duration: 2.1, delay: 0.9,  drift: [9,  15] },
        ];

        configs.forEach(({ el, opacity, duration, delay, drift }, i) => {
            if (!el) return;
            gsap.to(el, {
                x: zones[i].x,
                y: zones[i].y,
                opacity,
                duration,
                ease: blobEase,
                delay,
                onComplete: () => driftBlob(el, drift[0], drift[1])
            });
        });

        mainTimeline.to(envelopeWrapper, {
            y: '-40%',
            duration: 1.5,
            ease: 'power3.out',
            onStart: () => {
                // Play envelope lift sound effect
                if (window.playSFX) {
                    window.playSFX('envelope-open', 0.8);
                }
            }
        });

        mainTimeline.to(flap, {
            rotateX: -160,
            duration: 0.6,
            ease: 'power2.inOut',
            onStart: () => {
                // Play flap opening sound effect  
                if (window.playSFX) {
                    window.playSFX('stamp-click', 0.6);
                }
            }
        }, '+=0.1');

        mainTimeline.to(letterGroup, {
            y: -20,
            duration: 1,
            ease: 'power3.out',
            onStart: () => {
                // Play letter sliding sound effect
                if (window.playSFX) {
                    window.playSFX('wish-drop', 0.5);
                }
            }
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

            // Show scroll indicator on mobile, hide when user starts scrolling
            const indicator = document.getElementById('scroll-indicator');
            if (indicator && window.innerWidth <= 768) {
                indicator.classList.add('visible');
                const hideIndicator = () => {
                    indicator.classList.remove('visible');
                    if (window.lenis) window.lenis.off('scroll', hideIndicator);
                };
                if (window.lenis) {
                    window.lenis.on('scroll', hideIndicator);
                } else {
                    window.addEventListener('scroll', hideIndicator, { once: true, passive: true });
                }
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

