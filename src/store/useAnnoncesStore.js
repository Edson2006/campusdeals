import { create } from 'zustand';
import { fetchActiveAnnoncesPage } from '../services/firestoreService';

const PAGE_SIZE = 12;

const mergeUnique = (existing, incoming) => {
  const seen = new Set(existing.map((item) => item.id));
  const additions = incoming.filter((item) => !seen.has(item.id));
  return [...existing, ...additions];
};

const useAnnoncesStore = create((set, get) => ({
  items: [],
  cursor: null,
  hasMore: true,
  loading: false,
  error: null,
  hydrated: false,
  lastUpdatedAt: null,

  fetchInitial: async ({ force = false } = {}) => {
    const { loading, hydrated } = get();
    if (loading) return;
    if (hydrated && !force) return;

    set({ loading: true, error: null });
    try {
      const { items, cursor, hasMore } = await fetchActiveAnnoncesPage({ pageSize: PAGE_SIZE });
      set({
        items,
        cursor,
        hasMore,
        loading: false,
        error: null,
        hydrated: true,
        lastUpdatedAt: Date.now()
      });
    } catch (error) {
      set({ loading: false, error });
      throw error;
    }
  },

  fetchNext: async () => {
    const { loading, hasMore, cursor } = get();
    if (loading || !hasMore) return;

    set({ loading: true, error: null });
    try {
      const { items, cursor: newCursor, hasMore: nextHasMore } = await fetchActiveAnnoncesPage({
        pageSize: PAGE_SIZE,
        startAfterDoc: cursor
      });
      set((state) => ({
        items: mergeUnique(state.items, items),
        cursor: newCursor ?? state.cursor,
        hasMore: nextHasMore,
        loading: false,
        error: null,
        hydrated: true,
        lastUpdatedAt: Date.now()
      }));
    } catch (error) {
      set({ loading: false, error });
      throw error;
    }
  },

  refresh: async () => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });
    try {
      const { items, cursor, hasMore } = await fetchActiveAnnoncesPage({ pageSize: PAGE_SIZE });
      set({
        items,
        cursor,
        hasMore,
        loading: false,
        error: null,
        hydrated: true,
        lastUpdatedAt: Date.now()
      });
    } catch (error) {
      set({ loading: false, error });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useAnnoncesStore;
