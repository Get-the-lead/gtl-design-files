const body = document.body;
const sidebar = document.querySelector(".sidebar");
const navLinks = document.querySelectorAll(".side-nav a");
const openNavButton = document.querySelector("[data-open-nav]");
const closeNavTarget = document.querySelector("[data-close-nav]");
const modal = document.querySelector("[data-modal]");
const openModalButton = document.querySelector("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const toggles = document.querySelectorAll("[data-toggle]");
const expandButtons = document.querySelectorAll("[data-expand]");
const drawerSection = document.querySelector("#drawers");
const drawerViewButtons = document.querySelectorAll("[data-drawer-view]");
const pageTabs = document.querySelectorAll("[data-page-tab]");
const pageFrames = document.querySelectorAll("[data-page-frame]");
const pageFrameCards = document.querySelectorAll("[data-page-frame-card]");
const pageFrameLabels = document.querySelectorAll("[data-page-frame-label]");
const pageTitle = document.querySelector("[data-page-title]");
const pageFrameOpenLinks = document.querySelectorAll("[data-page-frame-open]");
const pagePreview = document.querySelector("[data-page-preview]");
const pageZoomButtons = document.querySelectorAll("[data-page-zoom]");
const pageZoomValue = document.querySelector("[data-page-zoom='reset']");
const flatDeviceTabs = document.querySelectorAll(".side-nav a[data-flat-device]");
const flatDocTabs = document.querySelector("[data-flat-doc-tabs]");
const flatLayContent = document.querySelector("[data-flat-lay-content]");
const individualPageSections = document.querySelectorAll("[data-individual-page]");
let pageZoom = 1;

function toHex(value) {
  const hex = Math.max(0, Math.min(255, Number(value))).toString(16).padStart(2, "0");
  return hex.toUpperCase();
}

function parseRgb(value) {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return null;
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts[3] == null ? 1 : Number(parts[3]);
  if ([r, g, b, a].some((part) => Number.isNaN(part))) return null;
  return { r, g, b, a };
}

function describeColorSwatches() {
  document.querySelectorAll(".swatch").forEach((swatch) => {
    if (swatch.querySelector(".color-meta")) return;
    const sample = swatch.querySelector("span");
    const token = swatch.querySelector("code")?.textContent?.trim();
    if (!sample || !token) return;

    const styles = getComputedStyle(sample);
    const color = parseRgb(styles.backgroundColor);
    const meta = document.createElement("div");
    meta.className = "color-meta";

    if (color) {
      const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
      const rgb = `${color.r}, ${color.g}, ${color.b}`;
      const alpha = Math.round(color.a * 100) / 100;
      meta.innerHTML = alpha < 1
        ? `<span><strong>HEX</strong> ${hex}</span><span><strong>RGBA</strong> rgba(${rgb}, ${alpha})</span><span><strong>Opacity</strong> ${Math.round(alpha * 100)}%</span>`
        : `<span><strong>HEX</strong> ${hex}</span><span><strong>RGB</strong> ${rgb}</span>`;
    } else if (styles.backgroundImage && styles.backgroundImage !== "none") {
      meta.innerHTML = `<span><strong>Value</strong> ${styles.backgroundImage}</span>`;
    } else {
      meta.innerHTML = `<span><strong>Value</strong> unresolved</span>`;
    }

    swatch.append(meta);
  });
}

const flatDocs = {
  auth: {
    title: "Authentication Screens",
    description: "Full states for sign-in, account creation, recovery, verification, and auth feedback.",
    groups: [
      { title: "Default states", frames: [
        { label: "Sign in", type: "auth", mode: "signin" },
        { label: "Create account", type: "auth", mode: "register" },
        { label: "Name and birthday", type: "auth", mode: "registerDetails" },
        { label: "Add phone number", type: "auth", mode: "phone" },
        { label: "Phone verification", type: "auth", mode: "verify" },
        { label: "Create password", type: "auth", mode: "registerPassword" },
        { label: "Phone-first registration", type: "auth", mode: "phoneSignup" },
        { label: "Phone-first details", type: "auth", mode: "phoneSignupDetails" },
        { label: "Passwordless phone login", type: "auth", mode: "phoneLogin" },
        { label: "Phone login verification", type: "auth", mode: "phoneLoginVerify" },
        { label: "Forgot password", type: "auth", mode: "forgot" },
        { label: "Reset password", type: "auth", mode: "reset" },
      ] },
      { title: "Feedback states", frames: [
        { label: "Loading state", type: "auth", mode: "loading" },
        { label: "Error state", type: "auth", mode: "error" },
      ] },
    ],
  },
  home: {
    title: "Home Page",
    description: "Homepage variants for guest, signed-in, market availability, position context, and failure states.",
    groups: [
      { title: "Unauthenticated", frames: [
        { label: "Logged out default", type: "home", mode: "guest" },
        { label: "Geo-restricted location", type: "location", mode: "default" },
        { label: "No live games", type: "home", mode: "noLive" },
        { label: "NBA selected", type: "home", mode: "nba" },
        { label: "Loading state", type: "home", mode: "loading" },
        { label: "Error / empty state", type: "home", mode: "error" },
      ] },
      { title: "Authenticated", frames: [
        { label: "No open positions", type: "home", mode: "logged" },
        { label: "With open positions", type: "home", mode: "positions" },
      ] },
    ],
  },
  welcome: {
    title: "Welcome Page",
    description: "The implemented post-signup reward screen combines the celebration, welcome credits, username claim, and Start Betting action.",
    groups: [
      { title: "Implemented welcome state", frames: [
        { label: "Welcome credits and username", type: "welcome", mode: "reward" },
      ] },
      { title: "Implemented validation states", frames: [
        { label: "Username required", type: "welcome", mode: "required" },
        { label: "Username format error", type: "welcome", mode: "invalid" },
      ] },
    ],
  },
  game: {
    title: "Game Page",
    description: "Game detail page variants covering live market access, unavailable markets, position context, refresh, and errors.",
    groups: [
      { title: "Default states", frames: [
        { label: "Live game default — no logos", type: "game", mode: "live" },
        { label: "Starting soon countdown", type: "game", mode: "countdown" },
        { label: "Final - away team won", type: "game", mode: "final" },
        { label: "Pregame unavailable", type: "game", mode: "pregame" },
        { label: "Betting paused after score change", type: "game", mode: "paused" },
        { label: "Open game positions", type: "game", mode: "openPositions" },
        { label: "NFL game stats selected", type: "game", mode: "gameStatsNFL" },
      ] },
      { title: "Logo reference — future use", frames: [
        { label: "Live NFL game with licensed team logos", type: "game", mode: "liveLogos" },
        { label: "NFL game stats with licensed team logos", type: "game", mode: "gameStatsLogos" },
      ] },
    ],
  },
  drawer: {
    title: "Buy / Sell Drawer",
    description: "Bottom-sheet states for market orders, limit orders, validation, confirmation, and outcomes.",
    groups: [
      { title: "Order entry", frames: [
        { label: "Buy market order", type: "drawer", mode: "buyMarket" },
        { label: "Change bet type", type: "drawer", mode: "changeBetType" },
        { label: "Trading paused", type: "drawer", mode: "paused" },
        { label: "Buy limit order", type: "drawer", mode: "buyLimit" },
        { label: "Sell market order", type: "drawer", mode: "sellMarket" },
      ] },
      { title: "Feedback states", frames: [
        { label: "Insufficient balance", type: "drawer", mode: "balance" },
        { label: "Invalid limit price", type: "drawer", mode: "invalid" },
        { label: "Buy confirmation", type: "drawer", mode: "confirmBuy" },
        { label: "Sell confirmation", type: "drawer", mode: "confirmSell" },
        { label: "Error state", type: "drawer", mode: "error" },
      ] },
    ],
  },
  tracker: {
    title: "Portfolio",
    description: "Wallet portfolio states from wallet.html for live positions, pending limit orders, settled bets, cancelled orders, and order detail.",
    groups: [
      { title: "Wallet states", frames: [
        { label: "Orders overview", type: "tracker", mode: "open" },
        { label: "Settled tab", type: "tracker", mode: "settled" },
        { label: "Empty orders", type: "tracker", mode: "empty" },
      ] },
      { title: "System states", frames: [
        { label: "Loading state", type: "tracker", mode: "loading" },
        { label: "Error state", type: "tracker", mode: "error" },
      ] },
      { title: "Order detail states", frames: [
        { label: "Current detail", type: "tracker", mode: "detailCurrent" },
        { label: "Pending detail", type: "tracker", mode: "detailPending" },
        { label: "Settled detail", type: "tracker", mode: "detailSettled" },
      ] },
    ],
  },
  account: {
    title: "Profile & Settings Page",
    description: "Profile and settings states, connected-account variants, and the account-management subpages.",
    groups: [
      { title: "Profile & Settings", frames: [
        { label: "Email and password account", type: "account", mode: "profilePassword" },
        { label: "Edit username", type: "account", mode: "editUsername" },
        { label: "Google account", type: "account", mode: "profileGoogle" },
        { label: "Apple account", type: "account", mode: "profileApple" },
        { label: "Signed out", type: "account", mode: "signedOut" },
      ] },
      { title: "Account management", frames: [
        { label: "Betting Controls", type: "account", mode: "bettingControls" },
        { label: "Delete Account", type: "account", mode: "deleteAccount" },
      ] },
    ],
  },
};

const gameVariantDocumentation = {
  live: {
    summary: "The standard in-play Game page while the market is open and live prices are available.",
    trigger: "Use when the feed supplies an active period, a non-empty game clock, and tradable GTL/TIE/KTL markets.",
    changes: "Market Stats is selected initially. Prices are enabled. The production no-logo treatment uses abbreviation marks with full team names beneath them.",
    data: "League, period, clock, both teams’ names/abbreviations/scores/colours, and complementary Yes/No prices for all three markets are required.",
    behavior: "Update the clock and scores from the live feed. Selecting a price opens the Buy drawer with game, market, side, and current prices preserved.",
  },
  countdown: {
    summary: "The pre-start countdown before game data and trading become live.",
    trigger: "Use only after the game is scheduled but before play begins, when a reliable remaining-start duration is available.",
    changes: "Show a blue dot and blue countdown copy, a 0–0 score, disabled dash prices, an empty market book, and Market Stats selected.",
    data: "Scheduled game, both teams, league, team colours, and a countdown value are required; live period, score, and order-book values are intentionally absent.",
    behavior: "Count down without enabling prices. At zero, replace this state with the live state from a fresh feed response rather than mutating placeholder values.",
  },
  final: {
    summary: "The terminal Game state after the official result is confirmed.",
    trigger: "Use when the normalized feed status is Final or FT and the final score has been accepted.",
    changes: "Replace period and clock with the gold Final status, retain the completed score, disable settled prices, and keep Market Stats as the initial mobile/tablet panel.",
    data: "Final status, official score, team identity/colours, and settled market outcomes are required. Do not derive Final from a zero clock alone.",
    behavior: "No new bet may be initiated. Existing market and game statistics remain readable and desktop continues to expose both statistics sections.",
  },
  pregame: {
    summary: "An active game whose markets cannot open until a team first takes the lead.",
    trigger: "Use when play has begun but the score is tied and the market payload explicitly reports waiting-for-first-lead.",
    changes: "Keep the live period and clock, show the waiting explanation, replace every price with a disabled dash, and render empty Market Stats.",
    data: "Active clock/period, tied score, team identity, and the non-clearing waiting reason are required.",
    behavior: "Do not auto-enable from a local score calculation. Re-render from the next feed event that supplies an open market after a lead is established.",
  },
  paused: {
    summary: "A temporary trading lock while prices are recalculated after a scoring or feed event.",
    trigger: "Use when the market service reports a clearing recalculation state for an otherwise active game.",
    changes: "Show the recalculation banner, retain the current score and last prices for context, and disable all market-price controls until replacement prices arrive.",
    data: "The last stable game/market snapshot plus a clearing pause reason are required. The implementation demo clears after roughly 1.6 seconds.",
    behavior: "Keep statistics available, prevent drawer entry and submissions, then atomically replace all complementary prices before re-enabling interaction.",
  },
  openPositions: {
    summary: "The signed-in Game page when the customer holds one or more positions in this game.",
    trigger: "Use when the authenticated portfolio contains positions whose gameId matches the active Game page.",
    changes: "Add the game-position control to the mobile/tablet bottom bar and expose the position panel above it when opened. Desktop renders the same panel inline below the markets in the sticky left column.",
    data: "For each matching position provide market, side, quantity, average entry price, current price, current value, and unrealized return; retain the active game/team context.",
    behavior: "Buy More opens a prefilled Buy drawer and Sell opens a prefilled Sell drawer. Closing, backdrop click, or Escape dismisses the mobile/tablet panel; desktop remains persistently visible.",
  },
  gameStatsNFL: {
    summary: "The standard live NFL Game page with the Game Stats tab selected.",
    trigger: "Use after the customer selects Game Stats on mobile/tablet; desktop renders this section alongside Market Stats without a toggle.",
    changes: "Only the selected tab/panel changes. Show the score worm, lead-change and tie totals, followed by five NFL comparison rows.",
    data: "Score history, team colours, and NFL stats in the required order: total, pass, rush, possession, and turnovers.",
    behavior: "Preserve the current game and market state while switching panels. Update aria-selected and hidden so exactly one panel is exposed on mobile/tablet.",
  },
  liveLogos: {
    summary: "Future-use NFL live-market reference using licensed team artwork.",
    trigger: "Use only when NFL logo licensing and asset delivery are approved; this is not the current production no-logo default.",
    changes: "Replace abbreviation marks with NFL logos and display team initials beneath each logo. All other live-market layout and behavior remains unchanged.",
    data: "The normal live NFL payload plus validated transparent logo assets and textual abbreviation fallbacks are required.",
    behavior: "If an image fails, fall back to the abbreviation mark without changing layout. Never substitute an NBA example in this reference group.",
  },
  gameStatsLogos: {
    summary: "Future-use NFL Game Stats reference using licensed team artwork.",
    trigger: "Use only when licensed NFL assets are approved and the Game Stats view is selected.",
    changes: "Use NFL logos with initials beneath them in the scorecard; keep compact abbreviation marks inside the comparison card and select Game Stats.",
    data: "Licensed NFL logos, abbreviation fallbacks, score history, and the five required NFL comparison statistics are required.",
    behavior: "Logo failure must degrade to initials. Tab semantics, responsive panel behavior, score worm, and market state remain identical to the no-logo implementation.",
  },
};

const rankingVariantDocumentation = {
  signedOut: {
    summary: "The public leaderboard before a customer has authenticated.",
    trigger: "Use whenever Ranking is opened without a valid authenticated session.",
    changes: "The top ten remain visible, the customer-position row is omitted, and month options replace private ranks with ‘Sign in to view’.",
    data: "Competition month, reset deadline, public top-ten usernames, balances, and prizes are required; no customer result is requested.",
    behavior: "Keep the leaderboard readable. Authentication is required before exposing a customer’s current or historical rank.",
  },
  signedOutMonths: {
    summary: "The public month selector expanded before authentication.",
    trigger: "Use while a signed-out visitor opens the competition-month selector.",
    changes: "Show the same available months as the authenticated selector, but replace every private rank with ‘Sign in to view’.",
    data: "Only the public available-month range is required; do not fetch or embed customer ranking history.",
    behavior: "Selecting a month may update the public top ten, but private rank labels remain gated. Click-away and Escape close the list.",
  },
  current: {
    summary: "The authenticated leaderboard for the current competition month.",
    trigger: "Use after authentication when the current month is selected and the customer sits outside the top ten.",
    changes: "Show the signed-in header and add the customer’s green highlighted row below the top-ten list.",
    data: "Public top ten plus the customer’s current rank, username, credit balance, prize, and the competition reset deadline are required.",
    behavior: "Keep the customer row separate when outside the top ten. If the customer reaches positions 1–10, render them in that ranked row and hide the separate slot.",
  },
  months: {
    summary: "The expanded competition-month selector for an authenticated customer.",
    trigger: "Use while the month trigger is open, before a new month has been chosen.",
    changes: "Rotate the trigger chevron, apply the open treatment, and show available months newest-first with the customer’s rank for each month.",
    data: "Every available month needs its calendar month, year context, customer rank, balance, and prize result.",
    behavior: "The selected option uses aria-selected. Selection updates the label and leaderboard, then closes the list; click-away and Escape also close it.",
  },
  historical: {
    summary: "A completed historical month after the customer selects it from the month menu.",
    trigger: "Use after an authenticated customer selects any available month before the current competition.",
    changes: "Update the month label and all leaderboard rows. Here the customer is sixth, so ‘You’ appears directly inside the top ten and no detached current row is shown.",
    data: "Use one internally consistent archived result set: month, ordered competitors, balances, fixed prizes, and the customer’s archived rank.",
    behavior: "Animate reordered rows only when motion is allowed. Do not combine current-month rows with historical customer data.",
  },
  resultOutside: {
    summary: "The completed-competition result for a customer outside the prize-paying top ten.",
    trigger: "Show once after reset for an authenticated customer whose completed rank is greater than ten.",
    changes: "Dim the page, center the result dialog, omit prize and celebration artwork, and place the standalone Close button at the bottom safe area.",
    data: "Completed month, final rank, and the next competition month are required.",
    behavior: "Close is a sibling of the dialog, not part of its body. Backdrop click, Close, or Escape dismisses the result without changing leaderboard data.",
  },
  resultWinner: {
    summary: "The completed-competition result for a prize winner in positions 4–10.",
    trigger: "Show once after reset when the authenticated customer finished inside the top ten but outside the podium.",
    changes: "Add the prize value and celebration layer while retaining the standard result-dialog proportions and standalone bottom Close button.",
    data: "Completed month, final rank, exact prize label, and customer identity are required.",
    behavior: "Announce the result as a modal, expose the prize as text, and direct fulfillment to the GTL follow-up process. Respect reduced-motion preferences.",
  },
  resultTopThree: {
    summary: "The enhanced completed-competition result for a podium finish.",
    trigger: "Show once after reset when the authenticated customer finished first, second, or third.",
    changes: "Add the ranked medal, top-three dialog offset, prize value, and celebration layer; Close remains independent at the bottom safe area.",
    data: "Completed month, podium rank, exact prize label, and customer identity are required.",
    behavior: "Keep rank visible in both the title and medal. The celebration is decorative and must be hidden from assistive technology and reduced-motion users.",
  },
};

const authVariantDocumentation = {
  signin: {
    summary: "Login variation 1: the current email-and-password route implemented in login.html.",
    trigger: "Retain only if product selects password credentials as the production login method.",
    changes: "Google and Apple remain available above email and password fields, with a Forgot Password route below the password input.",
    data: "Email, password, social-provider availability, authentication errors, and the post-login destination are required.",
    behavior: "Validate both credentials before submission, expose password visibility without changing its value, and keep recovery reachable. Remove login-v2.html if this variation is selected.",
  },
  phoneLogin: {
    summary: "Login variation 2: the passwordless phone route implemented in login-v2.html and awaiting a product decision.",
    trigger: "Implement only if product explicitly selects phone verification as the single production login route.",
    changes: "Replace email, password, and Forgot Password with one phone-number field and Continue with Phone; Google and Apple remain available.",
    data: "Normalized phone number, SMS delivery capability, resend limits, code expiry, authentication errors, and post-login destination are required.",
    behavior: "Submitting a valid phone number advances to verification without leaving the auth card. Remove the password-login route and its recovery UI if this variation is selected.",
  },
  phoneLoginVerify: {
    summary: "The second step belonging exclusively to passwordless login variation 2.",
    trigger: "Show only after a code has been successfully requested for the supplied phone number.",
    changes: "Replace the phone entry step with eight single-character code inputs, destination context, Back, Verify and Login, and Resend.",
    data: "Masked destination, challenge identifier, eight-digit code rules, expiry, resend cooldown, attempt count, and server error are required.",
    behavior: "Support numeric paste and sequential focus, preserve the phone number when going Back, throttle Resend, and complete login only after server verification.",
  },
  forgot: {
    summary: "Password recovery entry for email-and-password login variation 1 only.",
    trigger: "Show after Forgot Password is selected from the password login screen.",
    changes: "Request the account email, then replace the form with the non-enumerating Check Your Email confirmation after submission.",
    data: "Email, reset-token lifetime, resend policy, and a neutral delivery response are required.",
    behavior: "Do not reveal whether an account exists. Back returns to password login; this entire route is removed if variation 2 is selected.",
  },
  reset: {
    summary: "New-password entry reached from a valid recovery link in login variation 1.",
    trigger: "Show only when the reset token is present, valid, and unexpired.",
    changes: "Collect and confirm the new password with strength guidance and password-visibility controls.",
    data: "Reset token, password policy, confirmation value, expiry state, and success destination are required.",
    behavior: "Reject mismatched or weak passwords, invalidate the token after success, and return to Login. Remove with password recovery if variation 2 is selected.",
  },
  loading: {
    summary: "Submission-in-progress feedback shown here against login variation 1.",
    trigger: "Use after a valid login request starts and before it resolves.",
    changes: "Keep entered values visible, disable repeat submission, and replace the primary action label with Processing….",
    data: "The active authentication request and its cancellation or timeout policy are required.",
    behavior: "Prevent duplicate requests and restore the selected login variation on failure. The final implementation needs equivalent loading feedback for whichever route is chosen.",
  },
  error: {
    summary: "Inline validation feedback shown here against login variation 1.",
    trigger: "Use when local validation or the authentication service rejects the submitted input.",
    changes: "Mark the affected field, place a specific error directly beneath it, and retain all non-sensitive valid input.",
    data: "A field or form error code mapped to safe customer-facing copy is required.",
    behavior: "Move focus to the first invalid field and announce the message. The chosen production variation must map equivalent phone, code, social, rate-limit, and service errors.",
  },
};

const standaloneVariantDocumentation = {
  waitlist: {
    default: { summary: "The public launch landing page before an email is submitted.", trigger: "Use for every new public Waitlist visit.", changes: "Show the complete launch story and enabled email capture without modal feedback.", data: "Launch-season copy, email placeholder, product preview content, prize summary, and destination endpoint configuration.", behavior: "Header and final CTA return focus to the hero email field; animated previews pause for reduced motion." },
    error: { summary: "Local email validation failure before a waitlist request begins.", trigger: "Use when the email field is empty or fails native email validity.", changes: "Apply the field error treatment and show the explicit valid-email message below the form.", data: "The rejected email value and validation result only; no network request is created.", behavior: "Focus the email field and clear the message as the customer edits." },
    joining: { summary: "Indeterminate progress while the waitlist request and minimum feedback interval are running.", trigger: "Use immediately after a valid submission starts.", changes: "Dim the page and show the Securing Your Place progress dialog without a dismiss action.", data: "Submitted email, request state, endpoint result, and minimum progress duration.", behavior: "Disable duplicate submission. Do not permit dismissal until success or failure resolves." },
    confirmed: { summary: "Successful early-access confirmation after the email has been saved.", trigger: "Use only after the waitlist endpoint confirms success.", changes: "Replace progress with the confirmed eyebrow, check treatment, expanded explanation, Share with Friends action, and Close control.", data: "Confirmed request result and retained page position.", behavior: "Share with Friends advances to the sharing modal. Backdrop, Escape, or Close dismisses the resolved flow." },
    sharing: { summary: "Share-link modal reached from the confirmed early-access state.", trigger: "Use after the customer selects Share with Friends from Early Access Confirmed.", changes: "Change the eyebrow and heading, reduce the confirmation visual, and replace the confirmation action with a read-only waitlist URL and Copy button.", data: "A canonical public waitlist URL suitable for sharing and clipboard availability are required.", behavior: "Copy writes the complete URL and reports success inline. If clipboard access fails, select the URL for manual copying; Backdrop, Escape, or Close dismisses the modal." },
  },
  contact: {
    default: { summary: "The empty structured support-request form.", trigger: "Use when Contact opens or after Send Another Message.", changes: "Show the introductory SLA note and blank name, email, topic, and message fields.", data: "Topic options, maximum message length, privacy copy, and delivery configuration.", behavior: "Update the character count while typing and submit only after required fields validate." },
    topicOpen: { summary: "The Contact topic combobox expanded to its five implemented options.", trigger: "Use while the topic input or toggle has opened the listbox.", changes: "Show the menu below the field, rotate the control, and retain form context.", data: "Stable option identifiers and customer-facing topic labels.", behavior: "Support arrows, Home/End, Enter, Escape, click-away, aria-expanded, active descendant, and one selected option." },
    error: { summary: "Field-level validation feedback for an incomplete Contact request.", trigger: "Use after submission when any required value is missing or malformed.", changes: "Mark only affected controls and place specific messages directly beneath them.", data: "Validation results for name, email, topic, and message.", behavior: "Preserve valid values, focus the first invalid control, and announce its message." },
    success: { summary: "The submitted Contact confirmation replacing the form inside the same card.", trigger: "Use after the request is stored or accepted by the support service.", changes: "Show Message Sent, destination email, traceable reference, and Send Another Message.", data: "Submitted email and generated support reference.", behavior: "Move focus to the status region; starting another request clears all fields and returns to default." },
  },
  fees: {
    default: { summary: "The standalone pricing and fees explanation.", trigger: "Use when Fees is opened outside an active order.", changes: "Show the four numbered explanations without a floating return control.", data: "Production-approved fee percentage, minimum, price range, payout, and settlement policy.", behavior: "Back uses valid same-origin history or Home fallback." },
    continueBet: { summary: "Fees opened from an in-progress order with valid return context.", trigger: "Use only while a restorable Buy/Sell draft exists.", changes: "Add the floating team-colour Continue Bet pill above the safe area.", data: "Originating game/team context plus the serialized valid order draft.", behavior: "Return to the correct game and reopen the drawer after revalidating freshness." },
  },
  rules: {
    default: { summary: "The complete published Monthly Prize Competition rules document.", trigger: "Use from Ranking, footer Official Rules, and any competition legal disclosure.", changes: "Render all 13 numbered legal sections and the ten-row $5,000 prize schedule.", data: "Approved legal entity, jurisdiction, eligible states, dates, contact details, payment method, URLs, and rules version.", behavior: "Preserve semantic reading order, table structure, stable deep-link behavior if added, and a visible last-updated record." },
  },
  access: {
    default: { summary: "The private-prototype gate before passphrase entry.", trigger: "Use only when the preview session has not been unlocked.", changes: "Show Restricted, the passphrase field, visibility control, and Unlock.", data: "A locally configured preview passphrase and session-storage availability.", behavior: "Focus the field on load and route successful entry to Home." },
    invalid: { summary: "Incorrect private-preview passphrase feedback.", trigger: "Use after the supplied value does not match the local preview configuration.", changes: "Clear and mark the field, then show Incorrect Passphrase directly beneath it.", data: "The failed comparison result only; never log the supplied passphrase.", behavior: "Return focus to the field and clear the error as the reviewer types again." },
  },
};

const teamLogos = {
  buf: "../gtl-app/assets/logos/nfl-buf.png",
  mia: "../gtl-app/assets/logos/nfl-mia.png",
  kc: "../gtl-app/assets/logos/nfl-kc.png",
  sf: "../gtl-app/assets/logos/nfl-sf.png",
  dalNfl: "../gtl-app/assets/logos/nfl-dal.png",
  phi: "../gtl-app/assets/logos/nfl-phi.png",
  den: "../gtl-app/assets/logos/nba-den.png",
  dal: "../gtl-app/assets/logos/nba-dal.png",
  bos: "../gtl-app/assets/logos/nba-bos.png",
  ny: "../gtl-app/assets/logos/nba-ny.png",
};

function logoPair(a = "buf", b = "mia") {
  return `<span class="flat-logo-pair"><img src="${teamLogos[a]}" alt=""><img src="${teamLogos[b]}" alt=""></span>`;
}

function flatHeader(label = "GTL", chip = "Live") {
  return `<div class="flat-mini-header"><span class="flat-brand">${label}</span><span class="flat-chip">${chip}</span></div>`;
}

function flatNav(active = "Home") {
  return `<div class="flat-bottom-nav"><span>${active === "Home" ? "Home" : "Home"}</span><span>${active === "Orders" ? "Orders" : "Markets"}</span><span>${active === "Account" ? "Account" : "Wallet"}</span></div>`;
}

function flatGameTile(paused = false) {
  return `<div class="flat-game-tile" style="--home-color:#00338d;--away-color:#008e97">
    <div class="flat-score-row">
      <span class="flat-team"><img src="${teamLogos.buf}" alt=""><strong>BUF</strong></span>
      <span class="flat-score">24 - 20</span>
      <span class="flat-team"><img src="${teamLogos.mia}" alt=""><strong>MIA</strong></span>
    </div>
    ${paused ? `<div class="flat-status loading" style="min-height:64px"><strong>Trading paused</strong><span>Repricing markets after score change.</span></div>` : flatMarkets()}
  </div>`;
}

function flatMarkets(disabled = false) {
  const yes = disabled ? "--" : "64c";
  const no = disabled ? "--" : "36c";
  return `<div class="flat-market-grid">
    <div class="flat-market-row"><span>GTL</span><b class="flat-price yes">${yes}</b><b class="flat-price no">${no}</b></div>
    <div class="flat-market-row"><span>TIE</span><b class="flat-price yes">${disabled ? "--" : "18c"}</b><b class="flat-price no">${disabled ? "--" : "82c"}</b></div>
    <div class="flat-market-row"><span>KTL</span><b class="flat-price yes">${disabled ? "--" : "71c"}</b><b class="flat-price no">${disabled ? "--" : "29c"}</b></div>
  </div>`;
}

function flatRows(count = 3, variant = "neutral") {
  const rows = [
    { a: "BUF vs MIA", b: "GTL YES - 120 contracts", c: "$76.80", d: "+$19.20", logo: ["buf", "mia"], cls: "flat-up" },
    { a: "KC vs SF", b: "Tie NO - pending", c: "$44.00", d: "22c limit", logo: ["kc", "sf"], cls: "" },
    { a: "BOS vs NYK", b: "KTL YES - settled", c: "$54.10", d: "Won", logo: ["bos", "ny"], cls: "flat-up" },
    { a: "KC vs SF", b: "GTL NO - 80 contracts", c: "$32.00", d: "-$12.40", logo: ["kc", "sf"], cls: "flat-down" },
  ];
  return rows.slice(0, count).map((row, index) => `<div class="flat-row">
    ${logoPair(row.logo[0], row.logo[1])}
    <span class="flat-row-main"><strong>${variant === "pending" ? (index % 2 ? "Pending sell" : "Pending buy") : row.a}</strong><span>${row.b}</span></span>
    <span class="flat-row-side"><strong>${row.c}</strong><span class="${row.cls}">${row.d}</span></span>
  </div>`).join("");
}

function flatStatus(kind, title, copy) {
  return `<div class="flat-status ${kind}"><strong>${title}</strong><span>${copy}</span></div>`;
}

function flatLoading() {
  return `<div class="flat-card"><div class="flat-skeleton"></div><div class="flat-skeleton"></div><div class="flat-skeleton short"></div></div>
    <div class="flat-card"><div class="flat-skeleton"></div><div class="flat-skeleton short"></div></div>`;
}

const googleMark = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5.04 5.04 0 0 1-2.18 3.31v2.75h3.53c2.07-1.9 3.25-4.71 3.25-7.9z"/><path fill="#34A853" d="M12 23c2.94 0 5.4-.97 7.2-2.63l-3.52-2.75c-.98.66-2.23 1.05-3.68 1.05-2.83 0-5.23-1.91-6.08-4.48H2.28v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.92 14.19a6.6 6.6 0 0 1 0-4.38V6.97H2.28a11 11 0 0 0 0 10.06l3.64-2.84z"/><path fill="#EA4335" d="M12 5.13c1.6 0 3.03.55 4.16 1.62l3.12-3.12A10.98 10.98 0 0 0 12 1 10.99 10.99 0 0 0 2.28 6.97l3.64 2.84C6.77 7.04 9.17 5.13 12 5.13z"/></svg>`;
const appleMark = `<svg class="apple-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.05 12.66c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.15-.47 7.82 1.3 10.38.86 1.25 1.89 2.66 3.24 2.61 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.28-1.28 3.13-2.54.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.72-1.04-2.46-4.6zM14.6 5.1c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.56-.66.76-1.24 1.99-1.09 3.16 1.15.09 2.32-.58 3.04-1.44z"/></svg>`;
const closeIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const backIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const chevronDownIcon = `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m6 8 4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const showIcon = `<svg class="icon-show" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg><svg class="icon-hide" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M9.4 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.1M6.5 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7c1.2 0 2.3-.2 3.3-.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const sentIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function authShell(inner, cardClass = "") {
  return `<div class="flat-screen is-auth">
    <main class="auth-main">
      <div class="auth-card ${cardClass}">
        <span class="auth-close" aria-hidden="true">${closeIcon}</span>
        ${inner}
      </div>
    </main>
  </div>`;
}

function authHead(eyebrow, title, copy) {
  return `<div class="auth-head">${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h1>${title}</h1><p>${copy}</p></div>`;
}

function socialRow() {
  return `<div class="social-row">
    <button class="social-btn" type="button" tabindex="-1">${googleMark}Continue with Google</button>
    <button class="social-btn" type="button" tabindex="-1">${appleMark}Continue with Apple</button>
  </div>`;
}

function field(label, placeholder, options = {}) {
  const type = options.type || "text";
  const id = `flat-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const errorClass = options.error ? " is-error" : "";
  if (options.passwordToggle) {
    return `<div class="field"><label for="${id}">${label}</label><div class="field-pass"><input class="field-input${errorClass}" id="${id}" type="${type}" placeholder="${placeholder}" value="${options.value || ""}" tabindex="-1" readonly><button class="pass-toggle" type="button" tabindex="-1" aria-hidden="true">${showIcon}</button></div>${options.hint ? `<span class="field-hint">${options.hint}</span>` : ""}${options.error ? `<p class="field-error">${options.error}</p>` : ""}</div>`;
  }
  return `<div class="field"><label for="${id}">${label}</label><input class="field-input${errorClass}" id="${id}" type="${type}" placeholder="${placeholder}" value="${options.value || ""}" tabindex="-1" readonly>${options.hint ? `<span class="field-hint">${options.hint}</span>` : ""}${options.error ? `<p class="field-error">${options.error}</p>` : ""}</div>`;
}

function authFoot(copy, action) {
  return `<p class="auth-foot">${copy} <span>${action}</span></p>`;
}

function renderAuthFrame(mode) {
  if (mode === "phone" || mode === "phoneSignup") {
    const alternate = mode === "phoneSignup";
    return authShell(`<div class="auth-steps" data-step="1"><div class="auth-step" data-step="1">
        ${authHead("", "Create your account", alternate ? "Choose how you’d like to continue." : "We’ll send a verification code to confirm it’s yours.")}
        ${alternate ? `${socialRow()}<div class="auth-divider">or</div>` : `<span class="step-back">${backIcon}Back</span>`}
        <div class="auth-form">${field("Phone number", "(555) 123-4567", { type: "tel" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue with Phone</button></div>
      </div></div>${authFoot("Already have an account?", "Sign in")}`);
  }
  if (mode === "phoneSignupDetails") {
    return authShell(`<div class="auth-steps" data-step="3"><div class="auth-step" data-step="3">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Tell us about you", "Add your name and confirm you’re eligible to use GTL.")}
        <div class="auth-form"><div class="signup-name-row">${field("First name", "Alex")}${field("Last name", "Morgan")}</div>${field("Date of birth", "MM/DD/YYYY", { type: "date", hint: "You must be 18 or older to use GTL." })}<label class="terms-check"><input type="checkbox" tabindex="-1"><span>I agree to GTL's <a href="#" tabindex="-1">Terms of Service</a> and <a href="#" tabindex="-1">Privacy Policy</a>.</span></label><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Create Account</button></div>
      </div></div>${authFoot("Already have an account?", "Sign in")}`);
  }
  if (mode === "phoneLogin") {
    return authShell(`${authHead("Welcome back", "Login to GTL", "Choose how you’d like to sign in.")}
      ${socialRow()}<div class="auth-divider">or</div>
      <div class="auth-form">${field("Phone number", "(555) 123-4567", { type: "tel" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue with Phone</button></div>
      ${authFoot("New to GTL?", "Create an Account")}`);
  }
  if (mode === "phoneLoginVerify") {
    return authShell(`<div class="auth-steps" data-step="2"><div class="auth-step" data-step="2">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Verify it’s you", `Enter the 8-digit verification code sent to <span class="code-sent-to">(555) 123-4567</span>.`)}
        <div class="auth-form"><div class="code-input">${Array.from({ length: 8 }, (_, index) => `${index === 4 ? `<span class="code-dash" aria-hidden="true"></span>` : ""}<input class="code-box" type="text" aria-label="Digit ${index + 1}" tabindex="-1" readonly>`).join("")}</div><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Verify and Login</button></div>
      </div></div>${authFoot("New to GTL?", "Create an Account")}`);
  }
  if (mode === "register") {
    return authShell(`<div class="auth-steps" data-step="1"><div class="auth-step" data-step="1">
        ${authHead("", "Create your account", "Start trading the live games in under a minute.")}
        ${socialRow()}<div class="auth-divider">or</div>
        <div class="auth-form">${field("Email", "you@email.com", { type: "email" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue</button></div>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "registerPassword") {
    return authShell(`<div class="auth-steps" data-step="3"><div class="auth-step" data-step="3">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Create a password", "Keep your account secure with a strong password.")}
        <div class="auth-form">${field("Password", "At least 8 characters", { type: "password", passwordToggle: true })}${field("Confirm password", "Re-enter your password", { type: "password", passwordToggle: true })}<label class="terms-check"><input type="checkbox" tabindex="-1"><span>I agree to GTL's <a href="#" tabindex="-1">Terms and Conditions</a> and <a href="#" tabindex="-1">Privacy Policy</a>.</span></label><p class="terms-error" role="alert" hidden>You need to accept the Terms and Conditions to create an account.</p><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Create Account</button></div>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "registerDetails") {
    return authShell(`<div class="auth-steps" data-step="2"><div class="auth-step" data-step="2">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Tell us about you", "Add your name and date of birth to confirm your eligibility.")}
        <div class="auth-form"><div class="signup-name-row">${field("First name", "Alex")}${field("Last name", "Morgan")}</div><fieldset class="field signup-birthday-field"><legend>Date of birth</legend><div class="date-fields"><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Month" aria-label="Month" tabindex="-1" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Day" aria-label="Day" tabindex="-1" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Year" aria-label="Year" tabindex="-1" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div></div><span class="field-hint">You must be 18 or older to use GTL.</span></fieldset><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue</button></div>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "verify") {
    return authShell(`<div class="auth-steps" data-step="4"><div class="auth-step" data-step="4">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Verify your phone", `We sent an 8-digit code by text to <span class="code-sent-to">(555) 123-4567</span>.`)}
        <div class="auth-form"><div class="code-input"><input class="code-box" type="text" aria-label="Digit 1" tabindex="-1" readonly><input class="code-box" type="text" aria-label="Digit 2" tabindex="-1" readonly><input class="code-box" type="text" aria-label="Digit 3" tabindex="-1" readonly><input class="code-box" type="text" aria-label="Digit 4" tabindex="-1" readonly><span class="code-dash" aria-hidden="true"></span><input class="code-box" type="text" aria-label="Digit 5" tabindex="-1" readonly><input class="code-box" type="text" aria-label="Digit 6" tabindex="-1" readonly><input class="code-box" type="text" aria-label="Digit 7" tabindex="-1" readonly><input class="code-box" type="text" aria-label="Digit 8" tabindex="-1" readonly></div><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Verify</button></div>
        <p class="code-resend">Didn't get a code? <button type="button" tabindex="-1">Resend</button></p>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "reset") {
    return authShell(`<div class="auth-progress" aria-hidden="true"><span class="is-done"></span><span class="is-done"></span><span></span></div>
      <div class="auth-steps" data-step="2"><div class="auth-step" data-step="2">
        <span class="step-back">${backIcon}Back</span>
        ${authHead("", "Create a password", "Keep your account secure with a strong password.")}
        <div class="auth-form">${field("Password", "At least 8 characters", { type: "password", passwordToggle: true, hint: "Use 8+ characters with a mix of letters and numbers." })}${field("Confirm password", "Re-enter your password", { type: "password", passwordToggle: true })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Continue</button></div>
      </div></div>${authFoot("Already have an account?", "Login")}`);
  }
  if (mode === "forgot") {
    return authShell(`<span class="step-back">${backIcon}Back</span>
      ${authHead("Reset password", "Forgot your password?", "Enter your email and we'll send you a link to reset it.")}
      <div class="auth-form">${field("Email", "you@email.com", { type: "email" })}<button class="btn btn-primary auth-submit" type="button" tabindex="-1">Send Reset Link</button></div>
      <div class="auth-sent"><div class="sent-check">${sentIcon}</div><h1>Check your email</h1><p>We've sent a reset link to <span class="code-sent-to">alex@gtl.test</span>. It expires in 30 minutes.</p><span class="btn btn-secondary auth-submit">Back to Login</span><p class="code-resend">Didn't get it? <span>Resend Link</span></p></div>
      ${authFoot("Remembered it?", "Login")}`);
  }
  const isError = mode === "error";
  const isLoading = mode === "loading";
  return authShell(`${authHead("Welcome back", "Login to GTL", "Pick up where you left off and trade the live games.")}
    ${socialRow()}<div class="auth-divider">or</div>
    <div class="auth-form">${field("Email", "you@email.com", { type: "email", value: isError ? "sam" : "", error: isError ? "Enter a valid email address." : "" })}${field("Password", "Your password", { type: "password", passwordToggle: true })}<div class="field-row"><span></span><span class="link-green">Forgot Password?</span></div><button class="btn btn-primary auth-submit" type="button" tabindex="-1">${isLoading ? "Processing..." : "Login"}</button></div>
    ${authFoot("New to GTL?", "Create an Account")}`);
}

const logoSvg = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5 20 18H4Z"/></svg>`;
const headerLogoSvg = `<img src="../gtl-app/assets/gtl-footer-logo.png" alt="Get the Lead">`;
const chevronDown = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const homeGames = [
  {
    id: "buf-mia",
    league: "nfl",
    period: "Q3",
    clock: "11:05",
    paused: { message: "Trading paused. Recalculating markets.", clears: true },
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: teamLogos.buf },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: teamLogos.mia },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 58, no: 42 } },
  },
  {
    id: "kc-sf",
    league: "nfl",
    period: "Q2",
    clock: "08:42",
    home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: teamLogos.kc },
    away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: teamLogos.sf },
    markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 64, no: 36 } },
  },
  {
    id: "dal-phi",
    league: "nfl",
    period: "Q1",
    clock: "12:44",
    paused: { message: "Markets open when a team takes the lead.", clears: false },
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: "../gtl-app/assets/logos/nfl-dal.png" },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: "../gtl-app/assets/logos/nfl-phi.png" },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 64, no: 36 }, ktl: { yes: 50, no: 50 } },
  },
];

function homeHeader(authed = false, positions = false) {
  return `<header class="site-header ds-static-header">
    <div class="header-row">
      <div class="header-left">
        <span class="brand-pill">
          <span class="brand floating-logo floating-btn brand-link"><span class="header-brand-logo">${headerLogoSvg}</span></span>
          <span class="brand floating-logo floating-btn brand-menu"><span class="header-brand-logo">${headerLogoSvg}</span></span>
          <span class="header-nav-slot"><nav class="header-nav" aria-label="Primary navigation"><span>Home</span><span>Live Games</span><span>Ranking</span>${authed ? "<span>Portfolio</span><span>Profile</span><span class=\"header-nav-sep\"></span><button class=\"header-nav-logout\" type=\"button\">Logout</button>" : ""}</nav></span>
        </span>
        <span class="theme-switch floating-btn"><span class="theme-switch-track"><span class="theme-switch-thumb"></span><span class="theme-option theme-sun">☼</span><span class="theme-option theme-moon">☾</span></span></span>
      </div>
      <div class="header-right">${authed ? `<span class="header-wallet"><span class="wallet-chip floating-btn"><svg class="wallet-ico" viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 8v9a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M20 8v4h-4a2 2 0 0 1 0-4h4z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="wallet-amount tnum">$240.50</span></span></span>${positions ? `<span class="header-positions"><span class="hpos-trigger"><span class="hpos-word">Open Positions</span><span class="hpos-num tnum">3</span><span class="hpos-close">${closeIcon}</span></span></span>` : ""}` : `<span class="header-auth"><span class="btn header-login floating-btn">Login</span></span>`}</div>
    </div>
  </header>`;
}

function homeTeamBlock(g, side) {
  const lead = g.home.score === g.away.score ? null : g.home.score > g.away.score ? "home" : "away";
  const t = g[side];
  return `<div class="team team-${side}${lead === side ? " is-leading" : ""}"><img class="team-logo" src="${t.logo}" alt="${t.name}"><div class="team-meta"><span class="team-abbr">${t.abbr}</span><span class="team-score tnum">${t.score}</span></div></div>`;
}

function homeGameMedia(g, center = `<span class="period">${g.period}</span><span class="clock tnum">${g.clock}</span>`) {
  return `<div class="game-row">${homeTeamBlock(g, "home")}<div class="game-center">${center}</div>${homeTeamBlock(g, "away")}</div>`;
}

function homeBetPanel(g) {
  return homeBetPanelLive(g);
}

function homeBetPanelLive(g) {
  const row = (label, sub, full, key) => `<div class="mkt-row">
      <button class="price yes" type="button" tabindex="-1" aria-label="${full} Yes ${g.markets[key].yes} cents">${g.markets[key].yes}¢</button>
      <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
      <button class="price no" type="button" tabindex="-1" aria-label="${full} No ${g.markets[key].no} cents">${g.markets[key].no}¢</button>
    </div>`;
  return `<div class="mkt-grid">
      <div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>
      ${row("GTL", "Get the Lead", "Get the Lead", "gtl")}
      ${row("TIE", "", "Tie", "tie")}
      ${row("KTL", "Keep the Lead", "Keep the Lead", "ktl")}
    </div><span class="view-game">View Game</span>`;
}

function homeGameTile(g, open = false) {
  return `<article class="game-tile${g.paused ? " is-paused" : ""}${open ? " is-open" : ""}" data-league="${g.league}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="tile-main">${homeGameMedia(g)}</div>
    <div class="tile-foot">${g.paused ? `<div class="trade-pause"><span class="pause-dot"></span><span>${g.paused.message}</span></div>` : ""}<button class="foot-toggle" type="button" tabindex="-1"><span class="chev">${chevronDown}</span><span class="toggle-label">${open ? "Hide Bets" : "See Bets"}</span><span class="chev">${chevronDown}</span></button><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${homeBetPanelLive(g)}</div></div></div></div>
  </article>`;
}

function homeLeagueStrip(active = "nfl") {
  return `<div class="league-strip" role="tablist" aria-label="Filter by league">
    <button class="league-pill${active === "nfl" ? " is-active" : ""}" type="button" tabindex="-1"><span class="league-icon"><span class="league-ball" aria-hidden="true">🏈</span></span><span class="league-label">NFL</span></button>
    <button class="league-pill${active === "nba" ? " is-active" : ""}" type="button" tabindex="-1"><span class="league-icon"><span class="league-ball" aria-hidden="true">🏀</span></span><span class="league-label">NBA</span></button>
  </div>`;
}

function homeHero(mode) {
  if (mode === "positions") {
    return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner authed"><div class="hero-greeting"><h1>Hey Alex</h1></div><div class="authed-stack">${homePositionsBlock()}<span class="btn btn-primary authed-cta">Live Games</span></div></div></section>`;
  }
  if (mode === "logged") {
    return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner authed no-open-positions"><div class="hero-greeting"><h1>Hey Alex</h1></div></div></section>`;
  }
  return `<section class="hero"><div class="hero-bg"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-glow"></div></div><div class="container hero-inner"><div class="hero-trading"><span class="live-dot"></span><span class="tnum">3,247</span> trading right now</div><h1 class="hero-title">Trade the moments that move the game.</h1><p class="hero-sub">Back the lead on live NFL &amp; NBA. Buy and sell in seconds, as the game turns.</p><div class="hero-cta"><span class="btn btn-primary btn-lg">Live Games</span><span class="btn btn-glass btn-lg">Create Account</span></div></div></section>`;
}

function homePositionsBlock() {
  return `<div class="positions-block"><div class="positions-head"><span class="eyebrow">Open Positions</span></div><div class="pos-carousel">${homePositionCardA("kc")}${homePositionCardA("ny")}${homePositionCardA("den")}</div><div class="pos-footer"><a href="javascript:void(0)" tabindex="-1">View All</a><div class="pos-dots"><button class="pos-dot is-active" type="button" tabindex="-1"></button><button class="pos-dot" type="button" tabindex="-1"></button><button class="pos-dot" type="button" tabindex="-1"></button></div><a href="javascript:void(0)" tabindex="-1">View Settled</a></div></div>`;
}

function homePositionCardA(variant) {
  const positions = {
    kc: {
      game: { period: "Q2", clock: "08:42", home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: teamLogos.kc }, away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: teamLogos.sf } },
      market: "Get the Lead",
      side: "yes",
      qty: 150,
      value: "$57.00",
      pnl: "+$10.50",
    },
    den: {
      game: { period: "Q4", clock: "01:33", home: { abbr: "DEN", name: "Nuggets", score: 102, color: "#FEC524", logo: teamLogos.den }, away: { abbr: "DAL", name: "Mavericks", score: 99, color: "#00538C", logo: teamLogos.dal } },
      market: "Get the Lead",
      side: "no",
      qty: 90,
      value: "$60.30",
      pnl: "+$6.30",
    },
    ny: {
      game: { period: "Q4", clock: "05:18", home: { abbr: "NYK", name: "Knicks", score: 84, color: "#F58426", logo: teamLogos.ny }, away: { abbr: "BOS", name: "Celtics", score: 89, color: "#007A33", logo: teamLogos.bos } },
      market: "Keep the Lead",
      side: "yes",
      qty: 100,
      value: "$63.00",
      pnl: "-$7.00",
    },
  };
  const p = positions[variant] || positions.kc;
  const g = p.game;
  const up = !p.pnl.startsWith("-");
  const style = `--home-color:${g.home.color};--away-color:${g.away.color}`;
  const actions = `<div class="oc-actions"><button class="oc-buy" type="button" tabindex="-1">Buy More</button><button class="oc-sell" type="button" tabindex="-1">Sell</button></div>`;
  return `<article class="pos-card pos-card--a" style="${style}"><div class="pos-media">${homeGameMedia(g)}</div><div class="pos-info"><div class="oc-summary"><div class="oc-row"><span class="oc-tag">${p.market}</span><span class="oc-vr-head">Value: <span class="tnum">${p.value}</span></span></div><div class="oc-row"><span class="oc-sub"><span class="side-${p.side}">${p.side.toUpperCase()}</span> · ${p.qty} contracts</span><span class="oc-figures"><span class="oc-pnl ${up ? "up" : "down"} tnum">${p.pnl}</span></span></div></div>${actions}</div></article>`;
}

function homePositionCard(variant) {
  const g = variant === "b" ? homeGames[1] : homeGames[0];
  const style = `--home-color:${g.home.color};--away-color:${g.away.color}`;
  const actions = `<div class="oc-actions"><button class="oc-buy" type="button" tabindex="-1">Buy More</button><button class="oc-sell" type="button" tabindex="-1">Sell</button></div>`;
  if (variant === "c") {
    return `<article class="pos-card pos-card--c" style="${style}"><div class="pos-media">${homeGameMedia(g, `<span class="period qtime">3 Quarter Time</span>`)}</div><div class="pos-info occ"><div class="occ-total tnum">$76.80</div><div class="occ-bar up"><span class="occ-bar-center"></span><span class="occ-bar-fill up" style="left:50%;width:25%"></span></div><div class="occ-bottom"><span class="oc-tag occ-type">Get the Lead · <span class="side-yes">YES</span></span><span class="occ-change up tnum">+$19.20</span></div>${actions}</div></article>`;
  }
  if (variant === "b") {
    return `<article class="pos-card pos-card--b" style="${style}"><div class="pos-media">${homeGameMedia(g)}</div><div class="pos-info"><div class="ocb-type">Keep the Lead · <span class="side-no">NO</span></div><div class="ocb-stats"><div class="ocb-stat"><span class="ocb-k">Contracts</span><span class="ocb-v tnum">80</span></div><div class="ocb-stat"><span class="ocb-k">Value</span><span class="ocb-v tnum">$44.00</span></div><div class="ocb-stat"><span class="ocb-k">Return</span><span class="ocb-v tnum oc-pnl down">-$4.80</span></div></div>${actions}</div></article>`;
  }
  return `<article class="pos-card pos-card--a" style="${style}"><div class="pos-media">${homeGameMedia(g)}</div><div class="pos-info"><div class="oc-summary"><div class="oc-row"><span class="oc-tag">Get the Lead</span><span class="oc-vr-head">Value: <span class="tnum">$76.80</span></span></div><div class="oc-row"><span class="oc-sub"><span class="side-yes">YES</span> · 120 contracts</span><span class="oc-figures"><span class="oc-pnl up tnum">+$19.20</span></span></div></div>${actions}</div></article>`;
}

function homeLiveSection(mode) {
  const isNba = mode === "nba" || mode === "nbaInterested" || mode === "nbaNotForMe";
  let content = `<div class="game-grid">${homeGames.map((g) => homeGameTile(g)).join("")}</div>`;
  if (mode === "noLive") content = `<div class="coming-soon"><span class="cs-logo league-ball" aria-hidden="true">🏈</span><h3 class="cs-title">No live games right now</h3><p class="cs-desc">Upcoming markets will appear here before kickoff.</p></div>`;
  if (isNba) content = `<div class="coming-soon"><span class="cs-logo league-ball" aria-hidden="true">🏀</span><h3 class="cs-title">NBA Markets Coming Soon</h3><p class="cs-desc">We're currently launching live with NFL. Get the Lead on NBA is next — tell us if you're interested and we'll prioritise accordingly.</p><div class="cs-actions"><span class="btn btn-secondary${mode === "nbaInterested" ? " is-chosen" : ""}">I'm interested</span><span class="btn btn-secondary${mode === "nbaNotForMe" ? " is-chosen" : ""}">Not for me</span></div></div>`;
  if (mode === "loading") content = `<div class="game-grid"><article class="game-tile ds-home-skeleton"></article><article class="game-tile ds-home-skeleton"></article><article class="game-tile ds-home-skeleton"></article></div>`;
  if (mode === "error") content = `<div class="coming-soon"><h3 class="cs-title">Unable to load markets</h3><p class="cs-desc">Refresh the page or try again later.</p><div class="cs-actions cs-actions-single"><span class="btn btn-secondary">Try again</span></div></div>`;
  return `<section class="section live"><div class="container"><div class="section-head center"><span class="eyebrow">On now</span><h2>Live games</h2></div>${homeLeagueStrip(isNba ? "nba" : "nfl")}${content}</div></section>`;
}

function homeHowSection() {
  const steps = [
    ["01", "Pick a market", "Choose a live game and one of three lead markets.", `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 14h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`],
    ["02", "View the order book", "See live Yes / No prices and where the market sits.", `<svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="11" width="3" height="5" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="7" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.8"/></svg>`],
    ["03", "Buy", "Take a position at the live price in a single tap.", `<svg viewBox="0 0 24 24" fill="none"><path d="M7 8l-3 3 3 3M4 11h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 16l3-3-3-3M20 13h-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`],
    ["04", "Cash Out or Settle", "Cash out early or let it settle when the moment lands.", `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`],
  ];
  return `<section class="section how"><div class="container"><div class="section-head center"><span class="eyebrow">How it works</span><h2>Four taps from watching to trading.</h2></div><ol class="flow">${steps.map(([n, title, copy, icon]) => `<li class="flow-step"><div class="flow-marker">${icon}</div><span class="flow-num">${n}</span><h3 class="flow-title">${title}</h3><p class="flow-text">${copy}</p></li>`).join("")}</ol></div></section>`;
}

function homeFooter(currentPage = "home") {
  const current = (page) => currentPage === page ? ` aria-current="page"` : "";
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a class="footer-logo-link" href="../gtl-app/home.html" aria-label="GTL home"><img class="footer-logo" src="../gtl-app/assets/gtl-footer-logo.png" alt="Get the Lead"></a><p class="footer-blurb">Get the Lead. The fastest way to trade the moments that move live NFL and NBA games.</p></div><div class="footer-cols"><div class="footer-col"><h4>Product</h4><a href="../gtl-app/home.html"${current("home")}>Home</a><a href="../gtl-app/profile.html"${current("profile")}>Profile</a><a href="../gtl-app/ranking.html"${current("ranking")}>Ranking</a><a href="../gtl-app/wallet.html"${current("portfolio")}>Portfolio</a></div><div class="footer-col"><h4>Company</h4><a href="#">About</a><a href="../gtl-app/contact.html">Contact</a></div><div class="footer-col"><h4>Legal</h4><a href="../gtl-app/rules.html">Official Rules</a><a href="#">Terms</a><a href="#">Privacy</a></div></div></div><div class="footer-base"><span>© 2026 GTL Markets</span><span>18+. Please play responsibly.</span></div></div></footer>`;
}

function renderHomeFrame(mode) {
  const authed = mode === "logged" || mode === "positions";
  return `<div class="flat-screen is-home is-home-${mode}">${homeHeader(authed, mode === "positions")}${homeHero(mode)}${homeLiveSection(mode)}${homeHowSection()}${homeFooter()}</div>`;
}

function renderWelcomeFrame(mode) {
  const burst = `<div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
  const decor = `<div class="welcome-celebration-bg" aria-hidden="true"><span class="celebration-glow"></span><span class="celebration-ring ring-one"></span><span class="celebration-ring ring-two"></span>${burst}<div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>`;
  const usernameOptions = mode === "required"
    ? { value: "", error: "Choose a username" }
    : mode === "invalid"
      ? { value: "alex!", error: "Use 3–20 letters, numbers, or underscores" }
      : { value: "alexmorgan" };
  const usernameId = `welcome-username-${mode}`;
  const usernameField = `<div class="field"><label for="${usernameId}">Username</label><input class="field-input${usernameOptions.error ? " is-error" : ""}" id="${usernameId}" type="text" autocomplete="username" placeholder="alexmorgan" value="${usernameOptions.value}" tabindex="-1" readonly><span class="field-hint">Use 3–20 letters, numbers, or underscores. This is how you’ll appear in rankings.</span>${usernameOptions.error ? `<p class="field-error" role="alert">${usernameOptions.error}</p>` : ""}</div>`;
  const content = `<div class="welcome-copy"><p class="welcome-kicker">You’re officially in</p><h1>Welcome to GTL, <span>Alex</span>.</h1><p>Your account is live. Create a username to claim your welcome credits and start betting the moments that matter to you.</p></div><div class="credit-ticket"><span class="ticket-label">Welcome credits</span><strong class="ticket-value tnum">1,500</strong></div><div class="welcome-form">${usernameField}<span class="btn btn-primary btn-lg">Start Betting</span></div>`;
  return `<div class="flat-screen is-welcome"><main class="welcome-main container" data-welcome-state="reward">${decor}<section class="welcome-panel welcome-reward">${content}</section></main></div>`;
}

function renderLocationFrame() {
  return `<div class="flat-screen is-location"><main class="location-main"><section class="location-panel"><span class="location-brand"><img src="../gtl-app/assets/gtl-footer-logo.png" alt="Get the Lead"></span><div class="location-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M26 13.3C26 20 16 28 16 28S6 20 6 13.3a10 10 0 1 1 20 0Z" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="13" r="3.25" stroke="currentColor" stroke-width="2"/><path d="m7 27 18-22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="location-copy"><p class="location-kicker">Location unavailable</p><h1>GTL isn’t available in this location.</h1><p>We’re working to bring GTL to more locations. Please check back again soon.</p></div><p class="location-footnote">Availability is based on your current location.</p></section></main></div>`;
}

function supportBack() {
  return `<span class="support-back"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Back</span></span>`;
}

function renderAccessFrame(mode) {
  const invalid = mode === "invalid";
  return `<div class="flat-screen is-auth is-access"><main class="auth-main"><div class="auth-card"><div class="auth-head"><span class="eyebrow">Restricted</span><h1>Enter passphrase</h1><p>This preview is private. Enter the passphrase to continue.</p></div><div class="auth-form"><div class="field"><label for="ds-passphrase-${mode}">Passphrase</label><div class="field-pass"><input class="field-input${invalid ? " is-error" : ""}" id="ds-passphrase-${mode}" type="password" placeholder="Enter passphrase" tabindex="-1" readonly><button class="pass-toggle" type="button" tabindex="-1" aria-hidden="true">${showIcon}</button></div>${invalid ? `<p class="field-error">Incorrect passphrase. Try again.</p>` : ""}</div><button class="btn btn-primary auth-submit" type="button" tabindex="-1">Unlock</button></div></div></main></div>`;
}

function renderContactFrame(mode) {
  const success = mode === "success";
  const menuOpen = mode === "topicOpen";
  const invalid = mode === "error";
  const input = (id, label, type, placeholder, error = "") => `<div class="field"><label for="${id}">${label}</label><input class="field-input${error ? " is-error" : ""}" id="${id}" type="${type}" placeholder="${placeholder}" tabindex="-1" readonly>${error ? `<p class="field-error">${error}</p>` : ""}</div>`;
  const form = `<form><div class="contact-name-row">${input(`contact-name-${mode}`, "Name", "text", "Your name")}${input(`contact-email-${mode}`, "Email", "email", "you@example.com", invalid ? "Enter a valid email address." : "")}</div><div class="field"><label for="contact-topic-${mode}">What can we help with?</label><div class="field-combobox${menuOpen ? " is-open" : ""}"><input class="field-input" id="contact-topic-${mode}" type="text" placeholder="Choose a topic" role="combobox" aria-expanded="${menuOpen}" tabindex="-1" readonly><button class="combobox-toggle" type="button" tabindex="-1" aria-hidden="true">${chevronDownIcon}</button><div class="combobox-menu" role="listbox"${menuOpen ? "" : " hidden"}>${["Account support", "Gameplay or markets", "Monthly competition", "Product feedback", "Something else"].map((label) => `<button class="combobox-option" type="button" role="option" tabindex="-1">${label}</button>`).join("")}</div></div>${invalid ? `<p class="field-error">Choose what we can help with.</p>` : ""}</div><div class="field"><label for="contact-message-${mode}">Message</label><textarea class="field-input contact-message${invalid ? " is-error" : ""}" id="contact-message-${mode}" rows="6" placeholder="Tell us what happened or what you need help with" tabindex="-1" readonly></textarea><span class="field-hint">0/1000 characters</span>${invalid ? `<p class="field-error">Enter a message.</p>` : ""}</div><button class="btn btn-primary btn-block contact-submit" type="button" tabindex="-1">Send Message</button><p class="contact-privacy">We’ll only use your details to respond to this request.</p></form>`;
  const successState = `<div class="contact-success"><span class="contact-success-icon" aria-hidden="true">${sentIcon}</span><span class="eyebrow">Message sent</span><h2>Thanks for getting in touch.</h2><p>We’ve received your request and will reply to <strong>alex@gtl.test</strong>.</p><p class="contact-reference">Reference <span class="tnum">GTL-7F3K9Q</span></p><button class="btn btn-secondary" type="button" tabindex="-1">Send another message</button></div>`;
  return `<div class="flat-screen is-contact contact-body">${homeHeader(false)}<main class="contact-page container">${supportBack()}<div class="contact-layout"><section class="contact-intro"><span class="eyebrow">Contact GTL</span><h1>How can we help?</h1><p>Send us a message and the GTL team will get back to you as soon as possible.</p><div class="contact-note"><span class="contact-note-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 6.5h16v11H4z" stroke="currentColor" stroke-width="1.8"/><path d="m5 8 7 5 7-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><strong>We usually reply within 1–2 business days.</strong><span>For account questions, use the email linked to your GTL account.</span></div></div></section><section class="contact-card" aria-label="Contact request form">${success ? successState : form}</section></div></main>${homeFooter()}</div>`;
}

function renderFeesFrame(mode) {
  const items = [
    ["01", "Contracts are priced 1¢–99¢", "Every market is priced in cents. The price reflects the live likelihood of the outcome. Each contract settles at $1.00 if your side wins, or $0.00 if it doesn't."],
    ["02", "What you pay", "Your cost is the contract price × the number of contracts, plus the 2% trading fee. The full breakdown is shown in your order summary before you confirm."],
    ["03", "What you can win", "If your side settles in your favour, each contract pays out $1.00. Your potential profit is the payout less your cost and fees."],
    ["04", "Settlement", "Markets settle automatically the moment the live result is final, and winnings are credited to your balance right away."],
  ];
  const mini = mode === "continueBet" ? `<div class="bet-mini" style="--home-color:#E31837;--away-color:#B3995D"><span class="bet-mini-teams"><img class="bet-mini-logo" src="${teamLogos.kc}" alt=""><span class="bet-mini-v">v</span><img class="bet-mini-logo" src="${teamLogos.sf}" alt=""></span><span class="bet-mini-label">Continue Bet</span></div>` : "";
  return `<div class="flat-screen is-support is-fees fees-body">${homeHeader(false)}<main class="support-page">${supportBack()}<div class="support-head"><span class="eyebrow">Pricing &amp; fees</span><h1>What you pay, what you win</h1><p class="support-lead">Simple, transparent pricing — no hidden charges. Every order carries a flat <strong>2% trading fee</strong> (minimum $0.01), and that's the only cost. Here's exactly how it works.</p></div><ol class="support-list">${items.map(([n, title, copy]) => `<li class="support-item"><span class="support-num">${n}</span><div><h3>${title}</h3><p>${copy}</p></div></li>`).join("")}</ol></main>${mini}</div>`;
}

const rulesContent = [
  ["Sponsor", `<p>The Competition is sponsored and operated by [LEGAL ENTITY NAME], a [STATE] [entity type] ("Sponsor"). Sponsor's decisions on all matters relating to the Competition are final and binding.</p>`],
  ["Competition period", `<p>Each Competition runs for one (1) calendar month, beginning at 12:00:00 AM ET on the first day of the month and ending at 11:59:59 PM ET on the last day of the month (each, a "Monthly Competition"). Each Monthly Competition is a separate and independent promotion with its own entry period, leaderboard, prize pool, and winners. Monthly Competitions are offered only during the NFL and NBA regular seasons and postseasons, at Sponsor's discretion. Sponsor will announce active Competition months in the App.</p>`],
  ["Eligibility", `<p>To participate, you must, at the time of entry and at the time of prize award:</p><ol class="rules-sublist"><li>Be a natural person at least eighteen (18) years of age (or the age of majority in your state of residence, if higher);</li><li>Be a legal resident of, and physically located in, Texas, Colorado, or Florida;</li><li>Maintain one (1), and only one (1), registered account in your own legal name;</li><li>Not be an employee, officer, director, or contractor of Sponsor, or an immediate family or household member;</li><li>Not be a person barred from participating under any applicable law.</li></ol><p>Sponsor uses geolocation and identity-verification technology to enforce eligibility. Sponsor may add or remove Eligible States in response to changes in law; the list in effect on the first day governs that Monthly Competition.</p>`],
  ["How to enter and play", `<ol class="rules-sublist"><li>Access the platform and create a free account. No purchase, payment, or deposit is required or accepted.</li><li>Each participant receives Credits free of charge. Credits have no cash value, cannot be purchased, sold, transferred, or redeemed, and expire at competition end.</li><li>During live games, participants use Credits on skill-based GTL, TIE, and KTL prediction contracts priced by Sponsor's quantitative engine.</li><li>Leaderboard standing is determined solely by Credit balance performance during the Monthly Competition, measured by the scoring formula published in the App.</li></ol>`],
  ["Winner determination", `<p>At the close of each Monthly Competition, the ten (10) eligible participants with the highest final leaderboard scores win cash prizes ("Winners"). Leaderboard scores are calculated exclusively from gameplay results; success depends on participants' skill in evaluating live game situations, probabilities, and contract pricing.</p>`],
  ["Prizes", `<p>Total announced prize value per Monthly Competition: <strong>$5,000.00 USD.</strong> No other prizes, bonuses, or awards are offered.</p>`],
  ["Winner verification and payment", `<ol class="rules-sublist"><li>Provisional Winners are notified through the App and/or account email within seven (7) days.</li><li>Before payment, each provisional Winner must complete identity and eligibility verification and submit a completed IRS Form W-9.</li><li>Verified prizes will be paid by [ACH transfer / check / payment platform] within thirty (30) days after verification and no later than sixty (60) days after competition close.</li><li>Failure to respond or complete verification within fourteen (14) days forfeits the prize and advances the leaderboard.</li><li>Winners are responsible for all taxes. Sponsor will issue IRS Form 1099-MISC where required.</li></ol>`],
  ["Conduct and disqualification", `<p>Sponsor may disqualify participants, void entries, and withhold prizes for multiple accounts, account sharing, collusion, bots, scripts, automated play, exploiting software errors or latency, location spoofing, false registration or verification information, fraud, abuse, or conduct contrary to competitive integrity.</p>`],
  ["Game integrity and data", `<p>Contract settlement is based on official league data feeds and final official scoring. Sponsor may void or re-settle contracts affected by feed errors, postponed or cancelled games, or pricing errors. If a Monthly Competition is materially disrupted, Sponsor may suspend, modify, or terminate it and award prizes based on standings at disruption or carry the pool forward.</p>`],
  ["Publicity", `<p>Except where prohibited by law, acceptance of a prize permits Sponsor to use the Winner's username, first name, last initial, and state of residence for Competition-related publicity without additional compensation. Legal names will not be published without separate consent except where required by law.</p>`],
  ["Privacy", `<p>Information collected in connection with the Competition is used for administration, verification, prize fulfillment, and tax compliance, and is handled per Sponsor's Privacy Policy at [URL].</p>`],
  ["General conditions", `<ol class="rules-sublist"><li>By participating, you agree to these Official Rules and Sponsor's Terms of Service.</li><li>These Rules may not be changed during an active Monthly Competition except as required by law.</li><li>Apple Inc. and Google LLC do not sponsor, endorse, or administer the Competition.</li><li>Sponsor is not responsible for technical malfunctions, lost or delayed transmissions, or errors beyond its reasonable control.</li><li>To the fullest extent permitted by law, participants release Sponsor and its officers, employees, and agents from claims arising from participation or prize use.</li><li>These Rules are governed by the laws of [STATE], and disputes are resolved by binding individual arbitration in [COUNTY, STATE].</li><li>If any provision is invalid, the remainder continues in force.</li></ol>`],
  ["Winners list", `<p>For the names (username, first name and last name) of Winners of any Monthly Competition, email [EMAIL] within sixty (60) days after the close of that Competition.</p>`],
];

function renderRulesFrame() {
  const prizes = [["1st", "$1,500"], ["2nd", "$900"], ["3rd", "$650"], ["4th", "$500"], ["5th", "$400"], ["6th", "$300"], ["7th", "$250"], ["8th", "$200"], ["9th", "$175"], ["10th", "$125"]];
  return `<div class="flat-screen is-support is-rules rules-body">${homeHeader(false)}<main class="support-page">${supportBack()}<div class="support-head"><span class="eyebrow">Official rules</span><h1>GTL Monthly Prize Competition</h1><p class="rules-notice"><strong>NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE WILL NOT INCREASE YOUR CHANCES OF WINNING. VOID WHERE PROHIBITED BY LAW.</strong></p><p class="rules-summary"><em>This is a free-to-play, skill-based prediction competition. Credits used in gameplay have no monetary value, cannot be purchased, and cannot be redeemed, transferred, or exchanged for cash or anything of value.</em></p></div><ol class="support-list">${rulesContent.map(([title, copy], index) => `<li class="support-item"><span class="support-num" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><section><h2>${title}</h2>${copy}${title === "Prizes" ? `<div class="rules-table-wrap"><table class="rules-table"><caption>Monthly Competition prize schedule</caption><thead><tr><th>Rank</th><th>Prize</th></tr></thead><tbody>${prizes.map(([rank, prize]) => `<tr><td>${rank}</td><td>${prize}</td></tr>`).join("")}</tbody></table></div><p><strong>Ties.</strong> Tied rank prizes are combined and divided equally among tied participants; the next participant takes the next unoccupied rank.</p><p>Prizes are non-transferable. Sponsor may substitute a prize of equal value if a listed prize becomes unavailable.</p>` : ""}</section></li>`).join("")}</ol><p class="rules-updated"><em>Last updated: [DATE]. © [YEAR] [LEGAL ENTITY NAME]. Get The Lead, GTL, and KTL are trademarks of Sponsor.</em></p></main>${homeFooter()}</div>`;
}

function legacyWaitlistConfirmation(mode) {
  if (mode !== "joining" && mode !== "confirmed") return "";
  const confirmed = mode === "confirmed";
  return `<div class="waitlist-confirmation is-visible${confirmed ? " is-confirmed" : ""}"><div class="confirmation-backdrop"></div><section class="confirmation-card" role="dialog" aria-modal="true"><div class="confirmation-visual" aria-hidden="true"><span class="confirmation-ring confirmation-ring--outer"></span><span class="confirmation-ring confirmation-ring--inner"></span><span class="confirmation-route"></span><span class="confirmation-mark"><svg viewBox="0 0 32 32" fill="none"><path class="confirmation-check" d="m8 16.5 5 5L24 10.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><span class="eyebrow confirmation-eyebrow">${confirmed ? "Early Access Confirmed" : "Joining the Waitlist"}</span><h2>${confirmed ? "You’re in before kickoff." : "Securing your place."}</h2><p>${confirmed ? "We’ll email you before live trading opens, with early market previews and a quick-start guide so you’re ready to make your first move." : "Hold tight—we’re reserving your early-access spot."}</p>${confirmed ? `<button class="btn btn-primary confirmation-action" type="button" tabindex="-1">Continue Exploring</button>` : `<div class="confirmation-progress" aria-hidden="true"><span></span></div>`}</section></div>`;
}

function legacyRenderWaitlistFrame(mode) {
  const error = mode === "error";
  const marketRows = [["GTL", "Get the Lead", 38, 62], ["TIE", "", 22, 78], ["KTL", "Keep the Lead", 64, 36]];
  return `<div class="flat-screen is-waitlist waitlist-page"><header class="waitlist-header"><span class="waitlist-brand"><img src="../gtl-app/assets/gtl-footer-logo.png" alt="Get the Lead"></span><div class="waitlist-header-actions"><span class="btn btn-glass header-cta">Join the Waitlist</span><span class="btn btn-glass header-home">Home</span></div></header><main><section class="waitlist-hero"><div class="hero-atmosphere"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-orb hero-orb--green"></div><div class="hero-orb hero-orb--blue"></div></div><div class="waitlist-shell hero-layout"><div class="hero-copy"><div class="kickoff-pill"><span class="live-pulse"></span>Launching for NFL Season</div><h1>Don’t just watch the game. <span>Get the lead.</span></h1><p class="hero-lead">Trade the moments that move live games. Join now for early access to the NFL season.</p><div class="waitlist-form"><div class="form-row"><div class="email-field"><input class="field-input${error ? " is-error" : ""}" type="email" placeholder="Enter Your Email" tabindex="-1" readonly></div><button class="btn btn-primary join-button" type="button" tabindex="-1"><span>Get Early Access</span></button></div><p class="form-message${error ? " is-error" : ""}">${error ? "Enter a valid email address to join the waitlist." : ""}</p></div><div class="trust-row"><span>✓ First Access</span><span>✓ Launch Rewards</span><span>✓ Free to Join</span></div></div></div></section><section class="promise-section"><div class="waitlist-shell"><div class="section-intro"><span class="eyebrow">Every drive matters</span><h2>Built for the moments between the moments.</h2><p>Fast, focused markets that keep you in the action from kickoff to the final play.</p></div><div class="promise-grid">${[["01", "Live by the play", "Prices shift as the game turns. Read the moment and make your move in seconds."], ["02", "Made for momentum", "Back the lead, the tie, or the comeback—without leaving the game you’re watching."], ["03", "Simple by design", "Clear Yes or No positions. No clutter, no complicated bet slips, no missed plays."]].map(([n, title, copy], i) => `<article class="promise-card${i === 1 ? " promise-card--feature" : ""}"><span class="promise-number">${n}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></div></section><section class="markets-section"><div class="waitlist-shell markets-layout"><div class="markets-copy"><span class="eyebrow">One Game. Three Ways In.</span><h2>The game tells the story.<br><span>The market moves with it.</span></h2><p>Everything you need to read the moment—live score, game clock, possession, and prices—brought together in one focused view.</p></div><article class="game-tile launch-game-card fan-card--center is-open" style="--home-color:#E31837;--away-color:#B3995D"><div class="tile-main"><div class="game-row"><div class="team team-home is-leading"><span class="team-mark team-logo is-fallback" style="--team-color:#E31837"><span class="team-mark-abbr">KC</span></span><div class="team-meta"><span class="team-abbr team-name">Chiefs</span><span class="team-score tnum">17</span></div></div><div class="game-center"><span class="period">Q2</span><span class="clock tnum">08:42</span></div><div class="team team-away"><span class="team-mark team-logo is-fallback" style="--team-color:#B3995D"><span class="team-mark-abbr">SF</span></span><div class="team-meta"><span class="team-abbr team-name">49ers</span><span class="team-score tnum">14</span></div></div></div></div><div class="tile-foot"><div class="foot-toggle"><span class="toggle-label">Hide Bets</span></div><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad"><div class="mkt-grid"><div class="mkt-head"><span>Yes</span><span>Markets</span><span>No</span></div>${marketRows.map(([name, sub, yes, no]) => `<div class="mkt-row"><span class="price yes tnum">${yes}¢</span><span class="mkt-name">${name}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span><span class="price no tnum">${no}¢</span></div>`).join("")}</div></div></div></div></div></article></div></section><section class="ranking-section"><div class="waitlist-shell ranking-layout"><div class="ranking-copy"><span class="eyebrow">Monthly Competition</span><h2>Build your balance.<br><span>Climb the ranking.</span></h2><p>Trade with Free Credits throughout the month. The ten highest balances share $5,000 in cash prizes when the competition ends.</p><div class="competition-facts"><div><strong>$5,000</strong><span>Prize Pool</span></div><div><strong>Top 10</strong><span>Win Prizes</span></div><div><strong>Monthly</strong><span>Competition Reset</span></div></div></div><div class="competition-preview"><div class="competition-table-head"><span>Rank</span><span>Player</span><span>Balance</span><span>Prize</span></div><div class="competition-rows">${[["1", "leadstorm", "6,840", "$1,500"], ["2", "fourthquarter", "6,210", "$900"], ["3", "linehunter", "5,980", "$650"]].map(([rank, user, balance, prize]) => `<div class="competition-row"><span class="competition-rank">${rank}</span><strong>${user}</strong><span>${balance}</span><span>${prize}</span></div>`).join("")}</div><div class="competition-current"><div class="competition-row is-current"><span class="competition-rank">6</span><strong>You</strong><span>4,880</span><span>$300</span></div></div></div></div></section><section class="final-cta"><div class="waitlist-shell final-inner"><span class="football-mark">🏈</span><h2>Be there before kickoff.</h2><p>Early access is limited. Join the list and we’ll save your spot.</p><span class="btn btn-primary join-button">Join the Waitlist</span></div></section></main>${legacyWaitlistConfirmation(mode)}<footer class="waitlist-footer"><img src="../gtl-app/assets/gtl-footer-logo.png" alt="Get the Lead"><p>© 2026 GTL Markets. 18+. Please play responsibly.</p></footer></div>`;
}

const waitlistCheckIcon = `<svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 10 3 3 7-7"/></svg>`;
const waitlistArrowIcon = `<svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M4 10h12m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const waitlistChevronIcon = `<span class="chev"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
const waitlistTrophyIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4Z" stroke="currentColor" stroke-width="2"/><path d="M8 6H5.5A2.5 2.5 0 0 0 8 8.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5M12 12v4M9 20h6M10 16h4v4h-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const waitlistMedalIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 3 4 6 4-6M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" stroke="currentColor" stroke-width="2"/><path d="M12 12.7v3.8" stroke="currentColor" stroke-width="2"/></svg>`;

function waitlistMarketRows(rows, interactive = false) {
  return rows.map(([yes, name, sub, no]) => `<div class="mkt-row"><${interactive ? "button" : "span"} class="price yes tnum"${interactive ? ` type="button" tabindex="-1"` : ""}>${yes}¢</${interactive ? "button" : "span"}><span class="mkt-name">${name}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span><${interactive ? "button" : "span"} class="price no tnum"${interactive ? ` type="button" tabindex="-1"` : ""}>${no}¢</${interactive ? "button" : "span"}></div>`).join("");
}

function waitlistGameCard({ side = "center", home, away, period, clock, rows }) {
  const isSide = side !== "center";
  const classes = isSide ? ` fan-card fan-card--${side}` : " fan-card--center is-open";
  const markets = `<div class="mkt-grid"><div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>${waitlistMarketRows(rows, !isSide)}</div>`;
  const footer = isSide
    ? `<div class="tile-foot fan-card-markets"><div class="foot-toggle"><span class="toggle-label">Bets</span></div>${markets}</div>`
    : `<div class="tile-foot"><div class="foot-toggle">${waitlistChevronIcon}<span class="toggle-label">Hide Bets</span>${waitlistChevronIcon}</div><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${markets}</div></div></div></div>`;
  return `<article class="game-tile launch-game-card${classes}"${isSide ? ` aria-hidden="true"` : ` aria-label="Live Kansas City Chiefs versus San Francisco 49ers game card"`} style="--home-color:${home.color};--away-color:${away.color}"><div class="tile-main"><div class="game-row"><div class="team team-home${home.leading ? " is-leading" : ""}"><span class="team-mark team-logo is-fallback" style="--team-color:${home.color}"><span class="team-mark-abbr">${home.abbr}</span></span><div class="team-meta"><span class="team-abbr team-name">${home.name}</span><span class="team-score tnum">${home.score}</span></div></div><div class="game-center"><span class="period">${period}</span><span class="clock tnum">${clock}</span></div><div class="team team-away${away.leading ? " is-leading" : ""}"><span class="team-mark team-logo is-fallback" style="--team-color:${away.color}"><span class="team-mark-abbr">${away.abbr}</span></span><div class="team-meta"><span class="team-abbr team-name">${away.name}</span><span class="team-score tnum">${away.score}</span></div></div></div></div>${footer}</article>`;
}

function waitlistFlatlayConfirmation(mode) {
  if (mode !== "joining" && mode !== "confirmed" && mode !== "sharing") return "";
  const confirmed = mode === "confirmed" || mode === "sharing";
  const sharing = mode === "sharing";
  const eyebrow = sharing ? "Share Early Access" : confirmed ? "Early Access Confirmed" : "Joining the Waitlist";
  const title = sharing ? "Bring your friends along." : confirmed ? "You’re in before kickoff." : "Securing your place.";
  const copy = sharing ? "Copy the waitlist link and send it to anyone you want beside you when live trading begins." : confirmed ? "We’ll email you before live trading opens, with early market previews and a quick-start guide so you’re ready to make your first move." : "Hold tight—we’re reserving your early-access spot.";
  const feedback = sharing
    ? `<div class="confirmation-share"><input class="confirmation-share-link" type="text" value="https://getthelead.app/waitlist" aria-label="Waitlist link" tabindex="-1" readonly><div class="confirmation-actions"><span class="btn btn-primary confirmation-action"><span>Copy</span></span></div><p class="confirmation-copy-status" aria-live="polite"></p></div>`
    : confirmed
    ? `<div class="confirmation-actions"><span class="btn btn-primary confirmation-action">Share with Friends</span></div>`
    : `<div class="confirmation-progress" aria-hidden="true"><span></span></div>`;
  return `<div class="waitlist-confirmation is-visible${confirmed ? " is-confirmed" : ""}${sharing ? " is-sharing" : ""}"><div class="confirmation-backdrop"></div><section class="confirmation-card" role="dialog" aria-modal="true" aria-label="${eyebrow}"><div class="confirmation-visual" aria-hidden="true"><span class="confirmation-ring confirmation-ring--outer"></span><span class="confirmation-ring confirmation-ring--inner"></span><span class="confirmation-route"></span><span class="confirmation-mark"><svg viewBox="0 0 32 32" fill="none"><path class="confirmation-check" d="m8 16.5 5 5L24 10.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><span class="eyebrow confirmation-eyebrow">${eyebrow}</span><h2>${title}</h2><p>${copy}</p>${feedback}</section>${confirmed ? `<span class="btn btn-secondary confirmation-screen-close">Close</span>` : ""}</div>`;
}

function renderWaitlistFlatlay(mode) {
  const error = mode === "error";
  const promiseCards = [
    ["01", `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`, "Live by the play", "Prices shift as the game turns. Read the moment and make your move in seconds."],
    ["02", `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`, "Made for momentum", "Back the lead, the tie, or the comeback—without leaving the game you’re watching."],
    ["03", `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`, "Simple by design", "Clear Yes or No positions. No clutter, no complicated bet slips, no missed plays."],
  ];
  const gameCards = [
    waitlistGameCard({ side: "left", home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", leading: true }, away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97" }, period: "Q3", clock: "11:05", rows: [[44, "GTL", "Get the Lead", 56], [19, "TIE", "", 81], [58, "KTL", "Keep the Lead", 42]] }),
    waitlistGameCard({ side: "right", home: { abbr: "DAL", name: "Cowboys", score: 10, color: "#003594" }, away: { abbr: "PHI", name: "Eagles", score: 13, color: "#004C54", leading: true }, period: "Q4", clock: "02:14", rows: [[46, "GTL", "Get the Lead", 54], [28, "TIE", "", 72], [61, "KTL", "Keep the Lead", 39]] }),
    waitlistGameCard({ home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", leading: true }, away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D" }, period: "Q2", clock: "08:42", rows: [[38, "GTL", "Get the Lead", 62], [22, "TIE", "", 78], [64, "KTL", "Keep the Lead", 36]] }),
  ].join("");
  const rankingRows = [["is-first", waitlistTrophyIcon, "leadstorm", "6,840", "$1,500"], ["is-podium", waitlistMedalIcon, "fourthquarter", "6,210", "$900"], ["is-podium", waitlistMedalIcon, "linehunter", "5,980", "$650"]];
  return `<div class="flat-screen is-waitlist waitlist-page"><header class="waitlist-header"><span class="waitlist-brand"><img src="../gtl-app/assets/gtl-footer-logo.png" alt="Get the Lead"></span><div class="waitlist-header-actions"><span class="btn btn-glass header-cta"><span class="header-cta-label-desktop">Join the Waitlist</span><span class="header-cta-label-mobile">Join Waitlist</span></span><span class="btn btn-glass header-home">Home</span></div></header><main><section class="waitlist-hero"><div class="hero-atmosphere"><div class="hero-grid"><div class="hero-grid-plane"></div></div><div class="hero-orb hero-orb--green"></div><div class="hero-orb hero-orb--blue"></div></div><div class="waitlist-shell hero-layout"><div class="hero-copy"><div class="kickoff-pill"><span class="live-pulse"></span>Launching for NFL Season</div><h1>Don’t just watch the game. <span>Get the lead.</span></h1><p class="hero-lead">Trade the moments that move live games. Join now for early access to the NFL season.</p><div class="waitlist-form"><div class="form-row"><div class="email-field"><input class="field-input${error ? " is-error" : ""}" type="email" value="${error ? "not-an-email" : ""}" placeholder="Enter Your Email" tabindex="-1" readonly></div><span class="btn btn-primary join-button"><span>Get Early Access</span>${waitlistArrowIcon}</span></div><p class="form-message${error ? " is-error" : ""}">${error ? "Enter a valid email address to join the waitlist." : ""}</p></div><div class="trust-row"><span>${waitlistCheckIcon}First Access</span><span>${waitlistCheckIcon}Launch Rewards</span><span>${waitlistCheckIcon}Free to Join</span></div></div></div><div class="scroll-cue"><span></span>See what’s coming</div></section><section class="promise-section"><div class="waitlist-shell"><div class="section-intro"><span class="eyebrow">Every drive matters</span><h2>Built for the moments between the moments.</h2><p>Fast, focused markets that keep you in the action from kickoff to the final play.</p></div><div class="promise-grid">${promiseCards.map(([number, icon, title, copy], index) => `<article class="promise-card${index === 1 ? " promise-card--feature" : ""}"><span class="promise-icon">${icon}</span><span class="promise-number">${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}</div></div></section><section class="markets-section"><div class="market-field-lines"></div><div class="waitlist-shell markets-layout"><div class="markets-copy"><span class="eyebrow">One Game. Three Ways In.</span><h2>The game tells the story.<br><span>The market moves with it.</span></h2><p>Everything you need to read the moment—live score, game clock, possession, and prices—brought together in one focused view.</p></div><div class="game-card-fan">${gameCards}</div></div></section><section class="ranking-section"><div class="ranking-glow"></div><div class="waitlist-shell ranking-layout"><div class="ranking-copy"><span class="eyebrow">Monthly Competition</span><h2>Build your balance.<br><span>Climb the ranking.</span></h2><p>Trade with Free Credits throughout the month. The ten highest balances share $5,000 in cash prizes when the competition ends.</p><div class="competition-facts"><div><strong class="tnum">$5,000</strong><span>Prize Pool</span></div><div><strong class="tnum">Top 10</strong><span>Win Prizes</span></div><div><strong>Monthly</strong><span>Competition Reset</span></div></div></div><div class="competition-preview"><div class="competition-table-head"><span>Rank</span><span>Player</span><span>Balance</span><span>Prize</span></div><div class="competition-rows">${rankingRows.map(([className, icon, user, balance, prize]) => `<div class="competition-row ${className}"><span class="competition-rank">${icon}</span><strong>${user}</strong><span class="tnum">${balance}</span><span class="tnum">${prize}</span></div>`).join("")}</div><div class="competition-current"><div class="competition-row is-current"><span class="competition-rank">6</span><strong>You</strong><span class="tnum">4,880</span><span class="tnum">$300</span></div></div></div></div></section><section class="final-cta"><div class="final-lines"></div><div class="waitlist-shell final-inner"><span class="football-mark">🏈</span><h2>Be there before kickoff.</h2><p>Early access is limited. Join the list and we’ll save your spot.</p><span class="btn btn-primary join-button"><span>Join the Waitlist</span>${waitlistArrowIcon}</span></div></section></main>${waitlistFlatlayConfirmation(mode)}<footer class="waitlist-footer"><span><img src="../gtl-app/assets/gtl-footer-logo.png" alt="Get the Lead"></span><p>© 2026 GTL Markets. 18+. Please play responsibly.</p></footer></div>`;
}

function renderRankingFrame(mode) {
  const signedOut = mode === "signedOut" || mode === "signedOutMonths";
  const monthMenuOpen = mode === "months" || mode === "signedOutMonths";
  const historical = mode === "historical";
  const rows = historical ? [
    [1, "leadstorm", 6630, "$1,500"], [2, "fourthquarter", 6280, "$900"], [3, "linehunter", 5930, "$650"],
    [4, "greenlight", 5580, "$500"], [5, "clockedge", 5230, "$400"], [6, "You", 4880, "$300", true],
    [7, "marketmaker", 4530, "$250"], [8, "snapcount", 4180, "$200"], [9, "fastbreak", 3830, "$175"], [10, "leadkeeper", 3480, "$125"],
  ] : [
    [1, "linehunter", 6980, "$1,500"], [2, "greenlight", 6630, "$900"], [3, "clockedge", 6280, "$650"],
    [4, "marketmaker", 5930, "$500"], [5, "snapcount", 5580, "$400"], [6, "fastbreak", 5230, "$300"],
    [7, "leadkeeper", 4880, "$250"], [8, "swingtrader", 4530, "$200"], [9, "leadstorm", 4180, "$175"], [10, "fourthquarter", 3830, "$125"],
  ];
  const trophy = `<svg class="rank-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 4h8v3.5a4 4 0 0 1-8 0V4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 6H5.5A2.5 2.5 0 0 0 8 8.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5M12 12v4M9 20h6M10 16h4v4h-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const medal = `<svg class="rank-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 3 4 6 4-6M12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12.7v3.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const rowHTML = rows.map(([rank, user, balance, prize, isCurrent]) => `<div class="ranking-row${rank <= 3 && !isCurrent ? ` is-podium is-rank-${rank}` : ""}${isCurrent ? " is-current" : ""}" role="row"${isCurrent ? ` aria-label="Your rank, position ${rank}, You, balance ${balance.toLocaleString("en-US")} credits, prize ${prize}"` : ""}>${rank <= 3 && !isCurrent ? `<span class="rank-medal" role="cell">${rank === 1 ? trophy : medal}</span>` : `<span class="rank-pos" role="cell">${rank}</span>`}<span class="rank-user" role="cell">${user}</span><span class="rank-balance tnum" role="cell">${balance.toLocaleString("en-US")}</span><span class="rank-prize tnum" role="cell">${prize}</span></div>`).join("");
  const currentRow = signedOut || historical ? "" : `<div class="ranking-current-slot" role="rowgroup"><div class="ranking-row is-current" role="row" aria-label="Your rank, position 47, You, balance 1,710 credits, prize 0"><span class="rank-pos" role="cell">47</span><span class="rank-user" role="cell">You</span><span class="rank-balance tnum" role="cell">1,710</span><span class="rank-prize tnum" role="cell">0</span></div></div>`;
  const months = [["July", 47], ["June", 6], ["May", 31], ["April", 3], ["March", 24], ["February", 8], ["January", 62]];
  const selectedMonth = historical ? "June" : "July";
  const monthSelect = `<div class="ranking-month-select${monthMenuOpen ? " is-open" : ""}"><button class="ranking-month-trigger" type="button" aria-haspopup="listbox" aria-expanded="${monthMenuOpen}"><span>${selectedMonth} 2026</span><svg viewBox="0 0 20 20" fill="none"><path d="m6 8 4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="ranking-month-menu" role="listbox"${monthMenuOpen ? "" : " hidden"}>${months.map(([month, rank]) => `<button class="ranking-month-option${month === selectedMonth ? " is-selected" : ""}" type="button" role="option" aria-selected="${month === selectedMonth}"><span>${month}</span><strong>${signedOut ? "Sign in to view" : `#${rank}`}</strong></button>`).join("")}</div></div>`;
  const rules = `<section class="ranking-rules"><div class="container ranking-rules-inner"><div class="section-head center"><span class="eyebrow">Competition summary</span><h2>Monthly Competition rules</h2></div><ol class="flow"><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 14h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div><span class="flow-num">01</span><h3 class="flow-title">Free to enter</h3><p class="flow-text">No purchase is necessary. Free Credits have no cash value and expire at competition end.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flow-num">02</span><h3 class="flow-title">Be eligible</h3><p class="flow-text">You must be 18+, hold one account, and be located in an eligible state.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="11" width="3" height="5" rx="1" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="7" width="3" height="9" rx="1" stroke="currentColor" stroke-width="1.8"/></svg></div><span class="flow-num">03</span><h3 class="flow-title">Climb the ranking</h3><p class="flow-text">The top 10 eligible players share $5,000 in monthly prizes.</p></li><li class="flow-step"><div class="flow-marker"><svg viewBox="0 0 24 24" fill="none"><path d="M7 8l-3 3 3 3M4 11h9M17 16l3-3-3-3M20 13h-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="flow-num">04</span><h3 class="flow-title">Verify and receive</h3><p class="flow-text">Winners verify their identity, eligibility, location, and tax details before payment.</p></li></ol><span class="ranking-rules-link">Read the full Official Rules <span>→</span></span></div></section>`;
  const resultConfig = {
    resultOutside: { rank: 47, description: "Try and reach the top 10 in August's competition to receive a cash reward!", prize: "", topThree: false },
    resultWinner: { rank: 7, description: "The GTL team will contact you shortly about claiming your reward.", prize: "$250", topThree: false },
    resultTopThree: { rank: 2, description: "The GTL team will contact you shortly about claiming your reward.", prize: "$900", topThree: true },
  }[mode];
  const celebration = resultConfig?.prize ? `<div class="ranking-celebration" aria-hidden="true"><span class="celebration-glow"></span><div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>` : "";
  const resultModal = resultConfig ? `<div class="gate-backdrop ranking-prize-backdrop is-open"></div>${celebration}<div class="auth-gate ranking-prize-gate${resultConfig.topThree ? " is-top-three" : ""} is-open" role="dialog" aria-modal="true"><div class="gate-body"><span class="ranking-prize-kicker">July Rankings</span>${resultConfig.topThree ? `<span class="ranking-prize-medal" data-rank="${resultConfig.rank}" aria-hidden="true"><span class="ranking-medal-ribbon ribbon-left"></span><span class="ranking-medal-ribbon ribbon-right"></span><span class="ranking-medal-face"><strong>${resultConfig.rank}</strong></span></span>` : ""}<h3 class="gate-title">You finished in position ${resultConfig.rank}</h3><p class="gate-desc">${resultConfig.description}</p>${resultConfig.prize ? `<strong class="ranking-prize-value tnum">${resultConfig.prize}</strong>` : ""}</div></div><button class="btn btn-secondary gate-close ranking-result-close is-open" type="button">Close</button>` : "";
  return `<div class="flat-screen is-ranking ranking-body">${homeHeader(!signedOut)}<main><header class="ranking-hero"><div class="ranking-hero-glow"></div><div class="ranking-hero-inner container"><h1>Ranking Leaderboard</h1><div class="ranking-countdown"><span class="reset-label">Resets in</span><span class="reset-time tnum"><span class="reset-num">06</span><span class="reset-unit">d</span><span class="reset-num">10</span><span class="reset-unit">h</span><span class="reset-num">15</span><span class="reset-unit">m</span></span></div></div></header><section class="ranking-page container"><section class="ranking-card" aria-label="Monthly leaderboard" role="table"><header class="ranking-card-head"><div>${monthSelect}</div><p>Top 10 win cash prizes</p></header><div class="ranking-table-head" role="row"><span role="columnheader">Rank</span><span role="columnheader">Player</span><span role="columnheader">Balance</span><span role="columnheader">Prize</span></div><div class="ranking-scroll" role="rowgroup">${rowHTML}</div>${currentRow}</section></section>${rules}</main>${homeFooter("ranking")}${resultModal}</div>`;
}

const gameFrameData = {
  live: {
    league: "NBA",
    variant: 2,
    period: "Q4",
    clock: "05:18",
    home: { abbr: "NYK", name: "Knicks", score: 84, color: "#F58426", logo: teamLogos.ny },
    away: { abbr: "BOS", name: "Celtics", score: 89, color: "#007A33", logo: teamLogos.bos },
    markets: { gtl: { yes: 41, no: 59 }, tie: { yes: 17, no: 83 }, ktl: { yes: 63, no: 37 } },
    stats: [
      { label: "Field Goal %", home: 46, away: 51 },
      { label: "Rebounds", home: 38, away: 35 },
      { label: "Assists", home: 19, away: 24 },
      { label: "3PT %", home: 34, away: 41 },
      { label: "Turnovers", home: 11, away: 8 },
    ],
  },
  statsNfl: {
    league: "NFL",
    variant: 1,
    period: "Q2",
    clock: "08:42",
    home: { abbr: "KC", name: "Chiefs", score: 17, color: "#E31837", logo: teamLogos.kc },
    away: { abbr: "SF", name: "49ers", score: 14, color: "#B3995D", logo: teamLogos.sf },
    markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 64, no: 36 } },
    stats: [
      { label: "Total Team Yards", home: 214, away: 186 },
      { label: "Pass Yards", home: 151, away: 129 },
      { label: "Rush Yards", home: 63, away: 57 },
      { label: "Possession Time", home: "11:46", away: "09:32", homeMetric: 706, awayMetric: 572 },
      { label: "Turnovers", home: 0, away: 1 },
    ],
  },
  pregame: {
    league: "NFL",
    variant: 5,
    period: "Q1",
    clock: "14:22",
    waiting: true,
    message: "Markets open when a team takes the lead.",
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: teamLogos.dalNfl },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: teamLogos.phi },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 64, no: 36 }, ktl: { yes: 50, no: 50 } },
    stats: [
      { label: "Total Team Yards", home: 341, away: 352 },
      { label: "Pass Yards", home: 246, away: 258 },
      { label: "Rush Yards", home: 95, away: 94 },
      { label: "Possession Time", home: "28:42", away: "29:04", homeMetric: 1722, awayMetric: 1744 },
      { label: "Turnovers", home: 2, away: 1 },
    ],
  },
  countdown: {
    league: "NFL",
    variant: 5,
    period: "Starts in",
    clock: "9:59",
    countdown: true,
    waiting: true,
    message: "Markets open when the game starts.",
    home: { abbr: "DAL", name: "Cowboys", score: 0, color: "#003594", logo: teamLogos.dalNfl },
    away: { abbr: "PHI", name: "Eagles", score: 0, color: "#004C54", logo: teamLogos.phi },
    markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 50, no: 50 }, ktl: { yes: 50, no: 50 } },
    stats: [
      { label: "Total Team Yards", home: 0, away: 0 },
      { label: "Pass Yards", home: 0, away: 0 },
      { label: "Rush Yards", home: 0, away: 0 },
      { label: "Possession Time", home: "00:00", away: "00:00", homeMetric: 0, awayMetric: 0 },
      { label: "Turnovers", home: 0, away: 0 },
    ],
  },
  paused: {
    league: "NFL",
    variant: 3,
    period: "Q3",
    clock: "11:05",
    recalc: true,
    message: "Trading paused. Recalculating markets.",
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: teamLogos.buf },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: teamLogos.mia },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 58, no: 42 } },
    stats: [
      { label: "Total Team Yards", home: 288, away: 264 },
      { label: "Pass Yards", home: 201, away: 188 },
      { label: "Rush Yards", home: 87, away: 76 },
      { label: "Possession Time", home: "17:38", away: "16:17", homeMetric: 1058, awayMetric: 977 },
      { label: "Turnovers", home: 1, away: 1 },
    ],
  },
  openPositions: {
    league: "NFL",
    variant: 3,
    period: "Q3",
    clock: "11:05",
    home: { abbr: "BUF", name: "Bills", score: 24, color: "#00338D", logo: teamLogos.buf },
    away: { abbr: "MIA", name: "Dolphins", score: 20, color: "#008E97", logo: teamLogos.mia },
    markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 58, no: 42 } },
    stats: [
      { label: "Total Team Yards", home: 288, away: 264 },
      { label: "Pass Yards", home: 201, away: 188 },
      { label: "Rush Yards", home: 87, away: 76 },
      { label: "Possession Time", home: "17:38", away: "16:17", homeMetric: 1058, awayMetric: 977 },
      { label: "Turnovers", home: 1, away: 1 },
    ],
  },
  final: {
    league: "NBA",
    variant: 2,
    period: "Final",
    clock: "",
    final: true,
    message: "Game final. Winning contracts have settled.",
    home: { abbr: "NYK", name: "Knicks", score: 98, color: "#F58426", logo: teamLogos.ny },
    away: { abbr: "BOS", name: "Celtics", score: 104, color: "#007A33", logo: teamLogos.bos },
    markets: { gtl: { yes: 0, no: 100 }, tie: { yes: 0, no: 100 }, ktl: { yes: 100, no: 0 } },
    stats: [
      { label: "Field Goal %", home: 46, away: 51 },
      { label: "Rebounds", home: 38, away: 35 },
      { label: "Assists", home: 19, away: 24 },
      { label: "3PT %", home: 34, away: 41 },
      { label: "Turnovers", home: 11, away: 8 },
    ],
  },
};

const flatDocViews = {
  home: flatDocs.home,
  waitlist: {
    title: "Waitlist Page",
    description: "Public launch landing page, email validation, submission progress, and confirmed early-access states.",
    groups: [{ title: "Waitlist States", frames: [
      { label: "Default", type: "waitlist", mode: "default" },
      { label: "Email Validation Error", type: "waitlist", mode: "error" },
      { label: "Joining the Waitlist", type: "waitlist", mode: "joining" },
      { label: "Early Access Confirmed", type: "waitlist", mode: "confirmed" },
      { label: "Share With Friends", type: "waitlist", mode: "sharing" },
    ] }],
  },
  welcome: flatDocs.welcome,
  game: flatDocs.game,
  portfolio: {
    ...flatDocs.tracker,
    title: "Portfolio Page",
    description: "Wallet page variants for portfolio stats, orders, settled history, order detail, loading, and empty states.",
  },
  fees: {
    title: "Fees Page",
    description: "Pricing, trading-fee, payout, and settlement explanation with the conditional Continue Bet return control.",
    groups: [{ title: "Fees States", frames: [
      { label: "Default", type: "fees", mode: "default" },
      { label: "Continue Bet", type: "fees", mode: "continueBet" },
    ] }],
  },
  login: {
    title: "Login Page",
    description: "Two mutually exclusive login implementations are retained for product selection. Choose one production route and remove the other before build handoff.",
    groups: [
      { title: "Implementation Decision — Choose One", frames: [
        { label: "Variation 1 — Email and Password", type: "auth", mode: "signin" },
        { label: "Variation 2 — Passwordless Phone", type: "auth", mode: "phoneLogin" },
      ] },
      { title: "Variation 2 Supporting Step", frames: [
        { label: "Phone verification", type: "auth", mode: "phoneLoginVerify" },
      ] },
      { title: "Variation 1 Recovery", frames: [
        { label: "Forgot password", type: "auth", mode: "forgot" },
        { label: "Reset password", type: "auth", mode: "reset" },
      ] },
      { title: "Shared Feedback Requirements", frames: [
        { label: "Loading state", type: "auth", mode: "loading" },
        { label: "Error state", type: "auth", mode: "error" },
      ] },
    ],
  },
  registration: {
    title: "Registration Page",
    description: "Current and phone-first account creation flows, including phone verification and eligibility consent.",
    groups: [
      { title: "Registration states", frames: [
        { label: "Create account", type: "auth", mode: "register" },
        { label: "Name and birthday", type: "auth", mode: "registerDetails" },
        { label: "Add phone number", type: "auth", mode: "phone" },
        { label: "Phone verification", type: "auth", mode: "verify" },
        { label: "Create password", type: "auth", mode: "registerPassword" },
        { label: "Phone-first registration", type: "auth", mode: "phoneSignup" },
        { label: "Phone-first details", type: "auth", mode: "phoneSignupDetails" },
      ] },
    ],
  },
  contact: {
    title: "Contact Page",
    description: "Support request form, topic selection, validation, and successful-submission confirmation.",
    groups: [{ title: "Contact States", frames: [
      { label: "Default Form", type: "contact", mode: "default" },
      { label: "Topic Selector Open", type: "contact", mode: "topicOpen" },
      { label: "Validation Errors", type: "contact", mode: "error" },
      { label: "Message Sent", type: "contact", mode: "success" },
    ] }],
  },
  location: {
    title: "Location Unavailable Page",
    description: "The signed-out location eligibility state linked from the mobile navigation menu.",
    groups: [{ title: "Location state", frames: [{ label: "Location unavailable", type: "location", mode: "default" }] }],
  },
  ranking: {
    title: "Ranking Page",
    description: "Authenticated and public monthly leaderboards, month selection, archived rankings, and every completed-competition result outcome.",
    groups: [
      { title: "Leaderboard States", frames: [
        { label: "Signed Out", type: "ranking", mode: "signedOut" },
        { label: "Signed-Out Month Selector", type: "ranking", mode: "signedOutMonths" },
        { label: "Current Month", type: "ranking", mode: "current" },
        { label: "Month Selector Open", type: "ranking", mode: "months" },
        { label: "Historical Month Selected", type: "ranking", mode: "historical" },
      ] },
      { title: "Completed Competition Results", frames: [
        { label: "Outside Top 10", type: "ranking", mode: "resultOutside" },
        { label: "Inside Top 10", type: "ranking", mode: "resultWinner" },
        { label: "Top 3", type: "ranking", mode: "resultTopThree" },
      ] },
    ],
  },
  rules: {
    title: "Monthly Competition Rules Page",
    description: "Official rules, legal notices, eligibility, prize schedule, verification, integrity, and administrative terms.",
    groups: [{ title: "Published Rules", frames: [{ label: "Monthly Competition Rules", type: "rules", mode: "default" }] }],
  },
  drawer: flatDocs.drawer,
  account: { ...flatDocs.account, title: "Profile & Settings Page" },
  access: {
    title: "Access Gate Page",
    description: "Internal private-preview passphrase gate. This is prototype access control, not production authentication.",
    groups: [{ title: "Access States", frames: [
      { label: "Enter Passphrase", type: "access", mode: "default" },
      { label: "Incorrect Passphrase", type: "access", mode: "invalid" },
    ] }],
  },
};
const individualHomeView = {
  title: "Home",
  description: "Primary entry point for live NFL markets, account context, open positions and NBA-interest capture.",
  groups: [
    { title: "Unauthenticated variants", frames: [
      { label: "Logged out default", type: "home", mode: "guest" },
    ] },
    { title: "Authenticated variants", frames: [
      { label: "With open positions", type: "home", mode: "positions" },
      { label: "No open positions", type: "home", mode: "logged" },
    ] },
    { title: "NBA variants", frames: [
      { label: "NBA markets coming soon", type: "home", mode: "nba" },
      { label: "NBA interest selected", type: "home", mode: "nbaInterested" },
      { label: "NBA not for me selected", type: "home", mode: "nbaNotForMe" },
    ] },
    { title: "Edge-case variants", frames: [
      { label: "No live games", type: "home", mode: "noLive" },
      { label: "Loading", type: "home", mode: "loading" },
      { label: "Service error", type: "home", mode: "error" },
    ] },
  ],
};
const individualPageDocumentation = {
  waitlist: {
    title: "Waitlist",
    implementation: "<code>waitlist.html</code>, <code>waitlist.css</code>, <code>waitlist.js</code>",
    purpose: "Acquire launch-interest emails on a public NFL-season landing page while explaining the product, markets, and monthly competition.",
    states: "Default, invalid email, joining progress modal, confirmed early-access modal, and Share With Friends modal.",
    contract: ["Keep the page publicly accessible without the private-preview gate.", "Use one email field and preserve the same join action in the fixed header, hero, and final CTA.", "Show validation inline before any request; show progress while saving and confirmation only after success.", "The animated game card and confirmation effects must respect reduced-motion preferences."],
    validation: "Confirm the production waitlist endpoint, consent/privacy copy, duplicate-email behavior, retry policy, launch season copy, and analytics events.",
    guides: [
      { title: "Page Anatomy", items: ["Fixed waitlist header with brand, Join Waitlist, and Home.", "Launch hero with NFL-season pill, email capture, and three trust benefits.", "Promise cards, interactive game-market preview, monthly-ranking preview, final CTA, and compact footer.", "Submission feedback is a page-level modal with joining, confirmed, and sharing phases."] },
      { title: "Submission Contract", items: ["Validate with the browser email rules before opening progress.", "Disable repeat submission and retain the submitted destination while the request is active.", "On success mark the form complete and expose Share with Friends; on failure close progress, restore the form, and show a scoped retry message.", "The share action advances to the URL-copy phase; Backdrop and Escape dismiss only after the request has resolved, never while the save is indeterminate."] },
    ],
  },
  welcome: {
    title: "Welcome",
    implementation: "<code>welcome.html</code>",
    purpose: "Post-account-creation completion state where the user claims welcome credits by creating a username.",
    states: "Combined welcome reward and username form, required username validation, format validation, and successful submission to Home.",
    contract: ["Keep the approved welcome heading and credit display.", "Username appears on the ‘You’re officially in’ screen; there is no separate username page.", "Start Betting completes the flow and claims welcome credits."],
    validation: "Confirm username availability rules and whether welcome-credit claiming is retryable.",
  },
  game: {
    title: "Game",
    implementation: "<code>game.html</code>",
    purpose: "Present one live game as a complete trading surface: navigation context, status and score, GTL/TIE/KTL prices, market statistics, game statistics, and any positions held in that game.",
    states: "Open live market, scheduled countdown, waiting for first lead, transient price recalculation, final result, open game positions, Market Stats selected, Game Stats selected, and future licensed-logo references.",
    contract: [
      "Resolve the game from the id query parameter and fall back safely when the identifier is absent or unknown.",
      "Render league and Regular Season above the status; derive Live, QTR Time, and Final from normalized feed fields rather than visual inference.",
      "Treat GTL, TIE, and KTL as separate markets whose Yes/No values are complementary and whose interaction carries game, market, side, and prices into the trading drawer.",
      "Use no-logo abbreviation marks with full team names for the current implementation. Licensed-logo references use NFL assets with initials beneath them.",
      "On mobile/tablet expose one statistics panel through the equal-width toggle. On desktop hide the toggle and show Market Stats followed by Game Stats.",
      "Keep paused, waiting, and final markets non-interactive; disabling the button must not remove the explanatory state or last meaningful context.",
    ],
    validation: "Before production integration, map provider statuses to countdown, active, quarter-time, recalculating, waiting-for-lead, and final explicitly; confirm settlement timing and licensed-logo availability independently.",
    guides: [
      {
        title: "Page Anatomy",
        items: [
          "Floating global header, followed by a game-scoped back link whose label reflects Home or Portfolio when available.",
          "Scorecard: league/season, normalized status, home and away identity, score, leader emphasis, and team-colour gradient.",
          "Markets: Yes/Market/No header and fixed GTL, TIE, KTL row order, followed by contextual help or a blocking status.",
          "Game positions: a mobile/tablet bottom-bar control and dismissible panel, or a persistent inline panel below markets on desktop.",
          "Statistics: Market Book and Order Flow, then Score Worm and five league-specific comparison rows.",
        ],
      },
      {
        title: "Data Contract",
        items: [
          "Game identity: id, league, period/status, clock, and optional scheduled-start or pause metadata.",
          "Each team: name, abbreviation, score, brand colour, and an optional licensed logo with an abbreviation fallback.",
          "Each market: GTL, TIE, and KTL with integer-cent Yes/No prices; reject or flag payloads whose pair does not total 100.",
          "Game Stats: ordered league-specific metrics plus numeric comparison values for bar scaling; possession retains display and numeric values.",
        ],
      },
      {
        title: "Responsive Contract",
        items: [
          "Mobile (390 reference): stacked scorecard, markets, equal-width stats toggle, and one visible stats panel with 20px content gutters.",
          "Tablet (768 reference): same stacked information architecture, wider scorecard spacing, 704px content maximum, and single-column statistic cards.",
          "Desktop (1180 reference): sticky 40% left trading column, flowing right statistics column, page-level team gradient, no stats toggle, and both panels visible.",
          "The documentation frame must emulate these breakpoints explicitly because its host viewport is desktop-sized.",
        ],
      },
      {
        title: "Interaction and Accessibility",
        items: [
          "Price buttons need market and side context, a disabled state during blocking conditions, and a visible focus treatment when interactive.",
          "Stats controls use role=tab, aria-selected, aria-controls, and matching panels; hidden panels must be removed from the accessibility tree.",
          "Status colour is supplementary: text must always identify countdown, period, quarter time, recalculation, waiting, or final.",
          "Charts require concise accessible names or equivalent textual values; team artwork uses empty image alt text because the surrounding mark supplies the name.",
        ],
      },
      {
        title: "State and Update Rules",
        items: [
          "Apply score, clock, status, and all three price pairs from one coherent feed snapshot to avoid mixed-state rendering.",
          "During recalculation, preserve the last stable snapshot, disable trading, and replace prices atomically when the new snapshot arrives.",
          "Do not locally promote waiting/countdown/final states from score or clock guesses; transition only from explicit normalized service state.",
          "Preserve the selected statistics view across ordinary live updates, but initialize Market Stats when entering a game on mobile/tablet.",
        ],
      },
      {
        title: "Failure and Fallback Rules",
        items: [
          "Unknown or missing ids fall back to the first available game in the current prototype; production should use an explicit not-found strategy.",
          "Logo failures fall back to abbreviation marks with no layout shift. Current production remains the no-logo treatment.",
          "Stale or failed market data must disable trading and state why; never leave visually valid prices actionable after freshness expires.",
          "If statistics are unavailable, retain score and market functionality and provide a scoped statistics empty/error state rather than failing the page.",
        ],
      },
    ],
  },
  ranking: {
    title: "Ranking",
    implementation: "<code>ranking.html</code>",
    purpose: "Present the public monthly competition, private customer position, archived month results, and the correct post-reset outcome for every prize tier.",
    states: "Signed out, signed-out month selector, authenticated current month, authenticated month selector, historical month selected, outside-top-ten result, inside-top-ten winner, and top-three winner.",
    contract: ["Render Rank, Player, Balance, and Prize as the four stable table columns with tabular numerals.", "Expose customer ranks only after authentication; an outside-top-ten customer uses the separate highlighted row, while a top-ten customer replaces the matching leaderboard row.", "Month selection must replace the complete result set atomically and preserve one selected option.", "Result dialogs are shown once after reset; the Close button is a standalone sibling at the bottom safe area, never nested inside the modal body."],
    validation: "Confirm archived-month availability, tied-rank ordering, result-modal once-only persistence, and reward-fulfillment values against the production ranking service.",
    guides: [
      { title: "Page Anatomy", items: ["Floating global header above the gradient competition hero and reset countdown.", "Centered month selector and four-column top-ten leaderboard.", "Optional authenticated customer row below a divider when the rank is outside positions 1–10.", "Competition-summary rules and the Official Rules route below the leaderboard."] },
      { title: "Month and Authentication Rules", items: ["Build available months from the current calendar month backwards and display them newest-first.", "Signed-out month options say ‘Sign in to view’ and never leak historical customer ranks.", "Selecting a month updates the label, selected option, top ten, and customer placement from the same archived result.", "Click-away and Escape close the selector without changing the active month."] },
      { title: "Completed Result Rules", items: ["Outside Top 10: rank and next-month encouragement only; no prize, medal, or celebration.", "Positions 4–10: show the exact prize and celebration, without a podium medal.", "Positions 1–3: show prize, celebration, rank medal, and the top-three modal offset.", "The dimming backdrop, dialog, celebration layer, and bottom Close control are separate siblings with explicit stacking order."] },
      { title: "Accessibility and Responsive Contract", items: ["Use table, row, columnheader, and cell semantics; label the highlighted row as the customer’s rank.", "Use a listbox with aria-expanded and exactly one aria-selected option for month selection.", "The result uses aria-modal and is dismissible with Close, backdrop click, or Escape; decorative celebration layers stay hidden from assistive technology.", "At narrow widths retain all four columns, compact typography and gutters, and keep the standalone Close button above the device safe area."] },
    ],
  },
  rules: {
    title: "Monthly Competition Rules",
    implementation: "<code>rules.html</code>, <code>rules.css</code>",
    purpose: "Publish the authoritative legal terms for the recurring GTL Monthly Prize Competition and its $5,000 prize schedule.",
    states: "One published long-form rules document containing 13 numbered sections and the prize table.",
    contract: ["Preserve the no-purchase notice, free-credit disclaimer, numbered section order, and full prize schedule.", "Use semantic headings, ordered lists, table headers, caption, and readable long-form line lengths.", "Back should honor valid same-origin history and otherwise return to Home.", "Legal placeholders must be resolved before publication; design documentation does not convert draft language into approved legal copy."],
    validation: "Blocking legal review: replace every bracketed entity, state, URL, payment, email, and date placeholder; confirm Eligible States, dispute terms, tax language, and winner-list process.",
    guides: [
      { title: "Content Contract", items: ["The document covers Sponsor, period, eligibility, entry, winner determination, prizes, verification, conduct, integrity, publicity, privacy, general terms, and winners list.", "The prize table must total $5,000 and remain consistent with Ranking and result dialogs.", "Rules active at the start of a competition govern that competition; avoid silent mid-period replacement.", "Last-updated metadata and legal-entity ownership must be visible at the document end."] },
      { title: "Responsive and Accessibility", items: ["Keep the reading column at approximately 760px on desktop and reduce number gutters on mobile.", "Allow the prize table to scroll horizontally without clipping rank or prize cells.", "Do not communicate legal emphasis by colour alone; retain strong text and semantic structure.", "Footer Official Rules is the current page and all in-product competition summaries route here."] },
    ],
  },
  portfolio: {
    title: "Portfolio",
    implementation: "<code>wallet.html</code>",
    purpose: "Expose available credits, open positions, pending orders, settled activity and position actions.",
    states: "Empty, open, winning, losing, conflicting positions, sell preview, loading and service error.",
    contract: ["Use the current credit balance as the shared balance source.", "Buy More and Sell retain the originating game, market and side.", "Financial values use tabular numerals and explicit positive/negative styling."],
    validation: "Confirm whether pending and settled orders require pagination or server-side filtering.",
  },
  fees: {
    title: "Fees",
    implementation: "<code>fees.html</code>, <code>fees.css</code>",
    purpose: "Explain contract pricing, the 2% trading fee, potential payout, profit calculation, and automatic settlement.",
    states: "Default standalone article and conditional Continue Bet return control when opened from an active order.",
    contract: ["State the 2% fee and $0.01 minimum consistently with every Buy/Sell order summary.", "Explain the 1¢–99¢ contract range and $1.00/$0.00 settlement outcomes without implying guaranteed profit.", "Only show Continue Bet when valid serialized bet context exists.", "Returning to a bet must restore the originating game, market, side, price mode, and valid draft values."],
    validation: "Confirm whether the fee applies independently to buys and sells, rounding order, fee caps, void/refund treatment, and whether the current 2% language is production-approved.",
    guides: [{ title: "Continue Bet Contract", items: ["Persist only the minimum non-sensitive draft context needed to reconstruct the order.", "Validate game and market freshness before reopening the drawer.", "Hide the floating control when context is absent, expired, invalid, or belongs to a settled game.", "Team artwork is decorative; the visible Continue Bet label remains the accessible action name."] }],
  },
  login: {
    title: "Login",
    implementation: "<code>login.html</code>, <code>login-v2.html</code>, <code>forgot.html</code>",
    purpose: "Document the two competing login implementations accurately so product can select one production route and engineering can remove the rejected route.",
    states: "Decision between variation 1 email/password and variation 2 passwordless phone; phone verification; password recovery; reset password; loading; and validation error.",
    contract: ["Do not ship both first-party login variations or expose the prototype-switch links in production.", "Keep Google and Apple available in either variation unless provider scope changes independently.", "Disable submission until the selected route’s required input is valid and expose loading, field, service, expiry, and rate-limit feedback.", "If variation 1 is selected, retain Forgot Password and Reset Password. If variation 2 is selected, remove those password routes and retain phone verification, resend, expiry, and Back behavior."],
    validation: "Blocking product decision: select variation 1 (email/password) or variation 2 (passwordless phone). Then delete the rejected page, its switch link, unreachable handlers, and route-specific recovery or verification states.",
    decision: {
      title: "Production Login Route Must Be Selected",
      status: "Decision Required",
      summary: "login.html and login-v2.html are alternative prototypes, not two login methods to expose together. Pick one implementation before development is considered complete.",
      options: [
        { title: "Variation 1 — Email and Password", source: "login.html", items: ["Email and password credentials plus Google and Apple.", "Requires Forgot Password, reset-link delivery, token validation, and new-password screens.", "Remove login-v2.html and all passwordless phone-login challenge handlers if selected."] },
        { title: "Variation 2 — Passwordless Phone", source: "login-v2.html", items: ["Phone number, SMS challenge, eight-digit verification, Google, and Apple.", "Requires code expiry, resend throttling, attempt limits, paste handling, and SMS delivery errors.", "Remove password login, Forgot Password, Reset Password, and their handlers if selected."] },
      ],
    },
    guides: [
      { title: "Shared Page Contract", items: ["Close returns to the originating safe page; successful authentication returns to the preserved destination.", "Keep visible labels, autocomplete attributes, focus order, inline errors, and a single primary action.", "Social authentication is independent of the first-party credential decision and must surface cancellation and provider errors.", "Never retain passwords or verification codes after completion, cancellation, expiry, or route change."] },
      { title: "Decision Cleanup", items: ["Delete the rejected HTML route rather than leaving a hidden prototype in production.", "Remove both prototype-switch links so customers cannot move between incompatible flows.", "Remove unreachable event handlers, storage keys, recovery or challenge endpoints, and automated tests belonging only to the rejected route.", "Update Login links across Home, account gates, registration, and recovery to target the selected route only."] },
    ],
  },
  registration: {
    title: "Registration",
    implementation: "<code>signup.html</code>, <code>signup-v2.html</code>",
    purpose: "Email-first and phone-first account creation, identity details, eligibility, verification, password and consent.",
    states: "Create account, name and birthday, phone entry, phone verification, password, phone-first registration and phone-first details.",
    contract: ["Phone verification precedes account completion.", "Use one date-of-birth field and require Terms acceptance.", "Username selection remains on the Welcome page."],
    validation: "Confirm the production registration route and social-provider behaviour.",
  },
  contact: {
    title: "Contact",
    implementation: "<code>contact.html</code>, <code>contact.css</code>, contact handlers in <code>app.js</code>",
    purpose: "Collect structured support and product-feedback requests and provide a traceable submission confirmation.",
    states: "Default form, topic listbox open, field validation errors, and successful submission with reference number.",
    contract: ["Collect name, email, one controlled topic, and a message of no more than 1,000 characters.", "Keep topic selection keyboard-operable as a combobox/listbox and expose the current character count.", "Show errors adjacent to fields and preserve valid input after failed validation or service errors.", "On success replace the form with destination email, reference number, and Send Another Message."],
    validation: "Confirm the support delivery endpoint, service-error state, required/optional field policy, SLA copy, reference format, retention, spam protection, and privacy basis.",
    guides: [{ title: "Submission and Accessibility", items: ["Topics are Account support, Gameplay or markets, Monthly competition, Product feedback, and Something else.", "Escape and click-away close the topic menu without clearing selection.", "Announce success through the status region and move focus to it after submission.", "Do not place customer-entered message content into analytics or client logs."] }],
  },
  location: {
    title: "Location",
    implementation: "<code>location-unavailable.html</code>",
    purpose: "Explain eligibility and availability when GTL cannot be used from the customer’s current location.",
    states: "Signed-out location unavailable.",
    contract: ["Keep the restriction explanation visible without requiring authentication.", "Provide a clear route back to the available signed-out experience.", "Do not imply that changing account settings can bypass location eligibility."],
    validation: "Confirm the production location-service error and retry behaviour.",
  },
  drawer: {
    title: "Buy / Sell",
    implementation: "Trading drawer in <code>game.html</code> and <code>wallet.html</code>",
    purpose: "Market and limit order entry for buying and selling contracts, including confirmation and feedback.",
    states: "Buy market, buy limit, sell market, sell limit, maximum price, insufficient balance, invalid price, pending confirmation, success and error.",
    contract: ["Retain the originating game, market and side throughout the order flow.", "Use the shared balance and fee calculation in every order summary.", "Paused markets remain non-interactive and validation appears before confirmation."],
    validation: "Confirm whether the transaction cap is calculated before or after fees.",
  },
  account: {
    title: "Profile & Settings",
    implementation: "<code>profile.html</code> and account-management views",
    purpose: "Profile and account management for password, Google and Apple accounts, username editing and protected actions.",
    states: "Password profile, edit username, Google profile, Apple profile, signed-out protection, betting controls and account deletion.",
    contract: ["Show provider-specific account details without exposing unavailable password actions.", "Require authentication before profile or account-management content is shown.", "Keep destructive account deletion visually and semantically distinct."],
    validation: "Confirm re-authentication and retention requirements for account deletion.",
  },
  access: {
    title: "Access Gate",
    implementation: "<code>index.html</code> and local <code>gate.config.js</code>",
    purpose: "Restrict casual access to the private prototype before routing an approved reviewer to Home.",
    states: "Enter passphrase and incorrect passphrase.",
    contract: ["Mark the page noindex/nofollow and keep the passphrase configuration out of source control.", "Successful entry sets the session gate and routes to Home; invalid entry clears the field, shows the inline error, and restores focus.", "Password visibility must update its accessible label.", "This client-side gate must never be represented as security for sensitive or production information."],
    validation: "Decide whether the deployed prototype needs real server-side access control. If not, remove this page and every session-gate redirect before production launch.",
  },
};
const flatDocOrder = ["home", "waitlist", "welcome", "game", "ranking", "rules", "portfolio", "fees", "login", "registration", "contact", "location", "drawer", "account", "access"];
const flatDocTabLabels = {
  home: "Home",
  waitlist: "Waitlist",
  welcome: "Welcome",
  game: "Game",
  ranking: "Ranking",
  rules: "Monthly Competition Rules",
  portfolio: "Portfolio",
  fees: "Fees",
  login: "Login",
  registration: "Registration",
  contact: "Contact",
  location: "Location",
  drawer: "Buy / Sell",
  account: "Profile & Settings",
  access: "Access Gate",
};
let activeFlatDevice = "mobile";
let activeFlatDoc = "home";

function gameScoreboard(g, useLogos = false) {
  const lead = g.home.score === g.away.score ? null : g.home.score > g.away.score ? "home" : "away";
  const compactScore = String(g.home.score).length >= 3 || String(g.away.score).length >= 3;
  const isFinal = Boolean(g.final) || /^(final|ft)$/i.test(String(g.period || "").trim());
  const isQuarterTime = !isFinal && !g.clock;
  const clockState = isFinal ? "is-final" : isQuarterTime ? "is-quarter-time" : "is-live";
  const clockLabel = isFinal ? "Final" : isQuarterTime ? "QTR Time" : g.period;
  const team = (side) => {
    const current = g[side];
    const leading = lead === side ? " is-leading" : "";
    const mark = useLogos
      ? `<span class="team-mark gb-logo" aria-label="${current.name}" style="--team-color:${current.color}"><img src="${current.logo}" alt=""><span class="team-mark-abbr">${current.abbr}</span></span>`
      : `<span class="team-mark gb-logo is-fallback" aria-label="${current.abbr}" style="--team-color:${current.color}"><span class="team-mark-abbr">${current.abbr}</span></span>`;
    return `<div class="gb-team${leading}">${mark}<span class="gb-abbr">${useLogos ? current.abbr : current.name}</span></div>`;
  };
  return `<section class="gb${isFinal ? " is-final" : ""}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="gb-glow" aria-hidden="true"></div>
    <div class="container gb-inner">
      <div class="gb-topbar"><span class="gb-back"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Home</span></span></div>
      <div class="gb-score-stack">
        <p class="gb-league">${g.league.toUpperCase()} · Regular Season</p>
        <span class="live-badge game-clock-badge ${clockState}"><span class="game-period${isFinal ? " is-final" : ""}${g.countdown ? " is-countdown" : ""}">${!isFinal && !isQuarterTime ? `<span class="${g.countdown ? "countdown-dot" : "live-dot"}"></span>` : ""}${clockLabel}</span>${!isFinal && !isQuarterTime && g.clock ? `<span class="game-clock tnum${g.countdown ? " is-countdown" : ""}">${g.clock}</span>` : ""}</span>
        <div class="gb-score${compactScore ? " is-compact-score" : ""}">${team("home")}<div class="gb-numbers"><span class="gb-num tnum${lead === "home" ? " is-leading" : ""}">${g.home.score}</span><span class="gb-dash">–</span><span class="gb-num tnum${lead === "away" ? " is-leading" : ""}">${g.away.score}</span></div>${team("away")}</div>
      </div>
    </div>
  </section>`;
}

function gameMarkets(g) {
  const disabled = g.waiting || g.recalc || g.final;
  const row = (label, sub, key) => `<div class="mkt-row">
    <button class="price yes" type="button" tabindex="-1"${disabled ? " disabled" : ""}>${g.waiting ? "–" : `${g.markets[key].yes}¢`}</button>
    <span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span>
    <button class="price no" type="button" tabindex="-1"${disabled ? " disabled" : ""}>${g.waiting ? "–" : `${g.markets[key].no}¢`}</button>
  </div>`;
  return `<section class="container markets${g.recalc ? " is-recalc" : ""}${g.final ? " is-final" : ""}">
    ${g.message ? `<div class="game-recalc"><span class="pause-dot"></span><span>${g.message}</span></div>` : ""}
    <div class="mkt-grid"><div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>${row("GTL", "Get the Lead", "gtl")}${row("TIE", "", "tie")}${row("KTL", "Keep the Lead", "ktl")}</div>
    <p class="bet-help">Tap a price to start your bet.</p>
  </section>`;
}

function gameMomentumPreview(g, useLogos = false, instance = "default") {
  const stats = g.stats || (g.league === "NFL" ? [
    { label: "Total Team Yards", home: 318, away: 286 },
    { label: "Pass Yards", home: 224, away: 201 },
    { label: "Rush Yards", home: 94, away: 85 },
    { label: "Possession Time", home: "17:38", away: "16:17", homeMetric: 1058, awayMetric: 977 },
    { label: "Turnovers", home: 1, away: 2 },
  ] : [
    { label: "Field Goal %", home: 46, away: 51 },
    { label: "Rebounds", home: 38, away: 35 },
    { label: "Assists", home: 19, away: 24 },
    { label: "3PT %", home: 34, away: 41 },
    { label: "Turnovers", home: 11, away: 8 },
  ]);
  const statRow = (s) => {
    const homeMetric = s.homeMetric ?? Number(s.home);
    const awayMetric = s.awayMetric ?? Number(s.away);
    const max = Math.max(homeMetric, awayMetric) || 1;
    return `<div class="stat-block">
      <div class="stat-caption"><span class="stat-val tnum">${s.home}</span><span class="stat-label">${s.label}</span><span class="stat-val tnum">${s.away}</span></div>
      <div class="stat-bar-c">
        <span class="stat-fill-h" style="width:${((homeMetric / max) * 50).toFixed(1)}%"></span>
        <span class="stat-fill-a" style="width:${((awayMetric / max) * 50).toFixed(1)}%"></span>
      </div>
    </div>`;
  };
  const teamMark = (team) => useLogos
    ? `<span class="team-mark stats-logo" aria-label="${team.name}" style="--team-color:${team.color}"><img src="${team.logo}" alt=""><span class="team-mark-abbr">${team.abbr}</span></span>`
    : `<span class="team-mark stats-logo is-fallback" aria-label="${team.abbr}" style="--team-color:${team.color}"><span class="team-mark-abbr">${team.abbr}</span></span>`;
  return `<div class="momentum-grid">
    <div class="momentum-card worm-card">
      <div class="momentum-head"><span>Score Worm</span></div>
      <div class="worm-legend"><span class="worm-key"><i style="background:${g.home.color}"></i>${g.home.abbr} ahead</span><span class="worm-key"><i style="background:${g.away.color}"></i>${g.away.abbr} ahead</span></div>
      <div class="worm-wrap">
        <div class="worm-quarters" aria-hidden="true"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
        <div class="worm-axis" aria-hidden="true"><span>+8</span><span>0</span><span>-8</span></div>
        <span class="worm-mark" style="left:22%"></span><span class="worm-mark" style="left:47%"></span><span class="worm-mark" style="left:72%"></span>
        <svg class="worm-svg" viewBox="0 0 320 132" preserveAspectRatio="none" role="img" aria-label="Score margin over the game, 3 lead changes">
          <defs><linearGradient id="ds-worm-${instance}-${g.home.abbr}-${g.away.abbr}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="132"><stop offset="0" stop-color="${g.home.color}"></stop><stop offset="0.5" stop-color="${g.home.color}"></stop><stop offset="0.5" stop-color="${g.away.color}"></stop><stop offset="1" stop-color="${g.away.color}"></stop></linearGradient></defs>
          <line class="worm-zero" x1="0" y1="66" x2="320" y2="66"></line>
          <path class="worm-line" d="M0 66 L35 58 L70 76 L110 70 L150 50 L190 44 L230 62 L270 82 L320 90" style="stroke:url(#ds-worm-${instance}-${g.home.abbr}-${g.away.abbr})"></path>
        </svg>
      </div>
      <div class="worm-stats"><div class="worm-stat"><strong class="tnum">3</strong><span>Lead Changes</span></div><div class="worm-stat"><strong class="tnum">5</strong><span>Ties</span></div></div>
    </div>
    <div class="momentum-card stats-card">
      <div class="stats-teams">${teamMark(g.home)}<span class="stats-title">Game Stats</span>${teamMark(g.away)}</div>
      <div class="stat-list">${stats.map(statRow).join("")}</div>
    </div>
  </div>`;
}

function gameStatsPreview(g, activePanel = "market", useLogos = false, instance = "default") {
  const waiting = !!g.waiting;
  const marketActive = activePanel !== "game";
  const gameActive = activePanel === "game";
  const bid = Math.max(2, g.markets.gtl.yes - 1);
  const ask = Math.min(98, g.markets.gtl.yes + 1);
  const asks = [
    { price: ask + 3, size: 890, pct: 58 },
    { price: ask + 2, size: 1040, pct: 68 },
    { price: ask + 1, size: 1260, pct: 82 },
    { price: ask, size: 1510, pct: 100 },
  ];
  const bids = [
    { price: bid, size: 1430, pct: 95 },
    { price: bid - 1, size: 1180, pct: 78 },
    { price: bid - 2, size: 960, pct: 64 },
    { price: bid - 3, size: 760, pct: 50 },
  ];
  const emptyBookRow = `<div class="book-row"><span class="book-price tnum">--</span><span class="book-size tnum">0</span></div>`;
  const bookRow = (level, side) => `<div class="book-row book-${side}">
    <span class="book-depth"><span class="book-depth-fill" style="width:${level.pct}%"></span></span>
    <span class="book-price tnum">${level.price}¢</span>
    <span class="book-size tnum">${level.size.toLocaleString("en-US")}</span>
  </div>`;
  const flow = [
    { label: "Q1", val: waiting ? 0 : 42, pct: waiting ? 6 : 52 },
    { label: "Q2", val: waiting ? 0 : 68, pct: waiting ? 6 : 84 },
    { label: "Q3", val: waiting ? 0 : 57, pct: waiting ? 6 : 70 },
    { label: "Q4", val: waiting ? 0 : 81, pct: waiting ? 6 : 100 },
  ];
  const bets = [
    ["11:58", "GTL", "Yes", g.markets.gtl.yes + 2, 150],
    ["10:42", "TIE", "No", g.markets.tie.no - 1, 250],
    ["09:15", "KTL", "Yes", g.markets.ktl.yes + 4, 100],
    ["08:03", "GTL", "No", g.markets.gtl.no - 3, 300],
    ["06:37", "TIE", "Yes", g.markets.tie.yes + 1, 200],
  ];
  const tabsId = `game-stats-tabs-${instance}`;
  const marketPanelId = `game-market-panel-${instance}`;
  const gamePanelId = `game-stats-panel-${instance}`;
  return `<section class="container stats-section" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <div class="section-head center stats-overall-head"><span class="eyebrow">Stats</span><h2>Inside the game</h2></div>
    <div class="stats-tabs" id="${tabsId}" role="tablist" aria-label="Game statistics views"><button class="stats-tab${marketActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${String(marketActive)}" aria-controls="${marketPanelId}" data-stats-tab="betting" tabindex="-1">Market Stats</button><button class="stats-tab${gameActive ? " is-active" : ""}" type="button" role="tab" aria-selected="${String(gameActive)}" aria-controls="${gamePanelId}" data-stats-tab="game" tabindex="-1">Game Stats</button></div>
    <div class="stats-panel" id="${marketPanelId}" data-stats-panel="betting"${marketActive ? "" : " hidden"}>
    <h3 class="stats-section-label">Market Stats</h3>
    <div class="chart-grid-wrap">
      <article class="chart-card">
        <div class="chart-head"><span>Market Book</span><strong class="tnum">${waiting ? "0¢ / 0¢" : `${bid}¢ / ${ask}¢`}</strong></div>
        <div class="book${waiting ? " is-empty" : ""}">
          <div class="book-side">${waiting ? Array.from({ length: 4 }, () => emptyBookRow).join("") : asks.map((level) => bookRow(level, "ask")).join("")}</div>
          <div class="book-spread"><span>Spread</span><strong class="tnum">${waiting ? "--" : `${ask - bid}¢`}</strong></div>
          <div class="book-side">${waiting ? Array.from({ length: 4 }, () => emptyBookRow).join("") : bids.map((level) => bookRow(level, "bid")).join("")}</div>
        </div>
        ${waiting ? `<p class="market-empty-note">No orders yet. Markets open when a team takes the lead.</p>` : ""}
      </article>
      <article class="chart-card">
        <div class="chart-head"><span>Order Flow</span><strong class="tnum">${waiting ? "0 bets" : `${flow.reduce((sum, item) => sum + item.val, 0)} bets`}</strong></div>
        <div class="flow-bars${waiting ? " is-empty" : ""}">${flow.map((item) => `<span class="flow-bar" style="height:${item.pct}%"><em class="flow-cap tnum">${item.val}</em></span>`).join("")}</div>
        <div class="flow-axis">${flow.map((item) => `<span>${item.label}</span>`).join("")}</div>
        <table class="bets-table">
          <thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead>
          <tbody>${waiting ? `<tr><td colspan="5" class="empty-row">No trades yet</td></tr>` : bets.map(([time, market, side, price, size]) => `<tr><td class="tnum">${time}</td><td>${market}</td><td><span class="side-${side.toLowerCase()}">${side}</span></td><td class="num tnum">${price}¢</td><td class="num tnum">${size}</td></tr>`).join("")}</tbody>
        </table>
      </article>
    </div>
    </div>
    <div class="stats-panel" id="${gamePanelId}" data-stats-panel="game"${gameActive ? "" : " hidden"}>
      <h3 class="stats-section-label">Game Stats</h3>
      ${gameMomentumPreview(g, useLogos, instance)}
    </div>
  </section>`;
}

function gameOpenPositionsPreview() {
  const positions = [
    { market: "Get the Lead", side: "yes", qty: 120, value: "$52.80", result: "+$7.20" },
    { market: "Keep the Lead", side: "no", qty: 80, value: "$33.60", result: "−$8.00" },
    { market: "Tie", side: "no", qty: 60, value: "$48.60", result: "+$4.20" },
  ];
  const cards = positions.map((position) => {
    const up = !position.result.startsWith("−");
    return `<article class="pos-card pos-card--b" style="--home-color:#00338D;--away-color:#008E97">
      <div class="pos-info">
        <div class="ocb-type">${position.market} · <span class="side-${position.side}">${position.side.toUpperCase()}</span></div>
        <div class="ocb-stats">
          <div class="ocb-stat"><span class="ocb-k">Contracts</span><span class="ocb-v tnum">${position.qty}</span></div>
          <div class="ocb-stat"><span class="ocb-k">Value</span><span class="ocb-v tnum">${position.value}</span></div>
          <div class="ocb-stat"><span class="ocb-k">Return</span><span class="ocb-v tnum oc-pnl ${up ? "up" : "down"}">${position.result}</span></div>
        </div>
        <div class="oc-actions"><button class="oc-buy" type="button" tabindex="-1">Buy More</button><button class="oc-sell" type="button" tabindex="-1">Sell</button></div>
      </div>
    </article>`;
  }).join("");
  return `<div class="game-open-position is-preview-open" role="region" aria-label="Your open positions in this game">
    <div class="gop-backdrop" aria-hidden="true"></div>
    <div class="gop-pop"><p class="gop-heading">Game Open Positions</p><div class="hpos-list">${cards}</div></div>
  </div>`;
}

function gameOpenPositionsBar() {
  return `<div class="betbar is-visible ds-gop-betbar"><div class="container betbar-inner"><button class="btn btn-secondary gop-trigger" type="button" aria-expanded="true" tabindex="-1"><span class="gop-open-label">Hide</span><span class="gop-closed-label"><span class="gop-num">3</span> Game Positions</span></button><button class="btn btn-primary betbar-cta" type="button" tabindex="-1">View Bets</button></div></div>`;
}

function renderGameFrame(mode) {
  if (mode === "live" || mode === "liveLogos" || mode === "gameStatsLogos" || mode === "pregame" || mode === "countdown" || mode === "paused" || mode === "openPositions" || mode === "gameStatsNFL" || mode === "final") {
    const useLogos = mode === "liveLogos" || mode === "gameStatsLogos";
    const hasGamePositions = mode === "openPositions";
    const g = mode === "gameStatsNFL" || useLogos ? gameFrameData.statsNfl : gameFrameData[mode];
    const statsPanel = mode === "gameStatsNFL" || mode === "gameStatsLogos" ? "game" : "market";
    const gameColors = `--home-color:${g.home.color};--away-color:${g.away.color}`;
    return `<div class="flat-screen is-game is-game-${mode}">${homeHeader(hasGamePositions, hasGamePositions)}<main><div class="game-layout" style="${gameColors}"><div class="game-col-left" style="${gameColors}"><span class="gb-back gb-back-right" aria-hidden="true">${backIcon}<span>Home</span></span>${gameScoreboard(g, useLogos)}${gameMarkets(g)}${hasGamePositions ? gameOpenPositionsPreview() : ""}</div><div class="game-col-right">${gameStatsPreview(g, statsPanel, useLogos, mode)}</div></div></main>${homeFooter()}${hasGamePositions ? gameOpenPositionsBar() : ""}</div>`;
  }
  let banner = "";
  let markets = flatMarkets(mode === "pregame");
  if (mode === "paused" || mode === "stale") banner = flatStatus("loading", mode === "stale" ? "Refreshing prices" : "Trading paused", mode === "stale" ? "Latest market data is being checked." : "Recalculating markets after score change.");
  if (mode === "error") return `<div class="flat-screen">${flatHeader("GTL", "Game")}${flatStatus("error", "Game unavailable", "Live data could not be loaded.")}${flatNav("Orders")}</div>`;
  const extra = {
    position: `<div class="flat-list">${flatRows(1)}</div>`,
    pending: `<div class="flat-list">${flatRows(1, "pending")}</div>`,
  }[mode] || "";
  return `<div class="flat-screen">${flatHeader("GTL", mode === "pregame" ? "Pregame" : "Q3 11:05")}
    <div class="flat-game-tile" style="--home-color:#00338d;--away-color:#008e97"><div class="flat-score-row"><span class="flat-team"><img src="${teamLogos.buf}" alt=""><strong>BUF</strong></span><span class="flat-score">${mode === "pregame" ? "0 - 0" : "24 - 20"}</span><span class="flat-team"><img src="${teamLogos.mia}" alt=""><strong>MIA</strong></span></div></div>
    ${banner}${markets}${extra}<div class="flat-card"><h3>Inside the game</h3><p>Lead changes, volume, and order flow.</p></div>${flatNav("Orders")}</div>`;
}

const drawerCheckIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const drawerWarnIcon = `<svg class="warn-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4 21 20H3L12 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v5M12 17h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

function drawerScoreboardHTML() {
  return `<div class="bet-scoreboard" data-bet-grab style="--home-color:#00338d;--away-color:#008e97">
    <div class="bs-glow" aria-hidden="true"></div>
    <div class="bs-row">
      <div class="bs-team bs-home is-leading"><img class="bs-logo" src="${teamLogos.buf}" alt="Bills"><div class="bs-meta"><span class="bs-abbr">BUF</span><span class="bs-score tnum">24</span></div></div>
      <div class="bs-center"><span class="bs-period">Q3</span><span class="bs-clock tnum">11:05</span></div>
      <div class="bs-team bs-away"><img class="bs-logo" src="${teamLogos.mia}" alt="Dolphins"><div class="bs-meta"><span class="bs-abbr">MIA</span><span class="bs-score tnum">20</span></div></div>
    </div>
  </div>`;
}

function renderDrawerFrame(mode) {
  return `<div class="flat-screen is-drawer">${renderDrawerSheet(mode)}<span class="btn btn-secondary bet-sheet-close">Close</span></div>`;
}

function renderDrawerSheet(mode, showClose = false) {
  const sell = mode.startsWith("sell") || mode === "confirmSell";
  const limit = mode.toLowerCase().includes("limit") || mode === "invalid";
  const confirmation = mode === "confirmBuy" || mode === "confirmSell";
  const invalid = mode === "invalid";
  const balance = mode === "balance";
  const error = mode === "error";
  const paused = mode === "paused";
  const changeBetType = mode === "changeBetType";
  const conflict = mode === "conflict";
  const quantityMax = mode === "quantityMax";
  const primary = sell ? "Sell" : "Buy";
  const total = sell ? "$37.63" : limit ? "$53.04" : "$65.28";
  const profit = sell ? "$15.12" : limit ? "$46.96" : "$34.72";
  const warning = balance
    ? `<div class="bet-conflict buy-only" role="alert">${drawerWarnIcon}<span><strong>Insufficient balance.</strong> Add funds before placing this bet.</span></div>`
    : error
    ? `<div class="bet-conflict buy-only" role="alert">${drawerWarnIcon}<span><strong>Order failed.</strong> Check the order and try again.</span></div>`
    : conflict
    ? `<div class="bet-conflict buy-only" role="alert">${drawerWarnIcon}<span>You already hold <strong>Get the Lead · NO</strong> in this game — this bet takes the opposite side.</span></div>`
    : "";
  const marketPrice = paused ? "—" : "64¢";
  const purchasePrice = paused ? "—" : total;
  const sheetClass = confirmation ? "bet-sheet is-open is-success" : "bet-sheet is-open";
  const confirmationTitle = sell ? "Place Sale?" : "Place Bet?";
  const confirmationCopy = sell
    ? "You have 5 seconds to cancel the sale, or press Blitz Sell to place immediately."
    : "You have 5 seconds to cancel the bet, or press Blitz Buy to place immediately.";

  return `<div class="bet-sheet-backdrop is-open"></div>
    <aside class="${sheetClass}" data-step="1" data-mode="${sell ? "sell" : "buy"}" data-confirmed-market="gtl" data-confirmed-side="yes" data-draft-market="gtl" data-draft-side="yes"${paused ? ` data-trading="paused"` : ""} aria-hidden="false" aria-label="${sell ? "Sell position" : "Place a bet"}">
      ${drawerScoreboardHTML()}
      <div class="bet-sheet-handle" aria-hidden="true"></div>
      <div class="bet-sheet-body">
        <div class="bet-step bet-step-1">
          <div class="sell-only sell-readout"><span class="sell-tag">Get the Lead · <span class="side-yes">YES</span></span><span class="sell-sub"><span>120 Held</span><span aria-hidden="true">·</span><span>Bought at 38¢</span><span aria-hidden="true">·</span><span>Now 64¢</span></span></div>
          ${warning}
          ${paused ? `<div class="trade-pause drawer-trade-pause buy-only" data-buy-main${changeBetType ? " hidden" : ""} role="status"><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div>` : ""}
          <div class="drawer-bet-heading buy-only" data-buy-main${changeBetType ? " hidden" : ""}><strong data-bet-heading>Get the Lead - Yes</strong><button class="limit-toggle" data-change-bet-type type="button">Change</button></div>
          <div class="bet-field contracts-field buy-only" data-buy-main${changeBetType ? " hidden" : ""}><span class="bet-label">Select number of contracts</span><input class="num-input drawer-contract-input${quantityMax ? " is-error" : ""}" data-qty-input type="text" inputmode="numeric" value="${quantityMax ? "1,100" : "100"}" aria-label="Number of contracts" aria-invalid="${quantityMax}"><div class="qty-quick"><button data-qty-set="50" type="button">50</button><button class="${quantityMax ? "" : "is-active"}" data-qty-set="100" type="button">100</button><button data-qty-set="500" type="button">500</button><button data-qty-set="1000" type="button">1,000</button></div><p class="limit-minmax transaction-limit${quantityMax ? " is-error" : ""}" role="alert"${quantityMax ? "" : " hidden"}>The maximum contracts that can be purchased in one bet is 1,000.</p><p class="qty-total"${quantityMax ? "" : " hidden"}>Total contracts after purchase — <strong>1,250</strong></p></div>
          <div class="bet-field contracts-field sell-only"><span class="bet-label">Contracts to sell</span><input class="num-input" data-sell-qty-input type="text" inputmode="numeric" value="60" aria-label="Contracts to sell"><div class="qty-quick q3"><button data-sell-pct="25" type="button">25%</button><button class="is-active" data-sell-pct="50" type="button">50%</button><button data-sell-pct="100" type="button">All</button></div></div>
          <div class="drawer-bet-editor buy-only" data-bet-type-editor${changeBetType ? "" : " hidden"}>
            <div class="bet-field"><span class="bet-label">Bet type</span><div class="seg seg-3" role="group" aria-label="Bet type"><button class="is-active" data-market="gtl" type="button">GTL</button><button data-market="tie" type="button">TIE</button><button data-market="ktl" type="button">KTL</button></div></div>
            <div class="bet-field drawer-pick-side"><span class="bet-label">Pick a side</span><div class="bet-toggle" data-active="yes" role="group" aria-label="Side"><button class="bt-opt yes is-active" data-contract="yes" type="button"><span class="bt-side">Yes</span><span class="bt-price tnum" data-yes-price>64¢</span></button><button class="bt-opt no" data-contract="no" type="button"><span class="bt-side">No</span><span class="bt-price tnum" data-no-price>36¢</span></button></div></div>
          </div>
          <div class="bet-field drawer-price-mode buy-only" data-buy-main${changeBetType ? " hidden" : ""}><span class="bet-label">Order price</span><div class="seg drawer-price-toggle" role="group" aria-label="Order price"><button class="${limit ? "" : "is-active"}" data-price-mode="market" type="button">Market <strong class="tnum" data-market-price>${marketPrice}</strong></button><label class="drawer-price-option${limit ? " is-active" : ""}${invalid ? " is-error" : ""}" data-price-mode="limit"><span>Set Limit</span><span class="drawer-limit-entry" data-limit-entry${limit ? "" : " hidden"}><input data-limit-input type="text" inputmode="numeric" maxlength="3" value="${invalid ? "104" : limit ? "52" : ""}" placeholder="–" aria-label="Limit price in cents"><span aria-hidden="true">¢</span></span></label></div><p class="limit-minmax${invalid ? " is-error" : ""}" data-limit-minmax${limit ? "" : " hidden"}>${invalid ? "Maximum limit price is 64¢" : "Min 1¢ · Max 64¢"}</p></div>
          <div class="bet-highlight buy-only drawer-purchase${paused ? " is-paused" : ""}" data-buy-main${changeBetType ? " hidden" : ""}><span class="bet-label">Purchase price</span><span class="bet-total-big tnum" data-total-big>${purchasePrice}</span><p class="potential-win">Potential profit of <strong data-profit-big>${profit}</strong> <span>after <a href="#" class="fees-link">fees</a></span></p></div>
          <div class="bet-highlight sell-only"><span class="bet-label">You receive</span><span class="bet-total-big tnum">$37.63</span><p class="potential-win">Realised profit of <strong>$15.12</strong> <span>after <a href="#" class="fees-link">fees</a></span></p></div>
        </div>
        <div class="bet-step bet-step-2">
          <div class="bet-field"><span class="bet-label">Order summary</span><div class="summary"><div class="summary-row"><span>Contract price</span><strong>${limit ? "52¢" : "64¢"}</strong></div><div class="summary-row"><span>Contracts</span><strong>${sell ? "60" : "100"}</strong></div><div class="summary-row"><span>Subtotal</span><strong>${sell ? "$38.40" : total}</strong></div><div class="summary-row"><span>Trading fee</span><strong>${sell ? "$0.77" : "$1.28"}</strong></div><div class="summary-row total"><span>${sell ? "You receive" : "Total to pay"}</span><strong>${sell ? "$37.63" : "$65.28"}</strong></div></div></div>
          <div class="bet-field"><span class="bet-label">Potential gain</span><div class="summary"><div class="summary-row"><span>Potential payout</span><strong>${sell ? "$60.00" : "$100.00"}</strong></div><div class="summary-row"><span>Potential profit</span><strong>${profit}</strong></div><div class="summary-row"><span>Fees</span><strong>${sell ? "$0.77" : "$1.28"}</strong></div><div class="summary-row total"><span>Net potential gain</span><strong>${sell ? "$37.63" : "$33.44"}</strong></div></div></div>
        </div>
      </div>
      <footer class="bet-sheet-footer"><button class="bet-secondary" data-breakdown${changeBetType ? " data-type-return" : ""} type="button">${changeBetType ? "Return" : "See Details"}</button><button class="bet-secondary" data-bet-back type="button">Back</button><button class="btn btn-primary bet-primary" data-bet-primary${changeBetType ? " data-type-confirm" : ""} type="button"${paused || invalid || changeBetType || quantityMax ? " disabled" : ""}>${changeBetType ? "Confirm Bet Type" : primary}</button></footer>
      <div class="bet-success">
        <div class="success-content"><div class="bet-success-head"><span class="bet-countdown-clock" role="timer" aria-live="polite" aria-label="5 seconds remaining"><strong>5</strong></span><h3 class="bet-success-title">${confirmationTitle}</h3><p class="bet-success-sub">${confirmationCopy}</p></div><div class="bet-field"><span class="bet-label">Order summary</span><div class="summary"><div class="summary-row"><span>Bet Type</span><strong>Get the Lead YES</strong></div><div class="summary-row"><span>Contract price</span><strong>64¢</strong></div><div class="summary-row"><span>Contracts</span><strong>${sell ? "60" : "100"}</strong></div><div class="summary-row"><span>Subtotal</span><strong>${sell ? "$38.40" : "$64.00"}</strong></div><div class="summary-row"><span>Trading fee</span><strong>${sell ? "$0.77" : "$1.28"}</strong></div><div class="summary-row total"><span>${sell ? "You receive" : "Total to pay"}</span><strong>${sell ? "$37.63" : "$65.28"}</strong></div></div></div></div><div class="success-actions"><button class="bet-secondary cancel-bet" type="button">${sell ? "Cancel Sale" : "Cancel Bet"}</button><button class="btn btn-primary success-close" type="button">${sell ? "Blitz Sell" : "Blitz Buy"}</button></div>
      </div>
    </aside>
    ${showClose ? `<button class="btn btn-secondary bet-sheet-close ds-preview-close" type="button">Close</button>` : ""}`;
}

const walletGames = {
  "kc-sf": { league: "NFL", period: "Q2", clock: "08:42", home: { abbr: "KC", score: 17, logo: teamLogos.kc, color: "#E31837" }, away: { abbr: "SF", score: 14, logo: teamLogos.sf, color: "#B3995D" }, markets: { gtl: { yes: 38, no: 62 }, tie: { yes: 22, no: 78 }, ktl: { yes: 64, no: 36 } } },
  "den-dal": { league: "NBA", period: "Q4", clock: "01:33", home: { abbr: "DEN", score: 102, logo: teamLogos.den, color: "#FEC524" }, away: { abbr: "DAL", score: 99, logo: teamLogos.dal, color: "#00538C" }, markets: { gtl: { yes: 33, no: 67 }, tie: { yes: 26, no: 74 }, ktl: { yes: 71, no: 29 } } },
  "ny-bos": { league: "NBA", period: "Q4", clock: "05:18", home: { abbr: "NYK", score: 84, logo: teamLogos.ny, color: "#F58426" }, away: { abbr: "BOS", score: 89, logo: teamLogos.bos, color: "#007A33" }, markets: { gtl: { yes: 41, no: 59 }, tie: { yes: 17, no: 83 }, ktl: { yes: 63, no: 37 } } },
  "buf-mia": { league: "NFL", period: "Q3", clock: "11:05", home: { abbr: "BUF", score: 24, logo: teamLogos.buf, color: "#00338D" }, away: { abbr: "MIA", score: 20, logo: teamLogos.mia, color: "#008E97" }, markets: { gtl: { yes: 44, no: 56 }, tie: { yes: 19, no: 81 }, ktl: { yes: 58, no: 42 } } },
  "lal-gs": { league: "NBA", period: "Q3", clock: "03:42", home: { abbr: "LAL", score: 58, logo: "../gtl-app/assets/logos/nba-lal.png", color: "#552583" }, away: { abbr: "GSW", score: 61, logo: "../gtl-app/assets/logos/nba-gs.png", color: "#1D428A" }, markets: { gtl: { yes: 47, no: 53 }, tie: { yes: 28, no: 72 }, ktl: { yes: 55, no: 45 } } },
  "dal-phi": { league: "NFL", period: "Q4", clock: "02:14", home: { abbr: "DAL", score: 0, logo: teamLogos.dalNfl, color: "#003594" }, away: { abbr: "PHI", score: 0, logo: teamLogos.phi, color: "#004C54" }, markets: { gtl: { yes: 50, no: 50 }, tie: { yes: 64, no: 36 }, ktl: { yes: 50, no: 50 } } },
};

const walletUser = {
  balance: 248.5,
  positions: [
    { gameId: "kc-sf", market: "gtl", side: "yes", qty: 150, avg: 31, date: "2026-07-06" },
    { gameId: "den-dal", market: "gtl", side: "no", qty: 90, avg: 60, date: "2026-07-05" },
    { gameId: "ny-bos", market: "ktl", side: "yes", qty: 100, avg: 70, date: "2026-07-06" },
  ],
  pending: [
    { gameId: "kc-sf", market: "tie", side: "no", qty: 200, limit: 22, date: "2026-07-07" },
    { gameId: "den-dal", market: "ktl", side: "yes", qty: 75, limit: 44, date: "2026-07-06" },
  ],
  settled: [
    { gameId: "buf-mia", market: "gtl", side: "yes", qty: 100, avg: 45, result: "win", net: 54.1, date: "2026-06-28" },
    { gameId: "lal-gs", market: "ktl", side: "yes", qty: 60, avg: 55, result: "loss", net: -33, date: "2026-06-25" },
    { gameId: "kc-sf", market: "gtl", side: "no", qty: 80, avg: 40, result: "win", net: 41.2, date: "2026-06-30" },
    { gameId: "ny-bos", market: "gtl", side: "yes", qty: 50, avg: 62, result: "loss", net: -31, date: "2026-06-22" },
    { gameId: "den-dal", market: "ktl", side: "no", qty: 120, avg: 48, result: "win", net: 66.4, date: "2026-07-01" },
    { gameId: "dal-phi", market: "tie", side: "no", qty: 90, avg: 78, result: "win", net: 19.8, date: "2026-06-29" },
    { gameId: "buf-mia", market: "ktl", side: "yes", qty: 40, avg: 52, result: "loss", net: -20.8, date: "2026-06-20" },
  ],
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

const walletMarketLabels = { gtl: "Get the Lead", tie: "Tie", ktl: "Keep the Lead" };
const walletChevron = `<svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const walletMoney = (value) => `$${Math.abs(value).toFixed(2)}`;
const walletSigned = (value) => `${value >= 0 ? "+" : "-"}${walletMoney(value)}`;
const walletDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.valueOf()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
const walletTeamMark = (team, className) => `<span class="team-mark ${className} is-fallback" aria-label="${team.abbr}" style="--team-color:${team.color}"><span class="team-mark-abbr">${team.abbr}</span></span>`;

function walletFigures(order) {
  const g = walletGames[order.gameId];
  const cur = g.markets[order.market][order.side];
  const value = (cur / 100) * order.qty;
  const cost = (order.avg / 100) * order.qty;
  return { g, cur, value, cost, pnl: value - cost };
}

function walletOrderRow(order, type, index) {
  const g = walletGames[order.gameId];
  const betType = `${walletMarketLabels[order.market]} · <span class="side-${order.side}">${order.side.toUpperCase()}</span>`;
  let valueHTML = "";
  if (type === "open") {
    const { value, pnl } = walletFigures(order);
    valueHTML = `<span class="or-amount tnum">${walletMoney(value)}</span><span class="or-pnl ${pnl >= 0 ? "up" : "down"} tnum">${walletSigned(pnl)}</span>`;
  } else if (type === "pending") {
    valueHTML = `<span class="or-amount tnum">${walletMoney((order.limit / 100) * order.qty)}</span><span class="or-status">Pending</span>`;
  } else if (type === "cancelled") {
    valueHTML = `<span class="or-amount tnum">${walletMoney((order.limit / 100) * order.qty)}</span><span class="or-status cancelled">Cancelled</span>`;
  } else {
    const win = order.result === "win";
    valueHTML = `<span class="or-pnl ${win ? "up" : "down"} tnum">${walletSigned(order.net)}</span><span class="result-pill ${win ? "win" : "loss"}">${win ? "Won" : "Lost"}</span>`;
  }
  return `<button class="order-row" type="button" tabindex="-1" data-order-open="${type}:${index}" style="--home-color:${g.home.color};--away-color:${g.away.color}">
    <span class="or-logos">${walletTeamMark(g.home, "or-logo")}${walletTeamMark(g.away, "or-logo")}</span>
    <span class="or-main"><span class="or-type">${betType}</span><span class="or-teams">${g.home.abbr} · ${g.away.abbr}${order.date ? ` · ${walletDate(order.date)}` : ""}</span></span>
    <span class="or-value">${valueHTML}</span>
    <span class="or-chev" aria-hidden="true">${walletChevron}</span>
  </button>`;
}

function walletOrderGroup(title, list, type, empty) {
  const rows = list.length ? list.map((order, index) => walletOrderRow(order, type, index)).join("") : `<div class="wallet-empty">${empty}</div>`;
  return `<div class="order-group"><div class="order-group-head"><h2>${title}</h2><span class="count">${list.length}</span></div><div class="order-list${list.length > 5 ? " is-collapsed" : ""}">${rows}</div>${list.length > 5 ? `<button class="order-showall" type="button" tabindex="-1" aria-expanded="false">Show all ${list.length}</button>` : ""}</div>`;
}

function walletStatsHTML(empty = false) {
  const positions = empty ? [] : walletUser.positions;
  const pending = empty ? [] : walletUser.pending;
  const settled = empty ? [] : walletUser.settled;
  const openPnl = positions.reduce((sum, order) => sum + walletFigures(order).pnl, 0);
  const openValue = positions.reduce((sum, order) => sum + walletFigures(order).value, 0);
  const settledNet = settled.reduce((sum, order) => sum + order.net, 0);
  const totalProfit = openPnl + settledNet;
  const totalBets = positions.length + pending.length + settled.length;
  const wins = settled.filter((order) => order.result === "win").length;
  const winRate = settled.length ? Math.round((wins / settled.length) * 100) : 0;
  const stat = (label, value, cls = "") => `<div class="pstat"><span class="pstat-k">${label}</span><span class="pstat-v ${cls} tnum">${value}</span></div>`;
  return `<div class="portfolio-stats">${stat("Total profit", walletSigned(totalProfit), totalProfit >= 0 ? "up" : "down")}${stat("Total bets", totalBets)}${stat("Win rate", `${winRate}%`)}${stat("Open value", walletMoney(openValue))}</div>`;
}

function walletFrameHTML({ tab = "active", empty = false } = {}) {
  const positions = empty ? [] : walletUser.positions;
  const pending = empty ? [] : walletUser.pending;
  const settled = empty ? [] : walletUser.settled;
  const cancelled = empty ? [] : walletUser.cancelled;
  return `<div class="flat-screen is-wallet">${homeHeader(true, !empty)}
    <main class="wallet container">
      <div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your live positions, pending limit orders and settled bets — all in one place.</p></div>
      ${walletStatsHTML(empty)}
      <div class="stats-tabs" id="orderTabs" role="tablist" aria-label="Orders">
        <button class="stats-tab${tab === "active" ? " is-active" : ""}" type="button" role="tab" tabindex="-1" aria-selected="${tab === "active"}">Orders</button>
        <button class="stats-tab${tab === "settled" ? " is-active" : ""}" type="button" role="tab" tabindex="-1" aria-selected="${tab === "settled"}">Settled</button>
      </div>
      <div class="order-panel" data-order-panel="active"${tab === "active" ? "" : " hidden"}>${walletOrderGroup("Current", positions, "open", "No current orders.")}${walletOrderGroup("Pending", pending, "pending", "No pending orders.")}</div>
      <div class="order-panel" data-order-panel="settled"${tab === "settled" ? "" : " hidden"}>${walletOrderGroup("Settled", settled, "settled", "No settled orders yet.")}${walletOrderGroup("Cancelled", cancelled, "cancelled", "No cancelled orders.")}</div>
    </main>
    ${homeFooter("portfolio")}
  </div>`;
}

function walletDetailFrameHTML(type, index) {
  const order = type === "pending" ? walletUser.pending[index] : type === "settled" ? walletUser.settled[index] : walletUser.positions[index];
  const g = walletGames[order.gameId];
  const betType = `${walletMarketLabels[order.market]} · <span class="side-${order.side}">${order.side.toUpperCase()}</span>`;
  let headline = "";
  let rows = "";
  let actions = "";
  if (type === "pending") {
    const value = (order.limit / 100) * order.qty;
    headline = `<span class="od-big tnum">${walletMoney(value)}</span>`;
    rows = `<div class="summary-row"><span>Your bet</span><strong>${betType}</strong></div>
          <div class="summary-row"><span>Status</span><strong><span class="status-chip pending">Pending</span></strong></div>
          <div class="summary-row"><span>Order date</span><strong>${walletDate(order.date)}</strong></div>
          <div class="summary-row"><span>Limit price</span><strong>${order.limit}¢</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row total"><span>Order value</span><strong>${walletMoney(value)}</strong></div>`;
    actions = `<div class="order-actions-dock"><div class="oad-inner"><button class="btn btn-secondary" type="button" tabindex="-1">Edit order</button><button class="btn btn-danger" type="button" tabindex="-1">Cancel order</button></div></div>`;
  } else if (type === "settled") {
    const win = order.result === "win";
    headline = `<span class="od-big ${win ? "up" : "down"} tnum">${walletSigned(order.net)}</span>`;
    rows = `<div class="summary-row"><span>Your bet</span><strong>${betType}</strong></div>
          <div class="summary-row"><span>Status</span><strong><span class="status-chip settled">Settled</span></strong></div>
          <div class="summary-row"><span>Order date</span><strong>${walletDate(order.date)}</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row"><span>Average price</span><strong>${order.avg}¢</strong></div>
          <div class="summary-row total"><span>Net return</span><strong>${walletSigned(order.net)}</strong></div>`;
  } else {
    const { cur, value, cost, pnl } = walletFigures(order);
    const up = pnl >= 0;
    headline = `<span class="od-big tnum">${walletMoney(value)}</span><span class="od-pnl ${up ? "up" : "down"} tnum">${walletSigned(pnl)}</span>`;
    rows = `<div class="summary-row"><span>Your bet</span><strong>${betType}</strong></div>
          <div class="summary-row"><span>Status</span><strong><span class="status-chip open">Current</span></strong></div>
          <div class="summary-row"><span>Order date</span><strong>${walletDate(order.date)}</strong></div>
          <div class="summary-row"><span>Contracts</span><strong>${order.qty}</strong></div>
          <div class="summary-row"><span>Average price</span><strong>${order.avg}¢</strong></div>
          <div class="summary-row"><span>Current price</span><strong>${cur}¢</strong></div>
          <div class="summary-row"><span>Cost basis</span><strong>${walletMoney(cost)}</strong></div>
          <div class="summary-row total"><span>Current value</span><strong>${walletMoney(value)}</strong></div>`;
    actions = `<div class="order-actions-dock"><div class="oad-inner"><button class="btn btn-secondary" type="button" tabindex="-1">Buy More</button><button class="btn btn-primary" type="button" tabindex="-1">Sell</button></div></div>`;
  }
  return `<div class="flat-screen is-wallet is-wallet-detail">${homeHeader(true, true)}
    <main class="wallet container">
      <button class="order-back" type="button" tabindex="-1">${walletChevron}<span>Orders</span></button>
      <div class="order-detail">
        <div class="od-game"><span class="or-logos">${walletTeamMark(g.home, "or-logo")}${walletTeamMark(g.away, "or-logo")}</span><span class="od-game-meta"><span class="od-teams">${g.home.abbr} ${g.home.score} · ${g.away.score} ${g.away.abbr}</span><span class="od-league">${g.league.toUpperCase()} · ${type === "settled" ? "Final" : `${g.period} ${g.clock}`}</span></span></div>
        <div class="od-headline">${headline}</div>
        <div class="summary od-summary">
          ${rows}
        </div>
      </div>
      ${actions}
    </main>
    ${homeFooter("portfolio")}
  </div>`;
}

function renderTrackerFrame(mode) {
  if (mode === "loading") return `<div class="flat-screen is-wallet">${homeHeader(true, true)}<main class="wallet container"><div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your live positions, pending limit orders and settled bets — all in one place.</p></div>${flatLoading()}</main>${homeFooter("portfolio")}</div>`;
  if (mode === "error") return `<div class="flat-screen is-wallet">${homeHeader(true, true)}<main class="wallet container"><div class="wallet-head"><h1>Portfolio</h1><p class="wallet-desc">Your live positions, pending limit orders and settled bets — all in one place.</p></div><div class="wallet-empty wallet-error-state"><strong>Positions unavailable</strong><span>Could not load open exposure.</span><button class="btn btn-secondary" type="button" tabindex="-1">Reload</button></div></main>${homeFooter("portfolio")}</div>`;
  if (mode === "empty") return walletFrameHTML({ empty: true });
  if (mode === "detailCurrent") return walletDetailFrameHTML("open", 0);
  if (mode === "detailPending") return walletDetailFrameHTML("pending", 0);
  if (mode === "detailSettled") return walletDetailFrameHTML("settled", 0);
  return walletFrameHTML({ tab: mode === "settled" ? "settled" : "active" });
}

function accountThemeSwitch() {
  return `<span class="theme-switch-track" aria-hidden="true"><span class="theme-switch-thumb"></span><span class="theme-option theme-sun">☼</span><span class="theme-option theme-moon">☾</span></span>`;
}

function accountProfileHTML({ email, provider, hasPassword, editing = false }) {
  const providerLabel = provider === "google" ? "Google" : provider === "apple" ? "Apple" : "Email and password";
  const providerClass = provider === "google" ? "google" : provider === "apple" ? "apple" : "password";
  const providerMark = provider === "google" ? "G" : provider === "apple" ? "Apple" : "••";
  const idSuffix = `${providerClass}${editing ? "-edit" : ""}`;
  return `<header class="profile-head">
      <h1 class="profile-title">Profile &amp; Settings</h1>
      <p class="profile-intro">Manage your GTL profile, account and preferences.</p>
    </header>
    <section class="profile-section" aria-labelledby="ds-profile-${idSuffix}">
      <h2 class="profile-section-title" id="ds-profile-${idSuffix}">Profile</h2>
      <div class="profile-edit-card">
        ${editing ? `<form class="profile-username-form">
          <div class="profile-username-field"><input class="profile-username-input" type="text" value="alex" aria-label="Username" tabindex="-1" readonly></div>
          <div class="profile-username-actions"><button class="btn btn-primary btn-sm" type="button" tabindex="-1">Save</button><button class="btn btn-secondary btn-sm" type="button" tabindex="-1">Cancel</button></div>
        </form>` : `<div class="profile-username-view">
          <div class="profile-username-copy"><span>Username</span><strong>@alex</strong></div>
          <button class="btn btn-secondary btn-sm" type="button" tabindex="-1">Edit</button>
        </div>`}
      </div>
    </section>
    <section class="profile-section" aria-labelledby="ds-account-${idSuffix}">
      <h2 class="profile-section-title" id="ds-account-${idSuffix}">Account</h2>
      <div class="account-settings-list">
        <div class="account-setting-row"><span>Full name</span><strong>Alex Morgan</strong></div>
        <div class="account-setting-row"><span>Email</span><strong>${email}</strong></div>
        <div class="account-setting-row"><span>Date of birth</span><strong>Not provided</strong></div>
        <div class="account-setting-row"><span>Member since</span><strong>July 2026</strong></div>
        <div class="account-setting-row"><span>Credits</span><span class="account-inline-link">240.50 credits</span></div>
        <div class="account-setting-row"><span>Connected with</span><strong><span class="account-provider ${providerClass}"><span class="account-provider-mark">${providerMark}</span>${providerLabel}</span></strong></div>
        ${hasPassword ? `<div class="account-setting-row"><span>Password</span><span class="account-inline-link">Change password</span></div>` : ""}
      </div>
      ${hasPassword ? "" : `<p class="account-auth-note">Password changes are managed through your ${providerLabel} account.</p>`}
    </section>
    <section class="profile-section" aria-labelledby="ds-preferences-${idSuffix}">
      <h2 class="profile-section-title" id="ds-preferences-${idSuffix}">Preferences</h2>
      <div class="profile-preference-card">
        <div class="profile-preference-copy"><strong>Appearance</strong><span>Switch between light and dark mode.</span></div>
        <button class="profile-theme-control" type="button" tabindex="-1" aria-label="Switch colour theme">${accountThemeSwitch()}</button>
      </div>
      <div class="profile-preference-card">
        <div class="profile-preference-copy"><strong>Notifications</strong><span>Email notification preferences will live here.</span></div>
        <span class="status-pill">Coming soon</span>
      </div>
    </section>
    <section class="profile-section" aria-labelledby="ds-management-${idSuffix}">
      <h2 class="profile-section-title" id="ds-management-${idSuffix}">Account management</h2>
      <div class="account-actions">
        <span class="btn btn-secondary btn-block account-link-button">Betting Controls</span>
        <span class="btn btn-danger btn-block account-link-button">Delete Account</span>
      </div>
    </section>`;
}

function accountSubpageHTML(mode) {
  if (mode === "bettingControls") {
    return `<main class="account-subpage container">
      <span class="account-back"><span aria-hidden="true">←</span>Profile &amp; Settings</span>
      <section class="account-coming-soon">
        <span class="status-pill">Coming soon</span>
        <h1 class="profile-title">Betting Controls</h1>
        <p>Tools to help you manage how you play are being developed. You’ll be able to find them here when they’re ready.</p>
        <span class="btn btn-primary">Back to Profile &amp; Settings</span>
      </section>
    </main>`;
  }
  return `<main class="account-subpage container">
    <span class="account-back"><span aria-hidden="true">←</span>Profile &amp; Settings</span>
    <section class="account-confirm-card">
      <span class="profile-kicker">Account management</span>
      <h1>Delete your account?</h1>
      <p>This permanently removes your GTL profile and signs you out. Your username, account details, positions and competition history will no longer be available.</p>
      <p class="account-confirm-note">This action can’t be undone.</p>
      <div class="account-confirm-actions"><button class="btn account-delete-confirm" type="button" tabindex="-1">Delete Account</button><span class="btn btn-secondary">Cancel</span></div>
    </section>
  </main>`;
}

function renderAccountFrame(mode) {
  if (mode === "bettingControls" || mode === "deleteAccount") {
    return `<div class="flat-screen is-account profile-body">${homeHeader(true)}${accountSubpageHTML(mode)}</div>`;
  }
  if (mode === "signedOut") {
    return `<div class="flat-screen is-account profile-body">${homeHeader(false)}<main class="profile container"><div class="profile-guard"><h1 class="profile-title">Profile &amp; Settings</h1><p>Login to view and manage your account.</p><span class="btn btn-primary">Login</span></div></main>${homeFooter("profile")}</div>`;
  }
  const content = {
    profilePassword: accountProfileHTML({ email: "alex@gtl.test", provider: "password", hasPassword: true }),
    editUsername: accountProfileHTML({ email: "alex@gtl.test", provider: "password", hasPassword: true, editing: true }),
    profileGoogle: accountProfileHTML({ email: "alex.morgan@gmail.com", provider: "google", hasPassword: false }),
    profileApple: accountProfileHTML({ email: "alex@icloud.com", provider: "apple", hasPassword: false }),
  }[mode];
  return `<div class="flat-screen is-account profile-body">${homeHeader(true)}<main class="profile container">${content}</main>${homeFooter("profile")}</div>`;
}

function titleCaseVariantLabel(value) {
  const minorWords = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "the", "to", "vs"]);
  const words = String(value).trim().split(/\s+/);
  return words.map((word, wordIndex) => word.split("-").map((part, partIndex, parts) => {
    const match = part.match(/^([^A-Za-z0-9]*)([A-Za-z0-9]+)([^A-Za-z0-9]*)$/);
    if (!match) return part;
    const [, prefix, core, suffix] = match;
    if (/^[A-Z0-9]{2,}$/.test(core)) return `${prefix}${core}${suffix}`;
    const lower = core.toLowerCase();
    const isFirst = wordIndex === 0 && partIndex === 0;
    const isLast = wordIndex === words.length - 1 && partIndex === parts.length - 1;
    const formatted = minorWords.has(lower) && !isFirst && !isLast
      ? lower
      : `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    return `${prefix}${formatted}${suffix}`;
  }).join("-")).join(" ");
}

function renderVariantDocumentation(frame, label) {
  const documentation = ({ game: gameVariantDocumentation, ranking: rankingVariantDocumentation, auth: authVariantDocumentation }[frame.type] || standaloneVariantDocumentation[frame.type] || {})[frame.mode];
  if (!documentation) return `<div class="flat-frame-label">${label}</div>`;
  const fields = [
    ["Displayed When", documentation.trigger],
    ["What Changes", documentation.changes],
    ["Required Data", documentation.data],
    ["Implementation Behavior", documentation.behavior],
  ];
  return `<details class="flat-frame-doc">
    <summary>
      <span class="flat-frame-label">${label}</span>
      <span class="flat-frame-doc-toggle">View Details</span>
    </summary>
    <div class="flat-frame-doc-body"><p class="flat-frame-doc-summary">${documentation.summary}</p><dl>${fields.map(([term, description]) => `<div><dt>${term}</dt><dd>${description}</dd></div>`).join("")}</dl></div>
  </details>`;
}

function renderFlatFrame(frame, useTitleCase = false) {
  const renderers = {
    auth: renderAuthFrame,
    access: renderAccessFrame,
    waitlist: renderWaitlistFlatlay,
    contact: renderContactFrame,
    fees: renderFeesFrame,
    rules: renderRulesFrame,
    home: renderHomeFrame,
    welcome: renderWelcomeFrame,
    location: renderLocationFrame,
    ranking: renderRankingFrame,
    game: renderGameFrame,
    drawer: renderDrawerFrame,
    tracker: renderTrackerFrame,
    account: renderAccountFrame,
  };
  const screen = renderers[frame.type](frame.mode);
  const label = useTitleCase ? titleCaseVariantLabel(frame.label) : frame.label;
  return `<article class="flat-frame-wrap flat-frame--${frame.type} flat-frame--${frame.type}-${frame.mode}">${renderVariantDocumentation(frame, label)}<div class="flat-phone">${screen}</div></article>`;
}

function renderFlatDocSection(doc) {
  return `<section class="flat-page-group"><div class="flat-doc-head"><h2>${doc.title}</h2><p>${doc.description}</p></div>
    ${doc.groups.map((group) => `<section class="flat-group"><div class="flat-group-title"><h3>${group.title}</h3></div><div class="flat-frame-row">${group.frames.map(renderFlatFrame).join("")}</div></section>`).join("")}</section>`;
}

function hydrateIndividualPageChrome(section) {
  const docKey = section.dataset.individualPage;
  const doc = individualPageDocumentation[docKey];
  if (!doc || docKey === "home") return;

  section.classList.remove("individual-page-doc");
  section.classList.add("ds-restored-page-doc");
  section.innerHTML = `<article class="panel ds-pages-panel ds-individual-page-panel">
    <div class="panel-header">
      <h2>${doc.title}</h2>
      <div class="ds-page-actions">
        <div class="ds-device-toggle" role="group" aria-label="${doc.title} preview device">
          <button class="is-active" type="button" data-individual-device="mobile" aria-pressed="true">Mobile</button>
          <button type="button" data-individual-device="tablet" aria-pressed="false">Tablet</button>
          <button type="button" data-individual-device="desktop" aria-pressed="false">Desktop</button>
        </div>
        <div class="ds-page-zoom" role="group" aria-label="${doc.title} preview zoom controls">
          <button class="ds-icon-btn" type="button" aria-label="Zoom out" data-individual-zoom="out"><span class="material-symbols-outlined" aria-hidden="true">remove</span></button>
          <button class="ds-page-zoom-value" type="button" data-individual-zoom="reset" aria-label="Reset zoom">100%</button>
          <button class="ds-icon-btn" type="button" aria-label="Zoom in" data-individual-zoom="in"><span class="material-symbols-outlined" aria-hidden="true">add</span></button>
        </div>
      </div>
    </div>
    <div class="ds-page-docs"><div class="ds-page-doc-grid">
      <article><span class="ds-doc-label">Purpose</span><p>${doc.purpose}</p><span class="ds-doc-source">${doc.implementation}</span></article>
      <article><span class="ds-doc-label">Required states</span><p>${doc.states}</p></article>
      <article><span class="ds-doc-label">Implementation contract</span><ul>${doc.contract.map((item) => `<li>${item}</li>`).join("")}</ul></article>
      <article class="is-validation"><span class="ds-doc-label">Open validation</span><p>${doc.validation}</p></article>
    </div>
    ${doc.decision ? `<section class="ds-page-decision" aria-label="Implementation decision required"><header><span class="ds-decision-status">${doc.decision.status}</span><h3>${doc.decision.title}</h3><p>${doc.decision.summary}</p></header><div class="ds-page-decision-grid">${doc.decision.options.map((option) => `<article><div class="ds-decision-option-head"><h4>${option.title}</h4><code>${option.source}</code></div><ul>${option.items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</div></section>` : ""}
    ${doc.guides ? `<section class="ds-page-implementation"><header><span class="ds-doc-label">Developer Guide</span><h3>Implementation Details</h3><p>Use these contracts together with the state-specific notes below. The flat lays illustrate output; these rules define when and how that output is produced.</p></header><div class="ds-page-implementation-grid">${doc.guides.map((guide) => `<article><h4>${guide.title}</h4><ul>${guide.items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</div></section>` : ""}
    </div>
    <section class="ds-page-states flat-lay-canvas" data-individual-content data-flat-device="mobile" data-device="mobile" style="--page-zoom: 1;"></section>
  </article>`;
}

function renderIndividualPageSection(section, device = "mobile") {
  const docKey = section.dataset.individualPage;
  const doc = docKey === "home" ? individualHomeView : flatDocViews[docKey];
  const title = docKey === "home" ? "Home" : individualPageDocumentation[docKey]?.title || doc?.title || "Page";
  const content = section.querySelector("[data-individual-content]");
  if (!doc || !content) return;

  const nextDevice = ["mobile", "tablet", "desktop"].includes(device) ? device : "mobile";
  const variantsDescription = docKey === "home"
    ? "All implemented, authenticated, unauthenticated, and edge-case variants for this page are grouped below."
    : docKey === "game"
      ? "Each state includes its trigger, visual delta, required data, and behavior contract so the flat lay can be implemented without inferring rules from the image."
      : docKey === "login"
        ? "The first group contains two mutually exclusive production candidates. Select one, remove the other, then retain only its supporting states plus the shared feedback requirements."
      : "All implemented default, alternate, and edge-case variants for this page are grouped below.";
  content.dataset.flatDevice = nextDevice;
  content.dataset.device = nextDevice;
  content.innerHTML = `<header class="ds-page-states-head"><span class="ds-doc-label">Page Variants</span><h3>${title} Variants</h3><p>${variantsDescription}</p></header>
    ${doc.groups.map((group) => `<section class="flat-group"><div class="flat-group-title"><h3>${titleCaseVariantLabel(group.title)}</h3></div><div class="flat-frame-row">${group.frames.map((frame) => renderFlatFrame(frame, true)).join("")}</div></section>`).join("")}`;

  section.querySelectorAll("[data-individual-device]").forEach((button) => {
    const active = button.dataset.individualDevice === nextDevice;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.setAttribute("aria-pressed", String(active));
  });
}

individualPageSections.forEach(hydrateIndividualPageChrome);

individualPageSections.forEach((section) => {
  section.querySelectorAll("[data-individual-device]").forEach((button) => {
    button.addEventListener("click", () => {
      renderIndividualPageSection(section, button.dataset.individualDevice);
    });
  });
  section.querySelectorAll("[data-individual-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.individualZoom;
      const currentZoom = Number(section.dataset.individualZoom || 1);
      const nextZoom = action === "reset"
        ? 1
        : Math.max(0.5, Math.min(1.5, currentZoom + (action === "in" ? 0.1 : -0.1)));
      section.dataset.individualZoom = String(nextZoom);
      section.querySelector("[data-individual-content]")?.style.setProperty("--page-zoom", String(nextZoom));
      const value = section.querySelector("[data-individual-zoom='reset']");
      if (value) value.textContent = `${Math.round(nextZoom * 100)}%`;
      section.querySelectorAll("[data-individual-zoom]").forEach((control) => {
        const controlAction = control.dataset.individualZoom;
        control.disabled = (controlAction === "out" && nextZoom <= 0.5) || (controlAction === "in" && nextZoom >= 1.5);
      });
    });
  });
  renderIndividualPageSection(section, "mobile");
});

function renderFlatDocTabs() {
  if (!flatDocTabs) return;
  flatDocTabs.innerHTML = flatDocOrder
    .filter((key) => flatDocViews[key])
    .map((key) => {
      const active = key === activeFlatDoc;
      return `<button class="${active ? "is-active" : ""}" type="button" data-flat-doc="${key}" role="tab" aria-selected="${String(active)}">${flatDocTabLabels[key] || flatDocViews[key].title}</button>`;
    })
    .join("");
}

function syncFlatDeviceTabs() {
  const pagesActive = document.getElementById("pages")?.classList.contains("is-active-section");
  flatDeviceTabs.forEach((button) => {
    const active = button.dataset.flatDevice === activeFlatDevice;
    button.classList.toggle("is-device-active", active);
    button.classList.toggle("is-active", Boolean(pagesActive && active));
    button.setAttribute("aria-selected", String(active));
  });
}

function renderFlatDevice(device = activeFlatDevice, docKey = activeFlatDoc) {
  if (!flatLayContent) return;
  activeFlatDevice = ["mobile", "tablet", "desktop"].includes(device) ? device : "mobile";
  activeFlatDoc = flatDocViews[docKey] ? docKey : flatDocOrder.find((key) => flatDocViews[key]) || Object.keys(flatDocViews)[0];
  flatLayContent.dataset.flatDevice = activeFlatDevice;
  flatLayContent.innerHTML = renderFlatDocSection(flatDocViews[activeFlatDoc]);
  renderFlatDocTabs();
  syncFlatDeviceTabs();
}

function closeNavigation() {
  body.classList.remove("nav-open");
}

openNavButton?.addEventListener("click", () => {
  body.classList.add("nav-open");
});

closeNavTarget?.addEventListener("click", closeNavigation);

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href")?.slice(1);
    if (targetId && document.getElementById(targetId)) {
      event.preventDefault();
      showSection(targetId, { updateHash: true });
    }
    closeNavigation();
  });
});

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isOn = toggle.classList.toggle("is-on");
    toggle.setAttribute("aria-pressed", String(isOn));
  });
});

expandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tile = button.closest(".game-tile");
    if (!tile) return;
    const open = tile.classList.toggle("is-open");
    tile.querySelectorAll("[data-expand]").forEach((item) => {
      item.setAttribute("aria-expanded", String(open));
      const label = item.querySelector(".toggle-label");
      if (label) label.textContent = open ? "Hide Bets" : "See Bets";
    });
  });
});

openModalButton?.addEventListener("click", () => {
  if (typeof modal?.showModal === "function") {
    modal.showModal();
  }
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modal?.close();
  });
});

const sections = [...document.querySelectorAll("main section[id]")];
const sectionIds = new Set(sections.map((section) => section.id));

function showSection(sectionId, options = {}) {
  const nextId = sectionIds.has(sectionId) ? sectionId : "overview";

  sections.forEach((section) => {
    const active = section.id === nextId;
    section.hidden = !active;
    section.classList.toggle("is-active-section", active);
  });

  navLinks.forEach((link) => {
    if (link.dataset.flatDevice) {
      link.classList.toggle("is-active", nextId === "pages" && link.dataset.flatDevice === activeFlatDevice);
    } else {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${nextId}`);
    }
  });

  if (options.updateHash && window.location.hash !== `#${nextId}`) {
    history.pushState(null, "", `#${nextId}`);
  }

  window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
}

function sectionFromHash() {
  return window.location.hash.replace("#", "") || "overview";
}

function setPageZoom(nextZoom) {
  pageZoom = Math.max(0.5, Math.min(1.5, Math.round(nextZoom * 100) / 100));
  pagePreview?.style.setProperty("--page-zoom", String(pageZoom));
  if (pageZoomValue) pageZoomValue.textContent = `${Math.round(pageZoom * 100)}%`;

  pageZoomButtons.forEach((button) => {
    const action = button.dataset.pageZoom;
    button.disabled = (action === "out" && pageZoom <= 0.5) || (action === "in" && pageZoom >= 1.5);
  });
}

function pagePreviewSrc(src, authState, params = {}) {
  if (!authState && !Object.keys(params).length) return src;
  const url = new URL(src, window.location.href);
  if (authState) url.searchParams.set("ds-auth", authState);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  const filename = url.pathname.split("/").pop();
  return `../gtl-app/${filename}?${url.searchParams.toString()}`;
}

function setPageFrameMode(compareAuth) {
  pagePreview?.classList.toggle("is-dual", compareAuth);
  pageFrameCards.forEach((card) => {
    card.hidden = !compareAuth && card.dataset.pageFrameCard !== "guest";
  });
}

function gamePreviewSrc(frameMode) {
  const sources = {
    auth: "../gtl-app/game.html?id=kc-sf",
    empty: "../gtl-app/game.html?id=dal-phi",
    guest: "../gtl-app/game.html?id=buf-mia",
  };
  return sources[frameMode] || sources.guest;
}

function loadPagePreview(button) {
  const nextSrc = button.dataset.pageSrc;
  const nextName = button.dataset.pageName || button.textContent?.trim() || "Page";
  const compareAuth = button.dataset.pageCompareAuth === "true";
  const compareGame = button.dataset.pageCompareGame === "true";
  const compareFrames = compareAuth || compareGame;
  if (!nextSrc) return;

  pageTabs.forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  setPageFrameMode(compareFrames);

  pageFrameLabels.forEach((label) => {
    const authLabels = { auth: "Logged in", empty: "No open positions", guest: "Guest" };
    const gameLabels = { auth: "Paused after score change", empty: "Opens after first score", guest: "Live game default" };
    const labelMap = compareGame ? gameLabels : authLabels;
    label.textContent = compareFrames ? labelMap[label.dataset.pageFrameLabel] : nextName;
  });

  pageFrames.forEach((frame) => {
    const frameMode = frame.dataset.pageFrame;
    if (frameMode !== "guest" && !compareFrames) return;
    const authState = frameMode === "guest" ? "guest" : "logged";
    const extraParams = frameMode === "empty" ? { "ds-positions": "empty" } : {};
    frame.src = compareGame
      ? gamePreviewSrc(frameMode)
      : compareAuth
      ? pagePreviewSrc(nextSrc, authState, extraParams)
      : pagePreviewSrc(nextSrc, button.dataset.pageAuth);
    frame.title = compareAuth
      ? `${nextName} ${frameMode === "empty" ? "no open positions" : authState} preview`
      : compareGame
      ? `${nextName} ${frameMode === "auth" ? "paused" : frameMode === "empty" ? "opens after first score" : "live"} preview`
      : `${nextName} page preview`;
  });
  pageFrameOpenLinks.forEach((link) => {
    const frameMode = link.dataset.pageFrameOpen;
    if (frameMode !== "guest" && !compareFrames) return;
    const authState = frameMode === "guest" ? "guest" : "logged";
    const extraParams = frameMode === "empty" ? { "ds-positions": "empty" } : {};
    link.href = compareGame
      ? gamePreviewSrc(frameMode)
      : compareAuth
      ? pagePreviewSrc(nextSrc, authState, extraParams)
      : pagePreviewSrc(nextSrc, button.dataset.pageAuth);
  });
  if (pageTitle) pageTitle.textContent = nextName;
}

function setDrawerView(view) {
  if (!drawerSection) return;
  const nextView = view === "desktop" ? "desktop" : "mobile";
  drawerSection.dataset.drawerViewMode = nextView;

  drawerViewButtons.forEach((button) => {
    const active = button.dataset.drawerView === nextView;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  drawerSection.querySelectorAll(".ds-drawer-panel").forEach((panel) => {
    const isDesktopPanel = Boolean(panel.querySelector(".ds-drawer-desktop"));
    panel.hidden = nextView === "desktop" ? !isDesktopPanel : isDesktopPanel;
  });
}

function renderDrawerComponentStates() {
  if (!drawerSection) return;

  const states = [
    { key: "default", title: "Default Buy", copy: "Current compact buy flow with the selected bet heading, contract quantity, and inline Market or Set Limit order price.", mode: "buyMarket" },
    { key: "change-bet-type", title: "Change Bet Type", copy: "Focused selection state showing only Bet Type and Pick a Side. Confirm remains disabled until the current selection changes.", mode: "changeBetType" },
    { key: "limit-open", title: "Limit Buy", copy: "The entered limit price stays inside the Set Limit control, with its valid range shown directly below.", mode: "buyLimit" },
    { key: "paused", title: "Trading Paused", copy: "Trading status, selected bet heading, disabled pricing, and the Change bet-type path while markets recalculate.", mode: "paused" },
    { key: "conflict", title: "Existing Position Warning", copy: "The compact buy flow with the opposite-position warning shown above the selected bet.", mode: "conflict" },
    { key: "sell", title: "Sell Position", copy: "Current sell flow with position context, quantity shortcuts, proceeds, and the same timed confirmation pattern.", mode: "sellMarket" },
    { key: "confirm-buy", title: "Buy Confirmation", copy: "Five-second cancellation window before a buy is placed, with Cancel Bet and Blitz Buy actions.", mode: "confirmBuy" },
    { key: "confirm-sell", title: "Sell Confirmation", copy: "Five-second cancellation window before a sale is placed, with Cancel Sale and Blitz Sell actions.", mode: "confirmSell" },
  ];

  drawerSection.querySelectorAll(".ds-drawer-state, [data-drawer-state-mount]").forEach((state) => state.remove());
  const viewToggle = drawerSection.querySelector(".ds-drawer-view-toggle");
  viewToggle?.insertAdjacentHTML("afterend", states.map((state) => `
    <div class="ds-drawer-state" data-drawer-state="${state.key}">
      <div class="section-header ds-subsection-header">
        <h2>${state.title}</h2>
        <p>${state.copy}</p>
      </div>
      <div class="grid two ds-drawer-grid">
        <article class="panel ds-drawer-panel">
          <div class="panel-header"><h3>Mobile</h3><span class="tag">Bottom sheet</span></div>
          <div class="ds-drawer-preview ds-drawer-mobile">${renderDrawerSheet(state.mode)}</div>
        </article>
        <article class="panel ds-drawer-panel">
          <div class="panel-header"><h3>Desktop</h3><span class="tag">Modal</span></div>
          <div class="ds-drawer-preview ds-drawer-desktop">${renderDrawerSheet(state.mode, true)}</div>
        </article>
      </div>
    </div>`).join(""));
}

function createLimitOpenDrawerState() {
  if (!drawerSection || drawerSection.querySelector("[data-drawer-state='limit-open']")) return;

  const baseState = drawerSection.querySelector(".ds-drawer-state");
  if (!baseState) return;

  const limitState = baseState.cloneNode(true);
  limitState.dataset.drawerState = "limit-open";

  const heading = limitState.querySelector(".ds-subsection-header h2");
  const copy = limitState.querySelector(".ds-subsection-header p");
  if (heading) heading.textContent = "Limit Open";
  if (copy) copy.textContent = "Buy flow with the limit price control expanded and ready for manual entry.";

  limitState.querySelectorAll(".limit-section").forEach((section) => {
    section.hidden = false;
  });

  limitState.querySelectorAll("[data-limit-toggle]").forEach((button) => {
    button.setAttribute("aria-expanded", "true");
    button.textContent = "Limit Open";
  });

  limitState.querySelectorAll("[data-limit-input]").forEach((input) => {
    input.value = "52";
  });

  limitState.querySelectorAll("[data-limit-minmax]").forEach((line) => {
    line.textContent = "Limit order up to 52¢";
  });

  limitState.querySelectorAll("[data-bet-primary]").forEach((button) => {
    button.textContent = "Place Limit";
  });

  baseState.after(limitState);
}

function createPausedDrawerState() {
  if (!drawerSection || drawerSection.querySelector("[data-drawer-state='paused']")) return;

  const baseState = drawerSection.querySelector(".ds-drawer-state");
  const mount = drawerSection.querySelector("[data-drawer-state-mount='paused']");
  if (!baseState) return;

  const pausedState = baseState.cloneNode(true);
  pausedState.dataset.drawerState = "paused";

  const heading = pausedState.querySelector(".ds-subsection-header h2");
  const copy = pausedState.querySelector(".ds-subsection-header p");
  if (heading) heading.textContent = "Trading Paused";
  if (copy) copy.textContent = "Buy flow while markets are recalculating. Prices and order submission remain unavailable until trading resumes.";

  pausedState.querySelectorAll(".bet-sheet").forEach((sheet) => {
    sheet.dataset.trading = "paused";
    sheet.dataset.confirmedMarket = "gtl";
    sheet.dataset.confirmedSide = "yes";

    const contracts = sheet.querySelector(".contracts-field.buy-only");
    if (contracts) {
      const status = document.createElement("div");
      status.className = "trade-pause drawer-trade-pause";
      status.dataset.pausedMain = "";
      status.setAttribute("role", "status");
      status.innerHTML = `<span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span>`;
      contracts.before(status);

      const betHeading = document.createElement("div");
      betHeading.className = "drawer-bet-heading";
      betHeading.dataset.pausedMain = "";
      betHeading.innerHTML = `<strong data-paused-bet-heading>Get the Lead - Yes</strong><button class="limit-toggle" type="button" data-paused-change>Change</button>`;
      contracts.before(betHeading);

      contracts.dataset.pausedMain = "";
      const qtyInput = contracts.querySelector("[data-qty-input]");
      if (qtyInput) {
        qtyInput.value = "100";
        qtyInput.removeAttribute("placeholder");
        qtyInput.classList.add("drawer-contract-input");
      }
      contracts.querySelectorAll("[data-qty-set]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.qtySet === "100");
      });
    }

    sheet.querySelectorAll(".sell-only, [data-conflict-warning]").forEach((element) => element.remove());

    const betTypeField = sheet.querySelector("[data-market]")?.closest(".bet-field");
    const sideField = sheet.querySelector("[data-contract]")?.closest(".bet-field");
    const editor = document.createElement("div");
    editor.className = "drawer-bet-editor";
    editor.hidden = true;
    if (betTypeField) editor.appendChild(betTypeField);
    if (sideField) editor.appendChild(sideField);
    contracts?.after(editor);

    sideField?.classList.add("drawer-pick-side");
    const sideToggle = sideField?.querySelector(".bet-toggle");
    if (sideToggle) sideToggle.dataset.active = "yes";

    sideField?.querySelectorAll("[data-contract]").forEach((button) => {
      button.disabled = false;
      button.classList.toggle("is-active", button.dataset.contract === "yes");
      const price = button.querySelector(".bt-price");
      if (price) price.textContent = "–";
    });

    const limitToggle = sideField?.querySelector("[data-limit-toggle]");
    limitToggle?.remove();
    sideField?.querySelector("[data-limit-section]")?.remove();

    const priceMode = document.createElement("div");
    priceMode.className = "bet-field drawer-price-mode";
    priceMode.dataset.pausedMain = "";
    priceMode.innerHTML = `<span class="bet-label">Order price</span><div class="seg seg-2 drawer-price-toggle" role="group" aria-label="Order price"><button class="is-active" type="button" data-paused-price-mode="market">Market <strong>–</strong></button><label class="drawer-price-option" data-paused-price-mode="limit"><span>Set Limit</span><span class="drawer-limit-entry" data-paused-limit-entry hidden><input data-paused-limit-input type="text" inputmode="numeric" maxlength="3" placeholder="–" aria-label="Limit price in cents"><span aria-hidden="true">¢</span></span></label></div>`;

    const purchase = sheet.querySelector(".bet-highlight.buy-only");
    purchase?.classList.add("drawer-purchase", "is-paused");
    purchase?.setAttribute("data-paused-main", "");
    const purchasePrice = purchase?.querySelector("[data-total-big]");
    if (purchasePrice) purchasePrice.textContent = "–";
    purchase?.before(priceMode);

    const primary = sheet.querySelector("[data-bet-primary]");
    if (primary) primary.disabled = true;
    sheet.querySelector("[data-bet-back]")?.remove();
  });

  if (mount) {
    mount.replaceWith(pausedState);
  } else {
    const limitState = drawerSection.querySelector("[data-drawer-state='limit-open']");
    (limitState || baseState).after(pausedState);
  }
}

const pausedDrawerMarketLabels = { gtl: "Get the Lead", tie: "Tie", ktl: "Keep the Lead" };

function syncPausedBetEditor(sheet, market, side) {
  sheet.querySelectorAll(".drawer-bet-editor [data-market]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.market === market);
  });
  sheet.querySelectorAll(".drawer-bet-editor [data-contract]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.contract === side);
  });
  const sideToggle = sheet.querySelector(".drawer-bet-editor .bet-toggle");
  if (sideToggle) sideToggle.dataset.active = side;
}

function setDrawerBetEditorOpen(sheet, open, commit = false) {
  const editor = sheet.querySelector("[data-bet-type-editor]");
  const secondary = sheet.querySelector("[data-breakdown]");
  const primary = sheet.querySelector("[data-bet-primary]");
  if (!editor || !secondary || !primary) return;

  if (open) {
    sheet.dataset.draftMarket = sheet.dataset.confirmedMarket || "gtl";
    sheet.dataset.draftSide = sheet.dataset.confirmedSide || "yes";
  } else if (commit) {
    sheet.dataset.confirmedMarket = sheet.dataset.draftMarket;
    sheet.dataset.confirmedSide = sheet.dataset.draftSide;
    const heading = sheet.querySelector("[data-bet-heading]");
    if (heading) {
      heading.textContent = `${pausedDrawerMarketLabels[sheet.dataset.confirmedMarket]} - ${sheet.dataset.confirmedSide === "yes" ? "Yes" : "No"}`;
    }
  }

  syncPausedBetEditor(
    sheet,
    open ? sheet.dataset.draftMarket : sheet.dataset.confirmedMarket,
    open ? sheet.dataset.draftSide : sheet.dataset.confirmedSide,
  );
  sheet.querySelectorAll("[data-buy-main]").forEach((element) => { element.hidden = open; });
  editor.hidden = !open;
  secondary.textContent = open ? "Return" : "See Details";
  secondary.toggleAttribute("data-type-return", open);
  primary.textContent = open ? "Confirm Bet Type" : "Buy";
  primary.toggleAttribute("data-type-confirm", open);
  primary.disabled = open;
}

function updateDrawerTypeConfirm(sheet) {
  const primary = sheet.querySelector("[data-type-confirm]");
  if (!primary) return;
  primary.disabled = sheet.dataset.draftMarket === sheet.dataset.confirmedMarket
    && sheet.dataset.draftSide === sheet.dataset.confirmedSide;
}

function setPausedBetEditorOpen(sheet, open, restoreSelection = true) {
  const editor = sheet.querySelector(".drawer-bet-editor");
  const secondary = sheet.querySelector("[data-breakdown]");
  const primary = sheet.querySelector("[data-bet-primary]");
  if (!editor || !secondary || !primary) return;

  if (open) {
    sheet.dataset.draftMarket = sheet.dataset.confirmedMarket;
    sheet.dataset.draftSide = sheet.dataset.confirmedSide;
    syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
  } else if (restoreSelection) {
    syncPausedBetEditor(sheet, sheet.dataset.confirmedMarket, sheet.dataset.confirmedSide);
  }

  sheet.querySelectorAll("[data-paused-main]").forEach((element) => { element.hidden = open; });
  editor.hidden = !open;
  secondary.textContent = open ? "Return" : "See Details";
  secondary.toggleAttribute("data-paused-return", open);
  primary.textContent = open ? "Confirm Bet Type" : "Buy";
  primary.toggleAttribute("data-paused-confirm", open);
  primary.disabled = true;
}

function updatePausedConfirmState(sheet) {
  const primary = sheet.querySelector("[data-paused-confirm]");
  if (!primary) return;
  primary.disabled = sheet.dataset.draftMarket === sheet.dataset.confirmedMarket && sheet.dataset.draftSide === sheet.dataset.confirmedSide;
}

function money(value) {
  return `$${Math.max(0, value).toFixed(2)}`;
}

function numberFromInput(input, fallback = 0) {
  const value = Number(String(input?.value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : fallback;
}

function centsFromText(text, fallback = 0) {
  const value = Number(String(text || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : fallback;
}

function setText(root, selector, value) {
  const target = root.querySelector(selector);
  if (target) target.textContent = value;
}

function updateDrawerPreview(sheet) {
  if (sheet.dataset.trading === "paused") return;

  const mode = sheet.dataset.mode || "buy";
  const activePrice = sheet.querySelector(".bt-opt.is-active [class*='price']");
  const limitOption = sheet.querySelector("[data-price-mode='limit'].is-active");
  const enteredLimit = numberFromInput(sheet.querySelector("[data-limit-input]"));
  const marketPrice = centsFromText(activePrice?.textContent, centsFromText(sheet.querySelector("[data-yes-price]")?.textContent, 64));
  const price = limitOption && enteredLimit ? enteredLimit : marketPrice;
  const buyQty = numberFromInput(sheet.querySelector("[data-qty-input]"), 100);
  const sellQty = numberFromInput(sheet.querySelector("[data-sell-qty-input]"), 60);
  const qty = mode === "sell" ? sellQty : buyQty;
  const subtotal = qty * (price / 100);
  const fee = subtotal * 0.02;
  const payout = qty;
  const buyTotal = subtotal + fee;
  const buyProfit = payout - buyTotal;
  const sellReceive = subtotal - fee;
  const realized = sellReceive - (qty * 0.38);

  setText(sheet, "[data-total-big]", money(buyTotal));
  setText(sheet, "[data-profit-big]", money(buyProfit));
  setText(sheet, "[data-receive-big]", money(sellReceive));
  setText(sheet, "[data-realized-big]", money(realized));
  setText(sheet, "[data-s-price]", `${price}\u00A2`);
  setText(sheet, "[data-s-qty]", String(qty));
  setText(sheet, "[data-s-subtotal]", money(subtotal));
  setText(sheet, "[data-s-fee]", money(fee));
  setText(sheet, "[data-s-total]", mode === "sell" ? money(sellReceive) : money(buyTotal));
  setText(sheet, "[data-g-payout]", money(payout));
  setText(sheet, "[data-g-profit]", mode === "sell" ? money(realized) : money(buyProfit));
  setText(sheet, "[data-g-fees]", money(fee));
  setText(sheet, "[data-g-net]", mode === "sell" ? money(sellReceive) : money(buyProfit - fee));
}

function syncDrawerPreviewPrices(sheet, market) {
  const prices = {
    gtl: { yes: 64, no: 36 },
    tie: { yes: 18, no: 82 },
    ktl: { yes: 71, no: 29 },
  }[market];
  if (!prices) return;

  setText(sheet, "[data-yes-price]", `${prices.yes}\u00A2`);
  setText(sheet, "[data-no-price]", `${prices.no}\u00A2`);
}

drawerSection?.addEventListener("click", (event) => {
  const preview = event.target.closest(".ds-drawer-preview");
  if (!preview) return;

  const sheet = preview.querySelector(".bet-sheet");
  if (!sheet) return;

  const link = event.target.closest("a[href='#']");
  if (link) {
    event.preventDefault();
    return;
  }

  if (event.target.closest("[data-change-bet-type]")) {
    setDrawerBetEditorOpen(sheet, true);
    return;
  }

  if (event.target.closest("[data-type-return]")) {
    setDrawerBetEditorOpen(sheet, false);
    return;
  }

  if (event.target.closest("[data-type-confirm]")) {
    setDrawerBetEditorOpen(sheet, false, true);
    return;
  }

  const editorMarket = event.target.closest("[data-bet-type-editor] [data-market]");
  if (editorMarket) {
    sheet.dataset.draftMarket = editorMarket.dataset.market;
    syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
    syncDrawerPreviewPrices(sheet, sheet.dataset.draftMarket);
    updateDrawerTypeConfirm(sheet);
    return;
  }

  const editorSide = event.target.closest("[data-bet-type-editor] [data-contract]");
  if (editorSide) {
    sheet.dataset.draftSide = editorSide.dataset.contract;
    syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
    updateDrawerTypeConfirm(sheet);
    return;
  }

  const orderPriceMode = event.target.closest("[data-price-mode]");
  if (orderPriceMode) {
    const group = orderPriceMode.closest(".drawer-price-toggle");
    const isLimit = orderPriceMode.dataset.priceMode === "limit";
    group?.querySelectorAll("[data-price-mode]").forEach((option) => {
      option.classList.toggle("is-active", option === orderPriceMode);
      if (!isLimit || option === orderPriceMode) option.classList.remove("is-error");
    });
    const entry = sheet.querySelector("[data-limit-entry]");
    const line = sheet.querySelector("[data-limit-minmax]");
    if (entry) entry.hidden = !isLimit;
    if (line) line.hidden = !isLimit;
    if (isLimit) requestAnimationFrame(() => entry?.querySelector("[data-limit-input]")?.focus());
    updateDrawerPreview(sheet);
    return;
  }

  if (sheet.dataset.trading === "paused") {
    if (event.target.closest("[data-paused-change]")) {
      setPausedBetEditorOpen(sheet, true);
      return;
    }

    if (event.target.closest("[data-paused-return]")) {
      setPausedBetEditorOpen(sheet, false, true);
      return;
    }

    if (event.target.closest("[data-paused-confirm]")) {
      sheet.dataset.confirmedMarket = sheet.dataset.draftMarket;
      sheet.dataset.confirmedSide = sheet.dataset.draftSide;
      const heading = sheet.querySelector("[data-paused-bet-heading]");
      if (heading) heading.textContent = `${pausedDrawerMarketLabels[sheet.dataset.confirmedMarket]} - ${sheet.dataset.confirmedSide === "yes" ? "Yes" : "No"}`;
      setPausedBetEditorOpen(sheet, false, false);
      return;
    }

    const editorMarket = event.target.closest(".drawer-bet-editor [data-market]");
    if (editorMarket) {
      sheet.dataset.draftMarket = editorMarket.dataset.market;
      syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
      updatePausedConfirmState(sheet);
      return;
    }

    const editorSide = event.target.closest(".drawer-bet-editor [data-contract]");
    if (editorSide) {
      sheet.dataset.draftSide = editorSide.dataset.contract;
      syncPausedBetEditor(sheet, sheet.dataset.draftMarket, sheet.dataset.draftSide);
      updatePausedConfirmState(sheet);
      return;
    }

    const priceMode = event.target.closest("[data-paused-price-mode]");
    if (priceMode) {
      const group = priceMode.parentElement;
      group?.querySelectorAll("[data-paused-price-mode]").forEach((button) => button.classList.toggle("is-active", button === priceMode));
      const entry = sheet.querySelector("[data-paused-limit-entry]");
      const isLimit = priceMode.dataset.pausedPriceMode === "limit";
      if (entry) entry.hidden = !isLimit;
      if (isLimit) requestAnimationFrame(() => entry?.querySelector("[data-paused-limit-input]")?.focus());
      return;
    }
  }

  const marketButton = event.target.closest("[data-market]");
  if (marketButton) {
    marketButton.parentElement?.querySelectorAll("[data-market]").forEach((button) => {
      button.classList.toggle("is-active", button === marketButton);
    });
    syncDrawerPreviewPrices(sheet, marketButton.dataset.market);
    updateDrawerPreview(sheet);
    return;
  }

  const contractButton = event.target.closest("[data-contract]");
  if (contractButton) {
    const group = contractButton.closest(".bet-toggle");
    group?.querySelectorAll("[data-contract]").forEach((button) => {
      button.classList.toggle("is-active", button === contractButton);
    });
    if (group) group.dataset.active = contractButton.dataset.contract;
    updateDrawerPreview(sheet);
    return;
  }

  const qtyButton = event.target.closest("[data-qty-set]");
  if (qtyButton) {
    const input = sheet.querySelector("[data-qty-input]");
    if (input) input.value = qtyButton.dataset.qtySet;
    qtyButton.parentElement?.querySelectorAll("[data-qty-set]").forEach((button) => {
      button.classList.toggle("is-active", button === qtyButton);
    });
    updateDrawerPreview(sheet);
    return;
  }

  const sellPctButton = event.target.closest("[data-sell-pct]");
  if (sellPctButton) {
    const held = 120;
    const pct = Number(sellPctButton.dataset.sellPct || 0);
    const input = sheet.querySelector("[data-sell-qty-input]");
    if (input) input.value = String(Math.round((held * pct) / 100));
    sellPctButton.parentElement?.querySelectorAll("[data-sell-pct]").forEach((button) => {
      button.classList.toggle("is-active", button === sellPctButton);
    });
    updateDrawerPreview(sheet);
    return;
  }

  const limitButton = event.target.closest("[data-limit-toggle]");
  if (limitButton) {
    const section = sheet.querySelector("[data-limit-section]");
    const expanded = section?.hidden;
    if (section) section.hidden = !expanded;
    limitButton.setAttribute("aria-expanded", String(Boolean(expanded)));
    return;
  }

  const stepButton = event.target.closest("[data-breakdown], [data-bet-back]");
  if (stepButton) {
    sheet.dataset.step = stepButton.hasAttribute("data-breakdown") ? "2" : "1";
  }
});

drawerSection?.addEventListener("input", (event) => {
  const pausedLimitInput = event.target.closest("[data-paused-limit-input]");
  if (pausedLimitInput) {
    const value = pausedLimitInput.value.replace(/[^0-9]/g, "").slice(0, 3);
    pausedLimitInput.value = value;
    return;
  }

  const pausedQtyInput = event.target.closest("[data-qty-input]");
  if (pausedQtyInput?.closest(".bet-sheet")?.dataset.trading === "paused") {
    pausedQtyInput.value = pausedQtyInput.value.replace(/[^0-9]/g, "");
    pausedQtyInput.closest(".contracts-field")?.querySelectorAll("[data-qty-set]").forEach((button) => button.classList.remove("is-active"));
    return;
  }

  const limitInput = event.target.closest("[data-limit-input]");
  if (limitInput) {
    limitInput.value = limitInput.value.replace(/[^0-9]/g, "").slice(0, 3);
    const sheet = limitInput.closest(".bet-sheet");
    const value = Number(limitInput.value || 0);
    const valid = value >= 1 && value <= 64;
    const option = limitInput.closest("[data-price-mode='limit']");
    const line = sheet?.querySelector("[data-limit-minmax]");
    option?.classList.toggle("is-error", !valid);
    line?.classList.toggle("is-error", !valid);
    if (line) line.textContent = valid ? "Min 1¢ · Max 64¢" : "Maximum limit price is 64¢";
    const primary = sheet?.querySelector("[data-bet-primary]");
    if (primary) primary.disabled = !valid;
    if (sheet) updateDrawerPreview(sheet);
    return;
  }

  const input = event.target.closest("[data-qty-input], [data-sell-qty-input]");
  if (!input) return;
  const sheet = input.closest(".bet-sheet");
  if (sheet) updateDrawerPreview(sheet);
});

drawerViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setDrawerView(button.dataset.drawerView);
  });
});

pageTabs.forEach((button) => {
  button.addEventListener("click", () => {
    loadPagePreview(button);
  });
});

pageZoomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.pageZoom;
    if (action === "in") setPageZoom(pageZoom + 0.1);
    if (action === "out") setPageZoom(pageZoom - 0.1);
    if (action === "reset") setPageZoom(1);
  });
});

flatDeviceTabs.forEach((button) => {
  button.addEventListener("click", () => {
    renderFlatDevice(button.dataset.flatDevice, activeFlatDoc);
  });
});

flatDocTabs?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-flat-doc]");
  if (!button) return;
  renderFlatDevice(activeFlatDevice, button.dataset.flatDoc);
});

function componentSectionHeader(title, copy) {
  return `<div class="section-header"><h2>${title}</h2><p>${copy}</p></div>`;
}

function componentTeamMark(team, className = "team-logo") {
  return `<span class="team-mark ${className} is-fallback" aria-label="${team.abbr}" style="--team-color:${team.color}"><span class="team-mark-abbr">${team.abbr}</span></span>`;
}

function componentTeamVisual(team, licensed = false, className = "team-logo") {
  return licensed && team.logo
    ? `<img class="${className}" src="${team.logo}" alt="${team.name}">`
    : componentTeamMark(team, className);
}

function componentGameMedia(game, { licensed = false, center = "" } = {}) {
  const lead = game.home.score === game.away.score ? null : game.home.score > game.away.score ? "home" : "away";
  const team = (side) => `<div class="team team-${side}${lead === side ? " is-leading" : ""}">${componentTeamVisual(game[side], licensed)}<div class="team-meta"><span class="team-abbr team-name">${licensed ? game[side].abbr : game[side].name}</span><span class="team-score tnum">${game[side].score}</span></div></div>`;
  return `<div class="game-row">${team("home")}<div class="game-center">${center || `<span class="period">${game.period}</span><span class="clock tnum">${game.clock}</span>`}</div>${team("away")}</div>`;
}

function componentMarketPanel(game) {
  const row = (label, sub, key) => `<div class="mkt-row"><button class="price yes" type="button">${game.markets[key].yes}¢</button><span class="mkt-name">${label}${sub ? `<small class="mkt-sub">${sub}</small>` : ""}</span><button class="price no" type="button">${game.markets[key].no}¢</button></div>`;
  return `<div class="mkt-grid"><div class="mkt-head"><span class="col-yes">Yes</span><span class="col-market">Markets</span><span class="col-no">No</span></div>${row("GTL", "Get the Lead", "gtl")}${row("TIE", "", "tie")}${row("KTL", "Keep the Lead", "ktl")}</div><span class="view-game">View Game</span>`;
}

function componentGameCard(game, { state = "collapsed", licensed = false } = {}) {
  const expanded = state === "expanded";
  const interrupted = state === "paused" || state === "waiting";
  const message = state === "waiting" ? "Markets open when a team takes the lead." : "Trading paused. Recalculating markets.";
  return `<article class="game-tile${expanded ? " is-open" : ""}${interrupted ? " is-paused" : ""}" style="--home-color:${game.home.color};--away-color:${game.away.color}">
    <div class="tile-main">${componentGameMedia(game, { licensed })}</div>
    <div class="tile-foot">${interrupted ? `<div class="trade-pause"><span class="pause-dot"></span><span>${message}</span></div>` : ""}<button class="foot-toggle" type="button" tabindex="-1"><span class="chev">${chevronDown}</span><span class="toggle-label">${expanded ? "Hide Bets" : "See Bets"}</span><span class="chev">${chevronDown}</span></button><div class="foot-panel"><div class="foot-panel-inner"><div class="foot-panel-pad">${expanded ? componentMarketPanel(game) : ""}</div></div></div></div>
  </article>`;
}

function componentPositionCard({ loss = false } = {}) {
  const game = homeGames[1];
  return `<article class="pos-card pos-card--a" style="--home-color:${game.home.color};--away-color:${game.away.color}">
    <div class="pos-media">${componentGameMedia(game)}</div>
    <div class="pos-info"><div class="oc-summary"><div class="oc-row"><span class="oc-tag">${loss ? "Keep the Lead" : "Get the Lead"}</span><span class="oc-vr-head">Value: <span class="tnum">${loss ? "$31.20" : "$57.00"}</span></span></div><div class="oc-row"><span class="oc-sub"><span class="side-${loss ? "no" : "yes"}">${loss ? "NO" : "YES"}</span> · ${loss ? "80" : "150"} contracts</span><span class="oc-figures"><span class="oc-pnl ${loss ? "down" : "up"} tnum">${loss ? "−$12.40" : "+$10.50"}</span></span></div></div><div class="oc-actions"><button class="oc-buy" type="button" tabindex="-1">Buy More</button><button class="oc-sell" type="button" tabindex="-1">Sell</button></div></div>
  </article>`;
}

function componentSettledCard(game) {
  return `<div class="settled-card" style="--home-color:${game.home.color};--away-color:${game.away.color}"><div class="pos-media">${componentGameMedia(game, { center: `<span class="period">Settled</span><span class="sc-won">You Won</span>` })}</div><div class="settled-body"><span class="settled-profit tnum">+$54.10</span><div class="settled-actions"><button class="btn btn-secondary" type="button">Dismiss</button><button class="btn btn-primary" type="button">Bet Again</button></div></div><span class="settled-progress"></span></div>`;
}

function componentScoreWormCard(game) {
  return `<div class="momentum-card worm-card" style="--home-color:${game.home.color};--away-color:${game.away.color}"><div class="momentum-head"><span>Score Worm</span></div><div class="worm-legend"><span class="worm-key"><i style="background:${game.home.color}"></i>${game.home.abbr} ahead</span><span class="worm-key"><i style="background:${game.away.color}"></i>${game.away.abbr} ahead</span></div><div class="worm-wrap"><div class="worm-quarters"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div><div class="worm-axis"><span>+14</span><span>0</span><span>−14</span></div><svg class="worm-svg" viewBox="0 0 320 132" preserveAspectRatio="none" aria-label="Score lead over time"><defs><linearGradient id="ds-score-worm-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="132"><stop offset="0" stop-color="${game.home.color}"></stop><stop offset="0.5" stop-color="${game.home.color}"></stop><stop offset="0.5" stop-color="${game.away.color}"></stop><stop offset="1" stop-color="${game.away.color}"></stop></linearGradient></defs><path class="worm-zero" d="M0 66H320"></path><path class="worm-line" d="M0 66H36V52H78V70H116V42H158V60H202V34H244V48H280V26H320" style="stroke:url(#ds-score-worm-gradient)"></path></svg><span class="worm-mark" style="left:36%"></span><span class="worm-mark" style="left:62%"></span></div><div class="worm-stats"><div class="worm-stat"><strong class="tnum">6</strong><span>Lead Changes</span></div><div class="worm-stat"><strong class="tnum">3</strong><span>Ties</span></div></div></div>`;
}

function componentGameStatsCard(game, { licensed = false } = {}) {
  const stats = [
    ["Total Team Yards", "324", "287", 50, 44],
    ["Pass Yards", "218", "194", 50, 44],
    ["Rush Yards", "106", "93", 50, 44],
    ["Possession Time", "31:42", "28:18", 50, 45],
    ["Turnovers", "1", "2", 25, 50],
  ];
  return `<div class="momentum-card stats-card" style="--home-color:${game.home.color};--away-color:${game.away.color}"><div class="stats-teams">${componentTeamVisual(game.home, licensed, "stats-logo")}<span class="stats-title">Game Stats</span>${componentTeamVisual(game.away, licensed, "stats-logo")}</div><div class="stat-list">${stats.map(([label, home, away, homeWidth, awayWidth]) => `<div class="stat-block"><div class="stat-caption"><span class="stat-val tnum">${home}</span><span class="stat-label">${label}</span><span class="stat-val tnum">${away}</span></div><div class="stat-bar-c"><span class="stat-fill-h" style="width:${homeWidth}%"></span><span class="stat-fill-a" style="width:${awayWidth}%"></span></div></div>`).join("")}</div></div>`;
}

function componentMarketBookCard() {
  const row = (price, size, side, width) => `<div class="book-row book-${side}"><span class="book-depth"><span class="book-depth-fill" style="width:${width}%"></span></span><span class="book-price tnum">${price}¢</span><span class="book-size tnum">${size}</span></div>`;
  return `<div class="chart-card"><div class="chart-head"><span>Market Book</span><strong class="tnum">63¢ / 65¢</strong></div><div class="book"><div class="book-side">${row(67, "820", "ask", 62)}${row(66, "1,240", "ask", 92)}${row(65, "960", "ask", 72)}</div><div class="book-spread"><span>Spread</span><strong class="tnum">2¢</strong></div><div class="book-side">${row(63, "1,310", "bid", 100)}${row(62, "880", "bid", 67)}${row(61, "640", "bid", 49)}</div></div></div>`;
}

function componentOrderFlowCard() {
  const bars = [["Q1", 42, 58], ["Q2", 78, 112], ["Q3", 100, 148], ["Q4", 24, 36]];
  return `<div class="chart-card"><div class="chart-head"><span>Order Flow</span><strong class="tnum">354 bets</strong></div><div class="flow-bars">${bars.map(([, height, value]) => `<span class="flow-bar" style="height:${height}%"><em class="flow-cap tnum">${value}</em></span>`).join("")}</div><div class="flow-axis">${bars.map(([label]) => `<span>${label}</span>`).join("")}</div><table class="bets-table"><thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead><tbody><tr><td class="tnum">08:39</td><td>GTL</td><td><span class="side-yes">YES</span></td><td class="num tnum">64¢</td><td class="num tnum">100</td></tr><tr><td class="tnum">08:37</td><td>KTL</td><td><span class="side-no">NO</span></td><td class="num tnum">36¢</td><td class="num tnum">50</td></tr></tbody></table></div>`;
}

function componentSettingsCards() {
  return `<div class="ds-settings-card-stack"><div class="profile-edit-card"><div class="profile-username-view"><div class="profile-username-copy"><span>Username</span><strong>@alex</strong></div><button class="btn btn-secondary btn-sm" type="button">Edit</button></div></div><div class="profile-preference-card"><div class="profile-preference-copy"><strong>Appearance</strong><span>Switch between light and dark mode.</span></div><button class="profile-theme-control" type="button">${accountThemeSwitch()}</button></div><div class="profile-preference-card"><div class="profile-preference-copy"><strong>Notifications</strong><span>Email notification preferences will live here.</span></div><span class="status-pill">Coming soon</span></div></div>`;
}

function componentToast(type, message) {
  const icon = type === "success"
    ? `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5v5.5M12 16.5h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  return `<div class="toast toast-${type}" role="${type === "error" ? "alert" : "status"}"><span class="toast-ico">${icon}</span><span class="toast-msg">${message}</span></div>`;
}

function componentDialogMarkup(type) {
  if (type === "auth") {
    return `<div class="gate-backdrop is-open"></div>
      <div class="auth-gate is-open"><div class="gate-body"><h3 class="gate-title">You need an account to bet on the lead.</h3><p class="gate-desc">Login below or create an account in less than a minute.</p><div class="gate-actions"><button class="btn btn-secondary" type="button">Login</button><button class="btn btn-primary" type="button">Create Account</button></div></div></div>
      <button class="btn btn-secondary gate-close is-open" type="button">Close</button>`;
  }
  if (type === "position") {
    return `<div class="gate-backdrop is-open"></div>
      <div class="auth-gate pos-gate is-open"><div class="gate-body"><h3 class="gate-title">You already have a position in this game</h3><p class="gate-desc">Only one position can win. Do you want to continue?</p><div class="gate-actions"><button class="btn btn-secondary" type="button">Cancel</button><button class="btn btn-primary" type="button">Continue</button></div><label class="pos-gate-check"><input type="checkbox"><span class="pos-check-box">${drawerCheckIcon}</span><span>Do not show this message again</span></label></div></div>`;
  }
  if (type === "ranking") {
    return `<div class="gate-backdrop ranking-prize-backdrop is-open"></div>
      <div class="auth-gate ranking-prize-gate is-open"><div class="gate-body"><span class="ranking-prize-kicker">July Rankings</span><h3 class="gate-title">You finished in position 47</h3><p class="gate-desc">Try and reach the top 10 in August's competition to receive a cash reward!</p></div></div><button class="btn btn-secondary gate-close ranking-result-close is-open" type="button">Close</button>`;
  }
  if (type === "rankingWinner") {
    return `<div class="gate-backdrop ranking-prize-backdrop is-open"></div>
      <div class="ranking-celebration" aria-hidden="true"><span class="celebration-glow"></span><div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
      <div class="auth-gate ranking-prize-gate is-open"><div class="gate-body"><span class="ranking-prize-kicker">July Rankings</span><h3 class="gate-title">You finished in position 7!</h3><p class="gate-desc">The GTL team will contact you shortly about claiming your reward.</p><strong class="ranking-prize-value tnum">$250</strong></div></div><button class="btn btn-secondary gate-close ranking-result-close is-open" type="button">Close</button>`;
  }
  if (type === "rankingTopThree") {
    return `<div class="gate-backdrop ranking-prize-backdrop is-open"></div>
      <div class="ranking-celebration" aria-hidden="true"><span class="celebration-glow"></span><div class="confetti-burst burst-left"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="confetti-burst burst-right"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="celebration-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
      <div class="auth-gate ranking-prize-gate is-top-three is-open"><div class="gate-body"><span class="ranking-prize-kicker">July Rankings</span><span class="ranking-prize-medal" data-rank="2" aria-hidden="true"><span class="ranking-medal-ribbon ribbon-left"></span><span class="ranking-medal-ribbon ribbon-right"></span><span class="ranking-medal-face"><strong>2</strong></span></span><h3 class="gate-title">You finished in position 2!</h3><p class="gate-desc">The GTL team will contact you shortly about claiming your reward.</p><strong class="ranking-prize-value tnum">$900</strong></div></div><button class="btn btn-secondary gate-close ranking-result-close is-open" type="button">Close</button>`;
  }
  if (type === "topup") {
    return `<div class="addfunds-backdrop is-open"></div>
      <aside class="addfunds-sheet is-open"><div class="addfunds-inner"><h3>Top Up</h3><div class="bet-field contracts-field"><span class="bet-label">Amount to add</span><div class="addfunds-amount"><span class="af-sign">$</span><input class="num-input" type="text" value="50" aria-label="Amount to add"></div><div class="qty-quick"><button type="button">$20</button><button class="is-active" type="button">$50</button><button type="button">$100</button><button type="button">$200</button></div></div><div class="addfunds-actions"><button class="btn btn-secondary" type="button">Cancel</button><button class="btn btn-primary" type="button">Add Funds</button></div><p class="addfunds-note">Prototype — no real payment is taken.</p></div></aside>`;
  }
  return `<div class="confirmation-backdrop"></div>
    <section class="confirmation-card"><div class="confirmation-visual" aria-hidden="true"><span class="confirmation-ring confirmation-ring--outer"></span><span class="confirmation-ring confirmation-ring--inner"></span><span class="confirmation-route"></span><span class="confirmation-mark"><svg viewBox="0 0 32 32" fill="none"><path d="m8 16.5 5 5L24 10.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></div><span class="eyebrow confirmation-eyebrow">Joining the Waitlist</span><h2>Securing your place.</h2><p>Hold tight—we’re reserving your early-access spot.</p><div class="confirmation-progress" aria-hidden="true"><span></span></div></section>`;
}

function componentDialogAppScreen(type) {
  if (type === "ranking" || type === "rankingWinner" || type === "rankingTopThree") return renderHomeFrame("logged");
  if (type === "topup") return renderTrackerFrame("open");
  if (type === "waitlist") {
    return `<div class="flat-screen ds-waitlist-screen"><header><img src="../gtl-app/assets/gtl-footer-logo.png" alt="Get the Lead"><span class="tag">Early access</span></header><main><span class="eyebrow">Live sports, traded live</span><h2>Call the lead before it happens.</h2><p>Join the early-access list for the fastest way to trade the moments that move live games.</p><span class="btn btn-primary">Join the Waitlist</span></main></div>`;
  }
  return renderGameFrame("live");
}

function componentDialogPhone(type) {
  const frameType = type === "ranking" || type === "rankingWinner" || type === "rankingTopThree" ? "home" : type === "topup" ? "tracker" : type === "waitlist" ? "home" : "game";
  return `<div class="ds-dialog-phone flat-lay-canvas" data-flat-device="mobile"><div class="flat-frame-wrap flat-frame--${frameType}"><div class="flat-phone">${componentDialogAppScreen(type)}<div class="ds-dialog-stage" data-dialog-type="${type}">${componentDialogMarkup(type)}</div></div></div></div>`;
}

function componentDialogGroup({ type, title, tag, copy }) {
  if (type === "ranking") {
    return `<section class="panel ds-dialog-group ds-dialog-ranking-group"><div class="ds-dialog-group-head"><span class="eyebrow">${tag}</span><h3>${title}</h3><p>${copy}</p></div><div class="ds-dialog-ranking-pair"><div class="ds-dialog-phone-state"><span class="flat-frame-label">Outside Top 10</span>${componentDialogPhone("ranking")}</div><div class="ds-dialog-phone-state"><span class="flat-frame-label">Inside Top 10</span>${componentDialogPhone("rankingWinner")}</div><div class="ds-dialog-phone-state"><span class="flat-frame-label">Top 3</span>${componentDialogPhone("rankingTopThree")}</div></div></section>`;
  }
  const scope = type === "topup" ? `<span class="tag ds-dialog-scope-tag">Out of Scope for MVP</span>` : "";
  return `<section class="panel ds-dialog-group"><div class="ds-dialog-group-head"><span class="eyebrow">${tag}</span><div class="ds-dialog-title-row"><h3>${title}</h3>${scope}</div><p>${copy}</p></div>${componentDialogPhone(type)}</section>`;
}

function syncAppComponentSections() {
  const sections = {
    buttons: document.querySelector("#buttons"),
    pills: document.querySelector("#pills"),
    forms: document.querySelector("#forms"),
    drawers: document.querySelector("#drawers"),
    navigation: document.querySelector("#navigation"),
    cards: document.querySelector("#cards"),
    tables: document.querySelector("#tables"),
    feedback: document.querySelector("#feedback"),
    dialogs: document.querySelector("#dialogs"),
  };

  if (sections.buttons) sections.buttons.innerHTML = `${componentSectionHeader("Buttons", "Current app actions use the shared button classes, semantic colours, and three supported sizes.")}
    <article class="panel ds-app-component-panel">
      <div class="panel-header"><h3>Action hierarchy</h3><span class="tag">App buttons</span></div>
      <div class="ds-app-button-grid">
        <span class="type-label">Default</span><button class="btn btn-primary" type="button">Primary</button><button class="btn btn-secondary" type="button">Secondary</button><button class="btn btn-ghost" type="button">Ghost</button><button class="btn btn-danger" type="button">Destructive</button>
        <span class="type-label">Loading</span><button class="btn btn-primary" type="button" disabled>Processing...</button><button class="btn btn-secondary" type="button" disabled>Loading...</button><button class="btn btn-ghost" type="button" disabled>Loading...</button><button class="btn btn-danger" type="button" disabled>Deleting...</button>
        <span class="type-label">Disabled</span><button class="btn btn-primary" type="button" disabled>Primary</button><button class="btn btn-secondary" type="button" disabled>Secondary</button><button class="btn btn-ghost" type="button" disabled>Ghost</button><button class="btn btn-danger" type="button" disabled>Destructive</button>
      </div>
      <div class="ds-app-button-sizes"><button class="btn btn-primary btn-sm" type="button">Small</button><button class="btn btn-primary" type="button">Default</button><button class="btn btn-primary btn-lg" type="button">Large</button><button class="btn btn-block btn-secondary" type="button">Full width</button></div>
    </article>`;

  if (sections.pills) sections.pills.innerHTML = `${componentSectionHeader("Pills & Status", "Status treatments below are taken directly from live games, portfolio, ranking, and account screens.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Live and paused</h3><span class="tag">Game</span></div><div class="ds-status-stack"><span class="live-badge game-clock-badge"><span class="game-period"><span class="live-dot"></span>Q3</span><span class="game-clock tnum">11:05</span></span><div class="trade-pause"><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div></div></article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Order outcomes</h3><span class="tag">Portfolio</span></div><div class="ds-chip-row"><span class="result-pill win">Won</span><span class="result-pill loss">Lost</span><span class="status-chip pending">Pending</span><span class="status-chip cancelled">Cancelled</span></div></article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Position sides</h3><span class="tag">Trading</span></div><div class="ds-chip-row"><span class="side-yes">YES</span><span class="side-no">NO</span></div></article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Availability</h3><span class="tag">Account</span></div><div class="ds-chip-row"><span class="status-pill">Coming soon</span></div></article>
    </div>`;

  if (sections.forms) sections.forms.innerHTML = `${componentSectionHeader("Forms", "Authentication, registration, contact, and trading fields use the same visible-label and inline-validation patterns as the app.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel form-grid ds-form-card"><div class="panel-header"><h3>Authentication</h3><span class="tag">Auth</span></div>
        <div class="field"><label for="ds-current-email">Email</label><input class="field-input" id="ds-current-email" type="email" placeholder="you@email.com"></div>
        <div class="field"><label for="ds-current-password">Password</label><div class="field-pass"><input class="field-input" id="ds-current-password" type="password" placeholder="Your password"><button class="pass-toggle" type="button" tabindex="-1" aria-label="Show password">${showIcon}</button></div></div>
        <div class="field"><label for="ds-current-error">Email error</label><input class="field-input is-error" id="ds-current-error" type="email" value="sam"><p class="field-error" role="alert">Enter a valid email address.</p></div>
      </article>
      <article class="panel form-grid ds-form-card"><div class="panel-header"><h3>Registration</h3><span class="tag">Eligibility</span></div>
        <fieldset class="field signup-birthday-field"><legend>Date of birth</legend><div class="date-fields"><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Month" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Day" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div><div class="date-part"><div class="field-combobox"><input class="field-input" placeholder="Year" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div></div><span class="field-hint">You must be 18 or older to use GTL.</span></fieldset>
        <label class="terms-check"><input type="checkbox"><span>I agree to GTL's <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>.</span></label>
      </article>
      <article class="panel form-grid ds-form-card ds-trading-form"><div class="panel-header"><h3>Contracts</h3><span class="tag">Buy</span></div>
        <div class="bet-field contracts-field"><span class="bet-label">Select number of contracts</span><input class="num-input drawer-contract-input" type="text" value="100" aria-label="Number of contracts"><div class="qty-quick"><button type="button">50</button><button class="is-active" type="button">100</button><button type="button">500</button><button type="button">1000</button></div></div>
      </article>
      <article class="panel form-grid ds-form-card ds-trading-form"><div class="panel-header"><h3>Order price</h3><span class="tag">Market / limit</span></div>
        <div class="bet-field drawer-price-mode"><span class="bet-label">Order price</span><div class="seg drawer-price-toggle"><button class="is-active" type="button">Market <strong class="tnum">64¢</strong></button><label class="drawer-price-option"><span>Set Limit</span></label></div></div>
        <div class="bet-field drawer-price-mode"><span class="bet-label">Invalid limit</span><div class="seg drawer-price-toggle"><button type="button">Market <strong class="tnum">64¢</strong></button><label class="drawer-price-option is-active is-error"><span>Set Limit</span><span class="drawer-limit-entry"><input type="text" value="104" aria-label="Limit price in cents"><span>¢</span></span></label></div><p class="limit-minmax is-error">Maximum limit price is 64¢</p></div>
      </article>
      <article class="panel form-grid ds-form-card ds-contact-form"><div class="panel-header"><h3>Contact</h3><span class="tag">Support</span></div>
        <div class="contact-name-row"><div class="field"><label for="ds-contact-name">Name</label><input class="field-input" id="ds-contact-name" type="text" placeholder="Your name"></div><div class="field"><label for="ds-contact-email">Email</label><input class="field-input" id="ds-contact-email" type="email" placeholder="you@example.com"></div></div>
        <div class="field"><label for="ds-contact-topic">What can we help with?</label><div class="field-combobox"><input class="field-input" id="ds-contact-topic" type="text" placeholder="Choose a topic" readonly><span class="combobox-toggle">${chevronDownIcon}</span></div></div>
        <div class="field"><label for="ds-contact-message">Message</label><textarea class="field-input contact-message" id="ds-contact-message" rows="6" maxlength="1000" placeholder="Tell us what happened or what you need help with"></textarea><span class="field-hint">0/1000 characters</span></div>
      </article>
    </div>`;

  if (sections.drawers) {
    const drawerStates = [
      ["Buy market", "buyMarket"],
      ["Change bet type", "changeBetType"],
      ["Trading paused", "paused"],
      ["Buy limit", "buyLimit"],
      ["Invalid limit", "invalid"],
      ["Sell position", "sellMarket"],
      ["Buy confirmation", "confirmBuy"],
      ["Sell confirmation", "confirmSell"],
    ];
    sections.drawers.innerHTML = `${componentSectionHeader("Buy/Sell Drawer", "Current order entry, trading interruption, validation, and five-second confirmation states from the app.")}
      <div class="ds-current-drawer-grid">${drawerStates.map(([label, mode]) => `<article class="panel ds-current-drawer-card"><div class="panel-header"><h3>${label}</h3><span class="tag">Current flow</span></div><div class="ds-drawer-preview ds-drawer-mobile">${renderDrawerSheet(mode)}</div></article>`).join("")}</div>`;
  }

  if (sections.navigation) sections.navigation.innerHTML = `${componentSectionHeader("Navigation", "The shared floating header, page tabs, league filter, and current footer are the app's supported navigation patterns.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-nav-card"><div class="panel-header"><h3>Signed out header</h3><span class="tag">Mobile</span></div><div class="ds-nav-header-preview">${homeHeader(false)}</div></article>
      <article class="panel ds-nav-card"><div class="panel-header"><h3>Signed in header</h3><span class="tag">Mobile</span></div><div class="ds-nav-header-preview">${homeHeader(true)}</div></article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>League filter</h3><span class="tag">Home</span></div>${homeLeagueStrip("nfl")}</article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Content tabs</h3><span class="tag">Game / Portfolio</span></div><div class="stats-tabs"><button class="stats-tab is-active" type="button">Markets</button><button class="stats-tab" type="button">Game Stats</button></div></article>
    </div>
    <article class="panel ds-nav-card ds-nav-desktop-card"><div class="panel-header"><h3>Signed in header</h3><span class="tag">Desktop</span></div><div class="ds-nav-header-preview is-desktop">${homeHeader(true)}</div></article>
    <article class="panel ds-footer-reference"><div class="panel-header"><h3>Footer</h3><span class="tag">Current</span></div>${homeFooter("home")}</article>`;

  if (sections.cards) {
    const cardGame = homeGames[1];
    const pausedGame = homeGames[0];
    const waitingGame = homeGames[2];
    sections.cards.innerHTML = `${componentSectionHeader("Cards", "Reusable card families from the current app, grouped by purpose and shown in their supported states. Team initials are the active app treatment; licensed logos remain documented for future use.")}
      <section class="ds-card-group" aria-labelledby="ds-game-cards-title">
        <div class="ds-card-group-head"><div><span class="eyebrow">Home</span><h3 id="ds-game-cards-title">Live game cards</h3></div><p>Collapsed is the default. Expansion is reserved for the market panel; interrupted games stay collapsed.</p></div>
        <div class="ds-current-card-grid ds-game-card-grid">
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Live game</h3><span class="tag">App default</span></div>${componentGameCard(cardGame)}</article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Market panel</h3><span class="tag">Expanded</span></div>${componentGameCard(cardGame, { state: "expanded" })}</article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Trading recalculation</h3><span class="tag">Temporary pause</span></div>${componentGameCard(pausedGame, { state: "paused" })}</article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Market not open</h3><span class="tag">Unavailable</span></div>${componentGameCard(waitingGame, { state: "waiting" })}</article>
          <article class="panel ds-card-frame ds-card-reference"><div class="panel-header"><h3>Licensed team logos</h3><span class="tag">Retained reference</span></div>${componentGameCard(cardGame, { licensed: true })}<p class="ds-card-note">Not currently used in the app. Team initials replace names when licensed marks return.</p></article>
        </div>
      </section>

      <section class="ds-card-group" aria-labelledby="ds-position-cards-title">
        <div class="ds-card-group-head"><div><span class="eyebrow">Portfolio</span><h3 id="ds-position-cards-title">Positions and orders</h3></div><p>Open positions carry the live-game media header. Order rows use the compact portfolio treatment.</p></div>
        <div class="ds-current-card-grid ds-position-card-grid">
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Open position</h3><span class="tag">Positive return</span></div>${componentPositionCard()}</article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Open position</h3><span class="tag">Negative return</span></div>${componentPositionCard({ loss: true })}</article>
          <article class="panel ds-card-frame ds-order-row-frame"><div class="panel-header"><h3>Current order</h3><span class="tag">Open</span></div>${walletOrderRow(walletUser.positions[0], "open", 0)}</article>
          <article class="panel ds-card-frame ds-order-row-frame"><div class="panel-header"><h3>Pending order</h3><span class="tag">Limit</span></div>${walletOrderRow(walletUser.pending[0], "pending", 0)}</article>
          <article class="panel ds-card-frame ds-order-row-frame"><div class="panel-header"><h3>Settled order</h3><span class="tag">History</span></div>${walletOrderRow(walletUser.settled[0], "settled", 0)}</article>
          <article class="panel ds-card-frame ds-settled-card-frame"><div class="panel-header"><h3>Winning settlement</h3><span class="tag">Notification card</span></div>${componentSettledCard(cardGame)}</article>
        </div>
      </section>

      <section class="ds-card-group" aria-labelledby="ds-data-cards-title">
        <div class="ds-card-group-head"><div><span class="eyebrow">Game page</span><h3 id="ds-data-cards-title">Game data cards</h3></div><p>The current tabs use four active cards; the licensed Game Stats treatment remains retained for future use.</p></div>
        <div class="ds-current-card-grid ds-data-card-grid">
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Score worm</h3><span class="tag">Game stats</span></div>${componentScoreWormCard(cardGame)}</article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Team comparison</h3><span class="tag">Five core stats</span></div>${componentGameStatsCard(cardGame)}</article>
          <article class="panel ds-card-frame ds-card-reference"><div class="panel-header"><h3>Team comparison</h3><span class="tag">Licensed reference</span></div>${componentGameStatsCard(cardGame, { licensed: true })}<p class="ds-card-note">Retained for future commercial use; initials remain the active app treatment.</p></article>
          <article class="panel ds-card-frame"><div class="panel-header"><h3>Market book</h3><span class="tag">Market stats</span></div>${componentMarketBookCard()}</article>
          <article class="panel ds-card-frame ds-order-flow-frame"><div class="panel-header"><h3>Order flow</h3><span class="tag">Market stats</span></div>${componentOrderFlowCard()}</article>
        </div>
      </section>

      <section class="ds-card-group" aria-labelledby="ds-settings-cards-title">
        <div class="ds-card-group-head"><div><span class="eyebrow">Account</span><h3 id="ds-settings-cards-title">Settings cards</h3></div><p>Account surfaces remain compact, single-purpose and use the shared neutral card treatment.</p></div>
        <article class="panel ds-card-frame ds-settings-card-frame"><div class="panel-header"><h3>Profile and preferences</h3><span class="tag">Account</span></div>${componentSettingsCards()}</article>
      </section>`;
  }

  if (sections.tables) sections.tables.innerHTML = `${componentSectionHeader("Tables", "The app uses a compact trade-history table and responsive leaderboard rows rather than generic operational tables.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Trade history</h3><span class="tag">Game</span></div><div class="table-wrap"><table class="bets-table"><thead><tr><th>Time</th><th>Market</th><th>Side</th><th class="num">Price</th><th class="num">Size</th></tr></thead><tbody><tr><td class="tnum">11:04</td><td>GTL</td><td class="side-yes">YES</td><td class="num tnum">64¢</td><td class="num tnum">100</td></tr><tr><td class="tnum">11:02</td><td>KTL</td><td class="side-no">NO</td><td class="num tnum">38¢</td><td class="num tnum">50</td></tr></tbody></table></div></article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Leaderboard</h3><span class="tag">Ranking</span></div><div class="ranking-table-head"><span>Rank</span><span>Player</span><span>Balance</span><span>Prize</span></div><div class="ranking-scroll"><div class="ranking-row is-podium is-rank-1"><span class="rank-pos">1</span><span class="rank-user">leadstorm</span><span class="rank-balance tnum">6,840</span><span class="rank-prize">$1,500</span></div><div class="ranking-row is-current"><span class="rank-pos">47</span><span class="rank-user">alex</span><span class="rank-balance tnum">1,710</span><span class="rank-prize">—</span></div></div></article>
    </div>`;

  if (sections.feedback) sections.feedback.innerHTML = `${componentSectionHeader("Feedback", "Current feedback patterns cover transient toasts, inline order warnings, trading interruptions, and empty states.")}
    <div class="grid two ds-app-component-grid">
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Toasts</h3><span class="tag">Transient</span></div><div class="ds-toast-stack">${componentToast("success", "Username updated")}${componentToast("error", "Unable to place order")}</div></article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Inline warnings</h3><span class="tag">Trading</span></div><div class="ds-status-stack"><div class="bet-conflict" role="alert">${drawerWarnIcon}<span><strong>Insufficient balance.</strong> Add funds before placing this bet.</span></div><div class="trade-pause drawer-trade-pause"><span class="pause-dot"></span><span>Trading paused. Recalculating markets.</span></div></div></article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Empty state</h3><span class="tag">Portfolio</span></div><div class="wallet-empty">No current orders.</div></article>
      <article class="panel ds-app-component-panel"><div class="panel-header"><h3>Loading state</h3><span class="tag">Cards</span></div>${flatLoading()}</article>
    </div>`;

  if (sections.dialogs) sections.dialogs.innerHTML = `${componentSectionHeader("Dialogs", "Every modal used by the app, shown implemented over the relevant screen in a complete phone mockup. Buy and sell confirmations remain in the dedicated Buy/Sell Drawer reference.")}
    <div class="ds-dialog-catalog">
      ${componentDialogGroup({ type: "auth", title: "Sign In to Bet", tag: "Authentication", copy: "Shown when a signed-out user selects a market. The separate Close action dismisses the saved bet intent." })}
      ${componentDialogGroup({ type: "position", title: "Existing Position", tag: "Trading confirmation", copy: "Warns before a user opens a competing position in the same game, with an optional session-level dismissal." })}
      ${componentDialogGroup({ type: "ranking", title: "Monthly Ranking Result", tag: "Ranking", copy: "Shown over whichever screen the user returns to after a monthly competition completes. These examples use the Home screen to demonstrate outside-top-10, rewarded-top-10, and top-three outcomes." })}
      ${componentDialogGroup({ type: "topup", title: "Top Up Balance", tag: "Wallet", copy: "This wallet funding flow is outside the current MVP scope and is retained here as a future-state reference." })}
      ${componentDialogGroup({ type: "waitlist", title: "Waitlist Confirmation", tag: "Marketing", copy: "A focused confirmation state shown while an early-access place is being secured." })}
    </div>`;

  modal?.remove();
}

function startConfirmationTimers() {
  let remaining = 5;
  const updateTimers = (value, resetting = false) => {
    const progress = value / 5;
    const timers = Array.from(document.querySelectorAll(".bet-sheet.is-success .bet-countdown-clock"));
    timers.forEach((timer) => {
      const number = timer.querySelector("strong");
      if (resetting) timer.classList.add("is-timer-resetting");
      if (number) number.textContent = String(value);
      timer.setAttribute("aria-label", `${value} ${value === 1 ? "second" : "seconds"} remaining`);
      timer.style.setProperty("--bet-confirm-progress", String(progress));
      if (resetting) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => timer.classList.remove("is-timer-resetting"));
        });
      }
    });
  };

  updateTimers(remaining, true);
  window.setInterval(() => {
    if (remaining === 0) {
      remaining = 5;
      updateTimers(remaining, true);
      return;
    }
    remaining -= 1;
    updateTimers(remaining);
  }, 1000);
}

window.addEventListener("hashchange", () => {
  showSection(sectionFromHash(), { instant: true });
});

syncAppComponentSections();
startConfirmationTimers();
renderDrawerComponentStates();
setDrawerView(drawerSection?.dataset.drawerViewMode);
drawerSection?.querySelectorAll(".bet-sheet").forEach(updateDrawerPreview);
setPageZoom(pageZoom);
if (pageTabs.length) loadPagePreview(document.querySelector("[data-page-tab].is-active") || pageTabs[0]);
renderFlatDevice(document.querySelector(".side-nav a[data-flat-device].is-device-active")?.dataset.flatDevice || "mobile", activeFlatDoc);
showSection(sectionFromHash(), { instant: true });
describeColorSwatches();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});
