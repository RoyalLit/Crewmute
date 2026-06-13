import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  city: string;
  avatarUrl?: string;
  isVerified: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Set to false initially, we'll force users to log in
  isAuthenticated: false,
  user: null,

  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
  updateProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}));
