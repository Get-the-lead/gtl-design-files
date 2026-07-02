/* GTL v2 — interactions + mock data
   Works on both home.html and game.html; guards on element presence.
   All rendered content comes from the trusted GAMES constant below. */

/* ----------------------------------------------------------------- DATA */
const L = "assets/logos/";

const GAMES = [
  {
    id: "ny-bos", league: "nba", clock: "05:18", period: "Q4", variant: 2,
    home: { abbr: "NYK", name: "Knicks", score: 84, color: "#F58426", logo: L + "nba-ny.png" },
    away: { abbr: "BOS", name: "Celtics", score: 89, color: "#007A33", logo: L + "nba-bos.png" },
    markets: { gtl: { yes: 41, no: 59 }, tie: { yes: 17, no: 83 }, ktl: { yes: 63, no: 37 } },
    stats: [
      { label: "Field goal %", home: 46, away: 51 },
      { label: "Rebounds", home: 38, away: 35 },
      { label: "Assists", home: 19, away: 24 },
      { label: "3PT %", home: 34, away: 41 },
      { label: "Turnovers", home: 11, away: 8 },
    ],
  },
  {
    id: "kc-sf", league: "nfl", clock: "08:42", period: "Q2", variant: 1,
    home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: L + "nfl-kc.png" },
    away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: L + "nfl-sf.png" },
    markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 64, no: 36 } },
    stats: [
      { label: "Total yards", home: 214, away: 186 },
      { label: "Possession %", home: 54, away: 46 },
      { label: "1st downs", home: 12, away: 10 },
      { label: "3rd down %", home: 50, away: 42 },
      { label: "Turnovers", home: 0, away: 1 },
    ],
  },
  {
    id: "den-dal", league: "nba", clock: "01:33", period: "Q4", variant: 4,
    home: { abbr: "DEN", name: "Nuggets", score: 102, color: "#FEC524", logo: L + "nba-den.png" },
    away: { abbr: "DAL", name: "Mavericks", score: 99, color: "#00538C", logo: L + "nba-dal.png" },
    markets: { gtl: { yes: 33, no: 67 }, tie: { yes: 26, no: 74 }, ktl: { yes: 71, no: 29 } },
    stats: [
      { label: "Field goal %", home: 49, away: 47 },
      { label: "Rebounds", home: 41, away: 39 },
      { label: "Assists", home: 27, away: 22 },
      { label: "3PT %", home: 38, away: 36 },
      { label: "Turnovers", home: 9, away: 12 },
    ],
  },
  {
    id: "buf-mia", league: "nfl", clock: "11:05", period: "Q3", variant: 3,
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: L + "nfl-buf.png" },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: L + "nfl-mia.png" },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 58, no: 42 } },
    stats: [
      { label: "Total yards", home: 288, away: 264 },
      { label: "Possession %", home: 52, away: 48 },
      { label: "1st downs", home: 16, away: 14 },
      { label: "3rd down %", home: 45, away: 48 },
      { label: "Turnovers", home: 1, away: 1 },
    ],
  },
  {
    id: "lal-gs", league: "nba", clock: "03:42", period: "Q3", variant: 6,
    home: { abbr: "LAL", name: "Lakers", score: 58, color: "#552583", logo: L + "nba-lal.png" },
    away: { abbr: "GSW", name: "Warriors", score: 61, color: "#1D428A", logo: L + "nba-gs.png" },
    markets: { gtl: { yes: 47, no: 53 }, tie: { yes: 28, no: 72 }, ktl: { yes: 55, no: 45 } },
    stats: [
      { label: "Field goal %", home: 44, away: 48 },
      { label: "Rebounds", home: 29, away: 26 },
      { label: "Assists", home: 14, away: 17 },
      { label: "3PT %", home: 31, away: 39 },
      { label: "Turnovers", home: 7, away: 6 },
    ],
  },
  {
    id: "dal-phi", league: "nfl", clock: "02:14", period: "Q4", variant: 5,
    home: { abbr: "DAL", name: "Cowboys", score: 21, color: "#003594", logo: L + "nfl-dal.png" },
    away: { abbr: "PHI", name: "Eagles", score: 21, color: "#004C54", logo: L + "nfl-phi.png" },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 64, no: 36 }, ktl: { yes: 50, no: 50 } },
    stats: [
      { label: "Total yards", home: 341, away: 352 },
      { label: "Possession %", home: 49, away: 51 },
      { label: "1st downs", home: 19, away: 20 },
      { label: "3rd down %", home: 47, away: 44 },
      { label: "Turnovers", home: 2, away: 1 },
    ],
  },
];

/* ------------------------------------------------------------- HELPERS */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const leaderOf = (g) => (g.home.score === g.away.score ? null : g.home.score > g.away.score ? "home" : "away");

const CHEVRON = '<svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MARKET_LABELS = { gtl: "Get the Lead", tie: "Tie", ktl: "Keep the Lead" };
const CHEVRON_DOWN = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// The 2nd live game (NFL default view) demos the "trading paused → recalculating" state on every expand.
const PAUSED_DEMO_GAME_ID = "buf-mia";
// The 3rd card (den-dal) opens an alternate design page (game-b.html) for experimentation.
const ALT_DESIGN_GAME_ID = "den-dal";
const gamePageHref = (g) => `${g.id === ALT_DESIGN_GAME_ID ? "game-b" : "game"}.html?id=${g.id}`;

/* ----------------------------------------------- HOME: EXPANDABLE BETS */
function betPanel(g, paused = false) {
  const href = gamePageHref(g);
  const row = (label, sub, full, key) => `<div class="mkt-row">
      <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
      <button class="price yes" data-game="${g.id}" data-market="${key}" data-side="yes" aria-label="${full} Yes ${g.markets[key].yes} cents">${g.markets[key].yes}¢</button>
      <button class="price no" data-game="${g.id}" data-market="${key}" data-side="no" aria-label="${full} No ${g.markets[key].no} cents">${g.markets[key].no}¢</button>
    </div>`;
  return `${paused ? `<div class="trade-pause" role="status"><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div>` : ""}
    <div class="mkt-grid">
      <div class="mkt-head"><span class="col-market">Markets</span><span class="col-yes">Yes</span><span class="col-no">No</span></div>
      ${row("GTL", "Get the Lead", "Get the Lead", "gtl")}
      ${row("TIE", "", "Tie", "tie")}
      ${row("KTL", "Keep the Lead", "Keep the Lead", "ktl")}
    </div>
    <a class="view-game" href="${href}">View Game</a>`;
}

function footHTML(g, paused = false) {
  return `<div class="tile-foot">
      <button class="foot-toggle" data-expand aria-expanded="${paused ? "true" : "false"}">
        <span class="chev">${CHEVRON_DOWN}</span>
        <span class="toggle-label">${paused ? "Hide Bets" : "See Bets"}</span>
        <span class="chev">${CHEVRON_DOWN}</span>
      </button>
      <div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${betPanel(g, paused)}</div></div></div>
    </div>`;
}

/* ----------------------------------------------------- HOME: GAME TILES */
function renderTiles() {
  const grid = $("#gameGrid");
  if (!grid) return;
  grid.innerHTML = GAMES.map((g) => {
    const lead = leaderOf(g);
    const teamBlock = (side) => {
      const t = g[side];
      const leading = lead === side ? " is-leading" : "";
      return `<div class="team team-${side}${leading}">
          <img class="team-logo" src="${t.logo}" alt="${t.name}" loading="lazy" />
          <div class="team-meta"><span class="team-abbr">${t.abbr}</span><span class="team-score tnum">${t.score}</span></div>
        </div>`;
    };
    const demo = g.id === PAUSED_DEMO_GAME_ID ? " data-paused-demo" : "";
    return `<article class="game-tile" data-league="${g.league}"${demo} style="--home-color:${g.home.color};--away-color:${g.away.color}">
        <a class="tile-main" href="${gamePageHref(g)}" aria-label="Open ${g.away.abbr} at ${g.home.abbr}">
          <div class="game-row">
            ${teamBlock("home")}
            <div class="game-center"><span class="period">${g.period}</span><span class="clock tnum">${g.clock}</span></div>
            ${teamBlock("away")}
          </div>
        </a>
        ${footHTML(g)}
      </article>`;
  }).join("");
}

/* --------------------------------------------------------- HOME: EXPAND */
function initExpanders() {
  $$("[data-expand]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const tile = btn.closest(".game-tile");
      const open = tile.classList.toggle("is-open");
      $$("[data-expand]", tile).forEach((b) => b.setAttribute("aria-expanded", open ? "true" : "false"));
      const label = tile.querySelector(".toggle-label");
      if (label) label.textContent = open ? "Hide Bets" : "See Bets";
      if (open && tile.hasAttribute("data-paused-demo")) runPausedDemo(tile);
    })
  );
}

// Demo the "trading paused → recalculating markets" state each time the tile is opened.
// Prices lock with loaders, then ~8s later (while still open) the pause clears and prices update.
function runPausedDemo(tile) {
  const pad = tile.querySelector(".foot-panel-pad");
  if (!pad) return;
  clearTimeout(tile._pauseTimer);
  tile.classList.add("is-paused");
  if (!pad.querySelector(".trade-pause")) {
    pad.insertAdjacentHTML("afterbegin", `<div class="trade-pause" role="status"><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div>`);
  }
  $$(".price", tile).forEach((btn) => {
    btn.disabled = true; btn.setAttribute("aria-disabled", "true");
    if (!btn.querySelector(".price-loader")) btn.insertAdjacentHTML("afterbegin", `<span class="price-loader" aria-hidden="true"></span>`);
  });
  tile._pauseTimer = setTimeout(() => {
    tile.classList.remove("is-paused");
    tile.querySelector(".trade-pause")?.remove();
    $$(".price", tile).forEach((btn) => {
      btn.disabled = false; btn.removeAttribute("aria-disabled");
      btn.querySelector(".price-loader")?.remove();
    });
    // markets recalculated — nudge the prices so they visibly update
    $$(".mkt-row", tile).forEach((row) => {
      const yesEl = row.querySelector(".price.yes");
      const noEl = row.querySelector(".price.no");
      if (!yesEl || !noEl) return;
      const yes = Math.max(5, Math.min(95, parseInt(yesEl.textContent, 10) + priceDelta()));
      yesEl.textContent = `${yes}¢`;
      noEl.textContent = `${100 - yes}¢`;
      [yesEl, noEl].forEach((el) => { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); });
    });
  }, 8000);
}

/* --------------------------------------------------- HOME: LEAGUE FILTER */
function initLeagueFilter() {
  const strip = $("#leagueStrip");
  const grid = $("#gameGrid");
  if (!strip || !grid) return;
  const soon = $("#nbaSoon");
  const apply = (league) => {
    const isNba = league === "nba";
    if (soon) soon.hidden = !isNba; // NBA → coming-soon panel instead of cards
    grid.style.display = isNba ? "none" : "";
    $$(".game-tile", grid).forEach((tile) => {
      tile.style.display = tile.dataset.league === league ? "" : "none";
    });
  };
  strip.addEventListener("click", (e) => {
    const pill = e.target.closest(".league-pill");
    if (!pill) return;
    $$(".league-pill", strip).forEach((p) => {
      const on = p === pill;
      p.classList.toggle("is-active", on);
      p.setAttribute("aria-selected", on ? "true" : "false");
    });
    apply(pill.dataset.league);
  });
  const active = $(".league-pill.is-active", strip) || $(".league-pill", strip);
  apply(active.dataset.league);

  // NBA interest signal → feedback toast
  const soonEl = $("#nbaSoon");
  if (soonEl) soonEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-nba-vote]");
    if (!b) return;
    $$("[data-nba-vote]", soonEl).forEach((x) => x.classList.toggle("is-chosen", x === b));
    showToast("Your feedback has been submitted", "success");
  });
}

/* ----------------------------------------------- HEADER (shared, rendered) */
const ICON_MOON = '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_SUN = '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const LOGO_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5 20 18H4Z"/></svg>';
const ICON_HAMBURGER = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const THEME_SWITCH = `<span class="theme-switch-track" aria-hidden="true"><span class="theme-switch-thumb"></span><span class="theme-option theme-sun">${ICON_SUN}</span><span class="theme-option theme-moon">${ICON_MOON}</span></span>`;
// Header nav shown inside the GTL pill on desktop. Home / Live Games / How it works always; Portfolio + Logout only when signed in.
function navHTML(authed) {
  return `<nav class="header-nav" aria-label="Primary navigation">
    <a href="home.html" data-scroll-top>Home</a>
    <a href="home.html#live">Live Games</a>
    <a href="home.html#how">How it Works</a>
    ${authed ? `<a href="wallet.html">Portfolio</a>` : ""}
    ${authed ? `<span class="header-nav-sep" aria-hidden="true"></span><button type="button" class="header-nav-logout" data-logout>Logout</button>` : ""}
  </nav>`;
}
const WALLET_ICO = '<svg class="wallet-ico" viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 8v9a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M20 8v4h-4a2 2 0 0 1 0-4h4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const POS_ICO = '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="5" rx="1.6" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="12.5" width="18" height="5" rx="1.6" stroke="currentColor" stroke-width="1.8"/></svg>';

// Single source of truth for the header on every page (auth slots filled by applyAuthChrome)
function renderHeader() {
  const header = $("#siteHeader");
  if (!header) return;
  header.innerHTML = `
    <div class="header-row">
      <div class="header-left">
        <span class="brand-pill">
          <a class="brand floating-logo floating-btn brand-link" href="home.html" data-scroll-top aria-label="GTL Markets home">
            <span class="brand-mark" aria-hidden="true">${LOGO_SVG}</span>
            <span class="brand-word">GTL Markets</span>
          </a>
          <button class="brand floating-logo floating-btn brand-menu" data-menu-toggle aria-controls="menuPanel" aria-expanded="false" aria-label="Open menu">
            <span class="brand-mark" aria-hidden="true">${LOGO_SVG}</span>
            <span class="brand-word">GTL Markets</span>
            <span class="brand-burger"><span class="icon-menu">${ICON_HAMBURGER}</span><span class="icon-close">${ICON_X}</span></span>
          </button>
          <span class="header-nav-slot" id="headerNav"></span>
        </span>
        <button class="theme-switch floating-btn" id="themeBtnHeader" data-theme-toggle aria-label="Switch colour theme">${THEME_SWITCH}</button>
      </div>
      <div class="header-right">
        <span class="header-auth" id="headerAuth"></span>
        <span class="header-positions" id="headerPositions"></span>
      </div>
    </div>
    <div class="menu-panel" id="menuPanel" hidden>
      <nav class="menu-nav">
        <a href="home.html" data-scroll-top>Home</a>
        <a href="home.html#live">Live Games</a>
        <a href="home.html#how">How it Works</a>
        <a href="wallet.html">Portfolio</a>
        <a href="#">Tutorial</a>
      </nav>
      <div class="menu-appearance">
        <button class="menu-theme" id="themeBtn" data-theme-toggle aria-label="Switch colour theme">
          <span>Appearance</span>
          ${THEME_SWITCH}
        </button>
      </div>
      <div class="menu-actions" id="menuActions"></div>
    </div>`;
}

function initHeader() {
  const header = $("#siteHeader");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const triggers = $$("[data-menu-toggle]");
  const panel = $("#menuPanel");
  if (triggers.length && panel) {
    const setExpanded = (v) => triggers.forEach((t) => t.setAttribute("aria-expanded", v));
    const close = () => { panel.setAttribute("hidden", ""); setExpanded("false"); document.body.classList.remove("menu-open"); };
    const open = () => { panel.removeAttribute("hidden"); setExpanded("true"); document.body.classList.add("menu-open"); };
    triggers.forEach((t) => t.addEventListener("click", (e) => { e.stopPropagation(); panel.hasAttribute("hidden") ? open() : close(); }));
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    document.addEventListener("click", (e) => { if (!header.contains(e.target)) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // Open Positions dropdown (delegated — the trigger is (re)built by applyAuthChrome)
  const closePos = () => { const p = $("#hposPanel"); if (p) { p.setAttribute("hidden", ""); $("[data-hpos-toggle]")?.setAttribute("aria-expanded", "false"); } };
  document.addEventListener("click", (e) => {
    const pnl = $("#hposPanel");
    if (!pnl) return;
    if (e.target.closest("[data-hpos-toggle]")) {
      e.stopPropagation();
      const willOpen = pnl.hasAttribute("hidden");
      pnl.toggleAttribute("hidden", !willOpen);
      $("[data-hpos-toggle]")?.setAttribute("aria-expanded", willOpen ? "true" : "false");
    } else if (e.target.closest(".hpos-panel")) {
      if (e.target.closest("[data-buy], [data-sell]")) closePos(); // Buy/Sell opens the bet sheet — close the dropdown behind it
    } else {
      closePos();
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePos(); });
}

/* ------------------------------------------------------- THEME TOGGLE */
function initTheme() {
  const toggles = $$("[data-theme-toggle]");
  if (!toggles.length) return;
  toggles.forEach((btn) => btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("gtl-theme", next); } catch (e) { /* ignore */ }
  }));
}

/* --------------------------------------------------- SCROLL-TO-TOP LOGO */
function initScrollTop() {
  $$("[data-scroll-top]").forEach((el) =>
    el.addEventListener("click", (e) => {
      if (location.pathname.endsWith("home.html") || location.pathname.endsWith("/")) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    })
  );
}

/* --------------------------------------------------- LIVE PRICE TICKER */
// A price move of at least 5¢, in either direction
const priceDelta = () => (5 + Math.floor(Math.random() * 5)) * (Math.random() < 0.5 ? -1 : 1);

// Live clocks — tick each running game's clock down once a second (prototype liveness).
// Games with no clock (e.g. a quarter break) are skipped.
function startClockTicker() {
  setInterval(() => {
    GAMES.forEach((g) => {
      if (!g.clock) return;
      let total = g.clock.split(":").reduce((acc, part) => acc * 60 + Number(part), 0) - 1;
      if (total < 0) total = 12 * 60;
      g.clock = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      $$(`[data-game-clock="${g.id}"]`).forEach((el) => { el.textContent = g.clock; });
    });
  }, 1000);
}

function startPriceTicker() {
  const rows = $$(".mkt-row");
  if (!rows.length) return;
  const bump = (row) => {
    const yesEl = row.querySelector(".price.yes");
    const noEl = row.querySelector(".price.no");
    if (!yesEl || !noEl) return;
    if (yesEl.disabled || noEl.disabled) return;
    let yes = parseInt(yesEl.textContent, 10) + priceDelta();
    yes = Math.max(5, Math.min(95, yes));
    yesEl.textContent = `${yes}¢`;
    noEl.textContent = `${100 - yes}¢`;
    [yesEl, noEl].forEach((el) => { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); });
  };
  setInterval(() => {
    // sporadic: nudge just one or two markets each tick
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) bump(rows[Math.floor(Math.random() * rows.length)]);
  }, 10000);
}

/* --------------------------------------------------- HERO: LIVE COUNTER */
function initTradingCounter() {
  const el = $("#tradingCount");
  if (!el) return;
  let n = 3247;
  setInterval(() => {
    n += Math.floor(Math.random() * 9) - 3;
    if (n < 3100) n = 3100;
    el.textContent = n.toLocaleString("en-US");
  }, 2600);
}

/* ------------------------------------------------------- GAME PAGE BUILD */
function marketRow(g, label, sub, key) {
  const mk = g.markets[key];
  return `<div class="mkt-row">
      <button class="price yes" data-game="${g.id}" data-market="${key}" data-side="yes" aria-label="${label} Yes ${mk.yes} cents">${mk.yes}¢</button>
      <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
      <button class="price no" data-game="${g.id}" data-market="${key}" data-side="no" aria-label="${label} No ${mk.no} cents">${mk.no}¢</button>
    </div>`;
}

function statCards(items) {
  return items.map((item) => `<div class="stat-card">
      <span class="stat-card-label">${item.label}</span>
      <span class="stat-card-value tnum">${item.value}</span>
    </div>`).join("");
}

function chartPath(points, width = 260, height = 86, min = 0, max = 100) {
  const span = Math.max(1, max - min);
  return points.map((value, i) => {
    const x = (i / Math.max(1, points.length - 1)) * width;
    const y = height - ((value - min) / span) * height;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function seriesAround(value, variant, spread) {
  return Array.from({ length: 7 }, (_, i) => {
    const wave = ((i * 3 + variant * 2) % 7) - 3;
    return Math.max(1, Math.min(99, value + wave * spread));
  });
}

function bettingCharts(g) {
  const mk = g.markets.gtl;
  const bid = Math.max(1, mk.yes - 1);
  const ask = Math.min(99, mk.yes + 1);
  const bidSeries = seriesAround(bid, g.variant, 1.2);
  const askSeries = bidSeries.map((v, i) => Math.min(99, v + 2 + (i % 2)));
  const volumeNow = (g.home.score + g.away.score) * 1250 + g.variant * 1800;
  const volumeSeries = Array.from({ length: 7 }, (_, i) => Math.round(volumeNow * (0.44 + i * 0.09 + ((g.variant + i) % 3) * 0.012)));
  const volumeMax = Math.max(...volumeSeries);
  const probRaw = [
    { key: "GTL", value: g.markets.gtl.yes },
    { key: "TIE", value: g.markets.tie.yes },
    { key: "KTL", value: g.markets.ktl.yes },
  ];
  const total = probRaw.reduce((sum, item) => sum + item.value, 0) || 1;
  const probs = probRaw.map((item) => ({ ...item, pct: Math.round((item.value / total) * 100) }));
  probs[2].pct += 100 - probs.reduce((sum, item) => sum + item.pct, 0);

  return `
    <div class="chart-card">
      <div class="chart-head">
        <span>Bid / Ask</span>
        <strong class="tnum">${bid}¢ / ${ask}¢</strong>
      </div>
      <svg class="line-chart" viewBox="0 0 260 86" role="img" aria-label="Bid and ask price movement">
        <path class="chart-grid" d="M0 18H260M0 43H260M0 68H260"></path>
        <path class="chart-line bid" d="${chartPath(bidSeries)}"></path>
        <path class="chart-line ask" d="${chartPath(askSeries)}"></path>
      </svg>
      <div class="chart-legend"><span class="bid">Bid</span><span class="ask">Ask</span></div>
    </div>

    <div class="chart-card">
      <div class="chart-head">
        <span>Implied probability</span>
        <strong class="tnum">100%</strong>
      </div>
      <div class="prob-line" aria-label="Implied probability split">
        ${probs.map((item) => `<span class="prob-seg ${item.key.toLowerCase()}" style="width:${item.pct}%"></span>`).join("")}
      </div>
      <div class="prob-legend">
        ${probs.map((item) => `<span><b class="${item.key.toLowerCase()}"></b>${item.key} <strong class="tnum">${item.pct}%</strong></span>`).join("")}
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-head">
        <span>Volume</span>
        <strong class="tnum">$${volumeNow.toLocaleString("en-US")}</strong>
      </div>
      <svg class="line-chart" viewBox="0 0 260 86" role="img" aria-label="Trading volume growing over time">
        <path class="chart-grid" d="M0 18H260M0 43H260M0 68H260"></path>
        <path class="chart-area" d="${chartPath(volumeSeries, 260, 86, 0, volumeMax)} L260 86 L0 86 Z"></path>
        <path class="chart-line volume" d="${chartPath(volumeSeries, 260, 86, 0, volumeMax)}"></path>
      </svg>
    </div>`;
}

function gameMomentumStats(g) {
  const ties = 2 + (g.variant % 4);
  const changes = 4 + (g.variant % 5);
  const tiesUp = g.variant % 2 === 0;
  const changesUp = g.home.score <= g.away.score;
  return [
    {
      label: "Current ties",
      value: ties,
      trend: tiesUp ? "up" : "down",
      delta: tiesUp ? "+1 last quarter" : "-1 last quarter",
      series: seriesAround(ties * 12 + 32, g.variant, 2.4),
    },
    {
      label: "Lead changes",
      value: changes,
      trend: changesUp ? "up" : "down",
      delta: changesUp ? "+2 since halftime" : "-1 since halftime",
      series: seriesAround(changes * 9 + 28, g.variant + 2, 2.8),
    },
  ];
}

function gameMomentumCards(g) {
  return gameMomentumStats(g).map((item) => `<div class="momentum-card ${item.trend}">
      <div class="momentum-head">
        <span>${item.label}</span>
        <strong class="tnum">${item.value}</strong>
      </div>
      <svg class="spark-chart" viewBox="0 0 160 52" role="img" aria-label="${item.label} trend">
        <path class="chart-grid" d="M0 14H160M0 38H160"></path>
        <path class="chart-line ${item.trend}" d="${chartPath(item.series, 160, 52, 0, 100)}"></path>
      </svg>
      <span class="trend-pill ${item.trend}">
        <span class="trend-arrow" aria-hidden="true">${item.trend === "up" ? "↑" : "↓"}</span>
        ${item.delta}
      </span>
    </div>`).join("");
}

function initStatsTabs() {
  const tabs = $("#statsTabs");
  if (!tabs) return;
  tabs.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-stats-tab]");
    if (!tab) return;
    const target = tab.dataset.statsTab;
    $$("[data-stats-tab]", tabs).forEach((btn) => {
      const active = btn === tab;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    $$("[data-stats-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.statsPanel !== target;
    });
  });
}

function renderGamePage() {
  const main = $("#gameMain");
  if (!main) return;
  const id = new URL(location.href).searchParams.get("id") || GAMES[0].id;
  const g = GAMES.find((x) => x.id === id) || GAMES[0];
  document.title = `${g.away.abbr} @ ${g.home.abbr} — GTL`;
  const lead = leaderOf(g);

  const teamCol = (side) => {
    const t = g[side];
    const leading = lead === side ? " is-leading" : "";
    return `<div class="gb-team${leading}"><img class="gb-logo" src="${t.logo}" alt="${t.name}" /><span class="gb-abbr">${t.abbr}</span></div>`;
  };

  const marketsHTML = `
    <div class="mkt-grid">
      <div class="mkt-head"><span class="col-yes">Yes</span><span></span><span class="col-no">No</span></div>
      ${marketRow(g, "GTL", "Get the Lead", "gtl")}
      ${marketRow(g, "TIE", "", "tie")}
      ${marketRow(g, "KTL", "Keep the Lead", "ktl")}
    </div>
    <p class="bet-help">Tap a price to start your bet · Prices updated every 10 seconds</p>`;

  const bettingStatsHTML = bettingCharts(g);
  const gameSummaryHTML = gameMomentumCards(g);

  main.innerHTML = `
    <div class="game-layout" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="game-col-left" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <section class="gb" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <div class="gb-glow" aria-hidden="true"></div>
      <div class="container gb-inner">
        <div class="gb-topbar">
          <a class="gb-back" href="home.html" aria-label="Back to games">${CHEVRON}<span>Games</span></a>
        </div>
        <div class="gb-score-stack">
          <span class="live-badge game-clock-badge">
            <span class="game-period"><span class="live-dot"></span>${g.period}</span>
            <span class="game-clock tnum" data-game-clock="${g.id}">${g.clock}</span>
          </span>
          <div class="gb-score">
            ${teamCol("home")}
            <div class="gb-numbers">
              <span class="gb-num tnum${lead === "home" ? " is-leading" : ""}">${g.home.score}</span>
              <span class="gb-dash">–</span>
              <span class="gb-num tnum${lead === "away" ? " is-leading" : ""}">${g.away.score}</span>
            </div>
            ${teamCol("away")}
          </div>
        </div>
        <p class="gb-league">${g.league.toUpperCase()} · Regular season</p>
      </div>
    </section>

    <section class="container markets" id="marketsSection">
      <div class="section-head center"><span class="eyebrow">Markets</span><h2>Back the lead</h2></div>
      ${marketsHTML}
    </section>
    </div>
    <div class="game-col-right">
    <a class="gb-back gb-back-right" href="home.html" aria-label="Back to games">${CHEVRON}<span>Games</span></a>

    <section class="container stats-section" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <div class="section-head center"><span class="eyebrow">Stats</span><h2>Inside the game</h2></div>
      <div class="stats-tabs" id="statsTabs" role="tablist" aria-label="Game statistics views">
        <button class="stats-tab is-active" type="button" role="tab" aria-selected="true" data-stats-tab="betting">Betting Stats</button>
        <button class="stats-tab" type="button" role="tab" aria-selected="false" data-stats-tab="game">Game Stats</button>
      </div>
      <div class="stats-panel" data-stats-panel="betting">
        <div class="chart-grid-wrap">${bettingStatsHTML}</div>
      </div>
      <div class="stats-panel" data-stats-panel="game" hidden>
        <div class="momentum-grid">${gameSummaryHTML}</div>
      </div>
    </section>
    </div>
    </div>`;

  initStickyBet();
  initStatsTabs();
}

/* ----------------------------------------------- BET DRAWER (two-step) */
const betState = { game: null, market: "gtl", contract: "yes", quantity: 100, step: 1, markets: {}, limit: null, limitOpen: false, typeOpen: false };
const money = (v) => `$${v.toFixed(2)}`;

function computeBet() {
  const mk = betState.markets[betState.market] || { yes: 50, no: 50 };
  const marketPrice = betState.contract === "yes" ? mk.yes : mk.no;
  const priceCents = betState.limit != null ? betState.limit : marketPrice;
  const qty = betState.quantity;
  const subtotal = (priceCents / 100) * qty;
  const fee = Math.max(0.01, subtotal * 0.02);
  const total = subtotal + fee;
  const payout = qty;
  const profit = Math.max(0, payout - subtotal);
  const net = Math.max(0, profit - fee);
  return { mk, marketPrice, priceCents, qty, subtotal, fee, total, payout, profit, net };
}

function fillScoreboard(sb, g) {
  if (!sb) return;
  const lead = leaderOf(g);
  sb.style.setProperty("--home-color", g.home.color);
  sb.style.setProperty("--away-color", g.away.color);
  const team = (side) => {
    const t = g[side];
    return `<div class="bs-team bs-${side}${lead === side ? " is-leading" : ""}">
        <img class="bs-logo" src="${t.logo}" alt="${t.name}" />
        <div class="bs-meta"><span class="bs-abbr">${t.abbr}</span><span class="bs-score tnum">${t.score}</span></div>
      </div>`;
  };
  sb.innerHTML = `<div class="bs-glow" aria-hidden="true"></div>
    <div class="bs-row">
      ${team("home")}
      <div class="bs-center"><span class="bs-period">${g.period}</span><span class="bs-clock tnum">${g.clock}</span></div>
      ${team("away")}
    </div>`;
}
function renderScoreboard(g) { fillScoreboard($("#betSheet")?.querySelector("[data-bet-grab]"), g); }

function ensureBetSheet() {
  let sheet = $("#betSheet");
  if (sheet) return sheet;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="bet-sheet-backdrop" id="betBackdrop" data-bet-close></div>
    <aside class="bet-sheet" id="betSheet" data-step="1" data-mode="buy" aria-hidden="true" aria-label="Place a bet">
      <div class="bet-scoreboard" data-bet-grab></div>
      <div class="bet-sheet-handle" aria-hidden="true"></div>

      <div class="bet-sheet-body">
        <div class="bet-step bet-step-1">
          <!-- SELL: position you hold -->
          <div class="sell-only sell-readout">
            <span class="sell-tag" data-sell-tag>—</span>
            <span class="sell-sub" data-sell-sub>—</span>
          </div>

          <!-- BUY: how many to buy -->
          <div class="bet-field contracts-field buy-only">
            <span class="bet-label">Select number of contracts</span>
            <input class="num-input" data-qty-input type="text" inputmode="numeric" value="100" aria-label="Number of contracts" />
            <div class="qty-quick">
              <button data-qty-set="50">50</button>
              <button data-qty-set="100">100</button>
              <button data-qty-set="500">500</button>
              <button data-qty-set="1000">1000</button>
            </div>
          </div>

          <!-- SELL: how many to sell -->
          <div class="bet-field contracts-field sell-only">
            <span class="bet-label">Contracts to sell</span>
            <input class="num-input" data-sell-qty-input type="text" inputmode="numeric" value="0" aria-label="Contracts to sell" />
            <div class="qty-quick q3" data-sell-quick>
              <button data-sell-pct="25">25%</button>
              <button data-sell-pct="50">50%</button>
              <button data-sell-pct="100">Max</button>
            </div>
          </div>

          <div class="bet-field buy-only">
            <span class="bet-label">Bet type</span>
            <div class="seg seg-3" role="group" aria-label="Bet type">
              <button data-market="gtl">GTL</button>
              <button data-market="tie">TIE</button>
              <button data-market="ktl">KTL</button>
            </div>
          </div>

          <div class="bet-field buy-only">
            <span class="bet-label">Pick a side</span>
            <div class="bet-toggle" data-active="yes" role="group" aria-label="Side">
              <button class="bt-opt yes" data-contract="yes"><span class="bt-side">Yes</span><span class="bt-price tnum" data-yes-price>—</span></button>
              <button class="bt-opt no" data-contract="no"><span class="bt-side">No</span><span class="bt-price tnum" data-no-price>—</span></button>
            </div>
            <button class="limit-toggle" data-limit-toggle aria-expanded="false">Set a Limit</button>
            <div class="limit-section" data-limit-section hidden>
              <span class="bet-label">Max limit price</span>
              <div class="num-input-box">
                <input class="num-input" data-limit-input type="text" inputmode="numeric" aria-label="Limit price in cents" />
                <span class="num-suffix">¢</span>
              </div>
              <p class="limit-minmax" data-limit-minmax></p>
            </div>
          </div>

          <div class="bet-highlight buy-only">
            <span class="bet-label">Purchase price</span>
            <span class="bet-total-big tnum" data-total-big>$0.00</span>
            <span class="bet-profit-line">Potential profit of <strong data-profit-big>$0.00</strong> after <a href="#" class="fees-link" data-fees-link>fees</a></span>
          </div>

          <!-- SELL: proceeds + realised P&L -->
          <div class="bet-highlight sell-only">
            <span class="bet-label">You receive</span>
            <span class="bet-total-big tnum" data-receive-big>$0.00</span>
            <span class="bet-profit-line" data-realized-line>Realised profit of <strong data-realized-big>$0.00</strong> after fees</span>
          </div>
        </div>

        <div class="bet-step bet-step-2">
          <div class="bet-field">
            <span class="bet-label">Order summary</span>
            <div class="summary">
              <div class="summary-row"><span>Contract price</span><strong data-s-price>—</strong></div>
              <div class="summary-row"><span>Contracts</span><strong data-s-qty>—</strong></div>
              <div class="summary-row"><span>Subtotal</span><strong data-s-subtotal>—</strong></div>
              <div class="summary-row"><span>Trading fee</span><strong data-s-fee>—</strong></div>
              <div class="summary-row total"><span>Total to pay</span><strong data-s-total>—</strong></div>
            </div>
          </div>
          <div class="bet-field">
            <span class="bet-label">Potential gain</span>
            <div class="summary">
              <div class="summary-row"><span>Potential payout</span><strong data-g-payout>—</strong></div>
              <div class="summary-row"><span>Potential profit</span><strong data-g-profit>—</strong></div>
              <div class="summary-row"><span>Fees</span><strong data-g-fees>—</strong></div>
              <div class="summary-row total"><span>Net potential gain</span><strong data-g-net>—</strong></div>
            </div>
          </div>
        </div>
      </div>

      <footer class="bet-sheet-footer">
        <button class="bet-secondary" data-breakdown>See Details</button>
        <button class="bet-secondary" data-bet-back>Back</button>
        <button class="btn btn-primary bet-primary" data-bet-primary>Quick Bet</button>
      </footer>

      <div class="bet-success">
        <div class="success-content">
          <div class="bet-success-head">
            <span class="bet-success-check">${CHECK_ICON}</span>
            <h3 class="bet-success-title" data-success-title>Bet placed!</h3>
            <p class="bet-success-sub" data-success-line>You're in the game.</p>
          </div>
          <div class="bet-field">
            <span class="bet-label">Order summary</span>
            <div class="summary">
              <div class="summary-row"><span>Contract price</span><strong data-sx-price>—</strong></div>
              <div class="summary-row"><span>Contracts</span><strong data-sx-qty>—</strong></div>
              <div class="summary-row"><span>Subtotal</span><strong data-sx-subtotal>—</strong></div>
              <div class="summary-row"><span>Trading fee</span><strong data-sx-fee>—</strong></div>
              <div class="summary-row total"><span data-sx-total-label>Total paid</span><strong data-sx-total>—</strong></div>
            </div>
          </div>
          <button class="bet-secondary cancel-bet" data-cancel-bet>Cancel Bet</button>
        </div>
        <button class="btn btn-primary success-close" data-success-close>Close</button>
      </div>
    </aside>
    <button class="btn btn-secondary bet-sheet-close" id="betClose" data-bet-close>Close</button>
  `);
  sheet = $("#betSheet");

  const qtyInput = sheet.querySelector("[data-qty-input]");
  const limitInput = sheet.querySelector("[data-limit-input]");

  $$("[data-bet-close]").forEach((el) => el.addEventListener("click", closeBetSheet));
  $$("[data-market]", sheet).forEach((b) => b.addEventListener("click", () => { betState.market = b.dataset.market; updateBetSheet(); }));
  $$("[data-contract]", sheet).forEach((b) => b.addEventListener("click", () => { betState.contract = b.dataset.contract; updateBetSheet(); }));
  $$("[data-qty-set]", sheet).forEach((b) => b.addEventListener("click", () => { betState.quantity = Number(b.dataset.qtySet); qtyInput.value = betState.quantity; updateBetSheet(); }));
  sheet.querySelector("[data-breakdown]").addEventListener("click", () => { betState.step = 2; updateBetSheet(); });
  sheet.querySelector("[data-bet-back]").addEventListener("click", () => { betState.step = 1; updateBetSheet(); });
  sheet.querySelector("[data-bet-primary]").addEventListener("click", placeBet);
  sheet.querySelector("[data-cancel-bet]").addEventListener("click", closeBetSheet);
  sheet.querySelector("[data-success-close]").addEventListener("click", closeBetSheet);
  sheet.querySelector("[data-fees-link]").addEventListener("click", (e) => { e.preventDefault(); goToFees(); });

  qtyInput.addEventListener("input", () => { const v = parseInt(qtyInput.value.replace(/[^0-9]/g, ""), 10); betState.quantity = v >= 1 ? v : 1; updateBetSheet(); });
  limitInput.addEventListener("input", () => {
    const mk = betState.markets[betState.market] || { yes: 50, no: 50 };
    const max = betState.contract === "yes" ? mk.yes : mk.no; // can't bid above the listed price
    let v = parseInt(limitInput.value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(v)) v = 0;
    if (v > max) { v = max; limitInput.value = max; }
    betState.limit = v >= 1 ? v : 1;
    updateBetSheet();
  });

  // Sell mode — contracts-to-sell input + quick percentages (capped at holding)
  const sellQtyInput = sheet.querySelector("[data-sell-qty-input]");
  sellQtyInput.addEventListener("input", () => {
    let v = parseInt(sellQtyInput.value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(v)) v = 0;
    v = Math.max(0, Math.min(betState.holding || 0, v));
    betState.sellQty = v; sellQtyInput.value = v; updateBetSheet();
  });
  sheet.querySelector("[data-sell-quick]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-sell-pct]");
    if (!b) return;
    betState.sellQty = Math.max(1, Math.round((betState.holding || 0) * Number(b.dataset.sellPct) / 100));
    sellQtyInput.value = betState.sellQty; updateBetSheet();
  });

  sheet.querySelector("[data-limit-toggle]").addEventListener("click", () => {
    betState.limitOpen = !betState.limitOpen;
    if (betState.limitOpen) {
      const mk = betState.markets[betState.market] || { yes: 50, no: 50 };
      betState.limit = betState.contract === "yes" ? mk.yes : mk.no; // start at the live price
      limitInput.value = betState.limit;
    } else {
      betState.limit = null;
    }
    updateBetSheet();
    const body = sheet.querySelector(".bet-sheet-body");
    requestAnimationFrame(() => {
      if (!body) return;
      body.scrollTo({ top: betState.limitOpen ? body.scrollHeight : 0, behavior: "smooth" });
    });
  });
  // Swipe the scoreboard down to close
  const grab = sheet.querySelector("[data-bet-grab]");
  let sStartY = 0, sDrag = false;
  grab.addEventListener("pointerdown", (e) => { if (window.matchMedia("(min-width: 768px)").matches) return; sDrag = true; sStartY = e.clientY; sheet.style.transition = "none"; grab.setPointerCapture(e.pointerId); });
  grab.addEventListener("pointermove", (e) => { if (!sDrag) return; const dy = Math.max(0, e.clientY - sStartY); sheet.style.transform = `translateY(${dy}px)`; });
  const sEnd = (e) => { if (!sDrag) return; sDrag = false; const dy = Math.max(0, (e.clientY || sStartY) - sStartY); sheet.style.transition = ""; sheet.style.transform = ""; if (dy > 110) closeBetSheet(); };
  grab.addEventListener("pointerup", sEnd);
  grab.addEventListener("pointercancel", sEnd);

  return sheet;
}

function updateBetSheet() {
  const sheet = ensureBetSheet();
  if (betState.limitOpen && betState.limit != null) {
    const mkNow = betState.markets[betState.market] || { yes: 50, no: 50 };
    const maxNow = betState.contract === "yes" ? mkNow.yes : mkNow.no;
    if (betState.limit > maxNow) { betState.limit = maxNow; const li = sheet.querySelector("[data-limit-input]"); if (li) li.value = maxNow; }
  }
  const { mk, marketPrice, priceCents, qty, subtotal, fee, total, payout, profit, net } = computeBet();

  sheet.setAttribute("data-step", betState.step);
  sheet.setAttribute("data-mode", betState.mode || "buy");
  sheet.classList.toggle("is-updating-price", !!betState.priceUpdating);
  sheet.querySelector("[data-yes-price]").textContent = `${mk.yes}¢`;
  sheet.querySelector("[data-no-price]").textContent = `${mk.no}¢`;

  $$("[data-market]", sheet).forEach((b) => b.classList.toggle("is-active", b.dataset.market === betState.market));
  $$("[data-contract]", sheet).forEach((b) => b.classList.toggle("is-active", b.dataset.contract === betState.contract));
  sheet.querySelector(".bet-toggle").dataset.active = betState.contract;
  $$("[data-qty-set]", sheet).forEach((b) => b.classList.toggle("is-active", Number(b.dataset.qtySet) === qty));

  // limit section
  const limitSection = sheet.querySelector("[data-limit-section]");
  const limitToggle = sheet.querySelector("[data-limit-toggle]");
  limitSection.hidden = !betState.limitOpen;
  limitToggle.textContent = betState.limitOpen ? "Hide Limit" : "Set a Limit";
  limitToggle.setAttribute("aria-expanded", betState.limitOpen ? "true" : "false");
  if (betState.limitOpen) {
    sheet.querySelector("[data-limit-minmax]").textContent = `Min 1¢ · Max ${marketPrice}¢`;
  }

  // highlight — total bet + green profit-after-fees
  sheet.querySelector("[data-total-big]").textContent = money(total);
  sheet.querySelector("[data-profit-big]").textContent = money(net);

  // see-details breakdown
  sheet.querySelector("[data-s-price]").textContent = `${priceCents}¢`;
  sheet.querySelector("[data-s-qty]").textContent = qty;
  sheet.querySelector("[data-s-subtotal]").textContent = money(subtotal);
  sheet.querySelector("[data-s-fee]").textContent = money(fee);
  sheet.querySelector("[data-s-total]").textContent = money(total);
  sheet.querySelector("[data-g-payout]").textContent = money(payout);
  sheet.querySelector("[data-g-profit]").textContent = money(profit);
  sheet.querySelector("[data-g-fees]").textContent = money(fee);
  sheet.querySelector("[data-g-net]").textContent = money(net);

  // Sell mode — position readout, quick-% active state, proceeds + realised P&L
  if (betState.mode === "sell") {
    const s = computeSell();
    sheet.querySelector("[data-sell-tag]").innerHTML = `${MARKET_LABELS[betState.market]} · <span class="side-${betState.contract}">${betState.contract.toUpperCase()}</span>`;
    sheet.querySelector("[data-sell-sub]").textContent = `${betState.holding} held · avg ${betState.avg}¢ · now ${s.priceCents}¢`;
    $$("[data-sell-pct]", sheet).forEach((b) => {
      const target = Math.max(1, Math.round(betState.holding * Number(b.dataset.sellPct) / 100));
      b.classList.toggle("is-active", target === s.qty);
    });
    sheet.querySelector("[data-receive-big]").textContent = money(s.proceeds);
    const rline = sheet.querySelector("[data-realized-line]");
    const win = s.realized >= 0;
    rline.classList.toggle("is-loss", !win);
    rline.innerHTML = `Realised ${win ? "profit" : "loss"} of <strong>${money(Math.abs(s.realized))}</strong> after fees`;
  }

  // Primary button label
  const primary = sheet.querySelector("[data-bet-primary]");
  if (primary) {
    primary.disabled = !!betState.priceUpdating;
    primary.textContent = betState.priceUpdating ? "Updating..." : (betState.mode === "sell" ? "Sell" : (betState.step === 2 ? "Place Bet" : "Quick Bet"));
  }
  $$("[data-contract]", sheet).forEach((b) => { b.disabled = !!betState.priceUpdating; });
  syncLimitSize();
}

// Size the limit input to its content so the ¢ suffix sits next to the number (centred)
function syncLimitSize() {
  const li = $("#betSheet")?.querySelector("[data-limit-input]");
  if (li) li.size = Math.max(1, String(li.value || "").length);
}

let betTicker = null;
let betPriceUpdateTimer = null;
function startBetTicker() {
  stopBetTicker();
  betTicker = setInterval(() => {
    const sheet = $("#betSheet");
    const mk = betState.markets[betState.market];
    if (!sheet || !mk || betState.priceUpdating) return;
    let yes = Math.max(5, Math.min(95, mk.yes + priceDelta()));
    beginBetPriceUpdate(yes);
  }, 10000);
}
function beginBetPriceUpdate(nextYes) {
  const sheet = $("#betSheet");
  const mk = betState.markets[betState.market];
  if (!sheet || !mk) return;
  betState.priceUpdating = true;
  betState.pendingYes = nextYes;
  updateBetSheet();
  betPriceUpdateTimer = setTimeout(() => {
    mk.yes = betState.pendingYes;
    mk.no = 100 - mk.yes;
    betState.priceUpdating = false;
    betState.pendingYes = null;
    updateBetSheet();
    ["[data-yes-price]", "[data-no-price]"].forEach((sel) => {
      const el = sheet.querySelector(sel);
      if (el) { el.classList.remove("blip"); void el.offsetWidth; el.classList.add("blip"); }
    });
  }, 1200);
}
function stopBetTicker() {
  if (betTicker) { clearInterval(betTicker); betTicker = null; }
  if (betPriceUpdateTimer) { clearTimeout(betPriceUpdateTimer); betPriceUpdateTimer = null; }
  betState.priceUpdating = false;
  betState.pendingYes = null;
}

function syncInputs() {
  const sheet = $("#betSheet");
  if (!sheet) return;
  sheet.querySelector("[data-qty-input]").value = betState.quantity;
  sheet.querySelector("[data-limit-input]").value = betState.limit != null ? betState.limit : "";
  syncLimitSize();
}

function openBetSheet(gameId, market, side, markets, opts = {}) {
  const g = GAMES.find((x) => x.id === gameId);
  if (!g) return;
  Object.assign(betState, {
    game: g, mode: opts.mode || "buy", market, contract: side, markets,
    quantity: opts.quantity || 100, step: 1, typeOpen: false,
    holding: 0, avg: 0, sellQty: 0,
    limit: opts.limit != null ? opts.limit : null,
    limitOpen: opts.limit != null,
    priceUpdating: false, pendingYes: null,
  });
  const sheet = ensureBetSheet();
  sheet.classList.remove("is-success");
  renderScoreboard(g);
  updateBetSheet();
  syncInputs();
  $("#betBackdrop").classList.add("is-open");
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
  startBetTicker();
}

const marketsFromGame = (g) => ({ gtl: { ...g.markets.gtl }, tie: { ...g.markets.tie }, ktl: { ...g.markets.ktl } });

// Buy more of an existing position — the standard buy drawer, prefilled
function openBuy(pos) {
  const g = GAMES.find((x) => x.id === pos.gameId);
  if (!g) return;
  openBetSheet(pos.gameId, pos.market, pos.side, marketsFromGame(g), { quantity: 100, mode: "buy" });
}

// Sell all or part of a holding at the live price
function openSell(pos) {
  const g = GAMES.find((x) => x.id === pos.gameId);
  if (!g) return;
  Object.assign(betState, {
    game: g, mode: "sell", market: pos.market, contract: pos.side, markets: marketsFromGame(g),
    holding: pos.qty, avg: pos.avg, sellQty: pos.qty,
    quantity: 100, step: 1, typeOpen: false, limit: null, limitOpen: false,
    priceUpdating: false, pendingYes: null,
  });
  const sheet = ensureBetSheet();
  sheet.classList.remove("is-success");
  renderScoreboard(g);
  updateBetSheet();
  const sq = sheet.querySelector("[data-sell-qty-input]");
  if (sq) sq.value = betState.sellQty;
  syncInputs();
  $("#betBackdrop").classList.add("is-open");
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
  startBetTicker();
}

function computeSell() {
  const mk = betState.markets[betState.market] || { yes: 50, no: 50 };
  const priceCents = betState.contract === "yes" ? mk.yes : mk.no;
  const qty = betState.sellQty || 0;
  const gross = (priceCents / 100) * qty;
  const fee = qty > 0 ? Math.max(0.01, gross * 0.02) : 0;
  const proceeds = Math.max(0, gross - fee);
  const cost = (betState.avg / 100) * qty;
  const realized = proceeds - cost;
  return { priceCents, qty, gross, fee, proceeds, cost, realized };
}

function closeBetSheet() {
  const sheet = $("#betSheet");
  if (!sheet) return;
  stopBetTicker();
  stopCancelTimer();
  $("#betBackdrop").classList.remove("is-open");
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
}

function placeBet() {
  if (betState.priceUpdating) return;
  if (betState.mode === "sell") return sellNow();
  const sheet = ensureBetSheet();
  const { priceCents, qty, subtotal, fee, total } = computeBet();
  sheet.querySelector("[data-success-title]").textContent = "Bet placed!";
  sheet.querySelector("[data-success-line]").textContent = `${qty} × ${MARKET_LABELS[betState.market]} ${betState.contract.toUpperCase()}`;
  sheet.querySelector("[data-sx-price]").textContent = `${priceCents}¢`;
  sheet.querySelector("[data-sx-qty]").textContent = qty;
  sheet.querySelector("[data-sx-subtotal]").textContent = money(subtotal);
  sheet.querySelector("[data-sx-fee]").textContent = money(fee);
  sheet.querySelector("[data-sx-total-label]").textContent = "Total paid";
  sheet.querySelector("[data-sx-total]").textContent = money(total);
  sheet.querySelector("[data-cancel-bet]").textContent = "Cancel Bet";
  sheet.classList.add("is-success");
  stopBetTicker();
  startCancelTimer();
}

function sellNow() {
  if (betState.priceUpdating) return;
  const sheet = ensureBetSheet();
  const s = computeSell();
  if (s.qty < 1) return;
  sheet.querySelector("[data-success-title]").textContent = "Sold!";
  sheet.querySelector("[data-success-line]").textContent = `${s.qty} × ${MARKET_LABELS[betState.market]} ${betState.contract.toUpperCase()} sold`;
  sheet.querySelector("[data-sx-price]").textContent = `${s.priceCents}¢`;
  sheet.querySelector("[data-sx-qty]").textContent = s.qty;
  sheet.querySelector("[data-sx-subtotal]").textContent = money(s.gross);
  sheet.querySelector("[data-sx-fee]").textContent = money(s.fee);
  sheet.querySelector("[data-sx-total-label]").textContent = "You received";
  sheet.querySelector("[data-sx-total]").textContent = money(s.proceeds);
  sheet.querySelector("[data-cancel-bet]").textContent = "Undo Sale";
  sheet.classList.add("is-success");
  stopBetTicker();
  startCancelTimer();
}

let cancelTimer = null;
function startCancelTimer() {
  stopCancelTimer();
  const btn = $("#betSheet")?.querySelector("[data-cancel-bet]");
  if (!btn) return;
  btn.classList.remove("draining");
  void btn.offsetWidth;
  btn.classList.add("draining"); // 10s left-to-right fill
  cancelTimer = setTimeout(closeBetSheet, 10000); // window over → close the drawer
}
function stopCancelTimer() { if (cancelTimer) { clearTimeout(cancelTimer); cancelTimer = null; } }

function goToFees() {
  const p = new URLSearchParams({ game: betState.game.id, market: betState.market, side: betState.contract, qty: betState.quantity });
  if (betState.limit != null) p.set("limit", betState.limit);
  location.href = "fees.html?" + p.toString();
}

/* ---------------------------------------------- AUTH GATE (guests betting) */
// Remember the bet a guest tried to place, so login/sign-up can resume it
const INTENT_KEY = "gtl-bet-intent";
function setBetIntent(o) { try { localStorage.setItem(INTENT_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } }
function clearBetIntent() { try { localStorage.removeItem(INTENT_KEY); } catch (e) { /* ignore */ } }
function postAuthDest() {
  let intent = null;
  try { intent = JSON.parse(localStorage.getItem(INTENT_KEY) || "null"); } catch (e) { /* ignore */ }
  clearBetIntent();
  if (intent && intent.id) {
    const p = new URLSearchParams({ id: intent.id, bet: "1", market: intent.market || "gtl", side: intent.side || "yes", qty: "100" });
    return "game.html?" + p.toString();
  }
  return "home.html";
}

function ensureAuthGate() {
  let gate = $("#authGate");
  if (gate) return gate;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="gate-backdrop" id="gateBackdrop"></div>
    <div class="auth-gate" id="authGate" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="gateTitle">
      <div class="gate-body">
        <h3 class="gate-title" id="gateTitle">You need an account to bet on the lead.</h3>
        <p class="gate-desc">Login below or create an account in less than a minute.</p>
        <div class="gate-actions">
          <a class="btn btn-secondary" href="login.html">Login</a>
          <a class="btn btn-primary" href="signup.html">Create Account</a>
        </div>
      </div>
    </div>
    <button class="btn btn-secondary gate-close" id="gateClose">Close</button>`);
  gate = $("#authGate");
  $("#gateBackdrop").addEventListener("click", closeAuthGate);
  $("#gateClose").addEventListener("click", closeAuthGate);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAuthGate(); });
  return gate;
}
function openAuthGate(gameId, market, side) {
  const g = GAMES.find((x) => x.id === gameId);
  if (!g) return;
  setBetIntent({ id: gameId, market: market || "gtl", side: side || "yes" });
  const gate = ensureAuthGate();
  $("#gateBackdrop").classList.add("is-open");
  gate.classList.add("is-open");
  $("#gateClose").classList.add("is-open");
  gate.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
}
function closeAuthGate() {
  const gate = $("#authGate");
  if (!gate) return;
  clearBetIntent(); // explicit dismiss = abandon the bet
  $("#gateBackdrop").classList.remove("is-open");
  gate.classList.remove("is-open");
  $("#gateClose").classList.remove("is-open");
  gate.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
}

function initBetSheet() {
  document.addEventListener("click", (e) => {
    const price = e.target.closest(".price");
    if (!price || !price.dataset.game) return;
    if (!isAuthed()) { openAuthGate(price.dataset.game, price.dataset.market, price.dataset.side); return; } // guests: contextual account prompt
    const grid = price.closest(".mkt-grid");
    const markets = {};
    grid.querySelectorAll(".price[data-market]").forEach((b) => {
      const m = b.dataset.market;
      markets[m] = markets[m] || {};
      markets[m][b.classList.contains("no") ? "no" : "yes"] = parseInt(b.textContent, 10);
    });
    openBetSheet(price.dataset.game, price.dataset.market, price.dataset.side, markets);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeBetSheet(); });
}

// Returning from the Fees page — reopen the drawer with the carried bet state
function maybeReopenBet() {
  if (!$("#gameMain")) return;
  const p = new URL(location.href).searchParams;
  if (p.get("bet") !== "1") return;
  const g = GAMES.find((x) => x.id === p.get("id"));
  if (!g) return;
  const markets = { gtl: { ...g.markets.gtl }, tie: { ...g.markets.tie }, ktl: { ...g.markets.ktl } };
  openBetSheet(g.id, p.get("market") || "gtl", p.get("side") || "yes", markets, {
    quantity: parseInt(p.get("qty"), 10) || 100,
    limit: p.get("limit") ? parseInt(p.get("limit"), 10) : null,
  });
}

// Fees page — populate the collapsed "continue bet" bar from the carried state
function initFeesPage() {
  const mini = $("#betMini");
  if (!mini) return;
  const p = new URL(location.href).searchParams;
  const g = GAMES.find((x) => x.id === p.get("game"));
  if (!g) return;
  const market = p.get("market") || "gtl";
  mini.style.setProperty("--home-color", g.home.color);
  mini.style.setProperty("--away-color", g.away.color);
  mini.querySelector("[data-mini-home]").src = g.home.logo;
  mini.querySelector("[data-mini-home]").alt = g.home.name;
  mini.querySelector("[data-mini-away]").src = g.away.logo;
  mini.querySelector("[data-mini-away]").alt = g.away.name;
  const back = new URLSearchParams({ id: g.id, bet: "1", market, side: p.get("side") || "yes", qty: p.get("qty") || "100" });
  if (p.get("limit")) back.set("limit", p.get("limit"));
  mini.href = "game.html?" + back.toString();
  mini.querySelector("[data-mini-label]").textContent = "Continue Bet";
  mini.hidden = false;
}

function initStickyBet() {
  const bar = $("#betBar");
  const grid = $(".markets .mkt-grid");
  const hero = $(".markets .mkt-row"); // first row = Get the Lead
  if (!bar || !hero) return;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => bar.classList.toggle("is-visible", !entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(hero);
  }
  bar.querySelector(".betbar-cta").addEventListener("click", () => {
    grid.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ---------------------------------------------------- USER (mock) + AUTH
   Prototype auth: a flag in localStorage marks the signed-in state; the
   positions/settled data below is the signed-in user's mock portfolio. */
const USER = {
  name: "Sam",
  balance: 248.5,
  positions: [
    { gameId: "kc-sf", market: "gtl", side: "yes", qty: 150, avg: 31 },
    { gameId: "den-dal", market: "gtl", side: "no", qty: 90, avg: 60 },
    { gameId: "ny-bos", market: "ktl", side: "yes", qty: 100, avg: 70 },
  ],
  settled: [
    { gameId: "buf-mia", market: "gtl", side: "yes", qty: 100, avg: 45, result: "win", net: 54.1, reopened: true },
    { gameId: "lal-gs", market: "ktl", side: "yes", qty: 60, avg: 55, result: "loss", net: -33 },
  ],
};

const AUTH_KEY = "gtl-auth";
function getAuth() { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch (e) { return null; } }
function isAuthed() { return !!getAuth(); }
function setAuth(user) { try { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); } catch (e) { /* ignore */ } }
function clearAuth() { try { localStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ } }
function currentName() { const a = getAuth(); return (a && a.name) || USER.name; }
function nameFromEmail(email) {
  if (!email) return USER.name;
  const local = String(email).split("@")[0].replace(/[._+-]+/g, " ").trim();
  if (!local) return USER.name;
  return local.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const signed = (v) => (v >= 0 ? "+" : "−") + "$" + Math.abs(v).toFixed(2);
function posFigures(p) {
  const g = GAMES.find((x) => x.id === p.gameId);
  const cur = g.markets[p.market][p.side];
  const value = (cur / 100) * p.qty;
  const cost = (p.avg / 100) * p.qty;
  return { g, cur, value, cost, pnl: value - cost };
}

/* --------------------------------------------------- POSITION / ORDER CARDS */
// Live-game media header (team-tinted, logos + scores; centre cell is caller-supplied)
function gameMedia(g, centerInner) {
  const lead = leaderOf(g);
  const team = (side) => {
    const t = g[side];
    return `<div class="team team-${side}${lead === side ? " is-leading" : ""}">
        <img class="team-logo" src="${t.logo}" alt="${t.name}" />
        <div class="team-meta"><span class="team-abbr">${t.abbr}</span><span class="team-score tnum">${t.score}</span></div>
      </div>`;
  };
  return `<div class="game-row">${team("home")}<div class="game-center">${centerInner || ""}</div>${team("away")}</div>`;
}
const clockCenter = (g) => `<span class="period">${g.period}</span><span class="clock tnum" data-game-clock="${g.id}">${g.clock}</span>`;

// Open-position card for the authed-home carousel. Three visual variants (i = 0/1/2) so the
// client can compare layouts. Clock ticks live except the last card (game at a Q3 break).
function positionCarouselCard(p, i) {
  const { g, value, cost, pnl } = posFigures(p);
  const up = pnl >= 0;
  const betType = `${MARKET_LABELS[p.market]} · <span class="side-${p.side}">${p.side.toUpperCase()}</span>`;
  const actions = `<div class="oc-actions">
        <button class="oc-buy" data-buy="${i}">Buy More</button>
        <button class="oc-sell" data-sell="${i}">Sell</button>
      </div>`;

  // Variant B (2nd card) — bet type styled like the game time, then a Contracts / Value / Return row
  if (i === 1) {
    return `<article class="pos-card pos-card--b" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <a class="pos-media" href="${gamePageHref(g)}" aria-label="Open ${g.away.abbr} at ${g.home.abbr}">${gameMedia(g, clockCenter(g))}</a>
      <div class="pos-info">
        <div class="ocb-type">${betType}</div>
        <div class="ocb-stats">
          <div class="ocb-stat"><span class="ocb-k">Contracts</span><span class="ocb-v tnum">${p.qty}</span></div>
          <div class="ocb-stat"><span class="ocb-k">Value</span><span class="ocb-v tnum">${money(value)}</span></div>
          <div class="ocb-stat"><span class="ocb-k">Return</span><span class="ocb-v tnum oc-pnl ${up ? "up" : "down"}">${signed(pnl)}</span></div>
        </div>
        ${actions}
      </div>
    </article>`;
  }

  // Variant C (3rd card) — creative: profit above a centre-anchored gain/loss bar; game at a quarter break (no clock)
  if (i === 2) {
    const mag = Math.min(1, cost ? Math.abs(pnl) / cost : 0); // magnitude vs cost basis
    const half = (mag * 50).toFixed(1);                        // half the bar = full gain/loss
    const fillStyle = up ? `left:50%;width:${half}%` : `right:50%;width:${half}%`;
    return `<article class="pos-card pos-card--c" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <a class="pos-media" href="${gamePageHref(g)}" aria-label="Open ${g.away.abbr} at ${g.home.abbr}">${gameMedia(g, `<span class="period qtime">3 Quarter Time</span>`)}</a>
      <div class="pos-info occ">
        <div class="occ-total tnum">${money(value)}</div>
        <div class="occ-bar ${up ? "up" : "down"}" aria-hidden="true">
          <span class="occ-bar-center"></span>
          <span class="occ-bar-fill ${up ? "up" : "down"}" style="${fillStyle}"></span>
        </div>
        <div class="occ-bottom">
          <span class="oc-tag occ-type">${betType}</span>
          <span class="occ-change ${up ? "up" : "down"} tnum">${signed(pnl)}</span>
        </div>
        ${actions}
      </div>
    </article>`;
  }

  // Variant A (default, 1st card) — position + value side by side
  return `<article class="pos-card" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="pos-media">${gameMedia(g, clockCenter(g))}</div>
    <div class="pos-info">
      <div class="oc-mid">
        <span class="oc-pos">
          <span class="oc-tag">${betType}</span>
          <span class="oc-sub">${p.qty} contracts</span>
        </span>
        <span class="oc-val">
          <span class="oc-amount tnum">${money(value)}</span>
          <span class="oc-pnl ${up ? "up" : "down"} tnum">${signed(pnl)}</span>
        </span>
      </div>
      ${actions}
    </div>
  </article>`;
}

function positionCardHTML(p, i) {
  const { g, value, pnl } = posFigures(p);
  const up = pnl >= 0;
  return `<article class="order-card" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="oc-top">
      <span class="oc-logos"><img src="${g.home.logo}" alt="" /><img src="${g.away.logo}" alt="" /></span>
      <span class="oc-match">
        <span class="oc-teams">${g.home.abbr} ${g.home.score} · ${g.away.score} ${g.away.abbr}</span>
        <span class="oc-meta"><span class="live-dot"></span>${g.league.toUpperCase()} · ${g.period} ${g.clock}</span>
      </span>
    </div>
    <div class="oc-mid">
      <span class="oc-pos">
        <span class="oc-tag">${MARKET_LABELS[p.market]} · <span class="side-${p.side}">${p.side.toUpperCase()}</span></span>
        <span class="oc-sub">${p.qty} contracts · avg ${p.avg}¢</span>
      </span>
      <span class="oc-val">
        <span class="oc-amount tnum">${money(value)}</span>
        <span class="oc-pnl ${up ? "up" : "down"} tnum">${signed(pnl)}</span>
      </span>
    </div>
    <div class="oc-actions">
      <button class="oc-buy" data-buy="${i}">Buy</button>
      <button class="oc-sell" data-sell="${i}">Sell</button>
    </div>
  </article>`;
}

function settledCardHTML(s) {
  const g = GAMES.find((x) => x.id === s.gameId);
  const win = s.result === "win";
  return `<article class="order-card settled" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="oc-top">
      <span class="oc-logos"><img src="${g.home.logo}" alt="" /><img src="${g.away.logo}" alt="" /></span>
      <span class="oc-match">
        <span class="oc-teams">${g.home.abbr} · ${g.away.abbr}</span>
        <span class="oc-meta">${g.league.toUpperCase()} · Final</span>
      </span>
      <span class="result-pill ${win ? "win" : "loss"}">${win ? "Won" : "Lost"}</span>
    </div>
    <div class="oc-mid">
      <span class="oc-pos">
        <span class="oc-tag">${MARKET_LABELS[s.market]} · <span class="side-${s.side}">${s.side.toUpperCase()}</span></span>
        <span class="oc-sub">${s.qty} contracts · avg ${s.avg}¢</span>
      </span>
      <span class="oc-val">
        <span class="oc-settled-pnl ${win ? "up" : "down"} tnum">${signed(s.net)}</span>
      </span>
    </div>
  </article>`;
}

function bindPositionActions(root) {
  if (!root) return;
  root.addEventListener("click", (e) => {
    const buy = e.target.closest("[data-buy]");
    const sell = e.target.closest("[data-sell]");
    if (buy) openBuy(USER.positions[Number(buy.dataset.buy)]);
    else if (sell) openSell(USER.positions[Number(sell.dataset.sell)]);
  });
}

/* ------------------------------------------------- AUTH-AWARE HEADER CHROME */
function applyAuthChrome() {
  const right = $("#headerAuth");
  const nav = $("#headerNav");
  const actions = $("#menuActions");
  const authed = isAuthed();
  document.body.classList.toggle("is-authed", authed);
  if (right) {
    // Wallet chip now lives above the home greeting; the header keeps the Open Positions chip (right) for cross-page access.
    right.innerHTML = authed ? "" : `<a class="btn header-login floating-btn" href="login.html">Login</a>`;
  }
  if (nav) {
    nav.innerHTML = navHTML(authed);
    const lo = nav.querySelector("[data-logout]");
    if (lo) lo.addEventListener("click", () => { clearAuth(); location.href = "home.html"; });
  }
  const positions = $("#headerPositions");
  if (positions) {
    const n = authed ? USER.positions.length : 0;
    if (n) {
      positions.innerHTML = `
        <button class="hpos-trigger" data-hpos-toggle aria-expanded="false" aria-haspopup="true" aria-controls="hposPanel" aria-label="${n} open positions">
          <span class="hpos-ico" aria-hidden="true">${POS_ICO}</span>
          <span class="hpos-num tnum">${n}</span>
          <span class="hpos-word">Open Positions</span>
          <span class="hpos-close">Close</span>
        </button>
        <div class="hpos-panel" id="hposPanel" role="menu" hidden>
          <div class="hpos-list">${USER.positions.map((p, i) => positionCardHTML(p, i)).join("")}</div>
        </div>`;
      bindPositionActions(positions.querySelector(".hpos-list"));
    } else {
      positions.innerHTML = "";
    }
  }
  if (actions) {
    if (isAuthed()) {
      actions.innerHTML = `<button class="btn btn-ghost btn-block menu-logout" data-logout>Logout</button>`;
      const lo = actions.querySelector("[data-logout]");
      if (lo) lo.addEventListener("click", () => { clearAuth(); location.href = "home.html"; });
    } else {
      actions.innerHTML = `<a class="btn btn-secondary btn-block" href="login.html">Login</a><a class="btn btn-primary btn-block" href="signup.html">Create Account</a>`;
    }
  }
}

/* -------------------------------------------------- AUTHENTICATED HOME HERO */
function renderAuthedHome() {
  const heroInner = $(".hero .hero-inner");
  if (!heroInner || !$("#gameGrid") || !isAuthed()) return;

  heroInner.classList.add("authed");
  heroInner.innerHTML = `
    <a class="wallet-chip floating-btn hero-wallet" href="wallet.html" aria-label="Wallet balance">${WALLET_ICO}<span class="wallet-amount tnum">${money(USER.balance)}</span></a>
    <div class="hero-greeting">
      <h1>Hey ${currentName()}</h1>
    </div>
    <div class="authed-stack">
      <div class="positions-block">
        <div class="positions-head"><span class="eyebrow">Open Positions</span></div>
        <div class="pos-carousel" id="positionList">${USER.positions.map((p, i) => positionCarouselCard(p, i)).join("")}</div>
        <div class="pos-footer">
          <a href="wallet.html">View All</a>
          <div class="pos-dots" id="posDots"></div>
          <a href="wallet.html#settled">View Settled</a>
        </div>
      </div>
      <a class="btn btn-primary authed-cta" href="#live">Live Games</a>
    </div>`;
  bindPositionActions($("#positionList"));
  initPositionsCarousel();
}

// Settled win — a banner that slides down over the header on any page (until dismissed)
function renderSettledToast() {
  if (!isAuthed()) return;
  const reopen = USER.settled.find((s) => s.reopened);
  if (!reopen) return;
  let dismissed = null;
  try { dismissed = sessionStorage.getItem("gtl-settled-dismissed"); } catch (e) { /* ignore */ }
  if (dismissed === reopen.gameId) return; // hidden only after the user taps Dismiss, and only for this session
  const g = GAMES.find((x) => x.id === reopen.gameId);
  if (!g) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="settled-toast" id="settledToast" role="status" aria-label="Settled bet — you won">
      <div class="settled-card" style="--home-color:${g.home.color};--away-color:${g.away.color}">
        <div class="pos-media">${gameMedia(g, `<span class="period">Settled</span><span class="sc-won">You Won</span>`)}</div>
        <div class="settled-body">
          <span class="settled-profit tnum">${signed(reopen.net)}</span>
          <div class="settled-actions">
            <button class="btn btn-secondary" data-settled-dismiss>Dismiss</button>
            <a class="btn btn-primary" href="${gamePageHref(g)}">Bet Again</a>
          </div>
        </div>
        <span class="settled-progress" aria-hidden="true"></span>
      </div>
    </div>`);
  const toast = $("#settledToast");
  let autoTimer = null;
  const hide = (persist) => {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    if (persist) { try { sessionStorage.setItem("gtl-settled-dismissed", reopen.gameId); } catch (e) { /* ignore */ } }
    toast.classList.remove("is-open");
    setTimeout(() => toast.remove(), 500);
  };
  toast.querySelector("[data-settled-dismiss]").addEventListener("click", () => hide(true)); // explicit dismiss = gone for the session
  setTimeout(() => {                          // let the page settle first, then slide in after 5s
    if (!document.body.contains(toast)) return;
    toast.classList.add("is-open");          // slide down + start the 10s progress fill
    autoTimer = setTimeout(() => hide(false), 10000); // auto-dismiss is transient — it returns on the next authed screen
  }, 5000);
}

function initPositionsCarousel() {
  const car = $("#positionList");
  const dots = $("#posDots");
  if (!car || !dots) return;
  const footer = car.closest(".positions-block")?.querySelector(".pos-footer");
  const cards = $$(".pos-card", car);

  // Dots + spread footer links only while the carousel actually scrolls. When every card
  // fits side by side (wide desktop), hide the dots and centre View All / View Settled.
  const syncOverflow = () => {
    const scrolls = cards.length > 1 && car.scrollWidth - car.clientWidth > 1;
    dots.hidden = !scrolls;
    footer?.classList.toggle("no-scroll", !scrolls);
  };

  if (cards.length > 1) {
    dots.innerHTML = cards.map((_, i) => `<button class="pos-dot${i === 0 ? " is-active" : ""}" data-dot="${i}" aria-label="Go to position ${i + 1}"></button>`).join("");
    const dotEls = $$(".pos-dot", dots);
    const setActive = (i) => dotEls.forEach((d, k) => d.classList.toggle("is-active", k === i));
    let raf = null;
    car.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const cRect = car.getBoundingClientRect();
        const center = cRect.left + cRect.width / 2;
        let best = 0, bd = Infinity;
        cards.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs((r.left + r.width / 2) - center); if (d < bd) { bd = d; best = i; } });
        setActive(best);
      });
    }, { passive: true });
    dots.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dot]");
      if (b) cards[Number(b.dataset.dot)].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  }

  // Measure via ResizeObserver so the check runs after layout settles (an immediate read
  // can see clientWidth 0 and wrongly think it overflows) and re-runs on any resize.
  if (window.ResizeObserver) {
    new ResizeObserver(syncOverflow).observe(car);
  } else {
    window.addEventListener("resize", syncOverflow, { passive: true });
  }
  syncOverflow();
}

/* ------------------------------------------------------------ WALLET PAGE */
function initWallet() {
  const main = $("#walletMain");
  if (!main) return;
  if (!isAuthed()) {
    main.innerHTML = `<div class="wallet-guard">
      <h1>Your wallet</h1>
      <p>Login to see your balance, add funds and manage your orders.</p>
      <a class="btn btn-primary" href="login.html">Login</a>
      <a class="link-green" href="signup.html">Create an Account</a>
    </div>`;
    return;
  }
  const openHTML = USER.positions.length
    ? USER.positions.map((p, i) => positionCardHTML(p, i)).join("")
    : `<div class="wallet-empty">No open positions yet.</div>`;
  const settledHTML = USER.settled.length
    ? USER.settled.map((s) => settledCardHTML(s)).join("")
    : `<div class="wallet-empty">No settled orders yet.</div>`;
  main.innerHTML = `
    <div class="wallet-title"><span class="eyebrow">Portfolio</span><h1>Hey ${currentName()}</h1></div>
    <section class="balance-card">
      <div><span class="balance-label">Available balance</span><div class="balance-amount tnum" data-balance>${money(USER.balance)}</div></div>
    </section>
    <section class="addfunds" hidden id="addFunds">
      <div class="addfunds-inner">
        <h3>Add Funds</h3>
        <div class="addfunds-quick" data-add-quick>
          <button data-add-amt="20">$20</button>
          <button data-add-amt="50">$50</button>
          <button data-add-amt="100">$100</button>
          <button data-add-amt="200">$200</button>
        </div>
        <div class="addfunds-amount"><span class="af-sign">$</span><input data-add-input type="text" inputmode="numeric" value="50" aria-label="Amount to add" /></div>
        <div class="addfunds-actions">
          <button class="btn btn-secondary" data-add-cancel>Cancel</button>
          <button class="btn btn-primary" data-add-confirm>Add Funds</button>
        </div>
        <p class="addfunds-note">Prototype — no real payment is taken.</p>
      </div>
    </section>
    <section class="wallet-section">
      <div class="wallet-section-head"><h2>Pending &amp; current orders</h2><span class="count">${USER.positions.length}</span></div>
      <div class="order-list" id="walletOpen">${openHTML}</div>
    </section>
    <section class="wallet-section" id="settled">
      <div class="wallet-section-head"><h2>Settled orders</h2><span class="count">${USER.settled.length}</span></div>
      <div class="order-list">${settledHTML}</div>
    </section>`;
  bindPositionActions($("#walletOpen"));
  initAddFunds();
}

function initAddFunds() {
  const panel = $("#addFunds");
  if (!panel) return;
  const input = panel.querySelector("[data-add-input]");
  const markActive = (v) => $$("[data-add-amt]", panel).forEach((b) => b.classList.toggle("is-active", Number(b.dataset.addAmt) === v));
  const setAmt = (v) => { input.value = v; markActive(v); };
  const addToggle = $("[data-add-toggle]");
  if (addToggle) addToggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) { setAmt(50); panel.scrollIntoView({ behavior: "smooth", block: "center" }); }
  });
  panel.querySelector("[data-add-quick]").addEventListener("click", (e) => { const b = e.target.closest("[data-add-amt]"); if (b) setAmt(Number(b.dataset.addAmt)); });
  input.addEventListener("input", () => markActive(parseInt(input.value.replace(/[^0-9]/g, ""), 10)));
  panel.querySelector("[data-add-cancel]").addEventListener("click", () => { panel.hidden = true; });
  panel.querySelector("[data-add-confirm]").addEventListener("click", () => {
    const v = parseInt(input.value.replace(/[^0-9]/g, ""), 10) || 0;
    if (v > 0) { USER.balance += v; $("[data-balance]").textContent = money(USER.balance); applyAuthChrome(); }
    panel.hidden = true;
  });
  setAmt(50);
}

/* ---------------------------------------------------------- AUTH SCREENS */
// Inline validation errors (shown in-app, not via native browser bubbles)
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
function showErr(input, msg) {
  input.classList.add("is-error");
  const field = input.closest(".field");
  if (!field) return;
  let el = field.querySelector(":scope > .field-error");
  if (!el) { el = document.createElement("p"); el.className = "field-error"; el.setAttribute("role", "alert"); field.appendChild(el); }
  el.textContent = msg;
}
function clearErr(input) {
  input.classList.remove("is-error");
  const field = input.closest(".field");
  const el = field && field.querySelector(":scope > .field-error");
  if (el) el.remove();
}
function clearErrsOnInput(form) { $$(".field-input", form).forEach((i) => i.addEventListener("input", () => clearErr(i))); }
function showCodeErr(wrap, msg) {
  wrap.classList.add("is-error");
  let el = wrap.nextElementSibling;
  if (!el || !el.classList.contains("field-error")) { el = document.createElement("p"); el.className = "field-error"; el.setAttribute("role", "alert"); wrap.insertAdjacentElement("afterend", el); }
  el.textContent = msg;
}
function clearCodeErr(wrap) {
  wrap.classList.remove("is-error");
  const el = wrap.nextElementSibling;
  if (el && el.classList.contains("field-error")) el.remove();
}

// Toast notifications — success / error
const TOAST_ICONS = {
  success: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v5.5M12 16.5h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
};
function showToast(msg, type = "success") {
  let stack = $(".toast-stack");
  if (!stack) { stack = document.createElement("div"); stack.className = "toast-stack"; document.body.appendChild(stack); }
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.setAttribute("role", type === "error" ? "alert" : "status");
  t.innerHTML = `<span class="toast-ico">${TOAST_ICONS[type] || TOAST_ICONS.success}</span><span class="toast-msg">${msg}</span>`;
  stack.appendChild(t);
  const remove = () => {
    t.classList.add("leaving");
    t.addEventListener("animationend", () => t.remove(), { once: true });
    setTimeout(() => t.remove(), 400);
  };
  setTimeout(remove, 3200);
}

function initPassToggles() {
  $$("[data-pass-toggle]").forEach((btn) => btn.addEventListener("click", () => {
    const input = btn.parentElement.querySelector("input");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.classList.toggle("is-shown", show);
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
  }));
}

// Social buttons on the login page sign straight in; sign-up handles its own
function initSocialButtons() {
  $$("[data-social]").forEach((b) => {
    if (b.closest("#signupSteps")) return;
    b.addEventListener("click", () => { setAuth({ name: USER.name }); location.href = postAuthDest(); });
  });
}

function initLogin() {
  const form = $("[data-login-form]");
  if (!form) return;
  const emailEl = form.querySelector("#email");
  const passEl = form.querySelector("#password");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErr(emailEl); clearErr(passEl);
    const email = emailEl.value.trim();
    let ok = true;
    if (!email) { showErr(emailEl, "Enter your email"); ok = false; }
    else if (!validEmail(email)) { showErr(emailEl, "Enter a valid email address"); ok = false; }
    if (!passEl.value) { showErr(passEl, "Enter your password"); ok = false; }
    if (!ok) return;
    setAuth({ name: nameFromEmail(email), email });
    location.href = postAuthDest();
  });
  clearErrsOnInput(form);
}

function initCodeInput(wrap) {
  wrap = wrap || $("[data-code-input]");
  if (!wrap) return;
  const boxes = $$(".code-box", wrap);
  boxes.forEach((box, i) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/[^0-9]/g, "").slice(0, 1);
      box.classList.toggle("is-filled", !!box.value);
      clearCodeErr(wrap);
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener("keydown", (e) => { if (e.key === "Backspace" && !box.value && i > 0) boxes[i - 1].focus(); });
    box.addEventListener("paste", (e) => {
      e.preventDefault();
      const digits = (e.clipboardData.getData("text") || "").replace(/[^0-9]/g, "").slice(0, boxes.length);
      digits.split("").forEach((d, k) => { boxes[k].value = d; boxes[k].classList.add("is-filled"); });
      if (digits.length) boxes[Math.min(digits.length, boxes.length) - 1].focus();
    });
  });
}

function initSignup() {
  const steps = $("#signupSteps");
  if (!steps) return;
  let email = "";
  const go = (n) => {
    steps.dataset.step = n;
    $$(".auth-progress span").forEach((d) => d.classList.toggle("is-done", Number(d.dataset.dot) <= n));
    const focusEl = steps.querySelector(`.auth-step[data-step="${n}"] input`);
    if (focusEl) setTimeout(() => focusEl.focus(), 80);
  };
  const f1 = steps.querySelector("[data-step1-form]");
  const emailEl = f1.querySelector("#email");
  f1.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErr(emailEl);
    email = emailEl.value.trim();
    if (!email) { showErr(emailEl, "Enter your email"); return; }
    if (!validEmail(email)) { showErr(emailEl, "Enter a valid email address"); return; }
    const tgt = steps.querySelector("[data-code-email]");
    if (tgt) tgt.textContent = email;
    go(2);
  });

  const f2 = steps.querySelector("[data-step2-form]");
  const p1 = f2.querySelector("#newpass");
  const p2 = f2.querySelector("#confirmpass");
  f2.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErr(p1); clearErr(p2);
    if (!p1.value) { showErr(p1, "Create a password"); return; }
    if (p1.value.length < 8) { showErr(p1, "Use at least 8 characters"); return; }
    if (!p2.value) { showErr(p2, "Re-enter your password to confirm"); return; }
    if (p1.value !== p2.value) { showErr(p2, "Passwords don't match"); return; }
    go(3);
  });

  const f3 = steps.querySelector("[data-step3-form]");
  const codeWrap = f3.querySelector("[data-code-input]");
  f3.addEventListener("submit", (e) => {
    e.preventDefault();
    clearCodeErr(codeWrap);
    const code = $$(".code-box", codeWrap).map((b) => b.value).join("");
    if (code.length < 6) { showCodeErr(codeWrap, "Enter the 6-digit code we sent you"); return; }
    setAuth({ name: nameFromEmail(email), email });
    location.href = postAuthDest();
  });

  $$("[data-step-back]", steps).forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.stepBack))));
  $$("[data-social]", steps).forEach((b) => b.addEventListener("click", () => { setAuth({ name: USER.name }); location.href = postAuthDest(); }));
  const resend = steps.querySelector("[data-resend]");
  if (resend) resend.addEventListener("click", () => showToast("Code resent — check your email", "success"));
  clearErrsOnInput(f1); clearErrsOnInput(f2);
  initCodeInput(codeWrap);
}

function initForgot() {
  const form = $("[data-forgot-form]");
  if (!form) return;
  const card = $("#forgotCard");
  const emailEl = form.querySelector("#email");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErr(emailEl);
    const email = emailEl.value.trim();
    if (!email) { showErr(emailEl, "Enter your email"); return; }
    if (!validEmail(email)) { showErr(emailEl, "Enter a valid email address"); return; }
    const tgt = card.querySelector("[data-sent-email]");
    if (tgt) tgt.textContent = email;
    card.classList.add("is-sent");
  });
  const resend = card.querySelector("[data-forgot-resend]");
  if (resend) resend.addEventListener("click", () => showToast("Reset link resent — check your email", "success"));
  clearErrsOnInput(form);
}

/* ------------------------------------------------------------- INIT */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  applyAuthChrome();
  renderSettledToast();
  renderTiles();
  renderAuthedHome();
  initExpanders();
  initLeagueFilter();
  initHeader();
  initTheme();
  initScrollTop();
  initTradingCounter();
  renderGamePage();
  initBetSheet();
  initFeesPage();
  initWallet();
  maybeReopenBet();
  // auth screens
  initPassToggles();
  initSocialButtons();
  initLogin();
  initSignup();
  initForgot();
  startPriceTicker(); // after home tiles and the game page have rendered their rows
  startClockTicker(); // tick the live game clocks
});
