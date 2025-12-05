// components/header.js
export function loadHeader() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) return;
    
    headerContainer.innerHTML = `
        <header class="main-header">
            <div class="header-top">
                <div class="logo">
                    <h1>🎰 FeeCasino Bet</h1>
                    <span class="tagline">Mock Betting Platform</span>
                </div>
                
                <div class="user-menu">
                    <div class="user-info">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-details">
                            <span class="username">Guest Player</span>
                            <span class="user-id">ID: ${generateUserId()}</span>
                        </div>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="showNotification({title: 'Profile', message: 'Guest mode - no profile available', type: 'info'})">
                        <i class="fas fa-cog"></i> Settings
                    </button>
                </div>
            </div>
            
            <nav class="main-nav">
                <a href="../" class="nav-link active">
                    <i class="fas fa-home"></i> Home
                </a>
                <a href="#" class="nav-link" onclick="showComingSoon()">
                    <i class="fas fa-plane"></i> Aviator
                </a>
                <a href="#" class="nav-link" onclick="showComingSoon()">
                    <i class="fas fa-sliders-h"></i> Slots
                </a>
                <a href="#" class="nav-link" onclick="showComingSoon()">
                    <i class="fas fa-basketball-ball"></i> Sports
                </a>
                <a href="#" class="nav-link" onclick="showComingSoon()">
                    <i class="fas fa-dice"></i> Live Casino
                </a>
                <a href="#" class="nav-link" onclick="showComingSoon()">
                    <i class="fas fa-gift"></i> Promotions
                </a>
                <a href="#" class="nav-link" onclick="showComingSoon()">
                    <i class="fas fa-history"></i> History
                </a>
                <a href="#" class="nav-link" onclick="showComingSoon()">
                    <i class="fas fa-question-circle"></i> Help
                </a>
            </nav>
        </header>
    `;
    
    function generateUserId() {
        return 'GUEST-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }
}
