// components/notification.js
export function showNotification(notification) {
    const container = document.getElementById('notification-container');
    if (!container) {
        createNotificationContainer();
    }
    
    const notificationId = 'notification-' + Date.now();
    const notificationElement = document.createElement('div');
    
    notificationElement.id = notificationId;
    notificationElement.className = `notification notification-${notification.type || 'info'}`;
    notificationElement.innerHTML = `
        <div class="notification-icon">
            ${getNotificationIcon(notification.type)}
        </div>
        <div class="notification-content">
            <h4 class="notification-title">${notification.title || 'Notification'}</h4>
            <p class="notification-message">${notification.message || ''}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.appendChild(notificationElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const element = document.getElementById(notificationId);
        if (element) {
            element.remove();
        }
    }, 5000);
    
    // Add styles if not already added
    addNotificationStyles();
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle"></i>';
        case 'error':
            return '<i class="fas fa-exclamation-circle"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle"></i>';
        case 'win':
            return '<i class="fas fa-trophy"></i>';
        default:
            return '<i class="fas fa-info-circle"></i>';
    }
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
}

function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        }
        
        .notification {
            background-color: var(--color-secondary);
            border-radius: var(--border-radius-md);
            padding: var(--spacing-md);
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-md);
            box-shadow: var(--shadow-xl);
            animation: slideInRight 0.3s ease;
            border-left: 4px solid var(--color-gray);
        }
        
        .notification-success {
            border-left-color: var(--color-success);
        }
        
        .notification-error {
            border-left-color: var(--color-danger);
        }
        
        .notification-warning {
            border-left-color: var(--color-warning);
        }
        
        .notification-info {
            border-left-color: var(--color-info);
        }
        
        .notification-win {
            border-left-color: var(--color-primary);
        }
        
        .notification-icon {
            font-size: 20px;
            margin-top: 2px;
        }
        
        .notification-success .notification-icon {
            color: var(--color-success);
        }
        
        .notification-error .notification-icon {
            color: var(--color-danger);
        }
        
        .notification-warning .notification-icon {
            color: var(--color-warning);
        }
        
        .notification-info .notification-icon {
            color: var(--color-info);
        }
        
        .notification-win .notification-icon {
            color: var(--color-primary);
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-title {
            font-size: var(--font-size-md);
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--color-light);
        }
        
        .notification-message {
            font-size: var(--font-size-sm);
            color: var(--color-gray);
            line-height: 1.4;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--color-gray);
            cursor: pointer;
            padding: 4px;
            line-height: 1;
        }
        
        .notification-close:hover {
            color: var(--color-light);
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Make function available globally
window.showNotification = showNotification;
