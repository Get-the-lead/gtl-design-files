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
const flatDocTabs = document.querySelector("[data-flat-doc-tabs]");
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
        { label: "Name and birthday", type: "auth", mode: "registerDetails" },
        { label: "Create password", type: "auth", mode: "registerPassword" },
        { label: "Email verification", type: "auth", mode: "verify" },
        { label: "Forgot password", type: "auth", mode: "forgot" },
        { label: "Reset password", type: "auth", mode: "reset" },
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
        { label: "NBA selected", type: "home", mode: "nba" },
        { label: "With open positions", type: "home", mode: "positions" },
      ] },
      { title: "System states", frames: [
        { label: "Loading state", type: "home", mode: "loading" },
        { label: "Error / empty state", type: "home", mode: "error" },
      ] },
    ],
  },
  welcome: {
    title: "Welcome Home",
    description: "Post-verification username selection followed by a polished account celebration and welcome credit.",
    groups: [
      { title: "Post-signup states", frames: [
        { label: "Choose username", type: "welcome", mode: "username" },
        { label: "Welcome celebration", type: "welcome", mode: "reward" },
      ] },
    ],
  },
  game: {
    title: "Game Page",
    description: "Game detail page variants covering live market access, unavailable markets, position context, refresh, and errors.",
    groups: [
      { title: "Default states", frames: [
        { label: "Live game default", type: "game", mode: "live" },
        { label: "Starting soon countdown", type: "game", mode: "countdown" },
        { label: "Final - away team won", type: "game", mode: "final" },
        { label: "Pregame unavailable", type: "game", mode: "pregame" },
        { label: "Betting paused after score change", type: "game", mode: "paused" },
        { label: "Game stats selected", type: "game", mode: "gameStats" },
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
    title: "Portfolio",
    description: "Wallet portfolio states from wallet.html for live positions, pending limit orders, settled bets, cancelled orders, and order detail.",
    groups: [
      { title: "Wallet states", frames: [
        { label: "Orders overview", type: "tracker", mode: "open" },
        { label: "Settled tab", type: "tracker", mode: "settled" },
        { label: "Empty orders", type: "tracker", mode: "empty" },
      ] },
      { title: "System states", frames: [
        { label: "Loading state", type: "tracker", mode: "loading" },
        { label: "Error state", type: "tracker", mode: "error" },
      ] },
      { title: "Order detail states", frames: [
        { label: "Current detail", type: "tracker", mode: "detailCurrent" },
        { label: "Pending detail", type: "tracker", mode: "detailPending" },
        { label: "Settled detail", type: "tracker", mode: "detailSettled" },
      ] },
    ],
  },
  account: {
    title: "Settled / Account",
    description: "Account views covering profile, credits, loading, and errors.",
    groups: [
      { title: "History and account states", frames: [
        { label: "Account overview", type: "account", mode: "overview" },
        { label: "Profile - password account", type: "account", mode: "profilePassword" },
        { label: "Profile - Google account", type: "account", mode: "profileGoogle" },
        { label: "Profile - Apple account", type: "account", mode: "profileApple" },
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
  dalNfl: "../gtl-app/assets/logos/nfl-dal.png",
  phi: "../gtl-app/assets/logos/nfl-phi.png",
  den: "../gtl-app/assets/logos/nba-den.png",
  dal: "../gtl-app/assets/logos/nba-dal.png",
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
const chevronDownIcon = `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 8 4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
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
  return `<div class="auth-head">${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h1>${title}</h1><p>${copy}</p></div>`;
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
    return authShell(`<div class="auth-steps" data-step="1"><div class="auth-step" data-step="1">
        ${authHead("", "Create your account", "Start trading the live games in under a minute.")}
        ${socialRow()}<div class="auth-divider">or</div>
        <div class="auth-form">${field("Email", "you@email.com", { type: "email" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue</button></div>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "registerPassword") {
    return authShell(`<div class="auth-steps" data-step="3"><div class="auth-step" data-step="3">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Create a password", "Keep your account secure with a strong password.")}
        <div class="auth-form">${field("Password", "At least 8 characters", { type: "password", passwordToggle: true })}${field("Confirm password", "Re-enter your password", { type: "password" })}<label class="terms-check"><input type="checkbox" checked tabindex="-1"><span>I agree to GTL's <span class="link-green">Terms and Conditions</span> and <span class="link-green">Privacy Policy</span>.</span></label><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Create Account</button></div>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "registerDetails") {
    return authShell(`<div class="auth-steps" data-step="2"><div class="auth-step" data-step="2">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Tell us about you", "Add your name and date of birth to confirm your eligibility.")}
        <div class="auth-form"><div class="signup-name-row">${field("First name", "Alex", { value: "Alex" })}${field("Last name", "Morgan", { value: "Morgan" })}</div><fieldset class="field signup-birthday-field"><legend>Date of birth</legend><div class="date-fields"><div class="date-part"><div class="field-combobox"><input class="field-input" value="January" aria-label="Month" tabindex="-1" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div><div class="date-part"><div class="field-combobox"><input class="field-input" value="19" aria-label="Day" tabindex="-1" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div><div class="date-part"><div class="field-combobox"><input class="field-input" value="2000" aria-label="Year" tabindex="-1" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div></div><span class="field-hint">You must be 18 or older to use GTL.</span></fieldset><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue</button></div>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "verify") {
    return authShell(`<div class="auth-steps" data-step="4"><div class="auth-step" data-step="4">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Verify your account", `We sent a 6-digit code to <span class="code-sent-to">alex@gtl.test</span>.`)}
        <div class="auth-form"><div class="code-input"><input class="code-box is-filled" type="text" value="4" tabindex="-1" readonly><input class="code-box is-filled" type="text" value="8" tabindex="-1" readonly><input class="code-box is-filled" type="text" value="2" tabindex="-1" readonly><span class="code-dash" aria-hidden="true"></span><input class="code-box" type="text" tabindex="-1" readonly><input class="code-box" type="text" tabindex="-1" readonly><input class="code-box" type="text" tabindex="-1" readonly></div><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Verify Account</button></div>
        <p class="code-resend">Didn't get a code? <span>Resend</span></p>
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
const headerLogoSvg = `<img src="../gtl-app/assets/gtl-header-logo.svg" alt="Get the Lead">`;
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
          <span class="brand floating-logo floating-btn brand-link"><span class="header-brand-logo">${headerLogoSvg}</span></span>
          <span class="brand floating-logo floating-btn brand-menu"><span class="header-brand-logo">${headerLogoSvg}</span></span>
          <span class="header-nav-slot"><nav class="header-nav" aria-label="Primary navigation"><span>Home</span><span>Live Games</span><span>Ranking</span>${authed ? "<span>Portfolio</span><span>Profile</span><span class=\"header-nav-sep\"></span><button class=\"header-nav-logout\" type=\"button\">Logout</button>" : ""}</nav></span>
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
  return homeBetPanelLive(g);
  const row = (label, sub, key) => `<div class="mkt-row"><span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span><button class="price yes" type="button" tabindex="-1">${g.markets[key].yes}¢</button><button class="price no" type="button" tabindex="-1">${g.markets[key].no}¢</button></div>`;
  return `<div class="mkt-grid"><div class="mkt-head"><span class="col-market">Markets</span><span class="col-yes">Yes</span><span class="col-no">No</span></div>${row("GTL", "Get the Lead", "gtl")}${row("TIE", "", "tie")}${row("KTL", "Keep the Lead", "ktl")}</div><span class="view-game">View Game</span>`;
}

function homeBetPanelLive(g) {
  const row = (label, sub, full, key) => `<div class="mkt-row">
      <button class="price yes" type="button" tabindex="-1" aria-label="${full} Yes ${g.markets[key].yes} cents">${g.markets[key].yes}¢</button>
      <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
      <button class="price no" type="button" tabindex="-1" aria-label="${full} No ${g.markets[key].no} cents">${g.markets[key].no}¢</button>
    </div>`;
  return `<div class="mkt-grid">
      <div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>
      ${row("GTL", "Get the Lead", "Get the Lead", "gtl")}
      ${row("TIE", "", "Tie", "tie")}
      ${row("KTL", "Keep the Lead", "Keep the Lead", "ktl")}
    </div><span class="view-game">View Game</span>`;
}

function homeGameTile(g, open = false) {
  return `<article class="game-tile${g.paused ? " is-paused" : ""}${open ? " is-open" : ""}" data-league="${g.league}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="tile-main">${homeGameMedia(g)}</div>
    <div class="tile-foot">${g.paused ? `<div class="trade-pause"><span class="pause-dot"></span><span>${g.paused.message}</span></div>` : ""}<button class="foot-toggle" type="button" tabindex="-1"><span class="chev">${chevronDown}</span><span class="toggle-label">${open ? "Hide Bets" : "See Bets"}</span><span class="chev">${chevronDown}</span></button><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${homeBetPanelLive(g)}</div></div></div></div>
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
    return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner authed"><div class="hero-greeting"><h1>Hey Alex</h1></div><div class="authed-stack">${mode === "positions" ? homePositionsBlock() : homeEmptyPositions()}<span class="btn btn-primary authed-cta">Live Games</span></div></div></section>`;
  }
  return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner"><div class="hero-trading"><span class="live-dot"></span><span class="tnum">3,247</span> trading right now</div><h1 class="hero-title">Trade the moments that move the game.</h1><p class="hero-sub">Back the lead on live NFL &amp; NBA. Buy and sell in seconds, as the game turns.</p><div class="hero-cta"><span class="btn btn-primary btn-lg">Live Games</span><span class="btn btn-glass btn-lg">Create Account</span></div></div></section>`;
}

function homePositionsBlock() {
  return `<div class="positions-block"><div class="positions-head"><span class="eyebrow">Open Positions</span></div><div class="pos-carousel">${homePositionCardA("kc")}${homePositionCardA("ny")}${homePositionCardA("den")}</div><div class="pos-footer"><a href="javascript:void(0)" tabindex="-1">View All</a><div class="pos-dots"><button class="pos-dot is-active" type="button" tabindex="-1"></button><button class="pos-dot" type="button" tabindex="-1"></button><button class="pos-dot" type="button" tabindex="-1"></button></div><a href="javascript:void(0)" tabindex="-1">View Settled</a></div></div>`;
}

function homeEmptyPositions() {
  return `<div class="coming-soon authed-empty-positions"><h3 class="cs-title">No open positions yet</h3><p class="cs-desc">Live markets you enter will appear here, along with quick access to buy more, sell, or review settled results.</p></div>`;
}

function homePositionCardA(variant) {
  const positions = {
    kc: {
      game: { period: "Q2", clock: "08:42", home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: teamLogos.kc }, away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: teamLogos.sf } },
      market: "Get the Lead",
      side: "yes",
      qty: 150,
      value: "$57.00",
      pnl: "+$10.50",
    },
    den: {
      game: { period: "Q4", clock: "01:33", home: { abbr: "DEN", name: "Nuggets", score: 102, color: "#FEC524", logo: teamLogos.den }, away: { abbr: "DAL", name: "Mavericks", score: 99, color: "#00538C", logo: teamLogos.dal } },
      market: "Get the Lead",
      side: "no",
      qty: 90,
      value: "$60.30",
      pnl: "+$6.30",
    },
    ny: {
      game: { period: "Q4", clock: "05:18", home: { abbr: "NYK", name: "Knicks", score: 84, color: "#F58426", logo: teamLogos.ny }, away: { abbr: "BOS", name: "Celtics", score: 89, color: "#007A33", logo: teamLogos.bos } },
      market: "Keep the Lead",
      side: "yes",
      qty: 100,
      value: "$63.00",
      pnl: "-$7.00",
    },
  };
  const p = positions[variant] || positions.kc;
  const g = p.game;
  const up = !p.pnl.startsWith("-");
  const style = `--home-color:${g.home.color};--away-color:${g.away.color}`;
  const actions = `<div class="oc-actions"><button class="oc-buy" type="button" tabindex="-1">Buy More</button><button class="oc-sell" type="button" tabindex="-1">Sell</button></div>`;
  return `<article class="pos-card pos-card--a" style="${style}"><div class="pos-media">${homeGameMedia(g)}</div><div class="pos-info"><div class="oc-summary"><div class="oc-row"><span class="oc-tag">${p.market}</span><span class="oc-vr-head">Value: <span class="tnum">${p.value}</span></span></div><div class="oc-row"><span class="oc-sub"><span class="side-${p.side}">${p.side.toUpperCase()}</span> · ${p.qty} contracts</span><span class="oc-figures"><span class="oc-pnl ${up ? "up" : "down"} tnum">${p.pnl}</span></span></div></div>${actions}</div></article>`;
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
  return `<article class="pos-card pos-card--a" style="${style}"><div class="pos-media">${homeGameMedia(g)}</div><div class="pos-info"><div class="oc-summary"><div class="oc-row"><span class="oc-tag">Get the Lead</span><span class="oc-vr-head">Value: <span class="tnum">$76.80</span></span></div><div class="oc-row"><span class="oc-sub"><span class="side-yes">YES</span> · 120 contracts</span><span class="oc-figures"><span class="oc-pnl up tnum">+$19.20</span></span></div></div>${actions}</div></article>`;
}

function homeLiveSection(mode) {
  let content = `<div class="game-grid">${homeGames.map((g, i) => homeGameTile(g, i === 1)).join("")}</div>`;
  if (mode === "noLive") content = `<div class="coming-soon"><img class="cs-logo" src="../gtl-app/assets/logos/league-nfl.png" alt=""><h3 class="cs-title">No live games right now</h3><p class="cs-desc">Upcoming markets will appear here before kickoff.</p></div>`;
  if (mode === "nba") content = `<div class="coming-soon"><img class="cs-logo" src="../gtl-app/assets/logos/league-nba.png" alt=""><h3 class="cs-title">NBA Betting Coming Soon</h3><p class="cs-desc">We're launching with live NFL. Get the Lead on NBA games is next — tell us whether you'd trade it and we'll prioritise accordingly.</p><div class="cs-actions"><span class="btn btn-secondary">I'd bet on NBA</span><span class="btn btn-secondary">Not for me</span></div></div>`;
  if (mode === "loading") content = `<div class="game-grid"><article class="game-tile ds-home-skeleton"></article><article class="game-tile ds-home-skeleton"></article><article class="game-tile ds-home-skeleton"></article></div>`;
  if (mode === "error") content = `<div class="coming-soon"><h3 class="cs-title">Unable to load markets</h3><p class="cs-desc">Refresh the page or try again later.</p><div class="cs-actions cs-actions-single"><span class="btn btn-secondary">Try again</span></div></div>`;
  return `<section class="section live"><div class="container"><div class="section-head center"><span class="eyebrow">On now</span><h2>Live games</h2></div>${homeLeagueStrip(mode === "nba" ? "nba" : "nfl")}${content}</div></section>`;
}

function homeHowSection() {
  const steps = [
    ["01", "Pick a market", "Choose a live game and one of three lead markets.", `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 14h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`],
    ["02", "View the order book", "See live Yes / No prices and where the market sits.", `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="11" width="3" height="5" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="7" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.8"/></svg>`],
    ["03", "Buy", "Take a position at the live price in a single tap.", `<svg viewBox="0 0 24 24" fill="none"><path d="M7 8l-3 3 3 3M4 11h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 16l3-3-3-3M20 13h-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`],
    ["04", "Cash Out or Settle", "Cash out early or let it settle when the moment lands.", `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`],
  ];
  return `<section class="section how"><div class="container"><div class="section-head center"><span class="eyebrow">How it works</span><h2>Four taps from watching to trading.</h2></div><ol class="flow">${steps.map(([n, title, copy, icon]) => `<li class="flow-step"><div class="flow-marker">${icon}</div><span class="flow-num">${n}</span><h3 class="flow-title">${title}</h3><p class="flow-text">${copy}</p></li>`).join("")}</ol></div></section>`;
}

function homeFooter() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><span class="brand"><span class="brand-mark">${logoSvg}</span><span class="brand-word">GTL</span></span><p class="footer-blurb">Get the Lead. The fastest way to trade the moments that move live NFL and NBA games.</p></div><div class="footer-cols"><div class="footer-col"><h4>Product</h4><a href="#">Live games</a></div><div class="footer-col"><h4>Company</h4><a href="#">About</a><a href="#">Careers</a><a href="#">Contact</a></div><div class="footer-col"><h4>Legal</h4><a href="#">Official rules</a><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Responsible play</a></div></div></div><div class="footer-base"><span>© 2026 GTL Markets</span><span>21+. Please play responsibly.</span></div></div></footer>`;
}

function renderHomeFrame(mode) {
  const authed = mode === "logged" || mode === "positions";
  return `<div class="flat-screen is-home is-home-${mode}">${homeHeader(authed, mode === "positions")}${homeHero(mode)}${homeLiveSection(mode)}${homeHowSection()}${homeFooter()}</div>`;
}

function renderWelcomeFrame(mode) {
  if (mode === "username") {
    const content = `<div class="welcome-copy"><p class="welcome-kicker">Your GTL identity</p><h1>Choose a username.</h1><p>This is how you’ll appear in rankings and across GTL.</p></div><div class="welcome-form">${field("Username", "alexmorgan", { value: "alexmorgan", hint: "Use 3–20 letters, numbers, or underscores." })}<span class="btn btn-primary btn-lg">Complete Setup</span></div>`;
    return `<div class="flat-screen is-welcome"><main class="welcome-main container" data-welcome-state="username"><section class="welcome-panel welcome-username">${content}</section></main></div>`;
  }
  const decor = `<div class="welcome-celebration-bg" aria-hidden="true"><span class="ambient-orbit orbit-one"></span><span class="ambient-orbit orbit-two"></span><span class="light-sweep"></span><i class="ribbon one"></i><i class="ribbon two"></i><i class="ribbon three"></i><i class="ribbon four"></i><i class="particle p1"></i><i class="particle pale p2"></i><i class="particle dim p3"></i><i class="particle p4"></i><i class="particle pale p5"></i><i class="particle dim p6"></i><i class="spark s1"></i><i class="spark s2"></i><i class="spark s3"></i><i class="spark s4"></i></div>`;
  const content = `${decor}<div class="welcome-copy"><p class="welcome-kicker">You’re officially in</p><h1>Welcome to GTL, <span>Alex</span>.</h1><p>Your account is live and the next lead is yours to call. Use your credits to bet the moments that matter to you.</p></div><div class="credit-ticket"><span class="ticket-label">Welcome credits</span><strong class="ticket-value tnum">1,500</strong></div><div class="welcome-actions"><span class="btn btn-primary btn-lg">Explore Live Games</span></div>`;
  return `<div class="flat-screen is-welcome"><main class="welcome-main container" data-welcome-state="reward"><section class="welcome-panel welcome-reward">${content}</section></main></div>`;
}

function renderLocationFrame() {
  return `<div class="flat-screen is-location"><main class="location-main"><section class="location-panel"><span class="location-brand"><img src="../gtl-app/assets/gtl-header-logo.svg" alt="Get The Lead"></span><div class="location-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M26 13.3C26 20 16 28 16 28S6 20 6 13.3a10 10 0 1 1 20 0Z" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="13" r="3.25" stroke="currentColor" stroke-width="2"/><path d="m7 27 18-22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="location-copy"><p class="location-kicker">Location unavailable</p><h1>GTL isn’t available in this location.</h1><p>We’re working to bring GTL to more locations. Please check back again soon.</p></div><p class="location-footnote">Availability is based on your current location.</p></section></main></div>`;
}

function renderRankingFrame(mode) {
  const rows = [
    [1, "leadstorm", 128, "$1,500"], [2, "fourthquarter", 119, "$900"], [3, "linehunter", 112, "$650"],
    [4, "greenlight", 107, "$500"], [5, "clockedge", 101, "$400"], [6, "marketmaker", 96, "$300"],
    [7, "snapcount", 91, "$250"], [8, "fastbreak", 88, "$200"], [9, "leadkeeper", 84, "$175"], [10, "swingtrader", 81, "$125"],
  ];
  const trophy = `<svg class="rank-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 6H5.5A2.5 2.5 0 0 0 8 8.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5M12 12v4M9 20h6M10 16h4v4h-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const medal = `<svg class="rank-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 3 4 6 4-6M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12.7v3.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const rowHTML = rows.map(([rank, user, wins, prize]) => `<div class="ranking-row${rank <= 3 ? ` is-podium is-rank-${rank}` : ""}">${rank <= 3 ? `<span class="rank-medal">${rank === 1 ? trophy : medal}</span>` : `<span class="rank-pos">${rank}</span>`}<span class="rank-user">${user}</span><span class="rank-win tnum">${wins}</span><span class="rank-prize tnum">${prize}</span></div>`).join("");
  const currentRow = `<div class="ranking-current-slot"><div class="ranking-row is-current"><span class="rank-pos">47</span><span class="rank-user">You</span><span class="rank-win tnum">34</span><span class="rank-prize tnum">0</span></div></div>`;
  const months = [["July", 47], ["June", 14], ["May", 31], ["April", 19], ["March", 24], ["February", 38], ["January", 62]];
  const monthSelect = `<div class="ranking-month-select${mode === "months" ? " is-open" : ""}"><button class="ranking-month-trigger" type="button"><span>July 2026</span><svg viewBox="0 0 20 20" fill="none"><path d="m6 8 4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ranking-month-menu"${mode === "months" ? "" : " hidden"}>${months.map(([month, rank]) => `<button class="ranking-month-option${month === "July" ? " is-selected" : ""}" type="button"><span>${month}</span><strong>#${rank}</strong></button>`).join("")}</div></div>`;
  const rules = `<section class="ranking-rules"><div class="container ranking-rules-inner"><div class="section-head center"><span class="eyebrow">Competition summary</span><h2>Monthly Competition rules</h2></div><ol class="flow"><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 14h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div><span class="flow-num">01</span><h3 class="flow-title">Free to enter</h3><p class="flow-text">No purchase is necessary. Free Credits have no cash value and expire at competition end.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flow-num">02</span><h3 class="flow-title">Be eligible</h3><p class="flow-text">You must be 18+, hold one account, and be located in an eligible state.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="11" width="3" height="5" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="7" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.8"/></svg></div><span class="flow-num">03</span><h3 class="flow-title">Climb the ranking</h3><p class="flow-text">The top 10 eligible players share $5,000 in monthly prizes.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M7 8l-3 3 3 3M4 11h9M17 16l3-3-3-3M20 13h-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flow-num">04</span><h3 class="flow-title">Verify and receive</h3><p class="flow-text">Winners verify their identity, eligibility, location, and tax details before payment.</p></li></ol><span class="ranking-rules-link">Read the full Official Rules <span>→</span></span></div></section>`;
  const resultModal = mode === "result" ? `<div class="gate-backdrop ranking-prize-backdrop is-open"></div><div class="auth-gate ranking-prize-gate is-open"><div class="gate-body"><span class="ranking-prize-kicker">Ranking reward</span><h3 class="gate-title">Keep climbing the ranking.</h3><p class="gate-desc">You finished in position #47. Try to reach the top 10 next time!</p><div class="gate-actions"><span class="btn btn-secondary">Close</span></div></div></div>` : "";
  return `<div class="flat-screen is-ranking ranking-body">${homeHeader(false)}<main><header class="ranking-hero"><div class="ranking-hero-glow"></div><div class="ranking-hero-inner container"><h1>Ranking</h1><div class="ranking-countdown"><span class="reset-label">Resets in</span><span class="reset-time tnum"><span class="reset-num">06</span><span class="reset-unit">d</span><span class="reset-num">10</span><span class="reset-unit">h</span><span class="reset-num">15</span><span class="reset-unit">m</span></span></div></div></header><section class="ranking-page container"><section class="ranking-card"><header class="ranking-card-head"><div>${monthSelect}<h2>Leaderboard</h2></div><p>Top 10 win cash prizes</p></header><div class="ranking-table-head"><span>Rank</span><span>Player</span><span>Wins</span><span>Prize</span></div><div class="ranking-scroll">${rowHTML}</div>${currentRow}</section></section>${rules}</main>${homeFooter()}${resultModal}</div>`;
}

const gameFrameData = {
  live: {
    league: "NBA",
    period: "Q4",
    clock: "05:18",
    home: { abbr: "NYK", name: "Knicks", score: 84, color: "#F58426", logo: teamLogos.ny },
    away: { abbr: "BOS", name: "Celtics", score: 89, color: "#007A33", logo: teamLogos.bos },
    markets: { gtl: { yes: 41, no: 59 }, tie: { yes: 17, no: 83 }, ktl: { yes: 63, no: 37 } },
  },
  pregame: {
    league: "NFL",
    period: "Q1",
    clock: "14:22",
    waiting: true,
    message: "Markets open when a team takes the lead.",
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: teamLogos.dalNfl },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: teamLogos.phi },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 64, no: 36 }, ktl: { yes: 50, no: 50 } },
  },
  countdown: {
    league: "NFL",
    period: "Starts in",
    clock: "9:59",
    countdown: true,
    waiting: true,
    message: "Markets open when the game starts.",
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: teamLogos.dalNfl },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: teamLogos.phi },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 50, no: 50 }, ktl: { yes: 50, no: 50 } },
  },
  paused: {
    league: "NFL",
    period: "Q3",
    clock: "11:05",
    recalc: true,
    message: "Trading paused. Recalculating markets.",
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: teamLogos.buf },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: teamLogos.mia },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 58, no: 42 } },
  },
  final: {
    league: "NBA",
    period: "Final",
    clock: "",
    final: true,
    message: "Game final. Winning contracts have settled.",
    home: { abbr: "NYK", name: "Knicks", score: 98, color: "#F58426", logo: teamLogos.ny },
    away: { abbr: "BOS", name: "Celtics", score: 104, color: "#007A33", logo: teamLogos.bos },
    markets: { gtl: { yes: 0, no: 100 }, tie: { yes: 0, no: 100 }, ktl: { yes: 100, no: 0 } },
  },
};

const flatDocViews = {
  home: flatDocs.home,
  welcome: flatDocs.welcome,
  game: flatDocs.game,
  portfolio: {
    ...flatDocs.tracker,
    title: "Portfolio Page",
    description: "Wallet page variants for portfolio stats, orders, settled history, order detail, loading, and empty states.",
  },
  login: {
    title: "Login Page",
    description: "Static sign-in and account recovery states from the authentication flow.",
    groups: [
      { title: "Login states", frames: [
        { label: "Sign in", type: "auth", mode: "signin" },
        { label: "Forgot password", type: "auth", mode: "forgot" },
        { label: "Reset password", type: "auth", mode: "reset" },
        { label: "Loading state", type: "auth", mode: "loading" },
        { label: "Error state", type: "auth", mode: "error" },
      ] },
    ],
  },
  registration: {
    title: "Registration Page",
    description: "Static account creation and verification states from the authentication flow.",
    groups: [
      { title: "Registration states", frames: [
        { label: "Create account", type: "auth", mode: "register" },
        { label: "Name and birthday", type: "auth", mode: "registerDetails" },
        { label: "Create password", type: "auth", mode: "registerPassword" },
        { label: "Email verification", type: "auth", mode: "verify" },
        { label: "Loading state", type: "auth", mode: "loading" },
        { label: "Error state", type: "auth", mode: "error" },
      ] },
    ],
  },
  location: {
    title: "Location Unavailable Page",
    description: "The signed-out location eligibility state linked from the mobile navigation menu.",
    groups: [{ title: "Location state", frames: [{ label: "Location unavailable", type: "location", mode: "default" }] }],
  },
  ranking: {
    title: "Ranking Page",
    description: "Monthly competition header, reset timer, standalone leaderboard rows, current position, and result modal.",
    groups: [{ title: "Leaderboard", frames: [{ label: "Monthly ranking", type: "ranking", mode: "default" }, { label: "Month selector", type: "ranking", mode: "months" }, { label: "Ranking result", type: "ranking", mode: "result" }] }],
  },
  drawer: flatDocs.drawer,
  account: flatDocs.account,
};
const flatDocOrder = ["home", "welcome", "game", "ranking", "portfolio", "login", "registration", "location", "drawer", "account"];
const flatDocTabLabels = {
  home: "Home",
  welcome: "Welcome",
  game: "Game",
  ranking: "Ranking",
  portfolio: "Portfolio",
  login: "Login",
  registration: "Registration",
  location: "Location",
  drawer: "Buy / Sell",
  account: "Account",
};
let activeFlatDevice = "mobile";
let activeFlatDoc = "home";

function gameScoreboard(g) {
  const lead = g.home.score === g.away.score ? null : g.home.score > g.away.score ? "home" : "away";
  const winner = lead ? g[lead] : null;
  const team = (side) => `<div class="gb-team"><img class="gb-logo" src="${g[side].logo}" alt="${g[side].name}"><span class="gb-abbr">${g[side].abbr}</span></div>`;
  return `<section class="gb${g.final ? " is-final" : ""}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="gb-glow"></div>
    <div class="container gb-inner">
      <div class="gb-topbar"><span class="gb-back"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Back</span></div>
      <div class="gb-score-stack">
        <span class="live-badge game-clock-badge"><span class="game-period${g.final ? " is-final" : ""}${g.countdown ? " is-countdown" : ""}">${g.final ? "" : `<span class="${g.countdown ? "countdown-dot" : "live-dot"}"></span>`}${g.period}</span>${g.clock ? `<span class="game-clock tnum${g.countdown ? " is-countdown" : ""}">${g.clock}</span>` : ""}</span>
        <div class="gb-score">${team("home")}<div class="gb-numbers"><span class="gb-num tnum${lead === "home" ? " is-leading" : ""}">${g.home.score}</span><span class="gb-dash">–</span><span class="gb-num tnum${lead === "away" ? " is-leading" : ""}">${g.away.score}</span></div>${team("away")}</div>
      </div>
      <p class="gb-league">${g.league}</p>
      ${g.final && winner ? `<p class="gb-result"><strong>${winner.abbr} won</strong><span>Final score</span></p>` : ""}
    </div>
  </section>`;
}

function gameMarkets(g) {
  const disabled = g.waiting || g.recalc || g.final;
  const row = (label, sub, key) => `<div class="mkt-row">
    <button class="price yes" type="button" tabindex="-1"${disabled ? " disabled" : ""}>${g.waiting ? "–" : `${g.markets[key].yes}¢`}</button>
    <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
    <button class="price no" type="button" tabindex="-1"${disabled ? " disabled" : ""}>${g.waiting ? "–" : `${g.markets[key].no}¢`}</button>
  </div>`;
  return `<section class="container markets${g.recalc ? " is-recalc" : ""}${g.final ? " is-final" : ""}">
    ${g.message ? `<div class="game-recalc"><span class="pause-dot"></span><span>${g.message}</span></div>` : ""}
    <div class="mkt-grid"><div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>${row("GTL", "Get the Lead", "gtl")}${row("TIE", "", "tie")}${row("KTL", "Keep the Lead", "ktl")}</div>
    <p class="bet-help">${g.final ? "Game final. Markets are settled." : "Tap a price to start your bet · Prices updated every 10 seconds"}</p>
  </section>`;
}

function gameMomentumPreview(g) {
  const stats = [
    { label: "Turnovers", home: 9, away: 12 },
    { label: "Possession %", home: 48, away: 52 },
    { label: g.league === "NBA" ? "Assists" : "Total Yards", home: g.league === "NBA" ? 19 : 318, away: g.league === "NBA" ? 23 : 286 },
  ];
  const statRow = (s) => {
    const max = Math.max(s.home, s.away) || 1;
    return `<div class="stat-block">
      <div class="stat-caption"><span class="stat-val tnum">${s.home}</span><span class="stat-label">${s.label}</span><span class="stat-val tnum">${s.away}</span></div>
      <div class="stat-bar-c">
        <span class="stat-fill-h" style="width:${((s.home / max) * 50).toFixed(1)}%"></span>
        <span class="stat-fill-a" style="width:${((s.away / max) * 50).toFixed(1)}%"></span>
      </div>
    </div>`;
  };
  return `<div class="momentum-grid">
    <div class="momentum-card worm-card">
      <div class="momentum-head"><span>Score Worm</span></div>
      <div class="worm-legend"><span class="worm-key"><i style="background:${g.home.color}"></i>${g.home.abbr} ahead</span><span class="worm-key"><i style="background:${g.away.color}"></i>${g.away.abbr} ahead</span></div>
      <div class="worm-wrap">
        <div class="worm-quarters" aria-hidden="true"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
        <div class="worm-axis" aria-hidden="true"><span>+8</span><span>0</span><span>-8</span></div>
        <span class="worm-mark" style="left:22%"></span><span class="worm-mark" style="left:47%"></span><span class="worm-mark" style="left:72%"></span>
        <svg class="worm-svg" viewBox="0 0 320 132" preserveAspectRatio="none" role="img" aria-label="Score margin over the game, 3 lead changes">
          <defs><linearGradient id="ds-worm-${g.home.abbr}-${g.away.abbr}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="132"><stop offset="0" stop-color="${g.home.color}"></stop><stop offset="0.5" stop-color="${g.home.color}"></stop><stop offset="0.5" stop-color="${g.away.color}"></stop><stop offset="1" stop-color="${g.away.color}"></stop></linearGradient></defs>
          <line class="worm-zero" x1="0" y1="66" x2="320" y2="66"></line>
          <path class="worm-line" d="M0 66 L35 58 L70 76 L110 70 L150 50 L190 44 L230 62 L270 82 L320 90" style="stroke:url(#ds-worm-${g.home.abbr}-${g.away.abbr})"></path>
        </svg>
      </div>
      <div class="worm-stats"><div class="worm-stat"><strong class="tnum">3</strong><span>Lead Changes</span></div><div class="worm-stat"><strong class="tnum">5</strong><span>Ties</span></div></div>
    </div>
    <div class="momentum-card stats-card">
      <div class="stats-teams"><img class="stats-logo" src="${g.home.logo}" alt="${g.home.name}"><span class="stats-title">Game Stats</span><img class="stats-logo" src="${g.away.logo}" alt="${g.away.name}"></div>
      <div class="stat-list">${stats.map(statRow).join("")}</div>
    </div>
  </div>`;
}

function gameStatsPreview(g, activePanel = "market") {
  const waiting = !!g.waiting;
  const marketActive = activePanel !== "game";
  const gameActive = activePanel === "game";
  const bid = Math.max(2, g.markets.gtl.yes - 1);
  const ask = Math.min(98, g.markets.gtl.yes + 1);
  const asks = [
    { price: ask + 3, size: 890, pct: 58 },
    { price: ask + 2, size: 1040, pct: 68 },
    { price: ask + 1, size: 1260, pct: 82 },
    { price: ask, size: 1510, pct: 100 },
  ];
  const bids = [
    { price: bid, size: 1430, pct: 95 },
    { price: bid - 1, size: 1180, pct: 78 },
    { price: bid - 2, size: 960, pct: 64 },
    { price: bid - 3, size: 760, pct: 50 },
  ];
  const emptyBookRow = `<div class="book-row"><span class="book-price tnum">--</span><span class="book-size tnum">0</span></div>`;
  const bookRow = (level, side) => `<div class="book-row book-${side}">
    <span class="book-depth"><span class="book-depth-fill" style="width:${level.pct}%"></span></span>
    <span class="book-price tnum">${level.price}¢</span>
    <span class="book-size tnum">${level.size.toLocaleString("en-US")}</span>
  </div>`;
  const flow = [
    { label: "Q1", val: waiting ? 0 : 42, pct: waiting ? 6 : 52 },
    { label: "Q2", val: waiting ? 0 : 68, pct: waiting ? 6 : 84 },
    { label: "Q3", val: waiting ? 0 : 57, pct: waiting ? 6 : 70 },
    { label: "Q4", val: waiting ? 0 : 81, pct: waiting ? 6 : 100 },
  ];
  const bets = [
    ["11:58", "GTL", "Yes", g.markets.gtl.yes + 2, 150],
    ["10:42", "TIE", "No", g.markets.tie.no - 1, 250],
    ["09:15", "KTL", "Yes", g.markets.ktl.yes + 4, 100],
    ["08:03", "GTL", "No", g.markets.gtl.no - 3, 300],
    ["06:37", "TIE", "Yes", g.markets.tie.yes + 1, 200],
  ];
  return `<section class="container stats-section" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="section-head center stats-overall-head"><span class="eyebrow">Stats</span><h2>Inside the game</h2></div>
    <div class="stats-tabs" role="tablist" aria-label="Game statistics views"><button class="stats-tab${marketActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${String(marketActive)}" tabindex="-1">Market Stats</button><button class="stats-tab${gameActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${String(gameActive)}" tabindex="-1">Game Stats</button></div>
    <div class="stats-panel"${marketActive ? "" : " hidden"}>
    <h3 class="stats-section-label">Market Stats</h3>
    <div class="chart-grid-wrap">
      <article class="chart-card">
        <div class="chart-head"><span>Market Book</span><strong class="tnum">${waiting ? "0¢ / 0¢" : `${bid}¢ / ${ask}¢`}</strong></div>
        <div class="book${waiting ? " is-empty" : ""}">
          <div class="book-side">${waiting ? Array.from({ length: 4 }, () => emptyBookRow).join("") : asks.map((level) => bookRow(level, "ask")).join("")}</div>
          <div class="book-spread"><span>Spread</span><strong class="tnum">${waiting ? "--" : `${ask - bid}¢`}</strong></div>
          <div class="book-side">${waiting ? Array.from({ length: 4 }, () => emptyBookRow).join("") : bids.map((level) => bookRow(level, "bid")).join("")}</div>
        </div>
        ${waiting ? `<p class="market-empty-note">No orders yet. Markets open when a team takes the lead.</p>` : ""}
      </article>
      <article class="chart-card">
        <div class="chart-head"><span>Order Flow</span><strong class="tnum">${waiting ? "0 bets" : `${flow.reduce((sum, item) => sum + item.val, 0)} bets`}</strong></div>
        <div class="flow-bars${waiting ? " is-empty" : ""}">${flow.map((item) => `<span class="flow-bar" style="height:${item.pct}%"><em class="flow-cap tnum">${item.val}</em></span>`).join("")}</div>
        <div class="flow-axis">${flow.map((item) => `<span>${item.label}</span>`).join("")}</div>
        <table class="bets-table">
          <thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead>
          <tbody>${waiting ? `<tr><td colspan="5" class="empty-row">No trades yet</td></tr>` : bets.map(([time, market, side, price, size]) => `<tr><td class="tnum">${time}</td><td>${market}</td><td><span class="side-${side.toLowerCase()}">${side}</span></td><td class="num tnum">${price}¢</td><td class="num tnum">${size}</td></tr>`).join("")}</tbody>
        </table>
      </article>
    </div>
    </div>
    <div class="stats-panel"${gameActive ? "" : " hidden"}>
      <h3 class="stats-section-label">Game Stats</h3>
      ${gameMomentumPreview(g)}
    </div>
  </section>`;
}

function renderGameFrame(mode) {
  if (mode === "live" || mode === "pregame" || mode === "countdown" || mode === "paused" || mode === "gameStats" || mode === "final") {
    const g = mode === "gameStats" ? gameFrameData.live : gameFrameData[mode];
    const statsPanel = mode === "gameStats" || mode === "final" ? "game" : "market";
    return `<div class="flat-screen is-game is-game-${mode}">${homeHeader(false)}<main>${gameScoreboard(g)}${gameMarkets(g)}${gameStatsPreview(g, statsPanel)}</main></div>`;
  }
  let banner = "";
  let markets = flatMarkets(mode === "pregame");
  if (mode === "paused" || mode === "stale") banner = flatStatus("loading", mode === "stale" ? "Refreshing prices" : "Trading paused", mode === "stale" ? "Latest market data is being checked." : "Recalculating markets after score change.");
  if (mode === "error") return `<div class="flat-screen">${flatHeader("GTL", "Game")}${flatStatus("error", "Game unavailable", "Live data could not be loaded.")}${flatNav("Orders")}</div>`;
  const extra = {
    position: `<div class="flat-list">${flatRows(1)}</div>`,
    pending: `<div class="flat-list">${flatRows(1, "pending")}</div>`,
  }[mode] || "";
  return `<div class="flat-screen">${flatHeader("GTL", mode === "pregame" ? "Pregame" : "Q3 11:05")}
    <div class="flat-game-tile" style="--home-color:#00338d;--away-color:#008e97"><div class="flat-score-row"><span class="flat-team"><img src="${teamLogos.buf}" alt=""><strong>BUF</strong></span><span class="flat-score">${mode === "pregame" ? "0 - 0" : "24 - 20"}</span><span class="flat-team"><img src="${teamLogos.mia}" alt=""><strong>MIA</strong></span></div></div>
    ${banner}${markets}${extra}<div class="flat-card"><h3>Inside the game</h3><p>Lead changes, volume, and order flow.</p></div>${flatNav("Orders")}</div>`;
}

const drawerCheckIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const drawerWarnIcon = `<svg class="warn-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4 21 20H3L12 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v5M12 17h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

function drawerScoreboardHTML() {
  return `<div class="bet-scoreboard" data-bet-grab style="--home-color:#00338d;--away-color:#008e97">
    <div class="bs-glow" aria-hidden="true"></div>
    <div class="bs-row">
      <div class="bs-team bs-home is-leading"><img class="bs-logo" src="${teamLogos.buf}" alt="Bills"><div class="bs-meta"><span class="bs-abbr">BUF</span><span class="bs-score tnum">24</span></div></div>
      <div class="bs-center"><span class="bs-period">Q3</span><span class="bs-clock tnum">11:05</span></div>
      <div class="bs-team bs-away"><img class="bs-logo" src="${teamLogos.mia}" alt="Dolphins"><div class="bs-meta"><span class="bs-abbr">MIA</span><span class="bs-score tnum">20</span></div></div>
    </div>
  </div>`;
}

function renderDrawerFrame(mode) {
  const sell = mode.startsWith("sell");
  const limit = mode.toLowerCase().includes("limit") || mode === "invalid" || mode === "pending";
  const step = mode === "pending" ? "2" : "1";
  const success = mode === "success";
  const invalid = mode === "invalid";
  const balance = mode === "balance";
  const error = mode === "error";
  const primary = sell ? "Sell" : limit ? "Place Limit" : "Quick Bet";
  const total = sell ? "$37.63" : limit ? "$52.00" : "$64.00";
  const profit = sell ? "$15.12" : limit ? "$46.96" : "$34.72";
  const conflict = balance
    ? `<div class="bet-conflict buy-only" role="alert">${drawerWarnIcon}<span><strong>Insufficient balance.</strong> Add funds before placing this bet.</span></div>`
    : error
    ? `<div class="bet-conflict buy-only" role="alert">${drawerWarnIcon}<span><strong>Order failed.</strong> Check the order and try again.</span></div>`
    : "";
  const sheetClass = success ? "bet-sheet is-open is-success" : "bet-sheet is-open";
  return `<div class="flat-screen is-drawer"><div class="bet-sheet-backdrop is-open"></div>
    <aside class="${sheetClass}" data-step="${step}" data-mode="${sell ? "sell" : "buy"}" aria-hidden="false" aria-label="${sell ? "Sell position" : "Place a bet"}">
      ${drawerScoreboardHTML()}
      <div class="bet-sheet-handle" aria-hidden="true"></div>
      <div class="bet-sheet-body">
        <div class="bet-step bet-step-1">
          <div class="sell-only sell-readout"><span class="sell-tag">Get the Lead · <span class="side-yes">YES</span></span><span class="sell-sub"><span>120 Held</span><span aria-hidden="true">·</span><span>Bought at 38¢</span><span aria-hidden="true">·</span><span>Now 64¢</span></span></div>
          ${conflict}
          <div class="bet-field contracts-field buy-only"><span class="bet-label">Select number of contracts</span><div class="num-input-box contracts-input-box"><input class="num-input" type="text" inputmode="numeric" value="${limit ? "100" : "100"}" aria-label="Number of contracts"></div><div class="qty-quick"><button type="button">50</button><button class="is-active" type="button">100</button><button type="button">500</button><button type="button">1000</button></div><p class="qty-total" hidden></p></div>
          <div class="bet-field contracts-field sell-only"><span class="bet-label">Contracts to sell</span><div class="num-input-box contracts-input-box"><input class="num-input" type="text" inputmode="numeric" value="60" aria-label="Contracts to sell"></div><div class="qty-quick q3"><button type="button">25%</button><button class="is-active" type="button">50%</button><button type="button">All</button></div></div>
          <div class="bet-field buy-only"><span class="bet-label">Bet type</span><div class="seg seg-3" role="group" aria-label="Bet type"><button class="is-active" type="button">GTL</button><button type="button">TIE</button><button type="button">KTL</button></div></div>
          <div class="bet-field buy-only"><span class="bet-label">Pick a side</span><div class="bet-toggle" data-active="yes" role="group" aria-label="Side"><button class="bt-opt yes is-active" type="button"><span class="bt-side">Yes</span><span class="bt-price tnum">64¢</span></button><button class="bt-opt no" type="button"><span class="bt-side">No</span><span class="bt-price tnum">36¢</span></button></div><button class="limit-toggle" type="button" aria-expanded="${limit ? "true" : "false"}">${limit ? "Hide Limit" : "Set a Limit"}</button><div class="limit-section"${limit ? "" : " hidden"}><span class="bet-label">Max limit price</span><div class="num-input-box limit-input-box"><input class="num-input${invalid ? " is-error" : ""}" data-limit-input type="text" inputmode="numeric" value="${invalid ? "104" : "52"}" aria-label="Limit price in cents"><span class="num-suffix">¢</span></div><p class="limit-minmax" data-limit-minmax>${invalid ? "Max 64¢" : "Min 1¢ · Max 64¢"}</p></div></div>
          <div class="bet-highlight buy-only"><span class="bet-label">Purchase price</span><span class="bet-total-big tnum">${total}</span><p class="potential-win">Potential profit of <strong>${profit}</strong> <span>after <a href="#" class="fees-link">fees</a></span></p></div>
          <div class="bet-highlight sell-only"><span class="bet-label">You receive</span><span class="bet-total-big tnum">$37.63</span><p class="potential-win">Realised profit of <strong>$15.12</strong> <span>after <a href="#" class="fees-link">fees</a></span></p></div>
        </div>
        <div class="bet-step bet-step-2">
          <div class="bet-field"><span class="bet-label">Order summary</span><div class="summary"><div class="summary-row"><span>Contract price</span><strong>${limit ? "52¢" : "64¢"}</strong></div><div class="summary-row"><span>Contracts</span><strong>${sell ? "60" : "100"}</strong></div><div class="summary-row"><span>Subtotal</span><strong>${sell ? "$38.40" : total}</strong></div><div class="summary-row"><span>Trading fee</span><strong>${sell ? "$0.77" : "$1.28"}</strong></div><div class="summary-row total"><span>${sell ? "You receive" : "Total to pay"}</span><strong>${sell ? "$37.63" : "$65.28"}</strong></div></div></div>
          <div class="bet-field"><span class="bet-label">Potential gain</span><div class="summary"><div class="summary-row"><span>Potential payout</span><strong>${sell ? "$60.00" : "$100.00"}</strong></div><div class="summary-row"><span>Potential profit</span><strong>${profit}</strong></div><div class="summary-row"><span>Fees</span><strong>${sell ? "$0.77" : "$1.28"}</strong></div><div class="summary-row total"><span>Net potential gain</span><strong>${sell ? "$37.63" : "$33.44"}</strong></div></div></div>
        </div>
      </div>
      <footer class="bet-sheet-footer"><button class="bet-secondary" type="button">See Details</button><button class="btn btn-primary bet-primary" type="button">${primary}</button></footer>
      <div class="bet-success">
        <div class="success-content"><div class="bet-success-head"><span class="bet-success-check">${drawerCheckIcon}</span><h3 class="bet-success-title">Bet placed!</h3><p class="bet-success-sub">100 × Get the Lead YES</p></div><div class="bet-field"><span class="bet-label">Order summary</span><div class="summary"><div class="summary-row"><span>Contract price</span><strong>64¢</strong></div><div class="summary-row"><span>Contracts</span><strong>100</strong></div><div class="summary-row"><span>Subtotal</span><strong>$64.00</strong></div><div class="summary-row"><span>Trading fee</span><strong>$1.28</strong></div><div class="summary-row total"><span>Total paid</span><strong>$65.28</strong></div></div></div><button class="bet-secondary cancel-bet" type="button">Cancel Bet</button></div><button class="btn btn-primary success-close" type="button">Close</button>
      </div>
    </aside>
  </div>`;
}

const walletGames = {
  "kc-sf": { league: "NFL", period: "Q2", clock: "08:42", home: { abbr: "KC", score: 17, logo: teamLogos.kc, color: "#E31837" }, away: { abbr: "SF", score: 14, logo: teamLogos.sf, color: "#B3995D" }, markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 64, no: 36 } } },
  "den-dal": { league: "NBA", period: "Q3", clock: "04:18", home: { abbr: "DEN", score: 84, logo: teamLogos.den, color: "#0E2240" }, away: { abbr: "DAL", score: 80, logo: teamLogos.dal, color: "#00538C" }, markets: { gtl: { yes: 52, no: 48 }, tie: { yes: 16, no: 84 }, ktl: { yes: 44, no: 56 } } },
  "ny-bos": { league: "NBA", period: "Q4", clock: "05:18", home: { abbr: "NYK", score: 84, logo: teamLogos.ny, color: "#F58426" }, away: { abbr: "BOS", score: 89, logo: teamLogos.bos, color: "#007A33" }, markets: { gtl: { yes: 41, no: 59 }, tie: { yes: 17, no: 83 }, ktl: { yes: 63, no: 37 } } },
  "buf-mia": { league: "NFL", period: "Final", clock: "", home: { abbr: "BUF", score: 27, logo: teamLogos.buf, color: "#00338D" }, away: { abbr: "MIA", score: 24, logo: teamLogos.mia, color: "#008E97" }, markets: { gtl: { yes: 100, no: 0 }, tie: { yes: 0, no: 100 }, ktl: { yes: 100, no: 0 } } },
  "lal-gs": { league: "NBA", period: "Final", clock: "", home: { abbr: "LAL", score: 101, logo: "../gtl-app/assets/logos/nba-lal.png", color: "#552583" }, away: { abbr: "GS", score: 113, logo: "../gtl-app/assets/logos/nba-gs.png", color: "#1D428A" }, markets: { gtl: { yes: 0, no: 100 }, tie: { yes: 0, no: 100 }, ktl: { yes: 0, no: 100 } } },
};

const walletUser = {
  balance: 248.5,
  positions: [
    { gameId: "kc-sf", market: "gtl", side: "yes", qty: 150, avg: 31, date: "2026-07-06" },
    { gameId: "den-dal", market: "gtl", side: "no", qty: 90, avg: 60, date: "2026-07-05" },
    { gameId: "ny-bos", market: "ktl", side: "yes", qty: 100, avg: 70, date: "2026-07-06" },
  ],
  pending: [
    { gameId: "kc-sf", market: "tie", side: "no", qty: 200, limit: 22, date: "2026-07-07" },
    { gameId: "den-dal", market: "ktl", side: "yes", qty: 75, limit: 44, date: "2026-07-06" },
  ],
  settled: [
    { gameId: "buf-mia", market: "gtl", side: "yes", qty: 100, avg: 45, result: "win", net: 54.1, date: "2026-06-28" },
    { gameId: "lal-gs", market: "ktl", side: "yes", qty: 60, avg: 55, result: "loss", net: -33, date: "2026-06-25" },
    { gameId: "kc-sf", market: "gtl", side: "no", qty: 80, avg: 40, result: "win", net: 41.2, date: "2026-06-30" },
    { gameId: "ny-bos", market: "gtl", side: "yes", qty: 50, avg: 62, result: "loss", net: -31, date: "2026-06-22" },
    { gameId: "den-dal", market: "ktl", side: "no", qty: 120, avg: 48, result: "win", net: 66.4, date: "2026-07-01" },
    { gameId: "buf-mia", market: "ktl", side: "yes", qty: 40, avg: 52, result: "loss", net: -20.8, date: "2026-06-20" },
  ],
  cancelled: [
    { gameId: "lal-gs", market: "gtl", side: "yes", qty: 120, limit: 35, date: "2026-07-02" },
    { gameId: "kc-sf", market: "ktl", side: "yes", qty: 60, limit: 41, date: "2026-07-01" },
  ],
};

const walletMarketLabels = { gtl: "Get the Lead", tie: "Tie", ktl: "Keep the Lead" };
const walletChevron = `<svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const walletMoney = (value) => `$${Math.abs(value).toFixed(2)}`;
const walletSigned = (value) => `${value >= 0 ? "+" : "-"}${walletMoney(value)}`;
const walletDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.valueOf()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

function walletFigures(order) {
  const g = walletGames[order.gameId];
  const cur = g.markets[order.market][order.side];
  const value = (cur / 100) * order.qty;
  const cost = (order.avg / 100) * order.qty;
  return { g, cur, value, cost, pnl: value - cost };
}

function walletOrderRow(order, type, index) {
  const g = walletGames[order.gameId];
  const betType = `${walletMarketLabels[order.market]} · <span class="side-${order.side}">${order.side.toUpperCase()}</span>`;
  let valueHTML = "";
  if (type === "open") {
    const { value, pnl } = walletFigures(order);
    valueHTML = `<span class="or-amount tnum">${walletMoney(value)}</span><span class="or-pnl ${pnl >= 0 ? "up" : "down"} tnum">${walletSigned(pnl)}</span>`;
  } else if (type === "pending") {
    valueHTML = `<span class="or-amount tnum">${walletMoney((order.limit / 100) * order.qty)}</span><span class="or-status">Pending</span>`;
  } else if (type === "cancelled") {
    valueHTML = `<span class="or-amount tnum">${walletMoney((order.limit / 100) * order.qty)}</span><span class="or-status cancelled">Cancelled</span>`;
  } else {
    const win = order.result === "win";
    valueHTML = `<span class="or-pnl ${win ? "up" : "down"} tnum">${walletSigned(order.net)}</span><span class="result-pill ${win ? "win" : "loss"}">${win ? "Won" : "Lost"}</span>`;
  }
  return `<button class="order-row" type="button" tabindex="-1" data-order-open="${type}:${index}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <span class="or-logos"><img src="${g.home.logo}" alt=""><img src="${g.away.logo}" alt=""></span>
    <span class="or-main"><span class="or-type">${betType}</span><span class="or-teams">${g.home.abbr} · ${g.away.abbr}${order.date ? ` · ${walletDate(order.date)}` : ""}</span></span>
    <span class="or-value">${valueHTML}</span>
    <span class="or-chev" aria-hidden="true">${walletChevron}</span>
  </button>`;
}

function walletOrderGroup(title, list, type, empty) {
  const rows = list.length ? list.map((order, index) => walletOrderRow(order, type, index)).join("") : `<div class="wallet-empty">${empty}</div>`;
  return `<div class="order-group"><div class="order-group-head"><h2>${title}</h2><span class="count">${list.length}</span></div><div class="order-list${list.length > 5 ? " is-collapsed" : ""}">${rows}</div>${list.length > 5 ? `<button class="order-showall" type="button" tabindex="-1" aria-expanded="false">Show all ${list.length}</button>` : ""}</div>`;
}

function walletStatsHTML(empty = false) {
  const positions = empty ? [] : walletUser.positions;
  const pending = empty ? [] : walletUser.pending;
  const settled = empty ? [] : walletUser.settled;
  const openPnl = positions.reduce((sum, order) => sum + walletFigures(order).pnl, 0);
  const openValue = positions.reduce((sum, order) => sum + walletFigures(order).value, 0);
  const settledNet = settled.reduce((sum, order) => sum + order.net, 0);
  const totalProfit = openPnl + settledNet;
  const totalBets = positions.length + pending.length + settled.length;
  const wins = settled.filter((order) => order.result === "win").length;
  const winRate = settled.length ? Math.round((wins / settled.length) * 100) : 0;
  const stat = (label, value, cls = "") => `<div class="pstat"><span class="pstat-k">${label}</span><span class="pstat-v ${cls} tnum">${value}</span></div>`;
  return `<div class="portfolio-stats">${stat("Total profit", walletSigned(totalProfit), totalProfit >= 0 ? "up" : "down")}${stat("Total bets", totalBets)}${stat("Win rate", `${winRate}%`)}${stat("Open value", walletMoney(openValue))}</div>`;
}

function walletFrameHTML({ tab = "active", empty = false } = {}) {
  const positions = empty ? [] : walletUser.positions;
  const pending = empty ? [] : walletUser.pending;
  const settled = empty ? [] : walletUser.settled;
  const cancelled = empty ? [] : walletUser.cancelled;
  return `<div class="flat-screen is-wallet">${homeHeader(true)}
    <main class="wallet container">
      <div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your live positions, pending limit orders and settled bets - all in one place.</p></div>
      ${walletStatsHTML(empty)}
      <div class="stats-tabs" id="orderTabs" role="tablist" aria-label="Orders">
        <button class="stats-tab${tab === "active" ? " is-active" : ""}" type="button" role="tab" tabindex="-1" aria-selected="${tab === "active"}">Orders</button>
        <button class="stats-tab${tab === "settled" ? " is-active" : ""}" type="button" role="tab" tabindex="-1" aria-selected="${tab === "settled"}">Settled</button>
      </div>
      <div class="order-panel" data-order-panel="active"${tab === "active" ? "" : " hidden"}>${walletOrderGroup("Current", positions, "open", "No current orders.")}${walletOrderGroup("Pending", pending, "pending", "No pending orders.")}</div>
      <div class="order-panel" data-order-panel="settled"${tab === "settled" ? "" : " hidden"}>${walletOrderGroup("Settled", settled, "settled", "No settled orders yet.")}${walletOrderGroup("Cancelled", cancelled, "cancelled", "No cancelled orders.")}</div>
    </main>
  </div>`;
}

function walletDetailFrameHTML(type, index) {
  const order = type === "pending" ? walletUser.pending[index] : type === "settled" ? walletUser.settled[index] : walletUser.positions[index];
  const g = walletGames[order.gameId];
  const betType = `${walletMarketLabels[order.market]} · <span class="side-${order.side}">${order.side.toUpperCase()}</span>`;
  let headline = "";
  let rows = "";
  let actions = "";
  if (type === "pending") {
    const value = (order.limit / 100) * order.qty;
    headline = `<span class="od-big tnum">${walletMoney(value)}</span>`;
    rows = `<div class="summary-row"><span>Your bet</span><strong>${betType}</strong></div>
          <div class="summary-row"><span>Status</span><strong><span class="status-chip pending">Pending</span></strong></div>
          <div class="summary-row"><span>Order date</span><strong>${walletDate(order.date)}</strong></div>
          <div class="summary-row"><span>Limit price</span><strong>${order.limit}¢</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row total"><span>Order value</span><strong>${walletMoney(value)}</strong></div>`;
    actions = `<div class="order-actions-dock"><div class="oad-inner"><button class="btn btn-secondary" type="button" tabindex="-1">Edit order</button><button class="btn btn-danger" type="button" tabindex="-1">Cancel order</button></div></div>`;
  } else if (type === "settled") {
    const win = order.result === "win";
    headline = `<span class="od-big ${win ? "up" : "down"} tnum">${walletSigned(order.net)}</span>`;
    rows = `<div class="summary-row"><span>Your bet</span><strong>${betType}</strong></div>
          <div class="summary-row"><span>Status</span><strong><span class="status-chip settled">Settled</span></strong></div>
          <div class="summary-row"><span>Order date</span><strong>${walletDate(order.date)}</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row"><span>Average price</span><strong>${order.avg}¢</strong></div>
          <div class="summary-row total"><span>Net return</span><strong>${walletSigned(order.net)}</strong></div>`;
  } else {
    const { cur, value, cost, pnl } = walletFigures(order);
    const up = pnl >= 0;
    headline = `<span class="od-big tnum">${walletMoney(value)}</span><span class="od-pnl ${up ? "up" : "down"} tnum">${walletSigned(pnl)}</span>`;
    rows = `<div class="summary-row"><span>Your bet</span><strong>${betType}</strong></div>
          <div class="summary-row"><span>Status</span><strong><span class="status-chip open">Current</span></strong></div>
          <div class="summary-row"><span>Order date</span><strong>${walletDate(order.date)}</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row"><span>Average price</span><strong>${order.avg}¢</strong></div>
          <div class="summary-row"><span>Current price</span><strong>${cur}¢</strong></div>
          <div class="summary-row"><span>Cost basis</span><strong>${walletMoney(cost)}</strong></div>
          <div class="summary-row total"><span>Current value</span><strong>${walletMoney(value)}</strong></div>`;
    actions = `<div class="order-actions-dock"><div class="oad-inner"><button class="btn btn-secondary" type="button" tabindex="-1">Buy More</button><button class="btn btn-primary" type="button" tabindex="-1">Sell</button></div></div>`;
  }
  return `<div class="flat-screen is-wallet is-wallet-detail">${homeHeader(true)}
    <main class="wallet container">
      <button class="order-back" type="button" tabindex="-1">${walletChevron}<span>Orders</span></button>
      <div class="order-detail">
        <div class="od-game"><span class="or-logos"><img src="${g.home.logo}" alt=""><img src="${g.away.logo}" alt=""></span><span class="od-game-meta"><span class="od-teams">${g.home.abbr} ${g.home.score} · ${g.away.score} ${g.away.abbr}</span><span class="od-league">${g.league.toUpperCase()} · ${g.period} ${g.clock}</span></span></div>
        <div class="od-headline">${headline}</div>
        <div class="summary od-summary">
          ${rows}
        </div>
      </div>
      ${actions}
    </main>
  </div>`;
}

function renderTrackerFrame(mode) {
  if (mode === "loading") return `<div class="flat-screen is-wallet">${homeHeader(true)}<main class="wallet container"><div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your live positions, pending limit orders and settled bets - all in one place.</p></div>${flatLoading()}</main></div>`;
  if (mode === "error") return `<div class="flat-screen is-wallet">${homeHeader(true)}<main class="wallet container"><div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your live positions, pending limit orders and settled bets - all in one place.</p></div><div class="wallet-empty wallet-error-state"><strong>Positions unavailable</strong><span>Could not load open exposure.</span><button class="btn btn-secondary" type="button" tabindex="-1">Reload</button></div></main></div>`;
  if (mode === "empty") return walletFrameHTML({ empty: true });
  if (mode === "detailCurrent") return walletDetailFrameHTML("open", 0);
  if (mode === "detailPending") return walletDetailFrameHTML("pending", 0);
  if (mode === "detailSettled") return walletDetailFrameHTML("settled", 0);
  return walletFrameHTML({ tab: mode === "settled" ? "settled" : "active" });
}

function accountProfileHTML({ email, provider, hasPassword }) {
  const providerLabel = provider === "google" ? "Google" : provider === "apple" ? "Apple" : "Email and password";
  const providerClass = provider === "google" ? "google" : provider === "apple" ? "apple" : "password";
  const providerMark = provider === "google" ? "G" : provider === "apple" ? "Apple" : "••";
  return `<h2 class="flat-hero-title">Account</h2>
    <div class="flat-card account-profile-card">
      <div class="account-avatar">A</div>
      <div class="account-profile-copy">
        <h3>Alex</h3>
        <p>${email}</p>
      </div>
    </div>
    <div class="account-settings-list">
      <div class="account-setting-row"><span>Email</span><strong>${email}</strong></div>
      <div class="account-setting-row"><span>Connected with</span><strong><span class="account-provider ${providerClass}"><span>${providerMark}</span>${providerLabel}</span></strong></div>
      <div class="account-setting-row"><span>Notifications</span><strong>On</strong></div>
    </div>
    ${hasPassword ? `<button class="flat-primary account-password-action" type="button" tabindex="-1">Change password</button>` : `<p class="account-auth-note">Password changes are managed through your ${providerLabel} account.</p>`}`;
}

function renderAccountFrame(mode) {
  if (mode === "loading") return `<div class="flat-screen">${flatHeader("GTL", "Account")}${flatLoading()}</div>`;
  if (mode === "error") return `<div class="flat-screen">${flatHeader("GTL", "Account")}${flatStatus("error", "Account unavailable", "We could not load your account.")}</div>`;
  const content = {
    overview: accountProfileHTML({ email: "alex@gtl.test", provider: "password", hasPassword: true }),
    profilePassword: accountProfileHTML({ email: "alex@gtl.test", provider: "password", hasPassword: true }),
    profileGoogle: accountProfileHTML({ email: "alex.morgan@gmail.com", provider: "google", hasPassword: false }),
    profileApple: accountProfileHTML({ email: "alex@icloud.com", provider: "apple", hasPassword: false }),
  }[mode];
  return `<div class="flat-screen">${flatHeader("GTL", "Account")}${content}</div>`;
}

function renderFlatFrame(frame) {
  const renderers = {
    auth: renderAuthFrame,
    home: renderHomeFrame,
    welcome: renderWelcomeFrame,
    location: renderLocationFrame,
    ranking: renderRankingFrame,
    game: renderGameFrame,
    drawer: renderDrawerFrame,
    tracker: renderTrackerFrame,
    account: renderAccountFrame,
  };
  const screen = renderers[frame.type](frame.mode);
  return `<article class="flat-frame-wrap flat-frame--${frame.type}"><div class="flat-frame-label">${frame.label}</div><div class="flat-phone">${screen}</div></article>`;
}

function renderFlatDocSection(doc) {
  return `<section class="flat-page-group"><div class="flat-doc-head"><h2>${doc.title}</h2><p>${doc.description}</p></div>
    ${doc.groups.map((group) => `<section class="flat-group"><div class="flat-group-title"><h3>${group.title}</h3></div><div class="flat-frame-row">${group.frames.map(renderFlatFrame).join("")}</div></section>`).join("")}</section>`;
}

function renderFlatDocTabs() {
  if (!flatDocTabs) return;
  flatDocTabs.innerHTML = flatDocOrder
    .filter((key) => flatDocViews[key])
    .map((key) => {
      const active = key === activeFlatDoc;
      return `<button class="${active ? "is-active" : ""}" type="button" data-flat-doc="${key}" role="tab" aria-selected="${String(active)}">${flatDocTabLabels[key] || flatDocViews[key].title}</button>`;
    })
    .join("");
}

function syncFlatDeviceTabs() {
  const pagesActive = document.getElementById("pages")?.classList.contains("is-active-section");
  flatDeviceTabs.forEach((button) => {
    const active = button.dataset.flatDevice === activeFlatDevice;
    button.classList.toggle("is-device-active", active);
    button.classList.toggle("is-active", Boolean(pagesActive && active));
    button.setAttribute("aria-selected", String(active));
  });
}

function renderFlatDevice(device = activeFlatDevice, docKey = activeFlatDoc) {
  if (!flatLayContent) return;
  activeFlatDevice = ["mobile", "tablet", "desktop"].includes(device) ? device : "mobile";
  activeFlatDoc = flatDocViews[docKey] ? docKey : flatDocOrder.find((key) => flatDocViews[key]) || Object.keys(flatDocViews)[0];
  flatLayContent.dataset.flatDevice = activeFlatDevice;
  flatLayContent.innerHTML = renderFlatDocSection(flatDocViews[activeFlatDoc]);
  renderFlatDocTabs();
  syncFlatDeviceTabs();
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
    if (link.dataset.flatDevice) {
      link.classList.toggle("is-active", nextId === "pages" && link.dataset.flatDevice === activeFlatDevice);
    } else {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${nextId}`);
    }
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
    renderFlatDevice(button.dataset.flatDevice, activeFlatDoc);
  });
});

flatDocTabs?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-flat-doc]");
  if (!button) return;
  renderFlatDevice(activeFlatDevice, button.dataset.flatDoc);
});

window.addEventListener("hashchange", () => {
  showSection(sectionFromHash(), { instant: true });
});

createLimitOpenDrawerState();
setDrawerView(drawerSection?.dataset.drawerViewMode);
drawerSection?.querySelectorAll(".bet-sheet").forEach(updateDrawerPreview);
setPageZoom(pageZoom);
if (pageTabs.length) loadPagePreview(document.querySelector("[data-page-tab].is-active") || pageTabs[0]);
renderFlatDevice(document.querySelector("[data-flat-device].is-device-active")?.dataset.flatDevice || "mobile", activeFlatDoc);
showSection(sectionFromHash(), { instant: true });
describeColorSwatches();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});
