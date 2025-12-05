// script.js
import { showNotification } from './components/notification.js';
import { playSound } from './components/sound.js';
import { initializeUser, getUserSession, updateUserCurrency } from './api/auth.js';
import { getBalance, updateBalance, deposit, withdraw } from './api/balance.js';

// Supabase Configuration
const SUPABASE_URL = 'https://xhspnqtmgqrvrqyfbmjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc3BucXRtZ3FydnJxeWZibWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Mjc5NzUsImV4cCI6MjA4MDUwMzk3NX0.EWlifrDDPzfvOzebCSqDw3yYHaHesjvm1DlkaTewKhM';

// Currency configuration
const CURRENCIES = {
    'TZS': { name: 'Tanzanian Shilling', symbol: 'TSh', decimal: 0, format: 'before' },
    'USD': { name: 'US Dollar', symbol: '$', decimal: 2, format: 'before' },
    'EUR': { name: 'Euro', symbol: '€', decimal: 2, format: 'before' },
    'GBP': { name: 'British Pound', symbol: '£', decimal: 2, format: 'before' },
    'KES': { name: 'Kenyan Shilling', symbol: 'KSh', decimal: 0, format: 'before' },
    'UGX': { name: 'Ugandan Shilling', symbol: 'USh', decimal: 0, format: 'before' },
    'NGN': { name: 'Nigerian Naira', symbol: '₦', decimal: 0, format: 'before' },
    'ZAR': { name: 'South African Rand', symbol: 'R', decimal: 2, format: 'before' },
    'INR': { name: 'Indian Rupee', symbol: '₹', decimal: 0, format: 'before' },
    'CNY': { name: 'Chinese Yuan', symbol: '¥', decimal: 2, format: 'before' }
};

// Global state
let currentUser = null;
let currentBalance = 10000;
let currentCurrency = 'TZS';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('FeeCasino Bet - Mock Platform Initializing...');
    console.log('WARNING: This is a development/mock platform. DO NOT USE FOR REAL MONEY.');
    
    // Initialize user session
    await initializeApp();
    
    // Load components
    loadHeader();
    loadFooter();
    
    // Update stats periodically
    setInterval(updateStats, 10000);
    
    // Simulate live updates
    simulateLiveActivity();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification({
            title: 'Welcome to FeeCasino Bet!',
            message: 'Enjoy betting with fake money. Remember, this is for entertainment only.',
            type: 'info'
        });
        playSound('notification');
    }, 1000);
});

async function initializeApp() {
    try {
        // Try to get existing user session
        currentUser = await getUserSession();
        
        if (!currentUser) {
            // Create new anonymous user
            currentUser = await initializeUser();
        }
        
        // Detect user's locale for currency
        const userLocale = navigator.language || 'en-US';
        const localeCurrency = detectCurrencyFromLocale(userLocale);
        
        // Update currency based on locale
        await changeCurrency(localeCurrency);
        
        // Update balance display
        updateBalanceDisplay();
        
        // Populate recent wins
        populateRecentWins();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Fallback to local storage
        currentUser = { id: 'local-user', session_id: 'local-session' };
        currentCurrency = localStorage.getItem('currency') || 'TZS';
        currentBalance = parseFloat(localStorage.getItem('balance')) || 10000;
        updateBalanceDisplay();
    }
}

function detectCurrencyFromLocale(locale) {
    const localeToCurrency = {
        'en-US': 'USD',
        'en-GB': 'GBP',
        'de-DE': 'EUR',
        'fr-FR': 'EUR',
        'es-ES': 'EUR',
        'pt-PT': 'EUR',
        'it-IT': 'EUR',
        'sw-TZ': 'TZS',
        'sw-KE': 'KES',
        'sw-UG': 'UGX',
        'yo-NG': 'NGN',
        'zu-ZA': 'ZAR',
        'hi-IN': 'INR',
        'zh-CN': 'CNY'
    };
    
    return localeToCurrency[locale] || 'TZS';
}

async function changeCurrency(currencyCode) {
    if (!CURRENCIES[currencyCode]) {
        currencyCode = 'TZS';
    }
    
    currentCurrency = currencyCode;
    
    // Update currency select
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.value = currencyCode;
    }
    
    // Update currency displays
    document.querySelectorAll('#deposit-currency, #withdraw-currency, #withdraw-currency-text').forEach(el => {
        el.textContent = currencyCode;
    });
    
    // Update user currency in backend
    if (currentUser?.id) {
        await updateUserCurrency(currentUser.id, currencyCode);
    }
    
    // Update balance display
    updateBalanceDisplay();
    
    // Show notification
    showNotification({
        title: 'Currency Changed',
        message: `Currency switched to ${CURRENCIES[currencyCode].name}`,
        type: 'info'
    });
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('user-balance');
    const currencyElement = document.getElementById('user-currency');
    
    if (balanceElement && currencyElement) {
        const formattedBalance = formatCurrency(currentBalance, currentCurrency);
        balanceElement.textContent = formattedBalance;
        currencyElement.textContent = currentCurrency;
    }
}

function formatCurrency(amount, currencyCode) {
    const currency = CURRENCIES[currencyCode] || CURRENCIES['TZS'];
    let formatted = '';
    
    if (currency.format === 'before') {
        formatted = currency.symbol + ' ' + amount.toLocaleString('en-US', {
            minimumFractionDigits: currency.decimal,
            maximumFractionDigits: currency.decimal
        });
    } else {
        formatted = amount.toLocaleString('en-US', {
            minimumFractionDigits: currency.decimal,
            maximumFractionDigits: currency.decimal
        }) + ' ' + currency.symbol;
    }
    
    return formatted;
}

function updateStats() {
    // Simulate changing stats
    const onlineUsers = document.getElementById('online-users');
    const totalWins = document.getElementById('total-wins');
    const biggestWin = document.getElementById('biggest-win');
    
    if (onlineUsers) {
        const current = parseInt(onlineUsers.textContent.replace(/,/g, ''));
        const change = Math.floor(Math.random() * 100) - 20;
        onlineUsers.textContent = (current + change).toLocaleString();
    }
    
    if (totalWins) {
        const current = parseFloat(totalWins.textContent.replace(/[^0-9.]/g, ''));
        const change = Math.random() * 100000;
        totalWins.textContent = (current + change).toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) + 'M';
    }
}

function simulateLiveActivity() {
    setInterval(() => {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;
        
        const players = ['AnonymousPlayer', 'LuckyWinner', 'BetMaster', 'Champion', 'ProGambler'];
        const amounts = [5000, 10000, 25000, 50000, 100000, 250000];
        const games = ['Aviator', 'Slots', 'Roulette', 'Blackjack'];
        
        const player = players[Math.floor(Math.random() * players.length)];
        const amount = amounts[Math.floor(Math.random() * amounts.length)];
        const game = games[Math.floor(Math.random() * games.length)];
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        activityItem.innerHTML = `
            <div class="activity-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="activity-content">
                <p><strong>${player}</strong> won <span class="win-amount">${amount.toLocaleString()} ${currentCurrency}</span> on ${game}</p>
                <small class="activity-time">Just now</small>
            </div>
        `;
        
        // Add to top and remove old items if too many
        activityList.insertBefore(activityItem, activityList.firstChild);
        if (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
        
        // Occasionally show notification for big wins
        if (amount >= 50000) {
            showNotification({
                title: 'Big Win!',
                message: `${player} just won ${amount.toLocaleString()} ${currentCurrency} on ${game}!`,
                type: 'win'
            });
            playSound('notification');
        }
    }, 5000);
}

function populateRecentWins() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    // Clear existing items except the first one (template)
    while (activityList.children.length > 1) {
        activityList.removeChild(activityList.lastChild);
    }
    
    // Add some initial wins
    const initialWins = [
        { player: 'BigWinner', amount: 150000, game: 'Aviator', time: '5 minutes ago' },
        { player: 'LuckySpin', amount: 75000, game: 'Slots', time: '12 minutes ago' },
        { player: 'RouletteKing', amount: 120000, game: 'Roulette', time: '25 minutes ago' },
        { player: 'CardShark', amount: 90000, game: 'Blackjack', time: '40 minutes ago' }
    ];
    
    initialWins.forEach(win => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="activity-content">
                <p><strong>${win.player}</strong> won <span class="win-amount">${win.amount.toLocaleString()} ${currentCurrency}</span> on ${win.game}</p>
                <small class="activity-time">${win.time}</small>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Modal Functions
function depositModal() {
    const modal = document.getElementById('deposit-modal');
    modal.classList.add('show');
    document.getElementById('deposit-amount').value = '';
    document.getElementById('deposit-amount').focus();
}

function withdrawModal() {
    const modal = document.getElementById('withdraw-modal');
    modal.classList.add('show');
    document.getElementById('withdraw-amount').value = '100';
    document.getElementById('withdraw-amount').min = '100';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

function setDepositAmount(amount) {
    document.getElementById('deposit-amount').value = amount;
}

function quickDeposit(amount) {
    setDepositAmount(amount);
    depositModal();
}

async function processDeposit() {
    const amountInput = document.getElementById('deposit-amount');
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        showNotification({
            title: 'Invalid Amount',
            message: 'Please enter a valid deposit amount.',
            type: 'error'
        });
        playSound('error');
        return;
    }
    
    try {
        // Update balance
        currentBalance += amount;
        
        // Save to backend if available
        if (currentUser?.id) {
            await deposit(currentUser.id, amount, currentCurrency);
        } else {
            // Fallback to local storage
            localStorage.setItem('balance', currentBalance);
        }
        
        // Update display
        updateBalanceDisplay();
        
        // Close modal
        closeModal('deposit-modal');
        
        // Show success notification
        showNotification({
            title: 'Deposit Successful',
            message: `${formatCurrency(amount, currentCurrency)} has been added to your account.`,
            type: 'success'
        });
        
        playSound('notification');
        
        // Record transaction
        recordTransaction('deposit', amount);
        
    } catch (error) {
        console.error('Deposit failed:', error);
        showNotification({
            title: 'Deposit Failed',
            message: 'Failed to process deposit. Please try again.',
            type: 'error'
        });
        playSound('error');
    }
}

async function processWithdrawal() {
    const amountInput = document.getElementById('withdraw-amount');
    const amount = parseFloat(amountInput.value);
    const method = document.getElementById('withdraw-method').value;
    
    if (!amount || amount < 100) {
        showNotification({
            title: 'Invalid Amount',
            message: 'Minimum withdrawal amount is 100 ' + currentCurrency,
            type: 'error'
        });
        playSound('error');
        return;
    }
    
    if (amount > currentBalance) {
        showNotification({
            title: 'Insufficient Balance',
            message: 'You do not have enough balance to withdraw this amount.',
            type: 'error'
        });
        playSound('error');
        return;
    }
    
    try {
        // Update balance
        currentBalance -= amount;
        
        // Save to backend if available
        if (currentUser?.id) {
            await withdraw(currentUser.id, amount, currentCurrency);
        } else {
            // Fallback to local storage
            localStorage.setItem('balance', currentBalance);
        }
        
        // Update display
        updateBalanceDisplay();
        
        // Close modal
        closeModal('withdraw-modal');
        
        // Show success notification
        showNotification({
            title: 'Withdrawal Requested',
            message: `${formatCurrency(amount, currentCurrency)} withdrawal via ${method} has been processed. This is fake money - no real transfer occurred.`,
            type: 'success'
        });
        
        playSound('notification');
        
        // Record transaction
        recordTransaction('withdrawal', amount, { method });
        
    } catch (error) {
        console.error('Withdrawal failed:', error);
        showNotification({
            title: 'Withdrawal Failed',
            message: 'Failed to process withdrawal. Please try again.',
            type: 'error'
        });
        playSound('error');
    }
}

function recordTransaction(type, amount, metadata = {}) {
    const transaction = {
        type,
        amount,
        currency: currentCurrency,
        timestamp: new Date().toISOString(),
        balance: currentBalance,
        ...metadata
    };
    
    // Store in local storage for demo
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift(transaction);
    if (transactions.length > 50) transactions = transactions.slice(0, 50);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function showComingSoon() {
    showNotification({
        title: 'Coming Soon',
        message: 'This game is under development and will be available soon!',
        type: 'info'
    });
    playSound('notification');
}

// Export for use in other modules
window.depositModal = depositModal;
window.withdrawModal = withdrawModal;
window.quickDeposit = quickDeposit;
window.changeCurrency = changeCurrency;
window.showComingSoon = showComingSoon;
window.closeModal = closeModal;
window.setDepositAmount = setDepositAmount;
window.processDeposit = processDeposit;
window.processWithdrawal = processWithdrawal;
