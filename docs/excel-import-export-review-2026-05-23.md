# Excel 导入/导出功能复核

日期：2026-05-23
目标：

- 历史单据增加批量导入 Excel 功能。
- 复核服务器 Excel 文件存放位置、API 调用路径，以及批量下载 Excel 的当前可运行状态。
- 记录本地代码修改和测试结果。

## 本地代码调整

### 历史单据批量导入 Excel

位置：`frontend/src/App.tsx`

已新增：

- 历史单据页顶部增加“批量导入 Excel”入口。
- 支持一次选择多个 `.xls` / `.xlsx` 文件。
- 校验文件扩展名，不符合时显示提示。
- 导入后生成历史单据草稿，插入历史单据列表顶部。
- 自动选中第一条导入草稿，并在右侧预览区显示。
- 导入状态面板显示导入单据数、导入明细数和当前提示。

当前实现说明：

- 前端把 Excel 文件提交到后端 `/api/excel/import-history`。
- 后端把原始 Excel 文件保存到服务器 `uploads/excel_imports`。
- 后端为每个 Excel 文件创建一张待核对草稿单。
- 当前尚不解析真实 Excel 单元格，真实解析仍需后续接入 Excel parser。

### 历史单据批量导出 Excel

位置：`frontend/src/App.tsx`

已新增：

- 历史单据页“批量导出”按钮调用后端 `/api/excel/export-history`。
- 后端生成 Excel 可打开的 `.xls` 文件并保存到服务器 `uploads/exports`。
- 前端使用后端返回的 `/api/excel/download/{file_id}` 触发下载。
- 当无筛选结果时按钮禁用。

当前实现说明：

- 批量导出已由后端落盘保存。
- 单据右侧“预览”“生成 Excel”仍是展示按钮，尚未接入真实单据预览/单单导出逻辑。

## 样式调整

位置：`frontend/src/styles.css`

已新增：

- `.file-action`：用于文件选择按钮样式。
- `.import-panel`：用于 Excel 批量导入状态面板。
- `button:disabled`：用于禁用态按钮。
- 移动端下导入状态面板单列显示。

## 后端接口

新增接口：

```text
POST /api/excel/import-history
POST /api/excel/export-history
GET  /api/excel/download/{file_id}
```

新增文件：

```text
backend/app/routers/excel.py
```

路由注册：

```text
backend/app/main.py
```

本地开发代理：

```text
frontend/vite.config.ts
/api -> http://127.0.0.1:8000
```

## 服务器复核结果

服务器：`129.204.142.19`

当前线上代码目录：

```text
/opt/packing-app/Godrich-HUB
```

当前 Nginx 前端静态目录：

```text
/opt/packing-app/Godrich-HUB/frontend/dist
```

当前 Nginx API 代理：

```text
location /api/ -> http://127.0.0.1:8000/api/
```

后端健康检查：

```text
GET http://127.0.0.1:8000/health -> 200 {"status":"ok"}
```

公网 `/api/health` 返回 404 属于当前路由设计结果，因为健康检查暴露在 `/health`，不是 `/api/health`。

## Excel 上传存放位置

后端上传接口：

```text
POST /api/files/upload
```

后端保存逻辑：

```text
backend/app/services.py
save_upload()
```

服务端上传根目录：

```text
/opt/packing-app/Godrich-HUB/backend/uploads
```

实际调用测试：

```text
POST http://127.0.0.1:8000/api/files/upload
file_type=excel_imports
file=server-import-smoke.xlsx
```

返回结果：

```json
{
  "biz_type": "packing_order",
  "file_type": "excel_imports",
  "original_name": "server-import-smoke.xlsx",
  "storage_path": "uploads/excel_imports/1412d78b-63aa-4f83-9531-83965d69e92c.xlsx",
  "file_size": 18
}
```

实际落盘位置：

```text
/opt/packing-app/Godrich-HUB/backend/uploads/excel_imports/1412d78b-63aa-4f83-9531-83965d69e92c.xlsx
```

结论：服务器文件上传接口和 Excel 文件落盘位置可用。

## 批量下载 Excel 复核

本次已改为后端落地：

- `POST /api/excel/export-history` 生成 `.xls`。
- 文件保存到 `uploads/exports`。
- `GET /api/excel/download/{file_id}` 返回文件下载。
- 当前暂未写入 `export_records` 表；如需审计导出历史，后续可在导出接口中补写 `export_records`。

## 已完成测试

本地浏览器交互测试：

- 进入历史单据页。
- 选择 2 个测试 Excel 文件：`import-a.xlsx`、`import-b.xls`。
- 页面提示：`已导入 2 个 Excel 文件`。
- 历史单据卡片从 2 条变为 4 条。
- 右侧预览选中新生成的 `IMP...` 导入草稿单。
- 预览表格第一行显示：
  - 品名：`待核对：import-a`
  - 描述：`已接收 Excel 文件 import-a.xlsx...`

服务器接口测试：

- `/health` 可用。
- `/api/files/upload` 可用。
- `file_type=excel_imports` 上传后可落盘。

## 补充验证

2026-05-24 已补充执行：

```bash
cd frontend
npm run build
```

结果：构建通过。

本地 Playwright 已补充验证：

- 选择 `import-a.xlsx`、`import-b.xls`。
- 页面提示包含 `已导入 2 个 Excel 文件`。
- 历史单据卡片数量为 4。
- 预览区选中新生成的 `IMP...` 草稿单。
- 预览第一行：
  - 品名：`待核对：import-a`
  - 描述：`已接收 Excel 文件 import-a.xlsx...`
- 点击“批量导出”触发下载。
- 下载文件名符合：`packing-history-YYYY-MM-DD.xls`。
- 本轮测试返回文件名：`packing-history-2026-05-23.xls`。

结论：

- 批量导入 Excel 前端流程通过。
- 批量导出 Excel 下载触发通过。
- 真实 Excel 内容解析、后端服务端导出和下载接口仍待后续实现。

## 2026-05-24 后端落地调整

根据“导入、导出和下载必须由后端落地，否则无法储存”的要求，已追加修改：

- 导入：前端上传到 `/api/excel/import-history`，后端保存原始 Excel 文件并创建草稿单。
- 导出：前端提交当前筛选结果到 `/api/excel/export-history`，后端生成并保存 `.xls` 文件。
- 下载：前端跳转到后端返回的 `/api/excel/download/{file_id}` 下载服务器文件。

待补充验证：

- 后端接口编译检查：已通过 `python -m compileall backend\app`。
- 前端构建检查：已通过 `npm run build`。
- 前后端联调导入、导出和下载。
- 服务器部署后确认：
  - `uploads/excel_imports` 有导入文件。
  - `uploads/exports` 有导出文件。
  - 下载接口返回实际服务器文件。
