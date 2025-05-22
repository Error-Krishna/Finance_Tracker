// // Updated API Base URL
// const API_BASE = "https://finance-tracker-tymo.onrender.com";

// // Elements
// const totalIncomeElem = document.getElementById("total-income");
// const totalExpensesElem = document.getElementById("total-expenses");
// const remainingBudgetElem = document.getElementById("remaining-budget");
// const availableBalanceElem = document.getElementById("available_balance");
// const expenseForm = document.getElementById("expense-form");
// const incomeForm = document.getElementById("income-form");
// const messageBox = document.getElementById("message-box");
// const spendingTrendsChartElem = document.getElementById("spending-trends-chart").getContext("2d");

// let spendingTrendsChart;

// // Function to show messages
// function showMessage(message, type = "success") {
//   messageBox.textContent = message;
//   messageBox.style.display = "block";
//   messageBox.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
//   messageBox.style.color = "#fff";

//   setTimeout(() => {
//     messageBox.style.display = "none";
//   }, 3000);
// }

// // Fetch Dashboard Data
// async function fetchDashboardData() {
//   try {
//     const user_id = localStorage.getItem("user_id");
//     const response = await fetch(`${API_BASE}/budget_status`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_id })
//     });

//     const data = await response.json();

//     totalIncomeElem.textContent = `₹${data.total_income}`;
//     totalExpensesElem.textContent = `₹${data.total_expenses}`;
//     remainingBudgetElem.textContent = `₹${data.remaining_budget}`;
//     availableBalanceElem.textContent = `₹${data.available_balance}`;

//     if (data.monthly_budget !== null && data.total_expenses > data.monthly_budget) {
//       showMessage("⚠️ You are exceeding your budget!", "error");
//     }

//   } catch (error) {
//     showMessage("Error loading dashboard data", "error");
//   }
// }

// // Fetch Spending Trends
// async function fetchSpendingTrends() {
//   try {
//     const user_id = localStorage.getItem("user_id");
//     const response = await fetch(`${API_BASE}/spending_trends`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_id })
//     });

//     const data = await response.json();

//     if (data.trends.length === 0) {
//       showMessage("No spending trends available", "error");
//       return;
//     }

//     const labels = data.trends.map(trend => trend._id);
//     const amounts = data.trends.map(trend => trend.total);

//     if (spendingTrendsChart) {
//       spendingTrendsChart.destroy();
//     }

//     spendingTrendsChart = new Chart(spendingTrendsChartElem, {
//       type: "doughnut",
//       data: {
//         labels,
//         datasets: [{
//           data: amounts,
//           backgroundColor: ["#f44336", "#ff9800", "#4caf50", "#2196f3"],
//         }]
//       }
//     });
//   } catch (error) {
//     showMessage("Error loading spending trends", "error");
//   }
// }

// // Add Expense
// expenseForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const user_id = localStorage.getItem("user_id");
//   const category = document.getElementById("expense-category").value;
//   const amount = parseFloat(document.getElementById("expense-amount").value);
//   const date = document.getElementById("expense-date").value;
//   const description = document.getElementById("expense-description").value;

//   if (amount <= 0) {
//     showMessage("Expense amount must be positive", "error");
//     return;
//   }

//   try {
//     const response = await fetch(`${API_BASE}/add_expense`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_id, category, amount, date, description })
//     });

//     if (response.ok) {
//       showMessage("Expense added successfully", "success");
//       fetchDashboardData();
//       fetchSpendingTrends();
//       expenseForm.reset();
//     } else {
//       showMessage("Error adding expense", "error");
//     }
//   } catch (error) {
//     showMessage("Error connecting to server", "error");
//   }
// });

// // Add Income
// incomeForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const user_id = localStorage.getItem("user_id");
//   const source = document.getElementById("income-source").value;
//   const amount = parseFloat(document.getElementById("income-amount").value);
//   const date = document.getElementById("income-date").value;

//   if (amount <= 0) {
//     showMessage("Income amount must be positive", "error");
//     return;
//   }

//   try {
//     const response = await fetch(`${API_BASE}/add_income`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_id, source, amount, date })
//     });

//     if (response.ok) {
//       showMessage("Income added successfully", "success");
//       fetchDashboardData();
//       incomeForm.reset();
//     } else {
//       showMessage("Error adding income", "error");
//     }
//   } catch (error) {
//     showMessage("Error connecting to server", "error");
//   }
// });

// // Budget Feature
// document.getElementById("budget-form")?.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const budget = parseFloat(document.getElementById("budget-amount").value);
//   const user_id = localStorage.getItem("user_id");

//   // 1. Update budget on backend
//   const res = await fetch(`${API_BASE}/set_budget`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ user_id, budget })
//   });

//   const data = await res.json();
//   showMessage(data.message, "success");

//   // 2. Fetch latest budget data
//   const statusRes = await fetch(`${API_BASE}/budget_status`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ user_id })
//   });

//   const statusData = await statusRes.json();

//   // 3. Update dashboard
//   document.getElementById("total-income").innerText = `₹${statusData.total_income.toFixed(2)}`;
//   document.getElementById("total-expenses").innerText = `₹${statusData.total_expenses.toFixed(2)}`;
//   document.getElementById("remaining-budget").innerText = `₹${statusData.remaining_budget.toFixed(2)}`;
//   document.getElementById("monthly-budget").innerText = `₹${statusData.monthly_budget?.toFixed(2) || 'Not Set'}`;
//   document.getElementById("available_balance").innerText = `₹${statusData.available_balance.toFixed(2)}`;

//   // 4. Handle over-budget warning
//   const overBudgetEl = document.getElementById("over-budget");
//   if (statusData.over_budget > 0) {
//     overBudgetEl.innerText = `⚠️ Over Budget by ₹${statusData.over_budget.toFixed(2)}`;
//     overBudgetEl.style.color = "red";
//     overBudgetEl.style.display = "block";
//   } else {
//     overBudgetEl.style.display = "none";
//   }

// });
// // PDF Download Feature
// document.getElementById("download-report")?.addEventListener("click", async () => {
//   const user_id = localStorage.getItem("user_id");

//   const budgetRes = await fetch(`${API_BASE}/budget_status`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ user_id })
//   });

//   const budgetData = await budgetRes.json();

//   const { jsPDF } = window.jspdf;
//   const doc = new jsPDF();

//   doc.setFontSize(18);
//   doc.text("Finance Report", 20, 20);
//   doc.setFontSize(12);
//   doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
//   doc.text(`Total Income: ₹${budgetData.total_income}`, 20, 50);
//   doc.text(`Total Expenses: ₹${budgetData.total_expenses}`, 20, 60);
//   doc.text(`Monthly Budget: ₹${budgetData.monthly_budget ?? "Not Set"}`, 20, 70);
//   doc.text(`Remaining Budget: ₹${budgetData.remaining_budget}`, 20, 80);

//   if (budgetData.monthly_budget !== null && budgetData.total_expenses > budgetData.monthly_budget) {
//     doc.setTextColor(255, 0, 0);
//     doc.text("⚠️ Warning: You're exceeding your budget!", 20, 95);
//   }

//   doc.save("Finance_Report.pdf");
// });

// // Initialize
// fetchDashboardData();
// fetchSpendingTrends();

const API_BASE = "https://finance-tracker-tymo.onrender.com";

// Elements
const totalIncomeElem = document.getElementById("total-income");
const totalExpensesElem = document.getElementById("total-expenses");
const remainingBudgetElem = document.getElementById("remaining-budget");
const availableBalanceElem = document.getElementById("available_balance");
const messageBox = document.getElementById("message-box");
const expenseForm = document.getElementById("expense-form");
const incomeForm = document.getElementById("income-form");
const spendingTrendsChartElem = document.getElementById("spending-trends-chart").getContext("2d");

let spendingTrendsChart;

// Show message
function showMessage(message, type = "success") {
  messageBox.textContent = message;
  messageBox.style.display = "block";
  messageBox.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
  messageBox.style.color = "#fff";

  setTimeout(() => {
    messageBox.style.display = "none";
  }, 3000);
}

// Fetch and update dashboard
async function fetchDashboardData() {
  try {
    const user_id = localStorage.getItem("user_id");

    const response = await fetch(`${API_BASE}/budget_status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id })
    });

    const data = await response.json();

    const income = data.total_income || 0;
    const expenses = data.total_expenses || 0;
    const budget = data.monthly_budget || 0;
    const balance = income - expenses;

    totalIncomeElem.textContent = `₹${income}`;
    totalExpensesElem.textContent = `₹${expenses}`;
    remainingBudgetElem.textContent = `₹${budget - expenses}`;
    availableBalanceElem.textContent = `₹${balance}`;

    const overBudgetEl = document.getElementById("over-budget");
    if (budget !== 0 && expenses > budget) {
      overBudgetEl.innerText = `⚠️ Over Budget by ₹${(expenses - budget).toFixed(2)}`;
      overBudgetEl.style.display = "block";
      overBudgetEl.style.color = "red";
      showMessage("⚠️ You are exceeding your budget!", "error");
    } else {
      overBudgetEl.style.display = "none";
    }

  } catch (error) {
    showMessage("Error loading dashboard data", "error");
  }
}

// Fetch Spending Trends
async function fetchSpendingTrends() {
  try {
    const user_id = localStorage.getItem("user_id");
    const response = await fetch(`${API_BASE}/spending_trends`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id })
    });

    const data = await response.json();

    if (data.trends.length === 0) {
      showMessage("No spending trends available", "error");
      return;
    }

    const labels = data.trends.map(trend => trend._id);
    const amounts = data.trends.map(trend => trend.total);

    if (spendingTrendsChart) {
      spendingTrendsChart.destroy();
    }

    spendingTrendsChart = new Chart(spendingTrendsChartElem, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: amounts,
          backgroundColor: ["#f44336", "#ff9800", "#4caf50", "#2196f3"],
        }]
      }
    });
  } catch (error) {
    showMessage("Error loading spending trends", "error");
  }
}

// Expense Submit
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user_id = localStorage.getItem("user_id");
  const category = document.getElementById("expense-category").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const date = document.getElementById("expense-date").value;
  const description = document.getElementById("expense-description").value;

  if (amount <= 0) {
    showMessage("Expense amount must be positive", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/add_expense`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, category, amount, date, description })
    });

    if (response.ok) {
      showMessage("Expense added successfully", "success");
      fetchDashboardData();
      fetchSpendingTrends();
      expenseForm.reset();
    } else {
      showMessage("Error adding expense", "error");
    }
  } catch (error) {
    showMessage("Error connecting to server", "error");
  }
});

// Income Submit
incomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user_id = localStorage.getItem("user_id");
  const source = document.getElementById("income-source").value;
  const amount = parseFloat(document.getElementById("income-amount").value);
  const date = document.getElementById("income-date").value;

  if (amount <= 0) {
    showMessage("Income amount must be positive", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/add_income`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, source, amount, date })
    });

    if (response.ok) {
      showMessage("Income added successfully", "success");
      fetchDashboardData();
      incomeForm.reset();
    } else {
      showMessage("Error adding income", "error");
    }
  } catch (error) {
    showMessage("Error connecting to server", "error");
  }
});

// Budget Submit
document.getElementById("budget-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const budget = parseFloat(document.getElementById("budget-amount").value);
  const user_id = localStorage.getItem("user_id");

  const res = await fetch(`${API_BASE}/set_budget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, budget })
  });

  const data = await res.json();
  showMessage(data.message, "success");

  fetchDashboardData();
});

// PDF Report Download
document.getElementById("download-report")?.addEventListener("click", async () => {
  const user_id = localStorage.getItem("user_id");

  const budgetRes = await fetch(`${API_BASE}/budget_status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id })
  });

  const budgetData = await budgetRes.json();

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Finance Report", 20, 20);
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Total Income: ₹${budgetData.total_income}`, 20, 50);
  doc.text(`Total Expenses: ₹${budgetData.total_expenses}`, 20, 60);
  doc.text(`Monthly Budget: ₹${budgetData.monthly_budget ?? "Not Set"}`, 20, 70);
  doc.text(`Remaining Budget: ₹${budgetData.remaining_budget}`, 20, 80);
  doc.text(`Available Balance: ₹${budgetData.available_balance}`, 20, 90);

  if (budgetData.monthly_budget !== null && budgetData.total_expenses > budgetData.monthly_budget) {
    doc.setTextColor(255, 0, 0);
    doc.text("⚠️ Warning: You're exceeding your budget!", 20, 105);
  }

  doc.save("Finance_Report.pdf");
});

// Initialize
fetchDashboardData();
fetchSpendingTrends();