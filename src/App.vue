<template>
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
      hide-no-data="true"
      @update:search="search"
      @update:modelValue="searchSong"
      ></v-autocomplete>
  </form>
  
  <div v-if="Object.keys(this.currentSongData).length" class="details">
    <p style="text-align: center; max-width: 65%; text-overflow: ellipsis; margin-top: 3%; color: white; font-weight: bold;">{{currentSongData.title}}</p>
    <p style=" ">{{ currentSongData.artist }}</p>
    <p style=" ">Views: {{ formatNumber(+currentSongData.stats.viewCount) }}</p>
    <p style=" "><v-icon size="small">mdi-heart</v-icon> {{ formatNumber(+currentSongData.stats.likeCount) }}</p>
    <p v-if="Object.keys(this.nextSongData).length" style=" margin-top: 3%; color: white; font-size: 120%;">Up Next:</p>
    <p v-if="Object.keys(this.nextSongData).length" style=" font-size: 150%;">{{ this.nextSongData.title }}</p>
  </div>
  
  <player-component></player-component>
</template>

<script>
// import IFrame from './components/IFrame.vue';
import PlayerComponent from './components/playerComponent.vue';
import { EventBus } from './eventBus';

export default {
  name: 'App',
  components: {
    PlayerComponent,
    // IFrame
  },
  data: () => {
    return{
      iframe : null,
      searchQuery: null,
      searchSuggestions: [],
      currentSongData: {},
      nextSongData: {},
      isLoading: false,
      songQuery: null,
      mountIframe: false,
      queue: [],
      isPlaying: false
    }
  },
  methods: {
    handleKeydown(event) {
        const autocomplete = this.$refs.autocomplete;
        const key = event.key;
        if (autocomplete && !autocomplete.focused && key.length === 1 && key.match(/[a-z]/i)) {
            autocomplete.focus();
            autocomplete.$emit('input', key);
        }
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
                // console.log(res);
                // res = res.map((el) => `${el.name}`);
                if (res.length) {
                    this.searchSuggestions = res;
                }
                this.isLoading = false;
            })
            .catch((err) => {
                console.log(err);
                this.isLoading = false;
            });
    }, 200),
    searchSong: debounce(function (query) {
      const autocomplete = this.$refs.autocomplete;
      autocomplete.blur();
      this.isLoading = true;
      fetch(`https://api-dqfspola6q-uc.a.run.app/music/getQueue?query=${query}`).then(
        async(res) => {
          this.isLoading = false;
          res = await res.json();
          // console.log(res);
          EventBus.emit('play', res);
        }
      )
      .catch((err) => {
        console.log(err);
        this.isLoading = false;
      });
    }, 2000),
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
        console.log('upNext called', data);
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
  max-width: 50%;
  text-overflow: ellipsis;
  font-size: 120%;
  color: grey;
  margin: auto
}

.details>p:nth-child(1) {
  font-size: 200%;
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
    margin-top: 20%;
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

</style>
