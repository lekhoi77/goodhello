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

    // Update displayed event time per user if specified
    const userData = window.userLoader && window.userLoader.userData ? window.userLoader.userData : {};
    const eventData = userData.event || {};
    if (eventData.displayTime) {
        const dateTimeEl = document.querySelector('.detail-value');
        if (dateTimeEl) dateTimeEl.textContent = eventData.displayTime;
    }

    // =============================================
    // 1. DISPLAY FAVORITE STAMP
    // =============================================
    const PLACEHOLDER_STAMP_SRC = 'asset/stamp/placeholderstamp.png';

    function scrollToStampsSection() {
        const stampsSection = document.querySelector('.stamps-section');
        if (!stampsSection) return;
        if (window.lenis) {
            window.lenis.scrollTo(stampsSection, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 3) });
        } else {
            stampsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function showPlaceholderStamp() {
        if (invitationStamp) {
            invitationStamp.innerHTML = `<img src="${PLACEHOLDER_STAMP_SRC}" alt="Place your stamp here" style="cursor:pointer;" />`;
            invitationStamp.style.cursor = 'pointer';
            invitationStamp.onclick = scrollToStampsSection;
        }
    }

    function displayFavoriteStamp() {
        if (!window.userLoader) {
            console.error('User loader not initialized');
            showPlaceholderStamp();
            return;
        }

        const favoriteIndex = window.userLoader.getFavoriteStamp();

        if (favoriteIndex === null) {
            showPlaceholderStamp();
            return;
        }

        const userData = window.userLoader.userData;

        if (!userData || !userData.stamps) {
            console.error('No user stamp data available');
            showPlaceholderStamp();
            return;
        }

        const stampIndex = parseInt(favoriteIndex);
        const stamp = userData.stamps[stampIndex];

        if (stamp && invitationStamp) {
            invitationStamp.innerHTML = `
                <img src="${stamp.src}" alt="${stamp.alt}" />
            `;
            invitationStamp.style.cursor = '';
            invitationStamp.onclick = null;
        } else {
            showPlaceholderStamp();
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
            
            // Date/time loaded per-user from users-data.json event.start / event.end
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
                    
                    // Play gentle sound when invitation appears
                    if (window.playSFX) {
                        window.playSFX('notification', 0.4);
                    }
                }
            }
        });
    }, { threshold: 0.2 });

    if (invitationSection) {
        observer.observe(invitationSection);
    }
});

