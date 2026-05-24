# 下阶段工作交接

日期：2026-05-24

## 当前基线

- 仓库：`https://github.com/godrich140/Godrich-HUB.git`
- 分支：`main`
- 当前提交：`66ab0b41e10a78babaa3f42b27b980cb595ce125`
- 短提交号：`66ab0b4`
- 最新提交说明：`Compact workbench controls`
- 本地目录：`C:\Users\gocri\Documents\New project`
- 服务器目录：`/opt/packing-app/Godrich-HUB`
- 公网地址：`http://129.204.142.19/`
- 服务器登录用户：`root`
- SSH 私钥：`C:\Users\gocri\.ssh\godrich140.pem`

## 版本一致性

截至本交接文件编制时：

- 本地 HEAD：`66ab0b4`
- GitHub `main`：`66ab0b4`
- 服务器 HEAD：`66ab0b4`
- 后端服务：`packing-backend.service`，状态 `active`
- Nginx 服务：`nginx.service`，状态 `active`
- 后端健康检查：`GET http://127.0.0.1:8000/health -> {"status":"ok"}`

注意：服务器工作树仍存在部署环境本地修改，未纳入仓库提交：

```text
backend/.env.example
backend/app/config.py
backend/app/services.py
backend/requirements.txt
frontend/package-lock.json
```

这些文件需要下阶段先审计后再决定是否提交、保留为服务器配置，或拆分为环境配置。不要直接执行 `git reset --hard`，否则可能覆盖服务器当前可运行配置。

本地仍有未跟踪目录：

```text
tools/
```

该目录此前已存在，当前没有提交。

## 已完成事项

### 1. Excel 批量导入、导出、下载后端落地

已新增后端接口：

```text
POST /api/excel/import-history
POST /api/excel/export-history
GET  /api/excel/download/{file_id}
```

关键文件：

```text
backend/app/routers/excel.py
backend/app/main.py
backend/app/schemas.py
frontend/src/App.tsx
frontend/vite.config.ts
```

服务器文件落地位置：

```text
/opt/packing-app/Godrich-HUB/backend/uploads/excel_imports
/opt/packing-app/Godrich-HUB/backend/uploads/exports
```

已验证：

- 批量导入 Excel 可上传到后端，并生成待核对草稿单。
- 批量导出 Excel 由后端生成 `.xls` 文件并保存。
- 下载接口返回服务器保存的真实文件。
- 公网 `/api/` 经 Nginx 转发可用。

详细记录见：

```text
docs/excel-import-export-review-2026-05-23.md
```

### 2. 工作台 UI 调整

已参考用户提供的 UI 设计稿调整工作台界面：

- 深色左侧导航栏。
- 蓝金配色。
- 顶部统计卡。
- 客户、日期、单号、状态表单区。
- 明细录入表格卡片。
- 右侧照片识别和付款信息面板。
- 工作台控件已做紧凑化调整。

关键文件：

```text
frontend/src/App.tsx
frontend/src/styles.css
frontend/index.html
```

已验证：

- 本地 `npm run build` 通过。
- 服务器 `npm run build` 通过。
- 公网首页 `http://129.204.142.19/` 可访问。
- Playwright 打开公网页面，标题为 `装箱单工作台`。

## 当前可用部署命令

### 本地构建

```powershell
cd "C:\Users\gocri\Documents\New project\frontend"
npm run build
```

### 服务器同步仓库并构建前端

```powershell
ssh -i C:\Users\gocri\.ssh\godrich140.pem -o IdentitiesOnly=yes root@129.204.142.19 "cd /opt/packing-app/Godrich-HUB && git fetch origin main && git merge --ff-only origin/main && cd frontend && npm run build && systemctl reload nginx"
```

### 后端重启

仅当后端代码或依赖变更后执行：

```powershell
ssh -i C:\Users\gocri\.ssh\godrich140.pem -o IdentitiesOnly=yes root@129.204.142.19 "systemctl restart packing-backend.service && systemctl is-active packing-backend.service"
```

### 健康检查

```powershell
ssh -i C:\Users\gocri\.ssh\godrich140.pem -o IdentitiesOnly=yes root@129.204.142.19 "curl -sS http://127.0.0.1:8000/health"
```

公网检查：

```powershell
Invoke-WebRequest -Uri "http://129.204.142.19/" -UseBasicParsing
```

## 下阶段建议优先级

### P0：审计服务器本地修改

服务器有 5 个未提交修改文件。下阶段应先逐个比较：

```bash
cd /opt/packing-app/Godrich-HUB
git diff -- backend/.env.example
git diff -- backend/app/config.py
git diff -- backend/app/services.py
git diff -- backend/requirements.txt
git diff -- frontend/package-lock.json
```

重点关注 `backend/app/services.py` 和 `backend/requirements.txt`，它们属于实际运行代码/依赖，不应长期只存在服务器。

### P1：接通单张单据“预览”和“生成 Excel”

当前历史单据批量导入、批量导出、下载已经后端落地，但工作台右上角和历史预览里的单张单据按钮仍主要是 UI 按钮：

```text
保存草稿
预览表格
生成 Excel
```

建议新增或复用后端接口：

```text
POST /api/orders
GET  /api/orders/{id}
POST /api/orders/{id}/export-excel
GET  /api/excel/download/{file_id}
```

目标：

- 保存工作台当前装箱单到数据库。
- 预览真实后端单据数据。
- 单张单据生成 Excel 并落地到 `uploads/exports`。
- 下载仍走后端文件接口。

### P1：Excel 导入真实解析

当前 `/api/excel/import-history` 已保存原始 Excel 并生成草稿单，但尚未解析真实单元格内容。

建议：

- `.xlsx` 使用 `openpyxl`。
- `.xls` 需要确认服务器依赖，可考虑 `xlrd==1.2.0` 或先转换格式。
- 解析结果映射到 `PackingOrder` 和 `PackingItem`。
- 解析失败时保留原始文件并返回可读错误。

### P2：完善 UI 细节

建议继续优化：

- 使用图标库替代当前字符图标。
- 为 1366、1440、1920、移动端分别做截图检查。
- 处理金额较长时的完整显示策略。
- 历史单据页也按同一设计语言进一步统一。

### P2：补充自动化测试

建议增加：

- 后端接口测试：导入、导出、下载。
- 前端构建测试。
- Playwright 冒烟测试：打开工作台、切换历史单据、批量导入、批量导出。

## 风险与注意事项

- 不要直接清理服务器 `backend/uploads`，其中存放导入和导出的业务文件。
- 不要直接 `git reset --hard` 服务器仓库，除非已确认并备份服务器本地修改。
- 当前公网为 HTTP，若后续正式使用应配置 HTTPS。
- 当前导出的 `.xls` 是 Excel 可打开的 HTML 表格格式，不是原生 `.xlsx` 工作簿。
- 当前 UI 的“照片识别”仍是前端模拟识别状态，未接入真实 OCR 后端。

## 快速接手检查清单

1. 本地执行 `git status --short`，确认除 `tools/` 外无意外变更。
2. 执行 `git pull origin main`，确认本地最新。
3. 服务器执行 `git rev-parse --short HEAD`，确认等于 GitHub `main`。
4. 打开 `http://129.204.142.19/`，确认工作台页面正常。
5. 调用 `/health`，确认后端正常。
6. 在历史单据页测试一次 Excel 批量导入和批量导出。
7. 下阶段开始前先处理服务器本地修改审计。
