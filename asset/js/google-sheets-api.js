/**
 * Google Sheets / Firebase API Wrapper
 *
 * Interface không đổi: window.googleSheetsAPI.{recordVisit, getWishes, addWish}
 *
 * Khi USE_FIREBASE = true  → gọi Firestore qua window.firebaseClient
 * Khi USE_FIREBASE = false → gọi Google Apps Script như cũ (rollback)
 */

(function () {
    var config = window.GOOGLE_SHEETS_CONFIG || {
        USE_FIREBASE: false,
        webAppUrl: '',
        cacheDuration: 5 * 60 * 1000,
        maxRetries: 3,
        retryDelay: 1000
    };

    // =============================================
    // CACHE HELPERS (localStorage + RAM)
    // =============================================
    var ramCache = {};

    var LS_PREFIX = 'wishes_cache_';
    var LS_TTL = config.cacheDuration || 5 * 60 * 1000; // 5 phút

    function lsGet(host) {
        try {
            var raw = localStorage.getItem(LS_PREFIX + host);
            if (!raw) return null;
            var obj = JSON.parse(raw);
            if (Date.now() - obj.ts > LS_TTL) { localStorage.removeItem(LS_PREFIX + host); return null; }
            return obj.data;
        } catch (e) { return null; }
    }

    function lsSet(host, data) {
        try {
            localStorage.setItem(LS_PREFIX + host, JSON.stringify({ ts: Date.now(), data: data }));
        } catch (e) {}
    }

    function lsClear(host) {
        try { localStorage.removeItem(LS_PREFIX + host); } catch (e) {}
    }

    // =============================================
    // LEGACY APPS SCRIPT HELPERS (cho fallback)
    // =============================================
    function delay(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function fetchWithRetry(url, options, retries) {
        retries = retries || 0;
        return fetch(url, options).then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
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

    // =============================================
    // FIREBASE IMPLEMENTATION
    // =============================================
    var firebaseImpl = {
        recordVisit: function (host, guestName) {
            var fc = window.firebaseClient;
            if (!fc) return Promise.resolve({ success: false, error: 'firebaseClient not ready' });
            return fc.recordVisit(host, guestName)
                .then(function () { return { success: true }; })
                .catch(function (err) {
                    console.warn('[firebase] recordVisit error:', err);
                    return { success: false, error: err.message };
                });
        },

        getWishes: function (host, useCache, onCacheHit) {
            var fc = window.firebaseClient;

            // Đọc localStorage cache trước để render ngay
            var cached = lsGet(host);
            if (useCache !== false && cached) {
                // Trả về cache ngay lập tức, đồng thời fetch mới ở background
                if (typeof onCacheHit === 'function') onCacheHit(cached);
                if (!fc) return Promise.resolve({ success: true, wishes: cached });

                // Background refresh
                fc.getWishes(host).then(function (fresh) {
                    var freshNorm = fresh.map(normalizeWish);
                    lsSet(host, freshNorm);
                    ramCache['wishes_' + host] = { ts: Date.now(), data: freshNorm };
                }).catch(function () {});

                return Promise.resolve({ success: true, wishes: cached });
            }

            // RAM cache (session)
            var ramKey = 'wishes_' + host;
            if (useCache !== false && ramCache[ramKey] && (Date.now() - ramCache[ramKey].ts < LS_TTL)) {
                return Promise.resolve({ success: true, wishes: ramCache[ramKey].data });
            }

            if (!fc) return Promise.resolve({ success: true, wishes: [] });

            return fc.getWishes(host)
                .then(function (docs) {
                    var wishes = docs.map(normalizeWish);
                    lsSet(host, wishes);
                    ramCache[ramKey] = { ts: Date.now(), data: wishes };
                    return { success: true, wishes: wishes };
                })
                .catch(function (err) {
                    console.warn('[firebase] getWishes error:', err);
                    var fallback = lsGet(host) || [];
                    return { success: true, wishes: fallback };
                });
        },

        addWish: function (host, guestName, message) {
            var fc = window.firebaseClient;
            if (!fc) return Promise.resolve({ success: false, error: 'firebaseClient not ready' });
            var msg = (message || '').trim();
            return fc.addWish(host, guestName, msg)
                .then(function () {
                    lsClear(host);
                    delete ramCache['wishes_' + host];

                    // Dual-write: ghi sang Google Sheets ở background để admin xem
                    if (config.webAppUrl && config.webAppUrl.indexOf('YOUR_') !== 0) {
                        var base = config.webAppUrl.split('?')[0].split('#')[0];
                        var sheetUrl = base +
                            '?action=addWish' +
                            '&host='      + encodeURIComponent(host) +
                            '&guestName=' + encodeURIComponent(guestName || 'Guest') +
                            '&message='   + encodeURIComponent(msg);
                        fetch(sheetUrl, { method: 'GET', mode: 'cors' }).catch(function (e) {
                            console.warn('[dual-write] Sheets sync failed (non-critical):', e.message);
                        });
                    }

                    return { success: true };
                })
                .catch(function (err) {
                    console.error('[firebase] addWish error:', err);
                    return { success: false, error: err.message, message: err.message };
                });
        }
    };

    // Chuẩn hóa document từ Firestore → đúng shape mà wishes-section.js cần
    function normalizeWish(doc) {
        return { message: doc.message || '', guestName: doc.guestName || '' };
    }

    // =============================================
    // LEGACY APPS SCRIPT IMPLEMENTATION
    // =============================================
    var legacyImpl = {
        recordVisit: function (host, guestName) {
            if (!config.webAppUrl || config.webAppUrl.indexOf('YOUR_') === 0) {
                return Promise.resolve({ success: false, error: 'Web App URL not configured' });
            }
            return fetchWithRetry(config.webAppUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'recordVisit', host: host, guestName: guestName, timestamp: new Date().toISOString() })
            }).then(function (r) { return r.json(); })
              .catch(function (err) { console.error('recordVisit error:', err); return { success: false, error: err.message }; });
        },

        getWishes: function (host, useCache) {
            if (!config.webAppUrl || config.webAppUrl.indexOf('YOUR_') === 0) {
                return Promise.resolve({ success: true, wishes: [] });
            }
            var cacheKey = 'wishes_' + host;
            if (useCache !== false && ramCache[cacheKey]) {
                var cached = ramCache[cacheKey];
                if (Date.now() - cached.timestamp < config.cacheDuration) {
                    return Promise.resolve({ success: true, wishes: cached.data });
                }
            }
            var url = config.webAppUrl + '?action=getWishes&host=' + encodeURIComponent(host);
            return fetchWithRetry(url, { method: 'GET', mode: 'cors' })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success && data.wishes) {
                        ramCache[cacheKey] = { timestamp: Date.now(), data: data.wishes };
                        return { success: true, wishes: data.wishes };
                    }
                    return { success: false, wishes: [], error: data.message };
                })
                .catch(function (err) {
                    console.error('getWishes error:', err);
                    if (ramCache[cacheKey]) return { success: true, wishes: ramCache[cacheKey].data };
                    return { success: false, wishes: [], error: err.message };
                });
        },

        addWish: function (host, guestName, message) {
            if (!config.webAppUrl || config.webAppUrl.indexOf('YOUR_') === 0) {
                return Promise.resolve({ success: false, error: 'Web App URL not configured' });
            }
            var msg = (message || '').trim();
            var base = config.webAppUrl.split('?')[0].split('#')[0];
            var url = base + '?action=addWish' + '&host=' + encodeURIComponent(host) + '&guestName=' + encodeURIComponent(guestName || 'Guest') + '&message=' + encodeURIComponent(msg);
            return fetchWithRetry(url, { method: 'GET', mode: 'cors' })
                .then(function (r) {
                    var ct = r.headers.get('Content-Type') || '';
                    if (!ct.includes('application/json')) return { success: false, error: 'Server không trả về JSON' };
                    return r.json();
                })
                .then(function (data) {
                    if (data.success) delete ramCache['wishes_' + host];
                    return data;
                })
                .catch(function (err) {
                    console.error('addWish error:', err);
                    return { success: false, error: err.message, message: err.message };
                });
        }
    };

    // =============================================
    // EXPORT — chọn impl theo flag
    // =============================================
    var impl = config.USE_FIREBASE ? firebaseImpl : legacyImpl;

    window.googleSheetsAPI = {
        recordVisit: function (host, guestName) {
            return impl.recordVisit(host, guestName);
        },
        getWishes: function (host, useCache, onCacheHit) {
            return impl.getWishes(host, useCache, onCacheHit);
        },
        addWish: function (host, guestName, message) {
            return impl.addWish(host, guestName, message);
        }
    };
})();
