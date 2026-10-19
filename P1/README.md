# WITHIN · Mobile VR experience

基于作品集中的 **WITHIN** 概念制作的手机端可运行原型。项目延续作品集的紫色空间视觉、个人价值/自我接纳主题和手机 UI 流程，并补齐页面跳转、交互反馈、保存状态与沉浸式体验。界面现支持英文与简体中文切换，语言选择会保存在当前设备。

## 本地运行

需要 Node.js 18 或更新版本；项目没有 npm 依赖。

```powershell
npm run start
```

浏览器打开 `http://localhost:4173`。手机浏览器可以访问同一 Wi-Fi 下电脑的局域网地址；启动前在 PowerShell 设置 ` $env:WITHIN_HOST="0.0.0.0" `，然后用 `ipconfig` 查看电脑 IPv4 地址。摄像头、陀螺仪和 WebXR 通常需要 HTTPS；`localhost` 是本机预览例外。部署到静态 HTTPS 主机后可安装为 PWA。

## GitHub Pages 发布

推送到 `main` 分支后，GitHub Actions 会自动发布静态网页。首次发布需要在仓库的 **Settings → Pages** 中将发布来源设为 **GitHub Actions**。公开网页地址格式为 `https://<GitHub用户名>.github.io/WITHIN/`。

## 交互流程

1. 欢迎页进入体验，也可打开本地演示登录。
2. 首页进入主题体验、搜索内容、扫描展览空间或打开价值地图。
3. 内容详情可收藏、分享并开始体验。
4. 沉浸空间支持拖动/触屏视角、热点提示、价值选择、重置视角、柔和环境音、陀螺仪权限和可用时的 WebXR 头显模式。
5. 完成体验后保存一条反思；旅程进度、收藏、个人名和反思保存在当前浏览器。

## 能力边界

- 页面、状态和触屏场景均可离线工作；首次加载 A-Frame 需要网络。A-Frame 加载失败时自动显示内置 CSS 场景，仍可完成热点交互。
- WebXR、陀螺仪权限、相机和二维码识别由浏览器与设备决定；不可用时保留触摸/拖动操作和演示空间，不会阻断主流程。
- 登录仅用于作品集演示，不连接账号服务；资料保存在当前设备浏览器中。

## 文件

- `index.html`、`styles.css`、`app.js`、`localization.js`：手机界面、视觉、交互与中英双语词条。
- `manifest.json`、`service-worker.js`：PWA 安装信息与应用页面缓存。
- `server.mjs`：无依赖本地静态服务器。
- `PORTFOLIO-SUPPLEMENT.md`：可用于补入作品集的手机端设计说明。
