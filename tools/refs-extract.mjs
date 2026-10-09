#!/usr/bin/env node
/**
 * refs-extract.mjs — 参考文件 OCR 流水线（扫描版 PDF → 可检索文本 + 质量报告）
 *
 * 目标：把「参考文件/」下的扫描件 PDF 转成可检索文本，供 Athena 2.2.0 的
 * 考纲覆盖矩阵与内容检索使用。本脚本是流水线的唯一入口，也是 Python worker
 * 的唯一来源（worker 会被写入 参考文件/_venv/refs_worker.py）。
 *
 * 本地 OCR 依赖（不联网、不装 npm 依赖）：
 *   - Python: 参考文件/_venv/Scripts/python.exe
 *     · pymupdf（渲染 PDF 页面，处理 /Rotate 与像素上限）
 *     · onnxruntime + numpy（跑 PP-OCRv4 的 det / cls / rec 三个 ONNX 模型）
 *   - 模型: 参考文件/_models/*.onnx + ppocr_keys_v1.txt
 *     （来自 rapidocr-onnxruntime 内置的中文 PP-OCRv4 权重，已解包到该目录）
 *
 * 两条切行路径（每页都跑，按「字符数 × 均分」选优，页记录里的 method 字段说明采用哪条）：
 *   - det        PP-OCRv4 检测器切行（正文页准确率高）
 *   - projection 行投影兜底切行（检测器整段漏检的稀疏扫描页靠它救回）
 * 详见 参考文件/_extract/quality-report.md「方法与选优规则」。
 *
 * 为什么不用 opencv / rapidocr 直接跑：本机 PyPI 大文件下载会挂死
 * （opencv-python、scipy 均无法下载），而 rapidocr-onnxruntime 1.4.4 的
 * wheel 已缓存。因此流水线只保留 onnxruntime + numpy，opencv 的
 * connectedComponents / minAreaRect / resize 由 worker 内纯 numpy 实现替代。
 *
 * 命令：
 *   node tools/refs-extract.mjs probe    [选项]   # 探测文本层、页数、体积
 *   node tools/refs-extract.mjs sample   [选项]   # 小样本质量验证（默认每份 5 页）
 *   node tools/refs-extract.mjs extract  [选项]   # 全量抽取 → 参考文件/_extract/
 *   node tools/refs-extract.mjs report   [选项]   # 汇总质量报告
 *   node tools/refs-extract.mjs status            # 打印已落盘进度
 *   node tools/refs-extract.mjs worker-path       # 打印本次运行使用的 worker 副本路径
 *
 * 常用选项：
 *   --files a,b        只处理文件名包含 a 或 b 的 PDF（默认全部目标）
 *   --pdf-paths p1,p2  直接指定 PDF 路径（相对 参考文件/ 或绝对路径），忽略默认目标
 *   --pages 1-5,20     只处理指定页（配合 extract/sample）
 *   --sample 5         抽样页数（sample 命令，默认 5）
 *   --parallel 4       并发 worker 进程数（默认 4）
 *   --threads N        worker 内 onnxruntime 线程数（默认 4）
 *   --dpi 200          渲染 dpi（默认 200，实际受 --max-pixels 限制）
 *   --max-pixels N     单页像素上限（默认 2500000）
 *   --limit-side N     检测器输入长边（默认 1600）
 *   --retry-limit-side N  重试时的检测器长边（默认 2400）
 *   --min-chars N      单页低于该字数时启用重试（默认 450）
 *   --min-avg F        单页均分低于该值时启用重试（默认 0.6）
 *   --min-ink-cov F    墨迹落入检测框的比例低于该值时重试（默认 0.55）
 *   --text-threshold F 低置信行的分数阈值（默认 0.5，仅用于统计低置信行数）
 *   --no-retry         关闭重试（最快，质量略降）
 *   --no-cls           关闭 180° 方向分类器
 *   --recompute        对抽样页穷尽旋转/分辨率取最优（抽样默认开启，全量不开启）
 *   --no-recompute     关闭穷尽取值（全量抽取默认即为关闭）
 *   --with-boxes       页记录附带每行文本框（抽样默认开启）
 *   --no-boxes         关闭逐行文本框（全量默认关闭，体积小）
 *   --text-layer auto  自带文本层的数字版 PDF 直接取内嵌文本、不 OCR（默认 auto；off = 一律 OCR）
 *   --resume           续跑：已有 jsonl 先改名为 .prev.jsonl，抽完按页号合并
 *   --out DIR          输出目录（默认 参考文件/_extract）
 *   --python PATH      指定 python 可执行文件（默认 参考文件/_venv/Scripts/python.exe）
 *   --dry-run          只打印计划，不执行
 *
 * 输出（全部在 参考文件/ 下，已被 .gitignore 忽略，不入库）：
 *   参考文件/_extract/<相对路径去扩展名>.txt     每份 PDF 一个文本文件
 *   参考文件/_extract/<...>.txt 使用「========== 第 N 页 ==========」分页，
 *                               页号是 PDF 物理页号；PDF 带页标签时另起一行写「（书内页码 X）」
 *   参考文件/_extract/_pages/<name>.jsonl       每页元数据（字数/置信度/路径/耗时/旋转/覆盖率）
 *   参考文件/_extract/_logs/<name>.log          worker 原始日志
 *   参考文件/_extract/_tasks/<name>.json        worker 任务文件（可复现单页调试）
 *   参考文件/_extract/_worker/refs_worker.py    本次运行使用的 worker 副本
 *   参考文件/_extract/_sample/                  小样本验证记录与 sample-quality.md
 *   参考文件/_extract/quality-report.md         质量报告（report 命令生成）
 *   参考文件/_extract/quality-notes.md          人工核对与局限（手工撰写，报告末尾原样附上）
 *   参考文件/_extract/index.json / progress.json 文件级汇总与进度快照
 *
 * 说明：worker 只做「渲染 → 检测 → 识别 → 排版」，不做任何纠错或润色，
 * 文本与扫描件不一致之处在 quality-report.md 中如实记录。
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const REFS = path.join(ROOT, '参考文件');
const EXTRACT = path.join(REFS, '_extract');
const MODELS = path.join(REFS, '_models');
const VENV_PY = path.join(REFS, '_venv', 'Scripts', 'python.exe');
const WORKER_COPY = path.join(EXTRACT, '_worker', 'refs_worker.py');

/** 目标扫描件（相对 参考文件/），依 t2 任务范围固化。 */
const DEFAULT_TARGETS = [
  '教材讲义/微观/微观经济学十八讲.pdf',
  '教材讲义/统计/茆诗松+概率论与数理统计教程 第三版.pdf',
  '教材讲义/统计/计量经济学讲义0321.pdf',
  '真题/数学/5、【1987-2025年】考研数学三真题/2023年考研数学三真题.pdf',
  '真题/数学/5、【1987-2025年】考研数学三真题/2024年考研数学三真题.pdf',
  '真题/数学/5、【1987-2025年】考研数学三真题/2025年考研数学三真题.pdf',
];

const PAGE_SEP = (n) => `========== 第 ${n} 页 ==========`;

// ------------------------------------------------------------------ utils ---

function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) { opts._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { opts[key] = true; } else { opts[key] = next; i += 1; }
  }
  return opts;
}

function log(msg) { process.stdout.write(`${msg}\n`); }
function pad(n, w) { return String(n).padStart(w, ' '); }
function fmtNum(v) { return typeof v === 'number' && Number.isFinite(v) ? v.toFixed(3) : '-'; }
function pct(x) { return `${(100 * x).toFixed(1)}%`; }
function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function mkdirp(dir) { fs.mkdirSync(dir, { recursive: true }); }

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  const out = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try { out.push(JSON.parse(t)); } catch { /* partial tail line */ }
  }
  return out;
}

function writeJsonl(file, recs) {
  mkdirp(path.dirname(file));
  fs.writeFileSync(file, recs.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');
}

function targetName(rel) {
  return rel.replace(/\.pdf$/i, '').replace(/[\\/]/g, '__');
}

function safeSlug(s) { return s.replace(/[^\w\u4e00-\u9fff.-]+/g, '_').slice(0, 80); }

function resolveTargets(opts) {
  const filters = opts.files ? String(opts.files).split(',').map((s) => s.trim()).filter(Boolean) : null;
  const explicit = opts['pdf-paths'] ? String(opts['pdf-paths']).split(',').map((s) => s.trim()) : null;
  const list = explicit || DEFAULT_TARGETS;
  const keep = list.filter((rel) => {
    if (!filters) return true;
    return filters.some((f) => rel.toLowerCase().includes(f.toLowerCase()));
  });
  return keep.map((rel) => {
    const abs = path.isAbsolute(rel) ? rel : path.join(REFS, rel);
    return { rel: path.relative(REFS, abs).replace(/\\/g, '/'), abs };
  });
}

function pickPages(total, count) {
  if (total <= 0) return [];
  if (total <= count) return Array.from({ length: total }, (_, i) => i + 1);
  const idx = new Set([1, Math.round(total * 0.25), Math.round(total * 0.5), Math.round(total * 0.75), total]);
  const step = Math.max(1, Math.floor(total / (count + 1)));
  let p = 1 + step;
  while (idx.size < count && p < total) { idx.add(p); p += step; }
  return [...idx].sort((a, b) => a - b);
}

function pythonBin(opts) {
  if (opts.python) return String(opts.python);
  if (fs.existsSync(VENV_PY)) return VENV_PY;
  return process.platform === 'win32' ? 'python' : 'python3';
}

// ----------------------------------------------------------------- worker ---

const WORKER_PY_LINES = [
  "# -*- coding: utf-8 -*-",
  "\"\"\"refs-extract Python worker — OCR pipeline (numpy + onnxruntime + PyMuPDF).",
  "",
  "Generated by tools/refs-extract.mjs (single source of truth is the .mjs);",
  "do not edit the copy under 参考文件/_venv/ by hand.",
  "",
  "Pipeline",
  "  1. PyMuPDF renders each PDF page to BGR uint8 (page /Rotate applied, pixel cap).",
  "  2. PP-OCRv4 det ONNX  -> probability map -> threshold -> connected components",
  "     (pure numpy union-find) -> min-area rectangle per component (convex hull +",
  "     rotating calipers) -> unclip -> visual-line merge.",
  "  3. PP-OCRv4 cls ONNX  -> 180° flip decision per crop.",
  "  4. PP-OCRv4 rec ONNX  -> CTC greedy decode with the dictionary from ONNX metadata.",
  "  5. boxes are regrouped into visual lines and joined (CJK: no intra-line space).",
  "",
  "Usage:  python refs_worker.py --task <task.json>   (see tools/refs-extract.mjs)",
  "\"\"\"",
  "from __future__ import annotations",
  "",
  "import argparse",
  "import json",
  "import math",
  "import os",
  "import statistics",
  "import sys",
  "import time",
  "import traceback",
  "",
  "try:",
  "    sys.stdout.reconfigure(encoding=\"utf-8\", errors=\"replace\")",
  "    sys.stderr.reconfigure(encoding=\"utf-8\", errors=\"replace\")",
  "except Exception:",
  "    pass",
  "",
  "import numpy as np",
  "import onnxruntime as ort",
  "import pymupdf as fitz",
  "",
  "ROTATIONS = (0, 90, 270, 180)",
  "DET_MEAN = (0.485, 0.456, 0.406)",
  "DET_STD = (0.229, 0.224, 0.225)",
  "CLS_MEAN = (0.5, 0.5, 0.5)",
  "CLS_STD = (0.5, 0.5, 0.5)",
  "",
  "",
  "def log(msg: str) -> None:",
  "    sys.stdout.write(str(msg) + \"\\n\")",
  "    sys.stdout.flush()",
  "",
  "",
  "# ------------------------------------------------------------- geometry -----",
  "",
  "",
  "def box_bounds(box):",
  "    \"\"\"Accept either [x0,y0,x1,y1] or a list of [x,y] points.\"\"\"",
  "    if len(box) == 4 and not isinstance(box[0], (list, tuple, np.ndarray)):",
  "        return float(box[0]), float(box[1]), float(box[2]), float(box[3])",
  "    xs = [p[0] for p in box]",
  "    ys = [p[1] for p in box]",
  "    return min(xs), min(ys), max(xs), max(ys)",
  "",
  "",
  "def rect_of(box):",
  "    x0, y0, x1, y1 = box_bounds(box)",
  "    return [round(float(x0), 1), round(float(y0), 1), round(float(x1), 1), round(float(y1), 1)]",
  "",
  "",
  "def quad_area(box) -> float:",
  "    a = 0.0",
  "    n = len(box)",
  "    for i in range(n):",
  "        x1, y1 = box[i]",
  "        x2, y2 = box[(i + 1) % n]",
  "        a += x1 * y2 - x2 * y1",
  "    return abs(a) / 2.0",
  "",
  "",
  "def unclip(box, ratio: float):",
  "    \"\"\"Expand a rectangle by `ratio` * min-side, keeping it inside the image.\"\"\"",
  "    x0, y0, x1, y1 = box_bounds(box)",
  "    h = max(1.0, y1 - y0)",
  "    w = max(1.0, x1 - x0)",
  "    if h >= w:",
  "        px = ratio * h",
  "        py = px * 0.30",
  "    else:",
  "        py = ratio * h",
  "        px = py * 0.60",
  "    return [x0 - px, y0 - py, x1 + px, y1 + py]",
  "",
  "",
  "def convex_hull(points):",
  "    pts = sorted(set(map(tuple, points)))",
  "    if len(pts) <= 2:",
  "        return pts",
  "",
  "    def cross(o, a, b):",
  "        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])",
  "",
  "    lower = []",
  "    for p in pts:",
  "        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:",
  "            lower.pop()",
  "        lower.append(p)",
  "    upper = []",
  "    for p in reversed(pts):",
  "        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:",
  "            upper.pop()",
  "        upper.append(p)",
  "    return lower[:-1] + upper[:-1]",
  "",
  "",
  "def min_area_rect(points):",
  "    \"\"\"Rotating calipers over hull-edge directions + 0/45/90 fallbacks.\"\"\"",
  "    hull = convex_hull(points)",
  "    if len(hull) < 2:",
  "        x, y = hull[0] if hull else (0.0, 0.0)",
  "        return [x, y, x + 1.0, y]",
  "    angles = {0.0, 45.0, 90.0, 135.0}",
  "    for i in range(len(hull)):",
  "        x1, y1 = hull[i]",
  "        x2, y2 = hull[(i + 1) % len(hull)]",
  "        angles.add(math.degrees(math.atan2(y2 - y1, x2 - x1)) % 90.0)",
  "    pts = np.asarray(hull, dtype=np.float64)",
  "    best = None",
  "    for ang in angles:",
  "        th = math.radians(ang)",
  "        c, s = math.cos(th), math.sin(th)",
  "        u = pts[:, 0] * c + pts[:, 1] * s",
  "        v = -pts[:, 0] * s + pts[:, 1] * c",
  "        w = u.max() - u.min()",
  "        h = v.max() - v.min()",
  "        score = w * h",
  "        if best is None or score < best[0]:",
  "            best = (score, ang)",
  "    ang = best[1]",
  "    th = math.radians(ang)",
  "    c, s = math.cos(th), math.sin(th)",
  "    u = pts[:, 0] * c + pts[:, 1] * s",
  "    v = -pts[:, 0] * s + pts[:, 1] * c",
  "    umin, umax, vmin, vmax = u.min(), u.max(), v.min(), v.max()",
  "    corners = []",
  "    for uu, vv in ((umin, vmin), (umax, vmin), (umax, vmax), (umin, vmax)):",
  "        corners.append([uu * c - vv * s, uu * s + vv * c])",
  "    out = corners",
  "    if ang >= 45.0:",
  "        out = corners[1:] + corners[:1]",
  "    x0, y0, x1, y1 = box_bounds(out)",
  "    return [x0, y0, x1, y1]",
  "",
  "",
  "# ------------------------------------------------------- connected parts ----",
  "",
  "",
  "def _row_runs(row: np.ndarray):",
  "    \"\"\"[(start, end_exclusive), ...] of the True runs in one row (4-connected).\"\"\"",
  "    idx = np.flatnonzero(np.diff(row.view(np.int8), prepend=np.int8(0), append=np.int8(0)))",
  "    return idx.reshape(-1, 2)",
  "",
  "",
  "def connected_components(mask: np.ndarray):",
  "    \"\"\"4-connected labelling of a boolean mask (numpy-only, union-find).",
  "",
  "    The mask comes from an OCR probability map, so it holds a few very long",
  "    horizontal runs. Runs are extracted per row and merged through a",
  "    union-find over overlapping runs of the previous row — that reaches",
  "    global connectivity directly instead of relaxing labels in iterations.",
  "",
  "    Returns (labels, count) with 1-based component ids and 0 = background.",
  "    \"\"\"",
  "    h, w = mask.shape",
  "    if not mask.any():",
  "        return np.zeros((h, w), dtype=np.int32), 0",
  "    parent: list = []",
  "",
  "    def find(a: int) -> int:",
  "        root = a",
  "        while parent[root] != root:",
  "            root = parent[root]",
  "        while parent[a] != root:  # path compression",
  "            parent[a], a = root, parent[a]",
  "        return root",
  "",
  "    def union(a: int, b: int) -> None:",
  "        ra, rb = find(a), find(b)",
  "        if ra != rb:",
  "            if ra > rb:",
  "                ra, rb = rb, ra",
  "            parent[rb] = ra",
  "",
  "    runs_by_row = []",
  "    prev_row = []",
  "    for r in range(h):",
  "        row = mask[r]",
  "        runs = []",
  "        if row.any():",
  "            for s, e in _row_runs(row):",
  "                s, e = int(s), int(e)",
  "                runs.append([s, e, len(parent)])",
  "                parent.append(len(parent))",
  "            for rs, re_, rid in runs:",
  "                for ps, pe, pid in prev_row:",
  "                    if ps < re_ and rs < pe:  # closed intervals intersect",
  "                        union(rid, pid)",
  "        runs_by_row.append(runs)",
  "        prev_row = runs",
  "",
  "    # second pass: paint the final component ids",
  "    labels = np.zeros((h, w), dtype=np.int32)",
  "    roots = set()",
  "    row_ids = np.arange(w, dtype=np.int32)",
  "    for r in range(h):",
  "        for s, e, rid in runs_by_row[r]:",
  "            root = find(rid)",
  "            roots.add(root)",
  "            labels[r, s:e] = root + 1",
  "    if not roots:",
  "        return labels, 0",
  "    remap = np.zeros(len(parent) + 1, dtype=np.int32)",
  "    for i, root in enumerate(sorted(roots)):",
  "        remap[root + 1] = i + 1",
  "    np.take(remap, labels, out=labels)",
  "    return labels, len(roots)",
  "",
  "",
  "def components_points(labels: np.ndarray, count: int, max_pixels: int = 200000):",
  "    \"\"\"Group non-zero pixels by label. Returns {label: (xs, ys)}.\"\"\"",
  "    dev = np.flatnonzero(labels)",
  "    if dev.size == 0:",
  "        return {}",
  "    vals = labels.ravel()[dev]",
  "    order = np.argsort(vals, kind=\"stable\")",
  "    dev = dev[order]",
  "    vals = vals[order]",
  "    starts = np.flatnonzero(np.diff(vals, prepend=np.int32(-1), append=np.int32(-1)))",
  "    groups = {}",
  "    for k in range(len(starts) - 1):",
  "        seg = dev[starts[k]:starts[k + 1]]",
  "        lab = int(vals[starts[k]])",
  "        if seg.size > max_pixels:",
  "            step = int(np.ceil(seg.size / max_pixels))",
  "            seg = seg[::step]",
  "        ys, xs = np.divmod(seg, labels.shape[1])",
  "        groups[lab] = (xs, ys)",
  "    return groups",
  "",
  "",
  "def components_boxes(binary: np.ndarray, min_area: float = 4.0, max_pixels: int = 4000):",
  "    \"\"\"Component bounding rectangles, sorted in reading order.\"\"\"",
  "    labels, n = connected_components(binary)",
  "    if n == 0:",
  "        return []",
  "    groups = components_points(labels, n, max_pixels=max_pixels)",
  "    out = []",
  "    for lab, (xs, ys) in groups.items():",
  "        if xs.size < min_area:",
  "            continue",
  "        pts = np.stack([xs, ys], axis=1)",
  "        box = min_area_rect(pts)",
  "        bw = box[2] - box[0]",
  "        bh = box[3] - box[1]",
  "        if bw < 2 or bh < 2 or bw * bh < min_area:",
  "            continue",
  "        out.append(box)",
  "    out.sort(key=lambda b: (b[1], b[0]))",
  "    return out",
  "",
  "",
  "def project_boxes(binary: np.ndarray, min_band: int = 8, min_dark: int = 8,",
  "                  min_area: float = 24.0, min_density: float = 0.02,",
  "                  gap_ratio: float = 1.6, gap_min: int = 12):",
  "    \"\"\"Projection-based line boxes: a fallback for pages the detector whiffs on.",
  "",
  "    A printed line always leaves a horizontal band of ink in the row projection,",
  "    so rows above `min_dark` dark pixels become bands and each band is cut into",
  "    segments at horizontal gaps wider than `gap_ratio * band height`. Thin rules",
  "    and stray specks are rejected by `min_area` / `min_density`.",
  "    \"\"\"",
  "    dark = np.asarray(binary, dtype=bool)",
  "    if dark.ndim == 3:",
  "        dark = dark[:, :, 0]",
  "    h, w = dark.shape[:2]",
  "    rows = dark.sum(axis=1)",
  "    bands = []",
  "    in_band = False",
  "    y0 = 0",
  "    for y in range(h):",
  "        on = rows[y] >= min_dark",
  "        if on and not in_band:",
  "            y0 = y",
  "            in_band = True",
  "        elif not on and in_band:",
  "            if y - y0 >= min_band:",
  "                bands.append((y0, y - 1))",
  "            in_band = False",
  "    if in_band and h - y0 >= min_band:",
  "        bands.append((y0, h - 1))",
  "    boxes = []",
  "    for (a, b) in bands:",
  "        band = dark[a:b + 1]",
  "        cols = np.flatnonzero(band.any(axis=0))",
  "        if cols.size == 0:",
  "            continue",
  "        gap = max(int(gap_min), int(gap_ratio * (b - a + 1)))",
  "        segs = []",
  "        start = prev = int(cols[0])",
  "        for x in cols[1:]:",
  "            x = int(x)",
  "            if x - prev > gap:",
  "                segs.append((start, prev))",
  "                start = x",
  "            prev = x",
  "        segs.append((start, prev))",
  "        for (x1, x2) in segs:",
  "            bw = x2 - x1 + 1",
  "            bh = b - a + 1",
  "            if bw * bh < min_area or float(band[:, x1:x2 + 1].sum()) < min_density * bw * bh:",
  "                continue",
  "            boxes.append((float(x1), float(a), float(x2 + 1), float(b + 1)))",
  "    # Reading order: top to bottom, then left to right.",
  "    boxes.sort(key=lambda t: (round(t[1] / 8.0), t[0]))",
  "    return boxes",
  "",
  "",
  "def _median_height(boxes) -> float:",
  "    hs = sorted(b[3] - b[1] for b in boxes)",
  "    if not hs:",
  "        return 10.0",
  "    return max(6.0, hs[len(hs) // 2])",
  "",
  "",
  "def group_rows(boxes, overlap: float = 0.5, pad: float = 0.18):",
  "    \"\"\"Cluster boxes into visual text rows.",
  "",
  "    Chaining horizontal merges across a page can weld neighbouring lines",
  "    together (every fragment overlaps the next line a little), so the merge",
  "    step is fenced per row: boxes are bucketed by vertical overlap first.",
  "    \"\"\"",
  "    rows: list = []",
  "    for b in sorted((list(x) for x in boxes), key=lambda b: (b[1], b[0])):",
  "        h = max(1.0, b[3] - b[1])",
  "        best = None",
  "        best_ov = 0.0",
  "        for k, r in enumerate(rows):",
  "            rh = max(1.0, r[3] - r[1])",
  "            pad_y = pad * max(h, rh)",
  "            ov = min(r[3] + pad_y, b[3]) - max(r[1] - pad_y, b[1])",
  "            if ov > overlap * h and ov > best_ov:",
  "                best_ov, best = ov, k",
  "        if best is None:",
  "            rows.append(list(b))",
  "        else:",
  "            r = rows[best]",
  "            rows[best] = [min(r[0], b[0]), min(r[1], b[1]), max(r[2], b[2]), max(r[3], b[3])]",
  "    rows.sort(key=lambda r: (r[1], r[0]))",
  "    return rows",
  "",
  "",
  "def merge_lines(boxes, gap_norm: float = 0.6, y_gap: float = 0.5, max_stack: float = 1.75):",
  "    \"\"\"Merge horizontally adjacent fragments that sit on the same visual line.",
  "",
  "    PP-OCRv4 shrinks every text region, so one printed line usually arrives as",
  "    several fragments whose gaps scale with the *local* font size. The gap",
  "    budget is therefore normalised by the shorter of the two boxes (gap /",
  "    height). A merge is refused when it would make the box taller than",
  "    `max_stack` times the shorter fragment — that is the signature of two",
  "    printed lines being welded together.",
  "    \"\"\"",
  "    if not boxes:",
  "        return []",
  "    clustered: list = []",
  "    for row in group_rows(boxes):",
  "        items = []",
  "        for b in boxes:",
  "            h = max(1.0, b[3] - b[1])",
  "            hrow = max(1.0, row[3] - row[1])",
  "            ov = min(row[3], b[3]) - max(row[1], b[1])",
  "            if ov >= 0.5 * min(h, hrow):",
  "                items.append(list(b))",
  "        if not items:",
  "            continue",
  "        merged = True",
  "        while merged:",
  "            merged = False",
  "            items.sort(key=lambda b: (b[1], b[0]))",
  "            for i in range(len(items)):",
  "                a = items[i]",
  "                ha = max(1.0, a[3] - a[1])",
  "                best = None",
  "                for j in range(i + 1, len(items)):",
  "                    b = items[j]",
  "                    if b[1] > a[3] + max(ha, 40.0):",
  "                        break",
  "                    hb = max(1.0, b[3] - b[1])",
  "                    ov = min(a[3], b[3]) - max(a[1], b[1])",
  "                    if ov < y_gap * min(ha, hb):",
  "                        continue",
  "                    dx = max(b[0] - a[2], a[0] - b[2])",
  "                    if dx > gap_norm * min(ha, hb):",
  "                        continue",
  "                    if max(a[3], b[3]) - min(a[1], b[1]) > max_stack * min(ha, hb):",
  "                        continue  # would stack two printed lines",
  "                    if best is None or b[0] < items[best][0]:",
  "                        best = j",
  "                if best is not None:",
  "                    b = items[best]",
  "                    items[i] = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3])]",
  "                    items.pop(best)",
  "                    merged = True",
  "                    break",
  "        clustered.extend(items)",
  "    clustered.sort(key=lambda b: (b[1], b[0]))",
  "    return [tuple(round(float(v), 2) for v in it) for it in clustered]",
  "",
  "",
  "# ------------------------------------------------------------------ ocr -----",
  "",
  "",
  "class OcrEngine:",
  "    \"\"\"PP-OCRv4 det/cls/rec on onnxruntime, numpy pre/post-processing.\"\"\"",
  "",
  "    def __init__(self, models_dir: str, threads: int = 0, use_cls: bool = True) -> None:",
  "        so = ort.SessionOptions()",
  "        so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL",
  "        if threads:",
  "            so.intra_op_num_threads = int(threads)",
  "            so.inter_op_num_threads = 1",
  "        so.log_severity_level = 3",
  "        prov = [\"CPUExecutionProvider\"]",
  "        self.det_path, self.rec_path, self.cls_path = self._paths(models_dir)",
  "        self.det = ort.InferenceSession(self.det_path, so, providers=prov)",
  "        self.rec = ort.InferenceSession(self.rec_path, so, providers=prov)",
  "        self.cls = ort.InferenceSession(self.cls_path, so, providers=prov) if use_cls else None",
  "        meta = self.rec.get_modelmeta().custom_metadata_map",
  "        meta_keys = meta.get(\"character\", \"\").splitlines()",
  "        if not meta_keys:",
  "            raise SystemExit(\"rec 模型缺少 character 字典元数据\")",
  "        self.keys_path = os.path.join(models_dir, \"ppocr_keys_v1.txt\")",
  "        if os.path.exists(self.keys_path):",
  "            with open(self.keys_path, \"r\", encoding=\"utf-8\", errors=\"replace\") as fh:",
  "                disk = [ln.rstrip(\"\\r\\n\") for ln in fh]",
  "            self.keys = disk[: len(meta_keys)] if len(disk) >= len(meta_keys) else meta_keys",
  "        else:",
  "            with open(self.keys_path, \"w\", encoding=\"utf-8\") as fh:",
  "                fh.write(\"\\n\".join(meta_keys) + \"\\n\")",
  "            self.keys = meta_keys",
  "        self.det_name = self.det.get_inputs()[0].name",
  "        self.rec_name = self.rec.get_inputs()[0].name",
  "        self.cls_name = self.cls.get_inputs()[0].name if self.cls else None",
  "        self.meta = {",
  "            \"det\": os.path.basename(self.det_path),",
  "            \"rec\": os.path.basename(self.rec_path),",
  "            \"cls\": os.path.basename(self.cls_path) if self.cls else None,",
  "            \"dict\": len(self.keys),",
  "        }",
  "",
  "    @staticmethod",
  "    def _paths(models_dir: str):",
  "        def pick(key, needle):",
  "            d = os.path.join(models_dir, key)",
  "            if not os.path.isdir(d):",
  "                raise SystemExit(\"缺少模型目录：%s\" % d)",
  "            cand = [f for f in os.listdir(d) if f.endswith(\".onnx\") and needle in f]",
  "            if not cand:",
  "                raise SystemExit(\"缺少 %s 模型（%s）\" % (key, d))",
  "            return os.path.join(d, cand[0])",
  "",
  "        det = pick(\"det\", \"_det_\")",
  "        rec = pick(\"rec\", \"_rec_\")",
  "        try:",
  "            cls = pick(\"cls\", \"_cls_\")",
  "        except SystemExit:",
  "            cls = None",
  "        return det, rec, cls",
  "",
  "    # ---- detection ----",
  "",
  "    def detect(self, img_bgr: np.ndarray, thresh: float = 0.30, box_thresh: float = 0.45,",
  "               unclip_ratio: float = 1.6, limit_side: int = 1200, gap_norm: float = 0.55,",
  "               stats: dict = None):",
  "        h, w = img_bgr.shape[:2]",
  "        side = max(h, w)",
  "        scale = 1.0 if side <= limit_side else (limit_side / float(side))",
  "        rh = max(32, int(round(h * scale / 32.0)) * 32)",
  "        rw = max(32, int(round(w * scale / 32.0)) * 32)",
  "        resized = resize_bilinear(img_bgr, rw, rh)",
  "        x = resized.astype(np.float32)[:, :, ::-1] / 255.0",
  "        x = (x - np.asarray(DET_MEAN, dtype=np.float32)) / np.asarray(DET_STD, dtype=np.float32)",
  "        x = np.ascontiguousarray(x.transpose(2, 0, 1)[None, ...])",
  "        prob = self.det.run(None, {self.det_name: x})[0][0, 0]",
  "        binary = prob > thresh",
  "        min_area = max(3.0, 4.0 * (2048.0 / max(rw, 1)) ** 2)",
  "        boxes = components_boxes(binary, min_area=min_area)",
  "        # drop boxes whose mean probability is too low (noise / speckle)",
  "        keep = []",
  "        for b in boxes:",
  "            x0 = max(0, int(b[0]))",
  "            y0 = max(0, int(b[1]))",
  "            x1 = min(prob.shape[1], int(math.ceil(b[2])))",
  "            y1 = min(prob.shape[0], int(math.ceil(b[3])))",
  "            if x1 <= x0 or y1 <= y0:",
  "                continue",
  "            patch = prob[y0:y1, x0:x1]",
  "            if float(patch.mean()) < box_thresh:",
  "                continue",
  "            keep.append(b)",
  "        scale_back = w / float(rw)",
  "        expanded = []",
  "        dropped = 0",
  "        for b in keep:",
  "            x0, y0, x1, y1 = unclip(b, unclip_ratio)",
  "            if (x1 - x0) * (y1 - y0) > 0.5 * (rw * rh):",
  "                dropped += 1",
  "                continue  # a monster box (background noise) would swallow the page",
  "            expanded.append([x0 * scale_back, y0 * scale_back, x1 * scale_back, y1 * scale_back])",
  "        merged = merge_lines(expanded, gap_norm=gap_norm)",
  "        clipped = []",
  "        for b in merged:",
  "            clipped.append((max(0.0, b[0]), max(0.0, b[1]), min(float(w), b[2]), min(float(h), b[3])))",
  "        if stats is not None:",
  "            stats.update({\"probe_boxes\": len(boxes), \"raw_keep\": len(keep), \"expanded\": len(expanded),",
  "                          \"merged\": len(merged), \"monster_dropped\": dropped,",
  "                          \"det_input\": [rw, rh], \"median_h\": round(_median_height(expanded), 1),",
  "                          \"det_boxes\": [[b[0], b[1], b[2], b[3]] for b in merged],",
  "                          \"det_scale\": scale_back})",
  "        return [b for b in clipped if b[2] - b[0] >= 3 and b[3] - b[1] >= 3]",
  "",
  "    # ---- recognition ----",
  "",
  "    def _crop(self, img_bgr: np.ndarray, box):",
  "        x0, y0, x1, y1 = (int(math.floor(box[0])), int(math.floor(box[1])),",
  "                          int(math.ceil(box[2])), int(math.ceil(box[3])))",
  "        x0, y0 = max(0, x0), max(0, y0)",
  "        x1, y1 = min(img_bgr.shape[1], x1), min(img_bgr.shape[0], y1)",
  "        if x1 - x0 < 2 or y1 - y0 < 2:",
  "            return None",
  "        crop = img_bgr[y0:y1, x0:x1]",
  "        h, w = crop.shape[:2]",
  "        if h > w * 3:  # only clearly vertical strips are re-oriented",
  "            crop = np.rot90(crop, 1)",
  "        return np.ascontiguousarray(crop)",
  "",
  "    def _cls_flip(self, crop: np.ndarray) -> bool:",
  "        if self.cls is None:",
  "            return False",
  "        h, w = crop.shape[:2]",
  "        if h == 0 or w == 0:",
  "            return False",
  "        rs = resize_bilinear(crop, 192, 48)",
  "        x = rs.astype(np.float32)[:, :, ::-1] / 255.0",
  "        x = (x - np.asarray(CLS_MEAN, dtype=np.float32)) / np.asarray(CLS_STD, dtype=np.float32)",
  "        x = np.ascontiguousarray(x.transpose(2, 0, 1)[None, ...])",
  "        out = self.cls.run(None, {self.cls_name: x})[0][0]",
  "        return int(np.argmax(out)) == 1",
  "",
  "    def recognize(self, crops):",
  "        \"\"\"Batch CTC decode. Returns list of (text, score).\"\"\"",
  "        if not crops:",
  "            return []",
  "        prepared = []",
  "        for crop in crops:",
  "            prepared.append(rec_resize(crop))",
  "        results = [None] * len(prepared)",
  "        width_order = sorted(range(len(prepared)), key=lambda i: prepared[i].shape[2])",
  "        batch_size = 8",
  "        for start in range(0, len(width_order), batch_size):",
  "            idxs = width_order[start:start + batch_size]",
  "            widths = [prepared[i].shape[2] for i in idxs]",
  "            wmax = int(max(widths))",
  "            batch = np.zeros((len(idxs), 3, 48, wmax), dtype=np.float32)",
  "            for k, i in enumerate(idxs):",
  "                arr = prepared[i]",
  "                batch[k, :, :, : arr.shape[2]] = arr[:, :, :, 0]",
  "            out = self.rec.run(None, {self.rec_name: batch})[0]",
  "            for k, i in enumerate(idxs):",
  "                results[i] = ctc_decode(out[k], self.keys)",
  "        return results",
  "",
  "    def run(self, img_bgr: np.ndarray, det_thresh=0.30, box_thresh=0.45, unclip_ratio=1.6,",
  "            limit_side: int = 1600, gap_norm: float = 0.6, stats: dict = None,",
  "            method: str = \"det\"):",
  "        if method == \"projection\":",
  "            # Fallback path: the DB detector can whiff an entire paragraph on a",
  "            # sparse scan page (see 参考文件/_extract/quality-report.md), so cut",
  "            # the page into ink bands instead of trusting the network.",
  "            gray = img_bgr.min(axis=2)",
  "            below = np.percentile(gray, 20)",
  "            cut = max(120.0, min(210.0, float(below)))",
  "            binary = gray < cut",
  "            boxes = project_boxes(binary)",
  "            if stats is not None:",
  "                ih, iw = img_bgr.shape[:2]",
  "                stats.update({\"method\": \"projection\", \"cut\": round(cut, 1),",
  "                              \"projection_boxes\": len(boxes), \"merged\": len(boxes),",
  "                              \"det_input\": [iw, ih],",
  "                              \"det_boxes\": [[b[0], b[1], b[2], b[3]] for b in boxes]})",
  "        else:",
  "            boxes = self.detect(img_bgr, det_thresh, box_thresh, unclip_ratio,",
  "                                limit_side=limit_side, gap_norm=gap_norm, stats=stats)",
  "            if stats is not None:",
  "                stats.setdefault(\"method\", \"det\")",
  "        crops = []",
  "        kept = []",
  "        for b in boxes:",
  "            crop = self._crop(img_bgr, b)",
  "            if crop is None:",
  "                continue",
  "            crops.append(crop)",
  "            kept.append(b)",
  "        texts = self.recognize(crops)",
  "        lines = []",
  "        for b, (text, score) in zip(kept, texts):",
  "            if text.strip():",
  "                lines.append({\"box\": rect_of([(b[0], b[1]), (b[2], b[1]), (b[2], b[3]), (b[0], b[3])]),",
  "                              \"text\": text, \"score\": round(float(score), 4)})",
  "        if stats is not None:",
  "            # Ink coverage is measured in detector space, where the merged boxes",
  "            # live as \"det_boxes\". A page whose printed ink mostly sits OUTSIDE",
  "            # the detected boxes is the real signal of a detection failure (a",
  "            # short page such as a cover or a section title is not).",
  "            cov = 0.0",
  "            ink_ratio = 0.0",
  "            det_boxes = stats.get(\"det_boxes\") or []",
  "            det_input = stats.get(\"det_input\") or [0, 0]",
  "            if det_boxes and det_input[0] > 0:",
  "                h, w = img_bgr.shape[:2]",
  "                small = resize_bilinear(img_bgr, det_input[0], det_input[1])",
  "                dark = small.min(axis=2) < 140",
  "                total = float(dark.shape[0] * dark.shape[1])",
  "                ink_ratio = float(dark.sum()) / total",
  "                inside = np.zeros_like(dark)",
  "                for b in det_boxes:",
  "                    x0 = max(0, int(math.floor(b[0])))",
  "                    y0 = max(0, int(math.floor(b[1])))",
  "                    x1 = min(dark.shape[1], int(math.ceil(b[2])))",
  "                    y1 = min(dark.shape[0], int(math.ceil(b[3])))",
  "                    if x1 > x0 and y1 > y0:",
  "                        inside[y0:y1, x0:x1] = True",
  "                ink = int(dark.sum())",
  "                cov = (float((dark & inside).sum()) / ink) if ink else 0.0",
  "            stats.update({\"ink_ratio\": round(ink_ratio, 4), \"ink_in_boxes\": round(cov, 4),",
  "                          \"img\": [img_bgr.shape[1], img_bgr.shape[0]]})",
  "        return lines",
  "",
  "",
  "# ------------------------------------------------------------- imaging ------",
  "",
  "",
  "def resize_bilinear(img: np.ndarray, w: int, h: int) -> np.ndarray:",
  "    \"\"\"Area/nearest nearest-neighbour-safe bilinear resize (numpy only).\"\"\"",
  "    src_h, src_w = img.shape[:2]",
  "    if src_h == h and src_w == w:",
  "        return img",
  "    ys = (np.arange(h, dtype=np.float64) + 0.5) * (src_h / float(h)) - 0.5",
  "    xs = (np.arange(w, dtype=np.float64) + 0.5) * (src_w / float(w)) - 0.5",
  "    ys = np.clip(ys, 0, src_h - 1)",
  "    xs = np.clip(xs, 0, src_w - 1)",
  "    y0 = np.floor(ys).astype(np.int32)",
  "    x0 = np.floor(xs).astype(np.int32)",
  "    y1 = np.minimum(y0 + 1, src_h - 1)",
  "    x1 = np.minimum(x0 + 1, src_w - 1)",
  "    wy = (ys - y0)[:, None, None]",
  "    wx = (xs - x0)[None, :, None]",
  "    imgf = img.astype(np.float32)",
  "    top = imgf[y0][:, x0] * (1 - wx) + imgf[y0][:, x1] * wx",
  "    bot = imgf[y1][:, x0] * (1 - wx) + imgf[y1][:, x1] * wx",
  "    out = top * (1 - wy) + bot * wy",
  "    return np.clip(out, 0, 255).astype(np.uint8)",
  "",
  "",
  "def rec_resize(crop: np.ndarray, img_h: int = 48, min_w: int = 320) -> np.ndarray:",
  "    h, w = crop.shape[:2]",
  "    ratio = w / float(h)",
  "    rw = max(1, int(math.ceil(img_h * ratio)))",
  "    resized = resize_bilinear(crop, rw, img_h)",
  "    tw = max(min_w, int(math.ceil(rw / 32.0)) * 32)",
  "    padded = np.zeros((img_h, tw, 3), dtype=np.uint8)",
  "    padded[:, :rw] = resized",
  "    if tw > rw:",
  "        padded[:, rw:] = 0",
  "    x = padded.astype(np.float32)[:, :, ::-1] / 255.0",
  "    x = (x - 0.5) / 0.5",
  "    return np.ascontiguousarray(x.transpose(2, 0, 1)[:, :, :, None])",
  "",
  "",
  "def ctc_decode(logits: np.ndarray, keys) -> tuple:",
  "    idx = logits.argmax(axis=-1)",
  "    probs = logits.max(axis=-1)",
  "    out = []",
  "    scores = []",
  "    prev = -1",
  "    for i, k in enumerate(idx.tolist()):",
  "        if k != prev and k != 0:",
  "            if 0 <= k - 1 < len(keys):",
  "                out.append(keys[k - 1])",
  "                scores.append(float(probs[i]))",
  "        prev = k",
  "    return \"\".join(out), (statistics.fmean(scores) if scores else 0.0)",
  "",
  "",
  "# ------------------------------------------------------------- rendering ----",
  "",
  "",
  "def save_png(path: str, img_bgr: np.ndarray) -> None:",
  "    \"\"\"Write a BGR uint8 ndarray as a PNG (pure-python encoder, no Pillow).\"\"\"",
  "    import struct",
  "    import zlib",
  "",
  "    rgb = np.ascontiguousarray(img_bgr[:, :, ::-1])",
  "    h, w = rgb.shape[:2]",
  "    raw = bytearray()",
  "    for row in rgb:",
  "        raw.append(0)  # filter type 0",
  "        raw.extend(row.tobytes())",
  "",
  "    def chunk(tag: bytes, data: bytes) -> bytes:",
  "        return (struct.pack(\">I\", len(data)) + tag + data",
  "                + struct.pack(\">I\", zlib.crc32(tag + data) & 0xFFFFFFFF))",
  "",
  "    header = struct.pack(\">IIBBBBB\", w, h, 8, 2, 0, 0, 0)",
  "    with open(path, \"wb\") as fh:",
  "        fh.write(b\"\\x89PNG\\r\\n\\x1a\\n\")",
  "        fh.write(chunk(b\"IHDR\", header))",
  "        fh.write(chunk(b\"IDAT\", zlib.compress(bytes(raw), 6)))",
  "        fh.write(chunk(b\"IEND\", b\"\"))",
  "",
  "",
  "def render_page(doc, idx: int, dpi: float, max_pixels: int, rotation: int = 0):",
  "    page = doc[idx]",
  "    rect = page.rect",
  "    zoom = dpi / 72.0",
  "    w_px, h_px = max(rect.width, 1.0) * zoom, max(rect.height, 1.0) * zoom",
  "    if w_px * h_px > max_pixels:",
  "        zoom *= (max_pixels / (w_px * h_px)) ** 0.5",
  "    mat = fitz.Matrix(zoom, zoom)",
  "    if rotation:",
  "        mat = fitz.Matrix(rotation) * mat",
  "    pix = page.get_pixmap(matrix=mat, alpha=False, colorspace=fitz.csRGB)",
  "    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)",
  "    img = np.ascontiguousarray(arr[:, :, :3][:, :, ::-1])",
  "    return img",
  "",
  "",
  "# ------------------------------------------------------------ text layout ---",
  "",
  "",
  "def _y_overlap(a, b) -> float:",
  "    inter = min(a[3], b[3]) - max(a[1], b[1])",
  "    return inter / max(1.0, min(a[3] - a[1], b[3] - b[1]))",
  "",
  "",
  "def needs_space(left: str, right: str) -> bool:",
  "    if not left or not right:",
  "        return False",
  "    return ord(left[-1]) <= 0x2E00 and ord(right[0]) <= 0x2E00",
  "",
  "",
  "def text_orientation(img_bgr: np.ndarray, sample: int = 700) -> tuple:",
  "    \"\"\"Cheap upright/rotated estimate from the ink projection profile.",
  "",
  "    Horizontal text lines make the y-projection bursty and the x-projection",
  "    smooth; the relation flips for a page that is rotated by 90 degrees.",
  "    Returns (rotation, row_cv, col_cv) with rotation in {0, 90}.",
  "    \"\"\"",
  "    h, w = img_bgr.shape[:2]",
  "    scale = sample / float(max(h, w))",
  "    if scale < 1.0:",
  "        small = resize_bilinear(img_bgr, max(32, int(w * scale)), max(32, int(h * scale)))",
  "    else:",
  "        small = img_bgr",
  "    gray = small.astype(np.float32).mean(axis=2)",
  "    ink = (gray < 140.0)",
  "    if not ink.any():",
  "        return 0, 0.0, 0.0",
  "    col = (ink.sum(axis=1)).astype(np.float32)",
  "    row = (ink.sum(axis=0)).astype(np.float32)",
  "",
  "    def cv(v: np.ndarray) -> float:",
  "        m = float(v.mean())",
  "        return float(v.std() / m) if m > 0 else 0.0",
  "",
  "    rc, cc = cv(col), cv(row)",
  "    if cc > rc * 1.35 and cc > 0.35:",
  "        return 90, rc, cc",
  "    return 0, rc, cc",
  "",
  "",
  "def layout_lines(lines):",
  "    rows = []",
  "    for ln in sorted(lines, key=lambda l: (l[\"box\"][1], l[\"box\"][0])):",
  "        box = ln[\"box\"]",
  "        target = None",
  "        for row in rows:",
  "            if _y_overlap(row[\"box\"], box) > 0.55:",
  "                target = row",
  "                break",
  "        if target is None:",
  "            rows.append({\"box\": list(box), \"items\": [ln]})",
  "        else:",
  "            target[\"items\"].append(ln)",
  "            target[\"box\"] = [min(target[\"box\"][0], box[0]), min(target[\"box\"][1], box[1]),",
  "                             max(target[\"box\"][2], box[2]), max(target[\"box\"][3], box[3])]",
  "    rows.sort(key=lambda r: (r[\"box\"][1], r[\"box\"][0]))",
  "    out = []",
  "    for row in rows:",
  "        row[\"items\"].sort(key=lambda l: l[\"box\"][0])",
  "        buf = \"\"",
  "        prev = None",
  "        for ln in row[\"items\"]:",
  "            if prev is not None and ln[\"box\"][0] - prev[\"box\"][2] > 8 and needs_space(prev[\"text\"], ln[\"text\"]):",
  "                buf += \" \"",
  "            buf += ln[\"text\"]",
  "            prev = ln",
  "        text = buf.strip()",
  "        if text:",
  "            out.append(text)",
  "    return out",
  "",
  "",
  "def layout_text(lines) -> str:",
  "    return \"\\n\".join(layout_lines(lines))",
  "",
  "",
  "# ------------------------------------------------------------------ tasks ---",
  "",
  "",
  "def parse_pages(specs, total: int):",
  "    pages = []",
  "    if not specs:",
  "        return list(range(total))",
  "    for spec in specs:",
  "        s = str(spec).strip()",
  "        if \"-\" in s:",
  "            a, b = s.split(\"-\", 1)",
  "            pages.extend(range(int(a), int(b) + 1))",
  "        elif s.lower() == \"all\":",
  "            pages.extend(range(1, total + 1))",
  "        else:",
  "            pages.append(int(s))",
  "    seen, uniq = set(), []",
  "    for p in pages:",
  "        if 1 <= p <= total and p not in seen:",
  "            seen.add(p)",
  "            uniq.append(p)",
  "    return uniq",
  "",
  "",
  "def text_layer_text(raw: str) -> str:",
  "    \"\"\"Normalise embedded PDF text: drop trailing whitespace and empty lines,",
  "    keep reading order and every non-empty line verbatim. Used for PDFs that",
  "    already carry a text layer, where OCR would only degrade the text.\"\"\"",
  "    out = []",
  "    for ln in (raw or \"\").replace(\"\\r\\n\", \"\\n\").replace(\"\\r\", \"\\n\").split(\"\\n\"):",
  "        s = ln.rstrip()",
  "        if s.strip():",
  "            out.append(s)",
  "    return \"\\n\".join(out)",
  "",
  "",
  "def page_label(doc, pno: int) -> str:",
  "    \"\"\"The page number printed on the page (PDF page label), '' when the PDF",
  "    carries no label. Used only for citation; the separator stays PDF-based.\"\"\"",
  "    try:",
  "        return (doc[pno - 1].get_label() or \"\").strip()",
  "    except Exception:",
  "        return \"\"",
  "",
  "",
  "def open_pdf(path: str):",
  "    doc = fitz.open(path)",
  "    total = doc.page_count",
  "    text_lens = []",
  "    for i in range(total):",
  "        try:",
  "            text_lens.append(len((doc[i].get_text() or \"\").strip()))",
  "        except Exception:",
  "            text_lens.append(0)",
  "    return doc, total, text_lens",
  "",
  "",
  "def cand_score(cand) -> float:",
  "    \"\"\"Rank two recognitions of the same page: characters recognised, weighted",
  "    by the recogniser's mean confidence. Prefers the reading that recovered more",
  "    text, punishes one that did so at a much lower confidence.\"\"\"",
  "    return float(cand[\"chars\"]) * max(float(cand[\"avg_score\"]), 0.05)",
  "",
  "",
  "def run_task(task: dict) -> int:",
  "    kind = task[\"kind\"]",
  "    pdf = task[\"pdf\"]",
  "    out_path = task.get(\"out\")",
  "    log_path = task.get(\"log\")  # kept for reference; the driver tee is the log",
  "    root = task.get(\"root\") or os.path.dirname(os.path.dirname(os.path.abspath(pdf)))",
  "    rel = os.path.relpath(os.path.abspath(pdf), root).replace(\"\\\\\", \"/\")",
  "",
  "    def emit(rec: dict) -> None:",
  "        # Records go to the jsonl only; the \"log\" file is produced by the driver",
  "        # tee-ing this process's stdout, so writing both places would duplicate",
  "        # every line. stdout carries one compact line per record.",
  "        line = json.dumps(rec, ensure_ascii=False)",
  "        if out_path:",
  "            with open(out_path, \"a\", encoding=\"utf-8\") as fh:",
  "                fh.write(line + \"\\n\")",
  "        log(line if len(line) < 500 else line[:500] + \" …\")",
  "",
  "    t0 = time.time()",
  "    doc, total, text_lens = open_pdf(pdf)",
  "",
  "    if kind == \"probe\":",
  "        emit({",
  "            \"kind\": \"probe\",",
  "            \"file\": rel,",
  "            \"pages\": total,",
  "            \"has_text_layer\": sum(1 for n in text_lens if n >= 20) > total * 0.3,",
  "            \"text_pages\": sum(1 for n in text_lens if n >= 20),",
  "            \"text_chars_total\": int(sum(text_lens)),",
  "            \"text_chars_mean\": round(statistics.fmean(text_lens), 1) if text_lens else 0,",
  "            \"size_mb\": round(os.path.getsize(pdf) / 1048576.0, 2),",
  "            \"elapsed\": round(time.time() - t0, 2),",
  "        })",
  "        doc.close()",
  "        return 0",
  "",
  "    if kind == \"render\":",
  "        debug_dir = task[\"debug_dir\"]",
  "        os.makedirs(debug_dir, exist_ok=True)",
  "        for pno in parse_pages(task.get(\"pages\"), total):",
  "            img = render_page(doc, pno - 1, task.get(\"dpi\", 220), task.get(\"max_pixels\", 2500000))",
  "            name = \"%s_p%04d.png\" % (os.path.basename(pdf)[:36].replace(\" \", \"_\"), pno)",
  "            save_png(os.path.join(debug_dir, name), img)",
  "            emit({\"kind\": \"render\", \"page\": pno, \"img\": name, \"shape\": list(img.shape)})",
  "        doc.close()",
  "        return 0",
  "",
  "    if kind == \"text\":",
  "        # PDFs that already carry a real text layer need no OCR: the embedded",
  "        # text is taken verbatim. Field names mirror the OCR record so the",
  "        # driver can write .txt / index.json / report without a branch.",
  "        pages = parse_pages(task.get(\"pages\"), total)",
  "        if not pages:",
  "            pages = list(range(1, total + 1))",
  "        limit = task.get(\"limit\")",
  "        if limit:",
  "            pages = pages[: int(limit)]",
  "        page_offset = int(task.get(\"page_offset\") or 0)",
  "        stride = pages[1] - pages[0] if len(pages) > 1 else 1",
  "        t0 = time.time()",
  "        for n, pno in enumerate(pages, 1):",
  "            pt0 = time.time()",
  "            try:",
  "                raw = doc[pno - 1].get_text(\"text\") or \"\"",
  "            except Exception:",
  "                raw = \"\"",
  "            text = text_layer_text(raw)",
  "            lines = [ln for ln in text.split(\"\\n\") if ln.strip()]",
  "            rec = {",
  "                \"kind\": kind,",
  "                \"file\": rel,",
  "                \"pdf_page\": pno,",
  "                \"page\": pno - page_offset,",
  "                \"logical_page\": pno - page_offset,",
  "                \"label\": page_label(doc, pno),",
  "                \"stride\": stride,",
  "                \"n_lines\": len(lines),",
  "                \"chars\": len(text),",
  "                # No recogniser was involved, so confidence is by convention 1.0;",
  "                # score_source marks the record so a report never mixes the two.",
  "                \"avg_score\": 1.0 if text else 0.0,",
  "                \"min_score\": 1.0 if text else 0.0,",
  "                \"score_source\": \"textlayer\",",
  "                \"rotation\": 0,",
  "                \"limit_side\": 0,",
  "                \"method\": \"textlayer\",",
  "                \"low_conf\": 0,",
  "                \"ink_ratio\": 0.0,",
  "                \"ink_in_boxes\": 1.0,",
  "                \"merged\": 0,",
  "                \"attempts\": 1,",
  "                \"elapsed\": round(time.time() - pt0, 2),",
  "                \"text\": text,",
  "            }",
  "            emit(rec)",
  "            if n % 20 == 0 or n == len(pages):",
  "                log(\"[progress] %s %d/%d page=%d textlayer\" % (rel, n, len(pages), pno))",
  "        doc.close()",
  "        log(\"[done] %s pages=%d elapsed=%.1fs engine=textlayer\" % (rel, len(pages), time.time() - t0))",
  "        return 0",
  "",
  "    engine = OcrEngine(task[\"models\"], threads=int(task.get(\"threads\") or 0),",
  "                       use_cls=bool(task.get(\"use_cls\", True)))",
  "    pages = parse_pages(task.get(\"pages\"), total)",
  "    # Safety rail: an empty page list means \"every page\". A sampling task must",
  "    # never silently turn into a full-document run.",
  "    if not pages and task.get(\"sample_count\"):",
  "        log(\"[error] pages 为空但 sample_count=%s，拒绝按全量处理\" % task.get(\"sample_count\"))",
  "        doc.close()",
  "        return 2",
  "    limit = task.get(\"limit\")",
  "    if limit:",
  "        pages = pages[: int(limit)]",
  "    page_offset = int(task.get(\"page_offset\") or 0)",
  "    retry_rotations = bool(task.get(\"retry_rotations\", True))",
  "    recompute = bool(task.get(\"recompute\", False))",
  "    det_thresh = float(task.get(\"det_thresh\", 0.30))",
  "    box_thresh = float(task.get(\"box_thresh\", 0.45))",
  "    unclip_ratio = float(task.get(\"unclip_ratio\", 1.6))",
  "    min_avg = float(task.get(\"min_avg_score\", 0.5))",
  "    text_threshold = float(task.get(\"text_threshold\", 0.5))",
  "    dpi = float(task.get(\"dpi\", 220))",
  "    max_pixels = int(task.get(\"max_pixels\", 2500000))",
  "    debug_dir = task.get(\"debug_dir\")",
  "    if debug_dir:",
  "        os.makedirs(debug_dir, exist_ok=True)",
  "",
  "    stride = pages[1] - pages[0] if (len(pages) > 1 and kind in (\"sample\", \"extract\")) else 1",
  "    limit_side = int(task.get(\"limit_side\") or 1600)",
  "    retry_limit_side = int(task.get(\"retry_limit_side\") or 2400)",
  "    min_chars = int(task.get(\"min_chars\", 450))",
  "    min_ink_cov = float(task.get(\"min_ink_cov\", 0.5))",
  "    for n, pno in enumerate(pages, 1):",
  "        pt0 = time.time()",
  "        best = None",
  "",
  "        first = None",
  "        attempts = 0",
  "        renders = {}",
  "",
  "        def render_cached(rot):",
  "            # Both cutting paths and the orientation test look at the same page",
  "            # bitmap; rendering it once per angle keeps the retry passes cheap.",
  "            if rot not in renders:",
  "                renders[rot] = render_page(doc, pno - 1, dpi, max_pixels, rotation=rot)",
  "            return renders[rot]",
  "",
  "        def attempt(rot, lim, method=\"det\"):",
  "            nonlocal best, first, attempts",
  "            attempts += 1",
  "            img = render_cached(rot)",
  "            if debug_dir and rot == 0 and lim == limit_side:",
  "                tmp = os.path.join(debug_dir, \"%s_p%04d.png\" % (os.path.basename(pdf)[:30].replace(\" \", \"_\"), pno))",
  "                save_png(tmp, img)",
  "            stats = {}",
  "            if method == \"projection\":",
  "                lines = engine.run(img, det_thresh, box_thresh, unclip_ratio,",
  "                                   limit_side=lim, stats=stats, method=\"projection\")",
  "            else:",
  "                lines = engine.run(img, det_thresh, box_thresh, unclip_ratio, limit_side=lim, stats=stats)",
  "            scores = [l[\"score\"] for l in lines]",
  "            avg = statistics.fmean(scores) if scores else 0.0",
  "            cand = {",
  "                \"rotation\": rot,",
  "                \"limit_side\": lim,",
  "                \"method\": method,",
  "                \"lines\": lines,",
  "                \"n_lines\": len(lines),",
  "                \"avg_score\": round(avg, 4),",
  "                \"min_score\": round(min(scores), 4) if scores else 0.0,",
  "                \"chars\": sum(len(l[\"text\"]) for l in lines),",
  "                \"ink_ratio\": stats.get(\"ink_ratio\", 0.0),",
  "                \"ink_in_boxes\": stats.get(\"ink_in_boxes\", 0.0),",
  "                \"merged\": stats.get(\"merged\", 0),",
  "            }",
  "            if first is None:",
  "                first = cand",
  "            if best is None or cand_score(cand) > cand_score(best):",
  "                best = cand",
  "            return cand",
  "",
  "        first = attempt(0, limit_side)",
  "",
  "        # Every page is cut twice -- once by the DB detector, which is good on",
  "        # dense, clean scans, and once by the ink-projection fallback, which is",
  "        # good on sparse pages and on low-contrast scans the detector misses",
  "        # wholesale.  Both results are ranked by cand_score, so whichever reads",
  "        # more text at a higher confidence wins the page.",
  "        proj = attempt(0, limit_side, method=\"projection\")",
  "        proj_done_at = 0",
  "        # The projection pass is cheap, and when it reads the page cleanly (high",
  "        # confidence and nearly all ink inside its boxes) it settles the page:",
  "        # no detector retry is worth running there.  Retries are reserved for",
  "        # pages that neither path read well.",
  "        settled = (proj is best and cand_score(proj) > cand_score(first)",
  "                   and proj[\"avg_score\"] >= min_avg and proj[\"ink_in_boxes\"] >= min_ink_cov)",
  "        if recompute and retry_rotations:",
  "            for rot in ROTATIONS[1:]:",
  "                attempt(rot, limit_side)",
  "        elif not settled:",
  "            # A page still needs help when recognition came out poor (little text",
  "            # at a low score) OR when the ink-coverage test says printed ink was",
  "            # left outside every box -- that second test is what catches a scan",
  "            # the detector whiffed on even though it did return a few lines.",
  "            # Retried once at a larger detector input; a rotated scan is caught",
  "            # by a cheap ink projection test instead of four expensive passes.",
  "            if retry_limit_side > limit_side:",
  "                attempt(0, retry_limit_side)",
  "            poor = best[\"chars\"] < min_chars or best[\"avg_score\"] < min_avg",
  "            missed = best[\"ink_ratio\"] >= 0.02 and best[\"ink_in_boxes\"] < min_ink_cov",
  "            if retry_rotations and (poor or missed or best[\"ink_ratio\"] >= 0.02):",
  "                rot_hint, rc, cc = text_orientation(render_cached(0))",
  "                if rot_hint:",
  "                    attempt(rot_hint, retry_limit_side)",
  "                    best[\"orientation\"] = [rot_hint, round(rc, 2), round(cc, 2)]",
  "",
  "        if not recompute:",
  "            # A rotation pass re-rendered the page, so the projection cut of that",
  "            # angle has not been tried yet.",
  "            if proj_done_at != best[\"rotation\"]:",
  "                proj = attempt(best[\"rotation\"], limit_side, method=\"projection\")",
  "            loser = first if best is proj else proj",
  "            if loser is not best:",
  "                best[\"alts\"] = [{\"method\": loser.get(\"method\", \"det\"), \"chars\": loser[\"chars\"],",
  "                                 \"avg_score\": loser[\"avg_score\"],",
  "                                 \"ink_in_boxes\": loser[\"ink_in_boxes\"]}]",
  "",
  "        text = layout_text(best[\"lines\"])",
  "        rec = {",
  "            \"kind\": kind,",
  "            \"file\": rel,",
  "            \"pdf_page\": pno,",
  "            \"page\": pno - page_offset,",
  "            \"logical_page\": pno - page_offset,",
  "            \"label\": page_label(doc, pno),",
  "            \"stride\": stride,",
  "            \"n_lines\": best[\"n_lines\"],",
  "            \"chars\": len(text),",
  "            \"avg_score\": best[\"avg_score\"],",
  "            \"min_score\": best[\"min_score\"],",
  "            \"rotation\": best[\"rotation\"],",
  "            \"limit_side\": best[\"limit_side\"],",
  "            \"method\": best.get(\"method\", \"det\"),",
  "            \"low_conf\": sum(1 for l in best[\"lines\"] if l[\"score\"] < text_threshold),",
  "            \"ink_ratio\": best[\"ink_ratio\"],",
  "            \"ink_in_boxes\": best[\"ink_in_boxes\"],",
  "            \"merged\": best[\"merged\"],",
  "            \"attempts\": attempts,",
  "            \"elapsed\": round(time.time() - pt0, 2),",
  "            \"text\": text,",
  "        }",
  "        if task.get(\"with_boxes\"):",
  "            rec[\"boxes\"] = best[\"lines\"]",
  "        emit(rec)",
  "        if n % 5 == 0 or n == len(pages):",
  "            log(\"[progress] %s %d/%d page=%d %.2fs/page\" % (rel, n, len(pages), pno, time.time() - pt0))",
  "    doc.close()",
  "    log(\"[done] %s pages=%d elapsed=%.1fs engine=%s\" % (rel, len(pages), time.time() - t0, engine.meta))",
  "    return 0",
  "",
  "",
  "def selftest_image(task: dict, spec: str) -> int:",
  "    \"\"\"Diagnostic: OCR one page or one raw scan file twice -- once through the DB",
  "    detector, once through the projection fallback -- and compare the two texts.",
  "    Used to justify the fallback and to spot regressions on ordinary pages.\"\"\"",
  "    if \":\" in spec:",
  "        pdf, pnos = spec.split(\":\", 1)",
  "        imgs = []",
  "        doc, total, _ = open_pdf(pdf)",
  "        for s in pnos.split(\",\"):",
  "            pno = int(s)",
  "            imgs.append((\"p%d\" % pno, render_page(doc, pno - 1, float(task.get(\"dpi\") or 200),",
  "                                                  int(task.get(\"max_pixels\") or 2500000))))",
  "        doc.close()",
  "    else:",
  "        raw = pymupdf.Pixmap(spec)",
  "        if raw.n == 1:",
  "            arr = np.frombuffer(raw.samples, dtype=np.uint8).reshape(raw.height, raw.width, 1)",
  "            bgr = np.ascontiguousarray(np.dstack([arr[:, :, 0]] * 3))",
  "        else:",
  "            rgb = pymupdf.Pixmap(pymupdf.csRGB, raw)",
  "            arr = np.frombuffer(rgb.samples, dtype=np.uint8).reshape(rgb.height, rgb.width, 3)",
  "            bgr = np.ascontiguousarray(np.dstack([arr[:, :, 2], arr[:, :, 1], arr[:, :, 0]]))",
  "        imgs = [(os.path.basename(spec), bgr)]",
  "    engine = OcrEngine(task[\"models\"], threads=int(task.get(\"threads\") or 0),",
  "                       use_cls=bool(task.get(\"use_cls\", True)))",
  "    for name, img in imgs:",
  "        for method in (\"det\", \"projection\"):",
  "            t0 = time.time()",
  "            stats = {}",
  "            lines = engine.run(img, float(task.get(\"det_thresh\", 0.30)),",
  "                               float(task.get(\"box_thresh\", 0.45)),",
  "                               float(task.get(\"unclip_ratio\", 1.6)),",
  "                               limit_side=int(task.get(\"limit_side\") or 1600),",
  "                               stats=stats, method=method)",
  "            text = layout_text(lines)",
  "            scores = [l[\"score\"] for l in lines]",
  "            print(\"== %s %-10s boxes=%-4s lines=%-4d chars=%-5d avg=%.3f cov=%.3f %.1fs\" % (",
  "                name, method, stats.get(\"merged\"), len(lines), len(text),",
  "                statistics.fmean(scores) if scores else 0.0,",
  "                stats.get(\"ink_in_boxes\", 0.0), time.time() - t0))",
  "            print(text)",
  "    return 0",
  "",
  "",
  "def selftest_page(task: dict, pno: int) -> int:",
  "    \"\"\"Diagnostic: sweep detector thresholds / input sizes on one page and print",
  "    a compact table. Used to justify the values shipped in the driver.\"\"\"",
  "    pdf = task[\"pdf\"]",
  "    doc, total, _ = open_pdf(pdf)",
  "    engine = OcrEngine(task[\"models\"], threads=int(task.get(\"threads\") or 0),",
  "                       use_cls=bool(task.get(\"use_cls\", True)))",
  "    dpi = int(task.get(\"dpi\") or 200)",
  "    max_pixels = int(task.get(\"max_pixels\") or 2500000)",
  "    img = render_page(doc, pno - 1, dpi, max_pixels)",
  "    print(\"[selftest] %s page=%d img=%dx%d\" % (os.path.basename(pdf), pno, img.shape[1], img.shape[0]))",
  "    print(\"  det_thr  lim   boxes  lines  chars  avg    ink_cov  secs\")",
  "    for lim in (1600, 2000, 2400):",
  "        for thr in (0.30, 0.22, 0.15, 0.08):",
  "            t0 = time.time()",
  "            stats = {}",
  "            boxes = engine.detect(img, thresh=thr, limit_side=lim, stats=stats)",
  "            lines = engine.run(img, det_thresh=thr, limit_side=lim, stats=stats)",
  "            scores = [l[\"score\"] for l in lines]",
  "            print(\"  %-8.2f %-5d %-6d %-6d %-6d %-6.2f %-8.3f %.1f\" % (",
  "                thr, lim, len(boxes), len(lines), sum(len(l[\"text\"]) for l in lines),",
  "                statistics.fmean(scores) if scores else 0.0, stats.get(\"ink_in_boxes\", 0.0),",
  "                time.time() - t0))",
  "    doc.close()",
  "    return 0",
  "",
  "",
  "def main() -> int:",
  "    ap = argparse.ArgumentParser()",
  "    ap.add_argument(\"--task\", required=True)",
  "    ap.add_argument(\"--selftest-models\", action=\"store_true\")",
  "    ap.add_argument(\"--selftest-page\", type=int, default=0)",
  "    ap.add_argument(\"--selftest-image\", default=\"\")",
  "    args = ap.parse_args()",
  "    with open(args.task, \"r\", encoding=\"utf-8\") as fh:",
  "        task = json.load(fh)",
  "    try:",
  "        if args.selftest_models:",
  "            print(json.dumps(OcrEngine(task[\"models\"]).meta, ensure_ascii=False))",
  "            return 0",
  "        if args.selftest_image:",
  "            return selftest_image(task, args.selftest_image)",
  "        if args.selftest_page:",
  "            return selftest_page(task, args.selftest_page)",
  "        return run_task(task)",
  "    except SystemExit:",
  "        raise",
  "    except Exception:",
  "        tb = traceback.format_exc()",
  "        log(\"[fatal] \" + tb.replace(\"\\n\", \" | \"))",
  "        return 3",
  "",
  "",
  "if __name__ == \"__main__\":",
  "    sys.exit(main())",
  "",
];
const WORKER_PY = WORKER_PY_LINES.join('\n');

function writeWorker(opts) {
  const dest = opts['worker-path'] ? path.resolve(String(opts['worker-path'])) : WORKER_COPY;
  mkdirp(path.dirname(dest));
  const current = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
  if (current !== WORKER_PY) fs.writeFileSync(dest, WORKER_PY, 'utf8');
  return dest;
}

/** 运行一个 worker 任务，stdout 追加到日志，页记录由 worker 直接写入 jsonl。 */
function runWorkerTask(task, worker, py) {
  if (!task._taskFile) throw new Error(`runWorkerTask: 缺少 _taskFile (${task.pdf})`);
  return new Promise((resolve) => {
    mkdirp(path.dirname(task.log));
    const started = Date.now();
    const logFd = fs.openSync(task.log, 'a');
    const proc = spawn(py, [worker, '--task', task._taskFile], { cwd: ROOT, stdio: ['ignore', logFd, 'pipe'] });
    let err = '';
    proc.stderr.on('data', (b) => { err += b.toString('utf8'); });
    proc.on('error', (e) => { fs.closeSync(logFd); resolve({ code: -1, err: String(e.message), ms: Date.now() - started, task }); });
    proc.on('close', (code) => {
      fs.closeSync(logFd);
      if (err.trim()) fs.appendFileSync(task.log, `[stderr] ${err.trim()}\n`);
      resolve({ code, err, ms: Date.now() - started, task });
    });
  });
}

async function runPool(tasks, parallel, worker, py) {
  const results = new Array(tasks.length);
  let cursor = 0;
  let done = 0;
  const total = tasks.length;
  const t0 = Date.now();
  const width = String(total).length;
  async function lane() {
    for (;;) {
      const i = cursor;
      cursor += 1;
      if (i >= total) return;
      const task = tasks[i];
      process.stdout.write(`\r[${pad(done, width)}/${total}] ${task.fileName.slice(0, 44).padEnd(44)} 启动中…        `);
      const res = await runWorkerTask(task.task, worker, py);
      results[i] = res;
      done += 1;
      const rate = done / Math.max(1, (Date.now() - t0) / 1000);
      const eta = rate > 0 ? Math.round((total - done) / rate) : 0;
      process.stdout.write(`\r[${pad(done, width)}/${total}] ${task.fileName.slice(0, 44).padEnd(44)} ${res.code === 0 ? 'ok' : `exit ${res.code}`} ${(res.ms / 1000).toFixed(0)}s  ETA ${Math.floor(eta / 60)}m${pad(eta % 60, 2)}s   `);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(parallel, tasks.length)) }, () => lane()));
  process.stdout.write('\n');
  return results;
}

// ------------------------------------------------------------------ tasks ---

function baseTask(target, opts) {
  const outDir = opts.out ? path.resolve(String(opts.out)) : EXTRACT;
  const pagesDir = path.join(outDir, '_pages');
  const logsDir = path.join(outDir, '_logs');
  mkdirp(pagesDir);
  mkdirp(logsDir);
  return {
    task: {
      kind: 'extract',
      pdf: target.abs,
      root: REFS,
      models: MODELS,
      pages: [],
      out: path.join(pagesDir, `${targetName(target.rel)}.jsonl`),
      log: path.join(logsDir, `${targetName(target.rel)}.log`),
      debug_dir: null,
      dpi: Number(opts.dpi || 200),
      max_pixels: Number(opts['max-pixels'] || 2500000),
      limit_side: Number(opts['limit-side'] || 1600),
      retry_limit_side: Number(opts['retry-limit-side'] || 2400),
      min_chars: Number(opts['min-chars'] || 450),
      min_avg_score: Number(opts['min-avg'] || 0.6),
      min_ink_cov: Number(opts['min-ink-cov'] || 0.55),
      text_threshold: Number(opts['text-threshold'] || 0.5),
      threads: Number(opts.threads || 4),
      use_cls: opts['no-cls'] ? false : true,
      retry_rotations: opts['no-retry'] ? false : true,
      recompute: Boolean(opts.recompute),
      with_boxes: Boolean(opts['with-boxes']),
    },
    fileName: target.rel.split('/').pop(),
    rel: target.rel,
  };
}

function writeTaskFile(task, opts) {
  if (!task || !task.pdf) throw new Error('writeTaskFile: task.pdf 缺失');
  const dir = path.join((opts.out ? path.resolve(String(opts.out)) : EXTRACT), '_tasks');
  mkdirp(dir);
  const file = path.join(dir, `${safeSlug(targetName(path.relative(REFS, task.pdf)))}${task.kind === 'probe' ? '.probe' : ''}.json`);
  fs.writeFileSync(file, JSON.stringify(task, null, 2), 'utf8');
  return file;
}

// --------------------------------------------------------------- commands ---

async function cmdProbe(opts) {
  const py = pythonBin(opts);
  const worker = writeWorker(opts);
  const targets = resolveTargets(opts);
  const outDir = opts.out ? path.resolve(String(opts.out)) : EXTRACT;
  log(`worker: ${worker}`);
  log(`python: ${py}`);
  log(`目标 ${targets.length} 份:`);
  const tasks = targets.map((t) => {
    const rec = baseTask(t, opts);
    rec.task.kind = 'probe';
    rec.task.out = path.join(outDir, '_pages', `${targetName(t.rel)}.probe.jsonl`);
    rec.task._taskFile = writeTaskFile(rec.task, opts);
    return rec;
  });
  const results = await runPool(tasks, Number(opts.parallel || 4), worker, py);
  log('');
  log('PDF 文本层探测（has_text_layer=false 表示必须走 OCR）:');
  log('  页数   体积MB  文本页  文本字符  结论        文件');
  for (const t of tasks) {
    const info = probeSummary(t.task.log);
    if (!info) { log(`   ??     ??      ??      ??       探测失败    ${t.rel}`); continue; }
    log(`  ${pad(info.pages, 5)}  ${pad(info.size_mb, 6)}  ${pad(info.text_pages, 6)}  ${pad(info.text_chars_total, 8)}  ${info.has_text_layer ? '有文本层' : '需 OCR    '}  ${t.rel}`);
  }
  const bad = results.filter((r) => r.code !== 0);
  if (bad.length) log(`失败 ${bad.length} 份`);
  return bad.length ? 3 : 0;
}

function probeSummary(logFile) {
  const txt = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').split('\n') : [];
  for (let i = txt.length - 1; i >= 0; i -= 1) {
    const t = txt[i].trim();
    if (t.startsWith('{') && t.includes('"kind": "probe"')) {
      try { return JSON.parse(t); } catch { /* ignore */ }
    }
  }
  return null;
}

async function cmdSample(opts) {
  const py = pythonBin(opts);
  const worker = writeWorker(opts);
  const targets = resolveTargets(opts);
  const count = Number(opts.sample || 5);
  const outDir = opts.out ? path.resolve(String(opts.out)) : EXTRACT;
  const sampleDir = path.join(outDir, '_sample');
  mkdirp(sampleDir);
  // 抽样是「一次干净验证」：先清掉上一轮的抽样记录，否则新旧两轮的记录会混在同一份 jsonl 里
  // （worker 对 jsonl 是追加写），抽出来的表格会出现同一页两条、方法/重试策略不同的假象。
  for (const f of fs.readdirSync(sampleDir)) {
    if (f.endsWith('.jsonl') || f.endsWith('.log')) fs.rmSync(path.join(sampleDir, f), { force: true });
  }
  const tasks = [];
  for (const t of targets) {
    const rec = baseTask(t, opts);
    rec.task.kind = 'sample';
    rec.task.pages = opts.pages ? String(opts.pages).split(',').map((s) => s.trim()) : [];
    rec.task.out = path.join(sampleDir, `${targetName(t.rel)}.jsonl`);
    rec.task.log = path.join(sampleDir, `${targetName(t.rel)}.log`);
    rec.task.debug_dir = path.join(sampleDir, 'pages');
    rec.task.min_chars = Number(opts['min-chars'] || 450);
    rec.task.min_avg_score = Number(opts['min-avg'] || 0.6);
    rec.task.min_ink_cov = Number(opts['min-ink-cov'] || 0.55);
    rec.task.recompute = !opts['no-recompute'];
    rec.task.with_boxes = !opts['no-boxes'];
    if (!opts.pages) rec.task.page_list = pickPages(Number(opts['total-pages'] || 0) || 0, count);
    rec.sampleCount = count;
    rec.pages = opts.pages ? String(opts.pages).split(',').map((s) => s.trim()) : null;
    tasks.push(rec);
  }
  log(`worker: ${worker}`);
  log(`python: ${py}`);
  log(`抽样 ${targets.length} 份 × ${opts.pages ? '指定页' : `${count} 页`}（重试+穷尽取值 已开启）`);
  log('计划的抽样页（页号从 1 开始，与 PDF 页码一致）:');
  for (const t of tasks) log(`  · ${t.rel}  pages=${t.pages ? t.pages.join(',') : `auto(${count})`}`);

  // 先取页数（probe）再决定抽样页，避免超范围。
  for (const t of tasks) {
    if (t.pages) { t.task.pages = t.pages; t.task._taskFile = writeTaskFile(t.task, opts); continue; }
    const probe = { kind: 'probe', pdf: t.task.pdf, models: MODELS, root: REFS, log: t.task.log + '.probe' };
    probe._taskFile = writeTaskFile(probe, opts);
    // 用一个轻量 python 调用取页数
    const info = await new Promise((resolve) => {
      const p = spawn(py, [worker, '--task', probe._taskFile], { cwd: ROOT });
      let out = '';
      p.stdout.on('data', (b) => { out += b.toString('utf8'); });
      p.stderr.on('data', (b) => { out += b.toString('utf8'); });
      p.on('close', () => resolve(out));
    });
    const m = /"pages":\s*(\d+)/.exec(info);
    const total = m ? Number(m[1]) : 0;
    if (total <= 0) throw new Error(`无法取到页数：${t.rel}（probe 输出: ${info.trim().slice(0, 200)}）`);
    t.totalPages = total;
    t.task.total_pages = total;
    t.task.pages = pickPages(total, count).map(String);
    if (!t.task.pages.length) throw new Error(`抽样页为空：${t.rel}`);
    t.task.sample_count = count;
    // 页数确定之后才落盘任务文件，否则 worker 收到的 pages 是空的（会变成全量抽取）。
    t.task._taskFile = writeTaskFile(t.task, opts);
  }
  if (opts['dry-run']) return 0;
  const t0 = Date.now();
  const results = await runPool(tasks, Number(opts.parallel || 4), worker, py);
  const bad = results.filter((r) => r.code !== 0);
  log(`抽样完成：${tasks.length} 份，用时 ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min，失败 ${bad.length}`);
  for (const r of bad) log(`  ✗ ${r.task.rel} exit=${r.code} ${r.err.slice(0, 200)}`);
  log(`页记录: ${sampleDir}`);
  const sampleReport = path.join(sampleDir, 'sample-quality.md');
  const lines = ['# 参考文件 OCR 小样本质量验证（自动生成）', '', envInfo(), '',
    `- 抽样参数：每份 ${count} 页${opts.pages ? `（指定页 ${opts.pages}）` : ''}，并发 ${opts.parallel || 4}`,
    `- 重试条件：字数 < ${opts['min-chars'] || 450} 或 均分 < ${opts['min-avg'] || 0.6} 或 框内墨迹 < ${opts['min-ink-cov'] || 0.5}`,
    '- 识别路径：每页跑两遍——① PP-OCRv4 检测器切行（`method=det`）② 行投影兜底切行（`method=projection`），按 `字符数 × 均分` 选优，`备选` 列出落选方的成绩',
    '', fmtSampleSection(sampleDir)];
  const allSample = [];
  for (const f of fs.readdirSync(sampleDir).filter((x) => x.endsWith('.jsonl'))) allSample.push(...readJsonl(path.join(sampleDir, f)));
  if (allSample.length) {
    const chars = allSample.map((r) => r.chars);
    lines.push('', '## 汇总', '',
      `- 抽样页数：${allSample.length}`,
      `- 字符总数：${chars.reduce((a, b) => a + b, 0)}（中位 ${median(chars)} 字/页）`,
      `- 置信度均值：${(allSample.reduce((a, r) => a + r.avg_score, 0) / allSample.length).toFixed(3)}`,
      `- 触发重试的页：${allSample.filter((r) => (r.attempts || 1) > 1).length} / ${allSample.length}`,
      `- 单页耗时中位：${median(allSample.map((r) => r.elapsed || 0)).toFixed(2)}s`);
  }
  fs.writeFileSync(sampleReport, lines.join('\n'), 'utf8');
  log(`小样本报告: ${sampleReport}`);
  return bad.length ? 3 : 0;
}

async function cmdExtract(opts) {
  const py = pythonBin(opts);
  const worker = writeWorker(opts);
  const targets = resolveTargets(opts);
  const outDir = opts.out ? path.resolve(String(opts.out)) : EXTRACT;
  const tasks = [];
  const skipped = [];
  for (const t of targets) {
    const rec = baseTask(t, opts);
    rec.task.kind = 'extract';
    tasks.push(rec);
  }
  // 页数探测（用于进度显示与续跑判断）
  for (const t of tasks) {
    const probe = { kind: 'probe', pdf: t.task.pdf, models: MODELS, root: REFS, log: t.task.log + '.probe' };
    probe._taskFile = writeTaskFile(probe, opts);
    const info = await new Promise((resolve) => {
      const p = spawn(py, [worker, '--task', probe._taskFile], { cwd: ROOT });
      let out = '';
      p.stdout.on('data', (b) => { out += b.toString('utf8'); });
      p.stderr.on('data', (b) => { out += b.toString('utf8'); });
      p.on('close', () => resolve(out));
    });
    const m = /"pages":\s*(\d+)/.exec(info);
    t.task.total_pages = m ? Number(m[1]) : 0;
    // 数字版 PDF（自带文本层）不必 OCR：直接取内嵌文本，避免识别把清晰文字弄坏。
    t.task.has_text_layer = /"has_text_layer":\s*true/.test(info);
    if (opts.pages) {
      t.task.pages = String(opts.pages).split(',').map((s) => s.trim());
    } else {
      t.task.pages = ['all'];
    }
  }
  const textLayer = String(opts['text-layer'] || 'auto');
  if (textLayer !== 'off') {
    for (const t of tasks) {
      if (t.task.has_text_layer) {
        t.task.kind = 'text';
        log(`  · 文本层直取（不 OCR）：${t.rel}`);
      }
    }
  }
  const planned = tasks.reduce((a, t) => a + (t.task.pages[0] === 'all' ? t.task.total_pages : t.task.pages.length), 0);
  log(`worker: ${worker}`);
  log(`python: ${py}`);
  log(`抽取 ${tasks.length} 份 PDF，计划页数 ≈ ${planned}，并发 ${opts.parallel || 4}`);
  for (const t of tasks) log(`  · ${t.rel}  页数=${t.task.total_pages}  页=${t.task.pages.join(',')}  输出=${t.task.out}`);
  if (opts['dry-run']) return 0;

  // 续跑：已有记录只当断点，不重跑。整份已完成的直接跳过；未完成的只把缺失页
  // 交给 worker，已有记录改名 .prev.jsonl 暂存，抽完后按页号合并（新记录优先）。
  const prevByFile = new Map();
  if (opts.resume) {
    for (const t of tasks) {
      const recs = readJsonl(t.task.out);
      if (!recs.length) continue;
      const total = t.task.total_pages || 0;
      if (!opts.pages && total > 0) {
        const done = new Set(recs.map((r) => r.pdf_page));
        const missing = [];
        for (let p = 1; p <= total; p += 1) if (!done.has(p)) missing.push(String(p));
        if (!missing.length) {
          t.skipped = true;
          log(`  · 已完成，跳过（不动其记录）：${t.rel}（${recs.length}/${total} 页）`);
          continue;
        }
        prevByFile.set(t.task.out, new Map(recs.map((r) => [r.pdf_page, r])));
        t.task.pages = missing;
        fs.renameSync(t.task.out, t.task.out.replace(/\.jsonl$/, '.prev.jsonl'));
        log(`  · 断点续跑：${t.rel} 已有 ${recs.length}/${total} 页，本轮只补 ${missing.length} 页`);
        continue;
      }
      prevByFile.set(t.task.out, new Map(recs.map((r) => [r.pdf_page, r])));
      fs.renameSync(t.task.out, t.task.out.replace(/\.jsonl$/, '.prev.jsonl'));
    }
  }
  const runnable = tasks.filter((t) => !t.skipped);
  const effPlanned = runnable.reduce((a, t) => a + (t.task.pages[0] === 'all' ? t.task.total_pages : t.task.pages.length), 0);
  if (opts.resume) log(`本轮实际处理 ${runnable.length}/${tasks.length} 份，页数 ≈ ${effPlanned}`);
  for (const t of runnable) t.task._taskFile = writeTaskFile(t.task, opts);
  const t0 = Date.now();
  if (!runnable.length) log('全部文件已完成：不启动 worker，仅按已有记录重建文本与索引。');
  const results = runnable.length ? await runPool(runnable, Number(opts.parallel || 4), worker, py) : [];
  const bad = results.filter((r) => r.code !== 0);
  log(`抽取完成：用时 ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min，失败 ${bad.length}`);
  for (const r of bad) log(`  ✗ ${r.task.rel} exit=${r.code} ${r.err.slice(0, 300)}`);

  // 合并续跑记录 + 落盘文本
  const index = [];
  for (const t of tasks) {
    const fresh = readJsonl(t.task.out);
    const prev = prevByFile.get(t.task.out);
    let recs = fresh;
    if (prev && prev.size) {
      const byPage = new Map(fresh.map((r) => [r.pdf_page, r]));
      for (const [page, r] of prev) if (!byPage.has(page)) byPage.set(page, r);
      recs = [...byPage.values()].sort((a, b) => a.pdf_page - b.pdf_page);
      writeJsonl(t.task.out, recs);
    }
    const textFile = path.join(outDir, `${targetName(t.rel)}.txt`);
    mkdirp(path.dirname(textFile));
    const parts = [];
    for (const r of recs) {
      parts.push(PAGE_SEP(r.page));
      // 书内印刷页码（PDF 页标签）与物理页号不同时一并写出，便于按教材页码引用。
      if (r.label && String(r.label) !== String(r.page)) parts.push(`（书内页码 ${r.label}）`);
      parts.push(r.text && r.text.length ? r.text : '［本页未识别出文本］');
      parts.push('');
    }
    fs.writeFileSync(textFile, parts.join('\n'), 'utf8');
    const chars = recs.map((r) => r.chars);
    index.push({
      file: t.rel, pdf_pages: t.task.total_pages, ocr_pages: recs.length,
      chars_total: chars.reduce((a, b) => a + b, 0),
      chars_median: median(chars),
      avg_score_mean: recs.length ? recs.reduce((a, r) => a + r.avg_score, 0) / recs.length : 0,
      low_yield_pages: recs.filter((r) => r.chars < 450).length,
      way: recs.length && recs.every((r) => r.method === 'textlayer') ? 'textlayer' : 'ocr',
      text: path.relative(ROOT, textFile).replace(/\\/g, '/'),
      pages: path.relative(ROOT, t.task.out).replace(/\\/g, '/'),
    });
    log(`  ✓ ${t.rel} → ${index[index.length - 1].chars_total} 字 / ${recs.length} 页`);
  }
  const indexPath = path.join(outDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify({ generated: new Date().toISOString(), files: index }, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'progress.json'), JSON.stringify({ generated: new Date().toISOString(), index }, null, 2), 'utf8');
  log(`索引: ${indexPath}`);
  return bad.length ? 3 : 0;
}

async function cmdStatus(opts) {
  const outDir = opts.out ? path.resolve(String(opts.out)) : EXTRACT;
  const indexPath = path.join(outDir, 'index.json');
  if (fs.existsSync(indexPath)) {
    const idx = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    log(`index.json (${idx.generated})`);
    for (const f of idx.files) {
      log(`  ${f.ocr_pages}/${f.pdf_pages} 页  ${pad(f.chars_total, 7)} 字  中位 ${pad(f.chars_median, 4)}  ${f.way === 'textlayer' ? '文本层' : '均分 ' + f.avg_score_mean.toFixed(3)}  低产页 ${f.low_yield_pages}  ${f.file}`);
    }
  } else {
    log('尚未生成 index.json（先跑 extract）');
  }
  const pagesDir = path.join(outDir, '_pages');
  const sampleDir = path.join(outDir, '_sample');
  for (const dir of [pagesDir, sampleDir]) {
    if (!fs.existsSync(dir)) continue;
    log(`\n${path.relative(ROOT, dir)}:`);
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.jsonl'))) {
      const recs = readJsonl(path.join(dir, f));
      log(`  ${pad(recs.length, 5)} 页  ${pad(recs.reduce((a, r) => a + r.chars, 0), 8)} 字  ${f}`);
    }
  }
  return 0;
}

async function cmdReport(opts) {
  const outDir = opts.out ? path.resolve(String(opts.out)) : EXTRACT;
  const report = buildReport(outDir);
  const file = path.join(outDir, 'quality-report.md');
  mkdirp(outDir);
  fs.writeFileSync(file, report, 'utf8');
  log(`报告: ${file} (${report.length} 字符)`);
  return 0;
}

// ----------------------------------------------------------------- report ---

function envInfo() {
  const rows = [];
  rows.push(`- 生成时间：${new Date().toISOString()}`);
  rows.push(`- 渲染/检测/识别：PyMuPDF + onnxruntime + numpy（纯本地，无网络）`);
  rows.push(`- 识别模型：ch_PP-OCRv4_det_infer.onnx / ch_PP-OCRv4_rec_infer.onnx / ch_ppocr_mobile_v2.0_cls_infer.onnx`);
  rows.push(`- 字典：ppocr_keys_v1.txt（6623 字）`);
  rows.push(`- 说明：识别结果不做任何人工/模型润色，公式与上下标处存在固有错识，详见各文件「局限」段。`);
  return rows.join('\n');
}

function fmtSampleSection(sampleDir) {
  const out = [];
  if (!fs.existsSync(sampleDir)) return '';
  for (const f of fs.readdirSync(sampleDir).filter((x) => x.endsWith('.jsonl')).sort()) {
    const recs = readJsonl(path.join(sampleDir, f));
    if (!recs.length) continue;
    out.push(`### ${recs[0].file}`);
    out.push('');
    out.push(`抽样页：${recs.map((r) => r.pdf_page).join(', ')}（共 ${recs.length} 页）`);
    out.push('');
    out.push('| 页 | 方法 | 行数 | 字符 | 均分 | 最低分 | 低置信行 | 墨迹占比 | 框内墨迹 | 合并框 | 重试 | 旋转 | 检测长边 | 耗时 |');
    out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const r of recs) {
      const alt = (r.alts || []).map((a) => `${a.method} ${a.chars}字/${a.avg_score.toFixed(3)}`).join('、');
      out.push(`| ${r.pdf_page} | ${r.method || 'det'}${alt ? `（备选 ${alt}）` : ''} | ${r.n_lines} | ${r.chars} | ${r.avg_score.toFixed(3)} | ${(r.min_score || 0).toFixed(3)} | ${r.low_conf || 0} | ${fmtNum(r.ink_ratio)} | ${fmtNum(r.ink_in_boxes)} | ${r.merged ?? '-'} | ${r.attempts ?? '-'} | ${r.rotation || 0}° | ${r.limit_side || '-'} | ${(r.elapsed || 0).toFixed(2)}s |`);
    }
    out.push('');
  }
  return out.join('\n');
}

function fmtFileSection(idx, recs) {
  const chars = recs.map((r) => r.chars);
  const scores = recs.map((r) => r.avg_score);
  const times = recs.map((r) => r.elapsed || 0);
  const low = recs.filter((r) => r.chars < 450);
  const isText = recs.length > 0 && recs.every((r) => r.method === 'textlayer');
  const how = isText ? '文本层直取（未做 OCR）' : 'OCR（PP-OCRv4 mobile 检测 + 投影兜底）';
  const lines = [];
  lines.push(`### ${idx.file}`);
  lines.push('');
  lines.push(`- 页数：${idx.pdf_pages}；已抽取：${idx.ocr_pages} 页（方式：${how}）`);
  lines.push(`- ${isText ? '文本层字符' : '识别字符'}：${idx.chars_total} 字（中位 ${idx.chars_median} 字/页，均值 ${(idx.chars_total / Math.max(1, idx.ocr_pages)).toFixed(0)} 字/页）`);
  if (isText) {
    lines.push('- 置信度：—（文本层直取，无识别器参与；记录里 avg_score 按约定记 1.0，不参与 OCR 均分统计）');
    lines.push(`- 单页耗时：中位 ${median(times).toFixed(3)}s（取内嵌文本，无需渲染与识别）`);
  } else {
    lines.push(`- 置信度：均值 ${(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length)).toFixed(3)}，中位 ${median(scores).toFixed(3)}，最低 ${Math.min(...scores, 0).toFixed(3)}`);
    lines.push(`- 单页耗时：中位 ${median(times).toFixed(2)}s，合计 ${(times.reduce((a, b) => a + b, 0) / 60).toFixed(1)} min（单进程）`);
  }
  lines.push(`- 低产页（<450 字）：${low.length} 页${low.length ? `，例如 ${low.slice(0, 6).map((r) => r.pdf_page).join(', ')}` : ''}`);
  lines.push('');
  return lines.join('\n');
}

function buildReport(outDir) {
  const pagesDir = path.join(outDir, '_pages');
  const sampleDir = path.join(outDir, '_sample');
  const out = [];
  out.push('# 参考文件 OCR 质量报告');
  out.push('');
  out.push('本报告由 `node tools/refs-extract.mjs report` 依据实际 OCR 记录生成，');
  out.push('所有字符数、置信度、耗时均来自 `参考文件/_extract/` 下的页记录，不含估算。');
  out.push('');
  out.push('## 环境');
  out.push('');
  out.push(envInfo());
  out.push('');

  // `_pages/` also holds derived files (`.prev.jsonl` from an older run, `.premerge.jsonl`
  // from a manual merge, `.probe.jsonl` from probe tasks) — those must never be counted twice,
  // and a file may legitimately appear under more than one name, so dedupe by its own `file` field.
  const isDerived = (f) => /\.(prev|premerge|probe)\.jsonl$/.test(f);
  const cand = fs.existsSync(pagesDir)
    ? fs.readdirSync(pagesDir).filter((f) => f.endsWith('.jsonl') && !isDerived(f))
    : [];
  const byFile = new Map();
  for (const f of cand) {
    const recs = readJsonl(path.join(pagesDir, f));
    if (!recs.length) continue;
    const key = recs[0].file || f;
    const prev = byFile.get(key);
    if (!prev || recs.length > prev.n) byFile.set(key, { f, n: recs.length });
  }
  const full = [...byFile.values()].sort((a, b) => a.f.localeCompare(b.f)).map((v) => v.f);
  if (fs.existsSync(pagesDir)) {
    const skipped = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.jsonl') && isDerived(f));
    if (skipped.length) out.push(`（\`_pages/\` 中另有 ${skipped.length} 个派生文件（\`.prev/.premerge/.probe.jsonl\`）未计入统计）`, '');
  }
  if (full.length) {
    out.push('## 全量抽取结果');
    out.push('');
    out.push('| 文件 | 方式 | 页数 | 已抽取 | 字符总数 | 中位字/页 | 均分 | 低产页（<450字） | 文本 |');
    out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    let all = [];
    for (const f of full) {
      const recs = readJsonl(path.join(pagesDir, f));
      all = all.concat(recs);
      const chars = recs.map((r) => r.chars);
      const scores = recs.map((r) => r.avg_score);
      const lowt = recs.filter((r) => r.chars < 450).length;
      const rel = recs[0] ? recs[0].file : f;
      const isText = recs.length > 0 && recs.every((r) => r.method === 'textlayer');
      const avg = isText ? '—' : (scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length)).toFixed(3);
      out.push(`| ${rel} | ${isText ? '文本层' : 'OCR'} | ${Math.max(...recs.map((r) => r.pdf_page), 0)} | ${recs.length} | ${chars.reduce((a, b) => a + b, 0)} | ${median(chars).toFixed(0)} | ${avg} | ${lowt} | \`参考文件/_extract/${targetName(rel)}.txt\` |`);
    }
    out.push('');
    out.push('## 逐文件明细');
    out.push('');
    for (const f of full) {
      const recs = readJsonl(path.join(pagesDir, f));
      const idx = {
        file: recs[0] ? recs[0].file : f,
        pdf_pages: Math.max(...recs.map((r) => r.pdf_page), 0),
        ocr_pages: recs.length,
        chars_total: recs.reduce((a, r) => a + r.chars, 0),
        chars_median: median(recs.map((r) => r.chars)),
      };
      out.push(fmtFileSection(idx, recs));
    }
    out.push('## 全量统计');
    out.push('');
    out.push(`- 总页数：${all.length}`);
    out.push(`- 总字符：${all.reduce((a, r) => a + r.chars, 0)}`);
    const ocrRecs = all.filter((r) => r.method !== 'textlayer');
    const textRecs = all.filter((r) => r.method === 'textlayer');
    out.push(`- 其中 OCR 识别：${ocrRecs.length} 页 / ${ocrRecs.reduce((a, r) => a + r.chars, 0)} 字（均分 ${(ocrRecs.reduce((a, r) => a + r.avg_score, 0) / Math.max(1, ocrRecs.length)).toFixed(3)}）`);
    out.push(`- 其中文本层直取：${textRecs.length} 页 / ${textRecs.reduce((a, r) => a + r.chars, 0)} 字（数字版 PDF，未做 OCR）`);
    out.push(`- 总耗时：${(all.reduce((a, r) => a + (r.elapsed || 0), 0) / 60).toFixed(1)} min（单进程累加）`);
    out.push(`- 置信度均值（仅 OCR 页）：${(ocrRecs.reduce((a, r) => a + r.avg_score, 0) / Math.max(1, ocrRecs.length)).toFixed(3)}`);
    const rots = {};
    for (const r of all) rots[r.rotation || 0] = (rots[r.rotation || 0] || 0) + 1;
    out.push(`- 旋转分布：${Object.entries(rots).map(([k, v]) => `${k}°×${v}`).join('，')}`);
    const meths = {};
    for (const r of all) meths[r.method || 'det'] = (meths[r.method || 'det'] || 0) + 1;
    out.push(`- 切行路径：${Object.entries(meths).map(([k, v]) => `${k}×${v}`).join('，')}（每页两种路径都跑，按 字符数×均分 选优）`);
    if (meths.textlayer) {
      out.push(`- 其中 ${meths.textlayer} 页来自自带文本层的数字版 PDF（\`method=textlayer\`）：直接取 PDF 内嵌文本，未做 OCR，`);
      out.push('  因此这些记录的 `avg_score` 按约定记为 1.0（不是识别置信度），统计均分时不要把两类混为一谈。');
    }
    const covd = all.filter((r) => (r.ink_in_boxes || 0) >= 0.9).length;
    out.push(`- 框内墨迹 ≥0.9 的页：${covd} / ${all.length}（其余页多为图/表/公式占版面）`);
    const noText = all.filter((r) => !r.chars).length;
    out.push(`- 零字符页：${noText} / ${all.length}`);
    out.push('');

    out.push('## 方法与选优规则');
    out.push('');
    out.push('每页按两条路径各识别一遍，取成绩较高的一条：');
    out.push('');
    out.push('1. `det`：PP-OCRv4 mobile 检测器（onnxruntime CPU，检测长边默认 1600）切行 + 同系列识别器批量识别；');
    out.push('2. `projection`：行投影兜底——对灰度图取 20 分位阈值二值化，按「行内暗像素 ≥8 且带高 ≥8」切行带，带内按「水平间隙 > 1.6×带宽」切段，再用同一识别器识别。');
    out.push('');
    out.push('选优成绩 = `字符数 × 均分`（既偏好识别出更多字，又惩罚置信度低的那条）。两条路径都跑，是因为实测两条各有强项：');
    out.push('检测器在稀疏正文扫描页会整段漏检（把正文段落整个漏掉，只返回标题/署名），而投影路径在同一页能把它整段读回来；');
    out.push('反过来在版式规整、字号偏大的讲义页（如计量经济学讲义）检测器明显更优。逐页实测数据见附录。');
    out.push('');
    out.push('重试规则：每页先跑 `det`（检测长边 1600），紧接着跑 `projection`（同一张位图，不重复渲染）；');
    out.push('只有当投影这条不足以「落定」该页（落定条件：投影胜出且 均分 ≥ 0.6 且 框内墨迹 ≥ 0.55）时，才再用检测长边 2400 重跑 `det`，');
    out.push('必要时按旋转角再重跑一次 `det` 并在该角度补一次 `projection`。旋转角度由低成本投影判据给出，不做四方向穷举。');
    out.push('');
  }

  if (fs.existsSync(sampleDir)) {
    const sfiles = fs.readdirSync(sampleDir).filter((f) => f.endsWith('.jsonl'));
    if (sfiles.length) {
      out.push('## 小样本验证');
      out.push('');
      out.push('抽样页按与全量抽取**同一策略**识别（det 与 projection 两条切行路径选优；只有投影不足以落定该页时才用 2400 长边与旋转重试），逐页抄录结果见下；误差与局限由人工比对扫描件后记录。');
      out.push('');
      out.push(fmtSampleSection(sampleDir).trimEnd());
      out.push('');
    }
  }

  // Hand-written appendix: the machine part above only reports numbers, while
  // readability and its limits need a human reading the scans.
  const notes = path.join(outDir, 'quality-notes.md');
  if (fs.existsSync(notes)) {
    out.push('---');
    out.push('');
    out.push(fs.readFileSync(notes, 'utf8').trimEnd());
    out.push('');
  }
  return out.join('\n');
}

// ------------------------------------------------------------------- main ---

async function main() {
  const argv = process.argv.slice(2);
  const opts = parseArgs(argv);
  const cmd = opts._[0] || 'help';
  mkdirp(EXTRACT);
  switch (cmd) {
    case 'probe': return cmdProbe(opts);
    case 'sample': return cmdSample(opts);
    case 'extract': return cmdExtract(opts);
    case 'report': return cmdReport(opts);
    case 'status': return cmdStatus(opts);
    case 'worker-path': {
      log(writeWorker(opts));
      return 0;
    }
    default:
      log('用法: node tools/refs-extract.mjs <probe|sample|extract|report|status> [选项]');
      log('见本文件头部注释中的完整选项说明。');
      return cmd === 'help' ? 0 : 1;
  }
}

main().then((code) => process.exit(code || 0)).catch((e) => {
  process.stderr.write(`[fatal] ${e && e.stack ? e.stack : e}\n`);
  process.exit(1);
});