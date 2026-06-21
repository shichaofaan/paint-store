// ===== 分享功能 =====

const DesignerShare = {
  // GitHub 配置
  // 注意：生产环境不应暴露 token，应使用后端代理
  GITHUB_TOKEN: '', // 需要配置
  GITHUB_REPO: 'shichaofaan/paint-store',
  DESIGNS_PATH: 'designs',

  // 上传到 GitHub
  async uploadToGitHub(designData) {
    if (!this.GITHUB_TOKEN) {
      console.warn('[Share] GitHub Token 未配置');
      return { success: false, error: 'Token 未配置' };
    }

    try {
      const filePath = `${this.DESIGNS_PATH}/${designData.id}.json`;
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(designData, null, 2))));

      const response = await fetch(`https://api.github.com/repos/${this.GITHUB_REPO}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add design: ${designData.id}`,
          content: content,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          url: result.content?.download_url,
          sha: result.content?.sha
        };
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      console.error('[Share] 上传失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 从 GitHub 加载设计
  async loadFromGitHub(designId) {
    try {
      const filePath = `${this.DESIGNS_PATH}/${designId}.json`;
      const response = await fetch(`https://raw.githubusercontent.com/${this.GITHUB_REPO}/main/${filePath}`);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('设计不存在');
      }
    } catch (error) {
      console.error('[Share] 加载失败:', error);
      return null;
    }
  },

  // 生成分享链接
  generateShareLink(designId) {
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
    return `${baseUrl}design/${designId}`;
  },

  // 显示分享弹窗
  showShareModal(designData) {
    const modal = document.getElementById('share-modal');
    const linkInput = document.getElementById('share-link');
    const copyBtn = document.getElementById('share-copy');
    const closeBtn = document.getElementById('share-close');
    const statusEl = document.getElementById('share-status');

    if (!modal || !linkInput) return;

    // 生成链接
    const shareLink = this.generateShareLink(designData.id);
    linkInput.value = shareLink;

    // 复制按钮
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareLink);
        statusEl.textContent = '✓ 链接已复制到剪贴板！';
        statusEl.style.color = '#16a34a';
      } catch (error) {
        // 降级方案
        linkInput.select();
        document.execCommand('copy');
        statusEl.textContent = '✓ 链接已复制！';
        statusEl.style.color = '#16a34a';
      }
    });

    // 关闭按钮
    closeBtn?.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    modal.classList.add('active');
  },

  // 复制链接
  async copyLink(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }
};
