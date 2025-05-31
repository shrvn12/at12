<template>
    <div
        ref="lyricContainer"
        style="border: 0px solid white; position: absolute; right: 0; width: 20%; height: 100vh; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;"
    >
    <div v-if="!info.lyrics">
        <p style="color: white;">Lyrics not available</p>
    </div>
    <v-list v-else default style="background-color: transparent; margin: 0; padding: 0;">
        <v-list-item v-for="(line, index) in parsedLyrics" :key="index">
            <p onmouseover="this.style.textDecoration = 'underline'" onmouseout="this.style.textDecoration = 'none'" style="font-weight: bold; font-size: large;" @click="index != currentLyricIndex && jumpToTime(line.time)" :class="currentLyricIndex !== null && index <= currentLyricIndex? 'active' : 'inactive'">{{ line.text || '♪♪' }}</p>
        </v-list-item>
    </v-list>
    </div>
</template>

<script>
function parseLyrics(lyricsText) {
  const lines = lyricsText.split(/(?=\[\d{2}:\d{2}\.\d{2}\])/g); // splits before each timestamp
  const result = [];

  for (let line of lines) {
    const regex = /\[(\d{2}):(\d{2})\.(\d{2})\]/g;
    let match;
    const times = [];

    while ((match = regex.exec(line)) !== null) {
      const [full, min, sec, ms] = match;
      const totalSeconds = parseInt(min) * 60 + parseInt(sec) + parseInt(ms) / 100;
      times.push(totalSeconds);
      full;
    }

    const text = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "").trim();
    times.forEach(time => {
      result.push({ time, text });
    });
  }

  return result.sort((a, b) => a.time - b.time);
}

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
      lyricsRaw: `...`, // your raw lyrics go here
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
      // ── If time is exactly zero, do NOT highlight anything yet ──
      if (time === 0) {
        // Still update currentTime internally, but skip lyric‐index logic:
        this.currentTime = time;
        return;
      }

      // Once time > 0, run the normal logic:
      this.currentTime = time;
      this.checkIfCurrentLineIsVisible();

      const idx = this.parsedLyrics.findIndex((line, i) => {
        return (
          line.time <= time &&
          (i === this.parsedLyrics.length - 1 || this.parsedLyrics[i + 1].time > time)
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

  mounted() {
    // Initialize with whatever was already in the queue:
    this.info = this.queueStore.queue[this.queueStore.isPlayingIndex];
    if (this.info?.lyrics) {
      this.parsedLyrics = parseLyrics(this.info.lyrics);
    }

    EventBus.on('info', (info) => {
      this.info = info;
      if (info.lyrics) {
        this.parsedLyrics = parseLyrics(info.lyrics);
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
</style>