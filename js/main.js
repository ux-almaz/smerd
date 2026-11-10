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

document.querySelectorAll("[data-more]").forEach((block) => {
  const items = [...block.querySelectorAll(".tile")];
  const button = block.querySelector("[data-more-toggle]");
  const desktopLimit = Number(block.dataset.moreLimit || 6);
  const narrow = window.matchMedia("(max-width: 760px)");
  if (!button || items.length <= Math.min(3, desktopLimit)) return;

  const plural = (n, one, few, many) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  };

  const limit = () => (narrow.matches ? Math.min(3, desktopLimit) : desktopLimit);
  let open = false;

  const render = () => {
    const shown = open ? items.length : limit();
    items.forEach((item, index) => item.classList.toggle("is-extra", index >= shown));
    const left = items.length - limit();
    button.hidden = left <= 0;
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Свернуть" : `Показать ещё ${left} ${plural(left, "работу", "работы", "работ")}`;
  };

  button.addEventListener("click", () => {
    open = !open;
    render();
    if (!open) block.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  narrow.addEventListener("change", render);
  render();
});

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

document.querySelectorAll("[data-reviews]").forEach((root) => {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll("[data-reviews-panel]")];
  const count = root.querySelector("[data-reviews-count]");
  const prev = root.querySelector("[data-reviews-prev]");
  const next = root.querySelector("[data-reviews-next]");
  const pad = (n) => String(n).padStart(2, "0");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;
  let programmatic = false;

  const activePanel = () => panels.find((panel) => panel.classList.contains("is-active"));
  const activeTrack = () => activePanel().querySelector("[data-reviews-track]");

  const metrics = (track) => {
    const cards = [...track.querySelectorAll(".review")];
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const positions = cards.map((card) => Math.min(card.offsetLeft, maxScroll));
    return { cards, maxScroll, positions };
  };

  const nearest = (track) => {
    const { positions } = metrics(track);
    return positions.reduce(
      (best, pos, i) => {
        const dist = Math.abs(pos - track.scrollLeft);
        return dist < best.dist ? { i, dist } : best;
      },
      { i: 0, dist: Infinity },
    ).i;
  };

  const visibleIndexes = (track, at) => {
    const cards = [...track.querySelectorAll(".review")];
    const start = cards[at].offsetLeft;
    const end = start + track.clientWidth;
    return cards.flatMap((card, i) => {
      const left = card.offsetLeft;
      return left < end - 1 && left + card.offsetWidth > start + 1 ? [i] : [];
    });
  };

  const fitHeight = (track, indexes) => {
    const cards = [...track.querySelectorAll(".review")];
    cards.forEach((card) => {
      card.style.minHeight = "";
    });
    const height = Math.max(...indexes.map((i) => cards[i].offsetHeight));
    indexes.forEach((i) => {
      cards[i].style.minHeight = `${height}px`;
    });
    track.style.height = `${height}px`;
  };

  const render = () => {
    const { positions } = metrics(activeTrack());
    const last = positions.length - 1;
    count.textContent = `${pad(index + 1)} / ${pad(positions.length)}`;
    prev.disabled = index <= 0;
    next.disabled = index >= last;
  };

  const go = (nextIndex) => {
    const track = activeTrack();
    const { positions } = metrics(track);
    const target = Math.max(0, Math.min(positions.length - 1, nextIndex));
    fitHeight(track, [...new Set([...visibleIndexes(track, index), ...visibleIndexes(track, target)])]);
    index = target;
    programmatic = true;
    track.scrollTo({
      left: positions[index],
      behavior: motion.matches ? "auto" : "smooth",
    });
    window.setTimeout(() => {
      programmatic = false;
    }, 600);
    render();
  };

  const showPanel = (panelIndex) => {
    tabs.forEach((tab, i) => {
      const selected = i === panelIndex;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel, i) => panel.classList.toggle("is-active", i === panelIndex));
    const track = activeTrack();
    track.scrollTo({ left: 0, behavior: "auto" });
    index = 0;
    fitHeight(track, visibleIndexes(track, 0));
    render();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => showPanel(i));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const nextTab = event.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
      showPanel(nextTab);
      tabs[nextTab].focus();
    });
  });

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));

  panels.forEach((panel) => {
    const track = panel.querySelector("[data-reviews-track]");
    const sync = () => {
      if (!panel.classList.contains("is-active") || programmatic) return;
      index = nearest(track);
      render();
    };
    track.addEventListener("scroll", sync, { passive: true });
    track.addEventListener("scrollend", () => {
      if (!panel.classList.contains("is-active")) return;
      programmatic = false;
      index = nearest(track);
      fitHeight(track, visibleIndexes(track, index));
      render();
    });
  });

  window.addEventListener("resize", () => {
    const track = activeTrack();
    const { positions } = metrics(track);
    index = Math.min(index, positions.length - 1);
    track.scrollTo({ left: positions[index], behavior: "auto" });
    fitHeight(track, visibleIndexes(track, index));
    render();
  });

  showPanel(0);
});

const lightbox = document.querySelector("[data-lightbox-root]");
const lightboxImg = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");

const closeLightbox = () => {
  lightbox.hidden = true;
  lightboxImg.removeAttribute("src");
  if (lightboxCaption) lightboxCaption.textContent = "";
  document.body.classList.remove("no-scroll");
};

document.querySelectorAll("[data-lightbox]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    lightboxImg.src = link.getAttribute("href");
    lightboxImg.alt = link.querySelector("img")?.alt ?? "";
    if (lightboxCaption) lightboxCaption.textContent = link.dataset.caption || "";
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

const enrollDialog = document.querySelector("[data-enroll-dialog]");

if (enrollDialog) {
  const enrollForm = enrollDialog.querySelector("[data-enroll-form]");
  const enrollStatus = enrollDialog.querySelector("[data-enroll-status]");
  const enrollStatusDefault = enrollStatus.textContent;
  const enrollEmail = "olga.smerd.art@gmail.com";

  document.querySelectorAll("[data-enroll-open]").forEach((button) => {
    button.addEventListener("click", () => {
      enrollStatus.textContent = enrollStatusDefault;
      enrollDialog.showModal();
      enrollForm.elements.name.focus();
    });
  });

  enrollDialog.querySelector("[data-enroll-close]").addEventListener("click", () => enrollDialog.close());
  enrollDialog.addEventListener("click", (event) => {
    if (event.target === enrollDialog) enrollDialog.close();
  });

  enrollForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const { format, name, phone, contact } = enrollForm.elements;
    const subject = "Запись на занятие";
    const body = [
      "Здравствуйте, Ольга!",
      "",
      `Хочу записаться: ${format.value}`,
      "",
      `Имя: ${name.value.trim()}`,
      `Телефон: ${phone.value.trim()}`,
      `Telegram или почта: ${contact.value.trim()}`,
      "Согласие на обработку персональных данных: да",
      "Подтверждено: отправителю есть 18 лет; для детской записи он родитель или законный представитель.",
    ].join("\n");

    window.location.href = `mailto:${enrollEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    enrollStatus.textContent = `Письмо подготовлено — отправьте его в почтовой программе. Если она не открылась, напишите на ${enrollEmail}.`;
  });
}
