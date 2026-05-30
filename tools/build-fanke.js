/**
 * 凡科代码块构建脚本 (Node.js 版)
 * 用法: node tools/build-fanke.js
 *
 * 规则: 默认全部放入代码块1，仅当超过 50,000 字符时拆分到代码块2
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MAX_CHARS = 50000;

// ── 读取 ──
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const css  = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf-8');
const js   = fs.readFileSync(path.join(ROOT, 'main.js'), 'utf-8');

// ── 压缩 ──
const minifyCSS = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>+~])\s*/g, '$1').replace(/;}/g, '}').trim();
const minifyJS  = (s) => s.replace(/\/\/.+/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*[\r\n]/gm, '').replace(/\n\s*/g, '\n').trim();

const cssMin = minifyCSS(css);
const jsMin  = minifyJS(js);

// ── 构建完整单块 ──
function buildFullBlock() {
  const body = html
    .replace(/^[\s\S]*?<body>\s*/i, '')
    .replace(/\s*<\/body>[\s\S]*$/i, '')
    .replace(/<script src="main\.js"><\/script>/g, '')
    .trim();

  return '<!-- 代码块1: 全部内容 -->\n<style>' + cssMin + '</style>\n' + body + '\n<script>' + jsMin + '</script>';
}

// ── 构建拆分双块 ──
function buildSplitBlocks() {
  const heroMatch = html.match(/<section class="hero">[\s\S]*?<\/section>/);
  if (!heroMatch) { console.error('ERROR: 未找到 hero 区域'); process.exit(1); }

  const heroHTML = heroMatch[0];
  const restHTML = html.slice(html.indexOf('</section>', html.indexOf('<section class="hero">')) + '</section>'.length)
    .replace(/<script src="main\.js"><\/script>/g, '')
    .trim();

  const b1js = "(function(){var lines=document.querySelectorAll('.hero-title > span[data-text]');var cl=0;function tl(i){if(i>=lines.length)return;var el=lines[i];var ft=el.getAttribute('data-text');el.classList.add('typed');var ci=0;var iv=setInterval(function(){el.textContent=ft.slice(0,ci+1);ci++;if(ci>ft.length){clearInterval(iv);el.classList.remove('typed');el.classList.add('done');cl++;setTimeout(function(){tl(cl)},150)}},80)}tl(0);var arrow=document.querySelector('.hero-decoration');if(arrow){arrow.addEventListener('click',function(){document.dispatchEvent(new CustomEvent('xuziteng:scroll-to-content'))})}})();";

  return [
    '<!-- 代码块1: Hero -->\n<style>' + cssMin + '</style>\n' + heroHTML + '\n<script>' + b1js + '</script>',
    '<!-- 代码块2: Content -->\n<style>' + cssMin + '</style>\n' + restHTML + '\n<script>' + jsMin + '</script>'
  ];
}

// ── 输出 ──
const distDir = path.join(ROOT, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

const fullBlock = buildFullBlock();

if (fullBlock.length <= MAX_CHARS) {
  fs.writeFileSync(path.join(distDir, 'fanke-block1.html'), fullBlock);
  const b2 = path.join(distDir, 'fanke-block2.html');
  if (fs.existsSync(b2)) fs.unlinkSync(b2);

  console.log('='.repeat(40));
  console.log('  凡科代码块构建');
  console.log('='.repeat(40));
  console.log('\n  模式: 单代码块（未超 50,000 字符限制）\n');
  console.log('  代码块1 (全部):');
  console.log('    字符数: ' + fullBlock.length.toLocaleString());
  console.log('    上限:   ' + MAX_CHARS.toLocaleString());
  console.log('    剩余:   ' + (MAX_CHARS - fullBlock.length).toLocaleString());
  console.log('    状态:   [OK]\n');
  console.log('  输出文件: dist/fanke-block1.html\n');
  console.log('  提示: 将 dist/fanke-block1.html 内容粘贴到凡科"代码块1"即可。');
} else {
  const [b1, b2] = buildSplitBlocks();
  fs.writeFileSync(path.join(distDir, 'fanke-block1.html'), b1);
  fs.writeFileSync(path.join(distDir, 'fanke-block2.html'), b2);

  console.log('='.repeat(40));
  console.log('  凡科代码块构建');
  console.log('='.repeat(40));
  console.log('\n  模式: 拆分双代码块（超过 50,000 字符限制）\n');
  [['代码块1 (Hero)', b1], ['代码块2 (Content)', b2]].forEach(([n, b]) => {
    console.log('  ' + n + ':');
    console.log('    字符数: ' + b.length.toLocaleString());
    console.log('    上限:   ' + MAX_CHARS.toLocaleString());
    console.log('    剩余:   ' + (MAX_CHARS - b.length).toLocaleString());
    console.log('    状态:   ' + (b.length <= MAX_CHARS ? '[OK]' : '[FAIL]'));
    console.log();
  });
  console.log('  输出文件: dist/fanke-block1.html, dist/fanke-block2.html\n');
  console.log('  提示: 将两个文件分别粘贴到凡科"代码块1"和"代码块2"中。');
}
