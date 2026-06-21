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
            `<img src="assets/images/${product.images[0]}" alt="${product.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.querySelector('.img-placeholder').style.display='flex'"><div class="img-placeholder" style="display:none;height:100%;align-items:center;justify-content:center;font-size:3rem;position:absolute;inset:0;">🎨</div>` :
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

};

// ===== Canvas 流体背景 =====
const HeroCanvas = {
  canvas: null,
  ctx: null,
  blobs: [],
  animationId: null,
  isVisible: true,

  init() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    // 创建色块
    this.blobs = [
      { x: 0.3, y: 0.4, r: 200, color: 'rgba(232, 213, 196, 0.15)', vx: 0.0003, vy: 0.0002 },
      { x: 0.7, y: 0.6, r: 180, color: 'rgba(184, 196, 212, 0.12)', vx: -0.0002, vy: 0.0003 },
      { x: 0.5, y: 0.3, r: 150, color: 'rgba(196, 212, 192, 0.1)', vx: 0.0002, vy: -0.0002 },
      { x: 0.2, y: 0.7, r: 160, color: 'rgba(212, 192, 196, 0.1)', vx: 0.0001, vy: 0.0001 },
      { x: 0.8, y: 0.3, r: 140, color: 'rgba(245, 230, 200, 0.12)', vx: -0.0003, vy: 0.0002 },
    ];

    // 使用 IntersectionObserver 暂停不可见时的动画
    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
      if (this.isVisible && !this.animationId) {
        this.animate();
      }
    }, { threshold: 0 });
    observer.observe(this.canvas);

    window.addEventListener('resize', () => this.resize());
    this.animate();
  },

  resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
  },

  animate() {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.ctx.clearRect(0, 0, w, h);

    this.blobs.forEach(blob => {
      blob.x += blob.vx;
      blob.y += blob.vy;

      if (blob.x < -0.1 || blob.x > 1.1) blob.vx *= -1;
      if (blob.y < -0.1 || blob.y > 1.1) blob.vy *= -1;

      const cx = blob.x * w;
      const cy = blob.y * h;
      const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, blob.r);
      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(1, 'transparent');

      this.ctx.beginPath();
      this.ctx.arc(cx, cy, blob.r, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  },

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
};

// ===== 视差效果 =====
const Parallax = {
  init() {
    const decor = document.querySelector('.parallax-decor');
    if (!decor) return;

    // 使用 IntersectionObserver 检测是否在视口内
    let isInView = false;
    const observer = new IntersectionObserver((entries) => {
      isInView = entries[0].isIntersecting;
    }, { threshold: 0 });
    observer.observe(decor.parentElement);

    // 滚动视差
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!isInView || ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const section = decor.parentElement;
        const rect = section.getBoundingClientRect();
        const offset = rect.top / window.innerHeight;

        // 装饰元素以不同速度移动
        const circles = decor.querySelectorAll('.decor-circle');
        const lines = decor.querySelectorAll('.decor-line');

        circles.forEach((circle, i) => {
          const speed = 0.3 + i * 0.1;
          circle.style.transform = `translateY(${offset * speed * 100}px)`;
        });

        lines.forEach((line, i) => {
          const speed = 0.2 + i * 0.05;
          line.style.transform = `translateY(${offset * speed * 80}px)`;
        });

        ticking = false;
      });
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

    // Render color palette (新交互式色卡)
    const colorGrid = document.getElementById('color-grid');
    if (colorGrid) {
      const colors = [
        { name: '暖沙白', code: '#E8D5C4', color: '#E8D5C4' },
        { name: '雾霾蓝', code: '#B8C4D4', color: '#B8C4D4' },
        { name: '莫兰迪绿', code: '#C4D4C0', color: '#C4D4C0' },
        { name: '烟灰粉', code: '#D4C0C4', color: '#D4C0C4' },
        { name: '燕麦奶', code: '#F0E8D8', color: '#F0E8D8' },
        { name: '深岩灰', code: '#8C8C8C', color: '#8C8C8C' },
        { name: '奶油黄', code: '#F5E6C8', color: '#F5E6C8' },
        { name: '薄荷绿', code: '#C8E0D4', color: '#C8E0D4' },
        { name: '复古红', code: '#C4686A', color: '#C4686A' },
        { name: '深海蓝', code: '#6A8C9E', color: '#6A8C9E' },
        { name: '橄榄绿', code: '#8C9E6A', color: '#8C9E6A' },
        { name: '大地棕', code: '#9E7C6A', color: '#9E7C6A' },
      ];

      colorGrid.innerHTML = colors.map((c, index) => `
        <div class="color-cell animate-on-scroll"
             style="background:${c.color};--cell-color:${c.color};"
             data-color="${c.color}"
             data-delay="${index * 30}">
          <div class="color-cell-label">${c.name}</div>
        </div>
      `).join('');

      // 色卡点击事件 - 联动页面装饰元素
      colorGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.color-cell');
        if (!cell) return;

        // 切换激活状态
        document.querySelectorAll('.color-cell').forEach(c => c.classList.remove('active'));
        cell.classList.add('active');

        const color = cell.dataset.color;
        document.documentElement.style.setProperty('--accent-color', color);
        document.body.classList.add('accent-active');

        // 更新强调色元素
        document.querySelectorAll('.accent-element').forEach(el => {
          el.style.color = color;
          el.style.borderColor = color;
        });
      });
    }

    // 初始化 Canvas 流体背景
    HeroCanvas.init();

    // 初始化视差效果
    Parallax.init();

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
              `<img src="assets/images/${product.images[0]}" alt="${product.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;height:100%;align-items:center;justify-content:center;font-size:5rem;background:${UI.getCategoryColor(product.category)};position:absolute;inset:0;">🎨</div>` :
              `<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:5rem;background:${UI.getCategoryColor(product.category)}">🎨</div>`
            }
          </div>
          <div class="gallery-thumbs">
            ${product.images.map((img, i) => `
              <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
                <img src="assets/images/${img}" alt="${product.name}" onerror="this.parentElement.style.display='none'">
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
          mainGallery.innerHTML = `<img src="assets/images/${product.images[imgIndex]}" alt="${product.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;height:100%;align-items:center;justify-content:center;font-size:5rem;background:${UI.getCategoryColor(product.category)};position:absolute;inset:0;">🎨</div>`;
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
