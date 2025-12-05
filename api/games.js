// api/games.js
const SUPABASE_URL = 'https://xhspnqtmgqrvrqyfbmjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc3BucXRtZ3FydnJxeWZibWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Mjc5NzUsImV4cCI6MjA4MDUwMzk3NX0.EWlifrDDPzfvOzebCSqDw3yYHaHesjvm1DlkaTewKhM';

export class GamesAPI {
    constructor() {
        this.gamesCache = null;
        this.lastFetch = null;
        this.cacheDuration = 30000; // 30 seconds cache
    }

    async getAllGames() {
        // Return cached games if still fresh
        if (this.gamesCache && this.lastFetch && 
            (Date.now() - this.lastFetch) < this.cacheDuration) {
            return this.gamesCache;
        }

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/games?select=*&order=name.asc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }

            const games = await response.json();
            
            // If no games in database, return default games
            if (!games || games.length === 0) {
                return this.getDefaultGames();
            }

            this.gamesCache = games;
            this.lastFetch = Date.now();
            
            return games;
        } catch (error) {
            console.error('Error fetching games:', error);
            return this.getDefaultGames();
        }
    }

    getDefaultGames() {
        return [
            {
                id: 'aviator-001',
                name: 'Aviator',
                type: 'aviator',
                status: 'active',
                min_bet: 10.00,
                max_bet: 100000.00,
                house_edge: 1.00,
                config: {
                    min_multiplier: 1.01,
                    max_multiplier: 1000,
                    auto_round_duration: 15,
                    description: 'Predict when the plane will crash. Cash out before it flies away!'
                },
                popularity: 95,
                player_count: 542
            },
            {
                id: 'slots-001',
                name: 'Slot Machine',
                type: 'slots',
                status: 'active',
                min_bet: 5.00,
                max_bet: 5000.00,
                house_edge: 5.00,
                config: {
                    reels: 5,
                    rows: 3,
                    paylines: 20,
                    description: 'Classic slot machines with bonus rounds and free spins'
                },
                popularity: 85,
                player_count: 321
            },
            {
                id: 'sports-001',
                name: 'Sports Betting',
                type: 'sports',
                status: 'active',
                min_bet: 20.00,
                max_bet: 50000.00,
                house_edge: 7.00,
                config: {
                    categories: ['football', 'basketball', 'tennis', 'cricket'],
                    live_betting: true,
                    description: 'Bet on virtual sports events with live updates'
                },
                popularity: 75,
                player_count: 287
            },
            {
                id: 'roulette-001',
                name: 'Roulette',
                type: 'roulette',
                status: 'active',
                min_bet: 50.00,
                max_bet: 50000.00,
                house_edge: 2.70,
                config: {
                    type: 'european',
                    has_zero: true,
                    has_double_zero: false,
                    description: 'European roulette with single zero'
                },
                popularity: 80,
                player_count: 154
            },
            {
                id: 'blackjack-001',
                name: 'Blackjack',
                type: 'blackjack',
                status: 'active',
                min_bet: 100.00,
                max_bet: 100000.00,
                house_edge: 0.50,
                config: {
                    decks: 6,
                    can_surrender: true,
                    can_double: true,
                    description: 'Classic blackjack with multiple betting options'
                },
                popularity: 70,
                player_count: 98
            },
            {
                id: 'baccarat-001',
                name: 'Baccarat',
                type: 'baccarat',
                status: 'active',
                min_bet: 200.00,
                max_bet: 200000.00,
                house_edge: 1.06,
                config: {
                    commission: 0.05,
                    description: 'Popular card game with banker, player, and tie bets'
                },
                popularity: 65,
                player_count: 76
            }
        ];
    }

    async getGameById(gameId) {
        try {
            const games = await this.getAllGames();
            return games.find(game => game.id === gameId) || null;
        } catch (error) {
            console.error('Error fetching game by ID:', error);
            return null;
        }
    }

    async getGamesByType(gameType) {
        try {
            const games = await this.getAllGames();
            return games.filter(game => game.type === gameType);
        } catch (error) {
            console.error('Error fetching games by type:', error);
            return [];
        }
    }

    async getPopularGames(limit = 6) {
        try {
            const games = await this.getAllGames();
            return games
                .filter(game => game.status === 'active')
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching popular games:', error);
            return this.getDefaultGames().slice(0, limit);
        }
    }

    async getActivePlayerCounts() {
        try {
            const games = await this.getAllGames();
            
            // Update player counts with some randomness for realism
            return games.map(game => ({
                ...game,
                player_count: Math.max(1, 
                    Math.floor(game.player_count * (0.8 + Math.random() * 0.4))
                )
            }));
        } catch (error) {
            console.error('Error fetching player counts:', error);
            return this.getDefaultGames();
        }
    }

    async getAviatorRounds(limit = 20) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/aviator_rounds?select=*&order=start_time.desc&limit=${limit}`,
                {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                }
            );

            if (!response.ok) {
                // Return mock data if database doesn't have the table
                return this.getMockAviatorRounds(limit);
            }

            const rounds = await response.json();
            
            // If no rounds in database, return mock data
            if (!rounds || rounds.length === 0) {
                return this.getMockAviatorRounds(limit);
            }

            return rounds;
        } catch (error) {
            console.error('Error fetching aviator rounds:', error);
            return this.getMockAviatorRounds(limit);
        }
    }

    getMockAviatorRounds(limit = 20) {
        const rounds = [];
        const now = new Date();
        
        for (let i = 0; i < limit; i++) {
            const roundTime = new Date(now.getTime() - (i * 2 * 60000)); // 2 minutes apart
            
            // Generate realistic crash multipliers
            // Most crashes happen at low multipliers, occasionally big ones
            let crashPoint;
            if (Math.random() < 0.7) {
                // 70% chance: crash between 1.1x and 3x
                crashPoint = 1.1 + Math.random() * 1.9;
            } else if (Math.random() < 0.9) {
                // 27% chance: crash between 3x and 10x
                crashPoint = 3 + Math.random() * 7;
            } else {
                // 3% chance: big win (10x-100x)
                crashPoint = 10 + Math.random() * 90;
            }
            
            crashPoint = Math.round(crashPoint * 100) / 100; // Round to 2 decimal places
            
            rounds.push({
                id: `round-${Date.now()}-${i}`,
                round_number: 1247 - i,
                multiplier: crashPoint,
                crash_point: crashPoint,
                start_time: roundTime.toISOString(),
                end_time: new Date(roundTime.getTime() + (Math.random() * 30000 + 10000)).toISOString(),
                status: Math.random() > 0.5 ? 'crashed' : 'completed',
                seed: Math.random().toString(36).substring(2),
                hash: Math.random().toString(36).substring(2, 15)
            });
        }
        
        return rounds;
    }

    async createAviatorRound(gameId) {
        try {
            const newRound = {
                game_id: gameId,
                crash_point: this.generateCrashPoint(),
                status: 'running',
                seed: Math.random().toString(36).substring(2),
                hash: Math.random().toString(36).substring(2, 15)
            };

            const response = await fetch(`${SUPABASE_URL}/rest/v1/aviator_rounds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(newRound)
            });

            if (!response.ok) {
                throw new Error('Failed to create aviator round');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating aviator round:', error);
            
            // Return mock round if database fails
            return {
                id: `mock-round-${Date.now()}`,
                game_id: gameId,
                crash_point: this.generateCrashPoint(),
                status: 'running',
                seed: Math.random().toString(36).substring(2),
                hash: Math.random().toString(36).substring(2, 15),
                start_time: new Date().toISOString()
            };
        }
    }

    generateCrashPoint() {
        // Generate crash point using exponential distribution
        // This mimics real crash game probabilities
        const minCrash = 1.01;
        const maxCrash = 1000;
        
        // Use exponential decay probability
        let crashPoint = minCrash;
        const lambda = 0.1; // Controls how fast probability decays
        
        while (crashPoint < maxCrash && Math.random() > lambda) {
            crashPoint *= 1.1;
        }
        
        crashPoint = Math.min(crashPoint, maxCrash);
        return Math.round(crashPoint * 100) / 100;
    }

    async placeBet(userId, gameId, amount, currencyCode, betDetails = {}) {
        try {
            const bet = {
                user_id: userId,
                game_id: gameId,
                amount: amount,
                currency_code: currencyCode,
                status: 'pending',
                ...betDetails,
                placed_at: new Date().toISOString()
            };

            const response = await fetch(`${SUPABASE_URL}/rest/v1/bets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(bet)
            });

            if (!response.ok) {
                throw new Error('Failed to place bet');
            }

            const result = await response.json();
            
            // Also create a transaction record
            await this.recordTransaction(userId, 'bet', amount, currencyCode, gameId);
            
            return result;
        } catch (error) {
            console.error('Error placing bet:', error);
            
            // Return mock bet if database fails
            return {
                id: `mock-bet-${Date.now()}`,
                user_id: userId,
                game_id: gameId,
                amount: amount,
                currency_code: currencyCode,
                status: 'pending',
                ...betDetails,
                placed_at: new Date().toISOString()
            };
        }
    }

    async recordTransaction(userId, type, amount, currencyCode, gameId = null, description = '') {
        try {
            const transaction = {
                user_id: userId,
                type: type,
                amount: amount,
                currency_code: currencyCode,
                status: 'completed',
                game_id: gameId,
                description: description || `${type} of ${amount} ${currencyCode}`
            };

            const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(transaction)
            });

            return response.ok;
        } catch (error) {
            console.error('Error recording transaction:', error);
            return false;
        }
    }

    async getUserBets(userId, limit = 50) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/bets?user_id=eq.${userId}&select=*&order=placed_at.desc&limit=${limit}`,
                {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                }
            );

            if (!response.ok) {
                return this.getMockUserBets(userId, limit);
            }

            const bets = await response.json();
            
            if (!bets || bets.length === 0) {
                return this.getMockUserBets(userId, limit);
            }

            return bets;
        } catch (error) {
            console.error('Error fetching user bets:', error);
            return this.getMockUserBets(userId, limit);
        }
    }

    getMockUserBets(userId, limit = 50) {
        const bets = [];
        const gameTypes = ['aviator', 'slots', 'sports', 'roulette', 'blackjack'];
        const statuses = ['won', 'lost', 'pending', 'cancelled'];
        const now = new Date();
        
        for (let i = 0; i < Math.min(limit, 10); i++) {
            const betTime = new Date(now.getTime() - (i * 3600000)); // 1 hour apart
            const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const amount = Math.floor(Math.random() * 10000) + 100;
            
            let winAmount = 0;
            if (status === 'won') {
                winAmount = Math.floor(amount * (1 + Math.random() * 9)); // 1x to 10x
            }
            
            bets.push({
                id: `bet-${userId}-${i}`,
                user_id: userId,
                game_id: `${gameType}-001`,
                amount: amount,
                currency_code: 'TZS',
                status: status,
                win_amount: winAmount,
                placed_at: betTime.toISOString(),
                game_type: gameType
            });
        }
        
        return bets;
    }

    async getGameStatistics(gameId) {
        try {
            // In a real app, this would query aggregated statistics
            // For mock purposes, return realistic fake statistics
            return {
                total_bets: Math.floor(Math.random() * 10000) + 5000,
                total_wagered: Math.floor(Math.random() * 10000000) + 1000000,
                total_won: Math.floor(Math.random() * 8000000) + 800000,
                biggest_win: Math.floor(Math.random() * 500000) + 100000,
                average_multiplier: (1 + Math.random() * 4).toFixed(2),
                rtp: (95 + Math.random() * 5).toFixed(2) + '%'
            };
        } catch (error) {
            console.error('Error fetching game statistics:', error);
            return {
                total_bets: 0,
                total_wagered: 0,
                total_won: 0,
                biggest_win: 0,
                average_multiplier: '0.00',
                rtp: '0%'
            };
        }
    }

    async updateBetStatus(betId, status, winAmount = null) {
        try {
            const updateData = {
                status: status,
                updated_at: new Date().toISOString()
            };

            if (winAmount !== null) {
                updateData.win_amount = winAmount;
                updateData.cashed_out_at = new Date().toISOString();
            }

            const response = await fetch(`${SUPABASE_URL}/rest/v1/bets?id=eq.${betId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(updateData)
            });

            return response.ok;
        } catch (error) {
            console.error('Error updating bet status:', error);
            return false;
        }
    }
}

// Create and export singleton instance
export const gamesAPI = new GamesAPI();

// Utility function to format currency
export function formatGameCurrency(amount, currencyCode = 'TZS') {
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: currencyCode === 'TZS' ? 0 : 2,
        maximumFractionDigits: currencyCode === 'TZS' ? 0 : 2
    });
    
    const symbols = {
        'TZS': 'TSh',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'KES': 'KSh',
        'UGX': 'USh',
        'NGN': '₦',
        'ZAR': 'R',
        'INR': '₹',
        'CNY': '¥'
    };
    
    const symbol = symbols[currencyCode] || currencyCode;
    return `${symbol} ${formatter.format(amount)}`;
}

// Utility function to get game icon
export function getGameIcon(gameType) {
    const icons = {
        'aviator': 'fa-plane',
        'slots': 'fa-sliders-h',
        'sports': 'fa-basketball-ball',
        'roulette': 'fa-dice',
        'blackjack': 'fa-cards',
        'baccarat': 'fa-diamond',
        'poker': 'fa-spade',
        'crash': 'fa-rocket',
        'dice': 'fa-dice-six',
        'wheel': 'fa-compass'
    };
    
    return icons[gameType] || 'fa-gamepad';
}

// Make functions available globally for use in HTML onclick handlers
window.gamesAPI = gamesAPI;
window.formatGameCurrency = formatGameCurrency;
window.getGameIcon = getGameIcon;
