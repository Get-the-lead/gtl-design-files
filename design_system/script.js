const body = document.body;
const sidebar = document.querySelector(".sidebar");
const navLinks = document.querySelectorAll(".side-nav a");
const openNavButton = document.querySelector("[data-open-nav]");
const closeNavTarget = document.querySelector("[data-close-nav]");
const modal = document.querySelector("[data-modal]");
const openModalButton = document.querySelector("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const toggles = document.querySelectorAll("[data-toggle]");

function closeNavigation() {
  body.classList.remove("nav-open");
}

openNavButton?.addEventListener("click", () => {
  body.classList.add("nav-open");
});

closeNavTarget?.addEventListener("click", closeNavigation);

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeNavigation();
  });
});

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const isOn = toggle.classList.toggle("is-on");
    toggle.setAttribute("aria-pressed", String(isOn));
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

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-20% 0px -65% 0px",
    threshold: [0.1, 0.25, 0.5],
  }
);

sections.forEach((section) => observer.observe(section));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
  }
});
