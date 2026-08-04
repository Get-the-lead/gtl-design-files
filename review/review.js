import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.2";

const config = window.GTL_REVIEW_CONFIG;

if (!config?.supabaseUrl || !config?.supabasePublishableKey) {
  throw new Error("GTL review configuration is missing.");
}

const supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
  auth: {
    storageKey: "gtl-review-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const PAGE_GROUPS = [
  {
    label: "Application",
    pages: [
      ["Home", "gtl-app/home.html"],
      ["Home B", "gtl-app/home-b.html"],
      ["Game", "gtl-app/game.html"],
      ["Game B", "gtl-app/game-b.html"],
      ["Wallet", "gtl-app/wallet.html"],
      ["Fees", "gtl-app/fees.html"],
    ],
  },
  {
    label: "Authentication",
    pages: [
      ["Landing", "gtl-app/index.html"],
      ["Log in", "gtl-app/login.html"],
      ["Sign up", "gtl-app/signup.html"],
      ["Forgot password", "gtl-app/forgot-password.html"],
    ],
  },
  {
    label: "Reference",
    pages: [["Design system", "design_system/index.html"]],
  },
];

const PAGE_OPTIONS = PAGE_GROUPS.flatMap((group) => group.pages);

const elements = {
  authView: document.querySelector("#authView"),
  authForm: document.querySelector("#authForm"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authError: document.querySelector("#authError"),
  reviewView: document.querySelector("#reviewView"),
  reviewDock: document.querySelector("#reviewDock"),
  currentPageButton: document.querySelector("#currentPageButton"),
  currentPageLabel: document.querySelector("#currentPageLabel"),
  commentsButton: document.querySelector("#commentsButton"),
  openCount: document.querySelector("#openCount"),
  deviceSwitch: document.querySelector("#deviceSwitch"),
  visibilitySwitch: document.querySelector("#visibilitySwitch"),
  modeButton: document.querySelector("#modeButton"),
  reviewMenu: document.querySelector("#reviewMenu"),
  menuPages: document.querySelector("#menuPages"),
  frameShell: document.querySelector("#frameShell"),
  frame: document.querySelector("#prototypeFrame"),
  modeHint: document.querySelector("#modeHint"),
  panel: document.querySelector("#reviewPanel"),
  panelContent: document.querySelector("#panelContent"),
  panelBackdrop: document.querySelector("#panelBackdrop"),
  toast: document.querySelector("#toast"),
};

const state = {
  user: null,
  reviewers: new Map(),
  threads: [],
  comments: [],
  currentPage: "gtl-app/home.html",
  mode: "browse",
  device: "desktop",
  listFilter: "open",
  menuOpen: false,
  panelView: null,
  activeThreadId: null,
  draft: null,
  realtimeChannel: null,
  frameCleanup: null,
  frameResizeObserver: null,
  highlightedAnchor: null,
  highlightLocked: false,
  retargetThreadId: null,
  pendingThreadId: null,
};

let toastTimer;

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const pageLabel = (pagePath) => {
  const base = pagePath.split("?")[0];
  const option = PAGE_OPTIONS.find(([, value]) => value === base);
  return option?.[0] || base.replace(/^.*\//, "");
};

const formatTime = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

const reviewerName = (id) => {
  const reviewer = state.reviewers.get(id);
  return reviewer?.display_name || reviewer?.email || "Reviewer";
};

const showToast = (message) => {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 3200);
};

const canonicalFramePage = () => {
  try {
    const url = new URL(elements.frame.contentWindow.location.href);
    const knownRoots = ["/gtl-app/", "/design_system/"];
    const root = knownRoots.find((candidate) => url.pathname.includes(candidate));
    if (!root) return state.currentPage;
    const relative = url.pathname.slice(url.pathname.indexOf(root) + 1);
    return `${relative}${url.search}`;
  } catch {
    return state.currentPage;
  }
};

const canonicalFrameHash = () => {
  try {
    return elements.frame.contentWindow.location.hash || "";
  } catch {
    return "";
  }
};

const frameUrlFor = (pagePath) => `../${pagePath}`;

const elementLabel = (element) => {
  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute("role");
  const type = tag === "input" ? element.getAttribute("type") : "";
  const kind = role || (type ? `${tag}[${type}]` : tag);
  const namedBy = element.getAttribute("aria-label")
    || element.getAttribute("title")
    || element.getAttribute("alt")
    || element.textContent;
  const name = String(namedBy || "").replace(/\s+/g, " ").trim().slice(0, 120);
  const identity = element.id
    ? `#${element.id}`
    : [...element.classList].filter((namePart) => !namePart.startsWith("gtl-review-")).slice(0, 2).map((namePart) => `.${namePart}`).join("");
  return `${kind}${name ? ` · “${name}”` : identity ? ` · ${identity}` : ""}`.slice(0, 240);
};

const stateControlPath = (element) => {
  const stableAttributes = ["data-flat-device", "data-flat-doc", "data-page-tab", "data-drawer-view"];
  const attribute = stableAttributes.find((name) => element.hasAttribute(name));
  if (!attribute) return elementPath(element);
  return `[${attribute}="${CSS.escape(element.getAttribute(attribute))}"]`;
};

const capturePageState = (element) => {
  const doc = element.ownerDocument;
  const scope = element.closest("section[id]") || element.closest("main") || doc.body;
  const activeSelector = [
    "[role='tab'][aria-selected='true']",
    "[aria-pressed='true']",
    "[aria-expanded='true']",
    "[data-flat-doc].is-active",
    "[data-page-tab].is-active",
    "[data-drawer-view].is-active",
  ].join(",");
  const controls = new Set([
    ...doc.querySelectorAll("[data-flat-device][aria-selected='true']"),
    ...scope.querySelectorAll(activeSelector),
  ]);
  const openDetails = [];
  let detailsElement = element.closest("details[open]");
  while (detailsElement) {
    openDetails.push(elementPath(detailsElement));
    detailsElement = detailsElement.parentElement?.closest("details[open]");
  }
  return {
    active_controls: [...controls].slice(0, 40).map(stateControlPath),
    open_details: openDetails,
  };
};

const renderMenuPages = () => {
  const base = state.currentPage.split("?")[0];
  elements.currentPageLabel.textContent = pageLabel(base);
  elements.menuPages.innerHTML = PAGE_GROUPS.map((group) => `
    <span class="review-menu-group-label">${escapeHtml(group.label)}</span>
    ${group.pages.map(([label, value]) => `
      <button class="review-menu-page ${value === base ? "is-active" : ""}" type="button" role="menuitem" data-page="${escapeHtml(value)}">
        ${escapeHtml(label)}
      </button>
    `).join("")}
  `).join("");
};

const setMenuOpen = (open, { restoreFocus = false } = {}) => {
  state.menuOpen = open;
  elements.reviewMenu.hidden = !open;
  elements.currentPageButton.setAttribute("aria-expanded", String(open));
  if (open) {
    renderMenuPages();
    requestAnimationFrame(() => elements.reviewMenu.querySelector("[role='menuitem']")?.focus());
  } else if (restoreFocus) {
    elements.currentPageButton.focus();
  }
};

const updateDeviceUi = () => {
  const fullWidthOnly = state.currentPage.split("?")[0].startsWith("design_system/");
  const activeDevice = fullWidthOnly ? "desktop" : state.device;
  elements.deviceSwitch.hidden = fullWidthOnly || state.mode === "comment";
  elements.frameShell.dataset.device = activeDevice;
  elements.deviceSwitch.querySelectorAll("[data-device]").forEach((button) => {
    const active = button.dataset.device === activeDevice;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  requestAnimationFrame(() => requestAnimationFrame(renderPins));
};

const setListFilter = (filter) => {
  state.listFilter = filter === "all" ? "all" : "open";
  elements.visibilitySwitch.querySelectorAll("[data-dock-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.dockFilter === state.listFilter);
  });
  renderPins();
  if (elements.panel.classList.contains("is-open")) renderPanel();
};

const clearAnchorHighlight = () => {
  if (state.highlightedAnchor) {
    state.highlightedAnchor.classList.remove("gtl-review-anchor-highlight");
    delete state.highlightedAnchor.dataset.gtlReviewAnchorSelected;
  }
  state.highlightedAnchor = null;
  state.highlightLocked = false;
};

const setAnchorHighlight = (element, locked = false) => {
  if (!element || element === state.highlightedAnchor && state.highlightLocked === locked) return;
  clearAnchorHighlight();
  state.highlightedAnchor = element;
  state.highlightLocked = locked;
  element.classList.add("gtl-review-anchor-highlight");
  element.dataset.gtlReviewAnchorSelected = String(locked);
};

const syncFrameCommentMode = () => {
  try {
    elements.frame.contentDocument?.documentElement.classList.toggle(
      "gtl-review-comment-mode",
      state.mode === "comment",
    );
  } catch {
    // Cross-origin frames cannot participate in review mode.
  }
};

const setMode = (mode) => {
  state.mode = mode;
  const commenting = mode === "comment";
  const retargetThread = state.threads.find((thread) => thread.id === state.retargetThreadId);
  elements.reviewDock.classList.toggle("is-commenting", commenting);
  elements.currentPageButton.hidden = commenting;
  elements.commentsButton.hidden = commenting;
  elements.deviceSwitch.hidden = commenting;
  elements.visibilitySwitch.hidden = !commenting;
  elements.modeHint.textContent = retargetThread
    ? `Change target · select a new element for Comment ${threadNumber(retargetThread)}`
    : "Comment mode · click any element to add a pin";
  elements.modeHint.hidden = !commenting;
  elements.modeButton.setAttribute("aria-label", commenting ? "Return to view mode" : "Enter comment mode");
  elements.modeButton.setAttribute("aria-pressed", String(commenting));
  if (commenting) setMenuOpen(false);
  else {
    state.retargetThreadId = null;
    clearAnchorHighlight();
    updateDeviceUi();
  }
  syncFrameCommentMode();
  renderPins();
};

const openPanel = (view, payload = null) => {
  setMenuOpen(false);
  if (view !== "draft") clearAnchorHighlight();
  state.panelView = view;
  if (view === "thread") state.activeThreadId = payload;
  if (view === "draft") state.draft = payload;
  elements.panel.classList.add("is-open");
  elements.panel.setAttribute("aria-hidden", "false");
  elements.panelBackdrop.hidden = false;
  renderPanel();
  if (view === "thread") {
    requestAnimationFrame(() => revealThreadTarget(state.threads.find((thread) => thread.id === payload)));
  }
};

const closePanel = () => {
  elements.panel.classList.remove("is-open");
  elements.panel.setAttribute("aria-hidden", "true");
  elements.panelBackdrop.hidden = true;
  state.panelView = null;
  state.activeThreadId = null;
  state.draft = null;
  clearAnchorHighlight();
  renderPins();
};

const panelHeader = (title, subtitle = "") => `
  <header class="panel-head">
    <div>
      <h2>${escapeHtml(title)}</h2>
      ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
    </div>
    <button class="panel-close" type="button" data-panel-close aria-label="Close">×</button>
  </header>
`;

const commentsForThread = (threadId) => state.comments
  .filter((comment) => comment.thread_id === threadId)
  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

const sortedPageThreads = (pagePath = state.currentPage) => state.threads
  .filter((thread) => thread.page_path === pagePath)
  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

const threadNumber = (thread) => sortedPageThreads(thread.page_path).findIndex((item) => item.id === thread.id) + 1;

const deviceForViewport = (width) => {
  if (width <= 480) return "mobile";
  if (width <= 900) return "tablet";
  return "desktop";
};

const threadPageHash = (thread) => {
  if (thread.page_hash) return thread.page_hash;
  if (!thread.page_path.startsWith("design_system/")) return "";
  const sectionId = thread.anchor_path.match(/^#([\w-]+)/)?.[1];
  return sectionId ? `#${sectionId}` : "";
};

const restoreThreadPageState = (thread, doc) => {
  const savedState = thread.page_state || {};
  let changed = false;
  (savedState.open_details || []).forEach((path) => {
    let detailsElement;
    try { detailsElement = doc.querySelector(path); } catch { detailsElement = null; }
    if (detailsElement && !detailsElement.open) {
      detailsElement.open = true;
      changed = true;
    }
  });
  (savedState.active_controls || []).forEach((path) => {
    let control;
    try { control = doc.querySelector(path); } catch { control = null; }
    if (!control) return;
    const active = control.getAttribute("aria-selected") === "true"
      || control.getAttribute("aria-pressed") === "true"
      || control.getAttribute("aria-expanded") === "true"
      || control.classList.contains("is-active");
    if (!active && typeof control.click === "function") {
      control.click();
      changed = true;
    }
  });
  return changed;
};

const revealThreadTarget = (thread, attempt = 0) => {
  if (!thread || thread.page_path !== state.currentPage) return;
  let doc;
  try { doc = elements.frame.contentDocument; } catch { return; }
  if (!doc?.body) return;

  if (attempt < 3 && restoreThreadPageState(thread, doc)) {
    setTimeout(() => revealThreadTarget(thread, attempt + 1), 80);
    return;
  }

  let anchorElement;
  try { anchorElement = doc.querySelector(thread.anchor_path); } catch { anchorElement = null; }
  if (!anchorElement) {
    showToast("The linked element is no longer present. Use Change target to reconnect it.");
    return;
  }

  const hiddenSection = anchorElement.closest("section[id][hidden]");
  if (hiddenSection && attempt < 3) {
    elements.frame.contentWindow.location.hash = `#${hiddenSection.id}`;
    setTimeout(() => revealThreadTarget(thread, attempt + 1), 80);
    return;
  }

  let detailsElement = anchorElement.closest("details");
  while (detailsElement) {
    detailsElement.open = true;
    detailsElement = detailsElement.parentElement?.closest("details");
  }
  requestAnimationFrame(() => {
    anchorElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    setAnchorHighlight(anchorElement, true);
    positionPins();
  });
};

const navigateToThread = (thread) => {
  if (!thread) return;
  state.device = deviceForViewport(thread.viewport_width);
  const targetHash = threadPageHash(thread);
  const needsNavigation = thread.page_path !== state.currentPage || targetHash !== canonicalFrameHash();
  if (needsNavigation) {
    state.pendingThreadId = thread.id;
    state.currentPage = thread.page_path;
    updateDeviceUi();
    elements.frame.src = frameUrlFor(`${thread.page_path}${targetHash}`);
    return;
  }
  updateDeviceUi();
  openPanel("thread", thread.id);
};

const startRetarget = (thread) => {
  if (!thread) return;
  closePanel();
  state.retargetThreadId = thread.id;
  setMode("comment");
  showToast("Select the element this comment should be linked to.");
};

const threadCard = (thread) => {
  const messages = commentsForThread(thread.id);
  const first = messages[0];
  return `
    <button class="thread-card" type="button" data-thread-id="${thread.id}">
      <span class="thread-card-top">
        <span class="pin-number">${threadNumber(thread)}</span>
        <span class="status">${thread.status}</span>
      </span>
      <p>${escapeHtml(first?.body || "Comment")}</p>
      <span class="thread-meta">
        <span>${escapeHtml(reviewerName(thread.created_by))}</span>
        <span>${messages.length} ${messages.length === 1 ? "message" : "messages"}</span>
      </span>
    </button>
  `;
};

const renderListPanel = () => {
  const visibleThreads = state.threads
    .filter((thread) => state.listFilter === "all" || thread.status === "open")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const groups = new Map();
  visibleThreads.forEach((thread) => {
    const existing = groups.get(thread.page_path) || [];
    existing.push(thread);
    groups.set(thread.page_path, existing);
  });

  const body = visibleThreads.length
    ? [...groups.entries()].map(([pagePath, threads]) => `
        <section class="page-group">
          <h3 class="page-group-title">${escapeHtml(pageLabel(pagePath))}</h3>
          <div class="thread-list">${threads.map(threadCard).join("")}</div>
        </section>
      `).join("")
    : `<div class="empty-state">No ${state.listFilter === "open" ? "open " : ""}comments yet.</div>`;

  elements.panelContent.innerHTML = `
    ${panelHeader("All comments", `${visibleThreads.length} ${visibleThreads.length === 1 ? "thread" : "threads"}`)}
    <div class="panel-body">
      <div class="panel-toolbar">
        <button class="filter-button ${state.listFilter === "open" ? "is-active" : ""}" type="button" data-filter="open">Open</button>
        <button class="filter-button ${state.listFilter === "all" ? "is-active" : ""}" type="button" data-filter="all">All</button>
      </div>
      ${body}
      <div class="panel-account">
        <span>${escapeHtml(reviewerName(state.user?.id))}</span>
        <button class="text-button" type="button" data-sign-out>Sign out</button>
      </div>
    </div>
  `;
};

const renderDraftPanel = () => {
  elements.panelContent.innerHTML = `
    ${panelHeader("Add comment", pageLabel(state.currentPage))}
    <form id="draftForm" class="panel-body">
      <textarea id="draftBody" class="panel-textarea" maxlength="4000" placeholder="What should change?" required autofocus></textarea>
      <div class="composer-actions">
        <button class="text-button" type="button" data-panel-close>Cancel</button>
        <button class="button button-primary" type="submit">Add comment</button>
      </div>
    </form>
  `;
  requestAnimationFrame(() => document.querySelector("#draftBody")?.focus());
};

const threadTargetLabel = (thread) => {
  if (thread.anchor_label && thread.anchor_label !== thread.anchor_path && thread.anchor_label !== "Selected element") {
    return thread.anchor_label;
  }
  if (thread.page_path === state.currentPage) {
    try {
      const anchorElement = elements.frame.contentDocument?.querySelector(thread.anchor_path);
      if (anchorElement) return elementLabel(anchorElement);
    } catch {
      // Fall back to the selector when the target cannot be inspected.
    }
  }
  return thread.anchor_path;
};

const renderThreadPanel = () => {
  const thread = state.threads.find((item) => item.id === state.activeThreadId);
  if (!thread) {
    state.panelView = "list";
    renderListPanel();
    return;
  }

  const messages = commentsForThread(thread.id);
  const statusAction = thread.status === "open" ? "Resolve" : "Reopen";
  elements.panelContent.innerHTML = `
    ${panelHeader(`Comment ${threadNumber(thread)}`, pageLabel(thread.page_path))}
    <div class="panel-body">
      <div class="thread-actions">
        <span class="status">${thread.status}</span>
        <button class="text-button is-resolve" type="button" data-toggle-status>${statusAction}</button>
      </div>
      <section class="thread-target" aria-label="Linked element">
        <span class="thread-target-label">Linked element</span>
        <strong>${escapeHtml(threadTargetLabel(thread))}</strong>
        <code title="DOM selector">${escapeHtml(thread.anchor_path)}</code>
        <div class="thread-target-actions">
          <button class="text-button" type="button" data-view-target>Show target</button>
          <button class="text-button is-resolve" type="button" data-retarget>Change target</button>
        </div>
      </section>
      <div class="messages">
        ${messages.map((message) => `
          <article class="message">
            <div class="message-head">
              <span class="message-author">${escapeHtml(reviewerName(message.author_id))}</span>
              <time class="message-time" datetime="${message.created_at}">${escapeHtml(formatTime(message.created_at))}</time>
            </div>
            <p class="message-body">${escapeHtml(message.body)}</p>
          </article>
        `).join("")}
      </div>
      <form id="replyForm" class="reply-form">
        <textarea id="replyBody" class="panel-textarea" maxlength="4000" placeholder="Reply…" required></textarea>
        <div class="composer-actions">
          <button class="button button-primary" type="submit">Reply</button>
        </div>
      </form>
    </div>
  `;
};

const renderPanel = () => {
  if (state.panelView === "draft") renderDraftPanel();
  else if (state.panelView === "thread") renderThreadPanel();
  else renderListPanel();
};

const elementPath = (start) => {
  if (!(start instanceof elements.frame.contentWindow.Element)) return "body";
  const parts = [];
  let element = start;

  while (element && !["HTML", "BODY"].includes(element.tagName)) {
    if (element.id && !element.id.startsWith("gtl-review-")) {
      parts.unshift(`#${CSS.escape(element.id)}`);
      break;
    }

    let part = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter((candidate) => candidate.tagName === element.tagName);
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(element) + 1})`;
    }
    parts.unshift(part);
    element = parent;
  }

  return parts[0]?.startsWith("#") ? parts.join(">") : `body${parts.length ? `>${parts.join(">")}` : ""}`;
};

const installPinStyles = (doc) => {
  if (doc.querySelector("#gtl-review-pin-styles")) return;
  const style = doc.createElement("style");
  style.id = "gtl-review-pin-styles";
  style.textContent = `
    #gtl-review-pin-layer {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483646 !important;
      pointer-events: none !important;
    }
    html.gtl-review-comment-mode body *:not(.gtl-review-pin) {
      cursor: crosshair !important;
    }
    .gtl-review-anchor-highlight {
      outline: 2px dashed #d7ff45 !important;
      outline-offset: 3px !important;
    }
    .gtl-review-anchor-highlight[data-gtl-review-anchor-selected="true"] {
      outline-width: 3px !important;
      outline-style: solid !important;
    }
    .gtl-review-pin {
      position: fixed !important;
      display: grid !important;
      place-items: center !important;
      min-width: 26px !important;
      height: 26px !important;
      padding: 0 7px !important;
      translate: -50% -50% !important;
      border: 2px solid #11141a !important;
      border-radius: 999px !important;
      background: #d7ff45 !important;
      color: #151900 !important;
      box-shadow: 0 3px 12px rgba(0,0,0,.34) !important;
      font: 900 11px/1 Inter, system-ui, sans-serif !important;
      cursor: pointer !important;
      pointer-events: auto !important;
    }
    .gtl-review-pin[data-resolved="true"] {
      background: #7b818d !important;
      color: white !important;
    }
    .gtl-review-pin[data-active="true"] {
      outline: 3px solid rgba(215,255,69,.36) !important;
      outline-offset: 3px !important;
    }
  `;
  doc.head.append(style);
};

const visiblePageThreads = () => sortedPageThreads()
  .filter((thread) => state.listFilter === "all" || thread.status === "open");

const positionPins = () => {
  let doc;
  try { doc = elements.frame.contentDocument; } catch { return; }
  if (!doc?.body) return;

  const layer = doc.querySelector("#gtl-review-pin-layer");
  if (!layer) return;
  const threadsById = new Map(visiblePageThreads().map((thread) => [thread.id, thread]));

  layer.querySelectorAll("[data-gtl-review-pin]").forEach((pin) => {
    const thread = threadsById.get(pin.dataset.gtlReviewPin);
    if (!thread) {
      pin.remove();
      return;
    }

    let anchorElement;
    try { anchorElement = doc.querySelector(thread.anchor_path); } catch { anchorElement = null; }
    if (!anchorElement) {
      pin.style.visibility = "hidden";
      return;
    }

    const rect = anchorElement.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      pin.style.visibility = "hidden";
      return;
    }

    pin.style.visibility = "visible";
    pin.style.left = `${rect.left + rect.width * thread.anchor_rx}px`;
    pin.style.top = `${rect.top + rect.height * thread.anchor_ry}px`;
  });
};

const observePinAnchors = (doc) => {
  const observer = state.frameResizeObserver;
  if (!observer) return;
  observer.disconnect();
  observer.observe(doc.documentElement);
  visiblePageThreads().forEach((thread) => {
    let anchorElement;
    try { anchorElement = doc.querySelector(thread.anchor_path); } catch { anchorElement = null; }
    if (anchorElement) observer.observe(anchorElement);
  });
};

const renderPins = () => {
  let doc;
  try { doc = elements.frame.contentDocument; } catch { return; }
  if (!doc?.body) return;
  installPinStyles(doc);

  let layer = doc.querySelector("#gtl-review-pin-layer");
  if (!layer) {
    layer = doc.createElement("div");
    layer.id = "gtl-review-pin-layer";
    layer.dataset.gtlReview = "true";
    doc.body.append(layer);
  }

  const existingPins = new Map(
    [...layer.querySelectorAll("[data-gtl-review-pin]")]
      .map((pin) => [pin.dataset.gtlReviewPin, pin]),
  );
  const visibleIds = new Set();

  visiblePageThreads().forEach((thread) => {
    visibleIds.add(thread.id);
    let pin = existingPins.get(thread.id);
    if (!pin) {
      pin = doc.createElement("button");
      pin.type = "button";
      pin.className = "gtl-review-pin";
      pin.dataset.gtlReviewPin = thread.id;
      layer.append(pin);
    }
    pin.dataset.resolved = String(thread.status === "resolved");
    pin.dataset.active = String(state.activeThreadId === thread.id);
    pin.textContent = String(threadNumber(thread));
    pin.setAttribute("aria-label", `Open comment ${threadNumber(thread)}`);
  });

  existingPins.forEach((pin, id) => {
    if (!visibleIds.has(id)) pin.remove();
  });

  observePinAnchors(doc);
  positionPins();
};

const handleFramePointerOver = (event) => {
  if (state.mode !== "comment" || state.highlightLocked) return;
  const target = event.target;
  if (!target?.classList || target.closest?.("#gtl-review-pin-layer, [data-gtl-review]")) {
    clearAnchorHighlight();
    return;
  }
  setAnchorHighlight(target);
};

const handleFramePointerOut = (event) => {
  if (state.highlightLocked) return;
  if (!event.relatedTarget) clearAnchorHighlight();
};

const handleFrameClick = async (event) => {
  const pin = event.target.closest?.("[data-gtl-review-pin]");
  if (pin) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (state.retargetThreadId) {
      showToast("Select a design element rather than another comment pin.");
      return;
    }
    openPanel("thread", pin.dataset.gtlReviewPin);
    return;
  }

  if (state.mode !== "comment" || event.target.closest?.("[data-gtl-review]")) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const target = event.target;
  setAnchorHighlight(target, true);
  const rect = target.getBoundingClientRect();
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  const anchorDetails = {
    page_path: canonicalFramePage(),
    page_hash: canonicalFrameHash(),
    page_state: capturePageState(target),
    anchor_path: elementPath(target),
    anchor_label: elementLabel(target),
    anchor_rx: Math.min(1, Math.max(0, (event.clientX - rect.left) / width)),
    anchor_ry: Math.min(1, Math.max(0, (event.clientY - rect.top) / height)),
    viewport_width: elements.frame.contentWindow.innerWidth,
  };

  if (state.retargetThreadId) {
    const threadId = state.retargetThreadId;
    state.retargetThreadId = null;
    const { error } = await supabase
      .from("review_threads")
      .update(anchorDetails)
      .eq("id", threadId);
    if (error) {
      state.retargetThreadId = threadId;
      showToast(error.message);
      return;
    }
    await fetchReviewData();
    setMode("browse");
    openPanel("thread", threadId);
    showToast("Comment target updated");
    return;
  }

  openPanel("draft", anchorDetails);
};

const attachFrame = () => {
  state.frameCleanup?.();
  state.currentPage = canonicalFramePage();
  renderMenuPages();
  updateDeviceUi();

  let doc;
  let frameWindow;
  try {
    doc = elements.frame.contentDocument;
    frameWindow = elements.frame.contentWindow;
  } catch {
    showToast("This page cannot be reviewed because it is not on the GTL origin.");
    return;
  }
  if (!doc?.body) return;

  let pendingPinFrame = 0;
  const schedulePins = () => {
    if (pendingPinFrame) return;
    pendingPinFrame = frameWindow.requestAnimationFrame(() => {
      pendingPinFrame = 0;
      positionPins();
    });
  };
  state.frameResizeObserver = new frameWindow.ResizeObserver(schedulePins);
  doc.addEventListener("click", handleFrameClick, true);
  doc.addEventListener("pointerover", handleFramePointerOver, true);
  doc.addEventListener("pointerout", handleFramePointerOut, true);
  doc.addEventListener("scroll", schedulePins, { capture: true, passive: true });
  frameWindow.addEventListener("scroll", schedulePins, { passive: true });
  frameWindow.addEventListener("resize", schedulePins);
  doc.fonts?.ready.then(schedulePins);
  state.frameCleanup = () => {
    if (pendingPinFrame) frameWindow.cancelAnimationFrame(pendingPinFrame);
    doc.removeEventListener("click", handleFrameClick, true);
    doc.removeEventListener("pointerover", handleFramePointerOver, true);
    doc.removeEventListener("pointerout", handleFramePointerOut, true);
    doc.removeEventListener("scroll", schedulePins, true);
    frameWindow.removeEventListener("scroll", schedulePins);
    frameWindow.removeEventListener("resize", schedulePins);
    state.frameResizeObserver?.disconnect();
    state.frameResizeObserver = null;
    clearAnchorHighlight();
  };

  renderPins();
  syncFrameCommentMode();
  if (state.pendingThreadId) {
    const pending = state.pendingThreadId;
    state.pendingThreadId = null;
    openPanel("thread", pending);
  }
};

const fetchReviewData = async () => {
  const [reviewersResult, threadsResult, commentsResult] = await Promise.all([
    supabase.from("reviewers").select("id,email,display_name,created_at").order("created_at"),
    supabase.from("review_threads").select("*").order("created_at"),
    supabase.from("review_comments").select("*").order("created_at"),
  ]);

  const error = reviewersResult.error || threadsResult.error || commentsResult.error;
  if (error) throw error;

  state.reviewers = new Map((reviewersResult.data || []).map((reviewer) => [reviewer.id, reviewer]));
  state.threads = threadsResult.data || [];
  state.comments = commentsResult.data || [];
  const openCount = state.threads.filter((thread) => thread.status === "open").length;
  elements.openCount.textContent = String(openCount);

  const current = state.reviewers.get(state.user.id);
  if (!current) throw new Error("This account is signed in but is not an invited GTL reviewer.");

  renderPins();
  if (elements.panel.classList.contains("is-open")) renderPanel();
};

const subscribeToChanges = () => {
  if (state.realtimeChannel) supabase.removeChannel(state.realtimeChannel);
  state.realtimeChannel = supabase
    .channel("gtl-review-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: "review_threads" }, fetchReviewData)
    .on("postgres_changes", { event: "*", schema: "public", table: "review_comments" }, fetchReviewData)
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") showToast("Live updates disconnected. Refresh to retry.");
    });
};

const showReview = async (user) => {
  state.user = user;
  elements.authView.hidden = true;
  elements.reviewView.hidden = false;
  try {
    await fetchReviewData();
    subscribeToChanges();
    attachFrame();
  } catch (error) {
    elements.reviewView.hidden = true;
    elements.authView.hidden = false;
    elements.authError.textContent = error.message;
    elements.authError.hidden = false;
  }
};

const showSignIn = (message = "") => {
  state.user = null;
  elements.reviewView.hidden = true;
  elements.authView.hidden = false;
  elements.authError.textContent = message;
  elements.authError.hidden = !message;
};

const showSetPassword = (user) => {
  elements.reviewView.hidden = true;
  elements.authView.hidden = false;
  const card = elements.authView.querySelector(".auth-card");
  card.innerHTML = `
    <div class="brand-mark" aria-hidden="true">G</div>
    <p class="eyebrow">Reviewer invitation</p>
    <h1>Set your password</h1>
    <p class="auth-copy">Finish setting up ${escapeHtml(user.email || "your account")}.</p>
    <form id="setPasswordForm" class="auth-form">
      <label>
        <span>New password</span>
        <input id="newPassword" type="password" autocomplete="new-password" minlength="7" required />
      </label>
      <p id="setPasswordError" class="form-error" role="alert" hidden></p>
      <button class="button button-primary" type="submit">Save and continue</button>
    </form>
  `;
  card.querySelector("#setPasswordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    const errorElement = card.querySelector("#setPasswordError");
    button.disabled = true;
    const { error } = await supabase.auth.updateUser({ password: card.querySelector("#newPassword").value });
    button.disabled = false;
    if (error) {
      errorElement.textContent = error.message;
      errorElement.hidden = false;
      return;
    }
    history.replaceState(null, "", location.pathname + location.search);
    await showReview(user);
  });
};

elements.authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  elements.authError.hidden = true;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: elements.authEmail.value.trim(),
    password: elements.authPassword.value,
  });
  button.disabled = false;
  if (error) {
    elements.authError.textContent = error.message;
    elements.authError.hidden = false;
    return;
  }
  await showReview(data.user);
});

elements.modeButton.addEventListener("click", () => setMode(state.mode === "comment" ? "browse" : "comment"));
elements.currentPageButton.addEventListener("click", () => setMenuOpen(!state.menuOpen));
elements.commentsButton.addEventListener("click", () => openPanel("list"));
elements.deviceSwitch.addEventListener("click", (event) => {
  const button = event.target.closest("[data-device]");
  if (!button) return;
  state.device = button.dataset.device;
  updateDeviceUi();
});
elements.visibilitySwitch.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dock-filter]");
  if (button) setListFilter(button.dataset.dockFilter);
});
elements.menuPages.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (!pageButton) return;
  state.pendingThreadId = null;
  state.currentPage = pageButton.dataset.page;
  updateDeviceUi();
  elements.frame.src = frameUrlFor(state.currentPage);
  setMenuOpen(false);
});
elements.reviewMenu.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const items = [...elements.reviewMenu.querySelectorAll("[role='menuitem']")];
  if (!items.length) return;
  event.preventDefault();
  const currentIndex = items.indexOf(document.activeElement);
  let nextIndex;
  if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = items.length - 1;
  else if (event.key === "ArrowDown") nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
  else nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
  items[nextIndex].focus();
});
elements.panelBackdrop.addEventListener("click", closePanel);

elements.frame.addEventListener("load", attachFrame);

document.addEventListener("pointerdown", (event) => {
  if (state.menuOpen && !event.target.closest("#pageMenuWrap")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (state.menuOpen) {
    setMenuOpen(false, { restoreFocus: true });
  } else if (elements.panel.classList.contains("is-open")) {
    closePanel();
  } else if (state.mode === "comment") {
    setMode("browse");
  }
});

elements.panelContent.addEventListener("click", async (event) => {
  if (event.target.closest("[data-panel-close]")) {
    closePanel();
    return;
  }

  if (event.target.closest("[data-sign-out]")) {
    await supabase.auth.signOut();
    location.reload();
    return;
  }

  const filter = event.target.closest("[data-filter]");
  if (filter) {
    setListFilter(filter.dataset.filter);
    return;
  }

  const threadButton = event.target.closest("[data-thread-id]");
  if (threadButton) {
    const thread = state.threads.find((item) => item.id === threadButton.dataset.threadId);
    navigateToThread(thread);
    return;
  }

  if (event.target.closest("[data-view-target]")) {
    const thread = state.threads.find((item) => item.id === state.activeThreadId);
    revealThreadTarget(thread);
    return;
  }

  if (event.target.closest("[data-retarget]")) {
    const thread = state.threads.find((item) => item.id === state.activeThreadId);
    startRetarget(thread);
    return;
  }

  if (event.target.closest("[data-toggle-status]")) {
    const thread = state.threads.find((item) => item.id === state.activeThreadId);
    if (!thread) return;
    const resolving = thread.status === "open";
    const { error } = await supabase
      .from("review_threads")
      .update({
        status: resolving ? "resolved" : "open",
        resolved_by: resolving ? state.user.id : null,
        resolved_at: resolving ? new Date().toISOString() : null,
      })
      .eq("id", thread.id);
    if (error) showToast(error.message);
    else {
      await fetchReviewData();
      showToast(resolving ? "Comment resolved" : "Comment reopened");
    }
  }
});

elements.panelContent.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;

  if (event.target.id === "draftForm") {
    const body = event.target.querySelector("#draftBody").value.trim();
    const draft = state.draft;
    if (!body || !draft) { button.disabled = false; return; }
    const { data, error } = await supabase.rpc("create_review_thread", {
      p_page_path: draft.page_path,
      p_anchor_path: draft.anchor_path,
      p_anchor_rx: draft.anchor_rx,
      p_anchor_ry: draft.anchor_ry,
      p_viewport_width: draft.viewport_width,
      p_body: body,
      p_page_hash: draft.page_hash,
      p_anchor_label: draft.anchor_label,
      p_page_state: draft.page_state,
    });
    button.disabled = false;
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchReviewData();
    openPanel("thread", data);
    showToast("Comment added");
    return;
  }

  if (event.target.id === "replyForm") {
    const body = event.target.querySelector("#replyBody").value.trim();
    if (!body) { button.disabled = false; return; }
    const { error } = await supabase.from("review_comments").insert({
      thread_id: state.activeThreadId,
      author_id: state.user.id,
      body,
    });
    button.disabled = false;
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchReviewData();
    renderThreadPanel();
    showToast("Reply added");
  }
});

const inviteArrival = new URLSearchParams(location.hash.replace(/^#/, "")).get("type");
const { data: { session }, error: sessionError } = await supabase.auth.getSession();

if (sessionError) showSignIn(sessionError.message);
else if (session?.user && ["invite", "recovery"].includes(inviteArrival)) showSetPassword(session.user);
else if (session?.user) await showReview(session.user);
else showSignIn();
