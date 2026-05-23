import { useMemo, useState, type ReactNode } from "react";

type PageKey = "workbench" | "history" | "stats" | "contacts";

type Customer = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
};

type PackingRow = {
  id: string;
  itemName: string;
  description: string;
  photo: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
  qtyPerCarton: string;
  cartonCount: string;
  grossWeightCtn: string;
  cbm: string;
  totalGrossWeight: string;
  measureCm: string;
  totalCbm: string;
  mergeGroupId?: string;
};

type PackingCellKey = Exclude<keyof PackingRow, "id" | "mergeGroupId">;

type OrderRecord = {
  id: string;
  date: string;
  customer: string;
  status: string;
  rows: PackingRow[];
};

type ApiImportItem = {
  file: {
    original_name: string;
    storage_path: string;
  };
  order: {
    order_no: string;
    customer_name: string;
    order_date: string;
    status: string;
    items: Array<{
      id: string;
      item_name: string | null;
      description: string | null;
      quantity: string | number | null;
      unit: string | null;
      unit_price: string | number | null;
      total_price: string | number | null;
      qty_per_carton: string | number | null;
      carton_count: string | number | null;
      gross_weight_ctn: string | number | null;
      cbm: string | number | null;
      total_gross_weight: string | number | null;
      measure_cm: string | null;
      total_cbm: string | number | null;
      merge_group_id: string | null;
    }>;
  };
};

const navigation: Array<{ key: PageKey; label: string; icon: string }> = [
  { key: "workbench", label: "工作台", icon: "▤" },
  { key: "history", label: "历史单据", icon: "▦" },
  { key: "stats", label: "统计查询", icon: "↥" },
  { key: "contacts", label: "客户通讯录", icon: "☷" }
];

const tableColumns: Array<{ key: PackingCellKey; label: string; className?: string; mergeable?: boolean; suggestible?: boolean }> = [
  { key: "itemName", label: "品名", className: "col-item", suggestible: true },
  { key: "description", label: "产品描述", className: "col-description", suggestible: true },
  { key: "photo", label: "图片", className: "col-photo", mergeable: true },
  { key: "quantity", label: "数量", className: "col-number" },
  { key: "unit", label: "单位", className: "col-unit" },
  { key: "unitPrice", label: "单价", className: "col-number" },
  { key: "totalPrice", label: "总价", className: "col-number" },
  { key: "qtyPerCarton", label: "数量/箱", className: "col-number", mergeable: true },
  { key: "cartonCount", label: "箱数", className: "col-number", mergeable: true },
  { key: "grossWeightCtn", label: "毛重/箱", className: "col-number", mergeable: true },
  { key: "cbm", label: "体积", className: "col-number", mergeable: true },
  { key: "totalGrossWeight", label: "总毛重", className: "col-number", mergeable: true },
  { key: "measureCm", label: "箱子规格", className: "col-measure", mergeable: true },
  { key: "totalCbm", label: "总体积", className: "col-number", mergeable: true }
];

const mergeColumns: PackingCellKey[] = ["photo", "qtyPerCarton", "cartonCount", "grossWeightCtn", "cbm", "totalGrossWeight", "measureCm", "totalCbm"];

const customersSeed: Customer[] = [
  {
    id: "C001",
    name: "SOGO AUTO",
    contact: "Mr. Ali",
    phone: "+971 50 000 0000",
    email: "sogo@example.com",
    address: "Dubai Auto Market"
  },
  {
    id: "C002",
    name: "广州客户 A",
    contact: "陈先生",
    phone: "13800000000",
    email: "buyer@example.cn",
    address: "广州市越秀区"
  }
];

const initialRows: PackingRow[] = [
  row("1", {
    itemName: "CAR MAT TPE BYD SHARK",
    quantity: "50",
    unit: "set",
    unitPrice: "48.00",
    totalPrice: "2400",
    qtyPerCarton: "10",
    cartonCount: "30",
    grossWeightCtn: "30",
    cbm: "0.28",
    totalGrossWeight: "900.00",
    measureCm: "135*70*30",
    totalCbm: "8.51",
    mergeGroupId: "M1"
  }),
  row("2", { itemName: "CAR MAT TPE JAC T9", quantity: "150", unit: "set", unitPrice: "48.00", totalPrice: "7200", mergeGroupId: "M1" }),
  row("3", { itemName: "CAR MAT TPE BYD ATTO3", quantity: "50", unit: "set", unitPrice: "48.00", totalPrice: "2400", mergeGroupId: "M1" }),
  row("4", { itemName: "CAR MAT TPE 2017-2023 HARRIER", quantity: "20", unit: "set", unitPrice: "48.00", totalPrice: "960", mergeGroupId: "M1" }),
  row("5", { itemName: "CAR MAT TPE RX450", quantity: "30", unit: "set", unitPrice: "48.00", totalPrice: "1440", mergeGroupId: "M1" }),
  row("6", {
    itemName: "CAR MAT 通用毛毯",
    description: "black:200 grey:100 beige:50",
    quantity: "350",
    unit: "set",
    unitPrice: "32.00",
    totalPrice: "11200",
    qtyPerCarton: "10",
    cartonCount: "35",
    grossWeightCtn: "31",
    cbm: "0.13",
    totalGrossWeight: "1085.00",
    measureCm: "75*56*30",
    totalCbm: "4.41"
  })
];

const historySeed: OrderRecord[] = [
  { id: "PK20251012-001", date: "2025-10-12", customer: "SOGO AUTO", status: "已生成", rows: initialRows },
  {
    id: "PK20260518-002",
    date: "2026-05-18",
    customer: "广州客户 A",
    status: "草稿",
    rows: [row("h1", { itemName: "SEAT COVER", quantity: "80", unit: "set", unitPrice: "65", totalPrice: "5200", cartonCount: "8" })]
  }
];

function row(id: string, values: Partial<PackingRow> = {}): PackingRow {
  return {
    id,
    itemName: "",
    description: "",
    photo: "",
    quantity: "",
    unit: "",
    unitPrice: "",
    totalPrice: "",
    qtyPerCarton: "",
    cartonCount: "",
    grossWeightCtn: "",
    cbm: "",
    totalGrossWeight: "",
    measureCm: "",
    totalCbm: "",
    ...values
  };
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniqueValues(rows: PackingRow[], key: "itemName" | "description"): string[] {
  return Array.from(new Set(rows.map((item) => item[key].trim()).filter(Boolean)));
}

function apiValue(value: string | number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function isSuggestKey(key: PackingCellKey): key is "itemName" | "description" {
  return key === "itemName" || key === "description";
}

function mapImportedOrder(item: ApiImportItem): OrderRecord {
  return {
    id: item.order.order_no,
    date: item.order.order_date,
    customer: item.order.customer_name,
    status: item.order.status === "draft" ? "草稿" : item.order.status,
    rows: item.order.items.map((detail) =>
      row(detail.id, {
        itemName: apiValue(detail.item_name),
        description: apiValue(detail.description),
        quantity: apiValue(detail.quantity),
        unit: apiValue(detail.unit),
        unitPrice: apiValue(detail.unit_price),
        totalPrice: apiValue(detail.total_price),
        qtyPerCarton: apiValue(detail.qty_per_carton),
        cartonCount: apiValue(detail.carton_count),
        grossWeightCtn: apiValue(detail.gross_weight_ctn),
        cbm: apiValue(detail.cbm),
        totalGrossWeight: apiValue(detail.total_gross_weight),
        measureCm: apiValue(detail.measure_cm),
        totalCbm: apiValue(detail.total_cbm),
        mergeGroupId: detail.merge_group_id || undefined
      })
    )
  };
}

export function App() {
  const [page, setPage] = useState<PageKey>("workbench");
  const [customers, setCustomers] = useState(customersSeed);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [rows, setRows] = useState(initialRows);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [ocrStatus, setOcrStatus] = useState("未识别");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const totals = useMemo(
    () => ({
      quantity: rows.reduce((sum, item) => sum + toNumber(item.quantity), 0),
      amount: rows.reduce((sum, item) => sum + toNumber(item.totalPrice), 0),
      cartons: rows.reduce((sum, item) => sum + toNumber(item.cartonCount), 0)
    }),
    [rows]
  );

  const suggestions = useMemo(
    () => ({
      itemName: uniqueValues([...historySeed.flatMap((record) => record.rows), ...rows], "itemName"),
      description: uniqueValues([...historySeed.flatMap((record) => record.rows), ...rows], "description")
    }),
    [rows]
  );

  function updateRow(rowId: string, key: PackingCellKey, value: string) {
    setRows((current) => current.map((item) => (item.id === rowId ? { ...item, [key]: value } : item)));
  }

  function addRow() {
    setRows((current) => [...current, row(String(Date.now()))]);
  }

  function clearRows() {
    if (!window.confirm("确定要清空当前明细录入吗？")) return;
    setRows([row(String(Date.now()))]);
    setSelectedRows([]);
  }

  function toggleSelectedRow(rowId: string) {
    setSelectedRows((current) => (current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId]));
  }

  function mergeSelectedRows() {
    if (selectedRows.length < 2) return;
    const selectedIndexes = selectedRows.map((id) => rows.findIndex((item) => item.id === id)).sort((a, b) => a - b);
    const isContiguous = selectedIndexes.every((index, offset) => offset === 0 || index === selectedIndexes[offset - 1] + 1);
    if (!isContiguous) return;

    const groupId = `M${Date.now()}`;
    const firstRow = rows[selectedIndexes[0]];
    setRows((current) =>
      current.map((item) => {
        if (!selectedRows.includes(item.id)) return item;
        const mergedItem = { ...item, mergeGroupId: groupId };
        if (item.id === firstRow.id) return mergedItem;
        mergeColumns.forEach((key) => {
          mergedItem[key] = "";
        });
        return mergedItem;
      })
    );
    setSelectedRows([]);
  }

  function unmergeSelectedRows() {
    setRows((current) => current.map((item) => (selectedRows.includes(item.id) ? { ...item, mergeGroupId: undefined } : item)));
    setSelectedRows([]);
  }

  function saveCustomer(customer: Customer) {
    setCustomers((current) => [customer, ...current.filter((item) => item.id !== customer.id)]);
    setSelectedCustomer(customer.name);
    setCustomerModalOpen(false);
  }

  function handleUploadOcr() {
    setOcrStatus("识别中");
    setOcrProgress(68);
    window.setTimeout(() => {
      setOcrStatus("识别成功");
      setOcrProgress(100);
    }, 700);
    setRows((current) => {
      const target = current[0] ?? row(String(Date.now()));
      const nextRows = current.length ? [...current] : [target];
      nextRows[0] = {
        ...target,
        itemName: target.itemName || "OCR 识别品名",
        description: target.description || "OCR 识别产品描述",
        quantity: target.quantity || "1",
        unit: target.unit || "set"
      };
      return nextRows;
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">PL</div>
          <div>
            <strong>装箱单系统</strong>
            <span>Packing List System</span>
          </div>
        </div>
        <nav className="nav-list">
          {navigation.map((item) => (
            <button key={item.key} className={page === item.key ? "nav-item active" : "nav-item"} onClick={() => setPage(item.key)} type="button">
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <span>PL</span>
          <div>
            <strong>管理员</strong>
            <small>Administrator</small>
          </div>
          <b>⌄</b>
        </div>
      </aside>

      <main className="workspace">
        {page === "workbench" && (
          <WorkbenchPage
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            rows={rows}
            selectedRows={selectedRows}
            totals={totals}
            ocrStatus={ocrStatus}
            ocrProgress={ocrProgress}
            onAddRow={addRow}
            onUpdateRow={updateRow}
            onToggleRow={toggleSelectedRow}
            onMergeRows={mergeSelectedRows}
            onUnmergeRows={unmergeSelectedRows}
            onUploadOcr={handleUploadOcr}
            onClearRows={clearRows}
            suggestions={suggestions}
            onOpenCustomerModal={() => setCustomerModalOpen(true)}
            onOpenDetailModal={() => setDetailModalOpen(true)}
          />
        )}
        {page === "history" && <HistoryPage records={historySeed} />}
        {page === "stats" && <StatsPage records={historySeed} customers={customers} />}
        {page === "contacts" && <ContactsPage customers={customers} onSaveCustomer={saveCustomer} />}
      </main>

      {customerModalOpen && <CustomerPicker customers={customers} onClose={() => setCustomerModalOpen(false)} onSelect={setSelectedCustomer} onSaveCustomer={saveCustomer} />}
      {detailModalOpen && (
        <ResizableDetailModal
          rows={rows}
          suggestions={suggestions}
          onClose={() => setDetailModalOpen(false)}
          onUpdateRow={updateRow}
          onAddRow={addRow}
          onClearRows={clearRows}
        />
      )}
    </div>
  );
}

function WorkbenchPage(props: {
  customers: Customer[];
  selectedCustomer: string;
  setSelectedCustomer: (value: string) => void;
  rows: PackingRow[];
  selectedRows: string[];
  totals: { quantity: number; amount: number; cartons: number };
  ocrStatus: string;
  ocrProgress: number;
  onAddRow: () => void;
  onUpdateRow: (rowId: string, key: PackingCellKey, value: string) => void;
  onToggleRow: (rowId: string) => void;
  onMergeRows: () => void;
  onUnmergeRows: () => void;
  onUploadOcr: () => void;
  onClearRows: () => void;
  suggestions: Record<"itemName" | "description", string[]>;
  onOpenCustomerModal: () => void;
  onOpenDetailModal: () => void;
}) {
  return (
    <>
      <PageHeader title="装箱单工作台" subtitle="高效创建与管理装箱单">
        <button className="secondary-button icon-button" type="button"><span>□</span>保存草稿</button>
        <button className="secondary-button icon-button" type="button"><span>▣</span>预览表格</button>
        <button className="primary-button icon-button" type="button"><span>◎</span>生成 Excel</button>
      </PageHeader>

      <section className="summary-strip">
        <Summary icon="☷" label="客户" value={props.selectedCustomer || "未选择"} />
        <Summary icon="♙" label="明细行" value={String(props.rows.length)} />
        <Summary icon="□" label="总数量" value={String(props.totals.quantity)} />
        <Summary icon="￥" label="总金额" value={`￥${props.totals.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} emphasis />
        <Summary icon="▤" label="总箱数" value={String(props.totals.cartons)} />
      </section>

      <section className="form-band">
        <label className="field customer-field">
          客户 Customer
          <div className="input-with-button">
            <input value={props.selectedCustomer} onChange={(event) => props.setSelectedCustomer(event.target.value)} placeholder="请选择或输入客户" />
            <button className="secondary-button" type="button" onClick={props.onOpenCustomerModal}>选择</button>
          </div>
        </label>
        <label className="field">
          日期 Date
          <input type="date" defaultValue="2025-10-12" />
        </label>
        <label className="field">
          单号
          <input placeholder="系统自动生成或手动录入" />
        </label>
        <label className="field">
          状态
          <select defaultValue="草稿">
            <option>草稿</option>
            <option>已确认</option>
            <option>已导出</option>
          </select>
        </label>
      </section>

      <section className="content-grid">
        <div className="table-panel">
          <div className="panel-head">
            <div>
              <h2><span className="section-marker" />明细录入</h2>
              <p>支持按 SOGO 模板合并箱规相关列；总价、总毛重、总体积改为人工确认录入。</p>
            </div>
            <div className="panel-actions">
              <button className="warm-button" type="button" onClick={props.onOpenDetailModal}>弹出录入</button>
              <button className="secondary-button" type="button" onClick={props.onMergeRows}>合并选中行</button>
              <button className="ghost-button" type="button" onClick={props.onUnmergeRows}>取消合并</button>
              <button className="danger-button" type="button" onClick={props.onClearRows}>清空明细录入</button>
              <button className="primary-button add-row-button" type="button" onClick={props.onAddRow}>＋ 新增一行</button>
            </div>
          </div>
          <PackingTable rows={props.rows} selectedRows={props.selectedRows} suggestions={props.suggestions} onUpdateRow={props.onUpdateRow} onToggleRow={props.onToggleRow} />
        </div>

        <aside className="side-panel">
          <section className="panel-section">
            <div className="side-title">
              <h2>照片识别</h2>
              <button className="translate-button" type="button">译</button>
            </div>
            <div
              className={props.ocrStatus === "识别成功" ? "drag-upload success" : "drag-upload"}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                props.onUploadOcr();
              }}
            >
              <strong>☁</strong>
              <span>拖拽或点击上传手写照片<br />支持 JPG / PNG / WebP</span>
            </div>
            <div className="ocr-progress" aria-label="照片识别进度">
              <div className="progress-row">
                <span>{props.ocrStatus}</span>
                <strong>{props.ocrProgress}%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${props.ocrProgress}%` }} />
              </div>
            </div>
            <label className="upload-control">
              <input type="file" accept="image/*" onChange={props.onUploadOcr} />
              ↑ 上传手写照片
            </label>
          </section>

          <section className="panel-section">
            <h2>付款信息</h2>
            <label className="field compact">DEPOSIT 订金<input type="number" min="0" step="0.01" placeholder="0.00" /></label>
            <label className="field compact">BLANCE 余额<input type="number" min="0" step="0.01" placeholder="0.00" /></label>
            <label className="field compact">银行账号<input placeholder="请输入银行账号（可选）" /></label>
          </section>
        </aside>
      </section>
    </>
  );
}

function PackingTable(props: {
  rows: PackingRow[];
  selectedRows: string[];
  suggestions?: Record<"itemName" | "description", string[]>;
  onUpdateRow: (rowId: string, key: PackingCellKey, value: string) => void;
  onToggleRow: (rowId: string) => void;
}) {
  const groupRowSpan = (index: number, groupId?: string) => {
    if (!groupId) return 1;
    const firstIndex = props.rows.findIndex((item) => item.mergeGroupId === groupId);
    if (firstIndex !== index) return 0;
    return props.rows.filter((item) => item.mergeGroupId === groupId).length;
  };

  return (
    <div className="desktop-table-wrap">
      <table className="packing-table">
        <thead>
          <tr>
            <th className="select-col">选</th>
            {tableColumns.map((column) => (
              <th key={column.key} className={column.className}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((item, index) => (
            <tr key={item.id}>
              <td className="select-col">
                <input checked={props.selectedRows.includes(item.id)} type="checkbox" onChange={() => props.onToggleRow(item.id)} />
              </td>
              {tableColumns.map((column) => {
                const span = column.mergeable ? groupRowSpan(index, item.mergeGroupId) : 1;
                if (column.mergeable && span === 0) return null;
                return (
                  <td key={column.key} rowSpan={span} className={column.className}>
                    {column.key === "photo" ? (
                      <ImageCellInput value={item.photo} onChange={(value) => props.onUpdateRow(item.id, "photo", value)} />
                    ) : column.suggestible && props.suggestions && isSuggestKey(column.key) ? (
                      <SuggestInput value={item[column.key]} suggestions={props.suggestions[column.key]} placeholder={column.label} onChange={(value) => props.onUpdateRow(item.id, column.key, value)} />
                    ) : (
                      <input value={item[column.key]} placeholder={column.label} onChange={(event) => props.onUpdateRow(item.id, column.key, event.target.value)} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryPage({ records }: { records: OrderRecord[] }) {
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("全部");
  const [importMessage, setImportMessage] = useState("请选择 .xls 或 .xlsx 文件，系统会保存到服务器并生成待核对草稿单。");
  const [importedRecords, setImportedRecords] = useState<OrderRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeId, setActiveId] = useState(records[0]?.id ?? "");
  const allRecords = [...importedRecords, ...records];
  const filtered = allRecords.filter((record) => {
    const matchKeyword = !keyword || `${record.id}${record.customer}`.toLowerCase().includes(keyword.toLowerCase());
    const matchDate = !date || record.date === date;
    const matchStatus = status === "全部" || record.status === status;
    return matchKeyword && matchDate && matchStatus;
  });
  const activeRecord = filtered.find((record) => record.id === activeId) ?? filtered[0];
  const totalRows = filtered.reduce((sum, record) => sum + record.rows.length, 0);
  const totalAmount = filtered.reduce((sum, record) => sum + record.rows.reduce((rowSum, item) => rowSum + toNumber(item.totalPrice), 0), 0);
  const totalCartons = filtered.reduce((sum, record) => sum + record.rows.reduce((rowSum, item) => rowSum + toNumber(item.cartonCount), 0), 0);
  const importedRows = importedRecords.reduce((sum, record) => sum + record.rows.length, 0);

  async function handleExcelImport(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const excelFiles = files.filter((file) => /\.(xlsx|xls)$/i.test(file.name));
    if (excelFiles.length === 0) {
      setImportMessage("未识别到 .xls 或 .xlsx 文件，请重新选择。");
      return;
    }

    setIsImporting(true);
    setImportMessage("正在上传 Excel 到服务器...");
    try {
      const formData = new FormData();
      excelFiles.forEach((file) => formData.append("files", file));
      const response = await fetch("/api/excel/import-history", { method: "POST", body: formData });
      if (!response.ok) throw new Error(await response.text());
      const payload = (await response.json()) as { imported: ApiImportItem[] };
      const nextRecords = payload.imported.map(mapImportedOrder);
      setImportedRecords((current) => [...nextRecords, ...current]);
      setActiveId(nextRecords[0]?.id ?? activeId);
      setKeyword("");
      setDate("");
      setStatus("全部");
      setImportMessage(`服务器已保存 ${payload.imported.length} 个 Excel 文件，并生成 ${nextRecords.length} 张待核对草稿单。`);
    } catch (error) {
      setImportMessage(`Excel 导入失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
    } finally {
      setIsImporting(false);
    }
  }

  async function handleBatchExport() {
    if (filtered.length === 0) return;
    setIsExporting(true);
    try {
      const response = await fetch("/api/excel/export-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: filtered })
      });
      if (!response.ok) throw new Error(await response.text());
      const payload = (await response.json()) as { download_url: string };
      window.location.href = payload.download_url;
    } catch (error) {
      setImportMessage(`批量导出失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <PageHeader title="历史装箱单" subtitle="导入、查询并批量导出历史单据">
        <label className={isImporting ? "secondary-button file-action disabled" : "secondary-button file-action"}>
          {isImporting ? "导入中..." : "批量导入 Excel"}
          <input disabled={isImporting} type="file" accept=".xls,.xlsx" multiple onChange={(event) => handleExcelImport(event.target.files)} />
        </label>
        <button className="secondary-button" type="button" onClick={handleBatchExport} disabled={filtered.length === 0 || isExporting}>
          {isExporting ? "导出中..." : "批量导出"}
        </button>
        <button className="primary-button" type="button">新建装箱单</button>
      </PageHeader>

      <section className="import-panel">
        <div>
          <strong>Excel 批量导入</strong>
          <span>{importMessage}</span>
        </div>
        <div>
          <strong>{importedRecords.length}</strong>
          <span>导入单据</span>
        </div>
        <div>
          <strong>{importedRows}</strong>
          <span>导入明细</span>
        </div>
      </section>

      <section className="history-overview">
        <Summary icon="▦" label="匹配单据" value={String(filtered.length)} />
        <Summary icon="♙" label="明细行" value={String(totalRows)} />
        <Summary icon="$" label="总金额" value={`$${totalAmount.toFixed(2)}`} />
        <Summary icon="▤" label="总箱数" value={String(totalCartons)} />
      </section>

      <section className="query-band history-query">
        <label className="field">单据 / 客户<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="输入单据编号或客户名称" /></label>
        <label className="field">日期<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label className="field">状态<select value={status} onChange={(event) => setStatus(event.target.value)}><option>全部</option><option>草稿</option><option>已生成</option><option>已导出</option></select></label>
      </section>

      <section className="history-layout">
        <div className="record-list history-list">
          {filtered.map((record) => {
            const amount = record.rows.reduce((sum, item) => sum + toNumber(item.totalPrice), 0);
            const cartons = record.rows.reduce((sum, item) => sum + toNumber(item.cartonCount), 0);
            return (
              <button className={activeRecord?.id === record.id ? "record-card history-card active" : "record-card history-card"} key={record.id} onClick={() => setActiveId(record.id)} type="button">
                <div className="record-head">
                  <strong>{record.id}</strong>
                  <span className="status-pill">{record.status}</span>
                </div>
                <div className="history-meta">
                  <span>{record.date}</span>
                  <span>{record.customer}</span>
                </div>
                <div className="history-numbers">
                  <span>{record.rows.length} 行</span>
                  <span>{cartons} CTNS</span>
                  <strong>${amount.toFixed(2)}</strong>
                </div>
              </button>
            );
          })}
        </div>

        {activeRecord ? (
          <section className="table-panel history-preview">
            <div className="panel-head">
              <div>
                <h2>{activeRecord.id}</h2>
                <p>{activeRecord.customer} / {activeRecord.date}</p>
              </div>
              <div className="panel-actions">
                <button className="secondary-button" type="button">预览</button>
                <button className="primary-button" type="button">生成 Excel</button>
              </div>
            </div>
            <PackingTable rows={activeRecord.rows} selectedRows={[]} onUpdateRow={() => undefined} onToggleRow={() => undefined} />
          </section>
        ) : (
          <section className="empty-hint">暂无匹配的历史装箱单。</section>
        )}
      </section>
    </>
  );
}

function ImageCellInput(props: { value: string; onChange: (value: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputId = useMemo(() => `image-${Math.random().toString(36).slice(2)}`, []);

  function useFile(file?: File) {
    if (!file) return;
    props.onChange(URL.createObjectURL(file));
  }

  const hasPreview = props.value.startsWith("blob:") || props.value.startsWith("data:") || /^https?:\/\//.test(props.value);

  return (
    <div
      className={dragging ? "image-cell dragging" : "image-cell"}
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        useFile(event.dataTransfer.files[0]);
      }}
    >
      <label htmlFor={inputId}>
        {hasPreview ? <img alt="产品图片预览" src={props.value} /> : <span>{props.value || "拖拽/选择"}</span>}
      </label>
      <input id={inputId} type="file" accept="image/*" onChange={(event) => useFile(event.target.files?.[0])} />
    </div>
  );
}

function SuggestInput(props: { value: string; placeholder: string; suggestions: string[]; onChange: (value: string) => void }) {
  const [focused, setFocused] = useState(false);
  const normalized = props.value.trim().toLowerCase();
  const options = props.suggestions.filter((item) => !normalized || item.toLowerCase().includes(normalized)).filter((item) => item !== props.value).slice(0, 8);

  return (
    <div className="suggest-input">
      <input value={props.value} onBlur={() => window.setTimeout(() => setFocused(false), 120)} onChange={(event) => props.onChange(event.target.value)} onFocus={() => setFocused(true)} placeholder={props.placeholder} />
      {focused && options.length > 0 && (
        <div className="suggest-list">
          {options.map((item) => (
            <button key={item} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => props.onChange(item)}>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsPage({ records, customers }: { records: OrderRecord[]; customers: Customer[] }) {
  const [product, setProduct] = useState("");
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2026-05-31");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>(customers.map((item) => item.name));
  const allSelected = selectedCustomers.length === customers.length;
  const rows = records.flatMap((record) => record.rows.map((item) => ({ ...item, date: record.date, customer: record.customer })));
  const filtered = rows.filter((item) => {
    const matchDate = item.date >= startDate && item.date <= endDate;
    const matchProduct = !product || item.itemName.toLowerCase().includes(product.toLowerCase());
    const matchCustomer = selectedCustomers.length === 0 || selectedCustomers.includes(item.customer);
    return matchDate && matchProduct && matchCustomer;
  });
  const quantity = filtered.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  const amount = filtered.reduce((sum, item) => sum + toNumber(item.totalPrice), 0);
  const cartons = filtered.reduce((sum, item) => sum + toNumber(item.cartonCount), 0);

  function toggleCustomer(customerName: string) {
    setSelectedCustomers((current) => (current.includes(customerName) ? current.filter((item) => item !== customerName) : [...current, customerName]));
  }

  function toggleAllCustomers() {
    setSelectedCustomers(allSelected ? [] : customers.map((item) => item.name));
  }

  return (
    <>
      <PageHeader title="统计查询" subtitle="按客户、日期和产品快速核对历史明细">
        <button className="primary-button" type="button">统计</button>
      </PageHeader>
      <section className="query-band stats-query">
        <label className="field">起始日期<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label className="field">终止日期<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
        <label className="field">产品<input value={product} onChange={(event) => setProduct(event.target.value)} placeholder="例如 CAR MAT" /></label>
        <div className="field customer-checks">
          客户
          <div className="check-grid">
            <label className="check-item check-all"><input checked={allSelected} type="checkbox" onChange={toggleAllCustomers} />全部</label>
            {customers.map((customer) => (
              <label key={customer.id} className="check-item"><input checked={selectedCustomers.includes(customer.name)} type="checkbox" onChange={() => toggleCustomer(customer.name)} />{customer.name}</label>
            ))}
          </div>
        </div>
      </section>
      {selectedCustomers.length === 0 ? (
        <section className="empty-hint">请选择至少一个客户后列出查询明细。</section>
      ) : (
        <>
          <section className="table-panel simple stats-detail">
            <div className="panel-head">
              <h2>查询明细</h2>
              <span className="muted-text">{filtered.length} 条匹配记录</span>
            </div>
            <PackingTable rows={filtered} selectedRows={[]} onUpdateRow={() => undefined} onToggleRow={() => undefined} />
          </section>
          <section className="summary-strip">
            <Summary icon="▦" label="匹配明细" value={String(filtered.length)} />
            <Summary icon="□" label="产品总数量" value={String(quantity)} />
            <Summary icon="$" label="产品总价" value={`￥${amount.toFixed(2)}`} />
            <Summary icon="▤" label="总箱数" value={String(cartons)} />
            <Summary icon="￥" label="区间总货款" value={`￥${amount.toFixed(2)}`} emphasis />
          </section>
        </>
      )}
    </>
  );
}

function ContactsPage({ customers, onSaveCustomer }: { customers: Customer[]; onSaveCustomer: (customer: Customer) => void }) {
  const [keyword, setKeyword] = useState("");
  const [draft, setDraft] = useState<Customer>({ id: "", name: "", contact: "", phone: "", email: "", address: "" });
  const filtered = customers.filter((item) => `${item.name}${item.contact}${item.phone}`.toLowerCase().includes(keyword.toLowerCase()));

  function submit() {
    if (!draft.name.trim()) return;
    onSaveCustomer({ ...draft, id: draft.id || `C${Date.now()}` });
    setDraft({ id: "", name: "", contact: "", phone: "", email: "", address: "" });
  }

  return (
    <>
      <PageHeader title="客户通讯录" subtitle="维护客户联系人、电话和收货信息">
        <button className="primary-button" type="button" onClick={submit}>保存客户</button>
      </PageHeader>
      <section className="contact-layout">
        <div className="form-panel">
          <h2>客户资料录入</h2>
          <label className="field">客户名称<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
          <label className="field">联系人<input value={draft.contact} onChange={(event) => setDraft({ ...draft, contact: event.target.value })} /></label>
          <label className="field">电话<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label>
          <label className="field">邮箱<input value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
          <label className="field">地址<textarea rows={4} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label>
        </div>
        <div className="form-panel">
          <h2>客户查询</h2>
          <label className="field">关键字<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="客户、联系人、电话" /></label>
          <div className="customer-list">
            {filtered.map((item) => (
              <button key={item.id} type="button" onClick={() => setDraft(item)}>
                <strong>{item.name}</strong>
                <span>{item.contact} / {item.phone}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CustomerPicker(props: { customers: Customer[]; onClose: () => void; onSelect: (name: string) => void; onSaveCustomer: (customer: Customer) => void }) {
  const [draft, setDraft] = useState<Customer>({ id: "", name: "", contact: "", phone: "", email: "", address: "" });

  function save() {
    if (!draft.name.trim()) return;
    props.onSaveCustomer({ ...draft, id: `C${Date.now()}` });
  }

  return (
    <div className="modal-backdrop">
      <section className="modal customer-modal">
        <div className="modal-head">
          <h2>选择或录入客户</h2>
          <button className="ghost-button" type="button" onClick={props.onClose}>关闭</button>
        </div>
        <div className="customer-picker-grid">
          <div className="customer-list">
            {props.customers.map((item) => (
              <button key={item.id} type="button" onClick={() => { props.onSelect(item.name); props.onClose(); }}>
                <strong>{item.name}</strong>
                <span>{item.contact} / {item.phone}</span>
              </button>
            ))}
          </div>
          <div className="form-panel embedded">
            <label className="field">客户名称<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label className="field">联系人<input value={draft.contact} onChange={(event) => setDraft({ ...draft, contact: event.target.value })} /></label>
            <label className="field">电话<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label>
            <label className="field">地址<textarea rows={3} value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} /></label>
            <button className="primary-button" type="button" onClick={save}>保存并选择</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResizableDetailModal(props: {
  rows: PackingRow[];
  suggestions: Record<"itemName" | "description", string[]>;
  onClose: () => void;
  onUpdateRow: (rowId: string, key: PackingCellKey, value: string) => void;
  onAddRow: () => void;
  onClearRows: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <section className="modal resizable-modal">
        <div className="modal-head">
          <h2>弹出明细录入</h2>
          <div className="panel-actions">
            <button className="primary-button" type="button" onClick={props.onAddRow}>新增一行</button>
            <button className="danger-button" type="button" onClick={props.onClearRows}>清空明细录入</button>
            <button className="ghost-button" type="button" onClick={props.onClose}>关闭</button>
          </div>
        </div>
        <PackingTable rows={props.rows} selectedRows={[]} suggestions={props.suggestions} onUpdateRow={props.onUpdateRow} onToggleRow={() => undefined} />
      </section>
    </div>
  );
}

function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="top-actions">{children}</div>
    </header>
  );
}

function Summary({ icon, label, value, emphasis }: { icon: string; label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="summary-card">
      <span className="summary-icon">{icon}</span>
      <p>{label}</p>
      <strong className={emphasis ? "money" : undefined}>{value}</strong>
    </div>
  );
}
