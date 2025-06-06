<template>
    <div class="cont"  style="height: 100%;">
        <div style="width: 100%; display: flex;">
            <v-icon style="cursor: pointer;" color="#ffffff" @click="goBack()">mdi-arrow-left</v-icon>
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!isLoading" style="border: 0px solid violet; overflow-y: scroll;" >
                <div v-for="(track, index) in searchRes" :key="index" style="display: flex; border: 0px solid white; width: 100%; cursor: pointer;" @click="play(track)">
                    <div class="thumb_cont">
                        <div class="img-cont">
                            <img class="thumbnail" :src="track.thumbnails.high.url" alt="">
                        </div>
                    </div>
                    <div class="info" style="width: 85%; border: 0px solid pink; display: flex; align-items: center;">
                        <div style="text-align: left; max-width: 100%;">
                            <p :class="this.queue.queue[this.queue.isPlayingIndex]?.id == track.id ? 'highlight' : ''" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 20vw;">{{track.title}}</p>
                            <p style="color: grey; font-size: small;">{{ track.artist.name }}</p>
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

export default {
    name: 'searchResults',
    setup() {
        const resultsStore = usesearchResultsStore();
        const queueStore = useQueueStore();
        return {resultsStore, queueStore};
    },
    data() {
        return {
            toast: useToast(),
            isLoading: false,
            searchRes: [],
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
            this.queue.emptyQueue();
            this.queue.play();
            this.queue.isPlayingIndex = 0;
            EventBus.emit('play_track', track);
        },
        searchSong(query){
            if (!query) return
            this.isLoading = true;
            fetch(`https://api-dqfspola6q-uc.a.run.app/music/getQueue?query=${query}`).then(
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
        },
        goBack() {
            if(window.history.state && window.history.state.back){
                this.$router.back();
            } else{
                this.$router.push({ name: 'home' });
            }
        },
    },
    mounted() {
        if (this.searchQuery) {
            EventBus.emit('searchQuery', this.searchQuery);
            this.searchSong(this.searchQuery);
        }
        EventBus.on('loading_search', (isLoading) => {
            this.isLoading = isLoading;
        });
    },
    watch: {
        searchQuery(newQuery) {
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
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow-y: scroll;
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
  height: 135%; /* Set the height to fill the div */
  width: 100%; /* Set the width to fill the div */
  object-fit: cover;
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

@media (max-width: 675px) {
    .thumb_cont {
        height: auto;
        margin-top: 2%;
    }
}
</style>
