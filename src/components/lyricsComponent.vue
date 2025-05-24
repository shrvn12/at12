<template>
    <div>
    <transition name="slideRight">
        <div
            v-if="lyricsStore.isLyricsVisible && queueStore.queue[queueStore.isPlayingIndex]?.lyrics"
            ref="queueContainer"
            style="position: absolute; right: 0; width: 20%; height: 100vh; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;"
        >
            <v-container>
            <div
                style="position: relative; height: 100%; transition: transform 0.5s ease;"
            >
                <v-list dense style="background-color: transparent; margin: 0; padding: 0;">
                <v-list-item
                    v-for="(line, index) in queueStore.queue[queueStore.isPlayingIndex]?.lyrics"
                    :key="index"
                    :style="{
                    display: 'flex',
                    alignItems: 'center',
                    'text-align': 'center',
                    color: 'white',
                    }"
                >
                    <v-list-item-content>
                    <v-list-item-title>{{ line }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                </v-list>
            </div>
            </v-container>
        </div>
    </transition>
    </div>
</template>

<script>
// import { EventBus } from '@/eventBus';
import { useQueueStore } from '../stores/queue';
import { useLyricsStore} from '../stores/lyrics';
export default {
    name: "queueComponent",
    setup(){
        const queueStore = useQueueStore();
        const lyricsStore = useLyricsStore();
        return { queueStore, lyricsStore };
    },
}
</script>