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
const pageTabs = document.querySelectorAll("[data-page-tab]");
const pageFrames = document.querySelectorAll("[data-page-frame]");
const pageFrameCards = document.querySelectorAll("[data-page-frame-card]");
const pageFrameLabels = document.querySelectorAll("[data-page-frame-label]");
const pageTitle = document.querySelector("[data-page-title]");
const pageFrameOpenLinks = document.querySelectorAll("[data-page-frame-open]");
const pagePreview = document.querySelector("[data-page-preview]");
const pageZoomButtons = document.querySelectorAll("[data-page-zoom]");
const pageZoomValue = document.querySelector("[data-page-zoom='reset']");
const flatDeviceTabs = document.querySelectorAll("[data-flat-device]");
const flatLayContent = document.querySelector("[data-flat-lay-content]");
let pageZoom = 1;

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

const flatDocs = {
  auth: {
    title: "Authentication Screens",
    description: "Full states for sign-in, account creation, recovery, verification, and auth feedback.",
    groups: [
      { title: "Default states", frames: [
        { label: "Sign in", type: "auth", mode: "signin" },
        { label: "Create account", type: "auth", mode: "register" },
        { label: "Forgot password", type: "auth", mode: "forgot" },
        { label: "Reset password", type: "auth", mode: "reset" },
        { label: "Email verification", type: "auth", mode: "verify" },
      ] },
      { title: "Feedback states", frames: [
        { label: "Loading state", type: "auth", mode: "loading" },
        { label: "Error state", type: "auth", mode: "error" },
      ] },
    ],
  },
  home: {
    title: "Home Page",
    description: "Homepage variants for guest, signed-in, market availability, position context, and failure states.",
    groups: [
      { title: "Default states", frames: [
        { label: "Logged out default", type: "home", mode: "guest" },
        { label: "Logged in default", type: "home", mode: "logged" },
        { label: "No live games", type: "home", mode: "noLive" },
        { label: "With live games", type: "home", mode: "live" },
        { label: "With open positions", type: "home", mode: "positions" },
      ] },
      { title: "System states", frames: [
        { label: "Loading state", type: "home", mode: "loading" },
        { label: "Error / empty state", type: "home", mode: "error" },
      ] },
    ],
  },
  game: {
    title: "Game Page",
    description: "Game detail page variants covering live market access, unavailable markets, position context, refresh, and errors.",
    groups: [
      { title: "Default states", frames: [
        { label: "Live game default", type: "game", mode: "live" },
        { label: "Pregame unavailable", type: "game", mode: "pregame" },
        { label: "Betting paused after score change", type: "game", mode: "paused" },
        { label: "No position", type: "game", mode: "none" },
      ] },
      { title: "Trading states", frames: [
        { label: "With open position", type: "game", mode: "position" },
        { label: "With pending order", type: "game", mode: "pending" },
        { label: "Stale price / data refresh state", type: "game", mode: "stale" },
        { label: "Error state", type: "game", mode: "error" },
      ] },
    ],
  },
  drawer: {
    title: "Buy / Sell Drawer",
    description: "Bottom-sheet states for market orders, limit orders, validation, confirmation, and outcomes.",
    groups: [
      { title: "Order entry", frames: [
        { label: "Buy market order", type: "drawer", mode: "buyMarket" },
        { label: "Buy limit order", type: "drawer", mode: "buyLimit" },
        { label: "Sell market order", type: "drawer", mode: "sellMarket" },
        { label: "Sell limit order", type: "drawer", mode: "sellLimit" },
      ] },
      { title: "Feedback states", frames: [
        { label: "Insufficient balance", type: "drawer", mode: "balance" },
        { label: "Invalid limit price", type: "drawer", mode: "invalid" },
        { label: "Pending limit order confirmation", type: "drawer", mode: "pending" },
        { label: "Success state", type: "drawer", mode: "success" },
        { label: "Error state", type: "drawer", mode: "error" },
      ] },
    ],
  },
  tracker: {
    title: "Tracker / Positions",
    description: "Portfolio tracking states for open exposure, win/loss context, conflicts, sell preview, and feedback.",
    groups: [
      { title: "Position states", frames: [
        { label: "No open positions", type: "tracker", mode: "empty" },
        { label: "With open positions", type: "tracker", mode: "open" },
        { label: "Winning position", type: "tracker", mode: "winning" },
        { label: "Losing position", type: "tracker", mode: "losing" },
        { label: "Conflicting positions", type: "tracker", mode: "conflict" },
        { label: "Sell preview", type: "tracker", mode: "sell" },
      ] },
      { title: "System states", frames: [
        { label: "Loading state", type: "tracker", mode: "loading" },
        { label: "Error state", type: "tracker", mode: "error" },
      ] },
    ],
  },
  pending: {
    title: "Pending Orders",
    description: "Pending order states for empty, active buy/sell orders, editing, cancellation, filled orders, and errors.",
    groups: [
      { title: "Order states", frames: [
        { label: "No pending orders", type: "pending", mode: "empty" },
        { label: "With pending buy order", type: "pending", mode: "buy" },
        { label: "With pending sell order", type: "pending", mode: "sell" },
        { label: "Edit limit price", type: "pending", mode: "edit" },
        { label: "Cancel confirmation", type: "pending", mode: "cancel" },
        { label: "Order filled state", type: "pending", mode: "filled" },
        { label: "Error state", type: "pending", mode: "error" },
      ] },
    ],
  },
  account: {
    title: "Settled / Account",
    description: "Account and history views covering settled activity, profile, credits, loading, and errors.",
    groups: [
      { title: "History and account states", frames: [
        { label: "Settled empty state", type: "account", mode: "settledEmpty" },
        { label: "Settled history", type: "account", mode: "settled" },
        { label: "Account overview", type: "account", mode: "overview" },
        { label: "Profile", type: "account", mode: "profile" },
        { label: "Credits / balance", type: "account", mode: "credits" },
        { label: "Loading state", type: "account", mode: "loading" },
        { label: "Error state", type: "account", mode: "error" },
      ] },
    ],
  },
};

const teamLogos = {
  buf: "../gtl-app/assets/logos/nfl-buf.png",
  mia: "../gtl-app/assets/logos/nfl-mia.png",
  kc: "../gtl-app/assets/logos/nfl-kc.png",
  sf: "../gtl-app/assets/logos/nfl-sf.png",
  bos: "../gtl-app/assets/logos/nba-bos.png",
  ny: "../gtl-app/assets/logos/nba-ny.png",
};

function logoPair(a = "buf", b = "mia") {
  return `<span class="flat-logo-pair"><img src="${teamLogos[a]}" alt=""><img src="${teamLogos[b]}" alt=""></span>`;
}

function flatHeader(label = "GTL", chip = "Live") {
  return `<div class="flat-mini-header"><span class="flat-brand">${label}</span><span class="flat-chip">${chip}</span></div>`;
}

function flatNav(active = "Home") {
  return `<div class="flat-bottom-nav"><span>${active === "Home" ? "Home" : "Home"}</span><span>${active === "Orders" ? "Orders" : "Markets"}</span><span>${active === "Account" ? "Account" : "Wallet"}</span></div>`;
}

function flatGameTile(paused = false) {
  return `<div class="flat-game-tile" style="--home-color:#00338d;--away-color:#008e97">
    <div class="flat-score-row">
      <span class="flat-team"><img src="${teamLogos.buf}" alt=""><strong>BUF</strong></span>
      <span class="flat-score">24 - 20</span>
      <span class="flat-team"><img src="${teamLogos.mia}" alt=""><strong>MIA</strong></span>
    </div>
    ${paused ? `<div class="flat-status loading" style="min-height:64px"><strong>Trading paused</strong><span>Repricing markets after score change.</span></div>` : flatMarkets()}
  </div>`;
}

function flatMarkets(disabled = false) {
  const yes = disabled ? "--" : "64c";
  const no = disabled ? "--" : "36c";
  return `<div class="flat-market-grid">
    <div class="flat-market-row"><span>GTL</span><b class="flat-price yes">${yes}</b><b class="flat-price no">${no}</b></div>
    <div class="flat-market-row"><span>TIE</span><b class="flat-price yes">${disabled ? "--" : "18c"}</b><b class="flat-price no">${disabled ? "--" : "82c"}</b></div>
    <div class="flat-market-row"><span>KTL</span><b class="flat-price yes">${disabled ? "--" : "71c"}</b><b class="flat-price no">${disabled ? "--" : "29c"}</b></div>
  </div>`;
}

function flatRows(count = 3, variant = "neutral") {
  const rows = [
    { a: "BUF vs MIA", b: "GTL YES - 120 contracts", c: "$76.80", d: "+$19.20", logo: ["buf", "mia"], cls: "flat-up" },
    { a: "KC vs SF", b: "Tie NO - pending", c: "$44.00", d: "22c limit", logo: ["kc", "sf"], cls: "" },
    { a: "BOS vs NYK", b: "KTL YES - settled", c: "$54.10", d: "Won", logo: ["bos", "ny"], cls: "flat-up" },
    { a: "KC vs SF", b: "GTL NO - 80 contracts", c: "$32.00", d: "-$12.40", logo: ["kc", "sf"], cls: "flat-down" },
  ];
  return rows.slice(0, count).map((row, index) => `<div class="flat-row">
    ${logoPair(row.logo[0], row.logo[1])}
    <span class="flat-row-main"><strong>${variant === "pending" ? (index % 2 ? "Pending sell" : "Pending buy") : row.a}</strong><span>${row.b}</span></span>
    <span class="flat-row-side"><strong>${row.c}</strong><span class="${row.cls}">${row.d}</span></span>
  </div>`).join("");
}

function flatStatus(kind, title, copy) {
  return `<div class="flat-status ${kind}"><strong>${title}</strong><span>${copy}</span></div>`;
}

function flatLoading() {
  return `<div class="flat-card"><div class="flat-skeleton"></div><div class="flat-skeleton"></div><div class="flat-skeleton short"></div></div>
    <div class="flat-card"><div class="flat-skeleton"></div><div class="flat-skeleton short"></div></div>`;
}

const googleMark = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5.04 5.04 0 0 1-2.18 3.31v2.75h3.53c2.07-1.9 3.25-4.71 3.25-7.9z"/><path fill="#34A853" d="M12 23c2.94 0 5.4-.97 7.2-2.63l-3.52-2.75c-.98.66-2.23 1.05-3.68 1.05-2.83 0-5.23-1.91-6.08-4.48H2.28v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.92 14.19a6.6 6.6 0 0 1 0-4.38V6.97H2.28a11 11 0 0 0 0 10.06l3.64-2.84z"/><path fill="#EA4335" d="M12 5.13c1.6 0 3.03.55 4.16 1.62l3.12-3.12A10.98 10.98 0 0 0 12 1 10.99 10.99 0 0 0 2.28 6.97l3.64 2.84C6.77 7.04 9.17 5.13 12 5.13z"/></svg>`;
const appleMark = `<svg class="apple-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.05 12.66c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.15-.47 7.82 1.3 10.38.86 1.25 1.89 2.66 3.24 2.61 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.28-1.28 3.13-2.54.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.72-1.04-2.46-4.6zM14.6 5.1c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.56-.66.76-1.24 1.99-1.09 3.16 1.15.09 2.32-.58 3.04-1.44z"/></svg>`;
const closeIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const backIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const showIcon = `<svg class="icon-show" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>`;
const sentIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function authShell(inner, cardClass = "") {
  return `<div class="flat-screen is-auth">
    <main class="auth-main">
      <div class="auth-card ${cardClass}">
        <span class="auth-close" aria-hidden="true">${closeIcon}</span>
        ${inner}
      </div>
    </main>
  </div>`;
}

function authHead(eyebrow, title, copy) {
  return `<div class="auth-head"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${copy}</p></div>`;
}

function socialRow() {
  return `<div class="social-row">
    <button class="social-btn" type="button" tabindex="-1">${googleMark}Continue with Google</button>
    <button class="social-btn" type="button" tabindex="-1">${appleMark}Continue with Apple</button>
  </div>`;
}

function field(label, placeholder, options = {}) {
  const type = options.type || "text";
  const id = `flat-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const errorClass = options.error ? " is-error" : "";
  if (options.passwordToggle) {
    return `<div class="field"><label for="${id}">${label}</label><div class="field-pass"><input class="field-input${errorClass}" id="${id}" type="${type}" placeholder="${placeholder}" value="${options.value || ""}" tabindex="-1" readonly><button class="pass-toggle" type="button" tabindex="-1" aria-hidden="true">${showIcon}</button></div>${options.hint ? `<span class="field-hint">${options.hint}</span>` : ""}${options.error ? `<p class="field-error">${options.error}</p>` : ""}</div>`;
  }
  return `<div class="field"><label for="${id}">${label}</label><input class="field-input${errorClass}" id="${id}" type="${type}" placeholder="${placeholder}" value="${options.value || ""}" tabindex="-1" readonly>${options.hint ? `<span class="field-hint">${options.hint}</span>` : ""}${options.error ? `<p class="field-error">${options.error}</p>` : ""}</div>`;
}

function authFoot(copy, action) {
  return `<p class="auth-foot">${copy} <span>${action}</span></p>`;
}

function renderAuthFrame(mode) {
  if (mode === "register") {
    return authShell(`<div class="auth-progress" aria-hidden="true"><span class="is-done"></span><span></span><span></span></div>
      <div class="auth-steps" data-step="1"><div class="auth-step" data-step="1">
        ${authHead("Step 1 of 3", "Create your account", "Start trading the live games in under a minute.")}
        ${socialRow()}<div class="auth-divider">or</div>
        <div class="auth-form">${field("Email", "you@email.com", { type: "email" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue</button></div>
        <p class="auth-fineprint">By continuing you agree to GTL's <span>Terms</span> and <span>Privacy Policy</span>. 21+ only.</p>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "reset") {
    return authShell(`<div class="auth-progress" aria-hidden="true"><span class="is-done"></span><span class="is-done"></span><span></span></div>
      <div class="auth-steps" data-step="2"><div class="auth-step" data-step="2">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("Step 2 of 3", "Create a password", "Keep your account secure with a strong password.")}
        <div class="auth-form">${field("Password", "At least 8 characters", { type: "password", passwordToggle: true, hint: "Use 8+ characters with a mix of letters and numbers." })}${field("Confirm password", "Re-enter your password", { type: "password" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue</button></div>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "verify") {
    return authShell(`<div class="auth-progress" aria-hidden="true"><span class="is-done"></span><span class="is-done"></span><span class="is-done"></span></div>
      <div class="auth-steps" data-step="3"><div class="auth-step" data-step="3">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("Step 3 of 3", "Verify it's you", `We sent a 6-digit code to <span class="code-sent-to">alex@gtl.test</span>.`)}
        <div class="auth-form"><div class="code-input"><input class="code-box is-filled" type="text" value="4" tabindex="-1" readonly><input class="code-box is-filled" type="text" value="8" tabindex="-1" readonly><input class="code-box is-filled" type="text" value="2" tabindex="-1" readonly><span class="code-dash" aria-hidden="true"></span><input class="code-box" type="text" tabindex="-1" readonly><input class="code-box" type="text" tabindex="-1" readonly><input class="code-box" type="text" tabindex="-1" readonly></div><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Create Account</button></div>
        <p class="code-resend">Didn't get a code? <span>Resend</span></p>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "forgot") {
    return authShell(`<span class="step-back">${backIcon}Back</span>
      ${authHead("Reset password", "Forgot your password?", "Enter your email and we'll send you a link to reset it.")}
      <div class="auth-form">${field("Email", "you@email.com", { type: "email" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Send Reset Link</button></div>
      <div class="auth-sent"><div class="sent-check">${sentIcon}</div><h1>Check your email</h1><p>We've sent a reset link to <span class="code-sent-to">alex@gtl.test</span>. It expires in 30 minutes.</p><span class="btn btn-secondary auth-submit">Back to Login</span><p class="code-resend">Didn't get it? <span>Resend Link</span></p></div>
      ${authFoot("Remembered it?", "Login")}`);
  }
  const isError = mode === "error";
  const isLoading = mode === "loading";
  return authShell(`${authHead("Welcome back", "Login to GTL", "Pick up where you left off and trade the live games.")}
    ${socialRow()}<div class="auth-divider">or</div>
    <div class="auth-form">${field("Email", "you@email.com", { type: "email", value: isError ? "sam" : "", error: isError ? "Enter a valid email address." : "" })}${field("Password", "Your password", { type: "password", passwordToggle: true })}<div class="field-row"><span></span><span class="link-green">Forgot Password?</span></div><button class="btn btn-primary auth-submit" type="button" tabindex="-1">${isLoading ? "Processing..." : "Login"}</button></div>
    ${authFoot("New to GTL?", "Create an Account")}`);
}

const logoSvg = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5 20 18H4Z"/></svg>`;
const chevronDown = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const homeGames = [
  {
    id: "buf-mia",
    league: "nfl",
    period: "Q3",
    clock: "11:05",
    paused: { message: "Trading paused. Recalculating markets.", clears: true },
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: teamLogos.buf },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: teamLogos.mia },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 58, no: 42 } },
  },
  {
    id: "kc-sf",
    league: "nfl",
    period: "Q2",
    clock: "08:42",
    home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: teamLogos.kc },
    away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: teamLogos.sf },
    markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 64, no: 36 } },
  },
  {
    id: "dal-phi",
    league: "nfl",
    period: "Q1",
    clock: "12:44",
    paused: { message: "Markets open when a team takes the lead.", clears: false },
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: "../gtl-app/assets/logos/nfl-dal.png" },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: "../gtl-app/assets/logos/nfl-phi.png" },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 64, no: 36 }, ktl: { yes: 50, no: 50 } },
  },
];

function homeHeader(authed = false, positions = false) {
  return `<header class="site-header ds-static-header">
    <div class="header-row">
      <div class="header-left">
        <span class="brand-pill">
          <span class="brand floating-logo floating-btn brand-link"><span class="brand-mark">${logoSvg}</span><span class="brand-word">GTL Markets</span></span>
          <span class="brand floating-logo floating-btn brand-menu"><span class="brand-mark">${logoSvg}</span><span class="brand-word">GTL</span></span>
          <span class="header-nav-slot"><nav class="header-nav" aria-label="Primary navigation"><span>Home</span><span>Live Games</span><span>How it Works</span>${authed ? "<span>Portfolio</span><span class=\"header-nav-sep\"></span><button class=\"header-nav-logout\" type=\"button\">Logout</button>" : ""}</nav></span>
        </span>
        <span class="theme-switch floating-btn"><span class="theme-switch-track"><span class="theme-switch-thumb"></span><span class="theme-option theme-sun">☼</span><span class="theme-option theme-moon">☾</span></span></span>
      </div>
      <div class="header-right">${authed ? `<span class="header-wallet"><span class="wallet-chip floating-btn"><svg class="wallet-ico" viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 8v9a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M20 8v4h-4a2 2 0 0 1 0-4h4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="wallet-amount tnum">$240.50</span></span></span>${positions ? `<span class="header-positions"><span class="hpos-trigger"><span class="hpos-word">Open Positions</span><span class="hpos-num tnum">3</span><span class="hpos-close">${closeIcon}</span></span></span>` : ""}` : `<span class="header-auth"><span class="btn header-login floating-btn">Login</span></span>`}</div>
    </div>
  </header>`;
}

function homeTeamBlock(g, side) {
  const lead = g.home.score === g.away.score ? null : g.home.score > g.away.score ? "home" : "away";
  const t = g[side];
  return `<div class="team team-${side}${lead === side ? " is-leading" : ""}"><img class="team-logo" src="${t.logo}" alt="${t.name}"><div class="team-meta"><span class="team-abbr">${t.abbr}</span><span class="team-score tnum">${t.score}</span></div></div>`;
}

function homeGameMedia(g, center = `<span class="period">${g.period}</span><span class="clock tnum">${g.clock}</span>`) {
  return `<div class="game-row">${homeTeamBlock(g, "home")}<div class="game-center">${center}</div>${homeTeamBlock(g, "away")}</div>`;
}

function homeBetPanel(g) {
  const row = (label, sub, key) => `<div class="mkt-row"><span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span><button class="price yes" type="button" tabindex="-1">${g.markets[key].yes}¢</button><button class="price no" type="button" tabindex="-1">${g.markets[key].no}¢</button></div>`;
  return `<div class="mkt-grid"><div class="mkt-head"><span class="col-market">Markets</span><span class="col-yes">Yes</span><span class="col-no">No</span></div>${row("GTL", "Get the Lead", "gtl")}${row("TIE", "", "tie")}${row("KTL", "Keep the Lead", "ktl")}</div><span class="view-game">View Game</span>`;
}

function homeGameTile(g, open = false) {
  return `<article class="game-tile${g.paused ? " is-paused" : ""}${open ? " is-open" : ""}" data-league="${g.league}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="tile-main">${homeGameMedia(g)}</div>
    <div class="tile-foot">${g.paused ? `<div class="trade-pause"><span class="pause-dot"></span><span>${g.paused.message}</span></div>` : ""}<button class="foot-toggle" type="button" tabindex="-1"><span class="chev">${chevronDown}</span><span class="toggle-label">${open ? "Hide Bets" : "See Bets"}</span><span class="chev">${chevronDown}</span></button><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${homeBetPanel(g)}</div></div></div></div>
  </article>`;
}

function homeLeagueStrip(active = "nfl") {
  return `<div class="league-strip" role="tablist" aria-label="Filter by league">
    <button class="league-pill${active === "nfl" ? " is-active" : ""}" type="button" tabindex="-1"><span class="league-icon"><img src="../gtl-app/assets/logos/league-nfl.png" alt=""></span><span class="league-label">NFL</span></button>
    <button class="league-pill${active === "nba" ? " is-active" : ""}" type="button" tabindex="-1"><span class="league-icon"><img src="../gtl-app/assets/logos/league-nba.png" alt=""></span><span class="league-label">NBA</span></button>
  </div>`;
}

function homeHero(mode) {
  if (mode === "logged" || mode === "positions") {
    return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner authed"><div class="hero-greeting"><span class="eyebrow">Welcome back</span><h1>Welcome back, Alex.</h1></div>${mode === "positions" ? homePositionsBlock() : homeEmptyPositions()}<span class="btn btn-primary authed-cta">Live Games</span></div></section>`;
  }
  return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner"><div class="hero-trading"><span class="live-dot"></span><span class="tnum">3,247</span> trading right now</div><h1 class="hero-title">Trade the moments that move the game.</h1><p class="hero-sub">Back the lead on live NFL &amp; NBA. Buy and sell in seconds, as the game turns.</p><div class="hero-cta"><span class="btn btn-primary btn-lg">Live Games</span><span class="btn btn-glass btn-lg">Create Account</span></div></div></section>`;
}

function homePositionsBlock() {
  return `<div class="authed-stack"><div class="positions-block"><div class="positions-head"><span class="eyebrow">Open Positions</span></div><div class="pos-carousel">${homePositionCard("a")}${homePositionCard("c")}${homePositionCard("b")}</div><div class="pos-footer"><span>View All</span><div class="pos-dots"><button class="pos-dot is-active" type="button" tabindex="-1"></button><button class="pos-dot" type="button" tabindex="-1"></button><button class="pos-dot" type="button" tabindex="-1"></button></div><span>View Settled</span></div></div></div>`;
}

function homeEmptyPositions() {
  return `<div class="authed-stack"><div class="coming-soon authed-empty-positions"><h3 class="cs-title">No open positions yet</h3><p class="cs-desc">Live markets you enter will appear here, along with quick access to buy more, sell, or review settled results.</p><div class="pos-footer no-scroll"><span>View All</span><span>View Settled</span></div></div></div>`;
}

function homePositionCard(variant) {
  const g = variant === "b" ? homeGames[1] : homeGames[0];
  const style = `--home-color:${g.home.color};--away-color:${g.away.color}`;
  const actions = `<div class="oc-actions"><button class="oc-buy" type="button" tabindex="-1">Buy More</button><button class="oc-sell" type="button" tabindex="-1">Sell</button></div>`;
  if (variant === "c") {
    return `<article class="pos-card pos-card--c" style="${style}"><div class="pos-media">${homeGameMedia(g, `<span class="period qtime">3 Quarter Time</span>`)}</div><div class="pos-info occ"><div class="occ-total tnum">$76.80</div><div class="occ-bar up"><span class="occ-bar-center"></span><span class="occ-bar-fill up" style="left:50%;width:25%"></span></div><div class="occ-bottom"><span class="oc-tag occ-type">Get the Lead · <span class="side-yes">YES</span></span><span class="occ-change up tnum">+$19.20</span></div>${actions}</div></article>`;
  }
  if (variant === "b") {
    return `<article class="pos-card pos-card--b" style="${style}"><div class="pos-media">${homeGameMedia(g)}</div><div class="pos-info"><div class="ocb-type">Keep the Lead · <span class="side-no">NO</span></div><div class="ocb-stats"><div class="ocb-stat"><span class="ocb-k">Contracts</span><span class="ocb-v tnum">80</span></div><div class="ocb-stat"><span class="ocb-k">Value</span><span class="ocb-v tnum">$44.00</span></div><div class="ocb-stat"><span class="ocb-k">Return</span><span class="ocb-v tnum oc-pnl down">-$4.80</span></div></div>${actions}</div></article>`;
  }
  return `<article class="pos-card pos-card--a" style="${style}"><div class="pos-media">${homeGameMedia(g)}</div><div class="pos-info"><div class="oc-summary"><div class="oc-row"><span class="oc-tag">Get the Lead</span><span class="oc-vr-head">Value &amp; Return</span></div><div class="oc-row"><span class="oc-sub"><span class="side-yes">YES</span> · 120 contracts</span><span class="oc-figures"><span class="tnum">$76.80</span> · <span class="oc-pnl up tnum">+$19.20</span></span></div></div>${actions}</div></article>`;
}

function homeLiveSection(mode) {
  let content = `<div class="game-grid">${homeGames.map((g, i) => homeGameTile(g, i === 1)).join("")}</div>`;
  if (mode === "noLive") content = `<div class="coming-soon"><img class="cs-logo" src="../gtl-app/assets/logos/league-nfl.png" alt=""><h3 class="cs-title">No live games right now</h3><p class="cs-desc">Upcoming markets will appear here before kickoff.</p></div>`;
  if (mode === "loading") content = `<div class="game-grid"><article class="game-tile ds-home-skeleton"></article><article class="game-tile ds-home-skeleton"></article><article class="game-tile ds-home-skeleton"></article></div>`;
  if (mode === "error") content = `<div class="coming-soon"><h3 class="cs-title">Unable to load markets</h3><p class="cs-desc">Refresh the page or try again later.</p><div class="cs-actions"><span class="btn btn-secondary">Try again</span></div></div>`;
  return `<section class="section live"><div class="container"><div class="section-head center"><span class="eyebrow">On now</span><h2>Live games</h2></div>${homeLeagueStrip()}${content}</div></section>`;
}

function homeHowSection() {
  const steps = [
    ["01", "Pick a market", "Choose a live game and one of three lead markets."],
    ["02", "View the order book", "See live Yes / No prices and where the market sits."],
    ["03", "Buy", "Take a position at the live price in a single tap."],
    ["04", "Cash Out or Settle", "Cash out early or let it settle when the moment lands."],
  ];
  return `<section class="section how"><div class="container"><div class="section-head center"><span class="eyebrow">How it works</span><h2>Four taps from watching to trading.</h2></div><ol class="flow">${steps.map(([n, title, copy]) => `<li class="flow-step"><div class="flow-marker">${logoSvg}</div><span class="flow-num">${n}</span><h3 class="flow-title">${title}</h3><p class="flow-text">${copy}</p></li>`).join("")}</ol></div></section>`;
}

function homeFooter() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><span class="brand"><span class="brand-mark">${logoSvg}</span><span class="brand-word">GTL</span></span><p class="footer-blurb">Get the Lead. The fastest way to trade the moments that move live NFL and NBA games.</p></div><div class="footer-cols"><div class="footer-col"><h4>Product</h4><span>Live games</span><span>How it works</span><span>Tutorial</span></div><div class="footer-col"><h4>Company</h4><span>About</span><span>Careers</span><span>Contact</span></div><div class="footer-col"><h4>Legal</h4><span>Terms</span><span>Privacy</span><span>Responsible play</span></div></div></div><div class="footer-base"><span>© 2026 GTL Markets</span><span>21+. Please play responsibly.</span></div></div></footer>`;
}

function renderHomeFrame(mode) {
  const authed = mode === "logged" || mode === "positions";
  return `<div class="flat-screen is-home">${homeHeader(authed, mode === "positions")}${homeHero(mode)}${homeLiveSection(mode)}${homeHowSection()}${homeFooter()}</div>`;
}

function renderGameFrame(mode) {
  let banner = "";
  let markets = flatMarkets(mode === "pregame");
  if (mode === "paused" || mode === "stale") banner = flatStatus("loading", mode === "stale" ? "Refreshing prices" : "Trading paused", mode === "stale" ? "Latest market data is being checked." : "Recalculating markets after score change.");
  if (mode === "error") return `<div class="flat-screen">${flatHeader("GTL", "Game")}${flatStatus("error", "Game unavailable", "Live data could not be loaded.")}${flatNav("Orders")}</div>`;
  const extra = {
    none: flatStatus("empty", "No position in this game", "Choose a market to enter."),
    position: `<div class="flat-list">${flatRows(1)}</div>`,
    pending: `<div class="flat-list">${flatRows(1, "pending")}</div>`,
  }[mode] || "";
  return `<div class="flat-screen">${flatHeader("GTL", mode === "pregame" ? "Pregame" : "Q3 11:05")}
    <div class="flat-game-tile" style="--home-color:#00338d;--away-color:#008e97"><div class="flat-score-row"><span class="flat-team"><img src="${teamLogos.buf}" alt=""><strong>BUF</strong></span><span class="flat-score">${mode === "pregame" ? "0 - 0" : "24 - 20"}</span><span class="flat-team"><img src="${teamLogos.mia}" alt=""><strong>MIA</strong></span></div></div>
    ${banner}${markets}${extra}<div class="flat-card"><h3>Inside the game</h3><p>Lead changes, volume, and order flow.</p></div>${flatNav("Orders")}</div>`;
}

function renderDrawerFrame(mode) {
  const sell = mode.startsWith("sell");
  const limit = mode.toLowerCase().includes("limit") || mode === "invalid" || mode === "pending";
  const error = mode === "balance" || mode === "invalid" || mode === "error";
  const success = mode === "success";
  if (success) {
    return `<div class="flat-screen is-drawer"><div class="flat-drawer"><div class="flat-drawer-handle"></div>${flatStatus("empty", "Order placed", "You are in the game.")}<div class="flat-primary">Done</div></div></div>`;
  }
  return `<div class="flat-screen is-drawer"><div class="flat-drawer"><div class="flat-drawer-handle"></div>
    <h3>${sell ? "Sell position" : "Buy contract"}</h3><p class="flat-copy">BUF vs MIA - Get the Lead ${sell ? "YES" : "YES"}</p>
    <div class="flat-btn-row"><span class="flat-price yes">Yes 64c</span><span class="flat-price no">No 36c</span></div>
    <div class="flat-field">${sell ? "Contracts to sell: 60" : "Contracts: 100"}</div>
    ${limit ? `<div class="flat-field ${mode === "invalid" ? "is-error" : ""}">Limit price: ${mode === "invalid" ? "104c" : "52c"}</div>` : ""}
    ${mode === "pending" ? flatStatus("loading", "Limit order pending", "Waiting for the market to reach 52c.") : ""}
    ${error ? flatStatus("error", mode === "balance" ? "Insufficient balance" : mode === "invalid" ? "Invalid limit price" : "Order failed", mode === "balance" ? "Add funds before placing this bet." : "Check the order and try again.") : ""}
    <div class="flat-summary"><div><span>Subtotal</span><strong>$64.00</strong></div><div><span>Fee</span><strong>$1.28</strong></div><div><span>Total</span><strong>$65.28</strong></div></div>
    <div class="flat-primary">${sell ? "Sell" : limit ? "Place Limit" : "Quick Bet"}</div>
  </div></div>`;
}

function renderTrackerFrame(mode) {
  if (mode === "loading") return `<div class="flat-screen">${flatHeader("GTL", "Portfolio")}${flatLoading()}${flatNav("Orders")}</div>`;
  if (mode === "error") return `<div class="flat-screen">${flatHeader("GTL", "Portfolio")}${flatStatus("error", "Positions unavailable", "Could not load open exposure.")}${flatNav("Orders")}</div>`;
  if (mode === "empty") return `<div class="flat-screen">${flatHeader("GTL", "Portfolio")}${flatStatus("empty", "No open positions", "Your live positions will appear here.")}${flatNav("Orders")}</div>`;
  const headline = { winning: "+$19.20 unrealized", losing: "-$13.80 unrealized", conflict: "Conflicting sides", sell: "Sell preview" }[mode] || "Open positions";
  return `<div class="flat-screen">${flatHeader("GTL", "Portfolio")}<h2 class="flat-hero-title">${headline}</h2><div class="flat-list">${flatRows(mode === "conflict" ? 3 : 2)}</div>${mode === "sell" ? renderDrawerFrame("sellMarket").replace('class="flat-screen is-drawer"', 'class="flat-card"') : ""}${flatNav("Orders")}</div>`;
}

function renderPendingFrame(mode) {
  if (mode === "empty") return `<div class="flat-screen">${flatHeader("GTL", "Orders")}${flatStatus("empty", "No pending orders", "Limit orders will appear here.")}${flatNav("Orders")}</div>`;
  if (mode === "error") return `<div class="flat-screen">${flatHeader("GTL", "Orders")}${flatStatus("error", "Pending orders unavailable", "Try refreshing the page.")}${flatNav("Orders")}</div>`;
  const panel = {
    edit: `<div class="flat-card"><h3>Edit limit price</h3><div class="flat-field">New limit: 48c</div><div class="flat-primary">Save changes</div></div>`,
    cancel: `<div class="flat-card"><h3>Cancel order?</h3><p>This pending limit order will be removed.</p><div class="flat-btn-row"><span class="flat-secondary">Keep</span><span class="flat-primary">Cancel</span></div></div>`,
    filled: flatStatus("empty", "Order filled", "Your limit order became an open position."),
  }[mode] || "";
  return `<div class="flat-screen">${flatHeader("GTL", "Orders")}<h2 class="flat-hero-title">Pending orders</h2><div class="flat-list">${flatRows(mode === "sell" ? 2 : 1, "pending")}</div>${panel}${flatNav("Orders")}</div>`;
}

function renderAccountFrame(mode) {
  if (mode === "loading") return `<div class="flat-screen">${flatHeader("GTL", "Account")}${flatLoading()}${flatNav("Account")}</div>`;
  if (mode === "error") return `<div class="flat-screen">${flatHeader("GTL", "Account")}${flatStatus("error", "Account unavailable", "We could not load your account.")}${flatNav("Account")}</div>`;
  if (mode === "settledEmpty") return `<div class="flat-screen">${flatHeader("GTL", "Settled")}${flatStatus("empty", "No settled bets", "Completed trades will appear here.")}${flatNav("Account")}</div>`;
  const content = {
    settled: `<h2 class="flat-hero-title">Settled history</h2><div class="flat-list">${flatRows(4)}</div>`,
    overview: `<h2 class="flat-hero-title">Account overview</h2><div class="flat-card"><h3>Alex Morgan</h3><p>alex@gtl.test</p></div><div class="flat-list">${flatRows(2)}</div>`,
    profile: `<h2 class="flat-hero-title">Profile</h2><div class="flat-field">Display name: Alex Morgan</div><div class="flat-field">Email: alex@gtl.test</div><div class="flat-field">Notifications: On</div>`,
    credits: `<h2 class="flat-hero-title">$240.50</h2><p class="flat-copy">Available balance</p><div class="flat-primary">Top Up</div><div class="flat-list">${flatRows(2)}</div>`,
  }[mode];
  return `<div class="flat-screen">${flatHeader("GTL", "Account")}${content}${flatNav("Account")}</div>`;
}

function renderFlatFrame(frame) {
  const renderers = {
    auth: renderAuthFrame,
    home: renderHomeFrame,
    game: renderGameFrame,
    drawer: renderDrawerFrame,
    tracker: renderTrackerFrame,
    pending: renderPendingFrame,
    account: renderAccountFrame,
  };
  const screen = renderers[frame.type](frame.mode);
  return `<article class="flat-frame-wrap"><div class="flat-frame-label">${frame.label}</div><div class="flat-phone">${screen}</div></article>`;
}

function renderFlatDocSection(doc) {
  return `<section class="flat-page-group"><div class="flat-doc-head"><h2>${doc.title}</h2><p>${doc.description}</p></div>
    ${doc.groups.map((group) => `<section class="flat-group"><div class="flat-group-title"><h3>${group.title}</h3></div><div class="flat-frame-row">${group.frames.map(renderFlatFrame).join("")}</div></section>`).join("")}</section>`;
}

function renderFlatDevice(device = "mobile") {
  if (!flatLayContent) return;
  const currentDevice = ["mobile", "tablet", "desktop"].includes(device) ? device : "mobile";
  flatLayContent.dataset.flatDevice = currentDevice;
  flatLayContent.innerHTML = Object.values(flatDocs).map(renderFlatDocSection).join("");

  flatDeviceTabs.forEach((button) => {
    const active = button.dataset.flatDevice === currentDevice;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
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

function setPageZoom(nextZoom) {
  pageZoom = Math.max(0.5, Math.min(1.5, Math.round(nextZoom * 100) / 100));
  pagePreview?.style.setProperty("--page-zoom", String(pageZoom));
  if (pageZoomValue) pageZoomValue.textContent = `${Math.round(pageZoom * 100)}%`;

  pageZoomButtons.forEach((button) => {
    const action = button.dataset.pageZoom;
    button.disabled = (action === "out" && pageZoom <= 0.5) || (action === "in" && pageZoom >= 1.5);
  });
}

function pagePreviewSrc(src, authState, params = {}) {
  if (!authState && !Object.keys(params).length) return src;
  const url = new URL(src, window.location.href);
  if (authState) url.searchParams.set("ds-auth", authState);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  const filename = url.pathname.split("/").pop();
  return `../gtl-app/${filename}?${url.searchParams.toString()}`;
}

function setPageFrameMode(compareAuth) {
  pagePreview?.classList.toggle("is-dual", compareAuth);
  pageFrameCards.forEach((card) => {
    card.hidden = !compareAuth && card.dataset.pageFrameCard !== "guest";
  });
}

function gamePreviewSrc(frameMode) {
  const sources = {
    auth: "../gtl-app/game.html?id=kc-sf",
    empty: "../gtl-app/game.html?id=dal-phi",
    guest: "../gtl-app/game.html?id=buf-mia",
  };
  return sources[frameMode] || sources.guest;
}

function loadPagePreview(button) {
  const nextSrc = button.dataset.pageSrc;
  const nextName = button.dataset.pageName || button.textContent?.trim() || "Page";
  const compareAuth = button.dataset.pageCompareAuth === "true";
  const compareGame = button.dataset.pageCompareGame === "true";
  const compareFrames = compareAuth || compareGame;
  if (!nextSrc) return;

  pageTabs.forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  setPageFrameMode(compareFrames);

  pageFrameLabels.forEach((label) => {
    const authLabels = { auth: "Logged in", empty: "No open positions", guest: "Guest" };
    const gameLabels = { auth: "Paused after score change", empty: "Opens after first score", guest: "Live game default" };
    const labelMap = compareGame ? gameLabels : authLabels;
    label.textContent = compareFrames ? labelMap[label.dataset.pageFrameLabel] : nextName;
  });

  pageFrames.forEach((frame) => {
    const frameMode = frame.dataset.pageFrame;
    if (frameMode !== "guest" && !compareFrames) return;
    const authState = frameMode === "guest" ? "guest" : "logged";
    const extraParams = frameMode === "empty" ? { "ds-positions": "empty" } : {};
    frame.src = compareGame
      ? gamePreviewSrc(frameMode)
      : compareAuth
      ? pagePreviewSrc(nextSrc, authState, extraParams)
      : pagePreviewSrc(nextSrc, button.dataset.pageAuth);
    frame.title = compareAuth
      ? `${nextName} ${frameMode === "empty" ? "no open positions" : authState} preview`
      : compareGame
      ? `${nextName} ${frameMode === "auth" ? "paused" : frameMode === "empty" ? "opens after first score" : "live"} preview`
      : `${nextName} page preview`;
  });
  pageFrameOpenLinks.forEach((link) => {
    const frameMode = link.dataset.pageFrameOpen;
    if (frameMode !== "guest" && !compareFrames) return;
    const authState = frameMode === "guest" ? "guest" : "logged";
    const extraParams = frameMode === "empty" ? { "ds-positions": "empty" } : {};
    link.href = compareGame
      ? gamePreviewSrc(frameMode)
      : compareAuth
      ? pagePreviewSrc(nextSrc, authState, extraParams)
      : pagePreviewSrc(nextSrc, button.dataset.pageAuth);
  });
  if (pageTitle) pageTitle.textContent = nextName;
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

pageTabs.forEach((button) => {
  button.addEventListener("click", () => {
    loadPagePreview(button);
  });
});

pageZoomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.pageZoom;
    if (action === "in") setPageZoom(pageZoom + 0.1);
    if (action === "out") setPageZoom(pageZoom - 0.1);
    if (action === "reset") setPageZoom(1);
  });
});

flatDeviceTabs.forEach((button) => {
  button.addEventListener("click", () => {
    renderFlatDevice(button.dataset.flatDevice);
  });
});

window.addEventListener("hashchange", () => {
  showSection(sectionFromHash(), { instant: true });
});

createLimitOpenDrawerState();
setDrawerView(drawerSection?.dataset.drawerViewMode);
drawerSection?.querySelectorAll(".bet-sheet").forEach(updateDrawerPreview);
setPageZoom(pageZoom);
if (pageTabs.length) loadPagePreview(document.querySelector("[data-page-tab].is-active") || pageTabs[0]);
renderFlatDevice(document.querySelector("[data-flat-device].is-active")?.dataset.flatDevice || "mobile");
showSection(sectionFromHash(), { instant: true });
describeColorSwatches();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});
