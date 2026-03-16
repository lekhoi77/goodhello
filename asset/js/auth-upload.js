/**
 * Simple Firebase Auth + per-user "stamp" uploads
 */
(function () {
  if (!window.firebaseClient || !window.firebaseClient.initAuth) {
    return;
  }

  var authApi = window.firebaseClient.initAuth();

  function $(id) {
    return document.getElementById(id);
  }

  function formatDate(ts) {
    if (!ts) return '';
    try {
      var d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString();
    } catch (e) {
      return '';
    }
  }

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

  function getGuestNameForHost(host) {
    try {
      return localStorage.getItem('guest_name_' + host) || null;
    } catch (e) {
      return null;
    }
  }

  function renderUploads(listEl, items) {
    listEl.innerHTML = '';
    if (!items || !items.length) {
      var empty = document.createElement('div');
      empty.className = 'user-upload-empty';
      empty.textContent = 'You have no personal stamps yet. Save your first one to see it here.';
      listEl.appendChild(empty);
      return;
    }

    items.forEach(function (doc) {
      var data = doc.data ? doc.data() : doc;
      var el = document.createElement('div');
      el.className = 'user-upload-item';

      var header = document.createElement('div');
      header.className = 'user-upload-item-header';
      header.innerHTML =
        '<span>' +
        (data.host || '-') +
        '</span><span>' +
        (formatDate(data.createdAt) || '') +
        '</span>';

      var body = document.createElement('div');
      body.textContent = data.message || '';

      el.appendChild(header);
      el.appendChild(body);
      listEl.appendChild(el);
    });
  }

  function initUi() {
    var section = $('user-upload-section');
    if (!section) return;

    var authBlock = $('user-auth-block');
    var signedInBlock = $('user-signedin-block');
    var authStatus = $('auth-status');
    var signedInInfo = $('signedin-info');
    var emailInput = $('auth-email');
    var passwordInput = $('auth-password');
    var uploadTextarea = $('user-upload-message');
    var uploadList = $('user-upload-list');

    function setAuthStatus(msg, type) {
      authStatus.textContent = msg || '';
      authStatus.classList.remove('error', 'success');
      if (type) authStatus.classList.add(type);
    }

    function setSignedIn(user) {
      if (user) {
        authBlock.style.display = 'none';
        signedInBlock.style.display = 'block';
        signedInInfo.textContent =
          'Đã đăng nhập với ' + (user.email || 'Google account') + ' (uid: ' + user.uid + ')';
        loadUploads(user);
      } else {
        authBlock.style.display = 'block';
        signedInBlock.style.display = 'none';
        uploadList.innerHTML =
          '<div class="user-upload-empty">You have no personal stamps yet. Save your first one to see it here.</div>';
      }
    }

    function loadUploads(user) {
      if (!user || !authApi.getUserUploads) return;
      authApi
        .getUserUploads(user.uid)
        .then(function (docs) {
          renderUploads(uploadList, docs);
        })
        .catch(function (err) {
          console.warn('load uploads error', err);
        });
    }

    $('btn-signup-email').addEventListener('click', function () {
      var email = (emailInput.value || '').trim();
      var pass = passwordInput.value || '';
      if (!email || !pass) {
        setAuthStatus('Please enter email and password first.', 'error');
        return;
      }
      setAuthStatus('Creating account...', null);
      authApi
        .signUpWithEmail(email, pass)
        .then(function () {
          setAuthStatus('Account created. You are now signed in.', 'success');
        })
        .catch(function (err) {
          console.error(err);
          setAuthStatus(err.message || 'Could not create account.', 'error');
        });
    });

    $('btn-signin-email').addEventListener('click', function () {
      var email = (emailInput.value || '').trim();
      var pass = passwordInput.value || '';
      if (!email || !pass) {
        setAuthStatus('Please enter email and password to sign in.', 'error');
        return;
      }
      setAuthStatus('Signing in...', null);
      authApi
        .signInWithEmail(email, pass)
        .then(function () {
          setAuthStatus('Signed in successfully.', 'success');
        })
        .catch(function (err) {
          console.error(err);
          setAuthStatus(err.message || 'Could not sign in.', 'error');
        });
    });

    $('btn-signin-google').addEventListener('click', function () {
      setAuthStatus('Opening Google sign-in window...', null);
      authApi
        .signInWithGoogle()
        .then(function () {
          setAuthStatus('Signed in with Google.', 'success');
        })
        .catch(function (err) {
          console.error(err);
          setAuthStatus(err.message || 'Could not sign in with Google.', 'error');
        });
    });

    $('btn-signout').addEventListener('click', function () {
      authApi
        .signOut()
        .then(function () {
          setAuthStatus('Signed out.', 'success');
        })
        .catch(function (err) {
          console.error(err);
          setAuthStatus(err.message || 'Could not sign out.', 'error');
        });
    });

    $('btn-submit-upload').addEventListener('click', function () {
      var user = authApi.getCurrentUser && authApi.getCurrentUser();
      if (!user) {
        setAuthStatus('You need to sign in before saving a stamp.', 'error');
        return;
      }
      var message = (uploadTextarea.value || '').trim();
      if (!message) {
        setAuthStatus('Please write something before saving.', 'error');
        return;
      }

      var host = getHost();
      var guestName = getGuestNameForHost(host) || 'Guest';

      authApi
        .addUserStamp(host, guestName, message)
        .then(function () {
          uploadTextarea.value = '';
          setAuthStatus('Your stamp has been saved.', 'success');
          loadUploads(user);
        })
        .catch(function (err) {
          console.error(err);
          setAuthStatus(err.message || 'Could not save stamp.', 'error');
        });
    });

    authApi.onAuthStateChanged(function (user) {
      setSignedIn(user);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUi);
  } else {
    initUi();
  }
})();

