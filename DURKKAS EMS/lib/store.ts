import { create } from "zustand";

export type PortalType = "online" | "offline" | "workshop";
export type RoleType = "student" | "tutor" | "admin";

interface AppState {
  user: {
    id: string | null;
    email: string | null;
    phone: string | null;
    name: string | null;
    role: RoleType | null;
    portal: PortalType | null;
  } | null;
  setUser: (user: AppState["user"]) => void;
  clearUser: () => void;
  setPortal: (portal: PortalType) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setPortal: (portal) =>
    set((state) => ({
      user: state.user ? { ...state.user, portal } : null,
    })),
}));

