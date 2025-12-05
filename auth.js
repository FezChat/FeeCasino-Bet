import { supabase } from './supabase.js'

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Check if user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            await this.loadUserProfile(session.user.id);
        }
    }

    async register(phone, password, country = 'TZ') {
        try {
            const { data, error } = await supabase.auth.signUp({
                phone: phone,
                password: password,
                options: {
                    data: {
                        country: country,
                        avatar: `casino_avatar_${Math.floor(Math.random() * 10)}.png`
                    }
                }
            });

            if (error) throw error;
            
            // Create user profile
            await this.createUserProfile(data.user.id, phone, country);
            
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async login(phone, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                phone: phone,
                password: password
            });

            if (error) throw error;
            
            this.currentUser = data.user;
            await this.loadUserProfile(data.user.id);
            
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async logout() {
        await supabase.auth.signOut();
        this.currentUser = null;
    }

    async createUserProfile(userId, phone, country) {
        const { error } = await supabase
            .from('users')
            .insert([{
                id: userId,
                phone: phone,
                country: country,
                balance: 0,
                avatar: `casino_avatar_${Math.floor(Math.random() * 10)}.png`,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
    }

    async loadUserProfile(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error && data) {
            this.currentUser.profile = data;
            localStorage.setItem('userProfile', JSON.stringify(data));
        }
    }
}

export const authSystem = new AuthSystem();
