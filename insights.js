let expenses = [];
let recurringExpenses = [];
let currentUser = null;
let monthlyBudget = 0;

const logoutBtn = document.getElementById("logoutBtn");

const budgetLeft = document.getElementById("budgetLeft");
const budgetStatus = document.getElementById("budgetStatus");
const budgetFill = document.getElementById("budgetFill");
const monthlyBudgetText = document.getElementById("monthlyBudgetText");
const monthSpentText = document.getElementById("monthSpentText");
const forecastText = document.getElementById("forecastText");
const dailyLimitText = document.getElementById("dailyLimitText");

const appIcons = window.icons || {};

const budgetIcon = document.getElementById("budgetIcon");
const topWeekdayIcon = document.getElementById("topWeekdayIcon");
const dangerCategoryIcon = document.getElementById("dangerCategoryIcon");
const impulseIcon = document.getElementById("impulseIcon");
const forecastIcon = document.getElementById("forecastIcon");
const adviceIcon = document.getElementById("adviceIcon");

const budgetForm = document.getElementById("budgetForm");
const budgetInput = document.getElementById("budgetInput");

const topWeekday = document.getElementById("topWeekday");
const topWeekdayText = document.getElementById("topWeekdayText");

const dangerCategory = document.getElementById("dangerCategory");
const dangerCategoryText = document.getElementById("dangerCategoryText");

const impulseTotal = document.getElementById("impulseTotal");
const impulseText = document.getElementById("impulseText");

const monthForecast = document.getElementById("monthForecast");
const forecastDescription = document.getElementById("forecastDescription");

const habitList = document.getElementById("habitList");
const expensiveDayBlock = document.getElementById("expensiveDayBlock");

const recurringList = document.getElementById("recurringList");
const openRecurringModalBtn = document.getElementById("openRecurringModalBtn");
const closeRecurringModalBtn = document.getElementById("closeRecurringModalBtn");
const recurringModalBackdrop = document.getElementById("recurringModalBackdrop");
const recurringForm = document.getElementById("recurringForm");
const saveRecurringBtn = document.getElementById("saveRecurringBtn");

const recurringTitleInput = document.getElementById("recurringTitleInput");
const recurringAmountInput = document.getElementById("recurringAmountInput");
const recurringCategoryInput = document.getElementById("recurringCategoryInput");
const recurringDayInput = document.getElementById("recurringDayInput");

const adviceTitle = document.getElementById("adviceTitle");
const adviceText = document.getElementById("adviceText");

const weekdays = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

function setInsightIcon(element, icon, state = "normal") {
  if (!element) return;

  element.classList.remove("pulse", "danger", "good");

  if (state === "pulse") {
    element.classList.add("pulse");
  }

  if (state === "danger") {
    element.classList.add("danger");
  }

  if (state === "good") {
    element.classList.add("good");
  }

  element.innerHTML = icon || "";
}

function getCategoryIcon(category) {
  const map = {
    Еда: appIcons.food,
    Транспорт: appIcons.transport,
    Кафе: appIcons.cafe,
    Дом: appIcons.home,
    Покупки: appIcons.shopping,
    Подписки: appIcons.subscriptions,
  };

  return map[category] || appIcons.budgetRisk || "";
}

function renderBudgetIcon(monthSpent, forecast) {
  const budget = Number(monthlyBudget || 0);

  if (!budget) {
    setInsightIcon(budgetIcon, appIcons.budgetUnset, "normal");
    return;
  }

  const usedPercent = monthSpent / budget;
  const forecastPercent = forecast / budget;

  if (monthSpent > budget || forecastPercent > 1.15) {
    setInsightIcon(budgetIcon, appIcons.budgetOver, "danger");
    return;
  }

  if (forecastPercent > 1) {
    setInsightIcon(budgetIcon, appIcons.budgetRisk, "danger");
    return;
  }

  if (usedPercent >= 0.8) {
    setInsightIcon(budgetIcon, appIcons.budgetNearLimit, "pulse");
    return;
  }

  setInsightIcon(budgetIcon, appIcons.budgetGood, "good");
}

function renderTopWeekdayIcon(monthExpenses) {
  if (!monthExpenses.length) {
    setInsightIcon(topWeekdayIcon, appIcons.riskDayEmpty, "normal");
    return;
  }

  const map = {};

  monthExpenses.forEach((expense) => {
    const day = new Date(expense.expense_date).getDay();

    if (!map[day]) {
      map[day] = {
        count: 0,
        total: 0,
      };
    }

    map[day].count += 1;
    map[day].total += Number(expense.amount || 0);
  });

  const top = Object.values(map).sort((a, b) => b.count - a.count)[0];

  if (top.total >= 150) {
    setInsightIcon(topWeekdayIcon, appIcons.riskDayExpensive, "danger");
    return;
  }

  if (top.count >= 3) {
    setInsightIcon(topWeekdayIcon, appIcons.riskDayFrequent, "pulse");
    return;
  }

  setInsightIcon(topWeekdayIcon, appIcons.riskDayNormal, "normal");
}

function renderDangerCategoryIcon(monthExpenses) {
  if (!monthExpenses.length) {
    setInsightIcon(dangerCategoryIcon, appIcons.budgetRisk, "normal");
    return;
  }

  const categoryMap = {};

  monthExpenses.forEach((expense) => {
    if (!categoryMap[expense.category]) {
      categoryMap[expense.category] = 0;
    }

    categoryMap[expense.category] += Number(expense.amount || 0);
  });

  const [category, value] = Object.entries(categoryMap).sort((a, b) => {
    return b[1] - a[1];
  })[0];

  const total = getMonthTotal(monthExpenses);
  const percent = total > 0 ? value / total : 0;

  if (percent >= 0.45) {
    setInsightIcon(dangerCategoryIcon, getCategoryIcon(category), "danger");
    return;
  }

  setInsightIcon(dangerCategoryIcon, getCategoryIcon(category), "pulse");
}

function renderImpulseIcon(monthExpenses) {
  const impulses = monthExpenses.filter((expense) => {
    return String(expense.mood || "").toLowerCase() === "импульс";
  });

  const count = impulses.length;

  if (count === 0) {
    setInsightIcon(impulseIcon, appIcons.impulseZero, "good");
    return;
  }

  if (count <= 2) {
    setInsightIcon(impulseIcon, appIcons.impulseLow, "normal");
    return;
  }

  if (count <= 5) {
    setInsightIcon(impulseIcon, appIcons.impulseMedium, "pulse");
    return;
  }

  setInsightIcon(impulseIcon, appIcons.impulseHigh, "danger");
}

function renderForecastIcon(monthSpent, forecast) {
  const budget = Number(monthlyBudget || 0);

  if (!monthSpent) {
    setInsightIcon(forecastIcon, appIcons.forecastEmpty, "normal");
    return;
  }

  if (budget && forecast > budget * 1.2) {
    setInsightIcon(forecastIcon, appIcons.forecastDanger, "danger");
    return;
  }

  if (budget && forecast > budget) {
    setInsightIcon(forecastIcon, appIcons.forecastOverBudget, "danger");
    return;
  }

  if (forecast > monthSpent) {
    setInsightIcon(forecastIcon, appIcons.forecastGrowing, "pulse");
    return;
  }

  setInsightIcon(forecastIcon, appIcons.forecastNormal, "good");
}

function renderAllInsightIcons(monthExpenses, monthSpent, forecast) {
  renderBudgetIcon(monthSpent, forecast);
  renderTopWeekdayIcon(monthExpenses);
  renderDangerCategoryIcon(monthExpenses);
  renderImpulseIcon(monthExpenses);
  renderForecastIcon(monthSpent, forecast);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCurrentMonthExpenses() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return expenses.filter((expense) => {
    const date = new Date(expense.expense_date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
}

function getDaysInMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function getCurrentDay() {
  return new Date().getDate();
}

function getRemainingDays() {
  return Math.max(getDaysInMonth() - getCurrentDay(), 1);
}

async function checkAuth() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.href = "auth.html";
    return;
  }

  currentUser = data.session.user;
}

async function loadExpenses() {
  const { data, error } = await supabaseClient
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  expenses = data || [];
}

async function loadSettings() {
  const { data, error } = await supabaseClient
    .from("user_settings")
    .select("*")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    monthlyBudget = Number(data.monthly_budget || 0);
    budgetInput.value = monthlyBudget || "";
  } else {
    monthlyBudget = 0;
  }
}

async function loadRecurringExpenses() {
  const { data, error } = await supabaseClient
    .from("recurring_expenses")
    .select("*")
    .order("billing_day", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  recurringExpenses = data || [];
}

function getMonthTotal(monthExpenses) {
  return monthExpenses.reduce((sum, expense) => {
    return sum + Number(expense.amount || 0);
  }, 0);
}

function calculateForecast(monthSpent) {
  const currentDay = getCurrentDay();
  const daysInMonth = getDaysInMonth();

  if (currentDay <= 0) {
    return monthSpent;
  }

  const dailyAverage = monthSpent / currentDay;
  return dailyAverage * daysInMonth;
}

function renderBudget(monthSpent, forecast) {
  const budget = Number(monthlyBudget || 0);
  const leftByForecast = budget - forecast;
  const remainingDays = getRemainingDays();

  monthlyBudgetText.textContent = formatMoney(budget);
  monthSpentText.textContent = formatMoney(monthSpent);
  forecastText.textContent = formatMoney(forecast);

  const dailyLimit = budget > monthSpent ? (budget - monthSpent) / remainingDays : 0;
  dailyLimitText.textContent = formatMoney(dailyLimit);

  budgetLeft.textContent = formatMoney(leftByForecast);

  if (!budget) {
    budgetStatus.textContent = "Бюджет не задан";
    budgetStatus.className = "budget-status";
    budgetFill.style.width = "0%";
    budgetFill.className = "budget-fill";
    return;
  }

  const percent = Math.min(Math.round((monthSpent / budget) * 100), 100);
  budgetFill.style.width = `${percent}%`;

  if (forecast > budget) {
    budgetStatus.textContent = "Риск перерасхода";
    budgetStatus.className = "budget-status danger";
    budgetFill.className = "budget-fill danger";
  } else {
    budgetStatus.textContent = "В пределах бюджета";
    budgetStatus.className = "budget-status good";
    budgetFill.className = "budget-fill";
  }
}

function renderTopWeekday(monthExpenses) {
  const map = {};

  monthExpenses.forEach((expense) => {
    const dayIndex = new Date(expense.expense_date).getDay();
    const dayName = weekdays[dayIndex];

    if (!map[dayName]) {
      map[dayName] = {
        count: 0,
        total: 0,
      };
    }

    map[dayName].count += 1;
    map[dayName].total += Number(expense.amount || 0);
  });

  const sorted = Object.entries(map).sort((a, b) => b[1].count - a[1].count);

  if (!sorted.length) {
    topWeekday.textContent = "—";
    topWeekdayText.textContent = "Пока недостаточно расходов для анализа.";
    return;
  }

  const [day, info] = sorted[0];

  topWeekday.textContent = day;
  topWeekdayText.textContent = `Ты чаще всего тратишь деньги в этот день: ${info.count} операций на сумму ${formatMoney(info.total)}.`;
}

function renderDangerCategory(monthExpenses) {
  const map = {};

  monthExpenses.forEach((expense) => {
    const category = expense.category;

    if (!map[category]) {
      map[category] = 0;
    }

    map[category] += Number(expense.amount || 0);
  });

  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

  if (!sorted.length) {
    dangerCategory.textContent = "—";
    dangerCategoryText.textContent = "Пока нет данных по категориям.";
    return;
  }

  const [category, total] = sorted[0];

  dangerCategory.textContent = category;
  dangerCategoryText.textContent = `Эта категория забрала больше всего денег за месяц: ${formatMoney(total)}.`;
}

function renderImpulse(monthExpenses) {
  const impulseExpenses = monthExpenses.filter((expense) => {
    return String(expense.mood || "").toLowerCase() === "импульс";
  });

  const total = impulseExpenses.reduce((sum, expense) => {
    return sum + Number(expense.amount || 0);
  }, 0);

  const average = impulseExpenses.length ? total / impulseExpenses.length : 0;

  impulseTotal.textContent = formatMoney(total);

  if (!impulseExpenses.length) {
    impulseText.textContent = "Импульсивных расходов пока нет. Это хороший знак.";
    return;
  }

  impulseText.textContent = `Всего импульсивных покупок: ${impulseExpenses.length}. Средний импульсивный расход: ${formatMoney(average)}.`;
}

function renderForecast(monthSpent, forecast) {
  monthForecast.textContent = formatMoney(forecast);

  if (!monthSpent) {
    forecastDescription.textContent = "Пока нет расходов за текущий месяц.";
    return;
  }

  forecastDescription.textContent = `Если темп расходов сохранится, к концу месяца получится примерно ${formatMoney(forecast)}.`;
}

function renderMostExpensiveDay(monthExpenses) {
  const map = {};

  monthExpenses.forEach((expense) => {
    const date = expense.expense_date;

    if (!map[date]) {
      map[date] = 0;
    }

    map[date] += Number(expense.amount || 0);
  });

  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

  if (!sorted.length) {
    expensiveDayBlock.innerHTML = `
      <div class="empty-state">
        <strong>Данных пока нет</strong>
        <span>Добавь расходы, и здесь появится самый дорогой день.</span>
      </div>
    `;
    return;
  }

  const [date, total] = sorted[0];

  expensiveDayBlock.innerHTML = `
    <div class="expensive-day-main">
      <div class="expensive-day-date">${date}</div>
      <div class="expensive-day-amount">${formatMoney(total)}</div>
      <div class="expensive-day-text">
        Это был самый дорогой день месяца. Проверь, какие покупки сделали его таким.
      </div>
    </div>
  `;
}

function renderHabits(monthExpenses, monthSpent, forecast) {
  const impulseExpenses = monthExpenses.filter((expense) => {
    return String(expense.mood || "").toLowerCase() === "импульс";
  });

  const recurringTotal = recurringExpenses.reduce((sum, item) => {
    return sum + Number(item.amount || 0);
  }, 0);

  const habits = [
    {
      icon: appIcons.habitBrain,
      state: "normal",
      title: "Всего расходов за месяц",
      text: `Ты уже потратил ${formatMoney(monthSpent)} в этом месяце.`,
    },
    {
      icon:
        impulseExpenses.length >= 3
          ? appIcons.impulseMedium
          : impulseExpenses.length > 0
            ? appIcons.impulseLow
            : appIcons.impulseZero,
      state:
        impulseExpenses.length >= 3
          ? "pulse"
          : impulseExpenses.length > 0
            ? "normal"
            : "good",
      title: "Импульсивные покупки",
      text: `Количество импульсивных покупок: ${impulseExpenses.length}.`,
    },
    {
      icon:
        recurringExpenses.length === 0
          ? appIcons.recurringEmpty
          : recurringExpenses.length >= 3
            ? appIcons.recurringMany
            : appIcons.recurringNormal,
      state:
        recurringExpenses.length === 0
          ? "normal"
          : recurringExpenses.length >= 3
            ? "pulse"
            : "good",
      title: "Регулярные платежи",
      text: `Фиксированные расходы месяца: ${formatMoney(recurringTotal)}.`,
    },
    {
      icon:
        monthlyBudget && forecast > monthlyBudget
          ? appIcons.forecastOverBudget
          : monthSpent > 0
            ? appIcons.forecastGrowing
            : appIcons.forecastEmpty,
      state:
        monthlyBudget && forecast > monthlyBudget
          ? "danger"
          : monthSpent > 0
            ? "pulse"
            : "normal",
      title: "Прогноз",
      text: `Текущий прогноз до конца месяца: ${formatMoney(forecast)}.`,
    },
  ];

  habitList.innerHTML = habits
    .map((habit) => {
      return `
        <div class="habit-item">
          <div class="habit-emoji ${habit.state}">
            ${habit.icon || ""}
          </div>

          <div>
            <strong>${habit.title}</strong>
            <span>${habit.text}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderRecurringExpenses() {
  if (!recurringExpenses.length) {
    recurringList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          ${appIcons.recurringEmpty || ""}
        </div>
        <strong>Регулярных расходов пока нет</strong>
        <span>Добавь аренду, подписки, телефон или интернет.</span>
      </div>
    `;
    return;
  }

  recurringList.innerHTML = recurringExpenses
    .map((item) => {
      const amount = Number(item.amount || 0);

      let icon = appIcons.recurringNormal;
      let state = "good";

      if (recurringExpenses.length >= 3) {
        icon = appIcons.recurringMany;
        state = "pulse";
      }

      if (amount >= 100) {
        icon = appIcons.recurringHigh;
        state = "danger";
      }

      return `
        <div class="recurring-item">
          <div class="recurring-emoji ${state}">
            ${icon || ""}
          </div>

          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.category)} · списание ${item.billing_day} числа</span>
          </div>

          <div class="recurring-right">
            <div class="recurring-amount">${formatMoney(item.amount)}</div>
            <button class="delete-small-btn" data-id="${item.id}">
              удалить
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll(".delete-small-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteRecurringExpense(button.dataset.id);
    });
  });
}

function renderAdvice(monthExpenses, monthSpent, forecast) {
  if (!monthExpenses.length) {
    setInsightIcon(adviceIcon, appIcons.adviceDefault, "normal");

    adviceTitle.textContent = "Добавь первые расходы";
    adviceText.textContent =
      "После нескольких операций MoneyPulse сможет показать реальные финансовые привычки.";
    return;
  }

  if (monthlyBudget && forecast > monthlyBudget) {
    setInsightIcon(adviceIcon, appIcons.adviceWarning, "danger");

    adviceTitle.textContent = "Есть риск выйти за бюджет";
    adviceText.textContent =
      "Попробуй временно сократить импульсивные покупки и кафе. Так проще удержаться в месячном лимите.";
    return;
  }

  const impulseExpenses = monthExpenses.filter((expense) => {
    return String(expense.mood || "").toLowerCase() === "импульс";
  });

  if (impulseExpenses.length >= 3) {
    setInsightIcon(adviceIcon, appIcons.adviceSaving, "pulse");

    adviceTitle.textContent = "Импульсивные траты заметны";
    adviceText.textContent =
      "Перед небольшими покупками попробуй правило 24 часов: если завтра всё ещё нужно — покупай.";
    return;
  }

  setInsightIcon(adviceIcon, appIcons.adviceGood, "good");

  adviceTitle.textContent = "Финансовый темп выглядит нормально";
  adviceText.textContent =
    "Продолжай добавлять расходы. Чем больше данных, тем точнее будут выводы и прогнозы.";
}

function renderInsights() {
  const monthExpenses = getCurrentMonthExpenses();
  const monthSpent = getMonthTotal(monthExpenses);
  const forecast = calculateForecast(monthSpent);

  renderAllInsightIcons(monthExpenses, monthSpent, forecast);
  
  renderBudget(monthSpent, forecast);
  renderTopWeekday(monthExpenses);
  renderDangerCategory(monthExpenses);
  renderImpulse(monthExpenses);
  renderForecast(monthSpent, forecast);
  renderMostExpensiveDay(monthExpenses);
  renderHabits(monthExpenses, monthSpent, forecast);
  renderRecurringExpenses();
  renderAdvice(monthExpenses, monthSpent, forecast);
  
}

async function saveBudget(value) {
  const { error } = await supabaseClient
    .from("user_settings")
    .upsert({
      user_id: currentUser.id,
      monthly_budget: value,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    alert("Ошибка сохранения бюджета: " + error.message);
    return;
  }

  monthlyBudget = value;
  renderInsights();
}

function openRecurringModal() {
  recurringModalBackdrop.classList.add("active");
  recurringTitleInput.focus();
}

function closeRecurringModal() {
  recurringModalBackdrop.classList.remove("active");
  recurringForm.reset();
}

async function addRecurringExpense(item) {
  saveRecurringBtn.disabled = true;
  saveRecurringBtn.textContent = "Сохраняем...";

  const { data, error } = await supabaseClient
    .from("recurring_expenses")
    .insert({
      user_id: currentUser.id,
      title: item.title,
      category: item.category,
      amount: item.amount,
      billing_day: item.billing_day,
    })
    .select()
    .single();

  saveRecurringBtn.disabled = false;
  saveRecurringBtn.textContent = "Сохранить регулярный расход";

  if (error) {
    alert("Ошибка сохранения: " + error.message);
    return;
  }

  recurringExpenses.push(data);
  closeRecurringModal();
  renderInsights();
}

async function deleteRecurringExpense(id) {
  const confirmed = confirm("Удалить регулярный расход?");

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("recurring_expenses")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Ошибка удаления: " + error.message);
    return;
  }

  recurringExpenses = recurringExpenses.filter((item) => item.id !== id);
  renderInsights();
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "auth.html";
}

budgetForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const value = Number(budgetInput.value);

  if (value < 0) {
    alert("Бюджет не может быть отрицательным.");
    return;
  }

  await saveBudget(value);
});

openRecurringModalBtn.addEventListener("click", openRecurringModal);
closeRecurringModalBtn.addEventListener("click", closeRecurringModal);
logoutBtn.addEventListener("click", logout);

recurringModalBackdrop.addEventListener("click", (event) => {
  if (event.target === recurringModalBackdrop) {
    closeRecurringModal();
  }
});

recurringForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = recurringTitleInput.value.trim();
  const amount = Number(recurringAmountInput.value);
  const category = recurringCategoryInput.value;
  const billingDay = Number(recurringDayInput.value);

  if (!title) {
    alert("Введи название регулярного расхода.");
    return;
  }

  if (!amount || amount <= 0) {
    alert("Сумма должна быть больше 0.");
    return;
  }

  if (billingDay < 1 || billingDay > 31) {
    alert("День списания должен быть от 1 до 31.");
    return;
  }

  await addRecurringExpense({
    title,
    amount,
    category,
    billing_day: billingDay,
  });
});

async function initInsights() {
  await checkAuth();
  await loadExpenses();
  await loadSettings();
  await loadRecurringExpenses();
  renderInsights();
}

initInsights();
