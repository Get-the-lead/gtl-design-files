document.querySelectorAll(".chip:not([data-sport])").forEach((chip) => {
  chip.addEventListener("click", () => {
    const group = chip.closest(".chip-row") || chip.parentElement;
    group?.querySelectorAll(".chip").forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
  });
});

document.querySelectorAll("[data-sport-filter]").forEach((filter) => {
  const chips = [...filter.querySelectorAll("[data-sport]")];
  const section = filter.closest(".landing-section");
  const cards = [...(section?.querySelectorAll(".live-game-card[data-sport]") || [])];
  const count = section?.querySelector("[data-live-game-count]");

  const updateSportFilter = (sport) => {
    let visibleCount = 0;

    cards.forEach((card) => {
      const isVisible = sport === "all" || card.dataset.sport === sport;
      card.classList.toggle("is-filtered-out", !isVisible);
      if (isVisible) visibleCount += 1;
    });

    chips.forEach((chip) => {
      const isActive = chip.dataset.sport === sport;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", String(isActive));
    });

    if (count) {
      count.textContent = `(${visibleCount})`;
    }
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => updateSportFilter(chip.dataset.sport || "all"));
  });
});

document.querySelectorAll("[data-live-clock]").forEach((clock) => {
  const initialText = clock.textContent?.trim() || "00:00";
  const [initialMinutes, initialSeconds] = initialText.split(":").map(Number);
  const initialTotal = initialMinutes * 60 + initialSeconds;

  if (!Number.isFinite(initialTotal) || initialTotal <= 0) return;

  let remaining = initialTotal;

  window.setInterval(() => {
    remaining = remaining <= 0 ? initialTotal : remaining - 1;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    clock.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, 1000);
});

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getCentsValue(element) {
  const match = element?.textContent?.match(/\d+/);
  return match ? Number(match[0]) : 50;
}

function getTrendIcon(valueElement) {
  let icon = valueElement.querySelector(".trend-icon");

  if (!icon) {
    icon = document.createElement("span");
    icon.className = "trend-icon";
    icon.setAttribute("aria-hidden", "true");
    valueElement.append(" ", icon);
  }

  return icon;
}

function setCentsValue(valueElement, value, previousValue) {
  const icon = getTrendIcon(valueElement);
  const direction = value > previousValue ? "up" : value < previousValue ? "down" : "";
  valueElement.firstChild.textContent = `${value}¢ `;
  icon.classList.toggle("up", direction === "up");
  icon.classList.toggle("down", direction === "down");
}

function updateTeamStates(card) {
  const rows = [...card.querySelectorAll(".team-row")];

  if (rows.length < 2) return;

  const scores = rows.map((row) => Number(row.querySelector(".score")?.textContent.trim()));

  rows.forEach((row) => {
    row.classList.remove("is-leading", "is-trailing");
  });

  if (!Number.isFinite(scores[0]) || !Number.isFinite(scores[1]) || scores[0] === scores[1]) return;

  const leaderIndex = scores[0] > scores[1] ? 0 : 1;
  rows[leaderIndex].classList.add("is-leading");
  rows[1 - leaderIndex].classList.add("is-trailing");
}

function markScore(row) {
  const score = row.querySelector(".score");
  const currentScore = Number(score?.textContent.trim());

  if (!score || !Number.isFinite(currentScore)) return;

  const points = [1, 2, 3, 6, 7][Math.floor(Math.random() * 5)];
  score.textContent = String(currentScore + points);
  row.classList.add("is-scoring");

  window.setTimeout(() => {
    row.classList.remove("is-scoring");
  }, 900);
}

function scheduleLiveScore(card) {
  const rows = [...card.querySelectorAll(".team-row")];
  const hasLiveClock = Boolean(card.querySelector("[data-live-clock]"));

  if (!hasLiveClock || rows.length < 2) return;

  const delay = 30000 + Math.floor(Math.random() * 10001);

  window.setTimeout(() => {
    const scoringRow = rows[Math.floor(Math.random() * rows.length)];
    markScore(scoringRow);
    updateTeamStates(card);
    scheduleLiveScore(card);
  }, delay);
}

function animateBinaryMarket(marketActions) {
  const yesButton = marketActions.querySelector(".bet-button.yes");
  const noButton = marketActions.querySelector(".bet-button.no");
  const yesValue = marketActions.querySelector(".bet-button.yes .prices strong");
  const noValue = marketActions.querySelector(".bet-button.no .prices strong");

  if (yesButton?.disabled || noButton?.disabled) return;
  if (!yesValue || !noValue) return;

  const currentYes = getCentsValue(yesValue);
  const currentNo = 100 - currentYes;
  const deltaOptions = [-4, -3, -2, 2, 3, 4];
  const delta = deltaOptions[Math.floor(Math.random() * deltaOptions.length)];
  const nextYes = clampNumber(currentYes + delta, 5, 95);
  const nextNo = 100 - nextYes;

  setCentsValue(yesValue, nextYes, currentYes);
  setCentsValue(noValue, nextNo, currentNo);
}

function animateOutcomeMarket(outcomeMarket) {
  if (outcomeMarket.querySelector(".outcome-button:disabled, .outcome-button.is-disabled")) return;

  const valueElements = [...outcomeMarket.querySelectorAll(".outcome-button strong")];

  if (valueElements.length !== 3) return;

  const values = valueElements.map(getCentsValue);
  const fromIndex = Math.floor(Math.random() * values.length);
  let toIndex = Math.floor(Math.random() * values.length);

  while (toIndex === fromIndex) {
    toIndex = Math.floor(Math.random() * values.length);
  }

  const transfer = Math.min(values[fromIndex] - 5, Math.floor(Math.random() * 4) + 2);
  if (transfer <= 0) return;

  const nextValues = [...values];
  nextValues[fromIndex] -= transfer;
  nextValues[toIndex] += transfer;

  valueElements.forEach((valueElement, index) => {
    setCentsValue(valueElement, nextValues[index], values[index]);
  });
}

document.querySelectorAll(".live-game-card .market-actions").forEach(animateBinaryMarket);
document.querySelectorAll(".live-game-card.model-3 .outcome-market").forEach(animateOutcomeMarket);
document.querySelectorAll(".live-game-card").forEach((card) => {
  updateTeamStates(card);
  scheduleLiveScore(card);
});

window.setInterval(() => {
  document.querySelectorAll(".live-game-card .market-actions").forEach(animateBinaryMarket);
  document.querySelectorAll(".live-game-card.model-3 .outcome-market").forEach(animateOutcomeMarket);
}, 2000);

document.querySelectorAll("[data-position-sell]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    button.classList.add("is-pressed");
    window.setTimeout(() => button.classList.remove("is-pressed"), 180);
  });
});

document.querySelectorAll(".open-position-card[data-position-id]").forEach((card) => {
  const selectPosition = () => {
    card.classList.add("is-selected");
    window.setTimeout(() => card.classList.remove("is-selected"), 180);
  };

  card.addEventListener("click", selectPosition);
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectPosition();
  });
});

document.querySelectorAll("[data-position-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".open-position-list");
  const cards = [...carousel.querySelectorAll(".open-position-card")];
  const dots = [...carousel.querySelectorAll(".position-dots .dot")];

  if (!track || !cards.length || !dots.length) return;

  const setActiveDot = () => {
    const index = cards.reduce((closestIndex, card, cardIndex) => {
      const currentDistance = Math.abs(card.offsetLeft - track.scrollLeft);
      const closestDistance = Math.abs(cards[closestIndex].offsetLeft - track.scrollLeft);
      return currentDistance < closestDistance ? cardIndex : closestIndex;
    }, 0);

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      track.scrollTo({ left: cards[index].offsetLeft, behavior: "smooth" });
    });
  });

  track.addEventListener("scroll", setActiveDot, { passive: true });
  setActiveDot();
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
  step: 1,
  mode: "market",
  priceCents: 50,
  limitPriceCents: 50,
  marketPriceCents: 50,
  quantity: 10,
  gameTitle: "",
  marketTitle: "",
  league: "",
  outcomeLabel: "",
  outcomeColor: "#c8d4c0",
  outcomeLogo: "",
  showOutcomeSwatch: true,
};

let tradeSheetTrigger = null;

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function parsePriceCents(button) {
  const priceText = button.querySelector(".prices strong")?.textContent || button.querySelector("strong")?.textContent || "";
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

function getTeams(card) {
  return [...card.querySelectorAll(".team-row")]
    .map((row) => {
      const name = row.querySelector(".team-name span:last-child, .team-name span")?.textContent.trim() || "";
      const logo = row.querySelector(".team-logo")?.getAttribute("src") || "";
      const score = Number(row.querySelector(".score")?.textContent.trim());

      return {
        name,
        shortName: name.split(" ").slice(-1)[0] || name,
        logo,
        score,
      };
    })
    .filter((team) => team.name);
}

function getLeague(card) {
  return card.querySelector(".sport-info span")?.textContent.trim() || "Live";
}

function getTeamColor(team) {
  const colorMap = {
    bos: "#007a33",
    dal: "#003594",
    den: "#0e2240",
    kc: "#e31837",
    ny: "#f58426",
    phi: "#004c54",
    sf: "#aa0000",
  };
  const match = team?.logo?.match(/\/([a-z]+)\.png/i);
  return colorMap[match?.[1]?.toLowerCase()] || "#c8d4c0";
}

function getOutcomeDetails(button, card) {
  const teams = getTeams(card);
  const sortedTeams = [...teams].sort((a, b) => (b.score || 0) - (a.score || 0));
  const leadingTeam = sortedTeams[0] || teams[0];
  const trailingTeam = sortedTeams[1] || teams[1] || teams[0];
  const rawLabel = button.querySelector("span:not(.material-symbols-outlined)")?.textContent.trim() || "";
  const outcomeKey = rawLabel.split("·")[0].trim().toUpperCase();

  if (button.classList.contains("outcome-tie") || outcomeKey === "TIE") {
    return {
      label: `${teams[0]?.shortName || "Game"} and ${teams[1]?.shortName || "opponent"} tie`,
      market: "Tie",
      color: "#ff9425",
      logo: "",
      showSwatch: false,
    };
  }

  if (button.classList.contains("outcome-ktl") || outcomeKey === "KTL") {
    return {
      label: `${leadingTeam?.shortName || "Leader"} keep the lead`,
      market: "Keep the Lead",
      color: getTeamColor(leadingTeam),
      logo: leadingTeam?.logo || "",
      showSwatch: true,
    };
  }

  return {
    label: `${trailingTeam?.shortName || "Team"} take the lead`,
    market: "Get the Lead",
    color: getTeamColor(trailingTeam),
    logo: trailingTeam?.logo || "",
    showSwatch: true,
  };
}

function getMarketTitle(button) {
  if (button.classList.contains("outcome-button")) {
    const outcomeLabel = [...button.querySelectorAll("span")]
      .map((label) => label.textContent.trim())
      .find((label) => label && label.toLowerCase() !== "lock");
    const outcomeKey = outcomeLabel?.split("·")[0].trim().toUpperCase();
    const outcomeNames = {
      GTL: "Get the Lead",
      TIE: "Tie",
      KTL: "Keep the Lead",
    };

    return outcomeNames[outcomeKey] || outcomeLabel || "Get the Lead";
  }

  const slide = button.closest(".market-slide");
  const stackedMarket = button.closest(".stacked-market");
  const label = slide?.querySelector(".market-label") || stackedMarket?.querySelector(".stacked-market-header strong");
  return label?.textContent.trim().replace("GTL - ", "").replace("KTL - ", "") || "Get the Lead";
}

function isLoggedExperience() {
  return document.body.classList.contains("logged-page");
}

function ensureTradeSheet() {
  let sheet = document.querySelector("[data-trade-sheet]");

  if (sheet) return sheet;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="trade-sheet-backdrop" data-trade-close></div>
      <aside class="trade-sheet" data-trade-sheet role="dialog" aria-modal="true" aria-hidden="true" aria-label="Trade preview">
        <div class="trade-sheet-handle" aria-hidden="true"></div>
        <header class="trade-sheet-header">
          <div class="trade-sheet-title">
            <p data-trade-game>Live game</p>
            <h2><span class="outcome-swatch" data-outcome-swatch></span><span data-outcome-label>Team takes the lead</span></h2>
          </div>
          <div class="trade-sheet-header-actions">
            <span class="trade-step-count"><strong data-current-step-count>1</strong><span>/2</span></span>
            <button class="icon-button" type="button" data-trade-close aria-label="Close trade ticket">
              <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        </header>

        <div class="trade-sheet-body">
          <div class="trade-step" data-trade-step="1">
            <section class="trade-sheet-section execution-control">
              <div class="execution-toggle" role="radiogroup" aria-label="Execution mode">
                <button class="execution-option is-active" type="button" role="radio" aria-checked="true" data-execution-mode="market">Market <span>now</span></button>
                <button class="execution-option" type="button" role="radio" aria-checked="false" data-execution-mode="limit">Limit</button>
              </div>
              <p class="contract-price-note" data-execution-help>Market fills instantly at the quoted price.</p>
            </section>

            <section class="trade-hero" aria-label="Market price">
              <span class="trade-sheet-label" data-price-label>Market price</span>
              <label class="hero-price-field" aria-label="Price in cents">
                <input type="number" inputmode="numeric" min="3" max="97" step="1" value="50" data-hero-price readonly>
                <small>&cent;</small>
              </label>
              <p data-cost-estimate>10 contracts &asymp; $5.00 &middot; fees at review</p>
            </section>

            <section class="trade-sheet-section quantity-control">
              <label class="trade-sheet-label" for="trade-quantity">Contracts</label>
              <input id="trade-quantity" type="number" inputmode="numeric" min="1" step="1" value="10" data-trade-quantity>
              <div class="quick-amounts" aria-label="Quick quantities">
                <button class="quick-amount" type="button" data-quantity="10">10</button>
                <button class="quick-amount" type="button" data-quantity="25">25</button>
                <button class="quick-amount" type="button" data-quantity="50">50</button>
                <button class="quick-amount" type="button" data-quantity="100">100</button>
              </div>
            </section>

          </div>

          <div class="trade-step" data-trade-step="2" hidden>
            <section class="trade-sheet-section">
              <span class="trade-sheet-label">Order summary</span>
              <div class="order-summary">
                <div class="summary-row"><span>Outcome</span><strong data-review-action>Team takes the lead</strong></div>
                <div class="summary-row"><span>Execution</span><strong data-review-execution>Market</strong></div>
                <div class="summary-row"><span>Effective price</span><strong data-summary-price>50&cent;</strong></div>
                <div class="summary-row"><span>Quantity</span><strong data-summary-quantity>10</strong></div>
                <div class="summary-row"><span>Subtotal</span><strong data-summary-subtotal>$5.00</strong></div>
                <div class="summary-row"><span>Trading fee</span><strong data-summary-fee>$0.10</strong></div>
                <div class="summary-row total"><span>Total to pay</span><strong data-summary-total>$5.10</strong></div>
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
        </div>

        <footer class="trade-sheet-footer">
          <div class="trade-sheet-actions">
            <button class="button button-ghost" type="button" data-trade-back hidden>Back</button>
            <button class="button button-primary trade-submit" type="button" data-trade-submit>Review order</button>
          </div>
        </footer>
      </aside>
    `
  );

  sheet = document.querySelector("[data-trade-sheet]");

  document.querySelectorAll("[data-trade-close]").forEach((item) => {
    item.addEventListener("click", closeTradeSheet);
  });

  sheet.querySelectorAll("[data-execution-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      tradeSheetState.mode = button.dataset.executionMode;
      updateTradeSheet();
      if (tradeSheetState.mode === "limit") {
        const heroPriceInput = sheet.querySelector("[data-hero-price]");
        heroPriceInput.focus();
      }
    });
  });

  sheet.querySelector("[data-trade-quantity]").addEventListener("input", (event) => {
    tradeSheetState.quantity = Math.max(1, Number(event.target.value) || 1);
    updateTradeSheet();
  });

  sheet.querySelector("[data-hero-price]").addEventListener("input", (event) => {
    if (tradeSheetState.mode !== "limit") return;
    if (event.target.value === "") return;
    tradeSheetState.limitPriceCents = Number(event.target.value) || tradeSheetState.limitPriceCents;
    updateTradeSheet();
  });

  sheet.querySelector("[data-hero-price]").addEventListener("blur", (event) => {
    if (tradeSheetState.mode !== "limit") return;
    tradeSheetState.limitPriceCents = clampNumber(Number(event.target.value) || tradeSheetState.marketPriceCents, 3, 97);
    updateTradeSheet();
  });

  sheet.querySelectorAll("[data-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      tradeSheetState.quantity = Number(button.dataset.quantity);
      updateTradeSheet();
    });
  });

  sheet.querySelector("[data-trade-back]").addEventListener("click", () => {
    tradeSheetState.step = 1;
    updateTradeSheet();
  });

  sheet.querySelector("[data-trade-submit]").addEventListener("click", () => {
    if (tradeSheetState.step === 1) {
      tradeSheetState.step = 2;
      updateTradeSheet();
      sheet.querySelector(".trade-sheet-body")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!isLoggedExperience()) {
      window.location.href = "logged-home.html";
      return;
    }

    sheet.querySelector("[data-trade-submit]").classList.add("is-loading");
  });

  return sheet;
}

function updateTradeSheet() {
  const sheet = ensureTradeSheet();
  const marketPriceCents = tradeSheetState.contract === "yes" ? tradeSheetState.yesPriceCents : tradeSheetState.noPriceCents;
  tradeSheetState.limitPriceCents = clampNumber(Number(tradeSheetState.limitPriceCents) || marketPriceCents, 1, 99);
  tradeSheetState.priceCents = tradeSheetState.limitPriceCents;

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
  sheet.querySelector("[data-limit-price]").value = tradeSheetState.limitPriceCents;
  sheet.querySelector("[data-current-price]").textContent = `${marketPriceCents}¢`;
  sheet.querySelector("[data-review-action]").textContent = `${actionLabel} ${contractLabel}`;
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
  const submitLabel =
    tradeSheetState.step === 1
      ? "Review order"
      : isLoggedExperience()
        ? `${actionLabel} ${contractLabel}`
        : `Sign in to ${actionLabel.toLowerCase()} ${contractLabel}`;
  sheet.querySelector("[data-trade-submit]").textContent = submitLabel;
  sheet.querySelectorAll("[data-trade-action]").forEach((button) => {
    const isActive = button.dataset.tradeAction === tradeSheetState.action;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  sheet.querySelectorAll("[data-contract]").forEach((button) => {
    const isActive = button.dataset.contract === tradeSheetState.contract;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });

  sheet.querySelector(".contract-toggle")?.setAttribute("data-selected-contract", tradeSheetState.contract);
  sheet.setAttribute("data-current-step", String(tradeSheetState.step));
  sheet.querySelectorAll("[data-trade-step]").forEach((step) => {
    step.hidden = step.dataset.tradeStep !== String(tradeSheetState.step);
  });
  sheet.querySelector("[data-step-count]").textContent = `${tradeSheetState.step}/2`;
  sheet.querySelector("[data-trade-back]").hidden = tradeSheetState.step === 1;
}

function getOutcomeDetails(button, card) {
  const teams = getTeams(card);
  const sortedTeams = [...teams].sort((a, b) => (b.score || 0) - (a.score || 0));
  const leadingTeam = sortedTeams[0] || teams[0];
  const trailingTeam = sortedTeams[1] || teams[1] || teams[0];
  const rawLabel = button.querySelector("span:not(.material-symbols-outlined)")?.textContent.trim() || "";
  const slideLabel = button.closest(".market-slide")?.querySelector(".market-label")?.textContent.trim().toLowerCase() || "";
  const outcomeKey = rawLabel.split("·")[0].trim().toUpperCase();

  if (button.classList.contains("outcome-tie") || outcomeKey === "TIE" || slideLabel.includes("tie")) {
    return {
      label: `${teams[0]?.shortName || "Game"} and ${teams[1]?.shortName || "opponent"} tie`,
      market: "Tie",
      color: "#ff9425",
      logo: "",
      showSwatch: false,
    };
  }

  if (button.classList.contains("outcome-ktl") || outcomeKey === "KTL" || slideLabel.includes("keep")) {
    return {
      label: `${leadingTeam?.shortName || "Leader"} keep the lead`,
      market: "Keep the Lead",
      color: getTeamColor(leadingTeam),
      logo: leadingTeam?.logo || "",
      showSwatch: true,
    };
  }

  return {
    label: `${trailingTeam?.shortName || "Team"} take the lead`,
    market: "Get the Lead",
    color: getTeamColor(trailingTeam),
    logo: trailingTeam?.logo || "",
    showSwatch: true,
  };
}

function openTradeSheet(button) {
  tradeSheetTrigger = button;
  const card = button.closest(".live-game-card");
  const marketActions = button.closest(".market-actions");
  const isOutcomeButton = button.classList.contains("outcome-button");
  const contract = !isOutcomeButton && button.classList.contains("no") ? "no" : "yes";
  const yesButton = marketActions?.querySelector(".bet-button.yes");
  const noButton = marketActions?.querySelector(".bet-button.no");
  const clickedPriceCents = parsePriceCents(button);

  tradeSheetState.action = "buy";
  tradeSheetState.step = 1;
  tradeSheetState.contract = contract;
  tradeSheetState.yesPriceCents = isOutcomeButton ? clickedPriceCents : yesButton ? parsePriceCents(yesButton) : clickedPriceCents;
  tradeSheetState.noPriceCents = isOutcomeButton ? 100 - clickedPriceCents : noButton ? parsePriceCents(noButton) : clickedPriceCents;
  tradeSheetState.priceCents = contract === "yes" ? tradeSheetState.yesPriceCents : tradeSheetState.noPriceCents;
  tradeSheetState.limitPriceCents = tradeSheetState.priceCents;
  tradeSheetState.quantity = 10;
  tradeSheetState.gameTitle = getGameTitle(card);
  tradeSheetState.marketTitle = getMarketTitle(button);

  const sheet = ensureTradeSheet();
  const backdrop = document.querySelector(".trade-sheet-backdrop");

  sheet.querySelector("[data-trade-submit]")?.classList.remove("is-loading");
  updateTradeSheet();
  document.body.classList.add("sheet-open");
  backdrop.classList.add("is-open");
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  sheet.querySelector("[data-trade-close]")?.focus();
}

function updateTradeSheet() {
  const sheet = ensureTradeSheet();
  const heroPriceInput = sheet.querySelector("[data-hero-price]");
  const isEditingHeroPrice = document.activeElement === heroPriceInput && tradeSheetState.mode === "limit";
  tradeSheetState.quantity = Math.max(1, Number(tradeSheetState.quantity) || 1);
  if (!isEditingHeroPrice) {
    tradeSheetState.limitPriceCents = clampNumber(Number(tradeSheetState.limitPriceCents) || tradeSheetState.marketPriceCents, 3, 97);
  }
  tradeSheetState.priceCents =
    tradeSheetState.mode === "limit" ? clampNumber(Number(tradeSheetState.limitPriceCents) || tradeSheetState.marketPriceCents, 3, 97) : tradeSheetState.marketPriceCents;

  const price = tradeSheetState.priceCents / 100;
  const quantity = tradeSheetState.quantity;
  const subtotal = price * quantity;
  const fee = Math.max(0.01, subtotal * 0.02);
  const total = subtotal + fee;
  const potentialPayout = quantity;
  const potentialProfit = Math.max(0, potentialPayout - subtotal);
  const netGain = Math.max(0, potentialProfit - fee);

  sheet.querySelector("[data-trade-game]").textContent = `${tradeSheetState.gameTitle} \u00b7 ${tradeSheetState.league}`;
  sheet.querySelector("[data-outcome-label]").textContent = tradeSheetState.outcomeLabel;
  const outcomeSwatch = sheet.querySelector("[data-outcome-swatch]");
  outcomeSwatch.style.setProperty("--outcome-color", tradeSheetState.outcomeColor);
  outcomeSwatch.style.setProperty("--outcome-logo", tradeSheetState.outcomeLogo ? `url("${tradeSheetState.outcomeLogo}")` : "none");
  outcomeSwatch.classList.toggle("has-logo", Boolean(tradeSheetState.outcomeLogo));
  outcomeSwatch.hidden = !tradeSheetState.showOutcomeSwatch;
  sheet.querySelector("[data-trade-quantity]").value = quantity;
  if (!isEditingHeroPrice) {
    heroPriceInput.value = tradeSheetState.mode === "limit" ? tradeSheetState.limitPriceCents : tradeSheetState.marketPriceCents;
  }
  heroPriceInput.readOnly = tradeSheetState.mode !== "limit";
  heroPriceInput.setAttribute("aria-readonly", String(tradeSheetState.mode !== "limit"));
  sheet.querySelector("[data-cost-estimate]").textContent = `${quantity} contracts \u2248 ${formatCurrency(subtotal)} \u00b7 fees at review`;
  sheet.querySelector("[data-price-label]").textContent = tradeSheetState.mode === "limit" ? "Limit" : "Market price";
  sheet.querySelector("[data-review-action]").textContent = tradeSheetState.outcomeLabel;
  sheet.querySelector("[data-review-execution]").textContent =
    tradeSheetState.mode === "limit" ? `Limit \u00b7 ${tradeSheetState.limitPriceCents}\u00a2` : "Market \u00b7 now";
  sheet.querySelector("[data-summary-price]").textContent = `${tradeSheetState.priceCents}\u00a2`;
  sheet.querySelector("[data-summary-quantity]").textContent = quantity;
  sheet.querySelector("[data-summary-subtotal]").textContent = formatCurrency(subtotal);
  sheet.querySelector("[data-summary-fee]").textContent = formatCurrency(fee);
  sheet.querySelector("[data-summary-total]").textContent = formatCurrency(total);
  sheet.querySelector("[data-potential-payout]").textContent = formatCurrency(potentialPayout);
  sheet.querySelector("[data-potential-profit]").textContent = formatCurrency(potentialProfit);
  sheet.querySelector("[data-potential-fees]").textContent = formatCurrency(fee);
  sheet.querySelector("[data-net-gain]").textContent = formatCurrency(netGain);
  sheet.querySelector("[data-trade-submit]").textContent =
    tradeSheetState.step === 1 ? "Review order \u2192" : isLoggedExperience() ? "Confirm order" : "Sign in to confirm";
  sheet.querySelectorAll("[data-execution-mode]").forEach((button) => {
    const isActive = button.dataset.executionMode === tradeSheetState.mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });

  sheet.querySelector("[data-execution-help]").textContent =
    tradeSheetState.mode === "limit"
      ? "Limit sets your price until it fills."
      : "Market fills instantly at the quoted price.";
  sheet.setAttribute("data-current-step", String(tradeSheetState.step));
  sheet.querySelectorAll("[data-trade-step]").forEach((step) => {
    step.hidden = step.dataset.tradeStep !== String(tradeSheetState.step);
  });
  sheet.querySelector("[data-current-step-count]").textContent = tradeSheetState.step;
  sheet.querySelector("[data-trade-back]").hidden = tradeSheetState.step === 1;
}

function openTradeSheet(button) {
  tradeSheetTrigger = button;
  const card = button.closest(".live-game-card");
  const clickedPriceCents = parsePriceCents(button);
  const outcome = getOutcomeDetails(button, card);

  tradeSheetState.step = 1;
  tradeSheetState.mode = "market";
  tradeSheetState.marketPriceCents = clickedPriceCents;
  tradeSheetState.priceCents = clickedPriceCents;
  tradeSheetState.limitPriceCents = clickedPriceCents;
  tradeSheetState.quantity = 10;
  tradeSheetState.gameTitle = getGameTitle(card);
  tradeSheetState.league = getLeague(card);
  tradeSheetState.marketTitle = outcome.market;
  tradeSheetState.outcomeLabel = outcome.label;
  tradeSheetState.outcomeColor = outcome.color;
  tradeSheetState.outcomeLogo = outcome.logo;
  tradeSheetState.showOutcomeSwatch = outcome.showSwatch;

  const sheet = ensureTradeSheet();
  const backdrop = document.querySelector(".trade-sheet-backdrop");

  sheet.querySelector("[data-trade-submit]")?.classList.remove("is-loading");
  updateTradeSheet();
  document.body.classList.add("sheet-open");
  backdrop.classList.add("is-open");
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  sheet.querySelector("[data-trade-close]")?.focus();
}

function closeTradeSheet() {
  const sheet = document.querySelector("[data-trade-sheet]");
  const backdrop = document.querySelector(".trade-sheet-backdrop");

  document.body.classList.remove("sheet-open");
  backdrop?.classList.remove("is-open");
  sheet?.classList.remove("is-open");
  sheet?.setAttribute("aria-hidden", "true");
  tradeSheetTrigger?.focus();
  tradeSheetTrigger = null;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".live-game-card .bet-button, .live-game-card .outcome-button");

  if (!button || button.disabled || button.classList.contains("is-disabled")) return;
  if (button.closest(".is-interrupted, .is-suspended")) return;

  openTradeSheet(button);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTradeSheet();
  }

  if (event.key === "Tab") {
    const sheet = document.querySelector("[data-trade-sheet].is-open");
    if (!sheet) return;

    const focusableItems = [...sheet.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')].filter(
      (item) => !item.disabled && item.offsetParent !== null
    );
    const firstItem = focusableItems[0];
    const lastItem = focusableItems[focusableItems.length - 1];

    if (!firstItem || !lastItem) return;

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  }
});
