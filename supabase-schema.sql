-- supabase-schema.sql
-- WARNING: THIS IS FOR DEVELOPMENT/MOCK ONLY. DO NOT USE FOR REAL MONEY.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (anonymous users for demo)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE,
    username TEXT DEFAULT 'Guest',
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_info JSONB,
    is_active BOOLEAN DEFAULT true
);

-- User balances table
CREATE TABLE IF NOT EXISTS user_balances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    currency_code VARCHAR(3) DEFAULT 'TZS',
    balance DECIMAL(15, 2) DEFAULT 10000.00, -- Starting fake balance
    locked_balance DECIMAL(15, 2) DEFAULT 0.00,
    total_deposited DECIMAL(15, 2) DEFAULT 0.00,
    total_withdrawn DECIMAL(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, currency_code)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('deposit', 'withdrawal', 'bet', 'win', 'bonus')),
    amount DECIMAL(15, 2),
    currency_code VARCHAR(3) DEFAULT 'TZS',
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    game_type VARCHAR(50),
    game_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50) CHECK (type IN ('aviator', 'slots', 'roulette', 'blackjack', 'sports')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'disabled')),
    min_bet DECIMAL(10, 2) DEFAULT 10.00,
    max_bet DECIMAL(10, 2) DEFAULT 10000.00,
    house_edge DECIMAL(5, 2) DEFAULT 1.00,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aviator rounds table
CREATE TABLE IF NOT EXISTS aviator_rounds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES games(id),
    round_number BIGSERIAL,
    multiplier DECIMAL(10, 2),
    crash_point DECIMAL(10, 2),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'crashed', 'completed')),
    seed TEXT,
    hash TEXT
);

-- Bets table
CREATE TABLE IF NOT EXISTS bets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id),
    round_id UUID REFERENCES aviator_rounds(id),
    amount DECIMAL(15, 2),
    currency_code VARCHAR(3) DEFAULT 'TZS',
    target_multiplier DECIMAL(10, 2),
    auto_cashout BOOLEAN DEFAULT false,
    cashout_multiplier DECIMAL(10, 2),
    cashout_amount DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cashed_out', 'lost', 'cancelled')),
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cashed_out_at TIMESTAMP WITH TIME ZONE,
    profit_loss DECIMAL(15, 2) DEFAULT 0.00
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('info', 'success', 'warning', 'error', 'win', 'bonus')),
    title TEXT,
    message TEXT,
    read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Currency settings table
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(50),
    symbol VARCHAR(10),
    symbol_position VARCHAR(10) DEFAULT 'before',
    decimal_places INTEGER DEFAULT 2,
    thousand_separator VARCHAR(1) DEFAULT ',',
    decimal_separator VARCHAR(1) DEFAULT '.',
    exchange_rate_to_usd DECIMAL(10, 4) DEFAULT 1.0000,
    is_active BOOLEAN DEFAULT true
);

-- Insert default currencies
INSERT INTO currencies (code, name, symbol, symbol_position, decimal_places, exchange_rate_to_usd) VALUES
('TZS', 'Tanzanian Shilling', 'TSh', 'before', 0, 0.00043),
('USD', 'US Dollar', '$', 'before', 2, 1.0000),
('EUR', 'Euro', '€', 'before', 2, 1.0800),
('GBP', 'British Pound', '£', 'before', 2, 1.2600),
('KES', 'Kenyan Shilling', 'KSh', 'before', 0, 0.0078),
('UGX', 'Ugandan Shilling', 'USh', 'before', 0, 0.00027),
('NGN', 'Nigerian Naira', '₦', 'before', 0, 0.0011),
('ZAR', 'South African Rand', 'R', 'before', 2, 0.055),
('INR', 'Indian Rupee', '₹', 'before', 0, 0.012),
('CNY', 'Chinese Yuan', '¥', 'before', 2, 0.14);

-- Insert default games
INSERT INTO games (name, type, min_bet, max_bet, house_edge, config) VALUES
('Aviator', 'aviator', 10.00, 100000.00, 1.00, '{"min_multiplier": 1.01, "max_multiplier": 1000, "auto_round_duration": 15}'),
('Slot Machine', 'slots', 5.00, 5000.00, 5.00, '{"reels": 5, "rows": 3}'),
('Roulette', 'roulette', 20.00, 20000.00, 2.70, '{"type": "european"}'),
('Blackjack', 'blackjack', 50.00, 50000.00, 0.50, '{"decks": 6}');

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_round_id ON bets(round_id);
CREATE INDEX idx_aviator_rounds_status ON aviator_rounds(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE aviator_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (development only)
CREATE POLICY "Allow anonymous read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow balance access for session users" ON user_balances FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = user_balances.user_id)
);

CREATE POLICY "Allow transaction access for session users" ON transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = transactions.user_id)
);

-- Create functions
CREATE OR REPLACE FUNCTION update_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type IN ('deposit', 'win', 'bonus') AND NEW.status = 'completed' THEN
        UPDATE user_balances 
        SET balance = balance + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
        AND currency_code = NEW.currency_code;
        
        IF NEW.type = 'deposit' THEN
            UPDATE user_balances 
            SET total_deposited = total_deposited + NEW.amount
            WHERE user_id = NEW.user_id 
            AND currency_code = NEW.currency_code;
        END IF;
        
    ELSIF NEW.type IN ('withdrawal', 'bet') AND NEW.status = 'completed' THEN
        UPDATE user_balances 
        SET balance = balance - NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
        AND currency_code = NEW.currency_code;
        
        IF NEW.type = 'withdrawal' THEN
            UPDATE user_balances 
            SET total_withdrawn = total_withdrawn + NEW.amount
            WHERE user_id = NEW.user_id 
            AND currency_code = NEW.currency_code;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balance
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_balance_on_transaction();

-- Function to place bet
CREATE OR REPLACE FUNCTION place_bet(
    p_user_id UUID,
    p_game_id UUID,
    p_amount DECIMAL,
    p_currency_code VARCHAR(3),
    p_target_multiplier DECIMAL DEFAULT NULL,
    p_auto_cashout BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    v_balance DECIMAL;
    v_bet_id UUID;
    v_game RECORD;
BEGIN
    -- Check user balance
    SELECT balance INTO v_balance
    FROM user_balances
    WHERE user_id = p_user_id AND currency_code = p_currency_code;
    
    IF v_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
    END IF;
    
    -- Get game details
    SELECT * INTO v_game FROM games WHERE id = p_game_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Game not found');
    END IF;
    
    -- Create bet record
    INSERT INTO bets (user_id, game_id, amount, currency_code, target_multiplier, auto_cashout, status)
    VALUES (p_user_id, p_game_id, p_amount, p_currency_code, p_target_multiplier, p_auto_cashout, 'active')
    RETURNING id INTO v_bet_id;
    
    -- Create transaction
    INSERT INTO transactions (user_id, type, amount, currency_code, game_type, game_id, description)
    VALUES (p_user_id, 'bet', p_amount, p_currency_code, v_game.type, p_game_id, 
            'Bet placed on ' || v_game.name || ' with amount ' || p_amount || ' ' || p_currency_code);
    
    RETURN jsonb_build_object('success', true, 'bet_id', v_bet_id, 'balance', v_balance - p_amount);
END;
$$ LANGUAGE plpgsql;
