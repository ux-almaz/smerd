(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SMERD_WORKS = api.WORKS;
})(typeof window !== "undefined" ? window : null, function () {
  const WORKS = {
    february: {
      id: "february",
      title: "Февраль",
      meta: "Триптих, холст, масло · 2022–2023",
      price: 50000,
      image: "assets/february.png",
    },
    spring: {
      id: "spring",
      title: "Весенняя пора",
      meta: "Холст, масло · 2022–2023",
      price: 150000,
      image: "assets/spring.png",
    },
    fatigue: {
      id: "fatigue",
      title: "Усталость",
      meta: "Триптих, холст, масло · 2023",
      price: 75000,
      image: "assets/fatigue.png",
    },
    dreamers: {
      id: "dreamers",
      title: "Мечтатели",
      meta: "Диптих, холст, масло · 2022",
      price: 100000,
      image: "assets/dreamers.png",
    },
    atharrachadh: {
      id: "atharrachadh",
      title: "Atharrachadh",
      meta: "Триптих, холст, масло · 2024–2025",
      price: 200000,
      image: "assets/atharrachadh.png",
    },
  };

  return { WORKS };
});
