(() => {
  const form = document.querySelector(".waitlist-form");
  const emailInput = document.querySelector("#waitlist-email");
  const message = document.querySelector("#form-message");
  const button = form?.querySelector("button[type='submit']");
  const confirmation = document.querySelector("#waitlist-confirmation");
  const confirmationEyebrow = confirmation?.querySelector("[data-confirmation-eyebrow]");
  const confirmationTitle = confirmation?.querySelector("[data-confirmation-title]");
  const confirmationCopy = confirmation?.querySelector("[data-confirmation-copy]");
  const confirmationActions = confirmation?.querySelector("[data-confirmation-actions]");
  const confirmationShareButton = confirmation?.querySelector("[data-confirmation-share]");
  const confirmationSharePanel = confirmation?.querySelector("[data-confirmation-share-panel]");
  const confirmationShareLink = confirmation?.querySelector("[data-confirmation-share-link]");
  const confirmationCopyButton = confirmation?.querySelector("[data-confirmation-copy-link]");
  const confirmationCopyStatus = confirmation?.querySelector("[data-confirmation-copy-status]");
  const confirmationCloseButtons = confirmation?.querySelectorAll("[data-confirmation-close]") || [];
  const confirmationScreenClose = confirmation?.querySelector(".confirmation-screen-close");
  const confirmationBackdrop = confirmation?.querySelector(".confirmation-backdrop");
  const defaultMessage = "";
  const defaultShareUrl = "https://gtl-design-app.onrender.com";
  const waitlistStorageKey = "gtl-waitlist-email";
  let confirmationReady = false;

  const header = document.querySelector(".waitlist-header");
  let lastScrollY = window.scrollY;
  let scrollStopTimer;
  let scrollFrame;

  function showHeader() {
    header?.classList.remove("is-hidden");
  }

  function updateHeader() {
    scrollFrame = undefined;
    const currentScrollY = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollY - lastScrollY;

    if (currentScrollY <= 8 || scrollDelta < -2) {
      showHeader();
    } else if (scrollDelta > 2) {
      header?.classList.add("is-hidden");
    }

    lastScrollY = currentScrollY;
  }

  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateHeader);
    window.clearTimeout(scrollStopTimer);
    scrollStopTimer = window.setTimeout(showHeader, 180);
  }, { passive: true });
  header?.addEventListener("focusin", showHeader);

  function setMessage(text, state = "") {
    message.textContent = text;
    message.className = `form-message${state ? ` is-${state}` : ""}`;
  }

  function showCompletedForm(email, copy = "We’ll send launch updates to this email.") {
    if (!form || !emailInput || !button) return;
    form.classList.add("is-complete");
    emailInput.value = "";
    emailInput.placeholder = email;
    emailInput.disabled = true;
    button.disabled = false;
    button.querySelector("span").textContent = "Share with Friends";
    setMessage(copy, "success");
  }

  function openCompletedShare() {
    openConfirmation();
    showConfirmation({ focusAction: false });
    showShareConfirmation();
  }

  function openConfirmation() {
    confirmationReady = false;
    confirmation.hidden = false;
    confirmation.classList.remove("is-confirmed", "is-sharing");
    confirmationEyebrow.textContent = "Joining the Waitlist";
    confirmationTitle.textContent = "Securing your place.";
    confirmationCopy.textContent = "Hold tight—we’re reserving your early-access spot.";
    confirmationActions.hidden = true;
    confirmationSharePanel.hidden = true;
    confirmationScreenClose.hidden = true;
    confirmationCopyStatus.textContent = "";
    confirmationCopyButton.querySelector("span").textContent = "Copy";
    document.body.classList.add("confirmation-open");
    window.requestAnimationFrame(() => confirmation.classList.add("is-visible"));
  }

  function showConfirmation({ focusAction = true } = {}) {
    confirmationReady = true;
    confirmation.classList.add("is-confirmed");
    confirmationEyebrow.textContent = "Early Access Confirmed";
    confirmationTitle.textContent = "You’re in before kickoff.";
    confirmationCopy.textContent = "We’ll email you before live trading opens, with early market previews and a quick-start guide so you’re ready to make your first move.";
    confirmationActions.hidden = false;
    confirmationScreenClose.hidden = false;
    if (focusAction) window.setTimeout(() => confirmationShareButton.focus(), 450);
  }

  function showShareConfirmation() {
    const shareUrl = window.GTL_WAITLIST_SHARE_URL || defaultShareUrl;

    confirmation.classList.add("is-sharing");
    confirmationEyebrow.textContent = "Share Early Access";
    confirmationTitle.textContent = "Bring your friends along.";
    confirmationCopy.textContent = "Copy the waitlist link and send it to anyone you want beside you when live trading begins.";
    confirmationShareLink.value = shareUrl;
    confirmationActions.hidden = true;
    confirmationSharePanel.hidden = false;
    window.setTimeout(() => confirmationCopyButton.focus(), 50);
  }

  async function copyShareLink() {
    let copied = false;

    try {
      await navigator.clipboard.writeText(confirmationShareLink.value);
      copied = true;
    } catch {
      confirmationShareLink.focus();
      confirmationShareLink.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
    }

    confirmationCopyStatus.textContent = copied ? "Link copied to clipboard." : "Select the link and copy it manually.";
    if (copied) confirmationCopyButton.querySelector("span").textContent = "Copied";
  }

  function closeConfirmation() {
    if (!confirmationReady) return;
    confirmation.classList.remove("is-visible");
    document.body.classList.remove("confirmation-open");
    window.setTimeout(() => {
      confirmation.hidden = true;
    }, 300);
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.classList.contains("is-complete")) {
      openCompletedShare();
      return;
    }
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
            if (response.status === 409) {
              const duplicateError = new Error("Email already registered");
              duplicateError.code = "duplicate-email";
              throw duplicateError;
            }
            if (!response.ok) throw new Error("Waitlist request failed");
          })
        : new Promise((resolve) => window.setTimeout(resolve, 650));

      await Promise.all([
        saveRequest,
        new Promise((resolve) => window.setTimeout(resolve, 1450))
      ]);

      try { localStorage.setItem(waitlistStorageKey, email); } catch (error) { /* Storage may be unavailable. */ }
      showCompletedForm(email, "We’ll send launch updates to this email.");
      showConfirmation();
    } catch (error) {
      confirmationReady = true;
      closeConfirmation();
      button.disabled = false;
      button.querySelector("span").textContent = "Get Early Access";
      setMessage(error?.code === "duplicate-email" ? "This email is already on the waitlist." : "We couldn’t save your spot. Please try again.", "error");
      window.setTimeout(() => emailInput.focus(), 320);
    }
  });

  emailInput?.addEventListener("input", () => {
    if (message.classList.contains("is-error")) setMessage(defaultMessage);
  });

  try {
    const joinedEmail = localStorage.getItem(waitlistStorageKey);
    if (joinedEmail) showCompletedForm(joinedEmail, "We’ll send launch updates to this email.");
  } catch (error) { /* Storage may be unavailable. */ }

  confirmationShareButton?.addEventListener("click", showShareConfirmation);
  confirmationCopyButton?.addEventListener("click", copyShareLink);
  confirmationCloseButtons.forEach((closeButton) => closeButton.addEventListener("click", closeConfirmation));
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
