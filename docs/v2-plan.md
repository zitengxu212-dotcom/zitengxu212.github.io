# XUZITENG v2 个人网站方案

## 参考来源
基于 jasminegunarto.com 源码逐区块分析后制定。技术栈：GSAP ScrollTrigger + 原生 CSS/JS，零框架，纯静态 HTML。

---

## 页面结构

```
① Hero (100vh)
   - 视频/CSS 动画背景
   - 大标题 "XUZITENG"
   - 副标题 "DESIGNER & CREATIVE DIRECTOR"
   - Scroll down 指示器

② About (min 100vh)
   - 文字遮罩揭开动画
   - "CREATING MOTION WITH MEANING"
   - 侧边小字 "PURPOSEFUL Design"

③ Work Grid (自适应)
   - 4-6 个作品卡片，编号 01-06
   - hover：静态图 → 动态预览（GIF/视频）
   - 卡片视差滚动
   - 标签（Brand / Spatial / Graphic）
   - "See All Work" CTA

④ Contact (60vh)
   - "Get in Touch"
   - Email + Social 预留

⑤ Footer
   - 简约底栏
```

---

## 逐区块动效实现方案

### ① Hero

| 元素 | 技术 | 实现细节 |
|------|------|---------|
| 背景 | `<video autoplay loop muted playsinline>` 或 CSS 渐变动画 | 若没有视频，用 Canvas 粒子几何动画替代 |
| 大标题 | GSAP `fromTo` | `opacity: 0, y: 80 → opacity: 1, y: 0`，延迟 0.5s 触发 |
| 副标题 | 同标题 | 两段文字左右错位 |
| Scroll down | 固定底部，CSS 上下浮动动画 | `@keyframes bounce` + 点击 `scrollIntoView` |

### ② About — 文字遮罩揭开（核心效果）

**这是目标网站最关键的动效**。实现方式：

```html
<div class="t-line">
  <div class="t-line-mask">          <!-- overflow: hidden -->
    <div class="hg-1">CREATING</div> <!-- transform: translateY(100%) → 0 -->
  </div>
</div>
```

```css
.t-line-mask {
  overflow: hidden;
  display: block;
}
.hg-1 {
  transform: translateY(100%);
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.hg-1.revealed {
  transform: translateY(0);
}
```

**触发**：GSAP ScrollTrigger，`.t-line` 进入视口 80% 时添加 `.revealed` class。

**文字内容**：
- "CREATING"
- "MOTION"  
- "WITH MEANING"
- 侧边小字：`PURPOSEFUL Design` / `Narrative through ANIMATION`

### ③ Work Grid — 卡片交互

**卡片结构**：
```html
<div class="work-card" data-parallax="8">
  <div class="card-media">
    <img class="card-img-static" src="cover.jpg">     <!-- 静态封面 -->
    <video class="card-img-hover" muted loop playsinline>  <!-- hover 播放 -->
      <source src="preview.mp4">
    </video>
  </div>
  <div class="card-info">
    <span class="card-num">01</span>
    <h3 class="card-title">Project Name</h3>
    <div class="card-tags"><span>Brand</span><span>Design</span></div>
  </div>
</div>
```

| 效果 | 实现 |
|------|------|
| **hover 视频切换** | CSS：`.card-img-hover { opacity: 0; }` → `.work-card:hover .card-img-hover { opacity: 1; }` |
| **卡片视差** | JS 监听卡片进入视口 → 图片区 translateY 偏移量 = 卡片距视口中心距离 × 0.08 |
| **编号** | 01-06，大号半透明文字，绝对定位 |
| **标签** | 纯 CSS flex 排列，圆角标签 |
| **响应式** | 2 列桌面 → 1 列 600px↓ |

**卡片 hover 视频降级方案**：如果没有视频，用 CSS `filter: grayscale(0)→grayscale(100%)` 或 `scale(1)→scale(1.05)` 替代。

### ④ Contact

- 大标题 "Get in Touch"
- 2 个链接：Email / Social（`href="#"` 预留）
- 下方小字 "Currently available for commissions"

### ⑤ Footer

- `© 2026 XUZITENG. All rights reserved.`

---

## 视觉效果清单

| 效果 | 所在区块 | 实现 |
|------|---------|------|
| 视频/动画背景 | ① Hero | `<video>` 或 Canvas 粒子 |
| 标题淡入 | ① Hero | GSAP fromTo |
| Scroll down 浮动 | ① Hero | CSS keyframes |
| **文字遮罩揭开** | ② About | `.t-line-mask` + `translateY(100%)→0` + ScrollTrigger |
| **卡片 hover 视频** | ③ Work Grid | CSS opacity 切换 静态图↔视频 |
| **卡片视差** | ③ Work Grid | JS scroll 监听 + translateY 偏移 |
| 侧边小字 | ② About | 绝对定位或 Grid 布局 |
| CTA hover | ③ Work Grid | 下划线滑入动画 |

---

## 技术栈

| 层 | 技术 |
|----|------|
| 动效 | GSAP 3.12（ScrollTrigger） |
| 文字遮罩 | 原生 CSS `overflow: hidden` + `transform` |
| 卡片视差 | 原生 JS `scroll` 事件 + `transform` |
| 视频 | HTML5 `<video>` |
| 布局 | CSS Grid + Flexbox |
| 响应式 | 900px / 600px 断点 |
| 字体 | Desolator 本地 → Manrope（Google Fonts，与参考站一致） |

---

## 文件规划

| 文件 | 操作 |
|------|------|
| `index-v2.html` | **新建** — 完整单文件（内联 CSS + JS） |
| `styles.css` | 不修改 |
| `main.js` | 不修改 |

单文件结构：
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>XUZITENG</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <style>/* 全部 CSS */</style>
</head>
<body>
  <!-- ① Hero -->
  <!-- ② About -->
  <!-- ③ Work Grid -->
  <!-- ④ Contact -->
  <!-- ⑤ Footer -->
  <script>/* 全部 JS */</script>
</body>
</html>
```

---

## 颜色方案

沿用现有品牌色 + 参考站深色系：

| 变量 | 色值 | 用途 |
|------|------|------|
| `--color-pink` | `#FF43B4` | Hero 背景/强调色 |
| `--color-yellow` | `#FFF9C7` | 高亮/CTAs |
| `--color-dark` | `#090909` | 深色背景（参考站 preloader） |
| `--color-cream` | `#EBEAE4` | 浅色文字（参考站 preloader 文字） |
| `--color-white` | `#FFFFFF` | 主文字 |
| `--color-black` | `#000000` | 卡片背景 |

---

## 验证方式

1. `python -m http.server 8080` → `http://localhost:8080/index-v2.html`
2. 检查 5 个 section 完整显示
3. 滚动验证：Hero 标题淡入、About 文字遮罩揭开、Work Grid 卡片视差
4. hover 卡片验证视频/图片切换
5. 点击 scroll down 验证平滑滚动
6. 900px / 600px 检查响应式
