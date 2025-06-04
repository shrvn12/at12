<template>
  <div
    ref="queueContainer"
    style="position: absolute; width: 20%; height: 100vh; overflow-y: auto; scrollbar-width: none; border: 0px solid; -ms-overflow-style: none; z-index: 1;"
  >
    <v-container>
      <div
        style="position: relative; height: 100%; transition: transform 0.5s ease;"
      >
        <v-list default style="background-color: transparent; margin: 0; padding: 0;">
          <v-list-item
            v-for="(song, index) in queueStore.queue"
            @mouseover="() => {hoveredIndex = index}"
            @mouseleave="() => {hoveredIndex = null}"
            :key="index"
            :style="{
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              'text-align': 'left',
              'border-bottom': index === queueStore.isPlayingIndex ? '1px solid #fc2c55' : 'none',
              color: index === queueStore.isPlayingIndex ? 'white' : 'grey',
              position: 'relative', /* Position delete icon absolutely inside each item */
              backgroundColor: index == hoveredIndex ? '#d3d3d317': 'transparent',
            }"
            @click="play(song, index)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ song.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ song.channel || song.channelTitle }}</v-list-item-subtitle>
            </v-list-item-content>

              <v-icon
                v-if="queueStore.isPlayingIndex < index"
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
</template>
<script>
import { EventBus } from '@/eventBus';
import { useQueueStore } from '../stores/queue';
export default {
    name: "queueComponent",
    setup(){
        const queueStore = useQueueStore();
        return { queueStore };
    },
    data(){
        return{
            hoveredIndex: null
        }
    },
    methods: {
      deleteFromQueue(index){
          if (index && index > this.queueStore.isPlayingIndex) {
              this.queueStore.queue.splice(index, 1);
          }
      },
      play(track, index){
        this.queueStore.isPlayingIndex = index;
          EventBus.emit('onlyPlay', track);
          this.$router.replace(`/playing/${track.id}`);
          this.scrollToCurrentSong()
      },
      scrollToCurrentSong() {
        const queueContainer = this.$refs.queueContainer;

        if (!queueContainer || this.queueStore.isPlayingIndex === undefined) return;
        // Get the current song element
        const currentSongElement = queueContainer.querySelectorAll(".v-list-item")[this.queueStore.isPlayingIndex];
        if (!currentSongElement) return;

        // Calculate the scroll position to center the current song
        const containerHeight = queueContainer.clientHeight;
        const songOffsetTop = currentSongElement.offsetTop; // Get the top position of the current song relative to the container
        const songHeight = currentSongElement.offsetHeight || 70; // Fallback to 70px if height is unavailable

        // Center the song in the viewport
        const scrollPosition = songOffsetTop - containerHeight / 2 + songHeight + 200;

        queueContainer.scrollTo({
          top: Math.max(scrollPosition, 0), // Prevent negative scroll values
          behavior: "smooth",
        });
      },
    },
    mounted(){
      setTimeout(() => {
        this.scrollToCurrentSong();
      }, 300)
    },
    watch: {
      'queueStore.isPlayingIndex'(val) {
        if (val !== undefined) {
          this.scrollToCurrentSong();
        }
      }
    }
}
</script>