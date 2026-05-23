# Excel 导入、导出、下载后端落地交接

日期：2026-05-24

## 本次目标

- 历史单据增加批量导入 Excel 功能。
- 批量导出、下载和导入 Excel 均由后端落地保存，避免只在浏览器临时生成文件。
- 复核服务器文件存放位置、下载接口和公网调用链路。
- 更新本地代码、推送仓库并部署到腾讯云轻量服务器。

## 已上线版本

- GitHub 仓库：`https://github.com/godrich140/Godrich-HUB.git`
- 分支：`main`
- 已推送提交：`dd25a51 Persist Excel import and export on backend`
- 服务器目录：`/opt/packing-app/Godrich-HUB`
- 后端服务：`packing-backend.service`
- 前端静态目录：`/opt/packing-app/Godrich-HUB/frontend/dist`
- 公网地址：`http://129.204.142.19/`

服务器已快进到 `dd25a51`。服务器原有本地配置修改仍保留，未被覆盖：

```text
backend/.env.example
backend/app/config.py
backend/app/services.py
backend/requirements.txt
frontend/package-lock.json
```

## 后端新增接口

新增文件：`backend/app/routers/excel.py`

路由注册：`backend/app/main.py`

数据结构：`backend/app/schemas.py`

```text
POST /api/excel/import-history
POST /api/excel/export-history
GET  /api/excel/download/{file_id}
```

### 批量导入

接口：`POST /api/excel/import-history`

行为：

- 接收一个或多个 `.xls` / `.xlsx` 文件。
- 调用后端上传保存逻辑，将原始 Excel 文件保存到服务器。
- 每个导入文件生成一张待核对草稿单。
- 文件资产记录中的 `biz_id` 会关联到生成的单据 ID。

服务器落地目录：

```text
/opt/packing-app/Godrich-HUB/backend/uploads/excel_imports
```

说明：当前版本先完成文件落地和草稿单生成，尚未解析真实 Excel 单元格内容。

### 批量导出

接口：`POST /api/excel/export-history`

行为：

- 接收前端当前筛选后的历史单据列表。
- 后端生成 Excel 可打开的 `.xls` 文件。
- 文件保存到服务器，并写入 `FileAsset`。
- 返回后端下载地址。

服务器落地目录：

```text
/opt/packing-app/Godrich-HUB/backend/uploads/exports
```

### 文件下载

接口：`GET /api/excel/download/{file_id}`

行为：

- 只允许下载 `exports` 和 `excel_imports` 类型的文件。
- 返回真实服务器文件，响应头包含 `Content-Disposition: attachment`。

## 前端调整

主要文件：`frontend/src/App.tsx`

- 历史单据页增加批量导入 Excel 入口。
- 导入时通过 `FormData` 调用 `/api/excel/import-history`。
- 批量导出时调用 `/api/excel/export-history`，再跳转后端返回的下载 URL。
- 导入和导出按钮增加处理中状态。

样式文件：`frontend/src/styles.css`

- 新增导入按钮、导入状态面板和禁用态样式。

开发代理：`frontend/vite.config.ts`

```text
/api -> http://127.0.0.1:8000
```

## 服务器部署步骤

已执行：

```bash
cd /opt/packing-app/Godrich-HUB
git fetch origin main
git merge --ff-only origin/main
python3 -m compileall backend/app
cd frontend
npm run build
systemctl restart packing-backend.service
systemctl reload nginx
```

结果：

- 后端编译通过。
- 前端构建通过。
- `packing-backend.service` 状态为 `active`。
- `nginx.service` 状态为 `active`。
- `/health` 返回 `200 {"status":"ok"}`。

## 测试结果

### 服务器本机接口测试

导入测试：

- 请求：`POST http://127.0.0.1:8000/api/excel/import-history`
- 文件：`codex-import.xlsx`
- 结果：200
- 返回单据：`IMP20260524-D178BD1C`
- 落地文件：`backend/uploads/excel_imports/d6aa0cd8-8339-4ee8-8ba2-3367398ceb75.xlsx`

导出测试：

- 请求：`POST http://127.0.0.1:8000/api/excel/export-history`
- 结果：200
- 返回文件：`packing-history-2026-05-24-f98d046c.xls`
- 落地文件：`backend/uploads/exports/packing-history-2026-05-24-f98d046c.xls`

下载测试：

- 请求：`GET /api/excel/download/e1da4f8b-c597-4a80-a190-caa7adde1dc1`
- 结果：200
- `Content-Type: application/vnd.ms-excel`
- 下载文件大小：430 bytes

### 公网接口测试

页面访问：

- `GET http://129.204.142.19/` -> 200
- `GET http://129.204.142.19/health` -> 200

公网导入：

- 请求：`POST http://129.204.142.19/api/excel/import-history`
- 文件：`codex-public-import.xlsx`
- 结果：200
- 返回单据：`IMP20260524-D889C9B5`
- 落地文件：`uploads/excel_imports/d37652ec-2eff-4cde-a2f5-4d7c4119ae88.xlsx`

公网导出：

- 请求：`POST http://129.204.142.19/api/excel/export-history`
- 结果：200
- 返回文件：`packing-history-2026-05-24-028838b2.xls`
- 落地文件：`uploads/exports/packing-history-2026-05-24-028838b2.xls`

公网下载：

- 请求：`GET http://129.204.142.19/api/excel/download/c9f35194-42ac-4a89-a074-8287badd4bab`
- 结果：200
- `Content-Type: application/vnd.ms-excel`
- `Content-Disposition: attachment; filename="packing-history-2026-05-24-028838b2.xls"`
- 下载文件大小：430 bytes

## 当前结论

- 批量导入 Excel 已由后端接收并落地保存。
- 批量导出 Excel 已由后端生成并落地保存。
- 下载接口已能返回服务器保存的真实文件。
- Nginx 公网 `/api/` 转发链路可用。
- 历史单据批量导入、批量导出、下载三条链路已完成部署和接口验证。

## 未完成事项

- 当前导入只生成待核对草稿单，尚未解析真实 Excel 单元格内容。
- 单张单据右侧的“预览”和“生成 Excel”按钮仍未接入真实后端单据预览/单据导出逻辑。
- 如需导出审计记录，后续可在 `/api/excel/export-history` 中补充写入 `export_records` 表。
