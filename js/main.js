const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");

if (menu && menuToggle) {
  const menuClose = menu.querySelector("[data-menu-close]");

  const setMenu = (open) => {
    if (menu.classList.contains("is-open") === open) return;
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    menu.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
    (open ? menuClose : menuToggle).focus({ preventScroll: true });
  };

  menuToggle.addEventListener("click", () => setMenu(true));
  menuClose.addEventListener("click", () => setMenu(false));
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });
}

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const slides = [...slider.querySelectorAll(".slide")];
  const tabs = [...slider.querySelectorAll('[role="tab"]')];
  const count = slider.querySelector("[data-count]");
  const pad = (n) => String(n).padStart(2, "0");
  let current = 0;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    tabs.forEach((tab, i) => tab.setAttribute("aria-selected", String(i === current)));
    count.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
  };

  tabs.forEach((tab, i) => tab.addEventListener("click", () => show(i)));
  slider.querySelector("[data-prev]").addEventListener("click", () => show(current - 1));
  slider.querySelector("[data-next]").addEventListener("click", () => show(current + 1));
  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
});

const lightbox = document.querySelector("[data-lightbox-root]");
const lightboxImg = lightbox.querySelector("img");

const closeLightbox = () => {
  lightbox.hidden = true;
  lightboxImg.removeAttribute("src");
  document.body.classList.remove("no-scroll");
};

document.querySelectorAll("[data-lightbox]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    lightboxImg.src = link.getAttribute("href");
    lightboxImg.alt = link.querySelector("img")?.alt ?? "";
    lightbox.hidden = false;
    document.body.classList.add("no-scroll");
  });
});

lightbox.addEventListener("click", (event) => {
  if (event.target !== lightboxImg) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
});
