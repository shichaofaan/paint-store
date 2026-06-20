// ===== 后台认证系统 =====

const Auth = {
  // 存储 key
  STORAGE_KEY: 'admin_auth',
  CONFIG_PATH: '../data/admin-config.json',

  // 检查是否已登录
  isLoggedIn() {
    const auth = sessionStorage.getItem(this.STORAGE_KEY);
    if (!auth) return false;

    try {
      const data = JSON.parse(auth);
      // 检查是否过期（24小时）
      if (Date.now() - data.loginTime > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem(this.STORAGE_KEY);
        return false;
      }
      return data.authenticated === true;
    } catch {
      return false;
    }
  },

  // 登录
  async login(username, password) {
    try {
      const response = await fetch(this.CONFIG_PATH);
      const config = await response.json();

      if (username === config.username && password === config.password) {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          authenticated: true,
          loginTime: Date.now(),
          username: username,
        }));
        return { success: true };
      } else {
        return { success: false, error: '用户名或密码错误' };
      }
    } catch (error) {
      return { success: false, error: '验证失败，请重试' };
    }
  },

  // 登出
  logout() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    window.location.href = 'login.html';
  },

  // 检查登录状态，未登录则跳转
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  // 获取当前用户
  getCurrentUser() {
    try {
      const auth = sessionStorage.getItem(this.STORAGE_KEY);
      return auth ? JSON.parse(auth).username : null;
    } catch {
      return null;
    }
  },
};
