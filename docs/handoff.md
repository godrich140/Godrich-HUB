# 装箱单项目交接文档

## 1. 项目概览

本项目是一个“装箱单生成与管理系统”，目标功能包括：

- 在电脑和手机网页端录入装箱单。
- 按 Excel 模板结构维护装箱单明细。
- 支持历史单据查询、统计查询、客户通讯录。
- 支持产品图片上传和预览。
- 支持手写照片上传后由后端图片识别/OCR 分析，再把识别结果填入装箱单明细。
- 后端数据库最终采用 PostgreSQL。
- 前端部署到腾讯云服务器，通过 Nginx 对外访问。

当前公网访问地址：

```text
http://129.204.142.19/
```

本地开发地址：

```text
http://localhost:5173/
```

## 2. 仓库信息

仓库名称：

```text
godrich140/Godrich-HUB
```

仓库地址：

```text
https://github.com/godrich140/Godrich-HUB
```

Git remote：

```text
origin https://github.com/godrich140/Godrich-HUB.git
```

主分支：

```text
main
```

本机项目路径：

```text
C:\Users\gocri\Documents\New project
```

## 3. 项目目录结构

```text
New project/
  frontend/                 # React + TypeScript + Vite 前端
  backend/                  # FastAPI + PostgreSQL 后端
  docs/                     # 项目文档
  .gitignore
  README.md
```

前端核心目录：

```text
frontend/
  index.html
  package.json
  package-lock.json
  vite.config.ts
  tsconfig.json
  src/
    main.tsx                # React 入口
    App.tsx                 # 当前主要业务页面和交互逻辑
    styles.css              # 当前主要样式
```

后端核心目录：

```text
backend/
  requirements.txt
  .env.example
  README.md
  app/
    main.py                 # FastAPI app 入口
    config.py               # 环境变量配置
    database.py             # SQLAlchemy 连接和 Session
    models.py               # PostgreSQL ORM 模型
    schemas.py              # Pydantic 请求/响应模型
    services.py             # 文件上传、OCR 占位服务
    routers/
      customers.py          # 客户 API
      orders.py             # 装箱单 API
      files.py              # 文件上传 API
      ocr.py                # 图片识别 API
      stats.py              # 统计查询 API
  deploy/
    tencent-cloud.md        # 腾讯云部署建议
```

## 4. 技术架构

前端：

```text
React + TypeScript + Vite
```

前端当前为单页应用，页面包括：

- 工作台
- 历史单据
- 统计查询
- 客户通讯录

后端：

```text
FastAPI + SQLAlchemy 2 + PostgreSQL + psycopg
```

后端当前已实现基础 API 骨架：

- 客户资料
- 装箱单
- 明细
- 文件上传
- OCR 分析占位
- 统计查询

部署建议：

```text
Nginx
  /      -> frontend/dist
  /api   -> FastAPI backend

FastAPI
  -> PostgreSQL
  -> uploads 文件目录
  -> hermes/OCR 图片识别服务
```

## 5. 前端主要功能位置

主要业务代码：

```text
frontend/src/App.tsx
```

主要样式：

```text
frontend/src/styles.css
```

工作台页面组件：

```text
WorkbenchPage
```

装箱单明细表组件：

```text
PackingTable
```

图片列上传/预览组件：

```text
ImageCellInput
```

品名、产品描述历史联想组件：

```text
SuggestInput
```

客户选择弹窗：

```text
CustomerPicker
```

弹出明细录入窗口：

```text
ResizableDetailModal
```

统计查询页面：

```text
StatsPage
```

客户通讯录页面：

```text
ContactsPage
```

## 6. 前端已实现的重要交互

### 6.1 明细录入

明细字段按装箱单模板设计，包括：

```text
品名
产品描述
图片
数量
单位
单价
总价
数量/箱
箱数
毛重/箱
体积
总毛重
箱子规格
总体积
```

### 6.2 品名和产品描述历史联想

位置：

```text
frontend/src/App.tsx
SuggestInput
PackingTable
```

逻辑：

- `品名`、`产品描述` 输入框获得焦点时显示历史联想。
- 联想来源目前来自本地示例历史数据 `historySeed` 和当前录入 `rows`。
- 后续接后端后，应改为从历史装箱单或基础资料 API 获取。

### 6.3 图片列上传和预览

位置：

```text
frontend/src/App.tsx
ImageCellInput
```

当前能力：

- 图片列支持拖拽上传。
- 图片列支持点击选择本地图片。
- 选择后使用 `URL.createObjectURL(file)` 在前端即时预览。

注意：

- 当前图片预览是前端临时 blob URL。
- 后续接后端后，需要先调用 `/api/files/upload` 上传图片，再把返回的 `file_id` 保存到明细 `photo_file_id`。

### 6.4 照片识别状态显示

位置：

```text
frontend/src/App.tsx
ocrStatus
handleUploadOcr
WorkbenchPage
```

当前状态值：

```text
未上传
识别成功
识别失败
```

当前前端行为：

- 上传或拖拽手写照片后，前端模拟设置 `ocrStatus = "识别成功"`。
- 识别成功后模拟填充第一条明细的：

```text
品名
产品描述
数量
单位
```

重要约定：

- 照片识别成功后不写入图片列。
- 图片列只用于产品图片上传和预览。
- 手写照片识别结果应填入明细字段。

后续真实接入后，前端应显示：

```text
识别中
识别成功
识别失败
```

建议流程：

```text
用户上传手写照片
前端显示：识别中
POST /api/files/upload
POST /api/ocr/analyze
后端返回 ocr_job
前端读取 parsed_json.items
前端把 items 填入明细
前端显示：识别成功
如果接口报错，显示：识别失败
```

### 6.5 清空明细录入

位置：

```text
frontend/src/App.tsx
clearRows
WorkbenchPage
ResizableDetailModal
```

当前能力：

- 主界面“明细录入”操作区有 `清空明细录入` 按钮。
- 弹出明细录入窗口也有 `清空明细录入` 按钮。
- 点击后弹出确认框。
- 确认后清空明细，并保留 1 条空白明细行。

## 7. 后端数据库模型

后端 ORM 位置：

```text
backend/app/models.py
```

当前主要表：

```text
users
customers
packing_orders
packing_items
files
ocr_jobs
export_records
audit_logs
```

核心关系：

```text
customers 1 -> N packing_orders
packing_orders 1 -> N packing_items
packing_items.photo_file_id -> files.id
ocr_jobs.source_file_id -> files.id
```

重要字段：

```text
packing_orders.order_no
packing_orders.customer_id
packing_orders.customer_name
packing_orders.order_date
packing_orders.status
packing_orders.deposit
packing_orders.balance
packing_orders.bank_account
packing_orders.ocr_status

packing_items.item_name
packing_items.description
packing_items.photo_file_id
packing_items.quantity
packing_items.unit
packing_items.unit_price
packing_items.total_price
packing_items.qty_per_carton
packing_items.carton_count
packing_items.gross_weight_ctn
packing_items.cbm
packing_items.total_gross_weight
packing_items.measure_cm
packing_items.total_cbm
packing_items.merge_group_id
```

## 8. 后端 API

后端入口：

```text
backend/app/main.py
```

健康检查：

```text
GET /health
```

客户 API：

```text
GET  /api/customers
POST /api/customers
PUT  /api/customers/{customer_id}
```

装箱单 API：

```text
GET  /api/orders
POST /api/orders
GET  /api/orders/{order_id}
PUT  /api/orders/{order_id}
```

文件上传 API：

```text
POST /api/files/upload
```

表单字段：

```text
file      文件
biz_type  默认 packing_order
file_type 默认 photos
```

返回：

```json
{
  "id": "file uuid",
  "biz_type": "packing_order",
  "biz_id": null,
  "file_type": "photos",
  "original_name": "photo.jpg",
  "storage_path": "uploads/photos/xxx.jpg",
  "mime_type": "image/jpeg",
  "file_size": 12345,
  "created_at": "...",
  "updated_at": "..."
}
```

图片识别 API：

```text
POST /api/ocr/analyze
```

请求：

```json
{
  "file_id": "上传文件返回的 uuid",
  "order_id": "可选，当前装箱单 uuid"
}
```

当前后端返回的是占位识别结果：

```json
{
  "id": "ocr job uuid",
  "order_id": null,
  "source_file_id": "file uuid",
  "status": "succeeded",
  "raw_text": "OCR placeholder result. Replace this with hermes analysis output.",
  "parsed_json": {
    "items": [
      {
        "row_index": 1,
        "item_name": "OCR 识别品名",
        "description": "OCR 识别产品描述",
        "quantity": "1",
        "unit": "set"
      }
    ]
  },
  "error_message": null,
  "created_at": "...",
  "updated_at": "..."
}
```

统计 API：

```text
POST /api/stats/orders
```

请求：

```json
{
  "start_date": "2026-05-01",
  "end_date": "2026-05-31",
  "customer_ids": [],
  "item_name": "CAR MAT",
  "description": null
}
```

返回：

```json
{
  "detail_rows": [],
  "summary": {
    "detail_count": 0,
    "quantity_total": 0,
    "amount_total": 0,
    "carton_total": 0,
    "gross_weight_total": 0,
    "cbm_total": 0
  }
}
```

## 9. 图片识别 API 接入建议

当前后端 OCR 逻辑位置：

```text
backend/app/services.py
create_ocr_job
```

当前只是占位实现。后续接 hermes 或其他图片识别服务时，应替换这里：

```python
def create_ocr_job(db: Session, file_id: uuid.UUID, order_id: uuid.UUID | None = None) -> OcrJob:
    ...
```

建议真实流程：

```text
1. 前端上传手写照片到 /api/files/upload
2. 后端保存图片到 UPLOAD_ROOT/photos
3. 后端写 files 表
4. 前端拿 file_id 调用 /api/ocr/analyze
5. 后端读取 file_id 对应 storage_path
6. 后端调用 hermes 图片分析
7. hermes 返回原始文本或结构化数据
8. 后端把结果标准化为 parsed_json.items
9. 后端写 ocr_jobs 表
10. 前端读取 parsed_json.items 并填入明细
```

建议标准化输出字段：

```json
{
  "items": [
    {
      "row_index": 1,
      "item_name": "CAR MAT TPE BYD SHARK",
      "description": "black:200 grey:100",
      "quantity": "50",
      "unit": "set",
      "unit_price": "48.00",
      "total_price": "2400",
      "qty_per_carton": "10",
      "carton_count": "30",
      "gross_weight_ctn": "30",
      "cbm": "0.28",
      "total_gross_weight": "900.00",
      "measure_cm": "135*70*30",
      "total_cbm": "8.51"
    }
  ]
}
```

前端显示建议：

```text
上传前：未上传
上传后、接口未返回：识别中
接口成功且 parsed_json.items 有数据：识别成功
接口失败或 parsed_json 无法解析：识别失败
```

## 10. 部署信息

腾讯云服务器公网地址：

```text
129.204.142.19
```

建议服务器项目目录：

```text
/opt/packing-list
```

如果目录不存在，第一次部署：

```bash
sudo mkdir -p /opt/packing-list
sudo chown -R ubuntu:ubuntu /opt/packing-list
cd /opt
git clone https://github.com/godrich140/Godrich-HUB.git packing-list
cd /opt/packing-list
```

前端构建：

```bash
cd /opt/packing-list/frontend
npm install
npm run build
```

如果 Nginx root 指向 `/var/www/html`：

```bash
sudo rm -rf /var/www/html/*
sudo cp -r /opt/packing-list/frontend/dist/* /var/www/html/
sudo nginx -t
sudo systemctl reload nginx
```

如果 Nginx root 直接指向：

```text
/opt/packing-list/frontend/dist
```

则只需要：

```bash
cd /opt/packing-list
git pull origin main
cd frontend
npm install
npm run build
sudo nginx -t
sudo systemctl reload nginx
```

查看 Nginx 当前 root：

```bash
sudo nginx -T | grep -E "root|server_name"
```

## 11. 更新部署流程

本机开发后：

```powershell
cd "C:\Users\gocri\Documents\New project"
git status
git add .
git commit -m "your message"
git push origin main
```

服务器更新：

```bash
cd /opt/packing-list
git pull origin main
cd frontend
npm install
npm run build
sudo nginx -t
sudo systemctl reload nginx
```

如果 Nginx root 是 `/var/www/html`，额外执行：

```bash
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo nginx -t
sudo systemctl reload nginx
```

## 12. Git 注意事项

不要提交：

```text
frontend/node_modules/
frontend/dist/
frontend/tsconfig.tsbuildinfo
backend/.venv/
backend/.env
backend/uploads/
```

这些已写入根目录：

```text
.gitignore
```

说明：

- `frontend/dist` 应由服务器执行 `npm run build` 生成。
- `frontend/node_modules` 应由服务器执行 `npm install` 生成。
- `backend/.env` 包含数据库密码，不能提交。
- `backend/uploads` 是运行期上传文件，不能提交。

## 13. 当前已知状态

已完成：

- 前端 React + TypeScript + Vite 工程。
- 工作台、历史单据、统计查询、客户通讯录页面。
- 明细录入表格。
- 品名和产品描述历史联想。
- 图片列拖拽上传和预览。
- 手写照片识别入口和状态显示。
- 清空明细录入按钮。
- 后端 FastAPI + PostgreSQL 基础骨架。
- 客户、装箱单、文件上传、OCR 占位、统计 API。
- GitHub 仓库绑定和推送。

待完成：

- 前端正式对接后端 API。
- 后端接入真实 hermes 图片识别。
- Excel 模板导出接口。
- 用户登录和权限。
- 生产环境 PostgreSQL `.env` 配置。
- 腾讯云 Nginx root 最终确认。
- 远程站点部署验证。
