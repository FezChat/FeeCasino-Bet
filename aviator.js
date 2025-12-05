import { supabase } from './supabase.js';
import { authSystem } from './auth.js';

class AviatorGame {
    constructor() {
        this.gameActive = false;
        this.currentMultiplier = 1.0;
        this.myBet = null;
        this.airplaneSpeed = 1;
        this.roundHistory = [];
        this.activeBets = [];
        this.gameInterval = null;
        this.crashPoint = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.loadGameHistory();
        this.setupEventListeners();
        this.updateUI();
        this.startNewRound();
        this.simulateOtherPlayers();
    }

    async checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = session.user;
        
        // Load user balance
        const { data } = await supabase
            .from('users')
            .select('balance')
            .eq('id', this.currentUser.id)
            .single();
            
        this.userBalance = data?.balance || 0;
    }

    setupEventListeners() {
        document.getElementById('placeBetBtn').addEventListener('click', () => this.placeBet());
        document.getElementById('cashoutBtn').addEventListener('click', () => this.cashout());
        
        // Quick bet buttons
        document.querySelectorAll('.bet-amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!e.target.classList.contains('bet-input')) {
                    document.querySelectorAll('.bet-amount-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });
    }

    startNewRound() {
        this.gameActive = false;
        this.currentMultiplier = 1.0;
        this.crashPoint = this.generateCrashPoint();
        this.myBet = null;
        
        // Reset UI
        document.getElementById('cashoutBtn').style.display = 'none';
        document.getElementById('placeBetBtn').disabled = false;
        document.getElementById('airplane').style.transform = 'translateY(0)';
        
        // Update displays
        this.updateMultiplierDisplay();
        this.updateTrackMarkers();
        
        // Show countdown
        this.showCountdown();
    }

    generateCrashPoint() {
        // Generate random crash point between 1.1x and 50x
        // Using exponential distribution for more realistic crash points
        const r = Math.random();
        const crash = 1.1 + (Math.pow(1 - r, -0.1) - 1) / 10;
        return Math.min(crash, 50.0); // Cap at 50x
    }

    showCountdown() {
        let countdown = 5;
        const countdownElement = document.createElement('div');
        countdownElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            color: var(--primary-green);
            text-shadow: 0 0 20px rgba(0,255,0,0.7);
            z-index: 10;
        `;
        countdownElement.textContent = countdown;
        document.getElementById('airplaneTrack').appendChild(countdownElement);
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownElement.remove();
                this.startGame();
            }
        }, 1000);
    }

    startGame() {
        this.gameActive = true;
        this.gameInterval = setInterval(() => this.updateGame(), 50);
    }

    updateGame() {
        if (!this.gameActive) return;
        
        // Increase multiplier
        const increment = 0.01 * this.airplaneSpeed;
        this.currentMultiplier += increment;
        
        // Move airplane
        const trackHeight = document.getElementById('airplaneTrack').clientHeight;
        const airplane = document.getElementById('airplane');
        const progress = (this.currentMultiplier - 1) / (this.crashPoint - 1);
        const newPosition = progress * (trackHeight - 100);
        airplane.style.transform = `translateY(${newPosition}px) rotate(${progress * 45}deg)`;
        
        // Update displays
        this.updateMultiplierDisplay();
        
        // Check for crash
        if (this.currentMultiplier >= this.crashPoint) {
            this.gameCrashed();
        }
        
        // Check auto cashout
        if (this.myBet && this.myBet.autoCashout && this.currentMultiplier >= this.myBet.autoCashout) {
            this.cashout();
        }
    }

    gameCrashed() {
        this.gameActive = false;
        clearInterval(this.gameInterval);
        
        // Animate crash
        const airplane = document.getElementById('airplane');
        airplane.style.transform += ' rotate(90deg)';
        airplane.style.opacity = '0.5';
        
        // Record round history
        this.roundHistory.unshift({
            multiplier: this.crashPoint.toFixed(2),
            time: new Date().toLocaleTimeString()
        });
        
        if (this.roundHistory.length > 20) this.roundHistory.pop();
        
        this.updateHistoryDisplay();
        
        // Process losses
        this.activeBets.forEach(bet => {
            if (!bet.cashedOut) {
                this.processLoss(bet);
            }
        });
        
        this.activeBets = [];
        this.updateActiveBetsDisplay();
        
        // Play crash sound
        this.playSound('crash');
        
        // Show crash notification
        this.showGameNotification(`Plane crashed at ${this.crashPoint.toFixed(2)}x!`, 'danger');
        
        // Start new round after delay
        setTimeout(() => {
            airplane.style.opacity = '1';
            this.startNewRound();
        }, 3000);
    }

    async placeBet() {
        const betAmount = parseFloat(document.getElementById('betAmount').value) || 
                         parseFloat(document.querySelector('.bet-amount-btn.active')?.dataset?.amount || 100);
        
        const autoCashout = parseFloat(document.getElementById('autoCashout').value);
        
        if (betAmount < 100) {
            this.showGameNotification('Minimum bet is 100', 'danger');
            return;
        }
        
        if (betAmount > this.userBalance) {
            this.showGameNotification('Insufficient balance', 'danger');
            return;
        }
        
        if (this.myBet) {
            this.showGameNotification('You already have an active bet', 'danger');
            return;
        }
        
        // Deduct bet amount from balance
        this.userBalance -= betAmount;
        await this.updateUserBalance();
        
        // Create bet object
        this.myBet = {
            amount: betAmount,
            autoCashout: autoCashout || null,
            cashedOut: false,
            cashoutMultiplier: null,
            winnings: 0
        };
        
        // Add to active bets
        this.activeBets.push({
            player: 'You',
            amount: betAmount,
            multiplier: 'Waiting...'
        });
        
        // Update UI
        document.getElementById('placeBetBtn').disabled = true;
        document.getElementById('cashoutBtn').style.display = 'block';
        this.updateUI();
        this.updateActiveBetsDisplay();
        
        this.showGameNotification(`Bet placed: ${this.formatMoney(betAmount)}`, 'success');
        this.playSound('bet');
    }

    async cashout() {
        if (!this.myBet || this.myBet.cashedOut || !this.gameActive) return;
        
        this.myBet.cashedOut = true;
        this.myBet.cashoutMultiplier = this.currentMultiplier;
        this.myBet.winnings = this.myBet.amount * this.currentMultiplier;
        
        // Add winnings to balance
        this.userBalance += this.myBet.winnings;
        await this.updateUserBalance();
        
        // Update active bets display
        const myBetIndex = this.activeBets.findIndex(b => b.player === 'You');
        if (myBetIndex !== -1) {
            this.activeBets[myBetIndex].multiplier = `${this.currentMultiplier.toFixed(2)}x`;
        }
        
        // Update UI
        document.getElementById('cashoutBtn').style.display = 'none';
        this.updateUI();
        this.updateActiveBetsDisplay();
        
        // Show success message
        this.showGameNotification(
            `Cashed out at ${this.currentMultiplier.toFixed(2)}x! Won ${this.formatMoney(this.myBet.winnings)}`,
            'success'
        );
        
        this.playSound('win');
        
        // Record win
        await this.recordGameResult('win', this.myBet.amount, this.myBet.winnings);
    }

    processLoss(bet) {
        this.showGameNotification(`Lost ${this.formatMoney(bet.amount)}`, 'danger');
        this.recordGameResult('loss', bet.amount, 0);
    }

    async updateUserBalance() {
        const { error } = await supabase
            .from('users')
            .update({ balance: this.userBalance })
            .eq('id', this.currentUser.id);
            
        if (error) {
            console.error('Failed to update balance:', error);
        }
    }

    async recordGameResult(result, betAmount, winnings) {
        const { error } = await supabase
            .from('game_results')
            .insert([{
                user_id: this.currentUser.id,
                game: 'aviator',
                result: result,
                bet_amount: betAmount,
                winnings: winnings,
                multiplier: this.currentMultiplier,
                created_at: new Date().toISOString()
            }]);
            
        if (error) {
            console.error('Failed to record game result:', error);
        }
    }

    updateMultiplierDisplay() {
        const multiplierElement = document.getElementById('currentMultiplier');
        const displayElement = document.getElementById('multiplierDisplay');
        
        if (multiplierElement) {
            multiplierElement.textContent = `${this.currentMultiplier.toFixed(2)}x`;
        }
        
        if (displayElement) {
            displayElement.textContent = `${this.currentMultiplier.toFixed(2)}x`;
            
            // Color based on multiplier
            if (this.currentMultiplier >= 10) {
                displayElement.style.color = '#ff3333';
            } else if (this.currentMultiplier >= 5) {
                displayElement.style.color = '#ff9900';
            } else if (this.currentMultiplier >= 2) {
                displayElement.style.color = '#ffff00';
            } else {
                displayElement.style.color = 'var(--primary-green)';
            }
        }
    }

    updateTrackMarkers() {
        const track = document.getElementById('airplaneTrack');
        const existingMarkers = track.querySelectorAll('.multiplier-line');
        existingMarkers.forEach(marker => marker.remove());
        
        // Add multiplier markers
        for (let i = 2; i <= 10; i++) {
            const marker = document.createElement('div');
            marker.className = 'multiplier-line';
            marker.style.left = `${(i - 1) * 10}%`;
            
            const label = document.createElement('div');
            label.className = 'multiplier-label';
            label.textContent = `${i}x`;
            label.style.left = `${(i - 1) * 10}%`;
            label.style.top = '10px';
            
            track.appendChild(marker);
            track.appendChild(label);
        }
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        historyList.innerHTML = this.roundHistory.map(round => `
            <div class="history-item ${round.multiplier >= 2 ? 'win' : 'loss'}">
                ${round.multiplier}x
            </div>
        `).join('');
    }

    updateActiveBetsDisplay() {
        const activeBetsList = document.getElementById('activeBetsList');
        if (!activeBetsList) return;
        
        activeBetsList.innerHTML = this.activeBets.map(bet => `
            <div class="bet-item">
                <span>${bet.player}</span>
                <span>${this.formatMoney(bet.amount)}</span>
                <span>${bet.multiplier}</span>
            </div>
        `).join('');
    }

    updateUI() {
        // Update balance display
        const balanceElement = document.getElementById('userBalance');
        if (balanceElement) {
            balanceElement.textContent = this.formatMoney(this.userBalance);
        }
        
        // Update bet amount input with selected button value
        const activeBetBtn = document.querySelector('.bet-amount-btn.active');
        if (activeBetBtn && !document.getElementById('betAmount').value) {
            document.getElementById('betAmount').value = activeBetBtn.textContent.replace(/,/g, '');
        }
    }

    loadGameHistory() {
        // Load fake history for now
        for (let i = 0; i < 10; i++) {
            const multiplier = (1 + Math.random() * 4).toFixed(2);
            this.roundHistory.push({
                multiplier: multiplier,
                time: `${i * 2} min ago`
            });
        }
        this.updateHistoryDisplay();
    }

    simulateOtherPlayers() {
        setInterval(() => {
            if (Math.random() > 0.7 && this.gameActive) {
                const fakePlayers = ['Player_***23', 'Lucky_***88', 'Win_***45', 'Bet_***12'];
                const player = fakePlayers[Math.floor(Math.random() * fakePlayers.length)];
                const amount = Math.floor(Math.random() * 10000) + 100;
                
                this.activeBets.push({
                    player: player,
                    amount: amount,
                    multiplier: 'Waiting...'
                });
                
                if (this.activeBets.length > 10) this.activeBets.shift();
                this.updateActiveBetsDisplay();
                
                // Update total bet display
                const totalBetElement = document.getElementById('totalBet');
                if (totalBetElement) {
                    const current = parseInt(totalBetElement.textContent.replace(/[^0-9]/g, ''));
                    totalBetElement.textContent = this.formatMoney(current + amount);
                }
            }
            
            // Update active players count
            const playersElement = document.getElementById('activePlayers');
            if (playersElement) {
                const current = parseInt(playersElement.textContent);
                playersElement.textContent = Math.max(50, current + Math.floor(Math.random() * 10) - 5);
            }
        }, 2000);
    }

    formatMoney(amount) {
        return `${parseFloat(amount).toLocaleString('en-US')} TZS`;
    }

    showGameNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <p>${message}</p>
            <small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
        `;
        
        const notificationPanel = document.getElementById('notificationPanel');
        if (!notificationPanel) {
            // Create notification panel if it doesn't exist
            const panel = document.createElement('div');
            panel.id = 'notificationPanel';
            panel.className = 'notification-panel';
            panel.style.position = 'fixed';
            panel.style.bottom = '20px';
            panel.style.right = '20px';
            panel.style.zIndex = '1000';
            document.body.appendChild(panel);
        }
        
        document.getElementById('notificationPanel').prepend(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        this.playNotificationSound(type);
    }

    playSound(soundType) {
        const audio = new Audio();
        
        switch(soundType) {
            case 'bet':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3';
                break;
            case 'win':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';
                break;
            case 'crash':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-explosion-woosh-1493.mp3';
                break;
            case 'notification':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3';
                break;
        }
        
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }

    playNotificationSound(type) {
        if (localStorage.getItem('notificationSound') !== 'off') {
            this.playSound('notification');
        }
    }
}

// Global functions for HTML buttons
window.setBetAmount = function(amount) {
    document.getElementById('betAmount').value = amount;
    document.querySelectorAll('.bet-amount-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aviatorGame = new AviatorGame();
});
