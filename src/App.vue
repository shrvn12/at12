<template>
<div style="border: 0px solid white; height: 100vh; display: flex;">
  <div style="border: 0px solid white; width: 25%; height: 100vh;">
    <transition name="slide">
      <QueueComponent v-if="queueStore.isQueueVisible"></QueueComponent>
    </transition>
  </div>
  <div style="border: 0px solid white; width: 50%; height: 100vh;">
    <div style="border: 0px solid yellow; height: 45vh; width: 100%;">
      <div style="border: 0px solid green; height: 75%; display: flex; align-items: center; justify-content: center;">
        <h1 id="heading" style="margin-top: 5%;">
          <span style="width: 100%;">
            <svg :class="isPlaying ? 'head' : 'head_s'" style="width: 100%; border: 0px solid; height: 20vh;">
              <text
                :class="isPlaying ? 'head' : 'head_s'"
                x="50%"
                y="70%"
                text-anchor="middle"
              >
                @12
              </text>
            </svg>
          </span>
        </h1>
      </div>
      <div style="border: 0px solid green; height: 25%;">
        <v-text-field
          name="searchComponent"
          class="input"
          ref="autocomplete"
          v-model="songQuery"
          :loading="isLoading"
          color="#fc2c55"
          variant="outlined"
          clearable
          placeholder="What do you want to play?"
          :menu-icon="''"
          theme="dark"
          bg-color="#000000"
          spellcheck="false"
          autocomplete="off"
          persistent-clear
          @update:search="search"
          @update:modelValue="searchSong"
        ></v-text-field>
      </div>
    </div>
    <div :class="queue.length !== 0 ? 'fadeBottom' : ''"
     :style="{ border: '0px solid yellow', height: queue.length !== 0 ? '43vh' : '55vh', width: '100%' }">
     <router-view v-slot="{ Component }">
            <keep-alive max="5">
              <component :is="Component" :key="$route.name" />
            </keep-alive>
          </router-view>      
    </div>
  </div>
  <div style="border: 0px solid white; width: 25%; height: 100vh;">
    <lyricsComponent></lyricsComponent>
  </div>
</div>
<div>
  <transition name="fade">
    <player-component v-show="queue.length || isPlaying"></player-component>
  </transition>
</div>
</template>

<script>
import { useCounterStore } from './stores/counter'; // Import the store
import { usesearchResultsStore } from './stores/searchResults';
import { useQueueStore } from './stores/queue';
import PlayerComponent from './components/playerComponent.vue';
import { EventBus } from './eventBus';
import { useToast } from 'vue-toastification';
import { RouterView } from 'vue-router';
import QueueComponent from './components/queueComponent.vue';
import lyricsComponent from './components/lyricsComponent.vue';

export default {
  name: 'App',
  components: {
    PlayerComponent,
    RouterView,
    QueueComponent,
    lyricsComponent
  },
  setup() {
    // Access the store in setup (reactive by default)
    const counterStore = useCounterStore();
    const searchResultsStore = usesearchResultsStore();
    const queueStore = useQueueStore();
    return { counterStore, searchResultsStore, queueStore }; // Expose to template
  },
  data: () => {
    return{
      toast: useToast(),
      iframe : null,
      searchQuery: null,
      searchSuggestions: [],
      currentSongData: {},
      nextSongData: {},
      isLoading: false,
      songQuery: null,
      mountIframe: false,
      queue: [],
      searchRes: [],
      isPlaying: false,
      isPlayingIndex: 0,
      isQueueVisible: false,
      isLyricsVisible: false,
      hoveredIndex: null
    }
  },
  methods: {
    scrollToCurrentSong() {
      const queueContainer = this.$refs.queueContainer;

      if (!queueContainer || this.isPlayingIndex === undefined) return;
      // Get the current song element
      const currentSongElement = queueContainer.querySelectorAll(".v-list-item")[this.isPlayingIndex];

      if (!currentSongElement) return;

      // Calculate the scroll position to center the current song
      const containerHeight = queueContainer.clientHeight;
      const songOffsetTop = currentSongElement.offsetTop; // Get the top position of the current song relative to the container
      const songHeight = currentSongElement.offsetHeight || 70; // Fallback to 70px if height is unavailable

      // Center the song in the viewport
      const scrollPosition = songOffsetTop - containerHeight / 2 + songHeight / 2;

      queueContainer.scrollTo({
        top: Math.max(scrollPosition, 0), // Prevent negative scroll values
        behavior: "smooth",
      });
    },
    playSong(index){
      if (typeof index !== "number" || index == this.isPlayingIndex) {
        return;
      }
      EventBus.emit('playIndex', index);
    },
    searchSong: debounce(function(query){
      if (!query){
        return;
      }
      if(query.length){
        this.$router.push({path: '/search', query: { q: query }});
      }
    }, 700),
    deleteFromQueue(index){
      if (index && index > this.isPlayingIndex) {
        EventBus.emit('deleteFromQueue', index);
      }
    },
    formatNumber(num) {
      if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'; // Billions
      } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'; // Millions
      } else if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
      } else {
        return num.toString(); // Less than 1000, return as is
      }
    }
  },
  watch: {
    songQuery(val){
      if (!val){
        this.searchRes = [];
      }
    },
  },
  mounted() {
    this.iframe = document?.getElementById('youtube-iframe');
      document.addEventListener('keydown', this.handleKeydown);
      EventBus.on('changeData', (data) => {
        this.currentSongData = data;
        this.nextSongData = {};
      })
      EventBus.on('upNext', (data) => {
        this.nextSongData = data;
      })
      EventBus.on('updateInfo', (info) => {
        this.currentSongData = info[0];
        this.nextSongData = info[1];
      })
      EventBus.on('clearSearch', () => {
        this.songQuery = null;
      })
      EventBus.on('searchQuery', (query) => {
        this.songQuery = query;
      })
      EventBus.on('loading_0', () => {
        this.isLoading = false;
      })
      EventBus.on('loading_1', () => {
        this.isLoading = true;
      })
      EventBus.on('queue', (val) => {
        this.queue = val;
      }),
      EventBus.on('isPlaying', (val) => {
        this.isPlaying = val;
      })
      EventBus.on('isPlayingIndex', (val) => {
        this.isPlayingIndex = val;
        this.scrollToCurrentSong()
      })
      // EventBus.on('toggleQueue', (val) => {
      //   this.isQueueVisible = val;
      //   this.queueStore.isQueueVisible = val;
      //   this.isQueueVisible? setTimeout(() => { this.scrollToCurrentSong() }, 100): null;
      // })
      EventBus.on('toggleLyrics', (val) => {
        this.isLyricsVisible = val;
      })
  }
}

function debounce(func, delay) {
  let timer;
  return function(...args) {
    const queryString = args[0]?.trim()
    this.searchQuery = queryString?.length? queryString : null;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
</script>

<style>
html{
  overflow: hidden;
  margin: 0px;
  padding: 0px;
  height: 100%;
}
body{
  overflow: hidden;
  margin: 0px;
  -webkit-font-smoothing: antialiased; /* For WebKit-based browsers */
  -moz-osx-font-smoothing: grayscale;  /* For macOS */
}
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  font-family: "Ubuntu", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #000;
  height: 100vh;
}
.input{
  margin: auto;
  color: white;
  width: 100%;
}
.details>p {
  text-align: center;
  text-overflow: ellipsis;
  font-size: 120%;
  color: grey;
}

.details>p:nth-child(1) {
  font-size: 150%;
}

.img-cont {
  height: 200px;
  margin: auto;
  width: 200px;
  overflow: hidden;
  position: relative;
  border-radius: 10px;
}

.thumbnail{
  position: absolute; /* Position the image absolutely */
  top: 50%; /* Align the image to the vertical center */
  left: 50%; /* Align the image to the horizontal center */
  transform: translate(-50%, -50%); /* Center the image properly */
  height: 135%; /* Set the height to fill the div */
  width: 100%; /* Set the width to fill the div */
  object-fit: cover;
}

@media (max-width: 600px) {
    #heading{
      margin-bottom: 2%;
      font-family: 'Courier New', monospace;
    }
    svg{
      width: 100%;
    }
   .head{
    font-size: 10px;
    font-weight: 100;
    stroke-width: 1;
    margin: auto;
   }
   .head_s{
    margin: auto;
   }
  .input{
    width: 90%;
  }
  .details{
    margin-top: 5%;
  }
  .details>p {
    text-align: center;
    max-width: 90%;
    text-overflow: ellipsis;
    font-size: 90%;
  }
  .details>p:nth-child(1) {
    font-size: 150%;
  }
}

.head {
  height: 20vh;
  stroke: #fc2c55;
  font-size: 175%;
  font-weight: 700;
  stroke-width: 2;
  animation: textAnimate 7s infinite alternate;
}

.head_s {
  height: 20vh;
  font-size: 175%;
  stroke: #fc2c55;
  font-weight: 700;
  stroke-width: 2;
  animation: textAnimate 7s infinite alternate;
  animation-play-state: paused;
}

@keyframes textAnimate {
  0% {
    stroke-dasharray: 0 50%;
    stroke-dashoffset:  20%;
    fill: #ffffff

  }
  
  100% {
    stroke-dasharray: 50% 0;
    stroke-dashoffset: -20%;
    fill: #000
  }
  
}

.fadeBottom{
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%);
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%);
}

.details {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 20vh;
  margin: auto;
  margin-top: 1%;
  width: 50%;
}

.imgFade-enter-active, .imgFade-leave-active{
  transition: opacity 0.25s ease,
}

.imgFade-enter-from{
  opacity: 0;
}

.imgFade-enter-to, .imgFade-leave-from{
  opacity: 1;
}

.imgFade-leave-to{
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to{
  transform: translateX(-100%);
}

.slideRight-enter-active, .slideRight-leave-active {
  transition: transform 0.5s ease;
}
.slideRight-enter-from {
  transform: translateX(100%);
}
.slideRight-leave-to{
  transform: translateX(100%);
}

/* Hover functionality for delete icon */
.v-list-item:hover .delete-icon {
  visibility: visible;
}

/* Apply hover behavior for each individual item */
.v-list-item:hover {
  cursor: pointer;
}

.v-list-item {
  position: relative;
}

/* Optional: Prevent visibility flashing effect */
.v-list-item:hover .v-icon {
  visibility: visible;
  opacity: 1;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.7s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

</style>
