// =============================================
// MAIN — page-specific initialisation logic
// =============================================

document.addEventListener("DOMContentLoaded", async () => {
  initNavbar();

  // Load products from Firestore (falls back to local data if unavailable)
  if (typeof loadProductsFromFirestore === "function") {
    await loadProductsFromFirestore();
  }

  // Each page sets data-page on <body> so we know what to boot
  const page = document.body.dataset.page;
  switch (page) {
    case "home":
      initHomePage();
      break;
    case "products":
      initProductsPage();
      break;
    case "product-detail":
      initProductDetailPage();
      break;
    case "cart":
      initCartPage();
      break;
    case "checkout":
      initCheckoutPage();
      break;
  }
});

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────

function initNavbar() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      hamburger.classList.toggle("active", open);
      hamburger.setAttribute("aria-expanded", open);
    });

    // Close mobile menu when any link is clicked
    navMenu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        hamburger.classList.remove("active");
        hamburger.setAttribute("aria-expanded", false);
      })
    );
  }

  // Mark the current page's link as active
  const filename = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === filename || (filename === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────

function initHomePage() {
  renderFeaturedProducts();
}

function renderFeaturedProducts() {
  const container = document.getElementById("featured-products");
  if (!container) return;

  // Show the first 4 products as "featured"
  const featured = PRODUCTS.slice(0, 4);
  container.innerHTML = featured.map(createProductCard).join("");
  bindProductCardEvents(container);
}

// ─────────────────────────────────────────────
// PRODUCTS PAGE
// ─────────────────────────────────────────────

let currentCategory = "All";
let currentSearch = "";

function initProductsPage() {
  renderCategoryFilters();
  renderProducts();
  setupSearchBar();
}

function renderCategoryFilters() {
  const container = document.getElementById("category-filters");
  if (!container) return;

  container.innerHTML = getCategories()
    .map(
      (cat) =>
        `<button class="filter-btn${cat === "All" ? " active" : ""}" data-category="${cat}">${cat}</button>`
    )
    .join("");

  container.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const countEl = document.getElementById("products-count");
  if (!grid) return;

  const results = filterProducts(currentCategory, currentSearch);

  if (countEl) {
    countEl.textContent = `${results.length} product${results.length !== 1 ? "s" : ""} found`;
  }

  if (results.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different search term or category.</p>
      </div>`;
    return;
  }

  grid.innerHTML = results.map(createProductCard).join("");
  bindProductCardEvents(grid);
}

function setupSearchBar() {
  const input = document.getElementById("search-input");
  if (!input) return;

  input.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    renderProducts();
  });

  // Clear button
  const clearBtn = document.getElementById("search-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      currentSearch = "";
      renderProducts();
      input.focus();
    });
  }
}

// ─────────────────────────────────────────────
// PRODUCT DETAIL PAGE
// ─────────────────────────────────────────────

function initProductDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  if (!id) {
    window.location.href = "products.html";
    return;
  }

  const product = getProductById(id);
  if (!product) {
    window.location.href = "products.html";
    return;
  }

  renderProductDetail(product);
}

function renderProductDetail(product) {
  document.title = `${product.name} — ShopEase`;

  // Image
  const img = document.getElementById("product-image");
  if (img) {
    img.src = product.image;
    img.alt = product.name;
  }

  // Text fields
  setText("product-name", product.name);
  setText("product-description", product.description);
  setText("product-category-label", product.category);

  // Price
  const priceEl = document.getElementById("product-price");
  if (priceEl) priceEl.textContent = `$${product.price.toFixed(2)}`;

  // Original price + discount badge
  const origEl = document.getElementById("product-original-price");
  const discEl = document.getElementById("product-discount");
  if (product.originalPrice) {
    if (origEl) { origEl.textContent = `$${product.originalPrice.toFixed(2)}`; origEl.style.display = "inline"; }
    if (discEl) {
      const pct = Math.round((1 - product.price / product.originalPrice) * 100);
      discEl.textContent = `-${pct}%`;
      discEl.style.display = "inline-flex";
    }
  }

  // Star rating
  const ratingEl = document.getElementById("product-rating");
  if (ratingEl) {
    ratingEl.innerHTML = `${generateStars(product.rating)}<span class="reviews-count">(${product.reviews} reviews)</span>`;
  }

  // Badge
  const badgeEl = document.getElementById("product-badge");
  if (badgeEl && product.badge) {
    badgeEl.textContent = product.badge;
    badgeEl.className = `product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, "-")}`;
    badgeEl.style.display = "inline-flex";
  }

  // Quantity controls
  const qtyInput = document.getElementById("quantity-input");
  const minusBtn = document.getElementById("qty-minus");
  const plusBtn = document.getElementById("qty-plus");

  if (qtyInput && minusBtn && plusBtn) {
    minusBtn.addEventListener("click", () => {
      const v = parseInt(qtyInput.value, 10);
      if (v > 1) qtyInput.value = v - 1;
    });
    plusBtn.addEventListener("click", () => {
      qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    });
    // Prevent bad values
    qtyInput.addEventListener("change", () => {
      const v = parseInt(qtyInput.value, 10);
      qtyInput.value = isNaN(v) || v < 1 ? 1 : v;
    });
  }

  // Add to cart
  const addBtn = document.getElementById("add-to-cart-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const qty = parseInt(qtyInput ? qtyInput.value : "1", 10);
      addToCart(product.id, qty);
    });
  }

  // Related products (same category, excluding current)
  renderRelatedProducts(product);
}

function renderRelatedProducts(current) {
  const container = document.getElementById("related-products");
  if (!container) return;

  const related = PRODUCTS.filter((p) => p.category === current.category && p.id !== current.id).slice(0, 4);

  if (related.length === 0) {
    const section = document.getElementById("related-section");
    if (section) section.style.display = "none";
    return;
  }

  container.innerHTML = related.map(createProductCard).join("");
  bindProductCardEvents(container);
}

// ─────────────────────────────────────────────
// CART PAGE
// ─────────────────────────────────────────────

function initCartPage() {
  renderCartPage();
}

function renderCartPage() {
  const cart = getCart();
  const emptyEl = document.getElementById("empty-cart");
  const containerEl = document.getElementById("cart-container");

  if (cart.length === 0) {
    if (emptyEl) emptyEl.style.display = "flex";
    if (containerEl) containerEl.style.display = "none";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  if (containerEl) containerEl.style.display = "grid";

  renderCartItems(cart);
  renderCartSummary();
}

function renderCartItems(cart) {
  const itemsEl = document.getElementById("cart-items");
  if (!itemsEl) return;

  itemsEl.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-product">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
        <div>
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
        </div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase">+</button>
      </div>
      <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">×</button>
    </div>`
    )
    .join("");

  // Quantity buttons
  itemsEl.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id, 10);
      const cartItem = getCart().find((i) => i.id === id);
      if (!cartItem) return;
      const delta = btn.dataset.action === "increase" ? 1 : -1;
      updateCartItemQuantity(id, cartItem.quantity + delta);
      renderCartPage();
    });
  });

  // Remove buttons
  itemsEl.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(parseInt(btn.dataset.id, 10));
      renderCartPage();
    });
  });
}

function renderCartSummary() {
  const subtotal = getCartTotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  setText("summary-subtotal", `$${subtotal.toFixed(2)}`);
  setText("summary-tax", `$${tax.toFixed(2)}`);
  setText("summary-total", `$${total.toFixed(2)}`);

  const shippingEl = document.getElementById("summary-shipping");
  if (shippingEl) {
    shippingEl.textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
    shippingEl.classList.toggle("free-shipping", shipping === 0);
  }
}

// ─────────────────────────────────────────────
// CHECKOUT PAGE
// ─────────────────────────────────────────────

function initCheckoutPage() {
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }
  renderCheckoutSummary(cart);
  setupCheckoutForm();
}

function renderCheckoutSummary(cart) {
  const container = document.getElementById("order-items");
  if (!container) return;

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="order-item">
      <img src="${item.image}" alt="${item.name}" class="order-item-img" loading="lazy">
      <div class="order-item-info">
        <span class="order-item-name">${item.name}</span>
        <span class="order-item-qty">Qty: ${item.quantity}</span>
      </div>
      <span class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>`
    )
    .join("");

  const subtotal = getCartTotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  setText("checkout-subtotal", `$${subtotal.toFixed(2)}`);
  setText("checkout-tax", `$${tax.toFixed(2)}`);
  setText("checkout-total", `$${total.toFixed(2)}`);

  const shipEl = document.getElementById("checkout-shipping");
  if (shipEl) {
    shipEl.textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
    shipEl.classList.toggle("free-shipping", shipping === 0);
  }
}

function setupCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateForm(form)) placeOrder();
  });

  // Live validation — clear error on input
  form.querySelectorAll(".form-input, .form-select").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
  });
}

function validateForm(form) {
  let valid = true;

  form.querySelectorAll("[required]").forEach((field) => {
    clearFieldError(field);
    if (!field.value.trim()) {
      setFieldError(field, "This field is required.");
      valid = false;
    } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      setFieldError(field, "Please enter a valid email address.");
      valid = false;
    } else if (field.id === "phone" && !/^[\d\s+\-().]{7,15}$/.test(field.value)) {
      setFieldError(field, "Please enter a valid phone number.");
      valid = false;
    }
  });

  return valid;
}

async function placeOrder() {
  const formSection = document.getElementById("checkout-form-section");
  const summarySection = document.getElementById("checkout-summary-section");
  const successEl = document.getElementById("order-success");

  // Collect form data for the order
  const form = document.getElementById("checkout-form");
  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const orderData = {
    items: cart,
    subtotal,
    shipping,
    tax,
    total,
    customer: {
      firstName: form ? form.querySelector("#first-name")?.value || "" : "",
      lastName: form ? form.querySelector("#last-name")?.value || "" : "",
      email: form ? form.querySelector("#email")?.value || "" : "",
      phone: form ? form.querySelector("#phone")?.value || "" : "",
    },
    shipping_address: {
      address: form ? form.querySelector("#address")?.value || "" : "",
      city: form ? form.querySelector("#city")?.value || "" : "",
      zip: form ? form.querySelector("#zip")?.value || "" : "",
      country: form ? form.querySelector("#country")?.value || "" : "",
    },
    paymentMethod: form ? form.querySelector('input[name="payment"]:checked')?.value || "card" : "card",
  };

  // Save order to Firestore
  let orderId = null;
  if (typeof saveOrder === "function") {
    orderId = await saveOrder(orderData);
  }

  if (successEl) {
    if (formSection) formSection.style.display = "none";
    if (summarySection) summarySection.style.display = "none";
    successEl.style.display = "flex";
    setText("order-number", orderId ? "#" + orderId.slice(0, 8).toUpperCase() : "#" + (Math.floor(Math.random() * 900000) + 100000));
  }

  clearCart();
}

// ─────────────────────────────────────────────
// SHARED UTILITIES
// ─────────────────────────────────────────────

/** Build a product card HTML string */
function createProductCard(product) {
  const hasDiscount = product.originalPrice !== null && product.originalPrice !== undefined;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return `
  <div class="product-card">
    ${product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase().replace(/\s+/g, "-")}">${product.badge}</span>` : ""}
    ${discountPct > 0 ? `<span class="product-discount-badge">-${discountPct}%</span>` : ""}
    <div class="product-img-wrap">
      <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
    </div>
    <div class="product-body">
      <span class="product-category">${product.category}</span>
      <h3 class="product-name">${product.name}</h3>
      <div class="product-rating">
        ${generateStars(product.rating)}
        <span class="rating-count">(${product.reviews})</span>
      </div>
      <div class="product-pricing">
        <span class="product-price">$${product.price.toFixed(2)}</span>
        ${hasDiscount ? `<span class="product-original-price">$${product.originalPrice.toFixed(2)}</span>` : ""}
      </div>
      <div class="product-actions">
        <button class="btn btn-primary btn-view" data-id="${product.id}">View Details</button>
        <button class="btn btn-secondary btn-add-cart" data-id="${product.id}" aria-label="Add to cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>`;
}

/** Attach click handlers to .btn-view and .btn-add-cart inside a container */
function bindProductCardEvents(container) {
  container.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `product.html?id=${btn.dataset.id}`;
    });
  });

  container.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(parseInt(btn.dataset.id, 10));
    });
  });
}

/** Generate filled/empty star HTML for a given rating */
function generateStars(rating) {
  let html = '<span class="stars">';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<span class="star full">★</span>';
    } else if (i - 0.5 <= rating) {
      html += '<span class="star half">★</span>';
    } else {
      html += '<span class="star empty">☆</span>';
    }
  }
  return html + "</span>";
}

/** Safely set the textContent of an element by id */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/** Show a validation error beneath a form field */
function setFieldError(field, message) {
  field.classList.add("error");
  const err = document.createElement("span");
  err.className = "field-error";
  err.textContent = message;
  field.parentNode.appendChild(err);
}

/** Remove a previously shown validation error */
function clearFieldError(field) {
  field.classList.remove("error");
  field.parentNode.querySelectorAll(".field-error").forEach((e) => e.remove());
}
