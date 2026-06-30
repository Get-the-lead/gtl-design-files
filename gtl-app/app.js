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
    <p class="bet-help">Tap a price to start your bet · Prices updated every 10 seconds</p>
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
        <a class="tile-main" href="game.html?id=${g.id}" aria-label="Open ${g.away.abbr} at ${g.home.abbr}">
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
// A price move of at least 5¢, in either direction
const priceDelta = () => (5 + Math.floor(Math.random() * 5)) * (Math.random() < 0.5 ? -1 : 1);

function startPriceTicker() {
  const rows = $$(".mkt-row");
  if (!rows.length) return;
  const bump = (row) => {
    const yesEl = row.querySelector(".price.yes");
    const noEl = row.querySelector(".price.no");
    if (!yesEl || !noEl) return;
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

// Two quick limit options — nearest round-10 values straddling the current price
function limitOptions(p) {
  let low = Math.floor(p / 10) * 10;
  let high = low + 10;
  low = Math.max(5, low);
  high = Math.min(99, high);
  if (low >= high) low = high - 10;
  return [low, high];
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
          <div class="bet-field contracts-field">
            <span class="bet-label">Select number of contracts</span>
            <input class="num-input" data-qty-input type="text" inputmode="numeric" value="100" aria-label="Number of contracts" />
            <div class="qty-quick">
              <button data-qty-set="50">50</button>
              <button data-qty-set="100">100</button>
              <button data-qty-set="500">500</button>
              <button data-qty-set="1000">1000</button>
            </div>
          </div>

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
            <button class="limit-toggle" data-limit-toggle aria-expanded="false">Set a limit</button>
            <div class="limit-section" data-limit-section hidden>
              <span class="limit-caption">Max limit price</span>
              <div class="num-input-wrap"><input class="num-input" data-limit-input type="text" inputmode="numeric" aria-label="Limit price in cents" /><span class="num-suffix">¢</span></div>
              <div class="qty-quick limit-quick" data-limit-quick></div>
            </div>
          </div>

          <div class="bet-highlight">
            <span class="bet-label">Purchase price</span>
            <span class="bet-total-big tnum" data-total-big>$0.00</span>
            <span class="bet-profit-line">Potential profit of <strong data-profit-big>$0.00</strong> after <a href="#" class="fees-link" data-fees-link>fees</a></span>
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
            <h3 class="bet-success-title">Bet placed!</h3>
            <p class="bet-success-sub" data-success-line>You're in the game.</p>
          </div>
          <div class="bet-field">
            <span class="bet-label">Order summary</span>
            <div class="summary">
              <div class="summary-row"><span>Contract price</span><strong data-sx-price>—</strong></div>
              <div class="summary-row"><span>Contracts</span><strong data-sx-qty>—</strong></div>
              <div class="summary-row"><span>Subtotal</span><strong data-sx-subtotal>—</strong></div>
              <div class="summary-row"><span>Trading fee</span><strong data-sx-fee>—</strong></div>
              <div class="summary-row total"><span>Total paid</span><strong data-sx-total>—</strong></div>
            </div>
          </div>
          <button class="bet-secondary cancel-bet" data-cancel-bet>Cancel Bet</button>
        </div>
        <button class="btn btn-primary success-close" data-success-close>Close</button>
      </div>
    </aside>
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
  limitInput.addEventListener("input", () => { let v = parseInt(limitInput.value.replace(/[^0-9]/g, ""), 10); if (v > 99) { v = 99; limitInput.value = "99"; } betState.limit = v >= 1 ? v : 1; updateBetSheet(); });

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
  });
  sheet.querySelector("[data-limit-quick]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-limit-set]");
    if (b) { betState.limit = Number(b.dataset.limitSet); limitInput.value = betState.limit; updateBetSheet(); }
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
  const { mk, marketPrice, priceCents, qty, subtotal, fee, total, payout, profit, net } = computeBet();

  sheet.setAttribute("data-step", betState.step);
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
  limitToggle.textContent = betState.limitOpen ? "Hide limit" : "Set a limit";
  limitToggle.setAttribute("aria-expanded", betState.limitOpen ? "true" : "false");
  if (betState.limitOpen) {
    const [low, high] = limitOptions(marketPrice);
    sheet.querySelector("[data-limit-quick]").innerHTML = [low, high]
      .map((v) => `<button data-limit-set="${v}"${v === betState.limit ? ' class="is-active"' : ""}>${v}¢</button>`).join("");
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
}

let betTicker = null;
function startBetTicker() {
  stopBetTicker();
  betTicker = setInterval(() => {
    const sheet = $("#betSheet");
    const mk = betState.markets[betState.market];
    if (!sheet || !mk) return;
    let yes = Math.max(5, Math.min(95, mk.yes + priceDelta()));
    mk.yes = yes; mk.no = 100 - yes;
    updateBetSheet();
    ["[data-yes-price]", "[data-no-price]"].forEach((sel) => {
      const el = sheet.querySelector(sel);
      if (el) { el.classList.remove("blip"); void el.offsetWidth; el.classList.add("blip"); }
    });
  }, 10000);
}
function stopBetTicker() { if (betTicker) { clearInterval(betTicker); betTicker = null; } }

function syncInputs() {
  const sheet = $("#betSheet");
  if (!sheet) return;
  sheet.querySelector("[data-qty-input]").value = betState.quantity;
  sheet.querySelector("[data-limit-input]").value = betState.limit != null ? betState.limit : "";
}

function openBetSheet(gameId, market, side, markets, opts = {}) {
  const g = GAMES.find((x) => x.id === gameId);
  if (!g) return;
  Object.assign(betState, {
    game: g, market, contract: side, markets,
    quantity: opts.quantity || 100, step: 1, typeOpen: false,
    limit: opts.limit != null ? opts.limit : null,
    limitOpen: opts.limit != null,
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
  const sheet = ensureBetSheet();
  const { priceCents, qty, subtotal, fee, total } = computeBet();
  sheet.querySelector("[data-success-line]").textContent = `${qty} × ${MARKET_LABELS[betState.market]} ${betState.contract.toUpperCase()}`;
  sheet.querySelector("[data-sx-price]").textContent = `${priceCents}¢`;
  sheet.querySelector("[data-sx-qty]").textContent = qty;
  sheet.querySelector("[data-sx-subtotal]").textContent = money(subtotal);
  sheet.querySelector("[data-sx-fee]").textContent = money(fee);
  sheet.querySelector("[data-sx-total]").textContent = money(total);
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
  initFeesPage();
  maybeReopenBet();
  startPriceTicker(); // after both home tiles and the game page have rendered their rows
});
