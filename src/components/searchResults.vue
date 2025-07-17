<template>
    <div class="cont"  :style="{height: queueStore.queue.length? '42vh' : '100%'}">
        <div style="width: 100%; display: flex;">
            <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!isLoading" style="border: 0px solid violet; overflow-y: scroll; scrollbar-width: none; padding-bottom: 3%;" >
                <div class="firstresult" v-if="searchRes.length" style="border: 1px solid transparent; width: 70%; margin-left: 4%; margin-bottom: 3%; border-radius: 10px; background-color: #d3d3d317; display: flex; justify-content: left; cursor: pointer; transition: 0.25s;" @click="play(searchRes[0])">
                    <div style="width: 25%;">
                        <img style="width: 100%; aspect-ratio: 1/1; margin: 10%; display: block; border-radius: 10px;" :src="searchRes.length && searchRes[0].thumbnails[1].url" alt="">
                    </div>
                    <div style="width: 60%; margin-left: 10%;">
                        <p :class="this.queue.queue[this.queue.isPlayingIndex]?.id == searchRes[0].videoId ? 'highlight' : 'info'" v-if="searchRes.length" style="font-size: 200%; font-weight: bold; text-align: left;">{{ searchRes[0].name }}</p>
                        <p v-if="searchRes.length" style="color: white; font-size: 100%; text-align: left; width: min-content; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" @click.stop="$router.push(`/artist/${searchRes[0].artist.artistId}`)">{{ searchRes[0].artist.name }}</p>
                        <br>
                        <div style="height: 5vh;">
                            <MusicBar v-if="this.queue.queue[this.queue.isPlayingIndex]?.id == searchRes[0].videoId && !this.queueStore.isLoading"></MusicBar>
                        </div>

                    </div>
                    <div style="width: 15%; margin-left: auto; display: flex; justify-content: right;">
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
                                v-for="(item, index) in ['Add to queue', 'Play next']"
                                :key="index"
                                :value="index"
                                theme="dark"
                                >
                                <v-list-item-title v-if="!(item == 'Play next' && this.queue.queue[this.queue.isPlayingIndex]?.id == searchRes[0].videoId)" @click="menuFunction(item, searchRes[0])">{{ item }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </div>
                <div class="listItem" v-for="(track, index) in searchRes.slice(1)" :key="index" style="display: flex; border: 0px solid white; width: 100%; cursor: pointer;" @click="play(track)">
                    <div class="thumb_cont">
                        <div class="img-cont">
                            <img class="thumbnail" :src="track.thumbnails[0].url" alt="">
                        </div>
                    </div>
                    <div class="info" style="width: 85%; border: 0px solid pink; display: flex; align-items: center; justify-content: space-between;">
                        <div style="text-align: left; width: 70%; border: 0px solid white;">
                            <p :class="this.queue.queue[this.queue.isPlayingIndex]?.id == track.videoId ? 'highlight' : ''" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">{{track.name}}</p>
                            <p onmouseover="this.style.color = '#fff'" onmouseleave="this.style.color = 'grey'" style="color: grey; font-size: small; transition: 0.2s;width: min-content; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" @click.stop="$router.push(`/artist/${track.artist.artistId}`)">{{ track.artist.name }}</p>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <MusicBar v-if="this.queue.queue[this.queue.isPlayingIndex]?.id == track.videoId && !this.queueStore.isLoading"></MusicBar>
                            <p style="color: white; font-size: small; transition: 0.2s; margin-left: 2vw;">{{ Math.floor(track.duration / 60) }}:{{ String(Math.ceil(track.duration % 60))}}</p>
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn
                                        v-bind="props"
                                        color="white-lighten-2"
                                        icon="mdi-dots-vertical"
                                        variant="text"
                                    ></v-btn>
                                </template>
                                <v-list theme="dark">
                                    <v-list-item
                                    v-for="(item, index) in ['Add to queue', 'Play next']"
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
                <div v-if="artists.length">
                    <div>
                        <p style="text-align: left; color: white; font-weight: bold; font-size: larger; margin-top: 2%;">Artists</p>
                    </div>
                    <div style="overflow-x: auto; overflow-y: hidden; width: 100%; display: flex; border: 0px solid white; gap: 10px; padding: 10px;">
                        <div
                        v-for="(artist, index) in artists"
                        :key="index"
                        style="flex: 0 0 auto; width: 10vw; aspect-ratio: 1 / 1;"
                        @click="$router.push(`/artist/${artist.id}`)"
                        >
                        <div style="position: relative; height: 100%; width: 100%; overflow: hidden; border-radius: 15px; cursor: pointer;">
                            <img
                            class="thumbnail"
                            :src="artist.thumbnails && artist.thumbnails[1]?.url"
                            alt=""
                            style="width: 100%; height: 100%; object-fit: cover;"
                            >
                        </div>
                        <p style="color: white;">{{ artist.name}}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <v-skeleton-loader v-for="n in 5" :key="n" type="list-item-avatar" color="#80808027" style="margin-top: 1.5%;"></v-skeleton-loader>
            </div>        
        </transition>
    </div>


</template>
<script>
import { useToast } from 'vue-toastification';
import { EventBus } from '@/eventBus';
import { usesearchResultsStore } from '../stores/searchResults';
import { useQueueStore } from '../stores/queue';
import MusicBar from './musicBar.vue';
export default {
    name: 'searchResults',
    setup() {
        const resultsStore = usesearchResultsStore();
        const queueStore = useQueueStore();
        return {resultsStore, queueStore};
    },
    components: {
        MusicBar,
    },
    data() {
        return {
            toast: useToast(),
            isLoading: false,
            searchRes: [],
            artists: [],
            querySearched: null,
        }
    },
    deactivated(){
        EventBus.emit('searchQuery', null);
    },
    computed: {
        searchQuery() {
            return this.$route.query.q;
        },
        queue() {
            return useQueueStore();
        },
    },
    unmounted() {
        EventBus.emit('searchQuery', null);
    },
    activated() {
        EventBus.emit('searchQuery', this.searchQuery);
    },
    methods: {
        play(track){
            track.id = track.videoId; // Ensure track has an id for consistency
            track.title = track.name; // Ensure track has a title for consistency
            this.queue.emptyQueue();
            this.queue.play();
            this.queue.isPlayingIndex = 0;
            EventBus.emit('play_track', track);
        },
        searchSong(query){
            if (!query) return
            this.querySearched = this.searchQuery;
            this.isLoading = true;
            fetch(`https://api-dqfspola6q-uc.a.run.app/music/searchSong?query=${query}`).then(
                async(res) => {
                    this.isLoading = false;
                    res = await res.json();
                    this.searchRes = res;
                }
            )
            .catch((err) => {
                console.log(err);
                this.isLoading = false;
                this.toast.error('Something went wrong while getting results')
            });

            fetch(`https://api-dqfspola6q-uc.a.run.app/music/search/artist?q=${query}`).then(
                async(res) => {
                    res = await res.json();
                    this.artists = res;
                }
            ).catch((err) => {
                console.log(err);
            });
        },
        goBack() {
            if(window.history.state && window.history.state.back){
                this.$router.back();
            } else{
                this.$router.push({ name: 'home' });
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
                 // Remove existing occurrences of this track from queue
                this.queueStore.queue = this.queueStore.queue.filter(q => q.id !== track.id);

                // Insert the track just after the currently playing one
                const playIndex = this.queueStore.currentIndex ?? 0;
                this.queueStore.queue.splice(playIndex + 1, 0, track);

                this.toast.success('Added to play next');
            }
        },
    },
    mounted() {
        if (this.searchQuery) {
            EventBus.emit('searchQuery', this.searchQuery);
            this.searchSong(this.searchQuery);
        }
    },
    watch: {
        searchQuery(newQuery) {
            if (newQuery === this.querySearched) return; // Avoid duplicate searches
            if (newQuery) {
                this.searchSong(newQuery);
                EventBus.emit('searchQuery', this.searchQuery);
            }
        }
    },
}
</script>

<style scoped>
.cont{
    -ms-overflow-style: none;
    overflow-y: scroll;
    scrollbar-width: none;
}
.cont::-webkit-scrollbar {
    display: none;
}
.img-cont {
    height: 50px;
    width: 50px;
    overflow: hidden;
    position: relative;
    border-radius: 5px;
}

.thumbnail{
  position: absolute; /* Position the image absolutely */
  top: 50%; /* Align the image to the vertical center */
  left: 50%; /* Align the image to the horizontal center */
  transform: translate(-50%, -50%); /* Center the image properly */
  width: 100%; /* Set the width to fill the div */
  aspect-ratio: 1/1;
  object-fit:contain;
}

.highlight {
    color: #fc2c55;
}

.info{
    color : white;
}

.test{
    color: #80808027;
}

.thumb_cont{
    width: 15%;
    height:10vh;
    border: 0px solid pink;
    display: flex;
    justify-content: center;
    align-items: center;
}

.listItem:hover {
  background-color: #d3d3d317;
}

@media (max-width: 675px) {
    .thumb_cont {
        height: auto;
        margin-top: 2%;
    }
}
</style>
