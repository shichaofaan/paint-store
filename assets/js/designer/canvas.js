// ===== Canvas 渲染引擎 =====

const DesignerCanvas = {
  canvas: null,
  ctx: null,
  width: 800,
  height: 500,
  elements: [],
  selectedElement: null,
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  history: [],
  historyIndex: -1,

  // 初始化
  init() {
    this.canvas = document.getElementById('designer-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.bindEvents();
    this.render();
  },

  // 调整画布大小
  resize() {
    const wrapper = this.canvas.parentElement;
    const rect = wrapper.getBoundingClientRect();
    const scale = Math.min(rect.width / this.width, rect.height / this.height, 1);

    this.canvas.style.width = (this.width * scale) + 'px';
    this.canvas.style.height = (this.height * scale) + 'px';
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  },

  // 绑定事件
  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));

    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));

    window.addEventListener('resize', () => this.resize());
  },

  // 获取鼠标在画布上的位置
  getCanvasPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  },

  // 鼠标按下
  onMouseDown(e) {
    const pos = this.getCanvasPos(e);
    const element = this.getElementAt(pos);

    if (element) {
      this.selectElement(element);
      this.isDragging = true;
      this.dragOffset = {
        x: pos.x - element.x,
        y: pos.y - element.y
      };
    } else {
      this.selectElement(null);
    }
  },

  // 鼠标移动
  onMouseMove(e) {
    if (!this.isDragging || !this.selectedElement) return;

    const pos = this.getCanvasPos(e);
    this.selectedElement.x = pos.x - this.dragOffset.x;
    this.selectedElement.y = pos.y - this.dragOffset.y;
    this.render();
  },

  // 鼠标释放
  onMouseUp(e) {
    if (this.isDragging) {
      this.isDragging = false;
      this.saveState();
    }
  },

  // 双击
  onDoubleClick(e) {
    const pos = this.getCanvasPos(e);
    const element = this.getElementAt(pos);
    if (element) {
      this.editElement(element);
    }
  },

  // 触摸开始
  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  },

  // 触摸移动
  onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  },

  // 触摸结束
  onTouchEnd(e) {
    e.preventDefault();
    this.onMouseUp(e);
  },

  // 获取指定位置的元素
  getElementAt(pos) {
    // 从后向前遍历，优先选中上层元素
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (this.isPointInElement(pos, el)) {
        return el;
      }
    }
    return null;
  },

  // 判断点是否在元素内
  isPointInElement(pos, element) {
    const el = element;
    return pos.x >= el.x &&
           pos.x <= el.x + el.width &&
           pos.y >= el.y &&
           pos.y <= el.y + el.height;
  },

  // 选中元素
  selectElement(element) {
    this.selectedElement = element;
    this.render();
    if (element) {
      this.showSelectionHandles(element);
    }
  },

  // 显示选中手柄
  showSelectionHandles(element) {
    // 在画布上绘制选中框
    this.render();
    this.ctx.strokeStyle = '#c4956a';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(element.x, element.y, element.width, element.height);
    this.ctx.setLineDash([]);

    // 绘制手柄
    const handleSize = 8;
    const handles = [
      { x: element.x, y: element.y },
      { x: element.x + element.width, y: element.y },
      { x: element.x, y: element.y + element.height },
      { x: element.x + element.width, y: element.y + element.height }
    ];

    handles.forEach(h => {
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(h.x - handleSize/2, h.y - handleSize/2, handleSize, handleSize);
      this.ctx.strokeStyle = '#c4956a';
      this.ctx.strokeRect(h.x - handleSize/2, h.y - handleSize/2, handleSize, handleSize);
    });
  },

  // 添加元素
  addElement(element) {
    this.elements.push(element);
    this.saveState();
    this.render();
  },

  // 删除元素
  deleteElement(element) {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
      this.selectedElement = null;
      this.saveState();
      this.render();
    }
  },

  // 编辑元素
  editElement(element) {
    // 触发编辑对话框
    if (typeof DesignerTools !== 'undefined') {
      DesignerTools.showEditDialog(element);
    }
  },

  // 渲染画布
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 绘制背景
    this.drawBackground();

    // 绘制所有元素
    this.elements.forEach(el => {
      this.drawElement(el);
    });

    // 绘制选中效果
    if (this.selectedElement) {
      this.showSelectionHandles(this.selectedElement);
    }
  },

  // 绘制背景
  drawBackground() {
    // 绘制墙壁
    this.ctx.fillStyle = DesignerScene?.wallColor || '#F5F0EB';
    this.ctx.fillRect(0, 0, this.width, this.height * 0.65);

    // 绘制地板
    this.ctx.fillStyle = DesignerScene?.floorColor || '#D4C4A8';
    this.ctx.fillRect(0, this.height * 0.65, this.width, this.height * 0.35);

    // 绘制地板纹理
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.width; i += 80) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, this.height * 0.65);
      this.ctx.lineTo(i, this.height);
      this.ctx.stroke();
    }
  },

  // 绘制元素
  drawElement(element) {
    this.ctx.save();

    // 应用变换
    this.ctx.translate(element.x + element.width/2, element.y + element.height/2);
    this.ctx.rotate((element.rotation || 0) * Math.PI / 180);
    this.ctx.scale(element.scale || 1, element.scale || 1);
    this.ctx.translate(-element.width/2, -element.height/2);

    // 根据类型绘制
    switch (element.type) {
      case 'furniture':
        this.drawFurniture(element);
        break;
      case 'decor':
        this.drawDecor(element);
        break;
      case 'custom-photo':
        this.drawCustomPhoto(element);
        break;
      case 'color-block':
        this.drawColorBlock(element);
        break;
      default:
        this.drawDefault(element);
    }

    this.ctx.restore();
  },

  // 绘制家具
  drawFurniture(element) {
    // 简单绘制家具轮廓
    this.ctx.fillStyle = element.color || '#8B7355';
    this.ctx.fillRect(0, 0, element.width, element.height);

    // 绘制家具图标
    this.ctx.fillStyle = 'white';
    this.ctx.font = `${Math.min(element.width, element.height) * 0.5}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(element.icon || '🪑', element.width/2, element.height/2);
  },

  // 绘制装饰
  drawDecor(element) {
    this.ctx.fillStyle = element.color || '#E8D5C4';
    this.ctx.fillRect(0, 0, element.width, element.height);

    this.ctx.fillStyle = 'white';
    this.ctx.font = `${Math.min(element.width, element.height) * 0.5}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(element.icon || '🖼️', element.width/2, element.height/2);
  },

  // 绘制自定义照片
  drawCustomPhoto(element) {
    if (element.image) {
      this.ctx.drawImage(element.image, 0, 0, element.width, element.height);
    } else {
      this.ctx.fillStyle = '#f0f0f0';
      this.ctx.fillRect(0, 0, element.width, element.height);
      this.ctx.fillStyle = '#999';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('照片', element.width/2, element.height/2);
    }
  },

  // 绘制颜色块
  drawColorBlock(element) {
    this.ctx.fillStyle = element.color || '#E8D5C4';
    this.ctx.fillRect(0, 0, element.width, element.height);
  },

  // 默认绘制
  drawDefault(element) {
    this.ctx.fillStyle = element.color || '#ccc';
    this.ctx.fillRect(0, 0, element.width, element.height);
  },

  // 保存状态（撤销用）
  saveState() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.stringify(this.elements.map(el => ({
      ...el,
      image: el.image ? 'has-image' : null
    }))));
    this.historyIndex = this.history.length - 1;
  },

  // 撤销
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.elements = JSON.parse(this.history[this.historyIndex]);
      this.selectedElement = null;
      this.render();
    }
  },

  // 重置
  reset() {
    this.elements = [];
    this.selectedElement = null;
    this.history = [];
    this.historyIndex = -1;
    this.render();
  },

  // 导出数据
  exportData() {
    return {
      elements: this.elements.map(el => ({
        ...el,
        image: el.imageData || null
      })),
      wallColor: DesignerScene?.wallColor || '#F5F0EB',
      floorColor: DesignerScene?.floorColor || '#D4C4A8',
      lighting: DesignerScene?.lighting || 'warm'
    };
  },

  // 导入数据
  importData(data) {
    if (data.wallColor) DesignerScene.wallColor = data.wallColor;
    if (data.floorColor) DesignerScene.floorColor = data.floorColor;
    if (data.lighting) DesignerScene.lighting = data.lighting;

    this.elements = data.elements || [];
    this.selectedElement = null;
    this.render();
  }
};
