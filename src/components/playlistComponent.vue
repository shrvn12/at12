<template>
    <div class="cont">
        <div style="width: 100%; display: flex;">
            <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
        </div>
        <div style="border: 0px solid green; display: flex;">
            <div class="faded" style="width: 50%;">
            <img style="width: 100%; display: block;" :src="metaData?.snippet?.thumbnails && metaData?.snippet?.thumbnails.standard?.url" alt="">
            </div>
            <div style="width: 50%; margin-left: 5%;">
            <p style=" text-align: left; border: 0px solid white; font-size: 250%; font-weight: bold; color: white;">{{ metaData.snippet?.title || metaData.snippet?.localized?.title }}</p>
            <p v-if="songs.length" style=" text-align: left; border: 0px solid white; font-size: 100%; font-weight: 300; color: white;">
                <v-icon color="#fff">mdi-music-circle-outline</v-icon>
                {{ songs.length }} Songs</p>
            <span v-if="metaData.snippet?.description?.length || metaData.snippet?.localized?.description?.length">
                <p v-if="fulldesc" style="color: white; font-size: small; text-align: left;  margin-top: 3%;">{{ metaData.snippet?.description || metaData.snippet?.localized?.description}}</p>
                <p v-else style="color: white; font-size: small; text-align: left;  margin-top: 3%;">
                    {{ metaData.snippet?.localized?.description?.substring(0, 200) || metaData.snippet?.description?.substring(0, 200) }}...
                </p> 
            </span>

            <p v-if="metaData.snippet?.description?.length || metaData.snippet?.localized?.description?.length" style="color: #fc2c55; cursor: pointer; text-align: left; width: min-content;  font-size: small;" @click="fulldesc = !fulldesc">{{fulldesc? 'Less' : 'More'}}</p>
            <p v-if="songs.length" style=" text-align: left; border: 0px solid white; font-size: 100%; font-weight: 300; color: white; margin-top: 5%; margin-left: -1vw;">
                <v-icon v-if="this.queueStore.isPlaying && this.queueStore.playlist == playlistId" color="#fff" size="10vh" style="cursor: pointer;" @click="pause()">mdi-pause-circle-outline</v-icon>
                <v-icon v-else color="#fff" size="10vh" style="cursor: pointer;" @click="startPlaylist()">mdi-play-circle-outline</v-icon>
            </p>
            </div>
        </div>
        <div style="margin-top: 3%;">
        <div class="listItem" v-for="(track, index) in songs" :key="index" style="display: flex; align-items: center; border: 0px solid white; width: 100%; cursor: pointer;" @click="play(track, index)">
            <p style="color: white; font-weight: bold; margin-left: 1%;">{{ index+1 }}.</p>
                <div class="thumb_cont" style="border: 0px solid white;">
                    <div class="img-cont">
                        <img class="thumbnail" :src="track.snippet?.thumbnails && track.snippet?.thumbnails?.medium?.url" alt="">
                    </div>
                </div>
                <div class="info" style="width: 70%; border: 0px solid pink; display: flex; align-items: center;">
                    <div style="text-align: left; max-width: 100%;">
                        <p :class="this.queueStore.queue[this.queueStore.isPlayingIndex]?.id == track.snippet?.resourceId.videoId ? 'highlight' : 'info'" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">{{track.snippet?.title}}</p>
                        <p style="color: grey; font-size: small;">{{ track.snippet?.videoOwnerChannelTitle }}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; justify-content: right; width: 15%;">
                    <MusicBar v-if="this.queueStore.queue[this.queueStore.isPlayingIndex]?.id == track.snippet?.resourceId.videoId && !this.queueStore.isLoading"></MusicBar>
                    <v-menu>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="white"
                                icon="mdi-dots-vertical"
                                variant="text"
                            ></v-btn>
                        </template>
                        <v-list theme="dark">
                            <v-list-item
                            v-for="(item, index) in ['Add to playing queue', 'Play next']"
                            size="small"
                            :key="index"
                            :value="index"
                            theme="dark"
                            >
                            <v-list-item-title @click="menuFunction(item, track)">{{ item }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import { useQueueStore } from '../stores/queue';
import { EventBus } from '@/eventBus';
import MusicBar from './musicBar.vue';

export default {
    name: 'playlistComponent',
    computed:{
        playlistId(){
            return this.$route.params.playlistId;
        }
    },
    setup(){
        const queueStore = useQueueStore();
        return { queueStore };
    },
    components:{
        MusicBar
    },
    activated(){
        if (this.searchedPLaylist != this.playlistId){
            this.metaData = {};
            this.songs = [];
            this.fetchPlaylist(this.playlistId);
        }
    },
    data (){
        return {
            searchedPLaylist: null,
            toast: useToast(),
            songs: [],
            metaData: {},
            fulldesc: false,
        }
    },
    methods:{
        goBack() {
            if(window.history.state && window.history.state.back){
                this.$router.back();
            } else{
                this.$router.push({ name: 'home' });
            }
        },
        async fetchPlaylist(id){
            try {
                const res = await fetch(`https://api-dqfspola6q-uc.a.run.app/music/playlist/${id}`);
                this.searchedPLaylist = id;
                const data = await res.json();
                this.songs = data.items.items;
                this.metaData = data.metaData.items[0];
            } catch (error) {
                console.error(error);
                this.toast.error('Error fetching playlist');
            }
        },
        play(track, index) {
            track.id = track.snippet?.resourceId.videoId;
            track.title = track.snippet?.title;
            track.channel = track.snippet?.videoOwnerChannelTitle;
            EventBus.emit('play_playlist', [track, index, this.songs, this.metaData?.id]);
        },
        pause(){
            EventBus.emit('pause');
        },
        startPlaylist(){
            if (this.queueStore.playlist == this.playlistId){
                EventBus.emit('play');
                return;
            } else{
                this.play(this.songs[0], 0)
            }
        },
         menuFunction(item, track) {
            if (!track) return;
            if (!this.queueStore.queue.length){
                this.toast.warning(`Play a song first to ${item.toLowerCase()}`);
                return;
            }
            track.id = track.videoId; // Ensure track has an id for consistency
            track.title = track.name; // Ensure track has a title for consistency
            if (item === 'Add to queue') {
                this.queueStore.queue.push(track);
                this.toast.success('Added to queue');
            } else if (item === 'Play next') {
            let next = track;
                for (let i = this.queueStore.isPlayingIndex+1; i < this.queueStore.queue.length; i++) {
                let temp = this.queueStore.queue[i];
                this.queueStore.queue[i] = next;
                next = temp;
                }
                this.queueStore.queue.push(next);
                this.toast.success('Added to play next');
            }
        },
    },
    mounted(){
        this.fetchPlaylist(this.playlistId);
    }
}
</script>

<style scoped>
.cont{
    border: 0px solid white;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    scrollbar-width: none;
}

.faded{
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
}

.thumb_cont{
    width: 10%;
    height:10vh;
    border: 0px solid pink;
    display: flex;
    justify-content: center;
    align-items: center;
}

.img-cont {
    height: 50px;
    width: 50px;
    overflow: hidden;
    position: relative;
    border-radius: 5px;
    margin-left: 10%;
}

.thumbnail{
  position: absolute; /* Position the image absolutely */
  top: 50%; /* Align the image to the vertical center */
  left: 50%; /* Align the image to the horizontal center */
  transform: translate(-50%, -50%); /* Center the image properly */
  height: 135%; /* Set the height to fill the div */
  width: 100%; /* Set the width to fill the div */
  object-fit: contain;
  display: block;
}

.listItem:hover {
  background-color: #d3d3d317;
}

.highlight {
    color: #fc2c55;
}

.info{
    color : white;
}
</style>