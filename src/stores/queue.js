import { defineStore } from 'pinia';

export const useQueueStore = defineStore('queue', {
  state: () => ({
    queue: [],
    isQueueVisible: false,
    isLyricsVisible: false,
    isPlayingIndex: 0,
    isPlaying: false,
    player: null,
    isPaused: false,
  }),
  actions: {
    addStats(index, stats) {
        if (!stats || index < 0 || index >= this.queue.length) {
            return;
        }
        this.queue[index].stats = stats;
    },
    emptyQueue() {
      this.queue = [];
    },
    play(index){
      if (index === undefined) {
        this.playing = true;
      }
      if (index > 0 && index < this.queue.length) {
        this.isPlayingIndex = index;
      }
    },
    pause(){
      this.isPlaying = false;
    },
    player(player){
      this.player = player;
    },
    async fetchInfo(id){
      return await fetch(`https://api-dqfspola6q-uc.a.run.app/music/getInfo?id=${id}`).then(async (res) => {
          res = await res.json();
          return res;
        }).catch((err) => {
            console.log(err);
            return {
              error: 'An error occurred while fetching video information.',
              details: err.message
            };
        })
    }
  }
});