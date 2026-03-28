import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    name: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    agentId?: number;
    doctorId?: number;
    profile_image?: string;
    phone?: string;
    is_razorpay_enabled?: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
            updateUser: (user) => set({ user }),
        }),
        {
            name: 'pathlab_admin_auth',
        }
    )
);
