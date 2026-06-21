---
name: decoration-designer
description: 用户自定义装修设计器 - 交互式室内场景编辑、拍照素材融入、作品分享
---

# 用户自定义装修设计器

## 功能概述

为用户提供一个交互式的"家庭装修设计器"，使其能够通过简单的点击操作，对预设的室内场景进行个性化装饰与布局。该功能旨在提升用户参与度，并通过作品分享实现社交裂变。

---

## 核心用户流程

### 1. 进入设计器

用户进入指定页面后，系统将加载一个默认的室内空间模板（如客厅、卧室），该模板包含可替换的家具、墙面、地板等基础元素。

**页面路由**：`/designer.html`

**默认场景**：
- 客厅（默认）
- 卧室
- 厨房
- 儿童房

### 2. 自定义装饰与拍摄

#### 自定义装饰
用户可以通过点击场景中的不同区域或从素材库中选择元素：
- **更换墙色**：点击墙面区域，弹出颜色选择器
- **摆放家具**：从素材库拖拽家具到场景中
- **调整灯光**：切换不同灯光效果（暖光/冷光/自然光）
- **添加装饰**：挂画、地毯、窗帘等

#### 拍摄操作
为丰富场景或记录灵感，用户可调用设备摄像头进行拍摄：
- 拍摄的照片可被处理为装饰素材（如挂画、地毯图案）
- 或作为场景背景，融入用户的个性化设计中

### 3. 数据保存与缓存

#### 自动缓存
用户在设计过程中的每一步操作（包括拍摄上传的素材）都将自动缓存至本地浏览器，以防止数据意外丢失。

**缓存策略**：
- 使用 `localStorage` 存储当前设计状态
- 每次操作后自动保存（防抖处理，500ms）
- 页面加载时自动恢复上次设计

#### 持久化存储
当用户完成设计并确认保存时，系统将本次设计的全部数据序列化为一个结构化的 JSON 文件。

**数据结构**：
```json
{
  "version": "1.0",
  "id": "design_1719123456789",
  "createdAt": "2026-06-23T12:00:00.000Z",
  "scene": {
    "type": "living-room",
    "background": "#F5F0EB",
    "lighting": "warm"
  },
  "elements": [
    {
      "id": "wall-1",
      "type": "wall",
      "color": "#E8D5C4",
      "position": { "x": 0, "y": 0 }
    },
    {
      "id": "sofa-1",
      "type": "furniture",
      "name": "沙发",
      "asset": "sofa-modern-01",
      "position": { "x": 200, "y": 300 },
      "scale": 1,
      "rotation": 0
    },
    {
      "id": "photo-1",
      "type": "custom-photo",
      "name": "用户拍摄照片",
      "dataUrl": "data:image/jpeg;base64,...",
      "position": { "x": 400, "y": 150 },
      "size": { "width": 200, "height": 150 }
    }
  ],
  "metadata": {
    "author": "anonymous",
    "title": "我的客厅设计",
    "description": "",
    "tags": ["客厅", "现代"]
  }
}
```

### 4. 作品分享

#### 文件托管
生成的 JSON 文件将自动上传至项目指定的 GitHub 仓库独立目录（如 `/designs/`）中进行托管。

#### 唯一链接生成
系统将根据当前时间戳（精确到毫秒）生成唯一的哈希值，作为该 JSON 文件的标识符。

**链接格式**：
```
https://[your-domain]/design/[毫秒级时间戳哈希]
```

**示例**：
```
https://shichaofaan.github.io/paint-store/design/design_1719123456789
```

#### 查看与传播
用户复制此链接并分享给他人。任何打开该链接的人，都将复现用户自定义的装修场景，实现"所见即所得"的分享体验。

---

## 页面结构

### designer.html - 设计器主页面

```
┌─────────────────────────────────────────────────────────┐
│ 导航栏                                                  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │                    工具栏                           │ │
│ │  [场景选择] [墙色] [家具] [装饰] [灯光] [拍照]     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌───────────────────────┬───────────────────────────┐   │
│ │                       │                           │   │
│ │                       │      素材库               │   │
│ │     画布区域          │      - 家具列表           │   │
│ │     (Canvas)          │      - 装饰列表           │   │
│ │                       │      - 颜色选择           │   │
│ │                       │                           │   │
│ └───────────────────────┴───────────────────────────┘   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                    操作栏                           │ │
│ │  [撤销] [重置] [保存] [分享]                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### design.html - 查看设计页面

```
┌─────────────────────────────────────────────────────────┐
│ 导航栏                                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    设计展示区域                          │
│                    (只读模式)                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  设计信息                                               │
│  - 标题、作者、创建时间                                 │
│  - [复制设计] [分享链接]                                │
└─────────────────────────────────────────────────────────┘
```

---

## 技术架构

### 前端技术栈

| 技术 | 用途 |
|------|------|
| HTML5 Canvas | 场景渲染和交互 |
| CSS Grid/Flex | 布局 |
| JavaScript | 逻辑处理 |
| localStorage | 本地缓存 |
| GitHub API | 作品托管 |

### 核心模块

```
assets/js/
├── designer/
│   ├── canvas.js        # Canvas 渲染引擎
│   ├── scene.js         # 场景管理
│   ├── elements.js      # 元素管理（家具、装饰）
│   ├── tools.js         # 工具栏逻辑
│   ├── camera.js        # 拍照功能
│   ├── storage.js       # 本地存储
│   ├── share.js         # 分享功能
│   └── viewer.js        # 查看设计页面逻辑
└── main.js              # 主入口
```

### 数据流

```
用户操作 → 更新场景状态 → 自动缓存(localStorage)
                ↓
        保存 → 序列化JSON → 上传GitHub API → 生成分享链接
                ↓
        分享 → 通过链接访问 → 加载JSON → 还原场景
```

---

## Canvas 渲染引擎设计

### 场景层级

```
Layer 0: 背景层（墙壁颜色、地板）
Layer 1: 家具层（沙发、桌子、椅子等）
Layer 2: 装饰层（挂画、地毯、植物等）
Layer 3: 灯光效果层（叠加混合模式）
Layer 4: UI层（选中框、拖拽手柄）
```

### 交互事件

| 事件 | 行为 |
|------|------|
| click | 选中元素 |
| drag | 移动元素 |
| wheel | 缩放元素 |
| dblclick | 编辑元素属性 |
| right-click | 删除元素 |

### 碰撞检测

使用简单的矩形碰撞检测：
```javascript
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}
```

---

## 拍照功能设计

### 调用摄像头

```javascript
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
    audio: false
  });
  videoElement.srcObject = stream;
}

function capturePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  canvas.getContext('2d').drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}
```

### 照片处理

- 压缩至合适尺寸（最大 800px）
- 转换为 Base64 DataURL
- 存储在场景元素数据中

---

## 分享功能设计

### GitHub API 集成

```javascript
async function uploadDesign(designData) {
  const token = 'YOUR_GITHUB_TOKEN'; // 需要配置
  const repo = 'shichaofaan/paint-store';
  const path = `designs/${designData.id}.json`;

  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add design: ${designData.id}`,
      content: btoa(JSON.stringify(designData, null, 2)),
    }),
  });

  return response.json();
}
```

### 链接生成

```javascript
function generateShareLink(designId) {
  const baseUrl = window.location.origin + window.location.pathname.replace('designer.html', '');
  return `${baseUrl}design/${designId}`;
}
```

---

## 路由设计

### 前端路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/designer.html` | 设计器 | 创建新设计 |
| `/design/{id}` | 查看设计 | 查看已保存的设计 |

### 路由处理

由于是静态站点，需要在 `design.html` 中通过 JavaScript 解析 URL 参数：

```javascript
// design.html
const path = window.location.pathname;
const designId = path.split('/design/')[1];

if (designId) {
  loadDesign(designId);
}
```

---

## 素材库设计

### 预设家具

| 分类 | 素材 | 数量 |
|------|------|------|
| 沙发 | 现代沙发、L型沙发、单人椅 | 3 |
| 桌子 | 茶几、餐桌、书桌 | 3 |
| 柜子 | 电视柜、书柜、衣柜 | 3 |
| 灯具 | 吊灯、台灯、落地灯 | 3 |
| 植物 | 盆栽、绿植、花瓶 | 3 |

### 预设装饰

| 分类 | 素材 | 数量 |
|------|------|------|
| 挂画 | 抽象画、风景画、照片框 | 3 |
| 地毯 | 现代地毯、波斯地毯、简约地毯 | 3 |
| 窗帘 | 素色窗帘、花纹窗帘、百叶窗 | 3 |

### 素材格式

- SVG 格式（矢量，缩放不失真）
- 或 PNG 格式（带透明背景）
- 存放在 `assets/designer/` 目录

---

## 实现优先级

| 优先级 | 功能 | 工作量 |
|--------|------|--------|
| P0 | 基础画布和场景渲染 | 3天 |
| P0 | 墙色更换 | 1天 |
| P0 | 家具拖拽摆放 | 2天 |
| P0 | 本地缓存 | 1天 |
| P1 | 拍照功能 | 2天 |
| P1 | 装饰素材 | 2天 |
| P1 | 灯光效果 | 1天 |
| P2 | 分享功能 | 2天 |
| P2 | 查看设计页面 | 1天 |
| P3 | 撤销/重做 | 1天 |
| P3 | 更多素材 | 持续 |

---

## 文件结构

```
paint-store/
├── designer.html           # 设计器页面
├── design.html             # 查看设计页面
├── assets/
│   ├── js/
│   │   └── designer/
│   │       ├── canvas.js
│   │       ├── scene.js
│   │       ├── elements.js
│   │       ├── tools.js
│   │       ├── camera.js
│   │       ├── storage.js
│   │       ├── share.js
│   │       └── viewer.js
│   ├── designer/           # 设计素材
│   │   ├── furniture/
│   │   ├── decor/
│   │   └── scenes/
│   └── css/
│       └── designer.css
├── designs/                # 用户设计存储（GitHub）
└── skill/
    └── 用户自定义装修设计器_skill.md
```

---

## 待确认事项

- [ ] GitHub Token 配置方式（前端暴露风险）
- [ ] 素材库具体内容和风格
- [ ] 是否需要用户登录系统
- [ ] 设计作品的审核机制
- [ ] 存储空间限制（GitHub 仓库大小）
- [ ] 是否支持移动端编辑

---

*让用户成为自己的室内设计师。*
