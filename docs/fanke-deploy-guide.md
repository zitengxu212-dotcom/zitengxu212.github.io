# 凡科代码块部署方案

## 核心规则

> **默认所有代码放在代码块1。只有当代码块1超过 50,000 字符时，才拆分到代码块2。**

| 条件 | 行为 |
|------|------|
| 总代码 ≤ 50,000 字符 | 全部放入**代码块1**，代码块2 不使用 |
| 总代码 > 50,000 字符 | Hero 区域 → 代码块1，其余内容 → 代码块2 |

## 约束条件

| 条件 | 说明 |
|------|------|
| 字符上限 | 每个代码块 ≤ 50,000 字符 |
| 独立运行 | 每个代码块包含自身所需的完整 CSS + HTML + JS |
| 默认模式 | 单代码块（代码块1） |
| 超限模式 | 双代码块（代码块1 + 代码块2） |
| 执行环境 | `<style>` 全局生效；`<script>` 各自运行，全局作用域通信 |

## 代码拆分策略

### 单代码块模式（默认，总代码 ≤ 50K）

```
代码块1
┌─────────────────────────┐
│ <style>                 │
│   完整 CSS              │
│ </style>                │
│                         │
│ ① Hero 标题区           │
│ ② 主体内容区            │
│ ③ Footer               │
│ ④ secondary-section    │
│                         │
│ <script>                │
│   完整 JS               │
│ </script>               │
└─────────────────────────┘
```

### 双代码块模式（超限时，总代码 > 50K）

拆分策略：**主页面（代码块1）+ 详情面板（代码块2）**

```
代码块1 (主页面)                   代码块2 (详情面板)
┌─────────────────────┐         ┌─────────────────────┐
│ GSAP CDN 脚本        │         │ <style>              │
│ <style>              │         │   精简 CSS           │
│   完整 CSS            │         │   (变量+面板样式)    │
│ </style>             │         │ </style>             │
│                      │         │                      │
│ ① Preloader          │         │ ⑤ 12 项目详情面板    │
│ ② Header             │         │   (#detail-01~12)   │
│ ③ Hero 标题区        │         │                      │
│ ④ 主体内容区          │         │ <script>             │
│   (About/Works/      │         │   XZT 命名空间桥接   │
│    Break/Footer)     │         │ </script>            │
│                      │         │                      │
│ <script>             │         │                      │
│   完整 JS             │         │                      │
│ </script>            │         │                      │
└─────────────────────┘         └─────────────────────┘
```

- 代码块 2 CSS 为精简版（仅含 `:root` 变量、reset、详情面板样式），完整 CSS 在代码块 1
- 代码块 2 JS 仅声明 `window.XZT` 命名空间桥接，所有交互逻辑在代码块 1
- GSAP 库在代码块 1 加载，全局可用，操作代码块 2 的 DOM 元素无问题

## 开发期间需遵守的规范

### 1. 全局命名空间隔离

所有 JS 变量/函数放在命名空间对象下：

```js
window.XUZITENG = window.XUZITENG || {};
(function () {
  'use strict';
  // 所有代码在此
})();
```

### 2. 跨代码块通信（仅双块模式需要）

使用 `CustomEvent` 跨块通信：

```js
// 代码块1：触发事件
document.dispatchEvent(new CustomEvent('xuziteng:scroll-to-content'));

// 代码块2：监听事件
document.addEventListener('xuziteng:scroll-to-content', function () {
  document.querySelector('.main-section').scrollIntoView({ behavior: 'smooth' });
});
```

单块模式时，事件在同一上下文内直接生效，无需额外处理。

### 3. CSS 变量集中定义

所有颜色/尺寸使用 `:root` CSS 变量，每个代码块的 `<style>` 中各自包含完整的变量定义。

### 4. 选择器命名

避免与凡科平台样式冲突：
- 我们的类名前缀：`.hero-*`、`.navbar-*`、`.portfolio-*`、`.showcase-*`、`.footer-*`
- 凡科平台前缀：`.jz_*`、`.nav_*`
- 两者不冲突

### 5. 字体处理

- 字体文件上传到凡科文件库
- `@font-face` 使用绝对 URL 指向凡科文件库地址
- 未加载字体时回退到 `Courier New → Noto Sans SC → monospace`

## 构建命令

```bash
# 每次网站改完后运行
python tools/build-fanke.py
```

脚本自动判断单块/双块模式并输出：

```
========================================
  凡科代码块构建
========================================

  模式: 单代码块（未超 50,000 字符限制）

  代码块1 (全部):
    字符数: 14,473
    上限:   50,000
    剩余:   35,527
    状态:   [OK]

  输出文件: dist/fanke-block1.html

  提示: 将 dist/fanke-block1.html 内容粘贴到凡科"代码块1"即可。
```

## 凡科平台分析

基于 `凡科代码.txt`（凡科实际页面源码）分析：

```
body
└── div#jzRoot (data-server-rendered="true")
    └── div#jz_web
        └── div#jzWebContainer (col_xxx)
            └── [页面模块内容 — 代码块渲染在此]
```

关键结论：
- 代码块渲染在 `#jzWebContainer` 内，**不是 iframe**，CSS 全局生效
- 凡科类名前缀为 `jz_`，我们的类名不冲突
- 凡科 CSS 变量用 `--theme-*`，我们用 `--color-*`，不冲突
- 支持 `clamp()`、`vw`、CSS Grid、IntersectionObserver（现代浏览器均支持）

## 字符数追踪

| 代码块 | 内容 | 当前大小 | 剩余 |
|--------|------|----------|------|
| 代码块1 | 主页面（Hero + 主体 + Footer + 完整 CSS + 完整 JS + GSAP CDN） | ~47.9K | ~2.1K |
| 代码块2 | 详情面板 ×12（精简 CSS + HTML + XZT 桥接） | ~48.1K | ~1.9K |

> 注意：GSAP CDN 脚本已从 `<head>` 移至 `<body>` 开头，确保构建脚本包含它们。

## 上线检查清单

- [ ] 运行 `python tools/build-fanke.py` 确认字符数 ≤ 50,000
- [ ] 代码块包含完整 `:root` CSS 变量定义
- [ ] `@font-face` 字体路径已更新为凡科文件库 URL
- [ ] 所有 JS 使用 `window.XUZITENG` 命名空间 + IIFE
- [ ] 跨块通信使用 `CustomEvent`
- [ ] 图片使用凡科文件库的绝对 URL
- [ ] 在凡科预览环境中验证：首屏无滚动、箭头点击跳转、跑马灯滚动
