// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    user: null
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    isAuthenticated: (state) => !!state.user
  },
  actions: {
    increment() {
      this.count++; // Direct state mutation (no separate mutations needed)
    },
    async fetchUser() {
      // Simulate an API call
      const user = await new Promise(resolve => {
        setTimeout(() => resolve({ name: 'Jane Doe' }), 1000);
      });
      this.user = user; // Direct state update
    }
  }
});