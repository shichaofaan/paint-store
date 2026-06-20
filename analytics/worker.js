// Cloudflare Worker - 高级访问统计
// 部署地址：https://paint-store-analytics.573877411.workers.dev

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const routes = {
      'POST /track': () => this.handleTrack(request, env, corsHeaders),
      'POST /event': () => this.handleEvent(request, env, corsHeaders),
      'POST /session/end': () => this.handleSessionEnd(request, env, corsHeaders),
      'GET /overview': () => this.handleOverview(request, env, corsHeaders),
      'GET /visitors': () => this.handleVisitors(request, env, corsHeaders),
      'GET /pages': () => this.handlePages(request, env, corsHeaders),
      'GET /flow': () => this.handleFlow(request, env, corsHeaders),
      'GET /geo': () => this.handleGeo(request, env, corsHeaders),
      'GET /hourly': () => this.handleHourly(request, env, corsHeaders),
      'GET /trend': () => this.handleTrend(request, env, corsHeaders),
      'GET /events': () => this.handleEvents(request, env, corsHeaders),
      'GET /export': () => this.handleExport(request, env, corsHeaders),
    };

    const routeKey = `${request.method} ${url.pathname}`;
    const handler = routes[routeKey];

    if (handler) {
      return handler();
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },

  // ===== 记录页面访问 =====
  async handleTrack(request, env, corsHeaders) {
    try {
      const data = await request.json();
      const cf = request.cf || {};

      const record = {
        type: 'pageview',
        id: crypto.randomUUID(),
        visitorId: data.visitorId || 'anonymous',
        isNewVisitor: data.isNewVisitor || false,
        sessionId: data.sessionId || '',
        page: data.page || '/',
        title: data.title || '',
        referrer: data.referrer || 'direct',
        device: data.device || 'unknown',
        browser: data.browser || 'unknown',
        os: data.os || 'unknown',
        screen: data.screen || '',
        language: data.language || '',
        country: cf.country || 'unknown',
        city: cf.city || 'unknown',
        timezone: cf.timezone || '',
        timestamp: new Date().toISOString(),
      };

      // 存储访问记录
      const key = `pv:${record.timestamp}:${record.id}`;
      await env.ANALYTICS_KV.put(key, JSON.stringify(record), {
        expirationTtl: 90 * 24 * 60 * 60,
      });

      // 更新访客记录
      const visitorKey = `visitor:${record.visitorId}`;
      const existingVisitor = await env.ANALYTICS_KV.get(visitorKey, 'json');
      const visitorData = existingVisitor || {
        visitorId: record.visitorId,
        firstVisit: record.timestamp,
        visitCount: 0,
        countries: [],
      };
      visitorData.lastVisit = record.timestamp;
      visitorData.visitCount += 1;
      visitorData.lastCountry = record.country;
      visitorData.lastCity = record.city;
      if (!visitorData.countries.includes(record.country)) {
        visitorData.countries.push(record.country);
      }
      await env.ANALYTICS_KV.put(visitorKey, JSON.stringify(visitorData), {
        expirationTtl: 90 * 24 * 60 * 60,
      });

      // 更新会话页面流
      const sessionKey = `session:${record.sessionId}`;
      const existingSession = await env.ANALYTICS_KV.get(sessionKey, 'json');
      const sessionData = existingSession || {
        sessionId: record.sessionId,
        visitorId: record.visitorId,
        startTime: record.timestamp,
        pages: [],
        country: record.country,
        device: record.device,
      };
      sessionData.pages.push({
        page: record.page,
        title: record.title,
        time: record.timestamp,
      });
      sessionData.endTime = record.timestamp;
      sessionData.duration = new Date(record.timestamp) - new Date(sessionData.startTime);
      await env.ANALYTICS_KV.put(sessionKey, JSON.stringify(sessionData), {
        expirationTtl: 90 * 24 * 60 * 60,
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

  // ===== 记录自定义事件 =====
  async handleEvent(request, env, corsHeaders) {
    try {
      const data = await request.json();
      const cf = request.cf || {};

      const record = {
        type: 'event',
        id: crypto.randomUUID(),
        visitorId: data.visitorId || 'anonymous',
        sessionId: data.sessionId || '',
        eventName: data.eventName || 'unknown',
        eventCategory: data.eventCategory || 'general',
        eventLabel: data.eventLabel || '',
        page: data.page || '/',
        country: cf.country || 'unknown',
        city: cf.city || 'unknown',
        timestamp: new Date().toISOString(),
      };

      const key = `evt:${record.eventName}:${record.timestamp}:${record.id}`;
      await env.ANALYTICS_KV.put(key, JSON.stringify(record), {
        expirationTtl: 90 * 24 * 60 * 60,
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

  // ===== 记录会话结束 =====
  async handleSessionEnd(request, env, corsHeaders) {
    try {
      const data = await request.json();
      const sessionKey = `session:${data.sessionId}`;
      const session = await env.ANALYTICS_KV.get(sessionKey, 'json');

      if (session) {
        session.endTime = new Date().toISOString();
        session.duration = new Date(session.endTime) - new Date(session.startTime);
        session.pageCount = session.pages.length;
        await env.ANALYTICS_KV.put(sessionKey, JSON.stringify(session), {
          expirationTtl: 90 * 24 * 60 * 60,
        });
      }

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

  // ===== 概览数据 =====
  async handleOverview(request, env, corsHeaders) {
    try {
      const allRecords = await this.getAllRecords(env, 'pv:');
      const allSessions = await this.getAllRecords(env, 'session:');
      const allVisitors = await this.getAllRecords(env, 'visitor:');
      const allEvents = await this.getAllRecords(env, 'evt:');

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

      const todayVisits = allRecords.filter(r => r.timestamp.startsWith(today));
      const weekVisits = allRecords.filter(r => r.timestamp >= weekAgo);
      const monthVisits = allRecords.filter(r => r.timestamp >= monthAgo);

      // 新老访客
      const todayVisitors = todayVisits.map(r => r.visitorId);
      const uniqueTodayVisitors = [...new Set(todayVisitors)];
      const newVisitorsToday = todayVisits.filter(r => r.isNewVisitor).length;
      const returningVisitorsToday = uniqueTodayVisitors.length - newVisitorsToday;

      // 会话统计
      const todaySessions = allSessions.filter(s => s.startTime.startsWith(today));
      const avgDuration = todaySessions.length > 0
        ? todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / todaySessions.length
        : 0;
      const avgPages = todaySessions.length > 0
        ? todaySessions.reduce((sum, s) => sum + (s.pages?.length || 0), 0) / todaySessions.length
        : 0;
      const bounceSessions = todaySessions.filter(s => s.pages?.length === 1).length;
      const bounceRate = todaySessions.length > 0 ? (bounceSessions / todaySessions.length) * 100 : 0;

      // 回访率
      const totalUniqueVisitors = allVisitors.length;
      const returningVisitors = allVisitors.filter(v => v.visitCount > 1).length;
      const returnRate = totalUniqueVisitors > 0 ? (returningVisitors / totalUniqueVisitors) * 100 : 0;

      return new Response(JSON.stringify({
        total: allRecords.length,
        today: todayVisits.length,
        thisWeek: weekVisits.length,
        thisMonth: monthVisits.length,
        uniqueVisitors: allVisitors.length,
        newVisitorsToday,
        returningVisitorsToday,
        returnRate: Math.round(returnRate * 10) / 10,
        avgDuration: Math.round(avgDuration / 1000),
        avgPages: Math.round(avgPages * 10) / 10,
        bounceRate: Math.round(bounceRate * 10) / 10,
        totalEvents: allEvents.length,
        totalSessions: allSessions.length,
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

  // ===== 访客分析 =====
  async handleVisitors(request, env, corsHeaders) {
    try {
      const allVisitors = await this.getAllRecords(env, 'visitor:');
      const allRecords = await this.getAllRecords(env, 'pv:');

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

      // 每日新老访客
      const dailyVisitors = {};
      allRecords.forEach(r => {
        const day = r.timestamp.split('T')[0];
        if (!dailyVisitors[day]) {
          dailyVisitors[day] = { new: 0, returning: 0, total: 0 };
        }
        dailyVisitors[day].total++;
        if (r.isNewVisitor) {
          dailyVisitors[day].new++;
        } else {
          dailyVisitors[day].returning++;
        }
      });

      // 访客活跃度分布
      const activityDistribution = { '1次': 0, '2-5次': 0, '6-10次': 0, '10次以上': 0 };
      allVisitors.forEach(v => {
        if (v.visitCount === 1) activityDistribution['1次']++;
        else if (v.visitCount <= 5) activityDistribution['2-5次']++;
        else if (v.visitCount <= 10) activityDistribution['6-10次']++;
        else activityDistribution['10次以上']++;
      });

      return new Response(JSON.stringify({
        daily: dailyVisitors,
        activity: activityDistribution,
        total: allVisitors.length,
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

  // ===== 页面分析 =====
  async handlePages(request, env, corsHeaders) {
    try {
      const allRecords = await this.getAllRecords(env, 'pv:');
      const allSessions = await this.getAllRecords(env, 'session:');

      // 页面访问量
      const pageViews = {};
      allRecords.forEach(r => {
        pageViews[r.page] = (pageViews[r.page] || 0) + 1;
      });

      // 页面跳出率
      const pageBounce = {};
      const pageEntry = {};
      allSessions.forEach(s => {
        if (s.pages && s.pages.length > 0) {
          const firstPage = s.pages[0].page;
          pageEntry[firstPage] = (pageEntry[firstPage] || 0) + 1;
          if (s.pages.length === 1) {
            pageBounce[firstPage] = (pageBounce[firstPage] || 0) + 1;
          }
        }
      });

      const pageStats = {};
      Object.keys(pageViews).forEach(page => {
        pageStats[page] = {
          views: pageViews[page],
          entries: pageEntry[page] || 0,
          bounces: pageBounce[page] || 0,
          bounceRate: pageEntry[page] > 0
            ? Math.round((pageBounce[page] / pageEntry[page]) * 1000) / 10
            : 0,
        };
      });

      // 平均页面深度
      const depths = allSessions.map(s => s.pages?.length || 0);
      const avgDepth = depths.length > 0
        ? Math.round((depths.reduce((a, b) => a + b, 0) / depths.length) * 10) / 10
        : 0;

      return new Response(JSON.stringify({
        pages: pageStats,
        avgDepth,
        totalSessions: allSessions.length,
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

  // ===== 行为流（桑基图数据）=====
  async handleFlow(request, env, corsHeaders) {
    try {
      const allSessions = await this.getAllRecords(env, 'session:');

      // 统计页面跳转
      const transitions = {};
      allSessions.forEach(s => {
        if (s.pages && s.pages.length > 1) {
          for (let i = 0; i < s.pages.length - 1; i++) {
            const from = s.pages[i].page;
            const to = s.pages[i + 1].page;
            const key = `${from} -> ${to}`;
            transitions[key] = (transitions[key] || 0) + 1;
          }
        }
      });

      // 转换为桑基图数据格式
      const nodes = new Set();
      const links = [];
      Object.entries(transitions).forEach(([key, value]) => {
        const [from, to] = key.split(' -> ');
        nodes.add(from);
        nodes.add(to);
        links.push({ source: from, target: to, value });
      });

      // 入口页面统计
      const entries = {};
      allSessions.forEach(s => {
        if (s.pages && s.pages.length > 0) {
          const first = s.pages[0].page;
          entries[first] = (entries[first] || 0) + 1;
        }
      });

      // 出口页面统计
      const exits = {};
      allSessions.forEach(s => {
        if (s.pages && s.pages.length > 0) {
          const last = s.pages[s.pages.length - 1].page;
          exits[last] = (exits[last] || 0) + 1;
        }
      });

      return new Response(JSON.stringify({
        nodes: [...nodes],
        links,
        entries,
        exits,
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

  // ===== 地域分布 =====
  async handleGeo(request, env, corsHeaders) {
    try {
      const allRecords = await this.getAllRecords(env, 'pv:');

      const countries = {};
      const cities = {};

      allRecords.forEach(r => {
        const country = r.country || 'unknown';
        const city = r.city || 'unknown';
        countries[country] = (countries[country] || 0) + 1;
        if (city !== 'unknown') {
          cities[`${country}-${city}`] = (cities[`${country}-${city}`] || 0) + 1;
        }
      });

      // 国家代码转中文名
      const countryNames = {
        'CN': '中国', 'US': '美国', 'JP': '日本', 'KR': '韩国',
        'GB': '英国', 'DE': '德国', 'FR': '法国', 'SG': '新加坡',
        'AU': '澳大利亚', 'CA': '加拿大', 'unknown': '未知',
      };

      const countryData = {};
      Object.entries(countries).forEach(([code, count]) => {
        const name = countryNames[code] || code;
        countryData[name] = count;
      });

      return new Response(JSON.stringify({
        countries: countryData,
        cities,
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

  // ===== 按小时统计 =====
  async handleHourly(request, env, corsHeaders) {
    try {
      const allRecords = await this.getAllRecords(env, 'pv:');
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // 今日按小时
      const hourly = Array(24).fill(0);
      allRecords.filter(r => r.timestamp.startsWith(today)).forEach(r => {
        const hour = new Date(r.timestamp).getHours();
        hourly[hour]++;
      });

      // 全部按小时
      const hourlyAll = Array(24).fill(0);
      allRecords.forEach(r => {
        const hour = new Date(r.timestamp).getHours();
        hourlyAll[hour]++;
      });

      return new Response(JSON.stringify({
        today: hourly,
        all: hourlyAll,
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

  // ===== 每日趋势 =====
  async handleTrend(request, env, corsHeaders) {
    try {
      const allRecords = await this.getAllRecords(env, 'pv:');

      const daily = {};
      allRecords.forEach(r => {
        const day = r.timestamp.split('T')[0];
        if (!daily[day]) {
          daily[day] = { visits: 0, visitors: new Set() };
        }
        daily[day].visits++;
        daily[day].visitors.add(r.visitorId);
      });

      // 转换为数组并排序
      const trend = Object.entries(daily)
        .map(([date, data]) => ({
          date,
          visits: data.visits,
          visitors: data.visitors.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // 最近30天

      return new Response(JSON.stringify(trend), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },

  // ===== 事件统计 =====
  async handleEvents(request, env, corsHeaders) {
    try {
      const allEvents = await this.getAllRecords(env, 'evt:');
      const allSessions = await this.getAllRecords(env, 'session:');

      // 按事件名统计
      const eventCounts = {};
      allEvents.forEach(e => {
        eventCounts[e.eventName] = (eventCounts[e.eventName] || 0) + 1;
      });

      // 按日期统计事件
      const dailyEvents = {};
      allEvents.forEach(e => {
        const day = e.timestamp.split('T')[0];
        if (!dailyEvents[day]) dailyEvents[day] = {};
        dailyEvents[day][e.eventName] = (dailyEvents[day][e.eventName] || 0) + 1;
      });

      // 转化率（事件数 / 会话数）
      const conversionRate = {};
      const totalSessions = allSessions.length;
      Object.entries(eventCounts).forEach(([name, count]) => {
        conversionRate[name] = totalSessions > 0
          ? Math.round((count / totalSessions) * 1000) / 10
          : 0;
      });

      return new Response(JSON.stringify({
        counts: eventCounts,
        daily: dailyEvents,
        conversionRate,
        totalEvents: allEvents.length,
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

  // ===== 数据导出 =====
  async handleExport(request, env, corsHeaders) {
    try {
      const url = new URL(request.url);
      const type = url.searchParams.get('type') || 'pageviews';
      const days = parseInt(url.searchParams.get('days') || '30');

      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      let records = [];

      if (type === 'pageviews') {
        records = (await this.getAllRecords(env, 'pv:')).filter(r => r.timestamp >= cutoff);
      } else if (type === 'sessions') {
        records = (await this.getAllRecords(env, 'session:')).filter(s => s.startTime >= cutoff);
      } else if (type === 'events') {
        records = (await this.getAllRecords(env, 'evt:')).filter(e => e.timestamp >= cutoff);
      } else if (type === 'visitors') {
        records = await this.getAllRecords(env, 'visitor:');
      }

      return new Response(JSON.stringify(records), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },

  // ===== 辅助方法：获取所有记录 =====
  async getAllRecords(env, prefix) {
    const list = await env.ANALYTICS_KV.list({ prefix });
    const records = [];
    for (const key of list.keys) {
      const value = await env.ANALYTICS_KV.get(key.name, 'json');
      if (value) records.push(value);
    }
    return records;
  },
};
