// components/header.js
export function loadHeader() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) return;
    
    headerContainer.innerHTML = `
        <header class="main-header">
            <div class="header-top">
                <div class="logo">
                    <h1>
                        <i class="fas fa-coins" style="color: #10b981;"></i>
                        FeeCasino Bet
                    </h1>
                    <span class="tagline">Mock Betting Platform</span>
                </div>
                
                <div class="search-bar">
                    <input type="text" placeholder="Search events, games..." class="search-input">
                    <button class="search-btn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                
                <div class="header-actions">
                    <button class="header-action" onclick="depositModal()" title="Deposit">
                        <i class="fas fa-plus-circle"></i>
                        <span>Deposit</span>
                    </button>
                    
                    <button class="header-action" onclick="withdrawModal()" title="Withdraw">
                        <i class="fas fa-wallet"></i>
                        <span>Withdraw</span>
                    </button>
                    
                    <div class="header-balance">
                        <div class="balance-amount">
                            <span id="header-balance">10,000</span>
                            <span id="header-currency">TZS</span>
                        </div>
                        <div class="balance-label">Balance</div>
                    </div>
                    
                    <button class="header-action bet-slip-btn" onclick="toggleBetSlip()" title="Bet Slip">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="bet-count-badge" id="header-bet-count">0</span>
                    </button>
                    
                    <div class="user-menu">
                        <button class="user-avatar">
                            <i class="fas fa-user"></i>
                        </button>
                        <div class="user-dropdown">
                            <div class="user-info">
                                <div class="username">Guest Player</div>
                                <div class="user-id">ID: ${generateUserId()}</div>
                            </div>
                            <div class="dropdown-menu">
                                <a href="#" onclick="showComingSoon()"><i class="fas fa-user"></i> Profile</a>
                                <a href="#" onclick="showComingSoon()"><i class="fas fa-history"></i> Bet History</a>
                                <a href="#" onclick="showComingSoon()"><i class="fas fa-cog"></i> Settings</a>
                                <a href="#" onclick="showComingSoon()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <nav class="main-nav">
                <div class="nav-container">
                    <a href="#" class="nav-link active">
                        <i class="fas fa-home"></i> Home
                    </a>
                    <a href="#" class="nav-link" onclick="showSportEvents('football')">
                        <i class="fas fa-futbol"></i> Football
                    </a>
                    <a href="#" class="nav-link" onclick="showSportEvents('basketball')">
                        <i class="fas fa-basketball-ball"></i> Basketball
                    </a>
                    <a href="#" class="nav-link" onclick="showSportEvents('tennis')">
                        <i class="fas fa-tennis-ball"></i> Tennis
                    </a>
                    <a href="#" class="nav-link" onclick="showComingSoon()">
                        <i class="fas fa-dice"></i> Live Casino
                    </a>
                    <a href="#" class="nav-link" onclick="showAllGames()">
                        <i class="fas fa-gamepad"></i> Virtual Sports
                    </a>
                    <a href="aviator/" class="nav-link">
                        <i class="fas fa-plane"></i> Aviator
                    </a>
                    <a href="#" class="nav-link" onclick="showComingSoon()">
                        <i class="fas fa-gift"></i> Promotions
                    </a>
                </div>
            </nav>
        </header>
        
        <style>
            .main-header {
                background: linear-gradient(90deg, var(--color-dark) 0%, var(--color-secondary) 100%);
                border-bottom: 2px solid var(--color-primary);
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 100;
            }
            
            .header-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: var(--spacing-sm) var(--spacing-lg);
                border-bottom: 1px solid var(--color-gray-dark);
            }
            
            .logo h1 {
                font-size: var(--font-size-xl);
                color: var(--color-primary);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                margin: 0;
            }
            
            .tagline {
                font-size: var(--font-size-xs);
                color: var(--color-gray);
                display: block;
                margin-top: 2px;
            }
            
            .search-bar {
                flex: 1;
                max-width: 400px;
                margin: 0 var(--spacing-lg);
                position: relative;
            }
            
            .search-input {
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-lg);
                background: var(--color-dark);
                border: 1px solid var(--color-gray-dark);
                border-radius: 50px;
                color: var(--color-light);
                padding-right: 40px;
            }
            
            .search-btn {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: var(--color-gray);
                cursor: pointer;
            }
            
            .header-actions {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }
            
            .header-action {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                padding: var(--spacing-xs) var(--spacing-sm);
                background: var(--color-dark);
                border: 1px solid var(--color-gray-dark);
                border-radius: var(--border-radius-md);
                color: var(--color-light);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .header-action:hover {
                border-color: var(--color-primary);
                color: var(--color-primary);
            }
            
            .header-balance {
                background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
                padding: var(--spacing-xs) var(--spacing-md);
                border-radius: var(--border-radius-md);
                color: white;
                text-align: center;
                min-width: 100px;
            }
            
            .balance-amount {
                font-weight: 700;
                font-size: var(--font-size-md);
            }
            
            .balance-label {
                font-size: var(--font-size-xs);
                opacity: 0.9;
            }
            
            .bet-slip-btn {
                position: relative;
            }
            
            .bet-count-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: var(--color-danger);
                color: white;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                font-size: var(--font-size-xs);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .user-menu {
                position: relative;
            }
            
            .user-avatar {
                width: 40px;
                height: 40px;
                background: var(--color-primary);
                border-radius: 50%;
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .user-dropdown {
                position: relative;
            }
            
            .dropdown-menu {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--color-secondary);
                border: 1px solid var(--color-gray-dark);
                border-radius: var(--border-radius-md);
                padding: var(--spacing-md);
                min-width: 200px;
                display: none;
                z-index: 1000;
            }
            
            .user-dropdown:hover .dropdown-menu {
                display: block;
            }
            
            .dropdown-menu a {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm);
                color: var(--color-light);
                text-decoration: none;
                border-radius: var(--border-radius-sm);
                transition: background 0.2s ease;
            }
            
            .dropdown-menu a:hover {
                background: var(--color-dark);
            }
            
            .main-nav {
                padding: 0 var(--spacing-lg);
                background: var(--color-secondary);
            }
            
            .nav-container {
                display: flex;
                overflow-x: auto;
                padding: var(--spacing-sm) 0;
                gap: var(--spacing-md);
            }
            
            .nav-link {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-sm) var(--spacing-md);
                color: var(--color-light);
                text-decoration: none;
                white-space: nowrap;
                border-radius: var(--border-radius-md);
                transition: all 0.2s ease;
            }
            
            .nav-link:hover,
            .nav-link.active {
                background: var(--color-primary);
                color: white;
            }
            
            @media (max-width: 1024px) {
                .search-bar {
                    display: none;
                }
                
                .header-action span {
                    display: none;
                }
            }
        </style>
    `;
    
    function generateUserId() {
        return 'GUEST-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
    
    // Update header balance when main balance updates
    setInterval(() => {
        const mainBalance = document.getElementById('user-balance');
        const headerBalance = document.getElementById('header-balance');
        const headerBetCount = document.getElementById('header-bet-count');
        const mainBetCount = document.getElementById('bet-count');
        
        if (mainBalance && headerBalance) {
            headerBalance.textContent = mainBalance.textContent;
        }
        
        if (mainBetCount && headerBetCount) {
            headerBetCount.textContent = mainBetCount.textContent;
        }
    }, 1000);
}
