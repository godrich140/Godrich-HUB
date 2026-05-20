# 腾讯云部署建议

## 服务拓扑

```text
Nginx
  /      -> frontend/dist
  /api   -> http://127.0.0.1:8000

FastAPI
  -> PostgreSQL
  -> uploads/
  -> hermes/OCR service
```

## 推荐目录

```text
/opt/packing-list/
  backend/
  frontend/
  uploads/
  logs/
```

## PostgreSQL

建议独立创建业务账号，避免使用 postgres 超级用户运行应用。

```sql
CREATE DATABASE packing_db;
CREATE USER packing_user WITH PASSWORD 'replace_with_strong_password';
GRANT ALL PRIVILEGES ON DATABASE packing_db TO packing_user;
\c packing_db
GRANT ALL ON SCHEMA public TO packing_user;
```

`.env`：

```text
DATABASE_URL=postgresql+psycopg://packing_user:replace_with_strong_password@127.0.0.1:5432/packing_db
UPLOAD_ROOT=/opt/packing-list/uploads
CORS_ORIGINS=https://your-domain.com
```

## systemd

```ini
[Unit]
Description=Packing List FastAPI
After=network.target postgresql.service

[Service]
WorkingDirectory=/opt/packing-list/backend
EnvironmentFile=/opt/packing-list/backend/.env
ExecStart=/opt/packing-list/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/packing-list/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

## 备份

至少备份两类数据：

```text
PostgreSQL 数据库
uploads 图片和导出文件
```

数据库备份示例：

```bash
pg_dump -Fc packing_db > /backup/packing_db_$(date +%F).dump
```

文件备份示例：

```bash
rsync -a /opt/packing-list/uploads/ /backup/uploads/
```
