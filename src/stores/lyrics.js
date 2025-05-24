import { defineStore } from 'pinia';

export const useLyricsStore = defineStore('lyrics', {
  state: () => ({
    isLyricsVisible: false
  })
});