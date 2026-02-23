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

