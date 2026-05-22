import { useMemo, useState } from "react";

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

const navigation: Array<{ key: PageKey; label: string }> = [
  { key: "workbench", label: "工作台" },
  { key: "history", label: "历史单据" },
  { key: "stats", label: "统计查询" },
  { key: "contacts", label: "客户通讯录" }
];

const mergeColumns: PackingCellKey[] = [
  "photo",
  "qtyPerCarton",
  "cartonCount",
  "grossWeightCtn",
  "cbm",
  "totalGrossWeight",
  "measureCm",
  "totalCbm"
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
    rows: [row("h1", { itemName: "SEAT COVER", quantity: "80", unit: "set", unitPrice: "65", totalPrice: "5200" })]
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

export function App() {
  const [page, setPage] = useState<PageKey>("workbench");
  const [customers, setCustomers] = useState(customersSeed);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [rows, setRows] = useState(initialRows);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [ocrStatus, setOcrStatus] = useState<"未上传" | "识别成功" | "识别失败">("未上传");
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
    setOcrStatus("识别成功");
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
            <span>Packing List</span>
          </div>
        </div>
        <nav className="nav-list">
          {navigation.map((item) => (
            <button key={item.key} className={page === item.key ? "nav-item active" : "nav-item"} onClick={() => setPage(item.key)} type="button">
              {item.label}
            </button>
          ))}
        </nav>
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
      <PageHeader title="装箱单工作台">
        <button className="ghost-button" type="button">保存草稿</button>
        <button className="secondary-button" type="button">预览表格</button>
        <button className="primary-button" type="button">生成 Excel</button>
      </PageHeader>

      <section className="summary-strip">
        <Summary label="客户" value={props.selectedCustomer || "未选择"} />
        <Summary label="明细行" value={String(props.rows.length)} />
        <Summary label="总数量" value={String(props.totals.quantity)} />
        <Summary label="总金额" value={`¥${props.totals.amount.toFixed(2)}`} />
        <Summary label="总箱数" value={String(props.totals.cartons)} />
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
              <h2>明细录入</h2>
              <p>支持按 SOGO 模板合并箱规相关列；总价、总毛重、总体积改为人工确认录入。</p>
            </div>
            <div className="panel-actions">
              <button className="secondary-button" type="button" onClick={props.onOpenDetailModal}>弹出录入</button>
              <button className="secondary-button" type="button" onClick={props.onMergeRows}>合并选中行</button>
              <button className="ghost-button" type="button" onClick={props.onUnmergeRows}>取消合并</button>
              <button className="danger-button" type="button" onClick={props.onClearRows}>清空明细录入</button>
              <button className="primary-button" type="button" onClick={props.onAddRow}>新增一行</button>
            </div>
          </div>
          <PackingTable rows={props.rows} selectedRows={props.selectedRows} suggestions={props.suggestions} onUpdateRow={props.onUpdateRow} onToggleRow={props.onToggleRow} />
        </div>

        <aside className="side-panel">
          <section className="panel-section">
            <h2>照片识别</h2>
            <div
              className={props.ocrStatus === "识别成功" ? "drag-upload success" : "drag-upload"}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                props.onUploadOcr();
              }}
            >
              <strong>{props.ocrStatus}</strong>
              <span>拖拽手写照片到此处，或点击下方按钮上传。</span>
            </div>
            <label className="upload-control">
              <input type="file" accept="image/*" onChange={props.onUploadOcr} />
              上传手写照片
            </label>
          </section>

          <section className="panel-section">
            <h2>付款信息</h2>
            <label className="field compact">DEPOTSIT 订金<input type="number" min="0" step="0.01" placeholder="0.00" /></label>
            <label className="field compact">BLANCE 余额<input type="number" min="0" step="0.01" placeholder="0.00" /></label>
            <label className="field compact">银行账号<textarea rows={4} placeholder="填写银行账户信息" /></label>
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
          {props.rows.map((item, index) => {
            const rowSpan = groupRowSpan(index, item.mergeGroupId);
            return (
              <tr key={item.id}>
                <td className="select-col">
                  <input type="checkbox" checked={props.selectedRows.includes(item.id)} onChange={() => props.onToggleRow(item.id)} />
                </td>
                {tableColumns.map((column) => {
                  if (column.mergeable && item.mergeGroupId && rowSpan === 0) return null;
                  const value = String(item[column.key] ?? "");
                  const suggestionKey = column.key === "itemName" || column.key === "description" ? column.key : undefined;
                  return (
                    <td key={column.key} className={column.className} rowSpan={column.mergeable ? rowSpan : 1}>
                      {column.key === "photo" ? (
                        <ImageCellInput value={value} onChange={(nextValue) => props.onUpdateRow(item.id, column.key, nextValue)} />
                      ) : column.suggestible && suggestionKey ? (
                        <SuggestInput
                          value={value}
                          placeholder={column.label}
                          suggestions={props.suggestions?.[suggestionKey] ?? []}
                          onChange={(nextValue) => props.onUpdateRow(item.id, column.key, nextValue)}
                        />
                      ) : (
                        <input
                          value={value}
                          onChange={(event) => props.onUpdateRow(item.id, column.key, event.target.value)}
                          placeholder={column.label}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HistoryPage({ records }: { records: OrderRecord[] }) {
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const filtered = records.filter((record) => {
    const matchKeyword = !keyword || `${record.id}${record.customer}`.toLowerCase().includes(keyword.toLowerCase());
    const matchDate = !date || record.date === date;
    return matchKeyword && matchDate;
  });

  return (
    <>
      <PageHeader title="历史单据">
        <button className="primary-button" type="button">查询</button>
      </PageHeader>
      <section className="query-band">
        <label className="field">编号<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="输入单据编号或客户" /></label>
        <label className="field">日期<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label className="field">客户<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="输入客户名称" /></label>
      </section>
      <div className="record-list">
        {filtered.map((record) => (
          <section className="record-card" key={record.id}>
            <div className="record-head">
              <strong>{record.id}</strong>
              <span>{record.date}</span>
              <span>{record.customer}</span>
              <span>{record.status}</span>
            </div>
            <PackingTable rows={record.rows} selectedRows={[]} onUpdateRow={() => undefined} onToggleRow={() => undefined} />
          </section>
        ))}
      </div>
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

function SuggestInput(props: {
  value: string;
  placeholder: string;
  suggestions: string[];
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const normalized = props.value.trim().toLowerCase();
  const options = props.suggestions
    .filter((item) => !normalized || item.toLowerCase().includes(normalized))
    .filter((item) => item !== props.value)
    .slice(0, 8);

  return (
    <div className="suggest-input">
      <input
        value={props.value}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        onChange={(event) => props.onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        placeholder={props.placeholder}
      />
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
    setSelectedCustomers((current) =>
      current.includes(customerName) ? current.filter((item) => item !== customerName) : [...current, customerName]
    );
  }

  function toggleAllCustomers() {
    setSelectedCustomers(allSelected ? [] : customers.map((item) => item.name));
  }

  return (
    <>
      <PageHeader title="统计查询">
        <button className="primary-button" type="button">统计</button>
      </PageHeader>
      <section className="query-band stats-query">
        <label className="field">起始日期<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label className="field">终止日期<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
        <label className="field">产品<input value={product} onChange={(event) => setProduct(event.target.value)} placeholder="例如 CAR MAT" /></label>
        <div className="field customer-checks">
          客户
          <div className="check-grid">
            <label className="check-item check-all">
              <input checked={allSelected} type="checkbox" onChange={toggleAllCustomers} />
              全选
            </label>
            {customers.map((customer) => (
              <label key={customer.id} className="check-item">
                <input checked={selectedCustomers.includes(customer.name)} type="checkbox" onChange={() => toggleCustomer(customer.name)} />
                {customer.name}
              </label>
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
            <Summary label="匹配明细" value={String(filtered.length)} />
            <Summary label="产品总数量" value={String(quantity)} />
            <Summary label="产品总价" value={`¥${amount.toFixed(2)}`} />
            <Summary label="总箱数" value={String(cartons)} />
            <Summary label="区间总货款" value={`¥${amount.toFixed(2)}`} />
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
      <PageHeader title="客户通讯录">
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

function CustomerPicker(props: {
  customers: Customer[];
  onClose: () => void;
  onSelect: (name: string) => void;
  onSaveCustomer: (customer: Customer) => void;
}) {
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
            <button className="secondary-button" type="button" onClick={props.onAddRow}>新增一行</button>
            <button className="danger-button" type="button" onClick={props.onClearRows}>清空明细录入</button>
            <button className="ghost-button" type="button" onClick={props.onClose}>关闭</button>
          </div>
        </div>
        <PackingTable rows={props.rows} selectedRows={[]} suggestions={props.suggestions} onUpdateRow={props.onUpdateRow} onToggleRow={() => undefined} />
      </section>
    </div>
  );
}

function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="top-actions">{children}</div>
    </header>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
