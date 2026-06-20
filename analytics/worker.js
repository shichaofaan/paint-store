// Cloudflare Worker - 访问统计
// 部署地址：https://your-worker.workers.dev

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 路由：记录访问
    if (request.method === 'POST' && url.pathname === '/track') {
      return this.handleTrack(request, env, corsHeaders);
    }

    // 路由：获取统计
    if (request.method === 'GET' && url.pathname === '/stats') {
      return this.handleStats(request, env, corsHeaders);
    }

    // 路由：获取概览
    if (request.method === 'GET' && url.pathname === '/overview') {
      return this.handleOverview(request, env, corsHeaders);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },

  // 记录访问
  async handleTrack(request, env, corsHeaders) {
    try {
      const data = await request.json();

      // 获取真实 IP
      const ip = request.headers.get('cf-connecting-ip') || 'unknown';

      // 生成唯一 ID
      const id = crypto.randomUUID();

      // 构建记录
      const record = {
        id,
        ip,
        page: data.page || '/',
        title: data.title || '',
        referrer: data.referrer || 'direct',
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
      const key = `visit:${record.timestamp}:${id}`;
      await env.ANALYTICS_KV.put(key, JSON.stringify(record), {
        expirationTtl: 90 * 24 * 60 * 60, // 90 天过期
      });

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

  // 获取统计数据
  async handleStats(request, env, corsHeaders) {
    try {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const page = url.searchParams.get('page') || '';

      // 列出所有记录
      const list = await env.ANALYTICS_KV.list({ prefix: 'visit:' });
      const records = [];

      for (const key of list.keys.slice(0, limit)) {
        const value = await env.ANALYTICS_KV.get(key.name, 'json');
        if (value) {
          // 如果指定了页面，进行过滤
          if (!page || value.page === page) {
            records.push(value);
          }
        }
      }

      // 按时间倒序
      records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return new Response(JSON.stringify(records), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },

  // 获取概览数据
  async handleOverview(request, env, corsHeaders) {
    try {
      // 列出所有记录
      const list = await env.ANALYTICS_KV.list({ prefix: 'visit:' });
      const records = [];

      for (const key of list.keys) {
        const value = await env.ANALYTICS_KV.get(key.name, 'json');
        if (value) records.push(value);
      }

      // 统计概览
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const thisWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();
      const thisMonth = new Date(now.setMonth(now.getMonth() - 1)).toISOString();

      // 今日访问
      const todayVisits = records.filter(r => r.timestamp.startsWith(today));

      // 本周访问
      const weekVisits = records.filter(r => r.timestamp >= thisWeek);

      // 本月访问
      const monthVisits = records.filter(r => r.timestamp >= thisMonth);

      // 独立访客（按 IP 去重）
      const uniqueIPs = new Set(records.map(r => r.ip));
      const todayUniqueIPs = new Set(todayVisits.map(r => r.ip));

      // 页面统计
      const pageStats = {};
      records.forEach(r => {
        pageStats[r.page] = (pageStats[r.page] || 0) + 1;
      });

      // 设备统计
      const deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
      records.forEach(r => {
        deviceStats[r.device] = (deviceStats[r.device] || 0) + 1;
      });

      // 浏览器统计
      const browserStats = {};
      records.forEach(r => {
        browserStats[r.browser] = (browserStats[r.browser] || 0) + 1;
      });

      // 来源统计
      const referrerStats = {};
      records.forEach(r => {
        const ref = r.referrer === 'direct' ? '直接访问' : new URL(r.referrer).hostname;
        referrerStats[ref] = (referrerStats[ref] || 0) + 1;
      });

      return new Response(JSON.stringify({
        total: records.length,
        today: todayVisits.length,
        thisWeek: weekVisits.length,
        thisMonth: monthVisits.length,
        uniqueVisitors: uniqueIPs.size,
        todayUniqueVisitors: todayUniqueIPs.size,
        pages: pageStats,
        devices: deviceStats,
        browsers: browserStats,
        referrers: referrerStats,
      }), {
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
