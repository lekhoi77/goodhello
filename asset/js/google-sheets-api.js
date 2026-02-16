/**
 * Google Sheets API Wrapper
 * Handles all communication with Google Apps Script Web App
 */

(function () {
    var config = window.GOOGLE_SHEETS_CONFIG || {
        webAppUrl: '',
        cacheDuration: 5 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 1000
    };

    var cache = {};

    function delay(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function fetchWithRetry(url, options, retries) {
        retries = retries || 0;
        return fetch(url, options).then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response;
        }).catch(function (error) {
            if (retries < config.maxRetries) {
                return delay(config.retryDelay * (retries + 1)).then(function () {
                    return fetchWithRetry(url, options, retries + 1);
                });
            }
            throw error;
        });
    }

    window.googleSheetsAPI = {
        recordVisit: function (host, guestName) {
            if (!config.webAppUrl || config.webAppUrl.indexOf('YOUR_') === 0) {
                return Promise.resolve({ success: false, error: 'Web App URL not configured' });
            }
            return fetchWithRetry(config.webAppUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'recordVisit',
                    host: host,
                    guestName: guestName,
                    timestamp: new Date().toISOString()
                })
            }).then(function (r) {
                return r.json();
            }).catch(function (err) {
                console.error('recordVisit error:', err);
                return { success: false, error: err.message };
            });
        },

        getWishes: function (host, useCache) {
            if (!config.webAppUrl || config.webAppUrl.indexOf('YOUR_') === 0) {
                return Promise.resolve({ success: true, wishes: [] });
            }
            var cacheKey = 'wishes_' + host;
            if (useCache !== false && cache[cacheKey]) {
                var cached = cache[cacheKey];
                if (Date.now() - cached.timestamp < config.cacheDuration) {
                    return Promise.resolve({ success: true, wishes: cached.data });
                }
            }
            var url = config.webAppUrl + '?action=getWishes&host=' + encodeURIComponent(host);
            return fetchWithRetry(url, { method: 'GET', mode: 'cors' })
                .then(function (r) {
                    return r.json();
                })
                .then(function (data) {
                    if (data.success && data.wishes) {
                        cache[cacheKey] = { timestamp: Date.now(), data: data.wishes };
                        return { success: true, wishes: data.wishes };
                    }
                    return { success: false, wishes: [], error: data.message };
                })
                .catch(function (err) {
                    console.error('getWishes error:', err);
                    if (cache[cacheKey]) {
                        return { success: true, wishes: cache[cacheKey].data };
                    }
                    return { success: false, wishes: [], error: err.message };
                });
        },

        /** Gửi lời chúc (dùng GET để tránh CORS khi chạy từ localhost) */
        addWish: function (host, guestName, message) {
            if (!config.webAppUrl || config.webAppUrl.indexOf('YOUR_') === 0) {
                return Promise.resolve({ success: false, error: 'Web App URL not configured' });
            }
            var msg = (message || '').trim();
            var base = config.webAppUrl.split('?')[0].split('#')[0];
            var url = base +
                '?action=addWish' +
                '&host=' + encodeURIComponent(host) +
                '&guestName=' + encodeURIComponent(guestName || 'Guest') +
                '&message=' + encodeURIComponent(msg);
            console.log('addWish URL (dán vào trình duyệt để test):', url);
            return fetchWithRetry(url, { method: 'GET', mode: 'cors' })
                .then(function (r) {
                    var ct = r.headers.get('Content-Type') || '';
                    if (!ct.includes('application/json')) {
                        return { success: false, error: 'Server không trả về JSON (kiểm tra URL hoặc đăng nhập Google).', message: 'Response not JSON' };
                    }
                    return r.json();
                })
                .then(function (data) {
                    if (data.success && cache['wishes_' + host]) {
                        delete cache['wishes_' + host];
                    }
                    return data;
                })
                .catch(function (err) {
                    console.error('addWish error:', err);
                    return { success: false, error: err.message, message: err.message };
                });
        }
    };
})();
