# 装箱单工作台前端

当前前端已改为 `React + TypeScript + Vite` 结构。

## 目录

```text
frontend/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    main.tsx
    App.tsx
    styles.css
```

## 已实现页面

- 工作台：装箱单主录入页，包含客户选择、照片识别状态、明细录入、合并选中行、弹出明细录入。
- 历史单据：按编号、日期、客户查询，并展示完整装箱单明细。
- 统计查询：按月份和产品查询统计信息。
- 客户通讯录：客户资料录入、查询、回填到主界面。

## 模板依据

`SOGO(10-12).xls` 中第 7-11 行存在箱规相关列纵向合并，因此工作台提供“合并选中行”能力。合并列包括：

```text
图片、数量/箱、箱数、毛重/箱、体积、总毛重、箱子规格、总体积
```

## 运行

需要安装 Node.js 与 npm：

```bash
npm install
npm run dev
```
