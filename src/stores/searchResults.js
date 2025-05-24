import { defineStore } from 'pinia';

export const usesearchResultsStore = defineStore('searchResults', {
  state: () => ({
    results: []
  })
});