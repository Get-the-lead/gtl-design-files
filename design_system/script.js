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
const individualPageSections = document.querySelectorAll("[data-individual-page]");
const designSystemThemeStorageKey = "gtl-theme";
const standardThemeSectionIds = [
  "tokens",
  "spacing",
  "radius",
  "shadows",
  "borders",
  "effects",
  "typography",
  "buttons",
  "pills",
  "forms",
  "drawers",
  "navigation",
  "cards",
  "tables",
  "feedback",
  "dialogs",
];

function normalizeDesignSystemTheme(value) {
  return value === "light" ? "light" : "dark";
}

function designSystemThemeToggle(label) {
  return `<div class="ds-theme-toggle" role="group" aria-label="${label} color theme">
    <button type="button" data-ds-theme="dark" aria-label="Dark mode" title="Dark mode" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">dark_mode</span></button>
    <button type="button" data-ds-theme="light" aria-label="Light mode" title="Light mode" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">light_mode</span></button>
  </div>`;
}

function currentDesignSystemTheme() {
  return normalizeDesignSystemTheme(document.documentElement.dataset.theme);
}

function syncDesignSystemThemeToggles() {
  const theme = currentDesignSystemTheme();
  document.querySelectorAll("[data-ds-theme]").forEach((button) => {
    const active = button.dataset.dsTheme === theme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setDesignSystemTheme(theme, { persist = true } = {}) {
  const nextTheme = normalizeDesignSystemTheme(theme);
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  if (persist) {
    try { localStorage.setItem(designSystemThemeStorageKey, nextTheme); } catch (error) { /* Storage can be unavailable in private browsing. */ }
  }
  syncDesignSystemThemeToggles();
}

function installDesignSystemThemeToggles() {
  [
    [document.querySelector("#overview > .ds-overview-intro"), "Overview"],
    [document.querySelector("#update-log > .ds-update-log-intro"), "Update Log"],
  ].forEach(([intro, label]) => {
    if (!intro || intro.querySelector(".ds-theme-toggle")) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = designSystemThemeToggle(label);
    intro.append(wrapper.firstElementChild);
  });

  individualPageSections.forEach((section) => {
    const actions = section.querySelector(".ds-page-actions");
    if (!actions || actions.querySelector(".ds-theme-toggle")) return;
    const docKey = section.dataset.individualPage;
    const title = individualPageDocumentation[docKey]?.title || flatDocViews[docKey]?.title || "Page";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = designSystemThemeToggle(title);
    actions.append(wrapper.firstElementChild);
  });

  standardThemeSectionIds.forEach((id) => {
    const section = document.getElementById(id);
    const header = section?.querySelector(":scope > .section-header");
    if (!header || header.querySelector(".ds-theme-toggle")) return;
    const title = header.querySelector("h2")?.textContent?.trim() || "Components";
    const copy = document.createElement("div");
    copy.className = "ds-section-heading-copy";
    while (header.firstChild) copy.append(header.firstChild);
    header.classList.add("ds-theme-header");
    header.append(copy);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = designSystemThemeToggle(title);
    header.append(wrapper.firstElementChild);
  });

  syncDesignSystemThemeToggles();
}

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
    description: "The single implemented login and account-creation flows, including their inline validation and password-recovery states.",
    groups: [
      { title: "Login Flow", frames: [
        { label: "Email or Phone", type: "auth", mode: "loginIdentifier" },
        { label: "Verification Code", type: "auth", mode: "loginVerify" },
        { label: "Password Option", type: "auth", mode: "loginPassword" },
      ] },
      { title: "Create Account Flow", frames: [
        { label: "Email or Social", type: "auth", mode: "signupEmail" },
        { label: "Add Phone Number", type: "auth", mode: "signupPhone" },
        { label: "Verify Phone", type: "auth", mode: "signupVerify" },
        { label: "Create Password", type: "auth", mode: "signupPassword" },
      ] },
      { title: "Recovery", frames: [
        { label: "Forgot Password", type: "auth", mode: "forgot" },
        { label: "Check Your Email", type: "auth", mode: "forgotSent" },
      ] },
      { title: "Inline Validation", frames: [
        { label: "Login Identifier Error", type: "auth", mode: "loginIdentifierError" },
        { label: "Login Code Error", type: "auth", mode: "loginVerifyError" },
        { label: "Login Password Error", type: "auth", mode: "loginPasswordError" },
        { label: "Signup Email Error", type: "auth", mode: "signupEmailError" },
        { label: "Signup Phone Error", type: "auth", mode: "signupPhoneError" },
        { label: "Signup Code Error", type: "auth", mode: "signupVerifyError" },
        { label: "Signup Password Error", type: "auth", mode: "signupPasswordError" },
        { label: "Recovery Email Error", type: "auth", mode: "forgotError" },
      ] },
    ],
  },
  home: {
    title: "Home Page",
    description: "Homepage variants for guest, signed-in, market availability, trade context, and failure states.",
    groups: [
      { title: "Unauthenticated", frames: [
        { label: "Logged out default", type: "home", mode: "guest" },
        { label: "Geo-restricted location", type: "location", mode: "default" },
        { label: "No live games", type: "home", mode: "noLive" },
        { label: "NBA selected", type: "home", mode: "nba" },
        { label: "Loading state", type: "home", mode: "loading" },
        { label: "Error / empty state", type: "home", mode: "error" },
      ] },
      { title: "Authenticated", frames: [
        { label: "No open trades", type: "home", mode: "logged" },
        { label: "Open trades — multiple games", type: "tradeLayout", mode: "homeAll" },
        { label: "Open trades — one game", type: "tradeLayout", mode: "homeSingle" },
      ] },
    ],
  },
  welcome: {
    title: "Welcome Page",
    description: "The implemented post-signup onboarding flow covers the timed account-setup transition, personal details, age eligibility, username selection, and welcome credits.",
    groups: [
      { title: "Onboarding Flow", frames: [
        { label: "Account Setup Transition", type: "welcome", mode: "intro" },
        { label: "Personal Details", type: "welcome", mode: "details" },
        { label: "Username And Welcome Credits", type: "welcome", mode: "username" },
      ] },
      { title: "Validation States", frames: [
        { label: "Personal Details Required", type: "welcome", mode: "detailsRequired" },
        { label: "Age Eligibility Error", type: "welcome", mode: "underage" },
        { label: "Username Required", type: "welcome", mode: "usernameRequired" },
        { label: "Username Format Error", type: "welcome", mode: "usernameInvalid" },
      ] },
    ],
  },
  game: {
    title: "Game Page",
    description: "Game detail page variants covering live market access, unavailable markets, trade context, refresh, and errors.",
    groups: [
      { title: "Default states", frames: [
        { label: "Live game default — no logos", type: "game", mode: "live" },
        { label: "Starting soon countdown", type: "game", mode: "countdown" },
        { label: "Final - away team won", type: "game", mode: "final" },
        { label: "Pregame unavailable", type: "game", mode: "pregame" },
        { label: "Betting paused after score change", type: "game", mode: "paused" },
        { label: "NFL game stats selected", type: "game", mode: "gameStatsNFL" },
      ] },
      { title: "Open Trades", frames: [
        { label: "My Game Trades", type: "tradeLayout", mode: "liveGame" },
        { label: "Open Trades Menu — all games", type: "tradeLayout", mode: "menuAll" },
        { label: "Open Trades Menu — selected game", type: "tradeLayout", mode: "menuGame" },
      ] },
      { title: "Logo reference — future use", frames: [
        { label: "Live NFL game with licensed team logos", type: "game", mode: "liveLogos" },
        { label: "NFL game stats with licensed team logos", type: "game", mode: "gameStatsLogos" },
      ] },
    ],
  },
  drawer: {
    title: "Buy / Sell Drawer",
    description: "Bottom-sheet states for market orders, limit orders, validation, confirmation, and outcomes.",
    groups: [
      { title: "Order entry", frames: [
        { label: "Buy market order", type: "drawer", mode: "buyMarket" },
        { label: "Change bet type", type: "drawer", mode: "changeBetType" },
        { label: "Trading paused", type: "drawer", mode: "paused" },
        { label: "Buy limit order", type: "drawer", mode: "buyLimit" },
        { label: "Sell market order", type: "drawer", mode: "sellMarket" },
      ] },
      { title: "Feedback states", frames: [
        { label: "Insufficient balance", type: "drawer", mode: "balance" },
        { label: "Invalid limit price", type: "drawer", mode: "invalid" },
        { label: "Buy confirmation", type: "drawer", mode: "confirmBuy" },
        { label: "Sell confirmation", type: "drawer", mode: "confirmSell" },
        { label: "Error state", type: "drawer", mode: "error" },
      ] },
    ],
  },
  tracker: {
    title: "Portfolio",
    description: "Wallet portfolio states from wallet.html for open trades, pending limit orders, settled bets, cancelled orders, and order detail.",
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
    title: "Profile & Settings Page",
    description: "Profile and settings states, connected-account variants, and the account-management subpages.",
    groups: [
      { title: "Profile & Settings", frames: [
        { label: "Email and password account", type: "account", mode: "profilePassword" },
        { label: "Edit username", type: "account", mode: "editUsername" },
        { label: "Google account", type: "account", mode: "profileGoogle" },
        { label: "Apple account", type: "account", mode: "profileApple" },
        { label: "Signed out", type: "account", mode: "signedOut" },
      ] },
      { title: "Account management", frames: [
        { label: "Betting Controls", type: "account", mode: "bettingControls" },
        { label: "Delete Account", type: "account", mode: "deleteAccount" },
      ] },
    ],
  },
};

const gameVariantDocumentation = {
  live: {
    summary: "The standard in-play Game page while the market is open and live prices are available.",
    trigger: "Use when the feed supplies an active period, a non-empty game clock, and tradable GTL/TIE/KTL markets.",
    changes: "Market Stats is selected initially. Prices are enabled. The production no-logo treatment uses abbreviation marks with full team names beneath them.",
    data: "League, period, clock, both teams’ names/abbreviations/scores/colours, and complementary Yes/No prices for all three markets are required.",
    behavior: "Update the clock and scores from the live feed. Selecting a price opens the Buy drawer with game, market, side, and current prices preserved.",
  },
  countdown: {
    summary: "The pre-start countdown before game data and trading become live.",
    trigger: "Use only after the game is scheduled but before play begins, when a reliable remaining-start duration is available.",
    changes: "Show a blue dot and blue countdown copy, a 0–0 score, disabled dash prices, an empty market book, and Market Stats selected.",
    data: "Scheduled game, both teams, league, team colours, and a countdown value are required; live period, score, and order-book values are intentionally absent.",
    behavior: "Count down without enabling prices. At zero, replace this state with the live state from a fresh feed response rather than mutating placeholder values.",
  },
  final: {
    summary: "The terminal Game state after the official result is confirmed.",
    trigger: "Use when the normalized feed status is Final or FT and the final score has been accepted.",
    changes: "Replace period and clock with the gold Final status, retain the completed score, disable settled prices, and keep Market Stats as the initial mobile/tablet panel.",
    data: "Final status, official score, team identity/colours, and settled market outcomes are required. Do not derive Final from a zero clock alone.",
    behavior: "No new bet may be initiated. Existing market and game statistics remain readable and desktop continues to expose both statistics sections.",
  },
  pregame: {
    summary: "An active game whose markets cannot open until a team first takes the lead.",
    trigger: "Use when play has begun but the score is tied and the market payload explicitly reports waiting-for-first-lead.",
    changes: "Keep the live period and clock, show the waiting explanation, replace every price with a disabled dash, and render empty Market Stats.",
    data: "Active clock/period, tied score, team identity, and the non-clearing waiting reason are required.",
    behavior: "Do not auto-enable from a local score calculation. Re-render from the next feed event that supplies an open market after a lead is established.",
  },
  paused: {
    summary: "A temporary trading lock while prices are recalculated after a scoring or feed event.",
    trigger: "Use when the market service reports a clearing recalculation state for an otherwise active game.",
    changes: "Show the recalculation banner, retain the current score and last prices for context, and disable all market-price controls until replacement prices arrive.",
    data: "The last stable game/market snapshot plus a clearing pause reason are required. The implementation demo clears after roughly 1.6 seconds.",
    behavior: "Keep statistics available, prevent drawer entry and submissions, then atomically replace all complementary prices before re-enabling interaction.",
  },
  gameStatsNFL: {
    summary: "The standard live NFL Game page with the Game Stats tab selected.",
    trigger: "Use after the customer selects Game Stats on mobile/tablet; desktop renders this section alongside Market Stats without a toggle.",
    changes: "Only the selected tab/panel changes. Show the score worm, lead-change and tie totals, followed by five NFL comparison rows.",
    data: "Score history, team colours, and NFL stats in the required order: total, pass, rush, possession, and turnovers.",
    behavior: "Preserve the current game and market state while switching panels. Update aria-selected and hidden so exactly one panel is exposed on mobile/tablet.",
  },
  liveLogos: {
    summary: "Future-use NFL live-market reference using licensed team artwork.",
    trigger: "Use only when NFL logo licensing and asset delivery are approved; this is not the current production no-logo default.",
    changes: "Replace abbreviation marks with NFL logos and display team initials beneath each logo. All other live-market layout and behavior remains unchanged.",
    data: "The normal live NFL payload plus validated transparent logo assets and textual abbreviation fallbacks are required.",
    behavior: "If an image fails, fall back to the abbreviation mark without changing layout. Never substitute an NBA example in this reference group.",
  },
  gameStatsLogos: {
    summary: "Future-use NFL Game Stats reference using licensed team artwork.",
    trigger: "Use only when licensed NFL assets are approved and the Game Stats view is selected.",
    changes: "Use NFL logos with initials beneath them in the scorecard; keep compact abbreviation marks inside the comparison card and select Game Stats.",
    data: "Licensed NFL logos, abbreviation fallbacks, score history, and the five required NFL comparison statistics are required.",
    behavior: "Logo failure must degrade to initials. Tab semantics, responsive panel behavior, score worm, and market state remain identical to the no-logo implementation.",
  },
};

const rankingVariantDocumentation = {
  signedOut: {
    summary: "The public leaderboard before a customer has authenticated.",
    trigger: "Use whenever Ranking is opened without a valid authenticated session.",
    changes: "The top ten remain visible, the customer-position row is omitted, and month options replace private ranks with ‘Sign in to view’.",
    data: "Competition month, reset deadline, public top-ten usernames, balances, and prizes are required; no customer result is requested.",
    behavior: "Keep the leaderboard readable. Authentication is required before exposing a customer’s current or historical rank.",
  },
  signedOutMonths: {
    summary: "The public month selector expanded before authentication.",
    trigger: "Use while a signed-out visitor opens the competition-month selector.",
    changes: "Show the same available months as the authenticated selector, but replace every private rank with ‘Sign in to view’.",
    data: "Only the public available-month range is required; do not fetch or embed customer ranking history.",
    behavior: "Selecting a month may update the public top ten, but private rank labels remain gated. Click-away and Escape close the list.",
  },
  current: {
    summary: "The authenticated leaderboard for the current competition month.",
    trigger: "Use after authentication when the current month is selected and the customer sits outside the top ten.",
    changes: "Show the signed-in header and add the customer’s green highlighted row below the top-ten list.",
    data: "Public top ten plus the customer’s current rank, username, credit balance, prize, and the competition reset deadline are required.",
    behavior: "Keep the customer row separate when outside the top ten. If the customer reaches positions 1–10, render them in that ranked row and hide the separate slot.",
  },
  months: {
    summary: "The expanded competition-month selector for an authenticated customer.",
    trigger: "Use while the month trigger is open, before a new month has been chosen.",
    changes: "Rotate the trigger chevron, apply the open treatment, and show available months newest-first with the customer’s rank for each month.",
    data: "Every available month needs its calendar month, year context, customer rank, balance, and prize result.",
    behavior: "The selected option uses aria-selected. Selection updates the label and leaderboard, then closes the list; click-away and Escape also close it.",
  },
  historical: {
    summary: "A completed historical month after the customer selects it from the month menu.",
    trigger: "Use after an authenticated customer selects any available month before the current competition.",
    changes: "Update the month label and all leaderboard rows. Here the customer is sixth, so ‘You’ appears directly inside the top ten and no detached current row is shown.",
    data: "Use one internally consistent archived result set: month, ordered competitors, balances, fixed prizes, and the customer’s archived rank.",
    behavior: "Animate reordered rows only when motion is allowed. Do not combine current-month rows with historical customer data.",
  },
  resultOutside: {
    summary: "The completed-competition result for a customer outside the prize-paying top ten.",
    trigger: "Show once after reset for an authenticated customer whose completed rank is greater than ten.",
    changes: "Dim the page, center the result dialog, omit prize and celebration artwork, and place the standalone Close button at the bottom safe area.",
    data: "Completed month, final rank, and the next competition month are required.",
    behavior: "Close is a sibling of the dialog, not part of its body. Backdrop click, Close, or Escape dismisses the result without changing leaderboard data.",
  },
  resultWinner: {
    summary: "The completed-competition result for a prize winner in positions 4–10.",
    trigger: "Show once after reset when the authenticated customer finished inside the top ten but outside the podium.",
    changes: "Add the prize value and celebration layer while retaining the standard result-dialog proportions and standalone bottom Close button.",
    data: "Completed month, final rank, exact prize label, and customer identity are required.",
    behavior: "Announce the result as a modal, expose the prize as text, and direct fulfillment to the GTL follow-up process. Respect reduced-motion preferences.",
  },
  resultTopThree: {
    summary: "The enhanced completed-competition result for a podium finish.",
    trigger: "Show once after reset when the authenticated customer finished first, second, or third.",
    changes: "Add the ranked medal, top-three dialog offset, prize value, and celebration layer; Close remains independent at the bottom safe area.",
    data: "Completed month, podium rank, exact prize label, and customer identity are required.",
    behavior: "Keep rank visible in both the title and medal. The celebration is decorative and must be hidden from assistive technology and reduced-motion users.",
  },
};

const authVariantDocumentation = {
  loginIdentifier: {
    summary: "The single implemented entry point for returning customers, combining social providers with one email-or-phone field.",
    trigger: "Show whenever a signed-out customer selects Login.",
    changes: "Offer Google and Apple first, followed by the labelled Email or phone field and one Continue action.",
    data: "Identifier value, provider availability, authentication errors, and the preserved post-login destination are required.",
    behavior: "Normalize and classify a valid email or 10-digit US phone number, request the six-digit challenge, and advance in the same card. Social success completes login directly.",
  },
  loginIdentifierError: {
    summary: "Inline validation for the unified Login identifier field.",
    trigger: "Show after Continue when the field is empty or is neither a valid email nor a 10-digit US phone number.",
    changes: "Keep the submitted value, mark the field, and show the exact applicable message directly beneath it.",
    data: "The submitted identifier and whether it is empty or malformed are required.",
    behavior: "Focus the identifier, announce the error, clear it as the customer edits, and do not request a challenge until validation passes.",
  },
  loginVerify: {
    summary: "Six-digit verification for the identifier submitted on Login.",
    trigger: "Show after the Login challenge has been successfully requested.",
    changes: "Replace identifier entry with six code boxes, masked destination context, Login, Enter Password, Back, and Resend controls.",
    data: "Masked destination, challenge identifier, six-digit code, expiry, resend cooldown, attempt count, and service state are required.",
    behavior: "Support numeric paste and sequential focus, preserve the identifier on Back, throttle Resend, and complete login only after server verification.",
  },
  loginVerifyError: {
    summary: "Incomplete-code feedback for Login verification.",
    trigger: "Show when Login is selected without a complete six-digit code.",
    changes: "Retain entered digits, mark the code group, and show Enter the 6-digit verification code beneath it.",
    data: "The current challenge and entered digits are required.",
    behavior: "Focus the first empty box, announce the group error, and clear it when all six digits are present.",
  },
  loginPassword: {
    summary: "The password alternative within the same implemented Login flow.",
    trigger: "Show only after Enter Password is selected from Login verification.",
    changes: "Replace the code group with one password field, visibility control, Forgot Password, and Login; Back returns to verification.",
    data: "The preserved account identifier, password, recovery destination, authentication result, and post-login destination are required.",
    behavior: "Never discard the identifier when switching methods. Submit securely, expose visibility without changing the value, and retain recovery access.",
  },
  loginPasswordError: {
    summary: "Required-password feedback for the Login password alternative.",
    trigger: "Show after Login is selected with an empty password.",
    changes: "Mark the password field and show Enter your password directly beneath it.",
    data: "The preserved identifier and empty password validation result are required.",
    behavior: "Focus the password field, announce the message, clear it as input begins, and never retain the password after route change or completion.",
  },
  forgot: {
    summary: "Password recovery entry reached from the password alternative in the unified Login flow.",
    trigger: "Show after Forgot Password is selected from Enter Your Password.",
    changes: "Request the account email and retain a Back to Login route.",
    data: "Email, reset-token lifetime, resend policy, and a neutral delivery response are required.",
    behavior: "Validate before submission and never reveal whether the account exists. Back returns to the canonical Login route.",
  },
  forgotError: {
    summary: "Inline email validation for password recovery.",
    trigger: "Show after Send Reset Link when the email field is empty or malformed.",
    changes: "Retain and mark the email field and show the applicable validation message beneath it.",
    data: "The submitted email and validation result are required.",
    behavior: "Focus the field, announce the error, clear it during editing, and create no recovery request until valid.",
  },
  forgotSent: {
    summary: "Non-enumerating confirmation after a valid recovery request.",
    trigger: "Show after the recovery service accepts the request regardless of account existence.",
    changes: "Replace the form with Check Your Email, delivery guidance, and Back to Login.",
    data: "Submitted email, neutral delivery response, token expiry, and support route are required.",
    behavior: "Announce the confirmation, avoid exposing account existence, and return only to the canonical Login route.",
  },
  signupEmail: {
    summary: "The first step of the single implemented Create Account flow.",
    trigger: "Show when a signed-out customer selects Create Account.",
    changes: "Offer Google and Apple or a labelled email field, Continue with Email, and Terms and Privacy links.",
    data: "Email or social-provider identity, provider availability, consent copy, and service state are required.",
    behavior: "A valid email or successful social provider advances to phone collection; social signup does not skip the remaining account-security steps.",
  },
  signupEmailError: {
    summary: "Inline email validation for Create Account.",
    trigger: "Show after Continue with Email when the field is empty or malformed.",
    changes: "Retain and mark the email field and show Enter your email or Enter a valid email address beneath it.",
    data: "The submitted email and validation result are required.",
    behavior: "Focus and announce the field error, clear it during editing, and do not advance until valid.",
  },
  signupPhone: {
    summary: "Phone collection for every Create Account route, including social signup.",
    trigger: "Show after the email or social identity step succeeds.",
    changes: "Replace identity selection with Add Your Phone Number, the US-only hint, Back, and Continue.",
    data: "Normalized US phone number, existing identity context, SMS capability, and service state are required.",
    behavior: "Preserve the identity context on Back, validate a 10-digit US number, then request the verification challenge.",
  },
  signupPhoneError: {
    summary: "Inline phone validation for Create Account.",
    trigger: "Show after Continue when the phone is empty or not a valid 10-digit US number.",
    changes: "Retain and mark the phone field while keeping its US-only hint visible and adding the applicable error.",
    data: "The submitted phone and validation result are required.",
    behavior: "Focus and announce the field error, clear it during editing, and do not request SMS until valid.",
  },
  signupVerify: {
    summary: "Six-digit phone verification within Create Account.",
    trigger: "Show after a challenge is successfully sent to the supplied phone number.",
    changes: "Replace phone entry with Verify Your Phone, the formatted destination, six code boxes, Continue, Back, and Resend.",
    data: "Phone number, challenge identifier, six-digit code, expiry, resend cooldown, attempt count, and errors are required.",
    behavior: "Support numeric paste and sequential focus, preserve the number on Back, throttle Resend, and advance only after server verification.",
  },
  signupVerifyError: {
    summary: "Incomplete-code feedback for Create Account phone verification.",
    trigger: "Show after Continue without a complete six-digit code.",
    changes: "Retain entered digits, mark the group, and show Enter the 6-digit code we sent you beneath it.",
    data: "The current challenge and entered digits are required.",
    behavior: "Focus the first empty box, announce the group error, and clear it when all six digits are present.",
  },
  signupPassword: {
    summary: "The final Create Account security step before Welcome onboarding.",
    trigger: "Show after the phone challenge is verified.",
    changes: "Collect Password and Confirm password with visibility controls, security guidance, Back, and Create Account.",
    data: "Verified identity, password, confirmation value, minimum-length rule, and account-creation result are required.",
    behavior: "Require at least eight characters and matching values. On success create the account and route to Welcome for personal details and username.",
  },
  signupPasswordError: {
    summary: "Password-policy or confirmation feedback for the final Create Account step.",
    trigger: "Show after Create Account when either password is missing, too short, or does not match.",
    changes: "Retain non-sensitive form context, mark the affected field, and show the exact applicable message beneath it.",
    data: "Password-policy and confirmation-match results are required; passwords must never enter analytics or logs.",
    behavior: "Focus the first invalid password field, announce its error, and create no account until all rules pass.",
  },
};

const standaloneVariantDocumentation = {
  welcome: {
    intro: { summary: "The timed celebration and account-setup transition shown immediately after registration succeeds.", trigger: "Show once after account creation or verification has completed and the Welcome route opens.", changes: "Display the celebration treatment, Welcome to GTL message, and Setting up your account status with an active spinner.", data: "A confirmed account session and the onboarding destination state are required; no additional customer input is collected here.", behavior: "Keep this state visible for 3.2 seconds, then apply the 280ms transition-out before revealing Personal Details. Use a 900ms delay and suppress decorative motion when reduced motion is requested." },
    details: { summary: "The personal-details step that follows the automatic account-setup transition.", trigger: "Show after the intro transition completes and before a valid name and birthday have been submitted.", changes: "Replace the celebration with first name, last name, and Month/Day/Year controls plus the 18+ eligibility hint.", data: "Given name, family name, complete date of birth, and the current date used for age calculation are required.", behavior: "Validate on Continue, preserve entered values, focus the first invalid control, and advance only when every field is valid and the customer is at least 18." },
    username: { summary: "The final onboarding step where the customer claims welcome credits and chooses a public username.", trigger: "Show only after Personal Details have passed required-field and age validation.", changes: "Show One last step, the 1,500-credit ticket, username guidance, and Start Betting action.", data: "Welcome-credit amount, username value, format rules, availability result, and authenticated account are required.", behavior: "Validate and reserve the username before claiming credits. Successful submission completes onboarding and routes to Home." },
    detailsRequired: { summary: "Required-field feedback for an incomplete Personal Details submission.", trigger: "Use after Continue when one or more name or birthday values are missing or do not form a real date.", changes: "Mark the affected controls and show specific first-name, last-name, and birthday messages directly beneath their fields.", data: "The submitted values and per-field validity results are required.", behavior: "Retain valid entries, focus the first invalid control, announce its error, and clear each error as that value becomes valid." },
    underage: { summary: "Age-eligibility feedback for a valid birthday belonging to someone under 18.", trigger: "Use after Continue when all details are present but the calculated age is below 18.", changes: "Keep the entered date visible, mark the birthday group, and show GTL is for users 18 or older.", data: "A valid date of birth and a timezone-safe current date are required.", behavior: "Do not advance or create the welcome-credit claim. Recalculate eligibility whenever the birthday changes." },
    usernameRequired: { summary: "Required-field feedback when the final username is empty.", trigger: "Use after Start Betting is selected without a username.", changes: "Mark the username field and show Choose a username beneath the guidance.", data: "The empty submitted value and validation result are required.", behavior: "Keep the credit context visible, focus the username field, and clear the message once input resumes." },
    usernameInvalid: { summary: "Format feedback when the proposed username violates the implemented character rules.", trigger: "Use after Start Betting when the value is not 3–20 letters, numbers, or underscores.", changes: "Preserve and mark the proposed value, then show the complete format rule beneath the field.", data: "Submitted username, normalized value, format result, and—after format passes—availability result are required.", behavior: "Do not claim credits or leave Welcome until validation succeeds. Availability conflicts need a distinct safe customer-facing error." },
  },
  waitlist: {
    default: { summary: "The standard public landing page for a visitor who has not joined the waitlist on this browser." },
    error: { summary: "The email field retains the entered value and displays a clear inline message when the address is missing or invalid." },
    duplicate: { summary: "A valid email that is already registered remains editable and displays an inline already-on-the-waitlist message." },
    joining: { summary: "A non-dismissible progress message confirms that a valid waitlist request is currently being saved." },
    confirmed: { summary: "A successful submission confirms early access and offers the customer a Share with Friends action." },
    alreadyJoined: { summary: "Returning visitors see a persistent confirmation panel with their saved email and a Share with Friends action, without submitting again." },
    sharing: { summary: "The sharing state provides the approved public waitlist link with a clear copy action and confirmation feedback." },
  },
  contact: {
    default: { summary: "The empty structured support-request form.", trigger: "Use when Contact opens or after Send Another Message.", changes: "Show the introductory SLA note and blank name, email, topic, and message fields.", data: "Topic options, maximum message length, privacy copy, and delivery configuration.", behavior: "Update the character count while typing and submit only after required fields validate." },
    prefilled: { summary: "Contact opened by an authenticated customer whose account profile can prefill identity fields.", trigger: "Use when the shared authentication record contains a name and/or email address.", changes: "Render the authenticated global header and prefill available Name and Email values while leaving Topic and Message empty.", data: "The current authenticated account record; missing profile values remain blank and editable.", behavior: "Treat prefill as a convenience, not verified submission data. Preserve edits and restore the account values after Send Another Message." },
    topicOpen: { summary: "The Contact topic combobox expanded to its five implemented options.", trigger: "Use while the topic input or toggle has opened the listbox.", changes: "Show the menu below the field, rotate the control, and give the first or currently selected option the active treatment.", data: "Stable option identifiers, customer-facing topic labels, current selection, and available viewport space.", behavior: "Support Arrow Up/Down, Enter or Space, Escape, click-away, aria-expanded, active descendant, and one selected option. Open upward when less than 260px remains below the control." },
    topicOpenAbove: { summary: "The same topic listbox repositioned above its input to remain visible near the viewport bottom.", trigger: "Use when the selector opens with less than 260px between the combobox and the viewport bottom.", changes: "Apply the is-up placement while preserving the same options, active descendant, selected state, and expanded chevron.", data: "The combobox viewport rectangle and current viewport height in addition to the normal topic data.", behavior: "Recalculate placement when the menu opens and whenever the viewport resizes; selection and keyboard behavior remain identical to the downward menu." },
    topicSelected: { summary: "A controlled support topic has been selected and written into the read-only combobox input.", trigger: "Use immediately after choosing one of the five listbox options.", changes: "Close the listbox, show the chosen customer-facing label in the Topic input, and retain the selected option through aria-selected.", data: "The stable topic value and its display label.", behavior: "Return focus to the Topic input, clear its validation error, and reopen the list with the selected option active." },
    error: { summary: "Required-field feedback after submitting the completely empty Contact form.", trigger: "Use when Name, Email, Topic, and Message are all absent.", changes: "Mark all four controls and show the implemented messages: Enter your name, Enter your email, Choose a topic, and Enter a message.", data: "Per-field required validation results.", behavior: "Preserve any valid values, focus Name as the first invalid control, and clear each message as its field is edited." },
    invalid: { summary: "Format and minimum-detail feedback while otherwise valid Contact values remain intact.", trigger: "Use when Email is malformed or the trimmed Message contains fewer than ten characters.", changes: "Retain Name and Topic, mark Email and Message only, and show Enter a valid email address plus Add a little more detail so we can help.", data: "The submitted values, normalized email validity, and trimmed message length.", behavior: "Focus Email as the first invalid control and clear each field’s error independently as it becomes valid." },
    success: { summary: "The submitted Contact confirmation replacing the form inside the same card.", trigger: "Use after the request is stored or accepted by the support service.", changes: "Show Message Sent, destination email, traceable reference, and Send Another Message.", data: "Submitted email and generated support reference.", behavior: "Move focus to the status region; starting another request clears all fields and returns to default." },
  },
  fees: {
    default: { summary: "The standalone pricing and fees explanation for a signed-out customer.", trigger: "Use when Fees is opened outside an active order without an authenticated session.", changes: "Show Login in the global header, the four numbered explanations, and the standard global footer without a floating return control.", data: "Production-approved fee percentage, minimum, price range, payout, settlement policy, and footer destinations are required.", behavior: "Back uses valid same-origin history or Home fallback; footer links follow the same destinations as the rest of the app." },
    signedIn: { summary: "The same standalone explanation for an authenticated customer without a carried order.", trigger: "Use when a signed-in customer opens Fees without a valid game query parameter.", changes: "Replace Login with the signed-in navigation, balance, and any current Open Trades control; retain the complete global footer and do not show Continue Bet.", data: "The authenticated session, current balance, current open-trade count, published fee content, and footer destinations are required.", behavior: "Keep header data synchronized with the shared account sources. Back follows valid same-origin history or the Home fallback and no draft is reconstructed." },
    continueBet: { summary: "Production non-logo Continue Bet variant using team-initial chips.", trigger: "Use only when the URL contains a game id that resolves to an implemented game; otherwise retain the standalone page and keep the control hidden.", changes: "Retain the complete page and footer, then show the floating Continue Bet control with the standard abbreviation chips, secondary surface, and originating-team gradient border; reserve footer space so it never covers content.", data: "The current implementation carries game, market, side, quantity, and an optional limit price, plus each team’s abbreviation and colour for the chips and border.", behavior: "Continue Bet returns to the originating game with bet=1, reconstructs the draft, and reopens the drawer. Production must revalidate the game, market, price, balance, and limits before allowing confirmation." },
    continueBetLogos: { summary: "Optional Continue Bet reference with team logos.", trigger: "Reference only when a future surface explicitly calls for licensed team artwork; this is not the production Fees-page variant.", changes: "Replace the abbreviation chips with the two team logos while retaining the same secondary surface and originating-team gradient border.", data: "The same carried bet context plus validated team artwork and accessible names.", behavior: "Return behavior and validation remain identical to the production non-logo variant." },
  },
  rules: {
    default: { summary: "The complete published Monthly Prize Competition rules document.", trigger: "Use from Ranking, footer Official Rules, and any competition legal disclosure.", changes: "Render all 13 numbered legal sections and the ten-row $5,000 prize schedule.", data: "Approved legal entity, jurisdiction, eligible states, dates, contact details, payment method, URLs, and rules version.", behavior: "Preserve semantic reading order, table structure, stable deep-link behavior if added, and a visible last-updated record." },
  },
};

const conciseVariantDocumentation = {
  home: {
    guest: { summary: "The signed-out Home experience with Login access, the primary live-game area, and no customer-specific trade content." },
    logged: { summary: "The signed-in Home experience when the customer has no open trades, moving Live Games directly beneath the greeting." },
    noLive: { summary: "The Home empty state used when no live games are currently available for trading." },
    nba: { summary: "The NBA coming-soon state before the customer has responded to the interest prompt." },
    nbaInterested: { summary: "The NBA coming-soon confirmation after the customer indicates they want access to future NBA markets." },
    nbaNotForMe: { summary: "The NBA coming-soon confirmation after the customer indicates they are not currently interested." },
    loading: { summary: "The Home loading state shown while live-game and market data are being retrieved." },
    error: { summary: "The recoverable Home service-error state shown when live-game content cannot be loaded." },
  },
  location: {
    default: { summary: "The signed-out eligibility message shown when GTL is unavailable from the customer’s current location." },
  },
  drawer: {
    buyMarket: { summary: "The default Buy drawer for entering a contract quantity at the current market price." },
    changeBetType: { summary: "The Buy drawer with market and side selection open so the customer can change the current bet type." },
    paused: { summary: "The blocked Buy drawer shown while trading is temporarily paused and market prices are recalculated." },
    buyLimit: { summary: "The Buy drawer with Set Limit selected and a valid limit-price input available." },
    sellMarket: { summary: "The Sell drawer for choosing how many owned contracts to sell at the current market price." },
    balance: { summary: "The Buy drawer validation state shown when the order cost exceeds the customer’s available balance." },
    invalid: { summary: "The limit-order validation state shown when the entered price falls outside the permitted range." },
    confirmBuy: { summary: "The timed success confirmation shown after a Buy order has been accepted." },
    confirmSell: { summary: "The timed success confirmation shown after a Sell order has been accepted." },
    error: { summary: "The recoverable order error shown when the Buy or Sell request cannot be completed." },
  },
  tracker: {
    open: { summary: "The Portfolio Orders overview with current trades and pending orders available for review." },
    settled: { summary: "The Portfolio Settled view containing completed trade outcomes and final values." },
    empty: { summary: "The Portfolio empty state shown when the selected order category contains no activity." },
    loading: { summary: "The Portfolio loading state shown while balances and order history are being retrieved." },
    error: { summary: "The recoverable Portfolio service-error state shown when order data cannot be loaded." },
    detailCurrent: { summary: "The detail view for an active trade, including its current value and available Buy More or Sell actions." },
    detailPending: { summary: "The detail view for a pending limit order with its requested price and cancellation action." },
    detailSettled: { summary: "The read-only detail view for a settled trade with its final outcome and value." },
  },
  account: {
    profilePassword: { summary: "Profile & Settings for an email-and-password account with customer details and password management." },
    editUsername: { summary: "The inline Profile & Settings state for editing and validating the customer’s public username." },
    profileGoogle: { summary: "Profile & Settings for an account connected through Google, with provider-managed sign-in guidance." },
    profileApple: { summary: "Profile & Settings for an account connected through Apple, with provider-managed sign-in guidance." },
    signedOut: { summary: "The Profile & Settings access guard shown to a signed-out customer." },
    bettingControls: { summary: "The account-management page for reviewing and changing available betting controls." },
    deleteAccount: { summary: "The destructive account-management page for permanently deleting the customer’s GTL account." },
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
const showIcon = `<svg class="icon-show" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg><svg class="icon-hide" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M9.4 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.1M6.5 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
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

function authBack() {
  return `<button class="step-back" type="button" tabindex="-1">${backIcon}Back</button>`;
}

function authCodeInput({ error = "", filled = false } = {}) {
  const boxes = Array.from({ length: 6 }, (_, index) => `${index === 3 ? `<span class="code-dash" aria-hidden="true"></span>` : ""}<input class="code-box${filled ? " is-filled" : ""}" type="text" inputmode="numeric" maxlength="1" aria-label="Digit ${index + 1}" value="${filled ? index + 1 : ""}" tabindex="-1" readonly>`).join("");
  return `<div class="code-input${error ? " is-error" : ""}">${boxes}</div>${error ? `<p class="field-error" role="alert">${error}</p>` : ""}`;
}

function renderAuthFrame(mode) {
  if (mode === "loginIdentifier" || mode === "loginIdentifierError") {
    const invalid = mode === "loginIdentifierError";
    return authShell(`${authHead("Welcome back", "Login to GTL", "Continue with a social account, email, or phone number.")}
      ${socialRow()}<div class="auth-divider">or</div>
      <div class="auth-form">${field("Email or Phone", "you@email.com or (555) 123-4567", { value: invalid ? "alex" : "", error: invalid ? "Enter a valid email or 10-digit US phone number" : "" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1" disabled>Continue</button></div>
      ${authFoot("New to GTL?", "Create an Account")}`);
  }

  if (mode === "loginVerify" || mode === "loginVerifyError") {
    const error = mode === "loginVerifyError" ? "Enter the 6-digit verification code" : "";
    return authShell(`<div class="auth-steps" data-step="2"><section class="auth-step" data-step="2">${authBack()}${authHead("", "Verify It’s You", `Enter the 6-digit code sent to the registered phone ending in <span class="code-sent-to">4567</span>.`)}<div class="auth-form">${authCodeInput({ error })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1" disabled>Login</button></div><button class="auth-alternate" type="button" tabindex="-1">Or Enter Password</button><p class="code-resend">Didn't get a code? <button type="button" tabindex="-1">Resend</button></p></section></div>${authFoot("New to GTL?", "Create an Account")}`);
  }

  if (mode === "loginPassword" || mode === "loginPasswordError") {
    const invalid = mode === "loginPasswordError";
    return authShell(`<div class="auth-steps" data-step="3"><section class="auth-step" data-step="3">${authBack()}${authHead("", "Enter Your Password", "Use the password associated with your GTL account.")}<div class="auth-form">${field("Password", "Your password", { type: "password", passwordToggle: true, error: invalid ? "Enter your password" : "" })}<div class="field-row"><span class="link-green">Forgot Password?</span></div><button class="btn btn-primary auth-submit" type="button" tabindex="-1" disabled>Login</button></div></section></div>${authFoot("New to GTL?", "Create an Account")}`);
  }

  if (mode === "signupEmail" || mode === "signupEmailError") {
    const invalid = mode === "signupEmailError";
    return authShell(`<div class="auth-steps" data-step="1"><section class="auth-step" data-step="1">${authHead("", "Create Your Account", "Sign up with Google, Apple, or Email to get started.")}${socialRow()}<div class="auth-divider">or</div><div class="auth-form">${field("Email", "you@email.com", { type: "email", value: invalid ? "alex" : "", error: invalid ? "Enter a valid email address" : "" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1" disabled>Continue with Email</button></div><p class="auth-fineprint">By creating an account, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.</p></section></div>${authFoot("Already have an account?", "Login")}`);
  }

  if (mode === "signupPhone" || mode === "signupPhoneError") {
    const invalid = mode === "signupPhoneError";
    return authShell(`<div class="auth-steps" data-step="2"><section class="auth-step" data-step="2">${authBack()}${authHead("", "Add Your Phone Number", "We’ll use this number to verify and protect your account.")}<div class="auth-form">${field("Phone Number", "(555) 123-4567", { type: "tel", value: invalid ? "(555) 123" : "", hint: "US phone numbers only. Standard message rates may apply.", error: invalid ? "Enter a valid 10-digit US phone number" : "" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1" disabled>Continue</button></div></section></div>${authFoot("Already have an account?", "Login")}`);
  }

  if (mode === "signupVerify" || mode === "signupVerifyError") {
    const error = mode === "signupVerifyError" ? "Enter the 6-digit code we sent you" : "";
    return authShell(`<div class="auth-steps" data-step="3"><section class="auth-step" data-step="3">${authBack()}${authHead("", "Verify Your Phone", `Enter the 6-digit code sent to <span class="code-sent-to">(555) 123-4567</span>.`)}<div class="auth-form">${authCodeInput({ error })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1" disabled>Continue</button></div><p class="code-resend">Didn't get a code? <button type="button" tabindex="-1">Resend</button></p></section></div>${authFoot("Already have an account?", "Login")}`);
  }

  if (mode === "signupPassword" || mode === "signupPasswordError") {
    const invalid = mode === "signupPasswordError";
    return authShell(`<div class="auth-steps" data-step="4"><section class="auth-step" data-step="4">${authBack()}${authHead("", "Enter a Password", "Keep your account secure with a password you don’t use elsewhere.")}<div class="auth-form">${field("Password", "At least 8 characters", { type: "password", passwordToggle: true, value: invalid ? "password" : "" })}${field("Confirm Password", "Re-enter your password", { type: "password", passwordToggle: true, value: invalid ? "different" : "", error: invalid ? "Passwords don't match" : "" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1" disabled>Create Account</button></div></section></div>${authFoot("Already have an account?", "Login")}`);
  }

  if (mode === "forgot" || mode === "forgotError" || mode === "forgotSent") {
    const sent = mode === "forgotSent";
    const invalid = mode === "forgotError";
    if (sent) return authShell(`<div class="auth-sent"><div class="sent-check">${sentIcon}</div><h1>Check Your Email</h1><p>We've sent a reset link to <span class="code-sent-to">alex@gtl.test</span>. It expires in 30 minutes.</p><span class="btn btn-secondary auth-submit">Back to Login</span><p class="code-resend">Didn't get it? <span>Resend Link</span></p></div>`, "is-sent");
    return authShell(`${authBack()}${authHead("Reset Password", "Forgot Your Password?", "Enter your email and we'll send you a link to reset it.")}<div class="auth-form">${field("Email", "you@email.com", { type: "email", value: invalid ? "alex" : "", error: invalid ? "Enter a valid email address" : "" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1" disabled>Send Reset Link</button></div>${authFoot("Remembered it?", "Login")}`);
  }

  return renderAuthFrame("loginIdentifier");
}

const logoSvg = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5 20 18H4Z"/></svg>`;
const brandLogoSVG = (className = "gtl-logo") => `<gtl-logo class="${className}" aria-hidden="true"></gtl-logo>`;
const headerLogoSvg = brandLogoSVG();
const chevronDown = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const homeGames = [
  {
    id: "buf-mia",
    league: "nfl",
    variant: 3,
    period: "Q3",
    clock: "11:05",
    paused: { message: "Trading paused. Recalculating markets.", clears: true },
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: teamLogos.buf },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: teamLogos.mia },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 37, no: 63 } },
    stats: [
      { label: "Total Team Yards", home: 288, away: 264 },
      { label: "Pass Yards", home: 201, away: 188 },
      { label: "Rush Yards", home: 87, away: 76 },
      { label: "Possession Time", home: "17:38", away: "16:17", homeMetric: 1058, awayMetric: 977 },
      { label: "Turnovers", home: 1, away: 1 },
    ],
  },
  {
    id: "kc-sf",
    league: "nfl",
    variant: 1,
    period: "Q2",
    clock: "08:42",
    home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: teamLogos.kc },
    away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: teamLogos.sf },
    markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 40, no: 60 } },
    stats: [
      { label: "Total Team Yards", home: 214, away: 186 },
      { label: "Pass Yards", home: 151, away: 129 },
      { label: "Rush Yards", home: 63, away: 57 },
      { label: "Possession Time", home: "11:46", away: "09:32", homeMetric: 706, awayMetric: 572 },
      { label: "Turnovers", home: 0, away: 1 },
    ],
  },
  {
    id: "dal-phi",
    league: "nfl",
    variant: 5,
    period: "Q4",
    clock: "02:14",
    paused: { message: "Markets open when a team takes the lead.", clears: false },
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: "../gtl-app/assets/logos/nfl-dal.png" },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: "../gtl-app/assets/logos/nfl-phi.png" },
    markets: { gtl: { yes: 34, no: 66 }, tie: { yes: 33, no: 67 }, ktl: { yes: 33, no: 67 } },
    stats: [
      { label: "Total Team Yards", home: 341, away: 352 },
      { label: "Pass Yards", home: 246, away: 258 },
      { label: "Rush Yards", home: 95, away: 94 },
      { label: "Possession Time", home: "28:42", away: "29:04", homeMetric: 1722, awayMetric: 1744 },
      { label: "Turnovers", home: 2, away: 1 },
    ],
  },
];

function homeHeader(authed = false, positions = false, positionsOpen = false, positionCount = 3) {
  return `<header class="site-header ds-static-header">
    <div class="header-row">
      <div class="header-left">
        <span class="brand-pill">
          <span class="brand floating-logo floating-btn brand-link"><span class="header-brand-logo">${headerLogoSvg}</span></span>
          <span class="brand floating-logo floating-btn brand-menu"><span class="header-brand-logo">${headerLogoSvg}</span></span>
          <span class="header-nav-slot"><nav class="header-nav" aria-label="Primary navigation"><span>Home</span><span>Live Games</span><span>Ranking</span>${authed ? "<span>Portfolio</span><span>Profile &amp; Settings</span><span class=\"header-nav-sep\"></span><button class=\"header-nav-logout\" type=\"button\">Logout</button>" : ""}</nav></span>
        </span>
        <span class="theme-switch floating-btn"><span class="theme-switch-track"><span class="theme-switch-thumb"></span><span class="theme-option theme-sun">☼</span><span class="theme-option theme-moon">☾</span></span></span>
      </div>
      <div class="header-right">${authed ? `<span class="header-wallet"><span class="wallet-chip floating-btn"><svg class="wallet-ico" viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 8v9a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M20 8v4h-4a2 2 0 0 1 0-4h4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="wallet-amount tnum">$248.50</span></span></span>${positions ? `<span class="header-positions"><span class="hpos-trigger" aria-expanded="${String(positionsOpen)}"><span class="hpos-word">Open Trades</span><span class="hpos-num tnum">${positionCount}</span><span class="hpos-close">${closeIcon}</span></span></span>` : ""}` : `<span class="header-auth"><span class="btn header-login floating-btn">Login</span></span>`}</div>
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
    <button class="league-pill${active === "nfl" ? " is-active" : ""}" type="button" tabindex="-1"><span class="league-icon"><span class="league-ball" aria-hidden="true">🏈</span></span><span class="league-label">NFL</span></button>
    <button class="league-pill${active === "nba" ? " is-active" : ""}" type="button" tabindex="-1"><span class="league-icon"><span class="league-ball" aria-hidden="true">🏀</span></span><span class="league-label">NBA</span></button>
  </div>`;
}

function homeHero(mode) {
  if (mode === "positions") {
    return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner authed"><div class="hero-greeting"><h1>Hey Alex</h1></div><div class="authed-stack">${homePositionsBlock()}<span class="btn btn-primary authed-cta">Live Games</span></div></div></section>`;
  }
  if (mode === "logged") {
    return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner authed no-open-positions"><div class="hero-greeting"><h1>Hey Alex</h1></div></div></section>`;
  }
  return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner"><div class="hero-trading"><span class="live-dot"></span><span class="tnum">3,247</span> trading right now</div><h1 class="hero-title">Trade the moments that move the game.</h1><p class="hero-sub">Back the lead on live NFL &amp; NBA. Buy and sell in seconds, as the game turns.</p><div class="hero-cta"><span class="btn btn-primary btn-lg">Live Games</span><span class="btn btn-glass btn-lg">Create Account</span></div></div></section>`;
}

function homePositionsBlock() {
  return `<div class="positions-block"><div class="positions-head"><span class="eyebrow">Open Trades</span></div><div class="pos-carousel">${homePositionGroupPreview()}${homePositionCardA("ny")}${homePositionCardA("den")}</div><div class="pos-footer"><button class="pos-nav-button" type="button" tabindex="-1" aria-label="Previous trades page"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="pos-dots"><button class="pos-dot is-active" type="button" tabindex="-1"></button><button class="pos-dot" type="button" tabindex="-1"></button><button class="pos-dot" type="button" tabindex="-1"></button></div><button class="pos-nav-button" type="button" tabindex="-1" aria-label="Next trades page"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>`;
}

function homePositionGroupPreview() {
  const g = { period: "Q2", clock: "08:42", home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: teamLogos.kc }, away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: teamLogos.sf } };
  const trades = [
    { market: "Get the Lead", team: g.home, side: "YES", qty: 150, value: "$57.00", pnl: "+$10.50", bought: "31¢", now: "38¢" },
    { market: "Tie", team: g.away, side: "NO", qty: 60, value: "$46.80", pnl: "+$2.40", bought: "74¢", now: "78¢" },
  ];
  const actions = `<div class="oc-actions"><button class="oc-buy" type="button" tabindex="-1">Buy More</button><button class="oc-sell" type="button" tabindex="-1">Sell</button></div>`;
  const rows = trades.map((trade) => `<section class="home-trade"><div class="home-trade-head"><span class="home-trade-title"><span class="position-outcome-chip" style="--outcome-color:${trade.team.color}"><span class="position-outcome-marks"><span class="team-mark position-outcome-mark is-fallback" style="--team-color:${trade.team.color}"><span class="team-mark-abbr">${trade.team.abbr}</span></span></span></span><span>${trade.market}</span></span><span class="home-trade-pnl up tnum">${trade.pnl}</span></div><div class="home-trade-meta"><span>${trade.side} · ${trade.qty} contracts</span><span>Value <strong class="tnum">${trade.value}</strong></span></div><div class="home-trade-prices"><span>Bought <strong class="tnum">${trade.bought}</strong></span><span aria-hidden="true">→</span><span>Now <strong class="tnum">${trade.now}</strong></span></div>${actions}</section>`).join("");
  return `<article class="pos-card pos-card--group" style="--home-color:${g.home.color};--away-color:${g.away.color}"><div class="pos-media">${homeGameMedia(g)}</div><div class="pos-info home-trade-list">${rows}</div></article>`;
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
  const isNba = mode === "nba" || mode === "nbaInterested" || mode === "nbaNotForMe";
  let content = `<div class="game-grid">${homeGames.map((g) => homeGameTile(g)).join("")}</div>`;
  if (mode === "noLive") content = `<div class="coming-soon"><span class="cs-logo league-ball" aria-hidden="true">🏈</span><h3 class="cs-title">No live games right now</h3><p class="cs-desc">Upcoming markets will appear here before kickoff.</p></div>`;
  if (isNba) content = `<div class="coming-soon"><span class="cs-logo league-ball" aria-hidden="true">🏀</span><h3 class="cs-title">NBA Markets Coming Soon</h3><p class="cs-desc">We're currently launching live with NFL. Get the Lead on NBA is next — tell us if you're interested and we'll prioritise accordingly.</p><div class="cs-actions"><span class="btn btn-secondary${mode === "nbaInterested" ? " is-chosen" : ""}">I'm interested</span><span class="btn btn-secondary${mode === "nbaNotForMe" ? " is-chosen" : ""}">Not for me</span></div></div>`;
  if (mode === "loading") content = `<div class="game-grid"><article class="game-tile ds-home-skeleton"></article><article class="game-tile ds-home-skeleton"></article><article class="game-tile ds-home-skeleton"></article></div>`;
  if (mode === "error") content = `<div class="coming-soon"><h3 class="cs-title">Unable to load markets</h3><p class="cs-desc">Refresh the page or try again later.</p><div class="cs-actions cs-actions-single"><span class="btn btn-secondary">Try again</span></div></div>`;
  return `<section class="section live"><div class="container"><div class="section-head center"><span class="eyebrow">On now</span><h2>Live games</h2></div>${homeLeagueStrip(isNba ? "nba" : "nfl")}${content}</div></section>`;
}

function homeHowSection() {
  const steps = [
    ["01", "Pick a market", "Choose a live game and one of three lead markets.", `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 14h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`],
    ["02", "View the order book", "See live Yes / No prices and where the market sits.", `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="11" width="3" height="5" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="7" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.8"/></svg>`],
    ["03", "Buy", "Place a trade at the live price in a single tap.", `<svg viewBox="0 0 24 24" fill="none"><path d="M7 8l-3 3 3 3M4 11h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 16l3-3-3-3M20 13h-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`],
    ["04", "Cash Out or Settle", "Cash out early or let it settle when the moment lands.", `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`],
    ["05", "Compete", "Turn settled trades into performance and climb the rankings.", `<svg viewBox="0 0 24 24" fill="none"><path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 11v5M8 20h8M9 16h6v4H9z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`],
  ];
  return `<section class="section how"><div class="container"><div class="section-head center"><span class="eyebrow">How it works</span><h2>Five steps from watching to competing.</h2></div><ol class="flow">${steps.map(([n, title, copy, icon]) => `<li class="flow-step"><div class="flow-marker">${icon}</div><span class="flow-num">${n}</span><h3 class="flow-title">${title}</h3><p class="flow-text">${copy}</p></li>`).join("")}</ol></div></section>`;
}

function homeFooter(currentPage = "home", authenticated = false) {
  const current = (page) => currentPage === page ? ` aria-current="page"` : "";
  const accountLinks = authenticated
    ? `<a href="../gtl-app/profile.html"${current("profile")}>Profile</a><a href="../gtl-app/ranking.html"${current("ranking")}>Ranking</a><a href="../gtl-app/wallet.html"${current("portfolio")}>Portfolio</a>`
    : "";
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a class="footer-logo-link" href="../gtl-app/home.html" aria-label="GTL home">${brandLogoSVG("gtl-logo footer-logo")}</a><p class="footer-blurb">Get the Lead. The fastest way to trade the moments that move live NFL and NBA games.</p></div><div class="footer-cols"><div class="footer-col"><h4>Sitemap</h4><a href="../gtl-app/home.html"${current("home")}>Home</a>${accountLinks}<a href="../gtl-app/contact.html"${current("contact")}>Contact</a></div><div class="footer-col"><h4>Legal</h4><a href="../gtl-app/rules.html"${current("rules")}>Official Rules</a><a href="#">Terms</a><a href="#">Privacy</a></div></div></div><div class="footer-base"><span>© 2026 GTL Markets</span><span>18+. Please play responsibly.</span></div></div></footer>`;
}

function renderHomeFrame(mode) {
  const authed = mode === "logged" || mode === "positions";
  return `<div class="flat-screen is-home is-home-${mode}">${homeHeader(authed, mode === "positions")}${homeHero(mode)}${homeLiveSection(mode)}${homeHowSection()}${homeFooter("home", authed)}</div>`;
}

function renderWelcomeFrame(mode) {
  const burst = `<div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
  const decor = `<div class="welcome-celebration-bg" aria-hidden="true"><span class="celebration-glow"></span><span class="celebration-ring ring-one"></span><span class="celebration-ring ring-two"></span>${burst}<div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`;
  const state = mode === "intro" ? "intro" : mode.startsWith("details") || mode === "underage" ? "details" : "username";
  const field = (id, label, placeholder, value = "", error = "") => `<div class="field"><label for="${id}">${label}</label><input class="field-input${error ? " is-error" : ""}" id="${id}" type="text" placeholder="${placeholder}" value="${value}" tabindex="-1" readonly>${error ? `<p class="field-error" role="alert">${error}</p>` : ""}</div>`;
  const datePart = (part, placeholder, value = "", isError = false) => `<div class="date-part"><div class="field-combobox"><input class="field-input${isError ? " is-error" : ""}" id="welcome-${part}-${mode}" type="text" placeholder="${placeholder}" value="${value}" role="combobox" aria-label="${placeholder}" aria-expanded="false" tabindex="-1" readonly><button class="combobox-toggle" type="button" tabindex="-1" aria-hidden="true">${chevronDownIcon}</button></div></div>`;
  const detailsRequired = mode === "detailsRequired";
  const underage = mode === "underage";
  const details = `<section class="welcome-panel welcome-details"><div class="welcome-copy"><h1>Tell Us About <span>You</span></h1></div><div class="welcome-form"><div class="welcome-name-row">${field(`welcome-first-${mode}`, "First Name", "Alex", underage ? "Alex" : "", detailsRequired ? "Enter your first name" : "")}${field(`welcome-last-${mode}`, "Last Name", "Morgan", underage ? "Morgan" : "", detailsRequired ? "Enter your last name" : "")}</div><fieldset class="field welcome-birthday-field"><legend>Date of Birth</legend><div class="date-fields">${datePart("month", "Month", underage ? "July" : "", detailsRequired || underage)}${datePart("day", "Day", underage ? "29" : "", detailsRequired || underage)}${datePart("year", "Year", underage ? "2012" : "", detailsRequired || underage)}</div><span class="field-hint">You must be 18 or older to use GTL.</span>${detailsRequired ? `<p class="field-error birthday-error" role="alert">Enter a valid month, day, and year</p>` : underage ? `<p class="field-error birthday-error" role="alert">GTL is for users 18 or older.</p>` : ""}</fieldset><button class="btn btn-primary btn-lg" type="button"${underage ? "" : " disabled"}>Continue</button></div></section>`;
  const usernameOptions = mode === "usernameRequired"
    ? { value: "", error: "Choose a username" }
    : mode === "usernameInvalid"
      ? { value: "alex!", error: "Use 3–20 letters, numbers, or underscores" }
      : { value: "alexmorgan" };
  const usernameId = `welcome-username-${mode}`;
  const usernameField = `<div class="field"><label for="${usernameId}">Username</label><input class="field-input${usernameOptions.error ? " is-error" : ""}" id="${usernameId}" type="text" autocomplete="username" placeholder="alexmorgan" value="${usernameOptions.value}" tabindex="-1" readonly><span class="field-hint">Use 3–20 letters, numbers, or underscores. This is how you’ll appear in rankings.</span>${usernameOptions.error ? `<p class="field-error" role="alert">${usernameOptions.error}</p>` : ""}</div>`;
  const usernameDisabled = mode === "usernameRequired" || mode === "usernameInvalid";
  const username = `<section class="welcome-panel welcome-username welcome-reward"><div class="welcome-copy"><h1>Claim Your<br><span>Welcome Credits</span></h1><p>Choose a username to claim your credits and join the rankings.</p></div><div class="credit-ticket"><span class="ticket-label">Welcome credits</span><strong class="ticket-value tnum">1,500</strong></div><div class="welcome-form">${usernameField}<button class="btn btn-primary btn-lg" type="button"${usernameDisabled ? " disabled" : ""}>Start Betting</button></div></section>`;
  const intro = `<section class="welcome-panel welcome-intro"><div class="welcome-copy"><p class="welcome-kicker">You’re officially in</p><h1>Welcome to <span>GTL.</span></h1><p>Your account is live. Next, we’ll personalise your experience and reserve your welcome credits.</p></div><div class="welcome-transition" role="status">Setting up your account<span aria-hidden="true"></span></div></section>`;
  return `<div class="flat-screen is-welcome is-welcome-${mode}"><main class="welcome-main container" data-welcome-state="${state}">${state === "intro" ? decor + intro : state === "details" ? details : username}</main></div>`;
}

function renderLocationFrame() {
  return `<div class="flat-screen is-location"><main class="location-main"><section class="location-panel"><span class="location-brand">${brandLogoSVG()}</span><div class="location-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M26 13.3C26 20 16 28 16 28S6 20 6 13.3a10 10 0 1 1 20 0Z" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="13" r="3.25" stroke="currentColor" stroke-width="2"/><path d="m7 27 18-22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="location-copy"><p class="location-kicker">Location unavailable</p><h1>GTL isn’t available in this location.</h1><p>We’re working to bring GTL to more locations. Please check back again soon.</p></div><p class="location-footnote">Availability is based on your current location.</p></section></main></div>`;
}

function supportBack() {
  return `<span class="support-back"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Back</span></span>`;
}

function renderContactFrame(mode) {
  const success = mode === "success";
  const prefilled = mode === "prefilled";
  const menuOpen = mode === "topicOpen" || mode === "topicOpenAbove";
  const menuAbove = mode === "topicOpenAbove";
  const required = mode === "error";
  const invalid = mode === "invalid";
  const topicSelected = mode === "topicSelected" || invalid;
  const nameValue = prefilled || topicSelected ? "Alex Morgan" : "";
  const emailValue = prefilled || mode === "topicSelected" ? "alex@gtl.test" : invalid ? "alex" : "";
  const messageValue = mode === "topicSelected" ? "I have a question about the monthly competition." : invalid ? "Help" : "";
  const topicValue = topicSelected ? "Monthly competition" : "";
  const formComplete = mode === "topicSelected";
  const fieldInput = (id, label, type, placeholder, value = "", error = "") => `<div class="field"><label for="${id}">${label}</label><input class="field-input${error ? " is-error" : ""}" id="${id}" name="${id}" type="${type}" value="${value}" placeholder="${placeholder}" tabindex="-1" readonly>${error ? `<p class="field-error" role="alert">${error}</p>` : ""}</div>`;
  const topics = [
    ["account", "Account support"],
    ["gameplay", "Gameplay or markets"],
    ["competition", "Monthly competition"],
    ["feedback", "Product feedback"],
    ["other", "Something else"],
  ];
  const topicOptions = topics.map(([value, label], index) => {
    const selected = topicSelected && value === "competition";
    const active = menuOpen && index === 0;
    return `<button class="combobox-option${active ? " is-active" : ""}" id="contact-topic-${mode}-option-${index}" type="button" role="option" data-contact-topic-value="${value}" aria-selected="${selected}" tabindex="-1">${label}</button>`;
  }).join("");
  const form = `<form data-contact-form novalidate><div class="contact-name-row">${fieldInput(`contact-name-${mode}`, "Name", "text", "Your name", nameValue, required ? "Enter your name" : "")}${fieldInput(`contact-email-${mode}`, "Email", "email", "you@example.com", emailValue, required ? "Enter your email" : invalid ? "Enter a valid email address" : "")}</div><div class="field"><label for="contact-topic-${mode}">What can we help with?</label><div class="field-combobox${menuAbove ? " is-up" : ""}" data-contact-topic><input class="field-input${required ? " is-error" : ""}" id="contact-topic-${mode}" name="topic" type="text" value="${topicValue}" placeholder="Choose a topic" role="combobox" aria-autocomplete="none" aria-controls="contact-topic-${mode}-options" aria-expanded="${menuOpen}"${menuOpen ? ` aria-activedescendant="contact-topic-${mode}-option-0"` : ""} tabindex="-1" readonly><button class="combobox-toggle" type="button" tabindex="-1" aria-label="Show contact topics">${chevronDownIcon}</button><div class="combobox-menu" id="contact-topic-${mode}-options" role="listbox" aria-label="Contact topic"${menuOpen ? "" : " hidden"}>${topicOptions}</div></div>${required ? `<p class="field-error" role="alert">Choose a topic</p>` : ""}</div><div class="field"><label for="contact-message-${mode}">Message</label><textarea class="field-input contact-message${required || invalid ? " is-error" : ""}" id="contact-message-${mode}" name="message" rows="6" maxlength="1000" placeholder="Tell us what happened or what you need help with" tabindex="-1" readonly>${messageValue}</textarea><span class="field-hint"><span>${messageValue.length}</span>/1000 characters</span>${required ? `<p class="field-error" role="alert">Enter a message</p>` : invalid ? `<p class="field-error" role="alert">Add a little more detail so we can help</p>` : ""}</div><button class="btn btn-primary btn-block contact-submit" type="button" tabindex="-1"${formComplete ? "" : " disabled"}>Send Message</button></form>`;
  const successState = `<div class="contact-success" role="status" tabindex="-1"><span class="contact-success-icon" aria-hidden="true">${sentIcon}</span><span class="eyebrow">Message sent</span><h2>Thanks for getting in touch.</h2><p>We’ve received your request and will reply to <strong>alex@gtl.test</strong>.</p><p class="contact-reference">Reference <span class="tnum">GTL-7F3K9Q</span></p><button class="btn btn-secondary" type="button" tabindex="-1">Send another message</button></div>`;
  return `<div class="flat-screen is-contact contact-body">${homeHeader(prefilled, prefilled)}<main class="contact-page container">${supportBack()}<div class="contact-layout"><section class="contact-intro" aria-labelledby="contact-title-${mode}"><h1 id="contact-title-${mode}">How can we help?</h1><p>Send us a message and we’ll get back to you as soon as possible, usually within one to two business days.</p></section><section class="contact-card" aria-label="Contact request form">${success ? successState : form}</section></div></main>${homeFooter("contact", prefilled)}</div>`;
}

function renderFeesFrame(mode) {
  const items = [
    ["01", "Contracts are priced 1¢–99¢", `Every market is priced in cents. The price reflects the live likelihood of the outcome. Each contract settles at <strong>$1.00</strong> if your side wins, or <strong>$0.00</strong> if it doesn't.`],
    ["02", "What you pay", "Your cost is the contract price × the number of contracts, plus the 2% trading fee. The full breakdown is shown in your order summary before you confirm."],
    ["03", "What you can win", `If your side settles in your favour, each contract pays out <strong>$1.00</strong>. Your potential profit is the payout less your cost and fees.`],
    ["04", "Settlement", "Markets settle automatically the moment the live result is final, and winnings are credited to your balance right away."],
  ];
  const hasBetContext = mode === "continueBet" || mode === "continueBetLogos";
  const miniTeams = mode === "continueBetLogos"
    ? `<img class="bet-mini-logo" src="${teamLogos.kc}" alt="Chiefs"><span class="bet-mini-v">v</span><img class="bet-mini-logo" src="${teamLogos.sf}" alt="49ers">`
    : `<span class="team-mark bet-mini-logo is-fallback" aria-label="KC" style="--team-color:#E31837"><span class="team-mark-abbr">KC</span></span><span class="bet-mini-v">v</span><span class="team-mark bet-mini-logo is-fallback" aria-label="SF" style="--team-color:#B3995D"><span class="team-mark-abbr">SF</span></span>`;
  const mini = hasBetContext
    ? `<span class="bet-mini" style="--home-color:#E31837;--away-color:#B3995D"><span class="bet-mini-teams">${miniTeams}</span><span class="bet-mini-label">Continue Bet</span></span>`
    : "";
  const authenticated = mode === "signedIn" || hasBetContext;
  return `<div class="flat-screen is-support is-fees fees-body">${homeHeader(authenticated, authenticated)}<main class="support-page">${supportBack()}<div class="support-head"><span class="eyebrow">Pricing &amp; fees</span><h1>What you pay, what you win</h1><p class="support-lead">Simple, transparent pricing — no hidden charges. Every order carries a flat <strong>2% trading fee</strong> (minimum $0.01), and that's the only cost. Here's exactly how it works.</p></div><ol class="support-list">${items.map(([n, title, copy]) => `<li class="support-item"><span class="support-num">${n}</span><div><h3>${title}</h3><p>${copy}</p></div></li>`).join("")}</ol></main>${homeFooter("fees", authenticated)}${mini}</div>`;
}

const rulesContent = [
  ["Sponsor", `<p>The Competition is sponsored and operated by [LEGAL ENTITY NAME], a [STATE] [entity type] ("Sponsor"). Sponsor's decisions on all matters relating to the Competition are final and binding.</p>`],
  ["Competition period", `<p>Each Competition runs for one (1) calendar month, beginning at 12:00:00 AM ET on the first day of the month and ending at 11:59:59 PM ET on the last day of the month (each, a "Monthly Competition"). Each Monthly Competition is a separate and independent promotion with its own entry period, leaderboard, prize pool, and winners. Monthly Competitions are offered only during the NFL and NBA regular seasons and postseasons, at Sponsor's discretion. Sponsor will announce active Competition months in the App.</p>`],
  ["Eligibility", `<p>To participate, you must, at the time of entry and at the time of prize award:</p><ol class="rules-sublist"><li>Be a natural person at least eighteen (18) years of age (or the age of majority in your state of residence, if higher);</li><li>Be a legal resident of, and physically located in, Texas, Colorado, or Florida;</li><li>Maintain one (1), and only one (1), registered account in your own legal name;</li><li>Not be an employee, officer, director, or contractor of Sponsor, or an immediate family or household member;</li><li>Not be a person barred from participating under any applicable law.</li></ol><p>Sponsor uses geolocation and identity-verification technology to enforce eligibility. Sponsor may add or remove Eligible States in response to changes in law; the list in effect on the first day governs that Monthly Competition.</p>`],
  ["How to enter and play", `<ol class="rules-sublist"><li>Access the platform and create a free account. No purchase, payment, or deposit is required or accepted.</li><li>Each participant receives Credits free of charge. Credits have no cash value, cannot be purchased, sold, transferred, or redeemed, and expire at competition end.</li><li>During live games, participants use Credits on skill-based GTL, TIE, and KTL prediction contracts priced by Sponsor's quantitative engine.</li><li>Leaderboard standing is determined solely by Credit balance performance during the Monthly Competition, measured by the scoring formula published in the App.</li></ol>`],
  ["Winner determination", `<p>At the close of each Monthly Competition, the ten (10) eligible participants with the highest final leaderboard scores win cash prizes ("Winners"). Leaderboard scores are calculated exclusively from gameplay results; success depends on participants' skill in evaluating live game situations, probabilities, and contract pricing.</p>`],
  ["Prizes", `<p>Total announced prize value per Monthly Competition: <strong>$5,000.00 USD.</strong> No other prizes, bonuses, or awards are offered.</p>`],
  ["Winner verification and payment", `<ol class="rules-sublist"><li>Provisional Winners are notified through the App and/or account email within seven (7) days.</li><li>Before payment, each provisional Winner must complete identity and eligibility verification and submit a completed IRS Form W-9.</li><li>Verified prizes will be paid by [ACH transfer / check / payment platform] within thirty (30) days after verification and no later than sixty (60) days after competition close.</li><li>Failure to respond or complete verification within fourteen (14) days forfeits the prize and advances the leaderboard.</li><li>Winners are responsible for all taxes. Sponsor will issue IRS Form 1099-MISC where required.</li></ol>`],
  ["Conduct and disqualification", `<p>Sponsor may disqualify participants, void entries, and withhold prizes for multiple accounts, account sharing, collusion, bots, scripts, automated play, exploiting software errors or latency, location spoofing, false registration or verification information, fraud, abuse, or conduct contrary to competitive integrity.</p>`],
  ["Game integrity and data", `<p>Contract settlement is based on official league data feeds and final official scoring. Sponsor may void or re-settle contracts affected by feed errors, postponed or cancelled games, or pricing errors. If a Monthly Competition is materially disrupted, Sponsor may suspend, modify, or terminate it and award prizes based on standings at disruption or carry the pool forward.</p>`],
  ["Publicity", `<p>Except where prohibited by law, acceptance of a prize permits Sponsor to use the Winner's username, first name, last initial, and state of residence for Competition-related publicity without additional compensation. Legal names will not be published without separate consent except where required by law.</p>`],
  ["Privacy", `<p>Information collected in connection with the Competition is used for administration, verification, prize fulfillment, and tax compliance, and is handled per Sponsor's Privacy Policy at [URL].</p>`],
  ["General conditions", `<ol class="rules-sublist"><li>By participating, you agree to these Official Rules and Sponsor's Terms of Service.</li><li>These Rules may not be changed during an active Monthly Competition except as required by law.</li><li>Apple Inc. and Google LLC do not sponsor, endorse, or administer the Competition.</li><li>Sponsor is not responsible for technical malfunctions, lost or delayed transmissions, or errors beyond its reasonable control.</li><li>To the fullest extent permitted by law, participants release Sponsor and its officers, employees, and agents from claims arising from participation or prize use.</li><li>These Rules are governed by the laws of [STATE], and disputes are resolved by binding individual arbitration in [COUNTY, STATE].</li><li>If any provision is invalid, the remainder continues in force.</li></ol>`],
  ["Winners list", `<p>For the names (username, first name and last name) of Winners of any Monthly Competition, email [EMAIL] within sixty (60) days after the close of that Competition.</p>`],
];

function renderRulesFrame() {
  const prizes = [["1st", "$1,500"], ["2nd", "$900"], ["3rd", "$650"], ["4th", "$500"], ["5th", "$400"], ["6th", "$300"], ["7th", "$250"], ["8th", "$200"], ["9th", "$175"], ["10th", "$125"]];
  return `<div class="flat-screen is-support is-rules rules-body">${homeHeader(false)}<main class="support-page">${supportBack()}<div class="support-head"><span class="eyebrow">Official rules</span><h1>GTL Monthly Prize Competition</h1><p class="rules-notice"><strong>NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE WILL NOT INCREASE YOUR CHANCES OF WINNING. VOID WHERE PROHIBITED BY LAW.</strong></p><p class="rules-summary"><em>This is a free-to-play, skill-based prediction competition. Credits used in gameplay have no monetary value, cannot be purchased, and cannot be redeemed, transferred, or exchanged for cash or anything of value.</em></p></div><ol class="support-list">${rulesContent.map(([title, copy], index) => `<li class="support-item"><span class="support-num" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><section><h2>${title}</h2>${copy}${title === "Prizes" ? `<div class="rules-table-wrap"><table class="rules-table"><caption>Monthly Competition prize schedule</caption><thead><tr><th>Rank</th><th>Prize</th></tr></thead><tbody>${prizes.map(([rank, prize]) => `<tr><td>${rank}</td><td>${prize}</td></tr>`).join("")}</tbody></table></div><p><strong>Ties.</strong> Tied rank prizes are combined and divided equally among tied participants; the next participant takes the next unoccupied rank.</p><p>Prizes are non-transferable. Sponsor may substitute a prize of equal value if a listed prize becomes unavailable.</p>` : ""}</section></li>`).join("")}</ol><p class="rules-updated"><em>Last updated: [DATE]. © [YEAR] [LEGAL ENTITY NAME]. Get The Lead, GTL, and KTL are trademarks of Sponsor.</em></p></main>${homeFooter("rules")}</div>`;
}

function legacyWaitlistConfirmation(mode) {
  if (mode !== "joining" && mode !== "confirmed") return "";
  const confirmed = mode === "confirmed";
  return `<div class="waitlist-confirmation is-visible${confirmed ? " is-confirmed" : ""}"><div class="confirmation-backdrop"></div><section class="confirmation-card" role="dialog" aria-modal="true"><div class="confirmation-visual" aria-hidden="true"><span class="confirmation-ring confirmation-ring--outer"></span><span class="confirmation-ring confirmation-ring--inner"></span><span class="confirmation-route"></span><span class="confirmation-mark"><svg viewBox="0 0 32 32" fill="none"><path class="confirmation-check" d="m8 16.5 5 5L24 10.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><span class="eyebrow confirmation-eyebrow">${confirmed ? "Early Access Confirmed" : "Joining the Waitlist"}</span><h2>${confirmed ? "You’re in before kickoff." : "Securing your place."}</h2><p>${confirmed ? "We’ll email you before live trading opens, with early market previews and a quick-start guide so you’re ready to make your first move." : "Hold tight—we’re reserving your early-access spot."}</p>${confirmed ? `<button class="btn btn-primary confirmation-action" type="button" tabindex="-1">Continue Exploring</button>` : `<div class="confirmation-progress" aria-hidden="true"><span></span></div>`}</section></div>`;
}

function legacyRenderWaitlistFrame(mode) {
  const error = mode === "error";
  const marketRows = [["GTL", "Get the Lead", 38, 62], ["TIE", "", 22, 78], ["KTL", "Keep the Lead", 64, 36]];
  return `<div class="flat-screen is-waitlist waitlist-page"><header class="waitlist-header"><span class="waitlist-brand">${brandLogoSVG()}</span><div class="waitlist-header-actions"><span class="btn btn-glass header-cta">Join the Waitlist</span><span class="btn btn-glass header-home">Home</span></div></header><main><section class="waitlist-hero"><div class="hero-atmosphere"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-orb hero-orb--green"></div><div class="hero-orb hero-orb--blue"></div></div><div class="waitlist-shell hero-layout"><div class="hero-copy"><div class="kickoff-pill"><span class="live-pulse"></span>Launching for NFL Season</div><h1>Don’t just watch the game. <span>Get the lead.</span></h1><p class="hero-lead">Trade the moments that move live games. Join now for early access to the NFL season.</p><div class="waitlist-form"><div class="form-row"><div class="email-field"><input class="field-input${error ? " is-error" : ""}" type="email" placeholder="Enter Your Email" tabindex="-1" readonly></div><button class="btn btn-primary join-button" type="button" tabindex="-1"><span>Get Early Access</span></button></div><p class="form-message${error ? " is-error" : ""}">${error ? "Enter a valid email address to join the waitlist." : ""}</p></div><div class="trust-row"><span>✓ First Access</span><span>✓ Launch Rewards</span><span>✓ Free to Join</span></div></div></div></section><section class="promise-section"><div class="waitlist-shell"><div class="section-intro"><span class="eyebrow">Every drive matters</span><h2>Built for the moments between the moments.</h2><p>Fast, focused markets that keep you in the action from kickoff to the final play.</p></div><div class="promise-grid">${[["01", "Live by the play", "Prices shift as the game turns. Read the moment and make your move in seconds."], ["02", "Made for momentum", "Back the lead, the tie, or the comeback—without leaving the game you’re watching."], ["03", "Simple by design", "Clear Yes or No positions. No clutter, no complicated bet slips, no missed plays."]].map(([n, title, copy], i) => `<article class="promise-card${i === 1 ? " promise-card--feature" : ""}"><span class="promise-number">${n}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></div></section><section class="markets-section"><div class="waitlist-shell markets-layout"><div class="markets-copy"><span class="eyebrow">One Game. Three Ways In.</span><h2>The game tells the story.<br><span>The market moves with it.</span></h2><p>Everything you need to read the moment—live score, game clock, possession, and prices—brought together in one focused view.</p></div><article class="game-tile launch-game-card fan-card--center is-open" style="--home-color:#E31837;--away-color:#B3995D"><div class="tile-main"><div class="game-row"><div class="team team-home is-leading"><span class="team-mark team-logo is-fallback" style="--team-color:#E31837"><span class="team-mark-abbr">KC</span></span><div class="team-meta"><span class="team-abbr team-name">Chiefs</span><span class="team-score tnum">17</span></div></div><div class="game-center"><span class="period">Q2</span><span class="clock tnum">08:42</span></div><div class="team team-away"><span class="team-mark team-logo is-fallback" style="--team-color:#B3995D"><span class="team-mark-abbr">SF</span></span><div class="team-meta"><span class="team-abbr team-name">49ers</span><span class="team-score tnum">14</span></div></div></div></div><div class="tile-foot"><div class="foot-toggle"><span class="toggle-label">Hide Bets</span></div><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad"><div class="mkt-grid"><div class="mkt-head"><span>Yes</span><span>Markets</span><span>No</span></div>${marketRows.map(([name, sub, yes, no]) => `<div class="mkt-row"><span class="price yes tnum">${yes}¢</span><span class="mkt-name">${name}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span><span class="price no tnum">${no}¢</span></div>`).join("")}</div></div></div></div></div></article></div></section><section class="ranking-section"><div class="waitlist-shell ranking-layout"><div class="ranking-copy"><span class="eyebrow">Monthly Competition</span><h2>Build your balance.<br><span>Climb the ranking.</span></h2><p>Trade with Free Credits throughout the month. The ten highest balances share $5,000 in cash prizes when the competition ends.</p><div class="competition-facts"><div><strong>$5,000</strong><span>Prize Pool</span></div><div><strong>Top 10</strong><span>Win Prizes</span></div><div><strong>Monthly</strong><span>Competition Reset</span></div></div></div><div class="competition-preview"><div class="competition-table-head"><span>Rank</span><span>Player</span><span>Balance</span><span>Prize</span></div><div class="competition-rows">${[["1", "leadstorm", "6,840", "$1,500"], ["2", "fourthquarter", "6,210", "$900"], ["3", "linehunter", "5,980", "$650"]].map(([rank, user, balance, prize]) => `<div class="competition-row"><span class="competition-rank">${rank}</span><strong>${user}</strong><span>${balance}</span><span>${prize}</span></div>`).join("")}</div><div class="competition-current"><div class="competition-row is-current"><span class="competition-rank">6</span><strong>You</strong><span>4,880</span><span>$300</span></div></div></div></div></section><section class="final-cta"><div class="waitlist-shell final-inner"><span class="football-mark">🏈</span><h2>Be there before kickoff.</h2><p>Early access is limited. Join the list and we’ll save your spot.</p><span class="btn btn-primary join-button">Join the Waitlist</span></div></section></main>${legacyWaitlistConfirmation(mode)}<footer class="waitlist-footer">${brandLogoSVG()}<p>© 2026 GTL Markets. 18+. Please play responsibly.</p></footer></div>`;
}

const waitlistCheckIcon = `<svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 10 3 3 7-7"/></svg>`;
const waitlistArrowIcon = `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const waitlistChevronIcon = `<span class="chev"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
const waitlistTrophyIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4Z" stroke="currentColor" stroke-width="2"/><path d="M8 6H5.5A2.5 2.5 0 0 0 8 8.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5M12 12v4M9 20h6M10 16h4v4h-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const waitlistMedalIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 3 4 6 4-6M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" stroke="currentColor" stroke-width="2"/><path d="M12 12.7v3.8" stroke="currentColor" stroke-width="2"/></svg>`;

function waitlistMarketRows(rows, interactive = false) {
  return rows.map(([yes, name, sub, no]) => `<div class="mkt-row"><${interactive ? "button" : "span"} class="price yes tnum"${interactive ? ` type="button" tabindex="-1"` : ""}>${yes}¢</${interactive ? "button" : "span"}><span class="mkt-name">${name}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span><${interactive ? "button" : "span"} class="price no tnum"${interactive ? ` type="button" tabindex="-1"` : ""}>${no}¢</${interactive ? "button" : "span"}></div>`).join("");
}

function waitlistGameCard({ side = "center", home, away, period, clock, rows }) {
  const isSide = side !== "center";
  const classes = isSide ? ` fan-card fan-card--${side}` : " fan-card--center is-open";
  const markets = `<div class="mkt-grid"><div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>${waitlistMarketRows(rows, !isSide)}</div>`;
  const footer = isSide
    ? `<div class="tile-foot fan-card-markets"><div class="foot-toggle"><span class="toggle-label">Bets</span></div>${markets}</div>`
    : `<div class="tile-foot"><div class="foot-toggle">${waitlistChevronIcon}<span class="toggle-label">Hide Bets</span>${waitlistChevronIcon}</div><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${markets}</div></div></div></div>`;
  return `<article class="game-tile launch-game-card${classes}"${isSide ? ` aria-hidden="true"` : ` aria-label="Live Kansas City Chiefs versus San Francisco 49ers game card"`} style="--home-color:${home.color};--away-color:${away.color}"><div class="tile-main"><div class="game-row"><div class="team team-home${home.leading ? " is-leading" : ""}"><span class="team-mark team-logo is-fallback" style="--team-color:${home.color}"><span class="team-mark-abbr">${home.abbr}</span></span><div class="team-meta"><span class="team-abbr team-name">${home.name}</span><span class="team-score tnum">${home.score}</span></div></div><div class="game-center"><span class="period">${period}</span><span class="clock tnum">${clock}</span></div><div class="team team-away${away.leading ? " is-leading" : ""}"><span class="team-mark team-logo is-fallback" style="--team-color:${away.color}"><span class="team-mark-abbr">${away.abbr}</span></span><div class="team-meta"><span class="team-abbr team-name">${away.name}</span><span class="team-score tnum">${away.score}</span></div></div></div></div>${footer}</article>`;
}

function waitlistFlatlayConfirmation(mode) {
  if (mode !== "joining" && mode !== "confirmed" && mode !== "sharing") return "";
  const confirmed = mode === "confirmed" || mode === "sharing";
  const sharing = mode === "sharing";
  const eyebrow = sharing ? "Share Early Access" : confirmed ? "Early Access Confirmed" : "Joining the Waitlist";
  const title = sharing ? "Bring your friends along." : confirmed ? "You’re in before kickoff." : "Securing your place.";
  const copy = sharing ? "Copy the waitlist link and send it to anyone you want beside you when live trading begins." : confirmed ? "We’ll email you before live trading opens, with early market previews and a quick-start guide so you’re ready to make your first move." : "Hold tight—we’re reserving your early-access spot.";
  const feedback = sharing
    ? `<div class="confirmation-share"><input class="confirmation-share-link" type="text" value="https://getthelead.app/waitlist" aria-label="Waitlist link" tabindex="-1" readonly><div class="confirmation-actions"><span class="btn btn-primary confirmation-action"><span>Copy</span></span></div><p class="confirmation-copy-status" aria-live="polite"></p></div>`
    : confirmed
    ? `<div class="confirmation-actions"><span class="btn btn-primary confirmation-action">Share with Friends</span></div>`
    : `<div class="confirmation-progress" aria-hidden="true"><span></span></div>`;
  return `<div class="waitlist-confirmation is-visible${confirmed ? " is-confirmed" : ""}${sharing ? " is-sharing" : ""}"><div class="confirmation-backdrop"></div><section class="confirmation-card" role="dialog" aria-modal="true" aria-label="${eyebrow}"><div class="confirmation-visual" aria-hidden="true"><span class="confirmation-ring confirmation-ring--outer"></span><span class="confirmation-ring confirmation-ring--inner"></span><span class="confirmation-route"></span><span class="confirmation-mark"><svg viewBox="0 0 32 32" fill="none"><path class="confirmation-check" d="m8 16.5 5 5L24 10.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><span class="eyebrow confirmation-eyebrow">${eyebrow}</span><h2>${title}</h2><p>${copy}</p>${feedback}</section>${confirmed ? `<span class="btn btn-secondary confirmation-screen-close">Close</span>` : ""}</div>`;
}

function renderWaitlistFlatlay(mode) {
  const error = mode === "error";
  const duplicate = mode === "duplicate";
  const alreadyJoined = mode === "alreadyJoined";
  const emailValue = error ? "not-an-email" : duplicate ? "alex@example.com" : "";
  const emailPlaceholder = alreadyJoined ? "alex@example.com" : "Enter Your Email";
  const formMessage = error
    ? "Enter a valid email address to join the waitlist."
    : duplicate
      ? "This email is already on the waitlist."
      : alreadyJoined
        ? "We’ll send launch updates to this email."
        : "";
  const formMessageState = error || duplicate ? " is-error" : alreadyJoined ? " is-success" : "";
  const joinLabel = alreadyJoined ? "Share with Friends" : "Get Early Access";
  const promiseCards = [
    ["01", `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`, "Live by the play", "Prices shift as the game turns. Read the moment and make your move in seconds."],
    ["02", `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`, "Made for momentum", "Back the lead, the tie, or the comeback—without leaving the game you’re watching."],
    ["03", `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`, "Simple by design", "Clear Yes or No trades. No clutter, no complicated bet slips, no missed plays."],
  ];
  const gameCards = [
    waitlistGameCard({ side: "left", home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", leading: true }, away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97" }, period: "Q3", clock: "11:05", rows: [[44, "GTL", "Get the Lead", 56], [19, "TIE", "", 81], [58, "KTL", "Keep the Lead", 42]] }),
    waitlistGameCard({ side: "right", home: { abbr: "DAL", name: "Cowboys", score: 10, color: "#003594" }, away: { abbr: "PHI", name: "Eagles", score: 13, color: "#004C54", leading: true }, period: "Q4", clock: "02:14", rows: [[46, "GTL", "Get the Lead", 54], [28, "TIE", "", 72], [61, "KTL", "Keep the Lead", 39]] }),
    waitlistGameCard({ home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", leading: true }, away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D" }, period: "Q2", clock: "08:42", rows: [[38, "GTL", "Get the Lead", 62], [22, "TIE", "", 78], [64, "KTL", "Keep the Lead", 36]] }),
  ].join("");
  const rankingRows = [["is-first", waitlistTrophyIcon, "leadstorm", "6,840", "$1,500"], ["is-podium", waitlistMedalIcon, "fourthquarter", "6,210", "$900"], ["is-podium", waitlistMedalIcon, "linehunter", "5,980", "$650"]];
  return `<div class="flat-screen is-waitlist waitlist-page"><header class="waitlist-header"><span class="waitlist-brand">${brandLogoSVG()}</span><div class="waitlist-header-actions"><span class="btn btn-glass header-cta"><span class="header-cta-label-desktop">Join the Waitlist</span><span class="header-cta-label-mobile">Join Waitlist</span></span><span class="btn btn-glass header-home">Home</span></div></header><main><section class="waitlist-hero"><div class="hero-atmosphere"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-orb hero-orb--green"></div><div class="hero-orb hero-orb--blue"></div></div><div class="waitlist-shell hero-layout"><div class="hero-copy"><div class="kickoff-pill"><span class="live-pulse"></span>Launching for NFL Season</div><h1>Don’t just watch the game. <span>Get the lead.</span></h1><p class="hero-lead">Trade the moments that move live games. Join now for early access to the NFL season.</p><div class="waitlist-form${alreadyJoined ? " is-complete" : ""}"><div class="form-row"><div class="email-field"><input class="field-input${error || duplicate ? " is-error" : ""}" type="email" value="${emailValue}" placeholder="${emailPlaceholder}" tabindex="-1" readonly${alreadyJoined ? " disabled" : ""}></div><span class="btn btn-primary join-button"><span>${joinLabel}</span>${alreadyJoined ? "" : waitlistArrowIcon}</span></div><p class="form-message${formMessageState}">${formMessage}</p></div><div class="trust-row"><span>${waitlistCheckIcon}First Access</span><span>${waitlistCheckIcon}Launch Rewards</span><span>${waitlistCheckIcon}Free to Join</span></div></div></div><div class="scroll-cue"><span></span>See what’s coming</div></section><section class="promise-section"><div class="waitlist-shell"><div class="section-intro"><span class="eyebrow">Every drive matters</span><h2>Built for the moments between the moments.</h2><p>Fast, focused markets that keep you in the action from kickoff to the final play.</p></div><div class="promise-grid">${promiseCards.map(([number, icon, title, copy], index) => `<article class="promise-card${index === 1 ? " promise-card--feature" : ""}"><span class="promise-icon">${icon}</span><span class="promise-number">${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></div></section><section class="markets-section"><div class="market-field-lines"></div><div class="waitlist-shell markets-layout"><div class="markets-copy"><span class="eyebrow">One Game. Three Ways In.</span><h2>The game tells the story.<br><span>The market moves with it.</span></h2><p>Everything you need to read the moment—live score, game clock, possession, and prices—brought together in one focused view.</p></div><div class="game-card-fan">${gameCards}</div></div></section><section class="ranking-section"><div class="ranking-glow"></div><div class="waitlist-shell ranking-layout"><div class="ranking-copy"><span class="eyebrow">Monthly Competition</span><h2>Build your balance.<br><span>Climb the ranking.</span></h2><p>Trade with Free Credits throughout the month. The ten highest balances share $5,000 in cash prizes when the competition ends.</p><div class="competition-facts"><div><strong class="tnum">$5,000</strong><span>Prize Pool</span></div><div><strong class="tnum">Top 10</strong><span>Win Prizes</span></div><div><strong>Monthly</strong><span>Competition Reset</span></div></div></div><div class="competition-preview"><div class="competition-table-head"><span>Rank</span><span>Player</span><span>Balance</span><span>Prize</span></div><div class="competition-rows">${rankingRows.map(([className, icon, user, balance, prize]) => `<div class="competition-row ${className}"><span class="competition-rank">${icon}</span><strong>${user}</strong><span class="tnum">${balance}</span><span class="tnum">${prize}</span></div>`).join("")}</div><div class="competition-current"><div class="competition-row is-current"><span class="competition-rank">6</span><strong>You</strong><span class="tnum">4,880</span><span class="tnum">$300</span></div></div></div></div></section><section class="final-cta"><div class="final-lines"></div><div class="waitlist-shell final-inner"><span class="football-mark">🏈</span><h2>Be there before kickoff.</h2><p>Early access is limited. Join the list and we’ll save your spot.</p><span class="btn btn-primary join-button"><span>Join the Waitlist</span>${waitlistArrowIcon}</span></div></section></main>${waitlistFlatlayConfirmation(mode)}<footer class="waitlist-footer"><span>${brandLogoSVG()}</span><p>© 2026 GTL Markets. 18+. Please play responsibly.</p></footer></div>`;
}

function renderRankingFrame(mode) {
  const signedOut = mode === "signedOut" || mode === "signedOutMonths";
  const monthMenuOpen = mode === "months" || mode === "signedOutMonths";
  const historical = mode === "historical";
  const rows = historical ? [
    [1, "leadstorm", 6630, "$1,500"], [2, "fourthquarter", 6280, "$900"], [3, "linehunter", 5930, "$650"],
    [4, "greenlight", 5580, "$500"], [5, "clockedge", 5230, "$400"], [6, "You", 4880, "$300", true],
    [7, "marketmaker", 4530, "$250"], [8, "snapcount", 4180, "$200"], [9, "fastbreak", 3830, "$175"], [10, "leadkeeper", 3480, "$125"],
  ] : [
    [1, "linehunter", 6980, "$1,500"], [2, "greenlight", 6630, "$900"], [3, "clockedge", 6280, "$650"],
    [4, "marketmaker", 5930, "$500"], [5, "snapcount", 5580, "$400"], [6, "fastbreak", 5230, "$300"],
    [7, "leadkeeper", 4880, "$250"], [8, "swingtrader", 4530, "$200"], [9, "leadstorm", 4180, "$175"], [10, "fourthquarter", 3830, "$125"],
  ];
  const trophy = `<svg class="rank-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 6H5.5A2.5 2.5 0 0 0 8 8.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5M12 12v4M9 20h6M10 16h4v4h-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const medal = `<svg class="rank-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 3 4 6 4-6M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12.7v3.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const rowHTML = rows.map(([rank, user, balance, prize, isCurrent]) => `<div class="ranking-row${rank <= 3 && !isCurrent ? ` is-podium is-rank-${rank}` : ""}${isCurrent ? " is-current" : ""}" role="row"${isCurrent ? ` aria-label="Your rank, position ${rank}, You, balance ${balance.toLocaleString("en-US")} credits, prize ${prize}"` : ""}>${rank <= 3 && !isCurrent ? `<span class="rank-medal" role="cell">${rank === 1 ? trophy : medal}</span>` : `<span class="rank-pos" role="cell">${rank}</span>`}<span class="rank-user" role="cell">${user}</span><span class="rank-balance tnum" role="cell">${balance.toLocaleString("en-US")}</span><span class="rank-prize tnum" role="cell">${prize}</span></div>`).join("");
  const currentRow = signedOut || historical ? "" : `<div class="ranking-current-slot" role="rowgroup"><div class="ranking-row is-current" role="row" aria-label="Your rank, position 47, You, balance 1,710 credits, prize 0"><span class="rank-pos" role="cell">47</span><span class="rank-user" role="cell">You</span><span class="rank-balance tnum" role="cell">1,710</span><span class="rank-prize tnum" role="cell">0</span></div></div>`;
  const months = [["July", 47], ["June", 6], ["May", 31], ["April", 3], ["March", 24], ["February", 8], ["January", 62]];
  const selectedMonth = historical ? "June" : "July";
  const monthSelect = `<div class="ranking-month-select${monthMenuOpen ? " is-open" : ""}"><button class="ranking-month-trigger" type="button" aria-haspopup="listbox" aria-expanded="${monthMenuOpen}"><span>${selectedMonth} 2026</span><svg viewBox="0 0 20 20" fill="none"><path d="m6 8 4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ranking-month-menu" role="listbox"${monthMenuOpen ? "" : " hidden"}>${months.map(([month, rank]) => `<button class="ranking-month-option${month === selectedMonth ? " is-selected" : ""}" type="button" role="option" aria-selected="${month === selectedMonth}"><span>${month}</span><strong>${signedOut ? "Sign in to view" : `#${rank}`}</strong></button>`).join("")}</div></div>`;
  const rules = `<section class="ranking-rules"><div class="container ranking-rules-inner"><div class="section-head center"><span class="eyebrow">Competition summary</span><h2>Monthly Competition rules</h2></div><ol class="flow"><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 14h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div><span class="flow-num">01</span><h3 class="flow-title">Free to enter</h3><p class="flow-text">No purchase is necessary. Free Credits have no cash value and expire at competition end.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flow-num">02</span><h3 class="flow-title">Be eligible</h3><p class="flow-text">You must be 18+, hold one account, and be located in an eligible state.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="11" width="3" height="5" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="7" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.8"/></svg></div><span class="flow-num">03</span><h3 class="flow-title">Climb the ranking</h3><p class="flow-text">The top 10 eligible players share $5,000 in monthly prizes.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M7 8l-3 3 3 3M4 11h9M17 16l3-3-3-3M20 13h-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flow-num">04</span><h3 class="flow-title">Verify and receive</h3><p class="flow-text">Winners verify their identity, eligibility, location, and tax details before payment.</p></li></ol><span class="ranking-rules-link">Read the full Official Rules <span>→</span></span></div></section>`;
  const resultConfig = {
    resultOutside: { rank: 47, description: "Try and reach the top 10 in August's competition to receive a cash reward!", prize: "", topThree: false },
    resultWinner: { rank: 7, description: "The GTL team will contact you shortly about claiming your reward.", prize: "$250", topThree: false },
    resultTopThree: { rank: 2, description: "The GTL team will contact you shortly about claiming your reward.", prize: "$900", topThree: true },
  }[mode];
  const celebration = resultConfig?.prize ? `<div class="ranking-celebration" aria-hidden="true"><span class="celebration-glow"></span><div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>` : "";
  const resultModal = resultConfig ? `<div class="gate-backdrop ranking-prize-backdrop is-open"></div>${celebration}<div class="auth-gate ranking-prize-gate${resultConfig.topThree ? " is-top-three" : ""} is-open" role="dialog" aria-modal="true"><div class="gate-body"><span class="ranking-prize-kicker">July Rankings</span>${resultConfig.topThree ? `<span class="ranking-prize-medal" data-rank="${resultConfig.rank}" aria-hidden="true"><span class="ranking-medal-ribbon ribbon-left"></span><span class="ranking-medal-ribbon ribbon-right"></span><span class="ranking-medal-face"><strong>${resultConfig.rank}</strong></span></span>` : ""}<h3 class="gate-title">You finished in position ${resultConfig.rank}</h3><p class="gate-desc">${resultConfig.description}</p>${resultConfig.prize ? `<strong class="ranking-prize-value tnum">${resultConfig.prize}</strong>` : ""}</div></div><button class="btn btn-secondary gate-close ranking-result-close is-open" type="button">Close</button>` : "";
  return `<div class="flat-screen is-ranking ranking-body">${homeHeader(!signedOut)}<main><header class="ranking-hero"><div class="ranking-hero-glow"></div><div class="ranking-hero-inner container"><h1>Ranking Leaderboard</h1><div class="ranking-countdown"><span class="reset-label">Resets in</span><span class="reset-time tnum"><span class="reset-num">06</span><span class="reset-unit">d</span><span class="reset-num">10</span><span class="reset-unit">h</span><span class="reset-num">15</span><span class="reset-unit">m</span></span></div></div></header><section class="ranking-page container"><section class="ranking-card" aria-label="Monthly leaderboard" role="table"><header class="ranking-card-head"><div>${monthSelect}</div><p>Top 10 win cash prizes</p></header><div class="ranking-table-head" role="row"><span role="columnheader">Rank</span><span role="columnheader">Player</span><span role="columnheader">Balance</span><span role="columnheader">Prize</span></div><div class="ranking-scroll" role="rowgroup">${rowHTML}</div>${currentRow}</section></section>${rules}</main>${homeFooter("ranking", !signedOut)}${resultModal}</div>`;
}

const gameFrameData = {
  live: {
    league: "NBA",
    variant: 2,
    period: "Q4",
    clock: "05:18",
    home: { abbr: "NYK", name: "Knicks", score: 84, color: "#F58426", logo: teamLogos.ny },
    away: { abbr: "BOS", name: "Celtics", score: 89, color: "#007A33", logo: teamLogos.bos },
    markets: { gtl: { yes: 41, no: 59 }, tie: { yes: 17, no: 83 }, ktl: { yes: 42, no: 58 } },
    stats: [
      { label: "Field Goal %", home: 46, away: 51 },
      { label: "Rebounds", home: 38, away: 35 },
      { label: "Assists", home: 19, away: 24 },
      { label: "3PT %", home: 34, away: 41 },
      { label: "Turnovers", home: 11, away: 8 },
    ],
  },
  statsNfl: {
    league: "NFL",
    variant: 1,
    period: "Q2",
    clock: "08:42",
    home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: teamLogos.kc },
    away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: teamLogos.sf },
    markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 40, no: 60 } },
    stats: [
      { label: "Total Team Yards", home: 214, away: 186 },
      { label: "Pass Yards", home: 151, away: 129 },
      { label: "Rush Yards", home: 63, away: 57 },
      { label: "Possession Time", home: "11:46", away: "09:32", homeMetric: 706, awayMetric: 572 },
      { label: "Turnovers", home: 0, away: 1 },
    ],
  },
  pregame: {
    league: "NFL",
    variant: 5,
    period: "Q4",
    clock: "02:14",
    waiting: true,
    message: "Markets open when a team takes the lead.",
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: teamLogos.dalNfl },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: teamLogos.phi },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 64, no: 36 }, ktl: { yes: 50, no: 50 } },
    stats: [
      { label: "Total Team Yards", home: 341, away: 352 },
      { label: "Pass Yards", home: 246, away: 258 },
      { label: "Rush Yards", home: 95, away: 94 },
      { label: "Possession Time", home: "28:42", away: "29:04", homeMetric: 1722, awayMetric: 1744 },
      { label: "Turnovers", home: 2, away: 1 },
    ],
  },
  countdown: {
    league: "NFL",
    variant: 5,
    period: "Starts in",
    clock: "9:59",
    countdown: true,
    waiting: true,
    message: "Markets open when the game starts.",
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: teamLogos.dalNfl },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: teamLogos.phi },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 50, no: 50 }, ktl: { yes: 50, no: 50 } },
    stats: [
      { label: "Total Team Yards", home: 0, away: 0 },
      { label: "Pass Yards", home: 0, away: 0 },
      { label: "Rush Yards", home: 0, away: 0 },
      { label: "Possession Time", home: "00:00", away: "00:00", homeMetric: 0, awayMetric: 0 },
      { label: "Turnovers", home: 0, away: 0 },
    ],
  },
  paused: {
    league: "NFL",
    variant: 3,
    period: "Q3",
    clock: "11:05",
    recalc: true,
    message: "Trading paused. Recalculating markets.",
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: teamLogos.buf },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: teamLogos.mia },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 37, no: 63 } },
    stats: [
      { label: "Total Team Yards", home: 288, away: 264 },
      { label: "Pass Yards", home: 201, away: 188 },
      { label: "Rush Yards", home: 87, away: 76 },
      { label: "Possession Time", home: "17:38", away: "16:17", homeMetric: 1058, awayMetric: 977 },
      { label: "Turnovers", home: 1, away: 1 },
    ],
  },
  openPositions: {
    league: "NFL",
    variant: 3,
    period: "Q3",
    clock: "11:05",
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: teamLogos.buf },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: teamLogos.mia },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 37, no: 63 } },
    stats: [
      { label: "Total Team Yards", home: 288, away: 264 },
      { label: "Pass Yards", home: 201, away: 188 },
      { label: "Rush Yards", home: 87, away: 76 },
      { label: "Possession Time", home: "17:38", away: "16:17", homeMetric: 1058, awayMetric: 977 },
      { label: "Turnovers", home: 1, away: 1 },
    ],
  },
  final: {
    league: "NBA",
    variant: 2,
    statsMid: 41,
    period: "Final",
    clock: "",
    final: true,
    message: "Game final. Winning contracts have settled.",
    home: { abbr: "NYK", name: "Knicks", score: 98, color: "#F58426", logo: teamLogos.ny },
    away: { abbr: "BOS", name: "Celtics", score: 104, color: "#007A33", logo: teamLogos.bos },
    markets: { gtl: { yes: 0, no: 100 }, tie: { yes: 0, no: 100 }, ktl: { yes: 100, no: 0 } },
    stats: [
      { label: "Field Goal %", home: 46, away: 51 },
      { label: "Rebounds", home: 38, away: 35 },
      { label: "Assists", home: 19, away: 24 },
      { label: "3PT %", home: 34, away: 41 },
      { label: "Turnovers", home: 11, away: 8 },
    ],
  },
};

const flatDocViews = {
  home: flatDocs.home,
  waitlist: {
    title: "Waitlist Page",
    description: "Public launch landing page, email validation, submission progress, and confirmed early-access states.",
    groups: [{ title: "Waitlist States", frames: [
      { label: "Default", type: "waitlist", mode: "default" },
      { label: "Email Validation Error", type: "waitlist", mode: "error" },
      { label: "Email Already Registered", type: "waitlist", mode: "duplicate" },
      { label: "Joining the Waitlist", type: "waitlist", mode: "joining" },
      { label: "Early Access Confirmed", type: "waitlist", mode: "confirmed" },
      { label: "Already on the Waitlist", type: "waitlist", mode: "alreadyJoined" },
      { label: "Share With Friends", type: "waitlist", mode: "sharing" },
    ] }],
  },
  authentication: {
    title: "Authentication",
    description: "Login, account creation, recovery, and post-registration onboarding presented as one connected authentication journey.",
    groups: [
      { title: "Login — Core Flow", frames: [
        { label: "Email or Phone", type: "auth", mode: "loginIdentifier" },
        { label: "Verification Code", type: "auth", mode: "loginVerify" },
        { label: "Password Option", type: "auth", mode: "loginPassword" },
      ] },
      { title: "Login — Password Recovery", frames: [
        { label: "Forgot Password", type: "auth", mode: "forgot" },
        { label: "Check Your Email", type: "auth", mode: "forgotSent" },
      ] },
      { title: "Login — Validation", frames: [
        { label: "Identifier Error", type: "auth", mode: "loginIdentifierError" },
        { label: "Verification Error", type: "auth", mode: "loginVerifyError" },
        { label: "Password Error", type: "auth", mode: "loginPasswordError" },
        { label: "Recovery Email Error", type: "auth", mode: "forgotError" },
      ] },
      { title: "Registration — Account Creation", frames: [
        { label: "Email or Social", type: "auth", mode: "signupEmail" },
        { label: "Add Phone Number", type: "auth", mode: "signupPhone" },
        { label: "Verify Phone", type: "auth", mode: "signupVerify" },
        { label: "Create Password", type: "auth", mode: "signupPassword" },
      ] },
      { title: "Registration — Validation", frames: [
        { label: "Email Error", type: "auth", mode: "signupEmailError" },
        { label: "Phone Error", type: "auth", mode: "signupPhoneError" },
        { label: "Verification Error", type: "auth", mode: "signupVerifyError" },
        { label: "Password Error", type: "auth", mode: "signupPasswordError" },
      ] },
      { title: "Welcome — Onboarding", frames: [
        { label: "Account Setup Transition", type: "welcome", mode: "intro" },
        { label: "Personal Details", type: "welcome", mode: "details" },
        { label: "Username and Welcome Credits", type: "welcome", mode: "username" },
      ] },
      { title: "Welcome — Validation", frames: [
        { label: "Personal Details Required", type: "welcome", mode: "detailsRequired" },
        { label: "Age Eligibility Error", type: "welcome", mode: "underage" },
        { label: "Username Required", type: "welcome", mode: "usernameRequired" },
        { label: "Username Format Error", type: "welcome", mode: "usernameInvalid" },
      ] },
    ],
  },
  game: flatDocs.game,
  portfolio: {
    ...flatDocs.tracker,
    title: "Portfolio Page",
    description: "Wallet page variants for portfolio stats, orders, settled history, order detail, loading, and empty states.",
  },
  fees: {
    title: "Fees Page",
    description: "Pricing, trading-fee, payout, and settlement explanation with the conditional Continue Bet return control.",
    groups: [
      { title: "Standalone", frames: [
        { label: "Signed Out", type: "fees", mode: "default" },
        { label: "Signed In", type: "fees", mode: "signedIn" },
      ] },
      { title: "Active Order", frames: [
        { label: "Continue Bet — Non-logo Initials", type: "fees", mode: "continueBet" },
        { label: "Continue Bet — Team Logos", type: "fees", mode: "continueBetLogos" },
      ] },
    ],
  },
  contact: {
    title: "Contact Page",
    description: "The implemented support-request form across guest, authenticated prefill, topic selection, validation, and successful-submission states.",
    groups: [{ title: "Contact States", frames: [
      { label: "Default Form", type: "contact", mode: "default" },
      { label: "Signed In Prefill", type: "contact", mode: "prefilled" },
      { label: "Topic Selector Open", type: "contact", mode: "topicOpen" },
      { label: "Topic Selector Above", type: "contact", mode: "topicOpenAbove" },
      { label: "Topic Selected", type: "contact", mode: "topicSelected" },
      { label: "Required Field Errors", type: "contact", mode: "error" },
      { label: "Invalid Email & Message", type: "contact", mode: "invalid" },
      { label: "Message Sent", type: "contact", mode: "success" },
    ] }],
  },
  location: {
    title: "Location Unavailable Page",
    description: "The signed-out location eligibility state linked from the mobile navigation menu.",
    groups: [{ title: "Location state", frames: [{ label: "Location unavailable", type: "location", mode: "default" }] }],
  },
  ranking: {
    title: "Ranking Page",
    description: "Authenticated and public monthly leaderboards, month selection, archived rankings, and every completed-competition result outcome.",
    groups: [
      { title: "Leaderboard States", frames: [
        { label: "Signed Out", type: "ranking", mode: "signedOut" },
        { label: "Signed-Out Month Selector", type: "ranking", mode: "signedOutMonths" },
        { label: "Current Month", type: "ranking", mode: "current" },
        { label: "Month Selector Open", type: "ranking", mode: "months" },
        { label: "Historical Month Selected", type: "ranking", mode: "historical" },
      ] },
      { title: "Completed Competition Results", frames: [
        { label: "Outside Top 10", type: "ranking", mode: "resultOutside" },
        { label: "Inside Top 10", type: "ranking", mode: "resultWinner" },
        { label: "Top 3", type: "ranking", mode: "resultTopThree" },
      ] },
    ],
  },
  rules: {
    title: "Monthly Competition Rules Page",
    description: "Official rules, legal notices, eligibility, prize schedule, verification, integrity, and administrative terms.",
    groups: [{ title: "Published Rules", frames: [{ label: "Monthly Competition Rules", type: "rules", mode: "default" }] }],
  },
  drawer: flatDocs.drawer,
  account: { ...flatDocs.account, title: "Profile & Settings Page" },
};
const individualHomeView = {
  title: "Home",
  description: "Primary entry point for live NFL markets, account context, open trades and NBA-interest capture.",
  groups: [
    { title: "Unauthenticated variants", frames: [
      { label: "Logged out default", type: "home", mode: "guest" },
    ] },
    { title: "Authenticated variants", frames: [
      { label: "Open trades — multiple games", type: "tradeLayout", mode: "homeAll" },
      { label: "Open trades — one game", type: "tradeLayout", mode: "homeSingle" },
      { label: "No open trades", type: "home", mode: "logged" },
    ] },
    { title: "NBA variants", frames: [
      { label: "NBA markets coming soon", type: "home", mode: "nba" },
      { label: "NBA interest selected", type: "home", mode: "nbaInterested" },
      { label: "NBA not for me selected", type: "home", mode: "nbaNotForMe" },
    ] },
    { title: "Edge-case variants", frames: [
      { label: "No live games", type: "home", mode: "noLive" },
      { label: "Loading", type: "home", mode: "loading" },
      { label: "Service error", type: "home", mode: "error" },
    ] },
  ],
};
const individualPageDocumentation = {
  home: {
    title: "Home",
    implementation: "<code>home.html</code>",
    purpose: "Primary entry point for live NFL markets, account context, open trades, and NBA-interest capture.",
    states: [
      "Public guest and authenticated customer experiences.",
      "Authenticated customers with no open trades, trades in one game, or trades across multiple games.",
      "Live-game availability states, including no live games, loading, service failure, and temporary market recalculation.",
      "NBA coming-soon states for no response, interested, and not-for-me selections.",
    ],
    contract: [
      "When open trades belong to one game, show that matchup as the only game pill and omit All.",
      "When open trades span multiple games, show All followed by every matchup pill. All is selected by default when the customer enters Home and lists every open trade in game order.",
      "Keep one shared live score above the trade cards. Carousel controls and indicators move one card at a time into the left focus position, while trades from the same game remain adjacent.",
      "When commercially approved team logos are available, use the logo treatment consistently across live-game cards, trade cards, league controls, and scorecards; otherwise use the team-initial fallback.",
      "When an authenticated customer has no open trades, move Live Games directly beneath the greeting so the active markets become the primary focus.",
      "NBA remains a coming-soon experience and must not be presented as currently tradable.",
    ],
    validation: [
      "Confirm whether the NBA-interest response requires persistence, analytics, or account association.",
    ],
  },
  waitlist: {
    title: "Waitlist",
    implementation: "<code>waitlist.html</code>, <code>waitlist.css</code>, <code>waitlist.js</code>",
    purpose: "Acquire launch-interest emails on a public NFL-season landing page while explaining the product, markets, and monthly competition.",
    states: [
      "A first-time visitor who has not yet joined the waitlist.",
      "Inline email feedback for a missing, malformed, or already-registered address.",
      "Joining progress while a valid email is being saved.",
      "Successful early-access confirmation and Share with Friends.",
      "A returning visitor who has already joined on the current browser.",
    ],
    contract: [
      "Keep the page publicly accessible and use the same hero email field for the header and final Join Waitlist actions.",
      "Validate the email before showing progress. An already-registered email stays in the field and receives a specific inline message.",
      "After a successful submission, remember the completed state in the browser and show You’re on the List by default on future visits.",
      "Keep progress non-dismissible while saving. After success, allow Close, backdrop, or Escape and offer Share with Friends.",
    ],
    validation: [
      "Client approval is required for the already-registered, successful confirmation, and returning-visitor copy.",
      "Confirm whether a completed waitlist state should follow the customer across browsers or remain specific to the current browser.",
    ],
  },
  authentication: {
    title: "Authentication",
    implementation: "<code>login.html</code>, <code>forgot.html</code>, <code>signup.html</code>, <code>welcome.html</code>, <code>auth.css</code>, <code>welcome.css</code>, and authentication handlers in <code>app.js</code>",
    purpose: "Bring login, account creation, password recovery, verification, and post-registration onboarding together as one connected customer journey.",
    states: [
      "Login through email or phone, six-digit verification, password entry, Google, or Apple.",
      "Password recovery request and non-enumerating Check Your Email confirmation.",
      "Account creation through email or social identity, followed by phone collection, verification, and password creation.",
      "Post-registration account setup, personal details, age eligibility, username selection, and welcome-credit claim.",
      "Inline validation for every identifier, verification, password, personal-detail, age, and username step.",
    ],
    contract: [
      "Login uses one Email or phone entry point. Preserve the customer’s destination and identifier when moving between verification, password, Back, and Resend.",
      "Keep password recovery inside the canonical login journey and never reveal whether a submitted recovery email exists.",
      "Every registration route, including Google and Apple, collects and verifies a US phone number before password creation.",
      "Verification uses six numeric inputs with a separator after the third digit and supports full-code paste, sequential focus, Backspace, expiry, and resend limits.",
      "Successful account creation opens Welcome. Name, birthday, age eligibility, username, and the 1,500-credit claim remain in that onboarding flow rather than Registration.",
      "Preserve valid non-sensitive values, place errors beside the affected control, and focus and announce the first invalid field.",
      "Keep each primary action disabled until its visible fields satisfy client-side format requirements. Server validation still runs on submission and may return an inline error without advancing the step.",
      "Start Betting reserves the username, claims credits once, completes onboarding, and routes to Home.",
    ],
    validation: [
      "Confirm safe customer-facing responses for invalid credentials, expired codes, resend limits, provider cancellation, duplicate identity, duplicate phone, and SMS delivery failure.",
      "Confirm username availability and normalization, personal-detail persistence, and timezone-safe age calculation.",
      "Confirm welcome-credit idempotency and retry behaviour so the 1,500-credit award cannot be claimed more than once.",
    ],
  },
  game: {
    title: "Game",
    implementation: "<code>game.html</code>",
    purpose: "Present one live game as a complete trading surface: navigation context, status and score, GTL/TIE/KTL prices, market statistics, game statistics, and any trades held in that game.",
    states: "Open live market, scheduled countdown, waiting for first lead, transient price recalculation, final result, My Game Trades, the global Open Trades menu in All and selected-game views, Market Stats selected, Game Stats selected, and future licensed-logo references.",
    contract: [
      "Resolve the game from the id query parameter and fall back safely when the identifier is absent or unknown.",
      "Render league and Regular Season above the status; derive Live, QTR Time, and Final from normalized feed fields rather than visual inference.",
      "Treat GTL, TIE, and KTL as separate markets whose Yes/No values are complementary and whose interaction carries game, market, side, and prices into the trading drawer.",
      "Show matching My Game Trades inline above statistics as card-indexed horizontal cards, without repeating the page scorecard.",
      "The global Open Trades menu reuses the approved game filter, live score context, trade-card hierarchy, and All/selected-game behavior from Home.",
      "Use no-logo abbreviation marks with full team names for the current implementation. Licensed-logo references use NFL assets with initials beneath them.",
      "On mobile/tablet expose one statistics panel through the equal-width toggle. On desktop hide the toggle and show Market Stats followed by Game Stats.",
      "Keep paused, waiting, and final markets non-interactive; disabling the button must not remove the explanatory state or last meaningful context.",
    ],
    validation: "Before production integration, map provider statuses to countdown, active, quarter-time, recalculating, waiting-for-lead, and final explicitly; confirm settlement timing and licensed-logo availability independently.",
    guides: [
      {
        title: "Page Anatomy",
        items: [
          "Floating global header, followed by a game-scoped back link whose label reflects Home or Portfolio when available.",
          "Scorecard: league/season, normalized status, home and away identity, score, leader emphasis, and team-colour gradient.",
          "Markets: Yes/Market/No header and fixed GTL, TIE, KTL row order, followed by contextual help or a blocking status.",
          "Game trades: show My Game Trades inline above statistics at every breakpoint; use card-indexed carousel navigation only when the row overflows.",
          "Global trades: the authenticated header opens a dismissible menu with All and matchup filters, grouped game context in All, and one shared score above the selected-game list.",
          "Statistics: Market Book and Order Flow, then Score Worm and five league-specific comparison rows.",
        ],
      },
      {
        title: "Data Contract",
        items: [
          "Game identity: id, league, period/status, clock, and optional scheduled-start or pause metadata.",
          "Each team: name, abbreviation, score, brand colour, and an optional licensed logo with an abbreviation fallback.",
          "Each market: GTL, TIE, and KTL with integer-cent Yes/No prices; reject or flag payloads whose pair does not total 100.",
          "Game Stats: ordered league-specific metrics plus numeric comparison values for bar scaling; possession retains display and numeric values.",
        ],
      },
      {
        title: "Responsive Contract",
        items: [
          "Mobile (390 reference): stacked scorecard, markets, equal-width stats toggle, and one visible stats panel with 20px content gutters.",
          "Tablet (768 reference): same stacked information architecture, wider scorecard spacing, 704px content maximum, and single-column statistic cards.",
          "Desktop (1180 reference): sticky 40% left trading column, flowing right statistics column, page-level team gradient, no stats toggle, and both panels visible.",
          "The documentation frame must emulate these breakpoints explicitly because its host viewport is desktop-sized.",
        ],
      },
      {
        title: "Interaction and Accessibility",
        items: [
          "Price buttons need market and side context, a disabled state during blocking conditions, and a visible focus treatment when interactive.",
          "Trade carousel arrows and indicators move exactly one card into the left focus position; Buy More and Sell remain attached to that trade.",
          "The only sticky game action is View Contracts. Open Trades remains a header-menu action and must not add a second animated bottom action.",
          "Stats controls use role=tab, aria-selected, aria-controls, and matching panels; hidden panels must be removed from the accessibility tree.",
          "Status colour is supplementary: text must always identify countdown, period, quarter time, recalculation, waiting, or final.",
          "Charts require concise accessible names or equivalent textual values; team artwork uses empty image alt text because the surrounding mark supplies the name.",
        ],
      },
      {
        title: "State and Update Rules",
        items: [
          "Apply score, clock, status, and all three price pairs from one coherent feed snapshot to avoid mixed-state rendering.",
          "During recalculation, preserve the last stable snapshot, disable trading, and replace prices atomically when the new snapshot arrives.",
          "Do not locally promote waiting/countdown/final states from score or clock guesses; transition only from explicit normalized service state.",
          "Preserve the selected statistics view across ordinary live updates, but initialize Market Stats when entering a game on mobile/tablet.",
        ],
      },
      {
        title: "Failure and Fallback Rules",
        items: [
          "Unknown or missing ids fall back to the first available game in the current prototype; production should use an explicit not-found strategy.",
          "Logo failures fall back to abbreviation marks with no layout shift. Current production remains the no-logo treatment.",
          "Stale or failed market data must disable trading and state why; never leave visually valid prices actionable after freshness expires.",
          "If statistics are unavailable, retain score and market functionality and provide a scoped statistics empty/error state rather than failing the page.",
        ],
      },
    ],
  },
  ranking: {
    title: "Ranking",
    implementation: "<code>ranking.html</code>",
    purpose: "Present the public monthly competition, private customer position, archived month results, and the correct post-reset outcome for every prize tier.",
    states: "Signed out, signed-out month selector, authenticated current month, authenticated month selector, historical month selected, outside-top-ten result, inside-top-ten winner, and top-three winner.",
    contract: ["Render Rank, Player, Balance, and Prize as the four stable table columns with tabular numerals.", "Expose customer ranks only after authentication; an outside-top-ten customer uses the separate highlighted row, while a top-ten customer replaces the matching leaderboard row.", "Month selection must replace the complete result set atomically and preserve one selected option.", "Result dialogs are shown once after reset; the Close button is a standalone sibling at the bottom safe area, never nested inside the modal body."],
    validation: "Confirm archived-month availability, tied-rank ordering, result-modal once-only persistence, and reward-fulfillment values against the production ranking service.",
    guides: [
      { title: "Page Anatomy", items: ["Floating global header above the gradient competition hero and reset countdown.", "Centered month selector and four-column top-ten leaderboard.", "Optional authenticated customer row below a divider when the rank is outside positions 1–10.", "Competition-summary rules and the Official Rules route below the leaderboard."] },
      { title: "Month and Authentication Rules", items: ["Build available months from the current calendar month backwards and display them newest-first.", "Signed-out month options say ‘Sign in to view’ and never leak historical customer ranks.", "Selecting a month updates the label, selected option, top ten, and customer placement from the same archived result.", "Click-away and Escape close the selector without changing the active month."] },
      { title: "Completed Result Rules", items: ["Outside Top 10: rank and next-month encouragement only; no prize, medal, or celebration.", "Positions 4–10: show the exact prize and celebration, without a podium medal.", "Positions 1–3: show prize, celebration, rank medal, and the top-three modal offset.", "The dimming backdrop, dialog, celebration layer, and bottom Close control are separate siblings with explicit stacking order."] },
      { title: "Accessibility and Responsive Contract", items: ["Use table, row, columnheader, and cell semantics; label the highlighted row as the customer’s rank.", "Use a listbox with aria-expanded and exactly one aria-selected option for month selection.", "The result uses aria-modal and is dismissible with Close, backdrop click, or Escape; decorative celebration layers stay hidden from assistive technology.", "At narrow widths retain all four columns, compact typography and gutters, and keep the standalone Close button above the device safe area."] },
    ],
  },
  rules: {
    title: "Monthly Competition Rules",
    implementation: "<code>rules.html</code>, <code>rules.css</code>",
    purpose: "Publish the authoritative legal terms for the recurring GTL Monthly Prize Competition and its $5,000 prize schedule.",
    states: "One published long-form rules document containing 13 numbered sections and the prize table.",
    contract: ["Preserve the no-purchase notice, free-credit disclaimer, numbered section order, and full prize schedule.", "Use semantic headings, ordered lists, table headers, caption, and readable long-form line lengths.", "Back should honor valid same-origin history and otherwise return to Home.", "Legal placeholders must be resolved before publication; design documentation does not convert draft language into approved legal copy."],
    validation: "Blocking legal review: replace every bracketed entity, state, URL, payment, email, and date placeholder; confirm Eligible States, dispute terms, tax language, and winner-list process.",
    guides: [
      { title: "Content Contract", items: ["The document covers Sponsor, period, eligibility, entry, winner determination, prizes, verification, conduct, integrity, publicity, privacy, general terms, and winners list.", "The prize table must total $5,000 and remain consistent with Ranking and result dialogs.", "Rules active at the start of a competition govern that competition; avoid silent mid-period replacement.", "Last-updated metadata and legal-entity ownership must be visible at the document end."] },
      { title: "Responsive and Accessibility", items: ["Keep the reading column at approximately 760px on desktop and reduce number gutters on mobile.", "Allow the prize table to scroll horizontally without clipping rank or prize cells.", "Do not communicate legal emphasis by colour alone; retain strong text and semantic structure.", "Footer Official Rules is the current page and all in-product competition summaries route here."] },
    ],
  },
  portfolio: {
    title: "Portfolio",
    implementation: "<code>wallet.html</code>",
    purpose: "Expose available credits, open trades, pending orders, settled activity and trade actions.",
    states: "Empty, open, winning, losing, conflicting trades, sell preview, loading and service error.",
    contract: ["Use the current credit balance as the shared balance source.", "Buy More and Sell retain the originating game, market and side.", "Financial values use tabular numerals and explicit positive/negative styling."],
    validation: "Confirm whether pending and settled orders require pagination or server-side filtering.",
  },
  fees: {
    title: "Fees",
    implementation: "<code>fees.html</code>, <code>fees.css</code>",
    purpose: "Explain contract pricing, the 2% trading fee, potential payout, profit calculation, and automatic settlement.",
    states: "Signed-out standalone article, signed-in standalone article, the production non-logo Continue Bet control with abbreviation chips, and an optional licensed-logo reference variant.",
    contract: ["State the 2% fee and $0.01 minimum consistently with every Buy/Sell order summary.", "Explain the 1¢–99¢ contract range and $1.00/$0.00 settlement outcomes without implying guaranteed profit.", "Keep the global header authentication-aware and always render the standard global footer after the article.", "Only show Continue Bet when the game query parameter resolves to an implemented game; float it above the bottom safe area, reserve footer clearance, and carry game, market, side, quantity, and optional limit price back to the drawer."],
    validation: "Confirm whether the fee applies independently to buys and sells, rounding order, fee caps, void/refund treatment, and whether the current 2% language is production-approved.",
    guides: [
      { title: "Page and Content Contract", items: ["Keep the reading column at the implemented 640px maximum with page-top spacing below the global header.", "Back uses same-origin browser history when available and otherwise follows its Home fallback.", "Preserve the four numbered sections and their order: contract pricing, cost, potential winnings, and settlement.", "Place the standard Product, Company, Legal, copyright, and responsible-play footer after the article; the full page must never become an internally scrolling flatlay."] },
      { title: "Continue Bet Contract", items: ["The current query contract is game, market, side, qty, and optional limit; reconstruct the return URL with id and bet=1.", "Resolve the game before showing the control; the production non-logo variant renders the same coloured abbreviation chips used throughout the app.", "Revalidate game state, current market availability, balance, transaction cap, quantity, and limit price when the drawer reopens.", "Use the implemented floating geometry: 16px viewport gutters and bottom offset, a 480px maximum width, the secondary surface background, and a one-pixel gradient border derived from both teams. The separately labelled licensed-logo state is a reference variant, not the Fees-page production default."] },
    ],
  },
  contact: {
    title: "Contact",
    implementation: "<code>contact.html</code>, <code>contact.css</code>, contact handlers in <code>app.js</code>",
    purpose: "Collect structured support and product-feedback requests and provide a traceable submission confirmation.",
    states: "Guest default, authenticated prefill, topic listbox open below or above, selected topic, required-field errors, malformed email or short message, and successful submission with reference number.",
    contract: ["Collect required name, valid email, one controlled topic, and a trimmed message of 10–1,000 characters.", "Prefill available name and email values from the authenticated account without locking either field.", "Keep topic selection keyboard-operable as a combobox/listbox, open upward when viewport space requires it, and expose the current character count.", "Show the app’s exact errors adjacent to fields while preserving valid input; focus the first invalid control.", "On success replace the form with destination email, generated GTL reference, and Send Another Message."],
    validation: "Confirm the support delivery endpoint, service-error state, required/optional field policy, SLA copy, reference format, retention, spam protection, and privacy basis.",
    guides: [
      { title: "Form and Validation Contract", items: ["Topics are Account support, Gameplay or markets, Monthly competition, Product feedback, and Something else; store the stable option value rather than its display label.", "Name and Email may be prefilled from authentication, but every submission revalidates the editable values.", "Require a non-empty Name, a valid Email, a selected Topic, and at least 10 non-whitespace Message characters; enforce the 1,000-character maximum in the control.", "Preserve valid values after validation failure and clear only the affected field’s message as input resumes."] },
      { title: "Interaction and Accessibility", items: ["The Topic control is a read-only combobox with a labelled listbox, aria-expanded, aria-controls, aria-activedescendant, and aria-selected state.", "Arrow keys wrap through options; Enter or Space selects; Escape and click-away close without clearing selection; reopening activates the current selection.", "Announce success through the focusable status region and move focus to it after submission.", "Send Another Message clears Topic and Message, restores authenticated Name and Email when available, resets the count, and focuses Message in the current implementation."] },
      { title: "Data and Delivery", items: ["Generate a traceable GTL-prefixed reference only after validation succeeds and display the submitted destination email in confirmation.", "The prototype retains only the latest 20 requests locally when storage is available; production requires an authenticated delivery endpoint, abuse controls, retention policy, and failure handling.", "Do not place customer-entered names, emails, topics, or message content into analytics or client logs.", "Keep the standard global footer and authentication-aware header present in every form and success state."] },
    ],
  },
  location: {
    title: "Location",
    implementation: "<code>location-unavailable.html</code>",
    purpose: "Explain eligibility and availability when GTL cannot be used from the customer’s current location.",
    states: "Signed-out location unavailable.",
    contract: ["Keep the restriction explanation visible without requiring authentication.", "Provide a clear route back to the available signed-out experience.", "Do not imply that changing account settings can bypass location eligibility."],
    validation: "Confirm the production location-service error and retry behaviour.",
  },
  drawer: {
    title: "Buy / Sell",
    implementation: "Trading drawer in <code>game.html</code> and <code>wallet.html</code>",
    purpose: "Market and limit order entry for buying and selling contracts, including confirmation and feedback.",
    states: "Buy market, buy limit, sell market, sell limit, maximum price, insufficient balance, invalid price, pending confirmation, success and error.",
    contract: ["Retain the originating game, market and side throughout the order flow.", "Use the shared balance and fee calculation in every order summary.", "Paused markets remain non-interactive and validation appears before confirmation."],
    validation: "Confirm whether the transaction cap is calculated before or after fees.",
  },
  account: {
    title: "Profile & Settings",
    implementation: "<code>profile.html</code> and account-management views",
    purpose: "Profile and account management for password, Google and Apple accounts, username editing and protected actions.",
    states: "Password profile, edit username, Google profile, Apple profile, signed-out protection, betting controls and account deletion.",
    contract: ["Show provider-specific account details without exposing unavailable password actions.", "Require authentication before profile or account-management content is shown.", "Keep destructive account deletion visually and semantically distinct."],
    validation: "Confirm re-authentication and retention requirements for account deletion.",
  },
};
function gameScoreboard(g, useLogos = false) {
  const lead = g.home.score === g.away.score ? null : g.home.score > g.away.score ? "home" : "away";
  const compactScore = String(g.home.score).length >= 3 || String(g.away.score).length >= 3;
  const isFinal = Boolean(g.final) || /^(final|ft)$/i.test(String(g.period || "").trim());
  const isQuarterTime = !isFinal && !g.clock;
  const clockState = isFinal ? "is-final" : isQuarterTime ? "is-quarter-time" : "is-live";
  const clockLabel = isFinal ? "Final" : isQuarterTime ? "QTR Time" : g.period;
  const team = (side) => {
    const current = g[side];
    const leading = lead === side ? " is-leading" : "";
    const mark = useLogos
      ? `<span class="team-mark gb-logo" aria-label="${current.name}" style="--team-color:${current.color}"><img src="${current.logo}" alt=""><span class="team-mark-abbr">${current.abbr}</span></span>`
      : `<span class="team-mark gb-logo is-fallback" aria-label="${current.abbr}" style="--team-color:${current.color}"><span class="team-mark-abbr">${current.abbr}</span></span>`;
    return `<div class="gb-team${leading}">${mark}<span class="gb-abbr">${useLogos ? current.abbr : current.name}</span></div>`;
  };
  return `<section class="gb${isFinal ? " is-final" : ""}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="gb-glow" aria-hidden="true"></div>
    <div class="container gb-inner">
      <div class="gb-topbar"><span class="gb-back"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Home</span></span></div>
      <div class="gb-score-stack">
        <p class="gb-league">${g.league.toUpperCase()} · Regular Season</p>
        <span class="live-badge game-clock-badge ${clockState}"><span class="game-period${isFinal ? " is-final" : ""}${g.countdown ? " is-countdown" : ""}">${!isFinal && !isQuarterTime ? `<span class="${g.countdown ? "countdown-dot" : "live-dot"}"></span>` : ""}${clockLabel}</span>${!isFinal && !isQuarterTime && g.clock ? `<span class="game-clock tnum${g.countdown ? " is-countdown" : ""}">${g.clock}</span>` : ""}</span>
        <div class="gb-score${compactScore ? " is-compact-score" : ""}">${team("home")}<div class="gb-numbers"><span class="gb-num tnum${lead === "home" ? " is-leading" : ""}">${g.home.score}</span><span class="gb-dash">–</span><span class="gb-num tnum${lead === "away" ? " is-leading" : ""}">${g.away.score}</span></div>${team("away")}</div>
      </div>
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
    <div class="mkt-grid"><div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>${row("GTL", "Get the Lead", "gtl")}${row("TIE", "", "tie")}${row("KTL", "Keep the Lead", "ktl")}</div>
    <p class="bet-help">Tap a price to start your bet.</p>
    ${g.message ? `<div class="game-recalc"><span class="pause-dot"></span><span>${g.message}</span></div>` : ""}
  </section>`;
}

function gamePreviewOrderBook(g) {
  const mid = g.statsMid ?? g.markets.gtl.yes;
  const bid = Math.max(2, mid - 1);
  const ask = Math.min(98, mid + 1);
  const size = (distance, seed) => Math.round((1500 - distance * 300) * (0.85 + ((g.variant + seed) % 4) * 0.12));
  const asks = [3, 2, 1, 0].map((distance) => ({ price: Math.min(99, ask + distance), size: size(distance, distance) }));
  const bids = [0, 1, 2, 3].map((distance) => ({ price: Math.max(1, bid - distance), size: size(distance, distance + 2) }));
  const maxSize = Math.max(...asks.map((level) => level.size), ...bids.map((level) => level.size));
  return { bid, ask, spread: ask - bid, asks, bids, maxSize };
}

function gamePreviewBetFlow(g) {
  const labels = ["Q1", "Q2", "Q3", "Q4"];
  const values = labels.map((_, index) => Math.round((34 + ((g.variant * 7 + index * 13) % 46)) * (1 + index * 0.16)));
  const max = Math.max(...values);
  return {
    total: values.reduce((sum, value) => sum + value, 0),
    buckets: labels.map((label, index) => ({ label, val: values[index], pct: Math.round((values[index] / max) * 100) })),
  };
}

function gamePreviewRecentBets(g) {
  const markets = ["GTL", "TIE", "KTL"];
  const times = ["11:58", "10:42", "09:15", "08:03", "06:37"];
  return times.map((time, index) => ({
    time,
    market: markets[(g.variant + index) % 3],
    side: (g.variant + index) % 2 ? "Yes" : "No",
    price: Math.max(5, Math.min(95, g.markets.gtl.yes + (index % 2 ? -1 : 1) * (2 + index))),
    size: 50 * (1 + ((g.variant + index) % 6)),
  }));
}

function gamePreviewWorm(g) {
  const finalDiff = g.home.score - g.away.score;
  const count = 16;
  const amplitude = Math.max(7, Math.abs(finalDiff) + 6);
  const series = Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1);
    return Math.round(Math.sin(progress * Math.PI * (2 + (g.variant % 3))) * amplitude * (1 - progress * 0.3) + finalDiff * progress);
  });
  series[0] = 0;
  series[count - 1] = finalDiff;
  const crossings = [];
  for (let index = 1; index < count; index += 1) {
    const previous = series[index - 1];
    const current = series[index];
    if ((previous > 0 && current <= 0) || (previous < 0 && current >= 0)) crossings.push(index / (count - 1));
  }
  return { series, crossings, changes: crossings.length, maxAbs: Math.max(6, ...series.map((value) => Math.abs(value))) };
}

function gamePreviewStepPath(points, width, height, min, max) {
  const span = Math.max(1, max - min);
  const coordinates = points.map((value, index) => [(index / Math.max(1, points.length - 1)) * width, height - ((value - min) / span) * height]);
  let path = `M${coordinates[0][0].toFixed(1)} ${coordinates[0][1].toFixed(1)}`;
  for (let index = 1; index < coordinates.length; index += 1) path += ` H${coordinates[index][0].toFixed(1)} V${coordinates[index][1].toFixed(1)}`;
  return path;
}

function gameMomentumPreview(g, useLogos = false, instance = "default") {
  const waiting = Boolean(g.waiting);
  const worm = gamePreviewWorm(g);
  if (waiting) {
    worm.series = Array.from({ length: 16 }, () => 0);
    worm.crossings = [];
    worm.changes = 0;
    worm.maxAbs = 6;
  }
  const wormWidth = 280;
  const wormHeight = 132;
  const wormScale = Math.ceil(worm.maxAbs / 5) * 5;
  const wormPath = gamePreviewStepPath(worm.series, wormWidth, wormHeight, -worm.maxAbs, worm.maxAbs);
  const ties = waiting ? 0 : 2 + (g.variant % 4);
  const stats = g.stats || (g.league === "NFL" ? [
    { label: "Total Team Yards", home: 318, away: 286 },
    { label: "Pass Yards", home: 224, away: 201 },
    { label: "Rush Yards", home: 94, away: 85 },
    { label: "Possession Time", home: "17:38", away: "16:17", homeMetric: 1058, awayMetric: 977 },
    { label: "Turnovers", home: 1, away: 2 },
  ] : [
    { label: "Field Goal %", home: 46, away: 51 },
    { label: "Rebounds", home: 38, away: 35 },
    { label: "Assists", home: 19, away: 24 },
    { label: "3PT %", home: 34, away: 41 },
    { label: "Turnovers", home: 11, away: 8 },
  ]);
  const statRow = (s) => {
    const homeMetric = s.homeMetric ?? Number(s.home);
    const awayMetric = s.awayMetric ?? Number(s.away);
    const max = Math.max(homeMetric, awayMetric) || 1;
    return `<div class="stat-block">
      <div class="stat-caption"><span class="stat-val tnum">${s.home}</span><span class="stat-label">${s.label}</span><span class="stat-val tnum">${s.away}</span></div>
      <div class="stat-bar-c">
        <span class="stat-fill-h" style="width:${((homeMetric / max) * 50).toFixed(1)}%"></span>
        <span class="stat-fill-a" style="width:${((awayMetric / max) * 50).toFixed(1)}%"></span>
      </div>
    </div>`;
  };
  const teamMark = (team) => useLogos
    ? `<span class="team-mark stats-logo" aria-label="${team.name}" style="--team-color:${team.color}"><img src="${team.logo}" alt=""><span class="team-mark-abbr">${team.abbr}</span></span>`
    : `<span class="team-mark stats-logo is-fallback" aria-label="${team.abbr}" style="--team-color:${team.color}"><span class="team-mark-abbr">${team.abbr}</span></span>`;
  return `<div class="momentum-grid">
    <div class="momentum-card worm-card">
      <div class="momentum-head"><span>Score Worm</span></div>
      <div class="worm-legend"><span class="worm-key"><i style="background:${g.home.color}"></i>${g.home.abbr} ahead</span><span class="worm-key"><i style="background:${g.away.color}"></i>${g.away.abbr} ahead</span></div>
      <div class="worm-wrap">
        <div class="worm-quarters" aria-hidden="true"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
        <div class="worm-axis" aria-hidden="true"><span>+${wormScale}</span><span>0</span><span>−${wormScale}</span></div>
        ${worm.crossings.map((crossing) => `<span class="worm-mark" style="left:${(crossing * 100).toFixed(1)}%"></span>`).join("")}
        <svg class="worm-svg" viewBox="0 0 ${wormWidth} ${wormHeight}" preserveAspectRatio="none" role="img" aria-label="Score margin over the game, ${worm.changes} lead changes">
          <defs><linearGradient id="ds-worm-${instance}-${g.home.abbr}-${g.away.abbr}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${wormHeight}"><stop offset="0" stop-color="${g.home.color}"></stop><stop offset="0.5" stop-color="${g.home.color}"></stop><stop offset="0.5" stop-color="${g.away.color}"></stop><stop offset="1" stop-color="${g.away.color}"></stop></linearGradient></defs>
          <line class="worm-zero" x1="0" y1="${wormHeight / 2}" x2="${wormWidth}" y2="${wormHeight / 2}"></line>
          <path class="worm-line" d="${wormPath}" style="stroke:url(#ds-worm-${instance}-${g.home.abbr}-${g.away.abbr})"></path>
        </svg>
      </div>
      <div class="worm-stats"><div class="worm-stat"><strong class="tnum">${worm.changes}</strong><span>Lead Changes</span></div><div class="worm-stat"><strong class="tnum">${ties}</strong><span>Ties</span></div></div>
    </div>
    <div class="momentum-card stats-card">
      <div class="stats-teams">${teamMark(g.home)}<span class="stats-title">Game Stats</span>${teamMark(g.away)}</div>
      <div class="stat-list">${stats.map(statRow).join("")}</div>
    </div>
  </div>`;
}

function gameStatsPreview(g, activePanel = "market", useLogos = false, instance = "default") {
  const waiting = !!g.waiting;
  const marketActive = activePanel !== "game";
  const gameActive = activePanel === "game";
  const book = gamePreviewOrderBook(g);
  const { bid, ask, asks, bids } = book;
  const emptyBookRow = `<div class="book-row"><span class="book-price tnum">--</span><span class="book-size tnum">0</span></div>`;
  const bookRow = (level, side) => `<div class="book-row book-${side}">
    <span class="book-depth"><span class="book-depth-fill" style="width:${Math.round((level.size / book.maxSize) * 100)}%"></span></span>
    <span class="book-price tnum">${level.price}¢</span>
    <span class="book-size tnum">${level.size.toLocaleString("en-US")}</span>
  </div>`;
  const flow = gamePreviewBetFlow(g);
  if (waiting) flow.buckets = flow.buckets.map((item) => ({ ...item, val: 0, pct: 6 }));
  const bets = gamePreviewRecentBets(g);
  const tabsId = `game-stats-tabs-${instance}`;
  const marketPanelId = `game-market-panel-${instance}`;
  const gamePanelId = `game-stats-panel-${instance}`;
  return `<section class="container stats-section" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="section-head center stats-overall-head"><span class="eyebrow">Stats</span><h2>Inside the game</h2></div>
    <div class="stats-tabs" id="${tabsId}" role="tablist" aria-label="Game statistics views"><button class="stats-tab${marketActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${String(marketActive)}" aria-controls="${marketPanelId}" data-stats-tab="betting" tabindex="-1">Market Stats</button><button class="stats-tab${gameActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${String(gameActive)}" aria-controls="${gamePanelId}" data-stats-tab="game" tabindex="-1">Game Stats</button></div>
    <div class="stats-panel" id="${marketPanelId}" data-stats-panel="betting"${marketActive ? "" : " hidden"}>
    <h3 class="stats-section-label">Market Stats</h3>
    <div class="chart-grid-wrap">
      <article class="chart-card">
        <div class="chart-head"><span>Market Book</span><strong class="tnum">${waiting ? "0¢ / 0¢" : `${bid}¢ / ${ask}¢`}</strong></div>
        <div class="book${waiting ? " is-empty" : ""}">
          <div class="book-side">${waiting ? Array.from({ length: 4 }, () => emptyBookRow).join("") : asks.map((level) => bookRow(level, "ask")).join("")}</div>
          <div class="book-spread"><span>Spread</span><strong class="tnum">${waiting ? "--" : `${book.spread}¢`}</strong></div>
          <div class="book-side">${waiting ? Array.from({ length: 4 }, () => emptyBookRow).join("") : bids.map((level) => bookRow(level, "bid")).join("")}</div>
        </div>
        ${waiting ? `<p class="market-empty-note">No orders yet. Markets open when a team takes the lead.</p>` : ""}
      </article>
      <article class="chart-card">
        <div class="chart-head"><span>Order Flow</span><strong class="tnum">${waiting ? "0 bets" : `${flow.total} bets`}</strong></div>
        <div class="flow-bars${waiting ? " is-empty" : ""}">${flow.buckets.map((item) => `<span class="flow-bar" style="height:${item.pct}%"><em class="flow-cap tnum">${item.val}</em></span>`).join("")}</div>
        <div class="flow-axis">${flow.buckets.map((item) => `<span>${item.label}</span>`).join("")}</div>
        <table class="bets-table">
          <thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead>
          <tbody>${waiting ? `<tr><td colspan="5" class="empty-row">No trades yet</td></tr>` : bets.map(({ time, market, side, price, size }) => `<tr><td class="tnum">${time}</td><td>${market}</td><td><span class="side-${side.toLowerCase()}">${side}</span></td><td class="num tnum">${price}¢</td><td class="num tnum">${size}</td></tr>`).join("")}</tbody>
        </table>
      </article>
    </div>
    </div>
    <div class="stats-panel" id="${gamePanelId}" data-stats-panel="game"${gameActive ? "" : " hidden"}>
      <h3 class="stats-section-label">Game Stats</h3>
      ${gameMomentumPreview(g, false, instance)}
    </div>
  </section>`;
}

function gamePositionMark(abbr, name, color) {
  return `<span class="team-mark position-outcome-mark is-fallback" aria-label="${name}" style="--team-color:${color}"><span class="team-mark-abbr">${abbr}</span></span>`;
}

function tradeMarketCode(market) {
  return market === "Get the Lead" ? "GTL" : market === "Keep the Lead" ? "KTL" : "TIE";
}

const menuPositionPreviewGames = {
  kc: {
    label: "SF @ KC",
    game: { period: "Q2", clock: "08:42", home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837" }, away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D" } },
    trades: [
      { market: "Get the Lead", side: "yes", qty: 150, value: "$57.00", pnl: "+$10.50", bought: "31¢", now: "38¢" },
      { market: "Tie", side: "no", qty: 60, value: "$46.80", pnl: "+$2.40", bought: "74¢", now: "78¢" },
      { market: "Keep the Lead", side: "yes", qty: 100, value: "$40.00", pnl: "+$0.00", bought: "40¢", now: "40¢" },
    ],
  },
  den: {
    label: "DAL @ DEN",
    game: { period: "Q4", clock: "01:33", home: { abbr: "DEN", name: "Nuggets", score: 102, color: "#FEC524" }, away: { abbr: "DAL", name: "Mavericks", score: 99, color: "#00538C" } },
    trades: [{ market: "Get the Lead", side: "no", qty: 90, value: "$60.30", pnl: "+$6.30", bought: "60¢", now: "67¢" }],
  },
  ny: {
    label: "BOS @ NYK",
    game: { period: "Q4", clock: "05:18", home: { abbr: "NYK", name: "Knicks", score: 84, color: "#F58426" }, away: { abbr: "BOS", name: "Celtics", score: 89, color: "#007A33" } },
    trades: [{ market: "Keep the Lead", side: "yes", qty: 100, value: "$63.00", pnl: "-$7.00", bought: "70¢", now: "63¢" }],
  },
};

const tradeLayoutVariantDocumentation = {
  homeAll: {
    summary: "The authenticated Home-page trade area when open trades span several games and All is selected.",
    trigger: "Use when the customer has open trades in two or more games and has not narrowed the view.",
    changes: "Add the game filter above one persistent scorecard and a trade carousel grouped by matchup.",
    data: "All open trades, their game identity, live score and clock, market, side, contracts, value, and return.",
    behavior: "Scrolling to a trade from another game transitions the fixed scorecard content; selecting a game scrolls in that game's cards beneath the same scorecard.",
  },
  homeGame: {
    summary: "The authenticated Home-page trade area narrowed to one game from a multi-game portfolio.",
    trigger: "Use after the customer selects a matchup from the multi-game filter.",
    changes: "Show the selected game's live score once, then display its My Trades cards horizontally beneath it.",
    data: "The selected game plus every open trade belonging to it.",
    behavior: "All restores the grouped portfolio view; another matchup replaces both the scorecard and trade row.",
  },
  homeSingle: {
    summary: "The Home-page trade area when every open trade belongs to one game.",
    trigger: "Use when the customer has one or more trades, all sharing the same game id.",
    changes: "Render only the matchup filter option; omit All because there is no second game to aggregate.",
    data: "The single game and all of its open trades.",
    behavior: "The sole matchup remains selected and the shared score plus My Trades row are displayed directly below it.",
  },
  liveGame: {
    summary: "The Live Game page with trades belonging to the current game shown above the statistics.",
    trigger: "Use when the authenticated customer holds one or more trades whose game id matches the page.",
    changes: "Keep the page score and markets unchanged, then show My Game Trades as horizontal cards without repeating the score.",
    data: "Current game data and only the customer's matching open trades.",
    behavior: "Cards keep their individual Buy More and Sell actions and use pagination only when the visible set overflows.",
  },
  menuAll: {
    summary: "The global Open Trades menu with multiple games and All selected.",
    trigger: "Use when the menu opens and the customer has trades in two or more games.",
    changes: "Use the implemented header trigger, backdrop and floating panel, then place the shared game filter above vertical game sections, each with its own live scoreboard and trade cards.",
    data: "The complete open-trade portfolio and current game snapshots.",
    behavior: "The menu itself scrolls vertically and matchup section breaks remain in All; selecting a matchup reveals that game's shared scoreboard and ungrouped trade list.",
  },
  menuGame: {
    summary: "The global Open Trades menu narrowed to a selected game.",
    trigger: "Use after a matchup is selected from the menu filter.",
    changes: "Keep one shared live score above a vertical trade list and remove matchup section headings from the selected-game view.",
    data: "The selected game and every matching trade.",
    behavior: "Buy More and Sell remain scoped to each trade; All returns to the grouped menu.",
  },
};

function tradeLayoutFilter(active = "all", singleGame = false) {
  const games = singleGame ? ["kc"] : ["kc", "den", "ny"];
  const options = [
    ...(singleGame ? [] : [{ key: "all", label: "All", accessible: "All games" }]),
    ...games.map((key) => {
      const game = menuPositionPreviewGames[key].game;
      return { key, label: `${game.home.abbr} v ${game.away.abbr}`, accessible: `${game.home.name} versus ${game.away.name}` };
    }),
  ];
  return `<div class="trade-game-strip" role="tablist" aria-label="Filter open trades by game">${options.map((option) => {
    const entry = option.key === "all" ? null : menuPositionPreviewGames[option.key];
    const icon = option.key === "all"
      ? `<span class="trade-game-all-content" aria-hidden="true"><strong>All</strong></span>`
      : `<span class="trade-game-compact-mark" aria-hidden="true"><span class="trade-game-compact-label"><strong>${entry.game.home.abbr}</strong><b>/</b><strong>${entry.game.away.abbr}</strong></span></span>`;
    const colors = entry ? `--filter-home:${entry.game.home.color};--filter-away:${entry.game.away.color}` : `--filter-home:var(--green);--filter-away:#8fb7ff`;
    return `<button class="trade-game-pill${option.key === active ? " is-active" : ""}" type="button" role="tab" aria-selected="${String(option.key === active)}" aria-label="${option.accessible}" data-trade-filter="${option.key}"><span class="trade-game-icon${option.key === "all" ? " is-all" : ""}" style="${colors}">${icon}</span></button>`;
  }).join("")}</div>`;
}

function tradeLayoutNavigation(count) {
  if (count < 2) return "";
  const dots = Array.from({ length: count }, (_, index) => `<button class="game-position-dot${index === 0 ? " is-active" : ""}" type="button" aria-label="Focus trade card ${index + 1} of ${count}" data-trade-page="${index}"></button>`).join("");
  return `<div class="game-position-navigation"><button class="game-position-nav-button" type="button" aria-label="Previous trade card" data-trade-nav="prev"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="game-position-dots" aria-label="Trade card carousel">${dots}</div><button class="game-position-nav-button" type="button" aria-label="Next trade card" data-trade-nav="next"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`;
}

function tradeLayoutAllCards() {
  const tradeCards = Object.entries(menuPositionPreviewGames).flatMap(([gameKey, entry]) => entry.trades.map((trade) => tradeLayoutCurrentGameCard(gameKey, trade, "compact")));
  return `<section class="trade-layout-my-trades is-all-games" aria-label="All open trades, ordered by game"><div class="game-position-carousel">${tradeCards.join("")}</div>${tradeLayoutNavigation(tradeCards.length)}</section>`;
}

function tradeLayoutMenuAllCards() {
  const groups = Object.entries(menuPositionPreviewGames).map(([gameKey, entry]) => `<section class="trade-layout-menu-group" aria-label="${entry.game.home.name} versus ${entry.game.away.name}"><div class="trade-layout-scorecard trade-layout-group-score">${tradeLayoutGameScoreboard(gameKey)}</div>${entry.trades.map((trade) => tradeLayoutCurrentGameCard(gameKey, trade, "compact")).join("")}</section>`).join("");
  return `<section class="trade-layout-my-trades is-menu-vertical is-all-games" aria-label="All open trades, ordered by game"><div class="trade-layout-menu-list">${groups}</div></section>`;
}

function tradeLayoutGameData(gameKey) {
  const entry = menuPositionPreviewGames[gameKey];
  const league = gameKey === "kc" ? "NFL" : "NBA";
  return { ...entry.game, league, markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 40, no: 60 } } };
}

function tradeLayoutGameScoreboard(gameKey) {
  return gameScoreboard(tradeLayoutGameData(gameKey));
}

function tradeLayoutOutcomeTeams(gameKey, trade) {
  const game = menuPositionPreviewGames[gameKey].game;
  if (trade.market === "Tie") return [game.home, game.away];
  const leader = game.home.score >= game.away.score ? game.home : game.away;
  const trailer = leader === game.home ? game.away : game.home;
  if (trade.market === "Get the Lead") return [trade.side === "yes" ? trailer : leader];
  return [trade.side === "yes" ? leader : trailer];
}

function tradeLayoutCurrentGameCopy(gameKey, trade) {
  const team = menuPositionPreviewGames[gameKey].game.home;
  if (trade.market === "Get the Lead") return `You win if the ${team.name} ${trade.side === "yes" ? "get" : "do not get"} the lead`;
  if (trade.market === "Keep the Lead") return `You win if the ${team.name} ${trade.side === "yes" ? "keep" : "do not keep"} the lead`;
  return `You win if the game ${trade.side === "yes" ? "is tied" : "doesn't end tied"}`;
}

function tradeLayoutCurrentGameCard(gameKey, trade, variant = "table") {
  const teams = tradeLayoutOutcomeTeams(gameKey, trade);
  const marks = teams.map((team) => gamePositionMark(team.abbr, team.name, team.color)).join("");
  const colors = teams.map((team) => team.color);
  const up = !trade.pnl.startsWith("-");
  const compactValue = trade.value.replace(/\.00$/, "");
  const earningsClass = `oc-pnl ${up ? "up" : "down"} tnum`;
  const details = variant === "compact"
    ? `<div class="trade-current-total"><span class="trade-current-total-item"><strong class="tnum">${compactValue}</strong><small>Total Value</small></span><span class="trade-current-total-item is-earnings"><strong class="${earningsClass}">${trade.pnl}</strong></span></div><div class="trade-option-inline-meta"><span>${trade.qty} Contracts</span><i>•</i><span>Bought ${trade.bought}</span><i>•</i><span>Now ${trade.now}</span></div>`
    : variant === "value"
      ? `<div class="trade-option-value-focus"><span><small>Current Value</small><strong class="tnum">${compactValue}</strong></span><span><strong class="${earningsClass}">${trade.pnl}</strong></span></div><div class="trade-option-inline-meta"><span>${trade.qty} Contracts</span><i>•</i><span>Bought ${trade.bought}</span><i>•</i><span>Now ${trade.now}</span></div>`
    : variant === "movement"
      ? `<div class="trade-option-price-flow"><span><small>Bought At</small><strong class="tnum">${trade.bought}</strong></span><b aria-hidden="true">→</b><span><small>Now</small><strong class="tnum">${trade.now}</strong></span></div><div class="trade-option-price-summary"><span>${trade.qty} Contracts</span><span>Value <strong class="tnum">${compactValue}</strong></span><strong class="${earningsClass}">${trade.pnl} earnings</strong></div>`
      : `<div class="trade-option-table" role="table" aria-label="Trade details"><div class="trade-option-table-row is-labels" role="row"><span role="columnheader">Contracts</span><span role="columnheader">Bought At</span><span role="columnheader">Now</span></div><div class="trade-option-table-row is-values" role="row"><strong class="tnum" role="cell">${trade.qty}</strong><strong class="tnum" role="cell">${trade.bought}</strong><strong class="tnum" role="cell">${trade.now}</strong></div></div><div class="trade-option-table-result"><span>Value <strong class="tnum">${compactValue}</strong></span><span>Earnings <strong class="${earningsClass}">${trade.pnl}</strong></span></div>`;
  return `<article class="game-position-card pos-card--a trade-layout-current-card is-${variant}${teams.length > 1 ? " is-tie-outcome" : ""}" data-trade-game="${gameKey}" style="--outcome-color:${colors[0]};--outcome-color-2:${colors[1] || colors[0]}">
    <div class="pos-info">
      <div class="trade-current-topline"><span class="position-outcome-chip"><span class="position-outcome-marks">${marks}</span></span><div class="trade-type-line"><span>${tradeMarketCode(trade.market)}</span><i>•</i><strong class="side-${trade.side}">${trade.side.toUpperCase()}</strong></div></div>
      <p class="trade-current-condition">${tradeLayoutCurrentGameCopy(gameKey, trade)}</p>
      ${details}
      <div class="oc-actions"><button class="oc-buy" type="button" tabindex="-1">Buy More</button><button class="oc-sell" type="button" tabindex="-1">Sell</button></div>
    </div>
  </article>`;
}

function tradeLayoutGameTrades(gameKey, instance, cardVariant = "table", vertical = false) {
  const entry = menuPositionPreviewGames[gameKey];
  const cards = entry.trades.map((trade) => tradeLayoutCurrentGameCard(gameKey, trade, cardVariant)).join("");
  const count = entry.trades.length;
  if (vertical) return `<section class="trade-layout-my-trades is-menu-vertical" aria-label="Trades for ${entry.game.home.name} versus ${entry.game.away.name}"><div class="trade-layout-menu-list">${cards}</div></section>`;
  return `<section class="trade-layout-my-trades" aria-label="Trades for ${entry.game.home.name} versus ${entry.game.away.name}"><div class="game-position-carousel">${cards}</div>${tradeLayoutNavigation(count)}</section>`;
}

function tradeLayoutSelectedGame(gameKey, instance, cardVariant = "table", showAll = false, verticalMenu = false) {
  const trades = showAll ? (verticalMenu ? tradeLayoutMenuAllCards() : tradeLayoutAllCards()) : tradeLayoutGameTrades(gameKey, instance, cardVariant, verticalMenu);
  return `<div class="trade-layout-selected-game" data-trade-layout-stage data-score-game="${gameKey}"><div class="trade-layout-scorecard" data-trade-scorecard>${tradeLayoutGameScoreboard(gameKey)}</div>${trades}</div>`;
}

function tradeLayoutBody({ active = "all", singleGame = false, instance = "default", cardVariant = "table" } = {}) {
  const scoreGame = active === "all" ? "kc" : active;
  const verticalMenu = instance.startsWith("menu");
  return `<div class="trade-layout-experience" data-trade-layout-experience data-trade-instance="${instance}" data-trade-card-variant="${cardVariant}" data-trade-active="${active}" data-trade-vertical="${String(verticalMenu)}">${tradeLayoutFilter(active, singleGame)}${tradeLayoutSelectedGame(scoreGame, instance, cardVariant, active === "all", verticalMenu)}</div>`;
}

function tradeLayoutHomeHero(body) {
  return `<section class="hero trade-layout-hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner authed"><div class="hero-greeting"><h1>Hey Alex</h1></div><div class="authed-stack"><div class="positions-block trade-layout-home-panel"><div class="positions-head"><span class="eyebrow">Open Trades</span></div>${body}</div><span class="btn btn-primary authed-cta">Live Games</span></div></div></section>`;
}

function tradeLayoutLiveGameData() {
  return {
    ...tradeLayoutGameData("kc"),
    variant: 3,
    stats: gameFrameData.openPositions.stats,
  };
}

function tradeLayoutLiveGameTrades(instance = "liveGame") {
  const count = menuPositionPreviewGames.kc.trades.length;
  const titleId = `tradeLayoutLiveGameTitle-${instance}`;
  return `<section class="game-open-position container" aria-labelledby="${titleId}">
    <div class="game-positions-head"><h2 id="${titleId}">My Game Trades</h2><span class="game-trade-count" aria-label="${count} open trades in this game">${count}</span></div>
    <div class="trade-layout-experience" data-trade-layout-experience data-trade-instance="liveGame" data-trade-card-variant="compact" data-trade-active="kc" data-trade-vertical="false">${tradeLayoutGameTrades("kc", "liveGame", "compact")}</div>
  </section>`;
}

function renderTradeLayoutLiveGame(menuBody = "") {
  const game = tradeLayoutLiveGameData();
  const gameColors = `--home-color:${game.home.color};--away-color:${game.away.color}`;
  const menuOpen = Boolean(menuBody);
  const portfolioCount = Object.values(menuPositionPreviewGames).reduce((total, entry) => total + entry.trades.length, 0);
  const menu = menuOpen
    ? `<div class="hpos-backdrop is-open" aria-hidden="true"></div><aside class="hpos-panel ds-hpos-panel trade-layout-actual-menu" role="dialog" aria-label="Open Trades"><p class="hpos-heading">Open Trades</p>${menuBody}</aside>`
    : "";
  const instance = menuOpen ? "menuAll" : "liveGame";
  return `<div class="flat-screen is-game is-game-openPositions${menuOpen ? " is-game-positionsPanelOpen is-trade-layout-menu" : " is-trade-layout-live-game"}">${homeHeader(true, true, menuOpen, portfolioCount)}${menu}<main><div class="game-layout" style="${gameColors}"><div class="game-col-left" style="${gameColors}"><span class="gb-back gb-back-right" aria-hidden="true">${backIcon}<span>Home</span></span>${gameScoreboard(game)}${gameMarkets(game)}</div><div class="game-col-right">${tradeLayoutLiveGameTrades(instance)}${gameStatsPreview(game, "market", false, instance)}</div></div></main>${homeFooter("home", true)}</div>`;
}

function renderTradeLayoutFrame(mode) {
  if (mode === "liveGame") return renderTradeLayoutLiveGame();
  const selected = ["homeGame", "homeGameTable", "homeGameValue", "homeGameMovement", "menuGame", "homeSingle"].includes(mode);
  const singleGame = mode === "homeSingle";
  const cardVariant = mode === "homeGameTable" ? "table" : mode === "homeGameValue" ? "value" : mode === "homeGameMovement" ? "movement" : "compact";
  const body = tradeLayoutBody({ active: selected ? "kc" : "all", singleGame, instance: mode, cardVariant });
  if (mode === "menuAll" || mode === "menuGame") {
    return renderTradeLayoutLiveGame(body);
  }
  return `<div class="flat-screen is-home is-home-positions is-trade-layout-home">${homeHeader(true, true, false, 4)}${tradeLayoutHomeHero(body)}${homeLiveSection("positions")}${homeHowSection()}${homeFooter("home", true)}</div>`;
}

function transitionTradeLayoutScorecard(experience, gameKey) {
  const stage = experience.querySelector("[data-trade-layout-stage]");
  const scorecard = experience.querySelector("[data-trade-scorecard]");
  if (!stage || !scorecard || stage.dataset.scoreGame === gameKey) return;
  const transitionId = `${Date.now()}-${gameKey}`;
  scorecard.dataset.transitionId = transitionId;
  scorecard.classList.add("is-changing");
  window.setTimeout(() => {
    if (scorecard.dataset.transitionId !== transitionId) return;
    scorecard.innerHTML = tradeLayoutGameScoreboard(gameKey);
    stage.dataset.scoreGame = gameKey;
    scorecard.classList.remove("is-changing");
    scorecard.classList.add("is-entering");
    window.setTimeout(() => scorecard.classList.remove("is-entering"), 240);
  }, 140);
}

function syncTradeLayoutCarousel(experience, index, smooth = true) {
  const carousel = experience.querySelector(".trade-layout-my-trades .game-position-carousel");
  if (!carousel) return;
  const cards = [...carousel.querySelectorAll("[data-trade-game]")];
  if (!cards.length) return;
  const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
  experience.dataset.tradeCardIndex = String(nextIndex);
  const target = cards[nextIndex];
  const firstCardOffset = cards[0].offsetLeft;
  carousel.scrollTo({ left: target.offsetLeft - firstCardOffset, behavior: smooth ? "smooth" : "auto" });
  cards.forEach((card, cardIndex) => card.setAttribute("aria-hidden", String(cardIndex !== nextIndex)));
  experience.querySelectorAll("[data-trade-page]").forEach((dot) => dot.classList.toggle("is-active", Number(dot.dataset.tradePage) === nextIndex));
  const previous = experience.querySelector("[data-trade-nav='prev']");
  const next = experience.querySelector("[data-trade-nav='next']");
  if (previous) previous.disabled = nextIndex === 0;
  if (next) next.disabled = nextIndex === cards.length - 1;
  transitionTradeLayoutScorecard(experience, target.dataset.tradeGame);
}

function bindTradeLayoutCarousel(experience) {
  const carousel = experience.querySelector(".trade-layout-my-trades .game-position-carousel");
  if (!carousel || carousel.dataset.tradeBound === "true") return;
  carousel.dataset.tradeBound = "true";
  let scrollTimer;
  carousel.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const cards = [...carousel.querySelectorAll("[data-trade-game]")];
      if (!cards.length) return;
      const firstCardOffset = cards[0].offsetLeft;
      const index = cards.reduce((closest, card, cardIndex) => Math.abs(card.offsetLeft - firstCardOffset - carousel.scrollLeft) < Math.abs(cards[closest].offsetLeft - firstCardOffset - carousel.scrollLeft) ? cardIndex : closest, 0);
      syncTradeLayoutCarousel(experience, index, false);
    }, 90);
  }, { passive: true });
  syncTradeLayoutCarousel(experience, 0, false);
}

function bindTradeLayoutVerticalList(experience) {
  const panel = experience.closest(".trade-layout-menu-panel, .trade-layout-actual-menu");
  if (!experience.querySelector(".trade-layout-my-trades.is-menu-vertical") || !panel || experience.dataset.tradeVerticalBound === "true") return;
  experience.dataset.tradeVerticalBound = "true";
  let scrollTimer;
  panel.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const list = experience.querySelector(".trade-layout-my-trades.is-menu-vertical");
      if (!list) return;
      const cards = [...list.querySelectorAll("[data-trade-game]")];
      if (!cards.length) return;
      const anchor = panel.getBoundingClientRect().top + panel.clientHeight * .42;
      const activeCard = cards.reduce((closest, card) => Math.abs(card.getBoundingClientRect().top - anchor) < Math.abs(closest.getBoundingClientRect().top - anchor) ? card : closest, cards[0]);
      transitionTradeLayoutScorecard(experience, activeCard.dataset.tradeGame);
    }, 70);
  }, { passive: true });
  const list = experience.querySelector(".trade-layout-my-trades.is-menu-vertical");
  const firstCard = list.querySelector("[data-trade-game]");
  if (firstCard) transitionTradeLayoutScorecard(experience, firstCard.dataset.tradeGame);
}

function bindTradeLayoutCards(experience) {
  bindTradeLayoutCarousel(experience);
  bindTradeLayoutVerticalList(experience);
}

function changeTradeLayoutFilter(experience, filterKey) {
  if (!menuPositionPreviewGames[filterKey] && filterKey !== "all") return;
  const instance = experience.dataset.tradeInstance || "interactive";
  const cardVariant = experience.dataset.tradeCardVariant || "compact";
  const verticalMenu = experience.dataset.tradeVertical === "true";
  const nextGame = filterKey === "all" ? "kc" : filterKey;
  experience.dataset.tradeActive = filterKey;
  experience.dataset.tradeCardIndex = "0";
  experience.querySelectorAll("[data-trade-filter]").forEach((button) => {
    const active = button.dataset.tradeFilter === filterKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  transitionTradeLayoutScorecard(experience, nextGame);
  const currentCards = experience.querySelector(".trade-layout-my-trades");
  const nextCards = filterKey === "all" ? (verticalMenu ? tradeLayoutMenuAllCards() : tradeLayoutAllCards()) : tradeLayoutGameTrades(filterKey, instance, cardVariant, verticalMenu);
  currentCards?.classList.add("is-leaving");
  window.setTimeout(() => {
    currentCards?.insertAdjacentHTML("afterend", nextCards);
    currentCards?.remove();
    const incoming = experience.querySelector(".trade-layout-my-trades");
    incoming?.classList.add("is-entering");
    bindTradeLayoutCards(experience);
    window.setTimeout(() => incoming?.classList.remove("is-entering"), 300);
  }, 130);
}

function hydrateTradeLayoutExperiences(root) {
  root.querySelectorAll("[data-trade-layout-experience]").forEach((experience) => {
    if (experience.dataset.tradeHydrated === "true") return;
    experience.dataset.tradeHydrated = "true";
    experience.addEventListener("click", (event) => {
      const filter = event.target.closest("[data-trade-filter]");
      if (filter) {
        event.preventDefault();
        event.stopPropagation();
        changeTradeLayoutFilter(experience, filter.dataset.tradeFilter);
        return;
      }
      const page = event.target.closest("[data-trade-page]");
      if (page) {
        event.preventDefault();
        event.stopPropagation();
        syncTradeLayoutCarousel(experience, Number(page.dataset.tradePage));
        return;
      }
      const navigation = event.target.closest("[data-trade-nav]");
      if (navigation) {
        event.preventDefault();
        event.stopPropagation();
        const current = Number(experience.dataset.tradeCardIndex || 0);
        syncTradeLayoutCarousel(experience, current + (navigation.dataset.tradeNav === "next" ? 1 : -1));
      }
    });
    bindTradeLayoutCards(experience);
  });
}

function renderGameFrame(mode) {
  if (mode === "live" || mode === "liveLogos" || mode === "gameStatsLogos" || mode === "pregame" || mode === "countdown" || mode === "paused" || mode === "gameStatsNFL" || mode === "final") {
    const useLogos = mode === "liveLogos" || mode === "gameStatsLogos";
    const g = mode === "gameStatsNFL" || useLogos ? gameFrameData.statsNfl : gameFrameData[mode];
    const statsPanel = mode === "gameStatsNFL" || mode === "gameStatsLogos" ? "game" : "market";
    const gameColors = `--home-color:${g.home.color};--away-color:${g.away.color}`;
    return `<div class="flat-screen is-game is-game-${mode}">${homeHeader()}<main><div class="game-layout" style="${gameColors}"><div class="game-col-left" style="${gameColors}"><span class="gb-back gb-back-right" aria-hidden="true">${backIcon}<span>Home</span></span>${gameScoreboard(g, useLogos)}${gameMarkets(g)}</div><div class="game-col-right">${gameStatsPreview(g, statsPanel, useLogos, mode)}</div></div></main>${homeFooter("home")}</div>`;
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
  return `<div class="flat-screen is-drawer">${renderDrawerSheet(mode)}<span class="btn btn-secondary bet-sheet-close">Close</span></div>`;
}

function renderDrawerSheet(mode, showClose = false) {
  const sell = mode.startsWith("sell") || mode === "confirmSell";
  const limit = mode.toLowerCase().includes("limit") || mode === "invalid";
  const confirmation = mode === "confirmBuy" || mode === "confirmSell";
  const invalid = mode === "invalid";
  const balance = mode === "balance";
  const error = mode === "error";
  const paused = mode === "paused";
  const changeBetType = mode === "changeBetType";
  const conflict = mode === "conflict";
  const quantityMax = mode === "quantityMax";
  const primary = sell ? "Sell" : "Buy";
  const total = sell ? "$37.63" : limit ? "$53.04" : "$65.28";
  const profit = sell ? "$15.12" : limit ? "$46.96" : "$34.72";
  const warning = balance
    ? `<div class="bet-conflict buy-only" role="alert"><span><strong>Insufficient balance.</strong> Add funds before placing this bet.</span></div>`
    : error
    ? `<div class="bet-conflict buy-only" role="alert"><span><strong>Order failed.</strong> Check the order and try again.</span></div>`
    : conflict
    ? `<div class="bet-conflict buy-only" role="alert"><span>Conflicts with your <strong>Get the Lead · NO</strong> trade. Only one can win.</span></div>`
    : "";
  const marketPrice = paused ? "—" : "64¢";
  const purchasePrice = paused ? "—" : total;
  const sheetClass = confirmation ? "bet-sheet is-open is-success" : "bet-sheet is-open";
  const confirmationTitle = sell ? "Place Sale?" : "Place Bet?";
  const confirmationCopy = sell
    ? "You have 5 seconds to cancel the sale, or press Blitz Sell to place immediately."
    : "You have 5 seconds to cancel the bet, or press Blitz Buy to place immediately.";

  return `<div class="bet-sheet-backdrop is-open"></div>
    <aside class="${sheetClass}" data-step="1" data-mode="${sell ? "sell" : "buy"}" data-confirmed-market="gtl" data-confirmed-side="yes" data-draft-market="gtl" data-draft-side="yes"${paused ? ` data-trading="paused"` : ""} aria-hidden="false" aria-label="${sell ? "Sell trade" : "Place a bet"}">
      ${drawerScoreboardHTML()}
      <div class="bet-sheet-handle" aria-hidden="true"></div>
      <div class="bet-sheet-body">
        <div class="bet-step bet-step-1">
          <div class="sell-only sell-readout"><span class="sell-tag">Get the Lead · <span class="side-yes">YES</span></span><span class="sell-sub"><span>Bought at 38¢</span><span aria-hidden="true">·</span><span>Now 64¢</span></span></div>
          ${paused ? `<div class="trade-pause drawer-trade-pause buy-only" data-buy-main${changeBetType ? " hidden" : ""} role="status"><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div>` : ""}
          <div class="drawer-bet-heading buy-only" data-buy-main${changeBetType ? " hidden" : ""}><strong data-bet-heading>You win if the Chiefs get the lead</strong><button class="limit-toggle" data-change-bet-type type="button">Change GTL Yes</button></div>
          <div class="bet-field contracts-field buy-only" data-buy-main${changeBetType ? " hidden" : ""}><span class="bet-label">Select number of contracts</span><input class="num-input drawer-contract-input${quantityMax ? " is-error" : ""}" data-qty-input type="text" inputmode="numeric" value="${quantityMax ? "1,100" : "100"}" aria-label="Number of contracts" aria-invalid="${quantityMax}"><div class="qty-quick"><button data-qty-set="50" type="button">50</button><button class="${quantityMax ? "" : "is-active"}" data-qty-set="100" type="button">100</button><button data-qty-set="500" type="button">500</button><button data-qty-set="1000" type="button">1,000</button></div><p class="limit-minmax transaction-limit${quantityMax ? " is-error" : ""}" role="alert"${quantityMax ? "" : " hidden"}>The maximum contracts that can be purchased in one bet is 1,000.</p><p class="qty-total"${quantityMax ? "" : " hidden"}>Total contracts after purchase — <strong>1,250</strong></p></div>
          <div class="bet-field contracts-field sell-only"><span class="bet-label">Contracts to sell</span><input class="num-input" data-sell-qty-input type="text" inputmode="numeric" value="60" aria-label="Contracts to sell"><div class="qty-quick q3"><button data-sell-pct="25" type="button">25%</button><button class="is-active" data-sell-pct="50" type="button">50%</button><button data-sell-pct="100" type="button">All</button></div><p class="sell-held">120 contracts held</p></div>
          <div class="drawer-bet-editor buy-only" data-bet-type-editor${changeBetType ? "" : " hidden"}>
            <div class="bet-field"><span class="bet-label">Bet type</span><div class="seg seg-3" role="group" aria-label="Bet type"><button class="is-active" data-market="gtl" type="button">GTL</button><button data-market="tie" type="button">TIE</button><button data-market="ktl" type="button">KTL</button></div></div>
            <div class="bet-field drawer-pick-side"><span class="bet-label">Pick a side</span><div class="bet-toggle" data-active="yes" role="group" aria-label="Side"><button class="bt-opt yes is-active" data-contract="yes" type="button"><span class="bt-side">Yes</span><span class="bt-price tnum" data-yes-price>64¢</span></button><button class="bt-opt no" data-contract="no" type="button"><span class="bt-side">No</span><span class="bt-price tnum" data-no-price>36¢</span></button></div></div>
          </div>
          <div class="bet-field drawer-price-mode buy-only" data-buy-main${changeBetType ? " hidden" : ""}><span class="bet-label">Order price</span><div class="seg drawer-price-toggle" role="group" aria-label="Order price"><button class="${limit ? "" : "is-active"}" data-price-mode="market" type="button">Market <strong class="tnum" data-market-price>${marketPrice}</strong></button><label class="drawer-price-option${limit ? " is-active" : ""}${invalid ? " is-error" : ""}" data-price-mode="limit"><span>Set Limit</span><span class="drawer-limit-entry" data-limit-entry${limit ? "" : " hidden"}><input data-limit-input type="text" inputmode="numeric" maxlength="3" value="${invalid ? "104" : limit ? "52" : ""}" placeholder="–" aria-label="Limit price in cents"><span aria-hidden="true">¢</span></span></label></div><p class="limit-minmax${invalid ? " is-error" : ""}" data-limit-minmax${limit ? "" : " hidden"}>${invalid ? "Maximum limit price is 64¢" : "Min 1¢ · Max 64¢"}</p></div>
          <div class="bet-highlight buy-only drawer-purchase${paused ? " is-paused" : ""}" data-buy-main${changeBetType ? " hidden" : ""}><span class="bet-label">Purchase price</span><span class="bet-total-big tnum" data-total-big>${purchasePrice}</span><p class="potential-win">Potential profit of <strong data-profit-big>${profit}</strong> <span>after <a href="#" class="fees-link">fees</a></span></p></div>
          <div class="bet-highlight sell-only"><span class="bet-label">You receive</span><span class="bet-total-big tnum">$37.63</span><p class="potential-win">Realised profit of <strong>$15.12</strong> <span>after <a href="#" class="fees-link">fees</a></span></p></div>
        </div>
        <div class="bet-step bet-step-2">
          <div class="bet-field"><span class="bet-label">Order summary</span><div class="summary"><div class="summary-row"><span>Contract price</span><strong>${limit ? "52¢" : "64¢"}</strong></div><div class="summary-row"><span>Contracts</span><strong>${sell ? "60" : "100"}</strong></div><div class="summary-row"><span>Subtotal</span><strong>${sell ? "$38.40" : total}</strong></div><div class="summary-row"><span>Trading fee</span><strong>${sell ? "$0.77" : "$1.28"}</strong></div><div class="summary-row total"><span>${sell ? "You receive" : "Total to pay"}</span><strong>${sell ? "$37.63" : "$65.28"}</strong></div></div></div>
          <div class="bet-field"><span class="bet-label">Potential gain</span><div class="summary"><div class="summary-row"><span>Potential payout</span><strong>${sell ? "$60.00" : "$100.00"}</strong></div><div class="summary-row"><span>Potential profit</span><strong>${profit}</strong></div><div class="summary-row"><span>Fees</span><strong>${sell ? "$0.77" : "$1.28"}</strong></div><div class="summary-row total"><span>Net potential gain</span><strong>${sell ? "$37.63" : "$33.44"}</strong></div></div></div>
        </div>
      </div>
      <footer class="bet-sheet-footer"><button class="bet-secondary" data-breakdown${changeBetType ? " data-type-return" : ""} type="button">${changeBetType ? "Return" : "See Details"}</button><button class="bet-secondary" data-bet-back type="button">Back</button>${sell ? `<button class="bet-secondary sell-only" type="button">Cancel</button>` : ""}<button class="btn btn-primary bet-primary" data-bet-primary${changeBetType ? " data-type-confirm" : ""} type="button"${paused || invalid || changeBetType || quantityMax ? " disabled" : ""}>${changeBetType ? "Update Bet" : primary}</button></footer>
      ${warning}
      <div class="bet-success">
        <div class="success-content"><div class="bet-success-head"><span class="bet-countdown-clock" role="timer" aria-live="polite" aria-label="5 seconds remaining"><strong>5</strong></span><h3 class="bet-success-title">${confirmationTitle}</h3><p class="bet-success-sub">${confirmationCopy}</p></div><div class="bet-field"><span class="bet-label">Order summary</span><div class="summary"><div class="summary-row"><span>Bet Type</span><strong>Get the Lead YES</strong></div><div class="summary-row"><span>Contract price</span><strong>64¢</strong></div><div class="summary-row"><span>Contracts</span><strong>${sell ? "60" : "100"}</strong></div><div class="summary-row"><span>Subtotal</span><strong>${sell ? "$38.40" : "$64.00"}</strong></div><div class="summary-row"><span>Trading fee</span><strong>${sell ? "$0.77" : "$1.28"}</strong></div><div class="summary-row total"><span>${sell ? "You receive" : "Total to pay"}</span><strong>${sell ? "$37.63" : "$65.28"}</strong></div></div></div></div><div class="success-actions"><button class="bet-secondary cancel-bet" type="button">${sell ? "Cancel Sale" : "Cancel Bet"}</button><button class="btn btn-primary success-close" type="button">${sell ? "Blitz Sell" : "Blitz Buy"}</button></div>
      </div>
    </aside>
    ${showClose ? `<button class="btn btn-secondary bet-sheet-close ds-preview-close" type="button">Close</button>` : ""}`;
}

const walletGames = {
  "kc-sf": { league: "NFL", period: "Q2", clock: "08:42", home: { abbr: "KC", name: "Chiefs", score: 17, logo: teamLogos.kc, color: "#E31837" }, away: { abbr: "SF", name: "49ers", score: 14, logo: teamLogos.sf, color: "#B3995D" }, markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 40, no: 60 } } },
  "den-dal": { league: "NBA", period: "Q4", clock: "01:33", home: { abbr: "DEN", name: "Nuggets", score: 102, logo: teamLogos.den, color: "#FEC524" }, away: { abbr: "DAL", name: "Mavericks", score: 99, logo: teamLogos.dal, color: "#00538C" }, markets: { gtl: { yes: 33, no: 67 }, tie: { yes: 26, no: 74 }, ktl: { yes: 41, no: 59 } } },
  "ny-bos": { league: "NBA", period: "Q4", clock: "05:18", home: { abbr: "NYK", name: "Knicks", score: 84, logo: teamLogos.ny, color: "#F58426" }, away: { abbr: "BOS", name: "Celtics", score: 89, logo: teamLogos.bos, color: "#007A33" }, markets: { gtl: { yes: 41, no: 59 }, tie: { yes: 17, no: 83 }, ktl: { yes: 42, no: 58 } } },
  "buf-mia": { league: "NFL", period: "Q3", clock: "11:05", home: { abbr: "BUF", name: "Bills", score: 24, logo: teamLogos.buf, color: "#00338D" }, away: { abbr: "MIA", name: "Dolphins", score: 20, logo: teamLogos.mia, color: "#008E97" }, markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 37, no: 63 } } },
  "lal-gs": { league: "NBA", period: "Q3", clock: "03:42", home: { abbr: "LAL", name: "Lakers", score: 58, logo: "../gtl-app/assets/logos/nba-lal.png", color: "#552583" }, away: { abbr: "GSW", name: "Warriors", score: 61, logo: "../gtl-app/assets/logos/nba-gs.png", color: "#1D428A" }, markets: { gtl: { yes: 47, no: 53 }, tie: { yes: 28, no: 72 }, ktl: { yes: 25, no: 75 } } },
  "dal-phi": { league: "NFL", period: "Q4", clock: "02:14", home: { abbr: "DAL", name: "Cowboys", score: 0, logo: teamLogos.dalNfl, color: "#003594" }, away: { abbr: "PHI", name: "Eagles", score: 0, logo: teamLogos.phi, color: "#004C54" }, markets: { gtl: { yes: 34, no: 66 }, tie: { yes: 33, no: 67 }, ktl: { yes: 33, no: 67 } } },
};

const walletUser = {
  balance: 248.5,
  positions: [
    { gameId: "kc-sf", market: "gtl", side: "yes", qty: 150, avg: 31, date: "2026-07-06" },
    { gameId: "den-dal", market: "gtl", side: "no", qty: 90, avg: 60, date: "2026-07-05" },
    { gameId: "ny-bos", market: "ktl", side: "yes", qty: 100, avg: 70, date: "2026-07-06" },
  ],
  pending: [
    { gameId: "kc-sf", market: "tie", side: "no", qty: 200, limit: 22, date: "2026-07-07", time: "9:18 AM" },
    { gameId: "den-dal", market: "ktl", side: "yes", qty: 75, limit: 44, date: "2026-07-06", time: "7:42 PM" },
  ],
  settled: [
    { gameId: "buf-mia", market: "gtl", side: "yes", qty: 100, avg: 45, result: "win", net: 54.1, date: "2026-06-28", time: "4:05 PM" },
    { gameId: "lal-gs", market: "ktl", side: "yes", qty: 60, avg: 55, result: "loss", net: -33, date: "2026-06-25" },
    { gameId: "kc-sf", market: "gtl", side: "no", qty: 80, avg: 40, result: "win", net: 41.2, date: "2026-06-30" },
    { gameId: "ny-bos", market: "gtl", side: "yes", qty: 50, avg: 62, result: "loss", net: -31, date: "2026-06-22" },
    { gameId: "den-dal", market: "ktl", side: "no", qty: 120, avg: 48, result: "win", net: 66.4, date: "2026-07-01" },
    { gameId: "dal-phi", market: "tie", side: "no", qty: 90, avg: 78, result: "win", net: 19.8, date: "2026-06-29" },
    { gameId: "buf-mia", market: "ktl", side: "yes", qty: 40, avg: 52, result: "loss", net: -20.8, date: "2026-06-20" },
  ],
  cancelled: [
    { gameId: "lal-gs", market: "gtl", side: "yes", qty: 120, limit: 35, date: "2026-07-02", time: "8:48 PM" },
    { gameId: "kc-sf", market: "ktl", side: "yes", qty: 60, limit: 41, date: "2026-07-01" },
    { gameId: "ny-bos", market: "gtl", side: "no", qty: 100, limit: 28, date: "2026-06-30" },
    { gameId: "den-dal", market: "tie", side: "no", qty: 45, limit: 12, date: "2026-07-03" },
    { gameId: "buf-mia", market: "gtl", side: "yes", qty: 150, limit: 39, date: "2026-07-04" },
    { gameId: "dal-phi", market: "ktl", side: "no", qty: 70, limit: 55, date: "2026-06-28" },
    { gameId: "lal-gs", market: "tie", side: "yes", qty: 30, limit: 18, date: "2026-07-05" },
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
const walletMoment = (order) => [order.date ? walletDate(order.date) : "", order.time].filter(Boolean).join(" · ");
const walletTeamMark = (team, className) => `<span class="team-mark ${className} is-fallback" aria-label="${team.abbr}" style="--team-color:${team.color}"><span class="team-mark-abbr">${team.abbr}</span></span>`;

function walletOutcomeTeam(order, game) {
  const leader = game.home.score === game.away.score ? "home" : game.home.score > game.away.score ? "home" : "away";
  const trailer = leader === "home" ? "away" : "home";
  if (order.market === "gtl") return game[order.side === "yes" ? trailer : leader];
  return game[order.side === "yes" ? leader : trailer];
}

function walletTradeCondition(order, game) {
  if (order.market === "tie") return order.side === "yes" ? "the game is tied" : "either team is leading";
  const team = walletOutcomeTeam(order, game).abbr;
  return order.market === "gtl" ? `${team} gets the lead` : `${team} keeps the lead`;
}

function walletRowContext(order, type, game) {
  if (type === "open") return `Wins if ${walletTradeCondition(order, game)}`;
  if (type === "pending") return `Places when ${order.side.toUpperCase()} reaches ${order.limit}¢.`;
  if (type === "cancelled") return `Placed ${walletMoment(order)}.`;
  return walletMoment(order);
}

function walletDetailContext(order, type, game) {
  if (type === "open") return `Wins if ${walletTradeCondition(order, game)}`;
  if (type === "pending") return `This order places when ${order.side.toUpperCase()} reaches ${order.limit}¢.`;
  const team = order.market === "tie" ? null : walletOutcomeTeam(order, game).name;
  if (order.market === "tie") return order.result === "win" ? "The trade’s tie condition was met." : "The trade’s tie condition was not met.";
  const action = order.market === "gtl" ? (order.result === "win" ? "got" : "did not get") : (order.result === "win" ? "kept" : "did not keep");
  return `${team} ${action} the lead.`;
}

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
    valueHTML = `<span class="or-pnl ${win ? "up" : "down"} tnum">${walletSigned(order.net)}</span>`;
  }
  return `<button class="order-row" type="button" tabindex="-1" data-order-open="${type}:${index}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <span class="or-logos">${walletTeamMark(g.home, "or-logo")}<span class="or-v" aria-hidden="true">v</span>${walletTeamMark(g.away, "or-logo")}</span>
    <span class="or-main"><span class="or-type">${betType}</span><span class="or-teams">${walletRowContext(order, type, g)}</span></span>
    <span class="or-value">${valueHTML}</span>
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
  return `<div class="flat-screen is-wallet">${homeHeader(true, !empty)}
    <main class="wallet container">
      <div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your open trades, pending limit orders and settled bets — all in one place.</p></div>
      ${walletStatsHTML(empty)}
      <div class="stats-tabs" id="orderTabs" role="tablist" aria-label="Orders">
        <button class="stats-tab${tab === "active" ? " is-active" : ""}" type="button" role="tab" tabindex="-1" aria-selected="${tab === "active"}">Orders</button>
        <button class="stats-tab${tab === "settled" ? " is-active" : ""}" type="button" role="tab" tabindex="-1" aria-selected="${tab === "settled"}">Settled</button>
      </div>
      <div class="order-panel" data-order-panel="active"${tab === "active" ? "" : " hidden"}>${walletOrderGroup("Current", positions, "open", "No current orders.")}${walletOrderGroup("Pending", pending, "pending", "No pending orders.")}</div>
      <div class="order-panel" data-order-panel="settled"${tab === "settled" ? "" : " hidden"}>${walletOrderGroup("Settled", settled, "settled", "No settled orders yet.")}${walletOrderGroup("Cancelled", cancelled, "cancelled", "No cancelled orders.")}</div>
    </main>
    ${homeFooter("portfolio", true)}
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
          <div class="summary-row"><span>Order placed</span><strong>${walletMoment(order)}</strong></div>
          <div class="summary-row"><span>Limit price</span><strong>${order.limit}¢</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row total"><span>Order value</span><strong>${walletMoney(value)}</strong></div>`;
    actions = `<div class="order-actions-dock"><div class="oad-inner"><button class="btn btn-secondary" type="button" tabindex="-1">Edit order</button><button class="btn btn-danger" type="button" tabindex="-1">Cancel order</button></div></div>`;
  } else if (type === "settled") {
    const win = order.result === "win";
    headline = `<span class="od-big ${win ? "up" : "down"} tnum">${walletSigned(order.net)}</span>`;
    rows = `<div class="summary-row"><span>Your bet</span><strong>${betType}</strong></div>
          <div class="summary-row"><span>Status</span><strong><span class="status-chip settled">Settled</span></strong></div>
          <div class="summary-row"><span>Game date</span><strong>${walletMoment(order)}</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row"><span>Average price</span><strong>${order.avg}¢</strong></div>
          <div class="summary-row total"><span>Net return</span><strong>${walletSigned(order.net)}</strong></div>`;
  } else {
    const { cur, value, cost, pnl } = walletFigures(order);
    const up = pnl >= 0;
    headline = `<span class="od-big tnum">${walletMoney(value)}</span><span class="od-pnl ${up ? "up" : "down"} tnum">${walletSigned(pnl)}</span>`;
    rows = `<div class="summary-row"><span>Your bet</span><strong>${betType}</strong></div>
          <div class="summary-row"><span>Status</span><strong><span class="status-chip open">Current</span></strong></div>
          <div class="summary-row"><span>Order placed</span><strong>${walletMoment(order)}</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row"><span>Average price</span><strong>${order.avg}¢</strong></div>
          <div class="summary-row"><span>Current price</span><strong>${cur}¢</strong></div>
          <div class="summary-row"><span>Cost basis</span><strong>${walletMoney(cost)}</strong></div>
          <div class="summary-row total"><span>Current value</span><strong>${walletMoney(value)}</strong></div>`;
    actions = `<div class="order-actions-dock"><div class="oad-inner"><button class="btn btn-secondary" type="button" tabindex="-1">Buy More</button><button class="btn btn-primary" type="button" tabindex="-1">Sell</button></div></div>`;
  }
  return `<div class="flat-screen is-wallet is-wallet-detail">${homeHeader(true, true)}
    <main class="wallet container">
      <button class="order-back" type="button" tabindex="-1">${walletChevron}<span>Orders</span></button>
      <div class="order-detail">
        <div class="od-game"><span class="od-game-meta"><span class="or-logos">${walletTeamMark(g.home, "or-logo")}<span class="or-v" aria-hidden="true">v</span>${walletTeamMark(g.away, "or-logo")}</span><span class="od-condition">${walletDetailContext(order, type, g)}</span><span class="od-league">${g.league.toUpperCase()} · ${type === "settled" ? "Final" : `${g.period} ${g.clock}`}</span></span></div>
        <div class="od-headline">${headline}</div>
        <div class="summary od-summary">
          ${rows}
        </div>
      </div>
      ${actions}
    </main>
    ${homeFooter("portfolio", true)}
  </div>`;
}

function renderTrackerFrame(mode) {
  if (mode === "loading") return `<div class="flat-screen is-wallet">${homeHeader(true, true)}<main class="wallet container"><div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your open trades, pending limit orders and settled bets — all in one place.</p></div>${flatLoading()}</main>${homeFooter("portfolio", true)}</div>`;
  if (mode === "error") return `<div class="flat-screen is-wallet">${homeHeader(true, true)}<main class="wallet container"><div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your open trades, pending limit orders and settled bets — all in one place.</p></div><div class="wallet-empty wallet-error-state"><strong>Trades unavailable</strong><span>Could not load open exposure.</span><button class="btn btn-secondary" type="button" tabindex="-1">Reload</button></div></main>${homeFooter("portfolio", true)}</div>`;
  if (mode === "empty") return walletFrameHTML({ empty: true });
  if (mode === "detailCurrent") return walletDetailFrameHTML("open", 0);
  if (mode === "detailPending") return walletDetailFrameHTML("pending", 0);
  if (mode === "detailSettled") return walletDetailFrameHTML("settled", 0);
  return walletFrameHTML({ tab: mode === "settled" ? "settled" : "active" });
}

function accountThemeSwitch() {
  return `<span class="theme-switch-track" aria-hidden="true"><span class="theme-switch-thumb"></span><span class="theme-option theme-sun">☼</span><span class="theme-option theme-moon">☾</span></span>`;
}

function accountProfileHTML({ email, provider, hasPassword, editing = false }) {
  const providerLabel = provider === "google" ? "Google" : provider === "apple" ? "Apple" : "Email and password";
  const providerClass = provider === "google" ? "google" : provider === "apple" ? "apple" : "password";
  const providerMark = provider === "google" ? "G" : provider === "apple" ? "Apple" : "••";
  const idSuffix = `${providerClass}${editing ? "-edit" : ""}`;
  return `<header class="profile-head">
      <h1 class="profile-title">Profile &amp; Settings</h1>
      <p class="profile-intro">Manage your GTL profile, account and preferences.</p>
    </header>
    <section class="profile-section" aria-labelledby="ds-profile-${idSuffix}">
      <h2 class="profile-section-title" id="ds-profile-${idSuffix}">Profile</h2>
      <div class="profile-edit-card">
        ${editing ? `<form class="profile-username-form">
          <div class="profile-username-field"><input class="profile-username-input" type="text" value="alex" aria-label="Username" tabindex="-1" readonly></div>
          <div class="profile-username-actions"><button class="btn btn-primary btn-sm" type="button" tabindex="-1">Save</button><button class="btn btn-secondary btn-sm" type="button" tabindex="-1">Cancel</button></div>
        </form>` : `<div class="profile-username-view">
          <div class="profile-username-copy"><span>Username</span><strong>@alex</strong></div>
          <button class="btn btn-secondary btn-sm" type="button" tabindex="-1">Edit</button>
        </div>`}
      </div>
    </section>
    <section class="profile-section" aria-labelledby="ds-account-${idSuffix}">
      <h2 class="profile-section-title" id="ds-account-${idSuffix}">Account</h2>
      <div class="account-settings-list">
        <div class="account-setting-row"><span>Full name</span><strong>Alex Morgan</strong></div>
        <div class="account-setting-row"><span>Email</span><strong>${email}</strong></div>
        <div class="account-setting-row"><span>Date of birth</span><strong>Not provided</strong></div>
        <div class="account-setting-row"><span>Member since</span><strong>July 2026</strong></div>
        <div class="account-setting-row"><span>Credits</span><span class="account-inline-link">240.50 credits</span></div>
        <div class="account-setting-row"><span>Connected with</span><strong><span class="account-provider ${providerClass}"><span class="account-provider-mark">${providerMark}</span>${providerLabel}</span></strong></div>
        ${hasPassword ? `<div class="account-setting-row"><span>Password</span><span class="account-inline-link">Change password</span></div>` : ""}
      </div>
      ${hasPassword ? "" : `<p class="account-auth-note">Password changes are managed through your ${providerLabel} account.</p>`}
    </section>
    <section class="profile-section" aria-labelledby="ds-preferences-${idSuffix}">
      <h2 class="profile-section-title" id="ds-preferences-${idSuffix}">Preferences</h2>
      <div class="profile-preference-card">
        <div class="profile-preference-copy"><strong>Appearance</strong><span>Switch between light and dark mode.</span></div>
        <button class="profile-theme-control" type="button" tabindex="-1" aria-label="Switch colour theme">${accountThemeSwitch()}</button>
      </div>
      <div class="profile-preference-card">
        <div class="profile-preference-copy"><strong>Notifications</strong><span>Email notification preferences will live here.</span></div>
        <span class="status-pill">Coming soon</span>
      </div>
    </section>
    <section class="profile-section" aria-labelledby="ds-management-${idSuffix}">
      <h2 class="profile-section-title" id="ds-management-${idSuffix}">Account management</h2>
      <div class="account-actions">
        <span class="btn btn-secondary btn-block account-link-button">Betting Controls</span>
        <span class="btn btn-danger btn-block account-link-button">Delete Account</span>
      </div>
    </section>`;
}

function accountSubpageHTML(mode) {
  if (mode === "bettingControls") {
    return `<main class="account-subpage container">
      <span class="account-back"><span aria-hidden="true">←</span>Profile &amp; Settings</span>
      <section class="account-coming-soon">
        <span class="status-pill">Coming soon</span>
        <h1 class="profile-title">Betting Controls</h1>
        <p>Tools to help you manage how you play are being developed. You’ll be able to find them here when they’re ready.</p>
        <span class="btn btn-primary">Back to Profile &amp; Settings</span>
      </section>
    </main>`;
  }
  return `<main class="account-subpage container">
    <span class="account-back"><span aria-hidden="true">←</span>Profile &amp; Settings</span>
    <section class="account-confirm-card">
      <span class="profile-kicker">Account management</span>
      <h1>Delete your account?</h1>
      <p>This permanently removes your GTL profile and signs you out. Your username, account details, trades and competition history will no longer be available.</p>
      <p class="account-confirm-note">This action can’t be undone.</p>
      <div class="account-confirm-actions"><button class="btn account-delete-confirm" type="button" tabindex="-1">Delete Account</button><span class="btn btn-secondary">Cancel</span></div>
    </section>
  </main>`;
}

function renderAccountFrame(mode) {
  if (mode === "bettingControls" || mode === "deleteAccount") {
    return `<div class="flat-screen is-account profile-body">${homeHeader(true)}${accountSubpageHTML(mode)}</div>`;
  }
  if (mode === "signedOut") {
    return `<div class="flat-screen is-account profile-body">${homeHeader(false)}<main class="profile container"><div class="profile-guard"><h1 class="profile-title">Profile &amp; Settings</h1><p>Login to view and manage your account.</p><span class="btn btn-primary">Login</span></div></main>${homeFooter("profile")}</div>`;
  }
  const content = {
    profilePassword: accountProfileHTML({ email: "alex@gtl.test", provider: "password", hasPassword: true }),
    editUsername: accountProfileHTML({ email: "alex@gtl.test", provider: "password", hasPassword: true, editing: true }),
    profileGoogle: accountProfileHTML({ email: "alex.morgan@gmail.com", provider: "google", hasPassword: false }),
    profileApple: accountProfileHTML({ email: "alex@icloud.com", provider: "apple", hasPassword: false }),
  }[mode];
  return `<div class="flat-screen is-account profile-body">${homeHeader(true)}<main class="profile container">${content}</main>${homeFooter("profile", true)}</div>`;
}

function titleCaseVariantLabel(value) {
  const minorWords = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "the", "to", "vs"]);
  const words = String(value).trim().split(/\s+/);
  return words.map((word, wordIndex) => word.split("-").map((part, partIndex, parts) => {
    const match = part.match(/^([^A-Za-z0-9]*)([A-Za-z0-9]+)([^A-Za-z0-9]*)$/);
    if (!match) return part;
    const [, prefix, core, suffix] = match;
    if (/^[A-Z0-9]{2,}$/.test(core)) return `${prefix}${core}${suffix}`;
    const lower = core.toLowerCase();
    const isFirst = wordIndex === 0 && partIndex === 0;
    const isLast = wordIndex === words.length - 1 && partIndex === parts.length - 1;
    const formatted = minorWords.has(lower) && !isFirst && !isLast
      ? lower
      : `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    return `${prefix}${formatted}${suffix}`;
  }).join("-")).join(" ");
}

function renderVariantDocumentation(frame, label) {
  const documentationSources = {
    game: gameVariantDocumentation,
    ranking: rankingVariantDocumentation,
    auth: authVariantDocumentation,
    tradeLayout: tradeLayoutVariantDocumentation,
    ...standaloneVariantDocumentation,
    ...conciseVariantDocumentation,
  };
  const documentation = documentationSources[frame.type]?.[frame.mode];
  if (!documentation?.summary) {
    console.warn(`Missing variant description: ${frame.type}:${frame.mode}`);
    return `<details class="flat-frame-doc is-state-summary-only is-description-missing">
      <summary><span class="flat-frame-label">${label}</span><span class="flat-frame-doc-toggle">View Details</span></summary>
      <div class="flat-frame-doc-body"><p class="flat-frame-doc-summary">Description pending for this state.</p></div>
    </details>`;
  }
  return `<details class="flat-frame-doc is-state-summary-only">
    <summary>
      <span class="flat-frame-label">${label}</span>
      <span class="flat-frame-doc-toggle">View Details</span>
    </summary>
    <div class="flat-frame-doc-body"><p class="flat-frame-doc-summary">${documentation.summary}</p></div>
  </details>`;
}

function renderFlatFrame(frame, useTitleCase = false) {
  const renderers = {
    auth: renderAuthFrame,
    waitlist: renderWaitlistFlatlay,
    contact: renderContactFrame,
    fees: renderFeesFrame,
    rules: renderRulesFrame,
    home: renderHomeFrame,
    welcome: renderWelcomeFrame,
    location: renderLocationFrame,
    ranking: renderRankingFrame,
    game: renderGameFrame,
    tradeLayout: renderTradeLayoutFrame,
    drawer: renderDrawerFrame,
    tracker: renderTrackerFrame,
    account: renderAccountFrame,
  };
  const screen = renderers[frame.type](frame.mode);
  const label = useTitleCase ? titleCaseVariantLabel(frame.label) : frame.label;
  return `<article class="flat-frame-wrap flat-frame--${frame.type} flat-frame--${frame.type}-${frame.mode}">${renderVariantDocumentation(frame, label)}<div class="flat-phone">${screen}</div></article>`;
}

function documentationList(value) {
  const items = Array.isArray(value) ? value : [value];
  return `<ul>${items.filter(Boolean).map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function hydrateIndividualPageChrome(section) {
  const docKey = section.dataset.individualPage;
  const doc = individualPageDocumentation[docKey];
  if (!doc) return;

  section.classList.remove("individual-page-doc");
  section.classList.add("ds-restored-page-doc");
  section.innerHTML = `<article class="panel ds-pages-panel ds-individual-page-panel">
    <div class="panel-header">
      <div class="ds-page-heading"><h2>${doc.title}</h2><p>${doc.purpose}</p><span class="ds-doc-source">${doc.implementation}</span></div>
      <div class="ds-page-actions">
        <div class="ds-device-toggle" role="group" aria-label="${doc.title} preview device">
          <button class="is-active" type="button" data-individual-device="mobile" aria-label="Mobile preview" title="Mobile preview" aria-pressed="true"><span class="material-symbols-outlined" aria-hidden="true">smartphone</span></button>
          <button type="button" data-individual-device="tablet" aria-label="Tablet preview" title="Tablet preview" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">tablet_mac</span></button>
          <button type="button" data-individual-device="desktop" aria-label="Desktop preview" title="Desktop preview" aria-pressed="false"><span class="material-symbols-outlined" aria-hidden="true">desktop_windows</span></button>
        </div>
      </div>
    </div>
    <div class="ds-page-docs"><div class="ds-page-doc-grid">
      <article><span class="ds-doc-label">Required states</span>${documentationList(doc.states)}</article>
      <article><span class="ds-doc-label">Key implementation notes</span>${documentationList(doc.contract)}</article>
      <article class="is-validation"><span class="ds-doc-label">Open validation</span>${documentationList(doc.validation)}</article>
    </div>
    ${doc.decision ? `<section class="ds-page-decision" aria-label="Implementation decision required"><header><span class="ds-decision-status">${doc.decision.status}</span><h3>${doc.decision.title}</h3><p>${doc.decision.summary}</p></header><div class="ds-page-decision-grid">${doc.decision.options.map((option) => `<article><div class="ds-decision-option-head"><h4>${option.title}</h4><code>${option.source}</code></div><ul>${option.items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</div></section>` : ""}
    </div>
    <section class="ds-page-states flat-lay-canvas" data-individual-content data-flat-device="mobile" data-device="mobile" style="--page-zoom: 1;"></section>
  </article>`;
}

function renderIndividualPageSection(section, device = "mobile") {
  const docKey = section.dataset.individualPage;
  const doc = docKey === "home" ? individualHomeView : flatDocViews[docKey];
  const title = docKey === "home" ? "Home" : individualPageDocumentation[docKey]?.title || doc?.title || "Page";
  const content = section.querySelector("[data-individual-content]");
  if (!doc || !content) return;

  const nextDevice = ["mobile", "tablet", "desktop"].includes(device) ? device : "mobile";
  const variantsDescription = "Each flat lay represents an approved page state. Open View Details for a concise description of the state shown.";
  content.dataset.flatDevice = nextDevice;
  content.dataset.device = nextDevice;
  content.innerHTML = `<header class="ds-page-states-head"><span class="ds-doc-label">Page Variants</span><h3>${title} Variants</h3><p>${variantsDescription}</p></header>
    ${doc.groups.map((group) => `<section class="flat-group"><div class="flat-group-title"><h3>${titleCaseVariantLabel(group.title)}</h3></div><div class="flat-frame-row">${group.frames.map((frame) => renderFlatFrame(frame, true)).join("")}</div></section>`).join("")}`;
  hydrateTradeLayoutExperiences(content);

  section.querySelectorAll("[data-individual-device]").forEach((button) => {
    const active = button.dataset.individualDevice === nextDevice;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.setAttribute("aria-pressed", String(active));
  });
}

individualPageSections.forEach(hydrateIndividualPageChrome);

individualPageSections.forEach((section) => {
  section.querySelectorAll("[data-individual-device]").forEach((button) => {
    button.addEventListener("click", () => {
      renderIndividualPageSection(section, button.dataset.individualDevice);
    });
  });
  renderIndividualPageSection(section, "mobile");
});

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
    const authLabels = { auth: "Logged in", empty: "No open trades", guest: "Guest" };
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
      ? `${nextName} ${frameMode === "empty" ? "no open trades" : authState} preview`
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

function renderDrawerComponentStates() {
  if (!drawerSection) return;

  const states = [
    { key: "default", title: "Default Buy", copy: "Current compact buy flow with the selected bet heading, contract quantity, and inline Market or Set Limit order price.", mode: "buyMarket" },
    { key: "change-bet-type", title: "Change Bet Type", copy: "Focused selection state showing only Bet Type and Pick a Side. Confirm remains disabled until the current selection changes.", mode: "changeBetType" },
    { key: "limit-open", title: "Limit Buy", copy: "The entered limit price stays inside the Set Limit control, with its valid range shown directly below.", mode: "buyLimit" },
    { key: "paused", title: "Trading Paused", copy: "Trading status, selected bet heading, disabled pricing, and the Change bet-type path while markets recalculate.", mode: "paused" },
    { key: "conflict", title: "Existing Trade Warning", copy: "The compact buy flow with a lightweight opposing-trade warning below the potential-profit summary.", mode: "conflict" },
    { key: "sell", title: "Sell Trade", copy: "Sell flow with matched quantity controls, held-contract context beneath the shortcuts, proceeds, and explicit Cancel and Sell actions.", mode: "sellMarket" },
    { key: "confirm-buy", title: "Buy Confirmation", copy: "Five-second cancellation window before a buy is placed, with Cancel Bet and Blitz Buy actions.", mode: "confirmBuy" },
    { key: "confirm-sell", title: "Sell Confirmation", copy: "Five-second cancellation window before a sale is placed, with Cancel Sale and Blitz Sell actions.", mode: "confirmSell" },
  ];

  drawerSection.querySelectorAll(".ds-drawer-state, [data-drawer-state-mount]").forEach((state) => state.remove());
  const viewToggle = drawerSection.querySelector(".ds-drawer-view-toggle");
  viewToggle?.insertAdjacentHTML("afterend", states.map((state) => `
    <div class="ds-drawer-state" data-drawer-state="${state.key}">
      <div class="section-header ds-subsection-header">
        <h2>${state.title}</h2>
        <p>${state.copy}</p>
      </div>
      <div class="grid two ds-drawer-grid">
        <article class="panel ds-drawer-panel">
          <div class="panel-header"><h3>Mobile</h3><span class="tag">Bottom sheet</span></div>
          <div class="ds-drawer-preview ds-drawer-mobile">${renderDrawerSheet(state.mode)}</div>
        </article>
        <article class="panel ds-drawer-panel">
          <div class="panel-header"><h3>Desktop</h3><span class="tag">Modal</span></div>
          <div class="ds-drawer-preview ds-drawer-desktop">${renderDrawerSheet(state.mode, true)}</div>
        </article>
      </div>
    </div>`).join(""));
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

function createPausedDrawerState() {
  if (!drawerSection || drawerSection.querySelector("[data-drawer-state='paused']")) return;

  const baseState = drawerSection.querySelector(".ds-drawer-state");
  const mount = drawerSection.querySelector("[data-drawer-state-mount='paused']");
  if (!baseState) return;

  const pausedState = baseState.cloneNode(true);
  pausedState.dataset.drawerState = "paused";

  const heading = pausedState.querySelector(".ds-subsection-header h2");
  const copy = pausedState.querySelector(".ds-subsection-header p");
  if (heading) heading.textContent = "Trading Paused";
  if (copy) copy.textContent = "Buy flow while markets are recalculating. Prices and order submission remain unavailable until trading resumes.";

  pausedState.querySelectorAll(".bet-sheet").forEach((sheet) => {
    sheet.dataset.trading = "paused";
    sheet.dataset.confirmedMarket = "gtl";
    sheet.dataset.confirmedSide = "yes";

    const contracts = sheet.querySelector(".contracts-field.buy-only");
    if (contracts) {
      const status = document.createElement("div");
      status.className = "trade-pause drawer-trade-pause";
      status.dataset.pausedMain = "";
      status.setAttribute("role", "status");
      status.innerHTML = `<span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span>`;
      contracts.before(status);

      const betHeading = document.createElement("div");
      betHeading.className = "drawer-bet-heading";
      betHeading.dataset.pausedMain = "";
      betHeading.innerHTML = `<strong data-paused-bet-heading>You win if the Chiefs get the lead</strong><button class="limit-toggle" type="button" data-paused-change>Change GTL Yes</button>`;
      contracts.before(betHeading);

      contracts.dataset.pausedMain = "";
      const qtyInput = contracts.querySelector("[data-qty-input]");
      if (qtyInput) {
        qtyInput.value = "100";
        qtyInput.removeAttribute("placeholder");
        qtyInput.classList.add("drawer-contract-input");
      }
      contracts.querySelectorAll("[data-qty-set]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.qtySet === "100");
      });
    }

    sheet.querySelectorAll(".sell-only, [data-conflict-warning]").forEach((element) => element.remove());

    const betTypeField = sheet.querySelector("[data-market]")?.closest(".bet-field");
    const sideField = sheet.querySelector("[data-contract]")?.closest(".bet-field");
    const editor = document.createElement("div");
    editor.className = "drawer-bet-editor";
    editor.hidden = true;
    if (betTypeField) editor.appendChild(betTypeField);
    if (sideField) editor.appendChild(sideField);
    contracts?.after(editor);

    sideField?.classList.add("drawer-pick-side");
    const sideToggle = sideField?.querySelector(".bet-toggle");
    if (sideToggle) sideToggle.dataset.active = "yes";

    sideField?.querySelectorAll("[data-contract]").forEach((button) => {
      button.disabled = false;
      button.classList.toggle("is-active", button.dataset.contract === "yes");
      const price = button.querySelector(".bt-price");
      if (price) price.textContent = "–";
    });

    const limitToggle = sideField?.querySelector("[data-limit-toggle]");
    limitToggle?.remove();
    sideField?.querySelector("[data-limit-section]")?.remove();

    const priceMode = document.createElement("div");
    priceMode.className = "bet-field drawer-price-mode";
    priceMode.dataset.pausedMain = "";
    priceMode.innerHTML = `<span class="bet-label">Order price</span><div class="seg seg-2 drawer-price-toggle" role="group" aria-label="Order price"><button class="is-active" type="button" data-paused-price-mode="market">Market <strong>–</strong></button><label class="drawer-price-option" data-paused-price-mode="limit"><span>Set Limit</span><span class="drawer-limit-entry" data-paused-limit-entry hidden><input data-paused-limit-input type="text" inputmode="numeric" maxlength="3" placeholder="–" aria-label="Limit price in cents"><span aria-hidden="true">¢</span></span></label></div>`;

    const purchase = sheet.querySelector(".bet-highlight.buy-only");
    purchase?.classList.add("drawer-purchase", "is-paused");
    purchase?.setAttribute("data-paused-main", "");
    const purchasePrice = purchase?.querySelector("[data-total-big]");
    if (purchasePrice) purchasePrice.textContent = "–";
    purchase?.before(priceMode);

    const primary = sheet.querySelector("[data-bet-primary]");
    if (primary) primary.disabled = true;
    sheet.querySelector("[data-bet-back]")?.remove();
  });

  if (mount) {
    mount.replaceWith(pausedState);
  } else {
    const limitState = drawerSection.querySelector("[data-drawer-state='limit-open']");
    (limitState || baseState).after(pausedState);
  }
}

const pausedDrawerMarketLabels = { gtl: "Get the Lead", tie: "Tie", ktl: "Keep the Lead" };
const drawerPreviewMarketCodes = { gtl: "GTL", tie: "TIE", ktl: "KTL" };
function drawerPreviewBetTypeLabel(market, side) {
  return `${drawerPreviewMarketCodes[market] || String(market || "").toUpperCase()} ${side === "no" ? "No" : "Yes"}`;
}
function drawerPreviewWinHeading(market, side) {
  if (market === "tie") return `You win if the game is ${side === "yes" ? "tied" : "not tied"}`;
  if (market === "gtl") return `You win if the Chiefs ${side === "yes" ? "get" : "do not get"} the lead`;
  return `You win if the Chiefs ${side === "yes" ? "keep" : "do not keep"} the lead`;
}

function syncPausedBetEditor(sheet, market, side) {
  sheet.querySelectorAll(".drawer-bet-editor [data-market]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.market === market);
  });
  sheet.querySelectorAll(".drawer-bet-editor [data-contract]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.contract === side);
  });
  const sideToggle = sheet.querySelector(".drawer-bet-editor .bet-toggle");
  if (sideToggle) sideToggle.dataset.active = side;
}

function setDrawerBetEditorOpen(sheet, open, commit = false) {
  const editor = sheet.querySelector("[data-bet-type-editor]");
  const secondary = sheet.querySelector("[data-breakdown]");
  const primary = sheet.querySelector("[data-bet-primary]");
  if (!editor || !secondary || !primary) return;

  if (open) {
    sheet.dataset.draftMarket = sheet.dataset.confirmedMarket || "gtl";
    sheet.dataset.draftSide = sheet.dataset.confirmedSide || "yes";
  } else if (commit) {
    sheet.dataset.confirmedMarket = sheet.dataset.draftMarket;
    sheet.dataset.confirmedSide = sheet.dataset.draftSide;
    const heading = sheet.querySelector("[data-bet-heading]");
    if (heading) {
      heading.textContent = drawerPreviewWinHeading(sheet.dataset.confirmedMarket, sheet.dataset.confirmedSide);
    }
  }

  const changeButton = sheet.querySelector("[data-change-bet-type]");
  if (changeButton) changeButton.textContent = `Change ${drawerPreviewBetTypeLabel(sheet.dataset.confirmedMarket, sheet.dataset.confirmedSide)}`;

  syncPausedBetEditor(
    sheet,
    open ? sheet.dataset.draftMarket : sheet.dataset.confirmedMarket,
    open ? sheet.dataset.draftSide : sheet.dataset.confirmedSide,
  );
  sheet.querySelectorAll("[data-buy-main]").forEach((element) => { element.hidden = open; });
  const warning = sheet.querySelector(".bet-conflict");
  if (warning) warning.hidden = open;
  editor.hidden = !open;
  secondary.textContent = open ? "Return" : "See Details";
  secondary.toggleAttribute("data-type-return", open);
  primary.textContent = open ? "Update Bet" : "Buy";
  primary.toggleAttribute("data-type-confirm", open);
  primary.disabled = open;
}

function updateDrawerTypeConfirm(sheet) {
  const primary = sheet.querySelector("[data-type-confirm]");
  if (!primary) return;
  primary.disabled = sheet.dataset.draftMarket === sheet.dataset.confirmedMarket
    && sheet.dataset.draftSide === sheet.dataset.confirmedSide;
}

function setPausedBetEditorOpen(sheet, open, restoreSelection = true) {
  const editor = sheet.querySelector(".drawer-bet-editor");
  const secondary = sheet.querySelector("[data-breakdown]");
  const primary = sheet.querySelector("[data-bet-primary]");
  if (!editor || !secondary || !primary) return;

  if (open) {
    sheet.dataset.draftMarket = sheet.dataset.confirmedMarket;
    sheet.dataset.draftSide = sheet.dataset.confirmedSide;
    syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
  } else if (restoreSelection) {
    syncPausedBetEditor(sheet, sheet.dataset.confirmedMarket, sheet.dataset.confirmedSide);
  }

  sheet.querySelectorAll("[data-paused-main]").forEach((element) => { element.hidden = open; });
  editor.hidden = !open;
  secondary.textContent = open ? "Return" : "See Details";
  secondary.toggleAttribute("data-paused-return", open);
  primary.textContent = open ? "Update Bet" : "Buy";
  primary.toggleAttribute("data-paused-confirm", open);
  primary.disabled = true;
}

function updatePausedConfirmState(sheet) {
  const primary = sheet.querySelector("[data-paused-confirm]");
  if (!primary) return;
  primary.disabled = sheet.dataset.draftMarket === sheet.dataset.confirmedMarket && sheet.dataset.draftSide === sheet.dataset.confirmedSide;
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
  if (sheet.dataset.trading === "paused") return;

  const mode = sheet.dataset.mode || "buy";
  const activePrice = sheet.querySelector(".bt-opt.is-active [class*='price']");
  const limitOption = sheet.querySelector("[data-price-mode='limit'].is-active");
  const enteredLimit = numberFromInput(sheet.querySelector("[data-limit-input]"));
  const marketPrice = centsFromText(activePrice?.textContent, centsFromText(sheet.querySelector("[data-yes-price]")?.textContent, 64));
  const price = limitOption && enteredLimit ? enteredLimit : marketPrice;
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

  setText(sheet, "[data-total-big]", money(buyTotal));
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

  if (event.target.closest("[data-change-bet-type]")) {
    setDrawerBetEditorOpen(sheet, true);
    return;
  }

  if (event.target.closest("[data-type-return]")) {
    setDrawerBetEditorOpen(sheet, false);
    return;
  }

  if (event.target.closest("[data-type-confirm]")) {
    setDrawerBetEditorOpen(sheet, false, true);
    return;
  }

  const editorMarket = event.target.closest("[data-bet-type-editor] [data-market]");
  if (editorMarket) {
    sheet.dataset.draftMarket = editorMarket.dataset.market;
    syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
    syncDrawerPreviewPrices(sheet, sheet.dataset.draftMarket);
    updateDrawerTypeConfirm(sheet);
    return;
  }

  const editorSide = event.target.closest("[data-bet-type-editor] [data-contract]");
  if (editorSide) {
    sheet.dataset.draftSide = editorSide.dataset.contract;
    syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
    updateDrawerTypeConfirm(sheet);
    return;
  }

  const orderPriceMode = event.target.closest("[data-price-mode]");
  if (orderPriceMode) {
    const group = orderPriceMode.closest(".drawer-price-toggle");
    const isLimit = orderPriceMode.dataset.priceMode === "limit";
    group?.querySelectorAll("[data-price-mode]").forEach((option) => {
      option.classList.toggle("is-active", option === orderPriceMode);
      if (!isLimit || option === orderPriceMode) option.classList.remove("is-error");
    });
    const entry = sheet.querySelector("[data-limit-entry]");
    const line = sheet.querySelector("[data-limit-minmax]");
    if (entry) entry.hidden = !isLimit;
    if (line) line.hidden = !isLimit;
    if (isLimit) requestAnimationFrame(() => entry?.querySelector("[data-limit-input]")?.focus());
    updateDrawerPreview(sheet);
    return;
  }

  if (sheet.dataset.trading === "paused") {
    if (event.target.closest("[data-paused-change]")) {
      setPausedBetEditorOpen(sheet, true);
      return;
    }

    if (event.target.closest("[data-paused-return]")) {
      setPausedBetEditorOpen(sheet, false, true);
      return;
    }

    if (event.target.closest("[data-paused-confirm]")) {
      sheet.dataset.confirmedMarket = sheet.dataset.draftMarket;
      sheet.dataset.confirmedSide = sheet.dataset.draftSide;
      const heading = sheet.querySelector("[data-paused-bet-heading]");
      if (heading) heading.textContent = drawerPreviewWinHeading(sheet.dataset.confirmedMarket, sheet.dataset.confirmedSide);
      const changeButton = sheet.querySelector("[data-paused-change]");
      if (changeButton) changeButton.textContent = `Change ${drawerPreviewBetTypeLabel(sheet.dataset.confirmedMarket, sheet.dataset.confirmedSide)}`;
      setPausedBetEditorOpen(sheet, false, false);
      return;
    }

    const editorMarket = event.target.closest(".drawer-bet-editor [data-market]");
    if (editorMarket) {
      sheet.dataset.draftMarket = editorMarket.dataset.market;
      syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
      updatePausedConfirmState(sheet);
      return;
    }

    const editorSide = event.target.closest(".drawer-bet-editor [data-contract]");
    if (editorSide) {
      sheet.dataset.draftSide = editorSide.dataset.contract;
      syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
      updatePausedConfirmState(sheet);
      return;
    }

    const priceMode = event.target.closest("[data-paused-price-mode]");
    if (priceMode) {
      const group = priceMode.parentElement;
      group?.querySelectorAll("[data-paused-price-mode]").forEach((button) => button.classList.toggle("is-active", button === priceMode));
      const entry = sheet.querySelector("[data-paused-limit-entry]");
      const isLimit = priceMode.dataset.pausedPriceMode === "limit";
      if (entry) entry.hidden = !isLimit;
      if (isLimit) requestAnimationFrame(() => entry?.querySelector("[data-paused-limit-input]")?.focus());
      return;
    }
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
  const pausedLimitInput = event.target.closest("[data-paused-limit-input]");
  if (pausedLimitInput) {
    const value = pausedLimitInput.value.replace(/[^0-9]/g, "").slice(0, 3);
    pausedLimitInput.value = value;
    return;
  }

  const pausedQtyInput = event.target.closest("[data-qty-input]");
  if (pausedQtyInput?.closest(".bet-sheet")?.dataset.trading === "paused") {
    pausedQtyInput.value = pausedQtyInput.value.replace(/[^0-9]/g, "");
    pausedQtyInput.closest(".contracts-field")?.querySelectorAll("[data-qty-set]").forEach((button) => button.classList.remove("is-active"));
    return;
  }

  const limitInput = event.target.closest("[data-limit-input]");
  if (limitInput) {
    limitInput.value = limitInput.value.replace(/[^0-9]/g, "").slice(0, 3);
    const sheet = limitInput.closest(".bet-sheet");
    const value = Number(limitInput.value || 0);
    const valid = value >= 1 && value <= 64;
    const option = limitInput.closest("[data-price-mode='limit']");
    const line = sheet?.querySelector("[data-limit-minmax]");
    option?.classList.toggle("is-error", !valid);
    line?.classList.toggle("is-error", !valid);
    if (line) line.textContent = valid ? "Min 1¢ · Max 64¢" : "Maximum limit price is 64¢";
    const primary = sheet?.querySelector("[data-bet-primary]");
    if (primary) primary.disabled = !valid;
    if (sheet) updateDrawerPreview(sheet);
    return;
  }

  const input = event.target.closest("[data-qty-input], [data-sell-qty-input]");
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

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-ds-theme]");
  if (!button) return;
  setDesignSystemTheme(button.dataset.dsTheme);
});

window.addEventListener("storage", (event) => {
  if (event.key !== designSystemThemeStorageKey || !event.newValue) return;
  setDesignSystemTheme(event.newValue, { persist: false });
});

function componentSectionHeader(title, copy) {
  return `<div class="section-header"><h2>${title}</h2><p>${copy}</p></div>`;
}

function componentGroupHeader(title, copy) {
  return `<div class="ds-component-group-head"><h3>${title}</h3><p>${copy}</p></div>`;
}

function componentUsage(copy) {
  return `<p class="ds-card-note">${copy}</p>`;
}

function primitiveTokenRows(items) {
  return `<div class="token-list ds-primitive-token-list">${items.map(([token, value, usage]) => `<div><code>${token}</code><strong>${value}</strong><span>${usage}</span></div>`).join("")}</div>`;
}

function primitiveSwatchGroup(title, items) {
  return `<section class="color-token-group ds-primitive-color-group"><div class="panel-header"><h3>${title}</h3><span class="tag">tokens.css</span></div><div class="swatch-grid ds-primitive-swatch-grid">${items.map(([token, name, usage]) => `<article class="swatch"><span style="--swatch: var(${token})"></span><strong>${name}</strong><code>${token}</code><p class="ds-token-use">${usage}</p></article>`).join("")}</div></section>`;
}

function syncPrimitiveSections() {
  const colors = document.querySelector("#tokens");
  const spacing = document.querySelector("#spacing");
  const radius = document.querySelector("#radius");
  const shadows = document.querySelector("#shadows");
  const borders = document.querySelector("#borders");
  const effects = document.querySelector("#effects");
  const typography = document.querySelector("#typography");

  if (colors) colors.innerHTML = `${componentSectionHeader("Colors", "Only production color tokens currently referenced by the GTL app. Theme-aware tokens update automatically between dark and light modes.")}
    <div class="color-section-stack">
      ${primitiveSwatchGroup("Surfaces and Text", [
        ["--bg", "Page Background", "Use for the application canvas and full-page backgrounds."],
        ["--bg-2", "Focused Background", "Use behind focused fields and subtly separated page regions."],
        ["--surface", "Primary Surface", "Use for cards, fields, menus, and primary contained surfaces."],
        ["--surface-2", "Secondary Surface", "Use for nested controls, secondary cards, and hover treatments."],
        ["--surface-3", "Strong Surface", "Use for the strongest neutral separation and disabled surfaces."],
        ["--ink", "Primary Text", "Use for headings, values, and primary interface copy."],
        ["--ink-2", "Secondary Text", "Use for body copy, labels, and supporting information."],
        ["--ink-3", "Muted Text", "Use for placeholders, hints, captions, and low-emphasis metadata."],
      ])}
      ${primitiveSwatchGroup("Brand and Semantic", [
        ["--green", "Brand Green", "Use for primary actions, positive fills, live indicators, and brand emphasis."],
        ["--green-ink", "Accessible Green Text", "Use for green text and icons that must retain contrast in both themes."],
        ["--green-strong", "Green Hover", "Use for stronger positive interaction states such as primary-button hover."],
        ["--green-soft", "Green Tint", "Use for positive badges, selected backgrounds, and subtle success surfaces."],
        ["--no", "Negative Red", "Use for No/Sell fills, destructive emphasis, and validation errors."],
        ["--no-ink", "Accessible Red Text", "Use for red text and icons that must retain contrast in both themes."],
        ["--no-soft", "Red Tint", "Use behind validation errors and other subtle negative states."],
        ["--gold", "Tie and Warning", "Use for TIE market data, paused trading, pending orders, and ranking highlights."],
      ])}
    </div>`;

  if (spacing) spacing.innerHTML = `${componentSectionHeader("Spacing", "The complete spacing scale currently used for component rhythm, page gutters, and section separation.")}
    <article class="panel"><div class="panel-header"><h3>Spacing Tokens</h3><span class="tag">tokens.css</span></div>${primitiveTokenRows([
      ["--s1", "4px", "Micro offsets between icons, labels, and compact metadata."],
      ["--s2", "8px", "Tight control gaps, field spacing, and inline feedback."],
      ["--s3", "12px", "Compact component padding and grouped control spacing."],
      ["--s4", "16px", "Default component gap and small card padding."],
      ["--s5", "20px", "Mobile page gutters, field padding, and standard card padding."],
      ["--s6", "24px", "Action grouping and medium content-block separation."],
      ["--s8", "32px", "Major card sections and heading-to-content spacing."],
      ["--s10", "40px", "Large section breaks and spacious panel padding."],
      ["--s12", "48px", "Page-level and hero content separation."],
      ["--s16", "64px", "Major section padding and standard page-bottom clearance."],
      ["--s20", "80px", "Large editorial or onboarding separation."],
      ["--s24", "96px", "Exceptional top-level spacing used only by the largest page compositions."],
    ])}</article>`;

  if (radius) radius.innerHTML = `${componentSectionHeader("Radius", "Production shape tokens, ordered from compact controls to fully rounded actions.")}
    <article class="panel"><div class="panel-header"><h3>Radius Tokens</h3><span class="tag">tokens.css</span></div>${primitiveTokenRows([
      ["--r-sm", "10px", "Compact menus, small controls, and local interactive states."],
      ["--r-md", "16px", "Code inputs, dropdowns, and medium contained surfaces."],
      ["--r-lg", "22px", "Cards, dialogs, and standard elevated panels."],
      ["--r-xl", "28px", "Large feature cards, sheets, and prominent content surfaces."],
      ["--r-pill", "999px", "Buttons, fields, chips, segmented controls, and circular actions."],
    ])}</article>`;

  if (shadows) shadows.innerHTML = `${componentSectionHeader("Shadows", "The two elevation levels and the shared keyboard-focus treatment used by the app.")}
    <article class="panel"><div class="panel-header"><h3>Elevation and Focus</h3><span class="tag">tokens.css · styles.css</span></div>${primitiveTokenRows([
      ["--shadow-sm", "Subtle elevation", "Use for floating controls, compact menus, and lightly raised surfaces."],
      ["--shadow", "Overlay elevation", "Use for drawers, dialogs, dropdowns, and major floating surfaces."],
      ["focus-visible", "2px green outline", "Use the global keyboard-only focus ring; do not replace it with a permanent outline."],
    ])}</article>`;

  if (borders) borders.innerHTML = `${componentSectionHeader("Borders", "Only the structural and semantic border tokens currently referenced by app components.")}
    <article class="panel"><div class="panel-header"><h3>Border Tokens</h3><span class="tag">tokens.css</span></div>${primitiveTokenRows([
      ["--line", "Subtle line", "Use for quiet dividers, card outlines, and nested structure."],
      ["--line-2", "Strong line", "Use for fields, interactive boundaries, and stronger neutral separation."],
      ["--green-line", "Positive line", "Use for selected, successful, live, and Yes-state borders."],
      ["--no-line", "Negative line", "Use for invalid, destructive, and No/Sell-state borders."],
    ])}</article>`;

  if (effects) effects.innerHTML = `${componentSectionHeader("Layout and Motion", "Shared layout measurements, animation curves, and the production green glow used across the app.")}
    <div class="grid two">
      <article class="panel"><div class="panel-header"><h3>Layout</h3><span class="tag">tokens.css</span></div>${primitiveTokenRows([
        ["--maxw", "1180px", "Maximum width for the primary desktop content container."],
        ["--header-h", "64px", "Shared header height used when calculating page and account layouts."],
        ["--page-top", "108px / 128px", "Top clearance below the floating header; increases at the tablet breakpoint."],
      ])}</article>
      <article class="panel"><div class="panel-header"><h3>Motion and Glow</h3><span class="tag">tokens.css</span></div>${primitiveTokenRows([
        ["--ease", "Standard easing", "Use for hover, opacity, colour, and routine state transitions."],
        ["--ease-out", "Entrance easing", "Use for drawers, dialogs, celebrations, and content entering the viewport."],
        ["--green-glow", "Positive glow", "Use sparingly for live pulses, success rings, and celebratory positive emphasis."],
      ])}</article>
    </div>`;

  if (typography) typography.innerHTML = `${componentSectionHeader("Typography", "The two production font families and the complete type scale currently used by GTL.")}
    <article class="panel"><div class="panel-header"><h3>Typography Tokens</h3><span class="tag">tokens.css</span></div>${primitiveTokenRows([
        ["--font-display", "Space Grotesk", "Use for page headings, card headings, scores, prices, and high-emphasis values."],
        ["--font-ui", "Inter", "Use for body copy, labels, buttons, fields, navigation, and dense interface text."],
        ["--fs-eyebrow", "0.72rem", "Uppercase section labels, hints, captions, and compact timestamps."],
        ["--fs-label", "0.8rem", "Field labels, metadata, compact buttons, and control text."],
        ["--fs-body", "0.95rem", "Default body copy, standard buttons, and form inputs."],
        ["--fs-lead", "1.05rem", "Introductory copy and emphasized interface sentences."],
        ["--fs-h3", "1.1–1.4rem", "Card and subsection headings."],
        ["--fs-h2", "1.5–2.2rem", "Primary section and panel headings."],
        ["--fs-hero", "2.4–4.6rem", "Page hero and major onboarding headings."],
        ["--fs-score", "2.2–3.4rem", "Scores inside repeated live-game cards."],
        ["--fs-score-lg", "3.4–5.6rem", "The primary game-page scoreboard."],
      ])}</article>`;
}

function componentTeamMark(team, className = "team-logo") {
  return `<span class="team-mark ${className} is-fallback" aria-label="${team.abbr}" style="--team-color:${team.color}"><span class="team-mark-abbr">${team.abbr}</span></span>`;
}

function componentTeamVisual(team, licensed = false, className = "team-logo") {
  return licensed && team.logo
    ? `<img class="${className}" src="${team.logo}" alt="${team.name}">`
    : componentTeamMark(team, className);
}

function componentGameMedia(game, { licensed = false, center = "" } = {}) {
  const lead = game.home.score === game.away.score ? null : game.home.score > game.away.score ? "home" : "away";
  const team = (side) => `<div class="team team-${side}${lead === side ? " is-leading" : ""}">${componentTeamVisual(game[side], licensed)}<div class="team-meta"><span class="team-abbr team-name">${licensed ? game[side].abbr : game[side].name}</span><span class="team-score tnum">${game[side].score}</span></div></div>`;
  return `<div class="game-row">${team("home")}<div class="game-center">${center || `<span class="period">${game.period}</span><span class="clock tnum">${game.clock}</span>`}</div>${team("away")}</div>`;
}

function componentMarketPanel(game) {
  const row = (label, sub, key) => `<div class="mkt-row"><button class="price yes" type="button">${game.markets[key].yes}¢</button><span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span><button class="price no" type="button">${game.markets[key].no}¢</button></div>`;
  return `<div class="mkt-grid"><div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>${row("GTL", "Get the Lead", "gtl")}${row("TIE", "", "tie")}${row("KTL", "Keep the Lead", "ktl")}</div><span class="view-game">View Game</span>`;
}

function componentGameCard(game, { state = "collapsed", licensed = false } = {}) {
  const expanded = state === "expanded";
  const interrupted = state === "paused" || state === "waiting";
  const message = state === "waiting" ? "Markets open when a team takes the lead." : "Trading paused. Recalculating markets.";
  return `<article class="game-tile${expanded ? " is-open" : ""}${interrupted ? " is-paused" : ""}" style="--home-color:${game.home.color};--away-color:${game.away.color}">
    <div class="tile-main">${componentGameMedia(game, { licensed })}</div>
    <div class="tile-foot">${interrupted ? `<div class="trade-pause"><span class="pause-dot"></span><span>${message}</span></div>` : ""}<button class="foot-toggle" type="button" tabindex="-1"><span class="chev">${chevronDown}</span><span class="toggle-label">${expanded ? "Hide Bets" : "See Bets"}</span><span class="chev">${chevronDown}</span></button><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${expanded ? componentMarketPanel(game) : ""}</div></div></div></div>
  </article>`;
}

function componentSettledCard(game) {
  return `<div class="settled-card" style="--home-color:${game.home.color};--away-color:${game.away.color}"><div class="pos-media">${componentGameMedia(game, { center: `<span class="period">Settled</span><span class="sc-won">You Won</span>` })}</div><div class="settled-body"><span class="settled-profit tnum">+$54.10</span><div class="settled-actions"><button class="btn btn-secondary" type="button">Dismiss</button><button class="btn btn-primary" type="button">Bet Again</button></div></div><span class="settled-progress"></span></div>`;
}

function componentScoreWormCard(game) {
  const worm = gamePreviewWorm(game);
  const width = 280;
  const height = 132;
  const scale = Math.ceil(worm.maxAbs / 5) * 5;
  const path = gamePreviewStepPath(worm.series, width, height, -worm.maxAbs, worm.maxAbs);
  const gradientId = `ds-card-worm-${game.home.abbr}-${game.away.abbr}`;
  const ties = 2 + (game.variant % 4);
  return `<div class="momentum-card worm-card" style="--home-color:${game.home.color};--away-color:${game.away.color}"><div class="momentum-head"><span>Score Worm</span></div><div class="worm-legend"><span class="worm-key"><i style="background:${game.home.color}"></i>${game.home.abbr} ahead</span><span class="worm-key"><i style="background:${game.away.color}"></i>${game.away.abbr} ahead</span></div><div class="worm-wrap"><div class="worm-quarters"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div><div class="worm-axis"><span>+${scale}</span><span>0</span><span>−${scale}</span></div>${worm.crossings.map((crossing) => `<span class="worm-mark" style="left:${(crossing * 100).toFixed(1)}%"></span>`).join("")}<svg class="worm-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="Score margin over the game, ${worm.changes} lead changes"><defs><linearGradient id="${gradientId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${height}"><stop offset="0" stop-color="${game.home.color}"></stop><stop offset="0.5" stop-color="${game.home.color}"></stop><stop offset="0.5" stop-color="${game.away.color}"></stop><stop offset="1" stop-color="${game.away.color}"></stop></linearGradient></defs><line class="worm-zero" x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}"></line><path class="worm-line" d="${path}" style="stroke:url(#${gradientId})"></path></svg></div><div class="worm-stats"><div class="worm-stat"><strong class="tnum">${worm.changes}</strong><span>Lead Changes</span></div><div class="worm-stat"><strong class="tnum">${ties}</strong><span>Ties</span></div></div></div>`;
}

function componentGameStatsCard(game) {
  return `<div class="momentum-card stats-card" style="--home-color:${game.home.color};--away-color:${game.away.color}"><div class="stats-teams">${componentTeamMark(game.home, "stats-logo")}<span class="stats-title">Game Stats</span>${componentTeamMark(game.away, "stats-logo")}</div><div class="stat-list">${game.stats.map((stat) => {
    const homeMetric = stat.homeMetric ?? Number(stat.home);
    const awayMetric = stat.awayMetric ?? Number(stat.away);
    const max = Math.max(homeMetric, awayMetric) || 1;
    return `<div class="stat-block"><div class="stat-caption"><span class="stat-val tnum">${stat.home}</span><span class="stat-label">${stat.label}</span><span class="stat-val tnum">${stat.away}</span></div><div class="stat-bar-c"><span class="stat-fill-h" style="width:${((homeMetric / max) * 50).toFixed(1)}%"></span><span class="stat-fill-a" style="width:${((awayMetric / max) * 50).toFixed(1)}%"></span></div></div>`;
  }).join("")}</div></div>`;
}

function componentMarketBookCard(game) {
  const book = gamePreviewOrderBook(game);
  const row = (price, size, side, width) => `<div class="book-row book-${side}"><span class="book-depth"><span class="book-depth-fill" style="width:${width}%"></span></span><span class="book-price tnum">${price}¢</span><span class="book-size tnum">${size}</span></div>`;
  const level = (item, side) => row(item.price, item.size.toLocaleString("en-US"), side, Math.round((item.size / book.maxSize) * 100));
  return `<div class="chart-card"><div class="chart-head"><span>Market Book</span><strong class="tnum">${book.bid}¢ / ${book.ask}¢</strong></div><div class="book"><div class="book-side">${book.asks.map((item) => level(item, "ask")).join("")}</div><div class="book-spread"><span>Spread</span><strong class="tnum">${book.spread}¢</strong></div><div class="book-side">${book.bids.map((item) => level(item, "bid")).join("")}</div></div></div>`;
}

function componentOrderFlowCard(game) {
  const flow = gamePreviewBetFlow(game);
  const bets = gamePreviewRecentBets(game);
  return `<div class="chart-card"><div class="chart-head"><span>Order Flow</span><strong class="tnum">${flow.total} bets</strong></div><div class="flow-bars">${flow.buckets.map((item) => `<span class="flow-bar" style="height:${Math.max(6, item.pct)}%"><em class="flow-cap tnum">${item.val}</em></span>`).join("")}</div><div class="flow-axis">${flow.buckets.map((item) => `<span>${item.label}</span>`).join("")}</div><table class="bets-table"><thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead><tbody>${bets.map((bet) => `<tr><td class="tnum">${bet.time}</td><td>${bet.market}</td><td><span class="side-${bet.side.toLowerCase()}">${bet.side}</span></td><td class="num tnum">${bet.price}¢</td><td class="num tnum">${bet.size}</td></tr>`).join("")}</tbody></table></div>`;
}

function componentUsernameCard(state = "view") {
  if (state === "view") {
    return `<div class="profile-edit-card"><div class="profile-username-view"><div class="profile-username-copy"><span>Username</span><strong>@alex</strong></div><button class="btn btn-secondary btn-sm" type="button" tabindex="-1">Edit</button></div></div>`;
  }
  const invalid = state === "error";
  return `<div class="profile-edit-card"><form class="profile-username-form" novalidate><div class="profile-username-field"><input class="profile-username-input${invalid ? " is-error" : ""}" name="username" type="text" value="${invalid ? "a!" : "alex"}" autocomplete="username" aria-label="Username" maxlength="20" tabindex="-1" readonly>${invalid ? `<p class="profile-username-error" role="alert">Use 3–20 letters, numbers, or underscores.</p>` : ""}</div><div class="profile-username-actions"><button class="btn btn-primary btn-sm" type="button" tabindex="-1">Save</button><button class="btn btn-secondary btn-sm" type="button" tabindex="-1">Cancel</button></div></form></div>`;
}

function componentAccountSettingsCard() {
  return `<div class="account-settings-list">
    <div class="account-setting-row"><span>Full name</span><strong>Alex Morgan</strong></div>
    <div class="account-setting-row"><span>Email</span><strong>alex@gtl.test</strong></div>
    <div class="account-setting-row"><span>Date of birth</span><strong>Not provided</strong></div>
    <div class="account-setting-row"><span>Member since</span><strong>July 2026</strong></div>
    <div class="account-setting-row"><span>Credits</span><span class="account-inline-link">248.50 credits</span></div>
    <div class="account-setting-row"><span>Connected with</span><strong><span class="account-provider password"><span class="account-provider-mark">••</span>Email and password</span></strong></div>
    <div class="account-setting-row"><span>Password</span><span class="account-inline-link">Change password</span></div>
  </div>`;
}

function componentPreferenceCards() {
  return `<div class="ds-settings-card-stack"><div class="profile-preference-card"><div class="profile-preference-copy"><strong>Appearance</strong><span>Switch between light and dark mode.</span></div><button class="profile-theme-control" type="button" tabindex="-1" aria-label="Switch colour theme">${accountThemeSwitch()}</button></div><div class="profile-preference-card"><div class="profile-preference-copy"><strong>Notifications</strong><span>Email notification preferences will live here.</span></div><span class="status-pill">Coming soon</span></div></div>`;
}

function componentAccountManagementCards() {
  return `<div class="account-actions"><span class="btn btn-secondary btn-block account-link-button">Betting Controls</span><span class="btn btn-danger btn-block account-link-button">Delete Account</span></div>`;
}

function componentToast(type, message) {
  const icon = type === "success"
    ? `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v5.5M12 16.5h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  return `<div class="toast toast-${type}" role="${type === "error" ? "alert" : "status"}"><span class="toast-ico">${icon}</span><span class="toast-msg">${message}</span></div>`;
}

function componentDialogMarkup(type) {
  if (type === "auth") {
    return `<div class="gate-backdrop is-open"></div>
      <div class="auth-gate is-open"><div class="gate-body"><h3 class="gate-title">You need an account to bet on the lead.</h3><p class="gate-desc">Login below or create an account in less than a minute.</p><div class="gate-actions"><button class="btn btn-secondary" type="button">Login</button><button class="btn btn-primary" type="button">Create Account</button></div></div></div>
      <button class="btn btn-secondary gate-close is-open" type="button">Close</button>`;
  }
  if (type === "position") {
    return `<div class="gate-backdrop is-open"></div>
      <div class="auth-gate pos-gate is-open"><div class="gate-body"><h3 class="gate-title">You already have a trade in this game</h3><p class="gate-desc">Only one trade can win. Do you want to continue?</p><div class="gate-actions"><button class="btn btn-secondary" type="button">Cancel</button><button class="btn btn-primary" type="button">Continue</button></div><label class="pos-gate-check"><input type="checkbox"><span class="pos-check-box">${drawerCheckIcon}</span><span>Do not show this message again</span></label></div></div>`;
  }
  if (type === "ranking") {
    return `<div class="gate-backdrop ranking-prize-backdrop is-open"></div>
      <div class="auth-gate ranking-prize-gate is-open"><div class="gate-body"><span class="ranking-prize-kicker">July Rankings</span><h3 class="gate-title">You finished in position 47</h3><p class="gate-desc">Try and reach the top 10 in August's competition to receive a cash reward!</p></div></div><button class="btn btn-secondary gate-close ranking-result-close is-open" type="button">Close</button>`;
  }
  if (type === "rankingWinner") {
    return `<div class="gate-backdrop ranking-prize-backdrop is-open"></div>
      <div class="ranking-celebration" aria-hidden="true"><span class="celebration-glow"></span><div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
      <div class="auth-gate ranking-prize-gate is-open"><div class="gate-body"><span class="ranking-prize-kicker">July Rankings</span><h3 class="gate-title">You finished in position 7!</h3><p class="gate-desc">The GTL team will contact you shortly about claiming your reward.</p><strong class="ranking-prize-value tnum">$250</strong></div></div><button class="btn btn-secondary gate-close ranking-result-close is-open" type="button">Close</button>`;
  }
  if (type === "rankingTopThree") {
    return `<div class="gate-backdrop ranking-prize-backdrop is-open"></div>
      <div class="ranking-celebration" aria-hidden="true"><span class="celebration-glow"></span><div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
      <div class="auth-gate ranking-prize-gate is-top-three is-open"><div class="gate-body"><span class="ranking-prize-kicker">July Rankings</span><span class="ranking-prize-medal" data-rank="2" aria-hidden="true"><span class="ranking-medal-ribbon ribbon-left"></span><span class="ranking-medal-ribbon ribbon-right"></span><span class="ranking-medal-face"><strong>2</strong></span></span><h3 class="gate-title">You finished in position 2!</h3><p class="gate-desc">The GTL team will contact you shortly about claiming your reward.</p><strong class="ranking-prize-value tnum">$900</strong></div></div><button class="btn btn-secondary gate-close ranking-result-close is-open" type="button">Close</button>`;
  }
  if (type === "topup") {
    return `<div class="addfunds-backdrop is-open"></div>
      <aside class="addfunds-sheet is-open"><div class="addfunds-inner"><h3>Top Up</h3><div class="bet-field contracts-field"><span class="bet-label">Amount to add</span><div class="addfunds-amount"><span class="af-sign">$</span><input class="num-input" type="text" value="50" aria-label="Amount to add"></div><div class="qty-quick"><button type="button">$20</button><button class="is-active" type="button">$50</button><button type="button">$100</button><button type="button">$200</button></div></div><div class="addfunds-actions"><button class="btn btn-secondary" type="button">Cancel</button><button class="btn btn-primary" type="button">Add Funds</button></div><p class="addfunds-note">Prototype — no real payment is taken.</p></div></aside>`;
  }
  return `<div class="confirmation-backdrop"></div>
    <section class="confirmation-card"><div class="confirmation-visual" aria-hidden="true"><span class="confirmation-ring confirmation-ring--outer"></span><span class="confirmation-ring confirmation-ring--inner"></span><span class="confirmation-route"></span><span class="confirmation-mark"><svg viewBox="0 0 32 32" fill="none"><path d="m8 16.5 5 5L24 10.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><span class="eyebrow confirmation-eyebrow">Joining the Waitlist</span><h2>Securing your place.</h2><p>Hold tight—we’re reserving your early-access spot.</p><div class="confirmation-progress" aria-hidden="true"><span></span></div></section>`;
}

function componentDialogAppScreen(type) {
  if (type === "ranking" || type === "rankingWinner" || type === "rankingTopThree") return renderHomeFrame("logged");
  if (type === "topup") return renderTrackerFrame("open");
  if (type === "waitlist") {
    return `<div class="flat-screen ds-waitlist-screen"><header>${brandLogoSVG()}<span class="tag">Early access</span></header><main><span class="eyebrow">Live sports, traded live</span><h2>Call the lead before it happens.</h2><p>Join the early-access list for the fastest way to trade the moments that move live games.</p><span class="btn btn-primary">Join the Waitlist</span></main></div>`;
  }
  return renderGameFrame("live");
}

function componentDialogPhone(type) {
  const frameType = type === "ranking" || type === "rankingWinner" || type === "rankingTopThree" ? "home" : type === "topup" ? "tracker" : type === "waitlist" ? "home" : "game";
  return `<div class="ds-dialog-phone flat-lay-canvas" data-flat-device="mobile"><div class="flat-frame-wrap flat-frame--${frameType}"><div class="flat-phone">${componentDialogAppScreen(type)}<div class="ds-dialog-stage" data-dialog-type="${type}">${componentDialogMarkup(type)}</div></div></div></div>`;
}

function componentDialogGroup({ type, title, tag, copy }) {
  if (type === "ranking") {
    return `<section class="panel ds-dialog-group ds-dialog-ranking-group"><div class="ds-dialog-group-head"><span class="eyebrow">${tag}</span><h3>${title}</h3><p>${copy}</p></div><div class="ds-dialog-ranking-pair"><div class="ds-dialog-phone-state"><span class="flat-frame-label">Outside Top 10</span>${componentDialogPhone("ranking")}</div><div class="ds-dialog-phone-state"><span class="flat-frame-label">Inside Top 10</span>${componentDialogPhone("rankingWinner")}</div><div class="ds-dialog-phone-state"><span class="flat-frame-label">Top 3</span>${componentDialogPhone("rankingTopThree")}</div></div></section>`;
  }
  const scope = type === "topup" ? `<span class="tag ds-dialog-scope-tag">Out of Scope for MVP</span>` : "";
  return `<section class="panel ds-dialog-group"><div class="ds-dialog-group-head"><span class="eyebrow">${tag}</span><div class="ds-dialog-title-row"><h3>${title}</h3>${scope}</div><p>${copy}</p></div>${componentDialogPhone(type)}</section>`;
}

function syncAppComponentSections() {
  const sections = {
    buttons: document.querySelector("#buttons"),
    pills: document.querySelector("#pills"),
    forms: document.querySelector("#forms"),
    drawers: document.querySelector("#drawers"),
    navigation: document.querySelector("#navigation"),
    cards: document.querySelector("#cards"),
    tables: document.querySelector("#tables"),
    feedback: document.querySelector("#feedback"),
    dialogs: document.querySelector("#dialogs"),
  };

  if (sections.buttons) sections.buttons.innerHTML = `${componentSectionHeader("Buttons", "Production actions use one shared hierarchy, with contextual glass, destructive, market, and icon-only treatments where the surrounding interface supplies meaning.")}
    <section class="ds-component-group">
      ${componentGroupHeader("Action Hierarchy", "Use Primary once per decision area, Secondary for alternatives, Ghost for low-emphasis actions, and Destructive only for irreversible account or order actions.")}
      <article class="panel ds-app-component-panel">
      <div class="panel-header"><h3>Standard Actions</h3><span class="tag">Shared</span></div>
      <div class="ds-app-button-grid">
        <span class="type-label">Default</span><button class="btn btn-primary" type="button">Primary</button><button class="btn btn-secondary" type="button">Secondary</button><button class="btn btn-ghost" type="button">Ghost</button><button class="btn btn-danger" type="button">Destructive</button>
        <span class="type-label">Disabled</span><button class="btn btn-primary" type="button" disabled>Primary</button><button class="btn btn-secondary" type="button" disabled>Secondary</button><button class="btn btn-ghost" type="button" disabled>Ghost</button><button class="btn btn-danger" type="button" disabled>Destructive</button>
      </div>
      <div class="ds-app-button-sizes"><button class="btn btn-primary btn-sm" type="button">Small</button><button class="btn btn-primary" type="button">Default</button><button class="btn btn-primary btn-lg" type="button">Large</button><button class="btn btn-block btn-secondary" type="button">Full width</button></div>
      ${componentUsage("Disabled is reserved for incomplete or unavailable actions. The app uses local skeleton or updating-price feedback instead of a generic loading button. Small is for dense account controls, Large for onboarding and hero actions, and Full width for narrow forms and sheets.")}
      </article>
    </section>
    <section class="ds-component-group">
      ${componentGroupHeader("Contextual Actions", "These treatments are tied to a specific surface or trading meaning and must not replace the standard hierarchy elsewhere.")}
      <div class="grid two ds-app-component-grid">
        <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Glass Action</h3><span class="tag">Header / Hero</span></div><button class="btn btn-glass" type="button">Create Account</button>${componentUsage("Use over atmospheric or image-led backgrounds where the neutral glass surface belongs to the surrounding chrome.")}</article>
        <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Social Sign-In</h3><span class="tag">Authentication</span></div><div class="ds-social-button-stack"><button class="social-btn" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5.04 5.04 0 0 1-2.18 3.31v2.75h3.53c2.07-1.9 3.25-4.71 3.25-7.9z"/><path fill="#34A853" d="M12 23c2.94 0 5.4-.97 7.2-2.63l-3.52-2.75c-.98.66-2.23 1.05-3.68 1.05-2.83 0-5.23-1.91-6.08-4.48H2.28v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.92 14.19a6.6 6.6 0 0 1 0-4.38V6.97H2.28a11 11 0 0 0 0 10.06l3.64-2.84z"/><path fill="#EA4335" d="M12 5.13c1.6 0 3.03.55 4.16 1.62l3.12-3.12A10.98 10.98 0 0 0 12 1 10.99 10.99 0 0 0 2.28 6.97l3.64 2.84C6.77 7.04 9.17 5.13 12 5.13z"/></svg>Continue with Google</button><button class="social-btn" type="button"><svg class="apple-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.05 12.66c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.15-.47 7.82 1.3 10.38.86 1.25 1.89 2.66 3.24 2.61 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.28-1.28 3.13-2.54.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.72-1.04-2.46-4.6zM14.6 5.1c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.56-.66.76-1.24 1.99-1.09 3.16 1.15.09 2.32-.58 3.04-1.44z"/></svg>Continue with Apple</button></div>${componentUsage("Use only as full-width provider actions at the start of Login and Sign Up. Provider identity remains visible in both themes.")}</article>
        <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Market Actions</h3><span class="tag">Trading</span></div><div class="ds-market-button-row"><button class="price yes" type="button">64¢</button><button class="price no" type="button">36¢</button></div>${componentUsage("Yes and No price controls are only used to select a live market side. Their colour communicates market semantics, not general success or error.")}</article>
        <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Trade Actions</h3><span class="tag">Portfolio</span></div><div class="oc-actions"><button class="oc-buy" type="button">Buy More</button><button class="oc-sell" type="button">Sell</button></div>${componentUsage("Use the outlined paired actions on open-trade cards. Keep Buy More first and Sell second across Home, Game, and Open Trades surfaces.")}</article>
        <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Icon Controls</h3><span class="tag">Compact Navigation</span></div><div class="ds-icon-button-row"><button class="game-position-nav-button" type="button" aria-label="Previous card">${chevronDown}</button><button class="game-position-nav-button ds-icon-next" type="button" aria-label="Next card">${chevronDown}</button><button class="floating-btn ds-close-button" type="button" aria-label="Close">×</button></div>${componentUsage("Icon-only controls require an accessible label and are limited to universally recognised previous, next, close, menu, and appearance actions.")}</article>
      </div>
    </section>`;

  if (sections.pills) sections.pills.innerHTML = `${componentSectionHeader("Pills & Status", "Compact status treatments communicate game state, order outcome, market side, or feature availability. They are labels, not general-purpose buttons.")}
    ${componentGroupHeader("Supported Status Families", "Match the label and colour to the underlying state. Do not introduce a new chip when plain semantic text already carries the meaning.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Live and Paused</h3><span class="tag">Game</span></div><div class="ds-status-stack"><span class="live-badge game-clock-badge"><span class="game-period"><span class="live-dot"></span>Q3</span><span class="game-clock tnum">11:05</span></span><div class="trade-pause"><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div></div>${componentUsage("The clock badge is live game metadata. The paused treatment replaces market interaction while prices recalculate; it is not a clickable chip.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Order Outcomes</h3><span class="tag">Portfolio</span></div><div class="ds-chip-row"><span class="result-pill win">Won</span><span class="result-pill loss">Lost</span><span class="status-chip pending">Pending</span><span class="status-chip cancelled">Cancelled</span></div>${componentUsage("Won and Lost appear on settled bets. Pending and Cancelled identify limit-order lifecycle states in Portfolio and order details.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Trade Sides</h3><span class="tag">Trading</span></div><div class="ds-chip-row"><span class="side-yes">YES</span><span class="side-no">NO</span></div>${componentUsage("Yes and No are matching semantic text inside trade metadata. Do not wrap them in an additional filled chip.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Availability</h3><span class="tag">Account</span></div><div class="ds-chip-row"><span class="status-pill">Coming soon</span></div>${componentUsage("Use only when a visible feature is deliberately present but unavailable. Hide features that users do not need to discover yet.")}</article>
    </div>`;

  if (sections.forms) sections.forms.innerHTML = `${componentSectionHeader("Forms", "Form controls mirror the current Authentication, Welcome, Contact, Profile, and Buy/Sell flows. Every field keeps a visible label, an explicit state, and adjacent help or validation text when required.")}
    ${componentGroupHeader("Identity and Account Fields", "Use the shared field structure for account data. Validation appears after interaction or submission and clears when the value becomes valid.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel form-grid ds-form-card"><div class="panel-header"><h3>Authentication</h3><span class="tag">Auth</span></div>
        <div class="field"><label for="ds-current-email">Email</label><input class="field-input" id="ds-current-email" type="email" placeholder="you@email.com"></div>
        <div class="field"><label for="ds-current-password">Password</label><div class="field-pass"><input class="field-input" id="ds-current-password" type="password" placeholder="Your password"><button class="pass-toggle" type="button" tabindex="-1" aria-label="Show password">${showIcon}</button></div></div>
        <div class="field"><label for="ds-current-error">Email error</label><input class="field-input is-error" id="ds-current-error" type="email" value="sam"><p class="field-error" role="alert">Enter a valid email address.</p></div>
        ${componentUsage("Email, phone, and password entry share this base control. Password visibility is an icon action with an accessible label; errors sit immediately below the invalid field.")}
      </article>
      <article class="panel form-grid ds-form-card"><div class="panel-header"><h3>Personal Details</h3><span class="tag">Welcome</span></div>
        <div class="contact-name-row"><div class="field"><label for="ds-first-name">First Name</label><input class="field-input" id="ds-first-name" type="text" placeholder="Alex"></div><div class="field"><label for="ds-last-name">Last Name</label><input class="field-input" id="ds-last-name" type="text" placeholder="Morgan"></div></div>
        <fieldset class="field signup-birthday-field"><legend>Date of Birth</legend><div class="date-fields"><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Month" role="combobox" aria-label="Month" aria-expanded="false"><button class="combobox-toggle" type="button" tabindex="-1" aria-label="Show month options">${chevronDownIcon}</button></div></div><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Day" role="combobox" aria-label="Day" aria-expanded="false"><button class="combobox-toggle" type="button" tabindex="-1" aria-label="Show day options">${chevronDownIcon}</button></div></div><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Year" role="combobox" aria-label="Year" aria-expanded="false"><button class="combobox-toggle" type="button" tabindex="-1" aria-label="Show year options">${chevronDownIcon}</button></div></div></div><span class="field-hint">You must be 18 or older to use GTL.</span></fieldset>
        ${componentUsage("First and last name precede the segmented date-of-birth combobox on the Welcome details step. The obsolete terms checkbox is not part of the implemented flow.")}
      </article>
      <article class="panel form-grid ds-form-card"><div class="panel-header"><h3>Verification Code</h3><span class="tag">Authentication</span></div>
        <div class="code-input" aria-label="Six-digit verification code"><input class="code-box is-filled" type="text" value="2" aria-label="Digit 1" readonly><input class="code-box is-filled" type="text" value="8" aria-label="Digit 2" readonly><input class="code-box" type="text" aria-label="Digit 3" readonly><span class="code-dash" aria-hidden="true"></span><input class="code-box" type="text" aria-label="Digit 4" readonly><input class="code-box" type="text" aria-label="Digit 5" readonly><input class="code-box" type="text" aria-label="Digit 6" readonly></div>
        <p class="code-resend">Didn't get a code? <button type="button">Resend</button></p>
        ${componentUsage("Use for the six-digit email or phone verification step. Advance focus as digits are entered, support paste, and keep Continue disabled until all six positions are complete.")}
      </article>
    </div>
    ${componentGroupHeader("Trading Inputs", "Trading controls are purpose-built for quantity, price mode, and fast selection. Do not substitute generic text fields for these interactions.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel form-grid ds-form-card ds-trading-form"><div class="panel-header"><h3>Contracts</h3><span class="tag">Buy</span></div>
        <div class="bet-field contracts-field"><span class="bet-label">Select number of contracts</span><input class="num-input drawer-contract-input" type="text" value="100" aria-label="Number of contracts"><div class="qty-quick"><button type="button">50</button><button class="is-active" type="button">100</button><button type="button">500</button><button type="button">1000</button></div></div>
        ${componentUsage("The large numeric input is the source of truth. Quick values update it and expose one selected state; the value is constrained by balance and available contracts.")}
      </article>
      <article class="panel form-grid ds-form-card ds-trading-form"><div class="panel-header"><h3>Order Price</h3><span class="tag">Market / Limit</span></div>
        <div class="bet-field drawer-price-mode"><span class="bet-label">Order price</span><div class="seg drawer-price-toggle"><button class="is-active" type="button">Market <strong class="tnum">64¢</strong></button><label class="drawer-price-option"><span>Set Limit</span></label></div></div>
        <div class="bet-field drawer-price-mode"><span class="bet-label">Invalid limit</span><div class="seg drawer-price-toggle"><button type="button">Market <strong class="tnum">64¢</strong></button><label class="drawer-price-option is-active is-error"><span>Set Limit</span><span class="drawer-limit-entry"><input type="text" value="104" aria-label="Limit price in cents"><span>¢</span></span></label></div><p class="limit-minmax is-error">Maximum limit price is 64¢</p></div>
        ${componentUsage("Market is the default. Selecting Set Limit reveals the cents input in place; invalid values use the red boundary and inline min/max feedback and disable purchase.")}
      </article>
    </div>
    ${componentGroupHeader("Support Form", "The Contact form is the only multiline form pattern. It combines paired identity fields, a non-editable topic combobox, and a counted message area.")}
    <div class="ds-app-component-grid">
      <article class="panel form-grid ds-form-card ds-contact-form"><div class="panel-header"><h3>Contact</h3><span class="tag">Support</span></div>
        <div class="contact-name-row"><div class="field"><label for="ds-contact-name">Name</label><input class="field-input" id="ds-contact-name" type="text" placeholder="Your name"></div><div class="field"><label for="ds-contact-email">Email</label><input class="field-input" id="ds-contact-email" type="email" placeholder="you@example.com"></div></div>
        <div class="field"><label for="ds-contact-topic">What can we help with?</label><div class="field-combobox"><input class="field-input" id="ds-contact-topic" type="text" placeholder="Choose a topic" role="combobox" aria-expanded="false" readonly><button class="combobox-toggle" type="button" tabindex="-1" aria-label="Show topic options">${chevronDownIcon}</button></div></div>
        <div class="field"><label for="ds-contact-message">Message</label><textarea class="field-input contact-message" id="ds-contact-message" rows="6" maxlength="1000" placeholder="Tell us what happened or what you need help with"></textarea><span class="field-hint">0/1000 characters</span></div>
        ${componentUsage("Keep Send Message disabled until all required values are valid and the message meets its minimum length. The count is live and capped at 1,000 characters.")}
      </article>
    </div>`;

  if (sections.drawers) {
    const drawerStates = [
      ["Buy Market", "buyMarket", "Default order-entry state after a user selects a Yes or No market price."],
      ["Change Bet Type", "changeBetType", "Inline editor opened by Change [Market] [Side]; preserves the selected game while market and side change."],
      ["Trading Paused", "paused", "Locks order entry and replaces live interaction while the app recalculates market prices."],
      ["Buy Limit", "buyLimit", "Reveals a user-defined cents price while retaining contracts, summary, and selected market context."],
      ["Invalid Limit", "invalid", "Keeps the value visible, adds local min/max feedback, and disables the primary action."],
      ["Sell Trade", "sellMarket", "Uses held-contract quantity and sell proceeds; it is only reachable from an existing open trade."],
      ["Buy Confirmation", "confirmBuy", "Five-second post-purchase state with the placed-order summary and time-limited cancellation."],
      ["Sell Confirmation", "confirmSell", "Post-sale receipt using the same confirmation structure and updated sell values."],
    ];
    sections.drawers.innerHTML = `${componentSectionHeader("Buy/Sell Drawer", "The order flow is one responsive component: a bottom sheet on mobile and a centred modal on desktop. These are its supported entry, interruption, validation, and confirmation states.")}
      ${componentGroupHeader("Order Flow States", "Keep the scoreboard and market context stable between states. Only the controls required for the current decision should change.")}
      <div class="ds-current-drawer-grid">${drawerStates.map(([label, mode, copy]) => `<article class="panel ds-current-drawer-card"><div class="panel-header"><h3>${label}</h3><span class="tag">Current Flow</span></div>${componentUsage(copy)}<div class="ds-drawer-preview ds-drawer-mobile">${renderDrawerSheet(mode)}</div></article>`).join("")}</div>`;
  }

  if (sections.navigation) sections.navigation.innerHTML = `${componentSectionHeader("Navigation", "Navigation combines the responsive floating header, context filters, segmented tabs, carousel controls, and shared footer. Each control preserves its role and label across breakpoints.")}
    ${componentGroupHeader("Global Navigation", "The header changes for authentication state and viewport size. Wallet and Open Trades only appear for signed-in users with the relevant data.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-nav-card"><div class="panel-header"><h3>Signed Out Header</h3><span class="tag">Mobile</span></div><div class="ds-nav-header-preview">${homeHeader(false)}</div>${componentUsage("The wordmark opens the mobile menu and Login remains the only right-side account action.")}</article>
      <article class="panel ds-nav-card"><div class="panel-header"><h3>Signed In Header</h3><span class="tag">Mobile</span></div><div class="ds-nav-header-preview">${homeHeader(true, true)}</div>${componentUsage("Shows wallet balance and the compact Open Trades count. The menu contains account navigation and Logout.")}</article>
    </div>
    <article class="panel ds-nav-card ds-nav-desktop-card"><div class="panel-header"><h3>Signed In Header</h3><span class="tag">Desktop</span></div><div class="ds-nav-header-preview is-desktop">${homeHeader(true, true)}</div>${componentUsage("Desktop exposes primary routes inside the wordmark pill, with wallet, Open Trades, and appearance controls aligned on the same row.")}</article>
    ${componentGroupHeader("Context Navigation", "Use filters to change the data in place, tabs to switch sibling views, and carousel controls only when content overflows the visible row.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>League Filter</h3><span class="tag">Home</span></div>${homeLeagueStrip("nfl")}${componentUsage("NFL is the implemented live default. Selecting NBA replaces the game grid with its current availability state.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Content Tabs</h3><span class="tag">Game / Portfolio</span></div><div class="stats-tabs"><button class="stats-tab is-active" type="button">Market Stats</button><button class="stats-tab" type="button">Game Stats</button></div>${componentUsage("Use for sibling datasets within one page region. The same segmented structure switches Orders and Settled on mobile Portfolio.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Open Trades Filter</h3><span class="tag">Home / Menu</span></div><div class="ds-trade-filter-preview">${tradeLayoutFilter("all")}</div>${componentUsage("All is the default when trades span multiple games. With one game, show only that matchup; selecting a matchup filters the scorecard and trade list.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Trade Carousel</h3><span class="tag">Home / Game</span></div><div class="ds-carousel-preview">${tradeLayoutNavigation(4)}</div>${componentUsage("The indicator count always matches the cards. Previous, next, and dots focus one card at a time; overflowing focus cards align to the left edge.")}</article>
    </div>
    ${componentGroupHeader("Footer", "The same sitemap and legal navigation closes public and authenticated pages; active-page treatment changes without changing the link structure.")}
    <article class="panel ds-footer-reference"><div class="panel-header"><h3>Shared Footer</h3><span class="tag">Current</span></div>${homeFooter("home")}${componentUsage("Use on full pages after the main content. Modal-style authentication and focused onboarding steps do not add the site footer.")}</article>`;

  if (sections.cards) {
    const cardGame = homeGames[1];
    const pausedGame = homeGames[0];
    const waitingGame = homeGames[2];
    sections.cards.innerHTML = `${componentSectionHeader("Cards", "Reusable card families from the current app, rendered with the same markup, data and supported states used on their source pages. Team initials are the active in-app treatment.")}
      <section class="ds-card-group" aria-labelledby="ds-game-cards-title">
        <div class="ds-card-group-head"><div><span class="eyebrow">Home</span><h3 id="ds-game-cards-title">Live Game Cards</h3></div><p>Collapsed is the default. Expansion is reserved for the market panel; interrupted games stay collapsed.</p></div>
        <div class="ds-current-card-grid ds-game-card-grid">
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Live Game</h3><span class="tag">App Default</span></div>${componentGameCard(cardGame)}<p class="ds-card-note">Default NFL tile. Selecting the score area opens the game; See Bets expands the market panel.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Market Panel</h3><span class="tag">Expanded</span></div>${componentGameCard(cardGame, { state: "expanded" })}<p class="ds-card-note">The only expanded tile state. It exposes the three live markets and a View Game route.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Trading Recalculation</h3><span class="tag">Temporary Pause</span></div>${componentGameCard(pausedGame, { state: "paused" })}<p class="ds-card-note">Replaces See Bets while prices recalculate, then clears automatically when fresh prices arrive.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Market Not Open</h3><span class="tag">Unavailable</span></div>${componentGameCard(waitingGame, { state: "waiting" })}<p class="ds-card-note">Persistent zero-score state. The status replaces See Bets until either team takes the lead.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Loading Skeleton</h3><span class="tag">Loading</span></div><article class="home-loading-card" aria-hidden="true"><div class="home-loading-score"><span></span><span></span><span></span></div><div class="home-loading-line is-wide"></div><div class="home-loading-line"></div></article><p class="ds-card-note">Three skeleton cards replace the grid while live games are loading.</p></article>
          <article class="panel ds-card-frame ds-card-reference"><div class="panel-header"><h3>Licensed Team Logos</h3><span class="tag">Retained Reference</span></div>${componentGameCard(cardGame, { licensed: true })}<p class="ds-card-note">NFL-only reference. When licensing is enabled, logos replace initial marks and the label below each logo uses the team abbreviation.</p></article>
        </div>
      </section>

      <section class="ds-card-group" aria-labelledby="ds-position-cards-title">
        <div class="ds-card-group-head"><div><span class="eyebrow">Portfolio</span><h3 id="ds-position-cards-title">Trades and Orders</h3></div><p>Open trades carry the live-game media header. Order rows use the compact portfolio treatment.</p></div>
        <div class="ds-current-card-grid ds-position-card-grid">
          <article class="panel ds-card-frame ds-order-row-frame"><div class="panel-header"><h3>Portfolio Summary</h3><span class="tag">Overview</span></div><div class="ds-portfolio-summary">${walletStatsHTML()}</div><p class="ds-card-note">Always appears above the Portfolio order groups and recalculates from current, pending and settled data.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Open Trade</h3><span class="tag">Positive Return</span></div>${tradeLayoutCurrentGameCard("kc", menuPositionPreviewGames.kc.trades[0], "compact")}<p class="ds-card-note">Canonical trade card shared by the signed-in Home carousel, Game Trades, and header Open Trades panel. The surrounding surface supplies the score once per game.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Open Trade</h3><span class="tag">Negative Return</span></div>${tradeLayoutCurrentGameCard("ny", menuPositionPreviewGames.ny.trades[0], "compact")}<p class="ds-card-note">The same structure switches only the earnings value and semantic colour when performance is negative.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Tie Trade</h3><span class="tag">Two-Team Outcome</span></div>${tradeLayoutCurrentGameCard("kc", menuPositionPreviewGames.kc.trades[1], "compact")}<p class="ds-card-note">TIE uses both team marks and the gold market treatment. Market codes are always GTL, KTL, or TIE.</p></article>
          <article class="panel ds-card-frame ds-order-row-frame"><div class="panel-header"><h3>Current Order</h3><span class="tag">Open</span></div>${walletOrderRow(walletUser.positions[0], "open", 0)}${componentUsage("Compact Portfolio row for an active position. Selecting it opens the order detail view.")}</article>
          <article class="panel ds-card-frame ds-order-row-frame"><div class="panel-header"><h3>Pending Order</h3><span class="tag">Limit</span></div>${walletOrderRow(walletUser.pending[0], "pending", 0)}${componentUsage("Limit order waiting to fill. The status and value replace live earnings until execution.")}</article>
          <article class="panel ds-card-frame ds-order-row-frame"><div class="panel-header"><h3>Cancelled Order</h3><span class="tag">Cancelled</span></div>${walletOrderRow(walletUser.cancelled[0], "cancelled", 0)}${componentUsage("Read-only historical order row. Cancellation is explicit and never styled as a loss.")}</article>
          <article class="panel ds-card-frame ds-order-row-frame"><div class="panel-header"><h3>Settled Order</h3><span class="tag">History</span></div>${walletOrderRow(walletUser.settled[0], "settled", 0)}${componentUsage("Completed bet shown in Settled. Outcome and realised value replace the live order state.")}</article>
          <article class="panel ds-card-frame ds-settled-card-frame"><div class="panel-header"><h3>Winning Settlement</h3><span class="tag">Notification Card</span></div>${componentSettledCard(walletGames[walletUser.settled[0].gameId])}${componentUsage("Temporary Home notification shown once after a winning settlement, with Dismiss and Bet Again actions.")}</article>
        </div>
      </section>

      <section class="ds-card-group" aria-labelledby="ds-data-cards-title">
        <div class="ds-card-group-head"><div><span class="eyebrow">Game Page</span><h3 id="ds-data-cards-title">Game Data Cards</h3></div><p>Market Stats contains Market Book and Order Flow. Game Stats contains Score Worm and the five-row team comparison.</p></div>
        <div class="ds-current-card-grid ds-data-card-grid">
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Score Worm</h3><span class="tag">Game Stats</span></div>${componentScoreWormCard(cardGame)}${componentUsage("Plots score margin across the game with team colour changing at the zero line and exposes lead changes and ties below.")}</article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Team Comparison</h3><span class="tag">Five Core Stats</span></div>${componentGameStatsCard(cardGame)}<p class="ds-card-note">Always uses team initials in the comparison header, including licensed-logo scorecard variants.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Market Book</h3><span class="tag">Market Stats</span></div>${componentMarketBookCard(cardGame)}${componentUsage("Shows the current bid, ask, spread, and depth. Use the empty treatment until the first team takes the lead and orders open.")}</article>
          <article class="panel ds-card-frame ds-order-flow-frame"><div class="panel-header"><h3>Order Flow</h3><span class="tag">Market Stats</span></div>${componentOrderFlowCard(cardGame)}${componentUsage("Combines quarter volume with the latest trade table. The empty state keeps the table headers and reports No trades yet.")}</article>
        </div>
      </section>

      <section class="ds-card-group" aria-labelledby="ds-settings-cards-title">
        <div class="ds-card-group-head"><div><span class="eyebrow">Account</span><h3 id="ds-settings-cards-title">Settings Cards</h3></div><p>Complete Profile &amp; Settings card coverage, including editable and validation states and the responsive account list.</p></div>
        <div class="ds-current-card-grid ds-settings-card-grid">
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Username</h3><span class="tag">Default</span></div>${componentUsernameCard("view")}<p class="ds-card-note">Displayed after authentication. Edit replaces this view in place without navigating away.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Edit Username</h3><span class="tag">Editing</span></div>${componentUsernameCard("edit")}<p class="ds-card-note">The field is prefilled with the saved username. Save validates; Cancel restores the saved value and view state.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Username Validation</h3><span class="tag">Error</span></div>${componentUsernameCard("error")}<p class="ds-card-note">Shown after an invalid save attempt. Accept 3–20 letters, numbers or underscores and clear the error on input.</p></article>
          <article class="panel ds-card-frame ds-settings-card-frame"><div class="panel-header"><h3>Account Details</h3><span class="tag">Password Account</span></div>${componentAccountSettingsCard()}<p class="ds-card-note">Values are account-driven. Credits routes to Portfolio and password accounts expose Change Password; social accounts replace that row with provider-managed guidance.</p></article>
          <article class="panel ds-card-frame ds-settings-card-frame"><div class="panel-header"><h3>Preferences</h3><span class="tag">Account</span></div>${componentPreferenceCards()}<p class="ds-card-note">Appearance is interactive immediately. Notifications remains explicitly unavailable until preference controls are implemented.</p></article>
          <article class="panel ds-card-frame ds-settings-card-frame"><div class="panel-header"><h3>Account Management</h3><span class="tag">Actions</span></div>${componentAccountManagementCards()}<p class="ds-card-note">Betting Controls opens its current coming-soon page. Delete Account routes to the destructive confirmation page.</p></article>
        </div>
      </section>`;
  }

  if (sections.tables) sections.tables.innerHTML = `${componentSectionHeader("Tables", "Only two production data-table patterns are supported: compact recent trades on the Game page and responsive leaderboard rows on Ranking.")}
    ${componentGroupHeader("Production Data Tables", "Keep labels visible, align numeric values with tabular figures, and preserve a meaningful empty row instead of removing the table structure.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Recent Trades</h3><span class="tag">Game</span></div><div class="table-wrap"><table class="bets-table"><thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead><tbody><tr><td class="tnum">11:04</td><td>GTL</td><td class="side-yes">YES</td><td class="num tnum">64¢</td><td class="num tnum">100</td></tr><tr><td class="tnum">11:02</td><td>KTL</td><td class="side-no">NO</td><td class="num tnum">38¢</td><td class="num tnum">50</td></tr></tbody></table></div>${componentUsage("Lives inside Order Flow. Keep newest trades first; Market uses GTL, KTL, or TIE and Side uses semantic text colour.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Recent Trades Empty</h3><span class="tag">Game</span></div><div class="table-wrap"><table class="bets-table"><thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead><tbody><tr><td colspan="5" class="empty-row">No trades yet</td></tr></tbody></table></div>${componentUsage("Retain the headings while the market is unopened or has no executions. Replace the body with one centred empty row.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Leaderboard</h3><span class="tag">Ranking</span></div><div class="ranking-table-head"><span>Rank</span><span>Player</span><span>Balance</span><span>Prize</span></div><div class="ranking-scroll"><div class="ranking-row is-podium is-rank-1"><span class="rank-pos">1</span><span class="rank-user">leadstorm</span><span class="rank-balance tnum">6,840</span><span class="rank-prize">$1,500</span></div><div class="ranking-row is-current"><span class="rank-pos">47</span><span class="rank-user">alex</span><span class="rank-balance tnum">1,710</span><span class="rank-prize">—</span></div></div>${componentUsage("Desktop shows all four columns. Mobile retains rank, player, and balance while prize detail moves to the competition context; the current user remains highlighted.")}</article>
    </div>`;

  if (sections.feedback) sections.feedback.innerHTML = `${componentSectionHeader("Feedback", "Feedback is placed at the scope of the event: field errors beside fields, order warnings inside the drawer, page states in the affected region, and toasts only for brief cross-page confirmation.")}
    ${componentGroupHeader("Feedback by Scope", "Use the smallest pattern that fully explains the state and includes a recovery action whenever the user can resolve it.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Toasts</h3><span class="tag">Transient</span></div><div class="ds-toast-stack">${componentToast("success", "Username updated")}${componentToast("error", "Unable to place order")}</div>${componentUsage("Use after an action whose result is no longer adjacent to its trigger. Toasts announce through status or alert roles and dismiss automatically.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Inline Warnings</h3><span class="tag">Trading</span></div><div class="ds-status-stack"><div class="bet-conflict" role="alert">${drawerWarnIcon}<span><strong>Insufficient balance.</strong> Add funds before placing this bet.</span></div><div class="trade-pause drawer-trade-pause"><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div></div>${componentUsage("Keep transactional warnings inside the Buy/Sell Drawer. Balance errors explain the recovery; recalculation locks affected controls until current prices return.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Empty State</h3><span class="tag">Portfolio</span></div><div class="wallet-empty">No current orders.</div>${componentUsage("Use short, content-specific copy inside the list region. Do not place an empty card around a list that has no items.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Loading State</h3><span class="tag">Cards</span></div>${flatLoading()}${componentUsage("Skeletons match the shape and count of the incoming content and replace only the affected region, not the entire application shell.")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Recoverable Error</h3><span class="tag">Home Games</span></div><div class="home-game-state" role="alert"><span class="home-game-state-icon" aria-hidden="true">!</span><strong>We couldn't load live games</strong><p>Check your connection and try again.</p><button class="btn btn-secondary" type="button">Try Again</button></div>${componentUsage("Use when a page region fails but the surrounding page remains usable. State the problem plainly and provide one local retry action.")}</article>
    </div>`;

  if (sections.dialogs) sections.dialogs.innerHTML = `${componentSectionHeader("Dialogs", "Every modal used by the app, shown implemented over the relevant screen in a complete phone mockup. Buy and sell confirmations remain in the dedicated Buy/Sell Drawer reference.")}
    <div class="ds-dialog-catalog">
      ${componentDialogGroup({ type: "auth", title: "Sign In to Bet", tag: "Authentication", copy: "Shown when a signed-out user selects a market. The separate Close action dismisses the saved bet intent." })}
      ${componentDialogGroup({ type: "position", title: "Existing Trade", tag: "Trading confirmation", copy: "Warns before a user opens a competing trade in the same game, with an optional session-level dismissal." })}
      ${componentDialogGroup({ type: "ranking", title: "Monthly Ranking Result", tag: "Ranking", copy: "Shown over whichever screen the user returns to after a monthly competition completes. These examples use the Home screen to demonstrate outside-top-10, rewarded-top-10, and top-three outcomes." })}
      ${componentDialogGroup({ type: "topup", title: "Top Up Balance", tag: "Wallet", copy: "This wallet funding flow is outside the current MVP scope and is retained here as a future-state reference." })}
      ${componentDialogGroup({ type: "waitlist", title: "Waitlist Confirmation", tag: "Marketing", copy: "A focused confirmation state shown while an early-access place is being secured." })}
    </div>`;

  modal?.remove();
}

function startConfirmationTimers() {
  let remaining = 5;
  const updateTimers = (value, resetting = false) => {
    const progress = value / 5;
    const timers = Array.from(document.querySelectorAll(".bet-sheet.is-success .bet-countdown-clock"));
    timers.forEach((timer) => {
      const number = timer.querySelector("strong");
      if (resetting) timer.classList.add("is-timer-resetting");
      if (number) number.textContent = String(value);
      timer.setAttribute("aria-label", `${value} ${value === 1 ? "second" : "seconds"} remaining`);
      timer.style.setProperty("--bet-confirm-progress", String(progress));
      if (resetting) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => timer.classList.remove("is-timer-resetting"));
        });
      }
    });
  };

  updateTimers(remaining, true);
  window.setInterval(() => {
    if (remaining === 0) {
      remaining = 5;
      updateTimers(remaining, true);
      return;
    }
    remaining -= 1;
    updateTimers(remaining);
  }, 1000);
}

window.addEventListener("hashchange", () => {
  showSection(sectionFromHash(), { instant: true });
});

setDesignSystemTheme(currentDesignSystemTheme(), { persist: false });
syncPrimitiveSections();
syncAppComponentSections();
installDesignSystemThemeToggles();
startConfirmationTimers();
renderDrawerComponentStates();
setDrawerView(drawerSection?.dataset.drawerViewMode);
drawerSection?.querySelectorAll(".bet-sheet").forEach(updateDrawerPreview);
if (pageTabs.length) loadPagePreview(document.querySelector("[data-page-tab].is-active") || pageTabs[0]);
showSection(sectionFromHash(), { instant: true });
describeColorSwatches();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});
