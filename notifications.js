class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.soundEnabled = true;
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupNotificationPanel();
    }

    loadSettings() {
        this.soundEnabled = localStorage.getItem('notificationSound') !== 'off';
    }

    setupNotificationPanel() {
        if (!document.getElementById('notificationPanel')) {
            const panel = document.createElement('div');
            panel.id = 'notificationPanel';
            panel.className = 'notification-panel';
            panel.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                width: 300px;
                max-height: 400px;
                overflow-y: auto;
                background: var(--card-bg);
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
                z-index: 999;
                display: none;
            `;
            document.body.appendChild(panel);
        }
    }

    showNotification(message, type = 'info', options = {}) {
        const notification = {
            id: Date.now(),
            message,
            type,
            time: new Date(),
            ...options
        };

        this.notifications.unshift(notification);
        if (this.notifications.length > 50) {
            this.notifications.pop();
        }

        this.updateNotificationUI();
        this.playNotificationSound(type);
        this.saveToLocalStorage();

        // Auto-remove after 10 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 10000);

        return notification.id;
    }

    updateNotificationUI() {
        const panel = document.getElementById('notificationPanel');
        if (!panel) return;

        panel.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-bell"></i> Notifications (${this.notifications.length})</h3>
                <button class="close-btn" onclick="window.notificationSystem.hidePanel()">&times;</button>
            </div>
            ${this.notifications.map(notif => `
                <div class="notification ${notif.type}" onclick="window.notificationSystem.removeNotification(${notif.id})">
                    <p>${notif.message}</p>
                    <small>${this.formatTime(notif.time)}</small>
                </div>
            `).join('')}
        `;

        // Update badge count
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.notifications.length;
            badge.style.display = this.notifications.length > 0 ? 'inline-block' : 'none';
        }
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateNotificationUI();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.updateNotificationUI();
    }

    showPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.style.display = 'block';
        }
    }

    hidePanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    playNotificationSound(type) {
        if (!this.soundEnabled) return;

        const audio = new Audio();
        switch(type) {
            case 'success':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';
                break;
            case 'danger':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-warning-alarm-688.mp3';
                break;
            default:
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3';
        }

        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }

    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }

    saveToLocalStorage() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications.slice(0, 20)));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            this.notifications = JSON.parse(saved).map(n => ({
                ...n,
                time: new Date(n.time)
            }));
            this.updateNotificationUI();
        }
    }

    // Special notification types
    showAviatorWin(player, amount, multiplier) {
        return this.showNotification(
            `🎉 ${player} won ${this.formatMoney(amount)} at ${multiplier}x on Aviator!`,
            'success',
            { game: 'aviator', player, amount, multiplier }
        );
    }

    showDepositSuccess(amount) {
        return this.showNotification(
            `💵 Deposit successful: ${this.formatMoney(amount)}`,
            'success',
            { type: 'deposit', amount }
        );
    }

    showWithdrawRequest(amount) {
        return this.showNotification(
            `🏧 Withdrawal requested: ${this.formatMoney(amount)}`,
            'info',
            { type: 'withdrawal', amount }
        );
    }

    showBigWinAlert(player, amount, game) {
        return this.showNotification(
            `🔥 ${player} just won ${this.formatMoney(amount)} on ${game}!`,
            'success',
            { type: 'big_win', player, amount, game }
        );
    }

    formatMoney(amount) {
        // This should use the same formatting logic as the main app
        return `${parseFloat(amount).toLocaleString('en-US')} TZS`;
    }
}

// Initialize notification system
window.notificationSystem = new NotificationSystem();

// Global functions for HTML
window.openNotifications = function() {
    window.notificationSystem.showPanel();
};

window.closeNotifications = function() {
    window.notificationSystem.hidePanel();
};

// Load saved notifications when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem.loadFromLocalStorage();
});
