# ============================================================
#  考研数学三 · 公式记忆 —— 本地静态服务器
#  作用：以 http 方式启动本应用，从而启用 PWA / 离线缓存 / 添加到主屏幕
#
#  用法（任选其一）：
#   1) 在终端执行：  powershell -ExecutionPolicy Bypass -File serve.ps1
#   2) 右键本文件 -> 使用 PowerShell 运行（若被策略拦截，用第 1 种）
#
#  启动后浏览器访问： http://localhost:8080
#  手机同局域网访问： 用管理员身份运行，并改为  -Host '+'
# ============================================================

param(
  [int]$Port = 8080,
  [string]$HostName = 'localhost'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$mime = @{
  '.html'        = 'text/html; charset=utf-8'
  '.css'         = 'text/css; charset=utf-8'
  '.js'          = 'application/javascript; charset=utf-8'
  '.json'        = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.png'         = 'image/png'
  '.svg'         = 'image/svg+xml'
  '.ico'         = 'image/x-icon'
  '.woff'        = 'font/woff'
  '.woff2'       = 'font/woff2'
  '.ttf'         = 'font/ttf'
}

function New-Listener($prefix) {
  $l = New-Object System.Net.HttpListener
  $l.Prefixes.Add($prefix)
  $l.Start()
  return $l
}

$prefix = "http://${HostName}:${Port}/"
$listener = $null
try {
  $listener = New-Listener $prefix
} catch {
  Write-Host "无法绑定 $prefix ，尝试改用 localhost ..." -ForegroundColor Yellow
  $prefix = "http://localhost:$Port/"
  $listener = New-Listener $prefix
}

Write-Host '==============================================' -ForegroundColor Cyan
Write-Host '  数三公式记忆 已启动' -ForegroundColor Cyan
Write-Host "  本机访问： http://localhost:$Port" -ForegroundColor Green
Write-Host '  停止： 按 Ctrl+C' -ForegroundColor Yellow
Write-Host '==============================================' -ForegroundColor Cyan

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $reqPath = $ctx.Request.Url.AbsolutePath
  if ($reqPath -eq '/') { $reqPath = '/index.html' }
  $rel = $reqPath.TrimStart('/') -replace '/', '\'
  $file = Join-Path $root $rel
  $safe = $file.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)

  if ($safe -and (Test-Path -Path $file -PathType Leaf)) {
    $ext = [System.IO.Path]::GetExtension($file).ToLower()
    $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $ctx.Response.StatusCode = 200
    $ctx.Response.ContentType = $type
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
    $ctx.Response.ContentType = 'text/plain; charset=utf-8'
    $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
    $ctx.Response.ContentLength64 = $msg.Length
    $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
  }
  $ctx.Response.Close()
}
