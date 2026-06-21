// ===== 本地存储管理 =====

const DesignerStorage = {
  DRAFT_KEY: 'designer_draft',
  AUTO_SAVE_DELAY: 500,
  autoSaveTimer: null,

  // 初始化
  init() {
    // 加载草稿
    this.loadDraft();

    // 监听变化，自动保存
    this.setupAutoSave();
  },

  // 设置自动保存
  setupAutoSave() {
    // 每次画布变化时触发自动保存
    const originalRender = DesignerCanvas.render.bind(DesignerCanvas);
    DesignerCanvas.render = () => {
      originalRender();
      this.scheduleAutoSave();
    };
  },

  // 计划自动保存
  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.saveDraft();
    }, this.AUTO_SAVE_DELAY);
  },

  // 保存草稿
  saveDraft(data) {
    try {
      const draftData = data || {
        version: '1.0',
        id: 'draft',
        updatedAt: new Date().toISOString(),
        scene: DesignerScene.exportData(),
        elements: DesignerCanvas.exportData().elements.map(el => ({
          ...el,
          image: null // 不存储图片对象
        }))
      };

      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draftData));
      console.log('[Storage] 草稿已保存');
    } catch (error) {
      console.error('[Storage] 保存草稿失败:', error);
    }
  },

  // 加载草稿
  loadDraft() {
    try {
      const draftJson = localStorage.getItem(this.DRAFT_KEY);
      if (!draftJson) return false;

      const draft = JSON.parse(draftJson);

      // 恢复场景
      if (draft.scene) {
        DesignerScene.importData(draft.scene);
      }

      // 恢复元素
      if (draft.elements) {
        const elements = draft.elements.map(el => {
          // 恢复图片
          if (el.imageData) {
            const img = new Image();
            img.src = el.imageData;
            el.image = img;
          }
          return el;
        });

        DesignerCanvas.elements = elements;
        DesignerCanvas.render();
      }

      console.log('[Storage] 草稿已加载');
      return true;
    } catch (error) {
      console.error('[Storage] 加载草稿失败:', error);
      return false;
    }
  },

  // 清除草稿
  clearDraft() {
    localStorage.removeItem(this.DRAFT_KEY);
    console.log('[Storage] 草稿已清除');
  },

  // 保存设计历史
  saveToHistory(designData) {
    try {
      const history = this.getHistory();
      history.unshift(designData);

      // 只保留最近 10 个设计
      if (history.length > 10) {
        history.pop();
      }

      localStorage.setItem('designer_history', JSON.stringify(history));
    } catch (error) {
      console.error('[Storage] 保存历史失败:', error);
    }
  },

  // 获取设计历史
  getHistory() {
    try {
      const historyJson = localStorage.getItem('designer_history');
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      return [];
    }
  },

  // 导出设计为 JSON 文件
  exportToFile(designData) {
    const dataStr = JSON.stringify(designData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${designData.id || 'design'}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
};
