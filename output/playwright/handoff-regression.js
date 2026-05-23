async (page) => {
  const outDir = "C:/Users/gocri/.codex/worktrees/ee92/New project/output/playwright";
  const results = [];
  const issues = [];

  const record = async (name, fn) => {
    try {
      const detail = await fn();
      results.push({ name, status: "pass", detail });
    } catch (error) {
      results.push({ name, status: "fail", detail: String(error && error.message ? error.message : error) });
      issues.push({ name, detail: String(error && error.message ? error.message : error) });
    }
  };

  const expect = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  const text = async () => page.locator("body").innerText();
  const inputValue = async (locator) => locator.inputValue().catch(() => "");
  page.on("dialog", async (dialog) => {
    await dialog.accept().catch(() => undefined);
  });

  await page.goto("http://localhost:5174/");
  await page.waitForLoadState("domcontentloaded");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: `${outDir}/desktop-workbench.png`, fullPage: true });

  await record("visual text is readable Chinese", async () => {
    const body = await text();
    expect(body.includes("工作台"), "body does not contain expected Chinese label 工作台");
    expect(body.includes("历史单据"), "body does not contain expected Chinese label 历史单据");
    expect(!body.includes("瑁") && !body.includes("鍙") && !body.includes("璇"), "body contains mojibake characters");
    return "expected Chinese labels are present";
  });

  await record("workbench default layout", async () => {
    const body = await text();
    expect(await page.locator(".sidebar").isVisible(), "sidebar is not visible");
    expect(await page.locator(".summary-strip").first().isVisible(), "summary strip is not visible");
    expect(await page.locator(".packing-table").first().isVisible(), "packing table is not visible");
    expect(await page.locator(".side-panel").isVisible(), "right side panel is not visible");
    expect(body.includes("0%"), "OCR initial progress 0% is not visible");
    return { rows: await page.locator(".packing-table tbody tr").count() };
  });

  await record("workbench edit row and add row", async () => {
    const initialRows = await page.locator(".packing-table").first().locator("tbody tr").count();
    await page.locator(".packing-table").first().locator("tbody tr").first().locator("input").nth(1).fill("TEST ITEM");
    await page.locator(".packing-table").first().locator("tbody tr").first().locator("input").nth(4).fill("7");
    await page.locator(".packing-table").first().locator("tbody tr").first().locator("input").nth(6).fill("12.5");
    await page.locator(".packing-table").first().locator("tbody tr").first().locator("input").nth(7).fill("87.5");
    await page.locator("button").filter({ hasText: /新增|鏂/ }).first().click();
    const afterRows = await page.locator(".packing-table").first().locator("tbody tr").count();
    expect(afterRows === initialRows + 1, `expected row count ${initialRows + 1}, got ${afterRows}`);
    const body = await text();
    expect(body.includes("87.50") || body.includes("87.5") || body.includes("21927.50"), "edited amount was not reflected in page text");
    return { initialRows, afterRows };
  });

  await record("OCR upload simulated flow", async () => {
    const filePath = `${outDir}/ocr-fixture.png`;
    await page.locator('label.upload-control input[type="file"]').setInputFiles(filePath);
    await page.waitForTimeout(100);
    let body = await text();
    expect(body.includes("68%"), "OCR did not enter 68% recognizing state");
    await page.waitForTimeout(900);
    body = await text();
    expect(body.includes("100%"), "OCR did not finish at 100%");
    return "upload moved progress 68% -> 100%";
  });

  await record("merge and unmerge selected rows", async () => {
    const table = page.locator(".packing-table").first();
    await table.locator('tbody tr input[type="checkbox"]').nth(0).check();
    await table.locator('tbody tr input[type="checkbox"]').nth(1).check();
    await page.locator("button").filter({ hasText: /合并|鍚/ }).first().click();
    let rowspanValues = await table.locator("tbody tr").first().locator("td[rowspan]").evaluateAll((cells) => cells.map((cell) => cell.getAttribute("rowspan")));
    let rowspan = rowspanValues.find((value) => Number(value) >= 2) ?? null;
    expect(Number(rowspan) >= 2, `expected merged rowspan >= 2, got ${rowspan}`);
    await table.locator('tbody tr input[type="checkbox"]').nth(0).check();
    await page.locator("button").filter({ hasText: /取消|鍙/ }).first().click();
    rowspanValues = await table.locator("tbody tr").first().locator("td[rowspan]").evaluateAll((cells) => cells.map((cell) => cell.getAttribute("rowspan")));
    expect(!rowspanValues.some((value) => Number(value) === 2), `expected selected rows to unmerge, got rowspans ${rowspanValues.join(",")}`);
    return "merge row span applied and cleared";
  });

  await record("detail modal opens", async () => {
    await page.locator("button").filter({ hasText: /弹出|寮/ }).first().click();
    expect(await page.locator(".modal.resizable-modal").isVisible(), "detail modal is not visible");
    const box = await page.locator(".modal.resizable-modal").boundingBox();
    expect(box && box.width > 500 && box.height > 300, "detail modal size is too small");
    await page.locator(".modal.resizable-modal button").filter({ hasText: /关闭|鍏/ }).first().click();
    return box;
  });

  await record("clear rows confirmation keeps one blank row", async () => {
    await page.evaluate(() => {
      window.confirm = () => true;
    });
    await page.locator("button").filter({ hasText: /清空|娓/ }).first().click();
    await page.waitForTimeout(100);
    const rowCount = await page.locator(".packing-table").first().locator("tbody tr").count();
    expect(rowCount === 1, `expected 1 row after clear, got ${rowCount}`);
    return { rowCount };
  });

  await record("history filtering and preview", async () => {
    await page.locator(".nav-item").nth(1).click();
    await page.waitForTimeout(100);
    expect(await page.locator(".history-overview").isVisible(), "history overview is not visible");
    await page.locator(".history-query input").first().fill("PK20260518");
    await page.waitForTimeout(100);
    const cards = await page.locator(".history-card").count();
    expect(cards === 1, `expected one filtered history card, got ${cards}`);
    const preview = await page.locator(".history-preview").innerText();
    expect(preview.includes("PK20260518-002"), "preview did not switch to filtered record");
    await page.locator(".history-query input").first().fill("NO_MATCH_123");
    await page.waitForTimeout(100);
    expect(await page.locator(".empty-hint").isVisible(), "history empty state not visible");
    return "keyword and empty state work";
  });

  await record("stats filters and customer selection", async () => {
    await page.locator(".nav-item").nth(2).click();
    await page.waitForTimeout(100);
    expect(await page.locator(".stats-detail").isVisible(), "stats detail table is not visible");
    await page.locator(".stats-query input").nth(2).fill("SEAT");
    await page.waitForTimeout(100);
    const rows = await page.locator(".stats-detail tbody tr").count();
    const firstValue = await page.locator(".stats-detail tbody tr").first().locator("input").nth(1).inputValue();
    expect(rows === 1, `product filter should leave one row, got ${rows}`);
    expect(firstValue === "SEAT COVER", `product filter first row should be SEAT COVER, got ${firstValue}`);
    await page.locator(".check-all input").uncheck();
    await page.waitForTimeout(100);
    expect(await page.locator(".empty-hint").isVisible(), "stats empty state not visible when no customer selected");
    await page.locator(".check-all input").check();
    return "product filter and all-customer toggle work";
  });

  await record("contacts add search select and workbench picker", async () => {
    await page.locator(".nav-item").nth(3).click();
    await page.waitForTimeout(100);
    const newName = `测试客户${Date.now()}`;
    const form = page.locator(".contact-layout .form-panel").first();
    await form.locator("input").nth(0).fill(newName);
    await form.locator("input").nth(1).fill("张三");
    await form.locator("input").nth(2).fill("13900001111");
    await form.locator("input").nth(3).fill("qa@example.com");
    await form.locator("textarea").fill("测试地址");
    await page.locator(".topbar button").first().click();
    await page.locator(".contact-layout .form-panel").nth(1).locator("input").fill(newName);
    await page.waitForTimeout(100);
    expect((await page.locator(".customer-list button").count()) >= 1, "new customer not searchable");
    await page.locator(".customer-list button").first().click();
    expect(await inputValue(form.locator("input").nth(0)) === newName, "clicking customer did not refill form");
    await page.locator(".nav-item").nth(0).click();
    await page.locator(".input-with-button button").click();
    expect(await page.locator(".modal.customer-modal").isVisible(), "customer picker modal not visible");
    await page.locator(".modal.customer-modal .customer-list button").filter({ hasText: newName }).first().click();
    expect((await page.locator(".customer-field input").inputValue()) === newName, "selected customer did not populate workbench");
    return { newName };
  });

  for (const viewport of [
    { name: "desktop-1440", width: 1440, height: 1000 },
    { name: "tablet-1024", width: 1024, height: 900 },
    { name: "mobile-390", width: 390, height: 900 }
  ]) {
    await record(`responsive ${viewport.name}`, async () => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${outDir}/${viewport.name}.png`, fullPage: true });
      const metrics = await page.evaluate(() => ({
        bodyScrollWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        navDisplay: getComputedStyle(document.querySelector(".sidebar")).display,
        sidebarRect: document.querySelector(".sidebar")?.getBoundingClientRect().toJSON(),
        tableWrapOverflowX: getComputedStyle(document.querySelector(".desktop-table-wrap")).overflowX
      }));
      expect(metrics.bodyScrollWidth <= metrics.viewportWidth + 2, `page has horizontal overflow: body ${metrics.bodyScrollWidth}, viewport ${metrics.viewportWidth}`);
      return metrics;
    });
  }

  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const report = { results, issues, screenshots: ["desktop-workbench.png", "desktop-1440.png", "tablet-1024.png", "mobile-390.png"] };
  return report;
}
