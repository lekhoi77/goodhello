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
    var auth = firebase.auth(app);

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
         * Lưu một "stamp" cá nhân gắn với tài khoản Firebase
         * @returns {Promise}
         */
        addUserStamp: function (host, guestName, message) {
            var user = auth.currentUser;
            if (!user) {
                return Promise.reject(new Error('User must be signed in to add stamp.'));
            }
            return db.collection('user_uploads').add({
                userId: user.uid,
                host: host,
                guestName: guestName,
                message: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                source: 'creator-corner'
            });
        },

        /**
         * Lấy danh sách stamp theo user
         * @returns {Promise<QuerySnapshot>}
         */
        getUserStamps: function (userId, limitCount) {
            return db.collection('user_uploads')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .limit(limitCount || 20)
                .get();
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
        },

        /**
         * Khởi tạo Auth helpers cho frontend (email/password + Google)
         */
        initAuth: function () {
            var googleProvider = new firebase.auth.GoogleAuthProvider();

            return {
                signUpWithEmail: function (email, password) {
                    return auth.createUserWithEmailAndPassword(email, password);
                },
                signInWithEmail: function (email, password) {
                    return auth.signInWithEmailAndPassword(email, password);
                },
                signInWithGoogle: function () {
                    return auth.signInWithPopup(googleProvider);
                },
                signOut: function () {
                    return auth.signOut();
                },
                onAuthStateChanged: function (cb) {
                    return auth.onAuthStateChanged(cb);
                },
                getCurrentUser: function () {
                    return auth.currentUser;
                },
                addUserStamp: function (host, guestName, message) {
                    return window.firebaseClient.addUserStamp(host, guestName, message);
                },
                getUserUploads: function (userId, limitCount) {
                    return window.firebaseClient.getUserStamps(userId, limitCount);
                }
            };
        }
    };
})();
