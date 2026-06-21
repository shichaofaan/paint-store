// ===== 工具栏和侧边栏管理 =====

const DesignerTools = {
  currentTool: 'select',
  currentTab: '素材',

  // 初始化
  init() {
    this.bindToolbar();
    this.bindSidebar();
    this.showTab('素材');
  },

  // 绑定工具栏
  bindToolbar() {
    // 选择工具
    document.getElementById('btn-select')?.addEventListener('click', () => {
      this.setTool('select');
    });

    // 墙色工具
    document.getElementById('btn-wall-color')?.addEventListener('click', () => {
      this.setTool('wall-color');
      this.showTab('颜色');
    });

    // 家具工具
    document.getElementById('btn-furniture')?.addEventListener('click', () => {
      this.setTool('furniture');
      this.showTab('素材');
      this.showFurnitureList();
    });

    // 装饰工具
    document.getElementById('btn-decor')?.addEventListener('click', () => {
      this.setTool('decor');
      this.showTab('素材');
      this.showDecorList();
    });

    // 灯光工具
    document.getElementById('btn-lighting')?.addEventListener('click', () => {
      this.setTool('lighting');
      this.showTab('灯光');
      this.showLightingList();
    });

    // 场景选择
    document.getElementById('btn-scene')?.addEventListener('click', () => {
      this.showTab('场景');
      this.showSceneList();
    });

    // 拍照
    document.getElementById('btn-camera')?.addEventListener('click', () => {
      DesignerCamera.start();
    });

    // 撤销
    document.getElementById('btn-undo')?.addEventListener('click', () => {
      DesignerCanvas.undo();
    });

    // 重置
    document.getElementById('btn-reset')?.addEventListener('click', () => {
      if (confirm('确定要重置设计吗？所有内容将被清除。')) {
        DesignerCanvas.reset();
        DesignerStorage.clearDraft();
      }
    });

    // 保存
    document.getElementById('btn-save')?.addEventListener('click', () => {
      this.saveDesign();
    });

    // 分享
    document.getElementById('btn-share')?.addEventListener('click', () => {
      this.shareDesign();
    });
  },

  // 绑定侧边栏
  bindSidebar() {
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.showTab(tab.dataset.tab);
      });
    });
  },

  // 设置当前工具
  setTool(tool) {
    this.currentTool = tool;

    // 更新按钮状态
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const btnId = `btn-${tool.replace('-', '-')}`;
    document.getElementById(btnId)?.classList.add('active');

    // 更新光标
    const canvas = document.getElementById('designer-canvas');
    if (canvas) {
      switch (tool) {
        case 'select':
          canvas.style.cursor = 'default';
          break;
        case 'wall-color':
          canvas.style.cursor = 'crosshair';
          break;
        default:
          canvas.style.cursor = 'crosshair';
      }
    }
  },

  // 显示标签页
  showTab(tabName) {
    this.currentTab = tabName;

    // 更新标签状态
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // 显示对应内容
    switch (tabName) {
      case '素材':
        this.showFurnitureList();
        break;
      case '颜色':
        this.showColorPicker();
        break;
      case '场景':
        this.showSceneList();
        break;
      case '灯光':
        this.showLightingList();
        break;
    }
  },

  // 显示家具列表
  showFurnitureList() {
    const container = document.getElementById('sidebar-content');
    if (!container) return;

    const furniture = DesignerElements.getFurnitureList();

    container.innerHTML = `
      <h3 style="font-size:0.8125rem;font-weight:500;margin-bottom:1rem;">家具素材</h3>
      <div class="素材-grid">
        ${furniture.map(item => `
          <div class="素材-item" data-id="${item.id}" draggable="true">
            <div class="素材-item-preview">${item.icon}</div>
            <div class="素材-item-name">${item.name}</div>
          </div>
        `).join('')}
      </div>
    `;

    // 绑定拖拽事件
    container.querySelectorAll('.素材-item').forEach(item => {
      item.addEventListener('click', () => {
        const element = DesignerElements.createElement(item.dataset.id, 200, 200);
        if (element) {
          DesignerCanvas.addElement(element);
        }
      });
    });
  },

  // 显示装饰列表
  showDecorList() {
    const container = document.getElementById('sidebar-content');
    if (!container) return;

    const decor = DesignerElements.getDecorList();

    container.innerHTML = `
      <h3 style="font-size:0.8125rem;font-weight:500;margin-bottom:1rem;">装饰素材</h3>
      <div class="素材-grid">
        ${decor.map(item => `
          <div class="素材-item" data-id="${item.id}" draggable="true">
            <div class="素材-item-preview">${item.icon}</div>
            <div class="素材-item-name">${item.name}</div>
          </div>
        `).join('')}
      </div>
    `;

    // 绑定点击事件
    container.querySelectorAll('.素材-item').forEach(item => {
      item.addEventListener('click', () => {
        const element = DesignerElements.createElement(item.dataset.id, 150, 100);
        if (element) {
          DesignerCanvas.addElement(element);
        }
      });
    });
  },

  // 显示颜色选择器
  showColorPicker() {
    const container = document.getElementById('sidebar-content');
    if (!container) return;

    container.innerHTML = `
      <h3 style="font-size:0.8125rem;font-weight:500;margin-bottom:1rem;">墙面颜色</h3>
      <div class="color-picker-grid">
        ${DesignerScene.wallColors.map(c => `
          <div class="color-picker-swatch ${c.color === DesignerScene.wallColor ? 'active' : ''}"
               style="background:${c.color};"
               data-color="${c.color}"
               title="${c.name}">
          </div>
        `).join('')}
      </div>
      <div class="color-picker-custom">
        <label style="font-size:0.75rem;color:var(--designer-text-light);display:block;margin-bottom:0.5rem;">自定义颜色</label>
        <input type="color" id="custom-wall-color" value="${DesignerScene.wallColor}">
      </div>

      <h3 style="font-size:0.8125rem;font-weight:500;margin-top:1.5rem;margin-bottom:1rem;">地板颜色</h3>
      <div class="color-picker-grid">
        ${DesignerScene.floorColors.map(c => `
          <div class="color-picker-swatch ${c.color === DesignerScene.floorColor ? 'active' : ''}"
               style="background:${c.color};"
               data-floor-color="${c.color}"
               title="${c.name}">
          </div>
        `).join('')}
      </div>
    `;

    // 绑定墙色点击
    container.querySelectorAll('.color-picker-swatch[data-color]').forEach(swatch => {
      swatch.addEventListener('click', () => {
        DesignerScene.setWallColor(swatch.dataset.color);
        container.querySelectorAll('.color-picker-swatch[data-color]').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
    });

    // 绑定地板颜色点击
    container.querySelectorAll('.color-picker-swatch[data-floor-color]').forEach(swatch => {
      swatch.addEventListener('click', () => {
        DesignerScene.setFloorColor(swatch.dataset.floorColor);
        container.querySelectorAll('.color-picker-swatch[data-floor-color]').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
    });

    // 绑定自定义颜色
    document.getElementById('custom-wall-color')?.addEventListener('input', (e) => {
      DesignerScene.setWallColor(e.target.value);
    });
  },

  // 显示场景列表
  showSceneList() {
    const container = document.getElementById('sidebar-content');
    if (!container) return;

    const scenes = DesignerScene.getSceneList();

    container.innerHTML = `
      <h3 style="font-size:0.8125rem;font-weight:500;margin-bottom:1rem;">选择场景</h3>
      <div class="scene-selector">
        ${scenes.map(scene => `
          <div class="scene-option ${scene.id === DesignerScene.currentScene ? 'active' : ''}"
               data-scene="${scene.id}">
            <div>
              <div style="font-size:2rem;margin-bottom:0.5rem;">${scene.icon}</div>
              <div style="font-size:0.75rem;">${scene.name}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // 绑定场景点击
    container.querySelectorAll('.scene-option').forEach(option => {
      option.addEventListener('click', () => {
        DesignerScene.switchScene(option.dataset.scene);
        container.querySelectorAll('.scene-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
      });
    });
  },

  // 显示灯光列表
  showLightingList() {
    const container = document.getElementById('sidebar-content');
    if (!container) return;

    const lights = DesignerElements.getLightingList();

    container.innerHTML = `
      <h3 style="font-size:0.8125rem;font-weight:500;margin-bottom:1rem;">灯光效果</h3>
      <div class="scene-selector">
        ${lights.map(light => `
          <div class="scene-option ${light.id === DesignerScene.lighting ? 'active' : ''}"
               data-lighting="${light.id}">
            <div>
              <div style="font-size:2rem;margin-bottom:0.5rem;">${light.icon}</div>
              <div style="font-size:0.75rem;">${light.name}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // 绑定灯光点击
    container.querySelectorAll('.scene-option').forEach(option => {
      option.addEventListener('click', () => {
        DesignerScene.setLighting(option.dataset.lighting);
        container.querySelectorAll('.scene-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
      });
    });
  },

  // 显示编辑对话框
  showEditDialog(element) {
    const action = prompt(`编辑 ${element.name}\n1. 删除\n2. 旋转\n3. 缩放\n请输入选项编号:`);

    switch (action) {
      case '1':
        DesignerCanvas.deleteElement(element);
        break;
      case '2':
        const angle = prompt('输入旋转角度 (0-360):', element.rotation || 0);
        if (angle !== null) {
          element.rotation = parseInt(angle) || 0;
          DesignerCanvas.render();
        }
        break;
      case '3':
        const scale = prompt('输入缩放比例 (0.5-2):', element.scale || 1);
        if (scale !== null) {
          element.scale = parseFloat(scale) || 1;
          DesignerCanvas.render();
        }
        break;
    }
  },

  // 保存设计
  async saveDesign() {
    const data = {
      version: '1.0',
      id: `design_${Date.now()}`,
      createdAt: new Date().toISOString(),
      scene: DesignerScene.exportData(),
      elements: DesignerCanvas.exportData().elements,
      metadata: {
        title: prompt('请输入设计名称:', '我的设计') || '未命名设计',
        author: 'anonymous'
      }
    };

    // 保存到本地
    DesignerStorage.saveDraft(data);

    // 尝试上传到 GitHub
    try {
      const result = await DesignerShare.uploadToGitHub(data);
      if (result.success) {
        alert('设计已保存并上传！');
      } else {
        alert('设计已保存到本地！');
      }
    } catch (error) {
      alert('设计已保存到本地！');
    }
  },

  // 分享设计
  async shareDesign() {
    const data = {
      version: '1.0',
      id: `design_${Date.now()}`,
      createdAt: new Date().toISOString(),
      scene: DesignerScene.exportData(),
      elements: DesignerCanvas.exportData().elements,
      metadata: {
        title: '分享的设计',
        author: 'anonymous'
      }
    };

    DesignerShare.showShareModal(data);
  }
};
