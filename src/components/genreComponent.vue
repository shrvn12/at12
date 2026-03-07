<template>
    <div
        ref="lyricContainer"
        class="lyricContainer"
        style=""
    >
    <div v-if="isLoading" style="height: 70vh; display: flex; align-items: center; justify-content: center;">
      <span class="loader"></span>
    </div>
    <div v-else style="border: 1px solid transparent; height: 70vh; display: flex; align-items: center; position: relative; justify-content: center;" @mouseenter="hovered = true" @mouseleave="hovered=false">
      <p v-if="!hideLyrics && this.info && this.info.lyrics && this.info.lyrics.length" style="color: white; text-align: center; width: 80%; margin: auto; font-size: xx-large; font-weight: bold;">
        {{ this.info.lyrics[currentLyricIndex]?.text || '♪♪' }}
      </p>
      <div v-else>
        <div v-if="queueStore.queue.length && info.artist.length" style="border: 0px solid white; width: 90%; margin: auto;">
          <div style="height: 20vh; aspect-ratio: 1/1; margin: auto; border-radius: 10px; position: relative; overflow: hidden;">
            <img loading="lazy" :src="info.artistDetails?.thumbnails[0]?.url" alt="" class="thumbnail" @error="e => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(info.artistDetails?.name || channelTitle || info.title)}`"
>
          </div>
          <p style="color: white; font-size: x-large; font-weight: bold; margin-top: 1vh;">{{ info.artistDetails?.name || info.artist[0].name || info.channelTitle }}</p>
          <p style="color: #ffffff97; font-size: small; cursor: pointer; text-decoration: underline;" @click="$router.push(`/artist/${info.artistDetails.artistId}`)">View artist</p>
        </div>
        <p v-else style="color: white; font-weight: bold; font-size: x-large; margin: 5%;">Play something to see synced lyrics</p>
      </div>
      
      <div v-if="hovered && info.lyrics" style="position: absolute; bottom: 0; right: 0; margin: auto; display: flex; align-items: center;">
        <p style="color: white; font-size: small;">Hide lyrics</p>
        <v-switch
          v-model="hideLyrics"
          hide-details
          inset
          density="compact"
          style="scale: 0.5; margin-left: -7%;"
        ></v-switch>
      </div>
    </div>

    <div style="border: 1px solid transparent; min-height: 20vh; display: flex; flex-wrap: wrap; padding: 2%;">
      <div v-for="(genere, index) in generes" :key="index" :class="rgenre == genere.name? 'genereCard highlight':'genereCard'" @click="$router.push(`/g/${genere.name}`)">
        <v-icon size="small" style="margin-right: 5%;">{{ genere.icon }}</v-icon>
        <p style="width: fit-content; color: white; margin: 0px; font-size: small; white-space: nowrap;">{{ genere.name }}</p>
      </div>
    </div>
    
    </div>
</template>

<script>

import { EventBus } from '@/eventBus';
import { useToast } from 'vue-toastification';
import { useQueueStore } from '../stores/queue';
import { useLyricsStore } from '../stores/lyrics';
// import { ref } from 'vue';

export default {
  name: "genreComponent",

  setup() {
    const queueStore = useQueueStore();
    const lyricsStore = useLyricsStore();
    return { queueStore, lyricsStore };
  },

  computed: {
    rgenre(){
      return this.$route.params.genre;
    }
  },

  data() {
    return {
        toast: useToast(),
        hovered: false,
        hideLyrics: false,
        info: this.queueStore.queue[this.queueStore.isPlayingIndex] || {},
        currentLyricIndex: null,
        isLoading: this.queueStore.isLoading,
        generes: [
            {
                name: "Romance",
                icon: "mdi-heart"
            },
            {
                name: "Relax",
                icon: "mdi-sofa-single"
            },
            {
                name: "Feel-good",
                icon: "mdi-emoticon-happy"
            },
            {
                name: "Energise",
                icon: "mdi-lightning-bolt"
            },
            {
              name: "Commute",
              icon: "mdi-bus"
            },
            {
              name: "Party",
              icon: "mdi-party-popper"
            },
            {
              name: "Work-out",
              icon: "mdi-dumbbell"
            },
            {
              name:"Sad",
              icon: "mdi-heart-broken"
            },
            {
              name: "Focus",
              icon: "mdi-lightbulb"
            },
            {
              name: "Sleep",
              icon: "mdi-sleep"
            }
        ],
    };
  },

  methods: {
    updateCurrentTime(time) {
      if (!this.info || !this.info.lyrics || !this.info.lyrics.length) return;
      // ── If time is exactly zero, do NOT highlight anything yet ──
      if (time === 0) {
        return;
      }

      const idx = this.info.lyrics.findIndex((line, i) => {
        return (
          line.time <= time &&
          (i === this.info.lyrics.length - 1 || this.info.lyrics[i + 1].time > time)
        );
      });

      if (idx !== -1 && idx !== this.currentLyricIndex) {
        this.currentLyricIndex = idx;
      }
    },
  },
  activated(){
    if (this.info.id !== this.queueStore.queue[this.queueStore.isPlayingIndex]?.id) {
     this.info = this.queueStore.queue[this.queueStore.isPlayingIndex];
      if(!this.info.lyrics){
        this.hideLyrics = true;
      }
    }
  },
  mounted() {
    EventBus.on('info', (info) => {
        this.currentLyricIndex = null; // Reset current lyric index on new info
        this.info = info;
        if(!this.info.lyrics){
          this.hideLyrics = true;
        }
    });
    EventBus.on('updateCurrentTime', (val) => this.updateCurrentTime(val));

    EventBus.on('loading_info_1', () => {
      this.isLoading = true;
      if(this.info.id != this.queueStore.queue[this.queueStore.isPlayingIndex]?.id){
          this.info.lyrics = null;
      }
    });

    EventBus.on('loading_info_0', () => {
      this.isLoading = false;
    });

  },

  beforeUnmount() {
    
  },

  watch:{
    
  }
};
</script>

<style scoped>

.lyricContainer{
  border: 0px solid #ffffff;
  position: absolute;
  /* right: 10; */
  width: 25%;
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

@media screen and (max-width: 675px) {
  .lyricContainer {
    width: 100%;
    height: 80vh;
    z-index: 1;
    background-color: #000;
  }
}

.genereCard{
  display: flex;
  padding: 2% 3%;
  /* border: 1px solid white; */
  align-items: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  color: white;
  transition: background 0.3s ease;
  width: fit-content;
  height: fit-content;
  margin: 2%;
}

.genereCard:hover {
  background: rgba(255, 255, 255, 0.1);
}

.highlight{
  border: 1px solid white;
}

@media screen and (max-width: 675px) {
  .queueContainer {
    width: 100%;
    height: 80vh;
    z-index: 2;
    background-color: #000;
  }
  
}
</style>