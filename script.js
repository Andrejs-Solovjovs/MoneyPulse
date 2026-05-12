function getDemoDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

const expenses = [
  {
    id: 1,
    title: "Rimi — продукты",
    category: "Еда",
    amount: 42.8,
    date: getDemoDate(1),
    mood: "База",
  },
  {
    id: 2,
    title: "Bolt до центра",
    category: "Транспорт",
    amount: 11.4,
    date: getDemoDate(2),
    mood: "Импульс",
  },
  {
    id: 3,
    title: "Кофе и булочка",
    category: "Кафе",
    amount: 6.7,
    date: getDemoDate(3),
    mood: "Ритуал",
  },
  {
    id: 4,
    title: "Аренда комнаты",
    category: "Дом",
    amount: 390,
    date: getDemoDate(4),
    mood: "Обязательное",
  },
  {
    id: 5,
    title: "H&M футболка",
    category: "Покупки",
    amount: 24.99,
    date: getDemoDate(5),
    mood: "Хочу",
  },
  {
    id: 6,
    title: "Подписка Spotify",
    category: "Подписки",
    amount: 7.99,
    date: getDemoDate(8),
    mood: "Авто",
  },
  {
    id: 7,
    title: "Обед в университете",
    category: "Еда",
    amount: 8.5,
    date: getDemoDate(10),
    mood: "База",
  },
  {
    id: 8,
    title: "Такси ночью",
    category: "Транспорт",
    amount: 18.2,
    date: getDemoDate(12),
    mood: "Импульс",
  },
];

const periods = ["Неделя", "Месяц", "Квартал", "Год"];

const categorySettings = {
  Еда: {
    icon: window.icons.food,
    colorClass: "color-food",
    softClass: "soft-food",
    barClass: "bar-food",
  },
  Транспорт: {
    icon: icons.transport,
    colorClass: "color-transport",
    softClass: "soft-transport",
    barClass: "bar-transport",
  },
  Кафе: {
    icon: icons.cafe,
    colorClass: "color-cafe",
    softClass: "soft-cafe",
    barClass: "bar-cafe",
  },
  Дом: {
    icon: icons.home,
    colorClass: "color-home",
    softClass: "soft-home",
    barClass: "bar-home",
  },
  Покупки: {
    icon: icons.shopping,
    colorClass: "color-shopping",
    softClass: "soft-shopping",
    barClass: "bar-shopping",
  },
  Подписки: {
    icon: icons.subscriptions,
    colorClass: "color-subscriptions",
    softClass: "soft-subscriptions",
    barClass: "bar-subscriptions",
  },
};

let activePeriod = "Месяц";
let activeCategory = "Все";
let searchQuery = "";

const summaryTotal = document.getElementById("summaryTotal");
const summaryBars = document.getElementById("summaryBars");

const metricTotal = document.getElementById("metricTotal");
const metricAverage = document.getElementById("metricAverage");
const metricCount = document.getElementById("metricCount");
const metricBiggest = document.getElementById("metricBiggest");
const metricBiggestNote = document.getElementById("metricBiggestNote");
const metricTotalIcon = document.getElementById("metricTotalIcon");
const metricAverageIcon = document.getElementById("metricAverageIcon");
const metricCountIcon = document.getElementById("metricCountIcon");
const metricBiggestIcon = document.getElementById("metricBiggestIcon");

const categoryList = document.getElementById("categoryList");
const categoryChips = document.getElementById("categoryChips");
const periodButtons = document.getElementById("periodButtons");
const expenseList = document.getElementById("expenseList");
const searchInput = document.getElementById("searchInput");

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const expenseForm = document.getElementById("expenseForm");

const titleInput = document.getElementById("titleInput");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");
const moodInput = document.getElementById("moodInput");

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getStartDateByPeriod(period) {
  const now = new Date();
  const start = new Date(now);

  if (period === "Неделя") {
    start.setDate(now.getDate() - 7);
  }

  if (period === "Месяц") {
    start.setMonth(now.getMonth() - 1);
  }

  if (period === "Квартал") {
    start.setMonth(now.getMonth() - 3);
  }

  if (period === "Год") {
    start.setFullYear(now.getFullYear() - 1);
  }

  start.setHours(0, 0, 0, 0);

  return start;
}

function getFilteredExpenses() {
  const startDate = getStartDateByPeriod(activePeriod);

  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);

      const matchesPeriod = expenseDate >= startDate;
      const matchesSearch = expense.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "Все" || expense.category === activeCategory;

      return matchesPeriod && matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getCategoriesData(filteredExpenses, total) {
  const categoryMap = {};

  filteredExpenses.forEach((expense) => {
    if (!categoryMap[expense.category]) {
      categoryMap[expense.category] = 0;
    }

    categoryMap[expense.category] += expense.amount;
  });

  return Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

function renderPeriodButtons() {
  periodButtons.innerHTML = "";

  periods.forEach((period) => {
    const button = document.createElement("button");
    button.className = "period-btn";

    if (period === activePeriod) {
      button.classList.add("active");
    }

    button.textContent = period;

    button.addEventListener("click", () => {
      activePeriod = period;
      renderApp();
    });

    periodButtons.appendChild(button);
  });
}

function renderCategoryChips() {
  categoryChips.innerHTML = "";

  const categories = ["Все", ...Object.keys(categorySettings)];

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "chip";

    if (category === activeCategory) {
      button.classList.add("active");
    }

    button.textContent = category;

    button.addEventListener("click", () => {
      activeCategory = category;
      renderApp();
    });

    categoryChips.appendChild(button);
  });
}

function renderSummaryBars(categoriesData) {
  summaryBars.innerHTML = "";

  if (categoriesData.length === 0) {
    summaryBars.innerHTML = `
      <div class="empty-state">
        <strong>Нет данных</strong>
        <span>Добавь расход или выбери другой период.</span>
      </div>
    `;
    return;
  }

  categoriesData.slice(0, 4).forEach((category) => {
    const settings = categorySettings[category.name];

    const row = document.createElement("div");
    row.className = "summary-row";

    row.innerHTML = `
      <div class="summary-row-top">
        <strong>${category.name}</strong>
        <span>${category.percent}%</span>
      </div>

      <div class="bar-track">
        <div class="bar-fill ${settings.barClass}" style="width: ${category.percent}%"></div>
      </div>
    `;

    summaryBars.appendChild(row);
  });
}

function renderCategoryList(categoriesData) {
  categoryList.innerHTML = "";

  if (categoriesData.length === 0) {
    categoryList.innerHTML = `
      <div class="empty-state">
        <strong>Категорий нет</strong>
        <span>По выбранным фильтрам ничего не найдено.</span>
      </div>
    `;
    return;
  }

  categoriesData.forEach((category) => {
    const settings = categorySettings[category.name];

    const button = document.createElement("button");
    button.className = "category-card";

    if (category.name === activeCategory) {
      button.classList.add("active");
    }

    button.innerHTML = `
      <div class="category-card-inner">
        <div class="category-icon ${settings.softClass}">
          ${settings.icon}
        </div>

        <div class="category-main">
          <div class="category-top">
            <div class="category-name">${category.name}</div>
            <div class="category-value">${formatMoney(category.value)}</div>
          </div>

          <div class="category-mini-track">
            <div
              class="category-mini-fill ${settings.colorClass}"
              style="width: ${category.percent}%"
            ></div>
          </div>
        </div>
      </div>
    `;

    button.addEventListener("click", () => {
      activeCategory = category.name;
      renderApp();
    });

    categoryList.appendChild(button);
  });
}

function renderExpenses(filteredExpenses) {
  expenseList.innerHTML = "";

  if (filteredExpenses.length === 0) {
    expenseList.innerHTML = `
      <div class="empty-state">
        <strong>Ничего не найдено</strong>
        <span>Попробуй выбрать другой период, категорию или изменить поиск.</span>
      </div>
    `;
    return;
  }

  filteredExpenses.forEach((expense) => {
    const settings = categorySettings[expense.category];

    const card = document.createElement("article");
    card.className = "expense-card";

    card.innerHTML = `
      <div class="expense-inner">
        <div class="expense-icon ${settings.softClass}">
          ${settings.icon}
        </div>

        <div class="expense-main">
          <div class="expense-top">
            <div>
              <div class="expense-title">${expense.title}</div>
              <div class="expense-meta">
                ${expense.category} · ${expense.mood} · ${expense.date}
              </div>
            </div>

            <div class="expense-amount">
              ${formatMoney(expense.amount)}
            </div>
          </div>
        </div>
      </div>
    `;

    expenseList.appendChild(card);
  });
}
function setMetricIcon(element, icon, state = "normal") {
  if (!element) return;

  element.className = "metric-icon dynamic";

  if (state === "pulse") {
    element.classList.add("pulse");
  }

  if (state === "danger") {
    element.classList.add("pulse", "danger");
  }

  element.innerHTML = icon;
}

function getTotalIconState(total) {
  if (total === 0) {
    return {
      icon: appIcons.wallet || "↘",
      state: "normal",
    };
  }

  if (total < 100) {
    return {
      icon: appIcons.handCoins || "↘",
      state: "normal",
    };
  }

  if (total < 500) {
    return {
      icon: appIcons.creditCard || "↘",
      state: "normal",
    };
  }

  if (total < 1000) {
    return {
      icon: appIcons.banknoteUp || "↘",
      state: "pulse",
    };
  }

  return {
    icon: appIcons.bellElectric || "↘",
    state: "danger",
  };
}

function getAverageIconState(average) {
  if (average === 0) {
    return {
      icon: appIcons.circleSlash || "〽",
      state: "normal",
    };
  }

  if (average < 10) {
    return {
      icon: appIcons.receipt || "〽",
      state: "normal",
    };
  }

  if (average < 50) {
    return {
      icon: appIcons.chartColumns || "〽",
      state: "normal",
    };
  }

  if (average < 150) {
    return {
      icon: appIcons.trendingUp || "〽",
      state: "pulse",
    };
  }

  return {
    icon: appIcons.triangleAlert || "〽",
    state: "danger",
  };
}

function getCountIconState(count) {
  if (count === 0) {
    return {
      icon: appIcons.calendarX || "▦",
      state: "normal",
    };
  }

  if (count <= 3) {
    return {
      icon: appIcons.list || "▦",
      state: "normal",
    };
  }

  if (count <= 10) {
    return {
      icon: appIcons.scrollText || "▦",
      state: "normal",
    };
  }

  if (count <= 25) {
    return {
      icon: appIcons.squareActivity || "▦",
      state: "pulse",
    };
  }

  return {
    icon: appIcons.gauge || "▦",
    state: "danger",
  };
}

function getBiggestIconState(biggest) {
  if (!biggest) {
    return {
      icon: appIcons.bellElectric || "🔥",
      state: "normal",
    };
  }

  const settings = categorySettings[biggest.category];

  return {
    icon: settings ? settings.icon : appIcons.bellElectric || "🔥",
    state: "pulse",
  };
}

function renderMetrics(filteredExpenses, total) {
  const average =
    filteredExpenses.length > 0 ? total / filteredExpenses.length : 0;

  const biggest = [...filteredExpenses].sort((a, b) => {
    return Number(b.amount) - Number(a.amount);
  })[0];

  summaryTotal.textContent = formatMoney(total);
  metricTotal.textContent = formatMoney(total);
  metricAverage.textContent = formatMoney(average);
  metricCount.textContent = filteredExpenses.length;

  const totalIconState = getTotalIconState(total);
  const averageIconState = getAverageIconState(average);
  const countIconState = getCountIconState(filteredExpenses.length);
  const biggestIconState = getBiggestIconState(biggest);

  setMetricIcon(metricTotalIcon, totalIconState.icon, totalIconState.state);
  setMetricIcon(metricAverageIcon, averageIconState.icon, averageIconState.state);
  setMetricIcon(metricCountIcon, countIconState.icon, countIconState.state);
  setMetricIcon(metricBiggestIcon, biggestIconState.icon, biggestIconState.state);

  if (biggest) {
    metricBiggest.textContent = formatMoney(Number(biggest.amount));
    metricBiggestNote.textContent = biggest.category;
  } else {
    metricBiggest.textContent = formatMoney(0);
    metricBiggestNote.textContent = "нет данных";
  }
}

function renderApp() {
  const filteredExpenses = getFilteredExpenses();
  const total = filteredExpenses.reduce((sum, expense) => {
    return sum + expense.amount;
  }, 0);

  const categoriesData = getCategoriesData(filteredExpenses, total);

  renderPeriodButtons();
  renderCategoryChips();
  renderMetrics(filteredExpenses, total);
  renderSummaryBars(categoriesData);
  renderCategoryList(categoriesData);
  renderExpenses(filteredExpenses);
}

function openModal() {
  modalBackdrop.classList.add("active");
  dateInput.value = getTodayDateString();
  titleInput.focus();
}

function closeModal() {
  modalBackdrop.classList.remove("active");
  expenseForm.reset();
}

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value;
    renderApp();
  });
}

if (openModalBtn) {
  openModalBtn.addEventListener("click", openModal);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (event) => {
    if (event.target === modalBackdrop) {
      closeModal();
    }
  });
}

if (expenseForm) {
  expenseForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newExpense = {
      id: Date.now(),
      title: titleInput.value.trim(),
      amount: Number(amountInput.value),
      category: categoryInput.value,
      date: dateInput.value,
      mood: moodInput.value,
    };

    expenses.unshift(newExpense);

    closeModal();
    renderApp();
  });
}

renderApp();
