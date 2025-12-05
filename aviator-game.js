// aviator-game.js
class AviatorGame {
    constructor() {
        this.gameActive = false;
        this.roundActive = false;
        this.currentMultiplier = 1.0;
        this.myBet = null;
        this.crashPoint = null;
        this.gameInterval = null;
        this.timeLeft = 5;
        this.timerInterval = null;
        this.soundEnabled = true;
        
        // Game settings
        this.minBet = 100;
        this.maxBet = 1000000;
        this.minMultiplier = 1.1;
        this.maxMultiplier = 50;
        
        // Game history
        this.roundHistory = [];
        this.activeBets = [];
        this.chatMessages = [];
        this.recentWinners = [];
        
        this.init();
    }
    
    init() {
        this.loadGame();
        this.setupEventListeners();
        this.setupMarkers();
        this.updateUI();
        this.startCountdown();
        this.startBotsSimulation();
        this.startChatSimulation();
        this.loadWinners();
    }
    
    loadGame() {
        // Load saved data
        const savedHistory = localStorage.getItem('aviatorHistory');
        if (savedHistory) this.roundHistory = JSON.parse(savedHistory);
        
        const savedSound = localStorage.getItem('soundEnabled');
        this.soundEnabled = savedSound !== 'false';
        
        this.updateHistoryDisplay();
        this.updateSoundToggle();
    }
    
    setupEventListeners() {
        // Bet buttons
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.dataset.amount;
                this.setBetAmount(amount);
            });
        });
        
        // Multiplier buttons
        document.querySelectorAll('.multiplier-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const multiplier = e.target.dataset.multiplier;
                this.setAutoCashout(multiplier);
            });
        });
        
        // Main buttons
        document.getElementById('placeBetBtn').addEventListener('click', () => this.placeBet());
        document.getElementById('cashoutBtn').addEventListener('click', () => this.cashout());
        document.getElementById('repeatBetBtn').addEventListener('click', () => this.repeatBet());
        document.getElementById('sendChatBtn').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Input events
        document.getElementById('betAmount').addEventListener('input', (e) => {
            this.updateBetAmountDisplay(e.target.value);
        });
        
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        
        // Auto cashout input
        document.getElementById('autoCashout').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value && value >= this.minMultiplier) {
                this.myBet.autoCashout = value;
            }
        });
    }
    
    setupMarkers() {
        const track = document.querySelector('.multiplier-markers');
        track.innerHTML = '';
        
        // Create multiplier markers (1x to 10x)
        for (let i = 1; i <= 10; i++) {
            const marker = document.createElement('div');
            marker.className = 'marker';
            marker.style.left = `${(i - 1) * 10}%`;
            
            const label = document.createElement('div');
            label.className = 'marker-label';
            label.textContent = `${i}x`;
            label.style.left = `${(i - 1) * 10}%`;
            
            track.appendChild(marker);
            track.appendChild(label);
        }
    }
    
    startCountdown() {
        this.timeLeft = 5;
        this.updateTimer();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.startRound();
            }
        }, 1000);
    }
    
    startRound() {
        this.roundActive = true;
        this.gameActive = true;
        this.currentMultiplier = 1.0;
        this.crashPoint = this.generateCrashPoint();
        
        // Reset airplane position
        document.getElementById('airplane').style.left = '20px';
        
        // Start game loop
        this.gameInterval = setInterval(() => this.updateGame(), 50);
        
        // Play start sound
        this.playSound('start');
        
        // Update UI
        document.getElementById('placeBetBtn').disabled = true;
        document.getElementById('cashoutBtn').disabled = false;
        
        // Show notification
        this.showNotification('New round started! Place your bets!', 'info');
    }
    
    generateCrashPoint() {
        // Realistic crash point generation (similar to real Aviator)
        const r = Math.random();
        let crashPoint;
        
        if (r < 0.15) {
            // 15% chance of crash below 2x
            crashPoint = 1.1 + (Math.random() * 0.9);
        } else if (r < 0.5) {
            // 35% chance of crash between 2x-5x
            crashPoint = 2 + (Math.random() * 3);
        } else if (r < 0.8) {
            // 30% chance of crash between 5x-10x
            crashPoint = 5 + (Math.random() * 5);
        } else {
            // 20% chance of crash above 10x
            crashPoint = 10 + (Math.random() * 40);
        }
        
        return Math.min(crashPoint, this.maxMultiplier);
    }
    
    updateGame() {
        if (!this.gameActive) return;
        
        // Increase multiplier (faster as it goes)
        const speed = Math.min(0.02 + (this.currentMultiplier * 0.001), 0.1);
        this.currentMultiplier += speed;
        
        // Move airplane
        const airplane = document.getElementById('airplane');
        const trackWidth = document.querySelector('.airplane-track').clientWidth - 40;
        const progress = Math.min((this.currentMultiplier - 1) / (this.crashPoint - 1), 1);
        const newPosition = 20 + (progress * trackWidth);
        
        airplane.style.left = `${newPosition}px`;
        
        // Update multiplier display
        this.updateMultiplierDisplay();
        
        // Check for crash
        if (this.currentMultiplier >= this.crashPoint) {
            this.crash();
            return;
        }
        
        // Check auto cashout
        if (this.myBet && this.myBet.autoCashout && this.currentMultiplier >= this.myBet.autoCashout) {
            this.cashout();
        }
    }
    
    crash() {
        this.gameActive = false;
        this.roundActive = false;
        clearInterval(this.gameInterval);
        
        // Record round
        this.roundHistory.unshift({
            multiplier: this.crashPoint.toFixed(2),
            time: new Date().toLocaleTimeString(),
            crashed: true
        });
        
        if (this.roundHistory.length > 20) this.roundHistory.pop();
        
        // Update history
        this.updateHistoryDisplay();
        this.saveHistory();
        
        // Animate crash
        const airplane = document.getElementById('airplane');
        airplane.style.transform = 'translateY(-50%) rotate(90deg) scale(0.8)';
        airplane.style.opacity = '0.5';
        
        // Play crash sound
        this.playSound('crash');
        
        // Show crash notification
        this.showNotification(`Plane crashed at ${this.crashPoint.toFixed(2)}x!`, 'danger');
        
        // Process active bets
        this.processRoundEnd();
        
        // Start new round after delay
        setTimeout(() => {
            this.resetRound();
            this.startCountdown();
        }, 3000);
    }
    
    processRoundEnd() {
        // Process all active bets
        this.activeBets.forEach((bet, index) => {
            if (bet.player !== 'You' && !bet.cashedOut) {
                // Simulate bot cashouts
                if (Math.random() > 0.5) {
                    const cashoutMultiplier = Math.min(this.crashPoint - 0.1, this.currentMultiplier * Math.random());
                    this.processBotWin(bet, cashoutMultiplier);
                }
            }
        });
        
        // Clear active bets
        this.activeBets = this.activeBets.filter(bet => bet.player === 'You' && bet.cashedOut);
        this.updateActiveBetsDisplay();
    }
    
    async placeBet() {
        const betAmount = parseFloat(document.getElementById('betAmount').value);
        
        // Validation
        if (!betAmount || betAmount < this.minBet) {
            this.showNotification(`Minimum bet is ${this.minBet.toLocaleString()} TZS`, 'danger');
            return;
        }
        
        if (betAmount > this.maxBet) {
            this.showNotification(`Maximum bet is ${this.maxBet.toLocaleString()} TZS`, 'danger');
            return;
        }
        
        if (this.myBet) {
            this.showNotification('You already have an active bet', 'danger');
            return;
        }
        
        // Get auto cashout value
        const autoCashout = parseFloat(document.getElementById('autoCashout').value);
        
        // Create bet object
        this.myBet = {
            amount: betAmount,
            autoCashout: autoCashout && autoCashout >= this.minMultiplier ? autoCashout : null,
            cashedOut: false,
            cashoutMultiplier: null,
            winnings: 0
        };
        
        // Update UI
        document.getElementById('placeBetBtn').disabled = true;
        document.getElementById('cashoutBtn').disabled = false;
        
        // Add to active bets
        this.activeBets.unshift({
            player: 'You',
            amount: betAmount,
            multiplier: 'Waiting...',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
        });
        
        this.updateActiveBetsDisplay();
        
        // Play sound
        this.playSound('bet');
        
        // Show notification
        this.showNotification(`Bet placed: ${this.formatMoney(betAmount)}`, 'success');
    }
    
    cashout() {
        if (!this.myBet || this.myBet.cashedOut || !this.gameActive) return;
        
        this.myBet.cashedOut = true;
        this.myBet.cashoutMultiplier = this.currentMultiplier;
        this.myBet.winnings = this.myBet.amount * this.currentMultiplier;
        
        // Update active bets display
        const myBetIndex = this.activeBets.findIndex(b => b.player === 'You');
        if (myBetIndex !== -1) {
            this.activeBets[myBetIndex].multiplier = `${this.currentMultiplier.toFixed(2)}x`;
            this.activeBets[myBetIndex].cashedOut = true;
        }
        
        // Update UI
        document.getElementById('cashoutBtn').disabled = true;
        document.getElementById('placeBetBtn').disabled = false;
        
        this.updateActiveBetsDisplay();
        this.updateCashoutDisplay();
        
        // Add to recent winners
        this.addWinner('You', this.myBet.winnings, this.currentMultiplier);
        
        // Play win sound
        this.playSound('win');
        
        // Show notification
        this.showNotification(
            `Cashed out at ${this.currentMultiplier.toFixed(2)}x! Won ${this.formatMoney(this.myBet.winnings)}`,
            'success'
        );
    }
    
    repeatBet() {
        if (!this.myBet) return;
        
        document.getElementById('betAmount').value = this.myBet.amount;
        document.getElementById('autoCashout').value = this.myBet.autoCashout || '';
        
        this.updateBetAmountDisplay(this.myBet.amount);
        this.showNotification('Previous bet loaded', 'info');
    }
    
    setBetAmount(amount) {
        document.getElementById('betAmount').value = amount;
        this.updateBetAmountDisplay(amount);
        
        // Highlight active button
        document.querySelectorAll('.bet-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.amount === amount);
        });
    }
    
    setAutoCashout(multiplier) {
        document.getElementById('autoCashout').value = multiplier;
        
        if (this.myBet) {
            this.myBet.autoCashout = parseFloat(multiplier);
        }
        
        // Highlight active button
        document.querySelectorAll('.multiplier-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.multiplier === multiplier);
        });
    }
    
    // UI Update Methods
    updateMultiplierDisplay() {
        const multiplier = this.currentMultiplier.toFixed(2);
        
        document.getElementById('multiplierText').textContent = `${multiplier}x`;
        document.getElementById('currentMultiplier').textContent = `${multiplier}x`;
        
        // Color based on multiplier
        const multiplierText = document.getElementById('multiplierText');
        if (this.currentMultiplier >= 10) {
            multiplierText.style.background = 'linear-gradient(to right, #ef4444, #f59e0b)';
        } else if (this.currentMultiplier >= 5) {
            multiplierText.style.background = 'linear-gradient(to right, #f59e0b, #fbbf24)';
        } else if (this.currentMultiplier >= 2) {
            multiplierText.style.background = 'linear-gradient(to right, #10b981, #34d399)';
        } else {
            multiplierText.style.background = 'linear-gradient(to right, var(--primary), var(--accent))';
        }
        
        // Update cashout amount if bet is active
        if (this.myBet && !this.myBet.cashedOut) {
            this.updateCashoutDisplay();
        }
    }
    
    updateCashoutDisplay() {
        if (this.myBet && this.gameActive) {
            const potentialWin = this.myBet.amount * this.currentMultiplier;
            document.getElementById('cashoutAmount').textContent = this.formatMoney(potentialWin);
        }
    }
    
    updateBetAmountDisplay(amount) {
        document.getElementById('betAmountDisplay').textContent = this.formatMoney(amount);
    }
    
    updateTimer() {
        const timerElement = document.getElementById('gameTimer');
        timerElement.textContent = this.timeLeft.toString().padStart(2, '0');
        
        // Color change when time is running out
        if (this.timeLeft <= 3) {
            timerElement.style.color = '#ef4444';
            timerElement.style.animation = 'pulse 1s infinite';
        } else {
            timerElement.style.color = 'var(--text-light)';
            timerElement.style.animation = 'none';
        }
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        historyList.innerHTML = this.roundHistory.map((round, index) => `
            <div class="history-item">
                <div class="history-round">#${this.roundHistory.length - index}</div>
                <div class="history-multiplier ${round.multiplier >= 2 ? '' : 'loss'}">
                    ${round.multiplier}x
                </div>
                <div class="history-time">${round.time}</div>
            </div>
        `).join('');
    }
    
    updateActiveBetsDisplay() {
        const betsList = document.getElementById('activeBetsList');
        if (!betsList) return;
        
        // Limit to 10 recent bets
        const recentBets = this.activeBets.slice(0, 10);
        
        betsList.innerHTML = recentBets.map(bet => `
            <div class="bet-item">
                <div class="bet-player">
                    <img src="${bet.avatar}" class="bet-player-avatar" alt="Player">
                    <span class="bet-player-name">${bet.player}</span>
                </div>
                <div class="bet-details">
                    <div class="bet-amount">${this.formatMoney(bet.amount)}</div>
                    <div class="bet-multiplier">${bet.multiplier}</div>
                </div>
            </div>
        `).join('');
    }
    
    updateSoundToggle() {
        const toggleBtn = document.getElementById('soundToggle');
        const icon = toggleBtn.querySelector('i');
        const text = this.soundEnabled ? 'Sound ON' : 'Sound OFF';
        
        icon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        toggleBtn.innerHTML = `<i class="${icon.className}"></i> ${text}`;
    }
    
    // Chat Methods
    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add message
        this.addChatMessage('You', message);
        
        // Clear input
        input.value = '';
        
        // Auto reply from bots
        setTimeout(() => {
            this.botChatReply();
        }, 1000 + Math.random() * 2000);
    }
    
    addChatMessage(user, message) {
        const chatMessage = {
            user,
            message,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`
        };
        
        this.chatMessages.unshift(chatMessage);
        if (this.chatMessages.length > 50) this.chatMessages.pop();
        
        this.updateChatDisplay();
    }
    
    updateChatDisplay() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = this.chatMessages.slice(0, 20).map(msg => `
            <div class="chat-message">
                <div class="chat-user">
                    <img src="${msg.avatar}" class="chat-user-avatar" alt="${msg.user}">
                    <span class="chat-user-name">${msg.user}</span>
                    <span class="chat-time">${msg.time}</span>
                </div>
                <div class="chat-text">${msg.message}</div>
            </div>
        `).join('');
    }
    
    botChatReply() {
        const botNames = ['Lucky_Star', 'Big_Winner', 'Casino_King', 'Slot_Master', 'Bet_Pro'];
        const messages = [
            'Good luck everyone!',
            'Going for 10x this round!',
            'Just cashed out at 5x!',
            'This game is so exciting!',
            'Anyone else going all in?',
            'To the moon! 🚀',
            'Crash incoming?',
            'My lucky day today!',
            'Just won big! 🎉',
            'Let\'s goooo!'
        ];
        
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        this.addChatMessage(botName, message);
    }
    
    startChatSimulation() {
        // Initial bot messages
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.botChatReply(), i * 2000);
        }
        
        // Continue bot messages
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.botChatReply();
            }
        }, 5000);
    }
    
    // Simulation Methods
    startBotsSimulation() {
        // Update stats periodically
        setInterval(() => {
            this.updateStats();
        }, 3000);
        
        // Add bot bets
        setInterval(() => {
            if (this.roundActive && Math.random() > 0.5) {
                this.addBotBet();
            }
        }, 1000);
    }
    
    updateStats() {
        // Update player count
        const basePlayers = 1247;
        const randomChange = Math.floor(Math.random() * 50) - 25;
        const players = Math.max(1000, basePlayers + randomChange);
        document.getElementById('playersOnline').textContent = players.toLocaleString();
        
        // Update total bets
        const betElement = document.getElementById('totalBets');
        const currentBet = parseInt(betElement.textContent.replace(/[^0-9]/g, ''));
        const betChange = Math.floor(Math.random() * 50000);
        betElement.textContent = this.formatMoney(currentBet + betChange);
    }
    
    addBotBet() {
        const botNames = ['Lucky_***23', 'Win_***45', 'Cash_***88', 'Bet_***12', 'Pro_***99'];
        const botName = botNames[Math.floor(Math.random() * botNames.length)];
        const betAmount = Math.floor(Math.random() * 10000) + 100;
        
        this.activeBets.unshift({
            player: botName,
            amount: betAmount,
            multiplier: 'Waiting...',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botName}`
        });
        
        // Limit active bets
        if (this.activeBets.length > 15) {
            this.activeBets.pop();
        }
        
        this.updateActiveBetsDisplay();
    }
    
    processBotWin(bet, multiplier) {
        const winnings = bet.amount * multiplier;
        
        // Update bet display
        const betIndex = this.activeBets.findIndex(b => b === bet);
        if (betIndex !== -1) {
            this.activeBets[betIndex].multiplier = `${multiplier.toFixed(2)}x`;
            this.activeBets[betIndex].cashedOut = true;
        }
        
        // Add to winners if significant win
        if (winnings > 50000) {
            this.addWinner(bet.player, winnings, multiplier);
        }
        
        this.updateActiveBetsDisplay();
    }
    
    addWinner(player, amount, multiplier) {
        const winner = {
            player,
            amount,
            multiplier,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${player}`,
            time: 'Just now'
        };
        
        this.recentWinners.unshift(winner);
        if (this.recentWinners.length > 10) this.recentWinners.pop();
        
        this.updateWinnersDisplay();
        
        // Show big win notification
        if (amount > 100000) {
            this.showNotification(`🎉 ${player} won ${this.formatMoney(amount)} at ${multiplier.toFixed(2)}x!`, 'success');
        }
    }
    
    loadWinners() {
        // Pre-load some winners
        const sampleWinners = [
            { player: 'Lucky_Star', amount: 250000, multiplier: 8.5 },
            { player: 'Big_Winner', amount: 150000, multiplier: 5.2 },
            { player: 'Casino_King', amount: 500000, multiplier: 12.3 },
            { player: 'Bet_Pro', amount: 75000, multiplier: 3.8 },
            { player: 'Slot_Master', amount: 180000, multiplier: 6.7 }
        ];
        
        this.recentWinners = sampleWinners.map(winner => ({
            ...winner,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${winner.player}`,
            time: 'Today'
        }));
        
        this.updateWinnersDisplay();
    }
    
    updateWinnersDisplay() {
        const winnersScroll = document.getElementById('winnersScroll');
        if (!winnersScroll) return;
        
        winnersScroll.innerHTML = this.recentWinners.map(winner => `
            <div class="winner-item">
                <img src="${winner.avatar}" class="winner-avatar-large" alt="${winner.player}">
                <div class="winner-name">${winner.player}</div>
                <div class="winner-win">${this.formatMoney(winner.amount)}</div>
                <div class="winner-multiplier">at ${winner.multiplier.toFixed(2)}x</div>
                <div class="winner-time">${winner.time}</div>
            </div>
        `).join('');
    }
    
    // Utility Methods
    formatMoney(amount) {
        return `${parseFloat(amount).toLocaleString('en-US')} TZS`;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
            <div>
                <p>${message}</p>
                <small>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Play notification sound
        if (this.soundEnabled) {
            this.playSound('notification');
        }
    }
    
    playSound(soundType) {
        if (!this.soundEnabled) return;
        
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
            case 'start':
                audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-game-show-intro-331.mp3';
                break;
        }
        
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', this.soundEnabled);
        this.updateSoundToggle();
        
        this.showNotification(
            `Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`,
            this.soundEnabled ? 'success' : 'info'
        );
    }
    
    resetRound() {
        this.gameActive = false;
        this.roundActive = false;
        this.currentMultiplier = 1.0;
        this.myBet = null;
        
        // Reset airplane
        const airplane = document.getElementById('airplane');
        airplane.style.transform = 'translateY(-50%) rotate(0deg)';
        airplane.style.opacity = '1';
        
        // Reset UI
        document.getElementById('placeBetBtn').disabled = false;
        document.getElementById('cashoutBtn').disabled = true;
        document.getElementById('cashoutAmount').textContent = '0 TZS';
        
        // Clear interval
        if (this.gameInterval) clearInterval(this.gameInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
    
    saveHistory() {
        localStorage.setItem('aviatorHistory', JSON.stringify(this.roundHistory));
    }
    
    updateUI() {
        // Update balance (you would integrate with your actual balance system)
        const userBalance = 100000; // Example balance
        document.getElementById('userBalance').textContent = this.formatMoney(userBalance);
        
        // Update bet amount display
        const betAmount = document.getElementById('betAmount').value || 1000;
        this.updateBetAmountDisplay(betAmount);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.aviatorGame = new AviatorGame();
});
