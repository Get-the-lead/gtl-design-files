(() => {
  const form = document.querySelector(".waitlist-form");
  const emailInput = document.querySelector("#waitlist-email");
  const message = document.querySelector("#form-message");
  const button = form?.querySelector("button[type='submit']");
  const confirmation = document.querySelector("#waitlist-confirmation");
  const confirmationEyebrow = confirmation?.querySelector("[data-confirmation-eyebrow]");
  const confirmationTitle = confirmation?.querySelector("[data-confirmation-title]");
  const confirmationCopy = confirmation?.querySelector("[data-confirmation-copy]");
  const confirmationClose = confirmation?.querySelector("[data-confirmation-close]");
  const confirmationBackdrop = confirmation?.querySelector(".confirmation-backdrop");
  const defaultMessage = "";
  let confirmationReady = false;

  function setMessage(text, state = "") {
    message.textContent = text;
    message.className = `form-message${state ? ` is-${state}` : ""}`;
  }

  function openConfirmation() {
    confirmationReady = false;
    confirmation.hidden = false;
    confirmation.classList.remove("is-confirmed");
    confirmationEyebrow.textContent = "Joining the Waitlist";
    confirmationTitle.textContent = "Securing your place.";
    confirmationCopy.textContent = "Hold tight—we’re reserving your early-access spot.";
    confirmationClose.hidden = true;
    document.body.classList.add("confirmation-open");
    window.requestAnimationFrame(() => confirmation.classList.add("is-visible"));
  }

  function showConfirmation() {
    confirmationReady = true;
    confirmation.classList.add("is-confirmed");
    confirmationEyebrow.textContent = "Early Access Confirmed";
    confirmationTitle.textContent = "You’re in before kickoff.";
    confirmationCopy.textContent = "We’ll email you before live trading opens, with early market previews and a quick-start guide so you’re ready to make your first move.";
    confirmationClose.hidden = false;
    window.setTimeout(() => confirmationClose.focus(), 450);
  }

  function closeConfirmation(continueExploring = false) {
    if (!confirmationReady) return;
    confirmation.classList.remove("is-visible");
    document.body.classList.remove("confirmation-open");
    window.setTimeout(() => {
      confirmation.hidden = true;
      if (continueExploring) document.querySelector(".promise-section")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();

    if (!emailInput.checkValidity()) {
      setMessage("Enter a valid email address to join the waitlist.", "error");
      emailInput.focus();
      return;
    }

    button.disabled = true;
    button.querySelector("span").textContent = "Joining…";
    setMessage(defaultMessage);
    openConfirmation();

    try {
      const endpoint = window.GTL_WAITLIST_ENDPOINT;
      const saveRequest = endpoint
        ? fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, source: "public-waitlist" })
          }).then((response) => {
            if (!response.ok) throw new Error("Waitlist request failed");
          })
        : new Promise((resolve) => window.setTimeout(resolve, 650)).then(() => {
            localStorage.setItem("gtl-waitlist-email", email);
          });

      await Promise.all([
        saveRequest,
        new Promise((resolve) => window.setTimeout(resolve, 1450))
      ]);

      form.classList.add("is-complete");
      emailInput.value = "";
      emailInput.placeholder = email;
      emailInput.disabled = true;
      button.querySelector("span").textContent = "You’re on the List";
      showConfirmation();
    } catch {
      confirmationReady = true;
      closeConfirmation();
      button.disabled = false;
      button.querySelector("span").textContent = "Get Early Access";
      setMessage("We couldn’t save your spot. Please try again.", "error");
      window.setTimeout(() => emailInput.focus(), 320);
    }
  });

  emailInput?.addEventListener("input", () => {
    if (message.classList.contains("is-error")) setMessage(defaultMessage);
  });

  confirmationClose?.addEventListener("click", () => closeConfirmation(true));
  confirmationBackdrop?.addEventListener("click", () => closeConfirmation());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && confirmationReady && !confirmation.hidden) closeConfirmation();
  });

  const yesPrice = document.querySelector("[data-yes-price]");
  const noPrice = document.querySelector("[data-no-price]");
  let yes = 38;
  const moves = [1, -2, 1, 2, -1, 1, -1, 2];
  let moveIndex = 0;

  if (yesPrice && noPrice && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.setInterval(() => {
      yes = Math.max(32, Math.min(44, yes + moves[moveIndex % moves.length]));
      moveIndex += 1;
      yesPrice.textContent = `${yes}¢`;
      noPrice.textContent = `${100 - yes}¢`;
      yesPrice.classList.add("tick");
      noPrice.classList.add("tick");
      window.setTimeout(() => {
        yesPrice.classList.remove("tick");
        noPrice.classList.remove("tick");
      }, 260);
    }, 2400);
  }

  const gameCard = document.querySelector(".fan-card--center");
  const gameCardToggle = gameCard?.querySelector("[data-launch-expand]");

  gameCardToggle?.addEventListener("click", () => {
    const isOpen = gameCard.classList.toggle("is-open");
    gameCardToggle.setAttribute("aria-expanded", String(isOpen));
    gameCardToggle.querySelector(".toggle-label").textContent = isOpen ? "Hide Bets" : "See Bets";
  });
})();
