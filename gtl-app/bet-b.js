/* =========================================================================
   BET DRAWER — VERSION B ("enter price")   [the -b variant pages]

   A second, self-contained bet drawer ported from the home-v5 branch. Loaded
   by the "-b" design-fork pages (home-b.html, game-b.html), AFTER app.js. It
   reuses app.js's shared globals
   ($, $$, GAMES, USER, money, MARKET_LABELS, priceDelta, CHECK_ICON,
   leaderOf, isAuthed, openAuthGate, marketsFromGame) but keeps ALL of its
   own state and DOM under a "B" namespace (#betSheetB / #betBackdropB) so it
   can never touch the original drawer (#betSheet) on any other page.

   What's different from the original drawer (the "enter price" design):
   - the scoreboard header becomes an order summary with an inline
     Market / Limit order-kind toggle;
   - Market buy = enter a DOLLAR AMOUNT, contracts are derived from the price;
   - Limit buy = enter a PRICE (¢) and a number of contracts directly.

   Routing: a single capture-phase click listener intercepts bet actions on
   whatever -b page loads this file (price tiles + position Buy/Sell) and opens
   THIS drawer, stopping the event so app.js's original handlers never fire.
   Guests still hit the auth gate, exactly as on the standard pages.
   ========================================================================= */
(function () {
  "use strict";

  const betStateB = { game: null, mode: "buy", market: "gtl", contract: "yes", amount: 0, limitQty: 0, quantity: 0, step: 1, markets: {}, limit: null, limitOpen: false, holding: 0, avg: 0, sellQty: 0, priceUpdating: false, pendingYes: null };

  let amountNormalizeTimerB = null;
  const parseMoneyInputB = (value) => {
    const cleaned = String(value || "").replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const normalized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
    const n = parseFloat(normalized);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  function computeBetB() {
    const mk = betStateB.markets[betStateB.market] || { yes: 50, no: 50 };
    const marketPrice = betStateB.contract === "yes" ? mk.yes : mk.no;
    const priceCents = betStateB.limit != null ? betStateB.limit : marketPrice;
    const unitPrice = priceCents / 100;
    const amount = Math.max(0, Number(betStateB.amount) || 0);
    const qty = betStateB.limitOpen ? Math.max(0, Number(betStateB.limitQty) || 0) : unitPrice > 0 ? Math.floor(amount / unitPrice) : 0;
    const subtotal = (priceCents / 100) * qty;
    const fee = qty > 0 ? Math.max(0.01, subtotal * 0.02) : 0;
    const total = subtotal + fee;
    const payout = qty;
    const profit = Math.max(0, payout - subtotal);
    const net = Math.max(0, profit - fee);
    betStateB.quantity = qty;
    return { mk, marketPrice, priceCents, amount, qty, subtotal, fee, total, payout, profit, net };
  }

  function computeSellB() {
    const mk = betStateB.markets[betStateB.market] || { yes: 50, no: 50 };
    const priceCents = betStateB.contract === "yes" ? mk.yes : mk.no;
    const qty = betStateB.sellQty || 0;
    const gross = (priceCents / 100) * qty;
    const fee = qty > 0 ? Math.max(0.01, gross * 0.02) : 0;
    const proceeds = Math.max(0, gross - fee);
    const cost = (betStateB.avg / 100) * qty;
    const realized = proceeds - cost;
    return { priceCents, qty, gross, fee, proceeds, cost, realized };
  }

  // The original bet-drawer game header — team-vs-team scoreboard (no close X;
  // the Market/Limit toggle now lives in the body's price section instead).
  function fillScoreboardB(sb, g) {
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
  function renderScoreboardB(g) { fillScoreboardB($("#betSheetB")?.querySelector("[data-bet-grab]"), g); }

  function ensureBetSheetB() {
    let sheet = $("#betSheetB");
    if (sheet) return sheet;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="bet-sheet-backdrop" id="betBackdropB" data-bet-close></div>
      <aside class="bet-sheet" id="betSheetB" data-step="1" data-mode="buy" data-order-kind="market" aria-hidden="true" aria-label="Place a bet">
        <div class="bet-scoreboard" data-bet-grab></div>
        <div class="bet-sheet-handle" aria-hidden="true"></div>

        <div class="bet-sheet-body">
          <div class="bet-step bet-step-1">
            <!-- SELL: position you hold -->
            <div class="sell-only sell-readout">
              <span class="sell-tag" data-sell-tag>—</span>
              <span class="sell-sub" data-sell-sub>—</span>
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

            <!-- PRICE SECTION (above bet type): how much to spend, then order type -->
            <!-- MARKET: dollar amount; contracts are calculated from price -->
            <div class="bet-field amount-field buy-only">
              <div class="money-input-plain">
                <span class="money-prefix">$</span>
                <input class="num-input money-input" data-amount-input type="text" inputmode="decimal" placeholder="0.00" value="" aria-label="Amount to spend in dollars" />
              </div>
              <p class="buy-contracts" data-buy-contracts>0 contracts</p>
            </div>

            <!-- LIMIT: enter a price (¢) and number of contracts -->
            <div class="limit-section" data-limit-section hidden>
              <div class="limit-row">
                <span class="limit-copy" data-limit-label>Set a Limit</span>
                <div class="num-input-box">
                  <input class="num-input" data-limit-input type="text" inputmode="numeric" aria-label="Limit price in cents" />
                  <span class="num-suffix">¢</span>
                </div>
              </div>
              <div class="limit-row limit-qty-field buy-only">
                <span class="limit-copy">Contracts</span>
                <input class="num-input" data-limit-qty-input type="text" inputmode="numeric" value="" placeholder="0" aria-label="Number of contracts for limit order" />
              </div>
            </div>

            <!-- Potential profit — directly below the price / contracts -->
            <div class="buy-outcome buy-only">
              <p class="potential-win">Potential profit of <strong data-profit-big>$0.00</strong> <span>after <a href="#" class="fees-link" data-fees-link>fees</a></span></p>
              <p class="limit-total" data-limit-total>Total <strong>$0.00</strong></p>
            </div>

            <!-- Order type — under the price / contracts -->
            <div class="bet-field buy-only">
              <div class="seg" role="group" aria-label="Order type">
                <button type="button" data-order-kind="market">Market</button>
                <button type="button" data-order-kind="limit">Limit</button>
              </div>
            </div>

            <div class="bet-field buy-only">
              <span class="bet-label">Pick a side</span>
              <div class="bet-toggle" data-active="yes" role="group" aria-label="Side">
                <button class="bt-opt yes" data-contract="yes"><span class="bt-side">Yes</span><span class="bt-price tnum" data-yes-price>—</span></button>
                <button class="bt-opt no" data-contract="no"><span class="bt-side">No</span><span class="bt-price tnum" data-no-price>—</span></button>
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

            <!-- SELL: proceeds + realised P&L -->
            <div class="bet-highlight sell-only">
              <span class="bet-label">You receive</span>
              <span class="bet-total-big tnum" data-receive-big>$0.00</span>
              <p class="potential-win" data-realized-line>Realised profit <strong data-realized-big>$0.00</strong> <span>after <a href="#" class="fees-link" data-fees-link>fees</a></span></p>
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
      <button class="btn btn-secondary bet-sheet-close" id="betCloseB" data-bet-close>Close</button>
    `);
    sheet = $("#betSheetB");

    const amountInput = sheet.querySelector("[data-amount-input]");
    const limitInput = sheet.querySelector("[data-limit-input]");
    const limitQtyInput = sheet.querySelector("[data-limit-qty-input]");

    $$("[data-market]", sheet).forEach((b) => b.addEventListener("click", () => { betStateB.market = b.dataset.market; updateBetSheetB(); }));
    $$("[data-contract]", sheet).forEach((b) => b.addEventListener("click", () => { betStateB.contract = b.dataset.contract; updateBetSheetB(); }));
    // Delegated: close (backdrop + header X) and the Market/Limit order-kind toggle
    sheet.addEventListener("click", (e) => {
      const close = e.target.closest("[data-bet-close]");
      if (close && sheet.contains(close)) { closeBetSheetB(); return; }
      const b = e.target.closest("[data-order-kind]");
      if (!b || !sheet.contains(b)) return;
      betStateB.limitOpen = b.dataset.orderKind === "limit";
      if (betStateB.limitOpen) {
        const mk = betStateB.markets[betStateB.market] || { yes: 50, no: 50 };
        betStateB.limit = betStateB.contract === "yes" ? mk.yes : mk.no;
        limitInput.value = betStateB.limit;
        limitQtyInput.value = betStateB.limitQty || "";
      } else {
        betStateB.limit = null;
        limitInput.value = "";
      }
      updateBetSheetB();
    });
    $("#betBackdropB").addEventListener("click", closeBetSheetB);
    $("#betCloseB")?.addEventListener("click", closeBetSheetB); // desktop close (sibling of the sheet)
    sheet.querySelector("[data-breakdown]").addEventListener("click", () => { betStateB.step = 2; updateBetSheetB(); });
    sheet.querySelector("[data-bet-back]").addEventListener("click", () => { betStateB.step = 1; updateBetSheetB(); });
    sheet.querySelector("[data-bet-primary]").addEventListener("click", placeBetB);
    sheet.querySelector("[data-cancel-bet]").addEventListener("click", closeBetSheetB);
    sheet.querySelector("[data-success-close]").addEventListener("click", closeBetSheetB);
    sheet.addEventListener("click", (e) => { if (e.target.closest("[data-fees-link]")) { e.preventDefault(); goToFeesB(); } }); // delegated: covers the buy line AND the (regenerated) sell line's fees link

    amountInput.addEventListener("input", () => {
      betStateB.amount = parseMoneyInputB(amountInput.value);
      updateBetSheetB();
      scheduleNormalizeBuyAmountB();
    });
    amountInput.addEventListener("blur", () => normalizeBuyAmountB());
    limitInput.addEventListener("input", () => {
      const mk = betStateB.markets[betStateB.market] || { yes: 50, no: 50 };
      const max = betStateB.contract === "yes" ? mk.yes : mk.no; // can't bid above the listed price
      let v = parseInt(limitInput.value.replace(/[^0-9]/g, ""), 10);
      if (isNaN(v)) v = 0;
      if (v > max) { v = max; limitInput.value = max; }
      betStateB.limit = v >= 1 ? v : 1;
      updateBetSheetB();
    });
    limitQtyInput.addEventListener("input", () => {
      let v = parseInt(limitQtyInput.value.replace(/[^0-9]/g, ""), 10);
      if (isNaN(v)) v = 0;
      betStateB.limitQty = Math.max(0, v);
      limitQtyInput.value = betStateB.limitQty || "";
      updateBetSheetB();
    });

    // Sell mode — contracts-to-sell input + quick percentages (capped at holding)
    const sellQtyInput = sheet.querySelector("[data-sell-qty-input]");
    sellQtyInput.addEventListener("input", () => {
      let v = parseInt(sellQtyInput.value.replace(/[^0-9]/g, ""), 10);
      if (isNaN(v)) v = 0;
      v = Math.max(0, Math.min(betStateB.holding || 0, v));
      betStateB.sellQty = v; sellQtyInput.value = v; updateBetSheetB();
    });
    sheet.querySelector("[data-sell-quick]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-sell-pct]");
      if (!b) return;
      betStateB.sellQty = Math.max(1, Math.round((betStateB.holding || 0) * Number(b.dataset.sellPct) / 100));
      sellQtyInput.value = betStateB.sellQty; updateBetSheetB();
    });

    // Swipe the scoreboard down to close (mobile only — on desktop it's a centred modal)
    const grab = sheet.querySelector("[data-bet-grab]");
    let sStartY = 0, sDrag = false;
    grab.addEventListener("pointerdown", (e) => { if (window.matchMedia("(min-width: 768px)").matches) return; sDrag = true; sStartY = e.clientY; sheet.style.transition = "none"; grab.setPointerCapture(e.pointerId); });
    grab.addEventListener("pointermove", (e) => { if (!sDrag) return; const dy = Math.max(0, e.clientY - sStartY); sheet.style.transform = `translateY(${dy}px)`; });
    const sEnd = (e) => { if (!sDrag) return; sDrag = false; const dy = Math.max(0, (e.clientY || sStartY) - sStartY); sheet.style.transition = ""; sheet.style.transform = ""; if (dy > 110) closeBetSheetB(); };
    grab.addEventListener("pointerup", sEnd);
    grab.addEventListener("pointercancel", sEnd);

    return sheet;
  }

  function normalizeBuyAmountB() {
    if (amountNormalizeTimerB) { clearTimeout(amountNormalizeTimerB); amountNormalizeTimerB = null; }
    if (betStateB.mode === "sell" || betStateB.limitOpen) return;
    const sheet = $("#betSheetB");
    if (!sheet) return;
    const { qty, subtotal } = computeBetB();
    const input = sheet.querySelector("[data-amount-input]");
    if (qty > 0) {
      betStateB.amount = subtotal;
      if (input) input.value = subtotal.toFixed(2);
    } else if (input && !input.value.trim()) {
      betStateB.amount = 0;
    }
    updateBetSheetB();
  }

  function scheduleNormalizeBuyAmountB() {
    if (amountNormalizeTimerB) clearTimeout(amountNormalizeTimerB);
    amountNormalizeTimerB = setTimeout(normalizeBuyAmountB, 550);
  }

  function updateBetSheetB() {
    const sheet = ensureBetSheetB();
    if (betStateB.limitOpen && betStateB.limit != null) {
      const mkNow = betStateB.markets[betStateB.market] || { yes: 50, no: 50 };
      const maxNow = betStateB.contract === "yes" ? mkNow.yes : mkNow.no;
      if (betStateB.limit > maxNow) { betStateB.limit = maxNow; const li = sheet.querySelector("[data-limit-input]"); if (li) li.value = maxNow; }
    }
    const { mk, marketPrice, priceCents, amount, qty, subtotal, fee, total, payout, profit, net } = computeBetB();

    sheet.setAttribute("data-step", betStateB.step);
    sheet.setAttribute("data-mode", betStateB.mode || "buy");
    sheet.setAttribute("data-order-kind", betStateB.limitOpen ? "limit" : "market");
    sheet.classList.toggle("is-updating-price", !!betStateB.priceUpdating);
    sheet.querySelector("[data-yes-price]").textContent = `${mk.yes}¢`;
    sheet.querySelector("[data-no-price]").textContent = `${mk.no}¢`;

    $$("[data-market]", sheet).forEach((b) => b.classList.toggle("is-active", b.dataset.market === betStateB.market));
    $$("[data-contract]", sheet).forEach((b) => b.classList.toggle("is-active", b.dataset.contract === betStateB.contract));
    sheet.querySelector(".bet-toggle").dataset.active = betStateB.contract;
    $$("[data-order-kind]", sheet).forEach((b) => b.classList.toggle("is-active", (betStateB.limitOpen ? "limit" : "market") === b.dataset.orderKind));

    // limit section
    const limitSection = sheet.querySelector("[data-limit-section]");
    const limitLabel = sheet.querySelector("[data-limit-label]");
    limitSection.hidden = !betStateB.limitOpen;
    if (limitLabel) limitLabel.textContent = "Set a Limit";

    // outcome — green profit-after-fees + (limit) total
    sheet.querySelector("[data-profit-big]").textContent = money(net);
    const limitTotal = sheet.querySelector("[data-limit-total] strong");
    if (limitTotal) limitTotal.textContent = money(subtotal);
    const contractsLine = sheet.querySelector("[data-buy-contracts]");
    if (contractsLine) contractsLine.textContent = `${qty} contract${qty === 1 ? "" : "s"}`;

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
    if (betStateB.mode === "sell") {
      const s = computeSellB();
      sheet.querySelector("[data-sell-tag]").innerHTML = `${MARKET_LABELS[betStateB.market]} · <span class="side-${betStateB.contract}">${betStateB.contract.toUpperCase()}</span>`;
      sheet.querySelector("[data-sell-sub]").innerHTML = `<span>${betStateB.holding} Held</span><span aria-hidden="true">·</span><span>Bought at ${betStateB.avg}¢</span><span aria-hidden="true">·</span><span>Now ${s.priceCents}¢</span>`;
      $$("[data-sell-pct]", sheet).forEach((b) => {
        const target = Math.max(1, Math.round(betStateB.holding * Number(b.dataset.sellPct) / 100));
        b.classList.toggle("is-active", target === s.qty);
      });
      sheet.querySelector("[data-receive-big]").textContent = money(s.proceeds);
      const rline = sheet.querySelector("[data-realized-line]");
      const win = s.realized >= 0;
      rline.classList.toggle("is-loss", !win);
      rline.innerHTML = `Realised ${win ? "profit" : "loss"} <strong>${money(Math.abs(s.realized))}</strong> <span>after <a href="#" class="fees-link" data-fees-link>fees</a></span>`;
    }

    // Primary button label + validity
    const primary = sheet.querySelector("[data-bet-primary]");
    if (primary) {
      const belowMarketMinimum = !betStateB.limitOpen && amount < (marketPrice / 100);
      const invalidBuy = betStateB.mode !== "sell" && (qty < 1 || belowMarketMinimum);
      primary.disabled = !!betStateB.priceUpdating || invalidBuy;
      primary.textContent = betStateB.priceUpdating ? "Updating..." : (betStateB.mode === "sell" ? "Sell" : (betStateB.step === 2 ? "Place Bet" : "Buy"));
    }
    $$("[data-contract]", sheet).forEach((b) => { b.disabled = !!betStateB.priceUpdating; });
    syncLimitSizeB();
    syncAmountSizeB();
  }

  // Size the limit input to its content so the ¢ suffix sits next to the number
  function syncLimitSizeB() {
    const li = $("#betSheetB")?.querySelector("[data-limit-input]");
    if (li) li.size = Math.max(1, String(li.value || "").length);
  }
  function syncAmountSizeB() {
    const input = $("#betSheetB")?.querySelector("[data-amount-input]");
    if (input) input.size = Math.max(1, String(input.value || input.placeholder || "").length);
  }

  let betTickerB = null;
  function startBetTickerB() {
    stopBetTickerB();
    betTickerB = setInterval(() => {
      const sheet = $("#betSheetB");
      const mk = betStateB.markets[betStateB.market];
      if (!sheet || !mk) return;
      let yes = Math.max(5, Math.min(95, mk.yes + priceDelta()));
      applyBetPriceUpdateB(yes);
    }, 10000);
  }
  // Prices still tick live, but WITHOUT the "updating" spinner/lock phase — the
  // new price is applied instantly with a subtle blip (spinner is not wanted).
  function applyBetPriceUpdateB(nextYes) {
    const sheet = $("#betSheetB");
    const mk = betStateB.markets[betStateB.market];
    if (!sheet || !mk) return;
    mk.yes = nextYes;
    mk.no = 100 - mk.yes;
    updateBetSheetB();
    ["[data-yes-price]", "[data-no-price]"].forEach((sel) => {
      const el = sheet.querySelector(sel);
      if (el) { el.classList.remove("blip"); void el.offsetWidth; el.classList.add("blip"); }
    });
  }
  function stopBetTickerB() {
    if (betTickerB) { clearInterval(betTickerB); betTickerB = null; }
    betStateB.priceUpdating = false;
    betStateB.pendingYes = null;
  }

  function syncInputsB() {
    const sheet = $("#betSheetB");
    if (!sheet) return;
    const amount = Number(betStateB.amount) || 0;
    sheet.querySelector("[data-amount-input]").value = amount > 0 ? amount.toFixed(2) : "";
    sheet.querySelector("[data-limit-input]").value = betStateB.limit != null ? betStateB.limit : "";
    sheet.querySelector("[data-limit-qty-input]").value = betStateB.limitQty || "";
    syncLimitSizeB();
    syncAmountSizeB();
  }

  function openSheetChromeB(sheet) {
    $("#betBackdropB").classList.add("is-open");
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("sheet-open");
  }

  function openBetSheetB(gameId, market, side, markets, opts = {}) {
    const g = GAMES.find((x) => x.id === gameId);
    if (!g) return;
    const amount = opts.amount != null ? Number(opts.amount) : 0; // default to $0.00 / 0 contracts
    Object.assign(betStateB, {
      game: g, mode: opts.mode || "buy", market, contract: side, markets,
      amount, limitQty: opts.limitQty || 0, quantity: 0, step: 1,
      holding: 0, avg: 0, sellQty: 0,
      limit: opts.limit != null ? opts.limit : null,
      limitOpen: opts.limit != null,
      priceUpdating: false, pendingYes: null,
    });
    const sheet = ensureBetSheetB();
    sheet.classList.remove("is-success");
    renderScoreboardB(g);
    updateBetSheetB();
    syncInputsB();
    openSheetChromeB(sheet);
    startBetTickerB();
  }

  // Buy more of an existing position — the buy drawer, prefilled
  function openBuyB(pos) {
    if (!pos) return;
    const g = GAMES.find((x) => x.id === pos.gameId);
    if (!g) return;
    openBetSheetB(pos.gameId, pos.market, pos.side, marketsFromGame(g), { mode: "buy" });
  }

  // Sell all or part of a holding at the live price
  function openSellB(pos) {
    if (!pos) return;
    const g = GAMES.find((x) => x.id === pos.gameId);
    if (!g) return;
    Object.assign(betStateB, {
      game: g, mode: "sell", market: pos.market, contract: pos.side, markets: marketsFromGame(g),
      holding: pos.qty, avg: pos.avg, sellQty: pos.qty,
      amount: 0, limitQty: 0, quantity: 0, step: 1, limit: null, limitOpen: false,
      priceUpdating: false, pendingYes: null,
    });
    const sheet = ensureBetSheetB();
    sheet.classList.remove("is-success");
    renderScoreboardB(g);
    updateBetSheetB();
    const sq = sheet.querySelector("[data-sell-qty-input]");
    if (sq) sq.value = betStateB.sellQty;
    syncInputsB();
    openSheetChromeB(sheet);
    startBetTickerB();
  }

  function closeBetSheetB() {
    const sheet = $("#betSheetB");
    if (!sheet) return;
    stopBetTickerB();
    stopCancelTimerB();
    $("#betBackdropB").classList.remove("is-open");
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sheet-open");
  }

  function placeBetB() {
    if (betStateB.priceUpdating) return;
    if (betStateB.mode === "sell") return sellNowB();
    const sheet = ensureBetSheetB();
    const { priceCents, qty, subtotal, fee, total } = computeBetB();
    if (qty < 1) return;
    sheet.querySelector("[data-success-title]").textContent = "Bet placed!";
    sheet.querySelector("[data-success-line]").textContent = `${qty} × ${MARKET_LABELS[betStateB.market]} ${betStateB.contract.toUpperCase()}`;
    sheet.querySelector("[data-sx-price]").textContent = `${priceCents}¢`;
    sheet.querySelector("[data-sx-qty]").textContent = qty;
    sheet.querySelector("[data-sx-subtotal]").textContent = money(subtotal);
    sheet.querySelector("[data-sx-fee]").textContent = money(fee);
    sheet.querySelector("[data-sx-total-label]").textContent = "Total paid";
    sheet.querySelector("[data-sx-total]").textContent = money(total);
    sheet.querySelector("[data-cancel-bet]").textContent = "Cancel Bet";
    sheet.classList.add("is-success");
    stopBetTickerB();
    startCancelTimerB();
  }

  function sellNowB() {
    if (betStateB.priceUpdating) return;
    const sheet = ensureBetSheetB();
    const s = computeSellB();
    if (s.qty < 1) return;
    sheet.querySelector("[data-success-title]").textContent = "Sold!";
    sheet.querySelector("[data-success-line]").textContent = `${s.qty} × ${MARKET_LABELS[betStateB.market]} ${betStateB.contract.toUpperCase()} sold`;
    sheet.querySelector("[data-sx-price]").textContent = `${s.priceCents}¢`;
    sheet.querySelector("[data-sx-qty]").textContent = s.qty;
    sheet.querySelector("[data-sx-subtotal]").textContent = money(s.gross);
    sheet.querySelector("[data-sx-fee]").textContent = money(s.fee);
    sheet.querySelector("[data-sx-total-label]").textContent = "You received";
    sheet.querySelector("[data-sx-total]").textContent = money(s.proceeds);
    sheet.querySelector("[data-cancel-bet]").textContent = "Undo Sale";
    sheet.classList.add("is-success");
    stopBetTickerB();
    startCancelTimerB();
  }

  let cancelTimerB = null;
  function startCancelTimerB() {
    stopCancelTimerB();
    const btn = $("#betSheetB")?.querySelector("[data-cancel-bet]");
    if (!btn) return;
    btn.classList.remove("draining");
    void btn.offsetWidth;
    btn.classList.add("draining"); // 10s left-to-right fill
    cancelTimerB = setTimeout(closeBetSheetB, 10000);
  }
  function stopCancelTimerB() { if (cancelTimerB) { clearTimeout(cancelTimerB); cancelTimerB = null; } }

  function goToFeesB() {
    if (!betStateB.game) return;
    const p = new URLSearchParams({ game: betStateB.game.id, market: betStateB.market, side: betStateB.contract, qty: betStateB.quantity });
    if (betStateB.limit != null) p.set("limit", betStateB.limit);
    location.href = "fees.html?" + p.toString();
  }

  // Close the header Open Positions dropdown behind the drawer (mirrors app.js's closePos)
  function closeHposPanelB() {
    const p = document.getElementById("hposPanel");
    if (p) { p.setAttribute("hidden", ""); document.querySelector("[data-hpos-toggle]")?.setAttribute("aria-expanded", "false"); }
  }

  /* ---- Routing: intercept bet actions on this -b page and open THIS drawer - */
  // Capture phase so we run before app.js's own click handlers; stopPropagation
  // then keeps the original (#betSheet) drawer from also firing.
  document.addEventListener("click", (e) => {
    const price = e.target.closest(".price");
    if (price && price.dataset.game) {
      e.stopPropagation();
      if (!isAuthed()) { openAuthGate(price.dataset.game, price.dataset.market, price.dataset.side); return; } // guests: contextual account prompt
      const grid = price.closest(".mkt-grid");
      const markets = {};
      grid.querySelectorAll(".price[data-market]").forEach((b) => {
        const m = b.dataset.market;
        markets[m] = markets[m] || {};
        markets[m][b.classList.contains("no") ? "no" : "yes"] = parseInt(b.textContent, 10);
      });
      openBetSheetB(price.dataset.game, price.dataset.market, price.dataset.side, markets);
      return;
    }
    const buy = e.target.closest("[data-buy]");
    const sell = e.target.closest("[data-sell]");
    if (buy || sell) {
      e.stopPropagation();
      closeHposPanelB();
      if (buy) openBuyB(USER.positions[Number(buy.dataset.buy)]);
      else openSellB(USER.positions[Number(sell.dataset.sell)]);
    }
  }, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeBetSheetB(); });
})();
