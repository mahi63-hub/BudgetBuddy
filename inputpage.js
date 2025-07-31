document.addEventListener("DOMContentLoaded", () => {
  // Load stored income and savings
  const incomeInput = document.getElementById("income");
  const savingsInput = document.getElementById("savings");
  incomeInput.value = localStorage.getItem("income") || "";
  savingsInput.value = localStorage.getItem("savings") || "";

  // Load stored expenses
  const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
  storedExpenses.forEach(addExpenseFromStorage);

  // Load reminder
  document.getElementById("reminder-date").value = localStorage.getItem("reminderDate") || "";
  document.getElementById("reminder-purpose").value = localStorage.getItem("reminderPurpose") || "";

  calculateTotals();
});

function resetFixedBudget() {
  // Clear all input fields
  document.getElementById("income").value = "";
  document.getElementById("savings").value = "";
  document.getElementById("reminder-date").value = "";
  document.getElementById("reminder-purpose").value = "";

  // Clear all expense entries from the UI
  const container = document.getElementById("expense-list");
  container.innerHTML = "";

  // Optionally: Add one blank row if needed
  // addExpense();

  // Clear the totals table (optional)
  const tableBody = document.getElementById("records-body");
  tableBody.innerHTML = "";

  // ✅ Do not touch localStorage!
}




 function saveToStorage() {
  const income = document.getElementById("income").value;
  const savings = document.getElementById("savings").value;
  localStorage.setItem("income", income);
  localStorage.setItem("savings", savings);

  const expenseGroups = document.querySelectorAll(".expense-group");
  const expenses = [];

  expenseGroups.forEach(group => {
    const main = group.querySelector(".main-category").value;
    const sub = group.querySelector(".sub-category").value;
    const amount = parseFloat(group.querySelector("input[type='number']").value) || 0;
    if (main && sub && amount) {
      expenses.push({ main, sub, amount });
    }
  });

  // ✅ Save expenses under today's date
  const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
  const allExpenses = JSON.parse(localStorage.getItem("datedExpenses") || "{}");
  allExpenses[today] = expenses;
  localStorage.setItem("datedExpenses", JSON.stringify(allExpenses));

  // ✅ Optionally also save the most recent expenses separately if needed
  localStorage.setItem("expenses", JSON.stringify(expenses));

  // Save reminder
  // const date = document.getElementById("reminder-date").value;
  // const purpose = document.getElementById("reminder-purpose").value;
  // localStorage.setItem("reminderDate", date);
  // localStorage.setItem("reminderPurpose", purpose);
  const date = document.getElementById("reminder-date").value;
const purpose = document.getElementById("reminder-purpose").value.trim();

if (date && purpose) {
  let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

  // Prevent duplicate entry for the same date
  if (!reminders.some(r => r.date === date)) {
    reminders.push({ date, purpose });
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }
}

  calculateTotals();
}

function addExpenseFromStorage(expense) {
  const container = document.getElementById("expense-list");
  const div = document.createElement("div");
  div.className = "expense-group";

  div.innerHTML = `
    <select class="main-category" onchange="updateSubcategories(this)">
      <option value="">-- Select Category --</option>
      <option value="Housing" ${expense.main === "Housing" ? "selected" : ""}>🏠 Housing</option>
      <option value="Utilities" ${expense.main === "Utilities" ? "selected" : ""}>⚡ Utilities</option>
      <option value="Food" ${expense.main === "Food" ? "selected" : ""}>🍲 Food & Groceries</option>
      <option value="Transport" ${expense.main === "Transport" ? "selected" : ""}>🚗 Transportation</option>
      <option value="Entertainment" ${expense.main === "Entertainment" ? "selected" : ""}>🎉 Entertainment</option>
      <option value="Health" ${expense.main === "Health" ? "selected" : ""}>🏥 Health</option>
      <option value="Education" ${expense.main === "Education" ? "selected" : ""}>📚 Education</option>
      <option value="EMI" ${expense.main === "EMI" ? "selected" : ""}>💳 EMI</option>
      <option value="Other" ${expense.main === "Other" ? "selected" : ""}>➕ Other</option>
    </select>

    <select class="sub-category"><option value="">-- Select Subcategory --</option></select>
    <input type="number" value="${expense.amount}" placeholder="Amount (₹)" />
    <button class="remove-btn" onclick="removeExpense(this)">&times;</button>
  `;
  container.appendChild(div);

  updateSubcategories(div.querySelector(".main-category"), expense.sub);
}

function addExpense() {
  addExpenseFromStorage({ main: "", sub: "", amount: "" });
}

function removeExpense(btn) {
  btn.parentElement.remove();
  saveToStorage(); // update after removal
}

function updateSubcategories(selectElement, selectedSub = "") {
  const subcategoryMap = {
    Housing: ["Rent", "Home Loan EMI", "Maintenance Charges", "Property Tax", "Other"],
    Utilities: ["Electricity Bill", "Water Bill", "Internet/WiFi", "Gas", "Mobile Recharge", "Other"],
    Food: ["Groceries", "Vegetables & Fruits", "Dining Out", "Snacks / Tea / Coffee", "Other"],
    Transport: ["Fuel", "Auto/Taxi", "Bus/Train", "Repairs", "Other"],
    Entertainment: ["Movies", "Events", "Subscriptions", "Shopping", "Other"],
    Health: ["Medicines", "Checkups", "Health Insurance", "Other"],
    Education: ["Tuition Fees", "Books", "Courses", "Other"],
    EMI: ["Personal Loan", "Car Loan", "Credit Card", "Other"],
    Other: ["Miscellaneous"]
  };

  const subSelect = selectElement.parentElement.querySelector(".sub-category");
  const category = selectElement.value;

  subSelect.innerHTML = `<option value="">-- Select Subcategory --</option>`;
  if (subcategoryMap[category]) {
    subcategoryMap[category].forEach(sub => {
      const option = document.createElement("option");
      option.value = sub;
      option.textContent = sub;
      if (sub === selectedSub) option.selected = true;
      subSelect.appendChild(option);
    });
  }
}

// function calculateTotals() {
//   const income = parseFloat(localStorage.getItem("income")) || 0;
//   const savings = parseFloat(localStorage.getItem("savings")) || 0;
//   const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

//   const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
//   const balance = income - (savings + totalExpense);

//   const tableBody = document.getElementById("records-body");
//   const today = new Date().toLocaleDateString("en-IN");
//   tableBody.innerHTML = `
//     <tr>
//       <td style="border: 1px solid #d1d5db; padding: 0.5rem">${today}</td>
//       <td style="border: 1px solid #d1d5db; padding: 0.5rem">₹${income}</td>
//       <td style="border: 1px solid #d1d5db; padding: 0.5rem">₹${savings}</td>
//       <td style="border: 1px solid #d1d5db; padding: 0.5rem">₹${totalExpense}</td>
//       <td style="border: 1px solid #d1d5db; padding: 0.5rem">₹${balance}</td>
//     </tr>
//   `;
// }
function calculateTotals() {
  const income = parseFloat(localStorage.getItem("income")) || 0;
  const savings = parseFloat(localStorage.getItem("savings")) || 0;
  const datedExpenses = JSON.parse(localStorage.getItem("datedExpenses")) || {};

  const tableBody = document.getElementById("records-body");
  tableBody.innerHTML = "";

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  let cumulativeExpense = 0;

  const sortedDates = Object.keys(datedExpenses).sort();

  sortedDates.forEach(date => {
    const dailyExpenses = datedExpenses[date] || [];
    const dailyTotal = dailyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    cumulativeExpense += dailyTotal;

    const isToday = date === today;
    const balance = income - savings - cumulativeExpense;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="border: 1px solid #d1d5db; padding: 0.5rem">${date}</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem">₹${income}</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem">₹${savings}</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem">₹${dailyTotal}</td>
      <td style="border: 1px solid #d1d5db; padding: 0.5rem">₹${balance}</td>
    `;
    tableBody.appendChild(row);
  });
}


function submitData() {
  saveToStorage(); // Save regular input first

  const today = new Date();
  const isoDate = today.toISOString().split("T")[0];

  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  const formattedExpenses = expenses.map(exp => ({
    category: exp.main,
    amount: exp.amount,
    description: exp.sub // we store subcategory as description
  }));

  // Load existing budget records
  const records = JSON.parse(localStorage.getItem("budgetRecords")) || [];

  // Check if entry for today exists
  const existing = records.find(r => r.date === isoDate);
  if (existing) {
    existing.expenses = formattedExpenses;
  } else {
    records.push({
      date: isoDate,
      expenses: formattedExpenses
    });
  }

  localStorage.setItem("budgetRecords", JSON.stringify(records));

  alert("✅ Data submitted and displayed!");
  calculateTotals();
}


// ✅ Add Income
function addIncomeAmount() {
  const addValue = prompt("Enter additional income amount (₹):");
  const currentIncome = parseFloat(localStorage.getItem("income")) || 0;
  const additional = parseFloat(addValue);
  if (!isNaN(additional)) {
    const newIncome = currentIncome + additional;
    localStorage.setItem("income", newIncome);
    document.getElementById("income").value = newIncome;
    calculateTotals();
  }
}


// ✅ Add Savings
function addSavingsAmount() {
  const addValue = prompt("Enter additional savings amount (₹):");
  const currentSavings = parseFloat(localStorage.getItem("savings")) || 0;
  const additional = parseFloat(addValue);
  if (!isNaN(additional)) {
    const newSavings = currentSavings + additional;
    localStorage.setItem("savings", newSavings);
    document.getElementById("savings").value = newSavings;
    calculateTotals();
  }
}
function reloadStoredData() {
  document.getElementById("income").value = localStorage.getItem("income") || "";
  document.getElementById("savings").value = localStorage.getItem("savings") || "";
  document.getElementById("reminder-date").value = localStorage.getItem("reminderDate") || "";
  document.getElementById("reminder-purpose").value = localStorage.getItem("reminderPurpose") || "";

  const container = document.getElementById("expense-list");
  container.innerHTML = "";

  const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
  storedExpenses.forEach(addExpenseFromStorage);

  calculateTotals();
}
