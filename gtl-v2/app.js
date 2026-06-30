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

/* ----------------------------------------------- HOME: EXPANDABLE BETS */
function betPanel(g) {
  const href = `game.html?id=${g.id}`;
  const row = (label, sub, full, key) => `<div class="mkt-row">
      <button class="price yes" data-game="${g.id}" data-market="${key}" data-side="yes" aria-label="${full} Yes ${g.markets[key].yes} cents">${g.markets[key].yes}¢</button>
      <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
      <button class="price no" data-game="${g.id}" data-market="${key}" data-side="no" aria-label="${full} No ${g.markets[key].no} cents">${g.markets[key].no}¢</button>
    </div>`;
  return `<div class="mkt-grid">
      <div class="mkt-head"><span class="col-yes">Yes</span><span></span><span class="col-no">No</span></div>
      ${row("GTL", "Get the Lead", "Get the Lead", "gtl")}
      ${row("TIE", "", "Tie", "tie")}
      ${row("KTL", "Keep the Lead", "Keep the Lead", "ktl")}
    </div>
    <p class="bet-help">Tap a price to start your bet · Prices updated every 2 seconds</p>
    <a class="view-game" href="${href}">View Game</a>`;
}

function footHTML(g) {
  return `<div class="tile-foot">
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
    return `<article class="game-tile" data-league="${g.league}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
        <button class="tile-main" data-expand aria-expanded="false" aria-label="Show bets for ${g.away.abbr} at ${g.home.abbr}">
          <div class="game-row">
            ${teamBlock("home")}
            <div class="game-center"><span class="period">${g.period}</span><span class="clock tnum">${g.clock}</span></div>
            ${teamBlock("away")}
          </div>
        </button>
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

/* --------------------------------------------------- HOME: LEAGUE FILTER */
function initLeagueFilter() {
  const strip = $("#leagueStrip");
  const grid = $("#gameGrid");
  if (!strip || !grid) return;
  const apply = (league) => {
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
}

/* ----------------------------------------------- HEADER: MENU + SCROLL */
function initHeader() {
  const header = $("#siteHeader");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const btn = $("#menuBtn");
  const panel = $("#menuPanel");
  if (btn && panel) {
    const close = () => { panel.setAttribute("hidden", ""); btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = panel.hasAttribute("hidden");
      if (willOpen) { panel.removeAttribute("hidden"); btn.setAttribute("aria-expanded", "true"); }
      else close();
    });
    panel.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    document.addEventListener("click", (e) => { if (!header.contains(e.target)) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }
}

/* ------------------------------------------------------- THEME TOGGLE */
function initTheme() {
  const btn = $("#themeBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("gtl-theme", next); } catch (e) { /* ignore */ }
  });
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
function startPriceTicker() {
  const rows = $$(".mkt-row");
  if (!rows.length) return;
  const bump = (row) => {
    const yesEl = row.querySelector(".price.yes");
    const noEl = row.querySelector(".price.no");
    if (!yesEl || !noEl) return;
    let yes = parseInt(yesEl.textContent, 10);
    yes += Math.floor(Math.random() * 7) - 3; // drift -3..+3
    yes = Math.max(5, Math.min(95, yes));
    yesEl.textContent = `${yes}¢`;
    noEl.textContent = `${100 - yes}¢`;
    [yesEl, noEl].forEach((el) => { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); });
  };
  setInterval(() => {
    // sporadic: nudge just one or two markets each tick
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) bump(rows[Math.floor(Math.random() * rows.length)]);
  }, 2000);
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
    <p class="bet-help">Tap a price to start your bet · Prices updated every 2 seconds</p>`;

  const statsHTML = g.stats.map((s) => {
    const total = s.home + s.away || 1;
    const hp = Math.round((s.home / total) * 100);
    return `<div class="stat">
        <div class="stat-row"><span class="stat-val tnum">${s.home}</span><span class="stat-label">${s.label}</span><span class="stat-val tnum">${s.away}</span></div>
        <div class="stat-bar"><span class="stat-fill-h" style="width:${hp}%"></span><span class="stat-fill-a" style="width:${100 - hp}%"></span></div>
      </div>`;
  }).join("");

  main.innerHTML = `
    <section class="gb" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <div class="gb-glow" aria-hidden="true"></div>
      <div class="container gb-inner">
        <div class="gb-topbar">
          <a class="gb-back" href="home.html" aria-label="Back to games">${CHEVRON}<span>Games</span></a>
          <span class="live-badge"><span class="live-dot"></span> ${g.period} · ${g.clock}</span>
          <button class="gb-share" aria-label="Share">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 15V4m0 0L8 8m4-4l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="gb-score">
          ${teamCol("home")}
          <div class="gb-numbers">
            <span class="gb-num tnum${lead === "home" ? " is-leading" : ""}">${g.home.score}</span>
            <span class="gb-dash">–</span>
            <span class="gb-num tnum${lead === "away" ? " is-leading" : ""}">${g.away.score}</span>
          </div>
          ${teamCol("away")}
        </div>
        <p class="gb-league">${g.league.toUpperCase()} · Regular season</p>
      </div>
    </section>

    <section class="container markets" id="marketsSection">
      <div class="section-head center"><span class="eyebrow">Markets</span><h2>Back the lead</h2></div>
      ${marketsHTML}
    </section>

    <section class="container stats-section" style="--home-color:${g.home.color};--away-color:${g.away.color}">
      <div class="section-head center"><span class="eyebrow">Team stats</span><h2>Inside the game</h2></div>
      <div class="stats">${statsHTML}</div>
    </section>`;

  initStickyBet();
}

/* ----------------------------------------------- BET DRAWER (two-step) */
const betState = { game: null, market: "gtl", contract: "yes", quantity: 10, step: 1, markets: {}, limit: null, limitOpen: false };
const money = (v) => `$${v.toFixed(2)}`;

function renderScoreboard(g) {
  const sb = $("#betSheet")?.querySelector("[data-bet-grab]");
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

function renderPicker() {
  const picker = $("#betSheet")?.querySelector("[data-picker]");
  if (!picker) return;
  const q = betState.quantity;
  picker.innerHTML = [-2, -1, 0, 1, 2].map((o) => {
    const n = q + o, d = Math.abs(o);
    if (n < 1) return `<span class="np-num np-empty" style="--d:${d}"></span>`;
    return `<button class="np-num${o === 0 ? " is-active" : ""}" data-np="${n}" style="--d:${d}" tabindex="-1">${n}</button>`;
  }).join("");
}

function ensureBetSheet() {
  let sheet = $("#betSheet");
  if (sheet) return sheet;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="bet-sheet-backdrop" id="betBackdrop" data-bet-close></div>
    <aside class="bet-sheet" id="betSheet" data-step="1" aria-hidden="true" aria-label="Place a bet">
      <div class="bet-scoreboard" data-bet-grab></div>
      <div class="bet-sheet-handle" aria-hidden="true"></div>

      <div class="bet-sheet-body">
        <div class="bet-step bet-step-1">
          <div class="bet-field">
            <span class="bet-label">Bet type</span>
            <div class="seg seg-3" role="group" aria-label="Bet type">
              <button data-market="gtl">GTL</button>
              <button data-market="tie">TIE</button>
              <button data-market="ktl">KTL</button>
            </div>
          </div>
          <div class="bet-field">
            <span class="bet-label">Contracts</span>
            <div class="num-picker" data-picker role="slider" aria-label="Number of contracts"></div>
            <div class="qty-quick">
              <button data-qty-set="10">10</button>
              <button data-qty-set="25">25</button>
              <button data-qty-set="50">50</button>
              <button data-qty-set="100">100</button>
            </div>
          </div>
          <div class="bet-field">
            <span class="bet-label">Pick a side</span>
            <div class="bet-toggle" data-active="yes" role="group" aria-label="Side">
              <button class="bt-opt yes" data-contract="yes"><span class="bt-side">Yes</span><span class="bt-price tnum" data-yes-price>—</span></button>
              <button class="bt-opt no" data-contract="no"><span class="bt-side">No</span><span class="bt-price tnum" data-no-price>—</span></button>
            </div>
            <button class="limit-toggle" data-limit-toggle aria-expanded="false">Set a limit</button>
            <div class="limit-section" data-limit-section hidden>
              <input class="limit-input" data-limit-input type="number" inputmode="numeric" min="1" max="100" placeholder="Limit price (¢)" />
              <div class="qty-quick">
                <button data-limit-set="10">10</button>
                <button data-limit-set="25">25</button>
                <button data-limit-set="50">50</button>
                <button data-limit-set="100">100</button>
              </div>
            </div>
          </div>
          <div class="bet-highlight">
            <span class="bet-total-big tnum" data-total-big>$0.00</span>
            <span class="bet-payout-line">Potential payout of <strong data-payout-big>$0.00</strong></span>
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
              <div class="summary-row total"><span data-s-total-label>Total to pay</span><strong data-s-total>—</strong></div>
            </div>
          </div>
          <div class="bet-field">
            <span class="bet-label">Potential gain</span>
            <div class="gain">
              <div class="summary-row"><span>Potential payout</span><strong data-g-payout>—</strong></div>
              <div class="summary-row"><span>Potential profit</span><strong data-g-profit>—</strong></div>
              <div class="summary-row"><span>Fees</span><strong data-g-fees>—</strong></div>
              <div class="gain-net"><span>Net potential gain</span><strong data-g-net>—</strong></div>
            </div>
          </div>
        </div>
      </div>

      <footer class="bet-sheet-footer">
        <button class="bet-secondary" data-breakdown>Breakdown</button>
        <button class="bet-secondary" data-bet-back>Back</button>
        <button class="btn btn-primary bet-primary" data-bet-primary>Place Bet</button>
      </footer>

      <div class="bet-success">
        <span class="bet-success-check">${CHECK_ICON}</span>
        <h3 class="bet-success-title">Bet placed!</h3>
        <p class="bet-success-sub" data-success-line>You're in the game.</p>
      </div>
    </aside>
  `);
  sheet = $("#betSheet");

  $$("[data-bet-close]").forEach((el) => el.addEventListener("click", closeBetSheet));
  $$("[data-market]", sheet).forEach((b) => b.addEventListener("click", () => { betState.market = b.dataset.market; updateBetSheet(); }));
  $$("[data-contract]", sheet).forEach((b) => b.addEventListener("click", () => { betState.contract = b.dataset.contract; updateBetSheet(); }));
  $$("[data-qty-set]", sheet).forEach((b) => b.addEventListener("click", () => { betState.quantity = Number(b.dataset.qtySet); updateBetSheet(); }));
  sheet.querySelector("[data-breakdown]").addEventListener("click", () => { betState.step = 2; updateBetSheet(); });
  sheet.querySelector("[data-bet-back]").addEventListener("click", () => { betState.step = 1; updateBetSheet(); });
  sheet.querySelector("[data-bet-primary]").addEventListener("click", placeBet);
  sheet.querySelector("[data-limit-toggle]").addEventListener("click", () => { betState.limitOpen = !betState.limitOpen; updateBetSheet(); });
  sheet.querySelector("[data-limit-input]").addEventListener("input", (e) => { const v = parseInt(e.target.value, 10); betState.limit = v >= 1 && v <= 100 ? v : null; updateBetSheet(); });
  $$("[data-limit-set]", sheet).forEach((b) => b.addEventListener("click", () => { betState.limit = Number(b.dataset.limitSet); sheet.querySelector("[data-limit-input]").value = betState.limit; updateBetSheet(); }));

  // Number picker — swipe (pointer drag) or click a neighbour
  const picker = sheet.querySelector("[data-picker]");
  let pStartX = 0, pStartQ = 10, pDrag = false, pMoved = false;
  picker.addEventListener("pointerdown", (e) => { pDrag = true; pMoved = false; pStartX = e.clientX; pStartQ = betState.quantity; picker.setPointerCapture(e.pointerId); });
  picker.addEventListener("pointermove", (e) => {
    if (!pDrag) return;
    if (Math.abs(e.clientX - pStartX) > 4) pMoved = true;
    const nq = Math.max(1, pStartQ + Math.round((pStartX - e.clientX) / 40));
    if (nq !== betState.quantity) { betState.quantity = nq; updateBetSheet(); }
  });
  const pEnd = () => { pDrag = false; };
  picker.addEventListener("pointerup", pEnd);
  picker.addEventListener("pointercancel", pEnd);
  picker.addEventListener("click", (e) => {
    if (pMoved) { pMoved = false; return; }
    const b = e.target.closest("[data-np]");
    if (b) { betState.quantity = Number(b.dataset.np); updateBetSheet(); }
  });

  // Swipe the scoreboard down to close
  const grab = sheet.querySelector("[data-bet-grab]");
  let sStartY = 0, sDrag = false;
  grab.addEventListener("pointerdown", (e) => { sDrag = true; sStartY = e.clientY; sheet.style.transition = "none"; grab.setPointerCapture(e.pointerId); });
  grab.addEventListener("pointermove", (e) => { if (!sDrag) return; const dy = Math.max(0, e.clientY - sStartY); sheet.style.transform = `translateY(${dy}px)`; });
  const sEnd = (e) => { if (!sDrag) return; sDrag = false; const dy = Math.max(0, (e.clientY || sStartY) - sStartY); sheet.style.transition = ""; sheet.style.transform = ""; if (dy > 110) closeBetSheet(); };
  grab.addEventListener("pointerup", sEnd);
  grab.addEventListener("pointercancel", sEnd);

  return sheet;
}

function updateBetSheet() {
  const sheet = ensureBetSheet();
  const mk = betState.markets[betState.market] || { yes: 50, no: 50 };
  const marketPrice = betState.contract === "yes" ? mk.yes : mk.no;
  const priceCents = betState.limit != null ? betState.limit : marketPrice;
  const price = priceCents / 100;
  const qty = betState.quantity;
  const subtotal = price * qty;
  const fee = Math.max(0.01, subtotal * 0.02);
  const total = subtotal + fee;
  const payout = qty;
  const profit = Math.max(0, payout - subtotal);
  const net = Math.max(0, profit - fee);

  sheet.setAttribute("data-step", betState.step);
  sheet.querySelector("[data-yes-price]").textContent = `${mk.yes}¢`;
  sheet.querySelector("[data-no-price]").textContent = `${mk.no}¢`;
  renderPicker();

  $$("[data-market]", sheet).forEach((b) => b.classList.toggle("is-active", b.dataset.market === betState.market));
  $$("[data-contract]", sheet).forEach((b) => b.classList.toggle("is-active", b.dataset.contract === betState.contract));
  sheet.querySelector(".bet-toggle").dataset.active = betState.contract;
  $$("[data-qty-set]", sheet).forEach((b) => b.classList.toggle("is-active", Number(b.dataset.qtySet) === qty));

  const limitSection = sheet.querySelector("[data-limit-section]");
  const limitToggle = sheet.querySelector("[data-limit-toggle]");
  limitSection.hidden = !betState.limitOpen;
  limitToggle.textContent = betState.limitOpen ? "Hide limit" : "Set a limit";
  limitToggle.setAttribute("aria-expanded", betState.limitOpen ? "true" : "false");
  $$("[data-limit-set]", sheet).forEach((b) => b.classList.toggle("is-active", Number(b.dataset.limitSet) === betState.limit));

  sheet.querySelector("[data-total-big]").textContent = money(total);
  sheet.querySelector("[data-payout-big]").textContent = money(payout);

  sheet.querySelector("[data-s-price]").textContent = `${priceCents}¢`;
  sheet.querySelector("[data-s-qty]").textContent = qty;
  sheet.querySelector("[data-s-subtotal]").textContent = money(subtotal);
  sheet.querySelector("[data-s-fee]").textContent = money(fee);
  sheet.querySelector("[data-s-total]").textContent = money(total);
  sheet.querySelector("[data-g-payout]").textContent = money(payout);
  sheet.querySelector("[data-g-profit]").textContent = money(profit);
  sheet.querySelector("[data-g-fees]").textContent = money(fee);
  sheet.querySelector("[data-g-net]").textContent = money(net);
}

let betTicker = null;
function startBetTicker() {
  stopBetTicker();
  betTicker = setInterval(() => {
    const sheet = $("#betSheet");
    const mk = betState.markets[betState.market];
    if (!sheet || !mk) return;
    let yes = Math.max(5, Math.min(95, mk.yes + Math.floor(Math.random() * 7) - 3));
    mk.yes = yes; mk.no = 100 - yes;
    updateBetSheet();
    ["[data-yes-price]", "[data-no-price]"].forEach((sel) => {
      const el = sheet.querySelector(sel);
      if (el) { el.classList.remove("blip"); void el.offsetWidth; el.classList.add("blip"); }
    });
  }, 2000);
}
function stopBetTicker() { if (betTicker) { clearInterval(betTicker); betTicker = null; } }

function openBetSheet(gameId, market, side, markets) {
  const g = GAMES.find((x) => x.id === gameId);
  if (!g) return;
  Object.assign(betState, { game: g, market, contract: side, quantity: 10, step: 1, markets, limit: null, limitOpen: false });
  const sheet = ensureBetSheet();
  sheet.classList.remove("is-success");
  renderScoreboard(g);
  updateBetSheet();
  sheet.querySelector("[data-limit-input]").value = "";
  $("#betBackdrop").classList.add("is-open");
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
  startBetTicker();
}

function closeBetSheet() {
  const sheet = $("#betSheet");
  if (!sheet) return;
  stopBetTicker();
  $("#betBackdrop").classList.remove("is-open");
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
}

function placeBet() {
  const sheet = ensureBetSheet();
  const g = betState.game;
  const title = `${betState.quantity} × ${MARKET_LABELS[betState.market]} ${betState.contract.toUpperCase()}`;
  const sub = `${g.home.abbr} vs ${g.away.abbr}`;
  sheet.querySelector("[data-success-line]").textContent = title;
  sheet.classList.add("is-success");
  stopBetTicker();
  setTimeout(() => { closeBetSheet(); showToast(title, sub); }, 1600);
}

/* Revoke toast — slides in over the header, 10s countdown border, swipe up to dismiss */
function showToast(title, sub) {
  dismissToast(true);
  const el = document.createElement("div");
  el.className = "bet-toast";
  el.innerHTML = `<div class="toast-inner">
      <div class="toast-info"><strong>${title}</strong><span>${sub}</span></div>
      <button class="toast-revoke" type="button">Revoke</button>
    </div>`;
  document.body.appendChild(el);
  el._timer = setTimeout(() => dismissToast(), 10000);
  el.querySelector(".toast-revoke").addEventListener("click", () => dismissToast());

  let ty = 0, tdrag = false;
  el.addEventListener("pointerdown", (e) => { if (e.target.closest(".toast-revoke")) return; tdrag = true; ty = e.clientY; el.style.transition = "none"; el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove", (e) => { if (!tdrag) return; const dy = Math.min(0, e.clientY - ty); el.style.transform = `translateY(${dy}px)`; });
  const tend = (e) => { if (!tdrag) return; tdrag = false; el.style.transition = ""; const dy = Math.min(0, (e.clientY || ty) - ty); el.style.transform = ""; if (dy < -50) dismissToast(); };
  el.addEventListener("pointerup", tend);
  el.addEventListener("pointercancel", tend);

  requestAnimationFrame(() => el.classList.add("is-in"));
}
function dismissToast(immediate) {
  const el = document.querySelector(".bet-toast");
  if (!el) return;
  clearTimeout(el._timer);
  if (immediate) { el.remove(); return; }
  el.classList.remove("is-in");
  el.classList.add("is-out");
  setTimeout(() => el.remove(), 320);
}

function initBetSheet() {
  document.addEventListener("click", (e) => {
    const price = e.target.closest(".price");
    if (!price || !price.dataset.game) return;
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

/* ------------------------------------------------------------- INIT */
document.addEventListener("DOMContentLoaded", () => {
  renderTiles();
  initExpanders();
  initLeagueFilter();
  initHeader();
  initTheme();
  initScrollTop();
  initTradingCounter();
  renderGamePage();
  initBetSheet();
  startPriceTicker(); // after both home tiles and the game page have rendered their rows
});
