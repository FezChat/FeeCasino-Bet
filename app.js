import { supabase } from './supabase.js';
import { authSystem } from './auth.js';

class FeeCasinoApp {
    constructor() {
        this.currentUser = null;
        this.userBalance = 0;
        this.userCurrency = 'TZS';
        this.notifications = [];
        this.init();
    }

    async init() {
        // Check authentication
        await this.checkAuth();
        
        // Load user data
        await this.loadUserData();
        
        // Initialize real-time subscriptions
        this.initRealtime();
        
        // Load notifications
        await this.loadNotifications();
        
        // Update UI
        this.updateUI();
        
        // Start fake bots simulation
        this.startBotsSimulation();
    }

    async checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = session.user;
    }

    async loadUserData() {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();

        if (!error && data) {
            this.userBalance = data.balance || 0;
            this.userCurrency = this.getCurrencyFromCountry(data.country);
            localStorage.setItem('userProfile', JSON.stringify(data));
        }
    }

    getCurrencyFromCountry(countryCode) {
        const currencies = {
            'TZ': 'TZS',
            'KE': 'KES',
            'UG': 'UGX',
            'RW': 'RWF',
            'US': 'USD',
            'GB': 'GBP',
            'EU': 'EUR'
        };
        return currencies[countryCode] || 'TZS';
    }

    formatMoney(amount) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.userCurrency,
            minimumFractionDigits: 2
        });
        
        // For Tanzanian Shillings, remove the currency symbol and add TZS
        if (this.userCurrency === 'TZS') {
            return `${parseFloat(amount).toLocaleString('en-US')} TZS`;
        }
        
        return formatter.format(amount);
    }

    async processDeposit(amount) {
        if (amount < 100) {
            this.showNotification('Minimum deposit is 100', 'danger');
            return;
        }

        // Update balance in Supabase
        const newBalance = this.userBalance + parseFloat(amount);
        
        const { error } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', this.currentUser.id);

        if (!error) {
            this.userBalance = newBalance;
            this.updateUI();
            
            // Record transaction
            await this.recordTransaction('deposit', amount);
            
            this.showNotification(`Successfully deposited ${this.formatMoney(amount)}`, 'success');
            this.playSound('deposit');
        } else {
            this.showNotification('Deposit failed. Please try again.', 'danger');
        }
    }

    async processWithdraw(amount) {
        if (amount < 100) {
            this.showNotification('Minimum withdrawal is 100', 'danger');
            return;
        }

        if (amount > this.userBalance) {
            this.showNotification('Insufficient balance', 'danger');
            return;
        }

        // Update balance in Supabase
        const newBalance = this.userBalance - parseFloat(amount);
        
        const { error } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', this.currentUser.id);

        if (!error) {
            this.userBalance = newBalance;
            this.updateUI();
            
            // Record transaction
            await this.recordTransaction('withdrawal', amount);
            
            this.showNotification(`Withdrawal of ${this.formatMoney(amount)} processing...`, 'success');
            this.playSound('withdraw');
            
            // Simulate processing time
            setTimeout(() => {
                this.showNotification(`Withdrawal of ${this.formatMoney(amount)} completed!`, 'success');
            }, 3000);
        } else {
            this.showNotification('Withdrawal failed. Please try again.', 'danger');
        }
    }

    async recordTransaction(type, amount) {
        const { error } = await supabase
            .from('transactions')
            .insert([{
                user_id: this.currentUser.id,
                type: type,
                amount: amount,
                currency: this.userCurrency,
                status: 'completed',
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Failed to record transaction:', error);
        }
    }

    async loadNotifications() {
        // Load fake notifications for now
        this.notifications = [
            { id: 1, type: 'info', message: 'Welcome to FeeCasino Bet!', time: 'Just now' },
            { id: 2, type: 'success', message: 'Player_***45 won 250,000 TZS on Aviator!', time: '2 min ago' },
            { id: 3, type: 'info', message: 'New tournament starting tomorrow!', time: '5 min ago' }
        ];
        
        this.updateNotificationUI();
    }

    updateUI() {
        // Update balance display
        const balanceElement = document.getElementById('userBalance');
        if (balanceElement) {
            balanceElement.textContent = this.formatMoney(this.userBalance);
        }
        
        // Update avatar
        const avatarElement = document.getElementById('userAvatar');
        if (avatarElement) {
            const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            avatarElement.src = profile.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + this.currentUser.id;
        }
    }

    updateNotificationUI() {
        const notificationList = document.getElementById('notificationsList');
        const badge = document.getElementById('notificationBadge');
        
        if (notificationList) {
            notificationList.innerHTML = this.notifications.map(notif => `
                <div class="notification ${notif.type}">
                    <p>${notif.message}</p>
                    <small>${notif.time}</small>
                </div>
            `).join('');
        }
        
        if (badge) {
            badge.textContent = this.notifications.length;
        }
    }

    showNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            type: type,
            message: message,
            time: 'Just now'
        };
        
        this.notifications.unshift(notification);
        if (this.notifications.length > 20) {
            this.notifications.pop();
        }
        
        this.updateNotificationUI();
        this.playNotificationSound(type);
    }

    playSound(soundType) {
        const audio = new Audio();
        
        switch(soundType) {
            case 'deposit':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-cash-machine-bonus-1991.mp3';
                break;
            case 'withdraw':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';
                break;
            case 'notification':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3';
                break;
            default:
                return;
        }
        
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }

    playNotificationSound(type) {
        if (localStorage.getItem('notificationSound') !== 'off') {
            this.playSound('notification');
        }
    }

    initRealtime() {
        // Subscribe to user balance changes
        supabase.channel('user-updates')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'users',
                    filter: `id=eq.${this.currentUser.id}`
                }, 
                (payload) => {
                    if (payload.new.balance !== this.userBalance) {
                        this.userBalance = payload.new.balance;
                        this.updateUI();
                        this.showNotification('Your balance has been updated', 'info');
                    }
                }
            )
            .subscribe();
    }

    startBotsSimulation() {
        // Simulate fake players and bets
        setInterval(() => {
            const fakePlayers = Math.floor(Math.random() * 100) + 50;
            const fakeBets = Math.floor(Math.random() * 500) + 100;
            
            // Update stats
            const activeElement = document.getElementById('activePlayers');
            const betsElement = document.getElementById('totalBets');
            
            if (activeElement) {
                const current = parseInt(activeElement.textContent.replace(/,/g, ''));
                activeElement.textContent = (current + fakePlayers).toLocaleString();
            }
            
            if (betsElement) {
                const current = parseInt(betsElement.textContent.replace(/,/g, ''));
                betsElement.textContent = (current + fakeBets).toLocaleString();
            }
            
            // Randomly show fake win notifications
            if (Math.random() > 0.7) {
                const winAmount = Math.floor(Math.random() * 1000000) + 50000;
                const playerNum = Math.floor(Math.random() * 999) + 1;
                this.showNotification(`Player_***${playerNum} won ${this.formatMoney(winAmount)} on Aviator!`, 'success');
            }
        }, 10000);
    }

    // Settings functions
    async updateAvatar(avatarId) {
        const avatarUrl = `casino_avatar_${avatarId}.png`;
        
        const { error } = await supabase
            .from('users')
            .update({ avatar: avatarUrl })
            .eq('id', this.currentUser.id);

        if (!error) {
            localStorage.setItem('userAvatar', avatarUrl);
            this.showNotification('Avatar updated successfully', 'success');
        }
    }

    async saveSettings(settings) {
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: this.currentUser.id,
                theme: settings.theme,
                notification_sound: settings.notificationSound,
                updated_at: new Date().toISOString()
            });

        if (!error) {
            localStorage.setItem('userSettings', JSON.stringify(settings));
            this.showNotification('Settings saved', 'success');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FeeCasinoApp();
});

// Global functions for HTML buttons
window.processDeposit = async function() {
    const amount = parseFloat(document.getElementById('depositAmount').value);
    if (amount && amount >= 100) {
        await app.processDeposit(amount);
        closeModal('depositModal');
        document.getElementById('depositAmount').value = '';
    } else {
        app.showNotification('Please enter a valid amount (min 100)', 'danger');
    }
}

window.processWithdraw = async function() {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    if (amount && amount >= 100) {
        await app.processWithdraw(amount);
        closeModal('withdrawModal');
        document.getElementById('withdrawAmount').value = '';
    } else {
        app.showNotification('Please enter a valid amount (min 100)', 'danger');
    }
}

window.selectAvatar = function(avatarId) {
    app.updateAvatar(avatarId);
    // Update avatar preview
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
        avatarElement.src = `casino_avatar_${avatarId}.png`;
    }
}

window.changeTheme = function(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

window.saveSettings = function() {
    const settings = {
        theme: document.getElementById('themeSelect').value,
        notificationSound: document.getElementById('soundSelect').value
    };
    
    app.saveSettings(settings);
    localStorage.setItem('notificationSound', settings.notificationSound);
    closeModal('settingsModal');
}

window.logout = async function() {
    await authSystem.logout();
    window.location.href = 'login.html';
}
