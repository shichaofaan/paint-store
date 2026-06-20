# 📊 访问统计功能

> 记录用户访问行为，了解网站流量和用户轨迹

---

## 功能概述

### 目标

- 记录每个页面的访问次数
- 记录访客的 IP、设备、浏览器信息
- 记录用户的页面访问轨迹
- 提供简单的数据查看后台

### 技术方案

由于网站部署在 **GitHub Pages**（纯静态），无法使用服务端存储。采用以下方案：

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   用户浏览器     │────▶│  统计脚本       │────▶│  第三方存储     │
│   (前端)        │     │  (analytics.js) │     │  (免费方案)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Google Analytics** | 功能强大、免费、无需服务器 | 需要 Google 账号、隐私争议 | ⭐⭐⭐ |
| **Umami** | 开源、隐私友好、可自托管 | 需要额外部署 | ⭐⭐⭐⭐ |
| **Cloudflare Workers** | 免费、无服务器、自定义 | 需要 Cloudflare 账号 | ⭐⭐⭐⭐ |
| **localStorage + 定期导出** | 完全自主、无依赖 | 只能记录本机、无法汇总 | ⭐⭐ |
| **Supabase/Firebase** | 免费额度大、实时数据库 | 配置复杂 | ⭐⭐⭐ |

---

## 推荐方案：Cloudflare Workers + KV

### 为什么选择这个方案

1. **完全免费**：每天 10 万次请求，1GB KV 存储
2. **无需服务器**：使用 Cloudflare Workers 无服务器函数
3. **自定义**：可以完全控制数据格式和存储
4. **隐私友好**：数据存储在自己的 Cloudflare 账号

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    用户浏览器                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  analytics.js                                   │   │
│  │                                                 │   │
│  │  1. 收集访问信息                                │   │
│  │     - 页面 URL                                  │   │
│  │     - 访问时间                                  │   │
│  │     - 设备信息                                  │   │
│  │     - 来源页面                                  │   │
│  │                                                 │   │
│  │  2. 发送到 Cloudflare Worker                    │   │
│  │     POST https://your-worker.workers.dev/track  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Worker                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  worker.js                                      │   │
│  │                                                 │   │
│  │  1. 接收请求                                    │   │
│  │  2. 获取 IP 地址                                │   │
│  │  3. 存储到 KV                                   │   │
│  │  4. 返回成功响应                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  KV 存储                                        │   │
│  │                                                 │   │
│  │  Key: analytics:{timestamp}:{id}                │   │
│  │  Value: {                                       │   │
│  │    ip: "xxx.xxx.xxx.xxx",                       │   │
│  │    page: "/products.html",                      │   │
│  │    userAgent: "...",                            │   │
│  │    referrer: "...",                             │   │
│  │    timestamp: "2026-06-20T12:00:00Z"            │   │
│  │  }                                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 数据字段

### 记录的字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `ip` | string | 访客 IP 地址 | `123.45.67.89` |
| `page` | string | 访问页面 | `/products.html` |
| `title` | string | 页面标题 | `商品展示 - 油漆店` |
| `referrer` | string | 来源页面 | `https://google.com` |
| `userAgent` | string | 浏览器信息 | `Mozilla/5.0...` |
| `device` | string | 设备类型 | `desktop` / `mobile` / `tablet` |
| `browser` | string | 浏览器 | `Chrome` / `Safari` / `Firefox` |
| `os` | string | 操作系统 | `Windows` / `macOS` / `iOS` |
| `screen` | string | 屏幕尺寸 | `1920x1080` |
| `language` | string | 浏览器语言 | `zh-CN` |
| `timestamp` | string | 访问时间 | `2026-06-20T12:00:00Z` |
| `sessionId` | string | 会话 ID | `abc123` |

### 数据示例

```json
{
  "ip": "123.45.67.89",
  "page": "/products.html",
  "title": "商品展示 - 油漆店",
  "referrer": "https://www.google.com/",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "device": "desktop",
  "browser": "Chrome",
  "os": "Windows",
  "screen": "1920x1080",
  "language": "zh-CN",
  "timestamp": "2026-06-20T12:00:00.000Z",
  "sessionId": "sess_abc123xyz"
}
```

---

## 实现步骤

### 步骤 1：创建 Cloudflare Worker

1. 注册 [Cloudflare](https://cloudflare.com) 账号
2. 进入 **Workers & Pages**
3. 创建新的 Worker
4. 编写 Worker 代码（见下方）

### 步骤 2：创建 KV 命名空间

1. 进入 **Workers & Pages** → **KV**
2. 创建命名空间 `ANALYTICS_KV`
3. 绑定到 Worker

### 步骤 3：编写 Worker 代码

```javascript
// worker.js

export default {
  async fetch(request, env) {
    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 只接受 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    try {
      // 获取请求数据
      const data = await request.json();
      
      // 获取 IP
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';
      
      // 生成唯一 ID
      const id = crypto.randomUUID();
      
      // 构建记录
      const record = {
        id,
        ip,
        page: data.page || '/',
        title: data.title || '',
        referrer: data.referrer || '',
        userAgent: data.userAgent || '',
        device: data.device || 'unknown',
        browser: data.browser || 'unknown',
        os: data.os || 'unknown',
        screen: data.screen || '',
        language: data.language || '',
        timestamp: new Date().toISOString(),
        sessionId: data.sessionId || '',
      };

      // 存储到 KV
      const key = `analytics:${record.timestamp}:${id}`;
      await env.ANALYTICS_KV.put(key, JSON.stringify(record), {
        expirationTtl: 90 * 24 * 60 * 60, // 90 天过期
      });

      // 返回成功
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
```

### 步骤 4：前端集成

在 `assets/js/` 目录创建 `analytics.js`：

```javascript
// analytics.js

const Analytics = {
  // Worker 地址（部署后替换）
  ENDPOINT: 'https://your-worker.workers.dev/track',
  
  // 生成会话 ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
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
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Other';
  },

  // 获取操作系统
  getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return 'Other';
  },

  // 发送统计数据
  async track() {
    try {
      const data = {
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        device: this.getDevice(),
        browser: this.getBrowser(),
        os: this.getOS(),
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        sessionId: this.getSessionId(),
      };

      // 使用 sendBeacon（不阻塞页面）
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.ENDPOINT, JSON.stringify(data));
      } else {
        // 降级使用 fetch
        fetch(this.ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(data),
          keepalive: true,
        });
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  },
};

// 页面加载时自动执行
document.addEventListener('DOMContentLoaded', () => {
  Analytics.track();
});
```

### 步骤 5：在 HTML 中引入

在每个页面的 `<head>` 中添加：

```html
<script src="assets/js/analytics.js" defer></script>
```

---

## 数据查看

### 方案 1：Cloudflare Dashboard

1. 进入 **Workers & Pages** → **KV**
2. 查看 `ANALYTICS_KV` 命名空间
3. 可以浏览所有存储的记录

### 方案 2：创建查看页面

创建 `admin/analytics.html`，通过 Worker API 查询数据：

```javascript
// Worker 中添加查询接口
if (request.method === 'GET' && url.pathname === '/stats') {
  // 查询最近 100 条记录
  const list = await env.ANALYTICS_KV.list({ prefix: 'analytics:' });
  const records = [];
  
  for (const key of list.keys.slice(0, 100)) {
    const value = await env.ANALYTICS_KV.get(key.name, 'json');
    if (value) records.push(value);
  }
  
  return new Response(JSON.stringify(records), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 方案 3：导出为 JSON

定期从 KV 导出数据，保存为 JSON 文件分析。

---

## 隐私考虑

### 数据匿名化

```javascript
// 对 IP 进行匿名化处理
function anonymizeIP(ip) {
  const parts = ip.split('.');
  parts[3] = '0'; // 最后一位设为 0
  return parts.join('.');
}
```

### 用户同意

在网站底部添加隐私提示：

```html
<div id="cookie-banner">
  本站使用统计分析来改善服务。
  <button onclick="acceptAnalytics()">同意</button>
</div>
```

### 数据保留

- KV 中的数据设置 90 天过期
- 定期清理旧数据

---

## 文件结构

```
analytics/
├── README.md              # 本文档
├── worker.js              # Cloudflare Worker 代码
└── analytics.js           # 前端统计脚本
```

---

## 下一步

1. [ ] 注册 Cloudflare 账号
2. [ ] 创建 Worker 和 KV 命名空间
3. [ ] 部署 Worker
4. [ ] 创建 analytics.js
5. [ ] 在 HTML 中引入
6. [ ] 创建数据查看页面
7. [ ] 测试数据收集

---

*文档创建时间：2026-06-20*
