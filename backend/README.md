# 装箱单后端

后端采用 `FastAPI + PostgreSQL + SQLAlchemy`。

## 本地运行

```powershell
cd "C:\Users\gocri\Documents\New project\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

如果 PowerShell 禁止激活脚本，可使用：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## PostgreSQL 建库建议

```sql
CREATE DATABASE packing_db;
CREATE USER packing_user WITH PASSWORD 'change_me';
GRANT ALL PRIVILEGES ON DATABASE packing_db TO packing_user;
```

进入数据库后给 schema 权限：

```sql
GRANT ALL ON SCHEMA public TO packing_user;
```

## 初始化表

开发阶段启动服务时会自动 `create_all` 建表。生产环境后续建议接入 Alembic 管理迁移。

## API 入口

```text
GET  /health
GET  /api/customers
POST /api/customers
GET  /api/orders
POST /api/orders
GET  /api/orders/{order_id}
PUT  /api/orders/{order_id}
POST /api/files/upload
POST /api/ocr/analyze
POST /api/stats/orders
```

## 文件存储

上传文件默认保存到：

```text
backend/uploads/
```

PostgreSQL 只保存文件路径和元数据，不保存图片二进制。
