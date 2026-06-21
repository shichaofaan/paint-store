// ===== 装修设计器主入口 =====

const DesignerApp = {
  // 初始化
  init() {
    console.log('[Designer] 初始化...');

    // 初始化各个模块
    DesignerCanvas.init();
    DesignerTools.init();
    DesignerStorage.init();

    // 绑定快捷键
    this.bindKeyboard();

    console.log('[Designer] 初始化完成');
  },

  // 绑定键盘快捷键
  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Z: 撤销
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        DesignerCanvas.undo();
      }

      // Delete: 删除选中元素
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (DesignerCanvas.selectedElement) {
          e.preventDefault();
          DesignerCanvas.deleteElement(DesignerCanvas.selectedElement);
        }
      }

      // Escape: 取消选择
      if (e.key === 'Escape') {
        DesignerCanvas.selectElement(null);
      }
    });
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  DesignerApp.init();
});
