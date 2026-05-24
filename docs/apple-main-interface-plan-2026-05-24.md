# Apple 风格主界面方案

日期：2026-05-24

## 背景

本方案基于项目交接文件 `docs/next-phase-handoff-2026-05-24.md`、当前主界面代码 `frontend/src/App.tsx` / `frontend/src/styles.css`，以及已克隆参考仓库 `tools/better-design` 中的 Apple 设计系统。

参考来源：

- `tools/better-design/README.md`：该仓库提供 31 套 shadcn/ui 设计系统，Apple 的 slug 为 `apple`。
- `tools/better-design/components/apple/globals.css`：Apple 全局 token。
- `tools/better-design/components/apple/components/ui/button.tsx`：Apple 按钮样式。
- `tools/better-design/components/apple/components/ui/sidebar.tsx`：Apple 侧栏样式。
- `tools/better-design/components/apple/components/ui/table.tsx`：Apple 表格样式。
- `tools/better-design/components/apple/components/ui/stat-card.tsx`：Apple 指标卡样式。

## 设计目标

把当前深色蓝金后台界面调整为更接近 Apple 工作台的浅色、高密度、低噪音业务界面，同时保留装箱单录入的效率：

1. 主界面首屏仍然是装箱单工作台，不做营销页。
2. 表格录入是视觉重心，统计、客户、付款、照片识别只作为辅助区。
3. 视觉语言从“深色管理后台”转为“macOS/iPadOS 风格生产力工具”。
4. 控件更轻，信息层级更明确，减少大面积深色、金色渐变和强阴影。
5. 为后续接入保存、预览、生成 Excel 的真实接口预留清晰状态位。

## Apple 设计系统提炼

### Token

Apple 设计系统使用接近系统 UI 的浅色 token：

- 背景：近白浅灰 `oklch(0.9751 0.0022 286.36)`，可映射为 `#f5f5f7`。
- 前景文字：深灰黑 `oklch(0.2344 0.0035 286.13)`，可映射为 `#1d1d1f`。
- 卡片：纯白。
- 主色：Apple Blue，参考按钮注释为 `#0071e3`，hover 为 `#0077ed`。
- 边框：低对比灰，参考 `oklch(0.9079 0 0)`。
- 圆角：全局 `--radius: 1.125rem`，主按钮为极大胶囊圆角。
- 字体：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Helvetica", "Arial", sans-serif`。

### 组件行为

- Button：17px 常规字重，44px 默认高度，胶囊按钮，主按钮蓝底白字，次按钮浅灰底深色字。
- Sidebar：浅色背景、右边框、60/240px 两种宽度，激活态使用 `primary/10` 的浅蓝底。
- Table：轻量边线、12px 表头高度节奏、hover 用弱灰底，不使用强渐变表头。
- StatCard：白色卡片，20px 内边距，指标值 24px 半粗体，图标在浅灰 36px 方形容器内。

## 当前界面问题

当前 `frontend/src/styles.css` 已完成业务信息布局，但视觉上仍偏传统后台：

- 深色侧栏和蓝金渐变占比过高，和 Apple 浅色生产力工具差异较大。
- Summary 卡片有装饰性椭圆和较重阴影，信息密度可以更高。
- 顶部按钮含字符图标，后续应改用 lucide 图标。
- 表格表头和面板头使用渐变，Apple 方案应改为纯色、弱分隔线。
- 右侧照片识别、付款信息是卡片堆叠，但视觉权重与核心表格接近，需要降噪。

## 主界面布局方案

### 1. 整体 Shell

结构保持当前三层：

- 左侧导航：`sidebar`
- 顶部工具栏：`topbar`
- 主内容区：`summary + form + table + right inspector`

视觉调整：

- 页面背景改为 `#f5f5f7`。
- 左侧导航改为浅色毛玻璃/白色侧栏，宽度 232px，右侧 1px 灰边框。
- 主内容 padding 控制为 24px，宽屏不再使用大阴影堆叠。
- 所有业务面板统一白底、1px 边框、18px 圆角、轻阴影或无阴影。

建议 CSS token：

```css
:root {
  --app-bg: #f5f5f7;
  --app-surface: #ffffff;
  --app-surface-muted: #fbfbfd;
  --app-text: #1d1d1f;
  --app-muted: #6e6e73;
  --app-border: #d2d2d7;
  --app-border-soft: #e5e5ea;
  --app-blue: #0071e3;
  --app-blue-hover: #0077ed;
  --app-danger: #ff3b30;
  --app-radius: 18px;
  --app-control-radius: 980px;
  --app-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}
```

### 2. 侧栏

当前深蓝导航改为 macOS Finder 式浅色侧栏：

- 背景：`rgba(255,255,255,0.78)`，可加 `backdrop-filter: blur(18px)`。
- 品牌区：保留 `PL`，但改为浅灰圆角方块，不使用金色边框。
- 导航项：左图标 + 文案，36px 高，8px 圆角。
- 激活态：浅蓝底 `rgba(0,113,227,0.1)`，文字和图标为 `#0071e3`。
- 用户区：低调显示管理员，不使用深色头像渐变。

建议导航图标替换：

- 工作台：`LayoutDashboard`
- 历史单据：`Files`
- 统计查询：`ChartNoAxesCombined`
- 客户通讯录：`Contact`

### 3. 顶部工具栏

顶部从“页面标题 + 大按钮组”调整为 macOS toolbar：

- 左侧：主标题 `装箱单工作台`，下方一行弱文本显示当前客户、日期、草稿状态。
- 右侧：保存、预览、生成 Excel 三个动作。
- 主动作 `生成 Excel` 使用 Apple Blue 胶囊按钮。
- 次动作使用浅灰胶囊按钮。
- 按钮图标使用 lucide：`Save`、`Eye`、`FileSpreadsheet`。

状态建议：

- 未保存：标题旁显示灰色小圆点 + `未保存`
- 保存中：按钮 loading，禁用其他导出动作
- 已保存：绿色小圆点 + `已保存`
- 生成失败：红色 inline message，不弹全屏阻塞

### 4. 统计区

当前 5 张 Summary 卡改为更轻的 Apple StatCard：

- 高度 88px。
- 不使用装饰图形。
- 指标值 24px，标签 13px。
- 金额可保留业务强调，但不用金色大面积背景，使用深色文字或蓝色强调。
- 图标放在右上 36px 浅灰容器。

推荐指标顺序：

1. 客户
2. 明细行
3. 总数量
4. 总金额
5. 总箱数

### 5. 表单区

客户、日期、单号、状态保留为一行，但改成 Apple 表单控件：

- 输入框高度 40px。
- 圆角 10px 或 12px，不使用明显阴影。
- label 13px，颜色 `#6e6e73`。
- focus ring 使用浅蓝 `rgba(0,113,227,0.18)`。
- 状态字段建议改为 segmented control：草稿 / 已确认 / 已导出。

### 6. 明细表格

表格是核心，应优先做成高密度、可横向滚动的 Numbers/表格工具风格：

- 表头固定，背景 `#fbfbfd`，底部 1px 边框。
- 单元格高度 44px 到 52px。
- 单元格输入框默认无边框，focus 时显示蓝色内描边。
- 行 hover 为 `#f5f5f7`。
- 选中行左侧 checkbox 使用 Apple Blue。
- 合并相关列使用淡蓝左边线或小标识，不使用重背景。
- 表格工具按钮放在表格面板右上，统一 32/36px 小型胶囊按钮。

工具顺序建议：

1. 弹出录入
2. 合并选中行
3. 取消合并
4. 清空
5. 新增一行

其中 `新增一行` 为蓝色主按钮，其余为浅灰按钮。

### 7. 右侧 Inspector

右侧不再像普通卡片堆叠，而是做成 inspector 面板：

- 宽度 320px 到 340px。
- 每个分组只用标题、分隔线和控件，不加过重边框。
- 照片识别上传区改为浅灰虚线框，成功状态使用淡绿。
- 付款信息用 compact form，DEPOSIT / BALANCE 等金额字段右对齐。

建议分组：

- 照片识别
- 付款信息
- 单据备注（可后续补）

### 8. 弹窗

客户选择和明细弹窗继续保留，但视觉统一：

- 背景遮罩改为 `rgba(0,0,0,0.18)`。
- 弹窗圆角 20px。
- 头部高度 56px，底部分隔线。
- 大明细弹窗可保持 resize，但最小宽度需要兼容 1366 屏。

## 响应式方案

### 1366px

- 侧栏 220px。
- 主内容两列：表格区自适应，右侧 inspector 300px。
- Summary 保持 5 列，但卡片内文字使用 ellipsis。

### 1440px

- 标准目标视口。
- 侧栏 232px，右侧 inspector 320px。
- 表格面板横向滚动。

### 1920px

- 主内容最大宽度可不限制，表格获得更多横向空间。
- Summary 卡保持 5 列，不拉得过高。

### 移动端

- 侧栏变为顶部横向 tab。
- 顶部动作按钮折叠为 icon button 或更多菜单。
- 表单改为单列。
- 右侧 inspector 下移到表格下方。

## 实施顺序

### Phase 1：视觉 token 与基础控件

1. 在 `frontend/src/styles.css` 替换根 token。
2. 调整 body、workspace、panel、button、input、select、textarea。
3. 按 Apple 方案统一圆角、阴影、边框和 focus ring。

### Phase 2：导航与顶部工具栏

1. 将深色侧栏改为浅色侧栏。
2. 用 lucide 图标替换字符图标。
3. 调整顶部保存、预览、生成 Excel 按钮。

### Phase 3：表格与 Inspector

1. 优化 `PackingTable` 表头、行高、hover、focus。
2. 压低 Summary 和右侧面板视觉权重。
3. 调整上传区、付款字段和按钮尺寸。

### Phase 4：验证

1. 执行 `npm run build`。
2. 在 1366、1440、1920、移动端截图检查。
3. 检查长金额、长客户名、长品名不溢出。
4. 检查中文、英文、数字混排的表格可读性。

## 验收标准

- 主界面第一眼是浅色 Apple 生产力工具，而不是传统深色后台。
- 主按钮、次按钮、输入框、表格、卡片的视觉语言一致。
- 表格录入效率不降低，横向滚动、focus、hover、选中态清晰。
- 右侧照片识别和付款信息不抢核心表格权重。
- 1366px 宽度下顶部按钮不换行到不可控状态。
- 移动端无文字重叠、按钮文字溢出或面板嵌套卡片问题。

## 后续建议

Apple 视觉方案可以和交接文件里的 P1 功能并行推进。建议先完成本方案 Phase 1-3 的纯前端视觉改造，再接入 `POST /api/orders`、`GET /api/orders/{id}`、`POST /api/orders/{id}/export-excel`，这样保存、预览、生成 Excel 的真实状态能直接落在新的 toolbar 交互里。
