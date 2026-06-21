// ===== 元素管理 =====

const DesignerElements = {
  // 预设家具
  furniture: [
    { id: 'sofa-modern', name: '现代沙发', icon: '🛋️', width: 160, height: 80, color: '#8B7355' },
    { id: 'sofa-l', name: 'L型沙发', icon: '🛋️', width: 200, height: 120, color: '#A0896B' },
    { id: 'chair-single', name: '单人椅', icon: '🪑', width: 60, height: 60, color: '#8B7355' },
    { id: 'table-coffee', name: '茶几', icon: '☕', width: 100, height: 50, color: '#B8A88A' },
    { id: 'table-dining', name: '餐桌', icon: '🍽️', width: 120, height: 80, color: '#A0896B' },
    { id: 'table-desk', name: '书桌', icon: '📚', width: 100, height: 60, color: '#8B7355' },
    { id: 'cabinet-tv', name: '电视柜', icon: '📺', width: 180, height: 50, color: '#A0896B' },
    { id: 'cabinet-book', name: '书柜', icon: '📚', width: 100, height: 160, color: '#8B7355' },
    { id: 'cabinet-wardrobe', name: '衣柜', icon: '👔', width: 120, height: 180, color: '#A0896B' },
    { id: 'bed-double', name: '双人床', icon: '🛏️', width: 180, height: 200, color: '#E8D5C4' },
    { id: 'bed-single', name: '单人床', icon: '🛏️', width: 120, height: 200, color: '#E8D5C4' },
    { id: 'lamp-floor', name: '落地灯', icon: '💡', width: 40, height: 120, color: '#D4C4A8' },
    { id: 'lamp-table', name: '台灯', icon: '💡', width: 30, height: 50, color: '#D4C4A8' },
    { id: 'plant-large', name: '大型盆栽', icon: '🌿', width: 60, height: 100, color: '#6B8E6B' },
    { id: 'plant-small', name: '小型盆栽', icon: '🌱', width: 40, height: 50, color: '#6B8E6B' }
  ],

  // 预设装饰
  decor: [
    { id: 'painting-abstract', name: '抽象画', icon: '🖼️', width: 80, height: 60, color: '#E8D5C4' },
    { id: 'painting-landscape', name: '风景画', icon: '🖼️', width: 100, height: 70, color: '#B8C4D4' },
    { id: 'photo-frame', name: '照片框', icon: '📷', width: 60, height: 80, color: '#D4C4A8' },
    { id: 'rug-modern', name: '现代地毯', icon: '🟫', width: 200, height: 120, color: '#C4B8A8' },
    { id: 'rug-persian', name: '波斯地毯', icon: '🟫', width: 180, height: 100, color: '#A0896B' },
    { id: 'rug-simple', name: '简约地毯', icon: '🟫', width: 160, height: 100, color: '#E0E0E0' },
    { id: 'curtain-solid', name: '素色窗帘', icon: '🪟', width: 120, height: 200, color: '#E8E0D8' },
    { id: 'curtain-pattern', name: '花纹窗帘', icon: '🪟', width: 120, height: 200, color: '#D4C0C4' },
    { id: 'blind', name: '百叶窗', icon: '🪟', width: 100, height: 180, color: '#E0E0E0' },
    { id: 'vase', name: '花瓶', icon: '🏺', width: 30, height: 50, color: '#B8A88A' },
    { id: 'clock', name: '挂钟', icon: '🕐', width: 50, height: 50, color: '#D4C4A8' },
    { id: 'mirror', name: '镜子', icon: '🪞', width: 60, height: 80, color: '#E0E0E0' }
  ],

  // 灯光效果
  lightingEffects: [
    { id: 'warm', name: '暖光', icon: '🌅', color: 'rgba(255, 200, 100, 0.15)' },
    { id: 'cool', name: '冷光', icon: '❄️', color: 'rgba(100, 150, 255, 0.1)' },
    { id: 'natural', name: '自然光', icon: '☀️', color: 'rgba(255, 255, 200, 0.1)' },
    { id: 'evening', name: '傍晚', icon: '🌆', color: 'rgba(200, 100, 50, 0.15)' }
  ],

  // 创建元素实例
  createElement(templateId, x, y) {
    const template = [...this.furniture, ...this.decor].find(t => t.id === templateId);
    if (!template) return null;

    return {
      id: `${templateId}_${Date.now()}`,
      type: this.furniture.includes(template) ? 'furniture' : 'decor',
      name: template.name,
      icon: template.icon,
      x: x || 100,
      y: y || 100,
      width: template.width,
      height: template.height,
      color: template.color,
      rotation: 0,
      scale: 1,
      imageData: null,
      image: null
    };
  },

  // 创建自定义照片元素
  createPhotoElement(dataUrl, x, y, width, height) {
    const img = new Image();
    img.src = dataUrl;

    return {
      id: `photo_${Date.now()}`,
      type: 'custom-photo',
      name: '自定义照片',
      icon: '📷',
      x: x || 100,
      y: y || 100,
      width: width || 150,
      height: height || 120,
      color: '#f0f0f0',
      rotation: 0,
      scale: 1,
      imageData: dataUrl,
      image: img
    };
  },

  // 获取家具列表
  getFurnitureList() {
    return this.furniture;
  },

  // 获取装饰列表
  getDecorList() {
    return this.decor;
  },

  // 获取灯光效果列表
  getLightingList() {
    return this.lightingEffects;
  }
};
