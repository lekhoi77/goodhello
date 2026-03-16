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
    // Mỗi blob sẽ đi đến các điểm ngẫu nhiên trong viewport, lặp mãi mãi.
    function randomPos(blobEl) {
        const bw = blobEl.offsetWidth  || 400;
        const bh = blobEl.offsetHeight || 400;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Cho phép tràn ra ngoài 1 chút (30%) để trông tự nhiên hơn
        const margin = 0.3;
        return {
            x: (Math.random() * (1 + margin * 2) - margin) * vw - bw * 0.4,
            y: (Math.random() * (1 + margin * 2) - margin) * vh - bh * 0.4,
        };
    }

    function driftBlob(el, minDur, maxDur) {
        if (!el) return;
        const { x, y } = randomPos(el);
        const dur = minDur + Math.random() * (maxDur - minDur);
        gsap.to(el, {
            x, y,
            rotation: (Math.random() - 0.5) * 30,
            duration: dur,
            ease: 'sine.inOut',
            onComplete: () => driftBlob(el, minDur, maxDur)
        });
    }

    // Off-screen start positions (trái, phải, dưới)
    if (blob1) gsap.set(blob1, { x: -700,  y: -200, opacity: 0 });
    if (blob2) gsap.set(blob2, { x: window.innerWidth + 400, y: -100, opacity: 0 });
    if (blob3) gsap.set(blob3, { x: -300,  y: window.innerHeight + 400, opacity: 0 });

    function startHeroAnimation() {
        const mainTimeline = gsap.timeline({
            defaults: { ease: 'power2.out' },
            delay: 0.3
        });

        // Slide blobs in từ ngoài màn hình, stagger nhau, rồi bắt đầu drift liên tục
        const blobEase = 'power3.out';
        if (blob1) {
            const p1 = randomPos(blob1);
            gsap.to(blob1, {
                x: p1.x, y: p1.y, opacity: 0.85, duration: 2.0, ease: blobEase, delay: 0.2,
                onComplete: () => driftBlob(blob1, 8, 14)
            });
        }
        if (blob2) {
            const p2 = randomPos(blob2);
            gsap.to(blob2, {
                x: p2.x, y: p2.y, opacity: 0.75, duration: 2.4, ease: blobEase, delay: 0.6,
                onComplete: () => driftBlob(blob2, 10, 16)
            });
        }
        if (blob3) {
            const p3 = randomPos(blob3);
            gsap.to(blob3, {
                x: p3.x, y: p3.y, opacity: 0.70, duration: 2.2, ease: blobEase, delay: 1.0,
                onComplete: () => driftBlob(blob3, 9, 15)
            });
        }

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

