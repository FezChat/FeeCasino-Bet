// api/balance.js
const SUPABASE_URL = 'https://xhspnqtmgqrvrqyfbmjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc3BucXRtZ3FydnJxeWZibWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Mjc5NzUsImV4cCI6MjA4MDUwMzk3NX0.EWlifrDDPzfvOzebCSqDw3yYHaHesjvm1DlkaTewKhM';

export async function getBalance(userId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${userId}&select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch balance');
        
        const balances = await response.json();
        return balances[0] || { balance: 10000.00, currency_code: 'TZS' };
    } catch (error) {
        console.error('Failed to get balance:', error);
        return { balance: 10000.00, currency_code: 'TZS' };
    }
}

export async function updateBalance(userId, amount, currencyCode = 'TZS') {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
                balance: amount,
                currency_code: currencyCode,
                updated_at: new Date().toISOString()
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Failed to update balance:', error);
        return false;
    }
}

export async function deposit(userId, amount, currencyCode) {
    try {
        // Record transaction
        const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
                user_id: userId,
                type: 'deposit',
                amount: amount,
                currency_code: currencyCode,
                status: 'completed',
                description: `Deposit of ${amount} ${currencyCode} (fake money)`
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Failed to record deposit:', error);
        return false;
    }
}

export async function withdraw(userId, amount, currencyCode) {
    try {
        // Record transaction
        const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
                user_id: userId,
                type: 'withdrawal',
                amount: amount,
                currency_code: currencyCode,
                status: 'completed',
                description: `Withdrawal of ${amount} ${currencyCode} (fake money)`
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Failed to record withdrawal:', error);
        return false;
    }
}
