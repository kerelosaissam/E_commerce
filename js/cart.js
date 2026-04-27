// =============================================
// CART — localStorage-backed cart management
// =============================================

const CART_KEY = "shopease_cart";

/** Read cart array from localStorage */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

/** Persist cart array and refresh all badge counts on the page */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  // Sync to Firestore if user is logged in
  if (typeof persistCartToFirestore === "function") {
    persistCartToFirestore(cart);
  }
}

/**
 * Add a product to the cart.
 * If the product is already in the cart, increment its quantity.
 */
function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) return false;

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
  }

  saveCart(cart);
  showToast(`"${product.name}" added to cart!`, "success");
  return true;
}

/** Remove a product from the cart entirely */
function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
}

/** Set a cart item's quantity; removes it if quantity drops to 0 or below */
function updateCartItemQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
  }
}

/** Total number of individual items (sum of all quantities) */
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

/** Total monetary value of the cart */
function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Wipe the entire cart */
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

/** Sync every .cart-badge element on the current page */
function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll(".cart-badge").forEach((badge) => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  });
}

// ──── Toast notification system ───────────────────────

/**
 * Display a slide-in toast message.
 * @param {string} message - Text to show
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const icons = { success: "✓", error: "✕", info: "i" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || "i"}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Close">×</button>
  `;

  toast.querySelector(".toast-close").addEventListener("click", () => dismissToast(toast));
  container.appendChild(toast);

  // Trigger CSS enter animation
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("toast-show")));

  // Auto-dismiss after 3 s
  setTimeout(() => dismissToast(toast), 3200);
}

function dismissToast(toast) {
  toast.classList.remove("toast-show");
  toast.addEventListener("transitionend", () => toast.remove(), { once: true });
}

// Initialise badge count as soon as the DOM is ready
document.addEventListener("DOMContentLoaded", updateCartBadge);
