# 洛克王国世界 工具箱

目前有的功能：
- 图鉴
- 配对
- 配种
- 表格
- 查蛋
- 孵蛋
- 星图
- 属性关系


### 使用

在线访问: https://rocom.aoe.top

本地重建精灵数据: `npm run sync:pet-data`

### 结构

- 精灵相关数据在 `public\data` ，数据来源于洛克王国世界的游戏数据包，经过处理后以 JSON 格式存储.
- 相关脚本在 `scripts` 
- 前端使用 Vue 3 + Vite 构建，组件库使用 Shadcn UI，样式使用 Tailwind CSS.
- 主要页面在 `src\pages`

