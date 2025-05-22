// const API_BASE = "https://finance-tracker-tymo.onrender.com";

// // Elements
// const totalIncomeElem = document.getElementById("total-income");
// const totalExpensesElem = document.getElementById("total-expenses");
// const remainingBudgetElem = document.getElementById("remaining-budget");
// const availableBalanceElem = document.getElementById("available_balance");
// const messageBox = document.getElementById("message-box");
// const expenseForm = document.getElementById("expense-form");
// const incomeForm = document.getElementById("income-form");
// const spendingTrendsChartElem = document.getElementById("spending-trends-chart").getContext("2d");

// let spendingTrendsChart;

// // Show message
// function showMessage(message, type = "success") {
//   messageBox.textContent = message;
//   messageBox.style.display = "block";
//   messageBox.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
//   messageBox.style.color = "#fff";

//   setTimeout(() => {
//     messageBox.style.display = "none";
//   }, 3000);
// }

// // Fetch and update dashboard
// async function fetchDashboardData() {
//   try {
//     const user_id = localStorage.getItem("user_id");
//     const response = await fetch(`${API_BASE}/budget_status`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_id })
//     });

//     const data = await response.json();

//     // Format values with 2 decimal places
//     const formatCurrency = (value) => `₹${value.toFixed(2)}`;

//     totalIncomeElem.textContent = formatCurrency(data.total_income || 0);
//     totalExpensesElem.textContent = formatCurrency(data.total_expenses || 0);
//     remainingBudgetElem.textContent = formatCurrency(data.remaining_budget || 0);
//     availableBalanceElem.textContent = formatCurrency(data.available_balance || 0);

//     // Handle over-budget warning
//     const overBudgetEl = document.getElementById("over-budget");
//     if (data.over_budget > 0) {
//       overBudgetEl.textContent = `⚠️ Over Budget by ${formatCurrency(data.over_budget)}`;
//       overBudgetEl.style.display = "block";
//       overBudgetEl.style.color = "red";
//       showMessage("⚠️ You are exceeding your budget!", "error");
//     } else {
//       overBudgetEl.style.display = "none";
//     }

//   } catch (error) {
//   console.error("Dashboard error:", {
//     message: error.message,
//     stack: error.stack,
//     response: error.response // if using axios or similar
//   });
//   showMessage("Error loading dashboard data", "error");
// }
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

// // Expense Submit
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

// // Income Submit
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

// // Budget Submit
// document.getElementById("budget-form")?.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const budget = parseFloat(document.getElementById("budget-amount").value);
//   const user_id = localStorage.getItem("user_id");

//   const res = await fetch(`${API_BASE}/set_budget`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ user_id, budget })
//   });

//   const data = await res.json();
//   showMessage(data.message, "success");

//   fetchDashboardData();
// });

// // PDF Report Download
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
//   doc.text(`Available Balance: ₹${budgetData.available_balance}`, 20, 90);

//   if (budgetData.monthly_budget !== null && budgetData.total_expenses > budgetData.monthly_budget) {
//     doc.setTextColor(255, 0, 0);
//     doc.text("⚠️ Warning: You're exceeding your budget!", 20, 105);
//   }

//   doc.save("Finance_Report.pdf");
// });

// // Initialize
// fetchDashboardData();
// fetchSpendingTrends();


const API_BASE = "https://finance-tracker-tymo.onrender.com";

// Wait for DOM to load before executing
document.addEventListener("DOMContentLoaded", () => {
  // Elements - with null checks
  const totalIncomeElem = document.getElementById("total-income");
  const totalExpensesElem = document.getElementById("total-expenses");
  const remainingBudgetElem = document.getElementById("remaining-budget");
  const availableBalanceElem = document.getElementById("available-balance"); // Fixed ID (was available_balance)
  const messageBox = document.getElementById("message-box");
  const expenseForm = document.getElementById("expense-form");
  const incomeForm = document.getElementById("income-form");
  const spendingTrendsChartCanvas = document.getElementById("spending-trends-chart");
  const spendingTrendsChartElem = spendingTrendsChartCanvas ? spendingTrendsChartCanvas.getContext("2d") : null;
  const overBudgetEl = document.getElementById("over-budget");
  const budgetForm = document.getElementById("budget-form");
  const downloadReportBtn = document.getElementById("download-report");

  let spendingTrendsChart;

  // Safe element updater
  const updateElement = (elem, value) => {
    if (!elem) {
      console.error("Element not found:", elem);
      return false;
    }
    elem.textContent = value;
    return true;
  };

  // Show message
  function showMessage(message, type = "success") {
    if (!messageBox) {
      console.error("Message box element not found");
      return;
    }
    
    messageBox.textContent = message;
    messageBox.style.display = "block";
    messageBox.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
    messageBox.style.color = "#fff";

    setTimeout(() => {
      messageBox.style.display = "none";
    }, 3000);
  }

  // Format currency
  const formatCurrency = (value) => `₹${(value || 0).toFixed(2)}`;

  // Fetch and update dashboard
  async function fetchDashboardData() {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        showMessage("User not logged in", "error");
        return;
      }

      const response = await fetch(`${API_BASE}/budget_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update elements safely
      updateElement(totalIncomeElem, formatCurrency(data.total_income));
      updateElement(totalExpensesElem, formatCurrency(data.total_expenses));
      updateElement(remainingBudgetElem, formatCurrency(data.remaining_budget));
      updateElement(availableBalanceElem, formatCurrency(data.available_balance));

      // Handle over-budget warning
      if (overBudgetEl) {
        if (data.over_budget > 0) {
          overBudgetEl.textContent = `⚠️ Over Budget by ${formatCurrency(data.over_budget)}`;
          overBudgetEl.style.display = "block";
          overBudgetEl.style.color = "red";
          showMessage("⚠️ You are exceeding your budget!", "error");
        } else {
          overBudgetEl.style.display = "none";
        }
      }
    } catch (error) {
      console.error("Dashboard error:", {
        message: error.message,
        stack: error.stack
      });
      showMessage("Error loading dashboard data", "error");
    }
  }

  // Fetch Spending Trends
  async function fetchSpendingTrends() {
    if (!spendingTrendsChartElem) {
      console.error("Chart canvas not found");
      return;
    }

    try {
      const user_id = localStorage.getItem("user_id");
      const response = await fetch(`${API_BASE}/spending_trends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id })
      });

      const data = await response.json();

      if (!data.trends || data.trends.length === 0) {
        showMessage("No spending trends available", "info");
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
      console.error("Spending trends error:", error);
      showMessage("Error loading spending trends", "error");
    }
  }

  // Initialize forms only if they exist
  if (expenseForm) {
    expenseForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user_id = localStorage.getItem("user_id");
      const category = document.getElementById("expense-category").value;
      const amount = parseFloat(document.getElementById("expense-amount").value);
      const date = document.getElementById("expense-date").value;
      const description = document.getElementById("expense-description").value;

      if (amount <= 0 || isNaN(amount)) {
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
          const errorData = await response.json();
          showMessage(errorData.message || "Error adding expense", "error");
        }
      } catch (error) {
        showMessage("Error connecting to server", "error");
      }
    });
  }

  if (incomeForm) {
    incomeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const user_id = localStorage.getItem("user_id");
      const source = document.getElementById("income-source").value;
      const amount = parseFloat(document.getElementById("income-amount").value);
      const date = document.getElementById("income-date").value;

      if (amount <= 0 || isNaN(amount)) {
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
          const errorData = await response.json();
          showMessage(errorData.message || "Error adding income", "error");
        }
      } catch (error) {
        showMessage("Error connecting to server", "error");
      }
    });
  }

  if (budgetForm) {
    budgetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const budget = parseFloat(document.getElementById("budget-amount").value);
      const user_id = localStorage.getItem("user_id");

      try {
        const res = await fetch(`${API_BASE}/set_budget`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, budget })
        });

        const data = await res.json();
        showMessage(data.message, data.success ? "success" : "error");

        if (data.success) {
          fetchDashboardData();
        }
      } catch (error) {
        showMessage("Error setting budget", "error");
      }
    });
  }

if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        const budgetRes = await fetch(`${API_BASE}/budget_status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id })
        });

        if (!budgetRes.ok) {
          throw new Error(`Failed to fetch budget data: ${budgetRes.status}`);
        }

        const budgetData = await budgetRes.json();

        // Check if jsPDF is available
        if (typeof jsPDF === 'undefined') {
          showMessage("PDF library not loaded. Please try again.", "error");
          return;
        }

        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text("Financial Report", 105, 20, { align: 'center' });
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        // Add financial summary
        doc.setFontSize(14);
        doc.text("Financial Summary", 14, 45);
        
        doc.setFontSize(12);
        let yPosition = 55;
        
        // Add financial data
        doc.text(`Total Income: ${formatCurrency(budgetData.total_income)}`, 14, yPosition);
        yPosition += 10;
        
        doc.text(`Total Expenses: ${formatCurrency(budgetData.total_expenses)}`, 14, yPosition);
        yPosition += 10;
        
        doc.text(`Monthly Budget: ${budgetData.monthly_budget ? formatCurrency(budgetData.monthly_budget) : "Not Set"}`, 14, yPosition);
        yPosition += 10;
        
        doc.text(`Remaining Budget: ${formatCurrency(budgetData.remaining_budget)}`, 14, yPosition);
        yPosition += 10;
        
        doc.text(`Available Balance: ${formatCurrency(budgetData.available_balance)}`, 14, yPosition);
        yPosition += 15;
        
        // Add warning if over budget
        if (budgetData.monthly_budget !== null && budgetData.total_expenses > budgetData.monthly_budget) {
          doc.setTextColor(255, 0, 0);
          doc.text("⚠️ Warning: You're exceeding your monthly budget!", 14, yPosition);
          doc.setTextColor(40); // Reset color
          yPosition += 10;
        }
        
        // Add spending trends if available
        try {
          const trendsRes = await fetch(`${API_BASE}/spending_trends`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id })
          });
          
          if (trendsRes.ok) {
            const trendsData = await trendsRes.json();
            
            if (trendsData.trends && trendsData.trends.length > 0) {
              doc.setFontSize(14);
              doc.text("Spending by Category", 14, yPosition);
              yPosition += 10;
              
              doc.setFontSize(12);
              trendsData.trends.forEach(trend => {
                doc.text(`${trend._id}: ${formatCurrency(trend.total)}`, 20, yPosition);
                yPosition += 7;
              });
            }
          }
        } catch (trendsError) {
          console.error("Couldn't load spending trends for report:", trendsError);
        }
        
        // Save the PDF
        doc.save(`Financial_Report_${new Date().toISOString().slice(0,10)}.pdf`);
        showMessage("Report downloaded successfully", "success");
        
      } catch (error) {
        console.error("PDF report generation error:", error);
        showMessage("Failed to generate report", "error");
      }
    });
  }

  // Initialize dashboard
  fetchDashboardData();
  fetchSpendingTrends();
});
