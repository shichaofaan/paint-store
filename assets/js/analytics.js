// ===== 高级访问统计脚本 =====

const Analytics = {
  // ⚠️ Worker 地址
  ENDPOINT: 'https://paint-store-analytics.573877411.workers.dev',

  // ===== 访客 ID（永久存储）=====
  getVisitorId() {
    let visitorId = localStorage.getItem('analytics_visitor_id');
    if (!visitorId) {
      visitorId = 'v_' + this.generateId();
      localStorage.setItem('analytics_visitor_id', visitorId);
      localStorage.setItem('analytics_first_visit', new Date().toISOString());
      this._isNewVisitor = true;
    } else {
      this._isNewVisitor = false;
    }
    return visitorId;
  },

  // ===== 会话 ID =====
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = 's_' + this.generateId();
      sessionStorage.setItem('analytics_session', sessionId);
      // 记录会话开始时间
      sessionStorage.setItem('analytics_session_start', new Date().toISOString());
      // 初始化页面流
      sessionStorage.setItem('analytics_page_flow', JSON.stringify([]));
    }
    return sessionId;
  },

  // ===== 生成 ID =====
  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  },

  // ===== 设备检测 =====
  getDevice() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  },

  // ===== 浏览器检测 =====
  getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Other';
  },

  // ===== 系统检测 =====
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

  // ===== 来源解析 =====
  getReferrer() {
    const ref = document.referrer;
    if (!ref) return 'direct';
    try {
      const url = new URL(ref);
      if (url.hostname === window.location.hostname) return 'internal';
      return ref;
    } catch {
      return 'direct';
    }
  },

  // ===== 记录页面访问 =====
  async track() {
    try {
      const visitorId = this.getVisitorId();
      const sessionId = this.getSessionId();

      const data = {
        visitorId,
        isNewVisitor: this._isNewVisitor,
        sessionId,
        page: window.location.pathname,
        title: document.title,
        referrer: this.getReferrer(),
        userAgent: navigator.userAgent,
        device: this.getDevice(),
        browser: this.getBrowser(),
        os: this.getOS(),
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || 'unknown',
      };

      // 更新页面流
      const flow = JSON.parse(sessionStorage.getItem('analytics_page_flow') || '[]');
      flow.push({
        page: data.page,
        title: data.title,
        time: new Date().toISOString(),
      });
      sessionStorage.setItem('analytics_page_flow', JSON.stringify(flow));

      // 发送数据
      await fetch(`${this.ENDPOINT}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'cors',
      });

      console.log('[Analytics] 记录访问:', data.page);
    } catch (error) {
      console.error('[Analytics] 错误:', error);
    }
  },

  // ===== 记录自定义事件 =====
  async trackEvent(eventName, category = 'general', label = '') {
    try {
      const data = {
        visitorId: this.getVisitorId(),
        sessionId: this.getSessionId(),
        eventName,
        eventCategory: category,
        eventLabel: label,
        page: window.location.pathname,
      };

      await fetch(`${this.ENDPOINT}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'cors',
      });

      console.log('[Analytics] 记录事件:', eventName);
    } catch (error) {
      console.error('[Analytics] 事件错误:', error);
    }
  },

  // ===== 会话结束 =====
  async endSession() {
    try {
      const sessionId = sessionStorage.getItem('analytics_session');
      if (!sessionId) return;

      await fetch(`${this.ENDPOINT}/session/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        mode: 'cors',
        keepalive: true,
      });
    } catch (error) {
      console.error('[Analytics] 会话结束错误:', error);
    }
  },

  // ===== 初始化事件埋点 =====
  initEventTracking() {
    // 电话按钮点击
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
      el.addEventListener('click', () => {
        this.trackEvent('phone_click', 'contact', el.href);
      });
    });

    // 微信复制
    document.querySelectorAll('[data-action="copy-wechat"]').forEach(el => {
      el.addEventListener('click', () => {
        this.trackEvent('wechat_copy', 'contact', el.textContent);
      });
    });

    // 联系表单提交
    document.querySelectorAll('form').forEach(el => {
      el.addEventListener('submit', () => {
        this.trackEvent('form_submit', 'contact', window.location.pathname);
      });
    });

    // 联系胶囊点击
    document.querySelectorAll('.contact-capsule').forEach(el => {
      el.addEventListener('click', () => {
        this.trackEvent('capsule_click', 'navigation', 'contact');
      });
    });

    // 商品卡片点击
    document.querySelectorAll('.product-card').forEach(el => {
      el.addEventListener('click', () => {
        this.trackEvent('product_click', 'product', el.querySelector('.product-card-title')?.textContent || '');
      });
    });

    // 色卡点击
    document.querySelectorAll('.color-swatch').forEach(el => {
      el.addEventListener('click', () => {
        this.trackEvent('color_click', 'interaction', el.querySelector('.color-name')?.textContent || '');
      });
    });

    // 分类点击
    document.querySelectorAll('.category-card').forEach(el => {
      el.addEventListener('click', () => {
        this.trackEvent('category_click', 'navigation', el.querySelector('.category-card-title')?.textContent || '');
      });
    });
  },
};

// ===== 自动执行 =====
document.addEventListener('DOMContentLoaded', () => {
  Analytics.track();
  Analytics.initEventTracking();
});

// ===== 页面离开时结束会话 =====
window.addEventListener('beforeunload', () => {
  Analytics.endSession();
});
