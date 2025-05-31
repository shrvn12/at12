import { defineStore } from 'pinia';

export const useLyricsStore = defineStore('lyrics', {
  state: () => ({
    isLyricsVisible: false,
    lyrics: '',
    duration: null,
  }),
  actions:{
    setDuration(duration) {
      this.duration = duration;
    }
  }
});