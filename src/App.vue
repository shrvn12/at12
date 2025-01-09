<template>
<transition name="slide">
  <div
    v-if="isQueueVisible"
    ref="queueContainer"
    style="position: absolute; width: 20%; height: 100vh; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; z-index: 1;"
  >
    <v-container>
      <div
        style="position: relative; height: 100%; transition: transform 0.5s ease;"
      >
        <v-list default style="background-color: transparent; margin: 0; padding: 0;">
          <v-list-item
            v-for="(song, index) in queue"
            @mouseover="() => {hoveredIndex = index}"
            @mouseleave="() => {hoveredIndex = null}"
            :key="index"
            :style="{
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              'text-align': 'left',
              'border-bottom': index === isPlayingIndex ? '1px solid #fc2c55' : 'none',
              color: index === isPlayingIndex ? 'white' : 'grey',
              position: 'relative', /* Position delete icon absolutely inside each item */
            }"
            @click="playSong(index)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ song.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ song.artist }}</v-list-item-subtitle>
            </v-list-item-content>

              <v-icon
                v-if="isPlayingIndex < index"
                v-show="hoveredIndex === index"
                @click.stop="deleteFromQueue(index)"
                color="grey"
                style="width: 30px; height: 30px; position: absolute; right: 7px; top: 50%; transform: translateY(-50%); cursor: pointer; border: 1px solid grey; border-radius: 10px; background-color: #000;"
              >
              mdi-delete-outline
              </v-icon>
          </v-list-item>
        </v-list>
      </div>
    </v-container>
  </div>
</transition>



  <h1 id="heading">
    <span style="width: 100%;">
      <svg :class="isPlaying ? 'head' : 'head_s'" style="width: 90%;">
      <text
        :class="isPlaying ? 'head' : 'head_s'"
        style="fill: #ffffff; border: 1px solid white;"
        x="50%"
        y="70%"
        text-anchor="middle"
      >
        @12
      </text>
    </svg>
    </span>
  </h1>

  <form autocomplete="off">
      <v-autocomplete
      name="searchComponent"
      class="input"
      ref="autocomplete"
      v-model="songQuery"
      :loading="isLoading"
      color="#fc2c55"
      variant="outlined"
      :append-inner-icon="'mdi-earbuds'"
      :items="searchQuery? [searchQuery, ...searchSuggestions]: searchSuggestions"
      hide-selected
      :menu="false"
      clearable
      :auto-select-first="true"
      placeholder="What do you want to play?"
      :menu-icon="''"
      theme="dark"
      bg-color="#000000"
      spellcheck="false"
      autocomplete="off"
      :hide-no-data="true"
      @update:search="search"
      @update:modelValue="searchSong"
      ></v-autocomplete>
  </form>
  <transition name="imgFade" mode="out-in">
    <div :key="currentSongData.id" class="img-cont" style="">
      <img class="thumbnail" v-if="currentSongData && currentSongData.thumbnails" :src="currentSongData?.thumbnails?.high?.url || 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'">
    </div>
  </transition>
  
  <transition name="fade" mode="out-in">
    <div :key="currentSongData.id" v-if="typeof currentSongData === 'object' && Object.keys(currentSongData).length" class="details">
      <p style="text-align: center; width: 100%; color: white; font-weight: bold;">
        {{ currentSongData.title }}
      </p>
      <p v-if="currentSongData.artist">{{ currentSongData.artist }}</p>
      <p v-if="currentSongData.stats?.viewCount > 0">
        <v-icon size="small">mdi-heart</v-icon> 
        {{ formatNumber(+currentSongData.stats?.likeCount) }} &nbsp; 
        {{ formatNumber(+currentSongData.stats?.viewCount) }} views
      </p>
    </div>
  </transition>
  <p v-if="!isQueueVisible && typeof nextSongData === 'object' && Object.keys(nextSongData).length" style="margin-top: 1%; color: white; font-size: 120%;">Up Next:</p>
  <transition name="fade" mode="out-in">
    <div :key="currentSongData.id">
      <p v-if="!isQueueVisible && typeof nextSongData === 'object' &&  Object.keys(nextSongData).length" style="text-align: center; max-width: 50%; font-size: 120%; color: grey; margin: auto">{{ nextSongData.title }}</p>
    </div>
  </transition>
  
  
  <player-component></player-component>
</template>

<script>
// import IFrame from './components/IFrame.vue';
import PlayerComponent from './components/playerComponent.vue';
import { EventBus } from './eventBus';
import { useToast } from 'vue-toastification';

export default {
  name: 'App',
  components: {
    PlayerComponent,
    // IFrame
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
      isPlaying: false,
      isPlayingIndex: 0,
      isQueueVisible: true,
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
    handleKeydown(event) {
        if (event.ctrlKey || event.shiftKey || event.altKey) return;
        const autocomplete = this.$refs.autocomplete;
        const key = event.key;
        if (autocomplete && !autocomplete.focused && key.length === 1 && key.match(/[a-z]/i)) {
            autocomplete.focus();
            autocomplete.$emit('input', key);
        }
    },
    playSong(index){
      if (typeof index !== "number" || index == this.isPlayingIndex) {
        return;
      }
      EventBus.emit('playIndex', index);
    },
    search: debounce(function (query) {
        if (this.isLoading) {
            return;
        }
        if (!query) {
          return;
        }
        this.searchQuery = query;
        this.loading = true;
        fetch(`https://api-dqfspola6q-uc.a.run.app/music/search?query=${query || ""}`)
            .then(async (res) => {
                res = await res.json();
                if (res.length) {
                    this.searchSuggestions = res;
                }
                this.isLoading = false;
            })
            .catch((err) => {
                console.log(err);
                this.isLoading = false;
                this.toast.error('Something went wrong while searching')
            });
    }, 200),
    searchSong: debounce(function (query) {
      if (!query) return
      const autocomplete = this.$refs.autocomplete;
      autocomplete.blur();
      this.isLoading = true;
      fetch(`https://api-dqfspola6q-uc.a.run.app/music/getQueue?query=${query}`).then(
        async(res) => {
          this.isLoading = false;
          res = await res.json();
          EventBus.emit('play', res);
        }
      )
      .catch((err) => {
        console.log(err);
        this.isLoading = false;
        this.toast.error('Something went wrong while getting results')
      });
    }, 2000),
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
      EventBus.on('toggleQueue', (val) => {
        this.isQueueVisible = val;
        this.isQueueVisible? setTimeout(() => { this.scrollToCurrentSong() }, 100): null;
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
}
body{
  overflow: hidden;
  margin: 0px;
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
  width: 50%;
}
.details>p {
  text-align: center;
  text-overflow: ellipsis;
  font-size: 120%;
  color: grey;
}

.details>p:nth-child(1) {
  font-size: 200%;
}

.img-cont {
  height: 200px;
  margin: auto;
  width: 200px;
  overflow: hidden;
  position: relative;
  border-radius: 10px;
  margin-top: 2%;
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
  font-size: 150px;
  font-weight: 700;
  stroke-width: 3;
  animation: textAnimate 7s infinite alternate;
}

.head_s {
  height: 20vh;
  font-size: 150px;
  stroke: #fc2c55;
  font-weight: 700;
  stroke-width: 3;
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
    stroke-dashoffstet: -20%;
    fill: #000
  }
  
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from{
  opacity: 0;
  transform: translateY(5px); /* Enter from below */
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0); /* End at the normal position */
}

.fade-leave-to{
  opacity: 0;
  transform: translateY(-5px); 
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
  transition: transform 0.5s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to{
  transform: translateX(-100%);
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

</style>
