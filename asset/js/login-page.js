(function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.firebaseClient || typeof window.firebaseClient.initAuth !== "function") {
      return;
    }

    var authHelpers = window.firebaseClient.initAuth();
    var googleBtn = document.getElementById("login-with-google");
    var statusEl = document.getElementById("login-status");

    if (!googleBtn) {
      return;
    }

    function setStatus(message, type) {
      if (!statusEl) return;
      statusEl.textContent = message || "";
      statusEl.style.color = type === "error" ? "#c62828" : "#6c757d";
    }

    authHelpers.onAuthStateChanged(function (user) {
      if (user) {
        setStatus(
          "Signed in as " + (user.displayName || user.email || "your Google account") + ". Redirecting…"
        );
        setTimeout(function () {
          window.location.href = "dashboard.html";
        }, 600);
      } else {
        setStatus("");
      }
    });

    googleBtn.addEventListener("click", function () {
      googleBtn.disabled = true;
      setStatus("Opening Google sign-in popup…");

      authHelpers
        .signInWithGoogle()
        .catch(function (err) {
          console.error(err);
          setStatus(err && err.message ? err.message : "Failed to sign in with Google.", "error");
          googleBtn.disabled = false;
        });
    });
  });
})();

