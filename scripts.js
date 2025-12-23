// =======================
// GLOBAL VARIABLES
// =======================
let currentUser = null;
let editingInvoiceId = null;
let deleteInvoiceId = null;

// =======================
// DOM ELEMENTS
// =======================
const authContainer = document.getElementById("authContainer");
const mainApp = document.getElementById("mainApp");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginFormElement = document.getElementById("loginFormElement");
const signupFormElement = document.getElementById("signupFormElement");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const userInfo = document.getElementById("userInfo");
const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

const addInvoiceBtn = document.getElementById("addInvoiceBtn");
const invoicesTableBody = document.getElementById("invoicesTableBody");
const noInvoices = document.getElementById("noInvoices");

const invoiceModal = document.getElementById("invoiceModal");
const deleteModal = document.getElementById("deleteModal");

const invoiceForm = document.getElementById("invoiceForm");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const closeDeleteModal = document.getElementById("closeDeleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const itemsContainer = document.getElementById("itemsContainer");
const addItemBtn = document.getElementById("addItem");

const subtotalEl = document.getElementById("subtotal");
const taxRateEl = document.getElementById("taxRate");
const taxAmountEl = document.getElementById("taxAmount");
const totalAmountEl = document.getElementById("totalAmount");

// =======================
// INITIAL LOAD
// =======================
document.addEventListener("DOMContentLoaded", () => {
  checkSession();
});

// =======================
// AUTH SWITCH
// =======================
showSignup.onclick = () => {
  loginForm.style.display = "none";
  signupForm.style.display = "block";
};

showLogin.onclick = () => {
  signupForm.style.display = "none";
  loginForm.style.display = "block";
};

// =======================
// SIGNUP
// =======================
signupFormElement.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const confirm = confirmPassword.value;

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.find(u => u.email === email)) {
    alert("Email already exists");
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created successfully");
  signupFormElement.reset();
  showLogin.click();
});

// =======================
// LOGIN
// =======================
loginFormElement.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  checkSession();
});

// =======================
// SESSION CHECK
// =======================
function checkSession() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    currentUser = user;
    authContainer.style.display = "none";
    mainApp.style.display = "block";
    userInfo.style.display = "block";
    addInvoiceBtn.style.display = "inline-block";
    userNameEl.textContent = user.name;
    loadInvoices();
  } else {
    authContainer.style.display = "block";
    mainApp.style.display = "none";
  }
}

// =======================
// LOGOUT
// =======================
logoutBtn.onclick = () => {
  localStorage.removeItem("currentUser");
  location.reload();
};

// =======================
// INVOICE STORAGE
// =======================
function getInvoices() {
  return JSON.parse(localStorage.getItem(`invoices_${currentUser.email}`)) || [];
}

function saveInvoices(invoices) {
  localStorage.setItem(`invoices_${currentUser.email}`, JSON.stringify(invoices));
}

// =======================
// LOAD INVOICES
// =======================
function loadInvoices() {
  const invoices = getInvoices();
  invoicesTableBody.innerHTML = "";

  if (invoices.length === 0) {
    noInvoices.style.display = "block";
    return;
  }

  noInvoices.style.display = "none";

  invoices.forEach(inv => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${inv.invoiceNumber}</td>
      <td>${inv.customerName}</td>
      <td>${inv.invoiceDate}</td>
      <td>${inv.dueDate}</td>
      <td>$${inv.total}</td>
      <td>${inv.status}</td>
      <td>
        <button onclick="editInvoice('${inv.id}')">Edit</button>
        <button onclick="openDelete('${inv.id}')">Delete</button>
      </td>
    `;
    invoicesTableBody.appendChild(tr);
  });
}

// =======================
// ADD / EDIT INVOICE
// =======================
addInvoiceBtn.onclick = () => {
  editingInvoiceId = null;
  invoiceForm.reset();
  itemsContainer.innerHTML = itemsContainer.firstElementChild.outerHTML;
  calculateTotals();
  invoiceModal.style.display = "block";
};

closeModal.onclick = cancelBtn.onclick = () => {
  invoiceModal.style.display = "none";
};

// =======================
// SAVE INVOICE
// =======================
invoiceForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const invoices = getInvoices();
  const items = [];

  document.querySelectorAll(".item-row").forEach(row => {
    const desc = row.querySelector(".item-description").value;
    const qty = +row.querySelector(".item-quantity").value;
    const price = +row.querySelector(".item-price").value;
    items.push({ desc, qty, price });
  });

  const invoiceData = {
    id: editingInvoiceId || Date.now().toString(),
    invoiceNumber: invoiceNumber.value,
    invoiceDate: invoiceDate.value,
    dueDate: dueDate.value,
    customerName: customerName.value,
    customerEmail: customerEmail.value,
    status: status.value,
    items,
    total: totalAmountEl.textContent.replace("$", "")
  };

  if (editingInvoiceId) {
    const index = invoices.findIndex(i => i.id === editingInvoiceId);
    invoices[index] = invoiceData;
  } else {
    invoices.push(invoiceData);
  }

  saveInvoices(invoices);
  invoiceModal.style.display = "none";
  loadInvoices();
});

// =======================
// EDIT INVOICE
// =======================
function editInvoice(id) {
  const invoices = getInvoices();
  const inv = invoices.find(i => i.id === id);
  if (!inv) return;

  editingInvoiceId = id;

  invoiceNumber.value = inv.invoiceNumber;
  invoiceDate.value = inv.invoiceDate;
  dueDate.value = inv.dueDate;
  customerName.value = inv.customerName;
  customerEmail.value = inv.customerEmail;
  status.value = inv.status;

  itemsContainer.innerHTML = "";
  inv.items.forEach(item => {
    addItemRow(item.desc, item.qty, item.price);
  });

  calculateTotals();
  invoiceModal.style.display = "block";
}

// =======================
// DELETE INVOICE
// =======================
function openDelete(id) {
  deleteInvoiceId = id;
  deleteModal.style.display = "block";
}

closeDeleteModal.onclick = cancelDeleteBtn.onclick = () => {
  deleteModal.style.display = "none";
};

confirmDeleteBtn.onclick = () => {
  let invoices = getInvoices();
  invoices = invoices.filter(i => i.id !== deleteInvoiceId);
  saveInvoices(invoices);
  deleteModal.style.display = "none";
  loadInvoices();
};

// =======================
// ITEMS
// =======================
addItemBtn.onclick = () => addItemRow();

function addItemRow(desc = "", qty = 1, price = 0) {
  const div = document.createElement("div");
  div.className = "item-row";
  div.innerHTML = `
    <input class="item-description" value="${desc}">
    <input type="number" class="item-quantity" value="${qty}">
    <input type="number" class="item-price" value="${price}">
    <input class="item-total" readonly>
    <button type="button" onclick="this.parentElement.remove();calculateTotals()">X</button>
  `;
  itemsContainer.appendChild(div);
  calculateTotals();
}

// =======================
// TOTAL CALCULATION
// =======================
document.addEventListener("input", calculateTotals);
taxRateEl.addEventListener("input", calculateTotals);

function calculateTotals() {
  let subtotal = 0;
  document.querySelectorAll(".item-row").forEach(row => {
    const qty = +row.querySelector(".item-quantity").value || 0;
    const price = +row.querySelector(".item-price").value || 0;
    const total = qty * price;
    row.querySelector(".item-total").value = total.toFixed(2);
    subtotal += total;
  });

  const taxRate = +taxRateEl.value || 0;
  const tax = subtotal * (taxRate / 100);

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxAmountEl.textContent = `$${tax.toFixed(2)}`;
  totalAmountEl.textContent = `$${(subtotal + tax).toFixed(2)}`;
}
