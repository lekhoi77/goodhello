/**
 * Core initialization: Lenis smooth scroll, shared helpers, nav + footer behavior
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

// Dùng GSAP ticker thay manual RAF để Lenis và ScrollTrigger đồng bộ cùng 1 clock
gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // GSAP time = giây, Lenis raf = milliseconds
});
gsap.ticker.lagSmoothing(0);

// Báo ScrollTrigger cập nhật khi Lenis scroll (nếu ScrollTrigger được load)
lenis.on('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
    }
});

/** Strip Vietnamese diacritics so font displays correctly (shared for name + wish inputs) */
function stripVietnameseDiacritics(str) {
    if (!str) return str;
    var map = { 'à':'a','á':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ằ':'a','ắ':'a','ẳ':'a','ẵ':'a','ặ':'a','â':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a','À':'A','Á':'A','Ả':'A','Ã':'A','Ạ':'A','Ă':'A','Ằ':'A','Ắ':'A','Ẳ':'A','Ẵ':'A','Ặ':'A','Â':'A','Ầ':'A','Ấ':'A','Ẩ':'A','Ẫ':'A','Ậ':'E','è':'e','é':'e','ẻ':'e','ẽ':'e','ẹ':'e','ê':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e','È':'E','É':'E','Ẻ':'E','Ẽ':'E','Ẹ':'E','Ê':'E','Ề':'E','Ế':'E','Ể':'E','Ễ':'E','Ệ':'E','ì':'i','í':'i','ỉ':'i','ĩ':'i','ị':'i','Ì':'I','Í':'I','Ỉ':'I','Ĩ':'I','Ị':'I','ò':'o','ó':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ồ':'o','ố':'o','ổ':'o','ỗ':'o','ộ':'o','ơ':'o','ờ':'o','ớ':'o','ở':'o','ỡ':'o','ợ':'o','Ò':'O','Ó':'O','Ỏ':'O','Õ':'O','Ọ':'O','Ô':'O','Ồ':'O','Ố':'O','Ổ':'O','Ỗ':'O','Ộ':'O','Ơ':'O','Ờ':'O','Ớ':'O','Ở':'O','Ỡ':'O','Ợ':'O','ù':'u','ú':'u','ủ':'u','ũ':'u','ụ':'u','ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u','Ù':'U','Ú':'U','Ủ':'U','Ũ':'U','Ụ':'U','Ư':'U','Ừ':'U','Ứ':'U','Ử':'U','Ữ':'U','Ự':'U','ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y','Ỳ':'Y','Ý':'Y','Ỷ':'Y','Ỹ':'Y','Ỵ':'Y','đ':'d','Đ':'D' };
    return String(str).replace(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/g, function (c) { return map[c] || c; });
}
window.stripVietnameseDiacritics = stripVietnameseDiacritics;

// =============================================
// NAV HIDE/SHOW ON SCROLL
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const invitationLink = nav ? nav.querySelector('.invitation-link') : null;
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
            
            // Play button click sound
            if (window.playSFX) {
                window.playSFX('button-click', 0.5);
            }
            
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
// FOOTER TITLE → SCROLL TO INVITATION SECTION
// =============================================
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

