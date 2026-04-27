// =============================================
// PRODUCT CATALOG — static data source
// =============================================

const PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 89.99,
    originalPrice: 119.99,
    image: "https://picsum.photos/seed/headphones101/600/600",
    description:
      "Premium wireless headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable over-ear cushions. Features Bluetooth 5.0, foldable design for easy travel, and a high-clarity built-in microphone for crisp calls.",
    category: "Electronics",
    rating: 4.5,
    reviews: 128,
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: 199.99,
    originalPrice: 249.99,
    image: "https://picsum.photos/seed/watch202/600/600",
    description:
      "Advanced smartwatch with comprehensive health monitoring including heart rate, SpO2, and sleep tracking. Features built-in GPS, 50m water resistance, customizable watch faces, and 7-day battery life. Compatible with iOS and Android.",
    category: "Electronics",
    rating: 4.7,
    reviews: 95,
    badge: "New",
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 124.99,
    originalPrice: 154.99,
    image: "https://picsum.photos/seed/shoes303/600/600",
    description:
      "Lightweight and breathable running shoes engineered for both road and trail. Features responsive foam cushioning, superior grip outsole, and a durable mesh upper that wicks moisture. Perfect for daily training or race day.",
    category: "Footwear",
    rating: 4.4,
    reviews: 203,
    badge: null,
  },
  {
    id: 4,
    name: "Laptop Backpack",
    price: 59.99,
    originalPrice: 79.99,
    image: "https://picsum.photos/seed/backpack404/600/600",
    description:
      "Spacious and organized laptop backpack with a dedicated 15.6-inch padded compartment, external USB charging port, hidden anti-theft back pocket, and premium water-resistant nylon. Ideal for commuters, students, and travelers.",
    category: "Accessories",
    rating: 4.6,
    reviews: 312,
    badge: "Sale",
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    price: 49.99,
    originalPrice: 69.99,
    image: "https://picsum.photos/seed/speaker505/600/600",
    description:
      "Portable 360° Bluetooth 5.0 speaker delivering rich, room-filling sound. Rated IPX7 fully waterproof, 20-hour playtime per charge, and a rugged fabric exterior. Built-in mic for speakerphone calls.",
    category: "Electronics",
    rating: 4.3,
    reviews: 87,
    badge: null,
  },
  {
    id: 6,
    name: "Polarized Sunglasses",
    price: 34.99,
    originalPrice: null,
    image: "https://picsum.photos/seed/sunglasses606/600/600",
    description:
      "Stylish polarized sunglasses with UV400 full-spectrum protection. Lightweight acetate frame, scratch-resistant polycarbonate lenses, and spring-loaded hinges for a comfortable fit. Includes premium hard case and cleaning cloth.",
    category: "Accessories",
    rating: 4.2,
    reviews: 156,
    badge: null,
  },
  {
    id: 7,
    name: "Coffee Maker",
    price: 79.99,
    originalPrice: 99.99,
    image: "https://picsum.photos/seed/coffee707/600/600",
    description:
      "Programmable 12-cup coffee maker with a built-in conical burr grinder, three brew-strength settings, and a 24-hour auto-start timer. The double-wall thermal carafe keeps coffee hot for up to 4 hours without scorching.",
    category: "Home & Kitchen",
    rating: 4.5,
    reviews: 74,
    badge: null,
  },
  {
    id: 8,
    name: "Yoga Mat",
    price: 29.99,
    originalPrice: null,
    image: "https://picsum.photos/seed/yoga808/600/600",
    description:
      "Extra-thick 6mm non-slip yoga mat with alignment lines printed directly into the surface. Made from eco-friendly, closed-cell TPE foam — completely free of PVC, latex, and toxins. Includes a carry strap and downloadable pose guide.",
    category: "Sports",
    rating: 4.6,
    reviews: 241,
    badge: "Eco-Friendly",
  },
  {
    id: 9,
    name: "Mirrorless Camera",
    price: 699.99,
    originalPrice: 849.99,
    image: "https://picsum.photos/seed/camera909/600/600",
    description:
      "24.2MP APS-C mirrorless camera with real-time Eye-AF tracking, uncropped 4K video at 30fps, and 5-axis in-body image stabilization. Weather-sealed magnesium-alloy body. Perfect for enthusiast photographers and content creators.",
    category: "Electronics",
    rating: 4.8,
    reviews: 62,
    badge: "Premium",
  },
  {
    id: 10,
    name: "Gaming Mouse",
    price: 44.99,
    originalPrice: 59.99,
    image: "https://picsum.photos/seed/mouse010/600/600",
    description:
      "High-precision gaming mouse with a 25,600 DPI optical sensor, 11 programmable buttons, per-key RGB lighting with 16.8M colors, and a contoured ergonomic right-handed grip. Works on any surface, wired USB connection.",
    category: "Electronics",
    rating: 4.5,
    reviews: 189,
    badge: "Gaming",
  },
  {
    id: 11,
    name: "LED Desk Lamp",
    price: 39.99,
    originalPrice: null,
    image: "https://picsum.photos/seed/lamp011/600/600",
    description:
      "Adjustable LED desk lamp with 5 color temperature modes (2700K–6500K), 10 brightness levels, a fast 5W USB-A charging port, and a 60-minute sleep timer. Flexible gooseneck arm, touch-sensitive controls, and memory function.",
    category: "Home & Kitchen",
    rating: 4.4,
    reviews: 103,
    badge: null,
  },
  {
    id: 12,
    name: "Stainless Water Bottle",
    price: 24.99,
    originalPrice: 34.99,
    image: "https://picsum.photos/seed/bottle012/600/600",
    description:
      "32 oz double-wall vacuum-insulated stainless steel water bottle. Keeps drinks ice-cold for 24 hours or steaming hot for 12 hours. 100% BPA-free, leak-proof twist cap, and a scratch-resistant powder-coat exterior.",
    category: "Sports",
    rating: 4.7,
    reviews: 418,
    badge: "Sale",
  },
];

// ──── Helper functions ─────────────────────────────────

/** Return all unique categories prefixed with "All" */
function getCategories() {
  const cats = [...new Set(PRODUCTS.map((p) => p.category))];
  return ["All", ...cats];
}

/** Find a single product by numeric id */
function getProductById(id) {
  return PRODUCTS.find((p) => p.id === parseInt(id, 10)) || null;
}

/**
 * Filter products by category and a search term.
 * Both checks are case-insensitive.
 */
function filterProducts(category = "All", searchTerm = "") {
  const q = searchTerm.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    const matchesCat = category === "All" || p.category === category;
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });
}
