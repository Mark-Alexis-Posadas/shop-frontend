import { create } from 'zustand'

type UIState = {
  menuOpen: boolean
  toggleMenu: () => void
}

export const useUIStore = create<UIState>((set) => ({
  menuOpen: false,
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
}))
