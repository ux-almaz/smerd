(() => {
const CART_KEY = "smerd-cart";
const paintings = window.SMERD_WORKS || {};

const formatPrice = (value) => `${new Intl.NumberFormat("ru-RU").format(value)}\u00a0₽`;

const readCart = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return [...new Set(ids)].filter((id) => paintings[id]);
  } catch {
    return [];
  }
};

let cartIds = readCart();

const params = new URLSearchParams(location.search);
const paid =
  params.get("result") === "success" ||
  (document.body.dataset.payment === "success" && (params.get("InvId") || params.get("inv_id")));
if (paid) {
  cartIds = [];
  localStorage.removeItem(CART_KEY);
}

const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cartIds));

const cart = document.createElement("div");
cart.className = "cart";
cart.hidden = true;
cart.innerHTML = `
  <div class="cart__backdrop" data-cart-close></div>
  <aside class="cart__panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabindex="-1">
    <div class="cart__head">
      <div>
        <p class="kicker">Корзина</p>
        <h2 class="display display--40" id="cart-title">Заказ</h2>
      </div>
      <button type="button" class="round-btn" data-cart-close aria-label="Закрыть корзину">×</button>
    </div>
    <div data-cart-items></div>
    <p class="note" data-cart-empty hidden>В корзине пока пусто. Выберите работу в каталоге.</p>
    <p class="cart__total" data-cart-total-row hidden><span>Сумма</span><span data-cart-sum>0</span></p>
    <form class="cart__form" data-checkout hidden>
      <label class="field">
        <span>Имя</span>
        <input type="text" name="name" autocomplete="name" required />
      </label>
      <label class="field">
        <span>Телефон</span>
        <input type="tel" name="phone" autocomplete="tel" required placeholder="+7 900 000-00-00" />
      </label>
      <label class="field">
        <span>Telegram или e-mail</span>
        <input type="text" name="contact" autocomplete="email" required placeholder="@telegram или почта" />
      </label>
      <label class="field">
        <span>Город и комментарий к доставке</span>
        <textarea name="comment" rows="3" placeholder="Куда отправить работу"></textarea>
      </label>
      <label class="agree">
        <input type="checkbox" name="consent" value="yes" required />
        <span>Я принимаю <a href="offer.html" target="_blank" rel="noopener noreferrer">публичную оферту</a> и даю <a href="consent.html#checkout" target="_blank" rel="noopener noreferrer">согласие на обработку персональных данных</a>.</span>
      </label>
      <button type="submit" class="btn cart__submit">Перейти к оплате</button>
      <p class="note" data-cart-status aria-live="polite">Оплата откроется на защищённой странице Robokassa. Доставка согласуется после оплаты и в стоимость не входит. Каждая работа — оригинал, один экземпляр.</p>
    </form>
  </aside>
`;
document.body.append(cart);

const itemsRoot = cart.querySelector("[data-cart-items]");
const emptyNote = cart.querySelector("[data-cart-empty]");
const totalRow = cart.querySelector("[data-cart-total-row]");
const totalSum = cart.querySelector("[data-cart-sum]");
const form = cart.querySelector("[data-checkout]");
const status = cart.querySelector("[data-cart-status]");
const defaultStatus = status.textContent;
const panel = cart.querySelector(".cart__panel");
let lastFocus = null;

const paintButtons = () => {
  document.querySelectorAll("[data-add]").forEach((button) => {
    const added = cartIds.includes(button.dataset.add);
    button.classList.toggle("is-in-cart", added);
    button.setAttribute("aria-pressed", String(added));
    button.textContent = added ? "В корзине" : "В корзину";
  });
};

const paintCount = () => {
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.hidden = cartIds.length === 0;
    node.textContent = String(cartIds.length);
  });
};

const renderCart = () => {
  const selected = cartIds.map((id) => paintings[id]);
  itemsRoot.innerHTML = selected
    .map(
      (work) => `
        <article class="cart-item">
          <img src="${work.image}" alt="" />
          <div class="cart-item__body">
            <h3>${work.title}</h3>
            <p class="note">${work.meta}</p>
            <p>${formatPrice(work.price)}</p>
            <button type="button" class="cart-item__remove" data-remove="${work.id}">Убрать</button>
          </div>
        </article>
      `
    )
    .join("");

  const total = selected.reduce((sum, work) => sum + work.price, 0);
  const hasItems = selected.length > 0;
  emptyNote.hidden = hasItems;
  totalRow.hidden = !hasItems;
  form.hidden = !hasItems;
  totalSum.textContent = formatPrice(total);
  paintButtons();
  paintCount();
};

const closeMenu = () => {
  const menu = document.querySelector("[data-menu]");
  const toggle = document.querySelector("[data-menu-toggle]");
  if (!menu?.classList.contains("is-open")) return;
  menu.classList.remove("is-open");
  menu.inert = true;
  menu.setAttribute("aria-hidden", "true");
  toggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
};

const openCart = () => {
  closeMenu();
  lastFocus = document.activeElement;
  cart.hidden = false;
  requestAnimationFrame(() => cart.classList.add("is-open"));
  document.body.classList.add("no-scroll");
  panel.focus();
};

const closeCart = () => {
  cart.classList.remove("is-open");
  cart.hidden = true;
  document.body.classList.remove("no-scroll");
  status.textContent = defaultStatus;
  lastFocus?.focus?.({ preventScroll: true });
};

document.querySelectorAll("[data-cart-open]").forEach((button) => {
  button.addEventListener("click", openCart);
});

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.add;
    if (!paintings[id]) return;
    if (!cartIds.includes(id)) {
      cartIds.push(id);
      saveCart();
      renderCart();
    }
    openCart();
  });
});

itemsRoot.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  cartIds = cartIds.filter((id) => id !== button.dataset.remove);
  saveCart();
  renderCart();
});

cart.querySelectorAll("[data-cart-close]").forEach((button) => {
  button.addEventListener("click", closeCart);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cart.classList.contains("is-open")) closeCart();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = form.querySelector("[type='submit']");
  const { name, phone, contact, comment, consent } = form.elements;
  const digits = phone.value.replace(/\D/g, "");
  if (name.value.trim().length < 2 || digits.length < 10 || contact.value.trim().length < 3) {
    status.textContent = "Укажите имя, телефон и Telegram или e-mail.";
    return;
  }
  if (!consent.checked) {
    status.textContent = "Чтобы перейти к оплате, примите оферту и дайте согласие на обработку персональных данных.";
    return;
  }

  submit.disabled = true;
  submit.textContent = "Переходим к оплате…";
  status.textContent = "Открываем страницу оплаты.";

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartIds,
        name: name.value.trim(),
        phone: phone.value.trim(),
        contact: contact.value.trim(),
        comment: comment.value.trim(),
        consent: true,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.url) {
      throw new Error(payload.error || "Не удалось перейти к оплате.");
    }
    window.location.href = payload.url;
  } catch (error) {
    const offline = error instanceof TypeError;
    status.textContent = offline
      ? "Оплата не открылась. Сайт нужно открыть на хостинге, где работает страница оплаты."
      : error.message || "Не удалось перейти к оплате.";
    submit.disabled = false;
    submit.textContent = "Перейти к оплате";
  }
});

renderCart();
})();
