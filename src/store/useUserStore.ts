import { create } from 'zustand';
import { User } from '@/models/user';
import { toast } from 'sonner';

interface UserState {
    user: User | null;
    user_loading: boolean;
    fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    user_loading: true,
    fetchUser: async () => {
        try {
            set({ user_loading: true });
            const res = await fetch('/api/app/me');
            if (!res.ok) throw new Error('Failed to fetch user data');
            const json = await res.json();
            set({ user: json.data, user_loading: false });
        } catch (err) {
            console.error('Error fetching user data:', err);
            toast.error('Failed to fetch user data');
            set({ user_loading: false });
        }
    },
})); 