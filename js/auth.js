// =============================================
// AUTH — Firebase Authentication logic
// =============================================

let currentUser = null;

// ──── Auth state observer ─────────────────────
auth.onAuthStateChanged((user) => {
  currentUser = user;
  updateAuthUI(user);

  if (user) {
    // Sync local cart → Firestore on login
    syncCartToFirestore();
  }
});

// ──── Email / Password Sign-Up ────────────────
async function signUpWithEmail(email, password, displayName) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    // Set display name
    await cred.user.updateProfile({ displayName });
    // Save user profile to Firestore
    await db.collection("users").doc(cred.user.uid).set({
      displayName,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    showToast(`Welcome, ${displayName}! 🎉`, "success");
    return cred.user;
  } catch (err) {
    showToast(firebaseErrorMessage(err), "error");
    throw err;
  }
}

// ──── Email / Password Login ──────────────────
async function loginWithEmail(email, password) {
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    showToast(`Welcome back, ${cred.user.displayName || "User"}! 👋`, "success");
    return cred.user;
  } catch (err) {
    showToast(firebaseErrorMessage(err), "error");
    throw err;
  }
}

// ──── Google Sign-In ──────────────────────────
async function loginWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await auth.signInWithPopup(provider);
    // Save/update user profile
    await db.collection("users").doc(cred.user.uid).set(
      {
        displayName: cred.user.displayName,
        email: cred.user.email,
        photoURL: cred.user.photoURL || null,
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    showToast(`Welcome, ${cred.user.displayName}! 👋`, "success");
    return cred.user;
  } catch (err) {
    showToast(firebaseErrorMessage(err), "error");
    throw err;
  }
}

// ──── Logout ──────────────────────────────────
async function logout() {
  try {
    await auth.signOut();
    showToast("You've been logged out.", "info");
  } catch (err) {
    showToast("Logout failed. Try again.", "error");
  }
}

// ──── Password Reset ──────────────────────────
async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    showToast("Password reset email sent! Check your inbox. 📧", "success");
  } catch (err) {
    showToast(firebaseErrorMessage(err), "error");
    throw err;
  }
}

// ──── Update navbar / auth UI ─────────────────
function updateAuthUI(user) {
  const authLinks = document.querySelectorAll(".auth-links");
  authLinks.forEach((container) => {
    if (user) {
      const name = user.displayName || user.email.split("@")[0];
      const avatar = user.photoURL
        ? `<img src="${user.photoURL}" alt="Avatar" class="user-avatar" referrerpolicy="no-referrer">`
        : `<div class="user-avatar user-avatar-initial">${name.charAt(0).toUpperCase()}</div>`;
      container.innerHTML = `
        <div class="user-menu">
          ${avatar}
          <span class="user-name">${name}</span>
          <button class="btn btn-sm btn-secondary btn-logout" onclick="logout()">Logout</button>
        </div>`;
    } else {
      container.innerHTML = `
        <a href="login.html" class="btn btn-sm btn-secondary">Login</a>
        <a href="signup.html" class="btn btn-sm btn-primary">Sign Up</a>`;
    }
  });
}

// ──── Friendly error messages ─────────────────
function firebaseErrorMessage(err) {
  const map = {
    "auth/email-already-in-use": "This email is already registered. Try logging in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential": "Invalid credentials. Please check your email and password.",
  };
  return map[err.code] || err.message || "An unexpected error occurred.";
}
