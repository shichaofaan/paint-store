// ===== Paint Store Main JavaScript =====

// Data Management
const DataManager = {
  // Load data from JSON file or localStorage
  async loadProducts() {
    try {
      // Try localStorage first (for admin updates)
      const cached = localStorage.getItem('paint_products');
      if (cached) {
        return JSON.parse(cached);
      }
      // Fall back to JSON file
      const response = await fetch('data/products.json');
      const data = await response.json();
      localStorage.setItem('paint_products', JSON.stringify(data.products));
      return data.products;
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },

  async loadCategories() {
    try {
      const cached = localStorage.getItem('paint_categories');
      if (cached) {
        return JSON.parse(cached);
      }
      const response = await fetch('data/categories.json');
      const data = await response.json();
      localStorage.setItem('paint_categories', JSON.stringify(data.categories));
      return data.categories;
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  },

  // Save to localStorage
  saveProducts(products) {
    localStorage.setItem('paint_products', JSON.stringify(products));
  },

  saveCategories(categories) {
    localStorage.setItem('paint_categories', JSON.stringify(categories));
  },

  // Get product by ID
  async getProductById(id) {
    const products = await this.loadProducts();
    return products.find(p => p.id === id);
  },

  // Get products by category
  async getProductsByCategory(categoryId) {
    const products = await this.loadProducts();
    if (categoryId === 'all') return products;
    return products.filter(p => p.category === categoryId);
  },

  // Get featured products
  async getFeaturedProducts() {
    const products = await this.loadProducts();
    return products.filter(p => p.featured && p.active);
  },

  // Search products
  async searchProducts(query) {
    const products = await this.loadProducts();
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.features.some(f => f.toLowerCase().includes(lowerQuery))
    );
  }
};

// Scroll Animation System
const ScrollAnimator = {
  init() {
    this.elements = document.querySelectorAll('.animate-on-scroll');
    if (this.elements.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add delay based on data attribute
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    this.elements.forEach(el => this.observer.observe(el));
  }
};

// UI Components
const UI = {
  // Show toast notification
  showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container') || this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },

  // Create product card HTML
  createProductCard(product) {
    const category = window.categories?.find(c => c.id === product.category);
    const categoryName = category ? category.name : product.category;
    const placeholderColor = this.getCategoryColor(product.category);

    return `
      <div class="product-card animate-on-scroll" onclick="window.location.href='product-detail.html?id=${product.id}'">
        <div class="product-card-image" style="background: ${placeholderColor}">
          ${product.images[0] ?
            `<img src="assets/images/${product.images[0]}" alt="${product.name}" loading="lazy">` :
            `<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">🎨</div>`
          }
          ${product.featured ? '<span class="product-card-badge">精选</span>' : ''}
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${categoryName}</span>
          <h3 class="product-card-title">${product.name}</h3>
          <p class="product-card-desc">${product.shortDescription || product.description.substring(0, 60) + '...'}</p>
          <div class="product-card-price">${product.priceRange}</div>
        </div>
      </div>
    `;
  },

  // Create category card HTML
  createCategoryCard(category, productCount) {
    return `
      <a href="products.html?category=${category.id}" class="category-card animate-on-scroll">
        <div class="category-card-icon">${category.icon}</div>
        <h3 class="category-card-title">${category.name}</h3>
        <p class="category-card-desc">${category.description}</p>
        <p style="margin-top:1rem;color:var(--color-text-secondary);font-size:0.75rem;font-weight:300;letter-spacing:0.1em;">${productCount} 款产品</p>
      </a>
    `;
  },

  // Get placeholder color based on category
  getCategoryColor(category) {
    const colors = {
      interior: 'linear-gradient(135deg, #e8d5c4 0%, #f5ebe0 100%)',
      exterior: 'linear-gradient(135deg, #c4d4e8 0%, #dbe4ee 100%)',
      wood: 'linear-gradient(135deg, #d4c4a8 0%, #e8dcc8 100%)',
      primer: 'linear-gradient(135deg, #d4d4d4 0%, #e8e8e8 100%)',
      special: 'linear-gradient(135deg, #c4c8d4 0%, #d8dbe4 100%)'
    };
    return colors[category] || 'linear-gradient(135deg, #e8d5c4 0%, #f5ebe0 100%)';
  },

  // Initialize navigation
  initNavigation() {
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile menu toggle
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }

    // Set active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  },

  // Initialize hero slider
  initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (slides.length === 0) return;

    let currentSlide = 0;

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide]?.classList.remove('active');
      currentSlide = index;
      slides[currentSlide].classList.add('active');
      dots[currentSlide]?.classList.add('active');
    }

    // Auto advance
    setInterval(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, 6000);

    // Dot clicks
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });
  }
};

// Page Initializers
const Pages = {
  // Home page
  async initHome() {
    const [products, categories] = await Promise.all([
      DataManager.getFeaturedProducts(),
      DataManager.loadCategories()
    ]);

    window.categories = categories;

    // Render categories
    const categoriesGrid = document.getElementById('categories-grid');
    if (categoriesGrid) {
      const allProducts = await DataManager.loadProducts();
      categoriesGrid.innerHTML = categories
        .filter(c => c.active)
        .map((cat, index) => {
          const count = allProducts.filter(p => p.category === cat.id && p.active).length;
          return `<div class="animate-on-scroll" data-delay="${index * 100}">${UI.createCategoryCard(cat, count)}</div>`;
        }).join('');
    }

    // Render featured products
    const featuredGrid = document.getElementById('featured-products');
    if (featuredGrid) {
      featuredGrid.innerHTML = products
        .slice(0, 4)
        .map((p, index) => `<div class="animate-on-scroll" data-delay="${index * 100}">${UI.createProductCard(p)}</div>`)
        .join('');
    }

    // Render color palette
    const colorPaletteGrid = document.getElementById('color-palette-grid');
    if (colorPaletteGrid) {
      const colors = [
        { name: '暖沙白', code: '#E8D5C4', color: '#E8D5C4' },
        { name: '雾霾蓝', code: '#B8C4D4', color: '#B8C4D4' },
        { name: '莫兰迪绿', code: '#C4D4C0', color: '#C4D4C0' },
        { name: '烟灰粉', code: '#D4C0C4', color: '#D4C0C4' },
        { name: '燕麦奶', code: '#F0E8D8', color: '#F0E8D8' },
        { name: '深岩灰', code: '#8C8C8C', color: '#8C8C8C' },
        { name: '奶油黄', code: '#F5E6C8', color: '#F5E6C8' },
        { name: '薄荷绿', code: '#C8E0D4', color: '#C8E0D4' }
      ];

      colorPaletteGrid.innerHTML = colors.map((c, index) => `
        <div class="color-swatch animate-on-scroll"
             style="--swatch-color: ${c.color}; background: ${c.color};"
             data-delay="${index * 50}"
             onclick="Pages.showImmersiveColor('${c.name}', '${c.color}', '${c.code}')">
          <span class="color-name">${c.name}</span>
          <span class="color-code">${c.code}</span>
        </div>
      `).join('');
    }

    UI.initHeroSlider();
    ScrollAnimator.init();
  },

  // Show immersive color view
  showImmersiveColor(name, color, code) {
    const overlay = document.createElement('div');
    overlay.className = 'color-immersive';
    overlay.style.setProperty('--bg-color', color);
    overlay.innerHTML = `
      <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
      <div class="color-info">
        <h2>${name}</h2>
        <p>${code}</p>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close on click outside
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  },

  // Products page
  async initProducts() {
    const [allProducts, categories] = await Promise.all([
      DataManager.loadProducts(),
      DataManager.loadCategories()
    ]);

    window.categories = categories;

    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category') || 'all';

    // Render filter tabs
    const filterTabs = document.getElementById('filter-tabs');
    if (filterTabs) {
      filterTabs.innerHTML = `
        <button class="filter-tab ${selectedCategory === 'all' ? 'active' : ''}" data-category="all">全部</button>
        ${categories
          .filter(c => c.active)
          .map(c => `<button class="filter-tab ${selectedCategory === c.id ? 'active' : ''}" data-category="${c.id}">${c.icon} ${c.name}</button>`)
          .join('')}
      `;
    }

    // Filter and render products
    async function renderProducts(category = 'all', search = '') {
      let products = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
      if (search) {
        const lowerSearch = search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch)
        );
      }

      const grid = document.getElementById('products-grid');
      if (grid) {
        if (products.length === 0) {
          grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
              <div class="empty-state-icon">🔍</div>
              <p class="empty-state-text">没有找到匹配的产品</p>
            </div>
          `;
        } else {
          grid.innerHTML = products.filter(p => p.active).map((p, index) => {
            const card = UI.createProductCard(p);
            return `<div class="animate-on-scroll" data-delay="${index * 50}">${card}</div>`;
          }).join('');
          ScrollAnimator.init();
        }
      }
    }

    // Initial render
    renderProducts(selectedCategory);

    // Filter click handlers
    filterTabs?.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (tab) {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const search = document.getElementById('search-input')?.value || '';
        renderProducts(tab.dataset.category, search);
      }
    });

    // Search handler
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const activeTab = document.querySelector('.filter-tab.active');
          renderProducts(activeTab?.dataset.category || 'all', e.target.value);
        }, 300);
      });
    }
  },

  // Product detail page
  async initProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
      window.location.href = 'products.html';
      return;
    }

    const product = await DataManager.getProductById(productId);
    if (!product) {
      window.location.href = 'products.html';
      return;
    }

    const categories = await DataManager.loadCategories();
    const category = categories.find(c => c.id === product.category);

    // Update page title
    document.title = `${product.name} - 油漆店`;

    // Render product detail
    const container = document.getElementById('product-detail');
    if (container) {
      container.innerHTML = `
        <div class="product-gallery animate-on-scroll">
          <div class="gallery-main" id="gallery-main">
            ${product.images[0] ?
              `<img src="assets/images/${product.images[0]}" alt="${product.name}">` :
              `<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;background:${UI.getCategoryColor(product.category)}">🎨</div>`
            }
          </div>
          <div class="gallery-thumbs">
            ${product.images.map((img, i) => `
              <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                <img src="assets/images/${img}" alt="${product.name}">
              </div>
            `).join('')}
            ${product.video ? `
              <div class="gallery-thumb" data-type="video">
                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-text);color:white;font-size:0.6875rem;letter-spacing:0.05em;">▶ 视频</div>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="product-info animate-on-scroll" data-delay="200">
          <span class="product-card-category">${category?.name || product.category}</span>
          <h1>${product.name}</h1>
          <div class="product-price">${product.priceRange}</div>
          <p class="product-desc">${product.description}</p>
          <div class="product-features">
            ${product.features.map(f => `<span class="feature-badge">${f}</span>`).join('')}
          </div>
          <div class="product-specs">
            <h3>产品规格</h3>
            <table class="specs-table">
              ${Object.entries(product.specs).map(([key, value]) => `
                <tr>
                  <td>${key}</td>
                  <td>${value}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          <div style="margin-top:3rem;padding:2rem;background:var(--color-bg-warm);">
            <h3 style="margin-bottom:0.75rem;font-family:var(--font-heading);font-weight:400;letter-spacing:0.02em;">咨询购买</h3>
            <p style="color:var(--color-text-secondary);margin-bottom:1.5rem;font-weight:300;">如需购买或了解更多产品信息，请联系我们</p>
            <a href="contact.html" class="btn btn-primary">联系我们</a>
          </div>
        </div>
      `;

      // Gallery thumbnail clicks
      container.querySelector('.gallery-thumbs')?.addEventListener('click', (e) => {
        const thumb = e.target.closest('.gallery-thumb');
        if (!thumb) return;

        document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');

        const mainGallery = document.getElementById('gallery-main');
        if (thumb.dataset.type === 'video' && product.video) {
          mainGallery.innerHTML = `
            <video controls autoplay style="width:100%;height:100%;object-fit:cover;">
              <source src="assets/videos/${product.video}" type="video/mp4">
              您的浏览器不支持视频播放
            </video>
          `;
        } else {
          const imgIndex = parseInt(thumb.dataset.index);
          mainGallery.innerHTML = `<img src="assets/images/${product.images[imgIndex]}" alt="${product.name}">`;
        }
      });
    }

    // Render related products
    const relatedProducts = (await DataManager.getProductsByCategory(product.category))
      .filter(p => p.id !== product.id && p.active)
      .slice(0, 3);

    const relatedGrid = document.getElementById('related-products');
    if (relatedGrid && relatedProducts.length > 0) {
      relatedGrid.innerHTML = relatedProducts.map((p, index) =>
        `<div class="animate-on-scroll" data-delay="${index * 100}">${UI.createProductCard(p)}</div>`
      ).join('');
    }

    ScrollAnimator.init();
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  UI.initNavigation();
});
