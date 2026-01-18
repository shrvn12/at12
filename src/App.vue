<template>
<div style="border: 0px solid white; height: 100vh; display: flex; position: relative;">
  <BackgroundComponent></BackgroundComponent>
  <div :class="queueStore.isQueueVisible? 'queueCont': 'hqueueCont'">
    <transition name="slide">
      <QueueComponent v-if="queueStore.isQueueVisible && queueStore.queue.length"></QueueComponent>
    </transition>
  </div>
  <div class="centerCont">
    <div class="centerTopCont">
      <div style="border: 0px solid green; height: 65%; display: flex; align-items: center; justify-content: center; z-index: 1;">
        <h1 @click="this.$router.push({ path: '/' })" class="header">@12</h1>
      </div>
      <div>
        <div style="display: flex;">
            <p style="color: white; font-size: small; font-weight: bold;">{{ days[new Date() .getDay()] }}</p>
            <p style="font-weight: bold; font-size: small; margin: 0 0.5vw; color: #fc2c55;">|</p>
            <p style="color: white; font-size: small; font-weight: bold; margin-right: 0.2vw;">{{new Date() .getDate()}}</p>
            <p style="color: white; font-size: small; font-weight: bold;">{{months[new Date() .getMonth()]}}</p>
        </div>
        <div>
            <div>
              <router-link v-if="userStore.user.name" style="text-decoration: none; color: white; font-size: small;" to="/account">{{ greetUser() }}</router-link>
              <router-link v-else style="text-decoration: none; color: white; font-size: small;" to="/signup">Login/Signup</router-link>
            </div>
        </div>
      </div> 
      <div style="border: 0px solid green; height: 20%;">
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
          @update:modelValue="searchSong"
        ></v-text-field>
      </div>
    </div>
    <div :class="queue.length !== 0 ? 'withplayer' : 'withoutplayer'" style="width: 100%;"
     >
     <router-view v-slot="{ Component }">
        <keep-alive max="5">
          <component :is="Component" :key="$route.name" />
        </keep-alive>
      </router-view>      
    </div>
  </div>
  <div :class="queueStore.isLyricsVisible ? 'lrcCont' :'hlrcCont'">
     <transition name="slideRight">
      <lyricsComponent v-if="queueStore.isLyricsVisible  && queueStore.queue.length"></lyricsComponent>
    </transition>
  </div>
</div>
<div>
  <transition name="fade">
    <player-component v-show="queue.length || isPlaying"></player-component>
  </transition>
</div>
</template>

<script>
import { useQueueStore } from './stores/queue';
import { useUserStore } from './stores/user';
import { EventBus } from './eventBus';
import { useToast } from 'vue-toastification';
import { RouterView } from 'vue-router';
import PlayerComponent from './components/playerComponent.vue';
import QueueComponent from './components/queueComponent.vue';
import lyricsComponent from './components/lyricsComponent.vue';
import BackgroundComponent from './components/backgroundComponent.vue';
import centerTopBackground from './components/centerTopBackground.vue';
import { ref } from 'vue';
export default {
  name: 'App',
  components: {
    PlayerComponent,
    RouterView,
    QueueComponent,
    lyricsComponent,
    BackgroundComponent,
    centerTopBackground,
  },
  setup() {
    // Access the store in setup (reactive by default)
    const queueStore = useQueueStore();
    const userStore = useUserStore();
    return { queueStore, userStore }; // Expose to template
  },
  data: () => {
    return{
      toast: useToast(),
      searchQuery: null,
      isLoading: false,
      songQuery: null,
      queue: [],
      searchRes: [],
      isPlaying: false,
      bgHTML: ref(''),
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    }
  },
  methods: {
    searchSong: debounce(function(query){
      if (!query){
        return;
      }
      if(query.length){
        this.$router.push({path: '/search', query: { q: query }});
      }
    }, 700),
    greetUser(){
      const hour = new Date().getHours();
      if(hour < 12){
          return `Good morning ${this.userStore.user.name.split(" ")[0]}`;
      } else if(hour < 18){
          return `Good afternoon ${this.userStore.user.name.split(" ")[0]}`;
      } else {
          return `Good evening ${this.userStore.user.name.split(" ")[0]}`;
      }
    },
  },
  watch: {
    songQuery(val){
      if (!val){
        this.searchRes = [];
      }
    },
  },
  mounted() {
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
      if (window.innerWidth < 675) {
        this.queueStore.isQueueVisible = false;
        this.queueStore.isLyricsVisible = false;
      }
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

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
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
  z-index: 100;
}

.centerTopCont>div:nth-child(2){
    width: 100%;
    height: 5vh;
    border: 0px solid red;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.centerTopCont>div:nth-child(2)>div{
    /* border: 1px solid yellow; */
    display: inline-block;
    color: white;
    padding: 0.5vw  1.5vw;
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

.centerCont{
  border: 0px solid white;
  width: 50%;
  height: 100vh;
  z-index: 1;
}

.centerTopCont{
  border:0px solid green;
  height: 40vh;
  width: 100%;
  overflow: hidden;
  position: relative;
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

.withplayer {
  height: 48vh;
  mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%);
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%);
}

.withoutplayer {
  height: 60vh;
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
  transition: transform 0.3s ease;
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
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

.queueCont{
  border: 0px solid white;
  width: 25%;
  height: 100vh;
}

.hqueueCont{
  border: 0px solid white;
  width: 25%;
  height: 100vh;
}

.lrcCont{
  border: 0px solid white;
  width: 25%;
  height: 100vh;
}

.leftSticker{
  position: fixed;
  bottom: 0;
  left: 0;
  width: 25vw;
  height: auto;
  z-index: 1001;
  display: flex;
  justify-content: left;
}

.rightSticker{
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25vw;
  height: auto;
  z-index: 1001;
  display: flex;
  justify-content: right;
}

.hlrcCont{
  border: 0px solid white;
  width: 25%;
  height: 100vh;
}

.header {
	font-size: 6rem;
	font-weight:  100;
	letter-spacing: 2px;
  font-weight: 700;
	text-align: center;
	color: #f35626;
	background-image: -webkit-linear-gradient(92deg, #f35626, #feab3a);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	-webkit-animation: hue 10s infinite linear;
  cursor: pointer;
  user-select: none; 
  -webkit-user-select: none; 
  -moz-user-select: none; 
  -ms-user-select: none;
}

@keyframes hue {
  from {
    -webkit-filter: hue-rotate(0deg);
  }
  to {
    -webkit-filter: hue-rotate(-360deg);
  }
}


@media (max-width: 675px) {
  svg{
    width: 100%;
  }

  .head_s{
    margin: auto;
  }
  .centerCont{
    width: 100%;
  }
  .centerTopCont{
    height: 30vh;
  }
  .withplayer{
    height: 50vh;
  }
  .withoutplayer{
    height: 70vh;
  }
  .queueCont{
    position: absolute;
    width: 100%;
  }
  .lrcCont{
    position: absolute;
    width: 100%;
  }
  .hlrcCont{
    width: 0%;
  }
  .hqueueCont{
    width: 0%;
  }
}

</style>
