// ===== 访问统计脚本 =====
// 自动记录用户访问行为

const Analytics = {
  // ⚠️ 部署 Worker 后替换为你的地址
  ENDPOINT: 'https://paint-store-analytics.573877411.workers.dev/track',

  // 生成会话 ID（同一浏览器标签页内唯一）
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  },

  // 获取设备类型
  getDevice() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  },

  // 获取浏览器
  getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Other';
  },

  // 获取操作系统
  getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10')) return 'Windows 10';
    if (ua.includes('Windows NT 11')) return 'Windows 11';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone OS') || ua.includes('iPad')) return 'iOS';
    return 'Other';
  },

  // 发送统计数据
  async track() {
    try {
      const data = {
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        device: this.getDevice(),
        browser: this.getBrowser(),
        os: this.getOS(),
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || 'unknown',
        sessionId: this.getSessionId(),
      };

      // 使用 sendBeacon（不阻塞页面，页面关闭也能发送）
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(this.ENDPOINT, blob);
      } else {
        // 降级使用 fetch
        fetch(this.ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        });
      }

      console.log('[Analytics] 记录访问:', data.page);
    } catch (error) {
      console.error('[Analytics] 错误:', error);
    }
  },
};

// 页面加载时自动执行
document.addEventListener('DOMContentLoaded', () => {
  Analytics.track();
});
