<template>
    <div class="cont">
        <div>
           <div v-for="(genre, index) in genres" :key="index" :class="genre == selectedGenre? 'selectedGenre' : '' " @click="selectedGenre == genre? selectedGenre = '' : selectedGenre = genre">
               <p>{{ genre }}</p>
           </div>
        </div>
        <Transition name="fadeFaster" mode="out">
            <div v-if="isLoading" style="display: flex; justify-content: center; align-items: center; height: 45vh;">
                <img src="../assets/loading.gif" alt="">
            </div>
            <div v-else :style="{height: queueStore.queue.length > 0 ? '35vh' : '45vh'}">
                <div v-for="(song, index) in songs" :key="index" @click="play(song)" @mouseover="hoveredIndex = index" @mouseleave="hoveredIndex = null">
                    <div style="position: relative; height: 85%; width: 100%; overflow: hidden; border-radius: 15px ;">
                        <img class="thumbnail" :src="song.thumbnails.high.url" alt="">
                        <div class="hplay">
                             <v-btn class="hbtn" v-if="hoveredIndex == index || queueStore.queue[queueStore.isPlayingIndex]?.id == song.id" icon style="height: 100%; width: 100%; background-color: rgb(0,0,0,0.7);">
                                <v-icon @click.stop="togglePlayPause(song)" :color="'#fff'">{{queueStore.queue[queueStore.isPlayingIndex]?.id == song.id && queueStore.isPlaying ? 'mdi-pause' : 'mdi-play'}}</v-icon>
                            </v-btn>
                        </div>
                    </div>
                    <p class="ellipse">{{ (song.title).split("|")[0] }}</p>
                </div>
            </div>            
        </Transition>
    </div>
</template>
<script>
import { useQueueStore } from '../stores/queue';
import { EventBus } from '../eventBus';

export default {
    name: "homeComponent",
    setup() {
        const queueStore = useQueueStore();
        return {queueStore};
    },
    data(){
        return{
            genres: ['Romance', 'Workout', 'Feel good', 'Party', 'Relax', 'Energize', 'commute', 'sleep', 'sad', 'Focus'],
            selectedGenre: '',
            songs: [],
            isLoading: false,
            hoveredIndex: null,
        }
    },
    methods:{
        searchGenreSong(query){
            if (!query || !query.length) {
                query = 'trending in';
            }
            this.isLoading = true;
            fetch(`https://api-dqfspola6q-uc.a.run.app/music/getQueue?query=${query} india`).then(
                async(res) => {
                    this.isLoading = false;
                    res = await res.json();
                    this.songs = res;
                    console.log(this.songs);
                }
            )
            .catch((err) => {
                console.log(err);
                this.isLoading = false;
                this.toast.error('Something went wrong while getting results')
            });
        },
        play(track){
            if(this.queueStore.queue[this.queueStore.isPlayingIndex]?.id !== track.id){
                EventBus.emit('play_track', track);
            }
        },
        togglePlayPause(track){
            if(!this.queueStore.queue.length || this.queueStore.queue[this.queueStore.isPlayingIndex]?.id !== track.id){
                EventBus.emit('play_track', track);
                return;
            }
            if(this.queueStore.isPlaying){
                EventBus.emit('pause');
            } else {
                EventBus.emit('play');
            }
        }
    },
    mounted(){
        this.searchGenreSong(this.selectedGenre);
    },
    watch: {
        selectedGenre(newVal) {
            this.searchGenreSong(newVal);
        },
    },
}
</script>

<style scoped>
.cont{
    /* border: 1px solid; */
    height: 100%;
    width: 100%;
}

::-webkit-scrollbar {
  background-color: transparent; /* make track transparent too */
  height: 7px;
}

::-webkit-scrollbar-track-piece {
    background-color: #ffffff1a;
}

::-webkit-scrollbar-thumb{
    background-color: #ffffff1a;
    border-radius: 10px;
}

.cont>div:nth-child(1){
    width: 100%;
    height: 7vh;
    /* border: 1px solid red; */
    white-space: nowrap;
    overflow-x: auto;
}

.cont>div:nth-child(1)>div{
    /* border: 1px solid white; */
    display: inline-block;
    margin: 0.5vw;
    border-radius: 5px;
    background-color: #ffffff1a;
    color: white;
    padding: 0.2vw 0.5vw;
    cursor: pointer;
}

.selectedGenre{
    background-color: #ffffff !important;
    color: black !important;
}

.cont>div:nth-child(1)>div>p{
    font-size: 90%;
}

.cont>div:nth-child(2){
    width: 100%;
    /* height: 45vh; */
    margin-top: 1%;
    /* border: 1px solid red; */
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 3vh;
    overflow-y: auto;
    scrollbar-width: none;
}

.cont>div:nth-child(2)::-webkit-scrollbar {
    display: none; /* Hide scrollbar */
}

.cont>div:nth-child(2)>div{
    /* border: 1px solid white; */
    width: 100%;
    aspect-ratio: 1 / 1.15;
    cursor: pointer;
}

.cont>div:nth-child(2)>div>div>img{
    filter: saturate(0.8) contrast(0.8);
}

.thumbnail{
  position: absolute; /* Position the image absolutely */
  top: 50%; /* Align the image to the vertical center */
  left: 50%; /* Align the image to the horizontal center */
  transform: translate(-50%, -50%); /* Center the image properly */
  height: 135%; /* Set the height to fill the div */
  width: 180%; /* Set the width to fill the div */
  object-fit: cover;
  z-index: 1;
}

.fadeimg{
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%);
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 15%);
}

.ellipse {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    font-size:70%;
    /* color: white; */
    width: 15vh;
    text-align: center;
    margin: auto;
}

.hplay{
    position: absolute;
    height: 5vh;
    width: 5vh;
    right: 0;
    bottom: 0;
    margin-bottom: 3%;
    margin-right: 3%;
    z-index: 1;
}

.hplay:hover{
    transform: scale(1.1);
    transition: all 0.05s;
}

.hbtn:hover{
    background-color: black !important;
}

.fadeFaster-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-leave-to {
  opacity: 0;
}
.fadeFaster-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>