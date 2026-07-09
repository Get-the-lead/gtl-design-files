const body = document.body;
const sidebar = document.querySelector(".sidebar");
const navLinks = document.querySelectorAll(".side-nav a");
const openNavButton = document.querySelector("[data-open-nav]");
const closeNavTarget = document.querySelector("[data-close-nav]");
const modal = document.querySelector("[data-modal]");
const openModalButton = document.querySelector("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const toggles = document.querySelectorAll("[data-toggle]");
const expandButtons = document.querySelectorAll("[data-expand]");
const drawerSection = document.querySelector("#drawers");
const drawerViewButtons = document.querySelectorAll("[data-drawer-view]");

function toHex(value) {
  const hex = Math.max(0, Math.min(255, Number(value))).toString(16).padStart(2, "0");
  return hex.toUpperCase();
}

function parseRgb(value) {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return null;
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts[3] == null ? 1 : Number(parts[3]);
  if ([r, g, b, a].some((part) => Number.isNaN(part))) return null;
  return { r, g, b, a };
}

function describeColorSwatches() {
  document.querySelectorAll(".swatch").forEach((swatch) => {
    if (swatch.querySelector(".color-meta")) return;
    const sample = swatch.querySelector("span");
    const token = swatch.querySelector("code")?.textContent?.trim();
    if (!sample || !token) return;

    const styles = getComputedStyle(sample);
    const color = parseRgb(styles.backgroundColor);
    const meta = document.createElement("div");
    meta.className = "color-meta";

    if (color) {
      const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
      const rgb = `${color.r}, ${color.g}, ${color.b}`;
      const alpha = Math.round(color.a * 100) / 100;
      meta.innerHTML = alpha < 1
        ? `<span><strong>HEX</strong> ${hex}</span><span><strong>RGBA</strong> rgba(${rgb}, ${alpha})</span><span><strong>Opacity</strong> ${Math.round(alpha * 100)}%</span>`
        : `<span><strong>HEX</strong> ${hex}</span><span><strong>RGB</strong> ${rgb}</span>`;
    } else if (styles.backgroundImage && styles.backgroundImage !== "none") {
      meta.innerHTML = `<span><strong>Value</strong> ${styles.backgroundImage}</span>`;
    } else {
      meta.innerHTML = `<span><strong>Value</strong> unresolved</span>`;
    }

    swatch.append(meta);
  });
}

function closeNavigation() {
  body.classList.remove("nav-open");
}

openNavButton?.addEventListener("click", () => {
  body.classList.add("nav-open");
});

closeNavTarget?.addEventListener("click", closeNavigation);

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href")?.slice(1);
    if (targetId && document.getElementById(targetId)) {
      event.preventDefault();
      showSection(targetId, { updateHash: true });
    }
    closeNavigation();
  });
});

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isOn = toggle.classList.toggle("is-on");
    toggle.setAttribute("aria-pressed", String(isOn));
  });
});

expandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tile = button.closest(".game-tile");
    if (!tile) return;
    const open = tile.classList.toggle("is-open");
    tile.querySelectorAll("[data-expand]").forEach((item) => {
      item.setAttribute("aria-expanded", String(open));
      const label = item.querySelector(".toggle-label");
      if (label) label.textContent = open ? "Hide Bets" : "See Bets";
    });
  });
});

openModalButton?.addEventListener("click", () => {
  if (typeof modal?.showModal === "function") {
    modal.showModal();
  }
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modal?.close();
  });
});

const sections = [...document.querySelectorAll("main section[id]")];
const sectionIds = new Set(sections.map((section) => section.id));

function showSection(sectionId, options = {}) {
  const nextId = sectionIds.has(sectionId) ? sectionId : "overview";

  sections.forEach((section) => {
    const active = section.id === nextId;
    section.hidden = !active;
    section.classList.toggle("is-active-section", active);
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${nextId}`);
  });

  if (options.updateHash && window.location.hash !== `#${nextId}`) {
    history.pushState(null, "", `#${nextId}`);
  }

  window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
}

function sectionFromHash() {
  return window.location.hash.replace("#", "") || "overview";
}

function setDrawerView(view) {
  if (!drawerSection) return;
  const nextView = view === "desktop" ? "desktop" : "mobile";
  drawerSection.dataset.drawerViewMode = nextView;

  drawerViewButtons.forEach((button) => {
    const active = button.dataset.drawerView === nextView;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  drawerSection.querySelectorAll(".ds-drawer-panel").forEach((panel) => {
    const isDesktopPanel = Boolean(panel.querySelector(".ds-drawer-desktop"));
    panel.hidden = nextView === "desktop" ? !isDesktopPanel : isDesktopPanel;
  });
}

function createLimitOpenDrawerState() {
  if (!drawerSection || drawerSection.querySelector("[data-drawer-state='limit-open']")) return;

  const baseState = drawerSection.querySelector(".ds-drawer-state");
  if (!baseState) return;

  const limitState = baseState.cloneNode(true);
  limitState.dataset.drawerState = "limit-open";

  const heading = limitState.querySelector(".ds-subsection-header h2");
  const copy = limitState.querySelector(".ds-subsection-header p");
  if (heading) heading.textContent = "Limit Open";
  if (copy) copy.textContent = "Buy flow with the limit price control expanded and ready for manual entry.";

  limitState.querySelectorAll(".limit-section").forEach((section) => {
    section.hidden = false;
  });

  limitState.querySelectorAll("[data-limit-toggle]").forEach((button) => {
    button.setAttribute("aria-expanded", "true");
    button.textContent = "Limit Open";
  });

  limitState.querySelectorAll("[data-limit-input]").forEach((input) => {
    input.value = "52";
  });

  limitState.querySelectorAll("[data-limit-minmax]").forEach((line) => {
    line.textContent = "Limit order up to 52¢";
  });

  limitState.querySelectorAll("[data-bet-primary]").forEach((button) => {
    button.textContent = "Place Limit";
  });

  baseState.after(limitState);
}

function money(value) {
  return `$${Math.max(0, value).toFixed(2)}`;
}

function numberFromInput(input, fallback = 0) {
  const value = Number(String(input?.value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : fallback;
}

function centsFromText(text, fallback = 0) {
  const value = Number(String(text || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : fallback;
}

function setText(root, selector, value) {
  const target = root.querySelector(selector);
  if (target) target.textContent = value;
}

function updateDrawerPreview(sheet) {
  const mode = sheet.dataset.mode || "buy";
  const activePrice = sheet.querySelector(".bt-opt.is-active [class*='price']");
  const price = centsFromText(activePrice?.textContent, centsFromText(sheet.querySelector("[data-yes-price]")?.textContent, 64));
  const buyQty = numberFromInput(sheet.querySelector("[data-qty-input]"), 100);
  const sellQty = numberFromInput(sheet.querySelector("[data-sell-qty-input]"), 60);
  const qty = mode === "sell" ? sellQty : buyQty;
  const subtotal = qty * (price / 100);
  const fee = subtotal * 0.02;
  const payout = qty;
  const buyTotal = subtotal + fee;
  const buyProfit = payout - buyTotal;
  const sellReceive = subtotal - fee;
  const realized = sellReceive - (qty * 0.38);

  setText(sheet, "[data-total-big]", money(subtotal));
  setText(sheet, "[data-profit-big]", money(buyProfit));
  setText(sheet, "[data-receive-big]", money(sellReceive));
  setText(sheet, "[data-realized-big]", money(realized));
  setText(sheet, "[data-s-price]", `${price}\u00A2`);
  setText(sheet, "[data-s-qty]", String(qty));
  setText(sheet, "[data-s-subtotal]", money(subtotal));
  setText(sheet, "[data-s-fee]", money(fee));
  setText(sheet, "[data-s-total]", mode === "sell" ? money(sellReceive) : money(buyTotal));
  setText(sheet, "[data-g-payout]", money(payout));
  setText(sheet, "[data-g-profit]", mode === "sell" ? money(realized) : money(buyProfit));
  setText(sheet, "[data-g-fees]", money(fee));
  setText(sheet, "[data-g-net]", mode === "sell" ? money(sellReceive) : money(buyProfit - fee));
}

function syncDrawerPreviewPrices(sheet, market) {
  const prices = {
    gtl: { yes: 64, no: 36 },
    tie: { yes: 18, no: 82 },
    ktl: { yes: 71, no: 29 },
  }[market];
  if (!prices) return;

  setText(sheet, "[data-yes-price]", `${prices.yes}\u00A2`);
  setText(sheet, "[data-no-price]", `${prices.no}\u00A2`);
}

drawerSection?.addEventListener("click", (event) => {
  const preview = event.target.closest(".ds-drawer-preview");
  if (!preview) return;

  const sheet = preview.querySelector(".bet-sheet");
  if (!sheet) return;

  const link = event.target.closest("a[href='#']");
  if (link) {
    event.preventDefault();
    return;
  }

  const marketButton = event.target.closest("[data-market]");
  if (marketButton) {
    marketButton.parentElement?.querySelectorAll("[data-market]").forEach((button) => {
      button.classList.toggle("is-active", button === marketButton);
    });
    syncDrawerPreviewPrices(sheet, marketButton.dataset.market);
    updateDrawerPreview(sheet);
    return;
  }

  const contractButton = event.target.closest("[data-contract]");
  if (contractButton) {
    const group = contractButton.closest(".bet-toggle");
    group?.querySelectorAll("[data-contract]").forEach((button) => {
      button.classList.toggle("is-active", button === contractButton);
    });
    if (group) group.dataset.active = contractButton.dataset.contract;
    updateDrawerPreview(sheet);
    return;
  }

  const qtyButton = event.target.closest("[data-qty-set]");
  if (qtyButton) {
    const input = sheet.querySelector("[data-qty-input]");
    if (input) input.value = qtyButton.dataset.qtySet;
    qtyButton.parentElement?.querySelectorAll("[data-qty-set]").forEach((button) => {
      button.classList.toggle("is-active", button === qtyButton);
    });
    updateDrawerPreview(sheet);
    return;
  }

  const sellPctButton = event.target.closest("[data-sell-pct]");
  if (sellPctButton) {
    const held = 120;
    const pct = Number(sellPctButton.dataset.sellPct || 0);
    const input = sheet.querySelector("[data-sell-qty-input]");
    if (input) input.value = String(Math.round((held * pct) / 100));
    sellPctButton.parentElement?.querySelectorAll("[data-sell-pct]").forEach((button) => {
      button.classList.toggle("is-active", button === sellPctButton);
    });
    updateDrawerPreview(sheet);
    return;
  }

  const limitButton = event.target.closest("[data-limit-toggle]");
  if (limitButton) {
    const section = sheet.querySelector("[data-limit-section]");
    const expanded = section?.hidden;
    if (section) section.hidden = !expanded;
    limitButton.setAttribute("aria-expanded", String(Boolean(expanded)));
    return;
  }

  const stepButton = event.target.closest("[data-breakdown], [data-bet-back]");
  if (stepButton) {
    sheet.dataset.step = stepButton.hasAttribute("data-breakdown") ? "2" : "1";
  }
});

drawerSection?.addEventListener("input", (event) => {
  const input = event.target.closest("[data-qty-input], [data-sell-qty-input], [data-limit-input]");
  if (!input) return;
  const sheet = input.closest(".bet-sheet");
  if (sheet) updateDrawerPreview(sheet);
});

drawerViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDrawerView(button.dataset.drawerView);
  });
});

window.addEventListener("hashchange", () => {
  showSection(sectionFromHash(), { instant: true });
});

createLimitOpenDrawerState();
setDrawerView(drawerSection?.dataset.drawerViewMode);
drawerSection?.querySelectorAll(".bet-sheet").forEach(updateDrawerPreview);
showSection(sectionFromHash(), { instant: true });
describeColorSwatches();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});
