---
name: minimalist-beauty
description: 简约美设计规范 - 参考 Linear + Apple 设计语言，精确定义油漆店网站的视觉和交互标准
---

# 简约美设计规范

> 参考对象：Linear.app 的克制与精确，Apple.com 的留白与呼吸感
> 适用项目：油漆店静态展示官网
> 最后更新：2026-06-20

---

## 设计哲学

### 一句话定义
**让内容自己说话，界面退到幕后。**

### 三个核心原则

| 原则 | 含义 | 反面教材 |
|------|------|----------|
| **克制** | 能用一个元素解决，绝不用两个 | 花边、阴影、渐变堆叠 |
| **精确** | 每个像素都有存在的理由 | 随意的间距、模糊的层次 |
| **呼吸** | 留白不是浪费，是设计的一部分 | 元素拥挤、信息过载 |

---

## 一、色彩系统

### 1.1 基础色板（已实现）

```css
:root {
  /* 背景层：3 级灰度 */
  --color-bg: #fafaf8;          /* 主背景（微暖白） */
  --color-bg-warm: #f5f0eb;     /* 次背景（暖灰） */
  --color-bg-card: #ffffff;     /* 卡片背景（纯白） */
  
  /* 文字层：3 级灰度 */
  --color-text: #1a1a1a;        /* 标题、正文（深炭灰） */
  --color-text-secondary: #666666;  /* 次要文字 */
  --color-text-tertiary: #999999;   /* 辅助信息 */
  
  /* 边框层 */
  --color-border: rgba(0, 0, 0, 0.06);  /* 极淡边框 */
  
  /* 强调色：仅用于关键交互 */
  --color-accent: #c4956a;      /* 温暖赭石 */
  --color-accent-hover: #b3845a;
  
  /* 阴影：极轻微 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08);
}
```

### 1.2 使用规则

| 场景 | 颜色 | 示例 |
|------|------|------|
| 页面主背景 | `--color-bg` | 首页、商品详情 |
| 交替区块 | `--color-bg-warm` | 分类展示、特性介绍 |
| 卡片背景 | `--color-bg-card` | 产品卡片 |
| 标题 | `--color-text` | h1, h2, h3 |
| 正文描述 | `--color-text-secondary` | 段落、说明文字 |
| 辅助信息 | `--color-text-tertiary` | 时间、标签、备注 |
| 强调色 | `--color-accent` | 徽章、特殊标记 |

### 1.3 禁止事项

- ❌ 不使用渐变背景（除 Hero 区域）
- ❌ 不使用纯黑 `#000` 作为文字颜色
- ❌ 不使用高饱和度颜色作为大面积背景
- ❌ 不使用超过 3 种颜色

---

## 二、字体系统

### 2.1 字体栈（已实现）

```css
:root {
  /* 标题：紧凑、有力（Oswald） */
  --font-heading: 'Oswald', 'Noto Sans SC', sans-serif;
  
  /* 正文：易读、中性（Inter） */
  --font-body: 'Inter', 'Noto Sans SC', sans-serif;
  
  /* 等宽：数据、价格 */
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 2.2 字号规范（已实现）

| 场景 | 字号 | 字重 | 行高 | 字间距 |
|------|------|------|------|--------|
| Hero 标题 | clamp(2.5rem, 5vw, 4.5rem) | 300 | 1.1 | 0.05em |
| 区块标题 | clamp(1.75rem, 3vw, 2.5rem) | 300 | 1.2 | 0.05em |
| 卡片标题 | 1.125rem | 400 | 1.3 | 0.02em |
| 正文 | 0.9375rem | 400 | 1.5 | - |
| 次要文字 | 0.8125rem | 300 | 1.5 | - |
| 标签文字 | 0.6875rem | 400 | 1.4 | 0.05em |
| 价格数字 | 1rem | 300 | 1.2 | 0.05em |

### 2.3 字重使用

| 字重 | 用途 | 示例 |
|------|------|------|
| 300 | 标题、数字、轻量文字 | h1, h2, 价格 |
| 400 | 正文、按钮、标签 | p, button, span |
| 500 | 强调文字、按钮文字 | 导航激活态 |

---

## 三、间距系统

### 3.1 基础间距（已实现）

```css
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  --space-4xl: 6rem;     /* 96px */
  --space-5xl: 8rem;     /* 128px */
}
```

### 3.2 应用规范（已实现）

| 场景 | 间距 | 说明 |
|------|------|------|
| 区块内边距（桌面） | `8rem 2rem` | 上下 128px |
| 区块内边距（移动） | `5rem 1.5rem` | 上下 80px |
| 区块标题下方 | `4rem` | 标题与内容之间 |
| 卡片内边距 | `2.5rem` | 40px |
| 网格间距 | `3rem` | 48px |
| 元素间距 | `1.5rem` | 24px |

---

## 四、圆角系统

### 4.1 规范（已实现）

```css
:root {
  --radius-none: 0;        /* 默认：无圆角 */
  --radius-sm: 4px;        /* 色卡、小元素 */
  --radius-full: 50px;     /* 胶囊形状：联系按钮 */
}
```

### 4.2 使用规则

| 元素 | 圆角 | 说明 |
|------|------|------|
| 卡片 | `0` | 无圆角，Apple 风格 |
| 按钮 | `0` | 无圆角 |
| 输入框 | `0` | 无圆角 |
| 色卡 | `4px` | 轻微圆角 |
| 联系胶囊 | `50px` | 完全圆形 |
| 头像 | `50%` | 圆形 |

### 4.3 设计意图

- **无圆角** = 克制、精确、现代感
- **仅色卡有 4px** = 模拟实体色卡的轻微圆角
- **胶囊按钮** = 悬浮元素的柔和感

---

## 五、阴影系统

### 5.1 规范（已实现）

```css
:root {
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);      /* 极轻微 */
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);      /* 轻微 */
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08);      /* 明显 */
}
```

### 5.2 使用规则

| 场景 | 阴影 | 说明 |
|------|------|------|
| 卡片默认 | `--shadow-sm` | 极轻微 |
| 卡片悬停 | `--shadow-lg` | 提升感 |
| 导航栏滚动 | `--shadow-md` | 层次感 |
| 联系胶囊 | `0 4px 20px rgba(0,0,0,0.1)` | 悬浮感 |

### 5.3 禁止事项

- ❌ 不使用纯黑色阴影 `rgba(0,0,0,0.3)`
- ❌ 不使用多层阴影叠加
- ❌ 阴影扩散半径不超过 30px

---

## 六、动画系统

### 6.1 缓动函数（已实现）

```css
:root {
  /* 弹性缓动：按钮、卡片悬停 */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* 减速缓动：进入动画、滚动渐现 */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* 标准缓动：其他过渡 */
  --ease-default: ease;
}
```

### 6.2 时长规范（已实现）

| 场景 | 时长 | 缓动 | 说明 |
|------|------|------|------|
| 按钮悬停 | 0.3s | spring | scale + shadow |
| 卡片悬停 | 0.4s | spring | translateY + shadow |
| 图片缩放 | 0.8s | out | scale(1.05) |
| 滚动渐现 | 0.8s | out | opacity + translateY |
| Hero 切换 | 1.2s | out | opacity |
| 导航栏 | 0.3s | default | shadow |
| 弹窗打开 | 0.3s | out | translateY |
| Toast 通知 | 0.3s | out | translateX |

### 6.3 滚动渐现（已实现）

```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```javascript
// Intersection Observer 实现
const ScrollAnimator = {
  init() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    elements.forEach(el => observer.observe(el));
  }
};
```

### 6.4 禁止事项

- ❌ 不使用 `ease` 以外的默认缓动
- ❌ 不使用超过 1.2s 的动画
- ❌ 不对 `width`、`height` 做动画（用 `transform` 代替）
- ❌ 不使用 `animation-delay` 超过 300ms

---

## 七、组件规范

### 7.1 导航栏（已实现）

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 72px;
  background: rgba(250, 250, 248, 0.85);  /* 半透明 */
  backdrop-filter: blur(20px);             /* 毛玻璃 */
  border-bottom: 1px solid var(--color-border);
}

.navbar.scrolled {
  box-shadow: var(--shadow-md);  /* 滚动后加阴影 */
}
```

**规范：**
- 高度：72px（桌面）/ 64px（移动）
- 背景：半透明 + 毛玻璃
- 边框：1px 极淡边框
- Logo 左对齐，导航右对齐
- 最多 4 个导航项
- 字号：0.875rem，字重：400

### 7.2 按钮（已实现）

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border-radius: 0;                    /* 无圆角 */
  font-weight: 400;
  font-size: 0.875rem;
  letter-spacing: 0.1em;
  transition: all 0.3s var(--ease-spring);
}

.btn:active {
  transform: scale(0.98);  /* 按下反馈 */
}

.btn-primary {
  background: var(--color-text);  /* 深色按钮 */
  color: white;
}

.btn-primary:hover {
  background: var(--color-text-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-text);
}
```

**规范：**
- 高度：36px（小）/ 40px（中）/ 44px（大）
- 内边距：14px 32px
- 圆角：0px
- 字号：0.875rem
- 字重：400
- 字间距：0.1em

### 7.3 产品卡片（已实现）

```css
.product-card {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  transition: all 0.4s var(--ease-spring);
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-card-image {
  aspect-ratio: 3/4;  /* 竖版 */
  overflow: hidden;
  background: var(--color-bg-warm);
}

.product-card-image img {
  transition: transform 0.8s var(--ease-out);
}

.product-card:hover .product-card-image img {
  transform: scale(1.05);
}

.product-card-body {
  padding: 1.5rem 0;  /* 无背景，靠间距 */
}
```

**规范：**
- 无背景、无边框、无阴影
- 图片比例：3:4（竖版）
- 悬停：上移 4px + 图片缩放 1.05
- 标题字号：1.125rem，字重：400
- 描述字号：0.8125rem，字重：300
- 价格字号：1rem，字重：300，字体：mono

### 7.4 分类卡片（已实现）

```css
.category-card {
  background: var(--color-bg-card);
  border-radius: 0;
  padding: 2.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s var(--ease-spring);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

**规范：**
- 有背景（白色）、有轻微阴影
- 内边距：2.5rem
- 悬停：上移 4px + 阴影增强
- 图标字号：2.5rem
- 标题字号：1.125rem

### 7.5 输入框（已实现）

```css
.input {
  height: 36px;
  padding: 0 12px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 0;
  font-size: 0.8125rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-text);
}
```

### 7.6 标签（已实现）

```css
.tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 0.5rem;
  background: var(--color-bg-warm);
  border-radius: 0;
  font-size: 0.6875rem;
  font-weight: 400;
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
}
```

### 7.7 联系胶囊（已实现）

```css
.contact-capsule {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  font-size: 0.8125rem;
  transition: all 0.3s var(--ease-spring);
}

.contact-capsule:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}
```

### 7.8 色卡（已实现）

```css
.color-swatch {
  aspect-ratio: 1;
  border-radius: 4px;  /* 唯一有圆角的元素 */
  transition: transform 0.3s var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.color-swatch:hover {
  transform: scale(1.05);
}

/* 噪点纹理 */
.color-swatch::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...");
  opacity: 0.03;
  pointer-events: none;
}
```

---

## 八、图标规范

### 8.1 风格

- 使用 Emoji 作为图标（当前方案）
- 保持简洁，不使用复杂图标
- 尺寸继承父元素字号

### 8.2 使用规则

| 场景 | 图标 | 说明 |
|------|------|------|
| 导航图标 | 无 | 纯文字导航 |
| 特性图标 | ✓ → ○ □ | 简单几何形状 |
| 联系图标 | 📞 📍 🕐 💬 | Emoji |
| 分类图标 | 🏢 🏠 🪵 🧴 ✨ | Emoji |

---

## 九、图片规范

### 9.1 比例（已实现）

| 场景 | 比例 | 说明 |
|------|------|------|
| Hero 背景 | 100vh | 全屏高度 |
| 产品卡片 | 3:4 | 竖版，展示产品 |
| 关于我们 | 4:3 | 横版，展示店铺 |
| 色卡 | 1:1 | 正方形 |

### 9.2 处理

```css
/* 统一处理 */
img {
  display: block;
  max-width: 100%;
  height: auto;
  object-fit: cover;
}

/* 懒加载 */
img[loading="lazy"] {
  opacity: 0;
  transition: opacity 0.3s;
}
```

### 9.3 占位符（已实现）

```css
.image-placeholder {
  background: var(--color-bg-warm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: 2rem;
}
```

---

## 十、响应式规范

### 10.1 断点（已实现）

```css
/* 平板端 */
@media (max-width: 1024px) { ... }

/* 移动端 */
@media (max-width: 768px) { ... }
```

### 10.2 适配规则（已实现）

| 元素 | 移动端 | 桌面端 |
|------|--------|--------|
| 导航栏高度 | 72px | 72px |
| 导航菜单 | 下拉菜单 | 水平排列 |
| 页面内边距 | 1.5rem | 2rem |
| 区块内边距 | 5rem | 8rem |
| 产品网格 | 1 列 | 3-4 列 |
| 分类网格 | 2 列 | 4-5 列 |
| Hero 标题 | 2rem | clamp(2.5rem, 5vw, 4.5rem) |
| 区块标题 | 1.5rem | clamp(1.75rem, 3vw, 2.5rem) |

---

## 十一、页面结构

### 11.1 首页结构（已实现）

```
┌─────────────────────────────────┐
│ 导航栏（毛玻璃）                 │ 72px
├─────────────────────────────────┤
│                                 │
│ Hero 区域                       │ 100vh
│ - 渐变背景                      │
│ - 英文标签（大写、间距）         │
│ - 标题（轻量、换行）            │
│ - 副标题（间距）                │
│ - CTA 按钮                      │
│ - 轮播指示点                    │
│                                 │
├─────────────────────────────────┤
│ 产品分类                        │ padding: 8rem 2rem
│ - 区块标题 + 描述               │
│ - 分类卡片网格（有背景、阴影）  │
├─────────────────────────────────┤
│ 推荐产品                        │ padding: 8rem 2rem
│ - 区块标题 + 描述               │
│ - 产品卡片网格（无背景）        │
│ - "查看全部" 按钮               │
├─────────────────────────────────┤
│ 色彩灵感                        │ padding: 6rem 2rem
│ - 区块标题 + 描述               │
│ - 色卡网格（1:1、噪点纹理）    │
├─────────────────────────────────┤
│ 为什么选择我们                  │ padding: 8rem 2rem，暖灰背景
│ - 区块标题 + 描述               │
│ - 特性卡片网格（图标+标题+描述）│
├─────────────────────────────────┤
│ CTA 区域                        │ 深色背景
│ - 标题 + 描述                   │
│ - 白色按钮                      │
├─────────────────────────────────┤
│ Footer                          │ 深色背景
│ - 四列布局                      │
│ - 分隔线                        │
│ - 版权信息                      │
└─────────────────────────────────┘
│ 联系胶囊（悬浮）                │ 右下角
```

### 11.2 商品列表页结构（已实现）

```
┌─────────────────────────────────┐
│ 导航栏                          │
├─────────────────────────────────┤
│ 页面标题区域                    │ 暖灰背景
│ - 英文标签                      │
│ - 页面标题                      │
│ - 页面描述                      │
├─────────────────────────────────┤
│ 筛选栏                          │ padding: 1.5rem
│ - 分类标签（无圆角按钮）        │
│ - 搜索框                        │
├─────────────────────────────────┤
│ 产品网格                        │
│ - 产品卡片 × N                  │
├─────────────────────────────────┤
│ CTA 区域                        │ 暖灰背景
├─────────────────────────────────┤
│ Footer                          │
└─────────────────────────────────┘
```

### 11.3 商品详情页结构（已实现）

```
┌─────────────────────────────────┐
│ 导航栏                          │
├─────────────────────────────────┤
│ 产品详情                        │ margin-top: 72px
│ ┌───────────┬───────────┐       │
│ │           │           │       │
│ │  产品图片  │  产品信息  │       │
│ │  (3:4)    │  - 分类   │       │
│ │           │  - 标题   │       │
│ │  缩略图   │  - 价格   │       │
│ │           │  - 描述   │       │
│ │           │  - 特性   │       │
│ │           │  - 规格   │       │
│ │           │  - CTA    │       │
│ └───────────┴───────────┘       │
├─────────────────────────────────┤
│ 相关产品                        │ 暖灰背景
│ - 产品卡片网格                  │
├─────────────────────────────────┤
│ Footer                          │
└─────────────────────────────────┘
```

---

## 十二、代码规范

### 12.1 CSS 变量命名

```css
/* 颜色 */
--color-{用途}: {值};

/* 字体 */
--font-{用途}: {值};

/* 间距 */
--space-{大小}: {值};

/* 阴影 */
--shadow-{大小}: {值};

/* 动画 */
--ease-{类型}: {值};
```

### 12.2 类名命名

```css
/* 组件 */
.navbar { }
.nav-container { }
.nav-links { }

/* 子元素 */
.product-card { }
.product-card-image { }
.product-card-body { }
.product-card-title { }

/* 状态 */
.active { }
.scrolled { }
.visible { }

/* 工具类 */
.animate-on-scroll { }
```

### 12.3 HTML 结构

```html
<!-- 语义化标签 -->
<nav class="navbar">导航</nav>
<main>
  <section class="section">内容区块</section>
</main>
<footer class="footer">页脚</footer>

<!-- 无障碍 -->
<button aria-label="菜单">☰</button>
<img alt="产品名称" loading="lazy">
```

---

## 十三、检查清单

### 每次修改前检查

- [ ] 颜色是否在色板内？
- [ ] 字号是否符合规范？
- [ ] 间距是否使用变量？
- [ ] 圆角是否为 0（除色卡）？
- [ ] 动画是否使用正确的缓动函数？

### 每次修改后检查

- [ ] 移动端是否适配？
- [ ] 是否有溢出？
- [ ] 加载速度是否正常？
- [ ] 毛玻璃效果是否正常？

---

## 十四、参考资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Linear | linear.app | 交互、动画、克制 |
| Apple | apple.com | 布局、留白、呼吸感 |
| Inter | rsms.me/inter | 正文字体 |
| Oswald | fonts.google.com | 标题字体 |

---

*简约不是少，是刚刚好。*
