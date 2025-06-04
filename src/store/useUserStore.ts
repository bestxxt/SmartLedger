import { create } from 'zustand';
import { User } from '@/models/user';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

interface UserState {
    user: User | null;
    user_loading: boolean;
    queryUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    user_loading: true,
    queryUser: async () => {
        try {
            set({ user_loading: true });
            const res = await fetch('/api/app/me');
            
            if (res.status === 401 || res.status === 403) {
                // 认证失败，登出并跳转到登录页
                await signOut({ callbackUrl: '/login' });
                return;
            }
            
            if (res.status !== 200) {
                throw new Error('Failed to fetch user data');
            }
            
            const json = await res.json();
            set({ user: json.data, user_loading: false });
        } catch (err) {
            console.error('Error fetching user data:', err);
            toast.error('Failed to fetch user data');
            set({ user_loading: false });
            // 发生错误时也登出并跳转到登录页
            await signOut({ callbackUrl: '/login' });
        }
    },
})); 