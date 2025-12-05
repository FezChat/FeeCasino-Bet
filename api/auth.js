// api/auth.js
const SUPABASE_URL = 'https://xhspnqtmgqrvrqyfbmjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc3BucXRtZ3FydnJxeWZibWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Mjc5NzUsImV4cCI6MjA4MDUwMzk3NX0.EWlifrDDPzfvOzebCSqDw3yYHaHesjvm1DlkaTewKhM';

export async function initializeUser() {
    try {
        const sessionId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
                session_id: sessionId,
                username: 'Guest_' + Math.random().toString(36).substr(2, 6),
                device_info: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language
                }
            })
        });
        
        if (!response.ok) throw new Error('Failed to create user');
        
        const user = await response.json();
        
        // Create initial balance
        await fetch(`${SUPABASE_URL}/rest/v1/user_balances`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
                user_id: user.id,
                balance: 10000.00
            })
        });
        
        // Store user ID in localStorage for persistence
        localStorage.setItem('feecasino_user_id', user.id);
        localStorage.setItem('feecasino_session_id', sessionId);
        
        return user;
    } catch (error) {
        console.error('Failed to initialize user:', error);
        return null;
    }
}

export async function getUserSession() {
    try {
        const userId = localStorage.getItem('feecasino_user_id');
        const sessionId = localStorage.getItem('feecasino_session_id');
        
        if (!userId || !sessionId) return null;
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user');
        
        const users = await response.json();
        return users[0] || null;
    } catch (error) {
        console.error('Failed to get user session:', error);
        return null;
    }
}

export async function updateUserCurrency(userId, currencyCode) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/user_balances?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
                currency_code: currencyCode,
                updated_at: new Date().toISOString()
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Failed to update currency:', error);
        return false;
    }
}
