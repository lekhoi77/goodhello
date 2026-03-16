/**
 * Firebase Client
 *
 * SETUP: Sau khi tạo Firebase project trên console.firebase.google.com,
 * dán firebaseConfig của bạn vào object FIREBASE_CONFIG bên dưới.
 *
 * Hướng dẫn lấy config:
 *   Project settings (bánh răng) → Your apps → Web app → firebaseConfig
 */

(function () {
    var FIREBASE_CONFIG = {
        apiKey:            'AIzaSyARbP8L1JlrPeS2rOt8S9tvAb9c7AQVQNU',
        authDomain:        'lamdi-bb1b5.firebaseapp.com',
        projectId:         'lamdi-bb1b5',
        storageBucket:     'lamdi-bb1b5.firebasestorage.app',
        messagingSenderId: '625477205650',
        appId:             '1:625477205650:web:24fc184cc00090ccc8b04b',
        measurementId:     'G-G4FVXMZF0X'
    };

    var app;
    try {
        app = firebase.initializeApp(FIREBASE_CONFIG);
    } catch (e) {
        // Firebase SDK có thể đã được khởi tạo (hot-reload)
        app = firebase.app();
    }

    var db = firebase.firestore(app);

    window.firebaseClient = {
        /**
         * Thêm lời chúc mới vào Firestore
         * @returns {Promise}
         */
        addWish: function (host, guestName, message) {
            return db.collection('wishes').add({
                host: host,
                guestName: guestName,
                message: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        },

        /**
         * Lấy danh sách wishes theo host, sắp xếp từ cũ → mới
         * @returns {Promise<Array<{host, guestName, message, createdAt}>>}
         */
        getWishes: function (host, limitCount) {
            return db.collection('wishes')
                .where('host', '==', host)
                .orderBy('createdAt', 'asc')
                .limit(limitCount || 100)
                .get()
                .then(function (snap) {
                    return snap.docs.map(function (d) { return d.data(); });
                });
        },

        /**
         * Ghi lại lượt ghé thăm (fire-and-forget từ phía gọi)
         * @returns {Promise}
         */
        recordVisit: function (host, guestName) {
            return db.collection('visits').add({
                host: host,
                guestName: guestName,
                visitedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    };
})();
