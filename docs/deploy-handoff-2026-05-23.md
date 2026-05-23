# 装箱单工作台交接说明

日期：2026-05-23
项目：装箱单工作台前端
本次目标：按浏览器回归报告修复移动端问题，准备上传仓库后更新服务器代码，并完成整体测试。

## 本次代码调整

- 修复 390px 移动宽度下页面级横向溢出问题。
- 调整小屏顶部导航布局：侧栏在 1080px 以下切换为顶部栏后，导航区域允许在自身范围内横向滚动，不再撑大 `body` 宽度。
- 相关文件：`frontend/src/styles.css`

## 测试结论

构建验证通过：

```bash
cd frontend
npm run build
```

整体 Playwright 回归通过：

- 工作台默认展示、基础信息、汇总卡片、明细表格、照片识别、付款信息：通过
- 明细编辑、新增行、合并选中行、取消合并、清空明细录入：通过
- OCR 模拟上传流程 `68% -> 100%`：通过
- 弹出录入弹窗：通过
- 历史单据筛选、预览切换、空状态：通过
- 统计查询筛选、客户全选/取消全选、空状态：通过
- 客户通讯录新增、搜索、回填、工作台选择客户：通过
- 响应式宽度 1440px、1024px、390px：通过

最新自动化报告：

```text
output/playwright/handoff-regression-report.json
```

截图证据：

```text
output/playwright/desktop-workbench.png
output/playwright/desktop-1440.png
output/playwright/tablet-1024.png
output/playwright/mobile-390.png
```

说明：本地 `5173` 端口被占用，本次测试服务由 Vite 自动切换到 `http://localhost:5174/`。

## 已知限制

- 当前无后端接口联调，数据为前端内存状态和种子数据。
- 刷新页面后新增客户、录入明细不会持久化。
- “保存草稿”“预览表格”“生成 Excel”“批量导出”等按钮目前仍是展示按钮，未接入真实业务逻辑。
- 当前版本点击“预览表格”“生成 Excel”无 UI 变化、无文件下载，按现有交接约束不作为缺陷；后续实现时应补充预览内容校验和 Excel 文件下载校验。
- 控制台存在 `favicon.ico` 404，不影响核心业务流程。

## 上传仓库前检查

建议上传前执行：

```bash
git status --short
git diff -- frontend/src/styles.css
cd frontend
npm run build
```

需要一并提交的交接/测试产物：

```text
docs/deploy-handoff-2026-05-23.md
output/playwright/handoff-regression-report.json
output/playwright/*.png
```

如果仓库不希望保留测试截图，可只提交 `docs/deploy-handoff-2026-05-23.md` 和源码变更，截图作为本地验收证据保留。

## 服务器更新步骤

服务器拉取代码后建议按以下顺序操作：

```bash
cd <server-project-dir>
git fetch --all
git pull
cd frontend
npm ci
npm run build
```

如果服务器通过静态文件部署：

```bash
# 将 frontend/dist 发布到当前 Web 服务静态目录
# 具体目录按服务器现有配置执行
```

如果服务器通过进程管理器提供前端预览服务：

```bash
# 按现有方式重启前端服务，例如 pm2/systemd/docker compose
# 重启后确认访问入口返回新构建版本
```

## 上线后整体测试

服务器更新完成后至少覆盖：

- 桌面宽度：打开工作台，验证页面浅色后台风格、导航、汇总、表格、照片识别和付款信息。
- 移动宽度约 390px：确认顶部导航可横向滚动，页面无整体横向溢出。
- 工作台：编辑明细、新增一行、合并/取消合并、清空明细录入、OCR 上传模拟流程。
- 历史单据：关键词、日期、状态筛选，预览随选中单据切换，空状态显示。
- 统计查询：日期、产品关键词、客户复选项，全选/取消全选和空状态。
- 客户通讯录：新增客户、搜索客户、点击回填，并在工作台客户选择弹窗中选择该客户。

