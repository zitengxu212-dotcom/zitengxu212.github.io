"""
凡科代码块构建脚本
用法: python tools/build-fanke.py
输出: dist/fanke-block1.html（必需），dist/fanke-block2.html（仅在超过 50,000 字符时生成）

规则:
- 默认所有代码放入代码块1
- 仅当代码块1超过 50,000 字符时，将超出部分拆分到代码块2
- 每个代码块独立可运行，包含自身所需的完整 CSS + HTML + JS
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAX_CHARS = 50000


def read_file(filename):
    with open(os.path.join(ROOT, filename), 'r', encoding='utf-8') as f:
        return f.read()


def minify_css(css_text):
    css_text = re.sub(r'/\*.*?\*/', '', css_text, flags=re.DOTALL)
    css_text = re.sub(r'\s+', ' ', css_text)
    css_text = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', css_text)
    css_text = css_text.replace(';}', '}')
    return css_text.strip()


def minify_js(js_text):
    js_text = re.sub(r'//.+\n', '\n', js_text)
    js_text = re.sub(r'/\*.*?\*/', '', js_text, flags=re.DOTALL)
    js_text = re.sub(r'\n\s*\n', '\n', js_text)
    js_text = re.sub(r'^\s+', '', js_text, flags=re.MULTILINE)
    return js_text.strip()


def build_full_block():
    """将全部 HTML + CSS + JS 组装为单个代码块"""
    html = read_file('index.html')
    css = read_file('styles.css')
    js = read_file('main.js')

    css_min = minify_css(css)
    js_min = minify_js(js)

    # 提取 <body> 内的非 DOCTYPE/head 内容
    body_match = re.search(r'<body>[\s\S]*?</body>', html, re.DOTALL)
    if body_match:
        body_html = body_match.group(0)
        # 移除 <body> 和 </body> 标签本身
        body_html = re.sub(r'^<body>\s*', '', body_html)
        body_html = re.sub(r'\s*</body>$', '', body_html)
        # 移除 <script src="main.js"> 引用（JS 已内联）
        body_html = re.sub(r'<script src="main\.js"></script>', '', body_html)
    else:
        body_html = html

    block = '\n'.join([
        '<!-- 代码块1: 全部内容 -->',
        '<style>' + css_min + '</style>',
        body_html.strip(),
        '<script>' + js_min + '</script>'
    ])

    return block, len(block)


def minify_html_aggressive(html_text):
    """激进 HTML 压缩：去除所有标签间空白，用于体积大的片段"""
    html_text = re.sub(r'>\s+<', '><', html_text)
    html_text = re.sub(r'\s{2,}', ' ', html_text)
    lines = [l.strip() for l in html_text.split('\n') if l.strip()]
    return ''.join(lines)


def extract_detail_css(css_text):
    """从完整 CSS 中提取详情面板需要的规则（变量 + reset + 面板样式 + 响应式）"""
    rules = []
    # 1. @font-face
    ff = re.search(r'@font-face\s*\{[^}]*\}', css_text)
    if ff:
        rules.append(ff.group(0))
    # 2. :root 变量
    root = re.search(r':root\s*\{[^}]*\}', css_text)
    if root:
        rules.append(root.group(0))
    # 3. Reset (*, html, body, img, a, ul)
    for sel in [r'\*\s*,\s*\*::before\s*,\s*\*::after', 'html', 'body', 'img', 'a', 'ul']:
        m = re.search(sel + r'\s*\{[^}]*\}', css_text)
        if m:
            rules.append(m.group(0))
    # 4. Detail panel rules: .project-detail-panel through end of file
    #    also include .main-header (fixed header needed for detail overlay)
    detail_start = css_text.find('.project-detail-panel')
    header_start = css_text.find('.main-header {')
    if header_start != -1:
        header_end = css_text.find('}', header_start) + 1
        # Grab the full .main-header block (multi-rule)
        header_match = re.search(r'\.main-header\s*\{[^}]*\}', css_text)
        if header_match:
            rules.append(header_match.group(0))
        # .main-header-inner and children
        for inner in [r'.main-header-inner', r'.main-header-inner .location', r'.main-header-inner .coords',
                       r'.main-header-inner .time', r'.main-header-inner nav', r'.nav-item__outer .nav-item',
                       r'.nav-item__outer:hover .nav-item']:
            m = re.search(re.escape(inner) + r'\s*\{[^}]*\}', css_text)
            if m:
                rules.append(m.group(0))
    if detail_start != -1:
        detail_css = css_text[detail_start:]
        # Include all detail + responsive rules at the end
        rules.append(detail_css)
    return '\n'.join(rules)


def build_split_blocks():
    """拆分为两个代码块：主页面（代码块1） + 详情面板（代码块2）"""
    html = read_file('index.html')
    css = read_file('styles.css')
    js = read_file('main.js')

    css_min = minify_css(css)
    js_min = minify_js(js)

    # ── 拆分点：详情面板起始标签 ──
    split_marker = '<div class="project-detail-panel"'
    split_idx = html.find(split_marker)
    if split_idx == -1:
        print('ERROR: 未找到 <div class="project-detail-panel"> 区域')
        sys.exit(1)

    # ── 代码块1：主页面（Hero + 主体内容 + Footer）──
    block1_html = html[:split_idx]

    # 去掉 doctype / head / 开篇 body 标签
    body_match = re.search(r'<body>[\s\S]*', block1_html, re.DOTALL)
    if body_match:
        block1_html = body_match.group(0)
        block1_html = re.sub(r'^<body>\s*', '', block1_html)

    # 去掉 main.js 外部引用（JS 已内联）
    block1_html = re.sub(r'<script src="main\.js"></script>', '', block1_html)

    # ── 代码块2：详情面板 ──
    block2_html = html[split_idx:]

    # 去掉末尾的 </body></html>（凡科容器自带）
    block2_html = re.sub(r'\s*</body>\s*</html>\s*$', '', block2_html)
    block2_html = re.sub(r'<script src="main\.js"></script>', '', block2_html)

    # 激进压缩 Block 2 的 HTML（详情面板 ~45KB，压缩可节省 ~6-8KB）
    block2_html = minify_html_aggressive(block2_html)

    # ── 组装 ──
    block1 = '\n'.join([
        '<!-- 代码块1: 主页面 -->',
        '<style>' + css_min + '</style>',
        block1_html.strip(),
        '<script>' + js_min + '</script>'
    ])

    # Block 2: 详情面板 + 精简 CSS（仅面板相关样式 + 变量）+ XZT 命名空间桥接
    detail_css = minify_css(extract_detail_css(css))
    block2_js = 'window.XZT=window.XZT||{};'
    block2 = '\n'.join([
        '<!-- 代码块2: 项目详情面板 -->',
        '<style>' + detail_css + '</style>',
        block2_html,
        '<script>' + block2_js + '</script>'
    ])

    return block1, block2


# ── 主流程 ──
dist_dir = os.path.join(ROOT, 'dist')
os.makedirs(dist_dir, exist_ok=True)

# 先尝试单块
full_block, full_len = build_full_block()

print('=' * 40)
print('  凡科代码块构建')
print('=' * 40)
print()

if full_len <= MAX_CHARS:
    # 单块模式
    with open(os.path.join(dist_dir, 'fanke-block1.html'), 'w', encoding='utf-8') as f:
        f.write(full_block)

    # 删除可能存在的旧 block2
    block2_path = os.path.join(dist_dir, 'fanke-block2.html')
    if os.path.exists(block2_path):
        os.remove(block2_path)

    print('  模式: 单代码块（未超 50,000 字符限制）')
    print()
    print(f'  代码块1 (全部):')
    print(f'    字符数: {full_len:,}')
    print(f'    上限:   {MAX_CHARS:,}')
    print(f'    剩余:   {MAX_CHARS - full_len:,}')
    print(f'    状态:   [OK]')
    print()
    print('  输出文件: dist/fanke-block1.html')
    print()
    print('  提示: 将 dist/fanke-block1.html 内容粘贴到凡科"代码块1"即可。')
else:
    # 拆分模式
    print('  模式: 拆分双代码块（超过 50,000 字符限制）')
    print()

    block1, block2 = build_split_blocks()

    with open(os.path.join(dist_dir, 'fanke-block1.html'), 'w', encoding='utf-8') as f:
        f.write(block1)
    with open(os.path.join(dist_dir, 'fanke-block2.html'), 'w', encoding='utf-8') as f:
        f.write(block2)

    b1_ok = len(block1) <= MAX_CHARS
    b2_ok = len(block2) <= MAX_CHARS

    for name, blk, ok in [('代码块1 (主页面)', block1, b1_ok),
                           ('代码块2 (详情面板)', block2, b2_ok)]:
        print(f'  {name}:')
        print(f'    字符数: {len(blk):,}')
        print(f'    上限:   {MAX_CHARS:,}')
        print(f'    剩余:   {MAX_CHARS - len(blk):,}')
        print(f'    状态:   {"[OK]" if ok else "[FAIL] 超出上限!"}')
        print()

    print('  输出文件:')
    print('    dist/fanke-block1.html')
    print('    dist/fanke-block2.html')
    print()
    print('  提示: 将两个文件分别粘贴到凡科"代码块1"和"代码块2"中。')

    if not (b1_ok and b2_ok):
        print('WARNING: 有代码块仍超出 50,000 字符上限，请手动拆分!')
        sys.exit(1)
