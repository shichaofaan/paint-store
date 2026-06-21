// ===== 场景管理 =====

const DesignerScene = {
  currentScene: 'living-room',
  wallColor: '#F5F0EB',
  floorColor: '#D4C4A8',
  lighting: 'warm',

  // 预设场景
  scenes: {
    'living-room': {
      name: '客厅',
      icon: '🛋️',
      wallColor: '#F5F0EB',
      floorColor: '#D4C4A8',
      description: '现代简约客厅'
    },
    'bedroom': {
      name: '卧室',
      icon: '🛏️',
      wallColor: '#E8E0D8',
      floorColor: '#C4B8A8',
      description: '温馨卧室空间'
    },
    'kitchen': {
      name: '厨房',
      icon: '🍳',
      wallColor: '#F0F0F0',
      floorColor: '#B8B8B8',
      description: '现代厨房设计'
    },
    'kids-room': {
      name: '儿童房',
      icon: '🧸',
      wallColor: '#E8F0E8',
      floorColor: '#D8D0C8',
      description: '活泼儿童空间'
    }
  },

  // 预设颜色
  wallColors: [
    { name: '暖沙白', color: '#F5F0EB' },
    { name: '米白色', color: '#E8D5C4' },
    { name: '浅灰色', color: '#E0E0E0' },
    { name: '雾霾蓝', color: '#B8C4D4' },
    { name: '莫兰迪绿', color: '#C4D4C0' },
    { name: '烟灰粉', color: '#D4C0C4' },
    { name: '奶油黄', color: '#F5E6C8' },
    { name: '薄荷绿', color: '#C8E0D4' },
    { name: '深岩灰', color: '#8C8C8C' },
    { name: '大地棕', color: '#9E7C6A' }
  ],

  floorColors: [
    { name: '原木色', color: '#D4C4A8' },
    { name: '浅橡木', color: '#C4B8A8' },
    { name: '深胡桃', color: '#8B7355' },
    { name: '白色', color: '#F0F0F0' },
    { name: '灰色', color: '#B8B8B8' },
    { name: '深灰', color: '#666666' }
  ],

  // 切换场景
  switchScene(sceneId) {
    const scene = this.scenes[sceneId];
    if (!scene) return;

    this.currentScene = sceneId;
    this.wallColor = scene.wallColor;
    this.floorColor = scene.floorColor;

    // 重新渲染
    if (typeof DesignerCanvas !== 'undefined') {
      DesignerCanvas.render();
    }
  },

  // 设置墙色
  setWallColor(color) {
    this.wallColor = color;
    if (typeof DesignerCanvas !== 'undefined') {
      DesignerCanvas.render();
    }
  },

  // 设置地板颜色
  setFloorColor(color) {
    this.floorColor = color;
    if (typeof DesignerCanvas !== 'undefined') {
      DesignerCanvas.render();
    }
  },

  // 设置灯光
  setLighting(type) {
    this.lighting = type;
    if (typeof DesignerCanvas !== 'undefined') {
      DesignerCanvas.render();
    }
  },

  // 获取场景列表
  getSceneList() {
    return Object.entries(this.scenes).map(([id, scene]) => ({
      id,
      ...scene
    }));
  },

  // 导出场景数据
  exportData() {
    return {
      sceneId: this.currentScene,
      wallColor: this.wallColor,
      floorColor: this.floorColor,
      lighting: this.lighting
    };
  },

  // 导入场景数据
  importData(data) {
    if (data.sceneId && this.scenes[data.sceneId]) {
      this.currentScene = data.sceneId;
    }
    if (data.wallColor) this.wallColor = data.wallColor;
    if (data.floorColor) this.floorColor = data.floorColor;
    if (data.lighting) this.lighting = data.lighting;
  }
};
