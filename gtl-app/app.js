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
      { label: "Field Goal %", home: 46, away: 51 },
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
      { label: "Total Yards", home: 214, away: 186 },
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
      { label: "Field Goal %", home: 49, away: 47 },
      { label: "Rebounds", home: 41, away: 39 },
      { label: "Assists", home: 27, away: 22 },
      { label: "3PT %", home: 38, away: 36 },
      { label: "Turnovers", home: 9, away: 12 },
    ],
  },
  {
    id: "buf-mia", league: "nfl", clock: "11:05", period: "Q3", variant: 3,
    paused: { message: "Trading paused. Recalculating markets.", clears: true },
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: L + "nfl-buf.png" },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: L + "nfl-mia.png" },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 58, no: 42 } },
    stats: [
      { label: "Total Yards", home: 288, away: 264 },
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
      { label: "Field Goal %", home: 44, away: 48 },
      { label: "Rebounds", home: 29, away: 26 },
      { label: "Assists", home: 14, away: 17 },
      { label: "3PT %", home: 31, away: 39 },
      { label: "Turnovers", home: 7, away: 6 },
    ],
  },
  {
    id: "dal-phi", league: "nfl", clock: "02:14", period: "Q4", variant: 5,
    paused: { message: "Markets open when a team takes the lead.", clears: false },
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: L + "nfl-dal.png" },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: L + "nfl-phi.png" },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 64, no: 36 }, ktl: { yes: 50, no: 50 } },
    stats: [
      { label: "Total Yards", home: 341, away: 352 },
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
// The 3rd card (den-dal) opens an alternate design page (game-b.html) for experimentation.
const ALT_DESIGN_GAME_ID = "den-dal";
const gamePageHref = (g) => `${g.id === ALT_DESIGN_GAME_ID ? "game-b" : "game"}.html?id=${g.id}`;
// Game 1's detail page demos periodic market "recalculation" (paused banner → fresh prices).
const RECALC_DEMO_GAME_ID = "kc-sf";
// BUF/MIA's detail page demos existing open positions: simplified position cards float at the
// bottom of the page in a horizontal scroller, each collapsing to a Buy More / Sell toggle; the
// "View Bets" bar rises from behind the dock when it appears.
const OPEN_POSITION_DEMO_GAME_ID = "buf-mia";
const openPositionDemos = [
  { gameId: "buf-mia", market: "gtl", side: "yes", qty: 120, avg: 38 },
  { gameId: "buf-mia", market: "ktl", side: "no", qty: 80, avg: 52 },
  { gameId: "buf-mia", market: "tie", side: "no", qty: 60, avg: 74 },
];
// A game whose market has not opened yet (no team has taken the lead) — zero orders/positions,
// so the game page shows "–" prices and a blank order book / order flow. `clears:false` marks it
// permanent (vs. the temporary "recalculating" pause on other tiles).
const isMarketWaiting = (g) => !!(g && g.paused && g.paused.clears === false);

/* ----------------------------------------------- HOME: EXPANDABLE BETS */
// Paused status — sits in the See Bets toggle's slot when a game's markets aren't tradable.
// Games carry a `paused: { message, clears }` object; `clears` auto-reveals See Bets after ~8s.
const tradePauseHTML = (message) => `<div class="trade-pause" role="status"><span class="pause-dot"></span><span>${message}</span></div>`;

function betPanel(g) {
  const href = gamePageHref(g);
  const row = (label, sub, full, key) => `<div class="mkt-row">
      <button class="price yes" data-game="${g.id}" data-market="${key}" data-side="yes" aria-label="${full} Yes ${g.markets[key].yes} cents">${g.markets[key].yes}¢</button>
      <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
      <button class="price no" data-game="${g.id}" data-market="${key}" data-side="no" aria-label="${full} No ${g.markets[key].no} cents">${g.markets[key].no}¢</button>
    </div>`;
  return `<div class="mkt-grid">
      <div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>
      ${row("GTL", "Get the Lead", "Get the Lead", "gtl")}
      ${row("TIE", "", "Tie", "tie")}
      ${row("KTL", "Keep the Lead", "Keep the Lead", "ktl")}
    </div>
    <a class="view-game" href="${href}">View Game</a>`;
}

function footHTML(g) {
  // When paused, the status replaces the See Bets toggle; the tile stays collapsed.
  return `<div class="tile-foot">
      ${g.paused ? tradePauseHTML(g.paused.message) : ""}
      <button class="foot-toggle" data-expand aria-expanded="false">
        <span class="chev">${CHEVRON_DOWN}</span>
        <span class="toggle-label">See Bets</span>
        <span class="chev">${CHEVRON_DOWN}</span>
      </button>
      <div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${betPanel(g)}</div></div></div>
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
    const pausedCls = g.paused ? " is-paused" : "";
    const pauseClears = g.paused?.clears ? " data-pause-clears" : "";
    return `<article class="game-tile${pausedCls}" data-league="${g.league}"${pauseClears} style="--home-color:${g.home.color};--away-color:${g.away.color}">
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
    })
  );
}

// Auto-clearing paused tiles (e.g. "recalculating markets") show the status immediately, then
// ~8s later reveal See Bets with freshly recalculated prices. Persistent pauses (e.g. "markets
// open when a team takes the lead") have no data-pause-clears and stay until the game changes.
function initPausedDemo() {
  $$(".game-tile.is-paused[data-pause-clears]").forEach((tile) => {
    clearTimeout(tile._pauseTimer);
    tile._pauseTimer = setTimeout(() => {
      tile.classList.remove("is-paused");
      tile.querySelector(".trade-pause")?.remove();
      // markets recalculated — nudge the prices so they're fresh when the tile is opened
      $$(".mkt-row", tile).forEach((row) => {
        const yesEl = row.querySelector(".price.yes");
        const noEl = row.querySelector(".price.no");
        if (!yesEl || !noEl) return;
        const yes = Math.max(5, Math.min(95, parseInt(yesEl.textContent, 10) + priceDelta()));
        yesEl.textContent = `${yes}¢`;
        noEl.textContent = `${100 - yes}¢`;
      });
    }, 8000);
  });
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
const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const WARNING_ICON = '<svg class="warn-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.4 1.8 20.4h20.4L12 3.4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9.6v4.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.05" fill="currentColor"/></svg>';

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
            <span class="brand-word">GTL</span>
          </button>
          <span class="header-nav-slot" id="headerNav"></span>
        </span>
        <button class="theme-switch floating-btn" id="themeBtnHeader" data-theme-toggle aria-label="Switch colour theme">${THEME_SWITCH}</button>
      </div>
      <div class="header-right">
        <span class="header-auth" id="headerAuth"></span>
        <span class="header-wallet" id="headerWallet"></span>
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
  let posBackdrop = null;
  const ensurePosBackdrop = () => {
    if (!posBackdrop) {
      posBackdrop = document.createElement("div");
      posBackdrop.className = "hpos-backdrop";
      posBackdrop.addEventListener("click", () => closePos()); // tap the dim to dismiss
      document.body.appendChild(posBackdrop);
    }
    return posBackdrop;
  };
  const setPosOpen = (open) => {
    document.body.classList.toggle("pos-open", open); // mobile: lock the page behind
    ensurePosBackdrop().classList.toggle("is-open", open);
  };
  const closePos = () => {
    const p = $("#hposPanel");
    if (p) { p.setAttribute("hidden", ""); $("[data-hpos-toggle]")?.setAttribute("aria-expanded", "false"); }
    setPosOpen(false);
  };
  document.addEventListener("click", (e) => {
    const pnl = $("#hposPanel");
    if (!pnl) return;
    if (e.target.closest("[data-hpos-toggle]")) {
      e.stopPropagation();
      const willOpen = pnl.hasAttribute("hidden");
      pnl.toggleAttribute("hidden", !willOpen);
      $("[data-hpos-toggle]")?.setAttribute("aria-expanded", willOpen ? "true" : "false");
      setPosOpen(willOpen);
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
    if (row.closest("[data-recalc-managed]")) return; // the recalc cycle owns these rows (game 1)
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
  const waiting = isMarketWaiting(g);
  const yesTxt = waiting ? "–" : `${mk.yes}¢`;
  const noTxt = waiting ? "–" : `${mk.no}¢`;
  const dis = waiting ? " disabled" : "";
  return `<div class="mkt-row">
      <button class="price yes" data-game="${g.id}" data-market="${key}" data-side="yes"${dis} aria-label="${label} Yes ${waiting ? "unavailable" : mk.yes + " cents"}">${yesTxt}</button>
      <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
      <button class="price no" data-game="${g.id}" data-market="${key}" data-side="no"${dis} aria-label="${label} No ${waiting ? "unavailable" : mk.no + " cents"}">${noTxt}</button>
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
      label: "Lead Changes",
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

/* --- Polished chart renderer (used by both game.html and game-b.html) --- */
function seriesSmooth(value, variant, spread, n = 18) {
  return Array.from({ length: n }, (_, i) => {
    const wave = Math.sin((i + variant) * 0.55) * spread * 1.8 + Math.sin((i * 1.9 + variant) * 0.9) * spread * 0.7;
    return Math.max(3, Math.min(97, value + wave));
  });
}
function smoothLine(points, w, h, min = 0, max = 100) {
  const span = Math.max(1, max - min);
  const p = points.map((v, i) => [(i / Math.max(1, points.length - 1)) * w, h - ((v - min) / span) * h]);
  if (p.length < 2) return `M0 ${h}H${w}`;
  const t = 0.18;
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    const c1x = b[0] + (c[0] - a[0]) * t, c1y = b[1] + (c[1] - a[1]) * t;
    const c2x = c[0] - (e[0] - b[0]) * t, c2y = c[1] - (e[1] - b[1]) * t;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  return d;
}
function chartGridPath(w, h) {
  const parts = [];
  [0.25, 0.5, 0.75].forEach((f) => parts.push(`M0 ${(h * f).toFixed(1)}H${w}`));
  [0.2, 0.4, 0.6, 0.8].forEach((f) => parts.push(`M${(w * f).toFixed(1)} 0V${h}`));
  return parts.join(" ");
}
function proLineChart(id, w, h, series, color, opts = {}) {
  const { min = 0, max = 100, fill = 0.3, second = null, secondColor = "var(--ink-3)" } = opts;
  const line = smoothLine(series, w, h, min, max);
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return `
    <svg class="line-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="cf-${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:${color};stop-opacity:${fill}"></stop>
          <stop offset="0.92" style="stop-color:${color};stop-opacity:0"></stop>
        </linearGradient>
      </defs>
      <path class="chart-grid" d="${chartGridPath(w, h)}"></path>
      <path class="chart-fill" d="${area}" fill="url(#cf-${id})"></path>
      ${second ? `<path class="chart-line chart-line--ghost" d="${smoothLine(second, w, h, min, max)}" style="color:${secondColor}"></path>` : ""}
      <path class="chart-line" d="${line}" style="color:${color}"></path>
    </svg>`;
}
/* --- Betting-stats data (synthetic prototype: order book, order flow, bets) --- */
function orderBook(g) {
  const mid = g.markets.gtl.yes;
  const bid = Math.max(2, mid - 1), ask = Math.min(98, mid + 1);
  const size = (dist, seed) => Math.round((1500 - dist * 300) * (0.85 + ((g.variant + seed) % 4) * 0.12));
  const asks = [3, 2, 1, 0].map((d) => ({ price: Math.min(99, ask + d), size: size(d, d) }));      // highest ask at top → best ask by the spread
  const bids = [0, 1, 2, 3].map((d) => ({ price: Math.max(1, bid - d), size: size(d, d + 2) }));    // best bid by the spread → down
  const maxSize = Math.max(...asks.map((a) => a.size), ...bids.map((b) => b.size));
  return { bid, ask, spread: ask - bid, asks, bids, maxSize };
}
function betFlow(g) {
  const labels = ["Q1", "Q2", "Q3", "Q4"];
  const vals = labels.map((_, i) => Math.round((34 + ((g.variant * 7 + i * 13) % 46)) * (1 + i * 0.16)));
  const max = Math.max(...vals);
  return { total: vals.reduce((s, v) => s + v, 0), buckets: labels.map((label, i) => ({ label, val: vals[i], pct: Math.round((vals[i] / max) * 100) })) };
}
function recentBets(g) {
  const mkts = ["GTL", "TIE", "KTL"];
  const times = ["11:58", "10:42", "09:15", "08:03", "06:37"];
  return times.map((t, i) => ({
    t, m: mkts[(g.variant + i) % 3],
    side: (g.variant + i) % 2 ? "Yes" : "No",
    price: Math.max(5, Math.min(95, g.markets.gtl.yes + (i % 2 ? -1 : 1) * (2 + i))),
    size: 50 * (1 + ((g.variant + i) % 6)),
  }));
}
// Score differential (home − away) over the game; crosses zero on each lead change/tie.
// Score margin (home − away) over the game as discrete steps; returns the series
// plus the x-fractions where the lead changed (sign flips / ties) to highlight.
function scoreWorm(g) {
  const finalDiff = g.home.score - g.away.score;
  const n = 16, amp = Math.max(7, Math.abs(finalDiff) + 6);
  const series = Array.from({ length: n }, (_, i) => {
    const tt = i / (n - 1);
    return Math.round(Math.sin(tt * Math.PI * (2 + (g.variant % 3))) * amp * (1 - tt * 0.3) + finalDiff * tt);
  });
  series[0] = 0;                 // game opens 0–0
  series[n - 1] = finalDiff;     // ends at the live margin
  const crossings = [];
  for (let i = 1; i < n; i++) {
    const a = series[i - 1], b = series[i];
    if ((a > 0 && b <= 0) || (a < 0 && b >= 0)) crossings.push(i / (n - 1)); // lead swapped / levelled
  }
  const maxAbs = Math.max(6, ...series.map((v) => Math.abs(v)));
  return { series, crossings, changes: crossings.length, maxAbs, n };
}
// Stepped path: the value holds flat, then steps at the next point (score-worm look).
function stepPath(points, w, h, min, max) {
  const span = Math.max(1, max - min);
  const xy = points.map((v, i) => [(i / Math.max(1, points.length - 1)) * w, h - ((v - min) / span) * h]);
  let d = `M${xy[0][0].toFixed(1)} ${xy[0][1].toFixed(1)}`;
  for (let i = 1; i < xy.length; i++) d += ` H${xy[i][0].toFixed(1)} V${xy[i][1].toFixed(1)}`;
  return d;
}
function scoreWormChart(g, worm) {
  const w = 280, h = 132;
  const line = stepPath(worm.series, w, h, -worm.maxAbs, worm.maxAbs); // symmetric → zero is the centre
  const scale = Math.ceil(worm.maxAbs / 5) * 5;
  const marks = worm.crossings.map((f) => `<span class="worm-mark" style="left:${(f * 100).toFixed(1)}%"></span>`).join("");
  return `
    <div class="worm-wrap">
      <div class="worm-quarters" aria-hidden="true"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
      <div class="worm-axis" aria-hidden="true"><span>+${scale}</span><span>0</span><span>−${scale}</span></div>
      ${marks}
      <svg class="worm-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Score margin over the game, ${worm.changes} lead changes">
        <defs>
          <linearGradient id="wg-${g.id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${h}">
            <stop offset="0" stop-color="${g.home.color}"></stop>
            <stop offset="0.5" stop-color="${g.home.color}"></stop>
            <stop offset="0.5" stop-color="${g.away.color}"></stop>
            <stop offset="1" stop-color="${g.away.color}"></stop>
          </linearGradient>
        </defs>
        <line class="worm-zero" x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}"></line>
        <path class="worm-line" d="${line}" style="stroke:url(#wg-${g.id})"></path>
      </svg>
    </div>`;
}
// Betting Stats panel — market book (was bid/ask) + order flow with a bets table.
function bettingChartsPro(g) {
  // Market not open yet (no lead / zero positions) — blank order book + order flow.
  if (isMarketWaiting(g)) {
    const emptyRow = `<div class="book-row"><span class="book-price tnum">--</span><span class="book-size tnum">0</span></div>`;
    return `
    <div class="chart-card">
      <div class="chart-head"><span>Market Book</span><strong class="tnum">0¢ / 0¢</strong></div>
      <div class="book is-empty">
        <div class="book-side">${Array.from({ length: 4 }, () => emptyRow).join("")}</div>
        <div class="book-spread"><span>Spread</span><strong class="tnum">--</strong></div>
        <div class="book-side">${Array.from({ length: 4 }, () => emptyRow).join("")}</div>
      </div>
      <p class="market-empty-note">No orders yet. Markets open when a team takes the lead.</p>
    </div>
    <div class="chart-card">
      <div class="chart-head"><span>Order Flow</span><strong class="tnum">0 bets</strong></div>
      <div class="flow-bars is-empty">${["Q1", "Q2", "Q3", "Q4"].map(() => `<span class="flow-bar" style="height:6%"><em class="flow-cap tnum">0</em></span>`).join("")}</div>
      <div class="flow-axis">${["Q1", "Q2", "Q3", "Q4"].map((l) => `<span>${l}</span>`).join("")}</div>
      <table class="bets-table">
        <thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead>
        <tbody><tr><td colspan="5" class="empty-row">No trades yet</td></tr></tbody>
      </table>
    </div>`;
  }
  const book = orderBook(g);
  const flow = betFlow(g);
  const bets = recentBets(g);
  const bookRow = (l, side) => `<div class="book-row book-${side}">
      <span class="book-depth"><span class="book-depth-fill" style="width:${Math.round((l.size / book.maxSize) * 100)}%"></span></span>
      <span class="book-price tnum">${l.price}¢</span>
      <span class="book-size tnum">${l.size.toLocaleString("en-US")}</span>
    </div>`;
  return `
    <div class="chart-card">
      <div class="chart-head"><span>Market Book</span><strong class="tnum">${book.bid}¢ / ${book.ask}¢</strong></div>
      <div class="book">
        <div class="book-side">${book.asks.map((l) => bookRow(l, "ask")).join("")}</div>
        <div class="book-spread"><span>Spread</span><strong class="tnum">${book.spread}¢</strong></div>
        <div class="book-side">${book.bids.map((l) => bookRow(l, "bid")).join("")}</div>
      </div>
    </div>
    <div class="chart-card">
      <div class="chart-head"><span>Order Flow</span><strong class="tnum">${flow.total} bets</strong></div>
      <div class="flow-bars">${flow.buckets.map((b) => `<span class="flow-bar" style="height:${Math.max(6, b.pct)}%"><em class="flow-cap tnum">${b.val}</em></span>`).join("")}</div>
      <div class="flow-axis">${flow.buckets.map((b) => `<span>${b.label}</span>`).join("")}</div>
      <table class="bets-table">
        <thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead>
        <tbody>${bets.map((b) => `<tr>
          <td class="tnum">${b.t}</td>
          <td>${b.m}</td>
          <td><span class="side-${b.side.toLowerCase()}">${b.side}</span></td>
          <td class="num tnum">${b.price}¢</td>
          <td class="num tnum">${b.size}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>`;
}
// Game Stats panel — combined score-worm card (lead changes + ties) then the
// three NFL stats most tied to lead changes (turnovers, possession, yards).
function gameMomentumCardsPro(g) {
  const worm = scoreWorm(g);
  const waiting = isMarketWaiting(g);
  if (waiting) {
    // Market not open yet — flat worm at zero, with no lead changes or ties.
    worm.changes = 0;
    worm.crossings = [];
    worm.series = Array.from({ length: worm.n }, () => 0);
    worm.maxAbs = 6;
  }
  const ties = waiting ? 0 : gameMomentumStats(g)[0].value;
  const order = ["Turnovers", "Possession %", "Total Yards"];
  let picks = order.map((lbl) => g.stats.find((s) => s.label === lbl)).filter(Boolean);
  if (picks.length < 3) picks = g.stats.slice(0, 3);
  // Centre-anchored bars: each team grows from the middle toward its own side (home
  // left, away right), scaled so the leader of that stat reaches the edge.
  const statRow = (s) => {
    const maxB = Math.max(s.home, s.away) || 1;
    return `<div class="stat-block">
      <div class="stat-caption"><span class="stat-val tnum">${s.home}</span><span class="stat-label">${s.label}</span><span class="stat-val tnum">${s.away}</span></div>
      <div class="stat-bar-c">
        <span class="stat-fill-h" style="width:${((s.home / maxB) * 50).toFixed(1)}%"></span>
        <span class="stat-fill-a" style="width:${((s.away / maxB) * 50).toFixed(1)}%"></span>
      </div>
    </div>`;
  };
  return `
    <div class="momentum-card worm-card">
      <div class="momentum-head"><span>Score Worm</span></div>
      <div class="worm-legend"><span class="worm-key"><i style="background:${g.home.color}"></i>${g.home.abbr} ahead</span><span class="worm-key"><i style="background:${g.away.color}"></i>${g.away.abbr} ahead</span></div>
      ${scoreWormChart(g, worm)}
      <div class="worm-stats">
        <div class="worm-stat"><strong class="tnum">${worm.changes}</strong><span>Lead Changes</span></div>
        <div class="worm-stat"><strong class="tnum">${ties}</strong><span>Ties</span></div>
      </div>
    </div>
    <div class="momentum-card stats-card">
      <div class="stats-teams"><img class="stats-logo" src="${g.home.logo}" alt="${g.home.name}"><span class="stats-title">Game Stats</span><img class="stats-logo" src="${g.away.logo}" alt="${g.away.name}"></div>
      <div class="stat-list">${picks.map(statRow).join("")}</div>
    </div>`;
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

// The game-page back link mirrors where the user arrived from (Home / Portfolio); falls back to Home.
function gameBackTarget() {
  try {
    const ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === location.origin) {
      const labels = { "home.html": "Home", "wallet.html": "Portfolio" };
      const label = labels[ref.pathname.split("/").pop()];
      if (label) return { label, href: ref.href };
    }
  } catch (e) { /* ignore */ }
  return { label: "Home", href: "home.html" };
}

function renderGamePage() {
  const main = $("#gameMain");
  if (!main) return;
  const id = new URL(location.href).searchParams.get("id") || GAMES[0].id;
  const g = GAMES.find((x) => x.id === id) || GAMES[0];
  document.title = `${g.away.abbr} @ ${g.home.abbr} — GTL`;
  const lead = leaderOf(g);
  const back = gameBackTarget();

  const teamCol = (side) => {
    const t = g[side];
    const leading = lead === side ? " is-leading" : "";
    return `<div class="gb-team${leading}"><img class="gb-logo" src="${t.logo}" alt="${t.name}" /><span class="gb-abbr">${t.abbr}</span></div>`;
  };

  const marketsHTML = `
    <div class="mkt-grid">
      <div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>
      ${marketRow(g, "GTL", "Get the Lead", "gtl")}
      ${marketRow(g, "TIE", "", "tie")}
      ${marketRow(g, "KTL", "Keep the Lead", "ktl")}
    </div>
    <p class="bet-help">Tap a price to start your bet · Prices updated every 10 seconds</p>`;

  const bettingStatsHTML = bettingChartsPro(g);
  const gameSummaryHTML = gameMomentumCardsPro(g);

  // Stats (right column on desktop): a tabbed toggle between Betting Stats and Game Stats.
  const statsHTML = `<section class="container stats-section" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <div class="section-head center stats-overall-head"><span class="eyebrow">Stats</span><h2>Inside the game</h2></div>
      <div class="stats-tabs" id="statsTabs" role="tablist" aria-label="Game statistics views">
        <button class="stats-tab is-active" type="button" role="tab" aria-selected="true" data-stats-tab="betting">Market Stats</button>
        <button class="stats-tab" type="button" role="tab" aria-selected="false" data-stats-tab="game">Game Stats</button>
      </div>
      <div class="stats-panel" data-stats-panel="betting">
        <h3 class="stats-section-label">Market Stats</h3>
        <div class="chart-grid-wrap">${bettingStatsHTML}</div>
      </div>
      <div class="stats-panel" data-stats-panel="game" hidden>
        <h3 class="stats-section-label">Game Stats</h3>
        <div class="momentum-grid">${gameSummaryHTML}</div>
      </div>
    </section>`;

  main.innerHTML = `
    <div class="game-layout" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="game-col-left" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <a class="gb-back gb-back-right" href="${back.href}" aria-label="Back to ${back.label}">${CHEVRON}<span>${back.label}</span></a>
    <section class="gb" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <div class="gb-glow" aria-hidden="true"></div>
      <div class="container gb-inner">
        <div class="gb-topbar">
          <a class="gb-back" href="${back.href}" aria-label="Back to ${back.label}">${CHEVRON}<span>${back.label}</span></a>
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

    <section class="container markets" id="marketsSection"${g.id === RECALC_DEMO_GAME_ID ? " data-recalc-managed" : ""}>
      ${g.id === RECALC_DEMO_GAME_ID ? `<div class="game-recalc" data-game-recalc hidden><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div>` : ""}
      ${isMarketWaiting(g) ? `<div class="game-recalc"><span class="pause-dot"></span><span>Markets open when a team takes the lead.</span></div>` : ""}
      ${marketsHTML}
    </section>
    ${g.id === OPEN_POSITION_DEMO_GAME_ID ? gameOpenPositionHTML(openPositionDemos) : ""}
    </div>
    <div class="game-col-right">
    ${statsHTML}
    </div>
    </div>`;

  initStickyBet();
  initStatsTabs();
  initGameRecalc();
  if (g.id === OPEN_POSITION_DEMO_GAME_ID) initGameOpenPosition(openPositionDemos);
}

// The Open Positions card set for the HEADER dropdown — variant A for each, B for the last.
const openPositionCards = (list) => list.map((p, i) => (i === list.length - 1 ? positionCardB(p, i) : positionCardA(p, i))).join("");

// The game pop-up's own card: the variant-B body (bet type centred, then Contracts / Value /
// Return as three columns) but WITHOUT the scoreboard — redundant on the game's own page.
// The tinted card background is kept.
function gopPositionCard(p, i) {
  const { g, value, pnl } = posFigures(p);
  const up = pnl >= 0;
  const betType = `${MARKET_LABELS[p.market]} · <span class="side-${p.side}">${p.side.toUpperCase()}</span>`;
  return `<article class="pos-card pos-card--b" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="pos-info">
      <div class="ocb-type">${betType}</div>
      <div class="ocb-stats">
        <div class="ocb-stat"><span class="ocb-k">Contracts</span><span class="ocb-v tnum">${p.qty}</span></div>
        <div class="ocb-stat"><span class="ocb-k">Value</span><span class="ocb-v tnum">${money(value)}</span></div>
        <div class="ocb-stat"><span class="ocb-k">Return</span><span class="ocb-v tnum oc-pnl ${up ? "up" : "down"}">${signed(pnl)}</span></div>
      </div>
      ${posActions(i)}
    </div>
  </article>`;
}

function gameOpenPositionHTML(list) {
  // The dock is a single "N Game Positions" button injected into the bottom bar
  // (see initGameOpenPosition). This markup is the pop-up panel that button reveals,
  // plus its dim/blur backdrop. On desktop the panel sits inline in the left column.
  return `
    <div class="game-open-position" id="gameOpenPosition" role="region" aria-label="Your open positions in this game">
      <div class="gop-backdrop" data-gop-backdrop></div>
      <div class="gop-pop" id="gopPop">
        <p class="gop-heading">Game Open Positions</p>
        <div class="hpos-list">${list.map((p, i) => gopPositionCard(p, i)).join("")}</div>
      </div>
    </div>`;
}

function initGameOpenPosition(list) {
  const wrap = $("#gameOpenPosition");
  if (!wrap) return;
  document.body.classList.add("has-open-position");

  // Inject the "N Game Positions" toggle into the bottom bar so it shares the row with
  // "View Bets" (same primary-button style). CSS drops the word "Game" to "N Positions"
  // when View Bets slides in (keyed off .betbar.is-visible).
  const barInner = $("#betBar .betbar-inner");
  let trigger = barInner ? barInner.querySelector(".gop-trigger") : null;
  if (barInner && !trigger) {
    trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "btn btn-primary gop-trigger";
    trigger.setAttribute("data-gop-toggle", "");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "gopPop");
    trigger.innerHTML = `<span class="gop-open-label">Hide</span><span class="gop-closed-label"><span class="gop-num">${list.length}</span><span class="gop-game"> Game</span> Positions</span>`;
    barInner.insertBefore(trigger, barInner.firstChild);
  }

  const setOpen = (open) => {
    document.body.classList.toggle("gop-open", open);
    if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
  };
  const closeGop = () => setOpen(false);

  // Toggle the popup; dismiss on a tap outside it (backdrop / dimmed page) or Escape.
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-gop-toggle]")) {
      setOpen(!document.body.classList.contains("gop-open"));
    } else if (document.body.classList.contains("gop-open") && !e.target.closest("#gopPop") && !e.target.closest("#betBar")) {
      closeGop();
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeGop(); });

  // Buy More / Sell inside a card open the drawer for that game position (data-buy/-sell
  // index into this game's positions, not USER.positions — so we bind here, not bindPositionActions).
  const pop = $("#gopPop");
  if (pop) pop.addEventListener("click", (e) => {
    const buy = e.target.closest("[data-buy]");
    const sell = e.target.closest("[data-sell]");
    if (buy) { closeGop(); openBuy(list[Number(buy.dataset.buy)]); }
    else if (sell) { closeGop(); openSell(list[Number(sell.dataset.sell)]); }
  });

  // Publish the bar height so the popup sits just above it (updates if it reflows).
  const bar = $("#betBar");
  const syncBar = () => { if (bar) document.documentElement.style.setProperty("--gop-bar-h", `${bar.offsetHeight}px`); };
  syncBar();
  if ("ResizeObserver" in window && bar) new ResizeObserver(syncBar).observe(bar);
  window.addEventListener("resize", syncBar);
}
// Rebuild the game's position cards (e.g. after Buy More adds contracts).
function refreshGameOpenPosition() {
  const listEl = $("#gopPop .hpos-list");
  if (listEl) listEl.innerHTML = openPositionDemos.map((p, i) => gopPositionCard(p, i)).join("");
}

// Game 1's detail page: every ~9s the market "recalculates" — the recalculating
// banner appears (between "Back the lead" and the Yes/No header) and the prices
// lock, then ~1.6s later the freshly nudged prices are revealed. Only the
// recalc-managed section (game 1) does this; startPriceTicker leaves it alone.
function initGameRecalc() {
  const section = $("#marketsSection[data-recalc-managed]");
  const banner = section && $("[data-game-recalc]", section);
  if (!section || !banner) return;
  const rows = $$(".mkt-row", section);
  const prices = $$(".price", section);
  let busy = false;
  setInterval(() => {
    if (busy || document.hidden) return;
    busy = true;
    banner.hidden = false;                          // "Trading paused. Recalculating markets."
    section.classList.add("is-recalc");
    prices.forEach((p) => { p.disabled = true; });  // lock betting while recalculating
    setTimeout(() => {
      rows.forEach((row) => {                       // reveal the recalculated prices
        const yesEl = row.querySelector(".price.yes");
        const noEl = row.querySelector(".price.no");
        if (!yesEl || !noEl) return;
        const yes = Math.max(5, Math.min(95, parseInt(yesEl.textContent, 10) + priceDelta()));
        yesEl.textContent = `${yes}¢`;
        noEl.textContent = `${100 - yes}¢`;
        [yesEl, noEl].forEach((el) => { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); });
      });
      banner.hidden = true;
      section.classList.remove("is-recalc");
      prices.forEach((p) => { p.disabled = false; });
      busy = false;
    }, 1600);
  }, 9000);
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

          <!-- BUY: warns when this bet takes the opposite side of a position already held in this game -->
          <div class="bet-conflict buy-only" data-conflict-warning role="alert" hidden></div>

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
            <p class="qty-total" data-qty-total hidden></p>
          </div>

          <!-- SELL: how many to sell -->
          <div class="bet-field contracts-field sell-only">
            <span class="bet-label">Contracts to sell</span>
            <input class="num-input" data-sell-qty-input type="text" inputmode="numeric" value="0" aria-label="Contracts to sell" />
            <div class="qty-quick q3" data-sell-quick>
              <button data-sell-pct="25">25%</button>
              <button data-sell-pct="50">50%</button>
              <button data-sell-pct="100">All</button>
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
            <p class="potential-win">Potential profit of <strong data-profit-big>$0.00</strong> <span>after <a href="#" class="fees-link" data-fees-link>fees</a></span></p>
          </div>

          <!-- SELL: proceeds + realised P&L -->
          <div class="bet-highlight sell-only">
            <span class="bet-label">You receive</span>
            <span class="bet-total-big tnum" data-receive-big>$0.00</span>
            <p class="potential-win" data-realized-line>Realised profit of <strong data-realized-big>$0.00</strong> <span>after <a href="#" class="fees-link" data-fees-link>fees</a></span></p>
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
  sheet.querySelector("[data-cancel-bet]").addEventListener("click", cancelBet);
  sheet.querySelector("[data-success-close]").addEventListener("click", closeBetSheet);
  sheet.addEventListener("click", (e) => { if (e.target.closest("[data-fees-link]")) { e.preventDefault(); goToFees(); } }); // delegated: covers the buy line AND the (regenerated) sell line's fees link

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
  // Buying more of an existing position: show the running total they'll hold after this purchase
  const qtyTotalEl = sheet.querySelector("[data-qty-total]");
  if (qtyTotalEl) {
    const showTotal = betState.mode === "buy" && (betState.existingQty || 0) > 0;
    qtyTotalEl.hidden = !showTotal;
    if (showTotal) qtyTotalEl.innerHTML = `Total contracts after purchase — <strong>${betState.existingQty + (betState.quantity || 0)}</strong>`;
  }

  // Warn when this buy takes the opposite side of a position already held in this game
  const conflictEl = sheet.querySelector("[data-conflict-warning]");
  if (conflictEl) {
    const clash = betState.mode === "buy" && betState.game && betState.editPending == null ? conflictingPosition(betState.game.id, betState.market, betState.contract) : null;
    conflictEl.hidden = !clash;
    if (clash) conflictEl.innerHTML = `${WARNING_ICON}<span>You already hold <strong>${MARKET_LABELS[clash.market]} · ${clash.side.toUpperCase()}</strong> in this game — this bet takes the opposite side.</span>`;
  }

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
    sheet.querySelector("[data-sell-sub]").innerHTML = `<span>${betState.holding} Held</span><span aria-hidden="true">·</span><span>Bought at ${betState.avg}¢</span><span aria-hidden="true">·</span><span>Now ${s.priceCents}¢</span>`;
    $$("[data-sell-pct]", sheet).forEach((b) => {
      const target = Math.max(1, Math.round(betState.holding * Number(b.dataset.sellPct) / 100));
      b.classList.toggle("is-active", target === s.qty);
    });
    sheet.querySelector("[data-receive-big]").textContent = money(s.proceeds);
    const rline = sheet.querySelector("[data-realized-line]");
    const win = s.realized >= 0;
    rline.classList.toggle("is-loss", !win);
    rline.innerHTML = `Realised ${win ? "profit" : "loss"} of <strong>${money(Math.abs(s.realized))}</strong> after <a href="#" class="fees-link" data-fees-link>fees</a>`;
  }

  // Primary button label
  const primary = sheet.querySelector("[data-bet-primary]");
  if (primary) {
    primary.disabled = !!betState.priceUpdating;
    primary.textContent = betState.priceUpdating ? "Updating..." : betState.editPending != null ? "Update Bet" : (betState.mode === "sell" ? "Sell" : (betState.step === 2 ? "Place Bet" : "Quick Bet"));
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
  // Apply the new price instantly with just a flash — no "recalculating" spinner/locked state.
  mk.yes = nextYes;
  mk.no = 100 - nextYes;
  updateBetSheet();
  ["[data-yes-price]", "[data-no-price]"].forEach((sel) => {
    const el = sheet.querySelector(sel);
    if (el) { el.classList.remove("blip"); void el.offsetWidth; el.classList.add("blip"); }
  });
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
    position: opts.position || null, existingQty: opts.existingQty || 0, committed: false, prevPos: null,
    editPending: opts.editPending ?? null,
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

// Positions the user holds in a game (BUF/MIA's are the floating game-page demo set).
function positionsInGame(gameId) {
  const held = USER.positions.filter((p) => p.gameId === gameId);
  return gameId === OPEN_POSITION_DEMO_GAME_ID ? held.concat(openPositionDemos) : held;
}
// A held position that conflicts with betting (market, side): same market, opposite side.
function conflictingPosition(gameId, market, side) {
  return positionsInGame(gameId).find((p) => p.market === market && p.side !== side) || null;
}

// Buy more of an existing position — the standard buy drawer, prefilled
function openBuy(pos) {
  const g = GAMES.find((x) => x.id === pos.gameId);
  if (!g) return;
  openBetSheet(pos.gameId, pos.market, pos.side, marketsFromGame(g), { quantity: 100, mode: "buy", position: pos, existingQty: pos.qty });
}

// Edit a pending limit order — opens the buy drawer prefilled, with "Update Bet" instead of "Quick Bet"
function openEditPending(i) {
  const p = USER.pending[i];
  const g = p && GAMES.find((x) => x.id === p.gameId);
  if (!g) return;
  openBetSheet(p.gameId, p.market, p.side, marketsFromGame(g), { quantity: p.qty, mode: "buy", limit: p.limit, editPending: i });
}

// Save the edited pending order and close — the drawer's "Update Bet" action.
function updatePendingOrder() {
  const p = USER.pending[betState.editPending];
  if (p) {
    p.market = betState.market;
    p.side = betState.contract;
    p.qty = betState.quantity;
    if (betState.limit != null) p.limit = betState.limit;
  }
  closeBetSheet();
  showToast("Order updated", "success");
  refreshPositionSurfaces();
}

// Sell all or part of a holding at the live price
function openSell(pos) {
  const g = GAMES.find((x) => x.id === pos.gameId);
  if (!g) return;
  Object.assign(betState, {
    game: g, mode: "sell", market: pos.market, contract: pos.side, markets: marketsFromGame(g),
    holding: pos.qty, avg: pos.avg, sellQty: pos.qty,
    position: null, existingQty: 0, committed: false, prevPos: null, editPending: null,
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
  if (betState.editPending != null) return updatePendingOrder();
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
  // Buying more of an existing position: fold the new contracts in so the open-position card reflects it
  const pos = betState.position;
  if (pos) {
    betState.prevPos = { qty: pos.qty, avg: pos.avg };
    const newQty = pos.qty + qty;
    pos.avg = Math.round((pos.qty * pos.avg + qty * priceCents) / newQty);
    pos.qty = newQty;
    betState.committed = true;
    refreshPositionSurfaces();
  }
  stopBetTicker();
  startCancelTimer();
}

// Re-render every surface that lists open positions (guards no-op where absent)
function refreshPositionSurfaces() {
  applyAuthChrome();          // header Open Positions dropdown
  renderAuthedHome();         // home hero carousel
  initWallet();               // wallet portfolio list
  refreshGameOpenPosition();  // floating game-page position card (demo: BUF/MIA)
}

// Cancel Bet: undo the position change from this purchase, then close
function cancelBet() {
  if (betState.committed && betState.position && betState.prevPos) {
    betState.position.qty = betState.prevPos.qty;
    betState.position.avg = betState.prevPos.avg;
    betState.committed = false;
    refreshPositionSurfaces();
  }
  closeBetSheet();
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

/* -------- Position-conflict gate: when you already hold a position in the game and place another.
   Reuses the auth-gate modal chrome (.gate-backdrop/.auth-gate). Session-only "don't show again". */
let hidePositionWarning = false;
let posGateContinueFn = null;
function ensurePositionGate() {
  let gate = $("#posGate");
  if (gate) return gate;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="gate-backdrop" id="posGateBackdrop"></div>
    <div class="auth-gate pos-gate" id="posGate" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="posGateTitle">
      <div class="gate-body">
        <h3 class="gate-title" id="posGateTitle">You already have a position in this game</h3>
        <p class="gate-desc">Only one position can win. Do you want to continue?</p>
        <div class="gate-actions">
          <button class="btn btn-secondary" type="button" id="posGateCancel">Cancel</button>
          <button class="btn btn-primary" type="button" id="posGateContinue">Continue</button>
        </div>
        <label class="pos-gate-check"><input type="checkbox" id="posGateHide"><span class="pos-check-box" aria-hidden="true">${CHECK_ICON}</span><span>Do not show this message again</span></label>
      </div>
    </div>`);
  gate = $("#posGate");
  $("#posGateBackdrop").addEventListener("click", closePositionGate);
  $("#posGateCancel").addEventListener("click", closePositionGate);
  $("#posGateContinue").addEventListener("click", () => {
    if ($("#posGateHide").checked) hidePositionWarning = true;
    const fn = posGateContinueFn;
    closePositionGate();
    if (fn) fn();
  });
  return gate;
}
function openPositionGate(gameId, onContinue) {
  if (!positionsInGame(gameId).length) { onContinue(); return; }
  const gate = ensurePositionGate();
  $("#posGateHide").checked = false;
  posGateContinueFn = onContinue;
  $("#posGateBackdrop").classList.add("is-open");
  gate.classList.add("is-open");
  gate.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
}
function closePositionGate() {
  const gate = $("#posGate");
  if (!gate) return;
  $("#posGateBackdrop").classList.remove("is-open");
  gate.classList.remove("is-open");
  gate.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
  posGateContinueFn = null;
}

// Open the bet drawer from a clicked price tile (reads the row's live prices into markets)
function openBetFromPrice(price) {
  const grid = price.closest(".mkt-grid");
  const markets = {};
  grid.querySelectorAll(".price[data-market]").forEach((b) => {
    const m = b.dataset.market;
    markets[m] = markets[m] || {};
    markets[m][b.classList.contains("no") ? "no" : "yes"] = parseInt(b.textContent, 10);
  });
  openBetSheet(price.dataset.game, price.dataset.market, price.dataset.side, markets);
}

function initBetSheet() {
  document.addEventListener("click", (e) => {
    const price = e.target.closest(".price");
    if (!price || !price.dataset.game) return;
    if (!isAuthed()) { openAuthGate(price.dataset.game, price.dataset.market, price.dataset.side); return; } // guests: contextual account prompt
    const held = positionsInGame(price.dataset.game);
    // Topping up a bet they already hold (same market + side) → straight to the buy-more drawer.
    const same = held.find((p) => p.market === price.dataset.market && p.side === price.dataset.side);
    if (same) { openBuy(same); return; }
    // A competing position in the same game → warn first, open the drawer on Continue.
    if (!hidePositionWarning && held.length) {
      openPositionGate(price.dataset.game, () => openBetFromPrice(price));
      return;
    }
    openBetFromPrice(price);
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
// Shared back button for support/help pages — go back in history, else fall back to the href.
function initBackButtons() {
  $$("[data-page-back]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    if (history.length > 1) history.back();
    else location.href = el.getAttribute("href") || "home.html";
  }));
}

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
    { gameId: "kc-sf", market: "gtl", side: "yes", qty: 150, avg: 31, date: "2026-07-06" },
    { gameId: "den-dal", market: "gtl", side: "no", qty: 90, avg: 60, date: "2026-07-05" },
    { gameId: "ny-bos", market: "ktl", side: "yes", qty: 100, avg: 70, date: "2026-07-06" },
  ],
  // Limit orders placed but not yet filled — priced at `limit`¢, awaiting the market to reach them.
  pending: [
    { gameId: "kc-sf", market: "tie", side: "no", qty: 200, limit: 22, date: "2026-07-07" },
    { gameId: "den-dal", market: "ktl", side: "yes", qty: 75, limit: 44, date: "2026-07-06" },
  ],
  settled: [
    { gameId: "buf-mia", market: "gtl", side: "yes", qty: 100, avg: 45, result: "win", net: 54.1, reopened: true, date: "2026-06-28" },
    { gameId: "lal-gs", market: "ktl", side: "yes", qty: 60, avg: 55, result: "loss", net: -33, date: "2026-06-25" },
    { gameId: "kc-sf", market: "gtl", side: "no", qty: 80, avg: 40, result: "win", net: 41.2, date: "2026-06-30" },
    { gameId: "ny-bos", market: "gtl", side: "yes", qty: 50, avg: 62, result: "loss", net: -31, date: "2026-06-22" },
    { gameId: "den-dal", market: "ktl", side: "no", qty: 120, avg: 48, result: "win", net: 66.4, date: "2026-07-01" },
    { gameId: "dal-phi", market: "tie", side: "no", qty: 90, avg: 78, result: "win", net: 19.8, date: "2026-06-29" },
    { gameId: "buf-mia", market: "ktl", side: "yes", qty: 40, avg: 52, result: "loss", net: -20.8, date: "2026-06-20" },
  ],
  // Limit orders the user cancelled before they filled (moved here from `pending`).
  cancelled: [
    { gameId: "lal-gs", market: "gtl", side: "yes", qty: 120, limit: 35, date: "2026-07-02" },
    { gameId: "kc-sf", market: "ktl", side: "yes", qty: 60, limit: 41, date: "2026-07-01" },
    { gameId: "ny-bos", market: "gtl", side: "no", qty: 100, limit: 28, date: "2026-06-30" },
    { gameId: "den-dal", market: "tie", side: "no", qty: 45, limit: 12, date: "2026-07-03" },
    { gameId: "buf-mia", market: "gtl", side: "yes", qty: 150, limit: 39, date: "2026-07-04" },
    { gameId: "dal-phi", market: "ktl", side: "no", qty: 70, limit: 55, date: "2026-06-28" },
    { gameId: "lal-gs", market: "tie", side: "yes", qty: 30, limit: 18, date: "2026-07-05" },
  ],
};

const AUTH_KEY = "gtl-auth";
function getAuth() {
  const previewAuth = new URLSearchParams(location.search).get("ds-auth");
  if (previewAuth === "logged") return { name: "Alex Morgan", email: "alex@gtl.test" };
  if (previewAuth === "guest") return null;
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch (e) { return null; }
}
function isAuthed() { return !!getAuth(); }
function setAuth(user) { try { localStorage.setItem(AUTH_KEY, JSON.stringify(user)); } catch (e) { /* ignore */ } }
function clearAuth() { try { localStorage.removeItem(AUTH_KEY); } catch (e) { /* ignore */ } }
function currentName() { const a = getAuth(); return (a && a.name) || USER.name; }
function currentPositions() {
  return new URLSearchParams(location.search).get("ds-positions") === "empty" ? [] : USER.positions;
}
function nameFromEmail(email) {
  if (!email) return USER.name;
  const local = String(email).split("@")[0].replace(/[._+-]+/g, " ").trim();
  if (!local) return USER.name;
  return local.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const signed = (v) => (v >= 0 ? "+" : "−") + "$" + Math.abs(v).toFixed(2);
const fmtDate = (iso) => { const d = new Date(iso + "T00:00:00"); return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); };
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

const posActions = (i) => `<div class="oc-actions">
        <button class="oc-buy" data-buy="${i}">Buy More</button>
        <button class="oc-sell" data-sell="${i}">Sell</button>
      </div>`;

// Variant A — the shared position-card design: a [bet type] / "Value & Return" label row
// above a [side · contracts] / [value · return] data row.
function positionCardA(p, i) {
  const { g, value, pnl } = posFigures(p);
  const up = pnl >= 0;
  const sideTag = `<span class="side-${p.side}">${p.side.toUpperCase()}</span>`;
  return `<article class="pos-card pos-card--a" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <a class="pos-media" href="${gamePageHref(g)}" aria-label="Open ${g.away.abbr} at ${g.home.abbr}">${gameMedia(g, clockCenter(g))}</a>
    <div class="pos-info">
      <div class="oc-summary">
        <div class="oc-row">
          <span class="oc-tag">${MARKET_LABELS[p.market]}</span>
          <span class="oc-vr-head">Value &amp; Return</span>
        </div>
        <div class="oc-row">
          <span class="oc-sub">${sideTag} · ${p.qty} contracts</span>
          <span class="oc-figures"><span class="tnum">${money(value)}</span> · <span class="oc-pnl ${up ? "up" : "down"} tnum">${signed(pnl)}</span></span>
        </div>
      </div>
      ${posActions(i)}
    </div>
  </article>`;
}

// Variant B — bet type over a centred Contracts / Value / Return stat row.
function positionCardB(p, i) {
  const { g, value, pnl } = posFigures(p);
  const up = pnl >= 0;
  const betType = `${MARKET_LABELS[p.market]} · <span class="side-${p.side}">${p.side.toUpperCase()}</span>`;
  return `<article class="pos-card pos-card--b" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <a class="pos-media" href="${gamePageHref(g)}" aria-label="Open ${g.away.abbr} at ${g.home.abbr}">${gameMedia(g, clockCenter(g))}</a>
      <div class="pos-info">
        <div class="ocb-type">${betType}</div>
        <div class="ocb-stats">
          <div class="ocb-stat"><span class="ocb-k">Contracts</span><span class="ocb-v tnum">${p.qty}</span></div>
          <div class="ocb-stat"><span class="ocb-k">Value</span><span class="ocb-v tnum">${money(value)}</span></div>
          <div class="ocb-stat"><span class="ocb-k">Return</span><span class="ocb-v tnum oc-pnl ${up ? "up" : "down"}">${signed(pnl)}</span></div>
        </div>
        ${posActions(i)}
      </div>
    </article>`;
}

/* The home carousel's 3rd card (variant C) — also used for every card in the
   header Open Positions dropdown. Self-contained so both callers stay identical. */
function positionCardC(p, i) {
  const { g, value, cost, pnl } = posFigures(p);
  const up = pnl >= 0;
  const betType = `${MARKET_LABELS[p.market]} · <span class="side-${p.side}">${p.side.toUpperCase()}</span>`;
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
        <div class="oc-actions">
          <button class="oc-buy" data-buy="${i}">Buy More</button>
          <button class="oc-sell" data-sell="${i}">Sell</button>
        </div>
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
    // Signed out shows Login; signed in the header carries the Wallet + Open Positions chips (right) for cross-page access.
    right.innerHTML = authed ? "" : `<a class="btn header-login floating-btn" href="login.html">Login</a>`;
  }
  const wallet = $("#headerWallet");
  if (wallet) {
    wallet.innerHTML = authed
      ? `<a class="wallet-chip floating-btn" href="wallet.html" aria-label="Wallet balance">${WALLET_ICO}<span class="wallet-amount tnum">${money(USER.balance)}</span></a>`
      : "";
  }
  if (nav) {
    nav.innerHTML = navHTML(authed);
    const lo = nav.querySelector("[data-logout]");
    if (lo) lo.addEventListener("click", () => { clearAuth(); location.href = "home.html"; });
  }
  const positions = $("#headerPositions");
  if (positions) {
    const openPositions = currentPositions();
    const n = authed ? openPositions.length : 0;
    if (n) {
      positions.innerHTML = `
        <button class="hpos-trigger" data-hpos-toggle aria-expanded="false" aria-haspopup="true" aria-controls="hposPanel" aria-label="${n} open positions">
          <span class="hpos-word">Open Positions</span>
          <span class="hpos-num tnum">${n}</span>
          <span class="hpos-close" aria-hidden="true">${ICON_CLOSE}</span>
        </button>
        <div class="hpos-panel" id="hposPanel" role="menu" hidden>
          <div class="hpos-list">${openPositionCards(openPositions)}</div>
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
  // Render each position card, then swap the display order of the 2nd and 3rd cards.
  const openPositions = currentPositions();
  const posCards = openPositions.map((p, i) => positionCardA(p, i));
  if (posCards.length >= 3) [posCards[1], posCards[2]] = [posCards[2], posCards[1]];
  const positionsContent = posCards.length ? `
      <div class="positions-block">
        <div class="positions-head"><span class="eyebrow">Open Positions</span></div>
        <div class="pos-carousel" id="positionList">${posCards.join("")}</div>
        <div class="pos-footer">
          <a href="wallet.html">View All</a>
          <div class="pos-dots" id="posDots"></div>
          <a href="wallet.html#settled">View Settled</a>
        </div>
      </div>` : `
      <div class="coming-soon authed-empty-positions">
        <h3 class="cs-title">No open positions yet</h3>
        <p class="cs-desc">Live markets you enter will appear here, along with quick access to buy more, sell, or review settled results.</p>
        <div class="pos-footer no-scroll">
          <a href="wallet.html">View All</a>
          <a href="wallet.html#settled">View Settled</a>
        </div>
      </div>`;
  heroInner.innerHTML = `
    <div class="hero-greeting">
      <h1>Hey ${currentName()}</h1>
    </div>
    <div class="authed-stack">
      ${positionsContent}
      <a class="btn btn-primary authed-cta" href="#live">Live Games</a>
    </div>`;
  if (posCards.length) bindPositionActions($("#positionList"));
  initPositionsCarousel();
}

// Settled win — a banner that slides down over the header on any page (until dismissed)
function renderSettledToast() {
  // The settled "You Won" banner is a game-b-only demo surface: it renders on
  // EVERY load of game-b (no auth gate, no session-dismissal persistence) so the
  // pattern is always visible there in a consistent spot. Dismiss/auto-dismiss
  // only hide it for the current view — a refresh brings it back.
  if (!document.body.classList.contains("game-b-body")) return;
  const reopenIdx = USER.settled.findIndex((s) => s.reopened);
  const reopen = USER.settled[reopenIdx];
  if (!reopen) return;
  const g = GAMES.find((x) => x.id === reopen.gameId);
  if (!g) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="settled-toast" id="settledToast" role="status" aria-label="Settled bet — you won">
      <div class="settled-card" style="--home-color:${g.home.color};--away-color:${g.away.color}">
        <a class="pos-media" href="wallet.html?order=settled:${reopenIdx}" aria-label="View this settled bet in your portfolio">${gameMedia(g, `<span class="period">Settled</span><span class="sc-won">You Won</span>`)}</a>
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
  const hide = () => {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    toast.classList.remove("is-open");
    setTimeout(() => toast.remove(), 500);
  };
  toast.querySelector("[data-settled-dismiss]").addEventListener("click", () => hide()); // hide for this view only — it returns on the next refresh
  setTimeout(() => {                          // let the page settle first, then slide in after 5s
    if (!document.body.contains(toast)) return;
    toast.classList.add("is-open");          // slide down + start the 10s progress fill
    animateWalletCredit(reopen.net);         // the win lands: count the header wallet up with a subtle pulse
    autoTimer = setTimeout(() => hide(), 10000); // auto-dismiss is transient — the banner returns on the next refresh
  }, 5000);
}

// Credit the header wallet chip as a settled win lands — count the balance up
// from its current value with a soft green pulse + a floating "+$x".
function animateWalletCredit(amount) {
  if (!(amount > 0)) return;
  const chip = $("#headerWallet .wallet-chip");
  const amtEl = $("#headerWallet .wallet-amount");
  if (!chip || !amtEl) return;
  const from = USER.balance;
  const to = USER.balance + amount;
  USER.balance = to;
  chip.classList.remove("wallet-credit"); void chip.offsetWidth; chip.classList.add("wallet-credit");
  const pop = document.createElement("span");
  pop.className = "wallet-pop tnum";
  pop.textContent = `+${money(amount)}`;
  chip.appendChild(pop);
  setTimeout(() => pop.remove(), 1600);
  let start = null;
  const dur = 950;
  const step = (now) => {
    if (start === null) start = now;
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    amtEl.textContent = money(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
    else { amtEl.textContent = money(to); setTimeout(() => chip.classList.remove("wallet-credit"), 500); }
  };
  requestAnimationFrame(step);
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
// Which orders tab is showing — preserved across list ↔ detail navigation
let walletTab = "active";

const walletGuardHTML = `<div class="wallet-guard">
    <h1>Your wallet</h1>
    <p>Login to see your balance, add funds and manage your orders.</p>
    <a class="btn btn-primary" href="login.html">Login</a>
    <a class="link-green" href="signup.html">Create an Account</a>
  </div>`;

function addFundsHTML() {
  return `<div class="addfunds-backdrop" id="addFundsBackdrop"></div>
    <aside class="addfunds-sheet" id="addFunds" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Top up your balance">
      <div class="addfunds-inner">
        <h3>Top Up</h3>
        <div class="bet-field contracts-field">
          <span class="bet-label">Amount to add</span>
          <div class="addfunds-amount"><span class="af-sign">$</span><input class="num-input" data-add-input type="text" inputmode="numeric" value="50" aria-label="Amount to add" /></div>
          <div class="qty-quick" data-add-quick>
            <button data-add-amt="20">$20</button>
            <button data-add-amt="50">$50</button>
            <button data-add-amt="100">$100</button>
            <button data-add-amt="200">$200</button>
          </div>
        </div>
        <div class="addfunds-actions">
          <button class="btn btn-secondary" data-add-cancel>Cancel</button>
          <button class="btn btn-primary" data-add-confirm>Add Funds</button>
        </div>
        <p class="addfunds-note">Prototype — no real payment is taken.</p>
      </div>
    </aside>`;
}

// Compact single-row order: logos · bet type · value → taps through to the detail view.
function orderRowHTML(o, type, i) {
  const g = GAMES.find((x) => x.id === o.gameId);
  const betType = `${MARKET_LABELS[o.market]} · <span class="side-${o.side}">${o.side.toUpperCase()}</span>`;
  let valueHTML;
  if (type === "open") {
    const { value, pnl } = posFigures(o); const up = pnl >= 0;
    valueHTML = `<span class="or-amount tnum">${money(value)}</span><span class="or-pnl ${up ? "up" : "down"} tnum">${signed(pnl)}</span>`;
  } else if (type === "pending") {
    valueHTML = `<span class="or-amount tnum">${money((o.limit / 100) * o.qty)}</span><span class="or-status">Pending</span>`;
  } else if (type === "cancelled") {
    valueHTML = `<span class="or-amount tnum">${money((o.limit / 100) * o.qty)}</span><span class="or-status cancelled">Cancelled</span>`;
  } else {
    const win = o.result === "win";
    valueHTML = `<span class="or-pnl ${win ? "up" : "down"} tnum">${signed(o.net)}</span><span class="result-pill ${win ? "win" : "loss"}">${win ? "Won" : "Lost"}</span>`;
  }
  return `<button class="order-row" type="button" data-order-open="${type}:${i}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <span class="or-logos"><img src="${g.home.logo}" alt=""><img src="${g.away.logo}" alt=""></span>
    <span class="or-main"><span class="or-type">${betType}</span><span class="or-teams">${g.home.abbr} · ${g.away.abbr}${o.date ? ` · ${fmtDate(o.date)}` : ""}</span></span>
    <span class="or-value">${valueHTML}</span>
    <span class="or-chev" aria-hidden="true">${CHEVRON}</span>
  </button>`;
}

// An order section (Current / Pending / Settled / Cancelled). Sections over 5 rows collapse to
// the first 5 with a "Show all" toggle (→ "Hide all" when expanded).
const ORDER_COLLAPSE_LIMIT = 5;
function orderGroupHTML(title, list, type, empty) {
  const rows = list.length ? list.map((o, i) => orderRowHTML(o, type, i)).join("") : `<div class="wallet-empty">${empty}</div>`;
  const collapsible = list.length > ORDER_COLLAPSE_LIMIT;
  const toggle = collapsible ? `<button class="order-showall" type="button" data-showall aria-expanded="false">Show all ${list.length}</button>` : "";
  return `<div class="order-group">
        <div class="order-group-head"><h2>${title}</h2><span class="count">${list.length}</span></div>
        <div class="order-list${collapsible ? " is-collapsed" : ""}">${rows}</div>
        ${toggle}
      </div>`;
}

// Portfolio overview — headline stats across current, pending and settled orders.
function portfolioStatsHTML() {
  const openPnl = USER.positions.reduce((s, p) => s + posFigures(p).pnl, 0);
  const openValue = USER.positions.reduce((s, p) => s + posFigures(p).value, 0);
  const settledNet = USER.settled.reduce((s, x) => s + x.net, 0);
  const totalProfit = openPnl + settledNet;
  const totalBets = USER.positions.length + USER.pending.length + USER.settled.length;
  const wins = USER.settled.filter((x) => x.result === "win").length;
  const winRate = USER.settled.length ? Math.round((wins / USER.settled.length) * 100) : 0;
  const stat = (k, v, cls) => `<div class="pstat"><span class="pstat-k">${k}</span><span class="pstat-v ${cls || ""} tnum">${v}</span></div>`;
  return `<div class="portfolio-stats">
    ${stat("Total profit", signed(totalProfit), totalProfit >= 0 ? "up" : "down")}
    ${stat("Total bets", totalBets)}
    ${stat("Win rate", `${winRate}%`)}
    ${stat("Open value", money(openValue))}
  </div>`;
}

function initWallet() {
  const main = $("#walletMain");
  if (!main) return;
  if (!isAuthed()) { main.innerHTML = walletGuardHTML; return; }
  document.body.classList.remove("order-detail-open");
  main.innerHTML = `
    <div class="wallet-head">
      <h1>Portfolio</h1>
      <p class="wallet-desc">Your live positions, pending limit orders and settled bets — all in one place.</p>
    </div>
    ${portfolioStatsHTML()}
    <div class="stats-tabs" id="orderTabs" role="tablist" aria-label="Orders">
      <button class="stats-tab${walletTab === "active" ? " is-active" : ""}" type="button" role="tab" data-order-tab="active" aria-selected="${walletTab === "active"}">Orders</button>
      <button class="stats-tab${walletTab === "settled" ? " is-active" : ""}" type="button" role="tab" data-order-tab="settled" aria-selected="${walletTab === "settled"}">Settled</button>
    </div>
    <div class="order-panel" data-order-panel="active"${walletTab === "active" ? "" : " hidden"}>
      ${orderGroupHTML("Current", USER.positions, "open", "No current orders.")}
      ${orderGroupHTML("Pending", USER.pending, "pending", "No pending orders.")}
    </div>
    <div class="order-panel" data-order-panel="settled"${walletTab === "settled" ? "" : " hidden"}>
      ${orderGroupHTML("Settled", USER.settled, "settled", "No settled orders yet.")}
      ${orderGroupHTML("Cancelled", USER.cancelled, "cancelled", "No cancelled orders.")}
    </div>
    ${addFundsHTML()}
    <div class="wallet-dock" id="walletDock">
      <div class="wallet-dock-inner">
        <span class="wd-balance"><span class="wd-label">Available balance</span><span class="wd-amount tnum" data-balance>${money(USER.balance)}</span></span>
        <button class="btn btn-primary wd-topup" type="button" data-add-toggle>Top Up</button>
      </div>
    </div>`;
  initOrderTabs();
  $$("[data-order-open]", main).forEach((row) => row.addEventListener("click", () => {
    const [type, i] = row.dataset.orderOpen.split(":");
    openOrderDetail(type, Number(i));
  }));
  $$("[data-showall]", main).forEach((btn) => btn.addEventListener("click", () => {
    const list = btn.previousElementSibling;
    const collapsed = list.classList.toggle("is-collapsed");
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    btn.textContent = collapsed ? `Show all ${list.children.length}` : "Hide all";
  }));
  initAddFunds();
  // Deep link — the settled "You Won" card links to wallet.html?order=settled:<i> so a tap
  // lands directly on that order's detail. Clear the param so Back returns to the list.
  const orderParam = new URLSearchParams(location.search).get("order");
  if (orderParam) {
    const [type, iStr] = orderParam.split(":");
    const i = Number(iStr);
    const lists = { open: USER.positions, pending: USER.pending, cancelled: USER.cancelled, settled: USER.settled };
    if (lists[type] && lists[type][i]) {
      walletTab = (type === "settled" || type === "cancelled") ? "settled" : "active";
      history.replaceState(null, "", location.pathname);
      openOrderDetail(type, i);
    }
  }
}

function initOrderTabs() {
  const tabs = $("#orderTabs");
  if (!tabs) return;
  tabs.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-order-tab]");
    if (!tab) return;
    walletTab = tab.dataset.orderTab;
    $$("[data-order-tab]", tabs).forEach((b) => {
      const active = b === tab;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    $$("[data-order-panel]").forEach((panel) => { panel.hidden = panel.dataset.orderPanel !== walletTab; });
  });
}

const summaryRow = (k, v, total) => `<div class="summary-row${total ? " total" : ""}"><span>${k}</span><strong>${v}</strong></div>`;
const orderActionsDock = (buttons) => `<div class="order-actions-dock"><div class="oad-inner">${buttons}</div></div>`;
const STATUS_LABELS = { open: "Current", pending: "Pending", cancelled: "Cancelled", settled: "Settled" };
const statusChip = (type) => `<span class="status-chip ${type}">${STATUS_LABELS[type] || ""}</span>`;
function orderDetailHTML(type, i) {
  const o = type === "open" ? USER.positions[i] : type === "pending" ? USER.pending[i] : type === "cancelled" ? USER.cancelled[i] : USER.settled[i];
  const g = GAMES.find((x) => x.id === o.gameId);
  const betType = `${MARKET_LABELS[o.market]} · <span class="side-${o.side}">${o.side.toUpperCase()}</span>`;
  let headline = "", extraRows = "", actions = "";
  if (type === "open") {
    const { cur, value, cost, pnl } = posFigures(o); const up = pnl >= 0;
    headline = `<span class="od-big tnum">${money(value)}</span><span class="od-pnl ${up ? "up" : "down"} tnum">${signed(pnl)}</span>`;
    extraRows = summaryRow("Contracts", o.qty) + summaryRow("Average price", `${o.avg}¢`) + summaryRow("Current price", `${cur}¢`) + summaryRow("Cost basis", money(cost)) + summaryRow("Current value", money(value), true);
    actions = orderActionsDock(`<button class="btn btn-secondary" type="button" data-detail-buy>Buy More</button><button class="btn btn-primary" type="button" data-detail-sell>Sell</button>`);
  } else if (type === "pending" || type === "cancelled") {
    const val = (o.limit / 100) * o.qty;
    headline = `<span class="od-big tnum${type === "cancelled" ? " muted" : ""}">${money(val)}</span>`;
    extraRows = summaryRow("Limit price", `${o.limit}¢`) + summaryRow("Contracts", o.qty) + summaryRow("Order value", money(val), true);
    if (type === "pending") actions = orderActionsDock(`<button class="btn btn-secondary" type="button" data-detail-edit>Edit order</button><button class="btn btn-danger" type="button" data-detail-cancel>${ICON_CLOSE}<span>Cancel order</span></button>`);
  } else {
    const win = o.result === "win";
    headline = `<span class="od-big ${win ? "up" : "down"} tnum">${signed(o.net)}</span>`;
    extraRows = summaryRow("Contracts", o.qty) + summaryRow("Average price", `${o.avg}¢`) + summaryRow("Net return", signed(o.net), true);
  }
  return `
    <button class="order-back" type="button" data-order-back>${CHEVRON}<span>Orders</span></button>
    <div class="order-detail">
      <div class="od-game">
        <span class="or-logos"><img src="${g.home.logo}" alt=""><img src="${g.away.logo}" alt=""></span>
        <span class="od-game-meta">
          <span class="od-teams">${g.home.abbr} ${g.home.score} · ${g.away.score} ${g.away.abbr}</span>
          <span class="od-league">${g.league.toUpperCase()} · ${type === "settled" ? "Final" : `${g.period} ${g.clock}`}</span>
        </span>
      </div>
      <div class="od-headline">${headline}</div>
      <div class="summary od-summary">
        ${summaryRow("Your bet", betType)}
        ${summaryRow("Status", statusChip(type))}
        ${o.date ? summaryRow("Order date", fmtDate(o.date)) : ""}
        ${extraRows}
      </div>
    </div>
    ${actions}`;
}

function openOrderDetail(type, i) {
  const main = $("#walletMain");
  if (!main) return;
  main.innerHTML = orderDetailHTML(type, i);
  document.body.classList.add("order-detail-open");
  window.scrollTo({ top: 0 });
  $("[data-order-back]", main)?.addEventListener("click", () => { initWallet(); window.scrollTo({ top: 0 }); });
  $("[data-detail-buy]", main)?.addEventListener("click", () => openBuy(USER.positions[i]));
  $("[data-detail-sell]", main)?.addEventListener("click", () => openSell(USER.positions[i]));
  $("[data-detail-edit]", main)?.addEventListener("click", () => openEditPending(i));
  $("[data-detail-cancel]", main)?.addEventListener("click", () => {
    const [order] = USER.pending.splice(i, 1);
    if (order) USER.cancelled.unshift(order);   // moves from Pending → Cancelled
    walletTab = "settled";                        // land on the tab where it now lives
    showToast("Pending order cancelled", "success");
    initWallet();
    window.scrollTo({ top: 0 });
  });
}

function initAddFunds() {
  const sheet = $("#addFunds");
  if (!sheet) return;
  const backdrop = $("#addFundsBackdrop");
  const input = sheet.querySelector("[data-add-input]");
  const markActive = (v) => $$("[data-add-amt]", sheet).forEach((b) => b.classList.toggle("is-active", Number(b.dataset.addAmt) === v));
  const setAmt = (v) => { input.value = v; markActive(v); };
  const open = () => { setAmt(50); backdrop.classList.add("is-open"); sheet.classList.add("is-open"); sheet.setAttribute("aria-hidden", "false"); document.body.classList.add("sheet-open"); };
  const close = () => { backdrop.classList.remove("is-open"); sheet.classList.remove("is-open"); sheet.setAttribute("aria-hidden", "true"); document.body.classList.remove("sheet-open"); };
  $("[data-add-toggle]")?.addEventListener("click", open);
  backdrop.addEventListener("click", close);
  sheet.querySelector("[data-add-quick]").addEventListener("click", (e) => { const b = e.target.closest("[data-add-amt]"); if (b) setAmt(Number(b.dataset.addAmt)); });
  input.addEventListener("input", () => markActive(parseInt(input.value.replace(/[^0-9]/g, ""), 10)));
  sheet.querySelector("[data-add-cancel]").addEventListener("click", close);
  sheet.querySelector("[data-add-confirm]").addEventListener("click", () => {
    const v = parseInt(input.value.replace(/[^0-9]/g, ""), 10) || 0;
    if (v > 0) { USER.balance += v; $("[data-balance]").textContent = money(USER.balance); applyAuthChrome(); }
    close();
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
  initPausedDemo();
  initLeagueFilter();
  initHeader();
  initTheme();
  initScrollTop();
  initTradingCounter();
  renderGamePage();
  initBetSheet();
  initFeesPage();
  initBackButtons();
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
