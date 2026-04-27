// =============================================
// FIRESTORE — cloud data layer
// =============================================

// ──── PRODUCTS ────────────────────────────────

/**
 * Load all products from Firestore.
 * Falls back to the local PRODUCTS array if Firestore is empty or fails.
 */
async function loadProductsFromFirestore() {
  try {
    const snap = await db.collection("products").orderBy("id").get();
    if (!snap.empty) {
      PRODUCTS.length = 0; // clear local array
      snap.forEach((doc) => PRODUCTS.push({ firestoreId: doc.id, ...doc.data() }));
    }
  } catch (err) {
    console.warn("Firestore products load failed — using local data.", err);
  }
}

/**
 * Seed the Firestore "products" collection from the local PRODUCTS array.
 * Useful to run once from the browser console: seedProducts()
 */
async function seedProducts() {
  const batch = db.batch();
  PRODUCTS.forEach((p) => {
    const ref = db.collection("products").doc(String(p.id));
    batch.set(ref, p);
  });
  await batch.commit();
  console.log("✅ Products seeded to Firestore.");
}

// ──── CART (per-user, cloud-synced) ───────────

/**
 * Push the current localStorage cart to Firestore (merge).
 * Called automatically on login.
 */
async function syncCartToFirestore() {
  if (!currentUser) return;
  const cart = getCart();
  if (cart.length === 0) {
    // If local cart is empty, pull from cloud instead
    await loadCartFromFirestore();
    return;
  }
  try {
    await db.collection("carts").doc(currentUser.uid).set(
      { items: cart, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn("Cart sync failed.", err);
  }
}

/** Download the user's cart from Firestore into localStorage */
async function loadCartFromFirestore() {
  if (!currentUser) return;
  try {
    const doc = await db.collection("carts").doc(currentUser.uid).get();
    if (doc.exists && doc.data().items) {
      localStorage.setItem(CART_KEY, JSON.stringify(doc.data().items));
      updateCartBadge();
      // Re-render cart page if we're on it
      if (document.body.dataset.page === "cart") renderCartPage();
    }
  } catch (err) {
    console.warn("Cart load from Firestore failed.", err);
  }
}

/** Save cart to Firestore whenever it changes (called from saveCart) */
async function persistCartToFirestore(cart) {
  if (!currentUser) return;
  try {
    await db.collection("carts").doc(currentUser.uid).set(
      { items: cart, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    console.warn("Cart persist failed.", err);
  }
}

// ──── ORDERS ──────────────────────────────────

/**
 * Save a completed order to Firestore.
 * Returns the auto-generated order ID.
 */
async function saveOrder(orderData) {
  try {
    const ref = await db.collection("orders").add({
      ...orderData,
      userId: currentUser ? currentUser.uid : "guest",
      userEmail: currentUser ? currentUser.email : orderData.email,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    // Clear the user's cloud cart
    if (currentUser) {
      await db.collection("carts").doc(currentUser.uid).delete();
    }
    return ref.id;
  } catch (err) {
    console.warn("Order save failed.", err);
    return null;
  }
}

// ──── NEWSLETTER ──────────────────────────────

/** Save a newsletter subscription email */
async function saveNewsletterSubscription(email) {
  try {
    await db.collection("newsletter").doc(email).set({
      email,
      subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn("Newsletter save failed.", err);
  }
}
