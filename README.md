# 🎨 油漆店官网

> 为油漆个体工商户打造的静态展示官网，支持商品展示、图片/视频、后台管理

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-100000?style=flat&logo=github&logoColor=white)

---

## ✨ 功能特性

### 前台展示
- 🏠 **首页** - Hero 轮播、产品分类、推荐商品、色彩灵感
- 📦 **商品展示** - 分类筛选、搜索、产品卡片
- 📄 **商品详情** - 图片/视频画廊、规格参数、相关产品
- ℹ️ **关于我们** - 店铺介绍、统计数据、优势展示
- 📞 **联系方式** - 联系信息、在线咨询、FAQ

### 后台管理
- ➕ 商品增删改查
- 🔀 一键上下架
- 📊 数据统计面板
- 💾 数据导入导出

---

## 🖼️ 设计风格

参考 **Linear.app** + **Apple.com** 设计语言，追求简约美：

| 特性 | 实现 |
|------|------|
| 色彩 | 温暖中性色调，低饱和度 |
| 字体 | Oswald（标题）+ Inter（正文） |
| 圆角 | 无圆角，克制精确 |
| 动画 | Spring 曲线，流畅自然 |
| 导航 | 毛玻璃效果，半透明 |
| 间距 | 大量留白，呼吸感 |

详见 [简约美设计规范](skill/简约美_skill.md)

---

## 📁 项目结构

```
paint-store/
├── index.html              # 首页
├── products.html           # 商品列表页
├── product-detail.html     # 商品详情页
├── about.html              # 关于我们
├── contact.html            # 联系方式
├── admin/
│   └── index.html          # 后台管理页面
├── assets/
│   ├── css/
│   │   └── style.css       # 样式文件
│   ├── js/
│   │   ├── main.js         # 前台逻辑
│   │   └── admin.js        # 后台管理逻辑
│   ├── images/             # 图片资源
│   └── videos/             # 视频资源
├── data/
│   ├── products.json       # 商品数据
│   └── categories.json     # 分类数据
└── skill/
    ├── 说明_skill.md        # 项目说明
    ├── 简约美_skill.md      # 设计规范
    └── 高级感_skill.md      # 高级感方案
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/paint-store.git
cd paint-store
```

### 2. 本地预览

直接用浏览器打开 `index.html` 即可预览

或使用本地服务器：

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# 安装 Live Server 插件，右键 index.html 选择 "Open with Live Server"
```

### 3. 部署到 GitHub Pages

1. 推送代码到 GitHub
2. 进入仓库 Settings → Pages
3. Source 选择 `main` 分支
4. 点击 Save，等待部署完成

---

## 📝 使用说明

### 管理后台

访问 `/admin/` 进入管理后台

- **添加商品**：点击"添加商品"按钮，填写信息后保存
- **编辑商品**：点击商品列表中的"编辑"按钮
- **上下架**：点击"上架"或"下架"按钮
- **删除商品**：点击"删除"按钮（不可恢复）
- **数据备份**：定期点击"导出数据"备份

### 添加图片/视频

1. 将图片放入 `assets/images/` 目录
2. 将视频放入 `assets/videos/` 目录
3. 在后台管理中填写文件名（如 `product-01.jpg`）

### 自定义域名

1. 申请域名
2. 在项目根目录创建 `CNAME` 文件，内容为你的域名
3. 在域名服务商处配置 CNAME 记录指向 `your-username.github.io`

---

## 🎯 商品分类

| 分类 | 图标 | 说明 |
|------|------|------|
| 内墙漆 | 🏠 | 环保净味，打造健康家居 |
| 外墙漆 | 🏢 | 耐候性强，持久保护 |
| 木器漆 | 🪵 | 专业涂装，彰显质感 |
| 底漆 | 🧴 | 增强附着力 |
| 特种漆 | ✨ | 防水、防火等特殊功能 |

---

## 📱 响应式支持

| 设备 | 断点 | 布局 |
|------|------|------|
| 手机 | < 768px | 单列布局 |
| 平板 | 768-1024px | 双列布局 |
| 桌面 | > 1024px | 多列布局 |

---

## 🛠️ 技术栈

- **前端**：HTML5 + CSS3 + 原生 JavaScript
- **样式**：自定义 CSS（无框架依赖）
- **字体**：Google Fonts（Inter + Oswald）
- **存储**：JSON 文件 + localStorage
- **部署**：GitHub Pages

---

## 📋 待办事项

- [ ] 添加商品图片素材
- [ ] 添加产品视频素材
- [ ] 填写真实联系方式
- [ ] 配置自定义域名
- [ ] SEO 优化
- [ ] 性能优化

---

## 📄 许可证

MIT License

---

## 📞 联系方式

- 📧 邮箱：待填写
- 📱 电话：待填写
- 💬 微信：待填写

---

<p align="center">Made with ❤️ for 油漆店</p>
