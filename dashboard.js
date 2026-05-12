let expenses = [];
let currentUser = null;

const periods = ["Неделя", "Месяц", "Квартал", "Год"];

const categorySettings = {
  Еда: {
    icon: icons.food,
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

const userEmail = document.getElementById("userEmail");

const summaryTotal = document.getElementById("summaryTotal");
const summaryBars = document.getElementById("summaryBars");

const metricTotal = document.getElementById("metricTotal");
const metricAverage = document.getElementById("metricAverage");
const metricCount = document.getElementById("metricCount");
const metricBiggest = document.getElementById("metricBiggest");
const metricBiggestNote = document.getElementById("metricBiggestNote");

const categoryList = document.getElementById("categoryList");
const categoryChips = document.getElementById("categoryChips");
const periodButtons = document.getElementById("periodButtons");
const expenseList = document.getElementById("expenseList");
const searchInput = document.getElementById("searchInput");

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const expenseForm = document.getElementById("expenseForm");
const saveExpenseBtn = document.getElementById("saveExpenseBtn");
const logoutBtn = document.getElementById("logoutBtn");

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

    categoryMap[expense.category] += Number(expense.amount);
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

  if (biggest) {
    metricBiggest.textContent = formatMoney(Number(biggest.amount));
    metricBiggestNote.textContent = biggest.category;
  } else {
    metricBiggest.textContent = formatMoney(0);
    metricBiggestNote.textContent = "нет данных";
  }
}

function renderSummaryBars(categoriesData) {
  summaryBars.innerHTML = "";

  if (categoriesData.length === 0) {
    summaryBars.innerHTML = `
      <div class="empty-state">
        <strong>Нет данных</strong>
        <span>Добавь свой первый расход.</span>
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
        <strong>Категорий пока нет</strong>
        <span>Добавь расходы, и здесь появится структура затрат.</span>
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
        <div class="category-dot ${settings.colorClass}"></div>

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
        <strong>Расходов пока нет</strong>
        <span>Нажми “Добавить расход”, чтобы создать первую запись.</span>
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
              <div class="expense-title">${escapeHtml(expense.title)}</div>
              <div class="expense-meta">
                ${expense.category} · ${expense.mood} · ${expense.date}
              </div>
            </div>

            <div class="expense-amount">
              ${formatMoney(Number(expense.amount))}
            </div>
          </div>
        </div>

        <button class="delete-expense-btn" data-id="${expense.id}">
          Удалить
        </button>
      </div>
    `;

    expenseList.appendChild(card);
  });

  document.querySelectorAll(".delete-expense-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const expenseId = button.dataset.id;
      await deleteExpense(expenseId);
    });
  });
}

function renderApp() {
  const filteredExpenses = getFilteredExpenses();

  const total = filteredExpenses.reduce((sum, expense) => {
    return sum + Number(expense.amount);
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

function showLoading() {
  expenseList.innerHTML = `
    <div class="loading-state">
      Загружаем твои расходы...
    </div>
  `;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeExpenseFromDatabase(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount),
    date: row.expense_date,
    mood: row.mood || "База",
    createdAt: row.created_at,
  };
}

async function checkAuth() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
    window.location.href = "auth.html";
    return;
  }

  if (!data.session) {
    window.location.href = "auth.html";
    return;
  }

  currentUser = data.session.user;
  userEmail.textContent = currentUser.email || "личный кабинет";
}

async function loadExpenses() {
  showLoading();

  const { data, error } = await supabaseClient
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);

    expenseList.innerHTML = `
      <div class="empty-state">
        <strong>Ошибка загрузки</strong>
        <span>${escapeHtml(error.message)}</span>
      </div>
    `;

    return;
  }

  expenses = data.map(normalizeExpenseFromDatabase);
  renderApp();
}

async function addExpense(newExpense) {
  saveExpenseBtn.disabled = true;
  saveExpenseBtn.textContent = "Сохраняем...";

  const { data, error } = await supabaseClient
    .from("expenses")
    .insert({
      user_id: currentUser.id,
      title: newExpense.title,
      category: newExpense.category,
      amount: newExpense.amount,
      expense_date: newExpense.date,
      mood: newExpense.mood,
    })
    .select()
    .single();

  saveExpenseBtn.disabled = false;
  saveExpenseBtn.textContent = "Сохранить расход";

  if (error) {
    alert("Ошибка сохранения: " + error.message);
    return;
  }

  expenses.unshift(normalizeExpenseFromDatabase(data));
  closeModal();
  renderApp();
}

async function deleteExpense(expenseId) {
  const isConfirmed = confirm("Удалить этот расход?");

  if (!isConfirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    alert("Ошибка удаления: " + error.message);
    return;
  }

  expenses = expenses.filter((expense) => expense.id !== expenseId);
  renderApp();
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "auth.html";
}

searchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value;
  renderApp();
});

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
logoutBtn.addEventListener("click", logout);

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;
  const mood = moodInput.value;

  if (!title) {
    alert("Введи название расхода.");
    return;
  }

  if (!amount || amount <= 0) {
    alert("Сумма должна быть больше 0.");
    return;
  }

  if (!date) {
    alert("Выбери дату.");
    return;
  }

  await addExpense({
    title,
    amount,
    category,
    date,
    mood,
  });
});

async function initDashboard() {
  renderPeriodButtons();
  renderCategoryChips();
  showLoading();

  await checkAuth();
  await loadExpenses();
}

initDashboard();
