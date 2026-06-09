# CLAUDE.md — XUZITENG 设计师个人作品集网站

## 项目简介
这是 XUZITENG 的个人设计师作品集网站。基于 Figma 设计稿还原，纯静态 HTML/CSS/JS，无框架，无构建步骤。

## 标准文件路径

以下文件定义了项目的核心规范，任何改动都应符合这些标准：

| 文件 | 路径 | 说明 |
|------|------|------|
| 开发需求 | [docs/requirements.md](docs/requirements.md) | 功能需求、优先级、目标用户 |
| 技术规范 | [docs/tech-spec.md](docs/tech-spec.md) | 技术栈、项目结构、代码规范、断点、性能指标 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 色彩系统、字体层级、间距系统、组件规范 |
| 执行步骤 | [docs/execution-steps.md](docs/execution-steps.md) | 开发流程、日常流程、AI 协作指引 |
| 凡科部署 | [docs/fanke-deploy-guide.md](docs/fanke-deploy-guide.md) | 代码块拆分策略、命名空间规范、生成脚本 |
| 开发日志 | [dev-logs/](dev-logs/) | 每日开发记录 |

## 工作说明

### 开始任何代码修改前
1. **必须**先阅读 `docs/design-spec.md` 确认设计参数（颜色、字号、间距）
2. **必须**先阅读 `docs/tech-spec.md` 确认代码规范（命名、结构、断点）
3. 如涉及功能变更，阅读 `docs/requirements.md` 确认优先级
4. **必须**先列原因分析、任务卡和修改步骤
5. **必须**申请修改许可，经过许可后才能开始修改

### 修改代码时
- 保持零外部依赖，不使用任何库或框架
- 遵循 BEM 风格 CSS 命名
- 所有 JS 代码放在 `window.XUZITENG` 命名空间下，使用 IIFE 包裹
- 跨代码块通信使用 `CustomEvent`（如箭头点击 → 滚动跳转）
- 新功能先适配移动端，再增强桌面体验
- 颜色使用 `var(--color-*)` CSS 变量，禁止硬编码色值
- 改动涉及设计参数变化时，同步更新 `docs/design-spec.md`

### 每日结束时
- 在 `dev-logs/` 创建或更新当日 `YYYY-MM-DD.md`
- 记录完成事项和待办事项
- 使用 `dev-logs/_template.md` 作为模板

### 代码提交前
- 确保 1200px / 900px / 600px 三个断点下布局正常
- 检查是否有硬编码的色值或尺寸（应使用 CSS 变量）
- HTML 保持语义化标签，不滥用 `<div>`

## 关键文件索引
- 主页面：[index.html](index.html)
- 样式：[styles.css](styles.css)
- 脚本：[main.js](main.js)
- Figma 原始导出：[1.txt](1.txt)（仅作参考，不直接使用）

## 快速命令
- 预览：`python -m http.server 8080` → http://localhost:8080
- 构建凡科代码块：`python tools/build-fanke.py` → `dist/fanke-block1.html` + `dist/fanke-block2.html`
- 构建后字符数检查：`python tools/build-fanke.py` 会自动统计并验证 ≤ 50,000 字符
