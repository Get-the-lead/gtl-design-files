document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
  });
});

document.querySelectorAll(".save-game-button").forEach((button) => {
  button.addEventListener("click", () => {
    const isSaved = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isSaved));
    button.classList.toggle("is-saved", !isSaved);
  });
});

document.querySelectorAll("[data-market-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".market-track");
  const dots = [...carousel.querySelectorAll(".dot")];

  if (!track || dots.length === 0) return;

  const setActiveDot = () => {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      track.scrollTo({ left: track.clientWidth * index, behavior: "smooth" });
    });
  });

  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;

  track.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startScrollLeft = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    track.scrollLeft = startScrollLeft - (event.clientX - startX);
  });

  const stopDragging = () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove("is-dragging");
    setActiveDot();
  };

  track.addEventListener("pointerup", stopDragging);
  track.addEventListener("pointercancel", stopDragging);
  track.addEventListener("scroll", setActiveDot, { passive: true });

  const initialIndex = Math.max(0, dots.findIndex((dot) => dot.classList.contains("active")));
  track.scrollLeft = track.clientWidth * initialIndex;
  setActiveDot();
});

const tradeSheetState = {
  action: "buy",
  contract: "yes",
  priceCents: 50,
  yesPriceCents: 50,
  noPriceCents: 50,
  quantity: 10,
  gameTitle: "",
  marketTitle: "",
};

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function parsePriceCents(button) {
  const priceText = button.querySelector(".prices strong")?.textContent || "";
  const match = priceText.match(/\d+/);
  return match ? Number(match[0]) : 50;
}

function getGameTitle(card) {
  const teams = [...card.querySelectorAll(".team-name span:last-child, .team-name span")]
    .map((team) => team.textContent.trim())
    .filter(Boolean);

  if (teams.length >= 2) {
    const first = teams[0].split(" ").slice(-1)[0];
    const second = teams[1].split(" ").slice(-1)[0];
    return `${first} vs ${second}`;
  }

  return "Live game";
}

function getMarketTitle(button) {
  const slide = button.closest(".market-slide");
  const stackedMarket = button.closest(".stacked-market");
  const label = slide?.querySelector(".market-label") || stackedMarket?.querySelector(".stacked-market-header strong");
  return label?.textContent.trim().replace("GTL - ", "").replace("KTL - ", "") || "Get the Lead";
}

function ensureTradeSheet() {
  let sheet = document.querySelector("[data-trade-sheet]");

  if (sheet) return sheet;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="trade-sheet-backdrop" data-trade-close></div>
      <aside class="trade-sheet" data-trade-sheet aria-hidden="true" aria-label="Trade ticket">
        <header class="trade-sheet-header">
          <div class="trade-sheet-title">
            <p data-trade-game>Live game</p>
            <h2 data-trade-market>Get the Lead</h2>
          </div>
          <button class="icon-button" type="button" data-trade-close aria-label="Close trade ticket">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </header>

        <div class="trade-sheet-body">
          <section class="trade-sheet-section" aria-label="Action">
            <div class="tabs" role="tablist" aria-label="Trade action">
              <button class="tab is-active" type="button" data-trade-action="buy">Buy</button>
              <button class="tab" type="button" data-trade-action="sell">Sell</button>
            </div>
          </section>

          <section class="trade-sheet-section" aria-label="Contract">
            <span class="trade-sheet-label">Contract</span>
            <div class="contract-toggle" role="group" aria-label="Contract selection">
              <button class="contract-option is-active" type="button" data-contract="yes">YES</button>
              <button class="contract-option" type="button" data-contract="no">NO</button>
            </div>
          </section>

          <section class="trade-sheet-section quantity-control">
            <label class="trade-sheet-label" for="trade-quantity">Number of contracts</label>
            <input id="trade-quantity" type="number" inputmode="numeric" min="1" step="1" value="10" data-trade-quantity>
            <div class="quick-amounts" aria-label="Quick quantities">
              <button class="quick-amount" type="button" data-quantity="10">10</button>
              <button class="quick-amount" type="button" data-quantity="25">25</button>
              <button class="quick-amount" type="button" data-quantity="50">50</button>
              <button class="quick-amount" type="button" data-quantity="100">100</button>
            </div>
            <p class="contract-price-note">Current contract price: <strong data-current-price>50¢</strong></p>
          </section>

          <section class="trade-sheet-section">
            <span class="trade-sheet-label">Order summary</span>
            <div class="order-summary">
              <div class="summary-row"><span>Contract price</span><strong data-summary-price>50¢</strong></div>
              <div class="summary-row"><span>Quantity</span><strong data-summary-quantity>10</strong></div>
              <div class="summary-row"><span>Subtotal</span><strong data-summary-subtotal>$5.00</strong></div>
              <div class="summary-row"><span>Trading fee</span><strong data-summary-fee>$0.10</strong></div>
              <div class="summary-row total"><span data-total-label>Total to pay</span><strong data-summary-total>$5.10</strong></div>
            </div>
          </section>

          <section class="trade-sheet-section">
            <span class="trade-sheet-label">Potential gain</span>
            <div class="potential-box">
              <div class="summary-row"><span>Potential payout</span><strong data-potential-payout>$10.00</strong></div>
              <div class="summary-row"><span>Potential profit</span><strong data-potential-profit>$4.90</strong></div>
              <div class="summary-row"><span>Fees</span><strong data-potential-fees>$0.10</strong></div>
              <div class="summary-row total"><span>Net potential gain</span><strong data-net-gain>$4.80</strong></div>
            </div>
          </section>
        </div>

        <footer class="trade-sheet-footer">
          <button class="button button-primary trade-submit" type="button" data-trade-submit>Buy YES</button>
        </footer>
      </aside>
    `
  );

  sheet = document.querySelector("[data-trade-sheet]");

  document.querySelectorAll("[data-trade-close]").forEach((item) => {
    item.addEventListener("click", closeTradeSheet);
  });

  sheet.querySelectorAll("[data-trade-action]").forEach((button) => {
    button.addEventListener("click", () => {
      tradeSheetState.action = button.dataset.tradeAction;
      updateTradeSheet();
    });
  });

  sheet.querySelectorAll("[data-contract]").forEach((button) => {
    button.addEventListener("click", () => {
      tradeSheetState.contract = button.dataset.contract;
      updateTradeSheet();
    });
  });

  sheet.querySelector("[data-trade-quantity]").addEventListener("input", (event) => {
    tradeSheetState.quantity = Math.max(1, Number(event.target.value) || 1);
    updateTradeSheet();
  });

  sheet.querySelectorAll("[data-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      tradeSheetState.quantity = Number(button.dataset.quantity);
      updateTradeSheet();
    });
  });

  return sheet;
}

function updateTradeSheet() {
  const sheet = ensureTradeSheet();
  tradeSheetState.priceCents = tradeSheetState.contract === "yes" ? tradeSheetState.yesPriceCents : tradeSheetState.noPriceCents;

  const price = tradeSheetState.priceCents / 100;
  const quantity = tradeSheetState.quantity;
  const subtotal = price * quantity;
  const fee = Math.max(0.01, subtotal * 0.02);
  const total = tradeSheetState.action === "buy" ? subtotal + fee : Math.max(0, subtotal - fee);
  const potentialPayout = quantity;
  const potentialProfit = Math.max(0, potentialPayout - subtotal);
  const netGain = Math.max(0, potentialProfit - fee);
  const actionLabel = tradeSheetState.action === "buy" ? "Buy" : "Sell";
  const contractLabel = tradeSheetState.contract.toUpperCase();

  sheet.querySelector("[data-trade-game]").textContent = tradeSheetState.gameTitle;
  sheet.querySelector("[data-trade-market]").textContent = tradeSheetState.marketTitle;
  sheet.querySelector("[data-trade-quantity]").value = quantity;
  sheet.querySelector("[data-current-price]").textContent = `${tradeSheetState.priceCents}¢`;
  sheet.querySelector("[data-summary-price]").textContent = `${tradeSheetState.priceCents}¢`;
  sheet.querySelector("[data-summary-quantity]").textContent = quantity;
  sheet.querySelector("[data-summary-subtotal]").textContent = formatCurrency(subtotal);
  sheet.querySelector("[data-summary-fee]").textContent = formatCurrency(fee);
  sheet.querySelector("[data-total-label]").textContent = tradeSheetState.action === "buy" ? "Total to pay" : "Total to receive";
  sheet.querySelector("[data-summary-total]").textContent = formatCurrency(total);
  sheet.querySelector("[data-potential-payout]").textContent = formatCurrency(potentialPayout);
  sheet.querySelector("[data-potential-profit]").textContent = formatCurrency(potentialProfit);
  sheet.querySelector("[data-potential-fees]").textContent = formatCurrency(fee);
  sheet.querySelector("[data-net-gain]").textContent = formatCurrency(netGain);
  sheet.querySelector("[data-trade-submit]").textContent = `${actionLabel} ${contractLabel}`;

  sheet.querySelectorAll("[data-trade-action]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tradeAction === tradeSheetState.action);
  });

  sheet.querySelectorAll("[data-contract]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.contract === tradeSheetState.contract);
  });
}

function openTradeSheet(button) {
  const card = button.closest(".live-game-card");
  const marketActions = button.closest(".market-actions");
  const contract = button.classList.contains("no") ? "no" : "yes";
  const yesButton = marketActions?.querySelector(".bet-button.yes");
  const noButton = marketActions?.querySelector(".bet-button.no");

  tradeSheetState.action = "buy";
  tradeSheetState.contract = contract;
  tradeSheetState.yesPriceCents = yesButton ? parsePriceCents(yesButton) : parsePriceCents(button);
  tradeSheetState.noPriceCents = noButton ? parsePriceCents(noButton) : parsePriceCents(button);
  tradeSheetState.priceCents = contract === "yes" ? tradeSheetState.yesPriceCents : tradeSheetState.noPriceCents;
  tradeSheetState.quantity = 10;
  tradeSheetState.gameTitle = getGameTitle(card);
  tradeSheetState.marketTitle = getMarketTitle(button);

  const sheet = ensureTradeSheet();
  const backdrop = document.querySelector(".trade-sheet-backdrop");

  updateTradeSheet();
  document.body.classList.add("sheet-open");
  backdrop.classList.add("is-open");
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
}

function closeTradeSheet() {
  const sheet = document.querySelector("[data-trade-sheet]");
  const backdrop = document.querySelector(".trade-sheet-backdrop");

  document.body.classList.remove("sheet-open");
  backdrop?.classList.remove("is-open");
  sheet?.classList.remove("is-open");
  sheet?.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".live-game-card .bet-button");

  if (!button || button.disabled || button.classList.contains("is-disabled")) return;

  openTradeSheet(button);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTradeSheet();
  }
});
