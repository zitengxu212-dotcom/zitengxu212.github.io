# 技术规范

## 技术栈
- **前端**：纯 HTML5 + CSS3 + Vanilla JavaScript（无框架）
- **部署**：静态托管（待定：Vercel / Netlify / GitHub Pages）
- **字体**：Desolator（本地优先）→ Courier New → Noto Sans SC → monospace

## 项目结构
```
/
├── index.html          # 主页面
├── styles.css          # 全局样式
├── main.js             # 交互逻辑
├── assets/             # 静态资源（图片、字体）
│   ├── images/
│   └── fonts/
├── dev-logs/           # 开发日志
│   ├── _template.md
│   └── YYYY-MM-DD.md
├── docs/               # 项目文档
│   ├── requirements.md
│   ├── tech-spec.md
│   ├── design-spec.md
│   └── execution-steps.md
└── CLAUDE.md           # AI 助手指引
```

## 代码规范
- HTML：语义化标签（`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`）
- CSS：CSS 自定义属性（`--color-*`），BEM 命名风格，移动优先响应式
- JS：ES6+，事件委托优先，使用 IntersectionObserver 做滚动动画
- 无外部依赖，零构建步骤

## 响应式断点
| 断点 | 目标设备 |
|------|----------|
| ≤ 600px | 手机 |
| ≤ 900px | 平板 |
| ≤ 1200px | 小屏笔记本 |
| > 1200px | 桌面（基准 1152px） |

## 性能指标
- Lighthouse Performance ≥ 90
- 首屏加载 < 2s
- 图片使用 WebP + 占位图 fallback

## 浏览器兼容
- 使用 `clamp()` / CSS Grid / IntersectionObserver（均有良好支持）
- 不使用需要 polyfill 的 API
