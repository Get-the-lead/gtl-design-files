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
      { label: "Total Team Yards", home: 214, away: 186 },
      { label: "Pass Yards", home: 151, away: 129 },
      { label: "Rush Yards", home: 63, away: 57 },
      { label: "Possession Time", home: "11:46", away: "09:32", homeMetric: 706, awayMetric: 572 },
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
      { label: "Total Team Yards", home: 288, away: 264 },
      { label: "Pass Yards", home: 201, away: 188 },
      { label: "Rush Yards", home: 87, away: 76 },
      { label: "Possession Time", home: "17:38", away: "16:17", homeMetric: 1058, awayMetric: 977 },
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
      { label: "Total Team Yards", home: 341, away: 352 },
      { label: "Pass Yards", home: 246, away: 258 },
      { label: "Rush Yards", home: 95, away: 94 },
      { label: "Possession Time", home: "28:42", away: "29:04", homeMetric: 1722, awayMetric: 1744 },
      { label: "Turnovers", home: 2, away: 1 },
    ],
  },
];

/* ------------------------------------------------------------- HELPERS */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const leaderOf = (g) => (g.home.score === g.away.score ? null : g.home.score > g.away.score ? "home" : "away");
function teamMarkHTML(t, className, loading = "") {
  const fallback = `<span class="team-mark-abbr">${t.abbr}</span>`;
  if (!t.logo) return `<span class="team-mark ${className} is-fallback" aria-label="${t.name}" style="--team-color:${t.color}">${fallback}</span>`;
  return `<span class="team-mark ${className}" aria-label="${t.name}" style="--team-color:${t.color}">
      <img src="${t.logo}" alt=""${loading ? ` loading="${loading}"` : ""} onerror="this.closest('.team-mark').classList.add('is-fallback');this.remove();" />
      ${fallback}
    </span>`;
}

function teamAbbrMarkHTML(t, className) {
  return `<span class="team-mark ${className} is-fallback" aria-label="${t.abbr}" style="--team-color:${t.color}"><span class="team-mark-abbr">${t.abbr}</span></span>`;
}

const CHEVRON = '<svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const MARKET_LABELS = { gtl: "Get the Lead", tie: "Tie", ktl: "Keep the Lead" };
const CHEVRON_DOWN = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const gamePageHref = (g) => `game.html?id=${g.id}`;
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
          ${teamAbbrMarkHTML(t, "team-logo")}
          <div class="team-meta"><span class="team-abbr team-name">${t.name}</span><span class="team-score tnum">${t.score}</span></div>
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

function renderHomeEdgeCase() {
  const grid = $("#gameGrid");
  if (!grid) return;
  const state = new URLSearchParams(location.search).get("ds-home-state");
  if (!state) return;

  if (state === "loading") {
    grid.setAttribute("aria-busy", "true");
    grid.setAttribute("aria-label", "Loading live games");
    grid.innerHTML = Array.from({ length: 3 }, () => `<article class="home-loading-card" aria-hidden="true">
      <div class="home-loading-score"><span></span><span></span><span></span></div>
      <div class="home-loading-line is-wide"></div>
      <div class="home-loading-line"></div>
    </article>`).join("");
    return;
  }

  const states = {
    "no-live": {
      icon: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      title: "No Live Games Right Now",
      copy: "There aren’t any live NFL games available. Check back when the next game begins.",
    },
    error: {
      icon: `<svg viewBox="0 0 24 24" fill="none"><path d="M4.5 9.5A12 12 0 0 1 12 7c2.9 0 5.6 1 7.5 2.5M7.5 13a7.7 7.7 0 0 1 4.5-1.4c1.7 0 3.3.5 4.5 1.4M10.5 16.4c.5-.3 1-.4 1.5-.4s1 .1 1.5.4M4 4l16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
      title: "Unable to Load Live Games",
      copy: "We couldn’t load the latest games. Check your connection and try again.",
      action: "Try Again",
    },
  };
  const content = states[state];
  if (!content) return;

  grid.innerHTML = `<div class="home-game-state" role="${state === "error" ? "alert" : "status"}">
    <span class="home-game-state-icon" aria-hidden="true">${content.icon}</span>
    <h3>${content.title}</h3>
    <p>${content.copy}</p>
    ${content.action ? `<button class="btn btn-secondary" type="button" data-home-state-retry>${content.action}</button>` : ""}
  </div>`;

  $("[data-home-state-retry]", grid)?.addEventListener("click", () => {
    const nextUrl = new URL(location.href);
    nextUrl.searchParams.delete("ds-home-state");
    location.assign(nextUrl);
  });
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
const HEADER_LOGO = '<img src="assets/gtl-footer-logo.png" alt="" />';
const THEME_SWITCH = `<span class="theme-switch-track" aria-hidden="true"><span class="theme-switch-thumb"></span><span class="theme-option theme-sun">${ICON_SUN}</span><span class="theme-option theme-moon">${ICON_MOON}</span></span>`;
// Header nav shown inside the GTL pill on desktop. Account destinations only appear when signed in.
function navHTML(authed) {
  return `<nav class="header-nav" aria-label="Primary navigation">
    <a href="home.html" data-scroll-top>Home</a>
    <a href="home.html#live">Live Games</a>
    <a href="ranking.html">Ranking</a>
    ${authed ? `<a href="wallet.html">Portfolio</a>` : ""}
    ${authed ? `<a href="profile.html">Profile &amp; Settings</a>` : ""}
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
            <span class="header-brand-logo">${HEADER_LOGO}</span>
          </a>
          <button class="brand floating-logo floating-btn brand-menu" data-menu-toggle aria-controls="menuPanel" aria-expanded="false" aria-label="Open menu">
            <span class="header-brand-logo">${HEADER_LOGO}</span>
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
        <a href="ranking.html">Ranking</a>
        <a href="wallet.html">Portfolio</a>
        <a href="profile.html" data-auth-only>Profile &amp; Settings</a>
      </nav>
      <div class="menu-appearance">
        <button class="menu-theme" id="themeBtn" data-theme-toggle aria-label="Switch colour theme">
          <span>Appearance</span>
          ${THEME_SWITCH}
        </button>
      </div>
      <div class="menu-prototype-links" data-guest-only>
        <div class="menu-prototype-row">
          <a class="menu-location" href="location-unavailable.html">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>
            <span>Change Location</span>
          </a>
          <button class="menu-prototype-info" type="button" data-prototype-menu-info aria-label="About Change Location">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.5v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1" fill="currentColor"/></svg>
          </button>
        </div>
        <div class="menu-prototype-row">
          <a class="menu-location" href="waitlist.html">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6.5h16v11H4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m5 8 7 5 7-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Waitlist</span>
          </a>
          <button class="menu-prototype-info" type="button" data-prototype-menu-info aria-label="About Waitlist">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.5v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1" fill="currentColor"/></svg>
          </button>
        </div>
      </div>
      <div class="menu-actions" id="menuActions"></div>
    </div>`;
}

function ensurePrototypeMenuInfo() {
  let gate = $("#prototypeMenuInfo");
  if (gate) return gate;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="gate-backdrop" id="prototypeMenuInfoBackdrop"></div>
    <div class="auth-gate prototype-menu-info-gate" id="prototypeMenuInfo" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="prototypeMenuInfoTitle">
      <div class="gate-body">
        <h3 class="gate-title" id="prototypeMenuInfoTitle">Prototype navigation</h3>
        <p class="gate-desc">This is not part of the actual application menu. It is included for prototype purposes only.</p>
      </div>
    </div>
    <button class="btn btn-secondary gate-close" id="prototypeMenuInfoClose" type="button">Close</button>`);
  gate = $("#prototypeMenuInfo");
  const close = () => {
    $("#prototypeMenuInfoBackdrop")?.classList.remove("is-open");
    gate.classList.remove("is-open");
    $("#prototypeMenuInfoClose")?.classList.remove("is-open");
    gate.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sheet-open");
  };
  $("#prototypeMenuInfoBackdrop")?.addEventListener("click", close);
  $("#prototypeMenuInfoClose")?.addEventListener("click", close);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  return gate;
}

function openPrototypeMenuInfo() {
  const gate = ensurePrototypeMenuInfo();
  $("#prototypeMenuInfoBackdrop")?.classList.add("is-open");
  gate.classList.add("is-open");
  $("#prototypeMenuInfoClose")?.classList.add("is-open");
  gate.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
}

function initHeader() {
  const header = $("#siteHeader");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const triggers = $$("[data-menu-toggle]");
  const panel = $("#menuPanel");
  $$("[data-prototype-menu-info]", header).forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openPrototypeMenuInfo();
    });
  });
  let closeMenu = () => {};
  let closePos = () => {};
  if (triggers.length && panel) {
    const setExpanded = (v) => triggers.forEach((t) => t.setAttribute("aria-expanded", v));
    const close = () => { panel.setAttribute("hidden", ""); setExpanded("false"); document.body.classList.remove("menu-open"); };
    const open = () => { panel.removeAttribute("hidden"); setExpanded("true"); document.body.classList.add("menu-open"); };
    closeMenu = close;
    triggers.forEach((t) => t.addEventListener("click", (e) => { e.stopPropagation(); closePos(); panel.hasAttribute("hidden") ? open() : close(); }));
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
  closePos = () => {
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
      if (willOpen) closeMenu();
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

/* --- Polished chart renderer used by the live game page --- */
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
// Game Stats panel — combined score-worm card followed by the core team comparison.
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
  const order = g.league === "nfl"
    ? ["Total Team Yards", "Pass Yards", "Rush Yards", "Possession Time", "Turnovers"]
    : ["Field Goal %", "Rebounds", "Assists", "3PT %", "Turnovers"];
  let picks = order.map((lbl) => g.stats.find((s) => s.label === lbl)).filter(Boolean);
  if (picks.length < 5) picks = g.stats.slice(0, 5);
  // Centre-anchored bars: each team grows from the middle toward its own side (home
  // left, away right), scaled so the leader of that stat reaches the edge.
  const statRow = (s) => {
    const homeMetric = s.homeMetric ?? Number(s.home);
    const awayMetric = s.awayMetric ?? Number(s.away);
    const maxB = Math.max(homeMetric, awayMetric) || 1;
    return `<div class="stat-block">
      <div class="stat-caption"><span class="stat-val tnum">${s.home}</span><span class="stat-label">${s.label}</span><span class="stat-val tnum">${s.away}</span></div>
      <div class="stat-bar-c">
        <span class="stat-fill-h" style="width:${((homeMetric / maxB) * 50).toFixed(1)}%"></span>
        <span class="stat-fill-a" style="width:${((awayMetric / maxB) * 50).toFixed(1)}%"></span>
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
      <div class="stats-teams">${teamAbbrMarkHTML(g.home, "stats-logo")}<span class="stats-title">Game Stats</span>${teamAbbrMarkHTML(g.away, "stats-logo")}</div>
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
  const compactScore = String(g.home.score).length >= 3 || String(g.away.score).length >= 3;
  const back = gameBackTarget();
  const periodLabel = String(g.period || "").trim();
  const isFinal = /^(final|ft)$/i.test(periodLabel);
  const isQuarterTime = !isFinal && !g.clock;
  const clockState = isFinal ? "is-final" : isQuarterTime ? "is-quarter-time" : "is-live";
  const clockLabel = isFinal ? "Final" : isQuarterTime ? "QTR Time" : periodLabel;

  const teamCol = (side) => {
    const t = g[side];
    const leading = lead === side ? " is-leading" : "";
    return `<div class="gb-team${leading}">${teamAbbrMarkHTML(t, "gb-logo")}<span class="gb-abbr">${t.name}</span></div>`;
  };

  const marketsHTML = `
    <div class="mkt-grid">
      <div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>
      ${marketRow(g, "GTL", "Get the Lead", "gtl")}
      ${marketRow(g, "TIE", "", "tie")}
      ${marketRow(g, "KTL", "Keep the Lead", "ktl")}
    </div>
    <p class="bet-help">Tap a price to start your bet.</p>`;

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
    <section class="gb" id="scorecardSection" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <div class="gb-glow" aria-hidden="true"></div>
      <div class="container gb-inner">
        <div class="gb-topbar">
          <a class="gb-back" href="${back.href}" aria-label="Back to ${back.label}">${CHEVRON}<span>${back.label}</span></a>
        </div>
        <div class="gb-score-stack">
          <p class="gb-league">${g.league.toUpperCase()} · Regular season</p>
          <span class="live-badge game-clock-badge ${clockState}">
            <span class="game-period">${!isFinal && !isQuarterTime ? '<span class="live-dot"></span>' : ""}${clockLabel}</span>
            ${!isFinal && !isQuarterTime ? `<span class="game-clock tnum" data-game-clock="${g.id}">${g.clock}</span>` : ""}
          </span>
          <div class="gb-score${compactScore ? " is-compact-score" : ""}">
            ${teamCol("home")}
            <div class="gb-numbers">
              <span class="gb-num tnum${lead === "home" ? " is-leading" : ""}">${g.home.score}</span>
              <span class="gb-dash">–</span>
              <span class="gb-num tnum${lead === "away" ? " is-leading" : ""}">${g.away.score}</span>
            </div>
            ${teamCol("away")}
          </div>
        </div>
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

// The Open Positions card set for the header dropdown uses one consistent layout.
const openPositionCards = (list) => list.map((p, i) => positionCardA(p, i)).join("");

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
    const openSheet = $("#betSheet");
    const pauseOpenDrawer = openSheet?.classList.contains("is-open") && betState.game?.id === RECALC_DEMO_GAME_ID && betState.mode === "buy";
    if (pauseOpenDrawer) {
      betState.priceUpdating = true;
      updateBetSheet();
    }
    setTimeout(() => {
      rows.forEach((row) => {                       // reveal the recalculated prices
        const yesEl = row.querySelector(".price.yes");
        const noEl = row.querySelector(".price.no");
        if (!yesEl || !noEl) return;
        const yes = Math.max(5, Math.min(95, parseInt(yesEl.textContent, 10) + priceDelta()));
        yesEl.textContent = `${yes}¢`;
        noEl.textContent = `${100 - yes}¢`;
        if (pauseOpenDrawer && yesEl.dataset.market) betState.markets[yesEl.dataset.market] = { yes, no: 100 - yes };
        [yesEl, noEl].forEach((el) => { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); });
      });
      if (pauseOpenDrawer) {
        betState.priceUpdating = false;
        updateBetSheet();
      }
      banner.hidden = true;
      section.classList.remove("is-recalc");
      prices.forEach((p) => { p.disabled = false; });
      busy = false;
    }, 1600);
  }, 9000);
}

/* ----------------------------------------------- BET DRAWER (two-step) */
const betState = { game: null, market: "gtl", contract: "yes", draftMarket: "gtl", draftContract: "yes", quantity: 100, step: 1, markets: {}, limit: null, limitOpen: false, typeOpen: false, confirming: null };
const MAX_TRANSACTION_CREDITS = 1000;
const money = (v) => `$${v.toFixed(2)}`;

function limitValidation(maxPrice) {
  if (!betState.limitOpen) return { valid: true, message: "" };
  if (betState.limit == null || betState.limit < 1) return { valid: false, message: "Minimum limit price is 1¢." };
  if (betState.limit > maxPrice) return { valid: false, message: `Maximum limit price is ${maxPrice}¢.` };
  return { valid: true, message: `Min 1¢ · Max ${maxPrice}¢` };
}

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

function transactionValidation(quantity, purchasePrice) {
  if (quantity < 1) return { valid: false, message: "Enter at least 1 contract." };
  const valid = purchasePrice <= MAX_TRANSACTION_CREDITS;
  return {
    valid,
    message: valid ? "" : `The maximum purchase price for one bet is ${MAX_TRANSACTION_CREDITS.toLocaleString("en-US")} credits.`,
  };
}

function fillScoreboard(sb, g) {
  if (!sb) return;
  const lead = leaderOf(g);
  sb.style.setProperty("--home-color", g.home.color);
  sb.style.setProperty("--away-color", g.away.color);
  const team = (side) => {
    const t = g[side];
    return `<div class="bs-team bs-${side}${lead === side ? " is-leading" : ""}">
        ${teamMarkHTML(t, "bs-logo")}
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

          <div class="trade-pause drawer-trade-pause buy-only" data-bet-paused role="status" hidden><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div>

          <div class="drawer-bet-heading buy-only" data-buy-main>
            <strong data-bet-heading>Get the Lead - Yes</strong>
            <button class="limit-toggle" data-change-bet-type>Change</button>
          </div>

          <!-- BUY: how many to buy -->
          <div class="bet-field contracts-field buy-only" data-buy-main>
            <span class="bet-label">Select number of contracts</span>
            <input class="num-input" data-qty-input type="text" inputmode="numeric" value="100" aria-label="Number of contracts" />
            <div class="qty-quick">
              <button data-qty-set="50">50</button>
              <button data-qty-set="100">100</button>
              <button data-qty-set="500">500</button>
              <button data-qty-set="1000">1,000</button>
            </div>
            <p class="limit-minmax transaction-limit" data-transaction-limit role="alert" hidden></p>
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

          <div class="drawer-bet-editor buy-only" data-bet-type-editor hidden>
            <div class="bet-field">
              <span class="bet-label">Bet type</span>
              <div class="seg seg-3" role="group" aria-label="Bet type">
                <button data-market="gtl">GTL</button>
                <button data-market="tie">TIE</button>
                <button data-market="ktl">KTL</button>
              </div>
            </div>

            <div class="bet-field">
              <span class="bet-label">Pick a side</span>
              <div class="bet-toggle" data-active="yes" role="group" aria-label="Side">
                <button class="bt-opt yes" data-contract="yes"><span class="bt-side">Yes</span><span class="bt-price tnum" data-yes-price>—</span></button>
                <button class="bt-opt no" data-contract="no"><span class="bt-side">No</span><span class="bt-price tnum" data-no-price>—</span></button>
              </div>
            </div>
          </div>

          <div class="bet-field drawer-price-mode buy-only" data-buy-main>
            <span class="bet-label">Order price</span>
            <div class="seg drawer-price-toggle" role="group" aria-label="Order price">
              <button type="button" data-price-mode="market">Market <strong class="tnum" data-market-price>—</strong></button>
              <label class="drawer-price-option" data-price-mode="limit"><span>Set Limit</span><span class="drawer-limit-entry" data-limit-entry hidden><input data-limit-input type="text" inputmode="numeric" maxlength="3" placeholder="–" aria-label="Limit price in cents" /><span aria-hidden="true">¢</span></span></label>
            </div>
            <p class="limit-minmax" data-limit-minmax hidden></p>
          </div>

          <div class="bet-highlight drawer-purchase buy-only" data-buy-main>
            <span class="bet-label">Credit price</span>
            <span class="bet-total-big tnum" data-total-big>$0.00</span>
            <p class="potential-win">Potential profit of <strong data-profit-big>$0.00</strong> after <a href="#" class="fees-link" data-fees-link>fees</a>. Remaining credit balance <strong class="remaining-credit-value" data-remaining-balance>$0.00</strong> after purchase.</p>
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
        <button class="btn btn-primary bet-primary" data-bet-primary>Buy</button>
      </footer>

      <div class="bet-success">
        <div class="success-content">
          <div class="bet-success-head">
            <span class="bet-countdown-clock" role="timer" aria-live="polite" aria-label="5 seconds remaining">
              <strong data-confirm-countdown>5</strong>
            </span>
            <h3 class="bet-success-title" data-success-title>Place Bet?</h3>
            <p class="bet-success-sub" data-success-line>You have 5 seconds to cancel the bet, or press Blitz Buy to place immediately.</p>
          </div>
          <div class="bet-field">
            <span class="bet-label">Order summary</span>
            <div class="summary">
              <div class="summary-row"><span>Bet Type</span><strong data-sx-type>—</strong></div>
              <div class="summary-row"><span>Contract price</span><strong data-sx-price>—</strong></div>
              <div class="summary-row"><span>Contracts</span><strong data-sx-qty>—</strong></div>
              <div class="summary-row"><span>Subtotal</span><strong data-sx-subtotal>—</strong></div>
              <div class="summary-row"><span>Trading fee</span><strong data-sx-fee>—</strong></div>
              <div class="summary-row total"><span data-sx-total-label>Total paid</span><strong data-sx-total>—</strong></div>
            </div>
          </div>
        </div>
        <div class="success-actions">
          <button class="bet-secondary cancel-bet" data-cancel-bet>Cancel Bet</button>
          <button class="btn btn-primary success-close" data-success-close>Blitz Buy</button>
        </div>
      </div>
    </aside>
    <button class="btn btn-secondary bet-sheet-close" id="betClose" data-bet-close>Close</button>
  `);
  sheet = $("#betSheet");

  const qtyInput = sheet.querySelector("[data-qty-input]");
  const limitInput = sheet.querySelector("[data-limit-input]");

  $$("[data-bet-close]").forEach((el) => el.addEventListener("click", closeBetSheet));
  $$("[data-market]", sheet).forEach((b) => b.addEventListener("click", () => {
    betState.draftMarket = b.dataset.market;
    updateBetSheet();
  }));
  $$("[data-contract]", sheet).forEach((b) => b.addEventListener("click", () => {
    betState.draftContract = b.dataset.contract;
    updateBetSheet();
  }));
  $$("[data-qty-set]", sheet).forEach((b) => b.addEventListener("click", () => {
    betState.quantity = Number(b.dataset.qtySet);
    qtyInput.value = betState.quantity.toLocaleString("en-US");
    updateBetSheet();
  }));
  sheet.querySelector("[data-change-bet-type]").addEventListener("click", () => {
    betState.draftMarket = betState.market;
    betState.draftContract = betState.contract;
    betState.typeOpen = true;
    updateBetSheet();
  });
  sheet.querySelector("[data-breakdown]").addEventListener("click", () => {
    if (betState.typeOpen) {
      betState.draftMarket = betState.market;
      betState.draftContract = betState.contract;
      betState.typeOpen = false;
      updateBetSheet();
      return;
    }
    betState.step = 2;
    updateBetSheet();
  });
  sheet.querySelector("[data-bet-back]").addEventListener("click", () => { betState.step = 1; updateBetSheet(); });
  sheet.querySelector("[data-bet-primary]").addEventListener("click", () => {
    if (betState.typeOpen) {
      if (betState.draftMarket === betState.market && betState.draftContract === betState.contract) return;
      betState.market = betState.draftMarket;
      betState.contract = betState.draftContract;
      betState.limit = null;
      betState.limitOpen = false;
      betState.typeOpen = false;
      updateBetSheet();
      return;
    }
    placeBet();
  });
  sheet.querySelector("[data-cancel-bet]").addEventListener("click", cancelBet);
  sheet.querySelector("[data-success-close]").addEventListener("click", blitzBet);
  sheet.addEventListener("click", (e) => { if (e.target.closest("[data-fees-link]")) { e.preventDefault(); goToFees(); } }); // delegated: covers the buy line AND the (regenerated) sell line's fees link

  qtyInput.addEventListener("input", () => {
    const digits = qtyInput.value.replace(/[^0-9]/g, "");
    const value = parseInt(digits, 10);
    betState.quantity = Number.isNaN(value) ? 0 : value;
    qtyInput.value = betState.quantity ? betState.quantity.toLocaleString("en-US") : "";
    updateBetSheet();
  });
  limitInput.addEventListener("input", () => {
    const value = limitInput.value.replace(/[^0-9]/g, "").slice(0, 3);
    limitInput.value = value;
    betState.limit = value === "" ? null : Number(value);
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

  sheet.querySelector("[data-price-mode=market]").addEventListener("click", () => {
    betState.limitOpen = false;
    betState.limit = null;
    updateBetSheet();
  });
  sheet.querySelector("[data-price-mode=limit]").addEventListener("click", () => {
    if (!betState.limitOpen) {
      betState.limitOpen = true;
      const mk = betState.markets[betState.market] || { yes: 50, no: 50 };
      betState.limit = betState.contract === "yes" ? mk.yes : mk.no; // start at the live price
      limitInput.value = betState.limit;
    }
    updateBetSheet();
    requestAnimationFrame(() => limitInput.focus());
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
  const { mk, marketPrice, priceCents, qty, subtotal, fee, total, payout, profit, net } = computeBet();

  sheet.setAttribute("data-step", betState.step);
  sheet.setAttribute("data-mode", betState.mode || "buy");
  sheet.setAttribute("data-type-open", betState.typeOpen ? "true" : "false");
  sheet.classList.toggle("is-updating-price", !!betState.priceUpdating);
  const editorMarket = betState.typeOpen ? betState.draftMarket : betState.market;
  const editorContract = betState.typeOpen ? betState.draftContract : betState.contract;
  const editorPrices = betState.markets[editorMarket] || { yes: 50, no: 50 };
  sheet.querySelector("[data-yes-price]").textContent = betState.priceUpdating ? "—" : `${editorPrices.yes}¢`;
  sheet.querySelector("[data-no-price]").textContent = betState.priceUpdating ? "—" : `${editorPrices.no}¢`;

  $$("[data-market]", sheet).forEach((b) => b.classList.toggle("is-active", b.dataset.market === editorMarket));
  $$("[data-contract]", sheet).forEach((b) => b.classList.toggle("is-active", b.dataset.contract === editorContract));
  sheet.querySelector(".bet-toggle").dataset.active = editorContract;
  $$("[data-qty-set]", sheet).forEach((b) => b.classList.toggle("is-active", Number(b.dataset.qtySet) === qty));

  sheet.querySelector("[data-bet-type-editor]").hidden = !betState.typeOpen;
  $$('[data-buy-main]', sheet).forEach((element) => { element.hidden = betState.typeOpen; });
  sheet.querySelector("[data-bet-paused]").hidden = betState.typeOpen || !betState.priceUpdating;
  sheet.querySelector("[data-bet-heading]").textContent = `${MARKET_LABELS[betState.market]} - ${betState.contract === "yes" ? "Yes" : "No"}`;
  // Buying more of an existing position: show the running total they'll hold after this purchase
  const qtyTotalEl = sheet.querySelector("[data-qty-total]");
  if (qtyTotalEl) {
    const showTotal = betState.mode === "buy" && (betState.existingQty || 0) > 0;
    qtyTotalEl.hidden = !showTotal;
    if (showTotal) qtyTotalEl.innerHTML = `Total contracts after purchase — <strong>${(betState.existingQty + (betState.quantity || 0)).toLocaleString("en-US")}</strong>`;
  }

  // Warn when this buy takes the opposite side of a position already held in this game
  const conflictEl = sheet.querySelector("[data-conflict-warning]");
  if (conflictEl) {
    const clash = betState.mode === "buy" && betState.game && betState.editPending == null ? conflictingPosition(betState.game.id, betState.market, betState.contract) : null;
    conflictEl.hidden = !clash;
    if (clash) conflictEl.innerHTML = `${WARNING_ICON}<span>You already hold <strong>${MARKET_LABELS[clash.market]} · ${clash.side.toUpperCase()}</strong> in this game — this bet takes the opposite side.</span>`;
  }

  // Market / limit price control
  const marketMode = sheet.querySelector("[data-price-mode=market]");
  const limitMode = sheet.querySelector("[data-price-mode=limit]");
  const limitEntry = sheet.querySelector("[data-limit-entry]");
  const limitStatus = limitValidation(marketPrice);
  const transactionStatus = transactionValidation(qty, total);
  marketMode.classList.toggle("is-active", !betState.limitOpen);
  limitMode.classList.toggle("is-active", betState.limitOpen);
  limitMode.classList.toggle("is-error", betState.limitOpen && !limitStatus.valid);
  limitEntry.hidden = !betState.limitOpen;
  sheet.querySelector("[data-limit-input]").setAttribute("aria-invalid", betState.limitOpen && !limitStatus.valid ? "true" : "false");
  sheet.querySelector("[data-market-price]").textContent = betState.priceUpdating ? "—" : `${marketPrice}¢`;
  const limitMessage = sheet.querySelector("[data-limit-minmax]");
  limitMessage.hidden = !betState.limitOpen;
  limitMessage.classList.toggle("is-error", betState.limitOpen && !limitStatus.valid);
  if (betState.limitOpen) {
    limitMessage.textContent = limitStatus.message;
  }
  const transactionMessage = sheet.querySelector("[data-transaction-limit]");
  transactionMessage.hidden = betState.typeOpen || transactionStatus.valid;
  transactionMessage.textContent = transactionStatus.message;
  transactionMessage.classList.toggle("is-error", !transactionStatus.valid);
  const quantityInput = sheet.querySelector("[data-qty-input]");
  quantityInput.classList.toggle("is-error", betState.mode === "buy" && !transactionStatus.valid);
  quantityInput.setAttribute("aria-invalid", betState.mode === "buy" && !transactionStatus.valid ? "true" : "false");

  // highlight — total bet + green profit-after-fees
  sheet.querySelector("[data-total-big]").textContent = betState.priceUpdating ? "—" : money(total);
  sheet.querySelector("[data-profit-big]").textContent = money(net);
  sheet.querySelector("[data-remaining-balance]").textContent = money(Math.max(0, USER.balance - total));

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
    const unchangedType = betState.draftMarket === betState.market && betState.draftContract === betState.contract;
    const transactionTooLarge = betState.mode === "buy" && !betState.typeOpen && !transactionStatus.valid;
    primary.disabled = !!betState.priceUpdating || transactionTooLarge || (betState.typeOpen && unchangedType) || (betState.limitOpen && !limitStatus.valid);
    primary.textContent = betState.typeOpen ? "Confirm Bet Type" : betState.editPending != null ? "Update Bet" : (betState.mode === "sell" ? "Sell" : (betState.step === 2 ? "Place Bet" : "Buy"));
  }
  const breakdown = sheet.querySelector("[data-breakdown]");
  if (breakdown) breakdown.textContent = betState.typeOpen ? "Return" : "See Details";
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
  sheet.querySelector("[data-qty-input]").value = betState.quantity.toLocaleString("en-US");
  sheet.querySelector("[data-limit-input]").value = betState.limit != null ? betState.limit : "";
  syncLimitSize();
}

function openBetSheet(gameId, market, side, markets, opts = {}) {
  const g = GAMES.find((x) => x.id === gameId);
  if (!g) return;
  Object.assign(betState, {
    game: g, mode: opts.mode || "buy", market, contract: side, draftMarket: market, draftContract: side, markets,
    quantity: opts.quantity || 100, step: 1, typeOpen: false,
    holding: 0, avg: 0, sellQty: 0,
    position: opts.position || null, existingQty: opts.existingQty || 0, committed: false, prevPos: null, confirming: null,
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

// Edit a pending limit order — opens the buy drawer prefilled, with "Update Bet" instead of "Buy"
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
    game: g, mode: "sell", market: pos.market, contract: pos.side, draftMarket: pos.market, draftContract: pos.side, markets: marketsFromGame(g),
    holding: pos.qty, avg: pos.avg, sellQty: pos.qty,
    position: null, existingQty: 0, committed: false, prevPos: null, editPending: null, confirming: null,
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
  betState.confirming = null;
  $("#betBackdrop").classList.remove("is-open");
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
}

function placeBet() {
  if (betState.priceUpdating) return;
  if (betState.mode === "sell") return sellNow();
  const activeMarket = betState.markets[betState.market] || { yes: 50, no: 50 };
  const activePrice = betState.contract === "yes" ? activeMarket.yes : activeMarket.no;
  if (!limitValidation(activePrice).valid) return;
  const bet = computeBet();
  if (!transactionValidation(bet.qty, bet.total).valid) return;
  if (betState.editPending != null) return updatePendingOrder();
  const sheet = ensureBetSheet();
  const { priceCents, qty, subtotal, fee, total } = computeBet();
  sheet.querySelector("[data-success-title]").textContent = "Place Bet?";
  sheet.querySelector("[data-success-line]").textContent = "You have 5 seconds to cancel the bet, or press Blitz Buy to place immediately.";
  sheet.querySelector("[data-sx-type]").textContent = `${MARKET_LABELS[betState.market]} ${betState.contract.toUpperCase()}`;
  sheet.querySelector("[data-sx-price]").textContent = `${priceCents}¢`;
  sheet.querySelector("[data-sx-qty]").textContent = qty;
  sheet.querySelector("[data-sx-subtotal]").textContent = money(subtotal);
  sheet.querySelector("[data-sx-fee]").textContent = money(fee);
  sheet.querySelector("[data-sx-total-label]").textContent = "Total to pay";
  sheet.querySelector("[data-sx-total]").textContent = money(total);
  sheet.querySelector("[data-cancel-bet]").textContent = "Cancel Bet";
  sheet.querySelector("[data-success-close]").textContent = "Blitz Buy";
  sheet.classList.add("is-success");
  betState.confirming = "buy";
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

// Cancel the pending order before the five-second confirmation window closes.
function cancelBet() {
  betState.confirming = null;
  closeBetSheet();
}

function sellNow() {
  if (betState.priceUpdating) return;
  const sheet = ensureBetSheet();
  const s = computeSell();
  if (s.qty < 1) return;
  sheet.querySelector("[data-success-title]").textContent = "Place Sale?";
  sheet.querySelector("[data-success-line]").textContent = "You have 5 seconds to cancel the sale, or press Blitz Sell to place immediately.";
  sheet.querySelector("[data-sx-type]").textContent = `${MARKET_LABELS[betState.market]} ${betState.contract.toUpperCase()}`;
  sheet.querySelector("[data-sx-price]").textContent = `${s.priceCents}¢`;
  sheet.querySelector("[data-sx-qty]").textContent = s.qty;
  sheet.querySelector("[data-sx-subtotal]").textContent = money(s.gross);
  sheet.querySelector("[data-sx-fee]").textContent = money(s.fee);
  sheet.querySelector("[data-sx-total-label]").textContent = "You receive";
  sheet.querySelector("[data-sx-total]").textContent = money(s.proceeds);
  sheet.querySelector("[data-cancel-bet]").textContent = "Cancel Sale";
  sheet.querySelector("[data-success-close]").textContent = "Blitz Sell";
  sheet.classList.add("is-success");
  betState.confirming = "sell";
  stopBetTicker();
  startCancelTimer();
}

function commitConfirmedOrder() {
  const action = betState.confirming;
  if (!action) return;
  stopCancelTimer();

  if (action === "buy") {
    const { priceCents, qty } = computeBet();
    const pos = betState.position;
    if (pos) {
      betState.prevPos = { qty: pos.qty, avg: pos.avg };
      const newQty = pos.qty + qty;
      pos.avg = Math.round((pos.qty * pos.avg + qty * priceCents) / newQty);
      pos.qty = newQty;
      betState.committed = true;
      refreshPositionSurfaces();
    }
  }

  betState.confirming = null;
  closeBetSheet();
  showToast(action === "sell" ? "Sale placed" : "Bet placed", "success");
}

function blitzBet() {
  commitConfirmedOrder();
}

let cancelTimer = null;
let confirmCountdownTimer = null;
function startCancelTimer() {
  stopCancelTimer();
  const clock = $("#betSheet")?.querySelector(".bet-countdown-clock");
  const count = clock?.querySelector("[data-confirm-countdown]");
  if (!clock || !count) return;
  let remaining = 5;
  const renderCountdown = () => {
    count.textContent = remaining;
    clock.setAttribute("aria-label", `${remaining} second${remaining === 1 ? "" : "s"} remaining`);
    clock.style.setProperty("--bet-confirm-progress", String(remaining / 5));
  };
  clock.classList.add("is-timer-resetting");
  renderCountdown();
  void clock.offsetWidth;
  clock.classList.remove("is-timer-resetting");
  confirmCountdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining >= 0) renderCountdown();
  }, 1000);
  cancelTimer = setTimeout(commitConfirmedOrder, 5000);
}
function stopCancelTimer() {
  if (cancelTimer) { clearTimeout(cancelTimer); cancelTimer = null; }
  if (confirmCountdownTimer) { clearInterval(confirmCountdownTimer); confirmCountdownTimer = null; }
}

function goToFees() {
  const p = new URLSearchParams({ game: betState.game.id, market: betState.market, side: betState.contract, qty: betState.quantity });
  if (betState.limit != null) p.set("limit", betState.limit);
  location.href = "fees.html?" + p.toString();
}

/* ---------------------------------------------- AUTH GATE (guests betting) */
// Remember the bet a guest tried to place, so login/sign-up can resume it
const INTENT_KEY = "gtl-bet-intent";
const WELCOME_CREDIT = 1500;
function setBetIntent(o) { try { localStorage.setItem(INTENT_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } }
function clearBetIntent() { try { localStorage.removeItem(INTENT_KEY); } catch (e) { /* ignore */ } }
function hasBetIntent() {
  try { return !!JSON.parse(localStorage.getItem(INTENT_KEY) || "null")?.id; } catch (e) { return false; }
}
function postAuthDest(fallback = "home.html") {
  let intent = null;
  try { intent = JSON.parse(localStorage.getItem(INTENT_KEY) || "null"); } catch (e) { /* ignore */ }
  clearBetIntent();
  if (intent && intent.id) {
    const p = new URLSearchParams({ id: intent.id, bet: "1", market: intent.market || "gtl", side: intent.side || "yes", qty: "100" });
    return "game.html?" + p.toString();
  }
  return fallback;
}
function postSignupDest() {
  return "welcome.html";
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
  const scorecard = $("#scorecardSection");
  const hero = $(".markets .mkt-row"); // first row = Get the Lead
  if (!bar || !hero || !scorecard) return;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => bar.classList.toggle("is-visible", !entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(hero);
  }
  bar.querySelector(".betbar-cta").addEventListener("click", () => {
    scorecard.scrollIntoView({ behavior: "smooth", block: "start" });
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
function syncUserBalanceFromAuth() {
  const auth = getAuth();
  const storedBalance = Number(auth?.balance);
  if (!Number.isFinite(storedBalance)) return;
  const isHome = !!$("#gameGrid") && !!$(".hero");
  USER.balance = auth.welcomeCreditPending && isHome ? 0 : storedBalance;
}
function firstNameFor(auth = getAuth()) {
  const value = auth?.firstName || auth?.name || USER.name;
  return String(value).trim().split(/\s+/)[0] || "Player";
}
function currentName() { return firstNameFor(); }
function currentPositions() {
  return new URLSearchParams(location.search).get("ds-positions") === "empty" ? [] : USER.positions;
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[ch]));
}
function nameFromEmail(email) {
  if (!email) return USER.name;
  const local = String(email).split("@")[0].replace(/[._+-]+/g, " ").trim();
  if (!local) return USER.name;
  return local.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function initialsFromName(name) {
  const parts = String(name || USER.name).trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] || "U").slice(0, 2)).toUpperCase();
}
function profileProvider(auth) {
  const provider = auth?.provider || "password";
  if (provider === "google") return { label: "Google", className: "google", mark: "G", hasPassword: false };
  if (provider === "apple") return { label: "Apple", className: "apple", mark: "Apple", hasPassword: false };
  return { label: "Email and password", className: "password", mark: "••", hasPassword: true };
}

/* --------------------------------------------------------------- RANKING */
const RANKING_RESET_WINDOW_MS = (((6 * 24 + 10) * 60 + 15) * 60 + 15) * 1000;
const RANKING_RESET_KEY = "gtl-ranking-reset-at";
const RANKING_USERS = [
  { rank: 1, username: "leadstorm", balance: 6840, prize: "$1,500" },
  { rank: 2, username: "fourthquarter", balance: 6210, prize: "$900" },
  { rank: 3, username: "linehunter", balance: 5980, prize: "$650" },
  { rank: 4, username: "greenlight", balance: 5625, prize: "$500" },
  { rank: 5, username: "clockedge", balance: 5240, prize: "$400" },
  { rank: 6, username: "marketmaker", balance: 4880, prize: "$300" },
  { rank: 7, username: "snapcount", balance: 4510, prize: "$250" },
  { rank: 8, username: "fastbreak", balance: 4230, prize: "$200" },
  { rank: 9, username: "leadkeeper", balance: 3980, prize: "$175" },
  { rank: 10, username: "swingtrader", balance: 3740, prize: "$125" },
];
const CURRENT_RANKING_FALLBACK = { month: 6, rank: 47, username: "You", balance: 1710, prize: "0" };
const RANKING_MONTH_RESULTS = [
  { month: 0, rank: 62, balance: 1420, prize: "0" },
  { month: 1, rank: 8, balance: 4230, prize: "$200" },
  { month: 2, rank: 24, balance: 2580, prize: "0" },
  { month: 3, rank: 3, balance: 5980, prize: "$650" },
  { month: 4, rank: 31, balance: 2210, prize: "0" },
  { month: 5, rank: 6, balance: 4880, prize: "$300" },
  { month: 6, rank: 47, balance: 1710, prize: "0" },
  { month: 7, rank: 27, balance: 2460, prize: "0" },
  { month: 8, rank: 17, balance: 3050, prize: "0" },
  { month: 9, rank: 22, balance: 2760, prize: "0" },
  { month: 10, rank: 12, balance: 3440, prize: "0" },
  { month: 11, rank: 9, balance: 3980, prize: "$175" },
];
const RANKING_TROPHY_ICON = '<svg class="rank-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 6H5.5A2.5 2.5 0 0 0 8 8.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5M12 12v4M9 20h6M10 16h4v4h-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const RANKING_MEDAL_ICON = '<svg class="rank-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 3 4 6 4-6M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12.7v3.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const RANKING_PRIZES = ["$1,500", "$900", "$650", "$500", "$400", "$300", "$250", "$200", "$175", "$125"];

function monthlyRankingRows(result, username) {
  const month = Number.isInteger(result?.month) ? result.month : new Date().getMonth();
  const currentIsTopTen = Boolean(username && result?.rank >= 1 && result.rank <= 10);
  const playerPool = RANKING_USERS
    .map((row) => row.username)
    .filter((player) => !currentIsTopTen || player.toLowerCase() !== username.toLowerCase());
  const rotation = (month * 2) % playerPool.length;
  const rotated = [...playerPool.slice(rotation), ...playerPool.slice(0, rotation)];
  let poolIndex = 0;
  return Array.from({ length: 10 }, (_, index) => {
    const rank = index + 1;
    if (currentIsTopTen && rank === result.rank) {
      return { ...result, username, prize: RANKING_PRIZES[index] };
    }
    const balance = currentIsTopTen
      ? Math.max(1, result.balance + ((result.rank - rank) * 350))
      : Math.max(1, 6800 + ((month % 4) * 90) - (index * 350));
    return { rank, username: rotated[poolIndex++], balance, prize: RANKING_PRIZES[index] };
  });
}

function rankingRowHTML(row, isCurrent = false) {
  const prize = row.prize || "-";
  const formattedBalance = Number(row.balance).toLocaleString("en-US");
  const label = `${isCurrent ? "Your rank, " : ""}position ${row.rank}, ${row.username}, balance ${formattedBalance} credits, prize ${prize}`;
  const isPodium = row.rank <= 3 && !isCurrent;
  const rankMark = isPodium
    ? `<span class="rank-medal" role="cell">${row.rank === 1 ? RANKING_TROPHY_ICON : RANKING_MEDAL_ICON}</span>`
    : `<span class="rank-pos" role="cell">${row.rank}</span>`;
  return `<div class="ranking-row${isPodium ? ` is-podium is-rank-${row.rank}` : ""}${isCurrent ? " is-current" : ""}" data-ranking-key="${escapeHTML(String(row.username).toLowerCase())}" role="row" aria-label="${escapeHTML(label)}">
    ${rankMark}
    <span class="rank-user" role="cell">${escapeHTML(row.username)}</span>
    <span class="rank-balance tnum" role="cell">${formattedBalance}</span>
    <span class="rank-prize tnum" role="cell">${escapeHTML(prize)}</span>
  </div>`;
}

function renderRanking(currentResult = CURRENT_RANKING_FALLBACK, { animate = false } = {}) {
  const list = $("[data-ranking-list]");
  const currentSlot = $("[data-ranking-current]");
  if (!list) return;
  const auth = getAuth();
  const username = auth ? String(auth.username || "You").trim() : "";
  const previousPositions = new Map();
  if (animate) {
    $$(".ranking-row[data-ranking-key]").forEach((row) => {
      previousPositions.set(row.dataset.rankingKey, row.getBoundingClientRect());
    });
  }
  const rows = monthlyRankingRows(currentResult, username);
  const currentInTopTen = Boolean(username && currentResult.rank >= 1 && currentResult.rank <= 10);
  list.innerHTML = rows.map((row) => {
    return rankingRowHTML(row, username && row.username.toLowerCase() === username.toLowerCase());
  }).join("");
  if (currentSlot) {
    if (username && !currentInTopTen) {
      currentSlot.hidden = false;
      currentSlot.innerHTML = rankingRowHTML({ ...currentResult, username }, true);
    } else {
      currentSlot.hidden = true;
      currentSlot.innerHTML = "";
    }
  }
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(() => {
      $$(".ranking-row[data-ranking-key]").forEach((row, index) => {
        const previous = previousPositions.get(row.dataset.rankingKey);
        const next = row.getBoundingClientRect();
        const fromY = previous ? previous.top - next.top : 18;
        const fromX = previous ? previous.left - next.left : 0;
        row.animate([
          { transform: `translate(${fromX}px, ${fromY}px)`, opacity: previous ? 0.72 : 0 },
          { transform: "translate(0, 0)", opacity: 1 },
        ], {
          duration: row.classList.contains("is-current") ? 620 : 460,
          delay: Math.min(index * 18, 120),
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        });
        if (row.classList.contains("is-current")) {
          row.classList.add("is-month-arrival");
          row.addEventListener("animationend", () => row.classList.remove("is-month-arrival"), { once: true });
        }
      });
    });
  }
}

function initRankingMonthSelect() {
  const root = $("[data-ranking-month-select]");
  if (!root) return;
  const trigger = $("[data-ranking-month-trigger]", root);
  const label = $("[data-ranking-month-label]", root);
  const menu = $("[data-ranking-month-menu]", root);
  if (!trigger || !label || !menu) return;

  const now = new Date();
  const currentMonth = now.getMonth();
  const year = now.getFullYear();
  const monthName = new Intl.DateTimeFormat("en", { month: "long" });
  const available = RANKING_MONTH_RESULTS
    .filter((item) => item.month <= currentMonth)
    .sort((a, b) => b.month - a.month);
  const authed = isAuthed();
  let selectedMonth = currentMonth;

  const close = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    root.classList.remove("is-open");
  };
  const open = () => {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    root.classList.add("is-open");
    menu.querySelector('[aria-selected="true"]')?.focus();
  };
  const selectMonth = (month) => {
    const result = available.find((item) => item.month === month);
    if (!result) return;
    selectedMonth = month;
    label.textContent = `${monthName.format(new Date(year, month, 1))} ${year}`;
    $$('[data-ranking-month]', menu).forEach((option) => {
      const selected = Number(option.dataset.rankingMonth) === month;
      option.setAttribute("aria-selected", String(selected));
      option.classList.toggle("is-selected", selected);
    });
    renderRanking(result, { animate: true });
    close();
  };

  menu.innerHTML = available.map((item) => {
    const name = monthName.format(new Date(year, item.month, 1));
    const selected = item.month === selectedMonth;
    return `<button class="ranking-month-option${selected ? " is-selected" : ""}" type="button" role="option" data-ranking-month="${item.month}" aria-selected="${String(selected)}"><span>${name}</span><strong>${authed ? `#${item.rank}` : "Sign in to view"}</strong></button>`;
  }).join("");
  label.textContent = `${monthName.format(new Date(year, selectedMonth, 1))} ${year}`;

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    menu.hidden ? open() : close();
  });
  menu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-ranking-month]");
    if (option) selectMonth(Number(option.dataset.rankingMonth));
  });
  document.addEventListener("click", (event) => { if (!root.contains(event.target)) close(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
}

function currentRankingResult() {
  const auth = getAuth();
  if (!auth) return null;
  const username = String(auth.username || "You").trim();
  const topRow = username && RANKING_USERS.find((row) => row.username.toLowerCase() === username.toLowerCase());
  return topRow ? { ...topRow, username } : { ...CURRENT_RANKING_FALLBACK, username };
}

function ensureRankingPrizeModal() {
  let gate = $("#rankingPrizeGate");
  if (gate) return gate;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="gate-backdrop ranking-prize-backdrop" id="rankingPrizeBackdrop"></div>
    <div class="ranking-celebration" data-ranking-celebration hidden aria-hidden="true">
      <span class="celebration-glow"></span>
      <div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    </div>
    <div class="auth-gate ranking-prize-gate" id="rankingPrizeGate" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="rankingPrizeTitle">
      <div class="gate-body">
        <span class="ranking-prize-kicker" data-ranking-prize-kicker>July Rankings</span>
        <span class="ranking-prize-medal" data-ranking-prize-medal hidden aria-hidden="true"></span>
        <h3 class="gate-title" id="rankingPrizeTitle">You won your ranking position.</h3>
        <p class="gate-desc" data-ranking-prize-desc></p>
        <strong class="ranking-prize-value tnum" data-ranking-prize-value hidden></strong>
      </div>
    </div>
    <button class="btn btn-secondary gate-close ranking-result-close" type="button" id="rankingPrizeClose">Close</button>`);
  gate = $("#rankingPrizeGate");
  $("#rankingPrizeBackdrop").addEventListener("click", closeRankingPrizeModal);
  $("#rankingPrizeClose").addEventListener("click", closeRankingPrizeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRankingPrizeModal(); });
  return gate;
}

function openRankingPrizeModal() {
  if (!$("[data-ranking-list]") || !isAuthed()) return;
  const result = currentRankingResult();
  if (!result) return;
  const gate = ensureRankingPrizeModal();
  const rankLabel = String(result.rank);
  const prizeLabel = result.prize || "0";
  const title = $("#rankingPrizeTitle", gate);
  const kicker = $("[data-ranking-prize-kicker]", gate);
  const desc = $("[data-ranking-prize-desc]", gate);
  const prize = $("[data-ranking-prize-value]", gate);
  const medal = $("[data-ranking-prize-medal]", gate);
  const celebration = $("[data-ranking-celebration]");
  const earnedPrize = prizeLabel !== "0" && prizeLabel !== "-";
  const topThree = earnedPrize && Number(result.rank) <= 3;
  const resultDate = new Date();
  const nextCompetitionDate = new Date(resultDate.getFullYear(), resultDate.getMonth() + 1, 1);
  const monthName = new Intl.DateTimeFormat("en", { month: "long" });
  if (kicker) kicker.textContent = `${monthName.format(resultDate)} Rankings`;
  if (title) title.textContent = `You finished in position ${rankLabel}`;
  if (desc) desc.textContent = earnedPrize
    ? "The GTL team will contact you shortly about claiming your reward."
    : `Try and reach the top 10 in ${monthName.format(nextCompetitionDate)}'s competition to receive a cash reward!`;
  if (prize) prize.textContent = prizeLabel;
  if (prize) prize.hidden = !earnedPrize;
  if (medal) {
    medal.innerHTML = `<span class="ranking-medal-ribbon ribbon-left"></span><span class="ranking-medal-ribbon ribbon-right"></span><span class="ranking-medal-face"><strong>${rankLabel}</strong></span>`;
    medal.dataset.rank = rankLabel;
    medal.hidden = !topThree;
  }
  if (celebration) celebration.hidden = !earnedPrize;
  gate.classList.toggle("is-top-three", topThree);
  $("#rankingPrizeBackdrop").classList.add("is-open");
  gate.classList.add("is-open");
  $("#rankingPrizeClose").classList.add("is-open");
  gate.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
}

function closeRankingPrizeModal() {
  const gate = $("#rankingPrizeGate");
  const backdrop = $("#rankingPrizeBackdrop");
  if (!gate || !backdrop) return;
  backdrop.classList.remove("is-open");
  gate.classList.remove("is-open");
  $("#rankingPrizeClose")?.classList.remove("is-open");
  gate.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
}

function getRankingResetAt() {
  let stored = 0;
  try { stored = Number(localStorage.getItem(RANKING_RESET_KEY)); } catch (e) { stored = 0; }
  if (stored && stored > Date.now()) return stored;
  const next = Date.now() + RANKING_RESET_WINDOW_MS;
  try { localStorage.setItem(RANKING_RESET_KEY, String(next)); } catch (e) { /* ignore */ }
  return next;
}

function rankingCountdownHTML(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const part = (num, unit) => `<span class="reset-num">${String(num).padStart(2, "0")}</span><span class="reset-unit">${unit}</span>`;
  return `${part(d, "d")} ${part(h, "h")} ${part(m, "m")}`;
}

function initRanking() {
  const countdown = $("[data-ranking-countdown]");
  const list = $("[data-ranking-list]");
  if (!countdown && !list) return;
  renderRanking();
  initRankingMonthSelect();
  openRankingPrizeModal();
  if (!countdown) return;
  let resetAt = getRankingResetAt();
  const tick = () => {
    let remaining = resetAt - Date.now();
    if (remaining <= 0) {
      resetAt = Date.now() + RANKING_RESET_WINDOW_MS;
      remaining = resetAt - Date.now();
      try { localStorage.setItem(RANKING_RESET_KEY, String(resetAt)); } catch (e) { /* ignore */ }
    }
    countdown.innerHTML = rankingCountdownHTML(remaining);
  };
  tick();
  setInterval(tick, 1000);
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
        ${teamAbbrMarkHTML(t, "team-logo")}
        <div class="team-meta"><span class="team-abbr team-name">${t.name}</span><span class="team-score tnum">${t.score}</span></div>
      </div>`;
  };
  return `<div class="game-row">${team("home")}<div class="game-center">${centerInner || ""}</div>${team("away")}</div>`;
}
const clockCenter = (g) => `<span class="period">${g.period}</span><span class="clock tnum" data-game-clock="${g.id}">${g.clock}</span>`;

const posActions = (i) => `<div class="oc-actions">
        <button class="oc-buy" data-buy="${i}">Buy More</button>
        <button class="oc-sell" data-sell="${i}">Sell</button>
      </div>`;

// Variant A — the shared position-card design: a [bet type] / [Value: value] row
// above a [side · contracts] / [return] row.
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
          <span class="oc-vr-head">Value: <span class="tnum">${money(value)}</span></span>
        </div>
        <div class="oc-row">
          <span class="oc-sub">${sideTag} · ${p.qty} contracts</span>
          <span class="oc-figures"><span class="oc-pnl ${up ? "up" : "down"} tnum">${signed(pnl)}</span></span>
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
  $$('[data-auth-only]').forEach((el) => { el.hidden = !authed; });
  $$('[data-guest-only]').forEach((el) => { el.hidden = authed; });
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
  heroInner.classList.toggle("no-open-positions", !posCards.length);
  const positionsContent = `
      <div class="positions-block">
        <div class="positions-head"><span class="eyebrow">Open Positions</span></div>
        <div class="pos-carousel" id="positionList">${posCards.join("")}</div>
        <div class="pos-footer">
          <a href="wallet.html">View All</a>
          <div class="pos-dots" id="posDots"></div>
          <a href="wallet.html#settled">View Settled</a>
        </div>
      </div>`;
  heroInner.innerHTML = `
    <div class="hero-greeting">
      <h1>Hey ${currentName()}</h1>
    </div>
    ${posCards.length ? `<div class="authed-stack">
      ${positionsContent}
      <a class="btn btn-primary authed-cta" href="#live">Live Games</a>
    </div>` : ""}`;
  if (posCards.length) bindPositionActions($("#positionList"));
  initPositionsCarousel();
}

// Settled win banner helper. It is not initialized by the standardized live-game page.
function renderSettledToast() {
  if (!$("#gameMain")) return;
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

// On the new user's first home visit, let the wallet visibly receive the
// welcome credits. The pending flag is cleared immediately so refreshes do not replay it.
function initWelcomeCreditAnimation() {
  const auth = getAuth();
  if (!auth?.welcomeCreditPending || !$("#gameGrid") || !$(".hero")) return;

  const target = Number(auth.balance) || WELCOME_CREDIT;
  setAuth({ ...auth, balance: target, welcomeCreditPending: false });
  USER.balance = target;

  const chip = $("#headerWallet .wallet-chip");
  const amountEl = $("#headerWallet .wallet-amount");
  if (!chip || !amountEl) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    amountEl.textContent = money(target);
    return;
  }

  window.setTimeout(() => {
    chip.classList.add("wallet-credit", "wallet-welcome-credit");
    const pop = document.createElement("span");
    pop.className = "wallet-pop wallet-welcome-pop tnum";
    pop.textContent = `+${money(target)}`;
    chip.appendChild(pop);

    let startedAt = null;
    const duration = 1600;
    const step = (now) => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      amountEl.textContent = money(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else {
        amountEl.textContent = money(target);
        window.setTimeout(() => {
          chip.classList.remove("wallet-credit", "wallet-welcome-credit");
          pop.remove();
        }, 700);
      }
    };
    requestAnimationFrame(step);
  }, 550);
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
    <span class="or-logos">${teamAbbrMarkHTML(g.home, "or-logo")}${teamAbbrMarkHTML(g.away, "or-logo")}</span>
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
    ${addFundsHTML()}`;
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
        <span class="or-logos">${teamAbbrMarkHTML(g.home, "or-logo")}${teamAbbrMarkHTML(g.away, "or-logo")}</span>
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
    if (v > 0) {
      USER.balance += v;
      setAuth({ ...getAuth(), balance: USER.balance });
      $("[data-balance]").textContent = money(USER.balance);
      applyAuthChrome();
    }
    close();
  });
  setAmt(50);
}

function profileGuardHTML() {
  return `<div class="profile-guard">
    <h1 class="profile-title">Profile &amp; Settings</h1>
    <p>Login to view and manage your account.</p>
    <a class="btn btn-primary" href="login.html">Login</a>
  </div>`;
}

function formatProfileDate(value, fallback) {
  if (!value) return fallback;
  const source = String(value);
  const date = new Date(source.length === 10 ? `${source}T00:00:00` : source);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function initProfile() {
  const main = $("#profileMain");
  if (!main) return;
  const auth = getAuth();
  if (!auth) { main.innerHTML = profileGuardHTML(); return; }

  const email = auth.email || "alex@gtl.test";
  const fullName = auth.name || [auth.firstName, auth.lastName].filter(Boolean).join(" ") || "Not provided";
  const username = auth.username || email.split("@")[0].replace(/[^a-z0-9_]/gi, "") || "player";
  const birthday = formatProfileDate(auth.birthday, "Not provided");
  const memberSince = formatProfileDate(auth.memberSince, "July 2026");
  const provider = profileProvider(auth);
  main.innerHTML = `
    <header class="profile-head">
      <h1 class="profile-title">Profile &amp; Settings</h1>
      <p class="profile-intro">Manage your GTL profile, account and preferences.</p>
    </header>

    <section class="profile-section" aria-labelledby="profileSectionTitle">
      <h2 class="profile-section-title" id="profileSectionTitle">Profile</h2>
      <div class="profile-edit-card">
        <div class="profile-username-view" data-username-view>
          <div class="profile-username-copy">
            <span>Username</span>
            <strong data-username-value>@${escapeHTML(username)}</strong>
          </div>
          <button class="btn btn-secondary btn-sm" type="button" data-username-edit>Edit</button>
        </div>
        <form class="profile-username-form" data-username-form hidden novalidate>
          <div class="profile-username-field">
            <input class="profile-username-input" name="username" type="text" value="${escapeHTML(username)}" autocomplete="username" aria-label="Username" maxlength="20" />
            <p class="profile-username-error" data-username-error role="alert" hidden></p>
          </div>
          <div class="profile-username-actions">
            <button class="btn btn-primary btn-sm" type="submit">Save</button>
            <button class="btn btn-secondary btn-sm" type="button" data-username-cancel>Cancel</button>
          </div>
        </form>
      </div>
    </section>

    <section class="profile-section" aria-labelledby="accountSectionTitle">
      <h2 class="profile-section-title" id="accountSectionTitle">Account</h2>
      <div class="account-settings-list">
        <div class="account-setting-row"><span>Full name</span><strong>${escapeHTML(fullName)}</strong></div>
        <div class="account-setting-row"><span>Email</span><strong>${escapeHTML(email)}</strong></div>
        <div class="account-setting-row"><span>Date of birth</span><strong>${birthday}</strong></div>
        <div class="account-setting-row"><span>Member since</span><strong>${memberSince}</strong></div>
        <div class="account-setting-row"><span>Credits</span><a class="account-inline-link" href="wallet.html">${USER.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} credits</a></div>
        <div class="account-setting-row"><span>Connected with</span><strong><span class="account-provider ${provider.className}"><span class="account-provider-mark">${provider.mark}</span>${provider.label}</span></strong></div>
        ${provider.hasPassword ? `<div class="account-setting-row"><span>Password</span><a class="account-inline-link" href="forgot.html">Change password</a></div>` : ""}
      </div>
      ${provider.hasPassword ? "" : `<p class="account-auth-note">Password changes are managed through your ${provider.label} account.</p>`}
    </section>

    <section class="profile-section" aria-labelledby="preferencesSectionTitle">
      <h2 class="profile-section-title" id="preferencesSectionTitle">Preferences</h2>
      <div class="profile-preference-card">
        <div class="profile-preference-copy">
          <strong>Appearance</strong>
          <span>Switch between light and dark mode.</span>
        </div>
        <button class="profile-theme-control" type="button" data-theme-toggle aria-label="Switch colour theme">${THEME_SWITCH}</button>
      </div>
      <div class="profile-preference-card">
        <div class="profile-preference-copy">
          <strong>Notifications</strong>
          <span>Email notification preferences will live here.</span>
        </div>
        <span class="status-pill">Coming soon</span>
      </div>
    </section>

    <section class="profile-section" aria-labelledby="managementSectionTitle">
      <h2 class="profile-section-title" id="managementSectionTitle">Account management</h2>
      <div class="account-actions">
        <a class="btn btn-secondary btn-block account-link-button" href="betting-controls.html">Betting Controls</a>
        <a class="btn btn-danger btn-block account-link-button" href="delete-account.html">Delete Account</a>
      </div>
    </section>`;

  const usernameView = $("[data-username-view]", main);
  const usernameForm = $("[data-username-form]", main);
  const usernameInput = $(".profile-username-input", usernameForm);
  const usernameError = $("[data-username-error]", usernameForm);
  const closeUsernameEdit = () => {
    usernameInput.value = getAuth()?.username || username;
    usernameInput.classList.remove("is-error");
    usernameError.hidden = true;
    usernameForm.hidden = true;
    usernameView.hidden = false;
  };
  $("[data-username-edit]", usernameView).addEventListener("click", () => {
    usernameView.hidden = true;
    usernameForm.hidden = false;
    usernameInput.focus();
    usernameInput.select();
  });
  $("[data-username-cancel]", usernameForm).addEventListener("click", closeUsernameEdit);
  usernameInput.addEventListener("input", () => {
    usernameInput.classList.remove("is-error");
    usernameError.hidden = true;
  });
  usernameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextUsername = usernameInput.value.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nextUsername)) {
      usernameInput.classList.add("is-error");
      usernameError.textContent = "Use 3–20 letters, numbers, or underscores.";
      usernameError.hidden = false;
      usernameInput.focus();
      return;
    }
    setAuth({ ...getAuth(), username: nextUsername });
    $("[data-username-value]", usernameView).textContent = `@${nextUsername}`;
    usernameForm.hidden = true;
    usernameView.hidden = false;
    showToast("Username updated", "success");
  });

}

function initAccountSubpages() {
  const root = $("#deleteAccountMain") || $("#bettingControlsMain");
  if (!root) return;
  if (!isAuthed()) {
    root.innerHTML = profileGuardHTML();
    return;
  }
  const deleteButton = $("[data-delete-account]", root);
  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      clearAuth();
      location.href = "home.html";
    });
  }
}

/* ---------------------------------------------------------- AUTH SCREENS */
// Inline validation errors (shown in-app, not via native browser bubbles)
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const phoneDigits = (value) => value.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
const validPhone = (value) => phoneDigits(value).length === 10;
const formatPhoneInput = (value) => {
  const digits = phoneDigits(value).slice(0, 10);
  if (!digits) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};
const formatPhone = (value) => {
  const digits = phoneDigits(value);
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : value.trim();
};
function isAtLeastAge(dateValue, age) {
  const birth = new Date(`${dateValue}T00:00:00`);
  if (!dateValue || Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  if (birth > today) return false;
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years -= 1;
  return years >= age;
}
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
  const steps = $("#loginSteps");
  if (!steps) return;

  let identifier = "";
  let identifierType = "email";
  const go = (step) => {
    steps.dataset.step = step;
    const focusEl = steps.querySelector(`.auth-step[data-step="${step}"] input`);
    if (focusEl) setTimeout(() => focusEl.focus(), 80);
  };
  const finishLogin = () => {
    const existing = getAuth() || {};
    setAuth({
      ...existing,
      name: existing.name || (identifierType === "email" ? nameFromEmail(identifier) : USER.name),
      email: identifierType === "email" ? identifier : existing.email,
      phone: identifierType === "phone" ? formatPhone(identifier) : existing.phone,
      provider: "password",
    });
    location.href = postAuthDest();
  };

  const identifierForm = $("[data-login-identifier-form]", steps);
  const identifierEl = $("#loginIdentifier", identifierForm);
  identifierForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErr(identifierEl);
    identifier = identifierEl.value.trim();
    if (!identifier) { showErr(identifierEl, "Enter your email or phone number"); return; }
    if (validEmail(identifier)) identifierType = "email";
    else if (validPhone(identifier)) identifierType = "phone";
    else { showErr(identifierEl, "Enter a valid email or 10-digit US phone number"); return; }
    const phoneEnding = identifierType === "phone" ? phoneDigits(identifier).slice(-4) : "4567";
    $("[data-login-phone-ending]", steps).textContent = phoneEnding;
    go(2);
  });

  const codeForm = $("[data-login-code-form]", steps);
  const codeWrap = $("[data-code-input]", codeForm);
  codeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearCodeErr(codeWrap);
    const code = $$(".code-box", codeWrap).map((box) => box.value).join("");
    if (code.length !== 6) { showCodeErr(codeWrap, "Enter the 6-digit verification code"); return; }
    finishLogin();
  });

  const passwordForm = $("[data-login-password-form]", steps);
  const passwordEl = $("#loginPassword", passwordForm);
  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErr(passwordEl);
    if (!passwordEl.value) { showErr(passwordEl, "Enter your password"); return; }
    finishLogin();
  });

  $("[data-login-password-option]", steps).addEventListener("click", () => go(3));
  $$('[data-login-back]', steps).forEach((button) => button.addEventListener("click", () => go(Number(button.dataset.loginBack))));
  $("[data-login-resend]", steps).addEventListener("click", () => showToast("Verification code resent to your registered phone", "success"));
  clearErrsOnInput(identifierForm);
  clearErrsOnInput(passwordForm);
  initCodeInput(codeWrap);
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

const DOB_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function initDateComboboxes(root) {
  const combos = $$("[data-date-combobox]", root);
  const controllers = [];
  combos.forEach((combo) => {
    const part = combo.dataset.dateCombobox;
    const input = $("input", combo);
    const toggle = $("[data-date-toggle]", combo);
    const menu = $(".combobox-menu", combo);
    const currentYear = new Date().getFullYear();
    const options = part === "month"
      ? DOB_MONTHS.map((label, i) => ({ value: String(i + 1), label }))
      : part === "day"
        ? Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
        : Array.from({ length: currentYear - 1899 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }));
    let visible = options;
    let activeIndex = -1;

    const close = () => {
      menu.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      activeIndex = -1;
    };
    controllers.push({ combo, close });

    const render = (query = "") => {
      const q = query.trim().toLowerCase();
      visible = q
        ? options.filter((option) => option.label.toLowerCase().startsWith(q) || option.value.startsWith(q))
        : options;
      activeIndex = -1;
      menu.innerHTML = visible.length
        ? visible.map((option, i) => `<button class="combobox-option" id="${menu.id}-option-${i}" type="button" role="option" data-date-value="${option.value}" aria-selected="${input.dataset.value === option.value}">${option.label}</button>`).join("")
        : `<div class="combobox-empty">No matching options</div>`;
    };

    const positionMenu = () => {
      const edgeGap = 16;
      const menuGap = 8;
      const rect = combo.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - edgeGap - menuGap;
      const spaceAbove = rect.top - edgeGap - menuGap;
      const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
      combo.classList.toggle("is-up", openUp);
      const available = openUp ? spaceAbove : spaceBelow;
      menu.style.maxHeight = `${Math.max(72, Math.min(224, available))}px`;
    };

    const open = (query = "") => {
      controllers.forEach((controller) => { if (controller.combo !== combo) controller.close(); });
      render(query);
      menu.hidden = false;
      input.setAttribute("aria-expanded", "true");
      positionMenu();
      const selected = menu.querySelector('[aria-selected="true"]');
      if (selected) setTimeout(() => selected.scrollIntoView({ block: "nearest" }), 0);
    };

    const selectOption = (option) => {
      input.value = option.textContent.trim();
      input.dataset.value = option.dataset.dateValue;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      input.focus();
    };

    const setActive = (next) => {
      const items = $$(".combobox-option", menu);
      if (!items.length) return;
      activeIndex = (next + items.length) % items.length;
      items.forEach((item, i) => item.classList.toggle("is-active", i === activeIndex));
      const active = items[activeIndex];
      input.setAttribute("aria-activedescendant", active.id);
      active.scrollIntoView({ block: "nearest" });
    };

    input.addEventListener("focus", () => { if (menu.hidden) open(); });
    input.addEventListener("input", () => {
      delete input.dataset.value;
      if (part !== "month") input.value = input.value.replace(/\D/g, "").slice(0, part === "day" ? 2 : 4);
      open(input.value);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (menu.hidden) open();
        setActive(activeIndex + (e.key === "ArrowDown" ? 1 : -1));
      } else if (e.key === "Enter" && !menu.hidden && activeIndex >= 0) {
        e.preventDefault();
        selectOption($$(".combobox-option", menu)[activeIndex]);
      } else if (e.key === "Escape") {
        close();
      }
    });
    combo.addEventListener("focusout", () => {
      setTimeout(() => { if (!combo.contains(document.activeElement)) close(); }, 0);
    });
    toggle.addEventListener("click", () => {
      if (menu.hidden) { input.focus(); open(); }
      else close();
    });
    menu.addEventListener("click", (e) => {
      const option = e.target.closest("[data-date-value]");
      if (option) selectOption(option);
    });
    window.addEventListener("resize", () => { if (!menu.hidden) positionMenu(); });
    render();
  });
  document.addEventListener("pointerdown", (e) => {
    controllers.forEach((controller) => { if (!controller.combo.contains(e.target)) controller.close(); });
  });
}

function birthdayISOFromFields(form) {
  const monthText = $("#dobMonth", form).value.trim();
  const dayText = $("#dobDay", form).value.trim();
  const yearText = $("#dobYear", form).value.trim();
  let month = /^\d{1,2}$/.test(monthText) ? Number(monthText) : 0;
  if (!month) {
    const matches = DOB_MONTHS.map((label, i) => ({ label, value: i + 1 })).filter((item) => item.label.toLowerCase().startsWith(monthText.toLowerCase()));
    if (matches.length === 1) month = matches[0].value;
  }
  const day = /^\d{1,2}$/.test(dayText) ? Number(dayText) : 0;
  const year = /^\d{4}$/.test(yearText) ? Number(yearText) : 0;
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) return "";
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function initSignup() {
  const steps = $("#signupSteps");
  if (!steps) return;
  let email = "";
  let provider = "password";
  let phone = "";
  const go = (n) => {
    steps.dataset.step = n;
    const focusEl = steps.querySelector(`.auth-step[data-step="${n}"] input`);
    if (focusEl) setTimeout(() => focusEl.focus(), 80);
  };
  const f1 = steps.querySelector("[data-step1-form]");
  const emailEl = f1.querySelector("#email");
  f1.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErr(emailEl);
    email = emailEl.value.trim();
    provider = "password";
    if (!email) { showErr(emailEl, "Enter your email"); return; }
    if (!validEmail(email)) { showErr(emailEl, "Enter a valid email address"); return; }
    go(2);
  });

  const f2 = steps.querySelector("[data-step2-form]");
  const phoneEl = f2.querySelector("#phone");
  phoneEl.addEventListener("input", () => { phoneEl.value = formatPhoneInput(phoneEl.value); });
  f2.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErr(phoneEl);
    if (!phoneEl.value.trim()) { showErr(phoneEl, "Enter your phone number"); return; }
    if (!validPhone(phoneEl.value)) { showErr(phoneEl, "Enter a valid 10-digit US phone number"); return; }
    phone = formatPhone(phoneEl.value);
    phoneEl.value = phone;
    const target = steps.querySelector("[data-code-phone]");
    if (target) target.textContent = phone;
    go(3);
  });

  const f3 = steps.querySelector("[data-step3-form]");
  const codeWrap = f3.querySelector("[data-code-input]");
  f3.addEventListener("submit", (e) => {
    e.preventDefault();
    clearCodeErr(codeWrap);
    const code = $$(".code-box", codeWrap).map((box) => box.value).join("");
    if (code.length !== 6) { showCodeErr(codeWrap, "Enter the 6-digit code we sent you"); return; }
    go(4);
  });

  const f4 = steps.querySelector("[data-step4-form]");
  const p1 = f4.querySelector("#newpass");
  const p2 = f4.querySelector("#confirmpass");
  f4.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErr(p1); clearErr(p2);
    if (!p1.value) { showErr(p1, "Create a password"); return; }
    if (p1.value.length < 8) { showErr(p1, "Use at least 8 characters"); return; }
    if (!p2.value) { showErr(p2, "Re-enter your password to confirm"); return; }
    if (p1.value !== p2.value) { showErr(p2, "Passwords don't match"); return; }
    setAuth({ email, phone, provider, memberSince: new Date().toISOString(), onboarding: true });
    location.href = postSignupDest();
  });

  $$("[data-step-back]", steps).forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.stepBack))));
  $$("[data-social]", steps).forEach((b) => b.addEventListener("click", () => {
    provider = b.dataset.social;
    email = provider === "google" ? "alex.morgan@gmail.com" : "alex@icloud.com";
    go(2);
  }));
  const resend = steps.querySelector("[data-resend]");
  if (resend) resend.addEventListener("click", () => showToast("Code resent — check your phone", "success"));
  clearErrsOnInput(f1); clearErrsOnInput(f2); clearErrsOnInput(f4);
  initCodeInput(codeWrap);
}

function initWelcome() {
  const main = $("#welcomeMain");
  if (!main) return;
  if (!isAuthed()) { location.replace("signup.html"); return; }

  const credit = WELCOME_CREDIT.toLocaleString("en-US");
  const bonusEl = $("[data-welcome-bonus]", main);
  const intro = $("[data-welcome-intro]", main);
  const details = $("[data-welcome-details]", main);
  const usernamePanel = $("[data-welcome-username]", main);
  const detailsForm = $("[data-details-form]", main);
  const usernameForm = $("[data-username-form]", main);
  if (bonusEl) bonusEl.textContent = credit;

  const authAtStart = getAuth();
  const firstNameEl = $("#firstName", detailsForm);
  const lastNameEl = $("#lastName", detailsForm);
  const birthdayInputs = [$("#dobMonth", detailsForm), $("#dobDay", detailsForm), $("#dobYear", detailsForm)];
  const birthdayError = $("[data-birthday-error]", detailsForm);
  const usernameEl = $("#username", usernameForm);

  const showState = (state) => {
    main.dataset.welcomeState = state;
    intro.hidden = state !== "intro";
    details.hidden = state !== "details";
    usernamePanel.hidden = state !== "username";
    const focusEl = state === "details" ? firstNameEl : state === "username" ? usernameEl : null;
    if (focusEl) setTimeout(() => focusEl.focus(), 120);
  };
  const clearBirthdayError = () => {
    birthdayInputs.forEach((input) => input.classList.remove("is-error"));
    birthdayError.hidden = true;
    birthdayError.textContent = "";
  };
  const showBirthdayError = (message) => {
    birthdayInputs.forEach((input) => input.classList.add("is-error"));
    birthdayError.textContent = message;
    birthdayError.hidden = false;
  };

  firstNameEl.value = authAtStart?.firstName || "";
  lastNameEl.value = authAtStart?.lastName || "";
  birthdayInputs.forEach((input) => {
    input.addEventListener("input", clearBirthdayError);
    input.addEventListener("change", clearBirthdayError);
  });
  initDateComboboxes(detailsForm);
  clearErrsOnInput(detailsForm);

  detailsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErr(firstNameEl); clearErr(lastNameEl); clearBirthdayError();
    let valid = true;
    if (!firstNameEl.value.trim()) { showErr(firstNameEl, "Enter your first name"); valid = false; }
    if (!lastNameEl.value.trim()) { showErr(lastNameEl, "Enter your last name"); valid = false; }
    const birthday = birthdayISOFromFields(detailsForm);
    if (!birthday) { showBirthdayError("Enter a valid month, day, and year"); valid = false; }
    else if (!isAtLeastAge(birthday, 18)) { showBirthdayError("GTL is for users 18 or older."); valid = false; }
    if (!valid) return;

    const firstName = firstNameEl.value.trim();
    const lastName = lastNameEl.value.trim();
    setAuth({ ...getAuth(), firstName, lastName, name: `${firstName} ${lastName}`, birthday });
    const suggestedUsername = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
    if (!usernameEl.value && suggestedUsername.length >= 3) usernameEl.value = suggestedUsername;
    showState("username");
  });

  const introDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 900 : 3200;
  window.setTimeout(() => {
    main.classList.add("is-transitioning");
    window.setTimeout(() => {
      main.classList.remove("is-transitioning");
      showState("details");
    }, 280);
  }, introDelay);

  usernameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErr(usernameEl);
    const username = usernameEl.value.trim();
    if (!username) { showErr(usernameEl, "Choose a username"); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { showErr(usernameEl, "Use 3–20 letters, numbers, or underscores"); return; }
    const auth = getAuth();
    setAuth({ ...auth, username, onboarding: false, balance: WELCOME_CREDIT, welcomeCreditPending: true });
    clearBetIntent();
    location.href = "home.html";
  });
  clearErrsOnInput(usernameForm);
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

function initContact() {
  const form = $("[data-contact-form]");
  if (!form) return;

  const nameEl = $("#contactName", form);
  const emailEl = $("#contactEmail", form);
  const topicEl = $("#contactTopic", form);
  const topicCombo = $("[data-contact-topic]", form);
  const topicToggle = $("[data-contact-topic-toggle]", topicCombo);
  const topicMenu = $("#contactTopicOptions", topicCombo);
  const topicOptions = $$("[data-contact-topic-value]", topicMenu);
  const messageEl = $("#contactMessage", form);
  const countEl = $("[data-message-count]", form);
  const success = $("[data-contact-success]");
  const another = $("[data-contact-another]", success);

  const auth = getAuth();
  if (auth) {
    nameEl.value = auth.name || [auth.firstName, auth.lastName].filter(Boolean).join(" ");
    emailEl.value = auth.email || "";
  }

  const updateCount = () => { countEl.textContent = String(messageEl.value.length); };
  messageEl.addEventListener("input", updateCount);
  updateCount();

  let activeTopicIndex = -1;
  const closeTopicMenu = () => {
    topicMenu.hidden = true;
    topicEl.setAttribute("aria-expanded", "false");
    topicEl.removeAttribute("aria-activedescendant");
    topicOptions.forEach((option) => option.classList.remove("is-active"));
    activeTopicIndex = -1;
  };
  const positionTopicMenu = () => {
    const roomBelow = window.innerHeight - topicCombo.getBoundingClientRect().bottom;
    topicCombo.classList.toggle("is-up", roomBelow < 260);
  };
  const openTopicMenu = () => {
    positionTopicMenu();
    topicMenu.hidden = false;
    topicEl.setAttribute("aria-expanded", "true");
    const selectedIndex = topicOptions.findIndex((option) => option.dataset.contactTopicValue === topicEl.dataset.value);
    activeTopicIndex = selectedIndex >= 0 ? selectedIndex : 0;
    topicOptions.forEach((option, index) => option.classList.toggle("is-active", index === activeTopicIndex));
    topicEl.setAttribute("aria-activedescendant", topicOptions[activeTopicIndex].id);
  };
  const selectTopic = (option) => {
    topicEl.value = option.textContent.trim();
    topicEl.dataset.value = option.dataset.contactTopicValue;
    topicOptions.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
    clearErr(topicEl);
    closeTopicMenu();
    topicEl.focus();
  };
  const setActiveTopic = (index) => {
    activeTopicIndex = (index + topicOptions.length) % topicOptions.length;
    topicOptions.forEach((option, optionIndex) => option.classList.toggle("is-active", optionIndex === activeTopicIndex));
    topicEl.setAttribute("aria-activedescendant", topicOptions[activeTopicIndex].id);
    topicOptions[activeTopicIndex].scrollIntoView({ block: "nearest" });
  };
  topicOptions.forEach((option, index) => { option.id = `contactTopicOption${index}`; });
  topicEl.addEventListener("click", () => { if (topicMenu.hidden) openTopicMenu(); else closeTopicMenu(); });
  topicToggle.addEventListener("click", () => { topicEl.focus(); if (topicMenu.hidden) openTopicMenu(); else closeTopicMenu(); });
  topicMenu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-contact-topic-value]");
    if (option) selectTopic(option);
  });
  topicEl.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (topicMenu.hidden) openTopicMenu();
      else setActiveTopic(activeTopicIndex + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (topicMenu.hidden) openTopicMenu();
      else selectTopic(topicOptions[activeTopicIndex]);
    } else if (event.key === "Escape") {
      closeTopicMenu();
    }
  });
  document.addEventListener("pointerdown", (event) => { if (!topicCombo.contains(event.target)) closeTopicMenu(); });
  window.addEventListener("resize", () => { if (!topicMenu.hidden) positionTopicMenu(); });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    [nameEl, emailEl, topicEl, messageEl].forEach(clearErr);

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const topic = topicEl.dataset.value || "";
    const message = messageEl.value.trim();
    let firstInvalid = null;
    const requireField = (input, error) => {
      showErr(input, error);
      if (!firstInvalid) firstInvalid = input;
    };

    if (!name) requireField(nameEl, "Enter your name");
    if (!email) requireField(emailEl, "Enter your email");
    else if (!validEmail(email)) requireField(emailEl, "Enter a valid email address");
    if (!topic) requireField(topicEl, "Choose a topic");
    if (!message) requireField(messageEl, "Enter a message");
    else if (message.length < 10) requireField(messageEl, "Add a little more detail so we can help");

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const reference = `GTL-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    const request = { reference, name, email, topic, message, submittedAt: new Date().toISOString() };
    try {
      const requests = JSON.parse(localStorage.getItem("gtl-contact-requests") || "[]");
      localStorage.setItem("gtl-contact-requests", JSON.stringify([...requests, request].slice(-20)));
    } catch (error) {
      // The confirmation still works if storage is unavailable in private browsing.
    }

    $("[data-contact-email]", success).textContent = email;
    $("[data-contact-reference]", success).textContent = reference;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  another.addEventListener("click", () => {
    form.reset();
    delete topicEl.dataset.value;
    topicOptions.forEach((option) => option.setAttribute("aria-selected", "false"));
    closeTopicMenu();
    if (auth) {
      nameEl.value = auth.name || [auth.firstName, auth.lastName].filter(Boolean).join(" ");
      emailEl.value = auth.email || "";
    }
    updateCount();
    success.hidden = true;
    form.hidden = false;
    messageEl.focus();
  });

  clearErrsOnInput(form);
  topicEl.addEventListener("change", () => clearErr(topicEl));
}

/* ------------------------------------------------------------- INIT */
function initEmbeddedPreviewHeightReporting() {
  if (window.parent === window) return;

  let animationFrame = 0;
  const reportHeight = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      animationFrame = 0;
      const root = document.documentElement;
      const pageBody = document.body;
      const height = Math.max(
        root.scrollHeight,
        root.offsetHeight,
        pageBody?.scrollHeight || 0,
        pageBody?.offsetHeight || 0,
      );
      window.parent.postMessage({ type: "gtl-preview-height", height: Math.ceil(height) }, "*");
    });
  };

  const resizeObserver = new ResizeObserver(reportHeight);
  resizeObserver.observe(document.documentElement);
  if (document.body) resizeObserver.observe(document.body);

  const mutationObserver = new MutationObserver(reportHeight);
  mutationObserver.observe(document.body || document.documentElement, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });

  window.addEventListener("load", reportHeight);
  window.addEventListener("resize", reportHeight);
  document.fonts?.ready.then(reportHeight).catch(() => {});
  [0, 100, 500, 1500].forEach((delay) => setTimeout(reportHeight, delay));
  reportHeight();
}

document.addEventListener("DOMContentLoaded", () => {
  initEmbeddedPreviewHeightReporting();
  syncUserBalanceFromAuth();
  renderHeader();
  applyAuthChrome();
  renderTiles();
  renderHomeEdgeCase();
  renderAuthedHome();
  initWelcomeCreditAnimation();
  initExpanders();
  initPausedDemo();
  initLeagueFilter();
  initHeader();
  initProfile();
  initTheme();
  initScrollTop();
  initTradingCounter();
  renderGamePage();
  initBetSheet();
  initFeesPage();
  initBackButtons();
  initWallet();
  initAccountSubpages();
  initRanking();
  maybeReopenBet();
  // auth screens
  initPassToggles();
  initSocialButtons();
  initLogin();
  initSignup();
  initWelcome();
  initForgot();
  initContact();
  startPriceTicker(); // after home tiles and the game page have rendered their rows
  startClockTicker(); // tick the live game clocks
});
