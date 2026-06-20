// ===== Admin Panel JavaScript =====

// 管理页面独立的 UI 工具（不依赖 main.js）
const AdminUI = {
  getCategoryColor(category) {
    const colors = {
      interior: 'linear-gradient(135deg, #e8d5c4 0%, #f5ebe0 100%)',
      exterior: 'linear-gradient(135deg, #c4d4e8 0%, #dbe4ee 100%)',
      wood: 'linear-gradient(135deg, #d4c4a8 0%, #e8dcc8 100%)',
      primer: 'linear-gradient(135deg, #d4d4d4 0%, #e8e8e8 100%)',
      special: 'linear-gradient(135deg, #c4c8d4 0%, #d8dbe4 100%)'
    };
    return colors[category] || 'linear-gradient(135deg, #e8d5c4 0%, #f5ebe0 100%)';
  }
};

const Admin = {
  products: [],
  categories: [],
  editingProduct: null,

  // Initialize admin panel
  async init() {
    await this.loadData();
    this.renderProducts();
    this.bindEvents();
  },

  // Load data
  async loadData() {
    try {
      // Try localStorage first
      const cachedProducts = localStorage.getItem('paint_products');
      const cachedCategories = localStorage.getItem('paint_categories');

      if (cachedProducts) {
        this.products = JSON.parse(cachedProducts);
      } else {
        const response = await fetch('../data/products.json');
        const data = await response.json();
        this.products = data.products;
        localStorage.setItem('paint_products', JSON.stringify(this.products));
      }

      if (cachedCategories) {
        this.categories = JSON.parse(cachedCategories);
      } else {
        const response = await fetch('../data/categories.json');
        const data = await response.json();
        this.categories = data.categories;
        localStorage.setItem('paint_categories', JSON.stringify(this.categories));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('加载数据失败', 'error');
    }
  },

  // Save products to localStorage
  saveProducts() {
    localStorage.setItem('paint_products', JSON.stringify(this.products));
    this.showToast('数据已保存', 'success');
  },

  // Render products table
  renderProducts() {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    if (this.products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            <div class="empty-state-icon">📦</div>
            <p class="empty-state-text">暂无商品，点击"添加商品"开始</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.products.map(product => {
      const category = this.categories.find(c => c.id === product.category);
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div style="width:40px;height:40px;border-radius:0.375rem;background:${AdminUI.getCategoryColor(product.category)};display:flex;align-items:center;justify-content:center;color:white;font-size:0.875rem;">
                ${product.images[0] ? `<img src="../assets/images/${product.images[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:0.375rem;">` : '🎨'}
              </div>
              <div>
                <div style="font-weight:500;">${product.name}</div>
                <div style="font-size:0.75rem;color:var(--text-light);">${product.id}</div>
              </div>
            </div>
          </td>
          <td>${category?.name || product.category}</td>
          <td>${product.priceRange}</td>
          <td>
            <span class="status-badge ${product.active ? 'status-active' : 'status-inactive'}">
              ${product.active ? '已上架' : '已下架'}
            </span>
          </td>
          <td>${product.createdAt || '-'}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn action-btn-edit" onclick="Admin.editProduct('${product.id}')">编辑</button>
              <button class="action-btn action-btn-toggle" onclick="Admin.toggleProduct('${product.id}')">
                ${product.active ? '下架' : '上架'}
              </button>
              <button class="action-btn action-btn-delete" onclick="Admin.deleteProduct('${product.id}')">删除</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Bind events
  bindEvents() {
    // Add product button
    document.getElementById('btn-add-product')?.addEventListener('click', () => {
      this.editingProduct = null;
      this.showModal();
    });

    // Modal close
    document.getElementById('modal-close')?.addEventListener('click', () => {
      this.hideModal();
    });

    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.hideModal();
      }
    });

    // Form submit
    document.getElementById('product-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProduct();
    });

    // Export data
    document.getElementById('btn-export')?.addEventListener('click', () => {
      this.exportData();
    });

    // Import data
    document.getElementById('btn-import')?.addEventListener('click', () => {
      document.getElementById('import-file')?.click();
    });

    document.getElementById('import-file')?.addEventListener('change', (e) => {
      this.importData(e.target.files[0]);
    });
  },

  // Show modal for add/edit
  showModal(product = null) {
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');

    if (!overlay || !form) return;

    title.textContent = product ? '编辑商品' : '添加商品';

    // Populate category select
    const categorySelect = form.querySelector('[name="category"]');
    if (categorySelect) {
      categorySelect.innerHTML = this.categories
        .filter(c => c.active)
        .map(c => `<option value="${c.id}" ${product?.category === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`)
        .join('');
    }

    // Fill form fields
    if (product) {
      form.querySelector('[name="name"]').value = product.name;
      form.querySelector('[name="category"]').value = product.category;
      form.querySelector('[name="priceRange"]').value = product.priceRange;
      form.querySelector('[name="description"]').value = product.description;
      form.querySelector('[name="shortDescription"]').value = product.shortDescription || '';
      form.querySelector('[name="images"]').value = product.images.join(', ');
      form.querySelector('[name="video"]').value = product.video || '';
      form.querySelector('[name="features"]').value = product.features.join(', ');
      form.querySelector('[name="featured"]').checked = product.featured;
    } else {
      form.reset();
    }

    overlay.classList.add('active');
  },

  // Hide modal
  hideModal() {
    document.getElementById('modal-overlay')?.classList.remove('active');
    this.editingProduct = null;
  },

  // Edit product
  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.editingProduct = product;
      this.showModal(product);
    }
  },

  // Save product (add or update)
  saveProduct() {
    const form = document.getElementById('product-form');
    if (!form) return;

    const formData = new FormData(form);
    const productData = {
      name: formData.get('name'),
      category: formData.get('category'),
      priceRange: formData.get('priceRange'),
      description: formData.get('description'),
      shortDescription: formData.get('shortDescription'),
      images: formData.get('images').split(',').map(s => s.trim()).filter(Boolean),
      video: formData.get('video').trim(),
      features: formData.get('features').split(',').map(s => s.trim()).filter(Boolean),
      featured: form.querySelector('[name="featured"]').checked,
      active: true
    };

    if (this.editingProduct) {
      // Update existing
      const index = this.products.findIndex(p => p.id === this.editingProduct.id);
      if (index !== -1) {
        this.products[index] = { ...this.products[index], ...productData };
      }
    } else {
      // Add new
      const newProduct = {
        id: 'prod_' + String(Date.now()).slice(-6),
        ...productData,
        specs: {},
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.products.push(newProduct);
    }

    this.saveProducts();
    this.renderProducts();
    this.hideModal();
  },

  // Toggle product active status
  toggleProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      product.active = !product.active;
      this.saveProducts();
      this.renderProducts();
    }
  },

  // Delete product
  deleteProduct(id) {
    if (confirm('确定要删除这个商品吗？此操作不可恢复。')) {
      this.products = this.products.filter(p => p.id !== id);
      this.saveProducts();
      this.renderProducts();
    }
  },

  // Export data
  exportData() {
    const data = {
      products: this.products,
      categories: this.categories,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paint-store-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('数据导出成功', 'success');
  },

  // Import data
  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.products && Array.isArray(data.products)) {
          if (confirm(`确定要导入 ${data.products.length} 个商品吗？这将覆盖现有数据。`)) {
            this.products = data.products;
            if (data.categories) {
              this.categories = data.categories;
              localStorage.setItem('paint_categories', JSON.stringify(this.categories));
            }
            this.saveProducts();
            this.renderProducts();
            this.showToast('数据导入成功', 'success');
          }
        } else {
          this.showToast('无效的数据文件', 'error');
        }
      } catch (error) {
        this.showToast('文件解析失败', 'error');
      }
    };
    reader.readAsText(file);
  },

  // Show toast notification
  showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container') || (() => {
      const c = document.createElement('div');
      c.className = 'toast-container';
      document.body.appendChild(c);
      return c;
    })();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  Admin.init();
});
