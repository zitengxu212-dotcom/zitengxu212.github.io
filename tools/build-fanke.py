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


def build_split_blocks():
    """超限时拆分为两个代码块"""
    html = read_file('index.html')
    css = read_file('styles.css')
    js = read_file('main.js')

    css_min = minify_css(css)

    # 代码块1 JS: 打字动画 + 箭头滚动
    block1_js = (
        "(function(){"
        "var lines=document.querySelectorAll('.hero-title > span[data-text]');"
        "var cl=0;"
        "function tl(i){"
        "if(i>=lines.length)return;"
        "var el=lines[i];"
        "var ft=el.getAttribute('data-text');"
        "el.classList.add('typed');"
        "var ci=0;"
        "var iv=setInterval(function(){"
        "el.textContent=ft.slice(0,ci+1);ci++;"
        "if(ci>ft.length){clearInterval(iv);el.classList.remove('typed');el.classList.add('done');cl++;setTimeout(function(){tl(cl)},150)}"
        "},80)}"
        "tl(0);"
        "var arrow=document.querySelector('.hero-decoration');"
        "if(arrow){arrow.addEventListener('click',function(){"
        "document.dispatchEvent(new CustomEvent('xuziteng:scroll-to-content'))"
        "})}"
        "})();"
    )

    # 代码块2 JS: 其他所有交互
    block2_js = minify_js(js)

    # 拆分 HTML
    hero_match = re.search(r'<section class="hero">.*?</section>', html, re.DOTALL)
    if not hero_match:
        print('ERROR: 未找到 <section class="hero"> 区域')
        sys.exit(1)

    hero_html = hero_match.group(0)
    hero_end = hero_match.end()
    rest_html = html[hero_end:].strip()
    # 移除 <script src="main.js"> 引用
    rest_html = re.sub(r'<script src="main\.js"></script>', '', rest_html)

    block1 = '\n'.join([
        '<!-- 代码块1: Hero 区域 -->',
        '<style>' + css_min + '</style>',
        hero_html,
        '<script>' + block1_js + '</script>'
    ])

    block2 = '\n'.join([
        '<!-- 代码块2: 主体内容（因代码块1超限而拆分） -->',
        '<style>' + css_min + '</style>',
        rest_html,
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

    for name, blk, ok in [('代码块1 (Hero)', block1, b1_ok),
                           ('代码块2 (Content)', block2, b2_ok)]:
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
