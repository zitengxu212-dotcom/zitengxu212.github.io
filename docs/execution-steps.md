# 执行步骤

## 开发流程

### 第一阶段：页面还原 ✓
1. 从 Figma 导出 HTML，放置于 `1.txt` 作为设计参考
2. 分析布局结构、提取颜色/字体/尺寸参数
3. 将绝对定位布局转为语义化 HTML + CSS Grid/Flexbox
4. 创建响应式断点适配移动端

### 第二阶段：交互增强
1. 添加缩略图悬停效果
2. 实现横向滚动拖拽
3. 添加入场动画（IntersectionObserver）
4. 分类标签点击切换

### 第三阶段：内容填充
1. 准备作品图片（WebP 格式，压缩至 ≤ 200KB）
2. 撰写 Awards 实际获奖名称
3. 填充社交链接和联系方式
4. 准备个人头像/logo

### 第四阶段：部署
1. 选择托管平台（推荐 Vercel）
2. 配置自定义域名
3. 设置 HTTPS
4. 提交搜索引擎收录

## 日常开发流程

1. 在 `dev-logs/` 创建当日 `YYYY-MM-DD.md`
2. 列出当日待办事项
3. 逐项完成后标记 [x]
4. 记录遇到的问题和解决方案
5. 提交代码前检查 CLAUDE.md 中的规范要求

## 与 AI 协作指引

1. 启动新任务时，AI 应先阅读 `docs/` 中的规范文件
2. 修改代码需同步更新受影响的文档
3. 每日结束时在 `dev-logs/` 记录进度
4. 遇到设计/技术决策分歧时，以 `docs/` 中规范为准

## 触发词规则

当用户说出以下触发词时，直接执行对应流程，无需重复确认步骤。

### "更新详情页"
将 `data/projects-content.md` 的内容同步到 `index.html` 详情面板。

**执行步骤**：
1. 读取 `data/projects-content.md`，解析所有项目（按 `---` 分隔）
2. 读取 `index.html` 中 `#project-detail-panel` 内对应 `<article>`
3. 逐项对比并替换：标题（`.detail-title`）、Meta（`dt/dd`）、EN 描述（`.detail-en`）、CN 描述（`.detail-cn`）
4. 检查无残留占位文案（如 "English description for Project X"）
5. 更新 `main.js` 版本号（`v=X` → `v=X+1`）

**注意**：
- 只替换文字内容，不改动 HTML 结构和 SVG 图标
- 如 md 中某字段有多行值（如多个 Award），用 `<br>` 分隔

---

### "更新图片"
扫描 `images/` 文件夹，检查更新并同步到网站。

**执行步骤**：

**一、扫描对比**
1. 列出 `images/01/` ~ `images/10/`（及可能新增的 11、12…）下所有图片文件
2. 对比 `main.js` 中 `_cardImages` 和 `_galleryImages` 的引用，找出差异：
   - 文件新增/减少
   - 文件名变化
   - 格式变化（jpg→png 等）

**二、现有项目图片更新**
3. 如有新增或替换的图片 → 运行 `python tools/compress-images.py` 压缩并转 webp
4. 更新 `main.js` 中对应的 `_cardImages[id]` 和 `_galleryImages[id]` 条目
5. 如该图片在 `index.html` 中有内联引用（如卡片 `src`），同步更新

**三、新项目（新增文件夹 11、12…）**
6. 确认新文件夹编号、包含的图片列表
7. 在 `main.js` 的 `projects` 注册表中新增条目（number、title 暂用占位，tags/category 根据图片内容推断）
8. 在 `_cardImages` 和 `_galleryImages` 中新增对应条目
9. 在 `index.html` 的 `#project-detail-panel` 中复制一个 `<article>` 模板，修改 `id` 和 `data-project` 为新编号，标题和 Meta 写占位值
10. 在 `index.html` 的 `.carousel-track` 中新增 2 张卡片（`data-detail` + `onclick`）
11. 在 `data/projects-content.md` 末尾追加新项目框架（`# XX — 项目名称` + `## Meta` + `## EN` + `## CN`）
12. 汇报新增项目，提醒用户填写标题、Meta、描述文字

**四、禁区（不可触碰）**
- **绝对禁止**对以下文件进行任何操作：`stamp-cursor.png`、`stamp-full.png`
- 这两张是印章光标和盖章图，必须保持 PNG 格式（透明背景），不压缩、不删改、不转格式
- 如 `images/` 根目录有其他 `.png` 文件（如 `qq-qr.png`、`wechat-qr.png`），同样保持原样不动

**五、收尾**
13. 更新 `index.html` 中 `main.js` 和 `styles.css` 的版本号
14. 汇总本次变更（哪些图片更新、哪些项目新增）
15. 如涉及新增项目，提醒用户后续需手动填写 `projects-content.md` 中的文案
