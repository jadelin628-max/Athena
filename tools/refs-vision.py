#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
refs-vision.py —— 参考资料「读图裁定」取证裁片工具（Athena 2.2.0 前置）

用途
    把「参考文件/」下的扫描件 PDF 的某一页（可选某一区域）渲染成一张 PNG 裁片，
    交给主通道（Agent 自身 read_image 工具）肉眼读图，用于低产页的转录裁定。
    裁片只作取证用，落在 backup/scratch/refs-vision/<材料>/ 下（已被 .gitignore 忽略），
    任何裁片都可以用本工具用同一条命令重新生成，因此不必入库。

为什么要有它
    - 转录基线的每一处「读图裁定」都必须可复现：同一命令 → 同一张 PNG（同 sha256）。
    - 渲染、裁剪、坐标换算（PDF 点 → 像素）由一个脚本统一负责，避免每次手搓不一致。
    - 输出打印像素尺寸与 sha256，便于把「读的是哪张图」写进裁定记录并可事后校验。

依赖
    纯标准库 + PyMuPDF（pymupdf / fitz）。不联网、不装包、不引入 npm 依赖。

命令
    python tools/refs-vision.py --pdf <PDF> --page N [--dpi 150] [--box x0,y0,x1,y1]
                               [--out <PNG>] [--python <PYTHON>]

    选项
      --pdf     PDF 路径（相对仓库根或绝对路径）。必填。
      --page    页码，1 基（第 1 页 = PDF 第 1 物理页）。必填。
      --dpi     渲染分辨率，默认 150。
      --box     可选裁剪框 `x0,y0,x1,y1`，单位为 PDF 点（1 点 = 1/72 英寸），
                原点在页面左上角，向下为 y 正方向，与 --dpi 无关（先渲染后裁剪）。
                省略则输出整页。
      --out     输出 PNG 路径。省略时自动写到
                backup/scratch/refs-vision/<材料>/<PDF名>_p<页码>[_<box>]_<dpi>dpi.png
      --verify  只校验：重渲一次并与 --out 现有 PNG 比对 sha256（不覆盖文件；不一致退出码 1）。
                裁定记录里写的 sha256 可用它事后复核。
      --python  指定 python 可执行文件（默认仓库内 参考文件/_venv/Scripts/python.exe，
                不存在时退回 PATH 上的 python）。仅用于回显「等效命令」，
                工具本身由当前解释器运行。

输出
    PNG 文件；stdout 打印 输出路径 / 像素尺寸 / sha256 / 等效命令（可直接复制重跑）。

确定性
    同一 --pdf --page --dpi --box 两次运行必然得到字节一致的 PNG：PyMuPDF 渲染是
    确定性的，PNG 编码器固定（无时间戳等可变字段），因此 sha256 一致。
    脚本自检方式：同参数跑两次，比对打印的 sha256。

退出码
    0 成功；1 --verify 比对不一致；2 参数错误；3 文件/页码/依赖错误。
"""
from __future__ import annotations

import argparse
import hashlib
import os
import sys
import tempfile
from pathlib import Path

try:  # PyMuPDF 1.24+ 推荐 pymupdf，旧版只有 fitz
    import pymupdf as fitz  # type: ignore
except ImportError:  # pragma: no cover
    import fitz  # type: ignore

ROOT = Path(__file__).resolve().parent.parent
REFS = ROOT / "参考文件"
SCRATCH = ROOT / "backup" / "scratch" / "refs-vision"
DEFAULT_PY = REFS / "_venv" / "Scripts" / "python.exe"

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
except Exception:  # pragma: no cover
    pass


def die(code: int, msg: str) -> None:
    sys.stderr.write(msg.rstrip() + "\n")
    raise SystemExit(code)


def parse_box(spec: str):
    """`x0,y0,x1,y1`（PDF 点）→ (x0, y0, x1, y1)，校验顺序与正值。"""
    parts = [p.strip() for p in str(spec).split(",")]
    if len(parts) != 4:
        die(2, "--box 需要 4 个逗号分隔的数：x0,y0,x1,y1（收到 %r）" % spec)
    try:
        vals = [float(p) for p in parts]
    except ValueError:
        die(2, "--box 不是合法的数字：%r" % spec)
    x0, y0, x1, y1 = vals
    if x0 >= x1 or y0 >= y1:
        die(2, "--box 需要 x0<x1 且 y0<y1（收到 %r）" % spec)
    if x0 < 0 or y0 < 0:
        die(2, "--box 不允许负坐标（收到 %r）" % spec)
    return x0, y0, x1, y1


def resolve_pdf(arg: str) -> Path:
    raw = Path(arg)
    cand = [raw] if raw.is_absolute() else [Path.cwd() / raw, ROOT / raw, REFS / raw]
    for c in cand:
        if c.is_file():
            return c.resolve()
    die(3, "找不到 PDF：%s" % arg)
    raise AssertionError  # unreachable


def rel_to_root(p: Path) -> str:
    """POSIX 风格、相对仓库根的路径；不在仓库内时回原绝对路径。"""
    try:
        return p.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return p.resolve().as_posix()


def material_slug(pdf: Path) -> str:
    """材料目录名：相对 参考文件/ 的路径去掉 .pdf 后缀、分隔符换成 __（与 _extract 命名同风格）。"""
    try:
        rel = pdf.resolve().relative_to(REFS.resolve())
        return rel.with_suffix("").as_posix().replace("/", "__")
    except ValueError:
        return pdf.stem


def default_out(pdf: Path, page: int, dpi: float, box) -> Path:
    name = pdf.with_suffix("").name
    tag = "_full" if box is None else "_" + "_".join("%g" % v for v in box)
    dpi_tag = "%g" % dpi
    return SCRATCH / material_slug(pdf) / ("%s_p%d%s_%sdpi.png" % (name, page, tag, dpi_tag))


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def png_ihdr_size(path: Path):
    """读 PNG 的 IHDR，返回 (宽, 高)。不依赖任何三方库，也不触发 PyMuPDF 的缩放。"""
    import struct

    with open(path, "rb") as fh:
        head = fh.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n" or head[12:16] != b"IHDR":
        die(3, "输出不是合法 PNG：%s" % path)
    w, h = struct.unpack(">II", head[16:24])
    return int(w), int(h)


def python_bin(arg) -> str:
    if arg:
        return str(arg)
    if DEFAULT_PY.is_file():
        return str(DEFAULT_PY)
    return "python" if os.name == "nt" else "python3"


def equivalent_command(pdf: Path, page: int, dpi: float, box, out: Path, py: str) -> str:
    parts = [
        'python tools/refs-vision.py',
        '--pdf "%s"' % rel_to_root(pdf),
        "--page %d" % page,
        "--dpi %g" % dpi,
    ]
    if box is not None:
        parts.append("--box " + ",".join("%g" % v for v in box))
    parts.append('--out "%s"' % rel_to_root(out))
    parts.append('--python "%s"' % py)
    return " ".join(parts)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(
        prog="refs-vision.py",
        description="参考文件读图裁定：把 PDF 某页（可裁剪）渲染成确定性 PNG 裁片。",
        add_help=True,
    )
    ap.add_argument("--pdf", required=True, help="PDF 路径（相对仓库根或绝对路径）")
    ap.add_argument("--page", required=True, type=int, help="页码，1 基")
    ap.add_argument("--dpi", type=float, default=150.0, help="渲染分辨率，默认 150")
    ap.add_argument("--box", default=None, help="可选裁剪框 x0,y0,x1,y1（PDF 点，左上原点）")
    ap.add_argument("--out", default=None, help="输出 PNG 路径")
    ap.add_argument("--python", default=None, help="python 可执行文件（默认 参考文件/_venv/Scripts/python.exe）")
    ap.add_argument("--verify", action="store_true",
                    help="只校验：重新渲染并比对 --out 现有 PNG 的 sha256（不一致时退出码 1，不覆盖文件）")
    args = ap.parse_args(argv)

    if args.page < 1:
        die(2, "--page 必须是 1 基的正整数（收到 %d）" % args.page)
    if args.dpi <= 0:
        die(2, "--dpi 必须为正数（收到 %g）" % args.dpi)
    box = parse_box(args.box) if args.box else None
    pdf = resolve_pdf(args.pdf)
    out = Path(args.out).resolve() if args.out else default_out(pdf, args.page, args.dpi, box)

    try:
        doc = fitz.open(str(pdf))
    except Exception as exc:  # noqa: BLE001
        die(3, "无法打开 PDF：%s（%s）" % (pdf, exc))

    temp_path = None
    try:
        with doc:
            if args.page > doc.page_count:
                die(3, "页码越界：--page %d，但该 PDF 只有 %d 页" % (args.page, doc.page_count))
            page = doc[args.page - 1]
            rect = page.rect
            total_pages = doc.page_count
            page_rotation = page.rotation
            w_pt, h_pt = rect.width, rect.height
            zoom = args.dpi / 72.0
            mat = fitz.Matrix(zoom, zoom)
            if box is None:
                clip = fitz.Rect(0, 0, w_pt, h_pt)
                clip_box = None
            else:
                x0, y0, x1, y1 = box
                if x0 >= w_pt or y0 >= h_pt:
                    die(3, "裁剪框完全落在页面外：%s 不在 %.1fx%.1f 点的页面内"
                          % (",".join("%g" % v for v in box), w_pt, h_pt))
                x1c, y1c = min(x1, w_pt), min(y1, h_pt)
                clip_box = (x0, y0, x1c, y1c)
                # clip 取整到「渲染后像素」的网格，保证输出尺寸与 --dpi 严格对应且可复现
                clip = fitz.Rect(int(round(x0 * zoom)), int(round(y0 * zoom)),
                                 int(round(x1c * zoom)), int(round(y1c * zoom)))
                if clip.is_empty:
                    die(3, "裁剪框取整后为空：%s" % (",".join("%g" % v for v in box),))
                clip = clip / zoom  # 换回 PDF 点坐标
            pix = page.get_pixmap(matrix=mat, alpha=False, colorspace=fitz.csRGB, clip=clip)
            if pix.width <= 0 or pix.height <= 0:
                die(3, "渲染结果为空：%dx%d" % (pix.width, pix.height))
            if args.verify:
                out.parent.mkdir(parents=True, exist_ok=True)
                fd, temp_path = tempfile.mkstemp(suffix=".png", dir=str(out.parent))
                os.close(fd)
                pix.save(temp_path)
                fresh = sha256_of(Path(temp_path))
                if not out.exists():
                    die(3, "--verify 找不到既有裁片：%s（先不带 --verify 跑一次生成）" % rel_to_root(out))
                recorded = sha256_of(out)
                ok = fresh == recorded
                sys.stdout.write(
                    "verify: %s\n既有 sha256: %s\n重渲 sha256: %s\n结果: %s\n"
                    % (rel_to_root(out), recorded, fresh, "OK（一致）" if ok else "MISMATCH（不一致）"))
                return 0 if ok else 1
            out.parent.mkdir(parents=True, exist_ok=True)
            pix.save(str(out))
            # 回读校验：直接读 PNG 的 IHDR（不经 PyMuPDF —— 它会按 1MP 上限缩放开图）
            w, h = png_ihdr_size(out)
            if (w, h) != (pix.width, pix.height):
                die(3, "写盘后尺寸不一致：期望 %dx%d，回读 %dx%d" % (pix.width, pix.height, w, h))
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

    py = python_bin(args.python)
    digest = sha256_of(out)
    size = out.stat().st_size
    lines = [
        "out:    %s" % rel_to_root(out),
        "pdf:    %s (第 %d 页 / 共 %d 页)" % (rel_to_root(pdf), args.page, total_pages),
        "page:   %.1f x %.1f pt  rotation=%d" % (w_pt, h_pt, page_rotation),
        "dpi:    %g  (zoom %g)" % (args.dpi, args.dpi / 72.0),
        "box:    %s" % ("full page" if box is None else ", ".join("%g" % v for v in clip_box)),
        "pixels: %d x %d" % (pix.width, pix.height),
        "bytes:  %d" % size,
        "sha256: %s" % digest,
        "等效命令: %s" % equivalent_command(pdf, args.page, args.dpi, box, out, py),
    ]
    sys.stdout.write("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())