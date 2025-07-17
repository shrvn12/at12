<template>
    <div
        ref="lyricContainer"
        class="lyricContainer"
        style=""
    >
    <div style="margin-top: 40vh;" v-if="!info.lyrics">
        <span v-if="queueStore.isLoading" class="loader"></span>
        <div v-else style="width: 100%;">
            <img style="width: 40%;" src="../assets/icebear.png" alt="">
            <p style="color: white; margin-top: -3%;">Lyrics not available</p>
        </div>
    </div>
    <v-list v-else default style="background-color: transparent; margin: 0; padding: 0;">
        <v-list-item v-for="(line, index) in info.lyrics" :key="index">
            <p onmouseover="this.style.textDecoration = 'underline'" onmouseout="this.style.textDecoration = 'none'" style="font-weight: bold; font-size: large;" @click="index != currentLyricIndex && jumpToTime(line.time)" :class="currentLyricIndex !== null && index <= currentLyricIndex? 'active' : 'inactive'">{{ line.text || '♪♪' }}</p>
        </v-list-item>
    </v-list>
    </div>
</template>

<script>

import { EventBus } from '@/eventBus';
import { useToast } from 'vue-toastification';
import { useQueueStore } from '../stores/queue';
import { useLyricsStore } from '../stores/lyrics';

export default {
  name: "lyricsComponent",

  setup() {
    const queueStore = useQueueStore();
    const lyricsStore = useLyricsStore();
    return { queueStore, lyricsStore };
  },

  data() {
    return {
      info: this.queueStore.queue[this.queueStore.isPlayingIndex] || {},
      toast: useToast(),
      parsedLyrics: [],
      currentTime: 0,
      currentLyricIndex: null,
      autoscroll: true,
      userScrolling: false,
      scrollTimeout: null,
    };
  },

  methods: {
    handleUserScroll() {
      if (!this.info || !this.info.lyrics  || !this.info.lyrics.length) return;
      this.autoscroll = false;
      this.userScrolling = true;

      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

      // Wait 2 seconds after last scroll to re-check
      this.scrollTimeout = setTimeout(() => {
        this.userScrolling = false;
        this.checkIfCurrentLineIsVisible();
      }, 2000);
    },

    checkIfCurrentLineIsVisible() {
      if (!this.info || !this.info.lyrics  || !this.info.lyrics.length) return;
      const lyricContainer = this.$refs.lyricContainer;
      if (!lyricContainer || this.currentLyricIndex === undefined) return;

      const currentEl = lyricContainer.querySelectorAll(".v-list-item")[this.currentLyricIndex];
      if (!currentEl) return;

      const containerTop = lyricContainer.scrollTop;
      const containerBottom = containerTop + lyricContainer.clientHeight;
      const elTop = currentEl.offsetTop;
      const elBottom = elTop + currentEl.offsetHeight;

      // If current line is visible in viewport, re-enable autoscroll
      if (elTop >= containerTop && elBottom <= containerBottom) {
        this.autoscroll = true;
      }
    },

    updateCurrentTime(time) {
      if (!this.info || !this.info.lyrics || !this.info.lyrics.length) return;
      // ── If time is exactly zero, do NOT highlight anything yet ──
      if (time === 0) {
        // Still update currentTime internally, but skip lyric‐index logic:
        this.currentTime = time;
        return;
      }

      // Once time > 0, run the normal logic:
      this.currentTime = time;
      this.checkIfCurrentLineIsVisible();

      const idx = this.info.lyrics.findIndex((line, i) => {
        return (
          line.time <= time &&
          (i === this.info.lyrics.length - 1 || this.info.lyrics[i + 1].time > time)
        );
      });

      if (idx !== -1 && idx !== this.currentLyricIndex) {
        this.currentLyricIndex = idx;
        if (this.autoscroll) {
          this.scrollToCurrentLine();
        }
      }
    },

    scrollToCurrentLine() {
      if (!this.info || !this.info.lyrics  || !this.info.lyrics.length) return;
      const lyricContainer = this.$refs.lyricContainer;
      if (!lyricContainer || this.currentLyricIndex === undefined) return;

      const currentEl = lyricContainer.querySelectorAll(".v-list-item")[this.currentLyricIndex];
      if (!currentEl) return;

      const containerHeight = lyricContainer.clientHeight;
      const scrollTop = currentEl.offsetTop - containerHeight / 2 + currentEl.offsetHeight;

      lyricContainer.scrollTo({
        top: Math.max(scrollTop, 0),
        behavior: "smooth",
      });
    },

    jumpToTime(time) {
      time && EventBus.emit('jumpToTime', time);
    }
  },
  activated(){
    if (this.info.id !== this.queueStore.queue[this.queueStore.isPlayingIndex]?.id) {
     this.info = this.queueStore.queue[this.queueStore.isPlayingIndex];
    }
  },
  mounted() {
    // Initialize with whatever was already in the queue:
    this.info = this.queueStore.queue[this.queueStore.isPlayingIndex];

    EventBus.on('info', (info) => {
        this.currentLyricIndex = null; // Reset current lyric index on new info
        this.info = info;
        if (info.lyrics) {
            // On new lyrics, scroll back to top:
            this.$refs.lyricContainer?.scrollTo({
            top: 0,
            behavior: "smooth",
            });
        } else {
            this.parsedLyrics = [];
        }
    });

    EventBus.on('updateCurrentTime', (val) => this.updateCurrentTime(val));

    const lyricContainer = this.$refs.lyricContainer;
    if (lyricContainer) {
      lyricContainer.addEventListener("scroll", this.handleUserScroll);
    }
  },

  beforeUnmount() {
    const lyricContainer = this.$refs.lyricContainer;
    if (lyricContainer) {
      lyricContainer.removeEventListener("scroll", this.handleUserScroll);
    }
  }
};
</script>

<style scoped>
.active {
  color: white;}

.inactive {
  color: rgba(128, 128, 128, 0.685);
  cursor: pointer;
}

.inactive:hover {
  color: white;
  text-decoration: underline;
}

.loader {
  width: 48px;
  height: 40px;
  margin-top: 30px;
  display: inline-block;
  position: relative;
  background: #FFF;
  border-radius: 15% 15% 35% 35%;
}
.loader::after {
  content: '';  
  box-sizing: border-box;
  position: absolute;
  left: 45px;
  top: 8px;
  border: 4px solid #FFF;
  width: 16px;
  height: 20px;
  border-radius: 0 4px 4px 0;
}
.loader::before {
  content: '';  
  position: absolute;
  width: 1px;
  height: 10px;
  color: #FFF;
  top: -15px;
  left: 11px;
  box-sizing: border-box;
  animation: animloader 1s ease infinite;
}

@keyframes animloader {
    0% {
  box-shadow: 2px 0px rgba(255, 255, 255, 0), 12px 0px rgba(255, 255, 255, 0.3), 20px 0px rgba(255, 255, 255, 0);
}
    50% {
  box-shadow: 2px -5px rgba(255, 255, 255, 0.5), 12px -3px rgba(255, 255, 255, 0.5), 20px -2px rgba(255, 255, 255, 0.6);
}
    100% {
  box-shadow: 2px -8px rgba(255, 255, 255, 0), 12px -5px rgba(255, 255, 255, 0), 20px -5px rgba(255, 255, 255, 0);
}
}

.lyricContainer{
  border: 0px solid white;
  position: absolute;
  right: 0;
  width: 20%;
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
  }
}
      
    
</style>