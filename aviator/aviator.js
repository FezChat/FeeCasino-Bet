// aviator/aviator.js
import { showNotification } from '../components/notification.js';
import { playSound } from '../components/sound.js';

class AviatorGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.plane = document.getElementById('plane');
        
        this.gameState = 'waiting'; // waiting, running, crashed
        this.currentMultiplier = 1.0;
        this.crashPoint = 0;
        this.roundNumber = 1247;
        this.playerCount = 342;
        this.highestMultiplier = 12.5;
        
        this.myBets = [];
        this.activeBet = null;
        this.betAmount = 100;
        this.autoCashoutEnabled = false;
        this.autoCashoutMultiplier = 2.0;
        
        this.history = [];
        this.leaderboard = [];
        
        this.animationId = null;
        this.startTime = null;
        this.lastCrashPoints = [];
        
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Load game data
        this.loadGameData();
        
        // Start game loop
        this.gameLoop();
        
        // Start new round after delay
        setTimeout(() => this.startNewRound(), 3000);
    }
    
    setupEventListeners() {
        // Bet amount input
        const betAmountInput = document.getElementById('bet-amount');
        const betSlider = document.getElementById('bet-slider');
        
        betAmountInput.addEventListener('input', (e) => {
            this.betAmount = parseFloat(e.target.value) || 10;
            betSlider.value = this.betAmount;
        });
        
        betSlider.addEventListener('input', (e) => {
            this.betAmount = parseFloat(e.target.value);
            betAmountInput.value = this.betAmount;
        });
        
        // Auto cashout toggle
        const autoToggle = document.getElementById('auto-cashout-toggle');
        const cashoutInput = document.getElementById('cashout-multiplier');
        
        autoToggle.addEventListener('change', (e) => {
            this.autoCashoutEnabled = e.target.checked;
            cashoutInput.disabled = !this.autoCashoutEnabled;
            
            if (this.autoCashoutEnabled && this.activeBet) {
                this.activeBet.autoCashout = true;
                this.activeBet.cashoutMultiplier = this.autoCashoutMultiplier;
            }
        });
        
        cashoutInput.addEventListener('input', (e) => {
            this.autoCashoutMultiplier = parseFloat(e.target.value) || 1.1;
        });
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.drawBackground();
    }
    
    drawBackground() {
        const { width, height } = this.canvas;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0c4a6e');
        gradient.addColorStop(1, '#111827');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i < 5; i++) {
            const y = (i + 1) * height / 5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        // Draw multiplier markers
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'right';
        
        const multipliers = [1, 2, 5, 10, 20, 50, 100];
        multipliers.forEach(mult => {
            const x = this.multiplierToX(mult);
            if (x < width) {
                this.ctx.fillText(`${mult}x`, x - 10, height - 10);
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, height);
                this.ctx.stroke();
            }
        });
        
        // Draw flight path if game is running
        if (this.gameState === 'running') {
            this.drawFlightPath();
        }
    }
    
    multiplierToX(multiplier) {
        const width = this.canvas.width;
        // Logarithmic scaling for better visualization
        const logMultiplier = Math.log10(multiplier);
        const maxLog = Math.log10(1000); // Show up to 1000x
        return (logMultiplier / maxLog) * width * 0.9 + width * 0.05;
    }
    
    drawFlightPath() {
        const { width, height } = this.canvas;
        const centerY = height / 2;
        
        // Draw the flight path line
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([]);
        
        const currentX = this.multiplierToX(this.currentMultiplier);
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(currentX, centerY);
        this.ctx.stroke();
        
        // Draw multiplier text along the path
        this.ctx.fillStyle = '#10b981';
        this.ctx.font = 'bold 16px Inter';
        this.ctx.textAlign = 'center';
        
        const displayMultiplier = this.currentMultiplier.toFixed(2);
        this.ctx.fillText(`${displayMultiplier}x`, currentX, centerY - 20);
        
        // Draw crash point if game crashed
        if (this.gameState === 'crashed' && this.crashPoint > 0) {
            const crashX = this.multiplierToX(this.crashPoint);
            
            // Draw crash marker
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.arc(crashX, centerY, 8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw explosion effect
            this.ctx.strokeStyle = '#ef4444';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const length = 15;
                this.ctx.beginPath();
                this.ctx.moveTo(crashX, centerY);
                this.ctx.lineTo(
                    crashX + Math.cos(angle) * length,
                    centerY + Math.sin(angle) * length
                );
                this.ctx.stroke();
            }
            
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fillText(`Crashed at ${this.crashPoint.toFixed(2)}x`, crashX, centerY + 40);
        }
    }
    
    gameLoop() {
        this.drawBackground();
        
        if (this.gameState === 'running') {
            const elapsed = (Date.now() - this.startTime) / 1000;
            
            // Increase multiplier with random volatility
            let increment = 0.02;
            if (this.currentMultiplier > 5) increment = 0.05;
            if (this.currentMultiplier > 10) increment = 0.1;
            if (this.currentMultiplier > 20) increment = 0.2;
            
            // Add some randomness
            increment *= (0.8 + Math.random() * 0.4);
            
            this.currentMultiplier += increment;
            
            // Update plane position
            const planeX = this.multiplierToX(this.currentMultiplier);
            this.plane.style.left = `${planeX}px`;
            
            // Update multiplier display
            document.getElementById('current-multiplier').textContent = 
                `${this.currentMultiplier.toFixed(2)}x`;
            
            // Check for auto cashout
            if (this.autoCashoutEnabled && this.activeBet && 
                this.currentMultiplier >= this.autoCashoutMultiplier) {
                this.cashOut();
            }
            
            // Random crash chance increases with multiplier
            const crashChance = Math.min(0.001 * Math.pow(this.currentMultiplier, 2), 0.1);
            if (Math.random() < crashChance) {
                this.crash();
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    startNewRound() {
        this.gameState = 'waiting';
        this.currentMultiplier = 1.0;
        this.crashPoint = 0;
        this.roundNumber++;
        this.playerCount = Math.floor(300 + Math.random() * 200);
        
        // Update displays
        document.getElementById('round-number').textContent = `#${this.roundNumber.toLocaleString()}`;
        document.getElementById('player-count').textContent = this.playerCount.toLocaleString();
        document.getElementById('current-multiplier').textContent = '1.00x';
        
        // Reset plane position
        this.plane.style.left = '0px';
        
        // Enable betting
        document.getElementById('place-bet-btn').disabled = false;
        document.getElementById('cashout-btn').disabled = true;
        
        // Show countdown
        this.showCountdown(5);
    }
    
    showCountdown(seconds) {
        let countdown = seconds;
        
        const countdownInterval = setInterval(() => {
            if (countdown > 0) {
                showNotification({
                    title: 'Round Starting',
                    message: `Next round in ${countdown}...`,
                    type: 'info'
                });
                countdown--;
            } else {
                clearInterval(countdownInterval);
                this.startRound();
            }
        }, 1000);
    }
    
    startRound() {
        this.gameState = 'running';
        this.startTime = Date.now();
        
        // Generate random crash point between 1.01 and 1000
        const minCrash = 1.01;
        const maxCrash = 1000;
        
        // Use exponential distribution for crash points
        const lambda = 0.1;
        let crashPoint = minCrash;
        while (crashPoint < maxCrash && Math.random() > lambda) {
            crashPoint *= 1.1;
        }
        
        this.crashPoint = Math.min(crashPoint, maxCrash);
        
        // Update highest multiplier
        if (this.crashPoint > this.highestMultiplier) {
            this.highestMultiplier = this.crashPoint;
            document.getElementById('highest-multiplier').textContent = 
                `${this.highestMultiplier.toFixed(1)}x`;
        }
        
        // Enable cashout button
        document.getElementById('cashout-btn').disabled = false;
        
        // Play start sound
        playSound('notification');
        
        showNotification({
            title: 'Round Started!',
            message: 'Place your bets and watch the multiplier grow!',
            type: 'info'
        });
    }
    
    crash() {
        this.gameState = 'crashed';
        
        // Update crash display
        document.getElementById('last-crash').textContent = 
            `${this.currentMultiplier.toFixed(2)}x`;
        
        // Add to history
        this.addToHistory(this.currentMultiplier);
        
        // Process active bets as losses
        if (this.activeBet) {
            this.activeBet.status = 'lost';
            this.activeBet.endTime = new Date();
            this.updateMyBetsDisplay();
            
            showNotification({
                title: 'Plane Crashed!',
                message: `You lost ${this.formatCurrency(this.activeBet.amount)}`,
                type: 'error'
            });
            
            playSound('error');
            this.activeBet = null;
        }
        
        // Shake plane for effect
        this.plane.classList.add('shake');
        setTimeout(() => this.plane.classList.remove('shake'), 500);
        
        // Start new round after delay
        setTimeout(() => this.startNewRound(), 5000);
    }
    
    placeBet() {
        if (this.gameState !== 'waiting') {
            showNotification({
                title: 'Cannot Place Bet',
                message: 'Please wait for the next round to start.',
                type: 'warning'
            });
            playSound('error');
            return;
        }
        
        if (this.betAmount < 10) {
            showNotification({
                title: 'Invalid Bet Amount',
                message: 'Minimum bet is 10 TZS',
                type: 'error'
            });
            playSound('error');
            return;
        }
        
        // Check balance (simulated)
        const currentBalance = parseFloat(document.getElementById('aviator-balance').textContent.replace(/,/g, ''));
        if (this.betAmount > currentBalance) {
            showNotification({
                title: 'Insufficient Balance',
                message: 'You do not have enough balance to place this bet.',
                type: 'error'
            });
            playSound('error');
            return;
        }
        
        // Create bet object
        this.activeBet = {
            id: Date.now(),
            amount: this.betAmount,
            multiplier: 1.0,
            status: 'active',
            startTime: new Date(),
            autoCashout: this.autoCashoutEnabled,
            cashoutMultiplier: this.autoCashoutMultiplier
        };
        
        this.myBets.unshift(this.activeBet);
        
        // Update balance (simulated)
        const newBalance = currentBalance - this.betAmount;
        document.getElementById('aviator-balance').textContent = 
            newBalance.toLocaleString();
        
        // Update UI
        document.getElementById('place-bet-btn').disabled = true;
        this.updateMyBetsDisplay();
        
        showNotification({
            title: 'Bet Placed!',
            message: `Bet of ${this.formatCurrency(this.betAmount)} placed successfully.`,
            type: 'success'
        });
        
        playSound('notification');
    }
    
    cashOut() {
        if (!this.activeBet || this.gameState !== 'running') {
            showNotification({
                title: 'Cannot Cash Out',
                message: 'No active bet or round not running.',
                type: 'warning'
            });
            playSound('error');
            return;
        }
        
        // Calculate win
        const winAmount = this.activeBet.amount * this.currentMultiplier;
        const profit = winAmount - this.activeBet.amount;
        
        // Update bet
        this.activeBet.status = 'cashed';
        this.activeBet.multiplier = this.currentMultiplier;
        this.activeBet.winAmount = winAmount;
        this.activeBet.profit = profit;
        this.activeBet.endTime = new Date();
        
        // Update balance (simulated)
        const currentBalance = parseFloat(document.getElementById('aviator-balance').textContent.replace(/,/g, ''));
        const newBalance = currentBalance + winAmount;
        document.getElementById('aviator-balance').textContent = 
            newBalance.toLocaleString();
        
        // Update UI
        document.getElementById('cashout-btn').disabled = true;
        this.updateMyBetsDisplay();
        
        // Add to history
        this.addToHistory(this.currentMultiplier, true);
        
        // Update leaderboard
        this.updateLeaderboard(profit);
        
        showNotification({
            title: 'Cashed Out!',
            message: `You won ${this.formatCurrency(winAmount)} (${this.currentMultiplier.toFixed(2)}x)`,
            type: 'success'
        });
        
        playSound('notification');
        
        // Reset active bet
        this.activeBet = null;
    }
    
    addToHistory(multiplier, isWin = false) {
        this.history.unshift({
            multiplier,
            isWin,
            time: new Date()
        });
        
        // Keep only last 20
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${item.isWin ? 'win' : 'loss'}`;
            historyItem.textContent = `${item.multiplier.toFixed(2)}x`;
            historyList.appendChild(historyItem);
        });
    }
    
    updateMyBetsDisplay() {
        const myBetsList = document.getElementById('my-bets-list');
        
        if (this.myBets.length === 0) {
            myBetsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-money-check-alt"></i>
                    <p>No active bets</p>
                </div>
            `;
            return;
        }
        
        myBetsList.innerHTML = '';
        
        // Show only last 5 bets
        const recentBets = this.myBets.slice(0, 5);
        
        recentBets.forEach(bet => {
            const betItem = document.createElement('div');
            betItem.className = 'bet-item';
            
            let statusText = '';
            let statusClass = '';
            
            switch (bet.status) {
                case 'active':
                    statusText = 'ACTIVE';
                    statusClass = 'status-active';
                    break;
                case 'cashed':
                    statusText = `${bet.multiplier.toFixed(2)}x`;
                    statusClass = 'status-cashed';
                    break;
                case 'lost':
                    statusText = 'LOST';
                    statusClass = 'status-lost';
                    break;
            }
            
            betItem.innerHTML = `
                <div class="bet-info">
                    <span class="bet-amount">${this.formatCurrency(bet.amount)}</span>
                    ${bet.multiplier ? 
                        `<span class="bet-multiplier">at ${bet.multiplier.toFixed(2)}x</span>` : 
                        ''}
                </div>
                <span class="bet-status ${statusClass}">${statusText}</span>
            `;
            
            myBetsList.appendChild(betItem);
        });
    }
    
    updateLeaderboard(profit) {
        // Simulate leaderboard updates
        if (profit > 10000) {
            this.leaderboard.unshift({
                player: 'You',
                win: profit,
                rank: this.leaderboard.length + 1
            });
            
            // Keep only top 5
            if (this.leaderboard.length > 5) {
                this.leaderboard = this.leaderboard.slice(0, 5);
            }
            
            this.updateLeaderboardDisplay();
        }
    }
    
    updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('leaderboard-list');
        
        if (this.leaderboard.length === 0) {
            leaderboardList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <p>No winners yet</p>
                </div>
            `;
            return;
        }
        
        leaderboardList.innerHTML = '';
        
        this.leaderboard.forEach((item, index) => {
            const leaderboardItem = document.createElement('div');
            leaderboardItem.className = 'leaderboard-item';
            
            leaderboardItem.innerHTML = `
                <div class="leaderboard-rank">${index + 1}</div>
                <div class="leaderboard-player">
                    <div class="player-name">${item.player}</div>
                    <div class="player-win">+${this.formatCurrency(item.win)}</div>
                </div>
            `;
            
            leaderboardList.appendChild(leaderboardItem);
        });
    }
    
    loadGameData() {
        // Simulate loading game data
        this.history = [
            { multiplier: 2.45, isWin: true },
            { multiplier: 1.23, isWin: false },
            { multiplier: 5.67, isWin: true },
            { multiplier: 3.21, isWin: true },
            { multiplier: 1.89, isWin: false },
            { multiplier: 12.34, isWin: true },
            { multiplier: 2.01, isWin: false },
            { multiplier: 7.89, isWin: true }
        ];
        
        this.leaderboard = [
            { player: 'BigWinner', win: 250000, rank: 1 },
            { player: 'LuckyGuy', win: 187500, rank: 2 },
            { player: 'ProGambler', win: 125000, rank: 3 }
        ];
        
        this.updateHistoryDisplay();
        this.updateLeaderboardDisplay();
        this.updateMyBetsDisplay();
    }
    
    formatCurrency(amount) {
        return amount.toLocaleString('en-US') + ' TZS';
    }
    
    resetGame() {
        // Reset all game state
        this.myBets = [];
        this.activeBet = null;
        this.betAmount = 100;
        
        // Update UI
        document.getElementById('bet-amount').value = '100';
        document.getElementById('bet-slider').value = '100';
        document.getElementById('auto-cashout-toggle').checked = false;
        document.getElementById('cashout-multiplier').value = '2.00';
        document.getElementById('cashout-multiplier').disabled = true;
        
        this.updateMyBetsDisplay();
        
        showNotification({
            title: 'Game Reset',
            message: 'All bets and game state have been reset.',
            type: 'info'
        });
        
        playSound('notification');
    }
}

// Window functions for button clicks
window.setBetAmount = function(amount) {
    document.getElementById('bet-amount').value = amount;
    document.getElementById('bet-slider').value = amount;
    if (window.aviatorGame) {
        window.aviatorGame.betAmount = amount;
    }
};

window.setCashoutMultiplier = function(multiplier) {
    document.getElementById('cashout-multiplier').value = multiplier;
    if (window.aviatorGame) {
        window.aviatorGame.autoCashoutMultiplier = multiplier;
    }
};

window.placeBet = function() {
    if (window.aviatorGame) {
        window.aviatorGame.placeBet();
    }
};

window.cashOut = function() {
    if (window.aviatorGame) {
        window.aviatorGame.cashOut();
    }
};

window.resetGame = function() {
    if (window.aviatorGame) {
        window.aviatorGame.resetGame();
    }
};

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.aviatorGame = new AviatorGame();
});
