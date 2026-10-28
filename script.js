// DOM Elements
const form = document.getElementById('transaction-form');
const clearBtn = document.getElementById('clear-btn');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');

const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const currentBalanceEl = document.getElementById('current-balance');

const transactionList = document.getElementById('transaction-list');
const filterType = document.getElementById('filter-type');
const searchInput = document.getElementById('search');
const noTransactionsEl = document.getElementById('no-transactions');

// Set today's date as default
dateInput.valueAsDate = new Date();

// State (Load from Local Storage)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Format Currency
function formatCurrency(amount) {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Generate ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Add Transaction
function addTransaction(e) {
    e.preventDefault();

    const type = typeInput.value;
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (description === '' || isNaN(amount) || amount <= 0 || category === '') {
        alert('Please provide valid details. Amount must be greater than zero.');
        return;
    }

    const transaction = {
        id: generateID(),
        type,
        description,
        amount,
        category,
        date
    };

    transactions.push(transaction);
    updateLocalStorage();
    renderDOM();
    
    // Alert success message
    alert('Transaction added successfully!');
    
    // Reset form except date
    descriptionInput.value = '';
    amountInput.value = '';
    categoryInput.value = '';
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    renderDOM();
}

// Clear Form
function clearForm() {
    form.reset();
    dateInput.valueAsDate = new Date();
}

// Update Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update Totals
function updateTotals() {
    const income = transactions
        .filter(item => item.type === 'Income')
        .reduce((acc, item) => (acc += item.amount), 0);

    const expense = transactions
        .filter(item => item.type === 'Expense')
        .reduce((acc, item) => (acc += item.amount), 0);

    const balance = income - expense;

    totalIncomeEl.innerText = formatCurrency(income);
    totalExpensesEl.innerText = formatCurrency(expense);
    currentBalanceEl.innerText = formatCurrency(balance);
}

// Render Table
function renderDOM() {
    transactionList.innerHTML = '';

    const filterVal = filterType.value;
    const searchVal = searchInput.value.toLowerCase();

    const filteredTransactions = transactions.filter(transaction => {
        const matchesType = filterVal === 'All' || transaction.type === filterVal;
        const matchesSearch = transaction.description.toLowerCase().includes(searchVal) || 
                              transaction.category.toLowerCase().includes(searchVal);
        return matchesType && matchesSearch;
    });

    if (filteredTransactions.length === 0) {
        noTransactionsEl.style.display = 'block';
    } else {
        noTransactionsEl.style.display = 'none';
        
        // Sort by date descending
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        filteredTransactions.forEach(transaction => {
            const tr = document.createElement('tr');
            
            const badgeClass = transaction.type === 'Income' ? 'badge-income' : 'badge-expense';
            const amountPrefix = transaction.type === 'Income' ? '+' : '';
            const amountClass = transaction.type === 'Income' ? 'text-success' : '';

            tr.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.description}</td>
                <td><span class="${badgeClass}">${transaction.type}</span></td>
                <td>${transaction.category}</td>
                <td class="${amountClass}">${amountPrefix} ${formatCurrency(transaction.amount)}</td>
                <td><button class="btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button></td>
            `;
            transactionList.appendChild(tr);
        });
    }

    updateTotals();
}

// Event Listeners
form.addEventListener('submit', addTransaction);
clearBtn.addEventListener('click', clearForm);
filterType.addEventListener('change', renderDOM);
searchInput.addEventListener('input', renderDOM);

// Initialize
renderDOM();