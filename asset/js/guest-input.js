/**
 * Guest Input Overlay - capture guest name and record visit to Google Sheet
 */
(function () {
    function getHost() {
        if (window.userLoader && window.userLoader.currentUser) {
            return window.userLoader.currentUser;
        }
        if (window.userLoader && window.userLoader.detectUser) {
            return window.userLoader.detectUser();
        }
        var hostname = window.location.hostname;
        var params = new URLSearchParams(window.location.search);
        if (params.get('user')) return params.get('user');
        if (hostname === 'localhost' || hostname === '127.0.0.1') return 'phatla';
        var parts = hostname.split('.');
        return parts.length >= 2 ? parts[0] : 'phatla';
    }

    function getStoredGuestName(host) {
        try {
            return localStorage.getItem('guest_name_' + host);
        } catch (e) {
            return null;
        }
    }

    function setStoredGuestName(host, name) {
        try {
            localStorage.setItem('guest_name_' + host, name);
        } catch (e) {}
    }

    function updateInvitationName(name) {
        var el = document.getElementById('guest-name');
        if (el) el.textContent = name;
    }

    function validateName(name) {
        var t = (name || '').trim();
        if (!t) return { ok: false, error: 'Please enter your name' };
        if (t.length < 2) return { ok: false, error: 'Name must be at least 2 characters' };
        if (t.length > 50) return { ok: false, error: 'Name is too long' };
        return { ok: true, name: t };
    }

    function showOverlay() {
        var host = getHost();
        if (getStoredGuestName(host)) {
            updateInvitationName(getStoredGuestName(host));
            return;
        }

        document.body.style.overflow = 'hidden';

        var overlay = document.createElement('div');
        overlay.className = 'guest-overlay active';
        overlay.id = 'guest-overlay';
        overlay.innerHTML =
            '<div class="guest-modal">' +
            '<div class="guest-modal-content">' +
            '<h2 class="heading-2">Before you enter...</h2>' +
            '<p class="body-lg">May I know your name?</p>' +
            '<div class="guest-input-group">' +
            '<input type="text" id="guest-name-input" class="guest-input" placeholder="Your name" maxlength="50" autocomplete="name" />' +
            '<div class="guest-error" id="guest-error"></div>' +
            '</div>' +
            '<button type="button" class="guest-submit-btn" id="guest-submit-btn">Enter</button>' +
            '</div>' +
            '</div>';
        document.body.appendChild(overlay);

        var input = document.getElementById('guest-name-input');
        var errorEl = document.getElementById('guest-error');
        var btn = document.getElementById('guest-submit-btn');

        function hideOverlay() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 300);
        }

        function showError(msg) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
            input.classList.add('error');
        }
        function clearError() {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
            input.classList.remove('error');
        }

        btn.addEventListener('click', submit);
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') submit();
        });
        input.addEventListener('input', clearError);
        setTimeout(function () {
            input.focus();
        }, 200);

        function submit() {
            var v = validateName(input.value);
            if (!v.ok) {
                showError(v.error);
                return;
            }
            clearError();
            btn.disabled = true;
            input.disabled = true;
            btn.textContent = '...';

            var doneCalled = false;
            function done() {
                if (doneCalled) return;
                doneCalled = true;
                setStoredGuestName(host, v.name);
                updateInvitationName(v.name);
                hideOverlay();
                btn.disabled = false;
                input.disabled = false;
                btn.textContent = 'Enter';
            }

            // Timeout: đóng overlay sau 6 giây dù API chưa xong (tránh treo)
            var timeoutId = setTimeout(done, 6000);

            var api = window.googleSheetsAPI;
            var promise = api && api.recordVisit ? api.recordVisit(host, v.name) : Promise.resolve({ success: false });

            promise.then(function (res) {
                clearTimeout(timeoutId);
                done();
            }).catch(function () {
                clearTimeout(timeoutId);
                done();
            });
        }
    }

    function init() {
        var host = getHost();
        var name = getStoredGuestName(host);
        if (name) {
            updateInvitationName(name);
            return;
        }
        if (window.userLoader && typeof window.userLoader.init === 'function') {
            window.userLoader.init().then(function () {
                showOverlay();
            }).catch(function () {
                showOverlay();
            });
        } else {
            showOverlay();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
