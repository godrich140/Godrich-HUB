import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Boxes,
  ChartNoAxesCombined,
  Contact,
  DollarSign,
  Eye,
  FileSpreadsheet,
  Files,
  Hash,
  LayoutDashboard,
  PackageCheck,
  Rows3,
  Save,
  UserRound,
  type LucideIcon
} from "lucide-react";

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
  backendId?: string;
  sourceFileId?: string;
  sourceFileName?: string;
  id: string;
  date: string;
  customer: string;
  status: string;
  rows: PackingRow[];
};

type ApiPackingOrder = {
    id: string;
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

type ApiImportItem = {
  file: {
    id: string;
    original_name: string;
    storage_path: string;
  };
  order: ApiPackingOrder;
};

const navigation: Array<{ key: PageKey; label: string; icon: LucideIcon }> = [
  { key: "workbench", label: "工作台", icon: LayoutDashboard },
  { key: "history", label: "历史单据", icon: Files },
  { key: "stats", label: "统计查询", icon: ChartNoAxesCombined },
  { key: "contacts", label: "客户通讯录", icon: Contact }
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
    backendId: item.order.id,
    sourceFileId: item.file.id,
    sourceFileName: item.file.original_name,
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

function mapApiOrder(orderItem: ApiPackingOrder): OrderRecord {
  return {
    backendId: orderItem.id,
    id: orderItem.order_no,
    date: orderItem.order_date,
    customer: orderItem.customer_name,
    status: orderItem.status === "draft" ? "草稿" : orderItem.status,
    rows: orderItem.items.map((detail) =>
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

function isVisibleHistoryRecord(record: OrderRecord) {
  const systemPrefixes = ["PKTEST-", "PKDELETE-", "PKCONTINUE-"];
  const systemCustomers = ["公网重复保存测试", "二次点击公网测试", "继续验证", "批量删除验证"];
  return !systemPrefixes.some((prefix) => record.id.startsWith(prefix)) && !systemCustomers.includes(record.customer);
}

function historySelectionKey(record: OrderRecord) {
  return record.sourceFileId ?? record.backendId ?? record.id;
}

function toApiDecimal(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function orderToApiPayload(order: {
  orderNo: string;
  customerName: string;
  orderDate: string;
  status: string;
  deposit: string;
  balance: string;
  bankAccount: string;
  rows: PackingRow[];
}) {
  return {
    order_no: order.orderNo,
    customer_name: order.customerName,
    order_date: order.orderDate,
    status: order.status,
    deposit: toApiDecimal(order.deposit),
    balance: toApiDecimal(order.balance),
    bank_account: order.bankAccount || null,
    items: order.rows.map((item, index) => ({
      row_index: index + 1,
      item_name: item.itemName || null,
      description: item.description || null,
      quantity: toApiDecimal(item.quantity),
      unit: item.unit || null,
      unit_price: toApiDecimal(item.unitPrice),
      total_price: toApiDecimal(item.totalPrice),
      qty_per_carton: toApiDecimal(item.qtyPerCarton),
      carton_count: toApiDecimal(item.cartonCount),
      gross_weight_ctn: toApiDecimal(item.grossWeightCtn),
      cbm: toApiDecimal(item.cbm),
      total_gross_weight: toApiDecimal(item.totalGrossWeight),
      measure_cm: item.measureCm || null,
      total_cbm: toApiDecimal(item.totalCbm),
      merge_group_id: item.mergeGroupId || null
    }))
  };
}

function nextOrderNo() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `PK${datePart}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
}

export function App() {
  const [page, setPage] = useState<PageKey>("workbench");
  const [customers, setCustomers] = useState(customersSeed);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderDate, setOrderDate] = useState("2025-10-12");
  const [orderNo, setOrderNo] = useState(nextOrderNo);
  const [orderStatus, setOrderStatus] = useState("草稿");
  const [deposit, setDeposit] = useState("");
  const [balance, setBalance] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
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

  function newWorkbenchOrder() {
    setActiveOrderId(null);
    setSelectedCustomer("");
    setOrderDate(new Date().toISOString().slice(0, 10));
    setOrderNo(nextOrderNo());
    setOrderStatus("草稿");
    setDeposit("");
    setBalance("");
    setBankAccount("");
    setRows([row(String(Date.now()))]);
    setSelectedRows([]);
    setActionMessage("已新建一张空白装箱单。");
    setPage("workbench");
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

  async function saveCurrentOrder() {
    const customerName = selectedCustomer.trim() || "未选择客户";
    const payload = orderToApiPayload({
      orderNo: orderNo.trim() || `PK${Date.now()}`,
      customerName,
      orderDate,
      status: orderStatus === "草稿" ? "draft" : orderStatus,
      deposit,
      balance,
      bankAccount,
      rows
    });

    setIsSavingOrder(true);
    setActionMessage("正在保存草稿...");
    try {
      const response = await fetch(activeOrderId ? `/api/orders/${activeOrderId}` : "/api/orders", {
        method: activeOrderId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(await response.text());
      const saved = (await response.json()) as { id: string; order_no: string };
      setActiveOrderId(saved.id);
      setOrderNo(saved.order_no);
      setActionMessage("草稿已保存到后端。");
      return saved.id;
    } catch (error) {
      setActionMessage(`保存失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
      throw error;
    } finally {
      setIsSavingOrder(false);
    }
  }

  async function previewCurrentOrder() {
    try {
      const orderId = await saveCurrentOrder();
      setActionMessage("正在生成预览...");
      const response = await fetch(`/api/orders/${orderId}/preview`, { method: "POST" });
      if (!response.ok) throw new Error(await response.text());
      const payload = (await response.json()) as { html: string };
      setPreviewHtml(payload.html);
      setPreviewOpen(true);
      setActionMessage("预览已生成。");
    } catch (error) {
      setActionMessage(`预览失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
    }
  }

  async function exportCurrentOrder() {
    try {
      const orderId = await saveCurrentOrder();
      setActionMessage("正在生成 Excel...");
      const response = await fetch(`/api/orders/${orderId}/export-excel`, { method: "POST" });
      if (!response.ok) throw new Error(await response.text());
      const payload = (await response.json()) as { download_url: string };
      setActionMessage("Excel 已生成并保存到后端。");
      window.location.href = payload.download_url;
    } catch (error) {
      setActionMessage(`生成 Excel 失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
    }
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
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
            <button key={item.key} className={page === item.key ? "nav-item active" : "nav-item"} onClick={() => setPage(item.key)} type="button">
              <span className="nav-icon"><Icon aria-hidden="true" size={18} strokeWidth={2} /></span>
              {item.label}
            </button>
            );
          })}
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
            orderDate={orderDate}
            setOrderDate={setOrderDate}
            orderNo={orderNo}
            setOrderNo={setOrderNo}
            orderStatus={orderStatus}
            setOrderStatus={setOrderStatus}
            deposit={deposit}
            setDeposit={setDeposit}
            balance={balance}
            setBalance={setBalance}
            bankAccount={bankAccount}
            setBankAccount={setBankAccount}
            rows={rows}
            selectedRows={selectedRows}
            totals={totals}
            ocrStatus={ocrStatus}
            ocrProgress={ocrProgress}
            actionMessage={actionMessage}
            isSavingOrder={isSavingOrder}
            onAddRow={addRow}
            onUpdateRow={updateRow}
            onToggleRow={toggleSelectedRow}
            onMergeRows={mergeSelectedRows}
            onUnmergeRows={unmergeSelectedRows}
            onUploadOcr={handleUploadOcr}
            onClearRows={clearRows}
            onNewOrder={newWorkbenchOrder}
            onSaveOrder={saveCurrentOrder}
            onPreviewOrder={previewCurrentOrder}
            onExportOrder={exportCurrentOrder}
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
      {previewOpen && <PreviewModal html={previewHtml} onClose={() => setPreviewOpen(false)} />}
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
  orderDate: string;
  setOrderDate: (value: string) => void;
  orderNo: string;
  setOrderNo: (value: string) => void;
  orderStatus: string;
  setOrderStatus: (value: string) => void;
  deposit: string;
  setDeposit: (value: string) => void;
  balance: string;
  setBalance: (value: string) => void;
  bankAccount: string;
  setBankAccount: (value: string) => void;
  rows: PackingRow[];
  selectedRows: string[];
  totals: { quantity: number; amount: number; cartons: number };
  ocrStatus: string;
  ocrProgress: number;
  actionMessage: string;
  isSavingOrder: boolean;
  onAddRow: () => void;
  onUpdateRow: (rowId: string, key: PackingCellKey, value: string) => void;
  onToggleRow: (rowId: string) => void;
  onMergeRows: () => void;
  onUnmergeRows: () => void;
  onUploadOcr: () => void;
  onClearRows: () => void;
  onNewOrder: () => void;
  onSaveOrder: () => Promise<string>;
  onPreviewOrder: () => void;
  onExportOrder: () => void;
  suggestions: Record<"itemName" | "description", string[]>;
  onOpenCustomerModal: () => void;
  onOpenDetailModal: () => void;
}) {
  return (
    <>
      <PageHeader title="装箱单工作台" subtitle="高效创建与管理装箱单">
        <button className="secondary-button icon-button" type="button" onClick={props.onNewOrder}><FileSpreadsheet aria-hidden="true" size={17} />新建装箱单</button>
        <button className="secondary-button icon-button" type="button" onClick={() => void props.onSaveOrder()} disabled={props.isSavingOrder}><Save aria-hidden="true" size={17} />{props.isSavingOrder ? "保存中..." : "保存草稿"}</button>
        <button className="secondary-button icon-button" type="button" onClick={props.onPreviewOrder} disabled={props.isSavingOrder}><Eye aria-hidden="true" size={17} />预览表格</button>
        <button className="primary-button icon-button" type="button" onClick={props.onExportOrder} disabled={props.isSavingOrder}><FileSpreadsheet aria-hidden="true" size={17} />生成 Excel</button>
      </PageHeader>
      {props.actionMessage && <section className="action-message">{props.actionMessage}</section>}

      <section className="summary-strip">
        <Summary icon={<UserRound aria-hidden="true" size={18} />} label="客户" value={props.selectedCustomer || "未选择"} />
        <Summary icon={<Rows3 aria-hidden="true" size={18} />} label="明细行" value={String(props.rows.length)} />
        <Summary icon={<Hash aria-hidden="true" size={18} />} label="总数量" value={String(props.totals.quantity)} />
        <Summary icon={<DollarSign aria-hidden="true" size={18} />} label="总金额" value={`￥${props.totals.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} emphasis />
        <Summary icon={<Boxes aria-hidden="true" size={18} />} label="总箱数" value={String(props.totals.cartons)} />
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
          <input type="date" value={props.orderDate} onChange={(event) => props.setOrderDate(event.target.value)} />
        </label>
        <label className="field">
          单号
          <input value={props.orderNo} onChange={(event) => props.setOrderNo(event.target.value)} placeholder="系统自动生成或手动录入" />
        </label>
        <label className="field">
          状态
          <select value={props.orderStatus} onChange={(event) => props.setOrderStatus(event.target.value)}>
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
            <label className="field compact">DEPOSIT 订金<input type="number" min="0" step="0.01" value={props.deposit} onChange={(event) => props.setDeposit(event.target.value)} placeholder="0.00" /></label>
            <label className="field compact">BLANCE 余额<input type="number" min="0" step="0.01" value={props.balance} onChange={(event) => props.setBalance(event.target.value)} placeholder="0.00" /></label>
            <label className="field compact">银行账号<input value={props.bankAccount} onChange={(event) => props.setBankAccount(event.target.value)} placeholder="请输入银行账号（可选）" /></label>
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("全部");
  const [importMessage, setImportMessage] = useState("请选择 .xls 或 .xlsx 文件，系统会保存到服务器并生成待核对草稿单。");
  const [serverRecords, setServerRecords] = useState<OrderRecord[]>([]);
  const [importedRecords, setImportedRecords] = useState<OrderRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [selectedHistoryKeys, setSelectedHistoryKeys] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const allRecords = [...importedRecords, ...serverRecords]
    .filter(isVisibleHistoryRecord)
    .filter((record, index, source) => source.findIndex((item) => item.id === record.id) === index);
  const filtered = allRecords.filter((record) => {
    const matchKeyword = !keyword || `${record.id}${record.customer}`.toLowerCase().includes(keyword.toLowerCase());
    const matchStartDate = !startDate || record.date >= startDate;
    const matchEndDate = !endDate || record.date <= endDate;
    const matchStatus = status === "全部" || record.status === status;
    return matchKeyword && matchStartDate && matchEndDate && matchStatus;
  });
  const activeRecord = filtered.find((record) => record.id === activeId) ?? filtered[0];
  const totalRows = filtered.reduce((sum, record) => sum + record.rows.length, 0);
  const totalAmount = filtered.reduce((sum, record) => sum + record.rows.reduce((rowSum, item) => rowSum + toNumber(item.totalPrice), 0), 0);
  const totalCartons = filtered.reduce((sum, record) => sum + record.rows.reduce((rowSum, item) => rowSum + toNumber(item.cartonCount), 0), 0);
  const importedRows = importedRecords.reduce((sum, record) => sum + record.rows.length, 0);
  const selectedExportRecords = allRecords.filter((record) => (record.sourceFileId || record.backendId) && selectedHistoryKeys.includes(historySelectionKey(record)));
  const selectedExportCount = selectedExportRecords.length;

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) throw new Error(await response.text());
        const payload = (await response.json()) as ApiPackingOrder[];
        if (!isMounted) return;
        const nextRecords = payload.map(mapApiOrder).filter(isVisibleHistoryRecord);
        setServerRecords(nextRecords);
        setActiveId((current) => current || nextRecords[0]?.id || "");
      } catch (error) {
        if (isMounted) {
          setImportMessage(`历史订单加载失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
        }
      }
    }
    void loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);

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
      setSelectedHistoryKeys((current) => [...nextRecords.map(historySelectionKey), ...current]);
      setKeyword("");
      setStartDate("");
      setEndDate("");
      setStatus("全部");
      setImportMessage(`服务器已保存 ${payload.imported.length} 个 Excel 文件，并生成 ${nextRecords.length} 张待核对草稿单。`);
    } catch (error) {
      setImportMessage(`Excel 导入失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
    } finally {
      setIsImporting(false);
    }
  }

  async function handleBatchExport() {
    if (selectedExportRecords.length === 0) {
      setImportMessage("请先勾选要打包导出的历史 Excel 文件。");
      return;
    }
    const fileIds = selectedExportRecords.map((record) => record.sourceFileId).filter((id): id is string => Boolean(id));
    const orderIds = selectedExportRecords
      .filter((record) => !record.sourceFileId)
      .map((record) => record.backendId)
      .filter((id): id is string => Boolean(id));
    setIsExporting(true);
    try {
      const response = await fetch("/api/excel/export-history-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_ids: fileIds, order_ids: orderIds })
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

  async function handleBatchDelete() {
    if (selectedExportRecords.length === 0) {
      setImportMessage("请先勾选要删除的历史单据。");
      return;
    }
    const confirmed = window.confirm(`确定删除已选 ${selectedExportRecords.length} 条历史单据？删除后不可恢复。`);
    if (!confirmed) return;

    const fileIds = selectedExportRecords.map((record) => record.sourceFileId).filter((id): id is string => Boolean(id));
    const orderIds = selectedExportRecords
      .filter((record) => !record.sourceFileId)
      .map((record) => record.backendId)
      .filter((id): id is string => Boolean(id));
    const deletedKeys = new Set(selectedExportRecords.map(historySelectionKey));
    const deletedRecordIds = new Set(selectedExportRecords.map((record) => record.id));

    setIsDeleting(true);
    try {
      const response = await fetch("/api/excel/delete-history-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_ids: fileIds, order_ids: orderIds })
      });
      if (!response.ok) throw new Error(await response.text());
      setImportedRecords((current) => current.filter((record) => !deletedKeys.has(historySelectionKey(record))));
      setServerRecords((current) => current.filter((record) => !deletedKeys.has(historySelectionKey(record))));
      setSelectedHistoryKeys((current) => current.filter((key) => !deletedKeys.has(key)));
      setActiveId((current) => (deletedRecordIds.has(current) ? "" : current));
      setImportMessage(`已删除 ${selectedExportRecords.length} 条历史单据。`);
    } catch (error) {
      setImportMessage(`批量删除失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
    } finally {
      setIsDeleting(false);
    }
  }

  function toggleHistoryFile(record: OrderRecord) {
    const key = historySelectionKey(record);
    setSelectedHistoryKeys((current) => (current.includes(key) ? current.filter((id) => id !== key) : [...current, key]));
  }

  async function previewHistoryRecord(record: OrderRecord) {
    if (!record.backendId) {
      setImportMessage("该记录没有后端订单 ID，请先通过 Excel 导入或保存为真实订单。");
      return;
    }
    try {
      const response = await fetch(`/api/orders/${record.backendId}/preview`, { method: "POST" });
      if (!response.ok) throw new Error(await response.text());
      const payload = (await response.json()) as { html: string };
      setPreviewHtml(payload.html);
      setPreviewOpen(true);
    } catch (error) {
      setImportMessage(`预览失败：${error instanceof Error ? error.message : "服务器接口异常"}`);
    }
  }

  return (
    <>
      <PageHeader title="历史装箱单" subtitle="导入、查询并批量导出历史单据">
        <label className={isImporting ? "secondary-button file-action disabled" : "secondary-button file-action"}>
          {isImporting ? "导入中..." : "批量导入 Excel"}
          <input disabled={isImporting} type="file" accept=".xls,.xlsx" multiple onChange={(event) => handleExcelImport(event.target.files)} />
        </label>
        <button className="secondary-button" type="button" onClick={handleBatchExport} disabled={selectedExportCount === 0 || isExporting}>
          {isExporting ? "打包中..." : `批量导出${selectedExportCount ? ` (${selectedExportCount})` : ""}`}
        </button>
        <button className="secondary-button danger-button" type="button" onClick={handleBatchDelete} disabled={selectedExportCount === 0 || isDeleting}>
          {isDeleting ? "删除中..." : `批量删除${selectedExportCount ? ` (${selectedExportCount})` : ""}`}
        </button>
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
        <label className="field">开始日期<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label className="field">结束日期<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
        <label className="field">状态<select value={status} onChange={(event) => setStatus(event.target.value)}><option>全部</option><option>草稿</option><option>已生成</option><option>已导出</option></select></label>
      </section>

      <section className="history-layout">
        <div className="record-list history-list">
          {filtered.map((record) => {
            const amount = record.rows.reduce((sum, item) => sum + toNumber(item.totalPrice), 0);
            const selectionKey = historySelectionKey(record);
            const isSelectable = Boolean(record.sourceFileId || record.backendId);
            const isChecked = selectedHistoryKeys.includes(selectionKey);
            const cardClass = [
              "record-card",
              "history-card",
              activeRecord?.id === record.id ? "active" : "",
              isChecked ? "selected" : "",
              isSelectable ? "" : "disabled"
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div className={cardClass} key={record.id} onClick={() => setActiveId(record.id)} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setActiveId(record.id)}>
                <div className={isSelectable ? "history-select" : "history-select disabled"}>
                  <input
                    checked={isChecked}
                    disabled={!isSelectable}
                    onChange={() => {
                      setActiveId(record.id);
                      toggleHistoryFile(record);
                    }}
                    type="checkbox"
                  />
                  <span className="history-list-main">
                    <strong>{record.id}</strong>
                    <span>{record.date}</span>
                  </span>
                  <strong className="history-list-total">${amount.toFixed(2)}</strong>
                </div>
              </div>
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
                <button className="secondary-button" type="button" onClick={() => void previewHistoryRecord(activeRecord)}>预览</button>
              </div>
            </div>
            <PackingTable rows={activeRecord.rows} selectedRows={[]} onUpdateRow={() => undefined} onToggleRow={() => undefined} />
          </section>
        ) : (
          <section className="empty-hint">暂无匹配的历史装箱单。</section>
        )}
      </section>
      {previewOpen && <PreviewModal html={previewHtml} onClose={() => setPreviewOpen(false)} />}
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

function PreviewModal({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="modal preview-modal">
        <div className="modal-head">
          <h2>装箱单预览</h2>
          <button className="ghost-button" type="button" onClick={onClose}>关闭</button>
        </div>
        <div className="preview-body" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </div>
  );
}

function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <header className="topbar">
      <div>
        <div className="title-row">
          <h1>{title}</h1>
          <span className="save-state"><PackageCheck aria-hidden="true" size={14} />本地草稿</span>
        </div>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="top-actions">{children}</div>
    </header>
  );
}

function Summary({ icon, label, value, emphasis }: { icon: ReactNode; label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="summary-card">
      <span className="summary-icon">{icon}</span>
      <p>{label}</p>
      <strong className={emphasis ? "money" : undefined}>{value}</strong>
    </div>
  );
}
